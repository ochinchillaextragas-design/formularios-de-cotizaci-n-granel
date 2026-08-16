import { describe, expect, it } from 'vitest'
import { isPristineMaterialRow, isValidEmail, PRISTINE_ROW, validateForPrint } from './quotationValidation'
import { defaultConditions } from '../data/catalog'
import type { Material, Quotation } from '../types/quotation'

const valida = (patch: Partial<Quotation> = {}): Quotation => ({
  number: '001-2026',
  date: '2026-08-15',
  customer: {
    name: 'Frigorífico Supremo',
    taxId: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    province: '',
  },
  installation: {
    category: 'industrial',
    type: '',
    estimatedConsumption: 0,
    tankCapacity: '4000',
    tankLocation: '',
    notes: '',
  },
  materials: [{ id: 'a', description: 'Tanque', quantity: 1, unit: 'u', unitPrice: 100 }],
  laborHours: 8,
  hourlyRate: 8500,
  conditions: defaultConditions,
  ...patch,
})

const campos = (quote: Quotation) => validateForPrint(quote).map(i => i.field)

describe('validateForPrint', () => {
  it('no bloquea una cotización completa', () => {
    expect(validateForPrint(valida())).toHaveLength(0)
  })

  it('exige número de cotización', () => {
    expect(campos(valida({ number: '   ' }))).toContain('Número')
  })

  it('exige fecha', () => {
    expect(campos(valida({ date: '' }))).toContain('Fecha')
  })

  it('exige nombre del cliente', () => {
    const quote = valida()
    expect(campos({ ...quote, customer: { ...quote.customer, name: '' } })).toContain('Cliente')
  })

  it('exige tanque seleccionado', () => {
    const quote = valida()
    expect(campos({ ...quote, installation: { ...quote.installation, tankCapacity: '' } })).toContain('Tanque')
  })

  it('acepta email vacío pero rechaza uno mal formado', () => {
    const quote = valida()
    expect(campos({ ...quote, customer: { ...quote.customer, email: '' } })).not.toContain('Email')
    expect(campos({ ...quote, customer: { ...quote.customer, email: 'pepe@' } })).toContain('Email')
    expect(campos({ ...quote, customer: { ...quote.customer, email: 'pepe@extragas.com.ar' } })).not.toContain('Email')
  })

  it('exige cantidad mínima de 1 en materiales cargados', () => {
    const quote = valida()
    const conCero = { ...quote, materials: [{ ...quote.materials[0], quantity: 0 }] }
    expect(campos(conCero)).toContain('Material 1')
  })

  it('ignora una fila verdaderamente intacta', () => {
    const quote = valida()
    const conIntacta = {
      ...quote,
      materials: [...quote.materials, { id: 'b', ...PRISTINE_ROW }],
    }
    expect(validateForPrint(conIntacta)).toHaveLength(0)
  })

  it('rechaza importes, horas y consumo negativos', () => {
    const quote = valida()
    expect(campos({ ...quote, laborHours: -1 })).toContain('Mano de obra')
    expect(campos({ ...quote, hourlyRate: -1 })).toContain('Mano de obra')
    expect(campos({ ...quote, installation: { ...quote.installation, estimatedConsumption: -5 } })).toContain('Consumo')
    expect(campos({ ...quote, materials: [{ ...quote.materials[0], unitPrice: -10 }] })).toContain('Material 1')
  })

  it('acumula todos los problemas en vez de frenar en el primero', () => {
    const quote = valida({ number: '', date: '' })
    expect(validateForPrint(quote).length).toBeGreaterThanOrEqual(2)
  })
})

describe('fila de material intacta', () => {
  // `PRISTINE_ROW` es `as const`, así que sus tipos son literales; el parche se
  // tipa contra `Material` para poder probar otros valores.
  const fila = (patch: Partial<Material>): Material => ({ id: 'x', ...PRISTINE_ROW, ...patch })

  it('reconoce como intacta sólo la combinación inicial completa', () => {
    expect(isPristineMaterialRow(fila({}))).toBe(true)
    expect(isPristineMaterialRow(fila({ unitPrice: 5000 }))).toBe(false)
    expect(isPristineMaterialRow(fila({ quantity: 3 }))).toBe(false)
    expect(isPristineMaterialRow(fila({ unit: 'kit' }))).toBe(false)
    expect(isPristineMaterialRow(fila({ description: 'Tanque' }))).toBe(false)
  })

  // El caso que motivó el cambio: sin descripción pero con precio, la fila
  // sumaba al total y se imprimía sin decir qué era.
  it('exige descripción cuando la fila tiene precio cargado', () => {
    const quote = valida({ materials: [fila({ unitPrice: 250000 })] })
    expect(campos(quote)).toContain('Material 1')
    expect(validateForPrint(quote)[0].message).toMatch(/descripción/i)
  })

  it('exige descripción cuando se modificó la cantidad', () => {
    expect(campos(valida({ materials: [fila({ quantity: 4 })] }))).toContain('Material 1')
  })

  it('exige descripción cuando se modificó la unidad', () => {
    expect(campos(valida({ materials: [fila({ unit: 'rollo' })] }))).toContain('Material 1')
  })

  it('no reclama nada por una fila intacta', () => {
    expect(validateForPrint(valida({ materials: [fila({})] }))).toHaveLength(0)
  })
})

describe('números no finitos', () => {
  const conMaterial = (patch: Partial<{ quantity: number; unitPrice: number }>) =>
    valida({ materials: [{ id: 'a', description: 'Tanque', quantity: 1, unitPrice: 100, unit: 'u', ...patch }] })

  it('rechaza NaN en cantidad y precio', () => {
    expect(campos(conMaterial({ quantity: Number.NaN }))).toContain('Material 1')
    expect(campos(conMaterial({ unitPrice: Number.NaN }))).toContain('Material 1')
  })

  it('rechaza Infinity y -Infinity en cantidad y precio', () => {
    expect(campos(conMaterial({ quantity: Number.POSITIVE_INFINITY }))).toContain('Material 1')
    expect(campos(conMaterial({ unitPrice: Number.POSITIVE_INFINITY }))).toContain('Material 1')
    expect(campos(conMaterial({ unitPrice: Number.NEGATIVE_INFINITY }))).toContain('Material 1')
  })

  it('rechaza horas, costo por hora y consumo no finitos', () => {
    expect(campos(valida({ laborHours: Number.NaN }))).toContain('Mano de obra')
    expect(campos(valida({ hourlyRate: Number.POSITIVE_INFINITY }))).toContain('Mano de obra')
    const quote = valida()
    expect(
      campos({ ...quote, installation: { ...quote.installation, estimatedConsumption: Number.NaN } }),
    ).toContain('Consumo')
  })
})

describe('isValidEmail', () => {
  it('acepta direcciones normales', () => {
    expect(isValidEmail('granel@extragas.com.ar')).toBe(true)
  })

  it('rechaza las incompletas', () => {
    expect(isValidEmail('granel@')).toBe(false)
    expect(isValidEmail('granel')).toBe(false)
    expect(isValidEmail('a@b.c')).toBe(false)
  })
})

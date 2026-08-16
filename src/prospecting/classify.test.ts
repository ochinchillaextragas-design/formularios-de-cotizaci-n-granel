import { describe, expect, it } from 'vitest'
import { classify, normalize } from './classify'
import { INDUSTRIES, industryByKey } from './taxonomy'
import type { Industry, RawElement } from './types'

const element = (tags: Record<string, string>): RawElement => ({
  providerId: 'openstreetmap',
  externalId: 'node/1',
  name: tags.name ?? 'Sin nombre',
  latitude: -35.05,
  longitude: -58.76,
  tags,
})

const only = (...keys: string[]): Industry[] =>
  keys.map(k => industryByKey(k as Industry['key'])).filter((i): i is Industry => i !== undefined)

describe('normalize', () => {
  it('quita acentos y pasa a minúsculas', () => {
    expect(normalize('Lácteos MAYOL')).toBe('lacteos mayol')
  })

  it('normaliza la eñe sin romper la palabra', () => {
    expect(normalize('Cabaña')).toBe('cabana')
  })
})

describe('classify', () => {
  it('asigna panadería por selector específico sin depender del nombre', () => {
    const result = classify(element({ name: 'El Molino', shop: 'bakery' }), INDUSTRIES)
    expect(result?.industry).toBe('gastronomia_panaderia')
  })

  it('usa la palabra clave para elegir el rubro sobre una etiqueta genérica', () => {
    const result = classify(
      element({ name: 'Secadero San José', landuse: 'industrial' }),
      only('secaderos', 'industria_pesada'),
    )
    expect(result?.industry).toBe('secaderos')
  })

  it('cae en industria pesada cuando sólo hay evidencia genérica', () => {
    const result = classify(
      element({ name: 'Mascardi', landuse: 'industrial' }),
      only('secaderos', 'calderas', 'industria_pesada'),
    )
    expect(result?.industry).toBe('industria_pesada')
  })

  it('cae en agro cuando la evidencia genérica es rural', () => {
    const result = classify(element({ name: 'La Esperanza', landuse: 'farmyard' }), INDUSTRIES)
    expect(result?.industry).toBe('agro')
  })

  it('descarta lo que no tiene ninguna señal en vez de forzar un rubro', () => {
    expect(classify(element({ name: 'Plaza Central', leisure: 'park' }), INDUSTRIES)).toBeNull()
  })

  it('no clasifica en un rubro que el usuario no seleccionó', () => {
    const result = classify(element({ name: 'Panadería La Nueva', shop: 'bakery' }), only('hoteleria'))
    expect(result).toBeNull()
  })

  it('da más confianza cuando coinciden selector y palabra clave', () => {
    const conSenal = classify(element({ name: 'Frigorífico Avícola', industrial: 'slaughterhouse' }), INDUSTRIES)
    const soloGenerico = classify(element({ name: 'Mascardi', landuse: 'industrial' }), INDUSTRIES)
    expect(conSenal?.confidence).toBeGreaterThan(soloGenerico?.confidence ?? 0)
  })
})

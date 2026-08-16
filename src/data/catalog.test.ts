import { describe, expect, it } from 'vitest'
import {
  installationPresets,
  planStatusFor,
  tankByValue,
  tankCapacities,
  tankPlans,
  type TankCapacityValue,
} from './catalog'

const CON_PLANO: readonly TankCapacityValue[] = ['500', '1000', '2000', '4000', '7300']

describe('catálogo de capacidades', () => {
  it('expone exactamente seis capacidades', () => {
    expect(tankCapacities).toHaveLength(6)
    expect(tankCapacities.map(t => t.value)).toEqual(['500', '1000', '2000', '4000', '6000', '7300'])
  })

  it('no ofrece 8.000 L en ninguna forma', () => {
    expect(tankCapacities.some(t => t.liters === 8000)).toBe(false)
    expect(tankCapacities.some(t => t.label.includes('8.000'))).toBe(false)
    const materiales = installationPresets.flatMap(p => p.items).map(i => i.description).join(' ')
    expect(materiales).not.toContain('8000')
  })

  it('cada capacidad trae litros, m³ y descripción comercial', () => {
    for (const tank of tankCapacities) {
      expect(tank.liters).toBeGreaterThan(0)
      expect(tank.cubicMeters).toMatch(/m³/)
      expect(tank.description.length).toBeGreaterThan(30)
    }
  })
})

describe('planos técnicos', () => {
  it('hay plano para 500, 1.000, 2.000, 4.000 y 7.300 L', () => {
    for (const value of CON_PLANO) {
      expect(tankPlans[value], `falta el plano de ${value}`).toBeTruthy()
      expect(planStatusFor(value).kind).toBe('available')
    }
  })

  it('NO hay plano para 6.000 L y su estado es "pendiente"', () => {
    expect(tankPlans['6000']).toBeUndefined()
    expect(planStatusFor('6000')).toEqual({ kind: 'pending' })
  })

  it('cada capacidad apunta a su propio archivo, sin reutilizar el de otra', () => {
    for (const value of CON_PLANO) {
      const asset = tankPlans[value]
      expect(asset, `falta el plano de ${value}`).toBeTruthy()
      // El nombre del archivo lleva la capacidad: descarta cruces entre planos.
      expect(asset).toContain(`plano-tecnico-${value}l`)
    }
    const rutas = CON_PLANO.map(v => tankPlans[v])
    expect(new Set(rutas).size).toBe(CON_PLANO.length)
  })

  it('el plano disponible informa su código de documento', () => {
    const estado = planStatusFor('7300')
    expect(estado.kind).toBe('available')
    if (estado.kind === 'available') {
      expect(estado.documentCode).toBe('EXT-GLP-REF-7300')
    }
  })
})

describe('presets', () => {
  it('son exactamente cuatro y cada uno declara su tanque', () => {
    expect(installationPresets).toHaveLength(4)
    for (const preset of installationPresets) {
      expect(tankByValue(preset.tankCapacity), `tanque inválido en ${preset.id}`).toBeTruthy()
      expect(preset.items.length).toBeGreaterThan(0)
    }
  })

  it('el preset industrial corresponde al tanque de 7.300 L', () => {
    const industrial = installationPresets.find(p => p.name === 'Fábrica - Proceso productivo')
    expect(industrial?.tankCapacity).toBe('7300')
    expect(industrial?.items[0].description).toContain('7300')
  })

  it('el tanque de cada preset es coherente con su primer material', () => {
    for (const preset of installationPresets) {
      const tanque = tankByValue(preset.tankCapacity)
      expect(preset.items[0].description).toContain(String(tanque?.liters))
    }
  })
})

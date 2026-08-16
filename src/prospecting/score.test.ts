import { describe, expect, it } from 'vitest'
import { dataConfidenceOf, priorityFor, scoreProspect } from './score'
import { industryByKey } from './taxonomy'
import type { Classified, Industry, RawElement } from './types'

const industry = (key: string): Industry => {
  const found = industryByKey(key as Industry['key'])
  if (!found) throw new Error(`industria inexistente: ${key}`)
  return found
}

const classified = (tags: Record<string, string>, key: string): Classified => {
  const raw: RawElement = {
    providerId: 'openstreetmap',
    externalId: 'node/1',
    name: tags.name ?? 'Empresa',
    latitude: -35.05,
    longitude: -58.76,
    tags,
  }
  return { raw, industry: industry(key).key, confidence: 80 }
}

describe('priorityFor', () => {
  it('clasifica por umbrales', () => {
    expect(priorityFor(80)).toBe('ALTA')
    expect(priorityFor(50)).toBe('MEDIA')
    expect(priorityFor(20)).toBe('BAJA')
  })
})

describe('scoreProspect', () => {
  it('nunca supera 100 aunque se acumulen señales', () => {
    const item = classified(
      { name: 'Planta', landuse: 'industrial', man_made: 'works', industrial: 'factory', building: 'industrial', operator: 'X', opening_hours: '24/7' },
      'calderas',
    )
    const score = scoreProspect(item, industry('calderas'))
    expect(score.total).toBeLessThanOrEqual(100)
    expect(score.total).toBeGreaterThan(0)
  })

  it('nunca baja de 0 con señales negativas acumuladas', () => {
    const item = classified({ name: 'Café', amenity: 'cafe' }, 'gastronomia_panaderia')
    const score = scoreProspect(item, industry('gastronomia_panaderia'))
    expect(score.total).toBeGreaterThanOrEqual(0)
  })

  it('puntúa más una planta industrial que un local chico del mismo rubro', () => {
    const planta = scoreProspect(
      classified({ name: 'Alimentos SA', man_made: 'works', landuse: 'industrial' }, 'industria_alimenticia'),
      industry('industria_alimenticia'),
    )
    const local = scoreProspect(
      classified({ name: 'Rotisería', amenity: 'fast_food' }, 'industria_alimenticia'),
      industry('industria_alimenticia'),
    )
    expect(planta.total).toBeGreaterThan(local.total)
  })

  it('mantiene la calidad del dato separada del potencial', () => {
    const sinFicha = classified({ name: 'Secadero', man_made: 'works' }, 'secaderos')
    const score = scoreProspect(sinFicha, industry('secaderos'))
    expect(score.total).toBeGreaterThan(50)
    expect(score.dataConfidence).toBe(0)
  })

  it('explica cada punto con un motivo legible', () => {
    const score = scoreProspect(classified({ name: 'Hotel', tourism: 'hotel' }, 'hoteleria'), industry('hoteleria'))
    expect(score.breakdown.length).toBeGreaterThan(0)
    for (const line of score.breakdown) {
      expect(line.reason.length).toBeGreaterThan(0)
      expect(line.category.length).toBeGreaterThan(0)
    }
    const suma = score.breakdown.reduce((t, l) => t + l.points, 0)
    expect(score.total).toBe(Math.max(0, Math.min(100, suma)))
  })
})

describe('dataConfidenceOf', () => {
  it('sube con teléfono, web y dirección', () => {
    expect(dataConfidenceOf({})).toBe(0)
    expect(dataConfidenceOf({ phone: '+54 11' })).toBe(30)
    expect(dataConfidenceOf({ phone: '+54 11', website: 'https://x.ar', 'addr:street': 'Ruta 205' })).toBe(75)
  })

  it('no supera 100', () => {
    const tags = { phone: '1', website: '2', 'addr:street': '3', 'addr:city': '4', operator: '5' }
    expect(dataConfidenceOf(tags)).toBe(100)
  })
})

/**
 * Integración sobre la captura real de OpenStreetMap.
 *
 * Estas pruebas valen justamente porque corren contra el archivo de demo real:
 * verifican que el flujo completo produzca empresas existentes y trazables, no
 * registros inventados.
 */
import { describe, expect, it } from 'vitest'
import { runProspecting } from './pipeline'
import { createDemoOsmProvider, DEMO_DATASET } from './providers/DemoOsmProvider'
import { ALL_INDUSTRY_KEYS } from './taxonomy'
import type { SearchCriteria } from './types'

const CENTER = {
  name: DEMO_DATASET.center.name,
  latitude: DEMO_DATASET.center.lat,
  longitude: DEMO_DATASET.center.lon,
}

const criteria = (patch: Partial<SearchCriteria> = {}): SearchCriteria => ({
  locality: 'Cañuelas',
  radiusKm: 35,
  industries: ALL_INDUSTRY_KEYS,
  maxResults: 50,
  ...patch,
})

const provider = createDemoOsmProvider()

describe('dataset de demostración', () => {
  it('declara procedencia real de OpenStreetMap', () => {
    expect(DEMO_DATASET.license).toContain('OpenStreetMap')
    expect(DEMO_DATASET.elementCount).toBeGreaterThan(300)
  })

  it('aclara que el mirror no es una fuente independiente', () => {
    expect(DEMO_DATASET.endpointNote.toLowerCase()).toContain('mismos datos')
  })
})

describe('runProspecting', () => {
  it('devuelve prospectos reales y trazables al origen', async () => {
    const result = await runProspecting(provider, CENTER, criteria())

    expect(result.prospects.length).toBeGreaterThan(0)
    for (const prospect of result.prospects) {
      expect(prospect.name.trim().length).toBeGreaterThan(0)
      expect(prospect.sourceUrl).toContain('openstreetmap.org')
      expect(prospect.googleMapsUrl).toContain('google.com/maps')
      expect(prospect.score.total).toBeGreaterThanOrEqual(0)
      expect(prospect.score.total).toBeLessThanOrEqual(100)
    }
  })

  it('respeta el máximo de resultados', async () => {
    const result = await runProspecting(provider, CENTER, criteria({ maxResults: 5 }))
    expect(result.prospects).toHaveLength(5)
  })

  it('ordena por score descendente', async () => {
    const result = await runProspecting(provider, CENTER, criteria())
    const totals = result.prospects.map(p => p.score.total)
    expect([...totals].sort((a, b) => b - a)).toEqual(totals)
  })

  it('sólo devuelve rubros dentro de los seleccionados', async () => {
    const result = await runProspecting(provider, CENTER, criteria({ industries: ['hoteleria'] }))
    expect(result.prospects.length).toBeGreaterThan(0)
    for (const prospect of result.prospects) {
      expect(prospect.industry).toBe('hoteleria')
    }
  })

  it('reduce el universo al achicar el radio', async () => {
    const amplio = await runProspecting(provider, CENTER, criteria({ radiusKm: 35, maxResults: 500 }))
    const chico = await runProspecting(provider, CENTER, criteria({ radiusKm: 5, maxResults: 500 }))
    expect(chico.stats.detected).toBeLessThan(amplio.stats.detected)
  })

  it('no devuelve prospectos fuera del radio pedido', async () => {
    const result = await runProspecting(provider, CENTER, criteria({ radiusKm: 10, maxResults: 500 }))
    for (const prospect of result.prospects) {
      expect(prospect.distanceKm).toBeLessThanOrEqual(10)
    }
  })

  it('deduplica sin perder registros válidos', async () => {
    const result = await runProspecting(provider, CENTER, criteria({ maxResults: 500 }))
    expect(result.stats.afterDedupe).toBeLessThanOrEqual(result.stats.classified)
    const ids = result.prospects.map(p => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('no devuelve nada si no se selecciona ninguna industria', async () => {
    const result = await runProspecting(provider, CENTER, criteria({ industries: [] }))
    expect(result.prospects).toHaveLength(0)
  })
})

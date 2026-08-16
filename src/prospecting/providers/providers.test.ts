import { describe, expect, it, vi } from 'vitest'
import { buildOverpassQuery, parseOverpassElements, selectorToFragment } from './overpassQuery'
import { createOpenStreetMapProvider, OVERPASS_ENDPOINTS } from './OpenStreetMapProvider'
import { createGooglePlacesProvider } from './GooglePlacesProvider'
import { ProviderError } from './types'
import { industryByKey } from '../taxonomy'
import type { Industry } from '../types'

const industry = (key: string): Industry => {
  const found = industryByKey(key as Industry['key'])
  if (!found) throw new Error(`industria inexistente: ${key}`)
  return found
}

describe('selectorToFragment', () => {
  it('traduce valor exacto y siempre exige nombre', () => {
    expect(selectorToFragment({ k: 'shop', v: 'bakery' })).toBe('["shop"="bakery"]["name"]')
  })

  it('traduce expresiones regulares', () => {
    expect(selectorToFragment({ k: 'tourism', regex: '^(hotel|motel)$' })).toBe(
      '["tourism"~"^(hotel|motel)$"]["name"]',
    )
  })
})

describe('buildOverpassQuery', () => {
  it('deduplica selectores compartidos entre industrias', () => {
    // Ambas usan man_made=works: debe aparecer una sola vez.
    const query = buildOverpassQuery(-35, -58.7, 10000, [industry('calderas'), industry('hornos')], 50)
    const ocurrencias = query.split('["man_made"="works"]["name"]').length - 1
    expect(ocurrencias).toBe(1)
  })

  it('incluye centro, radio y límite pedidos', () => {
    const query = buildOverpassQuery(-35, -58.7, 12345, [industry('hoteleria')], 42)
    expect(query).toContain('around:12345,-35,-58.7')
    expect(query).toContain('out center tags 42;')
  })
})

describe('parseOverpassElements', () => {
  it('toma el centro cuando el elemento es un polígono', () => {
    const parsed = parseOverpassElements([
      { type: 'way', id: 7, center: { lat: -35.1, lon: -58.8 }, tags: { name: 'Planta' } },
    ])
    expect(parsed[0]).toMatchObject({ externalId: 'way/7', latitude: -35.1, longitude: -58.8 })
  })

  it('descarta lo que no sirve para prospectar', () => {
    const parsed = parseOverpassElements([
      { type: 'node', id: 1, lat: -35, lon: -58, tags: {} }, // sin nombre
      { type: 'node', id: 2, tags: { name: 'Sin coordenadas' } },
      { type: 'node', id: 3, lat: -35, lon: -58, tags: { name: 'Válido' } },
    ])
    expect(parsed).toHaveLength(1)
    expect(parsed[0].name).toBe('Válido')
  })
})

describe('OpenStreetMapProvider', () => {
  it('trata los endpoints como mirrors: si el primero falla usa el siguiente', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 429 })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ elements: [{ type: 'node', id: 1, lat: -35, lon: -58, tags: { name: 'X' } }] }),
      })

    const provider = createOpenStreetMapProvider({
      endpoints: ['https://a.example/api', 'https://b.example/api'],
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })

    const result = await provider.discover({
      latitude: -35,
      longitude: -58,
      radiusMeters: 1000,
      industries: [industry('hoteleria')],
      limit: 10,
    })

    expect(fetchImpl).toHaveBeenCalledTimes(2)
    expect(result).toHaveLength(1)
  })

  it('falla explícitamente cuando ningún mirror responde', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 504 })
    const provider = createOpenStreetMapProvider({
      endpoints: ['https://a.example/api'],
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })

    await expect(
      provider.discover({
        latitude: -35,
        longitude: -58,
        radiusMeters: 1000,
        industries: [industry('hoteleria')],
        limit: 10,
      }),
    ).rejects.toBeInstanceOf(ProviderError)
  })

  it('lista el mirror de Mail.ru entre los endpoints del mismo dataset', () => {
    expect(OVERPASS_ENDPOINTS).toContain('https://maps.mail.ru/osm/tools/overpass/api/interpreter')
    expect(OVERPASS_ENDPOINTS.length).toBeGreaterThan(1)
  })
})

describe('GooglePlacesProvider', () => {
  it('se declara no disponible en vez de fingir que funciona', () => {
    const availability = createGooglePlacesProvider().availability()
    expect(availability.status).toBe('unavailable')
  })

  it('no intenta ninguna llamada sin credencial de backend', async () => {
    const request = {
      latitude: -35,
      longitude: -58,
      radiusMeters: 1000,
      industries: [industry('hoteleria')],
      limit: 10,
    }
    await expect(createGooglePlacesProvider().discover(request)).rejects.toBeInstanceOf(ProviderError)
  })
})

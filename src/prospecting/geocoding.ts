/**
 * Geocodificación de localidades con Nominatim (OpenStreetMap).
 *
 * Se usa sólo en modo en vivo. La política de uso de Nominatim exige un
 * User-Agent identificable y como máximo una consulta por segundo, así que una
 * versión productiva debe mover esto al backend con caché por localidad en vez
 * de geocodificar desde cada navegador.
 */
import type { Center } from './pipeline'

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'

export class GeocodingError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'GeocodingError'
  }
}

type NominatimHit = {
  name?: string
  lat: string
  lon: string
  display_name?: string
}

export async function geocodeLocality(
  query: string,
  fetchImpl: typeof fetch = fetch,
): Promise<Center> {
  const url = `${NOMINATIM_URL}?q=${encodeURIComponent(query)}&format=json&limit=1`
  const response = await fetchImpl(url, {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new GeocodingError(`Nominatim respondió ${response.status}`)
  }

  const hits = (await response.json()) as NominatimHit[]
  const first = hits[0]
  if (!first) {
    throw new GeocodingError(`No se encontró la localidad "${query}"`)
  }

  return {
    name: first.name ?? query,
    latitude: Number(first.lat),
    longitude: Number(first.lon),
  }
}

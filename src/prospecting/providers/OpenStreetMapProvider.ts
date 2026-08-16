/**
 * Detección sobre OpenStreetMap a través de la API Overpass.
 *
 * IMPORTANTE — sobre los endpoints: los tres son *mirrors del mismo dataset de
 * OpenStreetMap*, no bases distintas. Se listan sólo por disponibilidad: si uno
 * responde 429 o 504 se reintenta contra el siguiente y el resultado es
 * equivalente. Presentar el mirror de Mail.ru como una segunda fuente sería
 * incorrecto: sirve exactamente los mismos datos, bajo la misma licencia ODbL.
 */
import type { RawElement } from '../types'
import type { DiscoveryRequest, ProspectProvider, ProviderAvailability } from './types'
import { ProviderError } from './types'
import { buildOverpassQuery, OSM_PROVIDER_ID, parseOverpassElements } from './overpassQuery'

/** Mirrors intercambiables del mismo dataset OSM, en orden de preferencia. */
export const OVERPASS_ENDPOINTS: readonly string[] = [
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]

const USER_AGENT = 'ExtragasProspeccionGranel/0.1'
const REQUEST_TIMEOUT_MS = 60_000

export const OSM_ATTRIBUTION = '© OpenStreetMap contributors · ODbL 1.0'

type Options = {
  endpoints?: readonly string[]
  fetchImpl?: typeof fetch
}

export function createOpenStreetMapProvider(options: Options = {}): ProspectProvider {
  const endpoints = options.endpoints ?? OVERPASS_ENDPOINTS
  const doFetch = options.fetchImpl ?? fetch

  async function queryEndpoint(endpoint: string, query: string): Promise<readonly RawElement[]> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    try {
      const response = await doFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': USER_AGENT },
        body: new URLSearchParams({ data: query }).toString(),
        signal: controller.signal,
      })
      if (!response.ok) {
        throw new ProviderError(`Overpass respondió ${response.status}`, OSM_PROVIDER_ID)
      }
      const payload: unknown = await response.json()
      const elements =
        typeof payload === 'object' && payload !== null && 'elements' in payload
          ? (payload as { elements?: unknown[] }).elements ?? []
          : []
      return parseOverpassElements(elements as Parameters<typeof parseOverpassElements>[0])
    } finally {
      clearTimeout(timer)
    }
  }

  return {
    id: OSM_PROVIDER_ID,
    label: 'OpenStreetMap (Overpass)',
    attribution: OSM_ATTRIBUTION,

    availability(): ProviderAvailability {
      return { status: 'ready' }
    },

    async discover(request: DiscoveryRequest): Promise<readonly RawElement[]> {
      const query = buildOverpassQuery(
        request.latitude,
        request.longitude,
        request.radiusMeters,
        request.industries,
        request.limit,
      )

      let lastError: unknown = null
      for (const endpoint of endpoints) {
        try {
          return await queryEndpoint(endpoint, query)
        } catch (error: unknown) {
          // Se prueba el mirror siguiente: mismo dataset, distinta disponibilidad.
          lastError = error
        }
      }

      const detail = lastError instanceof Error ? lastError.message : 'causa desconocida'
      throw new ProviderError(`Ningún mirror de Overpass respondió (${detail})`, OSM_PROVIDER_ID)
    },
  }
}

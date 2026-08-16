/**
 * Proveedor de demostración: reproduce una captura real de Overpass.
 *
 * El archivo `demo/osm-canuelas-2026-08-15.demo.json` es la respuesta literal de
 * una consulta a la API Overpass sobre Cañuelas, hecha el 2026-08-15. Son
 * empresas reales de OpenStreetMap: NINGÚN registro es inventado ni sintético.
 *
 * Existe para que la demo comercial no dependa de la red ni del estado de los
 * mirrors públicos. Se comporta igual que el proveedor en vivo — mismo contrato,
 * mismo tipo de salida — así que el resto del flujo no distingue uno de otro.
 */
import type { RawElement } from '../types'
import { haversineKm } from '../geo'
import type { DiscoveryRequest, ProspectProvider, ProviderAvailability } from './types'
import { OSM_PROVIDER_ID } from './overpassQuery'
import { OSM_ATTRIBUTION } from './OpenStreetMapProvider'
import fixtureJson from '../demo/osm-canuelas-2026-08-15.demo.json'

export const DEMO_PROVIDER_ID = 'openstreetmap-demo'

type DemoFixture = {
  capturedAt: string
  source: string
  sourceLicense: string
  endpointUsed: string
  endpointNote: string
  center: { name: string; lat: number; lon: number }
  geocodedWith: string
  radiusMeters: number
  elementCount: number
  elements: readonly {
    type: string
    id: number
    lat: number
    lon: number
    tags: Record<string, string>
  }[]
}

/**
 * TypeScript infiere para un JSON importado un tipo literal gigante donde cada
 * etiqueta ausente figura como `?: undefined`, y eso no es asignable a
 * `Record<string, string>`. Se afirma la forma real del archivo una sola vez,
 * acá en el borde, en lugar de arrastrar el problema por todo el módulo.
 */
const fixture = fixtureJson as unknown as DemoFixture

export const DEMO_DATASET = {
  capturedAt: fixture.capturedAt,
  center: fixture.center,
  radiusMeters: fixture.radiusMeters,
  endpointUsed: fixture.endpointUsed,
  endpointNote: fixture.endpointNote,
  license: fixture.sourceLicense,
  elementCount: fixture.elements.length,
} as const

const ELEMENTS: readonly RawElement[] = fixture.elements.map(element => ({
  providerId: OSM_PROVIDER_ID,
  externalId: `${element.type}/${element.id}`,
  name: element.tags.name,
  latitude: element.lat,
  longitude: element.lon,
  tags: element.tags,
}))

export function createDemoOsmProvider(): ProspectProvider {
  return {
    id: DEMO_PROVIDER_ID,
    label: 'OpenStreetMap (captura de demostración)',
    attribution: OSM_ATTRIBUTION,

    availability(): ProviderAvailability {
      return { status: 'ready' }
    },

    async discover(request: DiscoveryRequest): Promise<readonly RawElement[]> {
      const radiusKm = request.radiusMeters / 1000
      return ELEMENTS.filter(
        element =>
          haversineKm(request.latitude, request.longitude, element.latitude, element.longitude) <=
          radiusKm,
      )
    },
  }
}

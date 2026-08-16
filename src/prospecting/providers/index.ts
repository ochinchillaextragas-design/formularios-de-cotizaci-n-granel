/**
 * Registro de proveedores.
 *
 * Agregar una fuente nueva es implementar `ProspectProvider` y sumarla acá:
 * ni la clasificación, ni el scoring, ni la interfaz necesitan cambiar.
 */
import type { ProspectProvider } from './types'
import { createDemoOsmProvider } from './DemoOsmProvider'
import { createOpenStreetMapProvider } from './OpenStreetMapProvider'
import { createGooglePlacesProvider } from './GooglePlacesProvider'

export const PROVIDERS: readonly ProspectProvider[] = [
  createDemoOsmProvider(),
  createOpenStreetMapProvider(),
  createGooglePlacesProvider(),
]

export function providerById(id: string): ProspectProvider | undefined {
  return PROVIDERS.find(provider => provider.id === id)
}

export type { ProspectProvider, DiscoveryRequest, ProviderAvailability } from './types'
export { ProviderError } from './types'
export { DEMO_PROVIDER_ID, DEMO_DATASET, createDemoOsmProvider } from './DemoOsmProvider'
export { createOpenStreetMapProvider, OVERPASS_ENDPOINTS, OSM_ATTRIBUTION } from './OpenStreetMapProvider'
export { createGooglePlacesProvider, GOOGLE_PLACES_PROVIDER_ID } from './GooglePlacesProvider'
export { OSM_PROVIDER_ID, osmSourceUrl, buildOverpassQuery, selectorToFragment, parseOverpassElements } from './overpassQuery'

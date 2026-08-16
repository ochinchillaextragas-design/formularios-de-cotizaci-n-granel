/**
 * Localidades del territorio de la demo.
 *
 * Coordenadas obtenidas de Nominatim (OpenStreetMap) el 2026-08-15, no cargadas
 * a mano: cambiar de localidad re-centra la búsqueda sobre datos reales. Todas
 * caen dentro del radio de la captura de demostración.
 *
 * En modo en vivo la localidad se resuelve contra Nominatim en el momento
 * (ver `geocoding.ts`); esta lista existe para que la demo no dependa de la red.
 */
import type { Center } from './pipeline'

export const DEMO_LOCALITIES: readonly Center[] = [
  { name: 'Cañuelas', latitude: -35.0540248, longitude: -58.7617379 },
  { name: 'Vicente Casares', latitude: -34.9622565, longitude: -58.6479721 },
  { name: 'Uribelarrea', latitude: -35.1154669, longitude: -58.8984051 },
  { name: 'General Las Heras', latitude: -34.9280308, longitude: -58.9445391 },
  { name: 'Canning', latitude: -34.8646566, longitude: -58.5036513 },
]

export const DEFAULT_LOCALITY: Center = DEMO_LOCALITIES[0]

export function localityByName(name: string): Center | undefined {
  return DEMO_LOCALITIES.find(locality => locality.name === name)
}

/** Utilidades geográficas mínimas para prospección. */

const EARTH_RADIUS_KM = 6371

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180

/** Distancia great-circle en kilómetros. Suficiente para radios de prospección. */
export function haversineKm(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number,
): number {
  const deltaLat = toRadians(toLat - fromLat)
  const deltaLon = toRadians(toLon - fromLon)
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(fromLat)) * Math.cos(toRadians(toLat)) * Math.sin(deltaLon / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)))
}

export function googleMapsUrl(latitude: number, longitude: number, name: string): string {
  const query = encodeURIComponent(`${name} ${latitude},${longitude}`)
  return `https://www.google.com/maps/search/?api=1&query=${query}`
}

/**
 * Construcción y lectura de consultas Overpass.
 *
 * Se mantiene aparte del proveedor y sin dependencias de red para poder
 * probarlo: la consulta es la pieza que más fácil se rompe en silencio.
 */
import type { Industry, OsmSelector, RawElement } from '../types'

export const OSM_PROVIDER_ID = 'openstreetmap'

/** Traduce un selector a un fragmento Overpass. Siempre exige `name`. */
export function selectorToFragment(selector: OsmSelector): string {
  const base =
    selector.v !== undefined
      ? `["${selector.k}"="${selector.v}"]`
      : selector.regex !== undefined
        ? `["${selector.k}"~"${selector.regex}"]`
        : `["${selector.k}"]`
  return `${base}["name"]`
}

/** Deduplica selectores: varias industrias comparten etiquetas OSM. */
function uniqueFragments(industries: readonly Industry[]): readonly string[] {
  const seen = new Set<string>()
  for (const industry of industries) {
    for (const selector of industry.selectors) {
      seen.add(selectorToFragment(selector))
    }
  }
  return [...seen]
}

export function buildOverpassQuery(
  latitude: number,
  longitude: number,
  radiusMeters: number,
  industries: readonly Industry[],
  limit: number,
  timeoutSeconds = 120,
): string {
  const fragments = uniqueFragments(industries)
  const body = fragments
    .map(fragment => `  nwr(around:${radiusMeters},${latitude},${longitude})${fragment};`)
    .join('\n')
  return `[out:json][timeout:${timeoutSeconds}];\n(\n${body}\n);\nout center tags ${limit};`
}

type OverpassElement = {
  type?: string
  id?: number
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
  tags?: Record<string, string>
}

/**
 * Convierte la respuesta cruda en `RawElement`. Descarta lo que no sirve para
 * prospectar (sin nombre o sin coordenada) en vez de arrastrar registros a medias.
 */
export function parseOverpassElements(elements: readonly OverpassElement[]): readonly RawElement[] {
  const parsed: RawElement[] = []
  for (const element of elements) {
    const tags = element.tags ?? {}
    const name = tags.name
    const latitude = element.lat ?? element.center?.lat
    const longitude = element.lon ?? element.center?.lon
    if (!name || latitude === undefined || longitude === undefined) continue
    parsed.push({
      providerId: OSM_PROVIDER_ID,
      externalId: `${element.type ?? 'node'}/${element.id ?? 0}`,
      name,
      latitude,
      longitude,
      tags,
    })
  }
  return parsed
}

export function osmSourceUrl(externalId: string): string {
  return `https://www.openstreetmap.org/${externalId}`
}

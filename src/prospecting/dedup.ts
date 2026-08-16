/**
 * Deduplicación de detecciones.
 *
 * OpenStreetMap suele tener la misma empresa dos veces: el nodo del comercio y
 * el polígono del edificio o la parcela. Se consideran duplicados cuando el
 * nombre normalizado coincide y están a menos de 250 m, y se conserva el
 * registro con la ficha más completa para no perder teléfono o dirección.
 */
import type { Classified } from './types'
import { normalize } from './classify'
import { haversineKm } from './geo'

const DUPLICATE_RADIUS_KM = 0.25

const CONTACT_TAGS = [
  'phone',
  'contact:phone',
  'website',
  'contact:website',
  'email',
  'contact:email',
  'addr:street',
  'addr:housenumber',
  'addr:city',
  'operator',
] as const

/** Riqueza de la ficha: decide cuál de dos duplicados sobrevive. */
export function richness(item: Classified): number {
  const tags = item.raw.tags
  const contact = CONTACT_TAGS.reduce((total, key) => (tags[key] ? total + 1 : total), 0)
  return contact * 10 + Object.keys(tags).length + item.confidence / 100
}

function nameKey(name: string): string {
  return normalize(name).replace(/[^a-z0-9]+/g, ' ').trim()
}

export function dedupe(items: readonly Classified[]): readonly Classified[] {
  const kept: Classified[] = []

  for (const item of items) {
    const key = nameKey(item.raw.name)
    const duplicateIndex = kept.findIndex(
      existing =>
        nameKey(existing.raw.name) === key &&
        haversineKm(
          existing.raw.latitude,
          existing.raw.longitude,
          item.raw.latitude,
          item.raw.longitude,
        ) <= DUPLICATE_RADIUS_KM,
    )

    if (duplicateIndex === -1) {
      kept.push(item)
      continue
    }

    if (richness(item) > richness(kept[duplicateIndex])) {
      kept[duplicateIndex] = item
    }
  }

  return kept
}

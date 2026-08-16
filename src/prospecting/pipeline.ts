/**
 * Orquestador del flujo de prospección.
 *
 *   detección → clasificación GLP → deduplicación → scoring → (asignación)
 *
 * Las etapas siguientes — asignación, pipeline, cotización y seguimiento — son
 * estado comercial y viven en la interfaz mientras no exista backend. Este
 * módulo termina donde termina lo determinista.
 */
import type { Classified, Industry, Prospect, RawElement, SearchCriteria } from './types'
import type { ProspectProvider } from './providers/types'
import { osmSourceUrl } from './providers/overpassQuery'
import { classify } from './classify'
import { dedupe } from './dedup'
import { scoreProspect } from './score'
import { googleMapsUrl, haversineKm } from './geo'
import { industryByKey } from './taxonomy'

export type Center = {
  name: string
  latitude: number
  longitude: number
}

/** Conteo por etapa: hace auditable cuántos registros sobreviven a cada filtro. */
export type PipelineStats = {
  detected: number
  classified: number
  afterDedupe: number
  returned: number
}

export type ProspectingResult = {
  prospects: readonly Prospect[]
  stats: PipelineStats
  attribution: string
}

function contactOf(tags: Readonly<Record<string, string>>) {
  const street = tags['addr:street']
  const number = tags['addr:housenumber']
  const city = tags['addr:city']
  // Calle y localidad se guardan por separado: el formulario de cotización las
  // pide en campos distintos, y unirlas obligaría a volver a partirlas después.
  const streetLine = street ? [street, number].filter(Boolean).join(' ') : undefined
  return {
    phone: tags.phone ?? tags['contact:phone'],
    website: tags.website ?? tags['contact:website'],
    address: streetLine,
    city,
  }
}

function sourceUrlFor(raw: RawElement): string {
  return osmSourceUrl(raw.externalId)
}

function toProspect(item: Classified, industry: Industry, center: Center): Prospect {
  const { raw } = item
  const contact = contactOf(raw.tags)
  return {
    id: `${raw.providerId}:${raw.externalId}`,
    name: raw.name,
    industry: industry.key,
    industryLabel: industry.label,
    confidence: item.confidence,
    latitude: raw.latitude,
    longitude: raw.longitude,
    distanceKm: haversineKm(center.latitude, center.longitude, raw.latitude, raw.longitude),
    phone: contact.phone,
    website: contact.website,
    address: contact.address,
    city: contact.city,
    providerId: raw.providerId,
    sourceLabel: 'OpenStreetMap',
    sourceUrl: sourceUrlFor(raw),
    googleMapsUrl: googleMapsUrl(raw.latitude, raw.longitude, raw.name),
    score: scoreProspect(item, industry),
  }
}

export async function runProspecting(
  provider: ProspectProvider,
  center: Center,
  criteria: SearchCriteria,
): Promise<ProspectingResult> {
  const industries = criteria.industries
    .map(key => industryByKey(key))
    .filter((industry): industry is Industry => industry !== undefined)

  const detected = await provider.discover({
    latitude: center.latitude,
    longitude: center.longitude,
    radiusMeters: criteria.radiusKm * 1000,
    industries,
    limit: Math.max(criteria.maxResults * 4, 200),
  })

  const classified: Classified[] = []
  for (const raw of detected) {
    const result = classify(raw, industries)
    if (result) classified.push(result)
  }

  const deduped = dedupe(classified)

  const scored = deduped
    .map(item => {
      const industry = industryByKey(item.industry)
      return industry ? toProspect(item, industry, center) : null
    })
    .filter((prospect): prospect is Prospect => prospect !== null)
    .sort((a, b) => b.score.total - a.score.total || a.distanceKm - b.distanceKm)

  const prospects = scored.slice(0, criteria.maxResults)

  return {
    prospects,
    stats: {
      detected: detected.length,
      classified: classified.length,
      afterDedupe: deduped.length,
      returned: prospects.length,
    },
    attribution: provider.attribution,
  }
}

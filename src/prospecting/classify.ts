/**
 * Clasificación GLP: de empresa detectada a rubro con potencial de consumo.
 *
 * Es determinista y explicable — mismo insumo, mismo resultado, sin modelo ni
 * azar. Prioriza precisión sobre cobertura: un elemento sin señal para ninguna
 * industria seleccionada se descarta en vez de forzarlo a una categoría, para
 * que el listado no se llene de puntos de interés irrelevantes.
 */
import type { Classified, Industry, IndustryKey, OsmSelector, RawElement } from './types'

/**
 * Etiquetas demasiado amplias para determinar el rubro por sí solas: un
 * `landuse=industrial` puede ser cualquier cosa. Aportan poco puntaje y sólo
 * deciden el rubro a través del fallback genérico.
 */
const GENERIC_TAGS: ReadonlySet<string> = new Set([
  'landuse=industrial',
  'landuse=farmyard',
  'man_made=works',
  'man_made=silo',
  'building=industrial',
  'building=warehouse',
  'building=farm_auxiliary',
  'industrial=factory',
  'industrial=depot',
  'industrial=scrap_yard',
])

const SPECIFIC_SELECTOR_POINTS = 35
const GENERIC_SELECTOR_POINTS = 12
const KEYWORD_POINTS = 22

/** Minúsculas sin acentos: el dato de OSM viene acentuado y las claves no. */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function selectorMatches(selector: OsmSelector, tags: Readonly<Record<string, string>>): boolean {
  const value = tags[selector.k]
  if (value === undefined) return false
  if (selector.v !== undefined) return value === selector.v
  if (selector.regex !== undefined) return new RegExp(selector.regex).test(value)
  return true
}

function isGenericMatch(selector: OsmSelector, tags: Readonly<Record<string, string>>): boolean {
  return GENERIC_TAGS.has(`${selector.k}=${tags[selector.k]}`)
}

/** Texto donde buscar palabras clave: nombre más los valores de etiqueta útiles. */
function searchableText(raw: RawElement): string {
  const parts = [raw.name, raw.tags.operator ?? '', raw.tags.description ?? '', raw.tags.product ?? '']
  return normalize(parts.join(' '))
}

function countKeywordHits(text: string, keywords: readonly string[]): number {
  let hits = 0
  for (const keyword of keywords) {
    if (text.includes(normalize(keyword))) hits += 1
  }
  return hits
}

/**
 * Cuando el elemento sólo tiene etiquetas genéricas y ninguna palabra clave,
 * se lo ubica en el rubro contenedor en vez de adivinar una especialidad.
 */
function genericFallback(tags: Readonly<Record<string, string>>): IndustryKey | null {
  if (tags.landuse === 'farmyard' || tags.building === 'farm_auxiliary') return 'agro'
  if (
    tags.landuse === 'industrial' ||
    tags.man_made === 'works' ||
    tags.man_made === 'silo' ||
    tags.industrial !== undefined ||
    tags.building === 'industrial' ||
    tags.building === 'warehouse'
  ) {
    return 'industria_pesada'
  }
  return null
}

type Candidate = {
  key: IndustryKey
  points: number
  keywordHits: number
  hasSpecificMatch: boolean
}

function evaluate(raw: RawElement, industry: Industry, text: string): Candidate | null {
  let points = 0
  let hasSpecificMatch = false

  for (const selector of industry.selectors) {
    if (!selectorMatches(selector, raw.tags)) continue
    if (isGenericMatch(selector, raw.tags)) {
      points = Math.max(points, GENERIC_SELECTOR_POINTS)
    } else {
      points = Math.max(points, SPECIFIC_SELECTOR_POINTS)
      hasSpecificMatch = true
    }
  }

  const keywordHits = countKeywordHits(text, industry.keywords)
  points += Math.min(keywordHits, 2) * KEYWORD_POINTS

  if (points === 0) return null
  return { key: industry.key, points, keywordHits, hasSpecificMatch }
}

/**
 * Devuelve el rubro con mejor evidencia, o `null` si no hay ninguna.
 * Sólo se consideran las industrias que el usuario pidió buscar.
 */
export function classify(raw: RawElement, industries: readonly Industry[]): Classified | null {
  const text = searchableText(raw)
  const candidates: Candidate[] = []

  for (const industry of industries) {
    const candidate = evaluate(raw, industry, text)
    if (candidate) candidates.push(candidate)
  }

  if (candidates.length === 0) return null

  const decisive = candidates.filter(c => c.keywordHits > 0 || c.hasSpecificMatch)

  if (decisive.length === 0) {
    // Sólo evidencia genérica: se usa el rubro contenedor, si está habilitado.
    const fallback = genericFallback(raw.tags)
    const allowed = fallback !== null && industries.some(i => i.key === fallback)
    if (!allowed) return null
    return { raw, industry: fallback, confidence: 40 }
  }

  const best = decisive.reduce((a, b) => (b.points > a.points ? b : a))
  const confidence = Math.min(100, 40 + best.keywordHits * 20 + (best.hasSpecificMatch ? 30 : 0))
  return { raw, industry: best.key, confidence }
}

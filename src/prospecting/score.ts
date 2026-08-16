/**
 * Score de potencial GLP (0–100), modular y explicable.
 *
 *   total = fit térmico + escala de instalación + continuidad operativa − señales negativas
 *
 * Cada punto lleva un motivo legible, así que la interfaz puede mostrar por qué
 * un prospecto puntúa lo que puntúa en vez de pedir que se confíe en un número.
 *
 * La calidad del dato se calcula APARTE: una empresa con alto consumo y ficha
 * pobre en OSM sigue siendo un buen prospecto — sólo cuesta más contactarla.
 */
import type { Classified, GlpScore, Industry, Priority, ScoreLine } from './types'

const PRIORITY_HIGH_MIN = 65
const PRIORITY_MEDIUM_MIN = 42

const MAX_SCALE = 25
const MAX_CONTINUITY = 15

export function priorityFor(total: number): Priority {
  if (total >= PRIORITY_HIGH_MIN) return 'ALTA'
  if (total >= PRIORITY_MEDIUM_MIN) return 'MEDIA'
  return 'BAJA'
}

type Tags = Readonly<Record<string, string>>

/** Indicios de que hay una instalación de porte, no un local chico. */
function scaleLines(tags: Tags): readonly ScoreLine[] {
  const lines: ScoreLine[] = []
  if (tags.landuse === 'industrial') {
    lines.push({ category: 'Escala', points: 12, reason: 'Ubicada en parcela industrial' })
  }
  if (tags.man_made === 'works') {
    lines.push({ category: 'Escala', points: 10, reason: 'Registrada como planta o fábrica' })
  }
  if (tags.man_made === 'silo') {
    lines.push({ category: 'Escala', points: 8, reason: 'Infraestructura de almacenaje de granel' })
  }
  if (tags.building === 'industrial' || tags.building === 'warehouse') {
    lines.push({ category: 'Escala', points: 8, reason: 'Nave industrial o depósito propio' })
  }
  if (tags.industrial !== undefined) {
    lines.push({ category: 'Escala', points: 10, reason: `Actividad industrial declarada (${tags.industrial})` })
  }
  if (tags.operator) {
    lines.push({ category: 'Escala', points: 4, reason: 'Operador identificado: estructura formal' })
  }
  return lines
}

/** Cuánto sostiene el consumo en el tiempo: lo que separa un pico de una demanda base. */
function continuityLines(tags: Tags): readonly ScoreLine[] {
  const lines: ScoreLine[] = []
  if (tags.tourism === 'hotel' || tags.tourism === 'motel') {
    lines.push({ category: 'Continuidad', points: 12, reason: 'Agua caliente sanitaria todo el año' })
  }
  if (tags.shop === 'bakery' || tags.craft === 'bakery') {
    lines.push({ category: 'Continuidad', points: 10, reason: 'Horno en uso diario' })
  }
  if (tags.industrial !== undefined || tags.man_made === 'works') {
    lines.push({ category: 'Continuidad', points: 10, reason: 'Proceso productivo con marcha regular' })
  }
  if (tags.amenity === 'restaurant') {
    lines.push({ category: 'Continuidad', points: 6, reason: 'Cocina en servicio diario' })
  }
  if (tags.opening_hours?.includes('24/7')) {
    lines.push({ category: 'Continuidad', points: 8, reason: 'Opera 24/7' })
  }
  return lines
}

/** Señales de que el consumo probablemente no justifique una instalación a granel. */
function negativeLines(tags: Tags): readonly ScoreLine[] {
  const lines: ScoreLine[] = []
  if (tags.amenity === 'cafe' && tags.building === undefined) {
    lines.push({ category: 'Ajuste', points: -8, reason: 'Local pequeño sin edificio propio registrado' })
  }
  if (tags.tourism === 'guest_house' || tags.tourism === 'apartment' || tags.tourism === 'hostel') {
    lines.push({ category: 'Ajuste', points: -6, reason: 'Alojamiento de escala reducida' })
  }
  if (tags.amenity === 'fast_food') {
    lines.push({ category: 'Ajuste', points: -4, reason: 'Cocina de bajo caudal térmico' })
  }
  return lines
}

function capped(lines: readonly ScoreLine[], max: number): readonly ScoreLine[] {
  let running = 0
  const kept: ScoreLine[] = []
  for (const line of lines) {
    if (running >= max) break
    const points = Math.min(line.points, max - running)
    running += points
    kept.push({ ...line, points })
  }
  return kept
}

/** Calidad de la ficha pública. No influye en el potencial, sí en la accionabilidad. */
export function dataConfidenceOf(tags: Tags): number {
  let score = 0
  if (tags.phone || tags['contact:phone']) score += 30
  if (tags.website || tags['contact:website']) score += 20
  if (tags['addr:street']) score += 25
  if (tags['addr:city']) score += 10
  if (tags.operator) score += 15
  return Math.min(100, score)
}

export function scoreProspect(item: Classified, industry: Industry): GlpScore {
  const tags = item.raw.tags

  const fit: ScoreLine = {
    category: 'Fit térmico',
    points: industry.thermalFit,
    reason: industry.thermalRationale,
  }

  const breakdown: readonly ScoreLine[] = [
    fit,
    ...capped(scaleLines(tags), MAX_SCALE),
    ...capped(continuityLines(tags), MAX_CONTINUITY),
    ...negativeLines(tags),
  ]

  const raw = breakdown.reduce((total, line) => total + line.points, 0)
  const total = Math.max(0, Math.min(100, Math.round(raw)))

  return {
    total,
    priority: priorityFor(total),
    dataConfidence: dataConfidenceOf(tags),
    breakdown,
  }
}

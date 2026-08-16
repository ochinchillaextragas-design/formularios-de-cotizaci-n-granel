/**
 * Modelo de dominio de prospección granel.
 *
 * El flujo es deliberadamente lineal y cada etapa produce un tipo distinto:
 *
 *   RawElement  → detección   (lo que devuelve un proveedor, sin interpretar)
 *   Classified  → clasificación GLP
 *   Prospect    → deduplicación + scoring
 *   Assignment  → asignación, pipeline, cotización y seguimiento
 *
 * Separar los tipos permite cambiar de proveedor sin tocar la lógica comercial.
 */

/** Clave estable de industria. El string se persiste, así que no se renombra. */
export type IndustryKey =
  | 'avicola_porcino'
  | 'secaderos'
  | 'tambos'
  | 'agro'
  | 'invernaderos'
  | 'industria_alimenticia'
  | 'gastronomia_panaderia'
  | 'hoteleria'
  | 'lavaderos'
  | 'asfalto'
  | 'calderas'
  | 'hornos'
  | 'industria_pesada'

/**
 * Selector de etiquetas OSM. La misma definición construye la consulta Overpass
 * y clasifica el resultado, de modo que no puedan divergir.
 */
export type OsmSelector = {
  k: string
  v?: string
  regex?: string
}

export type Industry = {
  key: IndustryKey
  label: string
  selectors: readonly OsmSelector[]
  keywords: readonly string[]
  /** Aporte base de potencial térmico GLP (0–45). */
  thermalFit: number
  /** Por qué esta industria consume GLP. Se muestra al usuario. */
  thermalRationale: string
}

/**
 * Empresa real detectada por un proveedor, todavía sin clasificar ni puntuar.
 * Es el único contrato que un proveedor nuevo debe saber producir.
 */
export type RawElement = {
  providerId: string
  externalId: string
  name: string
  latitude: number
  longitude: number
  tags: Readonly<Record<string, string>>
}

export type Classified = {
  raw: RawElement
  industry: IndustryKey
  /** Fuerza de la clasificación (0–100), no del potencial comercial. */
  confidence: number
}

/** Una línea del desglose de score, con motivo legible para el usuario. */
export type ScoreLine = {
  category: string
  points: number
  reason: string
}

export type Priority = 'ALTA' | 'MEDIA' | 'BAJA'

export type GlpScore = {
  total: number
  priority: Priority
  /**
   * Calidad del dato público (0–100). Se mide aparte del potencial: una empresa
   * con alto consumo y ficha pobre sigue siendo un buen prospecto.
   */
  dataConfidence: number
  breakdown: readonly ScoreLine[]
}

export type Prospect = {
  id: string
  name: string
  industry: IndustryKey
  industryLabel: string
  confidence: number
  latitude: number
  longitude: number
  distanceKm: number
  phone?: string
  website?: string
  address?: string
  city?: string
  /** Proveedor que detectó el registro, para trazabilidad del dato. */
  providerId: string
  sourceLabel: string
  sourceUrl: string
  googleMapsUrl: string
  score: GlpScore
}

export type PipelineStage = 'sin_asignar' | 'en_pipeline' | 'cotizacion_creada'

/** Estado comercial de un prospecto. Vive fuera del prospecto porque cambia por separado. */
export type Assignment = {
  prospectId: string
  stage: PipelineStage
  owner: string
  nextAction: string
}

export type SearchCriteria = {
  locality: string
  radiusKm: number
  industries: readonly IndustryKey[]
  maxResults: number
}

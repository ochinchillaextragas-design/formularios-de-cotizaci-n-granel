/**
 * Taxonomía de industrias con potencial de consumo de GLP a granel.
 *
 * Cada entrada cumple tres funciones a la vez:
 *   1. `selectors` construye la consulta Overpass (detección).
 *   2. `selectors` + `keywords` clasifican el resultado (clasificación GLP).
 *   3. `thermalFit` aporta la base del score de potencial.
 *
 * El criterio de `thermalFit` es el uso térmico real del gas en cada rubro:
 * secado, calderas y hornos son procesos de fuego directo y continuo; hotelería
 * y lavaderos son agua caliente sanitaria; gastronomía es cocción intermitente.
 */
import type { Industry, IndustryKey } from './types'

export const INDUSTRIES: readonly Industry[] = [
  {
    key: 'avicola_porcino',
    label: 'Avícola / Porcino',
    selectors: [
      { k: 'industrial', v: 'slaughterhouse' },
      { k: 'landuse', v: 'farmyard' },
      { k: 'building', v: 'farm_auxiliary' },
    ],
    keywords: ['avicola', 'avicultura', 'aviar', 'granja', 'criadero', 'porcino', 'cerdo', 'pollo', 'huevo', 'cabaña', 'frigorifico'],
    thermalFit: 42,
    thermalRationale: 'Calefacción de galpones de crianza durante todo el ciclo productivo.',
  },
  {
    key: 'secaderos',
    label: 'Secaderos',
    selectors: [
      { k: 'man_made', regex: '^(works|silo)$' },
      { k: 'landuse', v: 'industrial' },
    ],
    keywords: ['secadero', 'secado', 'deshidratado', 'acopio', 'cereal', 'granos', 'maiz'],
    thermalFit: 45,
    thermalRationale: 'Secado de grano: fuego directo, alto caudal y campaña sostenida.',
  },
  {
    key: 'tambos',
    label: 'Tambos',
    selectors: [
      { k: 'landuse', v: 'farmyard' },
      { k: 'man_made', v: 'works' },
    ],
    keywords: ['tambo', 'lacteo', 'lactea', 'lacteos', 'leche', 'queseria', 'queso'],
    thermalFit: 34,
    thermalRationale: 'Agua caliente para higiene de equipos y ciclos de limpieza CIP.',
  },
  {
    key: 'agro',
    label: 'Agro',
    selectors: [
      { k: 'shop', regex: '^(agrarian|farm)$' },
      { k: 'landuse', v: 'farmyard' },
    ],
    keywords: ['agro', 'agricola', 'agropecuaria', 'semilla', 'cereales', 'silo', 'campo', 'rural'],
    thermalFit: 30,
    thermalRationale: 'Consumo estacional de proceso y servicios generales del establecimiento.',
  },
  {
    key: 'invernaderos',
    label: 'Invernaderos',
    selectors: [
      { k: 'landuse', v: 'greenhouse_horticulture' },
      { k: 'building', v: 'greenhouse' },
    ],
    keywords: ['invernadero', 'vivero', 'hidroponia', 'floricultura', 'plantines'],
    thermalFit: 40,
    thermalRationale: 'Calefacción nocturna y control de temperatura en ciclo frío.',
  },
  {
    key: 'industria_alimenticia',
    label: 'Industria alimenticia',
    selectors: [
      { k: 'man_made', v: 'works' },
      { k: 'industrial', regex: '^(factory|slaughterhouse)$' },
      { k: 'craft', regex: '^(brewery|distillery|winery|caterer)$' },
    ],
    keywords: ['alimento', 'alimenticia', 'alimentos', 'frigorifico', 'molino', 'harina', 'panificado', 'aceite', 'conserva', 'bebida', 'cerveceria', 'destileria', 'lacteo'],
    thermalFit: 38,
    thermalRationale: 'Vapor de proceso, cocción y pasteurización en línea continua.',
  },
  {
    key: 'gastronomia_panaderia',
    label: 'Gastronomía / Panadería',
    selectors: [
      { k: 'shop', v: 'bakery' },
      { k: 'craft', v: 'bakery' },
      { k: 'amenity', regex: '^(restaurant|fast_food|cafe)$' },
    ],
    keywords: ['panaderia', 'panificados', 'horno', 'pizzeria', 'restaurante', 'parrilla', 'confiteria', 'rotiseria'],
    thermalFit: 32,
    thermalRationale: 'Hornos y cocina: consumo diario y previsible, aunque de menor caudal.',
  },
  {
    key: 'hoteleria',
    label: 'Hotelería',
    selectors: [{ k: 'tourism', regex: '^(hotel|motel|guest_house|hostel|apartment)$' }],
    keywords: ['hotel', 'hosteria', 'cabañas', 'apart', 'posada', 'spa', 'complejo'],
    thermalFit: 30,
    thermalRationale: 'Agua caliente sanitaria permanente y calefacción de ambientes comunes.',
  },
  {
    key: 'lavaderos',
    label: 'Lavaderos',
    selectors: [
      { k: 'amenity', v: 'car_wash' },
      { k: 'shop', regex: '^(laundry|dry_cleaning)$' },
    ],
    keywords: ['lavadero', 'lavanderia', 'tintoreria', 'lavado'],
    thermalFit: 33,
    thermalRationale: 'Agua caliente de alto recambio durante toda la jornada operativa.',
  },
  {
    key: 'asfalto',
    label: 'Asfalto',
    selectors: [
      { k: 'industrial', regex: '^(asphalt|factory)$' },
      { k: 'man_made', v: 'works' },
    ],
    keywords: ['asfalto', 'asfaltica', 'bituminoso', 'hormigon', 'vial', 'pavimento'],
    thermalFit: 44,
    thermalRationale: 'Calentamiento de material bituminoso: alta demanda instantánea.',
  },
  {
    key: 'calderas',
    label: 'Calderas',
    selectors: [
      { k: 'man_made', v: 'works' },
      { k: 'landuse', v: 'industrial' },
    ],
    keywords: ['caldera', 'calderas', 'vapor', 'termica', 'termomecanica'],
    thermalFit: 45,
    thermalRationale: 'Generación de vapor: el consumo más estable y de mayor volumen.',
  },
  {
    key: 'hornos',
    label: 'Hornos',
    selectors: [
      { k: 'industrial', regex: '^(brickyard|factory)$' },
      { k: 'man_made', v: 'works' },
    ],
    keywords: ['horno', 'hornos', 'ladrillo', 'ladrillera', 'ceramica', 'ceramico', 'fundicion', 'tratamiento termico'],
    thermalFit: 45,
    thermalRationale: 'Hornos de proceso a alta temperatura con marcha continua.',
  },
  {
    key: 'industria_pesada',
    label: 'Industria pesada',
    selectors: [
      { k: 'landuse', v: 'industrial' },
      { k: 'man_made', v: 'works' },
      { k: 'industrial', regex: '^(factory|depot|scrap_yard)$' },
      { k: 'building', regex: '^(industrial|warehouse)$' },
    ],
    keywords: ['metalurgica', 'siderurgia', 'acero', 'quimica', 'fundicion', 'plastico', 'papel', 'textil', 'automotriz', 'industrial'],
    thermalFit: 36,
    thermalRationale: 'Procesos térmicos auxiliares y calefacción de nave industrial.',
  },
]

const BY_KEY: ReadonlyMap<IndustryKey, Industry> = new Map(INDUSTRIES.map(i => [i.key, i]))

export function industryByKey(key: IndustryKey): Industry | undefined {
  return BY_KEY.get(key)
}

export function industryLabel(key: IndustryKey): string {
  return BY_KEY.get(key)?.label ?? key
}

export const ALL_INDUSTRY_KEYS: readonly IndustryKey[] = INDUSTRIES.map(i => i.key)

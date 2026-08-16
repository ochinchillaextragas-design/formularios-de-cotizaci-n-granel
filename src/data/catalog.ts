import plan500 from '../assets/extragas/plans/plano-tecnico-500l.svg'
import plan1000 from '../assets/extragas/plans/plano-tecnico-1000l.svg'
import plan2000 from '../assets/extragas/plans/plano-tecnico-2000l.svg'
import plan4000 from '../assets/extragas/plans/plano-tecnico-4000l.svg'
import plan7300 from '../assets/extragas/plans/plano-tecnico-7300l.svg'

/**
 * Catálogo comercial del cotizador.
 *
 * Todo lo que antes vivía disperso en el archivo original —capacidades, tipos de
 * instalación, planos y materiales sugeridos— está acá, tipado, para que la
 * interfaz no pueda ofrecer una combinación que el catálogo no contemple.
 */

// ── Capacidades de tanque ────────────────────────────────────────

/** Las seis capacidades activas. El tipo impide referirse a una inexistente. */
export type TankCapacityValue = '500' | '1000' | '2000' | '4000' | '6000' | '7300'

export type TankCapacity = {
  /** Clave estable; es lo que se guarda en la cotización. */
  value: TankCapacityValue
  liters: number
  cubicMeters: string
  label: string
  /** Para qué sirve esta capacidad, en lenguaje comercial. */
  description: string
}

/**
 * Catálogo vigente: seis capacidades. **El tanque de 8.000 L no se ofrece** —
 * el máximo confirmado es 7.300 L, y la discrepancia que arrastraba el original
 * quedó cerrada.
 */
export const tankCapacities: readonly TankCapacity[] = [
  {
    value: '500',
    liters: 500,
    cubicMeters: '0,5 m³',
    label: '500 L',
    description:
      'Pequeños comercios, gastronomía y servicios que necesitan suministro estable en espacios reducidos.',
  },
  {
    value: '1000',
    liters: 1000,
    cubicMeters: '1 m³',
    label: '1.000 L',
    description: 'Establecimientos medianos, calefacción central y procesos productivos de baja demanda.',
  },
  {
    value: '2000',
    liters: 2000,
    cubicMeters: '2 m³',
    label: '2.000 L',
    description: 'Industrias y agro con consumo medio, zonas frías o de alto rendimiento térmico.',
  },
  {
    value: '4000',
    liters: 4000,
    cubicMeters: '4 m³',
    label: '4.000 L',
    description: 'Grandes consumos en agro, industrias alimenticias y procesos continuos.',
  },
  {
    value: '6000',
    liters: 6000,
    cubicMeters: '6 m³',
    label: '6.000 L',
    description:
      'Plantas industriales, criaderos, secaderos y establecimientos de alto consumo constante.',
  },
  {
    value: '7300',
    liters: 7300,
    cubicMeters: '7,3 m³',
    label: '7.300 L',
    description:
      'Grandes industrias, plantas de procesamiento, asfalto y proyectos que requieren máximo almacenamiento.',
  },
]

export function tankByValue(value: string): TankCapacity | undefined {
  return tankCapacities.find(t => t.value === value)
}

// ── Planos técnicos ──────────────────────────────────────────────

export type PlanStatus =
  | { kind: 'pending' }
  | { kind: 'available'; asset: string; documentCode: string }

/**
 * Planos de referencia entregados por Extragas, uno por capacidad.
 *
 * Son archivos SVG independientes en `src/assets/extragas/plans/`: pesan ~230 kB
 * cada uno, muy por encima del umbral de inline de Vite, así que se sirven como
 * recursos aparte y no engordan el bundle de JavaScript.
 *
 * **6.000 L no tiene entrada a propósito.** No existe plano fuente para esa
 * capacidad, y no se reutiliza el de otra ni se dibuja un sustituto.
 */
export const tankPlans: Partial<Record<TankCapacityValue, string>> = {
  '500': plan500,
  '1000': plan1000,
  '2000': plan2000,
  '4000': plan4000,
  '7300': plan7300,
}

/** Código de documento impreso en cada plano, para citarlo en la ficha. */
const PLAN_DOCUMENT_CODES: Partial<Record<TankCapacityValue, string>> = {
  '500': 'EXT-GLP-REF-500',
  '1000': 'EXT-GLP-REF-1000',
  '2000': 'EXT-GLP-REF-2000',
  '4000': 'EXT-GLP-REF-4000',
  '7300': 'EXT-GLP-REF-7300',
}

export function planStatusFor(capacity: string): PlanStatus {
  const asset = tankPlans[capacity as TankCapacityValue]
  const documentCode = PLAN_DOCUMENT_CODES[capacity as TankCapacityValue]
  return asset && documentCode ? { kind: 'available', asset, documentCode } : { kind: 'pending' }
}

/**
 * Los planos son material de referencia comercial y preevaluación: no sustituyen
 * proyecto ejecutivo, cálculo, relevamiento ni firma profesional.
 */
export const PLAN_TECHNICAL_NOTICE =
  'Plano de referencia comercial. Las medidas y distancias requieren validación final de Ingeniería y Seguridad de Extragas; no reemplaza proyecto ejecutivo ni habilita ejecutar obra.'

// ── Categorías y tipos de instalación ────────────────────────────

// Etiquetas tal como aparecen en el selector del original.
export const categoryLabels: Record<string, string> = {
  residencial: 'Residencial',
  comercial: 'Comercial',
  industrial: 'Industrial',
  agro: 'Agro / Rural',
}

export const categories: Record<string, string[]> = {
  residencial: ['Vivienda unifamiliar - Calefacción + ACS', 'Vivienda unifamiliar - Solo cocina', 'Vivienda unifamiliar - Calefacción + cocina + ACS', 'Departamento - Consumo bajo', 'Barrio privado / Country', 'PH / Casa de fin de semana'],
  comercial: ['Restaurante / Parrilla', 'Hotel / Hospedaje', 'Lavadero industrial', 'Panadería / Confitería', 'Gimnasio / Vestuarios', 'Local comercial - Calefacción', 'Edificio de oficinas'],
  industrial: ['Fábrica - Proceso productivo', 'Galpón - Calefacción zonal', 'Planta de tratamiento', 'Secado de granos / productos', 'Caldera industrial', 'Horno industrial'],
  agro: ['Criadero de animales (avícola/porcino)', 'Invernadero / Vivero', 'Secadora de granos', 'Campo / Estancia - Casa principal', 'Tambo / Lechería'],
}

// ── Presets de materiales ────────────────────────────────────────

export type PresetItem = {
  description: string
  quantity: number
  unit: string
  unitPrice: number
}

/**
 * Un preset trae materiales **y** la capacidad de tanque que les corresponde.
 *
 * Antes eran cosas separadas y podían quedar en contradicción: elegir 6.000 L y
 * después cargar el preset industrial dejaba materiales de 7.300 L con el
 * selector todavía en 6.000. Al viajar juntos, aplicarlo es una sola operación
 * y no hay estado intermedio inconsistente.
 */
export type MaterialPreset = {
  id: string
  /** Tipo de instalación al que corresponde. */
  name: string
  tankCapacity: TankCapacityValue
  items: readonly PresetItem[]
}

/**
 * Los cuatro presets heredados del cotizador original.
 *
 * Se conservan tal cual estaban, con una sola corrección: el preset industrial
 * traía "Tanque GLP 8000 L", una capacidad que el catálogo no ofrece. Se
 * sustituyó por 7.300 L, el máximo real, para que no pueda cotizarse un producto
 * inexistente.
 *
 * **Los importes son ficticios**, heredados de la demostración original. No son
 * tarifa comercial de Extragas: ver `DEMO_PRICING_NOTICE`.
 */
export const installationPresets: readonly MaterialPreset[] = [
  {
    id: 'residencial-calefaccion-acs',
    name: 'Vivienda unifamiliar - Calefacción + ACS',
    tankCapacity: '2000',
    items: [
      { description: 'Tanque GLP 2000 L c/base y accesorios', quantity: 1, unit: 'u', unitPrice: 1200000 },
      { description: 'Regulador de 1° etapa GLP', quantity: 1, unit: 'u', unitPrice: 45000 },
      { description: 'Regulador de 2° etapa GLP', quantity: 1, unit: 'u', unitPrice: 38000 },
      { description: 'Cañería polietileno PE-AL-PE 20mm x 10m', quantity: 1, unit: 'rollo', unitPrice: 35000 },
      { description: 'Válvula de seguridad y corte', quantity: 1, unit: 'u', unitPrice: 28000 },
      { description: 'Juego de conectores y accesorios', quantity: 1, unit: 'kit', unitPrice: 22000 },
      { description: 'Manómetro 0-10 bar', quantity: 1, unit: 'u', unitPrice: 15000 },
    ],
  },
  {
    id: 'comercial-restaurante',
    name: 'Restaurante / Parrilla',
    tankCapacity: '4000',
    items: [
      { description: 'Tanque GLP 4000 L c/base y accesorios', quantity: 1, unit: 'u', unitPrice: 2200000 },
      { description: 'Regulador de 1° etapa industrial', quantity: 1, unit: 'u', unitPrice: 85000 },
      { description: 'Regulador de 2° etapa industrial', quantity: 1, unit: 'u', unitPrice: 65000 },
      { description: 'Cañería polietileno 25mm x 15m', quantity: 1, unit: 'rollo', unitPrice: 55000 },
      { description: 'Válvula de seguridad reforzada', quantity: 2, unit: 'u', unitPrice: 35000 },
      { description: 'Kit conectores industriales', quantity: 1, unit: 'kit', unitPrice: 45000 },
    ],
  },
  {
    id: 'industrial-fabrica',
    name: 'Fábrica - Proceso productivo',
    tankCapacity: '7300',
    items: [
      // Era "Tanque GLP 8000 L" en el original: capacidad fuera de catálogo.
      { description: 'Tanque GLP 7300 L c/base y accesorios', quantity: 1, unit: 'u', unitPrice: 4800000 },
      { description: 'Regulador industrial alta capacidad', quantity: 1, unit: 'u', unitPrice: 180000 },
      { description: 'Vaporizador eléctrico 300 kg/h', quantity: 1, unit: 'u', unitPrice: 950000 },
      { description: 'Cañería acero sched.40 2" x 20m', quantity: 1, unit: 'tramo', unitPrice: 280000 },
      { description: 'Válvulas de bloqueo industriales', quantity: 3, unit: 'u', unitPrice: 65000 },
      { description: 'Sistema de medición y control', quantity: 1, unit: 'kit', unitPrice: 350000 },
    ],
  },
  {
    id: 'agro-criadero',
    name: 'Criadero de animales (avícola/porcino)',
    tankCapacity: '4000',
    items: [
      { description: 'Tanque GLP 4000 L c/base', quantity: 1, unit: 'u', unitPrice: 2200000 },
      { description: 'Regulador de 1° etapa', quantity: 1, unit: 'u', unitPrice: 45000 },
      { description: 'Calefactores infrarrojos GLP', quantity: 6, unit: 'u', unitPrice: 120000 },
      { description: 'Cañería polietileno 25mm x 30m', quantity: 1, unit: 'rollo', unitPrice: 90000 },
      { description: 'Termostato digital', quantity: 2, unit: 'u', unitPrice: 35000 },
    ],
  },
]

export function presetFor(installationType: string): MaterialPreset | undefined {
  return installationPresets.find(preset => preset.name === installationType)
}

/**
 * Aviso permanente sobre los importes.
 *
 * Se muestra SIEMPRE, no según el contenido de los materiales: si dependiera de
 * las descripciones, editar una fila haría desaparecer el aviso mientras los
 * importes siguen siendo los de la demostración. Ningún precio de esta
 * aplicación es tarifa comercial vigente de Extragas.
 */
export const DEMO_PRICING_NOTICE =
  'Demo comercial — materiales, mano de obra y costos ficticios sujetos a validación de Extragas.'

// ── Condiciones ──────────────────────────────────────────────────

export const defaultConditions = `- Precios válidos por 15 días desde la fecha de emisión.
- Forma de pago: 50% anticipo, 50% contra entrega. (Consultar otras opciones).
- El plazo de instalación se acordará al confirmar la orden.
- La instalación cumple con normativas NAG y disposiciones de ENARGAS.
- No incluye: flete (a cotizar según ubicación), obra civil, conexión eléctrica, trámites municipales.
- Garantía sobre materiales: según especificaciones del fabricante.
- Garantía sobre mano de obra: 6 meses.`

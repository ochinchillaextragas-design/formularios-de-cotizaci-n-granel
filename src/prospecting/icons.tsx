/**
 * Catálogo tipado de iconos.
 *
 * Biblioteca única: Phosphor Icons (`@phosphor-icons/react`). Un solo trazo, un
 * solo peso, sin emojis ni SVG improvisados. `Record<IndustryKey, Icon>` obliga
 * a que los 13 rubros tengan icono: agregar un rubro sin icono no compila.
 *
 * El mismo icono se usa en filtros, marcadores, listado y ficha, para que el
 * usuario aprenda el símbolo una vez.
 */
import {
  ArrowsClockwise,
  Basket,
  Bed,
  Bird,
  Bread,
  CaretRight,
  Cow,
  Crosshair,
  Factory,
  FileText,
  type Icon,
  MapPin,
  Oven,
  Plant,
  RoadHorizon,
  SlidersHorizontal,
  SquaresFour,
  Target,
  Thermometer,
  Tractor,
  User,
  WashingMachine,
  Wind,
} from '@phosphor-icons/react'
import type { IndustryKey } from './types'

/** Un icono por rubro. El tipo garantiza cobertura completa. */
export const INDUSTRY_ICONS: Record<IndustryKey, Icon> = {
  avicola_porcino: Bird,
  secaderos: Wind,
  tambos: Cow,
  agro: Tractor,
  invernaderos: Plant,
  industria_alimenticia: Basket,
  gastronomia_panaderia: Bread,
  hoteleria: Bed,
  lavaderos: WashingMachine,
  asfalto: RoadHorizon,
  calderas: Thermometer,
  hornos: Oven,
  industria_pesada: Factory,
}

export function industryIcon(key: IndustryKey): Icon {
  return INDUSTRY_ICONS[key]
}

/** Iconografía de la interfaz, de la misma familia que la de rubros. */
export const UI_ICONS = {
  cotizador: FileText,
  prospeccion: Target,
  rubros: SquaresFour,
  filtros: SlidersHorizontal,
  ubicacion: Crosshair,
  repetir: MapPin,
  usuario: User,
  detalle: CaretRight,
  recargar: ArrowsClockwise,
} as const

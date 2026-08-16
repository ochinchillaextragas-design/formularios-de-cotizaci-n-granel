/**
 * Puente entre el rubro de prospección y la categoría comercial del cotizador.
 *
 * Son dos vocabularios distintos: prospección clasifica en 13 rubros por uso
 * térmico, y el cotizador ofrece 4 segmentos comerciales. Asignar el rubro
 * directamente al `select` de categoría no funciona —el valor no coincide con
 * ninguna opción y se pierde en silencio—, así que la traducción es explícita.
 *
 * `Record<IndustryKey, CommercialCategory>` obliga a cubrir los 13 rubros:
 * agregar uno nuevo sin decidir su segmento no compila.
 */
import type { IndustryKey } from './types'

/**
 * Segmentos del cotizador que puede originar un prospecto. `residencial` existe
 * en el catálogo pero queda fuera a propósito: la prospección granel busca
 * consumo productivo, no viviendas.
 */
export type CommercialCategory = 'comercial' | 'industrial' | 'agro'

export const INDUSTRY_CATEGORY: Record<IndustryKey, CommercialCategory> = {
  // Industrial: procesos térmicos de planta.
  secaderos: 'industrial',
  industria_alimenticia: 'industrial',
  asfalto: 'industrial',
  calderas: 'industrial',
  hornos: 'industrial',
  industria_pesada: 'industrial',

  // Agro: establecimientos rurales y producción primaria.
  agro: 'agro',
  tambos: 'agro',
  avicola_porcino: 'agro',
  invernaderos: 'agro',

  // Comercial: locales de atención al público.
  gastronomia_panaderia: 'comercial',
  hoteleria: 'comercial',
  lavaderos: 'comercial',
}

export function categoryForIndustry(key: IndustryKey): CommercialCategory {
  return INDUSTRY_CATEGORY[key]
}

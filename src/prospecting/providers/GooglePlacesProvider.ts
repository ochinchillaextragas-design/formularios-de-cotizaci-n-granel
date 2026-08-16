/**
 * Google Places — declarado pero deliberadamente inactivo.
 *
 * Existe para fijar el contrato y que la interfaz muestre el proveedor como
 * disponible-a-futuro, sin llave y sin llamadas. Una API key de Places en el
 * frontend queda expuesta a cualquiera que abra el inspector, así que la
 * integración real tiene que salir desde el backend cuando exista, firmando la
 * petición del lado del servidor.
 *
 * Ver docs/ARQUITECTURA_PROSPECCION.md, sección "Proveedores futuros".
 */
import type { RawElement } from '../types'
import type { ProspectProvider, ProviderAvailability } from './types'
import { ProviderError } from './types'

export const GOOGLE_PLACES_PROVIDER_ID = 'googleplaces'

export function createGooglePlacesProvider(): ProspectProvider {
  return {
    id: GOOGLE_PLACES_PROVIDER_ID,
    label: 'Google Places',
    attribution: '© Google',

    availability(): ProviderAvailability {
      return {
        status: 'unavailable',
        reason: 'Requiere credencial gestionada desde el backend. No se expone una API key en el navegador.',
      }
    },

    // Sin parámetros: una firma con menos argumentos satisface igual el contrato
    // y evita declarar un parámetro que nunca se usa.
    async discover(): Promise<readonly RawElement[]> {
      throw new ProviderError(
        'Google Places todavía no está habilitado como fuente de detección.',
        GOOGLE_PLACES_PROVIDER_ID,
      )
    },
  }
}

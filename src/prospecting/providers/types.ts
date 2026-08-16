/**
 * Contrato de proveedores de detección.
 *
 * Un proveedor sólo sabe encontrar empresas reales y devolverlas sin interpretar.
 * No clasifica, no puntúa y no conoce nada del negocio de GLP: así se puede
 * agregar un proveedor oficial más adelante sin tocar la lógica comercial.
 */
import type { Industry, RawElement } from '../types'

export type DiscoveryRequest = {
  latitude: number
  longitude: number
  radiusMeters: number
  /** Industrias buscadas: el proveedor las traduce a su propio lenguaje de consulta. */
  industries: readonly Industry[]
  limit: number
}

export type ProviderAvailability =
  | { status: 'ready' }
  /** El proveedor existe pero todavía no puede usarse (falta credencial, aprobación, etc.). */
  | { status: 'unavailable'; reason: string }

export type ProspectProvider = {
  id: string
  label: string
  /** Texto de atribución de la fuente, obligatorio para mostrar en la ficha. */
  attribution: string
  availability(): ProviderAvailability
  discover(request: DiscoveryRequest): Promise<readonly RawElement[]>
}

/** Falla de un proveedor externo. Nunca se traga en silencio. */
export class ProviderError extends Error {
  constructor(
    message: string,
    readonly providerId: string,
  ) {
    super(message)
    this.name = 'ProviderError'
  }
}

/**
 * Presentación del nivel de potencial.
 *
 * Vive fuera de los componentes para que la fila y la ficha muestren siempre lo
 * mismo, y para no mezclar constantes con componentes en un mismo archivo.
 */
import type { Priority } from './types'

/** Etiqueta legible. El nivel nunca se comunica sólo por color. */
export function potentialLabel(total: number, priority: Priority): string {
  if (total >= 80) return 'Muy alto'
  if (priority === 'ALTA') return 'Alto'
  if (priority === 'MEDIA') return 'Medio'
  return 'Bajo'
}

/** Barras llenas (1–3) que acompañan a la etiqueta. */
export function potentialBars(priority: Priority): number {
  if (priority === 'ALTA') return 3
  if (priority === 'MEDIA') return 2
  return 1
}

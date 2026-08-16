/**
 * Validación previa a la impresión.
 *
 * Una cotización impresa es un documento que sale de la empresa: no debe salir
 * sin número, sin fecha, sin cliente, con importes negativos ni con una fila de
 * material que suma al total pero no dice qué es. Se valida antes de abrir el
 * diálogo y los errores se muestran dentro de la interfaz, no en un `alert`.
 */
import type { Material, Quotation } from '../types/quotation'

export type ValidationIssue = {
  /** Campo afectado, en lenguaje del usuario. */
  field: string
  message: string
}

/** Acepta lo que un servidor de correo aceptaría; no intenta ser exhaustivo. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim())
}

/** Valores con los que nace una fila de material vacía. */
export const PRISTINE_ROW = { description: '', quantity: 1, unit: 'u', unitPrice: 0 } as const

/**
 * Una fila está intacta sólo si conserva **los cuatro** valores iniciales.
 *
 * Mirar únicamente la descripción no alcanzaba: una fila sin descripción pero
 * con precio cargado suma al total y se imprimía sin decir qué es. Cualquier
 * cambio significativo —precio, cantidad, unidad o descripción— la vuelve una
 * fila en uso, y como tal se valida.
 */
export function isPristineMaterialRow(material: Material): boolean {
  return (
    material.description.trim() === PRISTINE_ROW.description &&
    material.quantity === PRISTINE_ROW.quantity &&
    material.unit.trim() === PRISTINE_ROW.unit &&
    material.unitPrice === PRISTINE_ROW.unitPrice
  )
}

/** `Number.isFinite` descarta NaN, Infinity y -Infinity de una sola vez. */
const isFiniteNumber = (value: number): boolean => Number.isFinite(value)

function checkAmount(
  issues: ValidationIssue[],
  field: string,
  value: number,
  concepto: string,
): void {
  if (!isFiniteNumber(value)) {
    issues.push({ field, message: `${concepto} tiene que ser un número válido.` })
    return
  }
  if (value < 0) {
    issues.push({ field, message: `${concepto} no puede ser negativo.` })
  }
}

export function validateForPrint(quote: Quotation): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = []

  if (!quote.number.trim()) {
    issues.push({ field: 'Número', message: 'Ingresá el número de cotización.' })
  }

  if (!quote.date.trim()) {
    issues.push({ field: 'Fecha', message: 'Ingresá la fecha de la cotización.' })
  }

  if (!quote.customer.name.trim()) {
    issues.push({ field: 'Cliente', message: 'Ingresá el nombre del cliente.' })
  }

  // El correo es opcional, pero si se cargó tiene que servir para enviarla.
  const email = quote.customer.email.trim()
  if (email && !isValidEmail(email)) {
    issues.push({ field: 'Email', message: 'El email no tiene un formato válido.' })
  }

  if (!quote.installation.tankCapacity) {
    issues.push({ field: 'Tanque', message: 'Seleccioná la capacidad del tanque.' })
  }

  checkAmount(issues, 'Consumo', quote.installation.estimatedConsumption, 'El consumo estimado')
  checkAmount(issues, 'Mano de obra', quote.laborHours, 'Las horas')
  checkAmount(issues, 'Mano de obra', quote.hourlyRate, 'El costo por hora')

  quote.materials.forEach((material, index) => {
    if (isPristineMaterialRow(material)) return

    const position = `Material ${index + 1}`

    if (!material.description.trim()) {
      issues.push({ field: position, message: 'Ingresá la descripción o dejá la fila sin usar.' })
    }

    if (!isFiniteNumber(material.quantity)) {
      issues.push({ field: position, message: 'La cantidad tiene que ser un número válido.' })
    } else if (material.quantity < 1) {
      issues.push({ field: position, message: 'La cantidad mínima es 1.' })
    }

    if (!isFiniteNumber(material.unitPrice)) {
      issues.push({ field: position, message: 'El precio unitario tiene que ser un número válido.' })
    } else if (material.unitPrice < 0) {
      issues.push({ field: position, message: 'El precio unitario no puede ser negativo.' })
    }
  })

  return issues
}

import type { Material } from '../types/quotation'

export const IVA_RATE = 0.21

const finiteOrZero = (value: number): number => Number.isFinite(value) ? value : 0

export const materialSubtotal = (quantity: number, unitPrice: number): number =>
  finiteOrZero(finiteOrZero(quantity) * finiteOrZero(unitPrice))

export const materialsSubtotal = (
  materials: ReadonlyArray<Pick<Material, 'quantity' | 'unitPrice'>>,
): number => materials.reduce(
  (total, material) => total + materialSubtotal(material.quantity, material.unitPrice),
  0,
)

export const laborSubtotal = (hours: number, hourlyRate: number): number =>
  finiteOrZero(finiteOrZero(hours) * finiteOrZero(hourlyRate))

export const quotationSubtotal = (materials: number, labor: number): number =>
  finiteOrZero(finiteOrZero(materials) + finiteOrZero(labor))

export const taxAmount = (subtotal: number, rate = IVA_RATE): number =>
  finiteOrZero(finiteOrZero(subtotal) * finiteOrZero(rate))

export const quotationTotal = (subtotal: number, tax: number): number =>
  finiteOrZero(finiteOrZero(subtotal) + finiteOrZero(tax))

export const economicSummary = (materials: number, labor: number) => {
  const subtotal = quotationSubtotal(materials, labor)
  const tax = taxAmount(subtotal)

  return { subtotal, tax, total: quotationTotal(subtotal, tax) }
}

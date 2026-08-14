import { describe, expect, it } from 'vitest'
import {
  economicSummary,
  laborSubtotal,
  materialSubtotal,
  materialsSubtotal,
  quotationSubtotal,
  quotationTotal,
  taxAmount,
} from './calculations'

describe('quotation calculations', () => {
  it('calculates one material subtotal', () => {
    expect(materialSubtotal(3, 1250)).toBe(3750)
  })

  it('adds several materials', () => {
    expect(materialsSubtotal([
      { quantity: 2, unitPrice: 100 },
      { quantity: 3, unitPrice: 50 },
    ])).toBe(350)
  })

  it('supports decimal prices', () => {
    expect(materialSubtotal(2, 10.25)).toBe(20.5)
  })

  it('accepts zero quantity at calculation level', () => {
    expect(materialSubtotal(0, 999)).toBe(0)
  })

  it('calculates labor from hours and hourly rate', () => {
    expect(laborSubtotal(4, 8500)).toBe(34000)
  })

  it('calculates the quotation subtotal', () => {
    expect(quotationSubtotal(15000, 34000)).toBe(49000)
  })

  it('calculates 21 percent VAT', () => {
    expect(taxAmount(49000)).toBe(10290)
  })

  it('calculates the final total', () => {
    expect(quotationTotal(49000, 10290)).toBe(59290)
    expect(economicSummary(15000, 34000)).toEqual({ subtotal: 49000, tax: 10290, total: 59290 })
  })

  it('turns non-finite numeric inputs into zero instead of NaN', () => {
    expect(materialSubtotal(Number(''), 100)).toBe(0)
    expect(materialSubtotal(Number.NaN, 100)).toBe(0)
    expect(laborSubtotal(Number.POSITIVE_INFINITY, 8500)).toBe(0)
    expect(materialSubtotal(Number.MAX_VALUE, 2)).toBe(0)
    expect(economicSummary(Number.NaN, Number.NEGATIVE_INFINITY)).toEqual({ subtotal: 0, tax: 0, total: 0 })
  })
})

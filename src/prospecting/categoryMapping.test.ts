import { describe, expect, it } from 'vitest'
import { categoryForIndustry, INDUSTRY_CATEGORY } from './categoryMapping'
import { ALL_INDUSTRY_KEYS, INDUSTRIES } from './taxonomy'
import { categories } from '../data/catalog'
import type { IndustryKey } from './types'

describe('INDUSTRY_CATEGORY', () => {
  it('cubre los 13 rubros sin dejar ninguno afuera', () => {
    expect(Object.keys(INDUSTRY_CATEGORY)).toHaveLength(INDUSTRIES.length)
    for (const key of ALL_INDUSTRY_KEYS) {
      expect(INDUSTRY_CATEGORY[key]).toBeDefined()
    }
  })

  it('sólo produce categorías que existen en el catálogo del cotizador', () => {
    const validas = Object.keys(categories)
    for (const key of ALL_INDUSTRY_KEYS) {
      expect(validas).toContain(INDUSTRY_CATEGORY[key])
    }
  })

  it('nunca asigna residencial: la prospección granel busca consumo productivo', () => {
    for (const key of ALL_INDUSTRY_KEYS) {
      expect(INDUSTRY_CATEGORY[key]).not.toBe('residencial')
    }
  })
})

describe('categoryForIndustry', () => {
  const esperado: Record<IndustryKey, string> = {
    secaderos: 'industrial',
    industria_alimenticia: 'industrial',
    asfalto: 'industrial',
    calderas: 'industrial',
    hornos: 'industrial',
    industria_pesada: 'industrial',
    agro: 'agro',
    tambos: 'agro',
    avicola_porcino: 'agro',
    invernaderos: 'agro',
    gastronomia_panaderia: 'comercial',
    hoteleria: 'comercial',
    lavaderos: 'comercial',
  }

  for (const [key, categoria] of Object.entries(esperado)) {
    it(`mapea ${key} a ${categoria}`, () => {
      expect(categoryForIndustry(key as IndustryKey)).toBe(categoria)
    })
  }
})

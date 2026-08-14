import { describe, expect, it } from 'vitest'
import { todayLocalISO } from './date'

describe('todayLocalISO', () => {
  it('formats the local calendar date from a fixed date', () => {
    const fixedDate = new Date(2026, 7, 14, 23, 30)

    expect(todayLocalISO(fixedDate)).toBe('2026-08-14')
  })
})

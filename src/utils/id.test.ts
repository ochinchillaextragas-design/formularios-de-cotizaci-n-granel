import { describe, expect, it } from 'vitest'
import { newId } from './id'

describe('newId', () => {
  it('uses randomUUID when it is available', () => {
    const expected = '123e4567-e89b-12d3-a456-426614174000'

    expect(newId({ randomUUID: () => expected })).toBe(expected)
  })

  it('returns a valid fallback when randomUUID is unavailable', () => {
    expect(newId(null)).toMatch(/^id-[a-z0-9]+-[a-z0-9]{8}$/)
  })
})

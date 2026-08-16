import { describe, expect, it } from 'vitest'
import { safeHttpUrl } from './url'

describe('safeHttpUrl', () => {
  it('acepta http y https', () => {
    expect(safeHttpUrl('http://extragas.com.ar/')).toBe('http://extragas.com.ar/')
    expect(safeHttpUrl('https://extragas.com.ar/')).toBe('https://extragas.com.ar/')
  })

  it('rechaza javascript:, que ejecutaría código en el navegador', () => {
    expect(safeHttpUrl('javascript:alert(1)')).toBeUndefined()
  })

  it('rechaza data: y otros esquemas', () => {
    expect(safeHttpUrl('data:text/html,<script>alert(1)</script>')).toBeUndefined()
    expect(safeHttpUrl('file:///etc/passwd')).toBeUndefined()
    expect(safeHttpUrl('ftp://ejemplo.com')).toBeUndefined()
  })

  it('rechaza valores vacíos o no absolutos, como los guarda a veces OSM', () => {
    expect(safeHttpUrl(undefined)).toBeUndefined()
    expect(safeHttpUrl('')).toBeUndefined()
    expect(safeHttpUrl('extragas.com.ar')).toBeUndefined()
  })
})

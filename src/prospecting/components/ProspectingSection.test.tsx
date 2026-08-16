/**
 * @vitest-environment jsdom
 *
 * Prueba de render real: monta la sección completa, incluido Leaflet, y recorre
 * el circuito comercial hasta la cotización. Compilar no garantiza que la
 * pantalla funcione — esta prueba sí.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { ProspectingSection } from './ProspectingSection'
import type { Prospect } from '../types'

// jsdom no implementa ResizeObserver, que el mapa usa para recalcular su tamaño.
// El doble vive acá y no en el código de producción: la API existe en todos los
// navegadores soportados, y envolverla en un `if` escondería un fallo real.
if (!('ResizeObserver' in globalThis)) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

afterEach(cleanup)

/** La búsqueda inicial corre sola contra la captura local, sin red. */
const esperarResultados = async () => {
  await waitFor(() => expect(document.querySelector('.result-row')).not.toBeNull())
}

const abrirFicha = async () => {
  await esperarResultados()
  const fila = document.querySelector('.result-row') as HTMLElement
  fireEvent.click(within(fila).getByRole('button', { name: /Ver perfil/ }))
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeNull())
  return screen.getByRole('dialog')
}

describe('ProspectingSection', () => {
  it('declara el origen real de los datos', () => {
    render(<ProspectingSection onCreateQuotation={() => {}} />)
    expect(screen.getByText(/Empresas reales de OpenStreetMap/)).toBeTruthy()
    expect(screen.getByText(/mismos datos/)).toBeTruthy()
  })

  it('monta el mapa sin romperse', () => {
    const { container } = render(<ProspectingSection onCreateQuotation={() => {}} />)
    const canvas = container.querySelector('.map-canvas')
    expect(canvas).not.toBeNull()
    // Leaflet inyecta sus propios paneles al inicializarse.
    expect(canvas?.querySelector('.leaflet-pane')).not.toBeNull()
  })

  it('lista empresas reales con icono de rubro y score', async () => {
    render(<ProspectingSection onCreateQuotation={() => {}} />)
    await esperarResultados()

    const filas = document.querySelectorAll('.result-row')
    expect(filas.length).toBeGreaterThan(0)
    const primera = filas[0]
    expect(primera.querySelector('.row-icon svg')).not.toBeNull()
    expect(primera.querySelector('.row-score')?.textContent?.trim()).toMatch(/^\d+$/)
    expect(within(primera as HTMLElement).getByRole('button', { name: 'Cotizar' })).toBeTruthy()
  })

  it('muestra el desglose del score en la ficha', async () => {
    render(<ProspectingSection onCreateQuotation={() => {}} />)
    const ficha = await abrirFicha()

    expect(within(ficha).getByText(/Por qué puntúa así/)).toBeTruthy()
    expect(within(ficha).getByText('Fuente del dato')).toBeTruthy()
    expect(within(ficha).getByText(/Ver registro original/)).toBeTruthy()
  })

  it('recorre pipeline y cotización sobre un prospecto real', async () => {
    const onCreateQuotation = vi.fn()
    render(<ProspectingSection onCreateQuotation={onCreateQuotation} />)
    const ficha = await abrirFicha()

    fireEvent.click(within(ficha).getByRole('button', { name: 'Agregar al pipeline' }))
    expect(within(ficha).getByText('En pipeline')).toBeTruthy()

    const responsable = within(ficha).getByPlaceholderText('Nombre del responsable')
    fireEvent.change(responsable, { target: { value: 'Equipo granel' } })
    expect((responsable as HTMLInputElement).value).toBe('Equipo granel')

    fireEvent.click(within(ficha).getByRole('button', { name: 'Crear cotización' }))
    expect(onCreateQuotation).toHaveBeenCalledTimes(1)

    const prospecto = onCreateQuotation.mock.calls[0][0] as Prospect
    expect(prospecto.name.length).toBeGreaterThan(0)
    expect(prospecto.sourceUrl).toContain('openstreetmap.org')
  })

  it('explica el vacío en vez de inventar resultados', async () => {
    render(<ProspectingSection onCreateQuotation={() => {}} />)
    await esperarResultados()

    fireEvent.click(screen.getByRole('button', { name: /Rubros/ }))
    const hoja = screen.getByRole('dialog')
    // Invernaderos no tiene ni una empresa mapeada en el territorio capturado.
    fireEvent.click(within(hoja).getByRole('button', { name: 'Ninguno' }))
    fireEvent.click(within(hoja).getByRole('button', { name: 'Invernaderos' }))
    fireEvent.click(within(hoja).getByRole('button', { name: 'Ver resultados' }))

    await waitFor(() => {
      expect(screen.getByText(/No hay empresas registradas en OpenStreetMap/)).toBeTruthy()
    })
    expect(document.querySelector('.result-row')).toBeNull()
  })
})

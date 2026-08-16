/**
 * @vitest-environment jsdom
 *
 * Teclado y foco de la hoja modal. Son requisitos de accesibilidad que ninguna
 * verificación visual detecta: hay que ejercitarlos.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { Sheet } from './Sheet'

afterEach(cleanup)

/** Envoltorio realista: `onClose` se recrea en cada render, como en la app. */
function Anfitrion({ onClosed }: { onClosed?: () => void }) {
  const [abierta, setAbierta] = useState(false)
  const [texto, setTexto] = useState('')

  return (
    <>
      <button type="button" onClick={() => setAbierta(true)}>
        Abrir ficha
      </button>
      <button type="button">Otro control de la página</button>
      <Sheet
        title="Ficha del prospecto"
        isOpen={abierta}
        onClose={() => {
          setAbierta(false)
          onClosed?.()
        }}
      >
        <input
          placeholder="Nombre del responsable"
          value={texto}
          onChange={event => setTexto(event.target.value)}
        />
        <button type="button">Agregar al pipeline</button>
      </Sheet>
    </>
  )
}

const abrir = () => fireEvent.click(screen.getByRole('button', { name: 'Abrir ficha' }))

describe('Sheet', () => {
  it('no renderiza nada mientras está cerrada', () => {
    render(<Anfitrion />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('se anuncia como diálogo modal con nombre accesible', () => {
    render(<Anfitrion />)
    abrir()
    const dialogo = screen.getByRole('dialog')
    expect(dialogo.getAttribute('aria-modal')).toBe('true')
    expect(dialogo.getAttribute('aria-label')).toBe('Ficha del prospecto')
  })

  it('mueve el foco al panel al abrirse', () => {
    render(<Anfitrion />)
    abrir()
    expect(document.activeElement).toBe(screen.getByRole('dialog'))
  })

  it('cierra con Escape', () => {
    const onClosed = vi.fn()
    render(<Anfitrion onClosed={onClosed} />)
    abrir()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClosed).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('devuelve el foco al control que la abrió', () => {
    render(<Anfitrion />)
    const disparador = screen.getByRole('button', { name: 'Abrir ficha' })
    disparador.focus()
    fireEvent.click(disparador)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(document.activeElement).toBe(disparador)
  })

  it('contiene el foco: Tab desde el último control vuelve al primero', () => {
    render(<Anfitrion />)
    abrir()
    const dialogo = screen.getByRole('dialog')
    const focusables = [...dialogo.querySelectorAll('button, input')] as HTMLElement[]
    const ultimo = focusables[focusables.length - 1]

    ultimo.focus()
    fireEvent.keyDown(document, { key: 'Tab' })

    expect(document.activeElement).toBe(focusables[0])
  })

  it('contiene el foco hacia atrás: Shift+Tab desde el panel va al último', () => {
    render(<Anfitrion />)
    abrir()
    const dialogo = screen.getByRole('dialog')
    const focusables = [...dialogo.querySelectorAll('button, input')] as HTMLElement[]

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })

    expect(document.activeElement).toBe(focusables[focusables.length - 1])
  })

  it('escribir no roba el foco aunque onClose se recree en cada render', () => {
    render(<Anfitrion />)
    abrir()
    const campo = screen.getByPlaceholderText('Nombre del responsable')

    campo.focus()
    fireEvent.change(campo, { target: { value: 'Equipo granel' } })
    expect(document.activeElement).toBe(campo)

    fireEvent.change(campo, { target: { value: 'Equipo granel norte' } })
    expect(document.activeElement).toBe(campo)
    expect((campo as HTMLInputElement).value).toBe('Equipo granel norte')
  })

  it('bloquea el scroll de la página mientras está abierta y lo restituye al cerrar', () => {
    render(<Anfitrion />)
    abrir()
    expect(document.body.style.overflow).toBe('hidden')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(document.body.style.overflow).not.toBe('hidden')
  })
})

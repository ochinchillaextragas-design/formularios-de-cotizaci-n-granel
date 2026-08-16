/**
 * Hoja modal. En móvil sube desde abajo; desde 1024 px se comporta como panel
 * desplegable centrado (lo resuelve `prospecting.css`, no este componente).
 *
 * Contiene el foco mientras está abierta, cierra con Escape y con clic en el
 * fondo, y devuelve el foco al control que la abrió.
 */
import { useEffect, useRef, type ReactNode } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

type Props = {
  title: string
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

export function Sheet({ title, isOpen, onClose, children }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  const onCloseRef = useRef(onClose)

  // `onClose` suele venir como flecha creada en cada render del contenedor. Si
  // entrara en las dependencias del efecto de abajo, éste se reiniciaría en cada
  // pulsación de tecla y devolvería el foco al panel: escribir en "responsable"
  // o "próxima acción" perdería el cursor letra por letra.
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return

    openerRef.current = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()

    // No se usa `offsetParent` para decidir visibilidad: devuelve `null` dentro
    // de cualquier ancestro `position: fixed` —que es exactamente lo que es el
    // fondo de esta hoja—, así que dejaría la lista vacía y el foco sin contener.
    const visibleFocusables = (): HTMLElement[] => {
      const panel = panelRef.current
      if (!panel) return []
      return [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        element => !element.hidden && element.getAttribute('aria-hidden') !== 'true',
      )
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab') return

      // Contención de foco: el tabulador no debe salir a la página de atrás,
      // que está inerte para el usuario pero sigue siendo navegable.
      const focusables = visibleFocusables()
      if (focusables.length === 0) return

      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement

      if (event.shiftKey && (active === first || active === panelRef.current)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      openerRef.current?.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="sheet-backdrop"
      onClick={event => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={panelRef}
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        <div className="sheet-head">
          <h3>{title}</h3>
          <button type="button" className="sheet-close" onClick={onClose}>
            Cerrar
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

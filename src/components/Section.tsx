import { useId, useState, type PropsWithChildren } from 'react'
import { CaretDown, type Icon } from '@phosphor-icons/react'

/**
 * Sección colapsable del cotizador.
 *
 * El cuerpo se oculta con el atributo `hidden`, no desmontando el contenido: así
 * los valores cargados sobreviven a cerrar y volver a abrir la sección.
 *
 * Al imprimir, `prospecting.css` fuerza `display` sobre `[hidden]`, de modo que
 * el documento sale completo aunque en pantalla haya secciones cerradas.
 */
type Props = PropsWithChildren<{
  title: string
  icon: Icon
  className?: string
  defaultOpen?: boolean
}>

export function Section({ title, icon: SectionIcon, children, className = '', defaultOpen = true }: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const bodyId = useId()

  return (
    <section className={`section ${className}`}>
      <h2>
        <button
          type="button"
          className="section-toggle"
          aria-expanded={isOpen}
          aria-controls={bodyId}
          onClick={() => setIsOpen(open => !open)}
        >
          <SectionIcon size={20} weight="fill" aria-hidden />
          <span className="section-title">{title}</span>
          <CaretDown className={`section-caret${isOpen ? '' : ' is-closed'}`} size={18} weight="bold" aria-hidden />
        </button>
      </h2>
      <div id={bodyId} className="section-body" hidden={!isOpen}>
        {children}
      </div>
    </section>
  )
}

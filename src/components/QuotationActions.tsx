import { useState } from 'react'
import { FileText, Target, WarningCircle } from '@phosphor-icons/react'
import logo from '../assets/extragas-logo.png'
import { validateForPrint, type ValidationIssue } from '../utils/quotationValidation'
import type { Quotation } from '../types/quotation'

export type ModuleView = 'cotizador' | 'prospeccion'

type Props = {
  quote: Quotation
  view: ModuleView
  onView: (view: ModuleView) => void
  onSave: () => void
  onReset: () => void
}

// El original renombraba el documento antes de imprimir para que el navegador
// propusiera "Extragas-Cotizacion-<nro>.pdf" en vez del título de la pestaña.
const printQuotation = (quotationNumber: string) => {
  const previousTitle = document.title
  const safeNumber = (quotationNumber || 'sin-numero').replace(/[^a-zA-Z0-9]/g, '-')
  document.title = `Extragas-Cotizacion-${safeNumber}`
  window.print()
  document.title = previousTitle
}

export function QuotationActions({ quote, view, onView, onSave, onReset }: Props) {
  // Lo único que se guarda es si ya se intentó imprimir. Los errores se derivan
  // de la cotización actual en cada render: así, al corregir un campo su error
  // desaparece solo —y los demás siguen— sin arrastrar una lista vieja.
  const [hasAttemptedPrint, setHasAttemptedPrint] = useState(false)
  const issues: readonly ValidationIssue[] = hasAttemptedPrint ? validateForPrint(quote) : []

  // La cotización impresa sale de la empresa: se valida antes de abrir el
  // diálogo, y los errores se muestran acá mismo en vez de en un `alert`.
  const handlePrint = () => {
    setHasAttemptedPrint(true)
    if (validateForPrint(quote).length > 0) return
    printQuotation(quote.number)
  }

  return (
    <nav className="toolbar" aria-label="Navegación principal">
      <div className="toolbar-brand">
        <img className="brand-logo" src={logo} alt="Extragas" width={700} height={198} />
        <span className="brand-tag">Gas GLP a Granel</span>
      </div>

      {/* Hermano de la marca, no hijo: así la grilla puede llevarlo al extremo
          derecho en escritorio sin duplicar el marcado. */}
      <button type="button" className="user-chip" aria-label="Cuenta de usuario">
        AR
      </button>

      {/* Dos destinos equivalentes. `aria-current` marca el activo para lectores
          de pantalla; el color por sí solo no alcanzaría. */}
      <div className="module-nav">
        <button
          type="button"
          className="module-tab"
          aria-current={view === 'cotizador' ? 'page' : undefined}
          onClick={() => onView('cotizador')}
        >
          <FileText size={22} weight={view === 'cotizador' ? 'fill' : 'regular'} aria-hidden />
          Cotizador
        </button>
        <button
          type="button"
          className="module-tab"
          aria-current={view === 'prospeccion' ? 'page' : undefined}
          onClick={() => onView('prospeccion')}
        >
          <Target size={22} weight={view === 'prospeccion' ? 'fill' : 'regular'} aria-hidden />
          Prospección
        </button>
      </div>

      {view === 'cotizador' && (
        <div className="toolbar-actions">
          <button type="button" onClick={handlePrint}>
            Descargar PDF
          </button>
          <button type="button" onClick={onSave}>
            Guardar borrador
          </button>
          {/* No se limpia la validación acá: `App` confirma primero y sólo
              después reinicia cotización y errores. Hacerlo antes borraba los
              mensajes aunque el usuario cancelara. */}
          <button type="button" onClick={onReset}>
            Nueva cotización
          </button>
        </div>
      )}

      {/* Barra inferior sólo en teléfono: la mayoría cotiza desde el celular y
          el formulario es largo. Respeta el área segura, no se imprime y en
          escritorio no existe. */}
      {view === 'cotizador' && (
        <div className="mobile-actions">
          <button type="button" className="ma-primary" onClick={handlePrint}>
            Descargar PDF
          </button>
          <button type="button" onClick={onSave}>
            Guardar
          </button>
          <button type="button" onClick={onReset}>
            Nueva
          </button>
        </div>
      )}

      {view === 'cotizador' && issues.length > 0 && (
        <div className="print-errors" role="alert">
          <p>
            <WarningCircle size={18} weight="fill" aria-hidden />
            Faltan datos para emitir la cotización:
          </p>
          <ul>
            {issues.map((issue, index) => (
              <li key={`${issue.field}-${index}`}>
                <b>{issue.field}:</b> {issue.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  )
}

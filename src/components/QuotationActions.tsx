type Props = { quotationNumber: string; onSave: () => void; onReset: () => void }

// El original renombraba el documento antes de imprimir para que el navegador
// propusiera "Extragas-Cotizacion-<nro>.pdf" en vez del título de la pestaña.
const printQuotation = (quotationNumber: string) => {
  const previousTitle = document.title
  const safeNumber = (quotationNumber || 'sin-numero').replace(/[^a-zA-Z0-9]/g, '-')
  document.title = `Extragas-Cotizacion-${safeNumber}`
  window.print()
  document.title = previousTitle
}

export function QuotationActions({ quotationNumber, onSave, onReset }: Props) {
  const legacyUrl = `${import.meta.env.BASE_URL}legacy/cotizador-original.html`

  return (
    <nav className="toolbar">
      <strong>Extragas · Cotizador GLP a Granel</strong>
      <div>
        <button type="button" onClick={() => printQuotation(quotationNumber)}>Descargar PDF</button>
        <button type="button" onClick={onSave}>Guardar borrador</button>
        <button type="button" onClick={onReset}>Nueva cotización</button>
        <a href={legacyUrl}>Abrir original</a>
      </div>
    </nav>
  )
}

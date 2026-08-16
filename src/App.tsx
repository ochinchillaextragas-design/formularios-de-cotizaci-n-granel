import { lazy, Suspense, useState } from 'react'
import { Layout } from './components/Layout'
import { Header } from './components/Header'
import { CustomerData } from './components/CustomerData'
import { InstallationData } from './components/InstallationData'
import { TankSelector } from './components/TankSelector'
import { TechnicalPlan } from './components/TechnicalPlan'
import { Materials } from './components/Materials'
import { Labor } from './components/Labor'
import { EconomicSummary } from './components/EconomicSummary'
import { Conditions } from './components/Conditions'
import { QuotationActions } from './components/QuotationActions'
import type { ModuleView } from './components/QuotationActions'
// Prospección carga aparte: Leaflet, la captura de OSM y la iconografía sólo se
// descargan si el usuario entra al módulo, y no pesan sobre el cotizador.
const ProspectingSection = lazy(() =>
  import('./prospecting/components/ProspectingSection').then(module => ({
    default: module.ProspectingSection,
  })),
)
import { defaultConditions, presetFor, tankByValue, type MaterialPreset } from './data/catalog'
import { newId } from './utils/id'
import { todayLocalISO } from './utils/date'
import { laborSubtotal, materialsSubtotal } from './utils/calculations'
import { isPristineMaterialRow } from './utils/quotationValidation'
import type { Quotation } from './types/quotation'
import type { Prospect } from './prospecting/types'
import { categoryForIndustry } from './prospecting/categoryMapping'

const emptyMaterial = () => ({ id: newId(), description: '', quantity: 1, unit: 'u', unitPrice: 0 })

const initial = (): Quotation => ({
  number: '001-2026',
  date: todayLocalISO(),
  customer: { name: '', taxId: '', phone: '', email: '', address: '', city: '', province: '' },
  installation: { category: '', type: '', estimatedConsumption: 0, tankCapacity: '', tankLocation: '', notes: '' },
  materials: Array.from({ length: 3 }, emptyMaterial),
  laborHours: 0,
  hourlyRate: 8500,
  conditions: defaultConditions,
})

export default function App() {
  const [quote, setQuote] = useState(initial)
  const [view, setView] = useState<ModuleView>('cotizador')
  // Cambiar esta clave remonta la barra y descarta el estado de validación, para
  // que no queden mensajes de una cotización que ya no está en pantalla.
  const [validationKey, setValidationKey] = useState(0)
  const resetValidation = () => setValidationKey(key => key + 1)

  const changeView = (next: ModuleView) => {
    resetValidation()
    setView(next)
  }

  const materials = materialsSubtotal(quote.materials)
  const labor = laborSubtotal(quote.laborHours, quote.hourlyRate)

  const patch = <K extends keyof Quotation>(key: K, value: Quotation[K]) =>
    setQuote(q => ({ ...q, [key]: value }))

  // Cierre del circuito prospección → cotización.
  //
  // Parte SIEMPRE de `initial()`, nunca de la cotización en pantalla: si se
  // partiera de la anterior, el CUIT, el email, los materiales, el tanque o las
  // condiciones editadas del cliente previo viajarían al nuevo prospecto sin que
  // nadie lo note. Sólo se precarga lo que el prospecto publica; lo que no
  // publica queda vacío.
  const quoteFromProspect = (prospect: Prospect) => {
    const fresh = initial()
    setQuote({
      ...fresh,
      customer: {
        ...fresh.customer,
        name: prospect.name,
        phone: prospect.phone ?? '',
        address: prospect.address ?? '',
        city: prospect.city ?? '',
      },
      installation: {
        ...fresh.installation,
        category: categoryForIndustry(prospect.industry),
        sourceIndustry: prospect.industryLabel,
      },
    })
    resetValidation()
    setView('cotizador')
  }

  /**
   * Aplica un preset como UNA sola operación: materiales y tanque juntos.
   *
   * Si se hicieran por separado quedaría un estado intermedio contradictorio
   * —materiales de 7.300 L con el selector todavía en 6.000 L—, que es
   * exactamente lo que se detectó en la revisión anterior.
   */
  const applyPreset = () => {
    const preset: MaterialPreset | undefined = presetFor(quote.installation.type)
    if (!preset) return

    const cargados = quote.materials.filter(material => !isPristineMaterialRow(material)).length
    const tanque = tankByValue(preset.tankCapacity)
    const tanqueActual = tankByValue(quote.installation.tankCapacity)

    if (cargados > 0) {
      const cambioDeTanque =
        tanqueActual && tanqueActual.value !== preset.tankCapacity
          ? `\n• El tanque pasará de ${tanqueActual.label} a ${tanque?.label}.`
          : `\n• Se seleccionará el tanque de ${tanque?.label}.`
      const confirmado = confirm(
        `Se va a cargar la configuración sugerida para “${preset.name}”.` +
          `\n\n• Se reemplazarán los ${cargados} materiales cargados por los ${preset.items.length} del preset.` +
          cambioDeTanque +
          `\n\n¿Continuar?`,
      )
      // Cancelar no deja nada a medias: ni tanque ni materiales cambian.
      if (!confirmado) return
    }

    setQuote(q => ({
      ...q,
      materials: preset.items.map(item => ({
        id: newId(),
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
      })),
      installation: { ...q.installation, tankCapacity: preset.tankCapacity },
    }))
  }

  // La confirmación va PRIMERO: si se cancela, no se toca ni la cotización ni
  // los errores en pantalla.
  const resetQuotation = () => {
    if (!confirm('¿Crear una nueva cotización?')) return
    setQuote(initial())
    resetValidation()
  }

  return (
    <>
      <QuotationActions
        key={validationKey}
        quote={quote}
        view={view}
        onView={changeView}
        onSave={() => alert('Persistencia desacoplada y reservada para una fase posterior.')}
        onReset={resetQuotation}
      />

      {view === 'prospeccion' ? (
        // Prospección no usa el contenedor `.page`: el mapa necesita todo el
        // ancho disponible, no el ancho de una hoja A4.
        <Suspense fallback={<p style={{ padding: 24, color: '#5b6577' }}>Cargando prospección…</p>}>
          <ProspectingSection onCreateQuotation={quoteFromProspect} />
        </Suspense>
      ) : (
        <Layout>
          <Header
            number={quote.number}
            date={quote.date}
            onNumber={v => patch('number', v)}
            onDate={v => patch('date', v)}
          />
          <div className="hero">
            <b>Servicio técnico propio</b>
            <span>Instalación, carga y mantenimiento de sistemas a granel</span>
          </div>
          <CustomerData value={quote.customer} onChange={v => patch('customer', v)} />
          <InstallationData value={quote.installation} onChange={v => patch('installation', v)} />
          <TankSelector
            capacity={quote.installation.tankCapacity}
            onChange={v => patch('installation', { ...quote.installation, tankCapacity: v })}
          />
          <TechnicalPlan capacity={quote.installation.tankCapacity} />
          <Materials
            items={quote.materials}
            preset={presetFor(quote.installation.type)}
            onApplyPreset={applyPreset}
            onChange={v => patch('materials', v)}
          />
          <Labor
            hours={quote.laborHours}
            rate={quote.hourlyRate}
            onHours={v => patch('laborHours', v)}
            onRate={v => patch('hourlyRate', v)}
          />
          <EconomicSummary materials={materials} labor={labor} />
          <Conditions value={quote.conditions} onChange={v => patch('conditions', v)} />
          <footer>
            Estamos. Tu energía, nuestra responsabilidad.
            <small>
              CAÑUELAS GAS S.A. · Planta Cañuelas: Ruta 205 km 69,500 – 1814 – Cañuelas, Buenos Aires, Argentina
              <br />
              Tel / Fax. 0226 – 4320000 · granel@extragas.com.ar · www.extragas.com.ar
            </small>
          </footer>
        </Layout>
      )}
    </>
  )
}

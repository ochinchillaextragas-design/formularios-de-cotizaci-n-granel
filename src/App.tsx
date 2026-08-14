import { useState } from 'react'
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
import { defaultConditions } from './data/catalog'
import { newId } from './utils/id'
import { todayLocalISO } from './utils/date'
import { laborSubtotal, materialsSubtotal } from './utils/calculations'
import type { Quotation } from './types/quotation'

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

  const materials = materialsSubtotal(quote.materials)
  const labor = laborSubtotal(quote.laborHours, quote.hourlyRate)

  const patch = <K extends keyof Quotation>(key: K, value: Quotation[K]) =>
    setQuote(q => ({ ...q, [key]: value }))

  return (
    <>
      <QuotationActions
        quotationNumber={quote.number}
        onSave={() => alert('Persistencia desacoplada y reservada para una fase posterior.')}
        onReset={() => confirm('¿Crear una nueva cotización?') && setQuote(initial())}
      />
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
        <Materials items={quote.materials} onChange={v => patch('materials', v)} />
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
    </>
  )
}

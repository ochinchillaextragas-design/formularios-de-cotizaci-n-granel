import { Calculator, WarningCircle } from '@phosphor-icons/react'
import { economicSummary } from '../utils/calculations'
import { formatMoney } from '../utils/money'
import { DEMO_PRICING_NOTICE } from '../data/catalog'
import { Section } from './Section'

export function EconomicSummary({ materials, labor }: { materials: number; labor: number }) {
  const { tax, total } = economicSummary(materials, labor)

  return (
    <Section title="Resumen Económico" icon={Calculator}>
      <div className="totals">
        <p><span>Subtotal Materiales</span><b>{formatMoney(materials)}</b></p>
        <p><span>Subtotal Mano de Obra</span><b>{formatMoney(labor)}</b></p>
        <p><span>IVA (21%)</span><b>{formatMoney(tax)}</b></p>
        <p className="grand"><span>TOTAL</span><b>{formatMoney(total)}</b></p>
        <small>Precios expresados en pesos argentinos. No incluyen flete ni conexión si no se especifica.</small>
      </div>

      {/* Permanente y no derivado del contenido: si dependiera de las
          descripciones, editar una fila lo haría desaparecer mientras los
          importes siguen siendo los de la demostración. Se imprime. */}
      <p className="demo-notice" role="note">
        <WarningCircle size={18} weight="fill" aria-hidden />
        {DEMO_PRICING_NOTICE}
      </p>
    </Section>
  )
}

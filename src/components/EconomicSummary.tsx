import { economicSummary } from '../utils/calculations'
import { formatMoney } from '../utils/money'
import { Section } from './Section'

export function EconomicSummary({ materials, labor }: { materials: number; labor: number }) {
  const { tax, total } = economicSummary(materials, labor)

  return <Section title="💰 Resumen Económico"><div className="totals"><p><span>Subtotal Materiales</span><b>{formatMoney(materials)}</b></p><p><span>Subtotal Mano de Obra</span><b>{formatMoney(labor)}</b></p><p><span>IVA (21%)</span><b>{formatMoney(tax)}</b></p><p className="grand"><span>TOTAL</span><b>{formatMoney(total)}</b></p><small>Precios expresados en pesos argentinos. No incluyen flete ni conexión si no se especifica.</small></div></Section>
}

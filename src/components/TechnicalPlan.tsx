import { ArrowsOutSimple, Ruler } from '@phosphor-icons/react'
import { PLAN_TECHNICAL_NOTICE, planStatusFor, tankByValue } from '../data/catalog'
import { Section } from './Section'

/**
 * Plano técnico de la capacidad elegida.
 *
 * El SVG se sirve como archivo aparte y se muestra con `<img>`: conserva la
 * relación de aspecto A4 apaisada del original (viewBox 1400×990) sin recortes
 * ni deformación, y escala nítido en teléfono, escritorio e impresión.
 */
export function TechnicalPlan({ capacity }: { capacity: string }) {
  const tank = tankByValue(capacity)

  if (!tank) {
    return (
      <Section title="Plano Técnico" icon={Ruler}>
        <p className="empty">Seleccioná la capacidad del tanque para asociar el plano de referencia.</p>
      </Section>
    )
  }

  const plan = planStatusFor(tank.value)

  return (
    <Section title="Plano Técnico" icon={Ruler}>
      {plan.kind === 'available' ? (
        <figure className="tank-plan-figure">
          <img
            className="tank-plan"
            src={plan.asset}
            width={1400}
            height={990}
            alt={`Plano técnico de referencia Extragas ${plan.documentCode}: instalación de GLP a granel para tanque de ${tank.label} (${tank.cubicMeters}), con vista lateral, vista superior, platea, distancias de seguridad y componentes.`}
          />
          <figcaption>
            <strong>
              {plan.documentCode} · {tank.label} · {tank.cubicMeters}
            </strong>
            <span>{PLAN_TECHNICAL_NOTICE}</span>
          </figcaption>

          {/* En un teléfono el plano entra completo pero las cotas quedan
              chicas. Se abre el SVG original en una pestaña nueva, donde el
              navegador permite ampliar: no se incrusta ni se modifica el
              archivo. `rel` evita que la pestaña destino acceda al `opener`. */}
          <a
            className="plan-zoom"
            href={plan.asset}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Ampliar el plano técnico de ${tank.label} en una pestaña nueva`}
          >
            <ArrowsOutSimple size={20} weight="bold" aria-hidden />
            Ampliar plano
          </a>
        </figure>
      ) : (
        // Sin plano fuente no se reutiliza el de otra capacidad ni se dibuja
        // una ilustración: se dice que falta.
        <div className="plan-placeholder">
          <strong>
            Tanque de {tank.label} · {tank.cubicMeters}
          </strong>
          <p>Plano técnico pendiente de incorporación.</p>
        </div>
      )}
    </Section>
  )
}

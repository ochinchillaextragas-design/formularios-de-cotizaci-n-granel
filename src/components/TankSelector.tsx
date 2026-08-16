import { Cylinder } from '@phosphor-icons/react'
import { planStatusFor, tankByValue, tankCapacities } from '../data/catalog'
import { Section } from './Section'

/**
 * Selector visual de capacidad.
 *
 * Escribe el mismo estado que el desplegable de "Capacidad del tanque" en Datos
 * de Instalación, así que ambos quedan sincronizados por construcción: no hay
 * dos fuentes de verdad que puedan divergir.
 */
export function TankSelector({ capacity, onChange }: { capacity: string; onChange: (v: string) => void }) {
  const selected = tankByValue(capacity)
  const plan = selected ? planStatusFor(selected.value) : null

  return (
    <Section title="Selector de Tanque" icon={Cylinder}>
      <div className="tank-options">
        {tankCapacities.map(tank => (
          <button
            type="button"
            key={tank.value}
            className={capacity === tank.value ? 'selected' : ''}
            aria-pressed={capacity === tank.value}
            onClick={() => onChange(tank.value)}
          >
            <b>{tank.label}</b>
            <span>{tank.cubicMeters}</span>
          </button>
        ))}
      </div>

      {selected && plan && (
        <div className="tank-detail">
          <h3>
            {selected.label} <span>· {selected.cubicMeters}</span>
          </h3>
          <p>{selected.description}</p>
          <p className={`tank-plan-state${plan.kind === 'pending' ? ' is-pending' : ''}`}>
            {plan.kind === 'pending'
              ? 'Plano técnico pendiente de incorporación'
              : 'Plano técnico disponible'}
          </p>
        </div>
      )}
    </Section>
  )
}

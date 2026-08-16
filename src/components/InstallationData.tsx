import { Wrench } from '@phosphor-icons/react'
import type { Installation } from '../types/quotation'
import { categories, categoryLabels, tankCapacities } from '../data/catalog'
import { Section } from './Section'

const TANK_LOCATIONS = ['Aéreo (sobre base)', 'Enterrado', 'Semienterrado', 'Zunchado a pared']

type Props = { value: Installation; onChange: (v: Installation) => void }

export function InstallationData({ value, onChange }: Props) {
  const field = (key: keyof Installation, next: string | number) => onChange({ ...value, [key]: next })
  const types = categories[value.category] ?? []

  return (
    <Section title="Datos de Instalación" icon={Wrench}>
      <div className="grid">
        <label>
          Categoría
          <select
            value={value.category}
            onChange={e => onChange({ ...value, category: e.target.value, type: '' })}
          >
            <option value="">Seleccionar...</option>
            {Object.keys(categories).map(c => (
              <option key={c} value={c}>{categoryLabels[c] ?? c}</option>
            ))}
          </select>
        </label>

        <label>
          Tipo específico
          <select value={value.type} onChange={e => field('type', e.target.value)}>
            <option value="">Seleccionar...</option>
            {types.map(t => <option key={t}>{t}</option>)}
          </select>
        </label>

        {/* Rubro exacto detectado en prospección. Se muestra sólo si viene de
            ahí, y no es editable: es la trazabilidad del origen del prospecto. */}
        {value.sourceIndustry && (
          <label className="wide">
            Rubro detectado en prospección
            <input value={value.sourceIndustry} readOnly />
          </label>
        )}

        <label>
          Consumo estimado (m³/mes)
          <input
            type="number"
            min="0"
            value={value.estimatedConsumption || ''}
            onChange={e => field('estimatedConsumption', Number(e.target.value))}
          />
        </label>

        <label>
          Capacidad del tanque
          <select value={value.tankCapacity} onChange={e => field('tankCapacity', e.target.value)}>
            <option value="">Seleccionar...</option>
            {tankCapacities.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </label>

        <label>
          Ubicación del tanque
          <select value={value.tankLocation} onChange={e => field('tankLocation', e.target.value)}>
            <option value="">Seleccionar...</option>
            {TANK_LOCATIONS.map(x => <option key={x}>{x}</option>)}
          </select>
        </label>

        <label className="wide">
          Observaciones
          <textarea value={value.notes} onChange={e => field('notes', e.target.value)} />
        </label>
      </div>
    </Section>
  )
}

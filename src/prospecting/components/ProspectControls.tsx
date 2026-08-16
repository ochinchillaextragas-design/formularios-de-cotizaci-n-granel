/**
 * Controles de búsqueda: localidad, rubros y filtros.
 *
 * Tres accesos de 48 px que caben en una mano y no desbordan a 375 px. El
 * detalle vive dentro de hojas, para no gastar en filtros el espacio que
 * necesita el mapa.
 */
import { Check, MagnifyingGlass } from '@phosphor-icons/react'
import { Sheet } from './Sheet'
import { INDUSTRIES } from '../taxonomy'
import { DEMO_LOCALITIES } from '../localities'
import { INDUSTRY_ICONS, UI_ICONS } from '../icons'
import type { IndustryKey } from '../types'

export type OpenSheet = 'none' | 'rubros' | 'filtros'

type Props = {
  locality: string
  onLocality: (value: string) => void
  radiusKm: number
  onRadius: (value: number) => void
  maxResults: number
  onMaxResults: (value: number) => void
  industries: readonly IndustryKey[]
  onIndustries: (value: readonly IndustryKey[]) => void
  activeFilterCount: number
  openSheet: OpenSheet
  onOpenSheet: (sheet: OpenSheet) => void
  onApply: () => void
}

export function ProspectControls({
  locality,
  onLocality,
  radiusKm,
  onRadius,
  maxResults,
  onMaxResults,
  industries,
  onIndustries,
  activeFilterCount,
  openSheet,
  onOpenSheet,
  onApply,
}: Props) {
  const selected = new Set(industries)
  const allSelected = selected.size === INDUSTRIES.length

  const toggle = (key: IndustryKey) => {
    const next = new Set(selected)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    onIndustries(INDUSTRIES.map(i => i.key).filter(k => next.has(k)))
  }

  const close = () => onOpenSheet('none')
  const apply = () => {
    close()
    onApply()
  }

  return (
    <>
      <div className="p-controls">
        <button
          type="button"
          className="p-chip p-chip-locality"
          aria-expanded={openSheet === 'filtros'}
          onClick={() => onOpenSheet('filtros')}
        >
          <MagnifyingGlass size={20} weight="bold" aria-hidden />
          <span>
            {locality} · {radiusKm} km
          </span>
        </button>

        <button
          type="button"
          className="p-chip"
          aria-expanded={openSheet === 'rubros'}
          onClick={() => onOpenSheet('rubros')}
        >
          <UI_ICONS.rubros size={20} weight="bold" aria-hidden />
          <span>Rubros</span>
          {!allSelected && <span className="p-chip-count">{selected.size}</span>}
        </button>

        <button
          type="button"
          className="p-chip"
          aria-expanded={openSheet === 'filtros'}
          onClick={() => onOpenSheet('filtros')}
        >
          <UI_ICONS.filtros size={20} weight="bold" aria-hidden />
          <span>Filtros</span>
          {activeFilterCount > 0 && <span className="p-chip-count">{activeFilterCount}</span>}
        </button>
      </div>

      <Sheet title="Rubros a buscar" isOpen={openSheet === 'rubros'} onClose={close}>
        <div className="industry-grid">
          {INDUSTRIES.map(industry => {
            const Icon = INDUSTRY_ICONS[industry.key]
            const isOn = selected.has(industry.key)
            return (
              <button
                key={industry.key}
                type="button"
                className="industry-option"
                aria-pressed={isOn}
                onClick={() => toggle(industry.key)}
              >
                <Icon size={22} weight={isOn ? 'fill' : 'regular'} aria-hidden />
                <span>{industry.label}</span>
                <Check className="opt-check" size={19} weight="bold" aria-hidden />
              </button>
            )
          })}
        </div>
        <div className="sheet-actions">
          <button
            type="button"
            className="sheet-clear"
            onClick={() => onIndustries(allSelected ? [] : INDUSTRIES.map(i => i.key))}
          >
            {allSelected ? 'Ninguno' : 'Todos'}
          </button>
          <button type="button" className="sheet-apply" onClick={apply} disabled={selected.size === 0}>
            Ver resultados
          </button>
        </div>
      </Sheet>

      <Sheet title="Filtros de búsqueda" isOpen={openSheet === 'filtros'} onClose={close}>
        <label className="sheet-field">
          Localidad
          <select value={locality} onChange={event => onLocality(event.target.value)}>
            {DEMO_LOCALITIES.map(item => (
              <option key={item.name} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label className="sheet-field">
          Radio de búsqueda
          <input
            type="range"
            min={2}
            max={35}
            step={1}
            value={radiusKm}
            onChange={event => onRadius(Number(event.target.value))}
          />
          <output>{radiusKm} km</output>
        </label>

        <label className="sheet-field">
          Máximo de resultados
          <input
            type="number"
            min={1}
            max={200}
            value={maxResults}
            onChange={event =>
              onMaxResults(Math.max(1, Math.min(200, Number(event.target.value) || 1)))
            }
          />
        </label>

        <div className="sheet-actions">
          <button type="button" className="sheet-apply" onClick={apply}>
            Aplicar
          </button>
        </div>
      </Sheet>
    </>
  )
}

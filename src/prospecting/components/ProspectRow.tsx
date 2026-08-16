/**
 * Fila de resultado. Plana a propósito: sin tarjeta dentro de tarjeta, sólo una
 * línea divisoria. El detalle completo vive en la ficha, no acá.
 *
 * No lleva botón de WhatsApp: repetirlo en cada fila compite con la acción
 * principal. WhatsApp aparece dentro de la ficha del prospecto.
 */
import { INDUSTRY_ICONS, UI_ICONS } from '../icons'
import { potentialBars, potentialLabel } from '../potential'
import type { Prospect } from '../types'

type Props = {
  prospect: Prospect
  onQuote: () => void
  onOpenDetail: () => void
}

export function ProspectRow({ prospect, onQuote, onOpenDetail }: Props) {
  const Icon = INDUSTRY_ICONS[prospect.industry]
  const { score } = prospect
  const level = potentialLabel(score.total, score.priority)
  const bars = potentialBars(score.priority)

  return (
    <div className="result-row">
      <div
        className={`row-score pot-${score.priority}`}
        aria-label={`Potencial ${score.total} de 100, nivel ${level}`}
      >
        {score.total}
      </div>

      <div className="row-icon" aria-hidden>
        <Icon size={24} weight="fill" />
      </div>

      <div className="row-main">
        <h3 className="row-name">{prospect.name}</h3>
        <p className="row-meta">
          <span>{prospect.industryLabel}</span>
          <span className="sep" aria-hidden>
            ·
          </span>
          <span>{prospect.distanceKm.toFixed(1)} km</span>
          <span className="sep" aria-hidden>
            ·
          </span>
          <span className={`row-pot pot-${score.priority}`}>
            <span className={`pot-bars lvl-${bars}`} aria-hidden>
              <i />
              <i />
              <i />
            </span>
            {level}
          </span>
        </p>
      </div>

      <div className="row-actions">
        <button type="button" className="btn-quote" onClick={onQuote}>
          Cotizar
        </button>
        <button type="button" className="btn-profile" onClick={onOpenDetail}>
          <UI_ICONS.usuario size={18} weight="bold" aria-hidden />
          Ver perfil
        </button>
      </div>
    </div>
  )
}

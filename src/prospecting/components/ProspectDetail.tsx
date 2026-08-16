/**
 * Ficha del prospecto. Se abre desde "Ver perfil" y concentra todo lo que no
 * entra en una fila: desglose del score, contacto, origen del dato y las
 * acciones comerciales.
 *
 * WhatsApp vive acá —no en cada fila del listado— y sólo aparece cuando la
 * empresa publica un teléfono. Sin teléfono no se inventa un canal.
 */
import { WhatsappLogo } from '@phosphor-icons/react'
import { INDUSTRY_ICONS } from '../icons'
import { potentialLabel } from '../potential'
import { safeHttpUrl } from '../url'
import type { Assignment, Prospect } from '../types'

const STAGE_LABEL: Record<Assignment['stage'], string> = {
  sin_asignar: 'Sin asignar',
  en_pipeline: 'En pipeline',
  cotizacion_creada: 'Cotización creada',
}

/** wa.me exige sólo dígitos; los teléfonos de OSM vienen con espacios y guiones. */
function whatsappUrl(phone: string, name: string): string {
  const digits = phone.replace(/\D/g, '')
  const text = encodeURIComponent(
    `Hola ${name}, les escribo de Extragas por el servicio de GLP a granel.`,
  )
  return `https://wa.me/${digits}?text=${text}`
}

type Props = {
  prospect: Prospect
  assignment?: Assignment
  onAddToPipeline: () => void
  onRemoveFromPipeline: () => void
  onCreateQuotation: () => void
  onAssignmentChange: (patch: Partial<Assignment>) => void
}

export function ProspectDetail({
  prospect,
  assignment,
  onAddToPipeline,
  onRemoveFromPipeline,
  onCreateQuotation,
  onAssignmentChange,
}: Props) {
  const Icon = INDUSTRY_ICONS[prospect.industry]
  const { score } = prospect
  const inPipeline = assignment !== undefined && assignment.stage !== 'sin_asignar'
  const level = potentialLabel(score.total, score.priority)
  // El sitio web lo edita cualquiera en OSM: sólo se enlaza si es http/https.
  const websiteUrl = safeHttpUrl(prospect.website)
  const sourceUrl = safeHttpUrl(prospect.sourceUrl)
  const mapsUrl = safeHttpUrl(prospect.googleMapsUrl)

  return (
    <div className="detail">
      <div className="detail-top">
        <div className="row-icon" aria-hidden>
          <Icon size={28} weight="fill" />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h3>{prospect.name}</h3>
          <p className="row-meta" style={{ marginTop: 6 }}>
            <span>{prospect.industryLabel}</span>
            <span className="sep" aria-hidden>
              ·
            </span>
            <span>{prospect.distanceKm.toFixed(1)} km</span>
          </p>
        </div>
        <div className={`row-score pot-${score.priority}`} aria-label={`Potencial ${score.total}`}>
          {score.total}
        </div>
      </div>

      {inPipeline && assignment && (
        <p style={{ marginTop: 0 }}>
          <span className={`stage-chip stage-${assignment.stage}`}>
            {STAGE_LABEL[assignment.stage]}
          </span>
        </p>
      )}

      <div className="detail-block">
        <h4>Por qué puntúa así · potencial {level}</h4>
        <ul className="breakdown">
          {score.breakdown.map((line, index) => (
            <li key={`${line.category}-${index}`} className={line.points < 0 ? 'neg' : undefined}>
              <span>{line.reason}</span>
              <b>
                {line.points > 0 ? '+' : ''}
                {line.points}
              </b>
            </li>
          ))}
        </ul>
      </div>

      <div className="detail-block">
        <h4>Contacto</h4>
        <div className="contact">
          {prospect.phone ? (
            <a href={`tel:${prospect.phone}`}>{prospect.phone}</a>
          ) : (
            <span className="muted">Sin teléfono publicado</span>
          )}
          {websiteUrl ? (
            <a href={websiteUrl} target="_blank" rel="noopener noreferrer">
              Sitio web
            </a>
          ) : (
            <span className="muted">Sin sitio web publicado</span>
          )}
          {prospect.address || prospect.city ? (
            <span>{[prospect.address, prospect.city].filter(Boolean).join(', ')}</span>
          ) : (
            <span className="muted">Sin dirección publicada</span>
          )}
        </div>
      </div>

      <div className="detail-block">
        <h4>Fuente del dato</h4>
        <div className="contact">
          {sourceUrl && (
            <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
              Ver registro original en {prospect.sourceLabel}
            </a>
          )}
          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
              Abrir en Google Maps
            </a>
          )}
        </div>
        <div className="confidence-bar" aria-hidden>
          <i style={{ width: `${score.dataConfidence}%` }} />
        </div>
        <small style={{ fontSize: 12, color: '#5b6577' }}>
          Calidad del dato {score.dataConfidence}% · clasificación {prospect.confidence}%
        </small>
      </div>

      {inPipeline && assignment && (
        <div className="assignment">
          <label>
            Responsable comercial
            <input
              value={assignment.owner}
              placeholder="Nombre del responsable"
              onChange={event => onAssignmentChange({ owner: event.target.value })}
            />
          </label>
          <label>
            Próxima acción
            <input
              list="acciones-sugeridas"
              value={assignment.nextAction}
              placeholder="Ej.: llamar para relevamiento"
              onChange={event => onAssignmentChange({ nextAction: event.target.value })}
            />
          </label>
          <datalist id="acciones-sugeridas">
            <option value="Llamar para relevamiento" />
            <option value="Visitar planta" />
            <option value="Enviar cotización" />
            <option value="Reunión técnica" />
            <option value="Seguimiento a 30 días" />
          </datalist>
        </div>
      )}

      <div className="detail-actions">
        {inPipeline ? (
          <button type="button" className="act-remove" onClick={onRemoveFromPipeline}>
            Quitar del pipeline
          </button>
        ) : (
          <button type="button" className="act-pipeline" onClick={onAddToPipeline}>
            Agregar al pipeline
          </button>
        )}
        <button type="button" className="act-quote" onClick={onCreateQuotation}>
          Crear cotización
        </button>
        {prospect.phone && (
          <a
            className="act-whatsapp"
            href={whatsappUrl(prospect.phone, prospect.name)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsappLogo size={20} weight="fill" aria-hidden />
            Escribir por WhatsApp
          </a>
        )}
      </div>
    </div>
  )
}

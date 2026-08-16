/**
 * Panel de resultados. En móvil monta sobre el borde inferior del mapa; desde
 * 1024 px pasa a columna lateral (lo resuelve el CSS).
 *
 * La lista arranca acotada y crece con "Ver N más": cargar cien filas de golpe
 * en un teléfono entierra el mapa y penaliza el desplazamiento.
 */
import { useState } from 'react'
import { ProspectRow } from './ProspectRow'
import type { PipelineStats } from '../pipeline'
import type { Prospect } from '../types'

export type SortMode = 'potencial' | 'cercania'

const PAGE_SIZE = 8

type Props = {
  prospects: readonly Prospect[]
  stats: PipelineStats | null
  hasSearched: boolean
  isRunning: boolean
  radiusKm: number
  sort: SortMode
  onSort: (mode: SortMode) => void
  onQuote: (prospect: Prospect) => void
  onOpenDetail: (prospect: Prospect) => void
}

export function ResultsPanel({
  prospects,
  stats,
  hasSearched,
  isRunning,
  radiusKm,
  sort,
  onSort,
  onQuote,
  onOpenDetail,
}: Props) {
  const [visible, setVisible] = useState(PAGE_SIZE)

  const ordered = [...prospects].sort((a, b) =>
    sort === 'cercania'
      ? a.distanceKm - b.distanceKm || b.score.total - a.score.total
      : b.score.total - a.score.total || a.distanceKm - b.distanceKm,
  )
  const shown = ordered.slice(0, visible)
  const remaining = ordered.length - shown.length

  return (
    <section className="results-panel" aria-label="Resultados de prospección">
      <div className="results-grip" aria-hidden />

      <div className="results-head">
        <p className="results-count" aria-live="polite">
          {isRunning ? (
            'Buscando…'
          ) : (
            <>
              <b>{prospects.length}</b> {prospects.length === 1 ? 'oportunidad' : 'oportunidades'}
              <small>En un radio de {radiusKm} km</small>
            </>
          )}
        </p>

        {prospects.length > 0 && (
          <div className="sort-toggle" role="group" aria-label="Ordenar resultados">
            <button
              type="button"
              aria-pressed={sort === 'potencial'}
              onClick={() => onSort('potencial')}
            >
              Potencial
            </button>
            <button
              type="button"
              aria-pressed={sort === 'cercania'}
              onClick={() => onSort('cercania')}
            >
              Cercanía
            </button>
          </div>
        )}
      </div>

      {!hasSearched && (
        <p className="results-empty">
          Elegí localidad, radio y rubros, y ejecutá la búsqueda para ver empresas del área.
        </p>
      )}

      {hasSearched && prospects.length === 0 && !isRunning && (
        <p className="results-empty">
          No hay empresas registradas en OpenStreetMap para esos rubros dentro del radio elegido.
          Probá ampliar el radio o sumar rubros — no se completan resultados con datos estimados.
        </p>
      )}

      {shown.length > 0 && (
        <>
          <ul className="results-list">
            {shown.map(prospect => (
              <li key={prospect.id}>
                <ProspectRow
                  prospect={prospect}
                  onQuote={() => onQuote(prospect)}
                  onOpenDetail={() => onOpenDetail(prospect)}
                />
              </li>
            ))}
          </ul>

          {remaining > 0 && (
            <button type="button" className="results-more" onClick={() => setVisible(v => v + PAGE_SIZE)}>
              Ver {remaining} más
            </button>
          )}
        </>
      )}

      {stats && prospects.length > 0 && (
        <p className="results-empty" style={{ padding: '10px 0 4px', fontSize: 12 }}>
          {stats.detected} detectadas · {stats.classified} clasificadas · {stats.afterDedupe} sin
          duplicados
        </p>
      )}
    </section>
  )
}

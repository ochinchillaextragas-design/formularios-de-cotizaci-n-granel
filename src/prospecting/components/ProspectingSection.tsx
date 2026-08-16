/**
 * Contenedor de la sección Prospección.
 *
 * Ejecuta el flujo determinista (detección → clasificación → deduplicación →
 * scoring) contra el proveedor de demostración y conserva en memoria el estado
 * comercial posterior (asignación y pipeline), que todavía no tiene backend.
 *
 * El proveedor por defecto es la captura local: no hay llamadas a Overpass.
 */
import { useCallback, useEffect, useState } from 'react'
import { ProspectControls, type OpenSheet } from './ProspectControls'
import { ProspectMap } from './ProspectMap'
import { ResultsPanel, type SortMode } from './ResultsPanel'
import { ProspectDetail } from './ProspectDetail'
import { Sheet } from './Sheet'
import { runProspecting, type Center, type ProspectingResult } from '../pipeline'
import { createDemoOsmProvider, DEMO_DATASET } from '../providers/DemoOsmProvider'
import { ALL_INDUSTRY_KEYS } from '../taxonomy'
import { DEFAULT_LOCALITY, localityByName } from '../localities'
import type { Assignment, IndustryKey, Prospect } from '../types'
import '../prospecting.css'

const provider = createDemoOsmProvider()

const DEFAULT_RADIUS_KM = 12
const DEFAULT_MAX_RESULTS = 25

type Props = {
  onCreateQuotation: (prospect: Prospect) => void
}

export function ProspectingSection({ onCreateQuotation }: Props) {
  const [locality, setLocality] = useState(DEFAULT_LOCALITY.name)
  const [center, setCenter] = useState<Center>(DEFAULT_LOCALITY)
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM)
  const [industries, setIndustries] = useState<readonly IndustryKey[]>(ALL_INDUSTRY_KEYS)
  const [maxResults, setMaxResults] = useState(DEFAULT_MAX_RESULTS)

  const [result, setResult] = useState<ProspectingResult | null>(null)
  // Arranca en true: el módulo abre buscando, no vacío.
  const [isRunning, setIsRunning] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [fitSignal, setFitSignal] = useState(0)

  const [sort, setSort] = useState<SortMode>('potencial')
  const [openSheet, setOpenSheet] = useState<OpenSheet>('none')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<Prospect | null>(null)
  const [assignments, setAssignments] = useState<Readonly<Record<string, Assignment>>>({})

  const search = useCallback(
    async (from: Center, radius: number, rubros: readonly IndustryKey[], limit: number) => {
      setIsRunning(true)
      setError(null)
      try {
        const next = await runProspecting(provider, from, {
          locality: from.name,
          radiusKm: radius,
          industries: rubros,
          maxResults: limit,
        })
        setResult(next)
        setSelectedId(null)
        setFitSignal(signal => signal + 1)
      } catch (caught: unknown) {
        setError(caught instanceof Error ? caught.message : 'No se pudo completar la búsqueda.')
        setResult(null)
      } finally {
        setIsRunning(false)
        setHasSearched(true)
      }
    },
    [],
  )

  // Primera búsqueda al abrir el módulo, contra la captura local y no contra la
  // red. No se reutiliza `search` acá: este efecto no debe tocar el estado de
  // forma síncrona (dispararía renders en cascada), así que sólo aplica el
  // resultado dentro de la promesa, y cancela si el módulo se desmonta antes.
  useEffect(() => {
    let cancelled = false

    runProspecting(provider, DEFAULT_LOCALITY, {
      locality: DEFAULT_LOCALITY.name,
      radiusKm: DEFAULT_RADIUS_KM,
      industries: ALL_INDUSTRY_KEYS,
      maxResults: DEFAULT_MAX_RESULTS,
    })
      .then(next => {
        if (cancelled) return
        setResult(next)
        setFitSignal(signal => signal + 1)
      })
      .catch((caught: unknown) => {
        if (cancelled) return
        setError(caught instanceof Error ? caught.message : 'No se pudo completar la búsqueda.')
      })
      .finally(() => {
        if (cancelled) return
        setIsRunning(false)
        setHasSearched(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const changeLocality = (name: string) => {
    setLocality(name)
    setCenter(localityByName(name) ?? DEFAULT_LOCALITY)
  }

  const apply = () => {
    void search(center, radiusKm, industries, maxResults)
  }

  const searchHere = (point: { latitude: number; longitude: number }) => {
    const next: Center = { name: 'Área del mapa', latitude: point.latitude, longitude: point.longitude }
    setCenter(next)
    setLocality(next.name)
    void search(next, radiusKm, industries, maxResults)
  }

  const handleSelect = useCallback((id: string) => {
    setSelectedId(current => (current === id ? null : id))
  }, [])

  const upsertAssignment = (prospectId: string, patch: Partial<Assignment>) => {
    setAssignments(current => {
      const existing = current[prospectId] ?? {
        prospectId,
        stage: 'sin_asignar' as const,
        owner: '',
        nextAction: '',
      }
      return { ...current, [prospectId]: { ...existing, ...patch } }
    })
  }

  const addToPipeline = (prospect: Prospect) => upsertAssignment(prospect.id, { stage: 'en_pipeline' })

  const removeFromPipeline = (prospect: Prospect) => {
    setAssignments(current => {
      const next = { ...current }
      delete next[prospect.id]
      return next
    })
  }

  const createQuotation = (prospect: Prospect) => {
    upsertAssignment(prospect.id, { stage: 'cotizacion_creada' })
    setDetail(null)
    onCreateQuotation(prospect)
  }

  const activeFilterCount =
    (locality !== DEFAULT_LOCALITY.name ? 1 : 0) +
    (radiusKm !== DEFAULT_RADIUS_KM ? 1 : 0) +
    (maxResults !== DEFAULT_MAX_RESULTS ? 1 : 0)

  const prospects = result?.prospects ?? []

  return (
    <main className="prospecting-shell">
      <ProspectControls
        locality={locality}
        onLocality={changeLocality}
        radiusKm={radiusKm}
        onRadius={setRadiusKm}
        maxResults={maxResults}
        onMaxResults={setMaxResults}
        industries={industries}
        onIndustries={setIndustries}
        activeFilterCount={activeFilterCount}
        openSheet={openSheet}
        onOpenSheet={setOpenSheet}
        onApply={apply}
      />

      {error && (
        <p className="p-error" role="alert">
          {error}
        </p>
      )}

      <div className="p-workspace">
        <ProspectMap
          center={center}
          radiusKm={radiusKm}
          prospects={prospects}
          selectedId={selectedId}
          fitSignal={fitSignal}
          onSelect={handleSelect}
          onSearchHere={searchHere}
        />

        {/* `key` por búsqueda: al cambiar filtros o repetir la búsqueda, el
            panel se remonta y la cantidad de filas visibles vuelve al inicio.
            Sin esto, una búsqueda nueva heredaba el "Ver N más" de la anterior. */}
        <ResultsPanel
          key={fitSignal}
          prospects={prospects}
          stats={result?.stats ?? null}
          hasSearched={hasSearched}
          isRunning={isRunning}
          radiusKm={radiusKm}
          sort={sort}
          onSort={setSort}
          onQuote={createQuotation}
          onOpenDetail={setDetail}
        />
      </div>

      <p className="source-note">
        <strong>Origen de los datos.</strong> Empresas reales de OpenStreetMap capturadas el{' '}
        {DEMO_DATASET.capturedAt} sobre {DEMO_DATASET.center.name} ({DEMO_DATASET.elementCount}{' '}
        registros). {DEMO_DATASET.license}. Ningún registro es inventado: las empresas que no
        publican teléfono o dirección se muestran incompletas.{' '}
        <strong>Sobre las fuentes.</strong> {DEMO_DATASET.endpointNote}
      </p>

      <Sheet title="Ficha del prospecto" isOpen={detail !== null} onClose={() => setDetail(null)}>
        {detail && (
          <ProspectDetail
            prospect={detail}
            assignment={assignments[detail.id]}
            onAddToPipeline={() => addToPipeline(detail)}
            onRemoveFromPipeline={() => removeFromPipeline(detail)}
            onCreateQuotation={() => createQuotation(detail)}
            onAssignmentChange={patch => upsertAssignment(detail.id, patch)}
          />
        )}
      </Sheet>
    </main>
  )
}

/**
 * Mapa Leaflet de prospectos.
 *
 * Tres decisiones que sostienen este componente:
 *
 * 1. **`invalidateSize` agresivo.** Si Leaflet calcula su tamaño cuando el
 *    contenedor todavía mide 0 px —montaje dentro de una pestaña, panel que
 *    cambia de alto, ventana redimensionada— no pide las teselas que faltan y
 *    el mapa queda BLANCO. Se recalcula tras el montaje, en cada cambio de
 *    tamaño observado y al terminar de cargar las teselas.
 *
 * 2. **`divIcon` en vez de marcadores con imagen.** Evita el problema de rutas
 *    de íconos de Leaflet bajo un bundler y permite dibujar score y rubro
 *    juntos, con la misma iconografía Phosphor del resto de la interfaz.
 *
 * 3. **Agrupación propia por grilla de píxeles.** Cientos de pines encimados no
 *    se leen. Se agrupan por celdas del tamaño del pin al zoom actual; es
 *    determinista, se recalcula al hacer zoom y no agrega dependencias.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { ArrowsClockwise, Crosshair } from '@phosphor-icons/react'
import type { Center } from '../pipeline'
import type { IndustryKey, Priority, Prospect } from '../types'
import { INDUSTRY_ICONS } from '../icons'

const PRIORITY_COLOR: Record<Priority, string> = {
  ALTA: '#00953a',
  MEDIA: '#a8730a',
  BAJA: '#5b6577',
}

/** Celda de agrupación, en píxeles de pantalla. Del tamaño de un pin. */
const CLUSTER_CELL_PX = 58

/** Marcado SVG de cada rubro, resuelto una sola vez al cargar el módulo. */
const ICON_MARKUP: Record<IndustryKey, string> = Object.fromEntries(
  Object.entries(INDUSTRY_ICONS).map(([key, Icon]) => [
    key,
    renderToStaticMarkup(<Icon size={15} weight="fill" color="#060e9f" />),
  ]),
) as Record<IndustryKey, string>

function pinHtml(prospect: Prospect, isSelected: boolean): string {
  return `<div class="pin${isSelected ? ' is-selected' : ''}">
    <div class="pin-score" style="background:${PRIORITY_COLOR[prospect.score.priority]}">${prospect.score.total}</div>
    <div class="pin-badge">${ICON_MARKUP[prospect.industry]}</div>
  </div>`
}

function clusterHtml(count: number): string {
  return `<div class="pin pin-cluster"><div class="pin-score">${count}</div></div>`
}

type Group = {
  prospects: Prospect[]
  latitude: number
  longitude: number
}

/** Agrupa por celdas de la proyección al zoom actual. */
function buildGroups(map: L.Map, prospects: readonly Prospect[]): Group[] {
  const zoom = map.getZoom()
  const cells = new Map<string, Prospect[]>()

  for (const prospect of prospects) {
    const point = map.project([prospect.latitude, prospect.longitude], zoom)
    const key = `${Math.floor(point.x / CLUSTER_CELL_PX)}:${Math.floor(point.y / CLUSTER_CELL_PX)}`
    const bucket = cells.get(key)
    if (bucket) bucket.push(prospect)
    else cells.set(key, [prospect])
  }

  return [...cells.values()].map(group => ({
    prospects: group,
    latitude: group.reduce((total, p) => total + p.latitude, 0) / group.length,
    longitude: group.reduce((total, p) => total + p.longitude, 0) / group.length,
  }))
}

type Props = {
  center: Center
  radiusKm: number
  prospects: readonly Prospect[]
  selectedId: string | null
  /** Cambia cuando hay una búsqueda nueva: dispara el reencuadre. */
  fitSignal: number
  onSelect: (id: string) => void
  onSearchHere: (center: { latitude: number; longitude: number }) => void
}

export function ProspectMap({
  center,
  radiusKm,
  prospects,
  selectedId,
  fitSignal,
  onSelect,
  onSearchHere,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.LayerGroup | null>(null)
  const circleRef = useRef<L.Circle | null>(null)
  const [initialCenter] = useState(center)
  const [isReady, setIsReady] = useState(false)

  // ── Montaje ────────────────────────────────────────────────
  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const map = L.map(element, {
      scrollWheelZoom: false,
      zoomControl: false,
      attributionControl: true,
    }).setView([initialCenter.latitude, initialCenter.longitude], 12)

    L.control.zoom({ position: 'topright' }).addTo(map)
    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
      crossOrigin: true,
    }).addTo(map)

    markersRef.current = L.layerGroup().addTo(map)
    mapRef.current = map

    // El contenedor puede medir 0 px en el primer frame; sin este recálculo el
    // mapa se queda en blanco porque nunca pide las teselas que le faltan.
    const refresh = () => map.invalidateSize({ animate: false })
    const raf = requestAnimationFrame(refresh)
    const timer = setTimeout(() => {
      refresh()
      setIsReady(true)
    }, 120)
    tiles.on('load', refresh)

    // Cualquier cambio de alto —panel de resultados, rotación, escritorio— exige
    // recalcular: Leaflet no observa su contenedor por su cuenta.
    const observer = new ResizeObserver(refresh)
    observer.observe(element)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(timer)
      observer.disconnect()
      tiles.off('load', refresh)
      map.remove()
      mapRef.current = null
      markersRef.current = null
      circleRef.current = null
    }
  }, [initialCenter])

  // ── Centro y radio ─────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    circleRef.current?.remove()
    circleRef.current = L.circle([center.latitude, center.longitude], {
      radius: radiusKm * 1000,
      color: '#060e9f',
      weight: 1.5,
      fillColor: '#060e9f',
      fillOpacity: 0.05,
    }).addTo(map)
  }, [center, radiusKm])

  // ── Reencuadre al terminar una búsqueda ────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    map.invalidateSize({ animate: false })

    if (prospects.length === 0) {
      map.setView([center.latitude, center.longitude], 12)
      return
    }
    const bounds = L.latLngBounds(prospects.map(p => [p.latitude, p.longitude] as [number, number]))
    map.fitBounds(bounds.pad(0.15), { animate: false })
    // `center`/`prospects` cambian por otras vías; sólo el disparador reencuadra.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitSignal])

  // ── Marcadores y agrupación ────────────────────────────────
  const drawMarkers = useCallback(() => {
    const map = mapRef.current
    const layer = markersRef.current
    if (!map || !layer) return

    layer.clearLayers()
    for (const group of buildGroups(map, prospects)) {
      const isCluster = group.prospects.length > 1

      if (isCluster) {
        L.marker([group.latitude, group.longitude], {
          icon: L.divIcon({
            html: clusterHtml(group.prospects.length),
            className: '',
            iconSize: [44, 44],
            iconAnchor: [22, 22],
          }),
          keyboard: false,
          title: `${group.prospects.length} empresas agrupadas`,
        })
          .on('click', () => {
            const bounds = L.latLngBounds(
              group.prospects.map(p => [p.latitude, p.longitude] as [number, number]),
            )
            map.fitBounds(bounds.pad(0.3))
          })
          .addTo(layer)
        continue
      }

      const prospect = group.prospects[0]
      L.marker([prospect.latitude, prospect.longitude], {
        icon: L.divIcon({
          html: pinHtml(prospect, prospect.id === selectedId),
          className: '',
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        }),
        title: `${prospect.name} · potencial ${prospect.score.total}`,
      })
        .on('click', () => onSelect(prospect.id))
        .addTo(layer)
    }
  }, [prospects, selectedId, onSelect])

  useEffect(() => {
    drawMarkers()
    const map = mapRef.current
    if (!map) return
    map.on('zoomend', drawMarkers)
    return () => {
      map.off('zoomend', drawMarkers)
    }
  }, [drawMarkers, isReady])

  const recenter = () => {
    mapRef.current?.setView([center.latitude, center.longitude], 12)
  }

  const searchHere = () => {
    const map = mapRef.current
    if (!map) return
    const target = map.getCenter()
    onSearchHere({ latitude: target.lat, longitude: target.lng })
  }

  return (
    <section className="map-panel" aria-label="Mapa de prospectos">
      <div ref={containerRef} className="map-canvas" />

      <button type="button" className="map-float map-refresh" onClick={searchHere}>
        <ArrowsClockwise size={18} weight="bold" aria-hidden />
        <span>Repetir búsqueda aquí</span>
      </button>

      <button
        type="button"
        className="map-float map-locate"
        onClick={recenter}
        aria-label={`Centrar el mapa en ${center.name}`}
        title={`Centrar en ${center.name}`}
      >
        <Crosshair size={22} weight="bold" aria-hidden />
      </button>

      <div className="map-legend">
        <span>
          <i style={{ background: PRIORITY_COLOR.ALTA }} /> Potencial alto
        </span>
        <span>
          <i style={{ background: PRIORITY_COLOR.MEDIA }} /> Medio
        </span>
        <span>
          <i style={{ background: PRIORITY_COLOR.BAJA }} /> Bajo
        </span>
      </div>
    </section>
  )
}

<template>
  <div ref="mapContainer" class="h-full w-full" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useReefsStore } from '~/stores/reefs'
import { useLayersStore } from '~/stores/layers'
import { useMapConfig, type BasemapKey } from '~/composables/useMapConfig'
import { useFormatters } from '~/composables/useFormatters'

const props = defineProps<{
  basemap?: BasemapKey
  showLabels?: boolean
}>()

const mapContainer = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let basemapLayer: L.TileLayer | null = null
let labelsLayer: L.TileLayer | null = null
let markersLayer: L.LayerGroup | null = null
const overlayLayers = new Map<string, L.Layer>()

const reefsStore = useReefsStore()
const layersStore = useLayersStore()
const { defaultCenter, defaultZoom, minZoom, maxZoom, basemaps, labelsOverlay, reefMarkerStyle } = useMapConfig()
const { formatHectares, formatReefStatus, formatBleachingAlert } = useFormatters()

const escapeHtml = (s: string): string => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))

const buildPopup = (r: any): string => {
  const alertLabel = r.bleachingAlert ? formatBleachingAlert(r.bleachingAlert) : '—'
  const hero = r.hero
    ? `<img class="reef-popup-img" src="${escapeHtml(r.hero)}" alt="" loading="lazy" />`
    : `<div class="reef-popup-img reef-popup-img-fallback"></div>`
  const credit = r.imageCredit ? `<span class="reef-popup-credit">${escapeHtml(r.imageCredit)}</span>` : ''
  return `
    <div class="reef-popup-body">
      <div class="reef-popup-hero">${hero}${credit}</div>
      <div class="reef-popup-content">
        <h3 class="reef-popup-title">${escapeHtml(r.name)}</h3>
        <p class="reef-popup-meta">${escapeHtml(r.state)} · ${escapeHtml(r.region)}</p>
        <div class="reef-popup-grid">
          <div><strong>Estado:</strong><br>${formatReefStatus(r.status)}</div>
          <div><strong>DHW:</strong><br>${alertLabel}</div>
          <div><strong>Superficie:</strong><br>${formatHectares(r.area)}</div>
          <div><strong>Cobertura:</strong><br>${r.liveCoralCover ?? '—'}%</div>
        </div>
        <a class="reef-popup-link" href="/inventory#reef-${r.id}">Ver detalle →</a>
      </div>
    </div>
  `
}

const setBasemap = (key: BasemapKey) => {
  if (!map) return
  if (basemapLayer) map.removeLayer(basemapLayer)
  const cfg = basemaps[key]
  basemapLayer = L.tileLayer(cfg.url, { attribution: cfg.attribution, maxZoom: cfg.maxZoom, maxNativeZoom: cfg.maxZoom })
  basemapLayer.addTo(map)
  // Always make basemap fill the bottom layer
  basemapLayer.bringToBack()
}

const setLabels = (visible: boolean) => {
  if (!map) return
  if (visible && !labelsLayer) {
    labelsLayer = L.tileLayer(labelsOverlay.url, { attribution: labelsOverlay.attribution, maxZoom: labelsOverlay.maxZoom, pane: 'overlayPane' })
    labelsLayer.addTo(map)
  } else if (!visible && labelsLayer) {
    map.removeLayer(labelsLayer)
    labelsLayer = null
  }
}

const renderMarkers = () => {
  if (!map) return
  if (markersLayer) markersLayer.clearLayers()
  else markersLayer = L.layerGroup().addTo(map)

  for (const r of reefsStore.filtered) {
    const style = reefMarkerStyle(r.status)
    const marker = L.circleMarker([Number(r.lat), Number(r.lng)], style)
    marker.bindPopup(buildPopup(r), { maxWidth: 320, className: 'reef-popup' })
    // Pulse for critical alerts
    if (r.status === 'alert' || r.status === 'bleaching' || r.status === 'mortality') {
      const pulseRadius = style.radius + 4
      const pulseRing = L.circleMarker([Number(r.lat), Number(r.lng)], {
        radius: pulseRadius,
        color: style.fillColor,
        fillColor: style.fillColor,
        fillOpacity: 0.15,
        weight: 1,
        className: 'reef-pulse',
      })
      pulseRing.addTo(markersLayer!)
    }
    marker.addTo(markersLayer!)
  }
}

const syncOverlays = () => {
  if (!map) return
  // Add new active layers
  for (const layer of layersStore.activeLayers) {
    if (overlayLayers.has(layer.id)) continue
    let leafletLayer: L.Layer | null = null
    if (layer.tileUrlPattern) {
      leafletLayer = L.tileLayer(layer.tileUrlPattern, {
        attribution: layer.attribution,
        opacity: layer.overlayOpacity ?? 0.7,
      })
    } else if (layer.wmsUrl && layer.wmsLayerName) {
      leafletLayer = L.tileLayer.wms(layer.wmsUrl, {
        layers: layer.wmsLayerName,
        format: 'image/png',
        transparent: true,
        opacity: layer.overlayOpacity ?? 0.7,
        attribution: layer.attribution,
      })
    }
    if (leafletLayer) {
      leafletLayer.addTo(map)
      overlayLayers.set(layer.id, leafletLayer)
    }
  }
  // Remove deactivated layers
  for (const [id, leafletLayer] of overlayLayers.entries()) {
    if (!layersStore.activeLayers.find((l) => l.id === id)) {
      map.removeLayer(leafletLayer)
      overlayLayers.delete(id)
    }
  }
  // Keep markers on top
  if (markersLayer) (markersLayer as any).bringToFront?.()
}

onMounted(() => {
  if (!mapContainer.value) return
  map = L.map(mapContainer.value, {
    center: defaultCenter,
    zoom: defaultZoom,
    minZoom,
    maxZoom,
    zoomControl: false,
    worldCopyJump: true,
    preferCanvas: true,
  })
  // Custom zoom control bottom-right
  L.control.zoom({ position: 'bottomright' }).addTo(map)
  L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map)

  setBasemap(props.basemap ?? 'imagery')
  setLabels(props.showLabels !== false)
  renderMarkers()
  syncOverlays()
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
    basemapLayer = null
    labelsLayer = null
    markersLayer = null
    overlayLayers.clear()
  }
})

watch(() => props.basemap, (k) => k && setBasemap(k))
watch(() => props.showLabels, (v) => setLabels(v !== false))
watch(() => reefsStore.filtered, () => renderMarkers(), { deep: true })
watch(() => layersStore.activeLayers, () => syncOverlays(), { deep: true })

// expose flyTo for parent
const flyToReef = (lat: number, lng: number, zoom = 11) => {
  map?.flyTo([lat, lng], zoom, { duration: 1.4 })
}
defineExpose({ flyToReef })
</script>

<style>
/* Popup styling — Google Earth-ish card. Non-scoped: Leaflet inserta el HTML
   en su propio contenedor y necesita selectores globales. ── */

/* Override de Leaflet — usamos selector más específico (popup wrapper > content)
   para ganarle a las reglas inline de Leaflet sin recurrir a !important. */
.leaflet-popup.reef-popup .leaflet-popup-content-wrapper {
  border-radius: 14px;
  padding: 0;
  overflow: hidden;
  box-shadow: 0 12px 40px -8px rgba(0, 0, 0, 0.35);
}
.leaflet-popup.reef-popup .leaflet-popup-content-wrapper .leaflet-popup-content {
  margin: 0;
  width: auto;
  min-width: 260px;
}
.leaflet-popup.reef-popup .leaflet-popup-tip { background: white; }

/* Cuerpo del popup */
.reef-popup-body { font-family: Inter, system-ui, sans-serif; min-width: 260px; }
.reef-popup-hero {
  position: relative;
  height: 120px;
  border-radius: 12px 12px 0 0;
  overflow: hidden;
  background: linear-gradient(135deg, #0E7490, #06B6D4);
}
.reef-popup-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.reef-popup-img-fallback { width: 100%; height: 100%; }
.reef-popup-credit {
  position: absolute;
  bottom: 4px; right: 4px;
  background: rgba(0, 0, 0, 0.6);
  color: rgba(255, 255, 255, 0.9);
  font-size: 9px; font-weight: 500;
  padding: 2px 5px;
  border-radius: 3px;
  backdrop-filter: blur(4px);
}
.reef-popup-content { padding: 14px 16px; }
.reef-popup-title { margin: 0 0 4px; font-size: 14px; font-weight: 700; color: #0F172A; }
.reef-popup-meta { margin: 0 0 10px; font-size: 11px; color: #64748B; }
.reef-popup-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  font-size: 11px;
  color: #1E293B;
}
.reef-popup-link {
  margin-top: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  color: #0E7490;
  text-decoration: none;
}
.reef-popup-link:hover { text-decoration: underline; }

/* Pulsing ring for critical alerts */
.reef-pulse {
  animation: reef-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes reef-pulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 0.15; transform: scale(1.6); }
}
@media (prefers-reduced-motion: reduce) {
  .reef-pulse { animation: none; }
}
</style>

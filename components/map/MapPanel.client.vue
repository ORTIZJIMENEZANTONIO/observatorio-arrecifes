<template>
  <div ref="mapContainer" class="h-full w-full cursor-pointer" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useReefsStore } from '~/stores/reefs'
import { useMapConfig } from '~/composables/useMapConfig'
import { useFormatters } from '~/composables/useFormatters'

const props = defineProps<{
  showAlerts?: boolean
}>()

const mapContainer = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let markersLayer: L.LayerGroup | null = null

const store = useReefsStore()
const {
  defaultCenter,
  defaultZoom,
  tileUrl,
  tileAttribution,
  reefMarkerStyle,
} = useMapConfig()
const { formatHectares, formatReefStatus, formatBleachingAlert } = useFormatters()

const buildPopup = (r: any): string => {
  const alertLabel = r.bleachingAlert ? formatBleachingAlert(r.bleachingAlert) : '—'
  return `
    <div style="padding: 14px 16px; font-family: Inter, system-ui, sans-serif; min-width: 240px;">
      <h3 style="margin: 0 0 4px; font-size: 14px; font-weight: 700; color: #0F172A;">${r.name}</h3>
      <p style="margin: 0 0 8px; font-size: 11px; color: #64748B;">${r.state} · ${r.region}</p>
      <div style="display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: #1E293B;">
        <div><strong>Estado:</strong> ${formatReefStatus(r.status)}</div>
        <div><strong>Superficie:</strong> ${formatHectares(r.area)}</div>
        <div><strong>Cobertura coralina:</strong> ${r.liveCoralCover ?? '—'}%</div>
        <div><strong>Alerta NOAA CRW:</strong> ${alertLabel}</div>
      </div>
      <a href="/inventory#reef-${r.id}" style="margin-top: 10px; display: inline-block; font-size: 11px; font-weight: 700; color: #0E7490; text-decoration: none;">Ver detalle →</a>
    </div>
  `
}

const renderMarkers = () => {
  if (!map) return
  if (markersLayer) markersLayer.clearLayers()
  else markersLayer = L.layerGroup().addTo(map)

  for (const r of store.filtered) {
    L.circleMarker([r.lat, r.lng], reefMarkerStyle(r.status))
      .bindPopup(buildPopup(r), { maxWidth: 320 })
      .addTo(markersLayer!)
  }
}

onMounted(() => {
  if (!mapContainer.value) return
  map = L.map(mapContainer.value, { center: defaultCenter, zoom: defaultZoom, zoomControl: true })
  L.tileLayer(tileUrl, { attribution: tileAttribution, maxZoom: 13 }).addTo(map)
  renderMarkers()
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
    markersLayer = null
  }
})

watch(
  () => store.filtered,
  () => renderMarkers(),
  { deep: true },
)

watch(() => props.showAlerts, () => renderMarkers())
</script>

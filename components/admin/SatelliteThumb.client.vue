<script setup lang="ts">
// Mini-mapa satelital de un punto/polígono — para previsualizar dónde está
// ubicada una invasión costera o cualquier feature geoespacial sin abrir
// /livemap. Renderiza un Leaflet de 1 sólo nivel con basemap Esri World
// Imagery (sin API key, igual que /livemap) y dibuja el footprint encima.
//
// Auto-importado como `<AdminSatelliteThumb>` (componente .client.vue, sólo
// monta en el navegador).
//
// Uso:
//   <AdminSatelliteThumb
//     :lat="20.4234"
//     :lng="-86.9012"
//     :geometry="{ type: 'Polygon', coordinates: [...] }"
//     :zoom="18"
//     class="h-44 w-full"
//   />

import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const props = defineProps<{
  lat: number
  lng: number
  geometry?: { type: string; coordinates: any } | null
  zoom?: number
}>()

const mapEl = ref<HTMLDivElement | null>(null)
let map: L.Map | null = null

// Crea el mapa al mount + dibuja la geometría.
const renderMap = () => {
  if (!mapEl.value) return
  if (!Number.isFinite(props.lat) || !Number.isFinite(props.lng)) return

  if (!map) {
    map = L.map(mapEl.value, {
      center: [Number(props.lat), Number(props.lng)],
      zoom: props.zoom ?? 18,
      zoomControl: false,
      scrollWheelZoom: false,
      dragging: true,
      attributionControl: false,
      keyboard: false,
    })

    // Esri World Imagery — el mismo basemap satélite que usa /livemap.
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
    }).addTo(map)
  } else {
    map.setView([Number(props.lat), Number(props.lng)], props.zoom ?? 18)
  }

  // Limpia capas previas excepto la base.
  map.eachLayer((layer) => {
    if (!(layer instanceof L.TileLayer)) {
      map!.removeLayer(layer)
    }
  })

  // Dibuja la geometría si llega — caen al fallback de marker en el centroide.
  if (props.geometry && Array.isArray((props.geometry as any).coordinates)) {
    try {
      const layer = L.geoJSON(props.geometry as any, {
        style: {
          color: '#FF7A66',
          weight: 2,
          fillColor: '#FF7A66',
          fillOpacity: 0.25,
        },
      })
      layer.addTo(map)
    } catch {
      // Si el GeoJSON está malformado, mostramos sólo el centroide.
      L.circleMarker([Number(props.lat), Number(props.lng)], {
        radius: 8,
        color: '#FF7A66',
        fillColor: '#FF7A66',
        fillOpacity: 0.7,
      }).addTo(map)
    }
  } else {
    L.circleMarker([Number(props.lat), Number(props.lng)], {
      radius: 8,
      color: '#FF7A66',
      fillColor: '#FF7A66',
      fillOpacity: 0.7,
    }).addTo(map)
  }
}

onMounted(() => {
  // Defer un tick para que el contenedor tenga dimensiones.
  setTimeout(renderMap, 0)
})

watch(() => [props.lat, props.lng, props.geometry, props.zoom], () => {
  renderMap()
}, { deep: true })

onBeforeUnmount(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<template>
  <div ref="mapEl" class="satellite-thumb relative overflow-hidden rounded-lg bg-gray-100"></div>
</template>

<style scoped>
.satellite-thumb {
  min-height: 8rem;
}

/* Leaflet inserta un overlayPane que en algunos browsers reporta touchstart
   con tap=true; lo desactivamos vía la opción del map. */
:deep(.leaflet-control-attribution) {
  display: none;
}
</style>

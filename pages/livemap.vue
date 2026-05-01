<template>
  <div class="flex h-[calc(100vh-3.5rem)] flex-col sm:h-[calc(100vh-4rem)]">
    <!-- Toolbar superior — mobile-first: live + search/filter buttons + capas. Filtros largos van en sheet -->
    <div class="border-b border-gray-100 bg-white">
      <div class="container-wide flex items-center gap-2 py-2.5 sm:gap-3 sm:py-3">
        <div class="flex min-w-0 items-center gap-2">
          <span class="live-dot shrink-0" />
          <span class="text-[11px] font-bold uppercase tracking-wider text-coral-dark sm:text-xs">En vivo</span>
          <span class="hidden truncate text-xs text-ink-muted md:inline">· {{ formatDate(new Date().toISOString()) }}</span>
        </div>

        <div class="hidden h-5 w-px bg-gray-200 md:block" />

        <!-- Filtros: en md+ inline; en mobile como botón que abre un sheet -->
        <div class="hidden flex-wrap items-center gap-2 md:flex">
          <select v-model="reefsStore.filterStatus" class="select py-1.5 text-xs">
            <option value="all">Todos los estados</option>
            <option value="healthy">Saludable</option>
            <option value="watch">Vigilancia</option>
            <option value="warning">Advertencia</option>
            <option value="alert">Alerta</option>
            <option value="bleaching">Blanqueamiento</option>
          </select>
          <select v-model="reefsStore.filterOcean" class="select py-1.5 text-xs">
            <option value="all">Todos los litorales</option>
            <option value="caribbean">Caribe</option>
            <option value="gulf_of_mexico">Golfo de México</option>
            <option value="pacific">Pacífico</option>
          </select>
        </div>

        <div class="ml-auto flex items-center gap-1.5 sm:gap-2">
          <!-- Buscar: icon-button en mobile, expand en md+ -->
          <button
            v-if="viewMode === 'map'"
            class="rounded-lg border border-gray-200 p-2 text-ink-muted transition-colors hover:bg-gray-50 hover:text-primary md:hidden"
            :aria-label="'Buscar arrecife'"
            @click="mobileSearchOpen = true"
          >
            <Icon name="lucide:search" size="16" />
          </button>
          <!-- Filtros: icon-button en mobile -->
          <button
            class="rounded-lg border border-gray-200 p-2 text-ink-muted transition-colors hover:bg-gray-50 hover:text-primary md:hidden"
            :aria-label="'Filtros'"
            @click="mobileFiltersOpen = true"
          >
            <Icon name="lucide:sliders-horizontal" size="16" />
            <span
              v-if="activeReefFilters"
              class="absolute -mt-3 -ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white"
            >{{ activeReefFilters }}</span>
          </button>
          <button class="btn-outline btn-sm" @click="layersOpen = !layersOpen">
            <Icon name="lucide:layers" size="14" />
            <span class="hidden xs:inline sm:inline">Capas</span>
            <span class="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-50 px-1.5 text-[10px] font-bold text-primary">
              {{ layersStore.activeLayers.length }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Mapa + paneles flotantes -->
    <div class="relative flex-1 overflow-hidden bg-[#02141C]">
      <ClientOnly>
        <MapPanel
          v-if="viewMode === 'map'"
          ref="mapRef"
          class="absolute inset-0"
          :basemap="basemap"
          :show-labels="showLabels"
        />
        <iframe
          v-else
          :src="nullschoolUrl"
          class="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerpolicy="no-referrer"
          allow="fullscreen"
          title="earth.nullschool.net"
        />
        <template #fallback>
          <div class="absolute inset-0 flex items-center justify-center bg-[#02141C] text-white/60">
            <div class="text-center">
              <Icon name="lucide:loader-2" size="32" class="animate-spin-smooth" />
              <p class="mt-2 text-sm">Cargando mapa…</p>
            </div>
          </div>
        </template>
      </ClientOnly>

      <!-- Switcher de basemap — mobile-first:
           · móvil: trigger compacto (icono + label corto) que despliega popover hacia abajo
           · md+: card siempre desplegada (Google-Earth-style) con todas las opciones visibles -->
      <div class="absolute left-3 top-3 z-[400] flex max-h-[calc(100%-1.5rem)] w-44 flex-col gap-2 overflow-y-auto sm:left-4 sm:top-4 sm:w-56">
        <div class="card-glass overflow-hidden p-1 shadow-xl">
          <!-- Trigger móvil: muestra el activo con chevron -->
          <button
            class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-ink transition-colors hover:bg-gray-100 md:hidden"
            type="button"
            @click="basemapMenuOpen = !basemapMenuOpen"
          >
            <Icon :name="activeBasemapMeta.icon" size="14" />
            <span class="truncate">{{ activeBasemapMeta.label }}</span>
            <Icon :name="basemapMenuOpen ? 'lucide:chevron-up' : 'lucide:chevron-down'" size="14" class="ml-auto" />
          </button>
          <!-- Lista: hidden en móvil cuando colapsado; siempre flex en md+ -->
          <div :class="['flex-col', basemapMenuOpen ? 'flex' : 'hidden md:flex']">
            <button
              v-for="(cfg, key) in basemaps"
              :key="key"
              type="button"
              class="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
              :class="viewMode === 'map' && basemap === key ? 'bg-primary text-white shadow-sm' : 'text-ink hover:bg-gray-100'"
              @click="selectBasemap(key as BasemapKey); basemapMenuOpen = false"
            >
              <Icon :name="cfg.icon" size="14" />
              {{ cfg.label }}
            </button>
            <button
              type="button"
              class="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
              :class="viewMode === 'globe' ? 'bg-primary text-white shadow-sm' : 'text-ink hover:bg-gray-100'"
              @click="viewMode = 'globe'; basemapMenuOpen = false"
            >
              <Icon name="lucide:globe" size="14" />
              Globo dinámico
            </button>
          </div>
        </div>

        <!-- Toggle etiquetas (solo modo mapa, oculto en móvil para no saturar) -->
        <button
          v-if="viewMode === 'map'"
          class="card-glass hidden items-center gap-2 px-3 py-2 text-xs font-medium text-ink transition-colors hover:bg-gray-50 md:flex"
          :class="{ 'bg-primary-50 text-primary': showLabels }"
          @click="showLabels = !showLabels"
        >
          <Icon :name="showLabels ? 'lucide:eye' : 'lucide:eye-off'" size="14" />
          Etiquetas
        </button>

        <!-- Panel de parámetros del globo — colapsable en móvil para no tapar el iframe -->
        <div v-if="viewMode === 'globe'" class="card-glass shadow-xl">
          <button
            class="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-ink md:hidden"
            type="button"
            @click="globeParamsOpen = !globeParamsOpen"
          >
            <Icon name="lucide:settings-2" size="14" />
            Parámetros
            <Icon :name="globeParamsOpen ? 'lucide:chevron-up' : 'lucide:chevron-down'" size="14" class="ml-auto" />
          </button>
          <div :class="['space-y-2 p-3', globeParamsOpen ? 'block' : 'hidden md:block']">
            <div>
              <label class="mb-1 block text-[10px] font-bold uppercase tracking-wider text-ink-muted">Capa</label>
              <select v-model="globePreset" class="select w-full py-1.5 text-xs">
                <option v-for="(p, k) in globePresets" :key="k" :value="k">{{ p.label }}</option>
              </select>
            </div>
            <div>
              <label class="mb-1 block text-[10px] font-bold uppercase tracking-wider text-ink-muted">Proyección</label>
              <select v-model="globeProjection" class="select w-full py-1.5 text-xs">
                <option v-for="(p, k) in globeProjections" :key="k" :value="k">{{ p.label }}</option>
              </select>
            </div>
            <div>
              <label class="mb-1 block text-[10px] font-bold uppercase tracking-wider text-ink-muted">Vista</label>
              <select v-model="globeView" class="select w-full py-1.5 text-xs">
                <option v-for="(v, k) in globeViews" :key="k" :value="k">{{ v.label }}</option>
              </select>
            </div>
            <p class="pt-1 text-[10px] leading-snug text-ink-muted">
              Visualización por
              <a :href="nullschoolUrl" target="_blank" rel="noopener noreferrer" class="font-semibold text-primary hover:underline">earth.nullschool.net</a>
              · Cameron Beccario
            </p>
            <a
              :href="nullschoolUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-outline btn-sm w-full justify-center"
            >
              <Icon name="lucide:external-link" size="12" />
              Abrir en nueva pestaña
            </a>
          </div>
        </div>
      </div>

      <!-- Buscador desktop (fly-to) — oculto en móvil; en móvil usa el sheet de abajo -->
      <div v-if="viewMode === 'map'" class="absolute right-4 top-4 z-[400] hidden w-64 md:block">
        <div class="card-glass p-2 shadow-xl">
          <div class="relative">
            <Icon name="lucide:search" size="14" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              v-model="search"
              type="search"
              placeholder="Volar a un arrecife…"
              class="w-full rounded-md border-0 bg-transparent py-1.5 pl-8 pr-2 text-xs focus:ring-2 focus:ring-primary"
            />
          </div>
          <ul v-if="search && searchResults.length" class="mt-1 max-h-56 overflow-y-auto rounded-md border border-gray-100 bg-white shadow-md">
            <li
              v-for="r in searchResults"
              :key="r.id"
              class="cursor-pointer px-3 py-2 text-xs hover:bg-primary-50"
              @click="flyTo(r)"
            >
              <p class="font-semibold text-ink">{{ r.name }}</p>
              <p class="text-[10px] text-ink-muted">{{ r.state }}</p>
            </li>
          </ul>
        </div>
      </div>

      <!-- Leyenda inferior izquierda -->
      <div v-if="viewMode === 'map'" class="pointer-events-none absolute bottom-20 left-4 z-[400] hidden md:block">
        <div class="card-glass pointer-events-auto p-3 shadow-xl">
          <p class="mb-2 text-[10px] font-bold uppercase tracking-wider text-ink-muted">Estado del arrecife</p>
          <div class="space-y-1 text-xs">
            <div class="flex items-center gap-2"><span class="h-3 w-3 rounded-full bg-eco" /> Saludable</div>
            <div class="flex items-center gap-2"><span class="h-3 w-3 rounded-full bg-secondary" /> Vigilancia</div>
            <div class="flex items-center gap-2"><span class="h-3 w-3 rounded-full bg-accent" /> Advertencia</div>
            <div class="flex items-center gap-2"><span class="h-3 w-3 rounded-full bg-coral" /> Alerta</div>
            <div class="flex items-center gap-2"><span class="h-3 w-3 rounded-full bg-alert" /> Blanqueamiento</div>
          </div>
        </div>
      </div>

      <!-- Panel de capas -->
      <Transition name="slide-right">
        <aside
          v-if="layersOpen"
          class="absolute right-0 top-0 z-[500] flex h-full w-full max-w-sm flex-col border-l border-gray-100 bg-white shadow-2xl"
        >
          <header class="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h2 class="text-lg font-bold text-ink">Capas abiertas</h2>
              <p class="text-xs text-ink-muted">
                {{ liveLayersCount }} con render WMS · {{ catalogOnlyCount }} sólo catálogo
              </p>
            </div>
            <button class="rounded-lg p-1.5 text-ink-muted hover:bg-gray-100" @click="layersOpen = false">
              <Icon name="lucide:x" size="18" />
            </button>
          </header>
          <div class="flex-1 space-y-3 overflow-y-auto p-4">
            <article
              v-for="layer in layersStore.layers"
              :key="layer.id"
              class="card p-3"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1.5">
                    <p class="text-xs font-bold uppercase tracking-wider text-primary">{{ layer.providerLabel }}</p>
                    <span
                      v-if="layer.wmsUrl || layer.tileUrlPattern"
                      class="rounded-full bg-eco/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-eco-dark"
                      title="Capa con renderizado en vivo"
                    >Live</span>
                    <span
                      v-else
                      class="rounded-full bg-gray-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-ink-muted"
                      title="Catálogo / descarga externa"
                    >Catálogo</span>
                  </div>
                  <h3 class="mt-0.5 text-sm font-semibold text-ink">{{ layer.title }}</h3>
                  <p class="mt-1 line-clamp-2 text-xs text-ink-muted">{{ layer.description }}</p>
                  <div class="mt-2 flex flex-wrap gap-1.5 text-[10px]">
                    <span v-if="layer.resolution" class="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-ink-muted">{{ layer.resolution }}</span>
                    <span v-if="layer.cadence" class="rounded bg-gray-100 px-1.5 py-0.5 text-ink-muted">{{ layer.cadence }}</span>
                    <span class="rounded bg-eco/10 px-1.5 py-0.5 font-semibold text-eco-dark">{{ layer.license }}</span>
                  </div>
                </div>
                <label class="relative inline-flex cursor-pointer items-center" :title="layer.wmsUrl || layer.tileUrlPattern ? 'Activar render en mapa' : 'Sin render — sólo metadatos'">
                  <input
                    type="checkbox"
                    :checked="layer.active"
                    class="peer sr-only"
                    @change="layersStore.toggleLayer(layer.id)"
                  />
                  <div class="h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-primary after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </div>
              <a
                v-if="layer.sourceUrl"
                :href="layer.sourceUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
              >
                Fuente original <Icon name="lucide:external-link" size="11" />
              </a>
            </article>
          </div>
          <footer class="border-t border-gray-100 px-5 py-3">
            <NuxtLink to="/data-sources" class="btn-outline btn-sm w-full justify-center">
              Catálogo completo de capas
              <Icon name="lucide:arrow-right" size="14" />
            </NuxtLink>
          </footer>
        </aside>
      </Transition>

      <!-- Sheet móvil: Buscador de arrecife (fly-to) -->
      <Transition name="slide-up">
        <div
          v-if="mobileSearchOpen && viewMode === 'map'"
          class="absolute inset-x-0 top-0 z-[600] flex flex-col gap-2 border-b border-gray-200 bg-white p-3 shadow-xl md:hidden"
        >
          <div class="flex items-center gap-2">
            <Icon name="lucide:search" size="16" class="text-ink-muted" />
            <input
              v-model="search"
              type="search"
              placeholder="Volar a un arrecife…"
              class="input flex-1 py-1.5 text-sm"
              autofocus
            />
            <button
              class="rounded-lg p-1.5 text-ink-muted hover:bg-gray-100"
              :aria-label="'Cerrar buscador'"
              @click="mobileSearchOpen = false; search = ''"
            >
              <Icon name="lucide:x" size="18" />
            </button>
          </div>
          <ul v-if="search && searchResults.length" class="max-h-64 overflow-y-auto rounded-md border border-gray-100 bg-white">
            <li
              v-for="r in searchResults"
              :key="r.id"
              class="cursor-pointer px-3 py-2.5 text-sm hover:bg-primary-50"
              @click="flyTo(r); mobileSearchOpen = false"
            >
              <p class="font-semibold text-ink">{{ r.name }}</p>
              <p class="text-xs text-ink-muted">{{ r.state }}</p>
            </li>
          </ul>
          <p v-else-if="search && !searchResults.length" class="px-3 py-2 text-xs text-ink-muted">
            Sin resultados para "{{ search }}".
          </p>
        </div>
      </Transition>

      <!-- Sheet móvil: Filtros (estado + litoral) -->
      <Transition name="fade">
        <div
          v-if="mobileFiltersOpen"
          class="absolute inset-0 z-[600] bg-black/40 md:hidden"
          @click.self="mobileFiltersOpen = false"
        >
          <div class="absolute inset-x-0 bottom-0 flex flex-col gap-3 rounded-t-2xl bg-white p-4 pb-6 shadow-xl">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-semibold text-ink">Filtros</h3>
              <button
                class="rounded-lg p-1.5 text-ink-muted hover:bg-gray-100"
                :aria-label="'Cerrar filtros'"
                @click="mobileFiltersOpen = false"
              >
                <Icon name="lucide:x" size="18" />
              </button>
            </div>
            <div class="form-group">
              <label class="form-label text-xs">Estado</label>
              <select v-model="reefsStore.filterStatus" class="select w-full text-sm">
                <option value="all">Todos los estados</option>
                <option value="healthy">Saludable</option>
                <option value="watch">Vigilancia</option>
                <option value="warning">Advertencia</option>
                <option value="alert">Alerta</option>
                <option value="bleaching">Blanqueamiento</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label text-xs">Litoral</label>
              <select v-model="reefsStore.filterOcean" class="select w-full text-sm">
                <option value="all">Todos los litorales</option>
                <option value="caribbean">Caribe</option>
                <option value="gulf_of_mexico">Golfo de México</option>
                <option value="pacific">Pacífico</option>
              </select>
            </div>
            <div v-if="viewMode === 'map'" class="form-group">
              <label class="flex items-center gap-2 text-sm">
                <input v-model="showLabels" type="checkbox" class="h-4 w-4 rounded" />
                Mostrar etiquetas en mapa
              </label>
            </div>
            <div class="flex gap-2 pt-2">
              <button
                class="btn-ghost flex-1 justify-center"
                @click="reefsStore.filterStatus = 'all'; reefsStore.filterOcean = 'all'"
              >
                Limpiar
              </button>
              <button class="btn-primary flex-1 justify-center" @click="mobileFiltersOpen = false">
                Aplicar
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useReefsStore } from '~/stores/reefs'
import { useLayersStore } from '~/stores/layers'
import { useMapConfig, type BasemapKey } from '~/composables/useMapConfig'

definePageMeta({ pageTransition: false })

const reefsStore = useReefsStore()
const layersStore = useLayersStore()
const { basemaps } = useMapConfig()
const { formatDate } = useFormatters()

const layersOpen = ref(false)
const basemap = ref<BasemapKey>('imagery')
const showLabels = ref(true)
const search = ref('')

// ── Mobile UI state ──
// Mobile-first: en lugar de panels flotantes que comen pantalla en <md, usamos
// triggers compactos en la toolbar que abren sheets/popovers a demanda.
const mobileSearchOpen = ref(false)
const mobileFiltersOpen = ref(false)
const basemapMenuOpen = ref(false)        // popover en mobile, ignorado en md+ (display:flex forzado)
const globeParamsOpen = ref(false)        // colapsable en mobile para no tapar el iframe

// Conteo de filtros activos (para badge en el botón de filtros móvil).
const activeReefFilters = computed(() => {
  let n = 0
  if (reefsStore.filterStatus !== 'all') n++
  if (reefsStore.filterOcean !== 'all') n++
  return n
})

type ViewMode = 'map' | 'globe'
const viewMode = ref<ViewMode>('map')

// Meta del basemap activo (label + icon) para el trigger compacto en mobile.
const activeBasemapMeta = computed(() => {
  if (viewMode.value === 'globe') return { label: 'Globo dinámico', icon: 'lucide:globe' }
  const cfg = basemaps[basemap.value]
  return { label: cfg.label, icon: cfg.icon }
})

const selectBasemap = (key: BasemapKey) => {
  basemap.value = key
  viewMode.value = 'map'
}

// ── earth.nullschool presets (capas, proyecciones, vistas) ──
const globePresets = {
  wind: { label: 'Vientos en superficie', path: 'current/wind/surface/level' },
  currents: { label: 'Corrientes oceánicas', path: 'current/ocean/surface/currents' },
  sst: { label: 'Temperatura del mar (SST)', path: 'current/ocean/surface/currents/overlay=sea_surface_temp' },
  waves: { label: 'Altura significativa de olas', path: 'current/ocean/primary/waves' },
  pressure: { label: 'Presión a nivel del mar', path: 'current/wind/surface/level/overlay=mean_sea_level_pressure' },
  precipitable: { label: 'Agua precipitable', path: 'current/wind/surface/level/overlay=total_precipitable_water' },
  cape: { label: 'Energía convectiva (CAPE)', path: 'current/wind/surface/level/overlay=cape' },
  aerosol: { label: 'Aerosoles (PM2.5)', path: 'current/particulates/surface/level/overlay=pm2.5' },
} as const
type GlobePreset = keyof typeof globePresets

const globeProjections = {
  orthographic: { label: 'Globo (3D)' },
  equirectangular: { label: 'Plano (equirectangular)' },
  mercator: { label: 'Mercator' },
  winkel3: { label: 'Winkel III' },
  patterson: { label: 'Patterson' },
  azimuthal_equidistant: { label: 'Azimutal equidistante' },
} as const
type GlobeProjection = keyof typeof globeProjections

const globeViews = {
  mexico: { label: 'México', lng: -99, lat: 23, zoom: 800 },
  caribbean: { label: 'Caribe mexicano', lng: -87, lat: 20, zoom: 1500 },
  pacific: { label: 'Pacífico mexicano', lng: -110, lat: 24, zoom: 1200 },
  gulf: { label: 'Golfo de México', lng: -93, lat: 25, zoom: 1500 },
  mesoamerican: { label: 'Sistema Arrecifal Mesoamericano', lng: -87, lat: 18, zoom: 2200 },
  global: { label: 'Global', lng: -90, lat: 0, zoom: 594 },
} as const
type GlobeView = keyof typeof globeViews

const globePreset = ref<GlobePreset>('currents')
const globeProjection = ref<GlobeProjection>('orthographic')
const globeView = ref<GlobeView>('mexico')

const nullschoolUrl = computed(() => {
  const preset = globePresets[globePreset.value]
  const view = globeViews[globeView.value]
  const projParam = `${globeProjection.value}=${view.lng.toFixed(2)},${view.lat.toFixed(2)},${view.zoom}`
  return `https://earth.nullschool.net/es/#${preset.path}/${projParam}`
})

const mapRef = ref<{ flyToReef: (lat: number, lng: number, zoom?: number) => void } | null>(null)

const searchResults = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return []
  return reefsStore.publicReefs
    .filter((r) => `${r.name} ${r.state}`.toLowerCase().includes(q))
    .slice(0, 6)
})

const flyTo = (r: { lat: number; lng: number }) => {
  mapRef.value?.flyToReef(Number(r.lat), Number(r.lng), 11)
  search.value = ''
}

const liveLayersCount = computed(() =>
  layersStore.layers.filter((l) => l.wmsUrl || l.tileUrlPattern).length,
)
const catalogOnlyCount = computed(() => layersStore.layers.length - liveLayersCount.value)
</script>

<style scoped>
.slide-right-enter-active { transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1); }
.slide-right-leave-active { transition: transform 0.25s ease-in; }
.slide-right-enter-from, .slide-right-leave-to { transform: translateX(100%); }

.slide-up-enter-active { transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s; }
.slide-up-leave-active { transition: transform 0.2s ease-in, opacity 0.15s; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(-100%); opacity: 0; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

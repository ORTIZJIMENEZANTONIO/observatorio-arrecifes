<template>
  <div class="flex h-[calc(100vh-3.5rem)] flex-col sm:h-[calc(100vh-4rem)]">
    <!-- Toolbar superior -->
    <div class="border-b border-gray-100 bg-white">
      <div class="container-wide flex flex-wrap items-center gap-3 py-3">
        <div class="flex items-center gap-2">
          <span class="live-dot" />
          <span class="text-xs font-bold uppercase tracking-wider text-coral-dark">En vivo</span>
          <span class="hidden text-xs text-ink-muted sm:inline">· {{ formatDate(new Date().toISOString()) }}</span>
        </div>
        <div class="hidden h-5 w-px bg-gray-200 md:block" />
        <div class="flex flex-wrap items-center gap-2">
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
        <button class="btn-outline btn-sm ml-auto" @click="layersOpen = !layersOpen">
          <Icon name="lucide:layers" size="14" />
          Capas
          <span class="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-50 px-1.5 text-[10px] font-bold text-primary">
            {{ layersStore.activeLayers.length }}
          </span>
        </button>
      </div>
    </div>

    <!-- Mapa + paneles flotantes -->
    <div class="relative flex-1 overflow-hidden bg-[#02141C]">
      <ClientOnly>
        <MapPanel ref="mapRef" class="absolute inset-0" :basemap="basemap" :show-labels="showLabels" />
        <template #fallback>
          <div class="absolute inset-0 flex items-center justify-center bg-[#02141C] text-white/60">
            <div class="text-center">
              <Icon name="lucide:loader-2" size="32" class="animate-spin-smooth" />
              <p class="mt-2 text-sm">Cargando mapa…</p>
            </div>
          </div>
        </template>
      </ClientOnly>

      <!-- Switcher de basemap (Google Earth-style) -->
      <div class="absolute left-4 top-4 z-[400] flex flex-col gap-2">
        <div class="card-glass overflow-hidden p-1 shadow-xl">
          <div class="flex flex-col">
            <button
              v-for="(cfg, key) in basemaps"
              :key="key"
              type="button"
              class="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
              :class="basemap === key ? 'bg-primary text-white shadow-sm' : 'text-ink hover:bg-gray-100'"
              @click="basemap = key as BasemapKey"
            >
              <Icon :name="cfg.icon" size="14" />
              {{ cfg.label }}
            </button>
          </div>
        </div>
        <button
          class="card-glass flex items-center gap-2 px-3 py-2 text-xs font-medium text-ink transition-colors hover:bg-gray-50"
          :class="{ 'bg-primary-50 text-primary': showLabels }"
          @click="showLabels = !showLabels"
        >
          <Icon :name="showLabels ? 'lucide:eye' : 'lucide:eye-off'" size="14" />
          Etiquetas
        </button>
      </div>

      <!-- Buscador de arrecife (fly-to) -->
      <div class="absolute right-4 top-4 z-[400] hidden w-64 md:block">
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
      <div class="pointer-events-none absolute bottom-20 left-4 z-[400] hidden md:block">
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
</style>

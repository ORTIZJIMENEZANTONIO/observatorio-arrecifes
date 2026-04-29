<template>
  <div>
    <CommonHeroSection compact>
      <div class="max-w-3xl">
        <span class="badge-coral mb-3 bg-white/15 text-white">Inventario</span>
        <h1 class="font-display text-3xl font-extrabold text-white md:text-5xl">Arrecifes monitoreados</h1>
        <p class="mt-3 text-base text-white/80 md:text-lg">
          {{ store.totalCount }} arrecifes coralinos documentados en el Pacífico, Golfo de México y Caribe mexicano.
          Datos consolidados de CONANP, CONABIO, Allen Coral Atlas y literatura académica.
        </p>
      </div>
    </CommonHeroSection>

    <section class="section-padding-sm">
      <div class="container-wide">
        <!-- Filters -->
        <div class="card mb-6 p-4 md:p-5">
          <div class="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
            <div class="input-icon-wrapper">
              <Icon name="lucide:search" size="16" class="input-icon" />
              <input v-model="store.search" type="search" class="input" placeholder="Buscar por nombre, estado o región…" />
            </div>
            <select v-model="store.filterOcean" class="select">
              <option value="all">Todos los litorales</option>
              <option value="caribbean">Caribe</option>
              <option value="gulf_of_mexico">Golfo de México</option>
              <option value="pacific">Pacífico</option>
            </select>
            <select v-model="store.filterState" class="select">
              <option value="all">Todos los estados</option>
              <option v-for="s in store.states" :key="s" :value="s">{{ s }}</option>
            </select>
            <select v-model="sortBy" class="select">
              <option value="name">Ordenar: Nombre</option>
              <option value="area">Superficie (mayor)</option>
              <option value="cover">Cobertura coral (mayor)</option>
              <option value="alert">Mayor alerta</option>
            </select>
          </div>
        </div>

        <!-- Cards grid -->
        <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="reef in paginated"
            :id="`reef-${reef.id}`"
            :key="reef.id"
            class="card-interactive group flex flex-col overflow-hidden"
            @click="selectedReef = reef"
          >
            <div class="relative h-44 overflow-hidden bg-gradient-to-br from-primary-100 to-secondary/30">
              <img
                v-if="reef.hero"
                :src="reef.hero"
                :alt="reef.name"
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
              />
              <div class="absolute inset-0 flex items-center justify-center text-primary/40">
                <Icon name="lucide:waves" size="48" />
              </div>
              <div class="absolute left-3 top-3 flex gap-1.5">
                <span :class="`badge ${reefStatusBadgeClass(reef.status)}`">
                  {{ formatReefStatus(reef.status) }}
                </span>
                <span v-if="reef.bleachingAlert" :class="`badge ${bleachingAlertBadgeClass(reef.bleachingAlert)}`">
                  {{ formatBleachingAlert(reef.bleachingAlert) }}
                </span>
              </div>
              <span
                v-if="reef.imageCredit"
                class="absolute bottom-2 right-2 max-w-[85%] truncate rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-medium text-white/90 backdrop-blur-sm"
                :title="reef.imageCredit"
              >
                {{ reef.imageCredit }}
              </span>
            </div>

            <div class="flex flex-1 flex-col p-4">
              <h3 class="text-base font-semibold text-ink line-clamp-1">{{ reef.name }}</h3>
              <p class="mt-0.5 text-xs text-ink-muted">{{ reef.state }} · {{ reef.region }}</p>
              <p class="mt-3 line-clamp-2 text-sm text-slate-custom">{{ reef.description }}</p>

              <div class="mt-4 grid grid-cols-3 gap-2 border-t border-gray-100 pt-3 text-xs">
                <div>
                  <p class="text-[10px] uppercase tracking-wider text-ink-muted">Superficie</p>
                  <p class="font-bold text-ink">{{ formatNumber(reef.area) }} ha</p>
                </div>
                <div>
                  <p class="text-[10px] uppercase tracking-wider text-ink-muted">Cobertura</p>
                  <p class="font-bold text-eco-dark">{{ reef.liveCoralCover ?? '—' }}%</p>
                </div>
                <div>
                  <p class="text-[10px] uppercase tracking-wider text-ink-muted">Profundidad</p>
                  <p class="font-bold text-ink">{{ formatDepth(reef.depthRange) }}</p>
                </div>
              </div>
            </div>
          </article>
        </div>

        <CommonPaginationControls
          v-model:current-page="currentPage"
          :total-pages="totalPages"
          :total-items="filtered.length"
          :per-page="perPage"
        />
      </div>
    </section>

    <!-- Detail drawer -->
    <Transition name="fade">
      <div v-if="selectedReef" class="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm" @click="selectedReef = null" />
    </Transition>
    <Transition name="drawer">
      <aside
        v-if="selectedReef"
        class="fixed right-0 top-0 z-[101] flex h-full w-full max-w-xl flex-col bg-white shadow-2xl"
      >
        <header class="flex items-start justify-between gap-4 border-b border-gray-100 p-5">
          <div>
            <p class="text-xs font-bold uppercase tracking-wider text-primary">{{ selectedReef.region }}</p>
            <h2 class="mt-1 text-2xl font-bold text-ink">{{ selectedReef.name }}</h2>
            <p class="mt-1 text-sm text-ink-muted">{{ selectedReef.state }}</p>
          </div>
          <button class="rounded-lg p-2 text-ink-muted hover:bg-gray-100" @click="selectedReef = null">
            <Icon name="lucide:x" size="20" />
          </button>
        </header>
        <div class="flex-1 overflow-y-auto">
          <div class="p-5 space-y-5">
            <p class="text-sm leading-relaxed text-ink-light">{{ selectedReef.description }}</p>

            <div class="grid grid-cols-2 gap-3">
              <div class="kpi-card">
                <p class="text-[10px] uppercase tracking-wider text-ink-muted">Superficie</p>
                <p class="text-lg font-bold text-ink">{{ formatNumber(selectedReef.area) }} ha</p>
              </div>
              <div class="kpi-card">
                <p class="text-[10px] uppercase tracking-wider text-ink-muted">Cobertura coralina</p>
                <p class="text-lg font-bold text-eco-dark">{{ selectedReef.liveCoralCover ?? '—' }}%</p>
              </div>
              <div class="kpi-card">
                <p class="text-[10px] uppercase tracking-wider text-ink-muted">Profundidad</p>
                <p class="text-lg font-bold text-ink">{{ formatDepth(selectedReef.depthRange) }}</p>
              </div>
              <div class="kpi-card">
                <p class="text-[10px] uppercase tracking-wider text-ink-muted">Riqueza coral</p>
                <p class="text-lg font-bold text-ink">{{ selectedReef.speciesRichness ?? '—' }} spp.</p>
              </div>
            </div>

            <div>
              <h3 class="mb-2 text-xs font-bold uppercase tracking-wider text-ink-muted">Protección</h3>
              <span class="badge-primary">{{ formatProtection(selectedReef.protection) }}</span>
            </div>

            <div>
              <h3 class="mb-2 text-xs font-bold uppercase tracking-wider text-ink-muted">Clases bentónicas</h3>
              <div class="flex flex-wrap gap-1.5">
                <span v-for="b in selectedReef.benthicClasses" :key="b" class="badge-secondary">{{ b }}</span>
              </div>
            </div>

            <div>
              <h3 class="mb-2 text-xs font-bold uppercase tracking-wider text-ink-muted">Amenazas</h3>
              <div class="flex flex-wrap gap-1.5">
                <span v-for="t in selectedReef.threats" :key="t" class="badge-coral">{{ formatThreat(t) }}</span>
              </div>
            </div>

            <div v-if="reefGallery.length" class="space-y-2">
              <h3 class="text-xs font-bold uppercase tracking-wider text-ink-muted">Galería</h3>
              <div class="grid grid-cols-3 gap-2">
                <a
                  v-for="(img, idx) in reefGallery"
                  :key="idx"
                  :href="img"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="group relative block aspect-square overflow-hidden rounded-lg bg-gray-100"
                >
                  <img :src="img" :alt="`${selectedReef.name} ${idx + 1}`" class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" loading="lazy" />
                </a>
              </div>
            </div>

            <div class="rounded-xl border border-gray-100 bg-surface-cool p-4">
              <p class="text-xs font-semibold text-ink">Coordenadas</p>
              <p class="mt-1 font-mono text-xs text-ink-muted">{{ Number(selectedReef.lat).toFixed(4) }}, {{ Number(selectedReef.lng).toFixed(4) }}</p>
              <NuxtLink :to="`/livemap?reef=${selectedReef.id}`" class="btn-outline btn-sm mt-3 w-full justify-center">
                <Icon name="lucide:map" size="14" /> Ver en mapa vivo
              </NuxtLink>
            </div>

            <p v-if="selectedReef.imageCredit" class="text-[11px] text-ink-muted">
              Imagen: {{ selectedReef.imageCredit }}
            </p>
          </div>
        </div>
      </aside>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useReefsStore } from '~/stores/reefs'
import type { Reef } from '~/types'

const store = useReefsStore()
const {
  formatNumber,
  formatDepth,
  formatReefStatus,
  reefStatusBadgeClass,
  formatBleachingAlert,
  bleachingAlertBadgeClass,
  formatProtection,
  formatThreat,
} = useFormatters()

const sortBy = ref<'name' | 'area' | 'cover' | 'alert'>('name')
const currentPage = ref(1)
const perPage = 9
const selectedReef = ref<Reef | null>(null)

const reefGallery = computed<string[]>(() => {
  const r = selectedReef.value
  if (!r) return []
  const fromGallery = Array.isArray(r.gallery) ? r.gallery.filter(Boolean) : []
  if (fromGallery.length) return fromGallery.slice(0, 3)
  // Fallback: if no gallery, repeat hero so the section still feels populated.
  return r.hero ? [r.hero] : []
})

const filtered = computed(() => {
  const list = [...store.filtered]
  switch (sortBy.value) {
    case 'area':
      return list.sort((a, b) => b.area - a.area)
    case 'cover':
      return list.sort((a, b) => (b.liveCoralCover ?? 0) - (a.liveCoralCover ?? 0))
    case 'alert':
      return list.sort((a, b) => alertWeight(b) - alertWeight(a))
    default:
      return list.sort((a, b) => a.name.localeCompare(b.name))
  }
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage)))
const paginated = computed(() => filtered.value.slice((currentPage.value - 1) * perPage, currentPage.value * perPage))

const alertWeight = (r: Reef): number => {
  const map: Record<string, number> = { healthy: 0, watch: 1, warning: 2, alert: 3, bleaching: 4, mortality: 5 }
  return map[r.status] ?? 0
}

watch(
  () => [store.search, store.filterOcean, store.filterState, store.filterStatus, sortBy.value],
  () => { currentPage.value = 1 },
)
</script>

<style scoped>
.drawer-enter-active { transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1); }
.drawer-leave-active { transition: transform 0.25s ease-in; }
.drawer-enter-from, .drawer-leave-to { transform: translateX(100%); }
</style>

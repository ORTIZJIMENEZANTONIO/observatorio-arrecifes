<template>
  <div>
    <CommonHeroSection compact>
      <div class="max-w-3xl">
        <span class="badge-coral mb-3 bg-white/15 text-white">Atlas</span>
        <h1 class="font-display text-3xl font-extrabold text-white md:text-5xl">Conflictos socioambientales costeros</h1>
        <p class="mt-3 text-base text-white/80 md:text-lg">
          Inspirado en EJAtlas. Cada caso documenta quién impulsa la presión, quién resiste,
          qué arrecifes y comunidades se afectan. Evidencia abierta y verificable.
        </p>
      </div>
    </CommonHeroSection>

    <section class="section-padding-sm">
      <div class="container-wide">
        <div class="card mb-6 p-4 md:p-5">
          <div class="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
            <div class="input-icon-wrapper">
              <Icon name="lucide:search" size="16" class="input-icon" />
              <input v-model="store.search" type="search" class="input" placeholder="Buscar conflicto…" />
            </div>
            <select v-model="store.filterIntensity" class="select">
              <option value="all">Toda intensidad</option>
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
            </select>
            <select v-model="store.filterStatus" class="select">
              <option value="all">Todos los estados</option>
              <option value="emerging">Emergente</option>
              <option value="ongoing">En curso</option>
              <option value="mitigating">Mitigando</option>
              <option value="resolved">Resuelto</option>
            </select>
            <button class="btn-outline btn-sm" @click="resetFilters">
              <Icon name="lucide:rotate-ccw" size="14" />
              Limpiar
            </button>
          </div>
        </div>

        <div class="grid gap-5 md:grid-cols-2">
          <article
            v-for="c in store.filtered"
            :key="c.id"
            class="card-interactive group flex flex-col p-5"
          >
            <div class="flex flex-wrap items-center gap-2">
              <span :class="`badge ${conflictIntensityBadgeClass(c.intensity)}`">
                <Icon name="lucide:flame" size="11" class="mr-1" />
                {{ formatConflictIntensity(c.intensity) }}
              </span>
              <span class="badge-primary">{{ formatConflictStatus(c.status) }}</span>
              <span class="ml-auto text-[10px] uppercase tracking-wider text-ink-muted">
                {{ c.state }}
              </span>
            </div>
            <h3 class="mt-3 text-lg font-bold text-ink group-hover:text-primary transition-colors">{{ c.title }}</h3>
            <p class="mt-2 text-sm leading-relaxed text-slate-custom">{{ c.summary }}</p>

            <div class="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-3 text-xs">
              <div>
                <p class="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Impulsan</p>
                <ul class="mt-1 space-y-0.5">
                  <li v-for="(d, i) in c.drivers.slice(0, 2)" :key="i" class="flex items-start gap-1">
                    <Icon name="lucide:arrow-up" size="10" class="mt-0.5 text-coral" />
                    <span class="text-ink-light">{{ d }}</span>
                  </li>
                </ul>
              </div>
              <div>
                <p class="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Resisten</p>
                <ul class="mt-1 space-y-0.5">
                  <li v-for="(r, i) in c.resistance.slice(0, 2)" :key="i" class="flex items-start gap-1">
                    <Icon name="lucide:shield" size="10" class="mt-0.5 text-eco" />
                    <span class="text-ink-light">{{ r }}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div class="mt-3 flex flex-wrap gap-1.5">
              <span v-for="t in c.threats.slice(0, 3)" :key="t" class="badge-secondary">{{ formatThreat(t) }}</span>
              <span v-if="c.threats.length > 3" class="badge bg-gray-100 text-ink-muted">+{{ c.threats.length - 3 }}</span>
            </div>

            <button class="mt-4 inline-flex items-center gap-1 self-start text-xs font-semibold text-primary hover:gap-2 transition-all" @click="selected = c">
              Ver caso completo <Icon name="lucide:arrow-right" size="12" />
            </button>
          </article>
        </div>

        <div v-if="!store.filtered.length" class="py-16 text-center">
          <Icon name="lucide:search-x" size="40" class="mx-auto text-ink-muted/40" />
          <p class="mt-3 text-sm text-ink-muted">No se encontraron conflictos con esos filtros.</p>
        </div>
      </div>
    </section>

    <!-- Detail dialog -->
    <Transition name="fade">
      <div v-if="selected" class="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm" @click="selected = null" />
    </Transition>
    <Transition name="drawer">
      <aside
        v-if="selected"
        class="fixed right-0 top-0 z-[101] flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl"
      >
        <header class="flex items-start justify-between gap-4 border-b border-gray-100 p-5">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span :class="`badge ${conflictIntensityBadgeClass(selected.intensity)}`">{{ formatConflictIntensity(selected.intensity) }}</span>
              <span class="badge-primary">{{ formatConflictStatus(selected.status) }}</span>
            </div>
            <h2 class="mt-2 text-2xl font-bold text-ink">{{ selected.title }}</h2>
            <p class="mt-1 text-sm text-ink-muted">
              {{ selected.state }} · Iniciado {{ formatDate(selected.startedAt) }} · Actualizado {{ formatDate(selected.updatedAt) }}
            </p>
          </div>
          <button class="rounded-lg p-2 text-ink-muted hover:bg-gray-100" @click="selected = null">
            <Icon name="lucide:x" size="20" />
          </button>
        </header>
        <div class="flex-1 overflow-y-auto p-5 space-y-5">
          <p class="text-sm leading-relaxed text-ink">{{ selected.fullStory }}</p>

          <div class="grid gap-4 md:grid-cols-2">
            <div class="rounded-xl border border-coral-100 bg-coral-50 p-4">
              <h3 class="text-xs font-bold uppercase tracking-wider text-coral-dark">Quién impulsa</h3>
              <ul class="mt-2 space-y-1 text-sm text-ink-light">
                <li v-for="(d, i) in selected.drivers" :key="i" class="flex items-start gap-2">
                  <Icon name="lucide:arrow-up-right" size="14" class="mt-0.5 text-coral-dark" />
                  {{ d }}
                </li>
              </ul>
            </div>
            <div class="rounded-xl border border-eco/20 bg-eco/5 p-4">
              <h3 class="text-xs font-bold uppercase tracking-wider text-eco-dark">Quién resiste</h3>
              <ul class="mt-2 space-y-1 text-sm text-ink-light">
                <li v-for="(r, i) in selected.resistance" :key="i" class="flex items-start gap-2">
                  <Icon name="lucide:shield" size="14" class="mt-0.5 text-eco-dark" />
                  {{ r }}
                </li>
              </ul>
            </div>
          </div>

          <div>
            <h3 class="mb-2 text-xs font-bold uppercase tracking-wider text-ink-muted">Amenazas asociadas</h3>
            <div class="flex flex-wrap gap-1.5">
              <span v-for="t in selected.threats" :key="t" class="badge-coral">{{ formatThreat(t) }}</span>
            </div>
          </div>

          <div>
            <h3 class="mb-2 text-xs font-bold uppercase tracking-wider text-ink-muted">Comunidades afectadas</h3>
            <ul class="space-y-1 text-sm text-ink-light">
              <li v-for="(com, i) in selected.affectedCommunities" :key="i" class="flex items-start gap-2">
                <Icon name="lucide:users" size="14" class="mt-0.5 text-primary" />
                {{ com }}
              </li>
            </ul>
          </div>

          <div v-if="selected.affectedSpecies?.length">
            <h3 class="mb-2 text-xs font-bold uppercase tracking-wider text-ink-muted">Especies afectadas</h3>
            <ul class="space-y-1 text-sm italic text-ink-light">
              <li v-for="(sp, i) in selected.affectedSpecies" :key="i">· {{ sp }}</li>
            </ul>
          </div>

          <div v-if="selected.legalActions?.length">
            <h3 class="mb-2 text-xs font-bold uppercase tracking-wider text-ink-muted">Acciones legales</h3>
            <ul class="space-y-1 text-sm text-ink-light">
              <li v-for="(la, i) in selected.legalActions" :key="i" class="flex items-start gap-2">
                <Icon name="lucide:scale" size="14" class="mt-0.5 text-accent" />
                {{ la }}
              </li>
            </ul>
          </div>

          <div v-if="selected.mediaUrls.length">
            <h3 class="mb-2 text-xs font-bold uppercase tracking-wider text-ink-muted">Medios y fuentes</h3>
            <ul class="space-y-1 text-sm">
              <li v-for="(u, i) in selected.mediaUrls" :key="i">
                <a :href="u" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">
                  <Icon name="lucide:external-link" size="12" class="inline" /> {{ u }}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </aside>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useConflictsStore } from '~/stores/conflicts'
import type { SocioEnvironmentalConflict } from '~/types'

const store = useConflictsStore()
const {
  formatConflictIntensity,
  conflictIntensityBadgeClass,
  formatConflictStatus,
  formatThreat,
  formatDate,
} = useFormatters()

const selected = ref<SocioEnvironmentalConflict | null>(null)

const resetFilters = () => {
  store.search = ''
  store.filterIntensity = 'all'
  store.filterStatus = 'all'
  store.filterThreat = 'all'
}
</script>

<style scoped>
.drawer-enter-active { transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1); }
.drawer-leave-active { transition: transform 0.25s ease-in; }
.drawer-enter-from, .drawer-leave-to { transform: translateX(100%); }
</style>

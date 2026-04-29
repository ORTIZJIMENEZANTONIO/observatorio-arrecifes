<template>
  <div>
    <CommonHeroSection compact>
      <div class="max-w-3xl">
        <span class="badge-coral mb-3 bg-white/15 text-white">Aportes de la red</span>
        <h1 class="font-display text-3xl font-extrabold text-white md:text-5xl">Observaciones recientes</h1>
        <p class="mt-3 text-base text-white/80 md:text-lg">
          Fotografías submarinas, vuelos de dron, transectos, muestreos y reportes ciudadanos.
          Cada aporte se etiqueta con su estado de validación y crédito al autor.
        </p>
      </div>
    </CommonHeroSection>

    <section class="section-padding-sm">
      <div class="container-wide">
        <div class="card mb-6 p-4 md:p-5">
          <div class="grid gap-3 md:grid-cols-[1fr_auto_auto]">
            <div class="text-sm text-ink-muted">
              <strong class="text-ink">{{ store.validated.length }}</strong> validadas ·
              <strong class="text-ink">{{ store.pending.length }}</strong> en revisión ·
              <strong class="text-ink">{{ store.observations.length }}</strong> totales
            </div>
            <select v-model="store.filterStatus" class="select py-1.5 text-xs">
              <option value="all">Todos</option>
              <option value="validated">Validadas</option>
              <option value="in_review">En revisión</option>
              <option value="pending">Pendientes</option>
            </select>
            <select v-model="store.filterType" class="select py-1.5 text-xs">
              <option value="all">Todos los tipos</option>
              <option value="underwater_photo">Foto submarina</option>
              <option value="drone_flight">Dron</option>
              <option value="satellite_image">Satelital</option>
              <option value="transect_survey">Transecto</option>
              <option value="water_sample">Muestreo</option>
              <option value="community_report">Reporte</option>
            </select>
          </div>
        </div>

        <div class="space-y-4">
          <article v-for="o in store.filtered" :key="o.id" class="card p-5">
            <div class="flex flex-wrap items-center gap-2">
              <span :class="`badge ${observationStatusBadgeClass(o.status)}`">
                {{ formatObservationStatus(o.status) }}
              </span>
              <span class="badge-secondary">{{ formatObservationType(o.type) }}</span>
              <span class="ml-auto text-[10px] uppercase tracking-wider text-ink-muted">
                {{ formatDate(o.capturedAt) }}
              </span>
            </div>
            <h3 class="mt-2 text-lg font-bold text-ink">{{ o.title }}</h3>
            <p class="mt-1 text-sm leading-relaxed text-slate-custom">{{ o.description }}</p>

            <div class="mt-3 flex flex-wrap gap-1.5">
              <span v-for="t in o.tags" :key="t" class="badge bg-gray-100 text-ink-muted">#{{ t }}</span>
            </div>

            <div class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
              <div class="flex items-center gap-2 text-xs">
                <Icon name="lucide:user" size="14" class="text-primary" />
                <span class="text-ink-light">
                  {{ contributorName(o.contributorId) }}
                </span>
                <span v-if="o.qualityScore" class="ml-2 inline-flex items-center gap-1 rounded-full bg-eco/10 px-2 py-0.5 text-[10px] font-bold text-eco-dark">
                  <Icon name="lucide:star" size="10" />
                  Calidad {{ o.qualityScore }}/100
                </span>
              </div>
              <p v-if="o.reefId" class="text-[11px] text-ink-muted">
                Sitio: <strong class="text-ink">{{ reefName(o.reefId) }}</strong>
              </p>
            </div>
          </article>
        </div>

        <div v-if="!store.filtered.length" class="py-16 text-center">
          <Icon name="lucide:inbox" size="40" class="mx-auto text-ink-muted/40" />
          <p class="mt-3 text-sm text-ink-muted">Sin observaciones con esos filtros.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useObservationsStore } from '~/stores/observations'
import { useContributorsStore } from '~/stores/contributors'
import { useReefsStore } from '~/stores/reefs'

const store = useObservationsStore()
const contributorsStore = useContributorsStore()
const reefsStore = useReefsStore()
const { formatObservationStatus, observationStatusBadgeClass, formatObservationType, formatDate } = useFormatters()

const contributorName = (id: number): string =>
  id === 0 ? 'Anónimo' : contributorsStore.findById(id)?.displayName ?? 'Sin nombre'

const reefName = (id: number): string => reefsStore.findById(id)?.name ?? 'Sin asignar'
</script>

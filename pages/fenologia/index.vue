<template>
  <div>
    <CommonHeroSection compact :eyebrow="hero?.eyebrow" :title="hero?.title" :subtitle="hero?.subtitle" />

    <section class="section-padding-sm">
      <div class="container-wide space-y-6">
        <!-- Wheel mobile-first: chips de mes -->
        <div class="card p-4 md:p-5">
          <p class="text-xs font-medium uppercase tracking-wider text-ink-muted">Elegir mes</p>
          <div class="mt-3 flex flex-wrap gap-2">
            <button
              v-for="m in 12"
              :key="m"
              :class="[
                'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                selectedMonth === m
                  ? 'bg-primary text-white shadow-glow'
                  : 'bg-surface-cool text-ink-muted hover:bg-primary-50 hover:text-primary',
              ]"
              @click="selectedMonth = m"
            >
              {{ monthLabel(m) }}
            </button>
          </div>
        </div>

        <!-- Eventos activos -->
        <div v-if="activeEvents.length" class="grid gap-4 md:grid-cols-2">
          <article v-for="ev in activeEvents" :key="ev.id" class="card p-5">
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
                  <Icon :name="phenologyIcon(ev.type)" size="20" class="text-primary" />
                </div>
                <div>
                  <p class="font-display text-base font-semibold text-ink">{{ ev.title }}</p>
                  <p class="text-xs text-ink-muted">{{ formatPhenologyType(ev.type) }}</p>
                </div>
              </div>
              <span class="badge-coral text-[11px]">{{ rangeLabel(ev.startMonth, ev.endMonth) }}</span>
            </div>
            <p class="mt-3 text-sm text-slate-custom">{{ ev.description }}</p>
            <div v-if="ev.speciesInvolved?.length" class="mt-3 text-xs">
              <p class="font-medium uppercase tracking-wider text-ink-muted">Especies</p>
              <p class="mt-1 italic text-slate-custom">{{ ev.speciesInvolved.join(' · ') }}</p>
            </div>
            <p v-if="ev.source" class="mt-3 text-xs text-ink-muted">Fuente: {{ ev.source }}</p>
          </article>
        </div>

        <div v-else class="card p-10 text-center">
          <Icon name="lucide:calendar-clock" size="32" class="mx-auto text-ink-muted" />
          <p class="mt-3 font-semibold text-ink">Sin eventos activos para {{ monthLabel(selectedMonth) }}</p>
          <p class="text-sm text-ink-muted">Selecciona otro mes en la rueda superior.</p>
        </div>

        <article class="card-glass p-6 md:p-8">
          <h3 class="font-display text-lg font-semibold text-ink">¿Para qué sirve el calendario?</h3>
          <p class="mt-2 text-sm text-slate-custom">
            Planificar campañas de monitoreo coincidentes con eventos clave (desove, agregaciones),
            no chocar campañas turísticas con anidación de tortugas, y anticipar la temporada de
            blanqueamiento. Es la versión visible de algo que la mayoría de operadoras ya saben.
          </p>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { phenologyEvents, eventsByMonth, monthName } from '~/data/phenology-events'

const cms = useCmsContent('fenologia')
const hero = cms.one<{ eyebrow: string; title: string; subtitle: string }>('hero')

const { formatPhenologyType, phenologyIcon } = useFormatters()

const selectedMonth = ref(new Date().getMonth() + 1)
const activeEvents = computed(() => eventsByMonth(selectedMonth.value).filter((e) => e.visible !== false))

const monthLabel = (m: number) => {
  const map = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
  return map[m - 1] ?? ''
}

const rangeLabel = (start: number, end: number) =>
  start === end ? monthLabel(start) : `${monthName(start)}–${monthName(end)}`

useHead({ title: 'Calendario fenológico · Observatorio de Arrecifes' })
</script>

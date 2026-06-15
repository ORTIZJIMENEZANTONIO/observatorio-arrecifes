<template>
  <div>
    <CommonHeroSection compact :eyebrow="hero?.eyebrow" :title="hero?.title" :subtitle="hero?.subtitle" />

    <section class="section-padding-sm">
      <div class="container-wide space-y-6">
        <NuxtLink to="/salud" class="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-primary">
          <Icon name="lucide:chevron-left" size="14" /> Salud del arrecife
        </NuxtLink>

        <!-- KPIs -->
        <div class="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <div v-for="k in kpis" :key="k.label" class="kpi-card">
            <div :class="['flex h-9 w-9 items-center justify-center rounded-lg', kpiIconBg(k.color)]">
              <Icon :name="k.icon" size="18" :class="kpiColor(k.color)" />
            </div>
            <p class="mt-2 text-2xl font-bold text-ink">{{ k.value }}</p>
            <p class="text-xs font-medium uppercase tracking-wider text-ink-muted">{{ k.label }}</p>
          </div>
        </div>

        <!-- Tabla mobile-first -->
        <div class="grid gap-4 md:grid-cols-2">
          <article v-for="r in reports" :key="r.id" class="card p-5">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-display text-base font-semibold text-ink">{{ reefName(r.reefId) }}</p>
                <p class="text-xs text-ink-muted">{{ formatDate(r.observedAt) }}</p>
              </div>
              <span class="badge-accent text-[11px]">{{ formatInvasiveSpecies(r.species) }}</span>
            </div>

            <div class="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div class="rounded-lg bg-surface-cool p-2">
                <p class="text-ink-muted">Observados</p>
                <p class="text-base font-bold text-ink">{{ r.count }}</p>
              </div>
              <div class="rounded-lg bg-surface-cool p-2">
                <p class="text-ink-muted">Removidos</p>
                <p class="text-base font-bold text-eco-dark">{{ r.captured }}</p>
              </div>
              <div class="rounded-lg bg-surface-cool p-2">
                <p class="text-ink-muted">Talla media</p>
                <p class="text-base font-bold text-ink">{{ r.averageSize ? `${r.averageSize} cm` : '—' }}</p>
              </div>
            </div>

            <p v-if="r.team" class="mt-3 text-xs text-ink-muted">Equipo: {{ r.team }}</p>
            <p v-if="r.notes" class="mt-3 border-t border-gray-100 pt-3 text-xs text-slate-custom">{{ r.notes }}</p>
          </article>
        </div>

        <article class="card-glass p-6 md:p-8">
          <h3 class="font-display text-lg font-semibold text-ink">¿Por qué importa?</h3>
          <p class="mt-2 text-sm text-slate-custom">
            En arrecifes experimentales del Caribe, el pez león reduce hasta 79% de la biomasa de
            peces nativos en pocas semanas (Albins &amp; Hixon, 2008). El control es viable: las
            cooperativas mexicanas demuestran que el esfuerzo sostenido baja densidades a niveles
            manejables sin erradicación.
          </p>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useReefsStore } from '~/stores/reefs'
import { invasiveReports } from '~/data/invasive-reports'

const cms = useCmsContent('salud-invasoras')
const hero = cms.one<{ eyebrow: string; title: string; subtitle: string }>('hero')

const reefs = useReefsStore()
const { formatDate, formatInvasiveSpecies, kpiColor, kpiIconBg, formatNumber } = useFormatters()

const reefName = (id: number) => reefs.findById(id)?.name ?? '—'

const reports = computed(() => invasiveReports.filter((r) => r.visible !== false && !r.archived))

const totalCount = computed(() => reports.value.reduce((a, r) => a + r.count, 0))
const totalCaptured = computed(() => reports.value.reduce((a, r) => a + r.captured, 0))
const captureRate = computed(() => Math.round((totalCaptured.value / totalCount.value) * 100))
const sitesActive = computed(() => new Set(reports.value.map((r) => r.reefId)).size)

const kpis = computed(() => [
  { label: 'Sitios bajo control', value: String(sitesActive.value), icon: 'lucide:map-pin', color: 'primary' },
  { label: 'Pez león observado', value: formatNumber(totalCount.value), icon: 'lucide:fish', color: 'accent' },
  { label: 'Removido (capturado)', value: formatNumber(totalCaptured.value), icon: 'lucide:swords', color: 'eco' },
  { label: 'Eficiencia de captura', value: `${captureRate.value}%`, icon: 'lucide:target', color: 'coral' },
])

useHead({ title: 'Especies invasoras · Salud del arrecife · Observatorio de Arrecifes' })
</script>

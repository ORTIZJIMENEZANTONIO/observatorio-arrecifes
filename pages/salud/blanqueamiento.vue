<template>
  <div>
    <CommonHeroSection compact :eyebrow="hero?.eyebrow" :title="hero?.title" :subtitle="hero?.subtitle" />

    <section class="section-padding-sm">
      <div class="container-wide space-y-6">
        <NuxtLink to="/salud" class="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-primary">
          <Icon name="lucide:chevron-left" size="14" /> Salud del arrecife
        </NuxtLink>

        <!-- KPIs -->
        <div class="grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4">
          <div v-for="k in kpis" :key="k.level" class="kpi-card">
            <div :class="['flex h-9 w-9 items-center justify-center rounded-lg', kpiIconBg(k.color)]">
              <Icon name="lucide:thermometer-sun" size="18" :class="kpiColor(k.color)" />
            </div>
            <p class="mt-2 text-2xl font-bold text-ink">{{ k.count }}</p>
            <p class="text-xs font-medium uppercase tracking-wider text-ink-muted">{{ k.label }}</p>
          </div>
        </div>

        <!-- Tabla mobile-first: cards stacked -->
        <div>
          <h3 class="font-display text-lg font-semibold text-ink">Por arrecife</h3>
          <p class="text-sm text-ink-muted">DHW = grados-semana de calentamiento (NOAA Coral Reef Watch, 5 km).</p>

          <div class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <article v-for="r in rows" :key="r.reefId" class="card p-4 md:p-5">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="font-display text-base font-semibold text-ink">{{ r.reef.name }}</p>
                  <p class="text-xs text-ink-muted">{{ r.reef.state }} · {{ formatOcean(r.reef.ocean) }}</p>
                </div>
                <span :class="['badge-primary px-2.5 py-1 text-[11px]', bleachingAlertBadgeClass(r.level)]">
                  {{ formatBleachingAlert(r.level) }}
                </span>
              </div>
              <div class="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div class="rounded-lg bg-surface-cool p-2">
                  <p class="text-ink-muted">DHW</p>
                  <p class="text-base font-bold text-ink">{{ r.dhw?.toFixed(1) ?? '—' }}</p>
                </div>
                <div class="rounded-lg bg-surface-cool p-2">
                  <p class="text-ink-muted">SST</p>
                  <p class="text-base font-bold text-ink">{{ r.sst?.toFixed(1) ?? '—' }}°C</p>
                </div>
                <div class="rounded-lg bg-surface-cool p-2">
                  <p class="text-ink-muted">Δ vs media</p>
                  <p class="text-base font-bold text-ink">{{ r.sstAnomaly !== undefined ? `${r.sstAnomaly >= 0 ? '+' : ''}${r.sstAnomaly.toFixed(1)}°C` : '—' }}</p>
                </div>
              </div>
              <NuxtLink :to="`/livemap?reef=${r.reefId}&layer=noaa-crw-bleaching-alert`" class="mt-4 inline-flex items-center gap-1 text-xs text-primary hover:underline" :data-track="`bleach-livemap-${r.reefId}`">
                Abrir en mapa <Icon name="lucide:arrow-up-right" size="12" />
              </NuxtLink>
            </article>
          </div>
        </div>

        <article class="card-glass p-6 md:p-8">
          <h3 class="font-display text-lg font-semibold text-ink">Lectura del DHW</h3>
          <p class="mt-2 text-sm text-slate-custom">
            DHW &lt; 4: estrés acumulado bajo. 4–8: probable blanqueamiento (alerta 1).
            &gt; 8: blanqueamiento generalizado y mortalidad probable (alerta 2). El umbral se
            calcula sobre la temperatura máxima climatológica mensual (MMM).
          </p>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useReefsStore } from '~/stores/reefs'
import { bleachingAlerts } from '~/data/bleaching-alerts'
import type { BleachingAlertLevel, Ocean } from '~/types'

const cms = useCmsContent('salud-blanqueamiento')
const hero = cms.one<{ eyebrow: string; title: string; subtitle: string }>('hero')

const reefs = useReefsStore()
const {
  formatBleachingAlert,
  bleachingAlertBadgeClass,
  kpiColor,
  kpiIconBg,
} = useFormatters()

const formatOcean = (o: Ocean): string => ({
  caribbean: 'Caribe',
  gulf_of_mexico: 'Golfo de México',
  pacific: 'Pacífico',
}[o] ?? o)

const rows = computed(() =>
  reefs.publicReefs.map((reef) => {
    const alert = bleachingAlerts.find((a) => a.reefId === reef.id)
    return {
      reefId: reef.id,
      reef,
      level: (alert?.level ?? reef.bleachingAlert ?? 'no_stress') as BleachingAlertLevel,
      dhw: alert?.dhw,
      sst: alert?.sst,
      sstAnomaly: alert?.sstAnomaly,
    }
  }),
)

const kpis = computed(() => {
  const counts = { no_stress: 0, watch: 0, warning: 0, alert_1: 0, alert_2: 0 } as Record<BleachingAlertLevel, number>
  for (const r of rows.value) counts[r.level] = (counts[r.level] ?? 0) + 1
  return [
    { level: 'no_stress', label: 'Sin estrés', count: counts.no_stress, color: 'eco' },
    { level: 'watch', label: 'Vigilancia', count: counts.watch, color: 'secondary' },
    { level: 'warning', label: 'Advertencia', count: counts.warning, color: 'accent' },
    { level: 'alert_1', label: 'Alerta 1', count: counts.alert_1, color: 'coral' },
    { level: 'alert_2', label: 'Alerta 2', count: counts.alert_2, color: 'alert' },
  ]
})

useHead({ title: 'Blanqueamiento · Salud del arrecife · Observatorio de Arrecifes' })
</script>

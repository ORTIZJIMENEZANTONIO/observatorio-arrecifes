<template>
  <div>
    <CommonHeroSection compact :eyebrow="hero?.eyebrow" :title="hero?.title" :subtitle="hero?.subtitle" />

    <section class="section-padding-sm">
      <div class="container-wide space-y-6">
        <!-- Ranking -->
        <div>
          <h2 class="font-display text-xl font-bold text-ink">Ranking nacional</h2>
          <p class="text-sm text-ink-muted">Promedio de 8 dimensiones (térmica, enfermedad, pesca, turismo, desarrollo, sargazo, contaminación, huracanes).</p>

          <div class="mt-4 space-y-3">
            <article v-for="(row, idx) in ranked" :key="row.reefId" class="card p-4 md:p-5">
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-3">
                  <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-cool text-sm font-bold text-ink">{{ idx + 1 }}</span>
                  <div>
                    <p class="font-display font-semibold text-ink">{{ reefName(row.reefId) }}</p>
                    <p class="text-xs text-ink-muted">{{ trendLabel(row.trend) }}</p>
                  </div>
                </div>
                <p :class="['font-display text-2xl font-bold', totalColor(row.total)]">{{ row.total }}</p>
              </div>

              <!-- Barras por dimensión, mobile-first -->
              <div class="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                <div v-for="dim in dimsOf(row)" :key="dim.key">
                  <p class="text-[11px] uppercase tracking-wider text-ink-muted">{{ dim.label }}</p>
                  <div class="mt-1 h-2 w-full overflow-hidden rounded-full bg-surface-cool">
                    <div :class="['h-full rounded-full transition-all', barClass(dim.value)]" :style="{ width: dim.value + '%' }" />
                  </div>
                  <p class="mt-0.5 text-[11px] text-ink-muted">{{ dim.value }}</p>
                </div>
              </div>
            </article>
          </div>
        </div>

        <article class="card-glass p-6 md:p-8">
          <h3 class="font-display text-lg font-semibold text-ink">Cómo leer el índice</h3>
          <p class="mt-2 text-sm text-slate-custom">
            Cada dimensión escala de 0 (sin presión documentada) a 100 (presión máxima histórica
            del sistema). El total es el promedio simple — útil para comparar pero ciego al peso
            relativo de cada amenaza. Para política específica, ver la dimensión dominante.
          </p>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useReefsStore } from '~/stores/reefs'
import { pressureIndex, pressureLabel } from '~/data/pressure-index'
import type { PressureIndex } from '~/types'

const cms = useCmsContent('presiones')
const hero = cms.one<{ eyebrow: string; title: string; subtitle: string }>('hero')

const reefs = useReefsStore()
const reefName = (id: number) => reefs.findById(id)?.name ?? `#${id}`

const ranked = computed(() => [...pressureIndex].sort((a, b) => b.total - a.total))

const trendLabel = (t: PressureIndex['trend']): string =>
  ({ improving: 'Tendencia: mejorando', stable: 'Tendencia: estable', worsening: 'Tendencia: empeorando' }[t])

const totalColor = (v: number): string => {
  if (v >= 60) return 'text-alert'
  if (v >= 45) return 'text-coral-dark'
  if (v >= 30) return 'text-accent-dark'
  return 'text-eco-dark'
}

const barClass = (v: number): string => {
  if (v >= 70) return 'bg-alert'
  if (v >= 45) return 'bg-coral'
  if (v >= 20) return 'bg-accent'
  return 'bg-eco'
}

const dimsOf = (p: PressureIndex) => {
  const keys = ['thermal', 'disease', 'fishing', 'tourism', 'development', 'sargasso', 'pollution', 'hurricane'] as const
  return keys.map((k) => ({ key: k, label: pressureLabel(k), value: p[k] }))
}

useHead({ title: 'Presiones acumuladas · Observatorio de Arrecifes' })
</script>

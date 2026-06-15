<template>
  <div>
    <CommonHeroSection compact :eyebrow="hero?.eyebrow" :title="hero?.title" :subtitle="hero?.subtitle" />

    <section class="section-padding-sm">
      <div class="container-wide space-y-6">
        <div class="grid gap-4 lg:grid-cols-2">
          <article v-for="h in tracks" :key="h.id" class="card p-5">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-display text-xl font-bold text-ink">{{ h.name }} <span class="font-normal text-ink-muted">({{ h.year }})</span></p>
                <p class="text-xs text-ink-muted">{{ basinLabel(h.basin) }} · pico cat. {{ h.maxCategory }}</p>
              </div>
              <span :class="['badge-primary text-[11px]', catClass(h.maxCategory)]">Categoría {{ h.maxCategory }}</span>
            </div>

            <p v-if="h.damageSummary" class="mt-3 text-sm text-slate-custom">{{ h.damageSummary }}</p>

            <div class="mt-4 grid grid-cols-3 gap-2 text-xs">
              <div class="rounded-lg bg-surface-cool p-2">
                <p class="text-ink-muted">Entrada</p>
                <p class="font-semibold text-ink">{{ h.landfallDate ?? '—' }}</p>
              </div>
              <div class="rounded-lg bg-surface-cool p-2">
                <p class="text-ink-muted">Arrecifes</p>
                <p class="font-semibold text-ink">{{ h.affectedReefIds.length }}</p>
              </div>
              <div class="rounded-lg bg-surface-cool p-2">
                <p class="text-ink-muted">Recuperación</p>
                <p class="font-semibold text-ink">{{ h.recoveryYears ? `${h.recoveryYears} años` : '—' }}</p>
              </div>
            </div>

            <div class="mt-3 flex flex-wrap gap-1.5">
              <NuxtLink v-for="id in h.affectedReefIds" :key="id" :to="`/inventory?reef=${id}`" class="badge-secondary text-[11px] hover:bg-secondary hover:text-white">
                {{ reefName(id) }}
              </NuxtLink>
            </div>

            <p class="mt-3 text-xs text-ink-muted">Fuente: {{ h.source }}</p>
          </article>
        </div>

        <article class="card-glass p-6 md:p-8">
          <h3 class="font-display text-lg font-semibold text-ink">El doble papel de un huracán</h3>
          <p class="mt-2 text-sm text-slate-custom">
            Los huracanes derriban colonias frágiles y reescriben la estructura del arrecife, pero
            también fragmentan corales viables y airean lagunas hipóxicas. La recuperación depende
            de salud previa: arrecifes sin enfermedad activa se recuperan en 5-10 años; con SCTLD,
            el tiempo se duplica o no llega.
          </p>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useReefsStore } from '~/stores/reefs'
import { hurricaneTracks } from '~/data/hurricane-tracks'

const cms = useCmsContent('huracanes')
const hero = cms.one<{ eyebrow: string; title: string; subtitle: string }>('hero')

const reefs = useReefsStore()
const reefName = (id: number) => reefs.findById(id)?.name ?? `#${id}`

const tracks = computed(() => [...hurricaneTracks].sort((a, b) => b.year - a.year))

const basinLabel = (b: 'atlantic' | 'pacific') => (b === 'atlantic' ? 'Atlántico' : 'Pacífico')

const catClass = (c: number): string => {
  if (c >= 5) return 'bg-alert/15 text-alert-dark'
  if (c >= 4) return 'bg-coral/15 text-coral-dark'
  if (c >= 3) return 'bg-accent/10 text-accent-dark'
  return 'bg-secondary/10 text-secondary-dark'
}

useHead({ title: 'Huracanes históricos · Observatorio de Arrecifes' })
</script>

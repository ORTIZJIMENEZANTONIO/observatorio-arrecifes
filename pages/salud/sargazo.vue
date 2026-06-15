<template>
  <div>
    <CommonHeroSection compact :eyebrow="hero?.eyebrow" :title="hero?.title" :subtitle="hero?.subtitle" />

    <section class="section-padding-sm">
      <div class="container-wide space-y-6">
        <NuxtLink to="/salud" class="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-primary">
          <Icon name="lucide:chevron-left" size="14" /> Salud del arrecife
        </NuxtLink>

        <!-- Estado actual -->
        <div class="grid gap-4 lg:grid-cols-3">
          <article class="card p-6 lg:col-span-2">
            <div class="flex items-center gap-2">
              <span class="live-dot" />
              <p class="text-xs font-medium uppercase tracking-wider text-coral-dark">Capa NOAA SaWS · Riviera Maya</p>
            </div>
            <h3 class="mt-3 font-display text-xl font-bold text-ink">Pico estacional · {{ monthLabel }}</h3>
            <p class="mt-2 text-sm text-slate-custom">
              El sargazo pelágico (Sargassum natans y S. fluitans) arriba al Caribe mexicano cada
              año desde 2011 con biomasas crecientes. En tierra se descompone aportando nutrientes
              y sulfuro de hidrógeno; sobre arrecifes someros bloquea luz y baja oxígeno.
            </p>
            <div class="mt-4 flex flex-wrap gap-2">
              <NuxtLink to="/livemap?layer=noaa-sargassum-watch" class="btn-outline btn-sm" data-track="sargazo-livemap">
                <Icon name="lucide:map" size="14" /> Abrir mapa NOAA SaWS
              </NuxtLink>
              <NuxtLink to="/contribute" class="btn-coral btn-sm" data-track="cta-contribute-sargazo">
                <Icon name="lucide:upload" size="14" /> Reportar arribazón
              </NuxtLink>
            </div>
          </article>
          <article class="kpi-card">
            <Icon name="lucide:thermometer" size="20" class="text-coral" />
            <p class="mt-2 text-2xl font-bold text-ink">+88%</p>
            <p class="text-xs font-medium uppercase tracking-wider text-ink-muted">
              Aumento de biomasa Caribe (2011-2024)
            </p>
            <p class="mt-2 text-xs text-slate-custom">Wang et al. 2019, <em>Science</em>.</p>
          </article>
        </div>

        <!-- Arrecifes afectados -->
        <div>
          <h3 class="font-display text-lg font-semibold text-ink">Arrecifes en ruta de arribazón</h3>
          <p class="text-sm text-ink-muted">Caribe mexicano, abril-agosto típicamente.</p>
          <div class="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <article v-for="reef in affectedReefs" :key="reef.id" class="card p-4">
              <p class="font-display font-semibold text-ink">{{ reef.name }}</p>
              <p class="text-xs text-ink-muted">{{ reef.state }}</p>
              <NuxtLink :to="`/livemap?reef=${reef.id}&layer=noaa-sargassum-watch`" class="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                Ver pluma actual <Icon name="lucide:arrow-up-right" size="12" />
              </NuxtLink>
            </article>
          </div>
        </div>

        <article class="card-glass p-6 md:p-8">
          <h3 class="font-display text-lg font-semibold text-ink">¿Por qué no es sólo problema de turismo?</h3>
          <p class="mt-2 text-sm text-slate-custom">
            En descomposición, el sargazo libera nutrientes y crea condiciones hipóxicas en
            costas con saneamiento limitado. El efecto combinado con descargas residuales acelera
            el crecimiento de macroalgas sobre coral. Por eso la salida es manejo terrestre
            (saneamiento, captación) <em>y</em> contención marina, no sólo limpieza de playa.
          </p>
          <NuxtLink to="/policy/aguas-residuales-rivera-maya" class="btn-outline btn-sm mt-4">
            <Icon name="lucide:file-text" size="14" /> Brief de aguas residuales
          </NuxtLink>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useReefsStore } from '~/stores/reefs'

const cms = useCmsContent('salud-sargazo')
const hero = cms.one<{ eyebrow: string; title: string; subtitle: string }>('hero')

const reefs = useReefsStore()
const affectedReefs = computed(() => reefs.publicReefs.filter((r) => r.ocean === 'caribbean'))

const monthLabel = new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' }).format(new Date())

useHead({ title: 'Sargazo · Salud del arrecife · Observatorio de Arrecifes' })
</script>

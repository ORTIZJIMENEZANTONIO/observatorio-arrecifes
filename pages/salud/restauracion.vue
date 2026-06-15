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

        <!-- Filtros -->
        <div class="card p-4 md:p-5">
          <div class="grid gap-3 md:grid-cols-2">
            <div class="form-group">
              <label class="form-label">Método</label>
              <select v-model="filterMethod" class="select">
                <option value="all">Todos los métodos</option>
                <option value="coral_garden">Vivero suspendido</option>
                <option value="micro_fragmentation">Micro-fragmentación</option>
                <option value="larval_propagation">Crianza sexual</option>
                <option value="outplanting">Transplante</option>
                <option value="reef_balls">Estructuras artificiales</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Litoral</label>
              <select v-model="filterOcean" class="select">
                <option value="all">Caribe + Golfo + Pacífico</option>
                <option value="caribbean">Caribe</option>
                <option value="gulf_of_mexico">Golfo de México</option>
                <option value="pacific">Pacífico</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Cards de sitio -->
        <div class="grid gap-4 md:grid-cols-2">
          <article v-for="site in filtered" :key="site.id" class="card p-5">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-display text-base font-semibold text-ink">{{ site.name }}</p>
                <p class="text-xs text-ink-muted">{{ reefName(site.reefId) }} · desde {{ year(site.startedAt) }}</p>
              </div>
              <span :class="['badge-eco text-[11px]', site.active ? '' : 'opacity-50']">
                {{ site.active ? 'Activo' : 'Pausado' }}
              </span>
            </div>

            <p class="mt-3 text-sm text-slate-custom">{{ site.institution }}</p>

            <div class="mt-4 grid grid-cols-3 gap-2 text-xs">
              <div class="rounded-lg bg-surface-cool p-2">
                <p class="text-ink-muted">Fragmentos</p>
                <p class="text-base font-bold text-ink">{{ formatNumber(site.fragmentsProduced) }}</p>
              </div>
              <div class="rounded-lg bg-surface-cool p-2">
                <p class="text-ink-muted">Transplantados</p>
                <p class="text-base font-bold text-ink">{{ formatNumber(site.outplanted) }}</p>
              </div>
              <div class="rounded-lg bg-surface-cool p-2">
                <p class="text-ink-muted">Supervivencia</p>
                <p class="text-base font-bold text-ink">{{ site.survivalRate }}%</p>
              </div>
            </div>

            <div class="mt-3">
              <p class="text-xs font-medium uppercase tracking-wider text-ink-muted">Métodos</p>
              <ul class="mt-1 flex flex-wrap gap-1.5">
                <li v-for="m in site.methodsUsed" :key="m" class="badge-secondary text-[11px]">
                  {{ formatRestorationMethod(m) }}
                </li>
              </ul>
            </div>

            <div class="mt-3">
              <p class="text-xs font-medium uppercase tracking-wider text-ink-muted">Especies producidas</p>
              <p class="mt-1 text-sm italic text-slate-custom">{{ site.speciesProduced.join(' · ') }}</p>
            </div>

            <p v-if="site.notes" class="mt-3 border-t border-gray-100 pt-3 text-xs text-slate-custom">
              {{ site.notes }}
            </p>

            <div class="mt-4 flex flex-wrap gap-2">
              <a v-if="site.websiteUrl" :href="site.websiteUrl" target="_blank" rel="noopener" class="text-xs text-primary hover:underline">
                Sitio del programa <Icon name="lucide:arrow-up-right" size="12" class="inline" />
              </a>
              <NuxtLink :to="`/livemap?reef=${site.reefId}`" class="text-xs text-primary hover:underline">
                Ver arrecife en mapa
              </NuxtLink>
            </div>
          </article>
        </div>

        <article class="card-glass p-6 md:p-8">
          <h3 class="font-display text-lg font-semibold text-ink">¿Cómo se mide el éxito?</h3>
          <p class="mt-2 text-sm text-slate-custom">
            Tasa de supervivencia a 12 meses (estándar de campo) más cobertura coral en el sitio
            antes/después. La crianza sexual diversifica genéticamente la población, pero su
            supervivencia inicial es menor que el transplante directo de fragmentos.
          </p>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useReefsStore } from '~/stores/reefs'
import { restorationSites } from '~/data/restoration-sites'
import type { RestorationMethod, Ocean } from '~/types'

const cms = useCmsContent('salud-restauracion')
const hero = cms.one<{ eyebrow: string; title: string; subtitle: string }>('hero')

const reefs = useReefsStore()
const { kpiColor, kpiIconBg, formatNumber, formatRestorationMethod } = useFormatters()

const filterMethod = ref<'all' | RestorationMethod>('all')
const filterOcean = ref<'all' | Ocean>('all')

const reefName = (id: number) => reefs.findById(id)?.name ?? '—'
const reefOcean = (id: number) => reefs.findById(id)?.ocean ?? null
const year = (iso: string) => new Date(iso).getFullYear()

const filtered = computed(() =>
  restorationSites
    .filter((s) => s.visible !== false && !s.archived)
    .filter((s) => filterMethod.value === 'all' || s.methodsUsed.includes(filterMethod.value))
    .filter((s) => filterOcean.value === 'all' || reefOcean(s.reefId) === filterOcean.value),
)

const totalOutplanted = computed(() => restorationSites.reduce((a, s) => a + s.outplanted, 0))
const avgSurvival = computed(() =>
  Math.round(restorationSites.reduce((a, s) => a + s.survivalRate, 0) / restorationSites.length),
)
const totalSpecies = computed(() => new Set(restorationSites.flatMap((s) => s.speciesProduced)).size)

const kpis = computed(() => [
  { label: 'Sitios activos', value: String(restorationSites.filter((s) => s.active).length), icon: 'lucide:sprout', color: 'eco' },
  { label: 'Fragmentos transplantados', value: formatNumber(totalOutplanted.value), icon: 'lucide:waves', color: 'primary' },
  { label: 'Supervivencia media', value: `${avgSurvival.value}%`, icon: 'lucide:trending-up', color: 'secondary' },
  { label: 'Especies en programa', value: String(totalSpecies.value), icon: 'lucide:leaf', color: 'coral' },
])

useHead({ title: 'Restauración coralina · Salud del arrecife · Observatorio de Arrecifes' })
</script>

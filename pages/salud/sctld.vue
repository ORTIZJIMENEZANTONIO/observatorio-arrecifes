<template>
  <div>
    <CommonHeroSection compact :eyebrow="hero?.eyebrow" :title="hero?.title" :subtitle="hero?.subtitle" />

    <section class="section-padding-sm">
      <div class="container-wide space-y-6">
        <!-- Crumb back -->
        <NuxtLink to="/salud" class="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-primary">
          <Icon name="lucide:chevron-left" size="14" /> Salud del arrecife
        </NuxtLink>

        <!-- KPIs -->
        <div class="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <div v-for="k in kpis" :key="k.label" class="kpi-card">
            <div class="flex items-start justify-between">
              <div :class="['flex h-9 w-9 items-center justify-center rounded-lg', kpiIconBg(k.color)]">
                <Icon :name="k.icon" size="18" :class="kpiColor(k.color)" />
              </div>
            </div>
            <p class="mt-2 text-2xl font-bold text-ink">{{ k.value }}</p>
            <p class="text-xs font-medium uppercase tracking-wider text-ink-muted">{{ k.label }}</p>
          </div>
        </div>

        <!-- Filtros (sólo severidad / arrecife) -->
        <div class="card p-4 md:p-5">
          <div class="grid gap-3 md:grid-cols-3">
            <div class="form-group">
              <label class="form-label">Severidad</label>
              <select v-model="filterSeverity" class="select">
                <option value="all">Todas</option>
                <option value="incipient">Incipiente (&lt;5%)</option>
                <option value="progressing">Progresando (5–25%)</option>
                <option value="advanced">Avanzada (25–60%)</option>
                <option value="epidemic">Epidémica (&gt;60%)</option>
                <option value="recovering">En recuperación</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Arrecife</label>
              <select v-model.number="filterReefId" class="select">
                <option :value="0">Todos</option>
                <option v-for="r in reefs.publicReefs" :key="r.id" :value="r.id">{{ r.name }}</option>
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
          <div class="mt-3 flex items-center justify-between text-xs text-ink-muted">
            <span>{{ filtered.length }} reporte{{ filtered.length === 1 ? '' : 's' }}</span>
            <button class="btn-ghost btn-sm" @click="resetFilters">Limpiar filtros</button>
          </div>
        </div>

        <!-- Listado: cards mobile-first -->
        <div v-if="filtered.length" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <article v-for="rep in filtered" :key="rep.id" class="card p-5">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-display text-base font-semibold text-ink">{{ reefName(rep.reefId) }}</p>
                <p class="text-xs text-ink-muted">{{ formatDate(rep.observedAt) }} · profundidad {{ rep.depth ?? '—' }} m</p>
              </div>
              <span :class="['badge-primary px-2.5 py-1 text-[11px]', diseaseSeverityBadgeClass(rep.severity)]">
                {{ formatDiseaseSeverity(rep.severity) }}
              </span>
            </div>

            <div class="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-surface-cool px-3 py-2 text-xs">
              <div>
                <p class="text-ink-muted">Prevalencia</p>
                <p class="font-semibold text-ink">{{ rep.prevalence }}%</p>
              </div>
              <div>
                <p class="text-ink-muted">Agente</p>
                <p class="font-semibold text-ink">{{ formatDiseaseAgent(rep.agent) }}</p>
              </div>
            </div>

            <div class="mt-3">
              <p class="text-xs font-medium uppercase tracking-wider text-ink-muted">Especies afectadas</p>
              <p class="mt-1 text-sm italic text-slate-custom">{{ rep.speciesAffected.join(' · ') }}</p>
            </div>

            <div v-if="rep.interventions.length" class="mt-3">
              <p class="text-xs font-medium uppercase tracking-wider text-ink-muted">Intervenciones</p>
              <ul class="mt-1 flex flex-wrap gap-1.5">
                <li v-for="i in rep.interventions" :key="i" class="badge-secondary text-[11px]">
                  {{ interventionLabel(i) }}
                </li>
              </ul>
              <p v-if="rep.interventionTeam" class="mt-1 text-xs text-ink-muted">
                Equipo: {{ rep.interventionTeam }}
              </p>
            </div>

            <p v-if="rep.notes" class="mt-3 border-t border-gray-100 pt-3 text-xs text-slate-custom">
              {{ rep.notes }}
            </p>
          </article>
        </div>

        <div v-else class="card p-10 text-center">
          <Icon name="lucide:search-x" size="32" class="mx-auto text-ink-muted" />
          <p class="mt-3 font-semibold text-ink">Sin reportes para los filtros</p>
          <p class="text-sm text-ink-muted">Prueba ampliar el criterio o limpiar filtros.</p>
        </div>

        <!-- Cómo reportar -->
        <article class="card-glass p-6 md:p-8">
          <div class="grid gap-4 md:grid-cols-2 md:items-start">
            <div>
              <Icon name="lucide:camera" size="28" class="text-coral" />
              <h3 class="mt-3 font-display text-lg font-semibold text-ink">¿Viste signos de SCTLD?</h3>
              <p class="mt-2 text-sm text-slate-custom">
                Pérdida de tejido rápida en colonias adultas de Orbicella, Diploria, Colpophyllia
                o Dendrogyra. Si tienes foto y ubicación, repórtalo — el equipo valida y suma al
                mapa nacional.
              </p>
            </div>
            <div class="space-y-2 text-sm">
              <NuxtLink to="/contribute" class="btn-coral w-full justify-center" data-track="cta-contribute-sctld">
                <Icon name="lucide:upload" size="16" /> Reportar caso
              </NuxtLink>
              <NuxtLink to="/protocolos" class="btn-outline w-full justify-center" data-track="cta-protocols-sctld">
                <Icon name="lucide:book-open" size="16" /> Guía visual SCTLD
              </NuxtLink>
              <NuxtLink to="/policy/sctld-sam-mx" class="btn-ghost w-full justify-center" data-track="cta-policy-sctld">
                <Icon name="lucide:file-text" size="16" /> Policy brief asociado
              </NuxtLink>
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useReefsStore } from '~/stores/reefs'
import { sctldReports } from '~/data/disease-reports'
import type { DiseaseSeverity, DiseaseIntervention, Ocean } from '~/types'

const cms = useCmsContent('salud-sctld')
const hero = cms.one<{ eyebrow: string; title: string; subtitle: string }>('hero')

const reefs = useReefsStore()
const {
  formatDate,
  formatDiseaseSeverity,
  diseaseSeverityBadgeClass,
  formatDiseaseAgent,
  kpiColor,
  kpiIconBg,
  formatNumber,
} = useFormatters()

const filterSeverity = ref<'all' | DiseaseSeverity>('all')
const filterReefId = ref<number>(0)
const filterOcean = ref<'all' | Ocean>('all')

const reefName = (id: number) => reefs.findById(id)?.name ?? '—'
const reefOcean = (id: number) => reefs.findById(id)?.ocean ?? null

const filtered = computed(() =>
  sctldReports.filter((r) => {
    if (filterSeverity.value !== 'all' && r.severity !== filterSeverity.value) return false
    if (filterReefId.value && r.reefId !== filterReefId.value) return false
    if (filterOcean.value !== 'all' && reefOcean(r.reefId) !== filterOcean.value) return false
    return true
  }),
)

const resetFilters = () => {
  filterSeverity.value = 'all'
  filterReefId.value = 0
  filterOcean.value = 'all'
}

const interventionLabel = (i: DiseaseIntervention): string => ({
  amoxicillin_paste: 'Pasta amoxicilina',
  chlorinated_paste: 'Pasta clorada',
  ablation: 'Ablación',
  monitoring_only: 'Vigilancia',
  fragment_rescue: 'Rescate de fragmentos',
}[i] ?? i)

const avgPrevalence = computed(() => {
  if (!sctldReports.length) return 0
  return Math.round(sctldReports.reduce((acc, r) => acc + r.prevalence, 0) / sctldReports.length)
})

const epidemicCount = computed(() => sctldReports.filter((r) => r.severity === 'epidemic' || r.severity === 'advanced').length)
const interventionCount = computed(() =>
  sctldReports.filter((r) => r.interventions.some((i) => i !== 'monitoring_only')).length,
)

const kpis = computed(() => [
  { label: 'Arrecifes con SCTLD', value: String(new Set(sctldReports.map((r) => r.reefId)).size), icon: 'lucide:biohazard', color: 'alert' },
  { label: 'Prevalencia promedio', value: `${avgPrevalence.value}%`, icon: 'lucide:activity', color: 'coral' },
  { label: 'Casos en epidemia/avanzados', value: String(epidemicCount.value), icon: 'lucide:flame', color: 'accent' },
  { label: 'Sitios bajo tratamiento', value: String(interventionCount.value), icon: 'lucide:syringe', color: 'eco' },
])

useHead({ title: 'SCTLD · Salud del arrecife · Observatorio de Arrecifes' })
</script>

<template>
  <div>
    <CommonHeroSection compact :eyebrow="hero?.eyebrow" :title="hero?.title" :subtitle="hero?.subtitle" />

    <section class="section-padding-sm">
      <div class="container-wide space-y-6">
        <!-- Filtros -->
        <div class="card p-4 md:p-5">
          <div class="grid gap-3 md:grid-cols-3">
            <div class="form-group md:col-span-1">
              <label class="form-label">Buscar</label>
              <input v-model="search" type="text" class="input" placeholder="SCTLD, Cabo Pulmo, aguas residuales..." />
            </div>
            <div class="form-group">
              <label class="form-label">Estado</label>
              <select v-model="filterStatus" class="select">
                <option value="all">Todos</option>
                <option value="urgent">Urgente</option>
                <option value="published">Publicado</option>
                <option value="draft">Borrador</option>
                <option value="adopted">Adoptado</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Audiencia</label>
              <select v-model="filterAudience" class="select">
                <option value="all">Cualquier audiencia</option>
                <option value="conanp">CONANP</option>
                <option value="semarnat">SEMARNAT</option>
                <option value="state_government">Gobiernos estatales</option>
                <option value="municipal">Municipios</option>
                <option value="sectur">SECTUR</option>
                <option value="sader_conapesca">SADER / CONAPESCA</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Lista -->
        <div class="grid gap-4 md:grid-cols-2">
          <article v-for="brief in filtered" :key="brief.id" class="card-interactive p-6">
            <div class="flex items-start justify-between gap-3">
              <span :class="['badge-primary px-2.5 py-1 text-[11px]', policyStatusBadgeClass(brief.status)]">
                {{ formatPolicyStatus(brief.status) }}
              </span>
              <span class="text-xs text-ink-muted">{{ formatDate(brief.publishedAt) }}</span>
            </div>
            <h3 class="mt-3 font-display text-lg font-bold text-ink">{{ brief.title }}</h3>
            <p class="mt-2 text-sm text-slate-custom">{{ brief.summary }}</p>
            <div class="mt-3 flex flex-wrap gap-1.5">
              <span v-for="a in brief.audience" :key="a" class="badge-secondary text-[11px]">{{ formatAudience(a) }}</span>
            </div>
            <div class="mt-4 flex items-center justify-between">
              <p class="text-xs text-ink-muted">
                Responsable: <span class="text-ink">{{ brief.responsibleActor }}</span>
              </p>
              <NuxtLink :to="`/policy/${brief.slug}`" class="text-sm font-medium text-primary hover:underline" :data-track="`policy-${brief.slug}`">
                Leer →
              </NuxtLink>
            </div>
          </article>
        </div>

        <!-- Empty -->
        <div v-if="!filtered.length" class="card p-10 text-center">
          <Icon name="lucide:search-x" size="32" class="mx-auto text-ink-muted" />
          <p class="mt-3 font-semibold text-ink">Sin briefs para esos filtros</p>
        </div>

        <article class="card-glass p-6 md:p-8">
          <h3 class="font-display text-lg font-semibold text-ink">¿Cómo se construye un brief?</h3>
          <p class="mt-2 text-sm text-slate-custom">
            Cada brief parte de evidencia satelital y de campo, identifica el problema con
            claridad, lista 3-5 recomendaciones priorizadas, asigna un responsable y propone
            un plazo. Listo para enviarse al tomador de decisión y para citarse en publicación.
          </p>
          <NuxtLink to="/citar" class="btn-outline btn-sm mt-4">
            <Icon name="lucide:quote" size="14" /> Cómo citar el observatorio
          </NuxtLink>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { policyBriefs } from '~/data/policy-briefs'
import type { PolicyAudience, PolicyStatus } from '~/types'

const cms = useCmsContent('policy')
const hero = cms.one<{ eyebrow: string; title: string; subtitle: string }>('hero')

const { formatDate, formatAudience, formatPolicyStatus, policyStatusBadgeClass } = useFormatters()

const search = ref('')
const filterStatus = ref<'all' | PolicyStatus>('all')
const filterAudience = ref<'all' | PolicyAudience>('all')

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return policyBriefs.filter((b) => {
    if (b.visible === false || b.archived) return false
    if (q && !`${b.title} ${b.summary}`.toLowerCase().includes(q)) return false
    if (filterStatus.value !== 'all' && b.status !== filterStatus.value) return false
    if (filterAudience.value !== 'all' && !b.audience.includes(filterAudience.value)) return false
    return true
  })
})

useHead({ title: 'Policy briefs · Observatorio de Arrecifes' })
</script>

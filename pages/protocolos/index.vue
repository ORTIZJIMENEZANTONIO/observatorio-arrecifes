<template>
  <div>
    <CommonHeroSection compact :eyebrow="hero?.eyebrow" :title="hero?.title" :subtitle="hero?.subtitle" />

    <section class="section-padding-sm">
      <div class="container-wide space-y-6">
        <!-- Filtros -->
        <div class="card p-4 md:p-5">
          <div class="grid gap-3 md:grid-cols-3">
            <div class="form-group">
              <label class="form-label">Tema</label>
              <select v-model="filterTopic" class="select">
                <option value="all">Todos</option>
                <option value="bleaching">Blanqueamiento</option>
                <option value="sctld">SCTLD</option>
                <option value="lionfish">Pez león</option>
                <option value="sargasso">Sargazo</option>
                <option value="transect">Transecto</option>
                <option value="identification">Identificación</option>
                <option value="water_quality">Calidad del agua</option>
                <option value="ethics">Ética</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Nivel</label>
              <select v-model="filterLevel" class="select">
                <option value="all">Cualquier nivel</option>
                <option value="principiante">Principiante</option>
                <option value="intermedio">Intermedio</option>
                <option value="avanzado">Avanzado</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Buscar</label>
              <input v-model="search" type="text" class="input" placeholder="CoralWatch, AGRRA, captura..." />
            </div>
          </div>
        </div>

        <!-- Cards -->
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <article v-for="p in filtered" :key="p.id" class="card-interactive p-5">
            <div class="flex items-start justify-between gap-3">
              <span class="badge-secondary text-[11px]">{{ formatProtocolTopic(p.topic) }}</span>
              <span class="text-[11px] text-ink-muted">{{ formatProtocolLevel(p.level) }}</span>
            </div>
            <h3 class="mt-3 font-display text-base font-bold text-ink">{{ p.title }}</h3>
            <p class="mt-2 text-sm text-slate-custom">{{ p.description }}</p>

            <div class="mt-3 flex flex-wrap gap-1.5">
              <span v-if="p.source" class="badge-primary text-[11px]">{{ p.source }}</span>
              <span v-if="p.language === 'bilingual'" class="badge-eco text-[11px]">ES + EN</span>
              <span v-if="p.estimatedTime" class="badge-accent text-[11px]">{{ p.estimatedTime }}</span>
            </div>

            <div class="mt-4 flex items-center justify-between">
              <span class="inline-flex items-center gap-1 text-xs text-ink-muted">
                <Icon :name="formatIcon(p.format)" size="14" /> {{ formatLabel(p.format) }}
              </span>
              <a v-if="p.fileUrl" :href="p.fileUrl" target="_blank" rel="noopener" class="btn-outline btn-sm" :data-track="`protocol-${p.id}`">
                Abrir <Icon name="lucide:arrow-up-right" size="14" />
              </a>
              <NuxtLink v-else-if="p.format === 'webform'" to="/contribute" class="btn-outline btn-sm">
                Reportar <Icon name="lucide:upload" size="14" />
              </NuxtLink>
              <span v-else class="text-xs text-ink-muted">Próximamente</span>
            </div>
          </article>
        </div>

        <article class="card-glass p-6 md:p-8">
          <h3 class="font-display text-lg font-semibold text-ink">¿Faltan protocolos?</h3>
          <p class="mt-2 text-sm text-slate-custom">
            Si tu cooperativa, comunidad o equipo de investigación tiene un protocolo validado
            que pueda compartirse aquí, contáctanos. Buscamos guías en español, breves y con
            material visual.
          </p>
          <NuxtLink to="/contribute" class="btn-coral btn-sm mt-4" data-track="cta-contribute-protocol">
            Compartir un protocolo
          </NuxtLink>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { protocols } from '~/data/protocols'
import type { ProtocolTopic, ProtocolLevel, ProtocolFormat } from '~/types'

const cms = useCmsContent('protocolos')
const hero = cms.one<{ eyebrow: string; title: string; subtitle: string }>('hero')

const { formatProtocolTopic, formatProtocolLevel } = useFormatters()

const search = ref('')
const filterTopic = ref<'all' | ProtocolTopic>('all')
const filterLevel = ref<'all' | ProtocolLevel>('all')

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return protocols
    .filter((p) => p.visible !== false && !p.archived)
    .filter((p) => (q ? `${p.title} ${p.description}`.toLowerCase().includes(q) : true))
    .filter((p) => filterTopic.value === 'all' || p.topic === filterTopic.value)
    .filter((p) => filterLevel.value === 'all' || p.level === filterLevel.value)
})

const formatIcon = (f: ProtocolFormat): string => ({
  pdf: 'lucide:file-text',
  video: 'lucide:play-circle',
  webform: 'lucide:form-input',
  card: 'lucide:credit-card',
  manual: 'lucide:book-open',
}[f] ?? 'lucide:file')

const formatLabel = (f: ProtocolFormat): string => ({
  pdf: 'PDF',
  video: 'Video',
  webform: 'Formulario',
  card: 'Tarjeta de campo',
  manual: 'Manual',
}[f] ?? f)

useHead({ title: 'Protocolos · Observatorio de Arrecifes' })
</script>

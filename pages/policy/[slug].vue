<template>
  <div>
    <CommonHeroSection v-if="brief" compact :eyebrow="`${formatPolicyStatus(brief.status)} · brief de política`" :title="brief.title" :subtitle="brief.summary" />

    <section v-if="brief" class="section-padding-sm">
      <div class="container-narrow space-y-8">
        <NuxtLink to="/policy" class="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-primary">
          <Icon name="lucide:chevron-left" size="14" /> Briefs
        </NuxtLink>

        <!-- Metadatos -->
        <div class="grid gap-3 md:grid-cols-3">
          <div class="card p-4">
            <p class="text-xs font-medium uppercase tracking-wider text-ink-muted">Responsable</p>
            <p class="mt-1 text-sm font-semibold text-ink">{{ brief.responsibleActor }}</p>
          </div>
          <div class="card p-4">
            <p class="text-xs font-medium uppercase tracking-wider text-ink-muted">Plazo propuesto</p>
            <p class="mt-1 text-sm font-semibold text-ink">{{ brief.timeframe ?? '—' }}</p>
          </div>
          <div class="card p-4">
            <p class="text-xs font-medium uppercase tracking-wider text-ink-muted">Publicado</p>
            <p class="mt-1 text-sm font-semibold text-ink">{{ formatDate(brief.publishedAt) }}</p>
          </div>
        </div>

        <!-- Audiencias -->
        <section>
          <h2 class="font-display text-xl font-bold text-ink">Audiencias</h2>
          <div class="mt-3 flex flex-wrap gap-2">
            <span v-for="a in brief.audience" :key="a" class="badge-secondary">{{ formatAudience(a) }}</span>
          </div>
        </section>

        <!-- Problema -->
        <section>
          <h2 class="font-display text-xl font-bold text-ink">El problema</h2>
          <p class="mt-3 whitespace-pre-line text-base text-slate-custom">{{ brief.problem }}</p>
        </section>

        <!-- Evidencia -->
        <section>
          <h2 class="font-display text-xl font-bold text-ink">Evidencia</h2>
          <ul class="mt-3 space-y-2">
            <li v-for="(e, idx) in brief.evidence" :key="idx" class="flex gap-3 text-sm text-slate-custom">
              <Icon name="lucide:circle-check" size="18" class="mt-0.5 shrink-0 text-eco" />
              <span>{{ e }}</span>
            </li>
          </ul>
        </section>

        <!-- Recomendaciones -->
        <section>
          <h2 class="font-display text-xl font-bold text-ink">Recomendaciones priorizadas</h2>
          <ol class="mt-3 space-y-3">
            <li v-for="(r, idx) in brief.recommendations" :key="idx" class="card p-4">
              <div class="flex gap-3">
                <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-sm font-bold text-primary">{{ idx + 1 }}</span>
                <p class="text-sm text-ink">{{ r }}</p>
              </div>
            </li>
          </ol>
        </section>

        <!-- Arrecifes asociados -->
        <section v-if="brief.reefIds.length">
          <h2 class="font-display text-xl font-bold text-ink">Arrecifes vinculados</h2>
          <div class="mt-3 flex flex-wrap gap-2">
            <NuxtLink v-for="id in brief.reefIds" :key="id" :to="`/inventory?reef=${id}`" class="badge-primary hover:bg-primary hover:text-white">
              {{ reefName(id) }}
            </NuxtLink>
          </div>
        </section>

        <!-- Cita -->
        <section v-if="brief.citation" class="card p-5 bg-surface-cool">
          <p class="text-xs font-medium uppercase tracking-wider text-ink-muted">Cita sugerida (APA)</p>
          <p class="mt-2 text-sm text-ink">{{ brief.citation }}</p>
          <button class="btn-ghost btn-sm mt-3" :data-track="`policy-copy-${brief.slug}`" @click="copyCitation">
            <Icon name="lucide:clipboard-copy" size="14" /> {{ copyState }}
          </button>
        </section>

        <!-- Autoría -->
        <p class="text-xs text-ink-muted">
          Autoría: {{ brief.authors.join(', ') }}
        </p>
      </div>
    </section>

    <section v-else class="section-padding">
      <div class="container-narrow card p-10 text-center">
        <Icon name="lucide:file-x" size="32" class="mx-auto text-ink-muted" />
        <p class="mt-3 font-semibold text-ink">Brief no encontrado</p>
        <NuxtLink to="/policy" class="btn-outline btn-sm mt-4">Ver todos</NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useReefsStore } from '~/stores/reefs'
import { policyBriefs } from '~/data/policy-briefs'

const route = useRoute()
const slug = computed(() => String(route.params.slug ?? ''))
const brief = computed(() => policyBriefs.find((b) => b.slug === slug.value))

const reefs = useReefsStore()
const reefName = (id: number) => reefs.findById(id)?.name ?? `#${id}`

const { formatDate, formatAudience, formatPolicyStatus } = useFormatters()

const copyState = ref('Copiar cita')
const copyCitation = async () => {
  if (!brief.value?.citation) return
  try {
    await navigator.clipboard.writeText(brief.value.citation)
    copyState.value = '¡Copiada!'
    setTimeout(() => (copyState.value = 'Copiar cita'), 1800)
  } catch {
    copyState.value = 'No se pudo copiar'
  }
}

useHead(() => ({ title: brief.value ? `${brief.value.title} · Policy brief` : 'Brief — Observatorio de Arrecifes' }))
</script>

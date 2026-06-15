<template>
  <div v-if="story">
    <!-- Cover -->
    <section class="relative h-[60vh] min-h-[420px] overflow-hidden">
      <div class="absolute inset-0">
        <img v-if="story.cover" :src="story.cover" :alt="story.title" class="h-full w-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/80" />
      </div>
      <div class="relative z-10 flex h-full items-end">
        <div class="container-narrow pb-10 text-white">
          <NuxtLink to="/historias" class="mb-4 inline-flex items-center gap-1 text-xs text-white/80 hover:text-white">
            <Icon name="lucide:chevron-left" size="14" /> Historias
          </NuxtLink>
          <span class="badge-coral mb-3 bg-white/15 text-white">{{ topicLabel(story.topic) }} · {{ story.estimatedMinutes }} min</span>
          <h1 class="font-display text-3xl font-extrabold md:text-5xl">{{ story.title }}</h1>
          <p class="mt-3 text-base text-white/85 md:text-lg">{{ story.subtitle }}</p>
        </div>
      </div>
    </section>

    <!-- Secciones scroll-driven -->
    <section class="section-padding-sm">
      <div class="container-narrow space-y-12">
        <article v-for="(s, idx) in story.sections" :key="idx" class="reveal">
          <p v-if="s.year" class="text-xs font-medium uppercase tracking-wider text-coral-dark">{{ s.year }}</p>
          <h2 class="mt-2 font-display text-2xl font-bold text-ink md:text-3xl">{{ s.heading }}</h2>
          <p class="mt-3 whitespace-pre-line text-base text-slate-custom md:text-lg">{{ s.body }}</p>
          <div v-if="s.reefIds?.length" class="mt-4 flex flex-wrap gap-2">
            <NuxtLink v-for="id in s.reefIds" :key="id" :to="`/livemap?reef=${id}`" class="badge-secondary text-[11px] hover:bg-secondary hover:text-white">
              {{ reefName(id) }}
            </NuxtLink>
          </div>
        </article>

        <article class="card-glass p-6 md:p-8">
          <p class="text-xs text-ink-muted">Autoría: {{ story.authors.join(', ') }} · publicado {{ story.publishedAt }}</p>
          <NuxtLink to="/historias" class="btn-outline btn-sm mt-3">Ver más historias</NuxtLink>
        </article>
      </div>
    </section>
  </div>

  <section v-else class="section-padding">
    <div class="container-narrow card p-10 text-center">
      <Icon name="lucide:file-x" size="32" class="mx-auto text-ink-muted" />
      <p class="mt-3 font-semibold text-ink">Historia no encontrada</p>
      <NuxtLink to="/historias" class="btn-outline btn-sm mt-4">Ver todas</NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useReefsStore } from '~/stores/reefs'
import { storyMaps } from '~/data/story-maps'

const route = useRoute()
const slug = computed(() => String(route.params.slug ?? ''))
const story = computed(() => storyMaps.find((s) => s.slug === slug.value))

const reefs = useReefsStore()
const reefName = (id: number) => reefs.findById(id)?.name ?? `#${id}`

const topicLabel = (t: string): string => ({
  sctld: 'SCTLD',
  bleaching: 'Blanqueamiento',
  restoration: 'Restauración',
  conflict: 'Conflicto',
  community: 'Comunidad',
  policy: 'Política pública',
}[t] ?? t)

useHead(() => ({ title: story.value ? `${story.value.title} · Historias` : 'Historia · Observatorio de Arrecifes' }))
</script>

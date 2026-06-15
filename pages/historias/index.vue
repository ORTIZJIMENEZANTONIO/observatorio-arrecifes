<template>
  <div>
    <CommonHeroSection compact :eyebrow="hero?.eyebrow" :title="hero?.title" :subtitle="hero?.subtitle" />

    <section class="section-padding-sm">
      <div class="container-wide grid gap-5 md:grid-cols-2">
        <NuxtLink
          v-for="story in stories"
          :key="story.id"
          :to="`/historias/${story.slug}`"
          class="card-interactive group block overflow-hidden p-0"
          :data-track="`story-${story.slug}`"
        >
          <div class="relative aspect-video overflow-hidden bg-surface-cool">
            <img v-if="story.cover" :src="story.cover" :alt="story.title" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
            <span class="absolute top-3 left-3 badge-coral text-[11px]">{{ topicLabel(story.topic) }}</span>
          </div>
          <div class="p-5">
            <h3 class="font-display text-lg font-bold text-ink group-hover:text-primary">{{ story.title }}</h3>
            <p class="mt-2 text-sm text-slate-custom">{{ story.subtitle }}</p>
            <div class="mt-3 flex items-center justify-between text-xs text-ink-muted">
              <span>{{ story.estimatedMinutes }} min de lectura</span>
              <span class="inline-flex items-center gap-1 text-primary">
                Leer <Icon name="lucide:arrow-right" size="14" />
              </span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { storyMaps } from '~/data/story-maps'

const cms = useCmsContent('historias')
const hero = cms.one<{ eyebrow: string; title: string; subtitle: string }>('hero')

const stories = computed(() => storyMaps.filter((s) => s.visible !== false && !s.archived))

const topicLabel = (t: string): string => ({
  sctld: 'SCTLD',
  bleaching: 'Blanqueamiento',
  restoration: 'Restauración',
  conflict: 'Conflicto',
  community: 'Comunidad',
  policy: 'Política pública',
}[t] ?? t)

useHead({ title: 'Historias · Observatorio de Arrecifes' })
</script>

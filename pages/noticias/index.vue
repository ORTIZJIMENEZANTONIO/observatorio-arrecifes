<script setup lang="ts">
import type { ReefNewsArticle } from '~/types'

useHead({
  title: 'Noticias — Observatorio de Arrecifes',
})

const store = useNewsStore()
const { revealRef } = useScrollReveal({ stagger: true })

const cms = useCmsContent('noticias')
const hero = cms.one<{ eyebrow: string; title: string; subtitle: string }>('hero')

onMounted(() => {
  if (!store.articles.length) useBackendSync().syncNews()
})

const formatDate = (s: string): string => {
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return s
  return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
}

const heroArticle = computed<ReefNewsArticle | null>(() => store.filtered[0] ?? null)
const restArticles = computed<ReefNewsArticle[]>(() => store.filtered.slice(1))
</script>

<template>
  <main>
    <CommonHeroSection
      :eyebrow="hero?.eyebrow ?? 'Editorial'"
      :title="hero?.title ?? 'Noticias del observatorio'"
      :subtitle="hero?.subtitle ?? ''"
    />

    <section class="container-wide section-padding">
      <CommonFilterPanel
        v-model:search-query="store.search"
        search-placeholder="Título o resumen…"
        :active-count="store.activeFilterCount"
        :total="store.publicCount"
        :filtered="store.filtered.length"
        class="mb-8"
        @clear="store.resetFilters()"
      >
        <div class="form-group !mb-0">
          <label class="form-label">Etiqueta</label>
          <select v-model="store.tagFilter" class="select">
            <option value="">Todas</option>
            <option v-for="t in store.allTags" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
        <div class="form-group !mb-0">
          <label class="form-label">Fuente</label>
          <select v-model="store.sourceFilter" class="select">
            <option value="">Todas</option>
            <option v-for="s in store.allSources" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
        <div class="form-group !mb-0">
          <label class="form-label">Publicada desde</label>
          <input v-model="store.dateFrom" type="date" class="input" />
        </div>
        <div class="form-group !mb-0">
          <label class="form-label">Publicada hasta</label>
          <input v-model="store.dateTo" type="date" class="input" />
        </div>
        <div class="form-group !mb-0">
          <label class="form-label">Orden</label>
          <select v-model="store.sortBy" class="select">
            <option value="recent">Más recientes primero</option>
            <option value="oldest">Más antiguas primero</option>
          </select>
        </div>
      </CommonFilterPanel>

      <div v-if="store.filtered.length === 0" class="card p-8 text-center text-sm text-ink-muted">
        No hay artículos que coincidan con los filtros actuales.
      </div>

      <div v-else ref="revealRef" class="stagger-children">
        <!-- Hero / artículo más reciente -->
        <NuxtLink
          v-if="heroArticle"
          :to="`/noticias/${heroArticle.slug}`"
          class="reveal card-interactive group mb-8 grid overflow-hidden md:grid-cols-2"
        >
          <div class="relative aspect-video md:aspect-auto md:min-h-[18rem]">
            <img
              v-if="heroArticle.image"
              :src="heroArticle.image"
              :alt="heroArticle.title"
              class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div v-else class="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30" />
          </div>
          <div class="flex flex-col justify-center gap-2 p-6">
            <p class="text-xs uppercase tracking-wide text-coral">{{ formatDate(heroArticle.publishedAt) }}</p>
            <h2 class="text-2xl font-display font-bold text-ink group-hover:text-primary">
              {{ heroArticle.title }}
            </h2>
            <p class="text-sm text-ink-muted">{{ heroArticle.summary }}</p>
            <div class="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span class="text-ink">{{ heroArticle.author }}</span>
              <span v-if="heroArticle.source" class="badge badge-secondary">{{ heroArticle.source }}</span>
              <span v-for="t in heroArticle.tags || []" :key="t" class="badge badge-primary">{{ t }}</span>
            </div>
          </div>
        </NuxtLink>

        <!-- Resto en grid -->
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="a in restArticles"
            :key="a.id"
            :to="`/noticias/${a.slug}`"
            class="reveal card-interactive group flex flex-col overflow-hidden"
          >
            <div class="relative aspect-video bg-gray-100">
              <img
                v-if="a.image"
                :src="a.image"
                :alt="a.title"
                class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div class="flex flex-1 flex-col gap-2 p-5">
              <p class="text-[11px] uppercase tracking-wide text-coral">{{ formatDate(a.publishedAt) }}</p>
              <h3 class="text-lg font-display font-semibold text-ink group-hover:text-primary">
                {{ a.title }}
              </h3>
              <p class="line-clamp-3 text-sm text-ink-muted">{{ a.summary }}</p>
              <div class="mt-auto flex flex-wrap items-center gap-1.5 pt-3 text-[11px]">
                <span class="text-ink-muted">{{ a.author }}</span>
                <span v-if="a.source" class="badge badge-secondary">{{ a.source }}</span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>
  </main>
</template>

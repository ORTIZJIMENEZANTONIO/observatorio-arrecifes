<script setup lang="ts">
import type { ReefNewsArticle } from '~/types'

const route = useRoute()
const slug = computed(() => route.params.slug as string)

const store = useNewsStore()
const { apiFetch } = useApi()

const article = ref<ReefNewsArticle | null>(null)
const loading = ref(true)
const error = ref('')

const formatDate = (s: string): string => {
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return s
  return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
}

const load = async () => {
  loading.value = true
  error.value = ''
  // Primero intenta con el store ya cargado
  const cached = store.findBySlug(slug.value)
  if (cached) {
    article.value = cached
    loading.value = false
    return
  }
  try {
    const res = await apiFetch<{ success: boolean; data: ReefNewsArticle }>(
      `/news/${slug.value}`,
    )
    article.value = res.data
  } catch (e: any) {
    error.value = e?.data?.error?.message || 'No se pudo cargar el artículo'
    article.value = null
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(slug, load)

useHead(() => ({
  title: article.value
    ? `${article.value.title} — Noticias`
    : 'Cargando…',
}))
</script>

<template>
  <main class="container-narrow section-padding">
    <NuxtLink to="/noticias" class="mb-6 inline-flex items-center gap-2 text-sm text-primary hover:underline">
      <Icon name="lucide:arrow-left" size="16" />
      Volver a noticias
    </NuxtLink>

    <p v-if="loading" class="text-ink-muted">Cargando artículo…</p>
    <p v-else-if="error" class="rounded-2xl border border-alert/30 bg-alert/5 p-4 text-sm text-alert">
      {{ error }}
    </p>

    <article v-else-if="article" class="space-y-6">
      <header class="space-y-3">
        <div class="flex flex-wrap items-center gap-2 text-xs">
          <span class="text-coral">{{ formatDate(article.publishedAt) }}</span>
          <span class="text-ink-muted">·</span>
          <span class="text-ink">{{ article.author }}</span>
          <span v-if="article.source" class="badge badge-secondary">{{ article.source }}</span>
        </div>
        <h1 class="text-3xl font-display font-bold text-ink md:text-4xl">{{ article.title }}</h1>
        <p class="text-lg text-ink-muted">{{ article.summary }}</p>
        <div v-if="(article.tags || []).length" class="flex flex-wrap gap-1.5">
          <span v-for="t in article.tags || []" :key="t" class="badge badge-primary">{{ t }}</span>
        </div>
      </header>

      <figure v-if="article.image" class="overflow-hidden rounded-2xl">
        <img :src="article.image" :alt="article.title" class="w-full" loading="lazy" />
        <figcaption v-if="article.imageCredit" class="mt-2 text-xs text-ink-muted">
          Imagen: {{ article.imageCredit }}
        </figcaption>
      </figure>

      <div
        v-if="article.content"
        class="prose-arrecife"
        v-html="article.content"
      />

      <!-- Crédito y link al original cuando es contenido scrapeado -->
      <aside
        v-if="article.sourceUrl"
        class="rounded-2xl border border-secondary/20 bg-secondary/5 p-5 text-sm"
      >
        <p class="font-semibold text-ink">Fuente original</p>
        <p class="mt-1 text-ink-muted">
          Este artículo se basa en información publicada por
          <strong>{{ article.source || 'la fuente original' }}</strong>.
          Puedes leer la nota completa en su sitio:
        </p>
        <a
          :href="article.sourceUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-2 inline-flex items-center gap-1.5 text-primary underline"
        >
          {{ article.sourceUrl }}
          <Icon name="lucide:external-link" size="14" />
        </a>
      </aside>
    </article>
  </main>
</template>

<style scoped>
.prose-arrecife :deep(p) {
  margin-bottom: 1rem;
  color: rgb(15 23 42 / 0.85);
  line-height: 1.7;
}
.prose-arrecife :deep(a) {
  color: var(--color-primary);
  text-decoration: underline;
}
.prose-arrecife :deep(strong) {
  font-weight: 600;
}
.prose-arrecife :deep(em) {
  font-style: italic;
}
.prose-arrecife :deep(ul) {
  margin: 1rem 0 1rem 1.5rem;
  list-style: disc;
}
</style>

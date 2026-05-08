import { defineStore } from 'pinia'
import type { ReefNewsArticle } from '~/types'

// Store de noticias del observatorio. La fuente real es el backend
// (`GET /observatory/arrecifes/news`); este store mantiene la lista cargada
// + filtros para la página pública.
export const useNewsStore = defineStore('news', () => {
  const articles = ref<ReefNewsArticle[]>([])
  const loading = ref(false)
  const search = ref('')
  const tagFilter = ref('')
  const sourceFilter = ref('')                // ej. "Mongabay Latam", "Healthy Reefs Initiative"
  const dateFrom = ref<string>('')            // YYYY-MM-DD
  const dateTo = ref<string>('')
  const sortBy = ref<'recent' | 'oldest'>('recent')

  const setArticles = (items: ReefNewsArticle[]) => {
    articles.value = items
  }

  const allTags = computed(() => {
    const set = new Set<string>()
    for (const a of articles.value) {
      if (Array.isArray(a.tags)) for (const t of a.tags) set.add(t)
    }
    return Array.from(set).sort()
  })

  const allSources = computed(() => {
    const set = new Set<string>()
    for (const a of articles.value) if (a.source) set.add(a.source)
    return Array.from(set).sort()
  })

  const filtered = computed(() => {
    const q = search.value.trim().toLowerCase()
    const list = articles.value.filter((a) => {
      if (a.archived || a.visible === false) return false
      if (q && !`${a.title} ${a.summary}`.toLowerCase().includes(q)) return false
      if (tagFilter.value && !(a.tags || []).includes(tagFilter.value)) return false
      if (sourceFilter.value && a.source !== sourceFilter.value) return false
      if (dateFrom.value && a.publishedAt < dateFrom.value) return false
      if (dateTo.value && a.publishedAt > dateTo.value) return false
      return true
    })
    list.sort((a, b) =>
      sortBy.value === 'recent'
        ? b.publishedAt.localeCompare(a.publishedAt)
        : a.publishedAt.localeCompare(b.publishedAt),
    )
    return list
  })

  const resetFilters = () => {
    search.value = ''
    tagFilter.value = ''
    sourceFilter.value = ''
    dateFrom.value = ''
    dateTo.value = ''
    sortBy.value = 'recent'
  }

  const activeFilterCount = computed(() => {
    let n = 0
    if (search.value.trim()) n++
    if (tagFilter.value) n++
    if (sourceFilter.value) n++
    if (dateFrom.value || dateTo.value) n++
    if (sortBy.value !== 'recent') n++
    return n
  })

  // Sólo cuenta artículos públicos (no archivados / visibles), independiente
  // de los filtros — útil para el "X de N resultados" del FilterPanel.
  const publicCount = computed(
    () => articles.value.filter((a) => !a.archived && a.visible !== false).length,
  )

  const findBySlug = (slug: string) => articles.value.find((a) => a.slug === slug)

  return {
    articles, loading,
    search, tagFilter, sourceFilter, dateFrom, dateTo, sortBy,
    allTags, allSources,
    filtered, publicCount,
    resetFilters, activeFilterCount,
    setArticles, findBySlug,
  }
})

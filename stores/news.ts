import { defineStore } from 'pinia'
import type { ReefNewsArticle } from '~/types'

// Store de noticias del observatorio. La fuente real es el backend
// (`GET /observatory/arrecifes/news`); este store mantiene la lista cargada
// + filtros básicos para la página pública.
export const useNewsStore = defineStore('news', () => {
  const articles = ref<ReefNewsArticle[]>([])
  const loading = ref(false)
  const search = ref('')
  const tagFilter = ref('')

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

  const filtered = computed(() => {
    const q = search.value.trim().toLowerCase()
    return articles.value.filter((a) => {
      if (a.archived || a.visible === false) return false
      if (q && !`${a.title} ${a.summary}`.toLowerCase().includes(q)) return false
      if (tagFilter.value && !(a.tags || []).includes(tagFilter.value)) return false
      return true
    })
  })

  const findBySlug = (slug: string) => articles.value.find((a) => a.slug === slug)

  return { articles, loading, search, tagFilter, allTags, filtered, setArticles, findBySlug }
})

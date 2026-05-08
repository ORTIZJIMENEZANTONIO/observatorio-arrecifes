import { defineStore } from 'pinia'
import { cmsDefaults, type CmsItem } from '~/data/cms-defaults'

// Pinia store para contenido editorial (CMS) editable desde `/admin/contenido`.
//
// Estado: `sections[pageSlug][sectionKey] = items[]`. Lectura sincrónica con
// fallback al default — la UI siempre puede pintar sin esperar red. La
// hidratación desde el backend ocurre en `fetchPage` (una sola request por
// página, devuelve todas sus secciones).
export const useCmsStore = defineStore('cms', () => {
  const sections = reactive<Record<string, Record<string, CmsItem[]>>>({})
  // Páginas ya hidratadas (o fallidas) — evita refetch repetido.
  const fetchedPages = reactive<Record<string, boolean>>({})

  const setSection = (page: string, key: string, items: CmsItem[]) => {
    if (!sections[page]) sections[page] = {}
    sections[page][key] = items
  }

  // Lectura sincrónica con fallback automático al default.
  const getSection = <T = CmsItem>(page: string, key: string): T[] => {
    const stored = sections[page]?.[key]
    if (Array.isArray(stored)) return stored as T[]
    const fallback = cmsDefaults[page]?.[key] ?? []
    return fallback as T[]
  }

  // Atajo para secciones de un solo item (hero, cta, footer.brand, etc.).
  const getOne = <T = CmsItem>(page: string, key: string): T | null => {
    const list = getSection<T>(page, key)
    return list.length > 0 ? list[0] : null
  }

  // Inicializa todas las secciones de una página con los defaults — útil al
  // entrar al editor antes de que el backend responda.
  const initPage = (page: string) => {
    const pageDefaults = cmsDefaults[page]
    if (!pageDefaults) return
    if (!sections[page]) sections[page] = {}
    for (const [key, items] of Object.entries(pageDefaults)) {
      if (!sections[page][key]) {
        sections[page][key] = JSON.parse(JSON.stringify(items)) as CmsItem[]
      }
    }
  }

  // Trae todas las secciones de una página desde el backend público
  // (`GET /observatory/arrecifes/cms/:page/:_sectionKeyIgnoredOnBackend`).
  // El backend ignora el sectionKey y siempre devuelve todas las secciones de
  // la página — pasamos un placeholder cualquiera.
  const fetchPage = async (page: string): Promise<void> => {
    if (fetchedPages[page]) return
    initPage(page)
    try {
      const config = useRuntimeConfig()
      const obs = config.public.observatory as string
      const base = config.public.apiBaseUrl as string
      const res = await $fetch<{ success: boolean; sections: Record<string, CmsItem[]> }>(
        `${base}/observatory/${obs}/cms/${page}/_all`,
        { timeout: 4000 },
      )
      const remote = res?.sections ?? {}
      for (const [key, items] of Object.entries(remote)) {
        if (Array.isArray(items) && items.length > 0) {
          setSection(page, key, items as CmsItem[])
        }
      }
    } catch {
      // Silencio: nos quedamos con los defaults.
    } finally {
      fetchedPages[page] = true
    }
  }

  // Para el editor admin: marca una página como no-fetcheada para forzar reload.
  const invalidatePage = (page: string) => {
    fetchedPages[page] = false
  }

  return {
    sections,
    fetchedPages,
    setSection,
    getSection,
    getOne,
    initPage,
    fetchPage,
    invalidatePage,
  }
})

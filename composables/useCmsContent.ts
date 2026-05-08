import type { CmsItem } from '~/data/cms-defaults'

// Helper de orden superior para páginas públicas: dispara `fetchPage` la
// primera vez que se monta y devuelve los helpers de lectura ya bound al slug.
//
// Uso:
//   const cms = useCmsContent('home')
//   const hero = cms.one('hero')           // → { eyebrow, title, subtitle, ... }
//   const features = cms.list('features')  // → CmsItem[]
//
// El componente puede pintar inmediatamente con los defaults; cuando el
// backend responde, las refs reactivas se actualizan automáticamente.
export const useCmsContent = (page: string) => {
  const store = useCmsStore()

  // Inicia la hidratación al primer mount cliente. SSR es desactivado en este
  // proyecto, así que esto siempre corre en el navegador.
  onMounted(() => { void store.fetchPage(page) })

  const list = <T = CmsItem>(key: string) =>
    computed<T[]>(() => store.getSection<T>(page, key))

  const one = <T = CmsItem>(key: string) =>
    computed<T | null>(() => store.getOne<T>(page, key))

  return { list, one, store }
}

// Reemplaza placeholders del estilo `{count}` o `{name}` con los valores
// pasados. Útil cuando el editor escribe `"{count} arrecifes documentados"` y
// la página inyecta el número real al render.
export const interpolateCmsText = (
  text: string | null | undefined,
  values: Record<string, string | number | null | undefined>,
): string => {
  if (!text) return ''
  return text.replace(/\{(\w+)\}/g, (_, key) => {
    const v = values[key]
    return v === null || v === undefined ? '' : String(v)
  })
}

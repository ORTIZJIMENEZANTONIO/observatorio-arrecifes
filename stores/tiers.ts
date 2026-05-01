import { defineStore } from 'pinia'
import { tierConfig as mockTierConfig } from '~/data/contributors'
import type { Tier } from '~/types'

// Convierte el `tierConfig` mock (record indexado por slug) al shape `Tier[]` que
// devuelve el backend en `/tiers`. Sirve como fallback cuando cercu-backend está
// offline o no ha sido seedeado.
const fromMockConfig = (): Tier[] => {
  const order = ['bronze', 'silver', 'gold', 'platinum', 'coral']
  return order
    .filter((slug) => mockTierConfig[slug])
    .map((slug, idx) => {
      const t = mockTierConfig[slug]
      const next = mockTierConfig[order[idx + 1]]
      return {
        slug,
        label: t.label,
        description: t.description,
        minScore: t.min,
        maxScore: next ? next.min - 1 : null,
        color: t.color,
        requirements: null,
        icon: 'lucide:medal',
        sortOrder: idx + 1,
        visible: true,
        archived: false,
      }
    })
}

export const useTiersStore = defineStore('tiers', () => {
  const tiers = ref<Tier[]>(fromMockConfig())

  // Mapa slug → Tier para lookups O(1) desde `ContributorCard` o cards de la red.
  const bySlug = computed(() => {
    const map: Record<string, Tier> = {}
    for (const t of tiers.value) map[t.slug] = t
    return map
  })

  // Sólo los visibles, ordenados por sortOrder ascendente. Lo que muestra
  // /contributors en la sección "Cómo escalas en la red".
  const visibleTiers = computed(() =>
    [...tiers.value]
      .filter((t) => (t.visible ?? true) && !(t.archived ?? false))
      .sort((a, b) => a.sortOrder - b.sortOrder || a.minScore - b.minScore),
  )

  const setTiers = (items: Tier[]) => { tiers.value = items }

  return { tiers, bySlug, visibleTiers, setTiers }
})

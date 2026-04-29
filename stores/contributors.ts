import { defineStore } from 'pinia'
import { contributors as mockContributors } from '~/data/contributors'
import type { Contributor, ContributorRole, ContributorTier } from '~/types'

export const useContributorsStore = defineStore('contributors', () => {
  const contributors = ref<Contributor[]>([...mockContributors])

  const search = ref('')
  const filterRole = ref<ContributorRole | 'all'>('all')
  const filterTier = ref<ContributorTier | 'all'>('all')

  const filtered = computed(() => {
    const q = search.value.trim().toLowerCase()
    return contributors.value.filter((c) => {
      if (q && !`${c.displayName} ${c.handle} ${c.affiliation ?? ''}`.toLowerCase().includes(q)) return false
      if (filterRole.value !== 'all' && c.role !== filterRole.value) return false
      if (filterTier.value !== 'all' && c.tier !== filterTier.value) return false
      return true
    })
  })

  const leaderboard = computed(() =>
    [...contributors.value].sort((a, b) => b.reputationScore - a.reputationScore),
  )

  const findById = (id: number) => contributors.value.find((c) => c.id === id)

  return {
    contributors,
    search,
    filterRole,
    filterTier,
    filtered,
    leaderboard,
    findById,
  }
})

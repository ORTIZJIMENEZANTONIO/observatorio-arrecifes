import { defineStore } from 'pinia'
import { contributors as mockContributors } from '~/data/contributors'
import type { Contributor, ContributorRole, ContributorTier } from '~/types'

export const useContributorsStore = defineStore('contributors', () => {
  const contributors = ref<Contributor[]>([...mockContributors])

  const search = ref('')
  const filterRole = ref<ContributorRole | 'all'>('all')
  const filterTier = ref<ContributorTier | 'all'>('all')
  const filterState = ref<string | 'all'>('all')
  const filterVerifiedOnly = ref(false)
  const filterMonthsActiveMin = ref<number>(0)

  const filtered = computed(() => {
    const q = search.value.trim().toLowerCase()
    return contributors.value.filter((c) => {
      if (q && !`${c.displayName} ${c.handle} ${c.affiliation ?? ''}`.toLowerCase().includes(q)) return false
      if (filterRole.value !== 'all' && c.role !== filterRole.value) return false
      if (filterTier.value !== 'all' && c.tier !== filterTier.value) return false
      if (filterState.value !== 'all' && c.state !== filterState.value) return false
      if (filterVerifiedOnly.value && !c.verified) return false
      if (filterMonthsActiveMin.value > 0 && (c.consecutiveMonthsActive ?? 0) < filterMonthsActiveMin.value) return false
      return true
    })
  })

  const states = computed(() => {
    const set = new Set<string>()
    contributors.value.forEach((c) => { if (c.state) set.add(c.state) })
    return Array.from(set).sort()
  })

  const resetFilters = () => {
    search.value = ''
    filterRole.value = 'all'
    filterTier.value = 'all'
    filterState.value = 'all'
    filterVerifiedOnly.value = false
    filterMonthsActiveMin.value = 0
  }

  const activeFilterCount = computed(() => {
    let n = 0
    if (search.value.trim()) n++
    if (filterRole.value !== 'all') n++
    if (filterTier.value !== 'all') n++
    if (filterState.value !== 'all') n++
    if (filterVerifiedOnly.value) n++
    if (filterMonthsActiveMin.value > 0) n++
    return n
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
    filterState,
    filterVerifiedOnly,
    filterMonthsActiveMin,
    states,
    resetFilters,
    activeFilterCount,
    filtered,
    leaderboard,
    findById,
  }
})

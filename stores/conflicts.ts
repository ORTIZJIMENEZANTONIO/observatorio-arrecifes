import { defineStore } from 'pinia'
import { conflicts as mockConflicts } from '~/data/conflicts'
import type { SocioEnvironmentalConflict, ConflictIntensity, ConflictStatus, ThreatType } from '~/types'

export const useConflictsStore = defineStore('conflicts', () => {
  const conflicts = ref<SocioEnvironmentalConflict[]>([...mockConflicts])

  const search = ref('')
  const filterIntensity = ref<ConflictIntensity | 'all'>('all')
  const filterStatus = ref<ConflictStatus | 'all'>('all')
  const filterThreat = ref<ThreatType | 'all'>('all')
  const filterState = ref<string | 'all'>('all')
  // Rango de fechas (startedAt). Vacío = sin filtro.
  const filterDateFrom = ref<string>('')
  const filterDateTo = ref<string>('')

  const publicConflicts = computed(() =>
    conflicts.value.filter((c) => (c.visible ?? true) && !(c.archived ?? false)),
  )

  const filtered = computed(() => {
    const q = search.value.trim().toLowerCase()
    return publicConflicts.value.filter((c) => {
      if (q && !`${c.title} ${c.summary} ${c.state}`.toLowerCase().includes(q)) return false
      if (filterIntensity.value !== 'all' && c.intensity !== filterIntensity.value) return false
      if (filterStatus.value !== 'all' && c.status !== filterStatus.value) return false
      if (filterThreat.value !== 'all' && !c.threats.includes(filterThreat.value)) return false
      if (filterState.value !== 'all' && c.state !== filterState.value) return false
      if (filterDateFrom.value && c.startedAt < filterDateFrom.value) return false
      if (filterDateTo.value && c.startedAt > filterDateTo.value) return false
      return true
    })
  })

  const states = computed(() => {
    const set = new Set<string>()
    publicConflicts.value.forEach((c) => set.add(c.state))
    return Array.from(set).sort()
  })

  const threats = computed(() => {
    const set = new Set<string>()
    publicConflicts.value.forEach((c) => c.threats.forEach((t) => set.add(t)))
    return Array.from(set).sort()
  })

  const resetFilters = () => {
    search.value = ''
    filterIntensity.value = 'all'
    filterStatus.value = 'all'
    filterThreat.value = 'all'
    filterState.value = 'all'
    filterDateFrom.value = ''
    filterDateTo.value = ''
  }

  const activeFilterCount = computed(() => {
    let n = 0
    if (search.value.trim()) n++
    if (filterIntensity.value !== 'all') n++
    if (filterStatus.value !== 'all') n++
    if (filterThreat.value !== 'all') n++
    if (filterState.value !== 'all') n++
    if (filterDateFrom.value || filterDateTo.value) n++
    return n
  })

  const findById = (id: number) => conflicts.value.find((c) => c.id === id)

  return {
    conflicts,
    search,
    filterIntensity,
    filterStatus,
    filterThreat,
    filterState,
    filterDateFrom,
    filterDateTo,
    publicConflicts,
    filtered,
    states,
    threats,
    resetFilters,
    activeFilterCount,
    findById,
  }
})

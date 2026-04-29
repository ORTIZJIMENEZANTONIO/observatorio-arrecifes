import { defineStore } from 'pinia'
import { conflicts as mockConflicts } from '~/data/conflicts'
import type { SocioEnvironmentalConflict, ConflictIntensity, ConflictStatus, ThreatType } from '~/types'

export const useConflictsStore = defineStore('conflicts', () => {
  const conflicts = ref<SocioEnvironmentalConflict[]>([...mockConflicts])

  const search = ref('')
  const filterIntensity = ref<ConflictIntensity | 'all'>('all')
  const filterStatus = ref<ConflictStatus | 'all'>('all')
  const filterThreat = ref<ThreatType | 'all'>('all')

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
      return true
    })
  })

  const findById = (id: number) => conflicts.value.find((c) => c.id === id)

  return {
    conflicts,
    search,
    filterIntensity,
    filterStatus,
    filterThreat,
    publicConflicts,
    filtered,
    findById,
  }
})

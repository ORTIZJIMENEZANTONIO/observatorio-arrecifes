import { defineStore } from 'pinia'
import { observations as mockObservations } from '~/data/observations'
import type { Observation, ObservationStatus, ObservationType } from '~/types'

export const useObservationsStore = defineStore('observations', () => {
  const observations = ref<Observation[]>([...mockObservations])

  const filterStatus = ref<ObservationStatus | 'all'>('all')
  const filterType = ref<ObservationType | 'all'>('all')

  const validated = computed(() => observations.value.filter((o) => o.status === 'validated'))
  const pending = computed(() =>
    observations.value.filter((o) => o.status === 'pending' || o.status === 'in_review'),
  )

  const filtered = computed(() =>
    observations.value.filter((o) => {
      if (filterStatus.value !== 'all' && o.status !== filterStatus.value) return false
      if (filterType.value !== 'all' && o.type !== filterType.value) return false
      return true
    }),
  )

  const byReef = (reefId: number) => observations.value.filter((o) => o.reefId === reefId)
  const byContributor = (contributorId: number) =>
    observations.value.filter((o) => o.contributorId === contributorId)

  const submit = (obs: Omit<Observation, 'id' | 'submittedAt' | 'status'>) => {
    const id = Math.max(0, ...observations.value.map((o) => o.id)) + 1
    observations.value.push({
      ...obs,
      id,
      submittedAt: new Date().toISOString(),
      status: 'pending',
    })
    return id
  }

  return {
    observations,
    filterStatus,
    filterType,
    validated,
    pending,
    filtered,
    byReef,
    byContributor,
    submit,
  }
})

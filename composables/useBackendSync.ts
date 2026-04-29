// Centralised backend → store sync. Each fetcher silently falls back to the
// existing mock data if the cercu-backend endpoint is unavailable, so the
// observatorio remains usable offline / before deployment.

import type { Reef, SocioEnvironmentalConflict, Contributor, Observation } from '~/types'

type ListResponse<T> = { success: true; items?: T[]; data?: T[]; pagination?: any }

export const useBackendSync = () => {
  const { apiFetch } = useApi()

  const fetchList = async <T>(path: string): Promise<T[] | null> => {
    try {
      const res = await apiFetch<ListResponse<T>>(path)
      return res.items ?? res.data ?? null
    } catch (err) {
      console.warn(`[backend-sync] ${path} unavailable, using mock fallback`, err)
      return null
    }
  }

  const syncReefs = async () => {
    const items = await fetchList<Reef>('/reefs?limit=100')
    if (items?.length) useReefsStore().setReefs(items as Reef[])
  }

  const syncConflicts = async () => {
    const items = await fetchList<SocioEnvironmentalConflict>('/conflicts?limit=100')
    if (items?.length) {
      const store = useConflictsStore()
      store.conflicts = items as SocioEnvironmentalConflict[]
    }
  }

  const syncContributors = async () => {
    const items = await fetchList<Contributor>('/contributors?limit=100')
    if (items?.length) {
      const store = useContributorsStore()
      store.contributors = items as Contributor[]
    }
  }

  const syncObservations = async () => {
    const items = await fetchList<Observation>('/observations?limit=100')
    if (items?.length) {
      const store = useObservationsStore()
      store.observations = items as Observation[]
    }
  }

  const syncAll = async () => {
    await Promise.all([syncReefs(), syncConflicts(), syncContributors(), syncObservations()])
  }

  return { syncReefs, syncConflicts, syncContributors, syncObservations, syncAll }
}

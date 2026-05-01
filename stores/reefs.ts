import { defineStore } from 'pinia'
import { reefs as mockReefs } from '~/data/reefs'
import type { Reef, ReefStatus, CoastalState, Ocean } from '~/types'

const STORAGE_KEY = 'obs-arrecifes-reef-overrides'

interface Overrides {
  [id: number]: { visible?: boolean; archived?: boolean }
}

const loadOverrides = (): Overrides => {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

const saveOverrides = (overrides: Overrides) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides))
}

const applyOverrides = (items: Reef[], overrides: Overrides): Reef[] =>
  items.map((r) => ({
    visible: r.visible ?? true,
    archived: r.archived ?? false,
    ...r,
    ...(overrides[r.id] ?? {}),
  }))

export const useReefsStore = defineStore('reefs', () => {
  const reefs = ref<Reef[]>(applyOverrides(mockReefs, loadOverrides()))

  const search = ref('')
  const filterState = ref<CoastalState | 'all'>('all')
  const filterOcean = ref<Ocean | 'all'>('all')
  const filterStatus = ref<ReefStatus | 'all'>('all')

  const publicReefs = computed(() =>
    reefs.value.filter((r) => (r.visible ?? true) && !(r.archived ?? false)),
  )

  const filtered = computed(() => {
    const q = search.value.trim().toLowerCase()
    return publicReefs.value.filter((r) => {
      if (q && !`${r.name} ${r.region} ${r.state}`.toLowerCase().includes(q)) return false
      if (filterState.value !== 'all' && r.state !== filterState.value) return false
      if (filterOcean.value !== 'all' && r.ocean !== filterOcean.value) return false
      if (filterStatus.value !== 'all' && r.status !== filterStatus.value) return false
      return true
    })
  })

  const totalCount = computed(() => publicReefs.value.length)
  // Coerción defensiva: TypeORM/MySQL devuelve `area` (decimal) como string. Sin
  // Number() la reduce concatena strings en lugar de sumar.
  const totalArea = computed(() =>
    publicReefs.value.reduce((acc, r) => acc + (Number(r.area) || 0), 0),
  )
  const states = computed(() => {
    const set = new Set<CoastalState>()
    publicReefs.value.forEach((r) => set.add(r.state))
    return Array.from(set).sort()
  })
  const oceans = computed<Ocean[]>(() => {
    const set = new Set<Ocean>()
    publicReefs.value.forEach((r) => set.add(r.ocean))
    return Array.from(set)
  })

  const setReefs = (items: Reef[]) => {
    reefs.value = applyOverrides(items, loadOverrides())
  }

  const findById = (id: number): Reef | undefined => reefs.value.find((r) => r.id === id)

  const updateReef = (id: number, patch: Partial<Reef>) => {
    const idx = reefs.value.findIndex((r) => r.id === id)
    if (idx < 0) return
    reefs.value[idx] = { ...reefs.value[idx], ...patch }
    if (patch.visible !== undefined || patch.archived !== undefined) {
      const overrides = loadOverrides()
      overrides[id] = {
        ...overrides[id],
        ...(patch.visible !== undefined ? { visible: patch.visible } : {}),
        ...(patch.archived !== undefined ? { archived: patch.archived } : {}),
      }
      saveOverrides(overrides)
    }
  }

  return {
    reefs,
    search,
    filterState,
    filterOcean,
    filterStatus,
    publicReefs,
    filtered,
    totalCount,
    totalArea,
    states,
    oceans,
    setReefs,
    findById,
    updateReef,
  }
})

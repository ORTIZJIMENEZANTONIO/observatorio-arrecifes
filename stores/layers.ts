import { defineStore } from 'pinia'
import { layers as mockLayers } from '~/data/layers'
import type { DataLayer, LayerCategory, DataProvider, LayerFormat } from '~/types'

export const useLayersStore = defineStore('layers', () => {
  const layers = ref<DataLayer[]>(mockLayers)
  const search = ref('')
  const filterCategory = ref<LayerCategory | 'all'>('all')
  const filterProvider = ref<DataProvider | 'all'>('all')
  // Filtros avanzados
  const filterFormat = ref<LayerFormat | 'all'>('all')
  const filterCoverage = ref<'global' | 'regional' | 'national' | 'all'>('all')
  const filterLicense = ref<string | 'all'>('all')
  const filterLiveOnly = ref(false)         // sólo capas con WMS/tile renderizables

  const filtered = computed(() => {
    const q = search.value.trim().toLowerCase()
    return layers.value.filter((l) => {
      if (q && !`${l.title} ${l.providerLabel} ${l.description}`.toLowerCase().includes(q)) return false
      if (filterCategory.value !== 'all' && l.category !== filterCategory.value) return false
      if (filterProvider.value !== 'all' && l.provider !== filterProvider.value) return false
      if (filterFormat.value !== 'all' && l.format !== filterFormat.value) return false
      if (filterCoverage.value !== 'all' && l.coverage !== filterCoverage.value) return false
      if (filterLicense.value !== 'all' && l.license !== filterLicense.value) return false
      if (filterLiveOnly.value && !(l.wmsUrl || l.tileUrlPattern)) return false
      return true
    })
  })

  const activeLayers = computed(() => layers.value.filter((l) => l.active))

  // Listas únicas para los selects
  const formats = computed(() => {
    const set = new Set<LayerFormat>()
    layers.value.forEach((l) => set.add(l.format))
    return Array.from(set).sort()
  })
  const licenses = computed(() => {
    const set = new Set<string>()
    layers.value.forEach((l) => set.add(l.license))
    return Array.from(set).sort()
  })

  const resetFilters = () => {
    search.value = ''
    filterCategory.value = 'all'
    filterProvider.value = 'all'
    filterFormat.value = 'all'
    filterCoverage.value = 'all'
    filterLicense.value = 'all'
    filterLiveOnly.value = false
  }

  const activeFilterCount = computed(() => {
    let n = 0
    if (search.value.trim()) n++
    if (filterCategory.value !== 'all') n++
    if (filterProvider.value !== 'all') n++
    if (filterFormat.value !== 'all') n++
    if (filterCoverage.value !== 'all') n++
    if (filterLicense.value !== 'all') n++
    if (filterLiveOnly.value) n++
    return n
  })

  const toggleLayer = (id: string) => {
    const layer = layers.value.find((l) => l.id === id)
    if (layer) layer.active = !layer.active
  }

  const setLayers = (items: DataLayer[]) => { layers.value = items }

  return {
    layers, search,
    filterCategory, filterProvider, filterFormat, filterCoverage, filterLicense, filterLiveOnly,
    filtered, activeLayers, formats, licenses,
    resetFilters, activeFilterCount,
    toggleLayer, setLayers,
  }
})

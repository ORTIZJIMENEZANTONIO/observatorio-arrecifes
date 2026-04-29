import { defineStore } from 'pinia'
import { layers as mockLayers } from '~/data/layers'
import type { DataLayer, LayerCategory, DataProvider } from '~/types'

export const useLayersStore = defineStore('layers', () => {
  const layers = ref<DataLayer[]>(mockLayers)
  const search = ref('')
  const filterCategory = ref<LayerCategory | 'all'>('all')
  const filterProvider = ref<DataProvider | 'all'>('all')

  const filtered = computed(() => {
    const q = search.value.trim().toLowerCase()
    return layers.value.filter((l) => {
      if (q && !`${l.title} ${l.providerLabel} ${l.description}`.toLowerCase().includes(q)) return false
      if (filterCategory.value !== 'all' && l.category !== filterCategory.value) return false
      if (filterProvider.value !== 'all' && l.provider !== filterProvider.value) return false
      return true
    })
  })

  const activeLayers = computed(() => layers.value.filter((l) => l.active))

  const toggleLayer = (id: string) => {
    const layer = layers.value.find((l) => l.id === id)
    if (layer) layer.active = !layer.active
  }

  const setLayers = (items: DataLayer[]) => { layers.value = items }

  return { layers, search, filterCategory, filterProvider, filtered, activeLayers, toggleLayer, setLayers }
})

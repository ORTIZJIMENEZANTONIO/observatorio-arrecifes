<script setup lang="ts">
import type { Reef } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'admin', pageTransition: false })

const { apiFetch } = useApi()
const items = ref<Reef[]>([])
const loading = ref(true)
const error = ref('')
const search = ref('')
const filterOcean = ref<'all' | 'caribbean' | 'gulf_of_mexico' | 'pacific'>('all')

const oceanLabels: Record<string, string> = {
  caribbean: 'Caribe',
  gulf_of_mexico: 'Golfo',
  pacific: 'Pacífico',
}
const statusLabels: Record<string, string> = {
  healthy: 'Saludable',
  watch: 'Vigilancia',
  warning: 'Advertencia',
  alert: 'Alerta',
  bleaching: 'Blanqueamiento',
  mortality: 'Mortalidad',
}

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await apiFetch<{ success: boolean; items: Reef[] }>('/admin/reefs?limit=100')
    items.value = res.items
  } catch (e: any) {
    error.value = e?.data?.error?.message || 'No se pudieron cargar los arrecifes'
  } finally {
    loading.value = false
  }
}

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return items.value.filter((r) => {
    if (q && !`${r.name} ${r.state} ${r.region}`.toLowerCase().includes(q)) return false
    if (filterOcean.value !== 'all' && r.ocean !== filterOcean.value) return false
    return true
  })
})

const toggleVisible = async (reef: Reef) => {
  try {
    const next = !(reef.visible ?? true)
    await apiFetch(`/admin/reefs/${reef.id}`, { method: 'PATCH', body: { visible: next } })
    reef.visible = next
  } catch (e: any) {
    error.value = e?.data?.error?.message || 'No se pudo actualizar'
  }
}

const toggleArchived = async (reef: Reef) => {
  try {
    const next = !(reef.archived ?? false)
    await apiFetch(`/admin/reefs/${reef.id}`, { method: 'PATCH', body: { archived: next } })
    reef.archived = next
  } catch (e: any) {
    error.value = e?.data?.error?.message || 'No se pudo actualizar'
  }
}

onMounted(load)
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 class="text-2xl font-semibold text-ink">Arrecifes</h2>
        <p class="mt-1 text-sm text-ink-muted">Inventario de sitios coralinos monitoreados.</p>
      </div>
      <button class="btn-outline" @click="load">
        <Icon name="lucide:refresh-cw" size="14" />
        Refrescar
      </button>
    </div>

    <div class="card p-4">
      <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div class="form-group">
          <label class="form-label">Buscar</label>
          <input v-model="search" type="search" placeholder="Nombre, estado, región…" class="input w-full" />
        </div>
        <div class="form-group">
          <label class="form-label">Litoral</label>
          <select v-model="filterOcean" class="select w-full">
            <option value="all">Todos</option>
            <option value="caribbean">Caribe</option>
            <option value="gulf_of_mexico">Golfo de México</option>
            <option value="pacific">Pacífico</option>
          </select>
        </div>
        <div class="form-group flex items-end">
          <span class="text-sm text-ink-muted">{{ filtered.length }} resultados</span>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-sm text-ink-muted">Cargando…</div>
    <div v-else-if="error" class="rounded-lg bg-red-50 p-4 text-sm text-red-700">{{ error }}</div>

    <div v-else class="table-container">
      <table class="table-base">
        <thead>
          <tr>
            <th class="text-left">Arrecife</th>
            <th class="text-left">Estado</th>
            <th class="text-left">Litoral</th>
            <th class="text-left">Estatus</th>
            <th class="text-right">Cobertura</th>
            <th class="text-right">Aportes</th>
            <th class="text-center">Visible</th>
            <th class="text-center">Archivado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in filtered" :key="r.id" class="border-t border-gray-100 hover:bg-gray-50/50">
            <td class="py-3">
              <p class="font-medium text-ink">{{ r.name }}</p>
              <p class="text-xs text-ink-muted">{{ r.region }}</p>
            </td>
            <td class="text-sm text-ink-muted">{{ r.state }}</td>
            <td class="text-sm text-ink-muted">{{ oceanLabels[r.ocean] || r.ocean }}</td>
            <td>
              <span class="badge-secondary">{{ statusLabels[r.status] || r.status }}</span>
            </td>
            <td class="text-right text-sm font-mono text-ink">{{ r.liveCoralCover ?? '—' }}%</td>
            <td class="text-right text-sm font-mono text-ink">{{ r.observations }}</td>
            <td class="text-center">
              <button
                class="rounded-full px-2 py-1 text-xs font-semibold"
                :class="(r.visible ?? true) ? 'bg-eco/10 text-eco-dark' : 'bg-gray-100 text-gray-500'"
                @click="toggleVisible(r)"
              >
                {{ (r.visible ?? true) ? 'Sí' : 'Oculto' }}
              </button>
            </td>
            <td class="text-center">
              <button
                class="rounded-full px-2 py-1 text-xs font-semibold"
                :class="(r.archived ?? false) ? 'bg-coral/10 text-coral-dark' : 'bg-gray-100 text-gray-500'"
                @click="toggleArchived(r)"
              >
                {{ (r.archived ?? false) ? 'Archivado' : 'Activo' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

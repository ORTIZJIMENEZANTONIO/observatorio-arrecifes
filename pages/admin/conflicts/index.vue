<script setup lang="ts">
import type { SocioEnvironmentalConflict } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'admin', pageTransition: false })

const { apiFetch } = useApi()
const items = ref<SocioEnvironmentalConflict[]>([])
const loading = ref(true)
const error = ref('')

// ── Filtros ──
const search = ref('')
const filterState = ref<string>('all')
const filterIntensity = ref<'all' | 'low' | 'medium' | 'high' | 'critical'>('all')
const filterStatus = ref<'all' | 'emerging' | 'ongoing' | 'mitigating' | 'resolved'>('all')
const filterVisibility = ref<'all' | 'visible' | 'hidden' | 'archived'>('all')
const filtersOpen = ref(false)
const activeFilterCount = computed(() =>
  [filterState.value, filterIntensity.value, filterStatus.value, filterVisibility.value]
    .filter((v) => v !== 'all').length + (search.value.trim() ? 1 : 0),
)

const intensityClass: Record<string, string> = {
  low: 'badge-secondary',
  medium: 'badge-accent',
  high: 'badge-coral',
  critical: 'badge-alert',
}
const intensityLabel: Record<string, string> = {
  low: 'Baja', medium: 'Media', high: 'Alta', critical: 'Crítica',
}
const statusLabel: Record<string, string> = {
  emerging: 'Emergente', ongoing: 'En curso', mitigating: 'Mitigando', resolved: 'Resuelto',
}

const load = async () => {
  loading.value = true
  try {
    const res = await apiFetch<{ success: boolean; items: SocioEnvironmentalConflict[] }>('/admin/conflicts?limit=200')
    items.value = res.items
  } catch (e: any) {
    error.value = e?.data?.error?.message || 'No se pudieron cargar los conflictos'
  } finally {
    loading.value = false
  }
}

const states = computed(() => {
  const set = new Set<string>()
  items.value.forEach((c) => c.state && set.add(c.state))
  return Array.from(set).sort()
})

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return items.value.filter((c) => {
    if (q && !`${c.title} ${c.summary} ${c.state}`.toLowerCase().includes(q)) return false
    if (filterState.value !== 'all' && c.state !== filterState.value) return false
    if (filterIntensity.value !== 'all' && c.intensity !== filterIntensity.value) return false
    if (filterStatus.value !== 'all' && c.status !== filterStatus.value) return false
    if (filterVisibility.value === 'visible' && !(c.visible ?? true)) return false
    if (filterVisibility.value === 'hidden' && (c.visible ?? true)) return false
    if (filterVisibility.value === 'archived' && !(c.archived ?? false)) return false
    return true
  })
})

const toggle = async (c: SocioEnvironmentalConflict, key: 'visible' | 'archived') => {
  const next = !((c as any)[key] ?? (key === 'visible'))
  try {
    await apiFetch(`/admin/conflicts/${c.id}`, { method: 'PATCH', body: { [key]: next } })
    ;(c as any)[key] = next
  } catch (e: any) {
    error.value = e?.data?.error?.message || 'No se pudo actualizar'
  }
}

// ── Editor ──
type ConflictForm = {
  title: string; summary: string; fullStory: string
  state: string; intensity: string; status: string
  reefIds: string
  threats: string; affectedCommunities: string; affectedSpecies: string
  drivers: string; resistance: string; legalActions: string; mediaUrls: string
  startedAt: string
  visible: boolean; archived: boolean
}

const blankForm = (): ConflictForm => ({
  title: '', summary: '', fullStory: '',
  state: '', intensity: 'medium', status: 'ongoing',
  reefIds: '',
  threats: '', affectedCommunities: '', affectedSpecies: '',
  drivers: '', resistance: '', legalActions: '', mediaUrls: '',
  startedAt: '',
  visible: true, archived: false,
})

const editingId = ref<number | null>(null)
const form = ref<ConflictForm>(blankForm())
const saving = ref(false)
const formError = ref('')

const openCreate = () => { editingId.value = 0; form.value = blankForm(); formError.value = '' }
const openEdit = (c: SocioEnvironmentalConflict) => {
  editingId.value = c.id
  formError.value = ''
  form.value = {
    title: c.title || '', summary: c.summary || '', fullStory: c.fullStory || '',
    state: c.state || '', intensity: c.intensity || 'medium', status: c.status || 'ongoing',
    reefIds: (c.reefIds || []).join(', '),
    threats: (c.threats || []).join(', '),
    affectedCommunities: (c.affectedCommunities || []).join(', '),
    affectedSpecies: (c.affectedSpecies || []).join(', '),
    drivers: (c.drivers || []).join(', '),
    resistance: (c.resistance || []).join(', '),
    legalActions: (c.legalActions || []).join(', '),
    mediaUrls: (c.mediaUrls || []).join(', '),
    startedAt: c.startedAt ? String(c.startedAt).slice(0, 10) : '',
    visible: c.visible ?? true,
    archived: c.archived ?? false,
  }
}
const closeEditor = () => { editingId.value = null }

const save = async () => {
  if (editingId.value === null) return
  if (!form.value.title.trim()) { formError.value = 'Título requerido'; return }
  if (!form.value.summary.trim()) { formError.value = 'Resumen requerido'; return }
  saving.value = true
  formError.value = ''
  const splitCsv = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean)
  const splitNums = (s: string) => splitCsv(s).map(Number).filter((n) => Number.isFinite(n))
  const f = form.value
  const payload: any = {
    title: f.title.trim(), summary: f.summary.trim(),
    fullStory: f.fullStory.trim() || null,
    state: f.state.trim(), intensity: f.intensity, status: f.status,
    reefIds: splitNums(f.reefIds),
    threats: splitCsv(f.threats),
    affectedCommunities: splitCsv(f.affectedCommunities),
    affectedSpecies: splitCsv(f.affectedSpecies),
    drivers: splitCsv(f.drivers),
    resistance: splitCsv(f.resistance),
    legalActions: splitCsv(f.legalActions),
    mediaUrls: splitCsv(f.mediaUrls),
    startedAt: f.startedAt || null,
    visible: f.visible, archived: f.archived,
  }
  try {
    if (editingId.value === 0) await apiFetch('/admin/conflicts', { method: 'POST', body: payload })
    else await apiFetch(`/admin/conflicts/${editingId.value}`, { method: 'PATCH', body: payload })
    closeEditor()
    await load()
  } catch (e: any) {
    formError.value = e?.data?.error?.message || 'No se pudo guardar'
  } finally {
    saving.value = false
  }
}

const remove = async (c: SocioEnvironmentalConflict) => {
  if (!confirm(`¿Eliminar "${c.title}"?`)) return
  try {
    await apiFetch(`/admin/conflicts/${c.id}`, { method: 'DELETE' })
    items.value = items.value.filter((x) => x.id !== c.id)
  } catch (e: any) {
    error.value = e?.data?.error?.message || 'No se pudo eliminar'
  }
}

const resetFilters = () => {
  search.value = ''
  filterState.value = 'all'
  filterIntensity.value = 'all'
  filterStatus.value = 'all'
  filterVisibility.value = 'all'
}

onMounted(load)
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 class="text-2xl font-semibold text-ink">Atlas de conflictos</h2>
        <p class="mt-1 text-sm text-ink-muted">{{ items.length }} casos socioambientales documentados.</p>
      </div>
      <div class="flex gap-2">
        <button class="btn-outline btn-sm" @click="load"><Icon name="lucide:refresh-cw" size="14" /> Refrescar</button>
        <button class="btn-primary btn-sm" @click="openCreate"><Icon name="lucide:plus" size="14" /> Nuevo conflicto</button>
      </div>
    </div>

    <button
      class="btn-outline btn-sm w-full justify-center md:hidden"
      @click="filtersOpen = !filtersOpen"
    >
      <Icon name="lucide:sliders-horizontal" size="14" />
      {{ filtersOpen ? 'Ocultar filtros' : 'Mostrar filtros' }}
      <span v-if="activeFilterCount" class="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
        {{ activeFilterCount }}
      </span>
    </button>

    <div class="card p-4" :class="{ 'hidden md:block': !filtersOpen }">
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
        <div class="form-group lg:col-span-2">
          <label class="form-label">Buscar</label>
          <input v-model="search" type="search" class="input w-full" placeholder="Título, resumen, estado…" />
        </div>
        <div class="form-group">
          <label class="form-label">Estado</label>
          <select v-model="filterState" class="select w-full">
            <option value="all">Todos</option>
            <option v-for="s in states" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Intensidad</label>
          <select v-model="filterIntensity" class="select w-full">
            <option value="all">Todas</option>
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
            <option value="critical">Crítica</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select v-model="filterStatus" class="select w-full">
            <option value="all">Todos</option>
            <option value="emerging">Emergente</option>
            <option value="ongoing">En curso</option>
            <option value="mitigating">Mitigando</option>
            <option value="resolved">Resuelto</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Visibilidad</label>
          <select v-model="filterVisibility" class="select w-full">
            <option value="all">Todos</option>
            <option value="visible">Solo visibles</option>
            <option value="hidden">Solo ocultos</option>
            <option value="archived">Solo archivados</option>
          </select>
        </div>
        <div class="form-group flex items-end justify-between gap-2">
          <span class="text-sm text-ink-muted">{{ filtered.length }} resultados</span>
          <button class="text-xs font-medium text-primary hover:underline" @click="resetFilters">Limpiar filtros</button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-sm text-ink-muted">Cargando…</div>
    <div v-else-if="error" class="rounded-lg bg-red-50 p-4 text-sm text-red-700">{{ error }}</div>

    <div v-else class="table-container">
      <table class="table-base">
        <thead>
          <tr>
            <th class="text-left">Conflicto</th>
            <th class="text-left">Estado</th>
            <th class="text-left">Intensidad</th>
            <th class="text-left">Status</th>
            <th class="text-right">Arrecifes</th>
            <th class="text-center">Visible</th>
            <th class="text-center">Archivado</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in filtered" :key="c.id" class="border-t border-gray-100 hover:bg-gray-50/50">
            <td class="py-3">
              <p class="font-medium text-ink line-clamp-1">{{ c.title }}</p>
              <p class="text-xs text-ink-muted line-clamp-1">{{ c.summary }}</p>
            </td>
            <td class="text-sm text-ink-muted">{{ c.state }}</td>
            <td><span :class="intensityClass[c.intensity] || 'badge-secondary'">{{ intensityLabel[c.intensity] || c.intensity }}</span></td>
            <td><span class="badge-secondary">{{ statusLabel[c.status] || c.status }}</span></td>
            <td class="text-right font-mono text-sm text-ink">{{ Array.isArray(c.reefIds) ? c.reefIds.length : 0 }}</td>
            <td class="text-center">
              <button class="rounded-full px-2 py-1 text-xs font-semibold" :class="(c.visible ?? true) ? 'bg-eco/10 text-eco-dark' : 'bg-gray-100 text-gray-500'" @click="toggle(c, 'visible')">
                {{ (c.visible ?? true) ? 'Sí' : 'Oculto' }}
              </button>
            </td>
            <td class="text-center">
              <button class="rounded-full px-2 py-1 text-xs font-semibold" :class="(c.archived ?? false) ? 'bg-coral/10 text-coral-dark' : 'bg-gray-100 text-gray-500'" @click="toggle(c, 'archived')">
                {{ (c.archived ?? false) ? 'Archivado' : 'Activo' }}
              </button>
            </td>
            <td>
              <div class="flex justify-end gap-1">
                <button class="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-primary-50 hover:text-primary" title="Editar" @click="openEdit(c)">
                  <Icon name="lucide:pencil" size="16" />
                </button>
                <button class="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-red-50 hover:text-red-600" title="Eliminar" @click="remove(c)">
                  <Icon name="lucide:trash-2" size="16" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Transition name="fade">
      <div v-if="editingId !== null" class="fixed inset-0 z-[200] flex items-end justify-center overflow-y-auto bg-black/40 sm:items-center" @click.self="closeEditor">
        <div class="my-8 w-full max-w-2xl rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
          <header class="mb-4 flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-ink">{{ editingId === 0 ? 'Nuevo conflicto' : 'Editar conflicto' }}</h3>
              <p class="text-xs text-ink-muted">Listas separadas por coma.</p>
            </div>
            <button class="rounded-lg p-2 text-gray-400 hover:bg-gray-100" @click="closeEditor">
              <Icon name="lucide:x" size="18" />
            </button>
          </header>

          <div class="space-y-4">
            <div class="form-group">
              <label class="form-label">Título *</label>
              <input v-model="form.title" type="text" class="input w-full" />
            </div>
            <div class="form-group">
              <label class="form-label">Resumen *</label>
              <textarea v-model="form.summary" rows="2" class="input w-full" />
            </div>
            <div class="form-group">
              <label class="form-label">Historia completa</label>
              <textarea v-model="form.fullStory" rows="5" class="input w-full" />
            </div>

            <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div class="form-group">
                <label class="form-label">Estado</label>
                <input v-model="form.state" type="text" class="input w-full" />
              </div>
              <div class="form-group">
                <label class="form-label">Intensidad</label>
                <select v-model="form.intensity" class="select w-full">
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="critical">Crítica</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Status</label>
                <select v-model="form.status" class="select w-full">
                  <option value="emerging">Emergente</option>
                  <option value="ongoing">En curso</option>
                  <option value="mitigating">Mitigando</option>
                  <option value="resolved">Resuelto</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Inició</label>
                <input v-model="form.startedAt" type="date" class="input w-full" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">IDs de arrecifes (CSV)</label>
              <input v-model="form.reefIds" type="text" class="input w-full" placeholder="1, 2, 5" />
            </div>
            <div class="form-group">
              <label class="form-label">Amenazas (CSV)</label>
              <input v-model="form.threats" type="text" class="input w-full" />
            </div>
            <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div class="form-group"><label class="form-label">Comunidades afectadas</label><input v-model="form.affectedCommunities" type="text" class="input w-full" /></div>
              <div class="form-group"><label class="form-label">Especies afectadas</label><input v-model="form.affectedSpecies" type="text" class="input w-full" /></div>
              <div class="form-group"><label class="form-label">Drivers</label><input v-model="form.drivers" type="text" class="input w-full" /></div>
              <div class="form-group"><label class="form-label">Resistance</label><input v-model="form.resistance" type="text" class="input w-full" /></div>
              <div class="form-group"><label class="form-label">Acciones legales</label><input v-model="form.legalActions" type="text" class="input w-full" /></div>
              <div class="form-group"><label class="form-label">URLs medios</label><input v-model="form.mediaUrls" type="text" class="input w-full" /></div>
            </div>

            <div class="flex gap-4 border-t border-gray-100 pt-4">
              <label class="flex items-center gap-2 text-sm">
                <input v-model="form.visible" type="checkbox" class="h-4 w-4 rounded" /> Visible
              </label>
              <label class="flex items-center gap-2 text-sm">
                <input v-model="form.archived" type="checkbox" class="h-4 w-4 rounded" /> Archivado
              </label>
            </div>

            <div v-if="formError" class="rounded-lg bg-red-50 p-3 text-sm text-red-700">{{ formError }}</div>
          </div>

          <div class="mt-5 flex justify-end gap-2">
            <button class="btn-ghost" @click="closeEditor">Cancelar</button>
            <button class="btn-primary" :disabled="saving" @click="save">
              <Icon v-if="saving" name="lucide:loader-2" size="14" class="animate-spin-smooth" />
              {{ editingId === 0 ? 'Crear' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

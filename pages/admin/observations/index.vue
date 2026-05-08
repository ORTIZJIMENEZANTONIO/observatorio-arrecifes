<script setup lang="ts">
import type { Observation, ObservationStatus } from '~/types'
import { GLOSSARY } from '~/data/admin-glossary'

definePageMeta({ layout: 'admin', middleware: 'admin', pageTransition: false })

const route = useRoute()
const { apiFetch } = useApi()
const items = ref<Observation[]>([])
const loading = ref(true)
const error = ref('')

// ── Filtros ──
const search = ref('')
const filterStatus = ref<ObservationStatus | 'all'>(((route.query.status as any) || 'all'))
const filterType = ref<string>('all')
const filterReefId = ref<string>('all')
const filterContributorId = ref<string>('all')
const filtersOpen = ref(false)
const activeFilterCount = computed(() =>
  [filterStatus.value, filterType.value, filterReefId.value, filterContributorId.value]
    .filter((v) => v !== 'all').length + (search.value.trim() ? 1 : 0),
)

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  in_review: 'En revisión',
  validated: 'Validado',
  rejected: 'Rechazado',
  needs_more_info: 'Falta info',
}
const statusBadge: Record<string, string> = {
  pending: 'badge-accent',
  in_review: 'badge-secondary',
  validated: 'badge-eco',
  rejected: 'badge-alert',
  needs_more_info: 'badge-coral',
}
const typeLabels: Record<string, string> = {
  satellite_image: 'Satelital',
  drone_flight: 'Dron',
  underwater_photo: 'Foto subacuática',
  transect_survey: 'Transecto',
  water_sample: 'Muestra de agua',
  community_report: 'Reporte ciudadano',
  socioenvironmental_conflict: 'Conflicto socioambiental',
}

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await apiFetch<{ success: boolean; items: Observation[] }>('/admin/observations?limit=200')
    items.value = res.items
  } catch (e: any) {
    error.value = e?.data?.error?.message || 'No se pudieron cargar las observaciones'
  } finally {
    loading.value = false
  }
}

const reefIds = computed(() => Array.from(new Set(items.value.map((o) => o.reefId).filter(Boolean))).sort((a, b) => Number(a) - Number(b)))
const contributorIds = computed(() => Array.from(new Set(items.value.map((o) => o.contributorId))).sort((a, b) => Number(a) - Number(b)))

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return items.value.filter((o) => {
    if (q && !`${o.title} ${o.description}`.toLowerCase().includes(q)) return false
    if (filterStatus.value !== 'all' && o.status !== filterStatus.value) return false
    if (filterType.value !== 'all' && o.type !== filterType.value) return false
    if (filterReefId.value !== 'all' && String(o.reefId ?? '') !== filterReefId.value) return false
    if (filterContributorId.value !== 'all' && String(o.contributorId) !== filterContributorId.value) return false
    return true
  })
})

const resetFilters = () => {
  search.value = ''
  filterStatus.value = 'all'
  filterType.value = 'all'
  filterReefId.value = 'all'
  filterContributorId.value = 'all'
}

const { sorted, sortKey, sortDir, toggleSort } = useSortableList(filtered, { defaultKey: 'submittedAt', defaultDir: 'desc' })
const { paginated: paginatedObs, currentPage, totalPages, perPage } = usePaginatedList(sorted, { perPage: 15 })

// ── Review modal ──
const reviewing = ref<Observation | null>(null)
const reviewForm = ref({ status: 'validated' as ObservationStatus, qualityScore: 80, reviewerNotes: '' })

const openReview = (obs: Observation) => {
  reviewing.value = obs
  reviewForm.value = {
    status: 'validated',
    qualityScore: obs.qualityScore ?? 80,
    reviewerNotes: obs.reviewerNotes ?? '',
  }
}
const submitReview = async () => {
  if (!reviewing.value) return
  try {
    await apiFetch(`/admin/observations/${reviewing.value.id}/review`, {
      method: 'POST',
      body: reviewForm.value,
    })
    reviewing.value = null
    await load()
  } catch (e: any) {
    error.value = e?.data?.error?.message || 'No se pudo procesar la revisión'
  }
}

// ── Edit modal ── (corrige typos/coords/fecha sin tocar el estado de revisión)
type EditForm = {
  title: string
  description: string
  lat: number
  lng: number
  capturedAt: string
  reefId: number | null
  type: string
  tagsCsv: string
}

const editing = ref<Observation | null>(null)
const editForm = ref<EditForm>({
  title: '',
  description: '',
  lat: 0,
  lng: 0,
  capturedAt: '',
  reefId: null,
  type: 'underwater_photo',
  tagsCsv: '',
})
const savingEdit = ref(false)

const toDateInput = (d: string | Date | null | undefined): string => {
  if (!d) return ''
  const dt = typeof d === 'string' ? new Date(d) : d
  if (Number.isNaN(dt.getTime())) return ''
  return dt.toISOString().slice(0, 10)
}

const openEdit = (obs: Observation) => {
  editing.value = obs
  editForm.value = {
    title: obs.title ?? '',
    description: obs.description ?? '',
    lat: Number(obs.lat) || 0,
    lng: Number(obs.lng) || 0,
    capturedAt: toDateInput(obs.capturedAt),
    reefId: obs.reefId ?? null,
    type: obs.type,
    tagsCsv: (obs.tags || []).join(', '),
  }
}

const submitEdit = async () => {
  if (!editing.value) return
  savingEdit.value = true
  try {
    const payload = {
      title: editForm.value.title.trim(),
      description: editForm.value.description.trim(),
      lat: Number(editForm.value.lat),
      lng: Number(editForm.value.lng),
      capturedAt: editForm.value.capturedAt || null,
      reefId: editForm.value.reefId === null || (editForm.value.reefId as any) === '' ? null : Number(editForm.value.reefId),
      type: editForm.value.type,
      tags: editForm.value.tagsCsv
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    }
    await apiFetch(`/admin/observations/${editing.value.id}`, { method: 'PATCH', body: payload })
    editing.value = null
    await load()
  } catch (e: any) {
    error.value = e?.data?.error?.message || 'No se pudo actualizar el aporte'
  } finally {
    savingEdit.value = false
  }
}

const remove = async (o: Observation) => {
  if (!confirm(`¿Eliminar aporte "${o.title}"?`)) return
  try {
    await apiFetch(`/admin/observations/${o.id}`, { method: 'DELETE' })
    items.value = items.value.filter((x) => x.id !== o.id)
  } catch (e: any) {
    error.value = e?.data?.error?.message || 'No se pudo eliminar'
  }
}

const formatDate = (d: string | Date | undefined): string => {
  if (!d) return '—'
  const dt = typeof d === 'string' ? new Date(d) : d
  return Number.isNaN(dt.getTime()) ? '—' : dt.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

onMounted(load)
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 class="text-2xl font-semibold text-ink">Cola de revisión</h2>
        <p class="mt-1 text-sm text-ink-muted">{{ items.length }} aportes ciudadanos en el sistema.</p>
      </div>
      <button class="btn-outline btn-sm" @click="load">
        <Icon name="lucide:refresh-cw" size="14" /> Refrescar
      </button>
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
          <input v-model="search" type="search" class="input w-full" placeholder="Título o descripción…" />
        </div>
        <div class="form-group">
          <label class="form-label">Estado</label>
          <select v-model="filterStatus" class="select w-full">
            <option value="all">Todos</option>
            <option v-for="(label, key) in statusLabels" :key="key" :value="key">{{ label }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Tipo</label>
          <select v-model="filterType" class="select w-full">
            <option value="all">Todos</option>
            <option v-for="(label, key) in typeLabels" :key="key" :value="key">{{ label }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Arrecife</label>
          <select v-model="filterReefId" class="select w-full">
            <option value="all">Todos</option>
            <option v-for="id in reefIds" :key="id" :value="String(id)">#{{ id }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Colaborador</label>
          <select v-model="filterContributorId" class="select w-full">
            <option value="all">Todos</option>
            <option v-for="id in contributorIds" :key="id" :value="String(id)">#{{ id }}</option>
          </select>
        </div>
        <div class="form-group flex items-end justify-between gap-2 lg:col-span-5">
          <span class="text-sm text-ink-muted">{{ filtered.length }} resultados</span>
          <button class="text-xs font-medium text-primary hover:underline" @click="resetFilters">Limpiar filtros</button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-sm text-ink-muted">Cargando…</div>
    <div v-else-if="error" class="rounded-lg bg-red-50 p-4 text-sm text-red-700">{{ error }}</div>
    <div v-else-if="!filtered.length" class="card p-8 text-center text-sm text-ink-muted">
      Sin aportes que coincidan con los filtros.
    </div>

    <div v-else class="table-container">
      <table class="table-base">
        <thead>
          <tr>
            <AdminSortableTh sort-key="title" :current-key="sortKey" :current-dir="sortDir" align="left" @sort="toggleSort('title')">
              <AdminInfoTooltip :text="GLOSSARY.observation" variant="inline">Aporte</AdminInfoTooltip>
            </AdminSortableTh>
            <AdminSortableTh sort-key="type" :current-key="sortKey" :current-dir="sortDir" align="left" @sort="toggleSort('type')">Tipo</AdminSortableTh>
            <AdminSortableTh sort-key="status" :current-key="sortKey" :current-dir="sortDir" align="left" @sort="toggleSort('status')">Estado</AdminSortableTh>
            <AdminSortableTh sort-key="qualityScore" :current-key="sortKey" :current-dir="sortDir" align="right" @sort="toggleSort('qualityScore')">
              <AdminInfoTooltip :text="GLOSSARY.qualityScore" variant="inline">Calidad</AdminInfoTooltip>
            </AdminSortableTh>
            <AdminSortableTh sort-key="reefId" :current-key="sortKey" :current-dir="sortDir" align="right" @sort="toggleSort('reefId')">Reef</AdminSortableTh>
            <AdminSortableTh sort-key="contributorId" :current-key="sortKey" :current-dir="sortDir" align="right" @sort="toggleSort('contributorId')">Colab.</AdminSortableTh>
            <AdminSortableTh sort-key="submittedAt" :current-key="sortKey" :current-dir="sortDir" align="right" @sort="toggleSort('submittedAt')">Recibido</AdminSortableTh>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="o in paginatedObs" :key="o.id" class="border-t border-gray-100 hover:bg-gray-50/50">
            <td class="py-3">
              <p class="font-medium text-ink line-clamp-1">{{ o.title }}</p>
              <p class="text-xs text-ink-muted line-clamp-1">{{ o.description }}</p>
            </td>
            <td class="text-sm text-ink-muted">{{ typeLabels[o.type] || o.type }}</td>
            <td><span :class="statusBadge[o.status] || 'badge-secondary'">{{ statusLabels[o.status] || o.status }}</span></td>
            <td class="text-right font-mono text-sm text-ink">{{ o.qualityScore ?? '—' }}</td>
            <td class="text-right font-mono text-xs text-ink-muted">{{ o.reefId ? `#${o.reefId}` : '—' }}</td>
            <td class="text-right font-mono text-xs text-ink-muted">#{{ o.contributorId }}</td>
            <td class="text-right text-xs text-ink-muted">{{ formatDate(o.submittedAt) }}</td>
            <td>
              <div class="flex justify-end gap-1">
                <button class="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-primary-50 hover:text-primary" title="Revisar" @click="openReview(o)">
                  <Icon name="lucide:check-circle-2" size="16" />
                </button>
                <button class="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-amber-50 hover:text-amber-600" title="Editar metadatos" @click="openEdit(o)">
                  <Icon name="lucide:pencil" size="16" />
                </button>
                <button class="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-red-50 hover:text-red-600" title="Eliminar" @click="remove(o)">
                  <Icon name="lucide:trash-2" size="16" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <CommonPaginationControls
      v-if="filtered.length > 0"
      v-model:current-page="currentPage"
      :total-pages="totalPages"
      :total-items="filtered.length"
      :per-page="perPage"
    />

    <Transition name="fade">
      <div v-if="reviewing" class="fixed inset-0 z-[200] flex items-end justify-center bg-black/40 sm:items-center" @click.self="reviewing = null">
        <div class="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
          <header class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-ink">Revisar aporte</h3>
            <button class="rounded-lg p-2 text-gray-400 hover:bg-gray-100" @click="reviewing = null"><Icon name="lucide:x" size="18" /></button>
          </header>
          <p class="mb-3 text-sm font-semibold text-ink">{{ reviewing.title }}</p>
          <p class="mb-3 line-clamp-3 text-xs text-ink-muted">{{ reviewing.description }}</p>
          <div class="space-y-3">
            <div class="form-group">
              <label class="form-label">Decisión</label>
              <select v-model="reviewForm.status" class="select w-full">
                <option value="validated">Validar</option>
                <option value="rejected">Rechazar</option>
                <option value="needs_more_info">Solicitar más información</option>
                <option value="in_review">Marcar en revisión</option>
              </select>
            </div>
            <div v-if="reviewForm.status === 'validated'" class="form-group">
              <label class="form-label">
                <AdminInfoTooltip :text="GLOSSARY.qualityScore" variant="inline">
                  Calidad técnica (0-100)
                </AdminInfoTooltip>
              </label>
              <input v-model.number="reviewForm.qualityScore" type="number" min="0" max="100" class="input w-full" />
            </div>
            <div class="form-group">
              <label class="form-label">Notas del revisor</label>
              <textarea v-model="reviewForm.reviewerNotes" rows="3" class="input w-full" />
            </div>
          </div>
          <div class="mt-5 flex justify-end gap-2">
            <button class="btn-ghost" @click="reviewing = null">Cancelar</button>
            <button class="btn-primary" @click="submitReview">Confirmar</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Edit modal: corrige metadatos del aporte sin alterar el estado de revisión. -->
    <Transition name="fade">
      <div
        v-if="editing"
        class="fixed inset-0 z-[200] flex items-end justify-center overflow-y-auto bg-black/40 sm:items-center"
        @click.self="editing = null"
      >
        <div class="my-8 w-full max-w-xl rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
          <header class="mb-4 flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-ink">Editar aporte</h3>
              <p class="text-xs text-ink-muted">Cambia metadatos sin tocar el estado de revisión.</p>
            </div>
            <button class="rounded-lg p-2 text-gray-400 hover:bg-gray-100" @click="editing = null">
              <Icon name="lucide:x" size="18" />
            </button>
          </header>
          <div class="space-y-3">
            <div class="form-group">
              <label class="form-label">Título</label>
              <input v-model="editForm.title" type="text" class="input w-full" />
            </div>
            <div class="form-group">
              <label class="form-label">Descripción</label>
              <textarea v-model="editForm.description" rows="3" class="input w-full" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="form-group">
                <label class="form-label">Latitud</label>
                <input v-model.number="editForm.lat" type="number" step="0.0001" class="input w-full" />
              </div>
              <div class="form-group">
                <label class="form-label">Longitud</label>
                <input v-model.number="editForm.lng" type="number" step="0.0001" class="input w-full" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="form-group">
                <label class="form-label">Fecha de captura</label>
                <input v-model="editForm.capturedAt" type="date" class="input w-full" />
              </div>
              <div class="form-group">
                <label class="form-label">Reef ID</label>
                <input v-model.number="editForm.reefId" type="number" min="1" class="input w-full" placeholder="Sin arrecife" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Tipo</label>
              <select v-model="editForm.type" class="select w-full">
                <option v-for="(label, key) in typeLabels" :key="key" :value="key">{{ label }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Etiquetas (separadas por coma)</label>
              <input v-model="editForm.tagsCsv" type="text" class="input w-full" placeholder="SCTLD, blanqueamiento…" />
            </div>
          </div>
          <div class="mt-5 flex justify-end gap-2">
            <button class="btn-ghost" :disabled="savingEdit" @click="editing = null">Cancelar</button>
            <button class="btn-primary" :disabled="savingEdit" @click="submitEdit">
              <Icon
                :name="savingEdit ? 'lucide:loader-2' : 'lucide:save'"
                size="14"
                :class="savingEdit ? 'animate-spin-smooth' : ''"
              />
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

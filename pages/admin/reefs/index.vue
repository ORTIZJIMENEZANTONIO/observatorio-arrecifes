<script setup lang="ts">
import type { Reef } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'admin', pageTransition: false })

const { apiFetch } = useApi()
const items = ref<Reef[]>([])
const loading = ref(true)
const error = ref('')
const search = ref('')
const filterOcean = ref<'all' | 'caribbean' | 'gulf_of_mexico' | 'pacific'>('all')
const filterStatus = ref<string>('all')
const filterProtection = ref<string>('all')
const filterVisibility = ref<'all' | 'visible' | 'hidden' | 'archived'>('all')
const filtersOpen = ref(false)
const activeFilterCount = computed(() =>
  [filterOcean.value, filterStatus.value, filterProtection.value, filterVisibility.value]
    .filter((v) => v !== 'all').length + (search.value.trim() ? 1 : 0),
)

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
    const res = await apiFetch<{ success: boolean; items: Reef[] }>('/admin/reefs?limit=200')
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
    if (filterStatus.value !== 'all' && r.status !== filterStatus.value) return false
    if (filterProtection.value !== 'all' && r.protection !== filterProtection.value) return false
    if (filterVisibility.value === 'visible' && !(r.visible ?? true)) return false
    if (filterVisibility.value === 'hidden' && (r.visible ?? true)) return false
    if (filterVisibility.value === 'archived' && !(r.archived ?? false)) return false
    return true
  })
})

const resetFilters = () => {
  search.value = ''
  filterOcean.value = 'all'
  filterStatus.value = 'all'
  filterProtection.value = 'all'
  filterVisibility.value = 'all'
}

const toggleField = async (reef: Reef, field: 'visible' | 'archived') => {
  const next = !((reef as any)[field] ?? (field === 'visible'))
  try {
    await apiFetch(`/admin/reefs/${reef.id}`, { method: 'PATCH', body: { [field]: next } })
    ;(reef as any)[field] = next
  } catch (e: any) {
    error.value = e?.data?.error?.message || 'No se pudo actualizar'
  }
}

// ── Editor (Create + Edit) ──
type ReefForm = {
  name: string; state: string; ocean: 'caribbean' | 'gulf_of_mexico' | 'pacific'; region: string
  area: number | null; lat: number | null; lng: number | null
  depthMin: number | null; depthMax: number | null
  protection: string; status: string; bleachingAlert: string
  liveCoralCover: number | null; speciesRichness: number | null; observations: number
  benthicClasses: string; geomorphicClasses: string; threats: string
  description: string; hero: string; imageCredit: string
  gallery: [string, string, string]
  visible: boolean; archived: boolean
}

const blankForm = (): ReefForm => ({
  name: '', state: '', ocean: 'caribbean', region: '',
  area: null, lat: null, lng: null,
  depthMin: null, depthMax: null,
  protection: 'unprotected', status: 'healthy', bleachingAlert: '',
  liveCoralCover: null, speciesRichness: null, observations: 0,
  benthicClasses: '', geomorphicClasses: '', threats: '',
  description: '', hero: '', imageCredit: '',
  gallery: ['', '', ''],
  visible: true, archived: false,
})

const editingId = ref<number | null>(null)  // null = closed; 0 = create; >0 = edit
const form = ref<ReefForm>(blankForm())
const saving = ref(false)
const formError = ref('')

const openCreate = () => {
  editingId.value = 0
  form.value = blankForm()
  formError.value = ''
}
const openEdit = (r: Reef) => {
  editingId.value = r.id
  formError.value = ''
  const g = Array.isArray(r.gallery) ? r.gallery : []
  const dr = Array.isArray(r.depthRange) ? r.depthRange : [null, null]
  form.value = {
    name: r.name || '', state: r.state || '', ocean: r.ocean || 'caribbean', region: r.region || '',
    area: Number(r.area) || null,
    lat: r.lat != null ? Number(r.lat) : null,
    lng: r.lng != null ? Number(r.lng) : null,
    depthMin: dr[0] != null ? Number(dr[0]) : null,
    depthMax: dr[1] != null ? Number(dr[1]) : null,
    protection: r.protection || 'unprotected',
    status: r.status || 'healthy',
    bleachingAlert: r.bleachingAlert || '',
    liveCoralCover: r.liveCoralCover != null ? Number(r.liveCoralCover) : null,
    speciesRichness: r.speciesRichness != null ? Number(r.speciesRichness) : null,
    observations: r.observations || 0,
    benthicClasses: (r.benthicClasses || []).join(', '),
    geomorphicClasses: (r.geomorphicClasses || []).join(', '),
    threats: (r.threats || []).join(', '),
    description: r.description || '',
    hero: r.hero || '',
    imageCredit: r.imageCredit || '',
    gallery: [g[0] || '', g[1] || '', g[2] || ''],
    visible: r.visible ?? true,
    archived: r.archived ?? false,
  }
}
const closeEditor = () => { editingId.value = null }

const buildPayload = () => {
  const f = form.value
  const splitCsv = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean)
  const gallery = f.gallery.map((s) => s.trim()).filter(Boolean)
  return {
    name: f.name.trim(),
    state: f.state.trim(),
    ocean: f.ocean,
    region: f.region.trim() || null,
    area: f.area ?? 0,
    lat: f.lat ?? 0,
    lng: f.lng ?? 0,
    depthRange: [f.depthMin ?? 0, f.depthMax ?? 0],
    protection: f.protection,
    status: f.status,
    bleachingAlert: f.bleachingAlert || null,
    liveCoralCover: f.liveCoralCover,
    speciesRichness: f.speciesRichness,
    observations: f.observations,
    benthicClasses: splitCsv(f.benthicClasses),
    geomorphicClasses: splitCsv(f.geomorphicClasses),
    threats: splitCsv(f.threats),
    description: f.description.trim() || null,
    hero: f.hero.trim() || null,
    imageCredit: f.imageCredit.trim() || null,
    gallery: gallery.length ? gallery : null,
    visible: f.visible,
    archived: f.archived,
  }
}

const save = async () => {
  if (editingId.value === null) return
  if (!form.value.name.trim()) { formError.value = 'Nombre requerido'; return }
  if (!form.value.state.trim()) { formError.value = 'Estado requerido'; return }
  saving.value = true
  formError.value = ''
  try {
    const payload = buildPayload()
    if (editingId.value === 0) {
      await apiFetch('/admin/reefs', { method: 'POST', body: payload })
    } else {
      await apiFetch(`/admin/reefs/${editingId.value}`, { method: 'PATCH', body: payload })
    }
    closeEditor()
    await load()
  } catch (e: any) {
    formError.value = e?.data?.error?.message || 'No se pudo guardar'
  } finally {
    saving.value = false
  }
}

const remove = async (r: Reef) => {
  if (!confirm(`¿Eliminar "${r.name}"? Esta acción no se puede deshacer.`)) return
  try {
    await apiFetch(`/admin/reefs/${r.id}`, { method: 'DELETE' })
    items.value = items.value.filter((x) => x.id !== r.id)
  } catch (e: any) {
    error.value = e?.data?.error?.message || 'No se pudo eliminar'
  }
}

onMounted(load)
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 class="text-2xl font-semibold text-ink">Arrecifes</h2>
        <p class="mt-1 text-sm text-ink-muted">{{ items.length }} en total · gestiona el inventario completo.</p>
      </div>
      <div class="flex gap-2">
        <button class="btn-outline btn-sm" @click="load">
          <Icon name="lucide:refresh-cw" size="14" /> Refrescar
        </button>
        <button class="btn-primary btn-sm" @click="openCreate">
          <Icon name="lucide:plus" size="14" /> Nuevo arrecife
        </button>
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
        <div class="form-group">
          <label class="form-label">Estatus</label>
          <select v-model="filterStatus" class="select w-full">
            <option value="all">Todos</option>
            <option value="healthy">Saludable</option>
            <option value="watch">Vigilancia</option>
            <option value="warning">Advertencia</option>
            <option value="alert">Alerta</option>
            <option value="bleaching">Blanqueamiento</option>
            <option value="mortality">Mortalidad</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Protección</label>
          <select v-model="filterProtection" class="select w-full">
            <option value="all">Todas</option>
            <option value="anp_federal">ANP federal</option>
            <option value="anp_state">ANP estatal</option>
            <option value="ramsar">Ramsar</option>
            <option value="unesco">UNESCO</option>
            <option value="unprotected">Sin protección</option>
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
        <div class="form-group flex items-end justify-between gap-2 lg:col-span-5">
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
            <th class="text-left">Arrecife</th>
            <th class="text-left">Estado</th>
            <th class="text-left">Litoral</th>
            <th class="text-left">Estatus</th>
            <th class="text-right">Cobertura</th>
            <th class="text-center">Visible</th>
            <th class="text-center">Archivado</th>
            <th class="text-right">Acciones</th>
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
            <td><span class="badge-secondary">{{ statusLabels[r.status] || r.status }}</span></td>
            <td class="text-right text-sm font-mono text-ink">{{ r.liveCoralCover ?? '—' }}%</td>
            <td class="text-center">
              <button class="rounded-full px-2 py-1 text-xs font-semibold" :class="(r.visible ?? true) ? 'bg-eco/10 text-eco-dark' : 'bg-gray-100 text-gray-500'" @click="toggleField(r, 'visible')">
                {{ (r.visible ?? true) ? 'Sí' : 'Oculto' }}
              </button>
            </td>
            <td class="text-center">
              <button class="rounded-full px-2 py-1 text-xs font-semibold" :class="(r.archived ?? false) ? 'bg-coral/10 text-coral-dark' : 'bg-gray-100 text-gray-500'" @click="toggleField(r, 'archived')">
                {{ (r.archived ?? false) ? 'Archivado' : 'Activo' }}
              </button>
            </td>
            <td>
              <div class="flex justify-end gap-1">
                <button class="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-primary-50 hover:text-primary" title="Editar" @click="openEdit(r)">
                  <Icon name="lucide:pencil" size="16" />
                </button>
                <button class="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-red-50 hover:text-red-600" title="Eliminar" @click="remove(r)">
                  <Icon name="lucide:trash-2" size="16" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create / Edit modal -->
    <Transition name="fade">
      <div v-if="editingId !== null" class="fixed inset-0 z-[200] flex items-end justify-center overflow-y-auto bg-black/40 sm:items-center" @click.self="closeEditor">
        <div class="my-8 w-full max-w-2xl rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
          <header class="mb-4 flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-ink">{{ editingId === 0 ? 'Nuevo arrecife' : 'Editar arrecife' }}</h3>
              <p class="text-xs text-ink-muted">Llena los campos. Listas separadas por coma.</p>
            </div>
            <button class="rounded-lg p-2 text-gray-400 hover:bg-gray-100" @click="closeEditor">
              <Icon name="lucide:x" size="18" />
            </button>
          </header>

          <div class="space-y-4">
            <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div class="form-group">
                <label class="form-label">Nombre *</label>
                <input v-model="form.name" type="text" class="input w-full" />
              </div>
              <div class="form-group">
                <label class="form-label">Estado *</label>
                <input v-model="form.state" type="text" class="input w-full" placeholder="Quintana Roo, Veracruz…" />
              </div>
              <div class="form-group">
                <label class="form-label">Litoral</label>
                <select v-model="form.ocean" class="select w-full">
                  <option value="caribbean">Caribe</option>
                  <option value="gulf_of_mexico">Golfo de México</option>
                  <option value="pacific">Pacífico</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Región</label>
                <input v-model="form.region" type="text" class="input w-full" placeholder="Sistema Arrecifal Mesoamericano…" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div class="form-group">
                <label class="form-label">Lat *</label>
                <input v-model.number="form.lat" type="number" step="0.0001" class="input w-full" />
              </div>
              <div class="form-group">
                <label class="form-label">Lng *</label>
                <input v-model.number="form.lng" type="number" step="0.0001" class="input w-full" />
              </div>
              <div class="form-group">
                <label class="form-label">Área (ha)</label>
                <input v-model.number="form.area" type="number" min="0" class="input w-full" />
              </div>
              <div class="form-group">
                <label class="form-label">Cobertura coral (%)</label>
                <input v-model.number="form.liveCoralCover" type="number" min="0" max="100" class="input w-full" />
              </div>
              <div class="form-group">
                <label class="form-label">Profundidad mín (m)</label>
                <input v-model.number="form.depthMin" type="number" min="0" class="input w-full" />
              </div>
              <div class="form-group">
                <label class="form-label">Profundidad máx (m)</label>
                <input v-model.number="form.depthMax" type="number" min="0" class="input w-full" />
              </div>
              <div class="form-group">
                <label class="form-label">Riqueza coral (spp)</label>
                <input v-model.number="form.speciesRichness" type="number" min="0" class="input w-full" />
              </div>
              <div class="form-group">
                <label class="form-label">Aportes</label>
                <input v-model.number="form.observations" type="number" min="0" class="input w-full" />
              </div>
            </div>

            <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div class="form-group">
                <label class="form-label">Estatus</label>
                <select v-model="form.status" class="select w-full">
                  <option value="healthy">Saludable</option>
                  <option value="watch">Vigilancia</option>
                  <option value="warning">Advertencia</option>
                  <option value="alert">Alerta</option>
                  <option value="bleaching">Blanqueamiento</option>
                  <option value="mortality">Mortalidad</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Protección</label>
                <select v-model="form.protection" class="select w-full">
                  <option value="unprotected">Sin protección</option>
                  <option value="anp_federal">ANP federal</option>
                  <option value="anp_state">ANP estatal</option>
                  <option value="ramsar">Ramsar</option>
                  <option value="unesco">UNESCO</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Alerta NOAA CRW</label>
                <select v-model="form.bleachingAlert" class="select w-full">
                  <option value="">— ninguna —</option>
                  <option value="no_stress">No stress</option>
                  <option value="watch">Watch</option>
                  <option value="warning">Warning</option>
                  <option value="alert_1">Alert 1</option>
                  <option value="alert_2">Alert 2</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Clases bentónicas (CSV)</label>
              <input v-model="form.benthicClasses" type="text" class="input w-full" placeholder="coral_algae, sand, seagrass" />
            </div>
            <div class="form-group">
              <label class="form-label">Clases geomórficas (CSV)</label>
              <input v-model="form.geomorphicClasses" type="text" class="input w-full" placeholder="fringing, reef_crest, lagoon" />
            </div>
            <div class="form-group">
              <label class="form-label">Amenazas (CSV)</label>
              <input v-model="form.threats" type="text" class="input w-full" placeholder="thermal_stress, sargassum, tourism_pressure" />
            </div>
            <div class="form-group">
              <label class="form-label">Descripción</label>
              <textarea v-model="form.description" rows="3" class="input w-full" />
            </div>

            <div class="border-t border-gray-100 pt-4">
              <p class="mb-3 text-sm font-semibold text-ink">Imágenes</p>
              <div class="form-group">
                <label class="form-label">Imagen principal (hero)</label>
                <input v-model="form.hero" type="url" class="input w-full" placeholder="/images/reefs/X.jpg o https://…" />
                <div v-if="form.hero" class="mt-2 aspect-[16/9] overflow-hidden rounded-lg bg-gray-100">
                  <img :src="form.hero" alt="hero preview" class="h-full w-full object-cover" @error="(e) => ((e.target as HTMLImageElement).style.opacity = '0.2')" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Crédito de imagen</label>
                <input v-model="form.imageCredit" type="text" class="input w-full" placeholder="CONANP / Allen Coral Atlas" />
              </div>
              <div class="form-group">
                <label class="form-label">Galería (hasta 3 URLs)</label>
                <div class="space-y-2">
                  <input v-for="i in 3" :key="i" v-model="form.gallery[i - 1]" type="url" class="input w-full" :placeholder="`URL ${i}`" />
                </div>
                <div v-if="form.gallery.some((g) => g)" class="mt-3 grid grid-cols-3 gap-2">
                  <div v-for="(g, idx) in form.gallery" :key="idx" class="aspect-square overflow-hidden rounded-md bg-gray-100">
                    <img v-if="g" :src="g" :alt="`gallery ${idx + 1}`" class="h-full w-full object-cover" @error="(e) => ((e.target as HTMLImageElement).style.opacity = '0.2')" />
                  </div>
                </div>
              </div>
            </div>

            <div class="flex gap-4 border-t border-gray-100 pt-4">
              <label class="flex items-center gap-2 text-sm">
                <input v-model="form.visible" type="checkbox" class="h-4 w-4 rounded" />
                Visible al público
              </label>
              <label class="flex items-center gap-2 text-sm">
                <input v-model="form.archived" type="checkbox" class="h-4 w-4 rounded" />
                Archivado
              </label>
            </div>

            <div v-if="formError" class="rounded-lg bg-red-50 p-3 text-sm text-red-700">{{ formError }}</div>
          </div>

          <div class="mt-5 flex justify-end gap-2">
            <button class="btn-ghost" @click="closeEditor">Cancelar</button>
            <button class="btn-primary" :disabled="saving" @click="save">
              <Icon v-if="saving" name="lucide:loader-2" size="14" class="animate-spin-smooth" />
              {{ editingId === 0 ? 'Crear' : 'Guardar cambios' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin', pageTransition: false })

interface Layer {
  id: number
  slug: string
  title: string
  description: string | null
  kind: 'external_url' | 'uploaded_file'
  provider: string
  providerLabel: string
  category: string
  format: string
  resolution: string | null
  cadence: string | null
  coverage: 'global' | 'regional' | 'national'
  license: string
  attribution: string
  sourceUrl: string | null
  downloadUrl: string | null
  previewUrl: string | null
  wmsUrl: string | null
  wmsLayerName: string | null
  tileUrlPattern: string | null
  overlayOpacity: number
  fileName: string | null
  filePath: string | null
  fileSize: number | null
  mimeType: string | null
  lastUpdated: string | null
  active: boolean
  visible: boolean
  archived: boolean
  sortOrder: number
}

const { apiFetch, baseURL, observatory } = useApi()
const items = ref<Layer[]>([])
const loading = ref(true)
const error = ref('')

const search = ref('')
const filterProvider = ref<string>('all')
const filterCategory = ref<string>('all')
const filterKind = ref<string>('all')
const filterArchived = ref<'all' | 'true' | 'false'>('false')
const filtersOpen = ref(false)

const activeFilterCount = computed(() =>
  [filterProvider.value, filterCategory.value, filterKind.value]
    .filter((v) => v !== 'all').length
  + (filterArchived.value !== 'false' ? 1 : 0)
  + (search.value.trim() ? 1 : 0)
)

const PROVIDER_LABELS: Record<string, string> = {
  nasa: 'NASA',
  noaa: 'NOAA',
  esa_copernicus: 'ESA Copernicus',
  usgs: 'USGS',
  conabio: 'CONABIO',
  conanp: 'CONANP',
  inegi: 'INEGI',
  allen_coral_atlas: 'Allen Coral Atlas',
  global_fishing_watch: 'Global Fishing Watch',
}

const CATEGORY_LABELS: Record<string, string> = {
  thermal_stress: 'Estrés térmico',
  bathymetry: 'Batimetría',
  benthic_habitat: 'Hábitat bentónico',
  water_quality: 'Calidad del agua',
  protected_areas: 'Áreas protegidas',
  land_use: 'Uso de suelo',
  fishing_pressure: 'Presión pesquera',
  community_observations: 'Observaciones comunitarias',
}

const FORMAT_LABELS: Record<string, string> = {
  wms: 'WMS', wmts: 'WMTS', geotiff: 'GeoTIFF', shapefile: 'Shapefile',
  geojson: 'GeoJSON', kml: 'KML', csv: 'CSV', cog: 'COG',
}

const load = async () => {
  loading.value = true
  try {
    const res = await apiFetch<{ success: boolean; items: Layer[] }>(
      `/admin/layers?archived=${filterArchived.value === 'all' ? '' : filterArchived.value}&limit=200`,
    )
    items.value = res.items
  } catch (e: any) {
    error.value = e?.data?.error?.message || 'No se pudieron cargar las capas'
  } finally {
    loading.value = false
  }
}

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return items.value.filter((l) => {
    if (q && !`${l.title} ${l.slug} ${l.providerLabel} ${l.description || ''}`.toLowerCase().includes(q)) return false
    if (filterProvider.value !== 'all' && l.provider !== filterProvider.value) return false
    if (filterCategory.value !== 'all' && l.category !== filterCategory.value) return false
    if (filterKind.value !== 'all' && l.kind !== filterKind.value) return false
    return true
  })
})

const resetFilters = () => {
  search.value = ''
  filterProvider.value = 'all'
  filterCategory.value = 'all'
  filterKind.value = 'all'
  filterArchived.value = 'false'
}

watch(filterArchived, load)

// ── Editor metadata ──
type LayerForm = {
  slug: string
  title: string
  description: string
  kind: 'external_url' | 'uploaded_file'
  provider: string
  providerLabel: string
  category: string
  format: string
  resolution: string
  cadence: string
  coverage: 'global' | 'regional' | 'national'
  license: string
  attribution: string
  sourceUrl: string
  downloadUrl: string
  previewUrl: string
  wmsUrl: string
  wmsLayerName: string
  tileUrlPattern: string
  overlayOpacity: number
  lastUpdated: string
  active: boolean
  visible: boolean
  archived: boolean
  sortOrder: number
}

const blankForm = (): LayerForm => ({
  slug: '',
  title: '',
  description: '',
  kind: 'external_url',
  provider: 'noaa',
  providerLabel: 'NOAA',
  category: 'thermal_stress',
  format: 'geojson',
  resolution: '',
  cadence: '',
  coverage: 'regional',
  license: 'CC BY 4.0',
  attribution: '',
  sourceUrl: '',
  downloadUrl: '',
  previewUrl: '',
  wmsUrl: '',
  wmsLayerName: '',
  tileUrlPattern: '',
  overlayOpacity: 0.7,
  lastUpdated: '',
  active: true,
  visible: true,
  archived: false,
  sortOrder: items.value.length + 1,
})

const editingId = ref<number | null>(null)
const form = ref<LayerForm>(blankForm())
const saving = ref(false)
const formError = ref('')

const openCreate = () => {
  editingId.value = 0
  form.value = blankForm()
  formError.value = ''
}

const openEdit = (l: Layer) => {
  editingId.value = l.id
  formError.value = ''
  form.value = {
    slug: l.slug,
    title: l.title,
    description: l.description || '',
    kind: l.kind,
    provider: l.provider,
    providerLabel: l.providerLabel,
    category: l.category,
    format: l.format,
    resolution: l.resolution || '',
    cadence: l.cadence || '',
    coverage: l.coverage,
    license: l.license,
    attribution: l.attribution,
    sourceUrl: l.sourceUrl || '',
    downloadUrl: l.downloadUrl || '',
    previewUrl: l.previewUrl || '',
    wmsUrl: l.wmsUrl || '',
    wmsLayerName: l.wmsLayerName || '',
    tileUrlPattern: l.tileUrlPattern || '',
    overlayOpacity: Number(l.overlayOpacity) || 0.7,
    lastUpdated: l.lastUpdated || '',
    active: l.active,
    visible: l.visible,
    archived: l.archived,
    sortOrder: l.sortOrder,
  }
}

const closeEditor = () => { editingId.value = null }

const save = async () => {
  if (editingId.value === null) return
  if (!form.value.slug.trim()) { formError.value = 'Slug requerido'; return }
  if (!/^[a-z0-9-]+$/.test(form.value.slug)) { formError.value = 'Slug sólo a-z, 0-9, -'; return }
  if (!form.value.title.trim()) { formError.value = 'Título requerido'; return }
  if (!form.value.attribution.trim()) { formError.value = 'Atribución requerida (licencia + autor)'; return }
  saving.value = true
  formError.value = ''
  const f = form.value
  const payload: any = {
    slug: f.slug.trim().toLowerCase(),
    title: f.title.trim(),
    description: f.description.trim() || null,
    kind: f.kind,
    provider: f.provider,
    providerLabel: f.providerLabel.trim(),
    category: f.category,
    format: f.format,
    resolution: f.resolution.trim() || null,
    cadence: f.cadence.trim() || null,
    coverage: f.coverage,
    license: f.license.trim(),
    attribution: f.attribution.trim(),
    sourceUrl: f.sourceUrl.trim() || null,
    downloadUrl: f.downloadUrl.trim() || null,
    previewUrl: f.previewUrl.trim() || null,
    wmsUrl: f.wmsUrl.trim() || null,
    wmsLayerName: f.wmsLayerName.trim() || null,
    tileUrlPattern: f.tileUrlPattern.trim() || null,
    overlayOpacity: Number(f.overlayOpacity) || 0.7,
    lastUpdated: f.lastUpdated || null,
    active: f.active,
    visible: f.visible,
    archived: f.archived,
    sortOrder: Number(f.sortOrder) || 0,
  }
  try {
    if (editingId.value === 0) {
      await apiFetch('/admin/layers', { method: 'POST', body: payload })
    } else {
      await apiFetch(`/admin/layers/${editingId.value}`, { method: 'PATCH', body: payload })
    }
    closeEditor()
    await load()
  } catch (e: any) {
    formError.value = e?.data?.error?.message || 'No se pudo guardar'
  } finally {
    saving.value = false
  }
}

const remove = async (l: Layer) => {
  if (!confirm(`¿Eliminar la capa "${l.title}"?\n\nEl archivo subido se borrará del servidor.`)) return
  try {
    await apiFetch(`/admin/layers/${l.id}`, { method: 'DELETE' })
    items.value = items.value.filter((x) => x.id !== l.id)
  } catch (e: any) {
    error.value = e?.data?.error?.message || 'No se pudo eliminar'
  }
}

// ── Subida de archivo ──
const uploadingId = ref<number | null>(null)
const uploadInput = ref<HTMLInputElement | null>(null)
const uploadError = ref('')
const uploadProgress = ref(false)

const triggerUpload = (l: Layer) => {
  uploadingId.value = l.id
  uploadError.value = ''
  uploadInput.value?.click()
}

const onFileSelected = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || uploadingId.value === null) return
  uploadProgress.value = true
  uploadError.value = ''
  try {
    const fd = new FormData()
    fd.append('file', file)
    await apiFetch(`/admin/layers/${uploadingId.value}/upload`, { method: 'POST', body: fd })
    await load()
  } catch (err: any) {
    uploadError.value = err?.data?.error?.message || 'No se pudo subir el archivo'
  } finally {
    uploadProgress.value = false
    uploadingId.value = null
    if (uploadInput.value) uploadInput.value.value = ''
  }
}

const downloadUrl = (l: Layer) => {
  // Endpoint público que sirve el archivo o redirect a la URL externa.
  return `${baseURL}/observatory/${observatory}/layers/${l.id}/download`
}

const formatBytes = (n: number | null | undefined) => {
  if (!n) return '—'
  const num = Number(n)
  if (num >= 1024 ** 2) return `${(num / 1024 ** 2).toFixed(1)} MB`
  if (num >= 1024) return `${(num / 1024).toFixed(1)} KB`
  return `${num} B`
}

onMounted(load)
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 class="text-2xl font-semibold text-ink">Capas de datos</h2>
        <p class="mt-1 text-sm text-ink-muted">
          {{ items.length }} capas · gestiona metadata, archivos subidos y endpoints WMS.
        </p>
      </div>
      <div class="flex gap-2">
        <button class="btn-outline btn-sm" @click="load"><Icon name="lucide:refresh-cw" size="14" /> Refrescar</button>
        <button class="btn-primary btn-sm" @click="openCreate"><Icon name="lucide:plus" size="14" /> Nueva capa</button>
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
          <input v-model="search" type="search" class="input w-full" placeholder="Título, slug, descripción…" />
        </div>
        <div class="form-group">
          <label class="form-label">Proveedor</label>
          <select v-model="filterProvider" class="select w-full">
            <option value="all">Todos</option>
            <option v-for="(label, key) in PROVIDER_LABELS" :key="key" :value="key">{{ label }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Categoría</label>
          <select v-model="filterCategory" class="select w-full">
            <option value="all">Todas</option>
            <option v-for="(label, key) in CATEGORY_LABELS" :key="key" :value="key">{{ label }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Origen</label>
          <select v-model="filterKind" class="select w-full">
            <option value="all">Todos</option>
            <option value="external_url">URL externa</option>
            <option value="uploaded_file">Archivo subido</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Archivadas</label>
          <select v-model="filterArchived" class="select w-full">
            <option value="false">Activas</option>
            <option value="true">Sólo archivadas</option>
            <option value="all">Todas</option>
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
    <div v-else-if="uploadError" class="rounded-lg bg-red-50 p-4 text-sm text-red-700">{{ uploadError }}</div>

    <div v-else class="table-container">
      <table class="table-base">
        <thead>
          <tr>
            <th class="text-left">Capa</th>
            <th class="text-left">Proveedor</th>
            <th class="text-left">Origen</th>
            <th class="text-left">Formato</th>
            <th class="text-left">Archivo / WMS</th>
            <th class="text-center">Activa</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="l in filtered" :key="l.id" class="border-t border-gray-100 hover:bg-gray-50/50">
            <td class="py-3">
              <p class="font-medium text-ink">{{ l.title }}</p>
              <p class="text-xs text-ink-muted">
                <code class="rounded bg-gray-100 px-1">{{ l.slug }}</code>
                · {{ CATEGORY_LABELS[l.category] || l.category }}
              </p>
            </td>
            <td class="text-sm text-ink-muted">{{ l.providerLabel }}</td>
            <td>
              <span
                v-if="l.kind === 'uploaded_file'"
                class="rounded-full bg-eco/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-eco-dark"
              >Archivo</span>
              <span
                v-else
                class="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-muted"
              >URL externa</span>
            </td>
            <td class="text-xs text-ink-muted">{{ FORMAT_LABELS[l.format] || l.format }}</td>
            <td>
              <div v-if="l.kind === 'uploaded_file' && l.fileName" class="text-xs">
                <a :href="downloadUrl(l)" target="_blank" rel="noopener" class="font-mono text-primary hover:underline">
                  {{ l.fileName }}
                </a>
                <span class="ml-2 text-ink-muted">{{ formatBytes(l.fileSize) }}</span>
              </div>
              <div v-else-if="l.wmsUrl" class="text-xs text-ink-muted">
                <Icon name="lucide:server" size="11" class="inline" />
                <span class="font-mono">{{ l.wmsLayerName || '(sin layer)' }}</span>
              </div>
              <div v-else-if="l.sourceUrl" class="text-xs">
                <a :href="l.sourceUrl" target="_blank" rel="noopener" class="text-primary hover:underline">
                  Sólo catálogo →
                </a>
              </div>
              <span v-else class="text-xs text-ink-muted">—</span>
            </td>
            <td class="text-center">
              <span class="rounded-full px-2 py-1 text-xs font-semibold" :class="l.active ? 'bg-eco/10 text-eco-dark' : 'bg-gray-100 text-gray-500'">
                {{ l.active ? 'Sí' : 'No' }}
              </span>
            </td>
            <td>
              <div class="flex justify-end gap-1">
                <button
                  class="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-eco/10 hover:text-eco-dark"
                  title="Subir archivo (GeoJSON / Shapefile / GeoTIFF / KML / CSV)"
                  :disabled="uploadProgress"
                  @click="triggerUpload(l)"
                >
                  <Icon :name="uploadProgress && uploadingId === l.id ? 'lucide:loader-2' : 'lucide:upload'" size="16" :class="uploadProgress && uploadingId === l.id ? 'animate-spin-smooth' : ''" />
                </button>
                <button
                  class="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-primary-50 hover:text-primary"
                  title="Editar metadata"
                  @click="openEdit(l)"
                >
                  <Icon name="lucide:pencil" size="16" />
                </button>
                <button
                  class="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-red-50 hover:text-red-600"
                  title="Eliminar"
                  @click="remove(l)"
                >
                  <Icon name="lucide:trash-2" size="16" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!filtered.length">
            <td colspan="7" class="py-10 text-center text-sm text-ink-muted">
              No hay capas con esos filtros.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <input ref="uploadInput" type="file" class="hidden" accept=".geojson,.json,.kml,.kmz,.zip,.tif,.tiff,.csv" @change="onFileSelected" />

    <Transition name="fade">
      <div
        v-if="editingId !== null"
        class="fixed inset-0 z-[200] flex items-end justify-center overflow-y-auto bg-black/40 sm:items-center"
        @click.self="closeEditor"
      >
        <div class="my-8 w-full max-w-3xl rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
          <header class="mb-4 flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-ink">{{ editingId === 0 ? 'Nueva capa' : 'Editar capa' }}</h3>
              <p class="text-xs text-ink-muted">
                Para subir un archivo (GeoJSON / Shapefile / GeoTIFF / KML / CSV) primero crea la capa con
                origen "Archivo subido", luego usa el botón <Icon name="lucide:upload" size="11" class="inline" /> en la fila.
              </p>
            </div>
            <button class="rounded-lg p-2 text-gray-400 hover:bg-gray-100" @click="closeEditor">
              <Icon name="lucide:x" size="18" />
            </button>
          </header>

          <div class="space-y-5">
            <!-- ── Identidad ── -->
            <section>
              <h4 class="mb-2 text-xs font-bold uppercase tracking-wider text-primary">Identidad</h4>
              <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div class="form-group">
                  <label class="form-label">Slug *</label>
                  <input
                    v-model="form.slug"
                    type="text"
                    class="input w-full font-mono"
                    placeholder="noaa-crw-dhw-5km"
                    :disabled="editingId !== 0"
                  />
                  <p class="form-hint">Inmutable tras crear. a-z, 0-9, guiones.</p>
                </div>
                <div class="form-group">
                  <label class="form-label">Título *</label>
                  <input v-model="form.title" type="text" class="input w-full" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Descripción</label>
                <textarea v-model="form.description" rows="2" class="input w-full" />
              </div>
            </section>

            <!-- ── Origen + clasificación ── -->
            <section>
              <h4 class="mb-2 text-xs font-bold uppercase tracking-wider text-primary">Origen y clasificación</h4>
              <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div class="form-group">
                  <label class="form-label">Origen *</label>
                  <select v-model="form.kind" class="select w-full">
                    <option value="external_url">URL externa</option>
                    <option value="uploaded_file">Archivo subido</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Proveedor *</label>
                  <select v-model="form.provider" class="select w-full" @change="form.providerLabel = PROVIDER_LABELS[form.provider] || ''">
                    <option v-for="(label, key) in PROVIDER_LABELS" :key="key" :value="key">{{ label }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Etiqueta proveedor *</label>
                  <input v-model="form.providerLabel" type="text" class="input w-full" />
                </div>
                <div class="form-group">
                  <label class="form-label">Categoría *</label>
                  <select v-model="form.category" class="select w-full">
                    <option v-for="(label, key) in CATEGORY_LABELS" :key="key" :value="key">{{ label }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Formato *</label>
                  <select v-model="form.format" class="select w-full">
                    <option v-for="(label, key) in FORMAT_LABELS" :key="key" :value="key">{{ label }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Cobertura</label>
                  <select v-model="form.coverage" class="select w-full">
                    <option value="global">Global</option>
                    <option value="regional">Regional</option>
                    <option value="national">Nacional</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Resolución</label>
                  <input v-model="form.resolution" type="text" class="input w-full" placeholder="5 km, 10 m…" />
                </div>
                <div class="form-group">
                  <label class="form-label">Cadencia</label>
                  <input v-model="form.cadence" type="text" class="input w-full" placeholder="Diaria, 5 días…" />
                </div>
                <div class="form-group">
                  <label class="form-label">Última actualización</label>
                  <input v-model="form.lastUpdated" type="date" class="input w-full" />
                </div>
              </div>
            </section>

            <!-- ── Licencia ── -->
            <section>
              <h4 class="mb-2 text-xs font-bold uppercase tracking-wider text-primary">Licencia y atribución</h4>
              <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div class="form-group">
                  <label class="form-label">Licencia *</label>
                  <input v-model="form.license" type="text" class="input w-full" placeholder="CC BY 4.0, Public Domain…" />
                </div>
                <div class="form-group">
                  <label class="form-label">Atribución *</label>
                  <input v-model="form.attribution" type="text" class="input w-full" placeholder="© NOAA Coral Reef Watch" />
                </div>
              </div>
            </section>

            <!-- ── URLs ── -->
            <section>
              <h4 class="mb-2 text-xs font-bold uppercase tracking-wider text-primary">URLs externas</h4>
              <div class="grid grid-cols-1 gap-3">
                <div class="form-group">
                  <label class="form-label">Source URL (página del proveedor)</label>
                  <input v-model="form.sourceUrl" type="url" class="input w-full" />
                </div>
                <div class="form-group">
                  <label class="form-label">Download URL externa (si aplica)</label>
                  <input v-model="form.downloadUrl" type="url" class="input w-full" placeholder="Sólo si no subes archivo" />
                </div>
                <div class="form-group">
                  <label class="form-label">Preview URL</label>
                  <input v-model="form.previewUrl" type="url" class="input w-full" />
                </div>
              </div>
            </section>

            <!-- ── WMS / tile overlay ── -->
            <section>
              <h4 class="mb-2 text-xs font-bold uppercase tracking-wider text-primary">Render en mapa (WMS / tile)</h4>
              <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div class="form-group">
                  <label class="form-label">WMS URL</label>
                  <input v-model="form.wmsUrl" type="url" class="input w-full" placeholder="https://…/wms" />
                </div>
                <div class="form-group">
                  <label class="form-label">WMS layer name</label>
                  <input v-model="form.wmsLayerName" type="text" class="input w-full font-mono" />
                </div>
                <div class="form-group md:col-span-2">
                  <label class="form-label">Tile URL pattern (XYZ)</label>
                  <input v-model="form.tileUrlPattern" type="text" class="input w-full font-mono" placeholder="https://…/{z}/{x}/{y}.png" />
                </div>
                <div class="form-group">
                  <label class="form-label">Opacidad ({{ form.overlayOpacity.toFixed(2) }})</label>
                  <input v-model.number="form.overlayOpacity" type="range" min="0" max="1" step="0.05" class="w-full" />
                </div>
                <div class="form-group">
                  <label class="form-label">Orden</label>
                  <input v-model.number="form.sortOrder" type="number" class="input w-full" />
                </div>
              </div>
            </section>

            <!-- ── Visibilidad ── -->
            <div class="flex flex-wrap gap-4 border-t border-gray-100 pt-4">
              <label class="flex items-center gap-2 text-sm">
                <input v-model="form.active" type="checkbox" class="h-4 w-4 rounded" /> Activa por defecto
              </label>
              <label class="flex items-center gap-2 text-sm">
                <input v-model="form.visible" type="checkbox" class="h-4 w-4 rounded" /> Visible al público
              </label>
              <label class="flex items-center gap-2 text-sm">
                <input v-model="form.archived" type="checkbox" class="h-4 w-4 rounded" /> Archivada
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

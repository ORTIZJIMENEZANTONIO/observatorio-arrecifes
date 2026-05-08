<script setup lang="ts">
import type { CoastalIntrusion, CoastalIntrusionStatus, CoastalIntrusionRunResult, CoastalIntrusionNoveltyBatch, Reef } from '~/types'
import { GLOSSARY } from '~/data/admin-glossary'

definePageMeta({ layout: 'admin', middleware: 'admin', pageTransition: false })

const { apiFetch } = useApi()
const reefsStore = useReefsStore()

const items = ref<CoastalIntrusion[]>([])
const loading = ref(false)
const error = ref('')

const filterStatus = ref<CoastalIntrusionStatus | ''>('candidate')
const filterReefId = ref<number | ''>('')

const running = ref(false)
const runResult = ref<CoastalIntrusionRunResult | null>(null)
const runError = ref('')
const runReefId = ref<number | ''>('')

const onlyRecent = ref(false)             // filtro Fase 2: noveltyScore ≥ 60
const analyzingId = ref<number | null>(null)
const analyzingBatch = ref(false)
const noveltyBatchResult = ref<CoastalIntrusionNoveltyBatch | null>(null)
const noveltyError = ref('')

const dismissingId = ref<number | null>(null)
const dismissNotes = ref('')

const escalatingId = ref<number | null>(null)
const escalateForm = reactive({
  title: '',
  summary: '',
  intensity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
})

const reefName = (id: number | null): string => {
  if (!id) return '—'
  const r = reefsStore.publicReefs.find((x: Reef) => x.id === id)
  return r?.name || `#${id}`
}

const statusBadge = (s: CoastalIntrusionStatus): string => ({
  candidate: 'badge-accent',
  verified: 'badge-coral',
  escalated: 'badge-primary',
  dismissed: 'bg-gray-100 text-ink-muted',
}[s] || 'badge-secondary')

const statusLabel = (s: CoastalIntrusionStatus): string => ({
  candidate: 'Candidato',
  verified: 'Verificado',
  escalated: 'Escalado',
  dismissed: 'Descartado',
}[s] || s)

const formatArea = (m2: number | null | undefined): string => {
  if (m2 == null) return '—'
  const n = Number(m2)
  if (n >= 10000) return `${(n / 10000).toFixed(2)} ha`
  return `${n.toFixed(0)} m²`
}

const formatPct = (n: number | null | undefined): string =>
  n == null ? '—' : `${Number(n).toFixed(0)}%`

const noveltyClass = (score: number | null | undefined): string => {
  if (score == null) return 'bg-gray-100 text-ink-muted'
  const s = Number(score)
  if (s >= 70) return 'bg-alert/15 text-alert font-semibold'
  if (s >= 40) return 'bg-accent/15 text-accent font-semibold'
  return 'bg-eco/10 text-eco-dark'
}

const noveltyLabel = (score: number | null | undefined): string => {
  if (score == null) return 'sin analizar'
  const s = Number(score)
  if (s >= 70) return 'reciente'
  if (s >= 40) return 'parcial'
  return 'legacy'
}

const visibleItems = computed(() => {
  if (!onlyRecent.value) return items.value
  return items.value.filter((i) => i.noveltyScore != null && Number(i.noveltyScore) >= 60)
})

const { sorted, sortKey, sortDir, toggleSort } = useSortableList(visibleItems, { defaultKey: 'detectedAt', defaultDir: 'desc' })
const { paginated: paginatedIntrusions, currentPage, totalPages, perPage } = usePaginatedList(sorted, { perPage: 20 })

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    const params = new URLSearchParams()
    if (filterStatus.value) params.set('status', filterStatus.value)
    if (filterReefId.value) params.set('reefId', String(filterReefId.value))
    params.set('limit', '200')
    const res = await apiFetch<{ success: boolean; items: CoastalIntrusion[] }>(
      `/admin/coastal-intrusions?${params.toString()}`,
    )
    items.value = res.items || []
  } catch (e: any) {
    error.value = e?.data?.error?.message || 'No se pudieron cargar las detecciones'
    items.value = []
  } finally {
    loading.value = false
  }
}

// El detector tarda hasta 7 minutos en procesar 12 arrecifes (queries
// Overpass + buffer + intersect). Para evitar el 502 del proxy nginx (timeout
// 60s default) el backend lanza un job background y nosotros hacemos polling
// del progreso cada 3 segundos.
type DetectorJobState = {
  id: string
  status: 'running' | 'done' | 'error'
  reefId: number | null
  startedAt: string
  progress: { current: number; total: number }
  perReef: Array<{ reefId: number; reefName: string; buildingsScanned: number; candidates: number; inserted: number; updated: number; skipped: number; reason?: string }>
  result: CoastalIntrusionRunResult | null
  error: string | null
}

const runJob = ref<DetectorJobState | null>(null)
let pollHandle: ReturnType<typeof setInterval> | null = null

const stopPolling = () => {
  if (pollHandle) {
    clearInterval(pollHandle)
    pollHandle = null
  }
}

const pollJob = async (jobId: string) => {
  try {
    const res = await apiFetch<{ success: boolean; data: DetectorJobState }>(
      `/admin/coastal-intrusions/jobs/${jobId}`,
    )
    runJob.value = res.data
    if (res.data.status === 'done') {
      runResult.value = res.data.result
      stopPolling()
      running.value = false
      await load()
    } else if (res.data.status === 'error') {
      runError.value = res.data.error || 'Error al correr el detector'
      stopPolling()
      running.value = false
    }
  } catch (e: any) {
    runError.value = e?.data?.error?.message || 'Error al consultar el estado del job'
    stopPolling()
    running.value = false
  }
}

const runDetection = async () => {
  stopPolling()
  running.value = true
  runError.value = ''
  runResult.value = null
  runJob.value = null
  try {
    const url = runReefId.value
      ? `/admin/coastal-intrusions/run?reefId=${runReefId.value}`
      : '/admin/coastal-intrusions/run'
    const res = await apiFetch<{ success: boolean; data: { jobId: string; status: string } }>(
      url,
      { method: 'POST' },
    )
    const jobId = res.data?.jobId
    if (!jobId) throw new Error('Respuesta sin jobId')

    // Primer poll inmediato para tener una cota inferior del progress.
    await pollJob(jobId)
    if (running.value) {
      pollHandle = setInterval(() => { void pollJob(jobId) }, 3000)
    }
  } catch (e: any) {
    runError.value = e?.data?.error?.message || 'Error al iniciar el detector'
    running.value = false
  }
}

onBeforeUnmount(stopPolling)

const analyzeNovelty = async (id: number) => {
  analyzingId.value = id
  noveltyError.value = ''
  try {
    await apiFetch(`/admin/coastal-intrusions/${id}/analyze-novelty`, { method: 'POST' })
    await load()
  } catch (e: any) {
    noveltyError.value = e?.data?.error?.message || 'Error en el análisis NDBI'
  } finally {
    analyzingId.value = null
  }
}

const analyzeNoveltyBatch = async () => {
  analyzingBatch.value = true
  noveltyError.value = ''
  noveltyBatchResult.value = null
  try {
    const params = new URLSearchParams()
    if (filterReefId.value) params.set('reefId', String(filterReefId.value))
    params.set('status', 'candidate')
    params.set('limit', '30')
    const res = await apiFetch<{ success: boolean; data: CoastalIntrusionNoveltyBatch }>(
      `/admin/coastal-intrusions/analyze-novelty-batch?${params.toString()}`,
      { method: 'POST' },
    )
    noveltyBatchResult.value = res.data
    await load()
  } catch (e: any) {
    noveltyError.value = e?.data?.error?.message || 'Error en el análisis batch'
  } finally {
    analyzingBatch.value = false
  }
}

const verify = async (id: number) => {
  try {
    await apiFetch(`/admin/coastal-intrusions/${id}/verify`, {
      method: 'POST',
      body: { notes: '' },
    })
    await load()
  } catch (e: any) {
    alert(e?.data?.error?.message || 'Error al verificar')
  }
}

const startDismiss = (id: number) => {
  dismissingId.value = id
  dismissNotes.value = ''
}

const confirmDismiss = async () => {
  if (!dismissingId.value) return
  try {
    await apiFetch(`/admin/coastal-intrusions/${dismissingId.value}/dismiss`, {
      method: 'POST',
      body: { notes: dismissNotes.value || 'sin notas' },
    })
    await load()
  } catch (e: any) {
    alert(e?.data?.error?.message || 'Error al descartar')
  }
  dismissingId.value = null
}

const startEscalate = (item: CoastalIntrusion) => {
  escalatingId.value = item.id
  escalateForm.title = `Posible invasión a zona federal — ${reefName(item.reefId)}`
  escalateForm.summary = `Edificación detectada (${formatArea(item.areaM2)}, OSM ${item.osmId || 'sin id'}) dentro del buffer ZOFEMAT.`
  escalateForm.intensity = 'medium'
}

const confirmEscalate = async () => {
  if (!escalatingId.value) return
  try {
    await apiFetch(`/admin/coastal-intrusions/${escalatingId.value}/escalate`, {
      method: 'POST',
      body: { ...escalateForm },
    })
    await load()
  } catch (e: any) {
    alert(e?.data?.error?.message || 'Error al escalar a conflicto')
  }
  escalatingId.value = null
}

// ── Creación manual ──
const creatingManual = ref(false)
const manualForm = reactive({
  reefId: '' as number | '',
  mode: 'point' as 'point' | 'polygon',
  lat: 0,
  lng: 0,
  geometryJson: '',
  status: 'verified' as 'candidate' | 'verified',
  reviewerNotes: '',
})
const manualError = ref('')
const savingManual = ref(false)

const openManualCreate = () => {
  creatingManual.value = true
  manualError.value = ''
  manualForm.reefId = ''
  manualForm.mode = 'point'
  manualForm.lat = 0
  manualForm.lng = 0
  manualForm.geometryJson = ''
  manualForm.status = 'verified'
  manualForm.reviewerNotes = ''
}

const submitManual = async () => {
  manualError.value = ''
  if (!manualForm.reefId) {
    manualError.value = 'Selecciona el arrecife asociado'
    return
  }

  let geometry: any
  if (manualForm.mode === 'point') {
    const { lat, lng } = manualForm
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      manualError.value = 'Latitud y longitud deben ser números'
      return
    }
    geometry = { type: 'Point', coordinates: [Number(lng), Number(lat)] }
  } else {
    try {
      geometry = JSON.parse(manualForm.geometryJson)
    } catch {
      manualError.value = 'GeoJSON inválido'
      return
    }
    if (!geometry || !['Polygon', 'MultiPolygon'].includes(geometry.type)) {
      manualError.value = 'El GeoJSON debe ser Polygon o MultiPolygon'
      return
    }
  }

  savingManual.value = true
  try {
    await apiFetch('/admin/coastal-intrusions', {
      method: 'POST',
      body: {
        reefId: Number(manualForm.reefId),
        geometry,
        status: manualForm.status,
        reviewerNotes: manualForm.reviewerNotes.trim() || null,
      },
    })
    creatingManual.value = false
    await load()
  } catch (e: any) {
    manualError.value = e?.data?.error?.message || 'No se pudo crear la invasión manual'
  } finally {
    savingManual.value = false
  }
}

// ── Preview satelital ──
const previewing = ref<CoastalIntrusion | null>(null)
const openPreview = (item: CoastalIntrusion) => { previewing.value = item }
const closePreview = () => { previewing.value = null }

const previewLat = computed(() => previewing.value ? Number(previewing.value.centroidLat) : 0)
const previewLng = computed(() => previewing.value ? Number(previewing.value.centroidLng) : 0)

// Links a herramientas externas para inspección complementaria.
const googleMapsSatelliteUrl = (lat: number, lng: number, zoom = 19) =>
  `https://www.google.com/maps/@${lat},${lng},${zoom}z/data=!3m1!1e3`
const googleEarthUrl = (lat: number, lng: number) =>
  `https://earth.google.com/web/@${lat},${lng},0a,250d,35y,0h,45t,0r`
const sentinelHubUrl = (lat: number, lng: number) => {
  // Playground sin login con vista TRUE_COLOR — útil para comparar visualmente
  // sin tener que ejecutar el análisis NDBI.
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    zoom: '15',
    preset: '1_TRUE_COLOR',
    layers: 'B04,B03,B02',
    maxcc: '20',
    gain: '1.0',
    gamma: '1.0',
    time: `${new Date(Date.now() - 90 * 86_400_000).toISOString().slice(0, 10)}/${new Date().toISOString().slice(0, 10)}`,
    atmFilter: '',
    showDates: 'true',
  })
  return `https://www.sentinel-hub.com/explore/eobrowser/?${params.toString()}`
}

const removeIntrusion = async (item: CoastalIntrusion) => {
  if (!confirm(`¿Eliminar esta detección (${reefName(item.reefId)})?\n\nEs útil para limpiar manuales o descartados; los escalados deberían borrar primero el conflicto.`)) return
  try {
    await apiFetch(`/admin/coastal-intrusions/${item.id}`, { method: 'DELETE' })
    items.value = items.value.filter((x) => x.id !== item.id)
  } catch (e: any) {
    alert(e?.data?.error?.message || 'No se pudo eliminar')
  }
}

onMounted(load)
watch([filterStatus, filterReefId], load)

const statusCounts = computed(() => {
  const counts: Record<string, number> = { candidate: 0, verified: 0, escalated: 0, dismissed: 0 }
  for (const i of items.value) counts[i.status] = (counts[i.status] || 0) + 1
  return counts
})

const osmLink = (osmId: string | null): string =>
  osmId ? `https://www.openstreetmap.org/${osmId}` : '#'
</script>

<template>
  <div class="space-y-5">
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 class="text-2xl font-semibold text-ink">Detector de invasión costera</h2>
        <p class="mt-1 text-sm text-ink-muted">
          Construcciones detectadas dentro del buffer
          <AdminInfoTooltip :text="GLOSSARY.zofemat" variant="inline">ZOFEMAT</AdminInfoTooltip>
          (20 m desde la línea de costa
          <AdminInfoTooltip :text="GLOSSARY.osm" variant="inline">OSM</AdminInfoTooltip>).
          La detección es <em>candidata</em> hasta que un revisor humano confirme; no representa
          una determinación legal de invasión.
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <select v-model="runReefId" class="select !py-1.5 text-xs">
          <option :value="''">Todos los arrecifes</option>
          <option v-for="r in reefsStore.publicReefs" :key="r.id" :value="r.id">
            {{ r.name }}
          </option>
        </select>
        <AdminInfoTooltip
          text="Corre el pipeline completo: descarga la línea de costa OSM, calcula el buffer ZOFEMAT, busca edificios OSM y los inserta como candidatos."
          placement="bottom"
        >
          <button class="btn-coral btn-sm" :disabled="running" @click="runDetection">
            <Icon name="lucide:radar" size="16" :class="running ? 'animate-spin' : ''" />
            {{ running ? 'Detectando…' : 'Ejecutar detector' }}
          </button>
        </AdminInfoTooltip>
        <AdminInfoTooltip
          :text="GLOSSARY.ndbi + ' Pide a Google Earth Engine el NDBI baseline (hace 7 años) y actual (últimos 6 meses) para 30 candidatos sin score.'"
          placement="bottom"
        >
          <button class="btn-outline btn-sm" :disabled="analyzingBatch" @click="analyzeNoveltyBatch">
            <Icon name="lucide:sparkles" size="14" :class="analyzingBatch ? 'animate-spin' : ''" />
            {{ analyzingBatch ? 'Analizando…' : 'Analizar novedad (batch)' }}
          </button>
        </AdminInfoTooltip>
        <button class="btn-primary btn-sm" @click="openManualCreate">
          <Icon name="lucide:plus" size="14" />
          Nueva invasión
        </button>
      </div>
    </header>

    <!-- Resultado análisis de novedad batch -->
    <div v-if="noveltyError" class="rounded-2xl border border-alert/30 bg-alert/5 p-4 text-sm text-alert">
      {{ noveltyError }}
    </div>
    <div
      v-if="noveltyBatchResult"
      class="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs text-ink"
    >
      <p class="font-semibold text-primary">
        Análisis de novedad NDBI completado
      </p>
      <p class="mt-1 text-ink-muted">
        Procesados: <strong>{{ noveltyBatchResult.processed }}</strong> ·
        OK: <strong>{{ noveltyBatchResult.ok }}</strong> ·
        Fallidos: <strong>{{ noveltyBatchResult.failed }}</strong>
      </p>
    </div>

    <!-- Resultado de la última corrida -->
    <div v-if="runError" class="rounded-2xl border border-alert/30 bg-alert/5 p-4 text-sm text-alert">
      {{ runError }}
    </div>

    <!-- Job en progreso: progress bar + per-reef en vivo (polling cada 3s) -->
    <div
      v-if="runJob && runJob.status === 'running'"
      class="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs text-ink"
    >
      <div class="flex items-center justify-between gap-3">
        <p class="font-semibold text-primary">
          <Icon name="lucide:loader-2" size="14" class="mr-1 inline animate-spin" />
          Procesando arrecifes — {{ runJob.progress.current }} / {{ runJob.progress.total || '?' }}
        </p>
        <span class="text-ink-muted">
          Tarda hasta 7 min. Puedes cerrar este panel — el job sigue corriendo en el servidor.
        </span>
      </div>
      <div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-primary/10">
        <div
          class="h-full bg-primary transition-all duration-500"
          :style="{ width: runJob.progress.total > 0 ? `${(runJob.progress.current / runJob.progress.total) * 100}%` : '5%' }"
        />
      </div>
      <details v-if="runJob.perReef.length" class="mt-3">
        <summary class="cursor-pointer text-primary">Ver detalle por arrecife</summary>
        <ul class="mt-2 space-y-1">
          <li v-for="r in runJob.perReef" :key="r.reefId" class="text-[11px]">
            <Icon name="lucide:check" size="10" class="mr-1 inline text-eco-dark" />
            <strong>{{ r.reefName }}</strong> —
            <span v-if="r.reason" class="text-alert">{{ r.reason }}</span>
            <span v-else>{{ r.candidates }} candidatos / {{ r.buildingsScanned }} edificios</span>
          </li>
        </ul>
      </details>
    </div>

    <div v-if="runResult" class="rounded-2xl border border-eco/20 bg-eco/5 p-4 text-xs text-ink">
      <p class="font-semibold text-eco-dark">
        <Icon name="lucide:check-circle" size="14" class="mr-1 inline" />
        Detección completada · {{ runResult.reefsProcessed }} arrecife(s) procesado(s)
      </p>
      <p class="mt-1 text-ink-muted">
        Edificios analizados: <strong>{{ runResult.buildingsScanned }}</strong> ·
        Candidatos: <strong>{{ runResult.candidates }}</strong> ·
        Nuevos: <strong>{{ runResult.inserted }}</strong> ·
        Actualizados: <strong>{{ runResult.updated }}</strong>
      </p>
      <details class="mt-2">
        <summary class="cursor-pointer text-primary">Ver desglose por arrecife</summary>
        <ul class="mt-2 space-y-1">
          <li v-for="r in runResult.perReef" :key="r.reefId" class="text-[11px]">
            <strong>{{ r.reefName }}</strong> —
            <span v-if="r.reason">{{ r.reason }}</span>
            <span v-else>{{ r.candidates }} candidatos / {{ r.buildingsScanned }} edificios</span>
          </li>
        </ul>
      </details>
    </div>

    <!-- KPI por status -->
    <div class="grid gap-3 sm:grid-cols-4">
      <div class="card-flat px-4 py-3">
        <p class="text-[11px] uppercase tracking-wide text-ink-muted">Candidatos</p>
        <p class="text-2xl font-bold text-accent">{{ statusCounts.candidate || 0 }}</p>
      </div>
      <div class="card-flat px-4 py-3">
        <p class="text-[11px] uppercase tracking-wide text-ink-muted">Verificados</p>
        <p class="text-2xl font-bold text-coral">{{ statusCounts.verified || 0 }}</p>
      </div>
      <div class="card-flat px-4 py-3">
        <p class="text-[11px] uppercase tracking-wide text-ink-muted">Escalados</p>
        <p class="text-2xl font-bold text-primary">{{ statusCounts.escalated || 0 }}</p>
      </div>
      <div class="card-flat px-4 py-3">
        <p class="text-[11px] uppercase tracking-wide text-ink-muted">Descartados</p>
        <p class="text-2xl font-bold text-ink-muted">{{ statusCounts.dismissed || 0 }}</p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="card flex flex-wrap items-end gap-3 p-4">
      <div class="form-group !mb-0">
        <label class="form-label">Estado</label>
        <select v-model="filterStatus" class="select">
          <option value="">Todos</option>
          <option value="candidate">Candidatos</option>
          <option value="verified">Verificados</option>
          <option value="escalated">Escalados</option>
          <option value="dismissed">Descartados</option>
        </select>
      </div>
      <div class="form-group !mb-0">
        <label class="form-label">Arrecife</label>
        <select v-model="filterReefId" class="select">
          <option :value="''">Todos</option>
          <option v-for="r in reefsStore.publicReefs" :key="r.id" :value="r.id">
            {{ r.name }}
          </option>
        </select>
      </div>
      <label class="form-group !mb-0 flex cursor-pointer items-center gap-2 text-xs">
        <input v-model="onlyRecent" type="checkbox" class="checkbox" />
        Sólo recientes (
        <AdminInfoTooltip :text="GLOSSARY.ndbi" variant="inline">NDBI</AdminInfoTooltip>
        ≥ 60)
      </label>
      <p class="ml-auto text-xs text-ink-muted">{{ visibleItems.length }} / {{ items.length }} resultado(s)</p>
    </div>

    <!-- Tabla -->
    <p v-if="error" class="rounded-lg border border-alert/30 bg-alert/5 p-3 text-sm text-alert">{{ error }}</p>
    <p v-if="loading" class="text-sm text-ink-muted">Cargando…</p>

    <div v-else-if="visibleItems.length > 0" class="card overflow-hidden">
      <table class="table-base text-sm">
        <thead>
          <tr>
            <AdminSortableTh sort-key="reefId" :current-key="sortKey" :current-dir="sortDir" align="left" @sort="toggleSort('reefId')">Arrecife</AdminSortableTh>
            <AdminSortableTh sort-key="osmId" :current-key="sortKey" :current-dir="sortDir" align="left" @sort="toggleSort('osmId')">
              <AdminInfoTooltip :text="GLOSSARY.osm" variant="inline">OSM</AdminInfoTooltip>
            </AdminSortableTh>
            <AdminSortableTh sort-key="areaM2" :current-key="sortKey" :current-dir="sortDir" align="right" @sort="toggleSort('areaM2')">
              <AdminInfoTooltip text="Superficie del polígono detectado en m² (turf.area). Si es muy pequeña suele ser ruido OSM." variant="inline">
                Área
              </AdminInfoTooltip>
            </AdminSortableTh>
            <AdminSortableTh sort-key="zofematOverlapPct" :current-key="sortKey" :current-dir="sortDir" align="right" @sort="toggleSort('zofematOverlapPct')">
              <AdminInfoTooltip text="Porcentaje del footprint del edificio que cae dentro del buffer ZOFEMAT (20 m). 100% = el edificio entero está sobre zona federal." variant="inline">
                Solapamiento
              </AdminInfoTooltip>
            </AdminSortableTh>
            <AdminSortableTh sort-key="noveltyScore" :current-key="sortKey" :current-dir="sortDir" align="center" @sort="toggleSort('noveltyScore')">
              <AdminInfoTooltip :text="GLOSSARY.noveltyScore" variant="inline">Novedad</AdminInfoTooltip>
            </AdminSortableTh>
            <th class="text-left">Coords</th>
            <AdminSortableTh sort-key="status" :current-key="sortKey" :current-dir="sortDir" align="center" @sort="toggleSort('status')">Estado</AdminSortableTh>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in paginatedIntrusions" :key="i.id" class="border-t border-gray-100">
            <td class="py-2 font-medium text-ink">{{ reefName(i.reefId) }}</td>
            <td>
              <a
                v-if="i.osmId"
                :href="osmLink(i.osmId)"
                target="_blank"
                rel="noopener"
                class="text-primary underline tabular-nums text-xs"
              >
                {{ i.osmId }}
              </a>
              <span v-else class="text-ink-muted">—</span>
              <span v-if="i.osmTags?.building" class="ml-1 text-[10px] text-ink-muted">
                ({{ i.osmTags.building }})
              </span>
            </td>
            <td class="text-right tabular-nums">{{ formatArea(i.areaM2) }}</td>
            <td class="text-right tabular-nums">{{ formatPct(i.zofematOverlapPct) }}</td>
            <td class="text-center">
              <span
                class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] tabular-nums"
                :class="noveltyClass(i.noveltyScore)"
                :title="i.noveltyAnalyzedAt
                  ? `Δ NDBI = ${i.ndbiDelta} (baseline ${i.ndbiBaseline} → actual ${i.ndbiCurrent})\nEpochs: ${i.noveltyEpochs?.baseline} vs ${i.noveltyEpochs?.current}`
                  : 'No analizada todavía'"
              >
                {{ i.noveltyScore != null ? Number(i.noveltyScore).toFixed(0) : '—' }}
                <span class="text-[9px] opacity-70">{{ noveltyLabel(i.noveltyScore) }}</span>
              </span>
            </td>
            <td class="text-xs text-ink-muted tabular-nums">
              <a
                :href="`https://www.openstreetmap.org/?mlat=${i.centroidLat}&mlon=${i.centroidLng}&zoom=18`"
                target="_blank"
                rel="noopener"
                class="hover:text-primary"
              >
                {{ Number(i.centroidLat).toFixed(4) }}, {{ Number(i.centroidLng).toFixed(4) }}
              </a>
            </td>
            <td class="text-center">
              <span class="badge" :class="statusBadge(i.status)">{{ statusLabel(i.status) }}</span>
            </td>
            <td class="text-right">
              <button
                class="btn-ghost btn-sm"
                :title="i.noveltyAnalyzedAt ? 'Re-analizar novedad NDBI' : 'Analizar novedad NDBI'"
                :disabled="analyzingId === i.id"
                @click="analyzeNovelty(i.id)"
              >
                <Icon name="lucide:sparkles" size="16" :class="analyzingId === i.id ? 'animate-spin' : ''" />
              </button>
              <button class="btn-ghost btn-sm" title="Ver imagen satelital" @click="openPreview(i)">
                <Icon name="lucide:image" size="16" />
              </button>
              <template v-if="i.status === 'candidate'">
                <button class="btn-ghost btn-sm" title="Verificar" @click="verify(i.id)">
                  <Icon name="lucide:check" size="16" />
                </button>
                <button class="btn-ghost btn-sm" title="Escalar a conflicto" @click="startEscalate(i)">
                  <Icon name="lucide:arrow-up-right" size="16" />
                </button>
                <button class="btn-ghost btn-sm text-alert" title="Descartar" @click="startDismiss(i.id)">
                  <Icon name="lucide:x" size="16" />
                </button>
              </template>
              <template v-else-if="i.status === 'verified'">
                <button class="btn-ghost btn-sm" title="Escalar a conflicto" @click="startEscalate(i)">
                  <Icon name="lucide:arrow-up-right" size="16" />
                </button>
              </template>
              <NuxtLink
                v-if="i.status === 'escalated' && i.escalatedConflictId"
                :to="`/admin/conflicts?id=${i.escalatedConflictId}`"
                class="btn-ghost btn-sm"
                title="Ver conflicto"
              >
                <Icon name="lucide:external-link" size="16" />
              </NuxtLink>
              <button
                class="btn-ghost btn-sm text-alert"
                title="Eliminar detección"
                @click="removeIntrusion(i)"
              >
                <Icon name="lucide:trash-2" size="16" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <CommonPaginationControls
      v-if="visibleItems.length > 0"
      v-model:current-page="currentPage"
      :total-pages="totalPages"
      :total-items="visibleItems.length"
      :per-page="perPage"
    />
    <p v-if="!visibleItems.length && !loading" class="card p-6 text-center text-sm text-ink-muted">
      No hay detecciones que coincidan con los filtros. Ejecuta el detector para escanear los arrecifes.
    </p>

    <!-- Modal preview satelital -->
    <Teleport to="body">
      <div
        v-if="previewing"
        class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4"
        @click.self="closePreview"
      >
        <div class="card my-8 w-full max-w-3xl p-5">
          <header class="mb-3 flex items-start justify-between gap-3">
            <div>
              <h3 class="text-base font-semibold text-ink">
                Preview satelital — {{ reefName(previewing.reefId) }}
              </h3>
              <p class="text-xs text-ink-muted">
                Esri World Imagery sobre el footprint detectado. Usa los links de abajo para
                comparar contra Google Earth o el catálogo Sentinel-2 de los últimos 90 días.
              </p>
            </div>
            <button class="rounded-lg p-2 text-ink-muted hover:bg-gray-100" aria-label="Cerrar" @click="closePreview">
              <Icon name="lucide:x" size="18" />
            </button>
          </header>

          <ClientOnly>
            <AdminSatelliteThumb
              :lat="previewLat"
              :lng="previewLng"
              :geometry="previewing.geometry as any"
              :zoom="18"
              class="h-72 md:h-96"
            />
            <template #fallback>
              <div class="flex h-72 items-center justify-center rounded-lg bg-gray-100 text-xs text-ink-muted md:h-96">
                Cargando mapa…
              </div>
            </template>
          </ClientOnly>

          <div class="mt-3 grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
            <div class="rounded-lg border border-gray-100 p-3">
              <p class="font-semibold text-ink">Coordenadas</p>
              <p class="mt-1 font-mono tabular-nums text-ink-muted">
                {{ previewLat.toFixed(6) }}, {{ previewLng.toFixed(6) }}
              </p>
              <p class="mt-2 font-semibold text-ink">Área detectada</p>
              <p class="mt-1 font-mono tabular-nums text-ink-muted">{{ formatArea(previewing.areaM2) }}</p>
            </div>
            <div class="rounded-lg border border-gray-100 p-3">
              <p class="font-semibold text-ink">
                <AdminInfoTooltip :text="GLOSSARY.ndbi" variant="inline">NDBI</AdminInfoTooltip>
                /
                <AdminInfoTooltip :text="GLOSSARY.ndvi" variant="inline">NDVI</AdminInfoTooltip>
              </p>
              <p v-if="previewing.noveltyScore != null" class="mt-1 text-ink-muted">
                Score de novedad: <strong class="text-ink">{{ Number(previewing.noveltyScore).toFixed(0) }} / 100</strong>
                ({{ noveltyLabel(previewing.noveltyScore) }})
              </p>
              <p v-else class="mt-1 italic text-ink-muted">Sin analizar — usa el botón ✨ para correr GEE.</p>
            </div>
          </div>

          <div class="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
            <a
              :href="googleMapsSatelliteUrl(previewLat, previewLng)"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-outline btn-sm"
            >
              <Icon name="lucide:external-link" size="14" />
              Abrir en Google Maps satélite
            </a>
            <a
              :href="googleEarthUrl(previewLat, previewLng)"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-outline btn-sm"
            >
              <Icon name="lucide:globe" size="14" />
              Google Earth (3D)
            </a>
            <a
              :href="sentinelHubUrl(previewLat, previewLng)"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-outline btn-sm"
            >
              <Icon name="lucide:satellite" size="14" />
              Sentinel-2 EO Browser
            </a>
            <a
              v-if="previewing.osmId"
              :href="osmLink(previewing.osmId)"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-outline btn-sm"
            >
              <Icon name="lucide:map" size="14" />
              <AdminInfoTooltip :text="GLOSSARY.osm" variant="inline">OSM</AdminInfoTooltip>
              {{ previewing.osmId }}
            </a>
          </div>

          <p class="mt-3 text-[11px] text-ink-muted">
            Tip: Esri World Imagery puede tener 1–3 años de desfase en zonas costeras remotas.
            Si la construcción no aparece aquí pero sí en Google Maps, probablemente es reciente
            (lo que también detectaría el análisis NDBI).
          </p>
        </div>
      </div>
    </Teleport>

    <!-- Modal descarte -->
    <Teleport to="body">
      <div
        v-if="dismissingId"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        @click.self="dismissingId = null"
      >
        <div class="card w-full max-w-md p-5">
          <h3 class="mb-3 text-sm font-semibold text-ink">Descartar detección</h3>
          <p class="mb-2 text-xs text-ink-muted">
            ¿Por qué este edificio no es una invasión real? (estructura legal previa, falso positivo
            geométrico, infraestructura institucional…). Las notas quedan registradas para auditoría.
          </p>
          <textarea
            v-model="dismissNotes"
            class="input w-full"
            rows="3"
            placeholder="Motivo del descarte"
          />
          <div class="mt-4 flex justify-end gap-2">
            <button class="btn-outline" @click="dismissingId = null">Cancelar</button>
            <button class="btn-coral" @click="confirmDismiss">Descartar</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal de creación manual -->
    <Teleport to="body">
      <div
        v-if="creatingManual"
        class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4"
        @click.self="creatingManual = false"
      >
        <div class="card my-8 w-full max-w-lg p-5">
          <h3 class="mb-2 text-sm font-semibold text-ink">Nueva invasión costera (manual)</h3>
          <p class="mb-3 text-xs text-ink-muted">
            Úsalo cuando tengas una invasión documentada que el detector OSM no captura
            (típico: edificio sin mapear todavía). Punto = se guarda como buffer de 25 m.
            Polygon/MultiPolygon = se usa el polígono dibujado.
          </p>
          <div class="space-y-3">
            <div class="form-group !mb-0">
              <label class="form-label">Arrecife asociado *</label>
              <select v-model="manualForm.reefId" class="select w-full">
                <option :value="''">— Selecciona —</option>
                <option v-for="r in reefsStore.publicReefs" :key="r.id" :value="r.id">
                  {{ r.name }}
                </option>
              </select>
            </div>
            <div class="form-group !mb-0">
              <label class="form-label">Tipo de geometría</label>
              <div class="flex gap-2 text-xs">
                <button
                  type="button"
                  class="rounded-lg border px-3 py-1.5 font-medium transition-colors"
                  :class="manualForm.mode === 'point'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 bg-white text-ink-muted'"
                  @click="manualForm.mode = 'point'"
                >
                  Punto (lat/lng)
                </button>
                <button
                  type="button"
                  class="rounded-lg border px-3 py-1.5 font-medium transition-colors"
                  :class="manualForm.mode === 'polygon'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 bg-white text-ink-muted'"
                  @click="manualForm.mode = 'polygon'"
                >
                  Polígono GeoJSON
                </button>
              </div>
            </div>
            <div v-if="manualForm.mode === 'point'" class="grid grid-cols-2 gap-3">
              <div class="form-group !mb-0">
                <label class="form-label">Latitud</label>
                <input v-model.number="manualForm.lat" type="number" step="0.0000001" class="input w-full" placeholder="20.4234" />
              </div>
              <div class="form-group !mb-0">
                <label class="form-label">Longitud</label>
                <input v-model.number="manualForm.lng" type="number" step="0.0000001" class="input w-full" placeholder="-86.9123" />
              </div>
            </div>
            <div v-else class="form-group !mb-0">
              <label class="form-label">GeoJSON Polygon / MultiPolygon</label>
              <textarea
                v-model="manualForm.geometryJson"
                rows="6"
                class="input w-full font-mono text-[11px]"
                placeholder='{"type":"Polygon","coordinates":[[[lng1,lat1],[lng2,lat2],…,[lng1,lat1]]]}'
              />
              <p class="form-hint">
                Pégalo desde <a href="https://geojson.io" target="_blank" rel="noopener" class="text-primary hover:underline">geojson.io</a>
                u otra herramienta similar.
              </p>
            </div>
            <div class="form-group !mb-0">
              <label class="form-label">Estado inicial</label>
              <select v-model="manualForm.status" class="select w-full">
                <option value="verified">Verificado (admin la confirma)</option>
                <option value="candidate">Candidato (queda pendiente de revisión)</option>
              </select>
            </div>
            <div class="form-group !mb-0">
              <label class="form-label">Notas</label>
              <textarea
                v-model="manualForm.reviewerNotes"
                rows="3"
                class="input w-full"
                placeholder="Cómo se detectó, fuente, observaciones del revisor…"
              />
            </div>
            <div v-if="manualError" class="rounded-lg border border-alert/30 bg-alert/5 p-2 text-xs text-alert">
              {{ manualError }}
            </div>
          </div>
          <div class="mt-4 flex justify-end gap-2">
            <button class="btn-outline" :disabled="savingManual" @click="creatingManual = false">Cancelar</button>
            <button class="btn-primary" :disabled="savingManual" @click="submitManual">
              <Icon
                :name="savingManual ? 'lucide:loader-2' : 'lucide:plus'"
                size="14"
                :class="savingManual ? 'animate-spin-smooth' : ''"
              />
              Crear
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal escalar -->
    <Teleport to="body">
      <div
        v-if="escalatingId"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        @click.self="escalatingId = null"
      >
        <div class="card w-full max-w-lg p-5">
          <h3 class="mb-3 text-sm font-semibold text-ink">Escalar a conflicto socioambiental</h3>
          <p class="mb-3 text-xs text-ink-muted">
            Crea un caso en el Atlas (oculto por defecto) con la geometría del edificio. Después
            puedes completar la narrativa, drivers, resistance y publicarlo desde
            <code>/admin/conflicts</code>.
          </p>
          <div class="space-y-3">
            <div class="form-group !mb-0">
              <label class="form-label">Título</label>
              <input v-model="escalateForm.title" type="text" class="input" />
            </div>
            <div class="form-group !mb-0">
              <label class="form-label">Resumen</label>
              <textarea v-model="escalateForm.summary" class="input" rows="3" />
            </div>
            <div class="form-group !mb-0">
              <label class="form-label">Intensidad</label>
              <select v-model="escalateForm.intensity" class="select">
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </select>
            </div>
          </div>
          <div class="mt-4 flex justify-end gap-2">
            <button class="btn-outline" @click="escalatingId = null">Cancelar</button>
            <button class="btn-primary" @click="confirmEscalate">
              <Icon name="lucide:arrow-up-right" size="16" />
              Crear conflicto
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

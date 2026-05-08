<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin', pageTransition: false })

import type { BleachingAlert, BleachingAlertLevel, Reef } from '~/types'
import { GLOSSARY } from '~/data/admin-glossary'

interface AdminAlert extends BleachingAlert {
  id: number
}

const { apiFetch } = useApi()
const reefsStore = useReefsStore()

const items = ref<AdminAlert[]>([])
const loading = ref(true)
const error = ref('')

const filterReefId = ref<number | ''>('')
const filterLevel = ref<BleachingAlertLevel | ''>('')

const levelLabels: Record<BleachingAlertLevel, string> = {
  no_stress: 'Sin estrés',
  watch: 'Vigilancia',
  warning: 'Advertencia',
  alert_1: 'Alerta 1 (blanqueamiento)',
  alert_2: 'Alerta 2 (mortalidad)',
}

const levelBadge: Record<BleachingAlertLevel, string> = {
  no_stress: 'badge-eco',
  watch: 'bg-yellow-100 text-yellow-800',
  warning: 'badge-accent',
  alert_1: 'badge-coral',
  alert_2: 'badge-alert',
}

const levelOrder: BleachingAlertLevel[] = ['no_stress', 'watch', 'warning', 'alert_1', 'alert_2']

const reefName = (id: number | null | undefined): string => {
  if (id == null) return '—'
  const r = reefsStore.publicReefs.find((x: Reef) => x.id === id)
  return r?.name || `#${id}`
}

const formatDate = (d: string | Date | null | undefined): string => {
  if (!d) return '—'
  const dt = typeof d === 'string' ? new Date(d) : d
  return Number.isNaN(dt.getTime())
    ? '—'
    : dt.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    const params = new URLSearchParams()
    if (filterReefId.value) params.set('reefId', String(filterReefId.value))
    if (filterLevel.value) params.set('level', filterLevel.value)
    const res = await apiFetch<{ success: boolean; items: AdminAlert[] }>(
      `/admin/alerts/bleaching?${params.toString()}`,
    )
    items.value = (res.items || []).sort(
      (a, b) => new Date(b.observedAt).getTime() - new Date(a.observedAt).getTime(),
    )
  } catch (e: any) {
    error.value = e?.data?.error?.message || 'No se pudieron cargar las alertas'
  } finally {
    loading.value = false
  }
}

// KPIs por nivel sobre el dataset filtrado.
const counts = computed<Record<BleachingAlertLevel, number>>(() => {
  const c: Record<BleachingAlertLevel, number> = {
    no_stress: 0,
    watch: 0,
    warning: 0,
    alert_1: 0,
    alert_2: 0,
  }
  for (const a of items.value) c[a.level] = (c[a.level] || 0) + 1
  return c
})

// ── Modal de creación manual ──
const creating = ref(false)
const form = reactive({
  reefId: '' as number | '',
  level: 'watch' as BleachingAlertLevel,
  dhw: 0,
  sst: 0,
  sstAnomaly: 0,
  observedAt: new Date().toISOString().slice(0, 10),
  source: 'noaa_crw' as 'noaa_crw' | 'modis' | 'sentinel3',
  productUrl: '',
})
const saving = ref(false)
const formError = ref('')

const openCreate = () => {
  creating.value = true
  formError.value = ''
  form.reefId = ''
  form.level = 'watch'
  form.dhw = 0
  form.sst = 0
  form.sstAnomaly = 0
  form.observedAt = new Date().toISOString().slice(0, 10)
  form.source = 'noaa_crw'
  form.productUrl = ''
}

const submitCreate = async () => {
  if (!form.reefId) { formError.value = 'Selecciona el arrecife'; return }
  saving.value = true
  formError.value = ''
  try {
    await apiFetch('/admin/alerts/bleaching', {
      method: 'POST',
      body: {
        reefId: Number(form.reefId),
        level: form.level,
        dhw: Number(form.dhw),
        sst: Number(form.sst),
        sstAnomaly: Number(form.sstAnomaly),
        observedAt: form.observedAt,
        source: form.source,
        productUrl: form.productUrl.trim() || undefined,
      },
    })
    creating.value = false
    await load()
  } catch (e: any) {
    formError.value = e?.data?.error?.message || 'No se pudo crear la alerta'
  } finally {
    saving.value = false
  }
}

const remove = async (a: AdminAlert) => {
  if (!confirm(`¿Eliminar alerta de ${reefName(a.reefId)} (${formatDate(a.observedAt)})?`)) return
  try {
    await apiFetch(`/admin/alerts/bleaching/${a.id}`, { method: 'DELETE' })
    items.value = items.value.filter((x) => x.id !== a.id)
  } catch (e: any) {
    error.value = e?.data?.error?.message || 'No se pudo eliminar'
  }
}

onMounted(load)

const itemsAsList = computed(() => items.value)
const { sorted, sortKey, sortDir, toggleSort } = useSortableList(itemsAsList, { defaultKey: 'observedAt', defaultDir: 'desc' })
const { paginated: paginatedAlerts, currentPage, totalPages, perPage } = usePaginatedList(sorted, { perPage: 20 })
watch([filterReefId, filterLevel], load)
</script>

<template>
  <div class="space-y-5">
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 class="text-2xl font-semibold text-ink">
          <AdminInfoTooltip :text="GLOSSARY.bleachingAlert" variant="inline">
            Alertas de blanqueamiento
          </AdminInfoTooltip>
        </h2>
        <p class="mt-1 text-sm text-ink-muted">
          Snapshots
          <AdminInfoTooltip :text="GLOSSARY.noaaCrw" variant="inline">NOAA Coral Reef Watch</AdminInfoTooltip>
          (<AdminInfoTooltip :text="GLOSSARY.dhw" variant="inline">DHW</AdminInfoTooltip>
          + <AdminInfoTooltip :text="GLOSSARY.sst" variant="inline">SST</AdminInfoTooltip>
          + <AdminInfoTooltip :text="GLOSSARY.sstAnomaly" variant="inline">anomalía</AdminInfoTooltip>).
          Crear una alerta sincroniza el estado del arrecife según el nivel.
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button class="btn-outline btn-sm" @click="load">
          <Icon name="lucide:refresh-cw" size="14" /> Refrescar
        </button>
        <button class="btn-primary btn-sm" @click="openCreate">
          <Icon name="lucide:plus" size="14" /> Nueva alerta
        </button>
      </div>
    </header>

    <!-- KPIs por nivel -->
    <div class="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
      <div v-for="lvl in levelOrder" :key="lvl" class="card-flat p-3">
        <p class="text-[10px] uppercase tracking-wide text-ink-muted">{{ levelLabels[lvl] }}</p>
        <p class="mt-1 text-xl font-bold text-ink">{{ counts[lvl] }}</p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="card p-4">
      <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div class="form-group !mb-0">
          <label class="form-label">Arrecife</label>
          <select v-model="filterReefId" class="select w-full">
            <option :value="''">Todos</option>
            <option v-for="r in reefsStore.publicReefs" :key="r.id" :value="r.id">{{ r.name }}</option>
          </select>
        </div>
        <div class="form-group !mb-0">
          <label class="form-label">Nivel</label>
          <select v-model="filterLevel" class="select w-full">
            <option value="">Todos</option>
            <option v-for="lvl in levelOrder" :key="lvl" :value="lvl">{{ levelLabels[lvl] }}</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-sm text-ink-muted">Cargando…</div>
    <div v-else-if="error" class="rounded-lg bg-red-50 p-4 text-sm text-red-700">{{ error }}</div>

    <div v-else-if="!items.length" class="card p-8 text-center text-sm text-ink-muted">
      Sin alertas con los filtros actuales. Crea una manualmente o espera al próximo poll de NOAA CRW.
    </div>

    <div v-else class="table-container">
      <table class="table-base">
        <thead>
          <tr>
            <AdminSortableTh sort-key="reefId" :current-key="sortKey" :current-dir="sortDir" align="left" @sort="toggleSort('reefId')">Arrecife</AdminSortableTh>
            <AdminSortableTh sort-key="level" :current-key="sortKey" :current-dir="sortDir" align="left" @sort="toggleSort('level')">Nivel</AdminSortableTh>
            <AdminSortableTh sort-key="dhw" :current-key="sortKey" :current-dir="sortDir" align="right" @sort="toggleSort('dhw')">
              <AdminInfoTooltip :text="GLOSSARY.dhw" variant="inline">DHW</AdminInfoTooltip>
            </AdminSortableTh>
            <AdminSortableTh sort-key="sst" :current-key="sortKey" :current-dir="sortDir" align="right" @sort="toggleSort('sst')">
              <AdminInfoTooltip :text="GLOSSARY.sst" variant="inline">SST (°C)</AdminInfoTooltip>
            </AdminSortableTh>
            <AdminSortableTh sort-key="sstAnomaly" :current-key="sortKey" :current-dir="sortDir" align="right" @sort="toggleSort('sstAnomaly')">
              <AdminInfoTooltip :text="GLOSSARY.sstAnomaly" variant="inline">Anomalía</AdminInfoTooltip>
            </AdminSortableTh>
            <AdminSortableTh sort-key="observedAt" :current-key="sortKey" :current-dir="sortDir" align="right" @sort="toggleSort('observedAt')">Observado</AdminSortableTh>
            <AdminSortableTh sort-key="source" :current-key="sortKey" :current-dir="sortDir" align="left" @sort="toggleSort('source')">Fuente</AdminSortableTh>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in paginatedAlerts" :key="a.id" class="border-t border-gray-100 hover:bg-gray-50/50">
            <td class="py-3 font-medium text-ink">{{ reefName(a.reefId) }}</td>
            <td><span :class="levelBadge[a.level]">{{ levelLabels[a.level] }}</span></td>
            <td class="text-right font-mono text-sm text-ink">{{ Number(a.dhw).toFixed(1) }}</td>
            <td class="text-right font-mono text-sm text-ink">{{ Number(a.sst).toFixed(2) }}</td>
            <td class="text-right font-mono text-sm" :class="Number(a.sstAnomaly) > 1 ? 'text-coral-dark' : 'text-ink'">
              +{{ Number(a.sstAnomaly).toFixed(2) }}
            </td>
            <td class="text-right text-xs text-ink-muted">{{ formatDate(a.observedAt) }}</td>
            <td class="text-xs text-ink-muted">{{ a.source }}</td>
            <td>
              <div class="flex justify-end gap-1">
                <a
                  v-if="a.productUrl"
                  :href="a.productUrl"
                  target="_blank"
                  rel="noopener"
                  class="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-primary-50 hover:text-primary"
                  title="Ver producto NOAA"
                >
                  <Icon name="lucide:external-link" size="16" />
                </a>
                <button
                  class="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-red-50 hover:text-red-600"
                  title="Eliminar"
                  @click="remove(a)"
                >
                  <Icon name="lucide:trash-2" size="16" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <CommonPaginationControls
      v-if="items.length > 0"
      v-model:current-page="currentPage"
      :total-pages="totalPages"
      :total-items="items.length"
      :per-page="perPage"
    />

    <Teleport to="body">
      <div
        v-if="creating"
        class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4"
        @click.self="creating = false"
      >
        <div class="card my-8 w-full max-w-lg p-5">
          <h3 class="mb-2 text-sm font-semibold text-ink">Nueva alerta de blanqueamiento</h3>
          <p class="mb-3 text-xs text-ink-muted">
            Captura manual cuando NOAA tarda en publicar o tienes datos verificados de campo.
            Crear actualiza el estatus del arrecife según el nivel.
          </p>
          <div class="space-y-3">
            <div class="form-group !mb-0">
              <label class="form-label">Arrecife *</label>
              <select v-model="form.reefId" class="select w-full">
                <option :value="''">— Selecciona —</option>
                <option v-for="r in reefsStore.publicReefs" :key="r.id" :value="r.id">{{ r.name }}</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="form-group !mb-0">
                <label class="form-label">Nivel</label>
                <select v-model="form.level" class="select w-full">
                  <option v-for="lvl in levelOrder" :key="lvl" :value="lvl">{{ levelLabels[lvl] }}</option>
                </select>
              </div>
              <div class="form-group !mb-0">
                <label class="form-label">Fuente</label>
                <select v-model="form.source" class="select w-full">
                  <option value="noaa_crw">NOAA CRW</option>
                  <option value="modis">NASA MODIS</option>
                  <option value="sentinel3">ESA Sentinel-3</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-3">
              <div class="form-group !mb-0">
                <label class="form-label">
                  <AdminInfoTooltip :text="GLOSSARY.dhw" variant="inline">DHW</AdminInfoTooltip>
                </label>
                <input v-model.number="form.dhw" type="number" step="0.1" min="0" class="input w-full" />
              </div>
              <div class="form-group !mb-0">
                <label class="form-label">
                  <AdminInfoTooltip :text="GLOSSARY.sst" variant="inline">SST (°C)</AdminInfoTooltip>
                </label>
                <input v-model.number="form.sst" type="number" step="0.01" class="input w-full" />
              </div>
              <div class="form-group !mb-0">
                <label class="form-label">
                  <AdminInfoTooltip :text="GLOSSARY.sstAnomaly" variant="inline">Anomalía (°C)</AdminInfoTooltip>
                </label>
                <input v-model.number="form.sstAnomaly" type="number" step="0.01" class="input w-full" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="form-group !mb-0">
                <label class="form-label">Fecha de observación</label>
                <input v-model="form.observedAt" type="date" class="input w-full" />
              </div>
              <div class="form-group !mb-0">
                <label class="form-label">URL de producto (opcional)</label>
                <input v-model="form.productUrl" type="url" class="input w-full" placeholder="https://coralreefwatch.noaa.gov/…" />
              </div>
            </div>
            <div v-if="formError" class="rounded-lg border border-alert/30 bg-alert/5 p-2 text-xs text-alert">
              {{ formError }}
            </div>
          </div>
          <div class="mt-4 flex justify-end gap-2">
            <button class="btn-outline" :disabled="saving" @click="creating = false">Cancelar</button>
            <button class="btn-primary" :disabled="saving" @click="submitCreate">
              <Icon
                :name="saving ? 'lucide:loader-2' : 'lucide:plus'"
                size="14"
                :class="saving ? 'animate-spin-smooth' : ''"
              />
              Crear alerta
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

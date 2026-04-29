<script setup lang="ts">
import type { Observation, ObservationStatus } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'admin', pageTransition: false })

const route = useRoute()
const { apiFetch } = useApi()
const items = ref<Observation[]>([])
const loading = ref(true)
const error = ref('')
const filterStatus = ref<ObservationStatus | 'all'>(((route.query.status as any) || 'pending'))
const filterType = ref<string>('all')

const reviewing = ref<Observation | null>(null)
const reviewForm = ref({ status: 'validated' as ObservationStatus, qualityScore: 80, reviewerNotes: '' })

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  in_review: 'En revisión',
  validated: 'Validado',
  rejected: 'Rechazado',
  needs_more_info: 'Falta info',
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
    const params = new URLSearchParams({ limit: '100' })
    if (filterStatus.value !== 'all') params.set('status', filterStatus.value)
    if (filterType.value !== 'all') params.set('type', filterType.value)
    const res = await apiFetch<{ success: boolean; items: Observation[] }>(`/admin/observations?${params}`)
    items.value = res.items
  } catch (e: any) {
    error.value = e?.data?.error?.message || 'No se pudieron cargar las observaciones'
  } finally {
    loading.value = false
  }
}

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

watch([filterStatus, filterType], load)
onMounted(load)
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 class="text-2xl font-semibold text-ink">Cola de revisión</h2>
        <p class="mt-1 text-sm text-ink-muted">Aportes ciudadanos pendientes de validar.</p>
      </div>
      <button class="btn-outline" @click="load">
        <Icon name="lucide:refresh-cw" size="14" />
        Refrescar
      </button>
    </div>

    <div class="card p-4">
      <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div class="form-group">
          <label class="form-label">Estado</label>
          <select v-model="filterStatus" class="select w-full">
            <option value="all">Todos</option>
            <option value="pending">Pendiente</option>
            <option value="in_review">En revisión</option>
            <option value="validated">Validado</option>
            <option value="rejected">Rechazado</option>
            <option value="needs_more_info">Falta info</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Tipo</label>
          <select v-model="filterType" class="select w-full">
            <option value="all">Todos</option>
            <option v-for="(label, key) in typeLabels" :key="key" :value="key">{{ label }}</option>
          </select>
        </div>
        <div class="form-group flex items-end">
          <span class="text-sm text-ink-muted">{{ items.length }} aportes</span>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-sm text-ink-muted">Cargando…</div>
    <div v-else-if="error" class="rounded-lg bg-red-50 p-4 text-sm text-red-700">{{ error }}</div>

    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <article v-for="o in items" :key="o.id" class="card p-4">
        <div class="mb-2 flex items-center justify-between gap-2">
          <span class="badge-secondary">{{ typeLabels[o.type] || o.type }}</span>
          <span class="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">{{ statusLabels[o.status] }}</span>
        </div>
        <h3 class="text-base font-semibold text-ink">{{ o.title }}</h3>
        <p class="mt-1 line-clamp-3 text-sm text-ink-muted">{{ o.description }}</p>
        <div class="mt-3 flex flex-wrap gap-2 text-[11px] text-ink-muted">
          <span>📍 {{ Number(o.lat).toFixed(2) }}, {{ Number(o.lng).toFixed(2) }}</span>
          <span v-if="o.reefId">🏝 reef #{{ o.reefId }}</span>
          <span>👤 #{{ o.contributorId }}</span>
        </div>
        <div class="mt-3 flex gap-2">
          <button class="btn-primary btn-sm flex-1" @click="openReview(o)">
            <Icon name="lucide:check" size="14" />
            Revisar
          </button>
        </div>
      </article>
    </div>

    <Transition name="fade">
      <div v-if="reviewing" class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
        <div class="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
          <header class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-ink">Revisar aporte</h3>
            <button class="rounded-lg p-2 text-gray-400 hover:bg-gray-100" @click="reviewing = null" aria-label="Cerrar">
              <Icon name="lucide:x" size="18" />
            </button>
          </header>
          <p class="mb-3 text-sm text-ink-muted">{{ reviewing.title }}</p>
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
              <label class="form-label">Calidad técnica (0-100)</label>
              <input v-model.number="reviewForm.qualityScore" type="number" min="0" max="100" class="input w-full" />
            </div>
            <div class="form-group">
              <label class="form-label">Notas del revisor</label>
              <textarea v-model="reviewForm.reviewerNotes" rows="3" class="input w-full" placeholder="Comentarios para el autor o registro interno…" />
            </div>
          </div>
          <div class="mt-5 flex justify-end gap-2">
            <button class="btn-ghost" @click="reviewing = null">Cancelar</button>
            <button class="btn-primary" @click="submitReview">Confirmar</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

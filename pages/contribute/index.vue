<template>
  <div>
    <CommonHeroSection compact>
      <div class="max-w-3xl">
        <span class="badge-coral mb-3 bg-white/15 text-white">{{ hero?.eyebrow }}</span>
        <h1 class="font-display text-3xl font-extrabold text-white md:text-5xl">{{ hero?.title }}</h1>
        <p class="mt-3 text-base text-white/80 md:text-lg">{{ hero?.subtitle }}</p>
      </div>
    </CommonHeroSection>

    <section class="section-padding-sm">
      <div class="container-wide grid gap-8 lg:grid-cols-[2fr_1fr]">
        <!-- Form -->
        <div class="panel">
          <div class="mb-5 flex items-center gap-3 border-b border-gray-100 pb-4">
            <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-coral/10 text-coral-dark">
              <Icon name="lucide:upload" size="20" />
            </span>
            <div>
              <h2 class="text-xl font-bold text-ink">Nueva observación</h2>
              <p class="text-xs text-ink-muted">Todos los campos marcados con <span class="text-alert">*</span> son obligatorios.</p>
            </div>
          </div>

          <form class="space-y-5" @submit.prevent="submit">
            <div class="form-group">
              <label class="form-label">Tipo de aporte <span class="text-alert">*</span></label>
              <select v-model="form.type" required class="select">
                <option value="">Selecciona…</option>
                <option value="underwater_photo">Foto submarina</option>
                <option value="drone_flight">Vuelo de dron</option>
                <option value="satellite_image">Imagen satelital</option>
                <option value="transect_survey">Transecto</option>
                <option value="water_sample">Muestra de agua</option>
                <option value="community_report">Reporte comunitario</option>
                <option value="socioenvironmental_conflict">Conflicto socioambiental</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Título <span class="text-alert">*</span></label>
              <input v-model="form.title" type="text" required class="input" placeholder="Ej. Blanqueamiento en Cozumel — abril 2026" />
            </div>

            <div class="form-group">
              <label class="form-label">Descripción <span class="text-alert">*</span></label>
              <textarea v-model="form.description" required rows="4" class="input" placeholder="Qué observaste, condiciones, metodología..." />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Latitud <span class="text-alert">*</span></label>
                <input v-model.number="form.lat" type="number" step="0.0001" required class="input" placeholder="20.39" />
              </div>
              <div class="form-group">
                <label class="form-label">Longitud <span class="text-alert">*</span></label>
                <input v-model.number="form.lng" type="number" step="0.0001" required class="input" placeholder="-86.97" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Fecha de captura <span class="text-alert">*</span></label>
                <input v-model="form.capturedAt" type="date" required class="input" />
              </div>
              <div class="form-group">
                <label class="form-label">Arrecife (opcional)</label>
                <select v-model="reefSelection" class="select">
                  <option value="none">— Ninguno —</option>
                  <option v-for="r in reefsStore.publicReefs" :key="r.id" :value="String(r.id)">{{ r.name }}</option>
                  <option value="other">Otro — no está en la lista</option>
                </select>
              </div>
            </div>

            <div v-if="reefSelection === 'other'" class="form-group rounded-xl border border-primary/20 bg-primary-50/40 p-4">
              <label class="form-label">
                Nombre del sitio o arrecife <span class="text-alert">*</span>
              </label>
              <input
                v-model="customReefName"
                type="text"
                required
                class="input"
                placeholder="Ej. Bajo Pepito, Cabezas de Cuajiniquilapa, Punta Soliman..."
              />
              <p class="form-hint">
                Si el sitio aún no está catalogado, escríbelo como lo conoces localmente. El equipo
                de revisión podrá crearlo en el inventario al validar tu aporte.
              </p>
            </div>

            <div class="form-group">
              <label class="form-label">Etiquetas (separadas por coma)</label>
              <input v-model="tagInput" type="text" class="input" placeholder="SCTLD, blanqueamiento, sargazo…" />
            </div>

            <div class="form-group">
              <label class="form-label">Adjuntos</label>
              <div class="rounded-xl border-2 border-dashed border-gray-200 bg-surface-cool p-6 text-center">
                <Icon name="lucide:image-up" size="32" class="mx-auto text-primary/60" />
                <p class="mt-2 text-sm text-ink-muted">Arrastra imágenes/videos o haz clic para seleccionar</p>
                <p class="mt-1 text-[11px] text-ink-muted">JPG, PNG, MP4, GeoTIFF · máx. 200 MB por archivo</p>
                <input type="file" multiple class="mt-3 text-xs" />
              </div>
            </div>

            <div class="rounded-xl border border-eco/20 bg-eco/5 p-4 text-sm">
              <p class="flex items-start gap-2 text-ink-light">
                <Icon name="lucide:badge-check" size="16" class="mt-0.5 shrink-0 text-eco-dark" />
                {{ notice?.body }}
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <button type="submit" class="btn-coral btn-lg">
                <Icon name="lucide:send" size="16" />
                Enviar para revisión
              </button>
              <button type="button" class="btn-outline" @click="resetForm()">
                <Icon name="lucide:rotate-ccw" size="14" />
                Limpiar
              </button>
              <p v-if="submitted" class="ml-auto inline-flex items-center gap-2 text-sm font-semibold text-eco-dark">
                <Icon name="lucide:check-circle-2" size="16" />
                Aporte enviado · ID #{{ submitted }}
              </p>
            </div>
          </form>
        </div>

        <!-- Sidebar — guidance -->
        <aside class="space-y-4">
          <div v-for="(card, idx) in sidebarCards" :key="idx" class="card p-5">
            <h3 class="text-sm font-bold text-ink">{{ card.title }}</h3>
            <p class="mt-2 whitespace-pre-line text-xs leading-relaxed text-slate-custom">{{ card.body }}</p>
          </div>
        </aside>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useReefsStore } from '~/stores/reefs'
import { useObservationsStore } from '~/stores/observations'
import type { ObservationType } from '~/types'

const reefsStore = useReefsStore()
const obsStore = useObservationsStore()

const cms = useCmsContent('contribute')
const hero = cms.one<{ eyebrow: string; title: string; subtitle: string }>('hero')
const sidebarCards = cms.list<{ title: string; body: string }>('sidebar')
const notice = cms.one<{ body: string }>('notice')

const form = reactive({
  type: '' as ObservationType | '',
  title: '',
  description: '',
  lat: undefined as number | undefined,
  lng: undefined as number | undefined,
  capturedAt: '',
})
// El select usa string para distinguir 'none' / 'other' / id-numérico, y se
// resuelve a `reefId` + `customReefName` en el submit.
const reefSelection = ref<'none' | 'other' | string>('none')
const customReefName = ref('')
const tagInput = ref('')
const submitted = ref<number | null>(null)

const tags = computed(() =>
  tagInput.value
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean),
)

const submit = () => {
  if (!form.type || !form.title || !form.description || form.lat == null || form.lng == null || !form.capturedAt) return
  if (reefSelection.value === 'other' && !customReefName.value.trim()) return
  const reefId =
    reefSelection.value === 'none' || reefSelection.value === 'other'
      ? undefined
      : Number(reefSelection.value)
  const customName =
    reefSelection.value === 'other' ? customReefName.value.trim() : undefined
  const id = obsStore.submit({
    type: form.type as ObservationType,
    title: form.title,
    description: form.description,
    lat: form.lat,
    lng: form.lng,
    capturedAt: form.capturedAt,
    reefId,
    customReefName: customName,
    contributorId: 0, // anonymous until logged in
    attachments: [],
    tags: tags.value,
  })
  submitted.value = id
  resetForm(false)
}

const resetForm = (clearStatus = true) => {
  form.type = ''
  form.title = ''
  form.description = ''
  form.lat = undefined
  form.lng = undefined
  form.capturedAt = ''
  reefSelection.value = 'none'
  customReefName.value = ''
  tagInput.value = ''
  if (clearStatus) submitted.value = null
}
</script>

<template>
  <div>
    <CommonHeroSection compact>
      <div class="max-w-3xl">
        <span class="badge-coral mb-3 bg-white/15 text-white">Contribuir</span>
        <h1 class="font-display text-3xl font-extrabold text-white md:text-5xl">Aporta a la plataforma</h1>
        <p class="mt-3 text-base text-white/80 md:text-lg">
          Comparte fotos submarinas, vuelos de dron, transectos, muestras o reportes de
          problemáticas costeras. Un equipo revisa cada aporte; al validarse construyes tu reputación.
        </p>
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
                <select v-model="form.reefId" class="select">
                  <option :value="undefined">— Ninguno —</option>
                  <option v-for="r in reefsStore.publicReefs" :key="r.id" :value="r.id">{{ r.name }}</option>
                </select>
              </div>
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
                Tu aporte entrará en <strong>cola de revisión</strong>. Un revisor del equipo verifica metadatos,
                ubicación y calidad. Cuando se valida, tu reputación sube y el aporte aparece público con tu crédito.
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <button type="submit" class="btn-coral btn-lg">
                <Icon name="lucide:send" size="16" />
                Enviar para revisión
              </button>
              <button type="button" class="btn-outline" @click="resetForm">
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
          <div class="card p-5">
            <h3 class="text-sm font-bold text-ink">¿Por qué validamos?</h3>
            <p class="mt-2 text-xs leading-relaxed text-slate-custom">
              Los datos que afectan políticas públicas y comunidades costeras requieren rigor.
              La validación protege a la red y a quienes consultan los datos.
            </p>
          </div>
          <div class="card p-5">
            <h3 class="text-sm font-bold text-ink">Buenas prácticas</h3>
            <ul class="mt-2 space-y-1.5 text-xs text-slate-custom">
              <li class="flex gap-2"><Icon name="lucide:dot" size="14" class="shrink-0 text-coral" />Incluye metadata de cámara/dron (EXIF).</li>
              <li class="flex gap-2"><Icon name="lucide:dot" size="14" class="shrink-0 text-coral" />Documenta la metodología (transecto, profundidad).</li>
              <li class="flex gap-2"><Icon name="lucide:dot" size="14" class="shrink-0 text-coral" />Evita imágenes con localización precisa de fauna sensible.</li>
              <li class="flex gap-2"><Icon name="lucide:dot" size="14" class="shrink-0 text-coral" />Cita la fuente si es de un satélite (NASA, ESA, etc.).</li>
            </ul>
          </div>
          <div class="card p-5">
            <h3 class="text-sm font-bold text-ink">Privacidad</h3>
            <p class="mt-2 text-xs leading-relaxed text-slate-custom">
              Para reportes de conflictos puedes solicitar anonimato. Tu aporte se publica
              con la indicación "Anónimo verificado".
            </p>
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

const form = reactive({
  type: '' as ObservationType | '',
  title: '',
  description: '',
  lat: undefined as number | undefined,
  lng: undefined as number | undefined,
  capturedAt: '',
  reefId: undefined as number | undefined,
})
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
  const id = obsStore.submit({
    type: form.type as ObservationType,
    title: form.title,
    description: form.description,
    lat: form.lat,
    lng: form.lng,
    capturedAt: form.capturedAt,
    reefId: form.reefId,
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
  form.reefId = undefined
  tagInput.value = ''
  if (clearStatus) submitted.value = null
}
</script>

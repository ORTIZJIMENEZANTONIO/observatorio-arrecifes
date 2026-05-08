<script setup lang="ts">
import { GLOSSARY } from '~/data/admin-glossary'

definePageMeta({ layout: 'admin', middleware: 'admin', pageTransition: false })

interface Tier {
  id: number
  slug: string
  label: string
  description: string | null
  minScore: number
  maxScore: number | null
  color: string
  requirements: string | null
  icon: string | null
  sortOrder: number
  visible: boolean
  archived: boolean
  // Modo de participación (visible en /contributors)
  modeTitle: string | null
  audience: string | null
  contributions: string[] | null
  bridge: string | null
}

const { apiFetch } = useApi()
const items = ref<Tier[]>([])
const loading = ref(true)
const error = ref('')

const tierBadgeClass: Record<string, string> = {
  bronze: 'tier-bronze',
  silver: 'tier-silver',
  gold: 'tier-gold',
  platinum: 'tier-platinum',
  coral: 'tier-coral',
}

const load = async () => {
  loading.value = true
  try {
    const res = await apiFetch<{ success: boolean; items: Tier[] }>('/admin/tiers')
    items.value = res.items.sort((a, b) => a.sortOrder - b.sortOrder || a.minScore - b.minScore)
  } catch (e: any) {
    error.value = e?.data?.error?.message || 'No se pudieron cargar las escalas'
  } finally {
    loading.value = false
  }
}

// ── Editor ──
type TierForm = {
  slug: string
  label: string
  description: string
  minScore: number
  maxScore: number | null
  color: string
  requirements: string
  icon: string
  sortOrder: number
  visible: boolean
  archived: boolean
  // Modo de participación
  modeTitle: string
  audience: string
  contributionsText: string  // textarea (una línea por contribución)
  bridge: string
}

const blankForm = (): TierForm => ({
  slug: '',
  label: '',
  description: '',
  minScore: 0,
  maxScore: null,
  color: 'slate',
  requirements: '',
  icon: 'lucide:medal',
  sortOrder: items.value.length + 1,
  visible: true,
  archived: false,
  modeTitle: '',
  audience: '',
  contributionsText: '',
  bridge: '',
})

const editingId = ref<number | null>(null)
const form = ref<TierForm>(blankForm())
const saving = ref(false)
const formError = ref('')

// Convierte un título legible en slug estable: ASCII fold, lowercase, guiones.
//   "Curiosidad ciudadana" → "curiosidad-ciudadana"
//   "Conocimiento del mar" → "conocimiento-del-mar"
const slugify = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')     // quita acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')        // todo lo no-alfanumérico → guion
    .replace(/^-+|-+$/g, '')            // trim guiones a los extremos

// Cuando creamos una escala nueva, el slug se deriva del título del modo
// (o del label como respaldo) hasta que el usuario lo edite manualmente.
const slugManuallyEdited = ref(false)
watch(
  () => [form.value.modeTitle, form.value.label] as const,
  ([modeTitle, label]) => {
    if (editingId.value !== 0 || slugManuallyEdited.value) return
    const source = modeTitle.trim() || label.trim()
    form.value.slug = source ? slugify(source) : ''
  },
)
const onSlugInput = () => { slugManuallyEdited.value = true }

const openCreate = () => {
  editingId.value = 0
  form.value = blankForm()
  slugManuallyEdited.value = false
  formError.value = ''
}

const openEdit = (t: Tier) => {
  editingId.value = t.id
  slugManuallyEdited.value = true   // editando: nunca pisar el slug existente
  formError.value = ''
  form.value = {
    slug: t.slug,
    label: t.label,
    description: t.description || '',
    minScore: t.minScore,
    maxScore: t.maxScore,
    color: t.color,
    requirements: t.requirements || '',
    icon: t.icon || 'lucide:medal',
    sortOrder: t.sortOrder,
    visible: t.visible,
    archived: t.archived,
    modeTitle: t.modeTitle || '',
    audience: t.audience || '',
    contributionsText: (t.contributions || []).join('\n'),
    bridge: t.bridge || '',
  }
}

const closeEditor = () => { editingId.value = null }

const save = async () => {
  if (editingId.value === null) return
  if (!form.value.slug.trim()) { formError.value = 'Slug requerido'; return }
  if (!/^[a-z0-9-]+$/.test(form.value.slug)) { formError.value = 'Slug sólo a-z, 0-9, -'; return }
  if (!form.value.label.trim()) { formError.value = 'Etiqueta requerida'; return }
  saving.value = true
  formError.value = ''
  const f = form.value
  // Convierte el textarea de contribuciones (una por línea) en string[].
  const contributions = f.contributionsText
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
  const payload: any = {
    slug: f.slug.trim().toLowerCase(),
    label: f.label.trim(),
    description: f.description.trim() || null,
    minScore: Number(f.minScore) || 0,
    maxScore: f.maxScore === null || f.maxScore === undefined || f.maxScore === ('' as any) ? null : Number(f.maxScore),
    color: f.color || 'slate',
    requirements: f.requirements.trim() || null,
    icon: f.icon.trim() || null,
    sortOrder: Number(f.sortOrder) || 0,
    visible: f.visible,
    archived: f.archived,
    modeTitle: f.modeTitle.trim() || null,
    audience: f.audience.trim() || null,
    contributions: contributions.length > 0 ? contributions : null,
    bridge: f.bridge.trim() || null,
  }
  try {
    if (editingId.value === 0) {
      await apiFetch('/admin/tiers', { method: 'POST', body: payload })
    } else {
      await apiFetch(`/admin/tiers/${editingId.value}`, { method: 'PATCH', body: payload })
    }
    closeEditor()
    await load()
  } catch (e: any) {
    formError.value = e?.data?.error?.message || 'No se pudo guardar'
  } finally {
    saving.value = false
  }
}

const remove = async (t: Tier) => {
  if (!confirm(`¿Eliminar la escala "${t.label}"?\n\nNo podrá eliminarse si hay colaboradores usándola — archívala en su lugar.`)) return
  try {
    await apiFetch(`/admin/tiers/${t.id}`, { method: 'DELETE' })
    items.value = items.value.filter((x) => x.id !== t.id)
  } catch (e: any) {
    error.value = e?.data?.error?.message || 'No se pudo eliminar'
  }
}

const toggleVisibility = async (t: Tier) => {
  const next = !t.visible
  try {
    await apiFetch(`/admin/tiers/${t.id}`, { method: 'PATCH', body: { visible: next } })
    t.visible = next
  } catch (e: any) {
    error.value = e?.data?.error?.message || 'No se pudo actualizar'
  }
}

const formatRange = (t: Tier) => {
  const min = Number(t.minScore || 0)
  if (t.maxScore === null || t.maxScore === undefined) return `${min}+ pts`
  return `${min}–${t.maxScore} pts`
}

const colorOptions = [
  { value: 'amber', label: 'Ámbar (bronce)' },
  { value: 'slate', label: 'Acero (plata)' },
  { value: 'yellow', label: 'Oro' },
  { value: 'cyan', label: 'Cian (platino)' },
  { value: 'coral', label: 'Coral' },
  { value: 'eco', label: 'Eco (verde)' },
  { value: 'primary', label: 'Primary (teal)' },
]

onMounted(load)

const itemsAsList = computed(() => items.value)
const { sorted: sortedTiers, sortKey, sortDir, toggleSort } = useSortableList(itemsAsList, { defaultKey: 'sortOrder' })
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 class="text-2xl font-semibold text-ink">Escalas de la red</h2>
        <p class="mt-1 text-sm text-ink-muted">
          {{ items.length }} escala{{ items.length === 1 ? '' : 's' }} ·
          Definen los rangos de reputación (Bronce → Coral) y los umbrales de puntos.
        </p>
      </div>
      <div class="flex gap-2">
        <button class="btn-outline btn-sm" @click="load"><Icon name="lucide:refresh-cw" size="14" /> Refrescar</button>
        <button class="btn-primary btn-sm" @click="openCreate"><Icon name="lucide:plus" size="14" /> Nueva escala</button>
      </div>
    </div>

    <div class="rounded-lg bg-primary-50/40 p-3 text-xs text-ink-muted">
      <Icon name="lucide:info" size="12" class="inline align-text-top text-primary" />
      El slug
      (<code class="rounded bg-white px-1 py-0.5">bronze</code>,
      <code class="rounded bg-white px-1 py-0.5">silver</code>,
      <code class="rounded bg-white px-1 py-0.5">gold</code>...) es la clave estable que `Contributor.tier`
      referencia. Cambiarlo en una escala existente puede dejar a colaboradores huérfanos —
      prefiere editar etiqueta, descripción o umbrales.
    </div>

    <div v-if="loading" class="text-sm text-ink-muted">Cargando…</div>
    <div v-else-if="error" class="rounded-lg bg-red-50 p-4 text-sm text-red-700">{{ error }}</div>

    <div v-else class="table-container">
      <table class="table-base">
        <thead>
          <tr>
            <AdminSortableTh sort-key="sortOrder" :current-key="sortKey" :current-dir="sortDir" align="left" @sort="toggleSort('sortOrder')">Orden</AdminSortableTh>
            <AdminSortableTh sort-key="label" :current-key="sortKey" :current-dir="sortDir" align="left" @sort="toggleSort('label')">Escala</AdminSortableTh>
            <AdminSortableTh sort-key="slug" :current-key="sortKey" :current-dir="sortDir" align="left" @sort="toggleSort('slug')">
              <AdminInfoTooltip :text="GLOSSARY.slug" variant="inline">Slug</AdminInfoTooltip>
            </AdminSortableTh>
            <AdminSortableTh sort-key="minScore" :current-key="sortKey" :current-dir="sortDir" align="left" @sort="toggleSort('minScore')">Rango</AdminSortableTh>
            <AdminSortableTh sort-key="color" :current-key="sortKey" :current-dir="sortDir" align="left" @sort="toggleSort('color')">Color</AdminSortableTh>
            <AdminSortableTh sort-key="visible" :current-key="sortKey" :current-dir="sortDir" align="center" @sort="toggleSort('visible')">Visible</AdminSortableTh>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in sortedTiers" :key="t.id" class="border-t border-gray-100 hover:bg-gray-50/50">
            <td class="font-mono text-sm text-ink-muted">{{ t.sortOrder }}</td>
            <td>
              <div class="flex items-center gap-2">
                <span :class="tierBadgeClass[t.slug] || 'badge-secondary'">
                  <Icon v-if="t.icon" :name="t.icon" size="12" class="mr-1 -ml-0.5" />
                  {{ t.label }}
                </span>
                <span v-if="t.modeTitle" class="text-xs font-semibold text-primary">
                  · {{ t.modeTitle }}
                </span>
              </div>
              <p v-if="t.description" class="mt-1 text-xs text-ink-muted">{{ t.description }}</p>
              <p v-if="t.contributions && t.contributions.length" class="mt-1 text-[11px] text-ink-muted">
                <Icon name="lucide:list" size="11" class="mr-1 inline" />
                {{ t.contributions.length }} aporte(s) típico(s) · {{ t.audience ? 'audiencia OK' : 'sin audiencia' }}
              </p>
            </td>
            <td>
              <code class="rounded bg-gray-100 px-1.5 py-0.5 text-xs">{{ t.slug }}</code>
            </td>
            <td class="font-mono text-sm text-ink">{{ formatRange(t) }}</td>
            <td class="text-xs text-ink-muted">{{ t.color }}</td>
            <td class="text-center">
              <button
                class="rounded-full px-2 py-1 text-xs font-semibold"
                :class="t.visible ? 'bg-eco/10 text-eco-dark' : 'bg-gray-100 text-gray-500'"
                @click="toggleVisibility(t)"
              >
                {{ t.visible ? 'Sí' : 'No' }}
              </button>
            </td>
            <td>
              <div class="flex justify-end gap-1">
                <button
                  class="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-primary-50 hover:text-primary"
                  title="Editar"
                  @click="openEdit(t)"
                >
                  <Icon name="lucide:pencil" size="16" />
                </button>
                <button
                  class="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-red-50 hover:text-red-600"
                  title="Eliminar"
                  @click="remove(t)"
                >
                  <Icon name="lucide:trash-2" size="16" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!items.length">
            <td colspan="7" class="py-10 text-center text-sm text-ink-muted">
              Aún no hay escalas. Corre <code>npm run seed</code> en cercu-backend o crea una nueva.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Transition name="fade">
      <div
        v-if="editingId !== null"
        class="fixed inset-0 z-[200] flex items-end justify-center overflow-y-auto bg-black/40 sm:items-center"
        @click.self="closeEditor"
      >
        <div class="my-8 w-full max-w-2xl rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
          <header class="mb-4 flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-ink">{{ editingId === 0 ? 'Nueva escala' : 'Editar escala' }}</h3>
              <p class="text-xs text-ink-muted">El slug es la clave estable referenciada por `Contributor.tier`.</p>
            </div>
            <button class="rounded-lg p-2 text-gray-400 hover:bg-gray-100" @click="closeEditor">
              <Icon name="lucide:x" size="18" />
            </button>
          </header>

          <div class="space-y-4">
            <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div class="form-group">
                <label class="form-label">Etiqueta visible *</label>
                <input v-model="form.label" type="text" class="input w-full" placeholder="Bronce, Plata, Oro…" />
                <p class="form-hint">Etiqueta corta del rango (palette).</p>
              </div>
              <div class="form-group">
                <label class="form-label">
                  <AdminInfoTooltip :text="GLOSSARY.slug" variant="inline">Slug *</AdminInfoTooltip>
                </label>
                <input
                  v-model="form.slug"
                  type="text"
                  class="input w-full font-mono"
                  placeholder="se autogenera desde el título…"
                  :disabled="editingId !== 0"
                  @input="onSlugInput"
                />
                <p class="form-hint">
                  <template v-if="editingId === 0">
                    Se autogenera desde el <strong>título del modo</strong> (o de la etiqueta si está vacío).
                    Edítalo si quieres una clave distinta. Sólo a-z, 0-9, guiones.
                  </template>
                  <template v-else>
                    Inmutable tras crear — referenciado por <code>Contributor.tier</code>.
                  </template>
                </p>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Descripción</label>
              <textarea v-model="form.description" rows="2" class="input w-full" placeholder="Hasta 199 puntos…" />
            </div>

            <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div class="form-group">
                <label class="form-label">Puntos mínimos *</label>
                <input v-model.number="form.minScore" type="number" min="0" class="input w-full" />
              </div>
              <div class="form-group">
                <label class="form-label">Puntos máximos</label>
                <input
                  :value="form.maxScore ?? ''"
                  type="number"
                  min="0"
                  class="input w-full"
                  placeholder="(en blanco para top tier)"
                  @input="(e: Event) => form.maxScore = (e.target as HTMLInputElement).value === '' ? null : Number((e.target as HTMLInputElement).value)"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Orden</label>
                <input v-model.number="form.sortOrder" type="number" min="0" class="input w-full" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Requisitos visibles</label>
              <textarea v-model="form.requirements" rows="2" class="input w-full" placeholder="60+ aportes, calidad ≥75%, 3+ meses activo." />
            </div>

            <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div class="form-group">
                <label class="form-label">Color</label>
                <select v-model="form.color" class="select w-full">
                  <option v-for="c in colorOptions" :key="c.value" :value="c.value">{{ c.label }}</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Icono (lucide)</label>
                <input v-model="form.icon" type="text" class="input w-full font-mono" placeholder="lucide:medal" />
              </div>
            </div>

            <!-- ── Modo de participación (visible en /contributors) ── -->
            <div class="rounded-xl border border-primary/15 bg-primary/5 p-4">
              <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">
                <AdminInfoTooltip :text="GLOSSARY.tier" variant="inline">
                  Modo de participación
                </AdminInfoTooltip>
              </p>
              <p class="mb-3 text-[11px] text-ink-muted">
                Cómo se presenta esta escala en la sección "5 maneras de cuidar el mismo arrecife" de
                <code>/contributors</code>. No es un nivel a alcanzar — es una manera distinta de aportar.
                Si dejas estos campos vacíos, se usa el label/description como respaldo.
              </p>

              <div class="form-group">
                <label class="form-label">
                  <AdminInfoTooltip :text="GLOSSARY.modeTitle" variant="inline">
                    Título del modo
                  </AdminInfoTooltip>
                </label>
                <input
                  v-model="form.modeTitle"
                  type="text"
                  class="input w-full"
                  placeholder="Curiosidad ciudadana, Conocimiento del mar, Trabajo en agua…"
                />
              </div>

              <div class="form-group mt-3">
                <label class="form-label">
                  <AdminInfoTooltip :text="GLOSSARY.audience" variant="inline">
                    Quién aporta así
                  </AdminInfoTooltip>
                </label>
                <textarea
                  v-model="form.audience"
                  rows="2"
                  class="input w-full"
                  placeholder="Pescadoras, buzos, comunidades costeras. Saber empírico construido sobre años de presencia en el agua."
                />
              </div>

              <div class="form-group mt-3">
                <label class="form-label">Aportes típicos (uno por línea)</label>
                <textarea
                  v-model="form.contributionsText"
                  rows="4"
                  class="input w-full font-mono text-xs"
                  placeholder="Patrones locales: mareas, especies, blanqueamiento estacional&#10;Histórico oral de eventos en su zona&#10;Verificación en campo de capas satelitales"
                />
                <p class="form-hint">Sugerencia: 3–5 aportes concretos. Una línea = un item.</p>
              </div>

              <div class="form-group mt-3">
                <label class="form-label">Conecta con (puente al resto de la red)</label>
                <textarea
                  v-model="form.bridge"
                  rows="2"
                  class="input w-full"
                  placeholder="Da contexto territorial a los datos satelitales. Sin este modo, los números flotan."
                />
              </div>
            </div>

            <div class="flex gap-4 border-t border-gray-100 pt-4">
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

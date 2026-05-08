<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin', pageTransition: false })

import {
  cmsDefaults,
  cmsPageCatalog,
  cmsFieldLabels,
  cmsLongTextFields,
  cmsAccentOptions,
  type CmsItem,
} from '~/data/cms-defaults'
import { GLOSSARY } from '~/data/admin-glossary'

const route = useRoute()
const router = useRouter()
const { apiFetch } = useApi()
const pageSlug = String(route.params.pageSlug)
const meta = cmsPageCatalog.find((p) => p.slug === pageSlug)

if (!meta) {
  throw createError({ statusCode: 404, statusMessage: 'Página no encontrada' })
}

// Estado local — separado del store para poder editar sin afectar al sitio
// público hasta que se guarde. Cargamos desde el endpoint admin (más reciente).
const sections = reactive<Record<string, CmsItem[]>>({})
const loading = ref(true)
const error = ref('')

const expandedSection = ref<string>(meta.sections[0]?.key ?? '')
const saving = ref<string | null>(null)
const lastSaved = ref<string | null>(null)
const dirty = reactive<Record<string, boolean>>({})

// Inicialización: arrancamos con los defaults para poder pintar antes del fetch.
const seedFromDefaults = () => {
  const defaults = cmsDefaults[pageSlug] ?? {}
  for (const s of meta!.sections) {
    sections[s.key] = JSON.parse(JSON.stringify(defaults[s.key] ?? [])) as CmsItem[]
  }
}

const load = async () => {
  loading.value = true
  error.value = ''
  seedFromDefaults()
  try {
    const res = await apiFetch<{ success: boolean; sections: Record<string, CmsItem[]> }>(
      `/admin/cms/${pageSlug}`,
    )
    const remote = res?.sections ?? {}
    for (const s of meta!.sections) {
      const items = remote[s.key]
      if (Array.isArray(items) && items.length > 0) {
        sections[s.key] = JSON.parse(JSON.stringify(items)) as CmsItem[]
      }
    }
  } catch (e: any) {
    // Si el endpoint admin falla (sin permiso o backend offline) seguimos con
    // defaults pero alertamos.
    error.value = e?.data?.error?.message || 'No se pudo cargar el contenido remoto. Mostrando defaults.'
  } finally {
    loading.value = false
  }
}

onMounted(load)

// Calcula el shape de un item basado en el primer item del default — eso
// determina los campos que renderiza el editor. Si la sección no tiene
// default, intentamos inferirlo del primer item actual.
const fieldShape = (sectionKey: string): string[] => {
  const defaults = cmsDefaults[pageSlug]?.[sectionKey] ?? []
  const sample = defaults[0] ?? sections[sectionKey]?.[0]
  return sample ? Object.keys(sample) : []
}

// Ítem en blanco a partir del shape — todos los campos string vacíos.
const blankItem = (sectionKey: string): CmsItem => {
  const shape = fieldShape(sectionKey)
  const o: CmsItem = {}
  for (const k of shape) o[k] = ''
  return o
}

// Estado del editor por ítem (para evitar re-render rebuild).
const startEdit = (sectionKey: string, idx: number) => {
  void sectionKey; void idx
  // No-op: editamos in-place con v-model.
}

const isLong = (field: string) => cmsLongTextFields.has(field)
const isAccent = (field: string) => field === 'accent'
const isUrl = (field: string) => /^(href|to|primaryTo|secondaryTo|linkTo)$/i.test(field)

const labelFor = (field: string) => cmsFieldLabels[field] ?? field

const markDirty = (sectionKey: string) => { dirty[sectionKey] = true }

const addItem = (sectionKey: string) => {
  sections[sectionKey] = [...sections[sectionKey], blankItem(sectionKey)]
  markDirty(sectionKey)
}

const removeItem = (sectionKey: string, idx: number) => {
  if (!confirm('¿Eliminar este bloque?')) return
  sections[sectionKey] = sections[sectionKey].filter((_, i) => i !== idx)
  markDirty(sectionKey)
}

const moveItem = (sectionKey: string, idx: number, dir: -1 | 1) => {
  const items = [...sections[sectionKey]]
  const j = idx + dir
  if (j < 0 || j >= items.length) return
  ;[items[idx], items[j]] = [items[j], items[idx]]
  sections[sectionKey] = items
  markDirty(sectionKey)
}

const resetSection = (sectionKey: string) => {
  if (!confirm('¿Restaurar esta sección a los textos por defecto?')) return
  const defaults = cmsDefaults[pageSlug]?.[sectionKey] ?? []
  sections[sectionKey] = JSON.parse(JSON.stringify(defaults)) as CmsItem[]
  markDirty(sectionKey)
}

const saveSection = async (sectionKey: string) => {
  saving.value = sectionKey
  lastSaved.value = null
  try {
    await apiFetch(`/admin/cms/${pageSlug}/${sectionKey}`, {
      method: 'PUT',
      body: { items: sections[sectionKey] },
    })
    dirty[sectionKey] = false
    lastSaved.value = sectionKey
    setTimeout(() => {
      if (lastSaved.value === sectionKey) lastSaved.value = null
    }, 2200)
    // Invalida la cache pública para que la página pública refetchee.
    useCmsStore().invalidatePage(pageSlug)
  } catch (e: any) {
    alert(e?.data?.error?.message || 'No se pudo guardar la sección')
  } finally {
    saving.value = null
  }
}

const itemSummary = (item: CmsItem): string => {
  const candidates = [
    'title',
    'titleLine1',
    'heading',
    'eyebrow',
    'label',
    'description',
    'body',
  ]
  for (const k of candidates) {
    const v = item[k]
    if (typeof v === 'string' && v.trim()) return v.trim().slice(0, 80)
  }
  return JSON.stringify(item).slice(0, 80)
}
</script>

<template>
  <div class="space-y-5">
    <div>
      <button
        type="button"
        class="mb-2 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-primary"
        @click="router.push('/admin/contenido')"
      >
        <Icon name="lucide:chevron-left" size="14" />
        Contenido
      </button>
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 class="text-2xl font-semibold text-ink">{{ meta!.title }}</h2>
          <p class="mt-1 text-sm text-ink-muted">{{ meta!.description }}</p>
        </div>
        <div class="flex gap-2">
          <NuxtLink :to="meta!.preview" target="_blank" class="btn-outline btn-sm">
            <Icon name="lucide:external-link" size="14" />
            Ver página pública
          </NuxtLink>
          <button class="btn-outline btn-sm" @click="load">
            <Icon name="lucide:refresh-cw" size="14" />
            Refrescar
          </button>
        </div>
      </div>
    </div>

    <div v-if="error" class="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
      <Icon name="lucide:alert-triangle" size="14" class="mr-1 inline" />
      {{ error }}
    </div>

    <div v-if="loading" class="text-sm text-ink-muted">Cargando…</div>

    <div v-else class="space-y-3">
      <div
        v-for="section in meta!.sections"
        :key="section.key"
        class="rounded-2xl border border-gray-200 bg-white"
      >
        <button
          type="button"
          class="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-gray-50"
          @click="expandedSection = expandedSection === section.key ? '' : section.key"
        >
          <div>
            <h3 class="text-sm font-semibold text-ink">
              {{ section.label }}
              <AdminInfoTooltip :text="GLOSSARY.sectionKey">
                <code class="ml-1 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-normal text-ink-muted">
                  {{ section.key }}
                </code>
              </AdminInfoTooltip>
            </h3>
            <p class="text-xs text-ink-muted">
              {{ sections[section.key]?.length ?? 0 }}
              <AdminInfoTooltip :text="GLOSSARY.cmsItem" variant="inline">
                {{ (sections[section.key]?.length ?? 0) === 1 ? 'bloque' : 'bloques' }}
              </AdminInfoTooltip>
              <span v-if="section.help" class="ml-2 italic">· {{ section.help }}</span>
            </p>
          </div>
          <div class="flex items-center gap-2">
            <span v-if="dirty[section.key]" class="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
              Sin guardar
            </span>
            <span v-else-if="lastSaved === section.key" class="flex items-center gap-1 text-xs text-eco-dark">
              <Icon name="lucide:check" size="12" />
              Guardado
            </span>
            <Icon
              name="lucide:chevron-down"
              size="18"
              class="text-ink-muted transition-transform"
              :class="{ 'rotate-180': expandedSection === section.key }"
            />
          </div>
        </button>

        <div v-show="expandedSection === section.key" class="border-t border-gray-100">
          <div
            v-for="(item, idx) in sections[section.key]"
            :key="idx"
            class="border-b border-gray-50 last:border-0"
          >
            <div class="flex items-center gap-3 px-5 pt-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gray-100 text-xs font-semibold text-ink-muted">
                {{ idx + 1 }}
              </span>
              <p class="min-w-0 flex-1 truncate text-sm font-medium text-ink">{{ itemSummary(item) }}</p>
              <div class="flex shrink-0 items-center gap-1">
                <button
                  class="rounded p-1.5 text-ink-muted disabled:opacity-30 hover:bg-gray-100"
                  :disabled="idx === 0"
                  title="Subir"
                  @click="moveItem(section.key, idx, -1)"
                >
                  <Icon name="lucide:chevron-up" size="14" />
                </button>
                <button
                  class="rounded p-1.5 text-ink-muted disabled:opacity-30 hover:bg-gray-100"
                  :disabled="idx === (sections[section.key]?.length ?? 0) - 1"
                  title="Bajar"
                  @click="moveItem(section.key, idx, 1)"
                >
                  <Icon name="lucide:chevron-down" size="14" />
                </button>
                <button
                  class="rounded p-1.5 text-ink-muted hover:bg-red-50 hover:text-red-600"
                  title="Eliminar"
                  @click="removeItem(section.key, idx)"
                >
                  <Icon name="lucide:trash-2" size="14" />
                </button>
              </div>
            </div>

            <div class="grid gap-3 px-5 py-4 md:grid-cols-2">
              <div
                v-for="field in fieldShape(section.key)"
                :key="field"
                class="form-group !mb-0"
                :class="{ 'md:col-span-2': isLong(field) }"
              >
                <label class="form-label">{{ labelFor(field) }}</label>
                <textarea
                  v-if="isLong(field)"
                  v-model="(item as Record<string, any>)[field]"
                  rows="3"
                  class="input w-full"
                  @input="markDirty(section.key)"
                />
                <select
                  v-else-if="isAccent(field)"
                  v-model="(item as Record<string, any>)[field]"
                  class="select w-full"
                  @change="markDirty(section.key)"
                >
                  <option v-for="o in cmsAccentOptions" :key="o.value" :value="o.value">
                    {{ o.label }}
                  </option>
                </select>
                <input
                  v-else
                  v-model="(item as Record<string, any>)[field]"
                  :type="isUrl(field) ? 'url' : 'text'"
                  class="input w-full"
                  @input="markDirty(section.key)"
                />
              </div>
            </div>
          </div>

          <!-- Acciones de sección -->
          <div class="flex flex-wrap items-center gap-2 border-t border-gray-100 px-5 py-3">
            <button class="btn-outline btn-sm" @click="addItem(section.key)">
              <Icon name="lucide:plus" size="14" />
              Añadir bloque
            </button>
            <button class="btn-ghost btn-sm" @click="resetSection(section.key)">
              <Icon name="lucide:rotate-ccw" size="14" />
              Restaurar default
            </button>
            <button
              class="btn-primary btn-sm ml-auto"
              :disabled="saving === section.key"
              @click="saveSection(section.key)"
            >
              <Icon
                :name="saving === section.key ? 'lucide:loader-2' : 'lucide:save'"
                size="14"
                :class="saving === section.key ? 'animate-spin-smooth' : ''"
              />
              Guardar sección
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

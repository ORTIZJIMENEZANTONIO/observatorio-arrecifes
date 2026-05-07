<script setup lang="ts">
import type { ReefNewsArticle, ReefNewsProspect } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'admin', pageTransition: false })

const { apiFetch } = useApi()

const activeTab = ref<'publicados' | 'prospectos'>('publicados')

// ── Artículos publicados ──
const articles = ref<ReefNewsArticle[]>([])
const articlesLoading = ref(false)
const articlesError = ref('')
const showForm = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)

const today = new Date().toISOString().slice(0, 10)

const form = reactive({
  title: '',
  summary: '',
  content: '',
  author: '',
  publishedAt: today,
  tags: '',
  image: '',
  imageCredit: '',
  source: '',
  sourceUrl: '',
  visible: true,
})

const resetForm = () => {
  form.title = ''
  form.summary = ''
  form.content = ''
  form.author = ''
  form.publishedAt = today
  form.tags = ''
  form.image = ''
  form.imageCredit = ''
  form.source = ''
  form.sourceUrl = ''
  form.visible = true
  editingId.value = null
}

const loadArticles = async () => {
  articlesLoading.value = true
  articlesError.value = ''
  try {
    const res = await apiFetch<{ success: boolean; items: ReefNewsArticle[] }>(
      '/admin/news?limit=100',
    )
    articles.value = res.items || []
  } catch (e: any) {
    articlesError.value = e?.data?.error?.message || 'No se pudieron cargar los artículos'
  } finally {
    articlesLoading.value = false
  }
}

const startCreate = () => {
  resetForm()
  showForm.value = true
}

const startEdit = (a: ReefNewsArticle) => {
  editingId.value = a.id
  form.title = a.title
  form.summary = a.summary
  form.content = a.content || ''
  form.author = a.author
  form.publishedAt = a.publishedAt
  form.tags = (a.tags || []).join(', ')
  form.image = a.image || ''
  form.imageCredit = a.imageCredit || ''
  form.source = a.source || ''
  form.sourceUrl = a.sourceUrl || ''
  form.visible = a.visible !== false
  showForm.value = true
}

const submit = async () => {
  saving.value = true
  try {
    const body = {
      title: form.title,
      summary: form.summary,
      content: form.content || null,
      author: form.author,
      publishedAt: form.publishedAt,
      tags: form.tags
        ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
      image: form.image || null,
      imageCredit: form.imageCredit || null,
      source: form.source || null,
      sourceUrl: form.sourceUrl || null,
      visible: form.visible,
    }
    if (editingId.value) {
      await apiFetch(`/admin/news/${editingId.value}`, { method: 'PATCH', body })
    } else {
      await apiFetch('/admin/news', { method: 'POST', body })
    }
    showForm.value = false
    resetForm()
    await loadArticles()
  } catch (e: any) {
    alert(e?.data?.error?.message || 'Error al guardar')
  } finally {
    saving.value = false
  }
}

const deleteArticle = async (id: number) => {
  if (!confirm('¿Eliminar este artículo?')) return
  try {
    await apiFetch(`/admin/news/${id}`, { method: 'DELETE' })
    await loadArticles()
  } catch (e: any) {
    alert(e?.data?.error?.message || 'Error al eliminar')
  }
}

// ── Prospectos (cola scraper) ──
const prospects = ref<ReefNewsProspect[]>([])
const prospectsLoading = ref(false)
const prospectsFilter = ref<'pending' | 'approved' | 'rejected'>('pending')
const scraping = ref(false)
const scrapeMessage = ref('')
const rejectingId = ref<number | null>(null)
const rejectNotes = ref('')

const loadProspects = async () => {
  prospectsLoading.value = true
  try {
    const res = await apiFetch<{ success: boolean; items: ReefNewsProspect[] }>(
      `/admin/news/prospects/list?status=${prospectsFilter.value}&limit=100`,
    )
    prospects.value = res.items || []
  } catch {
    prospects.value = []
  } finally {
    prospectsLoading.value = false
  }
}

const approveProspect = async (p: ReefNewsProspect) => {
  // Pre-llena el form con los datos del prospecto + crédito al original
  resetForm()
  form.title = p.title
  form.summary = p.summary
  form.content =
    `<p>${p.summary}</p>` +
    `<p><strong>Fuente:</strong> <a href="${p.url}" target="_blank" rel="noopener noreferrer">${p.source}</a></p>`
  form.author = p.source
  form.publishedAt = p.publishedAt
  form.image = p.image || ''
  form.imageCredit = p.source
  form.source = p.source
  form.sourceUrl = p.url
  form.visible = true

  try {
    await apiFetch(`/admin/news/prospects/${p.id}/approve`, { method: 'POST' })
    await loadProspects()
  } catch { /* noop, se mantiene el form */ }

  activeTab.value = 'publicados'
  showForm.value = true
}

const startReject = (id: number) => {
  rejectingId.value = id
  rejectNotes.value = ''
}

const confirmReject = async () => {
  if (!rejectingId.value) return
  try {
    await apiFetch(`/admin/news/prospects/${rejectingId.value}/reject`, {
      method: 'POST',
      body: { notes: rejectNotes.value || 'sin notas' },
    })
    await loadProspects()
  } catch (e: any) {
    alert(e?.data?.error?.message || 'Error al rechazar')
  }
  rejectingId.value = null
}

const runScraper = async () => {
  scraping.value = true
  scrapeMessage.value = ''
  try {
    const res = await apiFetch<{ success: boolean; data: { message: string; inserted: number } }>(
      '/admin/news/scraper/run',
      { method: 'POST' },
    )
    scrapeMessage.value = res.data.message
    await loadProspects()
  } catch (e: any) {
    scrapeMessage.value = e?.data?.error?.message || 'Error al ejecutar el scraper'
  } finally {
    scraping.value = false
  }
}

onMounted(() => {
  loadArticles()
  loadProspects()
})
watch(prospectsFilter, loadProspects)
</script>

<template>
  <div class="space-y-5">
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 class="text-2xl font-semibold text-ink">Noticias del observatorio</h2>
        <p class="mt-1 text-sm text-ink-muted">
          Gestión de artículos publicados y prospectos scrapeados de Mongabay México.
        </p>
      </div>
      <button v-if="activeTab === 'publicados'" class="btn-primary" @click="startCreate">
        <Icon name="lucide:plus" size="16" />
        Nuevo artículo
      </button>
      <button v-else class="btn-coral" :disabled="scraping" @click="runScraper">
        <Icon name="lucide:satellite" size="16" :class="scraping ? 'animate-spin' : ''" />
        {{ scraping ? 'Scrapeando…' : 'Ejecutar scraper Mongabay' }}
      </button>
    </header>

    <!-- Tabs -->
    <div class="flex gap-2 border-b border-gray-200">
      <button
        v-for="tab in ['publicados', 'prospectos'] as const"
        :key="tab"
        class="border-b-2 px-3 py-2 text-sm font-medium capitalize transition-colors"
        :class="activeTab === tab
          ? 'border-primary text-primary'
          : 'border-transparent text-ink-muted hover:text-ink'"
        @click="activeTab = tab"
      >
        {{ tab }}
        <span v-if="tab === 'publicados'" class="ml-1 text-xs text-ink-muted">({{ articles.length }})</span>
        <span v-else class="ml-1 text-xs text-ink-muted">({{ prospects.length }})</span>
      </button>
    </div>

    <!-- ─── Artículos publicados ─── -->
    <section v-if="activeTab === 'publicados'" class="space-y-4">
      <p v-if="articlesError" class="rounded-lg border border-alert/30 bg-alert/5 p-3 text-sm text-alert">
        {{ articlesError }}
      </p>
      <p v-if="articlesLoading" class="text-sm text-ink-muted">Cargando artículos…</p>

      <!-- Form -->
      <div v-if="showForm" class="card p-5">
        <h3 class="mb-4 text-sm font-semibold text-ink">
          {{ editingId ? 'Editar artículo' : 'Nuevo artículo' }}
        </h3>
        <form class="grid gap-4" @submit.prevent="submit">
          <div class="grid gap-4 md:grid-cols-2">
            <div class="form-group">
              <label class="form-label">Título *</label>
              <input v-model="form.title" type="text" class="input" required />
            </div>
            <div class="form-group">
              <label class="form-label">Autor *</label>
              <input v-model="form.author" type="text" class="input" required />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Resumen *</label>
            <textarea v-model="form.summary" class="input" rows="2" required />
          </div>
          <div class="form-group">
            <label class="form-label">Contenido (HTML)</label>
            <textarea v-model="form.content" class="input font-mono text-xs" rows="8" />
          </div>
          <div class="grid gap-4 md:grid-cols-3">
            <div class="form-group">
              <label class="form-label">Fecha *</label>
              <input v-model="form.publishedAt" type="date" class="input" required />
            </div>
            <div class="form-group">
              <label class="form-label">Etiquetas (coma)</label>
              <input v-model="form.tags" type="text" class="input" placeholder="Cabo Pulmo, ANP marina" />
            </div>
            <div class="form-group">
              <label class="form-label">Visible</label>
              <select v-model="form.visible" class="select">
                <option :value="true">Sí</option>
                <option :value="false">No</option>
              </select>
            </div>
          </div>
          <div class="grid gap-4 md:grid-cols-2">
            <div class="form-group">
              <label class="form-label">Imagen (URL)</label>
              <input v-model="form.image" type="url" class="input" />
            </div>
            <div class="form-group">
              <label class="form-label">Crédito imagen</label>
              <input v-model="form.imageCredit" type="text" class="input" />
            </div>
          </div>
          <div class="grid gap-4 md:grid-cols-2">
            <div class="form-group">
              <label class="form-label">Fuente (etiqueta)</label>
              <input v-model="form.source" type="text" class="input" placeholder="Mongabay Latam" />
            </div>
            <div class="form-group">
              <label class="form-label">URL fuente original</label>
              <input v-model="form.sourceUrl" type="url" class="input" />
            </div>
          </div>
          <div class="flex justify-end gap-3">
            <button type="button" class="btn-outline" @click="showForm = false; resetForm()">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="saving">
              <Icon name="lucide:save" size="16" />
              {{ saving ? 'Guardando…' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Tabla -->
      <div v-if="articles.length > 0" class="card overflow-hidden">
        <table class="table-base text-sm">
          <thead>
            <tr>
              <th class="text-left">Título</th>
              <th class="text-left">Autor</th>
              <th class="text-left">Fuente</th>
              <th class="text-left">Fecha</th>
              <th class="text-center">Visible</th>
              <th class="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in articles" :key="a.id" class="border-t border-gray-100">
              <td class="py-2 font-medium text-ink">{{ a.title }}</td>
              <td class="text-ink-muted">{{ a.author }}</td>
              <td>
                <a v-if="a.sourceUrl" :href="a.sourceUrl" target="_blank" rel="noopener" class="text-primary underline">
                  {{ a.source || 'fuente' }}
                </a>
                <span v-else class="text-ink-muted">{{ a.source || '—' }}</span>
              </td>
              <td class="text-ink-muted">{{ a.publishedAt }}</td>
              <td class="text-center">
                <span v-if="a.visible" class="badge badge-eco">Sí</span>
                <span v-else class="badge-neutral">No</span>
              </td>
              <td class="text-right">
                <button class="btn-ghost btn-sm" title="Editar" @click="startEdit(a)">
                  <Icon name="lucide:pencil" size="16" />
                </button>
                <button class="btn-ghost btn-sm text-alert" title="Eliminar" @click="deleteArticle(a.id)">
                  <Icon name="lucide:trash-2" size="16" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else-if="!articlesLoading" class="text-sm text-ink-muted">Sin artículos publicados aún.</p>
    </section>

    <!-- ─── Prospectos (scraper) ─── -->
    <section v-if="activeTab === 'prospectos'" class="space-y-4">
      <div class="flex flex-wrap items-center gap-3">
        <select v-model="prospectsFilter" class="select !py-1.5 text-xs">
          <option value="pending">Pendientes</option>
          <option value="approved">Aprobados</option>
          <option value="rejected">Rechazados</option>
        </select>
        <p v-if="scrapeMessage" class="text-xs text-eco-dark">{{ scrapeMessage }}</p>
      </div>

      <p v-if="prospectsLoading" class="text-sm text-ink-muted">Cargando prospectos…</p>

      <div v-if="prospects.length > 0" class="space-y-3">
        <div
          v-for="p in prospects"
          :key="p.id"
          class="card flex flex-wrap items-start gap-4 p-4"
        >
          <img v-if="p.image" :src="p.image" :alt="p.title" class="h-20 w-32 rounded-lg object-cover" loading="lazy" />
          <div class="flex-1 space-y-1">
            <p class="text-sm font-semibold text-ink">{{ p.title }}</p>
            <p class="text-xs text-ink-muted">{{ p.summary }}</p>
            <div class="flex flex-wrap items-center gap-2 text-[11px]">
              <span class="badge badge-secondary">{{ p.source }}</span>
              <span class="text-ink-muted">{{ p.publishedAt }}</span>
              <a :href="p.url" target="_blank" rel="noopener" class="text-primary underline">
                Ver original ↗
              </a>
            </div>
            <p v-if="p.rejectionNotes" class="rounded bg-alert/5 p-2 text-[11px] text-alert">
              Rechazado: {{ p.rejectionNotes }}
            </p>
          </div>
          <div v-if="p.status === 'pending'" class="flex shrink-0 gap-2">
            <button class="btn-eco btn-sm" @click="approveProspect(p)">
              <Icon name="lucide:check" size="14" />
              Aprobar
            </button>
            <button class="btn-outline btn-sm text-alert" @click="startReject(p.id)">
              <Icon name="lucide:x" size="14" />
              Rechazar
            </button>
          </div>
        </div>
      </div>
      <p v-else-if="!prospectsLoading" class="text-sm text-ink-muted">
        No hay prospectos en estado <strong>{{ prospectsFilter }}</strong>.
        <span v-if="prospectsFilter === 'pending'">Ejecuta el scraper para traer noticias nuevas.</span>
      </p>
    </section>

    <!-- Modal rechazo -->
    <Teleport to="body">
      <div
        v-if="rejectingId"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        @click.self="rejectingId = null"
      >
        <div class="card w-full max-w-md p-5">
          <h3 class="mb-3 text-sm font-semibold text-ink">Motivo del rechazo</h3>
          <textarea
            v-model="rejectNotes"
            class="input w-full"
            rows="4"
            placeholder="Por qué este prospecto no es relevante…"
          />
          <div class="mt-4 flex justify-end gap-2">
            <button class="btn-outline" @click="rejectingId = null">Cancelar</button>
            <button class="btn-coral" @click="confirmReject">Rechazar</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

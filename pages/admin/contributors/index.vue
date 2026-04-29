<script setup lang="ts">
import type { Contributor } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'admin', pageTransition: false })

const { apiFetch } = useApi()
const items = ref<Contributor[]>([])
const loading = ref(true)
const error = ref('')

// ── Filtros ──
const search = ref('')
const filterRole = ref<string>('all')
const filterTier = ref<string>('all')
const filterVerified = ref<'all' | 'yes' | 'no'>('all')
const filterVisibility = ref<'all' | 'public' | 'private'>('all')
const filtersOpen = ref(false)
const activeFilterCount = computed(() =>
  [filterRole.value, filterTier.value, filterVerified.value, filterVisibility.value]
    .filter((v) => v !== 'all').length + (search.value.trim() ? 1 : 0),
)

const tierClass: Record<string, string> = {
  bronze: 'tier-bronze',
  silver: 'tier-silver',
  gold: 'tier-gold',
  platinum: 'tier-platinum',
  coral: 'tier-coral',
}

const load = async () => {
  loading.value = true
  try {
    const res = await apiFetch<{ success: boolean; items: Contributor[] }>('/admin/contributors?limit=200')
    items.value = res.items
  } catch (e: any) {
    error.value = e?.data?.error?.message || 'No se pudieron cargar los colaboradores'
  } finally {
    loading.value = false
  }
}

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return items.value.filter((c) => {
    if (q && !`${c.displayName} ${c.handle} ${c.affiliation || ''}`.toLowerCase().includes(q)) return false
    if (filterRole.value !== 'all' && c.role !== filterRole.value) return false
    if (filterTier.value !== 'all' && c.tier !== filterTier.value) return false
    if (filterVerified.value === 'yes' && !c.verified) return false
    if (filterVerified.value === 'no' && c.verified) return false
    if (filterVisibility.value === 'public' && !c.publicProfile) return false
    if (filterVisibility.value === 'private' && c.publicProfile) return false
    return true
  })
})

const resetFilters = () => {
  search.value = ''
  filterRole.value = 'all'
  filterTier.value = 'all'
  filterVerified.value = 'all'
  filterVisibility.value = 'all'
}

const toggleVerified = async (c: Contributor) => {
  const next = !c.verified
  try {
    await apiFetch(`/admin/contributors/${c.id}`, { method: 'PATCH', body: { verified: next } })
    c.verified = next
  } catch (e: any) {
    error.value = e?.data?.error?.message || 'No se pudo actualizar'
  }
}

// ── Editor ──
type ContributorForm = {
  displayName: string; handle: string; role: string; affiliation: string
  bio: string; avatarUrl: string; state: string
  tier: string; reputationScore: number
  validatedContributions: number; rejectedContributions: number
  averageQuality: number
  publicProfile: boolean; verified: boolean
}

const blankForm = (): ContributorForm => ({
  displayName: '', handle: '', role: 'citizen', affiliation: '',
  bio: '', avatarUrl: '', state: '',
  tier: 'bronze', reputationScore: 0,
  validatedContributions: 0, rejectedContributions: 0,
  averageQuality: 0,
  publicProfile: true, verified: false,
})

const editingId = ref<number | null>(null)
const form = ref<ContributorForm>(blankForm())
const saving = ref(false)
const formError = ref('')

const openCreate = () => { editingId.value = 0; form.value = blankForm(); formError.value = '' }
const openEdit = (c: Contributor) => {
  editingId.value = c.id
  formError.value = ''
  form.value = {
    displayName: c.displayName || '',
    handle: c.handle || '',
    role: c.role || 'citizen',
    affiliation: c.affiliation || '',
    bio: c.bio || '',
    avatarUrl: c.avatarUrl || '',
    state: c.state || '',
    tier: c.tier || 'bronze',
    reputationScore: Number(c.reputationScore) || 0,
    validatedContributions: Number(c.validatedContributions) || 0,
    rejectedContributions: Number(c.rejectedContributions) || 0,
    averageQuality: Number(c.averageQuality) || 0,
    publicProfile: c.publicProfile ?? true,
    verified: c.verified ?? false,
  }
}
const closeEditor = () => { editingId.value = null }

const save = async () => {
  if (editingId.value === null) return
  if (!form.value.displayName.trim()) { formError.value = 'Nombre requerido'; return }
  if (!form.value.handle.trim()) { formError.value = 'Handle requerido'; return }
  if (!/^[a-z0-9_-]+$/i.test(form.value.handle)) { formError.value = 'Handle sólo a-z, 0-9, _, -'; return }
  saving.value = true
  formError.value = ''
  const f = form.value
  const payload: any = {
    displayName: f.displayName.trim(),
    handle: f.handle.trim(),
    role: f.role,
    affiliation: f.affiliation.trim() || null,
    bio: f.bio.trim() || null,
    avatarUrl: f.avatarUrl.trim() || null,
    state: f.state.trim() || null,
    tier: f.tier,
    reputationScore: f.reputationScore,
    validatedContributions: f.validatedContributions,
    rejectedContributions: f.rejectedContributions,
    averageQuality: f.averageQuality,
    publicProfile: f.publicProfile,
    verified: f.verified,
  }
  try {
    if (editingId.value === 0) {
      await apiFetch('/admin/contributors', { method: 'POST', body: payload })
    } else {
      await apiFetch(`/admin/contributors/${editingId.value}`, { method: 'PATCH', body: payload })
    }
    closeEditor()
    await load()
  } catch (e: any) {
    formError.value = e?.data?.error?.message || 'No se pudo guardar'
  } finally {
    saving.value = false
  }
}

const remove = async (c: Contributor) => {
  if (!confirm(`¿Eliminar a ${c.displayName} (@${c.handle})?`)) return
  try {
    await apiFetch(`/admin/contributors/${c.id}`, { method: 'DELETE' })
    items.value = items.value.filter((x) => x.id !== c.id)
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
        <h2 class="text-2xl font-semibold text-ink">Comunidad</h2>
        <p class="mt-1 text-sm text-ink-muted">{{ items.length }} colaboradores · gestión de la red.</p>
      </div>
      <div class="flex gap-2">
        <button class="btn-outline btn-sm" @click="load"><Icon name="lucide:refresh-cw" size="14" /> Refrescar</button>
        <button class="btn-primary btn-sm" @click="openCreate"><Icon name="lucide:plus" size="14" /> Nuevo colaborador</button>
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
          <input v-model="search" type="search" class="input w-full" placeholder="Nombre, handle, afiliación…" />
        </div>
        <div class="form-group">
          <label class="form-label">Rol</label>
          <select v-model="filterRole" class="select w-full">
            <option value="all">Todos</option>
            <option value="citizen">Ciudadano</option>
            <option value="researcher">Investigador</option>
            <option value="student">Estudiante</option>
            <option value="fisher">Pescador</option>
            <option value="diver">Buzo</option>
            <option value="tour_operator">Tour operador</option>
            <option value="institution">Institución</option>
            <option value="ngo">ONG</option>
            <option value="government">Gobierno</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Tier</label>
          <select v-model="filterTier" class="select w-full">
            <option value="all">Todos</option>
            <option value="bronze">Bronce</option>
            <option value="silver">Plata</option>
            <option value="gold">Oro</option>
            <option value="platinum">Platino</option>
            <option value="coral">Coral</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Verificación</label>
          <select v-model="filterVerified" class="select w-full">
            <option value="all">Todos</option>
            <option value="yes">Verificados</option>
            <option value="no">No verificados</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Perfil</label>
          <select v-model="filterVisibility" class="select w-full">
            <option value="all">Todos</option>
            <option value="public">Públicos</option>
            <option value="private">Privados</option>
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

    <div v-else class="table-container">
      <table class="table-base">
        <thead>
          <tr>
            <th class="text-left">Colaborador</th>
            <th class="text-left">Rol</th>
            <th class="text-left">Tier</th>
            <th class="text-right">Reputación</th>
            <th class="text-right">Validados</th>
            <th class="text-right">Calidad</th>
            <th class="text-center">Verificado</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in filtered" :key="c.id" class="border-t border-gray-100 hover:bg-gray-50/50">
            <td class="py-3">
              <p class="font-medium text-ink">{{ c.displayName }}</p>
              <p class="text-xs text-ink-muted">@{{ c.handle }} · {{ c.affiliation || '—' }}</p>
            </td>
            <td class="text-sm text-ink-muted">{{ c.role }}</td>
            <td><span :class="tierClass[c.tier] || 'badge-secondary'">{{ c.tier }}</span></td>
            <td class="text-right font-mono text-sm text-ink">{{ c.reputationScore }}</td>
            <td class="text-right font-mono text-sm text-ink">{{ c.validatedContributions }}</td>
            <td class="text-right font-mono text-sm text-ink">{{ Math.round(Number(c.averageQuality)) }}</td>
            <td class="text-center">
              <button class="rounded-full px-2 py-1 text-xs font-semibold" :class="c.verified ? 'bg-eco/10 text-eco-dark' : 'bg-gray-100 text-gray-500'" @click="toggleVerified(c)">
                {{ c.verified ? 'Sí' : 'No' }}
              </button>
            </td>
            <td>
              <div class="flex justify-end gap-1">
                <button class="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-primary-50 hover:text-primary" title="Editar" @click="openEdit(c)">
                  <Icon name="lucide:pencil" size="16" />
                </button>
                <button class="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-red-50 hover:text-red-600" title="Eliminar" @click="remove(c)">
                  <Icon name="lucide:trash-2" size="16" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Transition name="fade">
      <div v-if="editingId !== null" class="fixed inset-0 z-[200] flex items-end justify-center overflow-y-auto bg-black/40 sm:items-center" @click.self="closeEditor">
        <div class="my-8 w-full max-w-2xl rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
          <header class="mb-4 flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-ink">{{ editingId === 0 ? 'Nuevo colaborador' : 'Editar colaborador' }}</h3>
              <p class="text-xs text-ink-muted">Las métricas (validados/rechazados/calidad) se actualizan automáticamente al revisar aportes.</p>
            </div>
            <button class="rounded-lg p-2 text-gray-400 hover:bg-gray-100" @click="closeEditor">
              <Icon name="lucide:x" size="18" />
            </button>
          </header>

          <div class="space-y-4">
            <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div class="form-group">
                <label class="form-label">Nombre *</label>
                <input v-model="form.displayName" type="text" class="input w-full" />
              </div>
              <div class="form-group">
                <label class="form-label">Handle *</label>
                <input v-model="form.handle" type="text" class="input w-full" placeholder="solo a-z 0-9 _ -" />
              </div>
              <div class="form-group">
                <label class="form-label">Rol</label>
                <select v-model="form.role" class="select w-full">
                  <option value="citizen">Ciudadano</option>
                  <option value="researcher">Investigador</option>
                  <option value="student">Estudiante</option>
                  <option value="fisher">Pescador</option>
                  <option value="diver">Buzo</option>
                  <option value="tour_operator">Tour operador</option>
                  <option value="institution">Institución</option>
                  <option value="ngo">ONG</option>
                  <option value="government">Gobierno</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Tier</label>
                <select v-model="form.tier" class="select w-full">
                  <option value="bronze">Bronce</option>
                  <option value="silver">Plata</option>
                  <option value="gold">Oro</option>
                  <option value="platinum">Platino</option>
                  <option value="coral">Coral</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Afiliación</label>
                <input v-model="form.affiliation" type="text" class="input w-full" />
              </div>
              <div class="form-group">
                <label class="form-label">Estado</label>
                <input v-model="form.state" type="text" class="input w-full" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Bio</label>
              <textarea v-model="form.bio" rows="3" class="input w-full" />
            </div>
            <div class="form-group">
              <label class="form-label">Avatar URL</label>
              <input v-model="form.avatarUrl" type="url" class="input w-full" />
              <div v-if="form.avatarUrl" class="mt-2 h-16 w-16 overflow-hidden rounded-full bg-gray-100">
                <img :src="form.avatarUrl" alt="avatar preview" class="h-full w-full object-cover" @error="(e) => ((e.target as HTMLImageElement).style.opacity = '0.2')" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div class="form-group">
                <label class="form-label">Reputación</label>
                <input v-model.number="form.reputationScore" type="number" min="0" class="input w-full" />
              </div>
              <div class="form-group">
                <label class="form-label">Validados</label>
                <input v-model.number="form.validatedContributions" type="number" min="0" class="input w-full" />
              </div>
              <div class="form-group">
                <label class="form-label">Rechazados</label>
                <input v-model.number="form.rejectedContributions" type="number" min="0" class="input w-full" />
              </div>
              <div class="form-group">
                <label class="form-label">Calidad (0-100)</label>
                <input v-model.number="form.averageQuality" type="number" min="0" max="100" step="0.1" class="input w-full" />
              </div>
            </div>

            <div class="flex gap-4 border-t border-gray-100 pt-4">
              <label class="flex items-center gap-2 text-sm">
                <input v-model="form.publicProfile" type="checkbox" class="h-4 w-4 rounded" /> Perfil público
              </label>
              <label class="flex items-center gap-2 text-sm">
                <input v-model="form.verified" type="checkbox" class="h-4 w-4 rounded" /> Verificado
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

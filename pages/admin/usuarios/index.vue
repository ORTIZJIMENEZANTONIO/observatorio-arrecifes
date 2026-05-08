<script setup lang="ts">
import type { AdminUser, AdminRole, AdminPermission } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'admin', pageTransition: false })

const { apiFetch } = useApi()
const auth = useAuthStore()

const items = ref<AdminUser[]>([])
const loading = ref(true)
const error = ref('')
const saving = ref(false)
const showForm = ref(false)
const editingId = ref<string | null>(null)

const allObservatories = [
  { slug: 'arrecifes', label: 'Arrecifes' },
  { slug: 'humedales', label: 'Humedales' },
  { slug: 'techos-verdes', label: 'Techos verdes' },
]

const allPermissions: { key: AdminPermission; label: string }[] = [
  { key: 'manage_reefs', label: 'Inventario de arrecifes' },
  { key: 'manage_observations', label: 'Observaciones / aportes' },
  { key: 'manage_conflicts', label: 'Conflictos socioambientales' },
  { key: 'manage_contributors', label: 'Comunidad' },
  { key: 'manage_layers', label: 'Capas de datos' },
  { key: 'review_submissions', label: 'Revisión de aportes' },
  { key: 'manage_cms', label: 'Contenido (blog/artículos)' },
  { key: 'manage_users', label: 'Gestión de usuarios' },
]

const form = reactive({
  name: '',
  email: '',
  password: '',
  role: 'editor' as AdminRole,
  permissions: [] as AdminPermission[],
  observatories: ['arrecifes'] as string[],
  isActive: true,
})

const resetForm = () => {
  form.name = ''
  form.email = ''
  form.password = ''
  form.role = 'editor'
  form.permissions = []
  form.observatories = ['arrecifes']
  form.isActive = true
  editingId.value = null
}

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await apiFetch<{ success: boolean; items: AdminUser[] }>('/admin/usuarios')
    items.value = res.items || []
  } catch (e: any) {
    error.value = e?.data?.error?.message || 'No se pudieron cargar los usuarios'
  } finally {
    loading.value = false
  }
}

const startCreate = () => {
  resetForm()
  showForm.value = true
}

const startEdit = (u: AdminUser) => {
  editingId.value = u.id
  form.name = u.name
  form.email = u.email
  form.password = ''
  form.role = u.role
  form.permissions = [...(u.permissions || [])]
  form.observatories = [...(u.observatories || ['arrecifes'])]
  form.isActive = u.isActive ?? true
  showForm.value = true
}

const cancel = () => {
  showForm.value = false
  resetForm()
}

const save = async () => {
  if (!form.name.trim() || !form.email.trim()) {
    error.value = 'Nombre y correo son obligatorios'
    return
  }
  if (!editingId.value && !form.password) {
    error.value = 'La contraseña es obligatoria al crear un usuario'
    return
  }
  saving.value = true
  error.value = ''
  const body: Record<string, unknown> = {
    name: form.name,
    email: form.email,
    role: form.role,
    permissions: form.role === 'superadmin'
      ? allPermissions.map((p) => p.key)
      : form.permissions,
    observatories: form.observatories,
    isActive: form.isActive,
  }
  if (form.password) body.password = form.password
  try {
    if (editingId.value) {
      await apiFetch(`/admin/usuarios/${editingId.value}`, { method: 'PATCH', body })
    } else {
      await apiFetch('/admin/usuarios', { method: 'POST', body })
    }
    showForm.value = false
    resetForm()
    await load()
  } catch (e: any) {
    error.value = e?.data?.error?.message || 'No se pudo guardar el usuario'
  } finally {
    saving.value = false
  }
}

const remove = async (u: AdminUser) => {
  if (u.id === auth.admin?.id) {
    error.value = 'No puedes eliminar tu propia cuenta'
    return
  }
  if (!confirm(`¿Eliminar al usuario "${u.name || u.email}"? Esta acción es permanente.`)) return
  try {
    await apiFetch(`/admin/usuarios/${u.id}`, { method: 'DELETE' })
    await load()
  } catch (e: any) {
    error.value = e?.data?.error?.message || 'No se pudo eliminar'
  }
}

// ── Filtros ──
const search = ref('')
const filterRole = ref<'all' | AdminRole>('all')
const filterObservatory = ref<'all' | string>('all')
const filterStatus = ref<'all' | 'active' | 'inactive'>('all')
const filtersOpen = ref(false)
const activeFilterCount = computed(() =>
  [filterRole.value, filterObservatory.value, filterStatus.value]
    .filter((v) => v !== 'all').length + (search.value.trim() ? 1 : 0),
)
const resetFilters = () => {
  search.value = ''
  filterRole.value = 'all'
  filterObservatory.value = 'all'
  filterStatus.value = 'all'
}

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return items.value.filter((u) => {
    if (q && !`${u.name} ${u.email}`.toLowerCase().includes(q)) return false
    if (filterRole.value !== 'all' && u.role !== filterRole.value) return false
    if (filterObservatory.value !== 'all' && !(u.observatories || []).includes(filterObservatory.value)) return false
    if (filterStatus.value === 'active' && u.isActive === false) return false
    if (filterStatus.value === 'inactive' && u.isActive !== false) return false
    return true
  })
})

const { sorted, sortKey, sortDir, toggleSort } = useSortableList(filtered, { defaultKey: 'name' })
const { paginated: paginatedUsers, currentPage, totalPages, perPage } = usePaginatedList(sorted, { perPage: 15 })

const roleBadgeClass = (role: string) => {
  if (role === 'superadmin') return 'badge-coral'
  if (role === 'admin') return 'badge-primary'
  if (role === 'reviewer') return 'badge-eco'
  return 'badge-secondary'
}

const roleLabel = (role: string) => {
  const labels: Record<string, string> = {
    superadmin: 'Superadmin',
    admin: 'Administrador',
    reviewer: 'Revisor',
    editor: 'Editor',
  }
  return labels[role] || role
}

const formatDate = (iso?: string | null) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: '2-digit' })
}

onMounted(load)
</script>

<template>
  <div class="space-y-5">
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 class="text-2xl font-semibold text-ink">Gestión de usuarios</h2>
        <p class="mt-1 text-sm text-ink-muted">
          {{ auth.isSuperadmin
            ? 'Como superadmin ves a todos los usuarios de los tres observatorios.'
            : 'Cuentas con acceso al observatorio de arrecifes.' }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button class="btn-ghost btn-sm" @click="load" :disabled="loading">
          <Icon name="lucide:refresh-cw" size="16" :class="loading ? 'animate-spin' : ''" />
          Refrescar
        </button>
        <button v-if="auth.isSuperadmin" class="btn-primary btn-sm" @click="startCreate">
          <Icon name="lucide:plus" size="16" />
          Nuevo usuario
        </button>
      </div>
    </header>

    <div v-if="!auth.isSuperadmin" class="rounded-2xl border border-accent/30 bg-accent/5 p-5 text-sm text-ink-muted">
      Sólo los superadministradores pueden crear o editar cuentas. Esta vista es de
      consulta para tu rol actual.
    </div>

    <div v-if="error" class="rounded-2xl border border-alert/30 bg-alert/5 p-4 text-sm text-alert">{{ error }}</div>

    <button
      class="btn-outline btn-sm md:hidden w-full justify-between"
      @click="filtersOpen = !filtersOpen"
    >
      <span class="flex items-center gap-2">
        <Icon name="lucide:filter" size="16" />
        {{ filtersOpen ? 'Ocultar filtros' : 'Mostrar filtros' }}
      </span>
      <span v-if="activeFilterCount > 0" class="badge-primary">{{ activeFilterCount }}</span>
    </button>

    <div v-show="filtersOpen || true" class="card p-4 md:p-5 space-y-3" :class="{ 'hidden md:block': !filtersOpen && false }">
      <div class="grid gap-3 md:grid-cols-4">
        <div class="form-group">
          <label class="form-label">Buscar</label>
          <input v-model="search" class="input" placeholder="Nombre o correo…" />
        </div>
        <div class="form-group">
          <label class="form-label">Rol</label>
          <select v-model="filterRole" class="select">
            <option value="all">Todos</option>
            <option value="superadmin">Superadmin</option>
            <option value="admin">Administrador</option>
            <option value="reviewer">Revisor</option>
            <option value="editor">Editor</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Observatorio</label>
          <select v-model="filterObservatory" class="select">
            <option value="all">Todos</option>
            <option v-for="o in allObservatories" :key="o.slug" :value="o.slug">{{ o.label }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Estatus</label>
          <select v-model="filterStatus" class="select">
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>
      <div class="flex items-center justify-between text-xs text-ink-muted">
        <span>{{ filtered.length }} de {{ items.length }} usuarios</span>
        <button v-if="activeFilterCount > 0" class="btn-ghost !py-1 text-xs" @click="resetFilters">
          Limpiar filtros
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-sm text-ink-muted">Cargando…</div>
    <div v-else-if="filtered.length === 0" class="card-flat p-8 text-center text-sm text-ink-muted">
      No hay usuarios que coincidan con los filtros.
    </div>
    <div v-else class="table-container">
      <table class="table-base">
        <thead>
          <tr>
            <AdminSortableTh sort-key="name" :current-key="sortKey" :current-dir="sortDir" align="left" @sort="toggleSort('name')">Nombre</AdminSortableTh>
            <AdminSortableTh sort-key="email" :current-key="sortKey" :current-dir="sortDir" align="left" @sort="toggleSort('email')">Correo</AdminSortableTh>
            <AdminSortableTh sort-key="role" :current-key="sortKey" :current-dir="sortDir" align="left" @sort="toggleSort('role')">Rol</AdminSortableTh>
            <th class="text-left">Observatorios</th>
            <th class="text-left">Permisos</th>
            <AdminSortableTh sort-key="isActive" :current-key="sortKey" :current-dir="sortDir" align="left" @sort="toggleSort('isActive')">Estatus</AdminSortableTh>
            <AdminSortableTh sort-key="lastLogin" :current-key="sortKey" :current-dir="sortDir" align="left" @sort="toggleSort('lastLogin')">Último acceso</AdminSortableTh>
            <th v-if="auth.isSuperadmin" class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in paginatedUsers" :key="u.id" class="border-t border-gray-100">
            <td class="py-3 font-medium text-ink">{{ u.name }}</td>
            <td class="text-sm text-ink-muted">{{ u.email }}</td>
            <td><span class="badge" :class="roleBadgeClass(u.role)">{{ roleLabel(u.role) }}</span></td>
            <td>
              <div class="flex flex-wrap gap-1">
                <span v-for="o in (u.observatories || [])" :key="o" class="badge-secondary text-[10px]">{{ o }}</span>
              </div>
            </td>
            <td class="text-xs text-ink-muted">{{ (u.permissions || []).length }} permisos</td>
            <td>
              <span v-if="u.isActive === false" class="badge-alert">Inactivo</span>
              <span v-else class="badge-eco">Activo</span>
            </td>
            <td class="text-xs text-ink-muted">{{ formatDate(u.lastLogin) }}</td>
            <td v-if="auth.isSuperadmin" class="text-right">
              <button class="btn-ghost !p-1" @click="startEdit(u)" aria-label="Editar">
                <Icon name="lucide:pencil" size="16" />
              </button>
              <button class="btn-ghost !p-1 text-alert" @click="remove(u)" aria-label="Eliminar">
                <Icon name="lucide:trash-2" size="16" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <CommonPaginationControls
      v-if="filtered.length > 0"
      v-model:current-page="currentPage"
      :total-pages="totalPages"
      :total-items="filtered.length"
      :per-page="perPage"
    />

    <Teleport to="body">
      <div
        v-if="showForm"
        class="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4"
        @click.self="cancel"
      >
        <div class="card max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
          <header class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-ink">
              {{ editingId ? 'Editar usuario' : 'Nuevo usuario' }}
            </h3>
            <button class="btn-ghost !p-1" @click="cancel"><Icon name="lucide:x" size="18" /></button>
          </header>

          <div class="grid gap-4 md:grid-cols-2">
            <div class="form-group">
              <label class="form-label">Nombre *</label>
              <input v-model="form.name" class="input" placeholder="Nombre completo" />
            </div>
            <div class="form-group">
              <label class="form-label">Correo *</label>
              <input v-model="form.email" type="email" class="input" placeholder="usuario@ejemplo.com" />
            </div>
            <div class="form-group">
              <label class="form-label">
                {{ editingId ? 'Nueva contraseña (vacío = mantener)' : 'Contraseña *' }}
              </label>
              <input v-model="form.password" type="password" class="input" placeholder="********" />
            </div>
            <div class="form-group">
              <label class="form-label">Rol *</label>
              <select v-model="form.role" class="select">
                <option value="editor">Editor</option>
                <option value="reviewer">Revisor</option>
                <option value="admin">Administrador</option>
                <option value="superadmin">Superadmin</option>
              </select>
              <p class="form-hint">
                {{ form.role === 'superadmin'
                  ? 'Acceso total a los tres observatorios y a todas las secciones.'
                  : form.role === 'admin'
                    ? 'Acceso a los observatorios asignados (sin gestión de usuarios).'
                    : form.role === 'reviewer'
                      ? 'Acceso para revisión de aportes.'
                      : 'Acceso limitado según permisos asignados.' }}
              </p>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Observatorios asignados</label>
            <p class="form-hint mb-2">El superadmin no necesita asignación, pero ayuda a documentar su alcance.</p>
            <div class="flex flex-wrap gap-3">
              <label v-for="o in allObservatories" :key="o.slug" class="flex items-center gap-2 text-sm">
                <input type="checkbox" :value="o.slug" v-model="form.observatories" class="checkbox" />
                <span>{{ o.label }}</span>
              </label>
            </div>
          </div>

          <div v-if="form.role !== 'superadmin'" class="form-group">
            <label class="form-label">Permisos</label>
            <p class="form-hint mb-2">Selecciona las secciones a las que tendrá acceso.</p>
            <div class="grid gap-2 sm:grid-cols-2">
              <label v-for="p in allPermissions" :key="p.key" class="flex items-center gap-2 text-sm">
                <input type="checkbox" :value="p.key" v-model="form.permissions" class="checkbox" />
                <span>{{ p.label }}</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" v-model="form.isActive" class="checkbox" />
              <span>Cuenta activa</span>
            </label>
            <p class="form-hint">Las cuentas inactivas no pueden iniciar sesión.</p>
          </div>

          <footer class="flex items-center justify-end gap-2 pt-2">
            <button class="btn-ghost" @click="cancel">Cancelar</button>
            <button class="btn-primary" :disabled="saving" @click="save">
              {{ saving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Crear usuario' }}
            </button>
          </footer>
        </div>
      </div>
    </Teleport>
  </div>
</template>

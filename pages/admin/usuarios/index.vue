<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin', pageTransition: false })

interface AdminUser {
  id: string
  email: string
  name: string
  role: string
  permissions: string[]
  createdAt: string
}

const { apiFetch } = useApi()
const items = ref<AdminUser[]>([])
const loading = ref(true)
const error = ref('')

const load = async () => {
  loading.value = true
  try {
    const res = await apiFetch<{ success: boolean; items: AdminUser[] }>('/admin/usuarios')
    items.value = res.items
  } catch (e: any) {
    error.value = e?.data?.error?.message || 'No se pudieron cargar los usuarios'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="space-y-5">
    <div>
      <h2 class="text-2xl font-semibold text-ink">Usuarios admin</h2>
      <p class="mt-1 text-sm text-ink-muted">Cuentas con acceso al observatorio de arrecifes.</p>
    </div>

    <div v-if="loading" class="text-sm text-ink-muted">Cargando…</div>
    <div v-else-if="error" class="rounded-lg bg-red-50 p-4 text-sm text-red-700">{{ error }}</div>

    <div v-else class="table-container">
      <table class="table-base">
        <thead>
          <tr>
            <th class="text-left">Nombre</th>
            <th class="text-left">Email</th>
            <th class="text-left">Rol</th>
            <th class="text-right">Permisos</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in items" :key="u.id" class="border-t border-gray-100">
            <td class="py-3 font-medium text-ink">{{ u.name }}</td>
            <td class="text-sm text-ink-muted">{{ u.email }}</td>
            <td>
              <span class="badge-secondary">{{ u.role }}</span>
            </td>
            <td class="text-right text-xs text-ink-muted">{{ u.permissions?.length ?? 0 }} permisos</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

import { defineStore } from 'pinia'
import type { AdminRole, AdminPermission } from '~/types'

interface AdminInfo {
  id: string
  email: string
  name: string
  observatories: string[]
  role?: AdminRole
  permissions?: AdminPermission[]
}

const TOKEN_KEY = 'arrecifes-admin-token'
const ADMIN_KEY = 'arrecifes-admin-info'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const admin = ref<AdminInfo | null>(null)
  const isAuthenticated = computed(() => !!token.value)
  const isSuperadmin = computed(() => !admin.value?.role || admin.value.role === 'superadmin')

  const hasPermission = (perm: AdminPermission): boolean => {
    if (!admin.value) return false
    if (!admin.value.role) return true
    if (admin.value.role === 'superadmin') return true
    return admin.value.permissions?.includes(perm) ?? false
  }

  const roleLabel = computed(() => {
    if (!admin.value?.role) return 'Superadmin'
    const labels: Record<string, string> = {
      superadmin: 'Superadmin',
      admin: 'Administrador',
      reviewer: 'Revisor',
      editor: 'Editor',
    }
    return labels[admin.value.role] || admin.value.role
  })

  const loadFromStorage = () => {
    if (import.meta.server) return
    const t = localStorage.getItem(TOKEN_KEY)
    const a = localStorage.getItem(ADMIN_KEY)
    if (t) token.value = t
    if (a) {
      try { admin.value = JSON.parse(a) } catch { /* ignore */ }
    }
  }

  const login = async (email: string, password: string) => {
    const config = useRuntimeConfig()
    const res = await $fetch<{ success: boolean; data: { accessToken: string; refreshToken: string; admin: AdminInfo } }>(
      `${config.public.apiBaseUrl}/observatory/auth/login`,
      { method: 'POST', body: { email, password } },
    )
    if (!res.data.admin.observatories.includes('arrecifes')) {
      throw new Error('Tu cuenta no tiene acceso al observatorio de arrecifes')
    }
    token.value = res.data.accessToken
    admin.value = res.data.admin
    localStorage.setItem(TOKEN_KEY, res.data.accessToken)
    localStorage.setItem(ADMIN_KEY, JSON.stringify(res.data.admin))
  }

  const logout = () => {
    token.value = null
    admin.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(ADMIN_KEY)
    // replace: true → no permite "atrás" al panel después de cerrar sesión
    navigateTo('/admin/login', { replace: true })
  }

  return { token, admin, isAuthenticated, isSuperadmin, roleLabel, hasPermission, login, logout, loadFromStorage }
})

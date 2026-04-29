import type { AdminPermission } from '~/types'

const routePermissions: Record<string, AdminPermission> = {
  '/admin/reefs': 'manage_reefs',
  '/admin/observations': 'review_submissions',
  '/admin/conflicts': 'manage_conflicts',
  '/admin/contributors': 'manage_contributors',
  '/admin/usuarios': 'manage_users',
}

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  auth.loadFromStorage()

  if (to.path.startsWith('/admin') && to.path !== '/admin/login') {
    if (!auth.isAuthenticated) {
      return navigateTo('/admin/login')
    }
    for (const [route, perm] of Object.entries(routePermissions)) {
      if (to.path.startsWith(route) && !auth.hasPermission(perm)) {
        return navigateTo('/admin')
      }
    }
  }
})

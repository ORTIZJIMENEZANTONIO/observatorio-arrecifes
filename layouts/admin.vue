<script setup lang="ts">
const auth = useAuthStore()
if (import.meta.client) auth.loadFromStorage()
const route = useRoute()

const allNavItems = [
  { label: 'Dashboard', to: '/admin', icon: 'lucide:layout-dashboard', exact: true },
  { label: 'Arrecifes', to: '/admin/reefs', icon: 'lucide:waves', perm: 'manage_reefs' as const },
  { label: 'Observaciones', to: '/admin/observations', icon: 'lucide:camera', perm: 'review_submissions' as const },
  { label: 'Atlas', to: '/admin/conflicts', icon: 'lucide:alert-triangle', perm: 'manage_conflicts' as const },
  { label: 'Capas', to: '/admin/layers', icon: 'lucide:layers', perm: 'manage_layers' as const },
  { label: 'Comunidad', to: '/admin/contributors', icon: 'lucide:users', perm: 'manage_contributors' as const },
  { label: 'Escalas', to: '/admin/tiers', icon: 'lucide:medal', perm: 'manage_contributors' as const },
  { label: 'Usuarios', to: '/admin/usuarios', icon: 'lucide:user-cog', perm: 'manage_users' as const },
]

const navItems = computed(() =>
  allNavItems.filter((item) => !item.perm || auth.hasPermission(item.perm)),
)

const isActive = (item: { to: string; exact?: boolean }) => {
  if (item.exact) return route.path === item.to
  return route.path.startsWith(item.to)
}

const sidebarOpen = ref(false)
const isLg = ref(false)

if (import.meta.client) {
  const mql = window.matchMedia('(min-width: 1024px)')
  isLg.value = mql.matches
  sidebarOpen.value = mql.matches
  mql.addEventListener('change', (e) => {
    isLg.value = e.matches
    sidebarOpen.value = e.matches
  })
}
</script>

<template>
  <div class="flex min-h-screen bg-gray-50">
    <aside
      class="fixed inset-y-0 left-0 z-40 flex w-64 flex-shrink-0 flex-col border-r border-gray-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex h-16 items-center gap-2 border-b border-gray-200 px-4">
        <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-sm">
          <Icon name="lucide:waves" size="20" />
        </div>
        <div class="min-w-0">
          <span class="block text-sm font-semibold text-ink">Admin</span>
          <span class="block text-[10px] font-medium uppercase tracking-wider text-primary">Arrecifes · México</span>
        </div>
      </div>

      <nav class="flex-1 space-y-1 px-3 py-4">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200"
          :class="isActive(item)
            ? 'bg-primary-50 text-primary shadow-sm'
            : 'text-gray-600 hover:bg-primary-50/50 hover:text-primary'"
          @click="!isLg && (sidebarOpen = false)"
        >
          <Icon :name="item.icon" size="18" class="shrink-0" />
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="border-t border-gray-200 p-4">
        <div class="mb-3 flex items-center gap-2">
          <div class="flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary">
            <ClientOnly>
              {{ auth.admin?.name?.charAt(0)?.toUpperCase() || auth.admin?.email?.charAt(0)?.toUpperCase() || 'A' }}
              <template #fallback>A</template>
            </ClientOnly>
          </div>
          <div class="min-w-0 flex-1">
            <ClientOnly>
              <p v-if="auth.admin?.name" class="truncate text-xs font-medium text-ink">{{ auth.admin.name }}</p>
              <div class="flex items-center gap-1.5">
                <p class="truncate text-xs text-gray-500">{{ auth.admin?.email }}</p>
                <span class="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold" :class="auth.isSuperadmin ? 'bg-primary-50 text-primary' : 'bg-coral/10 text-coral-dark'">
                  {{ auth.roleLabel }}
                </span>
              </div>
              <template #fallback><div class="h-4 w-24 rounded bg-gray-100" /></template>
            </ClientOnly>
          </div>
        </div>
        <NuxtLink
          to="/"
          class="mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
        >
          <Icon name="lucide:external-link" size="14" />
          Ver sitio público
        </NuxtLink>
        <button
          class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
          @click="auth.logout()"
        >
          <Icon name="lucide:log-out" size="14" />
          Cerrar sesión
        </button>
      </div>
    </aside>

    <Transition name="fade">
      <div v-if="sidebarOpen && !isLg" class="fixed inset-0 z-30 bg-black/20" @click="sidebarOpen = false" />
    </Transition>

    <div class="flex min-w-0 flex-1 flex-col">
      <header class="sticky top-0 z-20 flex h-16 flex-shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-4 lg:px-6">
        <button
          class="flex-shrink-0 rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          @click="sidebarOpen = !sidebarOpen"
          aria-label="Abrir menú"
        >
          <Icon name="lucide:menu" size="20" />
        </button>
        <h1 class="min-w-0 truncate text-sm font-semibold text-ink sm:text-lg">Observatorio de Arrecifes — Admin</h1>
      </header>
      <main class="flex-1 overflow-x-hidden p-4 lg:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

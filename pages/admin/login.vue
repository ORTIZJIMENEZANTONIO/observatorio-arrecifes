<script setup lang="ts">
definePageMeta({ layout: 'default' })

const auth = useAuthStore()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  error.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    navigateTo('/admin')
  } catch (e: any) {
    error.value = e?.data?.error?.message || e?.message || 'Error al iniciar sesión'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  auth.loadFromStorage()
  if (auth.isAuthenticated) navigateTo('/admin')
})
</script>

<template>
  <div class="relative flex min-h-[80vh] items-center justify-center overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-br from-primary-50/60 via-surface to-secondary/5" />
    <div class="absolute inset-0 opacity-[0.03]" style="background-image: radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0); background-size: 32px 32px;" />

    <div class="relative z-10 w-full max-w-md px-4 animate-fade-in">
      <div class="card p-5 sm:p-8">
        <div class="mb-6 text-center">
          <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/20">
            <Icon name="lucide:waves" size="28" />
          </div>
          <h1 class="text-xl font-semibold text-ink">Panel de administración</h1>
          <p class="mt-1 text-sm text-ink-muted">Observatorio de Arrecifes — México</p>
        </div>

        <form class="space-y-4" @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="email" class="form-label">Correo electrónico</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              autocomplete="email"
              class="input w-full"
              placeholder="admin@observatorio.cdmx"
            />
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Contraseña</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              autocomplete="current-password"
              class="input w-full"
              placeholder="········"
            />
          </div>

          <Transition name="slide-up">
            <div v-if="error" class="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <Icon name="lucide:alert-triangle" size="16" />
              {{ error }}
            </div>
          </Transition>

          <button type="submit" :disabled="loading" class="btn-primary w-full justify-center">
            <Icon v-if="loading" name="lucide:loader-2" size="16" class="animate-spin-smooth" />
            {{ loading ? 'Ingresando…' : 'Iniciar sesión' }}
          </button>
        </form>

        <p class="mt-6 text-center text-xs text-gray-400">
          Acceso restringido a administradores del IPN-CIIEMAD y revisores autorizados.
        </p>
      </div>
    </div>
  </div>
</template>

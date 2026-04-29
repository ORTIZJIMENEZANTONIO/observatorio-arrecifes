<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin', pageTransition: false })

interface Summary {
  observatory: string
  content: { reefs: number; conflicts: number; contributors: number }
  observations: { pending: number; in_review: number; validated: number; rejected: number; needs_more_info: number }
  reefsByStatus: Record<string, number>
}

const { apiFetch } = useApi()
const summary = ref<Summary | null>(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const res = await apiFetch<{ success: boolean; data: Summary }>('/admin/summary')
    summary.value = res.data
  } catch (e: any) {
    error.value = e?.data?.error?.message || 'No se pudo cargar el resumen'
  } finally {
    loading.value = false
  }
})

const cards = computed(() => {
  if (!summary.value) return []
  const { content, observations } = summary.value
  return [
    { label: 'Arrecifes', value: content.reefs, icon: 'lucide:waves', tone: 'primary', to: '/admin/reefs' },
    { label: 'Aportes pendientes', value: observations.pending + observations.in_review, icon: 'lucide:inbox', tone: 'coral', to: '/admin/observations' },
    { label: 'Aportes validados', value: observations.validated, icon: 'lucide:check-circle-2', tone: 'eco', to: '/admin/observations?status=validated' },
    { label: 'Conflictos', value: content.conflicts, icon: 'lucide:alert-triangle', tone: 'accent', to: '/admin/conflicts' },
    { label: 'Colaboradores', value: content.contributors, icon: 'lucide:users', tone: 'primary', to: '/admin/contributors' },
  ]
})

const toneClass = (tone: string) => ({
  primary: 'bg-primary/10 text-primary',
  coral: 'bg-coral/10 text-coral-dark',
  eco: 'bg-eco/10 text-eco-dark',
  accent: 'bg-accent/10 text-accent',
}[tone] || 'bg-gray-100 text-gray-700')
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-semibold text-ink">Resumen del observatorio</h2>
      <p class="mt-1 text-sm text-ink-muted">Estado de los datos en vivo, aportes ciudadanos y arrecifes monitoreados.</p>
    </div>

    <div v-if="loading" class="text-sm text-ink-muted">Cargando…</div>
    <div v-else-if="error" class="rounded-lg bg-red-50 p-4 text-sm text-red-700">{{ error }}</div>

    <div v-else-if="summary" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <NuxtLink
        v-for="c in cards"
        :key="c.label"
        :to="c.to"
        class="card-interactive flex flex-col gap-3 p-5"
      >
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl" :class="toneClass(c.tone)">
            <Icon :name="c.icon" size="20" />
          </div>
          <span class="text-xs font-medium uppercase tracking-wider text-ink-muted">{{ c.label }}</span>
        </div>
        <span class="text-3xl font-bold text-ink">{{ c.value.toLocaleString('es-MX') }}</span>
      </NuxtLink>
    </div>

    <div v-if="summary" class="card p-5">
      <h3 class="mb-4 text-sm font-semibold uppercase tracking-wider text-ink-muted">Arrecifes por estado</h3>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="(count, status) in summary.reefsByStatus"
          :key="status"
          class="badge-secondary"
        >
          {{ status }}: <strong class="ml-1">{{ count }}</strong>
        </span>
      </div>
    </div>

    <div v-if="summary" class="card p-5">
      <h3 class="mb-4 text-sm font-semibold uppercase tracking-wider text-ink-muted">Cola de revisión</h3>
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div v-for="(count, status) in summary.observations" :key="status" class="rounded-lg border border-gray-100 p-3">
          <p class="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">{{ status }}</p>
          <p class="mt-1 text-2xl font-bold text-ink">{{ count }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

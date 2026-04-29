<script setup lang="ts">
import type { SocioEnvironmentalConflict } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'admin', pageTransition: false })

const { apiFetch } = useApi()
const items = ref<SocioEnvironmentalConflict[]>([])
const loading = ref(true)
const error = ref('')

const load = async () => {
  loading.value = true
  try {
    const res = await apiFetch<{ success: boolean; items: SocioEnvironmentalConflict[] }>('/admin/conflicts?limit=100')
    items.value = res.items
  } catch (e: any) {
    error.value = e?.data?.error?.message || 'No se pudieron cargar los conflictos'
  } finally {
    loading.value = false
  }
}

const toggle = async (c: SocioEnvironmentalConflict, key: 'visible' | 'archived') => {
  const next = !((c as any)[key] ?? (key === 'visible'))
  await apiFetch(`/admin/conflicts/${c.id}`, { method: 'PATCH', body: { [key]: next } })
  ;(c as any)[key] = next
}

const intensityClass: Record<string, string> = {
  low: 'badge-secondary',
  medium: 'badge-accent',
  high: 'badge-coral',
  critical: 'badge-alert',
}

onMounted(load)
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 class="text-2xl font-semibold text-ink">Atlas de conflictos</h2>
        <p class="mt-1 text-sm text-ink-muted">Casos socioambientales documentados.</p>
      </div>
      <button class="btn-outline" @click="load">
        <Icon name="lucide:refresh-cw" size="14" />
        Refrescar
      </button>
    </div>

    <div v-if="loading" class="text-sm text-ink-muted">Cargando…</div>
    <div v-else-if="error" class="rounded-lg bg-red-50 p-4 text-sm text-red-700">{{ error }}</div>

    <div v-else class="space-y-3">
      <article v-for="c in items" :key="c.id" class="card flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
        <div class="min-w-0 flex-1">
          <div class="mb-1 flex flex-wrap items-center gap-2">
            <span :class="intensityClass[c.intensity] || 'badge-secondary'">{{ c.intensity }}</span>
            <span class="badge-secondary">{{ c.status }}</span>
            <span class="text-xs text-ink-muted">{{ c.state }}</span>
          </div>
          <h3 class="font-semibold text-ink">{{ c.title }}</h3>
          <p class="mt-1 line-clamp-2 text-sm text-ink-muted">{{ c.summary }}</p>
        </div>
        <div class="flex shrink-0 gap-2">
          <button
            class="rounded-full px-3 py-1 text-xs font-semibold"
            :class="(c.visible ?? true) ? 'bg-eco/10 text-eco-dark' : 'bg-gray-100 text-gray-500'"
            @click="toggle(c, 'visible')"
          >
            {{ (c.visible ?? true) ? 'Visible' : 'Oculto' }}
          </button>
          <button
            class="rounded-full px-3 py-1 text-xs font-semibold"
            :class="(c.archived ?? false) ? 'bg-coral/10 text-coral-dark' : 'bg-gray-100 text-gray-500'"
            @click="toggle(c, 'archived')"
          >
            {{ (c.archived ?? false) ? 'Archivado' : 'Activo' }}
          </button>
        </div>
      </article>
    </div>
  </div>
</template>

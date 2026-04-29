<script setup lang="ts">
import type { Contributor } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'admin', pageTransition: false })

const { apiFetch } = useApi()
const items = ref<Contributor[]>([])
const loading = ref(true)
const error = ref('')

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

const toggleVerified = async (c: Contributor) => {
  const next = !c.verified
  await apiFetch(`/admin/contributors/${c.id}`, { method: 'PATCH', body: { verified: next } })
  c.verified = next
}

onMounted(load)
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 class="text-2xl font-semibold text-ink">Comunidad</h2>
        <p class="mt-1 text-sm text-ink-muted">Red de colaboradores con sus puntajes de reputación.</p>
      </div>
      <button class="btn-outline" @click="load">
        <Icon name="lucide:refresh-cw" size="14" />
        Refrescar
      </button>
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
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in items" :key="c.id" class="border-t border-gray-100 hover:bg-gray-50/50">
            <td class="py-3">
              <p class="font-medium text-ink">{{ c.displayName }}</p>
              <p class="text-xs text-ink-muted">@{{ c.handle }} · {{ c.affiliation || '—' }}</p>
            </td>
            <td class="text-sm text-ink-muted">{{ c.role }}</td>
            <td>
              <span :class="tierClass[c.tier] || 'badge-secondary'">{{ c.tier }}</span>
            </td>
            <td class="text-right font-mono text-sm text-ink">{{ c.reputationScore }}</td>
            <td class="text-right font-mono text-sm text-ink">{{ c.validatedContributions }}</td>
            <td class="text-right font-mono text-sm text-ink">{{ Math.round(Number(c.averageQuality)) }}</td>
            <td class="text-center">
              <button
                class="rounded-full px-2 py-1 text-xs font-semibold"
                :class="c.verified ? 'bg-eco/10 text-eco-dark' : 'bg-gray-100 text-gray-500'"
                @click="toggleVerified(c)"
              >
                {{ c.verified ? 'Sí' : 'No' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

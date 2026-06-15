<template>
  <div>
    <CommonHeroSection compact :eyebrow="hero?.eyebrow" :title="hero?.title" :subtitle="hero?.subtitle" />

    <section class="section-padding-sm">
      <div class="container-wide space-y-6">
        <!-- Filtros -->
        <div class="card p-4 md:p-5">
          <div class="grid gap-3 md:grid-cols-2">
            <div class="form-group">
              <label class="form-label">Tipo de evento</label>
              <select v-model="filterType" class="select">
                <option value="all">Todos los tipos</option>
                <option value="monitoring">Monitoreo</option>
                <option value="training">Capacitación</option>
                <option value="restoration">Restauración</option>
                <option value="cleanup">Limpieza</option>
                <option value="tournament">Torneo (control)</option>
                <option value="workshop">Taller</option>
                <option value="science_fair">Feria científica</option>
                <option value="public_event">Evento público</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Buscar</label>
              <input v-model="search" type="text" class="input" placeholder="Cozumel, sargazo, restauración..." />
            </div>
          </div>
        </div>

        <!-- Lista de eventos -->
        <div v-if="upcoming.length" class="space-y-3">
          <article v-for="ev in upcoming" :key="ev.id" class="card p-5">
            <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div class="flex gap-4">
                <div class="text-center">
                  <p class="text-[11px] font-medium uppercase tracking-wider text-coral-dark">{{ monthShort(ev.startDate) }}</p>
                  <p class="font-display text-3xl font-bold text-ink">{{ day(ev.startDate) }}</p>
                </div>
                <div>
                  <span class="badge-secondary text-[11px]">{{ formatCampaignType(ev.type) }}</span>
                  <h3 class="mt-2 font-display text-base font-bold text-ink">{{ ev.title }}</h3>
                  <p class="mt-1 text-sm text-slate-custom">{{ ev.description }}</p>
                  <div class="mt-2 flex flex-wrap items-center gap-3 text-xs text-ink-muted">
                    <span class="inline-flex items-center gap-1"><Icon name="lucide:map-pin" size="14" /> {{ ev.location }}</span>
                    <span class="inline-flex items-center gap-1"><Icon name="lucide:users" size="14" /> {{ ev.organizer }}</span>
                    <span v-if="ev.cost" class="inline-flex items-center gap-1"><Icon name="lucide:tag" size="14" /> {{ ev.cost }}</span>
                  </div>
                </div>
              </div>
              <div class="flex shrink-0 flex-col items-start gap-2 md:items-end">
                <a v-if="ev.registrationUrl" :href="ev.registrationUrl" target="_blank" rel="noopener" class="btn-outline btn-sm" :data-track="`calendar-${ev.id}`">
                  Inscribirme <Icon name="lucide:arrow-up-right" size="14" />
                </a>
                <p v-if="ev.endDate" class="text-xs text-ink-muted">Hasta {{ formatDate(ev.endDate) }}</p>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="card p-10 text-center">
          <Icon name="lucide:calendar-x" size="32" class="mx-auto text-ink-muted" />
          <p class="mt-3 font-semibold text-ink">Sin eventos próximos con esos filtros</p>
        </div>

        <article v-if="past.length" class="card p-5 bg-surface-cool">
          <p class="text-xs font-medium uppercase tracking-wider text-ink-muted">{{ past.length }} evento{{ past.length === 1 ? '' : 's' }} pasado{{ past.length === 1 ? '' : 's' }}</p>
          <p class="mt-2 text-sm text-slate-custom">El histórico se mostrará al cerrar el piloto.</p>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { campaignEvents } from '~/data/campaign-events'
import type { CampaignType } from '~/types'

const cms = useCmsContent('calendario')
const hero = cms.one<{ eyebrow: string; title: string; subtitle: string }>('hero')

const { formatCampaignType, formatDate } = useFormatters()

const search = ref('')
const filterType = ref<'all' | CampaignType>('all')

const now = new Date()

const visible = computed(() => campaignEvents.filter((e) => e.visible !== false))

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return visible.value
    .filter((e) => (q ? `${e.title} ${e.description} ${e.location}`.toLowerCase().includes(q) : true))
    .filter((e) => filterType.value === 'all' || e.type === filterType.value)
})

const upcoming = computed(() =>
  filtered.value
    .filter((e) => new Date(e.startDate).getTime() >= now.getTime())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()),
)
const past = computed(() => filtered.value.filter((e) => new Date(e.startDate).getTime() < now.getTime()))

const monthShort = (iso: string) =>
  new Intl.DateTimeFormat('es-MX', { month: 'short' }).format(new Date(iso))
const day = (iso: string) => new Date(iso).getDate()

useHead({ title: 'Calendario · Observatorio de Arrecifes' })
</script>

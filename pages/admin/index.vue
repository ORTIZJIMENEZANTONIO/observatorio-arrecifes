<script setup lang="ts">
import AdminManual from '~/components/admin/Manual.vue'
import { GLOSSARY } from '~/data/admin-glossary'

definePageMeta({ layout: 'admin', middleware: 'admin', pageTransition: false })

interface Summary {
  observatory?: string
  content?: Partial<Record<string, number>>
  totals?: Partial<Record<string, number>>
  observations?: Partial<{ pending: number; in_review: number; validated: number; rejected: number; needs_more_info: number }>
  reefsByStatus?: Record<string, number>
  contributorsByTier?: Record<string, number>
  contributorsVerified?: number
  alertsByLevel?: Record<string, number>
  alertsCritical?: number
  latestAlertAt?: string | null
  coastalIntrusions?: Record<string, number>
  layersByKind?: Record<string, number>
  newsProspects?: { total: number; pending: number }
  snapshots?: { total: number; lastCapturedAt: string | null }
  climate?: { reefsWithData: number; reefsTotal: number }
}

const { apiFetch } = useApi()
const summary = ref<Summary | null>(null)
const loading = ref(true)
const error = ref('')
const auth = useAuthStore()

const num = (v: unknown): number => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await apiFetch<{ success: boolean; data: Summary }>('/admin/summary')
    summary.value = res.data ?? null
  } catch (e: any) {
    error.value = e?.data?.error?.message || 'No se pudo cargar el resumen'
  } finally {
    loading.value = false
  }
}

onMounted(load)

const content = computed(() => summary.value?.content ?? {})
const totals = computed(() => summary.value?.totals ?? {})
const observations = computed(() => summary.value?.observations ?? {})
const reefsByStatus = computed(() => summary.value?.reefsByStatus ?? {})
const contributorsByTier = computed(() => summary.value?.contributorsByTier ?? {})
const alertsByLevel = computed(() => summary.value?.alertsByLevel ?? {})
const intrusions = computed(() => summary.value?.coastalIntrusions ?? {})
const layersByKind = computed(() => summary.value?.layersByKind ?? {})
const climate = computed(() => summary.value?.climate ?? { reefsWithData: 0, reefsTotal: 12 })
const snapshotsInfo = computed(() => summary.value?.snapshots ?? { total: 0, lastCapturedAt: null })
const prospects = computed(() => summary.value?.newsProspects ?? { total: 0, pending: 0 })

// KPI cards de la franja superior. Cada card lleva tooltip explicativo.
const kpis = computed(() => {
  if (!summary.value) return []
  const c = content.value
  const t = totals.value
  const o = observations.value
  return [
    {
      label: 'Arrecifes públicos',
      tip: 'Arrecifes visibles en el sitio público. El total incluye los archivados/ocultos para auditoría.',
      value: num(c.reefs),
      total: num(t.reefs),
      icon: 'lucide:waves',
      tone: 'primary',
      to: '/admin/reefs',
    },
    {
      label: 'Aportes pendientes',
      tip: 'Observaciones ciudadanas en cola de revisión: status `pending` + `in_review`. Necesitan que un revisor las valide o rechace.',
      value: num(o.pending) + num(o.in_review),
      total: null,
      icon: 'lucide:inbox',
      tone: 'coral',
      to: '/admin/observations',
    },
    {
      label: 'Aportes validados',
      tip: 'Aportes ya revisados y publicados — suman puntos a la reputación de su autor y aparecen en /observations.',
      value: num(o.validated),
      total: null,
      icon: 'lucide:check-circle-2',
      tone: 'eco',
      to: '/admin/observations?status=validated',
    },
    {
      label: 'Conflictos públicos',
      tip: 'Casos socioambientales visibles en /atlas (quién impulsa, quién resiste, qué arrecifes/comunidades se afectan).',
      value: num(c.conflicts),
      total: num(t.conflicts),
      icon: 'lucide:alert-triangle',
      tone: 'accent',
      to: '/admin/conflicts',
    },
    {
      label: 'Colaboradores',
      tip: 'Personas registradas en la red (público + ocultos). Cada uno tiene un modo de participación asignado automáticamente.',
      value: num(c.contributors),
      total: num(t.contributors),
      icon: 'lucide:users',
      tone: 'primary',
      to: '/admin/contributors',
    },
    {
      label: 'Capas de datos',
      tip: 'Catálogo de capas geoespaciales abiertas (NOAA, NASA, CONABIO, etc.). Las capas activas aparecen en el mapa.',
      value: num(c.layers),
      total: num(t.layers),
      icon: 'lucide:layers',
      tone: 'primary',
      to: '/admin/layers',
    },
    {
      label: 'Alertas críticas',
      tip: 'Alertas con DHW ≥ 4 (blanqueamiento probable). Se calcula sobre todo el histórico — no sólo las activas.',
      value: num(summary.value.alertsCritical),
      total: null,
      icon: 'lucide:flame',
      tone: 'coral',
      to: '/admin/alerts',
    },
    {
      label: 'Noticias publicadas',
      tip: 'Artículos editoriales visibles en /noticias. La cola de prospectos del scraper alimenta la creación de nuevos.',
      value: num(c.news),
      total: num(t.news),
      icon: 'lucide:newspaper',
      tone: 'eco',
      to: '/admin/news',
    },
  ]
})

const toneClass = (tone: string) => ({
  primary: 'bg-primary/10 text-primary',
  coral: 'bg-coral/10 text-coral-dark',
  eco: 'bg-eco/10 text-eco-dark',
  accent: 'bg-accent/10 text-accent',
}[tone] || 'bg-gray-100 text-gray-700')

// Etiquetas amigables por status de observación, alerta, intrusión, etc.
const observationStatusLabel: Record<string, string> = {
  pending: 'Pendiente',
  in_review: 'En revisión',
  validated: 'Validado',
  rejected: 'Rechazado',
  needs_more_info: 'Falta info',
}
const reefStatusLabel: Record<string, string> = {
  healthy: 'Saludable',
  watch: 'Vigilancia',
  warning: 'Advertencia',
  alert: 'Alerta',
  bleaching: 'Blanqueamiento',
  mortality: 'Mortalidad',
}
const alertLevelLabel: Record<string, string> = {
  no_stress: 'Sin estrés',
  watch: 'Vigilancia',
  warning: 'Advertencia',
  alert_1: 'Alerta 1',
  alert_2: 'Alerta 2',
}
const intrusionStatusLabel: Record<string, string> = {
  candidate: 'Candidatas',
  verified: 'Verificadas',
  escalated: 'Escaladas',
  dismissed: 'Descartadas',
}
const tierLabel: Record<string, string> = {
  bronze: 'Curiosidad ciudadana',
  silver: 'Conocimiento del mar',
  gold: 'Trabajo en agua',
  platinum: 'Investigación formal',
  coral: 'Síntesis y curaduría',
}

const formatDateRel = (iso: string | null | undefined): string => {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000)
  if (days === 0) return 'hoy'
  if (days === 1) return 'ayer'
  if (days < 7) return `hace ${days} días`
  if (days < 30) return `hace ${Math.floor(days / 7)} sem`
  return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Quick actions: ejecutar acciones comunes desde el dashboard.
const capturing = ref(false)
const captureMsg = ref('')
const captureSnapshot = async () => {
  capturing.value = true
  captureMsg.value = ''
  try {
    const res = await apiFetch<{ success: boolean; data: { count: number; capturedAt: string } }>(
      '/admin/reefs/snapshot',
      { method: 'POST' },
    )
    captureMsg.value = `${res.data.count} snapshots capturados (${res.data.capturedAt}).`
    await load()
    setTimeout(() => { captureMsg.value = '' }, 4000)
  } catch (e: any) {
    error.value = e?.data?.error?.message || 'No se pudo capturar el snapshot'
  } finally {
    capturing.value = false
  }
}

const refreshingClimate = ref(false)
const climateMsg = ref('')
const refreshClimate = async () => {
  if (!confirm('Refrescar climatología NASA POWER de los 12 arrecifes (~5s, una llamada por arrecife). ¿Continuar?')) return
  refreshingClimate.value = true
  climateMsg.value = ''
  try {
    const res = await apiFetch<{ success: boolean; data: { ok: number; failed: number } }>(
      '/admin/reefs/refresh-climate',
      { method: 'POST' },
    )
    climateMsg.value = `Climatología actualizada: ${res.data.ok} OK, ${res.data.failed} fallidos.`
    await load()
    setTimeout(() => { climateMsg.value = '' }, 5000)
  } catch (e: any) {
    error.value = e?.data?.error?.message || 'No se pudo refrescar la climatología'
  } finally {
    refreshingClimate.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 class="text-2xl font-semibold text-ink">Resumen del observatorio</h2>
        <p class="mt-1 text-sm text-ink-muted">
          Hola
          <ClientOnly>
            <span v-if="auth.admin?.name" class="font-medium text-ink">{{ auth.admin.name }}</span>
            <template #fallback>—</template>
          </ClientOnly>.
          Estado actual de datos, aportes ciudadanos y monitoreo en vivo.
        </p>
      </div>
      <button class="btn-outline btn-sm" :disabled="loading" @click="load">
        <Icon name="lucide:refresh-cw" size="14" :class="loading ? 'animate-spin' : ''" />
        Refrescar
      </button>
    </header>

    <div v-if="loading && !summary" class="text-sm text-ink-muted">Cargando…</div>
    <div v-if="error" class="rounded-lg bg-red-50 p-4 text-sm text-red-700">{{ error }}</div>

    <!-- ─────────── KPI cards principales ─────────── -->
    <div v-if="summary" class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
      <NuxtLink
        v-for="c in kpis"
        :key="c.label"
        :to="c.to"
        class="card-interactive flex flex-col gap-2 p-4"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-2">
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" :class="toneClass(c.tone)">
              <Icon :name="c.icon" size="18" />
            </div>
            <span class="text-[10px] font-medium uppercase tracking-wider text-ink-muted leading-tight">
              {{ c.label }}
            </span>
          </div>
          <AdminInfoTooltip :text="c.tip" variant="icon" placement="bottom" :size="14" />
        </div>
        <span class="text-3xl font-bold text-ink">{{ Number(c.value).toLocaleString('es-MX') }}</span>
        <span v-if="c.total !== null && c.total !== c.value" class="text-[11px] text-ink-muted">
          {{ c.total.toLocaleString('es-MX') }} en total
          <span class="text-ink-muted/70">({{ c.total - c.value }} ocultos)</span>
        </span>
      </NuxtLink>
    </div>

    <!-- ─────────── Acciones rápidas ─────────── -->
    <div v-if="summary" class="card p-5">
      <h3 class="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-ink-muted">
        Acciones rápidas
        <AdminInfoTooltip
          text="Operaciones del día a día sin tener que entrar a cada subsección. Capturar snapshot guarda el estado de los 12 arrecifes; refrescar climatología pide datos NASA POWER."
          variant="icon"
        />
      </h3>
      <div class="flex flex-wrap gap-2">
        <button class="btn-primary btn-sm" :disabled="capturing" @click="captureSnapshot">
          <Icon
            :name="capturing ? 'lucide:loader-2' : 'lucide:camera'"
            size="14"
            :class="capturing ? 'animate-spin-smooth' : ''"
          />
          <AdminInfoTooltip :text="GLOSSARY.snapshot" variant="inline">
            Capturar snapshot ahora
          </AdminInfoTooltip>
        </button>
        <button class="btn-outline btn-sm" :disabled="refreshingClimate" @click="refreshClimate">
          <Icon
            :name="refreshingClimate ? 'lucide:loader-2' : 'lucide:cloud-sun'"
            size="14"
            :class="refreshingClimate ? 'animate-spin-smooth' : ''"
          />
          <AdminInfoTooltip :text="GLOSSARY.nasaPower" variant="inline">
            Refrescar climatología NASA POWER
          </AdminInfoTooltip>
        </button>
        <NuxtLink to="/admin/coastal-intrusions" class="btn-outline btn-sm">
          <Icon name="lucide:radar" size="14" />
          Detector costero
        </NuxtLink>
        <NuxtLink to="/admin/news" class="btn-outline btn-sm">
          <Icon name="lucide:newspaper" size="14" />
          Cola de prospectos
          <span v-if="prospects.pending > 0" class="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-coral px-1 text-[10px] font-bold text-white">
            {{ prospects.pending }}
          </span>
        </NuxtLink>
        <NuxtLink to="/admin/contenido" class="btn-outline btn-sm">
          <Icon name="lucide:file-text" size="14" />
          Editar contenido
        </NuxtLink>
      </div>
      <p v-if="captureMsg" class="mt-3 rounded-lg border border-eco/20 bg-eco/5 p-2 text-xs text-eco-dark">
        <Icon name="lucide:check-circle" size="12" class="mr-1 inline" />
        {{ captureMsg }}
      </p>
      <p v-if="climateMsg" class="mt-3 rounded-lg border border-eco/20 bg-eco/5 p-2 text-xs text-eco-dark">
        <Icon name="lucide:check-circle" size="12" class="mr-1 inline" />
        {{ climateMsg }}
      </p>
    </div>

    <!-- ─────────── Grid de bloques de monitoreo ─────────── -->
    <div v-if="summary" class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <!-- Cola de revisión -->
      <NuxtLink to="/admin/observations" class="card-interactive p-5">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="flex items-center gap-2 text-sm font-semibold text-ink">
            <Icon name="lucide:inbox" size="16" class="text-coral-dark" />
            <AdminInfoTooltip :text="GLOSSARY.observation" variant="inline">
              Cola de revisión
            </AdminInfoTooltip>
          </h3>
          <span class="text-xs text-ink-muted">Aportes ciudadanos</span>
        </div>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div v-for="(count, status) in observations" :key="status" class="rounded-lg border border-gray-100 p-2.5">
            <p class="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
              {{ observationStatusLabel[status] || status }}
            </p>
            <p class="mt-1 text-xl font-bold text-ink">{{ count }}</p>
          </div>
        </div>
      </NuxtLink>

      <!-- Arrecifes por estado -->
      <NuxtLink to="/admin/reefs" class="card-interactive p-5">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="flex items-center gap-2 text-sm font-semibold text-ink">
            <Icon name="lucide:waves" size="16" class="text-primary" />
            Arrecifes por estatus
          </h3>
          <span class="text-xs text-ink-muted">Salud actual</span>
        </div>
        <div v-if="Object.keys(reefsByStatus).length" class="flex flex-wrap gap-1.5">
          <span
            v-for="(count, status) in reefsByStatus"
            :key="status"
            class="badge-secondary"
          >
            {{ reefStatusLabel[status] || status }}: <strong class="ml-1 tabular-nums">{{ count }}</strong>
          </span>
        </div>
        <p v-else class="text-xs text-ink-muted">Sin datos.</p>
      </NuxtLink>

      <!-- Alertas de blanqueamiento -->
      <NuxtLink to="/admin/alerts" class="card-interactive p-5">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="flex items-center gap-2 text-sm font-semibold text-ink">
            <Icon name="lucide:flame" size="16" class="text-coral" />
            <AdminInfoTooltip :text="GLOSSARY.bleachingAlert" variant="inline">
              Alertas de blanqueamiento
            </AdminInfoTooltip>
          </h3>
          <span class="text-xs text-ink-muted">
            Última: {{ formatDateRel(summary.latestAlertAt) }}
          </span>
        </div>
        <div class="grid grid-cols-5 gap-2">
          <div
            v-for="(count, level) in alertsByLevel"
            :key="level"
            class="rounded-lg border p-2 text-center"
            :class="{
              'border-eco/30 bg-eco/5': level === 'no_stress',
              'border-yellow-200 bg-yellow-50': level === 'watch',
              'border-accent/30 bg-accent/5': level === 'warning',
              'border-coral/30 bg-coral/5': level === 'alert_1',
              'border-alert/40 bg-alert/5': level === 'alert_2',
            }"
          >
            <p class="text-[9px] font-semibold uppercase tracking-wider text-ink-muted">
              {{ alertLevelLabel[level] || level }}
            </p>
            <p class="mt-1 text-lg font-bold text-ink">{{ count }}</p>
          </div>
        </div>
      </NuxtLink>

      <!-- Coastal intrusions -->
      <NuxtLink to="/admin/coastal-intrusions" class="card-interactive p-5">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="flex items-center gap-2 text-sm font-semibold text-ink">
            <Icon name="lucide:radar" size="16" class="text-accent" />
            <AdminInfoTooltip :text="GLOSSARY.coastalIntrusion" variant="inline">
              Detector costero (ZOFEMAT)
            </AdminInfoTooltip>
          </h3>
          <span class="text-xs text-ink-muted">Construcciones detectadas</span>
        </div>
        <div class="grid grid-cols-4 gap-2">
          <div v-for="(count, status) in intrusions" :key="status" class="rounded-lg border border-gray-100 p-2 text-center">
            <p class="text-[9px] font-semibold uppercase tracking-wider text-ink-muted">
              {{ intrusionStatusLabel[status] || status }}
            </p>
            <p class="mt-1 text-lg font-bold text-ink">{{ count }}</p>
          </div>
        </div>
      </NuxtLink>

      <!-- Red de colaboradores por modo -->
      <NuxtLink to="/admin/contributors" class="card-interactive p-5">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="flex items-center gap-2 text-sm font-semibold text-ink">
            <Icon name="lucide:users" size="16" class="text-primary" />
            <AdminInfoTooltip :text="GLOSSARY.tier" variant="inline">
              Red por modo de participación
            </AdminInfoTooltip>
          </h3>
          <span class="text-xs text-ink-muted">
            {{ summary.contributorsVerified ?? 0 }} verificadas
          </span>
        </div>
        <div v-if="Object.keys(contributorsByTier).length" class="space-y-1.5">
          <div
            v-for="(count, tier) in contributorsByTier"
            :key="tier"
            class="flex items-center justify-between text-xs"
          >
            <span class="text-ink">{{ tierLabel[tier] || tier }}</span>
            <span class="font-mono font-semibold text-ink">{{ count }}</span>
          </div>
        </div>
        <p v-else class="text-xs text-ink-muted">Sin colaboradores.</p>
      </NuxtLink>

      <!-- Capas de datos -->
      <NuxtLink to="/admin/layers" class="card-interactive p-5">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="flex items-center gap-2 text-sm font-semibold text-ink">
            <Icon name="lucide:layers" size="16" class="text-primary" />
            <AdminInfoTooltip :text="GLOSSARY.layer" variant="inline">
              Capas de datos
            </AdminInfoTooltip>
          </h3>
          <span class="text-xs text-ink-muted">{{ totals.layers ?? 0 }} en catálogo</span>
        </div>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="rounded-lg border border-gray-100 p-2">
            <p class="text-[10px] uppercase tracking-wider text-ink-muted">
              <AdminInfoTooltip text="Capa que apunta a un servicio externo (NOAA, CONABIO, GEBCO…) — no almacenamos el archivo." variant="inline">
                Externas
              </AdminInfoTooltip>
            </p>
            <p class="mt-1 text-lg font-bold text-ink">{{ layersByKind.external_url ?? 0 }}</p>
          </div>
          <div class="rounded-lg border border-gray-100 p-2">
            <p class="text-[10px] uppercase tracking-wider text-ink-muted">
              <AdminInfoTooltip text="Archivo geoespacial subido localmente (GeoJSON, shapefile zip, GeoTIFF, etc.). Servido desde uploads/layers/." variant="inline">
                Subidas
              </AdminInfoTooltip>
            </p>
            <p class="mt-1 text-lg font-bold text-ink">{{ layersByKind.uploaded_file ?? 0 }}</p>
          </div>
        </div>
      </NuxtLink>

      <!-- Noticias + prospectos -->
      <NuxtLink to="/admin/news" class="card-interactive p-5">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="flex items-center gap-2 text-sm font-semibold text-ink">
            <Icon name="lucide:newspaper" size="16" class="text-eco" />
            <AdminInfoTooltip :text="GLOSSARY.news" variant="inline">
              Noticias
            </AdminInfoTooltip>
          </h3>
          <span v-if="prospects.pending > 0" class="badge-coral">
            {{ prospects.pending }} prospecto(s)
          </span>
        </div>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="rounded-lg border border-gray-100 p-2">
            <p class="text-[10px] uppercase tracking-wider text-ink-muted">Publicadas</p>
            <p class="mt-1 text-lg font-bold text-ink">{{ content.news ?? 0 }}</p>
          </div>
          <div class="rounded-lg border border-gray-100 p-2">
            <p class="text-[10px] uppercase tracking-wider text-ink-muted">
              <AdminInfoTooltip :text="GLOSSARY.prospect" variant="inline">
                Prospectos
              </AdminInfoTooltip>
            </p>
            <p class="mt-1 text-lg font-bold text-ink">{{ prospects.total ?? 0 }}</p>
          </div>
        </div>
      </NuxtLink>

      <!-- Snapshots / climatología -->
      <NuxtLink to="/admin/analytics" class="card-interactive p-5">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="flex items-center gap-2 text-sm font-semibold text-ink">
            <Icon name="lucide:camera" size="16" class="text-primary" />
            <AdminInfoTooltip :text="GLOSSARY.snapshot" variant="inline">
              Snapshots históricos
            </AdminInfoTooltip>
          </h3>
          <span class="text-xs text-ink-muted">
            Última: {{ formatDateRel(snapshotsInfo.lastCapturedAt) }}
          </span>
        </div>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="rounded-lg border border-gray-100 p-2">
            <p class="text-[10px] uppercase tracking-wider text-ink-muted">Total capturas</p>
            <p class="mt-1 text-lg font-bold text-ink">
              {{ Number(snapshotsInfo.total ?? 0).toLocaleString('es-MX') }}
            </p>
          </div>
          <div class="rounded-lg border border-gray-100 p-2">
            <p class="text-[10px] uppercase tracking-wider text-ink-muted">
              <AdminInfoTooltip :text="GLOSSARY.nasaPower" variant="inline">
                NASA POWER
              </AdminInfoTooltip>
            </p>
            <p class="mt-1 text-lg font-bold text-ink">
              {{ climate.reefsWithData ?? 0 }} / {{ climate.reefsTotal ?? 12 }}
            </p>
          </div>
        </div>
      </NuxtLink>

      <!-- CMS -->
      <NuxtLink to="/admin/contenido" class="card-interactive p-5">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="flex items-center gap-2 text-sm font-semibold text-ink">
            <Icon name="lucide:file-text" size="16" class="text-primary" />
            <AdminInfoTooltip :text="GLOSSARY.cms" variant="inline">
              Contenido editorial (CMS)
            </AdminInfoTooltip>
          </h3>
          <span class="text-xs text-ink-muted">{{ totals.cmsSections ?? 0 }} secciones</span>
        </div>
        <p class="text-xs text-ink-muted">
          {{ totals.cmsSections ?? 0 }} bloques editables sembrados (home/about/contribute/footer/heros).
          Edita el copy del sitio público sin tocar código.
        </p>
      </NuxtLink>
    </div>

    <!-- ══════════════════════════════════════════════════════════════ -->
    <!--    MANUAL DEL OBSERVATORIO — explicación de tecnologías        -->
    <!-- ══════════════════════════════════════════════════════════════ -->
    <AdminManual />
  </div>
</template>

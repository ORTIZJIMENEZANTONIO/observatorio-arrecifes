<template>
  <div>
    <CommonHeroSection compact :eyebrow="hero?.eyebrow" :title="hero?.title" :subtitle="hero?.subtitle" />

    <section class="section-padding-sm">
      <div class="container-wide space-y-6">
        <NuxtLink to="/salud" class="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-primary">
          <Icon name="lucide:chevron-left" size="14" /> Salud del arrecife
        </NuxtLink>

        <!-- KPIs IUCN -->
        <div class="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <div v-for="k in kpis" :key="k.label" class="kpi-card">
            <div :class="['flex h-9 w-9 items-center justify-center rounded-lg', kpiIconBg(k.color)]">
              <Icon :name="k.icon" size="18" :class="kpiColor(k.color)" />
            </div>
            <p class="mt-2 text-2xl font-bold text-ink">{{ k.value }}</p>
            <p class="text-xs font-medium uppercase tracking-wider text-ink-muted">{{ k.label }}</p>
          </div>
        </div>

        <!-- Filtros -->
        <div class="card p-4 md:p-5">
          <div class="grid gap-3 md:grid-cols-4">
            <div class="form-group md:col-span-2">
              <label class="form-label">Buscar especie</label>
              <input v-model="search" type="text" class="input" placeholder="Acropora, mero, tortuga..." />
            </div>
            <div class="form-group">
              <label class="form-label">Grupo</label>
              <select v-model="filterKingdom" class="select">
                <option value="all">Todos</option>
                <option value="cnidaria">Corales / cnidarios</option>
                <option value="fish">Peces</option>
                <option value="reptile">Reptiles</option>
                <option value="echinoderm">Equinodermos</option>
                <option value="mammal">Mamíferos</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Estatus IUCN</label>
              <select v-model="filterIucn" class="select">
                <option value="all">Cualquiera</option>
                <option value="CR">En peligro crítico</option>
                <option value="EN">En peligro</option>
                <option value="VU">Vulnerable</option>
                <option value="NT">Casi amenazada</option>
                <option value="LC">Preocupación menor</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Grid -->
        <div v-if="filtered.length" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <article v-for="sp in filtered" :key="sp.id" class="card-interactive p-5">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-display text-base font-semibold italic text-ink">{{ sp.scientificName }}</p>
                <p class="text-sm text-slate-custom">{{ sp.commonName }}</p>
              </div>
              <div :class="['flex h-9 w-9 items-center justify-center rounded-lg', kpiIconBg(kingdomBg(sp.kingdom))]">
                <Icon :name="kingdomIcon(sp.kingdom)" size="18" :class="kpiColor(kingdomBg(sp.kingdom))" />
              </div>
            </div>

            <div class="mt-3 flex flex-wrap gap-1.5">
              <span :class="['badge-primary text-[11px]', iucnBadgeClass(sp.iucnStatus)]">
                IUCN: {{ sp.iucnStatus }} · {{ formatIucn(sp.iucnStatus) }}
              </span>
              <span v-if="sp.nom059Status !== 'none'" class="badge-coral text-[11px]">
                NOM-059: {{ formatNom059(sp.nom059Status) }}
              </span>
              <span v-if="sp.isKeystone" class="badge-eco text-[11px]">Clave</span>
              <span v-if="sp.endemic" class="badge-accent text-[11px]">Endémica</span>
            </div>

            <p class="mt-3 text-sm text-slate-custom">{{ sp.description }}</p>

            <div class="mt-3 space-y-1 text-xs">
              <p><span class="font-medium text-ink-muted">Hábitat:</span> {{ sp.habitat }}</p>
              <p v-if="sp.depthRange"><span class="font-medium text-ink-muted">Profundidad:</span> {{ sp.depthRange[0] }}–{{ sp.depthRange[1] }} m</p>
            </div>

            <p v-if="sp.reefIds.length" class="mt-3 text-xs text-ink-muted">
              Documentada en {{ sp.reefIds.length }} arrecifes
            </p>
          </article>
        </div>

        <div v-else class="card p-10 text-center">
          <Icon name="lucide:search-x" size="32" class="mx-auto text-ink-muted" />
          <p class="mt-3 font-semibold text-ink">Sin resultados</p>
          <p class="text-sm text-ink-muted">Prueba ampliar los filtros.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { species } from '~/data/species'
import type { IucnStatus, SpeciesKingdom } from '~/types'

const cms = useCmsContent('salud-especies')
const hero = cms.one<{ eyebrow: string; title: string; subtitle: string }>('hero')

const {
  formatIucn,
  iucnBadgeClass,
  formatNom059,
  kingdomIcon,
  kpiColor,
  kpiIconBg,
} = useFormatters()

const search = ref('')
const filterKingdom = ref<'all' | SpeciesKingdom>('all')
const filterIucn = ref<'all' | IucnStatus>('all')

const visible = computed(() => species.filter((s) => (s.visible ?? true) && !s.archived))

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return visible.value.filter((s) => {
    if (q && !`${s.scientificName} ${s.commonName}`.toLowerCase().includes(q)) return false
    if (filterKingdom.value !== 'all' && s.kingdom !== filterKingdom.value) return false
    if (filterIucn.value !== 'all' && s.iucnStatus !== filterIucn.value) return false
    return true
  })
})

const kingdomBg = (k: SpeciesKingdom): string => ({
  cnidaria: 'coral',
  fish: 'secondary',
  reptile: 'eco',
  echinoderm: 'accent',
  mammal: 'primary',
  crustacean: 'accent',
  mollusk: 'secondary',
  algae: 'eco',
  plant: 'eco',
}[k] ?? 'primary')

const critical = computed(() => visible.value.filter((s) => s.iucnStatus === 'CR').length)
const endangered = computed(() => visible.value.filter((s) => s.iucnStatus === 'EN').length)
const keystone = computed(() => visible.value.filter((s) => s.isKeystone).length)

const kpis = computed(() => [
  { label: 'Especies catalogadas', value: String(visible.value.length), icon: 'lucide:list', color: 'primary' },
  { label: 'En peligro crítico (CR)', value: String(critical.value), icon: 'lucide:alert-octagon', color: 'alert' },
  { label: 'En peligro (EN)', value: String(endangered.value), icon: 'lucide:alert-triangle', color: 'coral' },
  { label: 'Especies clave', value: String(keystone.value), icon: 'lucide:key', color: 'eco' },
])

useHead({ title: 'Especies · Salud del arrecife · Observatorio de Arrecifes' })
</script>

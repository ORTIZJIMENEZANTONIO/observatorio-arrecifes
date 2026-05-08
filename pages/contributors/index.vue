<template>
  <div>
    <CommonHeroSection compact>
      <div class="max-w-3xl">
        <span class="badge-coral mb-3 bg-white/15 text-white">{{ hero?.eyebrow }}</span>
        <h1 class="font-display text-3xl font-extrabold text-white md:text-5xl">{{ hero?.title }}</h1>
        <p class="mt-3 text-base text-white/80 md:text-lg">{{ hero?.subtitle }}</p>
      </div>
    </CommonHeroSection>

    <!-- Modos de participación — NO son niveles que se escalan, son maneras
         distintas pero igual de válidas de aportar a la red: ciudadana, del mar,
         de campo, investigación, curaduría. Cada card describe quién participa
         así, qué aporta y de dónde viene. Sin "Nivel N", sin chevrons, sin
         "para llegar" — el orden es alfabético/de inducción, no de jerarquía.
         Mobile: 1 col stacked. sm: 2 cols. lg: 5 cols (todas mismo peso). -->
    <section class="section-padding-sm">
      <div class="container-wide">
        <CommonSectionTitle
          :tag="modesIntro?.eyebrow ?? 'Modos de participar'"
          :title="modesIntro?.title ?? '5 maneras de cuidar el mismo arrecife'"
          :subtitle="modesIntro?.subtitle ?? ''"
        />

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <article
            v-for="(t, idx) in visibleTiers"
            :key="t.slug"
            :class="[
              'tier-mode-card group relative flex flex-col overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
              `tier-mode-card--${t.slug}`,
            ]"
          >
            <!-- Banda de color superior — sello visual sin jerarquía -->
            <div :class="['tier-accent-strip', `tier-accent-${t.slug}`]" />

            <!-- Header: disco con icono + modo de participación + sello discreto -->
            <div class="flex items-start gap-3">
              <span :class="['tier-icon-disc', `tier-icon-disc--${t.slug}`]">
                <Icon :name="t.icon || tierIcon(t.slug)" size="20" />
              </span>
              <div class="min-w-0 flex-1">
                <p class="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                  Modo de participar
                </p>
                <h3 class="font-display text-lg font-extrabold leading-tight text-ink">
                  {{ t.modeTitle || t.label }}
                </h3>
              </div>
            </div>

            <!-- Quién participa así — audiencia clara -->
            <div v-if="t.audience || t.description" class="mt-3 rounded-lg bg-primary-50/40 px-3 py-2">
              <p class="text-[10px] font-bold uppercase tracking-wider text-primary">
                Quién aporta así
              </p>
              <p class="mt-1 text-xs leading-snug text-ink">
                {{ t.audience || t.description }}
              </p>
            </div>

            <!-- Aportes típicos — qué tipo de datos genera este modo -->
            <div v-if="t.contributions && t.contributions.length" class="mt-4 flex-1">
              <p class="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                Aportes típicos
              </p>
              <ul class="mt-2 space-y-1.5">
                <li
                  v-for="contrib in t.contributions"
                  :key="contrib"
                  class="flex items-start gap-1.5 text-xs leading-snug text-ink-light"
                >
                  <Icon :name="t.icon || tierIcon(t.slug)" size="11" class="mt-0.5 shrink-0 opacity-60" />
                  <span>{{ contrib }}</span>
                </li>
              </ul>
            </div>

            <!-- Cómo se conecta al resto de la red -->
            <div v-if="t.bridge" class="mt-4 rounded-lg bg-gray-50 px-3 py-2">
              <p class="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                Conecta con
              </p>
              <p class="mt-1 text-[11px] leading-snug text-ink-light">
                {{ t.bridge }}
              </p>
            </div>

            <!-- Footer: gente activa + filtro al leaderboard. Sello del tier
                 va aquí en pequeño, sin protagonismo (el modo es lo importante). -->
            <div class="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-[11px] font-semibold">
              <span class="flex items-center gap-1.5 text-ink-muted">
                <Icon name="lucide:users" size="13" />
                <CommonCountUp :value="memberCount[t.slug] || 0" :delay="idx * 80" />
                <span class="font-normal">activas</span>
              </span>
              <button
                class="rounded-full px-2 py-0.5 font-medium text-primary transition-colors hover:bg-primary-50"
                @click="store.filterTier = (t.slug as ContributorTier)"
              >
                Ver
                <Icon name="lucide:arrow-right" size="11" class="ml-0.5 inline" />
              </button>
            </div>
          </article>
        </div>

        <!-- Línea de propósito: refuerza la complementariedad -->
        <div class="mt-8 rounded-2xl border border-primary-50 bg-gradient-to-r from-primary-50/50 via-white to-coral/5 p-5 sm:p-6">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
            <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30">
              <Icon name="lucide:network" size="24" />
            </span>
            <div class="min-w-0 flex-1">
              <p class="text-xs font-bold uppercase tracking-wider text-primary">
                {{ networkCallout?.heading ?? 'Red, no escalera' }}
              </p>
              <p class="mt-1 text-sm leading-relaxed text-ink">{{ networkCallout?.body }}</p>
            </div>
            <NuxtLink to="/contribute" class="btn-primary btn-sm shrink-0 self-start sm:self-auto">
              <Icon name="lucide:plus" size="14" />
              Quiero aportar
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Filters + Leaderboard -->
    <section class="section-padding-sm">
      <div class="container-wide">
        <CommonFilterPanel
          v-model:search-query="store.search"
          search-placeholder="Buscar por nombre, handle o afiliación…"
          :active-count="store.activeFilterCount"
          :total="store.contributors.length"
          :filtered="sorted.length"
          class="mb-6"
          @clear="store.resetFilters()"
        >
          <div class="form-group !mb-0">
            <label class="form-label">Rol</label>
            <select v-model="store.filterRole" class="select">
              <option value="all">Todos</option>
              <option value="researcher">Investigador/a</option>
              <option value="student">Estudiante</option>
              <option value="diver">Buzo</option>
              <option value="fisher">Pescador/a</option>
              <option value="tour_operator">Operador turístico</option>
              <option value="citizen">Ciudadano/a</option>
              <option value="ngo">ONG</option>
              <option value="institution">Institución</option>
              <option value="government">Gobierno</option>
            </select>
          </div>
          <div class="form-group !mb-0">
            <label class="form-label">Modo de participación</label>
            <select v-model="store.filterTier" class="select">
              <option value="all">Todos</option>
              <option value="bronze">Curiosidad ciudadana</option>
              <option value="silver">Conocimiento del mar</option>
              <option value="gold">Trabajo en agua</option>
              <option value="platinum">Investigación formal</option>
              <option value="coral">Síntesis y curaduría</option>
            </select>
          </div>
          <div class="form-group !mb-0">
            <label class="form-label">Estado mexicano</label>
            <select v-model="store.filterState" class="select">
              <option value="all">Todos</option>
              <option v-for="s in store.states" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
          <div class="form-group !mb-0">
            <label class="form-label">Meses consecutivos activos (mín.)</label>
            <input
              v-model.number="store.filterMonthsActiveMin"
              type="number" min="0" max="60" step="1"
              class="input"
              placeholder="0"
            />
          </div>
          <div class="form-group !mb-0 flex items-end">
            <label class="checkbox-label">
              <input v-model="store.filterVerifiedOnly" type="checkbox" class="checkbox" />
              Sólo identidades verificadas
            </label>
          </div>
        </CommonFilterPanel>

        <CommonSectionTitle title="Top de la red" subtitle="Ordenado por reputación." />
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <ContributorsContributorCard v-for="c in sorted" :key="c.id" :contributor="c" />
        </div>

        <div v-if="!sorted.length" class="py-16 text-center">
          <Icon name="lucide:user-x" size="40" class="mx-auto text-ink-muted/40" />
          <p class="mt-3 text-sm text-ink-muted">No se encontraron colaboradores con esos filtros.</p>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="section-padding-sm">
      <div class="container-wide">
        <div class="card-glass relative overflow-hidden p-8 md:p-12">
          <div class="grid items-center gap-6 md:grid-cols-[1.4fr_1fr]">
            <div>
              <h2 class="text-2xl font-bold text-ink md:text-3xl">{{ cta?.title }}</h2>
              <p class="mt-3 text-sm text-slate-custom">{{ cta?.description }}</p>
            </div>
            <div class="flex flex-wrap gap-3 md:justify-end">
              <NuxtLink :to="cta?.primaryTo ?? '/contribute'" class="btn-coral btn-lg">
                <Icon name="lucide:plus" size="18" />
                {{ cta?.primaryLabel ?? 'Empezar a contribuir' }}
              </NuxtLink>
              <NuxtLink v-if="cta?.secondaryLabel" :to="cta?.secondaryTo ?? '/about'" class="btn-outline btn-lg">
                {{ cta?.secondaryLabel }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useContributorsStore } from '~/stores/contributors'
import { useTiersStore } from '~/stores/tiers'
import type { ContributorTier } from '~/types'

const store = useContributorsStore()
const tiersStore = useTiersStore()
const cms = useCmsContent('contributors')
const hero = cms.one<{ eyebrow: string; title: string; subtitle: string }>('hero')
const modesIntro = cms.one<{ eyebrow: string; title: string; subtitle: string }>('modesIntro')
const networkCallout = cms.one<{ heading: string; body: string }>('networkCallout')
const cta = cms.one<{
  title: string
  description: string
  primaryLabel: string
  primaryTo: string
  secondaryLabel: string
  secondaryTo: string
}>('cta')

// Escalas visibles del backend (con mock fallback). El admin las edita en /admin/tiers.
const visibleTiers = computed(() => tiersStore.visibleTiers)

const sorted = computed(() => [...store.filtered].sort((a, b) => b.reputationScore - a.reputationScore))

// Conteo de miembros vivo por tier — alimenta el "X personas aquí ahora" de cada
// card del journey. Reactivo al store, así que cuando el backend sync hidrata la
// red el número se actualiza solo.
const memberCount = computed<Record<string, number>>(() => {
  const counts: Record<string, number> = {}
  for (const c of store.contributors) {
    counts[c.tier] = (counts[c.tier] || 0) + 1
  }
  return counts
})

// ── Copy editorial por modo de participación ────────────────────────────────
// El contenido de los 5 modos vive en la BD desde el reframe del tier system
// (campos `modeTitle`, `audience`, `contributions[]`, `bridge` en `obs_tiers`).
// El admin los edita desde `/admin/tiers`. Esta página los lee del store.

const tierIcon = (key: ContributorTier | string): string => {
  const map: Record<string, string> = {
    bronze: 'lucide:medal',
    silver: 'lucide:award',
    gold: 'lucide:trophy',
    platinum: 'lucide:crown',
    coral: 'lucide:sparkles',
  }
  return map[key] ?? 'lucide:shield'
}
</script>

<style scoped>
/* ── Mode card — modos de participación en /contributors ───────────────────
   No son niveles que se escalan. Son 5 maneras distintas de aportar al
   monitoreo. Cada card tiene el mismo peso visual; el color sólo distingue
   el modo (no implica jerarquía). */

.tier-mode-card {
  border-color: theme('colors.gray.100');
  border-top-width: 3px;
}

.tier-accent-strip {
  position: absolute;
  inset: 0 0 auto 0;
  height: 3px;
  z-index: 1;
}

/* Sellos de color por modo — gradients horizontales como sellos visuales,
   reutilizan los colores existentes de los tiers heredados (bronze→coral)
   pero sin connotación de rango. */
.tier-accent-bronze   { background: linear-gradient(90deg, #B45309 0%, #F59E0B 100%); }
.tier-accent-silver   { background: linear-gradient(90deg, #475569 0%, #94A3B8 100%); }
.tier-accent-gold     { background: linear-gradient(90deg, #CA8A04 0%, #FACC15 100%); }
.tier-accent-platinum { background: linear-gradient(90deg, #0E7490 0%, #06B6D4 100%); }
.tier-accent-coral    { background: linear-gradient(90deg, #DB2777 0%, #FF7A66 50%, #F59E0B 100%); }

/* Hover: tinte del borde según modo */
.tier-mode-card--bronze:hover   { border-color: rgba(245, 158, 11, 0.35); }
.tier-mode-card--silver:hover   { border-color: rgba(148, 163, 184, 0.45); }
.tier-mode-card--gold:hover     { border-color: rgba(250, 204, 21, 0.45); }
.tier-mode-card--platinum:hover { border-color: rgba(6, 182, 212, 0.45); }
.tier-mode-card--coral:hover    { border-color: rgba(255, 122, 102, 0.55); }

/* Disco del icono — círculo con gradient diagonal y sombra acorde */
.tier-icon-disc {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 2.5rem;
  width: 2.5rem;
  border-radius: 0.875rem;
  color: white;
  box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.15);
}
.tier-icon-disc--bronze   { background: linear-gradient(135deg, #B45309 0%, #F59E0B 100%); }
.tier-icon-disc--silver   { background: linear-gradient(135deg, #475569 0%, #94A3B8 100%); }
.tier-icon-disc--gold     { background: linear-gradient(135deg, #CA8A04 0%, #FACC15 100%); }
.tier-icon-disc--platinum { background: linear-gradient(135deg, #0E7490 0%, #22D3EE 100%); }
.tier-icon-disc--coral    { background: linear-gradient(135deg, #DB2777 0%, #FF7A66 50%, #F59E0B 100%); }

@media (prefers-reduced-motion: reduce) {
  .tier-mode-card { transition: none; }
  .tier-mode-card:hover { transform: none; }
}
</style>

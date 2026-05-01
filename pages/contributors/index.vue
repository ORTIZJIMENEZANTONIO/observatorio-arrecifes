<template>
  <div>
    <CommonHeroSection compact>
      <div class="max-w-3xl">
        <span class="badge-coral mb-3 bg-white/15 text-white">Red de colaboradores</span>
        <h1 class="font-display text-3xl font-extrabold text-white md:text-5xl">Quienes alimentan la plataforma</h1>
        <p class="mt-3 text-base text-white/80 md:text-lg">
          Pescadores, buzos, investigadoras, comunidades costeras. Sistema de reputación
          inspirado en marketplaces: tu rango sube con cada aporte validado.
        </p>
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
          tag="Modos de participar"
          title="5 maneras de cuidar el mismo arrecife"
          subtitle="No hay un mejor camino. Quien sale a pescar todos los días, quien firma un paper, quien sube una foto desde la playa: cada aporte es una pieza distinta del mismo monitoreo. La red sólo funciona cuando los cinco modos coexisten."
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
                  {{ tierMode[t.slug]?.title || t.label }}
                </h3>
              </div>
            </div>

            <!-- Quién participa así — audiencia clara -->
            <div class="mt-3 rounded-lg bg-primary-50/40 px-3 py-2">
              <p class="text-[10px] font-bold uppercase tracking-wider text-primary">
                Quién aporta así
              </p>
              <p class="mt-1 text-xs leading-snug text-ink">
                {{ tierMode[t.slug]?.audience || t.description }}
              </p>
            </div>

            <!-- Aportes típicos — qué tipo de datos genera este modo -->
            <div class="mt-4 flex-1">
              <p class="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                Aportes típicos
              </p>
              <ul class="mt-2 space-y-1.5">
                <li
                  v-for="contrib in tierMode[t.slug]?.contributions || []"
                  :key="contrib"
                  class="flex items-start gap-1.5 text-xs leading-snug text-ink-light"
                >
                  <Icon :name="t.icon || tierIcon(t.slug)" size="11" class="mt-0.5 shrink-0 opacity-60" />
                  <span>{{ contrib }}</span>
                </li>
              </ul>
            </div>

            <!-- Cómo se conecta al resto de la red -->
            <div v-if="tierMode[t.slug]?.bridge" class="mt-4 rounded-lg bg-gray-50 px-3 py-2">
              <p class="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                Conecta con
              </p>
              <p class="mt-1 text-[11px] leading-snug text-ink-light">
                {{ tierMode[t.slug]?.bridge }}
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
              <p class="text-xs font-bold uppercase tracking-wider text-primary">Red, no escalera</p>
              <p class="mt-1 text-sm leading-relaxed text-ink">
                El observatorio funciona como una red horizontal:
                la pescadora que ve el blanqueamiento primero, la investigadora que mide el DHW,
                el ciudadano que comparte una foto. Ninguna pieza está por encima de otra —
                lo que las une es el mismo arrecife.
              </p>
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
        <div class="card mb-6 p-4 md:p-5">
          <div class="grid gap-3 md:grid-cols-[1fr_auto_auto]">
            <div class="input-icon-wrapper">
              <Icon name="lucide:search" size="16" class="input-icon" />
              <input v-model="store.search" type="search" class="input" placeholder="Buscar por nombre, handle o afiliación…" />
            </div>
            <select v-model="store.filterRole" class="select">
              <option value="all">Todos los roles</option>
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
            <select v-model="store.filterTier" class="select">
              <option value="all">Todos los rangos</option>
              <option value="bronze">Bronce</option>
              <option value="silver">Plata</option>
              <option value="gold">Oro</option>
              <option value="platinum">Platino</option>
              <option value="coral">Coral</option>
            </select>
          </div>
        </div>

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
              <h2 class="text-2xl font-bold text-ink md:text-3xl">¿Quieres formar parte de la red?</h2>
              <p class="mt-3 text-sm text-slate-custom">
                Registra una observación, aporta una imagen satelital, sube un transecto o reporta una problemática.
                Tu primer aporte validado abre tu perfil público.
              </p>
            </div>
            <div class="flex flex-wrap gap-3 md:justify-end">
              <NuxtLink to="/contribute" class="btn-coral btn-lg">
                <Icon name="lucide:plus" size="18" />
                Empezar a contribuir
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
// La red NO es jerárquica — son 5 maneras distintas de aportar al monitoreo.
// Cada modo tiene una audiencia clara (quién aporta así), aportes típicos
// (qué tipo de datos genera) y un puente (cómo se conecta con el resto).
//
// Mapeo a slugs heredados del tier system: bronze/silver/gold/platinum/coral
// se reinterpretan como modos, no como rangos. El admin puede renombrar las
// etiquetas en /admin/tiers si quiere reforzar el reframe a nivel de datos.
const tierMode: Record<string, { title: string; audience: string; contributions: string[]; bridge: string }> = {
  bronze: {
    title: 'Curiosidad ciudadana',
    audience: 'Personas con interés en el mar mexicano, sin formación técnica formal. Visitas a la playa, snorkel ocasional, vínculo cultural con la costa.',
    contributions: [
      'Foto de un arrecife con ubicación y fecha',
      'Reporte de cambios visibles (color, sargazo, peces)',
      'Preguntas abiertas al equipo del observatorio',
    ],
    bridge: 'El primer ojo que detecta algo nuevo. Las personas del mar y de campo verifican lo que reporta este modo.',
  },
  silver: {
    title: 'Conocimiento del mar',
    audience: 'Pescadoras, buzos, operadoras turísticas, comunidades costeras. Saber empírico construido sobre años de presencia en el agua.',
    contributions: [
      'Patrones locales: mareas, especies, blanqueamiento estacional',
      'Histórico oral de eventos en su zona (huracanes, derrames)',
      'Verificación en campo de capas satelitales',
    ],
    bridge: 'Da contexto territorial a los datos satelitales y a los muestreos académicos. Sin este modo, los números flotan.',
  },
  gold: {
    title: 'Trabajo en agua',
    audience: 'Profesionales de campo: buzos certificados, biólogas, oceanógrafas, pilotas de dron. Mediciones in situ con instrumentación.',
    contributions: [
      'Transectos cuantitativos de cobertura coralina',
      'Vuelos de dron submarino y aéreo',
      'Muestreos de calidad de agua y temperatura',
    ],
    bridge: 'Traduce el conocimiento del mar y la observación ciudadana en mediciones replicables que la academia puede analizar.',
  },
  platinum: {
    title: 'Investigación formal',
    audience: 'Academia, ICML-UNAM, CINVESTAV, posgrados, ONGs científicas. Trabajo revisado por pares y series de tiempo de largo plazo.',
    contributions: [
      'Estudios peer-reviewed publicados',
      'Series de tiempo de monitoreo (DHW, SST, cobertura)',
      'Procesamiento de datos satelitales NASA / NOAA / ESA',
    ],
    bridge: 'Provee el marco metodológico y la rigurosidad estadística. Reúne aportes de los otros modos para construir narrativa científica.',
  },
  coral: {
    title: 'Síntesis y curaduría',
    audience: 'Equipo del observatorio, revisores con trayectoria, instituciones aliadas (CONANP, SEMARNAT, CIIEMAD-IPN).',
    contributions: [
      'Validación cruzada entre los cinco modos',
      'Coordinación con CONANP y comunidades',
      'Publicación oficial y comunicación pública',
    ],
    bridge: 'Cierra el ciclo: integra la mirada ciudadana, el saber del mar, los datos de campo y la investigación en una sola voz pública.',
  },
}

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

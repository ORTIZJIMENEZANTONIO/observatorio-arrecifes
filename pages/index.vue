<template>
  <div>
    <!-- Hero — Foto real de arrecife + tint teal + capas atmosféricas -->
    <section class="hero-section relative flex min-h-[78vh] items-center overflow-hidden">
      <div class="hero-bg" aria-hidden="true">
        <div class="hero-photo" />
        <div class="hero-photo-tint" />
        <div class="hero-bathymetry" />
        <div class="hero-caustics" />
        <span class="lava-orb orb--c1" />
        <span class="lava-orb orb--c2" />
        <div class="hero-vignette" />
      </div>
      <div class="container-wide relative z-10 py-10 md:py-16">
        <div class="grid items-center gap-10 md:grid-cols-[1.2fr_1fr] lg:gap-16">
          <div>
            <span class="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-coral-light backdrop-blur-sm ring-1 ring-white/15">
              <span class="live-dot" />
              Datos en tiempo casi real · NOAA · NASA · ESA
            </span>
            <h1 class="mt-6 font-display text-4xl font-extrabold leading-[1.05] text-white md:text-5xl lg:text-6xl">
              Observatorio<br />
              de <span class="text-gradient-hero">Arrecifes Vivos</span><br />
              de México
            </h1>
            <p class="mt-6 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
              Una plataforma viva. Mapas satelitales actualizados a diario, capas abiertas
              descargables y una red verificada de pescadores, buzos, comunidades costeras y
              científicos que documentan lo que pasa bajo el agua.
            </p>
            <div class="mt-9 flex flex-wrap gap-3">
              <NuxtLink to="/livemap" class="btn-lg group inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-semibold text-primary shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-50 hover:shadow-xl">
                <Icon name="lucide:globe" size="20" />
                Abrir mapa vivo
              </NuxtLink>
              <NuxtLink to="/contribute" class="btn btn-lg border border-white/25 text-white backdrop-blur-sm hover:bg-white/10">
                <Icon name="lucide:plus" size="18" />
                Contribuir
              </NuxtLink>
            </div>

            <!-- Inline stats strip -->
            <div class="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-white/15 pt-6">
              <div>
                <p class="text-2xl font-bold text-white md:text-3xl">{{ reefSummary.total }}</p>
                <p class="text-[11px] uppercase tracking-wider text-white/60">arrecifes</p>
              </div>
              <div>
                <p class="text-2xl font-bold text-white md:text-3xl">{{ formatNumber(reefSummary.totalArea) }}</p>
                <p class="text-[11px] uppercase tracking-wider text-white/60">hectáreas</p>
              </div>
              <div>
                <p class="text-2xl font-bold text-coral-light md:text-3xl">{{ reefSummary.alertCount }}</p>
                <p class="text-[11px] uppercase tracking-wider text-white/60">en alerta</p>
              </div>
            </div>
          </div>

          <!-- Animated reef icon stack -->
          <div class="relative hidden md:block">
            <div class="reef-stack">
              <div class="reef-card reef-card--1">
                <div class="flex items-center gap-2">
                  <span class="live-dot" />
                  <span class="text-[10px] font-bold uppercase tracking-wider text-coral-dark">Cozumel</span>
                </div>
                <p class="mt-2 text-xs text-ink-muted">Alerta nivel 1 · DHW 6.8</p>
                <p class="mt-1 text-2xl font-bold text-ink">30.6 °C</p>
              </div>
              <div class="reef-card reef-card--2">
                <div class="flex items-center gap-2">
                  <Icon name="lucide:satellite" size="14" class="text-secondary" />
                  <span class="text-[10px] font-bold uppercase tracking-wider text-secondary-dark">NASA PACE</span>
                </div>
                <p class="mt-2 text-xs text-ink-muted">Clorofila-a (Caribe)</p>
                <p class="mt-1 text-2xl font-bold text-ink">0.41 mg/m³</p>
              </div>
              <div class="reef-card reef-card--3">
                <div class="flex items-center gap-2">
                  <Icon name="lucide:waves" size="14" class="text-eco" />
                  <span class="text-[10px] font-bold uppercase tracking-wider text-eco-dark">Cabo Pulmo</span>
                </div>
                <p class="mt-2 text-xs text-ink-muted">Cobertura coralina viva</p>
                <p class="mt-1 text-2xl font-bold text-ink">39 %</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- KPIs interactive bento -->
    <section class="relative -mt-10 z-10 pb-8">
      <div class="container-wide">
        <div ref="kpiRef" class="stagger-children grid grid-cols-2 gap-3 md:grid-cols-4">
          <NuxtLink
            v-for="k in kpis"
            :key="k.label"
            :to="k.to ?? '/'"
            class="reveal card-interactive group flex flex-col gap-2 p-4 md:p-5"
          >
            <div class="flex items-center justify-between">
              <span :class="['flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3', kpiIconBg(k.color)]">
                <Icon :name="k.icon ?? 'lucide:circle'" size="20" :class="kpiColor(k.color)" />
              </span>
            </div>
            <p :class="['text-2xl font-extrabold transition-colors group-hover:text-primary', kpiColor(k.color)]">
              {{ k.value }}<span v-if="k.unit" class="ml-1 text-sm font-medium text-ink-muted">{{ k.unit }}</span>
            </p>
            <p class="text-xs leading-tight text-ink-muted">{{ k.label }}</p>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Inspiration: Allen Coral Atlas + EJAtlas -->
    <section class="section-padding-sm">
      <div class="container-wide">
        <CommonSectionTitle
          tag="¿Qué hay aquí?"
          title="Una plataforma viva, no un reporte estático"
          subtitle="Inspirada en Allen Coral Atlas (mapas satelitales globales) y EJAtlas (cartografía de conflictos socioambientales). Pensada para México, en español y desde lo costero."
        />

        <div ref="featuresRef" class="stagger-children grid gap-5 md:grid-cols-3">
          <article class="reveal card p-6">
            <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary">
              <Icon name="lucide:satellite" size="22" />
            </span>
            <h3 class="mt-4 text-lg font-bold text-ink">Datos satelitales casi en tiempo real</h3>
            <p class="mt-2 text-sm leading-relaxed text-slate-custom">
              NOAA Coral Reef Watch (DHW, alertas de blanqueamiento), NASA MODIS/PACE (SST, clorofila),
              ESA Sentinel-2 (10 m), USGS Landsat. Reproyectados sobre la línea costera mexicana.
            </p>
            <NuxtLink to="/livemap" class="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all">
              Abrir mapa <Icon name="lucide:arrow-right" size="14" />
            </NuxtLink>
          </article>

          <article class="reveal card p-6">
            <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-coral/10 text-coral-dark">
              <Icon name="lucide:alert-triangle" size="22" />
            </span>
            <h3 class="mt-4 text-lg font-bold text-ink">Atlas de conflictos socioambientales</h3>
            <p class="mt-2 text-sm leading-relaxed text-slate-custom">
              Quién impulsa, quién resiste, qué especies se afectan. Casos documentados de
              cruceros, sargazo, derrames, sobrepesca y desarrollo costero — con evidencia.
            </p>
            <NuxtLink to="/atlas" class="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-coral-dark hover:gap-2 transition-all">
              Ver atlas <Icon name="lucide:arrow-right" size="14" />
            </NuxtLink>
          </article>

          <article class="reveal card p-6">
            <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-eco/10 text-eco-dark">
              <Icon name="lucide:users" size="22" />
            </span>
            <h3 class="mt-4 text-lg font-bold text-ink">Red verificada de colaboradores</h3>
            <p class="mt-2 text-sm leading-relaxed text-slate-custom">
              Pescadores, buzos, investigadoras, comunidades costeras. Sistema de reputación
              tipo marketplace: bronce → coral según aportes validados, calidad y consistencia.
            </p>
            <NuxtLink to="/contributors" class="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-eco-dark hover:gap-2 transition-all">
              Ver red <Icon name="lucide:arrow-right" size="14" />
            </NuxtLink>
          </article>
        </div>
      </div>
    </section>

    <!-- Live alerts row -->
    <section class="bg-white border-y border-gray-100">
      <div class="container-wide section-padding-sm">
        <div class="flex flex-wrap items-end justify-between gap-3 mb-6">
          <div>
            <span class="badge-coral">Últimas 72 h</span>
            <h2 class="mt-2 text-2xl font-bold text-ink">Alertas activas</h2>
            <p class="mt-1 text-sm text-slate-custom">NOAA Coral Reef Watch · 5 km · actualizado diariamente.</p>
          </div>
          <NuxtLink to="/livemap?layer=noaa-crw-bleaching-alert" class="btn-outline btn-sm">
            Ver mapa de alertas
            <Icon name="lucide:arrow-right" size="14" />
          </NuxtLink>
        </div>

        <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="alert in topAlerts"
            :key="alert.reefId"
            class="card p-4"
          >
            <div class="flex items-center justify-between">
              <span :class="`badge ${bleachingAlertBadgeClass(alert.level)}`">
                {{ formatBleachingAlert(alert.level) }}
              </span>
              <span class="text-[10px] font-medium text-ink-muted">{{ formatDate(alert.observedAt) }}</span>
            </div>
            <h3 class="mt-3 text-base font-semibold text-ink">{{ reefName(alert.reefId) }}</h3>
            <div class="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div>
                <p class="text-[10px] uppercase tracking-wider text-ink-muted">SST</p>
                <p class="font-bold text-ink">{{ alert.sst.toFixed(1) }}°C</p>
              </div>
              <div>
                <p class="text-[10px] uppercase tracking-wider text-ink-muted">Anomalía</p>
                <p class="font-bold" :class="alert.sstAnomaly > 1 ? 'text-coral-dark' : 'text-ink'">
                  +{{ alert.sstAnomaly.toFixed(1) }}°C
                </p>
              </div>
              <div>
                <p class="text-[10px] uppercase tracking-wider text-ink-muted">DHW</p>
                <p class="font-bold" :class="alert.dhw > 4 ? 'text-coral-dark' : 'text-ink'">
                  {{ alert.dhw.toFixed(1) }}
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- Top contributors teaser -->
    <section class="section-padding-sm">
      <div class="container-wide">
        <div class="flex flex-wrap items-end justify-between gap-3 mb-6">
          <div>
            <span class="badge-primary">Comunidad</span>
            <h2 class="mt-2 text-2xl font-bold text-ink">Top colaboradores</h2>
            <p class="mt-1 text-sm text-slate-custom">Reputación basada en aportes validados, calidad y consistencia.</p>
          </div>
          <NuxtLink to="/contributors" class="btn-outline btn-sm">
            Ver todos
            <Icon name="lucide:arrow-right" size="14" />
          </NuxtLink>
        </div>
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <ContributorsContributorCard v-for="c in topContributors" :key="c.id" :contributor="c" />
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="section-padding-sm">
      <div class="container-wide">
        <div class="card-glass relative overflow-hidden p-8 md:p-12">
          <div class="grid items-center gap-6 md:grid-cols-[1.4fr_1fr]">
            <div>
              <h2 class="text-2xl font-bold text-ink md:text-3xl">¿Vives, buceas o investigas en la costa?</h2>
              <p class="mt-3 text-base text-slate-custom">
                Sumate a la red. Aporta fotos, vuelos de dron, transectos o reportes de problemáticas.
                Un equipo revisa cada aporte y construyes tu reputación con cada validación.
              </p>
            </div>
            <div class="flex flex-wrap gap-3 md:justify-end">
              <NuxtLink to="/contribute" class="btn-coral btn-lg">
                <Icon name="lucide:plus" size="18" />
                Contribuir
              </NuxtLink>
              <NuxtLink to="/about" class="btn-outline btn-lg">
                Cómo funciona
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
import { reefs, reefSummary } from '~/data/reefs'
import { bleachingAlerts } from '~/data/bleaching-alerts'
import { kpis } from '~/data/kpis'
import { useContributorsStore } from '~/stores/contributors'

const { formatNumber, formatDate, formatBleachingAlert, bleachingAlertBadgeClass, kpiIconBg, kpiColor } = useFormatters()

const { revealRef: kpiRef } = useScrollReveal({ stagger: true })
const { revealRef: featuresRef } = useScrollReveal({ stagger: true })

const topAlerts = computed(() =>
  [...bleachingAlerts]
    .filter((a) => a.level !== 'no_stress')
    .sort((a, b) => b.dhw - a.dhw)
    .slice(0, 6),
)

const reefName = (id: number) => reefs.find((r) => r.id === id)?.name ?? 'Sitio'

const contributorsStore = useContributorsStore()
const topContributors = computed(() => contributorsStore.leaderboard.slice(0, 3))
</script>

<style scoped>
/* ── Foto real de arrecife como protagonista, tinte teal y atmósfera encima ── */
.hero-section {
  --hero-reef-image: url('/images/hero-reef.jpg');
  background:
    radial-gradient(ellipse 90% 60% at 50% 0%, rgba(11,86,109,0.55) 0%, transparent 60%),
    linear-gradient(180deg, #02141C 0%, #052731 22%, #08475A 55%, #0E7490 85%, #0891B2 100%);
}
.hero-bg { position: absolute; inset: 0; overflow: hidden; z-index: 0; }

.hero-photo {
  position: absolute; inset: 0;
  background-image:
    var(--hero-reef-image),
    url('https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=2400&q=80');
  background-size: cover;
  background-position: center 40%;
  background-repeat: no-repeat;
  z-index: 0;
  filter: saturate(1.1) contrast(1.05);
  animation: photo-pan 30s ease-in-out infinite alternate;
}

.hero-photo-tint {
  position: absolute; inset: 0; z-index: 1;
  background:
    linear-gradient(180deg, rgba(2,20,28,0.55) 0%, rgba(8,71,90,0.35) 50%, rgba(2,20,28,0.85) 100%),
    linear-gradient(140deg, rgba(14,116,144,0.35) 0%, rgba(8,145,178,0.15) 100%);
  mix-blend-mode: multiply;
}

.hero-bathymetry {
  position: absolute; inset: -10%;
  background:
    repeating-radial-gradient(circle at 18% 82%, transparent 0, transparent 40px, rgba(255,255,255,0.06) 40px, rgba(255,255,255,0.06) 41px),
    repeating-radial-gradient(circle at 82% 18%, transparent 0, transparent 56px, rgba(255,255,255,0.05) 56px, rgba(255,255,255,0.05) 57px),
    repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 78px, rgba(34,211,238,0.04) 78px, rgba(34,211,238,0.04) 79px);
  z-index: 2; mix-blend-mode: screen; opacity: 0.35;
  animation: drift-slow 60s linear infinite;
  pointer-events: none;
}

.hero-caustics {
  position: absolute; inset: -5% -5% 30% -5%;
  background:
    radial-gradient(ellipse 60% 35% at 30% 0%, rgba(34,211,238,0.18) 0%, transparent 70%),
    radial-gradient(ellipse 40% 25% at 75% 5%, rgba(255,255,255,0.10) 0%, transparent 65%);
  z-index: 2; filter: blur(2px);
  animation: caustic-drift 18s ease-in-out infinite;
  pointer-events: none;
}

.lava-orb {
  position: absolute; border-radius: 50%; filter: blur(36px);
  transform: translate3d(0,0,0); will-change: transform;
  mix-blend-mode: screen; opacity: 0.45; z-index: 3; pointer-events: none;
}
.orb--c1 { width: 340px; height: 340px; top: 25%; right: 18%; background: radial-gradient(circle, rgba(255,122,102,0.5) 0%, rgba(255,122,102,0) 70%); animation: lavaD 12s ease-in-out infinite; }
.orb--c2 { width: 260px; height: 260px; bottom: 12%; right: -60px; background: radial-gradient(circle, rgba(245,158,11,0.4) 0%, rgba(245,158,11,0) 70%); animation: lavaA 14s ease-in-out infinite; }

.hero-vignette {
  position: absolute; inset: auto 0 0 0; height: 40%;
  background: linear-gradient(180deg, transparent 0%, rgba(2,20,28,0.85) 100%);
  z-index: 4; pointer-events: none;
}

@keyframes photo-pan { 0% { transform: scale(1.04) translate3d(0,0,0); } 100% { transform: scale(1.08) translate3d(-12px,-8px,0); } }
@keyframes lavaA { 0%,100% { transform: translate3d(0,0,0) scale(1); } 25% { transform: translate3d(50px,20px,0) scale(1.06); } 50% { transform: translate3d(15px,50px,0) scale(0.95); } 75% { transform: translate3d(-30px,30px,0) scale(1.04); } }
@keyframes lavaD { 0%,100% { transform: translate3d(0,0,0) scale(1); } 33% { transform: translate3d(20px,-15px,0) scale(1.05); } 66% { transform: translate3d(-12px,18px,0) scale(0.97); } }
@keyframes caustic-drift { 0%,100% { transform: translateX(0) scale(1); opacity: 0.8; } 50% { transform: translateX(40px) scale(1.06); opacity: 1; } }
@keyframes drift-slow { 0% { transform: translate3d(0,0,0); } 100% { transform: translate3d(-30px,-20px,0); } }

.reef-stack { position: relative; height: 380px; z-index: 5; }
.reef-card { position: absolute; padding: 16px 18px; border-radius: 16px; background: rgba(255,255,255,0.96); backdrop-filter: blur(12px); box-shadow: 0 12px 32px -8px rgba(0,0,0,0.35); width: 220px; transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1); }
.reef-card:hover { transform: scale(1.04) translateZ(0); }
.reef-card--1 { top: 0; right: 60px; animation: floatY 6s ease-in-out infinite; }
.reef-card--2 { top: 130px; right: -10px; animation: floatY 7s ease-in-out infinite reverse; }
.reef-card--3 { top: 240px; right: 80px; animation: floatY 8s ease-in-out infinite; }
@keyframes floatY { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }

@media (prefers-reduced-motion: reduce) {
  .lava-orb, .reef-card, .hero-caustics, .hero-bathymetry, .hero-photo { animation: none; }
}
</style>

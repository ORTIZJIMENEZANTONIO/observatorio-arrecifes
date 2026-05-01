<template>
  <div>
    <!-- Hero — Foto real de arrecife + tint teal + capas atmosféricas -->
    <section
      class="hero-section relative flex min-h-[78vh] items-center overflow-hidden"
    >
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
        <div
          class="grid items-center gap-10 md:grid-cols-[1.2fr_1fr] lg:gap-16"
        >
          <div>
            <span
              class="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-coral-light backdrop-blur-sm ring-1 ring-white/15"
            >
              <span class="live-dot" />
              Datos en tiempo casi real · NOAA · NASA · ESA
            </span>
            <h1
              class="mt-6 font-display text-4xl font-extrabold leading-[1.05] text-white md:text-5xl lg:text-6xl"
            >
              Observatorio<br />
              de <span class="text-gradient-hero">Arrecifes Vivos</span><br />
              de México
            </h1>
            <p
              class="mt-6 max-w-xl text-base leading-relaxed text-white/80 md:text-lg"
            >
              Una plataforma viva. Mapas satelitales actualizados a diario,
              capas abiertas descargables y una red verificada de pescadores,
              buzos, comunidades costeras y científicos que documentan lo que
              pasa bajo el agua.
            </p>
            <div class="mt-9 flex flex-wrap gap-3">
              <NuxtLink
                to="/livemap"
                class="btn-lg group inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-semibold text-primary shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-50 hover:shadow-xl"
              >
                <Icon name="lucide:globe" size="20" />
                Abrir mapa vivo
              </NuxtLink>
              <NuxtLink
                to="/contribute"
                class="btn btn-lg border border-white/25 text-white backdrop-blur-sm hover:bg-white/10"
              >
                <Icon name="lucide:plus" size="18" />
                Contribuir
              </NuxtLink>
            </div>

            <!-- Inline stats strip — mobile-first: 3 cols con text-xl en móvil para que
                 "15,164,033" quepa cómodo en 320-360px de ancho. Bordes verticales sólo en sm+. -->
            <div
              class="mt-10 grid max-w-2xl grid-cols-3 gap-3 border-t border-white/15 pt-6 sm:mt-12 sm:gap-6 sm:pt-8 md:gap-10"
            >
              <div class="flex flex-col gap-1.5 sm:gap-2">
                <p
                  class="text-xl font-bold leading-none text-white sm:text-3xl md:text-4xl"
                >
                  <CommonCountUp :value="reefSummary.total" :duration="1400" />
                </p>
                <p
                  class="text-[10px] uppercase tracking-wider text-white/60 sm:text-[11px]"
                >
                  arrecifes
                </p>
              </div>
              <div
                class="flex flex-col gap-1.5 border-l border-white/10 pl-3 sm:gap-2 sm:pl-6 md:pl-10"
              >
                <p
                  class="text-xl font-bold leading-none text-white sm:text-3xl md:text-4xl"
                >
                  <CommonCountUp
                    :value="reefSummary.totalArea"
                    :format="formatNumber"
                    :duration="1800"
                    :delay="150"
                  />
                </p>
                <p
                  class="text-[10px] uppercase tracking-wider text-white/60 sm:text-[11px]"
                >
                  hectáreas
                </p>
              </div>
              <div
                class="flex flex-col gap-1.5 border-l border-white/10 pl-3 sm:gap-2 sm:pl-6 md:pl-10"
              >
                <p
                  class="text-xl font-bold leading-none text-coral-light sm:text-3xl md:text-4xl text-right"
                >
                  <CommonCountUp
                    :value="reefSummary.alertCount"
                    :duration="1200"
                    :delay="300"
                  />
                </p>
                <p
                  class="text-[10px] uppercase tracking-wider text-white/60 sm:text-[11px] text-right"
                >
                  en alerta
                </p>
              </div>
            </div>
          </div>

          <!-- Animated reef icon stack -->
          <div class="relative hidden md:block">
            <div class="reef-stack">
              <div class="reef-card reef-card--1">
                <div class="flex items-center gap-2">
                  <span class="live-dot" />
                  <span
                    class="text-[10px] font-bold uppercase tracking-wider text-coral-dark"
                    >Cozumel</span
                  >
                </div>
                <p class="mt-2 text-xs text-ink-muted">
                  Alerta nivel 1 · DHW 6.8
                </p>
                <p class="mt-1 text-2xl font-bold text-ink">30.6 °C</p>
              </div>
              <div class="reef-card reef-card--2">
                <div class="flex items-center gap-2">
                  <Icon
                    name="lucide:satellite"
                    size="14"
                    class="text-secondary"
                  />
                  <span
                    class="text-[10px] font-bold uppercase tracking-wider text-secondary-dark"
                    >NASA PACE</span
                  >
                </div>
                <p class="mt-2 text-xs text-ink-muted">Clorofila-a (Caribe)</p>
                <p class="mt-1 text-2xl font-bold text-ink">0.41 mg/m³</p>
              </div>
              <div class="reef-card reef-card--3">
                <div class="flex items-center gap-2">
                  <Icon name="lucide:waves" size="14" class="text-eco" />
                  <span
                    class="text-[10px] font-bold uppercase tracking-wider text-eco-dark"
                    >Cabo Pulmo</span
                  >
                </div>
                <p class="mt-2 text-xs text-ink-muted">
                  Cobertura coralina viva
                </p>
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
        <div
          ref="kpiRef"
          class="stagger-children grid grid-cols-2 gap-3 md:grid-cols-4"
        >
          <NuxtLink
            v-for="(k, idx) in kpis"
            :key="k.label"
            :to="k.to ?? '/'"
            class="reveal card-interactive group flex flex-col items-center gap-2 p-4 text-center md:p-5"
          >
            <span
              :class="[
                'flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3',
                kpiIconBg(k.color),
              ]"
            >
              <Icon
                :name="k.icon ?? 'lucide:circle'"
                size="20"
                :class="kpiColor(k.color)"
              />
            </span>
            <p
              :class="[
                'mt-1 text-2xl font-extrabold transition-colors group-hover:text-primary',
                kpiColor(k.color),
              ]"
            >
              <CommonCountUp
                :value="k.rawValue"
                :decimals="k.decimals ?? 0"
                :suffix="kpiSuffix(k)"
                :delay="idx * 70"
              /><span
                v-if="k.unit"
                class="ml-1 text-sm font-medium text-ink-muted"
                >{{ k.unit }}</span
              >
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

        <div
          ref="featuresRef"
          class="stagger-children grid gap-5 md:grid-cols-3"
        >
          <article
            class="reveal card flex flex-col items-center p-6 text-center"
          >
            <span
              class="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary"
            >
              <Icon name="lucide:satellite" size="22" />
            </span>
            <h3 class="mt-4 text-lg font-bold text-ink">
              Datos satelitales casi en tiempo real
            </h3>
            <p class="mt-2 text-sm leading-relaxed text-slate-custom">
              NOAA Coral Reef Watch (DHW, alertas de blanqueamiento), NASA
              MODIS/PACE (SST, clorofila), ESA Sentinel-2 (10 m), USGS Landsat.
              Reproyectados sobre la línea costera mexicana.
            </p>
            <NuxtLink
              to="/livemap"
              class="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all"
            >
              Abrir mapa <Icon name="lucide:arrow-right" size="14" />
            </NuxtLink>
          </article>

          <article
            class="reveal card flex flex-col items-center p-6 text-center"
          >
            <span
              class="flex h-11 w-11 items-center justify-center rounded-xl bg-coral/10 text-coral-dark"
            >
              <Icon name="lucide:alert-triangle" size="22" />
            </span>
            <h3 class="mt-4 text-lg font-bold text-ink">
              Atlas de conflictos socioambientales
            </h3>
            <p class="mt-2 text-sm leading-relaxed text-slate-custom">
              Quién impulsa, quién resiste, qué especies se afectan. Casos
              documentados de cruceros, sargazo, derrames, sobrepesca y
              desarrollo costero — con evidencia.
            </p>
            <NuxtLink
              to="/atlas"
              class="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-coral-dark hover:gap-2 transition-all"
            >
              Ver atlas <Icon name="lucide:arrow-right" size="14" />
            </NuxtLink>
          </article>

          <article
            class="reveal card flex flex-col items-center p-6 text-center"
          >
            <span
              class="flex h-11 w-11 items-center justify-center rounded-xl bg-eco/10 text-eco-dark"
            >
              <Icon name="lucide:users" size="22" />
            </span>
            <h3 class="mt-4 text-lg font-bold text-ink">
              Red verificada de colaboradores
            </h3>
            <p class="mt-2 text-sm leading-relaxed text-slate-custom">
              Pescadores, buzos, investigadoras, comunidades costeras. Sistema
              de reputación tipo marketplace: bronce → coral según aportes
              validados, calidad y consistencia.
            </p>
            <NuxtLink
              to="/contributors"
              class="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-eco-dark hover:gap-2 transition-all"
            >
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
            <p class="mt-1 text-sm text-slate-custom">
              NOAA Coral Reef Watch · 5 km · actualizado diariamente.
            </p>
          </div>
          <NuxtLink
            to="/livemap?layer=noaa-crw-bleaching-alert"
            class="btn-outline btn-sm"
          >
            Ver mapa de alertas
            <Icon name="lucide:arrow-right" size="14" />
          </NuxtLink>
        </div>

        <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="(alert, idx) in topAlerts"
            :key="alert.reefId"
            class="card p-4"
          >
            <div class="flex items-center justify-between">
              <span :class="`badge ${bleachingAlertBadgeClass(alert.level)}`">
                {{ formatBleachingAlert(alert.level) }}
              </span>
              <span class="text-[10px] font-medium text-ink-muted">{{
                formatDate(alert.observedAt)
              }}</span>
            </div>
            <h3 class="mt-3 text-base font-semibold text-ink">
              {{ reefName(alert.reefId) }}
            </h3>
            <div class="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div>
                <p class="text-[10px] uppercase tracking-wider text-ink-muted">
                  SST
                </p>
                <p class="font-bold text-ink">
                  <CommonCountUp
                    :value="alert.sst"
                    :decimals="1"
                    suffix="°C"
                    :delay="idx * 60"
                  />
                </p>
              </div>
              <div>
                <p class="text-[10px] uppercase tracking-wider text-ink-muted">
                  Anomalía
                </p>
                <p
                  class="font-bold"
                  :class="alert.sstAnomaly > 1 ? 'text-coral-dark' : 'text-ink'"
                >
                  +<CommonCountUp
                    :value="alert.sstAnomaly"
                    :decimals="1"
                    suffix="°C"
                    :delay="idx * 60 + 80"
                  />
                </p>
              </div>
              <div>
                <p class="text-[10px] uppercase tracking-wider text-ink-muted">
                  DHW
                </p>
                <p
                  class="font-bold"
                  :class="alert.dhw > 4 ? 'text-coral-dark' : 'text-ink'"
                >
                  <CommonCountUp
                    :value="alert.dhw"
                    :decimals="1"
                    :delay="idx * 60 + 160"
                  />
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
            <p class="mt-1 text-sm text-slate-custom">
              Reputación basada en aportes validados, calidad y consistencia.
            </p>
          </div>
          <NuxtLink to="/contributors" class="btn-outline btn-sm">
            Ver todos
            <Icon name="lucide:arrow-right" size="14" />
          </NuxtLink>
        </div>
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <ContributorsContributorCard
            v-for="c in topContributors"
            :key="c.id"
            :contributor="c"
          />
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="section-padding-sm">
      <div class="container-wide">
        <div class="card-glass relative overflow-hidden p-8 md:p-12">
          <div class="grid items-center gap-6 md:grid-cols-[1.4fr_1fr]">
            <div>
              <h2 class="text-2xl font-bold text-ink md:text-3xl">
                ¿Vives, buceas o investigas en la costa?
              </h2>
              <p class="mt-3 text-base text-slate-custom">
                Sumate a la red. Aporta fotos, vuelos de dron, transectos o
                reportes de problemáticas. Un equipo revisa cada aporte y
                construyes tu reputación con cada validación.
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
import { computed } from "vue";
import { bleachingAlerts } from "~/data/bleaching-alerts";
import { useReefsStore } from "~/stores/reefs";
import { useContributorsStore } from "~/stores/contributors";
import { useKpis } from "~/composables/useKpis";

const {
  formatNumber,
  formatDate,
  formatBleachingAlert,
  bleachingAlertBadgeClass,
  kpiIconBg,
  kpiColor,
} = useFormatters();

const { revealRef: kpiRef } = useScrollReveal({ stagger: true });
const { revealRef: featuresRef } = useScrollReveal({ stagger: true });

// Stores → drive hero stats + KPI bento. Reactivos al backend-sync (los números
// se actualizan cuando `useBackendSync` reemplaza los stores).
const reefsStore = useReefsStore();
const contributorsStore = useContributorsStore();
const kpis = useKpis();

// Hero stats — derivados de publicReefs, no de un objeto estático del módulo.
const reefSummary = computed(() => {
  const reefs = reefsStore.publicReefs;
  return {
    total: reefs.length,
    totalArea: reefs.reduce((acc, r) => acc + (Number(r.area) || 0), 0),
    alertCount: reefs.filter(
      (r) => r.status === "alert" || r.status === "bleaching"
    ).length,
  };
});

const topAlerts = computed(() =>
  [...bleachingAlerts]
    .filter((a) => a.level !== "no_stress")
    .sort((a, b) => b.dhw - a.dhw)
    .slice(0, 6)
);

const reefName = (id: number) =>
  reefsStore.publicReefs.find((r) => r.id === id)?.name ?? "Sitio";

const topContributors = computed(() =>
  contributorsStore.leaderboard.slice(0, 3)
);

// Sufijo no-numérico del display de cada KPI (ej. "15k" → "k", "12" → "").
// Se anexa al número animado para mantener "15k" tras la animación.
const kpiSuffix = (k: { value: string; rawValue: number }) => {
  const numericPart = String(Math.round(k.rawValue));
  return k.value.startsWith(numericPart)
    ? k.value.slice(numericPart.length)
    : "";
};
</script>

<style scoped>
/* ── Foto real de arrecife como protagonista, tinte teal y atmósfera encima ── */
.hero-section {
  --hero-reef-image: url("/images/hero-reef.jpg");
  background: radial-gradient(
      ellipse 90% 60% at 50% 0%,
      rgba(11, 86, 109, 0.55) 0%,
      transparent 60%
    ),
    linear-gradient(
      180deg,
      #02141c 0%,
      #052731 22%,
      #08475a 55%,
      #0e7490 85%,
      #0891b2 100%
    );
}
.hero-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 0;
}

.hero-photo {
  position: absolute;
  inset: 0;
  background-image: var(--hero-reef-image),
    url("https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=2400&q=80");
  background-size: cover;
  background-position: center 40%;
  background-repeat: no-repeat;
  z-index: 0;
  filter: saturate(1.1) contrast(1.05);
  animation: photo-pan 30s ease-in-out infinite alternate;
}

.hero-photo-tint {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(
      180deg,
      rgba(2, 20, 28, 0.55) 0%,
      rgba(8, 71, 90, 0.35) 50%,
      rgba(2, 20, 28, 0.85) 100%
    ),
    linear-gradient(
      140deg,
      rgba(14, 116, 144, 0.35) 0%,
      rgba(8, 145, 178, 0.15) 100%
    );
  mix-blend-mode: multiply;
}

.hero-bathymetry {
  position: absolute;
  inset: -10%;
  background: repeating-radial-gradient(
      circle at 18% 82%,
      transparent 0,
      transparent 40px,
      rgba(255, 255, 255, 0.06) 40px,
      rgba(255, 255, 255, 0.06) 41px
    ),
    repeating-radial-gradient(
      circle at 82% 18%,
      transparent 0,
      transparent 56px,
      rgba(255, 255, 255, 0.05) 56px,
      rgba(255, 255, 255, 0.05) 57px
    ),
    repeating-radial-gradient(
      circle at 50% 50%,
      transparent 0,
      transparent 78px,
      rgba(34, 211, 238, 0.04) 78px,
      rgba(34, 211, 238, 0.04) 79px
    );
  z-index: 2;
  mix-blend-mode: screen;
  opacity: 0.35;
  animation: drift-slow 60s linear infinite;
  pointer-events: none;
}

.hero-caustics {
  position: absolute;
  inset: -5% -5% 30% -5%;
  background: radial-gradient(
      ellipse 60% 35% at 30% 0%,
      rgba(34, 211, 238, 0.18) 0%,
      transparent 70%
    ),
    radial-gradient(
      ellipse 40% 25% at 75% 5%,
      rgba(255, 255, 255, 0.1) 0%,
      transparent 65%
    );
  z-index: 2;
  filter: blur(2px);
  animation: caustic-drift 18s ease-in-out infinite;
  pointer-events: none;
}

.lava-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(36px);
  transform: translate3d(0, 0, 0);
  will-change: transform;
  mix-blend-mode: screen;
  opacity: 0.45;
  z-index: 3;
  pointer-events: none;
}
.orb--c1 {
  width: 340px;
  height: 340px;
  top: 25%;
  right: 18%;
  background: radial-gradient(
    circle,
    rgba(255, 122, 102, 0.5) 0%,
    rgba(255, 122, 102, 0) 70%
  );
  animation: lavaD 12s ease-in-out infinite;
}
.orb--c2 {
  width: 260px;
  height: 260px;
  bottom: 12%;
  right: -60px;
  background: radial-gradient(
    circle,
    rgba(245, 158, 11, 0.4) 0%,
    rgba(245, 158, 11, 0) 70%
  );
  animation: lavaA 14s ease-in-out infinite;
}

.hero-vignette {
  position: absolute;
  inset: auto 0 0 0;
  height: 40%;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(2, 20, 28, 0.85) 100%
  );
  z-index: 4;
  pointer-events: none;
}

@keyframes photo-pan {
  0% {
    transform: scale(1.04) translate3d(0, 0, 0);
  }
  100% {
    transform: scale(1.08) translate3d(-12px, -8px, 0);
  }
}
@keyframes lavaA {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  25% {
    transform: translate3d(50px, 20px, 0) scale(1.06);
  }
  50% {
    transform: translate3d(15px, 50px, 0) scale(0.95);
  }
  75% {
    transform: translate3d(-30px, 30px, 0) scale(1.04);
  }
}
@keyframes lavaD {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  33% {
    transform: translate3d(20px, -15px, 0) scale(1.05);
  }
  66% {
    transform: translate3d(-12px, 18px, 0) scale(0.97);
  }
}
@keyframes caustic-drift {
  0%,
  100% {
    transform: translateX(0) scale(1);
    opacity: 0.8;
  }
  50% {
    transform: translateX(40px) scale(1.06);
    opacity: 1;
  }
}
@keyframes drift-slow {
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(-30px, -20px, 0);
  }
}

.reef-stack {
  position: relative;
  height: 380px;
  z-index: 5;
}
.reef-card {
  position: absolute;
  padding: 16px 18px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(12px);
  box-shadow: 0 12px 32px -8px rgba(0, 0, 0, 0.35);
  width: 220px;
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.reef-card:hover {
  transform: scale(1.04) translateZ(0);
}
.reef-card--1 {
  top: 0;
  right: 60px;
  animation: floatY 6s ease-in-out infinite;
}
.reef-card--2 {
  top: 130px;
  right: -10px;
  animation: floatY 7s ease-in-out infinite reverse;
}
.reef-card--3 {
  top: 240px;
  right: 80px;
  animation: floatY 8s ease-in-out infinite;
}
@keyframes floatY {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .lava-orb,
  .reef-card,
  .hero-caustics,
  .hero-bathymetry,
  .hero-photo {
    animation: none;
  }
}
</style>

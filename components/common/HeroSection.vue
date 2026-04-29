<script setup lang="ts">
defineProps<{ compact?: boolean }>()
</script>

<template>
  <section
    class="hero-section relative flex items-center overflow-hidden"
    :class="compact ? 'py-10 md:py-12' : 'py-12 md:py-16'"
  >
    <div class="hero-bg" aria-hidden="true">
      <div class="hero-bathymetry" />
      <div class="hero-tile-grid" />
      <div class="hero-caustics" />
      <span class="lava-orb orb--p1" />
      <span class="lava-orb orb--p2" />
      <span class="lava-orb orb--p3" />
      <span class="lava-orb orb--c1" />
      <span class="lava-orb orb--c2" />
      <div class="hero-vignette" />
    </div>
    <div class="container-wide relative z-10">
      <slot />
    </div>
  </section>
</template>

<style scoped>
/* ── Base ocean gradient — deeper Allen Coral Atlas-style abyss ── */
.hero-section {
  background:
    radial-gradient(ellipse 90% 60% at 50% 0%, rgba(11, 86, 109, 0.55) 0%, transparent 60%),
    linear-gradient(180deg, #02141C 0%, #052731 22%, #08475A 55%, #0E7490 85%, #0891B2 100%);
}

.hero-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 0;
}

/* ── Bathymetric isobaths — concentric topographic rings (CSS-only) ── */
.hero-bathymetry {
  position: absolute;
  inset: -10%;
  background:
    repeating-radial-gradient(
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
  z-index: 0;
  mix-blend-mode: screen;
  opacity: 0.85;
  animation: drift-slow 60s linear infinite;
}

/* ── Satellite tile mosaic — inspired by Allen Coral Atlas 5m benthic classification ── */
.hero-tile-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  background-size: 64px 64px, 64px 64px;
  z-index: 1;
  -webkit-mask-image: radial-gradient(ellipse 70% 80% at 50% 50%, black 0%, rgba(0, 0, 0, 0.4) 50%, transparent 100%);
          mask-image: radial-gradient(ellipse 70% 80% at 50% 50%, black 0%, rgba(0, 0, 0, 0.4) 50%, transparent 100%);
}

/* ── Surface caustics — light filtering from above ── */
.hero-caustics {
  position: absolute;
  inset: -5% -5% 30% -5%;
  background:
    radial-gradient(ellipse 60% 35% at 30% 0%, rgba(34, 211, 238, 0.22) 0%, transparent 70%),
    radial-gradient(ellipse 40% 25% at 75% 5%, rgba(255, 255, 255, 0.10) 0%, transparent 65%);
  z-index: 1;
  animation: caustic-drift 18s ease-in-out infinite;
  filter: blur(2px);
}

/* ── Lava orbs (legacy, toned down so bathymetry breathes) ── */
.lava-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(36px);
  transform: translate3d(0, 0, 0);
  will-change: transform;
  mix-blend-mode: screen;
  opacity: 0.6;
  z-index: 2;
}

.orb--p1 {
  width: 560px; height: 560px;
  top: -180px; left: -120px;
  background: radial-gradient(circle, rgba(34, 211, 238, 0.7) 0%, rgba(34, 211, 238, 0) 70%);
  animation: lavaA 11s ease-in-out infinite;
}
.orb--p2 {
  width: 480px; height: 480px;
  top: -60px; right: -100px;
  background: radial-gradient(circle, rgba(14, 116, 144, 0.85) 0%, rgba(14, 116, 144, 0) 70%);
  animation: lavaB 13s ease-in-out infinite;
}
.orb--p3 {
  width: 600px; height: 600px;
  bottom: -200px; left: 30%;
  background: radial-gradient(circle, rgba(8, 145, 178, 0.65) 0%, rgba(8, 145, 178, 0) 70%);
  animation: lavaC 16s ease-in-out infinite;
}
.orb--c1 {
  width: 340px; height: 340px;
  top: 25%; right: 18%;
  background: radial-gradient(circle, rgba(255, 122, 102, 0.5) 0%, rgba(255, 122, 102, 0) 70%);
  animation: lavaD 12s ease-in-out infinite;
  opacity: 0.45;
}
.orb--c2 {
  width: 260px; height: 260px;
  bottom: 12%; right: -60px;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.4) 0%, rgba(245, 158, 11, 0) 70%);
  animation: lavaA 14s ease-in-out infinite;
  opacity: 0.4;
}

/* ── Bottom-edge depth vignette — pulls eye toward content ── */
.hero-vignette {
  position: absolute;
  inset: auto 0 0 0;
  height: 35%;
  background: linear-gradient(180deg, transparent 0%, rgba(2, 20, 28, 0.6) 100%);
  z-index: 3;
  pointer-events: none;
}

@keyframes lavaA {
  0%,100% { transform: translate3d(0, 0, 0) scale(1); }
  25% { transform: translate3d(50px, 20px, 0) scale(1.06); }
  50% { transform: translate3d(15px, 50px, 0) scale(0.95); }
  75% { transform: translate3d(-30px, 30px, 0) scale(1.04); }
}
@keyframes lavaB {
  0%,100% { transform: translate3d(0, 0, 0) scale(1); }
  25% { transform: translate3d(-40px, 30px, 0) scale(1.05); }
  50% { transform: translate3d(-60px, 8px, 0) scale(0.93); }
  75% { transform: translate3d(-15px, -20px, 0) scale(1.03); }
}
@keyframes lavaC {
  0%,100% { transform: translate3d(0, 0, 0) scale(1); }
  25% { transform: translate3d(30px, -40px, 0) scale(1.08); }
  50% { transform: translate3d(70px, -15px, 0) scale(0.92); }
  75% { transform: translate3d(20px, -45px, 0) scale(1.05); }
}
@keyframes lavaD {
  0%,100% { transform: translate3d(0, 0, 0) scale(1); }
  33% { transform: translate3d(20px, -15px, 0) scale(1.05); }
  66% { transform: translate3d(-12px, 18px, 0) scale(0.97); }
}
@keyframes caustic-drift {
  0%,100% { transform: translateX(0) scale(1); opacity: 0.8; }
  50% { transform: translateX(40px) scale(1.06); opacity: 1; }
}
@keyframes drift-slow {
  0% { transform: translate3d(0, 0, 0); }
  100% { transform: translate3d(-30px, -20px, 0); }
}

@media (prefers-reduced-motion: reduce) {
  .lava-orb,
  .hero-caustics,
  .hero-bathymetry { animation: none; }
}
</style>

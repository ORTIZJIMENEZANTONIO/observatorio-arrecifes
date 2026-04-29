<script setup lang="ts">
defineProps<{ compact?: boolean }>()
</script>

<template>
  <section
    class="hero-section relative flex items-center overflow-hidden"
    :class="compact ? 'py-10 md:py-12' : 'py-12 md:py-16'"
  >
    <div class="hero-bg" aria-hidden="true">
      <span class="lava-orb orb--p1" />
      <span class="lava-orb orb--p2" />
      <span class="lava-orb orb--p3" />
      <span class="lava-orb orb--c1" />
      <span class="lava-orb orb--c2" />
    </div>
    <div class="container-wide relative z-10">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  background: linear-gradient(160deg, #062E3B 0%, #0B566D 35%, #0E7490 70%, #06B6D4 100%);
}

.hero-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 0;
}

.lava-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(28px);
  transform: translate3d(0, 0, 0);
  will-change: transform;
  mix-blend-mode: screen;
  opacity: 0.85;
}

.orb--p1 {
  width: 620px; height: 620px;
  top: -180px; left: -120px;
  background: radial-gradient(circle, rgba(34, 211, 238, 0.7) 0%, rgba(34, 211, 238, 0) 70%);
  animation: lavaA 11s ease-in-out infinite;
}
.orb--p2 {
  width: 520px; height: 520px;
  top: -60px; right: -100px;
  background: radial-gradient(circle, rgba(14, 116, 144, 0.85) 0%, rgba(14, 116, 144, 0) 70%);
  animation: lavaB 13s ease-in-out infinite;
}
.orb--p3 {
  width: 660px; height: 660px;
  bottom: -180px; left: 30%;
  background: radial-gradient(circle, rgba(8, 145, 178, 0.75) 0%, rgba(8, 145, 178, 0) 70%);
  animation: lavaC 16s ease-in-out infinite;
}
.orb--c1 {
  width: 380px; height: 380px;
  top: 25%; right: 18%;
  background: radial-gradient(circle, rgba(255, 122, 102, 0.55) 0%, rgba(255, 122, 102, 0) 70%);
  animation: lavaD 12s ease-in-out infinite;
  opacity: 0.55;
}
.orb--c2 {
  width: 280px; height: 280px;
  bottom: 12%; right: -60px;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.45) 0%, rgba(245, 158, 11, 0) 70%);
  animation: lavaA 14s ease-in-out infinite;
  opacity: 0.45;
}

@keyframes lavaA {
  0%   { transform: translate3d(0, 0, 0) scale(1); }
  25%  { transform: translate3d(50px, 20px, 0) scale(1.06); }
  50%  { transform: translate3d(15px, 50px, 0) scale(0.95); }
  75%  { transform: translate3d(-30px, 30px, 0) scale(1.04); }
  100% { transform: translate3d(0, 0, 0) scale(1); }
}
@keyframes lavaB {
  0%   { transform: translate3d(0, 0, 0) scale(1); }
  25%  { transform: translate3d(-40px, 30px, 0) scale(1.05); }
  50%  { transform: translate3d(-60px, 8px, 0) scale(0.93); }
  75%  { transform: translate3d(-15px, -20px, 0) scale(1.03); }
  100% { transform: translate3d(0, 0, 0) scale(1); }
}
@keyframes lavaC {
  0%   { transform: translate3d(0, 0, 0) scale(1); }
  25%  { transform: translate3d(30px, -40px, 0) scale(1.08); }
  50%  { transform: translate3d(70px, -15px, 0) scale(0.92); }
  75%  { transform: translate3d(20px, -45px, 0) scale(1.05); }
  100% { transform: translate3d(0, 0, 0) scale(1); }
}
@keyframes lavaD {
  0%   { transform: translate3d(0, 0, 0) scale(1); }
  33%  { transform: translate3d(20px, -15px, 0) scale(1.05); }
  66%  { transform: translate3d(-12px, 18px, 0) scale(0.97); }
  100% { transform: translate3d(0, 0, 0) scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .lava-orb { animation: none; }
}
</style>

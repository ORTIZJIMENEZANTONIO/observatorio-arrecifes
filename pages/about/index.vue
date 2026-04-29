<template>
  <div>
    <CommonHeroSection compact>
      <div class="max-w-3xl">
        <span class="badge-coral mb-3 bg-white/15 text-white">Sobre el observatorio</span>
        <h1 class="font-display text-3xl font-extrabold text-white md:text-5xl">Una plataforma viva, abierta y verificada</h1>
        <p class="mt-3 text-base text-white/80 md:text-lg">
          Herramienta de monitoreo y memoria de los arrecifes coralinos de México. Combina
          satélites, datos abiertos y el conocimiento de quienes habitan la costa.
        </p>
      </div>
    </CommonHeroSection>

    <section class="section-padding-sm">
      <div class="container-narrow">
        <div class="prose prose-slate max-w-none">
          <h2 id="mission" class="text-2xl font-bold text-ink">Por qué existe</h2>
          <p class="text-base text-slate-custom">
            Los arrecifes coralinos mexicanos enfrentan presiones simultáneas: estrés térmico,
            blanqueamiento, sargazo, desarrollo costero, sobrepesca, derrames y enfermedades como SCTLD.
            La información existe pero está fragmentada entre dependencias, universidades y sensores
            satelitales. Este observatorio reúne esa información en un solo lugar y la pone al servicio
            de comunidades, tomadores de decisión y la ciudadanía.
          </p>

          <h2 id="inspiration" class="mt-10 text-2xl font-bold text-ink">Inspiraciones</h2>
          <ul class="text-base text-slate-custom">
            <li><strong>Allen Coral Atlas</strong> — mapas globales de hábitat bentónico a 5 m con monitoreo de blanqueamiento.</li>
            <li><strong>EJAtlas</strong> — cartografía global de conflictos socioambientales con perspectiva de justicia ambiental.</li>
            <li><strong>NOAA Coral Reef Watch</strong> — alertas operacionales de estrés térmico.</li>
            <li><strong>CONABIO Geoportal</strong> — capas oficiales de México (ANP, arrecifes coralinos).</li>
          </ul>

          <h2 id="sources" class="mt-10 text-2xl font-bold text-ink">Jerarquía de fuentes</h2>
          <ol class="text-base text-slate-custom">
            <li><strong>Datos satelitales operacionales</strong> (NOAA CRW, NASA OB.DAAC, ESA Copernicus, USGS).</li>
            <li><strong>Bases académicas indexadas</strong> (Web of Science, Scopus, SciELO, Redalyc).</li>
            <li><strong>Fuentes institucionales mexicanas</strong> (CONANP, CONABIO, INEGI, SEMARNAT).</li>
            <li><strong>Aportes de la red</strong> validados por revisores con perfil verificado.</li>
            <li><strong>Prensa y comunicados</strong> solo como complemento, nunca como fuente primaria.</li>
          </ol>

          <h2 id="reputation" class="mt-10 text-2xl font-bold text-ink">Sistema de reputación</h2>
          <p class="text-base text-slate-custom">
            Inspirado en plataformas como Mercado Libre o Rappi: tu rango sube con cada aporte
            validado, ponderando calidad y consistencia, no solo volumen.
          </p>
          <table class="my-6 w-full text-sm">
            <thead class="bg-surface-cool">
              <tr>
                <th class="px-3 py-2 text-left">Rango</th>
                <th class="px-3 py-2 text-left">Umbral</th>
                <th class="px-3 py-2 text-left">Requisitos típicos</th>
              </tr>
            </thead>
            <tbody>
              <tr><td class="border-t px-3 py-2 font-semibold">Bronce</td><td class="border-t px-3 py-2">0–199 pts</td><td class="border-t px-3 py-2">Primer aporte validado.</td></tr>
              <tr><td class="border-t px-3 py-2 font-semibold">Plata</td><td class="border-t px-3 py-2">200–499 pts</td><td class="border-t px-3 py-2">30+ aportes validados.</td></tr>
              <tr><td class="border-t px-3 py-2 font-semibold">Oro</td><td class="border-t px-3 py-2">500–699 pts</td><td class="border-t px-3 py-2">60+ aportes, calidad ≥75%.</td></tr>
              <tr><td class="border-t px-3 py-2 font-semibold">Platino</td><td class="border-t px-3 py-2">700–999 pts</td><td class="border-t px-3 py-2">90+ aportes, calidad ≥85%, 6+ meses activo.</td></tr>
              <tr><td class="border-t px-3 py-2 font-semibold text-coral-dark">Coral</td><td class="border-t px-3 py-2">1000+ pts</td><td class="border-t px-3 py-2">Top 1%. Verificación de identidad y trayectoria.</td></tr>
            </tbody>
          </table>

          <h2 id="validation" class="mt-10 text-2xl font-bold text-ink">Cómo se valida un aporte</h2>
          <ol class="text-base text-slate-custom">
            <li>El aporte se envía con metadatos (ubicación, fecha, tipo, adjuntos).</li>
            <li>Un <strong>revisor</strong> con permiso <code>review_submissions</code> lo evalúa: ubicación coherente, metadata consistente, calidad técnica.</li>
            <li>El revisor asigna <strong>calidad 0–100</strong> y publica/rechaza con notas.</li>
            <li>Si la rechaza, el autor puede corregir y reenviar.</li>
            <li>Una vez validado, el aporte aparece público con crédito y suma puntos al autor.</li>
          </ol>

          <h2 id="licenses" class="mt-10 text-2xl font-bold text-ink">Licencias y atribución</h2>
          <p class="text-base text-slate-custom">
            Cada capa preserva su licencia original. Los datos NOAA y NASA son de dominio público;
            ESA Copernicus se redistribuye bajo Copernicus Open Data; Allen Coral Atlas y CONABIO
            requieren atribución (CC BY 4.0); Global Fishing Watch CC BY-NC 4.0. El código del
            observatorio se libera bajo Apache 2.0.
          </p>

          <h2 id="contact" class="mt-10 text-2xl font-bold text-ink">Contacto</h2>
          <p class="text-base text-slate-custom">
            Escríbenos para sumarte como institución, ONG, cooperativa pesquera o universidad.
            Los aportes individuales pasan por
            <NuxtLink to="/contribute" class="text-primary underline-offset-2 hover:underline">contribuir</NuxtLink>.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.prose h2 { scroll-margin-top: 80px; }
</style>

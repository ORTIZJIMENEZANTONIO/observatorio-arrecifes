<template>
  <footer class="bg-primary-800 text-white">
    <div class="container-wide section-padding">
      <div class="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div class="space-y-4 lg:col-span-2">
          <div class="flex items-center gap-2.5">
            <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-secondary to-coral text-white shadow-glow-coral">
              <Icon name="lucide:waves" size="20" />
            </div>
            <div>
              <span class="text-sm font-bold leading-tight">Observatorio de Arrecifes</span>
              <span class="block text-[10px] font-medium uppercase tracking-wider text-secondary-light">México · Vivo</span>
            </div>
          </div>
          <p class="max-w-md text-sm leading-relaxed text-white/70">
            Plataforma viva de monitoreo de arrecifes coralinos de México. Datos satelitales abiertos
            de NASA, NOAA, ESA Copernicus y CONABIO. Conocimiento ciudadano y científico validado.
          </p>
          <div class="rounded-lg border border-white/10 bg-white/5 p-3">
            <p class="text-xs leading-relaxed text-white/60">
              <span class="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-coral-light">Atribución obligatoria</span>
              Todas las capas descargables conservan su licencia y atribución original. Ver
              <NuxtLink to="/data-sources" class="text-coral-light underline-offset-2 hover:underline">capas y datos</NuxtLink>
              para citas.
            </p>
          </div>
        </div>

        <div>
          <h4 class="mb-4 text-xs font-semibold uppercase tracking-wider text-white/50">Explorar</h4>
          <ul class="space-y-2">
            <li v-for="link in quickLinks" :key="link.to">
              <NuxtLink :to="link.to" class="text-sm text-white/70 transition-colors duration-200 hover:text-coral-light">
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div>
          <h4 class="mb-4 text-xs font-semibold uppercase tracking-wider text-white/50">Fuentes principales</h4>
          <ul class="space-y-2 text-sm text-white/70">
            <li><a href="https://coralreefwatch.noaa.gov" target="_blank" rel="noopener noreferrer" class="hover:text-coral-light">NOAA Coral Reef Watch</a></li>
            <li><a href="https://oceancolor.gsfc.nasa.gov" target="_blank" rel="noopener noreferrer" class="hover:text-coral-light">NASA OB.DAAC</a></li>
            <li><a href="https://dataspace.copernicus.eu" target="_blank" rel="noopener noreferrer" class="hover:text-coral-light">ESA Copernicus</a></li>
            <li><a href="http://geoportal.conabio.gob.mx" target="_blank" rel="noopener noreferrer" class="hover:text-coral-light">CONABIO Geoportal</a></li>
            <li><a href="https://allencoralatlas.org" target="_blank" rel="noopener noreferrer" class="hover:text-coral-light">Allen Coral Atlas</a></li>
          </ul>
        </div>
      </div>

      <div class="mt-10 border-t border-white/10 pt-6">
        <div class="mb-5 flex items-center justify-center gap-6">
          <a href="https://www.ipn.mx/" target="_blank" rel="noopener noreferrer" aria-label="CIIEMAD — IPN">
            <img src="/images/logo-ciiemad.png" alt="CIIEMAD" class="h-14 w-auto rounded-full bg-white p-1" loading="lazy" />
          </a>
          <a href="https://www.ipn.mx/" target="_blank" rel="noopener noreferrer" aria-label="Instituto Politécnico Nacional">
            <img src="/images/logo-ipn.svg" alt="Instituto Politécnico Nacional" class="h-12 w-auto brightness-0 invert" loading="lazy" />
          </a>
        </div>
        <p class="text-center text-xs text-white/50">
          Iniciativa del <strong class="font-semibold text-white/70">CIIEMAD</strong> — Centro Interdisciplinario de Investigaciones y Estudios sobre Medio Ambiente y Desarrollo,
          <strong class="font-semibold text-white/70">Instituto Politécnico Nacional</strong>.
        </p>
        <p class="mt-3 text-center text-xs text-white/40">&copy; 2026 Observatorio de Arrecifes — México. Plataforma de datos abiertos. Licencia de software Apache 2.0.</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const quickLinks = [
  { to: '/livemap', label: 'Mapa vivo' },
  { to: '/inventory', label: 'Arrecifes' },
  { to: '/atlas', label: 'Atlas de conflictos' },
  { to: '/data-sources', label: 'Capas y datos abiertos' },
  { to: '/contributors', label: 'Comunidad' },
  { to: '/observations', label: 'Observaciones recientes' },
  { to: '/contribute', label: 'Contribuir' },
  { to: '/about', label: 'Sobre el observatorio' },
]
</script>

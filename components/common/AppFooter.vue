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
              <span class="text-sm font-bold leading-tight">{{ brand?.title ?? 'Observatorio de Arrecifes' }}</span>
              <span class="block text-[10px] font-medium uppercase tracking-wider text-secondary-light">{{ brand?.subtitle }}</span>
            </div>
          </div>
          <p class="max-w-md text-sm leading-relaxed text-white/70">{{ brand?.description }}</p>
          <div v-if="attribution" class="rounded-lg border border-white/10 bg-white/5 p-3">
            <p class="text-xs leading-relaxed text-white/60">
              <span class="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-coral-light">
                {{ attribution.eyebrow }}
              </span>
              {{ attribution.body }}
              <NuxtLink to="/data-sources" class="ml-1 text-coral-light underline-offset-2 hover:underline">
                capas y datos
              </NuxtLink>
            </p>
          </div>
        </div>

        <div>
          <h4 class="mb-4 text-xs font-semibold uppercase tracking-wider text-white/50">Explorar</h4>
          <ul class="space-y-2">
            <li v-for="link in quickLinks" :key="String(link.to)">
              <NuxtLink :to="link.to" class="text-sm text-white/70 transition-colors duration-200 hover:text-coral-light">
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div>
          <h4 class="mb-4 text-xs font-semibold uppercase tracking-wider text-white/50">Fuentes principales</h4>
          <ul class="space-y-2 text-sm text-white/70">
            <li v-for="src in sources" :key="String(src.href)">
              <a :href="src.href" target="_blank" rel="noopener noreferrer" class="hover:text-coral-light">
                {{ src.label }}
              </a>
            </li>
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
        <p v-if="institutional" class="text-center text-xs text-white/50">{{ institutional.body }}</p>
        <p v-if="institutional?.copyright" class="mt-3 text-center text-xs text-white/40">{{ institutional.copyright }}</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const cms = useCmsContent('footer')
const brand = cms.one<{ title: string; subtitle: string; description: string }>('brand')
const attribution = cms.one<{ eyebrow: string; body: string }>('attribution')
const sources = cms.list<{ label: string; href: string }>('sources')
const quickLinks = cms.list<{ label: string; to: string }>('quickLinks')
const institutional = cms.one<{ body: string; copyright: string }>('institutional')
</script>

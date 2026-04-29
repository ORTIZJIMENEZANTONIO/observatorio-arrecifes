<template>
  <div class="flex flex-col h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)]">
    <!-- Toolbar -->
    <div class="border-b border-gray-100 bg-white">
      <div class="container-wide flex flex-wrap items-center gap-3 py-3">
        <div class="flex items-center gap-2">
          <span class="live-dot" />
          <span class="text-xs font-bold uppercase tracking-wider text-coral-dark">En vivo</span>
          <span class="text-xs text-ink-muted">· Última actualización: {{ formatDate(new Date().toISOString()) }}</span>
        </div>
        <div class="hidden md:block h-5 w-px bg-gray-200" />
        <div class="flex flex-wrap items-center gap-2">
          <select v-model="reefsStore.filterStatus" class="select py-1.5 text-xs">
            <option value="all">Todos los estados</option>
            <option value="healthy">Saludable</option>
            <option value="watch">Vigilancia</option>
            <option value="warning">Advertencia</option>
            <option value="alert">Alerta</option>
            <option value="bleaching">Blanqueamiento</option>
          </select>
          <select v-model="reefsStore.filterOcean" class="select py-1.5 text-xs">
            <option value="all">Todos los litorales</option>
            <option value="caribbean">Caribe</option>
            <option value="gulf_of_mexico">Golfo de México</option>
            <option value="pacific">Pacífico</option>
          </select>
        </div>
        <button class="btn-outline btn-sm ml-auto" @click="layersOpen = !layersOpen">
          <Icon name="lucide:layers" size="14" />
          Capas
          <span class="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-50 px-1.5 text-[10px] font-bold text-primary">
            {{ layersStore.activeLayers.length }}
          </span>
        </button>
      </div>
    </div>

    <!-- Map + side panel -->
    <div class="relative flex-1 overflow-hidden">
      <ClientOnly>
        <MapPanel class="absolute inset-0" />
        <template #fallback>
          <div class="absolute inset-0 flex items-center justify-center bg-surface-cool">
            <div class="text-center text-ink-muted">
              <Icon name="lucide:loader-2" size="32" class="animate-spin-smooth" />
              <p class="mt-2 text-sm">Cargando mapa…</p>
            </div>
          </div>
        </template>
      </ClientOnly>

      <!-- Legend -->
      <div class="pointer-events-none absolute bottom-4 left-4 hidden md:block">
        <div class="card-glass pointer-events-auto p-3">
          <p class="mb-2 text-[10px] font-bold uppercase tracking-wider text-ink-muted">Estado del arrecife</p>
          <div class="space-y-1 text-xs">
            <div class="flex items-center gap-2"><span class="h-3 w-3 rounded-full bg-eco" /> Saludable</div>
            <div class="flex items-center gap-2"><span class="h-3 w-3 rounded-full bg-secondary" /> Vigilancia</div>
            <div class="flex items-center gap-2"><span class="h-3 w-3 rounded-full bg-accent" /> Advertencia</div>
            <div class="flex items-center gap-2"><span class="h-3 w-3 rounded-full bg-coral" /> Alerta</div>
            <div class="flex items-center gap-2"><span class="h-3 w-3 rounded-full bg-alert" /> Blanqueamiento</div>
          </div>
        </div>
      </div>

      <!-- Layers panel -->
      <Transition name="slide-right">
        <aside
          v-if="layersOpen"
          class="absolute right-0 top-0 z-[10] flex h-full w-full max-w-sm flex-col border-l border-gray-100 bg-white shadow-2xl"
        >
          <header class="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h2 class="text-lg font-bold text-ink">Capas abiertas</h2>
              <p class="text-xs text-ink-muted">Activa o desactiva capas. Crédito incluido.</p>
            </div>
            <button class="rounded-lg p-1.5 text-ink-muted hover:bg-gray-100" @click="layersOpen = false">
              <Icon name="lucide:x" size="18" />
            </button>
          </header>
          <div class="flex-1 overflow-y-auto p-4 space-y-3">
            <article
              v-for="layer in layersStore.layers"
              :key="layer.id"
              class="card p-3"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0 flex-1">
                  <p class="text-xs font-bold uppercase tracking-wider text-primary">{{ layer.providerLabel }}</p>
                  <h3 class="mt-0.5 text-sm font-semibold text-ink">{{ layer.title }}</h3>
                  <p class="mt-1 line-clamp-2 text-xs text-ink-muted">{{ layer.description }}</p>
                  <div class="mt-2 flex flex-wrap gap-1.5 text-[10px]">
                    <span v-if="layer.resolution" class="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-ink-muted">{{ layer.resolution }}</span>
                    <span v-if="layer.cadence" class="rounded bg-gray-100 px-1.5 py-0.5 text-ink-muted">{{ layer.cadence }}</span>
                    <span class="rounded bg-eco/10 px-1.5 py-0.5 font-semibold text-eco-dark">{{ layer.license }}</span>
                  </div>
                </div>
                <label class="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" :checked="layer.active" class="peer sr-only" @change="layersStore.toggleLayer(layer.id)" />
                  <div class="h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-primary after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </div>
            </article>
          </div>
          <footer class="border-t border-gray-100 px-5 py-3">
            <NuxtLink to="/data-sources" class="btn-outline btn-sm w-full justify-center">
              Catálogo completo de capas
              <Icon name="lucide:arrow-right" size="14" />
            </NuxtLink>
          </footer>
        </aside>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useReefsStore } from '~/stores/reefs'
import { useLayersStore } from '~/stores/layers'

definePageMeta({ pageTransition: false })

const reefsStore = useReefsStore()
const layersStore = useLayersStore()
const layersOpen = ref(false)
const { formatDate } = useFormatters()
</script>

<style scoped>
.slide-right-enter-active { transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1); }
.slide-right-leave-active { transition: transform 0.25s ease-in; }
.slide-right-enter-from, .slide-right-leave-to { transform: translateX(100%); }
</style>

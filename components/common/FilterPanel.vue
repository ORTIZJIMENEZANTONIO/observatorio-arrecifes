<script setup lang="ts">
// Panel de filtros mobile-first reusable.
//
// Comportamiento (unificado):
//   - Por default sólo se muestra la barra de búsqueda + un botón "Filtros" con
//     contador de activos. La barra y el botón funcionan igual en mobile y
//     desktop.
//   - Al apretar el botón:
//       · Mobile (< md): abre un drawer fixed bottom-sheet con todos los filtros.
//       · Desktop (≥ md): expande el panel inline debajo de la barra.
//   - Filtros se aplican en vivo. El botón de cerrar (mobile) o un segundo
//     click al toggle (desktop) regresa al estado collapsado.
//
// API:
//   - `activeCount` (número de filtros activos no-default) — el caller lo
//     calcula y se lo pasa. Aparece como badge en el botón.
//   - `total` (número total de items) y `filtered` (número filtrado) →
//     muestra "N de M resultados".
//   - `searchQuery` v-modelable (input principal de texto siempre visible).
//   - Slot `default` → el caller mete sus selectores/range/etc.
//   - Slot `chips` (opcional) → chips de filtros activos con X individual.
//   - Evento `clear` cuando el usuario aprieta "Limpiar filtros".
import { useScrollLock } from '@vueuse/core'

defineProps<{
  activeCount: number
  total: number
  filtered: number
  searchPlaceholder?: string
}>()

const searchQuery = defineModel<string>('searchQuery', { default: '' })

defineEmits<{
  (e: 'clear'): void
}>()

// Estado unificado: open/closed para mobile drawer y desktop inline expand.
const panelOpen = ref(false)

// Detección de viewport para decidir entre drawer (mobile) e inline (desktop).
// Inicia en false (SSR-safe) y se sincroniza en mounted.
const isDesktop = ref(false)
let mql: MediaQueryList | null = null
const onMqlChange = (e: MediaQueryListEvent | MediaQueryList) => {
  isDesktop.value = e.matches
}
onMounted(() => {
  if (typeof window === 'undefined') return
  mql = window.matchMedia('(min-width: 768px)')
  isDesktop.value = mql.matches
  mql.addEventListener('change', onMqlChange)
})
onBeforeUnmount(() => {
  if (mql) mql.removeEventListener('change', onMqlChange)
})

// Bloqueo de scroll del body sólo cuando el drawer mobile está abierto.
const isLocked = useScrollLock(typeof document !== 'undefined' ? document.body : (null as any))
watch([panelOpen, isDesktop], ([open, desktop]) => {
  isLocked.value = open && !desktop
})

const toggle = () => { panelOpen.value = !panelOpen.value }
const close = () => { panelOpen.value = false }
</script>

<template>
  <div>
    <!-- ── Barra superior unificada (search + botón filtros) ── -->
    <div class="flex items-center gap-2">
      <div class="input-icon-wrapper grow md:max-w-sm">
        <Icon name="lucide:search" size="16" class="input-icon" />
        <input
          v-model="searchQuery"
          type="search"
          class="input"
          :placeholder="searchPlaceholder || 'Buscar…'"
        />
      </div>
      <button
        type="button"
        class="relative shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-gray-50 active:bg-gray-100 dark:border-white/10 dark:bg-transparent dark:hover:bg-white/5"
        :class="panelOpen && isDesktop ? 'border-primary/40 bg-primary/5 text-primary' : ''"
        :aria-expanded="panelOpen"
        :aria-label="panelOpen ? 'Cerrar filtros' : 'Abrir filtros'"
        @click="toggle"
      >
        <span class="flex items-center gap-1.5">
          <Icon name="lucide:sliders-horizontal" size="16" />
          <span class="hidden sm:inline">Filtros</span>
        </span>
        <span
          v-if="activeCount > 0"
          class="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-coral px-1 text-[10px] font-bold text-white"
        >
          {{ activeCount }}
        </span>
      </button>
    </div>

    <!-- ── Línea de resultados + acción "Limpiar" ── -->
    <div class="mt-2 flex items-center justify-between text-xs text-ink-muted">
      <span>{{ filtered }} de {{ total }} resultados</span>
      <button
        v-if="activeCount > 0"
        type="button"
        class="font-semibold text-primary hover:underline"
        @click="$emit('clear')"
      >
        Limpiar filtros
      </button>
    </div>

    <!-- Chips activos (slot opcional, visibles cuando el panel está cerrado) -->
    <div v-if="activeCount > 0 && !panelOpen" class="mt-2 flex flex-wrap gap-1.5">
      <slot name="chips" />
    </div>

    <!-- ── Desktop: panel expandible inline ── -->
    <Transition name="filters-expand">
      <div
        v-if="panelOpen && isDesktop"
        class="mt-3 hidden md:block"
      >
        <div class="card p-4 lg:p-5">
          <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <slot />
          </div>
          <div v-if="activeCount > 0" class="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3 dark:border-white/10">
            <slot name="chips" />
            <button
              type="button"
              class="ml-auto text-xs font-semibold text-primary hover:underline"
              @click="$emit('clear')"
            >
              <Icon name="lucide:x" size="12" class="mr-0.5 inline" />
              Limpiar todos
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ── Mobile: drawer (full-screen bottom sheet) ── -->
    <Teleport to="body">
      <Transition name="drawer-fade">
        <div
          v-if="panelOpen && !isDesktop"
          class="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm md:hidden"
          @click="close"
        />
      </Transition>
      <Transition name="drawer-slide">
        <div
          v-if="panelOpen && !isDesktop"
          class="fixed bottom-0 left-0 right-0 z-[101] flex max-h-[85vh] flex-col rounded-t-2xl bg-white shadow-2xl md:hidden dark:bg-ink"
        >
          <header class="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-white/10">
            <h2 class="text-base font-semibold text-ink">Filtros</h2>
            <button
              class="rounded-lg p-1.5 text-ink-muted hover:bg-gray-100 dark:hover:bg-white/5"
              aria-label="Cerrar filtros"
              @click="close"
            >
              <Icon name="lucide:x" size="20" />
            </button>
          </header>
          <div class="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            <slot />
          </div>
          <footer class="flex items-center gap-2 border-t border-gray-100 bg-white px-4 py-3 dark:border-white/10 dark:bg-ink">
            <button
              v-if="activeCount > 0"
              type="button"
              class="grow rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-ink-muted hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"
              @click="$emit('clear')"
            >
              Limpiar
            </button>
            <button
              type="button"
              class="grow rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-light"
              @click="close"
            >
              Ver {{ filtered }} resultado(s)
            </button>
          </footer>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.drawer-fade-enter-active,
.drawer-fade-leave-active { transition: opacity 0.25s ease; }
.drawer-fade-enter-from,
.drawer-fade-leave-to { opacity: 0; }

.drawer-slide-enter-active,
.drawer-slide-leave-active { transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1); }
.drawer-slide-enter-from,
.drawer-slide-leave-to { transform: translateY(100%); }

.filters-expand-enter-active,
.filters-expand-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
  transform-origin: top;
}
.filters-expand-enter-from,
.filters-expand-leave-to {
  opacity: 0;
  transform: scaleY(0.96) translateY(-4px);
}
</style>

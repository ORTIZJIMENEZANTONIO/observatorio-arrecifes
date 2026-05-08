<script setup lang="ts">
// Toggle de modo claro/oscuro. Usa @nuxtjs/color-mode (`useColorMode()`).
// Persiste preferencia en localStorage automáticamente; classSuffix vacío
// añade `class="dark"` al <html>.
const props = defineProps<{
  variant?: 'icon' | 'menu' // icon = botón circular compacto; menu = item con texto
}>()
const variant = props.variant || 'icon'

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const toggle = () => {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>

<template>
  <button
    v-if="variant === 'icon'"
    type="button"
    class="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-gray-100 active:bg-gray-200 dark:hover:bg-white/5 dark:active:bg-white/10"
    :title="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
    :aria-label="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
    @click="toggle"
  >
    <ClientOnly>
      <Icon
        :name="isDark ? 'lucide:sun' : 'lucide:moon'"
        size="18"
        class="text-ink-muted transition-transform"
        :class="isDark ? 'rotate-180' : ''"
      />
      <template #fallback>
        <Icon name="lucide:moon" size="18" class="text-ink-muted" />
      </template>
    </ClientOnly>
  </button>

  <button
    v-else
    type="button"
    class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-ink-muted dark:hover:bg-white/5"
    @click="toggle"
  >
    <ClientOnly>
      <Icon :name="isDark ? 'lucide:sun' : 'lucide:moon'" size="14" />
      <span>{{ isDark ? 'Modo claro' : 'Modo oscuro' }}</span>
      <template #fallback>
        <Icon name="lucide:moon" size="14" />
        <span>Modo</span>
      </template>
    </ClientOnly>
  </button>
</template>

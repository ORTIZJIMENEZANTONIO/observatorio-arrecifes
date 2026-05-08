<script setup lang="ts">
// Selector de idioma. Usa @nuxtjs/i18n. La preferencia persiste en cookie
// (ver `detectBrowserLanguage.useCookie` en nuxt.config.ts).
const props = defineProps<{
  variant?: 'icon' | 'menu' // icon = toggle compacto en header; menu = item con texto en drawer/sidebar
}>()
const variant = props.variant || 'icon'

const { locale, locales, setLocale } = useI18n()

const available = computed(() =>
  (locales.value as Array<{ code: string; name: string }>).filter((l) => l.code !== locale.value),
)

const otherLocale = computed(() => available.value[0])

const currentName = computed(() => {
  const l = (locales.value as Array<{ code: string; name: string }>).find((x) => x.code === locale.value)
  return l?.name ?? locale.value.toUpperCase()
})

const cycle = () => {
  if (otherLocale.value) setLocale(otherLocale.value.code as any)
}
</script>

<template>
  <button
    v-if="variant === 'icon'"
    type="button"
    class="flex h-10 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold uppercase tracking-wider text-ink-muted transition-colors hover:bg-gray-100 active:bg-gray-200 dark:hover:bg-white/5 dark:active:bg-white/10"
    :title="`Idioma actual: ${currentName}`"
    aria-label="Cambiar idioma"
    @click="cycle"
  >
    <Icon name="lucide:languages" size="16" />
    <span>{{ locale.toUpperCase() }}</span>
  </button>

  <button
    v-else
    type="button"
    class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-ink-muted dark:hover:bg-white/5"
    @click="cycle"
  >
    <Icon name="lucide:languages" size="14" />
    <span>{{ $t('common.language') }}: {{ currentName }}</span>
  </button>
</template>

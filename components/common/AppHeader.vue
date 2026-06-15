<template>
  <div>
    <header
      class="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm"
    >
      <div class="container-wide">
        <div class="flex h-14 items-center justify-between gap-3 sm:h-16">
          <NuxtLink to="/" class="group flex shrink-0 items-center gap-2.5">
            <div
              class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-secondary to-coral text-white shadow-glow-coral transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 group-active:scale-95"
            >
              <Icon name="lucide:waves" size="20" />
            </div>
            <div class="hidden sm:block">
              <span class="text-sm font-bold leading-tight text-ink"
                >{{ $t('site.title') }}</span
              >
              <span
                class="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-coral-dark"
              >
                <span class="live-dot" />
                {{ $t('site.subtitle') }}
              </span>
            </div>
          </NuxtLink>

          <nav class="hidden items-center gap-0.5 lg:flex xl:gap-1">
            <NuxtLink
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              :class="[
                'rounded-lg px-2.5 py-2 text-sm font-medium transition-colors duration-200 xl:px-3',
                isActive(link.to)
                  ? 'bg-primary-50 text-primary font-semibold'
                  : 'text-ink-muted hover:bg-primary-50 hover:text-primary',
              ]"
            >
              {{ link.label }}
            </NuxtLink>
          </nav>

          <div class="flex items-center gap-2 sm:gap-3">
            <div class="hidden items-center gap-2 md:flex">
              <a
                href="https://www.ipn.mx/"
                target="_blank"
                rel="noopener noreferrer"
                class="shrink-0"
                aria-label="CIIEMAD — IPN"
              >
                <img
                  src="/images/logo-ciiemad.png"
                  alt="CIIEMAD"
                  class="h-8 w-auto lg:h-9"
                  loading="lazy"
                />
              </a>
              <a
                href="https://www.ipn.mx/"
                target="_blank"
                rel="noopener noreferrer"
                class="shrink-0"
                aria-label="Instituto Politécnico Nacional"
              >
                <img
                  src="/images/logo-ipn.svg"
                  alt="Instituto Politécnico Nacional"
                  class="h-8 w-auto lg:h-9"
                  loading="lazy"
                />
              </a>
            </div>

            <CommonLocaleSwitcher />

            <NuxtLink
              to="/contribute"
              class="btn-coral btn-sm hidden lg:inline-flex"
            >
              <Icon name="lucide:plus" size="16" />
              {{ $t('site.contribute') }}
            </NuxtLink>

            <button
              class="flex h-10 w-10 items-center justify-center rounded-lg text-ink transition-colors hover:bg-gray-100 active:bg-gray-200 lg:hidden"
              :aria-label="$t('site.openMenu')"
              @click="mobileOpen = true"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>

    <Transition name="mobile-overlay">
      <div
        v-if="mobileOpen"
        class="fixed inset-0 z-[200] bg-black/30 backdrop-blur-sm lg:hidden"
        @click="mobileOpen = false"
      />
    </Transition>
    <Transition name="mobile-drawer">
      <div
        v-if="mobileOpen"
        class="fixed right-0 top-0 z-[201] flex h-full w-72 flex-col bg-white shadow-2xl lg:hidden"
      >
        <div
          class="flex items-center justify-between border-b border-gray-100 px-4 py-4"
        >
          <div class="flex items-center gap-2.5">
            <div
              class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-secondary to-coral text-white shadow-glow-coral"
            >
              <Icon name="lucide:waves" size="18" />
            </div>
            <div>
              <span class="block text-sm font-bold leading-tight text-ink"
                >{{ $t('site.title') }}</span
              >
              <span
                class="block text-[10px] font-medium uppercase tracking-wider text-coral-dark"
                >{{ $t('site.subtitle') }}</span
              >
            </div>
          </div>
          <button
            class="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted hover:bg-gray-100"
            :aria-label="$t('site.closeMenu')"
            @click="mobileOpen = false"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <nav class="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            :class="[
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive(link.to)
                ? 'bg-primary-50 text-primary font-semibold'
                : 'text-ink-muted hover:bg-primary-50 hover:text-primary',
            ]"
            @click="mobileOpen = false"
          >
            <Icon :name="link.icon" size="18" class="shrink-0" />
            {{ link.label }}
          </NuxtLink>
          <div class="my-2 border-t border-gray-100" />
          <NuxtLink
            v-for="link in secondaryLinks"
            :key="link.to"
            :to="link.to"
            :class="[
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive(link.to)
                ? 'bg-primary-50 text-primary font-semibold'
                : 'text-ink-muted hover:bg-primary-50 hover:text-primary',
            ]"
            @click="mobileOpen = false"
          >
            <Icon :name="link.icon" size="18" class="shrink-0" />
            {{ link.label }}
          </NuxtLink>
        </nav>
        <div class="space-y-3 border-t border-gray-100 p-4">
          <CommonLocaleSwitcher variant="menu" />
          <CommonColorModeToggle variant="menu" />
          <div class="flex items-center justify-center gap-4">
            <a
              href="https://www.ipn.mx/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/images/logo-ciiemad.png"
                alt="CIIEMAD"
                class="h-10 w-auto"
                loading="lazy"
              />
            </a>
            <a
              href="https://www.ipn.mx/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/images/logo-ipn.svg"
                alt="Instituto Politécnico Nacional"
                class="h-9 w-auto"
                loading="lazy"
              />
            </a>
          </div>
          <NuxtLink
            to="/contribute"
            class="btn-coral w-full justify-center"
            @click="mobileOpen = false"
          >
            <Icon name="lucide:plus" size="16" />
            {{ $t('site.contribute') }}
          </NuxtLink>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const { t } = useI18n();

const mobileOpen = ref(false);
// Las labels usan computed para que reaccionen al cambio de locale.
const navLinks = computed(() => [
  { to: "/about", label: t("nav.about"), icon: "lucide:info" },
  { to: "/livemap", label: t("nav.livemap"), icon: "lucide:globe" },
  { to: "/inventory", label: t("nav.inventory"), icon: "lucide:list" },
  { to: "/atlas", label: t("nav.atlas"), icon: "lucide:alert-triangle" },
  { to: "/salud", label: t("nav.health"), icon: "lucide:heart-pulse" },
  { to: "/data-sources", label: t("nav.dataSources"), icon: "lucide:database" },
  { to: "/contributors", label: t("nav.contributors"), icon: "lucide:users" },
  { to: "/noticias", label: t("nav.news"), icon: "lucide:newspaper" },
]);
const secondaryLinks = computed(() => [
  { to: "/observations", label: t("nav.observations"), icon: "lucide:camera" },
  { to: "/policy", label: t("nav.policy"), icon: "lucide:file-text" },
  { to: "/historias", label: t("nav.stories"), icon: "lucide:book-open" },
  { to: "/comparador", label: t("nav.comparator"), icon: "lucide:scale" },
  { to: "/presiones", label: t("nav.pressures"), icon: "lucide:layers-3" },
  { to: "/huracanes", label: t("nav.hurricanes"), icon: "lucide:tornado" },
  { to: "/fenologia", label: t("nav.phenology"), icon: "lucide:calendar-days" },
  { to: "/calendario", label: t("nav.events"), icon: "lucide:calendar-check" },
  { to: "/protocolos", label: t("nav.protocols"), icon: "lucide:book-open-check" },
  { to: "/citar", label: t("nav.cite"), icon: "lucide:quote" },
]);

const route = useRoute();
const isActive = (to: string) =>
  to === "/" ? route.path === "/" : route.path.startsWith(to);
watch(
  () => route.path,
  () => {
    mobileOpen.value = false;
  }
);
</script>

<style scoped>
.mobile-overlay-enter-active,
.mobile-overlay-leave-active {
  transition: opacity 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.mobile-overlay-enter-from,
.mobile-overlay-leave-to {
  opacity: 0;
}
.mobile-drawer-enter-active {
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.mobile-drawer-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 1, 1);
}
.mobile-drawer-enter-from,
.mobile-drawer-leave-to {
  transform: translateX(100%);
}
</style>

<template>
  <div class="flex min-h-screen flex-col bg-surface">
    <CommonAppHeader />
    <main class="container-narrow flex flex-1 flex-col items-center justify-center py-20 text-center">
      <span class="flex h-16 w-16 items-center justify-center rounded-2xl bg-coral/10 text-coral-dark">
        <Icon name="lucide:waves" size="32" />
      </span>
      <h1 class="mt-6 font-display text-3xl font-extrabold text-ink md:text-5xl">
        {{ error?.statusCode === 404 ? 'Página no encontrada' : 'Algo salió mal' }}
      </h1>
      <p class="mt-3 max-w-md text-base text-slate-custom">
        {{ error?.statusMessage ?? 'No pudimos cargar lo que buscas. Vuelve al inicio o explora el mapa vivo.' }}
      </p>
      <div class="mt-8 flex flex-wrap gap-3 justify-center">
        <NuxtLink to="/" class="btn-primary">
          <Icon name="lucide:home" size="16" />
          Inicio
        </NuxtLink>
        <NuxtLink to="/livemap" class="btn-outline">
          <Icon name="lucide:globe" size="16" />
          Abrir mapa vivo
        </NuxtLink>
      </div>
    </main>
    <CommonAppFooter />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  error?: { statusCode?: number; statusMessage?: string }
}>()
</script>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin', pageTransition: false })

import { cmsPageCatalog } from '~/data/cms-defaults'
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 class="text-2xl font-semibold text-ink">Contenido editorial</h2>
        <p class="mt-1 text-sm text-ink-muted">
          Edita el copy visible en cada página pública. Los cambios se publican al guardar y
          aparecen inmediatamente para los visitantes.
        </p>
      </div>
    </div>

    <div class="rounded-lg bg-primary-50/40 p-3 text-xs text-ink-muted">
      <Icon name="lucide:info" size="12" class="inline align-text-top text-primary" />
      Estos textos son los <strong>defaults</strong> mientras nadie los edita. Cuando un editor
      guarda una sección, esa versión se muestra en el sitio público; si la borras vuelves al
      default original.
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="page in cmsPageCatalog"
        :key="page.slug"
        :to="`/admin/contenido/${page.slug}`"
        class="card-interactive group p-5"
      >
        <div class="flex items-start gap-3">
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
          >
            <Icon :name="page.icon" size="20" />
          </span>
          <div class="min-w-0 flex-1">
            <h3 class="text-base font-semibold text-ink group-hover:text-primary">
              {{ page.title }}
              <code class="ml-1 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-normal text-ink-muted">
                {{ page.slug }}
              </code>
            </h3>
            <p class="mt-1 text-sm text-ink-muted">{{ page.description }}</p>
            <p class="mt-2 text-xs text-ink-muted">
              <Icon name="lucide:layers" size="11" class="mr-1 inline" />
              {{ page.sections.length }} {{ page.sections.length === 1 ? 'sección' : 'secciones' }}
            </p>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

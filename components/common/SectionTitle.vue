<template>
  <div class="mb-10" :class="{ 'text-center': centered }">
    <span
      v-if="tag"
      class="mb-2 inline-block rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary"
    >
      {{ tag }}
    </span>
    <h2 class="text-2xl font-bold text-ink md:text-3xl">{{ title }}</h2>
    <p
      v-if="subtitle"
      class="mt-3 max-w-2xl text-base text-slate-custom"
      :class="{ 'mx-auto': centered }"
    >
      {{ subtitle }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  centered?: boolean
  tag?: string
}>()
</script>

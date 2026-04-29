<template>
  <div v-if="totalPages > 1" class="mt-6 flex flex-wrap items-center justify-between gap-3">
    <p class="text-xs text-ink-muted">
      Mostrando <strong class="text-ink">{{ rangeStart }}–{{ rangeEnd }}</strong>
      de <strong class="text-ink">{{ totalItems }}</strong>
    </p>
    <div class="flex items-center gap-1">
      <button class="btn-outline btn-sm" :disabled="currentPage === 1" @click="$emit('update:currentPage', currentPage - 1)">
        <Icon name="lucide:chevron-left" size="14" />
        Anterior
      </button>
      <button
        v-for="p in pageButtons"
        :key="p"
        class="h-8 w-8 rounded-lg text-xs font-semibold transition-colors"
        :class="p === currentPage ? 'bg-primary text-white' : 'text-ink-muted hover:bg-primary-50 hover:text-primary'"
        @click="$emit('update:currentPage', p)"
      >
        {{ p }}
      </button>
      <button class="btn-outline btn-sm" :disabled="currentPage === totalPages" @click="$emit('update:currentPage', currentPage + 1)">
        Siguiente
        <Icon name="lucide:chevron-right" size="14" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  currentPage: number
  totalPages: number
  totalItems: number
  perPage: number
}>()
defineEmits<{ (e: 'update:currentPage', page: number): void }>()

const rangeStart = computed(() => (props.currentPage - 1) * props.perPage + 1)
const rangeEnd = computed(() => Math.min(props.currentPage * props.perPage, props.totalItems))

const pageButtons = computed(() => {
  const pages: number[] = []
  const window = 2
  const start = Math.max(1, props.currentPage - window)
  const end = Math.min(props.totalPages, props.currentPage + window)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})
</script>

<script setup lang="ts">
// Th clickeable para tablas admin. Usado junto con `useSortableList`:
//
//   <AdminSortableTh
//     sort-key="name"
//     :current-key="sortKey"
//     :current-dir="sortDir"
//     align="left"
//     @sort="toggleSort('name')"
//   >
//     Arrecife
//   </AdminSortableTh>
//
// La flecha cambia entre `chevrons-up-down` (inactivo) → `chevron-up` (asc)
// → `chevron-down` (desc). Hover tinta el header de primary para indicar
// interactividad.

import type { SortDirection } from '~/composables/useSortableList'

defineProps<{
  sortKey: string
  currentKey: string | null
  currentDir: SortDirection
  align?: 'left' | 'right' | 'center'
}>()

defineEmits<{ (e: 'sort'): void }>()
</script>

<template>
  <th
    :class="[
      'group cursor-pointer select-none transition-colors hover:text-primary',
      align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left',
    ]"
    role="button"
    tabindex="0"
    :aria-sort="currentKey === sortKey ? (currentDir === 'asc' ? 'ascending' : 'descending') : 'none'"
    @click="$emit('sort')"
    @keydown.enter.prevent="$emit('sort')"
    @keydown.space.prevent="$emit('sort')"
  >
    <span
      class="inline-flex items-center gap-1"
      :class="align === 'right' ? 'flex-row-reverse' : ''"
    >
      <span><slot /></span>
      <Icon
        v-if="currentKey === sortKey"
        :name="currentDir === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'"
        size="12"
        class="text-primary"
      />
      <Icon
        v-else
        name="lucide:chevrons-up-down"
        size="11"
        class="text-ink-muted/40 group-hover:text-primary/60"
      />
    </span>
  </th>
</template>

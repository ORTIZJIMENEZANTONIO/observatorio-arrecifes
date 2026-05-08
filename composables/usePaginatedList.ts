import type { ComputedRef, Ref } from 'vue'

// Helper común para tablas admin: dado un array reactivo, devuelve la slice
// paginada + los refs que `<CommonPaginationControls>` necesita.
//
// Uso:
//   const { paginated, currentPage, totalPages, perPage } = usePaginatedList(filtered, { perPage: 15 })
//
//   <tr v-for="item in paginated" :key="item.id">…</tr>
//   <CommonPaginationControls
//     v-model:current-page="currentPage"
//     :total-pages="totalPages"
//     :total-items="filtered.length"
//     :per-page="perPage"
//   />
//
// Cuando el dataset filtrado cambia (más/menos items), la página actual se
// resetea automáticamente a 1 si quedó fuera de rango — evita ver una página
// vacía después de aplicar un filtro estricto.
export const usePaginatedList = <T>(
  source: Ref<T[]> | ComputedRef<T[]>,
  options: { perPage?: number } = {},
) => {
  const perPage = options.perPage ?? 15
  const currentPage = ref(1)

  const totalPages = computed(() => Math.max(1, Math.ceil(source.value.length / perPage)))

  const paginated = computed<T[]>(() => {
    const start = (currentPage.value - 1) * perPage
    return source.value.slice(start, start + perPage)
  })

  // Si los filtros reducen tanto los resultados que la página actual quedó
  // fuera de rango, vuelve a la 1.
  watch(
    () => source.value.length,
    () => {
      if (currentPage.value > totalPages.value) currentPage.value = 1
    },
  )

  return {
    perPage,
    currentPage,
    totalPages,
    paginated,
  }
}

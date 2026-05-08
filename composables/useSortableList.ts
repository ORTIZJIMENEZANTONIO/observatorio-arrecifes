import type { ComputedRef, Ref } from 'vue'

// Sort genérico para tablas admin. Click en un `<th>` cicla:
//   none → asc → desc → asc → ...
// Click en otra columna empieza desde asc.
//
// Uso típico junto con `usePaginatedList`:
//   const { sorted, sortKey, sortDir, toggleSort } = useSortableList(filtered)
//   const { paginated, currentPage, totalPages, perPage } = usePaginatedList(sorted)
//
// Soporta paths anidados ("contributor.displayName") y coerción inteligente:
//   - números → comparación numérica
//   - strings ISO date → localeCompare
//   - booleanos → false < true
//   - mezcla → fallback a localeCompare con `numeric: true` (es-MX)
//
// `null` y `undefined` siempre van al final.

export type SortDirection = 'asc' | 'desc'

const getValueByPath = (obj: unknown, path: string): unknown => {
  if (obj == null) return undefined
  return path.split('.').reduce<any>((acc, key) => (acc == null ? undefined : acc[key]), obj)
}

const compareValues = (a: unknown, b: unknown): number => {
  // Nulls/undefined al final.
  const aMissing = a === null || a === undefined || a === ''
  const bMissing = b === null || b === undefined || b === ''
  if (aMissing && bMissing) return 0
  if (aMissing) return 1
  if (bMissing) return -1

  if (typeof a === 'number' && typeof b === 'number') return a - b
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b)

  // Strings que parecen números (decimales serializados como string por TypeORM).
  if (typeof a === 'string' && typeof b === 'string') {
    const na = Number(a)
    const nb = Number(b)
    if (Number.isFinite(na) && Number.isFinite(nb) && a.trim() !== '' && b.trim() !== '') {
      return na - nb
    }
    return a.localeCompare(b, 'es-MX', { numeric: true, sensitivity: 'base' })
  }

  // Fechas Date → epoch.
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()

  return String(a).localeCompare(String(b), 'es-MX', { numeric: true, sensitivity: 'base' })
}

export const useSortableList = <T>(
  source: Ref<T[]> | ComputedRef<T[]>,
  options: { defaultKey?: string; defaultDir?: SortDirection } = {},
) => {
  const sortKey = ref<string | null>(options.defaultKey ?? null)
  const sortDir = ref<SortDirection>(options.defaultDir ?? 'asc')

  const toggleSort = (key: string) => {
    if (sortKey.value === key) {
      sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey.value = key
      sortDir.value = 'asc'
    }
  }

  const clearSort = () => {
    sortKey.value = null
    sortDir.value = 'asc'
  }

  const sorted = computed<T[]>(() => {
    const list = source.value
    if (!sortKey.value) return list
    const key = sortKey.value
    const dir = sortDir.value === 'asc' ? 1 : -1
    // `slice()` para no mutar el array reactivo de origen.
    return list.slice().sort((a, b) => {
      const av = getValueByPath(a, key)
      const bv = getValueByPath(b, key)
      return compareValues(av, bv) * dir
    })
  })

  return {
    sortKey,
    sortDir,
    toggleSort,
    clearSort,
    sorted,
  }
}

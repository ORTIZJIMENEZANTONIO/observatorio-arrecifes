import { computed } from 'vue'
import type { Kpi } from '~/types'
import { useReefsStore } from '~/stores/reefs'
import { useObservationsStore } from '~/stores/observations'
import { useContributorsStore } from '~/stores/contributors'
import { useConflictsStore } from '~/stores/conflicts'
import { useLayersStore } from '~/stores/layers'

// KPIs reactivos: leen de los stores (con backend sync), no del módulo data/kpis.ts.
// Así los números del bento se actualizan cuando `useBackendSync` reemplaza los stores.
// Coerción defensiva con Number() para columnas decimal de MySQL que llegan como string.
export const useKpis = () => {
  const reefsStore = useReefsStore()
  const observationsStore = useObservationsStore()
  const contributorsStore = useContributorsStore()
  const conflictsStore = useConflictsStore()
  const layersStore = useLayersStore()

  return computed<Kpi[]>(() => {
    const reefs = reefsStore.publicReefs
    const conflicts = conflictsStore.publicConflicts
    const contributors = contributorsStore.contributors
    const layers = layersStore.layers
    const validatedObs = observationsStore.validated.length

    const totalArea = reefs.reduce((acc, r) => acc + (Number(r.area) || 0), 0)
    const totalAreaThousands = Math.round(totalArea / 1000)
    const alertCount = reefs.filter((r) => r.status === 'alert' || r.status === 'bleaching').length
    const avgCoralCover = reefs.length
      ? Math.round(
          reefs.reduce((acc, r) => acc + (Number(r.liveCoralCover) || 0), 0) / reefs.length,
        )
      : 0

    return [
      {
        label: 'Arrecifes monitoreados',
        value: String(reefs.length),
        rawValue: reefs.length,
        color: 'primary',
        icon: 'lucide:map-pin',
        to: '/inventory',
      },
      {
        label: 'Superficie cubierta',
        value: `${totalAreaThousands}k`,
        rawValue: totalAreaThousands,
        unit: 'ha',
        color: 'secondary',
        icon: 'lucide:layers',
        to: '/inventory',
      },
      {
        label: 'Cobertura coralina viva',
        value: String(avgCoralCover),
        rawValue: avgCoralCover,
        unit: '%',
        color: 'eco',
        icon: 'lucide:heart-pulse',
        to: '/livemap',
      },
      {
        label: 'Alertas activas',
        value: String(alertCount),
        rawValue: alertCount,
        unit: 'sitios',
        color: 'alert',
        icon: 'lucide:siren',
        to: '/livemap?layer=noaa-crw-bleaching-alert',
      },
      {
        label: 'Capas abiertas',
        value: String(layers.length),
        rawValue: layers.length,
        color: 'accent',
        icon: 'lucide:database',
        to: '/data-sources',
      },
      {
        label: 'Colaboradores',
        value: String(contributors.length),
        rawValue: contributors.length,
        color: 'coral',
        icon: 'lucide:users',
        to: '/contributors',
      },
      {
        label: 'Aportes validados',
        value: String(validatedObs),
        rawValue: validatedObs,
        color: 'primary',
        icon: 'lucide:badge-check',
        to: '/observations',
      },
      {
        label: 'Conflictos documentados',
        value: String(conflicts.length),
        rawValue: conflicts.length,
        color: 'coral',
        icon: 'lucide:alert-triangle',
        to: '/atlas',
      },
    ]
  })
}

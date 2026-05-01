import type { Kpi } from '~/types'
import { reefs, reefSummary } from './reefs'
import { observations } from './observations'
import { contributors } from './contributors'
import { conflicts } from './conflicts'
import { layers } from './layers'

const validatedObs = observations.filter((o) => o.status === 'validated').length
const totalAreaThousands = Math.round(reefSummary.totalArea / 1000) // miles de hectáreas

export const kpis: Kpi[] = [
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
    value: String(reefSummary.avgCoralCover),
    rawValue: reefSummary.avgCoralCover,
    unit: '%',
    color: 'eco',
    icon: 'lucide:heart-pulse',
    to: '/livemap',
  },
  {
    label: 'Alertas activas',
    value: String(reefSummary.alertCount),
    rawValue: reefSummary.alertCount,
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

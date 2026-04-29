import type { Kpi } from '~/types'
import { reefs, reefSummary } from './reefs'
import { observations } from './observations'
import { contributors } from './contributors'
import { conflicts } from './conflicts'
import { layers } from './layers'

const validatedObs = observations.filter((o) => o.status === 'validated').length
const totalArea = (reefSummary.totalArea / 1000).toFixed(0) // miles de hectáreas

export const kpis: Kpi[] = [
  {
    label: 'Arrecifes monitoreados',
    value: String(reefs.length),
    color: 'primary',
    icon: 'lucide:map-pin',
    to: '/inventory',
  },
  {
    label: 'Superficie cubierta',
    value: `${totalArea}k`,
    unit: 'ha',
    color: 'secondary',
    icon: 'lucide:layers',
    to: '/inventory',
  },
  {
    label: 'Cobertura coralina viva',
    value: `${reefSummary.avgCoralCover}`,
    unit: '%',
    color: 'eco',
    icon: 'lucide:heart-pulse',
    to: '/livemap',
  },
  {
    label: 'Alertas activas',
    value: String(reefSummary.alertCount),
    unit: 'sitios',
    color: 'alert',
    icon: 'lucide:siren',
    to: '/livemap?layer=noaa-crw-bleaching-alert',
  },
  {
    label: 'Capas abiertas',
    value: String(layers.length),
    color: 'accent',
    icon: 'lucide:database',
    to: '/data-sources',
  },
  {
    label: 'Colaboradores',
    value: String(contributors.length),
    color: 'coral',
    icon: 'lucide:users',
    to: '/contributors',
  },
  {
    label: 'Aportes validados',
    value: String(validatedObs),
    color: 'primary',
    icon: 'lucide:badge-check',
    to: '/observations',
  },
  {
    label: 'Conflictos documentados',
    value: String(conflicts.length),
    color: 'coral',
    icon: 'lucide:alert-triangle',
    to: '/atlas',
  },
]

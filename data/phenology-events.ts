import type { PhenologyEvent } from '~/types'

// Calendario fenológico del año arrecifal mexicano. Referencias clave:
// - Coral spawning Caribe: 7-10 noches después de la luna llena de agosto/septiembre
// - Mero Nassau: agregación luna llena enero-febrero (Banco Chinchorro, Alacranes)
// - Tiburón ballena Isla Mujeres: junio-septiembre
// - Sargazo: pico abril-agosto (Riviera Maya)
// - Blanqueamiento Caribe: agosto-octubre (DHW acumulativo)

export const phenologyEvents: PhenologyEvent[] = [
  {
    id: 1,
    type: 'coral_spawning',
    title: 'Desove masivo coralino — Caribe',
    description:
      'Acropora palmata y A. cervicornis desovan 4-6 noches después de la luna llena de agosto. Especies de Orbicella desovan en septiembre.',
    reefIds: [1, 2, 3, 5, 11],
    ocean: 'caribbean',
    startMonth: 8,
    endMonth: 9,
    peakMonth: 9,
    speciesInvolved: ['Acropora palmata', 'Acropora cervicornis', 'Orbicella faveolata', 'Orbicella annularis'],
    source: 'Hagedorn et al. 2018, Front. Mar. Sci.',
  },
  {
    id: 2,
    type: 'coral_spawning',
    title: 'Desove coralino — Pacífico mexicano',
    description:
      'Pocillopora damicornis libera planulas casi todo el año pero con picos posteriores a la luna nueva en verano. Pavona gigantea desova en mayo-junio.',
    reefIds: [6, 7, 8, 10, 12],
    ocean: 'pacific',
    startMonth: 5,
    endMonth: 9,
    peakMonth: 7,
    speciesInvolved: ['Pocillopora damicornis', 'Pavona gigantea', 'Porites lobata'],
    source: 'Carpizo-Ituarte et al. 2011, Coral Reefs',
  },
  {
    id: 3,
    type: 'fish_aggregation',
    title: 'Agregación reproductiva — Mero Nassau',
    description:
      'Epinephelus striatus se concentra en agregaciones reproductivas durante luna llena de enero-febrero. Banco Chinchorro y Alacranes son sitios históricos.',
    reefIds: [3, 9],
    ocean: 'caribbean',
    startMonth: 1,
    endMonth: 2,
    peakMonth: 2,
    speciesInvolved: ['Epinephelus striatus', 'Lutjanus analis'],
    source: 'Aguilar-Perera 2006, Endang. Species Res.',
  },
  {
    id: 4,
    type: 'turtle_nesting',
    title: 'Anidación tortuga verde y carey',
    description:
      'Tortugas verdes y carey anidan en playas de Quintana Roo (X\'cacel, Akumal) y Yucatán entre mayo y octubre.',
    reefIds: [1, 2, 3, 5, 11],
    ocean: 'caribbean',
    startMonth: 5,
    endMonth: 10,
    peakMonth: 7,
    speciesInvolved: ['Chelonia mydas', 'Eretmochelys imbricata'],
    source: 'Cuevas et al. 2008, Chelonian Conserv. Biol.',
  },
  {
    id: 5,
    type: 'whale_shark',
    title: 'Agregación de tiburón ballena',
    description:
      'Rhincodon typus se agrega para alimentarse de huevos de atún en las aguas frente a Isla Mujeres y Contoy.',
    reefIds: [11],
    ocean: 'caribbean',
    startMonth: 6,
    endMonth: 9,
    peakMonth: 8,
    speciesInvolved: ['Rhincodon typus'],
    source: 'de la Parra-Venegas et al. 2011, PLoS ONE',
  },
  {
    id: 6,
    type: 'sargasso_peak',
    title: 'Pico de arribazón de sargazo',
    description:
      'Pelagic Sargassum (S. natans / S. fluitans) alcanza máxima biomasa en playas del Caribe mexicano entre abril y agosto. Origen: NERR (North Equatorial Recirculation Region).',
    reefIds: [1, 2, 3, 5, 11],
    ocean: 'caribbean',
    startMonth: 4,
    endMonth: 8,
    peakMonth: 6,
    source: 'Wang et al. 2019, Science · NOAA SaWS',
  },
  {
    id: 7,
    type: 'bleaching_season',
    title: 'Ventana climatológica de blanqueamiento',
    description:
      'DHW acumulativo entra en riesgo (≥4 °C-semanas) entre agosto y octubre en el Caribe; entre marzo y junio en Pacífico mexicano (ENSO+).',
    reefIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    ocean: 'all',
    startMonth: 8,
    endMonth: 10,
    peakMonth: 9,
    source: 'NOAA Coral Reef Watch',
  },
  {
    id: 8,
    type: 'lionfish_tournament',
    title: 'Torneo trimestral de control de pez león',
    description:
      'Cooperativas pesqueras de Cozumel, Banco Chinchorro, Xcalak y Contoy organizan jornadas coordinadas con CONANP.',
    reefIds: [2, 3, 5, 11],
    ocean: 'caribbean',
    startMonth: 1,
    endMonth: 12,
    speciesInvolved: ['Pterois volitans'],
    source: 'SCPP local · CONANP',
  },
  {
    id: 9,
    type: 'monitoring_campaign',
    title: 'Campaña anual MBRS Healthy Reefs Initiative',
    description:
      'Línea base del estado de salud arrecifal del Sistema Arrecifal Mesoamericano (índice HRI). Recolección campo abril-junio, reporte en noviembre.',
    reefIds: [1, 2, 3, 5, 11],
    ocean: 'caribbean',
    startMonth: 4,
    endMonth: 6,
    source: 'Healthy Reefs Initiative — Report Card',
  },
  {
    id: 10,
    type: 'monitoring_campaign',
    title: 'Monitoreo Permanente de Arrecifes (PMARP)',
    description: 'Levantamientos REA (Rapid Ecological Assessment) por CONANP en todas las ANP marinas.',
    reefIds: [1, 3, 4, 5, 6, 8, 9, 10, 11, 12],
    ocean: 'all',
    startMonth: 3,
    endMonth: 11,
    source: 'CONANP PMARP',
  },
]

export const monthName = (m: number): string =>
  ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'][m - 1] || ''

export const eventsByMonth = (month: number): PhenologyEvent[] => {
  const matches = (e: PhenologyEvent): boolean => {
    if (e.startMonth <= e.endMonth) return month >= e.startMonth && month <= e.endMonth
    return month >= e.startMonth || month <= e.endMonth
  }
  return phenologyEvents.filter(matches)
}

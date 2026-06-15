import type { HurricaneTrack } from '~/types'

// Huracanes con impacto documentado en arrecifes mexicanos. trackPoints
// simplificados (puntos clave) — para el mapa final conviene cargar
// HURDAT2 vía geojson en producción.

export const hurricaneTracks: HurricaneTrack[] = [
  {
    id: 1,
    name: 'Wilma',
    year: 2005,
    basin: 'atlantic',
    maxCategory: 5,
    landfallDate: '2005-10-21',
    affectedReefIds: [1, 2, 11],
    trackPoints: [
      { lat: 19.1, lng: -85.5, date: '2005-10-19', category: 4 },
      { lat: 19.8, lng: -86.2, date: '2005-10-20', category: 5 },
      { lat: 20.5, lng: -86.95, date: '2005-10-21', category: 4 },
      { lat: 21.2, lng: -87.5, date: '2005-10-22', category: 3 },
    ],
    damageSummary:
      'Pérdida masiva de Acropora palmata en Cozumel y Puerto Morelos (>50% en zonas someras). Caída de cobertura coral del 30% al 12% en algunas parcelas.',
    recoveryYears: 15,
    source: 'NOAA HURDAT2 · Álvarez-Filip et al. 2009',
  },
  {
    id: 2,
    name: 'Dean',
    year: 2007,
    basin: 'atlantic',
    maxCategory: 5,
    landfallDate: '2007-08-21',
    affectedReefIds: [3, 5],
    trackPoints: [
      { lat: 17.8, lng: -86.5, date: '2007-08-20', category: 5 },
      { lat: 18.5, lng: -87.8, date: '2007-08-21', category: 5 },
      { lat: 19.1, lng: -89.0, date: '2007-08-22', category: 3 },
    ],
    damageSummary:
      'Daño estructural severo en Banco Chinchorro y Xcalak. Fragmentación de colonias adultas pero también dispersión de fragmentos viables.',
    recoveryYears: 12,
    source: 'NOAA HURDAT2 · McField & Kramer 2008',
  },
  {
    id: 3,
    name: 'Delta',
    year: 2020,
    basin: 'atlantic',
    maxCategory: 4,
    landfallDate: '2020-10-07',
    affectedReefIds: [1, 2, 11],
    trackPoints: [
      { lat: 19.4, lng: -86.0, date: '2020-10-06', category: 4 },
      { lat: 20.4, lng: -87.0, date: '2020-10-07', category: 2 },
      { lat: 21.0, lng: -87.5, date: '2020-10-08', category: 1 },
    ],
    damageSummary:
      'Daño moderado en Cozumel y Puerto Morelos. Sargazo acumulado removido por oleaje pero coincidió con frente SCTLD activo.',
    recoveryYears: 5,
    source: 'NOAA HURDAT2',
  },
  {
    id: 4,
    name: 'Patricia',
    year: 2015,
    basin: 'pacific',
    maxCategory: 5,
    landfallDate: '2015-10-23',
    affectedReefIds: [10],
    trackPoints: [
      { lat: 15.2, lng: -104.8, date: '2015-10-22', category: 5 },
      { lat: 16.5, lng: -105.0, date: '2015-10-23', category: 5 },
      { lat: 19.0, lng: -104.5, date: '2015-10-24', category: 2 },
    ],
    damageSummary:
      'Huracán más intenso registrado en el hemisferio occidental. Daño localizado en costa de Jalisco-Colima; Huatulco con afectación marginal.',
    recoveryYears: 3,
    source: 'NOAA HURDAT2',
  },
  {
    id: 5,
    name: 'Gilbert',
    year: 1988,
    basin: 'atlantic',
    maxCategory: 5,
    landfallDate: '1988-09-14',
    affectedReefIds: [1, 2, 3, 5, 9, 11],
    trackPoints: [
      { lat: 18.8, lng: -85.0, date: '1988-09-13', category: 5 },
      { lat: 20.5, lng: -87.0, date: '1988-09-14', category: 5 },
      { lat: 21.5, lng: -89.0, date: '1988-09-15', category: 3 },
    ],
    damageSummary:
      'Línea base de daño histórico al SAM. Pérdida de cobertura coral del 40-60% en zonas someras de Cozumel y Puerto Morelos.',
    recoveryYears: 20,
    source: 'NOAA HURDAT2 · Jordán-Dahlgren 1992',
  },
]

export const tracksByReef = (reefId: number) =>
  hurricaneTracks.filter((t) => t.affectedReefIds.includes(reefId))

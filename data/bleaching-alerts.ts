import type { BleachingAlert } from '~/types'

// ============================================================================
// Latest NOAA Coral Reef Watch alerts per reef (5 km product, sample)
// En producción este dataset se reemplaza con un fetch a:
//   https://coralreefwatch.noaa.gov/data/5km/
// vía cercu-backend.
// ============================================================================

export const bleachingAlerts: BleachingAlert[] = [
  { reefId: 1, level: 'warning',  dhw: 4.2, sst: 30.1, sstAnomaly: 1.4, observedAt: '2026-04-26', source: 'noaa_crw' },
  { reefId: 2, level: 'alert_1',  dhw: 6.8, sst: 30.6, sstAnomaly: 1.9, observedAt: '2026-04-26', source: 'noaa_crw' },
  { reefId: 3, level: 'watch',    dhw: 1.7, sst: 29.4, sstAnomaly: 0.7, observedAt: '2026-04-26', source: 'noaa_crw' },
  { reefId: 4, level: 'alert_1',  dhw: 7.1, sst: 30.8, sstAnomaly: 2.1, observedAt: '2026-04-26', source: 'noaa_crw' },
  { reefId: 5, level: 'no_stress', dhw: 0.4, sst: 28.9, sstAnomaly: 0.2, observedAt: '2026-04-26', source: 'noaa_crw' },
  { reefId: 6, level: 'no_stress', dhw: 0.0, sst: 24.6, sstAnomaly: -0.3, observedAt: '2026-04-26', source: 'noaa_crw' },
  { reefId: 7, level: 'watch',    dhw: 1.4, sst: 27.9, sstAnomaly: 0.6, observedAt: '2026-04-26', source: 'noaa_crw' },
  { reefId: 8, level: 'no_stress', dhw: 0.0, sst: 25.1, sstAnomaly: 0.1, observedAt: '2026-04-26', source: 'noaa_crw' },
  { reefId: 9, level: 'watch',    dhw: 2.0, sst: 29.6, sstAnomaly: 0.9, observedAt: '2026-04-26', source: 'noaa_crw' },
  { reefId: 10, level: 'warning', dhw: 3.7, sst: 29.2, sstAnomaly: 1.2, observedAt: '2026-04-26', source: 'noaa_crw' },
  { reefId: 11, level: 'watch',   dhw: 1.5, sst: 29.5, sstAnomaly: 0.7, observedAt: '2026-04-26', source: 'noaa_crw' },
  { reefId: 12, level: 'no_stress', dhw: 0.1, sst: 24.9, sstAnomaly: 0.0, observedAt: '2026-04-26', source: 'noaa_crw' },
]

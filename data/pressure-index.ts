import type { PressureIndex } from '~/types'

// Índice multi-amenaza acumulado por arrecife (estilo Halpern et al. 2008).
// Cada dimensión: 0 = sin presión observada, 100 = presión máxima documentada.
// Total = promedio simple (refinar con pesos por arrecife en v2).

const total = (parts: number[]): number =>
  Math.round(parts.reduce((a, b) => a + b, 0) / parts.length)

export const pressureIndex: PressureIndex[] = [
  {
    reefId: 1,
    thermal: 78, disease: 72, fishing: 38, tourism: 86, development: 81, sargasso: 88, pollution: 84, hurricane: 64,
    total: 0, trend: 'worsening', updatedAt: '2026-05-01',
  },
  {
    reefId: 2,
    thermal: 80, disease: 86, fishing: 28, tourism: 94, development: 72, sargasso: 84, pollution: 70, hurricane: 60,
    total: 0, trend: 'worsening', updatedAt: '2026-05-01',
  },
  {
    reefId: 3,
    thermal: 72, disease: 48, fishing: 52, tourism: 30, development: 22, sargasso: 78, pollution: 36, hurricane: 70,
    total: 0, trend: 'stable', updatedAt: '2026-05-01',
  },
  {
    reefId: 4,
    thermal: 64, disease: 36, fishing: 56, tourism: 22, development: 76, sargasso: 0, pollution: 88, hurricane: 30,
    total: 0, trend: 'worsening', updatedAt: '2026-05-01',
  },
  {
    reefId: 5,
    thermal: 66, disease: 70, fishing: 44, tourism: 48, development: 40, sargasso: 80, pollution: 48, hurricane: 56,
    total: 0, trend: 'stable', updatedAt: '2026-05-01',
  },
  {
    reefId: 6,
    thermal: 58, disease: 14, fishing: 12, tourism: 66, development: 44, sargasso: 0, pollution: 22, hurricane: 22,
    total: 0, trend: 'improving', updatedAt: '2026-05-01',
  },
  {
    reefId: 7,
    thermal: 56, disease: 12, fishing: 30, tourism: 28, development: 24, sargasso: 0, pollution: 18, hurricane: 30,
    total: 0, trend: 'stable', updatedAt: '2026-05-01',
  },
  {
    reefId: 8,
    thermal: 52, disease: 10, fishing: 14, tourism: 38, development: 6, sargasso: 0, pollution: 14, hurricane: 26,
    total: 0, trend: 'improving', updatedAt: '2026-05-01',
  },
  {
    reefId: 9,
    thermal: 68, disease: 22, fishing: 42, tourism: 18, development: 12, sargasso: 56, pollution: 28, hurricane: 64,
    total: 0, trend: 'stable', updatedAt: '2026-05-01',
  },
  {
    reefId: 10,
    thermal: 60, disease: 18, fishing: 32, tourism: 56, development: 48, sargasso: 0, pollution: 38, hurricane: 50,
    total: 0, trend: 'stable', updatedAt: '2026-05-01',
  },
  {
    reefId: 11,
    thermal: 72, disease: 36, fishing: 24, tourism: 36, development: 26, sargasso: 70, pollution: 32, hurricane: 70,
    total: 0, trend: 'stable', updatedAt: '2026-05-01',
  },
  {
    reefId: 12,
    thermal: 56, disease: 12, fishing: 28, tourism: 30, development: 34, sargasso: 0, pollution: 24, hurricane: 30,
    total: 0, trend: 'improving', updatedAt: '2026-05-01',
  },
].map((p) => ({
  ...p,
  total: total([p.thermal, p.disease, p.fishing, p.tourism, p.development, p.sargasso, p.pollution, p.hurricane]),
})) as PressureIndex[]

export const indexByReef = (reefId: number): PressureIndex | undefined =>
  pressureIndex.find((p) => p.reefId === reefId)

export const pressureLabel = (k: keyof PressureIndex): string => {
  const map: Partial<Record<keyof PressureIndex, string>> = {
    thermal: 'Estrés térmico',
    disease: 'Enfermedad (SCTLD)',
    fishing: 'Pesca',
    tourism: 'Turismo',
    development: 'Desarrollo costero',
    sargasso: 'Sargazo',
    pollution: 'Contaminación',
    hurricane: 'Huracanes',
  }
  return map[k] ?? String(k)
}

export const pressureColor = (value: number): string => {
  if (value >= 70) return 'alert'
  if (value >= 45) return 'accent'
  if (value >= 20) return 'secondary'
  return 'eco'
}

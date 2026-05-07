import { describe, it, expect } from 'vitest'
import { useAnalyticsMath } from '../composables/useAnalyticsMath'

describe('useAnalyticsMath — descriptivo', () => {
  const m = useAnalyticsMath()

  it('mean / median / std', () => {
    expect(m.mean([1, 2, 3, 4, 5])).toBe(3)
    expect(m.median([1, 2, 3, 4, 5])).toBe(3)
    expect(m.median([1, 2, 3, 4])).toBe(2.5)
    expect(m.std([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2.138, 2)
  })

  it('describe — todos los stats', () => {
    const d = m.describe([10, 20, 30, 40, 50])
    expect(d.count).toBe(5)
    expect(d.mean).toBe(30)
    expect(d.median).toBe(30)
    expect(d.min).toBe(10)
    expect(d.max).toBe(50)
    expect(d.range).toBe(40)
    expect(d.q1).toBe(20)
    expect(d.q3).toBe(40)
    expect(d.iqr).toBe(20)
  })

  it('describe — array vacío no rompe', () => {
    const d = m.describe([])
    expect(d.count).toBe(0)
    expect(d.mean).toBe(0)
    expect(d.std).toBe(0)
  })

  it('histogram — distribuye correctamente', () => {
    const h = m.histogram([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5)
    expect(h).toHaveLength(5)
    const total = h.reduce((acc, b) => acc + b.count, 0)
    expect(total).toBe(10)
  })

  it('frequency — cuenta categorías', () => {
    const f = m.frequency(['a', 'b', 'a', 'c', 'a', 'b'])
    const map = Object.fromEntries(f.map((x) => [x.key, x.count]))
    expect(map.a).toBe(3)
    expect(map.b).toBe(2)
    expect(map.c).toBe(1)
  })
})

describe('useAnalyticsMath — inferencial', () => {
  const m = useAnalyticsMath()

  it('correlation — relación perfecta positiva = 1', () => {
    const r = m.correlation([1, 2, 3, 4, 5], [2, 4, 6, 8, 10])
    expect(r).toBeCloseTo(1, 5)
  })

  it('correlation — relación perfecta negativa = -1', () => {
    const r = m.correlation([1, 2, 3, 4, 5], [10, 8, 6, 4, 2])
    expect(r).toBeCloseTo(-1, 5)
  })

  it('correlation — independientes ≈ 0', () => {
    const r = m.correlation([1, 2, 3, 4, 5], [3, 1, 4, 1, 5])
    expect(Math.abs(r)).toBeLessThan(0.5)
  })

  it('linearRegression — recobra slope/intercept de y = 2x + 1', () => {
    const xs = [1, 2, 3, 4, 5]
    const ys = xs.map((x) => 2 * x + 1)
    const reg = m.linearRegression(xs, ys)
    expect(reg.slope).toBeCloseTo(2, 5)
    expect(reg.intercept).toBeCloseTo(1, 5)
    expect(reg.r2).toBeCloseTo(1, 5)
    expect(reg.predict(10)).toBeCloseTo(21, 5)
  })

  it('zScores — outliers son detectables', () => {
    const xs = [10, 11, 12, 11, 10, 11, 12, 100]
    const z = m.zScores(xs)
    expect(Math.abs(z[7])).toBeGreaterThan(2) // el 100 es claramente anómalo
  })

  it('flagAnomalies — marca el outlier', () => {
    const flags = m.flagAnomalies([10, 11, 12, 11, 10, 11, 12, 100], 1.5)
    expect(flags[7]).toBe(true)
    expect(flags.slice(0, 7).some(Boolean)).toBe(false)
  })
})

describe('useAnalyticsMath — biostatística', () => {
  const m = useAnalyticsMath()

  it('coefficientOfVariation — proporción correcta', () => {
    const cv = m.coefficientOfVariation([2, 3, 4, 5, 6])
    expect(cv).toBeCloseTo(39.5, 1)
  })

  it('bootstrapMeanCI — el IC contiene la media', () => {
    const xs = [10, 12, 14, 16, 18, 20]
    const [lo, hi] = m.bootstrapMeanCI(xs, 0.05, 500)
    const meanXs = m.mean(xs)
    expect(lo).toBeLessThanOrEqual(meanXs)
    expect(hi).toBeGreaterThanOrEqual(meanXs)
    expect(hi - lo).toBeLessThan(20)
  })

  it('spearmanCorrelation — captura monotonía no lineal', () => {
    const xs = [1, 2, 3, 4, 5]
    const ys = xs.map((x) => x ** 3)
    expect(m.spearmanCorrelation(xs, ys)).toBeCloseTo(1, 5)
    expect(m.correlation(xs, ys)).toBeLessThan(1)
  })

  it('kruskalWallis — detecta diferencia entre grupos separados', () => {
    const g1 = [1, 2, 3, 4, 5]
    const g2 = [10, 11, 12, 13, 14]
    const g3 = [20, 21, 22, 23, 24]
    const res = m.kruskalWallis([g1, g2, g3])
    expect(res.df).toBe(2)
    expect(res.H).toBeGreaterThan(10)
    expect(res.pApprox).toBeLessThan(0.05)
  })

  it('shannonDiversity — máximo cuando categorías son equiprobables', () => {
    expect(m.shannonDiversity([25, 25, 25, 25])).toBeCloseTo(Math.log(4), 5)
    expect(m.shannonDiversity([100, 0, 0, 0])).toBe(0)
  })

  it('coralHealthIndex — escala monotónica con cobertura', () => {
    const sano = m.coralHealthIndex({
      liveCoralCover: 40, dhw: 0, protection: 'unesco', threats: [], speciesRichness: 70,
    })
    const malo = m.coralHealthIndex({
      liveCoralCover: 5, dhw: 8, protection: 'unprotected', threats: ['a','b','c','d','e','f'], speciesRichness: 10,
    })
    expect(sano).toBeGreaterThan(80)
    expect(malo).toBeLessThan(20)
  })

  it('pValueFromPearson — r=0 → p≈1, r alto + N grande → p≈0', () => {
    expect(m.pValueFromPearson(0, 30)).toBeGreaterThan(0.9)
    expect(m.pValueFromPearson(0.95, 30)).toBeLessThan(0.001)
  })

  it('mannKendall — detecta tendencia creciente clara', () => {
    const ascending = [10, 12, 13, 15, 16, 18, 20, 21, 23, 25, 27, 30]
    const res = m.mannKendall(ascending)
    expect(res.tau).toBeGreaterThan(0.9)
    expect(res.pValue).toBeLessThan(0.01)
  })

  it('mannKendall — serie aleatoria → tau cercano a 0, p alto', () => {
    const noisy = [10, 8, 12, 9, 11, 10, 13, 9, 11, 10, 12, 11]
    const res = m.mannKendall(noisy)
    expect(Math.abs(res.tau)).toBeLessThan(0.5)
    expect(res.pValue).toBeGreaterThan(0.1)
  })

  it('theilSenSlope — recupera pendiente con outliers', () => {
    // y = 2x + 1 con un outlier brutal en el medio
    const xs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    const ys = xs.map((x) => 2 * x + 1)
    ys[5] = 1000 // outlier que rompería OLS
    const slope = m.theilSenSlope(xs, ys)
    expect(slope).toBeCloseTo(2, 0) // robusto al outlier
  })

  it('correlationMatrix — soporta Pearson y Spearman, devuelve p-values', () => {
    const data = [
      { name: 'A', values: [1, 2, 3, 4, 5, 6, 7, 8] },
      { name: 'B', values: [1, 4, 9, 16, 25, 36, 49, 64] },
    ]
    const pearson = m.correlationMatrix(data, 'pearson')
    const spearman = m.correlationMatrix(data, 'spearman')
    expect(spearman.matrix[0][1]).toBeCloseTo(1, 5)
    expect(pearson.matrix[0][1]).toBeLessThan(1)
    expect(pearson.pValues[0][1]).toBeLessThan(0.05)
  })
})

describe('useAnalyticsMath — modelado', () => {
  const m = useAnalyticsMath()

  it('kmeans — separa dos clusters bien definidos', () => {
    const cluster1 = Array.from({ length: 20 }, () => [
      Math.random(),
      Math.random(),
    ])
    const cluster2 = Array.from({ length: 20 }, () => [
      10 + Math.random(),
      10 + Math.random(),
    ])
    const points = [...cluster1, ...cluster2]
    const result = m.kmeans(points, 2)
    expect(result.assignments).toHaveLength(40)
    expect(result.centroids).toHaveLength(2)
    // Los primeros 20 deberían tener la misma asignación entre sí
    const firstAssignment = result.assignments[0]
    const firstClusterConsistent = result.assignments
      .slice(0, 20)
      .every((a) => a === firstAssignment)
    expect(firstClusterConsistent).toBe(true)
    // Los segundos 20 deberían tener la otra asignación
    const secondAssignment = result.assignments[20]
    const secondClusterConsistent = result.assignments
      .slice(20)
      .every((a) => a === secondAssignment)
    expect(secondClusterConsistent).toBe(true)
    expect(firstAssignment).not.toBe(secondAssignment)
  })

  it('kmeans — k=1 devuelve un solo centroide ≈ media global', () => {
    const points = [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5]]
    const result = m.kmeans(points, 1)
    expect(result.centroids).toHaveLength(1)
    expect(result.centroids[0][0]).toBeCloseTo(3, 5)
    expect(result.centroids[0][1]).toBeCloseTo(3, 5)
  })

  it('kmeans — array vacío no rompe', () => {
    const result = m.kmeans([], 3)
    expect(result.assignments).toHaveLength(0)
    expect(result.centroids).toHaveLength(0)
  })
})

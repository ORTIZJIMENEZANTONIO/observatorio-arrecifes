// Helpers de estadística descriptiva, inferencial y modelado simple en cliente.
// Sin dependencias externas (todo JS puro). Apto para datasets pequeños/medianos
// (≤ 100 mil puntos): cálculo síncrono, vectorización mínima.

export interface DescriptiveStats {
  count: number
  mean: number
  median: number
  std: number
  variance: number
  min: number
  max: number
  range: number
  q1: number
  q3: number
  iqr: number
}

export const useAnalyticsMath = () => {
  const toFinite = (xs: number[]): number[] => xs.filter((v) => Number.isFinite(v))

  const sum = (xs: number[]): number => xs.reduce((a, b) => a + b, 0)

  const mean = (xs: number[]): number => {
    const arr = toFinite(xs)
    return arr.length === 0 ? 0 : sum(arr) / arr.length
  }

  const variance = (xs: number[], sample = true): number => {
    const arr = toFinite(xs)
    if (arr.length < 2) return 0
    const m = mean(arr)
    const ss = arr.reduce((acc, v) => acc + (v - m) ** 2, 0)
    return ss / (sample ? arr.length - 1 : arr.length)
  }

  const std = (xs: number[], sample = true): number => Math.sqrt(variance(xs, sample))

  const percentile = (xs: number[], p: number): number => {
    const arr = toFinite(xs).slice().sort((a, b) => a - b)
    if (arr.length === 0) return 0
    if (arr.length === 1) return arr[0]
    const idx = (arr.length - 1) * p
    const lo = Math.floor(idx)
    const hi = Math.ceil(idx)
    if (lo === hi) return arr[lo]
    return arr[lo] + (arr[hi] - arr[lo]) * (idx - lo)
  }

  const median = (xs: number[]): number => percentile(xs, 0.5)

  const describe = (xs: number[]): DescriptiveStats => {
    const arr = toFinite(xs)
    if (arr.length === 0) {
      return { count: 0, mean: 0, median: 0, std: 0, variance: 0, min: 0, max: 0, range: 0, q1: 0, q3: 0, iqr: 0 }
    }
    const min = Math.min(...arr)
    const max = Math.max(...arr)
    const q1 = percentile(arr, 0.25)
    const q3 = percentile(arr, 0.75)
    return {
      count: arr.length,
      mean: mean(arr),
      median: median(arr),
      std: std(arr),
      variance: variance(arr),
      min,
      max,
      range: max - min,
      q1,
      q3,
      iqr: q3 - q1,
    }
  }

  // ── Análisis de tendencias temporales ──
  // Test de Mann-Kendall: detecta tendencia monotónica en una serie de tiempo
  // sin asumir distribución ni linealidad. τ ∈ [-1, 1]: -1 = decreciente
  // perfecto, +1 = creciente perfecto, 0 = sin tendencia. Devuelve también
  // la estadística S, varianza con ajuste por empates y p-value bilateral.
  const mannKendall = (
    values: number[],
  ): { S: number; tau: number; varS: number; z: number; pValue: number; n: number } => {
    const arr = values.filter((v) => Number.isFinite(v))
    const n = arr.length
    if (n < 4) {
      return { S: 0, tau: 0, varS: 0, z: 0, pValue: 1, n }
    }
    let S = 0
    for (let i = 0; i < n - 1; i++) {
      for (let j = i + 1; j < n; j++) {
        const d = arr[j] - arr[i]
        if (d > 0) S++
        else if (d < 0) S--
      }
    }
    // Ajuste por empates
    const counts = new Map<number, number>()
    for (const v of arr) counts.set(v, (counts.get(v) || 0) + 1)
    let tieAdj = 0
    for (const c of counts.values()) {
      if (c > 1) tieAdj += c * (c - 1) * (2 * c + 5)
    }
    const varS = (n * (n - 1) * (2 * n + 5) - tieAdj) / 18
    const tau = S / ((n * (n - 1)) / 2)

    // Aproximación normal con corrección de continuidad
    let z = 0
    if (varS > 0) {
      if (S > 0) z = (S - 1) / Math.sqrt(varS)
      else if (S < 0) z = (S + 1) / Math.sqrt(varS)
    }
    const pValue = 2 * (1 - normalCDF(Math.abs(z)))
    return { S, tau, varS, z, pValue, n }
  }

  // Theil-Sen: pendiente robusta (mediana de pendientes par a par). Resistente
  // a outliers; complementa Mann-Kendall (que sólo dice si hay tendencia, no
  // de qué magnitud).
  const theilSenSlope = (xs: number[], ys: number[]): number => {
    const n = Math.min(xs.length, ys.length)
    if (n < 2) return 0
    const slopes: number[] = []
    for (let i = 0; i < n - 1; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = xs[j] - xs[i]
        if (dx === 0) continue
        slopes.push((ys[j] - ys[i]) / dx)
      }
    }
    if (slopes.length === 0) return 0
    return percentile(slopes, 0.5)
  }

  // Coeficiente de variación (CV%) — desviación estándar relativa a la media.
  // Útil para comparar variabilidad entre grupos con diferentes escalas o medias.
  const coefficientOfVariation = (xs: number[]): number => {
    const m = mean(xs)
    if (m === 0 || !Number.isFinite(m)) return 0
    return (std(xs) / Math.abs(m)) * 100
  }

  // Bootstrap del intervalo de confianza sobre la media (percentile method).
  // Más honesto que el IC paramétrico cuando N es pequeño (N=12 arrecifes).
  const bootstrapMeanCI = (
    xs: number[],
    alpha = 0.05,
    iterations = 1000,
  ): [number, number] => {
    const arr = toFinite(xs)
    if (arr.length === 0) return [0, 0]
    if (arr.length === 1) return [arr[0], arr[0]]
    const means: number[] = new Array(iterations)
    for (let i = 0; i < iterations; i++) {
      let s = 0
      for (let j = 0; j < arr.length; j++) {
        s += arr[Math.floor(Math.random() * arr.length)]
      }
      means[i] = s / arr.length
    }
    means.sort((a, b) => a - b)
    return [
      means[Math.floor((iterations * alpha) / 2)],
      means[Math.floor(iterations * (1 - alpha / 2))],
    ]
  }

  // Asigna rangos (ranks) con promedio en empates — base para Spearman y K-W.
  const assignRanks = (xs: number[]): number[] => {
    const indexed = xs.map((v, i) => ({ v, i }))
    indexed.sort((a, b) => a.v - b.v)
    const ranks = new Array(xs.length).fill(0)
    let i = 0
    while (i < indexed.length) {
      let j = i
      while (j < indexed.length - 1 && indexed[j + 1].v === indexed[i].v) j++
      const avgRank = (i + j) / 2 + 1
      for (let k = i; k <= j; k++) ranks[indexed[k].i] = avgRank
      i = j + 1
    }
    return ranks
  }

  // Aproximación de la CDF normal estándar (Abramowitz & Stegun 26.2.17).
  const normalCDF = (z: number): number => {
    const t = 1 / (1 + 0.2316419 * Math.abs(z))
    const d = 0.3989422804014327 * Math.exp((-z * z) / 2)
    let p =
      d *
      t *
      (0.3193815 +
        t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
    if (z > 0) p = 1 - p
    return p
  }

  // p-value de cola superior para chi² con k df (aproximación Wilson-Hilferty).
  const chiSquareSF = (x: number, k: number): number => {
    if (x <= 0 || k <= 0) return 1
    const z =
      (Math.cbrt(x / k) - (1 - 2 / (9 * k))) / Math.sqrt(2 / (9 * k))
    return 1 - normalCDF(z)
  }

  // p-value bilateral aproximado para correlación de Pearson.
  // t = r·√((n-2)/(1-r²)) ~ t(n-2). Aproximación normal con corrección de df.
  const pValueFromPearson = (r: number, n: number): number => {
    if (n < 3 || !Number.isFinite(r)) return 1
    if (Math.abs(r) >= 0.999999) return 0
    const df = n - 2
    const t = Math.abs(r) * Math.sqrt(df / (1 - r * r))
    // Corrección Hill (1970) para t pequeño df.
    const z = (t * (1 - 1 / (4 * df))) / Math.sqrt(1 + (t * t) / (2 * df))
    return 2 * (1 - normalCDF(z))
  }

  // Pearson correlation
  const correlation = (xs: number[], ys: number[]): number => {
    const n = Math.min(xs.length, ys.length)
    if (n < 2) return 0
    const mx = mean(xs.slice(0, n))
    const my = mean(ys.slice(0, n))
    let num = 0
    let dx2 = 0
    let dy2 = 0
    for (let i = 0; i < n; i++) {
      const dx = xs[i] - mx
      const dy = ys[i] - my
      num += dx * dy
      dx2 += dx * dx
      dy2 += dy * dy
    }
    const denom = Math.sqrt(dx2 * dy2)
    return denom === 0 ? 0 : num / denom
  }

  // Simple linear regression y = a + b*x
  const linearRegression = (xs: number[], ys: number[]): {
    slope: number
    intercept: number
    r2: number
    predict: (x: number) => number
  } => {
    const n = Math.min(xs.length, ys.length)
    if (n < 2) {
      return { slope: 0, intercept: ys[0] || 0, r2: 0, predict: () => ys[0] || 0 }
    }
    const mx = mean(xs.slice(0, n))
    const my = mean(ys.slice(0, n))
    let num = 0
    let den = 0
    for (let i = 0; i < n; i++) {
      num += (xs[i] - mx) * (ys[i] - my)
      den += (xs[i] - mx) ** 2
    }
    const slope = den === 0 ? 0 : num / den
    const intercept = my - slope * mx
    let ssRes = 0
    let ssTot = 0
    for (let i = 0; i < n; i++) {
      const yhat = intercept + slope * xs[i]
      ssRes += (ys[i] - yhat) ** 2
      ssTot += (ys[i] - my) ** 2
    }
    const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot
    return { slope, intercept, r2, predict: (x: number) => intercept + slope * x }
  }

  // Z-scores → flags de anomalía (|z| > threshold)
  const zScores = (xs: number[]): number[] => {
    const arr = toFinite(xs)
    const m = mean(arr)
    const s = std(arr)
    if (s === 0) return arr.map(() => 0)
    return arr.map((v) => (v - m) / s)
  }

  const flagAnomalies = (xs: number[], threshold = 2): boolean[] => {
    const z = zScores(xs)
    return z.map((v) => Math.abs(v) > threshold)
  }

  // K-means clustering. points: vectores de igual dimensión.
  // Devuelve: assignments por punto + centroides finales.
  const kmeans = (
    points: number[][],
    k: number,
    options: { maxIter?: number; restarts?: number; seed?: number } = {},
  ): { assignments: number[]; centroids: number[][]; inertia: number } => {
    const { maxIter = 50, restarts = 5 } = options
    if (points.length === 0 || k <= 0) return { assignments: [], centroids: [], inertia: 0 }
    const dim = points[0].length
    const effectiveK = Math.min(k, points.length)

    const distSq = (a: number[], b: number[]): number => {
      let d = 0
      for (let i = 0; i < dim; i++) d += (a[i] - b[i]) ** 2
      return d
    }

    const runOnce = (): { assignments: number[]; centroids: number[][]; inertia: number } => {
      // K-means++ init
      const centroids: number[][] = []
      const firstIdx = Math.floor(Math.random() * points.length)
      centroids.push([...points[firstIdx]])
      while (centroids.length < effectiveK) {
        const dists = points.map((p) =>
          Math.min(...centroids.map((c) => distSq(p, c))),
        )
        const total = dists.reduce((a, b) => a + b, 0)
        if (total === 0) {
          centroids.push([...points[Math.floor(Math.random() * points.length)]])
          continue
        }
        let r = Math.random() * total
        let pickIdx = 0
        for (let i = 0; i < dists.length; i++) {
          r -= dists[i]
          if (r <= 0) { pickIdx = i; break }
        }
        centroids.push([...points[pickIdx]])
      }

      const assignments = new Array(points.length).fill(0)
      for (let iter = 0; iter < maxIter; iter++) {
        let changed = false
        for (let i = 0; i < points.length; i++) {
          let best = 0
          let bestD = Infinity
          for (let c = 0; c < centroids.length; c++) {
            const d = distSq(points[i], centroids[c])
            if (d < bestD) { bestD = d; best = c }
          }
          if (assignments[i] !== best) {
            assignments[i] = best
            changed = true
          }
        }
        const sums = centroids.map(() => new Array(dim).fill(0))
        const counts = new Array(centroids.length).fill(0)
        for (let i = 0; i < points.length; i++) {
          const c = assignments[i]
          counts[c]++
          for (let d = 0; d < dim; d++) sums[c][d] += points[i][d]
        }
        for (let c = 0; c < centroids.length; c++) {
          if (counts[c] === 0) continue
          for (let d = 0; d < dim; d++) centroids[c][d] = sums[c][d] / counts[c]
        }
        if (!changed) break
      }

      let inertia = 0
      for (let i = 0; i < points.length; i++) {
        inertia += distSq(points[i], centroids[assignments[i]])
      }
      return { assignments, centroids, inertia }
    }

    let best = runOnce()
    for (let r = 1; r < restarts; r++) {
      const res = runOnce()
      if (res.inertia < best.inertia) best = res
    }
    return best
  }

  // Frecuencias / distribuciones discretas
  const frequency = <T extends string | number>(xs: T[]): { key: string; count: number }[] => {
    const map = new Map<string, number>()
    for (const v of xs) {
      const k = String(v)
      map.set(k, (map.get(k) || 0) + 1)
    }
    return Array.from(map.entries()).map(([key, count]) => ({ key, count }))
  }

  // Histograma uniforme
  const histogram = (xs: number[], bins = 10): { bin: string; count: number; lower: number; upper: number }[] => {
    const arr = toFinite(xs)
    if (arr.length === 0) return []
    const min = Math.min(...arr)
    const max = Math.max(...arr)
    if (min === max) return [{ bin: `${min}`, count: arr.length, lower: min, upper: min }]
    const step = (max - min) / bins
    const out: { bin: string; count: number; lower: number; upper: number }[] = []
    for (let i = 0; i < bins; i++) {
      const lower = min + step * i
      const upper = i === bins - 1 ? max : min + step * (i + 1)
      out.push({
        bin: `${lower.toFixed(1)}–${upper.toFixed(1)}`,
        count: 0,
        lower,
        upper,
      })
    }
    for (const v of arr) {
      let idx = Math.floor((v - min) / step)
      if (idx === bins) idx = bins - 1
      out[idx].count++
    }
    return out
  }

  // Spearman ρ — correlación basada en rangos. Captura monotonía (no sólo
  // linealidad), es robusta a outliers y a relaciones no lineales como las
  // ecológicas típicas (saturación, umbrales).
  const spearmanCorrelation = (xs: number[], ys: number[]): number => {
    const n = Math.min(xs.length, ys.length)
    if (n < 2) return 0
    return correlation(assignRanks(xs.slice(0, n)), assignRanks(ys.slice(0, n)))
  }

  // Kruskal-Wallis H — ANOVA no paramétrica para K grupos independientes.
  // Apropiado para comparar cobertura coral entre litorales con N pequeño y
  // sin asumir normalidad.
  const kruskalWallis = (
    groups: number[][],
  ): { H: number; df: number; pApprox: number; N: number } => {
    const allValues: { v: number; g: number }[] = []
    groups.forEach((group, gIdx) => {
      for (const v of group) {
        if (Number.isFinite(v)) allValues.push({ v, g: gIdx })
      }
    })
    const N = allValues.length
    if (N < 3 || groups.length < 2) {
      return { H: 0, df: Math.max(0, groups.length - 1), pApprox: 1, N }
    }

    // Ranks globales (con promedio en empates)
    allValues.sort((a, b) => a.v - b.v)
    const ranks = new Array(N).fill(0)
    let i = 0
    while (i < N) {
      let j = i
      while (j < N - 1 && allValues[j + 1].v === allValues[i].v) j++
      const avgRank = (i + j) / 2 + 1
      for (let k = i; k <= j; k++) ranks[k] = avgRank
      i = j + 1
    }

    const groupRankSum = new Array(groups.length).fill(0)
    const groupN = new Array(groups.length).fill(0)
    for (let k = 0; k < N; k++) {
      groupRankSum[allValues[k].g] += ranks[k]
      groupN[allValues[k].g]++
    }

    let H = 0
    for (let g = 0; g < groups.length; g++) {
      if (groupN[g] === 0) continue
      H += (groupRankSum[g] ** 2) / groupN[g]
    }
    H = (12 / (N * (N + 1))) * H - 3 * (N + 1)
    const df = groups.length - 1
    return { H, df, pApprox: chiSquareSF(H, df), N }
  }

  // Índice de Shannon-Wiener (H'). Mide diversidad considerando riqueza y
  // equitatividad. Estándar en ecología bentónica de arrecifes.
  // counts: vector con la abundancia/cobertura de cada categoría.
  const shannonDiversity = (counts: number[]): number => {
    const total = counts.reduce((a, b) => a + (b > 0 ? b : 0), 0)
    if (total === 0) return 0
    let H = 0
    for (const c of counts) {
      if (c > 0) {
        const p = c / total
        H -= p * Math.log(p)
      }
    }
    return H
  }

  // Coral Health Index 0-100 (mayor = mejor). Composite ponderado inspirado
  // en la metodología de Healthy Reefs Initiative, adaptado a las variables
  // del observatorio. Pesos:
  //   cover (40%) — cobertura coral viva, satura en 50% (excelente)
  //   DHW (20%) — estrés térmico inverso, satura en 8 °C·sem (crítico)
  //   protection (15%) — figura legal del sitio
  //   threats (15%) — # de amenazas activas (inverso)
  //   richness (10%) — riqueza de especies (saturación 80)
  // Si un componente falta, sus pesos se redistribuyen proporcionalmente.
  const coralHealthIndex = (reef: {
    liveCoralCover?: number | null
    dhw?: number | null
    protection?: string
    threats?: string[] | null
    speciesRichness?: number | null
  }): number => {
    const components: { value: number; weight: number }[] = []
    const cover = Number(reef.liveCoralCover)
    if (Number.isFinite(cover)) {
      components.push({ value: Math.min(100, cover * 2), weight: 0.4 })
    }
    const dhw = Number(reef.dhw)
    if (Number.isFinite(dhw)) {
      components.push({
        value: Math.max(0, 100 - Math.min(100, dhw * 12.5)),
        weight: 0.2,
      })
    }
    if (reef.protection) {
      const protectionScore: Record<string, number> = {
        unesco: 100,
        anp_federal: 85,
        ramsar: 80,
        anp_state: 70,
        unprotected: 0,
      }
      components.push({
        value: protectionScore[reef.protection] ?? 50,
        weight: 0.15,
      })
    }
    if (Array.isArray(reef.threats)) {
      components.push({
        value: Math.max(0, 100 - reef.threats.length * 15),
        weight: 0.15,
      })
    }
    const sr = Number(reef.speciesRichness)
    if (Number.isFinite(sr)) {
      components.push({ value: Math.min(100, (sr / 80) * 100), weight: 0.1 })
    }
    if (components.length === 0) return 0
    const w = components.reduce((s, c) => s + c.weight, 0)
    return components.reduce((s, c) => s + c.value * (c.weight / w), 0)
  }

  // Matriz de correlaciones — soporta Pearson o Spearman. Devuelve además
  // p-values aproximados para cada celda (igual cálculo en ambos métodos:
  // Spearman es Pearson sobre rangos).
  const correlationMatrix = (
    vars: { name: string; values: number[] }[],
    method: 'pearson' | 'spearman' = 'pearson',
  ): {
    labels: string[]
    matrix: number[][]
    pValues: number[][]
    method: 'pearson' | 'spearman'
  } => {
    const n = vars.length
    const matrix: number[][] = Array.from({ length: n }, () => new Array(n).fill(0))
    const pValues: number[][] = Array.from({ length: n }, () => new Array(n).fill(1))
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) {
          matrix[i][j] = 1
          pValues[i][j] = 0
        } else if (j < i) {
          matrix[i][j] = matrix[j][i]
          pValues[i][j] = pValues[j][i]
        } else {
          const xs: number[] = []
          const ys: number[] = []
          const a = vars[i].values
          const b = vars[j].values
          const len = Math.min(a.length, b.length)
          for (let p = 0; p < len; p++) {
            if (Number.isFinite(a[p]) && Number.isFinite(b[p])) {
              xs.push(a[p])
              ys.push(b[p])
            }
          }
          if (xs.length < 3) {
            matrix[i][j] = 0
            pValues[i][j] = 1
          } else {
            const r =
              method === 'spearman'
                ? spearmanCorrelation(xs, ys)
                : correlation(xs, ys)
            matrix[i][j] = r
            // El p-value se calcula igual en ambos métodos: Spearman es
            // Pearson sobre rangos, así que el test t es comparable.
            pValues[i][j] = pValueFromPearson(r, xs.length)
          }
        }
      }
    }
    return { labels: vars.map((v) => v.name), matrix, pValues, method }
  }

  // Distancia gran-círculo en kilómetros entre dos pares lat/lng (Haversine).
  const haversineKm = (
    lat1: number, lng1: number,
    lat2: number, lng2: number,
  ): number => {
    const R = 6371
    const toRad = (deg: number) => (deg * Math.PI) / 180
    const dLat = toRad(lat2 - lat1)
    const dLng = toRad(lng2 - lng1)
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  // Proxy climatológico de irradiación solar superficial media anual en
  // kWh/m²/día. Aproximación lineal para latitudes 0°–35° basada en valores
  // típicos de NREL/NASA POWER para el caribe y pacífico mexicano.
  // (~6.8 cerca del ecuador, ~5.5 a 32°). No reemplaza una serie satelital,
  // sirve como variable derivada para correlaciones de primer orden.
  const solarIrradiationProxy = (lat: number): number => {
    const absLat = Math.abs(lat)
    return 6.8 - 0.04 * absLat
  }

  return {
    mean,
    median,
    std,
    variance,
    percentile,
    describe,
    coefficientOfVariation,
    bootstrapMeanCI,
    correlation,
    spearmanCorrelation,
    correlationMatrix,
    linearRegression,
    zScores,
    flagAnomalies,
    kmeans,
    frequency,
    histogram,
    haversineKm,
    solarIrradiationProxy,
    kruskalWallis,
    shannonDiversity,
    coralHealthIndex,
    pValueFromPearson,
    mannKendall,
    theilSenSlope,
  }
}

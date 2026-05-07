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

  // Matriz de correlaciones de Pearson entre N variables. Devuelve también las
  // etiquetas para alinear filas/columnas en la UI.
  const correlationMatrix = (
    vars: { name: string; values: number[] }[],
  ): { labels: string[]; matrix: number[][] } => {
    const n = vars.length
    const matrix: number[][] = Array.from({ length: n }, () => new Array(n).fill(0))
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) {
          matrix[i][j] = 1
        } else if (j < i) {
          matrix[i][j] = matrix[j][i]
        } else {
          // Solo pares donde ambos valores son finitos
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
          matrix[i][j] = xs.length >= 2 ? correlation(xs, ys) : 0
        }
      }
    }
    return { labels: vars.map((v) => v.name), matrix }
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
    correlation,
    correlationMatrix,
    linearRegression,
    zScores,
    flagAnomalies,
    kmeans,
    frequency,
    histogram,
    haversineKm,
    solarIrradiationProxy,
  }
}

<script setup lang="ts">
import type { Reef, Contributor, Observation, BleachingAlert } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'admin', pageTransition: false })

const { apiFetch } = useApi()
const auth = useAuthStore()
const reefsStore = useReefsStore()
const contribStore = useContributorsStore()
const obsStore = useObservationsStore()
const math = useAnalyticsMath()

// Superadmin puede consultar interacciones de los 3 observatorios; el resto
// queda restringido a arrecifes (los stores locales sólo contienen ese dataset).
const observatoryOptions = [
  { slug: 'arrecifes', label: 'Arrecifes' },
  { slug: 'humedales', label: 'Humedales' },
  { slug: 'techos-verdes', label: 'Techos verdes' },
] as const
type ObservatorySlug = typeof observatoryOptions[number]['slug']
const targetObservatory = ref<ObservatorySlug>('arrecifes')
const observatoryLabel = computed(
  () => observatoryOptions.find((o) => o.slug === targetObservatory.value)?.label ?? '',
)
const isArrecifesScope = computed(() => targetObservatory.value === 'arrecifes')

interface AnalyticsSummary {
  observatory: string
  from: string
  to: string
  days: number
  totals: {
    events: number
    sessions: number
    pageviews: number
    clicks: number
    submits: number
    downloads: number
  }
  byType: Record<string, number>
  series: { date: string; events: number; sessions: number }[]
  topPaths: { key: string; count: number }[]
  topTargets: { key: string; count: number }[]
}

const summary = ref<AnalyticsSummary | null>(null)
const alerts = ref<BleachingAlert[]>([])
const loading = ref(true)
const error = ref('')
const days = ref(30)
const activeTab = ref<'interacciones' | 'descriptivo' | 'inferencial' | 'modelado'>('interacciones')
const k = ref(3)

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    const sumPromise = apiFetch<{ success: boolean; data: AnalyticsSummary }>(
      `/admin/analytics/summary?days=${days.value}`,
      { observatory: targetObservatory.value },
    )
    // Las alertas de blanqueamiento son específicas de arrecifes; sólo se
    // piden cuando ese observatorio está activo.
    const alertPromise = isArrecifesScope.value
      ? apiFetch<{ success: boolean; items: BleachingAlert[] }>(
          '/alerts/bleaching?latestPerReef=true',
        ).catch(() => ({ success: false, items: [] as BleachingAlert[] }))
      : Promise.resolve({ success: false, items: [] as BleachingAlert[] })

    const [sum, alertRes] = await Promise.all([sumPromise, alertPromise])
    summary.value = sum.data
    alerts.value = alertRes.items || []
  } catch (e: any) {
    error.value = e?.data?.error?.message || 'No se pudieron cargar los datos analíticos'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  // Si los stores aún no fueron hidratados por backend-sync, lo hacemos aquí.
  if (!reefsStore.publicReefs.length || !contribStore.contributors.length || !obsStore.observations.length) {
    try { await useBackendSync().syncAll() } catch { /* fallback al seed */ }
  }
  await load()
})

watch(days, load)
watch(targetObservatory, (next) => {
  // Si cambia a un observatorio sin stores locales, fuerza la pestaña a Interacciones.
  if (next !== 'arrecifes' && activeTab.value !== 'interacciones') {
    activeTab.value = 'interacciones'
  }
  load()
})

// ────────── INTERACCIONES ──────────
const seriesChart = computed(() => {
  if (!summary.value) return null
  return {
    labels: summary.value.series.map((s) => s.date.slice(5)),
    datasets: [
      {
        label: 'Eventos',
        data: summary.value.series.map((s) => s.events),
        borderColor: '#0E7490',
        backgroundColor: 'rgba(14,116,144,0.15)',
        fill: true,
        tension: 0.3,
      },
      {
        label: 'Sesiones únicas',
        data: summary.value.series.map((s) => s.sessions),
        borderColor: '#FF7A66',
        backgroundColor: 'rgba(255,122,102,0.15)',
        fill: true,
        tension: 0.3,
      },
    ],
  }
})

const eventTypeChart = computed(() => {
  if (!summary.value) return null
  const entries = Object.entries(summary.value.byType)
  return {
    labels: entries.map(([k]) => k),
    datasets: [
      {
        data: entries.map(([, v]) => v),
        backgroundColor: ['#0E7490', '#FF7A66', '#10B981', '#F59E0B', '#06B6D4', '#DC2626', '#8B5CF6', '#94A3B8'],
      },
    ],
  }
})

const topPathsChart = computed(() => {
  if (!summary.value) return null
  return {
    labels: summary.value.topPaths.map((p) => p.key.length > 30 ? p.key.slice(0, 30) + '…' : p.key),
    datasets: [
      {
        label: 'Pageviews',
        data: summary.value.topPaths.map((p) => p.count),
        backgroundColor: '#0E7490',
      },
    ],
  }
})

const topTargetsChart = computed(() => {
  if (!summary.value) return null
  return {
    labels: summary.value.topTargets.map((p) => p.key),
    datasets: [
      {
        label: 'Clicks',
        data: summary.value.topTargets.map((p) => p.count),
        backgroundColor: '#FF7A66',
      },
    ],
  }
})

// ────────── DESCRIPTIVO ──────────
const reefs = computed<Reef[]>(() => reefsStore.publicReefs)
const contributors = computed<Contributor[]>(() => contribStore.contributors)
const observations = computed<Observation[]>(() => obsStore.observations || [])

const statusDistribution = computed(() => math.frequency(reefs.value.map((r) => r.status)))
const oceanDistribution = computed(() => math.frequency(reefs.value.map((r) => r.ocean)))
const protectionDistribution = computed(() => math.frequency(reefs.value.map((r) => r.protection)))
const tierDistribution = computed(() => math.frequency(contributors.value.map((c) => c.tier)))

const coralCoverValues = computed(() =>
  reefs.value
    .map((r) => Number(r.liveCoralCover))
    .filter((v) => Number.isFinite(v)),
)
const coralCoverStats = computed(() => math.describe(coralCoverValues.value))
const coralCoverHistogram = computed(() => math.histogram(coralCoverValues.value, 8))
const coralCoverCV = computed(() => math.coefficientOfVariation(coralCoverValues.value))
const coralCoverCI95 = computed(() => math.bootstrapMeanCI(coralCoverValues.value, 0.05, 1000))

// ── Coral Health Index (composite) ──
// Necesitamos las alertas para extraer DHW por arrecife.
const alertByReefId = computed(() => {
  const map = new Map<number, BleachingAlert>()
  for (const a of alerts.value) {
    if (!map.has(a.reefId)) map.set(a.reefId, a)
  }
  return map
})

const reefHealthIndices = computed(() =>
  reefs.value.map((r) => ({
    reef: r,
    chi: math.coralHealthIndex({
      liveCoralCover: Number(r.liveCoralCover),
      dhw: alertByReefId.value.has(r.id)
        ? Number(alertByReefId.value.get(r.id)!.dhw)
        : null,
      protection: r.protection,
      threats: r.threats,
      speciesRichness: r.speciesRichness,
    }),
  })),
)

const meanHealthIndex = computed(() =>
  math.mean(reefHealthIndices.value.map((x) => x.chi)),
)

const healthIndexCI95 = computed(() =>
  math.bootstrapMeanCI(reefHealthIndices.value.map((x) => x.chi), 0.05, 1000),
)

// ── Diversidad bentónica (Shannon H' por arrecife) ──
// Cada `Reef.benthicClasses` es la lista de clases presentes; las tratamos como
// presencia/ausencia y computamos riqueza local. Para Shannon a escala de
// observatorio agregamos las frecuencias entre arrecifes.
const benthicAggregateCounts = computed(() => {
  const counts: Record<string, number> = {}
  for (const r of reefs.value) {
    for (const cls of r.benthicClasses || []) {
      counts[cls] = (counts[cls] || 0) + 1
    }
  }
  return counts
})

const shannonOverall = computed(() =>
  math.shannonDiversity(Object.values(benthicAggregateCounts.value)),
)

const shannonMax = computed(() => {
  const k = Object.keys(benthicAggregateCounts.value).length
  return k > 0 ? Math.log(k) : 0
})

// Equitatividad de Pielou (J' = H' / H_max), 0 = monodominancia, 1 = perfecta.
const pielouEvenness = computed(() => {
  const hMax = shannonMax.value
  return hMax > 0 ? shannonOverall.value / hMax : 0
})

const coralCoverHistChart = computed(() => ({
  labels: coralCoverHistogram.value.map((b) => b.bin + '%'),
  datasets: [{ label: 'Arrecifes', data: coralCoverHistogram.value.map((b) => b.count), backgroundColor: '#10B981' }],
}))

const statusChart = computed(() => ({
  labels: statusDistribution.value.map((d) => d.key),
  datasets: [{ data: statusDistribution.value.map((d) => d.count), backgroundColor: ['#10B981', '#06B6D4', '#F59E0B', '#FF7A66', '#DC2626', '#7C2D12'] }],
}))

const oceanChart = computed(() => ({
  labels: oceanDistribution.value.map((d) => d.key),
  datasets: [{ data: oceanDistribution.value.map((d) => d.count), backgroundColor: ['#0E7490', '#06B6D4', '#FF7A66'] }],
}))

const protectionChart = computed(() => ({
  labels: protectionDistribution.value.map((d) => d.key),
  datasets: [{ label: 'Arrecifes', data: protectionDistribution.value.map((d) => d.count), backgroundColor: '#0891B2' }],
}))

const tierChart = computed(() => ({
  labels: tierDistribution.value.map((d) => d.key),
  datasets: [{ data: tierDistribution.value.map((d) => d.count), backgroundColor: ['#A16207', '#94A3B8', '#FACC15', '#06B6D4', '#FF7A66'] }],
}))

const observationsByStatus = computed(() => math.frequency(observations.value.map((o) => o.status)))
const observationsByType = computed(() => math.frequency(observations.value.map((o) => o.type)))

// ────────── INFERENCIAL ──────────
// Correlación: cobertura coral vs DHW (alertas más recientes por arrecife)
const reefAlertPairs = computed(() => {
  const alertByReef = new Map<number, BleachingAlert>()
  for (const a of alerts.value) {
    if (!alertByReef.has(a.reefId)) alertByReef.set(a.reefId, a)
  }
  return reefs.value
    .filter((r) => Number.isFinite(Number(r.liveCoralCover)) && alertByReef.has(r.id))
    .map((r) => {
      const a = alertByReef.get(r.id)!
      return {
        reefId: r.id,
        name: r.name,
        coralCover: Number(r.liveCoralCover),
        dhw: Number(a.dhw),
        sst: Number(a.sst),
      }
    })
    .filter((p) => Number.isFinite(p.dhw))
})

const corrCoralDhw = computed(() =>
  math.correlation(
    reefAlertPairs.value.map((p) => p.coralCover),
    reefAlertPairs.value.map((p) => p.dhw),
  ),
)

const regCoralDhw = computed(() =>
  math.linearRegression(
    reefAlertPairs.value.map((p) => p.dhw),
    reefAlertPairs.value.map((p) => p.coralCover),
  ),
)

const scatterCoralDhw = computed(() => {
  const points = reefAlertPairs.value.map((p) => ({ x: p.dhw, y: p.coralCover, label: p.name }))
  if (points.length < 2) return null
  const xs = points.map((p) => p.x)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const reg = regCoralDhw.value
  return {
    datasets: [
      {
        label: 'Arrecife',
        data: points,
        backgroundColor: '#0E7490',
        pointRadius: 6,
      },
      {
        label: `Tendencia (R²=${reg.r2.toFixed(2)})`,
        data: [
          { x: minX, y: reg.predict(minX) },
          { x: maxX, y: reg.predict(maxX) },
        ],
        type: 'line',
        borderColor: '#FF7A66',
        backgroundColor: 'transparent',
        pointRadius: 0,
        showLine: true,
      },
    ],
  }
})

// Anomalías: cobertura coral por z-score
const coralAnomalies = computed(() => {
  const xs = coralCoverValues.value
  const flags = math.flagAnomalies(xs, 1.5)
  const z = math.zScores(xs)
  const reefsWithCover = reefs.value.filter((r) => Number.isFinite(Number(r.liveCoralCover)))
  return reefsWithCover
    .map((r, i) => ({
      reef: r,
      z: z[i],
      isAnomaly: flags[i],
    }))
    .filter((x) => x.isAnomaly)
    .sort((a, b) => Math.abs(b.z) - Math.abs(a.z))
})

// ────────── VARIABLES EXTERNAS ──────────
// Para cada arrecife combinamos atributos propios + variables derivadas
// (irradiación solar como proxy por latitud, distancia al arrecife más cercano,
// SST/DHW de la última alerta cuando existe). Sirven para descubrir
// correlaciones con factores externos.
interface ReefDerived {
  reef: Reef
  lat: number                  // latitud absoluta (proxy inverso de irradiación)
  solarKwh: number             // irradiación media anual (kWh/m²/día)
  solarSource: 'nasa_power' | 'proxy'
  airTemp: number | null       // °C, NASA POWER (null si nunca refrescado)
  precipitation: number | null // mm/día
  windSpeed: number | null     // m/s
  humidity: number | null      // %
  depthMid: number             // profundidad media del rango
  areaLog: number              // superficie en log10
  coralCover: number           // % cobertura coral viva
  observations: number
  nearestKm: number            // distancia al arrecife más cercano
  sst: number | null
  sstAnomaly: number | null
  dhw: number | null
}

const reefsDerived = computed<ReefDerived[]>(() => {
  const alertByReef = new Map<number, BleachingAlert>()
  for (const a of alerts.value) {
    if (!alertByReef.has(a.reefId)) alertByReef.set(a.reefId, a)
  }
  const all = reefs.value.filter((r) => Number.isFinite(Number(r.lat)) && Number.isFinite(Number(r.lng)))

  return all
    .filter((r) => Number.isFinite(Number(r.liveCoralCover)))
    .map((r) => {
      const lat = Number(r.lat)
      const lng = Number(r.lng)
      const others = all.filter((o) => o.id !== r.id)
      const nearestKm = others.length === 0
        ? 0
        : Math.min(
            ...others.map((o) => math.haversineKm(lat, lng, Number(o.lat), Number(o.lng))),
          )
      const depthRange = Array.isArray(r.depthRange) ? r.depthRange : [0, 0]
      const depthMid = (Number(depthRange[0]) + Number(depthRange[1])) / 2
      const a = alertByReef.get(r.id)
      const climate = r.climateData
      const realSolar = climate && Number.isFinite(Number(climate.solarIrradiation))
        ? Number(climate.solarIrradiation) : null
      return {
        reef: r,
        lat,
        solarKwh: realSolar ?? math.solarIrradiationProxy(lat),
        solarSource: realSolar !== null ? 'nasa_power' : 'proxy',
        airTemp: climate && Number.isFinite(Number(climate.airTemp)) ? Number(climate.airTemp) : null,
        precipitation: climate && Number.isFinite(Number(climate.precipitation)) ? Number(climate.precipitation) : null,
        windSpeed: climate && Number.isFinite(Number(climate.windSpeed)) ? Number(climate.windSpeed) : null,
        humidity: climate && Number.isFinite(Number(climate.relativeHumidity)) ? Number(climate.relativeHumidity) : null,
        depthMid,
        areaLog: Math.log10(Math.max(1, Number(r.area))),
        coralCover: Number(r.liveCoralCover),
        observations: Number(r.observations) || 0,
        nearestKm,
        sst: a && Number.isFinite(Number(a.sst)) ? Number(a.sst) : null,
        sstAnomaly: a && Number.isFinite(Number(a.sstAnomaly)) ? Number(a.sstAnomaly) : null,
        dhw: a && Number.isFinite(Number(a.dhw)) ? Number(a.dhw) : null,
      }
    })
})

// Cuántos arrecifes ya tienen climatología real (NASA POWER) vs proxy.
const climateCoverage = computed(() => {
  const total = reefsDerived.value.length
  const real = reefsDerived.value.filter((d) => d.solarSource === 'nasa_power').length
  return { total, real, proxy: total - real }
})

const climateRefreshing = ref(false)
const climateRefreshError = ref('')
const climateRefreshSummary = ref('')

const refreshClimate = async () => {
  climateRefreshing.value = true
  climateRefreshError.value = ''
  climateRefreshSummary.value = ''
  try {
    const res = await apiFetch<{
      success: boolean
      data: { total: number; ok: number; failed: number }
    }>('/admin/reefs/refresh-climate', { method: 'POST' })
    const { total, ok, failed } = res.data
    climateRefreshSummary.value = failed === 0
      ? `Climatología NASA POWER actualizada para ${ok} de ${total} arrecifes.`
      : `Actualizados ${ok} de ${total}. ${failed} fallaron — reintenta.`
    // Re-sincroniza arrecifes para refrescar climateData en el store local.
    await useBackendSync().syncAll()
  } catch (e: any) {
    climateRefreshError.value = e?.data?.error?.message
      || 'No se pudo conectar con NASA POWER. Verifica acceso a internet desde el servidor.'
  } finally {
    climateRefreshing.value = false
  }
}

// Variables (en orden de presentación) para la matriz de correlaciones.
const correlationVariables = computed(() => {
  const ds = reefsDerived.value
  const solarLabel = climateCoverage.value.real > 0
    ? climateCoverage.value.proxy > 0
      ? 'Irradiación (NASA + proxy)'
      : 'Irradiación (NASA)'
    : 'Irradiación (proxy)'
  return [
    { name: 'Cobertura coral', short: 'Coral %', values: ds.map((d) => d.coralCover) },
    { name: solarLabel, short: 'Sol kWh', values: ds.map((d) => d.solarKwh) },
    { name: 'Temperatura aire', short: 'T° aire', values: ds.map((d) => d.airTemp ?? NaN) },
    { name: 'Precipitación', short: 'Lluvia', values: ds.map((d) => d.precipitation ?? NaN) },
    { name: 'Viento', short: 'Viento', values: ds.map((d) => d.windSpeed ?? NaN) },
    { name: 'Humedad relativa', short: 'HR %', values: ds.map((d) => d.humidity ?? NaN) },
    { name: 'Latitud absoluta', short: '|Lat|', values: ds.map((d) => Math.abs(d.lat)) },
    { name: 'Profundidad media', short: 'Prof m', values: ds.map((d) => d.depthMid) },
    { name: 'Tamaño (log área)', short: 'log Área', values: ds.map((d) => d.areaLog) },
    { name: 'Aportes', short: 'Aportes', values: ds.map((d) => d.observations) },
    { name: 'Aislamiento', short: 'Vecino km', values: ds.map((d) => d.nearestKm) },
    { name: 'SST (°C)', short: 'SST', values: ds.map((d) => d.sst ?? NaN) },
    { name: 'Anomalía SST', short: 'ΔSST', values: ds.map((d) => d.sstAnomaly ?? NaN) },
    { name: 'DHW (°C·sem)', short: 'DHW', values: ds.map((d) => d.dhw ?? NaN) },
  ]
})

// Método de la matriz de correlación. Spearman (rangos) capta relaciones
// monotónicas no lineales y es robusta a outliers — más apropiada para
// ecología que Pearson cuando N es pequeño.
const correlationMethod = ref<'pearson' | 'spearman'>('spearman')
const correlationMatrix = computed(() =>
  math.correlationMatrix(correlationVariables.value, correlationMethod.value),
)

// Corrección de Bonferroni para múltiples comparaciones. Con K variables hay
// K·(K-1)/2 pares únicos; rechazar H0 a α=0.05 requiere p < 0.05/N_pares.
const bonferroniThreshold = computed(() => {
  const k = correlationMatrix.value.labels.length
  const nPairs = (k * (k - 1)) / 2
  return nPairs > 0 ? 0.05 / nPairs : 0.05
})

const cellSignificance = (i: number, j: number): 'none' | 'raw' | 'bonferroni' => {
  if (i === j) return 'none'
  const p = correlationMatrix.value.pValues[i][j]
  if (p < bonferroniThreshold.value) return 'bonferroni'
  if (p < 0.05) return 'raw'
  return 'none'
}

const matrixCellClass = (r: number): string => {
  const v = Math.abs(r)
  if (!Number.isFinite(r)) return 'bg-gray-50 text-gray-400'
  if (v >= 0.7) return r > 0 ? 'bg-eco/30 text-eco-dark font-semibold' : 'bg-alert/30 text-alert font-semibold'
  if (v >= 0.4) return r > 0 ? 'bg-eco/15 text-eco-dark' : 'bg-alert/15 text-alert'
  if (v >= 0.2) return r > 0 ? 'bg-eco/5 text-ink' : 'bg-alert/5 text-ink'
  return 'bg-white text-ink-muted'
}

// Top correlaciones de la fila "Cobertura coral" (índice 0).
const topDriversOfCoral = computed(() => {
  const m = correlationMatrix.value
  if (!m || m.matrix.length === 0) return []
  const row = m.matrix[0]
  return m.labels
    .map((label, i) => ({ label, r: row[i] }))
    .filter((_, i) => i !== 0)
    .filter((x) => Number.isFinite(x.r))
    .sort((a, b) => Math.abs(b.r) - Math.abs(a.r))
    .slice(0, 5)
})

// Scatters adicionales: cobertura vs irradiación, vs latitud, vs aislamiento.
const buildScatter = (
  xKey: keyof ReefDerived,
  yKey: keyof ReefDerived,
  xLabel: string,
  yLabel: string,
  pointColor = '#0E7490',
  trendColor = '#FF7A66',
) => {
  const ds = reefsDerived.value
    .map((d) => ({
      x: Number(d[xKey]),
      y: Number(d[yKey]),
      name: d.reef.name,
    }))
    .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y))

  if (ds.length < 2) return { data: null, reg: null, corr: 0, xLabel, yLabel }

  const reg = math.linearRegression(ds.map((p) => p.x), ds.map((p) => p.y))
  const corr = math.correlation(ds.map((p) => p.x), ds.map((p) => p.y))
  const xs = ds.map((p) => p.x)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)

  return {
    data: {
      datasets: [
        { label: 'Arrecife', data: ds, backgroundColor: pointColor, pointRadius: 6 },
        {
          label: `Tendencia (R²=${reg.r2.toFixed(2)})`,
          data: [
            { x: minX, y: reg.predict(minX) },
            { x: maxX, y: reg.predict(maxX) },
          ],
          type: 'line',
          borderColor: trendColor,
          backgroundColor: 'transparent',
          pointRadius: 0,
          showLine: true,
        },
      ],
    },
    reg,
    corr,
    xLabel,
    yLabel,
  }
}

const scatterCoralSolar = computed(() =>
  buildScatter('solarKwh', 'coralCover', 'Irradiación solar (kWh/m²/día)', 'Cobertura coral viva (%)'),
)
const scatterCoralLat = computed(() =>
  buildScatter('lat', 'coralCover', 'Latitud (°N)', 'Cobertura coral viva (%)', '#0891B2'),
)
const scatterCoralIsolation = computed(() =>
  buildScatter('nearestKm', 'coralCover', 'Distancia al arrecife más cercano (km)', 'Cobertura coral viva (%)', '#10B981'),
)

const scatterOptionsFor = (xLabel: string, yLabel: string) => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: { title: { display: true, text: xLabel } },
    y: { title: { display: true, text: yLabel } },
  },
  plugins: { legend: { position: 'bottom' as const } },
})

// Comparación entre litorales — añadimos CV% y bootstrap CI a las estadísticas
// descriptivas, para que la tabla muestre variabilidad relativa y la
// incertidumbre real sobre la media.
const oceanCoralStats = computed(() => {
  const oceans = ['caribbean', 'gulf_of_mexico', 'pacific'] as const
  return oceans.map((o) => {
    const values = reefs.value
      .filter((r) => r.ocean === o && Number.isFinite(Number(r.liveCoralCover)))
      .map((r) => Number(r.liveCoralCover))
    const stats = math.describe(values)
    return {
      ocean: o,
      ...stats,
      cv: math.coefficientOfVariation(values),
      ci: values.length >= 2 ? math.bootstrapMeanCI(values, 0.05, 500) : [stats.mean, stats.mean],
    }
  })
})

// Kruskal-Wallis: ¿la cobertura coralina difiere significativamente entre
// litorales? Test no paramétrico apropiado para N=12 sin asumir normalidad.
const oceanKruskalWallis = computed(() => {
  const groups = oceanCoralStats.value
    .map((s) => reefs.value
      .filter((r) => r.ocean === s.ocean && Number.isFinite(Number(r.liveCoralCover)))
      .map((r) => Number(r.liveCoralCover)),
    )
    .filter((g) => g.length > 0)
  return math.kruskalWallis(groups)
})

const oceanLabel = (o: string) =>
  o === 'caribbean' ? 'Caribe' : o === 'gulf_of_mexico' ? 'Golfo de México' : o === 'pacific' ? 'Pacífico' : o

// ────────── MODELADO ──────────
// K-means de arrecifes en 3 dimensiones normalizadas (cobertura, área, observaciones)
const clusterPoints = computed(() => {
  const data = reefs.value
    .filter((r) => Number.isFinite(Number(r.liveCoralCover)) && Number.isFinite(Number(r.area)))
    .map((r) => ({
      reef: r,
      raw: [
        Number(r.liveCoralCover),
        Math.log10(Math.max(1, Number(r.area))),
        Number(r.observations) || 0,
      ],
    }))
  if (data.length === 0) return { reefs: [], points: [] }
  // Normalizar (min-max)
  const dim = 3
  const mins = [Infinity, Infinity, Infinity]
  const maxs = [-Infinity, -Infinity, -Infinity]
  for (const d of data) {
    for (let i = 0; i < dim; i++) {
      if (d.raw[i] < mins[i]) mins[i] = d.raw[i]
      if (d.raw[i] > maxs[i]) maxs[i] = d.raw[i]
    }
  }
  const points = data.map((d) =>
    d.raw.map((v, i) => (maxs[i] === mins[i] ? 0 : (v - mins[i]) / (maxs[i] - mins[i]))),
  )
  return { reefs: data.map((d) => d.reef), points }
})

const clusters = computed(() => {
  const { reefs: rs, points } = clusterPoints.value
  if (points.length === 0) return null
  const result = math.kmeans(points, Math.min(k.value, points.length))
  const groups: { reefs: Reef[]; centroid: number[] }[] = []
  for (let c = 0; c < result.centroids.length; c++) {
    groups.push({ reefs: [], centroid: result.centroids[c] })
  }
  for (let i = 0; i < rs.length; i++) {
    groups[result.assignments[i]].reefs.push(rs[i])
  }
  return groups.filter((g) => g.reefs.length > 0)
})

// Forecast simple: aportes mensuales proyectados con regresión lineal
const observationsByMonth = computed(() => {
  const counts: Record<string, number> = {}
  for (const o of observations.value) {
    const ts = new Date(o.submittedAt || o.capturedAt || 0)
    if (Number.isNaN(ts.getTime())) continue
    const key = `${ts.getFullYear()}-${String(ts.getMonth() + 1).padStart(2, '0')}`
    counts[key] = (counts[key] || 0) + 1
  }
  return Object.entries(counts).sort(([a], [b]) => (a < b ? -1 : 1))
})

const observationsForecast = computed(() => {
  const series = observationsByMonth.value
  if (series.length < 3) return null
  const xs = series.map((_, i) => i)
  const ys = series.map(([, v]) => v)
  const reg = math.linearRegression(xs, ys)
  const futureMonths = 3
  const futureLabels: string[] = []
  const futureValues: number[] = []
  const lastDate = series[series.length - 1][0]
  const [yy, mm] = lastDate.split('-').map(Number)
  for (let i = 1; i <= futureMonths; i++) {
    const d = new Date(yy, (mm - 1) + i, 1)
    futureLabels.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
    futureValues.push(Math.max(0, Math.round(reg.predict(xs.length - 1 + i))))
  }
  return {
    labels: [...series.map(([k]) => k), ...futureLabels],
    historic: [...ys, ...new Array(futureMonths).fill(null)],
    forecast: [...new Array(series.length).fill(null), ys[ys.length - 1], ...futureValues].slice(0, series.length + futureMonths),
    slope: reg.slope,
    r2: reg.r2,
  }
})

const forecastChart = computed(() => {
  const f = observationsForecast.value
  if (!f) return null
  return {
    labels: f.labels,
    datasets: [
      {
        label: 'Aportes históricos',
        data: f.historic,
        borderColor: '#0E7490',
        backgroundColor: 'rgba(14,116,144,0.15)',
        fill: false,
        tension: 0.2,
      },
      {
        label: 'Pronóstico (regresión lineal)',
        data: f.forecast,
        borderColor: '#FF7A66',
        backgroundColor: 'transparent',
        borderDash: [6, 4],
        fill: false,
        tension: 0.2,
      },
    ],
  }
})

// ────────── TENDENCIAS TEMPORALES ──────────
// Carga snapshots históricos (cada uno = estado de un reef en una fecha) para
// computar Mann-Kendall + Theil-Sen sobre el CHI promedio mensual por litoral.
interface ReefMetricSnapshot {
  id: number
  reefId: number
  capturedAt: string // YYYY-MM-DD
  liveCoralCover: number | null
  dhw: number | null
  sst: number | null
  healthIndex: number | null
}

const snapshots = ref<ReefMetricSnapshot[]>([])
const snapshotsLoading = ref(false)
const snapshotting = ref(false)
const snapshotError = ref('')

const loadSnapshots = async () => {
  snapshotsLoading.value = true
  snapshotError.value = ''
  try {
    const res = await apiFetch<{ success: boolean; items: ReefMetricSnapshot[] }>(
      '/reefs/metrics?days=400',
    )
    snapshots.value = res.items || []
  } catch (e: any) {
    snapshotError.value = e?.data?.error?.message || 'No se pudieron cargar los snapshots'
    snapshots.value = []
  } finally {
    snapshotsLoading.value = false
  }
}

const captureSnapshot = async () => {
  snapshotting.value = true
  snapshotError.value = ''
  try {
    await apiFetch('/admin/reefs/snapshot', { method: 'POST' })
    await loadSnapshots()
  } catch (e: any) {
    snapshotError.value = e?.data?.error?.message || 'No se pudo capturar el snapshot'
  } finally {
    snapshotting.value = false
  }
}

onMounted(loadSnapshots)

// Agrupa snapshots por (litoral, mes) y calcula CHI promedio mensual.
interface OceanTrend {
  ocean: 'caribbean' | 'gulf_of_mexico' | 'pacific'
  label: string
  months: { date: string; chi: number }[]
  mannKendall: ReturnType<ReturnType<typeof useAnalyticsMath>['mannKendall']>
  theilSen: number       // pp / mes (puntos del CHI por mes)
}

const reefIdToOcean = computed(() => {
  const map = new Map<number, string>()
  for (const r of reefs.value) map.set(r.id, r.ocean)
  return map
})

const oceanTrends = computed<OceanTrend[]>(() => {
  if (snapshots.value.length === 0 || reefs.value.length === 0) return []

  const grouped: Record<string, Record<string, number[]>> = {
    caribbean: {}, gulf_of_mexico: {}, pacific: {},
  }
  for (const s of snapshots.value) {
    const ocean = reefIdToOcean.value.get(s.reefId)
    if (!ocean || !grouped[ocean]) continue
    if (s.healthIndex == null) continue
    const monthKey = s.capturedAt.slice(0, 7) // YYYY-MM
    if (!grouped[ocean][monthKey]) grouped[ocean][monthKey] = []
    grouped[ocean][monthKey].push(Number(s.healthIndex))
  }

  return (['caribbean', 'gulf_of_mexico', 'pacific'] as const).map((ocean) => {
    const monthsAvg = Object.entries(grouped[ocean])
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, vals]) => ({ date, chi: math.mean(vals) }))
    const series = monthsAvg.map((m) => m.chi)
    const xs = monthsAvg.map((_, i) => i)
    return {
      ocean,
      label: oceanLabel(ocean),
      months: monthsAvg,
      mannKendall: math.mannKendall(series),
      theilSen: math.theilSenSlope(xs, series),
    }
  }).filter((t) => t.months.length >= 3)
})

const trendChart = computed(() => {
  if (oceanTrends.value.length === 0) return null
  const allMonths = Array.from(
    new Set(oceanTrends.value.flatMap((t) => t.months.map((m) => m.date))),
  ).sort()
  const colors: Record<string, string> = {
    caribbean: '#0E7490',
    gulf_of_mexico: '#F59E0B',
    pacific: '#10B981',
  }
  return {
    labels: allMonths.map((m) => m.slice(2)), // 'YY-MM'
    datasets: oceanTrends.value.map((t) => {
      const byMonth = new Map(t.months.map((m) => [m.date, m.chi]))
      return {
        label: t.label,
        data: allMonths.map((m) => byMonth.get(m) ?? null),
        borderColor: colors[t.ocean],
        backgroundColor: colors[t.ocean] + '22',
        tension: 0.25,
        fill: false,
        spanGaps: true,
      }
    }),
  }
})

const trendInterpretation = (t: OceanTrend): string => {
  if (t.mannKendall.pValue >= 0.05) return 'sin tendencia clara'
  if (t.mannKendall.tau > 0) return 'tendencia creciente significativa'
  return 'tendencia decreciente significativa'
}

const baseLineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom' as const } },
}
const baseBarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  indexAxis: 'y' as const,
}
const baseDoughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'right' as const } },
}
const scatterOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: { title: { display: true, text: 'DHW (°C-semanas)' } },
    y: { title: { display: true, text: 'Cobertura coral viva (%)' } },
  },
  plugins: { legend: { position: 'bottom' as const } },
}

const formatPct = (v: number) => `${v.toFixed(1)}%`
const formatNumber = (v: number) => v.toLocaleString('es-MX', { maximumFractionDigits: 2 })
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 class="text-2xl font-semibold text-ink">Monitoreo y análisis</h2>
        <p class="mt-1 text-sm text-ink-muted">
          <span v-if="auth.isSuperadmin">
            Vista superadmin: puedes alternar entre los tres observatorios.
            Mostrando <strong>{{ observatoryLabel }}</strong>.
          </span>
          <span v-else>
            Estadística descriptiva, inferencial y modelado de los datos del observatorio,
            junto con métricas de uso de la plataforma.
          </span>
        </p>
      </div>
      <div class="flex items-center gap-2">
        <select
          v-if="auth.isSuperadmin"
          v-model="targetObservatory"
          class="select !py-1.5 text-xs"
          aria-label="Observatorio"
        >
          <option v-for="o in observatoryOptions" :key="o.slug" :value="o.slug">
            {{ o.label }}
          </option>
        </select>
        <select v-model.number="days" class="select !py-1.5 text-xs">
          <option :value="7">Últimos 7 días</option>
          <option :value="30">Últimos 30 días</option>
          <option :value="90">Últimos 90 días</option>
          <option :value="180">Últimos 180 días</option>
        </select>
        <button class="btn-ghost btn-sm" @click="load" :disabled="loading">
          <Icon name="lucide:refresh-cw" size="16" :class="loading ? 'animate-spin' : ''" />
          Actualizar
        </button>
      </div>
    </header>

    <div v-if="error" class="rounded-2xl border border-alert/30 bg-alert/5 p-4 text-sm text-alert">{{ error }}</div>

    <!-- Tabs -->
    <div class="flex flex-wrap gap-2 border-b border-gray-200">
      <button
        v-for="tab in [
          { key: 'interacciones', label: 'Interacciones', icon: 'lucide:mouse-pointer-click', requiresArrecifes: false },
          { key: 'descriptivo', label: 'Descriptivo', icon: 'lucide:bar-chart-3', requiresArrecifes: true },
          { key: 'inferencial', label: 'Inferencial', icon: 'lucide:trending-up', requiresArrecifes: true },
          { key: 'modelado', label: 'Modelado', icon: 'lucide:network', requiresArrecifes: true },
        ]"
        :key="tab.key"
        class="flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        :class="activeTab === tab.key
          ? 'border-primary text-primary'
          : 'border-transparent text-ink-muted hover:text-ink'"
        :disabled="tab.requiresArrecifes && !isArrecifesScope"
        :title="tab.requiresArrecifes && !isArrecifesScope
          ? `Disponible solo en el panel del observatorio de ${observatoryLabel.toLowerCase()}`
          : undefined"
        @click="activeTab = tab.key as any"
      >
        <Icon :name="tab.icon" size="16" />
        {{ tab.label }}
      </button>
    </div>

    <!-- ───────── INTERACCIONES ───────── -->
    <section v-if="activeTab === 'interacciones'" class="space-y-5">
      <div class="rounded-2xl border border-primary/15 bg-primary/5 p-4 text-xs text-ink">
        <p class="font-semibold text-primary">Cómo está siendo usado el sitio</p>
        <p class="mt-1 text-ink-muted">
          Tracking anónimo y agregado de visitas, clicks, envíos y descargas. Sin información personal: una sesión
          es un identificador local que se borra al cerrar el navegador. Los datos viven en el backend del
          observatorio y se agrupan por día, tipo de evento y ruta visitada.
        </p>
      </div>

      <div class="grid gap-4 md:grid-cols-4">
        <div class="kpi-card">
          <p class="text-xs uppercase tracking-wide text-ink-muted">Pageviews</p>
          <p class="mt-1 text-3xl font-bold text-primary">{{ summary?.totals.pageviews ?? 0 }}</p>
        </div>
        <div class="kpi-card">
          <p class="text-xs uppercase tracking-wide text-ink-muted">Sesiones únicas</p>
          <p class="mt-1 text-3xl font-bold text-coral">{{ summary?.totals.sessions ?? 0 }}</p>
        </div>
        <div class="kpi-card">
          <p class="text-xs uppercase tracking-wide text-ink-muted">Clicks</p>
          <p class="mt-1 text-3xl font-bold text-eco">{{ summary?.totals.clicks ?? 0 }}</p>
        </div>
        <div class="kpi-card">
          <p class="text-xs uppercase tracking-wide text-ink-muted">Envíos / aportes</p>
          <p class="mt-1 text-3xl font-bold text-accent">{{ summary?.totals.submits ?? 0 }}</p>
        </div>
      </div>

      <div class="card p-5">
        <h3 class="text-sm font-semibold text-ink">Evolución diaria</h3>
        <p class="mb-3 mt-1 text-xs text-ink-muted">
          Eventos totales y sesiones únicas por día en el periodo elegido. Sirve para detectar picos de tráfico,
          lanzamientos exitosos o caídas de uso.
        </p>
        <div class="h-72">
          <ChartsLineChart v-if="seriesChart" :data="seriesChart" :options="baseLineOptions" />
          <p v-else class="text-sm text-ink-muted">Sin datos</p>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div class="card p-5">
          <h3 class="text-sm font-semibold text-ink">Tipo de evento</h3>
          <p class="mb-3 mt-1 text-xs text-ink-muted">
            Proporción entre vistas de página, clicks, envíos y descargas. Muestra qué hace la gente una vez que entra.
          </p>
          <div class="h-64">
            <ChartsDoughnutChart v-if="eventTypeChart" :data="eventTypeChart" :options="baseDoughnutOptions" />
            <p v-else class="text-sm text-ink-muted">Sin datos</p>
          </div>
        </div>
        <div class="card p-5">
          <h3 class="text-sm font-semibold text-ink">Top rutas (pageviews)</h3>
          <p class="mb-3 mt-1 text-xs text-ink-muted">
            Las páginas más visitadas. Identifica qué contenido del sitio retiene atención.
          </p>
          <div class="h-64">
            <ChartsBarChart v-if="topPathsChart && summary?.topPaths.length" :data="topPathsChart" :options="baseBarOptions" />
            <p v-else class="text-sm text-ink-muted">Aún no hay rutas registradas</p>
          </div>
        </div>
      </div>

      <div class="card p-5">
        <h3 class="text-sm font-semibold text-ink">Top elementos clickeados (data-track)</h3>
        <p class="mb-3 mt-1 text-xs text-ink-muted">
          Botones, enlaces y tarjetas marcados con <code>data-track</code> ordenados por número de clicks. Útil
          para evaluar qué llamados a la acción funcionan.
        </p>
        <div class="h-64">
          <ChartsBarChart v-if="topTargetsChart && summary?.topTargets.length" :data="topTargetsChart" :options="baseBarOptions" />
          <p v-else class="text-sm text-ink-muted">Sin clicks registrados todavía. Marca elementos clave con <code>data-track="..."</code>.</p>
        </div>
      </div>
    </section>

    <!-- ───────── DESCRIPTIVO ───────── -->
    <section v-if="activeTab === 'descriptivo'" class="space-y-5">
      <div class="rounded-2xl border border-primary/15 bg-primary/5 p-4 text-xs text-ink">
        <p class="font-semibold text-primary">Foto del estado actual</p>
        <p class="mt-1 text-ink-muted">
          Estadística descriptiva: promedios, distribuciones y conteos del inventario de arrecifes y la red de
          colaboradores. Responde a "¿cómo está hoy el sistema?" sin todavía buscar relaciones causales.
        </p>
      </div>

      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div class="kpi-card">
          <p class="text-xs uppercase tracking-wide text-ink-muted">Cobertura coral promedio</p>
          <p class="mt-1 text-3xl font-bold text-eco">{{ formatPct(coralCoverStats.mean) }}</p>
          <p class="mt-1 text-xs text-ink-muted">
            IC 95%: {{ formatPct(coralCoverCI95[0]) }} – {{ formatPct(coralCoverCI95[1]) }}
          </p>
        </div>
        <div class="kpi-card">
          <p class="text-xs uppercase tracking-wide text-ink-muted">Mediana · IQR</p>
          <p class="mt-1 text-3xl font-bold text-primary">{{ formatPct(coralCoverStats.median) }}</p>
          <p class="mt-1 text-xs text-ink-muted">
            IQR = {{ formatPct(coralCoverStats.iqr) }} · CV = {{ coralCoverCV.toFixed(0) }}%
          </p>
        </div>
        <div class="kpi-card">
          <p class="text-xs uppercase tracking-wide text-ink-muted">Índice de salud coralino</p>
          <p
            class="mt-1 text-3xl font-bold"
            :class="meanHealthIndex >= 70 ? 'text-eco' : meanHealthIndex >= 40 ? 'text-accent' : 'text-alert'"
          >
            {{ meanHealthIndex.toFixed(0) }}<span class="text-base">/100</span>
          </p>
          <p class="mt-1 text-xs text-ink-muted">
            IC 95%: {{ healthIndexCI95[0].toFixed(0) }} – {{ healthIndexCI95[1].toFixed(0) }}
          </p>
        </div>
        <div class="kpi-card">
          <p class="text-xs uppercase tracking-wide text-ink-muted">Diversidad bentónica (Shannon H')</p>
          <p class="mt-1 text-3xl font-bold text-secondary">{{ shannonOverall.toFixed(2) }}</p>
          <p class="mt-1 text-xs text-ink-muted">
            Equitatividad J' = {{ pielouEvenness.toFixed(2) }} · {{ coralCoverStats.count }} arrecifes
          </p>
        </div>
      </div>

      <!-- Ranking del Índice de Salud Coralino -->
      <div class="card p-5">
        <h3 class="text-sm font-semibold text-ink">Ranking de salud por arrecife</h3>
        <p class="mb-3 mt-1 text-xs text-ink-muted">
          Índice 0–100 que combina cobertura coral viva (40%), estrés térmico DHW (20%), figura de protección (15%),
          número de amenazas activas (15%) y riqueza de especies (10%). Inspirado en la metodología de la
          <a href="https://www.healthyreefs.org" target="_blank" rel="noopener" class="text-primary underline">
            Healthy Reefs Initiative
          </a>, adaptada a los datos disponibles.
        </p>
        <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="row in [...reefHealthIndices].sort((a, b) => b.chi - a.chi)"
            :key="row.reef.id"
            class="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-3 py-2 text-xs"
          >
            <span class="truncate font-medium text-ink">{{ row.reef.name }}</span>
            <span
              class="ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums"
              :class="row.chi >= 70 ? 'bg-eco/15 text-eco-dark' : row.chi >= 40 ? 'bg-accent/15 text-accent' : 'bg-alert/15 text-alert'"
            >
              {{ row.chi.toFixed(0) }}
            </span>
          </div>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div class="card p-5">
          <h3 class="text-sm font-semibold text-ink">Distribución de cobertura coral</h3>
          <p class="mb-3 mt-1 text-xs text-ink-muted">
            Cuántos arrecifes caen en cada rango de % de coral vivo. Permite ver si el sistema está dominado por
            sitios degradados, sanos, o tiene una distribución pareja.
          </p>
          <div class="h-64">
            <ChartsBarChart :data="coralCoverHistChart" :options="{ ...baseBarOptions, indexAxis: 'x' }" />
          </div>
        </div>
        <div class="card p-5">
          <h3 class="text-sm font-semibold text-ink">Estatus actual</h3>
          <p class="mb-3 mt-1 text-xs text-ink-muted">
            Cuántos arrecifes están en cada categoría de salud (sano, vigilancia, alerta, blanqueamiento, mortalidad).
          </p>
          <div class="h-64">
            <ChartsDoughnutChart :data="statusChart" :options="baseDoughnutOptions" />
          </div>
        </div>
        <div class="card p-5">
          <h3 class="text-sm font-semibold text-ink">Litoral</h3>
          <p class="mb-3 mt-1 text-xs text-ink-muted">
            Reparto de arrecifes entre Caribe, Golfo de México y Pacífico mexicano.
          </p>
          <div class="h-64">
            <ChartsDoughnutChart :data="oceanChart" :options="baseDoughnutOptions" />
          </div>
        </div>
        <div class="card p-5">
          <h3 class="text-sm font-semibold text-ink">Estatus de protección</h3>
          <p class="mb-3 mt-1 text-xs text-ink-muted">
            Cuántos arrecifes están bajo cada figura legal: ANP federal, UNESCO, Ramsar, sin protección.
          </p>
          <div class="h-64">
            <ChartsBarChart :data="protectionChart" :options="baseBarOptions" />
          </div>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div class="card p-5">
          <h3 class="text-sm font-semibold text-ink">Comunidad por modo de participación</h3>
          <p class="mb-3 mt-1 text-xs text-ink-muted">
            Distribución de colaboradores en los cinco modos de la red: curiosidad ciudadana, conocimiento del mar,
            trabajo en agua, investigación formal y síntesis.
          </p>
          <div class="h-64">
            <ChartsDoughnutChart :data="tierChart" :options="baseDoughnutOptions" />
          </div>
        </div>
        <div class="card p-5">
          <h3 class="text-sm font-semibold text-ink">Aportes por estado de revisión</h3>
          <p class="mb-3 mt-1 text-xs text-ink-muted">
            Cuántos aportes ciudadanos están pendientes, en revisión, validados o rechazados. Indica la carga
            actual del equipo revisor.
          </p>
          <ul class="space-y-2 text-sm">
            <li v-for="r in observationsByStatus" :key="r.key" class="flex items-center justify-between border-b border-gray-100 py-2">
              <span class="text-ink-muted">{{ r.key }}</span>
              <span class="font-semibold text-ink">{{ r.count }}</span>
            </li>
            <li v-if="observationsByStatus.length === 0" class="text-sm text-ink-muted">Sin aportes</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- ───────── INFERENCIAL ───────── -->
    <section v-if="activeTab === 'inferencial'" class="space-y-5">
      <div class="rounded-2xl border border-primary/15 bg-primary/5 p-4 text-xs text-ink">
        <p class="font-semibold text-primary">Buscando relaciones</p>
        <p class="mt-1 text-ink-muted">
          Correlaciones, regresiones lineales y detección de anomalías entre cobertura coral y factores externos
          (temperatura, irradiación, latitud, aislamiento, lluvia, viento). El objetivo no es probar causalidad
          sino identificar pistas que valgan la pena investigar.
        </p>
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        <div class="kpi-card">
          <p class="text-xs uppercase tracking-wide text-ink-muted">Correlación cobertura ↔ DHW</p>
          <p class="mt-1 text-3xl font-bold" :class="corrCoralDhw < -0.3 ? 'text-alert' : corrCoralDhw > 0.3 ? 'text-eco' : 'text-ink'">
            {{ formatNumber(corrCoralDhw) }}
          </p>
          <p class="mt-1 text-xs text-ink-muted">
            {{ corrCoralDhw < -0.3 ? 'Negativa: a más DHW, menor cobertura' : corrCoralDhw > 0.3 ? 'Positiva' : 'Débil o sin tendencia clara' }}
          </p>
        </div>
        <div class="kpi-card">
          <p class="text-xs uppercase tracking-wide text-ink-muted">R² regresión lineal</p>
          <p class="mt-1 text-3xl font-bold text-primary">{{ formatNumber(regCoralDhw.r2) }}</p>
          <p class="mt-1 text-xs text-ink-muted">Cobertura coral = {{ formatNumber(regCoralDhw.intercept) }} + {{ formatNumber(regCoralDhw.slope) }} · DHW</p>
        </div>
        <div class="kpi-card">
          <p class="text-xs uppercase tracking-wide text-ink-muted">Anomalías detectadas (|z|&gt;1.5)</p>
          <p class="mt-1 text-3xl font-bold text-alert">{{ coralAnomalies.length }}</p>
          <p class="mt-1 text-xs text-ink-muted">Arrecifes fuera del rango típico</p>
        </div>
      </div>

      <div class="card p-5">
        <h3 class="text-sm font-semibold text-ink">Cobertura coral vs estrés térmico (DHW)</h3>
        <p class="mb-3 mt-1 text-xs text-ink-muted">
          Cada punto es un arrecife. El eje X mide acumulado de calor anómalo (DHW, NOAA CRW); el eje Y, % de coral
          vivo. Si la línea de tendencia baja al moverse a la derecha, se confirma que más estrés térmico se asocia
          con menos coral.
        </p>
        <div class="h-72">
          <ChartsScatterChart v-if="scatterCoralDhw" :data="scatterCoralDhw" :options="scatterOptions" />
          <p v-else class="text-sm text-ink-muted">Sin alertas de blanqueamiento todavía. Carga datos NOAA CRW para ver la correlación.</p>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div class="card p-5">
          <h3 class="text-sm font-semibold text-ink">Comparación entre litorales</h3>
          <p class="mb-3 mt-1 text-xs text-ink-muted">
            Cobertura coral por costa con IC 95% bootstrap (1000 réplicas) y coeficiente de variación.
            La prueba de Kruskal-Wallis evalúa si las diferencias entre las tres medianas son
            estadísticamente significativas; es no paramétrica y apropiada para N pequeño.
          </p>
          <div class="overflow-x-auto">
            <table class="table-base text-xs">
              <thead>
                <tr>
                  <th class="text-left">Litoral</th>
                  <th class="text-right">N</th>
                  <th class="text-right">Media</th>
                  <th class="text-right">IC 95%</th>
                  <th class="text-right">Mediana</th>
                  <th class="text-right">σ</th>
                  <th class="text-right">CV%</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in oceanCoralStats" :key="row.ocean" class="border-t border-gray-100">
                  <td class="py-2 font-medium">{{ oceanLabel(row.ocean) }}</td>
                  <td class="text-right">{{ row.count }}</td>
                  <td class="text-right">{{ formatPct(row.mean) }}</td>
                  <td class="text-right text-ink-muted">
                    {{ formatPct(row.ci[0]) }}–{{ formatPct(row.ci[1]) }}
                  </td>
                  <td class="text-right">{{ formatPct(row.median) }}</td>
                  <td class="text-right">{{ formatPct(row.std) }}</td>
                  <td class="text-right">{{ row.cv.toFixed(0) }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div
            class="mt-3 rounded-lg border p-3 text-xs"
            :class="oceanKruskalWallis.pApprox < 0.05
              ? 'border-eco/30 bg-eco/5 text-eco-dark'
              : 'border-gray-200 bg-gray-50 text-ink-muted'"
          >
            <p class="font-semibold">
              Kruskal-Wallis · H = {{ oceanKruskalWallis.H.toFixed(2) }} · gl = {{ oceanKruskalWallis.df }} · p
              {{ oceanKruskalWallis.pApprox < 0.001 ? '< 0.001' : '= ' + oceanKruskalWallis.pApprox.toFixed(3) }}
            </p>
            <p class="mt-0.5">
              <template v-if="oceanKruskalWallis.pApprox < 0.05">
                Hay diferencias significativas entre litorales (p &lt; 0.05). Las costas no se comportan igual.
              </template>
              <template v-else>
                No hay evidencia de diferencias significativas — las distribuciones por litoral son comparables
                con la N actual.
              </template>
            </p>
          </div>
        </div>

        <div class="card p-5">
          <h3 class="text-sm font-semibold text-ink">Anomalías de cobertura coral</h3>
          <p class="mb-3 mt-1 text-xs text-ink-muted">
            Arrecifes cuya cobertura se aleja más de 1.5 desviaciones estándar de la media (z-score). Banderazo de
            sitios atípicos a investigar — pueden ser excepcionalmente sanos o particularmente afectados.
          </p>
          <div v-if="coralAnomalies.length > 0" class="space-y-2 max-h-64 overflow-y-auto">
            <div v-for="row in coralAnomalies" :key="row.reef.id" class="flex items-center justify-between border-b border-gray-100 py-2">
              <div>
                <p class="text-sm font-medium text-ink">{{ row.reef.name }}</p>
                <p class="text-xs text-ink-muted">{{ row.reef.state }} · {{ formatPct(Number(row.reef.liveCoralCover)) }}</p>
              </div>
              <span class="badge" :class="row.z < 0 ? 'badge-alert' : 'badge-eco'">
                z = {{ formatNumber(row.z) }}
              </span>
            </div>
          </div>
          <p v-else class="text-sm text-ink-muted">No hay arrecifes con valores anómalos según el umbral actual.</p>
        </div>
      </div>

      <!-- Variables externas y matriz de correlaciones -->
      <div class="card p-5">
        <div class="mb-1 flex flex-wrap items-baseline justify-between gap-3">
          <h3 class="text-sm font-semibold text-ink">Variables externas y correlaciones</h3>
          <div class="flex items-center gap-3 text-xs">
            <span class="text-ink-muted">N = {{ reefsDerived.length }} arrecifes</span>
            <span
              class="rounded-full px-2 py-0.5 text-[10px] font-semibold"
              :class="climateCoverage.real === climateCoverage.total && climateCoverage.total > 0
                ? 'bg-eco/15 text-eco-dark'
                : climateCoverage.real > 0
                  ? 'bg-accent/15 text-accent'
                  : 'bg-gray-100 text-ink-muted'"
            >
              NASA POWER: {{ climateCoverage.real }} / {{ climateCoverage.total }}
            </span>
            <div class="inline-flex overflow-hidden rounded-lg border border-gray-200 text-[11px]">
              <button
                class="px-2 py-1 transition-colors"
                :class="correlationMethod === 'spearman' ? 'bg-primary text-white' : 'bg-white text-ink-muted hover:bg-gray-50'"
                @click="correlationMethod = 'spearman'"
              >Spearman ρ</button>
              <button
                class="px-2 py-1 transition-colors"
                :class="correlationMethod === 'pearson' ? 'bg-primary text-white' : 'bg-white text-ink-muted hover:bg-gray-50'"
                @click="correlationMethod = 'pearson'"
              >Pearson r</button>
            </div>
            <button
              class="btn-ghost btn-sm"
              :disabled="climateRefreshing"
              @click="refreshClimate"
            >
              <Icon name="lucide:satellite" size="14" :class="climateRefreshing ? 'animate-spin' : ''" />
              {{ climateRefreshing ? 'Cargando…' : 'Actualizar climatología' }}
            </button>
          </div>
        </div>
        <p class="mb-4 text-xs text-ink-muted">
          Matriz de correlaciones
          <strong>{{ correlationMethod === 'spearman' ? 'de Spearman (rangos)' : 'de Pearson (lineal)' }}</strong>
          entre cobertura coral y factores ambientales. Spearman es robusto a outliers y captura monotonía no
          lineal — más apropiado para ecología con N pequeño. Variables climatológicas anuales:
          <a href="https://power.larc.nasa.gov" target="_blank" rel="noopener" class="text-primary underline">NASA POWER</a>;
          SST/ΔSST/DHW: última alerta NOAA CRW. Cuando falta NASA, la irradiación se estima por latitud.
          Verde = positiva, rojo = negativa, intensidad ∝ |r|.
          <span class="font-semibold">★</span> = significativo tras corrección de Bonferroni (p &lt; {{ bonferroniThreshold.toExponential(1) }}),
          <span class="font-semibold">•</span> = significativo sin corregir (p &lt; 0.05).
        </p>
        <p v-if="climateRefreshError" class="mb-3 rounded-lg border border-alert/30 bg-alert/5 p-2 text-xs text-alert">
          {{ climateRefreshError }}
        </p>
        <p v-if="climateRefreshSummary" class="mb-3 rounded-lg border border-eco/30 bg-eco/5 p-2 text-xs text-eco-dark">
          {{ climateRefreshSummary }}
        </p>
        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead>
              <tr>
                <th class="sticky left-0 z-10 bg-white p-2 text-left text-ink-muted"></th>
                <th
                  v-for="(_, j) in correlationMatrix.labels"
                  :key="`h-${j}`"
                  class="whitespace-nowrap p-2 text-center text-[10px] font-medium uppercase tracking-wide text-ink-muted"
                >
                  {{ correlationVariables[j].short }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(label, i) in correlationMatrix.labels" :key="`r-${i}`">
                <th class="sticky left-0 z-10 whitespace-nowrap bg-white p-2 text-left text-xs font-medium text-ink">
                  {{ label }}
                </th>
                <td
                  v-for="(value, j) in correlationMatrix.matrix[i]"
                  :key="`c-${i}-${j}`"
                  class="whitespace-nowrap px-3 py-2 text-center text-xs tabular-nums"
                  :class="matrixCellClass(value)"
                  :title="`${correlationMatrix.labels[i]} ↔ ${correlationMatrix.labels[j]}: ${correlationMethod === 'spearman' ? 'ρ' : 'r'} = ${value.toFixed(3)} · p = ${correlationMatrix.pValues[i][j].toExponential(2)}`"
                >
                  <span>{{ Number.isFinite(value) ? value.toFixed(2) : '—' }}</span>
                  <span
                    v-if="cellSignificance(i, j) === 'bonferroni'"
                    class="ml-0.5 text-[10px]"
                    aria-label="Significativo tras corrección Bonferroni"
                  >★</span>
                  <span
                    v-else-if="cellSignificance(i, j) === 'raw'"
                    class="ml-0.5 text-[10px]"
                    aria-label="Significativo sin corregir"
                  >•</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="topDriversOfCoral.length > 0" class="mt-5 rounded-xl border border-primary/15 bg-primary/5 p-4">
          <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">
            Factores con mayor relación con la cobertura coral
          </p>
          <ul class="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            <li
              v-for="d in topDriversOfCoral"
              :key="d.label"
              class="rounded-lg bg-white p-3"
            >
              <p class="text-[11px] text-ink-muted">{{ d.label }}</p>
              <p
                class="mt-1 text-lg font-bold tabular-nums"
                :class="d.r < -0.3 ? 'text-alert' : d.r > 0.3 ? 'text-eco-dark' : 'text-ink'"
              >
                {{ d.r >= 0 ? '+' : '' }}{{ d.r.toFixed(2) }}
              </p>
              <p class="text-[10px] text-ink-muted">
                {{ Math.abs(d.r) >= 0.7 ? 'fuerte'
                   : Math.abs(d.r) >= 0.4 ? 'moderada'
                   : Math.abs(d.r) >= 0.2 ? 'débil'
                   : 'sin tendencia' }}
              </p>
            </li>
          </ul>
        </div>
      </div>

      <!-- Scatter plots adicionales: factores externos vs cobertura -->
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div class="card p-5">
          <h3 class="text-sm font-semibold text-ink">Cobertura vs irradiación solar</h3>
          <p class="mb-1 mt-1 text-xs text-ink-muted">
            ¿La cantidad de luz solar que llega al sitio se relaciona con cuánto coral vivo hay? Una pendiente
            positiva sugeriría que sí — los corales dependen de la simbiosis con zooxantelas fotosintéticas.
          </p>
          <p class="mb-3 text-[11px] text-ink-muted">
            r = {{ scatterCoralSolar.corr.toFixed(2) }}
            · R² = {{ scatterCoralSolar.reg ? scatterCoralSolar.reg.r2.toFixed(2) : '—' }}
          </p>
          <div class="h-64">
            <ChartsScatterChart
              v-if="scatterCoralSolar.data"
              :data="scatterCoralSolar.data"
              :options="scatterOptionsFor(scatterCoralSolar.xLabel, scatterCoralSolar.yLabel)"
            />
            <p v-else class="text-sm text-ink-muted">Sin datos suficientes.</p>
          </div>
        </div>

        <div class="card p-5">
          <h3 class="text-sm font-semibold text-ink">Cobertura vs latitud</h3>
          <p class="mb-1 mt-1 text-xs text-ink-muted">
            Arrecifes a latitudes más altas suelen tener temperaturas y luz distintas. Este gráfico revela si esa
            diferencia geográfica se traduce en distinto estado del coral.
          </p>
          <p class="mb-3 text-[11px] text-ink-muted">
            r = {{ scatterCoralLat.corr.toFixed(2) }}
            · R² = {{ scatterCoralLat.reg ? scatterCoralLat.reg.r2.toFixed(2) : '—' }}
          </p>
          <div class="h-64">
            <ChartsScatterChart
              v-if="scatterCoralLat.data"
              :data="scatterCoralLat.data"
              :options="scatterOptionsFor(scatterCoralLat.xLabel, scatterCoralLat.yLabel)"
            />
            <p v-else class="text-sm text-ink-muted">Sin datos suficientes.</p>
          </div>
        </div>

        <div class="card p-5">
          <h3 class="text-sm font-semibold text-ink">Cobertura vs aislamiento</h3>
          <p class="mb-1 mt-1 text-xs text-ink-muted">
            Distancia al arrecife mexicano más cercano. Si los aislados muestran menor cobertura, podría indicar
            que la conectividad ecológica (larvas, especies vagiles) importa para mantener el sistema.
          </p>
          <p class="mb-3 text-[11px] text-ink-muted">
            r = {{ scatterCoralIsolation.corr.toFixed(2) }}
            · R² = {{ scatterCoralIsolation.reg ? scatterCoralIsolation.reg.r2.toFixed(2) : '—' }}
          </p>
          <div class="h-64">
            <ChartsScatterChart
              v-if="scatterCoralIsolation.data"
              :data="scatterCoralIsolation.data"
              :options="scatterOptionsFor(scatterCoralIsolation.xLabel, scatterCoralIsolation.yLabel)"
            />
            <p v-else class="text-sm text-ink-muted">Sin datos suficientes.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ───────── MODELADO ───────── -->
    <section v-if="activeTab === 'modelado'" class="space-y-5">
      <div class="rounded-2xl border border-primary/15 bg-primary/5 p-4 text-xs text-ink">
        <p class="font-semibold text-primary">Agrupar y proyectar</p>
        <p class="mt-1 text-ink-muted">
          Modelos básicos para encontrar grupos naturales de arrecifes parecidos entre sí y para anticipar la
          tendencia futura de aportes ciudadanos. No reemplaza modelos físicos del oceanógrafo; es una primera
          mirada exploratoria.
        </p>
      </div>

      <!-- Tendencias temporales (Mann-Kendall + Theil-Sen sobre snapshots) -->
      <div class="card p-5">
        <div class="mb-1 flex flex-wrap items-baseline justify-between gap-3">
          <h3 class="text-sm font-semibold text-ink">Tendencias temporales del Índice de Salud Coralino</h3>
          <button
            class="btn-ghost btn-sm"
            :disabled="snapshotting || snapshotsLoading"
            @click="captureSnapshot"
          >
            <Icon name="lucide:camera" size="14" :class="snapshotting ? 'animate-spin' : ''" />
            {{ snapshotting ? 'Capturando…' : 'Capturar snapshot ahora' }}
          </button>
        </div>
        <p class="mb-4 text-xs text-ink-muted">
          Promedio mensual del Índice de Salud Coralino por litoral. La <strong>prueba de Mann-Kendall</strong>
          (no paramétrica, robusta a outliers) detecta si existe una tendencia monotónica creciente o decreciente.
          La <strong>pendiente de Theil-Sen</strong> mide la magnitud real del cambio (puntos del CHI por mes) sin
          ser afectada por valores atípicos. Snapshots capturados manualmente vía
          <code>POST /admin/reefs/snapshot</code>; los datos iniciales provienen del seed de 6 meses históricos.
        </p>
        <p v-if="snapshotError" class="mb-3 rounded-lg border border-alert/30 bg-alert/5 p-2 text-xs text-alert">
          {{ snapshotError }}
        </p>

        <div v-if="oceanTrends.length === 0 && !snapshotsLoading" class="text-sm text-ink-muted">
          Aún no hay snapshots históricos. Ejecuta el seed o captura uno manualmente para empezar la serie.
        </div>

        <div v-else>
          <div class="h-72">
            <ChartsLineChart v-if="trendChart" :data="trendChart" :options="baseLineOptions" />
          </div>

          <div class="mt-4 grid gap-3 md:grid-cols-3">
            <div
              v-for="t in oceanTrends"
              :key="t.ocean"
              class="rounded-xl border p-4"
              :class="t.mannKendall.pValue < 0.05
                ? t.mannKendall.tau > 0
                  ? 'border-eco/30 bg-eco/5'
                  : 'border-alert/30 bg-alert/5'
                : 'border-gray-200 bg-gray-50'"
            >
              <p class="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{{ t.label }}</p>
              <p class="mt-1 text-sm font-semibold text-ink">
                {{ trendInterpretation(t) }}
              </p>
              <ul class="mt-2 space-y-0.5 text-[11px] text-ink-muted tabular-nums">
                <li>Mann-Kendall τ = <strong>{{ t.mannKendall.tau.toFixed(2) }}</strong></li>
                <li>p-value = {{ t.mannKendall.pValue < 0.001 ? '< 0.001' : t.mannKendall.pValue.toFixed(3) }}</li>
                <li>Theil-Sen = <strong>{{ t.theilSen >= 0 ? '+' : '' }}{{ t.theilSen.toFixed(2) }}</strong> pts/mes</li>
                <li>N = {{ t.months.length }} meses</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="card p-5">
        <div class="mb-3 flex items-center justify-between gap-3">
          <h3 class="text-sm font-semibold text-ink">K-means de arrecifes (similitud)</h3>
          <div class="flex items-center gap-2 text-xs">
            <label class="text-ink-muted">k =</label>
            <input v-model.number="k" type="number" min="2" max="6" class="input !w-16 !py-1 text-xs" />
          </div>
        </div>
        <p class="mb-3 text-xs text-ink-muted">
          Agrupa arrecifes por similitud combinando cobertura de coral viva, superficie (escala log) y volumen de aportes.
          Variables normalizadas min-max.
        </p>
        <div v-if="clusters && clusters.length > 0" class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <div v-for="(group, idx) in clusters" :key="idx" class="rounded-xl border border-gray-200 bg-white p-4">
            <p class="mb-2 text-xs font-semibold text-primary">Cluster {{ idx + 1 }} · {{ group.reefs.length }} arrecifes</p>
            <p class="mb-2 text-[11px] text-ink-muted">
              Centroide: cobertura {{ (group.centroid[0] * 100).toFixed(0) }}, log-área {{ (group.centroid[1] * 100).toFixed(0) }}, aportes {{ (group.centroid[2] * 100).toFixed(0) }}
            </p>
            <ul class="space-y-1 text-xs">
              <li v-for="r in group.reefs" :key="r.id" class="flex items-center justify-between border-b border-gray-100 py-1">
                <span class="font-medium text-ink">{{ r.name }}</span>
                <span class="text-ink-muted">{{ formatPct(Number(r.liveCoralCover) || 0) }}</span>
              </li>
            </ul>
          </div>
        </div>
        <p v-else class="text-sm text-ink-muted">Sin datos suficientes para clusterizar.</p>
      </div>

      <div class="card p-5">
        <h3 class="text-sm font-semibold text-ink">Pronóstico de aportes mensuales</h3>
        <p class="mb-3 mt-1 text-xs text-ink-muted">
          Proyección de aportes ciudadanos para los próximos 3 meses con base en una regresión lineal del histórico.
          Útil para anticipar carga de revisión y planear capacidad del equipo. La pendiente indica si la
          participación crece, decrece o se estabiliza.
        </p>
        <p v-if="!observationsForecast" class="text-sm text-ink-muted">
          Se necesitan al menos 3 meses con aportes para proyectar. Actualmente: {{ observationsByMonth.length }}.
        </p>
        <div v-else>
          <div class="h-64">
            <ChartsLineChart :data="forecastChart!" :options="baseLineOptions" />
          </div>
          <p class="mt-3 text-xs text-ink-muted">
            Tendencia: {{ observationsForecast.slope > 0 ? 'creciente' : observationsForecast.slope < 0 ? 'decreciente' : 'estable' }}
            ({{ formatNumber(observationsForecast.slope) }} aportes/mes).
            R² = {{ formatNumber(observationsForecast.r2) }}.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

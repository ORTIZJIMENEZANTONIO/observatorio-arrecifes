<script setup lang="ts">
// Constructor interactivo de análisis ("minería de datos") embebido en
// /admin/analytics → Modelado.
//
// El usuario elige:
//   1. Conjunto de datos (arrecifes, observaciones)
//   2. Variable X (numérica o categórica)
//   3. Variable Y (numérica)
//   4. Método: scatter+regresión / scatter+Spearman / boxplot por categoría /
//      histograma comparativo
//
// Renderiza el resultado en vivo y permite descargar CSV con los datos
// crudos del análisis para auditoría / publicación.
import type { Reef, BleachingAlert } from '~/types'

const props = defineProps<{
  reefs: Reef[]
  alerts: BleachingAlert[]
}>()

const math = useAnalyticsMath()

interface VariableDef {
  key: string
  label: string
  kind: 'numeric' | 'categorical'
  unit?: string
  source: string
  sourceUrl?: string
  // (reef) → valor (puede ser null si no está disponible)
  extract: (r: Reef, alertByReef: Map<number, BleachingAlert>) => number | string | null
}

const VARIABLES: VariableDef[] = [
  {
    key: 'liveCoralCover', label: 'Cobertura coral viva', kind: 'numeric', unit: '%',
    source: 'Inventario interno', sourceUrl: '/about',
    extract: (r) => Number(r.liveCoralCover) || null,
  },
  {
    key: 'speciesRichness', label: 'Riqueza de especies', kind: 'numeric',
    source: 'Inventario interno', sourceUrl: '/about',
    extract: (r) => Number(r.speciesRichness) || null,
  },
  {
    key: 'area', label: 'Superficie', kind: 'numeric', unit: 'ha',
    source: 'CONABIO / Inventario', sourceUrl: 'https://www.conabio.gob.mx/',
    extract: (r) => Number(r.area) || null,
  },
  {
    key: 'observations', label: 'Aportes ciudadanos', kind: 'numeric',
    source: 'Red interna', sourceUrl: '/contributors',
    extract: (r) => Number(r.observations) || 0,
  },
  {
    key: 'lat', label: 'Latitud', kind: 'numeric', unit: '°N',
    source: 'Inventario interno', sourceUrl: '/about',
    extract: (r) => Math.abs(Number(r.lat)) || null,
  },
  {
    key: 'depthMid', label: 'Profundidad media', kind: 'numeric', unit: 'm',
    source: 'Inventario interno', sourceUrl: '/about',
    extract: (r) => {
      const d = Array.isArray(r.depthRange) ? r.depthRange : null
      if (!d) return null
      return (Number(d[0]) + Number(d[1])) / 2
    },
  },
  {
    key: 'dhw', label: 'DHW (estrés térmico)', kind: 'numeric', unit: '°C·sem',
    source: 'NOAA Coral Reef Watch',
    sourceUrl: 'https://coralreefwatch.noaa.gov/product/5km/index.php',
    extract: (_r, m) => {
      const a = m.get(_r.id)
      return a && Number.isFinite(Number(a.dhw)) ? Number(a.dhw) : null
    },
  },
  {
    key: 'sst', label: 'SST (temperatura mar)', kind: 'numeric', unit: '°C',
    source: 'NOAA Coral Reef Watch',
    sourceUrl: 'https://coralreefwatch.noaa.gov/product/5km/index.php',
    extract: (_r, m) => {
      const a = m.get(_r.id)
      return a && Number.isFinite(Number(a.sst)) ? Number(a.sst) : null
    },
  },
  {
    key: 'solarKwh', label: 'Irradiación solar', kind: 'numeric', unit: 'kWh/m²/d',
    source: 'NASA POWER',
    sourceUrl: 'https://power.larc.nasa.gov',
    extract: (r) => {
      const c = r.climateData
      return c && Number.isFinite(Number(c.solarIrradiation))
        ? Number(c.solarIrradiation)
        : null
    },
  },
  {
    key: 'airTemp', label: 'Temperatura aire', kind: 'numeric', unit: '°C',
    source: 'NASA POWER',
    sourceUrl: 'https://power.larc.nasa.gov',
    extract: (r) => {
      const c = r.climateData
      return c && Number.isFinite(Number(c.airTemp)) ? Number(c.airTemp) : null
    },
  },
  {
    key: 'precipitation', label: 'Precipitación', kind: 'numeric', unit: 'mm/d',
    source: 'NASA POWER',
    sourceUrl: 'https://power.larc.nasa.gov',
    extract: (r) => {
      const c = r.climateData
      return c && Number.isFinite(Number(c.precipitation)) ? Number(c.precipitation) : null
    },
  },
  {
    key: 'ocean', label: 'Litoral', kind: 'categorical',
    source: 'Inventario interno', sourceUrl: '/about',
    extract: (r) => r.ocean,
  },
  {
    key: 'protection', label: 'Figura de protección', kind: 'categorical',
    source: 'CONANP', sourceUrl: 'https://www.gob.mx/conanp',
    extract: (r) => r.protection,
  },
  {
    key: 'state', label: 'Estado', kind: 'categorical',
    source: 'INEGI', sourceUrl: 'https://www.inegi.org.mx',
    extract: (r) => r.state,
  },
  {
    key: 'status', label: 'Estatus de salud', kind: 'categorical',
    source: 'NOAA CRW + inventario',
    sourceUrl: 'https://coralreefwatch.noaa.gov',
    extract: (r) => r.status,
  },
]

type Method = 'scatter_pearson' | 'scatter_spearman' | 'boxplot' | 'histogram_compare'

const xKey = ref<string>('solarKwh')
const yKey = ref<string>('liveCoralCover')
const method = ref<Method>('scatter_pearson')

const xVar = computed(() => VARIABLES.find((v) => v.key === xKey.value))
const yVar = computed(() => VARIABLES.find((v) => v.key === yKey.value))

// Métodos compatibles según tipos de variables seleccionadas:
// - Ambas numéricas → scatter+regresión, scatter+Spearman, histograma comparativo
// - X categórica + Y numérica → boxplot agrupado
// - Otros → no válido
const validMethods = computed<Method[]>(() => {
  const xKind = xVar.value?.kind
  const yKind = yVar.value?.kind
  if (xKind === 'numeric' && yKind === 'numeric') {
    return ['scatter_pearson', 'scatter_spearman', 'histogram_compare']
  }
  if (xKind === 'categorical' && yKind === 'numeric') return ['boxplot']
  return []
})

watch(validMethods, (next) => {
  if (next.length === 0) return
  if (!next.includes(method.value)) method.value = next[0]
})

const alertByReef = computed(() => {
  const map = new Map<number, BleachingAlert>()
  for (const a of props.alerts) if (!map.has(a.reefId)) map.set(a.reefId, a)
  return map
})

// Pares (x, y, label) para todos los reefs donde ambas variables son finitas.
const pairs = computed(() => {
  if (!xVar.value || !yVar.value) return []
  return props.reefs
    .map((r) => ({
      x: xVar.value!.extract(r, alertByReef.value),
      y: yVar.value!.extract(r, alertByReef.value),
      reef: r,
    }))
    .filter((p) => p.x !== null && p.y !== null && p.x !== '' && p.y !== '')
})

// ────────────────── Resultado: scatter + regresión Pearson ──────────────────
const scatterResult = computed(() => {
  if (method.value !== 'scatter_pearson' && method.value !== 'scatter_spearman') return null
  if (!xVar.value || !yVar.value) return null
  const xs = pairs.value.map((p) => Number(p.x))
  const ys = pairs.value.map((p) => Number(p.y))
  if (xs.length < 3) return null
  const corr =
    method.value === 'scatter_spearman'
      ? math.spearmanCorrelation(xs, ys)
      : math.correlation(xs, ys)
  const reg = math.linearRegression(xs, ys)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  return {
    chart: {
      datasets: [
        {
          label: 'Arrecife',
          data: pairs.value.map((p) => ({ x: Number(p.x), y: Number(p.y), label: p.reef.name })),
          backgroundColor: '#0E7490',
          pointRadius: 6,
        },
        {
          label: `Tendencia (R² = ${reg.r2.toFixed(2)})`,
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
    },
    stats: {
      n: xs.length,
      corr,
      r2: reg.r2,
      slope: reg.slope,
      intercept: reg.intercept,
      method: method.value === 'scatter_spearman' ? 'Spearman ρ' : 'Pearson r',
    },
  }
})

// ────────────────── Resultado: boxplot por categoría ──────────────────
// Chart.js no trae boxplot nativo — graficamos como bar con whiskers
// simulados (mediana + IQR) usando rango y errorbars.
const boxplotResult = computed(() => {
  if (method.value !== 'boxplot') return null
  if (!xVar.value || !yVar.value) return null
  const groups: Record<string, number[]> = {}
  for (const p of pairs.value) {
    const k = String(p.x)
    if (!groups[k]) groups[k] = []
    groups[k].push(Number(p.y))
  }
  const entries = Object.entries(groups)
  if (entries.length === 0) return null
  const stats = entries.map(([cat, vals]) => ({
    cat,
    n: vals.length,
    median: math.median(vals),
    q1: math.percentile(vals, 0.25),
    q3: math.percentile(vals, 0.75),
    min: Math.min(...vals),
    max: Math.max(...vals),
    mean: math.mean(vals),
  }))
  // Test Kruskal-Wallis si ≥ 2 grupos
  const kw = entries.length >= 2
    ? math.kruskalWallis(entries.map(([, v]) => v))
    : { H: 0, df: 0, pApprox: 1, N: 0 }
  return {
    chart: {
      labels: stats.map((s) => s.cat),
      datasets: [
        {
          label: 'Mediana',
          data: stats.map((s) => s.median),
          backgroundColor: '#0E7490',
        },
        {
          label: 'Q1',
          data: stats.map((s) => s.q1),
          backgroundColor: '#06B6D4',
        },
        {
          label: 'Q3',
          data: stats.map((s) => s.q3),
          backgroundColor: '#0891B2',
        },
      ],
    },
    stats,
    kruskalWallis: kw,
  }
})

// ────────────────── Resultado: histograma comparativo ──────────────────
const histResult = computed(() => {
  if (method.value !== 'histogram_compare') return null
  if (!xVar.value || !yVar.value) return null
  const xs = pairs.value.map((p) => Number(p.x))
  const ys = pairs.value.map((p) => Number(p.y))
  if (xs.length < 3) return null
  const hX = math.histogram(xs, 8)
  const hY = math.histogram(ys, 8)
  return {
    chartX: {
      labels: hX.map((b) => b.bin),
      datasets: [{ label: xVar.value!.label, data: hX.map((b) => b.count), backgroundColor: '#0E7490' }],
    },
    chartY: {
      labels: hY.map((b) => b.bin),
      datasets: [{ label: yVar.value!.label, data: hY.map((b) => b.count), backgroundColor: '#FF7A66' }],
    },
    statsX: math.describe(xs),
    statsY: math.describe(ys),
  }
})

// Opciones de Chart.js con títulos de eje según las variables elegidas.
const axisLabel = (v: VariableDef | undefined) =>
  v ? `${v.label}${v.unit ? ` (${v.unit})` : ''}` : ''

const scatterChartOpts = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: { title: { display: true, text: axisLabel(xVar.value) } },
    y: { title: { display: true, text: axisLabel(yVar.value) } },
  },
  plugins: { legend: { position: 'bottom' as const } },
}))

const boxplotChartOpts = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: { title: { display: true, text: axisLabel(xVar.value) } },
    y: { title: { display: true, text: axisLabel(yVar.value) } },
  },
  plugins: { legend: { position: 'bottom' as const } },
}))

const histChartOpts = (label: string) => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: { title: { display: true, text: label } },
    y: { title: { display: true, text: 'Frecuencia (# arrecifes)' }, beginAtZero: true },
  },
  plugins: { legend: { display: false } },
})

// ────────────────── Export CSV ──────────────────
const downloadCSV = () => {
  if (!xVar.value || !yVar.value) return
  const rows: string[][] = [['reef_id', 'reef_name', xVar.value.key, yVar.value.key]]
  for (const p of pairs.value) {
    rows.push([String(p.reef.id), p.reef.name, String(p.x), String(p.y)])
  }
  const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `mineria_${xVar.value.key}_vs_${yVar.value.key}_${method.value}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="card p-5">
    <div class="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 class="text-sm font-semibold text-ink">Constructor de análisis (minería de datos)</h3>
        <p class="mt-1 text-xs text-ink-muted">
          Combina cualquier par de variables del observatorio y aplica el método estadístico
          que tenga sentido para el tipo de dato. Resultado interactivo + exportable como CSV.
        </p>
      </div>
      <button
        class="btn-outline btn-sm"
        :disabled="pairs.length < 3"
        @click="downloadCSV"
      >
        <Icon name="lucide:download" size="14" />
        Exportar CSV ({{ pairs.length }} filas)
      </button>
    </div>

    <!-- Selectores de variable y método -->
    <div class="mb-4 grid gap-3 md:grid-cols-3">
      <div class="form-group !mb-0">
        <label class="form-label">Variable X</label>
        <select v-model="xKey" class="select">
          <optgroup label="Numéricas">
            <option v-for="v in VARIABLES.filter((x) => x.kind === 'numeric')" :key="v.key" :value="v.key">
              {{ v.label }}{{ v.unit ? ` (${v.unit})` : '' }}
            </option>
          </optgroup>
          <optgroup label="Categóricas">
            <option v-for="v in VARIABLES.filter((x) => x.kind === 'categorical')" :key="v.key" :value="v.key">
              {{ v.label }}
            </option>
          </optgroup>
        </select>
        <p class="form-hint">
          Fuente:
          <a v-if="xVar?.sourceUrl" :href="xVar.sourceUrl" target="_blank" rel="noopener" class="text-primary underline">
            {{ xVar.source }}
          </a>
          <span v-else>{{ xVar?.source }}</span>
        </p>
      </div>
      <div class="form-group !mb-0">
        <label class="form-label">Variable Y</label>
        <select v-model="yKey" class="select">
          <optgroup label="Numéricas">
            <option v-for="v in VARIABLES.filter((x) => x.kind === 'numeric')" :key="v.key" :value="v.key">
              {{ v.label }}{{ v.unit ? ` (${v.unit})` : '' }}
            </option>
          </optgroup>
        </select>
        <p class="form-hint">
          Fuente:
          <a v-if="yVar?.sourceUrl" :href="yVar.sourceUrl" target="_blank" rel="noopener" class="text-primary underline">
            {{ yVar.source }}
          </a>
          <span v-else>{{ yVar?.source }}</span>
        </p>
      </div>
      <div class="form-group !mb-0">
        <label class="form-label">Método</label>
        <select v-model="method" class="select" :disabled="validMethods.length === 0">
          <option v-if="validMethods.includes('scatter_pearson')" value="scatter_pearson">
            Scatter + regresión lineal (Pearson)
          </option>
          <option v-if="validMethods.includes('scatter_spearman')" value="scatter_spearman">
            Scatter + correlación rangos (Spearman)
          </option>
          <option v-if="validMethods.includes('boxplot')" value="boxplot">
            Resumen por categoría + Kruskal-Wallis
          </option>
          <option v-if="validMethods.includes('histogram_compare')" value="histogram_compare">
            Histogramas lado a lado
          </option>
        </select>
        <p v-if="validMethods.length === 0" class="form-hint text-alert">
          Combinación de tipos no soportada. Elige al menos una variable numérica.
        </p>
      </div>
    </div>

    <p v-if="pairs.length < 3" class="rounded-lg border border-accent/30 bg-accent/5 p-3 text-xs text-accent">
      Sólo hay {{ pairs.length }} arrecife(s) con datos válidos para esta combinación. Necesitas
      al menos 3 para correr el análisis. Considera elegir variables más universales (cobertura,
      latitud) o cargar climatología NASA POWER si es la limitante.
    </p>

    <!-- Render del análisis -->
    <div v-else>
      <!-- Scatter (Pearson o Spearman) -->
      <div v-if="scatterResult">
        <div class="grid gap-3 md:grid-cols-4">
          <div class="kpi-card">
            <p class="text-[10px] uppercase tracking-wide text-ink-muted">{{ scatterResult.stats.method }}</p>
            <p class="text-2xl font-bold text-primary">{{ scatterResult.stats.corr.toFixed(2) }}</p>
          </div>
          <div class="kpi-card">
            <p class="text-[10px] uppercase tracking-wide text-ink-muted">R²</p>
            <p class="text-2xl font-bold text-secondary">{{ scatterResult.stats.r2.toFixed(2) }}</p>
          </div>
          <div class="kpi-card">
            <p class="text-[10px] uppercase tracking-wide text-ink-muted">Pendiente</p>
            <p class="text-2xl font-bold text-ink">{{ scatterResult.stats.slope.toFixed(3) }}</p>
          </div>
          <div class="kpi-card">
            <p class="text-[10px] uppercase tracking-wide text-ink-muted">N arrecifes</p>
            <p class="text-2xl font-bold text-ink">{{ scatterResult.stats.n }}</p>
          </div>
        </div>
        <div class="mt-4 h-72">
          <ChartsScatterChart :data="scatterResult.chart" :options="scatterChartOpts" />
        </div>
      </div>

      <!-- Boxplot por categoría -->
      <div v-else-if="boxplotResult">
        <div class="mb-3 h-72">
          <ChartsBarChart :data="boxplotResult.chart" :options="boxplotChartOpts" />
        </div>
        <div class="overflow-x-auto">
          <table class="table-base text-xs">
            <thead>
              <tr>
                <th class="text-left">Categoría</th>
                <th class="text-right">N</th>
                <th class="text-right">Mediana</th>
                <th class="text-right">Q1</th>
                <th class="text-right">Q3</th>
                <th class="text-right">Mín</th>
                <th class="text-right">Máx</th>
                <th class="text-right">Media</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in boxplotResult.stats" :key="row.cat" class="border-t border-gray-100">
                <td class="py-2 font-medium">{{ row.cat }}</td>
                <td class="text-right tabular-nums">{{ row.n }}</td>
                <td class="text-right tabular-nums">{{ row.median.toFixed(2) }}</td>
                <td class="text-right tabular-nums">{{ row.q1.toFixed(2) }}</td>
                <td class="text-right tabular-nums">{{ row.q3.toFixed(2) }}</td>
                <td class="text-right tabular-nums">{{ row.min.toFixed(2) }}</td>
                <td class="text-right tabular-nums">{{ row.max.toFixed(2) }}</td>
                <td class="text-right tabular-nums">{{ row.mean.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div
          class="mt-3 rounded-lg border p-3 text-xs"
          :class="boxplotResult.kruskalWallis.pApprox < 0.05
            ? 'border-eco/30 bg-eco/5 text-eco-dark'
            : 'border-gray-200 bg-gray-50 text-ink-muted'"
        >
          <p class="font-semibold">
            Kruskal-Wallis · H = {{ boxplotResult.kruskalWallis.H.toFixed(2) }} ·
            gl = {{ boxplotResult.kruskalWallis.df }} · p
            {{ boxplotResult.kruskalWallis.pApprox < 0.001
              ? '< 0.001'
              : '= ' + boxplotResult.kruskalWallis.pApprox.toFixed(3) }}
          </p>
          <p class="mt-0.5">
            <template v-if="boxplotResult.kruskalWallis.pApprox < 0.05">
              Hay diferencia significativa entre categorías (p &lt; 0.05).
            </template>
            <template v-else>
              No hay evidencia de diferencia significativa con el N actual.
            </template>
          </p>
        </div>
      </div>

      <!-- Histogramas lado a lado -->
      <div v-else-if="histResult" class="grid gap-4 md:grid-cols-2">
        <div>
          <p class="mb-1 text-xs font-semibold text-ink">{{ axisLabel(xVar) }}</p>
          <p class="mb-2 text-[11px] text-ink-muted">
            μ = {{ histResult.statsX.mean.toFixed(2) }} · σ = {{ histResult.statsX.std.toFixed(2) }} ·
            N = {{ histResult.statsX.count }}
          </p>
          <div class="h-56">
            <ChartsBarChart :data="histResult.chartX" :options="histChartOpts(axisLabel(xVar))" />
          </div>
        </div>
        <div>
          <p class="mb-1 text-xs font-semibold text-ink">{{ axisLabel(yVar) }}</p>
          <p class="mb-2 text-[11px] text-ink-muted">
            μ = {{ histResult.statsY.mean.toFixed(2) }} · σ = {{ histResult.statsY.std.toFixed(2) }} ·
            N = {{ histResult.statsY.count }}
          </p>
          <div class="h-56">
            <ChartsBarChart :data="histResult.chartY" :options="histChartOpts(axisLabel(yVar))" />
          </div>
        </div>
      </div>
    </div>

    <p class="mt-3 text-[11px] text-ink-muted">
      <strong>Cómo interpretar:</strong> esto es un análisis exploratorio sobre N pequeño (12
      arrecifes). Una correlación significativa en este panel sugiere una hipótesis a
      investigar, no una conclusión causal. Para publicación científica los datos primarios
      siguen siendo NOAA / NASA / inventario.
    </p>
  </div>
</template>

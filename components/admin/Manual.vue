<script setup lang="ts">
// Manual del observatorio — embebido en /admin (dashboard).
// Pensado para "doomies": lenguaje accesible que cualquier integrante del
// equipo entienda, pero técnicamente honesto. Cada sección abre/cierra para
// que el panel no abrume y el manual sea consultable como referencia.
const sections = [
  { key: 'que-es', label: '¿Qué es este observatorio?', icon: 'lucide:waves' },
  { key: 'flujo', label: 'Flujo de los datos', icon: 'lucide:git-branch' },
  { key: 'sat', label: 'Tecnologías satelitales', icon: 'lucide:satellite' },
  { key: 'osm', label: 'OpenStreetMap & Overpass', icon: 'lucide:map' },
  { key: 'detector', label: 'Detector de invasión costera', icon: 'lucide:radar' },
  { key: 'estad', label: 'Estadística aplicada', icon: 'lucide:chart-area' },
  { key: 'tracking', label: 'Tracking de uso', icon: 'lucide:activity' },
  { key: 'glosario', label: 'Glosario de siglas', icon: 'lucide:book-open' },
  { key: 'limites', label: 'Limitaciones honestas', icon: 'lucide:triangle-alert' },
] as const

type SectionKey = typeof sections[number]['key']
const open = ref<SectionKey | null>('que-es')
const toggle = (k: SectionKey) => { open.value = open.value === k ? null : k }
</script>

<template>
  <section class="card overflow-hidden">
    <header class="flex items-start gap-3 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-secondary/5 p-5">
      <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon name="lucide:book-open-check" size="20" />
      </div>
      <div class="flex-1">
        <h2 class="text-base font-semibold text-ink">Manual del observatorio</h2>
        <p class="mt-1 text-xs text-ink-muted">
          Cómo funciona la plataforma, qué datos satelitales usamos, qué hace cada análisis y
          por qué lo decidimos así. Pensado para que cualquier persona del equipo entienda lo que
          ve en los paneles, sin necesidad de leer código.
        </p>
      </div>
    </header>

    <ul class="divide-y divide-gray-100">
      <li v-for="s in sections" :key="s.key">
        <button
          type="button"
          class="flex w-full items-center justify-between gap-3 px-5 py-3 text-left transition-colors hover:bg-gray-50"
          :class="open === s.key ? 'bg-primary/5' : ''"
          @click="toggle(s.key)"
        >
          <span class="flex items-center gap-3">
            <Icon :name="s.icon" size="16" class="text-primary" />
            <span class="text-sm font-medium text-ink">{{ s.label }}</span>
          </span>
          <Icon
            name="lucide:chevron-down"
            size="16"
            class="text-ink-muted transition-transform"
            :class="open === s.key ? 'rotate-180' : ''"
          />
        </button>

        <div v-if="open === s.key" class="space-y-3 px-5 pb-5 text-sm leading-relaxed text-ink">

          <!-- ─────────────────────────── ¿QUÉ ES? ─────────────────────────── -->
          <template v-if="s.key === 'que-es'">
            <p>
              El <strong>Observatorio de Arrecifes — México</strong> es una plataforma viva que
              monitorea los 12 sistemas arrecifales documentados en las costas mexicanas
              (Caribe, Golfo y Pacífico). Combina cuatro fuentes de información que normalmente
              viven separadas:
            </p>
            <ul class="ml-5 list-disc space-y-1 text-ink-muted">
              <li>
                <strong class="text-ink">Datos satelitales</strong> de NASA, NOAA y la Agencia
                Espacial Europea — qué tan caliente está el mar, cuánta luz solar recibe la
                superficie, qué tan nublado estuvo el cielo.
              </li>
              <li>
                <strong class="text-ink">Bases académicas</strong> — papers indexados,
                cobertura coral histórica, trabajos de la UNAM, CINVESTAV, ICML.
              </li>
              <li>
                <strong class="text-ink">Fuentes institucionales</strong> mexicanas — CONABIO,
                CONANP, INEGI, SEMARNAT.
              </li>
              <li>
                <strong class="text-ink">Aportes de la red</strong> — pescadoras, buzos,
                comunidades costeras y científicas que envían fotos, transectos y reportes
                desde el campo. Cada aporte pasa por una cola de validación humana antes de
                publicarse.
              </li>
            </ul>
            <p>
              La meta no es competir con NOAA o CONABIO; es <em>integrar</em> sus datos abiertos
              con observaciones locales y dejar todo en un lugar accesible para que la
              comunidad, la academia y los tomadores de decisión vean el mismo panorama.
            </p>
          </template>

          <!-- ─────────────────────────── FLUJO ─────────────────────────── -->
          <template v-else-if="s.key === 'flujo'">
            <p>
              El recorrido típico de un dato — desde que un satélite lo captura hasta que aparece
              en una gráfica del panel:
            </p>
            <ol class="ml-5 list-decimal space-y-1.5 text-ink-muted">
              <li>
                <strong class="text-ink">Origen externo</strong>: NOAA, NASA o ESA publican un
                dataset (ejemplo: NOAA Coral Reef Watch publica el "Degree Heating Weeks" cada
                día sobre todos los arrecifes del mundo).
              </li>
              <li>
                <strong class="text-ink">Ingestión</strong>: el backend del observatorio
                (<code>cercu-backend</code>) consulta esos servicios mediante APIs abiertas
                — sin claves comerciales, todos son de dominio público con atribución.
              </li>
              <li>
                <strong class="text-ink">Almacenamiento</strong>: lo guardamos en una base
                MySQL con fechas, fuentes y atribuciones explícitas. Nada se inventa, todo
                trazable a su origen.
              </li>
              <li>
                <strong class="text-ink">Cómputo</strong>: cuando alguien abre un panel
                (<code>/admin/analytics</code>, mapa vivo, etc.) se calculan estadísticas en
                tiempo real sobre lo que está cargado.
              </li>
              <li>
                <strong class="text-ink">Visualización</strong>: gráficas, tablas y mapas en
                el navegador. El que decide qué hacer con la información sigue siendo humano.
              </li>
            </ol>
          </template>

          <!-- ─────────────────────────── SATÉLITES ─────────────────────────── -->
          <template v-else-if="s.key === 'sat'">
            <p>
              Cuatro plataformas satelitales distintas alimentan al observatorio. Cada una
              responde una pregunta diferente:
            </p>

            <div class="rounded-xl border border-primary/15 bg-primary/5 p-4">
              <p class="font-semibold text-ink">
                🌡️ NOAA Coral Reef Watch (CRW)
                <a href="https://coralreefwatch.noaa.gov" target="_blank" rel="noopener" class="ml-1 text-xs text-primary underline">documentación</a>
              </p>
              <p class="mt-1 text-xs text-ink-muted">
                <strong>Pregunta:</strong> ¿Qué tan estresado térmicamente está el arrecife?
              </p>
              <p class="mt-1 text-xs">
                Mide la temperatura superficial del mar (SST) cada día con los satélites
                <strong>NOAA-20 y Suomi NPP</strong>. Calcula el <strong>DHW</strong> (Degree
                Heating Weeks): cuántas semanas seguidas la temperatura superó el promedio
                máximo histórico. DHW &gt; 4 °C·sem dispara alerta de blanqueamiento; DHW &gt; 8 ya
                es mortalidad probable. <strong>Resolución</strong>: 5 km. <strong>Cadencia</strong>: diaria.
                <strong>Uso en el panel</strong>: las alertas que ves en el mapa vivo y en cada
                ficha de arrecife.
              </p>
            </div>

            <div class="rounded-xl border border-eco/15 bg-eco/5 p-4">
              <p class="font-semibold text-ink">
                ☀️ NASA POWER
                <a href="https://power.larc.nasa.gov" target="_blank" rel="noopener" class="ml-1 text-xs text-primary underline">documentación</a>
              </p>
              <p class="mt-1 text-xs text-ink-muted">
                <strong>Pregunta:</strong> ¿Qué clima tiene este arrecife — luz, lluvia,
                viento, humedad?
              </p>
              <p class="mt-1 text-xs">
                Climatología (medias multi-anuales) calculada a partir de modelos asimilando
                MERRA-2, GEOS-5 y otros. La descargamos una vez por arrecife y se cachea —
                el clima medio cambia poco. <strong>Variables</strong>:
                <code>ALLSKY_SFC_SW_DWN</code> (irradiación solar superficial),
                <code>T2M</code> (temperatura aire 2 m), <code>PRECTOTCORR</code>
                (precipitación), <code>WS10M</code> (viento), <code>RH2M</code>
                (humedad). <strong>Uso en el panel</strong>: matriz de correlaciones en
                <code>/admin/analytics</code> → Inferencial.
              </p>
            </div>

            <div class="rounded-xl border border-secondary/15 bg-secondary/5 p-4">
              <p class="font-semibold text-ink">
                🛰️ Sentinel-2 (ESA Copernicus)
                <a href="https://sentinels.copernicus.eu/web/sentinel/missions/sentinel-2" target="_blank" rel="noopener" class="ml-1 text-xs text-primary underline">documentación</a>
              </p>
              <p class="mt-1 text-xs text-ink-muted">
                <strong>Pregunta:</strong> ¿Qué hay en el suelo en una zona específica? ¿Está
                construido, vegetado, deforestado?
              </p>
              <p class="mt-1 text-xs">
                Constelación de dos satélites europeos (Sentinel-2A y 2B) que fotografían cada
                punto de la Tierra en 13 bandas espectrales <strong>cada 5 días</strong>. La
                versión <em>L2A Harmonized</em> ya viene corregida para reflectancia
                superficial. Resolución <strong>10 m</strong> en visible+NIR, <strong>20 m</strong>
                en SWIR. Accedemos via <strong>Google Earth Engine</strong> (REST API,
                autenticación OAuth con service account). <strong>Uso en el panel</strong>:
                detector de invasión costera, donde calculamos índices NDBI y NDVI.
              </p>
              <ul class="mt-2 ml-5 list-disc text-[11px] text-ink-muted">
                <li>
                  <strong>NDBI</strong> (Normalized Difference Built-up Index) =
                  (SWIR − NIR) / (SWIR + NIR). Bandas B11 y B8. <em>Mide superficie
                  construida.</em> Concreto, asfalto y techos pétreos tienen NDBI &gt; 0.
                </li>
                <li>
                  <strong>NDVI</strong> (Normalized Difference Vegetation Index) =
                  (NIR − Red) / (NIR + Red). Bandas B8 y B4. <em>Mide vegetación
                  fotosintéticamente activa.</em> Bosque sano: NDVI &gt; 0.6. Suelo desnudo:
                  cerca de 0.
                </li>
              </ul>
            </div>

            <div class="rounded-xl border border-coral/15 bg-coral/5 p-4">
              <p class="font-semibold text-ink">
                🛰️ Landsat & otros (vía Allen Coral Atlas, GEBCO)
              </p>
              <p class="mt-1 text-xs">
                Para batimetría usamos <strong>GEBCO</strong> (mosaicos globales del fondo
                oceánico, ~450 m de resolución). El <strong>Allen Coral Atlas</strong>
                clasifica el hábitat bentónico de arrecifes globalmente a 5 m con imagery
                Planet Dove. Ambas fuentes son CC BY 4.0 — las consumimos como capas WMS o
                referencia, no descargamos lo crudo.
              </p>
            </div>

            <p class="text-xs text-ink-muted">
              <strong>Por qué estas y no otras:</strong> son las cuatro fuentes globales con
              cobertura completa de México, dominio público o licencias abiertas, y APIs
              estables. Existen alternativas comerciales (Planet, Maxar) con mejor
              resolución pero requieren contratos costosos — quedan como "Fase futura"
              cuando haya partnership.
            </p>
          </template>

          <!-- ─────────────────────────── OSM ─────────────────────────── -->
          <template v-else-if="s.key === 'osm'">
            <p>
              <strong>OpenStreetMap (OSM)</strong> es la "Wikipedia de los mapas": una base
              de datos geográfica abierta editada por más de 10 millones de personas. Tiene
              calles, edificios, ríos, parques, costas. Para nuestros propósitos sirve
              porque <em>tiene los polígonos de edificios reales</em> con sus tags
              (<code>building=hotel</code>, <code>building=residential</code>, etc.).
            </p>
            <p>
              <strong>Overpass API</strong> es el servicio público que permite preguntarle
              a OSM cosas como "dame todos los edificios dentro de este rectángulo".
              No requiere clave, sólo respeta rate-limits suaves. La usamos en el detector
              de invasión costera para:
            </p>
            <ol class="ml-5 list-decimal space-y-1 text-ink-muted">
              <li>
                Encontrar la <strong>línea de costa</strong> (<code>natural=coastline</code>)
                cerca de cada arrecife.
              </li>
              <li>
                Aplicar un <strong>buffer de 20 metros</strong> hacia tierra con
                <strong>Turf.js</strong> (librería JavaScript de geometría espacial). Esto
                aproxima la zona federal marítimo-terrestre (ZOFEMAT) que regula SEMARNAT.
              </li>
              <li>
                Listar todos los <strong>edificios</strong> en el bbox del arrecife
                (<code>way[building]</code>) y verificar cuáles intersectan el buffer.
              </li>
              <li>
                Cada edificio que toque el buffer es un <strong>candidato a invasión</strong> —
                no una invasión confirmada, sólo un punto que vale la pena revisar.
              </li>
            </ol>
            <p class="text-xs text-ink-muted">
              <strong>Por qué OSM y no otra fuente:</strong> Microsoft Building Footprints y
              Google Open Buildings tienen más edificios pero menos metadatos (no tags); OSM
              te dice si es hotel, casa o iglesia. En zonas turísticas mexicanas (Cancún,
              Cozumel, Veracruz) la cobertura OSM es excelente. En sitios remotos
              (Banco Chinchorro, Alacranes) es pobre — es una limitación documentada.
            </p>
          </template>

          <!-- ─────────────────────────── DETECTOR ─────────────────────────── -->
          <template v-else-if="s.key === 'detector'">
            <p>
              El módulo <code>/admin/coastal-intrusions</code> intenta detectar
              construcciones que invaden la zona federal costera. Lo construimos en tres
              fases incrementales:
            </p>

            <div class="rounded-xl border border-gray-200 bg-white p-4">
              <p class="font-semibold text-ink">📐 Fase 1 — Geometría pura</p>
              <p class="mt-1 text-xs">
                Línea de costa OSM + buffer 20 m + intersección con edificios OSM. Salida:
                lista de "candidatos". <em>Ningún juicio</em> sobre si es invasión legal —
                eso depende del humano que revisa.
              </p>
            </div>

            <div class="rounded-xl border border-gray-200 bg-white p-4">
              <p class="font-semibold text-ink">🛰️ Fase 2 — Detección de novedad temporal</p>
              <p class="mt-1 text-xs">
                Para cada candidato pulla NDBI sobre el centroide en dos ventanas
                (hace 7 años vs último semestre). Si NDBI subió fuerte y partió de un
                valor bajo, es probable construcción nueva. Score 0–100 con código de color.
              </p>
            </div>

            <div class="rounded-xl border border-gray-200 bg-white p-4">
              <p class="font-semibold text-ink">🌿 Fase 3 — Corroboración + serie temporal</p>
              <p class="mt-1 text-xs">
                Mejoras al análisis de Fase 2:
              </p>
              <ul class="mt-1 ml-5 list-disc space-y-0.5 text-[11px] text-ink-muted">
                <li>
                  <strong class="text-ink">Muestreo sobre el polígono completo</strong> (no
                  sólo el centroide). Más fiel a edificios irregulares.
                </li>
                <li>
                  <strong class="text-ink">NDVI corroborativo</strong>: si NDBI subió pero
                  NDVI no bajó, sospechoso (no se removió vegetación → cambio dudoso). El
                  score se multiplica por 0.6–1.0 según corroboración.
                </li>
                <li>
                  <strong class="text-ink">Serie temporal anual</strong> opt-in (botón
                  "timeseries"): pulla un dato por año desde 2017. Permite ver
                  <em>cuándo</em> empezó la construcción, no sólo si es nueva.
                </li>
              </ul>
            </div>

            <p>
              <strong>Workflow del admin:</strong>
            </p>
            <ol class="ml-5 list-decimal space-y-1 text-xs text-ink-muted">
              <li>Click "Ejecutar detector" → carga candidatos OSM.</li>
              <li>Click "Analizar novedad (batch)" → score temporal a los 30 más grandes.</li>
              <li>Para cada candidato sospechoso, decide: <strong>verificar</strong>,
                  <strong>descartar</strong> con notas, o <strong>escalar</strong> a un
                  conflicto del Atlas (con narrativa, drivers, resistance).</li>
            </ol>
          </template>

          <!-- ─────────────────────────── ESTADÍSTICA ─────────────────────────── -->
          <template v-else-if="s.key === 'estad'">
            <p>
              En <code>/admin/analytics</code> hacemos varios análisis estadísticos. Cada uno
              responde una pregunta concreta y tiene una razón de elegirlo en lugar de
              alternativas más comunes:
            </p>

            <ul class="space-y-2 text-xs">
              <li class="rounded-lg border border-gray-100 bg-white p-3">
                <strong class="text-ink">Intervalo de confianza 95% por bootstrap</strong>
                (mil réplicas, percentil) en lugar de IC paramétrico (media ± 1.96·SE).
                <span class="block text-ink-muted">
                  ¿Por qué? Con N = 12 arrecifes, el IC paramétrico sobre-estima la precisión.
                  El bootstrap es honesto: te dice "si tomáramos otra muestra de 12, qué tan
                  diferente sería la media".
                </span>
              </li>
              <li class="rounded-lg border border-gray-100 bg-white p-3">
                <strong class="text-ink">Coeficiente de variación (CV %)</strong>: σ / media × 100.
                <span class="block text-ink-muted">
                  ¿Por qué? Compara variabilidad entre grupos con escalas distintas
                  (Caribe vs Pacífico tienen medias diferentes, σ no es comparable).
                </span>
              </li>
              <li class="rounded-lg border border-gray-100 bg-white p-3">
                <strong class="text-ink">Correlación de Spearman ρ</strong> (rangos) en lugar
                de Pearson r (lineal).
                <span class="block text-ink-muted">
                  ¿Por qué? Spearman es robusta a outliers y captura monotonía no lineal —
                  típica en ecología (saturación, umbrales). Con N pequeño es la elección
                  más segura. Pearson sigue disponible como toggle.
                </span>
              </li>
              <li class="rounded-lg border border-gray-100 bg-white p-3">
                <strong class="text-ink">Corrección de Bonferroni</strong> en la matriz de
                correlaciones (★ aparece sólo si p &lt; 0.05/N_pares).
                <span class="block text-ink-muted">
                  ¿Por qué? La matriz hace 91 pruebas simultáneas. Sin corregir, ~5 saldrían
                  "significativas" sólo por azar. Bonferroni endurece el umbral
                  proporcionalmente.
                </span>
              </li>
              <li class="rounded-lg border border-gray-100 bg-white p-3">
                <strong class="text-ink">Kruskal-Wallis</strong> para comparar litorales.
                <span class="block text-ink-muted">
                  ¿Por qué? ANOVA paramétrica asume normalidad. Con N = 12 no podemos
                  validar normalidad confiablemente. Kruskal-Wallis es no paramétrica:
                  trabaja con rangos, no necesita esa suposición.
                </span>
              </li>
              <li class="rounded-lg border border-gray-100 bg-white p-3">
                <strong class="text-ink">Mann-Kendall + Theil-Sen</strong> para tendencias en
                el tiempo (pestaña Modelado).
                <span class="block text-ink-muted">
                  Mann-Kendall te dice si HAY tendencia (creciente/decreciente/sin tendencia);
                  Theil-Sen te da la PENDIENTE robusta. Robustos a outliers y no asumen
                  linealidad estricta.
                </span>
              </li>
              <li class="rounded-lg border border-gray-100 bg-white p-3">
                <strong class="text-ink">K-means clustering</strong> (k++ init, 5 reinicios)
                para agrupar arrecifes parecidos.
                <span class="block text-ink-muted">
                  Variables normalizadas (cobertura, log-área, aportes) → encuentra grupos
                  naturales sin etiquetas previas. Útil para detectar que un sitio se aleja
                  del comportamiento de su grupo.
                </span>
              </li>
              <li class="rounded-lg border border-gray-100 bg-white p-3">
                <strong class="text-ink">Diversidad de Shannon H' + equitatividad de Pielou J'</strong>
                <span class="block text-ink-muted">
                  H' mide cuántas clases bentónicas distintas hay y qué tan bien
                  distribuidas. J' = H'/H_max (0 = una clase domina, 1 = todas iguales).
                  Estándar en ecología.
                </span>
              </li>
              <li class="rounded-lg border border-gray-100 bg-white p-3">
                <strong class="text-ink">Coral Health Index (CHI)</strong>
                <span class="block text-ink-muted">
                  Composite ponderado 0–100 inspirado en Healthy Reefs Initiative:
                  cobertura coral (40 %), DHW (20 %), figura de protección (15 %), # amenazas
                  (15 %), riqueza de especies (10 %). Si falta un componente, el peso se
                  redistribuye proporcionalmente.
                </span>
              </li>
            </ul>
          </template>

          <!-- ─────────────────────────── TRACKING ─────────────────────────── -->
          <template v-else-if="s.key === 'tracking'">
            <p>
              La pestaña <strong>Interacciones</strong> de <code>/admin/analytics</code>
              muestra cómo está siendo usado el sitio. Lo construimos pensando en privacidad:
            </p>
            <ul class="ml-5 list-disc space-y-1 text-ink-muted">
              <li>
                <strong class="text-ink">Sin PII</strong>: nombre, email, teléfono — nada de
                eso se captura. Una sesión es un identificador local generado al azar
                (UUID v4) que se borra al cerrar el navegador.
              </li>
              <li>
                <strong class="text-ink">IP hasheada</strong>: el backend aplica SHA-256 con
                un salt local antes de guardarla. No podemos recuperar IPs originales.
              </li>
              <li>
                <strong class="text-ink">Sólo eventos relevantes</strong>: pageviews, clicks
                en elementos marcados con <code>data-track</code>, envíos de formulario.
                Las páginas <code>/admin/*</code> NO se trackean — es uso interno del equipo.
              </li>
              <li>
                <strong class="text-ink">Agregado, no individual</strong>: el panel sólo
                expone agregados (totales, distribuciones, rankings). Nadie puede ver la
                actividad de una persona específica.
              </li>
            </ul>
            <p class="text-xs text-ink-muted">
              Esto es comparable en privacidad a Plausible o Fathom Analytics, no a Google
              Analytics.
            </p>
          </template>

          <!-- ─────────────────────────── GLOSARIO ─────────────────────────── -->
          <template v-else-if="s.key === 'glosario'">
            <dl class="grid gap-2 sm:grid-cols-2">
              <div class="rounded-lg border border-gray-100 bg-white p-3 text-xs">
                <dt class="font-semibold text-ink">ANP</dt>
                <dd class="text-ink-muted">Área Natural Protegida (CONANP).</dd>
              </div>
              <div class="rounded-lg border border-gray-100 bg-white p-3 text-xs">
                <dt class="font-semibold text-ink">CHI</dt>
                <dd class="text-ink-muted">Coral Health Index — score 0–100 que combina cobertura, estrés térmico, protección, amenazas y riqueza.</dd>
              </div>
              <div class="rounded-lg border border-gray-100 bg-white p-3 text-xs">
                <dt class="font-semibold text-ink">CONABIO</dt>
                <dd class="text-ink-muted">Comisión Nacional para el Conocimiento y Uso de la Biodiversidad.</dd>
              </div>
              <div class="rounded-lg border border-gray-100 bg-white p-3 text-xs">
                <dt class="font-semibold text-ink">CONANP</dt>
                <dd class="text-ink-muted">Comisión Nacional de Áreas Naturales Protegidas.</dd>
              </div>
              <div class="rounded-lg border border-gray-100 bg-white p-3 text-xs">
                <dt class="font-semibold text-ink">CRW</dt>
                <dd class="text-ink-muted">Coral Reef Watch — programa de monitoreo de NOAA.</dd>
              </div>
              <div class="rounded-lg border border-gray-100 bg-white p-3 text-xs">
                <dt class="font-semibold text-ink">DHW</dt>
                <dd class="text-ink-muted">Degree Heating Weeks — semanas acumuladas de calor anómalo. &gt;4 = blanqueamiento; &gt;8 = mortalidad.</dd>
              </div>
              <div class="rounded-lg border border-gray-100 bg-white p-3 text-xs">
                <dt class="font-semibold text-ink">GEE</dt>
                <dd class="text-ink-muted">Google Earth Engine — plataforma cloud para análisis de imagery satelital.</dd>
              </div>
              <div class="rounded-lg border border-gray-100 bg-white p-3 text-xs">
                <dt class="font-semibold text-ink">NDBI</dt>
                <dd class="text-ink-muted">Normalized Difference Built-up Index — detecta superficie construida.</dd>
              </div>
              <div class="rounded-lg border border-gray-100 bg-white p-3 text-xs">
                <dt class="font-semibold text-ink">NDVI</dt>
                <dd class="text-ink-muted">Normalized Difference Vegetation Index — detecta vegetación.</dd>
              </div>
              <div class="rounded-lg border border-gray-100 bg-white p-3 text-xs">
                <dt class="font-semibold text-ink">OSM</dt>
                <dd class="text-ink-muted">OpenStreetMap — base de datos geográfica colaborativa.</dd>
              </div>
              <div class="rounded-lg border border-gray-100 bg-white p-3 text-xs">
                <dt class="font-semibold text-ink">SAM</dt>
                <dd class="text-ink-muted">Sistema Arrecifal Mesoamericano — Belice + Honduras + Guatemala + Quintana Roo.</dd>
              </div>
              <div class="rounded-lg border border-gray-100 bg-white p-3 text-xs">
                <dt class="font-semibold text-ink">SCTLD</dt>
                <dd class="text-ink-muted">Stony Coral Tissue Loss Disease — enfermedad de corales pétreos identificada en 2014.</dd>
              </div>
              <div class="rounded-lg border border-gray-100 bg-white p-3 text-xs">
                <dt class="font-semibold text-ink">SST</dt>
                <dd class="text-ink-muted">Sea Surface Temperature — temperatura superficial del mar.</dd>
              </div>
              <div class="rounded-lg border border-gray-100 bg-white p-3 text-xs">
                <dt class="font-semibold text-ink">SWIR / NIR</dt>
                <dd class="text-ink-muted">Short-Wave Infrared / Near-Infrared. Bandas espectrales que distinguen materiales.</dd>
              </div>
              <div class="rounded-lg border border-gray-100 bg-white p-3 text-xs">
                <dt class="font-semibold text-ink">ZOFEMAT</dt>
                <dd class="text-ink-muted">Zona Federal Marítimo-Terrestre — franja de 20 m desde la pleamar máxima, propiedad federal de México.</dd>
              </div>
            </dl>
          </template>

          <!-- ─────────────────────────── LIMITACIONES ─────────────────────────── -->
          <template v-else-if="s.key === 'limites'">
            <p>
              Mejor decir esto explícito que pretender que la herramienta es perfecta:
            </p>
            <ul class="ml-5 list-disc space-y-1 text-ink-muted">
              <li>
                <strong class="text-ink">N pequeño en arrecifes</strong>: 12 sitios. Suficiente
                para descripción y exploración; insuficiente para inferencia confiable.
                Por eso usamos métodos no paramétricos (Spearman, Kruskal-Wallis,
                Mann-Kendall) y bootstrap en lugar de t-tests.
              </li>
              <li>
                <strong class="text-ink">Detección no es prueba legal</strong>: el detector de
                invasión costera produce <em>candidatos</em>. Una construcción detectada
                puede ser legal (con permiso), o estar fuera de la ZOFEMAT real (nuestro
                buffer de 20 m es aproximación). La cola es admin-only por diseño.
              </li>
              <li>
                <strong class="text-ink">Cobertura OSM desigual</strong>: bien en zonas
                turísticas (Cancún, Cozumel, Veracruz), pobre en sitios remotos
                (Banco Chinchorro, Alacranes). El detector encuentra menos en lo segundo
                porque OSM tiene menos.
              </li>
              <li>
                <strong class="text-ink">Imagery satelital limitada por nubes</strong>: en
                zonas tropicales mexicanas la nubosidad puede invalidar imagery por meses.
                Cuando ocurre, los análisis NDBI/NDVI devuelven 502 honesto.
              </li>
              <li>
                <strong class="text-ink">El proxy de irradiación por latitud</strong>
                (cuando NASA POWER no está cacheado) es una aproximación. Un arrecife
                en Veracruz tiene menos sol real que el proxy sugiere por la nubosidad
                del Golfo. Por eso el banner muestra "NASA POWER: X / 12" para que sepas
                cuántos están con dato real vs proxy.
              </li>
              <li>
                <strong class="text-ink">No reemplazamos a NOAA, CONABIO ni academia</strong>.
                Integramos sus datos abiertos con observaciones locales. Para decisiones
                regulatorias o publicación científica, los datos primarios siguen siendo
                la fuente — nosotros vinculamos.
              </li>
            </ul>
          </template>

        </div>
      </li>
    </ul>
  </section>
</template>

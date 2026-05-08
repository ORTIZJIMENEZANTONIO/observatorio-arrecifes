# Observatorio de Arrecifes — México

## Product

Plataforma viva de monitoreo de arrecifes coralinos mexicanos. Combina datos satelitales
casi en tiempo real (NASA, NOAA, ESA Copernicus, USGS), capas oficiales (CONABIO, CONANP,
INEGI) y aportes verificados de pescadores, buzos, comunidades costeras e investigadoras.

**Iniciativa institucional:** CIIEMAD — Centro Interdisciplinario de Investigaciones y
Estudios sobre Medio Ambiente y Desarrollo, **Instituto Politécnico Nacional (IPN)**.
Logos `/images/logo-ciiemad.png` y `/images/logo-ipn.svg` se muestran en header (md+) y
footer; mismo patrón que `observatorio-humedales`.

Inspirado en:
- **[Allen Coral Atlas](https://allencoralatlas.org)** — mapas globales de hábitat bentónico
  a 5 m con monitoreo de blanqueamiento.
- **[EJAtlas](https://ejatlas.org)** — cartografía de conflictos socioambientales con
  perspectiva de justicia ambiental.

Cubre 12+ arrecifes documentados en Caribe, Golfo de México y Pacífico mexicano (SAM,
PNSAV, Cabo Pulmo, Revillagigedo, Alacranes, Huatulco, Isla Isabel, Espíritu Santo, etc.).

UI/copy 100% en español (es-MX). Tono: institucional, técnico pero accesible. **Código y
nombres de identificadores en inglés** (camelCase, arrow functions). Mobile-first.

### Jerarquía de fuentes (PRIORIDAD ALTA)

1. **Datos satelitales operacionales** — NOAA CRW, NASA OB.DAAC/PACE, ESA Copernicus, USGS Landsat
2. **Bases académicas indexadas** — Web of Science, Scopus, SciELO, Redalyc
3. **Fuentes institucionales mexicanas** — CONANP, CONABIO, INEGI, SEMARNAT
4. **Aportes de la red** — validados por revisores
5. **Prensa y comunicados** — solo complemento, nunca fuente primaria de datos técnicos

### Capitalización en español

Solo la primera palabra y nombres propios en mayúscula (sentence case). Excepciones:
acrónimos (NASA, NOAA, CONABIO, SAM, ANP, ODS) y nombres propios (Cabo Pulmo, Sistema
Arrecifal Mesoamericano, Caribe, Pacífico, etc.).

## Stack

- **Framework:** Nuxt 3 + Vue 3 (Composition API, `<script setup lang="ts">`)
- **State:** Pinia (composable style)
- **Styling:** Tailwind CSS 3 + sistema de diseño océano/coral (`assets/css/main.css`)
- **Maps:** Leaflet (`.client.vue` + `<ClientOnly>`) — auto-importado como `MapPanel`
- **Charts:** Chart.js + vue-chartjs (`.client.vue`)
- **SSR:** desactivado (`ssr: false`) — SPA mode
- **Icons:** nuxt-icon (Lucide via Iconify) — `<Icon name="lucide:waves" size="20" />`
- **Fonts:** Inter (UI) + Space Grotesk (display headings)
- **Utilities:** VueUse, @nuxtjs/color-mode (dark mode), @nuxtjs/i18n (es/en)
- **TypeScript:** strict
- **Convenciones:** todos los identificadores en inglés, arrow functions, camelCase,
  mobile-first

## Commands

```bash
npm run dev        # Dev server (puerto 3000)
npm run build      # Production build
npm run generate   # Static generation
npm run preview    # Preview production build
npm test           # Vitest
npm run test:watch
npm run test:coverage
```

## Key Directories

```
observatorio-arrecifes/
  assets/
    css/main.css            # Estilos globales, sistema de cards/buttons/badges/forms,
                            # animaciones, tier-bronze/silver/gold/platinum/coral, live-dot
  components/
    common/                 # AppHeader, AppFooter, HeroSection (Allen-Atlas: batimetría +
                            # tile-grid + caustics + lava orbs), SectionTitle, PaginationControls,
                            # CountUp.vue (animación de números con easeOutExpo + reduced-motion)
    contributors/           # ContributorCard (avatar, tier badge, métricas, badges)
    map/                    # MapPanel.client.vue (Leaflet + circleMarker por estado)
    charts/                 # Wrappers de Chart.js + vue-chartjs (`.client.vue`):
                            # BarChart, LineChart, DoughnutChart, ScatterChart.
                            # Cada uno registra los `Chart.register(...)` propios y expone
                            # props `:data` y `:options`. Auto-importados como ChartsXxx
    home/                   # (placeholder) home-only sections
    admin/                   # Manual.vue — manual del observatorio embebido en
                             # /admin (dashboard). 9 secciones colapsables con
                             # explicación accesible de tecnologías satelitales
                             # (NOAA CRW, NASA POWER, Sentinel-2, OSM/Overpass,
                             # GEE), fases del detector ZOFEMAT, estadística
                             # aplicada (bootstrap, Spearman, K-W, Bonferroni,
                             # Mann-Kendall, K-means, Shannon, CHI), tracking
                             # de uso, glosario y limitaciones honestas.
                             # InfoTooltip.vue — `<AdminInfoTooltip text="…">`
                             # con hover desktop / tap mobile, 3 placements,
                             # 2 variants (inline | icon-only); usa data/
                             # admin-glossary.ts como fuente de definiciones.
                             # SortableTh.vue — `<th>` clickeable con flecha
                             # asc/desc/none, accesible (aria-sort + Enter/
                             # Space). Pareja con `useSortableList`.
                             # SatelliteThumb.client.vue — Leaflet wrapper
                             # con basemap Esri World Imagery + render del
                             # polígono encima. Usado en /admin/coastal-
                             # intrusions para preview satelital del footprint.
                             # analytics/DataMiningBuilder.vue — modelado data
                             # mining (subcomponente de /admin/analytics)
  composables/
    useFormatters.ts        # es-MX locale + maps de tipos a etiquetas (es), badge classes
    useScrollReveal.ts      # IntersectionObserver para .reveal/.is-visible
    useMapConfig.ts         # Default center MX (21,-94 z=5), 3 basemaps (Imagery/Ocean/Streets),
                            # labels overlay Esri Reference, marker style por estado
    useApi.ts               # $fetch wrapper con baseURL cercu-backend + token Bearer.
                            # Auto-logout en 401/403 (limpia token + redirect a /admin/login).
                            # Acepta `opts.observatory` para que un superadmin consulte
                            # endpoints de humedales / techos-verdes desde este panel
    useCountUp.ts           # Animación count-up genérica (RAF + easeOutExpo + reduced-motion).
                            # Usada por <CommonCountUp> en hero, KPIs y cards de alertas
    useBackendSync.ts       # Orquesta fetch de reefs/conflicts/contributors/observations/layers
                            # desde cercu-backend con fallback silencioso al mock
    useCmsContent.ts        # Helper de páginas públicas para el CMS. `useCmsContent(slug)`
                            # dispara `fetchPage` en mount + devuelve `list(key)` y
                            # `one(key)` ya bound al pageSlug. Incluye
                            # `interpolateCmsText(text, { var })` para placeholders {count}
    usePaginatedList.ts     # Helper genérico para tablas admin: dado un Ref<T[]>
                            # filtrado, devuelve `paginated`, `currentPage`, `totalPages`,
                            # `perPage`. Resetea a página 1 si los filtros recortan
                            # el dataset por debajo del rango actual
    useSortableList.ts      # Sort genérico para tablas admin con coerción inteligente
                            # (números, ISO dates, booleanos, locale es-MX). Soporta paths
                            # anidados ("contributor.displayName"). Cycle: none → asc →
                            # desc en cada click sobre la misma columna
    useTracking.ts          # Tracking anónimo de interacciones. Sesión persistente en
                            # localStorage (uuid v4), batching (lote 20 ó 5s) → POST
                            # /observatory/arrecifes/events. Click delegation captura
                            # cualquier elemento con `data-track="..."`. Flush en pagehide
                            # con sendBeacon. Sin PII; el backend hashea la IP
    useAnalyticsMath.ts     # Estadística pura JS: mean/median/std/percentile/describe,
                            # correlation, correlationMatrix (Pearson NxN), linearRegression
                            # con R²+predict, zScores+flagAnomalies, kmeans (k-means++,
                            # restarts), histogram, frequency, haversineKm,
                            # solarIrradiationProxy(lat) — proxy climatológico anual cuando
                            # NASA POWER aún no se ha cacheado para el arrecife
  data/
    reefs.ts                # 12 arrecifes mexicanos (Caribe + GoM + Pacífico). reefSummary
    layers.ts               # 13 capas abiertas mock (NOAA CRW, NASA MODIS/PACE, ESA Sentinel-2,
                            # GEBCO, CONABIO ANP+coral, CONANP, GFW, NOAA SaWS, INEGI). En prod
                            # se sobrescriben con `ObsLayer` del backend vía useBackendSync
    contributors.ts         # 8 colaboradores con tiers (bronze→coral) + tierConfig (mock).
                            # Las escalas ahora viven en `ObsTier` del backend
    observations.ts         # 6 aportes en distintos estados (validated/in_review/pending)
    conflicts.ts            # 6 casos socioambientales (Tren Maya, cruceros, FONATUR, etc.)
    bleaching-alerts.ts     # Snapshot NOAA CRW por reefId (DHW, SST, anomaly, level)
    admin-glossary.ts       # Diccionario centralizado `GLOSSARY` con 35+ definiciones cortas
                            # de términos técnicos del admin (snapshot, DHW, CHI, ZOFEMAT, NDBI,
                            # tier, slug, prospect, WMS, etc.) en español accesible. Cada entrada
                            # ≤180 chars. Lo consume `<AdminInfoTooltip>` para mostrar la def.
    cms-defaults.ts         # Catálogo CMS: `cmsDefaults[pageSlug][sectionKey] = items[]`
                            # con todo el copy editorial (home/about/contribute/footer/heros)
                            # como fallback cuando el backend no responde.
                            # `cmsPageCatalog` describe páginas/secciones para el editor admin
                            # (label, help, ícono lucide). `cmsFieldLabels` y
                            # `cmsLongTextFields` controlan el rendering del form
    kpis.ts                 # KPIs computados (incluyen `rawValue: number` para count-up)
  deploy/
    nginx.conf              # server block SSL + redirect 80→443 (arrecifes.cercu.com.mx)
    ecosystem.config.cjs    # PM2 app arrecifes :3007 con env vars de producción
    DEPLOY.md               # guía paso a paso (rsync, build, PM2, certbot, CORS)
  layouts/
    default.vue             # AppHeader + slot + AppFooter
    admin.vue               # sidebar colapsable + badge de rol + logout
  middleware/
    redirects.global.ts     # Legacy aliases (/map → /livemap, /reefs → /inventory, etc.)
    admin.ts                # protege /admin/* + mapeo ruta → permiso
  pages/
    index.vue               # Home: hero océano + reef-card stack flotante + KPIs bento +
                            # 3 features (cards centradas) + alertas live + top contributors + CTA.
                            # Hero stats e indicadores numéricos animan con <CommonCountUp> al cargar.
                            # Todo el copy editorial (hero, features, sectionTitle, alerts,
                            # contributorsTeaser, cta) se lee del CMS vía `useCmsContent('home')`
    livemap.vue             # Mapa Google-Earth-style: basemap switcher (Satélite/Batimetría/Mapa
                            # + Globo dinámico earth.nullschool con iframe + selectores de capa,
                            # proyección y vista), buscador con flyTo, leyenda, panel WMS con
                            # badges Live/Catálogo
    inventory/index.vue     # Cards 12 arrecifes + filtros + sort + drawer detalle. Hero CMS
    atlas/index.vue         # Atlas EJAtlas-style: drivers vs resistance + drawer detalle. Hero CMS
    data-sources/index.vue  # Catálogo de capas con filtros + atribuciones + descargas. Hero CMS
    contributors/index.vue  # Tier ladder + filtros + leaderboard + CTA. Hero, modesIntro,
                            # networkCallout y cta vienen del CMS
    contribute/index.vue    # Form multi-tipo (foto/dron/satelital/transecto/conflicto) +
                            # validación → cola de revisión. Hero, sidebar (3 cards) y notice CMS
    observations/index.vue  # Lista de aportes con estados + tipo + crédito + calidad. Hero CMS
    noticias/index.vue      # Listado editorial. Hero (eyebrow/title/subtitle) CMS
    about/index.vue         # Misión, fuentes, sistema de reputación, validación, licencias.
                            # 8 secciones (hero/mission/inspirations/sources/reputationIntro/
                            # validation/licenses/contact) leídas del CMS; tabla de tiers viene
                            # del store de tiers (editable en /admin/tiers)
    admin/                  # CRUD admin: reefs, observations (con edit + review), conflicts
                            # (con geometry GeoJSON), contributors, tiers, layers (upload),
                            # alerts (NOAA CRW manual), coastal-intrusions (detector OSM
                            # + creación manual), contenido (CMS), news, usuarios.
                            # `analytics` integra interacciones + descriptivo + inferencial
                            # + modelado + histórico (snapshots time-series).
                            # Layout `admin.vue`, middleware `admin`
  stores/
    reefs.ts                # publicReefs (filtra visible/archived) + filtros + setReefs +
                            # localStorage overrides (obs-arrecifes-reef-overrides)
    layers.ts               # toggleLayer, filtros por categoría/proveedor
    observations.ts         # validated/pending/filtered + submit() (citizen submission)
    contributors.ts         # leaderboard, filtros por role/tier
    conflicts.ts            # publicConflicts + filtros intensidad/estado/amenaza
    cms.ts                  # CMS sections cache + helpers `getSection`, `getOne`, `setSection`,
                            # `fetchPage` (1 request → todas las secciones), `invalidatePage`.
                            # Fallback automático a `cmsDefaults` cuando la red falla.
                            # Lo consume `useCmsContent` y el editor `/admin/contenido/[pageSlug]`
  types/
    index.ts                # Reef, DataLayer (+ LayerKind, file fields), Contributor, Observation,
                            # SocioEnvironmentalConflict (+ geometry GeoJSON), BleachingAlert,
                            # AdminUser, Kpi (+ rawValue numérico), GeoJsonGeometry
  error.vue                 # 404 / error page con CTA a home y mapa
  app.vue                   # NuxtLayout + NuxtPage
```

## Data Architecture

### Flow

```
Fuentes externas (NASA / NOAA / ESA / CONABIO / aportes red)
                       ↓
              [data/*.ts]   (fallback / mock cuando backend offline)
                       ↓
              [Pinia stores]
                       ↓
        [public pages] onMounted → cercu-backend
              GET /observatory/arrecifes/{resource}
                       ↓
              [Components]  search, filter, visualize
```

### Public pages → backend data loading (✅ implementado)

Sync orquestado por `plugins/backend-sync.client.ts` al iniciar la app vía
`composables/useBackendSync.ts`. Cada fetcher cae silenciosamente al mock si el endpoint
no responde:

| Recurso | Endpoint público | Store afectado |
|---------|------------------|----------------|
| Arrecifes | `GET /observatory/arrecifes/reefs?limit=100` | `useReefsStore().setReefs()` |
| Conflictos | `GET /observatory/arrecifes/conflicts?limit=100` | `useConflictsStore().conflicts` |
| Comunidad | `GET /observatory/arrecifes/contributors?limit=100` | `useContributorsStore().contributors` |
| Observaciones | `GET /observatory/arrecifes/observations?limit=100` | `useObservationsStore().observations` |
| Capas | `GET /observatory/arrecifes/layers?limit=200` | `useLayersStore().setLayers()` (mapea `slug → id`) |
| Alertas blanqueamiento | `GET /observatory/arrecifes/alerts/bleaching?latestPerReef=true` | `(pending)` |
| Escalas (tiers) | `GET /observatory/arrecifes/tiers` | `(pending — sin store dedicado aún)` |

### Environment Variables

- `NUXT_PUBLIC_DATA_MODE`: `mock` (default) — fuente de datos, mock como fallback
- `NUXT_PUBLIC_API_BASE_URL`: cercu-backend API URL (default: `http://localhost:3003/api/v1`)
- `NUXT_PUBLIC_NASA_CMR_URL`: NASA CMR search endpoint (`https://cmr.earthdata.nasa.gov/search`)
- `NUXT_PUBLIC_NOAA_CRW_URL`: NOAA CRW data root (`https://coralreefwatch.noaa.gov/data`)
- `NUXT_PUBLIC_CONABIO_WMS_URL`: CONABIO geoportal WMS (`http://geoportal.conabio.gob.mx/geoserver/wms`)

## Key Types

```typescript
type CoastalState = 'Quintana Roo' | 'Yucatán' | ... // 17 estados costeros mexicanos
type Ocean = 'caribbean' | 'gulf_of_mexico' | 'pacific'

type ReefBenthicClass = 'coral_algae' | 'rock' | 'rubble' | 'sand' | 'seagrass' | 'microalgae'
type ReefGeomorphicClass = 'reef_crest' | 'reef_slope' | 'reef_flat' | 'lagoon' | 'back_reef' | 'fringing' | 'patch_reef'
type ReefStatus = 'healthy' | 'watch' | 'warning' | 'alert' | 'bleaching' | 'mortality'
type ProtectionStatus = 'anp_federal' | 'anp_state' | 'ramsar' | 'unesco' | 'unprotected'

interface Reef {
  id: number; name: string; state: CoastalState; ocean: Ocean; region: string
  benthicClasses: ReefBenthicClass[]; geomorphicClasses: ReefGeomorphicClass[]
  area: number                       // hectáreas
  depthRange: [number, number]       // metros
  protection: ProtectionStatus; status: ReefStatus
  liveCoralCover?: number            // %
  bleachingAlert?: BleachingAlertLevel
  speciesRichness?: number; threats: ThreatType[]; observations: number
  lat: number; lng: number; description: string
  hero?: string                      // imagen principal (cards / livemap popup)
  gallery?: string[]                 // hasta 3 imágenes adicionales (drawer detalle)
  imageCredit?: string
  visible?: boolean; archived?: boolean
  climateData?: ReefClimateData | null   // NASA POWER cacheada (null si no refrescado)
  climateFetchedAt?: string | null
}

interface ReefClimateData {
  source: 'nasa_power'; lat: number; lng: number
  solarIrradiation: number | null    // kWh/m²/día (media anual)
  airTemp: number | null             // °C
  precipitation: number | null       // mm/día
  windSpeed: number | null           // m/s
  relativeHumidity: number | null    // %
  monthly: { solarIrradiation: number[]; airTemp: number[]; precipitation: number[] } | null
}

type BleachingAlertLevel = 'no_stress' | 'watch' | 'warning' | 'alert_1' | 'alert_2'
interface BleachingAlert { reefId; level; dhw; sst; sstAnomaly; observedAt; source }

type DataProvider = 'nasa' | 'noaa' | 'esa_copernicus' | 'usgs' | 'conabio' | 'conanp' |
                    'inegi' | 'allen_coral_atlas' | 'global_fishing_watch'
type LayerCategory = 'thermal_stress' | 'bathymetry' | 'benthic_habitat' | 'water_quality' |
                     'protected_areas' | 'land_use' | 'fishing_pressure' | 'community_observations'
type LayerFormat = 'wms' | 'wmts' | 'geotiff' | 'shapefile' | 'geojson' | 'kml' | 'csv' | 'cog'

type LayerKind = 'external_url' | 'uploaded_file'

interface DataLayer {
  id: string                                       // slug estable (frontend)
  numericId?: number                               // ObsLayer.id del backend
  title: string; description: string
  kind?: LayerKind                                 // default 'external_url'
  provider: DataProvider; providerLabel: string; category: LayerCategory; format: LayerFormat
  resolution?: string; cadence?: string; coverage: 'global'|'regional'|'national'
  license: string; attribution: string             // ATRIBUCIÓN OBLIGATORIA
  sourceUrl: string; downloadUrl?: string; previewUrl?: string
  lastUpdated?: string; active: boolean
  // ── Live overlay opcional ── si trae wmsUrl/wmsLayerName o tileUrlPattern,
  // se renderiza sobre el mapa al estar active=true. Si no, sólo catálogo.
  wmsUrl?: string; wmsLayerName?: string
  tileUrlPattern?: string
  overlayOpacity?: number                          // 0-1, default 0.7
  // ── Archivo subido (sólo si kind = 'uploaded_file') ──
  fileName?: string; fileSize?: number; mimeType?: string
  visible?: boolean; archived?: boolean
}

// GeoJSON para conflictos con ubicación propia (en lugar de via reefIds[]).
type GeoJsonGeometryType = 'Point' | 'LineString' | 'Polygon' |
                           'MultiPoint' | 'MultiLineString' | 'MultiPolygon'
interface GeoJsonGeometry { type: GeoJsonGeometryType; coordinates: unknown }

// KPIs ahora incluyen rawValue numérico para animación count-up del componente
// <CommonCountUp>. `value` queda como string final (ej. "15k", "100%").
interface Kpi {
  label: string; value: string; rawValue: number
  decimals?: number; divisor?: number; unit?: string
  color: string; delta?: string; icon?: string; to?: string
}

type ObservationType = 'satellite_image' | 'drone_flight' | 'underwater_photo' |
                       'transect_survey' | 'water_sample' | 'community_report' |
                       'socioenvironmental_conflict'
type ObservationStatus = 'pending' | 'in_review' | 'validated' | 'rejected' | 'needs_more_info'

interface Observation {
  id; reefId?; type; title; description
  contributorId; capturedAt; submittedAt; lat; lng
  attachments: ObservationAttachment[]; tags: string[]
  status: ObservationStatus; reviewerId?; reviewerNotes?; validatedAt?
  qualityScore?: number              // 0-100, asignado por revisor
  visible?: boolean; archived?: boolean
}

type ContributorTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'coral'
type ContributorRole = 'citizen' | 'researcher' | 'student' | 'fisher' | 'diver' |
                       'tour_operator' | 'institution' | 'ngo' | 'government'

interface Contributor {
  id; displayName; handle; role; affiliation?; bio?; avatarUrl?; state?; joinedAt
  tier: ContributorTier; reputationScore: number
  validatedContributions; rejectedContributions; acceptanceRate; averageQuality
  consecutiveMonthsActive; badges: ContributorBadge[]
  publicProfile: boolean; verified: boolean
}

type ConflictIntensity = 'low' | 'medium' | 'high' | 'critical'
type ConflictStatus = 'emerging' | 'ongoing' | 'mitigating' | 'resolved'

interface SocioEnvironmentalConflict {
  id; title; summary; fullStory; reefIds: number[]; state
  threats: ThreatType[]; intensity; status
  affectedCommunities: string[]; affectedSpecies?: string[]
  startedAt; updatedAt
  drivers: string[]                  // quién impulsa
  resistance: string[]               // quién resiste
  legalActions?: string[]; mediaUrls: string[]
  geometry?: GeoJsonGeometry | null  // ubicación propia opcional (Point/Polygon/...)
  contributorId?
  visible?; archived?
}

// Escala reputacional (Bronce → Coral). Editable desde /admin/tiers.
// `slug` es la clave estable referenciada por `Contributor.tier`.
interface Tier {
  id: number; slug: string                          // 'bronze' | 'silver' | 'gold' | 'platinum' | 'coral' | …
  label: string; description: string | null
  minScore: number; maxScore: number | null         // null = top tier (sin tope)
  color: string                                     // amber|slate|yellow|cyan|coral|eco|primary
  requirements: string | null; icon: string | null  // lucide icon name
  sortOrder: number; visible: boolean; archived: boolean
}
```

## Inventario de arrecifes (12 sitios, 1ª versión)

| # | Arrecife | Estado | Litoral | Tipo (geomorfía) | Superficie (ha) | Cobertura coral | Protección |
|---|----------|--------|---------|------------------|------------------|-----------------|------------|
| 1 | Puerto Morelos | Quintana Roo | Caribe | Franjeante + laguna | 9,067 | 18% | ANP federal |
| 2 | Cozumel | Quintana Roo | Caribe | Franjeante + pendiente | 11,988 | 15% | ANP federal |
| 3 | Banco Chinchorro | Quintana Roo | Caribe | Atolón | 144,360 | 24% | Reserva Biosfera |
| 4 | Sistema Arrecifal Veracruzano | Veracruz | Golfo | Platafórmico (28 arrecifes) | 65,516 | 12% | ANP federal |
| 5 | Xcalak | Quintana Roo | Caribe | Franjeante | 17,949 | 31% | ANP federal |
| 6 | Cabo Pulmo | BCS | Pacífico | Franjeante (único Pacífico oriental) | 7,111 | 39% | UNESCO |
| 7 | Isla Isabel | Nayarit | Pacífico | Franjeante (Pocillopora) | 194 | 22% | ANP federal |
| 8 | Revillagigedo | Colima | Pacífico | Reserva marina | 14,808,780 | 35% | UNESCO |
| 9 | Alacranes | Yucatán | Golfo | Atolón (único en GoM) | 33,396 | 26% | ANP federal |
| 10 | Huatulco | Oaxaca | Pacífico | Bahías protegidas | 11,891 | 19% | ANP federal |
| 11 | Isla Contoy | Quintana Roo | Caribe | Refugio aves | 5,126 | 21% | ANP federal |
| 12 | Espíritu Santo | BCS | Pacífico | Comunidades coralinas relictas | 48,655 | 28% | UNESCO |

## Capas abiertas integradas (13)

| ID | Proveedor | Categoría | Resolución | Cadencia | Licencia |
|----|-----------|-----------|------------|----------|----------|
| noaa-crw-dhw-5km | NOAA CRW | Estrés térmico | 5 km | Diaria | Public Domain |
| noaa-crw-bleaching-alert | NOAA CRW | Estrés térmico | 5 km | Diaria | Public Domain |
| nasa-modis-sst | NASA OB.DAAC | Estrés térmico | 4 km | Diaria | Public Domain |
| nasa-pace-chla | NASA PACE | Calidad agua | 1 km | Diaria | Public Domain |
| esa-sentinel2-l2a | ESA Copernicus | Hábitat bentónico | 10 m | 5 días | Copernicus Open |
| allen-coral-atlas-benthic | Allen Coral Atlas | Hábitat bentónico | 5 m | Estática v2.0 | CC BY 4.0 |
| gebco-bathymetry | GEBCO | Batimetría | ~450 m | Anual | CC BY 4.0 |
| conabio-anp-marinas | CONABIO | Áreas protegidas | — | — | CC BY 4.0 |
| conabio-arrecifes-coralinos | CONABIO | Hábitat bentónico | — | — | CC BY 4.0 |
| conanp-decretos | CONANP | Áreas protegidas | — | — | Datos Abiertos MX |
| gfw-fishing-effort | Global Fishing Watch | Presión pesquera | 0.01° | Diaria | CC BY-NC 4.0 |
| noaa-sargassum-watch | NOAA / USF | Calidad agua | 1 km | Semanal | Public Domain |
| inegi-uso-suelo-costero | INEGI | Uso suelo | 1:250,000 | Anual | Datos Abiertos MX |

**Atribución:** cada capa preserva su licencia y cita original (ver `data/layers.ts`,
campo `attribution`). Mostradas en `/data-sources` y disponibles para descarga directa al
proveedor.

### WMS overlays activos en `/livemap`

3 de las 13 capas tienen endpoint WMS público y se renderizan sobre el mapa al activar
el toggle. Las demás aparecen como **Catálogo** (sólo metadatos + link a fuente).

| Layer | wmsUrl | wmsLayerName | opacity |
|-------|--------|--------------|---------|
| `noaa-crw-bleaching-alert` | `coastwatch.pfeg.noaa.gov/erddap/wms/NOAA_DHW/request` | `NOAA_DHW:CRW_BAA_max_7d` | 0.65 |
| `gebco-bathymetry` | `wms.gebco.net/mapserv` | `GEBCO_LATEST` | 0.55 |
| `conabio-anp-marinas` | `geoportal.conabio.gob.mx/geoserver/wms` | `CONABIO:anpfedmay24gw` | 0.5 |

Los demás providers (NASA PACE, Sentinel-2, GFW, INEGI, Allen Coral Atlas) requieren
auth/API key — quedan como catálogo. Para añadir una capa nueva con render: agrega
`wmsUrl` + `wmsLayerName` al objeto en `data/layers.ts` y `MapPanel.client.vue` la
recogerá automáticamente vía `useLayersStore().activeLayers`.

### Imágenes y galería de arrecifes (✅ implementado)

Cada `Reef` tiene 1 `hero` (cards/livemap) + hasta 3 `gallery[]` (drawer detalle):
- **Carpeta pública:** `/public/images/reefs/{slug}.jpg` (12 fotos 1600px-wide
  Unsplash commercial-free, ~340 KB promedio).
- **Drawer `/inventory`:** sección "Galería" con 3 thumbs aspect-square, hover-zoom,
  click abre full size en pestaña nueva. Si `gallery` vacío, fallback a `[hero]`.
- **Editor admin `/admin/reefs`:** botón **Editar imágenes** por fila → modal con
  preview en vivo de hero + 3 inputs URL de galería + crédito. PATCH `/admin/reefs/:id`
  con `{ hero, imageCredit, gallery }`.
- **Backend:** `ObsReef.gallery` columna JSON nullable (auto-sync TypeORM crea sin
  migración manual). `arrecifes.seed.ts` siembra 3 URLs Unsplash por arrecife vía
  `GALLERIES: Record<id, string[]>`.

## Climatología NASA POWER (✅ implementado)

Cada `Reef` cachea una climatología anual (medias) obtenida de
[NASA POWER](https://power.larc.nasa.gov) — endpoint público, dominio público, sin
API key. Ver `Reef.climateData` (interfaz `ReefClimateData`):

| Campo | Variable POWER | Unidad |
|-------|----------------|--------|
| `solarIrradiation` | `ALLSKY_SFC_SW_DWN` | kWh/m²/día |
| `airTemp` | `T2M` | °C |
| `precipitation` | `PRECTOTCORR` | mm/día |
| `windSpeed` | `WS10M` | m/s |
| `relativeHumidity` | `RH2M` | % |
| `monthly.{...}` | mismas vars | 12 valores ene→dic |

- **Refresh manual:** `POST /admin/reefs/refresh-climate` corre las 12 llamadas
  secuencialmente con 350 ms entre requests (rate-limit blando NASA ~10 req/s).
  Disponible como botón **"Actualizar climatología"** en `/admin/analytics` →
  Inferencial. Idempotente: re-ejecutar sobreescribe `climateData` y
  `climateFetchedAt`. La climatología cambia poco así que basta refrescar
  esporádicamente (1×/año o tras cambios mayores).
- **Fallback:** si un arrecife aún no tiene `climateData`, el frontend usa
  `useAnalyticsMath().solarIrradiationProxy(lat)` (estimación lineal por latitud
  para 0°–35°). El banner de la página muestra `NASA POWER: X / 12` para que sea
  visible cuántos arrecifes están con datos reales vs proxy.
- **Validación**: el proxy y NASA POWER difieren por nubosidad. P.ej. Veracruz
  (lat 19.2°): proxy ≈ 6.0, POWER = 4.88 kWh/m²/d — la diferencia captura la
  nubosidad del Golfo que la latitud sola no ve.

## Tracking de interacciones (✅ implementado)

Tracking anónimo y agregado para alimentar `/admin/analytics` (pestaña Interacciones).
Privado por diseño: nada de PII; el backend hashea la IP con SHA-256 y un salt local.

- **Plugin:** `plugins/tracking.client.ts` llama `initTracking()` una sola vez por
  SPA. Hace pageview en cada navegación (`router.afterEach`) + click delegation
  para cualquier elemento con `data-track="<label>"` (también lee `data-track-group`
  y `data-track-value` como metadata). Flush en `pagehide`/`beforeunload` con
  `navigator.sendBeacon` para no perder eventos al cerrar.
- **Composable:** `composables/useTracking.ts` expone `trackPageview`,
  `trackEvent(type, target, metadata?)`, `flushNow`, `getSessionId`. Sesión
  persistida en `localStorage` (`arrecifes-session-id`, uuid v4). Batching: lote
  de 20 eventos o 5 s, lo que llegue primero.
- **Endpoint:** `POST /observatory/arrecifes/events` (público, rate-limit 60
  lotes/min/IP en prod, dev sin límite). Body: `{ events: [{ type, path?, target?,
  sessionId, metadata?, referrer? }, …] }`.
- **Convención `data-track`:** marca CTAs y elementos clave del UI público con
  `data-track="cta-contribuir"` para que aparezcan en el ranking de la pestaña
  Interacciones (`Top elementos clickeados`). Sin marcar = no se cuenta.
- **Multi-tenant:** los 3 observatorios (arrecifes, humedales, techos-verdes)
  comparten el mismo plugin/composable; cada uno postea con su propio observatorio
  en la URL. Un superadmin puede consultar el resumen de cualquiera vía el selector
  en `/admin/analytics`.

## Modos de participación (red de colaboradores)

**No es un ranking jerárquico.** El observatorio funciona como una red horizontal
con cinco maneras distintas pero igual de válidas de aportar al monitoreo. El
sistema de puntos (`reputationScore`) sigue existiendo internamente para asignar
modo a cada colaborador, pero ya **no se muestra como meta visible** en `/contributors`
— ahí cada modo se presenta como un foco de participación, no como un nivel a alcanzar.

| Slug (BD) | Modo de participar | Quién aporta así |
|-----------|--------------------|------------------|
| `bronze` | Curiosidad ciudadana | Personas con interés en el mar, sin formación técnica formal — el primer ojo |
| `silver` | Conocimiento del mar | Pescadoras, buzos, comunidades costeras — saber empírico de la costa |
| `gold` | Trabajo en agua | Profesionales de campo: transectos, dron, muestreos |
| `platinum` | Investigación formal | Academia (ICML-UNAM, CINVESTAV), peer-review, series satelitales |
| `coral` | Síntesis y curaduría | Equipo del observatorio, CONANP/SEMARNAT, validación cruzada |

Cada card en `/contributors` muestra: el modo, **quién aporta así**, **aportes
típicos** (3 ejemplos concretos) y **conecta con** (cómo se complementa con los
otros modos). Sin "Nivel N", sin chevrons de progresión, sin "Para llegar".

Los slugs (`bronze/silver/gold/platinum/coral`) se mantienen estables por
compatibilidad con `Contributor.tier`; las **etiquetas visibles** y descripciones
se editan desde `/admin/tiers` para reforzar el reframe de modos sin migrar datos.

### Sistema de puntos (interno)

Las escalas viven en la tabla `obs_tiers` con `minScore`/`maxScore`. El backend
sigue calculando puntos con la fórmula del placeholder, pero los puntos sólo se
usan para asignar modo, no como leaderboard público:

| Rango interno | Umbral | Requisitos típicos |
|---------------|--------|--------------------|
| bronze | 0–199 pts | Primer aporte validado |
| silver | 200–499 pts | 30+ aportes validados |
| gold | 500–699 pts | 60+ aportes, calidad ≥75%, 3+ meses activo |
| platinum | 700–999 pts | 90+ aportes, calidad ≥85%, 6+ meses activo |
| coral | 1000+ pts | Identidad y trayectoria verificadas |

`Contributor.tier` referencia el `slug` de `ObsTier`. La UI admin permite editar
etiqueta, descripción, umbrales y requisitos pero deshabilita el slug tras crear.
El backend bloquea el borrado físico si hay `Contributor` usando esa escala
(debe archivarse, `archived=true`).

### Validación de aportes

```
Aporte (web/api) → cola PENDING
                       ↓
       Reviewer (perm: review_submissions)
       evalúa: ubicación, metadata, calidad técnica
                       ↓
              Asigna qualityScore 0-100
                       ↓
       VALIDATED → suma puntos al autor; público con crédito
       REJECTED → notas; el autor puede corregir y reenviar
       NEEDS_MORE_INFO → solicitud de más info
```

### Reputación: cómo se calcula (placeholder, ajustable)

```
reputationScore = (validatedContributions * 5)
                + (averageQuality * 0.5)
                + (consecutiveMonthsActive * 10)
                + (verified ? 50 : 0)
                + sum(badges)
```

## Design System

### Modo oscuro

Activado vía `tailwind.config.ts` con `darkMode: 'class'` + `@nuxtjs/color-mode`
(classSuffix vacío añade `class="dark"` automáticamente al `<html>` cuando el
usuario alterna). Tokens definidos como CSS custom properties en
`assets/css/main.css`:

```
:root      → --c-bg #F4F8FA · --c-surface #FFFFFF · --c-ink #0F172A · ...
.dark      → --c-bg #0A1620 · --c-surface #14252F · --c-ink #E6F0F5 · ...
```

Identidad "modo bajo el agua nocturno": fondo abismal teal-oscuro preservando
los acentos primary/coral/eco. Contraste WCAG AA verificado en texto principal.

Las clases base del sistema (`.card`, `.kpi-card`, `.input`, `.btn-outline`,
`.btn-ghost`, `.panel`) ya leen los tokens, así que cambian automáticamente.
Para utilidades tailwind crudas (`bg-white`, `bg-gray-50`, `text-ink`,
`border-gray-{100,200,300}`, `text-gray-{500,600,700}`, `text-slate-custom`,
`divide-gray-*`) hay overrides en `@layer utilities` con selector compuesto
`.dark .bg-white { ... }` — la inmensa mayoría de pages se adaptan sin tocar
nada. Para piezas custom usa `dark:` clase como siempre.

**Toggle visible**: `<CommonColorModeToggle />` (sun/moon Lucide). Variantes:
- `variant="icon"` (default) — botón circular compacto, usado en header público
  desktop y antes del menú hamburger en mobile.
- `variant="menu"` — item con texto "Modo oscuro/claro", usado en mobile drawer
  del header público y en el sidebar admin.

### Internacionalización (es/en)

`@nuxtjs/i18n` v8 configurado con:
- `strategy: 'no_prefix'` — sin `/en/...` en URL; preferencia en cookie
  `arrecifes-i18n` + localStorage.
- `defaultLocale: 'es'` (es-MX), `en` (en-US) disponible.
- `langDir: 'i18n/locales/'` con `es.json` y `en.json`.

**Toggle visible**: `<CommonLocaleSwitcher />` con misma API
(`variant="icon"` | `"menu"`). Click cicla entre locales disponibles.

**Cobertura actual**: strings de "marco" están extraídas a `t('key')` —
header nav (5+CTA), site title/subtitle, sidebar admin (10 items + acciones),
common (botones, idioma, modo), admin KPIs/manual sections, hero home.
**El contenido profundo de páginas internas sigue hard-coded en español**
(filtros, formularios, modales, copy de páginas como `/inventory`,
`/atlas`, etc.). Para extender: añade la key en `i18n/locales/{es,en}.json`
y reemplaza el string por `{{ $t('key') }}` (template) o `t('key')` (script
con `const { t } = useI18n()`).

**Convención de keys**: jerarquía por scope (`site.title`, `nav.atlas`,
`admin.dashboard`, `admin.kpis.publicReefs`, `manual.sections.satellites`).
Los strings dentro de un componente específico pueden vivir bajo
`pages.{nombre}.*` o `components.{nombre}.*` cuando se extraigan.

### Color palette

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#0E7490` | Teal océano profundo (Allen Coral Atlas-inspired) |
| `primary-light` | `#0891B2` | Hover |
| `primary-dark` | `#0B566D` | Active/pressed |
| `secondary` | `#06B6D4` | Aguas someras / lagoon turquoise |
| `coral` | `#FF7A66` | Acento de identidad (coral vivo) |
| `coral-light` | `#FFA193` | Hover |
| `eco` | `#10B981` | Vegetación / saludable |
| `accent` | `#F59E0B` | Advertencia / amber |
| `alert` | `#DC2626` | Crítico (DHW > 8) |
| `surface` | `#F4F8FA` | Fondo de página |
| `ink` | `#0F172A` | Texto primario |

### Typography

- **Display (headings):** Space Grotesk 500-700
- **Body / UI:** Inter 300-800
- es-MX para todos los formateos numéricos/fecha

### Component classes

- **Cards:** `.card` (border + sombra suave) / `.card-interactive` (hover lift + tint primary) /
  `.card-flat` / `.card-glass` (backdrop-blur) / `.panel`
- **Buttons:** `.btn-primary` / `.btn-secondary` / `.btn-coral` / `.btn-eco` / `.btn-outline` /
  `.btn-ghost`. Tamaños `.btn-sm` / `.btn-lg`
- **Badges:** `.badge-primary` / `.badge-secondary` / `.badge-coral` / `.badge-eco` /
  `.badge-accent` / `.badge-alert` (`rounded-full` pill)
- **Forms:** `.form-group` / `.form-label` / `.form-hint` / `.input` / `.select` /
  `.checkbox` / `.input-icon-wrapper`
- **KPIs:** `.kpi-card`
- **Tables:** `.table-base` / `.table-container`
- **Layout:** `.container-wide` / `.container-narrow` / `.section-padding`
- **Tier badges premium** (gradient + inner highlight + sombra suave):
  - `.tier-bronze` (cobre cálido) · `.tier-silver` (acero pulido) · `.tier-gold` (oro)
  - `.tier-platinum` (cyan brand) · `.tier-coral` (coral brand, top tier)
- **Tier ring** (`.tier-ring-{X}`) — gradient pill alrededor del avatar en `ContributorCard`
- **Tier accent** (`.tier-accent-{X}`) — banda gradient de 1px en el borde superior de cada
  card que diferencia visualmente el rango sin romper la línea de diseño
- **Live indicator:** `.live-dot` (pulso coral 2s)

### Design philosophy (2026)

- **Border-first cards** — borde sutil, sombras mínimas
- **rounded-2xl** — cards/buttons/badges/inputs/cards
- **Color en interacción** — hover tinta el borde a `primary/15`
- **Pill badges** — `rounded-full` siempre
- **Hero Allen Coral Atlas-inspired** — `CommonHeroSection` (y home inline) con 6 capas
  apiladas (z-order de fondo a frente):
  1. Gradiente abismal `#02141C → #052731 → #08475A → #0E7490 → #0891B2` con elipse radial
     teal en la cresta superior.
  2. `.hero-bathymetry` — 3 `repeating-radial-gradient` desde orígenes 18%/82%, 82%/18% y
     50%/50% creando isobatas que se cruzan; drift 60s; `mix-blend-mode: screen`.
  3. `.hero-tile-grid` — grid 64×64 px enmascarado con elipse radial, evoca las celdas
     bentónicas 5 m del Allen Coral Atlas.
  4. `.hero-caustics` — luz superior (cyan + blanco) con `caustic-drift` 18s y `blur(2px)`.
  5. `.lava-orb` × 5 (3 cyan/teal + 2 coral/amber), `mix-blend-mode: screen`, `blur(36px)`,
     GPU-accelerated `translate3d`, opacity 0.6 (atenuados para que la batimetría respire).
  6. `.hero-vignette` — gradiente vertical inferior `rgba(2,20,28,0.6)` que enfoca al CTA.

  Home agrega `reef-stack` flotante (3 cards con `floatY` 6-8s, z-index sobre las capas
  de fondo).
- **Live indicator** — `.live-dot` coral con `livePulse` 2s para datos en vivo
- **Progressive disclosure** — CTAs revelan detalles en hover
- **Lazy loading** — `loading="lazy"` en imágenes
- **Focus-visible** — `focus-visible:ring-2` (no aparece en clicks)

## Animation System

### Easing

- **Smooth:** `cubic-bezier(0.22, 1, 0.36, 1)` — default
- **Bouncy:** `cubic-bezier(0.34, 1.56, 0.64, 1)` — entradas pop
- **Exit:** `cubic-bezier(0.4, 0, 1, 1)`

### Page transitions

`pageTransition: { name: 'page', mode: 'out-in' }` en `nuxt.config.ts`. Admin pages deben
poner `pageTransition: false` (caso pendiente para v2).

### Scroll reveal

```vue
<script setup>
const { revealRef } = useScrollReveal({ stagger: true })
</script>
<template>
  <div ref="revealRef" class="stagger-children">
    <div class="reveal">…</div>
    <div class="reveal">…</div>
  </div>
</template>
```

Variantes: `.reveal` (slide up + fade), `.reveal-left`, `.reveal-scale`, `.stagger-children` (60ms cascade hasta 8 hijos).

### CSS animation utilities

| Class | Animation |
|-------|-----------|
| `.animate-fade-in` | Opacity 0→1 |
| `.animate-slide-up` | translateY 24→0 + fade |
| `.animate-scale-in` | scale 0.9→1 + fade |
| `.animate-bounce-in` | bouncy entrance |
| `.animate-float` | translateY ±12px, 6s loop |
| `.animate-pulse-glow` | box-shadow pulse |
| `.animate-spin-smooth` | smooth rotation |
| `.animate-shimmer` | gradient shimmer |
| `.delay-100` … `.delay-700` | animation-delay utilities |

### Reduced motion

Todas las animaciones desactivadas con `@media (prefers-reduced-motion: reduce)`.

## Navigation

### Primary nav (5 items + CTA — Hick's law aplicada)

```
Mapa vivo | Arrecifes | Atlas | Datos | Comunidad | [Contribuir →]
```

- **Mapa vivo** (`/livemap`) — Leaflet full-screen estilo Google Earth: basemap
  switcher con 4 opciones (Satélite Esri World Imagery / Batimetría / Mapa OSM /
  **Globo dinámico** earth.nullschool en iframe) + labels overlay toggleable,
  buscador con `flyTo`, popups con hero image, halo pulsante en alertas críticas,
  panel de capas con render WMS real (badges `Live` / `Catálogo`).
  - **Globo dinámico** (`viewMode === 'globe'`): reemplaza el `MapPanel` Leaflet por
    un iframe a `earth.nullschool.net` con 3 selectores: capa (vientos / corrientes /
    SST / olas / presión MSL / agua precipitable / CAPE / aerosoles PM2.5), proyección
    (Globo 3D / equirectangular / Mercator / Winkel III / Patterson / azimutal) y vista
    (México / Caribe / Pacífico / Golfo / SAM / Global). URL reactiva via computed
    `nullschoolUrl`. Atribución a Cameron Beccario y link "Abrir en nueva pestaña" como
    fallback (algunos navegadores bloquean iframes cross-origin)
- **Arrecifes** (`/inventory`) — cards + filtros + sort + drawer detalle (antes "Inventario")
- **Atlas** (`/atlas`) — conflictos socioambientales (estilo EJAtlas)
- **Datos** (`/data-sources`) — catálogo de capas, atribuciones, descargas (antes "Capas y datos")
- **Comunidad** (`/contributors`) — tier ladder + leaderboard (antes "Colaboradores")
- **Contribuir** (`/contribute`) — CTA coral, formulario multi-tipo

Secundarias (footer + drawer móvil): **Observaciones** (`/observations`), **Sobre**
(`/about`). Removidas del nav primario: "Inicio" (logo enlaza a home).

**Logos institucionales:** `<img src="/images/logo-ciiemad.png">` + `<img src="/images/logo-ipn.svg">`
en el cluster derecho del header (md+) y centrados grandes en el footer (CIIEMAD circular
blanco, IPN invertido). Mismo patrón que `observatorio-humedales`.

### Redirects (`middleware/redirects.global.ts`)

```
/map        → /livemap
/reefs      → /inventory
/conflicts  → /atlas
/layers     → /data-sources
/people     → /contributors
/register   → /contribute
```

### Mobile-first header

- **Mobile (< lg):** Logo + hamburger only
- **Desktop (lg):** Logo + nav links + live indicator + CTA "Contribuir"
- Mobile drawer con icons por nav item + CTA al fondo

### Icons (nuxt-icon / Iconify)

`<Icon name="lucide:waves" size="20" />`. Lucide es el set primario.

## Key Patterns

### Client-only components

Leaflet y Chart.js deben renderizar client-side:
- Sufijo `.client.vue`
- Wrap con `<ClientOnly>` y `#fallback` slot
- Auto-import: `MapPanel.client.vue` → `<MapPanel />`

### Code conventions

- **Inglés** en identificadores, nombres de archivos, tipos, props, stores, composables
- **Arrow functions** preferidas (`const fn = () => {}`)
- **camelCase** para variables, funciones, props (excepto componentes y tipos: PascalCase)
- **Mobile-first** Tailwind (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)
- **es-MX** en todo el copy mostrado al usuario
- **NUNCA inline styles** — prohibido `style="..."` y `:style="..."` en templates.
  Si necesitas un estilo dinámico, usa una clase utility en `assets/css/main.css` (`@layer
  utilities`) o una CSS custom property en `<style>` scoped. Para HTML inyectado por
  librerías externas (Leaflet popups, etc.), define clases en un bloque `<style>`
  no-scoped del componente.
- **NUNCA `!important`** — incluye el prefijo `!` de Tailwind (`!bg-primary`, `!text-`).
  Para ganar especificidad sobre estilos inline o reglas externas, usa selectores
  anidados (`.leaflet-container .leaflet-control-zoom`), `:where()/:is()`, o reescribe
  con clases mutuamente excluyentes (ej. `:class="[isActive ? 'A' : 'B']"` en vez de
  `active-class="!A"`). Excepción aceptable: librería de terceros que pinta inline
  styles que **no** se pueden vencer con especificidad — en ese caso documenta el
  porqué en comentario.

### Number coercion (MySQL decimal → string)

TypeORM/MySQL devuelve columnas `decimal` (lat, lng, area, liveCoralCover,
acceptanceRate, averageQuality, dhw, sst…) como **strings**. Cualquier consumidor
que llame `.toFixed()`, comparaciones aritméticas o `.reduce` debe coercir con
`Number(value)` primero. `composables/useFormatters.ts` ya hace coerción defensiva
en `formatNumber`, `formatHectares`, `formatPercent`, `formatDepth` (devuelven `'—'`
si no es finito). Para nuevas vistas: usa esos helpers o envuelve con `Number()`
antes de operar.

### Stores (Pinia composable, con localStorage overrides)

```typescript
useReefsStore()           // publicReefs, filtered, search, filterState/Ocean/Status, setReefs, updateReef
useLayersStore()          // filtered, activeLayers, toggleLayer, setLayers
useObservationsStore()    // validated, pending, filtered, byReef, byContributor, submit
useContributorsStore()    // leaderboard, filtered, findById
useConflictsStore()       // publicConflicts, filtered, findById
```

**localStorage keys:**
- `obs-arrecifes-reef-overrides` — overrides de `visible/archived` por id

### Pagination

`CommonPaginationControls` (15 items default, oculto si totalPages <= 1):

```vue
<CommonPaginationControls
  v-model:current-page="currentPage"
  :total-pages="totalPages"
  :total-items="filtered.length"
  :per-page="perPage"
/>
```

### Visibility & archive

`Reef`, `SocioEnvironmentalConflict`, `Observation` soportan `visible` y `archived`.
- Public computeds (`publicReefs`, `publicConflicts`) excluyen `archived` y `!visible`
- Admin (futuro) muestra todo con toggles

## Backend (cercu-backend)

### Ubicación

`/Users/antonioortiz/Desktop/Antonio/cercu-backend`

### API base esperada

`http://localhost:3003/api/v1/observatory/arrecifes/...`

### Endpoints v1 (✅ implementado en `cercu-backend`)

**Módulo:** `src/modules/observatory/arrecifes/` (controller + service + routes + validation
+ `arrecifes.upload.ts` con multer para capas).
**Entidades:** `ObsReef`, `ObsConflict` (con `geometry: json` GeoJSON opcional),
`ObsContributor`, `ObsObservation`, `ObsBleachingAlert`, `ObsLayer`, `ObsTier`
en `src/entities/observatory/`. Auto-sync en dev; en prod corre la migración
explícita `1724000000000-AddLayersTiersAndConflictGeometry.ts` (idempotente
vía `SHOW TABLES/COLUMNS LIKE`).

⚠️ **Bug TypeORM resuelto:** combinar `@Column({ unique: true })` + `@Index()` en la
misma columna genera dos índices con el mismo nombre y revienta el `CREATE TABLE` con
`Duplicate key name`. `unique: true` ya crea el índice — basta con uno. La migración
explícita usa `UNIQUE INDEX` directamente en SQL para evitar el conflicto.

**Públicos** (sin auth, sólo `visible=true && archived=false`):

```
GET  /observatory/arrecifes/reefs?ocean=&state=&status=&search=
GET  /observatory/arrecifes/reefs/:id
GET  /observatory/arrecifes/reefs/metrics?days=N                # serie de tiempo (todos los reefs)
GET  /observatory/arrecifes/reefs/:id/metrics?days=N            # serie de tiempo de un solo reef
GET  /observatory/arrecifes/conflicts?intensity=&status=&state=
GET  /observatory/arrecifes/conflicts/:id
GET  /observatory/arrecifes/contributors?role=&tier=
GET  /observatory/arrecifes/contributors/:id
GET  /observatory/arrecifes/observations?reefId=&type=          # solo validated
GET  /observatory/arrecifes/observations/:id
POST /observatory/arrecifes/observations                        # ciudadano → pending
GET  /observatory/arrecifes/alerts/bleaching?latestPerReef=true
GET  /observatory/arrecifes/layers?provider=&category=&kind=    # capas activas
GET  /observatory/arrecifes/layers/:id                          # acepta id numérico o slug
GET  /observatory/arrecifes/layers/:id/download                 # archivo o redirect 302
GET  /observatory/arrecifes/tiers                               # escalas reputacionales
GET  /observatory/arrecifes/tiers/:id                           # acepta id o slug
GET  /observatory/arrecifes/cms/:pageSlug/:sectionKey           # devuelve TODAS las secciones de la
                                                                # página (sectionKey se ignora; basta
                                                                # pasar `_all` en el front).
POST /observatory/arrecifes/events                              # ingest tracking anónimo
                                                                # (lote ≤50 eventos, rate-limit 60/min/IP)
```

**Admin** (Bearer JWT — `ObservatoryAdmin` con `arrecifes` en `observatories[]`,
o `role=superadmin` que bypasea la validación de scope):

```
GET    /observatory/arrecifes/admin/summary                     # dashboard counts
GET    /observatory/arrecifes/admin/analytics/summary?days=N    # métricas de uso
                                                                # (totals, byType, series diaria,
                                                                # topPaths, topTargets) — N ∈ [1, 180]

# ── Reefs + climatología + snapshots históricos ──
CRUD   /observatory/arrecifes/admin/reefs[/:id]
POST   /observatory/arrecifes/admin/reefs/refresh-climate       # NASA POWER batch (12 reefs)
POST   /observatory/arrecifes/admin/reefs/:id/refresh-climate   # NASA POWER de un solo reef
POST   /observatory/arrecifes/admin/reefs/snapshot              # captura idempotente del día
DELETE /observatory/arrecifes/admin/reefs/snapshots/:id         # borra un snapshot puntual

# ── Conflictos socioambientales (Atlas) ──
CRUD   /observatory/arrecifes/admin/conflicts[/:id]             # body acepta `geometry`

# ── Comunidad ──
CRUD   /observatory/arrecifes/admin/contributors[/:id]
CRUD   /observatory/arrecifes/admin/tiers[/:id]                 # escalas + modos de participación

# ── Aportes ciudadanos ──
GET    /observatory/arrecifes/admin/observations[/:id]
POST   /observatory/arrecifes/admin/observations                # admin crea aporte directo
                                                                # (default status='validated', útil
                                                                # para backfill/migración)
POST   /observatory/arrecifes/admin/observations/:id/review     # body: {status, qualityScore?, reviewerNotes?}
PATCH  /observatory/arrecifes/admin/observations/:id            # edita metadatos sin cambiar estado
                                                                # (title, lat, lng, capturedAt, reefId,
                                                                # type, tags, attachments, visible/archived)
DELETE /observatory/arrecifes/admin/observations/:id

# ── Alertas de blanqueamiento ──
GET    /observatory/arrecifes/admin/alerts/bleaching            # listado completo (filtros: reefId, level)
POST   /observatory/arrecifes/admin/alerts/bleaching            # ingest manual (sincroniza reef.status)
PATCH  /observatory/arrecifes/admin/alerts/bleaching/:id        # edita campos; si cambia level,
                                                                # actualiza reef.bleachingAlert + status
DELETE /observatory/arrecifes/admin/alerts/bleaching/:id        # recalcula bleachingAlert con la
                                                                # alerta más reciente restante

# ── Capas de datos abiertas ──
CRUD   /observatory/arrecifes/admin/layers[/:id]
POST   /observatory/arrecifes/admin/layers/:id/upload           # multipart "file" (≤50 MB)

# ── Detector de invasión costera ──
GET    /observatory/arrecifes/admin/coastal-intrusions[?reefId=&status=]
GET    /observatory/arrecifes/admin/coastal-intrusions/:id
POST   /observatory/arrecifes/admin/coastal-intrusions          # creación manual (Point→buffer 25m
                                                                # ó Polygon/MultiPolygon, source='manual')
DELETE /observatory/arrecifes/admin/coastal-intrusions/:id      # limpieza manual / descartados
POST   /observatory/arrecifes/admin/coastal-intrusions/run[?reefId=]
                                                                # ASYNC: responde 202 con `{ jobId }`
                                                                # inmediato; el job corre en background
                                                                # (hasta 7 min por 12 reefs).
GET    /observatory/arrecifes/admin/coastal-intrusions/jobs     # lista jobs de detector recientes
GET    /observatory/arrecifes/admin/coastal-intrusions/jobs/:jobId
                                                                # estado del job: status (running|done|
                                                                # error), progress {current,total},
                                                                # perReef[], result, error.
                                                                # Frontend hace polling cada 3s
POST   /observatory/arrecifes/admin/coastal-intrusions/:id/verify
POST   /observatory/arrecifes/admin/coastal-intrusions/:id/dismiss
POST   /observatory/arrecifes/admin/coastal-intrusions/:id/escalate
POST   /observatory/arrecifes/admin/coastal-intrusions/:id/analyze-novelty
POST   /observatory/arrecifes/admin/coastal-intrusions/analyze-novelty-batch
POST   /observatory/arrecifes/admin/coastal-intrusions/:id/timeseries  # Fase 3 deep-dive

# ── CMS de copy editorial (compartido entre observatorios) ──
GET    /observatory/arrecifes/admin/cms/:pageSlug               # todas las secciones de la página
PUT    /observatory/arrecifes/admin/cms/:pageSlug/:sectionKey   # upsert; body { items: object[] }

# ── Usuarios admin ──
CRUD   /observatory/arrecifes/admin/usuarios[/:id]              # gestión de admins (multi-obs)

POST   /observatory/auth/login                                  # JWT 15min, refresh 7d
GET    /observatory/auth/me
```

**Storage de capas subidas:** `cercu-backend/uploads/layers/{uuid}.{ext}`, servido por
`app.use('/uploads', express.static(...))` y proxy nginx `/api/` → :3003. La descarga
pasa por `GET /layers/:id/download` que devuelve el archivo con `Content-Disposition:
attachment` o redirect 302 a la URL externa del proveedor (NOAA/CONABIO/...). Migrar a
S3/Spaces después cambia sólo `resolveLayerDownload()` en el service — la API no rompe.

### Sistema de revisión (review workflow)

`POST /admin/observations/:id/review` con `status: validated|rejected|needs_more_info|in_review`:
- `validated` ⇒ incrementa `contributor.validatedContributions` + actualiza `acceptanceRate` y
  `averageQuality` (rolling avg con `qualityScore`); incrementa `reef.observations` si hay `reefId`.
- `rejected` ⇒ incrementa `contributor.rejectedContributions` + recalcula `acceptanceRate`.
- Setea `reviewerId` (admin actual), `validatedAt`, `reviewerNotes`.

### Auth compartida (mismo usuario para los 3 observatorios)

`ObservatoryAdmin` (tabla `observatory_admins`) ya soporta multi-tenant vía
`observatories: simple-array`. El seed `seeds/observatory-admin.seed.ts` ahora añade
`arrecifes` al array — basta correr `npm run seed` en `cercu-backend` para que el admin
existente (`OBS_ADMIN_EMAIL`) pueda autenticarse contra `/admin/login` de arrecifes.

`middleware/observatory-auth.middleware.ts` valida que `req.params.observatory ===
'arrecifes'` esté incluido en `admin.observatories`. Las rutas arrecifes inyectan ese
param vía middleware `scope` antes de `auth`.

### Roles & permissions

```
superadmin    — todo
admin         — todo excepto manage_users
reviewer      — review_submissions, manage_observations
editor        — manage_cms (futuro), manage_conflicts
```

### Cron jobs (backend, futuros)

- **NOAA CRW poll:** `0 */6 * * *` — fetch DHW + bleaching alerts cada 6h
- **NOAA SaWS poll:** `0 12 * * 1` — sargazo semanal lunes
- **Sentinel-2 ingestion:** `0 3 * * *` — nuevos tiles para arrecifes mexicanos

## Deployment (✅ producción)

**Dominio:** `https://arrecifes.cercu.com.mx` (SSL vía Certbot, redirect 80→443)
**Servidor:** `srv1420267` (`72.62.200.124`) — mismo host que humedales/techos-verdes
**Repo:** `https://github.com/ORTIZJIMENEZANTONIO/observatorio-arrecifes`

### Mapa de puertos PM2

| Servicio | Puerto |
|----------|--------|
| cercu-frontend | 3001 |
| observatorio-techos-verdes | 3002 |
| cercu-backend | 3003 |
| observatorio-humedales | 3005 |
| **observatorio-arrecifes** | **3007** |

### Artefactos de despliegue (`deploy/`)

- `deploy/nginx.conf` — server block SSL + redirect 80→443 para
  `arrecifes.cercu.com.mx`. Proxy `/api/ → :3003` (backend) y `/ → :3007` (Nuxt).
- `deploy/ecosystem.config.cjs` — PM2 app `arrecifes` con env vars: `PORT=3007`,
  `NODE_ENV=production`, `NUXT_PUBLIC_API_BASE_URL=https://arrecifes.cercu.com.mx/api/v1`,
  `NUXT_PUBLIC_OBSERVATORY=arrecifes`, `NUXT_PUBLIC_DATA_MODE=api`.
- `deploy/DEPLOY.md` — guía paso a paso (rsync/git pull, build, PM2, certbot, seed).

### Update flow (después del deploy inicial)

```bash
# Local
cd cercu-backend && git push       # si tocaste backend
cd observatorio-arrecifes && git push

# Servidor — backend
ssh root@72.62.200.124
cd /var/www/cercu-backend && git pull && npm install && npm run build && pm2 restart cercu-backend

# Servidor — frontend
cd /var/www/cercu-frontend/arrecifes && git pull && npm install && npm run build && pm2 restart arrecifes
```

### CORS

`https://arrecifes.cercu.com.mx` está incluido en `CORS_ORIGIN` del `.env` de
`cercu-backend`. Sin esto el navegador rechaza por preflight.

## Sibling Projects

Este observatorio comparte patrones de diseño y stack con:
- `observatorio-humedales` — humedales artificiales CDMX (paleta teal/eco)
- `observatorio-techos-verdes` — techos verdes CDMX (paleta verde)

Diferencias clave:
- **Paleta:** océano-coral (`#0E7490` + `#FF7A66`) en lugar de teal o verde
- **Display font:** Space Grotesk (vs Inter solo)
- **Convención de código:** identificadores en inglés (los hermanos están en español)
- **Dominio:** arrecifes coralinos vs humedales/techos
- **Inspiraciones:** Allen Coral Atlas + EJAtlas
- **Datos:** stream casi-real-time vs estático
- **Red de colaboradores:** sistema de reputación marketplace-style
- **Atlas de conflictos:** sección dedicada al estilo EJAtlas

## Admin del observatorio (✅ CRUD completo + UI homogénea)

Todas las páginas siguen el **mismo patrón tabular**:
1. Header (h2 + contador + `Refrescar` + `Nuevo X`)
2. Botón **mobile-only** `Mostrar/Ocultar filtros` con badge de filtros activos
3. Filters card (search + dropdowns + contador resultados + `Limpiar filtros`).
   Siempre desplegado en `md+`; toggleable en mobile vía `filtersOpen` ref.
4. Tabla `table-base` con headers **clickeables como sorters** (cycle none →
   asc → desc), acciones `pencil` (edit) + `trash-2` (delete) por fila.
   Componente reusable `<AdminSortableTh sort-key="..." :current-key="sortKey"
   :current-dir="sortDir" @sort="toggleSort('...')">` muestra una flecha
   indicadora del estado actual del sort.
5. **Paginación** vía `<CommonPaginationControls>` debajo de la tabla
   (15-20 items por página por default, oculto si totalPages ≤ 1).
6. Modal único Create/Edit (`editingId === 0` crea, `>0` edita).
7. **Tooltips** en términos técnicos vía `<AdminInfoTooltip text="…">` —
   subraya el término con punteado discreto; hover en desktop, tap en mobile.

Pipeline reactivo estándar de cada tabla:
```
items.value (raw del API)
    ↓
filtered: computed (search + filtros UI)
    ↓
sorted: useSortableList(filtered, { defaultKey, defaultDir }).sorted
    ↓
paginated: usePaginatedList(sorted, { perPage }).paginated
    ↓
<tr v-for="x in paginated">
```

Páginas:
- `/admin/login` — email + password contra `POST /observatory/auth/login`
- `/admin` — **dashboard** con resumen consolidado de toda la plataforma:
  - 8 KPI cards principales con tooltips (arrecifes públicos, aportes
    pendientes, validados, conflictos, colaboradores, capas, alertas
    críticas, noticias publicadas). Cada card muestra "público / total" y
    tiene un `?` con la definición del concepto.
  - Banda de **Acciones rápidas**: capturar snapshot, refrescar
    climatología NASA POWER, ir a detector/cola de prospectos/contenido
    (con badge de prospects pendientes).
  - 8 cards de monitoreo en grid 2-cols: cola de revisión por status,
    arrecifes por estatus, alertas por nivel (con KPI "última observada
    hace…"), detector costero por status, red por modo, capas externas vs
    subidas, noticias + prospectos, snapshots + climatología, CMS.
  - El backend `getSummary` se extendió para devolver TODOS los counts
    paralelizados: `content/totals` (reefs/conflicts/contributors/layers/
    news/tiers/cmsSections/snapshots), `observationsByStatus`,
    `reefsByStatus`, `contributorsByTier`, `contributorsVerified`,
    `alertsByLevel`, `alertsCritical` (DHW≥4), `latestAlertAt`,
    `coastalIntrusions`, `layersByKind`, `newsProspects`, `snapshots`,
    `climate.reefsWithData`.
- `/admin/analytics` — **Monitoreo y análisis** (5 pestañas):
  - **Interacciones** — KPIs (pageviews, sesiones, clicks, envíos), evolución diaria
    line chart, tipo de evento doughnut, top rutas y top elementos `data-track`
  - **Descriptivo** — KPIs cobertura coral (media/mediana/IQR/rango), histograma de
    cobertura, doughnuts de estatus/litoral/protección, distribución de la red de
    colaboradores y aportes por estado
  - **Inferencial** — correlación cobertura↔DHW (KPI + scatter con regresión), tabla
    comparativa entre litorales, anomalías z-score, **matriz de correlaciones de
    Pearson 14×14** entre cobertura coral y variables externas (irradiación, temp aire,
    lluvia, viento, humedad, latitud, profundidad, log-área, aportes, aislamiento,
    SST/ΔSST/DHW), top-5 factores con mayor relación, scatters cobertura vs irradiación
    / latitud / aislamiento. Banner con cobertura `NASA POWER: X / 12` y botón
    **Actualizar climatología** que dispara el batch
  - **Modelado** — k-means de arrecifes (k configurable, normalización min-max),
    pronóstico de aportes con regresión lineal (slope + R²)
  - **Histórico** — serie de tiempo de los snapshots `obs_reef_metric_snapshots`.
    Botón "Capturar snapshot ahora" (idempotente por día), filtros arrecife +
    ventana (30/90/180/365/all), LineChart con doble eje Y (cobertura+CHI / DHW),
    tabla paginada (200 más recientes) con eliminar puntual. Comparte el ref
    `snapshots` con la pestaña Inferencial (Mann-Kendall / Theil-Sen) — un solo
    fetch al mount alimenta ambas vistas; los filtros del Histórico son
    in-memory para no re-pegarle al endpoint
  - Cada pestaña abre con un banner explicativo y cada gráfica lleva un párrafo
    debajo del título que responde "qué representa, cómo leerlo, qué decisión informa"
  - **Selector de observatorio** visible sólo para superadmin (Arrecifes / Humedales /
    Techos verdes) — la pestaña Interacciones consulta `/admin/analytics/summary` del
    observatorio elegido vía `apiFetch(..., { observatory })`. Las pestañas
    descriptivo/inferencial/modelado/histórico se deshabilitan si el observatorio
    elegido no es arrecifes (los stores locales sólo contienen ese dataset)
- `/admin/reefs` — CRUD completo + galería + filtros: Litoral, Estatus, Protección, Visibilidad
- `/admin/observations` — tabla cola de revisión + filtros: Estado, Tipo, Reef, Colaborador
- `/admin/conflicts` — CRUD completo + sección "Ubicación geográfica" (3 modos: sin
  geometría / Punto lat-lng / GeoJSON pegado, valida tipo y rangos) + filtros: Estado,
  Intensidad, Status, Visibilidad
- `/admin/contributors` — CRUD completo + filtros: Rol, Tier, Verificación, Perfil público
- `/admin/tiers` — CRUD de **escalas reputacionales** (Bronce → Coral). Slug bloqueado
  tras crear; eliminar bloqueado si hay colaboradores usando esa escala (archivar en su
  lugar). Permiso `manage_contributors`
- `/admin/layers` — CRUD de **capas de datos** + botón **upload** por fila (multer
  FormData, 50 MB, GeoJSON/Shapefile zip/GeoTIFF/KML/KMZ/CSV). Modal por secciones:
  identidad, origen+clasificación, licencia, URLs, render WMS/tile. Permiso `manage_layers`
- `/admin/usuarios` — CRUD completo de administradores. Modal por secciones (datos,
  rol y permisos, observatorios). Crear superadmin requiere ser superadmin. Borrado
  bloqueado por backend si es el único superadmin. Permiso `manage_users`
- `/admin/observations` — Cola de revisión + **edición de metadatos**.
  Modal "Revisar" (decisión validate/reject/needs_more_info + qualityScore +
  notas). Modal "Editar" (lápiz ámbar) corrige title/description/lat/lng/
  capturedAt/reefId/type/tags sin alterar el estado de revisión — útil para
  typos o coordenadas mal capturadas. Permiso `review_submissions`.
- `/admin/alerts` — **Alertas de blanqueamiento**. KPIs por nivel
  (no_stress/watch/warning/alert_1/alert_2), filtros por arrecife y nivel,
  tabla con DHW/SST/anomalía/observedAt. Modal "Nueva alerta" para captura
  manual cuando NOAA tarda o hay datos verificados de campo. Crear/editar
  sincroniza `reef.bleachingAlert` y `reef.status`; eliminar recalcula con
  la alerta más reciente restante. Link a producto NOAA si la alerta lleva
  `productUrl`. Permiso `manage_reefs`.
- `/admin/coastal-intrusions` — **Detector de invasión costera**. Tabla con
  KPIs por status (candidato/verificado/escalado/descartado). Botón **"Ejecutar
  detector"** (un reef o todos) dispara `POST /admin/coastal-intrusions/run`
  que **lanza un background job** (responde 202 con `jobId` inmediato) y el
  frontend hace polling cada 3s al `GET /coastal-intrusions/jobs/:jobId` para
  ver progreso (progress bar + per-reef en vivo). El pipeline corre OSM
  coastline → buffer 20m ZOFEMAT → intersect con edificios OSM. Tarda hasta 7
  min para los 12 reefs — la respuesta 202 evita el 502 Bad Gateway que daba
  el detector cuando era síncrono. Botón **"Nueva invasión"** abre modal de
  captura manual
  (Point lat/lng → buffer 25m, o GeoJSON Polygon/MultiPolygon pegado), útil
  cuando el edificio aún no está mapeado en OSM. Acciones por fila:
  **preview satelital** (modal con mini-mapa Esri World Imagery + footprint
  encima + 4 links externos: Google Maps satélite, Google Earth 3D, Sentinel-2
  EO Browser TRUE_COLOR de los últimos 90 días, OSM original — ver
  `<AdminSatelliteThumb>`), **verificar**, **descartar** (con notas),
  **escalar a conflicto** (crea `ObsConflict` con
  `threats=['coastal_development']`, geometry del footprint, oculto hasta que
  se complete narrativa), **eliminar** (limpia manuales o descartados). Cada
  celda linkea al objeto OSM original. Permiso `manage_conflicts`. Banner de
  limitaciones (OSM coverage desigual, buffer ≠ ZOFEMAT legal, detección ≠
  invasión probada) visible en el header.
  - **Fase 2 (NDBI Sentinel-2)**: columna **Novedad** 0–100 con código de
    color (verde = legacy / ámbar = parcial / rojo = reciente). Botón
    **"Analizar novedad (batch)"** corre `POST /admin/coastal-intrusions/
    analyze-novelty-batch` (procesa 30 candidatos sin score, throttle 600
    ms entre llamadas GEE). Botón ✨ por fila para análisis individual
    (`POST .../:id/analyze-novelty`). Filtro **"Sólo recientes (NDBI ≥ 60)"**
    para enfocar revisión en construcciones probablemente nuevas. Tooltip
    sobre el badge muestra `Δ NDBI = baseline → actual` y los rangos de
    fechas usados. Si GEE no está configurado en .env, el endpoint
    devuelve 503 con mensaje claro.
- `/admin/contenido` — **CMS de copy editorial**. Lista de 10 páginas
  editables (home, about, contribute, inventory, atlas, data-sources,
  contributors, noticias, observations, footer) — cada una linkea a
  `/admin/contenido/:pageSlug` con accordion por sección, edición in-place
  con auto-binding al shape del default, mover/añadir/eliminar bloques,
  "Restaurar default", chips de "Sin guardar". Cada save invalida la cache
  pública vía `useCmsStore().invalidatePage`. Permiso `manage_cms`.

Composables/stores:
- `stores/auth.ts` — login/logout, `loadFromStorage`, `hasPermission`, `isSuperadmin`.
  Token en `localStorage` bajo clave `arrecifes-admin-token`. `logout()` usa
  `replace: true`. **Login bypass para superadmin**: si `admin.role === 'superadmin'`
  no se exige que `arrecifes` esté en `admin.observatories[]` (acceso transversal a
  los 3 observatorios).
- `middleware/admin.ts` — protege `/admin/*` (excepto `/admin/login`) y mapea ruta →
  permiso (`manage_reefs`, `review_submissions`, etc.). Redirige con `replace: true` y
  agrega `?redirect=<ruta-original>` para que el login vuelva ahí.
- `composables/useApi.ts` — envía `Authorization: Bearer <token>`, prefija
  `/observatory/arrecifes`, y **detecta 401/403** del backend para auto-cerrar sesión:
  borra el token + redirige a `/admin/login?redirect=<ruta-actual>` con `replace: true`.
  Acepta `opts.observatory` (string) para sobrescribir el prefijo y consultar
  endpoints de humedales / techos-verdes — usado por `/admin/analytics` cuando un
  superadmin alterna observatorio.

Layout `layouts/admin.vue` con sidebar colapsable (mobile <lg) y badge de rol del usuario.
Cada página admin debe declarar `definePageMeta({ layout: 'admin', middleware: 'admin', pageTransition: false })`.

### Flujo de expiración de token (✅ no se puede usar "atrás" para volver)

1. `useApi` recibe 401 / 403 → limpia `localStorage` y `navigateTo('/admin/login', { replace: true })`.
2. Login lee `?redirect=/admin/X` (whitelist `/admin/*` para evitar open redirect) y
   vuelve ahí tras autenticar, también con `replace: true`.
3. `auth.logout()` y `middleware/admin` también usan `replace: true`. Resultado: la
   pantalla protegida nunca queda en el back-stack del navegador, así que la flecha
   "atrás" jamás regresa a una vista bloqueada.

## CMS — Contenido editorial editable (✅ implementado)

Plataforma multi-tenant para que un editor sin conocimiento técnico pueda cambiar
el copy visible del sitio público desde `/admin/contenido` sin tocar código.

### Arquitectura

```
data/cms-defaults.ts    ──┐  fallback síncrono (también es la verdad de origen)
                          ├──> stores/cms.ts (Pinia)
useCmsContent(page)  ─────┘    ├─ getSection / getOne (sync con fallback)
                               ├─ fetchPage (1 request → todas las secciones)
                               └─ invalidatePage (después de un save admin)
                                      │
   GET /observatory/arrecifes/cms/<page>/_all  ◄──┘
   PUT /observatory/arrecifes/admin/cms/<page>/<sectionKey>
```

- **Frontend público** (`pages/*.vue`, `components/common/AppFooter.vue`): cada
  página llama `useCmsContent('home')` (o el slug que toque) y consume `hero`,
  `cta`, `features` etc. con tipado explícito. Si la red falla o el backend
  aún no tiene esa sección, se muestra el default de `data/cms-defaults.ts`.
- **Frontend admin** (`pages/admin/contenido/`):
  - `index.vue` lista las 10 páginas registradas en `cmsPageCatalog`.
  - `[pageSlug].vue` carga `/admin/cms/:pageSlug` (versión más reciente),
    pinta un accordion por sección y deriva los campos editables del shape
    del primer item del default. Save por sección (no global). Auto-binding:
    si añades un campo nuevo en `cmsDefaults`, el editor lo recoge solo.
- **Backend** (`cercu-backend`): la entidad `ObsCmsSection` tiene columna
  `observatory` (multi-tenant) con índice `(observatory, pageSlug, sectionKey)`.
  Migración `1736000000000-AddObservatoryToCmsSections` la añade idempotente
  con backfill a `'humedales'` para no romper a los hermanos.

### Páginas y secciones registradas

| pageSlug | secciones (sectionKey) |
|----------|------------------------|
| `home` | hero · features · sectionTitle · alerts · contributorsTeaser · cta |
| `about` | hero · mission · inspirations · sources · reputationIntro · validation · licenses · contact |
| `contribute` | hero · sidebar · notice |
| `contributors` | hero · modesIntro · networkCallout · cta |
| `inventory` · `atlas` · `data-sources` · `noticias` · `observations` | hero |
| `footer` | brand · attribution · sources · quickLinks · institutional |

Las **secciones de un solo bloque** (hero, cta, brand…) llevan `items=[{...}]`
con un solo objeto. Las **secciones de lista** (features, inspirations, sources,
sidebar, validation, quickLinks…) llevan `items=[{...}, {...}, ...]` y permiten
mover/añadir/eliminar bloques desde el editor admin.

### Placeholders dinámicos

Para insertar números calculados en runtime sin perder editabilidad, los
defaults usan llaves `{var}`:

```ts
// inventory hero subtitle
'{count} arrecifes coralinos documentados…'
```

```vue
<!-- pages/inventory/index.vue -->
{{ interpolateCmsText(hero?.subtitle, { count: store.totalCount }) }}
```

### Etiquetas y rendering del form admin

`cmsFieldLabels` mapea claves a etiquetas amigables en español
(`titleLine2Highlight` → "Título — línea 2 (resaltado)") y `cmsLongTextFields`
declara qué campos van como `<textarea>`. Los campos cuyo nombre coincide con
`/^(href|to|primaryTo|secondaryTo|linkTo)$/` se renderizan como `type="url"`,
y `accent` cae a un `<select>` con tokens de paleta (`primary/coral/eco/...`).

### Permisos

Permiso `manage_cms` tanto para el editor (`/admin/contenido`) como para el
módulo de noticias (`/admin/news`). Se añadió en `middleware/admin.ts` y al
sidebar de `layouts/admin.vue`.

## Patrón de tabla admin reusable (✅ implementado)

Toda página admin con dataset listo-para-tabla sigue este flujo:

```ts
// 1. Datos crudos desde el API
const items = ref<T[]>([])

// 2. Filtros UI → computed reactivo
const filtered = computed(() => items.value.filter(...))

// 3. Sort por click en headers
const { sorted, sortKey, sortDir, toggleSort } = useSortableList(filtered, {
  defaultKey: 'name',         // opcional, sort inicial al mount
  defaultDir: 'asc',          // 'asc' por default
})

// 4. Paginación in-memory
const { paginated, currentPage, totalPages, perPage } = usePaginatedList(sorted, {
  perPage: 15,
})
```

```vue
<table class="table-base">
  <thead>
    <tr>
      <AdminSortableTh
        sort-key="name"
        :current-key="sortKey"
        :current-dir="sortDir"
        align="left"
        @sort="toggleSort('name')"
      >
        Arrecife
      </AdminSortableTh>
      <!-- Columnas no-sortables (acciones, agregadas) quedan como `<th>` simples -->
      <th class="text-right">Acciones</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="x in paginated" :key="x.id">…</tr>
  </tbody>
</table>

<CommonPaginationControls
  v-if="filtered.length > 0"
  v-model:current-page="currentPage"
  :total-pages="totalPages"
  :total-items="filtered.length"
  :per-page="perPage"
/>
```

### `useSortableList` — coerción inteligente

| Tipo de valor | Comparación |
|---|---|
| `number` | aritmética |
| `boolean` | false < true |
| string ISO date | `localeCompare` (es-MX, numeric) |
| string numérico (decimales TypeORM) | coerción a Number |
| string general | `localeCompare` (es-MX, numeric, base sensitivity) |
| `Date` | `getTime()` |
| `null/undefined/''` | siempre al final, independiente de la dirección |

Soporta paths anidados: `useSortableList(filtered).toggleSort('contributor.displayName')`.

Tablas con sort wireado: `/admin/reefs`, `/admin/observations`, `/admin/conflicts`,
`/admin/contributors`, `/admin/layers`, `/admin/alerts`, `/admin/coastal-intrusions`,
`/admin/news` (artículos), `/admin/usuarios`, `/admin/tiers`. Sort defaults sensatos
por defecto (más recientes primero, por reputación, por sortOrder, etc.).

### Tooltips de glosario

Componente `<AdminInfoTooltip text="…" [variant=inline|icon] [placement=top|bottom|right]>`.
- **inline** (default): subraya el slot con punteado discreto + icono `?` al lado.
- **icon**: sólo el icono (típico junto a un label de form, sin texto contenedor).

Las definiciones viven en `data/admin-glossary.ts` como `GLOSSARY` const. Cobertura
actual: snapshot, dhw, sst, sstAnomaly, chi, liveCoralCover, bleachingAlert, nasaPower,
noaaCrw, zofemat, ndbi, ndvi, noveltyScore, osm, gee, observation, qualityScore, tier,
reputationScore, modeTitle, audience, cms, pageSlug, sectionKey, cmsItem, placeholder,
layer, wms, wmts, layerKind, conflict, geometry, coastalIntrusion,
coastalIntrusionStatus, news, prospect, trackingEvent, slug, visible, archived.

Para añadir un término nuevo: edita `data/admin-glossary.ts` (≤180 chars en lenguaje
accesible, sin jargon innecesario) y úsalo donde aparezca en el admin.

## Roadmap (v2+)

- **Render de geometría de conflictos en mapa** — `/atlas` y `/livemap` deben pintar
  `conflict.geometry` con `L.geoJSON()` (Point/LineString/Polygon) cuando esté presente,
  cayendo a `reefIds[]` cuando no.
- **Panel de revisión enriquecido** — adjuntos de aportes (galería de imágenes/video +
  upload multipart) desde cola de observaciones (`PATCH /admin/observations/:id` ya
  acepta `attachments[]`, falta UI para subir archivos).
- **Cron de capas** — pull NOAA/NASA/ESA cada N horas vía cercu-backend
- **Migrar storage de capas a S3/Spaces** — actualmente disco local del VPS
  (`uploads/layers/`); cambiar sólo `resolveLayerDownload()` en `arrecifes.service.ts`
- **Drag-and-drop / draw-on-map para `geometry`** — sustituir los textarea GeoJSON
  pegado en `/admin/conflicts` y `/admin/coastal-intrusions` por un editor leaflet-draw
  inline
- **WebSocket** — push de alertas críticas de blanqueamiento al mapa vivo
- **Time slider** — comparativa multitemporal de cobertura coralina y SST (los
  snapshots ya están persistidos vía `/admin/snapshots`, falta el slider en el UI)
- **API pública** — endpoints `/public/v1/...` con rate limit y CC BY 4.0
- **Aplicación móvil** — companion para captura en campo con geofence (Sian Ka'an, etc.)
- **CMS para hermanos** — humedales y techos-verdes ya tienen el editor admin
  (`/admin/contenido`) pero sus pages públicas aún no leen del store; portar el
  patrón `useCmsContent` a `observatorio-humedales/pages/*.vue` cierra ese gap

## License

Apache 2.0 (código del observatorio). Cada capa de datos preserva su licencia original.

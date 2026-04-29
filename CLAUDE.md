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
- **Utilities:** VueUse, @nuxtjs/color-mode
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
                            # tile-grid + caustics + lava orbs), SectionTitle, PaginationControls
    contributors/           # ContributorCard (avatar, tier badge, métricas, badges)
    map/                    # MapPanel.client.vue (Leaflet + circleMarker por estado)
    charts/                 # (placeholder) chart.client.vue components
    home/                   # (placeholder) home-only sections
  composables/
    useFormatters.ts        # es-MX locale + maps de tipos a etiquetas (es), badge classes
    useScrollReveal.ts      # IntersectionObserver para .reveal/.is-visible
    useMapConfig.ts         # Default center MX (21,-94 z=5), Esri Ocean basemap, marker style
    useApi.ts               # $fetch wrapper con baseURL cercu-backend + token Bearer
  data/
    reefs.ts                # 12 arrecifes mexicanos (Caribe + GoM + Pacífico). reefSummary
    layers.ts               # 13 capas abiertas (NOAA CRW, NASA MODIS/PACE, ESA Sentinel-2,
                            # GEBCO, CONABIO ANP+coral, CONANP, GFW, NOAA SaWS, INEGI)
    contributors.ts         # 8 colaboradores con tiers (bronze→coral) + tierConfig
    observations.ts         # 6 aportes en distintos estados (validated/in_review/pending)
    conflicts.ts            # 6 casos socioambientales (Tren Maya, cruceros, FONATUR, etc.)
    bleaching-alerts.ts     # Snapshot NOAA CRW por reefId (DHW, SST, anomaly, level)
    kpis.ts                 # KPIs computados sobre los datos mock
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
                            # 3 features + alertas live + top contributors + CTA
    livemap.vue             # Mapa vivo full-screen con toolbar + legend + panel de capas
    inventory/index.vue     # Cards 12 arrecifes + filtros + sort + drawer detalle
    atlas/index.vue         # Atlas EJAtlas-style: drivers vs resistance + drawer detalle
    data-sources/index.vue  # Catálogo de capas con filtros + atribuciones + descargas
    contributors/index.vue  # Tier ladder + filtros + leaderboard + CTA
    contribute/index.vue    # Form multi-tipo (foto/dron/satelital/transecto/conflicto) +
                            # validación → cola de revisión
    observations/index.vue  # Lista de aportes con estados + tipo + crédito + calidad
    about/index.vue         # Misión, fuentes, sistema de reputación, validación, licencias
  stores/
    reefs.ts                # publicReefs (filtra visible/archived) + filtros + setReefs +
                            # localStorage overrides (obs-arrecifes-reef-overrides)
    layers.ts               # toggleLayer, filtros por categoría/proveedor
    observations.ts         # validated/pending/filtered + submit() (citizen submission)
    contributors.ts         # leaderboard, filtros por role/tier
    conflicts.ts            # publicConflicts + filtros intensidad/estado/amenaza
  types/
    index.ts                # Reef, DataLayer, Contributor, Observation,
                            # SocioEnvironmentalConflict, BleachingAlert, AdminUser, Kpi
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
| Alertas blanqueamiento | `GET /observatory/arrecifes/alerts/bleaching?latestPerReef=true` | `(pending)` |

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
  hero?: string; imageCredit?: string
  visible?: boolean; archived?: boolean
}

type BleachingAlertLevel = 'no_stress' | 'watch' | 'warning' | 'alert_1' | 'alert_2'
interface BleachingAlert { reefId; level; dhw; sst; sstAnomaly; observedAt; source }

type DataProvider = 'nasa' | 'noaa' | 'esa_copernicus' | 'usgs' | 'conabio' | 'conanp' |
                    'inegi' | 'allen_coral_atlas' | 'global_fishing_watch'
type LayerCategory = 'thermal_stress' | 'bathymetry' | 'benthic_habitat' | 'water_quality' |
                     'protected_areas' | 'land_use' | 'fishing_pressure' | 'community_observations'
type LayerFormat = 'wms' | 'wmts' | 'geotiff' | 'shapefile' | 'geojson' | 'kml' | 'csv' | 'cog'

interface DataLayer {
  id: string; title: string; description: string
  provider: DataProvider; providerLabel: string; category: LayerCategory; format: LayerFormat
  resolution?: string; cadence?: string; coverage: 'global'|'regional'|'national'
  license: string; attribution: string             // ATRIBUCIÓN OBLIGATORIA
  sourceUrl: string; downloadUrl?: string; previewUrl?: string
  lastUpdated?: string; active: boolean
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
  legalActions?: string[]; mediaUrls: string[]; contributorId?
  visible?; archived?
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

## Sistema de reputación (red de colaboradores)

Inspirado en Mercado Libre/Rappi: rango basado en aportes validados, calidad y consistencia
(no solo volumen).

| Rango | Umbral | Requisitos típicos |
|-------|--------|--------------------|
| Bronce | 0–199 pts | Primer aporte validado |
| Plata | 200–499 pts | 30+ aportes validados |
| Oro | 500–699 pts | 60+ aportes, calidad ≥75%, 3+ meses activo |
| Platino | 700–999 pts | 90+ aportes, calidad ≥85%, 6+ meses activo |
| **Coral** | 1000+ pts | **Top 1%**. Identidad y trayectoria verificadas |

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
- **Tier badges:** `.tier-bronze` / `.tier-silver` / `.tier-gold` / `.tier-platinum` / `.tier-coral`
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

- **Mapa vivo** (`/livemap`) — Leaflet full-screen, toolbar, legend, panel de capas
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

**Módulo:** `src/modules/observatory/arrecifes/` (controller + service + routes + validation).
**Entidades:** `ObsReef`, `ObsConflict`, `ObsContributor`, `ObsObservation`, `ObsBleachingAlert`
en `src/entities/observatory/`. Auto-sync en dev, no requiere migración manual.

**Públicos** (sin auth, sólo `visible=true && archived=false`):

```
GET  /observatory/arrecifes/reefs?ocean=&state=&status=&search=
GET  /observatory/arrecifes/reefs/:id
GET  /observatory/arrecifes/conflicts?intensity=&status=&state=
GET  /observatory/arrecifes/conflicts/:id
GET  /observatory/arrecifes/contributors?role=&tier=
GET  /observatory/arrecifes/contributors/:id
GET  /observatory/arrecifes/observations?reefId=&type=          # solo validated
GET  /observatory/arrecifes/observations/:id
POST /observatory/arrecifes/observations                        # ciudadano → pending
GET  /observatory/arrecifes/alerts/bleaching?latestPerReef=true
```

**Admin** (Bearer JWT — `ObservatoryAdmin` con `arrecifes` en `observatories[]`):

```
GET    /observatory/arrecifes/admin/summary                     # dashboard counts
CRUD   /observatory/arrecifes/admin/reefs[/:id]
CRUD   /observatory/arrecifes/admin/conflicts[/:id]
CRUD   /observatory/arrecifes/admin/contributors[/:id]
GET    /observatory/arrecifes/admin/observations[/:id]
POST   /observatory/arrecifes/admin/observations/:id/review     # body: {status, qualityScore?, reviewerNotes?}
DELETE /observatory/arrecifes/admin/observations/:id
POST   /observatory/arrecifes/admin/alerts/bleaching            # ingest NOAA CRW
POST   /observatory/auth/login                                  # JWT 15min, refresh 7d
GET    /observatory/auth/me
```

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

## Admin del observatorio (✅ scaffold inicial)

Páginas en `pages/admin/`:
- `/admin/login` — email + password contra `POST /observatory/auth/login`
- `/admin` — dashboard con summary (reefs, conflicts, contributors, cola de observaciones)
- `/admin/reefs` — tabla con toggles `visible` / `archived`
- `/admin/observations` — cola de revisión con drawer modal (validar / rechazar / pedir info)
- `/admin/conflicts` — toggles visible/archived
- `/admin/contributors` — leaderboard con toggle `verified`
- `/admin/usuarios` — lista de admins del observatorio

Composables/stores:
- `stores/auth.ts` — login/logout, `loadFromStorage`, `hasPermission`. Token en
  `localStorage` bajo clave `arrecifes-admin-token`.
- `middleware/admin.ts` — protege `/admin/*` (excepto `/admin/login`) y mapea ruta →
  permiso (`manage_reefs`, `review_submissions`, etc.).
- `composables/useApi.ts` — ya envía `Authorization: Bearer <token>` y prefija
  `/observatory/arrecifes`.

Layout `layouts/admin.vue` con sidebar colapsable (mobile <lg) y badge de rol del usuario.
Cada página admin debe declarar `definePageMeta({ layout: 'admin', middleware: 'admin', pageTransition: false })`.

## Roadmap (v2+)

- **CRUD UI completo** — formularios de creación/edición para reefs, conflicts y
  contributors (actualmente sólo toggles visible/archived).
- **Panel de revisión enriquecido** — adjuntos de aportes (galería de imágenes/video)
  desde cola de observaciones
- **Cron de capas** — pull NOAA/NASA/ESA cada N horas vía cercu-backend
- **WebSocket** — push de alertas críticas de blanqueamiento al mapa vivo
- **Time slider** — comparativa multitemporal de cobertura coralina y SST
- **API pública** — endpoints `/public/v1/...` con rate limit y CC BY 4.0
- **Aplicación móvil** — companion para captura en campo con geofence (Sian Ka'an, etc.)

## License

Apache 2.0 (código del observatorio). Cada capa de datos preserva su licencia original.

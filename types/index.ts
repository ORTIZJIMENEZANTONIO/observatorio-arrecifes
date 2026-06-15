// ============================================================================
// Observatorio de Arrecifes - TypeScript Type Definitions
// ============================================================================
// All identifiers in English (per project conventions). User-facing copy in es-MX.

export type CoastalState =
  | 'Quintana Roo'
  | 'Yucatán'
  | 'Campeche'
  | 'Veracruz'
  | 'Tamaulipas'
  | 'Tabasco'
  | 'Baja California Sur'
  | 'Baja California'
  | 'Sonora'
  | 'Sinaloa'
  | 'Nayarit'
  | 'Jalisco'
  | 'Colima'
  | 'Michoacán'
  | 'Guerrero'
  | 'Oaxaca'
  | 'Chiapas'

export type Ocean = 'caribbean' | 'gulf_of_mexico' | 'pacific'

// Reef classification (Allen Coral Atlas-inspired benthic + geomorphic)
export type ReefBenthicClass =
  | 'coral_algae'
  | 'rock'
  | 'rubble'
  | 'sand'
  | 'seagrass'
  | 'microalgae'

export type ReefGeomorphicClass =
  | 'reef_crest'
  | 'reef_slope'
  | 'reef_flat'
  | 'lagoon'
  | 'back_reef'
  | 'fringing'
  | 'patch_reef'

export type ReefStatus = 'healthy' | 'watch' | 'warning' | 'alert' | 'bleaching' | 'mortality'

export type ProtectionStatus =
  | 'anp_federal'        // Área Natural Protegida federal (CONANP)
  | 'anp_state'          // ANP estatal
  | 'ramsar'             // Sitio Ramsar
  | 'unesco'             // Patrimonio Mundial / Reserva de la Biosfera
  | 'unprotected'

export interface Reef {
  id: number
  name: string
  state: CoastalState
  ocean: Ocean
  region: string                        // e.g. "Sistema Arrecifal Mesoamericano"
  benthicClasses: ReefBenthicClass[]
  geomorphicClasses: ReefGeomorphicClass[]
  area: number                          // hectares
  depthRange: [number, number]          // meters
  protection: ProtectionStatus
  status: ReefStatus
  liveCoralCover?: number               // % (0-100)
  bleachingAlert?: BleachingAlertLevel  // current NOAA CRW level
  speciesRichness?: number              // # documented coral species
  threats: ThreatType[]
  observations: number                  // count of validated observations
  lat: number
  lng: number
  description: string
  hero?: string                         // hero image path
  gallery?: string[]                    // hasta 3 imágenes adicionales para drawer
  imageCredit?: string
  visible?: boolean
  archived?: boolean
  // Climatología NASA POWER cacheada en backend. Puede estar ausente si nunca
  // se ejecutó el refresh-climate.
  climateData?: ReefClimateData | null
  climateFetchedAt?: string | null
}

// Subset de variables climatológicas que devuelve NASA POWER. Ver entidad
// `ObsReef.climateData` en el backend.
export interface ReefClimateData {
  source: 'nasa_power'
  lat: number
  lng: number
  solarIrradiation: number | null    // kWh/m²/día (media anual)
  airTemp: number | null             // °C
  precipitation: number | null       // mm/día
  windSpeed: number | null           // m/s
  relativeHumidity: number | null    // %
  monthly: {
    solarIrradiation: number[]       // 12 valores ene→dic
    airTemp: number[]
    precipitation: number[]
  } | null
}

// ── NOAA Coral Reef Watch alert levels ─────────────────────────────────────
export type BleachingAlertLevel =
  | 'no_stress'      // 0
  | 'watch'          // 1
  | 'warning'        // 2
  | 'alert_1'        // 3 — bleaching likely
  | 'alert_2'        // 4 — mortality likely

export interface BleachingAlert {
  reefId: number
  level: BleachingAlertLevel
  dhw: number                           // degree heating weeks (NOAA CRW 5km)
  sst: number                           // sea surface temperature (°C)
  sstAnomaly: number                    // °C above climatological max
  observedAt: string                    // ISO date
  source: 'noaa_crw' | 'modis' | 'sentinel3'
  productUrl?: string
}

// ── Satellite & open data layers ───────────────────────────────────────────
export type DataProvider =
  | 'nasa'
  | 'noaa'
  | 'esa_copernicus'
  | 'usgs'
  | 'conabio'
  | 'conanp'
  | 'inegi'
  | 'allen_coral_atlas'
  | 'global_fishing_watch'

export type LayerCategory =
  | 'thermal_stress'
  | 'bathymetry'
  | 'benthic_habitat'
  | 'water_quality'
  | 'protected_areas'
  | 'land_use'
  | 'fishing_pressure'
  | 'community_observations'

export type LayerFormat = 'wms' | 'wmts' | 'geotiff' | 'shapefile' | 'geojson' | 'kml' | 'csv' | 'cog'

// Origen del binario: URL externa del proveedor o archivo subido por admin.
export type LayerKind = 'external_url' | 'uploaded_file'

export interface DataLayer {
  id: string                            // slug estable (uso en frontend)
  numericId?: number                    // id incremental del backend (ObsLayer.id)
  title: string
  description: string
  kind?: LayerKind                      // default 'external_url'
  provider: DataProvider
  providerLabel: string
  category: LayerCategory
  format: LayerFormat
  resolution?: string                   // e.g. "5 km", "10 m", "30 m"
  cadence?: string                      // e.g. "diaria", "5 días", "mensual"
  coverage: 'global' | 'regional' | 'national'
  license: string                       // e.g. "CC BY 4.0", "Public Domain"
  attribution: string                   // mandatory citation string
  sourceUrl: string
  downloadUrl?: string
  previewUrl?: string                   // tile preview
  lastUpdated?: string
  active: boolean                       // toggleable on the live map
  // ── Live overlay (optional) — si están presentes, la capa se renderiza
  // sobre el mapa al estar `active = true`. Si no, sólo aparece en catálogo.
  wmsUrl?: string                       // WMS GetMap base endpoint
  wmsLayerName?: string                 // capa específica del WMS server
  tileUrlPattern?: string               // XYZ tile pattern alternative ({z}/{x}/{y})
  overlayOpacity?: number               // 0-1, default 0.7
  // ── Archivo subido (sólo si kind = 'uploaded_file') ──
  fileName?: string
  fileSize?: number
  mimeType?: string
  visible?: boolean
  archived?: boolean
}

// ── GeoJSON para conflictos (Point/LineString/Polygon + Multi*) ─────────────
export type GeoJsonGeometryType =
  | 'Point'
  | 'LineString'
  | 'Polygon'
  | 'MultiPoint'
  | 'MultiLineString'
  | 'MultiPolygon'

export interface GeoJsonGeometry {
  type: GeoJsonGeometryType
  coordinates: unknown
}

// ── User-contributed observations (citizen + drone + research) ─────────────
export type ObservationType =
  | 'satellite_image'
  | 'drone_flight'
  | 'underwater_photo'
  | 'transect_survey'
  | 'water_sample'
  | 'community_report'
  | 'socioenvironmental_conflict'

export type ObservationStatus = 'pending' | 'in_review' | 'validated' | 'rejected' | 'needs_more_info'

export interface Observation {
  id: number
  reefId?: number                       // optional link to known reef
  // Si el colaborador eligió "Otro" en el formulario (el sitio aún no está en
  // el catálogo de arrecifes), guardamos aquí el nombre que escribió para que
  // el revisor pueda crear el arrecife después y vincular `reefId`.
  customReefName?: string
  type: ObservationType
  title: string
  description: string
  contributorId: number
  capturedAt: string                    // ISO date when data was captured
  submittedAt: string
  lat: number
  lng: number
  attachments: ObservationAttachment[]
  tags: string[]
  status: ObservationStatus
  reviewerId?: number
  reviewerNotes?: string
  validatedAt?: string
  qualityScore?: number                 // 0-100, set by reviewer
  visible?: boolean
  archived?: boolean
}

export interface ObservationAttachment {
  id: number
  kind: 'image' | 'video' | 'document' | 'dataset'
  url: string
  caption?: string
  sizeBytes?: number
  mime?: string
}

// ── Contributor reputation system ──────────────────────────────────────────
// Inspired by Mercado Libre / Rappi: tiers based on validated contributions,
// quality, and consistency.
export type ContributorTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'coral'

// Escala reputacional editable desde /admin/tiers. `slug` es la clave estable
// referenciada por `Contributor.tier`. Soporta tiers custom además de los 5 default.
export interface Tier {
  id?: number
  slug: string                          // 'bronze' | 'silver' | … | custom
  label: string                         // visible en UI (es-MX)
  description?: string | null
  minScore: number
  maxScore?: number | null              // null = top tier sin tope
  color: string                         // amber | slate | yellow | cyan | coral | eco | primary
  requirements?: string | null
  icon?: string | null                  // lucide icon name
  sortOrder: number
  visible?: boolean
  archived?: boolean
  // Reframe del tier system: cada escala = un MODO distinto de aportar
  // (no un nivel a alcanzar). Visible en /contributors.
  modeTitle?: string | null             // título visible del modo
  audience?: string | null              // quién aporta así
  contributions?: string[] | null       // lista de aportes típicos (3-5)
  bridge?: string | null                // cómo conecta con los otros modos
}

export type ContributorRole =
  | 'citizen'
  | 'researcher'
  | 'student'
  | 'fisher'
  | 'diver'
  | 'tour_operator'
  | 'institution'
  | 'ngo'
  | 'government'

export interface Contributor {
  id: number
  displayName: string
  handle: string                        // @handle, unique
  role: ContributorRole
  affiliation?: string                  // university, NGO, dependency
  bio?: string
  avatarUrl?: string
  state?: CoastalState
  joinedAt: string
  // ── Reputation ──
  tier: ContributorTier
  reputationScore: number               // 0-1000+
  validatedContributions: number
  rejectedContributions: number
  acceptanceRate: number                // 0-1
  averageQuality: number                // 0-100
  consecutiveMonthsActive: number
  badges: ContributorBadge[]
  // ── Privacy ──
  publicProfile: boolean
  verified: boolean                     // identity verified by team
}

export interface ContributorBadge {
  id: string
  label: string
  description: string
  icon: string                          // lucide icon name
  earnedAt: string
}

// ── Threats & socioenvironmental conflicts (EJAtlas-inspired) ─────────────
export type ThreatType =
  | 'thermal_stress'
  | 'bleaching'
  | 'ocean_acidification'
  | 'sargassum'
  | 'sedimentation'
  | 'nutrient_pollution'
  | 'plastic_pollution'
  | 'overfishing'
  | 'destructive_fishing'
  | 'coastal_development'
  | 'tourism_pressure'
  | 'cruise_anchoring'
  | 'oil_spill'
  | 'invasive_species'
  | 'disease_outbreak'                  // e.g. SCTLD
  | 'hurricane_damage'

export type ConflictIntensity = 'low' | 'medium' | 'high' | 'critical'
export type ConflictStatus = 'emerging' | 'ongoing' | 'mitigating' | 'resolved'

export interface SocioEnvironmentalConflict {
  id: number
  title: string
  summary: string
  fullStory: string
  reefIds: number[]
  state: CoastalState
  threats: ThreatType[]
  intensity: ConflictIntensity
  status: ConflictStatus
  affectedCommunities: string[]
  affectedSpecies?: string[]
  startedAt: string                     // ISO date
  updatedAt: string
  // EJAtlas-style: who pushes vs who resists
  drivers: string[]                     // e.g. "concesión hotelera", "cruceros"
  resistance: string[]                  // e.g. "cooperativa pesquera", "comunidad maya"
  legalActions?: string[]
  mediaUrls: string[]                   // press, reports, videos
  // Geometría espacial opcional (GeoJSON Feature.geometry).
  // Si está presente, el conflicto se pinta directo en el mapa.
  geometry?: GeoJsonGeometry | null
  contributorId?: number                // who submitted/curates
  visible?: boolean
  archived?: boolean
}

// ── KPIs ──
export interface Kpi {
  label: string
  value: string                         // display string final (ej. "15k", "100%")
  rawValue: number                      // valor numérico para animación count-up
  decimals?: number                     // decimales en la animación (default 0)
  divisor?: number                      // si rawValue se debe mostrar dividido (ej. /1000 → "k")
  unit?: string
  color: string                         // 'primary' | 'coral' | 'eco' | 'accent' | 'alert'
  delta?: string
  icon?: string
  to?: string                           // optional internal link
}

// ── Admin roles & permissions ──
export type AdminRole = 'superadmin' | 'admin' | 'reviewer' | 'editor'

export type AdminPermission =
  | 'manage_users'
  | 'manage_cms'
  | 'manage_reefs'
  | 'manage_layers'
  | 'manage_observations'
  | 'manage_conflicts'
  | 'manage_contributors'
  | 'review_submissions'

export interface AdminUser {
  id: string
  email: string
  name: string
  role: AdminRole
  permissions: AdminPermission[]
  observatories?: string[]
  isActive?: boolean
  createdAt?: string
  lastLogin?: string | null
}

// ── Reef News (sección editorial / blog) ──
export interface ReefNewsArticle {
  id: number
  title: string
  slug: string
  summary: string
  content?: string | null
  author: string
  publishedAt: string                  // YYYY-MM-DD
  tags?: string[] | null
  image?: string | null
  imageCredit?: string | null
  sourceUrl?: string | null            // link al original (Mongabay etc.)
  source?: string | null               // etiqueta visible ("Mongabay Latam")
  visible?: boolean
  archived?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface ReefNewsProspect {
  id: number
  title: string
  summary: string
  url: string
  source: string
  publishedAt: string
  image?: string | null
  status: 'pending' | 'approved' | 'rejected'
  rejectionNotes?: string | null
  urlHash: string
  reviewedBy?: string | null
  scrapedAt?: string
}

// ── Coastal Intrusion (detector ZOFEMAT) ──
export type CoastalIntrusionStatus = 'candidate' | 'verified' | 'dismissed' | 'escalated'

export interface CoastalIntrusion {
  id: number
  reefId: number | null
  osmId: string | null
  osmTags?: Record<string, string> | null
  geometry: GeoJsonGeometry
  centroidLat: number
  centroidLng: number
  areaM2?: number | null
  zofematOverlapPct?: number | null
  status: CoastalIntrusionStatus
  source: string
  detectedAt: string
  reviewedBy?: string | null
  reviewedAt?: string | null
  reviewerNotes?: string | null
  escalatedConflictId?: number | null
  // join opcional desde el service
  reef?: { id: number; name: string; state: string; ocean: string } | null
  // ── Fase 2: novedad temporal via NDBI Sentinel-2 ──
  ndbiBaseline?: number | null
  ndbiCurrent?: number | null
  ndbiDelta?: number | null
  noveltyScore?: number | null            // 0-100 (mayor = más probable construcción nueva)
  noveltyAnalyzedAt?: string | null
  noveltyEpochs?: { baseline: string; current: string } | null
}

export interface CoastalIntrusionNoveltyBatch {
  processed: number
  ok: number
  failed: number
  results: Array<{ id: number; ok: boolean; score?: number; error?: string }>
}

// ════════════════════════════════════════════════════════════════════════════
// MÓDULO BIOLOGÍA · v2 — especies, enfermedades, restauración, invasoras
// ════════════════════════════════════════════════════════════════════════════

// IUCN Red List
export type IucnStatus = 'LC' | 'NT' | 'VU' | 'EN' | 'CR' | 'EW' | 'EX' | 'DD'
// NOM-059-SEMARNAT-2010: A=amenazada, Pr=protección especial, P=peligro de
// extinción, E=probablemente extinta, none=sin categoría
export type Nom059Status = 'A' | 'Pr' | 'P' | 'E' | 'none'

export type SpeciesKingdom =
  | 'cnidaria'        // corales, anémonas
  | 'fish'
  | 'crustacean'
  | 'mollusk'
  | 'echinoderm'      // erizos, estrellas, pepinos
  | 'algae'
  | 'reptile'         // tortugas
  | 'mammal'
  | 'plant'           // pastos marinos, manglares

export interface Species {
  id: number
  scientificName: string                // formato italic en UI
  commonName: string                    // es-MX
  kingdom: SpeciesKingdom
  reefIds: number[]                     // dónde está documentada
  iucnStatus: IucnStatus
  nom059Status: Nom059Status
  endemic: boolean                      // endémica del Pacífico/Caribe mexicano
  isKeystone: boolean                   // especie clave del ecosistema
  description: string
  threats: ThreatType[]
  habitat: string                       // hábitat preferido en lenguaje accesible
  depthRange?: [number, number]         // m
  hero?: string                         // imagen
  imageCredit?: string
  obisId?: string                       // OBIS scientificNameID
  gbifKey?: number                      // GBIF taxon key
  wormsAphiaId?: number                 // WoRMS AphiaID
  visible?: boolean
  archived?: boolean
}

// ── SCTLD / enfermedades coralinas ─────────────────────────────────────────
export type DiseaseAgent =
  | 'sctld'                             // Stony Coral Tissue Loss Disease
  | 'white_band'
  | 'white_plague'
  | 'black_band'
  | 'yellow_band'
  | 'dark_spot'
  | 'unknown'

export type DiseaseSeverity =
  | 'no_signs'
  | 'incipient'                         // <5% colonias afectadas
  | 'progressing'                       // 5-25%
  | 'advanced'                          // 25-60%
  | 'epidemic'                          // >60%
  | 'recovering'

export type DiseaseIntervention =
  | 'amoxicillin_paste'                 // Base 2B + amoxicilina (CDC protocol)
  | 'chlorinated_paste'
  | 'ablation'                          // remoción de tejido enfermo
  | 'monitoring_only'
  | 'fragment_rescue'                   // mover fragmentos sanos a viveros

export interface DiseaseReport {
  id: number
  reefId: number
  agent: DiseaseAgent
  speciesAffected: string[]             // scientificName[]
  severity: DiseaseSeverity
  prevalence: number                    // % de colonias afectadas (0-100)
  surveyMethod?: 'belt_transect' | 'roving' | 'photoquadrat' | 'citizen_report'
  interventions: DiseaseIntervention[]
  interventionTeam?: string             // ej. "CRC Cozumel + CONANP"
  observedAt: string                    // ISO date
  contributorId?: number
  lat?: number
  lng?: number
  depth?: number                        // m
  notes?: string
  photoUrls?: string[]
  visible?: boolean
  archived?: boolean
}

// ── Especies invasoras (pez león, etc.) ────────────────────────────────────
export type InvasiveSpecies =
  | 'pterois_volitans'                  // pez león indo-pacífico
  | 'pterois_miles'                     // pez león
  | 'tubastraea_coccinea'               // coral sol invasor (Pacífico)
  | 'other'

export interface InvasiveReport {
  id: number
  reefId: number
  species: InvasiveSpecies
  count: number                         // observados
  captured: number                      // removidos
  effortHours?: number                  // esfuerzo de pesca/buceo
  averageSize?: number                  // cm longitud total
  observedAt: string
  team?: string                         // cooperativa / torneo
  contributorId?: number
  notes?: string
  visible?: boolean
  archived?: boolean
}

// ── Restauración coralina ──────────────────────────────────────────────────
export type RestorationMethod =
  | 'coral_garden'                      // viveros suspendidos
  | 'micro_fragmentation'               // SECORE / Mote
  | 'larval_propagation'                // crianza sexual
  | 'outplanting'                       // transplante a sustrato
  | 'reef_balls'                        // estructuras artificiales
  | 'substrate_consolidation'

export interface RestorationSite {
  id: number
  name: string
  reefId: number
  institution: string                   // CRC Cozumel, Oceanus AC, ICMyL-UNAM…
  speciesProduced: string[]             // scientificName[]
  methodsUsed: RestorationMethod[]
  startedAt: string                     // YYYY-MM-DD
  fragmentsProduced: number             // acumulado total
  outplanted: number                    // acumulado transplantado
  survivalRate: number                  // % a 1 año
  active: boolean
  contactEmail?: string
  websiteUrl?: string
  notes?: string
  lat?: number
  lng?: number
  visible?: boolean
  archived?: boolean
}

// ── Fenología (eventos cíclicos) ───────────────────────────────────────────
export type PhenologyEventType =
  | 'coral_spawning'                    // desove masivo
  | 'fish_aggregation'                  // agregaciones reproductivas (mero, robalo)
  | 'turtle_nesting'
  | 'sargasso_peak'                     // pico de arribazón
  | 'bleaching_season'                  // ventana climatológica de blanqueamiento
  | 'lionfish_tournament'               // torneos de control
  | 'whale_shark'                       // agregación tiburón ballena (Isla Mujeres)
  | 'monitoring_campaign'               // PMARP, REA, MBRS-HRI

export interface PhenologyEvent {
  id: number
  type: PhenologyEventType
  title: string                         // es-MX
  description: string
  reefIds: number[]
  ocean: Ocean | 'all'
  startMonth: number                    // 1-12
  endMonth: number
  peakMonth?: number
  speciesInvolved?: string[]
  source?: string                       // referencia académica
  visible?: boolean
}

// ── Huracanes históricos ───────────────────────────────────────────────────
export interface HurricaneTrack {
  id: number
  name: string                          // ej. "Wilma"
  year: number
  basin: 'atlantic' | 'pacific'
  maxCategory: number                   // 1-5 Saffir-Simpson
  landfallDate?: string                 // YYYY-MM-DD
  affectedReefIds: number[]
  trackPoints: { lat: number; lng: number; date: string; category: number }[]
  damageSummary?: string                // ¿qué le pasó a los arrecifes?
  recoveryYears?: number                // estimado de recuperación
  source: string                        // NOAA HURDAT2, IBTrACS
  visible?: boolean
}

// ── Policy briefs (ciencia → política) ─────────────────────────────────────
export type PolicyAudience =
  | 'conanp'
  | 'semarnat'
  | 'sader_conapesca'
  | 'sectur'
  | 'state_government'
  | 'municipal'
  | 'congress'
  | 'community'
  | 'public'

export type PolicyStatus = 'draft' | 'published' | 'urgent' | 'adopted' | 'archived'

export interface PolicyBrief {
  id: number
  title: string
  slug: string
  reefIds: number[]
  audience: PolicyAudience[]
  summary: string                       // 2-3 oraciones ejecutivas
  problem: string                       // el qué
  evidence: string[]                    // bullets con datos
  recommendations: string[]             // acciones priorizadas
  responsibleActor: string              // CONANP, municipio, etc.
  timeframe?: string                    // "30 días", "ciclo presupuestal 2027"
  status: PolicyStatus
  pdfUrl?: string
  doi?: string
  publishedAt: string                   // YYYY-MM-DD
  authors: string[]
  citation?: string                     // texto APA listo para copiar
  visible?: boolean
  archived?: boolean
}

// ── Protocolos / guías descargables ────────────────────────────────────────
export type ProtocolFormat = 'pdf' | 'video' | 'webform' | 'card' | 'manual'
export type ProtocolTopic =
  | 'bleaching'                         // CoralWatch colorímetro
  | 'sctld'
  | 'lionfish'
  | 'sargasso'
  | 'transect'                          // AGRRA / REA
  | 'photoquadrat'
  | 'identification'                    // ID de especies
  | 'water_quality'
  | 'ethics'
export type ProtocolLevel = 'principiante' | 'intermedio' | 'avanzado'

export interface Protocol {
  id: number
  title: string
  description: string
  format: ProtocolFormat
  topic: ProtocolTopic
  level: ProtocolLevel
  fileUrl?: string                      // PDF principal
  estimatedTime?: string                // "15 min", "1 día"
  audience: ContributorRole[]           // a quién va dirigida
  authors?: string[]
  language?: 'es' | 'en' | 'bilingual'
  source?: string                       // CoralWatch, AGRRA, NOAA…
  thumbnail?: string
  visible?: boolean
  archived?: boolean
}

// ── Calendario de campañas y eventos ───────────────────────────────────────
export type CampaignType =
  | 'monitoring'                        // campaña de monitoreo
  | 'training'                          // capacitación
  | 'restoration'                       // jornada de restauración
  | 'cleanup'                           // limpieza costera
  | 'tournament'                        // torneo control pez león
  | 'science_fair'
  | 'public_lecture'
  | 'public_event'                      // festival, conmemoración
  | 'workshop'

export interface CampaignEvent {
  id: number
  title: string
  description: string
  type: CampaignType
  startDate: string                     // YYYY-MM-DD
  endDate?: string
  location: string                      // legible
  reefIds: number[]
  organizer: string
  registrationUrl?: string
  contactEmail?: string
  capacity?: number
  cost?: string                         // "gratis", "$500 MXN"
  visible?: boolean
}

// ── Índice multi-amenaza (estilo Halpern et al.) ───────────────────────────
export interface PressureIndex {
  reefId: number
  thermal: number                       // 0-100
  disease: number
  fishing: number
  tourism: number
  development: number
  sargasso: number
  pollution: number
  hurricane: number
  total: number                         // promedio ponderado
  trend: 'improving' | 'stable' | 'worsening'
  updatedAt: string
}

// ── Story maps (narrativa guiada por caso) ─────────────────────────────────
export interface StoryMapSection {
  heading: string
  body: string
  image?: string
  imageCredit?: string
  reefIds?: number[]                    // si la sección hace zoom a sitios
  layers?: string[]                     // slugs de DataLayer a activar
  // Año/era para la sección (para slider temporal del story map).
  year?: number
}

export interface StoryMap {
  id: number
  slug: string
  title: string
  subtitle: string
  cover?: string
  coverCredit?: string
  authors: string[]
  publishedAt: string
  estimatedMinutes: number
  topic: 'sctld' | 'bleaching' | 'restoration' | 'conflict' | 'community' | 'policy'
  reefIds: number[]
  sections: StoryMapSection[]
  visible?: boolean
  archived?: boolean
}

// ════════════════════════════════════════════════════════════════════════════

export interface CoastalIntrusionRunResult {
  startedAt: string
  finishedAt: string
  reefsProcessed: number
  buildingsScanned: number
  candidates: number
  inserted: number
  updated: number
  skipped: number
  perReef: Array<{
    reefId: number
    reefName: string
    buildingsScanned: number
    candidates: number
    inserted: number
    updated: number
    skipped: number
    reason?: string
  }>
}

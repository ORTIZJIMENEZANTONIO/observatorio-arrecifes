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

export interface DataLayer {
  id: string
  title: string
  description: string
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
  contributorId?: number                // who submitted/curates
  visible?: boolean
  archived?: boolean
}

// ── KPIs ──
export interface Kpi {
  label: string
  value: string
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
  createdAt?: string
  lastLogin?: string
}

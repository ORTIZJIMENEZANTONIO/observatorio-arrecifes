import type {
  ReefStatus,
  BleachingAlertLevel,
  ContributorTier,
  ObservationType,
  ObservationStatus,
  ConflictIntensity,
  ConflictStatus,
  ProtectionStatus,
  ThreatType,
  IucnStatus,
  Nom059Status,
  SpeciesKingdom,
  DiseaseSeverity,
  DiseaseAgent,
  RestorationMethod,
  PolicyStatus,
  PolicyAudience,
  InvasiveSpecies,
  PhenologyEventType,
  CampaignType,
  ProtocolTopic,
  ProtocolLevel,
} from '~/types'

export const useFormatters = () => {
  const numberFmt = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 })
  const decimalFmt = new Intl.NumberFormat('es-MX', { minimumFractionDigits: 1, maximumFractionDigits: 2 })
  const percentFmt = new Intl.NumberFormat('es-MX', { style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 1 })
  const dateFmt = new Intl.DateTimeFormat('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })

  const formatNumber = (value: number | string | null | undefined, decimals = false): string => {
    const n = Number(value)
    if (!Number.isFinite(n)) return '—'
    return decimals ? decimalFmt.format(n) : numberFmt.format(n)
  }

  const formatHectares = (ha: number | string | null | undefined): string => {
    const n = Number(ha)
    return Number.isFinite(n) ? `${numberFmt.format(n)} ha` : '—'
  }

  const formatPercent = (value: number | string | null | undefined): string => {
    const n = Number(value)
    if (!Number.isFinite(n)) return '—'
    const normalized = n > 1 ? n / 100 : n
    return percentFmt.format(normalized)
  }

  const formatDate = (value: string | Date): string => {
    const date = typeof value === 'string' ? new Date(value) : value
    if (Number.isNaN(date.getTime())) return String(value)
    return dateFmt.format(date)
  }

  const formatDepth = (range: [number, number] | number[] | null | undefined): string => {
    if (!Array.isArray(range) || range.length < 2) return '—'
    const a = Number(range[0]); const b = Number(range[1])
    if (!Number.isFinite(a) || !Number.isFinite(b)) return '—'
    return `${a}–${b} m`
  }

  const formatReefStatus = (status: ReefStatus): string => {
    const map: Record<ReefStatus, string> = {
      healthy: 'Saludable',
      watch: 'Vigilancia',
      warning: 'Advertencia',
      alert: 'Alerta',
      bleaching: 'Blanqueamiento',
      mortality: 'Mortalidad',
    }
    return map[status] ?? status
  }

  const reefStatusBadgeClass = (status: ReefStatus): string => {
    const map: Record<ReefStatus, string> = {
      healthy: 'bg-eco/10 text-eco-dark',
      watch: 'bg-secondary/10 text-secondary-dark',
      warning: 'bg-accent/10 text-accent-dark',
      alert: 'bg-coral/15 text-coral-dark',
      bleaching: 'bg-alert/10 text-alert-dark',
      mortality: 'bg-alert/15 text-alert-dark',
    }
    return map[status] ?? 'bg-gray-100 text-ink-muted'
  }

  const formatBleachingAlert = (level: BleachingAlertLevel): string => {
    const map: Record<BleachingAlertLevel, string> = {
      no_stress: 'Sin estrés',
      watch: 'Vigilancia',
      warning: 'Advertencia',
      alert_1: 'Alerta nivel 1',
      alert_2: 'Alerta nivel 2',
    }
    return map[level] ?? level
  }

  const bleachingAlertBadgeClass = (level: BleachingAlertLevel): string => {
    const map: Record<BleachingAlertLevel, string> = {
      no_stress: 'bg-eco/10 text-eco-dark',
      watch: 'bg-secondary/10 text-secondary-dark',
      warning: 'bg-accent/10 text-accent-dark',
      alert_1: 'bg-coral/15 text-coral-dark',
      alert_2: 'bg-alert/10 text-alert-dark',
    }
    return map[level] ?? 'bg-gray-100 text-ink-muted'
  }

  const formatTier = (tier: ContributorTier): string => {
    const map: Record<ContributorTier, string> = {
      bronze: 'Bronce',
      silver: 'Plata',
      gold: 'Oro',
      platinum: 'Platino',
      coral: 'Coral',
    }
    return map[tier] ?? tier
  }

  const tierBadgeClass = (tier: ContributorTier): string => {
    const map: Record<ContributorTier, string> = {
      bronze: 'tier-bronze',
      silver: 'tier-silver',
      gold: 'tier-gold',
      platinum: 'tier-platinum',
      coral: 'tier-coral',
    }
    return map[tier] ?? 'tier-bronze'
  }

  const formatObservationType = (type: ObservationType): string => {
    const map: Record<ObservationType, string> = {
      satellite_image: 'Imagen satelital',
      drone_flight: 'Vuelo de dron',
      underwater_photo: 'Foto submarina',
      transect_survey: 'Transecto',
      water_sample: 'Muestra de agua',
      community_report: 'Reporte comunitario',
      socioenvironmental_conflict: 'Conflicto socioambiental',
    }
    return map[type] ?? type
  }

  const formatObservationStatus = (status: ObservationStatus): string => {
    const map: Record<ObservationStatus, string> = {
      pending: 'Pendiente',
      in_review: 'En revisión',
      validated: 'Validada',
      rejected: 'Rechazada',
      needs_more_info: 'Requiere más información',
    }
    return map[status] ?? status
  }

  const observationStatusBadgeClass = (status: ObservationStatus): string => {
    const map: Record<ObservationStatus, string> = {
      pending: 'bg-gray-100 text-ink-muted',
      in_review: 'bg-secondary/10 text-secondary-dark',
      validated: 'bg-eco/10 text-eco-dark',
      rejected: 'bg-alert/10 text-alert-dark',
      needs_more_info: 'bg-accent/10 text-accent-dark',
    }
    return map[status] ?? 'bg-gray-100 text-ink-muted'
  }

  const formatConflictIntensity = (intensity: ConflictIntensity): string => {
    const map: Record<ConflictIntensity, string> = {
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
      critical: 'Crítica',
    }
    return map[intensity] ?? intensity
  }

  const conflictIntensityBadgeClass = (intensity: ConflictIntensity): string => {
    const map: Record<ConflictIntensity, string> = {
      low: 'bg-eco/10 text-eco-dark',
      medium: 'bg-accent/10 text-accent-dark',
      high: 'bg-coral/15 text-coral-dark',
      critical: 'bg-alert/10 text-alert-dark',
    }
    return map[intensity] ?? 'bg-gray-100 text-ink-muted'
  }

  const formatConflictStatus = (status: ConflictStatus): string => {
    const map: Record<ConflictStatus, string> = {
      emerging: 'Emergente',
      ongoing: 'En curso',
      mitigating: 'Mitigando',
      resolved: 'Resuelto',
    }
    return map[status] ?? status
  }

  const formatProtection = (p: ProtectionStatus): string => {
    const map: Record<ProtectionStatus, string> = {
      anp_federal: 'ANP federal',
      anp_state: 'ANP estatal',
      ramsar: 'Sitio Ramsar',
      unesco: 'Patrimonio UNESCO',
      unprotected: 'Sin protección',
    }
    return map[p] ?? p
  }

  const formatThreat = (t: ThreatType): string => {
    const map: Record<ThreatType, string> = {
      thermal_stress: 'Estrés térmico',
      bleaching: 'Blanqueamiento',
      ocean_acidification: 'Acidificación',
      sargassum: 'Sargazo',
      sedimentation: 'Sedimentación',
      nutrient_pollution: 'Eutrofización',
      plastic_pollution: 'Plásticos',
      overfishing: 'Sobrepesca',
      destructive_fishing: 'Pesca destructiva',
      coastal_development: 'Desarrollo costero',
      tourism_pressure: 'Presión turística',
      cruise_anchoring: 'Anclaje cruceros',
      oil_spill: 'Derrame petróleo',
      invasive_species: 'Especies invasoras',
      disease_outbreak: 'Brote enfermedad',
      hurricane_damage: 'Daño por huracán',
    }
    return map[t] ?? t
  }

  const kpiColor = (color: string): string => {
    const map: Record<string, string> = {
      primary: 'text-primary',
      secondary: 'text-secondary',
      coral: 'text-coral',
      eco: 'text-eco',
      accent: 'text-accent',
      alert: 'text-alert',
    }
    return map[color] ?? 'text-ink'
  }

  const kpiIconBg = (color: string): string => {
    const map: Record<string, string> = {
      primary: 'bg-primary-50',
      secondary: 'bg-secondary/10',
      coral: 'bg-coral/10',
      eco: 'bg-eco/10',
      accent: 'bg-accent/10',
      alert: 'bg-alert/10',
    }
    return map[color] ?? 'bg-gray-100'
  }

  // ── v2: módulo biología, política y campañas ─────────────────────────────
  const formatIucn = (s: IucnStatus): string => {
    const map: Record<IucnStatus, string> = {
      LC: 'Preocupación menor',
      NT: 'Casi amenazada',
      VU: 'Vulnerable',
      EN: 'En peligro',
      CR: 'En peligro crítico',
      EW: 'Extinta en estado silvestre',
      EX: 'Extinta',
      DD: 'Datos insuficientes',
    }
    return map[s] ?? s
  }

  const iucnBadgeClass = (s: IucnStatus): string => {
    const map: Record<IucnStatus, string> = {
      LC: 'bg-eco/10 text-eco-dark',
      NT: 'bg-secondary/10 text-secondary-dark',
      VU: 'bg-accent/10 text-accent-dark',
      EN: 'bg-coral/15 text-coral-dark',
      CR: 'bg-alert/10 text-alert-dark',
      EW: 'bg-alert/15 text-alert-dark',
      EX: 'bg-gray-200 text-ink',
      DD: 'bg-gray-100 text-ink-muted',
    }
    return map[s] ?? 'bg-gray-100 text-ink-muted'
  }

  const formatNom059 = (s: Nom059Status): string => {
    const map: Record<Nom059Status, string> = {
      A: 'Amenazada',
      Pr: 'Protección especial',
      P: 'En peligro de extinción',
      E: 'Probablemente extinta',
      none: 'Sin categoría',
    }
    return map[s] ?? s
  }

  const formatKingdom = (k: SpeciesKingdom): string => {
    const map: Record<SpeciesKingdom, string> = {
      cnidaria: 'Cnidario',
      fish: 'Pez',
      crustacean: 'Crustáceo',
      mollusk: 'Molusco',
      echinoderm: 'Equinodermo',
      algae: 'Alga',
      reptile: 'Reptil',
      mammal: 'Mamífero',
      plant: 'Planta',
    }
    return map[k] ?? k
  }

  const kingdomIcon = (k: SpeciesKingdom): string => {
    const map: Record<SpeciesKingdom, string> = {
      cnidaria: 'lucide:flower',
      fish: 'lucide:fish',
      crustacean: 'lucide:bug',
      mollusk: 'lucide:shell',
      echinoderm: 'lucide:asterisk',
      algae: 'lucide:leaf',
      reptile: 'lucide:turtle',
      mammal: 'lucide:rabbit',
      plant: 'lucide:sprout',
    }
    return map[k] ?? 'lucide:circle'
  }

  const formatDiseaseSeverity = (s: DiseaseSeverity): string => {
    const map: Record<DiseaseSeverity, string> = {
      no_signs: 'Sin signos',
      incipient: 'Incipiente (<5%)',
      progressing: 'Progresando (5–25%)',
      advanced: 'Avanzada (25–60%)',
      epidemic: 'Epidémica (>60%)',
      recovering: 'En recuperación',
    }
    return map[s] ?? s
  }

  const diseaseSeverityBadgeClass = (s: DiseaseSeverity): string => {
    const map: Record<DiseaseSeverity, string> = {
      no_signs: 'bg-eco/10 text-eco-dark',
      incipient: 'bg-secondary/10 text-secondary-dark',
      progressing: 'bg-accent/10 text-accent-dark',
      advanced: 'bg-coral/15 text-coral-dark',
      epidemic: 'bg-alert/10 text-alert-dark',
      recovering: 'bg-primary-50 text-primary',
    }
    return map[s] ?? 'bg-gray-100 text-ink-muted'
  }

  const formatDiseaseAgent = (a: DiseaseAgent): string => {
    const map: Record<DiseaseAgent, string> = {
      sctld: 'SCTLD',
      white_band: 'Banda blanca',
      white_plague: 'Plaga blanca',
      black_band: 'Banda negra',
      yellow_band: 'Banda amarilla',
      dark_spot: 'Mancha oscura',
      unknown: 'Sin identificar',
    }
    return map[a] ?? a
  }

  const formatRestorationMethod = (m: RestorationMethod): string => {
    const map: Record<RestorationMethod, string> = {
      coral_garden: 'Vivero suspendido',
      micro_fragmentation: 'Micro-fragmentación',
      larval_propagation: 'Crianza sexual',
      outplanting: 'Transplante',
      reef_balls: 'Estructuras artificiales',
      substrate_consolidation: 'Consolidación de sustrato',
    }
    return map[m] ?? m
  }

  const formatPolicyStatus = (s: PolicyStatus): string => {
    const map: Record<PolicyStatus, string> = {
      draft: 'Borrador',
      published: 'Publicado',
      urgent: 'Urgente',
      adopted: 'Adoptado',
      archived: 'Archivado',
    }
    return map[s] ?? s
  }

  const policyStatusBadgeClass = (s: PolicyStatus): string => {
    const map: Record<PolicyStatus, string> = {
      draft: 'bg-gray-100 text-ink-muted',
      published: 'bg-primary-50 text-primary',
      urgent: 'bg-alert/10 text-alert-dark',
      adopted: 'bg-eco/10 text-eco-dark',
      archived: 'bg-gray-100 text-ink-muted',
    }
    return map[s] ?? 'bg-gray-100 text-ink-muted'
  }

  const formatAudience = (a: PolicyAudience): string => {
    const map: Record<PolicyAudience, string> = {
      conanp: 'CONANP',
      semarnat: 'SEMARNAT',
      sader_conapesca: 'SADER / CONAPESCA',
      sectur: 'SECTUR',
      state_government: 'Gobierno estatal',
      municipal: 'Municipio',
      congress: 'Congreso',
      community: 'Comunidad',
      public: 'Público general',
    }
    return map[a] ?? a
  }

  const formatInvasiveSpecies = (s: InvasiveSpecies): string => {
    const map: Record<InvasiveSpecies, string> = {
      pterois_volitans: 'Pez león (Pterois volitans)',
      pterois_miles: 'Pez león (Pterois miles)',
      tubastraea_coccinea: 'Coral sol (Tubastraea coccinea)',
      other: 'Otra',
    }
    return map[s] ?? s
  }

  const formatPhenologyType = (t: PhenologyEventType): string => {
    const map: Record<PhenologyEventType, string> = {
      coral_spawning: 'Desove coralino',
      fish_aggregation: 'Agregación de peces',
      turtle_nesting: 'Anidación de tortugas',
      sargasso_peak: 'Pico de sargazo',
      bleaching_season: 'Ventana de blanqueamiento',
      lionfish_tournament: 'Torneo de pez león',
      whale_shark: 'Tiburón ballena',
      monitoring_campaign: 'Campaña de monitoreo',
    }
    return map[t] ?? t
  }

  const phenologyIcon = (t: PhenologyEventType): string => {
    const map: Record<PhenologyEventType, string> = {
      coral_spawning: 'lucide:sparkles',
      fish_aggregation: 'lucide:fish',
      turtle_nesting: 'lucide:turtle',
      sargasso_peak: 'lucide:leaf',
      bleaching_season: 'lucide:thermometer-sun',
      lionfish_tournament: 'lucide:swords',
      whale_shark: 'lucide:waves',
      monitoring_campaign: 'lucide:clipboard-list',
    }
    return map[t] ?? 'lucide:calendar'
  }

  const formatCampaignType = (t: CampaignType): string => {
    const map: Record<CampaignType, string> = {
      monitoring: 'Monitoreo',
      training: 'Capacitación',
      restoration: 'Restauración',
      cleanup: 'Limpieza',
      tournament: 'Torneo',
      science_fair: 'Feria científica',
      public_lecture: 'Conferencia',
      public_event: 'Evento público',
      workshop: 'Taller',
    }
    return map[t] ?? t
  }

  const formatProtocolTopic = (t: ProtocolTopic): string => {
    const map: Record<ProtocolTopic, string> = {
      bleaching: 'Blanqueamiento',
      sctld: 'Enfermedad SCTLD',
      lionfish: 'Pez león',
      sargasso: 'Sargazo',
      transect: 'Transecto',
      photoquadrat: 'Foto-cuadrante',
      identification: 'Identificación',
      water_quality: 'Calidad del agua',
      ethics: 'Ética',
    }
    return map[t] ?? t
  }

  const formatProtocolLevel = (l: ProtocolLevel): string => {
    const map: Record<ProtocolLevel, string> = {
      principiante: 'Principiante',
      intermedio: 'Intermedio',
      avanzado: 'Avanzado',
    }
    return map[l] ?? l
  }

  return {
    formatNumber,
    formatHectares,
    formatPercent,
    formatDate,
    formatDepth,
    formatReefStatus,
    reefStatusBadgeClass,
    formatBleachingAlert,
    bleachingAlertBadgeClass,
    formatTier,
    tierBadgeClass,
    formatObservationType,
    formatObservationStatus,
    observationStatusBadgeClass,
    formatConflictIntensity,
    conflictIntensityBadgeClass,
    formatConflictStatus,
    formatProtection,
    formatThreat,
    kpiColor,
    kpiIconBg,
    formatIucn,
    iucnBadgeClass,
    formatNom059,
    formatKingdom,
    kingdomIcon,
    formatDiseaseSeverity,
    diseaseSeverityBadgeClass,
    formatDiseaseAgent,
    formatRestorationMethod,
    formatPolicyStatus,
    policyStatusBadgeClass,
    formatAudience,
    formatInvasiveSpecies,
    formatPhenologyType,
    phenologyIcon,
    formatCampaignType,
    formatProtocolTopic,
    formatProtocolLevel,
  }
}

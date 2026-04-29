import type { SocioEnvironmentalConflict } from '~/types'

// ============================================================================
// Atlas de conflictos socioambientales costeros (estilo EJAtlas)
// Cada caso documenta drivers, resistencia, comunidades afectadas y estatus.
// ============================================================================

export const conflicts: SocioEnvironmentalConflict[] = [
  {
    id: 1,
    title: 'Tren Maya y arrecifes del Caribe',
    summary:
      'Construcción del tramo 5 sur del Tren Maya sobre suelo kárstico afecta cenotes y aporte hídrico hacia arrecifes de Cozumel y Puerto Morelos.',
    fullStory:
      'En 2022 se modificó el trazo del Tramo 5 (Cancún–Tulum) para construirlo sobre superficie en lugar de elevado, atravesando un sistema kárstico interconectado con el acuífero costero. Académicos del CINVESTAV-Mérida y comunidades mayas advierten que la sedimentación y contaminantes pueden alcanzar el SAM vía descargas submarinas.',
    reefIds: [1, 2],
    state: 'Quintana Roo',
    threats: ['sedimentation', 'coastal_development', 'nutrient_pollution'],
    intensity: 'high',
    status: 'ongoing',
    affectedCommunities: ['Comunidades mayas de Tulum', 'Akumal', 'Pescadores de Puerto Morelos'],
    affectedSpecies: ['Acropora palmata', 'Acropora cervicornis', 'Orbicella spp.'],
    startedAt: '2022-04-01',
    updatedAt: '2026-03-15',
    drivers: ['FONATUR', 'concesiones turísticas', 'desarrollo inmobiliario'],
    resistance: ['Sélvame del Tren', 'CINVESTAV', 'comunidades mayas', 'amparos colectivos'],
    legalActions: ['Amparos 234/2022 y 456/2022', 'Suspensión definitiva otorgada y revocada'],
    mediaUrls: [
      'https://www.science.org/content/article/mexico-s-mayan-train-threatens-rainforest-and-cave-systems',
    ],
    contributorId: 1,
  },
  {
    id: 2,
    title: 'Cruceros en Cozumel: anclaje sobre arrecifes vivos',
    summary:
      'Navíos de cruceros fondean fuera de boyas autorizadas; reportes recurrentes de daño físico a colonias de Acropora palmata.',
    fullStory:
      'Cozumel recibe ~1,500 escalas de cruceros al año. Aunque existen muelles, en temporada alta o por mal tiempo algunos buques fondean fuera de las zonas designadas. Buzos locales han documentado cicatrices de cadenas en muros con Acropora palmata.',
    reefIds: [2],
    state: 'Quintana Roo',
    threats: ['cruise_anchoring', 'tourism_pressure'],
    intensity: 'high',
    status: 'ongoing',
    affectedCommunities: ['Buzos cooperativistas', 'Operadoras locales'],
    affectedSpecies: ['Acropora palmata'],
    startedAt: '2018-06-01',
    updatedAt: '2026-04-02',
    drivers: ['Industria de cruceros', 'concesiones portuarias'],
    resistance: ['Operadoras de buceo', 'CONANP Cozumel', 'Cozumel Reefs Foundation'],
    legalActions: ['Denuncias administrativas ante PROFEPA'],
    mediaUrls: [],
    contributorId: 2,
  },
  {
    id: 3,
    title: 'Desarrollo hotelero en Bahía Maguey, Huatulco',
    summary:
      'Concesión hotelera en Bahía Maguey con descargas residuales que afectan comunidades coralinas de Pocillopora.',
    fullStory:
      'Aunque Huatulco es ANP, la franja terrestre adyacente está bajo gestión FONATUR y las concesiones hoteleras crecen. Vecinos reportan descargas grises directas a la bahía y muerte de colonias coralinas en zonas antes prístinas.',
    reefIds: [10],
    state: 'Oaxaca',
    threats: ['nutrient_pollution', 'sedimentation', 'coastal_development'],
    intensity: 'medium',
    status: 'ongoing',
    affectedCommunities: ['Cooperativas pesqueras de Santa María Huatulco', 'Operadoras de buceo'],
    affectedSpecies: ['Pocillopora damicornis', 'Pocillopora verrucosa'],
    startedAt: '2021-09-15',
    updatedAt: '2026-02-10',
    drivers: ['FONATUR', 'cadenas hoteleras'],
    resistance: ['Bienes Comunales Huatulco', 'CMT Mazunte'],
    mediaUrls: [],
    contributorId: 6,
  },
  {
    id: 4,
    title: 'Sobrepesca dentro del Parque Nacional Isla Isabel',
    summary:
      'Flota mediana captura especies clave (huachinango, pargo) dentro del polígono ANP marina, sin vigilancia efectiva.',
    fullStory:
      'Los registros AIS de Global Fishing Watch muestran horas de pesca aparente dentro del polígono del PNII. Cooperativas locales ven reducidas las capturas y reportan invasiones de embarcaciones foráneas.',
    reefIds: [7],
    state: 'Nayarit',
    threats: ['overfishing', 'destructive_fishing'],
    intensity: 'high',
    status: 'ongoing',
    affectedCommunities: ['Cooperativas pesqueras Isla Isabel', 'San Blas'],
    startedAt: '2020-01-01',
    updatedAt: '2026-04-01',
    drivers: ['flota foránea', 'baja inspección naval'],
    resistance: ['CONANP', 'Cooperativa Isla Isabel', 'OAPN Pacífico'],
  },
  {
    id: 5,
    title: 'Sargazo masivo en el Caribe mexicano (2018–presente)',
    summary:
      'Recurrencias atípicas de sargazo pelágico (Sargassum natans/fluitans) generan anoxia costera y mortalidad bentónica.',
    fullStory:
      'Desde 2011 con pico en 2018, 2022 y 2023, arribazones masivas de sargazo cubren las playas del Caribe. La descomposición consume oxígeno y libera sulfhídrico, afectando arrecifes someros y pastos marinos. Origen ligado al "Cinturón Atlántico de Sargazo" y al aporte de nutrientes del Amazonas.',
    reefIds: [1, 2, 3, 5, 11],
    state: 'Quintana Roo',
    threats: ['sargassum', 'nutrient_pollution', 'thermal_stress'],
    intensity: 'critical',
    status: 'ongoing',
    affectedCommunities: ['Hoteleros del Caribe', 'cooperativas pesqueras', 'comunidades mayas'],
    affectedSpecies: ['Acropora palmata', 'Thalassia testudinum', 'pastos marinos'],
    startedAt: '2018-04-01',
    updatedAt: '2026-04-22',
    drivers: ['cambio climático', 'nutrientes Atlántico ecuatorial'],
    resistance: ['Marina Armada de México (cercos)', 'red sargassum monitoring UNAM'],
    mediaUrls: [
      'https://optics.marine.usf.edu/projects/saws.html',
    ],
    contributorId: 1,
  },
  {
    id: 6,
    title: 'Derrame de KMZ-310 frente a Cayos Arcas',
    summary:
      'Fuga en plataformas Pemex en sonda de Campeche; mancha de hidrocarburo riesgosa para arrecifes de Cayos Arcas.',
    fullStory:
      'En julio 2023 se documentó por sensores satelitales (S1 + S2) una pluma de hidrocarburo de >400 km² en la sonda de Campeche. Aunque no impactó directamente Cayos Arcas, la trayectoria de la corriente puso en alerta los arrecifes Triángulos, Bajo Nuevo y Cayo Arenas.',
    reefIds: [9],
    state: 'Campeche',
    threats: ['oil_spill', 'thermal_stress'],
    intensity: 'high',
    status: 'mitigating',
    affectedCommunities: ['Pesqueros de Ciudad del Carmen', 'CONANP Banco Campeche'],
    startedAt: '2023-07-08',
    updatedAt: '2025-09-30',
    drivers: ['Pemex Exploración y Producción'],
    resistance: ['CEMDA', 'Greenpeace México'],
    legalActions: ['Denuncia ante PROFEPA y ASEA'],
  },
]

import type { Observation } from '~/types'

// ============================================================================
// Mock observations — aportes validados de la red de colaboradores
// ============================================================================

export const observations: Observation[] = [
  {
    id: 1,
    reefId: 1,
    type: 'underwater_photo',
    title: 'SCTLD avanzando en colonias de Pseudodiploria strigosa',
    description:
      'Avistamiento de pérdida de tejido en 4 colonias del arrecife frontal a 8 m de profundidad. Banda blanca activa.',
    contributorId: 1,
    capturedAt: '2026-04-22',
    submittedAt: '2026-04-22T18:30:00Z',
    lat: 20.85,
    lng: -86.86,
    attachments: [
      { id: 1, kind: 'image', url: '/images/obs/sctld-pmorelos-1.jpg', caption: 'Colonia con banda blanca activa', mime: 'image/jpeg' },
      { id: 2, kind: 'image', url: '/images/obs/sctld-pmorelos-2.jpg', caption: 'Plano cercano del frente de mortalidad', mime: 'image/jpeg' },
    ],
    tags: ['SCTLD', 'enfermedad', 'mortalidad'],
    status: 'validated',
    reviewerId: 6,
    reviewerNotes: 'Identificación clara, fotos con escala. Aporta serie temporal.',
    validatedAt: '2026-04-23',
    qualityScore: 95,
  },
  {
    id: 2,
    reefId: 4,
    type: 'water_sample',
    title: 'Turbidez elevada tras descarga del Jamapa',
    description:
      'Muestreo de turbidez (NTU) en 3 puntos del PNSAV tras tormenta. Valores 18–24 NTU sobre arrecifes someros.',
    contributorId: 7,
    capturedAt: '2026-04-18',
    submittedAt: '2026-04-19T08:15:00Z',
    lat: 19.20,
    lng: -96.06,
    attachments: [
      { id: 3, kind: 'document', url: '/data/sav-turbidity-2026-04.csv', caption: 'Datos crudos NTU', mime: 'text/csv' },
    ],
    tags: ['sedimentación', 'PNSAV', 'turbidez'],
    status: 'validated',
    reviewerId: 1,
    reviewerNotes: 'Coordenadas y metodología consistentes.',
    validatedAt: '2026-04-20',
    qualityScore: 82,
  },
  {
    id: 3,
    reefId: 6,
    type: 'drone_flight',
    title: 'Mosaico aéreo Cabo Pulmo — abril 2026',
    description:
      'Vuelo de 12 hectáreas a 80 m AGL para mapeo de cobertura bentónica. Fotogrametría procesada con WebODM.',
    contributorId: 3,
    capturedAt: '2026-04-10',
    submittedAt: '2026-04-15T22:00:00Z',
    lat: 23.45,
    lng: -109.43,
    attachments: [
      { id: 4, kind: 'dataset', url: '/data/cabopulmo-ortho-2026-04.tif', caption: 'Ortomosaico GeoTIFF (8 cm/px)', mime: 'image/tiff' },
      { id: 5, kind: 'image', url: '/images/obs/cabopulmo-mosaic.jpg', caption: 'Vista preview del mosaico' },
    ],
    tags: ['drone', 'fotogrametría', 'Cabo Pulmo', 'cobertura'],
    status: 'validated',
    reviewerId: 1,
    reviewerNotes: 'Excelente resolución espacial. Apto para análisis multitemporal.',
    validatedAt: '2026-04-16',
    qualityScore: 91,
  },
  {
    id: 4,
    reefId: 2,
    type: 'community_report',
    title: 'Anclaje de yate en zona núcleo de Cozumel',
    description:
      'Reporte fotográfico de yate fondeado fuera de boyas. Posible daño por anclaje sobre Acropora palmata.',
    contributorId: 8,
    capturedAt: '2026-04-25',
    submittedAt: '2026-04-25T14:40:00Z',
    lat: 20.39,
    lng: -86.97,
    attachments: [
      { id: 6, kind: 'image', url: '/images/obs/anclaje-cozumel.jpg', caption: 'Embarcación fondeada' },
    ],
    tags: ['anclaje', 'Acropora', 'cumplimiento'],
    status: 'in_review',
  },
  {
    id: 5,
    reefId: 9,
    type: 'transect_survey',
    title: 'Transecto AGRRA — Alacranes (norte)',
    description:
      'Transecto de 30 m con metodología AGRRA. Cobertura coralina viva 26%. Dominancia de Orbicella.',
    contributorId: 1,
    capturedAt: '2026-03-28',
    submittedAt: '2026-04-05T10:00:00Z',
    lat: 22.46,
    lng: -89.67,
    attachments: [
      { id: 7, kind: 'document', url: '/data/alacranes-agrra-2026-03.pdf', caption: 'Reporte AGRRA' },
    ],
    tags: ['AGRRA', 'transecto', 'Alacranes'],
    status: 'validated',
    reviewerId: 6,
    reviewerNotes: 'Metodología documentada y reproducible.',
    validatedAt: '2026-04-07',
    qualityScore: 88,
  },
  {
    id: 6,
    reefId: 1,
    type: 'satellite_image',
    title: 'Sentinel-2 — Tinte sargazo cerca de Punta Brava',
    description:
      'Tile S2A_T16QDJ del 2026-04-26 con NDWI elevado y firma típica de mancha de sargazo a 1 km de costa.',
    contributorId: 4,
    capturedAt: '2026-04-26',
    submittedAt: '2026-04-27T07:20:00Z',
    lat: 20.86,
    lng: -86.84,
    attachments: [
      { id: 8, kind: 'image', url: '/images/obs/s2-sargazo-pmorelos.jpg', caption: 'Composite RGB con realce' },
    ],
    tags: ['sargazo', 'Sentinel-2', 'NDWI'],
    status: 'pending',
  },
]

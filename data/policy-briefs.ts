import type { PolicyBrief } from '~/types'

// Borradores de policy briefs por arrecife. Cada uno = 1 problema +
// evidencia + recomendaciones priorizadas + actor responsable + plazo.
// Cumplen el slogan: de los sensores a la política pública.

export const policyBriefs: PolicyBrief[] = [
  {
    id: 1,
    title: 'Frenar SCTLD en el Sistema Arrecifal Mesoamericano mexicano',
    slug: 'sctld-sam-mx',
    reefIds: [1, 2, 3, 5, 11],
    audience: ['conanp', 'semarnat', 'state_government'],
    summary:
      'SCTLD afectó >60% de las colonias de Orbicella en Cozumel en 6 años. Sin protocolo nacional, México pierde 8-12 especies clave del Caribe en una década.',
    problem:
      'La enfermedad SCTLD entró por Cozumel en 2018 y se expandió a todo el SAM mexicano, con casos confirmados en PNSAV y Alacranes en 2024. No existe un programa nacional con presupuesto asignado.',
    evidence: [
      'Cobertura coral de Orbicella faveolata: 24% (2018) → 9% (2024) en parcelas permanentes del PNAPM.',
      'Prevalencia SCTLD documentada en 7 de las 12 áreas monitoreadas (este observatorio, sep 2024).',
      '21 especies del Caribe susceptibles; 5 ya con tratamiento específico (amoxicilina pasta Base 2B).',
    ],
    recommendations: [
      'Establecer una Brigada Nacional de Respuesta SCTLD con presupuesto CONANP-SEMARNAT (≥ 18 MDP/año).',
      'Capacitar 200 buzos profesionales en protocolo de aplicación de pasta antibiótica.',
      'Habilitar viveros ex-situ de rescate genético para Dendrogyra cylindrus y Orbicella faveolata en CINVESTAV Mérida y ECOSUR Chetumal.',
      'Coordinar vigilancia regional con Belice y Guatemala vía MAR Fund.',
    ],
    responsibleActor: 'CONANP · SEMARNAT · Iniciativa Arrecifes Saludables',
    timeframe: 'Plan de acción inmediato (Q1 2027); presupuesto en PEF 2028.',
    status: 'published',
    publishedAt: '2025-03-15',
    authors: ['Observatorio de Arrecifes — México', 'CIIEMAD–IPN'],
    citation:
      'Observatorio de Arrecifes — México (2025). Frenar SCTLD en el SAM mexicano. CIIEMAD–IPN Policy Brief 1/2025.',
  },
  {
    id: 2,
    title: 'Cabo Pulmo: blindar el modelo de recuperación frente al desarrollo turístico',
    slug: 'cabo-pulmo-blindaje',
    reefIds: [6],
    audience: ['semarnat', 'state_government', 'sectur'],
    summary:
      'Cabo Pulmo recuperó 463% de su biomasa de peces tras 25 años como zona de no-pesca. Proyectos turísticos al norte (Cabo Cortés, Cabo Dorado) amenazan el éxito de conservación más documentado del Pacífico oriental.',
    problem:
      'La ANP carece de zona de amortiguamiento legal en tierra. Nuevos proyectos hoteleros recurrentes desde 2008.',
    evidence: [
      'Aburto-Oropeza et al. 2011 (PLoS ONE): biomasa peces aumentó 463% en 10 años post-decreto.',
      'Cobertura coral: 25% (2008) → 39% (2024) por restauración comunitaria.',
      'Cabo Pulmo recibe 14× más visitantes/ha que el promedio nacional de ANP marina.',
    ],
    recommendations: [
      'Decretar zona de amortiguamiento terrestre de 5 km alrededor del polígono marino.',
      'Vincular MIA-R (manifestación impacto ambiental regional) obligatoria para todo proyecto >50 ha.',
      'Establecer cuota máxima diaria de visitantes con monitoreo continuo de calidad ambiental.',
    ],
    responsibleActor: 'SEMARNAT · Gobierno BCS · CONANP',
    timeframe: 'Decreto en 12 meses; cuota de carga en 6 meses.',
    status: 'urgent',
    publishedAt: '2025-04-08',
    authors: ['Observatorio de Arrecifes — México'],
    citation:
      'Observatorio de Arrecifes — México (2025). Cabo Pulmo: blindar el modelo. CIIEMAD–IPN Policy Brief 2/2025.',
  },
  {
    id: 3,
    title: 'Calidad de agua en la Riviera Maya: regular el saneamiento como salvavidas del SAM',
    slug: 'aguas-residuales-rivera-maya',
    reefIds: [1, 2, 5, 11],
    audience: ['conanp', 'state_government', 'municipal', 'semarnat'],
    summary:
      'Descargas crónicas de aguas residuales sin tratamiento en Quintana Roo elevan nitrógeno y fósforo, favorecen macroalgas y debilitan la resistencia coralina a SCTLD y blanqueamiento.',
    problem:
      'Sólo 23% de las aguas residuales del corredor Cancún–Tulum reciben tratamiento secundario. El resto se infiltra al acuífero kárstico y emerge en ojos de agua y manantiales submarinos.',
    evidence: [
      'Hernández-Terrones et al. 2015: enriquecimiento de NO₃⁻ en submarine groundwater discharge frente a Puerto Morelos.',
      'Bunker et al. 2020: correlación δ¹⁵N en macroalgas con densidad poblacional costera.',
      'Cobertura macroalga: 6% (2005) → 31% (2024) en parcelas permanentes del PNAPM.',
    ],
    recommendations: [
      'Plan de cobertura 80% de saneamiento al 2030 en municipios costeros de QRoo.',
      'Cobro diferenciado por hotelería >100 cuartos según volumen de descarga real.',
      'Red de monitoreo continuo de N y P en bocas de ojos de agua y costa.',
    ],
    responsibleActor: 'CONAGUA · CAPA QRoo · SEMARNAT · municipios costeros',
    timeframe: 'Plan estatal en 18 meses; cobertura 80% al 2030.',
    status: 'draft',
    publishedAt: '2025-05-22',
    authors: ['Observatorio de Arrecifes — México'],
  },
  {
    id: 4,
    title: 'Veracruz: reducir aporte sedimentario al PNSAV mediante manejo del Río Jamapa',
    slug: 'pnsav-sedimentos-jamapa',
    reefIds: [4],
    audience: ['semarnat', 'state_government', 'community'],
    summary:
      'El PNSAV recibe pulsos de sedimento del Río Jamapa que reducen luz, sepultan corales y exacerban hipoxia. Manejo de la cuenca alta es palanca de mayor impacto.',
    problem:
      'Erosión por agricultura y urbanización en cuenca media-alta del Jamapa eleva turbidez en arrecifes someros del PNSAV.',
    evidence: [
      'Sentinel-2: turbidez normalizada subió 38% en zonas de Antón Lizardo entre 2017 y 2023.',
      'Cobertura coral: 12% (media histórica). Especies masivas resisten pero acropóridos prácticamente ausentes.',
    ],
    recommendations: [
      'Programa de restauración ribereña en cuenca media-alta del Jamapa (corredor de 15 m con vegetación nativa).',
      'Subsidio condicionado a productores agrícolas que adopten labranza de conservación.',
      'Red de boyas para monitoreo continuo de turbidez en arrecifes someros.',
    ],
    responsibleActor: 'SEMARNAT · CONAFOR · Gobierno Veracruz',
    timeframe: 'Plan piloto 2027 (1 microcuenca); escalado 2028-2030.',
    status: 'draft',
    publishedAt: '2025-06-10',
    authors: ['Observatorio de Arrecifes — México'],
  },
  {
    id: 5,
    title: 'Carga turística en Cozumel: cuota diaria basada en evidencia, no en política',
    slug: 'cozumel-carga-turistica',
    reefIds: [2],
    audience: ['conanp', 'sectur', 'municipal'],
    summary:
      'Cozumel recibe 4.2 M cruceristas/año. La carga de buceo en arrecifes específicos (Palancar, Colombia) supera el umbral de daño documentado.',
    problem:
      'Sin cuota diaria diferenciada por sitio, los 5 arrecifes más visitados concentran >70% de las inmersiones y muestran erosión mecánica + reducción de cobertura.',
    evidence: [
      'Davenport & Davenport 2006: umbral ≈ 5,000 buzos/sitio/año sin manejo activo.',
      'Operadores reportan >9,000 buzos/sitio/año en Palancar Bricks (2024).',
    ],
    recommendations: [
      'Cuota diaria por sitio con rotación entre arrecifes alternos.',
      'Distintivo "buzo responsable" con curso obligatorio antes de primera inmersión local.',
      'Cobro adicional al cruceristas no buceador con destino a fondo de restauración.',
    ],
    responsibleActor: 'CONANP Cozumel · municipio Cozumel · SECTUR',
    timeframe: 'Cuota piloto en 6 meses; revisión semestral.',
    status: 'draft',
    publishedAt: '2025-07-04',
    authors: ['Observatorio de Arrecifes — México'],
  },
]

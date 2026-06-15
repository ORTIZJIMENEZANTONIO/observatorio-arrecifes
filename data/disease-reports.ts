import type { DiseaseReport } from '~/types'

// SCTLD llegó a México por Cozumel en 2018 (Alvarez-Filip et al. 2019,
// PeerJ; Brandt et al. 2021, Sci. Rep.). En 4 años recorrió el SAM
// mexicano y golpeó Veracruz, Alacranes y Cabo Catoche. Estos reportes
// son una semilla representativa del avance observado.

export const diseaseReports: DiseaseReport[] = [
  {
    id: 1,
    reefId: 2, // Cozumel
    agent: 'sctld',
    speciesAffected: ['Orbicella faveolata', 'Orbicella annularis', 'Dendrogyra cylindrus', 'Pseudodiploria strigosa'],
    severity: 'epidemic',
    prevalence: 72,
    surveyMethod: 'belt_transect',
    interventions: ['amoxicillin_paste', 'ablation', 'fragment_rescue'],
    interventionTeam: 'CRC Cozumel · CONANP · Iniciativa Arrecifes Saludables',
    observedAt: '2024-09-12',
    depth: 12,
    notes:
      'Frente activo en la pared norte. Tratamiento con pasta Base 2B + amoxicilina aplicado a colonias clave de O. faveolata.',
  },
  {
    id: 2,
    reefId: 1, // Puerto Morelos
    agent: 'sctld',
    speciesAffected: ['Orbicella faveolata', 'Orbicella annularis', 'Colpophyllia natans'],
    severity: 'advanced',
    prevalence: 48,
    surveyMethod: 'belt_transect',
    interventions: ['amoxicillin_paste', 'monitoring_only'],
    interventionTeam: 'PNAPM CONANP · ICMyL-UNAM',
    observedAt: '2024-08-30',
    depth: 9,
    notes: 'Avance contenido en la zona arrecifal media. Programa permanente desde 2019.',
  },
  {
    id: 3,
    reefId: 3, // Banco Chinchorro
    agent: 'sctld',
    speciesAffected: ['Orbicella faveolata', 'Dendrogyra cylindrus'],
    severity: 'progressing',
    prevalence: 22,
    surveyMethod: 'roving',
    interventions: ['amoxicillin_paste', 'fragment_rescue'],
    interventionTeam: 'CONANP Reserva Biosfera · ECOSUR',
    observedAt: '2024-07-18',
    depth: 11,
    notes:
      'Detección tardía respecto al resto del SAM. Rescate de fragmentos sanos de D. cylindrus para vivero ex-situ.',
  },
  {
    id: 4,
    reefId: 5, // Xcalak
    agent: 'sctld',
    speciesAffected: ['Orbicella faveolata', 'Colpophyllia natans', 'Pseudodiploria strigosa'],
    severity: 'advanced',
    prevalence: 56,
    surveyMethod: 'photoquadrat',
    interventions: ['amoxicillin_paste', 'ablation', 'fragment_rescue'],
    interventionTeam: 'PN Arrecifes de Xcalak · Amigos de Sian Ka\'an',
    observedAt: '2024-06-22',
    depth: 8,
    notes: 'Mortalidad alta de M. cavernosa observada. Brigada comunitaria entrenada en aplicación de pasta.',
  },
  {
    id: 5,
    reefId: 4, // PNSAV
    agent: 'sctld',
    speciesAffected: ['Pseudodiploria strigosa', 'Colpophyllia natans', 'Orbicella faveolata'],
    severity: 'progressing',
    prevalence: 18,
    surveyMethod: 'belt_transect',
    interventions: ['monitoring_only'],
    interventionTeam: 'PNSAV CONANP · UVeracruzana',
    observedAt: '2024-10-05',
    depth: 10,
    notes:
      'Primer reporte verificado en el Sistema Arrecifal Veracruzano (octubre 2024). Activado protocolo de vigilancia mensual.',
  },
  {
    id: 6,
    reefId: 9, // Alacranes
    agent: 'sctld',
    speciesAffected: ['Orbicella faveolata', 'Pseudodiploria strigosa'],
    severity: 'incipient',
    prevalence: 4,
    surveyMethod: 'roving',
    interventions: ['monitoring_only'],
    interventionTeam: 'CONANP Yucatán · CINVESTAV Mérida',
    observedAt: '2024-09-28',
    depth: 14,
    notes: 'Casos aislados al norte del atolón. Frecuencia de muestreo aumentada a quincenal.',
  },
  {
    id: 7,
    reefId: 11, // Contoy
    agent: 'sctld',
    speciesAffected: ['Orbicella faveolata'],
    severity: 'incipient',
    prevalence: 6,
    surveyMethod: 'roving',
    interventions: ['monitoring_only'],
    interventionTeam: 'CONANP Contoy',
    observedAt: '2024-08-04',
    depth: 8,
    notes: 'Frente del Caribe norte. Coordinación con Puerto Morelos para tratamiento conjunto.',
  },
  {
    id: 8,
    reefId: 2,
    agent: 'white_band',
    speciesAffected: ['Acropora cervicornis', 'Acropora palmata'],
    severity: 'progressing',
    prevalence: 14,
    surveyMethod: 'belt_transect',
    interventions: ['fragment_rescue'],
    interventionTeam: 'CRC Cozumel',
    observedAt: '2024-05-11',
    depth: 6,
    notes: 'Coexiste con SCTLD; afecta principalmente colonias adultas de A. cervicornis.',
  },
]

export const reportsByReef = (reefId: number) =>
  diseaseReports.filter((r) => r.reefId === reefId)

export const sctldReports = diseaseReports.filter((r) => r.agent === 'sctld')

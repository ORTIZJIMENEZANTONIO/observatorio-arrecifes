import type { Protocol } from '~/types'

// Protocolos descargables curados desde fuentes establecidas: CoralWatch,
// AGRRA, NOAA BleachWatch, CDC SCTLD response. Los `fileUrl` apuntan a
// los originales mientras no haya un PDF traducido propio.

export const protocols: Protocol[] = [
  {
    id: 1,
    title: 'CoralWatch — tarjeta de salud coralina',
    description:
      'Colorímetro impreso para comparar la coloración de una colonia de coral con escalas estandarizadas. Detección temprana de blanqueamiento por cualquier buzo.',
    format: 'card',
    topic: 'bleaching',
    level: 'principiante',
    fileUrl: 'https://coralwatch.org/charts/',
    estimatedTime: '5 min/colonia',
    audience: ['citizen', 'diver', 'tour_operator', 'student'],
    authors: ['CoralWatch · University of Queensland'],
    language: 'bilingual',
    source: 'CoralWatch',
  },
  {
    id: 2,
    title: 'Reconocimiento visual de SCTLD',
    description:
      'Guía paso a paso para distinguir SCTLD de otras enfermedades coralinas del Caribe. 8 especies indicadoras + signos diagnósticos + cómo reportar.',
    format: 'pdf',
    topic: 'sctld',
    level: 'intermedio',
    fileUrl: 'https://www.agrra.org/coral-disease-outbreak/',
    estimatedTime: '30 min lectura + práctica',
    audience: ['diver', 'researcher', 'tour_operator'],
    authors: ['AGRRA Disease Working Group', 'CDC SCTLD Response Network'],
    language: 'bilingual',
    source: 'AGRRA',
  },
  {
    id: 3,
    title: 'AGRRA · Transecto rápido del estado arrecifal',
    description:
      'Protocolo de referencia para evaluación rápida (Rapid Ecological Assessment) en arrecifes mesoamericanos. Cobertura, peces, enfermedad coralina, sustrato.',
    format: 'pdf',
    topic: 'transect',
    level: 'avanzado',
    fileUrl: 'https://www.agrra.org/coral-reef-monitoring/',
    estimatedTime: '1 día de campo',
    audience: ['researcher', 'student'],
    authors: ['Atlantic and Gulf Rapid Reef Assessment'],
    language: 'bilingual',
    source: 'AGRRA',
  },
  {
    id: 4,
    title: 'Captura responsable de pez león',
    description:
      'Procedimiento seguro de extracción con jamo, evisceración y registro de datos biológicos. Incluye seguridad para el buzo (toxicidad).',
    format: 'pdf',
    topic: 'lionfish',
    level: 'intermedio',
    estimatedTime: '20 min',
    audience: ['fisher', 'diver', 'tour_operator'],
    authors: ['Reef Environmental Education Foundation', 'CONANP'],
    language: 'es',
    source: 'REEF · CONANP',
  },
  {
    id: 5,
    title: 'Reporte de arribazón de sargazo',
    description:
      'Cómo cuantificar y reportar acumulación de Sargassum en playas. Densidad por m², extensión lineal, fotos georeferenciadas.',
    format: 'webform',
    topic: 'sargasso',
    level: 'principiante',
    estimatedTime: '10 min',
    audience: ['citizen', 'tour_operator', 'fisher'],
    authors: ['Observatorio de Arrecifes · MARN'],
    language: 'es',
  },
  {
    id: 6,
    title: 'Foto-cuadrante para cobertura bentónica',
    description:
      'Estandarización de imágenes 50×50 cm para análisis con CoralNet o PointCount. Cámara, plomada, escala color, georeferenciación.',
    format: 'pdf',
    topic: 'photoquadrat',
    level: 'avanzado',
    fileUrl: 'https://coralnet.ucsd.edu/source/',
    estimatedTime: '15 min/sitio',
    audience: ['researcher', 'student'],
    authors: ['CoralNet · NOAA NCRMP'],
    language: 'bilingual',
    source: 'CoralNet',
  },
  {
    id: 7,
    title: 'Identificación rápida — corales formadores del SAM',
    description:
      '14 especies clave del Caribe mexicano con fotos macro, hábitat, profundidad y rasgo distintivo.',
    format: 'pdf',
    topic: 'identification',
    level: 'principiante',
    estimatedTime: '45 min',
    audience: ['citizen', 'diver', 'tour_operator', 'student'],
    authors: ['Observatorio de Arrecifes — México'],
    language: 'es',
  },
  {
    id: 8,
    title: 'Toma de muestra de agua en arrecife',
    description:
      'Procedimiento estándar para muestras de N, P, clorofila y bacterias. Cadena de custodia para envío a laboratorio.',
    format: 'manual',
    topic: 'water_quality',
    level: 'avanzado',
    estimatedTime: '40 min/sitio',
    audience: ['researcher', 'student'],
    authors: ['ICMyL-UNAM Puerto Morelos'],
    language: 'es',
  },
  {
    id: 9,
    title: 'Ética del aporte ciudadano',
    description:
      'Buenas prácticas, consentimiento, anonimato, propiedad intelectual y manejo de datos sensibles (sitios de fauna amenazada).',
    format: 'pdf',
    topic: 'ethics',
    level: 'principiante',
    estimatedTime: '15 min',
    audience: ['citizen', 'researcher', 'diver', 'fisher'],
    authors: ['Observatorio de Arrecifes — México'],
    language: 'es',
  },
]

export const byTopic = (topic: Protocol['topic']) =>
  protocols.filter((p) => p.topic === topic)

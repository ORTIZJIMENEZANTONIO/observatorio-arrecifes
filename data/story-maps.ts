import type { StoryMap } from '~/types'

// Narrativas guiadas por caso. Cada storymap es un scroll-driven con
// secciones que activan capas y/o hacen zoom a arrecifes específicos.

export const storyMaps: StoryMap[] = [
  {
    id: 1,
    slug: 'sctld-cozumel',
    title: 'SCTLD en Cozumel: anatomía de una epidemia',
    subtitle:
      'Cómo una enfermedad coralina sin agente conocido recorrió 1 200 km de arrecife en 6 años y qué se hizo (y no se hizo) para frenarla.',
    cover: '/images/reefs/cozumel.jpg',
    coverCredit: 'Unsplash',
    authors: ['Observatorio de Arrecifes — México'],
    publishedAt: '2026-04-12',
    estimatedMinutes: 7,
    topic: 'sctld',
    reefIds: [2, 1, 3, 5, 11],
    sections: [
      {
        heading: 'Punto cero: enero 2018',
        body:
          'Buzos de la cooperativa de Cozumel reportan colonias de Orbicella faveolata con tejido necrosado de avance rápido. El patrón visual no corresponde a las enfermedades conocidas del Caribe.',
        year: 2018,
        reefIds: [2],
      },
      {
        heading: 'Expansión norte y sur',
        body:
          'En 8 meses la enfermedad alcanza Puerto Morelos y Banco Chinchorro. El SCTLD ya había sido descrito en Florida desde 2014 — su origen mexicano se confirma por análisis molecular en 2019.',
        year: 2019,
        reefIds: [1, 3],
      },
      {
        heading: 'Respuesta: pasta antibiótica',
        body:
          'Equipos locales adaptan el protocolo CDC de Base 2B + amoxicilina. CRC Cozumel y PNAPM tratan 1 800 colonias en 2020 con tasa de detención >70%.',
        year: 2020,
        reefIds: [1, 2],
      },
      {
        heading: 'Llegada al Golfo (2024)',
        body:
          'Octubre de 2024: primer reporte verificado en el Sistema Arrecifal Veracruzano. La distancia geográfica sugiere transporte por corrientes y/o vectores antrópicos (sedimentos en cascos de buques).',
        year: 2024,
        reefIds: [4],
      },
      {
        heading: 'Qué falta',
        body:
          'Una brigada nacional con presupuesto plurianual, viveros ex-situ de rescate genético y un sistema de vigilancia regional con Belice y Guatemala. La ciencia ya está; la decisión de política no.',
        reefIds: [1, 2, 3, 4, 5, 11],
      },
    ],
  },
  {
    id: 2,
    slug: 'cabo-pulmo-recuperacion',
    title: 'Cabo Pulmo: la zona de no-pesca que cambió todo',
    subtitle:
      '25 años de cierre pesquero comunitario y una recuperación documentada del 463% en biomasa de peces. El caso de éxito más citado del Pacífico oriental.',
    cover: '/images/reefs/cabo-pulmo.jpg',
    coverCredit: 'Unsplash',
    authors: ['Observatorio de Arrecifes — México'],
    publishedAt: '2026-05-18',
    estimatedMinutes: 6,
    topic: 'restoration',
    reefIds: [6],
    sections: [
      {
        heading: 'Antes del decreto: 1995',
        body:
          'Los pescadores de Cabo Pulmo observan caída sostenida de capturas. La comunidad solicita el cierre voluntario y, en 1995, el decreto del Parque Nacional Cabo Pulmo.',
        year: 1995,
      },
      {
        heading: 'La medida con evidencia',
        body:
          'Aburto-Oropeza et al. (2011) publican en PLoS ONE el aumento de 463% en biomasa de peces en 10 años — el incremento más alto reportado en un AMP del mundo.',
        year: 2011,
      },
      {
        heading: 'Restauración coralina',
        body:
          'Tras blanqueamiento 2014-15, la comunidad inicia un programa de restauración de Pocillopora damicornis. Cobertura coralina pasa de 25% a 39% en 8 años.',
        year: 2024,
      },
      {
        heading: 'Amenaza turística',
        body:
          'Proyectos hoteleros recurrentes al norte del polígono ponen en riesgo el éxito. Sin zona de amortiguamiento legal, la presión seguirá.',
        reefIds: [6],
      },
    ],
  },
  {
    id: 3,
    slug: 'sargazo-rivera-maya',
    title: 'Sargazo y la deuda del saneamiento',
    subtitle:
      'No es sólo un problema de turismo: el sargazo en descomposición y las aguas residuales costeras se potencian sobre el arrecife.',
    cover: '/images/reefs/puerto-morelos.jpg',
    coverCredit: 'Unsplash',
    authors: ['Observatorio de Arrecifes — México'],
    publishedAt: '2026-06-22',
    estimatedMinutes: 5,
    topic: 'policy',
    reefIds: [1, 2, 11],
    sections: [
      {
        heading: 'Origen lejano, impacto local',
        body:
          'El sargazo pelágico se forma en el Atlántico ecuatorial (NERR) y arriba al Caribe mexicano cada año desde 2011 con biomasas crecientes (Wang et al. 2019, Science).',
      },
      {
        heading: 'Lo que pasa al llegar',
        body:
          'En descomposición libera sulfuro de hidrógeno, baja oxígeno disuelto y aporta nutrientes a la zona costera. Sobre arrecifes ya estresados, es el último empujón.',
      },
      {
        heading: 'La deuda invisible',
        body:
          'Solo 23% de las aguas residuales del corredor Cancún-Tulum tienen tratamiento secundario. El resto se filtra al acuífero kárstico y emerge en ojos de agua frente al arrecife.',
      },
      {
        heading: 'Lo que se puede hacer mañana',
        body:
          'Cobro diferenciado por hotelería >100 cuartos, red de monitoreo continuo de N y P, plan estatal de cobertura 80% al 2030. Es política pública, no ciencia básica.',
      },
    ],
  },
]

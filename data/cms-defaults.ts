// CMS defaults — copy actualmente hard-coded en las páginas públicas, expuesto
// como fuente de verdad para el editor `/admin/contenido` y como fallback en
// caso de que el backend no haya aún sembrado las secciones.
//
// Estructura: pageDefaults[pageSlug][sectionKey] = items[]
// El admin guarda en `obs_cms_sections` vía `PUT /admin/cms/:pageSlug/:sectionKey`
// y la página pública lee con `useCmsStore().getSection(page, key, fallback)`.

export type CmsItem = Record<string, unknown>

export const cmsDefaults: Record<string, Record<string, CmsItem[]>> = {
  // ───────────────────────── HOME ─────────────────────────
  home: {
    hero: [
      {
        eyebrow: 'Datos en tiempo casi real · NOAA · NASA · ESA',
        titleLine1: 'Observatorio',
        titleLine2Prefix: 'de',
        titleLine2Highlight: 'Arrecifes Vivos',
        titleLine3: 'de México',
        subtitle:
          'Una plataforma viva. Mapas satelitales actualizados a diario, capas abiertas descargables y una red verificada de pescadores, buzos, comunidades costeras y científicos que documentan lo que pasa bajo el agua.',
        primaryLabel: 'Abrir mapa vivo',
        primaryTo: '/livemap',
        secondaryLabel: 'Contribuir',
        secondaryTo: '/contribute',
      },
    ],
    features: [
      {
        icon: 'lucide:satellite',
        title: 'Datos satelitales casi en tiempo real',
        description:
          'NOAA Coral Reef Watch (DHW, alertas de blanqueamiento), NASA MODIS/PACE (SST, clorofila), ESA Sentinel-2 (10 m), USGS Landsat. Reproyectados sobre la línea costera mexicana.',
        linkLabel: 'Abrir mapa',
        linkTo: '/livemap',
        accent: 'primary',
      },
      {
        icon: 'lucide:alert-triangle',
        title: 'Atlas de conflictos socioambientales',
        description:
          'Quién impulsa, quién resiste, qué especies se afectan. Casos documentados de cruceros, sargazo, derrames, sobrepesca y desarrollo costero — con evidencia.',
        linkLabel: 'Ver atlas',
        linkTo: '/atlas',
        accent: 'coral',
      },
      {
        icon: 'lucide:users',
        title: 'Red verificada de colaboradores',
        description:
          'Pescadores, buzos, investigadoras, comunidades costeras. Sistema de reputación tipo marketplace: bronce → coral según aportes validados, calidad y consistencia.',
        linkLabel: 'Ver red',
        linkTo: '/contributors',
        accent: 'eco',
      },
    ],
    sectionTitle: [
      {
        eyebrow: '¿Qué hay aquí?',
        title: 'Una plataforma viva, no un reporte estático',
        subtitle:
          'Inspirada en Allen Coral Atlas (mapas satelitales globales) y EJAtlas (cartografía de conflictos socioambientales). Pensada para México, en español y desde lo costero.',
      },
    ],
    alerts: [
      {
        eyebrow: 'Últimas 72 h',
        title: 'Alertas activas',
        subtitle: 'NOAA Coral Reef Watch · 5 km · actualizado diariamente.',
        linkLabel: 'Ver mapa de alertas',
        linkTo: '/livemap?layer=noaa-crw-bleaching-alert',
      },
    ],
    contributorsTeaser: [
      {
        eyebrow: 'Comunidad',
        title: 'Top colaboradores',
        subtitle: 'Reputación basada en aportes validados, calidad y consistencia.',
        linkLabel: 'Ver todos',
        linkTo: '/contributors',
      },
    ],
    cta: [
      {
        title: '¿Vives, buceas o investigas en la costa?',
        description:
          'Sumate a la red. Aporta fotos, vuelos de dron, transectos o reportes de problemáticas. Un equipo revisa cada aporte y construyes tu reputación con cada validación.',
        primaryLabel: 'Contribuir',
        primaryTo: '/contribute',
        secondaryLabel: 'Cómo funciona',
        secondaryTo: '/about',
      },
    ],
  },

  // ───────────────────────── ABOUT ─────────────────────────
  about: {
    hero: [
      {
        eyebrow: 'Sobre el observatorio',
        title: 'Una plataforma viva, abierta y verificada',
        subtitle:
          'De los sensores a la política pública: monitoreo participativo y de alta frecuencia para la conservación de arrecifes.',
      },
    ],
    mission: [
      {
        heading: 'Misión',
        body:
          'Generar y comunicar evidencia científica y datos en tiempo real sobre el estado de los arrecifes de coral, para informar la toma de decisiones públicas, la gestión costera y la educación ambiental, con un enfoque en la reducción de brechas entre ciencia, política y comunidades locales.',
      },
    ],
    vision: [
      {
        heading: 'Visión',
        body:
          'Ser un referente regional en el monitoreo participativo y de alta frecuencia de arrecifes, donde los datos abiertos, la colaboración interdisciplinaria y la incidencia en políticas públicas contribuyan a la resiliencia de los ecosistemas marinos frente al cambio global.',
      },
    ],
    objective: [
      {
        heading: 'Objetivo',
        body:
          'Implementar y operar un sistema de monitoreo en tiempo real de variables clave del estado de arrecifes, integrando sensores remotos, datos satelitales y ciencia ciudadana, para proveer alertas tempranas, tendencias y recomendaciones de política a actores locales, nacionales e internacionales.',
      },
    ],
    inspirations: [
      { title: 'Allen Coral Atlas', description: 'Mapas globales de hábitat bentónico a 5 m con monitoreo de blanqueamiento.' },
      { title: 'EJAtlas', description: 'Cartografía global de conflictos socioambientales con perspectiva de justicia ambiental.' },
      { title: 'NOAA Coral Reef Watch', description: 'Alertas operacionales de estrés térmico.' },
      { title: 'CONABIO Geoportal', description: 'Capas oficiales de México (ANP, arrecifes coralinos).' },
    ],
    sources: [
      { title: 'Datos satelitales operacionales', description: 'NOAA CRW, NASA OB.DAAC, ESA Copernicus, USGS.' },
      { title: 'Bases académicas indexadas', description: 'Web of Science, Scopus, SciELO, Redalyc.' },
      { title: 'Fuentes institucionales mexicanas', description: 'CONANP, CONABIO, INEGI, SEMARNAT.' },
      { title: 'Aportes de la red', description: 'Validados por revisores con perfil verificado.' },
      { title: 'Prensa y comunicados', description: 'Solo como complemento, nunca como fuente primaria.' },
    ],
    team: [
      {
        name: 'Samantha L. Martínez Caballero',
        role: 'Investigadora responsable · Bióloga marina',
        credentials:
          'Bióloga marina por la Universidad del Mar y Maestra en Ciencias en Estudios Ambientales y de Sustentabilidad por el IPN. Actualmente cursa el Doctorado en Ciencias en Estudios Ambientales y de Sustentabilidad en la misma institución.',
        bio:
          'Los arrecifes coralinos me enseñaron que la salud de un ecosistema no se puede separar de la vida de quienes lo habitan, tanto en el mundo submarino como en el terrestre. Mi investigación no solo mide corales: escucha comunidades, lee políticas públicas y dibuja mapas que cuentan historias de dependencia y esperanza como un todo: un sistema socioecológico.\n\nBusco generar evidencia disponible para todos que oriente decisiones hacia la sustentabilidad, porque la ciencia que no se comparte, no transforma. El análisis espacial es mi forma de traducir lo que sucede en el mundo marino en decisiones que lo protejan. Hago ciencia porque creo que aún estamos a tiempo de aprender a querer bonito a la mar.',
      },
    ],
    mediaCoverageIntro: [
      {
        heading: 'En medios',
        body: 'El trabajo del observatorio y su equipo ha sido difundido en medios especializados de ciencia y medio ambiente.',
      },
    ],
    mediaCoverage: [
      { label: 'Mongabay', href: 'https://es.mongabay.com' },
      { label: 'Eos', href: 'https://eos.org' },
      { label: 'The Conversation', href: 'https://theconversation.com' },
    ],
    reputationIntro: [
      {
        heading: 'Sistema de reputación',
        body:
          'Inspirado en plataformas como Mercado Libre o Rappi: tu rango sube con cada aporte validado, ponderando calidad y consistencia, no solo volumen.',
      },
    ],
    validation: [
      { title: 'Envío con metadatos', description: 'El aporte se envía con metadatos (ubicación, fecha, tipo, adjuntos).' },
      { title: 'Evaluación', description: 'Un revisor con permiso review_submissions lo evalúa: ubicación coherente, metadata consistente, calidad técnica.' },
      { title: 'Calidad 0–100', description: 'El revisor asigna calidad 0–100 y publica/rechaza con notas.' },
      { title: 'Iteración', description: 'Si la rechaza, el autor puede corregir y reenviar.' },
      { title: 'Publicación', description: 'Una vez validado, el aporte aparece público con crédito y suma puntos al autor.' },
    ],
    licenses: [
      {
        heading: 'Licencias y atribución',
        body:
          'Cada capa preserva su licencia original. Los datos NOAA y NASA son de dominio público; ESA Copernicus se redistribuye bajo Copernicus Open Data; Allen Coral Atlas y CONABIO requieren atribución (CC BY 4.0); Global Fishing Watch CC BY-NC 4.0. El código del observatorio se libera bajo Apache 2.0.',
      },
    ],
    contact: [
      {
        heading: 'Contacto',
        body:
          'Escríbenos para sumarte como institución, ONG, cooperativa pesquera o universidad. Los aportes individuales pasan por la página de contribuir.',
      },
    ],
  },

  // ───────────────────────── CONTRIBUTE ─────────────────────────
  contribute: {
    hero: [
      {
        eyebrow: 'Contribuir',
        title: 'Aporta a la plataforma',
        subtitle:
          'Comparte fotos submarinas, vuelos de dron, transectos, muestras o reportes de problemáticas costeras. Un equipo revisa cada aporte; al validarse construyes tu reputación.',
      },
    ],
    sidebar: [
      {
        title: '¿Por qué validamos?',
        body:
          'Los datos que afectan políticas públicas y comunidades costeras requieren rigor. La validación protege a la red y a quienes consultan los datos.',
      },
      {
        title: 'Buenas prácticas',
        body:
          'Incluye metadata de cámara/dron (EXIF). Documenta la metodología (transecto, profundidad). Evita imágenes con localización precisa de fauna sensible. Cita la fuente si es de un satélite (NASA, ESA, etc.).',
      },
      {
        title: 'Privacidad',
        body:
          'Para reportes de conflictos puedes solicitar anonimato. Tu aporte se publica con la indicación "Anónimo verificado".',
      },
    ],
    notice: [
      {
        body:
          'Tu aporte entrará en cola de revisión. Un revisor del equipo verifica metadatos, ubicación y calidad. Cuando se valida, tu reputación sube y el aporte aparece público con tu crédito.',
      },
    ],
  },

  // ───────────────────────── PÁGINAS CON SOLO HERO ─────────────────────────
  inventory: {
    hero: [
      {
        eyebrow: 'Inventario',
        title: 'Arrecifes monitoreados',
        subtitle:
          '{count} arrecifes coralinos documentados en el Pacífico, Golfo de México y Caribe mexicano. Datos consolidados de CONANP, CONABIO, Allen Coral Atlas y literatura académica.',
      },
    ],
  },
  atlas: {
    hero: [
      {
        eyebrow: 'Atlas',
        title: 'Conflictos socioambientales costeros',
        subtitle:
          'Inspirado en EJAtlas. Cada caso documenta quién impulsa la presión, quién resiste, qué arrecifes y comunidades se afectan. Evidencia abierta y verificable.',
      },
    ],
  },
  'data-sources': {
    hero: [
      {
        eyebrow: 'Capas y datos',
        title: 'Datos abiertos. Atribución obligatoria.',
        subtitle:
          'Catálogo de capas satelitales y geoespaciales. Cada capa conserva su licencia y cita original. Descarga libre con crédito a la fuente.',
      },
    ],
  },
  contributors: {
    hero: [
      {
        eyebrow: 'Red de colaboradores',
        title: 'Quienes alimentan la plataforma',
        subtitle:
          'Pescadores, buzos, investigadoras, comunidades costeras. Sistema de reputación inspirado en marketplaces: tu rango sube con cada aporte validado.',
      },
    ],
    modesIntro: [
      {
        eyebrow: 'Cinco maneras de aportar',
        title: '5 maneras de cuidar el mismo arrecife',
        subtitle:
          'No es una escalera. Es una red horizontal: cada modo aporta saber distinto al monitoreo. Nadie reemplaza a nadie — se complementan.',
      },
    ],
    networkCallout: [
      {
        heading: 'Red, no escalera',
        body:
          'Los modos no son niveles que se escalan. Son maneras distintas de aportar al mismo objetivo: cuidar los arrecifes mexicanos. Tu modo se asigna automáticamente según tu trayectoria — y no hay un "modo mejor" que otro.',
      },
    ],
    cta: [
      {
        title: '¿Quieres formar parte de la red?',
        description:
          'Si vives, pescas, buceas o investigas en la costa mexicana, tu observación cuenta. Suma tu aporte y crece junto a la red.',
        primaryLabel: 'Cómo participar',
        primaryTo: '/contribute',
        secondaryLabel: 'Sobre el observatorio',
        secondaryTo: '/about',
      },
    ],
  },
  noticias: {
    hero: [
      {
        eyebrow: 'Editorial',
        title: 'Noticias del observatorio',
        subtitle:
          'Análisis, recopilación de prensa y notas de campo sobre arrecifes mexicanos. Cada nota cita su fuente original.',
      },
    ],
  },
  observations: {
    hero: [
      {
        eyebrow: 'Aportes de la red',
        title: 'Observaciones recientes',
        subtitle:
          'Fotografías submarinas, vuelos de dron, transectos, muestreos y reportes ciudadanos. Cada aporte se etiqueta con su estado de validación y crédito al autor.',
      },
    ],
  },

  // ───────────────────────── SALUD HUB ─────────────────────────
  salud: {
    hero: [
      {
        eyebrow: 'Salud del arrecife',
        title: 'Tablero integrado del estado del arrecife',
        subtitle:
          'Enfermedad, térmico, restauración, especies clave, invasoras y sargazo. Una sola lectura por arrecife, vinculada a la red y a recomendaciones de política.',
      },
    ],
  },
  'salud-sctld': {
    hero: [
      {
        eyebrow: 'Enfermedad SCTLD',
        title: 'Pérdida de tejido coralino — SCTLD',
        subtitle:
          'Reportes verificados de la enfermedad coralina más extensa documentada en el Caribe en décadas. Llegó a México por Cozumel en 2018 y está reescribiendo el SAM.',
      },
    ],
  },
  'salud-blanqueamiento': {
    hero: [
      {
        eyebrow: 'Estrés térmico',
        title: 'Vigilancia de blanqueamiento',
        subtitle:
          'DHW, SST y nivel de alerta NOAA Coral Reef Watch por arrecife mexicano. Actualización casi diaria a 5 km de resolución.',
      },
    ],
  },
  'salud-restauracion': {
    hero: [
      {
        eyebrow: 'Restauración coralina',
        title: 'Viveros y transplante en operación',
        subtitle:
          'Programas activos en CRC Cozumel, Oceanus AC, Xcalak, PNSAV, ECOSUR Chetumal, Cabo Pulmo y Huatulco. Métodos, especies, supervivencia.',
      },
    ],
  },
  'salud-especies': {
    hero: [
      {
        eyebrow: 'Catálogo',
        title: 'Especies clave del arrecife mexicano',
        subtitle:
          'Corales formadores, peces estructurantes y megafauna documentada con estatus IUCN, NOM-059 y rol ecológico.',
      },
    ],
  },
  'salud-invasoras': {
    hero: [
      {
        eyebrow: 'Especies invasoras',
        title: 'Control del pez león y otras invasoras',
        subtitle:
          'Densidad, capturas y esfuerzo de jornadas coordinadas por cooperativas pesqueras y CONANP en el Caribe mexicano.',
      },
    ],
  },
  'salud-sargazo': {
    hero: [
      {
        eyebrow: 'Calidad de agua costera',
        title: 'Sargazo: arribazón e impacto cruzado',
        subtitle:
          'Origen en el Atlántico ecuatorial, picos abril-agosto. Interacción con descargas residuales y efecto sobre cobertura coralina.',
      },
    ],
  },

  // ───────────────────────── POLÍTICA / CIENCIA ─────────────────────────
  policy: {
    hero: [
      {
        eyebrow: 'De los sensores a la política',
        title: 'Policy briefs por arrecife',
        subtitle:
          'Documentos ejecutivos 2-3 páginas con problema, evidencia, recomendaciones priorizadas y actor responsable. Listos para enviarse y citarse.',
      },
    ],
  },
  protocolos: {
    hero: [
      {
        eyebrow: 'Guías y protocolos',
        title: 'Cómo monitorear el arrecife',
        subtitle:
          'CoralWatch, AGRRA, BleachWatch y protocolos locales: descarga y úsalos en campo. Pensado para buzos, pescadoras, comunidades y equipos académicos.',
      },
    ],
  },
  citar: {
    hero: [
      {
        eyebrow: 'Cómo citar',
        title: 'Reproducible, abierto, citable',
        subtitle:
          'APA y BibTeX listos para copiar. Cada policy brief y capa preserva su cita original; aquí está la del observatorio como compilador.',
      },
    ],
  },
  calendario: {
    hero: [
      {
        eyebrow: 'Eventos vivos',
        title: 'Campañas, torneos, talleres y ferias',
        subtitle:
          'Monitoreos coordinados, capacitación, restauración, control de pez león y eventos públicos del observatorio y sus aliados.',
      },
    ],
  },
  fenologia: {
    hero: [
      {
        eyebrow: 'Calendario fenológico',
        title: 'Cuándo pasa qué en el arrecife',
        subtitle:
          'Desoves, agregaciones de mero, anidación de tortugas, ventana de blanqueamiento y picos de sargazo. La rueda del año marítimo mexicano.',
      },
    ],
  },
  comparador: {
    hero: [
      {
        eyebrow: 'Comparador',
        title: 'Hasta tres arrecifes lado a lado',
        subtitle:
          'Cobertura coral, superficie, profundidad, protección, especies, restauración y presión acumulada. Para identificar diferencias o paralelos.',
      },
    ],
  },
  presiones: {
    hero: [
      {
        eyebrow: 'Índice multi-amenaza',
        title: 'Presiones acumuladas por arrecife',
        subtitle:
          'Ocho dimensiones (térmico, enfermedad, pesca, turismo, desarrollo, sargazo, contaminación, huracanes) en un sólo ranking nacional, estilo Halpern et al.',
      },
    ],
  },
  huracanes: {
    hero: [
      {
        eyebrow: 'Memoria del impacto',
        title: 'Huracanes que reescribieron arrecifes',
        subtitle:
          'Gilbert (1988), Wilma (2005), Dean (2007), Patricia (2015), Delta (2020) y otros. Trayectorias, sitios golpeados y tiempos de recuperación documentados.',
      },
    ],
  },
  historias: {
    hero: [
      {
        eyebrow: 'Storytelling',
        title: 'Historias guiadas del arrecife mexicano',
        subtitle:
          'Casos narrados con datos, mapas y voces de comunidad. SCTLD en Cozumel, recuperación de Cabo Pulmo, deuda del saneamiento en Riviera Maya.',
      },
    ],
  },

  // ───────────────────────── FOOTER ─────────────────────────
  footer: {
    brand: [
      {
        title: 'Observatorio de Arrecifes',
        subtitle: 'México · Vivo',
        description:
          'Plataforma viva de monitoreo de arrecifes coralinos de México. Datos satelitales abiertos de NASA, NOAA, ESA Copernicus y CONABIO. Conocimiento ciudadano y científico validado.',
      },
    ],
    attribution: [
      {
        eyebrow: 'Atribución obligatoria',
        body:
          'Todas las capas descargables conservan su licencia y atribución original. Ver la sección de capas y datos para citas.',
      },
    ],
    sources: [
      { label: 'NOAA Coral Reef Watch', href: 'https://coralreefwatch.noaa.gov' },
      { label: 'NASA OB.DAAC', href: 'https://oceancolor.gsfc.nasa.gov' },
      { label: 'ESA Copernicus', href: 'https://dataspace.copernicus.eu' },
      { label: 'CONABIO Geoportal', href: 'http://geoportal.conabio.gob.mx' },
      { label: 'Allen Coral Atlas', href: 'https://allencoralatlas.org' },
    ],
    quickLinks: [
      { label: 'Mapa vivo', to: '/livemap' },
      { label: 'Arrecifes', to: '/inventory' },
      { label: 'Atlas de conflictos', to: '/atlas' },
      { label: 'Capas y datos abiertos', to: '/data-sources' },
      { label: 'Comunidad', to: '/contributors' },
      { label: 'Observaciones recientes', to: '/observations' },
      { label: 'Contribuir', to: '/contribute' },
      { label: 'Sobre el observatorio', to: '/about' },
    ],
    institutional: [
      {
        body:
          'Iniciativa del CIIEMAD — Centro Interdisciplinario de Investigaciones y Estudios sobre Medio Ambiente y Desarrollo, Instituto Politécnico Nacional.',
        copyright: '© 2026 Observatorio de Arrecifes — México. Plataforma de datos abiertos. Licencia de software Apache 2.0.',
      },
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// Catálogo de páginas/secciones para el admin (/admin/contenido)
// El editor itera sobre PAGE_CATALOG y muestra cada sección con sus campos
// editables. Los campos vienen del primer item del default — así si añades un
// campo nuevo en `cmsDefaults`, el form se actualiza automáticamente.

export interface CmsPageMeta {
  slug: string
  title: string
  description: string
  preview: string  // ruta pública para "Ver página"
  icon: string     // icono lucide para el index
  sections: { key: string; label: string; help?: string }[]
}

export const cmsPageCatalog: CmsPageMeta[] = [
  {
    slug: 'home',
    title: 'Inicio',
    description: 'Hero, features, alertas y CTA final del home.',
    preview: '/',
    icon: 'lucide:home',
    sections: [
      { key: 'hero', label: 'Hero principal', help: 'Encabezado del observatorio (título, subtítulo, botones).' },
      { key: 'features', label: 'Features (3 tarjetas)', help: 'Cards de "Qué hay aquí". Una por bloque.' },
      { key: 'sectionTitle', label: 'Encabezado de features', help: 'Eyebrow/título/subtítulo de la sección "¿Qué hay aquí?"' },
      { key: 'alerts', label: 'Banner de alertas', help: 'Texto del header sobre las alertas de blanqueamiento.' },
      { key: 'contributorsTeaser', label: 'Banner de comunidad', help: 'Encabezado de la sección "Top colaboradores".' },
      { key: 'cta', label: 'CTA final', help: 'Última llamada a la acción de la página.' },
    ],
  },
  {
    slug: 'about',
    title: 'Sobre el observatorio',
    description: 'Misión, fuentes, sistema de reputación, validación, licencias y contacto.',
    preview: '/about',
    icon: 'lucide:info',
    sections: [
      { key: 'hero', label: 'Hero', help: 'Encabezado de la página. El subtítulo se usa como slogan principal del observatorio.' },
      { key: 'mission', label: 'Misión' },
      { key: 'vision', label: 'Visión' },
      { key: 'objective', label: 'Objetivo' },
      { key: 'inspirations', label: 'Inspiraciones', help: 'Lista de proyectos que inspiran la plataforma.' },
      { key: 'sources', label: 'Jerarquía de fuentes', help: 'Lista numerada del 1 al 5.' },
      { key: 'team', label: 'Equipo', help: 'Bios del equipo del observatorio. Una persona por bloque.' },
      { key: 'mediaCoverageIntro', label: 'En medios (intro)', help: 'Encabezado y texto introductorio del bloque de menciones en prensa.' },
      { key: 'mediaCoverage', label: 'En medios (lista)', help: 'Medios donde se ha cubierto el observatorio. Un enlace por bloque.' },
      { key: 'reputationIntro', label: 'Sistema de reputación (intro)', help: 'Texto antes de la tabla de tiers (la tabla se gestiona desde /admin/tiers).' },
      { key: 'validation', label: 'Cómo se valida un aporte', help: 'Pasos del workflow de validación.' },
      { key: 'licenses', label: 'Licencias y atribución' },
      { key: 'contact', label: 'Contacto' },
    ],
  },
  {
    slug: 'contribute',
    title: 'Contribuir',
    description: 'Encabezado, copy lateral y aviso de revisión del formulario.',
    preview: '/contribute',
    icon: 'lucide:upload',
    sections: [
      { key: 'hero', label: 'Hero' },
      { key: 'sidebar', label: 'Tarjetas laterales (3)', help: 'Guía mostrada junto al formulario.' },
      { key: 'notice', label: 'Aviso de revisión', help: 'Mensaje verde dentro del formulario.' },
    ],
  },
  {
    slug: 'inventory',
    title: 'Arrecifes (inventario)',
    description: 'Encabezado de la página de arrecifes.',
    preview: '/inventory',
    icon: 'lucide:map',
    sections: [
      { key: 'hero', label: 'Hero' },
    ],
  },
  {
    slug: 'atlas',
    title: 'Atlas de conflictos',
    description: 'Encabezado de la página de conflictos socioambientales.',
    preview: '/atlas',
    icon: 'lucide:alert-triangle',
    sections: [
      { key: 'hero', label: 'Hero' },
    ],
  },
  {
    slug: 'data-sources',
    title: 'Capas y datos',
    description: 'Encabezado del catálogo de datos abiertos.',
    preview: '/data-sources',
    icon: 'lucide:database',
    sections: [
      { key: 'hero', label: 'Hero' },
    ],
  },
  {
    slug: 'contributors',
    title: 'Comunidad',
    description: 'Hero, intro de modos, callout "Red, no escalera" y CTA final.',
    preview: '/contributors',
    icon: 'lucide:users',
    sections: [
      { key: 'hero', label: 'Hero' },
      { key: 'modesIntro', label: 'Intro de modos', help: '"5 maneras de cuidar el mismo arrecife".' },
      { key: 'networkCallout', label: 'Callout "Red, no escalera"' },
      { key: 'cta', label: 'CTA final' },
    ],
  },
  {
    slug: 'noticias',
    title: 'Noticias',
    description: 'Encabezado de la sección editorial.',
    preview: '/noticias',
    icon: 'lucide:newspaper',
    sections: [
      { key: 'hero', label: 'Hero' },
    ],
  },
  {
    slug: 'observations',
    title: 'Observaciones',
    description: 'Encabezado del listado público de aportes validados.',
    preview: '/observations',
    icon: 'lucide:eye',
    sections: [
      { key: 'hero', label: 'Hero' },
    ],
  },
  // ── Salud + ciencia/política — sólo hero en cada uno (resto es data viva) ──
  { slug: 'salud', title: 'Salud (hub)', description: 'Hero del tablero general de salud del arrecife.', preview: '/salud', icon: 'lucide:heart-pulse', sections: [{ key: 'hero', label: 'Hero' }] },
  { slug: 'salud-sctld', title: 'Salud · SCTLD', description: 'Hero del tablero SCTLD.', preview: '/salud/sctld', icon: 'lucide:biohazard', sections: [{ key: 'hero', label: 'Hero' }] },
  { slug: 'salud-blanqueamiento', title: 'Salud · Blanqueamiento', description: 'Hero del tablero NOAA CRW.', preview: '/salud/blanqueamiento', icon: 'lucide:thermometer-sun', sections: [{ key: 'hero', label: 'Hero' }] },
  { slug: 'salud-restauracion', title: 'Salud · Restauración', description: 'Hero del listado de sitios de restauración.', preview: '/salud/restauracion', icon: 'lucide:sprout', sections: [{ key: 'hero', label: 'Hero' }] },
  { slug: 'salud-especies', title: 'Salud · Especies', description: 'Hero del catálogo de especies.', preview: '/salud/especies', icon: 'lucide:fish', sections: [{ key: 'hero', label: 'Hero' }] },
  { slug: 'salud-invasoras', title: 'Salud · Invasoras', description: 'Hero del tablero de pez león.', preview: '/salud/invasoras', icon: 'lucide:swords', sections: [{ key: 'hero', label: 'Hero' }] },
  { slug: 'salud-sargazo', title: 'Salud · Sargazo', description: 'Hero del panel de sargazo.', preview: '/salud/sargazo', icon: 'lucide:leaf', sections: [{ key: 'hero', label: 'Hero' }] },
  { slug: 'policy', title: 'Policy briefs', description: 'Hero del listado de briefs de política.', preview: '/policy', icon: 'lucide:file-text', sections: [{ key: 'hero', label: 'Hero' }] },
  { slug: 'protocolos', title: 'Protocolos', description: 'Hero de la biblioteca de protocolos.', preview: '/protocolos', icon: 'lucide:book-open-check', sections: [{ key: 'hero', label: 'Hero' }] },
  { slug: 'citar', title: 'Cómo citar', description: 'Hero de la página de citación.', preview: '/citar', icon: 'lucide:quote', sections: [{ key: 'hero', label: 'Hero' }] },
  { slug: 'calendario', title: 'Calendario de eventos', description: 'Hero del calendario de campañas.', preview: '/calendario', icon: 'lucide:calendar-check', sections: [{ key: 'hero', label: 'Hero' }] },
  { slug: 'fenologia', title: 'Calendario fenológico', description: 'Hero del calendario fenológico.', preview: '/fenologia', icon: 'lucide:calendar-days', sections: [{ key: 'hero', label: 'Hero' }] },
  { slug: 'comparador', title: 'Comparador', description: 'Hero del comparador de arrecifes.', preview: '/comparador', icon: 'lucide:scale', sections: [{ key: 'hero', label: 'Hero' }] },
  { slug: 'presiones', title: 'Presiones acumuladas', description: 'Hero del índice multi-amenaza.', preview: '/presiones', icon: 'lucide:layers-3', sections: [{ key: 'hero', label: 'Hero' }] },
  { slug: 'huracanes', title: 'Huracanes', description: 'Hero del registro de huracanes.', preview: '/huracanes', icon: 'lucide:tornado', sections: [{ key: 'hero', label: 'Hero' }] },
  { slug: 'historias', title: 'Historias guiadas', description: 'Hero del índice de story maps.', preview: '/historias', icon: 'lucide:book-open', sections: [{ key: 'hero', label: 'Hero' }] },
  {
    slug: 'footer',
    title: 'Pie de página',
    description: 'Marca, atribución, fuentes externas, accesos rápidos y créditos institucionales.',
    preview: '/',
    icon: 'lucide:panel-bottom',
    sections: [
      { key: 'brand', label: 'Marca', help: 'Título, subtítulo y descripción del bloque izquierdo.' },
      { key: 'attribution', label: 'Aviso de atribución' },
      { key: 'sources', label: 'Fuentes externas', help: 'Links a NOAA/NASA/ESA/etc.' },
      { key: 'quickLinks', label: 'Accesos rápidos' },
      { key: 'institutional', label: 'Créditos institucionales' },
    ],
  },
]

// Etiquetas amigables para campos del editor (en español).
export const cmsFieldLabels: Record<string, string> = {
  eyebrow: 'Etiqueta superior',
  title: 'Título',
  titleLine1: 'Título — línea 1',
  titleLine2: 'Título — línea 2',
  titleLine3: 'Título — línea 3',
  subtitle: 'Subtítulo',
  description: 'Descripción',
  body: 'Cuerpo',
  heading: 'Encabezado',
  primaryLabel: 'Botón primario — texto',
  primaryTo: 'Botón primario — destino',
  secondaryLabel: 'Botón secundario — texto',
  secondaryTo: 'Botón secundario — destino',
  linkLabel: 'Enlace — texto',
  linkTo: 'Enlace — destino',
  icon: 'Icono (lucide:*)',
  accent: 'Color de acento',
  label: 'Etiqueta',
  href: 'URL externa',
  to: 'Ruta interna',
  copyright: 'Texto de copyright',
  name: 'Nombre',
  role: 'Rol / cargo',
  credentials: 'Formación académica',
  bio: 'Bio personal',
}

// Campos que se renderizan como textarea (multi-línea).
export const cmsLongTextFields = new Set<string>([
  'subtitle',
  'description',
  'body',
  'credentials',
  'bio',
])

// Campos cuyo "valor" es una clase tailwind / token de color.
export const cmsAccentOptions: { value: string; label: string }[] = [
  { value: 'primary', label: 'Teal (primary)' },
  { value: 'coral', label: 'Coral' },
  { value: 'eco', label: 'Verde (eco)' },
  { value: 'secondary', label: 'Cian (secondary)' },
  { value: 'accent', label: 'Ámbar (accent)' },
  { value: 'alert', label: 'Rojo (alert)' },
]

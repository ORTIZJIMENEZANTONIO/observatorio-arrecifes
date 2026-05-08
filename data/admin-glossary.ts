// Glosario centralizado de términos técnicos del admin. Cada entrada es una
// definición corta (≤180 chars) en lenguaje accesible — no para expertos. La
// idea es que un editor sin background técnico pueda entender qué significa
// "snapshot", "DHW", "ZOFEMAT", "tier", etc., al pasar el mouse encima.
//
// Uso:
//   <AdminInfoTooltip :text="GLOSSARY.snapshot">Snapshot</AdminInfoTooltip>

export const GLOSSARY = {
  // ── Métricas ambientales / NOAA / NASA / ESA ──
  snapshot:
    'Foto fija del estado de los 12 arrecifes en una fecha (cobertura coral, DHW, SST, índice de salud). Se captura una por día y forma la serie de tiempo histórica del observatorio.',
  dhw:
    'Degree Heating Weeks: acumulación de calor anómalo medido por NOAA Coral Reef Watch. DHW ≥ 4 indica blanqueamiento probable; DHW ≥ 8 mortalidad probable.',
  sst:
    'Sea Surface Temperature — temperatura superficial del mar en °C, medida desde satélite (NOAA o NASA MODIS).',
  sstAnomaly:
    'Cuánto está la SST por encima de la media climatológica del mes. Anomalía > 1°C es señal temprana de estrés térmico.',
  chi:
    'Coral Health Index 0–100. Combina cobertura coralina, riqueza de especies, presión térmica (DHW) y nivel de protección legal en un solo número comparable entre arrecifes.',
  liveCoralCover:
    'Porcentaje del fondo cubierto por coral vivo (vs. roca, arena, algas). Es la métrica más usada para evaluar salud arrecifal — referencia: arrecifes sanos del Caribe rondan 30–40%, degradados < 15%.',
  bleachingAlert:
    'Nivel de alerta NOAA: no_stress / watch / warning / alert_1 (blanqueamiento) / alert_2 (mortalidad).',
  nasaPower:
    'API pública de NASA con climatología global (irradiación solar, temperatura del aire, lluvia, viento, humedad). El observatorio cachea una media anual por arrecife.',
  noaaCrw:
    'NOAA Coral Reef Watch — monitoreo satelital operacional de estrés térmico en arrecifes (DHW + alertas), 5 km de resolución, actualización diaria.',

  // ── Métricas espaciales / detector de invasión ──
  zofemat:
    'Zona Federal Marítimo Terrestre. En México son los 20 m desde la línea de pleamar máxima — área donde no se puede construir sin permiso. El detector usa un buffer aproximado por OSM.',
  ndbi:
    'Normalized Difference Built-up Index. Calculado con bandas SWIR/NIR de Sentinel-2: valores > 0 indican superficie construida. El detector compara dos epochs (baseline vs actual) para detectar construcción reciente.',
  ndvi:
    'Normalized Difference Vegetation Index. Verde = vegetación viva; valores bajos sugieren desmonte. Si NDBI sube y NDVI baja a la vez, el cambio es construcción genuina (no artefacto).',
  noveltyScore:
    'Score 0–100 que combina NDBI baseline + delta para distinguir estructuras viejas (legacy) de construcciones recientes. ≥ 70 = nuevo, 40–69 = parcial, < 40 = legacy.',
  osm:
    'OpenStreetMap — base de datos colaborativa global. El detector lee la línea costera y los polígonos de edificios desde aquí vía la API Overpass (gratis, sin key).',
  gee:
    'Google Earth Engine — plataforma de Google para computar índices satelitales. Requiere service-account key. Si no está configurada, el análisis NDBI/NDVI devuelve 503 con mensaje claro.',

  // ── Sistema de aportes / red ──
  observation:
    'Aporte ciudadano: foto, vuelo de dron, transecto, muestra de agua o reporte. Entra como "pendiente"; un revisor lo evalúa y lo marca como validado, rechazado o "falta info".',
  qualityScore:
    'Calificación 0–100 que asigna el revisor al validar un aporte. Mide rigor técnico (metadatos, claridad, metodología). Pondera la reputación del autor.',
  tier:
    'Modo de participación en la red (no es un nivel jerárquico). Cinco modos: bronce, plata, oro, platino, coral. Cada uno representa una manera distinta de aportar (curiosidad ciudadana, conocimiento del mar, trabajo en agua, investigación, curaduría).',
  reputationScore:
    'Puntos internos del colaborador. Suben con aportes validados, calidad y consistencia. Sólo se usan para asignar el modo automáticamente — NO se muestran como meta visible.',
  modeTitle:
    'Nombre amigable del modo de participación visible en /contributors (ej. "Conocimiento del mar"). El slug interno se mantiene estable (bronze/silver/...) por compatibilidad de datos.',
  audience:
    'Quién participa típicamente en este modo (pescadoras, buzos, investigadoras…). Se muestra al público para que cada persona se sienta invitada por el modo que más le encaja.',

  // ── CMS / contenido editorial ──
  cms:
    'Sistema para editar copy del sitio público (hero, about, footer, etc.) sin tocar código. Cada cambio se guarda en la base y reemplaza el texto por defecto.',
  pageSlug:
    'Identificador estable de una página en el CMS (home, about, contribute, footer…). Se usa en la URL del editor y en la base.',
  sectionKey:
    'Identificador estable de una sección dentro de una página (hero, features, cta, sidebar…). Junto con el pageSlug determina qué bloque editas.',
  cmsItem:
    'Cada bloque editable de una sección. Algunas secciones tienen un solo bloque (hero), otras una lista (features tiene 3, sidebar tiene 3, etc.).',
  placeholder:
    'Variable dinámica entre llaves (ej. {count}) que se reemplaza al renderizar con un valor calculado. Déjala como está si no sabes qué hace.',

  // ── Capas / datos abiertos ──
  layer:
    'Capa de datos abierta: archivo geoespacial (GeoTIFF, shapefile, GeoJSON, KML) o servicio remoto (WMS, tiles). Cada capa preserva su licencia y atribución original.',
  wms:
    'Web Map Service: protocolo estándar para servir mapas desde un servidor (NOAA, CONABIO, GEBCO). El observatorio los renderiza en /livemap si la capa está activa.',
  wmts:
    'Web Map Tile Service: variante de WMS optimizada para entrega rápida en cuadrículas pre-renderizadas.',
  layerKind:
    '"Catálogo externo" (link al proveedor) o "archivo subido" (almacenado localmente en uploads/layers). El admin elige al crear la capa.',

  // ── Conflictos / Atlas ──
  conflict:
    'Caso socioambiental documentado al estilo EJAtlas: quién impulsa la presión (drivers), quién resiste, qué arrecifes y comunidades se afectan. Visible en /atlas.',
  geometry:
    'Polígono o punto GeoJSON que delimita el conflicto en el mapa. Si está vacío, el caso se geolocaliza por los reefIds asociados.',
  coastalIntrusion:
    'Construcción detectada dentro del buffer ZOFEMAT de un arrecife. Empieza como "candidata"; el revisor la verifica, descarta o escala a conflicto formal.',
  coastalIntrusionStatus:
    'candidate (detectada por OSM), verified (confirmada por revisor), dismissed (falso positivo), escalated (promovida a conflicto en /atlas).',

  // ── Noticias ──
  news:
    'Artículo editorial en la sección /noticias del sitio público. Puede ser nota propia o aprobada desde la cola de prospectos del scraper.',
  prospect:
    'Artículo candidato extraído por el scraper (Mongabay, TNC) que aún no es público. El admin lo aprueba o rechaza desde /admin/news.',

  // ── Tracking ──
  trackingEvent:
    'Visita o click registrado de forma anónima (sesión local, sin PII). Alimenta la pestaña Interacciones de /admin/analytics.',

  // ── Identidad de datos ──
  slug:
    'Identificador URL-friendly único (sólo a-z, 0-9, guiones). Inmutable tras crear — referenciado por otros registros y por las rutas públicas.',
  visible:
    'Si está apagado, el registro NO aparece en el sitio público pero sigue editable desde admin (útil para borradores).',
  archived:
    'Soft-delete: el registro queda invisible y no se cuenta en KPIs públicos, pero sigue en BD para auditoría. Preferir archivar antes que borrar.',
} as const

export type GlossaryKey = keyof typeof GLOSSARY

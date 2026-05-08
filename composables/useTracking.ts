// Tracking de interacciones (anónimo). Genera/persiste un sessionId por
// pestaña, agrupa eventos en lotes y los envía al backend. Privado: no
// manda PII; el backend hashea la IP.
//
// Decisiones explícitas tras detectar conteo inflado de pageviews:
//   - sessionId vive en `sessionStorage` (no `localStorage`): la sesión muere
//     al cerrar la pestaña. Comportamiento estándar de Plausible/Fathom y
//     más honesto que un identifier permanente.
//   - El path se normaliza ANTES del enqueue (sin query/hash): cambios de
//     filtro `?ocean=caribbean` no inflan `topPaths`.
//   - Dedup de pageviews consecutivos al mismo path canónico dentro de
//     2 segundos: tolera redirects, replace y double-fire de Vue Router.
//   - El boot flag vive en `window` (no en módulo): HMR no acumula listeners.
//   - Páginas `/admin/*` se excluyen tanto al pageview como al click.

const SESSION_KEY = 'arrecifes-session-id'
const BOOT_FLAG = '__arrecifesTrackingBooted'
const BATCH_SIZE = 20
const FLUSH_INTERVAL = 5000
const PAGEVIEW_DEDUP_WINDOW_MS = 2000

type EventType =
  | 'pageview' | 'click' | 'submit' | 'search'
  | 'filter' | 'download' | 'external_link' | 'custom'

interface QueueEvent {
  type: EventType
  path?: string
  target?: string
  metadata?: Record<string, unknown>
  referrer?: string
}

let queue: QueueEvent[] = []
let flushTimer: ReturnType<typeof setTimeout> | null = null
// Última pageview emitida — para dedup consecutivo.
let lastPageviewPath: string | null = null
let lastPageviewAt = 0

// sessionId por PESTAÑA (sessionStorage). Si no hay window → string vacío
// (SSR safe). Persistir en localStorage hacía que "sesiones" fueran
// permanentes y la métrica perdiera sentido.
const getSessionId = (): string => {
  if (typeof window === 'undefined') return ''
  let id = sessionStorage.getItem(SESSION_KEY)
  if (!id) {
    id =
      (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36)
    sessionStorage.setItem(SESSION_KEY, id)
  }
  return id
}

// Quita query y hash. `/livemap?lat=21#x` → `/livemap`.
const normalizePath = (p: string | undefined | null): string => {
  if (!p) return '/'
  return p.split('?')[0].split('#')[0] || '/'
}

const buildPayload = (events: QueueEvent[]) => {
  const sessionId = getSessionId()
  return {
    events: events.map((e) => ({
      type: e.type,
      path: e.path,
      target: e.target,
      metadata: e.metadata,
      referrer: e.referrer,
      sessionId,
    })),
  }
}

const flush = async (useBeacon = false) => {
  if (typeof window === 'undefined' || queue.length === 0) return
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBaseUrl as string
  const observatory = (config.public.observatory as string) || 'arrecifes'
  const url = `${baseURL}/observatory/${observatory}/events`
  const batch = queue.splice(0, queue.length)
  const body = JSON.stringify(buildPayload(batch))

  try {
    if (useBeacon && 'sendBeacon' in navigator) {
      const blob = new Blob([body], { type: 'application/json' })
      navigator.sendBeacon(url, blob)
      return
    }
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    })
  } catch {
    // Telemetría no debe romper la UX. Si el backend está caído, los
    // eventos se pierden silenciosamente.
  }
}

const scheduleFlush = () => {
  if (flushTimer) return
  flushTimer = setTimeout(() => {
    flushTimer = null
    void flush()
  }, FLUSH_INTERVAL)
}

const enqueue = (event: QueueEvent) => {
  if (typeof window === 'undefined') return
  queue.push(event)
  if (queue.length >= BATCH_SIZE) {
    if (flushTimer) {
      clearTimeout(flushTimer)
      flushTimer = null
    }
    void flush()
  } else {
    scheduleFlush()
  }
}

// Rutas internas que NO deben contar como tráfico público.
const INTERNAL_PATH_PREFIXES = ['/admin']

const isInternalPath = (path: string | undefined | null): boolean => {
  const pathname = normalizePath(path)
  return INTERNAL_PATH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

export const useTracking = () => {
  const trackPageview = (rawPath: string, metadata?: Record<string, unknown>) => {
    const path = normalizePath(rawPath)
    if (isInternalPath(path)) return

    // Dedup consecutivo: si la última pageview emitida fue al mismo path
    // canónico hace < 2 s, skip. Cubre el caso clásico de Vue Router
    // disparando initial + afterEach + replace en cascada.
    const now = Date.now()
    if (lastPageviewPath === path && now - lastPageviewAt < PAGEVIEW_DEDUP_WINDOW_MS) {
      return
    }
    lastPageviewPath = path
    lastPageviewAt = now

    enqueue({
      type: 'pageview',
      path,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      metadata,
    })
  }

  const trackEvent = (
    type: EventType,
    target?: string,
    metadata?: Record<string, unknown>,
  ) => {
    const path = typeof window !== 'undefined'
      ? normalizePath(window.location.pathname)
      : undefined
    if (path && isInternalPath(path)) return
    enqueue({ type, target, metadata, path })
  }

  const flushNow = () => flush()

  return { trackPageview, trackEvent, flushNow, getSessionId }
}

// Inicializa una sola vez por pestaña. El flag vive en `window` para que HMR
// (que re-importa el módulo) NO re-registre listeners — antes esto causaba
// que cada hot-reload sumara un pageview extra por navegación durante dev.
export const initTracking = () => {
  if (typeof window === 'undefined') return
  if ((window as any)[BOOT_FLAG]) return
  ;(window as any)[BOOT_FLAG] = true

  const router = useRouter()
  const { trackPageview, trackEvent } = useTracking()

  // No emitimos pageview inicial manual: Vue Router 4 dispara `afterEach`
  // también para la initial navigation. Si por alguna razón no lo hiciera,
  // el dedup de 2 s evita el doble conteo de todos modos.
  router.afterEach((to) => {
    trackPageview(to.path)
  })

  // Click delegation: cualquier elemento con [data-track] dispara un click
  // event. Sólo en rutas públicas.
  document.addEventListener(
    'click',
    (ev) => {
      if (isInternalPath(window.location.pathname)) return
      const target = ev.target as HTMLElement | null
      if (!target) return
      const trackEl = target.closest<HTMLElement>('[data-track]')
      if (!trackEl) return
      const label = trackEl.dataset.track || 'unlabeled'
      const meta: Record<string, unknown> = {}
      if (trackEl.dataset.trackGroup) meta.group = trackEl.dataset.trackGroup
      if (trackEl.dataset.trackValue) meta.value = trackEl.dataset.trackValue
      trackEvent('click', label, Object.keys(meta).length ? meta : undefined)
    },
    { capture: true },
  )

  // Flush al cerrar/recargar
  window.addEventListener('pagehide', () => void flush(true))
  window.addEventListener('beforeunload', () => void flush(true))
}

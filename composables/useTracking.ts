// Tracking de interacciones (anónimo). Genera/persiste un sessionId, agrupa eventos
// en lotes y los envía al backend. Privado: no manda PII; el backend hashea la IP.

const SESSION_KEY = 'arrecifes-session-id'
const BATCH_SIZE = 20
const FLUSH_INTERVAL = 5000

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
let booted = false

const getSessionId = (): string => {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem(SESSION_KEY)
  if (!id) {
    id =
      (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem(SESSION_KEY, id)
  }
  return id
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
    // Si falla, dejamos pasar; no queremos romper la UX por telemetría.
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

export const useTracking = () => {
  const trackPageview = (path: string, metadata?: Record<string, unknown>) => {
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
    enqueue({
      type,
      target,
      metadata,
      path: typeof window !== 'undefined' ? window.location.pathname : undefined,
    })
  }

  const flushNow = () => flush()

  return { trackPageview, trackEvent, flushNow, getSessionId }
}

// Rutas internas que NO deben contar como tráfico público. El panel admin es
// uso interno del equipo, no comportamiento de visitantes.
const INTERNAL_PATH_PREFIXES = ['/admin']

const isInternalPath = (path: string | undefined | null): boolean => {
  if (!path) return false
  // Compara sólo el pathname, ignorando query/hash.
  const pathname = path.split('?')[0].split('#')[0]
  return INTERNAL_PATH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

// Inicializa una sola vez por SPA: pageview en cada navegación + click delegation.
export const initTracking = () => {
  if (booted || typeof window === 'undefined') return
  booted = true

  const router = useRouter()
  const { trackPageview, trackEvent } = useTracking()

  if (!isInternalPath(window.location.pathname)) {
    trackPageview(window.location.pathname)
  }
  router.afterEach((to) => {
    if (!isInternalPath(to.fullPath)) {
      trackPageview(to.fullPath)
    }
  })

  // Click delegation: cualquier elemento con [data-track] dispara un click event.
  // Sólo en rutas públicas — los clicks dentro del admin son ruido para el dataset.
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

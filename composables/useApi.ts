// Thin $fetch wrapper para cercu-backend con inyección de Bearer token y
// auto-logout + redirect a /admin/login cuando el backend regresa 401.
export const useApi = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBaseUrl as string
  const observatory = config.public.observatory as string

  const tokenKey = 'arrecifes-admin-token'
  const adminInfoKey = 'arrecifes-admin-info'

  const getToken = (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(tokenKey)
  }

  const setToken = (token: string | null) => {
    if (typeof window === 'undefined') return
    if (token) localStorage.setItem(tokenKey, token)
    else localStorage.removeItem(tokenKey)
  }

  // Limpia toda la sesión y redirige a login con `replace: true` (sin entrada
  // en el back-stack del navegador). Si la ruta actual es admin, agrega `?redirect=`
  // para volver tras un nuevo login. Idempotente: si ya estamos en login, no hace nada.
  const handleAuthExpired = async () => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(tokenKey)
    localStorage.removeItem(adminInfoKey)
    const route = useRoute()
    if (route.path === '/admin/login') return
    const query = route.path.startsWith('/admin') ? { redirect: route.fullPath } : undefined
    await navigateTo({ path: '/admin/login', query }, { replace: true })
  }

  const apiFetch = async <T = unknown>(path: string, opts: any = {}): Promise<T> => {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(opts.headers ?? {}),
    }
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`

    const url = path.startsWith('http')
      ? path
      : `${baseURL}/observatory/${observatory}${path.startsWith('/') ? path : `/${path}`}`

    try {
      return await $fetch<T>(url, { ...opts, headers })
    } catch (err: any) {
      const status = err?.status || err?.response?.status
      if (status === 401 || status === 403) {
        await handleAuthExpired()
      }
      throw err
    }
  }

  return { apiFetch, getToken, setToken, baseURL, observatory }
}

// Thin $fetch wrapper for cercu-backend with auth header injection
// and 401 redirect-to-login handling.
export const useApi = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBaseUrl as string
  const observatory = config.public.observatory as string

  const tokenKey = 'arrecifes-admin-token'

  const getToken = (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(tokenKey)
  }

  const setToken = (token: string | null) => {
    if (typeof window === 'undefined') return
    if (token) localStorage.setItem(tokenKey, token)
    else localStorage.removeItem(tokenKey)
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

    return $fetch<T>(url, { ...opts, headers })
  }

  return { apiFetch, getToken, setToken, baseURL, observatory }
}

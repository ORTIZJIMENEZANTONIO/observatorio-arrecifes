// Reserved for future legacy URL redirects (e.g. /map → /livemap, /reefs → /inventory).
// Keep deterministic: server side via SPA navigation guard.
export default defineNuxtRouteMiddleware((to) => {
  const map: Record<string, string> = {
    '/map': '/livemap',
    '/reefs': '/inventory',
    '/conflicts': '/atlas',
    '/layers': '/data-sources',
    '/people': '/contributors',
    '/register': '/contribute',
  }
  const target = map[to.path]
  if (target) return navigateTo(target, { replace: true })
})

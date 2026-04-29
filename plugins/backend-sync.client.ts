// Hydrate Pinia stores with live data from cercu-backend on app start.
// SSR is disabled (ssr: false) so this runs once on the client.
export default defineNuxtPlugin(async () => {
  const { syncAll } = useBackendSync()
  await syncAll()
})

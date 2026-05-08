export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/color-mode',
    '@nuxtjs/i18n',
    'nuxt-icon',
  ],

  // Internacionalización: es-MX como default, en-US disponible. Sin prefijo
  // de URL — la preferencia se guarda en cookie + localStorage. La UI tiene
  // un selector visible (LocaleSwitcher) en header y sidebar admin.
  //
  // i18n v10 (compatible con Nuxt 3.21): el campo `iso` (deprecado en v9)
  // se renombró a `language`. `langDir` ahora se resuelve relativo al
  // directorio raíz `i18n/`, así que el valor es 'locales' (no
  // 'i18n/locales/' como en v8).
  i18n: {
    strategy: 'no_prefix',
    locales: [
      { code: 'es', language: 'es-MX', name: 'Español', file: 'es.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'es',
    langDir: 'locales/',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'arrecifes-i18n',
      redirectOn: 'root',
      fallbackLocale: 'es',
    },
  },

  ssr: false,

  runtimeConfig: {
    public: {
      dataMode: 'mock',
      apiBaseUrl: 'http://localhost:3003/api/v1',
      observatory: 'arrecifes',
      nasaCmrUrl: 'https://cmr.earthdata.nasa.gov/search',
      noaaCrwUrl: 'https://coralreefwatch.noaa.gov/data',
      conabioWmsUrl: 'http://geoportal.conabio.gob.mx/geoserver/wms',
    },
  },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      htmlAttrs: { lang: 'es' },
      title: 'Observatorio de Arrecifes — México',
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      meta: [
        {
          name: 'description',
          content:
            'Plataforma viva de monitoreo de arrecifes coralinos en México con datos satelitales abiertos de NASA, NOAA y CONABIO. Mapa interactivo, conflictos socioambientales y red de colaboradores validados.',
        },
        {
          name: 'keywords',
          content:
            'arrecifes coralinos, Mexico, Caribe, Pacifico, NASA, NOAA, CONABIO, Allen Coral Atlas, EJAtlas, observatorio, percepcion remota, blanqueamiento, conflicto socioambiental',
        },
        { name: 'author', content: 'Observatorio de Arrecifes Mexico' },
        { name: 'robots', content: 'index, follow' },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'Observatorio de Arrecifes — México' },
        {
          property: 'og:description',
          content:
            'Datos satelitales casi en tiempo real de arrecifes mexicanos, capas descargables y red de colaboradores.',
        },
        { property: 'og:locale', content: 'es_MX' },
        { name: 'theme-color', content: '#0E7490' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', href: '/favicon.svg' },
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  colorMode: {
    classSuffix: '',
    preference: 'light',
    fallback: 'light',
  },

  tailwindcss: {
    configPath: 'tailwind.config.ts',
    cssPath: '~/assets/css/main.css',
    exposeConfig: false,
    viewer: true,
  },

  compatibilityDate: '2025-03-01',
})

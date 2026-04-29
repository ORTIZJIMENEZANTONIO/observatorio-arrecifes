# Observatorio de Arrecifes — México

Plataforma viva de monitoreo de arrecifes coralinos mexicanos. Datos satelitales casi en
tiempo real (NASA, NOAA, ESA Copernicus, USGS), capas oficiales (CONABIO, CONANP, INEGI)
y aportes verificados de pescadores, buzos, comunidades costeras e investigadoras.

Inspirado en [Allen Coral Atlas](https://allencoralatlas.org) y [EJAtlas](https://ejatlas.org).

## Stack

- Nuxt 3 (SPA, `ssr: false`) · Vue 3 Composition API
- Pinia (composable style) · VueUse · @nuxtjs/color-mode
- Tailwind CSS 3 + sistema de diseño océano/coral (Inter + Space Grotesk)
- Leaflet 1.9 + leaflet.markercluster
- Chart.js + vue-chartjs
- TypeScript estricto · arrow functions · camelCase · todo en inglés (código)
- UI/copy 100% en es-MX
- Vitest para pruebas

## Comandos

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
npm run generate
npm run preview
npm test
```

## Estructura

Ver [`CLAUDE.md`](./CLAUDE.md) para la guía completa del proyecto.

## Backend

Comparte la API REST con `cercu-backend` bajo el prefijo
`/observatory/arrecifes/...`. En modo mock (default) los datos vienen de
`data/*.ts`; cuando el backend esté listo, los stores fetcharán al montar.

## Licencia

Apache 2.0. Cada capa de datos preserva su licencia original.

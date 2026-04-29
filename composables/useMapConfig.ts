import type { ReefStatus } from '~/types'

// ── Map defaults — Mexico coastline framing ──
export const useMapConfig = () => {
  const defaultCenter: [number, number] = [21.0, -94.0]
  const defaultZoom = 5
  const minZoom = 3
  const maxZoom = 18

  // ── Basemaps Google-Earth-style (Esri World Imagery) + alternativas ──
  const basemaps = {
    imagery: {
      label: 'Satélite',
      icon: 'lucide:satellite',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution:
        'Tiles &copy; Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, GIS User Community',
      maxZoom: 19,
    },
    ocean: {
      label: 'Batimetría',
      icon: 'lucide:waves',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri — Sources: GEBCO, NOAA, OpenStreetMap',
      maxZoom: 13,
    },
    streets: {
      label: 'Mapa',
      icon: 'lucide:map',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    },
  } as const

  // Reference labels overlay (nombres de mar / país sobre satélite)
  const labelsOverlay = {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    attribution: '',
    maxZoom: 19,
  }

  const reefMarkerStyle = (status: ReefStatus = 'healthy') => {
    const colorMap: Record<ReefStatus, string> = {
      healthy: '#10B981',
      watch: '#06B6D4',
      warning: '#F59E0B',
      alert: '#FF7A66',
      bleaching: '#DC2626',
      mortality: '#7F1D1D',
    }
    return {
      radius: 9,
      fillColor: colorMap[status],
      color: '#FFFFFF',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.9,
    }
  }

  return {
    defaultCenter,
    defaultZoom,
    minZoom,
    maxZoom,
    basemaps,
    labelsOverlay,
    reefMarkerStyle,
  }
}

export type BasemapKey = 'imagery' | 'ocean' | 'streets'

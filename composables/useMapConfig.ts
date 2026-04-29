import type { ReefStatus } from '~/types'

// Map defaults — Mexico coastline framing.
export const useMapConfig = () => {
  const defaultCenter: [number, number] = [21.0, -94.0]
  const defaultZoom = 5

  // Esri Ocean basemap — context bathymetric for reef visualization.
  const tileUrl =
    'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}'
  const tileAttribution =
    'Tiles &copy; Esri — Sources: GEBCO, NOAA, Garmin, OpenStreetMap contributors'

  // OSM fallback (free, no key required).
  const osmTileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  const osmAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

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
      fillOpacity: 0.85,
    }
  }

  return {
    defaultCenter,
    defaultZoom,
    tileUrl,
    tileAttribution,
    osmTileUrl,
    osmAttribution,
    reefMarkerStyle,
  }
}

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

export default function GeoMap({ lat, lon, label }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  useEffect(() => {
    if (lat == null || lon == null || !mapRef.current) return

    const [latNum, lonNum] = [parseFloat(lat), parseFloat(lon)]
    if (isNaN(latNum) || isNaN(lonNum)) return

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([latNum, lonNum], 13)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapInstanceRef.current)
    }

    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapInstanceRef.current.removeLayer(layer)
      }
    })

    const marker = L.marker([latNum, lonNum], { icon: defaultIcon })
      .addTo(mapInstanceRef.current)
      .bindPopup(label || `${latNum}, ${lonNum}`)

    mapInstanceRef.current.setView([latNum, lonNum], 13)
    marker.openPopup()
  }, [lat, lon, label])

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  return (
    <div
      ref={mapRef}
      className="geo-map"
    />
  )
}

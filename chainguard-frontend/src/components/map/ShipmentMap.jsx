import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, Polyline, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useShipments } from '../../hooks/useShipments'
import { fetchRiskHeatmap } from '../../services/api'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function MapResizer() {
  const map = useMap()
  useEffect(() => { const t = setTimeout(() => map.invalidateSize(), 250); return () => clearTimeout(t) }, [map])
  return null
}

function riskColor(score) {
  if (score <= 30) return '#00E676'
  if (score <= 60) return '#FFB300'
  if (score <= 80) return '#FF5252'
  return '#FF1744'
}

const CITY_COORDS = {
  Mumbai:[19.076,72.8777], Delhi:[28.7041,77.1025], Bangalore:[12.9716,77.5946],
  Chennai:[13.0827,80.2707], Hyderabad:[17.385,78.4867], Kolkata:[22.5726,88.3639],
  Pune:[18.5204,73.8567], Ahmedabad:[23.0225,72.5714], Jaipur:[26.9124,75.7873],
  Lucknow:[26.8467,80.9462], Nagpur:[21.1458,79.0882], Bhopal:[23.2599,77.4126],
  Indore:[22.7196,75.8577], Surat:[21.1702,72.8311], Vadodara:[22.3072,73.1812],
  Coimbatore:[11.0168,76.9558], Kochi:[9.9312,76.2673], Vizag:[17.6868,83.2185],
  Patna:[25.6093,85.1376], Chandigarh:[30.7333,76.7794], Ludhiana:[30.901,75.8573],
  Amritsar:[31.634,74.8723], Guwahati:[26.1445,91.7362], Bhubaneswar:[20.2961,85.8245],
  Raipur:[21.2514,81.6296],
}

export default function ShipmentMap({ selectedRoute }) {
  const { data: shipments } = useShipments()
  const [heatmap, setHeatmap] = useState([])

  useEffect(() => {
    fetchRiskHeatmap()
      .then(r => { if (r.data?.data?.cities) setHeatmap(r.data.data.cities) })
      .catch(() => {
        setHeatmap(Object.entries(CITY_COORDS).map(([city, [lat, lng]]) => ({
          city, lat, lng, composite_risk: Math.floor(Math.random() * 60 + 10),
        })))
      })
  }, [])

  const routeCoords = selectedRoute?.path
    ?.map(c => CITY_COORDS[c])
    .filter(Boolean) || []

  return (
    <div className="card overflow-hidden shipment-map" style={{ height: 450 }}>
      <MapContainer center={[20.5937, 78.9629]} zoom={5} zoomControl={false}
        style={{ width: '100%', height: '100%' }} scrollWheelZoom={false}>
        <MapResizer />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com">CARTO</a>'
        />
        {/* Heatmap circles */}
        {heatmap.map(city => (
          <Circle key={city.city} center={[city.lat, city.lng]}
            radius={city.composite_risk * 500}
            pathOptions={{ color: riskColor(city.composite_risk), fillColor: riskColor(city.composite_risk), fillOpacity: 0.15, weight: 1 }}>
            <Tooltip direction="top" className="!bg-transparent !border-none !shadow-none">
              <span className="text-xs font-mono px-2 py-1 rounded" style={{ background: 'var(--bg-surface)', color: riskColor(city.composite_risk) }}>
                {city.city}: {city.composite_risk}
              </span>
            </Tooltip>
          </Circle>
        ))}
        {/* Shipment markers */}
        {shipments.filter(s => s.current_location_lat && s.current_location_lng).map(s => (
          <CircleMarker key={s.id} center={[s.current_location_lat, s.current_location_lng]}
            radius={s.risk_score > 80 ? 8 : s.risk_score > 50 ? 6 : 4}
            pathOptions={{ color: riskColor(s.risk_score), fillColor: riskColor(s.risk_score), fillOpacity: 0.9, weight: 2 }}>
            <Popup className="!bg-[var(--bg-surface)]">
              <div style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                <p className="font-bold text-sm" style={{ color: 'var(--accent-primary)' }}>{s.shipment_code}</p>
                <p className="text-xs">{s.origin_city} → {s.destination_city}</p>
                <p className="text-xs">Risk: <span style={{ color: riskColor(s.risk_score) }}>{s.risk_score}/100</span></p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
        {/* Major city dots */}
        {Object.entries(CITY_COORDS).map(([city, [lat, lng]]) => (
          <CircleMarker key={city} center={[lat, lng]} radius={3}
            pathOptions={{ color: '#00D4AA', fillColor: '#00D4AA', fillOpacity: 0.4, weight: 1 }}>
            <Tooltip permanent direction="bottom" offset={[0, 8]}
              className="!bg-transparent !border-none !shadow-none !p-0">
              <span style={{ fontSize: '9px', color: '#8B949E', fontFamily: 'var(--font-mono)' }}>{city}</span>
            </Tooltip>
          </CircleMarker>
        ))}
        {/* Selected route polyline */}
        {routeCoords.length > 1 && (
          <Polyline positions={routeCoords}
            pathOptions={{ color: '#00D4AA', weight: 3, opacity: 0.9, dashArray: '12, 8' }} />
        )}
      </MapContainer>
    </div>
  )
}

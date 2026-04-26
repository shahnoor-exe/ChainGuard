import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, Polyline, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useShipments } from '../../hooks/useShipments'
import { fetchRiskHeatmap } from '../../services/api'

// Fix Leaflet default icon in Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function MapResizer() {
  const map = useMap()
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 250)
    return () => clearTimeout(timer)
  }, [map])
  return null
}

function riskColor(score) {
  if (score <= 30) return '#00C896'
  if (score <= 60) return '#F59E0B'
  if (score <= 80) return '#F97316'
  return '#EF4444'
}

const STATUS_LABELS = {
  in_transit: 'In Transit', at_risk: 'At Risk',
  delayed: 'Delayed', delivered: 'Delivered',
}

const CITY_COORDS = {
  Mumbai:[19.076,72.877], Delhi:[28.704,77.102], Bangalore:[12.972,77.595],
  Chennai:[13.083,80.271], Hyderabad:[17.385,78.487], Kolkata:[22.573,88.364],
  Pune:[18.52,73.857], Ahmedabad:[23.023,72.571], Jaipur:[26.912,75.787],
  Lucknow:[26.847,80.946], Nagpur:[21.146,79.088], Bhopal:[23.26,77.413],
  Indore:[22.72,75.858], Surat:[21.17,72.831], Vadodara:[22.307,73.181],
  Coimbatore:[11.017,76.956], Kochi:[9.931,76.267], Vizag:[17.687,83.219],
  Patna:[25.609,85.138], Chandigarh:[30.733,76.779], Ludhiana:[30.901,75.857],
  Amritsar:[31.634,74.872], Guwahati:[26.145,91.736], Bhubaneswar:[20.296,85.825],
  Raipur:[21.251,81.63],
}

export default function ShipmentMap({ selectedRoute }) {
  const { data: shipments } = useShipments()
  const [heatmap, setHeatmap] = useState([])

  useEffect(() => {
    fetchRiskHeatmap()
      .then(r => setHeatmap(r.data.data || []))
      .catch(() => {})
  }, [])

  return (
    <div className="card overflow-hidden" style={{ height: 450 }}>
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={false}
      >
        <MapResizer />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
        />

        {/* City dots */}
        {Object.entries(CITY_COORDS).map(([city, [lat, lng]]) => (
          <CircleMarker key={city} center={[lat, lng]} radius={3}
            pathOptions={{ color: '#8B949E', fillColor: '#8B949E', fillOpacity: 0.6 }}>
            <Tooltip>{city}</Tooltip>
          </CircleMarker>
        ))}

        {/* Risk heatmap circles */}
        {heatmap.map(c => {
          const coords = CITY_COORDS[c.city]
          if (!coords) return null
          return (
            <Circle key={c.city} center={coords}
              radius={c.risk_score * 1000}
              pathOptions={{ color: riskColor(c.risk_score), fillColor: riskColor(c.risk_score), fillOpacity: 0.15, weight: 0 }}
            />
          )
        })}

        {/* Shipment markers */}
        {shipments.filter(s => s.current_location_lat && s.current_location_lng).map(s => (
          <CircleMarker
            key={s.id}
            center={[s.current_location_lat, s.current_location_lng]}
            radius={s.risk_score > 80 ? 9 : 7}
            pathOptions={{
              color: riskColor(s.risk_score),
              fillColor: riskColor(s.risk_score),
              fillOpacity: 0.85,
              weight: 2,
            }}
          >
            <Popup>
              <div className="text-sm min-w-[200px]" style={{ fontFamily: 'system-ui' }}>
                <p className="font-bold text-base mb-1">{s.shipment_code}</p>
                <p className="text-gray-600">{s.origin_city} → {s.destination_city}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-gray-100 text-xs">{STATUS_LABELS[s.status]}</span>
                  <span className="px-2 py-0.5 rounded text-xs text-white" style={{ backgroundColor: riskColor(s.risk_score) }}>
                    Risk: {s.risk_score}
                  </span>
                </div>
                {s.predicted_eta && (
                  <p className="text-xs text-gray-500 mt-1">
                    ETA: {new Date(s.predicted_eta).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </p>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Selected route polyline */}
        {selectedRoute && selectedRoute.path && (
          <Polyline
            positions={selectedRoute.path
              .map(city => CITY_COORDS[city])
              .filter(Boolean)}
            pathOptions={{ color: '#00C896', weight: 3, dashArray: '8 4' }}
          />
        )}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-14 right-4 bg-bg-surface/90 backdrop-blur-sm border border-border-subtle rounded-lg p-3 text-xs z-[400]">
        {[['Low (0-30)', '#00C896'], ['Medium (31-60)', '#F59E0B'], ['High (61-80)', '#F97316'], ['Critical (81+)', '#EF4444']].map(([label, color]) => (
          <div key={label} className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
            <span className="text-text-muted">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

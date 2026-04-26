import { useState, useEffect } from 'react'
import { Package, ArrowDown, ArrowUp, Clock, CheckCircle, AlertTriangle, Cloud } from 'lucide-react'
import { motion } from 'framer-motion'
import KPICard from '../common/KPICard'
import RiskBadge from '../common/RiskBadge'
import { useAuth } from '../../context/AuthContext'
import { useShipments } from '../../hooks/useShipments'
import { fetchWeatherAlerts } from '../../services/api'
import { useApp } from '../../context/AppContext'
import { STATUS_COLORS } from '../../config'

export default function WarehouseDashboard() {
  const { user } = useAuth()
  const { data: allShipments, loading } = useShipments()
  const { addToast } = useApp()
  const [weather, setWeather] = useState(null)
  const city = user?.warehouse_city || 'Mumbai'

  const incoming = allShipments.filter(s => s.destination_city === city && s.status !== 'delivered')
  const outgoing = allShipments.filter(s => s.origin_city === city && s.status === 'in_transit')
  const pending = incoming.filter(s => s.status === 'in_transit')

  useEffect(() => {
    fetchWeatherAlerts().then(r => {
      const alerts = r.data?.data?.active_weather_alerts || []
      const cityWeather = alerts.find(a => a.city === city)
      setWeather(cityWeather || null)
    }).catch(() => {})
  }, [city])

  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  function handleMarkReceived(shipment) {
    addToast(`Shipment ${shipment.shipment_code} marked as delivered`, 'success')
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
          <Package className="w-5 h-5 inline mr-2" style={{ color: 'var(--accent-primary)' }} />
          {city} Warehouse — {user?.full_name}
        </h2>
        <p className="text-sm font-mono mt-1" style={{ color: 'var(--text-secondary)' }}>
          {time.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Kolkata' })}
          {' '}{time.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard title="Arriving Today" value={incoming.length} icon={ArrowDown} color="blue" isLoading={loading} />
        <KPICard title="Departing Today" value={outgoing.length} icon={ArrowUp} color="success" isLoading={loading} />
        <KPICard title="Pending Scan" value={pending.length} icon={Clock} color="warning" isLoading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Incoming */}
        <div className="card">
          <div className="px-4 py-3 font-display font-semibold text-sm" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)' }}>
            Incoming Shipments ({incoming.length})
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  {['Code', 'Origin', 'Carrier', 'ETA', 'Status', ''].map(h => (
                    <th key={h} className="px-4 py-2 text-left text-xs font-medium uppercase" style={{ color: 'var(--text-faint)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {incoming.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-faint)' }}>No incoming shipments</td></tr>
                ) : incoming.map(s => (
                  <tr key={s.id} className="transition-colors hover:bg-[var(--bg-elevated)]" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td className="px-4 py-2 font-mono text-xs" style={{ color: 'var(--accent-primary)' }}>{s.shipment_code}</td>
                    <td className="px-4 py-2 text-xs" style={{ color: 'var(--text-primary)' }}>{s.origin_city}</td>
                    <td className="px-4 py-2 text-xs" style={{ color: 'var(--text-secondary)' }}>{s.carrier_name}</td>
                    <td className="px-4 py-2 text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                      {s.predicted_eta ? new Date(s.predicted_eta).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{ color: STATUS_COLORS[s.status]?.text, background: STATUS_COLORS[s.status]?.bg }}>
                        {s.status?.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {s.status !== 'delivered' && (
                        <button onClick={() => handleMarkReceived(s)} className="btn-secondary py-1 px-2 text-xs">
                          <CheckCircle className="w-3 h-3" /> Received
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Outgoing */}
        <div className="card">
          <div className="px-4 py-3 font-display font-semibold text-sm" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)' }}>
            Outgoing Shipments ({outgoing.length})
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  {['Code', 'Destination', 'Carrier', 'Risk'].map(h => (
                    <th key={h} className="px-4 py-2 text-left text-xs font-medium uppercase" style={{ color: 'var(--text-faint)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {outgoing.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-faint)' }}>No outgoing shipments</td></tr>
                ) : outgoing.map(s => (
                  <tr key={s.id} className="transition-colors hover:bg-[var(--bg-elevated)]" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td className="px-4 py-2 font-mono text-xs" style={{ color: 'var(--accent-primary)' }}>{s.shipment_code}</td>
                    <td className="px-4 py-2 text-xs" style={{ color: 'var(--text-primary)' }}>{s.destination_city}</td>
                    <td className="px-4 py-2 text-xs" style={{ color: 'var(--text-secondary)' }}>{s.carrier_name}</td>
                    <td className="px-4 py-2"><RiskBadge score={s.risk_score} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Weather */}
      <div className="card p-5">
        <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Cloud className="w-4 h-4" style={{ color: 'var(--accent-cyan)' }} /> Local Weather — {city}
        </h3>
        {weather ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{weather.weather_description}</p>
              <p className="text-xs font-mono mt-1" style={{ color: 'var(--text-secondary)' }}>
                Temp: {weather.temperature}°C | Wind: {weather.wind_speed} m/s
              </p>
            </div>
            {weather.weather_score > 5 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--status-warn-bg)', border: '1px solid rgba(255,179,0,0.3)' }}>
                <AlertTriangle className="w-4 h-4" style={{ color: 'var(--status-warn)' }} />
                <span className="text-xs" style={{ color: 'var(--status-warn)' }}>Severe weather may affect incoming shipments</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm" style={{ color: 'var(--text-faint)' }}>No weather data available</p>
        )}
      </div>
    </div>
  )
}

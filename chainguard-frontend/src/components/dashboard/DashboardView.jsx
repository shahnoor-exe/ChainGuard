import { Package, AlertTriangle, Clock, CheckCircle, Zap, Leaf } from 'lucide-react'
import KPICard from '../common/KPICard'
import ShipmentMap from '../map/ShipmentMap'
import DisruptionFeed from './DisruptionFeed'
import ActiveShipmentsChart from './ActiveShipmentsChart'
import { useDashboardKPIs } from '../../hooks/useDashboardKPIs'
import { useDisruptions } from '../../hooks/useDisruptions'
import { useShipments } from '../../hooks/useShipments'
import { useEffect, useState } from 'react'
import { fetchWeatherAlerts } from '../../services/api'

export default function DashboardView({ selectedRoute }) {
  const { data: kpis, loading: kpiLoading } = useDashboardKPIs()
  const { data: disruptions, loading: dLoading } = useDisruptions()
  const { data: shipments } = useShipments()
  const [weatherAlerts, setWeatherAlerts] = useState([])

  useEffect(() => {
    fetchWeatherAlerts()
      .then(r => setWeatherAlerts(r.data.data?.active_weather_alerts || []))
      .catch(() => {})
  }, [])

  return (
    <div className="space-y-5">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard title="Total Shipments" value={kpis?.total_shipments} icon={Package} color="blue" isLoading={kpiLoading} />
        <KPICard title="At Risk" value={kpis?.at_risk_count} icon={AlertTriangle} color="danger" isLoading={kpiLoading} subtitle="Require attention" />
        <KPICard title="Delayed" value={kpis?.delayed_count} icon={Clock} color="warning" isLoading={kpiLoading} />
        <KPICard title="On-Time Rate" value={kpis?.on_time_rate} suffix="%" icon={CheckCircle} color="success" isLoading={kpiLoading} decimals={1} />
        <KPICard title="Disruptions" value={kpis?.active_disruptions_count} icon={Zap} color="warning" isLoading={kpiLoading} subtitle="Active now" />
        <KPICard title="Avg CO₂" value={kpis?.avg_carbon_per_shipment} suffix=" kg" icon={Leaf} color="success" isLoading={kpiLoading} subtitle="Per shipment" decimals={1} />
      </div>

      {/* Map + Disruption Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 relative">
          <ShipmentMap selectedRoute={selectedRoute} />
        </div>
        <div className="lg:col-span-2" style={{ minHeight: 450 }}>
          <DisruptionFeed />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ActiveShipmentsChart shipments={shipments} />

        {/* Weather Alerts */}
        <div className="card p-5">
          <h3 className="font-display font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Weather Alerts — Major Hubs</h3>
          {weatherAlerts.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-sm" style={{ color: 'var(--text-faint)' }}>
              No active weather alerts
            </div>
          ) : (
            <div className="space-y-2">
              {weatherAlerts.map((w, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg"
                  style={{ background: 'var(--bg-elevated)' }}>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{w.city}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{w.weather_description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold px-2 py-1 rounded"
                      style={{
                        background: w.alert_level === 'severe' ? 'var(--status-danger-bg)' :
                          w.alert_level === 'warning' ? 'var(--status-warn-bg)' : 'var(--accent-subtle)',
                        color: w.alert_level === 'severe' ? 'var(--status-danger)' :
                          w.alert_level === 'warning' ? 'var(--status-warn)' : 'var(--accent-primary)',
                      }}>
                      {w.alert_level?.toUpperCase()}
                    </span>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>Score: {w.weather_score}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

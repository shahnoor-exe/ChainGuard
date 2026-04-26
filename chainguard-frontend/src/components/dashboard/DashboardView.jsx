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

  const fmt = (n) => n !== undefined ? new Intl.NumberFormat('en-IN').format(n) : '—'

  return (
    <div className="space-y-5">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard title="Total Shipments" value={fmt(kpis?.total_shipments)} icon={Package} color="blue" isLoading={kpiLoading} />
        <KPICard title="At Risk" value={fmt(kpis?.at_risk_count)} icon={AlertTriangle} color="danger" isLoading={kpiLoading} subtitle="Require attention" />
        <KPICard title="Delayed" value={fmt(kpis?.delayed_count)} icon={Clock} color="warning" isLoading={kpiLoading} />
        <KPICard title="On-Time Rate" value={kpis ? `${kpis.on_time_rate}%` : '—'} icon={CheckCircle} color="success" isLoading={kpiLoading} />
        <KPICard title="Disruptions" value={fmt(kpis?.active_disruptions_count)} icon={Zap} color="warning" isLoading={kpiLoading} subtitle="Active now" />
        <KPICard title="Avg CO₂" value={kpis ? `${kpis.avg_carbon_per_shipment} kg` : '—'} icon={Leaf} color="success" isLoading={kpiLoading} subtitle="Per shipment" />
      </div>

      {/* Map + Disruption Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 relative">
          <ShipmentMap selectedRoute={selectedRoute} />
        </div>
        <div className="lg:col-span-2" style={{ minHeight: 450 }}>
          <DisruptionFeed disruptions={disruptions} loading={dLoading} />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ActiveShipmentsChart shipments={shipments} />

        {/* Weather Alerts */}
        <div className="card p-5">
          <h3 className="font-semibold text-sm text-text-primary mb-4">Weather Alerts — Major Hubs</h3>
          {weatherAlerts.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-text-muted text-sm">
              No active weather alerts
            </div>
          ) : (
            <div className="space-y-2">
              {weatherAlerts.map((w, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-bg-primary rounded-lg">
                  <div>
                    <p className="text-sm text-text-primary">{w.city}</p>
                    <p className="text-xs text-text-muted">{w.weather_description}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      w.alert_level === 'severe' ? 'bg-red-900 text-red-300' :
                      w.alert_level === 'warning' ? 'bg-orange-900 text-orange-300' :
                      'bg-amber-900 text-amber-300'}`}>
                      {w.alert_level?.toUpperCase()}
                    </span>
                    <p className="text-xs text-text-muted mt-1">Score: {w.weather_score}</p>
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

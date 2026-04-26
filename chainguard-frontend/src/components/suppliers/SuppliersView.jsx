import { Building2, AlertTriangle, XCircle } from 'lucide-react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import KPICard from '../common/KPICard'
import RiskBadge from '../common/RiskBadge'
import { useSuppliers } from '../../hooks/useSuppliers'
import { fetchAtRiskSuppliers } from '../../services/api'
import { useState } from 'react'
import { useApp } from '../../context/AppContext'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

function OnTimeBar({ value }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-bg-primary rounded-full overflow-hidden">
        <div className="h-full bg-chainguard-emerald rounded-full" style={{ width: `${value}%` }} />
      </div>
      <span className="text-text-muted text-xs tabular-nums w-8">{value}%</span>
    </div>
  )
}

export default function SuppliersView() {
  const { data: suppliers, loading } = useSuppliers()
  const { addToast } = useApp()
  const [alternatives, setAlternatives] = useState(null)
  const [altLoading, setAltLoading] = useState(false)

  const highRisk  = suppliers.filter(s => s.risk_score > 65)
  const critical  = suppliers.filter(s => s.risk_score > 80)

  const sorted = [...suppliers].sort((a, b) => b.risk_score - a.risk_score)

  const chartData = {
    labels: sorted.map(s => s.name.split(' ')[0]),
    datasets: [{
      label: 'Risk Score',
      data: sorted.map(s => s.risk_score),
      backgroundColor: sorted.map(s =>
        s.risk_score > 80 ? '#EF4444' : s.risk_score > 65 ? '#F97316' : s.risk_score > 40 ? '#F59E0B' : '#00C896'
      ),
      borderRadius: 4,
    }],
  }
  const chartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => ` Risk: ${ctx.parsed.x}` } },
    },
    scales: {
      x: { grid: { color: '#21262D' }, ticks: { color: '#8B949E' }, max: 100 },
      y: { grid: { display: false }, ticks: { color: '#8B949E', font: { size: 11 } } },
    },
  }

  async function handleViewAlternatives() {
    setAltLoading(true)
    try {
      const res = await fetchAtRiskSuppliers()
      setAlternatives(res.data.data)
    } catch { addToast('Could not load alternatives', 'error') }
    finally { setAltLoading(false) }
  }

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard title="Total Suppliers" value={suppliers.length} icon={Building2} color="blue" isLoading={loading} />
        <KPICard title="High Risk" value={highRisk.length} icon={AlertTriangle} color="warning" isLoading={loading} subtitle="Risk score > 65" />
        <KPICard title="Critical" value={critical.length} icon={XCircle} color="danger" isLoading={loading} subtitle="Risk score > 80" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Table */}
        <div className="lg:col-span-3 card overflow-hidden">
          <div className="p-4 border-b border-border-subtle">
            <h3 className="font-semibold text-sm text-text-primary">Supplier Risk Matrix</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle">
                  {['Name','Location','Risk','On-Time','Lead Time','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-text-muted text-xs font-medium uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {loading ? Array.from({length:5}).map((_,i) => (
                  <tr key={i}>{Array.from({length:6}).map((_,j) => (
                    <td key={j} className="px-4 py-3"><div className="shimmer-bg h-4 rounded w-20" /></td>
                  ))}</tr>
                )) : sorted.map(s => (
                  <tr key={s.id} className={`hover:bg-bg-elevated transition-colors ${s.risk_score > 65 ? 'border-l-2 border-orange-700' : ''}`}>
                    <td className="px-4 py-3">
                      <p className="text-text-primary text-xs font-medium">{s.name}</p>
                      <p className="text-text-muted text-[10px]">{s.category}</p>
                    </td>
                    <td className="px-4 py-3 text-text-muted text-xs">{s.location_city}</td>
                    <td className="px-4 py-3"><RiskBadge score={s.risk_score} /></td>
                    <td className="px-4 py-3 w-32"><OnTimeBar value={s.on_time_rate} /></td>
                    <td className="px-4 py-3 text-text-muted text-xs text-center">{s.avg_lead_time_days}d</td>
                    <td className="px-4 py-3">
                      {s.risk_score > 65 && (
                        <button onClick={handleViewAlternatives}
                          className="text-xs text-amber-400 hover:text-amber-300 border border-amber-800 px-2 py-1 rounded transition-colors">
                          {altLoading ? '...' : 'Alternatives'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Alternatives panel */}
          {alternatives && (
            <div className="border-t border-border-subtle p-4">
              <h4 className="text-xs font-semibold text-text-muted mb-3 uppercase">Alternative Suppliers</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {alternatives.slice(0, 3).map(a => (
                  <div key={a.id} className="bg-bg-primary rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="text-text-primary text-xs font-medium">{a.name}</p>
                      <p className="text-text-muted text-[10px]">{a.location_city}</p>
                    </div>
                    <RiskBadge score={a.risk_score} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="lg:col-span-2 card p-5">
          <h3 className="font-semibold text-sm text-text-primary mb-4">Supplier Risk Ranking</h3>
          <div style={{ height: 380 }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  )
}

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
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-interactive)' }}>
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: 'var(--accent-primary)' }} />
      </div>
      <span className="text-xs tabular-nums w-8" style={{ color: 'var(--text-secondary)' }}>{value}%</span>
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
        s.risk_score > 80 ? '#FF5252' : s.risk_score > 65 ? '#FFB300' : s.risk_score > 40 ? '#60A5FA' : '#00E676'
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
          <div className="p-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <h3 className="font-display font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Supplier Risk Matrix</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  {['Name','Location','Risk','On-Time','Lead Time','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? Array.from({length:5}).map((_,i) => (
                  <tr key={i}>{Array.from({length:6}).map((_,j) => (
                    <td key={j} className="px-4 py-3"><div className="shimmer-bg h-4 rounded w-20" /></td>
                  ))}</tr>
                )) : sorted.map(s => (
                  <tr key={s.id} className="transition-colors hover:bg-[var(--bg-elevated)]"
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      borderLeft: s.risk_score > 65 ? '2px solid var(--status-warn)' : 'none',
                    }}>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{s.name}</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-faint)' }}>{s.category}</p>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{s.location_city}</td>
                    <td className="px-4 py-3"><RiskBadge score={s.risk_score} /></td>
                    <td className="px-4 py-3 w-32"><OnTimeBar value={s.on_time_rate} /></td>
                    <td className="px-4 py-3 text-xs text-center" style={{ color: 'var(--text-secondary)' }}>{s.avg_lead_time_days}d</td>
                    <td className="px-4 py-3">
                      {s.risk_score > 65 && (
                        <button onClick={handleViewAlternatives}
                          className="text-xs px-2 py-1 rounded transition-colors cursor-pointer"
                          style={{ color: 'var(--status-warn)', border: '1px solid rgba(255,179,0,0.3)', background: 'none' }}>
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
            <div className="p-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <h4 className="text-xs font-semibold mb-3 uppercase" style={{ color: 'var(--text-faint)' }}>Alternative Suppliers</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {alternatives.slice(0, 3).map(a => (
                  <div key={a.id} className="rounded-lg p-3 flex items-center justify-between"
                    style={{ background: 'var(--bg-elevated)' }}>
                    <div>
                      <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{a.name}</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-faint)' }}>{a.location_city}</p>
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
          <h3 className="font-display font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Supplier Risk Ranking</h3>
          <div style={{ height: 380 }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  )
}

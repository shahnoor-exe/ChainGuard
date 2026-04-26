import CountUp from 'react-countup'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import KPICard from '../common/KPICard'
import { DollarSign, TrendingDown, Shield } from 'lucide-react'
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const DISRUPTION_DATA = [
  { type: 'Weather', count: 4, avgDelay: 3.2, cost: 48000, prevented: 2 },
  { type: 'Traffic', count: 6, avgDelay: 1.8, cost: 32400, prevented: 4 },
  { type: 'Protests', count: 2, avgDelay: 5.1, cost: 61200, prevented: 1 },
  { type: 'Checkpost', count: 3, avgDelay: 2.5, cost: 22500, prevented: 2 },
  { type: 'Operational', count: 2, avgDelay: 1.2, cost: 14400, prevented: 1 },
]

export default function CostImpactModule() {
  const chartData = {
    labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    datasets: [
      { label: 'Without AI', data: [580000, 620000, 540000, 490000, 510000, 420000], backgroundColor: 'rgba(255,82,82,0.4)', borderRadius: 4 },
      { label: 'With ChainGuard', data: [380000, 410000, 350000, 310000, 340000, 290000], backgroundColor: 'rgba(0,212,170,0.6)', borderRadius: 4 },
    ],
  }
  const opts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#8B949E' } } },
    scales: { x: { grid: { color: '#21262D' }, ticks: { color: '#8B949E' } }, y: { grid: { color: '#21262D' }, ticks: { color: '#8B949E', callback: v => `₹${(v/1000).toFixed(0)}K` } } },
  }
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard title="Total Loss This Month" value={420000} prefix="₹" icon={DollarSign} color="danger" />
        <KPICard title="AI Savings This Month" value={180000} prefix="₹" icon={TrendingDown} color="success" />
        <KPICard title="Prevention Rate" value={58.8} suffix="%" decimals={1} icon={Shield} color="teal" />
      </div>
      <div className="card p-5"><h3 className="font-display font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Monthly Cost Comparison</h3><div style={{ height: 300 }}><Bar data={chartData} options={opts} /></div></div>
      <div className="card overflow-hidden">
        <div className="px-4 py-3 font-display font-semibold text-sm" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)' }}>Disruption Breakdown</div>
        <table className="w-full text-sm">
          <thead><tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            {['Type','Count','Avg Delay','Cost Impact','Prevented'].map(h => <th key={h} className="px-4 py-2 text-left text-xs font-medium uppercase" style={{ color: 'var(--text-faint)' }}>{h}</th>)}
          </tr></thead>
          <tbody>{DISRUPTION_DATA.map(d => (
            <tr key={d.type} style={{ borderBottom: '1px solid var(--border-subtle)' }} className="hover:bg-[var(--bg-elevated)]">
              <td className="px-4 py-2" style={{ color: 'var(--text-primary)' }}>{d.type}</td>
              <td className="px-4 py-2 font-mono" style={{ color: 'var(--text-secondary)' }}>{d.count}</td>
              <td className="px-4 py-2 font-mono" style={{ color: 'var(--text-secondary)' }}>{d.avgDelay} hrs</td>
              <td className="px-4 py-2 font-mono" style={{ color: 'var(--status-danger)' }}>₹{d.cost.toLocaleString('en-IN')}</td>
              <td className="px-4 py-2"><span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--status-safe-bg)', color: 'var(--status-safe)' }}>{d.prevented} saved</span></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  )
}

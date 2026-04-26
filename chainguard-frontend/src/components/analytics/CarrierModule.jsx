import { useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { ArrowUpDown } from 'lucide-react'

const CARRIERS = [
  { name: 'Blue Dart Express', shipments: 42, onTime: 91, avgDelay: 0.8, costKm: 12.4, co2Km: 0.18, score: 88 },
  { name: 'TCI Freight', shipments: 38, onTime: 85, avgDelay: 1.4, costKm: 10.2, co2Km: 0.22, score: 76 },
  { name: 'Safexpress', shipments: 31, onTime: 88, avgDelay: 1.1, costKm: 11.8, co2Km: 0.19, score: 82 },
  { name: 'Gati Ltd', shipments: 28, onTime: 78, avgDelay: 2.1, costKm: 9.8, co2Km: 0.25, score: 65 },
  { name: 'VRL Logistics', shipments: 22, onTime: 82, avgDelay: 1.6, costKm: 8.9, co2Km: 0.28, score: 71 },
]

function scoreColor(s) {
  if (s >= 80) return { bg: 'var(--status-safe-bg)', text: 'var(--status-safe)' }
  if (s >= 65) return { bg: 'var(--status-warn-bg)', text: 'var(--status-warn)' }
  return { bg: 'var(--status-danger-bg)', text: 'var(--status-danger)' }
}

export default function CarrierModule() {
  const [sortKey, setSortKey] = useState('score')
  const sorted = [...CARRIERS].sort((a, b) => b[sortKey] - a[sortKey])

  const chartData = {
    labels: sorted.map(c => c.name),
    datasets: [{ label: 'Score', data: sorted.map(c => c.score), backgroundColor: sorted.map(c => c.score >= 80 ? 'rgba(0,230,118,0.5)' : c.score >= 65 ? 'rgba(255,179,0,0.5)' : 'rgba(255,82,82,0.5)'), borderRadius: 4 }],
  }

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <h3 className="font-display font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Carrier Comparison</h3>
        <div style={{ height: 220 }}><Bar data={chartData} options={{ indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: '#21262D' }, ticks: { color: '#8B949E' } }, y: { grid: { display: false }, ticks: { color: '#8B949E', font: { size: 11 } } } } }} /></div>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            {[['name','Carrier'],['shipments','Shipments'],['onTime','On-Time %'],['avgDelay','Avg Delay'],['costKm','₹/km'],['co2Km','CO₂/km'],['score','Score']].map(([k,l]) => (
              <th key={k} className="px-4 py-2 text-left text-xs font-medium uppercase cursor-pointer" style={{ color: 'var(--text-faint)' }} onClick={() => setSortKey(k)}>
                {l} {sortKey === k && <ArrowUpDown className="w-3 h-3 inline" />}
              </th>
            ))}
          </tr></thead>
          <tbody>{sorted.map(c => { const sc = scoreColor(c.score); return (
            <tr key={c.name} className="hover:bg-[var(--bg-elevated)]" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td className="px-4 py-2 font-medium" style={{ color: 'var(--text-primary)' }}>{c.name}</td>
              <td className="px-4 py-2 font-mono" style={{ color: 'var(--text-secondary)' }}>{c.shipments}</td>
              <td className="px-4 py-2 font-mono" style={{ color: 'var(--text-secondary)' }}>{c.onTime}%</td>
              <td className="px-4 py-2 font-mono" style={{ color: 'var(--text-secondary)' }}>{c.avgDelay}h</td>
              <td className="px-4 py-2 font-mono" style={{ color: 'var(--text-secondary)' }}>₹{c.costKm}</td>
              <td className="px-4 py-2 font-mono" style={{ color: 'var(--text-secondary)' }}>{c.co2Km}</td>
              <td className="px-4 py-2"><span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: sc.bg, color: sc.text }}>{c.score}</span></td>
            </tr>
          )})}</tbody>
        </table>
      </div>
    </div>
  )
}

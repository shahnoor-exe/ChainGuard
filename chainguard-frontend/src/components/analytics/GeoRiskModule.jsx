import { ArrowUp, ArrowDown } from 'lucide-react'

const CITIES = [
  { city: 'Mumbai', current: 45, prev: 33 }, { city: 'Delhi', current: 62, prev: 55 },
  { city: 'Bangalore', current: 28, prev: 35 }, { city: 'Chennai', current: 52, prev: 48 },
  { city: 'Kolkata', current: 38, prev: 42 }, { city: 'Hyderabad', current: 41, prev: 38 },
  { city: 'Nagpur', current: 72, prev: 58 }, { city: 'Jaipur', current: 35, prev: 40 },
  { city: 'Ahmedabad', current: 30, prev: 28 }, { city: 'Lucknow', current: 48, prev: 52 },
]

function riskColor(score) {
  if (score <= 30) return 'var(--status-safe)'
  if (score <= 60) return 'var(--status-warn)'
  return 'var(--status-danger)'
}

export default function GeoRiskModule() {
  const sorted = [...CITIES].sort((a, b) => (b.current - b.prev) - (a.current - a.prev))

  return (
    <div className="space-y-5">
      <div className="card overflow-hidden">
        <div className="px-4 py-3 font-display font-semibold text-sm" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)' }}>City Risk Comparison (vs Last Month)</div>
        <table className="w-full text-sm">
          <thead><tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            {['City','Current Risk','Previous','Change','Trend'].map(h => <th key={h} className="px-4 py-2 text-left text-xs font-medium uppercase" style={{ color: 'var(--text-faint)' }}>{h}</th>)}
          </tr></thead>
          <tbody>{sorted.map(c => {
            const delta = c.current - c.prev
            const up = delta > 0
            return (
              <tr key={c.city} className="hover:bg-[var(--bg-elevated)]" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td className="px-4 py-2 font-medium" style={{ color: 'var(--text-primary)' }}>{c.city}</td>
                <td className="px-4 py-2 font-mono" style={{ color: riskColor(c.current) }}>{c.current}</td>
                <td className="px-4 py-2 font-mono" style={{ color: 'var(--text-faint)' }}>{c.prev}</td>
                <td className="px-4 py-2 font-mono font-bold" style={{ color: up ? 'var(--status-danger)' : 'var(--status-safe)' }}>
                  {up ? '+' : ''}{delta}
                </td>
                <td className="px-4 py-2">{up ? <ArrowUp className="w-4 h-4" style={{ color: 'var(--status-danger)' }} /> : <ArrowDown className="w-4 h-4" style={{ color: 'var(--status-safe)' }} />}</td>
              </tr>
            )
          })}</tbody>
        </table>
      </div>
    </div>
  )
}

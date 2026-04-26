import { AlertTriangle } from 'lucide-react'

const ROUTES = [
  { route: 'Mumbai → Delhi', dist: 1400, planned: 24500, actual: 30200, eff: 81, trend: [85, 82, 80, 81] },
  { route: 'Delhi → Kolkata', dist: 1500, planned: 22000, actual: 25800, eff: 85, trend: [88, 86, 84, 85] },
  { route: 'Bangalore → Chennai', dist: 350, planned: 8200, actual: 8800, eff: 93, trend: [91, 92, 93, 93] },
  { route: 'Mumbai → Pune', dist: 150, planned: 4500, actual: 4600, eff: 98, trend: [97, 98, 97, 98] },
  { route: 'Delhi → Jaipur', dist: 280, planned: 6800, actual: 7200, eff: 94, trend: [93, 94, 95, 94] },
  { route: 'Hyderabad → Nagpur', dist: 500, planned: 11000, actual: 13500, eff: 81, trend: [84, 82, 80, 81] },
  { route: 'Kolkata → Bhubaneswar', dist: 440, planned: 9200, actual: 9800, eff: 94, trend: [93, 94, 94, 94] },
  { route: 'Ahmedabad → Indore', dist: 390, planned: 8500, actual: 9100, eff: 93, trend: [92, 93, 93, 93] },
  { route: 'Chennai → Coimbatore', dist: 510, planned: 10200, actual: 11800, eff: 86, trend: [88, 87, 86, 86] },
  { route: 'Delhi → Lucknow', dist: 550, planned: 12500, actual: 14200, eff: 88, trend: [89, 88, 87, 88] },
]

function effColor(e) {
  if (e >= 90) return { bg: 'var(--status-safe-bg)', text: 'var(--status-safe)' }
  if (e >= 70) return { bg: 'var(--status-warn-bg)', text: 'var(--status-warn)' }
  return { bg: 'var(--status-danger-bg)', text: 'var(--status-danger)' }
}

export default function RouteEfficiencyModule() {
  const worst = [...ROUTES].sort((a, b) => a.eff - b.eff)[0]
  const overCost = worst.actual - worst.planned

  return (
    <div className="space-y-5">
      <div className="card p-4 flex items-start gap-3" style={{ borderLeft: '3px solid var(--status-danger)' }}>
        <AlertTriangle className="w-5 h-5 shrink-0" style={{ color: 'var(--status-danger)' }} />
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Most wasteful route: {worst.route}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{100 - worst.eff}% over optimal cost. Savings opportunity: ₹{(overCost * 4).toLocaleString('en-IN')}/month</p>
        </div>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            {['Route','Distance','Planned ₹','Actual ₹','Efficiency','Trend'].map(h => <th key={h} className="px-4 py-2 text-left text-xs font-medium uppercase" style={{ color: 'var(--text-faint)' }}>{h}</th>)}
          </tr></thead>
          <tbody>{ROUTES.map(r => { const ec = effColor(r.eff); return (
            <tr key={r.route} className="hover:bg-[var(--bg-elevated)]" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td className="px-4 py-2 font-medium" style={{ color: 'var(--text-primary)' }}>{r.route}</td>
              <td className="px-4 py-2 font-mono" style={{ color: 'var(--text-secondary)' }}>{r.dist} km</td>
              <td className="px-4 py-2 font-mono" style={{ color: 'var(--text-secondary)' }}>₹{r.planned.toLocaleString('en-IN')}</td>
              <td className="px-4 py-2 font-mono" style={{ color: 'var(--text-secondary)' }}>₹{r.actual.toLocaleString('en-IN')}</td>
              <td className="px-4 py-2"><span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: ec.bg, color: ec.text }}>{r.eff}%</span></td>
              <td className="px-4 py-2">
                <svg width="60" height="20" viewBox="0 0 60 20">
                  <polyline points={r.trend.map((v, i) => `${i * 20},${20 - (v - 70) * 0.66}`).join(' ')}
                    fill="none" stroke="var(--accent-primary)" strokeWidth="1.5" />
                </svg>
              </td>
            </tr>
          )})}</tbody>
        </table>
      </div>
    </div>
  )
}

import CountUp from 'react-countup'
import { Leaf } from 'lucide-react'

const AVG_CO2 = 48
const INDUSTRY_AVG = 62
const TARGET = 40
const ANNUAL_TARGET = 650
const MONTHLY_CO2 = 234
const GREEN_SAVING = 42

function getGrade(avg) {
  if (avg <= 40) return { grade: 'A', color: 'var(--accent-primary)' }
  if (avg <= 55) return { grade: 'B+', color: 'var(--status-warn)' }
  if (avg <= 70) return { grade: 'C', color: 'var(--status-danger)' }
  return { grade: 'D', color: 'var(--status-critical)' }
}

export default function CarbonESGModule() {
  const { grade, color } = getGrade(AVG_CO2)
  const usedPct = Math.round((MONTHLY_CO2 * 12) / ANNUAL_TARGET * 100)

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6 text-center" style={{ borderTop: `3px solid ${color}` }}>
          <p className="text-5xl font-bold font-display" style={{ color }}>{grade}</p>
          <p className="text-xs font-medium uppercase mt-2" style={{ color: 'var(--text-secondary)' }}>ESG Carbon Grade</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>{AVG_CO2} kg/shipment avg</p>
        </div>
        <div className="card p-6">
          <p className="text-xs uppercase font-medium mb-2" style={{ color: 'var(--text-faint)' }}>Benchmark</p>
          {[{ label: 'Your Avg', value: AVG_CO2, c: color }, { label: 'Industry', value: INDUSTRY_AVG, c: 'var(--status-warn)' }, { label: 'Target', value: TARGET, c: 'var(--accent-primary)' }].map(b => (
            <div key={b.label} className="mb-2">
              <div className="flex justify-between text-xs mb-0.5"><span style={{ color: 'var(--text-secondary)' }}>{b.label}</span><span className="font-mono" style={{ color: b.c }}>{b.value} kg</span></div>
              <div className="h-1.5 rounded-full" style={{ background: 'var(--bg-interactive)' }}><div className="h-full rounded-full" style={{ width: `${Math.min(b.value, 80)}%`, background: b.c }} /></div>
            </div>
          ))}
        </div>
        <div className="card p-6" style={{ borderLeft: '3px solid var(--accent-primary)' }}>
          <Leaf className="w-5 h-5 mb-2" style={{ color: 'var(--accent-primary)' }} />
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Green Route Simulation</p>
          <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
            Switching to green routing for all shipments would save <span className="font-bold" style={{ color: 'var(--accent-primary)' }}>{GREEN_SAVING} kg CO₂</span> this month ({Math.round(GREEN_SAVING / MONTHLY_CO2 * 100)}% reduction).
          </p>
        </div>
      </div>
      <div className="card p-5">
        <h3 className="font-display font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Annual Carbon Goal Tracker</h3>
        <div className="flex justify-between text-xs mb-2"><span style={{ color: 'var(--text-secondary)' }}>Progress</span><span className="font-mono" style={{ color: 'var(--text-primary)' }}>{MONTHLY_CO2 * 12} / {ANNUAL_TARGET} kg</span></div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--bg-interactive)' }}>
          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(usedPct, 100)}%`, background: usedPct > 100 ? 'var(--status-danger)' : 'var(--accent-primary)' }} />
        </div>
        <p className="text-xs mt-2" style={{ color: usedPct > 100 ? 'var(--status-danger)' : 'var(--text-faint)' }}>
          {usedPct > 100 ? `⚠ Projected ${usedPct}% — over target` : `On track — projected ${usedPct}% of annual budget`}
        </p>
      </div>
    </div>
  )
}

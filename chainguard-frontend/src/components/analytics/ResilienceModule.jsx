import { useEffect, useState } from 'react'
import CountUp from 'react-countup'
import { Line } from 'react-chartjs-2'

export default function ResilienceModule() {
  const score = 74
  const [animatedScore, setAnimatedScore] = useState(0)
  useEffect(() => { const t = setTimeout(() => setAnimatedScore(score), 200); return () => clearTimeout(t) }, [])
  const circumference = 2 * Math.PI * 60
  const offset = circumference - (animatedScore / 100) * circumference
  const color = score > 70 ? 'var(--accent-primary)' : score > 40 ? 'var(--status-warn)' : 'var(--status-danger)'

  const breakdown = [
    { label: 'On-Time Rate', pts: 38, max: 40, color: 'var(--status-safe)' },
    { label: 'Supplier Health', pts: 20, max: 30, color: 'var(--accent-cyan)' },
    { label: 'Disruption Resilience', pts: 16, max: 30, color: 'var(--accent-primary)' },
  ]

  const trendData = {
    labels: ['Apr','May','Jun','Jul','Aug','Sep'],
    datasets: [{ label: 'Resilience Score', data: [62,65,68,70,72,74], borderColor: '#00D4AA', backgroundColor: 'rgba(0,212,170,0.1)', fill: true, tension: 0.4, pointRadius: 4 }],
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-8 flex items-center justify-center">
          <div className="relative">
            <svg width="160" height="160" className="-rotate-90">
              <circle cx="80" cy="80" r="60" fill="none" stroke="var(--bg-interactive)" strokeWidth="10" />
              <circle cx="80" cy="80" r="60" fill="none" stroke={color} strokeWidth="10"
                strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>
                <CountUp end={score} duration={1.5} />
              </span>
              <span className="text-xs" style={{ color: 'var(--text-faint)' }}>/100</span>
              <span className="text-xs font-medium mt-1" style={{ color }}>Resilient</span>
            </div>
          </div>
        </div>
        <div className="card p-6 space-y-4">
          <h3 className="font-display font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Score Breakdown</h3>
          {breakdown.map(b => (
            <div key={b.label}>
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: 'var(--text-secondary)' }}>{b.label}</span>
                <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{b.pts}/{b.max} pts</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-interactive)' }}>
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(b.pts / b.max) * 100}%`, background: b.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="card p-5">
        <h3 className="font-display font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>6-Month Resilience Trend</h3>
        <div style={{ height: 220 }}>
          <Line data={trendData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: '#21262D' }, ticks: { color: '#8B949E' } }, y: { grid: { color: '#21262D' }, ticks: { color: '#8B949E' }, min: 50, max: 100 } } }} />
        </div>
      </div>
    </div>
  )
}

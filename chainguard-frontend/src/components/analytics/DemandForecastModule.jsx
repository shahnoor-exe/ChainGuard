import { Line } from 'react-chartjs-2'
import { AlertTriangle } from 'lucide-react'

const ACTUAL = [120,135,128,140,132,150,145,138,155,148,160,165,170,158,175,180,162,185,190,172,195,188,200,205,198,210,208,215,220,212]
const FORECAST = [218,225,230,245,260,248,270,265,255,280,290,275,300,310,295,285,320,315,305,330,340,325,350,345,335,360,355,350,365,370]
const CAPACITY = 280

export default function DemandForecastModule() {
  const labels = [...Array(60)].map((_, i) => i < 30 ? `Day ${i + 1}` : `F+${i - 29}`)
  const combinedActual = [...ACTUAL, ...Array(30).fill(null)]
  const combinedForecast = [...Array(30).fill(null), ...FORECAST]

  const overCapacity = FORECAST.map((v, i) => v > CAPACITY ? { week: `Week ${Math.floor(i / 7) + 1}`, pct: Math.round(((v - CAPACITY) / CAPACITY) * 100), day: i + 31 } : null).filter(Boolean)
  const uniqueWeeks = [...new Map(overCapacity.map(o => [o.week, o])).values()]

  const chartData = {
    labels,
    datasets: [
      { label: 'Actual', data: combinedActual, borderColor: '#00D4AA', backgroundColor: 'rgba(0,212,170,0.1)', fill: false, tension: 0.3, pointRadius: 0 },
      { label: 'Forecast', data: combinedForecast, borderColor: '#00D4AA', borderDash: [6, 4], backgroundColor: 'rgba(255,82,82,0.08)', fill: true, tension: 0.3, pointRadius: 0 },
      { label: 'Capacity', data: Array(60).fill(CAPACITY), borderColor: '#484F58', borderDash: [4, 4], pointRadius: 0, fill: false },
    ],
  }

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <h3 className="font-display font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>30-Day Actual + 30-Day Forecast</h3>
        <div style={{ height: 280 }}>
          <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#8B949E' } } }, scales: { x: { grid: { color: '#21262D' }, ticks: { color: '#8B949E', maxTicksLimit: 12 } }, y: { grid: { color: '#21262D' }, ticks: { color: '#8B949E' } } } }} />
        </div>
      </div>
      {uniqueWeeks.length > 0 && (
        <div className="space-y-3">
          {uniqueWeeks.map(w => (
            <div key={w.week} className="card p-4 flex items-start gap-3" style={{ borderLeft: '3px solid var(--status-danger)' }}>
              <AlertTriangle className="w-5 h-5 shrink-0" style={{ color: 'var(--status-danger)' }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{w.week}: Demand +{w.pct}% above capacity</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Activate backup supplier: Mahindra Spares (5-day lead time)</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

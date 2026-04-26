import { Leaf, TrendingDown, CheckCircle } from 'lucide-react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, LineElement, PointElement,
  CategoryScale, LinearScale, Tooltip, Legend, Filler,
} from 'chart.js'
import KPICard from '../common/KPICard'
import { useShipments } from '../../hooks/useShipments'

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler)

function buildTrend(shipments) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
  })

  // Simulate daily CO2 totals from seeded data
  const actual  = [312, 428, 385, 440, 396, 462, 348]
  const green   = [210, 290, 260, 298, 270, 312, 235]

  return { labels: days, actual, green }
}

export default function CarbonView() {
  const { data: shipments } = useShipments()

  const totalCo2   = shipments.reduce((sum, s) => sum + (s.weight_kg || 0) * 0.08, 0)
  const avgCo2     = shipments.length ? (totalCo2 / shipments.length) : 0
  const greenCount = shipments.filter(s => s.risk_score <= 30).length
  const greenPct   = shipments.length ? Math.round(greenCount / shipments.length * 100) : 0

  const trend = buildTrend(shipments)

  const chartData = {
    labels: trend.labels,
    datasets: [
      {
        label: 'Actual Emissions (kg CO₂)',
        data: trend.actual,
        borderColor: '#FFB300',
        backgroundColor: 'rgba(255,179,0,0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: '#FFB300',
      },
      {
        label: 'If Greenest Route Chosen',
        data: trend.green,
        borderColor: '#00E676',
        backgroundColor: 'rgba(0,230,118,0.08)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        borderDash: [6, 4],
        pointRadius: 4,
        pointBackgroundColor: '#00E676',
      },
    ],
  }
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#8B949E', padding: 20, font: { size: 11 } },
      },
      tooltip: {
        callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y} kg` },
      },
    },
    scales: {
      x: { grid: { color: '#21262D' }, ticks: { color: '#8B949E' } },
      y: {
        grid: { color: '#21262D' }, ticks: { color: '#8B949E' },
        title: { display: true, text: 'kg CO₂', color: '#8B949E' },
      },
    },
  }

  return (
    <div className="space-y-5">
      <h2 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Carbon Footprint Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          title="Total CO₂ This Month"
          value={Math.round(totalCo2)}
          suffix=" kg"
          icon={Leaf} color="warning"
          subtitle="Across all active shipments"
        />
        <KPICard
          title="Avg Per Shipment"
          value={avgCo2}
          suffix=" kg"
          decimals={1}
          icon={TrendingDown} color="success"
          subtitle="CO₂ equivalent"
        />
        <KPICard
          title="Green Routes Chosen"
          value={greenPct}
          suffix="%"
          icon={CheckCircle} color="success"
          subtitle={`${greenCount} of ${shipments.length} shipments`}
        />
      </div>

      {/* Line chart */}
      <div className="card p-5">
        <h3 className="font-display font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
          Carbon Emissions vs. Green Route Potential — Last 7 Days
        </h3>
        <div style={{ height: 320 }}>
          <Line data={chartData} options={chartOptions} />
        </div>
        <p className="text-xs mt-3 text-center" style={{ color: 'var(--text-secondary)' }}>
          Switching to greenest routes could reduce emissions by ~{Math.round((1 - trend.green.reduce((a,b)=>a+b,0)/trend.actual.reduce((a,b)=>a+b,0))*100)}%
        </p>
      </div>

      {/* Per-shipment breakdown */}
      <div className="card p-5">
        <h3 className="font-display font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Top 10 Highest Emission Shipments</h3>
        <div className="space-y-2">
          {[...shipments]
            .sort((a,b) => b.weight_kg - a.weight_kg)
            .slice(0, 10)
            .map(s => {
              const co2 = ((s.weight_kg || 0) * 0.08).toFixed(1)
              const pct = Math.min(100, (s.weight_kg || 0) / 10)
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <span className="text-xs w-20 font-mono shrink-0" style={{ color: 'var(--text-secondary)' }}>{s.shipment_code}</span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-interactive)' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#FFB300' }} />
                  </div>
                  <span className="text-xs w-16 text-right tabular-nums shrink-0" style={{ color: 'var(--text-secondary)' }}>{co2} kg</span>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}

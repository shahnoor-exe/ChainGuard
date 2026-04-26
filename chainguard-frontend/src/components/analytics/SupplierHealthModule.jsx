import { Radar } from 'react-chartjs-2'
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js'
import { useSuppliers } from '../../hooks/useSuppliers'
import { Award } from 'lucide-react'
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

export default function SupplierHealthModule() {
  const { data: suppliers } = useSuppliers()
  const top3 = [...suppliers].sort((a, b) => a.risk_score - b.risk_score).slice(0, 3)
  const best = top3[0]
  const colors = ['rgba(0,212,170,0.4)', 'rgba(0,180,216,0.4)', 'rgba(171,71,188,0.4)']
  const borders = ['#00D4AA', '#00B4D8', '#AB47BC']

  const radarData = {
    labels: ['On-Time Rate', 'Lead Time', 'Cost Index', 'Risk Score', 'Weather Exposure', 'Disruption History'],
    datasets: top3.map((s, i) => ({
      label: s.name, data: [s.on_time_rate, 100 - s.avg_lead_time_days * 10, 80, 100 - s.risk_score, 100 - (s.weather_risk || 20), 85 - i * 5],
      backgroundColor: colors[i], borderColor: borders[i], borderWidth: 2, pointRadius: 3,
    })),
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <h3 className="font-display font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Top 3 Suppliers — Radar</h3>
          <div style={{ height: 300 }}>
            <Radar data={radarData} options={{ responsive: true, maintainAspectRatio: false, scales: { r: { grid: { color: '#21262D' }, ticks: { display: false }, pointLabels: { color: '#8B949E', font: { size: 10 } } } }, plugins: { legend: { labels: { color: '#8B949E' } } } }} />
          </div>
        </div>
        {best && (
          <div className="card p-6 flex flex-col items-center justify-center text-center">
            <Award className="w-10 h-10 mb-3" style={{ color: '#FFB300' }} />
            <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Supplier of the Month</h3>
            <p className="text-xl font-semibold mt-2" style={{ color: 'var(--accent-primary)' }}>{best.name}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{best.location_city}</p>
            <div className="grid grid-cols-3 gap-4 mt-4 text-center">
              {[{ label: 'On-Time', value: `${best.on_time_rate}%` }, { label: 'Risk', value: best.risk_score }, { label: 'Lead Time', value: `${best.avg_lead_time_days}d` }].map(m => (
                <div key={m.label}><p className="text-lg font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{m.value}</p><p className="text-[10px] uppercase" style={{ color: 'var(--text-faint)' }}>{m.label}</p></div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

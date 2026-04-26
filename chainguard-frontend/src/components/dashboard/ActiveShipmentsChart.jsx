import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
ChartJS.register(ArcElement, Tooltip, Legend)

export default function ActiveShipmentsChart({ shipments = [] }) {
  const counts = {
    in_transit: shipments.filter(s => s.status === 'in_transit').length,
    at_risk:    shipments.filter(s => s.status === 'at_risk').length,
    delayed:    shipments.filter(s => s.status === 'delayed').length,
    delivered:  shipments.filter(s => s.status === 'delivered').length,
  }
  const data = {
    labels: ['In Transit', 'At Risk', 'Delayed', 'Delivered'],
    datasets: [{
      data: [counts.in_transit, counts.at_risk, counts.delayed, counts.delivered],
      backgroundColor: ['#60A5FA','#FF5252','#FFB300','#00E676'],
      borderColor: '#161B22',
      borderWidth: 3,
    }],
  }
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#8B949E', padding: 16, font: { size: 11, family: 'Inter' } },
      },
      tooltip: {
        callbacks: {
          label: ctx => ` ${ctx.label}: ${ctx.parsed} shipments`,
        },
      },
    },
  }
  return (
    <div className="card p-5">
      <h3 className="font-display font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Shipments by Status</h3>
      <div style={{ height: 220 }}>
        <Doughnut data={data} options={options} />
      </div>
    </div>
  )
}

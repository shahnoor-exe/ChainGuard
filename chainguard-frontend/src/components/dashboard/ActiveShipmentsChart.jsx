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
      backgroundColor: ['#3B82F6','#EF4444','#F59E0B','#00C896'],
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
        labels: { color: '#8B949E', padding: 16, font: { size: 11 } },
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
      <h3 className="font-semibold text-sm text-text-primary mb-4">Shipments by Status</h3>
      <div style={{ height: 220 }}>
        <Doughnut data={data} options={options} />
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import CountUp from 'react-countup'
import { motion } from 'framer-motion'
import { Line, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, LineElement, PointElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Filler } from 'chart.js'
import { useAuth } from '../../context/AuthContext'
import { useDashboardKPIs } from '../../hooks/useDashboardKPIs'
import { useDisruptions } from '../../hooks/useDisruptions'
import { useSuppliers } from '../../hooks/useSuppliers'
import { useTypewriter } from '../../hooks/useTypewriter'

ChartJS.register(LineElement, PointElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Filler)

const METRIC_TILES = [
  { key: 'ontime', label: 'On-Time Delivery Rate', value: 81.2, suffix: '%', color: 'var(--status-safe)', border: 'var(--status-safe)' },
  { key: 'cost', label: 'Disruption Cost This Week', value: 420000, prefix: '₹', format: true, color: 'var(--status-danger)', border: 'var(--status-danger)' },
  { key: 'savings', label: 'AI Savings Generated', value: 180000, prefix: '₹', format: true, color: 'var(--accent-primary)', border: 'var(--accent-primary)' },
  { key: 'resilience', label: 'Network Resilience', value: 74, suffix: '/100', color: 'var(--accent-cyan)', border: 'var(--accent-cyan)' },
  { key: 'active', label: 'Active Shipments', value: 24, color: '#60A5FA', border: '#60A5FA' },
  { key: 'esg', label: 'Carbon ESG Score', value: 'B+', isText: true, color: 'var(--status-warn)', border: 'var(--status-warn)' },
]

function buildSummary(kpis, disruptions, suppliers) {
  const dCount = disruptions?.length || 8
  const routes = kpis?.total_shipments || 30
  const prevented = Math.floor(dCount * 0.6)
  const savings = '1,80,000'
  const topSupplier = suppliers?.sort((a, b) => b.risk_score - a.risk_score)?.[0]
  const altSupplier = suppliers?.find(s => s.risk_score < 20)
  return `This week, ChainGuard detected ${dCount} supply chain disruptions across ${routes} active routes. Through proactive re-routing, ${prevented} potential delays were prevented, saving an estimated ₹${savings} in SLA penalties. Key risk: NH-44 corridor remains elevated (risk score: 72/100) due to monsoon activity near Nagpur. Supplier ${topSupplier?.name || 'Amul Dairy'} requires attention (risk: ${topSupplier?.risk_score || 88}/100). Recommended action: activate backup supplier ${altSupplier?.name || 'Mahindra Spares'} (risk: ${altSupplier?.risk_score || 15}/100).`
}

export default function ExecutiveDashboard() {
  const { user } = useAuth()
  const { data: kpis } = useDashboardKPIs()
  const { data: disruptions } = useDisruptions()
  const { data: suppliers } = useSuppliers()

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const summaryText = buildSummary(kpis, disruptions, suppliers)
  const { displayed: typedSummary } = useTypewriter(summaryText, 15, 500)

  const costChartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      { label: 'Without AI', data: [580000, 620000, 540000, 490000], backgroundColor: 'rgba(255,82,82,0.3)', borderColor: '#FF5252', fill: true, tension: 0.4 },
      { label: 'With ChainGuard', data: [380000, 410000, 350000, 310000], backgroundColor: 'rgba(0,212,170,0.15)', borderColor: '#00D4AA', fill: true, tension: 0.4 },
    ],
  }
  const perfChartData = {
    labels: ['W1','W2','W3','W4','W5','W6','W7','W8','W9','W10','W11','W12'],
    datasets: [
      { label: 'On-Time Rate', data: [72,74,73,76,78,75,79,80,78,81,82,81.2], borderColor: '#00D4AA', backgroundColor: 'rgba(0,212,170,0.1)', fill: true, tension: 0.4, pointRadius: 3 },
      { label: 'Target (85%)', data: Array(12).fill(85), borderColor: '#484F58', borderDash: [6, 4], pointRadius: 0, fill: false },
    ],
  }
  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#8B949E', font: { size: 11 } } } },
    scales: { x: { grid: { color: '#21262D' }, ticks: { color: '#8B949E' } }, y: { grid: { color: '#21262D' }, ticks: { color: '#8B949E' } } },
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="text-center">
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>ChainGuard Intelligence Report</h1>
        <p className="text-sm font-mono mt-1" style={{ color: 'var(--text-secondary)' }}>{today}</p>
        <p className="text-lg font-display mt-2" style={{ color: 'var(--accent-primary)' }}>{greeting}, {user?.full_name?.split(' ')[0]}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {METRIC_TILES.map((m, i) => (
          <motion.div key={m.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }} className="card p-6 text-center"
            style={{ borderTop: `3px solid ${m.border}` }}>
            <div className="text-3xl font-bold font-display mb-2 tabular-nums" style={{ color: 'var(--text-primary)' }}>
              {m.isText ? m.value : (
                <CountUp end={m.value} duration={2} prefix={m.prefix || ''} suffix={m.suffix || ''}
                  separator="," decimals={m.suffix === '%' ? 1 : 0} />
              )}
            </div>
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{m.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <h3 className="font-display font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Weekly Disruption Cost</h3>
          <div style={{ height: 250 }}><Line data={costChartData} options={chartOpts} /></div>
        </div>
        <div className="card p-5">
          <h3 className="font-display font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Delivery Performance Trend</h3>
          <div style={{ height: 250 }}><Line data={perfChartData} options={chartOpts} /></div>
        </div>
      </div>

      <div className="card p-5" style={{ borderLeft: '3px solid var(--accent-primary)' }}>
        <h3 className="font-display font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Weekly Intelligence Summary</h3>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
          {typedSummary}<span className="inline-block w-0.5 h-4 ml-0.5 align-middle" style={{ background: 'var(--accent-primary)', animation: 'typewriter-cursor 1s infinite' }} />
        </p>
      </div>

      <div className="text-center no-print">
        <button onClick={() => window.print()} className="btn-secondary">
          📄 Download Weekly Report (PDF)
        </button>
      </div>
    </div>
  )
}

import CountUp from 'react-countup'
import { motion } from 'framer-motion'

export default function KPICard({ title, value, subtitle, trend, icon: Icon, color = 'blue', isLoading, suffix = '', prefix = '', decimals = 0 }) {
  const colorMap = {
    blue:    { icon: '#00B4D8', border: 'rgba(0,180,216,0.2)', glow: 'rgba(0,180,216,0.1)' },
    success: { icon: '#00E676', border: 'rgba(0,230,118,0.2)', glow: 'rgba(0,230,118,0.1)' },
    danger:  { icon: '#FF5252', border: 'rgba(255,82,82,0.2)', glow: 'rgba(255,82,82,0.1)' },
    warning: { icon: '#FFB300', border: 'rgba(255,179,0,0.2)', glow: 'rgba(255,179,0,0.1)' },
    teal:    { icon: '#00D4AA', border: 'rgba(0,212,170,0.2)', glow: 'rgba(0,212,170,0.1)' },
  }
  const c = colorMap[color] || colorMap.blue

  if (isLoading) {
    return (
      <div className="card p-5 flex flex-col gap-3">
        <div className="shimmer-bg h-3 w-20 rounded" />
        <div className="shimmer-bg h-7 w-16 rounded" />
        <div className="shimmer-bg h-3 w-24 rounded" />
      </div>
    )
  }

  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value
  const isNumber = !isNaN(numValue) && isFinite(numValue)
  const trendPositive = trend > 0

  return (
    <motion.div
      whileHover={{ borderColor: 'var(--border-accent)', boxShadow: `0 0 20px ${c.glow}` }}
      className="card p-5 flex flex-col gap-2 transition-all cursor-default"
      style={{ borderColor: c.border }}
    >
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider font-display"
          style={{ color: 'var(--text-secondary)' }}>{title}</p>
        {Icon && (
          <div className="p-2 rounded-lg" style={{ background: `${c.icon}15`, color: c.icon }}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="text-2xl font-bold font-display tabular-nums" style={{ color: 'var(--text-primary)' }}>
        {isNumber ? (
          <CountUp end={numValue} duration={1.5} decimals={decimals}
            prefix={prefix} suffix={suffix} separator="," useEasing={true} />
        ) : value}
      </div>

      <div className="flex items-center gap-2">
        {subtitle && <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>}
        {trend !== undefined && (
          <motion.span
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-medium font-mono"
            style={{ color: trendPositive ? 'var(--status-safe)' : 'var(--status-danger)' }}
          >
            {trendPositive ? '↑' : '↓'} {Math.abs(trend)}%
          </motion.span>
        )}
      </div>
    </motion.div>
  )
}

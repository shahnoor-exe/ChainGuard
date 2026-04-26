import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Zap, Cloud, Truck, Flag, Construction } from 'lucide-react'
import { useTypewriter } from '../../hooks/useTypewriter'
import { useDisruptions } from '../../hooks/useDisruptions'

const SEVERITY_CONFIG = {
  critical: { color: 'var(--status-critical)', bg: 'var(--status-crit-bg)', label: 'CRIT' },
  high:     { color: 'var(--status-danger)',   bg: 'var(--status-danger-bg)', label: 'HIGH' },
  medium:   { color: 'var(--status-warn)',     bg: 'var(--status-warn-bg)', label: 'MED' },
  low:      { color: 'var(--status-safe)',     bg: 'var(--status-safe-bg)', label: 'LOW' },
}

const TYPE_ICONS = {
  weather: Cloud, traffic: Truck, news: Flag,
  festival: Flag, checkpost: Construction, operational: Zap,
}

function timeAgo(date) {
  if (!date) return ''
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function AlertTitle({ text, animate }) {
  const { displayed } = useTypewriter(text, 25, 0)
  return <span>{animate ? displayed : text}</span>
}

function AlertItem({ alert, index, isNew }) {
  const sev = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.medium
  const Icon = TYPE_ICONS[alert.type] || AlertTriangle
  const isCritical = alert.severity === 'critical'

  return (
    <motion.div
      layout
      initial={isNew ? { y: -40, opacity: 0 } : false}
      animate={{ y: 0, opacity: 1 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="flex gap-3 p-3 rounded-lg transition-colors"
      style={{
        background: isCritical ? 'rgba(255,23,68,0.04)' : 'var(--bg-elevated)',
        borderLeft: `3px solid ${sev.color}`,
        animation: isCritical ? 'glow-pulse 2s ease-in-out infinite' : undefined,
      }}
    >
      <motion.div initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ duration: 0.4 }}
        className="shrink-0 mt-0.5">
        <Icon className="w-4 h-4" style={{ color: sev.color }} />
      </motion.div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold font-display truncate" style={{ color: 'var(--text-primary)' }}>
            <AlertTitle text={alert.title} animate={isNew && index < 3} />
          </p>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0"
            style={{ background: sev.bg, color: sev.color }}>{sev.label}</span>
        </div>
        <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{alert.description}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] font-mono" style={{ color: 'var(--text-faint)' }}>{timeAgo(alert.detected_at)}</span>
          {alert.affected_cities?.slice(0, 3).map(city => (
            <span key={city} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-interactive)', color: 'var(--text-secondary)' }}>{city}</span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default function DisruptionFeed() {
  const { data: disruptions } = useDisruptions()
  const active = disruptions.filter(d => d.is_active).slice(0, 8)

  return (
    <div className="card flex flex-col" style={{ maxHeight: 480 }}>
      <div className="px-4 py-3 flex items-center justify-between shrink-0"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <h3 className="font-display font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
          Disruption Feed
        </h3>
        <div className="flex items-center gap-1.5">
          <span className="live-dot w-2 h-2 rounded-full" style={{ background: 'var(--status-danger)' }} />
          <span className="text-[10px] font-bold" style={{ color: 'var(--status-danger)' }}>LIVE</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <AnimatePresence>
          {active.length === 0 ? (
            <p className="text-center py-8 text-sm" style={{ color: 'var(--text-faint)' }}>No active disruptions</p>
          ) : active.map((alert, i) => (
            <AlertItem key={alert.id} alert={alert} index={i} isNew={i < 3} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

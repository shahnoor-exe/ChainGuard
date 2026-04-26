import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const ICONS = {
  success: { Icon: CheckCircle2, color: 'var(--status-safe)', border: 'var(--status-safe)' },
  warning: { Icon: AlertTriangle, color: 'var(--status-warn)', border: 'var(--status-warn)' },
  error:   { Icon: XCircle,       color: 'var(--status-danger)', border: 'var(--status-danger)' },
  info:    { Icon: Info,          color: 'var(--accent-primary)', border: 'var(--accent-primary)' },
}

function Toast({ id, msg, type = 'info', title }) {
  const { removeToast } = useApp()
  const { Icon, color, border } = ICONS[type] || ICONS.info

  return (
    <motion.div
      layout
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 60, opacity: 0, height: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="relative rounded-lg p-3.5 min-w-[320px] max-w-[420px] flex items-start gap-3"
      style={{
        background: 'var(--bg-elevated)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border-default)',
        borderLeft: `3px solid ${border}`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      <Icon className="w-5 h-5 shrink-0 mt-0.5" style={{ color }} />
      <div className="flex-1 min-w-0">
        {title && <p className="text-sm font-semibold font-display" style={{ color: 'var(--text-primary)' }}>{title}</p>}
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{msg}</p>
      </div>
      <button onClick={() => removeToast(id)}
        className="shrink-0 cursor-pointer" style={{ color: 'var(--text-faint)', background: 'none', border: 'none' }}>
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

export default function AlertToastContainer() {
  const { toasts } = useApp()
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map(t => <Toast key={t.id} {...t} />)}
      </AnimatePresence>
    </div>
  )
}

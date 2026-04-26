import { motion } from 'framer-motion'
import { ShieldX } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { ROLE_VIEWS, ROLE_LABELS } from '../../config'

export default function AccessDenied({ onNavigate }) {
  const { user } = useAuth()
  const roleLabel = ROLE_LABELS[user?.role]?.label || user?.role

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="card p-10 text-center max-w-md"
        style={{ borderColor: 'var(--border-accent)' }}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <ShieldX className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--status-danger)' }} />
        </motion.div>

        <h2 className="font-display text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
          Access Restricted
        </h2>

        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          Your current role <span className="font-mono px-2 py-0.5 rounded text-xs" style={{
            background: 'var(--bg-interactive)', color: ROLE_LABELS[user?.role]?.color || 'var(--text-primary)'
          }}>({roleLabel})</span> does not have permission
          to access this section. Contact your administrator to request access.
        </p>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate(ROLE_VIEWS[user?.role]?.[0] || 'dashboard')}
          className="px-6 py-2.5 rounded-lg text-sm font-medium font-display cursor-pointer"
          style={{
            background: 'transparent',
            border: '1px solid var(--accent-primary)',
            color: 'var(--accent-primary)',
          }}
        >
          ← Return to My Dashboard
        </motion.button>
      </motion.div>
    </div>
  )
}

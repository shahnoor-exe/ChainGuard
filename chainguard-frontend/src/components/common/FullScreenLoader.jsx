import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link2 } from 'lucide-react'
import { checkApiHealth, checkMlHealth } from '../../services/api'

const MESSAGES = [
  'Connecting to Supply Chain Network...',
  'Loading Shipment Intelligence...',
  'Calibrating Disruption Models...',
  'Fetching Live Weather Data...',
  'Almost ready...',
]

function TruckSVG() {
  return (
    <svg viewBox="0 0 300 80" className="w-[300px] h-[80px]">
      <line x1="0" y1="62" x2="300" y2="62" stroke="#2A3040" strokeWidth="2" strokeDasharray="12,8"/>
      <line x1="0" y1="62" x2="300" y2="62" stroke="var(--accent-primary)" strokeWidth="1.5"
        strokeDasharray="8,16" opacity="0.4" className="animate-flow-dash"/>
      <g className="animate-truck-move">
        <rect x="40" y="28" width="70" height="32" rx="3" fill="#00D4AA" opacity="0.9"/>
        <rect x="108" y="20" width="30" height="40" rx="4" fill="#00B4D8"/>
        <rect x="113" y="24" width="18" height="14" rx="2" fill="var(--bg-void)" opacity="0.7"/>
        <rect x="130" y="14" width="4" height="8" rx="2" fill="#8B949E"/>
        <circle cx="132" cy="10" r="3" fill="#484F58" opacity="0.5" className="animate-smoke-rise"/>
        <circle cx="134" cy="6" r="2" fill="#484F58" opacity="0.3" style={{animationDelay:'0.3s'}}/>
        <circle cx="131" cy="3" r="1.5" fill="#484F58" opacity="0.2" style={{animationDelay:'0.6s'}}/>
        <circle cx="68" cy="62" r="10" fill="var(--bg-elevated)" stroke="#484F58" strokeWidth="2"/>
        <circle cx="68" cy="62" r="5" fill="var(--bg-interactive)"/>
        <circle cx="118" cy="62" r="10" fill="var(--bg-elevated)" stroke="#484F58" strokeWidth="2"/>
        <circle cx="118" cy="62" r="5" fill="var(--bg-interactive)"/>
        <text x="75" y="49" fill="var(--bg-void)" fontFamily="Space Grotesk" fontSize="10" fontWeight="700" textAnchor="middle">CG</text>
      </g>
    </svg>
  )
}

export default function FullScreenLoader({ onReady }) {
  const [msgIdx, setMsgIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const [failed, setFailed] = useState(false)
  const [countdown, setCountdown] = useState(3)

  const handleReady = useCallback(() => { if (onReady) onReady() }, [onReady])

  useEffect(() => {
    const msgTimer = setInterval(() => setMsgIdx(i => (i + 1) % MESSAGES.length), 2200)
    const progTimer = setInterval(() => setProgress(p => Math.min(p + 1.5, 85)), 200)

    const timeout = setTimeout(() => {
      clearInterval(msgTimer)
      clearInterval(progTimer)
      setFailed(true)
    }, 15000)

    Promise.allSettled([checkApiHealth(), checkMlHealth()]).then(() => {
      clearTimeout(timeout)
      clearInterval(msgTimer)
      clearInterval(progTimer)
      setProgress(100)
      setTimeout(handleReady, 600)
    })

    return () => { clearInterval(msgTimer); clearInterval(progTimer); clearTimeout(timeout) }
  }, [handleReady])

  useEffect(() => {
    if (!failed) return
    if (countdown <= 0) { handleReady(); return }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [failed, countdown, handleReady])

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-6"
      style={{ background: 'var(--bg-void)' }}>
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Link2 className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
        <span className="text-xl font-bold font-display" style={{
          background: 'var(--accent-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>ChainGuard</span>
      </div>

      {/* Truck */}
      <TruckSVG />

      {/* Messages */}
      {failed ? (
        <div className="text-center space-y-2">
          <p className="text-sm font-medium" style={{ color: 'var(--status-warn)' }}>
            Backend is warming up...
          </p>
          <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
            Loading demo data in {countdown}...
          </p>
        </div>
      ) : (
        <div className="h-5">
          <AnimatePresence mode="wait">
            <motion.p key={msgIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}
            >
              {MESSAGES[msgIdx]}
            </motion.p>
          </AnimatePresence>
        </div>
      )}

      {/* Progress bar */}
      <div className="w-72">
        <div className="h-[3px] rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
          <div className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%`, background: 'var(--accent-primary)' }} />
        </div>
        <p className="text-xs text-center mt-2 font-mono tabular-nums" style={{ color: 'var(--text-faint)' }}>
          {Math.round(progress)}%
        </p>
      </div>
    </div>
  )
}

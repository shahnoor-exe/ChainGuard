import { useState, useEffect, useRef } from 'react'
import { Bell, RefreshCw, Zap, LogOut, User, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { ROLE_LABELS } from '../../config'

export default function TopBar({ title, disruptionCount = 0, onRefresh }) {
  const { user, logout } = useAuth()
  const [time, setTime] = useState(new Date())
  const [showDropdown, setShowDropdown] = useState(false)
  const dropRef = useRef(null)
  const roleInfo = ROLE_LABELS[user?.role] || { label: user?.role, emoji: '', color: '#8B949E' }

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    function handleClick(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setShowDropdown(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const istTime = time.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit',
  })

  return (
    <header className="topbar h-14 flex items-center px-6 gap-4 sticky top-0 z-10"
      style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)' }}>
      <h1 className="font-semibold text-sm font-display flex-1" style={{ color: 'var(--text-primary)' }}>{title}</h1>

      {disruptionCount > 0 && (
        <div className="flex items-center gap-1.5 rounded-full px-3 py-1"
          style={{ background: 'var(--status-danger-bg)', border: '1px solid rgba(255,82,82,0.3)' }}>
          <Zap className="w-3 h-3" style={{ color: 'var(--status-danger)' }} />
          <span className="text-xs font-semibold" style={{ color: 'var(--status-danger)' }}>{disruptionCount} Active</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        {/* Role badge */}
        <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: roleInfo.color }}>
          {roleInfo.emoji} {roleInfo.label}
        </span>

        <button onClick={onRefresh} className="btn-secondary py-1.5 px-3" style={{ fontSize: '12px' }}>
          <RefreshCw className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Refresh</span>
        </button>

        <span className="text-xs font-mono tabular-nums hidden md:block" style={{ color: 'var(--text-secondary)' }}>
          {istTime} IST
        </span>

        <div className="flex items-center gap-1.5">
          <span className="live-dot w-2 h-2 rounded-full" style={{ background: 'var(--accent-primary)' }} />
          <span className="text-xs font-bold tracking-wider" style={{ color: 'var(--accent-primary)' }}>LIVE</span>
        </div>

        {/* User avatar dropdown */}
        <div className="relative" ref={dropRef}>
          <button onClick={() => setShowDropdown(d => !d)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer"
            style={{ background: 'var(--accent-gradient)', color: 'var(--bg-void)', border: 'none' }}>
            {user?.avatar_initials || '??'}
          </button>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 min-w-[200px] rounded-lg p-1 z-50"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                }}
              >
                <div className="px-3 py-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <p className="text-sm font-medium font-display" style={{ color: 'var(--text-primary)' }}>
                    {user?.full_name}
                  </p>
                  <p className="text-[11px] font-mono" style={{ color: 'var(--text-faint)' }}>
                    {user?.email}
                  </p>
                </div>
                <button onClick={() => { logout(); setShowDropdown(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded cursor-pointer transition-colors hover:bg-[var(--bg-interactive)]"
                  style={{ color: 'var(--status-danger)', background: 'none', border: 'none', textAlign: 'left' }}>
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}

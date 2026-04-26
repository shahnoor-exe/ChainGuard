import { useState, useEffect } from 'react'
import { Bell, RefreshCw, Zap } from 'lucide-react'

export default function TopBar({ title, disruptionCount = 0, onRefresh, weatherAlertCount = 0 }) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const istTime = time.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit',
  })

  return (
    <header className="h-14 bg-bg-surface border-b border-border-subtle flex items-center px-6 gap-4 sticky top-0 z-10">
      {/* Left: title */}
      <h1 className="text-text-primary font-semibold text-sm flex-1">{title}</h1>

      {/* Center: disruption count */}
      {disruptionCount > 0 && (
        <div className="flex items-center gap-1.5 bg-red-900/50 border border-red-700 rounded-full px-3 py-1">
          <Zap className="w-3 h-3 text-red-400" />
          <span className="text-red-300 text-xs font-semibold">{disruptionCount} Active Disruptions</span>
        </div>
      )}

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Weather alerts */}
        <button className="relative p-2 hover:bg-bg-elevated rounded-lg transition-colors" title="Weather Alerts">
          <Bell className="w-4 h-4 text-text-muted" />
          {weatherAlertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-chainguard-warning text-black text-[10px] font-bold rounded-full flex items-center justify-center">
              {weatherAlertCount}
            </span>
          )}
        </button>

        {/* Refresh */}
        <button onClick={onRefresh} className="btn-secondary py-1.5 px-3">
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-xs">Refresh</span>
        </button>

        {/* IST Time */}
        <span className="text-text-muted text-xs font-mono tabular-nums hidden md:block">{istTime} IST</span>

        {/* LIVE badge */}
        <div className="flex items-center gap-1.5">
          <span className="live-dot w-2 h-2 bg-chainguard-emerald rounded-full" />
          <span className="text-chainguard-emerald text-xs font-bold tracking-wider">LIVE</span>
        </div>
      </div>
    </header>
  )
}

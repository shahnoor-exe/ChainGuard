export default function KPICard({ title, value, subtitle, trend, icon: Icon, color = 'blue', isLoading }) {
  const colorMap = {
    blue:    { icon: 'bg-blue-900 text-blue-400',    border: 'border-blue-900/40' },
    success: { icon: 'bg-green-900 text-green-400',  border: 'border-green-900/40' },
    danger:  { icon: 'bg-red-900 text-red-400',      border: 'border-red-900/40' },
    warning: { icon: 'bg-amber-900 text-amber-400',  border: 'border-amber-900/40' },
  }
  const c = colorMap[color] || colorMap.blue

  if (isLoading) {
    return (
      <div className="card p-5 flex flex-col gap-3">
        <div className="shimmer-bg h-4 w-24 rounded" />
        <div className="shimmer-bg h-8 w-16 rounded" />
        <div className="shimmer-bg h-3 w-20 rounded" />
      </div>
    )
  }

  const trendPositive = trend > 0
  return (
    <div className={`card p-5 border ${c.border} flex flex-col gap-2 hover:border-border-subtle transition-colors`}>
      <div className="flex items-start justify-between">
        <p className="text-text-muted text-xs font-medium uppercase tracking-wider">{title}</p>
        {Icon && (
          <div className={`p-2 rounded-lg ${c.icon}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-text-primary tabular-nums">{value}</p>
      <div className="flex items-center gap-2">
        {subtitle && <p className="text-text-muted text-xs">{subtitle}</p>}
        {trend !== undefined && (
          <span className={`text-xs font-medium ${trendPositive ? 'text-chainguard-emerald' : 'text-chainguard-danger'}`}>
            {trendPositive ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  )
}

import { AlertTriangle, Cloud, Truck, Flag, Shield, Zap } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const TYPE_ICONS = {
  weather:     { icon: Cloud,         color: 'text-blue-400',   bg: 'bg-blue-900/40'  },
  traffic:     { icon: Truck,         color: 'text-amber-400',  bg: 'bg-amber-900/40' },
  news:        { icon: AlertTriangle, color: 'text-red-400',    bg: 'bg-red-900/40'   },
  festival:    { icon: Flag,          color: 'text-purple-400', bg: 'bg-purple-900/40'},
  checkpost:   { icon: Shield,        color: 'text-cyan-400',   bg: 'bg-cyan-900/40'  },
  operational: { icon: Zap,           color: 'text-orange-400', bg: 'bg-orange-900/40'},
}

const SEV_COLORS = {
  low:      'border-green-700 text-green-400',
  medium:   'border-amber-700 text-amber-400',
  high:     'border-orange-700 text-orange-400',
  critical: 'border-red-700 text-red-400',
}

export default function DisruptionFeed({ disruptions = [], loading }) {
  return (
    <div className="card flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
        <h3 className="font-semibold text-sm text-text-primary">Live Disruption Feed</h3>
        <span className="text-xs text-text-muted">{disruptions.length} active</span>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-border-subtle">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 flex gap-3">
              <div className="shimmer-bg w-8 h-8 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="shimmer-bg h-3 w-3/4 rounded" />
                <div className="shimmer-bg h-3 w-1/2 rounded" />
              </div>
            </div>
          ))
        ) : disruptions.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-text-muted text-sm">
            No active disruptions
          </div>
        ) : (
          disruptions.map(d => {
            const typeStyle = TYPE_ICONS[d.type] || TYPE_ICONS.operational
            const Icon = typeStyle.icon
            const sevColor = SEV_COLORS[d.severity] || SEV_COLORS.medium
            return (
              <div key={d.id} className="p-4 flex gap-3 hover:bg-bg-elevated transition-colors">
                <div className={`p-2 rounded-lg shrink-0 ${typeStyle.bg}`}>
                  <Icon className={`w-4 h-4 ${typeStyle.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-text-primary text-xs font-medium leading-snug">{d.title}</p>
                    <span className={`shrink-0 text-[10px] font-bold uppercase border rounded px-1.5 py-0.5 ${sevColor}`}>
                      {d.severity}
                    </span>
                  </div>
                  <p className="text-text-muted text-[11px] mt-1 line-clamp-2">{d.description}</p>
                  {d.affected_cities && (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {(Array.isArray(d.affected_cities) ? d.affected_cities : []).slice(0, 3).map(c => (
                        <span key={c} className="text-[10px] bg-bg-primary border border-border-subtle rounded px-1.5 py-0.5 text-text-muted">{c}</span>
                      ))}
                    </div>
                  )}
                  {d.detected_at && (
                    <p className="text-text-muted text-[10px] mt-1">
                      {formatDistanceToNow(new Date(d.detected_at), { addSuffix: true })}
                    </p>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

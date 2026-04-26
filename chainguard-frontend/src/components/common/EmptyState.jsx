import { Package } from 'lucide-react'

export default function EmptyState({ icon: Icon = Package, title = 'No data found', subtitle = '' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3" style={{ color: 'var(--text-faint)' }}>
      <div className="p-4 rounded-full" style={{ background: 'var(--bg-elevated)' }}>
        <Icon className="w-8 h-8" />
      </div>
      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{title}</p>
      {subtitle && <p className="text-sm">{subtitle}</p>}
    </div>
  )
}

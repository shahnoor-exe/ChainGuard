import { Package } from 'lucide-react'

export default function EmptyState({ icon: Icon = Package, title = 'No data found', subtitle = '' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-text-muted">
      <div className="p-4 bg-bg-elevated rounded-full">
        <Icon className="w-8 h-8" />
      </div>
      <p className="text-text-primary font-medium">{title}</p>
      {subtitle && <p className="text-sm">{subtitle}</p>}
    </div>
  )
}

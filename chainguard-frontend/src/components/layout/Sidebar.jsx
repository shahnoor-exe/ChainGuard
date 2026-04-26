import {
  LayoutDashboard, Map, Package, Navigation,
  Building2, Network, Leaf, Link2, X,
} from 'lucide-react'

const NAV = [
  { id: 'dashboard',    label: 'Dashboard',      icon: LayoutDashboard },
  { id: 'map',          label: 'Live Map',        icon: Map },
  { id: 'shipments',    label: 'Shipments',       icon: Package },
  { id: 'optimizer',   label: 'Route Optimizer', icon: Navigation },
  { id: 'suppliers',   label: 'Suppliers',       icon: Building2 },
  { id: 'digital-twin',label: 'Digital Twin',    icon: Network },
  { id: 'carbon',      label: 'Carbon Footprint',icon: Leaf },
]

export default function Sidebar({ activeView, onNavigate, open, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/60 z-20 md:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-bg-surface border-r border-border-subtle
        flex flex-col z-30 transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
          <div>
            <div className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-chainguard-emerald" />
              <span className="text-text-primary font-bold text-base tracking-tight">ChainGuard</span>
            </div>
            <p className="text-text-muted text-[10px] mt-0.5 pl-7">Supply Chain Intelligence</p>
          </div>
          <button onClick={onClose} className="md:hidden text-text-muted hover:text-text-primary">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ id, label, icon: Icon }) => {
            const isActive = activeView === id
            return (
              <button
                key={id}
                onClick={() => { onNavigate(id); onClose() }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                  transition-all duration-200 text-left
                  ${isActive
                    ? 'bg-chainguard-navy/30 text-chainguard-emerald border-l-2 border-chainguard-emerald pl-[10px]'
                    : 'text-text-muted hover:bg-bg-elevated hover:text-text-primary'}
                `}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            )
          })}
        </nav>

        {/* Status */}
        <div className="px-5 py-4 border-t border-border-subtle">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-chainguard-emerald rounded-full live-dot" />
            <span className="text-text-muted text-xs">All Systems Operational</span>
          </div>
        </div>
      </aside>
    </>
  )
}

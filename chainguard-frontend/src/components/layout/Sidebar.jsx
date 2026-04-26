import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Map, Package, Navigation, Building2, Network, Leaf,
  BarChart3, Warehouse, Truck, Shield, Briefcase, MapPin, LogOut, Link2, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { ROLE_LABELS } from '../../config'

const NAV = [
  { id: 'dashboard',          label: 'Command Center', icon: LayoutDashboard },
  { id: 'map',                label: 'Live Map',        icon: Map },
  { id: 'shipments',          label: 'Shipments',       icon: Package },
  { id: 'optimizer',          label: 'Route Optimizer', icon: Navigation },
  { id: 'suppliers',          label: 'Suppliers',       icon: Building2 },
  { id: 'digital-twin',       label: 'Digital Twin',    icon: Network },
  { id: 'carbon',             label: 'Carbon Tracker',  icon: Leaf },
  { id: 'analytics',          label: 'Analytics',       icon: BarChart3 },
  { id: 'warehouse_dashboard',label: 'My Warehouse',    icon: Warehouse },
  { id: 'my_shipments',       label: 'My Shipments',    icon: Truck },
  { id: 'admin',              label: 'Admin Panel',     icon: Shield },
  { id: 'executive_dashboard',label: 'Overview',        icon: Briefcase },
  { id: 'driver_view',        label: 'My Delivery',     icon: MapPin },
]

export default function Sidebar({ activeView, onNavigate, open, onClose, allowedViews = [] }) {
  const { user, logout } = useAuth()
  const [expanded, setExpanded] = useState(true)
  const roleInfo = ROLE_LABELS[user?.role] || { label: user?.role, color: '#8B949E' }

  const filteredNav = NAV.filter(n => allowedViews.includes(n.id))
  const sidebarWidth = expanded ? 240 : 72

  return (
    <>
      {open && <div className="sidebar-overlay md:hidden" onClick={onClose} />}

      <motion.aside
        animate={{ width: sidebarWidth }}
        transition={{ duration: 0.2 }}
        className={`sidebar fixed top-0 left-0 h-full flex flex-col z-30 ${open ? 'mobile-open' : ''}`}
        style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          {expanded ? (
            <div className="flex items-center gap-2">
              <Link2 className="w-5 h-5 shrink-0" style={{ color: 'var(--accent-primary)' }} />
              <div>
                <span className="font-bold text-sm font-display" style={{ color: 'var(--text-primary)' }}>ChainGuard</span>
                <p className="text-[9px] font-mono" style={{ color: 'var(--text-faint)' }}>Supply Chain Intel</p>
              </div>
            </div>
          ) : (
            <Link2 className="w-5 h-5 mx-auto" style={{ color: 'var(--accent-primary)' }} />
          )}
          <button onClick={() => { setExpanded(e => !e); if (window.innerWidth < 768) onClose() }}
            className="hidden md:block cursor-pointer" style={{ color: 'var(--text-faint)', background: 'none', border: 'none' }}>
            {expanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
          {filteredNav.map(({ id, label, icon: Icon }) => {
            const isActive = activeView === id
            return (
              <button key={id}
                onClick={() => { onNavigate(id); if (window.innerWidth < 768) onClose() }}
                className="w-full flex items-center gap-3 rounded-lg text-sm transition-all text-left cursor-pointer relative overflow-hidden"
                style={{
                  padding: expanded ? '10px 12px' : '10px',
                  justifyContent: expanded ? 'flex-start' : 'center',
                  background: isActive ? 'rgba(0,212,170,0.08)' : 'transparent',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  border: 'none',
                  borderLeft: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
                }}
                title={!expanded ? label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <AnimatePresence>
                  {expanded && (
                    <motion.span initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="font-medium text-xs whitespace-nowrap"
                    >{label}</motion.span>
                  )}
                </AnimatePresence>
              </button>
            )
          })}
        </nav>

        {/* User + Logout */}
        <div className="px-3 py-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
              style={{ background: 'var(--accent-gradient)', color: 'var(--bg-void)' }}>
              {user?.avatar_initials || '??'}
            </div>
            <AnimatePresence>
              {expanded && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{user?.full_name}</p>
                  <p className="text-[10px] font-mono" style={{ color: roleInfo.color }}>{roleInfo.label}</p>
                </motion.div>
              )}
            </AnimatePresence>
            <button onClick={logout} title="Logout"
              className="shrink-0 p-1.5 rounded-lg cursor-pointer transition-colors hover:bg-[var(--bg-interactive)]"
              style={{ color: 'var(--text-faint)', background: 'none', border: 'none' }}>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  )
}

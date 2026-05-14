/*
  CHAINGUARD — Complete Integration Checklist

  ✅ AUTH SETUP REQUIRED BEFORE RUNNING:
  1. Run schema.sql in Supabase SQL Editor (includes user_profiles + RLS)
  2. In Supabase Dashboard → Authentication → Email Templates:
     Disable email confirmation for demo (Settings → Auth → Disable email confirm)
  3. Add SUPABASE_SERVICE_ROLE_KEY to backend .env
  4. Run: npm run create-users (in chainguard-backend/)
  5. Run: npm run seed (seeds shipment/supplier data)

  ✅ ENVIRONMENT VARIABLES CHECKLIST:
  Frontend (.env.local):
    VITE_API_BASE_URL, VITE_ML_BASE_URL,
    VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY

  Backend (.env):
    SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
    ML_ENGINE_URL, PORT, NODE_ENV

  ML Engine (.env):
    OPENWEATHER_API_KEY, NEWS_API_KEY, PORT

  ✅ DEMO ACCOUNTS (all password: Demo@123):
    admin@chainguard.demo     → Full Admin
    manager@chainguard.demo   → Logistics Manager
    warehouse@chainguard.demo → Mumbai Warehouse
    driver@chainguard.demo    → Driver (SH-1001)
    analyst@chainguard.demo   → Business Analyst
    ceo@chainguard.demo       → Executive Summary

  ✅ STARTUP ORDER:
  Terminal 1: cd chainguard-ml && uvicorn main:app --reload --port 8000
  Terminal 2: cd chainguard-backend && npm run dev
  Terminal 3: cd chainguard-frontend && npm run dev
  Open: http://localhost:5173
*/

import { useState, useEffect, useRef, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Menu } from 'lucide-react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider, useApp } from './context/AppContext'
import LoginScreen from './components/auth/LoginScreen'
import FullScreenLoader from './components/common/FullScreenLoader'
import Sidebar from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'
import AlertToastContainer from './components/common/AlertToast'
import { PageTransition } from './components/common/PageTransition'
import AccessDenied from './components/common/AccessDenied'
import DashboardView from './components/dashboard/DashboardView'
import MapView from './components/map/MapView'
import ShipmentsView from './components/shipments/ShipmentsView'
import RouteOptimizerView from './components/routes/RouteOptimizerView'
import SuppliersView from './components/suppliers/SuppliersView'
import DigitalTwinView from './components/digital-twin/DigitalTwinView'
import CarbonView from './components/carbon/CarbonView'
import AnalyticsView from './components/analytics/AnalyticsView'
import AdminPanel from './components/admin/AdminPanel'
import WarehouseDashboard from './components/roles/WarehouseDashboard'
import DriverView from './components/roles/DriverView'
import ExecutiveDashboard from './components/roles/ExecutiveDashboard'
import { useDisruptions } from './hooks/useDisruptions'
import { ROLE_VIEWS } from './config'

const VIEW_TITLES = {
  dashboard:          'Operations Dashboard',
  map:                'Live Shipment Map',
  shipments:          'Shipment Management',
  optimizer:          'Route Optimizer',
  suppliers:          'Supplier Risk',
  'digital-twin':     'Digital Twin — Supply Chain Graph',
  carbon:             'Carbon Footprint',
  analytics:          'Business Analytics',
  admin:              'Admin Panel',
  warehouse_dashboard:'My Warehouse',
  my_shipments:       'My Shipments',
  executive_dashboard:'Executive Overview',
  driver_view:        'My Delivery',
}

// ── All 6 demo personas — used for offline RBAC demo ─────────────────────────
const DEMO_PERSONAS = [
  {
    id: 'demo-admin',
    email: 'admin@chainguard.demo',
    full_name: 'Arjun Kumar',
    role: 'super_admin',
    avatar_initials: 'AK',
    warehouse_city: null,
    assigned_shipment_id: null,
    company_name: 'ChainGuard Demo Co.',
    emoji: '🔴', label: 'Admin',
  },
  {
    id: 'demo-manager',
    email: 'manager@chainguard.demo',
    full_name: 'Priya Sharma',
    role: 'logistics_manager',
    avatar_initials: 'PS',
    warehouse_city: null,
    assigned_shipment_id: null,
    company_name: 'ChainGuard Demo Co.',
    emoji: '🟢', label: 'Manager',
  },
  {
    id: 'demo-warehouse',
    email: 'warehouse@chainguard.demo',
    full_name: 'Rohit Patel',
    role: 'warehouse_operator',
    avatar_initials: 'RP',
    warehouse_city: 'Mumbai',
    assigned_shipment_id: null,
    company_name: 'ChainGuard Demo Co.',
    emoji: '🟡', label: 'Warehouse',
  },
  {
    id: 'demo-driver',
    email: 'driver@chainguard.demo',
    full_name: 'Suresh Kumar',
    role: 'driver',
    avatar_initials: 'SK',
    warehouse_city: null,
    assigned_shipment_id: 'SH-1001',
    company_name: 'ChainGuard Demo Co.',
    emoji: '🚛', label: 'Driver',
  },
  {
    id: 'demo-analyst',
    email: 'analyst@chainguard.demo',
    full_name: 'Meera Iyer',
    role: 'analyst',
    avatar_initials: 'MI',
    warehouse_city: null,
    assigned_shipment_id: null,
    company_name: 'ChainGuard Demo Co.',
    emoji: '📊', label: 'Analyst',
  },
  {
    id: 'demo-ceo',
    email: 'ceo@chainguard.demo',
    full_name: 'Vivek Mehta',
    role: 'executive',
    avatar_initials: 'VM',
    warehouse_city: null,
    assigned_shipment_id: null,
    company_name: 'ChainGuard Demo Co.',
    emoji: '👔', label: 'Executive',
  },
]

const ROLE_COLORS = {
  super_admin:        '#FF5252',
  logistics_manager:  '#00E676',
  warehouse_operator: '#FFB300',
  driver:             '#60A5FA',
  analyst:            '#00B4D8',
  executive:          '#AB47BC',
}

// ── Floating role-switcher panel (only shown in mock/demo mode) ───────────────
function DemoRoleSwitcher({ currentPersona, onSwitch }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 99999,
      display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8,
    }}>
      {/* Expanded panel */}
      {open && (
        <div style={{
          background: 'rgba(13,17,23,0.97)',
          border: '1px solid rgba(0,212,170,0.3)',
          borderRadius: 12,
          padding: '12px 14px',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          minWidth: 210,
        }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                      color: '#FFB300', margin: '0 0 10px', letterSpacing: '0.08em' }}>
            ⚡ DEMO MODE — SWITCH ROLE
          </p>
          {DEMO_PERSONAS.map(p => {
            const isActive = p.id === currentPersona.id
            return (
              <button
                key={p.id}
                onClick={() => { onSwitch(p); setOpen(false) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', padding: '7px 10px', borderRadius: 8,
                  background: isActive ? `${ROLE_COLORS[p.role]}18` : 'transparent',
                  border: isActive ? `1px solid ${ROLE_COLORS[p.role]}55` : '1px solid transparent',
                  cursor: 'pointer', marginBottom: 4,
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: 14 }}>{p.emoji}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontFamily: 'var(--font-display, sans-serif)', fontSize: 12,
                                fontWeight: 600, color: isActive ? ROLE_COLORS[p.role] : '#C9D1D9' }}>
                    {p.label}
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                                color: '#484F58' }}>
                    {p.full_name}
                  </div>
                </div>
                {isActive && <span style={{ marginLeft: 'auto', fontSize: 10,
                                            color: ROLE_COLORS[p.role] }}>●</span>}
              </button>
            )
          })}
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
                      color: '#484F58', margin: '8px 0 0', borderTop: '1px solid #21262D',
                      paddingTop: 8 }}>
            RBAC demo — sidebar changes per role
          </p>
        </div>
      )}

      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Switch demo role"
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '8px 14px', borderRadius: 999,
          background: open ? 'rgba(0,212,170,0.15)' : 'rgba(13,17,23,0.95)',
          border: `1.5px solid ${open ? '#00D4AA' : 'rgba(0,212,170,0.35)'}`,
          color: '#00D4AA', cursor: 'pointer',
          fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
          fontWeight: 600, backdropFilter: 'blur(12px)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          transition: 'all 0.2s',
        }}
      >
        <span style={{ fontSize: 14 }}>{currentPersona.emoji}</span>
        <span>{currentPersona.label}</span>
        <span style={{ opacity: 0.6, fontSize: 9 }}>{open ? '▲' : '▼'}</span>
      </button>
    </div>
  )
}

// ── Inner app — only mounts after loader is gone ──────────────────────────────
function InnerApp({ guestUser = null }) {
  const authCtx = useAuth()
  // In mock/offline mode, authLoading may stay true forever (Supabase unreachable).
  // Use guestUser to bypass that.
  const user = guestUser || authCtx.user
  const authLoading = guestUser ? false : authCtx.loading

  const { sidebarOpen, setSidebarOpen, selectedRoute } = useApp()
  const { data: disruptions = [] } = useDisruptions()
  const [activeView, setActiveView] = useState(null)

  const allowedViews = user ? (ROLE_VIEWS[user.role] || ROLE_VIEWS.logistics_manager) : []
  const currentView = activeView && allowedViews.includes(activeView)
    ? activeView
    : allowedViews[0] || 'dashboard'

  const handleNavigate = useCallback((view) => {
    setActiveView(view)
  }, [])

  // Still waiting for Supabase (only in live mode, guestUser bypasses this)
  if (authLoading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: 'var(--bg-void)',
        color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)',
        fontSize: '13px', flexDirection: 'column', gap: '12px'
      }}>
        <div style={{ width: 32, height: 32, border: '2px solid var(--accent-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        Verifying session...
      </div>
    )
  }

  // Not logged in and no guest user — show login
  if (!user) {
    return <LoginScreen />
  }

  // Driver → fullscreen mobile view
  if (user.role === 'driver') {
    return (
      <>
        <DriverView />
        <AlertToastContainer />
      </>
    )
  }

  function renderView() {
    if (!allowedViews.includes(currentView)) {
      return <AccessDenied onNavigate={handleNavigate} />
    }
    switch (currentView) {
      case 'dashboard':           return <DashboardView selectedRoute={selectedRoute} />
      case 'map':                 return <MapView selectedRoute={selectedRoute} />
      case 'shipments':           return <ShipmentsView onNavigate={handleNavigate} />
      case 'my_shipments':        return <ShipmentsView onNavigate={handleNavigate} />
      case 'optimizer':           return <RouteOptimizerView />
      case 'suppliers':           return <SuppliersView />
      case 'digital-twin':        return <DigitalTwinView />
      case 'carbon':              return <CarbonView />
      case 'analytics':           return <AnalyticsView />
      case 'admin':               return <AdminPanel />
      case 'warehouse_dashboard': return <WarehouseDashboard />
      case 'executive_dashboard': return <ExecutiveDashboard />
      default:                    return <DashboardView selectedRoute={selectedRoute} />
    }
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-void)' }}>
      <Sidebar activeView={currentView} onNavigate={handleNavigate}
        open={sidebarOpen} onClose={() => setSidebarOpen(false)}
        allowedViews={allowedViews} />

      <div className="flex-1 flex flex-col min-w-0 main-content" style={{ marginLeft: '240px' }}>
        <div className="flex items-center">
          <button onClick={() => setSidebarOpen(o => !o)}
            className="md:hidden p-3 cursor-pointer" style={{ color: 'var(--text-faint)', background: 'none', border: 'none' }}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <TopBar title={VIEW_TITLES[currentView] || 'ChainGuard'}
              disruptionCount={(disruptions || []).filter(d => d.is_active).length}
              onRefresh={() => window.location.reload()} />
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-5">
          <AnimatePresence mode="wait">
            <PageTransition pageKey={currentView}>
              {renderView()}
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>

      <AlertToastContainer />
    </div>
  )
}

// ── Root App — manages loader + decides live vs mock mode ─────────────────────
export default function App() {
  const [showLoader, setShowLoader]     = useState(true)
  const [useMockData, setUseMockData]   = useState(false)
  // Active demo persona — starts as Logistics Manager, user can switch
  const [activePersona, setActivePersona] = useState(DEMO_PERSONAS[1])
  const loaderDismissed = useRef(false)

  // ── NUCLEAR FALLBACK: after 25s force-open dashboard with mock data ─────────
  useEffect(() => {
    const nuclear = setTimeout(() => {
      if (!loaderDismissed.current) {
        console.warn('[App] Nuclear timeout fired — forcing dashboard open with mock data')
        loaderDismissed.current = true
        setUseMockData(true)
        setShowLoader(false)
      }
    }, 25000)
    return () => clearTimeout(nuclear)
  }, [])

  const handleLoadComplete = useCallback(() => {
    if (!loaderDismissed.current) {
      loaderDismissed.current = true
      setShowLoader(false)
    }
  }, [])

  const handleUseMockData = useCallback(() => {
    setUseMockData(true)
  }, [])

  // ── Show loader until it fires onLoadComplete ──────────────────────────────
  if (showLoader) {
    return (
      <FullScreenLoader
        onLoadComplete={handleLoadComplete}
        onUseMockData={handleUseMockData}
      />
    )
  }

  // ── MOCK MODE: backend is asleep — 100% offline with all 6 demo personas ────
  // AuthProvider & InnerApp both receive the active persona directly.
  // DemoRoleSwitcher floats over the UI and swaps persona instantly.
  if (useMockData) {
    return (
      // Key forces full remount when role changes — sidebar, views all reset
      <AuthProvider key={activePersona.id} guestUser={activePersona}>
        <AppProvider useMockData={true}>
          <InnerApp guestUser={activePersona} />
          <DemoRoleSwitcher
            currentPersona={activePersona}
            onSwitch={setActivePersona}
          />
        </AppProvider>
      </AuthProvider>
    )
  }

  // ── LIVE MODE: backend is up — use real Supabase auth + real data ──────────
  return (
    <AuthProvider>
      <AppProvider useMockData={false}>
        <InnerApp />
      </AppProvider>
    </AuthProvider>
  )
}

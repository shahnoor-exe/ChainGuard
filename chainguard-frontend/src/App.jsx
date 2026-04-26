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

import { useState, useCallback } from 'react'
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

function InnerApp() {
  const { user, loading: authLoading } = useAuth()
  const { sidebarOpen, setSidebarOpen, selectedRoute } = useApp()
  const { data: disruptions } = useDisruptions()
  const [ready, setReady] = useState(false)

  const allowedViews = user ? (ROLE_VIEWS[user.role] || ROLE_VIEWS.logistics_manager) : []
  const [activeView, setActiveView] = useState(null)

  // Set default view when user loads
  const currentView = activeView && allowedViews.includes(activeView)
    ? activeView
    : allowedViews[0] || 'dashboard'

  const handleNavigate = useCallback((view, preset) => {
    setActiveView(view)
  }, [])

  // Auth loading
  if (authLoading) {
    return <FullScreenLoader onReady={() => {}} />
  }

  // Not logged in
  if (!user) {
    return <LoginScreen />
  }

  // Driver → fullscreen
  if (user.role === 'driver') {
    return (
      <>
        <DriverView />
        <AlertToastContainer />
      </>
    )
  }

  // App loading
  if (!ready) {
    return <FullScreenLoader onReady={() => setReady(true)} />
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
              disruptionCount={disruptions.filter(d => d.is_active).length}
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

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <InnerApp />
      </AppProvider>
    </AuthProvider>
  )
}

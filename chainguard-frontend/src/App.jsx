import { useState, useEffect, useCallback } from 'react'
import { Menu } from 'lucide-react'
import { AppProvider, useApp } from './context/AppContext'
import Sidebar from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'
import AlertToastContainer from './components/common/AlertToast'
import DashboardView from './components/dashboard/DashboardView'
import MapView from './components/map/MapView'
import ShipmentsView from './components/shipments/ShipmentsView'
import RouteOptimizerView from './components/routes/RouteOptimizerView'
import SuppliersView from './components/suppliers/SuppliersView'
import DigitalTwinView from './components/digital-twin/DigitalTwinView'
import CarbonView from './components/carbon/CarbonView'
import { useDisruptions } from './hooks/useDisruptions'
import { checkApiHealth, checkMlHealth } from './services/api'

const VIEW_TITLES = {
  dashboard:    'Operations Dashboard',
  map:          'Live Shipment Map',
  shipments:    'Shipment Management',
  optimizer:    'Route Optimizer',
  suppliers:    'Supplier Risk',
  'digital-twin': 'Digital Twin — Supply Chain Graph',
  carbon:       'Carbon Footprint',
}

// ── Loading Screen ─────────────────────────────────────────
const MESSAGES = [
  'Connecting to Supply Chain Intelligence Network...',
  'Waking up ML Engine...',
  'Loading shipment data...',
  'Calibrating risk models...',
]

function LoadingScreen({ onReady }) {
  const [msgIdx, setMsgIdx]     = useState(0)
  const [progress, setProgress] = useState(0)
  const [failed, setFailed]     = useState(false)

  useEffect(() => {
    const msgTimer = setInterval(() => setMsgIdx(i => (i + 1) % MESSAGES.length), 2200)
    const progTimer = setInterval(() => setProgress(p => Math.min(p + 3, 80)), 250)

    const timeout = setTimeout(() => {
      clearInterval(msgTimer); clearInterval(progTimer)
      setFailed(true)
    }, 15000)

    Promise.allSettled([checkApiHealth(), checkMlHealth()]).then(results => {
      clearTimeout(timeout)
      clearInterval(msgTimer); clearInterval(progTimer)
      setProgress(100)
      setTimeout(onReady, 600)
    })

    return () => { clearInterval(msgTimer); clearInterval(progTimer); clearTimeout(timeout) }
  }, [onReady])

  if (failed) {
    return (
      <div className="fixed inset-0 bg-bg-primary flex flex-col items-center justify-center gap-6">
        <div className="text-center">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="text-text-primary font-bold text-xl">Backend offline</p>
          <p className="text-text-muted text-sm mt-2">Showing demo data — all features still available</p>
        </div>
        <button onClick={onReady} className="btn-primary px-8 py-3 text-base justify-center">
          Enter Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-bg-primary flex flex-col items-center justify-center gap-8">
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-10 h-10 bg-chainguard-emerald rounded-lg flex items-center justify-center animate-pulse">
            <span className="text-black font-bold text-lg">C</span>
          </div>
          <div>
            <p className="text-text-primary font-bold text-2xl tracking-tight">ChainGuard</p>
            <p className="text-chainguard-emerald text-xs tracking-widest">SUPPLY CHAIN INTELLIGENCE</p>
          </div>
        </div>
        <p className="text-text-muted text-sm h-5">{MESSAGES[msgIdx]}</p>
      </div>

      <div className="w-72">
        <div className="h-1 bg-bg-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-chainguard-emerald rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-text-muted text-xs text-center mt-2 tabular-nums">{progress}%</p>
      </div>
    </div>
  )
}

// ── Inner App (needs context) ──────────────────────────────
function InnerApp() {
  const [activeView, setActiveView]   = useState('dashboard')
  const [routePreset, setRoutePreset] = useState({})
  const [ready, setReady]             = useState(false)
  const { sidebarOpen, setSidebarOpen, selectedRoute } = useApp()
  const { data: disruptions } = useDisruptions()

  const handleNavigate = useCallback((view, preset = {}) => {
    setActiveView(view)
    if (preset) setRoutePreset(preset)
  }, [])

  if (!ready) return <LoadingScreen onReady={() => setReady(true)} />

  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        onNavigate={handleNavigate}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        {/* TopBar */}
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="md:hidden p-3 text-text-muted hover:text-text-primary"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <TopBar
              title={VIEW_TITLES[activeView]}
              disruptionCount={disruptions.filter(d => d.is_active).length}
              onRefresh={() => window.location.reload()}
            />
          </div>
        </div>

        {/* View area */}
        <main className="flex-1 overflow-y-auto p-5">
          {activeView === 'dashboard'     && <DashboardView selectedRoute={selectedRoute} />}
          {activeView === 'map'           && <MapView selectedRoute={selectedRoute} />}
          {activeView === 'shipments'     && <ShipmentsView onNavigate={handleNavigate} />}
          {activeView === 'optimizer'     && <RouteOptimizerView initialOrigin={routePreset.origin} initialDest={routePreset.destination} />}
          {activeView === 'suppliers'     && <SuppliersView />}
          {activeView === 'digital-twin'  && <DigitalTwinView />}
          {activeView === 'carbon'        && <CarbonView />}
        </main>
      </div>

      <AlertToastContainer />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <InnerApp />
    </AppProvider>
  )
}

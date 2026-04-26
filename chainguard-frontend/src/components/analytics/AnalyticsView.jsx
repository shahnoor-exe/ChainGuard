import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DollarSign, Network, Building2, Truck, TrendingUp, MapPin, Zap, Leaf } from 'lucide-react'
import CostImpactModule from './CostImpactModule'
import ResilienceModule from './ResilienceModule'
import SupplierHealthModule from './SupplierHealthModule'
import CarrierModule from './CarrierModule'
import DemandForecastModule from './DemandForecastModule'
import GeoRiskModule from './GeoRiskModule'
import RouteEfficiencyModule from './RouteEfficiencyModule'
import CarbonESGModule from './CarbonESGModule'

const TABS = [
  { id: 'cost', label: 'Cost Impact', icon: DollarSign },
  { id: 'resilience', label: 'Network Resilience', icon: Network },
  { id: 'supplier', label: 'Supplier Health', icon: Building2 },
  { id: 'carrier', label: 'Carrier Performance', icon: Truck },
  { id: 'demand', label: 'Demand Forecast', icon: TrendingUp },
  { id: 'geo', label: 'Geographic Risk', icon: MapPin },
  { id: 'routes', label: 'Route Efficiency', icon: Zap },
  { id: 'carbon', label: 'ESG Carbon', icon: Leaf },
]

export default function AnalyticsView() {
  const [activeTab, setActiveTab] = useState('cost')

  return (
    <div className="space-y-5">
      <h2 className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Business Analytics</h2>
      <div className="flex gap-1 overflow-x-auto pb-2 relative" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="relative flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap cursor-pointer rounded-t-lg transition-colors"
            style={{ background: 'none', border: 'none', color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="analytics-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ background: 'var(--accent-primary)' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
            )}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}>
          {activeTab === 'cost' && <CostImpactModule />}
          {activeTab === 'resilience' && <ResilienceModule />}
          {activeTab === 'supplier' && <SupplierHealthModule />}
          {activeTab === 'carrier' && <CarrierModule />}
          {activeTab === 'demand' && <DemandForecastModule />}
          {activeTab === 'geo' && <GeoRiskModule />}
          {activeTab === 'routes' && <RouteEfficiencyModule />}
          {activeTab === 'carbon' && <CarbonESGModule />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

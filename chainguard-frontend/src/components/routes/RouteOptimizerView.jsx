import { useState } from 'react'
import { Navigation, Zap, DollarSign, Leaf, AlertCircle, RefreshCw, MapPin } from 'lucide-react'
import { optimizeRoute } from '../../services/api'
import { useApp } from '../../context/AppContext'
import { INDIA_CITIES } from '../../config'
import ShipmentMap from '../map/ShipmentMap'
import mockRoutes from '../../data/mock_routes.json'

const PRIORITIES = [
  { id: 'speed',  label: 'Fastest',  icon: Zap,          color: 'text-blue-400'  },
  { id: 'cost',   label: 'Cheapest', icon: DollarSign,   color: 'text-amber-400' },
  { id: 'carbon', label: 'Greenest', icon: Leaf,          color: 'text-green-400' },
]

function ScoreBar({ label, value, color = 'bg-chainguard-emerald' }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-text-muted">{label}</span>
        <span className="text-text-primary font-medium">{value}%</span>
      </div>
      <div className="h-1.5 bg-bg-primary rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function RouteOptionCard({ option, index, isSelected, onSelect }) {
  const isRecommended = index === 0
  return (
    <div onClick={() => onSelect(option)}
      className={`card p-5 cursor-pointer transition-all duration-200 hover:border-chainguard-emerald/50 space-y-4
        ${isSelected ? 'border-chainguard-emerald bg-chainguard-emerald/5' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-text-muted text-xs">Option {index + 1}</p>
          <p className="font-bold text-text-primary text-sm mt-0.5">
            {option.priority?.charAt(0).toUpperCase() + option.priority?.slice(1)} Route
          </p>
        </div>
        {isRecommended && (
          <span className="text-xs bg-chainguard-emerald/20 text-chainguard-emerald border border-chainguard-emerald/40 px-2 py-0.5 rounded-full font-semibold">
            RECOMMENDED
          </span>
        )}
      </div>

      {/* Path */}
      <div className="flex items-center gap-1 flex-wrap text-xs">
        {(option.path || []).map((city, i, arr) => (
          <span key={i} className="flex items-center gap-1">
            <span className="text-text-primary font-medium">{city}</span>
            {i < arr.length - 1 && <span className="text-text-muted">→</span>}
          </span>
        ))}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { icon: '⏱', label: 'Duration', value: `${option.total_duration_hrs?.toFixed(1)}h` },
          { icon: '₹', label: 'Toll Cost', value: option.total_cost ? `₹${new Intl.NumberFormat('en-IN').format(option.total_cost)}` : '—' },
          { icon: '🌱', label: 'CO₂', value: `${option.total_carbon_kg?.toFixed(0)} kg` },
        ].map(m => (
          <div key={m.label} className="bg-bg-primary rounded-lg p-2">
            <p className="text-base">{m.icon}</p>
            <p className="text-text-primary font-bold text-sm tabular-nums">{m.value}</p>
            <p className="text-text-muted text-[10px]">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Score bars */}
      <div className="space-y-2">
        <ScoreBar label="Speed Score"  value={Math.round(option.scores?.speed  || 0)} color="bg-blue-500" />
        <ScoreBar label="Cost Score"   value={Math.round(option.scores?.cost   || 0)} color="bg-amber-500" />
        <ScoreBar label="Carbon Score" value={Math.round(option.scores?.carbon || 0)} color="bg-green-500" />
      </div>

      {option.highways?.length > 0 && (
        <p className="text-text-muted text-xs">Via: {option.highways.join(', ')}</p>
      )}

      <button
        onClick={e => { e.stopPropagation(); onSelect(option) }}
        className={`w-full py-2 rounded-lg text-sm font-medium transition-colors
          ${isSelected ? 'bg-chainguard-emerald text-black' : 'btn-secondary justify-center'}`}>
        {isSelected ? '✓ Selected' : 'Select This Route'}
      </button>
    </div>
  )
}

export default function RouteOptimizerView({ initialOrigin, initialDest }) {
  const { addToast, setSelectedRoute } = useApp()
  const [origin, setOrigin]         = useState(initialOrigin || '')
  const [destination, setDest]      = useState(initialDest   || '')
  const [priority, setPriority]     = useState('speed')
  const [loading, setLoading]       = useState(false)
  const [results, setResults]       = useState(null)
  const [error, setError]           = useState(null)
  const [selectedOption, setSelected] = useState(null)

  async function handleOptimize() {
    if (!origin || !destination) return addToast('Please select both cities', 'warning')
    if (origin === destination) return addToast('Origin and destination must differ', 'warning')
    setLoading(true); setError(null); setResults(null)
    try {
      const res = await optimizeRoute(origin, destination, priority)
      const payload = res.data.data
      setResults(payload)
      if (payload?.options?.length) {
        setSelected(payload.options[0])
        setSelectedRoute({ path: payload.options[0].path })
      }
    } catch (err) {
      console.warn('API route optimization failed, using mock data')
      addToast('Backend offline, showing mock optimal route', 'info')
      
      const mockPayload = {
        origin,
        destination,
        options: mockRoutes.options.map(o => ({
          ...o,
          path: [origin, ...o.path.slice(1, -1), destination]
        }))
      }
      setResults(mockPayload)
      if (mockPayload.options.length) {
        setSelected(mockPayload.options[0])
        setSelectedRoute({ path: mockPayload.options[0].path })
      }
    } finally {
      setLoading(false)
    }
  }

  function handleSelect(opt) {
    setSelected(opt)
    setSelectedRoute({ path: opt.path })
  }

  return (
    <div className="space-y-5">
      <h2 className="text-text-primary font-bold text-lg">Route Optimizer</h2>

      {/* Input form */}
      <div className="card p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="text-xs text-text-muted mb-1 block">Origin City</label>
            <select className="select-field" value={origin} onChange={e => setOrigin(e.target.value)}>
              <option value="">Select city...</option>
              {INDIA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1 block">Destination City</label>
            <select className="select-field" value={destination} onChange={e => setDest(e.target.value)}>
              <option value="">Select city...</option>
              {INDIA_CITIES.filter(c => c !== origin).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1 block">Priority</label>
            <div className="flex gap-1">
              {PRIORITIES.map(p => (
                <button key={p.id} onClick={() => setPriority(p.id)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1
                    ${priority === p.id ? 'bg-chainguard-navy text-white' : 'bg-bg-elevated text-text-muted hover:text-text-primary'}`}>
                  <p.icon className="w-3 h-3" /> {p.label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleOptimize} disabled={loading} className="btn-primary justify-center">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
            {loading ? 'Optimizing...' : 'Optimize Route'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="card p-4 flex items-center gap-3 border-red-900/50">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
          <button onClick={handleOptimize} className="ml-auto btn-secondary text-xs">Retry</button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-5 space-y-3">
              <div className="shimmer-bg h-4 w-24 rounded" />
              <div className="shimmer-bg h-16 rounded" />
              <div className="shimmer-bg h-20 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {results?.options && (
        <>
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-chainguard-emerald" />
            <p className="text-sm text-text-muted">
              {results.origin} → {results.destination} — {results.options.length} route options found
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {results.options.map((opt, i) => (
              <RouteOptionCard
                key={i} option={opt} index={i}
                isSelected={selectedOption === opt}
                onSelect={handleSelect}
              />
            ))}
          </div>

          {/* Map preview */}
          <div>
            <p className="text-sm text-text-muted mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Selected route preview
            </p>
            <ShipmentMap selectedRoute={selectedOption ? { path: selectedOption.path } : null} />
          </div>
        </>
      )}
    </div>
  )
}

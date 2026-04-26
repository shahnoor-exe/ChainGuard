import { useState } from 'react'
import { X, Navigation, Mail, RefreshCw, Truck, Weight, Clock, MapPin } from 'lucide-react'
import RiskBadge from '../common/RiskBadge'
import { fetchRouteRisk } from '../../services/api'
import { sendDisruptionEmail, formatEtaForEmail } from '../../services/notificationService'
import { STATUS_COLORS } from '../../config'
import { useApp } from '../../context/AppContext'

export default function ShipmentDetailPanel({ shipment, onClose, onOptimizeRoute }) {
  const { addToast } = useApp()
  const [mlRisk, setMlRisk] = useState(null)
  const [mlLoading, setMlLoading] = useState(false)
  const [alertEmail, setAlertEmail] = useState('')
  const [showAlert, setShowAlert] = useState(false)

  if (!shipment) return null

  const statusColor = STATUS_COLORS[shipment.status] || {}
  const delayHours = shipment.delay_hours || 0
  const isDelayed = delayHours > 0

  async function handleRecalculate() {
    setMlLoading(true)
    try {
      const res = await fetchRouteRisk(shipment.origin_city, shipment.destination_city)
      setMlRisk(res.data.data)
      addToast('Risk recalculated', 'success')
    } catch {
      addToast('ML engine unavailable', 'warning')
    } finally {
      setMlLoading(false)
    }
  }

  async function handleSendAlert() {
    if (!alertEmail) return addToast('Enter an email address', 'warning')
    const result = await sendDisruptionEmail({
      to_email: alertEmail,
      shipment_code: shipment.shipment_code,
      type: 'Route Risk Alert',
      severity: shipment.risk_score > 80 ? 'Critical' : shipment.risk_score > 60 ? 'High' : 'Medium',
      origin: shipment.origin_city,
      destination: shipment.destination_city,
      eta: formatEtaForEmail(shipment.predicted_eta),
      message: `Shipment at risk. Current risk score: ${shipment.risk_score}. Delay: ${delayHours.toFixed(1)} hours.`,
    })
    addToast(result?.success ? 'Alert sent!' : 'Failed to send', result?.success ? 'success' : 'error')
    if (result?.success) setShowAlert(false)
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md h-full overflow-y-auto"
        style={{ background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-subtle)' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 sticky top-0 z-10"
          style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
          <div>
            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>Shipment Details</p>
            <h2 className="font-mono font-bold text-lg" style={{ color: 'var(--accent-primary)' }}>{shipment.shipment_code}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg transition-colors cursor-pointer hover:bg-[var(--bg-elevated)]"
            style={{ color: 'var(--text-faint)', background: 'none', border: 'none' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Status + Risk */}
          <div className="card p-4 flex items-center justify-between">
            <span className="text-sm px-3 py-1 rounded-full font-medium"
              style={{ color: statusColor.text, backgroundColor: statusColor.bg }}>
              {shipment.status?.replace('_', ' ').toUpperCase()}
            </span>
            <RiskBadge score={shipment.risk_score} />
          </div>

          {/* Route */}
          <div className="card p-4 space-y-3">
            <h3 className="text-xs uppercase font-semibold tracking-wider" style={{ color: 'var(--text-faint)' }}>Route</h3>
            <div className="flex items-center gap-3">
              <div className="flex-1 text-center">
                <p className="text-xs" style={{ color: 'var(--text-faint)' }}>Origin</p>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{shipment.origin_city}</p>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="w-full h-px relative" style={{ background: 'var(--border-default)' }}>
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent-primary)' }} />
                  </div>
                </div>
              </div>
              <div className="flex-1 text-center">
                <p className="text-xs" style={{ color: 'var(--text-faint)' }}>Destination</p>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{shipment.destination_city}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <div className="flex items-center gap-1.5"><Truck className="w-3 h-3" /> {shipment.vehicle_type}</div>
              <div className="flex items-center gap-1.5"><Weight className="w-3 h-3" /> {shipment.weight_kg} kg</div>
              <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {shipment.carrier_name?.split(' ')[0]}</div>
            </div>
          </div>

          {/* Timeline */}
          <div className="card p-4 space-y-3">
            <h3 className="text-xs uppercase font-semibold tracking-wider" style={{ color: 'var(--text-faint)' }}>Timeline</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}><Clock className="w-3.5 h-3.5" />Planned ETA</span>
                <span className="font-mono text-xs" style={{ color: 'var(--text-primary)' }}>
                  {shipment.planned_eta ? new Date(shipment.planned_eta).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}><Clock className="w-3.5 h-3.5" />Predicted ETA</span>
                <span className="font-mono text-xs" style={{ color: isDelayed ? 'var(--status-danger)' : 'var(--accent-primary)' }}>
                  {shipment.predicted_eta ? new Date(shipment.predicted_eta).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : '—'}
                </span>
              </div>
              {isDelayed && (
                <div className="flex items-center justify-between rounded-lg p-2"
                  style={{ background: 'var(--status-danger-bg)', border: '1px solid rgba(255,82,82,0.3)' }}>
                  <span className="text-xs font-medium" style={{ color: 'var(--status-danger)' }}>Delay</span>
                  <span className="text-xs font-bold" style={{ color: 'var(--status-danger)' }}>{delayHours.toFixed(1)} hrs behind schedule</span>
                </div>
              )}
            </div>
          </div>

          {/* ML Risk (if loaded) */}
          {mlRisk && (
            <div className="card p-4 space-y-2">
              <h3 className="text-xs uppercase font-semibold tracking-wider" style={{ color: 'var(--text-faint)' }}>ML Risk Analysis</h3>
              <div className="space-y-2 text-xs">
                {[
                  { label: 'Disruption Probability', value: `${(mlRisk.ml_prediction?.disruption_probability * 100).toFixed(1)}%`, width: mlRisk.ml_prediction?.disruption_probability * 100 },
                  { label: 'Composite Risk Score', value: `${mlRisk.composite_risk_score}/100`, width: mlRisk.composite_risk_score },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between mb-1">
                      <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{item.value}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-interactive)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${item.width}%`, background: 'var(--status-danger)' }} />
                    </div>
                  </div>
                ))}
                <p style={{ color: 'var(--text-secondary)' }}>{mlRisk.recommendation}</p>
              </div>
            </div>
          )}

          {/* Email alert */}
          {showAlert && (
            <div className="card p-4 space-y-3">
              <h3 className="text-xs uppercase font-semibold tracking-wider" style={{ color: 'var(--text-faint)' }}>Send Alert Email</h3>
              <input className="input-field" type="email" placeholder="recipient@company.com"
                value={alertEmail} onChange={e => setAlertEmail(e.target.value)} />
              <div className="flex gap-2">
                <button onClick={handleSendAlert} className="btn-primary flex-1">Send Alert</button>
                <button onClick={() => setShowAlert(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            <button onClick={() => onOptimizeRoute(shipment.origin_city, shipment.destination_city)}
              className="btn-primary w-full justify-center">
              <Navigation className="w-4 h-4" /> Optimize Route
            </button>
            <button onClick={() => setShowAlert(true)} className="btn-secondary w-full justify-center">
              <Mail className="w-4 h-4" /> Send Alert
            </button>
            <button onClick={handleRecalculate} disabled={mlLoading} className="btn-secondary w-full justify-center">
              <RefreshCw className={`w-4 h-4 ${mlLoading ? 'animate-spin' : ''}`} />
              {mlLoading ? 'Calculating...' : 'Re-calculate Risk'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

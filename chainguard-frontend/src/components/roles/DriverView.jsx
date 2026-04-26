import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link2, LogOut, MapPin, Clock, AlertTriangle, Phone, CheckCircle, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useShipments } from '../../hooks/useShipments'
import { useApp } from '../../context/AppContext'
import { getRiskLevel, RISK_COLORS, STATUS_COLORS } from '../../config'

const DELAY_REASONS = ['Traffic', 'Weather', 'Vehicle Issue', 'Checkpoint', 'Other']

export default function DriverView() {
  const { user, logout } = useAuth()
  const { data: shipments } = useShipments()
  const { addToast } = useApp()
  const [showDelayModal, setShowDelayModal] = useState(false)
  const [showDeliverConfirm, setShowDeliverConfirm] = useState(false)

  const shipment = shipments.find(s => s.id === user?.assigned_shipment_id)
    || shipments.find(s => s.status === 'in_transit') || shipments[0]

  const riskLevel = shipment ? getRiskLevel(shipment.risk_score) : 'low'
  const isDelayed = shipment?.delay_hours > 0
  const statusColor = STATUS_COLORS[shipment?.status] || {}

  return (
    <div className="driver-fullscreen flex flex-col" style={{ fontFamily: 'var(--font-display)' }}>
      <div className="flex items-center justify-between px-4 py-3"
        style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
          <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>ChainGuard</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs px-2 py-1 rounded-full font-bold"
            style={{ background: 'var(--status-safe-bg)', color: 'var(--status-safe)' }}>ON DUTY</span>
          <button onClick={logout} className="p-1.5 cursor-pointer"
            style={{ color: 'var(--text-faint)', background: 'none', border: 'none' }}>
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5">
        {shipment ? (
          <>
            <p className="text-4xl font-bold text-center" style={{ color: 'var(--accent-primary)' }}>{shipment.shipment_code}</p>
            <div className="flex items-center justify-center gap-4">
              <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{shipment.origin_city}</span>
              <MapPin className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
              <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{shipment.destination_city}</span>
            </div>
            <div className="flex justify-center">
              <motion.span animate={riskLevel === 'critical' ? { scale: [1, 1.05, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-lg px-6 py-2 rounded-full font-bold"
                style={{ color: statusColor.text, background: statusColor.bg }}>
                {shipment.status?.replace('_', ' ').toUpperCase()}
              </motion.span>
            </div>
            <div className="card p-5 text-center">
              <p className="text-xs uppercase font-medium mb-2" style={{ color: 'var(--text-faint)' }}>
                <Clock className="w-3.5 h-3.5 inline mr-1" /> Expected Arrival
              </p>
              {isDelayed && shipment.planned_eta && (
                <p className="text-sm line-through mb-1" style={{ color: 'var(--text-faint)' }}>
                  {new Date(shipment.planned_eta).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                </p>
              )}
              <p className="text-xl font-bold font-mono" style={{ color: isDelayed ? 'var(--status-danger)' : 'var(--accent-primary)' }}>
                {shipment.predicted_eta ? new Date(shipment.predicted_eta).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', hour: '2-digit', minute: '2-digit' }) : 'Calculating...'}
              </p>
              {isDelayed && <p className="text-sm mt-2 font-medium" style={{ color: 'var(--status-danger)' }}>{shipment.delay_hours.toFixed(1)} hrs behind</p>}
            </div>
            {shipment.risk_score > 50 && (
              <div className="p-4 rounded-lg" style={{ background: 'var(--status-warn-bg)', border: '1px solid rgba(255,179,0,0.3)' }}>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 shrink-0" style={{ color: 'var(--status-warn)' }} />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--status-warn)' }}>Route Alert</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Risk score: {shipment.risk_score}/100. Consider alternate routing.</p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : <p className="text-center py-20" style={{ color: 'var(--text-faint)' }}>No shipment assigned</p>}
      </div>

      <div className="flex gap-2 px-4 py-4" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)' }}>
        <button onClick={() => setShowDelayModal(true)} className="flex-1 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
          style={{ background: 'var(--status-warn-bg)', color: 'var(--status-warn)', border: '1px solid rgba(255,179,0,0.3)' }}>
          <MapPin className="w-4 h-4" /> Report Delay
        </button>
        <a href="tel:+911800000000" className="flex-1 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 no-underline"
          style={{ background: 'var(--bg-elevated)', color: 'var(--accent-cyan)', border: '1px solid var(--border-default)' }}>
          <Phone className="w-4 h-4" /> Call Support
        </a>
        <button onClick={() => setShowDeliverConfirm(true)} className="flex-1 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
          style={{ background: 'var(--status-safe-bg)', color: 'var(--status-safe)', border: '1px solid rgba(0,230,118,0.3)' }}>
          <CheckCircle className="w-4 h-4" /> Delivered
        </button>
      </div>

      <AnimatePresence>
        {showDelayModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
            <motion.div initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }}
              className="w-full max-w-lg rounded-t-2xl p-6 space-y-3" style={{ background: 'var(--bg-surface)' }}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Report Delay</h3>
                <button onClick={() => setShowDelayModal(false)} style={{ color: 'var(--text-faint)', background: 'none', border: 'none' }} className="cursor-pointer"><X className="w-5 h-5" /></button>
              </div>
              {DELAY_REASONS.map(r => (
                <button key={r} onClick={() => { addToast(`Delay reported: ${r}`, 'info'); setShowDelayModal(false) }}
                  className="w-full py-3 rounded-lg text-left px-4 text-sm font-medium cursor-pointer hover:bg-[var(--bg-interactive)]"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}>{r}</button>
              ))}
            </motion.div>
          </motion.div>
        )}
        {showDeliverConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="w-full max-w-sm rounded-xl p-6 text-center space-y-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-accent)' }}>
              <CheckCircle className="w-12 h-12 mx-auto" style={{ color: 'var(--status-safe)' }} />
              <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Confirm Delivery?</h3>
              <div className="flex gap-3">
                <button onClick={() => setShowDeliverConfirm(false)} className="flex-1 py-2.5 rounded-lg text-sm cursor-pointer" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}>Cancel</button>
                <button onClick={() => { addToast(`${shipment?.shipment_code} delivered!`, 'success'); setShowDeliverConfirm(false) }} className="flex-1 btn-primary justify-center">Confirm</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

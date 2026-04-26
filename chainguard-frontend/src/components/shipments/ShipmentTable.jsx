import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, Eye, Package, Search } from 'lucide-react'
import RiskBadge from '../common/RiskBadge'
import EmptyState from '../common/EmptyState'
import { STATUS_COLORS } from '../../config'
import { formatDistanceToNow } from 'date-fns'

const COLS = [
  { key: 'shipment_code', label: 'Code' },
  { key: 'route', label: 'Route' },
  { key: 'carrier_name', label: 'Carrier' },
  { key: 'status', label: 'Status' },
  { key: 'risk_score', label: 'Risk', sortable: true },
  { key: 'predicted_eta', label: 'ETA', sortable: true },
  { key: 'actions', label: '' },
]

const PAGE_SIZE = 10

function StatusPill({ status }) {
  const c = STATUS_COLORS[status] || { text: '#8B949E', bg: '#21262D' }
  const labels = { in_transit: 'In Transit', at_risk: 'At Risk', delayed: 'Delayed', delivered: 'Delivered' }
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
      style={{ color: c.text, backgroundColor: c.bg }}>
      {labels[status] || status}
    </span>
  )
}

export default function ShipmentTable({ shipments = [], loading, onViewDetail }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [riskFilter, setRiskFilter] = useState('all')
  const [sortKey, setSortKey] = useState('risk_score')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)

  const sorted = useMemo(() => {
    let list = [...shipments]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(s =>
        s.shipment_code?.toLowerCase().includes(q) ||
        s.origin_city?.toLowerCase().includes(q) ||
        s.destination_city?.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== 'all') list = list.filter(s => s.status === statusFilter)
    if (riskFilter !== 'all') {
      list = list.filter(s => {
        const r = s.risk_score
        if (riskFilter === 'low')      return r <= 30
        if (riskFilter === 'medium')   return r > 30 && r <= 60
        if (riskFilter === 'high')     return r > 60 && r <= 80
        if (riskFilter === 'critical') return r > 80
        return true
      })
    }
    if (sortKey) {
      list.sort((a, b) => {
        const av = sortKey === 'predicted_eta' ? new Date(a[sortKey]) : a[sortKey]
        const bv = sortKey === 'predicted_eta' ? new Date(b[sortKey]) : b[sortKey]
        return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1)
      })
    }
    return list
  }, [shipments, search, statusFilter, riskFilter, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
    setPage(1)
  }

  const rowBorder = (s) => {
    if (s.status === 'at_risk') return 'border-l-2 border-red-700'
    if (s.status === 'delayed') return 'border-l-2 border-amber-700'
    return ''
  }

  if (loading) return (
    <div className="card">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border-b border-border-subtle">
          {[80, 120, 100, 70, 60, 90].map((w, j) => (
            <div key={j} className="shimmer-bg h-4 rounded" style={{ width: w }} />
          ))}
        </div>
      ))}
    </div>
  )

  return (
    <div className="card">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 p-4 border-b border-border-subtle">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input className="input-field pl-8" placeholder="Search code or city..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <select className="select-field w-36" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
          <option value="all">All Status</option>
          <option value="in_transit">In Transit</option>
          <option value="at_risk">At Risk</option>
          <option value="delayed">Delayed</option>
          <option value="delivered">Delivered</option>
        </select>
        <select className="select-field w-36" value={riskFilter} onChange={e => { setRiskFilter(e.target.value); setPage(1) }}>
          <option value="all">All Risk</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <span className="text-text-muted text-xs self-center">{sorted.length} results</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle">
              {COLS.map(col => (
                <th key={col.key}
                  onClick={col.sortable ? () => toggleSort(col.key) : undefined}
                  className={`px-4 py-3 text-left text-text-muted text-xs font-medium uppercase tracking-wider
                    ${col.sortable ? 'cursor-pointer hover:text-text-primary select-none' : ''}`}>
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {paged.length === 0 ? (
              <tr><td colSpan={7}><EmptyState icon={Package} title="No shipments found" subtitle="Try adjusting your filters" /></td></tr>
            ) : paged.map(s => (
              <tr key={s.id} className={`hover:bg-bg-elevated transition-colors ${rowBorder(s)} ${s.status === 'delivered' ? 'opacity-60' : ''}`}>
                <td className="px-4 py-3">
                  <span className="font-mono text-chainguard-emerald text-xs font-medium">{s.shipment_code}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-text-primary text-xs">{s.origin_city}</span>
                  <span className="text-text-muted mx-1">→</span>
                  <span className="text-text-primary text-xs">{s.destination_city}</span>
                </td>
                <td className="px-4 py-3 text-text-muted text-xs">{s.carrier_name}</td>
                <td className="px-4 py-3"><StatusPill status={s.status} /></td>
                <td className="px-4 py-3"><RiskBadge score={s.risk_score} /></td>
                <td className="px-4 py-3 text-text-muted text-xs">
                  {s.predicted_eta ? formatDistanceToNow(new Date(s.predicted_eta), { addSuffix: true }) : '—'}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => onViewDetail(s)} className="btn-secondary py-1 px-2 text-xs">
                    <Eye className="w-3 h-3" /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border-subtle">
        <span className="text-text-muted text-xs">Page {page} of {totalPages}</span>
        <div className="flex gap-2">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="btn-secondary py-1 px-3 text-xs disabled:opacity-40">Prev</button>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
            className="btn-secondary py-1 px-3 text-xs disabled:opacity-40">Next</button>
        </div>
      </div>
    </div>
  )
}

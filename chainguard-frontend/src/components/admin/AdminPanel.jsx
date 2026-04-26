import { useState, useEffect } from 'react'
import { Shield, Users, Activity, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { checkApiHealth, checkMlHealth } from '../../services/api'
import { supabase } from '../../services/supabaseClient'

const SYSTEM_CHECKS = [
  { id: 'db', label: 'Supabase DB', check: async () => { const { error } = await supabase.from('shipments').select('id', { count: 'exact', head: true }); return !error } },
  { id: 'api', label: 'Backend API', check: async () => { try { await checkApiHealth(); return true } catch { return false } } },
  { id: 'ml', label: 'ML Engine', check: async () => { try { await checkMlHealth(); return true } catch { return false } } },
]

export default function AdminPanel() {
  const { user } = useAuth()
  const [health, setHealth] = useState({})
  const [users, setUsers] = useState([])
  const [logs, setLogs] = useState([])

  async function checkHealth() {
    const results = await Promise.allSettled(SYSTEM_CHECKS.map(async c => ({ id: c.id, ok: await c.check() })))
    const h = {}
    results.forEach(r => { if (r.status === 'fulfilled') h[r.value.id] = r.value.ok; else h['unknown'] = false })
    setHealth(h)
  }

  async function loadUsers() {
    const { data } = await supabase.from('user_profiles').select('*').order('created_at', { ascending: false })
    if (data) setUsers(data)
  }

  async function loadLogs() {
    const { data } = await supabase.from('alerts_log').select('*').order('sent_at', { ascending: false }).limit(20)
    if (data) setLogs(data)
  }

  useEffect(() => { checkHealth(); loadUsers(); loadLogs() }, [])
  useEffect(() => { const i = setInterval(checkHealth, 30000); return () => clearInterval(i) }, [])

  return (
    <div className="space-y-6">
      <h2 className="font-display font-bold text-xl flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
        <Shield className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} /> Admin Panel
      </h2>

      {/* System Health */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>System Health</h3>
          <button onClick={checkHealth} className="btn-secondary py-1 px-2 text-xs"><RefreshCw className="w-3 h-3" /> Check</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SYSTEM_CHECKS.map(c => (
            <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
              {health[c.id] ? <CheckCircle className="w-5 h-5" style={{ color: 'var(--status-safe)' }} /> : health[c.id] === false ? <XCircle className="w-5 h-5" style={{ color: 'var(--status-danger)' }} /> : <Activity className="w-5 h-5 animate-pulse" style={{ color: 'var(--text-faint)' }} />}
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{c.label}</p>
                <p className="text-xs" style={{ color: health[c.id] ? 'var(--status-safe)' : health[c.id] === false ? 'var(--status-danger)' : 'var(--text-faint)' }}>
                  {health[c.id] ? 'Online' : health[c.id] === false ? 'Offline' : 'Checking...'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 className="font-display font-semibold text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Users className="w-4 h-4" /> User Management ({users.length})
          </h3>
        </div>
        <table className="w-full text-sm">
          <thead><tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            {['Name','Email','Role','City/Assignment','Created'].map(h => <th key={h} className="px-4 py-2 text-left text-xs font-medium uppercase" style={{ color: 'var(--text-faint)' }}>{h}</th>)}
          </tr></thead>
          <tbody>{users.map(u => (
            <tr key={u.id} className="hover:bg-[var(--bg-elevated)]" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td className="px-4 py-2 font-medium" style={{ color: 'var(--text-primary)' }}>{u.full_name}</td>
              <td className="px-4 py-2 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
              <td className="px-4 py-2"><span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-subtle)', color: 'var(--accent-primary)' }}>{u.role}</span></td>
              <td className="px-4 py-2 text-xs" style={{ color: 'var(--text-secondary)' }}>{u.warehouse_city || '—'}</td>
              <td className="px-4 py-2 text-xs font-mono" style={{ color: 'var(--text-faint)' }}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      {/* Activity Log */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 font-display font-semibold text-sm" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)' }}>Recent Activity Log</div>
        <table className="w-full text-sm">
          <thead><tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            {['Time','Type','Message','Resolved'].map(h => <th key={h} className="px-4 py-2 text-left text-xs font-medium uppercase" style={{ color: 'var(--text-faint)' }}>{h}</th>)}
          </tr></thead>
          <tbody>{logs.length === 0 ? (
            <tr><td colSpan={4} className="px-4 py-6 text-center text-sm" style={{ color: 'var(--text-faint)' }}>No activity logs</td></tr>
          ) : logs.map(l => (
            <tr key={l.id} className="hover:bg-[var(--bg-elevated)]" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td className="px-4 py-2 font-mono text-xs" style={{ color: 'var(--text-faint)' }}>{l.sent_at ? new Date(l.sent_at).toLocaleString() : '—'}</td>
              <td className="px-4 py-2 text-xs" style={{ color: 'var(--text-secondary)' }}>{l.alert_type || '—'}</td>
              <td className="px-4 py-2 text-xs" style={{ color: 'var(--text-primary)' }}>{l.message}</td>
              <td className="px-4 py-2">{l.is_resolved ? <CheckCircle className="w-4 h-4" style={{ color: 'var(--status-safe)' }} /> : <XCircle className="w-4 h-4" style={{ color: 'var(--text-faint)' }} />}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  )
}

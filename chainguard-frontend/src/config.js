// ── ChainGuard Global Config ──────────────────────────────
export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
export const ML_BASE  = import.meta.env.VITE_ML_BASE_URL  || 'http://localhost:8000'
export const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const EMAILJS_CONFIG = {
  serviceId:  import.meta.env.VITE_EMAILJS_SERVICE_ID  || '',
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '',
  publicKey:  import.meta.env.VITE_EMAILJS_PUBLIC_KEY  || '',
}

export const RISK_COLORS = {
  low:      { bg: 'rgba(0,230,118,0.10)', text: '#00E676', border: 'rgba(0,230,118,0.3)' },
  medium:   { bg: 'rgba(255,179,0,0.10)', text: '#FFB300', border: 'rgba(255,179,0,0.3)' },
  high:     { bg: 'rgba(255,82,82,0.10)', text: '#FF5252', border: 'rgba(255,82,82,0.3)' },
  critical: { bg: 'rgba(255,23,68,0.12)', text: '#FF1744', border: 'rgba(255,23,68,0.3)' },
}

export const INDIA_CITIES = [
  'Mumbai','Delhi','Bangalore','Chennai','Hyderabad','Kolkata',
  'Pune','Ahmedabad','Jaipur','Lucknow','Nagpur','Bhopal',
  'Indore','Surat','Vadodara','Coimbatore','Kochi','Vizag',
  'Patna','Chandigarh','Ludhiana','Amritsar','Guwahati','Bhubaneswar','Raipur',
]

export function getRiskLevel(score) {
  if (score <= 30) return 'low'
  if (score <= 60) return 'medium'
  if (score <= 80) return 'high'
  return 'critical'
}

export function getRiskLabel(score) {
  if (score <= 30) return 'Low'
  if (score <= 60) return 'Medium'
  if (score <= 80) return 'High'
  return 'Critical'
}

export const STATUS_COLORS = {
  in_transit: { text: '#60A5FA', bg: 'rgba(96,165,250,0.12)' },
  at_risk:    { text: '#FF5252', bg: 'rgba(255,82,82,0.12)' },
  delayed:    { text: '#FFB300', bg: 'rgba(255,179,0,0.12)' },
  delivered:  { text: '#00E676', bg: 'rgba(0,230,118,0.12)' },
}

export const ROLE_VIEWS = {
  super_admin:        ['dashboard','map','shipments','optimizer','suppliers','digital-twin','carbon','analytics','admin'],
  logistics_manager:  ['dashboard','map','shipments','optimizer','suppliers','digital-twin','carbon','analytics'],
  warehouse_operator: ['warehouse_dashboard','my_shipments'],
  driver:             ['driver_view'],
  analyst:            ['analytics','dashboard','shipments','suppliers','carbon'],
  executive:          ['executive_dashboard'],
}

export const ROLE_LABELS = {
  super_admin:        { label: 'Admin',     emoji: '🔴', color: '#FF5252' },
  logistics_manager:  { label: 'Manager',   emoji: '🟢', color: '#00E676' },
  warehouse_operator: { label: 'Warehouse', emoji: '🟡', color: '#FFB300' },
  driver:             { label: 'Driver',    emoji: '🚛', color: '#60A5FA' },
  analyst:            { label: 'Analyst',   emoji: '📊', color: '#00B4D8' },
  executive:          { label: 'Executive', emoji: '👔', color: '#AB47BC' },
}

export const DEMO_USERS = [
  { role: 'super_admin',        email: 'admin@chainguard.demo',     name: 'Arjun Kumar',  desc: 'Full system access' },
  { role: 'logistics_manager',  email: 'manager@chainguard.demo',   name: 'Priya Sharma', desc: 'All operations' },
  { role: 'warehouse_operator', email: 'warehouse@chainguard.demo', name: 'Rohit Patel',  desc: 'Mumbai warehouse' },
  { role: 'driver',             email: 'driver@chainguard.demo',    name: 'Suresh Kumar', desc: 'Shipment SH-1001' },
  { role: 'analyst',            email: 'analyst@chainguard.demo',   name: 'Meera Iyer',   desc: 'Read-only analytics' },
  { role: 'executive',          email: 'ceo@chainguard.demo',       name: 'Vivek Mehta',  desc: 'Executive summary' },
]

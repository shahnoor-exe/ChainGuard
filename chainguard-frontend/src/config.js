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
  low:      { bg: '#064E3B', text: '#34D399', border: '#065F46' },
  medium:   { bg: '#451A03', text: '#FCD34D', border: '#78350F' },
  high:     { bg: '#450A0A', text: '#FCA5A5', border: '#7F1D1D' },
  critical: { bg: '#3D0000', text: '#FF4444', border: '#7F0000' },
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
  in_transit: { text: '#60A5FA', bg: '#1E3A5F' },
  at_risk:    { text: '#FCA5A5', bg: '#450A0A' },
  delayed:    { text: '#FCD34D', bg: '#451A03' },
  delivered:  { text: '#34D399', bg: '#064E3B' },
}

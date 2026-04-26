import axios from 'axios'
import { API_BASE, ML_BASE } from '../config'

// ── Main API (Node.js backend) ────────────────────────────
const api = axios.create({ baseURL: API_BASE, timeout: 10000 })

// ── ML Engine API ─────────────────────────────────────────
const mlApi = axios.create({ baseURL: ML_BASE, timeout: 15000 })

// Interceptors for consistent error logging
const errorHandler = (err) => {
  console.error('[API Error]', err?.response?.data?.message || err.message)
  return Promise.reject(err)
}
api.interceptors.response.use(r => r, errorHandler)
mlApi.interceptors.response.use(r => r, errorHandler)

// ── Dashboard ─────────────────────────────────────────────
export const fetchKPIs = () => api.get('/api/dashboard/kpis')

// ── Shipments ─────────────────────────────────────────────
export const fetchShipments      = () => api.get('/api/shipments')
export const fetchShipmentByCode = (code) => api.get(`/api/shipments/code/${code}`)
export const fetchShipmentStats  = () => api.get('/api/shipments/stats/summary')
export const updateShipmentStatus = (id, data) => api.patch(`/api/shipments/${id}/status`, data)

// ── Suppliers ─────────────────────────────────────────────
export const fetchSuppliers      = () => api.get('/api/suppliers')
export const fetchAtRiskSuppliers = () => api.get('/api/suppliers/at-risk/list')
export const updateSupplierRisk  = (id, data) => api.patch(`/api/suppliers/${id}/risk`, data)

// ── Disruptions ───────────────────────────────────────────
export const fetchDisruptions  = () => api.get('/api/disruptions')
export const resolveDisruption = (id) => api.patch(`/api/disruptions/${id}/resolve`)

// ── Routes ────────────────────────────────────────────────
export const optimizeRoute = (origin, destination, priority) =>
  api.post('/api/routes/optimize', { origin, destination, priority })
export const fetchRouteGraph = () => api.get('/api/routes/graph')

// ── ML Engine ─────────────────────────────────────────────
export const fetchRouteRisk    = (origin, dest) => mlApi.get(`/predict/route-risk/${origin}/${dest}`)
export const fetchWeatherAlerts = () => mlApi.get('/weather/india/alerts')
export const fetchNewsRisk      = () => mlApi.get('/news/risk-summary')
export const fetchRiskHeatmap   = () => mlApi.get('/risk/india/heatmap')

// ── Health checks ─────────────────────────────────────────
export const checkApiHealth = () => api.get('/')
export const checkMlHealth  = () => mlApi.get('/')

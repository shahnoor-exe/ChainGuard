import emailjs from '@emailjs/browser'
import { EMAILJS_CONFIG } from '../config'

let initialized = false

function ensureInit() {
  if (!initialized && EMAILJS_CONFIG.publicKey) {
    emailjs.init(EMAILJS_CONFIG.publicKey)
    initialized = true
  }
}

export async function sendDisruptionAlert({
  to_email,
  shipment_code,
  alert_message,
  risk_level,
  route_suggestion = 'N/A',
}) {
  ensureInit()

  if (!EMAILJS_CONFIG.serviceId || !EMAILJS_CONFIG.templateId) {
    console.warn('[EmailJS] Not configured — skipping email send')
    return { success: false, message: 'EmailJS not configured' }
  }

  const params = {
    to_email,
    subject: `ChainGuard Alert: ${shipment_code}`,
    shipment_code,
    alert_message,
    risk_level,
    route_suggestion,
    timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
  }

  try {
    await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, params)
    return { success: true, message: `Alert sent to ${to_email}` }
  } catch (err) {
    console.error('[EmailJS] Send failed:', err)
    return { success: false, message: err?.text || 'Failed to send email' }
  }
}

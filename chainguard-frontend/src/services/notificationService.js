import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from '../config';

/**
 * Sends a disruption alert email via EmailJS.
 * 
 * @param {Object} alertData - The data for the email template.
 * @param {string} alertData.shipment_code
 * @param {string} alertData.type
 * @param {string} alertData.severity
 * @param {string} alertData.origin
 * @param {string} alertData.destination
 * @param {string} alertData.eta
 * @param {string} alertData.message
 * @param {string} [alertData.to_email]
 */
export const sendDisruptionEmail = async (alertData) => {
  // Check if EmailJS is configured
  if (!EMAILJS_CONFIG.publicKey || !EMAILJS_CONFIG.serviceId || !EMAILJS_CONFIG.templateId) {
    console.warn('[Notification] EmailJS not fully configured. Skipping email.');
    return;
  }

  try {
    const templateParams = {
      shipment_code:   alertData.shipment_code || 'N/A',
      disruption_type: alertData.type || 'Operational Disruption',
      severity:        alertData.severity || 'Medium',
      origin:          alertData.origin || 'N/A',
      destination:     alertData.destination || 'N/A',
      predicted_eta:   alertData.eta || 'Calculating...',
      message:         alertData.message || 'Automatic disruption detection triggered.',
      to_email:        alertData.to_email || 'manager@chainguard.demo',
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams,
      EMAILJS_CONFIG.publicKey
    );

    console.log('✅ Disruption alert email sent!', response.status, response.text);
    return { success: true, response };
  } catch (err) {
    console.error('❌ Failed to send disruption email:', err);
    return { success: false, error: err };
  }
};

/**
 * Utility to format a Date object for the email template.
 */
export const formatEtaForEmail = (dateString) => {
  if (!dateString) return 'TBD';
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }) + ' IST';
};

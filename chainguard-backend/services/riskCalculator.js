// ============================================================
// ChainGuard — Risk Calculator Service
// Computes risk scores for suppliers and shipments.
// ============================================================

/**
 * Calculate a supplier's composite risk score.
 *
 * Formula weights:
 *   weather_risk    × 0.30
 *   delay_fraction  × 0.40   (100 − on_time_rate)
 *   lead_time_norm  × 0.30   (avg_lead_time_days / 7, capped at 1)
 *
 * @param {object} supplier — row from the suppliers table
 * @returns {number} risk score 0–100 (integer)
 */
export function calculateSupplierRisk(supplier) {
  const weatherComponent = (supplier.weather_risk || 0) * 0.30;
  const delayFraction = 100 - (supplier.on_time_rate ?? 95);
  const delayComponent = delayFraction * 0.40;
  const leadTimeNorm = Math.min((supplier.avg_lead_time_days ?? 3) / 7, 1);
  const leadTimeComponent = leadTimeNorm * 100 * 0.30;

  const raw = weatherComponent + delayComponent + leadTimeComponent;
  return Math.round(Math.max(0, Math.min(100, raw)));
}

/**
 * Calculate a shipment's risk score based on active disruptions.
 *
 * Contribution by disruption type:
 *   weather    → +25
 *   traffic    → +20
 *   news       → +30
 *   festival   → +15
 *   checkpost  → +20
 *   operational → +15
 *
 * @param {object}   shipment          — row from the shipments table
 * @param {object[]} activeDisruptions — rows where is_active = true
 * @returns {number} risk score 0–100
 */
export function calculateShipmentRisk(shipment, activeDisruptions = []) {
  const TYPE_CONTRIBUTIONS = {
    weather: 25,
    traffic: 20,
    news: 30,
    festival: 15,
    checkpost: 20,
    operational: 15,
  };

  let risk = 10; // base risk for any active shipment

  for (const d of activeDisruptions) {
    const affected = d.affected_cities || [];
    const isAffected =
      affected.includes(shipment.origin_city) ||
      affected.includes(shipment.destination_city);

    if (isAffected) {
      risk += TYPE_CONTRIBUTIONS[d.type] || 10;
    }
  }

  return Math.round(Math.max(0, Math.min(100, risk)));
}

/**
 * Map a numeric risk score to a human-readable label + colour.
 *
 * @param {number} score 0–100
 * @returns {{ label: string, color: string }}
 */
export function getRiskLabel(score) {
  if (score <= 30) return { label: 'Low', color: 'green' };
  if (score <= 60) return { label: 'Medium', color: 'yellow' };
  if (score <= 80) return { label: 'High', color: 'orange' };
  return { label: 'Critical', color: 'red' };
}

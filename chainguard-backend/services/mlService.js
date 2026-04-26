// ============================================================
// ChainGuard — ML Service Proxy
// Calls the Python FastAPI ML engine on port 8000.
// Falls back to a deterministic estimate when ML is offline.
// ============================================================

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:8000';

/**
 * Request a predicted ETA from the ML engine.
 *
 * POST /predict/eta → { predicted_eta, confidence, delay_hours }
 *
 * If the ML engine is unreachable we fall back to:
 *   planned_eta + delay_hours offset.
 *
 * @param {object} shipmentData
 * @returns {Promise<{ predicted_eta: string, confidence: number, delay_hours: number }>}
 */
export async function getPredictedETA(shipmentData) {
  const {
    origin_city,
    destination_city,
    weight_kg = 500,
    risk_score = 0,
    vehicle_type = 'truck',
    planned_eta,
    delay_hours = 0,
  } = shipmentData;

  try {
    const response = await fetch(`${ML_ENGINE_URL}/predict/eta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: origin_city,
        destination: destination_city,
        weight_kg,
        risk_score,
        vehicle_type,
      }),
      signal: AbortSignal.timeout(5000), // 5-second timeout
    });

    if (!response.ok) {
      throw new Error(`ML engine returned ${response.status}`);
    }

    const data = await response.json();
    return {
      predicted_eta: data.predicted_eta,
      confidence: data.confidence ?? 0.75,
      delay_hours: data.delay_hours ?? delay_hours,
    };
  } catch (err) {
    // ML engine is down — deterministic fallback
    console.warn('⚠️  ML engine unavailable, using fallback ETA:', err.message);

    const base = planned_eta ? new Date(planned_eta) : new Date();
    const offsetMs = (delay_hours || 0) * 60 * 60 * 1000;
    const fallbackEta = new Date(base.getTime() + offsetMs);

    return {
      predicted_eta: fallbackEta.toISOString(),
      confidence: 0.5, // low confidence for fallback
      delay_hours: delay_hours || 0,
    };
  }
}

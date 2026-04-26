// ============================================================
// ChainGuard — Shipments API
// ============================================================
import { Router } from 'express';
import supabase from '../supabase.js';
import { calculateShipmentRisk, getRiskLabel } from '../services/riskCalculator.js';
import { getPredictedETA } from '../services/mlService.js';

const router = Router();

// ── GET / — all shipments, ordered by risk_score DESC ───────
router.get('/', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .order('risk_score', { ascending: false });

    if (error) throw error;

    const enriched = data.map((s) => ({
      ...s,
      risk_label: getRiskLabel(s.risk_score),
    }));

    res.json({ success: true, data: enriched, count: enriched.length });
  } catch (err) {
    console.error('GET /shipments error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /stats/summary — aggregate KPIs ─────────────────────
// (placed before /:id so Express doesn't treat "stats" as an id)
router.get('/stats/summary', async (_req, res) => {
  try {
    const { data, error } = await supabase.from('shipments').select('*');
    if (error) throw error;

    const total = data.length;
    const at_risk = data.filter((s) => s.status === 'at_risk').length;
    const delayed = data.filter((s) => s.status === 'delayed').length;
    const delivered = data.filter((s) => s.status === 'delivered').length;
    const in_transit = data.filter((s) => s.status === 'in_transit').length;
    const avgRisk =
      total > 0
        ? Math.round(data.reduce((sum, s) => sum + s.risk_score, 0) / total)
        : 0;

    res.json({
      success: true,
      data: { total, at_risk, delayed, delivered, in_transit, avg_risk_score: avgRisk },
    });
  } catch (err) {
    console.error('GET /shipments/stats/summary error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /code/:code — by shipment_code ──────────────────────
router.get('/code/:code', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('shipment_code', req.params.code)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }

    res.json({ success: true, data: { ...data, risk_label: getRiskLabel(data.risk_score) } });
  } catch (err) {
    console.error('GET /shipments/code error:', err);
    res.status(404).json({ success: false, message: 'Shipment not found' });
  }
});

// ── GET /:id — single shipment by UUID ──────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;

    res.json({ success: true, data: { ...data, risk_label: getRiskLabel(data.risk_score) } });
  } catch (err) {
    console.error('GET /shipments/:id error:', err);
    res.status(404).json({ success: false, message: 'Shipment not found' });
  }
});

// ── POST / — create shipment ────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('shipments')
      .insert(req.body)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data, message: 'Shipment created' });
  } catch (err) {
    console.error('POST /shipments error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── PATCH /:id/status — update status, risk_score, predicted_eta ─
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, risk_score, predicted_eta } = req.body;
    const update = {};
    if (status !== undefined) update.status = status;
    if (risk_score !== undefined) update.risk_score = risk_score;
    if (predicted_eta !== undefined) update.predicted_eta = predicted_eta;

    const { data, error } = await supabase
      .from('shipments')
      .update(update)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data, message: 'Shipment status updated' });
  } catch (err) {
    console.error('PATCH /shipments/:id/status error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── PATCH /:id/location — update lat/lng ────────────────────
router.patch('/:id/location', async (req, res) => {
  try {
    const { current_location_lat, current_location_lng } = req.body;

    const { data, error } = await supabase
      .from('shipments')
      .update({ current_location_lat, current_location_lng })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data, message: 'Location updated' });
  } catch (err) {
    console.error('PATCH /shipments/:id/location error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── DELETE /:id ─────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('shipments')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ success: true, message: 'Shipment deleted' });
  } catch (err) {
    console.error('DELETE /shipments/:id error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

export default router;

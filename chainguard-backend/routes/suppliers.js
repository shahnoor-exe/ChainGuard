// ============================================================
// ChainGuard — Suppliers API
// ============================================================
import { Router } from 'express';
import supabase from '../supabase.js';
import { calculateSupplierRisk, getRiskLabel } from '../services/riskCalculator.js';

const router = Router();

// ── GET / — all suppliers, ordered by risk_score DESC ───────
router.get('/', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('risk_score', { ascending: false });

    if (error) throw error;

    const enriched = data.map((s) => ({
      ...s,
      risk_label: getRiskLabel(s.risk_score),
    }));

    res.json({ success: true, data: enriched, count: enriched.length });
  } catch (err) {
    console.error('GET /suppliers error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /at-risk/list — suppliers with risk > 65 + alternatives ─
router.get('/at-risk/list', async (_req, res) => {
  try {
    // Fetch all suppliers (we need both at-risk and low-risk for alternatives)
    const { data: allSuppliers, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('risk_score', { ascending: false });

    if (error) throw error;

    const atRisk = allSuppliers.filter((s) => s.risk_score > 65);

    const result = atRisk.map((supplier) => {
      // Find top 3 lowest-risk suppliers in the same category
      const alternatives = allSuppliers
        .filter(
          (alt) =>
            alt.id !== supplier.id &&
            alt.category === supplier.category &&
            alt.risk_score <= 65
        )
        .sort((a, b) => a.risk_score - b.risk_score)
        .slice(0, 3)
        .map((alt) => ({
          id: alt.id,
          name: alt.name,
          location_city: alt.location_city,
          risk_score: alt.risk_score,
          on_time_rate: alt.on_time_rate,
          risk_label: getRiskLabel(alt.risk_score),
        }));

      return {
        ...supplier,
        risk_label: getRiskLabel(supplier.risk_score),
        alternatives,
      };
    });

    res.json({ success: true, data: result, count: result.length });
  } catch (err) {
    console.error('GET /suppliers/at-risk/list error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /:id — single supplier ──────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: { ...data, risk_label: getRiskLabel(data.risk_score) },
    });
  } catch (err) {
    console.error('GET /suppliers/:id error:', err);
    res.status(404).json({ success: false, message: 'Supplier not found' });
  }
});

// ── POST / — create supplier ────────────────────────────────
router.post('/', async (req, res) => {
  try {
    // Auto-calculate risk score if not provided
    const body = { ...req.body };
    if (body.risk_score === undefined) {
      body.risk_score = calculateSupplierRisk(body);
    }

    const { data, error } = await supabase
      .from('suppliers')
      .insert(body)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data, message: 'Supplier created' });
  } catch (err) {
    console.error('POST /suppliers error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── PATCH /:id/risk — update risk_score + weather_risk ──────
router.patch('/:id/risk', async (req, res) => {
  try {
    const { risk_score, weather_risk } = req.body;
    const update = {};
    if (risk_score !== undefined) update.risk_score = risk_score;
    if (weather_risk !== undefined) update.weather_risk = weather_risk;

    const { data, error } = await supabase
      .from('suppliers')
      .update(update)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data, message: 'Supplier risk updated' });
  } catch (err) {
    console.error('PATCH /suppliers/:id/risk error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── DELETE /:id ─────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ success: true, message: 'Supplier deleted' });
  } catch (err) {
    console.error('DELETE /suppliers/:id error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

export default router;

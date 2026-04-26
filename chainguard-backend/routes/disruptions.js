// ============================================================
// ChainGuard — Disruptions API
// ============================================================
import { Router } from 'express';
import supabase from '../supabase.js';
import { getRiskLabel } from '../services/riskCalculator.js';

const router = Router();

// ── GET / — active disruptions only (is_active = true) ──────
router.get('/', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('disruptions')
      .select('*')
      .eq('is_active', true)
      .order('detected_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data, count: data.length });
  } catch (err) {
    console.error('GET /disruptions error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /all — all disruptions including inactive ───────────
router.get('/all', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('disruptions')
      .select('*')
      .order('detected_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data, count: data.length });
  } catch (err) {
    console.error('GET /disruptions/all error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /:id — single disruption ────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('disruptions')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    console.error('GET /disruptions/:id error:', err);
    res.status(404).json({ success: false, message: 'Disruption not found' });
  }
});

// ── POST / — create disruption ──────────────────────────────
router.post('/', async (req, res) => {
  try {
    const body = {
      ...req.body,
      is_active: req.body.is_active ?? true,
      detected_at: req.body.detected_at || new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('disruptions')
      .insert(body)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data, message: 'Disruption created' });
  } catch (err) {
    console.error('POST /disruptions error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── PATCH /:id/resolve — deactivate a disruption ────────────
router.patch('/:id/resolve', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('disruptions')
      .update({ is_active: false })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data, message: 'Disruption resolved' });
  } catch (err) {
    console.error('PATCH /disruptions/:id/resolve error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── DELETE /:id ─────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('disruptions')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ success: true, message: 'Disruption deleted' });
  } catch (err) {
    console.error('DELETE /disruptions/:id error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

export default router;

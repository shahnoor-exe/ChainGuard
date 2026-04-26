// ============================================================
// ChainGuard — Dashboard KPI API
// Aggregates all key performance indicators in a single call.
// ============================================================
import { Router } from 'express';
import supabase from '../supabase.js';

const router = Router();

// ── GET /kpis — master KPI endpoint ─────────────────────────
router.get('/kpis', async (_req, res) => {
  try {
    // Parallel queries for speed
    const [shipmentsRes, suppliersRes, disruptionsRes, alertsRes] =
      await Promise.all([
        supabase.from('shipments').select('*'),
        supabase.from('suppliers').select('*'),
        supabase.from('disruptions').select('*').eq('is_active', true),
        supabase
          .from('disruptions')
          .select('*')
          .eq('is_active', true)
          .order('detected_at', { ascending: false })
          .limit(5),
      ]);

    if (shipmentsRes.error) throw shipmentsRes.error;
    if (suppliersRes.error) throw suppliersRes.error;
    if (disruptionsRes.error) throw disruptionsRes.error;

    const shipments = shipmentsRes.data;
    const suppliers = suppliersRes.data;
    const disruptions = disruptionsRes.data;

    // ── Shipment KPIs ─────────────────────────────────────────
    const total_shipments = shipments.length;
    const at_risk_count = shipments.filter((s) => s.status === 'at_risk').length;
    const delayed_count = shipments.filter((s) => s.status === 'delayed').length;

    // "Delivered today" — check for status=delivered with planned_eta or created_at today
    const today = new Date().toISOString().slice(0, 10);
    const delivered_today = shipments.filter(
      (s) =>
        s.status === 'delivered' &&
        (s.planned_eta?.slice(0, 10) === today ||
          s.created_at?.slice(0, 10) === today)
    ).length;

    // On-time rate: delivered shipments where delay_hours <= 0
    const deliveredShipments = shipments.filter((s) => s.status === 'delivered');
    const onTimeCount = deliveredShipments.filter(
      (s) => (s.delay_hours || 0) <= 0
    ).length;
    const on_time_rate =
      deliveredShipments.length > 0
        ? Math.round((onTimeCount / deliveredShipments.length) * 100)
        : 100;

    // Average carbon per shipment (sum all route carbon / total)
    const totalCarbon = shipments.reduce((sum, s) => {
      // Estimate carbon from weight: ~0.1 kg CO2 per kg cargo per 100km avg
      return sum + (s.weight_kg || 500) * 0.1;
    }, 0);
    const avg_carbon_per_shipment =
      total_shipments > 0
        ? Math.round((totalCarbon / total_shipments) * 10) / 10
        : 0;

    // ── Supplier KPIs ─────────────────────────────────────────
    const high_risk_suppliers_count = suppliers.filter(
      (s) => s.risk_score > 65
    ).length;

    // ── Disruption KPIs ───────────────────────────────────────
    const active_disruptions_count = disruptions.length;
    const critical_alerts = alertsRes.data || [];

    res.json({
      success: true,
      data: {
        total_shipments,
        at_risk_count,
        delayed_count,
        delivered_today,
        on_time_rate,
        avg_carbon_per_shipment,
        active_disruptions_count,
        high_risk_suppliers_count,
        critical_alerts,
      },
    });
  } catch (err) {
    console.error('GET /dashboard/kpis error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

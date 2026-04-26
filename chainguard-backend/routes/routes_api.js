// ============================================================
// ChainGuard — Route Optimizer API
// ============================================================
import { Router } from 'express';
import { optimizeRoute, getGraphData } from '../services/routeOptimizer.js';

const router = Router();

// ── POST /optimize — find top-3 routes between two cities ───
router.post('/optimize', async (req, res) => {
  try {
    const { origin, destination, priority } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        message: 'Both "origin" and "destination" are required',
      });
    }

    const validPriorities = ['speed', 'cost', 'carbon'];
    const safePriority = validPriorities.includes(priority) ? priority : 'speed';

    const result = optimizeRoute(origin, destination, safePriority);

    res.json({
      success: true,
      data: {
        origin,
        destination,
        priority: safePriority,
        ...result,
      },
      message: `Found ${result.routes.length} route(s)`,
    });
  } catch (err) {
    console.error('POST /routes/optimize error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── GET /graph — raw graph data for frontend map rendering ──
router.get('/graph', (_req, res) => {
  try {
    const graph = getGraphData();
    res.json({ success: true, data: graph });
  } catch (err) {
    console.error('GET /routes/graph error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

// ============================================================
// ChainGuard — Route Optimizer Service
// Dijkstra + Yen's K-Shortest Paths on the 25-city India graph
// ============================================================
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the graph once at module init
const graphData = JSON.parse(
  readFileSync(join(__dirname, '..', 'data', 'india_routes.json'), 'utf-8')
);

// ── Build bidirectional adjacency list ──────────────────────

/**
 * Each adjacency entry:
 *   { to, distance_km, duration_hrs, carbon_kg, toll_inr, nh }
 */
function buildAdjacencyList(edges) {
  const adj = {};
  for (const e of edges) {
    if (!adj[e.from]) adj[e.from] = [];
    if (!adj[e.to]) adj[e.to] = [];
    const base = {
      distance_km: e.distance_km,
      duration_hrs: e.duration_hrs,
      carbon_kg: e.carbon_kg,
      toll_inr: e.toll_inr,
      nh: e.nh,
    };
    adj[e.from].push({ to: e.to, ...base });
    adj[e.to].push({ to: e.from, ...base }); // bidirectional
  }
  return adj;
}

const adjacencyList = buildAdjacencyList(graphData.edges);

// ── Weight selector ─────────────────────────────────────────
function getWeight(edge, priority) {
  switch (priority) {
    case 'speed':  return edge.duration_hrs;
    case 'cost':   return edge.toll_inr;
    case 'carbon': return edge.carbon_kg;
    default:       return edge.duration_hrs;
  }
}

// ── Dijkstra ────────────────────────────────────────────────
/**
 * Standard Dijkstra with penalty multipliers per edge (for Yen's).
 * @returns {{ path: string[], totalCost: number } | null}
 */
function dijkstra(adj, origin, destination, priority, penalties = {}) {
  const dist = {};
  const prev = {};
  const visited = new Set();

  for (const city of Object.keys(adj)) {
    dist[city] = Infinity;
  }
  dist[origin] = 0;

  while (true) {
    // Find unvisited node with smallest distance
    let u = null;
    let minDist = Infinity;
    for (const city of Object.keys(adj)) {
      if (!visited.has(city) && dist[city] < minDist) {
        minDist = dist[city];
        u = city;
      }
    }
    if (u === null || u === destination) break;

    visited.add(u);

    for (const edge of adj[u]) {
      if (visited.has(edge.to)) continue;

      let w = getWeight(edge, priority);

      // Apply penalty if present (used by Yen's algorithm)
      const penaltyKey = `${u}->${edge.to}`;
      if (penalties[penaltyKey]) {
        w *= penalties[penaltyKey];
      }

      const alt = dist[u] + w;
      if (alt < dist[edge.to]) {
        dist[edge.to] = alt;
        prev[edge.to] = u;
      }
    }
  }

  if (dist[destination] === Infinity) return null;

  // Reconstruct path
  const path = [];
  let current = destination;
  while (current) {
    path.unshift(current);
    current = prev[current];
  }

  return { path, totalCost: dist[destination] };
}

// ── Compute full route stats along a path ───────────────────
function computeRouteStats(path) {
  let total_distance_km = 0;
  let estimated_duration_hrs = 0;
  let estimated_cost_inr = 0;
  let carbon_kg = 0;
  const nh_used = new Set();

  for (let i = 0; i < path.length - 1; i++) {
    const from = path[i];
    const to = path[i + 1];
    const edge = adjacencyList[from]?.find((e) => e.to === to);
    if (edge) {
      total_distance_km += edge.distance_km;
      estimated_duration_hrs += edge.duration_hrs;
      estimated_cost_inr += edge.toll_inr;
      carbon_kg += edge.carbon_kg;
      nh_used.add(edge.nh);
    }
  }

  return {
    total_distance_km: Math.round(total_distance_km),
    estimated_duration_hrs: Math.round(estimated_duration_hrs * 10) / 10,
    estimated_cost_inr: Math.round(estimated_cost_inr),
    carbon_kg: Math.round(carbon_kg * 10) / 10,
    nh_used: [...nh_used],
  };
}

// ── Scoring helpers (inverse normalisation → 0–100) ─────────
// Lower duration/cost/carbon ⇒ higher score

// We define reference maxima for scoring normalisation
const MAX_DURATION = 80;  // hrs — cross-country worst case
const MAX_COST = 8000;    // INR
const MAX_CARBON = 600;   // kg

function scoreInverse(value, max) {
  return Math.round(Math.max(0, Math.min(100, (1 - value / max) * 100)));
}

// ── Yen's K-Shortest Paths (simplified) ─────────────────────
/**
 * Find up to k shortest paths from origin → destination.
 * Uses increasing penalty multipliers on edges of found paths.
 */
function yenKShortest(origin, destination, priority, k = 3) {
  const results = [];
  const penalties = {};

  for (let i = 0; i < k; i++) {
    const result = dijkstra(adjacencyList, origin, destination, priority, penalties);
    if (!result) break;

    // Check if this path is a duplicate
    const pathStr = result.path.join('→');
    const isDuplicate = results.some((r) => r.path.join('→') === pathStr);
    if (isDuplicate) {
      // Increase penalties more aggressively and retry
      for (let j = 0; j < result.path.length - 1; j++) {
        const key = `${result.path[j]}->${result.path[j + 1]}`;
        penalties[key] = (penalties[key] || 1) * 3;
      }
      continue;
    }

    results.push(result);

    // Penalise edges of the found path so next iteration finds a different one
    for (let j = 0; j < result.path.length - 1; j++) {
      const key = `${result.path[j]}->${result.path[j + 1]}`;
      penalties[key] = (penalties[key] || 1) * 2.5;
    }
  }

  return results;
}

// ── Public API ──────────────────────────────────────────────

/**
 * Optimise a route between two Indian cities.
 *
 * @param {string} origin        — city name (must be in the 25-city set)
 * @param {string} destination   — city name
 * @param {string} priority      — "speed" | "cost" | "carbon"
 * @returns {{ routes: object[] }}
 */
export function optimizeRoute(origin, destination, priority = 'speed') {
  // Validate cities
  if (!adjacencyList[origin]) {
    throw new Error(`Unknown origin city: "${origin}"`);
  }
  if (!adjacencyList[destination]) {
    throw new Error(`Unknown destination city: "${destination}"`);
  }
  if (origin === destination) {
    throw new Error('Origin and destination must be different');
  }

  const kPaths = yenKShortest(origin, destination, priority, 3);

  if (kPaths.length === 0) {
    throw new Error(`No route found from "${origin}" to "${destination}"`);
  }

  const routes = kPaths.map((r, idx) => {
    const stats = computeRouteStats(r.path);
    return {
      path: r.path,
      nh_used: stats.nh_used,
      total_distance_km: stats.total_distance_km,
      estimated_duration_hrs: stats.estimated_duration_hrs,
      estimated_cost_inr: stats.estimated_cost_inr,
      carbon_kg: stats.carbon_kg,
      speed_score: scoreInverse(stats.estimated_duration_hrs, MAX_DURATION),
      cost_score: scoreInverse(stats.estimated_cost_inr, MAX_COST),
      carbon_score: scoreInverse(stats.carbon_kg, MAX_CARBON),
      recommended: idx === 0,
    };
  });

  return { routes };
}

/**
 * Return the raw graph data for frontend map rendering.
 */
export function getGraphData() {
  return graphData;
}

// ============================================================
// ChainGuard — Database Seed Script
// Run: npm run seed
// ============================================================
import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const seedData = JSON.parse(
  readFileSync(join(__dirname, 'data', 'seed_data.json'), 'utf-8')
);
const routeGraph = JSON.parse(
  readFileSync(join(__dirname, 'data', 'india_routes.json'), 'utf-8')
);

// ── Helper: hours from now ──────────────────────────────────
function hoursFromNow(h) {
  return new Date(Date.now() + h * 3600000).toISOString();
}
function hoursAgo(h) {
  return new Date(Date.now() - h * 3600000).toISOString();
}

// ── City coordinates lookup ─────────────────────────────────
const CITY_COORDS = {
  Mumbai: [19.076, 72.8777], Delhi: [28.7041, 77.1025],
  Bangalore: [12.9716, 77.5946], Chennai: [13.0827, 80.2707],
  Hyderabad: [17.385, 78.4867], Kolkata: [22.5726, 88.3639],
  Pune: [18.5204, 73.8567], Ahmedabad: [23.0225, 72.5714],
  Jaipur: [26.9124, 75.7873], Lucknow: [26.8467, 80.9462],
  Nagpur: [21.1458, 79.0882], Bhopal: [23.2599, 77.4126],
  Indore: [22.7196, 75.8577], Surat: [21.1702, 72.8311],
  Vadodara: [22.3072, 73.1812], Coimbatore: [11.0168, 76.9558],
  Kochi: [9.9312, 76.2673], Vizag: [17.6868, 83.2185],
  Patna: [25.6093, 85.1376], Chandigarh: [30.7333, 76.7794],
  Ludhiana: [30.901, 75.8573], Amritsar: [31.634, 74.8723],
  Guwahati: [26.1445, 91.7362], Bhubaneswar: [20.2961, 85.8245],
  Raipur: [21.2514, 81.6296],
};

function midpoint(city1, city2) {
  const c1 = CITY_COORDS[city1] || [20, 78];
  const c2 = CITY_COORDS[city2] || [20, 78];
  return [(c1[0] + c2[0]) / 2, (c1[1] + c2[1]) / 2];
}

async function seed() {
  console.log('🔄 Clearing existing data...');

  // Delete in FK-safe order
  await supabase.from('alerts_log').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('shipments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('routes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('suppliers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('disruptions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('✅ Cleared all tables');

  // ── 1. Suppliers ────────────────────────────────────────────
  const { data: suppliers, error: supErr } = await supabase
    .from('suppliers')
    .insert(seedData.suppliers)
    .select();
  if (supErr) throw supErr;
  console.log(`✅ Inserted ${suppliers.length} suppliers`);

  // ── 2. Routes ───────────────────────────────────────────────
  const routeRecords = routeGraph.edges.map((e) => ({
    origin_city: e.from,
    destination_city: e.to,
    distance_km: e.distance_km,
    base_duration_hrs: e.duration_hrs,
    nh_segments: [e.nh],
    risk_segments: [{ segment: e.nh, risk: Math.floor(Math.random() * 30) + 10 }],
    carbon_kg: e.carbon_kg,
    toll_cost_inr: e.toll_inr,
  }));

  const { data: routes, error: rtErr } = await supabase
    .from('routes')
    .insert(routeRecords)
    .select();
  if (rtErr) throw rtErr;
  console.log(`✅ Inserted ${routes.length} routes`);

  // ── 3. Disruptions ─────────────────────────────────────────
  const disruptionRecords = seedData.disruptions.map((d) => ({
    ...d,
    expires_at: hoursFromNow(24),
    detected_at: hoursAgo(Math.floor(Math.random() * 12)),
  }));

  const { data: disruptions, error: disErr } = await supabase
    .from('disruptions')
    .insert(disruptionRecords)
    .select();
  if (disErr) throw disErr;
  console.log(`✅ Inserted ${disruptions.length} disruptions`);

  // ── 4. Shipments (30 total) ────────────────────────────────
  const carriers = ['BlueDart Express', 'Delhivery', 'Gati Logistics', 'TCI Express', 'Rivigo', 'Ecom Express', 'Safexpress'];
  const vehicles = ['truck', 'truck', 'truck', 'van', 'truck', 'van'];

  const shipmentDefs = [
    { code: 'SH-1001', from: 'Mumbai', to: 'Delhi', status: 'in_transit', risk: 25 },
    { code: 'SH-1002', from: 'Bangalore', to: 'Chennai', status: 'at_risk', risk: 72 },
    { code: 'SH-1003', from: 'Delhi', to: 'Lucknow', status: 'delayed', risk: 85 },
    { code: 'SH-1004', from: 'Pune', to: 'Hyderabad', status: 'in_transit', risk: 30 },
    { code: 'SH-1005', from: 'Kolkata', to: 'Patna', status: 'in_transit', risk: 45 },
    { code: 'SH-1006', from: 'Ahmedabad', to: 'Indore', status: 'at_risk', risk: 68 },
    { code: 'SH-1007', from: 'Chennai', to: 'Coimbatore', status: 'delivered', risk: 0 },
    { code: 'SH-1008', from: 'Hyderabad', to: 'Nagpur', status: 'in_transit', risk: 38 },
    { code: 'SH-1009', from: 'Mumbai', to: 'Surat', status: 'at_risk', risk: 78 },
    { code: 'SH-1010', from: 'Delhi', to: 'Chandigarh', status: 'in_transit', risk: 20 },
    { code: 'SH-1011', from: 'Nagpur', to: 'Raipur', status: 'in_transit', risk: 42 },
    { code: 'SH-1012', from: 'Lucknow', to: 'Patna', status: 'at_risk', risk: 75 },
    { code: 'SH-1013', from: 'Chandigarh', to: 'Ludhiana', status: 'in_transit', risk: 15 },
    { code: 'SH-1014', from: 'Bangalore', to: 'Hyderabad', status: 'in_transit', risk: 33 },
    { code: 'SH-1015', from: 'Surat', to: 'Ahmedabad', status: 'delivered', risk: 0 },
    { code: 'SH-1016', from: 'Kochi', to: 'Coimbatore', status: 'in_transit', risk: 22 },
    { code: 'SH-1017', from: 'Vizag', to: 'Bhubaneswar', status: 'at_risk', risk: 70 },
    { code: 'SH-1018', from: 'Bhopal', to: 'Nagpur', status: 'in_transit', risk: 48 },
    { code: 'SH-1019', from: 'Indore', to: 'Bhopal', status: 'delivered', risk: 0 },
    { code: 'SH-1020', from: 'Delhi', to: 'Jaipur', status: 'in_transit', risk: 28 },
    { code: 'SH-1021', from: 'Hyderabad', to: 'Vizag', status: 'at_risk', risk: 65 },
    { code: 'SH-1022', from: 'Mumbai', to: 'Nagpur', status: 'delayed', risk: 80 },
    { code: 'SH-1023', from: 'Kolkata', to: 'Bhubaneswar', status: 'in_transit', risk: 35 },
    { code: 'SH-1024', from: 'Pune', to: 'Mumbai', status: 'delivered', risk: 0 },
    { code: 'SH-1025', from: 'Ludhiana', to: 'Amritsar', status: 'at_risk', risk: 73 },
    { code: 'SH-1026', from: 'Ahmedabad', to: 'Surat', status: 'in_transit', risk: 18 },
    { code: 'SH-1027', from: 'Chennai', to: 'Bangalore', status: 'delivered', risk: 0 },
    { code: 'SH-1028', from: 'Jaipur', to: 'Delhi', status: 'in_transit', risk: 40 },
    { code: 'SH-1029', from: 'Raipur', to: 'Nagpur', status: 'delayed', risk: 82 },
    { code: 'SH-1030', from: 'Patna', to: 'Lucknow', status: 'delivered', risk: 0 },
  ];

  const shipmentRecords = shipmentDefs.map((s, i) => {
    const mid = midpoint(s.from, s.to);
    const isDelivered = s.status === 'delivered';
    const dest = CITY_COORDS[s.to] || [20, 78];
    return {
      shipment_code: s.code,
      origin_city: s.from,
      destination_city: s.to,
      current_location_lat: isDelivered ? dest[0] : mid[0],
      current_location_lng: isDelivered ? dest[1] : mid[1],
      carrier_name: carriers[i % carriers.length],
      vehicle_type: vehicles[i % vehicles.length],
      weight_kg: 200 + Math.floor(Math.random() * 800),
      status: s.status,
      planned_eta: isDelivered ? hoursAgo(Math.floor(Math.random() * 12)) : hoursFromNow(6 + Math.floor(Math.random() * 48)),
      predicted_eta: isDelivered ? hoursAgo(Math.floor(Math.random() * 10)) : hoursFromNow(8 + Math.floor(Math.random() * 50)),
      risk_score: s.risk,
      delay_hours: isDelivered ? 0 : s.risk > 60 ? 2 + Math.random() * 6 : Math.random() * 2,
      supplier_id: suppliers[i % suppliers.length].id,
    };
  });

  const { data: shipments, error: shErr } = await supabase
    .from('shipments')
    .insert(shipmentRecords)
    .select();
  if (shErr) throw shErr;
  console.log(`✅ Inserted ${shipments.length} shipments`);

  // ── Summary ─────────────────────────────────────────────────
  const statuses = {};
  for (const s of shipments) {
    statuses[s.status] = (statuses[s.status] || 0) + 1;
  }
  console.log('\n📊 Shipment breakdown:', statuses);
  console.log(`📊 High-risk suppliers (>65): ${suppliers.filter((s) => s.risk_score > 65).length}`);
  console.log(`📊 Active disruptions: ${disruptions.length}`);
  console.log('\n🚀 ChainGuard DB seeded successfully!');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});

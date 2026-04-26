-- ============================================================
-- ChainGuard — Supabase PostgreSQL Schema
-- Run this in the Supabase SQL Editor to create all tables.
-- ============================================================

-- 1. Shipments
CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_code TEXT UNIQUE NOT NULL,
  origin_city TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  current_location_lat FLOAT,
  current_location_lng FLOAT,
  carrier_name TEXT,
  vehicle_type TEXT DEFAULT 'truck',
  weight_kg FLOAT DEFAULT 500,
  status TEXT DEFAULT 'in_transit'
    CHECK (status IN ('in_transit','delayed','delivered','at_risk')),
  planned_eta TIMESTAMPTZ,
  predicted_eta TIMESTAMPTZ,
  risk_score INT DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),
  delay_hours FLOAT DEFAULT 0,
  route_id UUID,
  supplier_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Routes
CREATE TABLE IF NOT EXISTS routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_city TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  distance_km FLOAT,
  base_duration_hrs FLOAT,
  nh_segments JSONB,
  risk_segments JSONB,
  carbon_kg FLOAT,
  toll_cost_inr FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location_city TEXT NOT NULL,
  location_lat FLOAT,
  location_lng FLOAT,
  risk_score INT DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),
  on_time_rate FLOAT DEFAULT 95.0,
  avg_lead_time_days FLOAT DEFAULT 3.0,
  last_delivery_date DATE,
  weather_risk INT DEFAULT 0,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Disruptions
CREATE TABLE IF NOT EXISTS disruptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL
    CHECK (type IN ('weather','traffic','news','festival','checkpost','operational')),
  severity TEXT DEFAULT 'medium'
    CHECK (severity IN ('low','medium','high','critical')),
  title TEXT NOT NULL,
  description TEXT,
  affected_cities JSONB,
  affected_route_ids JSONB,
  risk_score_contribution INT DEFAULT 10,
  source TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- 5. Alerts Log
CREATE TABLE IF NOT EXISTS alerts_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
  alert_type TEXT,
  message TEXT,
  sent_to TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  is_resolved BOOLEAN DEFAULT FALSE
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_risk ON shipments(risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_suppliers_risk ON suppliers(risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_disruptions_active ON disruptions(is_active);
CREATE INDEX IF NOT EXISTS idx_alerts_shipment ON alerts_log(shipment_id);

-- ============================================================
-- 6. User Profiles with Role-Based Access Control
-- ============================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'logistics_manager'
              CHECK (role IN (
                'super_admin','logistics_manager',
                'warehouse_operator','driver','analyst','executive'
              )),
  warehouse_city TEXT,
  assigned_shipment_id UUID,
  company_name TEXT DEFAULT 'ChainGuard Demo Co.',
  avatar_initials TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Super admin reads all profiles"
  ON user_profiles FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- RLS for shipments
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Manager and admin see all shipments"
  ON shipments FOR SELECT TO authenticated
  USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid())
    IN ('super_admin','logistics_manager','analyst','executive')
  );

CREATE POLICY "Warehouse operator sees own city shipments"
  ON shipments FOR SELECT TO authenticated
  USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'warehouse_operator'
    AND (
      origin_city = (SELECT warehouse_city FROM user_profiles WHERE id = auth.uid())
      OR destination_city = (SELECT warehouse_city FROM user_profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Driver sees only assigned shipment"
  ON shipments FOR SELECT TO authenticated
  USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'driver'
    AND id = (SELECT assigned_shipment_id FROM user_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Warehouse operator updates status"
  ON shipments FOR UPDATE TO authenticated
  USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'warehouse_operator'
  )
  WITH CHECK (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'warehouse_operator'
  );

CREATE POLICY "Manager full CRUD shipments"
  ON shipments FOR ALL TO authenticated
  USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid())
    IN ('super_admin','logistics_manager')
  );

-- RLS for suppliers
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authorized roles see suppliers"
  ON suppliers FOR SELECT TO authenticated
  USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid())
    IN ('super_admin','logistics_manager','analyst','executive')
  );

-- RLS for disruptions
ALTER TABLE disruptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All authenticated read disruptions"
  ON disruptions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manager and admin manage disruptions"
  ON disruptions FOR ALL TO authenticated
  USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid())
    IN ('super_admin','logistics_manager')
  );

-- Demo credentials table
CREATE TABLE IF NOT EXISTS demo_credentials (
  role          TEXT PRIMARY KEY,
  email         TEXT NOT NULL,
  password      TEXT NOT NULL,
  full_name     TEXT NOT NULL,
  description   TEXT
);

INSERT INTO demo_credentials VALUES
  ('super_admin',        'admin@chainguard.demo',     'Demo@123', 'Arjun Kumar',   'Full system access'),
  ('logistics_manager',  'manager@chainguard.demo',   'Demo@123', 'Priya Sharma',  'All operations'),
  ('warehouse_operator', 'warehouse@chainguard.demo', 'Demo@123', 'Rohit Patel',   'Mumbai warehouse'),
  ('driver',             'driver@chainguard.demo',    'Demo@123', 'Suresh Kumar',  'Shipment SH-1001'),
  ('analyst',            'analyst@chainguard.demo',   'Demo@123', 'Meera Iyer',    'Read-only analytics'),
  ('executive',          'ceo@chainguard.demo',       'Demo@123', 'Vivek Mehta',   'Executive summary')
ON CONFLICT (role) DO NOTHING;

-- ============================================================
-- IMPORTANT: After running this SQL, go to:
--   Supabase Dashboard → Database → Replication
-- and enable Realtime for: shipments, disruptions
-- ============================================================

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
-- IMPORTANT: After running this SQL, go to:
--   Supabase Dashboard → Database → Replication
-- and enable Realtime for: shipments, disruptions
-- ============================================================

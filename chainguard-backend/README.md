# ⚡ ChainGuard Backend — Node.js API

Supply chain disruption prediction & dynamic route optimization for India.

## Quick Start

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) → New Project (free tier)
2. Copy your **Project URL** and **anon public key** from Settings → API

### 2. Create Database Tables
1. In Supabase Dashboard → **SQL Editor**
2. Paste the contents of `schema.sql` and run
3. Go to **Database → Replication** and enable Realtime for `shipments` + `disruptions`

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your Supabase URL and anon key
```

### 4. Install & Seed
```bash
npm install
npm run seed
```

### 5. Run
```bash
npm run dev
# API live at http://localhost:3001
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/api/shipments` | All shipments (by risk DESC) |
| GET | `/api/shipments/stats/summary` | Shipment KPIs |
| GET | `/api/shipments/:id` | Single shipment |
| GET | `/api/shipments/code/:code` | By shipment code |
| POST | `/api/shipments` | Create shipment |
| PATCH | `/api/shipments/:id/status` | Update status/risk |
| PATCH | `/api/shipments/:id/location` | Update location |
| DELETE | `/api/shipments/:id` | Delete shipment |
| GET | `/api/suppliers` | All suppliers (by risk DESC) |
| GET | `/api/suppliers/at-risk/list` | High-risk + alternatives |
| GET | `/api/suppliers/:id` | Single supplier |
| POST | `/api/suppliers` | Create supplier |
| PATCH | `/api/suppliers/:id/risk` | Update risk score |
| DELETE | `/api/suppliers/:id` | Delete supplier |
| GET | `/api/disruptions` | Active disruptions |
| GET | `/api/disruptions/all` | All disruptions |
| POST | `/api/disruptions` | Create disruption |
| PATCH | `/api/disruptions/:id/resolve` | Resolve disruption |
| DELETE | `/api/disruptions/:id` | Delete disruption |
| POST | `/api/routes/optimize` | Route optimizer (3 options) |
| GET | `/api/routes/graph` | Full India route graph |
| GET | `/api/dashboard/kpis` | All KPIs in one call |

## Architecture

```
PORT 3001  →  Node.js Express API
                ↕
          Supabase PostgreSQL (cloud)
                ↕
PORT 8000  →  Python FastAPI ML Engine (Part 2)
```

## Tech Stack
- **Runtime:** Node.js 20+ (ES Modules)
- **Framework:** Express 4.x
- **Database:** Supabase (PostgreSQL)
- **Route Algo:** Dijkstra + Yen's K-Shortest Paths

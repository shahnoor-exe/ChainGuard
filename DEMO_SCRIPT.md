# ChainGuard — 5-Minute Judge Demo Script

## Opening (30 seconds)
Open http://localhost:5173 (or live Vercel URL)
Show the animated login screen:
- Point out the India highway network animation in background
- *"This is ChainGuard — India's first AI-native supply chain disruption prediction platform"*

## Demo 1: Manager Role (90 seconds)
1. Click **[Manager]** role pill → auto-fills credentials
2. Login → page transitions with blur effect into dashboard
3. Show judges:
   - KPIs counting up live (81.2% on-time, 7 at-risk, etc.)
   - Live map with pulsing risk markers on dark CartoDB tiles
   - Click a red (critical) shipment → ShipmentDetail panel slides in
     → *"Mumbai → Delhi, Risk Score 85, delayed by 2.4 hours"*
   - Click **"Re-Route"** → Route Optimizer wizard
     → 3 options animate in: *"Route B saves ₹3,400 and 12kg CO₂"*
     → Select Route B → green animated route line draws on map
   - Point at Disruption Feed: typewriter text revealing new alert
   - Point at TopBar: *"This is all LIVE data — weather from OpenWeatherMap API, news analyzed by our NLP engine"*

## Demo 2: Driver Role (45 seconds)
1. Logout → Click **[Driver]** pill → Login
2. Show mobile-optimized full screen:
   - *"This is what Suresh Kumar the truck driver sees on his phone"*
   - His single shipment, large text, weather along route
   - Tap **"Report Delay"** → preset options
   - *"No app download needed — runs in any mobile browser"*

## Demo 3: Executive Role (45 seconds)
1. Logout → Click **[Executive]** pill → Login
2. Show Executive Dashboard:
   - *"This is what the CEO sees — no operational noise"*
   - 6 big numbers, all counting up
   - *"AI Savings This Month: ₹1,80,000"* — highlight this
   - The two comparison charts (with vs without ChainGuard)
   - Read the AI summary paragraph
   - **"Download Weekly Report PDF"** → triggers print dialog

## Demo 4: Analytics Role (45 seconds)
1. Logout → Click **[Analyst]** pill → Login
2. Show Analytics sub-tabs:
   - **Cost Impact**: *"₹4.2L lost this month, ₹1.8L saved by ChainGuard"*
   - **Network Resilience**: animated circular gauge (74/100 — Resilient)
   - **Demand Forecast**: *"Week 3 demand spike predicted — backup suppliers suggested automatically"*
   - **ESG Carbon**: *"We're currently rated B+ — show this to sustainability auditors"*

## Closing (30 seconds)
*"ChainGuard addresses a ₹180 billion annual problem in India's logistics sector. It's the only platform combining real-time disruption prediction, carbon-aware routing, India-specific signals, and role-based intelligence — all built on a free, scalable stack deployable in one click. Thank you."*

---

## Technical Architecture (if asked)

| Layer | Technology | Why |
|---|---|---|
| Database | Supabase (PostgreSQL) | Free, real-time, built-in auth + RLS |
| Backend | Node.js + Express | REST API, lightweight |
| ML Engine | Python FastAPI | scikit-learn, spaCy NLP |
| Frontend | React + Vite + Tailwind | Fast, animations via Framer Motion |
| Maps | Leaflet + CartoDB Dark | Free, no API key |
| Weather | OpenWeatherMap API | Free tier |
| News NLP | NewsAPI | Free developer tier |
| Charts | Chart.js + D3.js | Open source |
| Auth | Supabase Auth | 6-role RBAC, RLS policies |
| Hosting | Vercel + Render | Free tier |

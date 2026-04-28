# ⛓️ ChainGuard

**Built for PromptWar 1.0 & Google Solution Challenge 2026**  
**Team:** Code Wrapers

---

## 🛑 The Problem: Supply Chain Fragility
In today’s hyper-connected world, supply chains are the backbone of the global economy, yet they remain incredibly fragile. **Mass populations face the brunt of supply chain disruptions** in the form of:
*   **Inflation & Price Hikes:** When logistics fail or delays occur, the cost of transportation skyrockets, directly increasing the price of everyday essentials (food, medicine, fuel).
*   **Scarcity of Critical Goods:** Natural disasters, unpredictable weather, or infrastructure failure can cut off entire regions from life-saving medical supplies or basic necessities.
*   **Environmental Degradation:** Inefficient routing and poor logistics planning lead to massive unnecessary carbon emissions.
*   **Lack of Transparency:** Small business owners and consumers are left in the dark when disruptions happen, unable to plan or adapt.

These challenges disproportionately affect vulnerable communities who rely on consistent and affordable access to resources.

## 📚 Literature Review & The Gap in Existing Solutions
**Current Landscape:**
Most traditional logistics software focuses solely on *tracking*—telling you where a truck is. Advanced systems exist (e.g., SAP, Oracle Transport Management), but they are:
1.  **Exclusively Enterprise:** Prohibitively expensive and complex for small-to-medium enterprises (SMEs) or regional distributors.
2.  **Reactive, Not Predictive:** Existing platforms trigger alerts *after* a delay has occurred. They lack the intelligence to predict a disruption before it happens.
3.  **Siloed Data:** Weather, news, carbon footprints, and route planning are handled by 4 or 5 different software tools.
4.  **Poor Accessibility:** Legacy systems require extensive training and lack intuitive, role-based dashboards for drivers, warehouse staff, and executives.

**The Gap:** There is a critical need for an accessible, predictive, all-in-one intelligence platform that democratizes advanced AI supply chain management, allowing smaller players to be just as resilient as global corporations.

## 🌉 Bridging the Gap: The ChainGuard Solution
ChainGuard is an AI-powered, predictive Supply Chain Management platform. Instead of just showing where goods are, ChainGuard **predicts where they will be delayed and automatically suggests optimal alternatives.**

We bridge the gap by:
1.  **Democratizing AI:** Bringing advanced machine learning algorithms to logistics operators via an intuitive, accessible interface.
2.  **Proactive Risk Management:** Integrating live weather APIs, news scraping, and traffic data to predict disruptions *before* they impact a shipment.
3.  **Holistic Optimization:** Balancing delivery speed, fuel costs, and carbon emissions in a single routing engine.
4.  **Role-Based Simplicity:** Providing tailored, noise-free views for every person in the chain (from the truck driver's mobile view to the CEO's executive dashboard).

## ✨ Key Features
*   **🔮 Predictive ETA & Risk Engine:** AI models calculate the risk of delay for any given route based on historical data, weather patterns, and real-time news.
*   **🗺️ Smart Route Optimizer:** Dynamically suggests alternative routes if a disruption is detected, optimizing for Speed, Cost, or Carbon footprint.
*   **📊 Digital Twin Graph:** A live, interactive node-based visualization of your entire supply chain network and supplier health.
*   **🌦️ Live Weather & Disruption Feed:** Automatically correlates weather alerts and news data with active shipment paths.
*   **🔐 6-Tier Role-Based Access (RBAC):** Customized dashboards for Super Admins, Logistics Managers, Warehouse Operators, Drivers, Analysts, and Executives.
*   **🌱 Carbon Footprint Tracking:** Real-time calculation of CO2 emissions for ESG reporting and sustainability goals.

## 🏗️ Architecture Overview
ChainGuard uses a modern, decoupled microservices architecture to ensure high performance and distinct separation of concerns:
1.  **Frontend (Client):** A highly responsive, animated React.js interface managing user state, maps, and RBAC.
2.  **Backend (API/Orchestrator):** An Express.js Node server handling authentication, database interactions, and business logic.
3.  **ML Engine:** A dedicated Python FastAPI service that processes algorithms (Routing, Risk prediction) and external API integrations lazily to optimize memory usage.
4.  **Database:** PostgreSQL (via Supabase) ensuring relational integrity, secure user profiles, and row-level security (RLS).

*(Frontend ↔️ Backend API ↔️ PostgreSQL Database)*  
*(Frontend ↔️ ML Engine FastAPI ↔️ External Weather/News APIs)*

## 💻 Technology Stack

### Current Stack (Demo / MVP)
*   **Frontend:** React (Vite), Framer Motion (Animations), CSS Variables (Theming), React Router, Recharts, React Flow.
*   **Backend:** Node.js, Express.js.
*   **ML Engine:** Python, FastAPI, Scikit-learn, Pandas, Uvicorn (Lazy-loading configuration).
*   **Database & Auth:** Supabase (PostgreSQL + GoTrue Auth).
*   **APIs:** OpenWeatherMap API.
*   **Deployment:** Vercel (Frontend), Render (Backend & ML Engine).

### Future Stack (Production-Ready)
*   **Frontend:** Next.js (App Router) for Server-Side Rendering (SSR) and better SEO/Performance.
*   **Backend:** NestJS or GoLang for highly concurrent shipment telemetry processing.
*   **ML Engine:** Transition to heavy models (XGBoost, deep learning NLP for news sentiment) deployed on AWS SageMaker or Google Cloud AI Platform.
*   **Database:** Distributed PostgreSQL (CockroachDB or AWS Aurora) with Redis for caching real-time GPS pings.
*   **Messaging:** Apache Kafka or RabbitMQ for handling high-throughput IoT tracking data from trucks.

## 🚀 Future Additions & Scalability
1.  **IoT Integration:** Direct integration with GPS trackers and temperature sensors inside trucks for real-time cold-chain monitoring.
2.  **Automated NLP News Scraping:** Deploying LLMs to read global supply chain news and automatically flag affected routes in the dashboard without manual input.
3.  **Blockchain for Provenance:** Utilizing smart contracts to ensure tamper-proof records of custody handoffs for high-value or pharmaceutical goods.
4.  **Mobile App:** A native React Native application specifically for drivers with offline-first capabilities.
5.  **Multi-Tenant SaaS:** Scaling the architecture to allow any business to sign up and instantly digitize their supply chain on a subscription model.

# AQUASENSE AI: Smart Water Intelligence Platform

**AQUASENSE AI** is an intelligent, community-driven water monitoring, conservation, and predictive analytics SaaS ecosystem designed for residential societies, urban campuses, and water governance authorities.

---

## 🌟 Executive Architectural Highlights

- **Full-Stack Next.js 14 App Router**: Complete persistent backend, dynamic API routes, responsive SaaS UI built with TypeScript and Tailwind CSS.
- **Scientifically-Accurate 3D Underground Borewell Simulation**:
  - Vertical cross-section rendered with **Three.js** and **React Three Fiber**.
  - 5 realistic geological layers: Humus Topsoil, Silty Clay, Sand & Gravel, Granite Bedrock, and Confined Aquifer.
  - Submersible pump motor rotation, upward riser water flow particles, animated casing water column.
  - **Scientific Depth Relationship**: As water is extracted, water table falls, which causes **depth-to-water measurement to INCREASE** from ground reference (0.0m).
  - Gradual hydrologic recovery/recharge animation when pump stops (no instantaneous recovery).
  - Pumping rate slider (30-140 L/min), simulation speed multipliers (1x, 2x, 5x, 10x), and live drawdown curve.
- **AQUA MAP – Interactive GIS Geospatial Intelligence**:
  - Leaflet + OpenStreetMap engine with custom SVG markers for Borewells, Tanks, Rainwater Harvesting pits, and Community Leaks.
  - Interactive search by locality, "Use My Location" GPS geolocation.
  - Slide-out intelligence panel with depth metrics, source provenance badges (*Live Sensor*, *Verified Manual*, *AI Estimate*, *Community Unverified*), and local historical trends.
- **AI Water Forecasting Pipeline**:
  - Python Scikit-learn hydrologic model with dynamic Ridge regression.
  - Evaluates drawdown slope, seasonal recharge index, and yields 30-day forecast curves with **95% Confidence Bounds (Upper/Lower bands)**.
  - Honest handling: displays transparent insufficient data warning if fewer than 3 historical readings exist.
- **Overhead & Sump Water Tank Monitoring**:
  - Animated filling & draining vertical tank cylinders with wave ripple effects and ultrasonic IP68 sensor telemetry.
  - Inflow rates, remaining reserve days, and quick supply/consumption simulation triggers.
- **Municipal & Private Tanker Supply Schedule**:
  - Dual Calendar & List view, arrival verification workflow, volume delivery audits, driver contact cards, and missed delivery reporting.
- **Rainwater Harvesting & Recharge Effectiveness**:
  - Hydrological yield calculator: $\text{Harvestable Litres} = \text{Area } (m^2) \times \text{Rainfall } (mm) \times \text{Runoff Coefficient}$.
  - Pre-monsoon 6-step preventive maintenance checklist.
- **Community Water Leakage Reporting & Admin Lifecycle**:
  - Workflow: `Submitted` $\rightarrow$ `Under Review` $\rightarrow$ `Assigned` $\rightarrow$ `In Progress` $\rightarrow$ `Resolved`.
  - Severity classification and water loss quantification.
- **ESP32 IoT Sensor Telemetry & Ingestion Simulator**:
  - Bearer token-authenticated hardware ingestion API (`POST /api/devices`).
  - Interactive hardware simulator to send real-time packets and observe live updates.
- **Reports & Export**:
  - Instant CSV export for groundwater, consumption, tankers, leakage, and rainwater.
  - Printable official PDF compliance layout with regulatory benchmarks.
- **Full Role-Based Access Control (RBAC)**:
  - 4 distinct roles: *Resident*, *Society Administrator*, *Water Authority*, and *Super Administrator*.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | Next.js 14.2 (App Router), React 18, TypeScript |
| **Styling & Design System** | Tailwind CSS (Navy `#102A43`, Blue `#1769AA`, Cyan `#22B8CF`, Status Emerald `#16A36A`) |
| **3D Simulation** | Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`) |
| **GIS & Geospatial Mapping**| Leaflet, React-Leaflet, OpenStreetMap |
| **Analytics & Data Charts** | Recharts (Line, Bar, Area, and Composed charts) |
| **AI / Machine Learning** | Python 3.14, Scikit-learn, NumPy, Pandas |
| **Database & Persistence** | PostgreSQL Schema (`supabase/migrations`), Atomic JSON Engine (`data/aquasense_db.json`) |
| **IoT / Hardware Ingestion** | ESP32 REST HTTP Telemetry, LoRaWAN payload specifications, Bearer Auth Tokens |

---

## 📁 Project Directory Structure

```
c:/FaleVerse/
├── data/
│   └── aquasense_db.json         # Persistent JSON database (auto-created with seed records)
├── python-ai/
│   └── models/
│       └── water_prediction.py   # Python Scikit-learn aquifer forecasting engine
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql # PostgreSQL DDL schema with RLS and indexes
│   └── seed.sql                  # Verified initial seed dataset
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Global HTML layout with Leaflet styles & font
│   │   ├── page.tsx              # Root redirect to /dashboard
│   │   ├── globals.css           # Tailwind custom styling & scrollbars
│   │   ├── dashboard/            # Overview dashboard with 6 metric cards & charts
│   │   ├── borewell-monitoring/  # 3D Subsurface Borewell & Aquifer Simulation
│   │   ├── aqua-map/             # Interactive GIS water intelligence map
│   │   ├── groundwater/          # Dedicated groundwater monitoring & manual logging
│   │   ├── tank-monitoring/      # Animated vertical tank levels & ultrasonic telemetry
│   │   ├── tanker-schedule/      # Tanker delivery schedules & calendar view
│   │   ├── rainwater-harvesting/ # Effectiveness calculator & maintenance checklist
│   │   ├── ai-prediction/        # AI water forecasting with 95% confidence bounds
│   │   ├── alerts/               # Central notification desk & alert filters
│   │   ├── report-leakage/       # Community leak reporting & admin lifecycle
│   │   ├── community-logs/       # Community water logs & verification
│   │   ├── conservation/         # Household water audit calculator & best practices
│   │   ├── devices/              # ESP32 sensor fleet & hardware ingestion simulator
│   │   ├── reports/              # CSV data export & printable compliance statements
│   │   ├── analytics/            # Multi-dimensional supply-demand & rainfall correlation
│   │   ├── settings/             # System settings, thresholds & RBAC role switcher
│   │   └── api/                  # 13 Complete REST API Endpoints
│   │       ├── ai-prediction/
│   │       ├── alerts/
│   │       ├── auth/me/
│   │       ├── borewells/
│   │       │   └── [id]/readings/
│   │       ├── community-logs/
│   │       ├── dashboard/stats/
│   │       ├── devices/
│   │       ├── leakage/
│   │       ├── rainwater/
│   │       ├── reports/export/
│   │       ├── tankers/
│   │       └── tanks/
│   ├── components/
│   │   ├── layout/               # Sidebar, Header, AppLayout
│   │   ├── borewell-3d/          # Three.js 3D Geological Scene & Pump Assembly
│   │   └── maps/                 # Dynamic Leaflet GIS Viewer
│   ├── lib/
│   │   ├── database/db.ts        # Persistent database CRUD layer
│   │   └── utils.ts              # Formatting & CSS utility helpers
│   └── types/
│       └── index.ts              # TypeScript domain interfaces
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.mjs
```

---

## 🚀 Running the Application

### 1. Start the Production Server
The application is pre-built and optimized:
```bash
npm run start
```
Or to run in development mode:
```bash
npm run dev
```

### 2. Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

---

## 🧪 Verified API Endpoints

All endpoints have been tested and verified:

- `GET /api/dashboard/stats`: Returns live telemetry metrics, trend indicators, tank availability, and recent activities.
- `GET /api/borewells`: Lists registered borewells with current depth, casing depth, and pump ratings.
- `POST /api/borewells/[id]/readings`: Persists verified manual or sensor depth measurements.
- `GET /api/ai-prediction?borewellId=bw-001`: Executes the hydrologic regression engine, generating 30-day forecast curves with 95% confidence intervals.
- `GET /api/tanks` & `PATCH /api/tanks`: Queries and updates reservoir levels.
- `GET /api/tankers` & `PATCH /api/tankers`: Queries and transitions delivery statuses (`scheduled`, `arrived`, `delayed`, `completed`).
- `POST /api/rainwater`: Evaluates harvestable yield formula based on catchment area and rainfall.
- `GET /api/devices` & `POST /api/devices`: Hardware token-authenticated telemetry ingestion endpoint.
- `GET /api/reports/export?type=groundwater&format=csv`: Generates instant downloadable CSV files.


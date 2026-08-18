# 🏬 Smart Warehouse Operations & Order Fulfillment Intelligence Platform

An end-to-end intelligent warehouse decision engine and operational dashboard. Features dynamic stock allocation, route-optimized picking, packing quality control (QC), exception auto-resolution, and real-time fulfillment tracking.

---

## ✨ Features

- **📊 Operational Dashboard**: Real-time KPI tracking for pending orders, pick rates, pack efficiency, active exceptions, and dispatch queues.
- **⚡ Priority & Allocation Engine**: Dynamic inventory allocation based on order SLA, customer tier, and item availability.
- **🗺️ Picking Optimizer**: Pathfinding algorithm (A* & TSP matrix) generating shortest picking routes across warehouse zones and bins.
- **📦 Packing QC**: Automated package dimension and weight verification before dispatch approval.
- **🚨 Exception Resolution Engine**: Auto-resolves missing items, damaged goods, or damaged packaging with smart fallback recommendations and escalation workflows.
- **🚚 Dispatch Manager**: Multi-carrier tracking, manifest generation, and shipment dispatch logging.
- **📈 Analytics & Audit Logs**: Detailed metrics on picking throughput, order fulfillment velocity, bottleneck detection, and complete system audit history.

---

## 🛠️ Tech Stack

- **Backend**: Python 3.10+, FastAPI, SQLite / SQLAlchemy, Uvicorn
- **Frontend**: HTML5, Vanilla JavaScript (ES6+), Custom CSS with modern UI & dark aesthetics
- **Deployment**: Configured for Vercel, Render, Railway, Docker, or standalone Uvicorn execution

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/mounikarajanala9/ai-warehouse.git
cd ai-warehouse
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run the Application
```bash
python run.py
```
Or run directly with Uvicorn:
```bash
uvicorn backend.main:app --reload --port 8000
```

### 4. Access the Application
- **Web App**: Open [http://localhost:8000](http://localhost:8000) in your browser.
- **Interactive API Documentation (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📁 Project Structure

```text
├── backend/
│   ├── main.py              # FastAPI application initialization & routes
│   ├── db/                  # Database models, connection & seed data generator
│   ├── engine/              # Decision engines (Picking, Allocation, Exceptions, Bottlenecks)
│   └── routers/             # API endpoints (Orders, Inventory, Picking, Packing, etc.)
├── frontend/
│   ├── index.html           # Main Single Page Application shell
│   ├── css/                 # Custom UI styles & layout systems
│   └── js/                  # App views, API layer, navigation, & modal components
├── run.py                   # Local application entrypoint runner
├── pyproject.toml           # Vercel & build configuration
└── requirements.txt         # Python package dependencies
```

---

## ☁️ Deployment

### Deploy to Vercel
This repository is configured for one-click deployment on Vercel:
1. Import your GitHub repository `mounikarajanala9/ai-warehouse` in Vercel.
2. Deploy! The [`pyproject.toml`](./pyproject.toml) automatically sets `backend.main:app` as the serverless entrypoint.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.

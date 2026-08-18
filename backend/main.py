from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from .db.database import init_db, get_db
from .db.seed_data import seed_database
from .routers import dashboard, inventory, orders, picking, packing, exceptions, dispatches, analytics, demo, audit

app = FastAPI(
    title="Smart Warehouse Operations & Order Fulfillment Intelligence Platform",
    description="Intelligent warehouse decision engine, dynamic stock allocation, route-optimized picking, packing QC, exception auto-resolution, and fulfillment tracking.",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(dashboard.router)
app.include_router(inventory.router)
app.include_router(orders.router)
app.include_router(picking.router)
app.include_router(packing.router)
app.include_router(exceptions.router)
app.include_router(dispatches.router)
app.include_router(analytics.router)
app.include_router(demo.router)
app.include_router(audit.router)

# Root directory paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

@app.on_event("startup")
def startup_event():
    init_db()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM products")
        count = cursor.fetchone()[0]
        if count == 0:
            print("Seeding database with initial realistic warehouse data...")
            seed_database(conn)

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "system": "Smart Warehouse Intelligence Platform", "version": "1.0.0"}

# Serve frontend static files if directory exists
if os.path.exists(FRONTEND_DIR):
    app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

    @app.get("/")
    def serve_index():
        return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))

    # Catch-all for SPA client-side routes
    @app.get("/{full_path:path}")
    def catch_all(full_path: str):
        file_path = os.path.join(FRONTEND_DIR, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))

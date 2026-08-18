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
    try:
        init_db()
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM products")
            count = cursor.fetchone()[0]
            if count == 0:
                print("Seeding database with initial realistic warehouse data...")
                seed_database(conn)
    except Exception as e:
        print(f"Warning: Database startup initialization: {e}")


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "system": "Smart Warehouse Intelligence Platform", "version": "1.0.0"}

from fastapi.responses import FileResponse, Response

# Explicit Favicon Handler to prevent 500 status on missing favicon.ico
@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    favicon_path = os.path.join(FRONTEND_DIR, "favicon.ico")
    if os.path.exists(favicon_path):
        return FileResponse(favicon_path)
    return Response(status_code=204)

# Serve frontend static files if directory exists
if os.path.exists(FRONTEND_DIR):
    app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

    @app.get("/")
    def serve_index():
        index_path = os.path.join(FRONTEND_DIR, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return Response(content="<h1>Smart Warehouse Platform API Active</h1>", media_type="text/html")

    # Catch-all for SPA client-side routes
    @app.get("/{full_path:path}")
    def catch_all(full_path: str):
        if full_path.startswith("api/"):
            return Response(status_code=404, content='{"detail": "Not Found"}', media_type="application/json")
        file_path = os.path.join(FRONTEND_DIR, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        index_path = os.path.join(FRONTEND_DIR, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return Response(content="<h1>Smart Warehouse Platform API Active</h1>", media_type="text/html")


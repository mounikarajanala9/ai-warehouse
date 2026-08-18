from fastapi import APIRouter
from ..db.database import get_db
from ..engine.bottleneck_detector import analyze_warehouse_bottlenecks

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("")
def get_warehouse_analytics():
    with get_db() as conn:
        cursor = conn.cursor()

        # Bottleneck detection
        bottleneck = analyze_warehouse_bottlenecks(conn)

        # Order KPIs
        cursor.execute("SELECT COUNT(*) FROM orders")
        total_orders = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM orders WHERE status IN ('Dispatched', 'Delivered')")
        completed_orders = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM orders WHERE priority IN ('Critical', 'High') AND status NOT IN ('Dispatched', 'Delivered')")
        delayed_or_urgent = cursor.fetchone()[0]

        # Inventory KPIs
        cursor.execute("SELECT SUM(current_stock), SUM(reserved_stock), SUM(damaged_stock), SUM(missing_stock) FROM inventory")
        inv_sums = cursor.fetchone()
        tot_stock = inv_sums[0] or 0
        tot_reserved = inv_sums[1] or 0
        tot_damaged = inv_sums[2] or 0
        tot_missing = inv_sums[3] or 0

        # Worker Productivity Rankings
        workers = [
            {"id": "P-101", "name": "Alex Chen", "role": "Picker (Zone A/B)", "tasks_completed": 38, "avg_speed_mins": 4.2, "accuracy_pct": 99.4, "status": "Active"},
            {"id": "P-102", "name": "Maria Rodriguez", "role": "Picker (Zone C)", "tasks_completed": 31, "avg_speed_mins": 5.1, "accuracy_pct": 98.8, "status": "Active"},
            {"id": "P-103", "name": "David Kim", "role": "Picker (Zone D)", "tasks_completed": 24, "avg_speed_mins": 7.8, "accuracy_pct": 97.9, "status": "Active"},
            {"id": "W-101", "name": "Sam Rivera", "role": "Packing Staff (STN-1)", "tasks_completed": 45, "avg_speed_mins": 3.4, "accuracy_pct": 99.1, "status": "Active"},
            {"id": "W-102", "name": "Jessica Taylor", "role": "Packing Staff (STN-2)", "tasks_completed": 39, "avg_speed_mins": 3.8, "accuracy_pct": 98.5, "status": "Active"}
        ]

        # Fulfillment Stage Waterfall Data
        waterfall = [
            {"stage": "Order Ingestion & Priority", "avg_duration_mins": 1.2, "benchmark_mins": 1.5, "status": "Optimal"},
            {"stage": "Smart Stock Allocation", "avg_duration_mins": bottleneck["stages"]["allocation"]["latency_mins"], "benchmark_mins": bottleneck["stages"]["allocation"]["benchmark_mins"], "status": "Warning" if bottleneck["stages"]["allocation"]["delay_pct"] > 30 else "Optimal"},
            {"stage": "Picking & Route Execution", "avg_duration_mins": bottleneck["stages"]["picking"]["latency_mins"], "benchmark_mins": bottleneck["stages"]["picking"]["benchmark_mins"], "status": "Critical" if bottleneck["stages"]["picking"]["delay_pct"] > 40 else "Optimal"},
            {"stage": "Packing & Quality Verification", "avg_duration_mins": bottleneck["stages"]["packing"]["latency_mins"], "benchmark_mins": bottleneck["stages"]["packing"]["benchmark_mins"], "status": "Warning" if bottleneck["stages"]["packing"]["delay_pct"] > 30 else "Optimal"},
            {"stage": "Outbound Staging & Dispatch", "avg_duration_mins": bottleneck["stages"]["dispatch"]["latency_mins"], "benchmark_mins": bottleneck["stages"]["dispatch"]["benchmark_mins"], "status": "Optimal"}
        ]

        # Category Breakdown
        cursor.execute("""
        SELECT p.category, COUNT(p.id) as product_count, SUM(i.current_stock) as total_stock, SUM(i.reserved_stock) as reserved_stock
        FROM products p
        JOIN inventory i ON p.id = i.product_id
        GROUP BY p.category
        """)
        category_breakdown = [dict(r) for r in cursor.fetchall()]

        return {
            "order_analytics": {
                "total_orders": total_orders,
                "completed_orders": completed_orders,
                "delayed_orders": delayed_or_urgent,
                "cancellation_rate_pct": 0.8,
                "on_time_fulfillment_rate_pct": 96.4
            },
            "inventory_analytics": {
                "total_stock_units": tot_stock,
                "reserved_stock_units": tot_reserved,
                "damaged_stock_units": tot_damaged,
                "missing_stock_units": tot_missing,
                "inventory_turnover_ratio": 6.8,
                "stockout_frequency_pct": 2.1
            },
            "fulfillment_analytics": {
                "avg_fulfillment_time_mins": bottleneck["total_avg_fulfillment_time_mins"],
                "avg_picking_time_mins": bottleneck["stages"]["picking"]["latency_mins"],
                "avg_packing_time_mins": bottleneck["stages"]["packing"]["latency_mins"],
                "avg_dispatch_lag_mins": bottleneck["stages"]["dispatch"]["latency_mins"]
            },
            "bottleneck": bottleneck,
            "stage_waterfall": waterfall,
            "workers": workers,
            "category_breakdown": category_breakdown
        }

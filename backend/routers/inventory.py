from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from ..db.database import get_db
from ..db.models import InventoryAdjustRequest, ProductCreate
from ..engine.forecasting_engine import calculate_inventory_health
from ..engine.exception_engine import handle_damaged_item, handle_missing_item

router = APIRouter(prefix="/api/inventory", tags=["Inventory"])

@router.get("")
def get_inventory_items(
    category: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = "stock_asc"
):
    with get_db() as conn:
        cursor = conn.cursor()
        
        query = """
        SELECT p.*, i.current_stock, i.reserved_stock, i.damaged_stock, i.missing_stock, i.last_counted_at, i.updated_at as inv_updated_at,
               wl.location_code
        FROM products p
        JOIN inventory i ON p.id = i.product_id
        LEFT JOIN warehouse_locations wl ON p.id = wl.product_id
        WHERE 1=1
        """
        params = []

        if category and category != "All":
            query += " AND p.category = ?"
            params.append(category)

        if search:
            query += " AND (p.sku LIKE ? OR p.name LIKE ? OR p.supplier LIKE ? OR wl.location_code LIKE ?)"
            s_param = f"%{search}%"
            params.extend([s_param, s_param, s_param, s_param])

        cursor.execute(query, params)
        rows = [dict(r) for r in cursor.fetchall()]

        # Process health & forecasting
        processed = []
        for r in rows:
            health = calculate_inventory_health(r, r)
            r["available_stock"] = health["available_stock"]
            r["days_until_stockout"] = health["days_until_stockout"]
            r["status"] = health["status"]
            r["urgency"] = health["urgency"]
            r["recommended_reorder_qty"] = health["recommended_reorder_qty"]
            r["prediction_message"] = health["prediction_message"]
            r["location_code"] = r.get("location_code") or f"{r['zone_code']}-{r['aisle']}-{r['bay']}-{r['shelf']}"

            if not status or status == "All" or r["status"].lower() == status.lower():
                processed.append(r)

        # Sorting
        if sort_by == "stock_asc":
            processed.sort(key=lambda x: x["available_stock"])
        elif sort_by == "stock_desc":
            processed.sort(key=lambda x: x["available_stock"], reverse=True)
        elif sort_by == "days_asc":
            processed.sort(key=lambda x: x["days_until_stockout"])
        elif sort_by == "name_asc":
            processed.sort(key=lambda x: x["name"])

        # Fetch categories list for filters
        cursor.execute("SELECT DISTINCT category FROM products ORDER BY category")
        categories = [r[0] for r in cursor.fetchall()]

        return {
            "total": len(processed),
            "categories": categories,
            "items": processed
        }

@router.get("/{product_id}")
def get_product_details(product_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT p.*, i.current_stock, i.reserved_stock, i.damaged_stock, i.missing_stock, i.last_counted_at, i.updated_at as inv_updated_at,
               wl.location_code, wl.x_coord, wl.y_coord
        FROM products p
        JOIN inventory i ON p.id = i.product_id
        LEFT JOIN warehouse_locations wl ON p.id = wl.product_id
        WHERE p.id = ?
        """, (product_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Product not found")

        p = dict(row)
        health = calculate_inventory_health(p, p)
        p["available_stock"] = health["available_stock"]
        p["days_until_stockout"] = health["days_until_stockout"]
        p["status"] = health["status"]
        p["recommended_reorder_qty"] = health["recommended_reorder_qty"]
        p["prediction_message"] = health["prediction_message"]

        # Associated orders
        cursor.execute("""
        SELECT o.id, o.order_number, o.customer_name, o.priority, o.status, oi.requested_qty, oi.allocated_qty
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        WHERE oi.product_id = ?
        ORDER BY o.id DESC LIMIT 5
        """, (product_id,))
        p["recent_orders"] = [dict(r) for r in cursor.fetchall()]

        return p

@router.post("/adjust")
def adjust_inventory(req: InventoryAdjustRequest):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT p.sku, p.name FROM products p WHERE p.id = ?", (req.product_id,))
        p_row = cursor.fetchone()
        if not p_row:
            raise HTTPException(status_code=404, detail="Product not found")
        
        sku = p_row["sku"]
        name = p_row["name"]

        if req.adjustment_type == "damage":
            result = handle_damaged_item(conn, req.product_id, req.quantity, req.reason, req.reported_by)
            return {
                "message": f"Recorded {req.quantity} damaged unit(s) for {sku}. Exception auto-created.",
                "details": result
            }
        elif req.adjustment_type == "missing":
            result = handle_missing_item(conn, req.product_id, req.quantity, req.reason, req.reported_by)
            return {
                "message": f"Recorded {req.quantity} missing unit(s) for {sku}. Investigation initiated.",
                "details": result
            }
        elif req.adjustment_type == "restock":
            cursor.execute("""
            UPDATE inventory 
            SET current_stock = current_stock + ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE product_id = ?
            """, (req.quantity, req.product_id))

            cursor.execute("""
            INSERT INTO audit_logs (entity_type, entity_id, action, description, performed_by)
            VALUES (?, ?, ?, ?, ?)
            """, ("Inventory", sku, "Inbound Restock", f"Restocked +{req.quantity} units of {sku} ({name}). Reason: {req.reason}", req.reported_by))

            cursor.execute("""
            INSERT INTO notifications (title, message, type, severity, related_entity_type, related_entity_id)
            VALUES (?, ?, ?, ?, ?, ?)
            """, (f"Inbound Restock Completed: {sku}", f"+{req.quantity} units received and slotted into bin.", "success", "low", "Product", req.product_id))

            return {"message": f"Successfully added {req.quantity} units to {sku} stock.", "product_id": req.product_id}
        else:
            # Count correction
            cursor.execute("""
            UPDATE inventory 
            SET current_stock = ?,
                last_counted_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE product_id = ?
            """, (req.quantity, req.product_id))

            cursor.execute("""
            INSERT INTO audit_logs (entity_type, entity_id, action, description, performed_by)
            VALUES (?, ?, ?, ?, ?)
            """, ("Inventory", sku, "Cycle Count Adjustment", f"Adjusted current stock to {req.quantity} for {sku}. Reason: {req.reason}", req.reported_by))

            return {"message": f"Cycle count updated stock to {req.quantity} for {sku}.", "product_id": req.product_id}

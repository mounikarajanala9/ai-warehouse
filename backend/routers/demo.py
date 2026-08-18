from fastapi import APIRouter
from datetime import datetime, timedelta
from ..db.database import get_db
from ..db.seed_data import seed_database
from ..engine.allocation_engine import allocate_order_inventory

router = APIRouter(prefix="/api/demo", tags=["Demo"])

@router.get("/scenario-state")
def get_demo_scenario_state():
    """
    Returns the live state of the hackathon demonstration scenario:
    - SKU-104 inventory (Current, Reserved, Damaged, Available)
    - ORD-1024 status & item allocation
    - ORD-1027 status & item allocation
    - Decision explanation & recommendation
    """
    with get_db() as conn:
        cursor = conn.cursor()

        # SKU-104
        cursor.execute("""
        SELECT p.*, i.current_stock, i.reserved_stock, i.damaged_stock, i.missing_stock
        FROM products p
        JOIN inventory i ON p.id = i.product_id
        WHERE p.sku = 'SKU-104'
        """)
        sku_row = cursor.fetchone()
        sku_data = dict(sku_row) if sku_row else None
        if sku_data:
            sku_data["available_stock"] = max(0, sku_data["current_stock"] - sku_data["reserved_stock"] - sku_data["damaged_stock"] - sku_data["missing_stock"])

        # ORD-1024
        cursor.execute("SELECT * FROM orders WHERE order_number = 'ORD-1024'")
        ord_1024 = cursor.fetchone()
        ord_1024_data = dict(ord_1024) if ord_1024 else None

        if ord_1024_data:
            cursor.execute("""
            SELECT oi.*, a.decision_reason, a.decision_log, a.backordered_qty
            FROM order_items oi
            LEFT JOIN allocations a ON oi.id = a.order_item_id
            WHERE oi.order_id = ?
            """, (ord_1024_data["id"],))
            ord_1024_data["items"] = [dict(r) for r in cursor.fetchall()]

        # ORD-1027
        cursor.execute("SELECT * FROM orders WHERE order_number = 'ORD-1027'")
        ord_1027 = cursor.fetchone()
        ord_1027_data = dict(ord_1027) if ord_1027 else None

        if ord_1027_data:
            cursor.execute("""
            SELECT oi.*, a.decision_reason, a.decision_log, a.backordered_qty
            FROM order_items oi
            LEFT JOIN allocations a ON oi.id = a.order_item_id
            WHERE oi.order_id = ?
            """, (ord_1027_data["id"],))
            ord_1027_data["items"] = [dict(r) for r in cursor.fetchall()]

        # Exceptions related to demo
        cursor.execute("SELECT * FROM exceptions WHERE description LIKE '%SKU-104%' OR description LIKE '%ORD-1024%'")
        exceptions = [dict(r) for r in cursor.fetchall()]

        return {
            "sku_104": sku_data,
            "order_urgent_1024": ord_1024_data,
            "order_low_1027": ord_1027_data,
            "exceptions": exceptions,
            "decision_rule": "Urgent Priority Order Reservation with Backorder Split and Low-Priority Lockout."
        }

@router.post("/reset-scenario")
def reset_demo_scenario():
    """
    Resets the database and sets up the clean demo scenario:
    - SKU-104 has 10 physical stock, 3 damaged, 0 reserved -> 7 available.
    - ORD-1024 (Critical, VIP, needs 10x SKU-104) is in 'Created' state.
    - ORD-1027 (Low, Standard, needs 5x SKU-104) is in 'Created' state.
    """
    with get_db() as conn:
        cursor = conn.cursor()

        # Find SKU-104
        cursor.execute("SELECT id FROM products WHERE sku = 'SKU-104'")
        p_row = cursor.fetchone()
        if not p_row:
            seed_database(conn)
            cursor.execute("SELECT id FROM products WHERE sku = 'SKU-104'")
            p_row = cursor.fetchone()

        p_id = p_row[0]

        # Reset inventory for SKU-104: 10 current, 0 reserved, 3 damaged -> 7 available
        cursor.execute("""
        UPDATE inventory 
        SET current_stock = 10,
            reserved_stock = 0,
            damaged_stock = 3,
            missing_stock = 0,
            updated_at = CURRENT_TIMESTAMP
        WHERE product_id = ?
        """, (p_id,))

        # Reset ORD-1024 to Created, 0 allocated
        cursor.execute("""
        UPDATE orders 
        SET status = 'Created',
            priority = 'Critical',
            calculated_priority = 'Critical',
            priority_score = 95.0,
            priority_reason = 'CRITICAL — Delivery deadline is within 2.5 hours (VIP Platinum Customer + Express Air)'
        WHERE order_number = 'ORD-1024'
        """)
        cursor.execute("SELECT id FROM orders WHERE order_number = 'ORD-1024'")
        o1_id = cursor.fetchone()[0]

        cursor.execute("UPDATE order_items SET requested_qty = 10, allocated_qty = 0, picked_qty = 0, packed_qty = 0, status = 'Pending' WHERE order_id = ?", (o1_id,))
        cursor.execute("DELETE FROM allocations WHERE order_id = ?", (o1_id,))
        cursor.execute("DELETE FROM exceptions WHERE order_id = ?", (o1_id,))

        # Reset ORD-1027 to Created, 0 allocated
        cursor.execute("""
        UPDATE orders 
        SET status = 'Created',
            priority = 'Low',
            calculated_priority = 'Low',
            priority_score = 20.0,
            priority_reason = 'LOW — Delivery deadline is in 48.0 hours. Standard ground fulfillment.'
        WHERE order_number = 'ORD-1027'
        """)
        cursor.execute("SELECT id FROM orders WHERE order_number = 'ORD-1027'")
        o2_id = cursor.fetchone()[0]

        cursor.execute("UPDATE order_items SET requested_qty = 5, allocated_qty = 0, picked_qty = 0, packed_qty = 0, status = 'Pending' WHERE order_id = ?", (o2_id,))
        cursor.execute("DELETE FROM allocations WHERE order_id = ?", (o2_id,))

        cursor.execute("""
        INSERT INTO audit_logs (entity_type, entity_id, action, description, performed_by)
        VALUES ('Demo', 'SCENARIO-RESET', 'Reset Demo State', 'Shortage demonstration scenario reset to initial clean state (7 available SKU-104).', 'Demo Controller')
        """)

        return {"success": True, "message": "Demo scenario reset successfully. Ready for live demonstration."}

@router.post("/execute-smart-allocation-step")
def execute_smart_allocation_step():
    """
    Executes the intelligent allocation sequence for the demo:
    1. Allocates ORD-1024 first (Critical) -> reserves all 7 available units, creates 3 unit backorder.
    2. Then attempts to allocate ORD-1027 (Low) -> sees 0 units left, locks it out, places 5 units on backorder.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM orders WHERE order_number = 'ORD-1024'")
        o1_id = cursor.fetchone()[0]

        cursor.execute("SELECT id FROM orders WHERE order_number = 'ORD-1027'")
        o2_id = cursor.fetchone()[0]

        # Allocate ORD-1024
        res1 = allocate_order_inventory(conn, o1_id)
        # Allocate ORD-1027
        res2 = allocate_order_inventory(conn, o2_id)

        return {
            "success": True,
            "order_1024_result": res1,
            "order_1027_result": res2,
            "explanation": (
                "DEMO DECISION EXPLANATION:\n"
                "1. Total Physical Stock = 10 units. Damaged = 3 units. Net Available = 7 units.\n"
                "2. ORD-1024 (VIP, Critical, Deadline in 2.5h) requested 10 units.\n"
                "3. System prioritized ORD-1024 and reserved all 7 available units.\n"
                "4. Remaining 3 units of ORD-1024 automatically placed on Urgent Backorder & Exception created.\n"
                "5. ORD-1027 (Standard, Low, Deadline in 48h) requested 5 units. System prevented it from taking the 7 reserved units.\n"
                "6. ORD-1027 placed on 'Waiting for Stock' / Backorder."
            )
        }

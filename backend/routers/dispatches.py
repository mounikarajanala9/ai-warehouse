from fastapi import APIRouter, HTTPException
from typing import Optional, List
from datetime import datetime
from ..db.database import get_db
from ..db.models import DispatchAction

router = APIRouter(prefix="/api/dispatches", tags=["Dispatches"])

@router.get("")
def get_dispatches(status: Optional[str] = None, carrier: Optional[str] = None):
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
        SELECT d.*, o.order_number, o.customer_name, o.customer_type, o.priority, o.total_items, o.delivery_deadline
        FROM dispatches d
        JOIN orders o ON d.order_id = o.id
        WHERE 1=1
        """
        params = []
        if status and status != "All":
            query += " AND d.dispatch_status = ?"
            params.append(status)

        if carrier and carrier != "All":
            query += " AND d.carrier = ?"
            params.append(carrier)

        query += " ORDER BY d.id DESC"
        cursor.execute(query, params)
        return [dict(r) for r in cursor.fetchall()]

@router.post("/confirm")
def confirm_dispatch(action: DispatchAction):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT d.*, o.order_number FROM dispatches d JOIN orders o ON d.order_id = o.id WHERE d.order_id = ?", (action.order_id,))
        disp_row = cursor.fetchone()
        
        trk = action.tracking_number or (disp_row["tracking_number"] if disp_row else f"TRK-{100000 + action.order_id}-EXP")
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # 1. Update Dispatches table
        if disp_row:
            cursor.execute("""
            UPDATE dispatches 
            SET carrier = ?,
                tracking_number = ?,
                dispatch_status = 'In Transit',
                dispatch_time = ?,
                notes = ?
            WHERE order_id = ?
            """, (action.carrier, trk, now_str, action.notes or "Handed to carrier logistics driver.", action.order_id))
        else:
            cursor.execute("""
            INSERT INTO dispatches (order_id, carrier, tracking_number, dispatch_status, dispatch_time, notes)
            VALUES (?, ?, ?, 'In Transit', ?, ?)
            """, (action.order_id, action.carrier, trk, now_str, action.notes or "Handed to carrier driver."))

        # 2. Update Order status to 'Dispatched'
        cursor.execute("UPDATE orders SET status = 'Dispatched', carrier = ?, updated_at = ? WHERE id = ?", (action.carrier, now_str, action.order_id))

        # 3. Deduct reserved stock and current stock from Inventory
        cursor.execute("""
        SELECT product_id, allocated_qty 
        FROM order_items 
        WHERE order_id = ? AND allocated_qty > 0
        """, (action.order_id,))
        items = cursor.fetchall()

        for itm in items:
            p_id = itm["product_id"]
            qty = itm["allocated_qty"]
            cursor.execute("""
            UPDATE inventory
            SET current_stock = max(0, current_stock - ?),
                reserved_stock = max(0, reserved_stock - ?),
                updated_at = CURRENT_TIMESTAMP
            WHERE product_id = ?
            """, (qty, qty, p_id))

        # 4. Log Audit Trail
        order_num = disp_row["order_number"] if disp_row else f"ORD-{action.order_id}"
        cursor.execute("""
        INSERT INTO audit_logs (entity_type, entity_id, action, description, performed_by)
        VALUES (?, ?, ?, ?, ?)
        """, ("Dispatch", str(action.order_id), "Order Dispatched", f"{order_num} successfully dispatched via {action.carrier} (Tracking: {trk}). Inventory deducted.", action.dispatched_by or "Logistics Lead"))

        # 5. Notification
        cursor.execute("""
        INSERT INTO notifications (title, message, type, severity, related_entity_type, related_entity_id)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (f"🚚 Order Dispatched: {order_num}", f"Package shipped via {action.carrier}. Tracking: {trk}", "info", "low", "Dispatch", action.order_id))

        return {
            "success": True,
            "message": f"Order {order_num} dispatched successfully via {action.carrier}.",
            "tracking_number": trk,
            "dispatch_time": now_str
        }

@router.post("/deliver/{order_id}")
def mark_delivered(order_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute("UPDATE dispatches SET dispatch_status = 'Delivered', actual_delivery = ? WHERE order_id = ?", (now_str, order_id))
        cursor.execute("UPDATE orders SET status = 'Delivered', completed_at = ?, updated_at = ? WHERE id = ?", (now_str, now_str, order_id))
        return {"success": True, "message": f"Order ORD-{order_id} confirmed delivered to customer."}

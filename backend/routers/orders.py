from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from datetime import datetime
from ..db.database import get_db
from ..db.models import OrderCreate, OrderItemCreate
from ..engine.priority_engine import calculate_order_priority
from ..engine.allocation_engine import allocate_order_inventory
from ..engine.picking_optimizer import optimize_picking_route

router = APIRouter(prefix="/api/orders", tags=["Orders"])

@router.get("")
def get_orders(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = "priority_desc"
):
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
        SELECT o.*, 
               (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count,
               (SELECT SUM(requested_qty) FROM order_items WHERE order_id = o.id) as sum_qty
        FROM orders o
        WHERE 1=1
        """
        params = []

        if status and status != "All":
            query += " AND o.status = ?"
            params.append(status)

        if priority and priority != "All":
            query += " AND o.priority = ?"
            params.append(priority)

        if search:
            query += " AND (o.order_number LIKE ? OR o.customer_name LIKE ? OR o.assigned_picker LIKE ?)"
            s_param = f"%{search}%"
            params.extend([s_param, s_param, s_param])

        cursor.execute(query, params)
        orders = [dict(r) for r in cursor.fetchall()]

        # Load items brief for each order
        for o in orders:
            cursor.execute("""
            SELECT oi.*, p.sku, p.name as product_name
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
            """, (o["id"],))
            o["items"] = [dict(r) for r in cursor.fetchall()]

        # Sort
        priority_weights = {"Critical": 4, "High": 3, "Medium": 2, "Low": 1}
        if sort_by == "priority_desc":
            orders.sort(key=lambda x: (priority_weights.get(x["priority"], 0), x["priority_score"]), reverse=True)
        elif sort_by == "id_desc":
            orders.sort(key=lambda x: x["id"], reverse=True)
        elif sort_by == "deadline_asc":
            orders.sort(key=lambda x: x["delivery_deadline"])

        return {
            "total": len(orders),
            "orders": orders
        }

@router.post("")
def create_order(order_req: OrderCreate):
    with get_db() as conn:
        cursor = conn.cursor()

        if not order_req.items:
            raise HTTPException(status_code=400, detail="Order must contain at least 1 item.")

        # Compute total value & item count
        total_items = sum(itm.requested_qty for itm in order_req.items)
        total_value = 0.0

        for itm in order_req.items:
            cursor.execute("SELECT unit_price FROM products WHERE id = ?", (itm.product_id,))
            p_row = cursor.fetchone()
            if not p_row:
                raise HTTPException(status_code=404, detail=f"Product ID {itm.product_id} not found.")
            total_value += (p_row[0] * itm.requested_qty)

        # Generate unique order number
        cursor.execute("SELECT MAX(id) FROM orders")
        max_id = cursor.fetchone()[0] or 1000
        order_num = f"ORD-{max_id + 1}"

        # Automatic Priority Calculation
        pri_calc = calculate_order_priority({
            "delivery_deadline": order_req.delivery_deadline,
            "customer_type": order_req.customer_type,
            "is_express": 1 if order_req.is_express else 0,
            "total_items": total_items,
            "total_value": total_value
        })

        cursor.execute("""
        INSERT INTO orders (order_number, customer_name, customer_type, is_express, priority, calculated_priority, priority_score, priority_reason, status, delivery_deadline, total_items, total_value, carrier)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Created', ?, ?, ?, ?)
        """, (
            order_num, order_req.customer_name, order_req.customer_type, 
            1 if order_req.is_express else 0, pri_calc["calculated_priority"], 
            pri_calc["calculated_priority"], pri_calc["score"], pri_calc["priority_reason"],
            order_req.delivery_deadline, total_items, total_value, order_req.carrier or "FedEx Express"
        ))
        new_order_id = cursor.lastrowid

        # Insert Items
        for itm in order_req.items:
            cursor.execute("""
            INSERT INTO order_items (order_id, product_id, requested_qty, allocated_qty, status)
            VALUES (?, ?, ?, 0, 'Pending')
            """, (new_order_id, itm.product_id, itm.requested_qty))

        # Log to Audit Log
        cursor.execute("""
        INSERT INTO audit_logs (entity_type, entity_id, action, description, performed_by)
        VALUES (?, ?, ?, ?, ?)
        """, ("Order", order_num, "Order Created", f"Created order {order_num} for {order_req.customer_name}. Auto-Priority: {pri_calc['calculated_priority']} ({pri_calc['priority_reason']})", "Order Management System"))

        # Notification if Critical
        if pri_calc["calculated_priority"] == "Critical":
            cursor.execute("""
            INSERT INTO notifications (title, message, type, severity, related_entity_type, related_entity_id)
            VALUES (?, ?, ?, ?, ?, ?)
            """, (f"🔥 Critical Order Created: {order_num}", f"VIP/Express order with deadline in {pri_calc['hours_to_deadline']}h requires immediate stock allocation.", "critical", "critical", "Order", new_order_id))

        return {
            "success": True,
            "order_id": new_order_id,
            "order_number": order_num,
            "priority": pri_calc["calculated_priority"],
            "priority_score": pri_calc["score"],
            "priority_reason": pri_calc["priority_reason"]
        }

@router.get("/{order_id}")
def get_order_details(order_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
        order_row = cursor.fetchone()
        if not order_row:
            raise HTTPException(status_code=404, detail="Order not found")

        order = dict(order_row)

        # Items with inventory context
        cursor.execute("""
        SELECT oi.*, p.sku, p.name as product_name, p.category, p.zone_code, p.aisle, p.bay, p.shelf,
               i.current_stock, i.reserved_stock, i.damaged_stock,
               a.allocation_status, a.decision_reason, a.decision_log, a.backordered_qty
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN inventory i ON p.id = i.product_id
        LEFT JOIN allocations a ON oi.id = a.order_item_id
        WHERE oi.order_id = ?
        """, (order_id,))
        order["items"] = [dict(r) for r in cursor.fetchall()]

        # Associated picking task
        cursor.execute("SELECT * FROM picking_tasks WHERE order_id = ?", (order_id,))
        p_task = cursor.fetchone()
        order["picking_task"] = dict(p_task) if p_task else None

        # Associated packing task
        cursor.execute("SELECT * FROM packing_tasks WHERE order_id = ?", (order_id,))
        pack_task = cursor.fetchone()
        order["packing_task"] = dict(pack_task) if pack_task else None

        # Associated dispatch
        cursor.execute("SELECT * FROM dispatches WHERE order_id = ?", (order_id,))
        disp = cursor.fetchone()
        order["dispatch"] = dict(disp) if disp else None

        # Associated exceptions
        cursor.execute("SELECT * FROM exceptions WHERE order_id = ?", (order_id,))
        order["exceptions"] = [dict(r) for r in cursor.fetchall()]

        # Generate Timeline Events
        timeline = [
            {"stage": "Order Created", "status": "completed", "time": order.get("created_at"), "desc": f"Order {order['order_number']} placed by {order['customer_name']}."},
            {"stage": "Priority Determined", "status": "completed", "time": order.get("created_at"), "desc": f"Assigned {order['priority']} ({order['priority_score']} pts). Reason: {order['priority_reason']}"},
            {"stage": "Smart Stock Allocation", "status": "completed" if order["status"] not in ["Created", "Waiting for Stock"] else "current" if order["status"] == "Waiting for Stock" else "pending", "time": order.get("updated_at"), "desc": f"Status: {order['status']}"},
            {"stage": "Picking", "status": "completed" if order["status"] in ["Picked", "Packing", "Quality Check", "Packed", "Dispatched", "Delivered"] else "current" if order["status"] == "Picking" else "pending", "time": order["picking_task"]["started_at"] if order.get("picking_task") else None, "desc": f"Assigned to {order.get('assigned_picker') or 'Picker Pool'}."},
            {"stage": "Packing & QC", "status": "completed" if order["status"] in ["Packed", "Dispatched", "Delivered"] else "current" if order["status"] in ["Packing", "Quality Check"] else "pending", "time": order["packing_task"]["started_at"] if order.get("packing_task") else None, "desc": f"Station {order.get('packing_station') or 'STN-1'}."},
            {"stage": "Dispatch & Delivery", "status": "completed" if order["status"] in ["Dispatched", "Delivered"] else "current" if order["status"] == "Packed" else "pending", "time": order["dispatch"]["dispatch_time"] if order.get("dispatch") else None, "desc": f"Carrier: {order.get('carrier') or 'FedEx'}"}
        ]
        order["timeline"] = timeline

        return order

@router.post("/{order_id}/allocate")
def trigger_allocation(order_id: int):
    with get_db() as conn:
        try:
            res = allocate_order_inventory(conn, order_id)
            return res
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))

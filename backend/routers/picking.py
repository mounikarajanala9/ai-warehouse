from fastapi import APIRouter, HTTPException
import json
from typing import Optional, List
from datetime import datetime
from ..db.database import get_db
from ..db.models import PickingTaskAction
from ..engine.picking_optimizer import optimize_picking_route

router = APIRouter(prefix="/api/picking", tags=["Picking"])

@router.get("/tasks")
def get_picking_tasks(status: Optional[str] = None):
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
        SELECT pt.*, o.order_number, o.customer_name, o.priority, o.calculated_priority, o.delivery_deadline,
               (SELECT COUNT(*) FROM picking_items WHERE task_id = pt.id) as total_items_count,
               (SELECT SUM(picked_qty) FROM picking_items WHERE task_id = pt.id) as sum_picked_qty,
               (SELECT SUM(requested_qty) FROM picking_items WHERE task_id = pt.id) as sum_req_qty
        FROM picking_tasks pt
        JOIN orders o ON pt.order_id = o.id
        WHERE 1=1
        """
        params = []
        if status and status != "All":
            query += " AND pt.status = ?"
            params.append(status)

        query += " ORDER BY pt.id DESC"
        cursor.execute(query, params)
        tasks = [dict(r) for r in cursor.fetchall()]

        # Attach item details & route
        for t in tasks:
            cursor.execute("""
            SELECT pi.*, p.category, p.unit_price, p.zone_code, p.aisle, p.bay, p.shelf
            FROM picking_items pi
            JOIN products p ON pi.product_id = p.id
            WHERE pi.task_id = ?
            ORDER BY pi.sequence_order ASC
            """, (t["id"],))
            t["items"] = [dict(r) for r in cursor.fetchall()]

            if t.get("sequence_route"):
                try:
                    t["sequence_route_list"] = json.loads(t["sequence_route"])
                except Exception:
                    t["sequence_route_list"] = []
            else:
                t["sequence_route_list"] = []

        return tasks

@router.get("/tasks/{task_id}")
def get_picking_task(task_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT pt.*, o.order_number, o.customer_name, o.priority, o.delivery_deadline
        FROM picking_tasks pt
        JOIN orders o ON pt.order_id = o.id
        WHERE pt.id = ?
        """, (task_id,))
        task_row = cursor.fetchone()
        if not task_row:
            raise HTTPException(status_code=404, detail="Picking task not found")

        task = dict(task_row)

        cursor.execute("""
        SELECT pi.*, p.category, p.unit_price, p.zone_code, p.aisle, p.bay, p.shelf
        FROM picking_items pi
        JOIN products p ON pi.product_id = p.id
        WHERE pi.task_id = ?
        ORDER BY pi.sequence_order ASC
        """, (task_id,))
        items = [dict(r) for r in cursor.fetchall()]
        task["items"] = items

        # Compute dynamic optimized route
        opt_route = optimize_picking_route(items)
        task["route_details"] = opt_route

        return task

@router.post("/create-for-order/{order_id}")
def create_picking_task_for_order(order_id: int, picker_name: str = "Alex Chen"):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
        ord_row = cursor.fetchone()
        if not ord_row:
            raise HTTPException(status_code=404, detail="Order not found")

        cursor.execute("""
        SELECT oi.*, p.sku, p.name as product_name, p.zone_code, p.aisle, p.bay, p.shelf
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ? AND oi.allocated_qty > 0
        """, (order_id,))
        allocated_items = [dict(r) for r in cursor.fetchall()]

        if not allocated_items:
            raise HTTPException(status_code=400, detail="Order has no allocated items ready for picking.")

        # Optimize Route
        opt = optimize_picking_route(allocated_items)

        task_code = f"PICK-ORD-{order_id}-{int(datetime.now().timestamp())}"
        cursor.execute("""
        INSERT INTO picking_tasks (task_code, order_id, picker_id, picker_name, zone, status, sequence_route, total_distance_meters, estimated_time_mins, started_at)
        VALUES (?, ?, ?, ?, ?, 'Picking', ?, ?, ?, CURRENT_TIMESTAMP)
        """, (
            task_code, order_id, "P-101", picker_name, f"Zone {allocated_items[0].get('zone_code', 'A')}",
            json.dumps(opt["route_sequence"]), opt["total_distance_meters"], opt["estimated_time_mins"]
        ))
        task_id = cursor.lastrowid

        # Insert Picking Items in optimized sequence
        for itm in opt["sorted_items"]:
            loc_str = itm["location_code"]
            cursor.execute("""
            INSERT INTO picking_items (task_id, order_item_id, product_id, sku, product_name, location, sequence_order, requested_qty, picked_qty, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 'Pending')
            """, (
                task_id, itm["id"], itm["product_id"], itm["sku"], itm["product_name"],
                loc_str, itm["sequence_order"], itm["allocated_qty"]
            ))

        cursor.execute("UPDATE orders SET status = 'Picking', assigned_picker = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (picker_name, order_id))

        cursor.execute("""
        INSERT INTO audit_logs (entity_type, entity_id, action, description, performed_by)
        VALUES (?, ?, ?, ?, ?)
        """, ("PickingTask", task_code, "Picking Task Created", f"Initiated optimized route ({opt['total_distance_meters']}m, {opt['estimated_time_mins']}m est) for {ord_row['order_number']}.", picker_name))

        return {
            "success": True,
            "task_id": task_id,
            "task_code": task_code,
            "route": opt
        }

@router.post("/action")
def perform_picking_action(action: PickingTaskAction):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT pt.*, o.order_number FROM picking_tasks pt JOIN orders o ON pt.order_id = o.id WHERE pt.id = ?", (action.task_id,))
        task_row = cursor.fetchone()
        if not task_row:
            raise HTTPException(status_code=404, detail="Task not found")

        order_id = task_row["order_id"]
        order_num = task_row["order_number"]

        if action.action == "pick_item" and action.item_id:
            cursor.execute("""
            UPDATE picking_items 
            SET picked_qty = requested_qty,
                status = 'Picked'
            WHERE id = ? AND task_id = ?
            """, (action.item_id, action.task_id))

            return {"success": True, "message": "Item marked as picked"}

        elif action.action == "complete":
            # Mark all items picked
            cursor.execute("UPDATE picking_items SET picked_qty = requested_qty, status = 'Picked' WHERE task_id = ?", (action.task_id,))
            cursor.execute("UPDATE picking_tasks SET status = 'Picked', completed_at = CURRENT_TIMESTAMP, actual_time_mins = 4.5 WHERE id = ?", (action.task_id,))
            cursor.execute("UPDATE orders SET status = 'Picked', updated_at = CURRENT_TIMESTAMP WHERE id = ?", (order_id,))

            # Auto-create Packing Task
            cursor.execute("""
            INSERT INTO packing_tasks (order_id, station_id, station_name, worker_id, worker_name, status, qc_status, started_at)
            VALUES (?, 'STN-1', 'Packing Station 1', 'W-101', 'Sam Rivera', 'Queued', 'Pending', CURRENT_TIMESTAMP)
            """, (order_id,))

            cursor.execute("""
            INSERT INTO audit_logs (entity_type, entity_id, action, description, performed_by)
            VALUES (?, ?, ?, ?, ?)
            """, ("PickingTask", task_row["task_code"], "Picking Completed", f"All items picked for {order_num}. Transferred to Packing Queue STN-1.", action.picker_name or "Picker"))

            return {"success": True, "message": f"Picking completed for {order_num}. Moved to Packing Queue."}

        return {"success": False, "message": "Unknown action"}

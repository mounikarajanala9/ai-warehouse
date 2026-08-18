from fastapi import APIRouter, HTTPException
from typing import Optional, List
from datetime import datetime
from ..db.database import get_db
from ..db.models import PackingTaskAction
from ..engine.exception_engine import handle_damaged_item

router = APIRouter(prefix="/api/packing", tags=["Packing"])

@router.get("/tasks")
def get_packing_tasks(status: Optional[str] = None):
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
        SELECT pt.*, o.order_number, o.customer_name, o.priority, o.carrier, o.delivery_deadline,
               (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
        FROM packing_tasks pt
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

        for t in tasks:
            cursor.execute("""
            SELECT oi.*, p.sku, p.name as product_name, p.category, p.weight_kg
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
            """, (t["order_id"],))
            t["items"] = [dict(r) for r in cursor.fetchall()]

        return tasks

@router.post("/action")
def perform_packing_action(action: PackingTaskAction):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT pt.*, o.order_number, o.carrier 
        FROM packing_tasks pt 
        JOIN orders o ON pt.order_id = o.id 
        WHERE pt.id = ?
        """, (action.task_id,))
        task_row = cursor.fetchone()
        if not task_row:
            raise HTTPException(status_code=404, detail="Packing task not found")

        order_id = task_row["order_id"]
        order_num = task_row["order_number"]
        carrier = task_row["carrier"] or "FedEx Priority Express"

        if action.action == "start":
            cursor.execute("UPDATE packing_tasks SET status = 'Packing', started_at = CURRENT_TIMESTAMP WHERE id = ?", (action.task_id,))
            cursor.execute("UPDATE orders SET status = 'Packing', updated_at = CURRENT_TIMESTAMP WHERE id = ?", (order_id,))
            return {"success": True, "message": f"Started packing for {order_num}"}

        elif action.action == "complete_qc":
            qc_stat = "Passed" if action.qc_passed else "Failed"
            cursor.execute("""
            UPDATE packing_tasks 
            SET qc_status = ?,
                qc_notes = ?,
                status = 'Quality Check'
            WHERE id = ?
            """, (qc_stat, action.qc_notes or "Verified quantity and barcode scan.", action.task_id))
            cursor.execute("UPDATE orders SET status = 'Quality Check', updated_at = CURRENT_TIMESTAMP WHERE id = ?", (order_id,))
            return {"success": True, "message": f"QC {qc_stat} for {order_num}"}

        elif action.action == "mark_packed":
            box_size = action.box_size or "Medium (Box-M)"
            weight = action.package_weight_kg or 3.2
            cursor.execute("""
            UPDATE packing_tasks 
            SET status = 'Packed',
                qc_status = 'Passed',
                box_size = ?,
                package_weight_kg = ?,
                completed_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """, (box_size, weight, action.task_id))

            cursor.execute("UPDATE orders SET status = 'Packed', updated_at = CURRENT_TIMESTAMP WHERE id = ?", (order_id,))

            # Auto-create or update Dispatch record
            trk = f"TRK-{100000 + order_id}-EXP"
            cursor.execute("""
            INSERT INTO dispatches (order_id, carrier, tracking_number, package_weight_kg, dispatch_status, dispatch_time, estimated_delivery, notes)
            VALUES (?, ?, ?, ?, 'Ready', NULL, datetime('now', '+1 days'), 'Packed and staged at Outbound Bay 1')
            ON CONFLICT(order_id) DO UPDATE SET
                package_weight_kg = excluded.package_weight_kg,
                dispatch_status = 'Ready'
            """, (order_id, carrier, trk, weight))

            cursor.execute("""
            INSERT INTO audit_logs (entity_type, entity_id, action, description, performed_by)
            VALUES (?, ?, ?, ?, ?)
            """, ("PackingTask", f"STN-{action.task_id}", "Order Packed & QC Passed", f"{order_num} sealed in {box_size} ({weight}kg). Staged for {carrier}.", action.worker_name or "Packer"))

            return {"success": True, "message": f"{order_num} packed and staged for dispatch."}

        return {"success": False, "message": "Unknown action"}

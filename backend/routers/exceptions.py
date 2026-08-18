from fastapi import APIRouter, HTTPException
from typing import Optional, List
from datetime import datetime
from ..db.database import get_db
from ..db.models import ExceptionAction

router = APIRouter(prefix="/api/exceptions", tags=["Exceptions"])

@router.get("")
def get_exceptions(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    team: Optional[str] = None
):
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
        SELECT e.*, o.order_number, o.customer_name, o.priority, p.sku, p.name as product_name
        FROM exceptions e
        LEFT JOIN orders o ON e.order_id = o.id
        LEFT JOIN products p ON e.product_id = p.id
        WHERE 1=1
        """
        params = []
        if status and status != "All":
            query += " AND e.status = ?"
            params.append(status)

        if severity and severity != "All":
            query += " AND e.severity = ?"
            params.append(severity)

        if team and team != "All":
            query += " AND e.responsible_team = ?"
            params.append(team)

        query += " ORDER BY e.id DESC"
        cursor.execute(query, params)
        return [dict(r) for r in cursor.fetchall()]

@router.post("/action")
def perform_exception_action(action: ExceptionAction):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM exceptions WHERE id = ?", (action.exception_id,))
        exc_row = cursor.fetchone()
        if not exc_row:
            raise HTTPException(status_code=404, detail="Exception not found")

        exc = dict(exc_row)
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        if action.action == "approve_recommendation":
            res_notes = action.resolution_notes or f"Approved system recommendation: {exc['recommended_action']}"
            cursor.execute("""
            UPDATE exceptions 
            SET status = 'Resolved',
                resolution_notes = ?,
                resolved_at = ?
            WHERE id = ?
            """, (res_notes, now_str, action.exception_id))

            cursor.execute("""
            INSERT INTO audit_logs (entity_type, entity_id, action, description, performed_by)
            VALUES (?, ?, ?, ?, ?)
            """, ("Exception", exc["exception_code"], "Exception Resolved", f"Resolved {exc['type']}. Action: {res_notes}", action.resolved_by or "Manager"))

            cursor.execute("""
            INSERT INTO notifications (title, message, type, severity, related_entity_type, related_entity_id)
            VALUES (?, ?, ?, ?, ?, ?)
            """, (f"✅ Exception Resolved: {exc['exception_code']}", f"{exc['type']} marked as resolved. Operations resumed.", "success", "low", "Exception", action.exception_id))

            return {"success": True, "message": f"Exception {exc['exception_code']} resolved successfully."}

        elif action.action == "investigate":
            cursor.execute("UPDATE exceptions SET status = 'Investigating' WHERE id = ?", (action.exception_id,))
            return {"success": True, "message": f"Exception {exc['exception_code']} marked under investigation."}

        elif action.action == "resolve":
            cursor.execute("""
            UPDATE exceptions 
            SET status = 'Resolved',
                resolution_notes = ?,
                resolved_at = ?
            WHERE id = ?
            """, (action.resolution_notes or "Manually resolved by operator.", now_str, action.exception_id))
            return {"success": True, "message": f"Exception {exc['exception_code']} marked as resolved."}

        return {"success": False, "message": "Unknown action"}

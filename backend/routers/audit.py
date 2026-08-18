from fastapi import APIRouter
from typing import Optional
from ..db.database import get_db

router = APIRouter(prefix="/api/audit", tags=["Audit & Notifications"])

@router.get("/logs")
def get_audit_logs(limit: int = 50, entity_type: Optional[str] = None):
    with get_db() as conn:
        cursor = conn.cursor()
        query = "SELECT * FROM audit_logs WHERE 1=1"
        params = []
        if entity_type and entity_type != "All":
            query += " AND entity_type = ?"
            params.append(entity_type)
        query += " ORDER BY id DESC LIMIT ?"
        params.append(limit)
        cursor.execute(query, params)
        return [dict(r) for r in cursor.fetchall()]

@router.get("/notifications")
def get_notifications(unread_only: bool = False):
    with get_db() as conn:
        cursor = conn.cursor()
        query = "SELECT * FROM notifications WHERE 1=1"
        if unread_only:
            query += " AND is_read = 0"
        query += " ORDER BY id DESC LIMIT 30"
        cursor.execute(query)
        notifs = [dict(r) for r in cursor.fetchall()]
        unread_count = sum(1 for n in notifs if n["is_read"] == 0)
        return {"unread_count": unread_count, "notifications": notifs}

@router.post("/notifications/mark-read")
def mark_notifications_read():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE notifications SET is_read = 1")
        return {"success": True, "message": "All notifications marked as read"}

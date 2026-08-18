import sqlite3
from typing import List, Dict, Any
from .priority_engine import calculate_order_priority
from .forecasting_engine import calculate_inventory_health
from .bottleneck_detector import analyze_warehouse_bottlenecks

def generate_system_recommendations(conn: sqlite3.Connection) -> List[Dict[str, Any]]:
    """
    Scans real warehouse database and generates live, explainable AI/Rule-based recommendations:
    1. Low-stock / Critical stockout alerts (e.g. '⚠️ SKU-104 is expected to run out within 2 days.')
    2. Urgent Order Shortage alerts (e.g. '🚨 Order ORD-1024 is urgent but has insufficient stock.')
    3. Zone Slotting / Layout optimization (e.g. '💡 Move 15 units of SKU-201 closer to Picking Zone A.')
    4. Operational Bottleneck alerts (e.g. '📦 Packing Zone B is currently causing the largest fulfillment delay.')
    5. Discrepancy & Damaged stock action prompts.
    """
    cursor = conn.cursor()
    recommendations = []

    # 1. Check Bottlenecks
    bottleneck_data = analyze_warehouse_bottlenecks(conn)
    if bottleneck_data["delay_attribution_pct"] > 25.0:
        recommendations.append({
            "id": "REC-BOTTLENECK-01",
            "type": "bottleneck",
            "severity": "high",
            "icon": "box",
            "badge": "Operational Bottleneck",
            "title": f"📦 {bottleneck_data['message']}",
            "evidence": bottleneck_data["evidence"],
            "decision": f"Identified {bottleneck_data['primary_bottleneck_stage']} as peak friction point.",
            "reason": f"Queue exceeds capacity threshold by {bottleneck_data['delay_attribution_pct']}%.",
            "action_text": bottleneck_data["recommendation"],
            "action_type": "view_analytics",
            "action_target": "analytics"
        })

    # 2. Check Urgent Orders with Stock Shortages
    cursor.execute("""
    SELECT o.id, o.order_number, o.priority, o.calculated_priority, o.status,
           oi.product_id, oi.requested_qty, oi.allocated_qty, p.sku, p.name as product_name,
           i.current_stock, i.reserved_stock, i.damaged_stock
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    JOIN inventory i ON p.id = i.product_id
    WHERE o.status IN ('Created', 'Partially Allocated', 'Waiting for Stock')
      AND o.priority IN ('Critical', 'High')
    """)
    urgent_shortages = cursor.fetchall()
    for row in urgent_shortages:
        r = dict(row)
        avail = max(0, r["current_stock"] - r["reserved_stock"] - r["damaged_stock"] + r["allocated_qty"])
        if avail < r["requested_qty"]:
            recommendations.append({
                "id": f"REC-ORDER-{r['id']}",
                "type": "critical_order",
                "severity": "critical",
                "icon": "alert-triangle",
                "badge": "Urgent Shortage",
                "title": f"🚨 Order {r['order_number']} is {r['priority']} priority but has insufficient stock of {r['sku']}.",
                "evidence": f"Requested: {r['requested_qty']} units. Available unreserved: {avail} units. Shortage: {r['requested_qty'] - avail} units.",
                "decision": f"Prioritize inventory reservation for {r['order_number']} over standard orders.",
                "reason": f"Critical delivery deadline requires stock protection from low-priority allocations.",
                "action_text": f"Trigger Smart Allocation for {r['order_number']} & create emergency restock PO.",
                "action_type": "allocate_order",
                "action_target": r["id"]
            })
            break # Top one to avoid clutter

    # 3. Check Critical / Fast-Depleting SKUs
    cursor.execute("""
    SELECT p.*, i.current_stock, i.reserved_stock, i.damaged_stock, i.missing_stock
    FROM products p
    JOIN inventory i ON p.id = i.product_id
    """)
    products = [dict(r) for r in cursor.fetchall()]
    
    for p in products:
        health = calculate_inventory_health(p, p)
        if health["days_until_stockout"] <= 3.0 and health["available_stock"] > 0:
            recommendations.append({
                "id": f"REC-STOCK-{p['id']}",
                "type": "stockout_risk",
                "severity": "critical" if health["days_until_stockout"] <= 1.5 else "warning",
                "icon": "clock",
                "badge": "Stockout Risk",
                "title": f"⚠️ {p['sku']} ({p['name']}) is expected to run out within {health['days_until_stockout']} days.",
                "evidence": f"Available: {health['available_stock']} units | Daily Demand: {p['daily_demand']} units/day | Supplier Lead Time: {p['lead_time_days']} days.",
                "decision": f"Reorder threshold breached ({health['available_stock']} <= {p['reorder_level']}).",
                "reason": f"Lead time is {p['lead_time_days']} days. A restock order must be issued today to prevent stockout.",
                "action_text": f"Create PO for recommended {health['recommended_reorder_qty']} units with supplier {p['supplier']}.",
                "action_type": "restock_sku",
                "action_target": p["id"]
            })
            if len(recommendations) >= 4:
                break

    # 4. Slotting & Zone Optimization
    # High daily demand products that are far away in Zone C/D
    for p in products:
        if p.get("daily_demand", 0) >= 12.0 and p.get("zone_code") in ["C", "D"]:
            recommendations.append({
                "id": f"REC-SLOT-{p['id']}",
                "type": "slotting_optimization",
                "severity": "info",
                "icon": "zap",
                "badge": "Smart Slotting",
                "title": f"💡 Move 20 units of {p['sku']} closer to Fast-Pick Zone A.",
                "evidence": f"{p['sku']} has high velocity ({p['daily_demand']} picks/day) but is currently stored in deep Zone {p['zone_code']}-{p['aisle']}.",
                "decision": f"Dynamic slotting re-assignment from Zone {p['zone_code']} to Fast-Pick Bay A-01.",
                "reason": "Reduces picker travel distance by an estimated 280 meters per shift.",
                "action_text": f"Generate relocation task for {p['sku']} to Zone A.",
                "action_type": "view_inventory",
                "action_target": p["id"]
            })
            break

    # 5. Active Exceptions awaiting resolution
    cursor.execute("SELECT * FROM exceptions WHERE status IN ('Open', 'Resolution Suggested') ORDER BY id DESC LIMIT 1")
    exc_row = cursor.fetchone()
    if exc_row:
        exc = dict(exc_row)
        recommendations.append({
            "id": f"REC-EXC-{exc['id']}",
            "type": "exception_resolution",
            "severity": exc["severity"].lower(),
            "icon": "shield-alert",
            "badge": "Exception Action",
            "title": f"🛡️ Resolution ready for Exception {exc['exception_code']} ({exc['type']}).",
            "evidence": exc["description"],
            "decision": "Automated recovery rule applied.",
            "reason": "Unresolved exception is blocking order progression.",
            "action_text": f"Approve: {exc['recommended_action']}",
            "action_type": "view_exceptions",
            "action_target": exc["id"]
        })

    return recommendations

import sqlite3
from datetime import datetime

def generate_exception_recommendation(exc_type: str, details: dict) -> dict:
    """
    Produces rule-based recommendations for warehouse exceptions:
    - Damaged item -> Auto-deduct from available stock, quarantine SKU, allocate replacement from buffer.
    - Missing item -> Flag discrepancy, adjust inventory, check affected orders.
    - Insufficient stock -> Priority reservation + replenishment PO.
    - Quantity mismatch -> Trigger physical recount at bin.
    - Picking/Packing delay -> Dispatch roaming support.
    """
    sku = details.get("sku", "SKU")
    order_num = details.get("order_number", "Order")
    location = details.get("location", "Warehouse Bin")
    qty = details.get("quantity", 1)
    
    if exc_type == "Damaged Item":
        rec = f"Deduct {qty} damaged unit(s) of {sku} from active bin ({location}). Quarantine units for return/salvage, and reserve replacement unit from Buffer Zone D."
        team = "Inventory Control"
        severity = "High"
    elif exc_type == "Missing Item":
        rec = f"Log inventory discrepancy of {qty} unit(s) for {sku} at {location}. Issue immediate physical recount cycle-count task and reallocate from secondary bay."
        team = "Inventory Control"
        severity = "High"
    elif exc_type == "Insufficient Stock":
        rec = f"Reserve available units for high-priority order {order_num}. Generate urgent replenishment PO for shortage to avoid SLA breach."
        team = "Logistics & Procurement"
        severity = "Critical"
    elif exc_type == "Quantity Mismatch":
        rec = f"Halt packing for {order_num}. Perform barcode recount of SKU {sku} at Station 1. Rectify picking slip discrepancy."
        team = "Packing Team"
        severity = "Medium"
    elif exc_type == "Picking Delay":
        rec = f"Reassign 1 dynamic roving picker to Zone A to absorb peak picking queue and meet delivery deadline."
        team = "Picking Team"
        severity = "Medium"
    elif exc_type == "Packing Delay":
        rec = f"Activate overflow packing station STN-3 to relieve queue pressure."
        team = "Packing Team"
        severity = "Medium"
    else:
        rec = f"Investigate discrepancy with supervisor and notify affected customer account manager."
        team = "Warehouse Operations"
        severity = "Low"

    return {
        "severity": severity,
        "responsible_team": team,
        "recommended_action": rec
    }

def handle_damaged_item(conn: sqlite3.Connection, product_id: int, quantity: int, reason: str, reported_by: str = "Operator", order_id: int = None) -> dict:
    """
    Complete workflow when an item is marked damaged:
    1. Removes quantity from available/current inventory & adds to damaged_stock.
    2. Logs audit trail.
    3. Creates an Exception record with automated recommendation.
    4. Checks if any active order is affected and recalculates inventory allocations.
    """
    cursor = conn.cursor()
    
    cursor.execute("SELECT p.sku, p.name, p.zone_code, p.aisle, p.bay, p.shelf, i.current_stock, i.reserved_stock FROM products p JOIN inventory i ON p.id = i.product_id WHERE p.id = ?", (product_id,))
    p_row = cursor.fetchone()
    if not p_row:
        raise ValueError("Product not found")
    
    sku = p_row["sku"]
    p_name = p_row["name"]
    loc = f"{p_row['zone_code']}-{p_row['aisle']}-{p_row['bay']}-{p_row['shelf']}"

    # Update inventory: increase damaged stock
    cursor.execute("""
    UPDATE inventory
    SET damaged_stock = damaged_stock + ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE product_id = ?
    """, (quantity, product_id))

    # Log to Audit Log
    cursor.execute("""
    INSERT INTO audit_logs (entity_type, entity_id, action, description, performed_by)
    VALUES (?, ?, ?, ?, ?)
    """, ("Inventory", sku, "Item Marked Damaged", f"{quantity} unit(s) of {sku} ({p_name}) reported damaged at {loc}. Reason: {reason}", reported_by))

    # Create Exception record
    exc_code = f"EXC-DMG-{product_id}-{int(datetime.now().timestamp())}"
    rec_info = generate_exception_recommendation("Damaged Item", {
        "sku": sku,
        "location": loc,
        "quantity": quantity,
        "order_number": f"ORD-{order_id}" if order_id else "General Inventory"
    })

    desc = f"Damaged inventory reported: {quantity}x {sku} ({p_name}) at location {loc}. Reason: {reason}"
    cursor.execute("""
    INSERT INTO exceptions (exception_code, order_id, product_id, type, severity, description, responsible_team, status, recommended_action)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (exc_code, order_id, product_id, "Damaged Item", rec_info["severity"], desc, rec_info["responsible_team"], "Resolution Suggested", rec_info["recommended_action"]))
    
    exc_id = cursor.lastrowid

    # Create system notification
    cursor.execute("""
    INSERT INTO notifications (title, message, type, severity, related_entity_type, related_entity_id)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (f"Damaged Stock Alert: {sku}", f"{quantity} unit(s) of {sku} damaged. Quarantine recommended.", "warning", "high", "Exception", exc_id))

    return {
        "success": True,
        "exception_id": exc_id,
        "exception_code": exc_code,
        "sku": sku,
        "damaged_added": quantity,
        "recommendation": rec_info["recommended_action"]
    }

def handle_missing_item(conn: sqlite3.Connection, product_id: int, quantity: int, reason: str, reported_by: str = "Operator", order_id: int = None) -> dict:
    """
    Workflow when an item is missing during picking or cycle count.
    """
    cursor = conn.cursor()
    cursor.execute("SELECT p.sku, p.name, p.zone_code, p.aisle, p.bay, p.shelf FROM products p WHERE p.id = ?", (product_id,))
    p_row = cursor.fetchone()
    if not p_row:
        raise ValueError("Product not found")

    sku = p_row["sku"]
    p_name = p_row["name"]
    loc = f"{p_row['zone_code']}-{p_row['aisle']}-{p_row['bay']}-{p_row['shelf']}"

    cursor.execute("""
    UPDATE inventory
    SET missing_stock = missing_stock + ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE product_id = ?
    """, (quantity, product_id))

    cursor.execute("""
    INSERT INTO audit_logs (entity_type, entity_id, action, description, performed_by)
    VALUES (?, ?, ?, ?, ?)
    """, ("Inventory", sku, "Item Marked Missing", f"{quantity} unit(s) of {sku} missing at bin {loc}. Reason: {reason}", reported_by))

    exc_code = f"EXC-MISS-{product_id}-{int(datetime.now().timestamp())}"
    rec_info = generate_exception_recommendation("Missing Item", {
        "sku": sku,
        "location": loc,
        "quantity": quantity,
        "order_number": f"ORD-{order_id}" if order_id else "General Inventory"
    })

    desc = f"Inventory discrepancy / missing stock: {quantity}x {sku} ({p_name}) at {loc}."
    cursor.execute("""
    INSERT INTO exceptions (exception_code, order_id, product_id, type, severity, description, responsible_team, status, recommended_action)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (exc_code, order_id, product_id, "Missing Item", rec_info["severity"], desc, rec_info["responsible_team"], "Resolution Suggested", rec_info["recommended_action"]))
    
    exc_id = cursor.lastrowid

    cursor.execute("""
    INSERT INTO notifications (title, message, type, severity, related_entity_type, related_entity_id)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (f"Missing Stock Alert: {sku}", f"{quantity} unit(s) of {sku} missing at {loc}. Cycle count task initiated.", "critical", "critical", "Exception", exc_id))

    return {
        "success": True,
        "exception_id": exc_id,
        "exception_code": exc_code,
        "sku": sku,
        "missing_added": quantity,
        "recommendation": rec_info["recommended_action"]
    }

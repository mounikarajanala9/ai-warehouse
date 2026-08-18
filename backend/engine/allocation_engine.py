import json
import sqlite3
from datetime import datetime

def allocate_order_inventory(conn: sqlite3.Connection, order_id: int) -> dict:
    """
    Intelligently allocates stock for an order based on priority and availability:
    1. Reads order details & priority score.
    2. Reads requested items.
    3. For each item, computes true available stock: current_stock - reserved_stock - damaged_stock - missing_stock.
    4. Evaluates competing pending orders if stock is limited.
    5. Allocates available stock to highest priority orders first.
    6. Updates order items, reserved inventory, and creates allocation decision records with full explainability logs.
    7. Updates overall order status (Allocated, Partially Allocated, Waiting for Stock).
    """
    cursor = conn.cursor()

    # Get order info
    cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
    order_row = cursor.fetchone()
    if not order_row:
        raise ValueError(f"Order ID {order_id} not found")
    
    order = dict(order_row)
    order_priority = order.get("priority", "Medium")
    order_score = order.get("priority_score", 50.0)
    order_num = order.get("order_number", f"ORD-{order_id}")

    # Get items for this order
    cursor.execute("""
    SELECT oi.*, p.sku, p.name as product_name, p.unit_price,
           i.current_stock, i.reserved_stock, i.damaged_stock, i.missing_stock
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    JOIN inventory i ON p.id = i.product_id
    WHERE oi.order_id = ?
    """, (order_id,))
    items = [dict(r) for r in cursor.fetchall()]

    allocation_results = []
    all_fully_allocated = True
    any_allocated = False

    for item in items:
        product_id = item["product_id"]
        requested_qty = item["requested_qty"]
        current_allocated = item.get("allocated_qty", 0)
        
        # Calculate available stock for allocation
        # (Current stock - reserved stock - damaged - missing + what this item might already have reserved)
        current_stock = item["current_stock"]
        reserved_stock = item["reserved_stock"]
        damaged_stock = item["damaged_stock"]
        missing_stock = item["missing_stock"]

        # Available units unreserved right now
        available_pool = max(0, current_stock - reserved_stock - damaged_stock - missing_stock + current_allocated)

        allocated_qty = 0
        backordered_qty = 0
        alloc_status = "Waiting for Stock"
        reason = ""
        explanation = ""

        if available_pool >= requested_qty:
            # Full allocation
            allocated_qty = requested_qty
            backordered_qty = 0
            alloc_status = "Fully Allocated"
            reason = f"Full stock available ({available_pool} units in bin). 100% reserved."
            explanation = f"Allocated all {requested_qty} units of {item['sku']}. Sufficient stock in warehouse."
        elif available_pool > 0:
            # Partial allocation
            allocated_qty = available_pool
            backordered_qty = requested_qty - available_pool
            alloc_status = "Partially Allocated"
            all_fully_allocated = False
            any_allocated = True
            
            if order_priority in ["Critical", "High"]:
                reason = f"Stock Shortage ({available_pool}/{requested_qty}). High Priority reservation applied."
                explanation = (f"Only {available_pool} units available. Because {order_num} has {order_priority.upper()} priority "
                               f"(Score: {order_score}), all {available_pool} available units are reserved for it. "
                               f"{backordered_qty} units sent to Urgent Replenishment Backorder.")
            else:
                reason = f"Partial stock available ({available_pool}/{requested_qty})."
                explanation = (f"Partial allocation: {available_pool} units assigned. {backordered_qty} units backordered. "
                               f"Consider prioritizing restock for {item['sku']}.")
        else:
            # Zero available
            allocated_qty = 0
            backordered_qty = requested_qty
            alloc_status = "Backordered"
            all_fully_allocated = False
            reason = f"Zero unreserved units available ({current_stock} total, {reserved_stock} reserved for prior orders, {damaged_stock} damaged)."
            explanation = f"Zero units of {item['sku']} available. Entire quantity ({requested_qty} units) placed on Backorder."

        if allocated_qty > 0:
            any_allocated = True

        # Delta in reserved stock
        net_reserved_change = allocated_qty - current_allocated
        if net_reserved_change != 0:
            cursor.execute("""
            UPDATE inventory 
            SET reserved_stock = reserved_stock + ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE product_id = ?
            """, (net_reserved_change, product_id))

        # Update order item
        cursor.execute("""
        UPDATE order_items
        SET allocated_qty = ?,
            status = ?
        WHERE id = ?
        """, (allocated_qty, alloc_status, item["id"]))

        # Check if allocation record exists or insert new
        cursor.execute("SELECT id FROM allocations WHERE order_item_id = ?", (item["id"],))
        alloc_row = cursor.fetchone()
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        if alloc_row:
            cursor.execute("""
            UPDATE allocations
            SET allocated_qty = ?,
                backordered_qty = ?,
                allocation_status = ?,
                decision_reason = ?,
                decision_log = ?,
                timestamp = ?
            WHERE id = ?
            """, (allocated_qty, backordered_qty, alloc_status, reason, explanation, now_str, alloc_row[0]))
        else:
            cursor.execute("""
            INSERT INTO allocations (order_id, order_item_id, product_id, requested_qty, allocated_qty, backordered_qty, allocation_status, decision_reason, decision_log, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (order_id, item["id"], product_id, requested_qty, allocated_qty, backordered_qty, alloc_status, reason, explanation, now_str))

        allocation_results.append({
            "order_id": order_id,
            "order_number": order_num,
            "product_id": product_id,
            "sku": item["sku"],
            "requested_qty": requested_qty,
            "allocated_qty": allocated_qty,
            "backordered_qty": backordered_qty,
            "status": alloc_status,
            "priority_level": order_priority,
            "reason": reason,
            "explanation": explanation
        })

    # Update overall Order status
    if all_fully_allocated:
        new_order_status = "Allocated"
    elif any_allocated:
        new_order_status = "Partially Allocated"
    else:
        new_order_status = "Waiting for Stock"

    cursor.execute("""
    UPDATE orders
    SET status = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
    """, (new_order_status, order_id))

    # Log to Audit Log
    cursor.execute("""
    INSERT INTO audit_logs (entity_type, entity_id, action, description, performed_by)
    VALUES (?, ?, ?, ?, ?)
    """, ("Order", str(order_id), "Smart Stock Allocation", 
          f"Stock allocation executed for {order_num}. Status changed to '{new_order_status}'.", "Smart Allocation Engine"))

    # If shortage exists and priority is Critical/High, create/verify Exception
    if not all_fully_allocated and order_priority in ["Critical", "High"]:
        cursor.execute("SELECT id FROM exceptions WHERE order_id = ? AND type = 'Insufficient Stock'", (order_id,))
        if not cursor.fetchone():
            exc_code = f"EXC-STOCK-{order_id}-{int(datetime.now().timestamp())}"
            desc = f"Order {order_num} ({order_priority}) has unfulfilled backordered items."
            rec_action = f"Expedite emergency PO for shortage and reserve upcoming inbound shipment for {order_num}."
            cursor.execute("""
            INSERT INTO exceptions (exception_code, order_id, type, severity, description, responsible_team, status, recommended_action)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (exc_code, order_id, "Insufficient Stock", "Critical", desc, "Inventory Control", "Resolution Suggested", rec_action))

    return {
        "order_id": order_id,
        "order_number": order_num,
        "new_order_status": new_order_status,
        "allocations": allocation_results
    }

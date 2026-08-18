import math

def calculate_inventory_health(product: dict, inventory: dict) -> dict:
    """
    Calculates:
    - Available Stock = current_stock - reserved_stock - damaged_stock - missing_stock
    - Days until stockout = Available Stock / Daily Demand
    - Stock status: Out of Stock, Critical, Low Stock, In Stock, Damaged
    - Recommended reorder quantity based on lead time buffer + reorder level
    """
    current_stock = int(inventory.get("current_stock", 0))
    reserved_stock = int(inventory.get("reserved_stock", 0))
    damaged_stock = int(inventory.get("damaged_stock", 0))
    missing_stock = int(inventory.get("missing_stock", 0))
    
    available_stock = max(0, current_stock - reserved_stock - damaged_stock - missing_stock)
    
    daily_demand = float(product.get("daily_demand", 5.0))
    if daily_demand <= 0:
        daily_demand = 1.0
        
    reorder_level = int(product.get("reorder_level", 10))
    reorder_qty = int(product.get("reorder_qty", 50))
    lead_time_days = int(product.get("lead_time_days", 3))

    days_until_stockout = round(available_stock / daily_demand, 1)

    # Status classification
    if current_stock == 0 or (available_stock == 0 and reserved_stock == 0):
        status = "Out of Stock"
        urgency = "critical"
    elif available_stock == 0 and reserved_stock > 0:
        status = "Critical"
        urgency = "critical"
    elif days_until_stockout <= 2.0 or available_stock <= (reorder_level * 0.5):
        status = "Critical"
        urgency = "critical"
    elif available_stock <= reorder_level or days_until_stockout <= 4.0:
        status = "Low Stock"
        urgency = "warning"
    elif damaged_stock > (current_stock * 0.3) and damaged_stock > 0:
        status = "Damaged"
        urgency = "warning"
    else:
        status = "In Stock"
        urgency = "healthy"

    # Reorder Recommendation Calculation
    # Buffer = Daily Demand * Lead Time * 1.5 safety factor
    safety_stock_buffer = math.ceil(daily_demand * lead_time_days * 1.5)
    target_inventory = reorder_level + safety_stock_buffer
    
    if available_stock <= reorder_level:
        recommended_reorder = max(reorder_qty, (target_inventory - available_stock) + reorder_qty)
    else:
        recommended_reorder = 0

    prediction_message = ""
    if status == "Out of Stock":
        prediction_message = f"🚨 Stock is completely depleted! Immediate restock of {reorder_qty} units required."
    elif status == "Critical":
        prediction_message = f"⚠️ CRITICAL: Expected stockout in approximately {days_until_stockout} days at current demand ({daily_demand}/day)."
    elif status == "Low Stock":
        prediction_message = f"⚡ WARNING: Stock ({available_stock} units) is below reorder threshold ({reorder_level}). Stockout in ~{days_until_stockout} days."
    else:
        prediction_message = f"✅ Healthy inventory: ~{days_until_stockout} days of stock buffer remaining."

    return {
        "available_stock": available_stock,
        "days_until_stockout": days_until_stockout,
        "status": status,
        "urgency": urgency,
        "recommended_reorder_qty": recommended_reorder,
        "prediction_message": prediction_message
    }

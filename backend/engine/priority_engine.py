from datetime import datetime, timezone

def calculate_order_priority(order_data: dict, current_time: datetime = None) -> dict:
    """
    Calculates order priority score and tier based on:
    - Delivery deadline proximity
    - Customer tier (VIP, Enterprise, Standard, Retail)
    - Express shipping flag
    - Total order value / item count
    - Age of order
    """
    if current_time is None:
        current_time = datetime.now()

    deadline_str = order_data.get("delivery_deadline", "")
    customer_type = order_data.get("customer_type", "Standard")
    is_express = bool(order_data.get("is_express", 0))
    total_items = order_data.get("total_items", 1)
    total_value = order_data.get("total_value", 50.0)
    created_at_str = order_data.get("created_at", "")

    # Calculate hours to deadline
    hours_to_deadline = 48.0
    if deadline_str:
        try:
            # Handle ISO or standard datetime strings
            clean_str = deadline_str.replace("Z", "+00:00")
            if "T" in clean_str:
                deadline_dt = datetime.fromisoformat(clean_str)
            else:
                deadline_dt = datetime.strptime(clean_str, "%Y-%m-%d %H:%M:%S")
            
            if deadline_dt.tzinfo is not None:
                deadline_dt = deadline_dt.replace(tzinfo=None)
            
            diff = (deadline_dt - current_time).total_seconds() / 3600.0
            hours_to_deadline = max(0.1, diff)
        except Exception:
            hours_to_deadline = 24.0

    score = 0.0
    reasons = []

    # 1. Deadline Proximity Scoring (Max 50 pts)
    if hours_to_deadline <= 4.0:
        score += 50.0
        reasons.append(f"Delivery deadline is in {hours_to_deadline:.1f}h (<4h)")
    elif hours_to_deadline <= 12.0:
        score += 35.0
        reasons.append(f"Delivery deadline is in {hours_to_deadline:.1f}h (<12h)")
    elif hours_to_deadline <= 24.0:
        score += 20.0
        reasons.append(f"Delivery deadline is in {hours_to_deadline:.1f}h (<24h)")
    else:
        score += 10.0
        reasons.append(f"Delivery deadline is in {hours_to_deadline:.1f}h")

    # 2. Customer Tier Scoring (Max 25 pts)
    if customer_type.upper() == "VIP":
        score += 25.0
        reasons.append("Customer is VIP Platinum Tier (+25 pts)")
    elif customer_type.upper() == "ENTERPRISE":
        score += 18.0
        reasons.append("Customer is Enterprise Corporate Tier (+18 pts)")
    elif customer_type.upper() == "RETAIL":
        score += 10.0
    else:
        score += 5.0

    # 3. Express Flag (Max 20 pts)
    if is_express:
        score += 20.0
        reasons.append("Express Air Priority flagged (+20 pts)")

    # 4. Order Value / Size factor (Max 10 pts)
    if total_value >= 1000.0 or total_items >= 20:
        score += 10.0
        reasons.append("High volume / high value order (+10 pts)")
    elif total_value >= 400.0:
        score += 5.0

    # 5. Determine Tier
    if score >= 75.0 or hours_to_deadline <= 3.0:
        priority_tier = "Critical"
    elif score >= 50.0 or hours_to_deadline <= 8.0:
        priority_tier = "High"
    elif score >= 25.0:
        priority_tier = "Medium"
    else:
        priority_tier = "Low"

    explanation = f"{priority_tier.upper()} — " + " | ".join(reasons)

    return {
        "score": round(score, 1),
        "calculated_priority": priority_tier,
        "priority_reason": explanation,
        "hours_to_deadline": round(hours_to_deadline, 1)
    }

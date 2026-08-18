import math
from typing import List, Dict, Any

# Warehouse zone coordinate mappings
ZONE_X_OFFSET = {
    "A": 0,
    "B": 50,
    "C": 100,
    "D": 150
}

def parse_location_coordinates(location_str: str) -> dict:
    """
    Parses a warehouse location like 'A-01-03-B' or 'Zone A / Aisle 01 / Bay 03'
    Returns numeric (x, y) coordinates on a standard 200m x 100m warehouse grid.
    """
    parts = location_str.replace("Zone ", "").replace("Aisle ", "").replace("Bay ", "").replace("Shelf ", "").split("-")
    zone = "A"
    aisle = 1
    bay = 1
    shelf = "A"

    if len(parts) >= 1 and parts[0]:
        zone = parts[0].strip().upper()
    if len(parts) >= 2:
        try:
            aisle = int(parts[1])
        except ValueError:
            aisle = 1
    if len(parts) >= 3:
        try:
            bay = int(parts[2])
        except ValueError:
            bay = 1
    if len(parts) >= 4:
        shelf = parts[3].strip().upper()

    x_base = ZONE_X_OFFSET.get(zone, 0)
    # Aisle offset along X (each aisle is 6 meters apart)
    x = x_base + (aisle * 6)
    # Bay offset along Y (each bay is 4 meters along the aisle)
    y = bay * 4

    return {
        "zone": zone,
        "aisle": aisle,
        "bay": bay,
        "shelf": shelf,
        "x": x,
        "y": y,
        "formatted_code": f"{zone}-{aisle:02d}-{bay:02d}-{shelf}"
    }

def optimize_picking_route(items: List[Dict[str, Any]]) -> dict:
    """
    Implements S-Shape (Serpentine) warehouse routing heuristic:
    - Sorts locations by Zone, then by Aisle.
    - Alternates direction in adjacent aisles (even aisles pick bottom-to-top, odd aisles pick top-to-bottom)
      to eliminate unnecessary backtracking.
    - Calculates total walking distance in meters from packing station entrance (0,0).
    - Calculates estimated picking duration (distance / walking speed + pick time per item).
    """
    if not items:
        return {
            "sorted_items": [],
            "route_sequence": [],
            "total_distance_meters": 0,
            "estimated_time_mins": 0.0,
            "number_of_locations": 0
        }

    # Enhance items with parsed coordinates
    enhanced_items = []
    for item in items:
        loc_str = item.get("location") or f"{item.get('zone_code', 'A')}-{item.get('aisle', '01')}-{item.get('bay', '01')}-{item.get('shelf', 'A')}"
        coords = parse_location_coordinates(loc_str)
        enhanced = dict(item)
        enhanced["coords"] = coords
        enhanced["location_code"] = coords["formatted_code"]
        enhanced_items.append(enhanced)

    # Group by Zone and Aisle
    def sort_key(itm):
        c = itm["coords"]
        # Serpentine direction based on aisle number
        is_even_aisle = (c["aisle"] % 2 == 0)
        y_effective = -c["y"] if is_even_aisle else c["y"]
        return (c["zone"], c["aisle"], y_effective, c["shelf"])

    sorted_items = sorted(enhanced_items, key=sort_key)

    # Assign sequence numbers
    for idx, itm in enumerate(sorted_items):
        itm["sequence_order"] = idx + 1

    # Calculate walking path distance from entrance (0,0) through all points and back to dispatch depot (0,0)
    current_x = 0
    current_y = 0
    total_distance = 0.0

    route_sequence = []
    for itm in sorted_items:
        dest_x = itm["coords"]["x"]
        dest_y = itm["coords"]["y"]
        
        # Manhattan distance + aisle traversal overhead
        dist = abs(dest_x - current_x) + abs(dest_y - current_y)
        total_distance += dist
        
        current_x = dest_x
        current_y = dest_y
        route_sequence.append(itm["location_code"])

    # Return to Packing / Staging zone at (0, 0)
    return_dist = abs(current_x - 0) + abs(current_y - 0)
    total_distance += return_dist

    # Walking speed: ~1.2 m/s (72 meters/minute)
    # Pick handling time: ~0.6 minutes per item
    walk_time_mins = total_distance / 70.0
    handling_time_mins = len(sorted_items) * 0.6
    estimated_total_mins = round(walk_time_mins + handling_time_mins, 1)

    return {
        "sorted_items": sorted_items,
        "route_sequence": route_sequence,
        "total_distance_meters": int(total_distance),
        "estimated_time_mins": max(1.0, estimated_total_mins),
        "number_of_locations": len(route_sequence)
    }

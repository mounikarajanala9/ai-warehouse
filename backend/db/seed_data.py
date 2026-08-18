import sqlite3
import random
from datetime import datetime, timedelta

def seed_database(conn: sqlite3.Connection):
    cursor = conn.cursor()

    # Clear existing data
    tables = [
        "audit_logs", "notifications", "bottlenecks", "dispatches", 
        "exceptions", "packing_tasks", "picking_items", "picking_tasks", 
        "allocations", "order_items", "orders", "warehouse_locations", 
        "inventory", "products"
    ]
    for tbl in tables:
        cursor.execute(f"DELETE FROM {tbl}")
        try:
            cursor.execute(f"DELETE FROM sqlite_sequence WHERE name='{tbl}'")
        except Exception:
            pass

    # 1. Seed 35 Realistic Products
    products_data = [
        # Hackathon Demo SKU: SKU-104
        {"sku": "SKU-104", "name": "Ultra-Precision Optical Sensor", "category": "Industrial Electronics", "unit": "pcs", "unit_price": 145.0, "reorder_level": 15, "reorder_qty": 40, "supplier": "Apex Optronics Ltd", "zone_code": "A", "aisle": "01", "bay": "02", "shelf": "B", "daily_demand": 8.0, "lead_time_days": 2, "weight_kg": 0.4, "current_stock": 10, "reserved_stock": 0, "damaged_stock": 3, "missing_stock": 0},
        # Fast movers in Zone A
        {"sku": "SKU-101", "name": "Smart Barcode Scanner Pro 2D", "category": "Electronics", "unit": "pcs", "unit_price": 280.0, "reorder_level": 12, "reorder_qty": 30, "supplier": "ScanTech Solutions", "zone_code": "A", "aisle": "01", "bay": "01", "shelf": "A", "daily_demand": 6.5, "lead_time_days": 3, "weight_kg": 0.6, "current_stock": 45, "reserved_stock": 10, "damaged_stock": 0, "missing_stock": 0},
        {"sku": "SKU-102", "name": "Thermal Label Printer Roll 4x6", "category": "Packaging & Supplies", "unit": "rolls", "unit_price": 18.5, "reorder_level": 50, "reorder_qty": 200, "supplier": "ZebraPrint Supplies", "zone_code": "A", "aisle": "01", "bay": "03", "shelf": "A", "daily_demand": 25.0, "lead_time_days": 1, "weight_kg": 1.2, "current_stock": 180, "reserved_stock": 30, "damaged_stock": 0, "missing_stock": 0},
        {"sku": "SKU-103", "name": "High-Capacity Li-Ion Battery Pack", "category": "Power & Energy", "unit": "pcs", "unit_price": 75.0, "reorder_level": 20, "reorder_qty": 60, "supplier": "VoltMax Power", "zone_code": "A", "aisle": "02", "bay": "01", "shelf": "C", "daily_demand": 9.0, "lead_time_days": 4, "weight_kg": 0.8, "current_stock": 22, "reserved_stock": 5, "damaged_stock": 2, "missing_stock": 0},
        {"sku": "SKU-105", "name": "Industrial Wi-Fi Gateway Mesh", "category": "Networking", "unit": "pcs", "unit_price": 320.0, "reorder_level": 8, "reorder_qty": 25, "supplier": "NetCore Systems", "zone_code": "A", "aisle": "02", "bay": "03", "shelf": "A", "daily_demand": 3.0, "lead_time_days": 5, "weight_kg": 1.5, "current_stock": 14, "reserved_stock": 4, "damaged_stock": 0, "missing_stock": 0},
        {"sku": "SKU-106", "name": "Ruggedized Android Handheld Terminal", "category": "Electronics", "unit": "pcs", "unit_price": 650.0, "reorder_level": 5, "reorder_qty": 20, "supplier": "ScanTech Solutions", "zone_code": "A", "aisle": "03", "bay": "01", "shelf": "B", "daily_demand": 2.0, "lead_time_days": 6, "weight_kg": 0.9, "current_stock": 8, "reserved_stock": 3, "damaged_stock": 0, "missing_stock": 0},
        {"sku": "SKU-107", "name": "Heavy-Duty Kevlar Safety Gloves", "category": "Safety & PPE", "unit": "pairs", "unit_price": 24.0, "reorder_level": 30, "reorder_qty": 100, "supplier": "ShieldSafe Safety", "zone_code": "A", "aisle": "03", "bay": "02", "shelf": "C", "daily_demand": 12.0, "lead_time_days": 2, "weight_kg": 0.3, "current_stock": 95, "reserved_stock": 15, "damaged_stock": 0, "missing_stock": 0},
        {"sku": "SKU-108", "name": "Laser Distance Measuring Meter 100m", "category": "Tools & Hardware", "unit": "pcs", "unit_price": 89.0, "reorder_level": 10, "reorder_qty": 35, "supplier": "Apex Optronics Ltd", "zone_code": "A", "aisle": "04", "bay": "01", "shelf": "A", "daily_demand": 4.0, "lead_time_days": 3, "weight_kg": 0.5, "current_stock": 28, "reserved_stock": 8, "damaged_stock": 1, "missing_stock": 0},
        
        # Zone B Items (Medium velocity & components)
        {"sku": "SKU-201", "name": "Precision Stepper Motor NEMA 23", "category": "Robotics & Automation", "unit": "pcs", "unit_price": 54.0, "reorder_level": 25, "reorder_qty": 80, "supplier": "MotionCraft Robotics", "zone_code": "B", "aisle": "01", "bay": "01", "shelf": "A", "daily_demand": 14.0, "lead_time_days": 5, "weight_kg": 1.1, "current_stock": 35, "reserved_stock": 10, "damaged_stock": 0, "missing_stock": 0},
        {"sku": "SKU-202", "name": "Microcontroller Development Board V4", "category": "Electronics", "unit": "pcs", "unit_price": 42.0, "reorder_level": 30, "reorder_qty": 120, "supplier": "SiliconLabs Direct", "zone_code": "B", "aisle": "01", "bay": "02", "shelf": "C", "daily_demand": 10.0, "lead_time_days": 3, "weight_kg": 0.2, "current_stock": 110, "reserved_stock": 20, "damaged_stock": 0, "missing_stock": 0},
        {"sku": "SKU-203", "name": "Aluminum Extrusion Rail 2020 1m", "category": "Mechanical Hardware", "unit": "bars", "unit_price": 16.0, "reorder_level": 40, "reorder_qty": 150, "supplier": "StructoAlloy Corp", "zone_code": "B", "aisle": "02", "bay": "01", "shelf": "B", "daily_demand": 18.0, "lead_time_days": 4, "weight_kg": 1.8, "current_stock": 65, "reserved_stock": 25, "damaged_stock": 2, "missing_stock": 0},
        {"sku": "SKU-204", "name": "Ball Bearing Set 608ZZ (Pack of 10)", "category": "Mechanical Hardware", "unit": "packs", "unit_price": 12.5, "reorder_level": 50, "reorder_qty": 200, "supplier": "PrecisionBearing Co", "zone_code": "B", "aisle": "02", "bay": "03", "shelf": "A", "daily_demand": 22.0, "lead_time_days": 2, "weight_kg": 0.4, "current_stock": 140, "reserved_stock": 40, "damaged_stock": 0, "missing_stock": 0},
        {"sku": "SKU-205", "name": "Solid State Relay 40A SSR-40DA", "category": "Industrial Electronics", "unit": "pcs", "unit_price": 22.0, "reorder_level": 15, "reorder_qty": 60, "supplier": "ElectroTech Components", "zone_code": "B", "aisle": "03", "bay": "01", "shelf": "C", "daily_demand": 5.0, "lead_time_days": 3, "weight_kg": 0.3, "current_stock": 6, "reserved_stock": 4, "damaged_stock": 2, "missing_stock": 0},
        {"sku": "SKU-206", "name": "Digital Temperature & Humidity Probe", "category": "Sensors", "unit": "pcs", "unit_price": 34.0, "reorder_level": 20, "reorder_qty": 70, "supplier": "Apex Optronics Ltd", "zone_code": "B", "aisle": "03", "bay": "02", "shelf": "B", "daily_demand": 7.0, "lead_time_days": 3, "weight_kg": 0.2, "current_stock": 45, "reserved_stock": 12, "damaged_stock": 0, "missing_stock": 0},
        {"sku": "SKU-207", "name": "Timing Belt GT2 6mm Rubber (5m)", "category": "Robotics & Automation", "unit": "rolls", "unit_price": 15.0, "reorder_level": 25, "reorder_qty": 90, "supplier": "MotionCraft Robotics", "zone_code": "B", "aisle": "04", "bay": "01", "shelf": "A", "daily_demand": 8.0, "lead_time_days": 2, "weight_kg": 0.3, "current_stock": 70, "reserved_stock": 15, "damaged_stock": 0, "missing_stock": 0},
        {"sku": "SKU-208", "name": "Switching Power Supply 24V 15A 360W", "category": "Power & Energy", "unit": "pcs", "unit_price": 68.0, "reorder_level": 12, "reorder_qty": 40, "supplier": "VoltMax Power", "zone_code": "B", "aisle": "04", "bay": "03", "shelf": "B", "daily_demand": 4.5, "lead_time_days": 4, "weight_kg": 1.4, "current_stock": 18, "reserved_stock": 6, "damaged_stock": 0, "missing_stock": 0},

        # Zone C Items (Medical, Cleanroom & Specialized)
        {"sku": "SKU-301", "name": "Medical Grade Nitrile Gloves (Box 100)", "category": "Medical & Cleanroom", "unit": "boxes", "unit_price": 28.0, "reorder_level": 40, "reorder_qty": 180, "supplier": "MedSafe Logistics", "zone_code": "C", "aisle": "01", "bay": "01", "shelf": "A", "daily_demand": 20.0, "lead_time_days": 2, "weight_kg": 0.7, "current_stock": 85, "reserved_stock": 20, "damaged_stock": 0, "missing_stock": 0},
        {"sku": "SKU-302", "name": "Infrared Non-Contact Forehead Thermometer", "category": "Medical Devices", "unit": "pcs", "unit_price": 45.0, "reorder_level": 15, "reorder_qty": 50, "supplier": "MedSafe Logistics", "zone_code": "C", "aisle": "01", "bay": "02", "shelf": "B", "daily_demand": 5.0, "lead_time_days": 3, "weight_kg": 0.4, "current_stock": 32, "reserved_stock": 8, "damaged_stock": 0, "missing_stock": 0},
        {"sku": "SKU-303", "name": "HEPA Filter Replacement Cartridge H13", "category": "Cleanroom", "unit": "pcs", "unit_price": 62.0, "reorder_level": 10, "reorder_qty": 35, "supplier": "PureAir Cleanrooms", "zone_code": "C", "aisle": "02", "bay": "01", "shelf": "C", "daily_demand": 3.0, "lead_time_days": 5, "weight_kg": 1.6, "current_stock": 9, "reserved_stock": 3, "damaged_stock": 0, "missing_stock": 0},
        {"sku": "SKU-304", "name": "Sterile Saline Solution 500ml", "category": "Medical & Cleanroom", "unit": "bottles", "unit_price": 8.5, "reorder_level": 60, "reorder_qty": 240, "supplier": "PharmaPure Dist.", "zone_code": "C", "aisle": "02", "bay": "02", "shelf": "A", "daily_demand": 30.0, "lead_time_days": 2, "weight_kg": 0.6, "current_stock": 190, "reserved_stock": 50, "damaged_stock": 5, "missing_stock": 0},
        {"sku": "SKU-305", "name": "Digital Blood Pressure Monitor Pro", "category": "Medical Devices", "unit": "pcs", "unit_price": 85.0, "reorder_level": 12, "reorder_qty": 45, "supplier": "MedSafe Logistics", "zone_code": "C", "aisle": "03", "bay": "01", "shelf": "B", "daily_demand": 4.0, "lead_time_days": 4, "weight_kg": 0.8, "current_stock": 25, "reserved_stock": 6, "damaged_stock": 0, "missing_stock": 0},
        {"sku": "SKU-306", "name": "Cleanroom Antistatic ESD Smock L", "category": "Cleanroom", "unit": "pcs", "unit_price": 38.0, "reorder_level": 15, "reorder_qty": 60, "supplier": "PureAir Cleanrooms", "zone_code": "C", "aisle": "03", "bay": "02", "shelf": "A", "daily_demand": 3.5, "lead_time_days": 3, "weight_kg": 0.5, "current_stock": 29, "reserved_stock": 4, "damaged_stock": 0, "missing_stock": 0},
        {"sku": "SKU-307", "name": "Laboratory Micropipette 100-1000uL", "category": "Lab Equipment", "unit": "pcs", "unit_price": 195.0, "reorder_level": 6, "reorder_qty": 20, "supplier": "PharmaPure Dist.", "zone_code": "C", "aisle": "04", "bay": "01", "shelf": "C", "daily_demand": 1.5, "lead_time_days": 7, "weight_kg": 0.4, "current_stock": 8, "reserved_stock": 2, "damaged_stock": 0, "missing_stock": 0},
        {"sku": "SKU-308", "name": "UV-C Sanitization Wand Pro", "category": "Medical & Cleanroom", "unit": "pcs", "unit_price": 110.0, "reorder_level": 10, "reorder_qty": 30, "supplier": "PureAir Cleanrooms", "zone_code": "C", "aisle": "04", "bay": "02", "shelf": "B", "daily_demand": 2.5, "lead_time_days": 4, "weight_kg": 0.9, "current_stock": 16, "reserved_stock": 5, "damaged_stock": 0, "missing_stock": 0},

        # Zone D Items (Heavy, Bulk, Packaging & Overflow)
        {"sku": "SKU-401", "name": "Stretch Wrap Film Roll 18inch 80ga", "category": "Packaging & Supplies", "unit": "rolls", "unit_price": 22.0, "reorder_level": 40, "reorder_qty": 160, "supplier": "PackPro Essentials", "zone_code": "D", "aisle": "01", "bay": "01", "shelf": "A", "daily_demand": 16.0, "lead_time_days": 2, "weight_kg": 3.8, "current_stock": 120, "reserved_stock": 25, "damaged_stock": 0, "missing_stock": 0},
        {"sku": "SKU-402", "name": "Corrugated Shipping Box Medium (25pk)", "category": "Packaging & Supplies", "unit": "bundles", "unit_price": 35.0, "reorder_level": 30, "reorder_qty": 120, "supplier": "PackPro Essentials", "zone_code": "D", "aisle": "01", "bay": "02", "shelf": "B", "daily_demand": 14.0, "lead_time_days": 2, "weight_kg": 6.5, "current_stock": 85, "reserved_stock": 20, "damaged_stock": 0, "missing_stock": 0},
        {"sku": "SKU-403", "name": "Heavy Duty Pallet Strapping Kit", "category": "Warehouse Equipment", "unit": "kits", "unit_price": 125.0, "reorder_level": 8, "reorder_qty": 25, "supplier": "Industrial Logistics Co", "zone_code": "D", "aisle": "02", "bay": "01", "shelf": "A", "daily_demand": 2.0, "lead_time_days": 4, "weight_kg": 8.0, "current_stock": 15, "reserved_stock": 3, "damaged_stock": 0, "missing_stock": 0},
        {"sku": "SKU-404", "name": "Reinforced Kraft Water-Activated Tape (10pk)", "category": "Packaging & Supplies", "unit": "packs", "unit_price": 48.0, "reorder_level": 25, "reorder_qty": 90, "supplier": "PackPro Essentials", "zone_code": "D", "aisle": "02", "bay": "02", "shelf": "C", "daily_demand": 8.0, "lead_time_days": 3, "weight_kg": 4.2, "current_stock": 55, "reserved_stock": 10, "damaged_stock": 0, "missing_stock": 0},
        {"sku": "SKU-405", "name": "Hydraulic Hand Pallet Truck 5500lbs", "category": "Warehouse Equipment", "unit": "units", "unit_price": 490.0, "reorder_level": 2, "reorder_qty": 5, "supplier": "Industrial Logistics Co", "zone_code": "D", "aisle": "03", "bay": "01", "shelf": "Floor", "daily_demand": 0.4, "lead_time_days": 10, "weight_kg": 68.0, "current_stock": 4, "reserved_stock": 1, "damaged_stock": 0, "missing_stock": 0},
        {"sku": "SKU-406", "name": "Biodegradable Packing Peanuts (20cu ft)", "category": "Packaging & Supplies", "unit": "bags", "unit_price": 32.0, "reorder_level": 15, "reorder_qty": 50, "supplier": "EcoPack Solutions", "zone_code": "D", "aisle": "03", "bay": "02", "shelf": "A", "daily_demand": 5.0, "lead_time_days": 2, "weight_kg": 2.5, "current_stock": 30, "reserved_stock": 6, "damaged_stock": 0, "missing_stock": 0},
        {"sku": "SKU-407", "name": "Anti-Fatigue Floor Mat 3x5ft", "category": "Warehouse Ergonomics", "unit": "mats", "unit_price": 58.0, "reorder_level": 8, "reorder_qty": 30, "supplier": "ShieldSafe Safety", "zone_code": "D", "aisle": "04", "bay": "01", "shelf": "B", "daily_demand": 1.5, "lead_time_days": 5, "weight_kg": 5.0, "current_stock": 14, "reserved_stock": 2, "damaged_stock": 0, "missing_stock": 0},
        {"sku": "SKU-408", "name": "Industrial Spill Response Kit 50gal", "category": "Safety & PPE", "unit": "kits", "unit_price": 210.0, "reorder_level": 4, "reorder_qty": 12, "supplier": "ShieldSafe Safety", "zone_code": "D", "aisle": "04", "bay": "02", "shelf": "A", "daily_demand": 0.5, "lead_time_days": 6, "weight_kg": 18.0, "current_stock": 5, "reserved_stock": 1, "damaged_stock": 0, "missing_stock": 0},
        
        # Extra specialty items
        {"sku": "SKU-501", "name": "Embedded Edge AI Vision Processor", "category": "Robotics & Automation", "unit": "pcs", "unit_price": 450.0, "reorder_level": 8, "reorder_qty": 25, "supplier": "SiliconLabs Direct", "zone_code": "A", "aisle": "04", "bay": "02", "shelf": "A", "daily_demand": 2.0, "lead_time_days": 7, "weight_kg": 0.3, "current_stock": 12, "reserved_stock": 2, "damaged_stock": 0, "missing_stock": 0},
        {"sku": "SKU-502", "name": "Pneumatic Gripper Module 2-Finger", "category": "Robotics & Automation", "unit": "pcs", "unit_price": 180.0, "reorder_level": 10, "reorder_qty": 30, "supplier": "MotionCraft Robotics", "zone_code": "B", "aisle": "04", "bay": "02", "shelf": "B", "daily_demand": 3.0, "lead_time_days": 4, "weight_kg": 0.9, "current_stock": 22, "reserved_stock": 4, "damaged_stock": 1, "missing_stock": 0},
        {"sku": "SKU-503", "name": "Hazardous Material Warning Signs (5pk)", "category": "Safety & PPE", "unit": "packs", "unit_price": 29.0, "reorder_level": 15, "reorder_qty": 50, "supplier": "ShieldSafe Safety", "zone_code": "D", "aisle": "02", "bay": "03", "shelf": "A", "daily_demand": 3.0, "lead_time_days": 3, "weight_kg": 1.1, "current_stock": 28, "reserved_stock": 5, "damaged_stock": 0, "missing_stock": 0}
    ]

    product_id_map = {}
    zone_offsets = {"A": 0, "B": 50, "C": 100, "D": 150}

    for p in products_data:
        cursor.execute("""
        INSERT INTO products (sku, name, category, unit, unit_price, reorder_level, reorder_qty, supplier, zone_code, aisle, bay, shelf, daily_demand, lead_time_days, weight_kg, dimensions)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            p["sku"], p["name"], p["category"], p["unit"], p["unit_price"], 
            p["reorder_level"], p["reorder_qty"], p["supplier"], 
            p["zone_code"], p["aisle"], p["bay"], p["shelf"], 
            p["daily_demand"], p["lead_time_days"], p["weight_kg"], "25x18x12 cm"
        ))
        p_id = cursor.lastrowid
        product_id_map[p["sku"]] = p_id

        # Insert Inventory
        cursor.execute("""
        INSERT INTO inventory (product_id, current_stock, reserved_stock, damaged_stock, missing_stock, last_counted_at)
        VALUES (?, ?, ?, ?, ?, datetime('now', '-1 days'))
        """, (p_id, p["current_stock"], p["reserved_stock"], p["damaged_stock"], p["missing_stock"]))

        # Insert Warehouse Location
        aisle_int = int(p["aisle"]) if p["aisle"].isdigit() else 1
        bay_int = int(p["bay"]) if p["bay"].isdigit() else 1
        loc_code = f"{p['zone_code']}-{p['aisle']}-{p['bay']}-{p['shelf']}"
        x = zone_offsets.get(p["zone_code"], 0) + (aisle_int * 6)
        y = bay_int * 4

        cursor.execute("""
        INSERT INTO warehouse_locations (zone, aisle, bay, shelf, location_code, x_coord, y_coord, capacity, product_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (f"Zone {p['zone_code']}", p["aisle"], p["bay"], p["shelf"], loc_code, x, y, 100, p_id))

    # 2. Seed 50+ Realistic Orders with complete lifecycle coverage
    now = datetime.now()
    
    customers = [
        ("Apex Aerospace Systems", "VIP"),
        ("BioHealth Diagnostics", "VIP"),
        ("Quantum Dynamics Global", "Enterprise"),
        ("NexGen Robotics Lab", "Enterprise"),
        ("Orion Automation Works", "Standard"),
        ("Metro Logistics Hub", "Standard"),
        ("Starlight MedTech", "VIP"),
        ("CyberCore Hardware", "Enterprise"),
        ("BlueHorizon Retailers", "Retail"),
        ("Pioneer Electronics Ltd", "Standard"),
        ("Solaris Industrial Tools", "Enterprise"),
        ("OmniSupply Network", "Standard"),
        ("Acrobat Supply Chain", "Retail"),
        ("Nova Medical Devices", "VIP"),
        ("Frontier Automation", "Enterprise")
    ]

    pickers = ["Alex Chen (Zone A/B)", "Maria Rodriguez (Zone C)", "David Kim (Zone D)", "Elena Rostova (Fast Track)"]
    stations = ["Packing Station 1 (STN-1)", "Packing Station 2 (STN-2)", "Special Handling STN-3"]
    carriers = ["FedEx Priority Express", "UPS Ground Freight", "DHL Express Global", "BlueDart Swift Air"]

    # Specific hackathon showcase orders
    # Demo Order 1: ORD-1024 (Urgent, needs 10x SKU-104)
    # Demo Order 2: ORD-1027 (Low Priority, needs 5x SKU-104)
    demo_orders = [
        {
            "num": "ORD-1024",
            "cust": "Apex Aerospace Systems",
            "tier": "VIP",
            "express": 1,
            "priority": "Critical",
            "calc_priority": "Critical",
            "score": 95.0,
            "reason": "CRITICAL — Delivery deadline is within 2.5 hours (VIP Platinum Customer + Express Air)",
            "status": "Partially Allocated",
            "deadline": (now + timedelta(hours=2.5)).strftime("%Y-%m-%d %H:%M:%S"),
            "items": [{"sku": "SKU-104", "qty": 10, "alloc": 7, "picked": 0, "packed": 0, "status": "Partially Allocated"}],
            "picker": pickers[0],
            "station": stations[0],
            "carrier": carriers[0]
        },
        {
            "num": "ORD-1027",
            "cust": "OmniSupply Network",
            "tier": "Standard",
            "express": 0,
            "priority": "Low",
            "calc_priority": "Low",
            "score": 20.0,
            "reason": "LOW — Delivery deadline is in 48.0 hours. Standard ground fulfillment.",
            "status": "Waiting for Stock",
            "deadline": (now + timedelta(hours=48)).strftime("%Y-%m-%d %H:%M:%S"),
            "items": [{"sku": "SKU-104", "qty": 5, "alloc": 0, "picked": 0, "packed": 0, "status": "Backordered"}],
            "picker": None,
            "station": None,
            "carrier": carriers[1]
        },
        # More specific workflow orders
        {
            "num": "ORD-1001",
            "cust": "BioHealth Diagnostics",
            "tier": "VIP",
            "express": 1,
            "priority": "Critical",
            "calc_priority": "Critical",
            "score": 92.0,
            "reason": "CRITICAL — Delivery deadline is within 3.0 hours. Urgent sterile cleanroom supply.",
            "status": "Picking",
            "deadline": (now + timedelta(hours=3)).strftime("%Y-%m-%d %H:%M:%S"),
            "items": [
                {"sku": "SKU-301", "qty": 4, "alloc": 4, "picked": 4, "packed": 0, "status": "Picked"},
                {"sku": "SKU-304", "qty": 10, "alloc": 10, "picked": 5, "packed": 0, "status": "Pending"},
                {"sku": "SKU-308", "qty": 2, "alloc": 2, "picked": 0, "packed": 0, "status": "Pending"}
            ],
            "picker": pickers[1],
            "station": stations[0],
            "carrier": carriers[0]
        },
        {
            "num": "ORD-1002",
            "cust": "Quantum Dynamics Global",
            "tier": "Enterprise",
            "express": 0,
            "priority": "High",
            "calc_priority": "High",
            "score": 68.0,
            "reason": "HIGH — Enterprise tier order with delivery deadline in 7.5 hours.",
            "status": "Quality Check",
            "deadline": (now + timedelta(hours=7.5)).strftime("%Y-%m-%d %H:%M:%S"),
            "items": [
                {"sku": "SKU-101", "qty": 2, "alloc": 2, "picked": 2, "packed": 2, "status": "Packed"},
                {"sku": "SKU-202", "qty": 5, "alloc": 5, "picked": 5, "packed": 5, "status": "Packed"}
            ],
            "picker": pickers[0],
            "station": stations[1],
            "carrier": carriers[2]
        },
        {
            "num": "ORD-1003",
            "cust": "NexGen Robotics Lab",
            "tier": "Enterprise",
            "express": 1,
            "priority": "High",
            "calc_priority": "High",
            "score": 72.0,
            "reason": "HIGH — Express flag active, robotics prototype components.",
            "status": "Packed",
            "deadline": (now + timedelta(hours=6.0)).strftime("%Y-%m-%d %H:%M:%S"),
            "items": [
                {"sku": "SKU-201", "qty": 4, "alloc": 4, "picked": 4, "packed": 4, "status": "Packed"},
                {"sku": "SKU-204", "qty": 2, "alloc": 2, "picked": 2, "packed": 2, "status": "Packed"}
            ],
            "picker": pickers[0],
            "station": stations[0],
            "carrier": carriers[0]
        },
        {
            "num": "ORD-1004",
            "cust": "Starlight MedTech",
            "tier": "VIP",
            "express": 1,
            "priority": "Critical",
            "calc_priority": "Critical",
            "score": 90.0,
            "reason": "CRITICAL — VIP Customer surgical monitor shipment. Priority Express.",
            "status": "Dispatched",
            "deadline": (now + timedelta(hours=1.0)).strftime("%Y-%m-%d %H:%M:%S"),
            "items": [
                {"sku": "SKU-305", "qty": 3, "alloc": 3, "picked": 3, "packed": 3, "status": "Packed"},
                {"sku": "SKU-302", "qty": 2, "alloc": 2, "picked": 2, "packed": 2, "status": "Packed"}
            ],
            "picker": pickers[1],
            "station": stations[0],
            "carrier": carriers[0]
        }
    ]

    all_order_templates = list(demo_orders)
    existing_nums = {o["num"] for o in demo_orders}
    
    # Generate additional orders to reach 50+ total without duplicate IDs
    statuses_pool = [
        "Created", "Allocated", "Allocated", "Picking", "Picked", 
        "Packing", "Quality Check", "Packed", "Dispatched", "Delivered"
    ]

    sku_keys = list(product_id_map.keys())

    for i in range(5, 60):
        o_num = f"ORD-{1000 + i}"
        if o_num in existing_nums:
            continue
        cust_tuple = random.choice(customers)

        status_choice = random.choice(statuses_pool)
        express_choice = 1 if (random.random() > 0.65 or cust_tuple[1] == "VIP") else 0
        deadline_hrs = random.choice([2.5, 4.0, 6.0, 10.0, 18.0, 26.0, 36.0, 48.0])
        deadline_dt = (now + timedelta(hours=deadline_hrs)).strftime("%Y-%m-%d %H:%M:%S")

        # Score & Priority
        score = 20.0
        if deadline_hrs <= 4.0:
            score += 45.0
        elif deadline_hrs <= 12.0:
            score += 30.0
        if cust_tuple[1] == "VIP":
            score += 25.0
        elif cust_tuple[1] == "Enterprise":
            score += 15.0
        if express_choice:
            score += 20.0

        if score >= 75.0 or deadline_hrs <= 3.0:
            pri = "Critical"
        elif score >= 50.0 or deadline_hrs <= 8.0:
            pri = "High"
        elif score >= 25.0:
            pri = "Medium"
        else:
            pri = "Low"

        reason = f"{pri.upper()} — Delivery in {deadline_hrs}h | {cust_tuple[1]} Customer | Score: {int(score)}"

        # Pick 1 to 3 items
        order_items_list = []
        selected_skus = random.sample(sku_keys, random.randint(1, 3))
        for sk in selected_skus:
            req = random.randint(1, 6)
            is_done = status_choice in ["Picked", "Packing", "Quality Check", "Packed", "Dispatched", "Delivered"]
            is_alloc = status_choice not in ["Created", "Waiting for Stock"]
            order_items_list.append({
                "sku": sk,
                "qty": req,
                "alloc": req if is_alloc else 0,
                "picked": req if is_done else 0,
                "packed": req if status_choice in ["Packed", "Dispatched", "Delivered"] else 0,
                "status": "Packed" if status_choice in ["Packed", "Dispatched", "Delivered"] else ("Picked" if is_done else "Pending")
            })

        all_order_templates.append({
            "num": o_num,
            "cust": cust_tuple[0],
            "tier": cust_tuple[1],
            "express": express_choice,
            "priority": pri,
            "calc_priority": pri,
            "score": score,
            "reason": reason,
            "status": status_choice,
            "deadline": deadline_dt,
            "items": order_items_list,
            "picker": random.choice(pickers) if status_choice not in ["Created", "Allocated", "Waiting for Stock"] else None,
            "station": random.choice(stations) if status_choice in ["Packing", "Quality Check", "Packed", "Dispatched", "Delivered"] else None,
            "carrier": random.choice(carriers)
        })

    # Insert Orders into database
    for o in all_order_templates:
        total_items = sum(itm["qty"] for itm in o["items"])
        cursor.execute("""
        INSERT INTO orders (order_number, customer_name, customer_type, is_express, priority, calculated_priority, priority_score, priority_reason, status, delivery_deadline, total_items, assigned_picker, packing_station, carrier, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-2 hours'), datetime('now', '-10 minutes'))
        """, (
            o["num"], o["cust"], o["tier"], o["express"], o["priority"], 
            o["calc_priority"], o["score"], o["reason"], o["status"], 
            o["deadline"], total_items, o["picker"], o["station"], o["carrier"]
        ))
        ord_id = cursor.lastrowid

        # Insert Items & Allocations
        for itm in o["items"]:
            p_id = product_id_map[itm["sku"]]
            cursor.execute("""
            INSERT INTO order_items (order_id, product_id, requested_qty, allocated_qty, picked_qty, packed_qty, status, unit_price)
            VALUES (?, ?, ?, ?, ?, ?, ?, 50.0)
            """, (ord_id, p_id, itm["qty"], itm["alloc"], itm["picked"], itm["packed"], itm["status"]))
            oi_id = cursor.lastrowid

            if itm["alloc"] > 0 or o["status"] in ["Partially Allocated", "Waiting for Stock"]:
                backordered = max(0, itm["qty"] - itm["alloc"])
                alloc_stat = "Fully Allocated" if backordered == 0 else ("Partially Allocated" if itm["alloc"] > 0 else "Waiting for Stock")
                decision_reason = f"Allocated {itm['alloc']}/{itm['qty']} based on {o['priority']} priority."
                explanation = f"Decision Engine evaluated stock for {itm['sku']}. Priority {o['priority']} reservation applied."
                cursor.execute("""
                INSERT INTO allocations (order_id, order_item_id, product_id, requested_qty, allocated_qty, backordered_qty, allocation_status, decision_reason, decision_log)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (ord_id, oi_id, p_id, itm["qty"], itm["alloc"], backordered, alloc_stat, decision_reason, explanation))

        # Insert Picking Task if active
        if o["status"] in ["Picking", "Picked", "Packing", "Quality Check", "Packed", "Dispatched", "Delivered"]:
            p_stat = "Picked" if o["status"] != "Picking" else "Picking"
            cursor.execute("""
            INSERT INTO picking_tasks (task_code, order_id, picker_id, picker_name, zone, status, sequence_route, total_distance_meters, estimated_time_mins, actual_time_mins, started_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-30 minutes'))
            """, (
                f"PICK-{ord_id}", ord_id, "P-101", o["picker"] or "Alex Chen", 
                "Zone A", p_stat, '["A-01-01-A", "A-01-02-B", "B-01-01-A"]', 
                64, 4.8, 5.2
            ))
            pt_id = cursor.lastrowid
            
            # Picking items
            for idx, itm in enumerate(o["items"]):
                p_id = product_id_map[itm["sku"]]
                cursor.execute("""
                INSERT INTO picking_items (task_id, order_item_id, product_id, sku, product_name, location, sequence_order, requested_qty, picked_qty, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (pt_id, oi_id, p_id, itm["sku"], itm["sku"], "A-01-01-A", idx + 1, itm["qty"], itm["picked"], "Picked" if itm["picked"] > 0 else "Pending"))

        # Insert Packing Task if relevant
        if o["status"] in ["Packing", "Quality Check", "Packed", "Dispatched", "Delivered"]:
            pack_stat = "Packed" if o["status"] in ["Packed", "Dispatched", "Delivered"] else ("Quality Check" if o["status"] == "Quality Check" else "Packing")
            qc_stat = "Passed" if o["status"] in ["Packed", "Dispatched", "Delivered"] else ("Pending" if o["status"] == "Quality Check" else "Pending")
            cursor.execute("""
            INSERT INTO packing_tasks (order_id, station_id, station_name, worker_id, worker_name, package_type, box_size, package_weight_kg, status, qc_status, qc_notes, started_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-20 minutes'))
            """, (ord_id, "STN-1", o["station"] or "Packing Station 1", "W-101", "Sam Rivera", "Corrugated Box", "Medium (Box-M)", 3.4, pack_stat, qc_stat, "Barcode & seal verified 100% compliant."))

        # Insert Dispatch record if Dispatched
        if o["status"] in ["Dispatched", "Delivered"]:
            cursor.execute("""
            INSERT INTO dispatches (order_id, carrier, tracking_number, package_weight_kg, dispatch_status, dispatch_time, estimated_delivery, notes)
            VALUES (?, ?, ?, ?, ?, datetime('now', '-45 minutes'), datetime('now', '+1 days'), ?)
            """, (ord_id, o["carrier"], f"TRK-{100000 + ord_id}-EXP", 3.4, "In Transit" if o["status"] == "Dispatched" else "Delivered", "Manifested and handed to carrier driver."))

    # 3. Seed Realistic Exceptions
    exceptions_seed = [
        {
            "code": "EXC-1001",
            "order_id": 1,
            "sku": "SKU-104",
            "type": "Insufficient Stock",
            "severity": "Critical",
            "desc": "Order ORD-1024 requested 10 units of SKU-104 but only 7 unreserved units were available in Bin A-01-02-B.",
            "team": "Inventory Control",
            "status": "Resolution Suggested",
            "rec": "Reserve 7 available units for Critical order ORD-1024. Issue expedited PO for remaining 3 units to Apex Optronics Ltd."
        },
        {
            "code": "EXC-1002",
            "order_id": None,
            "sku": "SKU-205",
            "type": "Damaged Item",
            "severity": "High",
            "desc": "2 units of Solid State Relay (SKU-205) found with fractured casing during morning bin audit in B-03-01-C.",
            "team": "Inventory Control",
            "status": "Open",
            "rec": "Quarantine 2 units to Defective Bin D-04, deduct from active inventory, and initiate supplier RMA return."
        },
        {
            "code": "EXC-1003",
            "order_id": 3,
            "sku": "SKU-304",
            "type": "Quantity Mismatch",
            "severity": "Medium",
            "desc": "Picker picked 5 bottles of Saline Solution (SKU-304) instead of requested 10 bottles for ORD-1001 due to bin split.",
            "team": "Picking Team",
            "status": "Investigating",
            "rec": "Direct picker to Secondary Cleanroom Buffer C-02-02-A to pick remaining 5 bottles."
        },
        {
            "code": "EXC-1004",
            "order_id": 4,
            "sku": "SKU-101",
            "type": "Packing Delay",
            "severity": "Medium",
            "desc": "Station STN-1 queue delay: Order ORD-1002 barcode label printer ribbon required reload.",
            "team": "Packing Team",
            "status": "Resolved",
            "rec": "Ribbon replaced and printer recalibrated. QC passed."
        }
    ]

    for exc in exceptions_seed:
        p_id = product_id_map.get(exc["sku"])
        cursor.execute("""
        INSERT INTO exceptions (exception_code, order_id, product_id, type, severity, description, responsible_team, status, recommended_action, detected_time)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-35 minutes'))
        """, (exc["code"], exc["order_id"], p_id, exc["type"], exc["severity"], exc["desc"], exc["team"], exc["status"], exc["rec"]))

    # 4. Seed Audit Logs
    audit_seed = [
        ("System Engine", "System", "STARTUP", "Smart Warehouse Intelligence Platform initialized with automated rule engine."),
        ("Allocation Engine", "Order", "ALLOCATE", "ORD-1024 priority elevated to CRITICAL. 7 units of SKU-104 reserved; 3 backordered."),
        ("Operator Maria", "Inventory", "DAMAGE_REPORT", "Reported 2 units damaged for SKU-205 in Bay B-03-01-C."),
        ("Picker Alex", "PickingTask", "PICK_COMPLETE", "Completed optimized route for ORD-1003 in 4.8 minutes (100% accuracy)."),
        ("Packer Sam", "PackingTask", "QC_PASS", "Quality Check verified for ORD-1004. Tamper-evident seal applied."),
        ("Logistics Lead", "Dispatch", "MANIFEST", "Dispatched ORD-1004 via FedEx Priority Express (Tracking TRK-100004-EXP).")
    ]
    for actor, ent, act, msg in audit_seed:
        cursor.execute("""
        INSERT INTO audit_logs (performed_by, entity_type, entity_id, action, description, timestamp)
        VALUES (?, ?, 'SYS', ?, ?, datetime('now', '-15 minutes'))
        """, (actor, ent, act, msg))

    # 5. Seed Notifications
    notifs = [
        ("🚨 Critical Stock Shortage", "SKU-104 has only 7 units available for urgent order ORD-1024.", "critical", "critical", "Order", 1),
        ("⚠️ Low Stock Alert", "SKU-205 stock (6 units) is below reorder threshold (15).", "warning", "high", "Product", product_id_map["SKU-205"]),
        ("📦 Packing Bottleneck Detected", "Packing Station 1 queue has 8 orders. Delay attribution 42%.", "warning", "medium", "Bottleneck", 1),
        ("✅ Route Optimization Active", "S-Shape picking routes reduced walking distance by 34% today.", "success", "low", "System", 0)
    ]
    for title, msg, n_type, sev, r_type, r_id in notifs:
        cursor.execute("""
        INSERT INTO notifications (title, message, type, severity, related_entity_type, related_entity_id)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (title, msg, n_type, sev, r_type, r_id))

    print(f"Database seeded successfully with {len(products_data)} products and {len(all_order_templates)} orders.")

import sqlite3
import os
from contextlib import contextmanager

import tempfile

# On Vercel / serverless environment, root directory is read-only, so write DB to /tmp
if os.getenv("VERCEL") or not os.access(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), os.W_OK):
    DB_PATH = os.path.join(tempfile.gettempdir(), "warehouse.db")
else:
    DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "warehouse.db")


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

@contextmanager
def get_db():
    conn = get_db_connection()
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Products table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sku TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            unit TEXT DEFAULT 'pcs',
            unit_price REAL DEFAULT 0.0,
            reorder_level INTEGER NOT NULL DEFAULT 10,
            reorder_qty INTEGER NOT NULL DEFAULT 50,
            supplier TEXT NOT NULL,
            zone_code TEXT NOT NULL DEFAULT 'A',
            aisle TEXT NOT NULL DEFAULT '01',
            bay TEXT NOT NULL DEFAULT '01',
            shelf TEXT NOT NULL DEFAULT 'A',
            daily_demand REAL NOT NULL DEFAULT 5.0,
            lead_time_days INTEGER NOT NULL DEFAULT 3,
            weight_kg REAL DEFAULT 1.0,
            dimensions TEXT DEFAULT '20x15x10 cm'
        )
        """)

        # Inventory table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER UNIQUE NOT NULL,
            current_stock INTEGER NOT NULL DEFAULT 0,
            reserved_stock INTEGER NOT NULL DEFAULT 0,
            damaged_stock INTEGER NOT NULL DEFAULT 0,
            missing_stock INTEGER NOT NULL DEFAULT 0,
            last_counted_at TEXT,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        )
        """)

        # Warehouse Locations table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS warehouse_locations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            zone TEXT NOT NULL,
            aisle TEXT NOT NULL,
            bay TEXT NOT NULL,
            shelf TEXT NOT NULL,
            location_code TEXT UNIQUE NOT NULL,
            x_coord INTEGER NOT NULL DEFAULT 0,
            y_coord INTEGER NOT NULL DEFAULT 0,
            capacity INTEGER DEFAULT 100,
            product_id INTEGER,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
        )
        """)

        # Orders table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_number TEXT UNIQUE NOT NULL,
            customer_name TEXT NOT NULL,
            customer_type TEXT NOT NULL DEFAULT 'Standard',
            is_express INTEGER NOT NULL DEFAULT 0,
            priority TEXT NOT NULL DEFAULT 'Medium',
            calculated_priority TEXT NOT NULL DEFAULT 'Medium',
            priority_score REAL DEFAULT 50.0,
            priority_reason TEXT,
            status TEXT NOT NULL DEFAULT 'Created',
            delivery_deadline TEXT NOT NULL,
            total_items INTEGER DEFAULT 0,
            total_value REAL DEFAULT 0.0,
            assigned_picker TEXT,
            packing_station TEXT,
            carrier TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            completed_at TEXT
        )
        """)

        # Order Items table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            requested_qty INTEGER NOT NULL,
            allocated_qty INTEGER NOT NULL DEFAULT 0,
            picked_qty INTEGER NOT NULL DEFAULT 0,
            packed_qty INTEGER NOT NULL DEFAULT 0,
            status TEXT NOT NULL DEFAULT 'Pending',
            unit_price REAL DEFAULT 0.0,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        )
        """)

        # Allocations table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS allocations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            order_item_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            requested_qty INTEGER NOT NULL,
            allocated_qty INTEGER NOT NULL DEFAULT 0,
            backordered_qty INTEGER NOT NULL DEFAULT 0,
            allocation_status TEXT NOT NULL DEFAULT 'Waiting for Stock',
            decision_reason TEXT,
            decision_log TEXT,
            timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
            FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        )
        """)

        # Picking Tasks table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS picking_tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_code TEXT UNIQUE NOT NULL,
            order_id INTEGER NOT NULL,
            picker_id TEXT,
            picker_name TEXT,
            zone TEXT NOT NULL DEFAULT 'Zone A',
            status TEXT NOT NULL DEFAULT 'Not Started',
            sequence_route TEXT,
            total_distance_meters INTEGER DEFAULT 0,
            estimated_time_mins REAL DEFAULT 0.0,
            actual_time_mins REAL DEFAULT 0.0,
            started_at TEXT,
            completed_at TEXT,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
        )
        """)

        # Picking Items table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS picking_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_id INTEGER NOT NULL,
            order_item_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            sku TEXT NOT NULL,
            product_name TEXT NOT NULL,
            location TEXT NOT NULL,
            sequence_order INTEGER NOT NULL DEFAULT 1,
            requested_qty INTEGER NOT NULL,
            picked_qty INTEGER NOT NULL DEFAULT 0,
            status TEXT NOT NULL DEFAULT 'Pending',
            FOREIGN KEY (task_id) REFERENCES picking_tasks(id) ON DELETE CASCADE,
            FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        )
        """)

        # Packing Tasks table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS packing_tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            station_id TEXT DEFAULT 'STN-1',
            station_name TEXT DEFAULT 'Packing Station 1',
            worker_id TEXT DEFAULT 'W-101',
            worker_name TEXT DEFAULT 'Sam Rivera',
            package_type TEXT DEFAULT 'Corrugated Box',
            box_size TEXT DEFAULT 'Medium (Box-M)',
            package_weight_kg REAL DEFAULT 2.5,
            status TEXT NOT NULL DEFAULT 'Queued',
            qc_status TEXT NOT NULL DEFAULT 'Pending',
            qc_notes TEXT,
            started_at TEXT,
            completed_at TEXT,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
        )
        """)

        # Exceptions table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS exceptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            exception_code TEXT UNIQUE NOT NULL,
            order_id INTEGER,
            product_id INTEGER,
            type TEXT NOT NULL,
            severity TEXT NOT NULL DEFAULT 'Medium',
            description TEXT NOT NULL,
            detected_time TEXT DEFAULT CURRENT_TIMESTAMP,
            responsible_team TEXT NOT NULL DEFAULT 'Inventory Control',
            status TEXT NOT NULL DEFAULT 'Open',
            recommended_action TEXT,
            resolution_notes TEXT,
            resolved_at TEXT,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
        )
        """)

        # Dispatches table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS dispatches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER UNIQUE NOT NULL,
            carrier TEXT NOT NULL DEFAULT 'FedEx Express',
            tracking_number TEXT UNIQUE NOT NULL,
            package_weight_kg REAL DEFAULT 2.5,
            dispatch_status TEXT NOT NULL DEFAULT 'Ready',
            dispatch_time TEXT,
            estimated_delivery TEXT,
            actual_delivery TEXT,
            notes TEXT,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
        )
        """)

        # Notifications table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            type TEXT NOT NULL DEFAULT 'info',
            severity TEXT NOT NULL DEFAULT 'medium',
            related_entity_type TEXT,
            related_entity_id INTEGER,
            is_read INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
        """)

        # Audit Logs table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            entity_type TEXT NOT NULL,
            entity_id TEXT NOT NULL,
            action TEXT NOT NULL,
            description TEXT NOT NULL,
            performed_by TEXT NOT NULL DEFAULT 'System Engine',
            timestamp TEXT DEFAULT CURRENT_TIMESTAMP
        )
        """)

        # Bottlenecks table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS bottlenecks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            stage TEXT NOT NULL,
            severity TEXT NOT NULL DEFAULT 'Moderate',
            delay_attribution_pct REAL NOT NULL DEFAULT 0.0,
            avg_latency_mins REAL NOT NULL DEFAULT 0.0,
            benchmark_mins REAL NOT NULL DEFAULT 0.0,
            message TEXT NOT NULL,
            evidence TEXT NOT NULL,
            recommendation TEXT NOT NULL,
            timestamp TEXT DEFAULT CURRENT_TIMESTAMP
        )
        """)

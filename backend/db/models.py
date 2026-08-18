from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ProductBase(BaseModel):
    sku: str
    name: str
    category: str
    unit: str = "pcs"
    unit_price: float = 0.0
    reorder_level: int = 10
    reorder_qty: int = 50
    supplier: str
    zone_code: str = "A"
    aisle: str = "01"
    bay: str = "01"
    shelf: str = "A"
    daily_demand: float = 5.0
    lead_time_days: int = 3
    weight_kg: float = 1.0
    dimensions: str = "20x15x10 cm"

class ProductCreate(ProductBase):
    initial_stock: int = 50

class ProductResponse(ProductBase):
    id: int
    current_stock: int = 0
    reserved_stock: int = 0
    damaged_stock: int = 0
    missing_stock: int = 0
    available_stock: int = 0
    status: str = "In Stock"
    days_until_stockout: float = 0.0
    recommended_reorder_qty: int = 0
    location_code: str = ""

class InventoryAdjustRequest(BaseModel):
    product_id: int
    adjustment_type: str # 'restock', 'damage', 'missing', 'count_correction'
    quantity: int
    reason: str
    reported_by: str = "Warehouse Operator"

class OrderItemCreate(BaseModel):
    product_id: int
    requested_qty: int

class OrderCreate(BaseModel):
    customer_name: str
    customer_type: str = "Standard" # VIP, Enterprise, Standard, Retail
    is_express: bool = False
    delivery_deadline: str # ISO String / Datetime string
    items: List[OrderItemCreate]
    carrier: Optional[str] = "FedEx Express"

class AllocationDecision(BaseModel):
    order_id: int
    order_number: str
    product_id: int
    sku: str
    requested_qty: int
    allocated_qty: int
    backordered_qty: int
    status: str
    priority_level: str
    reason: str
    explanation: str

class PickingTaskAction(BaseModel):
    task_id: int
    action: str # 'start', 'pick_item', 'complete', 'report_exception'
    item_id: Optional[int] = None
    picked_qty: Optional[int] = None
    notes: Optional[str] = None
    picker_name: Optional[str] = "Alex Chen"

class PackingTaskAction(BaseModel):
    task_id: int
    action: str # 'start', 'complete_qc', 'mark_packed', 'report_discrepancy'
    qc_passed: Optional[bool] = True
    qc_notes: Optional[str] = None
    box_size: Optional[str] = "Medium (Box-M)"
    package_weight_kg: Optional[float] = 2.5
    worker_name: Optional[str] = "Sam Rivera"

class ExceptionAction(BaseModel):
    exception_id: int
    action: str # 'approve_recommendation', 'investigate', 'resolve', 'reject'
    resolution_notes: Optional[str] = None
    resolved_by: Optional[str] = "Warehouse Manager"

class DispatchAction(BaseModel):
    order_id: int
    carrier: str
    tracking_number: Optional[str] = None
    notes: Optional[str] = None
    dispatched_by: Optional[str] = "Logistics Lead"

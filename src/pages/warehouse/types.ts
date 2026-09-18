export type WarehouseActiveTab = 
  | 'dashboard' 
  | 'live-fulfillment' 
  | 'alerts'
  | 'orders' 
  | 'picking' 
  | 'packing' 
  | 'quality' 
  | 'staging' 
  | 'dispatch'
  | 'inventory' 
  | 'stock-movements' 
  | 'low-stock' 
  | 'stock-counts' 
  | 'damaged'
  | 'returns' 
  | 'return-inspection' 
  | 'restocking'
  | 'map' 
  | 'zones' 
  | 'bins' 
  | 'staff' 
  | 'equipment'
  | 'analytics' 
  | 'staff-performance' 
  | 'reports'
  | 'support';

export interface WHOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  vendorName: string;
  itemCount: number;
  totalValue: number;
  priority: 'NORMAL' | 'HIGH' | 'EXPRESS';
  deliveryType: 'STANDARD' | 'SAME_DAY' | 'PICKUP';
  expressDeadline?: string;
  status: 'NEW' | 'PICKING' | 'QUALITY_CHECK' | 'PACKING' | 'STAGING' | 'READY' | 'DISPATCHED' | 'DELAYED' | 'EXCEPTION';
  assignedPicker?: string;
  assignedPacker?: string;
  timeInStage: string;
  createdAt: string;
}

export interface WHProduct {
  sku: string;
  productName: string;
  quantity: number;
  locationBin: string;
  zone: string;
  status: 'PENDING' | 'SCANNED' | 'MISSING' | 'DAMAGED';
  image: string;
}

export interface WHInventoryItem {
  sku: string;
  productName: string;
  vendorName: string;
  category: string;
  warehouseCode: string;
  zone: string;
  bin: string;
  available: number;
  reserved: number;
  damaged: number;
  reorderLevel: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'RESERVED' | 'DAMAGED';
}

export interface WHStaff {
  id: string;
  name: string;
  role: 'MANAGER' | 'SUPERVISOR' | 'PICKER' | 'PACKER' | 'QC' | 'DISPATCH' | 'INVENTORY';
  shift: 'MORNING' | 'EVENING' | 'NIGHT';
  status: 'ACTIVE' | 'BREAK' | 'OFFLINE';
  currentTask?: string;
}

export interface WHException {
  id: string;
  type: 'MISSING' | 'WRONG_ITEM' | 'DAMAGED' | 'DELAY' | 'BARCODE' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  orderId?: string;
  sku?: string;
  reportedBy: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
  createdAt: string;
}

import { WHOrder, WHInventoryItem, WHStaff, WHException } from './types';

export const mockOrders: WHOrder[] = [
  {
    id: 'o1',
    orderNumber: 'LMO-10482',
    customerName: 'Amani John',
    vendorName: 'Samsung Official',
    itemCount: 3,
    totalValue: 450000,
    priority: 'EXPRESS',
    deliveryType: 'SAME_DAY',
    expressDeadline: '45m',
    status: 'PICKING',
    assignedPicker: 'David M.',
    timeInStage: '12m',
    createdAt: '2026-08-26T09:10:00Z'
  },
  {
    id: 'o2',
    orderNumber: 'LMO-10483',
    customerName: 'Grace Shopper',
    vendorName: 'Lumo Groceries',
    itemCount: 12,
    totalValue: 125000,
    priority: 'NORMAL',
    deliveryType: 'STANDARD',
    status: 'NEW',
    timeInStage: '5m',
    createdAt: '2026-08-26T09:30:00Z'
  },
  {
    id: 'o3',
    orderNumber: 'LMO-10484',
    customerName: 'Tech Bros',
    vendorName: 'Apple Reseller',
    itemCount: 1,
    totalValue: 3200000,
    priority: 'HIGH',
    deliveryType: 'STANDARD',
    status: 'QUALITY_CHECK',
    assignedPicker: 'Sarah K.',
    timeInStage: '2m',
    createdAt: '2026-08-26T08:15:00Z'
  },
  {
    id: 'o4',
    orderNumber: 'LMO-10485',
    customerName: 'Mama Neema',
    vendorName: 'Lumo Supermarket',
    itemCount: 24,
    totalValue: 85000,
    priority: 'NORMAL',
    deliveryType: 'STANDARD',
    status: 'PACKING',
    assignedPacker: 'John D.',
    timeInStage: '15m',
    createdAt: '2026-08-26T07:45:00Z'
  },
  {
    id: 'o5',
    orderNumber: 'LMO-10486',
    customerName: 'Office Supplies Inc',
    vendorName: 'Stationery Hub',
    itemCount: 5,
    totalValue: 210000,
    priority: 'EXPRESS',
    deliveryType: 'SAME_DAY',
    expressDeadline: '1h 15m',
    status: 'STAGING',
    timeInStage: '30m',
    createdAt: '2026-08-26T07:00:00Z'
  },
  {
    id: 'o6',
    orderNumber: 'LMO-10487',
    customerName: 'Alex Runner',
    vendorName: 'Nike Official',
    itemCount: 2,
    totalValue: 380000,
    priority: 'NORMAL',
    deliveryType: 'STANDARD',
    status: 'READY',
    timeInStage: '2h',
    createdAt: '2026-08-26T05:00:00Z'
  }
];

export const mockInventory: WHInventoryItem[] = [
  { sku: 'SAM-S24-128', productName: 'Samsung Galaxy S24', vendorName: 'Samsung Official', category: 'Electronics', warehouseCode: 'DAR-01', zone: 'A', bin: 'A-03-R02-S04-B12', available: 45, reserved: 2, damaged: 0, reorderLevel: 10, status: 'IN_STOCK' },
  { sku: 'APP-IP15-256', productName: 'iPhone 15 Pro', vendorName: 'Apple Reseller', category: 'Electronics', warehouseCode: 'DAR-01', zone: 'A', bin: 'A-04-R01-S02-B05', available: 12, reserved: 5, damaged: 1, reorderLevel: 15, status: 'LOW_STOCK' },
  { sku: 'GRO-RICE-5KG', productName: 'Premium Basmati Rice 5kg', vendorName: 'Lumo Groceries', category: 'Supermarket', warehouseCode: 'DAR-01', zone: 'C', bin: 'C-10-R05-S01-B01', available: 230, reserved: 15, damaged: 2, reorderLevel: 50, status: 'IN_STOCK' },
  { sku: 'GRO-SUG-2KG', productName: 'Brown Sugar 2kg', vendorName: 'Lumo Groceries', category: 'Supermarket', warehouseCode: 'DAR-01', zone: 'C', bin: 'C-10-R06-S02-B04', available: 0, reserved: 0, damaged: 5, reorderLevel: 100, status: 'OUT_OF_STOCK' },
];

export const mockStaff: WHStaff[] = [
  { id: 's1', name: 'David M.', role: 'PICKER', shift: 'MORNING', status: 'ACTIVE', currentTask: 'Picking LMO-10482' },
  { id: 's2', name: 'Sarah K.', role: 'QC', shift: 'MORNING', status: 'ACTIVE', currentTask: 'QC LMO-10484' },
  { id: 's3', name: 'John D.', role: 'PACKER', shift: 'MORNING', status: 'BREAK' },
  { id: 's4', name: 'Amina S.', role: 'SUPERVISOR', shift: 'MORNING', status: 'ACTIVE' },
  { id: 's5', name: 'Peter P.', role: 'DISPATCH', shift: 'MORNING', status: 'ACTIVE' }
];

export const mockExceptions: WHException[] = [
  { id: 'e1', type: 'MISSING', priority: 'HIGH', orderId: 'LMO-10450', sku: 'GRO-SUG-2KG', reportedBy: 'David M.', status: 'OPEN', createdAt: '2026-08-26T08:30:00Z' },
  { id: 'e2', type: 'DAMAGED', priority: 'MEDIUM', sku: 'APP-IP15-256', reportedBy: 'Sarah K.', status: 'INVESTIGATING', createdAt: '2026-08-26T07:15:00Z' }
];

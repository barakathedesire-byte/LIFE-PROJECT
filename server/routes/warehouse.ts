import { Router, Response } from 'express';
import { db } from '../db.js';
import { AuthenticatedRequest, requireRole } from '../middleware/auth.js';
import { requireVerifiedAccount } from '../middleware/verificationGuard.js';

const router = Router();

// Router-level Warehouse RBAC Guard & Verification Enforcement
router.use(requireRole('WAREHOUSE_STAFF', 'WAREHOUSE_MANAGER', 'OPERATIONS_ADMIN', 'ADMIN', 'SUPER_ADMIN'));
router.use(requireVerifiedAccount);

// GET /api/warehouses
router.get('/', (req, res) => {
  res.json({ warehouses: db.getDb().warehouses });
});

// POST /api/warehouses (Create warehouse)
router.post('/', (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  if (!data.name || !data.city) {
    return res.status(400).json({ error: 'Warehouse name and city are required' });
  }

  const newWarehouse = {
    id: `wh-${Date.now()}`,
    name: data.name,
    code: data.code || `WH-${Date.now().toString().slice(-4)}`,
    region: data.region || data.city || 'Dar es Salaam',
    city: data.city,
    address: data.address || `${data.city} Logistics Zone`,
    capacitySqM: Number(data.capacitySqM) || 5000,
    utilizationRate: 0,
    activeZones: Array.isArray(data.activeZones) ? data.activeZones : ['Zone A', 'Zone B'],
    managerName: data.managerName || 'Operations Lead',
    phone: data.phone || data.contactPhone || '+255 700 000 000'
  };

  db.updateDb(d => {
    if (!d.warehouses) d.warehouses = [];
    d.warehouses.push(newWarehouse);
  });

  db.addAuditLog({
    userId: req.user?.id as string,
    userName: req.user?.name as string,
    userRole: req.user?.role as any,
    action: 'CREATE_WAREHOUSE',
    entityType: 'OTHER',
    entityId: newWarehouse.id,
    newValue: `Created warehouse: ${newWarehouse.name}`
  });

  res.status(201).json({ success: true, warehouse: newWarehouse });
});

// PUT /api/warehouses/:id (Update warehouse)
router.put('/:id', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  let updatedWarehouse: any = null;

  db.updateDb(d => {
    if (!d.warehouses) d.warehouses = [];
    const wh = d.warehouses.find(w => w.id === id);
    if (wh) {
      if (updates.name) wh.name = updates.name;
      if (updates.code) wh.code = updates.code;
      if (updates.city) wh.city = updates.city;
      if (updates.region) wh.region = updates.region;
      if (updates.address) wh.address = updates.address;
      if (updates.capacitySqM !== undefined) wh.capacitySqM = Number(updates.capacitySqM);
      if (updates.utilizationRate !== undefined) wh.utilizationRate = Number(updates.utilizationRate);
      if (updates.activeZones && Array.isArray(updates.activeZones)) wh.activeZones = updates.activeZones;
      if (updates.managerName) wh.managerName = updates.managerName;
      if (updates.phone || updates.contactPhone) wh.phone = updates.phone || updates.contactPhone;
      updatedWarehouse = wh;
    }
  });

  if (!updatedWarehouse) {
    return res.status(404).json({ error: 'Warehouse not found' });
  }

  db.addAuditLog({
    userId: req.user?.id as string,
    userName: req.user?.name as string,
    userRole: req.user?.role as any,
    action: 'UPDATE_WAREHOUSE',
    entityType: 'OTHER',
    entityId: id,
    newValue: `Updated warehouse: ${updatedWarehouse.name}`
  });

  res.json({ success: true, warehouse: updatedWarehouse });
});

// DELETE /api/warehouses/:id (Decommission warehouse)
router.delete('/:id', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  let removed = false;

  db.updateDb(d => {
    if (!d.warehouses) d.warehouses = [];
    const prev = d.warehouses.length;
    d.warehouses = d.warehouses.filter(w => w.id !== id);
    if (d.warehouses.length < prev) removed = true;
  });

  if (!removed) {
    return res.status(404).json({ error: 'Warehouse not found' });
  }

  db.addAuditLog({
    userId: req.user?.id as string,
    userName: req.user?.name as string,
    userRole: req.user?.role as any,
    action: 'DELETE_WAREHOUSE',
    entityType: 'OTHER',
    entityId: id,
    newValue: `Decommissioned warehouse: ${id}`
  });

  res.json({ success: true, message: 'Warehouse removed' });
});

// GET /api/warehouses/tasks
router.get('/tasks', (req: AuthenticatedRequest, res: Response) => {
  const { warehouseId, type, status } = req.query;
  let tasks = db.getDb().warehouseTasks;

  if (warehouseId) {
    tasks = tasks.filter(t => t.warehouseId === warehouseId);
  }
  if (type) {
    tasks = tasks.filter(t => t.type === type);
  }
  if (status) {
    tasks = tasks.filter(t => t.status === status);
  }

  res.json({ tasks });
});

// PATCH /api/warehouses/tasks/:id
router.patch('/tasks/:id', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, assignedToName } = req.body;

  let updated = null;
  db.updateDb(d => {
    const task = d.warehouseTasks.find(t => t.id === id);
    if (task) {
      if (status) {
        task.status = status;
        if (status === 'COMPLETED') {
          task.completedAt = new Date().toISOString();
        }
      }
      if (assignedToName) task.assignedToName = assignedToName;
      updated = task;
    }
  });

  if (!updated) {
    return res.status(404).json({ error: 'Warehouse task not found' });
  }

  res.json({ task: updated });
});

// POST /api/warehouses/adjust-stock (Authoritative ledger inventory movement)
router.post('/adjust-stock', (req: AuthenticatedRequest, res: Response) => {
  const { inventoryId, productId, quantityChange, targetAvailable, reason } = req.body;

  const currentItem = db.getDb().inventory.find(i =>
    (inventoryId && i.id === inventoryId) || (productId && i.productId === productId)
  );
  if (!currentItem) {
    return res.status(404).json({ error: 'Inventory item not found' });
  }

  let delta: number;
  if (targetAvailable !== undefined) {
    const target = Number(targetAvailable);
    if (isNaN(target) || !Number.isInteger(target) || target < 0 || target > 1000000) {
      return res.status(400).json({ error: 'Target available must be a non-negative integer between 0 and 1,000,000' });
    }
    delta = target - (currentItem.available || 0);
  } else {
    delta = Number(quantityChange);
    if (isNaN(delta) || delta === 0 || !Number.isInteger(delta)) {
      return res.status(400).json({ error: 'Valid non-zero integer quantityChange is required' });
    }
  }

  if (!reason || typeof reason !== 'string' || reason.trim().length < 5) {
    return res.status(400).json({ error: 'Audit reason (minimum 5 characters) is required for inventory adjustments' });
  }

  if ((currentItem.available || 0) + delta < 0) {
    return res.status(400).json({
      error: `Insufficient inventory: Cannot adjust by ${delta}. Current available is ${currentItem.available || 0}`
    });
  }

  if ((currentItem.available || 0) + delta > 1000000) {
    return res.status(400).json({
      error: 'Stock adjustment exceeds maximum inventory constraint of 1,000,000 units'
    });
  }

  if (delta === 0) {
    return res.json({
      success: true,
      inventory: currentItem,
      calculatedStock: currentItem.available,
      message: 'Target matches current available stock. No adjustment needed.'
    });
  }

  try {
    const result = db.recordInventoryMovement({
      productId: currentItem.productId,
      sellerId: currentItem.sellerId,
      warehouseId: currentItem.warehouseId || 'wh-dar-central',
      sku: currentItem.sku || `LM-SKU-${currentItem.productId}`,
      movementType: delta > 0 ? 'INBOUND_RECEIVED' : 'ADJUSTED_MANUAL',
      quantity: delta,
      performedByUserId: req.user?.id as string,
      performedByUserName: req.user?.name as string,
      performedByUserRole: req.user?.role as any,
      reason: reason.trim()
    });

    const updatedItem = db.getDb().inventory.find(i => i.id === currentItem.id);

    res.json({
      success: true,
      inventory: updatedItem,
      calculatedStock: result.newStock,
      movement: result.movement
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to record inventory adjustment' });
  }
});

// DELETE /api/warehouses/inventory/:sku
router.delete('/inventory/:sku', requireRole('SUPER_ADMIN', 'ADMIN', 'WAREHOUSE_STAFF', 'OPERATIONS_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { sku } = req.params;
  let removed = false;
  db.updateDb(d => {
    if (d.inventory) {
      const prev = d.inventory.length;
      d.inventory = d.inventory.filter(i => i.sku !== sku && i.id !== sku && i.productId !== sku);
      if (d.inventory.length < prev) removed = true;
    }
  });

  db.addAuditLog({
    userId: req.user?.id || 'warehouse',
    userName: req.user?.name as string,
    userRole: (req.user?.role || 'WAREHOUSE_STAFF') as any,
    action: 'DELETE_INVENTORY_ITEM',
    entityType: 'INVENTORY',
    entityId: sku,
    newValue: `Decommissioned / written off inventory item: ${sku}`
  });

  res.json({ success: true, message: `Inventory item ${sku} decommissioned successfully.` });
});

export default router;

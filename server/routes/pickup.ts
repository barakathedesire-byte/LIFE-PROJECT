import * as crypto from 'crypto';
import { Router, Response } from 'express';
import { db } from '../db.js';
import { AuthenticatedRequest, requireRole } from '../middleware/auth.js';
import { requireVerifiedAccount, isUserVerified } from '../middleware/verificationGuard.js';
import { PickupStation } from '../../src/types/index.js';

import { generateSecureId } from '../utils/security.js';

const router = Router();

// GET /api/pickup/regions (Canonical Tanzania regions & active station counts)
router.get('/regions', (_req, res: Response) => {
  const canonicalRegions = [
    'Dar es Salaam',
    'Arusha',
    'Mwanza',
    'Dodoma',
    'Mbeya',
    'Kilimanjaro',
    'Tanga',
    'Morogoro',
    'Zanzibar'
  ];

  const stations = db.getDb().pickupStations || [];
  const regionData = canonicalRegions.map(region => {
    const activeCount = stations.filter(s => s.region.toLowerCase() === region.toLowerCase() && s.status === 'ACTIVE').length;
    const totalCount = stations.filter(s => s.region.toLowerCase() === region.toLowerCase()).length;
    return {
      region,
      activeCount,
      totalCount,
      hasFreePickup: true
    };
  });

  res.json({ regions: regionData });
});

// GET /api/pickup/stations (List pickup stations filtered by region)
router.get('/stations', (req, res: Response) => {
  const { region, status = 'ACTIVE' } = req.query;
  let stations = db.getDb().pickupStations || [];

  if (region && String(region).trim() !== '') {
    stations = stations.filter(s => s.region.toLowerCase() === String(region).toLowerCase());
  }

  if (status && status !== 'ALL') {
    stations = stations.filter(s => s.status === status);
  }

  res.json({ stations });
});

// POST /api/pickup/stations (Create or register pickup station - Admin only)
router.post('/stations', requireRole('SUPER_ADMIN', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;

  if (!data.name || !data.region || !data.area || !data.streetAddress || !data.contactPhone) {
    return res.status(400).json({ error: 'Name, region, area, streetAddress, and contactPhone are required.' });
  }

  const newStation: PickupStation = {
    id: generateSecureId('ps'),
    name: data.name,
    region: data.region,
    district: data.district || undefined,
    area: data.area,
    streetAddress: data.streetAddress,
    contactName: data.contactName || 'Station Manager',
    contactPhone: data.contactPhone,
    operatingHours: data.operatingHours || '08:00 - 20:00',
    capacityPackages: Number(data.capacityPackages) || 500,
    currentPackages: 0,
    status: 'ACTIVE',
    fee: Number(data.fee) || 0,
    landmark: data.landmark || undefined,
    createdAt: new Date().toISOString(),
    approvedAt: new Date().toISOString()
  };

  db.updateDb(d => {
    if (!d.pickupStations) d.pickupStations = [];
    d.pickupStations.unshift(newStation);
  });

  db.addAuditLog({
    userId: req.user!.id,
    userName: req.user!.name,
    userRole: req.user!.role as any,
    action: 'CREATE_PICKUP_STATION',
    entityType: 'OTHER',
    entityId: newStation.id,
    newValue: `Station: ${newStation.name} (${newStation.region})`
  });

  res.status(201).json({ station: newStation });
});

// PATCH /api/pickup/stations/:id/status (Admin approve/activate/suspend pickup station)
router.patch('/stations/:id/status', requireRole('SUPER_ADMIN', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, fee } = req.body;

  let updated: PickupStation | null = null;
  db.updateDb(d => {
    const station = (d.pickupStations || []).find(s => s.id === id);
    if (station) {
      if (status) station.status = status;
      if (typeof fee === 'number') station.fee = fee;
      if (status === 'ACTIVE' && !station.approvedAt) {
        station.approvedAt = new Date().toISOString();
      }
      updated = station;
    }
  });

  if (!updated) {
    return res.status(404).json({ error: 'Pickup station not found' });
  }

  res.json({ station: updated });
});

// PUT /api/pickup/stations/:id (Edit pickup station details)
router.put('/stations/:id', requireRole('SUPER_ADMIN', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  let updated: PickupStation | null = null;
  db.updateDb(d => {
    const station = (d.pickupStations || []).find(s => s.id === id);
    if (station) {
      if (updates.name) station.name = updates.name;
      if (updates.region) station.region = updates.region;
      if (updates.district !== undefined) station.district = updates.district;
      if (updates.area) station.area = updates.area;
      if (updates.streetAddress) station.streetAddress = updates.streetAddress;
      if (updates.contactName) station.contactName = updates.contactName;
      if (updates.contactPhone) station.contactPhone = updates.contactPhone;
      if (updates.operatingHours) station.operatingHours = updates.operatingHours;
      if (updates.capacityPackages !== undefined) station.capacityPackages = Number(updates.capacityPackages);
      if (updates.fee !== undefined) station.fee = Number(updates.fee);
      if (updates.status) station.status = updates.status;
      if (updates.landmark !== undefined) station.landmark = updates.landmark;
      updated = station;
    }
  });

  if (!updated) {
    return res.status(404).json({ error: 'Pickup station not found' });
  }

  db.addAuditLog({
    userId: req.user?.id as string,
    userName: req.user?.name as string,
    userRole: req.user?.role as any,
    action: 'UPDATE_PICKUP_STATION',
    entityType: 'OTHER',
    entityId: id,
    newValue: `Updated pickup station ${(updated as any).name}`
  });

  res.json({ success: true, station: updated });
});

// DELETE /api/pickup/stations/:id (Delete or deactivate pickup station)
router.delete('/stations/:id', requireRole('SUPER_ADMIN', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  let removed = false;

  db.updateDb(d => {
    if (!d.pickupStations) d.pickupStations = [];
    const prev = d.pickupStations.length;
    d.pickupStations = d.pickupStations.filter(s => s.id !== id);
    if (d.pickupStations.length < prev) removed = true;
  });

  if (!removed) {
    return res.status(404).json({ error: 'Pickup station not found' });
  }

  db.addAuditLog({
    userId: req.user?.id as string,
    userName: req.user?.name as string,
    userRole: req.user?.role as any,
    action: 'DELETE_PICKUP_STATION',
    entityType: 'OTHER',
    entityId: id,
    newValue: `Decommissioned pickup station ${id}`
  });

  res.json({ success: true, message: 'Pickup station deleted' });
});

// GET /api/pickup/inventory
router.get('/inventory', requireVerifiedAccount, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'OPERATIONS_ADMIN', 'PICKUP_OPERATOR', 'PICKUP_STATION_STAFF', 'PICKUP_STATION_MANAGER'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Access Denied: Pickup inventory is restricted to station operators and administrators.' });
  }

  const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'OPERATIONS_ADMIN'].includes(req.user.role);
  if (!isAdmin && !isUserVerified(req.user)) {
    return res.status(403).json({
      error: 'VERIFICATION_REQUIRED',
      message: 'Pickup station operator account must be verified before accessing inventory.'
    });
  }

  const stationId = isAdmin ? (req.query.stationId as string || req.user.pickupStationId) : req.user.pickupStationId;
  
  if (!stationId) {
    return res.status(403).json({ error: 'Pickup station assignment required.' });
  }

  const inventory = (db.getDb().pickupInventory || []).filter(p => p.stationId === stationId);
  res.json({ inventory });
});

// POST /api/pickup/handover (Strict OTP-verified package handover)
router.post('/handover', requireVerifiedAccount, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'OPERATIONS_ADMIN', 'PICKUP_OPERATOR', 'PICKUP_STATION_STAFF', 'PICKUP_STATION_MANAGER'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Access Denied: Pickup handover must be performed by authorized station staff.' });
  }

  const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'OPERATIONS_ADMIN'].includes(req.user.role);
  if (!isAdmin && !isUserVerified(req.user)) {
    return res.status(403).json({
      error: 'VERIFICATION_REQUIRED',
      message: 'Pickup station operator account must be verified before processing package handover.'
    });
  }

  const { packageId, otpCode } = req.body;
  if (!packageId || !otpCode) {
    return res.status(400).json({ error: 'Package ID and verification OTP are required.' });
  }

  const stationId = req.user.pickupStationId;

  const dbData = db.getDb();
  const pkg = (dbData.pickupInventory || []).find(p => p.id === packageId);

  if (!pkg) {
    return res.status(404).json({ error: 'Package not found in pickup inventory.' });
  }

  if (!isAdmin && pkg.stationId !== stationId) {
    return res.status(403).json({ error: 'Access Denied: This package belongs to a different pickup station.' });
  }

  if (pkg.status === 'COLLECTED') {
    return res.status(400).json({ error: 'This package has already been collected.' });
  }

  if (pkg.expiresAt && new Date(pkg.expiresAt).getTime() < Date.now()) {
    return res.status(400).json({ error: 'Pickup verification OTP has expired. Please contact support.' });
  }

  if (pkg.otpCode && pkg.otpCode.trim() !== String(otpCode).trim()) {
    return res.status(400).json({ error: 'Invalid pickup verification OTP.' });
  }

  // Verification successful: burn OTP, mark collected, and update linked order
  let updatedPkg: any = null;
  const timestamp = new Date().toISOString();

  db.updateDb(d => {
    const target = (d.pickupInventory || []).find(p => p.id === packageId);
    if (target) {
      target.status = 'COLLECTED';
      target.collectedAt = timestamp;
      target.otpCode = ''; // Single-use OTP burned
      updatedPkg = target;

      // Update linked order
      const order = d.orders.find(o => o.id === target.orderId || o.orderNumber === target.orderNumber);
      if (order) {
        order.status = 'Delivered';
        order.otpStatus = 'VERIFIED';
        order.paymentReleased = true;
        order.paymentReleasedAt = timestamp;
        order.statusHistory.push({
          status: 'Delivered',
          date: timestamp.replace('T', ' ').substring(0, 16),
          note: `Customer collected package from ${target.stationName}. Verified via secure pickup OTP.`
        });
      }
    }
  });

  db.addAuditLog({
    userId: req.user.id,
    userName: req.user.name || 'Station Operator',
    userRole: req.user.role as any,
    action: 'PICKUP_PACKAGE_HANDOVER',
    entityType: 'ORDER',
    entityId: pkg.orderId || pkg.id,
    newValue: `Package ${pkg.orderNumber} collected at station ${pkg.stationName}`
  });

  res.json({ success: true, package: updatedPkg });
});

// POST /api/pickup/receive-package
router.post('/receive-package', requireVerifiedAccount, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'OPERATIONS_ADMIN', 'PICKUP_OPERATOR', 'PICKUP_STATION_STAFF', 'PICKUP_STATION_MANAGER'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Access Denied: Only authorized station staff may receive packages.' });
  }

  const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'OPERATIONS_ADMIN'].includes(req.user.role);
  if (!isAdmin && !isUserVerified(req.user)) {
    return res.status(403).json({
      error: 'VERIFICATION_REQUIRED',
      message: 'Pickup station operator account must be verified before receiving packages.'
    });
  }

  const { stationId, orderId, orderNumber, customerName, customerPhone, shelfLocation } = req.body;

  const targetStationId = isAdmin ? (stationId || req.user.pickupStationId) : req.user.pickupStationId;
  if (!targetStationId) {
    return res.status(403).json({ error: 'Pickup station assignment required.' });
  }


  const targetOrderId = orderId || orderNumber;
  if (targetOrderId) {
    const order = db.getDb().orders?.find(o => o.id === targetOrderId || o.orderNumber === targetOrderId);
    if (order) {
      const orderStationId = (order.deliveryMethod as any)?.pickupStationId || (order.deliveryMethod as any)?.stationId;
      if (!orderStationId) {
        return res.status(400).json({ error: 'Order is not configured for pickup station delivery.' });
      }
      if (orderStationId !== targetStationId) {
        return res.status(403).json({ error: 'Order is assigned to a different pickup station.' });
      }
    }
  }

  // Cryptographically secure 6-digit OTP
  const secureOtp = String(crypto.randomInt(100000, 1000000));

  const newPackage = {
    id: generateSecureId('pinv'),
    stationId: targetStationId,
    stationName: 'LUMO Station Hub',
    orderId: generateSecureId('ord'),
    orderNumber: orderNumber || `LM-${crypto.randomInt(1000, 10000)}-TZ`,
    customerName: customerName || 'Customer',
    customerPhone: customerPhone || '+255 700 000 000',
    shelfLocation: shelfLocation || 'Shelf A-01',
    packageCount: 1,
    receivedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000 * 5).toISOString(),
    status: 'READY_FOR_PICKUP' as const,
    otpCode: secureOtp
  };

  db.updateDb(d => {
    if (!d.pickupInventory) d.pickupInventory = [];
    d.pickupInventory.unshift(newPackage);
  });

  res.status(201).json({ package: newPackage });
});

// DELETE /api/pickup/inventory/:id
router.delete('/inventory/:id', requireVerifiedAccount, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'OPERATIONS_ADMIN', 'PICKUP_OPERATOR', 'PICKUP_STATION_STAFF', 'PICKUP_STATION_MANAGER'];
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Access Denied: Insufficient permissions to remove pickup inventory.' });
  }

  let removed = false;
  db.updateDb(d => {
    if (d.pickupInventory) {
      const prev = d.pickupInventory.length;
      d.pickupInventory = d.pickupInventory.filter(p => p.id !== id && p.orderId !== id);
      if (d.pickupInventory.length < prev) removed = true;
    }
  });

  db.addAuditLog({
    userId: req.user.id,
    userName: req.user.name,
    userRole: req.user.role as any,
    action: 'DELETE_PICKUP_PACKAGE',
    entityType: 'OTHER',
    entityId: id,
    newValue: `Removed pickup package ${id}`
  });

  res.json({ success: true, message: 'Pickup package removed successfully' });
});

// DELETE /api/pickup/staff/:id
router.delete('/staff/:id', requireRole('SUPER_ADMIN', 'ADMIN', 'OPERATIONS_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  db.updateDb((d: any) => {
    if (d.stationStaff) {
      d.stationStaff = d.stationStaff.filter((s: any) => s.id !== id);
    }
  });
  res.json({ success: true, message: 'Station staff removed successfully' });
});

export default router;

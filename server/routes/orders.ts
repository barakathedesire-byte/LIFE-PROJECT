import * as crypto from 'crypto';
import { Router, Response } from 'express';
import { db } from '../db.js';
import { AuthenticatedRequest, requireAuth, requireVerified } from '../middleware/auth.js';
import { isUserVerified } from '../middleware/verificationGuard.js';
import { Order, OrderStatus, UserRole, UserAccount } from '../../src/types/index.js';
import { generateSecureOtp, generateSecureId } from '../utils/security.js';

const router = Router();

// Protect ALL order routes with backend authentication
router.use(requireAuth);

/**
 * Valid canonical order status transitions (State Machine).
 * Enforces correct sequential lifecycle from creation to delivery/cancellation.
 */
const VALID_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  Pending: ['Processing', 'Confirmed', 'Cancelled'],
  Processing: ['Confirmed', 'Preparing', 'Packaged', 'Cancelled'],
  Confirmed: ['Preparing', 'Packaged', 'Dispatched', 'Ready for Pickup', 'Cancelled'],
  Preparing: ['Packaged', 'Ready for Pickup', 'Dispatched', 'Cancelled'],
  Packaged: ['Dispatched', 'Ready for Pickup', 'In Transit', 'Cancelled'],
  'Ready for Pickup': ['Delivered', 'Pickup Failed', 'Returned', 'Cancelled'],
  Dispatched: ['In Transit', 'Out for Delivery', 'Delivery Failed', 'Cancelled'],
  Shipped: ['In Transit', 'Out for Delivery', 'Delivered', 'Delivery Failed', 'Cancelled'],
  'In Transit': ['Out for Delivery', 'Delivered', 'Delivery Failed', 'Ready for Pickup'],
  'Out for Delivery': ['Delivered', 'Delivery Failed', 'Returned'],
  Delivered: ['Returned'],
  Cancelled: [],
  'Delivery Failed': ['In Transit', 'Out for Delivery', 'Returned', 'Cancelled'],
  'Pickup Failed': ['Returned', 'Cancelled'],
  Returned: [],
  PLANTED: []
};

const KNOWN_ORDER_STATUSES: OrderStatus[] = [
  'Pending',
  'Processing',
  'Confirmed',
  'Preparing',
  'Packaged',
  'Ready for Pickup',
  'Shipped',
  'Dispatched',
  'In Transit',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
  'Delivery Failed',
  'Pickup Failed',
  'Returned',
  'PLANTED'
];

export interface OrderAccessCheck {
  allowed: boolean;
  isOwnerCustomer: boolean;
  isVendorForOrder: boolean;
  isAssignedRider: boolean;
  isWarehouseActor: boolean;
  isPickupActor: boolean;
  isAdminStaff: boolean;
  reason?: string;
}

/**
 * Authoritative Order Access Verification.
 * Resolves ownership and assignments strictly from authenticated session and verified DB assignments.
 * Never trusts client-supplied customer/seller/rider identities.
 */
export function verifyOrderAccess(user: UserAccount, order: Order): OrderAccessCheck {
  const adminRoles: (UserRole | string)[] = [
    'SUPER_ADMIN',
    'ADMIN',
    'OPERATIONS_ADMIN',
    'FINANCE_ADMIN',
    'FINANCE_OFFICER',
    'ACCOUNTING_STAFF',
    'CUSTOMER_SUPPORT',
    'SUPPORT_AGENT',
    'CUSTOMER_CARE',
    'CATALOG_ADMIN'
  ];

  const isAdminStaff = adminRoles.includes(user.role);

  // 1. Owner Customer Verification
  // Check against authoritative authenticated user id and email
  const isOwnerCustomer = Boolean(
    (order.customerId && order.customerId === user.id) ||
    ((order.customer as any)?.id && (order.customer as any).id === user.id) ||
    (order.customer?.email && order.customer.email.toLowerCase() === user.email.toLowerCase()) ||
    ((order as any).customerEmail && (order as any).customerEmail.toLowerCase() === user.email.toLowerCase())
  );

  // 2. Vendor Verification
  // Resolve seller identity strictly from authenticated user.sellerId (or user.id if seller)
  let isVendorForOrder = false;
  if (user.role === 'SELLER' || user.role === 'SELLER_STAFF' || user.sellerId) {
    const verifiedSellerId = user.sellerId;
    const sellerRecord = verifiedSellerId ? db.getDb().sellers.find(s => s.id === verifiedSellerId) : null;
    const sellerName = (sellerRecord?.name || '').toLowerCase();

    isVendorForOrder = (order.items || []).some(item =>
      (verifiedSellerId && (item as any).sellerId === verifiedSellerId) ||
      ((order as any).sellerId && (order as any).sellerId === verifiedSellerId) ||
      (sellerName && (item.sellerName || '').toLowerCase() === sellerName)
    );
  }

  // 3. Delivery Agent (Rider) Assignment Verification
  // Must be verified against authoritative delivery tasks and runs in DB, never client identity
  let isAssignedRider = false;
  if (user.role === 'DELIVERY_AGENT') {
    const allDeliveryTasks = db.getDb().deliveryTasks || [];
    const allDeliveryRuns = db.getDb().deliveryRuns || [];
    const agentRunIds = new Set(allDeliveryRuns.filter(r => r.agentId === user.id).map(r => r.id));

    const isAssignedInTask = allDeliveryTasks.some(t =>
      (t.orderId === order.id || t.orderNumber === order.orderNumber) &&
      (t.riderId === user.id || (t as any).agentId === user.id || (t.deliveryRunId && agentRunIds.has(t.deliveryRunId)))
    );
    const isDirectRider = (order as any).riderId === user.id || (order.deliveryMethod as any)?.riderId === user.id;

    isAssignedRider = isAssignedInTask || isDirectRider;
  }

  // 4. Warehouse Actor
  let isWarehouseActor = false;
  if (user.role === 'WAREHOUSE_STAFF' || user.role === 'WAREHOUSE_MANAGER') {
    const warehouseTasks = db.getDb().warehouseTasks || [];
    const hasWarehouseTask = warehouseTasks.some(wt =>
      (wt.orderId === order.id || wt.orderNumber === order.orderNumber) &&
      (!user.warehouseId || wt.warehouseId === user.warehouseId)
    );
    isWarehouseActor = hasWarehouseTask || !user.warehouseId;
  }

  // 5. Pickup Station Operator
  let isPickupActor = false;
  if (user.role === 'PICKUP_OPERATOR' || user.role === 'PICKUP_STATION_STAFF' || user.role === 'PICKUP_STATION_MANAGER') {
    if (order.deliveryMethod?.type === 'pickup') {
      const stationId = order.deliveryMethod.pickupStationId;
      isPickupActor = !user.pickupStationId || user.pickupStationId === stationId;
    }
  }

  const allowed = isAdminStaff || isOwnerCustomer || isVendorForOrder || isAssignedRider || isWarehouseActor || isPickupActor;

  return {
    allowed,
    isOwnerCustomer,
    isVendorForOrder,
    isAssignedRider,
    isWarehouseActor,
    isPickupActor,
    isAdminStaff
  };
}

/**
 * Validate whether an actor role is authorized to perform the requested status transition.
 */
function isRoleAuthorizedForStatus(
  userRole: UserRole | string,
  targetStatus: OrderStatus,
  currentStatus: OrderStatus,
  _access: OrderAccessCheck
): { authorized: boolean; reason?: string } {
  // Super Admin & Admin have broad operational authority, still bound to valid transitions
  if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'OPERATIONS_ADMIN') {
    return { authorized: true };
  }

  // Customer:
  // - Can ONLY transition to 'Cancelled'
  // - And ONLY if order is in cancellable initial stage
  if (userRole === 'CUSTOMER') {
    if (targetStatus !== 'Cancelled') {
      return {
        authorized: false,
        reason: `Customers are not authorized to set status to '${targetStatus}'. Only cancellation is permitted.`
      };
    }
    const cancellableByCustomer: OrderStatus[] = ['Pending', 'Processing', 'Confirmed'];
    if (!cancellableByCustomer.includes(currentStatus)) {
      return {
        authorized: false,
        reason: `Order is already '${currentStatus}' and can no longer be cancelled directly by customer.`
      };
    }
    return { authorized: true };
  }

  // Seller / Seller Staff:
  // - Permitted: 'Confirmed', 'Preparing', 'Packaged', 'Dispatched', 'Ready for Pickup', 'Cancelled'
  // - Prohibited: 'In Transit', 'Out for Delivery', 'Delivered', 'Delivery Failed'
  if (userRole === 'SELLER' || userRole === 'SELLER_STAFF') {
    const sellerAllowedStatuses: OrderStatus[] = [
      'Confirmed',
      'Preparing',
      'Packaged',
      'Dispatched',
      'Ready for Pickup',
      'Cancelled'
    ];
    if (!sellerAllowedStatuses.includes(targetStatus)) {
      return {
        authorized: false,
        reason: `Merchants are only authorized to update merchant fulfillment stages (${sellerAllowedStatuses.join(', ')}), not '${targetStatus}'.`
      };
    }
    return { authorized: true };
  }

  // Delivery Agent (Rider):
  // - Permitted: 'In Transit', 'Out for Delivery', 'Delivered', 'Delivery Failed'
  // - Prohibited: 'Processing', 'Confirmed', 'Preparing', 'Packaged', 'Cancelled'
  if (userRole === 'DELIVERY_AGENT') {
    const riderAllowedStatuses: OrderStatus[] = [
      'In Transit',
      'Out for Delivery',
      'Delivered',
      'Delivery Failed'
    ];
    if (!riderAllowedStatuses.includes(targetStatus)) {
      return {
        authorized: false,
        reason: `Delivery agents are only authorized to update courier delivery stages (${riderAllowedStatuses.join(', ')}), not '${targetStatus}'.`
      };
    }
    return { authorized: true };
  }

  // Warehouse Staff / Manager:
  // - Permitted: 'Preparing', 'Packaged', 'Dispatched', 'Ready for Pickup'
  if (userRole === 'WAREHOUSE_STAFF' || userRole === 'WAREHOUSE_MANAGER') {
    const whAllowedStatuses: OrderStatus[] = [
      'Preparing',
      'Packaged',
      'Dispatched',
      'Ready for Pickup'
    ];
    if (!whAllowedStatuses.includes(targetStatus)) {
      return {
        authorized: false,
        reason: `Warehouse personnel are only authorized to update warehouse packing stages (${whAllowedStatuses.join(', ')}), not '${targetStatus}'.`
      };
    }
    return { authorized: true };
  }

  // Pickup Station Operator:
  // - Permitted: 'Ready for Pickup', 'Delivered', 'Pickup Failed', 'Returned'
  if (userRole === 'PICKUP_OPERATOR' || userRole === 'PICKUP_STATION_STAFF' || userRole === 'PICKUP_STATION_MANAGER') {
    const pickupAllowedStatuses: OrderStatus[] = [
      'Ready for Pickup',
      'Delivered',
      'Pickup Failed',
      'Returned'
    ];
    if (!pickupAllowedStatuses.includes(targetStatus)) {
      return {
        authorized: false,
        reason: `Pickup station operators are only authorized to update pickup parcel statuses (${pickupAllowedStatuses.join(', ')}), not '${targetStatus}'.`
      };
    }
    return { authorized: true };
  }

  // Customer Support / Support Agent / Customer Care:
  // - Permitted: 'Cancelled', 'Returned'
  if (userRole === 'CUSTOMER_SUPPORT' || userRole === 'SUPPORT_AGENT' || userRole === 'CUSTOMER_CARE') {
    const supportAllowedStatuses: OrderStatus[] = ['Cancelled', 'Returned'];
    if (!supportAllowedStatuses.includes(targetStatus)) {
      return {
        authorized: false,
        reason: `Customer support agents may only cancel or initiate returns, not set '${targetStatus}'.`
      };
    }
    return { authorized: true };
  }

  return {
    authorized: false,
    reason: `Role '${userRole}' is not authorized to update order status.`
  };
}

// GET /api/orders (List orders scoped to authenticated user role and ownership)
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let orders = [...db.getDb().orders];

  if (user.role === 'CUSTOMER') {
    // Customers can ONLY ever see their own orders.
    // Any query params attempting to view other sellers/customers are strictly blocked.
    orders = orders.filter(o =>
      (o.customerId && o.customerId === user.id) ||
      ((o.customer as any)?.id && (o.customer as any).id === user.id) ||
      (o.customer?.email && o.customer.email.toLowerCase() === user.email.toLowerCase()) ||
      ((o as any).customerEmail && (o as any).customerEmail.toLowerCase() === user.email.toLowerCase())
    ).map(o => ({
      ...o,
      customerId: o.customerId || user.id
    }));
  } else if (user.role === 'SELLER' || user.role === 'SELLER_STAFF' || user.sellerId) {
    // Sellers can ONLY see orders containing their products.
    // Resolve sellerId strictly from authenticated user.sellerId (never client query)
    const verifiedSellerId = user.sellerId;
    const sellerRecord = verifiedSellerId ? db.getDb().sellers.find(s => s.id === verifiedSellerId) : null;
    const sellerName = (sellerRecord?.name || '').toLowerCase();

    orders = orders.filter(o =>
      o.items.some(item =>
        (verifiedSellerId && (item as any).sellerId === verifiedSellerId) ||
        ((o as any).sellerId && (o as any).sellerId === verifiedSellerId) ||
        (sellerName && (item.sellerName || '').toLowerCase().includes(sellerName)) ||
        (sellerName && sellerName.includes((item.sellerName || '').toLowerCase()))
      )
    );
  } else if (user.role === 'DELIVERY_AGENT') {
    // Riders can only see orders where a delivery task is assigned to them
    const allDeliveryTasks = db.getDb().deliveryTasks || [];
    const assignedOrderIds = new Set(
      allDeliveryTasks
        .filter(t => t.riderId === user.id || (t as any).agentId === user.id)
        .map(t => t.orderId)
    );
    orders = orders.filter(o => assignedOrderIds.has(o.id) || (o as any).riderId === user.id);
  } else if (user.role === 'WAREHOUSE_STAFF' || user.role === 'WAREHOUSE_MANAGER') {
    // Warehouse staff see orders with warehouse tasks in their facility
    if (user.warehouseId) {
      const warehouseTasks = db.getDb().warehouseTasks || [];
      const assignedOrderIds = new Set(
        warehouseTasks
          .filter(wt => wt.warehouseId === user.warehouseId)
          .map(wt => wt.orderId)
      );
      orders = orders.filter(o => assignedOrderIds.has(o.id));
    }
  } else {
    // Admin / Operations / Support / Finance can view all orders
    const sellerIdQuery = req.query.sellerId as string;
    if (sellerIdQuery) {
      const seller = db.getDb().sellers.find(s => s.id === sellerIdQuery);
      const sellerName = (seller?.name || '').toLowerCase();
      orders = orders.filter(o =>
        o.items.some(item =>
          (item as any).sellerId === sellerIdQuery ||
          (item.sellerName || '').toLowerCase().includes(sellerName) ||
          (sellerName && sellerName.includes((item.sellerName || '').toLowerCase()))
        )
      );
    }
  }

  res.json({ orders });
});

// GET /api/orders/:id (Retrieve specific order with IDOR protection)
router.get('/:id', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const order = db.getDb().orders.find(o => o.id === req.params.id || o.orderNumber === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // Authoritative IDOR Authorization Guard
  const access = verifyOrderAccess(user, order);
  if (!access.allowed) {
    return res.status(403).json({
      error: 'Access Denied: You do not have authorization to view this order details.'
    });
  }

  res.json({ order });
});

// POST /api/orders (Create multi-vendor order with authenticated identity derivation)
router.post('/', (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  const authUser = req.user!;
  const idempotencyKey = req.headers['x-idempotency-key'] || data.idempotencyKey;

  if (idempotencyKey) {
    const existingKey = (db.getDb() as any).idempotencyKeys?.find(
      (k: any) => k.actorId === authUser.id && k.idempotencyKey === String(idempotencyKey)
    );
    if (existingKey) {
      return res.status(201).json(JSON.parse(existingKey.responseJson));
    }
  }

  // Resolve authoritative customer identity strictly from authenticated session
  const customerRecord = db.findUserById(authUser.id) || authUser;
  const customerId = customerRecord.id;
  const customerName = customerRecord.name;
  const customerEmail = customerRecord.email;
  const customerPhone = customerRecord.phone || data.deliveryAddress?.phone || '';

  // Check COD Risk Rule threshold strictly using authenticated user record
  const codRule = (db.getDb().builderConfig?.businessRules || []).find((r: any) => r?.category === 'Payment COD Risk');
  const threshold = (codRule && codRule.threshold) ? Number(codRule.threshold) : 2;

  const inTransitCancellations = (customerRecord as any)?.inTransitCancellations || 0;
  const failedPickupCount = (customerRecord as any)?.failedPickupCount || (customerRecord?.uncollectedPickupCount || 0);
  const totalFailures = inTransitCancellations + failedPickupCount;

  const isCodRestricted = Boolean(
    (customerRecord as any)?.isCodRestricted ||
    customerRecord?.isHighRiskFlagged ||
    totalFailures >= threshold ||
    (customerRecord?.cancellationCount && customerRecord.cancellationCount >= threshold)
  );

  // If customer is COD restricted, COD payment is blocked server-side
  if (isCodRestricted && (data.paymentMethod?.type === 'cod' || data.paymentMethod?.name?.toLowerCase().includes('delivery'))) {
    return res.status(400).json({
      error: `Pay on Delivery (COD) is locked for this account due to ${threshold} past in-transit cancellations or uncollected pickup station parcels. Immediate online payment via Mobile Money or Card is required.`
    });
  }

  // Authoritative server-side price calculation and stock validation (Ignore client price manipulation)
  const validatedItems = [];
  let calculatedSubtotal = 0;
  for (const item of data.items || []) {
    const productRecord = db.getDb().products.find(p => p.id === item.productId);
    if (!productRecord) {
      return res.status(400).json({ error: `Product not found: ${item.productId}` });
    }
    const authoritativePrice = Number(productRecord.price);
    const qty = Number(item.quantity) || 1;
    const availStock = db.getCalculatedStock(item.productId);
    if (qty > availStock) {
      return res.status(400).json({
        error: `Insufficient stock for '${productRecord.name}'. Available stock: ${availStock}, requested: ${qty}. Please adjust quantity.`
      });
    }
    calculatedSubtotal += authoritativePrice * qty;
    validatedItems.push({
      ...item,
      price: authoritativePrice,
      productName: productRecord.name,
      sellerId: productRecord.sellerId,
      sellerName: productRecord.sellerName,
      thumbnail: productRecord.thumbnail || item.thumbnail
    });
  }

  // Authoritative Backend Delivery Fee Calculation & Pickup Station Validation
  const deliveryCalc = db.calculateDeliveryFeeServer({
    region: data.deliveryAddress?.region || 'Dar es Salaam',
    district: data.deliveryAddress?.district,
    subtotal: calculatedSubtotal,
    deliveryType: data.deliveryMethod?.type || 'standard',
    pickupStationId: data.deliveryMethod?.pickupStationId
  });

  const finalDeliveryFee = deliveryCalc.fee;
  const finalTotal = calculatedSubtotal + finalDeliveryFee - (data.pricing?.discount || 0);

  // If pickup station delivery, validate station in database
  let verifiedPickupStation: any = null;
  if (data.deliveryMethod?.type === 'pickup' && data.deliveryMethod?.pickupStationId) {
    verifiedPickupStation = (db.getDb().pickupStations || []).find(
      s => s.id === data.deliveryMethod.pickupStationId && s.status === 'ACTIVE'
    );
    if (!verifiedPickupStation) {
      return res.status(400).json({
        error: 'The selected pickup station is currently unavailable or unverified in this region.'
      });
    }
  }

  const orderNumber = `LM-${crypto.randomInt(1000, 10000)}-TZ`;
  const trackingNumber = `LM-TZ-${crypto.randomInt(1000000, 10000000)}-EXP`;

  const isCodOrder = data.paymentMethod?.type === 'cod';
  const initialPaymentStatus = isCodRestricted
    ? 'Paid (Direct Merchant Remittance)'
    : (isCodOrder ? 'Pending on Delivery' : (data.paymentMethod?.status || 'Paid (Escrow Secured)'));

  // Construct new order using authenticated user identity exclusively and validated items
  const newOrder: Order = {
    id: generateSecureId('ord'),
    orderNumber,
    createdAt: new Date().toISOString(),
    customerId,
    customerName,
    customerEmail,
    customerPhone,
    customer: {
      id: customerId,
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      cancellationCount: customerRecord?.cancellationCount ?? (isCodRestricted ? 3 : 0),
      uncollectedPickupCount: customerRecord?.uncollectedPickupCount ?? (isCodRestricted ? 2 : 0),
      reliabilityScore: customerRecord?.reliabilityScore ?? (isCodRestricted ? 28 : 98),
      isHighRiskFlagged: isCodRestricted,
      flagReason: isCodRestricted ? 'Order cancellations while in transit or uncollected parcels' : undefined
    },
    items: validatedItems,
    deliveryAddress: data.deliveryAddress,
    deliveryMethod: verifiedPickupStation ? {
      type: 'pickup',
      name: verifiedPickupStation.name,
      fee: verifiedPickupStation.fee,
      estimatedDelivery: '1-2 Days (Pickup Station)',
      pickupStationId: verifiedPickupStation.id,
      pickupStationName: verifiedPickupStation.name,
      pickupStationAddress: `${verifiedPickupStation.streetAddress}, ${verifiedPickupStation.area}, ${verifiedPickupStation.region}`
    } : {
      ...data.deliveryMethod,
      fee: finalDeliveryFee
    },
    paymentMethod: {
      ...data.paymentMethod,
      status: initialPaymentStatus
    },
    pricing: {
      subtotal: calculatedSubtotal,
      deliveryFee: finalDeliveryFee,
      discount: data.pricing?.discount || 0,
      escrowFee: 0,
      total: finalTotal
    },
    status: 'Processing',
    statusHistory: [
      {
        status: 'Processing',
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        note: isCodRestricted
          ? `Direct upfront payment secured. Escrow protection waived due to buyer cancellation history. Funds credited to merchant.`
          : (isCodOrder
            ? `Order placed with Pay on Delivery (Cash: TZS ${finalTotal.toLocaleString()}). Physical cash will be collected and reconciled by courier upon delivery.`
            : `Order placed via ${data.paymentMethod?.name || 'Mobile Money'} & secured under LUMO Escrow Protection.`)
      }
    ],
    trackingNumber,
    estimatedDeliveryDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    isDirectVendorPayout: isCodRestricted,
    escrowBypassed: isCodRestricted,
    otpCode: String(crypto.randomInt(100000, 1000000)),
    otpStatus: 'ACTIVE',
    otpExpiresAt: new Date(Date.now() + 86400000 * 3).toISOString(),
    otpAttempts: 0
  };

  // Record inventory reservation movements and update DB
  for (const item of newOrder.items) {
    db.recordInventoryMovement({
      productId: item.productId,
      sellerId: item.sellerId,
      warehouseId: 'wh-dar-central',
      sku: `LM-SKU-${item.productId}`,
      movementType: 'STOCK_RESERVED',
      quantity: -item.quantity,
      referenceOrderId: newOrder.id,
      referenceOrderNumber: newOrder.orderNumber,
      performedByUserId: authUser.id,
      performedByUserName: authUser.name,
      performedByUserRole: authUser.role as any,
      reason: `Stock reserved for Customer Order #${newOrder.orderNumber}`
    });
  }

  db.updateDb(d => {
    d.orders.unshift(newOrder);

    // Save idempotency key if provided
    if (idempotencyKey) {
      if (!(d as any).idempotencyKeys) (d as any).idempotencyKeys = [];
      (d as any).idempotencyKeys.unshift({
        id: generateSecureId('idem'),
        actorId: authUser.id,
        idempotencyKey: String(idempotencyKey),
        responseJson: JSON.stringify({ order: newOrder }),
        createdAt: new Date().toISOString()
      });
    }

    // Automatically update sold_count and stock for purchased products
    for (const item of newOrder.items) {
      const prod = d.products.find(p => p.id === item.productId);
      if (prod) {
        prod.soldCount = (prod.soldCount || 0) + (item.quantity || 1);
        prod.stock = Math.max(0, (prod.stock || 0) - (item.quantity || 1));
      }
    }

    // Create pickup inventory record if order is for pickup station
    if (verifiedPickupStation) {
      if (!d.pickupInventory) d.pickupInventory = [];
      d.pickupInventory.unshift({
        id: generateSecureId('pinv'),
        stationId: verifiedPickupStation.id,
        stationName: verifiedPickupStation.name,
        orderId: newOrder.id,
        orderNumber: newOrder.orderNumber,
        customerName: newOrder.customer.name,
        customerPhone: newOrder.customer.phone,
        shelfLocation: `Shelf ${crypto.randomInt(1, 9)} - Bin ${crypto.randomInt(10, 90)}`,
        packageCount: 1,
        receivedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 5).toISOString(),
        status: 'READY_FOR_PICKUP',
        otpCode: newOrder.otpCode || String(crypto.randomInt(100000, 1000000))
      });
      verifiedPickupStation.currentPackages = (verifiedPickupStation.currentPackages || 0) + 1;
    }

    // Create warehouse task
    d.warehouseTasks.unshift({
      id: generateSecureId('wt'),
      taskNumber: `WT-2026-${crypto.randomInt(1000, 10000)}`,
      warehouseId: 'wh-dar-central',
      type: 'PICKING',
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      items: newOrder.items.map(i => ({
        sku: `LM-SKU-${i.productId}`,
        productName: i.productName,
        quantity: i.quantity,
        locationBin: 'Aisle 1 - Shelf A - Bin 01',
        status: 'PENDING'
      })),
      status: 'PENDING',
      priority: newOrder.deliveryMethod?.type === 'express' ? 'URGENT' : 'MEDIUM',
      createdAt: new Date().toISOString()
    });

    // Create delivery task
    d.deliveryTasks.unshift({
      id: generateSecureId('dtask'),
      deliveryRunId: 'run-dar-01',
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      customerName: newOrder.customer.name,
      customerPhone: newOrder.customer.phone,
      address: `${newOrder.deliveryAddress?.streetAddress || ''}, ${newOrder.deliveryAddress?.area || ''}, ${newOrder.deliveryAddress?.city || ''}`,
      deliveryNotes: newOrder.deliveryAddress?.deliveryNotes,
      paymentMethod: newOrder.paymentMethod?.type,
      codAmount: newOrder.paymentMethod?.type === 'cod' ? newOrder.pricing.total : 0,
      isCodCollected: false,
      status: 'QUEUED',
      otpCode: newOrder.otpCode || generateSecureOtp()
    });
  });

  // Add notification to customer
  db.addNotification({
    userId: authUser.id,
    title: 'Order Confirmed',
    message: `Order #${newOrder.orderNumber} placed successfully. Escrow funds secured.`,
    type: 'ORDER',
    linkUrl: `/account/orders`
  });

  db.addAuditLog({
    userId: authUser.id,
    userName: authUser.name,
    userRole: authUser.role as any,
    action: 'CREATE_ORDER',
    entityType: 'ORDER',
    entityId: newOrder.id,
    newValue: `Total: ${newOrder.pricing?.total} TZS (${newOrder.items.length} items)`
  });

  res.status(201).json({ order: newOrder });
});

// PATCH /api/orders/:id/status (Secure status transition with role-based and state machine enforcement)
router.patch('/:id/status', requireVerified, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { id } = req.params;
  const { status, note } = req.body as { status: OrderStatus; note?: string };

  if (!status) {
    return res.status(400).json({ error: 'Order status is required.' });
  }

  // 1. Locate order in database
  const order = db.getDb().orders.find(o => o.id === id || o.orderNumber === id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // 2. Enforce authoritative ownership/assignment (Prevent IDOR)
  const access = verifyOrderAccess(user, order);
  if (!access.allowed) {
    return res.status(403).json({
      error: 'Access Denied: You do not have authorization to modify this order.'
    });
  }

  // 2b. Require operational account verification for order fulfillment and status updates
  const OPERATIONAL_ROLES = [
    'SELLER', 'SELLER_STAFF',
    'DELIVERY_AGENT',
    'WAREHOUSE_STAFF', 'WAREHOUSE_MANAGER',
    'PICKUP_OPERATOR', 'PICKUP_STATION_STAFF', 'PICKUP_STATION_MANAGER',
    'SALESPERSON'
  ];
  if (OPERATIONAL_ROLES.includes(user.role)) {
    if (!isUserVerified(user)) {
      return res.status(403).json({
        error: 'VERIFICATION_REQUIRED',
        message: 'Your account must be verified before updating order fulfillment status.'
      });
    }
  }

  // 3. Validate target status is a recognized OrderStatus
  if (!KNOWN_ORDER_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Invalid order status '${status}'.` });
  }

  // 4. If current status equals target status
  if (order.status === status) {
    return res.json({ order, message: `Order is already in '${status}' status.` });
  }

  // 4a. If order is in terminal Cancelled status, reject any transition with 400
  if (order.status === 'Cancelled') {
    return res.status(400).json({
      error: `Invalid status transition: Cannot transition order from 'Cancelled' to '${status}'.`
    });
  }

  // 4b. Security Enforcements for 'Delivered' Status Bypass
  if (status === 'Delivered' && order.otpStatus !== 'VERIFIED') {
    return res.status(403).json({
      error: 'OTP_REQUIRED',
      message: 'Orders cannot be marked as Delivered without a verified OTP.'
    });
  }

  // 5. Enforce role-based permission for this transition
  const roleAuth = isRoleAuthorizedForStatus(user.role, status, order.status, access);
  if (!roleAuth.authorized) {
    return res.status(403).json({
      error: `Forbidden: ${roleAuth.reason || 'You are not authorized to perform this status change.'}`
    });
  }

  // 6. Enforce valid order-status transitions server-side (State Machine)
  const allowedNextStatuses = VALID_ORDER_TRANSITIONS[order.status] || [];
  if (!allowedNextStatuses.includes(status)) {
    return res.status(400).json({
      error: `Invalid status transition: Cannot transition order from '${order.status}' to '${status}'.`
    });
  }

  // 7. Execute status update
  let updated: Order | null = null;
  let codRestrictedNoticeTriggered = false;

  db.updateDb(d => {
    const targetOrder = d.orders.find(o => o.id === id || o.orderNumber === id);
    if (targetOrder) {
      const prevStatus = targetOrder.status;
      targetOrder.status = status;
      targetOrder.statusHistory.push({
        status,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        note: note || `Status updated to ${status} by ${user.name} (${user.role})`
      });
      updated = targetOrder;

      // Handle stock movement transitions
      if ((status === 'Cancelled' || status === 'Delivery Failed' || status === 'Returned') && prevStatus !== 'Cancelled') {
        for (const item of targetOrder.items) {
          db.recordInventoryMovement({
            productId: item.productId,
            sellerId: item.sellerId,
            warehouseId: 'wh-dar-central',
            sku: `LM-SKU-${item.productId}`,
            movementType: status === 'Returned' ? 'RETURNED_SELLABLE' : 'STOCK_RELEASED',
            quantity: item.quantity,
            referenceOrderId: targetOrder.id,
            referenceOrderNumber: targetOrder.orderNumber,
            performedByUserId: user.id,
            performedByUserName: user.name,
            performedByUserRole: user.role as any,
            reason: `Order #${targetOrder.orderNumber} status changed from ${prevStatus} to ${status}. Stock returned to available pool.`
          });
        }
      }

      // Evaluate COD Risk Rule triggers on cancellation / delivery failure
      const isInTransitState = ['Processing', 'Packed', 'Dispatched', 'In Transit', 'Out for Delivery', 'Shipped'].includes(prevStatus) || targetOrder.paymentMethod?.type === 'cod';
      const isCancellationOrFailure = ['Cancelled', 'Delivery Failed', 'Pickup Failed', 'Returned'].includes(status);

      if (isInTransitState && isCancellationOrFailure) {
        const customerEmail = targetOrder.customer.email;
        const customerUser = d.users.find(u => u.email.toLowerCase() === customerEmail.toLowerCase());

        if (customerUser) {
          const codRule = (d.builderConfig?.businessRules || []).find((r: any) => r?.category === 'Payment COD Risk');
          const threshold = (codRule && codRule.threshold) ? Number(codRule.threshold) : 2;

          (customerUser as any).inTransitCancellations = ((customerUser as any).inTransitCancellations || 0) + 1;
          const currentInTransit = (customerUser as any).inTransitCancellations;
          const currentPickupFailures = customerUser.uncollectedPickupCount || 0;
          const totalFailures = currentInTransit + currentPickupFailures;

          if (totalFailures >= threshold && !(customerUser as any).isCodRestricted) {
            (customerUser as any).isCodRestricted = true;
            customerUser.isHighRiskFlagged = true;
            (customerUser as any).codRestrictionDate = new Date().toISOString();
            (customerUser as any).codRestrictionReason = `Restricted: Reached threshold of ${threshold} in-transit cancellations / failed pickups.`;
            codRestrictedNoticeTriggered = true;
          }
        }
      }
    }
  });

  if (!updated) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (codRestrictedNoticeTriggered) {
    const customerUser = db.getDb().users.find(u => u.email.toLowerCase() === (updated as Order).customer.email.toLowerCase());
    const targetRecipientId = customerUser?.id || (updated as Order).customerId || (updated as Order).customer?.id;

    if (targetRecipientId) {
      db.addNotification({
        userId: targetRecipientId,
        title: 'Pay on Delivery (COD) Restricted',
        message: 'Pay on Delivery (COD) option has been restricted on your account due to multiple in-transit order cancellations or uncollected parcels. Online payment is now required.',
        type: 'SECURITY',
        linkUrl: '/account'
      });
    }

    db.addAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: 'SUPER_ADMIN',
      action: 'COD_RISK_RESTRICTION_ENFORCED',
      entityType: 'CUSTOMER',
      entityId: (updated as Order).customer.email,
      newValue: 'COD RESTRICTED: Customer reached failure threshold'
    });
  }

  db.addAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role as any,
    action: 'UPDATE_ORDER_STATUS',
    entityType: 'ORDER',
    entityId: (updated as Order).id,
    newValue: `Transitioned status to ${status}`
  });

  res.json({ order: updated, codRestricted: codRestrictedNoticeTriggered });
});

// PUT /api/orders/:id & PATCH /api/orders/:id (Update order details with strict authorization)
const handleOrderUpdate = (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { id } = req.params;
  const updates = req.body;

  const order = db.getDb().orders.find(o => o.id === id || o.orderNumber === id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const access = verifyOrderAccess(user, order);
  if (!access.allowed) {
    return res.status(403).json({ error: 'Access Denied: You do not have authorization to modify this order.' });
  }

  // Customers can only update delivery address / notes while order is Pending or Processing
  if (access.isOwnerCustomer && !access.isAdminStaff) {
    if (!['Pending', 'Processing'].includes(order.status)) {
      return res.status(403).json({
        error: 'Forbidden: Orders that are already confirmed, dispatched, or in transit cannot be edited by customers.'
      });
    }

    // Reject tampering with core order fields
    if (updates.pricing || updates.items || updates.paymentMethod || updates.status || updates.customerId || updates.customer) {
      return res.status(403).json({
        error: 'Forbidden: Customers may only update delivery address and delivery notes.'
      });
    }
  }

  // Non-admins (vendors/riders) cannot modify pricing, customer, or payment methods
  if (!access.isAdminStaff && !access.isOwnerCustomer) {
    return res.status(403).json({
      error: 'Forbidden: You do not have permissions to modify order attributes.'
    });
  }

  let updatedOrder: Order | null = null;
  db.updateDb(d => {
    const target = d.orders.find(o => o.id === id || o.orderNumber === id);
    if (target) {
      if (updates.deliveryAddress) target.deliveryAddress = { ...target.deliveryAddress, ...updates.deliveryAddress };
      if (updates.deliveryNotes) {
        if (!target.deliveryAddress) target.deliveryAddress = {} as any;
        target.deliveryAddress.deliveryNotes = updates.deliveryNotes;
      }
      if (access.isAdminStaff) {
        if (updates.trackingNumber) target.trackingNumber = updates.trackingNumber;
        if (updates.estimatedDeliveryDate) target.estimatedDeliveryDate = updates.estimatedDeliveryDate;
      }
      updatedOrder = target;
    }
  });

  db.addAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role as any,
    action: 'UPDATE_ORDER',
    entityType: 'ORDER',
    entityId: id,
    newValue: `Order details updated by ${user.name}`
  });

  res.json({ order: updatedOrder });
};

router.put('/:id', requireVerified, handleOrderUpdate);
router.patch('/:id', requireVerified, handleOrderUpdate);

// DELETE /api/orders/:id (Only Super Admin and Admin may delete orders)
router.delete('/:id', requireVerified, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { id } = req.params;

  const order = db.getDb().orders.find(o => o.id === id || o.orderNumber === id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'Forbidden: Only platform administrators are authorized to delete orders.'
    });
  }

  db.updateDb(d => {
    d.orders = d.orders.filter(o => o.id !== id && o.orderNumber !== id);
  });

  db.addAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role as any,
    action: 'DELETE_ORDER',
    entityType: 'ORDER',
    entityId: id,
    newValue: `Order #${order.orderNumber} deleted by ${user.name}`
  });

  res.json({ success: true, message: 'Order deleted successfully.' });
});

// POST /api/orders/disputes (File dispute with authenticated customer ownership check)
router.post('/disputes', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const data = req.body;

  const order = db.getDb().orders.find(o => o.id === data.orderId || o.orderNumber === data.orderNumber);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const access = verifyOrderAccess(user, order);
  if (!access.isOwnerCustomer && !access.isAdminStaff) {
    return res.status(403).json({
      error: 'Access Denied: You may only initiate disputes on orders that you own.'
    });
  }

  const dispute = {
    id: generateSecureId('disp'),
    disputeNumber: `DSP-TZ-${crypto.randomInt(10000, 100000)}`,
    orderId: order.id,
    orderNumber: order.orderNumber,
    category: data.category || 'DAMAGED_GOODS',
    reason: data.reason || 'Order dispute',
    description: data.description || '',
    disputedAmount: data.disputedAmount || order.pricing.total,
    evidenceUrls: data.evidenceUrls || [],
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    sellerId: data.sellerId || (order.items[0] as any)?.sellerId,
    sellerName: data.sellerName || order.items[0]?.sellerName,
    status: 'OPEN',
    escrowFrozen: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.updateDb(d => {
    if (!(d as any).disputes) (d as any).disputes = [];
    (d as any).disputes.unshift(dispute);

    // Freeze escrow payout on order
    const targetOrder = d.orders.find(o => o.id === order.id);
    if (targetOrder) {
      (targetOrder as any).isEscrowFrozen = true;
      (targetOrder as any).disputeId = dispute.id;
      targetOrder.statusHistory.push({
        status: targetOrder.status,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        note: `Escrow frozen: Customer initiated dispute #${dispute.disputeNumber}`
      });
    }
  });

  db.addAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role as any,
    action: 'ESCROW_DISPUTE_CREATED',
    entityType: 'ORDER',
    entityId: order.orderNumber,
    newValue: `Created dispute #${dispute.disputeNumber} - Escrow Frozen`
  });

  db.addNotification({
    userId: user.id,
    title: `New Escrow Dispute #${dispute.disputeNumber}`,
    message: `Dispute opened for Order #${order.orderNumber} (${dispute.reason}). Escrow funds frozen.`,
    type: 'SECURITY',
    linkUrl: '/admin/operations'
  });

  res.json({ success: true, dispute });
});

// GET /api/orders/disputes (Scoped to authenticated role)
router.get('/disputes', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let disputes = (db.getDb() as any).disputes || [];

  if (user.role === 'CUSTOMER') {
    disputes = disputes.filter((d: any) =>
      d.userId === user.id || (d.userEmail && d.userEmail.toLowerCase() === user.email.toLowerCase())
    );
  } else if (user.role === 'SELLER' || user.role === 'SELLER_STAFF') {
    disputes = disputes.filter((d: any) => d.sellerId === user.sellerId);
  }

  res.json({ disputes });
});

// PATCH /api/orders/disputes/:id (Only staff/support may update dispute resolution)
router.patch('/disputes/:id', requireVerified, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { id } = req.params;
  const { status, resolutionNote, escrowFrozen } = req.body;

  const adminOrSupport = [
    'SUPER_ADMIN',
    'ADMIN',
    'OPERATIONS_ADMIN',
    'CUSTOMER_SUPPORT',
    'SUPPORT_AGENT',
    'CUSTOMER_CARE'
  ];

  if (!adminOrSupport.includes(user.role)) {
    return res.status(403).json({
      error: 'Forbidden: Only customer support agents and administrators may update dispute resolutions.'
    });
  }

  let updatedDispute: any = null;
  db.updateDb((d: any) => {
    if (!d.disputes) d.disputes = [];
    const item = d.disputes.find((disp: any) => disp.id === id || disp.disputeNumber === id);
    if (item) {
      if (status) item.status = status;
      if (resolutionNote !== undefined) item.resolutionNote = resolutionNote;
      if (escrowFrozen !== undefined) item.escrowFrozen = escrowFrozen;
      item.updatedAt = new Date().toISOString();
      updatedDispute = item;
    }
  });

  if (!updatedDispute) {
    return res.status(404).json({ error: 'Dispute not found' });
  }

  res.json({ success: true, dispute: updatedDispute });
});

export default router;

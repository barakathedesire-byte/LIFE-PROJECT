import * as crypto from 'crypto';
import { Router, Response } from 'express';
import { db } from '../db.js';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth.js';
import { isUserVerified } from '../middleware/verificationGuard.js';
import { ReturnRequest, UserAccount } from '../../src/types/index.js';

const router = Router();

// 1. Backend Authentication Enforcement
// All return endpoints require an active, authenticated session.
router.use(requireAuth);

const STAFF_RETURN_VIEW_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'FINANCE_ADMIN',
  'FINANCE_OFFICER',
  'ACCOUNTING_STAFF',
  'OPERATIONS_ADMIN',
  'WAREHOUSE_MANAGER',
  'WAREHOUSE_STAFF',
  'CUSTOMER_SUPPORT',
  'CUSTOMER_CARE',
  'SUPPORT_AGENT'
];

const REFUND_AUTHORIZATION_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'FINANCE_ADMIN',
  'FINANCE_OFFICER',
  'OPERATIONS_ADMIN'
];

const VALID_RETURN_STATUSES = [
  'RETURN_REQUESTED',
  'RETURN_APPROVED',
  'RETURN_IN_TRANSIT',
  'RETURN_RECEIVED',
  'UNDER_INSPECTION',
  'APPROVED_FOR_REFUND',
  'REFUNDED',
  'RETURNED_TO_VENDOR',
  'REJECTED',
  'CANCELLED'
];

/**
 * Validates whether the authenticated user has authorization to view or access a specific return.
 * Prevents IDOR across customers, sellers, and unprivileged roles.
 */
function verifyReturnAccess(user: UserAccount, ret: ReturnRequest): { allowed: boolean; status: number; message: string } {
  if (STAFF_RETURN_VIEW_ROLES.includes(user.role)) {
    return { allowed: true, status: 200, message: 'Authorized' };
  }

  if (user.role === 'CUSTOMER') {
    const isOwner = (
      ret.customerId === user.id ||
      (ret as any).customerEmail?.toLowerCase() === user.email?.toLowerCase()
    );
    if (!isOwner) {
      return { allowed: false, status: 403, message: 'Access denied: You may only view returns associated with your own orders.' };
    }
    return { allowed: true, status: 200, message: 'Authorized' };
  }

  if (user.role === 'SELLER' || user.role === 'SELLER_STAFF') {
    if (!user.sellerId || ret.sellerId !== user.sellerId) {
      return { allowed: false, status: 403, message: 'Access denied: Sellers may only access returns for products sold by their own store.' };
    }
    return { allowed: true, status: 200, message: 'Authorized' };
  }

  return { allowed: false, status: 403, message: 'Access denied: Your account role does not have permission to view return records.' };
}

// GET /api/returns - List returns with server-enforced RBAC & ownership filtering
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const allReturns = db.getDb().returns || [];

  if (user.role === 'CUSTOMER') {
    // Customers can strictly only view their own returns
    const customerReturns = allReturns.filter(r =>
      r.customerId === user.id ||
      (r as any).customerEmail?.toLowerCase() === user.email?.toLowerCase()
    );
    return res.json({ returns: customerReturns });
  }

  if (user.role === 'SELLER' || user.role === 'SELLER_STAFF') {
    if (!user.sellerId) {
      return res.status(403).json({ error: 'Forbidden', message: 'Seller profile required to view vendor returns.' });
    }
    const sellerReturns = allReturns.filter(r => r.sellerId === user.sellerId);
    return res.json({ returns: sellerReturns });
  }

  if (STAFF_RETURN_VIEW_ROLES.includes(user.role)) {
    let results = allReturns;
    if (req.query.sellerId && typeof req.query.sellerId === 'string') {
      results = results.filter(r => r.sellerId === req.query.sellerId);
    }
    if (req.query.orderId && typeof req.query.orderId === 'string') {
      results = results.filter(r => r.orderId === req.query.orderId);
    }
    if (req.query.status && typeof req.query.status === 'string') {
      results = results.filter(r => r.status === req.query.status);
    }
    return res.json({ returns: results });
  }

  return res.status(403).json({
    error: 'Forbidden',
    message: 'Your account role is not authorized to access return records.'
  });
});

// GET /api/returns/:id - Retrieve single return request with IDOR validation
router.get('/:id', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { id } = req.params;

  const ret = db.getDb().returns.find(r => r.id === id || r.returnNumber === id);
  if (!ret) {
    return res.status(404).json({ error: 'NotFound', message: `Return request '${id}' was not found.` });
  }

  const access = verifyReturnAccess(user, ret);
  if (!access.allowed) {
    return res.status(access.status).json({ error: 'Forbidden', message: access.message });
  }

  return res.json({ returnRequest: ret });
});

// POST /api/returns - Create return request with strict server-side order ownership & identity derivation
router.post('/', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const data = req.body || {};

  const allowedCreators = [
    'CUSTOMER',
    'SUPER_ADMIN',
    'ADMIN',
    'OPERATIONS_ADMIN',
    'CUSTOMER_SUPPORT',
    'CUSTOMER_CARE',
    'SUPPORT_AGENT'
  ];
  if (!allowedCreators.includes(user.role)) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Your role is not authorized to create return requests.'
    });
  }

  const orderId = data.orderId || data.orderNumber;
  if (!orderId || typeof orderId !== 'string') {
    return res.status(400).json({ error: 'BadRequest', message: 'Valid orderId or orderNumber is required.' });
  }

  // 1. Verify that order exists in real database
  const order = db.getDb().orders.find(o => o.id === orderId || o.orderNumber === orderId);
  if (!order) {
    return res.status(404).json({ error: 'NotFound', message: `Order '${orderId}' not found in database records.` });
  }

  // 2. IDOR Prevention: If caller is a customer, verify they own the order
  if (user.role === 'CUSTOMER') {
    const isOrderOwner = (
      order.customerId === user.id ||
      (order.customer?.id && order.customer.id === user.id) ||
      (order.customer?.email && order.customer.email.toLowerCase() === user.email.toLowerCase()) ||
      ((order as any).customerEmail && (order as any).customerEmail.toLowerCase() === user.email.toLowerCase())
    );
    if (!isOrderOwner) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only request returns for orders placed on your own account.'
      });
    }
  }

  // 3. Order status validation: Cannot return cancelled orders
  if (order.status === 'Cancelled') {
    return res.status(400).json({
      error: 'BadRequest',
      message: 'Cannot initiate return for an order that was cancelled.'
    });
  }

  // 4. Verify product belongs to the order items
  const orderItems = order.items || [];
  if (orderItems.length === 0) {
    return res.status(400).json({ error: 'BadRequest', message: 'The specified order has no line items to return.' });
  }

  let matchedItem = orderItems.find(i => i.productId === data.productId || (i as any).id === data.productId);
  if (!matchedItem && !data.productId && orderItems.length === 1) {
    matchedItem = orderItems[0];
  }

  if (!matchedItem) {
    return res.status(400).json({
      error: 'BadRequest',
      message: `Product '${data.productId || ''}' is not part of order #${order.orderNumber || order.id}.`
    });
  }

  // 5. Quantity validation
  const requestedQty = Math.max(1, parseInt(data.quantity, 10) || 1);
  const maxAvailableQty = matchedItem.quantity || 1;
  if (requestedQty > maxAvailableQty) {
    return res.status(400).json({
      error: 'BadRequest',
      message: `Requested return quantity (${requestedQty}) exceeds purchased quantity (${maxAvailableQty}).`
    });
  }

  // 6. Authoritative Financial & Identity derivation - NEVER trust client-supplied financials or identities
  const authoritativeSellerId = matchedItem.sellerId || (order as any).sellerId;
  if (!authoritativeSellerId) {
    return res.status(400).json({ error: 'BadRequest', message: 'Could not resolve authoritative seller for return item.' });
  }
  const authoritativeSellerName = matchedItem.sellerName || (order as any).sellerName || 'Verified Seller';

  // Customer identity is strictly resolved from session (or authoritative order customer if staff)
  const authoritativeCustomerId = user.role === 'CUSTOMER' ? user.id : (order.customerId || order.customer?.id || user.id);
  const authoritativeCustomerName = user.role === 'CUSTOMER' ? user.name : (order.customer?.name || user.name);

  // Authoritatively compute refund amount: unit price * requested quantity
  const itemUnitPrice = Number(matchedItem.price) || 0;
  const authoritativeRefundAmount = Math.round(itemUnitPrice * requestedQty);

  const returnId = `ret-${Date.now()}`;
  const returnNumber = `RET-2026-${crypto.randomInt(100000, 1000000)}`;

  const newReturn: ReturnRequest = {
    id: returnId,
    returnNumber,
    orderId: order.id,
    orderNumber: order.orderNumber || order.id,
    customerId: authoritativeCustomerId,
    customerName: authoritativeCustomerName,
    sellerId: authoritativeSellerId,
    sellerName: authoritativeSellerName,
    productId: matchedItem.productId,
    productName: matchedItem.productName || 'Product',
    productImage: matchedItem.productImage || '',
    quantity: requestedQty,
    refundAmount: authoritativeRefundAmount,
    reason: data.reason || 'DEFECTIVE',
    customerComment: data.customerComment ? String(data.customerComment).slice(0, 500) : '',
    images: Array.isArray(data.images) ? data.images.slice(0, 5) : [],
    status: 'RETURN_REQUESTED',
    pickupStationOrAddress: data.pickupStationOrAddress || 'LUMO Central Reverse Logistics Hub',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.updateDb(d => {
    d.returns.unshift(newReturn);
  });

  db.addAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role as any,
    action: 'CREATE_RETURN_REQUEST',
    entityType: 'ORDER',
    entityId: newReturn.orderId,
    newValue: `Return #${newReturn.returnNumber} created for product ${newReturn.productName} (Qty: ${newReturn.quantity}, Amount: ${newReturn.refundAmount} TZS)`,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] as string
  });

  return res.status(201).json({ returnRequest: newReturn });
});

/**
 * Core idempotent refund execution function.
 * Ensures that refund processing can be called safely multiple times without creating duplicate ledger entries.
 */
function processReturnRefund(user: UserAccount, ret: ReturnRequest, res: Response, req?: AuthenticatedRequest) {
  // Authorization check for financial refund
  if (!REFUND_AUTHORIZATION_ROLES.includes(user.role)) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Access denied: Only Platform Finance or Administration can authorize financial refunds and ledger deductions.'
    });
  }

  // Idempotency check:
  // 1. Is the return already marked REFUNDED?
  // 2. Is there already a REFUND_DEDUCTION ledger entry for this return?
  const alreadyMarked = ret.status === 'REFUNDED';
  const existingLedger = db.getDb().financialLedger.find(l =>
    l.type === 'REFUND_DEDUCTION' &&
    l.orderId === ret.orderId &&
    (l.description?.includes(ret.returnNumber) || l.description?.includes(ret.id))
  );

  if (alreadyMarked && existingLedger) {
    return res.json({
      returnRequest: ret,
      message: 'Return was already refunded; idempotent request acknowledged without duplicate transaction.'
    });
  }

  let updatedReturn: ReturnRequest | null = null;
  let refundAmt = 0;
  db.updateDb(d => {
    const item = d.returns.find(r => r.id === ret.id);
    if (!item) return;

    item.status = 'REFUNDED';
    item.updatedAt = new Date().toISOString();

    // Re-check ledger within the mutation block for concurrency safety
    const duplicateLedger = d.financialLedger.some(l =>
      l.type === 'REFUND_DEDUCTION' &&
      l.orderId === item.orderId &&
      (l.description?.includes(item.returnNumber) || l.description?.includes(item.id))
    );

    if (!duplicateLedger) {
      refundAmt = Math.abs(item.refundAmount);
      d.financialLedger.unshift({
        id: `led-ref-${Date.now()}-${crypto.randomInt(100, 1000)}`,
        sellerId: item.sellerId,
        orderId: item.orderId,
        type: 'REFUND_DEDUCTION',
        amount: -refundAmt,
        fee: 0,
        net: -refundAmt,
        balanceAfter: 0,
        currency: 'TZS',
        description: `Refund processed for Return #${item.returnNumber}`,
        createdAt: new Date().toISOString()
      });
    }

    updatedReturn = item;
  });

  if (!updatedReturn) {
    return res.status(404).json({ error: 'NotFound', message: 'Return request not found' });
  }

  db.addAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role as any,
    action: 'PROCESS_RETURN_REFUND',
    entityType: 'ORDER',
    entityId: (updatedReturn as ReturnRequest).orderId,
    previousValue: ret.status,
    newValue: `REFUNDED - Authorized refund of TZS ${refundAmt.toLocaleString()} for Return #${(updatedReturn as ReturnRequest).returnNumber}`,
    ipAddress: req?.ip,
    userAgent: req?.headers['user-agent'] as string
  });

  return res.json({ returnRequest: updatedReturn, message: 'Refund processed successfully' });
}

// POST /api/returns/:id/refund - Dedicated refund endpoint with idempotency & role enforcement
router.post('/:id/refund', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { id } = req.params;

  const ret = db.getDb().returns.find(r => r.id === id || r.returnNumber === id);
  if (!ret) {
    return res.status(404).json({ error: 'NotFound', message: `Return request '${id}' not found.` });
  }

  return processReturnRefund(user, ret, res, req);
});

// PATCH /api/returns/:id/status - Update return status with strict RBAC & IDOR guards
router.patch('/:id/status', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { id } = req.params;
  const { status, rejectionReason } = req.body || {};

  if (!status || !VALID_RETURN_STATUSES.includes(status)) {
    return res.status(400).json({
      error: 'BadRequest',
      message: `Invalid return status. Permitted statuses: ${VALID_RETURN_STATUSES.join(', ')}`
    });
  }

  const ret = db.getDb().returns.find(r => r.id === id || r.returnNumber === id);
  if (!ret) {
    return res.status(404).json({ error: 'NotFound', message: `Return request '${id}' not found.` });
  }

  // 1. Check if user is allowed to access this return (IDOR guard)
  const access = verifyReturnAccess(user, ret);
  if (!access.allowed) {
    return res.status(access.status).json({ error: 'Forbidden', message: access.message });
  }

  // 2. Role-specific transition & verification restrictions
  const STAFF_OPERATIONAL_ROLES = [
    'SELLER', 'SELLER_STAFF',
    'WAREHOUSE_MANAGER', 'WAREHOUSE_STAFF',
    'CUSTOMER_SUPPORT', 'CUSTOMER_CARE', 'SUPPORT_AGENT'
  ];
  if (STAFF_OPERATIONAL_ROLES.includes(user.role)) {
    if (!isUserVerified(user)) {
      return res.status(403).json({
        error: 'VERIFICATION_REQUIRED',
        message: 'Account must be verified before updating return processing statuses.'
      });
    }
  }

  if (user.role === 'CUSTOMER') {
    // Customers may only cancel their own pending return request
    if (status !== 'CANCELLED') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Customers may only cancel pending return requests.'
      });
    }
    if (ret.status !== 'RETURN_REQUESTED') {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'This return request cannot be cancelled because it is already being processed.'
      });
    }
  } else if (user.role === 'SELLER' || user.role === 'SELLER_STAFF') {
    // Sellers cannot directly issue refunds or financial deductions
    if (status === 'REFUNDED' || status === 'APPROVED_FOR_REFUND') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Sellers are not authorized to trigger refunds or financial ledger entries. Refunds must be processed by Platform Administration.'
      });
    }

    const permittedSellerStatuses = ['UNDER_INSPECTION', 'RETURN_RECEIVED', 'RETURNED_TO_VENDOR', 'REJECTED'];
    if (!permittedSellerStatuses.includes(status)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Sellers may only update returns to: ${permittedSellerStatuses.join(', ')}`
      });
    }
  } else if (user.role === 'WAREHOUSE_MANAGER' || user.role === 'WAREHOUSE_STAFF') {
    if (status === 'REFUNDED' || status === 'APPROVED_FOR_REFUND') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Warehouse staff are not authorized to issue financial refunds.'
      });
    }
    const permittedWarehouseStatuses = ['RETURN_RECEIVED', 'UNDER_INSPECTION', 'RETURNED_TO_VENDOR', 'REJECTED'];
    if (!permittedWarehouseStatuses.includes(status)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Warehouse staff may only transition returns to: ${permittedWarehouseStatuses.join(', ')}`
      });
    }
  } else if (user.role === 'CUSTOMER_SUPPORT' || user.role === 'CUSTOMER_CARE' || user.role === 'SUPPORT_AGENT') {
    if (status === 'REFUNDED') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Customer support staff cannot directly issue refunds. Escalation to Finance or Operations Admin is required.'
      });
    }
  }

  // 3. If transitioning to REFUNDED, delegate to the idempotent refund handler
  if (status === 'REFUNDED') {
    return processReturnRefund(user, ret, res, req);
  }

  // 4. Standard non-refund status update
  let updatedReturn: ReturnRequest | null = null;
  db.updateDb(d => {
    const item = d.returns.find(r => r.id === ret.id);
    if (item) {
      item.status = status;
      if (rejectionReason) item.rejectionReason = String(rejectionReason).slice(0, 300);
      item.updatedAt = new Date().toISOString();
      updatedReturn = item;
    }
  });

  if (!updatedReturn) {
    return res.status(404).json({ error: 'NotFound', message: 'Return request not found' });
  }

  db.addAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role as any,
    action: 'UPDATE_RETURN_STATUS',
    entityType: 'ORDER',
    entityId: ret.orderId,
    previousValue: ret.status,
    newValue: `Return #${ret.returnNumber} status updated to ${status}${rejectionReason ? ` (Reason: ${rejectionReason})` : ''}`,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] as string
  });

  return res.json({ returnRequest: updatedReturn });
});

// DELETE /api/returns/:id - Super Admin only purge
router.delete('/:id', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  if (user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Forbidden', message: 'Only Super Administrators are authorized to purge return records.' });
  }

  const { id } = req.params;
  let deleted = false;
  let deletedReturn: any = null;
  db.updateDb(d => {
    const idx = d.returns.findIndex(r => r.id === id || r.returnNumber === id);
    if (idx !== -1) {
      deletedReturn = d.returns[idx];
      d.returns.splice(idx, 1);
      deleted = true;
    }
  });

  if (!deleted) {
    return res.status(404).json({ error: 'NotFound', message: `Return request '${id}' not found.` });
  }

  db.addAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role as any,
    action: 'DELETE_RETURN_REQUEST',
    entityType: 'ORDER',
    entityId: deletedReturn?.orderId || id,
    severity: 'WARNING',
    newValue: `Purged return request #${deletedReturn?.returnNumber || id}`,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] as string
  });

  return res.json({ success: true, message: `Return '${id}' successfully removed.` });
});

export default router;

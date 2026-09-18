import crypto from 'node:crypto';
import { db } from '../db.js';
import { UserAccount, DeliveryTask, Order } from '../../src/types/index.js';

export const OTP_EXPIRY_MINUTES = 15;
export const OTP_EXPIRY_MS = OTP_EXPIRY_MINUTES * 60 * 1000;
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds cooldown
export const MAX_OTP_ATTEMPTS = 3;

/**
 * Generate a cryptographically secure 6-digit numeric OTP
 */
export function generateCryptographicOtp(): string {
  return String(crypto.randomInt(100000, 1000000));
}

export interface GenerateOtpResult {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  otpStatus?: string;
  expiresAt?: string;
  cooldownSeconds?: number;
  retryAfterSeconds?: number;
  error?: string;
  code?: string;
  status: number;
}

/**
 * Authoritative server-side OTP generation with rate-limiting, resend cooldown, and cryptographic randomness.
 */
export function generateOrderDeliveryOtp(orderId: string, actor: UserAccount): GenerateOtpResult {
  if (!actor) {
    return { success: false, error: 'Authentication required to generate OTP.', status: 401 };
  }

  const dbData = db.getDb();
  const order = dbData.orders.find(o => o.id === orderId || o.orderNumber === orderId);

  if (!order) {
    return { success: false, error: 'Order not found.', status: 404 };
  }

  // Authorization: Customer who owns order, assigned rider, or platform admin
  const isOwner = order.customerId === actor.id || order.customer?.id === actor.id || order.customer?.email === actor.email;
  const isAssignedRider = (order as any).riderId === actor.id || dbData.deliveryTasks.some(t => (t.orderId === order.id || t.orderNumber === order.orderNumber) && t.riderId === actor.id);
  const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'OPERATIONS_ADMIN'].includes(actor.role);

  if (!isOwner && !isAssignedRider && !isAdmin) {
    return {
      success: false,
      error: 'Access Denied: You are not authorized to generate or access the delivery OTP for this order.',
      code: 'FORBIDDEN',
      status: 403
    };
  }

  // Status check: Cannot generate OTP for already delivered or cancelled orders
  if (order.status === 'Delivered' || order.otpStatus === 'VERIFIED') {
    return {
      success: false,
      error: 'Order has already been verified and delivered.',
      code: 'ORDER_ALREADY_DELIVERED',
      status: 400
    };
  }

  if (order.status === 'Cancelled') {
    return {
      success: false,
      error: 'Cannot generate OTP for a cancelled order.',
      code: 'ORDER_CANCELLED',
      status: 400
    };
  }

  // Resend Cooldown Rate Limit Check
  const lastSent = (order as any).otpLastSentAt ? new Date((order as any).otpLastSentAt).getTime() : 0;
  const now = Date.now();
  if (lastSent && (now - lastSent) < OTP_RESEND_COOLDOWN_MS) {
    const remainingMs = OTP_RESEND_COOLDOWN_MS - (now - lastSent);
    const retryAfterSeconds = Math.ceil(remainingMs / 1000);
    return {
      success: false,
      error: `Please wait ${retryAfterSeconds} seconds before requesting a new OTP code.`,
      code: 'COOLDOWN_ACTIVE',
      retryAfterSeconds,
      status: 429
    };
  }

  // Generate new cryptographic 6-digit OTP
  const freshOtp = generateCryptographicOtp();
  const expiresAt = new Date(now + OTP_EXPIRY_MS).toISOString();
  const sentAt = new Date(now).toISOString();

  db.updateDb(d => {
    const targetOrder = d.orders.find(o => o.id === order.id);
    if (targetOrder) {
      targetOrder.otpCode = freshOtp;
      targetOrder.otpStatus = 'ACTIVE';
      targetOrder.otpExpiresAt = expiresAt;
      targetOrder.otpAttempts = 0;
      (targetOrder as any).otpLastSentAt = sentAt;
    }

    // Synchronize linked delivery task
    const task = d.deliveryTasks.find(t => t.orderId === order.id || t.orderNumber === order.orderNumber);
    if (task) {
      task.otpCode = freshOtp;
    }
  });

  db.addAuditLog({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role as any,
    action: 'GENERATE_DELIVERY_OTP',
    entityType: 'ORDER',
    entityId: order.id,
    newValue: `Generated cryptographic delivery OTP for order #${order.orderNumber} (Expires at ${expiresAt})`
  });

  return {
    success: true,
    orderId: order.id,
    orderNumber: order.orderNumber,
    otpStatus: 'ACTIVE',
    expiresAt,
    status: 200
  };
}

export interface VerifyDeliveryOtpParams {
  taskId?: string;
  orderId?: string;
  otpCode: string;
  actor: UserAccount;
  receivedByName?: string;
}

export interface VerifyDeliveryOtpResult {
  success: boolean;
  order?: Order;
  task?: DeliveryTask;
  isCod?: boolean;
  codAmount?: number;
  message?: string;
  error?: string;
  code?: string;
  attemptsLeft?: number;
  locked?: boolean;
  status: number;
}

/**
 * Authoritative, atomic delivery verification and completion with idempotent financial settlement.
 */
export function verifyAndCompleteDelivery(params: VerifyDeliveryOtpParams): VerifyDeliveryOtpResult {
  const { taskId, orderId, otpCode, actor, receivedByName } = params;

  if (!actor) {
    return {
      success: false,
      error: 'Authentication required for delivery verification.',
      status: 401
    };
  }

  // Role check: Only DELIVERY_AGENT, ADMIN, SUPER_ADMIN, OPERATIONS_ADMIN, or PICKUP_OPERATOR
  const allowedRoles = ['DELIVERY_AGENT', 'ADMIN', 'SUPER_ADMIN', 'OPERATIONS_ADMIN', 'PICKUP_OPERATOR'];
  if (!allowedRoles.includes(actor.role)) {
    return {
      success: false,
      error: 'Access Denied: Only authorized delivery agents or operations administrators may verify delivery.',
      code: 'UNAUTHORIZED_ROLE',
      status: 403
    };
  }

  // Verification check: Rider must have confirmed verified status
  if (actor.role === 'DELIVERY_AGENT') {
    const isVerified = actor.verificationStatus === 'VERIFIED' || actor.isVerified === true;
    if (!isVerified) {
      return {
        success: false,
        error: 'Rider account must be verified before performing delivery operations.',
        code: 'VERIFICATION_REQUIRED',
        status: 403
      };
    }
  }

  if (!otpCode || typeof otpCode !== 'string' || !otpCode.trim()) {
    return {
      success: false,
      error: 'Delivery OTP verification code is required.',
      code: 'MISSING_OTP',
      status: 400
    };
  }

  const cleanOtp = otpCode.trim();
  const dbData = db.getDb();

  // Find task and order
  let task = taskId ? dbData.deliveryTasks.find(t => t.id === taskId) : null;
  if (!task && orderId) {
    task = dbData.deliveryTasks.find(t => t.orderId === orderId || t.orderNumber === orderId) || null;
  }

  const targetOrderId = task?.orderId || orderId;
  const order = targetOrderId ? dbData.orders.find(o => o.id === targetOrderId || o.orderNumber === targetOrderId) : null;

  if (!order && !task) {
    return {
      success: false,
      error: 'Delivery task or order not found in database.',
      code: 'NOT_FOUND',
      status: 404
    };
  }

  // Rider assignment check (IDOR Protection)
  if (actor.role === 'DELIVERY_AGENT') {
    if (task && task.riderId && task.riderId !== actor.id) {
      return {
        success: false,
        error: 'Access Denied: This delivery is assigned to another rider.',
        code: 'RIDER_MISMATCH',
        status: 403
      };
    }
    if (order && (order as any).riderId && (order as any).riderId !== actor.id) {
      return {
        success: false,
        error: 'Access Denied: This order is assigned to another rider.',
        code: 'RIDER_MISMATCH',
        status: 403
      };
    }
  }

  // Order state validation
  const currentOrderStatus = order?.status;
  const currentTaskStatus = task?.status;

  if (currentOrderStatus === 'Cancelled') {
    return {
      success: false,
      error: 'Invalid action: Cannot complete a cancelled order.',
      code: 'ORDER_CANCELLED',
      status: 400
    };
  }

  // Idempotency & Reused OTP check
  const isAlreadyDelivered = currentOrderStatus === 'Delivered' || currentTaskStatus === 'DELIVERED';
  const isOtpAlreadyConsumed = order?.otpStatus === 'VERIFIED';

  if (isAlreadyDelivered || isOtpAlreadyConsumed) {
    return {
      success: false,
      error: 'This delivery OTP has already been verified and consumed. Reused OTPs are rejected.',
      code: 'OTP_ALREADY_USED',
      status: 400
    };
  }

  // Lockout check
  if (order?.otpStatus === 'LOCKED' || ((order?.otpAttempts || 0) >= MAX_OTP_ATTEMPTS)) {
    return {
      success: false,
      error: 'OTP verification is locked due to excessive failed attempts. Operations assistance required.',
      code: 'OTP_LOCKED',
      locked: true,
      status: 400
    };
  }

  // Expiry check
  if (order?.otpExpiresAt && new Date(order.otpExpiresAt).getTime() < Date.now()) {
    return {
      success: false,
      error: 'OTP has expired. Please request a new delivery OTP code.',
      code: 'OTP_EXPIRED',
      status: 400
    };
  }

  // Bind check: Validate OTP matches the expected order / task OTP exactly
  const expectedOtp = (order?.otpCode || task?.otpCode || '').trim();

  if (!expectedOtp || expectedOtp !== cleanOtp) {
    let attemptsLeft = 0;
    let locked = false;

    db.updateDb(d => {
      const target = order ? d.orders.find(o => o.id === order.id) : null;
      if (target) {
        const newAttempts = (target.otpAttempts || 0) + 1;
        target.otpAttempts = newAttempts;
        if (newAttempts >= MAX_OTP_ATTEMPTS) {
          target.otpStatus = 'LOCKED';
          locked = true;
          d.notifications.unshift({
            id: `notif-lock-${Date.now()}`,
            userId: actor.id,
            title: '🚨 OTP Verification Locked',
            message: `Order ${target.orderNumber} verification locked after ${MAX_OTP_ATTEMPTS} failed attempts. Operations review required.`,
            type: 'SECURITY',
            isRead: false,
            createdAt: new Date().toISOString()
          });
        } else {
          attemptsLeft = MAX_OTP_ATTEMPTS - newAttempts;
        }
      }
    });

    if (locked) {
      db.addAuditLog({
        userId: actor.id,
        userName: actor.name,
        userRole: actor.role as any,
        action: 'DELIVERY_OTP_LOCKED',
        entityType: 'ORDER',
        entityId: targetOrderId || (order?.id ?? ''),
        status: 'FAILURE',
        severity: 'CRITICAL',
        newValue: `Maximum OTP verification attempts (${MAX_OTP_ATTEMPTS}) exceeded. Order delivery locked.`
      });

      return {
        success: false,
        error: `Incorrect OTP code. Maximum attempts (${MAX_OTP_ATTEMPTS}) exceeded. Verification locked.`,
        code: 'OTP_LOCKED',
        locked: true,
        status: 400
      };
    }

    db.addAuditLog({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role as any,
      action: 'DELIVERY_OTP_FAILED',
      entityType: 'ORDER',
      entityId: targetOrderId || (order?.id ?? ''),
      status: 'FAILURE',
      severity: 'WARNING',
      newValue: `Incorrect OTP code entered (${attemptsLeft} attempts remaining)`
    });

    return {
      success: false,
      error: `Incorrect OTP code. You have ${attemptsLeft} attempts remaining.`,
      code: 'INVALID_OTP',
      attemptsLeft,
      status: 400
    };
  }

  // SUCCESSFUL VERIFICATION & DELIVERY COMPLETION WORKFLOW
  const now = new Date().toISOString();
  const verifierName = receivedByName || actor.name || 'Verified Courier';
  let finalOrder: Order | undefined;
  let finalTask: DeliveryTask | undefined;
  let isCod = false;
  let codAmount = 0;

  db.updateDb(d => {
    // 1. Update Order
    const targetOrder = order ? d.orders.find(o => o.id === order.id) : null;
    if (targetOrder) {
      targetOrder.otpStatus = 'VERIFIED';
      targetOrder.otpCode = ''; // Single-use: Invalidate code immediately upon success
      targetOrder.otpAttempts = 0;
      targetOrder.status = 'Delivered';
      (targetOrder as any).fulfillmentStatus = 'DELIVERED';
      targetOrder.paymentReleased = true;
      targetOrder.paymentReleasedAt = now;

      if (!targetOrder.statusHistory) {
        targetOrder.statusHistory = [];
      }
      targetOrder.statusHistory.push({
        status: 'Delivered',
        date: now.replace('T', ' ').substring(0, 16),
        note: `Customer delivery verified via single-use OTP by ${verifierName}. Handover complete.`
      });

      finalOrder = targetOrder;
    }

    // 2. Update Delivery Task
    const targetTask = task ? d.deliveryTasks.find(t => t.id === task.id) : (targetOrder ? d.deliveryTasks.find(t => t.orderId === targetOrder.id) : null);
    if (targetTask) {
      targetTask.otpCode = ''; // Single-use: Invalidate code immediately upon success
      targetTask.status = 'DELIVERED';
      targetTask.lastStatusUpdate = now;
      targetTask.proofOfDelivery = {
        receivedByName: verifierName,
        timestamp: now
      };

      isCod = Boolean(targetTask.codAmount > 0 || targetTask.paymentMethod === 'cod');
      codAmount = targetTask.codAmount || (isCod ? (finalOrder?.pricing?.total || 0) : 0);

      if (isCod) {
        targetTask.isCodCollected = true;
        (targetTask as any).codCollectedAt = now;
        (targetTask as any).codCollectedAmount = codAmount;

        // Record COD Cash Collected into financial ledger idempotently
        const existingCodLedger = d.financialLedger.find(
          l => l.orderId === targetTask.orderId && l.type === 'COD_CASH_COLLECTED'
        );
        if (!existingCodLedger && codAmount > 0) {
          d.financialLedger.unshift({
            id: `led-cod-${Date.now()}`,
            sellerId: actor.id,
            orderId: targetTask.orderId,
            type: 'COD_CASH_COLLECTED',
            amount: codAmount,
            fee: 0,
            net: codAmount,
            balanceAfter: 0,
            currency: 'TZS',
            description: `Rider cash collected for COD Order #${targetTask.orderNumber} (TZS ${codAmount.toLocaleString()}) by ${actor.name || 'Rider'}`,
            createdAt: now
          });
        }
      }

      finalTask = targetTask;
    }

    // 3. Authoritative Financial Settlement & Escrow Release (NO HARDCODED FALLBACKS)
    if (targetOrder) {
      const orderTotal = Number(targetOrder.pricing?.total);
      const firstItem = targetOrder.items && targetOrder.items.length > 0 ? targetOrder.items[0] : null;
      // Derive seller identity strictly from database order record
      const sellerId = (targetOrder as any).sellerId || firstItem?.sellerId;
      const sellerName = firstItem?.sellerName || 'Merchant Partner';

      if (orderTotal && orderTotal > 0) {
        const commissionFee = Math.round(orderTotal * 0.05);
        const netPayout = orderTotal - commissionFee;

        // Idempotency: Escrow Release Ledger
        const existingEscrow = d.financialLedger.find(
          l => l.orderId === targetOrder.id && l.type === 'ESCROW_RELEASE'
        );
        if (!existingEscrow) {
          d.financialLedger.unshift({
            id: `ledg-${Date.now()}`,
            sellerId: sellerId || actor.id,
            orderId: targetOrder.id,
            type: 'ESCROW_RELEASE',
            amount: orderTotal,
            fee: commissionFee,
            net: netPayout,
            balanceAfter: netPayout,
            currency: 'TZS',
            description: `Escrow release for verified order ${targetOrder.orderNumber} (OTP Verified)`,
            createdAt: now
          });
        }

        // Idempotency: Seller Payout (only if valid seller identity exists)
        if (sellerId) {
          const existingPayout = d.sellerPayouts.find(
            p => p.referenceNumber === `LUMO-OTP-REL-${targetOrder.orderNumber}` || (p as any).orderId === targetOrder.id
          );
          if (!existingPayout) {
            d.sellerPayouts.unshift({
              id: `payout-${Date.now()}`,
              payoutNumber: `PAY-${crypto.randomInt(1000, 10000)}`,
              sellerId: sellerId,
              sellerName: sellerName,
              amount: orderTotal,
              currency: 'TZS',
              deductions: { commission: commissionFee, shipping: 0, refunds: 0, advertisingFees: 0 },
              netAmount: netPayout,
              paymentMethod: 'MOBILE_MONEY',
              recipientDetails: 'M-Pesa Verified Account',
              status: 'PAID',
              requestedAt: now,
              processedAt: now,
              referenceNumber: `LUMO-OTP-REL-${targetOrder.orderNumber}`
            });
          }
        }
      }

      // Notifications
      if (targetOrder.customerId) {
        d.notifications.unshift({
          id: `notif-cust-${Date.now()}`,
          userId: targetOrder.customerId,
          title: 'Package Delivered Successfully',
          message: `Your order ${targetOrder.orderNumber} has been verified and delivered. Thank you for shopping with LUMO!`,
          type: 'DELIVERY',
          isRead: false,
          createdAt: now
        });
      }
    }
  });

  if (finalOrder) {
    db.addAuditLog({
      userId: actor.id,
      userName: actor.name || 'Rider',
      userRole: actor.role as any,
      action: 'OTP_DELIVERY_VERIFIED_SUCCESS',
      entityType: 'ORDER',
      entityId: finalOrder.id,
      previousValue: 'ACTIVE',
      newValue: `VERIFIED - Handover completed by ${verifierName}${isCod ? ` (Cash collected: TZS ${codAmount.toLocaleString()})` : ''}`
    });
  }

  return {
    success: true,
    order: finalOrder,
    task: finalTask,
    isCod,
    codAmount,
    message: isCod
      ? `OTP verified & TZS ${codAmount.toLocaleString()} cash collection confirmed.`
      : 'OTP verified successfully. Order marked as delivered and escrow released.',
    status: 200
  };
}

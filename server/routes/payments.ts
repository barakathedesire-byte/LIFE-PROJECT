import * as crypto from 'crypto';
import { Router, Response } from 'express';
import { db } from '../db.js';
import { generateSecureId } from '../utils/security.js';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Protect ALL payment routes with backend authentication
router.use(requireAuth);

// In-memory / persisted transactions table
interface PaymentTransaction {
  id: string;
  transactionNumber: string;
  payerType: 'CUSTOMER' | 'SELLER' | 'PICKUP_STATION' | 'USER';
  payerId: string;
  payerName: string;
  payerPhone: string;
  provider: string;
  amount: number;
  currency: string;
  referenceType: 'ORDER_CHECKOUT' | 'SELLER_AD_WALLET' | 'PICKUP_DEPOSIT' | 'PICKUP_ORDER_PAYMENT' | 'WALLET_TOPUP';
  referenceId: string;
  description: string;
  status: 'PENDING_PIN_PROMPT' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  authCode?: string;
  ussdRef?: string;
  metadata?: any;
  createdAt: string;
  completedAt?: string;
  expiresAt: string;
}

// Helper to access or initialize transactions in db
const getTransactions = (): PaymentTransaction[] => {
  const currentDb = db.getDb() as any;
  if (!currentDb.paymentTransactions) {
    currentDb.paymentTransactions = [];
  }
  return currentDb.paymentTransactions;
};

// 1. POST /api/payments/ussd/initiate
router.post('/ussd/initiate', (req: AuthenticatedRequest, res: Response) => {
  const {
    payerPhone,
    provider = 'M-Pesa (Vodacom)',
    amount,
    referenceType = 'ORDER_CHECKOUT',
    referenceId,
    description,
    metadata
  } = req.body;

  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!payerPhone || String(payerPhone).trim().length < 8) {
    return res.status(400).json({ error: 'Valid phone number is required for USSD payment' });
  }

  let finalAmount = Number(amount);
  let finalPayerId = req.user.id;
  let finalPayerType: 'CUSTOMER' | 'SELLER' | 'PICKUP_STATION' | 'USER' = 'CUSTOMER';

  // Server-authoritative calculations and access control
  if (referenceType === 'ORDER_CHECKOUT') {
    const order = db.getDb().orders.find(o => o.id === referenceId || o.orderNumber === referenceId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.customerId !== req.user.id && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Not authorized for this order' });
    }
    finalAmount = Number(order.pricing?.total || 0);
  } else if (referenceType === 'SELLER_AD_WALLET') {
    if (!['SELLER', 'SELLER_STAFF', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Not authorized to deposit to seller wallet' });
    }
    const sellerId = req.user.role === 'SUPER_ADMIN' ? (req.body.payerId || req.user.sellerId) : req.user.sellerId;
    if (!sellerId) return res.status(403).json({ error: 'No associated seller profile' });
    
    // Enforce verified status
    const kyc = db.getDb().sellerKYC.find(k => k.sellerId === sellerId);
    if (req.user.role !== 'SUPER_ADMIN' && (!kyc || (kyc.status !== 'APPROVED' && (kyc.status as string) !== 'VERIFIED'))) {
      return res.status(403).json({ error: 'VERIFICATION_REQUIRED', message: 'Seller must be verified to fund advertising wallet.' });
    }
    
    finalPayerId = sellerId;
    finalPayerType = 'SELLER';
    
    // Prevent negative or zero amounts
    if (isNaN(finalAmount) || finalAmount <= 0) {
      return res.status(400).json({ error: 'Invalid deposit amount' });
    }
  } else if (referenceType === 'PICKUP_DEPOSIT') {
    if (!['PICKUP_STATION_STAFF', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Not authorized for pickup deposit' });
    }
    finalPayerType = 'PICKUP_STATION';
    const stationId = req.user.role === 'SUPER_ADMIN' ? (req.body.payerId || req.user.pickupStationId) : req.user.pickupStationId;
    if (!stationId) return res.status(403).json({ error: 'No associated pickup station' });
    finalPayerId = stationId;
    
    if (isNaN(finalAmount) || finalAmount <= 0) {
      return res.status(400).json({ error: 'Invalid deposit amount' });
    }
  } else {
    // Other reference types
    if (isNaN(finalAmount) || finalAmount <= 0) {
      return res.status(400).json({ error: 'Invalid payment amount' });
    }
  }

  if (finalAmount <= 0) {
    return res.status(400).json({ error: 'Invalid payment amount calculated' });
  }

  const txId = `tx-${Date.now()}-${crypto.randomInt(1000, 10000)}`;
  const txNumber = `TZ-USSD-${crypto.randomInt(100000, 1000000)}`;
  const authCode = `${crypto.randomInt(1000, 10000)}`;
  const ussdRef = `*150*00#/${txNumber}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 2 * 60 * 1000).toISOString(); // 2 min expiration

  const newTx: PaymentTransaction = {
    id: txId,
    transactionNumber: txNumber,
    payerType: finalPayerType,
    payerId: finalPayerId,
    payerName: req.user.name || 'User',
    payerPhone: String(payerPhone).trim(),
    provider,
    amount: finalAmount,
    currency: 'TZS',
    referenceType,
    referenceId: referenceId || txId,
    description: description || `Payment for ${referenceType.replace('_', ' ')}`,
    status: 'PENDING_PIN_PROMPT',
    authCode,
    ussdRef,
    metadata: metadata || {},
    createdAt: now.toISOString(),
    expiresAt
  };

  db.updateDb((d: any) => {
    if (!d.paymentTransactions) d.paymentTransactions = [];
    d.paymentTransactions.unshift(newTx);
  });

  // Log initiated USSD request
  db.addAuditLog({
    userId: req.user?.id || newTx.payerId,
    userName: req.user?.name || newTx.payerName,
    userRole: (req.user?.role as any) || 'CUSTOMER',
    action: 'USSD_PAYMENT_INITIATED',
    entityType: 'PAYMENT' as any,
    entityId: txId,
    newValue: `Dispatched USSD Push to ${newTx.payerPhone} via ${provider} for TZS ${finalAmount.toLocaleString()}`
  });

  res.status(201).json({
    success: true,
    transactionId: txId,
    transactionNumber: txNumber,
    status: 'PENDING_PIN_PROMPT',
    provider,
    phone: newTx.payerPhone,
    amount: finalAmount,
    currency: 'TZS',
    expiresAt,
    ussdRef,
    message: `USSD PIN prompt sent to ${newTx.payerPhone}. Please check your phone screen and enter your PIN.`
  });
});

// 2. GET /api/payments/ussd/status/:transactionId
router.get('/ussd/status/:transactionId', (req: AuthenticatedRequest, res: Response) => {
  const { transactionId } = req.params;
  const transactions = getTransactions();
  const tx = transactions.find(t => t.id === transactionId || t.transactionNumber === transactionId);

  if (!tx) {
    return res.status(404).json({ error: 'Payment transaction not found' });
  }

  // Authoritative IDOR Ownership & Role Check
  const isAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN' || req.user?.role === 'FINANCE_ADMIN';
  const isPayer = tx.payerId === req.user?.id || (req.user?.sellerId && tx.payerId === req.user.sellerId);
  if (!isAdmin && !isPayer) {
    return res.status(403).json({ error: 'Access Denied: You do not have authorization to view this payment transaction.' });
  }

  const now = Date.now();
  const createdAtTime = new Date(tx.createdAt).getTime();
  const elapsedSeconds = (now - createdAtTime) / 1000;

  // Auto-simulate successful user PIN entry after 3.5 seconds if still pending
  if (tx.status === 'PENDING_PIN_PROMPT' && elapsedSeconds >= 3.5) {
    db.updateDb((d: any) => {
      const liveTx = (d.paymentTransactions || []).find((t: any) => t.id === tx.id);
      if (liveTx && liveTx.status === 'PENDING_PIN_PROMPT') {
        liveTx.status = 'SUCCESS';
        liveTx.completedAt = new Date().toISOString();

        // 1. Process Order Checkout
        if (liveTx.referenceType === 'ORDER_CHECKOUT') {
          const order = (d.orders || []).find((o: any) => o.id === liveTx.referenceId || o.orderNumber === liveTx.referenceId);
          if (order) {
            order.status = 'Processing';
            if (order.paymentMethod) {
              order.paymentMethod.status = 'Paid (Escrow Secured)';
              order.paymentMethod.transactionRef = liveTx.transactionNumber;
            }
            if (!order.history) order.history = [];
            order.history.push({
              status: 'Processing',
              note: `USSD Payment of TZS ${liveTx.amount.toLocaleString()} received via ${liveTx.provider}. Ref: ${liveTx.transactionNumber}. Escrow active.`,
              updatedBy: 'LUMO Pay Gateway',
              timestamp: new Date().toISOString()
            });

            // Dispatch Notifications to All Roles
            d.notifications.unshift({
              id: `notif-${Date.now()}-cust`,
              userId: order.customer?.email || 'customer',
              title: `Payment Received: Order #${order.orderNumber}`,
              message: `Payment of TZS ${liveTx.amount.toLocaleString()} confirmed via ${liveTx.provider}. Your items are being prepared.`,
              type: 'PAYMENT',
              orderId: order.id,
              isRead: false,
              createdAt: new Date().toISOString()
            });

            d.notifications.unshift({
              id: `notif-${Date.now()}-admin`,
              userId: 'admin',
              title: `Order Paid via Escrow: #${order.orderNumber}`,
              message: `Order #${order.orderNumber} paid (TZS ${liveTx.amount.toLocaleString()}) via ${liveTx.provider}. Escrow funds held.`,
              type: 'PAYMENT',
              orderId: order.id,
              isRead: false,
              createdAt: new Date().toISOString()
            });
          }
        }

        // 2. Process Seller Ad Wallet Deposit
        if (liveTx.referenceType === 'SELLER_AD_WALLET') {
          const sellerId = liveTx.payerId;
          const seller = (d.sellers || []).find((s: any) => s.id === sellerId);
          const metadata = liveTx.metadata || {};

          // If product boost ad was requested
          if (metadata.productId) {
            const product = (d.products || []).find((p: any) => p.id === metadata.productId);
            if (product) {
              product.isSponsored = true;
              if (!product.badges.includes('SPONSORED')) {
                product.badges = ['SPONSORED', ...product.badges];
              }
              const durationDays = metadata.durationDays || 7;
              const newAd = {
                id: generateSecureId('ad'),
                productId: product.id,
                productName: product.name,
                sellerId,
                planName: metadata.planName || 'Growth Turbo',
                budget: liveTx.amount,
                durationDays,
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + durationDays * 86400000).toISOString(),
                impressions: 0,
                clicks: 0,
                status: 'ACTIVE'
              };
              if (!d.advertisingCampaigns) d.advertisingCampaigns = [];
              d.advertisingCampaigns.unshift(newAd);
            }
          }

          // Ledger credit
          if (!d.financialLedger) d.financialLedger = [];
          d.financialLedger.unshift({
            id: `led-${Date.now()}`,
            sellerId,
            type: 'CREDIT',
            category: 'AD_WALLET_DEPOSIT',
            amount: liveTx.amount,
            currency: 'TZS',
            description: `Ad Wallet Deposit via ${liveTx.provider} (USSD Ref: ${liveTx.transactionNumber})`,
            createdAt: new Date().toISOString()
          });

          // Notification to Seller
          d.notifications.unshift({
            id: generateSecureId('notif'),
            userId: sellerId,
            title: `Ad Wallet Funded: TZS ${liveTx.amount.toLocaleString()}`,
            message: `Your advertising wallet has been successfully funded with TZS ${liveTx.amount.toLocaleString()} via ${liveTx.provider}. Campaign is now ACTIVE.`,
            type: 'PROMOTION',
            isRead: false,
            createdAt: new Date().toISOString()
          });
        }

        // 3. Process Pickup Station Cash Deposit / Reconciliation
        if (liveTx.referenceType === 'PICKUP_DEPOSIT') {
          if (!d.financialLedger) d.financialLedger = [];
          d.financialLedger.unshift({
            id: `led-${Date.now()}`,
            type: 'DEPOSIT',
            category: 'PICKUP_STATION_CASH_DEPOSIT',
            amount: liveTx.amount,
            currency: 'TZS',
            description: `Pickup Station Cash Collection Deposit via ${liveTx.provider} (Ref: ${liveTx.transactionNumber})`,
            createdAt: new Date().toISOString()
          });
        }

        // 4. Process Pickup Station Order Payment (POS or USSD)
        if (liveTx.referenceType === 'PICKUP_ORDER_PAYMENT') {
          const order = (d.orders || []).find((o: any) => o.id === liveTx.referenceId || o.orderNumber === liveTx.referenceId);
          if (order) {
            order.status = 'Delivered';
            if (order.paymentMethod) {
              order.paymentMethod.status = 'Paid (At Pickup Station)';
              order.paymentMethod.transactionRef = liveTx.transactionNumber;
            }
          }
        }
      }
    });
  }

  // Refresh reference
  const updatedTx = getTransactions().find(t => t.id === transactionId || t.transactionNumber === transactionId) || tx;

  res.json({
    success: true,
    status: updatedTx.status,
    transaction: updatedTx,
    authCode: updatedTx.authCode
  });
});

// 3. POST /api/payments/ussd/cancel/:transactionId
router.post('/ussd/cancel/:transactionId', (req: AuthenticatedRequest, res: Response) => {
  const { transactionId } = req.params;
  let cancelled = false;

  db.updateDb((d: any) => {
    const tx = (d.paymentTransactions || []).find((t: any) => t.id === transactionId || t.transactionNumber === transactionId);
    if (tx && tx.status === 'PENDING_PIN_PROMPT') {
      if (tx.payerId !== req.user?.id && req.user?.role !== 'SUPER_ADMIN' && req.user?.role !== 'ADMIN') {
        return; // Unauthorized
      }
      tx.status = 'CANCELLED';
      cancelled = true;
    }
  });

  if (!cancelled) {
    return res.status(400).json({ error: 'Transaction cannot be cancelled or was not found' });
  }

  res.json({ success: true, message: 'Payment cancelled by user' });
});

// 4. POST /api/payments/pos/authorize
router.post('/pos/authorize', requireRole('SUPER_ADMIN', 'ADMIN', 'PICKUP_AGENT', 'SELLER'), (req: AuthenticatedRequest, res: Response) => {
  const { orderId, amount, terminalId, cardLast4 } = req.body;
  const authCode = `${crypto.randomInt(1000, 10000)}`;
  const txNumber = `POS-TZ-${crypto.randomInt(100000, 1000000)}`;

  const tx: PaymentTransaction = {
    id: generateSecureId('pos'),
    transactionNumber: txNumber,
    payerType: 'CUSTOMER',
    payerId: 'usr-pos-customer',
    payerName: 'POS Cardholder',
    payerPhone: '+255 POS Card',
    provider: 'CRDB / Visa POS Terminal',
    amount: Number(amount) || 0,
    currency: 'TZS',
    referenceType: 'PICKUP_ORDER_PAYMENT',
    referenceId: orderId,
    description: `POS Card Payment at Terminal ${terminalId || 'POS-01'} (Card ending ${cardLast4 || '4242'})`,
    status: 'SUCCESS',
    authCode,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString()
  };

  db.updateDb((d: any) => {
    if (!d.paymentTransactions) d.paymentTransactions = [];
    d.paymentTransactions.unshift(tx);

    // Notify customer with the mandatory security release code
    d.notifications.unshift({
      id: generateSecureId('notif'),
      userId: 'customer',
      title: `POS Payment Security Code: #${orderId}`,
      message: `POS Payment of TZS ${(Number(amount) || 0).toLocaleString()} approved. Provide Security Code ${authCode} to the station agent to collect your package.`,
      type: 'PICKUP',
      orderId,
      isRead: false,
      createdAt: new Date().toISOString()
    });
  });

  res.json({
    success: true,
    authCode,
    transactionNumber: txNumber,
    message: 'POS transaction approved. Verification security code generated.'
  });
});

export default router;

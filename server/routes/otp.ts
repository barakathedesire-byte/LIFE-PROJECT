import { Router, Response } from 'express';
import { db } from '../db.js';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth.js';
import {
  generateOrderDeliveryOtp,
  verifyAndCompleteDelivery
} from '../services/deliveryOtpService.js';

const router = Router();

// GENERATE OR GET OTP FOR AN ORDER (Requires authentication)
router.post('/generate/:orderId', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { orderId } = req.params;
  const dbData = db.getDb();
  const order = dbData.orders.find(o => o.id === orderId || o.orderNumber === orderId);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // Authorization check: Customer who owns order, assigned rider, or admin
  const isOwner = order.customerId === req.user.id || order.customer?.id === req.user.id || order.customer?.email === req.user.email;
  const isAssignedRider = (order as any).riderId === req.user.id || dbData.deliveryTasks.some(t => (t.orderId === order.id || t.orderNumber === order.orderNumber) && t.riderId === req.user.id);
  const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'OPERATIONS_ADMIN'].includes(req.user.role);

  if (!isOwner && !isAssignedRider && !isAdmin) {
    return res.status(403).json({ error: 'Access Denied: You are not authorized to access OTP for this order.' });
  }

  // If order already has an active, unexpired OTP, return it without burning cooldown
  if (
    order.otpCode &&
    order.otpStatus === 'ACTIVE' &&
    order.otpExpiresAt &&
    new Date(order.otpExpiresAt).getTime() > Date.now()
  ) {
    return res.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      otpStatus: order.otpStatus,
      expiresAt: order.otpExpiresAt
    });
  }

  // Generate new cryptographic OTP
  const result = generateOrderDeliveryOtp(order.id, req.user);
  return res.status(result.status).json(result);
});

// RESEND OTP (Enforces 60-second cooldown rate limit)
router.post('/resend/:orderId', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { orderId } = req.params;
  const result = generateOrderDeliveryOtp(orderId, req.user);
  return res.status(result.status).json(result);
});

// VERIFY OTP (STRICTLY RESTRICTED TO AUTHENTICATED VERIFIED RIDERS, PICKUP OPERATORS, OR ADMINS)
const handleVerifyOtp = (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: 'Authentication required to perform OTP delivery verification.' });
  }

  const { orderId, taskId, otpCode, verifiedByName, receivedByName } = req.body;

  const result = verifyAndCompleteDelivery({
    taskId,
    orderId,
    otpCode,
    actor: user,
    receivedByName: verifiedByName || receivedByName
  });

  return res.status(result.status).json(result);
};

router.post('/verify', authenticateToken, handleVerifyOtp);
router.post('/verify-delivery', authenticateToken, handleVerifyOtp);
router.post('/verify-pickup', authenticateToken, handleVerifyOtp);

export default router;

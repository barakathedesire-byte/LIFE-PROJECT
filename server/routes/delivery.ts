import { Router, Response } from 'express';
import { db } from '../db.js';
import { AuthenticatedRequest, authenticateToken, requireRole } from '../middleware/auth.js';
import { requireVerifiedAccount, isUserVerified } from '../middleware/verificationGuard.js';
import { verifyAndCompleteDelivery } from '../services/deliveryOtpService.js';

const router = Router();

// Middleware: authenticate all delivery routes except public fee calculation
router.use((req: AuthenticatedRequest, res: Response, next) => {
  if (req.path === '/calculate-fee') {
    return next();
  }
  return authenticateToken(req, res, next);
});

// Helper: Verify delivery agent role and confirmed verification status
function checkRiderAuth(req: AuthenticatedRequest, res: Response): boolean {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return false;
  }

  const allowedRoles = ['DELIVERY_AGENT', 'ADMIN', 'SUPER_ADMIN', 'OPERATIONS_ADMIN'];
  if (!allowedRoles.includes(req.user.role)) {
    res.status(403).json({
      error: 'Access Denied: Only delivery agents or operations administrators may access this endpoint.',
      code: 'UNAUTHORIZED_ROLE'
    });
    return false;
  }

  if (req.user.role === 'DELIVERY_AGENT') {
    if (!isUserVerified(req.user)) {
      res.status(403).json({
        error: 'Rider account must be verified before performing delivery operations.',
        code: 'VERIFICATION_REQUIRED'
      });
      return false;
    }
  }

  return true;
}

// GET /api/delivery/runs
router.get('/runs', (req: AuthenticatedRequest, res: Response) => {
  if (!checkRiderAuth(req, res)) return;

  const authUser = req.user!;
  let runs = db.getDb().deliveryRuns || [];

  if (authUser.role === 'DELIVERY_AGENT') {
    // Rider can ONLY see runs assigned to them - never trust client query param
    runs = runs.filter(r => r.agentId === authUser.id || (r as any).riderId === authUser.id);
  } else if (req.query.agentId) {
    runs = runs.filter(r => r.agentId === req.query.agentId);
  }

  res.json({ runs });
});

// GET /api/delivery/tasks
router.get('/tasks', (req: AuthenticatedRequest, res: Response) => {
  if (!checkRiderAuth(req, res)) return;

  const authUser = req.user!;
  let tasks = db.getDb().deliveryTasks || [];

  if (authUser.role === 'DELIVERY_AGENT') {
    // Rider can ONLY view tasks assigned to them or unassigned pool
    tasks = tasks.filter(t => t.riderId === authUser.id || !t.riderId || t.riderId === 'unassigned');
  } else if (req.query.agentId || req.query.riderId) {
    const targetId = (req.query.riderId || req.query.agentId) as string;
    tasks = tasks.filter(t => t.riderId === targetId);
  }

  res.json({ tasks });
});

// GET /api/delivery/tasks/:id (Get single delivery task with IDOR protection)
router.get('/tasks/:id', (req: AuthenticatedRequest, res: Response) => {
  if (!checkRiderAuth(req, res)) return;

  const { id } = req.params;
  const authUser = req.user!;
  const task = (db.getDb().deliveryTasks || []).find(t => t.id === id || t.orderId === id || t.orderNumber === id);

  if (!task) {
    return res.status(404).json({ error: 'Delivery task not found' });
  }

  if (authUser.role === 'DELIVERY_AGENT') {
    if (task.riderId && task.riderId !== 'unassigned' && task.riderId !== authUser.id) {
      return res.status(403).json({
        error: 'Access Denied: This delivery task is assigned to another rider.',
        code: 'RIDER_MISMATCH'
      });
    }
  }

  res.json({ success: true, task });
});

// POST /api/delivery/tasks/:id/complete (OTP Verified Delivery Completion)
router.post('/tasks/:id/complete', requireVerifiedAccount, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id } = req.params;
  const { otpCode, receivedByName } = req.body;

  const result = verifyAndCompleteDelivery({
    taskId: id,
    otpCode,
    actor: req.user,
    receivedByName
  });

  return res.status(result.status).json(result);
});

// POST /api/delivery/verify-otp (Verify delivery OTP from rider app)
router.post('/verify-otp', requireVerifiedAccount, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { taskId, orderId, otpCode, receivedByName } = req.body;

  const result = verifyAndCompleteDelivery({
    taskId,
    orderId,
    otpCode,
    actor: req.user,
    receivedByName
  });

  return res.status(result.status).json(result);
});

// GET /api/delivery/rider-profile (Authoritative profile & performance metrics)
router.get('/rider-profile', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const allowedRoles = ['DELIVERY_AGENT', 'ADMIN', 'SUPER_ADMIN', 'OPERATIONS_ADMIN'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Access Denied: Rider profile is only accessible to delivery personnel.' });
  }

  const authUser = req.user;
  const riderId = authUser.role === 'DELIVERY_AGENT' ? authUser.id : ((req.query.riderId as string) || authUser.id);
  const targetUser = db.findUserById(riderId) || authUser;

  const allTasks = db.getDb().deliveryTasks || [];
  const riderTasks = allTasks.filter(t => t.riderId === riderId);
  const completedTasks = riderTasks.filter(t => t.status === 'DELIVERED');

  const completedCount = completedTasks.length;
  const todayEarnings = completedTasks.reduce((sum, t) => sum + (t.codAmount ? Math.min(8500, Math.round(t.codAmount * 0.1)) : 8500), 0);

  // Financial ledger balance
  const ledgerEntries = (db.getDb().financialLedger || []).filter(l => l.sellerId === riderId);
  const totalCredits = ledgerEntries.filter(l => l.type === 'ESCROW_RELEASE' || (l.type as string) === 'COMMISSION_EARNED').reduce((s, l) => s + l.amount, 0);
  const totalPayouts = ledgerEntries.filter(l => l.type === 'PAYOUT' || (l.type as string) === 'RIDER_PAYOUT').reduce((s, l) => s + l.amount, 0);
  const walletBalance = Math.max(0, totalCredits - totalPayouts);

  const profile = {
    id: riderId,
    name: targetUser.name || 'Verified Rider',
    phone: targetUser.phone || '',
    email: targetUser.email || '',
    avatar: targetUser.avatar || '',
    isOnline: targetUser.isActive ?? true,
    rating: (targetUser as any).rating || 4.8,
    acceptanceRate: (targetUser as any).acceptanceRate || 95,
    onTimeDeliveryRate: (targetUser as any).onTimeDeliveryRate || 98.2,
    todayEarnings,
    walletBalance,
    pendingEarnings: (targetUser as any).pendingEarnings || 0,
    completedDeliveries: completedCount,
    hoursOnline: (targetUser as any).hoursOnline || 4.0,
    distanceKm: (targetUser as any).distanceKm || 25.0,
    activeOrderCount: riderTasks.filter(t => t.status === 'ASSIGNED' || t.status === 'IN_TRANSIT' || t.status === 'ARRIVED').length,
    vehicle: (targetUser as any).vehicle || {
      type: 'Motorcycle',
      model: 'Bajaj Boxer 150cc',
      plateNumber: 'T 492 EDK',
      insuranceValidUntil: '2027-04-30',
      status: 'VERIFIED'
    },
    kyc: {
      status: targetUser.verificationStatus || 'VERIFIED',
      verifiedAt: targetUser.createdAt
    },
    operatingZone: (targetUser as any).operatingZone || 'Dar es Salaam (Kinondoni / Ilala)',
    badge: 'Verified Courier Partner',
    joinedDate: targetUser.createdAt ? targetUser.createdAt.substring(0, 10) : '2025'
  };

  res.json({ success: true, profile });
});

// POST /api/delivery/toggle-availability
router.post('/toggle-availability', requireVerifiedAccount, (req: AuthenticatedRequest, res: Response) => {
  if (!checkRiderAuth(req, res)) return;

  const { isOnline } = req.body;
  const riderId = req.user!.id;

  db.updateDb(d => {
    const user = d.users.find(u => u.id === riderId);
    if (user) {
      user.isActive = Boolean(isOnline);
    }
  });

  db.addAuditLog({
    userId: riderId,
    userName: req.user!.name || 'Rider',
    userRole: req.user!.role as any,
    action: isOnline ? 'RIDER_GO_ONLINE' : 'RIDER_GO_OFFLINE',
    entityType: 'USER',
    entityId: riderId,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] as string
  });

  res.json({
    success: true,
    isOnline: Boolean(isOnline),
    message: `Status updated to ${isOnline ? 'Available for orders' : 'Offline'}`
  });
});

// POST /api/delivery/withdraw (Rider wallet withdrawal)
router.post('/withdraw', requireVerifiedAccount, (req: AuthenticatedRequest, res: Response) => {
  if (!checkRiderAuth(req, res)) return;

  const { amount, provider, accountNo, accountName } = req.body;
  const withdrawAmount = Number(amount);

  if (!withdrawAmount || isNaN(withdrawAmount) || withdrawAmount <= 0) {
    return res.status(400).json({ error: 'Invalid withdrawal amount: Must be a positive number.' });
  }

  const riderId = req.user!.id;
  const riderName = req.user!.name || 'Rider';
  const transactionId = `WTH-${Date.now().toString().slice(-6)}`;

  db.updateDb(d => {
    d.financialLedger.unshift({
      id: `led-${Date.now()}`,
      sellerId: riderId,
      type: 'PAYOUT',
      amount: withdrawAmount,
      fee: 1000,
      net: withdrawAmount - 1000,
      balanceAfter: 0,
      currency: 'TZS',
      description: `Rider payout to ${provider || 'M-Pesa'} (${accountNo || 'Registered Line'}) - Ref ${transactionId}`,
      createdAt: new Date().toISOString()
    });

    d.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: riderId,
      title: 'Withdrawal Initiated',
      message: `Your withdrawal of TZS ${withdrawAmount.toLocaleString()} to ${provider || 'M-Pesa'} is being processed.`,
      type: 'PAYOUT',
      isRead: false,
      createdAt: new Date().toISOString()
    });
  });

  db.addAuditLog({
    userId: riderId,
    userName: riderName,
    userRole: req.user!.role as any,
    action: 'RIDER_WITHDRAWAL_REQUESTED',
    entityType: 'PAYOUT',
    entityId: transactionId,
    newValue: `Amount: TZS ${withdrawAmount} to ${provider || 'Mobile Money'}`,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] as string
  });

  res.json({
    success: true,
    transactionId,
    amount: withdrawAmount,
    provider: provider || 'Vodacom M-Pesa',
    accountNo,
    accountName,
    message: `Withdrawal of TZS ${withdrawAmount.toLocaleString()} successfully processed.`
  });
});

// POST /api/delivery/report-issue
router.post('/report-issue', requireVerifiedAccount, (req: AuthenticatedRequest, res: Response) => {
  if (!checkRiderAuth(req, res)) return;

  const { taskId, orderId, issueType, description, location } = req.body;
  const riderId = req.user!.id;
  const riderName = req.user!.name || 'Rider';
  const riderPhone = req.user!.phone || '';
  const riderEmail = req.user!.email || '';

  // If taskId or orderId provided, verify it belongs to this rider
  if (req.user!.role === 'DELIVERY_AGENT' && (taskId || orderId)) {
    const task = (db.getDb().deliveryTasks || []).find(t => t.id === taskId || t.orderId === orderId);
    if (task && task.riderId && task.riderId !== riderId) {
      return res.status(403).json({
        error: 'Access Denied: You cannot report issues on delivery tasks assigned to other riders.',
        code: 'RIDER_MISMATCH'
      });
    }
  }

  const ticketId = `TKT-${Date.now().toString().slice(-5)}`;

  db.updateDb(d => {
    d.supportTickets.unshift({
      id: `st-${Date.now()}`,
      ticketNumber: ticketId,
      userId: riderId,
      userName: riderName,
      userEmail: riderEmail,
      userPhone: riderPhone,
      role: 'DELIVERY_AGENT',
      orderId: orderId || taskId,
      orderNumber: orderId || taskId || 'N/A',
      category: 'DELIVERY',
      subject: `[Rider Incident] ${issueType || 'General Delivery Issue'}`,
      status: 'OPEN',
      priority: 'HIGH',
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'USER',
          senderName: riderName,
          message: `${description || 'Rider reported delivery incident'} (Location: ${location || 'Dar es Salaam'})`,
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    d.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: 'admin-operations',
      title: `🚨 Delivery Incident: ${issueType || 'Reported'}`,
      message: `Rider ${riderName} reported: ${description || 'Incident'}`,
      type: 'DELIVERY',
      isRead: false,
      createdAt: new Date().toISOString()
    });
  });

  res.json({
    success: true,
    ticketId,
    message: 'Incident reported to Operations Command Hub.'
  });
});

// POST /api/delivery/safety-sos (Rider triggering Emergency SOS)
router.post('/safety-sos', (req: AuthenticatedRequest, res: Response) => {
  if (!checkRiderAuth(req, res)) return;

  const { coordinates, address, notes } = req.body;
  const riderId = req.user!.id;
  const riderName = req.user!.name || 'Rider';
  const riderPhone = req.user!.phone || '';

  const sosId = `sos-${Date.now()}`;
  const sosRecord = {
    id: sosId,
    riderId,
    riderName,
    riderPhone,
    lat: coordinates?.lat || -6.7760,
    lng: coordinates?.lng || 39.2400,
    address: address || 'Dar es Salaam',
    notes: notes || 'Rider triggered Emergency SOS distress alert',
    status: 'ACTIVE_EMERGENCY',
    timestamp: new Date().toISOString()
  };

  db.updateDb(d => {
    if (!(d as any).sosAlerts) {
      (d as any).sosAlerts = [];
    }
    (d as any).sosAlerts.unshift(sosRecord);

    d.notifications.unshift({
      id: `notif-sos-${Date.now()}`,
      userId: 'admin-operations',
      title: '🚨 EMERGENCY SOS ALERT: Rider In Distress',
      message: `Rider ${riderName} (${riderPhone}) triggered SOS at ${sosRecord.address}!`,
      type: 'SYSTEM',
      isRead: false,
      createdAt: new Date().toISOString()
    });
  });

  db.addAuditLog({
    userId: riderId,
    userName: riderName,
    userRole: req.user!.role as any,
    action: 'RIDER_SAFETY_SOS_TRIGGERED',
    entityType: 'SUPPORT',
    entityId: sosId,
    severity: 'CRITICAL',
    newValue: `Distress alert triggered at ${sosRecord.address}`,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] as string
  });

  res.json({
    success: true,
    sosId,
    sosAlert: sosRecord,
    message: 'EMERGENCY SOS ALERT dispatched to Operations Command Hub.'
  });
});

// GET /api/delivery/sos-alerts (Operations & Admin only)
router.get('/sos-alerts', requireRole('SUPER_ADMIN', 'ADMIN', 'OPERATIONS_ADMIN'), (_req: AuthenticatedRequest, res: Response) => {
  const data = db.getDb();
  const alerts = (data as any).sosAlerts || [];
  res.json({ success: true, alerts });
});

// POST /api/delivery/resolve-sos (Operations & Admin only)
router.post('/resolve-sos', requireRole('SUPER_ADMIN', 'ADMIN', 'OPERATIONS_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { sosId, resolutionNotes } = req.body;
  let resolvedAlert: any = null;

  db.updateDb(d => {
    const alerts = (d as any).sosAlerts || [];
    const alert = alerts.find((a: any) => a.id === sosId);
    if (alert) {
      alert.status = 'RESOLVED';
      alert.resolvedAt = new Date().toISOString();
      alert.resolutionNotes = resolutionNotes || 'Emergency verified and resolved by Operations dispatch team.';
      resolvedAlert = alert;
    }
  });

  if (!resolvedAlert) {
    return res.status(404).json({ error: 'SOS alert record not found' });
  }

  db.addAuditLog({
    userId: req.user!.id,
    userName: req.user!.name,
    userRole: req.user!.role as any,
    action: 'RESOLVE_SAFETY_SOS',
    entityType: 'SUPPORT',
    entityId: sosId,
    newValue: `Resolved: ${resolutionNotes || 'Verified by dispatch'}`,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] as string
  });

  res.json({
    success: true,
    sosAlert: resolvedAlert,
    message: 'Emergency SOS alert resolved successfully.'
  });
});

// POST /api/delivery/accept-task (Atomic Nearest Rider Order Acceptance)
router.post('/accept-task', requireVerifiedAccount, (req: AuthenticatedRequest, res: Response) => {
  if (!checkRiderAuth(req, res)) return;

  const { taskId, orderId } = req.body;
  const riderId = req.user!.id;
  const riderName = req.user!.name || 'Rider';

  let assignedTask: any = null;
  let conflict = false;

  db.updateDb(d => {
    const task = d.deliveryTasks.find(t => t.id === taskId || t.orderId === orderId);
    if (!task) {
      return;
    }

    // Atomic Concurrency Check: If already assigned to someone else, reject
    if (task.riderId && task.riderId !== 'unassigned' && task.riderId !== riderId && task.status !== 'PENDING') {
      conflict = true;
      return;
    }

    task.riderId = riderId;
    task.riderName = riderName;
    task.status = 'ASSIGNED';
    task.assignedAt = new Date().toISOString();
    assignedTask = task;

    // Update corresponding order
    const order = d.orders.find(o => o.id === task.orderId || o.orderNumber === task.orderNumber);
    if (order) {
      (order as any).riderId = riderId;
      (order as any).riderName = riderName;
      order.status = 'Shipped';
      (order as any).fulfillmentStatus = 'READY_FOR_RIDER_PICKUP';
      order.statusHistory.push({
        status: 'Shipped',
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        note: `Rider ${riderName} accepted delivery task and is en route to merchant.`
      });
    }

    d.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: 'admin-operations',
      title: 'Rider Task Accepted',
      message: `Rider ${riderName} accepted delivery task for order #${task.orderNumber}.`,
      type: 'DELIVERY',
      isRead: false,
      createdAt: new Date().toISOString()
    });
  });

  if (conflict) {
    return res.status(409).json({
      error: 'Order Conflict: This delivery task was just claimed by another nearby rider. Refreshing dispatch pool.'
    });
  }

  if (!assignedTask) {
    return res.status(404).json({ error: 'Delivery task not found in dispatch pool' });
  }

  db.addAuditLog({
    userId: riderId,
    userName: riderName,
    userRole: req.user!.role as any,
    action: 'RIDER_ACCEPT_TASK',
    entityType: 'ORDER',
    entityId: assignedTask.orderId || assignedTask.id,
    newValue: `Accepted delivery task #${assignedTask.orderNumber || assignedTask.id}`,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] as string
  });

  res.json({ success: true, task: assignedTask, message: 'Task accepted successfully.' });
});

// POST /api/delivery/update-task-status
router.post('/update-task-status', requireVerifiedAccount, (req: AuthenticatedRequest, res: Response) => {
  if (!checkRiderAuth(req, res)) return;

  const { taskId, status, note } = req.body;
  const authUser = req.user!;

  if (!taskId || !status) {
    return res.status(400).json({ error: 'Task ID and status are required.' });
  }

  // Delivery completion CANNOT bypass OTP verification
  if (status === 'DELIVERED') {
    return res.status(400).json({
      error: 'Delivery completion requires OTP verification. Please use the verify-otp endpoint.'
    });
  }

  const validStatuses = ['COLLECTED', 'IN_TRANSIT', 'ARRIVED', 'FAILED', 'RETURNED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      error: `Invalid status '${status}'. Allowed courier statuses: ${validStatuses.join(', ')}.`
    });
  }

  const dbData = db.getDb();
  const existingTask = (dbData.deliveryTasks || []).find(t => t.id === taskId);
  if (!existingTask) {
    return res.status(404).json({ error: 'Task not found' });
  }

  // IDOR Protection: Rider may only update tasks assigned to them
  if (authUser.role === 'DELIVERY_AGENT' && existingTask.riderId && existingTask.riderId !== authUser.id) {
    return res.status(403).json({
      error: 'Access Denied: This delivery task is assigned to another rider.',
      code: 'RIDER_MISMATCH'
    });
  }

  let updatedTask: any = null;

  db.updateDb(d => {
    const task = d.deliveryTasks.find(t => t.id === taskId);
    if (task) {
      task.status = status;
      task.lastStatusUpdate = new Date().toISOString();
      updatedTask = task;

      const order = d.orders.find(o => o.id === task.orderId || o.orderNumber === task.orderNumber);
      if (order) {
        if (status === 'COLLECTED' || status === 'IN_TRANSIT') {
          order.status = 'Shipped';
          (order as any).fulfillmentStatus = order.deliveryType === 'pickup' ? 'IN_TRANSIT_TO_STATION' : 'OUT_FOR_DELIVERY';
        } else if (status === 'FAILED') {
          order.status = 'Delivery Failed';
        }
        order.statusHistory.push({
          status: order.status,
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          note: note || `Rider updated status: ${status}`
        });
      }
    }
  });

  res.json({ success: true, task: updatedTask });
});

// POST /api/delivery/collect-cod
router.post('/collect-cod', requireVerifiedAccount, (req: AuthenticatedRequest, res: Response) => {
  if (!checkRiderAuth(req, res)) return;

  const { taskId } = req.body;
  const authUser = req.user!;

  const dbData = db.getDb();
  const existingTask = (dbData.deliveryTasks || []).find(t => t.id === taskId);
  if (!existingTask) {
    return res.status(404).json({ error: 'Delivery task not found' });
  }

  if (authUser.role === 'DELIVERY_AGENT' && existingTask.riderId && existingTask.riderId !== authUser.id) {
    return res.status(403).json({
      error: 'Access Denied: You cannot collect COD for a task assigned to another rider.',
      code: 'RIDER_MISMATCH'
    });
  }

  let task: any = null;
  db.updateDb(d => {
    task = d.deliveryTasks.find(t => t.id === taskId);
    if (task) {
      task.isCodCollected = true;
      (task as any).codCollectedAt = new Date().toISOString();
    }
  });

  res.json({ success: true, task });
});

// POST /api/delivery/deposit-cod (Rider depositing collected cash at Hub)
router.post('/deposit-cod', requireVerifiedAccount, (req: AuthenticatedRequest, res: Response) => {
  if (!checkRiderAuth(req, res)) return;

  const { hubLocation, amount, receiptNumber } = req.body;
  const depositAmt = Number(amount);

  if (!depositAmt || isNaN(depositAmt) || depositAmt <= 0) {
    return res.status(400).json({ error: 'Invalid deposit amount: Must be a positive number.' });
  }

  const riderId = req.user!.id;
  const riderName = req.user!.name || 'Rider';
  const depositRef = receiptNumber || `HUB-DEP-${Date.now().toString().slice(-6)}`;

  db.updateDb(d => {
    d.financialLedger.unshift({
      id: `led-dep-${Date.now()}`,
      sellerId: riderId,
      type: 'COD_HUB_RECONCILIATION',
      amount: depositAmt,
      fee: 0,
      net: depositAmt,
      balanceAfter: 0,
      currency: 'TZS',
      description: `Rider cash deposit at ${hubLocation || 'Dar es Salaam Central Hub'} - Ref ${depositRef}`,
      createdAt: new Date().toISOString()
    });

    d.notifications.unshift({
      id: `notif-hub-${Date.now()}`,
      userId: 'admin-finance',
      title: 'Rider Cash Deposit Received',
      message: `Rider ${riderName} deposited TZS ${depositAmt.toLocaleString()} at ${hubLocation || 'Dar Central Hub'}. Ref: ${depositRef}`,
      type: 'PAYMENT',
      isRead: false,
      createdAt: new Date().toISOString()
    });
  });

  db.addAuditLog({
    userId: riderId,
    userName: riderName,
    userRole: req.user!.role as any,
    action: 'RIDER_COD_DEPOSIT',
    entityType: 'PAYOUT',
    entityId: depositRef,
    newValue: `Deposited TZS ${depositAmt.toLocaleString()} at ${hubLocation || 'Dar es Salaam Central Hub'}`,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] as string
  });

  res.json({
    success: true,
    depositRef,
    amount: depositAmt,
    hubLocation: hubLocation || 'Dar es Salaam Central Hub',
    message: `TZS ${depositAmt.toLocaleString()} deposited and reconciled with zero variance.`
  });
});

// POST /api/delivery/calculate-fee (Public delivery fee calculation)
router.post('/calculate-fee', (req, res: Response) => {
  const { region, district, subtotal, deliveryType, pickupStationId } = req.body;
  const result = db.calculateDeliveryFeeServer({
    region: region || 'Dar es Salaam',
    district,
    subtotal: Number(subtotal) || 0,
    deliveryType: deliveryType || 'standard',
    pickupStationId
  });
  res.json({ success: true, ...result });
});

export default router;

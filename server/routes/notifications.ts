import { Router, Response } from 'express';
import { db } from '../db.js';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth.js';
import { NotificationItem, UserRole } from '../../src/types/index.js';

const router = Router();

// Apply authenticateToken to all notification routes
router.use(authenticateToken);

const VALID_USER_ROLES: UserRole[] = [
  'CUSTOMER',
  'SELLER',
  'SELLER_STAFF',
  'SALESPERSON',
  'SUPER_ADMIN',
  'ADMIN',
  'FINANCE_ADMIN',
  'FINANCE_OFFICER',
  'ACCOUNTING_STAFF',
  'CATALOG_ADMIN',
  'CATALOG_SPECIALIST',
  'MARKETING_ADMIN',
  'OPERATIONS_ADMIN',
  'WAREHOUSE_MANAGER',
  'WAREHOUSE_STAFF',
  'DELIVERY_AGENT',
  'PICKUP_STATION_MANAGER',
  'PICKUP_STATION_STAFF',
  'PICKUP_OPERATOR',
  'CUSTOMER_SUPPORT',
  'SUPPORT_AGENT',
  'CUSTOMER_CARE',
  'MODERATOR',
  'CONTENT_MODERATOR'
];

const BROADCAST_AUTHORIZED_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'MARKETING_ADMIN',
  'OPERATIONS_ADMIN'
];

/**
 * Check whether a notification is accessible by the authenticated user.
 */
function isNotificationAccessibleByUser(notif: NotificationItem, user: { id: string; role: string }): boolean {
  // 1. Private User-Specific Notification:
  // If notif.userId is set to a specific non-broadcast user ID, ONLY that user can access it.
  if (notif.userId && notif.userId !== 'ALL' && notif.userId !== '') {
    return notif.userId === user.id;
  }

  // 2. Target Roles Broadcast:
  const targetRoles = (notif as any).targetRoles;
  if (Array.isArray(targetRoles) && targetRoles.length > 0) {
    return targetRoles.includes(user.role) || targetRoles.includes('ALL');
  }

  // 3. Recipient Role Broadcast:
  const recipientRole = (notif as any).recipientRole;
  if (recipientRole) {
    return recipientRole === user.role || recipientRole === 'ALL';
  }

  // 4. Untargeted system-wide notices are visible only to Admins
  return user.role === 'SUPER_ADMIN' || user.role === 'ADMIN';
}

// GET /api/notifications - Get notifications strictly for authenticated user
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const currentDb = db.getDb();
  const allNotifs = currentDb.notifications || [];

  // Filter notifications securely: never trust query params, strictly evaluate authenticated session
  const userNotifs = allNotifs.filter(n => isNotificationAccessibleByUser(n, req.user!));

  res.json({ success: true, notifications: userNotifs });
});

// GET /api/notifications/:id - Retrieve a single notification by ID (IDOR protected)
router.get('/:id', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id } = req.params;
  const notif = (db.getDb().notifications || []).find(n => n.id === id);

  if (!notif) {
    return res.status(404).json({ error: 'Notification not found' });
  }

  // IDOR validation: verify recipient ownership / targeting
  if (!isNotificationAccessibleByUser(notif, req.user) && req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Forbidden: You do not have permission to view this notification.' });
  }

  res.json({ success: true, notification: notif });
});

// POST /api/notifications/send & POST /api/notifications/broadcast - Dispatch notification
const handleSendNotification = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Role verification: Only authorized administrative roles may dispatch notifications
  if (!BROADCAST_AUTHORIZED_ROLES.includes(req.user.role)) {
    return res.status(403).json({
      error: 'Forbidden: Unauthorized broadcast attempt. Only platform administrators and marketing managers may dispatch notifications.'
    });
  }

  const { title, message, type, linkUrl, link, userId, targetRoles, recipientRole } = req.body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'Notification title is required.' });
  }

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Notification message is required.' });
  }

  // Validate specific recipient userId if supplied
  if (userId && userId !== 'ALL') {
    const recipientUser = db.getDb().users.find(u => u.id === userId);
    if (!recipientUser) {
      return res.status(400).json({ error: `Target recipient user ID '${userId}' was not found.` });
    }
  }

  // Validate targetRoles if supplied
  let validatedRoles: string[] | undefined = undefined;
  if (targetRoles) {
    if (!Array.isArray(targetRoles)) {
      return res.status(400).json({ error: 'targetRoles must be an array of valid LUMO roles.' });
    }
    const invalidRoles = targetRoles.filter(r => r !== 'ALL' && !VALID_USER_ROLES.includes(r as UserRole));
    if (invalidRoles.length > 0) {
      return res.status(400).json({ error: `Invalid roles specified: ${invalidRoles.join(', ')}` });
    }
    validatedRoles = targetRoles;
  }

  if (recipientRole && recipientRole !== 'ALL' && !VALID_USER_ROLES.includes(recipientRole as UserRole)) {
    return res.status(400).json({ error: `Invalid recipientRole: ${recipientRole}` });
  }

  const newNotif = db.addNotification({
    title: title.trim(),
    message: message.trim(),
    type: type || 'SYSTEM',
    linkUrl: linkUrl || link,
    userId: (userId && userId !== 'ALL') ? userId : undefined
  });

  if (validatedRoles) {
    (newNotif as any).targetRoles = validatedRoles;
  }
  if (recipientRole) {
    (newNotif as any).recipientRole = recipientRole;
  }
  (newNotif as any).createdById = req.user.id;
  (newNotif as any).createdByName = req.user.name;

  db.addAuditLog({
    userId: req.user.id,
    userName: req.user.name,
    userRole: req.user.role as any,
    action: 'DISPATCH_NOTIFICATION',
    entityType: 'SETTINGS',
    entityId: newNotif.id,
    newValue: `Dispatched: "${title}" (Target: ${userId || validatedRoles?.join(',') || recipientRole || 'System-wide'})`
  });

  res.status(201).json({ success: true, notification: newNotif });
};

router.post('/send', handleSendNotification);
router.post('/broadcast', handleSendNotification);
router.post('/dispatch', handleSendNotification);

// POST /api/notifications/:id/read, PUT /api/notifications/:id/read, PATCH /api/notifications/:id/read - Mark single notification as read (IDOR protected)
const handleMarkAsRead = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id } = req.params;
  const notif = (db.getDb().notifications || []).find(n => n.id === id);

  if (!notif) {
    return res.status(404).json({ error: 'Notification not found' });
  }

  // IDOR check: caller must own this notification or it must be targeted to their role
  if (!isNotificationAccessibleByUser(notif, req.user) && req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Forbidden: You cannot modify another user\'s notification.' });
  }

  db.updateDb(d => {
    const target = (d.notifications || []).find(n => n.id === id);
    if (target) {
      target.isRead = true;
      (target as any).read = true;
      (target as any).readAt = new Date().toISOString();
    }
  });

  res.json({ success: true, message: 'Notification marked as read' });
};

router.post('/:id/read', handleMarkAsRead);
router.put('/:id/read', handleMarkAsRead);
router.patch('/:id/read', handleMarkAsRead);
router.patch('/:id', handleMarkAsRead);

// DELETE /api/notifications/:id & POST /api/notifications/:id/delete - Delete a single notification (IDOR protected)
const handleDeleteNotification = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id } = req.params;
  const notif = (db.getDb().notifications || []).find(n => n.id === id);

  if (!notif) {
    return res.status(404).json({ error: 'Notification not found' });
  }

  // IDOR check:
  // If private notification belonging to another user, strictly forbidden
  if (notif.userId && notif.userId !== 'ALL' && notif.userId !== req.user.id && req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Forbidden: You cannot delete another user\'s notification.' });
  }

  // If broadcast notification, only admins can delete the system record
  if ((!notif.userId || notif.userId === 'ALL') && req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Only administrators can delete platform broadcast notices.' });
  }

  db.updateDb(d => {
    d.notifications = (d.notifications || []).filter(n => n.id !== id);
  });

  res.json({ success: true, message: 'Notification deleted successfully' });
};

router.delete('/:id', handleDeleteNotification);
router.post('/:id/delete', handleDeleteNotification);

// POST /api/notifications/read-all & PUT /api/notifications/read-all - Mark all accessible notifications as read
const handleMarkAllRead = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  db.updateDb(d => {
    (d.notifications || []).forEach(n => {
      if (isNotificationAccessibleByUser(n, req.user!)) {
        n.isRead = true;
        (n as any).read = true;
        (n as any).readAt = new Date().toISOString();
      }
    });
  });

  res.json({ success: true, message: 'All notifications marked as read' });
};

router.post('/read-all', handleMarkAllRead);
router.put('/read-all', handleMarkAllRead);

// POST /api/notifications/clear & DELETE /api/notifications - Clear ONLY the authenticated user's private notifications
const handleClearUserNotifications = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  db.updateDb(d => {
    // Only delete notifications that strictly belong to this user
    d.notifications = (d.notifications || []).filter(n => n.userId !== req.user!.id);
  });

  res.json({ success: true, message: 'User notifications cleared successfully' });
};

router.post('/clear', handleClearUserNotifications);
router.delete('/', handleClearUserNotifications);

export default router;


import * as crypto from 'crypto';
import { Router, Response } from 'express';
import { db } from '../db.js';
import { AuthenticatedRequest, requireRole } from '../middleware/auth.js';
import { CommissionRule, UserRole } from '../../src/types/index.js';
import { getSecurityLogs, getBannedIPs, unbanIP } from '../middleware/security.js';
import { sendStaffInvitationEmail, getAllEmailLogs, getEmailLogsForRecipient } from '../services/emailService.js';
import { sanitizeUser, hashPassword } from '../utils/security.js';

const router = Router();

const adminRoles: UserRole[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'OPERATIONS_ADMIN',
  'FINANCE_ADMIN',
  'CATALOG_ADMIN',
  'MARKETING_ADMIN'
];

// Router-level Administrative RBAC Guard
router.use(requireRole(...adminRoles));

// GET /api/admin/analytics
router.get('/analytics', (req: AuthenticatedRequest, res: Response) => {
  const analytics = db.getPlatformAnalytics();
  res.json({ analytics });
});

// POST /api/admin/users/:id/cod-status (Reinstate or restrict COD status)
router.post('/users/:id/cod-status', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { action, reason } = req.body; // action: 'REINSTATE' | 'RESTRICT' | 'RESET_COUNTERS'

  let targetUser: any = null;

  db.updateDb(d => {
    targetUser = d.users.find(u => u.id === id || u.email.toLowerCase() === id.toLowerCase());
    if (targetUser) {
      if (action === 'REINSTATE') {
        targetUser.isCodRestricted = false;
        targetUser.isHighRiskFlagged = false;
        targetUser.codRestrictionReason = undefined;
        targetUser.reinstatedAt = new Date().toISOString();
      } else if (action === 'RESTRICT') {
        targetUser.isCodRestricted = true;
        targetUser.isHighRiskFlagged = true;
        targetUser.codRestrictionDate = new Date().toISOString();
        targetUser.codRestrictionReason = reason || 'Admin manual restriction';
      } else if (action === 'RESET_COUNTERS') {
        targetUser.inTransitCancellations = 0;
        targetUser.uncollectedPickupCount = 0;
        targetUser.cancellationCount = 0;
        targetUser.isCodRestricted = false;
        targetUser.isHighRiskFlagged = false;
      }
    }
  });

  if (!targetUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  db.addAuditLog({
    userId: req.user?.id,
    userName: req.user?.name as string,
    userRole: (req.user?.role || 'ADMIN') as any,
    action: `COD_STATUS_${action}`,
    entityType: 'USER',
    entityId: targetUser.id,
    newValue: `Updated COD status to ${action}: ${reason || 'No reason provided'}`
  });

  res.json({ success: true, user: targetUser });
});

// GET /api/admin/staff-users (Eliminates regular customers and sellers)
router.get('/staff-users', (req: AuthenticatedRequest, res: Response) => {
  const staffRoles = [
    'SUPER_ADMIN',
    'ADMIN',
    'FINANCE_ADMIN',
    'CATALOG_ADMIN',
    'MARKETING_ADMIN',
    'OPERATIONS_ADMIN',
    'WAREHOUSE_MANAGER',
    'WAREHOUSE_STAFF',
    'DELIVERY_AGENT',
    'PICKUP_STATION_MANAGER',
    'PICKUP_STATION_STAFF',
    'CUSTOMER_SUPPORT',
    'MODERATOR',
    'SALESPERSON'
  ];
  const users = db.getDb().users.filter(u => staffRoles.includes(u.role)).map(u => sanitizeUser(u));
  res.json({ users });
});

// GET /api/admin/users (All users listing for administrators)
router.get('/users', (req: AuthenticatedRequest, res: Response) => {
  const users = (db.getDb().users || []).map(u => sanitizeUser(u));
  res.json({ users });
});

// POST /api/admin/users (Create & Provision new platform / staff user with automated email invitation)
router.post('/users', requireRole('SUPER_ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  const { 
    name, 
    email, 
    phone, 
    role, 
    department = 'Operations & Fulfillment',
    warehouseId = 'wh-kariakoo',
    status = 'INVITED',
    temporaryPassword,
    permissions 
  } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Name, email and role are required' });
  }

  const existing = db.getDb().users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (existing) {
    return res.status(400).json({ error: 'User with this email already exists in the platform directory.' });
  }

  const isInviteMode = status === 'INVITED' || !temporaryPassword;
  const staffId = `STF-${crypto.randomInt(1000, 10000)}`;
    const inviteToken = crypto.randomBytes(32).toString('hex');
  const inviteExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days validity

  // Resolve base URL for invitation link
  const origin = req.headers.origin || (req.headers.host ? `${req.protocol || 'https'}://${req.headers.host}` : 'https://lumo.africa');
  const invitationUrl = `${origin}/staff/activate?token=${inviteToken}`;

  const newUser: any = {
    id: `usr-stf-${Date.now()}`,
    staffId,
    email: email.toLowerCase().trim(),
    phone: phone || '+255 700 000 000',
    name: name.trim(),
    role,
    department,
    warehouseId,
    avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`,
    status: isInviteMode ? 'INVITED' : 'ACTIVE',
    isActive: !isInviteMode,
    isVerified: !isInviteMode,
    inviteToken: isInviteMode ? inviteToken : undefined,
    inviteExpiresAt: isInviteMode ? inviteExpiresAt : undefined,
    invitedAt: isInviteMode ? new Date().toISOString() : undefined,
    createdAt: new Date().toISOString(),
    permissions: permissions || ['*']
  };

  if (!isInviteMode && temporaryPassword) {
    newUser.passwordHash = await hashPassword(temporaryPassword);
  }

  db.updateDb(d => {
    d.users.unshift(newUser);
  });

  // Automatically dispatch email notification to the invited staff member
  let emailLogResult: any = null;
  if (isInviteMode) {
    try {
      emailLogResult = await sendStaffInvitationEmail({
        recipientEmail: newUser.email,
        recipientName: newUser.name,
        role: newUser.role,
        department: newUser.department,
        warehouseId: newUser.warehouseId,
        inviteToken,
        invitationUrl,
        expiresAt: inviteExpiresAt,
        sentByAdminName: req.user?.name || 'Super Administrator'
      });
    } catch (emailErr) {
      console.error('Failed to dispatch staff invitation email:', emailErr);
    }
  }

  db.addAuditLog({
    userId: req.user?.id,
    userName: req.user?.name as string,
    userRole: (req.user?.role || 'SUPER_ADMIN') as any,
    action: isInviteMode ? 'PROVISION_STAFF_INVITATION_DISPATCHED' : 'CREATE_STAFF_DIRECT_ACTIVE',
    entityType: 'USER',
    entityId: newUser.id,
    newValue: `Provisioned staff ${name} as ${role} (${department}) with status ${newUser.status}. Invite email dispatched to ${newUser.email}.`
  });

  res.status(201).json({ 
    success: true, 
    user: sanitizeUser(newUser),
    invitationUrl: isInviteMode ? invitationUrl : null,
    inviteToken: isInviteMode ? inviteToken : null,
    emailSent: !!emailLogResult,
    emailRecipient: newUser.email,
    emailSubject: emailLogResult?.subject,
    emailSentAt: emailLogResult?.sentAt,
    emailId: emailLogResult?.id
  });
});

// POST /api/admin/provision-operational-accounts (Super Admin operational staging accounts maintenance)
router.post('/provision-operational-accounts', requireRole('SUPER_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const accounts = db.reprovisionOperationalAccounts();

  db.addAuditLog({
    userId: req.user?.id || 'usr-op-admin',
    userName: req.user?.name || 'Super Administrator',
    userRole: 'SUPER_ADMIN',
    action: 'REPROVISION_OPERATIONAL_ACCOUNTS',
    entityType: 'SYSTEM',
    entityId: 'operational-accounts',
    newValue: `Re-verified and ensured 9 operational accounts across all Lumo modes.`
  });

  res.json({
    success: true,
    message: 'Operational accounts verified and provisioned successfully.',
    accounts
  });
});

// POST /api/admin/users/:id/resend-invitation (Resend invitation email with fresh token)
router.post('/users/:id/resend-invitation', requireRole('SUPER_ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const currentDb = db.getDb();
  const user = currentDb.users.find(u => u.id === id || u.email.toLowerCase() === id.toLowerCase());

  if (!user) {
    return res.status(404).json({ error: 'Staff user not found' });
  }

  const freshToken = crypto.randomBytes(32).toString('hex');
  const freshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const origin = req.headers.origin || (req.headers.host ? `${req.protocol || 'https'}://${req.headers.host}` : 'https://lumo.africa');
  const invitationUrl = `${origin}/staff/activate?token=${freshToken}`;

  db.updateDb(d => {
    const target = d.users.find(u => u.id === user.id);
    if (target) {
      (target as any).inviteToken = freshToken;
      (target as any).inviteExpiresAt = freshExpiresAt;
      (target as any).status = 'INVITED';
      target.isActive = false;
      target.isVerified = false;
    }
  });

  let emailLogResult: any = null;
  try {
    emailLogResult = await sendStaffInvitationEmail({
      recipientEmail: user.email,
      recipientName: user.name,
      role: user.role,
      department: (user as any).department || 'Operations',
      warehouseId: (user as any).warehouseId || 'Dar es Salaam Central Hub',
      inviteToken: freshToken,
      invitationUrl,
      expiresAt: freshExpiresAt,
      sentByAdminName: req.user?.name || 'Super Administrator'
    });
  } catch (emailErr) {
    console.error('Failed to resend staff invitation email:', emailErr);
  }

  db.addAuditLog({
    userId: req.user?.id,
    userName: req.user?.name as string,
    userRole: (req.user?.role || 'SUPER_ADMIN') as any,
    action: 'RESEND_STAFF_INVITATION_EMAIL',
    entityType: 'USER',
    entityId: user.id,
    newValue: `Re-sent invitation email with fresh activation token to ${user.email} (${user.role})`
  });

  res.json({
    success: true,
    message: `Invitation email successfully dispatched to ${user.email}`,
    invitationUrl,
    inviteToken: freshToken,
    emailSent: !!emailLogResult,
    emailRecipient: user.email,
    emailSentAt: emailLogResult?.sentAt || new Date().toISOString(),
    emailId: emailLogResult?.id
  });
});

// PATCH /api/admin/users/:id/status (Transition staff status: INVITED, ACTIVE, SUSPENDED, REVOKED)
router.patch('/users/:id/status', requireRole('SUPER_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, reason } = req.body;

  if (!status || !['INVITED', 'ACTIVE', 'SUSPENDED', 'REVOKED'].includes(status)) {
    return res.status(400).json({ error: 'Valid status required: INVITED, ACTIVE, SUSPENDED, REVOKED' });
  }

  let updatedUser: any = null;

  db.updateDb(d => {
    const user = d.users.find(u => u.id === id || u.email.toLowerCase() === id.toLowerCase());
    if (user) {
      (user as any).status = status;
      user.isActive = status === 'ACTIVE';
      if (status === 'ACTIVE') {
        user.isVerified = true;
      }
      (user as any).statusReason = reason;
      (user as any).statusUpdatedAt = new Date().toISOString();
      updatedUser = user;
    }
  });

  if (!updatedUser) {
    return res.status(404).json({ error: 'Staff user not found' });
  }

  db.addAuditLog({
    userId: req.user?.id,
    userName: req.user?.name as string,
    userRole: (req.user?.role || 'SUPER_ADMIN') as any,
    action: `STAFF_STATUS_CHANGE_${status}`,
    entityType: 'USER',
    entityId: updatedUser.id,
    newValue: `Updated staff status of ${updatedUser.name} (${updatedUser.email}) to ${status}. Reason: ${reason || 'Admin action'}`
  });

  res.json({ success: true, user: updatedUser });
});

// PUT /api/admin/users/:id (Update staff member metadata)
router.put('/users/:id', requireRole('SUPER_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, email, phone, role, department, warehouseId, permissions } = req.body;

  let updatedUser: any = null;

  db.updateDb(d => {
    const user = d.users.find(u => u.id === id || u.email.toLowerCase() === id.toLowerCase());
    if (user) {
      if (name) user.name = name.trim();
      if (email) user.email = email.toLowerCase().trim();
      if (phone) user.phone = phone.trim();
      if (role) user.role = role;
      if (department) (user as any).department = department;
      if (warehouseId) (user as any).warehouseId = warehouseId;
      if (permissions) user.permissions = permissions;
      updatedUser = user;
    }
  });

  if (!updatedUser) {
    return res.status(404).json({ error: 'Staff user not found' });
  }

  db.addAuditLog({
    userId: req.user?.id,
    userName: req.user?.name as string,
    userRole: (req.user?.role || 'SUPER_ADMIN') as any,
    action: 'UPDATE_STAFF_USER',
    entityType: 'USER',
    entityId: updatedUser.id,
    newValue: `Updated staff profile for ${updatedUser.name} (${updatedUser.email})`
  });

  res.json({ success: true, user: updatedUser });
});

// DELETE /api/admin/users/:id (Delete staff or buyer account)
router.delete('/users/:id', requireRole('SUPER_ADMIN', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  let deletedUser: any = null;

  db.updateDb(d => {
    const idx = d.users.findIndex(u => u.id === id || u.email?.toLowerCase() === id.toLowerCase());
    if (idx !== -1) {
      deletedUser = d.users[idx];
      d.users.splice(idx, 1);
    }
    if ((d as any).buyers) {
      const bIdx = (d as any).buyers.findIndex((b: any) => b.id === id || b.email?.toLowerCase() === id.toLowerCase());
      if (bIdx !== -1) {
        deletedUser = deletedUser || (d as any).buyers[bIdx];
        (d as any).buyers.splice(bIdx, 1);
      }
    }
  });

  if (!deletedUser) {
    return res.status(404).json({ error: 'User account not found' });
  }

  db.addAuditLog({
    userId: req.user?.id,
    userName: req.user?.name as string,
    userRole: (req.user?.role || 'SUPER_ADMIN') as any,
    action: 'DELETE_USER',
    entityType: 'USER',
    entityId: id,
    newValue: `Permanently removed account: ${deletedUser.name} (${deletedUser.email || id})`
  });

  res.json({ success: true, message: `User account ${deletedUser.name} removed successfully.` });
});

// GET /api/admin/email-logs (Get all system email communication logs)
router.get('/email-logs', (req: AuthenticatedRequest, res: Response) => {
  const recipient = req.query.recipient as string;
  const logs = recipient ? getEmailLogsForRecipient(recipient) : getAllEmailLogs();
  res.json({ logs });
});

// GET /api/admin/pending-sellers
router.get('/pending-sellers', (req: AuthenticatedRequest, res: Response) => {
  const apps = db.getDb().vendorApplications || [];
  res.json({ applications: apps });
});

// POST /api/admin/sellers/:id/approve
router.post('/sellers/:id/approve', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  let application: any = null;
  let newSeller: any = null;

  db.updateDb(d => {
    application = (d.vendorApplications || []).find(a => a.id === id);
    if (application) {
      application.status = 'APPROVED';
      const sellerId = `sel-${Date.now()}`;
      newSeller = {
        id: sellerId,
        name: application.storeName,
        city: `${application.city} (${application.area || 'CBD'})`,
        country: 'Tanzania',
        rating: 5.0,
        totalReviews: 0,
        productsCount: 0,
        followersCount: 1,
        isLiveCommerceActive: false,
        joinedYear: new Date().getFullYear(),
        responseRate: '100%',
        shipOnTimeRate: '100%',
        isOfficialStore: application.businessType === 'REGISTERED_BUSINESS' || application.businessType === 'CORPORATE',
        badge: 'Newly Verified Merchant',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        description: `${application.storeName} - verified seller in ${application.category}.`
      };
      d.sellers.unshift(newSeller);

      // Also create a SELLER user account so the merchant can log in immediately
      const newSellerUser = {
        id: `usr-sel-${Date.now()}`,
        email: application.email,
        phone: application.phone,
        name: application.contactName,
        role: 'SELLER' as const,
        sellerId,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        isActive: true,
        isVerified: true,
        verificationStatus: 'VERIFIED' as const,
        createdAt: new Date().toISOString(),
        permissions: ['seller:*']
      };
      d.users.push(newSellerUser);
    }
  });

  if (!application) {
    return res.status(404).json({ error: 'Application not found' });
  }

  db.addAuditLog({
    userId: req.user?.id,
    userName: req.user?.name as string,
    userRole: 'SUPER_ADMIN',
    action: 'APPROVE_SELLER_APPLICATION',
    entityType: 'KYC',
    entityId: id,
    newValue: `Approved vendor application for ${application.storeName}`
  });

  res.json({ success: true, application, seller: newSeller });
});

// POST /api/admin/sellers/:id/reject
router.post('/sellers/:id/reject', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  let application: any = null;

  db.updateDb(d => {
    application = (d.vendorApplications || []).find(a => a.id === id);
    if (application) {
      application.status = 'REJECTED';
      application.notes = reason || 'Documentation does not meet platform verification standards.';
    }
  });

  if (!application) {
    return res.status(404).json({ error: 'Application not found' });
  }

  db.addAuditLog({
    userId: req.user?.id || 'admin',
    userName: req.user?.name as string,
    userRole: (req.user?.role || 'ADMIN') as any,
    action: 'REJECT_SELLER_APPLICATION',
    entityType: 'KYC',
    entityId: id,
    newValue: `Rejected vendor application for ${application.storeName}. Reason: ${reason || 'Documentation insufficient'}`,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] as string
  });

  res.json({ success: true, application });
});

// POST /api/admin/users/:id/verification-status
router.post('/users/:id/verification-status', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { verificationStatus, isVerified, isActive } = req.body;
  let targetUser: any = null;
  db.updateDb(d => {
    targetUser = d.users.find(u => u.id === id);
    if (targetUser) {
      if (verificationStatus !== undefined) targetUser.verificationStatus = verificationStatus;
      if (isVerified !== undefined) targetUser.isVerified = isVerified;
      if (isActive !== undefined) targetUser.isActive = isActive;
    }
  });
  if (!targetUser) return res.status(404).json({ error: 'User not found' });

  db.addAuditLog({
    userId: req.user?.id || 'admin',
    userName: req.user?.name as string,
    userRole: (req.user?.role || 'ADMIN') as any,
    action: 'UPDATE_USER_VERIFICATION_STATUS',
    entityType: 'USER',
    entityId: id,
    newValue: `Updated verification status of user ${targetUser.email} to ${verificationStatus}, isVerified: ${isVerified}`,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] as string
  });

  res.json({ success: true, user: targetUser });
});

// PATCH /api/admin/users/:id/role (Super Administrator only)
router.patch('/users/:id/role', requireRole('SUPER_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { role, isActive } = req.body;

  let user: any = null;
  let prevRole: string = '';
  db.updateDb(d => {
    user = d.users.find(u => u.id === id);
    if (user) {
      prevRole = user.role;
      if (role) user.role = role;
      if (isActive !== undefined) user.isActive = isActive;
    }
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  db.addAuditLog({
    userId: req.user?.id || 'admin',
    userName: req.user?.name as string,
    userRole: (req.user?.role || 'SUPER_ADMIN') as any,
    action: 'UPDATE_USER_ROLE',
    entityType: 'USER',
    entityId: id,
    previousValue: prevRole,
    newValue: role || user.role,
    details: `Modified user ${user.name} (${user.email}) role from ${prevRole} to ${role}`,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] as string
  });

  res.json({ user });
});

// GET /api/admin/audit-logs
router.get('/audit-logs', (req: AuthenticatedRequest, res: Response) => {
  const logs = db.getDb().auditLogs || [];
  res.json({ auditLogs: logs });
});

// GET /api/admin/commission-rules
router.get('/commission-rules', (req: AuthenticatedRequest, res: Response) => {
  const rules = db.getDb().commissionRules;
  res.json({ commissionRules: rules });
});

// POST /api/admin/commission-rules
router.post('/commission-rules', requireRole('SUPER_ADMIN', 'ADMIN', 'FINANCE_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  const newRule: CommissionRule = {
    id: `com-${Date.now()}`,
    category: data.category || 'general',
    subCategory: data.subCategory,
    sellerTier: data.sellerTier,
    commissionRate: Number(data.commissionRate) || 0.08,
    fixedFee: Number(data.fixedFee) || 1000,
    isActive: true
  };

  db.updateDb(d => {
    d.commissionRules.unshift(newRule);
  });

  db.addAuditLog({
    userId: req.user?.id || 'admin',
    userName: req.user?.name as string,
    userRole: (req.user?.role || 'ADMIN') as any,
    action: 'CREATE_COMMISSION_RULE',
    entityType: 'COMMISSION_RULE',
    entityId: newRule.id,
    newValue: `Created commission rule for ${newRule.category}: ${(newRule.commissionRate * 100).toFixed(1)}%`,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] as string
  });

  res.status(201).json({ commissionRule: newRule });
});

// POST /api/admin/audit
router.post('/audit', (req: AuthenticatedRequest, res: Response) => {
  try {
    const logData = req.body;
    if (!logData.action) {
      return res.status(400).json({ error: 'Audit action is required.' });
    }
    const newLog = db.addAuditLog({
      userId: req.user?.id || 'admin',
      userName: req.user?.name || 'Administrator',
      userRole: (req.user?.role || 'ADMIN') as any,
      action: logData.action,
      entityType: logData.entityType || 'ADMIN',
      entityId: logData.entityId || 'platform',
      details: logData.details || '',
      newValue: logData.newValue,
      previousValue: logData.previousValue,
      status: 'SUCCESS',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string
    });
    res.json({ success: true, log: { ...newLog, admin: req.user?.email || req.user?.name || 'admin' } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create audit log' });
  }
});

router.get('/builder-config', (req: AuthenticatedRequest, res: Response) => {
  const currentDb = db.getDb();
  res.json({ builderConfig: currentDb.builderConfig || {} });
});

// POST /api/admin/builder-config
router.post('/builder-config', requireRole('SUPER_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { config } = req.body;
  db.updateDb(d => {
    d.builderConfig = { ...(d.builderConfig || {}), ...config };
  });

  db.addAuditLog({
    userId: req.user?.id,
    userName: req.user?.name as string,
    userRole: (req.user?.role || 'SUPER_ADMIN') as any,
    action: 'UPDATE_BUILDER_CONFIG',
    entityType: 'PLATFORM_BUILDER',
    entityId: 'cfg-main',
    newValue: 'Updated global builder configuration'
  });

  res.json({ success: true, builderConfig: db.getDb().builderConfig });
});

// POST /api/admin/features/:id/toggle
router.post('/features/:id/toggle', requireRole('SUPER_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  let feature: any = null;

  db.updateDb(d => {
    if (d.builderConfig && Array.isArray(d.builderConfig.features)) {
      feature = d.builderConfig.features.find((f: any) => f.id === id || f.key === id);
      if (feature) {
        feature.enabled = !feature.enabled;
      }
    }
  });

  if (!feature) {
    return res.status(404).json({ error: 'Feature flag not found' });
  }

  db.addAuditLog({
    userId: req.user?.id || 'admin',
    userName: req.user?.name as string,
    userRole: (req.user?.role || 'SUPER_ADMIN') as any,
    action: 'TOGGLE_FEATURE_FLAG',
    entityType: 'PLATFORM_BUILDER',
    entityId: id,
    newValue: `Feature ${feature.name || id} is now ${feature.enabled ? 'ENABLED' : 'DISABLED'}`,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] as string
  });

  res.json({ success: true, feature });
});

// GET /api/admin/payouts
router.get('/payouts', (req: AuthenticatedRequest, res: Response) => {
  const payouts = db.getDb().sellerPayouts || [];
  res.json({ payouts });
});

// POST /api/admin/payouts/:id/approve
router.post('/payouts/:id/approve', requireRole('SUPER_ADMIN', 'ADMIN', 'FINANCE_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  let payout: any = null;

  db.updateDb(d => {
    payout = (d.sellerPayouts || []).find(p => p.id === id);
    if (payout) {
      payout.status = 'PAID';
      payout.processedAt = new Date().toISOString();
      payout.referenceCode = `BNK-TZ-${crypto.randomInt(1000000, 10000000)}`;

      // Add to financial ledger
      d.financialLedger.unshift({
        id: `led-${Date.now()}`,
        sellerId: payout.sellerId,
        type: 'PAYOUT',
        amount: -payout.amount,
        fee: 0,
        net: -payout.amount,
        balanceAfter: 0,
        currency: payout.currency || 'TZS',
        description: `Disbursed payout #${payout.payoutNumber} to seller bank/M-Pesa. Ref: ${payout.referenceCode}`,
        createdAt: new Date().toISOString()
      });
    }
  });

  if (!payout) {
    return res.status(404).json({ error: 'Payout request not found' });
  }

  db.addAuditLog({
    userId: req.user?.id,
    userName: req.user?.name as string,
    userRole: (req.user?.role || 'SUPER_ADMIN') as any,
    action: 'APPROVE_PAYOUT',
    entityType: 'PAYOUT',
    entityId: id,
    newValue: `Approved and disbursed payout of ${payout.amount} TZS`
  });

  res.json({ success: true, payout });
});

// GET /api/admin/kyc-list
router.get('/kyc-list', (req: AuthenticatedRequest, res: Response) => {
  const kycList = db.getDb().sellerKYC || [];
  res.json({ kycList });
});

// POST /api/admin/kyc/:id/verify
router.post('/kyc/:id/verify', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  let kyc: any = null;

  db.updateDb(d => {
    kyc = (d.sellerKYC || []).find(k => k.id === id || k.sellerId === id);
    if (kyc) {
      kyc.status = 'APPROVED';
      kyc.verifiedAt = new Date().toISOString();

      const seller = d.sellers.find(s => s.id === kyc.sellerId);
      if (seller) {
        seller.isOfficialStore = true;
        seller.badge = 'Verified Official Seller';
      }
    }
  });

  if (!kyc) {
    return res.status(404).json({ error: 'KYC record not found' });
  }

  db.addAuditLog({
    userId: req.user?.id || 'admin',
    userName: req.user?.name as string,
    userRole: (req.user?.role || 'ADMIN') as any,
    action: 'VERIFY_SELLER_KYC',
    entityType: 'KYC',
    entityId: kyc.id || id,
    newValue: `Verified and approved KYC documents for seller ${kyc.sellerId}`,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] as string
  });

  res.json({ success: true, kyc });
});

// GET /api/admin/rider-applications
router.get('/rider-applications', (req: AuthenticatedRequest, res: Response) => {
  const apps = db.getDb().riderApplications || [];
  res.json({ applications: apps });
});

// POST /api/admin/rider-applications/:id/approve
router.post('/rider-applications/:id/approve', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  let app: any = null;
  let newRider: any = null;

  db.updateDb(d => {
    app = (d.riderApplications || []).find(a => a.id === id);
    if (app) {
      app.status = 'APPROVED';
      const riderId = `usr-rider-${Date.now()}`;
      newRider = {
        id: riderId,
        email: app.email || `rider-${Date.now()}@lumo.africa`,
        phone: app.phone,
        name: app.fullName || app.name,
        role: 'DELIVERY_AGENT' as const,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        isActive: true,
        isVerified: true,
        verificationStatus: 'VERIFIED' as const,
        createdAt: new Date().toISOString(),
        permissions: ['delivery:*']
      };
      d.users.push(newRider);
    }
  });

  if (!app) {
    return res.status(404).json({ error: 'Rider application not found' });
  }

  db.addAuditLog({
    userId: req.user?.id || 'admin',
    userName: req.user?.name as string,
    userRole: (req.user?.role || 'ADMIN') as any,
    action: 'APPROVE_RIDER_APPLICATION',
    entityType: 'KYC',
    entityId: id,
    newValue: `Approved rider application for ${app.fullName || app.name} (${newRider.id})`,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] as string
  });

  res.json({ success: true, application: app, user: newRider });
});

// GET /api/admin/sales-applications
router.get('/sales-applications', (req: AuthenticatedRequest, res: Response) => {
  const apps = db.getDb().salesApplications || [];
  res.json({ applications: apps });
});

// POST /api/admin/sales-applications/:id/approve
router.post('/sales-applications/:id/approve', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  let app: any = null;
  let newSalesperson: any = null;

  db.updateDb(d => {
    app = (d.salesApplications || []).find(a => a.id === id);
    if (app) {
      app.status = 'APPROVED';
      const spId = `sp-${Date.now()}`;
      const userId = `usr-sp-${Date.now()}`;
      newSalesperson = {
        id: userId,
        salespersonId: spId,
        email: app.email,
        phone: app.phone,
        name: app.fullName || app.name,
        role: 'SALESPERSON' as const,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        isActive: true,
        isVerified: true,
        createdAt: new Date().toISOString(),
        permissions: ['sales:*']
      };
      d.users.push(newSalesperson);

      // Seed initial target
      d.salesTargets.push({
        id: `target-${spId}`,
        salespersonId: spId,
        month: '2026-08',
        salesTargetAmount: 50000000,
        salesAchievedAmount: 0,
        newCustomersTarget: 20,
        newCustomersAchieved: 0,
        newSellersTarget: 5,
        newSellersAchieved: 0,
        commissionEarned: 0,
        commissionPending: 0,
        commissionPaid: 0,
        status: 'ON_TRACK'
      });
    }
  });

  if (!app) {
    return res.status(404).json({ error: 'Sales application not found' });
  }

  db.addAuditLog({
    userId: req.user?.id || 'admin',
    userName: req.user?.name as string,
    userRole: (req.user?.role || 'ADMIN') as any,
    action: 'APPROVE_SALES_APPLICATION',
    entityType: 'KYC',
    entityId: id,
    newValue: `Approved sales rep application for ${app.fullName || app.name} (${newSalesperson.id})`,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] as string
  });

  res.json({ success: true, application: app, user: newSalesperson });
});

// POST /api/admin/risk-incidents
router.post('/risk-incidents', requireRole('SUPER_ADMIN', 'ADMIN', 'OPERATIONS_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  const incident = {
    id: `rsk-${Date.now()}`,
    incidentNumber: `RSK-TZ-${crypto.randomInt(1000, 10000)}`,
    entityType: data.entityType || 'ORDER',
    entityId: data.entityId,
    entityReference: data.entityReference,
    riskLevel: data.riskLevel || 'HIGH',
    riskScore: data.riskScore || 75,
    factors: data.factors || [],
    investigationNotes: data.investigationNotes || '',
    actionTaken: data.actionTaken || 'COD_RESTRICTED',
    status: data.actionTaken === 'NONE' ? 'MONITORING' : 'ACTION_REQUIRED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.updateDb(d => {
    if (!(d as any).riskIncidents) (d as any).riskIncidents = [];
    (d as any).riskIncidents.unshift(incident);

    // Enforce action directly on user if entity is USER or ORDER
    if (data.actionTaken === 'COD_RESTRICTED') {
      const user = d.users.find(u => u.id === data.entityId || u.email.toLowerCase() === (data.entityReference || '').toLowerCase());
      if (user) {
        (user as any).isCodRestricted = true;
        user.isHighRiskFlagged = true;
        (user as any).codRestrictionDate = new Date().toISOString();
        (user as any).codRestrictionReason = `Risk Incident Enforced: ${data.factors?.join(', ')}`;
      }
    }
  });

  db.addAuditLog({
    userId: req.user?.id,
    userName: req.user?.name as string,
    userRole: (req.user?.role || 'ADMIN') as any,
    action: 'RISK_INCIDENT_ENFORCED',
    entityType: data.entityType,
    entityId: data.entityId || data.entityReference,
    newValue: `Enforced action ${data.actionTaken} for risk incident #${incident.incidentNumber}`
  });

  res.json({ success: true, incident });
});

// GET /api/admin/risk-incidents
router.get('/risk-incidents', (req: AuthenticatedRequest, res: Response) => {
  const incidents = (db.getDb() as any).riskIncidents || [];
  res.json({ incidents });
});

// GET /api/admin/builder-config
router.get('/builder-config', (req: AuthenticatedRequest, res: Response) => {
  const currentDb = db.getDb();
  res.json({ success: true, builderConfig: currentDb.builderConfig || {} });
});

// POST /api/admin/builder-config
router.post('/builder-config', (req: AuthenticatedRequest, res: Response) => {
  const { config } = req.body;
  if (!config) return res.status(400).json({ error: 'Config object required' });

  db.updateDb(d => {
    d.builderConfig = {
      ...(d.builderConfig || {}),
      ...config
    };
  });

  res.json({ success: true, builderConfig: db.getDb().builderConfig });
});

// DELETE /api/admin/risk-incidents/:id
router.delete('/risk-incidents/:id', requireRole('SUPER_ADMIN', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  let removed = false;
  db.updateDb((d: any) => {
    if (d.riskIncidents) {
      const prevLen = d.riskIncidents.length;
      d.riskIncidents = d.riskIncidents.filter((r: any) => r.id !== id && r.incidentNumber !== id);
      if (d.riskIncidents.length < prevLen) removed = true;
    }
  });
  if (!removed) return res.status(404).json({ error: 'Risk incident not found' });
  res.json({ success: true, message: 'Risk incident deleted' });
});

// DELETE /api/admin/payouts/:id
router.delete('/payouts/:id', requireRole('SUPER_ADMIN', 'ADMIN', 'FINANCE_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  let removed = false;
  db.updateDb((d: any) => {
    if (d.payouts) {
      const prevLen = d.payouts.length;
      d.payouts = d.payouts.filter((p: any) => p.id !== id && p.reference !== id);
      if (d.payouts.length < prevLen) removed = true;
    }
  });
  db.addAuditLog({
    userId: req.user?.id || 'admin',
    userName: req.user?.name as string,
    userRole: (req.user?.role || 'SUPER_ADMIN') as any,
    action: 'DELETE_PAYOUT',
    entityType: 'PAYOUT',
    entityId: id,
    severity: 'WARNING',
    newValue: `Deleted payout transaction record ${id}`
  });
  res.json({ success: true, message: 'Payout deleted successfully' });
});

// DELETE /api/admin/disputes/:id
router.delete('/disputes/:id', requireRole('SUPER_ADMIN', 'ADMIN', 'OPERATIONS_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  let removed = false;
  db.updateDb((d: any) => {
    if (d.disputes) {
      const prevLen = d.disputes.length;
      d.disputes = d.disputes.filter((dsp: any) => dsp.id !== id);
      if (d.disputes.length < prevLen) removed = true;
    }
  });
  db.addAuditLog({
    userId: req.user?.id || 'admin',
    userName: req.user?.name as string,
    userRole: (req.user?.role || 'SUPER_ADMIN') as any,
    action: 'DELETE_DISPUTE',
    entityType: 'DISPUTE',
    entityId: id,
    severity: 'INFO',
    newValue: `Deleted dispute record #${id}`
  });
  res.json({ success: true, message: 'Dispute deleted successfully' });
});

// DELETE /api/admin/support/:id
router.delete('/support/:id', requireRole('SUPER_ADMIN', 'ADMIN', 'OPERATIONS_ADMIN', 'CUSTOMER_SUPPORT'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  let removed = false;
  db.updateDb((d: any) => {
    if (d.supportTickets) {
      const prevLen = d.supportTickets.length;
      d.supportTickets = d.supportTickets.filter((t: any) => t.id !== id);
      if (d.supportTickets.length < prevLen) removed = true;
    }
  });
  db.addAuditLog({
    userId: req.user?.id || 'admin',
    userName: req.user?.name as string,
    userRole: (req.user?.role || 'SUPER_ADMIN') as any,
    action: 'DELETE_SUPPORT_TICKET',
    entityType: 'SUPPORT_TICKET',
    entityId: id,
    severity: 'INFO',
    newValue: `Deleted support ticket #${id}`
  });
  res.json({ success: true, message: 'Support ticket deleted successfully' });
});

// PUT /api/admin/commission-rules/:id
router.put('/commission-rules/:id', requireRole('SUPER_ADMIN', 'ADMIN', 'FINANCE_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  let updatedRule: any = null;

  db.updateDb(d => {
    const rule = (d.commissionRules || []).find(r => r.id === id);
    if (rule) {
      if (updates.category) rule.category = updates.category;
      if (updates.subCategory !== undefined) rule.subCategory = updates.subCategory;
      if (updates.sellerTier !== undefined) rule.sellerTier = updates.sellerTier;
      if (updates.commissionRate !== undefined) rule.commissionRate = Number(updates.commissionRate);
      if (updates.fixedFee !== undefined) rule.fixedFee = Number(updates.fixedFee);
      if (updates.isActive !== undefined) rule.isActive = updates.isActive;
      updatedRule = rule;
    }
  });

  if (!updatedRule) {
    return res.status(404).json({ error: 'Commission rule not found' });
  }

  db.addAuditLog({
    userId: req.user?.id || 'admin',
    userName: req.user?.name as string,
    userRole: (req.user?.role || 'ADMIN') as any,
    action: 'UPDATE_COMMISSION_RULE',
    entityType: 'COMMISSION_RULE',
    entityId: id,
    newValue: `Updated commission rule ${id} (${updatedRule.category})`,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] as string
  });

  res.json({ success: true, commissionRule: updatedRule });
});

// DELETE /api/admin/commission-rules/:id
router.delete('/commission-rules/:id', requireRole('SUPER_ADMIN', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  let removed = false;

  db.updateDb(d => {
    const prev = (d.commissionRules || []).length;
    d.commissionRules = (d.commissionRules || []).filter(r => r.id !== id);
    if (d.commissionRules.length < prev) removed = true;
  });

  if (!removed) {
    return res.status(404).json({ error: 'Commission rule not found' });
  }

  db.addAuditLog({
    userId: req.user?.id || 'admin',
    userName: req.user?.name as string,
    userRole: (req.user?.role || 'SUPER_ADMIN') as any,
    action: 'DELETE_COMMISSION_RULE',
    entityType: 'COMMISSION_RULE',
    entityId: id,
    newValue: `Deleted commission rule ${id}`,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] as string
  });

  res.json({ success: true, message: 'Commission rule deleted successfully' });
});

// DELETE /api/admin/audit-logs/:id
router.delete('/audit-logs/:id', requireRole('SUPER_ADMIN', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  let removed = false;

  db.updateDb(d => {
    const prev = (d.auditLogs || []).length;
    d.auditLogs = (d.auditLogs || []).filter(l => l.id !== id);
    if (d.auditLogs.length < prev) removed = true;
  });

  if (!removed) {
    return res.status(404).json({ error: 'Audit log entry not found' });
  }

  db.addAuditLog({
    userId: req.user?.id || 'admin',
    userName: req.user?.name as string,
    userRole: (req.user?.role || 'SUPER_ADMIN') as any,
    action: 'DELETE_AUDIT_LOG_ENTRY',
    entityType: 'SECURITY',
    entityId: id,
    severity: 'CRITICAL',
    details: `Administrator deleted audit log entry ${id}`,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] as string
  });

  res.json({ success: true, message: 'Audit log removed' });
});

// POST /api/admin/audit-logs/retention-purge (Super Administrator only)
router.post('/audit-logs/retention-purge', requireRole('SUPER_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { olderThanDays } = req.body;
  const days = Number(olderThanDays) || 365;
  const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
  let purgedCount = 0;

  db.updateDb(d => {
    const originalLength = (d.auditLogs || []).length;
    d.auditLogs = (d.auditLogs || []).filter(l => {
      const logTime = new Date(l.timestamp).getTime();
      return isNaN(logTime) || logTime >= cutoffTime;
    });
    purgedCount = originalLength - (d.auditLogs || []).length;
  });

  db.addAuditLog({
    userId: req.user?.id || 'admin',
    userName: req.user?.name as string,
    userRole: (req.user?.role || 'SUPER_ADMIN') as any,
    action: 'PURGE_AUDIT_LOGS_RETENTION',
    entityType: 'SECURITY',
    entityId: 'audit-logs',
    severity: 'CRITICAL',
    newValue: `Purged ${purgedCount} audit logs older than ${days} days`,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] as string
  });

  res.json({ success: true, purgedCount, message: `Successfully purged ${purgedCount} expired audit logs.` });
});

// PUT /api/admin/sellers/:id (Edit seller)
router.put('/sellers/:id', requireRole('SUPER_ADMIN', 'ADMIN', 'CATALOG_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  let updatedSeller: any = null;

  db.updateDb(d => {
    const seller = d.sellers.find(s => s.id === id);
    if (seller) {
      if (updates.name) seller.name = updates.name;
      if (updates.city) seller.city = updates.city;
      if (updates.country) seller.country = updates.country;
      if (updates.rating !== undefined) seller.rating = Number(updates.rating);
      if (updates.isOfficialStore !== undefined) seller.isOfficialStore = updates.isOfficialStore;
      if (updates.badge !== undefined) seller.badge = updates.badge;
      if (updates.description) seller.description = updates.description;
      updatedSeller = seller;
    }
  });

  if (!updatedSeller) {
    return res.status(404).json({ error: 'Seller not found' });
  }

  db.addAuditLog({
    userId: req.user?.id || 'admin',
    userName: req.user?.name as string,
    userRole: (req.user?.role || 'ADMIN') as any,
    action: 'UPDATE_SELLER_PROFILE',
    entityType: 'SELLER',
    entityId: id,
    newValue: `Updated merchant profile for ${updatedSeller.name}`,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] as string
  });

  res.json({ success: true, seller: updatedSeller });
});

// DELETE /api/admin/sellers/:id
router.delete('/sellers/:id', requireRole('SUPER_ADMIN', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  let removed = false;
  let deletedSeller: any = null;

  db.updateDb(d => {
    // Check d.sellers
    const sIdx = (d.sellers || []).findIndex(s => s.id === id);
    if (sIdx !== -1) {
      deletedSeller = d.sellers[sIdx];
      d.sellers.splice(sIdx, 1);
      removed = true;
    }
    // Check d.pendingSellers
    if ((d as any).pendingSellers) {
      const pIdx = (d as any).pendingSellers.findIndex((s: any) => s.id === id);
      if (pIdx !== -1) {
        deletedSeller = deletedSeller || (d as any).pendingSellers[pIdx];
        (d as any).pendingSellers.splice(pIdx, 1);
        removed = true;
      }
    }
    // Check d.verifiedSellers
    if ((d as any).verifiedSellers) {
      const vIdx = (d as any).verifiedSellers.findIndex((s: any) => s.id === id);
      if (vIdx !== -1) {
        deletedSeller = deletedSeller || (d as any).verifiedSellers[vIdx];
        (d as any).verifiedSellers.splice(vIdx, 1);
        removed = true;
      }
    }
    // Check associated seller users
    const uIdx = (d.users || []).findIndex(u => u.id === id || u.sellerId === id);
    if (uIdx !== -1) {
      deletedSeller = deletedSeller || d.users[uIdx];
      d.users.splice(uIdx, 1);
      removed = true;
    }
  });

  if (!removed) {
    return res.status(404).json({ error: 'Seller not found' });
  }

  db.addAuditLog({
    userId: req.user?.id || 'admin',
    userName: req.user?.name as string,
    userRole: (req.user?.role || 'SUPER_ADMIN') as any,
    action: 'DELETE_SELLER',
    entityType: 'SELLER',
    entityId: id,
    severity: 'WARNING',
    newValue: `Permanently deleted seller ${deletedSeller?.shopName || deletedSeller?.name || id}`,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] as string
  });

  res.json({ success: true, message: 'Seller deleted successfully' });
});

// GET /api/admin/security/overview - Get cybersecurity WAF status, threat stats, and banned IPs
router.get('/security/overview', (req: AuthenticatedRequest, res: Response) => {
  const logs = getSecurityLogs();
  const banned = getBannedIPs();

  const totalIncidents = logs.length;
  const criticalThreats = logs.filter((l: any) => l.severity === 'CRITICAL').length;
  const highThreats = logs.filter((l: any) => l.severity === 'HIGH').length;

  res.json({
    status: 'ACTIVE',
    wafShieldEnabled: true,
    ddosProtectionEnabled: true,
    owaspHeadersActive: true,
    totalIncidentsDetected: totalIncidents,
    criticalThreats,
    highThreats,
    bannedIPsCount: banned.length,
    bannedIPs: banned,
    recentLogs: logs.slice(0, 50)
  });
});

// POST /api/admin/security/unban - Unban an IP address
router.post('/security/unban', (req: AuthenticatedRequest, res: Response) => {
  const { ip } = req.body;
  if (!ip) return res.status(400).json({ error: 'IP address is required' });

  unbanIP(ip);

  db.addAuditLog({
    userId: req.user?.id || 'admin',
    userName: req.user?.name as string,
    userRole: (req.user?.role || 'ADMIN') as any,
    action: 'UNBAN_IP_ADDRESS',
    entityType: 'SECURITY',
    entityId: ip,
    newValue: `Unbanned IP address ${ip}`,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] as string
  });

  res.json({ success: true, message: `IP ${ip} has been removed from banned list.` });
});

export default router;

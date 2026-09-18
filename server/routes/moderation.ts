import { Router, Response } from 'express';
import { db } from '../db.js';
import { AuthenticatedRequest, requireRole } from '../middleware/auth.js';

const router = Router();

// Protect all moderation endpoints with administrative/moderator RBAC guard
router.use(requireRole('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'CATALOG_ADMIN'));

// GET /api/moderation/items
router.get('/items', (req: AuthenticatedRequest, res: Response) => {
  const items = db.getDb().moderationItems || [];
  res.json({ items });
});

// GET /api/moderation/stats
router.get('/stats', (req: AuthenticatedRequest, res: Response) => {
  const d = db.getDb();
  const items = d.moderationItems || [];

  const totalCatalogItems = 1245870;
  const newItemsAdded = 28540;
  const underReview = items.filter(i => i.status === 'PENDING' || (i.status as string) === 'UNDER_REVIEW').length + 7842;
  const rejected = items.filter(i => i.status === 'REJECTED').length + 1243;
  const approvalRate = 94.6;
  const qualityScore = 92;

  res.json({
    totalCatalogItems,
    newItemsAdded,
    underReview,
    rejected,
    approvalRate,
    qualityScore,
    categoryScores: [
      { category: 'Electronics', score: 95, trend: 'up' },
      { category: 'Home & Kitchen', score: 93, trend: 'up' },
      { category: 'Fashion', score: 91, trend: 'neutral' },
      { category: 'Beauty', score: 90, trend: 'down' },
      { category: 'Sports', score: 88, trend: 'down' },
    ],
    alerts: [
      { id: 'alt-1', title: 'High number of policy violations', message: 'Prohibited content violations increased by 18%', type: 'DANGER', time: 'May 24, 2024 10:05 AM' },
      { id: 'alt-2', title: 'SLA breach risk', message: '1,243 items are past SLA', type: 'WARNING', time: 'May 24, 2024 09:50 AM' },
      { id: 'alt-3', title: 'Quality score improved', message: 'Overall quality score improved by 3.4 points', type: 'INFO', time: 'May 24, 2024 09:20 AM' },
    ]
  });
});

// POST /api/moderation/resolve
router.post('/resolve', requireRole('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'CATALOG_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { itemId, action, note } = req.body as { itemId: string; action: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED' | 'ESCALATED' | 'REMOVED'; note?: string };

  let item: any = null;
  db.updateDb(d => {
    item = d.moderationItems.find(m => m.id === itemId);
    if (!item) {
      // Create a temporary item record if not found in memory DB
      item = {
        id: itemId,
        type: 'PRODUCT_APPROVAL',
        targetId: itemId,
        targetName: 'Catalog Item ' + itemId,
        details: note || 'Moderation decision recorded',
        riskScore: 'MEDIUM',
        status: action,
        createdAt: new Date().toISOString()
      };
      d.moderationItems.unshift(item);
    } else {
      item.status = action;
      item.reviewedBy = req.user?.name || 'Kelvin Temba';
      item.resolutionNote = note || `Action ${action} taken by moderator`;
      item.resolvedAt = new Date().toISOString();
    }

    if (item.type === 'PRODUCT_APPROVAL' && action === 'APPROVED') {
      const prod = d.products.find(p => p.id === item?.targetId);
      if (prod) {
        prod.badges = prod.badges || [];
        if (!prod.badges.includes('TOP SELLER')) {
          prod.badges.push('TOP SELLER');
        }
      }
    }
  });

  db.addAuditLog({
    userId: req.user?.id as string,
    userName: req.user?.name as string,
    userRole: (req.user?.role || 'MODERATOR') as any,
    action: `MODERATION_${action}`,
    entityType: 'PRODUCT',
    entityId: item?.targetId || itemId,
    newValue: `${action}: ${note || ''}`,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] as string
  });

  res.json({ success: true, item });
});

export default router;

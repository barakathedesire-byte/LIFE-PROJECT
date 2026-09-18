import * as crypto from 'crypto';
import { Router, Response } from 'express';
import { db } from '../db.js';
import { AuthenticatedRequest, requireRole } from '../middleware/auth.js';
import { isUserVerified } from '../middleware/verificationGuard.js';
import { Promotion } from '../../src/types/index.js';

const router = Router();

// GET /api/promotions - List promotions with filters
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const isAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN' || req.user?.role === 'CATALOG_ADMIN';
  let sellerId: string | undefined;

  if (isAdmin) {
    sellerId = (req.query.sellerId as string) || undefined;
  } else if (req.user?.role === 'SELLER') {
    sellerId = req.user.sellerId;
  } else if (req.query.sellerId) {
    sellerId = req.query.sellerId as string;
  }

  const status = req.query.status as string;
  const code = (req.query.code as string)?.trim()?.toUpperCase();
  const search = (req.query.search as string)?.trim()?.toLowerCase();

  let promotions = db.getDb().promotions || [];

  if (sellerId) {
    promotions = promotions.filter(p => p.sellerId === sellerId);
  }

  if (status && status !== 'All') {
    promotions = promotions.filter(p => p.status.toLowerCase() === status.toLowerCase());
  }

  if (code) {
    promotions = promotions.filter(p => p.coupon?.requireCoupon && p.coupon?.code?.toUpperCase() === code);
  }

  if (search) {
    promotions = promotions.filter(p => 
      p.name.toLowerCase().includes(search) || 
      (p.internalRef && p.internalRef.toLowerCase().includes(search)) ||
      (p.coupon?.code && p.coupon.code.toLowerCase().includes(search))
    );
  }

  res.json({ promotions, count: promotions.length });
});

// GET /api/promotions/:id - Get single promotion
router.get('/:id', (req: AuthenticatedRequest, res: Response) => {
  const promo = (db.getDb().promotions || []).find(p => p.id === req.params.id);
  if (!promo) {
    return res.status(404).json({ error: 'Promotion not found' });
  }

  const isAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN' || req.user?.role === 'CATALOG_ADMIN';
  if (req.user?.role === 'SELLER' && !isAdmin && promo.sellerId !== req.user?.sellerId) {
    return res.status(403).json({ error: 'Forbidden: You do not own this promotion.' });
  }

  res.json({ promotion: promo });
});

// POST /api/promotions - Create promotion (No-Code Builder Backend)
router.post('/', requireRole('SUPER_ADMIN', 'ADMIN', 'CATALOG_ADMIN', 'SELLER'), (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  const isAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN' || req.user?.role === 'CATALOG_ADMIN';

  if (!isAdmin && req.user?.role === 'SELLER') {
    if (!isUserVerified(req.user)) {
      return res.status(403).json({
        error: 'VERIFICATION_REQUIRED',
        message: 'Seller account must be verified before creating promotions.'
      });
    }
  }

  const sellerId = isAdmin ? (data.sellerId || req.user?.sellerId) : req.user?.sellerId;
  const seller = db.getDb().sellers.find(s => s.id === sellerId);
  if (!sellerId || !seller) {
    return res.status(403).json({ error: 'Valid seller identity required' });
  }
  const sellerName = seller.name;

  // 1. Validation checks
  if (!data.name || !data.name.trim()) {
    return res.status(400).json({ error: 'Promotion name is required' });
  }

  if (!data.promotionType) {
    return res.status(400).json({ error: 'Promotion type is required' });
  }

  if (!data.startDate || !data.endDate) {
    return res.status(400).json({ error: 'Start date and end date are required' });
  }

  const start = new Date(`${data.startDate}T${data.startTime || '00:00'}`);
  const end = new Date(`${data.endDate}T${data.endTime || '23:59'}`);
  if (end <= start) {
    return res.status(400).json({ error: 'End date must be strictly after start date' });
  }

  // 2. Vendor Product Ownership Enforcement (Server-side constraint)
  const vendorProducts = db.getDb().products.filter(p => p.sellerId === sellerId);
  const vendorProductIds = new Set(vendorProducts.map(p => p.id));

  if (data.appliesTo === 'Specific Products' && Array.isArray(data.productIds)) {
    const invalidProducts = data.productIds.filter((pid: string) => !vendorProductIds.has(pid));
    if (invalidProducts.length > 0) {
      return res.status(403).json({ 
        error: 'Vendor Isolation Security Warning: You can only create promotions for your own products.',
        invalidProductIds: invalidProducts
      });
    }
  }

  // 3. Coupon Code Uniqueness Verification
  if (data.coupon?.requireCoupon && data.coupon?.code) {
    const cleanCode = data.coupon.code.trim().toUpperCase();
    const existingCoupon = (db.getDb().promotions || []).find(p => 
      p.coupon?.requireCoupon && 
      p.coupon?.code?.toUpperCase() === cleanCode && 
      p.id !== data.id &&
      p.status !== 'Cancelled' && p.status !== 'Expired'
    );
    if (existingCoupon) {
      return res.status(400).json({ error: `Coupon code '${cleanCode}' is already in use by another active promotion.` });
    }
  }

  // 4. Financial Margin Protection Check
  const discountPercent = Number(data.discountConfig?.percentage) || 0;
  const minVendorMargin = Number(data.financials?.minVendorMarginPercent) || 15;

  if (discountPercent > 0 && (100 - discountPercent) < minVendorMargin) {
    return res.status(400).json({ 
      error: `Promotion exceeds allowed margin threshold. Your discount (${discountPercent}%) would leave margin below the required ${minVendorMargin}% minimum.` 
    });
  }

  // 5. Admin Approval Workflow Trigger
  let initialStatus = data.status || 'Draft';
  let approvalStatus: 'APPROVED' | 'SUBMITTED' | 'UNDER_REVIEW' | 'REJECTED' | 'NOT_REQUIRED' = 'APPROVED';

  // Require admin review if discount > 35% or high budget
  if (discountPercent > 35 || (data.limits?.maxTotalUses && data.limits.maxTotalUses > 1000)) {
    initialStatus = 'Under Review';
    approvalStatus = 'SUBMITTED';
  } else if (initialStatus === 'Active' || initialStatus === 'Scheduled') {
    approvalStatus = 'APPROVED';
  }

  const newPromo: Promotion = {
    id: `promo-${Date.now()}-${crypto.randomInt(0, 1000)}`,
    sellerId,
    sellerName,
    name: data.name.trim(),
    internalRef: data.internalRef || `REF-${crypto.randomInt(1000, 10000)}`,
    description: data.description || '',
    imageUrl: data.imageUrl || '',
    promotionType: data.promotionType,
    startDate: data.startDate,
    startTime: data.startTime || '00:00',
    endDate: data.endDate,
    endTime: data.endTime || '23:59',
    timezone: data.timezone || 'EAT (UTC+3)',
    status: initialStatus,
    approvalStatus,
    appliesTo: data.appliesTo || 'Specific Products',
    productIds: data.productIds || [],
    categoryIds: data.categoryIds || [],
    excludedProductIds: data.excludedProductIds || [],
    excludedCategoryIds: data.excludedCategoryIds || [],
    excludeOutOfStock: data.excludeOutOfStock ?? true,
    excludeAlreadyDiscounted: data.excludeAlreadyDiscounted ?? false,
    discountConfig: data.discountConfig || {},
    customerEligibility: data.customerEligibility || { targetSegment: 'All Customers' },
    limits: data.limits || {},
    coupon: data.coupon || { requireCoupon: false },
    stacking: data.stacking || { canCombine: true },
    storefrontDisplay: data.storefrontDisplay || { placements: ['Product Page', 'Vendor Store'] },
    ruleBuilder: data.ruleBuilder || undefined,
    financials: data.financials || { vendorFundedPercent: 100, platformFundedPercent: 0, estimatedUnitsAffected: 100, minVendorMarginPercent: 15 },
    analytics: { views: 0, clicks: 0, redemptions: 0, orders: 0, revenue: 0, totalDiscountGiven: 0, conversionRate: 0 },
    createdBy: req.user?.id as string,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: initialStatus === 'Active' ? new Date().toISOString() : undefined,
    version: 1
  };

  db.updateDb(d => {
    if (!d.promotions) d.promotions = [];
    d.promotions.unshift(newPromo);

    // Create Notification for Vendor
    d.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: req.user?.id as string,
      title: approvalStatus === 'SUBMITTED' ? 'Promotion Submitted for Approval' : 'Promotion Created & Published',
      message: approvalStatus === 'SUBMITTED' 
        ? `Your promotion "${newPromo.name}" requires admin review due to high discount limits.`
        : `Promotion "${newPromo.name}" is now ${newPromo.status.toLowerCase()}.`,
      type: 'PROMOTION',
      isRead: false,
      createdAt: new Date().toISOString()
    });
  });

  db.addAuditLog({
    userId: req.user?.id as string,
    userName: req.user?.name || sellerName,
    userRole: 'SELLER',
    action: approvalStatus === 'SUBMITTED' ? 'PROMOTION_SUBMITTED' : 'PROMOTION_CREATED',
    entityType: 'PROMOTION' as any,
    entityId: newPromo.id,
    newValue: `Created ${newPromo.promotionType} promotion "${newPromo.name}" with status ${newPromo.status}`
  });

  res.status(201).json({ promotion: newPromo, message: 'Promotion created successfully' });
});

// PUT /api/promotions/:id - Update Promotion
router.put('/:id', requireRole('SUPER_ADMIN', 'ADMIN', 'CATALOG_ADMIN', 'SELLER'), (req: AuthenticatedRequest, res: Response) => {
  const promoId = req.params.id;
  const data = req.body;
  const isAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN' || req.user?.role === 'CATALOG_ADMIN';
  const sellerId = req.user?.sellerId;

  if (!isAdmin && req.user?.role === 'SELLER') {
    if (!isUserVerified(req.user)) {
      return res.status(403).json({
        error: 'VERIFICATION_REQUIRED',
        message: 'Seller account must be verified before updating promotions.'
      });
    }
  }

  const existing = (db.getDb().promotions || []).find(p => p.id === promoId);
  if (!existing) {
    return res.status(404).json({ error: 'Promotion not found' });
  }

  if (!isAdmin && existing.sellerId !== sellerId) {
    return res.status(403).json({ error: 'Forbidden: You do not own this promotion.' });
  }

  const safeData = { ...data };
  delete safeData.id;
  delete safeData.sellerId;

  let updatedPromo: Promotion | null = null;

  db.updateDb(d => {
    if (!d.promotions) d.promotions = [];
    const index = d.promotions.findIndex(p => p.id === promoId);
    if (index === -1) return;

    updatedPromo = {
      ...d.promotions[index],
      ...safeData,
      id: d.promotions[index].id,
      sellerId: d.promotions[index].sellerId,
      updatedAt: new Date().toISOString(),
      version: d.promotions[index].version + 1
    };

    d.promotions[index] = updatedPromo;
  });

  res.json({ promotion: updatedPromo });
});

// POST /api/promotions/:id/status - Update Status (Pause, Resume, Approve, Reject, Cancel)
router.post('/:id/status', requireRole('SUPER_ADMIN', 'ADMIN', 'CATALOG_ADMIN', 'SELLER'), (req: AuthenticatedRequest, res: Response) => {
  const promoId = req.params.id;
  const { status, rejectionReason, adminComment } = req.body;
  
  const isAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN' || req.user?.role === 'CATALOG_ADMIN';
  const sellerId = req.user?.sellerId;

  if (!isAdmin && req.user?.role === 'SELLER') {
    if (!isUserVerified(req.user)) {
      return res.status(403).json({
        error: 'VERIFICATION_REQUIRED',
        message: 'Seller account must be verified before modifying promotion status.'
      });
    }
  }

  // Only admins can approve or reject
  if ((status === 'APPROVED' || status === 'REJECTED') && !isAdmin) {
    return res.status(403).json({ error: 'Only administrators can approve or reject promotions' });
  }

  const existing = (db.getDb().promotions || []).find(p => p.id === promoId);
  if (!existing) {
    return res.status(404).json({ error: 'Promotion not found' });
  }

  if (!isAdmin && existing.sellerId !== sellerId) {
    return res.status(403).json({ error: 'Forbidden: You do not own this promotion.' });
  }

  let updatedPromo: Promotion | null = null;

  db.updateDb(d => {
    if (!d.promotions) d.promotions = [];
    const promo = d.promotions.find(p => p.id === promoId);
    if (!promo) return;

    if (status === 'APPROVED') {
      promo.status = 'Active';
      promo.approvalStatus = 'APPROVED';
      promo.publishedAt = new Date().toISOString();
    } else if (status === 'REJECTED') {
      promo.status = 'Rejected';
      promo.approvalStatus = 'REJECTED';
      promo.rejectionReason = rejectionReason || 'Does not comply with platform promotion guidelines';
      promo.adminComment = adminComment || '';
    } else {
      promo.status = status;
    }

    promo.updatedAt = new Date().toISOString();
    updatedPromo = promo;

    // Notify seller
    d.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: promo.createdBy,
      title: `Promotion ${status.toUpperCase()}`,
      message: `Your promotion "${promo.name}" status changed to ${status}.`,
      type: 'PROMOTION',
      isRead: false,
      createdAt: new Date().toISOString()
    });
  });

  res.json({ promotion: updatedPromo, message: `Status updated to ${status}` });
});

// POST /api/promotions/:id/duplicate - Duplicate Promotion into Draft
router.post('/:id/duplicate', requireRole('SUPER_ADMIN', 'ADMIN', 'CATALOG_ADMIN', 'SELLER'), (req: AuthenticatedRequest, res: Response) => {
  const promoId = req.params.id;
  const isAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN' || req.user?.role === 'CATALOG_ADMIN';
  const sellerId = req.user?.sellerId;

  if (!isAdmin && req.user?.role === 'SELLER') {
    if (!isUserVerified(req.user)) {
      return res.status(403).json({
        error: 'VERIFICATION_REQUIRED',
        message: 'Seller account must be verified before duplicating promotions.'
      });
    }
  }

  const existing = (db.getDb().promotions || []).find(p => p.id === promoId);
  if (!existing) {
    return res.status(404).json({ error: 'Promotion not found' });
  }

  if (!isAdmin && existing.sellerId !== sellerId) {
    return res.status(403).json({ error: 'Forbidden: You do not own this promotion.' });
  }

  const duplicated: Promotion = {
    ...existing,
    id: `promo-${Date.now()}-${crypto.randomInt(0, 1000)}`,
    name: `${existing.name} (Copy)`,
    internalRef: `${existing.internalRef || 'REF'}-COPY`,
    status: 'Draft',
    approvalStatus: 'NOT_REQUIRED',
    analytics: { views: 0, clicks: 0, redemptions: 0, orders: 0, revenue: 0, totalDiscountGiven: 0, conversionRate: 0 },
    coupon: existing.coupon ? { ...existing.coupon, code: existing.coupon.code ? `${existing.coupon.code}COPY` : undefined } : { requireCoupon: false },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: undefined,
    version: 1
  };

  db.updateDb(d => {
    if (!d.promotions) d.promotions = [];
    d.promotions.unshift(duplicated);
  });

  res.status(201).json({ promotion: duplicated, message: 'Promotion duplicated successfully into Draft' });
});

// POST /api/promotions/validate-cart - Backend Cart Promotion Enforcement Engine
router.post('/validate-cart', (req: AuthenticatedRequest, res: Response) => {
  const { cartItems, couponCode, customerId } = req.body;

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return res.json({ valid: true, discountTotal: 0, freeDelivery: false, appliedPromotions: [], items: cartItems });
  }

  const cleanCoupon = (couponCode || '').trim().toUpperCase();
  const allPromos = db.getDb().promotions || [];
  const now = new Date();

  // Find active promotions
  const activePromos = allPromos.filter(p => {
    if (p.status !== 'Active') return false;
    const start = new Date(`${p.startDate}T${p.startTime || '00:00'}`);
    const end = new Date(`${p.endDate}T${p.endTime || '23:59'}`);
    return now >= start && now <= end;
  });

  let discountTotal = 0;
  let freeDelivery = false;
  const appliedPromotions: any[] = [];
  const processedItems = cartItems.map((item: any) => ({ ...item, discountedPrice: item.price, itemDiscount: 0 }));

  for (const promo of activePromos) {
    // If coupon is required, check matching code
    if (promo.coupon?.requireCoupon) {
      if (!cleanCoupon || promo.coupon.code?.toUpperCase() !== cleanCoupon) {
        continue;
      }
    }

    // Check minimum order value constraint
    const cartSubtotal = cartItems.reduce((sum: number, i: any) => sum + (i.price * i.quantity), 0);
    if (promo.discountConfig?.minOrderValue && cartSubtotal < promo.discountConfig.minOrderValue) {
      continue;
    }

    // Evaluate discount per item
    let promoDiscountForCart = 0;

    if (promo.promotionType === 'Free Delivery') {
      freeDelivery = true;
      appliedPromotions.push({ id: promo.id, name: promo.name, type: 'Free Delivery', discount: 'FREE_SHIPPING' });
    } else if (promo.promotionType === 'Percentage Discount') {
      const pct = (promo.discountConfig?.percentage || 0) / 100;
      processedItems.forEach(item => {
        if (promo.appliesTo === 'All Vendor Products' || (promo.productIds && promo.productIds.includes(item.id))) {
          const discountPerUnit = item.price * pct;
          const itemDiscount = discountPerUnit * item.quantity;
          item.itemDiscount += itemDiscount;
          item.discountedPrice = Math.max(0, item.price - discountPerUnit);
          promoDiscountForCart += itemDiscount;
        }
      });

      // Max discount amount cap
      if (promo.discountConfig?.maxDiscountAmount && promoDiscountForCart > promo.discountConfig.maxDiscountAmount) {
        promoDiscountForCart = promo.discountConfig.maxDiscountAmount;
      }

      discountTotal += promoDiscountForCart;
      appliedPromotions.push({ id: promo.id, name: promo.name, type: promo.promotionType, discountAmount: promoDiscountForCart });
    } else if (promo.promotionType === 'Fixed Amount Discount') {
      const fixedAmt = promo.discountConfig?.fixedDiscountAmount || 0;
      discountTotal += fixedAmt;
      appliedPromotions.push({ id: promo.id, name: promo.name, type: promo.promotionType, discountAmount: fixedAmt });
    }
  }

  res.json({
    valid: true,
    discountTotal: Math.round(discountTotal),
    freeDelivery,
    appliedPromotions,
    items: processedItems
  });
});

// DELETE /api/promotions/:id
router.delete('/:id', requireRole('SUPER_ADMIN', 'ADMIN', 'CATALOG_ADMIN', 'SELLER'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const sellerId = req.user?.sellerId;
  const isAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN' || req.user?.role === 'CATALOG_ADMIN';

  if (!isAdmin && req.user?.role === 'SELLER') {
    const isVerified = req.user?.isVerified === true || req.user?.verificationStatus === 'VERIFIED';
    if (!isVerified) {
      return res.status(403).json({
        error: 'VERIFICATION_REQUIRED',
        message: 'Seller account must be verified before deleting promotions.'
      });
    }
  }

  const existing = (db.getDb().promotions || []).find(p => p.id === id);
  if (!existing) {
    return res.status(404).json({ error: 'Promotion not found' });
  }

  const userSellerId = req.user?.sellerId || req.user?.id;
  const isOwner = !existing.sellerId || existing.sellerId === userSellerId || existing.sellerId === req.user?.id;
  if (!isAdmin && !isOwner) {
    return res.status(403).json({ error: 'Forbidden: You do not own this promotion.' });
  }

  db.updateDb(d => {
    if (!d.promotions) d.promotions = [];
    d.promotions = d.promotions.filter(p => p.id !== id);
  });

  res.json({ success: true, message: 'Promotion deleted successfully' });
});

export default router;

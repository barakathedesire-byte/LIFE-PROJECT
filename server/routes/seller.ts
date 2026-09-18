import * as crypto from 'crypto';
import { Router, Response } from 'express';
import { db } from '../db.js';
import { AuthenticatedRequest, requireRole } from '../middleware/auth.js';
import { requireVerified } from '../middleware/auth.js';
import { isUserVerified } from '../middleware/verificationGuard.js';

const router = Router();

// Protect all seller-only routes with backend authentication and SELLER / ADMIN role checks
router.use(requireRole('SELLER', 'SUPER_ADMIN', 'ADMIN'));

/**
 * Authoritative Seller Context Resolver.
 * Resolves seller identity strictly from authenticated user.sellerId.
 * For administrative roles (SUPER_ADMIN, ADMIN), permits inspecting specific sellers.
 * Never defaults to arbitrary database records (no fallback to sellers[0] or hardcoded IDs).
 */
function getAuthorizedSellerContext(
  req: AuthenticatedRequest,
  res: Response
): { sellerId: string; seller: any; isAdmin: boolean } | null {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: 'Unauthorized: Authentication session required.' });
    return null;
  }

  const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN';
  const sellerId = isAdmin
    ? ((req.query.sellerId as string) || (req.body?.sellerId as string) || user.sellerId)
    : user.sellerId;

  if (!sellerId) {
    res.status(403).json({
      error: 'Forbidden: No seller profile associated with this account.',
      code: 'NO_SELLER_IDENTITY'
    });
    return null;
  }

  const seller = db.getDb().sellers.find(s => s.id === sellerId);
  if (!seller) {
    res.status(404).json({
      error: 'Seller account not found in database.',
      code: 'SELLER_NOT_FOUND'
    });
    return null;
  }

  return { sellerId, seller, isAdmin };
}

/**
 * Authoritative Seller Verification Guard.
 * Checks whether the seller account has completed KYC and operational verification.
 * Admins bypass verification checks.
 */
function checkVerifiedSeller(req: AuthenticatedRequest, res: Response): boolean {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: 'Unauthorized: Authentication session required.' });
    return false;
  }

  const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN';
  if (isAdmin) {
    return true;
  }

  if (!isUserVerified(user)) {
    res.status(403).json({
      error: 'VERIFICATION_REQUIRED',
      message: 'Access Denied: Seller account must be backend-verified by LUMO operations before performing this operation.'
    });
    return false;
  }

  return true;
}

// GET /api/sellers/dashboard
router.get('/dashboard', (req: AuthenticatedRequest, res: Response) => {
  const ctx = getAuthorizedSellerContext(req, res);
  if (!ctx) return;
  const { sellerId, seller } = ctx;

  const products = db.getDb().products.filter(p => p.sellerId === sellerId);
  const sellerOrders = db.getDb().orders.filter(o =>
    o.items.some(i =>
      (i as any).sellerId === sellerId ||
      (i.sellerName || '').toLowerCase().includes(seller.name.toLowerCase()) ||
      seller.name.toLowerCase().includes((i.sellerName || '').toLowerCase())
    )
  );

  const revenue = sellerOrders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0);
  const completedOrders = sellerOrders.filter(o => o.status === 'Delivered').length;
  const pendingOrders = sellerOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  const cancelledOrders = sellerOrders.filter(o => o.status === 'Cancelled').length;
  const availableBalance = Math.round(revenue * 0.90);
  const pendingBalance = Math.round(pendingOrders * 120000);

  const inventoryAlerts = db.getDb().inventory
    .filter(i => i.sellerId === sellerId && i.available <= i.reorderLevel);

  const payouts = db.getDb().sellerPayouts.filter(p => p.sellerId === sellerId);
  const kyc = db.getDb().sellerKYC.find(k => k.sellerId === sellerId);

  // Calculate KYC lock status
  const now = new Date();
  let kycLockInfo = {
    isLocked: false,
    lockUntil: null as string | null,
    daysRemaining: 0
  };

  if (kyc && (kyc.status === 'APPROVED' || (kyc.status as string) === 'VERIFIED')) {
    const verifiedTime = kyc.verifiedAt ? new Date(kyc.verifiedAt).getTime() : Date.now() - 10 * 86400000;
    const lockUntilDate = new Date(verifiedTime + 60 * 24 * 60 * 60 * 1000);
    const isLocked = now.getTime() < lockUntilDate.getTime();
    const daysRemaining = isLocked ? Math.ceil((lockUntilDate.getTime() - now.getTime()) / 86400000) : 0;
    kycLockInfo = {
      isLocked,
      lockUntil: lockUntilDate.toISOString(),
      daysRemaining
    };
  }

  res.json({
    seller,
    metrics: {
      revenue,
      totalOrders: sellerOrders.length,
      completedOrders,
      pendingOrders,
      cancelledOrders,
      returnRate: '1.2%',
      availableBalance,
      pendingBalance,
      rating: seller.rating || 4.9,
      productsCount: products.length,
      followersCount: seller.followersCount || 0,
      isLiveCommerceActive: seller.isLiveCommerceActive || false
    },
    inventoryAlerts,
    recentOrders: sellerOrders.slice(0, 10),
    payouts,
    kyc: kyc ? { ...kyc, ...kycLockInfo } : null,
    kycLockInfo
  });
});

// GET /api/sellers/market-performance
router.get('/market-performance', (req: AuthenticatedRequest, res: Response) => {
  const ctx = getAuthorizedSellerContext(req, res);
  if (!ctx) return;
  const { sellerId, seller } = ctx;

  res.json({
    sellerId,
    sellerName: seller.name,
    category: 'Electronics & Smart Tech',
    rankings: {
      categoryRank: 3,
      totalSellersInCategory: 48,
      percentile: 94,
      badge: 'Top 6% Category Leader'
    },
    benchmarks: [
      {
        metric: 'Order Fulfillment Speed',
        sellerValue: '1.4 hours',
        categoryAverage: '4.8 hours',
        status: 'EXCELLENT',
        description: 'You prepare and dispatch packages faster than 92% of sellers in Dar es Salaam.'
      },
      {
        metric: 'Return & Defect Rate',
        sellerValue: '0.8%',
        categoryAverage: '3.4%',
        status: 'EXCELLENT',
        description: 'Your warranty compliance and authentic goods result in industry-low return rates.'
      },
      {
        metric: 'Price Competitiveness',
        sellerValue: '96/100',
        categoryAverage: '84/100',
        status: 'VERY_GOOD',
        description: 'Your deals on official smartphones are among the most visited in Kariakoo.'
      },
      {
        metric: 'Customer Rating Score',
        sellerValue: '4.9 ★',
        categoryAverage: '4.4 ★',
        status: 'EXCELLENT',
        description: 'Based on 100% verified delivered purchase reviews.'
      }
    ],
    marketTrends: [
      { category: 'Wireless Earbuds & Audio', growthPct: '+34%', demandLevel: 'HIGH' },
      { category: 'Solar Power Banks & Inverters', growthPct: '+28%', demandLevel: 'VERY_HIGH' },
      { category: '5G Android Handsets', growthPct: '+42%', demandLevel: 'HIGH' },
      { category: 'Smart Watches & Fitness', growthPct: '+18%', demandLevel: 'MEDIUM' }
    ]
  });
});

// GET /api/sellers/ads (List advertising campaigns scoped to seller)
router.get('/ads', (req: AuthenticatedRequest, res: Response) => {
  const ctx = getAuthorizedSellerContext(req, res);
  if (!ctx) return;
  const { sellerId } = ctx;

  const allAds = (db.getDb() as any).advertisingCampaigns || [];
  const sellerAds = allAds.filter((ad: any) => ad.sellerId === sellerId);
  res.json({ campaigns: sellerAds, total: sellerAds.length });
});

// POST /api/sellers/ads/:id/pause (IDOR protected)
router.post('/ads\/:id\/pause', requireVerified, (req: AuthenticatedRequest, res: Response) => {
  const ctx = getAuthorizedSellerContext(req, res);
  if (!ctx) return;
  const { sellerId, isAdmin } = ctx;
  const { id } = req.params;

  const allAds = (db.getDb() as any).advertisingCampaigns || [];
  const campaign = allAds.find((ad: any) => ad.id === id);
  if (!campaign) {
    return res.status(404).json({ error: 'Campaign not found' });
  }

  // IDOR check: caller must own this campaign unless admin
  if (!isAdmin && campaign.sellerId !== sellerId) {
    return res.status(403).json({ error: 'Forbidden: You do not own this advertising campaign.' });
  }

  let updatedCampaign: any = null;
  db.updateDb(d => {
    const campaigns = (d as any).advertisingCampaigns || [];
    const c = campaigns.find((ad: any) => ad.id === id);
    if (c) {
      c.status = 'PAUSED';
      c.updatedAt = new Date().toISOString();
      updatedCampaign = c;
    }
  });

  res.json({ success: true, campaign: updatedCampaign });
});

// POST /api/sellers/ads/:id/resume (IDOR & Verification protected)
router.post('/ads\/:id\/resume', requireVerified, (req: AuthenticatedRequest, res: Response) => {
  const ctx = getAuthorizedSellerContext(req, res);
  if (!ctx) return;
  if (!checkVerifiedSeller(req, res)) return;
  const { sellerId, isAdmin } = ctx;
  const { id } = req.params;

  const allAds = (db.getDb() as any).advertisingCampaigns || [];
  const campaign = allAds.find((ad: any) => ad.id === id);
  if (!campaign) {
    return res.status(404).json({ error: 'Campaign not found' });
  }

  // IDOR check: caller must own this campaign unless admin
  if (!isAdmin && campaign.sellerId !== sellerId) {
    return res.status(403).json({ error: 'Forbidden: You do not own this advertising campaign.' });
  }

  let updatedCampaign: any = null;
  db.updateDb(d => {
    const campaigns = (d as any).advertisingCampaigns || [];
    const c = campaigns.find((ad: any) => ad.id === id);
    if (c) {
      c.status = 'ACTIVE';
      c.updatedAt = new Date().toISOString();
      updatedCampaign = c;
    }
  });

  res.json({ success: true, campaign: updatedCampaign });
});

// POST /api/sellers/ads/:id/stop (IDOR protected)
router.post('/ads\/:id\/stop', requireVerified, (req: AuthenticatedRequest, res: Response) => {
  const ctx = getAuthorizedSellerContext(req, res);
  if (!ctx) return;
  const { sellerId, isAdmin } = ctx;
  const { id } = req.params;

  const allAds = (db.getDb() as any).advertisingCampaigns || [];
  const campaign = allAds.find((ad: any) => ad.id === id);
  if (!campaign) {
    return res.status(404).json({ error: 'Campaign not found' });
  }

  // IDOR check: caller must own this campaign unless admin
  if (!isAdmin && campaign.sellerId !== sellerId) {
    return res.status(403).json({ error: 'Forbidden: You do not own this advertising campaign.' });
  }

  let updatedCampaign: any = null;
  db.updateDb(d => {
    const campaigns = (d as any).advertisingCampaigns || [];
    const c = campaigns.find((ad: any) => ad.id === id);
    if (c) {
      c.status = 'STOPPED';
      c.updatedAt = new Date().toISOString();
      updatedCampaign = c;

      // Remove sponsored badge from product if no other active ads
      const prod = d.products.find(p => p.id === c.productId);
      if (prod) {
        const otherActive = campaigns.some(
          (ad: any) => ad.productId === prod.id && ad.id !== id && ad.status === 'ACTIVE'
        );
        if (!otherActive) {
          prod.isSponsored = false;
          prod.badges = prod.badges.filter(b => b !== 'SPONSORED');
        }
      }
    }
  });

  res.json({ success: true, campaign: updatedCampaign });
});

// DELETE /api/sellers/ads/:id (IDOR protected)
router.delete('/ads\/:id', requireVerified, (req: AuthenticatedRequest, res: Response) => {
  const ctx = getAuthorizedSellerContext(req, res);
  if (!ctx) return;
  const { sellerId, isAdmin } = ctx;
  const { id } = req.params;

  const allAds = (db.getDb() as any).advertisingCampaigns || [];
  const campaign = allAds.find((ad: any) => ad.id === id);
  if (!campaign) {
    return res.status(404).json({ error: 'Campaign not found' });
  }

  // IDOR check: caller must own this campaign unless admin
  if (!isAdmin && campaign.sellerId !== sellerId) {
    return res.status(403).json({ error: 'Forbidden: You do not own this advertising campaign.' });
  }

  db.updateDb(d => {
    const campaigns = (d as any).advertisingCampaigns || [];
    (d as any).advertisingCampaigns = campaigns.filter((ad: any) => ad.id !== id);

    const prod = d.products.find(p => p.id === campaign.productId);
    if (prod) {
      const otherActive = ((d as any).advertisingCampaigns || []).some(
        (ad: any) => ad.productId === prod.id && ad.status === 'ACTIVE'
      );
      if (!otherActive) {
        prod.isSponsored = false;
        prod.badges = prod.badges.filter(b => b !== 'SPONSORED');
      }
    }
  });

  res.json({ success: true, message: 'Campaign deleted successfully' });
});

// POST /api/sellers/orders/:id/accept (Accept order and start preparation)
router.post('/orders\/:id\/accept', requireVerified, (req: AuthenticatedRequest, res: Response) => {
  const ctx = getAuthorizedSellerContext(req, res);
  if (!ctx) return;
  if (!checkVerifiedSeller(req, res)) return;
  const { sellerId, isAdmin } = ctx;
  const { id } = req.params;

  const existingOrder = db.getDb().orders.find(o => o.id === id || o.orderNumber === id);
  if (!existingOrder) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // IDOR check: seller must own items in this order
  const isOwner = (existingOrder as any).sellerId === sellerId ||
    existingOrder.items?.some((i: any) => i.sellerId === sellerId || (i as any).vendorId === sellerId);
  if (!isAdmin && !isOwner) {
    return res.status(403).json({ error: 'Access Denied: You do not own items in this order.' });
  }

  let updatedOrder: any = null;
  db.updateDb(d => {
    const order = d.orders.find(o => o.id === id || o.orderNumber === id);
    if (order) {
      order.status = 'Processing';
      (order as any).fulfillmentStatus = 'PREPARING';
      (order as any).sellerAcceptedAt = new Date().toISOString();
      if (!order.statusHistory) order.statusHistory = [];
      order.statusHistory.push({
        status: 'Processing',
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        note: `Merchant accepted order & started preparation at fulfillment desk.`
      });
      if (!(order as any).history) (order as any).history = [];
      (order as any).history.push({
        status: 'Processing',
        note: `Merchant accepted order & started preparation at fulfillment desk.`,
        updatedBy: req.user?.name as string,
        timestamp: new Date().toISOString()
      });
      updatedOrder = order;

      // Notify Operations & Warehouse
      d.notifications.unshift({
        id: `notif-${Date.now()}`,
        userId: 'admin-operations',
        title: 'Order Preparation Started',
        message: `Order #${order.orderNumber} accepted by merchant. Preparing for dispatch.`,
        type: 'ORDER',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }
  });

  res.json({ success: true, order: updatedOrder, message: 'Order accepted. Status transitioned to PREPARING.' });
});

// POST /api/sellers/orders/:id/fulfillment-status
router.post('/orders\/:id\/fulfillment-status', requireVerified, (req: AuthenticatedRequest, res: Response) => {
  const ctx = getAuthorizedSellerContext(req, res);
  if (!ctx) return;
  if (!checkVerifiedSeller(req, res)) return;
  const { sellerId, isAdmin } = ctx;
  const { id } = req.params;
  const { fulfillmentStatus, note } = req.body;

  const existingOrder = db.getDb().orders.find(o => o.id === id || o.orderNumber === id);
  if (!existingOrder) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // IDOR check: seller must own items in this order
  const isOwner = (existingOrder as any).sellerId === sellerId ||
    existingOrder.items?.some((i: any) => i.sellerId === sellerId || (i as any).vendorId === sellerId);
  if (!isAdmin && !isOwner) {
    return res.status(403).json({ error: 'Access Denied: You do not own items in this order.' });
  }

  let updatedOrder: any = null;
  db.updateDb(d => {
    const order = d.orders.find(o => o.id === id || o.orderNumber === id);
    if (order) {
      (order as any).fulfillmentStatus = fulfillmentStatus;
      (order as any).lastFulfillmentUpdate = new Date().toISOString();
      if (!order.statusHistory) order.statusHistory = [];
      order.statusHistory.push({
        status: order.status,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        note: note || `Merchant updated fulfillment stage: ${fulfillmentStatus}`
      });
      if (!(order as any).history) (order as any).history = [];
      (order as any).history.push({
        status: order.status,
        note: note || `Merchant updated fulfillment stage: ${fulfillmentStatus}`,
        updatedBy: req.user?.name as string,
        timestamp: new Date().toISOString()
      });
      updatedOrder = order;
    }
  });

  res.json({ success: true, order: updatedOrder });
});

// GET /api/sellers/live-session
router.get('/live-session', (req: AuthenticatedRequest, res: Response) => {
  const ctx = getAuthorizedSellerContext(req, res);
  if (!ctx) return;
  const { sellerId } = ctx;

  const sessions = (db.getDb().liveSessions || []).filter(s => s.sellerId === sellerId);
  const activeSession = sessions.find(s => s.isLive);
  res.json({ activeSession, history: sessions });
});

// POST /api/sellers/live-session
router.post('/live-session', requireVerified, (req: AuthenticatedRequest, res: Response) => {
  const ctx = getAuthorizedSellerContext(req, res);
  if (!ctx) return;
  if (!checkVerifiedSeller(req, res)) return;
  const { sellerId, seller } = ctx;
  const { title, isRecording, taggedProductIds, action } = req.body;

  let session: any = null;

  db.updateDb(d => {
    if (!d.liveSessions) d.liveSessions = [];
    if (action === 'STOP') {
      const current = d.liveSessions.find(s => s.sellerId === sellerId && s.isLive);
      if (current) {
        current.isLive = false;
        current.isRecording = false;
        current.endedAt = new Date().toISOString();
        session = current;
      }
      const s = d.sellers.find(sel => sel.id === sellerId);
      if (s) s.isLiveCommerceActive = false;
    } else {
      session = {
        id: `live-${Date.now()}`,
        sellerId,
        sellerName: seller.name,
        title: title || 'Live Product Showcase & Exclusive Deals',
        isLive: true,
        isRecording: isRecording ?? true,
        viewersCount: crypto.randomInt(120, 420),
        likesCount: crypto.randomInt(400, 1200),
        taggedProductIds: taggedProductIds || [],
        startedAt: new Date().toISOString()
      };
      d.liveSessions.unshift(session);
      const s = d.sellers.find(sel => sel.id === sellerId);
      if (s) {
        s.isLiveCommerceActive = true;
        s.liveStreamTitle = session.title;
      }
    }
  });

  res.json({ session, isLive: action !== 'STOP' });
});

// POST /api/sellers/upload-media
router.post('/upload-media', requireVerified, (req: AuthenticatedRequest, res: Response) => {
  const ctx = getAuthorizedSellerContext(req, res);
  if (!ctx) return;
  if (!checkVerifiedSeller(req, res)) return;
  const { sellerId } = ctx;
  const { fileName, fileType, imageUrl } = req.body;

  const url = imageUrl || `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600`;
  res.json({
    success: true,
    file: {
      id: `med-${Date.now()}`,
      sellerId,
      url,
      fileName: fileName || 'product-asset.jpg',
      fileType: fileType || 'image/jpeg',
      uploadedAt: new Date().toISOString()
    }
  });
});

// GET /api/sellers/stock-catalog
router.get('/stock-catalog', (req: AuthenticatedRequest, res: Response) => {
  const ctx = getAuthorizedSellerContext(req, res);
  if (!ctx) return;
  const catalog = db.getDb().stockCatalog || [];
  res.json({ catalog });
});

// GET /api/sellers/inventory
router.get('/inventory', (req: AuthenticatedRequest, res: Response) => {
  const ctx = getAuthorizedSellerContext(req, res);
  if (!ctx) return;
  const { sellerId } = ctx;

  const items = db.getDb().inventory.filter(i => i.sellerId === sellerId);
  res.json({ inventory: items });
});

// GET /api/sellers/inventory/:id (Scoped to authenticated seller)
router.get('/inventory/:id', (req: AuthenticatedRequest, res: Response) => {
  const ctx = getAuthorizedSellerContext(req, res);
  if (!ctx) return;
  const { sellerId, isAdmin } = ctx;

  const item = db.getDb().inventory.find(i => i.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Inventory record not found' });
  }

  if (!isAdmin && item.sellerId !== sellerId) {
    return res.status(403).json({ error: 'Forbidden: You do not have access to this inventory record.' });
  }

  res.json({ inventory: item });
});

// DELETE /api/sellers/inventory/:id (Ownership verified deletion)
router.delete('/inventory\/:id', requireVerified, (req: AuthenticatedRequest, res: Response) => {
  const ctx = getAuthorizedSellerContext(req, res);
  if (!ctx) return;
  const { sellerId, isAdmin } = ctx;

  if (!isAdmin && !checkVerifiedSeller(req, res)) return;

  const item = db.getDb().inventory.find(i => i.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Inventory record not found' });
  }

  if (!isAdmin && item.sellerId !== sellerId) {
    return res.status(403).json({ error: 'Forbidden: You do not own this inventory record.' });
  }

  db.updateDb(d => {
    d.inventory = d.inventory.filter(i => i.id !== req.params.id);
  });

  db.addAuditLog({
    userId: req.user?.id as string,
    userName: req.user?.name as string,
    userRole: req.user?.role as any,
    action: 'DELETE_INVENTORY',
    entityType: 'PRODUCT',
    entityId: item.productId,
    previousValue: `Deleted inventory record ${item.id} (${item.productName})`
  });

  res.json({ success: true, message: 'Inventory record deleted successfully' });
});

// PUT /api/sellers/inventory/:id (Ownership verified stock mutation guard)
router.put('/inventory\/:id', requireVerified, (req: AuthenticatedRequest, res: Response) => {
  const ctx = getAuthorizedSellerContext(req, res);
  if (!ctx) return;
  const { sellerId, isAdmin } = ctx;

  const item = db.getDb().inventory.find(i => i.id === req.params.id || i.productId === req.params.id);
  const product = db.getDb().products.find(p => p.id === req.params.id);

  if (!item && !product) {
    return res.status(404).json({ error: 'Inventory record not found' });
  }

  const ownerSellerId = item?.sellerId || product?.sellerId;
  if (!isAdmin && ownerSellerId !== sellerId) {
    return res.status(403).json({ error: 'Forbidden: You do not own this inventory record.' });
  }

  return res.status(400).json({
    error: 'Direct stock manipulation is not permitted via this endpoint. Please use authorized inventory adjustment workflows.',
    code: 'STOCK_MUTATION_RESTRICTED'
  });
});

// PATCH /api/sellers/inventory/:id (Non-stock metadata update with ownership verification)
router.patch('/inventory\/:id', requireVerified, (req: AuthenticatedRequest, res: Response) => {
  const ctx = getAuthorizedSellerContext(req, res);
  if (!ctx) return;
  const { sellerId, isAdmin } = ctx;

  if (!isAdmin && !checkVerifiedSeller(req, res)) return;

  const item = db.getDb().inventory.find(i => i.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Inventory record not found' });
  }

  if (!isAdmin && item.sellerId !== sellerId) {
    return res.status(403).json({ error: 'Forbidden: You do not own this inventory record.' });
  }

  if (req.body.available !== undefined || req.body.stock !== undefined) {
    return res.status(400).json({
      error: 'Direct stock manipulation is not permitted via this endpoint. Please use authorized inventory adjustment workflows.',
      code: 'STOCK_MUTATION_RESTRICTED'
    });
  }

  const { reorderLevel, locationBin } = req.body;
  let updated: any = null;

  db.updateDb(d => {
    const inv = d.inventory.find(i => i.id === req.params.id);
    if (inv) {
      if (reorderLevel !== undefined) {
        const rl = Number(reorderLevel);
        if (!isNaN(rl) && Number.isInteger(rl) && rl >= 0) {
          inv.reorderLevel = rl;
        }
      }
      if (locationBin && typeof locationBin === 'string') {
        inv.locationBin = locationBin.trim();
      }
      inv.updatedAt = new Date().toISOString();
      updated = inv;
    }
  });

  res.json({ success: true, inventory: updated });
});

// GET /api/sellers/payouts
router.get('/payouts', (req: AuthenticatedRequest, res: Response) => {
  const ctx = getAuthorizedSellerContext(req, res);
  if (!ctx) return;
  const { sellerId } = ctx;

  const payouts = db.getDb().sellerPayouts.filter(p => p.sellerId === sellerId);
  const ledger = db.getDb().financialLedger.filter(l => l.sellerId === sellerId);
  res.json({ payouts, ledger });
});

// POST /api/sellers/payouts/request (Secure financial authorization)
router.post('/payouts\/request', requireVerified, (req: AuthenticatedRequest, res: Response) => {
  const ctx = getAuthorizedSellerContext(req, res);
  if (!ctx) return;
  if (!checkVerifiedSeller(req, res)) return;
  const { sellerId, seller } = ctx;
  const { amount, paymentMethod, recipientDetails } = req.body;

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount < 10000) {
    return res.status(400).json({ error: 'Minimum payout withdrawal request is TZS 10,000.' });
  }

  // Compute authoritative available balance for this seller strictly from the financial ledger
  const allLedger = db.getDb().financialLedger || [];
  const sellerLedger = allLedger.filter(l => l.sellerId === sellerId);
  
  const totalCredits = sellerLedger
    .filter(l => l.type === 'ESCROW_RELEASE' || (l.type as string) === 'CREDIT' || (l.type as string) === 'ORDER_SALE')
    .reduce((sum, l) => sum + (Number(l.net) || Number(l.amount) || 0), 0);
    
  const totalDebits = sellerLedger
    .filter(l => l.type === 'PAYOUT' || (l.type as string) === 'DEBIT' || l.type === 'REFUND_DEDUCTION' || l.type === 'AD_SPEND' || l.type === 'COMMISSION_DEDUCTION')
    .reduce((sum, l) => sum + Math.abs(Number(l.amount) || 0), 0);
    
  const pendingPayouts = (db.getDb().sellerPayouts || [])
    .filter(p => p.sellerId === sellerId && (p.status === 'PENDING' || p.status === 'PROCESSING'))
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const availableBalance = Math.max(0, totalCredits - totalDebits - pendingPayouts);

  if (numAmount > availableBalance) {
    return res.status(400).json({
      error: `Insufficient available balance. Requested: TZS ${numAmount.toLocaleString()}, Authoritative Available: TZS ${availableBalance.toLocaleString()}`,
      availableBalance
    });
  }

  const commission = Math.round(numAmount * 0.07);
  const shipping = 15000;
  const netAmount = Math.max(0, numAmount - commission - shipping);

  const newPayout = {
    id: `pay-${Date.now()}`,
    payoutNumber: `PO-2026-${crypto.randomInt(1000, 10000)}`,
    sellerId,
    sellerName: seller.name,
    amount: numAmount,
    currency: 'TZS',
    deductions: {
      commission,
      shipping,
      refunds: 0,
      advertisingFees: 0
    },
    netAmount,
    paymentMethod: paymentMethod || 'MOBILE_MONEY',
    recipientDetails: recipientDetails || '+255 754 112 233 (M-Pesa)',
    status: 'PENDING' as const,
    requestedAt: new Date().toISOString()
  };

  db.updateDb(d => {
    d.sellerPayouts.unshift(newPayout);
  });

  db.addAuditLog({
    userId: req.user?.id as string,
    userName: req.user?.name as string,
    userRole: 'SELLER',
    action: 'REQUEST_PAYOUT',
    entityType: 'PAYOUT',
    entityId: newPayout.id,
    newValue: `Requested payout of ${newPayout.netAmount} TZS via ${newPayout.paymentMethod}`
  });

  res.status(201).json({ payout: newPayout });
});

// GET /api/sellers/kyc
router.get('/kyc', (req: AuthenticatedRequest, res: Response) => {
  const ctx = getAuthorizedSellerContext(req, res);
  if (!ctx) return;
  const { sellerId } = ctx;

  const kyc = db.getDb().sellerKYC.find(k => k.sellerId === sellerId);

  const now = new Date();
  let kycLockInfo = {
    isLocked: false,
    lockUntil: null as string | null,
    daysRemaining: 0
  };

  if (kyc && (kyc.status === 'APPROVED' || (kyc.status as string) === 'VERIFIED')) {
    const verifiedTime = kyc.verifiedAt ? new Date(kyc.verifiedAt).getTime() : Date.now() - 10 * 86400000;
    const lockUntilDate = new Date(verifiedTime + 60 * 24 * 60 * 60 * 1000);
    const isLocked = now.getTime() < lockUntilDate.getTime();
    const daysRemaining = isLocked ? Math.ceil((lockUntilDate.getTime() - now.getTime()) / 86400000) : 0;
    kycLockInfo = {
      isLocked,
      lockUntil: lockUntilDate.toISOString(),
      daysRemaining
    };
  }

  res.json({ kyc: kyc ? { ...kyc, ...kycLockInfo } : null, kycLockInfo });
});

// POST /api/sellers/kyc & /api/sellers/kyc/submit (Enforce 60-day security lock and identity binding)
router.post(['/kyc', '/kyc/submit'], (req: AuthenticatedRequest, res: Response) => {
  const ctx = getAuthorizedSellerContext(req, res);
  if (!ctx) return;
  const { sellerId, seller, isAdmin } = ctx;
  const data = req.body;

  let existingKyc = db.getDb().sellerKYC.find(k => k.sellerId === sellerId);

  // Check 60-day lock
  if (existingKyc && (existingKyc.status === 'APPROVED' || (existingKyc.status as string) === 'VERIFIED')) {
    const verifiedTime = existingKyc.verifiedAt ? new Date(existingKyc.verifiedAt).getTime() : Date.now() - 10 * 86400000;
    const lockUntilDate = new Date(verifiedTime + 60 * 24 * 60 * 60 * 1000);
    const isLocked = Date.now() < lockUntilDate.getTime();

    if (isLocked && !isAdmin) {
      const daysRemaining = Math.ceil((lockUntilDate.getTime() - Date.now()) / 86400000);
      return res.status(403).json({
        error: `KYC Modification Restricted: Your verified merchant credentials are locked for 60 days to protect marketplace integrity. Lock expires in ${daysRemaining} days (${lockUntilDate.toLocaleDateString()}). Please contact LUMO Compliance for official assistance.`
      });
    }
  }

  let kycRecord = existingKyc;
  db.updateDb(d => {
    if (kycRecord) {
      Object.assign(kycRecord, data, {
        sellerId, // NEVER allow changing sellerId
        status: 'UNDER_REVIEW',
        lastUpdatedAt: new Date().toISOString(),
        submittedAt: new Date().toISOString()
      });
    } else {
      kycRecord = {
        id: `kyc-${Date.now()}`,
        sellerId,
        businessType: data.businessType || 'REGISTERED_BUSINESS',
        legalName: data.legalName || seller.name,
        tradingName: data.tradingName || seller.name,
        registrationNumber: data.registrationNumber || 'BRELA-12345',
        tinNumber: data.tinNumber || 'TIN-12345',
        idType: data.idType || 'NATIONAL_ID',
        idNumber: data.idNumber || 'NIDA-12345',
        documents: data.documents || [],
        bankDetails: data.bankDetails || {
          bankName: 'CRDB Bank',
          accountName: data.legalName || seller.name,
          accountNumber: '01500000000'
        },
        status: 'UNDER_REVIEW',
        submittedAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString()
      };
      d.sellerKYC.push(kycRecord);
    }
  });

  res.json({ kyc: kycRecord, message: 'KYC submitted successfully for operational verification.' });
});

// PUT /api/sellers/store-profile
router.put('/store-profile', requireVerified, (req: AuthenticatedRequest, res: Response) => {
  const ctx = getAuthorizedSellerContext(req, res);
  if (!ctx) return;
  const { sellerId } = ctx;
  const { name, logo, description, phone, email, city, address, banner } = req.body;

  let updatedSeller: any = null;
  db.updateDb(d => {
    const seller = d.sellers.find(s => s.id === sellerId);
    if (seller) {
      if (name) seller.name = name;
      if (logo) (seller as any).logo = logo;
      if (description) seller.description = description;
      if (phone) (seller as any).phone = phone;
      if (email) (seller as any).email = email;
      if (city) seller.city = city;
      if (address) (seller as any).address = address;
      if (banner) (seller as any).banner = banner;
      updatedSeller = seller;
    }
  });

  if (!updatedSeller) {
    return res.status(404).json({ error: 'Seller not found' });
  }

  res.json({ success: true, seller: updatedSeller });
});

// POST /api/sellers/boost-product (IDOR & Verification protected, product ownership enforced)
router.post('/boost-product', requireVerified, (req: AuthenticatedRequest, res: Response) => {
  const ctx = getAuthorizedSellerContext(req, res);
  if (!ctx) return;
  if (!checkVerifiedSeller(req, res)) return;
  const { sellerId, isAdmin } = ctx;
  const { productId, planName = 'Growth Turbo', durationDays = 7, budget = 25000 } = req.body;

  const numBudget = Number(budget);
  if (isNaN(numBudget) || numBudget < 2500) {
    return res.status(400).json({
      error: 'Invalid Ad Budget: Minimum advertising campaign budget is TZS 2,500.'
    });
  }

  const product = db.getDb().products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // IDOR check: caller must own this product unless admin
  if (!isAdmin && product.sellerId !== sellerId) {
    return res.status(403).json({ error: 'Forbidden: You can only boost your own products.' });
  }

  // Calculate available balance to ensure seller can afford the ad budget
  const allLedger = db.getDb().financialLedger || [];
  const sellerLedger = allLedger.filter(l => l.sellerId === sellerId);
  const totalCredits = sellerLedger.filter(l => l.type === 'ESCROW_RELEASE' || (l.type as string) === 'CREDIT' || (l.type as string) === 'ORDER_SALE').reduce((sum, l) => sum + (Number(l.net) || Number(l.amount) || 0), 0);
  const totalDebits = sellerLedger.filter(l => l.type === 'PAYOUT' || (l.type as string) === 'DEBIT' || l.type === 'REFUND_DEDUCTION' || l.type === 'AD_SPEND' || l.type === 'COMMISSION_DEDUCTION').reduce((sum, l) => sum + Math.abs(Number(l.amount) || 0), 0);
  const pendingPayouts = (db.getDb().sellerPayouts || []).filter(p => p.sellerId === sellerId && (p.status === 'PENDING' || p.status === 'PROCESSING')).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const availableBalance = Math.max(0, totalCredits - totalDebits - pendingPayouts);

  if (numBudget > availableBalance) {
    return res.status(400).json({
      error: `Insufficient balance to boost product. Required: TZS ${numBudget.toLocaleString()}, Available: TZS ${availableBalance.toLocaleString()}`
    });
  }

  const numDays = Math.max(1, Number(durationDays) || 7);
  let boostedProduct: any = null;
  let campaign: any = null;

  db.updateDb(d => {
    const prod = d.products.find(p => p.id === productId);
    if (prod) {
      prod.isSponsored = true;
      if (!prod.badges.includes('SPONSORED')) {
        prod.badges = ['SPONSORED', ...prod.badges];
      }
      boostedProduct = prod;

      campaign = {
        id: `ad-${Date.now()}`,
        productId: prod.id,
        productName: prod.name,
        sellerId: prod.sellerId, // STRICTLY product.sellerId
        planName,
        budget: numBudget,
        durationDays: numDays,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + numDays * 86400000).toISOString(),
        impressions: 0,
        clicks: 0,
        status: 'ACTIVE'
      };

      if (!(d as any).advertisingCampaigns) (d as any).advertisingCampaigns = [];
      (d as any).advertisingCampaigns.unshift(campaign);

      if (!(d as any).financialLedger) (d as any).financialLedger = [];
      (d as any).financialLedger.unshift({
        id: `led-${Date.now()}`,
        sellerId: prod.sellerId,
        type: 'DEBIT',
        category: 'ADVERTISING_FEE',
        amount: numBudget,
        description: `Lumo Boost Ad: ${prod.name} (${planName} - ${numDays} Days)`,
        createdAt: new Date().toISOString()
      });
    }
  });

  res.json({ success: true, product: boostedProduct, campaign });
});

export default router;

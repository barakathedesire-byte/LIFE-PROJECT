import crypto from 'crypto';
import { Router, Response } from 'express';
import { db } from '../db.js';
import { AuthenticatedRequest, authenticateToken, requireRole } from '../middleware/auth.js';
import { LiveCommerceSession, Product } from '../../src/types/index.js';

const router = Router();

// Store active WebRTC signals in memory per live session
interface SignalMessage {
  id: string;
  senderId: string;
  senderRole: string;
  type: 'offer' | 'answer' | 'candidate';
  payload: any;
  timestamp: number;
}

const liveSignals = new Map<string, SignalMessage[]>();
// Simple rate limiter map for likes per IP/user
const likeRateLimitMap = new Map<string, { count: number; resetAt: number }>();
// Rate limiter map for comments
const commentRateLimitMap = new Map<string, { count: number; resetAt: number }>();

// GET /api/live/active - Public discovery of currently active live broadcasts
router.get('/active', (req, res) => {
  const currentDb = db.getDb();
  const sessions = currentDb.liveSessions || [];
  
  // Filter only active sessions
  const activeSessions = sessions
    .filter(s => s.isLive)
    .map(s => {
      // Attach seller information and pinned product details
      const seller = (currentDb.sellers || []).find(sel => sel.id === s.sellerId);
      let pinnedProduct: Product | undefined = undefined;
      if (s.taggedProductIds && s.taggedProductIds.length > 0) {
        pinnedProduct = (currentDb.products || []).find(p => p.id === s.taggedProductIds[0]);
      }

      return {
        id: s.id,
        sellerId: s.sellerId,
        sellerName: s.sellerName || (seller ? seller.name : 'Verified Seller'),
        sellerAvatar: seller?.avatar,
        title: s.title || 'Live Product Showcase',
        isLive: s.isLive,
        viewersCount: s.viewersCount || 0,
        likesCount: s.likesCount || 0,
        taggedProductIds: s.taggedProductIds || [],
        pinnedProduct,
        startedAt: s.startedAt
      };
    });

  res.json({ sessions: activeSessions });
});

// GET /api/live/:id - Get session details and active state
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const currentDb = db.getDb();
  const session = (currentDb.liveSessions || []).find(s => s.id === id);

  if (!session) {
    return res.status(404).json({ error: 'Live shopping session not found.' });
  }

  const seller = (currentDb.sellers || []).find(sel => sel.id === session.sellerId);
  const taggedProducts = (currentDb.products || []).filter(p => (session.taggedProductIds || []).includes(p.id));
  const pinnedProduct = taggedProducts.length > 0 ? taggedProducts[0] : undefined;

  res.json({
    session: {
      ...session,
      sellerAvatar: seller?.avatar,
      pinnedProduct,
      taggedProducts
    }
  });
});

// POST /api/live/start - Verified Sellers / Admins start a live broadcast
router.post('/start', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized. Authentication required.' });
  }

  // Only SELLER or SUPER_ADMIN can start a live stream
  if (req.user.role !== 'SELLER' && req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Only authorized sellers can broadcast live.' });
  }

  const currentDb = db.getDb();
  const sellerId = req.user.sellerId || req.user.id;
  const seller = (currentDb.sellers || []).find(s => s.id === sellerId || s.id === req.user?.sellerId);

  // Check verification
  if (req.user.role === 'SELLER' && !req.user.isVerified && req.user.verificationStatus !== 'VERIFIED') {
    return res.status(403).json({
      error: 'Unverified seller: Live broadcasting requires verified seller status and approved KYC.'
    });
  }

  const { title, taggedProductIds = [] } = req.body;
  const cleanTitle = String(title || 'LUMO Live Showcase').trim().slice(0, 100);

  // Validate tagged products belong to this seller
  const sellerProducts = (currentDb.products || []).filter(p => p.sellerId === sellerId);
  const validatedProductIds = (taggedProductIds as string[]).filter(pid =>
    sellerProducts.some(sp => sp.id === pid)
  );

  const sessionId = `live-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  const newSession: LiveCommerceSession = {
    id: sessionId,
    sellerId: sellerId,
    sellerName: seller ? seller.name : req.user.name,
    title: cleanTitle,
    isLive: true,
    isRecording: false,
    viewersCount: 1,
    likesCount: 0,
    taggedProductIds: validatedProductIds,
    startedAt: new Date().toISOString()
  };

  db.updateDb(d => {
    if (!d.liveSessions) d.liveSessions = [];
    // End any previously active session for this seller
    d.liveSessions.forEach(s => {
      if (s.sellerId === sellerId && s.isLive) {
        s.isLive = false;
        s.endedAt = new Date().toISOString();
      }
    });
    d.liveSessions.push(newSession);
  });

  liveSignals.set(sessionId, []);

  db.addAuditLog({
    userId: req.user.id,
    userName: req.user.name,
    userRole: req.user.role,
    action: 'LIVE_STREAM_STARTED',
    entityType: 'LIVE_SESSION',
    entityId: sessionId,
    status: 'SUCCESS',
    details: `Seller ${sellerId} started live broadcast: "${cleanTitle}"`,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] as string
  });

  res.json({
    success: true,
    session: newSession
  });
});

// POST /api/live/:id/end - End active live broadcast (Owning Seller or Admin only)
router.post('/:id/end', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const { id } = req.params;
  const currentDb = db.getDb();
  const session = (currentDb.liveSessions || []).find(s => s.id === id);

  if (!session) {
    return res.status(404).json({ error: 'Live session not found.' });
  }

  const sellerId = req.user.sellerId || req.user.id;
  const isOwner = session.sellerId === sellerId;
  const isSuperAdmin = req.user.role === 'SUPER_ADMIN';

  if (!isOwner && !isSuperAdmin) {
    return res.status(403).json({ error: 'Forbidden: You do not own this live session.' });
  }

  db.updateDb(d => {
    const s = (d.liveSessions || []).find(ls => ls.id === id);
    if (s) {
      s.isLive = false;
      s.endedAt = new Date().toISOString();
    }
  });

  liveSignals.delete(id);

  db.addAuditLog({
    userId: req.user.id,
    userName: req.user.name,
    userRole: req.user.role,
    action: 'LIVE_STREAM_ENDED',
    entityType: 'LIVE_SESSION',
    entityId: id,
    status: 'SUCCESS',
    details: `Live broadcast ${id} ended by ${req.user.name}`,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] as string
  });

  res.json({ success: true, message: 'Live session ended successfully.' });
});

// POST /api/live/:id/join - Viewer joins session
router.post('/:id/join', (req, res) => {
  const { id } = req.params;
  let updatedCount = 1;

  db.updateDb(d => {
    const s = (d.liveSessions || []).find(ls => ls.id === id);
    if (s && s.isLive) {
      s.viewersCount = (s.viewersCount || 0) + 1;
      updatedCount = s.viewersCount;
    }
  });

  res.json({ success: true, viewersCount: updatedCount });
});

// POST /api/live/:id/leave - Viewer leaves session
router.post('/:id/leave', (req, res) => {
  const { id } = req.params;
  let updatedCount = 0;

  db.updateDb(d => {
    const s = (d.liveSessions || []).find(ls => ls.id === id);
    if (s && s.isLive) {
      s.viewersCount = Math.max(0, (s.viewersCount || 1) - 1);
      updatedCount = s.viewersCount;
    }
  });

  res.json({ success: true, viewersCount: updatedCount });
});

// POST /api/live/:id/react - Submit like/heart reaction (Authenticated & Rate Limited)
router.post('/:id/react', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required to send reactions.' });
  }

  const { id } = req.params;
  const currentDb = db.getDb();
  const session = (currentDb.liveSessions || []).find(s => s.id === id);

  if (!session) {
    return res.status(404).json({ error: 'Live session not found.' });
  }

  if (!session.isLive) {
    return res.status(400).json({ error: 'Cannot react to an ended live session.' });
  }

  // Rate limit: max 20 reactions per 5 seconds per user
  const rateKey = `react_${req.user.id}_${id}`;
  const now = Date.now();
  const rateData = likeRateLimitMap.get(rateKey) || { count: 0, resetAt: now + 5000 };

  if (now > rateData.resetAt) {
    rateData.count = 0;
    rateData.resetAt = now + 5000;
  }

  if (rateData.count >= 20) {
    return res.status(429).json({ error: 'Reaction rate limit exceeded. Please slow down.' });
  }

  rateData.count += 1;
  likeRateLimitMap.set(rateKey, rateData);

  let newLikesCount = (session.likesCount || 0) + 1;
  db.updateDb(d => {
    const s = (d.liveSessions || []).find(ls => ls.id === id);
    if (s) {
      s.likesCount = (s.likesCount || 0) + 1;
      newLikesCount = s.likesCount;
    }
  });

  res.json({ success: true, likesCount: newLikesCount });
});

// POST /api/live/:id/comments - Post live comment (Authenticated)
router.post('/:id/comments', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required to comment.' });
  }

  const { id } = req.params;
  const { text } = req.body;

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'Comment text is required.' });
  }

  const cleanText = text.trim().slice(0, 200);

  const currentDb = db.getDb();
  const session = (currentDb.liveSessions || []).find(s => s.id === id);

  if (!session) {
    return res.status(404).json({ error: 'Live session not found.' });
  }

  if (!session.isLive) {
    return res.status(400).json({ error: 'Cannot post comments on an ended live session.' });
  }

  // Rate limit comments: max 5 comments per 10 seconds
  const rateKey = `comm_${req.user.id}_${id}`;
  const now = Date.now();
  const rateData = commentRateLimitMap.get(rateKey) || { count: 0, resetAt: now + 10000 };

  if (now > rateData.resetAt) {
    rateData.count = 0;
    rateData.resetAt = now + 10000;
  }

  if (rateData.count >= 5) {
    return res.status(429).json({ error: 'Too many comments sent quickly. Please wait a few seconds.' });
  }

  rateData.count += 1;
  commentRateLimitMap.set(rateKey, rateData);

  const commentItem = {
    id: `comm-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    liveSessionId: id,
    userId: req.user.id,
    userName: req.user.name,
    userRole: req.user.role,
    text: cleanText,
    timestamp: new Date().toISOString()
  };

  db.updateDb(d => {
    const s = (d.liveSessions || []).find(ls => ls.id === id);
    if (s) {
      if (!(s as any).comments) (s as any).comments = [];
      (s as any).comments.push(commentItem);
    }
  });

  res.json({ success: true, comment: commentItem });
});

// GET /api/live/:id/comments - Retrieve comments for this live session
router.get('/:id/comments', (req, res) => {
  const { id } = req.params;
  const currentDb = db.getDb();
  const session = (currentDb.liveSessions || []).find(s => s.id === id);

  if (!session) {
    return res.status(404).json({ error: 'Live session not found.' });
  }

  const comments = (session as any).comments || [];
  res.json({ comments });
});

// POST /api/live/:id/pin-product - Pin/Feature product (Owning Seller or Admin only)
router.post('/:id/pin-product', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const { id } = req.params;
  const { productId } = req.body;

  const currentDb = db.getDb();
  const session = (currentDb.liveSessions || []).find(s => s.id === id);

  if (!session) {
    return res.status(404).json({ error: 'Live session not found.' });
  }

  const sellerId = req.user.sellerId || req.user.id;
  const isOwner = session.sellerId === sellerId;
  const isSuperAdmin = req.user.role === 'SUPER_ADMIN';

  if (!isOwner && !isSuperAdmin) {
    return res.status(403).json({ error: 'Forbidden: You do not own this live session.' });
  }

  // Validate product belongs to this seller
  const product = (currentDb.products || []).find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  if (product.sellerId !== session.sellerId && !isSuperAdmin) {
    return res.status(403).json({ error: 'Forbidden: You can only feature products from your own inventory.' });
  }

  db.updateDb(d => {
    const s = (d.liveSessions || []).find(ls => ls.id === id);
    if (s) {
      s.taggedProductIds = [productId, ...(s.taggedProductIds || []).filter(pid => pid !== productId)];
    }
  });

  res.json({ success: true, pinnedProduct: product });
});

// POST /api/live/:id/signal - WebRTC Signaling exchange
router.post('/:id/signal', (req, res) => {
  const { id } = req.params;
  const { senderId, senderRole, type, payload } = req.body;

  if (!senderId || !type || !payload) {
    return res.status(400).json({ error: 'Invalid signal payload.' });
  }

  let signals = liveSignals.get(id);
  if (!signals) {
    signals = [];
    liveSignals.set(id, signals);
  }

  const signalMsg: SignalMessage = {
    id: `sig-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    senderId,
    senderRole: senderRole || 'viewer',
    type,
    payload,
    timestamp: Date.now()
  };

  signals.push(signalMsg);

  // Keep last 50 signals
  if (signals.length > 50) {
    signals.splice(0, signals.length - 50);
  }

  res.json({ success: true, messageId: signalMsg.id });
});

// GET /api/live/:id/signals - Poll WebRTC signals
router.get('/:id/signals', (req, res) => {
  const { id } = req.params;
  const since = Number(req.query.since || 0);
  const forSender = String(req.query.recipientId || '');

  const signals = liveSignals.get(id) || [];
  const filtered = signals.filter(s => s.timestamp > since && (!forSender || s.senderId !== forSender));

  res.json({ signals: filtered, timestamp: Date.now() });
});

export default router;

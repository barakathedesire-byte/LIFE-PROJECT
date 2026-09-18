import * as crypto from 'crypto';
import { Router, Response } from 'express';
import { db } from '../db.js';
import { AuthenticatedRequest, requireRole } from '../middleware/auth.js';
import { isUserVerified } from '../middleware/verificationGuard.js';
import { SupportTicket } from '../../src/types/index.js';

const router = Router();

// GET /api/support/tickets
router.get('/tickets', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  let tickets = db.getDb().supportTickets;

  if (user && user.role === 'CUSTOMER') {
    tickets = tickets.filter(t => t.userEmail.toLowerCase() === user.email.toLowerCase() || t.userId === user.id);
  }

  res.json({ tickets });
});

// GET /api/support/tickets/:id
router.get('/tickets/:id', (req: AuthenticatedRequest, res: Response) => {
  const ticket = db.getDb().supportTickets.find(t => t.id === req.params.id || t.ticketNumber === req.params.id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  const isAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN' || req.user?.role === 'SUPPORT_AGENT';
  if (!isAdmin && ticket.userId !== req.user?.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.json({ ticket });
});

// POST /api/support/tickets
router.post('/tickets', (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });

  const newTicket: SupportTicket = {
    id: `tkt-${Date.now()}`,
    ticketNumber: `TKT-2026-${crypto.randomInt(1000, 10000)}`,
    userId: req.user.id,
    userName: req.user.name || 'Customer',
    userEmail: req.user.email || 'customer@lumo.co.tz',
    userPhone: req.user.phone || '',
    role: req.user.role === 'SELLER' ? 'SELLER' : 'CUSTOMER',
    orderId: data.orderId,
    orderNumber: data.orderNumber,
    category: data.category || 'DELIVERY',
    subject: data.subject || 'Support Inquiry',
    status: 'OPEN',
    priority: data.priority || 'MEDIUM',
    messages: [
      {
        id: `msg-${Date.now()}`,
        sender: 'USER',
        senderName: req.user.name || 'Customer',
        message: data.message || 'Help needed with my order.',
        timestamp: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.updateDb(d => {
    d.supportTickets.unshift(newTicket);
  });

  res.status(201).json({ ticket: newTicket });
});

// POST /api/support/tickets/:id/messages
router.post('/tickets/:id/messages', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { message } = req.body;
  const isAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN' || req.user?.role === 'SUPPORT_AGENT';
  
  // Set sender automatically based on role
  const sender = isAdmin ? 'AGENT' : 'USER';

  let updatedTicket: SupportTicket | null = null;
  db.updateDb(d => {
    const ticket = d.supportTickets.find(t => t.id === id);
    if (ticket) {
      if (!isAdmin && ticket.userId !== req.user?.id) {
        return; // Unauthorized
      }
      ticket.messages.push({
        id: `msg-${Date.now()}`,
        sender: sender as any,
        senderName: req.user?.name || (sender === 'AGENT' ? 'Support Agent' : 'Customer'),
        message,
        timestamp: new Date().toISOString()
      });
      ticket.updatedAt = new Date().toISOString();
      if (sender === 'AGENT') {
        ticket.status = 'IN_PROGRESS';
      }
      updatedTicket = ticket;
    }
  });

  if (!updatedTicket) {
    return res.status(404).json({ error: 'Ticket not found or access denied' });
  }

  res.json({ ticket: updatedTicket });
});

// POST /api/support/tickets/:id/notes
router.post('/tickets/:id/notes', requireRole('SUPER_ADMIN', 'ADMIN', 'SUPPORT_AGENT'), (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role === 'SUPPORT_AGENT' && !isUserVerified(req.user)) {
    return res.status(403).json({
      error: 'VERIFICATION_REQUIRED',
      message: 'Support agent account must be verified before modifying ticket notes.'
    });
  }
  const { id } = req.params;
  const { note } = req.body;

  let updatedTicket: SupportTicket | null = null;
  db.updateDb(d => {
    const ticket = d.supportTickets.find(t => t.id === id);
    if (ticket) {
      if (!ticket.internalNotes) ticket.internalNotes = [];
      ticket.internalNotes.push({
        id: `in-${Date.now()}`,
        agentName: req.user?.name || 'Fatma Juma',
        note,
        timestamp: new Date().toISOString()
      });
      updatedTicket = ticket;
    }
  });

  if (!updatedTicket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  res.json({ ticket: updatedTicket });
});

// PATCH /api/support/tickets/:id/status
router.patch('/tickets/:id/status', requireRole('SUPER_ADMIN', 'ADMIN', 'SUPPORT_AGENT'), (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role === 'SUPPORT_AGENT' && !isUserVerified(req.user)) {
    return res.status(403).json({
      error: 'VERIFICATION_REQUIRED',
      message: 'Support agent account must be verified before updating ticket status.'
    });
  }
  const { id } = req.params;
  const { status, priority, assignedTo, assignedAgentName } = req.body;

  let updatedTicket: SupportTicket | null = null;
  db.updateDb(d => {
    const ticket = d.supportTickets.find(t => t.id === id);
    if (ticket) {
      if (status) ticket.status = status;
      if (priority) ticket.priority = priority;
      if (assignedTo) ticket.assignedTo = assignedTo;
      if (assignedAgentName) ticket.assignedAgentName = assignedAgentName;
      ticket.updatedAt = new Date().toISOString();
      updatedTicket = ticket;
    }
  });

  if (!updatedTicket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  res.json({ ticket: updatedTicket });
});

// POST /api/support/ai-assistant (AI Customer Care Assistant)
router.post('/ai-assistant', async (req: AuthenticatedRequest, res: Response) => {
  const { message, conversationHistory = [] } = req.body;
  const query = (message || '').trim();

  if (!query) {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }

  // System Prompt for LUMO Customer Care
  const systemInstruction = `You are "LumoCare AI", the official 24/7 bilingual (English & Swahili) customer support assistant for LUMO, Tanzania's leading premier e-commerce marketplace.
LUMO Knowledge Base:
1. Payments & Escrow: LUMO uses escrow protection. Buyer payments via M-Pesa, Tigo Pesa, Airtel Money, Halopesa, AzamPay, or Card are safely held until the buyer inspects and receives their order.
2. Delivery & Coverage: Same-day express delivery across Dar es Salaam (Kinondoni, Ilala, Temeke, Masaki, Kariakoo, Mikocheni, Mbezi). 24-48h regional dispatch to Arusha, Mwanza, Dodoma, Mbeya, Morogoro, Tanga, and Zanzibar via registered courier & pickup lockers.
3. Free Delivery: Orders over TZS 50,000 in qualifying Dar es Salaam zones get Free Delivery.
4. Returns & Guarantee: 7-day hassle-free returns for eligible items. Full refund into customer LUMO Wallet or Mobile Money if damaged, counterfeit, or wrong item.
5. Pickup Stations: Free pickup at Slipway Masaki, Msimbazi Kariakoo, and Mwenge Bus Terminal Smart Lockers.
6. Seller Onboarding: Verified merchants can register at /vendor/register or /sell-on-lumo with BRELA and TIN documents.

Respond politely, concisely, and helpfully. Speak in the customer's language (English or Swahili). If they provide an order number (like #ORD-10482), explain that their shipment is in transit with verified rider tracking.`;

  // Try Gemini if API key is provided
  if (process.env.GEMINI_API_KEY) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemInstruction}\n\nCustomer Inquiry: ${query}` }] }
        ]
      });

      const replyText = response.text || 'Habari! Asante kwa kuwasiliana na LUMO Care. Tuko hapa kukusaidia.';
      return res.json({
        reply: replyText,
        source: 'gemini-3.7-flash',
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to local knowledge base:', err?.message);
    }
  }

  // Fallback intelligent FAQ engine for reliable offline & preview responses
  const qLower = query.toLowerCase();
  let reply = '';

  if (qLower.includes('order') || qLower.includes('wapi mzigo') || qLower.includes('track') || qLower.includes('delivery') || qLower.includes('sla')) {
    reply = `📦 **Order & Delivery Information:**\nAll LUMO orders in Dar es Salaam are fulfilled via our Express Logistics Hub with real-time GPS tracking. Standard delivery takes 2–4 hours for Express items, and same-day/next-day for standard items. For regional orders (Arusha, Mwanza, Dodoma, Zanzibar), delivery takes 24–48 hours.\n\nYou can track live status under **My Orders** in your LUMO account.`;
  } else if (qLower.includes('pay') || qLower.includes('lipa') || qLower.includes('m-pesa') || qLower.includes('tigo') || qLower.includes('escrow') || qLower.includes('refund')) {
    reply = `🛡️ **LUMO Escrow & Payment Protection:**\nYour payment is 100% safeguarded by LUMO Escrow. When you pay via M-Pesa, Tigo Pesa, Airtel Money, or Card, funds remain in escrow and are only released to the seller after you confirm satisfactory delivery. Refunds are credited to your original payment method within 24 hours.`;
  } else if (qLower.includes('return') || qLower.includes('rudisha') || qLower.includes('damaged') || qLower.includes('defect') || qLower.includes('broken')) {
    reply = `🔄 **7-Day Return Guarantee:**\nIf your item is damaged, defective, or different from description, you have 7 calendar days from delivery to initiate a return through the **Returns & Refunds** portal. A LUMO rider will collect the item directly from your doorstep free of charge.`;
  } else if (qLower.includes('pickup') || qLower.includes('station') || qLower.includes('kituo') || qLower.includes('kariakoo') || qLower.includes('locker')) {
    reply = `📍 **LUMO Pickup Stations:**\nYou can pick up packages for free at our central stations:\n1. **Kariakoo Station**: Msimbazi St, Opposite Police Depot (Open 8am - 8pm)\n2. **Masaki Station**: Slipway Shopping Complex (Open 9am - 9pm)\n3. **Mwenge Hub**: Smart Parcel Lockers (24/7 Automated Access)`;
  } else if (qLower.includes('sell') || qLower.includes('vendor') || qLower.includes('uza') || qLower.includes('merchant') || qLower.includes('duka')) {
    reply = `💼 **Sell on LUMO Marketplace:**\nExpand your business across East Africa! Register as a verified seller at \`/vendor/register\` with your National ID (NIDA) or BRELA certificate. LUMO provides automated order dispatch, courier pickup, and next-day payout settlement.`;
  } else if (qLower.includes('habari') || qLower.includes('mambo') || qLower.includes('hello') || qLower.includes('hi')) {
    reply = `Habari! Karibu LUMO Customer Care. Ninawezaje kukusaidia leo kuhusu oda yako, malipo ya M-Pesa, kurudisha bidhaa, au kujiunga kama muuzaji? (How can I assist you with your orders, payments, or delivery today?)`;
  } else {
    reply = `Thank you for contacting LUMO Care! Your inquiry has been received. Our automated escrow and dispatch systems operate 24/7 across Tanzania. For urgent order escalations, you can also open an official ticket in the Support Portal or call our Dar es Salaam hotline at **+255 22 211 0000**.`;
  }

  return res.json({
    reply,
    source: 'lumo-faq-engine',
    timestamp: new Date().toISOString()
  });
});

export default router;

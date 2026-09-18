import * as crypto from 'crypto';
import { Router, Response } from 'express';
import { db } from '../db.js';
import { AuthenticatedRequest, requireRole } from '../middleware/auth.js';
import { requireVerified } from '../middleware/auth.js';
import { isUserVerified } from '../middleware/verificationGuard.js';
import { SalespersonLead, SalesActivity, Order } from '../../src/types/index.js';

const router = Router();

// Router-level Sales RBAC Guard
router.use(requireRole('SALESPERSON', 'SUPER_ADMIN', 'ADMIN'));

// Require verification for all write/operational actions by salespeople
router.use((req: AuthenticatedRequest, res: Response, next) => {
  if (req.method !== 'GET' && req.user?.role === 'SALESPERSON') {
    if (!isUserVerified(req.user)) {
      return res.status(403).json({
        error: 'VERIFICATION_REQUIRED',
        message: 'Salesperson account must be verified before performing sales operations.'
      });
    }
  }
  next();
});

// GET /api/sales/dashboard
router.get('/dashboard', (req: AuthenticatedRequest, res: Response) => {
  const isAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN';
  const salespersonId = isAdmin ? ((req.query.salespersonId as string) || req.user?.salespersonId) : (req.user?.salespersonId || req.user?.id);
  const target = salespersonId ? db.getDb().salesTargets.find(t => t.salespersonId === salespersonId) : undefined;
  const leads = salespersonId ? db.getDb().salesLeads.filter(l => l.salespersonId === salespersonId) : (isAdmin ? db.getDb().salesLeads : []);
  const activities = salespersonId ? db.getDb().salesActivities.filter(a => a.salespersonId === salespersonId) : (isAdmin ? db.getDb().salesActivities : []);
  const tasks = salespersonId ? ((db.getDb() as any).salesTasks || []).filter((t: any) => t.salespersonId === salespersonId) : (isAdmin ? ((db.getDb() as any).salesTasks || []) : []);
  const assistedOrders = salespersonId ? db.getDb().orders.filter((o: any) => o.salespersonId === salespersonId) : [];

  const totalAssistedRevenue = assistedOrders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0);
  const totalCommissionEarned = assistedOrders.reduce((sum, o) => sum + ((o as any).salesCommission || Math.round((o.pricing?.total || 0) * 0.03)), 0);

  res.json({
    target: target ? {
      ...target,
      achievedAmount: totalAssistedRevenue || (target?.achievedAmount || 0),
      commissionEarned: totalCommissionEarned || (target?.commissionEarned || 0)
    } : null,
    leadsCount: leads.length,
    convertedLeads: leads.filter(l => l.status === 'CONVERTED').length,
    tasksCount: tasks.length,
    pendingTasksCount: tasks.filter((t: any) => t.status !== 'COMPLETED').length,
    assistedOrdersCount: assistedOrders.length,
    recentLeads: leads.slice(0, 5),
    recentActivities: activities.slice(0, 5),
    recentTasks: tasks.slice(0, 5),
    recentAssistedOrders: assistedOrders.slice(0, 5),
    referralCode: salespersonId ? `LUMO-REP-${salespersonId.toUpperCase()}` : ''
  });
});

// GET /api/sales/leads
router.get('/leads', (req: AuthenticatedRequest, res: Response) => {
  const isAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN';
  const salespersonId = isAdmin ? ((req.query.salespersonId as string) || req.user?.salespersonId) : (req.user?.salespersonId || req.user?.id);
  let leads = db.getDb().salesLeads;
  if (!isAdmin && salespersonId) {
    leads = leads.filter(l => l.salespersonId === salespersonId);
  } else if (!isAdmin && !salespersonId) {
    leads = [];
  }
  res.json({ leads });
});

// POST /api/sales/leads
router.post('/leads', requireVerified, (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  const salespersonId = req.user?.salespersonId || req.user?.id || '';
  const salespersonName = req.user?.name || '';

  const newLead: SalespersonLead = {
    id: `lead-${Date.now()}`,
    salespersonId,
    salespersonName,
    leadType: data.leadType || 'CUSTOMER',
    businessName: data.businessName,
    contactName: data.contactName || 'New Contact',
    phone: data.phone || '+255 700 000 000',
    email: data.email || 'contact@example.com',
    region: data.region || 'Dar es Salaam',
    city: data.city || 'Dar es Salaam',
    status: 'PROSPECT',
    notes: data.notes ? (Array.isArray(data.notes) ? data.notes : [data.notes]) : ['Initial lead recorded via Sales Center'],
    expectedMonthlyVolume: Number(data.expectedMonthlyVolume) || 5000000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.updateDb(d => {
    d.salesLeads.unshift(newLead);
  });

  res.status(201).json({ lead: newLead });
});

// PATCH /api/sales/leads/:id
router.patch('/leads/:id', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, note } = req.body;
  const isAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN';

  let updatedLead: SalespersonLead | null = null;
  let forbidden = false;

  db.updateDb(d => {
    const lead = d.salesLeads.find(l => l.id === id);
    if (lead) {
      if (!isAdmin && lead.salespersonId !== req.user?.salespersonId && lead.salespersonId !== req.user?.id) {
        forbidden = true;
        return;
      }
      if (status) lead.status = status;
      if (note) lead.notes.unshift(`[${new Date().toLocaleDateString()}] ${note}`);
      lead.updatedAt = new Date().toISOString();
      updatedLead = lead;
    }
  });

  if (forbidden) {
    return res.status(403).json({ error: 'Access Denied: You do not have permission to modify this lead.' });
  }

  if (!updatedLead) {
    return res.status(404).json({ error: 'Lead not found' });
  }

  res.json({ lead: updatedLead });
});

// GET /api/sales/tasks
router.get('/tasks', (req: AuthenticatedRequest, res: Response) => {
  const isAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN';
  const salespersonId = isAdmin ? ((req.query.salespersonId as string) || req.user?.salespersonId) : (req.user?.salespersonId || req.user?.id);
  const tasks = salespersonId 
    ? ((db.getDb() as any).salesTasks || []).filter((t: any) => t.salespersonId === salespersonId)
    : (isAdmin ? ((db.getDb() as any).salesTasks || []) : []);
  res.json({ tasks });
});

// POST /api/sales/tasks (Create sales follow-up / merchant task)
router.post('/tasks', (req: AuthenticatedRequest, res: Response) => {
  const { title, customerName, sellerName, priority = 'MEDIUM', dueDate, description, leadId } = req.body;
  const salespersonId = req.user?.salespersonId || req.user?.id || '';
  const salespersonName = req.user?.name || '';

  const newTask = {
    id: `stask-${Date.now()}`,
    salespersonId,
    salespersonName,
    title: title || 'Follow up with merchant on bulk order',
    customerName: customerName || 'Kariakoo Wholesaler',
    sellerName: sellerName || 'Verified Merchant',
    priority,
    dueDate: dueDate || new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    description: description || 'Call to discuss monthly bulk discount catalog and onboarding.',
    leadId: leadId || null,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };

  db.updateDb(d => {
    if (!(d as any).salesTasks) (d as any).salesTasks = [];
    (d as any).salesTasks.unshift(newTask);
  });

  res.status(201).json({ success: true, task: newTask });
});

// PATCH /api/sales/tasks/:id
router.patch('/tasks/:id', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, note } = req.body;
  const isAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN';

  let updatedTask: any = null;
  let forbidden = false;

  db.updateDb(d => {
    const tasks = (d as any).salesTasks || [];
    const task = tasks.find((t: any) => t.id === id);
    if (task) {
      if (!isAdmin && task.salespersonId !== req.user?.salespersonId && task.salespersonId !== req.user?.id) {
        forbidden = true;
        return;
      }
      if (status) task.status = status;
      if (note) task.note = note;
      task.updatedAt = new Date().toISOString();
      updatedTask = task;
    }
  });

  if (forbidden) {
    return res.status(403).json({ error: 'Access Denied: You do not have permission to modify this task.' });
  }

  if (!updatedTask) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.json({ success: true, task: updatedTask });
});

// POST /api/sales/assist-order (Field Sales assists customer in placing an order with commission attribution)
router.post('/assist-order', (req: AuthenticatedRequest, res: Response) => {
  const {
    customerName,
    customerPhone,
    customerEmail,
    deliveryAddress,
    city = 'Dar es Salaam',
    deliveryType = 'home',
    productId,
    quantity = 1,
    paymentMethod = 'MOBILE_MONEY'
  } = req.body;

  const salespersonId = req.user?.salespersonId;
  const salespersonName = req.user?.name || 'John Mboya';

  const currentDb = db.getDb();
  const product = currentDb.products.find(p => p.id === productId) || currentDb.products[0];
  const qty = Math.max(1, Number(quantity) || 1);
  const subtotal = product.price * qty;
  const shippingFee = deliveryType === 'home' ? 5000 : 2500;
  const total = subtotal + shippingFee;

  // 3.5% commission for field sales assistance
  const commissionAmount = Math.round(subtotal * 0.035);

  const newOrder: Order = {
    id: `ord-assist-${Date.now()}`,
    orderNumber: `LM-AST-${crypto.randomInt(10000, 100000)}`,
    customerId: `cust-ast-${Date.now()}`,
    customerName: customerName || 'Valued Buyer',
    customerEmail: customerEmail || 'buyer@example.com',
    customerPhone: customerPhone || '+255 754 000 111',
    customer: {
      name: customerName || 'Valued Buyer',
      email: customerEmail || 'buyer@example.com',
      phone: customerPhone || '+255 754 000 111'
    },
    deliveryAddress: {
      fullName: customerName || 'Valued Buyer',
      phone: customerPhone || '+255 754 000 111',
      region: city,
      city,
      area: 'Commercial Hub',
      streetAddress: deliveryAddress || 'Uhuru Street, Kariakoo'
    },
    deliveryMethod: {
      type: deliveryType === 'pickup' ? 'pickup' : 'standard',
      name: deliveryType === 'pickup' ? 'Pickup Station' : 'Doorstep Express',
      fee: shippingFee,
      estimatedDelivery: '1-2 Days'
    },
    paymentMethod: {
      type: 'mobile_money',
      name: 'Mobile Money (M-Pesa / Tigo Pesa)',
      status: 'Paid (Escrow Secured)'
    },
    status: 'Processing',
    paymentStatus: 'PAID',
    deliveryType: deliveryType as any,
    shippingAddress: {
      fullName: customerName || 'Valued Buyer',
      phone: customerPhone || '+255 754 000 111',
      address: deliveryAddress || 'Uhuru Street, Kariakoo',
      city,
      region: city
    },
    items: [
      {
        id: `item-${Date.now()}`,
        productId: product.id,
        productName: product.name,
        name: product.name,
        productImage: product.thumbnail || product.images[0],
        brand: product.brand || 'LUMO Partner',
        sellerName: product.sellerName || 'Verified Merchant',
        selectedVariations: {},
        unitPrice: product.price,
        totalPrice: subtotal,
        price: product.price,
        quantity: qty,
        thumbnail: product.thumbnail || product.images[0]
      }
    ],
    pricing: {
      subtotal,
      deliveryFee: shippingFee,
      shippingFee,
      discount: 0,
      total,
      escrowFee: 0,
      tax: 0
    },
    statusHistory: [
      {
        status: 'Processing',
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        note: `Order assisted by Field Sales Rep: ${salespersonName} (${salespersonId}). Customer order verified.`
      }
    ],
    trackingNumber: `TRK-${Date.now().toString().slice(-6)}`,
    createdAt: new Date().toISOString(),
    estimatedDelivery: new Date(Date.now() + 24 * 3600000).toISOString()
  };

  (newOrder as any).salespersonId = salespersonId;
  (newOrder as any).salespersonName = salespersonName;
  (newOrder as any).salesCommission = commissionAmount;
  (newOrder as any).isAssistedOrder = true;

  db.updateDb(d => {
    d.orders.unshift(newOrder);

    // Create delivery task
    d.deliveryTasks.unshift({
      id: `task-${Date.now()}`,
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      customerName: newOrder.customerName,
      customerPhone: newOrder.customerPhone,
      deliveryAddress: `${newOrder.shippingAddress.address}, ${newOrder.shippingAddress.city}`,
      codAmount: paymentMethod === 'CASH_ON_DELIVERY' ? total : 0,
      isCodCollected: paymentMethod !== 'CASH_ON_DELIVERY',
      otpCode: `${crypto.randomInt(1000, 10000)}`,
      status: 'PENDING',
      riderId: 'unassigned',
      riderName: 'Unassigned',
      deliveryType: deliveryType as any,
      createdAt: new Date().toISOString()
    });

    // Notify Operations
    d.notifications.unshift({
      id: `notif-sales-${Date.now()}`,
      userId: 'admin-operations',
      title: 'New Sales-Assisted Order',
      message: `Order #${newOrder.orderNumber} assisted by ${salespersonName}. Commission of ${commissionAmount} TZS attributed.`,
      type: 'ORDER',
      read: false,
      createdAt: new Date().toISOString(),
      link: `/operations`
    });
  });

  res.status(201).json({
    success: true,
    order: newOrder,
    commissionAmount,
    message: `Order #${newOrder.orderNumber} created successfully! Commission of ${commissionAmount.toLocaleString()} TZS attributed to your account.`
  });
});

// GET /api/sales/activities
router.get('/activities', (req: AuthenticatedRequest, res: Response) => {
  const salespersonId = req.user?.salespersonId || (req.query.salespersonId as string);
  const activities = db.getDb().salesActivities.filter(a => a.salespersonId === salespersonId);
  res.json({ activities });
});

// POST /api/sales/activities
router.post('/activities', (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  const salespersonId = req.user?.salespersonId;

  const newActivity: SalesActivity = {
    id: `act-${Date.now()}`,
    salespersonId,
    leadId: data.leadId,
    type: data.type || 'CALL',
    title: data.title || 'Client Engagement',
    details: data.details || 'Completed follow-up action.',
    location: data.location || 'Dar es Salaam',
    timestamp: new Date().toISOString()
  };

  db.updateDb(d => {
    d.salesActivities.unshift(newActivity);
  });

  res.status(201).json({ activity: newActivity });
});

// DELETE /api/sales/leads/:id
router.delete('/leads/:id', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const isAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN';
  const salespersonId = req.user?.salespersonId || req.user?.id;

  const lead = (db.getDb().salesLeads || []).find(l => l.id === id);
  if (!lead) {
    return res.status(404).json({ error: 'Lead not found' });
  }

  if (!isAdmin && lead.salespersonId && lead.salespersonId !== salespersonId) {
    return res.status(403).json({ error: 'Forbidden: You do not own this lead.' });
  }

  db.updateDb(d => {
    d.salesLeads = (d.salesLeads || []).filter(l => l.id !== id);
  });

  db.addAuditLog({
    userId: req.user?.id || 'salesperson',
    userName: req.user?.name as string,
    userRole: (req.user?.role || 'SALESPERSON') as any,
    action: 'DELETE_LEAD',
    entityType: 'OTHER',
    entityId: id,
    newValue: `Deleted sales lead ${lead.businessName} (${id})`
  });

  res.json({ success: true, message: 'Sales lead deleted successfully' });
});

export default router;

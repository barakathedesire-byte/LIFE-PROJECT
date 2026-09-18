import crypto from "node:crypto";
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../server/app.js';
import { db } from '../server/db.js';

const app = createApp();

describe('Phase 9B: Operational Account Constraints', () => {
    
    let unverifiedSellerToken: string;
    let verifiedSellerToken: string;
    let otherVerifiedSellerToken: string;
    
    let unverifiedRiderToken: string;
    let verifiedRiderToken: string;
    
    let unverifiedStationToken: string;
    let verifiedStationToken: string;
    
    beforeAll(async () => {
        await db.updateDb(d => {
            d.users = (d.users || []).filter(u => !u.email.includes('example.com'));
            d.sellers = (d.sellers || []).filter(s => s.id !== 'sel-v1' && s.id !== 'sel-o1');
            d.products = (d.products || []).filter(p => p.id !== 'prod-v1');
            d.inventory = (d.inventory || []).filter(i => i.id !== 'inv-v1');
            d.deliveryTasks = (d.deliveryTasks || []).filter(t => t.id !== 'task-v1');
        });

        // Setup unverified seller
        const usRes = await request(app).post('/api/auth/register').send({
            email: 'unverified-seller@example.com',
            password: 'Password123!',
            name: 'Unverified Seller',
            firstName: 'Unverified',
            lastName: 'Seller',
            birthDate: '1990-01-01',
            phone: '+255700000001',
            termsAccepted: true,
            role: 'SELLER'
        });
        unverifiedSellerToken = usRes.body.token;
        
        // Setup verified seller
        const vsRes = await request(app).post('/api/auth/register').send({
            email: 'verified-seller@example.com',
            password: 'Password123!',
            name: 'Verified Seller',
            firstName: 'Verified',
            lastName: 'Seller',
            birthDate: '1990-01-01',
            phone: '+255700000002',
            termsAccepted: true,
            role: 'SELLER'
        });
        verifiedSellerToken = vsRes.body.token;
        
        // Make verified seller verified
        await db.updateDb(d => {
            const u = d.users.find(u => u.email === 'verified-seller@example.com');
            if (u) {
                u.isVerified = true;
                u.verificationStatus = 'APPROVED';
                u.sellerId = 'sel-v1';
            }
            d.sellers.push({ id: 'sel-v1', name: 'Verified Seller Shop', status: 'ACTIVE' } as any);
        });
        
        // Setup other verified seller
        const osRes = await request(app).post('/api/auth/register').send({
            email: 'other-seller@example.com',
            password: 'Password123!',
            name: 'Other Seller',
            firstName: 'Other',
            lastName: 'Seller',
            birthDate: '1990-01-01',
            phone: '+255700000003',
            termsAccepted: true,
            role: 'SELLER'
        });
        otherVerifiedSellerToken = osRes.body.token;
        await db.updateDb(d => {
            const u = d.users.find(u => u.email === 'other-seller@example.com');
            if (u) {
                u.isVerified = true;
                u.verificationStatus = 'APPROVED';
                u.sellerId = 'sel-o1';
            }
            d.sellers.push({ id: 'sel-o1', name: 'Other Seller Shop', status: 'ACTIVE' } as any);
        });
        
        
        // Add a product for verified seller
        await db.updateDb(d => {
            d.products.push({
                id: 'prod-v1',
                name: 'Verified Product',
                sellerId: 'sel-v1',
                price: 100,
                status: 'ACTIVE'
            } as any);
            d.inventory.push({
                id: 'inv-v1',
                productId: 'prod-v1',
                productName: 'Verified Product',
                sellerId: 'sel-v1',
                quantity: 10
            } as any);
        });
        
        // Rider setup
        const urRes = await request(app).post('/api/auth/register').send({
            email: 'unverified-rider@example.com',
            password: 'Password123!',
            name: 'Unverified Rider',
            firstName: 'Unverified',
            lastName: 'Rider',
            birthDate: '1990-01-01',
            phone: '+255700000004',
            termsAccepted: true,
            role: 'DELIVERY_AGENT'
        });
        unverifiedRiderToken = urRes.body.token;
        
        const vrRes = await request(app).post('/api/auth/register').send({
            email: 'verified-rider@example.com',
            password: 'Password123!',
            name: 'Verified Rider',
            firstName: 'Verified',
            lastName: 'Rider',
            birthDate: '1990-01-01',
            phone: '+255700000005',
            termsAccepted: true,
            role: 'DELIVERY_AGENT'
        });
        verifiedRiderToken = vrRes.body.token;
        
        let verifiedRiderId = '';
        await db.updateDb(d => {
            const u = d.users.find(u => u.email === 'verified-rider@example.com');
            if (u) {
                u.isVerified = true;
                u.verificationStatus = 'APPROVED';
                verifiedRiderId = u.id;
            }
            
            d.deliveryTasks = d.deliveryTasks || [];
            d.deliveryTasks.push({
                id: 'task-v1',
                riderId: verifiedRiderId,
                status: 'ASSIGNED',
                orderId: 'ord-123',
                orderNumber: 'ORD-123'
            } as any);
        });
    });

    it('1. Unverified seller cannot perform operational action', async () => {
        const res = await request(app)
            .post('/api/sellers/upload-media')
            .set('Authorization', `Bearer ${unverifiedSellerToken}`)
            .send({});
            
        expect(res.status).toBe(403);
        expect(res.body.code).toBe('VERIFICATION_REQUIRED');
    });

    it('2. Verified seller CAN perform operational action', async () => {
        const res = await request(app)
            .post('/api/sellers/upload-media')
            .set('Authorization', `Bearer ${verifiedSellerToken}`)
            .send({});
            
        expect(res.status).toBe(200);
    });

    it('3. Unverified rider cannot perform operational action', async () => {
        const res = await request(app)
            .post('/api/delivery/accept-task')
            .set('Authorization', `Bearer ${unverifiedRiderToken}`)
            .send({ taskId: 'task-v1' });
            
        expect(res.status).toBe(403);
        expect(res.body.code).toBe('VERIFICATION_REQUIRED');
    });
    
    it('4. Seller A cannot update Seller B inventory', async () => {
        const res = await request(app)
            .put('/api/sellers/inventory/inv-v1')
            .set('Authorization', `Bearer ${otherVerifiedSellerToken}`)
            .send({ quantity: 50 });
            
        // Should be forbidden because inv-v1 belongs to sel-v1, not sel-o1
        expect(res.status).toBe(403);
    });
    
});

describe('Security & IDOR Regression Tests (Phase 9A - Problem Q)', () => {
  let customerA: any, customerAToken: string;
  let customerB: any, customerBToken: string;
  let sellerA: any, sellerAToken: string, sellerA_ID: string;
  let sellerB: any, sellerBToken: string, sellerB_ID: string;
  let riderA: any, riderAToken: string, riderA_ID: string;
  let riderB: any, riderBToken: string, riderB_ID: string;
  let pickupA: any, pickupAToken: string, pickupA_ID: string;
  let pickupB: any, pickupBToken: string, pickupB_ID: string;
  let adminToken: string;
  
  let orderA_ID: string;
  let productA_ID: string;
  let productB_ID: string;
  let ticketA_ID: string;
  let notificationA_ID: string;

  beforeAll(async () => {
    const adminRes = await request(app).post('/api/auth/login').send({ email: 'admin@lumo.africa', password: 'LumoPass2026!' });
    adminToken = adminRes.body.token;

    const registerUser = async (email: string, role: string, extra: any = {}) => {
      const res = await request(app).post('/api/auth/register').send({
        firstName: 'Test', lastName: 'User', name: `Test ${role}`, birthDate: '1990-01-01',
        email, phone: '+255 700 ' + crypto.randomInt(100000, 999999), password: 'Password123!',
        role, termsAccepted: true, ...extra
      });
      if (!res.body.user) console.log("Register failed:", res.body);
      const userId = res.body.user.id;
      if (['SELLER', 'DELIVERY_AGENT', 'PICKUP_OPERATOR'].includes(role)) {
        await request(app).post(`/api/admin/users/${userId}/verification-status`).set('Authorization', `Bearer ${adminToken}`).send({ verificationStatus: 'VERIFIED', isVerified: true, isActive: true });
        const loginRes = await request(app).post('/api/auth/login').send({ email, password: 'Password123!' });
        return { user: loginRes.body.user, token: loginRes.body.token };
      }
      return { user: res.body.user, token: res.body.token };
    };

    const cA = await registerUser('customerA_' + Date.now() + '@test.com', 'CUSTOMER'); customerA = cA.user; customerAToken = cA.token;
    const cB = await registerUser('customerB_' + Date.now() + '@test.com', 'CUSTOMER'); customerB = cB.user; customerBToken = cB.token;
    const sA = await registerUser('sellerA_' + Date.now() + '@test.com', 'SELLER', { businessName: 'Store A' }); sellerA = sA.user; sellerAToken = sA.token; sellerA_ID = sellerA.sellerId;
    const sB = await registerUser('sellerB_' + Date.now() + '@test.com', 'SELLER', { businessName: 'Store B' }); sellerB = sB.user; sellerBToken = sB.token; sellerB_ID = sellerB.sellerId;
    const rA = await registerUser('riderA_' + Date.now() + '@test.com', 'DELIVERY_AGENT'); riderA = rA.user; riderAToken = rA.token; riderA_ID = riderA.id;
    const rB = await registerUser('riderB_' + Date.now() + '@test.com', 'DELIVERY_AGENT'); riderB = rB.user; riderBToken = rB.token; riderB_ID = riderB.id;
    const pA = await registerUser('pickupA_' + Date.now() + '@test.com', 'PICKUP_OPERATOR', { businessName: 'Pickup A' }); pickupA = pA.user; pickupAToken = pA.token; pickupA_ID = pickupA.pickupStationId;
    const pB = await registerUser('pickupB_' + Date.now() + '@test.com', 'PICKUP_OPERATOR', { businessName: 'Pickup B' }); pickupB = pB.user; pickupBToken = pB.token; pickupB_ID = pickupB.pickupStationId;
    
    
    // Force activate pickup stations
    db.updateDb(d => {
      d.pickupStations = d.pickupStations || [];
      const sA = d.pickupStations.find(s => s.id === pickupA_ID);
      const sB = d.pickupStations.find(s => s.id === pickupB_ID);
      if (sA) sA.status = 'ACTIVE';
      if (sB) sB.status = 'ACTIVE';
    });

    // Seed test data
    const pARes = await request(app).post('/api/products').set('Authorization', `Bearer ${sellerAToken}`).send({
      title: 'Product A', description: 'Desc', price: 10000, stockQuantity: 10, categoryId: 'cat-1', sellerId: sellerA_ID
    });
    productA_ID = pARes.body.product.id;

    const pBRes = await request(app).post('/api/products').set('Authorization', `Bearer ${sellerBToken}`).send({
      title: 'Product B', description: 'Desc', price: 10000, stockQuantity: 10, categoryId: 'cat-1', sellerId: sellerB_ID
    });
    productB_ID = pBRes.body.product.id;

    const oARes = await request(app).post('/api/orders').set('Authorization', `Bearer ${customerAToken}`).send({
      items: [{ productId: productA_ID, quantity: 1, price: 10000, sellerId: sellerA_ID }],
      deliveryMethod: 'DOOR_DELIVERY',
      shippingAddress: { fullName: 'A', phone: '1', region: 'R', city: 'C', area: 'A', addressLine: 'L' }
    });
    orderA_ID = oARes.body.order.id;

    const tARes = await request(app).post('/api/support/tickets').set('Authorization', `Bearer ${customerAToken}`).send({
      subject: 'Issue', message: 'Hello', category: 'ORDER', priority: 'HIGH'
    });
    ticketA_ID = tARes.body.ticket.id;
    
    
    // Inject Delivery Task for Rider B
    db.updateDb(d => {
      d.deliveryTasks.push({
        id: `tsk-${orderA_ID}`,
        orderId: orderA_ID,
        orderNumber: 'TEST-ORDER-123',
        riderId: riderB_ID,
        status: 'PENDING',
        otpCode: '123456',
        customerName: 'A',
        customerPhone: '1',
        codAmount: 0,
        isCodCollected: false
      });
    });

    // Admin creates a notification for Customer A
    const nARes = await request(app).post('/api/notifications/send').set('Authorization', `Bearer ${adminToken}`).send({
      userId: customerA.id, title: 'Alert', message: 'Read this', type: 'SYSTEM'
    });
    notificationA_ID = nARes.body.notification?.id || nARes.body.notifications?.[0]?.id;
    if (!notificationA_ID) {
      const dbInstance = db.getDb();
      if (dbInstance.notifications && dbInstance.notifications.length > 0) {
        notificationA_ID = dbInstance.notifications[dbInstance.notifications.length-1].id;
      } else {
        db.updateDb(d => {
          if (!d.notifications) d.notifications = [];
          notificationA_ID = 'notif-1';
          d.notifications.push({ id: notificationA_ID, userId: customerA.id, title: 'a', message: 'b', type: 'SYSTEM', isRead: false, createdAt: new Date().toISOString() });
        });
      }
    }
  });

  // 1
  it('1. Unauthenticated access to protected orders is rejected', async () => {
    const res = await request(app).get(`/api/orders/${orderA_ID}`);
    expect(res.status).toBe(401);
  });
  
  // 2
  it('2. Order ownership/impersonation attempt fails', async () => {
    const res = await request(app).get(`/api/orders/${orderA_ID}`).set('Authorization', `Bearer ${customerBToken}`);
    expect(res.status).toBe(403);
    const res2 = await request(app).post('/api/orders').set('Authorization', `Bearer ${customerBToken}`).send({
      customerId: customerA.id, items: [{ productId: productA_ID, quantity: 1, price: 10000, sellerId: sellerA_ID }], deliveryMethod: 'DOOR_DELIVERY', shippingAddress: { fullName: 'B', phone: '1', region: 'R', city: 'C', area: 'A', addressLine: 'L' }
    });
    if (res2.status === 201 || res2.status === 200) {
      expect(res2.body.order.customerId).toBe(customerB.id);
      expect(res2.body.order.customerId).not.toBe(customerA.id);
    } else {
      expect([400, 401, 403]).toContain(res2.status);
    }
  });

  // 3
  it('3. Seller A cannot access or modify Seller B resources', async () => {
    const res = await request(app).put(`/api/products/${productB_ID}`).set('Authorization', `Bearer ${sellerAToken}`).send({ price: 1 });
    expect([403, 400, 404]).toContain(res.status);
  });

  // 4
  it('4. Rider A accessing Rider B assigned resources', async () => {
    await request(app).patch(`/api/orders/${orderA_ID}/status`).set('Authorization', `Bearer ${adminToken}`).send({ status: 'Shipped', riderId: riderB_ID });
    const res = await request(app).post(`/api/delivery/tasks/tsk-${orderA_ID}/complete`).set('Authorization', `Bearer ${riderAToken}`).send({ otpCode: '123456' });
    expect([404, 403, 400]).toContain(res.status);
  });
  
  // 5
  it('5. Pickup Station A accessing Pickup Station B resources', async () => {
    const oRes = await request(app).post('/api/orders').set('Authorization', `Bearer ${customerAToken}`).send({
      items: [{ productId: productA_ID, quantity: 1, price: 10000, sellerId: sellerA_ID }],
      deliveryMethod: { type: 'pickup', pickupStationId: pickupB_ID },
      shippingAddress: { fullName: 'A', phone: '1', region: 'R', city: 'C', area: 'A', addressLine: 'L' }
    });
    const orderB_ID = oRes.body.order.id;
    
    // Station A tries to receive package meant for Station B
    const res = await request(app).post('/api/pickup/receive-package').set('Authorization', `Bearer ${pickupAToken}`).send({ orderId: orderB_ID });
    expect([403, 404, 400]).toContain(res.status);
  });

  // 6
  it('6. Return IDOR', async () => {
    // Deliver order A first
    db.updateDb(d => {
      const o = d.orders.find(or => or.id === orderA_ID);
      if (o) { o.status = 'Delivered'; }
    });
    
    const retRes = await request(app).post('/api/returns').set('Authorization', `Bearer ${customerAToken}`).send({ orderId: orderA_ID, reason: 'DEFECTIVE' });
    const returnId = retRes.body?.id || retRes.body?.returnRequest?.id;
    
    expect(returnId).toBeTruthy();
    
    const getRes = await request(app).get(`/api/returns/${returnId}`).set('Authorization', `Bearer ${customerBToken}`);
    expect(getRes.status).toBe(403);
  });

  // 7
  it('7. Payout/financial IDOR', async () => {
    const payoutRes = await request(app).post('/api/sellers/payouts/request').set('Authorization', `Bearer ${sellerAToken}`).send({ sellerId: sellerB_ID, amount: 20000 });
    expect([400, 403]).toContain(payoutRes.status);
  });


  
  // 8. Product IDOR
  it('8. Product IDOR (Seller B cannot modify Seller A product)', async () => {
    const res = await request(app).put(`/api/products/${productA_ID}`).set('Authorization', `Bearer ${sellerBToken}`).send({
      price: 999
    });
    expect([403, 404, 400]).toContain(res.status);
    const getRes = await request(app).get(`/api/products/${productA_ID}`);
    expect(getRes.body.product ? getRes.body.product.price : getRes.body.price).toBe(10000);
  });

  // 9
  it('9. Inventory/stock IDOR', async () => {
    const res = await request(app).put(`/api/sellers/inventory/${productB_ID}`).set('Authorization', `Bearer ${sellerAToken}`).send({ stock: 5 });
    expect([403, 400, 404]).toContain(res.status);
  });

  // 10
  it('10. Conversation/message IDOR', async () => {
    const res = await request(app).get(`/api/support/tickets/${ticketA_ID}`).set('Authorization', `Bearer ${customerBToken}`);
    expect([403, 404]).toContain(res.status);
  });
  
  // 11
  it('11. Notification IDOR', async () => {
    const res = await request(app).patch(`/api/notifications/${notificationA_ID}/read`).set('Authorization', `Bearer ${customerBToken}`);
    expect([403, 404]).toContain(res.status);
  });

  
  // 12-15 OTP Tests
  let otpOrder_ID: string;

  it('12. Invalid delivery OTP', async () => {
    // Setup a brand new order for OTP tests
    const oRes = await request(app).post('/api/orders').set('Authorization', `Bearer ${customerAToken}`).send({
      items: [{ productId: productA_ID, quantity: 1, price: 10000, sellerId: sellerA_ID }],
      deliveryMethod: 'DOOR_DELIVERY',
      shippingAddress: { fullName: 'A', phone: '1', region: 'R', city: 'C', area: 'A', addressLine: 'L' }
    });
    
    otpOrder_ID = oRes.body.order.id;
    
    // Manually inject a delivery task for this order so the tests can reliably hit it by known ID
    db.updateDb(d => {
      d.deliveryTasks.push({
        id: `tsk-${otpOrder_ID}`,
        orderId: otpOrder_ID,
        orderNumber: 'TEST-OTP-123',
        riderId: riderB_ID,
        status: 'PENDING',
        otpCode: '123456',
        customerName: 'A',
        customerPhone: '1',
        codAmount: 0,
        isCodCollected: false
      });
      const o = d.orders.find(or => or.id === otpOrder_ID);
      if (o) {
         o.otpCode = '123456';
      }
    });

    
    // Assign to riderB and mark as Shipped
    await request(app).patch(`/api/orders/${otpOrder_ID}/status`).set('Authorization', `Bearer ${adminToken}`).send({ status: 'Shipped', riderId: riderB_ID });
    
    // Test invalid OTP
    const res = await request(app).post(`/api/delivery/tasks/tsk-${otpOrder_ID}/complete`).set('Authorization', `Bearer ${riderBToken}`).send({ otpCode: 'wrong' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_OTP');
  });

  it('13. Expired delivery OTP', async () => {
    db.updateDb(d => {
      const o = d.orders.find(or => or.id === otpOrder_ID);
      if (o) { o.otpExpiresAt = new Date(Date.now() - 100000).toISOString(); }
    });
    const res = await request(app).post(`/api/delivery/tasks/tsk-${otpOrder_ID}/complete`).set('Authorization', `Bearer ${riderBToken}`).send({ otpCode: '123456' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('OTP_EXPIRED');
  });
  
  it('15. Excessive OTP attempts/rate limiting', async () => {
    // Reset expiration
    db.updateDb(d => {
      const o = d.orders.find(or => or.id === otpOrder_ID);
      if (o) { o.otpExpiresAt = new Date(Date.now() + 100000).toISOString(); o.otpAttempts = 3; }
    });
    const res = await request(app).post(`/api/delivery/tasks/tsk-${otpOrder_ID}/complete`).set('Authorization', `Bearer ${riderBToken}`).send({ otpCode: '111111' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('OTP_LOCKED');
  });

  it('14. Reused delivery OTP', async () => {
    // Set status to VERIFIED to simulate a reused OTP
    db.updateDb(d => {
      const o = d.orders.find(or => or.id === otpOrder_ID);
      if (o) { o.otpStatus = 'VERIFIED'; o.status = 'Delivered'; o.otpAttempts = 0; }
    });
    const res = await request(app).post(`/api/delivery/tasks/tsk-${otpOrder_ID}/complete`).set('Authorization', `Bearer ${riderBToken}`).send({ otpCode: '123456' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('OTP_ALREADY_USED');
  });

  // 16
  it('16. Unverified operational account attempting a protected operation', async () => {
    const res = await request(app).post('/api/auth/register').send({
      firstName: 'Unver', lastName: 'Seller', name: 'Unver Seller', birthDate: '1990-01-01',
      email: 'unver_seller_' + Date.now() + '@test.com', phone: '+255 700 ' + crypto.randomInt(100000, 999999),
      password: 'Password123!', role: 'SELLER', termsAccepted: true
    });
    const token = res.body.token;
    const pC = await request(app).post('/api/products').set('Authorization', `Bearer ${token}`).send({
      title: 'P', description: 'D', price: 100, stockQuantity: 1, categoryId: 'cat-1'
    });
    expect(pC.status).toBe(403);
    expect(pC.body.code || pC.body.error).toBe('VERIFICATION_REQUIRED');
  });

  // 17
  it('17. Frontend/localStorage role manipulation (privilege escalation)', async () => {
    const res = await request(app).post('/api/admin/users/123/verification-status').set('Authorization', `Bearer ${customerAToken}`).send({ verificationStatus: 'VERIFIED' });
    expect(res.status).toBe(403);
  });


  
  // 18. Fake request-body identity
  it('18. Fake request-body identity', async () => {
    const res = await request(app).post('/api/products').set('Authorization', `Bearer ${sellerAToken}`).send({
      title: 'Malicious Product',
      description: 'Desc',
      price: 500,
      stockQuantity: 10,
      categoryId: 'cat-1',
      sellerId: sellerB_ID
    });
    if (res.status === 201 || res.status === 200) {
      expect(res.body.product.sellerId).toBe(sellerA_ID);
      expect(res.body.product.sellerId).not.toBe(sellerB_ID);
    } else {
      expect([400, 401, 403]).toContain(res.status);
    }
  });


  // 20. Unauthorized financial operations
  it('20. Unauthorized financial operations', async () => {
    const payoutRes = await request(app).post('/api/sellers/payouts/request').set('Authorization', `Bearer ${customerAToken}`).send({
      sellerId: sellerA_ID, 
      amount: 1000
    });
    expect([400, 401, 403, 404]).toContain(payoutRes.status);
  });

  // 19
  it('19. Invalid order-status transition', async () => {
    // orderA is currently SHIPPED. Can it go directly to PENDING?
    const res = await request(app).patch(`/api/orders/${orderA_ID}/status`).set('Authorization', `Bearer ${adminToken}`).send({ status: 'Pending' });
    expect([400, 403]).toContain(res.status);
    if (res.status === 400) expect(res.body.error).toMatch(/Invalid status transition/i);
  });


  // 21
  it('21. Revoked/invalidated session access', async () => {
    let tokenToRevoke = '';
    const loginRes = await request(app).post('/api/auth/login').send({ email: customerB.email, password: 'Password123!' });
    tokenToRevoke = loginRes.body.token;
    
    // Revoke via logout
    await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${tokenToRevoke}`);
    
    const accessRes = await request(app).get(`/api/orders/${orderA_ID}`).set('Authorization', `Bearer ${tokenToRevoke}`);
    expect(accessRes.status).toBe(401);
  });

  // 22
  it('22. Suspended account access', async () => {
    await request(app).patch(`/api/admin/users/${customerA.id}/status`).set('Authorization', `Bearer ${adminToken}`).send({ status: 'SUSPENDED' });
    const res = await request(app).get(`/api/orders/${orderA_ID}`).set('Authorization', `Bearer ${customerAToken}`);
    expect(res.status).toBe(401);
  });
});

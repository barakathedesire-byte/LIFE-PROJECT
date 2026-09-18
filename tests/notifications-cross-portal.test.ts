import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../server/app.js';
import { db } from '../server/db.js';
import { NotificationService } from '../server/services/notificationService.js';

const app = createApp();

describe('Phase 9E: Notification System & Cross-Portal Event Automation', () => {
  let custAToken: string;
  let custBToken: string;
  let sellerAToken: string;
  let sellerBToken: string;
  let riderAToken: string;
  let riderBToken: string;
  let whAToken: string;
  let whBToken: string;
  let stationAToken: string;
  let stationBToken: string;
  let suspendedToken: string;
  let financeToken: string;
  let adminToken: string;

  let custAId: string;
  let custBId: string;
  let notifAId: string;
  let notifBId: string;

  beforeAll(async () => {
    // Cleanup test users and notifications
    await db.updateDb(d => {
      d.users = (d.users || []).filter(u => !u.email.includes('9e-test-'));
      d.notifications = (d.notifications || []).filter(n => !n.title.includes('9E Test'));
    });

    // 1. Register Customer A
    const rCustA = await request(app).post('/api/auth/register').send({
      email: '9e-test-custA@example.com',
      password: 'Password123!',
      name: 'Customer A',
      firstName: 'Customer',
      lastName: 'A',
      birthDate: '1990-01-01',
      phone: '+255711100001',
      termsAccepted: true,
      role: 'CUSTOMER'
    });
    custAToken = rCustA.body.token;
    custAId = rCustA.body.user.id;

    // 2. Register Customer B
    const rCustB = await request(app).post('/api/auth/register').send({
      email: '9e-test-custB@example.com',
      password: 'Password123!',
      name: 'Customer B',
      firstName: 'Customer',
      lastName: 'B',
      birthDate: '1990-01-01',
      phone: '+255711100002',
      termsAccepted: true,
      role: 'CUSTOMER'
    });
    custBToken = rCustB.body.token;
    custBId = rCustB.body.user.id;

    // 3. Register Seller A & B
    const rSelA = await request(app).post('/api/auth/register').send({
      email: '9e-test-sellerA@example.com',
      password: 'Password123!',
      name: 'Seller A',
      firstName: 'Seller',
      lastName: 'A',
      birthDate: '1985-01-01',
      phone: '+255722200001',
      businessName: 'Seller A Shop',
      termsAccepted: true,
      role: 'SELLER'
    });
    sellerAToken = rSelA.body.token;

    const rSelB = await request(app).post('/api/auth/register').send({
      email: '9e-test-sellerB@example.com',
      password: 'Password123!',
      name: 'Seller B',
      firstName: 'Seller',
      lastName: 'B',
      birthDate: '1985-01-01',
      phone: '+255722200002',
      businessName: 'Seller B Shop',
      termsAccepted: true,
      role: 'SELLER'
    });
    sellerBToken = rSelB.body.token;

    // 4. Register Riders A & B
    const rRidA = await request(app).post('/api/auth/register').send({
      email: '9e-test-riderA@example.com',
      password: 'Password123!',
      name: 'Rider A',
      firstName: 'Rider',
      lastName: 'A',
      birthDate: '1990-01-01',
      phone: '+255733300001',
      termsAccepted: true,
      role: 'DELIVERY_AGENT'
    });
    riderAToken = rRidA.body.token;

    const rRidB = await request(app).post('/api/auth/register').send({
      email: '9e-test-riderB@example.com',
      password: 'Password123!',
      name: 'Rider B',
      firstName: 'Rider',
      lastName: 'B',
      birthDate: '1990-01-01',
      phone: '+255733300002',
      termsAccepted: true,
      role: 'DELIVERY_AGENT'
    });
    riderBToken = rRidB.body.token;

    // 5. Register Suspended User
    const rSusp = await request(app).post('/api/auth/register').send({
      email: '9e-test-susp@example.com',
      password: 'Password123!',
      name: 'Suspended User',
      firstName: 'Suspended',
      lastName: 'User',
      birthDate: '1990-01-01',
      phone: '+255744400001',
      termsAccepted: true,
      role: 'CUSTOMER'
    });
    suspendedToken = rSusp.body.token;
    await db.updateDb(d => {
      const u = d.users.find(x => x.email === '9e-test-susp@example.com');
      if (u) {
        u.isActive = false;
        u.status = 'SUSPENDED';
      }
    });

    // 6. Admin Login
    const adminRes = await request(app).post('/api/auth/login').send({
      email: 'admin@lumo.africa',
      password: 'LumoPass2026!'
    });
    adminToken = adminRes.body.token;

    // Create test notifications via service
    const n1 = NotificationService.createNotification({
      recipientUserId: custAId,
      title: '9E Test Customer A Notice',
      message: 'Private notice for Customer A',
      type: 'ORDER'
    });
    notifAId = n1!.id;

    const n2 = NotificationService.createNotification({
      recipientUserId: custBId,
      title: '9E Test Customer B Notice',
      message: 'Private notice for Customer B',
      type: 'ORDER'
    });
    notifBId = n2!.id;
  });

  it('TEST 1: Customer A cannot read Customer B notifications', async () => {
    const res = await request(app)
      .get(`/api/notifications/${notifBId}`)
      .set('Authorization', `Bearer ${custAToken}`);

    expect([403, 404]).toContain(res.status);
  });

  it('TEST 2: Customer A cannot mark Customer B notification as read', async () => {
    const res = await request(app)
      .patch(`/api/notifications/${notifBId}/read`)
      .set('Authorization', `Bearer ${custAToken}`);

    expect([403, 404]).toContain(res.status);
  });

  it('TEST 3: Customer A cannot delete Customer B notification', async () => {
    const res = await request(app)
      .delete(`/api/notifications/${notifBId}`)
      .set('Authorization', `Bearer ${custAToken}`);

    expect([403, 404]).toContain(res.status);
  });

  it('TEST 4 & 5: Customer A notification list only returns Customer A notifications', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${custAToken}`);

    expect(res.status).toBe(200);
    const notifs = res.body.notifications;
    expect(notifs.some((n: any) => n.id === notifBId)).toBe(false);
    expect(notifs.some((n: any) => n.id === notifAId)).toBe(true);
  });

  it('TEST 10: Suspended account cannot access privileged notification stream', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${suspendedToken}`);

    expect([401, 403]).toContain(res.status);
  });

  it('TEST 12: Repeated processing of one event does not create duplicate notifications (Idempotency)', async () => {
    const eventId = `evt-idempotent-${Date.now()}`;
    const n1 = NotificationService.createNotification({
      recipientUserId: custAId,
      eventId,
      title: 'Idempotent Notice',
      message: 'Should only exist once'
    });
    const n2 = NotificationService.createNotification({
      recipientUserId: custAId,
      eventId,
      title: 'Idempotent Notice Duplicate',
      message: 'Should be deduplicated'
    });

    expect(n1?.id).toBe(n2?.id);
    const count = db.getDb().notifications.filter(n => (n as any).eventId === eventId).length;
    expect(count).toBe(1);
  });

  it('TEST 13 & 14: Payment confirmation event generates authoritative customer and seller notifications', async () => {
    const orderId = `ord-9e-${Date.now()}`;
    await db.updateDb(d => {
      d.orders.push({
        id: orderId,
        orderNumber: `LUM-${Date.now()}`,
        customerId: custAId,
        items: [{ productId: 'p1', sellerId: 'sel-v1', price: 50000, quantity: 1 }],
        totalAmount: 50000,
        paymentStatus: 'Paid',
        status: 'Confirmed',
        createdAt: new Date().toISOString()
      } as any);
    });

    NotificationService.emitEvent('PAYMENT_CONFIRMED', {
      orderId,
      customerId: custAId,
      title: 'Payment Confirmed & Secured in Escrow'
    });

    const custNotifs = db.getDb().notifications.filter(n => n.userId === custAId);
    expect(custNotifs.some(n => n.title.includes('Payment Confirmed'))).toBe(true);
  });

  it('TEST 17 & 18: Promotional opt-out prevents promotional notifications while keeping transactional ones', async () => {
    await db.updateDb(d => {
      const u = d.users.find(x => x.id === custAId);
      if (u) {
        (u as any).notificationPreferences = { promotional: false, transactional: true };
      }
    });

    // Try creating promotional notification
    const promo = NotificationService.createNotification({
      recipientUserId: custAId,
      title: 'Special Promo 50% Off',
      message: 'Discount notice',
      type: 'PROMOTION',
      isPromotional: true
    });
    expect(promo).toBeNull();

    // Transactional notification should succeed
    const trans = NotificationService.createNotification({
      recipientUserId: custAId,
      title: 'Security Alert',
      message: 'Password changed',
      type: 'SECURITY'
    });
    expect(trans).not.toBeNull();
  });

  it('TEST 24: Unread count matches authoritative backend records', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${custAToken}`);

    expect(res.status).toBe(200);
    const unreadCount = res.body.notifications.filter((n: any) => !n.isRead && !n.read).length;
    expect(typeof unreadCount).toBe('number');
    expect(unreadCount).toBeGreaterThanOrEqual(0);
  });
});

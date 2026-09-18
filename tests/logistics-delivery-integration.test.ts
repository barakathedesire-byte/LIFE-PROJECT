import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../server/app.js';
import { db } from '../server/db.js';

const app = createApp();

describe('Phase 9D: Delivery, Rider, Warehouse & Pickup Station Integration Hardening', () => {
  let customerToken: string;
  let customer2Token: string;
  let verifiedRiderToken: string;
  let unverifiedRiderToken: string;
  let suspendedRiderToken: string;
  let rider2Token: string;
  let pickupOperatorToken: string;
  let warehouseStaffToken: string;
  let adminToken: string;

  let testProductId: string;
  let testOrderId: string;
  let testTaskId: string;
  let testStationId: string;

  beforeAll(async () => {
    // Clean up test users, products, stations, tasks
    await db.updateDb(d => {
      d.users = (d.users || []).filter(u => !u.email.includes('phase9d-'));
      d.products = (d.products || []).filter(p => p.id !== 'prod-9d-1');
      d.pickupStations = (d.pickupStations || []).filter(s => s.id !== 'ps-9d-test');
    });

    // 1. Register Customer 1
    const custRes = await request(app).post('/api/auth/register').send({
      email: 'phase9d-cust@example.com',
      password: 'Password123!',
      name: 'Phase 9D Customer',
      firstName: 'Phase',
      lastName: 'Customer',
      birthDate: '1995-01-01',
      phone: '+255711111111',
      termsAccepted: true,
      role: 'CUSTOMER'
    });
    customerToken = custRes.body.token;

    // 2. Register Customer 2
    const cust2Res = await request(app).post('/api/auth/register').send({
      email: 'phase9d-cust2@example.com',
      password: 'Password123!',
      name: 'Phase 9D Customer 2',
      firstName: 'Phase',
      lastName: 'Customer2',
      birthDate: '1995-01-01',
      phone: '+255711111112',
      termsAccepted: true,
      role: 'CUSTOMER'
    });
    customer2Token = cust2Res.body.token;

    // 3. Register Verified Rider
    const vRiderRes = await request(app).post('/api/auth/register').send({
      email: 'phase9d-vrider@example.com',
      password: 'Password123!',
      name: 'Verified Rider',
      firstName: 'Verified',
      lastName: 'Rider',
      birthDate: '1990-01-01',
      phone: '+255722222222',
      termsAccepted: true,
      role: 'DELIVERY_AGENT'
    });
    verifiedRiderToken = vRiderRes.body.token;
    await db.updateDb(d => {
      const u = d.users.find(x => x.email === 'phase9d-vrider@example.com');
      if (u) {
        u.verificationStatus = 'VERIFIED';
        u.isVerified = true;
      }
    });

    // 4. Register Unverified Rider
    const uvRiderRes = await request(app).post('/api/auth/register').send({
      email: 'phase9d-uvrider@example.com',
      password: 'Password123!',
      name: 'Unverified Rider',
      firstName: 'Unverified',
      lastName: 'Rider',
      birthDate: '1990-01-01',
      phone: '+255733333333',
      termsAccepted: true,
      role: 'DELIVERY_AGENT'
    });
    unverifiedRiderToken = uvRiderRes.body.token;
    await db.updateDb(d => {
      const u = d.users.find(x => x.email === 'phase9d-uvrider@example.com');
      if (u) u.verificationStatus = 'PENDING';
    });

    // 5. Register Suspended Rider
    const suspRiderRes = await request(app).post('/api/auth/register').send({
      email: 'phase9d-susprider@example.com',
      password: 'Password123!',
      name: 'Suspended Rider',
      firstName: 'Suspended',
      lastName: 'Rider',
      birthDate: '1990-01-01',
      phone: '+255744444444',
      termsAccepted: true,
      role: 'DELIVERY_AGENT'
    });
    suspendedRiderToken = suspRiderRes.body.token;
    await db.updateDb(d => {
      const u = d.users.find(x => x.email === 'phase9d-susprider@example.com');
      if (u) {
        u.verificationStatus = 'REJECTED';
        u.isActive = false;
        u.status = 'SUSPENDED';
      }
    });

    // 6. Register Rider 2
    const rider2Res = await request(app).post('/api/auth/register').send({
      email: 'phase9d-rider2@example.com',
      password: 'Password123!',
      name: 'Rider Two',
      firstName: 'Rider',
      lastName: 'Two',
      birthDate: '1990-01-01',
      phone: '+255755555555',
      termsAccepted: true,
      role: 'DELIVERY_AGENT'
    });
    rider2Token = rider2Res.body.token;
    await db.updateDb(d => {
      const u = d.users.find(x => x.email === 'phase9d-rider2@example.com');
      if (u) {
        u.verificationStatus = 'VERIFIED';
        u.isVerified = true;
      }
    });

    // 7. Provision Warehouse Staff directly in DB
    const whStaffUserId = 'usr-wh-9d-test';
    await db.updateDb(d => {
      d.users.push({
        id: whStaffUserId,
        name: 'Warehouse Staff',
        email: 'phase9d-whstaff@example.com',
        role: 'WAREHOUSE_STAFF',
        status: 'ACTIVE',
        isActive: true,
        isVerified: true,
        verificationStatus: 'VERIFIED',
        warehouseId: 'wh-dar-central',
        createdAt: new Date().toISOString()
      } as any);
    });
    const whSession = db.createSession(whStaffUserId, 'WAREHOUSE_STAFF');
    warehouseStaffToken = whSession.token;

    // 8. Login Admin
    const adminRes = await request(app).post('/api/auth/login').send({
      email: 'admin@lumo.africa',
      password: 'LumoPass2026!'
    });
    adminToken = adminRes.body.token;

    // Add test product
    await db.updateDb(d => {
      d.products.push({
        id: 'prod-9d-1',
        name: 'Phase 9D Smart TV',
        brand: 'Lumo Tech',
        category: 'Electronics',
        sellerId: 'sel-v1',
        sellerName: 'Verified Seller Shop',
        price: 120000,
        stock: 25,
        thumbnail: 'https://example.com/tv.jpg',
        images: [],
        description: 'Test product for Phase 9D logistics',
        rating: 4.9,
        reviewCount: 10,
        condition: 'Brand New',
        warranty: '2 Years',
        freeDeliveryEligible: true,
        weightKg: 5.0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as any);

      // Add pickup stations for testing regions
      d.pickupStations.unshift({
        id: 'ps-9d-test',
        name: 'Kinondoni Lumo Station',
        region: 'Dar es Salaam',
        district: 'Kinondoni',
        area: 'Mwenge',
        streetAddress: 'Ali Hassan Mwinyi Rd',
        contactName: 'Manager A',
        contactPhone: '+255700111222',
        operatingHours: '08:00 - 20:00',
        capacityPackages: 300,
        currentPackages: 10,
        status: 'ACTIVE',
        fee: 0,
        createdAt: new Date().toISOString(),
        approvedAt: new Date().toISOString()
      });

      d.pickupStations.unshift({
        id: 'ps-arusha-1',
        name: 'Arusha Clock Tower Lumo Point',
        region: 'Arusha',
        district: 'Arusha City',
        area: 'Clock Tower',
        streetAddress: 'Goliondoi St',
        contactName: 'Manager B',
        contactPhone: '+255700333444',
        operatingHours: '08:00 - 18:00',
        capacityPackages: 200,
        currentPackages: 5,
        status: 'ACTIVE',
        fee: 1000,
        createdAt: new Date().toISOString(),
        approvedAt: new Date().toISOString()
      });
    });
  });

  it('1. Customer Door Delivery fee calculation & free-delivery threshold enforcement', async () => {
    const calcRes = await request(app)
      .post('/api/delivery/calculate-fee')
      .send({
        region: 'Dar es Salaam',
        subtotal: 120000,
        deliveryType: 'standard'
      });

    expect(calcRes.status).toBe(200);
    expect(calcRes.body.isFreeDelivery).toBe(true);
    expect(calcRes.body.fee).toBe(0);

    const calcArusha = await request(app)
      .post('/api/delivery/calculate-fee')
      .send({
        region: 'Arusha',
        subtotal: 50000,
        deliveryType: 'standard'
      });

    expect(calcArusha.status).toBe(200);
    expect(calcArusha.body.isFreeDelivery).toBe(false);
    expect(calcArusha.body.fee).toBeGreaterThan(0);
  });

  it('2. Pickup station region filtering (Dar es Salaam vs Arusha)', async () => {
    const darRes = await request(app).get('/api/pickup/stations?region=Dar%20es%20Salaam');
    expect(darRes.status).toBe(200);
    const darStations = darRes.body.stations;
    expect(darStations.some((s: any) => s.region === 'Dar es Salaam')).toBe(true);
    expect(darStations.some((s: any) => s.region === 'Arusha')).toBe(false);

    const arushaRes = await request(app).get('/api/pickup/stations?region=Arusha');
    expect(arushaRes.status).toBe(200);
    const arushaStations = arushaRes.body.stations;
    expect(arushaStations.some((s: any) => s.region === 'Arusha')).toBe(true);
    expect(arushaStations.some((s: any) => s.region === 'Dar es Salaam')).toBe(false);
  });

  it('3. New approved pickup station automatically appears in correct region', async () => {
    const createRes = await request(app)
      .post('/api/pickup/stations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Mwanza Rock City Lumo Point',
        region: 'Mwanza',
        district: 'Nyamagana',
        area: 'City Center',
        streetAddress: 'Kenyatta Rd',
        contactPhone: '+255788999000'
      });

    expect(createRes.status).toBe(201);
    const newId = createRes.body.station.id;

    const mwanzaRes = await request(app).get('/api/pickup/stations?region=Mwanza');
    expect(mwanzaRes.status).toBe(200);
    expect(mwanzaRes.body.stations.some((s: any) => s.id === newId)).toBe(true);
  });

  it('4. Unverified rider attempts to accept delivery -> 403', async () => {
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ productId: 'prod-9d-1', quantity: 1 }],
        deliveryAddress: { streetAddress: '123 St', region: 'Dar es Salaam' },
        paymentMethod: { type: 'mobile_money', name: 'M-Pesa' }
      });

    expect(orderRes.status).toBe(201);
    testOrderId = orderRes.body.order.id;

    const task = db.getDb().deliveryTasks.find(t => t.orderId === testOrderId);
    if (task) testTaskId = task.id;

    const acceptRes = await request(app)
      .post('/api/delivery/accept-task')
      .set('Authorization', `Bearer ${unverifiedRiderToken}`)
      .send({ taskId: testTaskId });

    expect(acceptRes.status).toBe(403);
  });

  it('5. Suspended rider attempts delivery operation -> 401/403', async () => {
    const suspRes = await request(app)
      .post('/api/delivery/accept-task')
      .set('Authorization', `Bearer ${suspendedRiderToken}`)
      .send({ taskId: testTaskId });

    expect([401, 403]).toContain(suspRes.status);
  });

  it('6. Verified rider accepts delivery successfully', async () => {
    const acceptRes = await request(app)
      .post('/api/delivery/accept-task')
      .set('Authorization', `Bearer ${verifiedRiderToken}`)
      .send({ taskId: testTaskId });

    expect(acceptRes.status).toBe(200);
    expect(acceptRes.body.success).toBe(true);
    expect(acceptRes.body.task.riderId).toBeDefined();
  });

  it('7. Second rider attempts same delivery task -> rejected (concurrency protection)', async () => {
    const acceptRes2 = await request(app)
      .post('/api/delivery/accept-task')
      .set('Authorization', `Bearer ${rider2Token}`)
      .send({ taskId: testTaskId });

    expect([409, 400, 403]).toContain(acceptRes2.status);
  });

  it('8. Rider marks delivered without OTP verification -> rejected', async () => {
    const updateRes = await request(app)
      .post('/api/delivery/update-task-status')
      .set('Authorization', `Bearer ${verifiedRiderToken}`)
      .send({ taskId: testTaskId, status: 'DELIVERED' });

    expect(updateRes.status).toBe(400);
    expect(updateRes.body.error).toMatch(/OTP/i);
  });

  it('9. Invalid order status transition -> backend rejects', async () => {
    const transitionRes = await request(app)
      .patch(`/api/orders/${testOrderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Processing', note: 'Invalid reset' });

    expect([400, 403]).toContain(transitionRes.status);
  });

  it('10. Warehouse tasks access check for authorized warehouse staff', async () => {
    const whTasksRes = await request(app)
      .get('/api/warehouses/tasks')
      .set('Authorization', `Bearer ${warehouseStaffToken}`);

    expect(whTasksRes.status).toBe(200);
  });
});

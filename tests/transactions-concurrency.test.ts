import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../server/app.js';
import { db } from '../server/db.js';

const app = createApp();

describe('Phase 9C: Transaction Integrity, Concurrency, and Payment Hardening', () => {
  let customerToken: string;
  let adminToken: string;
  let testProductId: string;

  beforeAll(async () => {
    // Reset or prepare test users and product
    await db.updateDb(d => {
      d.users = (d.users || []).filter(u => u.email !== 'phase9c-cust@example.com' && u.email !== 'phase9c-admin@example.com');
      d.products = (d.products || []).filter(p => p.id !== 'prod-9c-1');
      d.inventory = (d.inventory || []).filter(i => i.productId !== 'prod-9c-1');
    });

    // Register customer
    const custRes = await request(app).post('/api/auth/register').send({
      email: 'phase9c-cust@example.com',
      password: 'Password123!',
      name: 'Phase 9C Customer',
      firstName: 'Phase',
      lastName: 'Customer',
      birthDate: '1995-01-01',
      phone: '+255799999999',
      termsAccepted: true,
      role: 'CUSTOMER'
    });
    customerToken = custRes.body.token;

    // Login as admin
    const adminRes = await request(app).post('/api/auth/login').send({
      email: 'admin@lumo.africa',
      password: 'LumoPass2026!'
    });
    adminToken = adminRes.body.token;

    // Add a test product with stock = 10 and price = 50000
    await db.updateDb(d => {
      d.products.push({
        id: 'prod-9c-1',
        name: 'Phase 9C Test Widget',
        brand: 'Lumo Test',
        category: 'Electronics',
        sellerId: 'sel-v1',
        sellerName: 'Verified Seller Shop',
        price: 50000,
        stock: 10,
        thumbnail: 'https://example.com/img.jpg',
        images: [],
        description: 'Test product for Phase 9C',
        rating: 5,
        reviewCount: 0,
        condition: 'Brand New',
        warranty: '1 Year',
        freeDeliveryEligible: true,
        weightKg: 1.0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as any);
    });
  });

  it('1. Server-side price calculation: ignores client-supplied fake pricing', async () => {
    const checkoutRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [
          {
            productId: 'prod-9c-1',
            productName: 'Phase 9C Test Widget',
            price: 10, // Client tries to spoof price to 10 TZS instead of 50000 TZS
            quantity: 1,
            sellerId: 'sel-v1',
            sellerName: 'Verified Seller Shop',
            thumbnail: 'https://example.com/img.jpg'
          }
        ],
        deliveryAddress: {
          streetAddress: '123 Test St',
          city: 'Dar es Salaam',
          region: 'Dar es Salaam',
          area: 'Kinondoni'
        },
        paymentMethod: {
          type: 'mobile_money',
          name: 'M-Pesa'
        },
        pricing: {
          subtotal: 10,
          total: 10
        }
      });

    expect(checkoutRes.status).toBe(201);
    const order = checkoutRes.body.order;
    // Server authoritative subtotal must be 50000, not 10
    expect(order.pricing.subtotal).toBe(50000);
    expect(order.pricing.total).toBeGreaterThanOrEqual(50000);
  });

  it('2. Overselling prevention: rejects orders requesting more stock than available', async () => {
    const checkoutRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [
          {
            productId: 'prod-9c-1',
            productName: 'Phase 9C Test Widget',
            price: 50000,
            quantity: 100, // Requesting 100 units when stock is only 2 (or remaining)
            sellerId: 'sel-v1',
            sellerName: 'Verified Seller Shop',
            thumbnail: 'https://example.com/img.jpg'
          }
        ],
        deliveryAddress: {
          streetAddress: '123 Test St',
          city: 'Dar es Salaam',
          region: 'Dar es Salaam',
          area: 'Kinondoni'
        },
        paymentMethod: {
          type: 'mobile_money',
          name: 'M-Pesa'
        },
        pricing: {
          subtotal: 5000000,
          total: 5000000
        }
      });

    expect(checkoutRes.status).toBe(400);
    expect(checkoutRes.body.error).toMatch(/insufficient stock|stock/i);
  });

  it('3. Order state machine enforcement: rejects invalid status transitions', async () => {
    // Create an order first via checkout
    const checkoutRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [
          {
            productId: 'prod-9c-1',
            productName: 'Phase 9C Test Widget',
            price: 50000,
            quantity: 1,
            sellerId: 'sel-v1',
            sellerName: 'Verified Seller Shop',
            thumbnail: 'https://example.com/img.jpg'
          }
        ],
        deliveryAddress: {
          streetAddress: '123 Test St',
          city: 'Dar es Salaam',
          region: 'Dar es Salaam',
          area: 'Kinondoni'
        },
        paymentMethod: {
          type: 'mobile_money',
          name: 'M-Pesa'
        },
        pricing: {
          subtotal: 50000,
          total: 50000
        }
      });

    expect(checkoutRes.status).toBe(201);
    const orderId = checkoutRes.body.order.id;

    // Try to transition directly from Processing to Delivered without intermediate steps or via invalid path
    const patchRes = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Returned' });

    expect(patchRes.status).toBe(400);
    expect(patchRes.body.error).toMatch(/invalid status transition|transition/i);
  });
});

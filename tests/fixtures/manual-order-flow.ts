import request from 'supertest';
import { createApp } from '../../server/app.js';
const app = createApp();

async function run() {
  const adminRes = await request(app).post('/api/auth/login').send({ email: 'admin@lumo.africa', password: 'LumoPass2026!' });
  const adminToken = adminRes.body.token;

  const sA = await request(app).post('/api/auth/register').send({
    firstName: 'T', lastName: 'U', name: `S A`, birthDate: '1990-01-01', email: 'sA@test.com', phone: '+255 700 000 001', password: 'Password123!', role: 'SELLER', businessName: 'Store A', termsAccepted: true
  });
  await request(app).post(`/api/admin/users/${sA.body.user.id}/verification-status`).set('Authorization', `Bearer ${adminToken}`).send({ verificationStatus: 'VERIFIED', isVerified: true, isActive: true });
  const loginA = await request(app).post('/api/auth/login').send({ email: 'sA@test.com', password: 'Password123!' });
  const pA = await request(app).post('/api/products').set('Authorization', `Bearer ${loginA.body.token}`).send({
    title: 'Product A', description: 'Desc', price: 10000, stockQuantity: 10, categoryId: 'cat-1', sellerId: loginA.body.user.sellerId
  });
  
  const cA = await request(app).post('/api/auth/register').send({
    firstName: 'T', lastName: 'U', name: `C A`, birthDate: '1990-01-01', email: 'cA@test.com', phone: '+255 700 000 002', password: 'Password123!', role: 'CUSTOMER', termsAccepted: true
  });
  const oA = await request(app).post('/api/orders').set('Authorization', `Bearer ${cA.body.token}`).send({
    items: [{ productId: pA.body.product.id, quantity: 1, price: 10000, sellerId: loginA.body.user.sellerId }],
    deliveryMethod: 'DOOR_DELIVERY',
    shippingAddress: { fullName: 'A', phone: '1', region: 'R', city: 'C', area: 'A', addressLine: 'L' }
  });
  console.log('Order create:', oA.status, Object.keys(oA.body));
  if (oA.body.order) console.log(oA.body.order.id);
}
run();

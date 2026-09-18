import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../server/app.js';
import crypto from 'node:crypto';

const app = createApp();

describe('Authentication Edge Cases (Phase 9A - Problem 5) - check-account', () => {
  let customer: any;

  beforeAll(async () => {
    const email = `check-test-${crypto.randomInt(100000, 999999)}@example.com`;
    const res = await request(app).post('/api/auth/register').send({
      firstName: 'Check', lastName: 'Account', name: 'Check Account',
      email, phone: '+255 700 ' + crypto.randomInt(100000, 999999), password: 'Password123!',
      role: 'CUSTOMER', termsAccepted: true, birthDate: '1990-01-01'
    });
    
    if (res.status !== 200) throw new Error(JSON.stringify(res.body));
    
    customer = res.body.user;
  });

  it('Existing email returns exists: true with NO extra data', async () => {
    const res = await request(app).post('/api/auth/check-account').send({
      identifier: customer.email
    });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ exists: true });
    expect(res.body.name).toBeUndefined();
    expect(res.body.role).toBeUndefined();
    expect(res.body.avatar).toBeUndefined();
    expect(res.body.id).toBeUndefined();
    expect(res.body.password).toBeUndefined();
  });

  it('Non-existing email returns exists: false with NO extra data', async () => {
    const res = await request(app).post('/api/auth/check-account').send({
      identifier: 'does-not-exist@example.com'
    });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ exists: false });
    expect(res.body.name).toBeUndefined();
    expect(res.body.role).toBeUndefined();
  });

  it('Calling check-account does not create an authenticated session', async () => {
    const res = await request(app).post('/api/auth/check-account').send({
      identifier: customer.email
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeUndefined(); // No token returned
    expect(res.header['set-cookie']).toBeUndefined(); // No session cookie
  });
});

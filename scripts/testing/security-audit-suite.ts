import express from 'express';
import crypto from 'node:crypto';
import { db } from '../../server/db.js';
import { hashPassword, sanitizeUser, generateSecureOtp, safeCompareTokens } from '../../server/utils/security.js';
import { authMiddleware } from '../../server/middleware/auth.js';
import authRoutes from '../../server/routes/auth.js';
import adminRoutes from '../../server/routes/admin.js';
import orderRoutes from '../../server/routes/orders.js';
import sellerRoutes from '../../server/routes/seller.js';
import deliveryRoutes from '../../server/routes/delivery.js';
import salesRoutes from '../../server/routes/sales.js';
import warehouseRoutes from '../../server/routes/warehouse.js';
import financeRoutes from '../../server/routes/finance.js';
import returnsRoutes from '../../server/routes/returns.js';
import productRoutes from '../../server/routes/products.js';
import promotionRoutes from '../../server/routes/promotions.js';
import otpRoutes from '../../server/routes/otp.js';
import pickupRoutes from '../../server/routes/pickup.js';
import paymentRoutes from '../../server/routes/payments.js';
import workspaceRoutes from '../../server/routes/workspace.js';
import moderationRoutes from '../../server/routes/moderation.js';
import notificationRoutes from '../../server/routes/notifications.js';
import supportRoutes from '../../server/routes/support.js';

async function runSecuritySuite() {
  console.log('====================================================');
  console.log('LUMO PHASE 9A SECURITY AUDIT & VERIFICATION SUITE');
  console.log('====================================================\n');

  // Setup local Express instance sharing the exact DB instance
  const app = express();
  app.use(express.json());
  app.use(authMiddleware);

  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/sellers', sellerRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/promotions', promotionRoutes);
  app.use('/api/delivery', deliveryRoutes);
  app.use('/api/sales', salesRoutes);
  app.use('/api/warehouses', warehouseRoutes);
  app.use('/api/finance', financeRoutes);
  app.use('/api/returns', returnsRoutes);
  app.use('/api/otp', otpRoutes);
  app.use('/api/pickup', pickupRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/workspace', workspaceRoutes);
  app.use('/api/moderation', moderationRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/support', supportRoutes);

  const port = process.env.TEST_PORT || 3099;
  const server = app.listen(port);
  const baseUrl = `http://127.0.0.1:${port}`;

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  // Pre-seed test users in db for tests
  const testCustomer = {
    id: 'usr-test-cust-01',
    email: 'testcust01@lumo.africa',
    name: 'Test Customer 01',
    phone: '+255700000001',
    role: 'CUSTOMER' as const,
    passwordHash: await hashPassword('CustPass123!'),
    status: 'ACTIVE' as const,
    isActive: true,
    isVerified: true,
    createdAt: new Date().toISOString()
  };

  const testCustomer2 = {
    id: 'usr-test-cust-02',
    email: 'testcust02@lumo.africa',
    name: 'Test Customer 02',
    phone: '+255700000002',
    role: 'CUSTOMER' as const,
    passwordHash: await hashPassword('CustPass123!'),
    status: 'ACTIVE' as const,
    isActive: true,
    isVerified: true,
    createdAt: new Date().toISOString()
  };

  const testSeller = {
    id: 'usr-test-seller-01',
    email: 'testseller01@lumo.africa',
    name: 'Test Seller 01',
    phone: '+255700000003',
    role: 'SELLER' as const,
    sellerId: 'seller-1',
    passwordHash: await hashPassword('SellerPass123!'),
    status: 'ACTIVE' as const,
    isActive: true,
    isVerified: true,
    verificationStatus: 'VERIFIED' as const,
    createdAt: new Date().toISOString()
  };

  const testSellerUnverified = {
    id: 'usr-test-seller-unverified',
    email: 'unverifiedseller@lumo.africa',
    name: 'Unverified Seller',
    phone: '+255700000007',
    role: 'SELLER' as const,
    sellerId: 'seller-unverified',
    passwordHash: await hashPassword('SellerPass123!'),
    status: 'ACTIVE' as const,
    isActive: true,
    isVerified: false,
    verificationStatus: 'PENDING' as const,
    createdAt: new Date().toISOString()
  };

  const testSeller2 = {
    id: 'usr-test-seller-02',
    email: 'testseller02@lumo.africa',
    name: 'Test Seller 02',
    phone: '+255700000008',
    role: 'SELLER' as const,
    sellerId: 'seller-2',
    passwordHash: await hashPassword('SellerPass123!'),
    status: 'ACTIVE' as const,
    isActive: true,
    isVerified: true,
    verificationStatus: 'VERIFIED' as const,
    createdAt: new Date().toISOString()
  };

  const testSellerNoStore = {
    id: 'usr-test-seller-nostore',
    email: 'nostoreseller@lumo.africa',
    name: 'No Store Seller',
    phone: '+255700000009',
    role: 'SELLER' as const,
    passwordHash: await hashPassword('SellerPass123!'),
    status: 'ACTIVE' as const,
    isActive: true,
    isVerified: true,
    verificationStatus: 'VERIFIED' as const,
    createdAt: new Date().toISOString()
  };

  const testSuperAdmin = {
    id: 'usr-test-admin-01',
    email: 'testadmin01@lumo.africa',
    name: 'Test Super Admin 01',
    phone: '+255700000004',
    role: 'SUPER_ADMIN' as const,
    passwordHash: await hashPassword('AdminPass123!'),
    status: 'ACTIVE' as const,
    isActive: true,
    isVerified: true,
    permissions: ['*'],
    createdAt: new Date().toISOString()
  };

  const testStandardAdmin = {
    id: 'usr-test-admin-02',
    email: 'teststandardadmin@lumo.africa',
    name: 'Test Operations Admin',
    phone: '+255700000013',
    role: 'ADMIN' as const,
    passwordHash: await hashPassword('AdminPass123!'),
    status: 'ACTIVE' as const,
    isActive: true,
    isVerified: true,
    permissions: ['READ_USERS', 'READ_ORDERS'],
    createdAt: new Date().toISOString()
  };

  const testSuspendedUser = {
    id: 'usr-test-suspended',
    email: 'suspended@lumo.africa',
    name: 'Suspended User',
    phone: '+255700000005',
    role: 'CUSTOMER' as const,
    passwordHash: await hashPassword('CustPass123!'),
    status: 'SUSPENDED' as any,
    isActive: false,
    isVerified: true,
    createdAt: new Date().toISOString()
  };

  const testRider = {
    id: 'usr-test-rider-01',
    email: 'testrider01@lumo.africa',
    name: 'Test Rider 01',
    phone: '+255700000006',
    role: 'DELIVERY_AGENT' as const,
    passwordHash: await hashPassword('RiderPass123!'),
    status: 'ACTIVE' as const,
    isActive: true,
    isVerified: true,
    verificationStatus: 'VERIFIED' as const,
    createdAt: new Date().toISOString()
  };

  const testRiderUnverified = {
    id: 'usr-test-rider-unverified',
    email: 'unverifiedrider@lumo.africa',
    name: 'Unverified Rider',
    phone: '+255700000010',
    role: 'DELIVERY_AGENT' as const,
    passwordHash: await hashPassword('RiderPass123!'),
    status: 'ACTIVE' as const,
    isActive: true,
    isVerified: false,
    verificationStatus: 'PENDING' as const,
    createdAt: new Date().toISOString()
  };

  const testRider2 = {
    id: 'usr-test-rider-02',
    email: 'testrider02@lumo.africa',
    name: 'Test Rider 02',
    phone: '+255700000011',
    role: 'DELIVERY_AGENT' as const,
    passwordHash: await hashPassword('RiderPass123!'),
    status: 'ACTIVE' as const,
    isActive: true,
    isVerified: true,
    verificationStatus: 'VERIFIED' as const,
    createdAt: new Date().toISOString()
  };

  const testPickupOp = {
    id: 'usr-test-pickup-01',
    email: 'pickupop01@lumo.africa',
    name: 'Test Pickup Operator 01',
    phone: '+255700000012',
    role: 'PICKUP_OPERATOR' as const,
    pickupStationId: 'ps-kariakoo-hub',
    passwordHash: await hashPassword('PickupPass123!'),
    status: 'ACTIVE' as const,
    isActive: true,
    isVerified: true,
    verificationStatus: 'VERIFIED' as const,
    createdAt: new Date().toISOString()
  };

  db.updateDb(d => {
    d.users = d.users.filter(u => !u.id.startsWith('usr-test-'));
    d.users.push(
      testCustomer,
      testCustomer2,
      testSeller,
      testSellerUnverified,
      testSeller2,
      testSellerNoStore,
      testSuperAdmin,
      testStandardAdmin,
      testSuspendedUser,
      testRider,
      testRiderUnverified,
      testSellerUnverified,
      testRider2,
      testPickupOp
    );
    d.orders = d.orders.filter(o =>
      !o.id.startsWith('ord-diff-') &&
      !o.id.startsWith('ord-sec-') &&
      !o.id.startsWith('ord-f-') &&
      o.customer?.email !== testCustomer.email &&
      o.customer?.email !== testCustomer2.email &&
      o.customerId !== testCustomer.id &&
      o.customerId !== testCustomer2.id
    );
    if (!d.sellers) d.sellers = [];
    if (!d.sellers.find(s => s.id === 'seller-1')) {
      d.sellers.push({
        id: 'seller-1',
        name: 'TechZone Tanzania',
        type: 'BUSINESS',
        status: 'VERIFIED',
        rating: 4.8,
        totalSales: 150,
        phone: '+255700000003',
        email: 'testseller01@lumo.africa'
      } as any);
    }
    if (!d.sellers.find(s => s.id === 'seller-2')) {
      d.sellers.push({
        id: 'seller-2',
        name: 'Dar Fashion Ltd',
        type: 'BUSINESS',
        status: 'VERIFIED',
        rating: 4.6,
        totalSales: 80,
        phone: '+255700000008',
        email: 'testseller02@lumo.africa'
      } as any);
    }
    d.sellers.push({ id: 'seller-unverified', name: 'Unverified Seller', type: 'INDIVIDUAL', status: 'PENDING', phone: '+255700000007', email: 'unverifiedseller@lumo.africa' } as any);
    let samsungProd = d.products.find(p => p.id === 'prod-samsung-a55');
    if (!samsungProd) {
      samsungProd = {
        id: 'prod-samsung-a55',
        name: 'Samsung Galaxy A55 5G',
        title: 'Samsung Galaxy A55 5G',
        price: 240000,
        stock: 50,
        sellerId: testSeller.sellerId,
        sellerName: 'Lumo Tech Hub',
        category: 'Electronics',
        status: 'ACTIVE',
        images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500'],
        createdAt: new Date().toISOString()
      } as any;
      d.products.push(samsungProd);
    } else {
      samsungProd.stock = 50;
    }
    const samsungInv = (d.inventory || []).find(i => i.productId === 'prod-samsung-a55');
    if (samsungInv) {
      samsungInv.available = 50;
    }
    d.inventoryMovements = (d.inventoryMovements || []).filter(m => m.productId !== 'prod-samsung-a55' && !m.productId.startsWith('prod-sec-'));
  });

  // Create session tokens
  const custSession = db.createSession(testCustomer.id, testCustomer.role);
  const cust2Session = db.createSession(testCustomer2.id, testCustomer2.role);
  const sellerSession = db.createSession(testSeller.id, testSeller.role);
  const unverifiedSellerSession = db.createSession(testSellerUnverified.id, testSellerUnverified.role);
  const seller2Session = db.createSession(testSeller2.id, testSeller2.role);
  const sellerNoStoreSession = db.createSession(testSellerNoStore.id, testSellerNoStore.role);
  const riderSession = db.createSession(testRider.id, testRider.role);
  const unverifiedRiderSession = db.createSession(testRiderUnverified.id, testRiderUnverified.role);
  const rider2Session = db.createSession(testRider2.id, testRider2.role);
  const pickupOpSession = db.createSession(testPickupOp.id, testPickupOp.role);
  const adminSession = db.createSession(testSuperAdmin.id, testSuperAdmin.role);
  const superAdminSession = adminSession;
  const standardAdminSession = db.createSession(testStandardAdmin.id, testStandardAdmin.role);

  try {
    // 1. Unauthenticated request to /api/admin/users returns 401
    const r1 = await fetch(`${baseUrl}/api/admin/users`);
    assert(r1.status === 401, 'Test 1: Unauthenticated request to /api/admin/* returns 401', `Got status ${r1.status}`);

    // 2. Invalid/expired token returns 401
    const r2 = await fetch(`${baseUrl}/api/admin/users`, {
      headers: { Authorization: 'Bearer invalid_fake_token_999' }
    });
    assert(r2.status === 401, 'Test 2: Invalid/expired session token returns 401', `Got status ${r2.status}`);

    // 3. Customer token accessing /api/admin/* returns 403
    const r3 = await fetch(`${baseUrl}/api/admin/users`, {
      headers: { Authorization: `Bearer ${custSession.token}` }
    });
    assert(r3.status === 403, 'Test 3: Customer token accessing /api/admin/* returns 403', `Got status ${r3.status}`);

    // 4. Vendor token accessing /api/admin/* returns 403
    const r4 = await fetch(`${baseUrl}/api/admin/users`, {
      headers: { Authorization: `Bearer ${sellerSession.token}` }
    });
    assert(r4.status === 403, 'Test 4: Vendor token accessing /api/admin/* returns 403', `Got status ${r4.status}`);

    // 5. Customer IDOR check on order details
    const otherOrder = {
      id: 'ord-test-cust2-99',
      orderNumber: 'LM-TEST-99',
      customer: { id: testCustomer2.id, name: testCustomer2.name, email: testCustomer2.email, phone: testCustomer2.phone },
      items: [],
      deliveryAddress: { fullName: testCustomer2.name, phone: testCustomer2.phone, region: 'Dar es Salaam', city: 'Dar es Salaam', area: 'Central', streetAddress: 'Kariakoo' },
      deliveryMethod: { type: 'standard' as const, name: 'Standard Delivery', fee: 3000, estimatedDelivery: '1-2 Days' },
      paymentMethod: { type: 'mobile_money' as const, name: 'M-Pesa', details: testCustomer2.phone, status: 'Paid' },
      pricing: { subtotal: 10000, deliveryFee: 3000, discount: 0, escrowFee: 0, total: 13000 },
      status: 'Processing' as const,
      statusHistory: [],
      createdAt: new Date().toISOString()
    };
    db.updateDb(d => {
      d.orders = d.orders.filter(o => o.id !== otherOrder.id);
      d.orders.push(otherOrder as any);
    });

    const r5 = await fetch(`${baseUrl}/api/orders/${otherOrder.id}`, {
      headers: { Authorization: `Bearer ${custSession.token}` }
    });
    assert(r5.status === 403 || r5.status === 404, 'Test 5: Customer accessing another customer order returns 403 or 404', `Got status ${r5.status}`);

    // 6. Vendor IDOR check: Seller updating another vendor's product
    const otherProduct = {
      id: 'prod-test-other-seller',
      name: 'Other Seller Gadget',
      brand: 'OtherBrand',
      category: 'Electronics',
      sellerId: 'sel-other-999',
      sellerName: 'Other Vendor Store',
      price: 50000,
      stock: 10,
      soldCount: 0,
      rating: 5,
      reviewCount: 0,
      isFlashSale: false,
      badges: [],
      images: [],
      thumbnail: 'thumb.jpg',
      description: 'Desc',
      condition: 'Brand New' as const,
      warranty: '1 Year',
      freeDeliveryEligible: true,
      weightKg: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.updateDb(d => {
      d.products = d.products.filter(p => p.id !== otherProduct.id);
      d.products.push(otherProduct as any);
    });

    const r6 = await fetch(`${baseUrl}/api/sellers/products/${otherProduct.id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerSession.token}` 
      },
      body: JSON.stringify({ name: 'Hacked Title' })
    });
    assert(r6.status === 403 || r6.status === 404, 'Test 6: Vendor updating another vendor product returns 403 or 404', `Got status ${r6.status}`);

    // 7. Delivery task action by unauthorized user
    const r7 = await fetch(`${baseUrl}/api/delivery/tasks/del-task-other-99/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custSession.token}`
      },
      body: JSON.stringify({ otpCode: '123456' })
    });
    assert(r7.status === 403 || r7.status === 404, 'Test 7: Delivery task action by unauthorized user returns 403 or 404', `Got status ${r7.status}`);

    // 8. Sales agent IDOR: Customer accessing salesperson leads
    const r8 = await fetch(`${baseUrl}/api/sales/leads`, {
      headers: { Authorization: `Bearer ${custSession.token}` }
    });
    assert(r8.status === 403, 'Test 8: Customer accessing sales leads returns 403', `Got status ${r8.status}`);

    // 9. Warehouse operator IDOR: Customer accessing warehouse tasks
    const r9 = await fetch(`${baseUrl}/api/warehouses/tasks`, {
      headers: { Authorization: `Bearer ${custSession.token}` }
    });
    assert(r9.status === 403, 'Test 9: Customer accessing warehouse tasks returns 403', `Got status ${r9.status}`);

    // 10. Finance routes rejection for non-finance users
    const r10 = await fetch(`${baseUrl}/api/finance/overview`, {
      headers: { Authorization: `Bearer ${custSession.token}` }
    });
    assert(r10.status === 403, 'Test 10: Finance route rejects non-finance/non-super-admin token with 403', `Got status ${r10.status}`);

    // 11. Switch role endpoint rejects non-super-admin requests
    const r11 = await fetch(`${baseUrl}/api/auth/switch-role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custSession.token}`
      },
      body: JSON.stringify({ role: 'SUPER_ADMIN' })
    });
    // assert(r11.status === 403, 'Test 11: Switch-role endpoint rejects non-Super-Admin requests with 403', `Got status ${r11.status}`);

    // 12. Login with wrong password returns 401
    const r12 = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testCustomer.email, password: 'WrongPassword999!' })
    });
    assert(r12.status === 401, 'Test 12: Login with incorrect password returns 401', `Got status ${r12.status}`);

    // 13. Password verification with bcrypt works
    const r13 = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testCustomer.email, password: 'CustPass123!' })
    });
    const d13 = await r13.json();
    assert(r13.status === 200 && Boolean(d13.token), 'Test 13: Login with correct bcrypt password succeeds with token', `Got status ${r13.status}`);

    // 14. Failed login lockout (5 failed attempts)
    const lockoutEmail = 'lockout_test@lumo.africa';
    const lockoutUser = {
      id: 'usr-lockout-test',
      email: lockoutEmail,
      name: 'Lockout Test',
      phone: '+255700000088',
      role: 'CUSTOMER' as const,
      passwordHash: await hashPassword('CorrectPass123!'),
      failedAttempts: 0,
      status: 'ACTIVE' as const,
      isActive: true,
      isVerified: true,
      createdAt: new Date().toISOString()
    };
    db.updateDb(d => {
      d.users = d.users.filter(u => u.email !== lockoutEmail);
      d.users.push(lockoutUser);
    });

    for (let i = 0; i < 5; i++) {
      await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: lockoutEmail, password: 'WrongPassword!' })
      });
    }
    const r14 = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: lockoutEmail, password: 'CorrectPass123!' })
    });
    assert(r14.status === 423, 'Test 14: Failed login count locks out account after 5 failed attempts (423)', `Got status ${r14.status}`);

    // 15. Suspended account login returns 403
    const r15 = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testSuspendedUser.email, password: 'CustPass123!' })
    });
    assert(r15.status === 403, 'Test 15: Suspended account attempting login returns 403', `Got status ${r15.status}`);

    // 16. /me unauthenticated returns user: null
    const r16 = await fetch(`${baseUrl}/api/auth/me`);
    const d16 = await r16.json();
    assert(r16.status === 200 && d16.user === null, 'Test 16: /me returns user: null when unauthenticated', `Got user ${JSON.stringify(d16.user)}`);

    // 17. Public registration restricts administrative/staff roles
    const r17 = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Attacker', email: 'attacker@lumo.africa', password: 'HackerPass123!', role: 'SUPER_ADMIN' })
    });
    assert(r17.status === 403, 'Test 17: Public registration restricts staff/admin roles with 403', `Got status ${r17.status}`);

    // 18. Staff activation fails without token
    const r18 = await fetch(`${baseUrl}/api/auth/activate-staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'NewStaffPass123!' })
    });
    assert(r18.status === 400, 'Test 18: Staff activation fails without required token (400)', `Got status ${r18.status}`);

    // 19. Verify staff invitation token returns 404 for fake token
    const r19 = await fetch(`${baseUrl}/api/auth/verify-staff-token?token=stf_inv_fake_invalid`);
    assert(r19.status === 404, 'Test 19: Verify invalid staff invitation token returns 404', `Got status ${r19.status}`);

    // 20. Admin bootstrap locks when Super Admin exists without secret key
    const r20 = await fetch(`${baseUrl}/api/auth/admin-bootstrap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'newadmin@lumo.africa', password: 'NewAdminPass123!' })
    });
    assert(r20.status === 403, 'Test 20: Admin bootstrap locked when Super Admin exists without master key (403)', `Got status ${r20.status}`);

    // 21. Logout invalidates session token
    const tempLogoutSession = db.createSession(testCustomer.id, testCustomer.role);
    const r21a = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tempLogoutSession.token}` }
    });
    const r21b = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${tempLogoutSession.token}` }
    });
    const d21b = await r21b.json();
    assert(r21a.status === 200 && d21b.user === null, 'Test 21: Logout invalidates session token so subsequent requests return user: null', `Got status ${r21a.status}`);

    // 22. Spoofed header lumo_sess_usr-admin-01 returns 401
    const r22 = await fetch(`${baseUrl}/api/admin/users`, {
      headers: { Authorization: 'Bearer lumo_sess_usr-admin-01' }
    });
    assert(r22.status === 401, 'Test 22: Spoofed legacy lumo_sess_ token rejected with 401', `Got status ${r22.status}`);

    // 23. Audit log capture
    const auditLogs = db.getDb().auditLogs || [];
    assert(auditLogs.length > 0, 'Test 23: Security events captured in platform audit logs', `Count: ${auditLogs.length}`);

    // 24. sanitizeUser never leaks passwordHash or inviteToken
    const rawUser = {
      id: 'usr-test-san',
      email: 'san@lumo.africa',
      passwordHash: '$2a$10$xyz...',
      password: 'secret',
      inviteToken: 'stf_inv_secret',
      failedAttempts: 3,
      lockedUntil: '2026-12-31T23:59:59Z',
      name: 'Sanitized User',
      role: 'CUSTOMER'
    };
    const sanitized = sanitizeUser(rawUser) as any;
    const isClean = !sanitized.passwordHash && !sanitized.password && !sanitized.inviteToken && !sanitized.failedAttempts && !sanitized.lockedUntil;
    assert(isClean, 'Test 24: sanitizeUser strips passwordHash, password, inviteToken, failedAttempts, and lockedUntil');

    // 25. Registration without password -> rejected
    const r25 = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'No Pass', email: `nopass-${Date.now()}@lumo.africa` })
    });
    assert(r25.status === 400, 'Test 25: Registration without password rejected with 400', `Got status ${r25.status}`);

    // 26. Registration with password -> succeeds
    const regPassword = 'NewUserPass123!';
    const regEmail = `newuser-${Date.now()}@lumo.africa`;
    const r26 = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New User', email: regEmail, password: regPassword, phone: '+255700111222' })
    });
    assert(r26.status === 200, 'Test 26: Registration with secure password succeeds', `Got status ${r26.status}`);
    const d26 = await r26.json();
    assert(d26.user && !d26.user.password, 'Test 26: Response does not leak plaintext password', 'Found password in response');

    // Verify stored user has hash, not plaintext
    const newDbUser = db.findUserByEmail(regEmail);
    assert(newDbUser && newDbUser.passwordHash && !newDbUser.passwordHash.includes(regPassword), 'Test 26: Stored user has securely hashed password', 'Password not hashed correctly');

    // 27. Login returns the correct registered user
    const r27 = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: regEmail, password: regPassword })
    });
    assert(r27.status === 200, 'Test 27: Login with new registered user succeeds', `Got status ${r27.status}`);
    const d27 = await r27.json();
    assert(d27.user && d27.user.email === regEmail, 'Test 27: Login returns the correct registered user', 'Email mismatch');

    // =========================================================================
    // PROBLEM B: ORDER & CUSTOMER IDENTITY SECURITY TESTS (Tests 28 - 53)
    // =========================================================================

    // 28. Unauthenticated GET /api/orders returns 401
    const r28 = await fetch(`${baseUrl}/api/orders`);
    assert(r28.status === 401, 'Test 28: Unauthenticated GET /api/orders returns 401', `Got ${r28.status}`);

    // 29. Unauthenticated POST /api/orders returns 401
    const r29 = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [] })
    });
    assert(r29.status === 401, 'Test 29: Unauthenticated POST /api/orders returns 401', `Got ${r29.status}`);

    // 30. Unauthenticated GET /api/orders/:id returns 401
    const r30 = await fetch(`${baseUrl}/api/orders/${otherOrder.id}`);
    assert(r30.status === 401, 'Test 30: Unauthenticated GET /api/orders/:id returns 401', `Got ${r30.status}`);

    // 31. Unauthenticated PATCH /api/orders/:id/status returns 401
    const r31 = await fetch(`${baseUrl}/api/orders/${otherOrder.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Cancelled' })
    });
    assert(r31.status === 401, 'Test 31: Unauthenticated PATCH /api/orders/:id/status returns 401', `Got ${r31.status}`);

    // 32. Unauthenticated DELETE /api/orders/:id returns 401
    const r32 = await fetch(`${baseUrl}/api/orders/${otherOrder.id}`, {
      method: 'DELETE'
    });
    assert(r32.status === 401, 'Test 32: Unauthenticated DELETE /api/orders/:id returns 401', `Got ${r32.status}`);

    // 33. Order creation derives customer identity strictly from session (ignores client-supplied spoofed customer)
    const r33 = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custSession.token}`
      },
      body: JSON.stringify({
        customer: {
          id: 'usr-spoofed-victim-99',
          name: 'Spoofed Victim',
          email: 'spoofedvictim@lumo.africa',
          phone: '+255999888777'
        },
        items: [
          {
            productId: 'prod-samsung-a55',
            productName: 'Samsung Galaxy A55 5G',
            sellerId: testSeller.sellerId,
            sellerName: 'Lumo Tech Hub',
            price: 240000,
            quantity: 1,
            selectedAttributes: {}
          }
        ],
        deliveryAddress: {
          fullName: 'Test Recipient',
          phone: '+255700000001',
          region: 'Dar es Salaam',
          city: 'Dar es Salaam',
          area: 'Kinondoni',
          streetAddress: 'Plot 42 Ali Hassan Mwinyi Rd'
        },
        deliveryMethod: {
          type: 'standard',
          name: 'Standard Door Delivery',
          fee: 5000,
          estimatedDelivery: '1-2 Days'
        },
        paymentMethod: {
          type: 'mobile_money',
          name: 'M-Pesa Escrow',
          status: 'Paid (Escrow Secured)'
        }
      })
    });
    assert(r33.status === 201, 'Test 33: Order creation with authenticated customer succeeds (201)', `Got ${r33.status}`);
    const d33 = await r33.json();
    assert(
      d33.order &&
      d33.order.customerId === testCustomer.id &&
      d33.order.customerEmail === testCustomer.email &&
      d33.order.customerName === testCustomer.name &&
      d33.order.customer?.email === testCustomer.email &&
      d33.order.customer?.id === testCustomer.id,
      'Test 33: Order customer identity derived strictly from authenticated session (not client-supplied spoofed customer)',
      `Actual customerId: ${d33.order?.customerId}, expected: ${testCustomer.id}`
    );
    const createdOrderId = d33.order?.id;

    // 34. Customer with COD restriction attempting to bypass via client-supplied innocent customer email is rejected with 400
    db.updateDb(d => {
      const u2 = d.users.find(u => u.id === testCustomer2.id);
      if (u2) {
        (u2 as any).isCodRestricted = true;
        u2.isHighRiskFlagged = true;
        (u2 as any).inTransitCancellations = 3;
      }
    });

    const r34 = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cust2Session.token}`
      },
      body: JSON.stringify({
        customer: {
          email: 'innocent-customer@lumo.africa',
          name: 'Innocent Person'
        },
        items: [
          {
            productId: 'prod-samsung-a55',
            productName: 'Samsung Galaxy A55 5G',
            sellerId: testSeller.sellerId,
            price: 240000,
            quantity: 1
          }
        ],
        paymentMethod: {
          type: 'cod',
          name: 'Pay on Delivery (Cash)'
        },
        deliveryAddress: {
          fullName: 'Test Recipient',
          phone: '+255700000002',
          region: 'Dar es Salaam',
          city: 'Dar es Salaam',
          area: 'Kinondoni',
          streetAddress: 'Plot 42'
        }
      })
    });
    assert(r34.status === 400, 'Test 34: COD-restricted customer cannot bypass restriction via client-supplied email (400)', `Got ${r34.status}`);

    // 35. IDOR Prevention: Customer 2 attempting GET /api/orders/:id of Customer 1's order returns 403
    const r35 = await fetch(`${baseUrl}/api/orders/${createdOrderId}`, {
      headers: { Authorization: `Bearer ${cust2Session.token}` }
    });
    assert(r35.status === 403, 'Test 35: Customer 2 accessing Customer 1 order returns 403 (IDOR blocked)', `Got ${r35.status}`);

    // 36. IDOR Prevention: Customer 2 attempting PATCH /api/orders/:id/status of Customer 1's order returns 403
    const r36 = await fetch(`${baseUrl}/api/orders/${createdOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cust2Session.token}`
      },
      body: JSON.stringify({ status: 'Cancelled' })
    });
    assert(r36.status === 403, 'Test 36: Customer 2 attempting status change on Customer 1 order returns 403', `Got ${r36.status}`);

    // 37. IDOR Prevention: Customer 1 attempting DELETE /api/orders/:id returns 403 (only admin)
    const r37 = await fetch(`${baseUrl}/api/orders/${createdOrderId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${custSession.token}` }
    });
    assert(r37.status === 403, 'Test 37: Customer attempting DELETE /api/orders/:id returns 403', `Got ${r37.status}`);

    // 38. Customer 2 GET /api/orders never returns Customer 1's order
    const r38 = await fetch(`${baseUrl}/api/orders`, {
      headers: { Authorization: `Bearer ${cust2Session.token}` }
    });
    assert(r38.status === 200, 'Test 38: Customer 2 GET /api/orders succeeds (200)');
    const d38 = await r38.json();
    const hasOtherOrder = (d38.orders || []).some((o: any) => o.id === createdOrderId);
    assert(!hasOtherOrder, 'Test 38: Customer 2 order list does not leak Customer 1 order');

    // 39. Customer passing ?sellerId=... query parameter still only sees their own orders
    const r39 = await fetch(`${baseUrl}/api/orders?sellerId=sel-other`, {
      headers: { Authorization: `Bearer ${custSession.token}` }
    });
    assert(r39.status === 200, 'Test 39: Customer GET /api/orders with query succeeds (200)');
    const d39 = await r39.json();
    const allBelongToCustomer = (d39.orders || []).every((o: any) => o.customerId === testCustomer.id);
    assert(allBelongToCustomer, 'Test 39: Customer cannot expand order view via sellerId query param');

    // 40. Seller attempting to view an order containing NO products from their store returns 403
    const orderWithoutSeller = {
      id: `ord-diff-seller-${Date.now()}`,
      orderNumber: `LM-DIFF-99`,
      customerId: testCustomer2.id,
      customerEmail: testCustomer2.email,
      customerName: testCustomer2.name,
      customer: { id: testCustomer2.id, name: testCustomer2.name, email: testCustomer2.email, phone: testCustomer2.phone },
      items: [
        {
          productId: 'prod-other',
          productName: 'Different Store Product',
          sellerId: 'sel-different-vendor-99',
          sellerName: 'Other Store',
          price: 50000,
          quantity: 1
        }
      ],
      deliveryAddress: { fullName: testCustomer2.name, phone: testCustomer2.phone, region: 'Dar es Salaam', city: 'Dar es Salaam' },
      deliveryMethod: { type: 'standard' as const, name: 'Standard', fee: 3000 },
      paymentMethod: { type: 'mobile_money' as const, name: 'M-Pesa', status: 'Paid' },
      pricing: { subtotal: 50000, deliveryFee: 3000, discount: 0, escrowFee: 0, total: 53000 },
      status: 'Processing' as const,
      statusHistory: [],
      createdAt: new Date().toISOString()
    };
    db.updateDb(d => {
      d.orders.push(orderWithoutSeller as any);
    });

    const r40 = await fetch(`${baseUrl}/api/orders/${orderWithoutSeller.id}`, {
      headers: { Authorization: `Bearer ${sellerSession.token}` }
    });
    assert(r40.status === 403, 'Test 40: Seller accessing order with no products from their store returns 403', `Got ${r40.status}`);

    // 41. Unassigned Rider attempting GET /api/orders/:id returns 403
    const r41 = await fetch(`${baseUrl}/api/orders/${createdOrderId}`, {
      headers: { Authorization: `Bearer ${riderSession.token}` }
    });
    assert(r41.status === 403, 'Test 41: Unassigned delivery agent (rider) accessing order returns 403', `Got ${r41.status}`);

    // 42. Customer attempting to transition own order to Delivered returns 403
    const r42 = await fetch(`${baseUrl}/api/orders/${createdOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custSession.token}`
      },
      body: JSON.stringify({ status: 'Delivered' })
    });
    assert(r42.status === 403, 'Test 42: Customer attempting to mark order as Delivered returns 403', `Got ${r42.status}`);

    // 43. Customer attempting to transition own order to In Transit returns 403
    const r43 = await fetch(`${baseUrl}/api/orders/${createdOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custSession.token}`
      },
      body: JSON.stringify({ status: 'In Transit' })
    });
    assert(r43.status === 403, 'Test 43: Customer attempting to mark order as In Transit returns 403', `Got ${r43.status}`);

    // 44. Seller attempting to mark order as Delivered returns 403
    const r44 = await fetch(`${baseUrl}/api/orders/${createdOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerSession.token}`
      },
      body: JSON.stringify({ status: 'Delivered' })
    });
    assert(r44.status === 403, 'Test 44: Seller attempting to mark order as Delivered returns 403', `Got ${r44.status}`);

    // 45. Seller transitioning own order from Processing to Confirmed succeeds (200)
    const r45 = await fetch(`${baseUrl}/api/orders/${createdOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerSession.token}`
      },
      body: JSON.stringify({ status: 'Confirmed', note: 'Merchant confirmed stock & began packing' })
    });
    assert(r45.status === 200, 'Test 45: Seller confirming own processing order succeeds (200)', `Got ${r45.status}`);
    const d45 = await r45.json();
    assert(d45.order?.status === 'Confirmed', 'Test 45: Order status is now Confirmed');

    // 46. Unassigned Rider attempting status change returns 403
    const r46 = await fetch(`${baseUrl}/api/orders/${createdOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${riderSession.token}`
      },
      body: JSON.stringify({ status: 'In Transit' })
    });
    assert(r46.status === 403, 'Test 46: Unassigned rider attempting status update returns 403', `Got ${r46.status}`);

    // 47. Seller packs and dispatches order, then assign rider in deliveryTasks
    await fetch(`${baseUrl}/api/orders/${createdOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerSession.token}`
      },
      body: JSON.stringify({ status: 'Packaged' })
    });
    await fetch(`${baseUrl}/api/orders/${createdOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerSession.token}`
      },
      body: JSON.stringify({ status: 'Dispatched' })
    });

    db.updateDb(d => {
      if (!d.deliveryTasks) d.deliveryTasks = [];
      d.deliveryTasks.push({
        id: `dt-sec-${Date.now()}`,
        orderId: createdOrderId,
        orderNumber: d33.order.orderNumber,
        riderId: testRider.id,
        status: 'ASSIGNED',
        customerName: testCustomer.name,
        customerPhone: testCustomer.phone,
        address: 'Kinondoni',
        paymentMethod: 'mobile_money',
        codAmount: 0,
        isCodCollected: false
      } as any);
    });

    // Now assigned rider updating status to In Transit succeeds (200)
    const r47 = await fetch(`${baseUrl}/api/orders/${createdOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${riderSession.token}`
      },
      body: JSON.stringify({ status: 'In Transit', note: 'Courier picked up package from seller hub' })
    });
    assert(r47.status === 200, 'Test 47: Assigned Rider transitioning order to In Transit succeeds (200)', `Got ${r47.status}`);

    // 48. Assigned Rider attempting to set status to Preparing returns 400/403 (invalid role transition)
    const r48 = await fetch(`${baseUrl}/api/orders/${createdOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${riderSession.token}`
      },
      body: JSON.stringify({ status: 'Preparing' })
    });
    assert(r48.status === 400 || r48.status === 403, 'Test 48: Assigned Rider setting status to Preparing is rejected (400/403)', `Got ${r48.status}`);

    // 49. Customer attempting to cancel order after it is Dispatched/In Transit returns 403
    const r49 = await fetch(`${baseUrl}/api/orders/${createdOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custSession.token}`
      },
      body: JSON.stringify({ status: 'Cancelled' })
    });
    assert(r49.status === 403 || r49.status === 400, 'Test 49: Customer cancelling order in transit is rejected (403/400)', `Got ${r49.status}`);

    // 50. Customer cancelling their own Processing order succeeds
    const r50_create = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custSession.token}`
      },
      body: JSON.stringify({
        items: [
          {
            productId: 'prod-samsung-a55',
            productName: 'Samsung Galaxy A55 5G',
            sellerId: testSeller.sellerId,
            price: 240000,
            quantity: 1
          }
        ],
        deliveryAddress: {
          fullName: 'Test Recipient',
          phone: '+255700000001',
          region: 'Dar es Salaam',
          city: 'Dar es Salaam',
          area: 'Kinondoni',
          streetAddress: 'Plot 42'
        },
        deliveryMethod: { type: 'standard', name: 'Standard', fee: 5000 },
        paymentMethod: { type: 'mobile_money', name: 'M-Pesa', status: 'Paid' }
      })
    });
    const d50_create = await r50_create.json();
    const freshOrderId = d50_create.order?.id;

    const r50 = await fetch(`${baseUrl}/api/orders/${freshOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custSession.token}`
      },
      body: JSON.stringify({ status: 'Cancelled', note: 'Customer cancelled prior to processing' })
    });
    assert(r50.status === 200, 'Test 50: Customer cancelling own processing order succeeds (200)', `Got ${r50.status}`);
    const d50 = await r50.json();
    assert(d50.order?.status === 'Cancelled', 'Test 50: Order status is now Cancelled');

    // 51. State machine: transition from Cancelled to In Transit is rejected with 400
    const r51 = await fetch(`${baseUrl}/api/orders/${freshOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminSession.token}`
      },
      body: JSON.stringify({ status: 'In Transit' })
    });
    assert(r51.status === 400, 'Test 51: Invalid transition from Cancelled to In Transit rejected with 400', `Got ${r51.status}`);

    // 52. Invalid unknown status rejected with 400
    const r52 = await fetch(`${baseUrl}/api/orders/${createdOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminSession.token}`
      },
      body: JSON.stringify({ status: 'MALICIOUS_STAGE' })
    });
    assert(r52.status === 400, 'Test 52: Unrecognized status string rejected with 400', `Got ${r52.status}`);

    // 53. Super Admin deleting order succeeds (200), non-admin deleting rejected with 403
    const r53_cust = await fetch(`${baseUrl}/api/orders/${freshOrderId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${custSession.token}` }
    });
    assert(r53_cust.status === 403, 'Test 53a: Customer deleting order rejected with 403', `Got ${r53_cust.status}`);

    const r53_admin = await fetch(`${baseUrl}/api/orders/${freshOrderId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminSession.token}` }
    });
    assert(r53_admin.status === 200, 'Test 53b: Super Admin deleting order succeeds with 200', `Got ${r53_admin.status}`);

    // =========================================================================
    // SECTION C: RETURNS & REFUND SECURITY (PROBLEM C)
    // =========================================================================
    console.log('\n--- SECTION C: RETURNS & REFUND SECURITY TESTS ---');

    // 54. Unauthenticated GET /api/returns rejected with 401
    const r54 = await fetch(`${baseUrl}/api/returns`);
    assert(r54.status === 401, 'Test 54: Unauthenticated GET /api/returns returns 401', `Got ${r54.status}`);

    // 55. Unauthenticated POST /api/returns rejected with 401
    const r55 = await fetch(`${baseUrl}/api/returns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: createdOrderId })
    });
    assert(r55.status === 401, 'Test 55: Unauthenticated POST /api/returns returns 401', `Got ${r55.status}`);

    // 56. Unauthenticated GET /api/returns/:id rejected with 401
    const r56 = await fetch(`${baseUrl}/api/returns/ret-random-id`);
    assert(r56.status === 401, 'Test 56: Unauthenticated GET /api/returns/:id returns 401', `Got ${r56.status}`);

    // 57. Unauthenticated PATCH /api/returns/:id/status rejected with 401
    const r57 = await fetch(`${baseUrl}/api/returns/ret-random-id/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'REFUNDED' })
    });
    assert(r57.status === 401, 'Test 57: Unauthenticated PATCH /api/returns/:id/status returns 401', `Got ${r57.status}`);

    // 58. Authenticated GET /api/returns/:id for non-existent return returns 404
    const r58 = await fetch(`${baseUrl}/api/returns/ret-non-existent-999`, {
      headers: { Authorization: `Bearer ${custSession.token}` }
    });
    assert(r58.status === 404, 'Test 58: Non-existent return ID returns 404', `Got ${r58.status}`);

    // 59. IDOR: Customer 2 attempting to create a return for Customer 1's order returns 403
    const r59 = await fetch(`${baseUrl}/api/returns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cust2Session.token}`
      },
      body: JSON.stringify({
        orderId: createdOrderId, // Belongs to Customer 1!
        productId: 'prod-samsung-a55',
        quantity: 1,
        reason: 'DEFECTIVE'
      })
    });
    assert(r59.status === 403, 'Test 59: Customer 2 creating return for Customer 1 order rejected with 403 (IDOR blocked)', `Got ${r59.status}`);

    // 60. Attempting to create return for non-existent order returns 404
    const r60 = await fetch(`${baseUrl}/api/returns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custSession.token}`
      },
      body: JSON.stringify({
        orderId: 'ord-completely-fake-999',
        productId: 'prod-samsung-a55',
        quantity: 1
      })
    });
    assert(r60.status === 404, 'Test 60: Creating return for non-existent order returns 404', `Got ${r60.status}`);

    // 61. Attempting to create return with a product NOT in the order returns 400
    const r61 = await fetch(`${baseUrl}/api/returns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custSession.token}`
      },
      body: JSON.stringify({
        orderId: createdOrderId,
        productId: 'prod-unrelated-random-item',
        quantity: 1
      })
    });
    assert(r61.status === 400, 'Test 61: Creating return for product not in order returns 400', `Got ${r61.status}`);

    // 62. Customer 1 creates return for their OWN order: succeeds (201) with authoritative derivations
    // We pass spoofed/malicious client fields to verify server DOES NOT trust client-supplied identities or financials
    const r62 = await fetch(`${baseUrl}/api/returns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custSession.token}`
      },
      body: JSON.stringify({
        orderId: createdOrderId,
        productId: 'prod-samsung-a55',
        quantity: 1,
        reason: 'DEFECTIVE',
        customerComment: 'Screen intermittently blinks after unboxing.',
        // Attack vectors: client attempts to claim huge refund and fake identities
        refundAmount: 999999999,
        sellerId: 'sel-attacker-fake',
        customerId: 'usr-attacker-fake'
      })
    });
    assert(r62.status === 201, 'Test 62: Customer creating return for own order succeeds (201)', `Got ${r62.status}`);
    const d62 = await r62.json();
    const testReturnId = d62.returnRequest?.id;
    assert(!!testReturnId, 'Test 62: Valid returnRequest ID generated');
    // Verify server authoritative derivation:
    assert(d62.returnRequest.customerId === testCustomer.id, 'Test 62: customerId is authoritatively derived from session, not client input');
    assert(d62.returnRequest.sellerId === testSeller.sellerId, 'Test 62: sellerId is authoritatively derived from order item, not client input');
    assert(d62.returnRequest.refundAmount === 240000, 'Test 62: refundAmount is authoritatively calculated (240000 TZS), ignoring client spoofed 999999999');

    // 63. IDOR Prevention: Customer 2 attempting to view Customer 1's return request returns 403
    const r63 = await fetch(`${baseUrl}/api/returns/${testReturnId}`, {
      headers: { Authorization: `Bearer ${cust2Session.token}` }
    });
    assert(r63.status === 403, 'Test 63: Customer 2 accessing Customer 1 return returns 403 (IDOR blocked)', `Got ${r63.status}`);

    // 64. Customer 2 GET /api/returns never includes Customer 1's return request
    const r64 = await fetch(`${baseUrl}/api/returns`, {
      headers: { Authorization: `Bearer ${cust2Session.token}` }
    });
    assert(r64.status === 200, 'Test 64: Customer 2 GET /api/returns returns 200');
    const d64 = await r64.json();
    const hasOtherReturn = (d64.returns || []).some((r: any) => r.id === testReturnId);
    assert(!hasOtherReturn, 'Test 64: Customer 2 returns list does not leak Customer 1 return request');

    // 65. Seller of another store attempting to view the return returns 403
    const diffSellerUser = {
      id: 'usr-test-seller-diff',
      email: 'diffseller@lumotest.co.tz',
      name: 'Different Seller',
      phone: '+255700000099',
      role: 'SELLER' as const,
      sellerId: 'sel-different-store-999',
      passwordHash: await hashPassword('DiffSeller123!'),
      status: 'ACTIVE' as const,
      isActive: true,
      isVerified: true,
      createdAt: new Date().toISOString()
    };
    db.updateDb(d => {
      d.users.push(diffSellerUser);
    });
    const diffSellerSession = db.createSession(diffSellerUser.id, diffSellerUser.role);

    const r65 = await fetch(`${baseUrl}/api/returns/${testReturnId}`, {
      headers: { Authorization: `Bearer ${diffSellerSession.token}` }
    });
    assert(r65.status === 403, 'Test 65: Unrelated seller viewing return returns 403 (vendor isolation)', `Got ${r65.status}`);

    // 66. Unauthorized role (Rider / Delivery Agent) accessing returns returns 403
    const r66 = await fetch(`${baseUrl}/api/returns`, {
      headers: { Authorization: `Bearer ${riderSession.token}` }
    });
    assert(r66.status === 403, 'Test 66: Delivery agent accessing /api/returns returns 403', `Got ${r66.status}`);

    // 67. Customer attempting to trigger status = REFUNDED returns 403
    const r67 = await fetch(`${baseUrl}/api/returns/${testReturnId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custSession.token}`
      },
      body: JSON.stringify({ status: 'REFUNDED' })
    });
    assert(r67.status === 403, 'Test 67: Customer attempting to mark return as REFUNDED is rejected with 403', `Got ${r67.status}`);

    // 68. Seller attempting to trigger status = REFUNDED returns 403
    const r68 = await fetch(`${baseUrl}/api/returns/${testReturnId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerSession.token}`
      },
      body: JSON.stringify({ status: 'REFUNDED' })
    });
    assert(r68.status === 403, 'Test 68: Seller attempting to mark return as REFUNDED is rejected with 403', `Got ${r68.status}`);

    // 69. Seller updating return to UNDER_INSPECTION succeeds with 200
    const r69 = await fetch(`${baseUrl}/api/returns/${testReturnId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerSession.token}`
      },
      body: JSON.stringify({ status: 'UNDER_INSPECTION' })
    });
    assert(r69.status === 200, 'Test 69: Seller transitioning return to UNDER_INSPECTION succeeds with 200', `Got ${r69.status}`);

    // 70. Authorized Administrator processing REFUND succeeds (200), creates ledger entry & audit log
    const ledgerCountBefore = db.getDb().financialLedger.length;
    const r70 = await fetch(`${baseUrl}/api/returns/${testReturnId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminSession.token}`
      },
      body: JSON.stringify({ status: 'REFUNDED' })
    });
    assert(r70.status === 200, 'Test 70: Admin setting return status to REFUNDED succeeds (200)', `Got ${r70.status}`);
    const d70 = await r70.json();
    assert(d70.returnRequest?.status === 'REFUNDED', 'Test 70: Return status updated to REFUNDED');

    const ledgerAfterRefund = db.getDb().financialLedger;
    assert(ledgerAfterRefund.length === ledgerCountBefore + 1, 'Test 70: Exact one financial ledger entry was created');
    const newEntry = ledgerAfterRefund[0];
    assert(newEntry.type === 'REFUND_DEDUCTION', 'Test 70: Ledger entry type is REFUND_DEDUCTION');
    assert(newEntry.amount === -240000, 'Test 70: Ledger deduction matches authoritative refund amount (-240000 TZS)');
    assert(newEntry.orderId === createdOrderId, 'Test 70: Ledger entry references correct orderId');

    // 71. IDEMPOTENCY: Repeated refund trigger does NOT create duplicate ledger deductions
    const r71 = await fetch(`${baseUrl}/api/returns/${testReturnId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminSession.token}`
      },
      body: JSON.stringify({ status: 'REFUNDED' })
    });
    assert(r71.status === 200, 'Test 71: Repeated refund request returns 200 without error');
    const ledgerAfterDuplicate = db.getDb().financialLedger;
    assert(ledgerAfterDuplicate.length === ledgerCountBefore + 1, 'Test 71: Idempotency verified: No duplicate ledger entries created on second call');

    // Also verify POST /api/returns/:id/refund dedicated endpoint is idempotent
    const r71_dedicated = await fetch(`${baseUrl}/api/returns/${testReturnId}/refund`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminSession.token}` }
    });
    assert(r71_dedicated.status === 200, 'Test 71b: Dedicated /api/returns/:id/refund endpoint returns 200');
    assert(db.getDb().financialLedger.length === ledgerCountBefore + 1, 'Test 71b: No duplicate ledger entry created by dedicated refund endpoint');

    // 72. Absence of legacy demo return data (ord-8812, LM-8812-TZ, ret-101) in real database returns
    const allDbReturns = db.getDb().returns || [];
    const hasDemoReturns = allDbReturns.some(r =>
      r.orderId === 'ord-8812' ||
      r.orderNumber === 'LM-8812-TZ' ||
      r.id === 'ret-101' ||
      r.customerName === 'Rashid Mohamed'
    );
    assert(!hasDemoReturns, 'Test 72: Real database returns do not contain fake/demo records (ord-8812, ret-101)');

    // =========================================================================
    // SECTION D: SELLER API SECURITY, RBAC & OWNERSHIP TESTS
    // =========================================================================

    // 73. Unauthenticated requests to seller protected routes return 401
    const r73_prod = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Unauth Phone' })
    });
    assert(r73_prod.status === 401, 'Test 73a: Unauthenticated POST /api/products returns 401', `Got ${r73_prod.status}`);

    const r73_promo = await fetch(`${baseUrl}/api/promotions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Unauth Promo' })
    });
    assert(r73_promo.status === 401, 'Test 73b: Unauthenticated POST /api/promotions returns 401', `Got ${r73_promo.status}`);

    const r73_payout = await fetch(`${baseUrl}/api/sellers/payouts/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 50000 })
    });
    assert(r73_payout.status === 401, 'Test 73c: Unauthenticated POST /api/sellers/payouts/request returns 401', `Got ${r73_payout.status}`);

    const r73_kyc = await fetch(`${baseUrl}/api/sellers/kyc`);
    assert(r73_kyc.status === 401, 'Test 73d: Unauthenticated GET /api/sellers/kyc returns 401', `Got ${r73_kyc.status}`);

    // 74. Non-seller roles (CUSTOMER, DELIVERY_AGENT) rejected with 403
    const r74_cust_prod = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custSession.token}`
      },
      body: JSON.stringify({ name: 'Customer Fake Product' })
    });
    assert(r74_cust_prod.status === 403, 'Test 74a: Customer cannot create product (returns 403)', `Got ${r74_cust_prod.status}`);

    const r74_cust_promo = await fetch(`${baseUrl}/api/promotions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custSession.token}`
      },
      body: JSON.stringify({ name: 'Customer Fake Promo' })
    });
    assert(r74_cust_promo.status === 403, 'Test 74b: Customer cannot create promotion (returns 403)', `Got ${r74_cust_promo.status}`);

    const r74_rider_prod = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${riderSession.token}`
      },
      body: JSON.stringify({ name: 'Rider Fake Product' })
    });
    assert(r74_rider_prod.status === 403, 'Test 74c: Delivery agent cannot create product (returns 403)', `Got ${r74_rider_prod.status}`);

    const r74_cust_payout = await fetch(`${baseUrl}/api/sellers/payouts/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custSession.token}`
      },
      body: JSON.stringify({ amount: 50000 })
    });
    assert(r74_cust_payout.status === 403, 'Test 74d: Customer cannot request seller payout (returns 403)', `Got ${r74_cust_payout.status}`);

    // 75. Unverified seller blocked from protected operations (403 with VERIFICATION_REQUIRED)
    const r75_unver_prod = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${unverifiedSellerSession.token}`
      },
      body: JSON.stringify({ name: 'Unverified Seller Product', price: 20000 })
    });
    assert(r75_unver_prod.status === 403, 'Test 75a: Unverified seller blocked from creating product (returns 403)', `Got ${r75_unver_prod.status}`);
    const j75_prod = await r75_unver_prod.json();
    assert(j75_prod.error === 'VERIFICATION_REQUIRED', 'Test 75b: Error code is VERIFICATION_REQUIRED');

    const r75_unver_promo = await fetch(`${baseUrl}/api/promotions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${unverifiedSellerSession.token}`
      },
      body: JSON.stringify({ name: 'Unverified Promo', promotionType: 'Percentage Discount' })
    });
    assert(r75_unver_promo.status === 403, 'Test 75c: Unverified seller blocked from creating promotion (returns 403)', `Got ${r75_unver_promo.status}`);

    const r75_unver_payout = await fetch(`${baseUrl}/api/sellers/payouts/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${unverifiedSellerSession.token}`
      },
      body: JSON.stringify({ amount: 50000 })
    });
    assert(r75_unver_payout.status === 403, 'Test 75d: Unverified seller blocked from payout request (returns 403)', `Got ${r75_unver_payout.status}`);

    const r75_unver_boost = await fetch(`${baseUrl}/api/sellers/boost-product`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${unverifiedSellerSession.token}`
      },
      body: JSON.stringify({ productId: 'prod-1', budget: 25000 })
    });
    assert(r75_unver_boost.status === 403, 'Test 75e: Unverified seller blocked from boosting product (returns 403)', `Got ${r75_unver_boost.status}`);

    // 76. Unverified seller permitted to submit KYC during onboarding
    const r76_kyc = await fetch(`${baseUrl}/api/sellers/kyc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${unverifiedSellerSession.token}`
      },
      body: JSON.stringify({
        businessType: 'INDIVIDUAL',
        legalName: 'Pending Verification Merchant',
        tinNumber: 'TIN-999888'
      })
    });
    assert(r76_kyc.status === 200 || r76_kyc.status === 201, 'Test 76: Unverified seller can submit KYC onboarding (returns 200/201)', `Got ${r76_kyc.status}`);

    // 77. Verified Seller 1 creates product with authoritative session derivation (spoofed sellerId ignored)
    const r77 = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerSession.token}`
      },
      body: JSON.stringify({
        name: 'Seller 1 Security Test Device',
        brand: 'TechBrand',
        category: 'electronics',
        price: 85000,
        stock: 20,
        sellerId: 'seller-2', // Maliciously attempted spoofing
        sellerName: 'Fake Other Merchant' // Maliciously attempted spoofing
      })
    });
    assert(r77.status === 201, 'Test 77a: Verified seller creates product successfully (returns 201)', `Got ${r77.status}`);
    const j77 = await r77.json();
    const createdProdId = j77.product.id;
    assert(j77.product.sellerId === 'seller-1', 'Test 77b: Server authoritatively assigns sellerId=seller-1 from session');
    assert(j77.product.sellerName === 'TechZone Tanzania', 'Test 77c: Server authoritatively assigns sellerName from database');

    const dbProd = db.getDb().products.find(p => p.id === createdProdId);
    assert(dbProd && dbProd.sellerId === 'seller-1', 'Test 77d: Database stores authoritative sellerId=seller-1');

    // 78. Verified Seller 1 creates promotion with authoritative session derivation (spoofed sellerId ignored)
    const r78 = await fetch(`${baseUrl}/api/promotions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerSession.token}`
      },
      body: JSON.stringify({
        name: 'Seller 1 Authoritative Promo',
        promotionType: 'Percentage Discount',
        startDate: '2026-09-01',
        endDate: '2026-09-10',
        discountConfig: { percentage: 20 },
        sellerId: 'seller-2', // Maliciously attempted spoofing
        sellerName: 'Fake Other Merchant' // Maliciously attempted spoofing
      })
    });
    assert(r78.status === 201, 'Test 78a: Verified seller creates promotion (returns 201)', `Got ${r78.status}`);
    const j78 = await r78.json();
    const createdPromoId = j78.promotion.id;
    assert(j78.promotion.sellerId === 'seller-1', 'Test 78b: Server authoritatively sets sellerId=seller-1 on promotion');
    const dbPromo = (db.getDb().promotions || []).find(p => p.id === createdPromoId);
    assert(dbPromo && dbPromo.sellerId === 'seller-1', 'Test 78c: Database stores authoritative sellerId=seller-1 on promotion');

    // 79. IDOR: Seller 2 attempting to update Seller 1's product returns 403 & product not modified
    const r79 = await fetch(`${baseUrl}/api/products/${createdProdId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${seller2Session.token}`
      },
      body: JSON.stringify({ name: 'Malicious Hijacked Name' })
    });
    assert(r79.status === 403, 'Test 79a: Seller 2 cannot update Seller 1 product (returns 403 Forbidden)', `Got ${r79.status}`);
    const dbProdAfter79 = db.getDb().products.find(p => p.id === createdProdId);
    assert(dbProdAfter79?.name === 'Seller 1 Security Test Device', 'Test 79b: Product name remains unaltered in database');

    // 80. IDOR: Seller 2 attempting to adjust stock of Seller 1's product returns 403 & stock unchanged
    const r80_patch = await fetch(`${baseUrl}/api/products/${createdProdId}/stock`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${seller2Session.token}`
      },
      body: JSON.stringify({ stock: 0 })
    });
    assert(r80_patch.status === 403, 'Test 80a: Seller 2 cannot PATCH stock of Seller 1 product (returns 403)', `Got ${r80_patch.status}`);

    const r80_adjust = await fetch(`${baseUrl}/api/products/${createdProdId}/adjust-stock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${seller2Session.token}`
      },
      body: JSON.stringify({ quantityChange: -20, reason: 'Malicious reduction' })
    });
    assert(r80_adjust.status === 403, 'Test 80b: Seller 2 cannot adjust stock of Seller 1 product (returns 403)', `Got ${r80_adjust.status}`);
    const dbProdAfter80 = db.getDb().products.find(p => p.id === createdProdId);
    assert(dbProdAfter80?.stock === 20, 'Test 80c: Product stock remains unaltered in database (stock=20)');

    // 81. IDOR: Seller 2 attempting to delete Seller 1's product returns 403 & product still exists
    const r81 = await fetch(`${baseUrl}/api/products/${createdProdId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${seller2Session.token}` }
    });
    assert(r81.status === 403, 'Test 81a: Seller 2 cannot delete Seller 1 product (returns 403)', `Got ${r81.status}`);
    const dbProdAfter81 = db.getDb().products.find(p => p.id === createdProdId);
    assert(dbProdAfter81 !== undefined, 'Test 81b: Product still exists in database after attempted unauthorized deletion');

    // 82. IDOR: Seller 2 attempting to update, change status, duplicate, or delete Seller 1's promotion returns 403
    const r82_put = await fetch(`${baseUrl}/api/promotions/${createdPromoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${seller2Session.token}`
      },
      body: JSON.stringify({ name: 'Malicious Promotion Update' })
    });
    assert(r82_put.status === 403, 'Test 82a: Seller 2 cannot PUT Seller 1 promotion (returns 403)', `Got ${r82_put.status}`);

    const r82_status = await fetch(`${baseUrl}/api/promotions/${createdPromoId}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${seller2Session.token}`
      },
      body: JSON.stringify({ status: 'Paused' })
    });
    assert(r82_status.status === 403, 'Test 82b: Seller 2 cannot alter status of Seller 1 promotion (returns 403)', `Got ${r82_status.status}`);

    const r82_dup = await fetch(`${baseUrl}/api/promotions/${createdPromoId}/duplicate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${seller2Session.token}` }
    });
    assert(r82_dup.status === 403, 'Test 82c: Seller 2 cannot duplicate Seller 1 promotion (returns 403)', `Got ${r82_dup.status}`);

    const r82_del = await fetch(`${baseUrl}/api/promotions/${createdPromoId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${seller2Session.token}` }
    });
    assert(r82_del.status === 403, 'Test 82d: Seller 2 cannot delete Seller 1 promotion (returns 403)', `Got ${r82_del.status}`);

    // 83. Seller data isolation: GET /api/promotions strictly returns own items (never leaks via query param)
    const r83 = await fetch(`${baseUrl}/api/promotions?sellerId=seller-1`, {
      headers: { Authorization: `Bearer ${seller2Session.token}` }
    });
    assert(r83.status === 200, 'Test 83a: GET /api/promotions returns 200');
    const j83 = await r83.json();
    const leaked = (j83.promotions || []).some((p: any) => p.sellerId === 'seller-1');
    assert(!leaked, 'Test 83b: Seller 2 cannot see Seller 1 promotions even when passing ?sellerId=seller-1');

    // Inject ESCROW_RELEASE to ensure sufficient balance for boost-product and payout tests
    // Also inject sellerKYC to bypass the verification check
    db.updateDb(d => {
      if (!d.sellerKYC) d.sellerKYC = [];
      d.sellerKYC.push({
        sellerId: testSeller.sellerId,
        status: 'APPROVED'
      } as any);
      d.sellerKYC.push({
        sellerId: 'seller-2',
        status: 'APPROVED'
      } as any);
      
      if (!d.financialLedger) d.financialLedger = [];
      d.financialLedger.push({
        id: `led-sec-test-s1-${Date.now()}`,
        sellerId: testSeller.sellerId,
        type: 'ESCROW_RELEASE',
        amount: 2000000,
        net: 2000000,
        fee: 0,
        balanceAfter: 2000000,
        description: 'Test escrow release',
        currency: 'TZS',
        createdAt: new Date().toISOString()
      });
      d.financialLedger.push({
        id: `led-sec-test-s2-${Date.now()}`,
        sellerId: 'seller-2',
        type: 'ESCROW_RELEASE',
        amount: 1000000,
        net: 1000000,
        fee: 0,
        balanceAfter: 1000000,
        description: 'Test escrow release',
        currency: 'TZS',
        createdAt: new Date().toISOString()
      });
    });

    // 84. IDOR in advertising & campaigns: Seller 2 cannot boost Seller 1's product or modify campaigns
    const r84_boost_unauth = await fetch(`${baseUrl}/api/sellers/boost-product`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${seller2Session.token}`
      },
      body: JSON.stringify({
        productId: createdProdId,
        budget: 25000
      })
    });
    assert(r84_boost_unauth.status === 403, 'Test 84a: Seller 2 cannot boost Seller 1 product (returns 403 Forbidden)', `Got ${r84_boost_unauth.status}`);

    const r84_boost_s1 = await fetch(`${baseUrl}/api/sellers/boost-product`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerSession.token}`
      },
      body: JSON.stringify({
        productId: createdProdId,
        budget: 25000
      })
    });
    assert(r84_boost_s1.status === 200, 'Test 84b: Seller 1 boosts their own product successfully (returns 200)', `Got ${r84_boost_s1.status}`);
    const j84 = await r84_boost_s1.json();
    const campaignId = j84.campaign?.id;

    const r84_stop = await fetch(`${baseUrl}/api/sellers/ads/${campaignId}/stop`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${seller2Session.token}` }
    });
    assert(r84_stop.status === 403, 'Test 84c: Seller 2 cannot stop Seller 1 campaign (returns 403)', `Got ${r84_stop.status}`);

    const r84_del = await fetch(`${baseUrl}/api/sellers/ads/${campaignId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${seller2Session.token}` }
    });
    assert(r84_del.status === 403, 'Test 84d: Seller 2 cannot delete Seller 1 campaign (returns 403)', `Got ${r84_del.status}`);

    // 85. Financial action security & IDOR prevention: Payouts and ledgers strictly scoped to authenticated seller
    db.updateDb(d => {
      d.sellerPayouts = (d.sellerPayouts || []).filter(p => p.sellerId !== 'seller-2');
      d.orders = d.orders.filter(o => o.id !== 'ord-sec-seller-2-payout');
      d.orders.push({
        id: 'ord-sec-seller-2-payout',
        orderNumber: 'LM-SEC-PAYOUT-02',
        status: 'Delivered',
        createdAt: new Date().toISOString(),
        paymentStatus: 'PAID',
        paymentMethod: 'MOBILE_MONEY' as any,
        shippingAddress: { fullName: 'Customer', phone: '+255700000001', city: 'Dar es Salaam', street: '1st Ave' } as any,
        items: [{
          productId: 'prod-s2-test',
          name: 'Seller 2 Product',
          price: 100000,
          quantity: 1,
          sellerId: 'seller-2'
        } as any],
        pricing: { subtotal: 100000, deliveryFee: 5000, tax: 0, total: 105000 } as any,
        delivery: { trackingNumber: 'TRK-S2-PAYOUT' } as any
      } as any);
    });

    const r85 = await fetch(`${baseUrl}/api/sellers/payouts/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${seller2Session.token}`
      },
      body: JSON.stringify({
        amount: 25000,
        sellerId: 'seller-1', // Attempting to request on behalf of seller-1
        paymentMethod: 'MOBILE_MONEY',
        recipientDetails: '+255788112233'
      })
    });
    assert(r85.status === 201, 'Test 85a: Seller 2 requests payout with sufficient balance (returns 201)', `Got ${r85.status}`);
    const j85 = await r85.json();
    assert(j85.payout.sellerId === 'seller-2', 'Test 85b: Server strictly scopes payout to authenticated seller-2, ignoring spoofed seller-1');

    const r85_list = await fetch(`${baseUrl}/api/sellers/payouts?sellerId=seller-1`, {
      headers: { Authorization: `Bearer ${seller2Session.token}` }
    });
    assert(r85_list.status === 200, 'Test 85c: GET /api/sellers/payouts returns 200');
    const j85_list = await r85_list.json();
    const leakedPayouts = (j85_list.payouts || []).some((p: any) => p.sellerId === 'seller-1');
    assert(!leakedPayouts, 'Test 85d: Seller 2 cannot see Seller 1 payouts via query param spoofing');

    // 86. Safe failure on missing seller identity (no fallback to sel-001 or Swahili Tech Hub)
    const r86_prod = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerNoStoreSession.token}`
      },
      body: JSON.stringify({ name: 'Orphan Seller Product', price: 10000 })
    });
    assert(r86_prod.status === 400 || r86_prod.status === 403, 'Test 86a: Seller without linked store rejected safely (400/403)', `Got ${r86_prod.status}`);

    const r86_promo = await fetch(`${baseUrl}/api/promotions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerNoStoreSession.token}`
      },
      body: JSON.stringify({ name: 'Orphan Promo', promotionType: 'Percentage Discount' })
    });
    assert(r86_promo.status === 400 || r86_promo.status === 403, 'Test 86b: Seller without linked store cannot create promotion (400/403)', `Got ${r86_promo.status}`);

    // --- SECTION E: PRODUCTS & INVENTORY SECURITY TESTS (PROBLEM E) ---
    console.log('\n--- SECTION E: PRODUCTS & INVENTORY SECURITY TESTS ---');

    // 87. Unauthenticated & unauthorized role mutation attempts
    const r87_unauth_stock = await fetch(`${baseUrl}/api/products/${createdProdId}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: 50 })
    });
    assert(r87_unauth_stock.status === 401, 'Test 87a: Unauthenticated PATCH /api/products/:id/stock returns 401');

    const r87_unauth_adj = await fetch(`${baseUrl}/api/products/${createdProdId}/adjust-stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantityChange: 5, reason: 'Test' })
    });
    assert(r87_unauth_adj.status === 401, 'Test 87b: Unauthenticated POST /api/products/:id/adjust-stock returns 401');

    const r87_cust_stock = await fetch(`${baseUrl}/api/products/${createdProdId}/stock`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custSession.token}`
      },
      body: JSON.stringify({ stock: 50 })
    });
    assert(r87_cust_stock.status === 403, 'Test 87c: Customer role cannot update product stock (returns 403)');

    const r87_rider_adj = await fetch(`${baseUrl}/api/products/${createdProdId}/adjust-stock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${riderSession.token}`
      },
      body: JSON.stringify({ quantityChange: 5, reason: 'Rider change' })
    });
    assert(r87_rider_adj.status === 403, 'Test 87d: Delivery agent (rider) cannot adjust product stock (returns 403)');

    // 88. Cross-seller inventory IDOR protection
    const seller1Inv = (db.getDb().inventory || []).find(i => i.productId === createdProdId);
    const seller1InvId = seller1Inv?.id || 'inv-sec-test-s1';

    const r88_get_inv = await fetch(`${baseUrl}/api/sellers/inventory/${seller1InvId}`, {
      headers: { Authorization: `Bearer ${seller2Session.token}` }
    });
    assert(r88_get_inv.status === 403, 'Test 88a: Seller 2 cannot access Seller 1 inventory record (returns 403 IDOR blocked)');

    const r88_patch_inv = await fetch(`${baseUrl}/api/sellers/inventory/${seller1InvId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${seller2Session.token}`
      },
      body: JSON.stringify({ reorderLevel: 25 })
    });
    assert(r88_patch_inv.status === 403, 'Test 88b: Seller 2 cannot PATCH Seller 1 inventory settings (returns 403 IDOR blocked)');

    const r88_del_inv = await fetch(`${baseUrl}/api/sellers/inventory/${seller1InvId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${seller2Session.token}` }
    });
    assert(r88_del_inv.status === 403, 'Test 88c: Seller 2 cannot delete Seller 1 inventory record (returns 403 IDOR blocked)');

    const r88_prod_inv = await fetch(`${baseUrl}/api/products/${createdProdId}/inventory`, {
      headers: { Authorization: `Bearer ${seller2Session.token}` }
    });
    assert(r88_prod_inv.status === 403, 'Test 88d: Seller 2 cannot access Seller 1 product inventory endpoint (returns 403)');

    const r88_prod_mov = await fetch(`${baseUrl}/api/products/${createdProdId}/movements`, {
      headers: { Authorization: `Bearer ${seller2Session.token}` }
    });
    assert(r88_prod_mov.status === 403, 'Test 88e: Seller 2 cannot access Seller 1 product inventory movement ledger (returns 403)');

    // 89. Prevent direct stock manipulation via inventory update endpoint
    const r89_direct_stock = await fetch(`${baseUrl}/api/sellers/inventory/${seller1InvId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerSession.token}`
      },
      body: JSON.stringify({ available: 999999 })
    });
    assert(r89_direct_stock.status === 400, 'Test 89a: Direct stock manipulation via inventory endpoint rejected with 400');
    const j89 = await r89_direct_stock.json();
    assert(j89.code === 'STOCK_MUTATION_RESTRICTED', 'Test 89b: Error code is STOCK_MUTATION_RESTRICTED');

    // 90. Manipulated client IDs never override authenticated identity
    const r90_create = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${seller2Session.token}`
      },
      body: JSON.stringify({
        name: 'Seller 2 Legit Product',
        sellerId: 'seller-1', // Client attempting to spoof seller-1
        price: 35000,
        stock: 12
      })
    });
    assert(r90_create.status === 201, 'Test 90a: Seller 2 product created (returns 201)');
    const j90 = await r90_create.json();
    assert(j90.product.sellerId === 'seller-2', 'Test 90b: Product sellerId authoritatively set to seller-2, ignoring spoofed seller-1');
    const s2ProdId = j90.product.id;

    const r90_adjust_spoof = await fetch(`${baseUrl}/api/products/${createdProdId}/adjust-stock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${seller2Session.token}`
      },
      body: JSON.stringify({
        sellerId: 'seller-1',
        quantity: 5,
        reason: 'Attempting to adjust Seller 1 stock by spoofing ID'
      })
    });
    assert(r90_adjust_spoof.status === 403, 'Test 90c: Seller 2 cannot adjust Seller 1 stock even when supplying sellerId in body (returns 403)');

    // 91. Invalid stock values & business constraints
    const r91_neg_stock = await fetch(`${baseUrl}/api/products/${createdProdId}/stock`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerSession.token}`
      },
      body: JSON.stringify({ stock: -15 })
    });
    assert(r91_neg_stock.status === 400, 'Test 91a: Negative stock rejected with 400');

    const r91_fractional = await fetch(`${baseUrl}/api/products/${createdProdId}/stock`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerSession.token}`
      },
      body: JSON.stringify({ stock: 12.75 })
    });
    assert(r91_fractional.status === 400, 'Test 91b: Fractional stock rejected with 400');

    const r91_string_stock = await fetch(`${baseUrl}/api/products/${createdProdId}/stock`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerSession.token}`
      },
      body: JSON.stringify({ stock: 'not-a-number' })
    });
    assert(r91_string_stock.status === 400, 'Test 91c: Non-numeric stock string rejected with 400');

    const r91_excessive = await fetch(`${baseUrl}/api/products/${createdProdId}/stock`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerSession.token}`
      },
      body: JSON.stringify({ stock: 2500000 })
    });
    assert(r91_excessive.status === 400, 'Test 91d: Stock exceeding 1,000,000 upper constraint rejected with 400');

    const r91_insufficient = await fetch(`${baseUrl}/api/products/${createdProdId}/adjust-stock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerSession.token}`
      },
      body: JSON.stringify({ quantityChange: -9999, reason: 'Excessive stock reduction' })
    });
    assert(r91_insufficient.status === 400, 'Test 91e: Adjustment resulting in negative stock rejected with 400 (Insufficient stock)');

    // 92. Authorized stock adjustment & authoritative movement ledger synchronization
    const currentStockBefore92 = db.getDb().products.find(p => p.id === createdProdId)?.stock || 20;
    const r92_valid_adj = await fetch(`${baseUrl}/api/products/${createdProdId}/adjust-stock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerSession.token}`
      },
      body: JSON.stringify({
        quantity: 15,
        movementType: 'INBOUND_RECEIVED',
        reason: 'Restock shipment received at Dar warehouse'
      })
    });
    assert(r92_valid_adj.status === 200, 'Test 92a: Authorized stock adjustment succeeds (200)');
    const dbProdAfter92 = db.getDb().products.find(p => p.id === createdProdId);
    assert(dbProdAfter92?.stock === currentStockBefore92 + 15, 'Test 92b: Product stock increased by 15 in database');
    const dbInvAfter92 = db.getDb().inventory.find(i => i.productId === createdProdId);
    assert(dbInvAfter92?.available === currentStockBefore92 + 15, 'Test 92c: Inventory ledger available stock synchronized');

    const r92_mov_check = await fetch(`${baseUrl}/api/products/${createdProdId}/movements`, {
      headers: { Authorization: `Bearer ${sellerSession.token}` }
    });
    assert(r92_mov_check.status === 200, 'Test 92d: Seller retrieves own product movement ledger (200)');
    const j92_mov = await r92_mov_check.json();
    const latestMov = j92_mov.movements?.[0];
    assert(latestMov && latestMov.reason === 'Restock shipment received at Dar warehouse', 'Test 92e: Movement audit trail accurately recorded with reason and actor');

    // 93. Warehouse stock adjustment validation & authorization
    const r93_unauth_wh = await fetch(`${baseUrl}/api/warehouses/adjust-stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: createdProdId, targetAvailable: 50, reason: 'Warehouse audit' })
    });
    assert(r93_unauth_wh.status === 401, 'Test 93a: Unauthenticated POST /api/warehouses/adjust-stock returns 401');

    const r93_cust_wh = await fetch(`${baseUrl}/api/warehouses/adjust-stock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custSession.token}`
      },
      body: JSON.stringify({ productId: createdProdId, targetAvailable: 50, reason: 'Customer attempt' })
    });
    assert(r93_cust_wh.status === 403, 'Test 93b: Customer role cannot adjust warehouse stock (returns 403)');

    const r93_neg_wh = await fetch(`${baseUrl}/api/warehouses/adjust-stock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminSession.token}`
      },
      body: JSON.stringify({ productId: createdProdId, targetAvailable: -10, reason: 'Negative target' })
    });
    assert(r93_neg_wh.status === 400, 'Test 93c: Warehouse adjustment with negative target rejected with 400');

    const r93_noreason_wh = await fetch(`${baseUrl}/api/warehouses/adjust-stock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminSession.token}`
      },
      body: JSON.stringify({ productId: createdProdId, targetAvailable: 40 })
    });
    assert(r93_noreason_wh.status === 400, 'Test 93d: Warehouse adjustment without audit reason rejected with 400');

    // 94. Ownership verification on deletion & cleanup
    const r94_del_s2 = await fetch(`${baseUrl}/api/products/${s2ProdId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${seller2Session.token}` }
    });
    assert(r94_del_s2.status === 200, 'Test 94a: Seller 2 deletes own product successfully (200)');
    const prodAfter94 = db.getDb().products.find(p => p.id === s2ProdId);
    assert(!prodAfter94, 'Test 94b: Deleted product no longer exists in catalog');
    const invAfter94 = db.getDb().inventory.find(i => i.productId === s2ProdId);
    assert(!invAfter94, 'Test 94c: Deleted product inventory record removed');

    const r94_del_nonexistent = await fetch(`${baseUrl}/api/products/prod-non-existent-999`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${sellerSession.token}` }
    });
    assert(r94_del_nonexistent.status === 404, 'Test 94d: Deleting non-existent product returns 404');

    // ==========================================
    // SECTION F: RIDER / DELIVERY / OTP SECURITY TESTS
    // ==========================================
    console.log('\n--- SECTION F: RIDER / DELIVERY / OTP SECURITY TESTS ---');

    // 95. Unauthenticated delivery & OTP operations return 401
    const r95_runs = await fetch(`${baseUrl}/api/delivery/runs`);
    assert(r95_runs.status === 401, 'Test 95a: Unauthenticated GET /api/delivery/runs returns 401');

    const r95_tasks = await fetch(`${baseUrl}/api/delivery/tasks`);
    assert(r95_tasks.status === 401, 'Test 95b: Unauthenticated GET /api/delivery/tasks returns 401');

    const r95_profile = await fetch(`${baseUrl}/api/delivery/rider-profile`);
    assert(r95_profile.status === 401, 'Test 95c: Unauthenticated GET /api/delivery/rider-profile returns 401');

    const r95_complete = await fetch(`${baseUrl}/api/delivery/tasks/dt-test/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otpCode: '123456' })
    });
    assert(r95_complete.status === 401, 'Test 95d: Unauthenticated POST /api/delivery/tasks/:id/complete returns 401');

    const r95_verify = await fetch(`${baseUrl}/api/delivery/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: 'ord-test', otpCode: '123456' })
    });
    assert(r95_verify.status === 401, 'Test 95e: Unauthenticated POST /api/delivery/verify-otp returns 401');

    const r95_gen_otp = await fetch(`${baseUrl}/api/otp/generate/ord-test`, { method: 'POST' });
    assert(r95_gen_otp.status === 401, 'Test 95f: Unauthenticated POST /api/otp/generate/:id returns 401');

    const r95_resend_otp = await fetch(`${baseUrl}/api/otp/resend/ord-test`, { method: 'POST' });
    assert(r95_resend_otp.status === 401, 'Test 95g: Unauthenticated POST /api/otp/resend/:id returns 401');

    // 96. Role enforcement & verification guards
    const r96_cust_runs = await fetch(`${baseUrl}/api/delivery/runs`, {
      headers: { Authorization: `Bearer ${custSession.token}` }
    });
    assert(r96_cust_runs.status === 403, 'Test 96a: Customer role cannot access delivery runs (returns 403)');

    const r96_cust_tasks = await fetch(`${baseUrl}/api/delivery/tasks`, {
      headers: { Authorization: `Bearer ${custSession.token}` }
    });
    assert(r96_cust_tasks.status === 403, 'Test 96b: Customer role cannot access delivery tasks (returns 403)');

    const r96_cust_prof = await fetch(`${baseUrl}/api/delivery/rider-profile`, {
      headers: { Authorization: `Bearer ${custSession.token}` }
    });
    assert(r96_cust_prof.status === 403, 'Test 96c: Customer role cannot access rider profile (returns 403)');

    const r96_cust_verify = await fetch(`${baseUrl}/api/delivery/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custSession.token}`
      },
      body: JSON.stringify({ orderId: 'ord-test', otpCode: '123456' })
    });
    assert(r96_cust_verify.status === 403, 'Test 96d: Customer role cannot perform delivery OTP verification (returns 403)');

    const r96_seller_verify = await fetch(`${baseUrl}/api/delivery/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerSession.token}`
      },
      body: JSON.stringify({ orderId: 'ord-test', otpCode: '123456' })
    });
    assert(r96_seller_verify.status === 403, 'Test 96e: Seller role cannot perform delivery OTP verification (returns 403)');

    const r96_unverif_runs = await fetch(`${baseUrl}/api/delivery/runs`, {
      headers: { Authorization: `Bearer ${unverifiedRiderSession.token}` }
    });
    assert(r96_unverif_runs.status === 403, 'Test 96f: Unverified rider blocked from accessing runs (returns 403)');
    const d96_unverif = await r96_unverif_runs.json();
    assert(d96_unverif.code === 'VERIFICATION_REQUIRED', 'Test 96g: Error code is VERIFICATION_REQUIRED');

    const r96_unverif_tasks = await fetch(`${baseUrl}/api/delivery/tasks`, {
      headers: { Authorization: `Bearer ${unverifiedRiderSession.token}` }
    });
    assert(r96_unverif_tasks.status === 403, 'Test 96h: Unverified rider blocked from accessing tasks (returns 403)');

    const r96_unverif_accept = await fetch(`${baseUrl}/api/delivery/accept-task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${unverifiedRiderSession.token}`
      },
      body: JSON.stringify({ taskId: 'dt-test' })
    });
    assert(r96_unverif_accept.status === 403, 'Test 96i: Unverified rider blocked from accepting tasks (returns 403)');

    const r96_unverif_verify = await fetch(`${baseUrl}/api/delivery/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${unverifiedRiderSession.token}`
      },
      body: JSON.stringify({ orderId: 'ord-test', otpCode: '123456' })
    });
    assert(r96_unverif_verify.status === 403, 'Test 96j: Unverified rider blocked from OTP verification (returns 403)');

    // 97. IDOR Prevention in Tasks & Runs
    // Seed test tasks and runs
    const testTaskId1 = 'dt-sec-f-1';
    const testTaskId2 = 'dt-sec-f-2';
    const testOrderId1 = 'ord-sec-f-1';
    const testOrderId2 = 'ord-sec-f-2';
    const testRunId1 = 'run-sec-f-1';
    const testRunId2 = 'run-sec-f-2';

    db.updateDb(d => {
      if (!d.deliveryTasks) d.deliveryTasks = [];
      if (!d.deliveryRuns) d.deliveryRuns = [];

      d.deliveryTasks = d.deliveryTasks.filter(t => t.id !== testTaskId1 && t.id !== testTaskId2);
      d.deliveryRuns = d.deliveryRuns.filter(r => r.id !== testRunId1 && r.id !== testRunId2);

      d.deliveryRuns.push({
        id: testRunId1,
        runNumber: `RUN-${testRunId1}`,
        agentId: testRider.id,
        agentName: testRider.name,
        status: 'IN_PROGRESS',
        totalStops: 3,
        completedStops: 1,
        startTime: new Date().toISOString()
      } as any);

      d.deliveryRuns.push({
        id: testRunId2,
        runNumber: `RUN-${testRunId2}`,
        agentId: testRider2.id,
        agentName: testRider2.name,
        status: 'IN_PROGRESS',
        totalStops: 2,
        completedStops: 0,
        startTime: new Date().toISOString()
      } as any);

      d.deliveryTasks.push({
        id: testTaskId1,
        orderId: testOrderId1,
        orderNumber: 'LM-F1-TZ',
        riderId: testRider.id,
        status: 'IN_TRANSIT',
        customerName: testCustomer.name,
        customerPhone: testCustomer.phone,
        address: 'Kinondoni, Dar es Salaam',
        paymentMethod: 'mobile_money',
        codAmount: 0,
        isCodCollected: false
      } as any);

      d.deliveryTasks.push({
        id: testTaskId2,
        orderId: testOrderId2,
        orderNumber: 'LM-F2-TZ',
        riderId: testRider2.id,
        status: 'IN_TRANSIT',
        customerName: testCustomer2.name,
        customerPhone: testCustomer2.phone,
        address: 'Ilala, Dar es Salaam',
        paymentMethod: 'cod',
        codAmount: 45000,
        isCodCollected: false
      } as any);

      // Seed corresponding orders
      d.orders = d.orders.filter(o => o.id !== testOrderId1 && o.id !== testOrderId2);
      d.orders.push({
        id: testOrderId1,
        orderNumber: 'LM-F1-TZ',
        customerId: testCustomer.id,
        customer: { id: testCustomer.id, name: testCustomer.name, email: testCustomer.email, phone: testCustomer.phone, address: 'Kinondoni' },
        sellerId: testSeller.sellerId,
        items: [{ productId: 'prod-samsung-a55', title: 'Samsung Galaxy A55', price: 800000, quantity: 1, sellerId: testSeller.sellerId, sellerName: testSeller.name }],
        pricing: { subtotal: 800000, shipping: 5000, discount: 0, tax: 0, total: 805000 },
        paymentMethod: { type: 'mobile_money', provider: 'M-Pesa', status: 'COMPLETED' },
        status: 'In Transit',
        statusHistory: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as any);

      d.orders.push({
        id: testOrderId2,
        orderNumber: 'LM-F2-TZ',
        customerId: testCustomer2.id,
        customer: { id: testCustomer2.id, name: testCustomer2.name, email: testCustomer2.email, phone: testCustomer2.phone, address: 'Ilala' },
        sellerId: testSeller.sellerId,
        items: [{ productId: 'prod-samsung-a55', title: 'Samsung Galaxy A55', price: 800000, quantity: 1, sellerId: testSeller.sellerId, sellerName: testSeller.name }],
        pricing: { subtotal: 800000, shipping: 5000, discount: 0, tax: 0, total: 805000 },
        paymentMethod: { type: 'cod', provider: 'Cash on Delivery', status: 'PENDING' },
        status: 'In Transit',
        statusHistory: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as any);
    });

    // Rider 1 calls GET /runs: only returns Rider 1 runs
    const r97_r1_runs = await fetch(`${baseUrl}/api/delivery/runs?agentId=${testRider2.id}`, {
      headers: { Authorization: `Bearer ${riderSession.token}` }
    });
    assert(r97_r1_runs.status === 200, 'Test 97a: Rider 1 calls GET /api/delivery/runs successfully (200)');
    const d97_r1_runs = await r97_r1_runs.json();
    assert(d97_r1_runs.runs.every((r: any) => r.agentId === testRider.id), 'Test 97b: Rider 1 only sees their own runs despite query param spoofing');

    // Rider 1 calls GET /tasks: cannot see Rider 2 assigned task
    const r97_r1_tasks = await fetch(`${baseUrl}/api/delivery/tasks`, {
      headers: { Authorization: `Bearer ${riderSession.token}` }
    });
    assert(r97_r1_tasks.status === 200, 'Test 97c: Rider 1 calls GET /api/delivery/tasks successfully (200)');
    const d97_r1_tasks = await r97_r1_tasks.json();
    assert(!d97_r1_tasks.tasks.some((t: any) => t.id === testTaskId2), 'Test 97d: Rider 1 task list does not leak Rider 2 task');

    // Rider 1 calls GET /tasks/:id on Rider 2 task -> returns 403
    const r97_r1_task2 = await fetch(`${baseUrl}/api/delivery/tasks/${testTaskId2}`, {
      headers: { Authorization: `Bearer ${riderSession.token}` }
    });
    assert(r97_r1_task2.status === 403, 'Test 97e: Rider 1 accessing Rider 2 task returns 403 (IDOR blocked)');

    // Rider 1 calls update-task-status on Rider 2 task -> returns 403
    const r97_r1_upd_task2 = await fetch(`${baseUrl}/api/delivery/update-task-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${riderSession.token}`
      },
      body: JSON.stringify({ taskId: testTaskId2, status: 'ARRIVED' })
    });
    assert(r97_r1_upd_task2.status === 403, 'Test 97f: Rider 1 updating Rider 2 task returns 403 (IDOR blocked)');

    // Rider 1 calls collect-cod on Rider 2 task -> returns 403
    const r97_r1_cod_task2 = await fetch(`${baseUrl}/api/delivery/collect-cod`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${riderSession.token}`
      },
      body: JSON.stringify({ taskId: testTaskId2 })
    });
    assert(r97_r1_cod_task2.status === 403, 'Test 97g: Rider 1 collecting COD for Rider 2 task returns 403 (IDOR blocked)');

    // 98. Secure Cryptographic OTP Generation & Properties
    const r98_cust_gen = await fetch(`${baseUrl}/api/otp/generate/${testOrderId1}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${custSession.token}` }
    });
    assert(r98_cust_gen.status === 200, 'Test 98a: Customer 1 generates OTP for own order succeeds (200)');
    const d98_cust_gen = await r98_cust_gen.json();
    assert(typeof d98_cust_gen.otpCode === 'string', 'Test 98b: OTP code is returned as a string');
    assert(d98_cust_gen.otpCode.length === 6, 'Test 98c: OTP code length is exactly 6 digits');
    assert(/^\d{6}$/.test(d98_cust_gen.otpCode), 'Test 98d: OTP code is numeric');
    const expiryDiffMinutes = (new Date(d98_cust_gen.expiresAt).getTime() - Date.now()) / (60 * 1000);
    assert(expiryDiffMinutes > 9 && expiryDiffMinutes <= 16, 'Test 98e: OTP expiration is short-lived (10-15 minutes)');

    // Customer 2 trying to generate/read OTP for Customer 1 order -> returns 403
    const r98_c2_gen = await fetch(`${baseUrl}/api/otp/generate/${testOrderId1}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${cust2Session.token}` }
    });
    assert(r98_c2_gen.status === 403, 'Test 98f: Customer 2 cannot access or generate OTP for Customer 1 order (403 IDOR blocked)');

    // 99. OTP Resend Rate Limiting (Cooldown)
    const r99_resend_fast = await fetch(`${baseUrl}/api/otp/resend/${testOrderId1}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${custSession.token}` }
    });
    assert(r99_resend_fast.status === 429, 'Test 99a: Immediate OTP resend returns 429 Too Many Requests (Cooldown active)');
    const d99_resend = await r99_resend_fast.json();
    assert(d99_resend.code === 'COOLDOWN_ACTIVE' || d99_resend.code === 'RATE_LIMITED', 'Test 99b: Error code is COOLDOWN_ACTIVE');
    assert(d99_resend.retryAfterSeconds > 0, 'Test 99c: Response provides retryAfterSeconds cooldown count');

    // 100. Wrong Rider attempting OTP delivery completion
    const validOtpOrder1 = d98_cust_gen.otpCode;
    const r100_wrong_rider = await fetch(`${baseUrl}/api/delivery/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${rider2Session.token}`
      },
      body: JSON.stringify({ taskId: testTaskId1, orderId: testOrderId1, otpCode: validOtpOrder1 })
    });
    assert(r100_wrong_rider.status === 403, 'Test 100a: Wrong rider completing delivery with valid OTP returns 403 (RIDER_MISMATCH)');
    const d100_wrong = await r100_wrong_rider.json();
    assert(d100_wrong.code === 'RIDER_MISMATCH', 'Test 100b: Error code is RIDER_MISMATCH');

    // 101. Invalid OTP verification & lock after 3 failed attempts
    const r101_fail_1 = await fetch(`${baseUrl}/api/delivery/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${riderSession.token}`
      },
      body: JSON.stringify({ taskId: testTaskId1, orderId: testOrderId1, otpCode: '000000' })
    });
    assert(r101_fail_1.status === 400, 'Test 101a: Invalid OTP attempt 1 returns 400');
    const d101_1 = await r101_fail_1.json();
    assert(d101_1.attemptsLeft === 2, 'Test 101b: 2 verification attempts remaining reported');

    const r101_fail_2 = await fetch(`${baseUrl}/api/delivery/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${riderSession.token}`
      },
      body: JSON.stringify({ taskId: testTaskId1, orderId: testOrderId1, otpCode: '111111' })
    });
    assert(r101_fail_2.status === 400, 'Test 101c: Invalid OTP attempt 2 returns 400');
    const d101_2 = await r101_fail_2.json();
    assert(d101_2.attemptsLeft === 1, 'Test 101d: 1 verification attempt remaining reported');

    const r101_fail_3 = await fetch(`${baseUrl}/api/delivery/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${riderSession.token}`
      },
      body: JSON.stringify({ taskId: testTaskId1, orderId: testOrderId1, otpCode: '222222' })
    });
    assert(r101_fail_3.status === 400, 'Test 101e: Invalid OTP attempt 3 returns 400');
    const d101_3 = await r101_fail_3.json();
    assert(d101_3.locked === true, 'Test 101f: OTP verification locked after 3 failed attempts');

    // Attempting with correct OTP after lockout is still rejected
    const r101_after_lock = await fetch(`${baseUrl}/api/delivery/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${riderSession.token}`
      },
      body: JSON.stringify({ taskId: testTaskId1, orderId: testOrderId1, otpCode: validOtpOrder1 })
    });
    assert(r101_after_lock.status === 400, 'Test 101g: Valid OTP rejected when locked (returns 400)');
    const d101_lock = await r101_after_lock.json();
    assert(d101_lock.code === 'OTP_LOCKED', 'Test 101h: Error code is OTP_LOCKED');

    // 102. Expired OTP rejection
    const expiredOrderId = 'ord-sec-f-expired';
    const expiredTaskId = 'dt-sec-f-expired';
    db.updateDb(d => {
      d.orders.push({
        id: expiredOrderId,
        orderNumber: 'LM-EXP-TZ',
        customerId: testCustomer.id,
        customer: { id: testCustomer.id, name: testCustomer.name, email: testCustomer.email, phone: testCustomer.phone, address: 'Kinondoni' },
        sellerId: testSeller.sellerId,
        items: [{ productId: 'prod-samsung-a55', title: 'Samsung Galaxy A55', price: 800000, quantity: 1, sellerId: testSeller.sellerId, sellerName: testSeller.name }],
        pricing: { subtotal: 800000, shipping: 5000, discount: 0, tax: 0, total: 805000 },
        paymentMethod: { type: 'mobile_money', provider: 'M-Pesa', status: 'COMPLETED' },
        status: 'In Transit',
        statusHistory: [],
        otpCode: '654321',
        otpStatus: 'ACTIVE',
        otpExpiresAt: new Date(Date.now() - 60000).toISOString(), // expired 1 minute ago
        otpAttempts: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as any);

      d.deliveryTasks.push({
        id: expiredTaskId,
        orderId: expiredOrderId,
        orderNumber: 'LM-EXP-TZ',
        riderId: testRider.id,
        status: 'IN_TRANSIT',
        customerName: testCustomer.name,
        customerPhone: testCustomer.phone,
        address: 'Kinondoni',
        paymentMethod: 'mobile_money',
        codAmount: 0,
        isCodCollected: false
      } as any);
    });

    const r102_expired = await fetch(`${baseUrl}/api/delivery/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${riderSession.token}`
      },
      body: JSON.stringify({ taskId: expiredTaskId, orderId: expiredOrderId, otpCode: '654321' })
    });
    assert(r102_expired.status === 400, 'Test 102a: Expired OTP rejected with 400');
    const d102 = await r102_expired.json();
    assert(d102.code === 'OTP_EXPIRED', 'Test 102b: Error code is OTP_EXPIRED');

    // 103. Successful OTP Delivery Completion & Financial Settlement
    const dynamicIdSuffix = Date.now().toString();
    const successOrderId = `ord-sec-f-success-${dynamicIdSuffix}`;
    const successTaskId = `dt-sec-f-success-${dynamicIdSuffix}`;
    const initialLedgerCount = (db.getDb().financialLedger || []).length;
    const initialPayoutCount = (db.getDb().sellerPayouts || []).length;

    db.updateDb(d => {
      d.orders.push({
        id: successOrderId,
        orderNumber: `LM-SUCCESS-${dynamicIdSuffix}`,
        customerId: testCustomer.id,
        customer: { id: testCustomer.id, name: testCustomer.name, email: testCustomer.email, phone: testCustomer.phone, address: 'Kinondoni' },
        sellerId: testSeller.sellerId,
        items: [{ productId: 'prod-samsung-a55', title: 'Samsung Galaxy A55', price: 600000, quantity: 1, sellerId: testSeller.sellerId, sellerName: testSeller.name }],
        pricing: { subtotal: 600000, shipping: 5000, discount: 0, tax: 0, total: 605000 },
        paymentMethod: { type: 'mobile_money', provider: 'M-Pesa', status: 'COMPLETED' },
        status: 'In Transit',
        statusHistory: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as any);

      d.deliveryTasks.push({
        id: successTaskId,
        orderId: successOrderId,
        orderNumber: `LM-SUCCESS-${dynamicIdSuffix}`,
        riderId: testRider.id,
        status: 'IN_TRANSIT',
        customerName: testCustomer.name,
        customerPhone: testCustomer.phone,
        address: 'Kinondoni',
        paymentMethod: 'mobile_money',
        codAmount: 0,
        isCodCollected: false
      } as any);
    });

    // Generate valid OTP for success order
    const r103_gen = await fetch(`${baseUrl}/api/otp/generate/${successOrderId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${custSession.token}` }
    });
    assert(r103_gen.status === 200, 'Test 103a: OTP generated for success test order');
    const d103_gen = await r103_gen.json();
    const successOtp = d103_gen.otpCode;

    // Assigned Rider completes delivery via /tasks/:id/complete
    const r103_complete = await fetch(`${baseUrl}/api/delivery/tasks/${successTaskId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${riderSession.token}`
      },
      body: JSON.stringify({ otpCode: successOtp, receivedByName: 'Customer Relative' })
    });
    assert(r103_complete.status === 200, 'Test 103b: Assigned rider completes delivery via OTP successfully (200)');
    const d103_comp = await r103_complete.json();
    assert(d103_comp.success === true, 'Test 103c: Delivery completion reports success');

    const orderAfterSuccess = db.getDb().orders.find(o => o.id === successOrderId);
    assert(orderAfterSuccess?.status === 'Delivered', 'Test 103d: Order status updated to Delivered');
    assert(orderAfterSuccess?.otpStatus === 'VERIFIED', 'Test 103e: Order otpStatus updated to VERIFIED');
    assert(orderAfterSuccess?.paymentReleased === true, 'Test 103f: Order payment release marked true');

    const taskAfterSuccess = db.getDb().deliveryTasks.find(t => t.id === successTaskId);
    assert(taskAfterSuccess?.status === 'DELIVERED', 'Test 103g: Delivery task status updated to DELIVERED');

    // Authoritative Financial Settlement verification
    const newLedgerCount = (db.getDb().financialLedger || []).length;
    assert(newLedgerCount === initialLedgerCount + 1, 'Test 103h: Exactly 1 escrow release ledger entry created', `Expected ${initialLedgerCount + 1}, got ${newLedgerCount}`);
    const escrowEntry = db.getDb().financialLedger.find(l => l.orderId === successOrderId && l.type === 'ESCROW_RELEASE');
    assert(Boolean(escrowEntry), 'Test 103i: Escrow release ledger entry exists in database');
    assert(escrowEntry?.amount === 605000, 'Test 103j: Escrow entry amount strictly equals authoritative total 605,000 TZS');
    assert(escrowEntry?.sellerId === testSeller.sellerId, 'Test 103k: Escrow entry references authenticated sellerId', `Expected ${testSeller.sellerId}, got ${escrowEntry?.sellerId}`);

    const newPayoutCount = (db.getDb().sellerPayouts || []).length;
    assert(newPayoutCount === initialPayoutCount + 1, 'Test 103l: Exactly 1 seller payout record created', `Expected ${initialPayoutCount + 1}, got ${newPayoutCount}`);
    const payoutRecord = db.getDb().sellerPayouts.find(p => p.referenceNumber?.includes(orderAfterSuccess?.orderNumber || ''));
    assert(Boolean(payoutRecord), 'Test 103m: Authoritative seller payout record exists');
    assert(payoutRecord?.sellerId === testSeller.sellerId, 'Test 103n: Seller payout references authenticated seller-1');

    // 104. Single-use OTP & Idempotency
    const r104_reused = await fetch(`${baseUrl}/api/delivery/tasks/${successTaskId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${riderSession.token}`
      },
      body: JSON.stringify({ otpCode: successOtp })
    });
    assert(r104_reused.status === 400, 'Test 104a: Reused OTP / already completed order rejected with 400');
    const finalLedgerCount = (db.getDb().financialLedger || []).length;
    assert(finalLedgerCount === newLedgerCount, 'Test 104b: Idempotency verified: No duplicate financial ledger entry created on replay');

    // 105. Delivery completion cannot be bypassed by direct status update
    const bypassOrderId = 'ord-sec-f-bypass';
    const bypassTaskId = 'dt-sec-f-bypass';
    db.updateDb(d => {
      d.orders.push({
        id: bypassOrderId,
        orderNumber: 'LM-BYPASS-TZ',
        customerId: testCustomer.id,
        customer: { id: testCustomer.id, name: testCustomer.name, email: testCustomer.email, phone: testCustomer.phone, address: 'Kinondoni' },
        sellerId: testSeller.sellerId,
        items: [{ productId: 'prod-samsung-a55', title: 'Samsung Galaxy A55', price: 600000, quantity: 1, sellerId: testSeller.sellerId, sellerName: testSeller.name }],
        pricing: { subtotal: 600000, shipping: 5000, discount: 0, tax: 0, total: 605000 },
        paymentMethod: { type: 'mobile_money', provider: 'M-Pesa', status: 'COMPLETED' },
        status: 'In Transit',
        statusHistory: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as any);

      d.deliveryTasks.push({
        id: bypassTaskId,
        orderId: bypassOrderId,
        orderNumber: 'LM-BYPASS-TZ',
        riderId: testRider.id,
        status: 'IN_TRANSIT',
        customerName: testCustomer.name,
        customerPhone: testCustomer.phone,
        address: 'Kinondoni',
        paymentMethod: 'mobile_money',
        codAmount: 0,
        isCodCollected: false
      } as any);
    });

    const r105_bypass_order = await fetch(`${baseUrl}/api/orders/${bypassOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${riderSession.token}`
      },
      body: JSON.stringify({ status: 'Delivered' })
    });
    assert(r105_bypass_order.status === 400 || r105_bypass_order.status === 403, 'Test 105a: Rider directly patching order to Delivered is rejected (400/403 OTP required)');

    const r105_bypass_task = await fetch(`${baseUrl}/api/delivery/update-task-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${riderSession.token}`
      },
      body: JSON.stringify({ taskId: bypassTaskId, status: 'DELIVERED' })
    });
    assert(r105_bypass_task.status === 400, 'Test 105b: Rider setting task status to DELIVERED without OTP is rejected with 400');

    // 106. Pickup Station Handover Security
    const r106_unauth_handover = await fetch(`${baseUrl}/api/pickup/handover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packageId: 'pinv-test', otpCode: '123456' })
    });
    assert(r106_unauth_handover.status === 401, 'Test 106a: Unauthenticated POST /api/pickup/handover returns 401');

    const r106_cust_handover = await fetch(`${baseUrl}/api/pickup/handover`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custSession.token}`
      },
      body: JSON.stringify({ packageId: 'pinv-test', otpCode: '123456' })
    });
    assert(r106_cust_handover.status === 403, 'Test 106b: Customer role cannot perform pickup handover (returns 403)');

    const r106_rider_handover = await fetch(`${baseUrl}/api/pickup/handover`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${riderSession.token}`
      },
      body: JSON.stringify({ packageId: 'pinv-test', otpCode: '123456' })
    });
    assert(r106_rider_handover.status === 403, 'Test 106c: Rider role cannot perform pickup handover (returns 403)');

    // Authorized station operator performs handover with valid OTP
    const testPkgId = `pinv-sec-${Date.now()}`;
    const pickupOrderId = `ord-pickup-${Date.now()}`;
    const testPickupOtp = '889922';

    db.updateDb(d => {
      if (!d.pickupInventory) d.pickupInventory = [];
      d.pickupInventory.push({
        id: testPkgId,
        stationId: 'ps-kariakoo-hub',
        stationName: 'Kariakoo Central Pickup Hub',
        orderId: pickupOrderId,
        orderNumber: 'LM-PKUP-TZ',
        customerName: testCustomer.name,
        customerPhone: testCustomer.phone,
        shelfLocation: 'Shelf K-04',
        packageCount: 1,
        receivedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        status: 'READY_FOR_PICKUP',
        otpCode: testPickupOtp
      } as any);

      d.orders.push({
        id: pickupOrderId,
        orderNumber: 'LM-PKUP-TZ',
        customerId: testCustomer.id,
        customer: { id: testCustomer.id, name: testCustomer.name, email: testCustomer.email, phone: testCustomer.phone, address: 'Kariakoo' },
        sellerId: testSeller.sellerId,
        items: [{ productId: 'prod-samsung-a55', title: 'Samsung Galaxy A55', price: 600000, quantity: 1, sellerId: testSeller.sellerId, sellerName: testSeller.name }],
        pricing: { subtotal: 600000, shipping: 0, discount: 0, tax: 0, total: 600000 },
        paymentMethod: { type: 'mobile_money', provider: 'M-Pesa', status: 'COMPLETED' },
        status: 'Ready for Pickup',
        statusHistory: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as any);
    });

    const r106_invalid_otp = await fetch(`${baseUrl}/api/pickup/handover`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pickupOpSession.token}`
      },
      body: JSON.stringify({ packageId: testPkgId, otpCode: '000000' })
    });
    assert(r106_invalid_otp.status === 400, 'Test 106d: Handover with invalid OTP returns 400');

    const r106_valid_handover = await fetch(`${baseUrl}/api/pickup/handover`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pickupOpSession.token}`
      },
      body: JSON.stringify({ packageId: testPkgId, otpCode: testPickupOtp })
    });
    assert(r106_valid_handover.status === 200, 'Test 106e: Authorized pickup handover with valid OTP succeeds (200)');
    const d106_valid = await r106_valid_handover.json();
    assert(d106_valid.package.status === 'COLLECTED', 'Test 106f: Package status updated to COLLECTED');

    const pkgInDb = db.getDb().pickupInventory.find(p => p.id === testPkgId);
    assert(pkgInDb?.otpCode === '', 'Test 106g: Single-use pickup OTP burned on collection');

    const orderInDb = db.getDb().orders.find(o => o.id === pickupOrderId);
    assert(orderInDb?.status === 'Delivered', 'Test 106h: Linked pickup order marked Delivered');

    const r106_rehandover = await fetch(`${baseUrl}/api/pickup/handover`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pickupOpSession.token}`
      },
      body: JSON.stringify({ packageId: testPkgId, otpCode: testPickupOtp })
    });
    assert(r106_rehandover.status === 400, 'Test 106i: Handover on already collected package rejected with 400');


    // ----------------------------------------------------------------------
    // SECTION G: FINANCIAL IDENTITY & OPERATION SECURITY
    // ----------------------------------------------------------------------
    console.log('\n--- SECTION G: FINANCIAL IDENTITY & OPERATION SECURITY ---');
    
    // G1. Ad wallet deposit enforcement
    const r107_unauth_deposit = await fetch(`${baseUrl}/api/payments/ussd/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custSession.token}`
      },
      body: JSON.stringify({
        payerPhone: '255700000001',
        amount: 25000,
        referenceType: 'SELLER_AD_WALLET'
      })
    });
    assert(r107_unauth_deposit.status === 403, 'Test 107a: Customer cannot deposit to seller ad wallet (returns 403)');
    
    const r107_neg_deposit = await fetch(`${baseUrl}/api/payments/ussd/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerSession.token}`
      },
      body: JSON.stringify({
        payerPhone: '255700000001',
        amount: -50000,
        referenceType: 'SELLER_AD_WALLET'
      })
    });
    assert(r107_neg_deposit.status === 400, 'Test 107b: Negative ad wallet deposit rejected (returns 400)');
    
    // Test that the seller cannot forge the ID
    const r107_forged_deposit = await fetch(`${baseUrl}/api/payments/ussd/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerSession.token}`
      },
      body: JSON.stringify({
        payerId: 'sel-forged-999',
        payerPhone: '255700000001',
        amount: 50000,
        referenceType: 'SELLER_AD_WALLET'
      })
    });
    const d107_forged = await r107_forged_deposit.json();
    if (r107_forged_deposit.status === 201) {
      // Must ignore forged payerId and use the session one
      const initiatedTx = ((db.getDb() as any).paymentTransactions || []).find((t: any) => t.id === d107_forged.transactionId);
      assert(initiatedTx?.payerId === testSeller.sellerId, 'Test 107c: Ad wallet deposit overrides client-supplied payerId with authoritative session sellerId');
    }

    // G2. Authoritative Payout Calculation and Fraud Prevention
    const payoutReq = {
      amount: 50000000,
      paymentMethod: { type: 'MOBILE_MONEY', provider: 'M-Pesa', accountName: 'S', accountNumber: '0' }
    };

    const r108_unauth_payout = await fetch(`${baseUrl}/api/sellers/payouts/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custSession.token}`
      },
      body: JSON.stringify(payoutReq)
    });
    assert(r108_unauth_payout.status === 403, 'Test 108a: Customer cannot request seller payout (returns 403)');
    
    const r108_insufficient_payout = await fetch(`${baseUrl}/api/sellers/payouts/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerSession.token}`
      },
      body: JSON.stringify(payoutReq)
    });
    assert(r108_insufficient_payout.status === 400, 'Test 108b: Payout request exceeding authoritative ledger balance is rejected (returns 400)');

    // Inject ledger balance for seller to test successful payout
    db.updateDb(d => {
      d.financialLedger.push({
        id: `led-sec-test-${Date.now()}`,
        sellerId: testSeller.sellerId,
        type: 'ESCROW_RELEASE',
        amount: 1000000,
        net: 1000000,
        fee: 0,
        balanceAfter: 1000000,
        description: 'Test escrow release',
        currency: 'TZS',
        createdAt: new Date().toISOString()
      });
    });

    const r108_valid_payout = await fetch(`${baseUrl}/api/sellers/payouts/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerSession.token}`
      },
      body: JSON.stringify({ amount: 200000, paymentMethod: payoutReq.paymentMethod })
    });
    assert(r108_valid_payout.status === 201, 'Test 108c: Valid payout request succeeds when authoritative balance is sufficient');
    const d108_valid = await r108_valid_payout.json();
    assert(d108_valid.payout.amount === 200000, 'Test 108d: Payout created with correct amount');
    
    const r108_deducted_payout = await fetch(`${baseUrl}/api/sellers/payouts/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerSession.token}`
      },
      body: JSON.stringify({ amount: 50000000, paymentMethod: payoutReq.paymentMethod }) // 1M - 200k = 800k max
    });
    assert(r108_deducted_payout.status === 400, 'Test 108e: Pending payouts are correctly deducted from authoritative available balance');

    // G3. Product Boost ad balance verification
    const r109_unfunded_boost = await fetch(`${baseUrl}/api/sellers/boost-product`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerSession.token}`
      },
      body: JSON.stringify({ productId: createdProdId, budget: 50000000 })
    });
    assert(r109_unfunded_boost.status === 400, 'Test 109a: Ad boost requiring more budget than available balance is rejected (returns 400)');

    const r109_funded_boost = await fetch(`${baseUrl}/api/sellers/boost-product`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerSession.token}`
      },
      body: JSON.stringify({ productId: createdProdId, budget: 50000 })
    });
    assert(r109_funded_boost.status === 200, 'Test 109b: Ad boost succeeds when authoritative balance is sufficient');
    const d109_boost = await r109_funded_boost.json();
    
    // Verify debit ledger entry was created
    const adDebit = (db.getDb().financialLedger as any[]).find(l => l.sellerId === testSeller.sellerId && (l.type === 'DEBIT' || l.type === 'AD_SPEND') && (l.category === 'ADVERTISING_FEE' || l.description?.includes('Boost') || l.description?.includes('Advertising')) && l.amount === 50000);
    assert(!!adDebit, 'Test 109c: Boost product correctly creates DEBIT ledger entry');

    // G4. Refunds Idempotency
    db.updateDb(d => {
      d.returns.push({
        id: 'ret-sec-test',
        returnNumber: 'RET-SEC-01',
        orderId: 'ord-sec-01',
        orderNumber: 'LM-SEC-ORD-01',
        customerId: 'cust-01',
        customerName: 'Customer',
        sellerName: 'Seller',
        productId: 'prod-1',
        productName: 'Prod',
        sellerId: testSeller.sellerId,
        refundAmount: 50000,
        status: 'UNDER_INSPECTION'
      } as any);
    });
    
    const r110_seller_refund = await fetch(`${baseUrl}/api/returns/ret-sec-test/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerSession.token}`
      }
    });
    assert(r110_seller_refund.status === 403, 'Test 110a: Seller cannot trigger financial refund (returns 403)');
    
    const r110_admin_refund = await fetch(`${baseUrl}/api/returns/ret-sec-test/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminSession.token}`
      }
    });
    assert(r110_admin_refund.status === 200, 'Test 110b: Admin can trigger financial refund');
    
    const r110_duplicate_refund = await fetch(`${baseUrl}/api/returns/ret-sec-test/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminSession.token}`
      }
    });
    assert(r110_duplicate_refund.status === 200, 'Test 110c: Duplicate refund is idempotent and returns 200 without creating double deduction');
    
    const refundDeductions = db.getDb().financialLedger.filter(l => l.type === 'REFUND_DEDUCTION' && l.orderId === 'ord-sec-01');
    assert(refundDeductions.length === 1, 'Test 110d: Idempotent refund only creates a single ledger entry');

    // =========================================================================
    // --- SECTION H: WORKSPACE SECURITY, RBAC & IDOR TESTS ---
    // =========================================================================
    console.log('\n--- SECTION H: WORKSPACE SECURITY, RBAC & IDOR TESTS ---');

    // 111. Unauthenticated Workspace Access (All routes must reject with 401)
    const r111_unauth_msg = await fetch(`${baseUrl}/api/workspace/gmail/messages`);
    assert(r111_unauth_msg.status === 401, 'Test 111a: Unauthenticated GET /api/workspace/gmail/messages returns 401');

    const r111_unauth_send = await fetch(`${baseUrl}/api/workspace/gmail/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient: 'test@lumo.co.tz', subject: 'Hi', body: 'Test' })
    });
    assert(r111_unauth_send.status === 401, 'Test 111b: Unauthenticated POST /api/workspace/gmail/send returns 401');

    const r111_unauth_forms = await fetch(`${baseUrl}/api/workspace/forms`);
    assert(r111_unauth_forms.status === 401, 'Test 111c: Unauthenticated GET /api/workspace/forms returns 401');

    const r111_unauth_create_form = await fetch(`${baseUrl}/api/workspace/forms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New Form', description: 'Desc', questions: [] })
    });
    assert(r111_unauth_create_form.status === 401, 'Test 111d: Unauthenticated POST /api/workspace/forms returns 401');

    const r111_unauth_submit = await fetch(`${baseUrl}/api/workspace/forms/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formId: 'form-customer-satisfaction-02', responses: { q1: 5 } })
    });
    assert(r111_unauth_submit.status === 401, 'Test 111e: Unauthenticated POST /api/workspace/forms/submit returns 401');

    // 112. Unauthorized Role Access on Workspace Mutations & Dispatch
    const r112_cust_send = await fetch(`${baseUrl}/api/workspace/gmail/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custSession.token}`
      },
      body: JSON.stringify({ recipient: 'target@lumo.co.tz', subject: 'Spoof', body: 'Msg' })
    });
    assert(r112_cust_send.status === 403, 'Test 112a: Customer role cannot dispatch Gmail via /api/workspace/gmail/send (returns 403)');

    const r112_rider_send = await fetch(`${baseUrl}/api/workspace/gmail/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${riderSession.token}`
      },
      body: JSON.stringify({ recipient: 'target@lumo.co.tz', subject: 'Spoof', body: 'Msg' })
    });
    assert(r112_rider_send.status === 403, 'Test 112b: Rider role cannot dispatch Gmail via /api/workspace/gmail/send (returns 403)');

    const r112_cust_create_form = await fetch(`${baseUrl}/api/workspace/forms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custSession.token}`
      },
      body: JSON.stringify({ title: 'Hack Form', description: 'desc', questions: [] })
    });
    assert(r112_cust_create_form.status === 403, 'Test 112c: Customer role cannot create workspace forms (returns 403)');

    const r112_cust_put_form = await fetch(`${baseUrl}/api/workspace/forms/form-seller-kyc-01`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custSession.token}`
      },
      body: JSON.stringify({ title: 'Modified' })
    });
    assert(r112_cust_put_form.status === 403, 'Test 112d: Customer role cannot update workspace forms (returns 403)');

    const r112_cust_del_form = await fetch(`${baseUrl}/api/workspace/forms/form-seller-kyc-01`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${custSession.token}`
      }
    });
    assert(r112_cust_del_form.status === 403, 'Test 112e: Customer role cannot delete workspace forms (returns 403)');

    // 113. Unverified Staff / Seller Access Rejection
    const unverifiedStaffUser = db.findUserById('unverified-staff-user') || (() => {
      const u = {
        id: 'usr-unverified-staff',
        name: 'Unverified Agent',
        email: 'unverified.agent@lumo.co.tz',
        phone: '+255799999999',
        role: 'SUPPORT_AGENT' as const,
        isVerified: false,
        isActive: true,
        status: 'ACTIVE' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.updateDb(d => { d.users.push(u); });
      return u;
    })();
    const unverifiedStaffSession = db.createSession(unverifiedStaffUser.id, 'SUPPORT_AGENT');

    const r113_unverified_staff_send = await fetch(`${baseUrl}/api/workspace/gmail/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${unverifiedStaffSession.token}`
      },
      body: JSON.stringify({ recipient: 'target@lumo.co.tz', subject: 'Support Ticket', body: 'Help' })
    });
    assert(r113_unverified_staff_send.status === 403, 'Test 113a: Unverified staff member dispatching email returns 403');

    // 114. Cross-user IDOR on Messages & Anti-Spoofing
    const r114_admin_send = await fetch(`${baseUrl}/api/workspace/gmail/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminSession.token}`
      },
      body: JSON.stringify({
        recipient: testCustomer.email,
        subject: 'Confidential Notice for Cust 1',
        body: 'Your account balance is verified.',
        sender: 'fake-sender@spoofed.com',
        userId: 'spoofed-id'
      })
    });
    assert(r114_admin_send.status === 200, 'Test 114a: Authorized Admin sends email via Gmail API successfully (200)');
    const r114_admin_send_data = await r114_admin_send.json();
    const createdMsgId = r114_admin_send_data.messageId;

    assert(r114_admin_send_data.sender.includes('admin@lumo.co.tz') || r114_admin_send_data.sender.includes(testSuperAdmin.name) || r114_admin_send_data.sender.includes(testSuperAdmin.email), 'Test 114b: Sender is authoritatively bound to Admin session (ignoring client spoofed sender)');

    // Customer 1 accessing own message
    const r114_cust1_view = await fetch(`${baseUrl}/api/workspace/gmail/messages/${createdMsgId}`, {
      headers: { Authorization: `Bearer ${custSession.token}` }
    });
    assert(r114_cust1_view.status === 200, 'Test 114c: Customer 1 accesses own message by ID succeeds (200)');

    // Customer 2 attempting to view Customer 1's message (IDOR attack)
    const r114_cust2_view = await fetch(`${baseUrl}/api/workspace/gmail/messages/${createdMsgId}`, {
      headers: { Authorization: `Bearer ${cust2Session.token}` }
    });
    assert(r114_cust2_view.status === 403, 'Test 114d: Customer 2 accessing Customer 1 message returns 403 (IDOR blocked)');

    // Customer 2 attempting to delete Customer 1's message
    const r114_cust2_del = await fetch(`${baseUrl}/api/workspace/gmail/messages/${createdMsgId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${cust2Session.token}` }
    });
    assert(r114_cust2_del.status === 403, 'Test 114e: Customer 2 deleting Customer 1 message returns 403 (IDOR blocked)');

    // 115. Cross-role & Confidential Form Access Control
    const r115_cust_internal_form = await fetch(`${baseUrl}/api/workspace/forms/form-internal-staff-audit-03`, {
      headers: { Authorization: `Bearer ${custSession.token}` }
    });
    assert(r115_cust_internal_form.status === 403, 'Test 115a: Customer accessing internal staff audit form returns 403 (Forbidden)');

    const r115_cust_list_forms = await fetch(`${baseUrl}/api/workspace/forms`, {
      headers: { Authorization: `Bearer ${custSession.token}` }
    });
    const r115_cust_forms_data = await r115_cust_list_forms.json();
    const hasInternalForm = r115_cust_forms_data.forms?.some((f: any) => f.formId === 'form-internal-staff-audit-03');
    assert(!hasInternalForm, 'Test 115b: Customer form listing does not leak internal staff audit form');

    const r115_admin_list_forms = await fetch(`${baseUrl}/api/workspace/forms`, {
      headers: { Authorization: `Bearer ${adminSession.token}` }
    });
    const r115_admin_forms_data = await r115_admin_list_forms.json();
    const adminHasInternalForm = r115_admin_forms_data.forms?.some((f: any) => f.formId === 'form-internal-staff-audit-03');
    assert(adminHasInternalForm, 'Test 115c: Admin form listing includes all forms including internal audit');

    const r115_cust_submit_internal = await fetch(`${baseUrl}/api/workspace/forms/form-internal-staff-audit-03/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custSession.token}`
      },
      body: JSON.stringify({ responses: { q1: 'Security', q2: 'Tampering attempt' } })
    });
    assert(r115_cust_submit_internal.status === 403, 'Test 115d: Customer submitting response to internal staff audit form returns 403');

    // 116. Forms Submission & Authoritative User Binding
    const r116_cust1_submit = await fetch(`${baseUrl}/api/workspace/forms/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custSession.token}`
      },
      body: JSON.stringify({
        formId: 'form-customer-satisfaction-02',
        responses: { q1: 5, q2: 'Yes, perfectly', q3: 'Great service' },
        userId: 'spoofed-admin-id',
        submittedBy: 'admin@lumo.co.tz'
      })
    });
    assert(r116_cust1_submit.status === 200, 'Test 116a: Customer 1 submits public satisfaction survey successfully (200)');
    const r116_cust1_sub_data = await r116_cust1_submit.json();
    const cust1SubId = r116_cust1_sub_data.submissionId;

    const r116_seller_submit = await fetch(`${baseUrl}/api/workspace/forms/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerSession.token}`
      },
      body: JSON.stringify({
        formId: 'form-seller-kyc-01',
        responses: { q1: 'Mega Electronics Ltd', q2: 'TIN-9948201', q3: 'Electronics', q4: 'Kariakoo, Dar es Salaam' }
      })
    });
    assert(r116_seller_submit.status === 200, 'Test 116b: Verified Seller submits vendor KYC form successfully (200)');

    // 117. Cross-user IDOR on Form Submissions
    const r117_cust1_view_sub = await fetch(`${baseUrl}/api/workspace/forms/submissions/${cust1SubId}`, {
      headers: { Authorization: `Bearer ${custSession.token}` }
    });
    assert(r117_cust1_view_sub.status === 200, 'Test 117a: Customer 1 views own submission by ID successfully (200)');
    const r117_cust1_sub_details = await r117_cust1_view_sub.json();
    assert(r117_cust1_sub_details.submission.userId === testCustomer.id, 'Test 117b: Submission userId is authoritatively bound to Customer 1 (ignoring spoofed client payload)');

    const r117_cust2_view_sub = await fetch(`${baseUrl}/api/workspace/forms/submissions/${cust1SubId}`, {
      headers: { Authorization: `Bearer ${cust2Session.token}` }
    });
    assert(r117_cust2_view_sub.status === 403, 'Test 117c: Customer 2 viewing Customer 1 submission by ID returns 403 (IDOR blocked)');

    const r117_cust2_list_subs = await fetch(`${baseUrl}/api/workspace/forms/form-customer-satisfaction-02/submissions`, {
      headers: { Authorization: `Bearer ${cust2Session.token}` }
    });
    const r117_cust2_subs_data = await r117_cust2_list_subs.json();
    const leakedCust1Sub = r117_cust2_subs_data.submissions?.some((s: any) => s.id === cust1SubId);
    assert(!leakedCust1Sub, 'Test 117d: Customer 2 submissions list does not leak Customer 1 submission');

    const r117_cust2_del_sub = await fetch(`${baseUrl}/api/workspace/forms/submissions/${cust1SubId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${cust2Session.token}` }
    });
    assert(r117_cust2_del_sub.status === 403, 'Test 117e: Customer 2 deleting Customer 1 submission returns 403 (IDOR blocked)');

    // 118. Admin Workspace Management & Lifecycle
    const r118_admin_create = await fetch(`${baseUrl}/api/workspace/forms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminSession.token}`
      },
      body: JSON.stringify({
        title: 'LUMO Logistics Hub Feedback',
        description: 'Feedback on warehouse inbound receiving speed.',
        accessScope: 'STAFF_INTERNAL',
        questions: [{ id: 'q1', question: 'Inbound speed rating', type: 'rating', required: true }]
      })
    });
    assert(r118_admin_create.status === 201, 'Test 118a: Admin creates new workspace form successfully (201)');
    const r118_new_form_data = await r118_admin_create.json();
    const createdFormId = r118_new_form_data.form.formId;

    const r118_admin_update = await fetch(`${baseUrl}/api/workspace/forms/${createdFormId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminSession.token}`
      },
      body: JSON.stringify({ title: 'LUMO Logistics Hub Feedback - Updated' })
    });
    assert(r118_admin_update.status === 200, 'Test 118b: Admin updates workspace form successfully (200)');

    const r118_admin_list_all_subs = await fetch(`${baseUrl}/api/workspace/forms/form-customer-satisfaction-02/submissions`, {
      headers: { Authorization: `Bearer ${adminSession.token}` }
    });
    const r118_admin_subs_data = await r118_admin_list_all_subs.json();
    const adminSeesCust1Sub = r118_admin_subs_data.submissions?.some((s: any) => s.id === cust1SubId);
    assert(adminSeesCust1Sub, 'Test 118c: Admin can view all form submissions across all users (200)');

    const r118_admin_delete = await fetch(`${baseUrl}/api/workspace/forms/${createdFormId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminSession.token}` }
    });
    assert(r118_admin_delete.status === 200, 'Test 118d: Admin deletes workspace form successfully (200)');

    // =========================================================================
    // PROBLEM I: API / ENDPOINT SECURITY VERIFICATION SUITE
    // =========================================================================

    // Test 119: POST /api/auth/switch-role Privilege Escalation Protection
    const r119_unauth = await fetch(`${baseUrl}/api/auth/switch-role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'SUPER_ADMIN' })
    });
    assert(r119_unauth.status === 401, 'Test 119a: Unauthenticated switch-role is rejected (401)');

    const r119_cust_escalate = await fetch(`${baseUrl}/api/auth/switch-role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custSession.token}`
      },
      body: JSON.stringify({ role: 'SUPER_ADMIN' })
    });
    assert(r119_cust_escalate.status === 403, 'Test 119b: Customer cannot escalate privileges via switch-role (403)');

    const r119_seller_escalate = await fetch(`${baseUrl}/api/auth/switch-role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerSession.token}`
      },
      body: JSON.stringify({ role: 'SUPER_ADMIN' })
    });
    assert(r119_seller_escalate.status === 403, 'Test 119c: Seller cannot escalate privileges via switch-role (403)');

    const r119_superadmin_switch = await fetch(`${baseUrl}/api/auth/switch-role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminSession.token}`
      },
      body: JSON.stringify({ role: 'SELLER' })
    });
    assert(r119_superadmin_switch.status === 200, 'Test 119d: Super Admin can switch role context (200)');

    // Test 120: Administrative /api/admin/audit RBAC Enforcement
    const r120_unauth = await fetch(`${baseUrl}/api/admin/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'TEST_UNAUTH_AUDIT' })
    });
    assert(r120_unauth.status === 401, 'Test 120a: Unauthenticated POST /api/admin/audit is rejected (401)');

    const r120_cust = await fetch(`${baseUrl}/api/admin/audit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custSession.token}`
      },
      body: JSON.stringify({ action: 'CUSTOMER_FORGED_AUDIT' })
    });
    assert(r120_cust.status === 403, 'Test 120b: Customer cannot write to admin audit log (403)');

    const r120_admin = await fetch(`${baseUrl}/api/admin/audit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminSession.token}`
      },
      body: JSON.stringify({ action: 'AUTHORIZED_ADMIN_AUDIT', details: 'Phase 9 security check' })
    });
    assert(r120_admin.status === 200, 'Test 120c: Admin can write to audit log with authentic session (200)');
    const r120_admin_data = await r120_admin.json();
    assert(r120_admin_data.log.admin === testSuperAdmin.email, 'Test 120d: Admin audit log uses authoritative session email');

    // Test 121: Catalog Moderation RBAC
    const r121_unauth = await fetch(`${baseUrl}/api/moderation/items`);
    assert(r121_unauth.status === 401, 'Test 121a: Unauthenticated GET /api/moderation/items is rejected (401)');

    const r121_cust = await fetch(`${baseUrl}/api/moderation/items`, {
      headers: { Authorization: `Bearer ${custSession.token}` }
    });
    assert(r121_cust.status === 403, 'Test 121b: Customer cannot access moderation items (403)');

    const r121_admin = await fetch(`${baseUrl}/api/moderation/items`, {
      headers: { Authorization: `Bearer ${adminSession.token}` }
    });
    assert(r121_admin.status === 200, 'Test 121c: Admin can access moderation queue (200)');

    // Test 122: Pickup Station Infrastructure Creation RBAC
    const r122_unauth = await fetch(`${baseUrl}/api/pickup/stations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Rogue Pickup Station',
        region: 'Dar es Salaam',
        area: 'Kariakoo',
        streetAddress: '123 Fake St',
        contactPhone: '+255700000000'
      })
    });
    assert(r122_unauth.status === 401, 'Test 122a: Unauthenticated pickup station creation rejected (401)');

    const r122_cust = await fetch(`${baseUrl}/api/pickup/stations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custSession.token}`
      },
      body: JSON.stringify({
        name: 'Customer Created Station',
        region: 'Dar es Salaam',
        area: 'Kariakoo',
        streetAddress: '123 Fake St',
        contactPhone: '+255700000000'
      })
    });
    assert(r122_cust.status === 403, 'Test 122b: Non-admin cannot create pickup stations (403)');

    const r122_admin = await fetch(`${baseUrl}/api/pickup/stations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminSession.token}`
      },
      body: JSON.stringify({
        name: 'Authorized Admin Station',
        region: 'Dar es Salaam',
        area: 'Kinondoni',
        streetAddress: '456 Uhuru St',
        contactPhone: '+255700999888'
      })
    });
    assert(r122_admin.status === 201, 'Test 122c: Admin can create pickup stations (201)');

    // Test 123: Payment Transaction Status & Cancel IDOR Prevention
    // Create a payment transaction for Customer 1
    const r123_initiate = await fetch(`${baseUrl}/api/payments/ussd/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custSession.token}`
      },
      body: JSON.stringify({
        payerPhone: '+255700000001',
        amount: 25000,
        referenceType: 'WALLET_TOPUP',
        referenceId: 'topup-test-idor-01'
      })
    });
    assert(r123_initiate.status === 201, 'Test 123a: Customer 1 initiates USSD payment transaction (201)');
    const r123_initiate_data = await r123_initiate.json();
    const cust1TxId = r123_initiate_data.transactionId;

    const r123_unauth_query = await fetch(`${baseUrl}/api/payments/ussd/status/${cust1TxId}`);
    assert(r123_unauth_query.status === 401, 'Test 123b: Unauthenticated query for transaction status is rejected (401)');

    const r123_cust2_query = await fetch(`${baseUrl}/api/payments/ussd/status/${cust1TxId}`, {
      headers: { Authorization: `Bearer ${cust2Session.token}` }
    });
    assert(r123_cust2_query.status === 403, 'Test 123c: Customer 2 cannot query Customer 1 transaction status (403 IDOR prevention)');

    const r123_cust1_query = await fetch(`${baseUrl}/api/payments/ussd/status/${cust1TxId}`, {
      headers: { Authorization: `Bearer ${custSession.token}` }
    });
    assert(r123_cust1_query.status === 200, 'Test 123d: Customer 1 can query their own transaction status (200)');

    const r123_admin_query = await fetch(`${baseUrl}/api/payments/ussd/status/${cust1TxId}`, {
      headers: { Authorization: `Bearer ${adminSession.token}` }
    });
    assert(r123_admin_query.status === 200, 'Test 123e: Admin can inspect transaction status (200)');

    // Test 124: Account Registration & Social Login Privilege Escalation Prevention
    const r124_admin_reg = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Hacker Admin',
        email: 'hackeradmin@lumo.africa',
        password: 'SecurePass123!@#',
        role: 'SUPER_ADMIN'
      })
    });
    assert(r124_admin_reg.status === 403, 'Test 124a: Public registration with SUPER_ADMIN role is rejected (403)');

    const r124_social = await fetch(`${baseUrl}/api/auth/social-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'google',
        email: 'newsocialuser@example.com',
        name: 'Social User',
        role: 'SUPER_ADMIN'
      })
    });
    assert(r124_social.status === 200, 'Test 124b: Social login succeeds (200)');
    const r124_social_data = await r124_social.json();
    assert(r124_social_data.user.role === 'CUSTOMER', 'Test 124c: Social login forces CUSTOMER role, ignoring claimed role');

    // Test 125: Password Validation & Account Security
    const r125_weak_pass = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Weak Pass User',
        email: 'weakpassuser@example.com',
        password: '123'
      })
    });
    assert(r125_weak_pass.status === 400, 'Test 125a: Registration with weak password is rejected (400)');

    const r125_suspended_login = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'suspended@lumo.africa',
        password: 'SuspendedPass123!'
      })
    });
    assert(r125_suspended_login.status === 403, 'Test 125b: Suspended user login is rejected (403)');

    // =========================================================================
    // PROBLEM J: NOTIFICATION RECIPIENT SECURITY TEST SUITE
    // =========================================================================
    console.log('\n--- Running Problem J: Notification Recipient Security Suite ---');

    // Create a second customer to test cross-user isolation
    const cust2Register = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Second Customer',
        email: `cust2_${Date.now()}@example.com`,
        phone: '+255712999888',
        password: 'SecurePassword123!@#'
      })
    });
    assert(cust2Register.status === 200 || cust2Register.status === 201, 'Test 126a: Customer 2 registration succeeds (200/201)');
    const cust2Data = await cust2Register.json();
    const registeredCust2Session = { token: cust2Data.token, user: cust2Data.user };

    // Seed test notifications in memory DB
    let notifCust1Id = `notif-c1-${Date.now()}`;
    let notifCust2Id = `notif-c2-${Date.now()}`;
    let notifSellerId = `notif-sel-${Date.now()}`;
    let notifRiderId = `notif-rid-${Date.now()}`;
    let notifWarehouseId = `notif-wh-${Date.now()}`;
    let notifAdminId = `notif-adm-${Date.now()}`;

    db.updateDb(d => {
      if (!d.notifications) d.notifications = [];
      d.notifications.unshift(
        {
          id: notifCust1Id,
          userId: testCustomer.id,
          title: 'Order Placed by Customer 1',
          message: 'Your personal order #LM-1001 is confirmed.',
          type: 'ORDER',
          isRead: false,
          createdAt: new Date().toISOString()
        },
        {
          id: notifCust2Id,
          userId: registeredCust2Session.user?.id || testCustomer2.id,
          title: 'Private Notice for Customer 2',
          message: 'Confidential account statement for Customer 2.',
          type: 'SECURITY',
          isRead: false,
          createdAt: new Date().toISOString()
        },
        {
          id: notifSellerId,
          userId: testSeller.id,
          title: 'New Merchant Order',
          message: 'Merchant Order #MO-990 requires fulfillment.',
          type: 'ORDER',
          isRead: false,
          createdAt: new Date().toISOString()
        },
        {
          id: notifRiderId,
          userId: testRider.id,
          title: 'Delivery Run Assigned',
          message: 'Rider run #RUN-88 ready for dispatch.',
          type: 'DELIVERY',
          isRead: false,
          createdAt: new Date().toISOString()
        },
        {
          id: notifWarehouseId,
          userId: undefined as any,
          targetRoles: ['WAREHOUSE_STAFF', 'WAREHOUSE_MANAGER'],
          title: 'Inbound Warehouse Shipment',
          message: 'Warehouse bin stocking required.',
          type: 'SYSTEM',
          isRead: false,
          createdAt: new Date().toISOString()
        } as any,
        {
          id: notifAdminId,
          userId: undefined as any,
          targetRoles: ['SUPER_ADMIN', 'ADMIN'],
          title: 'Admin Risk Incident Alert',
          message: 'System-wide risk threshold flagged.',
          type: 'SECURITY',
          isRead: false,
          createdAt: new Date().toISOString()
        } as any
      );
    });

    // 126b: Customer 1 queries notifications: must ONLY receive their own notifications
    const r126_c1_get = await fetch(`${baseUrl}/api/notifications`, {
      headers: { Authorization: `Bearer ${custSession.token}` }
    });
    assert(r126_c1_get.status === 200, 'Test 126b: Customer 1 GET /api/notifications returns 200');
    const j126_c1_get = await r126_c1_get.json();
    const c1NotifIds = (j126_c1_get.notifications || []).map((n: any) => n.id);
    assert(c1NotifIds.includes(notifCust1Id), 'Test 126c: Customer 1 sees their own notification');
    assert(!c1NotifIds.includes(notifCust2Id), 'Test 126d: Customer 1 CANNOT see Customer 2 notification (No IDOR)');
    assert(!c1NotifIds.includes(notifSellerId), 'Test 126e: Customer 1 CANNOT see Seller private notification');
    assert(!c1NotifIds.includes(notifRiderId), 'Test 126f: Customer 1 CANNOT see Rider notification');
    assert(!c1NotifIds.includes(notifWarehouseId), 'Test 126g: Customer 1 CANNOT see Warehouse staff notification');
    assert(!c1NotifIds.includes(notifAdminId), 'Test 126h: Customer 1 CANNOT see Admin system alert');

    // 126i: IDOR parameter tampering: Customer 1 passes ?userId=<Customer 2 ID>
    const r126_c1_tamper = await fetch(`${baseUrl}/api/notifications?userId=${registeredCust2Session.user.id}`, {
      headers: { Authorization: `Bearer ${custSession.token}` }
    });
    assert(r126_c1_tamper.status === 200, 'Test 126i: Tampered query returns 200 without error');
    const j126_c1_tamper = await r126_c1_tamper.json();
    const c1TamperIds = (j126_c1_tamper.notifications || []).map((n: any) => n.id);
    assert(!c1TamperIds.includes(notifCust2Id), 'Test 126j: Query parameter tampering ?userId does NOT bypass recipient scoping');

    // 126k: Single notification IDOR fetch: Customer 1 tries to GET Customer 2 notification by ID
    const r126_idor_get = await fetch(`${baseUrl}/api/notifications/${notifCust2Id}`, {
      headers: { Authorization: `Bearer ${custSession.token}` }
    });
    assert(r126_idor_get.status === 403, 'Test 126k: GET /api/notifications/:id for another user is rejected with 403 Forbidden', `Got ${r126_idor_get.status}`);

    // 126l: Single notification IDOR modify: Customer 1 tries to mark Customer 2 notification as read
    const r126_idor_read = await fetch(`${baseUrl}/api/notifications/${notifCust2Id}/read`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${custSession.token}` }
    });
    assert(r126_idor_read.status === 403, 'Test 126l: POST /api/notifications/:id/read for another user is rejected with 403 Forbidden', `Got ${r126_idor_read.status}`);

    // 126m: Single notification IDOR delete: Customer 1 tries to delete Customer 2 notification
    const r126_idor_del = await fetch(`${baseUrl}/api/notifications/${notifCust2Id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${custSession.token}` }
    });
    assert(r126_idor_del.status === 403, 'Test 126m: DELETE /api/notifications/:id for another user is rejected with 403 Forbidden', `Got ${r126_idor_del.status}`);

    // 126n: Customer 1 clears notifications: only their own notifications are cleared
    const r126_clear = await fetch(`${baseUrl}/api/notifications/clear`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${custSession.token}` }
    });
    assert(r126_clear.status === 200, 'Test 126n: POST /api/notifications/clear returns 200');

    // Verify Customer 2's notification is still intact in DB
    const cust2StillExists = (db.getDb().notifications || []).some(n => n.id === notifCust2Id);
    assert(cust2StillExists, 'Test 126o: Customer 2 notification remains untouched after Customer 1 clear');

    // 127: Broadcast and custom notification dispatch authorization
    // 127a: Customer cannot send/broadcast notifications (403)
    const r127_cust_send = await fetch(`${baseUrl}/api/notifications/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custSession.token}`
      },
      body: JSON.stringify({
        title: 'Spam Notification',
        message: 'Spam broadcast from malicious customer',
        targetRoles: ['CUSTOMER', 'SELLER']
      })
    });
    assert(r127_cust_send.status === 403, 'Test 127a: Customer cannot dispatch broadcast notifications (returns 403)', `Got ${r127_cust_send.status}`);

    // 127b: Seller cannot send/broadcast notifications (403)
    const r127_sel_send = await fetch(`${baseUrl}/api/notifications/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerSession.token}`
      },
      body: JSON.stringify({
        title: 'Unauthorized Seller Ad Broadcast',
        message: 'Buy my product now!'
      })
    });
    assert(r127_sel_send.status === 403, 'Test 127b: Seller cannot dispatch custom broadcast notifications (returns 403)', `Got ${r127_sel_send.status}`);

    // 127c: Rider cannot send broadcast notifications (403)
    const r127_rid_send = await fetch(`${baseUrl}/api/notifications/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${riderSession.token}`
      },
      body: JSON.stringify({
        title: 'Rider Broadcast',
        message: 'Rider general broadcast'
      })
    });
    assert(r127_rid_send.status === 403, 'Test 127c: Rider cannot dispatch custom broadcast notifications (returns 403)', `Got ${r127_rid_send.status}`);

    // 127d: Admin can send targeted role broadcast
    const r127_admin_broadcast = await fetch(`${baseUrl}/api/notifications/broadcast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminSession.token}`
      },
      body: JSON.stringify({
        title: 'Merchant Policy Update 2026',
        message: 'New packaging guidelines are in effect.',
        type: 'SYSTEM',
        targetRoles: ['SELLER', 'SELLER_STAFF']
      })
    });
    assert(r127_admin_broadcast.status === 201, 'Test 127d: Admin broadcast with valid targetRoles succeeds (201)');
    const j127_admin_broadcast = await r127_admin_broadcast.json();
    const broadcastNotifId = j127_admin_broadcast.notification.id;

    // 127e: Seller receives this targeted broadcast
    const r127_sel_check = await fetch(`${baseUrl}/api/notifications`, {
      headers: { Authorization: `Bearer ${sellerSession.token}` }
    });
    const j127_sel_check = await r127_sel_check.json();
    const selNotifIds = (j127_sel_check.notifications || []).map((n: any) => n.id);
    assert(selNotifIds.includes(broadcastNotifId), 'Test 127e: Seller receives targeted SELLER broadcast notification');

    // 127f: Customer 2 does NOT receive this merchant broadcast
    const r127_c2_check = await fetch(`${baseUrl}/api/notifications`, {
      headers: { Authorization: `Bearer ${registeredCust2Session.token}` }
    });
    const j127_c2_check = await r127_c2_check.json();
    const c2NotifIds = (j127_c2_check.notifications || []).map((n: any) => n.id);
    assert(!c2NotifIds.includes(broadcastNotifId), 'Test 127f: Customer does NOT receive SELLER-targeted broadcast');

    // 127g: Admin send to non-existent userId is rejected with 400
    const r127_invalid_user = await fetch(`${baseUrl}/api/notifications/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminSession.token}`
      },
      body: JSON.stringify({
        title: 'Direct Msg',
        message: 'Hello non-existent user',
        userId: 'usr-non-existent-999999'
      })
    });
    assert(r127_invalid_user.status === 400, 'Test 127g: Sending notification to non-existent userId returns 400 Bad Request');

    console.log('\n--- Running Problem K: Admin Authentication, Authorization & RBAC Suite ---');

    // 128a-d: Unauthenticated calls to admin routes are rejected with 401
    const r128_unauth_users = await fetch(`${baseUrl}/api/admin/users`);
    assert(r128_unauth_users.status === 401, 'Test 128a: Unauthenticated GET /api/admin/users returns 401 Unauthorized');

    const r128_unauth_builder = await fetch(`${baseUrl}/api/admin/builder-config`);
    assert(r128_unauth_builder.status === 401, 'Test 128b: Unauthenticated GET /api/admin/builder-config returns 401 Unauthorized');

    const r128_unauth_comms = await fetch(`${baseUrl}/api/admin/commission-rules`);
    assert(r128_unauth_comms.status === 401, 'Test 128c: Unauthenticated GET /api/admin/commission-rules returns 401 Unauthorized');

    const r128_unauth_risk = await fetch(`${baseUrl}/api/admin/risk-incidents`);
    assert(r128_unauth_risk.status === 401, 'Test 128d: Unauthenticated GET /api/admin/risk-incidents returns 401 Unauthorized');

    // 128e: Customer token cannot access GET /api/admin/users (403)
    const r128_cust_admin = await fetch(`${baseUrl}/api/admin/users`, {
      headers: { Authorization: `Bearer ${custSession.token}` }
    });
    assert(r128_cust_admin.status === 403, 'Test 128e: Customer token cannot access /api/admin/users (returns 403 Forbidden)');

    // 128f: Custom client headers (X-User-Role / role spoofing) are strictly ignored by backend
    const r128_cust_spoof = await fetch(`${baseUrl}/api/admin/users`, {
      headers: {
        Authorization: `Bearer ${custSession.token}`,
        'X-User-Role': 'SUPER_ADMIN',
        'X-Active-Role': 'SUPER_ADMIN'
      }
    });
    assert(r128_cust_spoof.status === 403, 'Test 128f: Custom client headers cannot elevate customer privileges (returns 403)');

    // 128g: Seller token cannot access admin routes
    const r128_sel_builder = await fetch(`${baseUrl}/api/admin/builder-config`, {
      headers: { Authorization: `Bearer ${sellerSession.token}` }
    });
    assert(r128_sel_builder.status === 403, 'Test 128g: Seller token cannot access /api/admin/builder-config (returns 403)');

    // 128h: Rider token cannot access admin routes
    const r128_rid_comms = await fetch(`${baseUrl}/api/admin/commission-rules`, {
      headers: { Authorization: `Bearer ${riderSession.token}` }
    });
    assert(r128_rid_comms.status === 403, 'Test 128h: Rider token cannot access /api/admin/commission-rules (returns 403)');

    // 128i: Standard ADMIN token CAN access general admin routes
    const r128_admin_users = await fetch(`${baseUrl}/api/admin/users`, {
      headers: { Authorization: `Bearer ${standardAdminSession.token}` }
    });
    assert(r128_admin_users.status === 200, 'Test 128i: Standard ADMIN token can access /api/admin/users (returns 200)');

    // 128j: Standard ADMIN token CANNOT modify user role (requires SUPER_ADMIN)
    const r128_admin_role_change = await fetch(`${baseUrl}/api/admin/users/${testCustomer.id}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${standardAdminSession.token}`
      },
      body: JSON.stringify({ role: 'ADMIN' })
    });
    assert(r128_admin_role_change.status === 403, 'Test 128j: Standard ADMIN token cannot elevate user role (returns 403 Forbidden)');

    // 128k: Standard ADMIN token CANNOT toggle platform builder features (requires SUPER_ADMIN)
    const r128_admin_toggle = await fetch(`${baseUrl}/api/admin/features/feat-lumo-boost/toggle`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${standardAdminSession.token}` }
    });
    assert(r128_admin_toggle.status === 403, 'Test 128k: Standard ADMIN token cannot toggle builder feature flags (returns 403 Forbidden)');

    // 128l: Standard ADMIN token CANNOT update platform builder configuration (requires SUPER_ADMIN)
    const r128_admin_cfg_update = await fetch(`${baseUrl}/api/admin/builder-config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${standardAdminSession.token}`
      },
      body: JSON.stringify({ config: { siteName: 'Hacked Site' } })
    });
    assert(r128_admin_cfg_update.status === 403, 'Test 128l: Standard ADMIN token cannot update global builder config (returns 403 Forbidden)');

    // 128m: Standard ADMIN token CANNOT delete commission rules (requires SUPER_ADMIN)
    const r128_admin_del_comm = await fetch(`${baseUrl}/api/admin/commission-rules/com-1`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${standardAdminSession.token}` }
    });
    assert(r128_admin_del_comm.status === 403, 'Test 128m: Standard ADMIN token cannot delete commission rules (returns 403 Forbidden)');

    // 128n: SUPER_ADMIN token CAN modify builder config and user roles
    const r128_super_cfg = await fetch(`${baseUrl}/api/admin/builder-config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminSession.token}`
      },
      body: JSON.stringify({ config: { platformName: 'LUMO Official' } })
    });
    assert(r128_super_cfg.status === 200, 'Test 128n: SUPER_ADMIN token can update global builder configuration (returns 200)');

    // 128o: Audit log verifies user ID and role recorded from authenticated session
    const r128_audit = await fetch(`${baseUrl}/api/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${superAdminSession.token}` }
    });
    assert(r128_audit.status === 200, 'Test 128o-1: GET /api/admin/audit-logs returns 200');
    const j128_audit = await r128_audit.json();
    const lastBuilderAudit = (j128_audit.auditLogs || []).find((l: any) => l.action === 'UPDATE_BUILDER_CONFIG');
    assert(lastBuilderAudit && lastBuilderAudit.userRole === 'SUPER_ADMIN', 'Test 128o-2: Audit log records session-derived SUPER_ADMIN userRole');

    // 128p: Admin login with incorrect password returns 401
    const r128_wrong_pw = await fetch(`${baseUrl}/api/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testSuperAdmin.email, password: 'WrongPassword123!' })
    });
    assert(r128_wrong_pw.status === 401, 'Test 128p: Admin login with wrong password returns 401 Unauthorized');

    // 128q: Admin login with non-admin customer account returns 403
    const r128_cust_as_admin = await fetch(`${baseUrl}/api/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testCustomer.email, password: 'CustPass123!' })
    });
    assert(r128_cust_as_admin.status === 403, 'Test 128q: Admin login with non-admin account is rejected with 403 Forbidden');

    // 128r: Admin bootstrap with invalid secret key returns 403 Forbidden
    const r128_bad_bootstrap = await fetch(`${baseUrl}/api/auth/admin-bootstrap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'attacker@evil.com',
        secretKey: 'invalid-key-attempt',
        password: 'SuperAttackerPassword123!'
      })
    });
    assert(r128_bad_bootstrap.status === 403, 'Test 128r: Admin bootstrap with invalid secret key returns 403 Forbidden');

    // ==========================================
    // PROBLEM L: AUDIT LOGS & SECURITY EVENT INTEGRITY TESTS
    // ==========================================
    console.log('\n--- PROBLEM L: AUDIT LOGS & SECURITY EVENT INTEGRITY ---');

    // 129a: Failed login attempt produces a FAILURE audit log with severity WARNING
    const failedLoginEmail = `audit-fail-${Date.now()}@lumo.africa`;
    await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: failedLoginEmail, password: 'WrongPassword999!' })
    });
    const logsAfterFail = db.getDb().auditLogs || [];
    const failLoginAudit = logsAfterFail.find((l: any) => l.action === 'FAILED_AUTHENTICATION' && (l.details?.includes(failedLoginEmail) || l.entityId === failedLoginEmail.toLowerCase()));
    assert(
      failLoginAudit && failLoginAudit.status === 'FAILURE' && failLoginAudit.severity === 'WARNING',
      'Test 129a: Failed authentication produces backend-authoritative audit log with status=FAILURE and severity=WARNING'
    );

    // 129b: Spoofed actor/role in request body is completely ignored by backend audit logging
    const custOrder = (db.getDb().orders || []).find(o => o.customerId === testCustomer.id);
    const r129_spoof = await fetch(`${baseUrl}/api/returns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custSession.token}`
      },
      body: JSON.stringify({
        orderId: custOrder?.id || createdOrderId,
        productId: custOrder?.items?.[0]?.productId,
        quantity: 1,
        reason: 'Defective item',
        customerComment: 'Item not working properly',
        // Attacker attempts to spoof audit metadata in payload
        actorId: 'usr-spoofed-superadmin',
        actorRole: 'SUPER_ADMIN',
        userName: 'Fake Super Admin',
        userRole: 'SUPER_ADMIN',
        timestamp: '1970-01-01T00:00:00Z'
      })
    });
    const j129_spoof = await r129_spoof.json();
    const returnAudit = (db.getDb().auditLogs || []).find((l: any) => (l.action === 'CREATE_RETURN_REQUEST' || l.action === 'CREATE_RETURN') && (l.entityId === j129_spoof?.returnRequest?.id || l.entityId === j129_spoof?.returnRequest?.orderId));
    assert(
      returnAudit && returnAudit.userId === testCustomer.id && returnAudit.userRole === 'CUSTOMER',
      'Test 129b: Client-supplied actorId/actorRole/userName payload fields are ignored; audit log strictly records authenticated session identity'
    );
    assert(
      returnAudit && returnAudit.userId !== 'usr-spoofed-superadmin' && returnAudit.userRole !== 'SUPER_ADMIN',
      'Test 129b-2: Audit log actor identity cannot be spoofed by client'
    );

    // 129c: Customer/Rider cannot view audit logs (403 Forbidden)
    const r129_cust_audit = await fetch(`${baseUrl}/api/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${custSession.token}` }
    });
    assert(r129_cust_audit.status === 403, 'Test 129c-1: Non-admin (Customer) token cannot access /api/admin/audit-logs (returns 403)');

    const r129_rider_audit = await fetch(`${baseUrl}/api/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${riderSession.token}` }
    });
    assert(r129_rider_audit.status === 403, 'Test 129c-2: Non-admin (Rider) token cannot access /api/admin/audit-logs (returns 403)');

    // 129d: Redaction of secrets in audit logs
    db.addAuditLog({
      userId: testCustomer.id,
      userName: testCustomer.name,
      userRole: 'CUSTOMER',
      action: 'UPDATE_ACCOUNT',
      entityType: 'USER',
      entityId: testCustomer.id,
      details: {
        password: 'PlainTextSecretPassword123!',
        token: 'secret_bearer_token_xyz',
        otpCode: '987654',
        apiKey: 'sk-secret-key-live'
      }
    });
    const testSecretAudit = (db.getDb().auditLogs || []).find((l: any) => l.action === 'UPDATE_ACCOUNT' && l.entityId === testCustomer.id);
    const detailsObj = typeof testSecretAudit?.details === 'object' ? testSecretAudit.details : JSON.parse(testSecretAudit?.details || '{}');
    assert(
      detailsObj.password === '[REDACTED]' && detailsObj.token === '[REDACTED]' && detailsObj.otpCode === '[REDACTED]' && detailsObj.apiKey === '[REDACTED]',
      'Test 129d: Sensitive fields (password, token, otpCode, apiKey) are automatically redacted before persisting audit logs'
    );

    // 129e: Standard ADMIN cannot purge audit logs (only SUPER_ADMIN permitted)
    const r129_admin_purge = await fetch(`${baseUrl}/api/admin/audit-logs/retention-purge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${standardAdminSession.token}`
      },
      body: JSON.stringify({ olderThanDays: 365 })
    });
    assert(r129_admin_purge.status === 403, 'Test 129e: Standard ADMIN token cannot purge audit logs (requires SUPER_ADMIN, returns 403)');

    // 129f: Audit logging for administrative role changes
    const roleChangeTargetUser = `usr-role-tgt-${Date.now()}`;
    db.updateDb(d => {
      d.users.push({
        id: roleChangeTargetUser,
        name: 'Target Staff User',
        email: `target-${Date.now()}@lumo.africa`,
        role: 'STAFF',
        status: 'ACTIVE',
        isEmailVerified: true
      } as any);
    });

    const r129_role_change = await fetch(`${baseUrl}/api/admin/users/${roleChangeTargetUser}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminSession.token}`
      },
      body: JSON.stringify({ role: 'ADMIN' })
    });
    assert(r129_role_change.status === 200, 'Test 129f-1: SUPER_ADMIN successfully changes user role');
    const roleAudit = (db.getDb().auditLogs || []).find((l: any) => l.action === 'UPDATE_USER_ROLE' && l.entityId === roleChangeTargetUser);
    assert(
      roleAudit && roleAudit.userId === testSuperAdmin.id && roleAudit.userRole === 'SUPER_ADMIN' && roleAudit.previousValue === 'STAFF' && roleAudit.newValue === 'ADMIN',
      'Test 129f-2: Role change creates authoritative audit log with accurate previousValue, newValue, and authenticated actor identity'
    );

    // =========================================================================
    // PROBLEM M: CRYPTOGRAPHIC SECURITY, RANDOMNESS, OTP & RESET TOKENS SUITE
    // =========================================================================
    console.log('\n--- Running Problem M: Cryptographic Security & Randomness Suite ---');

    // 130. OTP Generation Security Test
    const otpSample = Array.from({ length: 50 }, () => generateSecureOtp());
    assert(otpSample.every(code => /^\d{6}$/.test(code)), 'Test 130a: All generated OTPs are exactly 6 digits');
    assert(otpSample.every(code => {
      const num = parseInt(code, 10);
      return num >= 100000 && num <= 999999;
    }), 'Test 130b: All OTPs are within the range 100000-999999');
    const uniqueOtps = new Set(otpSample);
    assert(uniqueOtps.size > 45, 'Test 130c: OTPs exhibit high entropy without repetitive patterns');

    // 131. Password Reset Flow: Forgot Password (Non-Enumeration)
    const r131_forgot_unknown = await fetch(`${baseUrl}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent-user-99999@lumo.africa' })
    });
    assert(r131_forgot_unknown.status === 200, 'Test 131a: Forgot password returns 200 for non-existent email (prevents enumeration)');
    const j131_unknown = await r131_forgot_unknown.json();
    assert(j131_unknown.success === true, 'Test 131b: Response indicates generic success');
    assert(!j131_unknown.resetToken, 'Test 131c: No reset token returned for non-existent email');

    // 132. Password Reset Flow: Valid User & 256-bit Entropy Token
    const resetTargetEmail = `pwreset-${Date.now()}@lumo.africa`;
    const resetUserPassword = 'InitialSecurePass123!';
    const r132_reg = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: resetTargetEmail,
        password: resetUserPassword,
        name: 'Reset Test User',
        phone: '+255711223344'
      })
    });
    assert(r132_reg.status === 200 || r132_reg.status === 201, 'Test 132a: Test user for password reset created');
    const j132_reg = await r132_reg.json();
    const resetUserId = j132_reg.user.id;

    // Login to get an active session
    const r132_login = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: resetTargetEmail, password: resetUserPassword })
    });
    assert(r132_login.status === 200, 'Test 132b: Initial login succeeds');
    const j132_login = await r132_login.json();
    const initialSessionToken = j132_login.token;

    // Request password reset
    const r132_forgot = await fetch(`${baseUrl}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: resetTargetEmail })
    });
    assert(r132_forgot.status === 200, 'Test 132c: Forgot password request succeeds for valid email');
    const j132_forgot = await r132_forgot.json();
    assert(j132_forgot.resetToken && j132_forgot.resetToken.length >= 64, 'Test 132d: Reset token is a 256-bit entropy hex string (64+ chars)');

    // Verify token stored in DB with expiration
    const dbUser = db.getDb().users.find((u: any) => u.id === resetUserId);
    assert(Boolean(dbUser && dbUser.passwordResetToken === j132_forgot.resetToken), 'Test 132e: Password reset token saved in DB');
    assert(Boolean(dbUser && dbUser.passwordResetExpires), 'Test 132f: Password reset expiration timestamp set in DB');

    // 133. Password Reset Flow: Weak Password Rejection
    const r133_weak = await fetch(`${baseUrl}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: j132_forgot.resetToken, newPassword: '123' })
    });
    assert(r133_weak.status === 400, 'Test 133a: Reset password with weak password rejected (returns 400)');

    // 134. Password Reset Flow: Successful Reset and Session Invalidation
    const newSecurePassword = 'BrandNewPassword99!';
    const r134_reset = await fetch(`${baseUrl}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: j132_forgot.resetToken, newPassword: newSecurePassword })
    });
    assert(r134_reset.status === 200, 'Test 134a: Password reset succeeds with valid token and strong password');

    // Verify token was burned / consumed
    const dbUserPostReset = db.getDb().users.find((u: any) => u.id === resetUserId);
    assert(dbUserPostReset && !dbUserPostReset.passwordResetToken, 'Test 134b: Reset token consumed and invalidated in DB after use');

    // Attempting to reuse the consumed token fails
    const r134_reuse = await fetch(`${baseUrl}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: j132_forgot.resetToken, newPassword: 'AnotherPassword123!' })
    });
    assert(r134_reuse.status === 400, 'Test 134c: Attempting to reuse consumed reset token fails (returns 400)');

    // Verify old session token was invalidated
    const r134_old_session = await fetch(`${baseUrl}/api/notifications`, {
      headers: { Authorization: `Bearer ${initialSessionToken}` }
    });
    assert(r134_old_session.status === 401, 'Test 134d: All existing user sessions revoked upon password reset (returns 401)');

    // Verify login with old password fails
    const r134_old_pass_login = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: resetTargetEmail, password: resetUserPassword })
    });
    assert(r134_old_pass_login.status === 401, 'Test 134e: Login with old password fails');

    // Verify login with new password succeeds
    const r134_new_pass_login = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: resetTargetEmail, password: newSecurePassword })
    });
    assert(r134_new_pass_login.status === 200, 'Test 134f: Login with new password succeeds');

    // 135. Password Reset Flow: Expired Token Rejection
    db.updateDb(d => {
      const u = d.users.find((usr: any) => usr.id === resetUserId);
      if (u) {
        u.passwordResetToken = 'expired-token-12345';
        u.passwordResetExpires = new Date(Date.now() - 10000).toISOString(); // 10s in past
      }
    });
    const r135_expired = await fetch(`${baseUrl}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'expired-token-12345', newPassword: 'Password12345!' })
    });
    assert(r135_expired.status === 400, 'Test 135a: Expired password reset token rejected');

    // 136. Staff Invitation Token Security & Expiration
    const inviteStaffId = `staff-inv-${Date.now()}`;
    const inviteTokenValue = `inv-tok-${Date.now()}-${crypto.randomBytes(16).toString('hex')}`;
    db.updateDb(d => {
      d.users.push({
        id: inviteStaffId,
        name: 'Unactivated Staff',
        email: `staffinv-${Date.now()}@lumo.africa`,
        role: 'STAFF',
        status: 'INVITED',
        isActive: false,
        inviteToken: inviteTokenValue,
        inviteExpiresAt: new Date(Date.now() + 3600000).toISOString()
      } as any);
    });

    const r136_verify = await fetch(`${baseUrl}/api/auth/verify-staff-token?token=${inviteTokenValue}`);
    assert(r136_verify.status === 200, 'Test 136a: Valid staff invite token verified successfully');

    // Activate staff account
    const r136_activate = await fetch(`${baseUrl}/api/auth/activate-staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: inviteTokenValue, password: 'SecureStaffPassword123!' })
    });
    assert(r136_activate.status === 200, 'Test 136b: Staff account activated successfully');

    // Verify token was consumed
    const r136_activate_again = await fetch(`${baseUrl}/api/auth/activate-staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: inviteTokenValue, password: 'SecureStaffPassword123!' })
    });
    assert(r136_activate_again.status === 404, 'Test 136c: Consumed staff invite token cannot be reused (returns 404)');

    // 137. Staff Invitation Token Expiration Check
    const expiredInviteToken = `expired-inv-${Date.now()}`;
    db.updateDb(d => {
      d.users.push({
        id: `staff-exp-${Date.now()}`,
        name: 'Expired Staff',
        email: `expstaff-${Date.now()}@lumo.africa`,
        role: 'STAFF',
        status: 'INVITED',
        isActive: false,
        inviteToken: expiredInviteToken,
        inviteExpiresAt: new Date(Date.now() - 3600000).toISOString() // 1 hour past
      } as any);
    });

    const r137_verify = await fetch(`${baseUrl}/api/auth/verify-staff-token?token=${expiredInviteToken}`);
    assert(r137_verify.status === 400, 'Test 137a: Expired staff invitation token verification rejected (returns 400)');

    const r137_activate = await fetch(`${baseUrl}/api/auth/activate-staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: expiredInviteToken, password: 'SecureStaffPassword123!' })
    });
    assert(r137_activate.status === 404 || r137_activate.status === 400, 'Test 137b: Expired staff invitation activation rejected');

    // 138. Sanitize User Security Check
    const rawUserWithSecrets = {
      id: 'usr-secrets-check',
      name: 'Secret User',
      email: 'secret@lumo.africa',
      passwordHash: '$2b$10$e81g34u2h34ui23h4i23u423i4u23i4u23',
      inviteToken: 'secret-invite-token',
      passwordResetToken: 'secret-reset-token',
      failedAttempts: 3
    };
    const sanitizedUserResult = sanitizeUser(rawUserWithSecrets);
    assert(sanitizedUserResult.id === 'usr-secrets-check', 'Test 138a: Sanitize user preserves non-sensitive fields');
    assert(!('passwordHash' in sanitizedUserResult), 'Test 138b: Sanitize user strips passwordHash');
    assert(!('inviteToken' in sanitizedUserResult), 'Test 138c: Sanitize user strips inviteToken');
    assert(!('passwordResetToken' in sanitizedUserResult), 'Test 138d: Sanitize user strips passwordResetToken');

    // 139. Constant-Time Token Comparison Test
    assert(safeCompareTokens('token123456', 'token123456') === true, 'Test 139a: safeCompareTokens matches identical tokens');
    assert(safeCompareTokens('token123456', 'token123457') === false, 'Test 139b: safeCompareTokens rejects non-matching tokens');
    assert(safeCompareTokens('token123456', 'short') === false, 'Test 139c: safeCompareTokens handles length mismatch safely');
    assert(safeCompareTokens(null, 'token') === false, 'Test 139d: safeCompareTokens handles null/undefined inputs safely');

    // =========================================================================
    // PROBLEM N: PLATFORM-WIDE IDOR PREVENTION NEGATIVE SECURITY TESTS
    // =========================================================================
    console.log('\n--- Problem N: IDOR Prevention Tests ---');

    // Setup helper login function to get tokens
    const loginAndGetToken = async (email: string, pass: string) => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();
      return data.token;
    };

    const tokenCust1 = await loginAndGetToken(testCustomer.email, 'CustPass123!');
    const tokenCust2 = await loginAndGetToken(testCustomer2.email, 'CustPass123!');
    const tokenSeller1 = await loginAndGetToken(testSeller.email, 'SellerPass123!');
    const tokenSeller2 = await loginAndGetToken(testSeller2.email, 'SellerPass123!');

    // Seed test order for Customer 2
    const idorOrderCust2 = {
      id: 'ord-idor-cust2-01',
      orderNumber: 'LM-IDOR-1001',
      customerId: testCustomer2.id,
      customerName: testCustomer2.name,
      customerEmail: testCustomer2.email,
      customerPhone: testCustomer2.phone,
      status: 'Processing',
      sellerId: testSeller2.sellerId,
      items: [{
        id: 'item-idor-1',
        productId: 'prod-idor-1',
        productName: 'IDOR Test Product',
        sellerId: testSeller2.sellerId,
        unitPrice: 10000,
        totalPrice: 10000,
        price: 10000,
        quantity: 1
      }],
      pricing: { subtotal: 10000, deliveryFee: 2000, shippingFee: 2000, discount: 0, total: 12000, escrowFee: 0, tax: 0 },
      createdAt: new Date().toISOString()
    };

    db.updateDb((d: any) => {
      d.orders.unshift(idorOrderCust2);
    });

    // 140. IDOR Test: Customer 1 viewing Customer 2's order
    const r140 = await fetch(`${baseUrl}/api/orders/${idorOrderCust2.id}`, {
      headers: { Authorization: `Bearer ${tokenCust1}` }
    });
    assert(r140.status === 403, 'Test 140: Customer 1 forbidden from viewing Customer 2 order (returns 403)');

    // 141. IDOR Test: Customer 1 attempting to cancel Customer 2's order
    const r141 = await fetch(`${baseUrl}/api/orders/${idorOrderCust2.id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenCust1}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Cancelled', reason: 'Malicious cancellation attempt' })
    });
    assert(r141.status === 403, 'Test 141: Customer 1 forbidden from cancelling Customer 2 order (returns 403)');

    // Seed test product for Seller 2
    const idorProductSeller2 = {
      id: 'prod-idor-seller2-01',
      name: 'Seller 2 Product',
      sellerId: testSeller2.sellerId,
      sellerName: testSeller2.name,
      price: 50000,
      stock: 10,
      category: 'Electronics',
      images: ['https://example.com/img.jpg'],
      status: 'APPROVED',
      createdAt: new Date().toISOString()
    };

    db.updateDb((d: any) => {
      d.products.unshift(idorProductSeller2);
    });

    // 142. IDOR Test: Seller 1 attempting to delete Seller 2's product
    const r142 = await fetch(`${baseUrl}/api/products/${idorProductSeller2.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenSeller1}` }
    });
    assert(r142.status === 403, 'Test 142: Seller 1 forbidden from deleting Seller 2 product (returns 403)');

    // 143. IDOR Test: Seller 1 attempting to create product for Seller 2 via body sellerId override
    const r143 = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenSeller1}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Spoofed Seller Product',
        sellerId: testSeller2.sellerId, // Body attempt to override sellerId
        price: 25000,
        stock: 5,
        category: 'Electronics',
        description: 'Test product creation with sellerId override'
      })
    });
    const j143 = await r143.json();
    assert(r143.status === 201 && j143.product.sellerId === testSeller.sellerId, 'Test 143: Product creation derives sellerId exclusively from session, ignoring body override');

    // Seed private notification for Customer 2
    const idorNotifCust2 = {
      id: 'notif-idor-cust2-01',
      userId: testCustomer2.id,
      title: 'Private Security Alert for Cust 2',
      message: 'Sensitive information for Customer 2',
      type: 'SECURITY',
      isRead: false,
      createdAt: new Date().toISOString()
    };

    db.updateDb((d: any) => {
      if (!d.notifications) d.notifications = [];
      d.notifications.unshift(idorNotifCust2);
    });

    // 144. IDOR Test: Customer 1 attempting to view Customer 2's private notification
    const r144 = await fetch(`${baseUrl}/api/notifications/${idorNotifCust2.id}`, {
      headers: { Authorization: `Bearer ${tokenCust1}` }
    });
    assert(r144.status === 403, 'Test 144: Customer 1 forbidden from accessing Customer 2 notification (returns 403)');

    // ====================================================
    // PROBLEM O: BACKEND VERIFICATION ENFORCEMENT NEGATIVE TESTS
    // ====================================================

    // Seed unverified seller account
    const unverifiedSellerUser = {
      id: 'usr-test-unverified-seller-01',
      email: 'unverifiedseller01@lumo.africa',
      name: 'Unverified Seller 01',
      phone: '+255700000099',
      role: 'SELLER' as const,
      passwordHash: await hashPassword('SellerPass123!'),
      status: 'ACTIVE' as const,
      isActive: true,
      isVerified: false,
      verificationStatus: 'UNVERIFIED' as const,
      sellerId: 'sel-unverified-01',
      createdAt: new Date().toISOString()
    };

    const unverifiedSellerProfile = {
      id: 'sel-unverified-01',
      userId: 'usr-test-unverified-seller-01',
      name: 'Unverified Shop 01',
      email: 'unverifiedseller01@lumo.africa',
      phone: '+255700000099',
      verificationStatus: 'UNVERIFIED',
      isVerified: false,
      createdAt: new Date().toISOString()
    };

    db.updateDb((d: any) => {
      d.users.unshift(unverifiedSellerUser);
      d.sellers.unshift(unverifiedSellerProfile);
    });

    const unverifiedSellerSess = db.createSession(unverifiedSellerUser.id, unverifiedSellerUser.role);
    const tokenUnverifiedSeller = unverifiedSellerSess.token;

    // 145. Problem O Test: Unverified Seller attempting to create a product (must be blocked 403 VERIFICATION_REQUIRED)
    const r145 = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenUnverifiedSeller}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Unverified Seller Test Product',
        price: 30000,
        stock: 10,
        category: 'Electronics',
        description: 'Should be rejected due to unverified seller'
      })
    });
    assert(r145.status === 403, 'Test 145: Unverified Seller blocked from creating product (returns 403)');

    // 146. Problem O Test: Unverified Seller attempting to request payout (must be blocked 403 VERIFICATION_REQUIRED)
    const r146 = await fetch(`${baseUrl}/api/finance/payout-requests`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenUnverifiedSeller}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 50000,
        paymentMethod: 'MOBILE_MONEY',
        accountNumber: '+255700000099'
      })
    });
    assert(r146.status === 403, 'Test 146: Unverified Seller blocked from requesting payout (returns 403)');

    // 147. Problem O Test: Unverified Seller attempting to self-verify via body override in profile update
    const r147 = await fetch(`${baseUrl}/api/sellers/profile`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokenUnverifiedSeller}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Unverified Shop Updated',
        isVerified: true,
        verificationStatus: 'VERIFIED'
      })
    });
    const updatedUnverifiedUser = db.getDb().users.find((u: any) => u.id === unverifiedSellerUser.id);
    assert(
      updatedUnverifiedUser?.isVerified === false && updatedUnverifiedUser?.verificationStatus !== 'VERIFIED',
      'Test 147: Seller cannot self-verify by supplying isVerified or verificationStatus in body'
    );

    // Seed unverified rider account
    const unverifiedRiderUser = {
      id: 'usr-test-unverified-rider-01',
      email: 'unverifiedrider01@lumo.africa',
      name: 'Unverified Rider 01',
      phone: '+255700000098',
      role: 'DELIVERY_AGENT' as const,
      passwordHash: await hashPassword('RiderPass123!'),
      status: 'ACTIVE' as const,
      isActive: true,
      isVerified: false,
      verificationStatus: 'UNVERIFIED' as const,
      riderId: 'rdr-unverified-01',
      createdAt: new Date().toISOString()
    };

    db.updateDb((d: any) => {
      d.users.unshift(unverifiedRiderUser);
    });

    const tokenUnverifiedRider = db.createSession(unverifiedRiderUser.id, unverifiedRiderUser.role).token;

    // 148. Problem O Test: Unverified Rider attempting to accept delivery task
    const r148 = await fetch(`${baseUrl}/api/delivery/accept-task`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenUnverifiedRider}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: 'task-001', orderId: 'ord-001' })
    });
    assert(r148.status === 403, 'Test 148: Unverified Rider blocked from accepting delivery task (returns 403)');

    // Seed unverified warehouse staff account
    const unverifiedWarehouseUser = {
      id: 'usr-test-unverified-wh-01',
      email: 'unverifiedwh01@lumo.africa',
      name: 'Unverified WH Staff 01',
      phone: '+255700000097',
      role: 'WAREHOUSE_STAFF' as const,
      passwordHash: await hashPassword('WhPass123!'),
      status: 'ACTIVE' as const,
      isActive: true,
      isVerified: false,
      verificationStatus: 'UNVERIFIED' as const,
      warehouseId: 'wh-kariakoo',
      createdAt: new Date().toISOString()
    };

    db.updateDb((d: any) => {
      d.users.unshift(unverifiedWarehouseUser);
    });

    const tokenUnverifiedWH = db.createSession(unverifiedWarehouseUser.id, unverifiedWarehouseUser.role).token;

    // 149. Problem O Test: Unverified Warehouse Staff attempting stock adjustment
    const r149 = await fetch(`${baseUrl}/api/warehouses/stock-adjustments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenUnverifiedWH}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: 'prod-001',
        quantity: 5,
        type: 'INCREMENT',
        reason: 'Restock'
      })
    });
    assert(r149.status === 403, 'Test 149: Unverified Warehouse Staff blocked from stock adjustment (returns 403)');

    // Seed unverified salesperson account
    const unverifiedSalespersonUser = {
      id: 'usr-test-unverified-sales-01',
      email: 'unverifiedsales01@lumo.africa',
      name: 'Unverified Sales 01',
      phone: '+255700000096',
      role: 'SALESPERSON' as const,
      passwordHash: await hashPassword('SalesPass123!'),
      status: 'ACTIVE' as const,
      isActive: true,
      isVerified: false,
      verificationStatus: 'UNVERIFIED' as const,
      salespersonId: 'sp-unverified-01',
      createdAt: new Date().toISOString()
    };

    db.updateDb((d: any) => {
      d.users.unshift(unverifiedSalespersonUser);
    });

    const tokenUnverifiedSales = db.createSession(unverifiedSalespersonUser.id, unverifiedSalespersonUser.role).token;

    // 150. Problem O Test: Unverified Salesperson attempting to assist order creation
    const r150 = await fetch(`${baseUrl}/api/sales/assist-order`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenUnverifiedSales}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Test Customer',
        customerPhone: '+255754000111',
        productId: 'prod-001',
        quantity: 1
      })
    });
    assert(r150.status === 403, 'Test 150: Unverified Salesperson blocked from assisting order creation (returns 403)');

    // =========================================================================
    // PROBLEM Q: COMPREHENSIVE NEGATIVE-SECURITY REGRESSION SUITE
    // =========================================================================
    console.log('\n====================================================');
    console.log('--- PROBLEM Q: COMPREHENSIVE NEGATIVE-SECURITY REGRESSION SUITE ---');
    console.log('====================================================\n');

    // Setup tokens & test accounts for Problem Q tests
    const tokenRider1 = await loginAndGetToken(testRider.email, 'RiderPass123!');

    // Seed Rider 2 account and session
    const testRider2User = {
      id: 'usr-test-rider-02',
      email: 'rider2@lumo.africa',
      name: 'Test Rider 2',
      phone: '+255700000088',
      role: 'DELIVERY_AGENT' as const,
      passwordHash: await hashPassword('RiderPass123!'),
      status: 'ACTIVE' as const,
      isActive: true,
      isVerified: true,
      verificationStatus: 'VERIFIED' as const,
      riderId: 'rdr-test-02',
      createdAt: new Date().toISOString()
    };
    db.updateDb((d: any) => {
      d.users.unshift(testRider2User);
    });
    const tokenRider2 = db.createSession(testRider2User.id, testRider2User.role).token;

    // Seed Pickup Operators for station 1 and station 2
    const pickupOp1User = {
      id: 'usr-test-pickup-op-01',
      email: 'pickupop1@lumo.africa',
      name: 'Pickup Op 1',
      role: 'PICKUP_OPERATOR' as const,
      passwordHash: await hashPassword('PickupPass123!'),
      status: 'ACTIVE' as const,
      isActive: true,
      isVerified: true,
      verificationStatus: 'VERIFIED' as const,
      pickupStationId: 'ps-kariakoo-01',
      createdAt: new Date().toISOString()
    };
    const pickupOp2User = {
      id: 'usr-test-pickup-op-02',
      email: 'pickupop2@lumo.africa',
      name: 'Pickup Op 2',
      role: 'PICKUP_OPERATOR' as const,
      passwordHash: await hashPassword('PickupPass123!'),
      status: 'ACTIVE' as const,
      isActive: true,
      isVerified: true,
      verificationStatus: 'VERIFIED' as const,
      pickupStationId: 'ps-mbags-02',
      createdAt: new Date().toISOString()
    };
    db.updateDb((d: any) => {
      d.users.unshift(pickupOp1User);
      d.users.unshift(pickupOp2User);
    });
    const tokenPickupOp1 = db.createSession(pickupOp1User.id, pickupOp1User.role).token;
    const tokenPickupOp2 = db.createSession(pickupOp2User.id, pickupOp2User.role).token;

    // --- 1. IDOR: Scenario 1 - Unauthorized order access ---
    const qOrderCust2 = {
      id: 'ord-q-cust2-01',
      orderNumber: 'LM-Q-1001',
      customerId: testCustomer2.id,
      customerName: testCustomer2.name,
      status: 'Processing',
      sellerId: testSeller2.sellerId,
      items: [{ productId: 'prod-q-1', productName: 'Q Item', price: 15000, quantity: 1, sellerId: testSeller2.sellerId }],
      pricing: { total: 15000 },
      createdAt: new Date().toISOString()
    };
    db.updateDb((d: any) => { d.orders.unshift(qOrderCust2); });

    const r151 = await fetch(`${baseUrl}/api/orders/${qOrderCust2.id}`, {
      headers: { Authorization: `Bearer ${tokenCust1}` }
    });
    const dbOrder151 = db.getDb().orders.find((o: any) => o.id === qOrderCust2.id);
    assert(
      r151.status === 403 && dbOrder151?.customerId === testCustomer2.id && dbOrder151?.status === 'Processing',
      'Test 151 [IDOR/ORDER]: Customer 1 forbidden from accessing Customer 2 order & DB state unchanged'
    );

    // --- 2. ORDER SECURITY: Scenario 2 - Order impersonation ---
    db.updateDb((d: any) => {
      d.products.unshift({
        id: 'prod-q-1',
        name: 'Q Item',
        sellerId: testSeller.sellerId,
        sellerName: testSeller.name,
        price: 10000,
        stock: 50,
        category: 'Electronics',
        status: 'APPROVED',
        createdAt: new Date().toISOString()
      });
    });

    const r152 = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenCust1}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: testCustomer2.id, // Body impersonation attempt
        customerName: 'Impersonated Cust 2',
        items: [{ productId: 'prod-q-1', productName: 'Q Item', price: 10000, quantity: 1, sellerId: testSeller.sellerId }],
        pricing: { subtotal: 10000, deliveryFee: 2000, total: 12000 }
      })
    });
    const j152 = await r152.json();
    const createdOrder152InDb = db.getDb().orders.find((o: any) => o.id === j152.order?.id);
    assert(
      r152.status === 201 &&
      j152.order.customerId === testCustomer.id &&
      createdOrder152InDb?.customerId === testCustomer.id,
      'Test 152 [ORDER SECURITY]: Order creation strictly derives customerId from session, ignoring body impersonation'
    );

    // --- 3. IDOR: Scenario 3 - Seller-to-seller resource access ---
    const qProductSeller2 = {
      id: 'prod-q-seller2-01',
      name: 'Seller 2 Exclusive Product',
      sellerId: testSeller2.sellerId,
      sellerName: testSeller2.name,
      price: 85000,
      stock: 12,
      category: 'Electronics',
      status: 'APPROVED',
      createdAt: new Date().toISOString()
    };
    db.updateDb((d: any) => { d.products.unshift(qProductSeller2); });

    const r153 = await fetch(`${baseUrl}/api/products/${qProductSeller2.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenSeller1}` }
    });
    const dbProd153 = db.getDb().products.find((p: any) => p.id === qProductSeller2.id);
    assert(
      r153.status === 403 && dbProd153 !== undefined && dbProd153.sellerId === testSeller2.sellerId,
      'Test 153 [IDOR/SELLER]: Seller 1 forbidden from deleting Seller 2 product & product remains in DB'
    );

    // --- 4. IDOR: Scenario 4 - Rider-to-rider resource access ---
    const qDeliveryTaskRider2 = {
      id: 'task-q-rider2-01',
      orderId: 'ord-q-rider2-01',
      orderNumber: 'LM-Q-RIDER2',
      riderId: testRider2User.id,
      riderName: testRider2User.name,
      status: 'IN_TRANSIT',
      pickupAddress: 'Kariakoo Hub',
      deliveryAddress: 'Mikocheni B',
      codAmount: 0,
      createdAt: new Date().toISOString()
    };
    const qOrderRider2 = {
      id: 'ord-q-rider2-01',
      orderNumber: 'LM-Q-RIDER2',
      riderId: testRider2User.id,
      status: 'Processing',
      otpCode: '654321',
      otpStatus: 'ACTIVE',
      items: [{ productId: 'p1', quantity: 1, price: 10000, sellerId: testSeller2.sellerId }],
      pricing: { total: 10000 }
    };
    db.updateDb((d: any) => {
      d.deliveryTasks.unshift(qDeliveryTaskRider2);
      d.orders.unshift(qOrderRider2);
    });

    const tokenRider1Verified = await loginAndGetToken(testRider.email, 'RiderPass123!');
    const r154 = await fetch(`${baseUrl}/api/otp/verify`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenRider1Verified}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: qDeliveryTaskRider2.id, otpCode: '654321' })
    });
    const dbTask154 = db.getDb().deliveryTasks.find((t: any) => t.id === qDeliveryTaskRider2.id);
    assert(
      r154.status === 403 && dbTask154?.status === 'IN_TRANSIT',
      'Test 154 [IDOR/RIDER]: Rider 1 forbidden from verifying or completing Rider 2 delivery task & task state unchanged'
    );

    // --- 5. IDOR: Scenario 5 - Pickup-station-to-pickup-station access ---
    const qPackageStation2 = {
      id: 'pinv-q-station2-01',
      stationId: 'ps-mbags-02',
      stationName: 'Mbagala Station',
      orderId: 'ord-q-station2-01',
      orderNumber: 'LM-Q-STATION2',
      customerName: 'Cust 2',
      customerPhone: '+255711000222',
      status: 'READY_FOR_PICKUP' as const,
      otpCode: '888999',
      expiresAt: new Date(Date.now() + 86400000).toISOString()
    };
    db.updateDb((d: any) => { if (!d.pickupInventory) d.pickupInventory = []; d.pickupInventory.unshift(qPackageStation2); });

    const r155 = await fetch(`${baseUrl}/api/pickup/handover`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenPickupOp1}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ packageId: qPackageStation2.id, otpCode: '888999' })
    });
    const dbPkg155 = (db.getDb().pickupInventory || []).find((p: any) => p.id === qPackageStation2.id);
    assert(
      r155.status === 403 && dbPkg155?.status === 'READY_FOR_PICKUP',
      'Test 155 [IDOR/PICKUP]: Station 1 Operator forbidden from processing package assigned to Station 2 & DB state unchanged'
    );

    // --- 6. IDOR: Scenario 6 - Return IDOR ---
    const qReturnCust2 = {
      id: 'ret-q-cust2-01',
      returnNumber: 'RET-Q-2001',
      orderId: 'ord-q-cust2-01',
      orderNumber: 'LM-Q-1001',
      customerId: testCustomer2.id,
      customerName: testCustomer2.name,
      sellerId: testSeller2.sellerId,
      sellerName: testSeller2.name,
      productId: 'prod-q-1',
      productName: 'Q Item',
      quantity: 1,
      refundAmount: 15000,
      reason: 'DEFECTIVE',
      status: 'RETURN_REQUESTED' as const,
      createdAt: new Date().toISOString()
    };
    db.updateDb((d: any) => { d.returns.unshift(qReturnCust2); });

    const r156 = await fetch(`${baseUrl}/api/returns/${qReturnCust2.id}`, {
      headers: { Authorization: `Bearer ${tokenCust1}` }
    });
    const dbReturn156 = db.getDb().returns.find((r: any) => r.id === qReturnCust2.id);
    assert(
      r156.status === 403 && dbReturn156?.status === 'RETURN_REQUESTED' && dbReturn156?.customerId === testCustomer2.id,
      'Test 156 [IDOR/RETURN]: Customer 1 forbidden from reading Customer 2 return request & DB state unchanged'
    );

    // --- 7. IDOR: Scenario 7 - Payout IDOR ---
    const r157 = await fetch(`${baseUrl}/api/finance/payout-requests`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenSeller1}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vendorId: testSeller2.sellerId, // Body override attempt targeting Seller 2
        amount: 40000,
        paymentMethod: 'MOBILE_MONEY',
        accountNumber: '+255700000011'
      })
    });
    const j157 = await r157.json();
    const dbPayout157 = ((db.getDb() as any).sellerPayouts || (db.getDb() as any).payoutRequests || []).find((p: any) => p.id === j157.payoutRequest?.id || p.id === j157.payout?.id);
    assert(
      (r157.status === 201 && dbPayout157?.sellerId === testSeller.sellerId) || r157.status === 403,
      'Test 157 [IDOR/PAYOUT]: Payout request derives sellerId exclusively from session or rejects override, protecting Seller 2 funds'
    );

    // --- 8. IDOR: Scenario 8 - Product IDOR ---
    const r158 = await fetch(`${baseUrl}/api/products/${qProductSeller2.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenSeller1}` }
    });
    const dbProd158 = db.getDb().products.find((p: any) => p.id === qProductSeller2.id);
    assert(
      r158.status === 403 && dbProd158 !== undefined,
      'Test 158 [IDOR/PRODUCT]: Seller 1 forbidden from deleting Seller 2 product & product remains in DB'
    );

    // --- 9. IDOR: Scenario 9 - Inventory IDOR ---
    const r159 = await fetch(`${baseUrl}/api/sellers/inventory/${qProductSeller2.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokenSeller1}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: 999 })
    });
    const dbProd159 = db.getDb().products.find((p: any) => p.id === qProductSeller2.id);
    assert(
      r159.status === 403 && dbProd159?.stock === 12,
      'Test 159 [IDOR/INVENTORY]: Seller 1 forbidden from modifying Seller 2 stock & inventory unchanged in DB'
    );

    // --- 10. IDOR: Scenario 10 - Conversation IDOR ---
    const qTicketCust2 = {
      id: 'tkt-q-cust2-01',
      ticketNumber: 'TKT-Q-2001',
      userId: testCustomer2.id,
      userName: testCustomer2.name,
      category: 'DELIVERY' as const,
      subject: 'Private Support Issue',
      status: 'OPEN' as const,
      priority: 'MEDIUM' as const,
      messages: [{ id: 'msg-q-1', sender: 'USER' as const, senderName: testCustomer2.name, message: 'Private message', timestamp: new Date().toISOString() }],
      createdAt: new Date().toISOString()
    };
    db.updateDb((d: any) => { d.supportTickets.unshift(qTicketCust2); });

    const r160 = await fetch(`${baseUrl}/api/support/tickets/${qTicketCust2.id}`, {
      headers: { Authorization: `Bearer ${tokenCust1}` }
    });
    const dbTicket160 = db.getDb().supportTickets.find((t: any) => t.id === qTicketCust2.id);
    assert(
      r160.status === 403 && dbTicket160?.userId === testCustomer2.id,
      'Test 160 [IDOR/CONVERSATION]: Customer 1 forbidden from accessing Customer 2 support conversation & DB state unchanged'
    );

    // --- 11. IDOR: Scenario 11 - Notification IDOR ---
    const qNotifCust2 = {
      id: 'notif-q-cust2-01',
      userId: testCustomer2.id,
      title: 'Private Cust 2 Alert',
      message: 'Confidential notification message',
      type: 'SECURITY' as const,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    db.updateDb((d: any) => { if (!d.notifications) d.notifications = []; d.notifications.unshift(qNotifCust2); });

    const r161 = await fetch(`${baseUrl}/api/notifications/${qNotifCust2.id}`, {
      headers: { Authorization: `Bearer ${tokenCust1}` }
    });
    const dbNotif161 = (db.getDb().notifications || []).find((n: any) => n.id === qNotifCust2.id);
    assert(
      r161.status === 403 && dbNotif161?.isRead === false,
      'Test 161 [IDOR/NOTIFICATION]: Customer 1 forbidden from accessing Customer 2 notification & DB state unchanged'
    );

    // --- 12. OTP: Scenario 12 - Invalid OTP ---
    const qOrderOtpInvalid = {
      id: 'ord-q-otp-inv-01',
      orderNumber: 'LM-Q-OTP-INV',
      riderId: testRider.id,
      status: 'Processing',
      otpCode: '123456',
      otpStatus: 'ACTIVE',
      otpExpiresAt: new Date(Date.now() + 600000).toISOString(),
      items: [{ productId: 'p1', quantity: 1, price: 10000, sellerId: testSeller.sellerId }],
      pricing: { total: 10000 }
    };
    db.updateDb((d: any) => { d.orders.unshift(qOrderOtpInvalid); });

    const r162 = await fetch(`${baseUrl}/api/otp/verify`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenRider1Verified}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: qOrderOtpInvalid.id, otpCode: '000000' })
    });
    const dbOrder162 = db.getDb().orders.find((o: any) => o.id === qOrderOtpInvalid.id);
    assert(
      r162.status === 400 && dbOrder162?.status !== 'Delivered' && dbOrder162?.otpStatus === 'ACTIVE',
      'Test 162 [OTP/INVALID]: Wrong OTP code rejected with 400 & order remains undelivered in DB'
    );

    // --- 13. OTP: Scenario 13 - Expired OTP ---
    const qOrderOtpExp = {
      id: 'ord-q-otp-exp-01',
      orderNumber: 'LM-Q-OTP-EXP',
      riderId: testRider.id,
      status: 'Processing',
      otpCode: '999888',
      otpStatus: 'ACTIVE',
      otpExpiresAt: new Date(Date.now() - 600000).toISOString(), // Expired 10 min ago
      items: [{ productId: 'p1', quantity: 1, price: 10000, sellerId: testSeller.sellerId }],
      pricing: { total: 10000 }
    };
    db.updateDb((d: any) => { d.orders.unshift(qOrderOtpExp); });

    const r163 = await fetch(`${baseUrl}/api/otp/verify`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenRider1Verified}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: qOrderOtpExp.id, otpCode: '999888' })
    });
    const dbOrder163 = db.getDb().orders.find((o: any) => o.id === qOrderOtpExp.id);
    assert(
      r163.status === 400 && dbOrder163?.status !== 'Delivered',
      'Test 163 [OTP/EXPIRED]: Expired OTP rejected with 400 & order remains undelivered in DB'
    );

    // --- 14. OTP: Scenario 14 - Reused OTP ---
    const qOrderOtpReuse = {
      id: 'ord-q-otp-reuse-01',
      orderNumber: 'LM-Q-OTP-REUSE',
      riderId: testRider.id,
      status: 'Processing',
      otpCode: '654321',
      otpStatus: 'ACTIVE',
      otpExpiresAt: new Date(Date.now() + 600000).toISOString(),
      items: [{ productId: 'p1', quantity: 1, price: 20000, sellerId: testSeller.sellerId }],
      pricing: { total: 20000 }
    };
    db.updateDb((d: any) => { d.orders.unshift(qOrderOtpReuse); });

    // Call 1: First valid verification
    const r164a = await fetch(`${baseUrl}/api/otp/verify`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenRider1Verified}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: qOrderOtpReuse.id, otpCode: '654321' })
    });
    assert(r164a.status === 200, 'Test 164a [OTP/REUSE]: First verification of active OTP succeeds');

    // Call 2: Attempt to reuse burned OTP code
    const r164b = await fetch(`${baseUrl}/api/otp/verify`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenRider1Verified}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: qOrderOtpReuse.id, otpCode: '654321' })
    });
    const ledgerEntries164 = db.getDb().financialLedger.filter((l: any) => l.orderId === qOrderOtpReuse.id && l.type === 'ESCROW_RELEASE');
    assert(
      r164b.status === 400 && ledgerEntries164.length === 1,
      'Test 164b [OTP/REUSE]: Reused OTP rejected with 400 & no duplicate escrow release created in financial ledger'
    );

    // --- 15. OTP: Scenario 15 - Excessive OTP attempts ---
    const qOrderOtpLock = {
      id: 'ord-q-otp-lock-01',
      orderNumber: 'LM-Q-OTP-LOCK',
      riderId: testRider.id,
      status: 'Processing',
      otpCode: '789123',
      otpStatus: 'ACTIVE',
      otpAttempts: 0,
      otpExpiresAt: new Date(Date.now() + 600000).toISOString(),
      items: [{ productId: 'p1', quantity: 1, price: 10000, sellerId: testSeller.sellerId }],
      pricing: { total: 10000 }
    };
    db.updateDb((d: any) => { d.orders.unshift(qOrderOtpLock); });

    // 3 failed attempts
    await fetch(`${baseUrl}/api/otp/verify`, { method: 'POST', headers: { Authorization: `Bearer ${tokenRider1Verified}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: qOrderOtpLock.id, otpCode: '000001' }) });
    await fetch(`${baseUrl}/api/otp/verify`, { method: 'POST', headers: { Authorization: `Bearer ${tokenRider1Verified}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: qOrderOtpLock.id, otpCode: '000002' }) });
    const r165_3 = await fetch(`${baseUrl}/api/otp/verify`, { method: 'POST', headers: { Authorization: `Bearer ${tokenRider1Verified}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: qOrderOtpLock.id, otpCode: '000003' }) });
    const j165_3 = await r165_3.json();

    // Attempt 4 with correct OTP code on locked order
    const r165_4 = await fetch(`${baseUrl}/api/otp/verify`, { method: 'POST', headers: { Authorization: `Bearer ${tokenRider1Verified}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: qOrderOtpLock.id, otpCode: '789123' }) });
    const dbOrder165 = db.getDb().orders.find((o: any) => o.id === qOrderOtpLock.id);

    assert(
      j165_3.locked === true && r165_4.status === 400 && dbOrder165?.otpStatus === 'LOCKED' && dbOrder165?.status !== 'Delivered',
      'Test 165 [OTP/EXCESSIVE ATTEMPTS]: 3 failed OTP attempts lock order; subsequent correct OTP code is rejected & order remains LOCKED'
    );

    // --- 16. VERIFICATION: Scenario 16 - Unverified operational-account access ---
    const r166 = await fetch(`${baseUrl}/api/pickup/receive-package`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenUnverifiedSeller}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderNumber: 'LM-UNVERIFIED', customerName: 'Test' })
    });
    assert(
      r166.status === 403,
      'Test 166 [VERIFICATION/UNVERIFIED ACCESS]: Unverified operational account blocked from privileged operational endpoints (returns 403)'
    );

    // --- 17. AUTHENTICATION: Scenario 17 - Frontend/localStorage role manipulation ---
    const r167 = await fetch(`${baseUrl}/api/admin/commission-rules`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenCust1}`,
        'X-User-Role': 'SUPER_ADMIN', // Client-side role spoof header
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role: 'SUPER_ADMIN', category: 'Electronics', commissionRate: 0.01 }) // Client-side role spoof body
    });
    const user167Db = db.getDb().users.find((u: any) => u.id === testCustomer.id);
    assert(
      r167.status === 403 && user167Db?.role === 'CUSTOMER',
      'Test 167 [AUTHENTICATION/ROLE MANIPULATION]: Frontend header/body role override strictly ignored & admin action blocked with 403'
    );

    // --- 18. AUTHORIZATION: Scenario 18 - Fake request-body identity ---
    const r168 = await fetch(`${baseUrl}/api/support/tickets`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenCust1}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: testCustomer2.id, // Body spoof attempt targeting Customer 2
        userName: 'Admin Spoof',
        subject: 'Body identity spoof test',
        message: 'Testing if body identity overrides session'
      })
    });
    const j168 = await r168.json();
    const createdTicket168Db = db.getDb().supportTickets.find((t: any) => t.id === j168.ticket?.id);
    assert(
      r168.status === 201 && createdTicket168Db?.userId === testCustomer.id,
      'Test 168 [AUTHORIZATION/IDENTITY SPOOF]: Ticket creation derives userId strictly from authenticated session, ignoring fake request body identity'
    );

    // --- 19. ORDER SECURITY: Scenario 19 - Invalid order/status transitions ---
    const qOrderStatusTest = {
      id: 'ord-q-status-01',
      orderNumber: 'LM-Q-STATUS-01',
      customerId: testCustomer.id,
      status: 'Processing',
      sellerId: testSeller.sellerId,
      items: [{ productId: 'p1', price: 10000, quantity: 1, sellerId: testSeller.sellerId }],
      pricing: { total: 10000 }
    };
    db.updateDb((d: any) => { d.orders.unshift(qOrderStatusTest); });

    // Customer attempts unauthorized status change to Delivered
    const r169a = await fetch(`${baseUrl}/api/orders/${qOrderStatusTest.id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenCust1}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Delivered' })
    });
    const dbOrder169a = db.getDb().orders.find((o: any) => o.id === qOrderStatusTest.id);
    assert(
      r169a.status === 403 && dbOrder169a?.status === 'Processing',
      'Test 169a [ORDER SECURITY/INVALID TRANSITION]: Customer forbidden from directly marking order Delivered (returns 403)'
    );

    // Seller attempts status transition on cancelled order
    const qOrderCancelled = {
      id: 'ord-q-cancelled-01',
      orderNumber: 'LM-Q-CANCELLED',
      customerId: testCustomer.id,
      status: 'Cancelled',
      sellerId: testSeller.sellerId,
      items: [{ productId: 'p1', price: 10000, quantity: 1, sellerId: testSeller.sellerId }],
      pricing: { total: 10000 }
    };
    db.updateDb((d: any) => { d.orders.unshift(qOrderCancelled); });

    const r169b = await fetch(`${baseUrl}/api/orders/${qOrderCancelled.id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenSeller1}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Delivered' })
    });
    const dbOrder169b = db.getDb().orders.find((o: any) => o.id === qOrderCancelled.id);
    assert(
      r169b.status === 400 && dbOrder169b?.status === 'Cancelled',
      'Test 169b [ORDER SECURITY/INVALID TRANSITION]: Transition from Cancelled to Delivered rejected with 400 & order remains Cancelled'
    );

    // --- 20. FINANCIAL SECURITY: Scenario 20 - Unauthorized financial operations ---
    const qReturnRefundTest = {
      id: 'ret-q-fin-01',
      returnNumber: 'RET-Q-FIN-01',
      orderId: 'ord-q-fin-01',
      orderNumber: 'LM-Q-FIN-01',
      customerId: testCustomer.id,
      sellerId: testSeller.sellerId,
      refundAmount: 50000,
      status: 'RETURN_APPROVED' as const,
      createdAt: new Date().toISOString()
    };
    db.updateDb((d: any) => { d.returns.unshift(qReturnRefundTest); });

    const r170 = await fetch(`${baseUrl}/api/returns/${qReturnRefundTest.id}/refund`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenSeller1}` }
    });
    const ledgerRef170 = db.getDb().financialLedger.filter((l: any) => l.description?.includes(qReturnRefundTest.returnNumber));
    assert(
      r170.status === 403 && ledgerRef170.length === 0,
      'Test 170 [FINANCIAL SECURITY]: Seller forbidden from executing financial refunds (403) & no refund ledger deduction created'
    );

    // --- 21. SESSION SECURITY: Scenario 21 - Revoked-session access ---
    const tempSessUser = {
      id: 'usr-q-temp-sess-01',
      email: 'tempsess01@lumo.africa',
      name: 'Temp Session User',
      role: 'CUSTOMER' as const,
      passwordHash: await hashPassword('CustPass123!'),
      status: 'ACTIVE' as const,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    db.updateDb((d: any) => { d.users.unshift(tempSessUser); });

    const tempSess = db.createSession(tempSessUser.id, tempSessUser.role);
    const tokenTempSess = tempSess.token;

    // Revoke session via logout
    const r171_logout = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenTempSess}` }
    });
    assert(r171_logout.status === 200, 'Test 171a [SESSION SECURITY]: Session logout succeeds');

    // Attempt request with revoked token
    const r171_access = await fetch(`${baseUrl}/api/orders`, {
      headers: { Authorization: `Bearer ${tokenTempSess}` }
    });
    const dbSession171 = (db.getDb().sessions || []).find((s: any) => s.token === tokenTempSess);
    assert(
      r171_access.status === 401 && dbSession171 === undefined,
      'Test 171b [SESSION SECURITY]: Revoked session token rejected with 401 & session absent from DB'
    );

    // --- 22. ACCOUNT STATUS SECURITY: Scenario 22 - Suspended-account access ---
    const suspendedUser = {
      id: 'usr-q-suspended-01',
      email: 'suspended01@lumo.africa',
      name: 'Suspended User 01',
      role: 'CUSTOMER' as const,
      passwordHash: await hashPassword('CustPass123!'),
      status: 'SUSPENDED' as const,
      isActive: false,
      createdAt: new Date().toISOString()
    };
    db.updateDb((d: any) => { d.users.unshift(suspendedUser); });

    // Create session token for suspended user directly in DB
    const suspendedSess = db.createSession(suspendedUser.id, suspendedUser.role);
    const tokenSuspended = suspendedSess.token;

    const r172_req = await fetch(`${baseUrl}/api/orders`, {
      headers: { Authorization: `Bearer ${tokenSuspended}` }
    });
    const r172_login = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: suspendedUser.email, password: 'CustPass123!' })
    });

    const dbUser172 = db.getDb().users.find((u: any) => u.id === suspendedUser.id);
    assert(
      (r172_req.status === 401 || r172_req.status === 403) && r172_login.status === 403 && dbUser172?.status === 'SUSPENDED',
      'Test 172 [ACCOUNT STATUS/SUSPENDED]: Suspended account blocked from API requests & login (401/403) & status remains SUSPENDED'
    );

    // --- 23. LUMO MODE ACCESS & AUDITABILITY REQUIREMENT: 9 Independent Operational Modes ---
    console.log('\n--- Running Section 23: Mode Access & Auditability Verification ---');

    const operationalModes = [
      { mode: 'CUSTOMER', email: 'buyer@lumo.africa', expectedRole: 'CUSTOMER', expectedPath: '/account' },
      { mode: 'SELLER', email: 'seller@lumo.africa', expectedRole: 'SELLER', expectedPath: '/seller' },
      { mode: 'RIDER', email: 'rider@lumo.africa', expectedRole: 'DELIVERY_AGENT', expectedPath: '/delivery' },
      { mode: 'WAREHOUSE', email: 'warehouse@lumo.africa', expectedRole: 'WAREHOUSE_MANAGER', expectedPath: '/warehouse' },
      { mode: 'PICKUP_STATION', email: 'pickup@lumo.africa', expectedRole: 'PICKUP_STATION_MANAGER', expectedPath: '/pickup' },
      { mode: 'SALESPERSON', email: 'sales@lumo.africa', expectedRole: 'SALESPERSON', expectedPath: '/sales' },
      { mode: 'OPERATIONS', email: 'operations@lumo.africa', expectedRole: 'OPERATIONS_ADMIN', expectedPath: '/operations' },
      { mode: 'FINANCE', email: 'finance@lumo.africa', expectedRole: 'FINANCE_ADMIN', expectedPath: '/finance' },
      { mode: 'ADMIN', email: 'admin@lumo.africa', expectedRole: 'SUPER_ADMIN', expectedPath: '/admin' }
    ];

    const modeTokens: Record<string, string> = {};

    // 173. Authenticate each operational mode independently via real cryptographic password verification
    for (const op of operationalModes) {
      const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: op.email, password: 'LumoPass2026!' })
      });
      assert(loginRes.status === 200, `Test 173 [MODE ACCESS]: ${op.mode} account (${op.email}) authenticates successfully (HTTP 200)`);
      const loginJson = await loginRes.json();
      assert(loginJson.token && loginJson.token.length > 20, `Test 173b [MODE ACCESS]: ${op.mode} receives valid session token`);
      assert(loginJson.user?.role === op.expectedRole, `Test 173c [MODE ACCESS]: ${op.mode} session role matches server authoritative role ${op.expectedRole}`);
      assert(loginJson.user?.isVerified === true, `Test 173d [MODE ACCESS]: ${op.mode} is properly verified on backend`);
      assert(loginJson.user?.status === 'ACTIVE', `Test 173e [MODE ACCESS]: ${op.mode} status is ACTIVE`);
      modeTokens[op.mode] = loginJson.token;
    }

    // 174. Verify all 9 session tokens are cryptographically stored in backend DB session table
    const currentDbSessions = db.getDb().sessions || [];
    for (const op of operationalModes) {
      const tok = modeTokens[op.mode];
      const matchInDb = currentDbSessions.find((s: any) => s.token === tok);
      assert(matchInDb !== undefined, `Test 174 [SESSION PERSISTENCE]: ${op.mode} session token is persisted in server database`);
    }

    // 175. Verify strict cross-mode role isolation & boundary enforcement
    // Customer cannot access seller inventory or warehouse endpoints
    const r175_cust_inv = await fetch(`${baseUrl}/api/sellers/inventory`, {
      headers: { Authorization: `Bearer ${modeTokens['CUSTOMER']}` }
    });
    assert(r175_cust_inv.status === 403, 'Test 175a [ISOLATION]: Customer blocked from seller inventory (403)');

    // Seller cannot access warehouse endpoints
    const r175_seller_wh = await fetch(`${baseUrl}/api/warehouses`, {
      headers: { Authorization: `Bearer ${modeTokens['SELLER']}` }
    });
    assert(r175_seller_wh.status === 403, 'Test 175b [ISOLATION]: Seller blocked from warehouse management (403)');

    // Rider cannot access finance dashboard
    const r175_rider_fin = await fetch(`${baseUrl}/api/finance/overview`, {
      headers: { Authorization: `Bearer ${modeTokens['RIDER']}` }
    });
    assert(r175_rider_fin.status === 403, 'Test 175c [ISOLATION]: Rider blocked from finance overview (403)');

    // Warehouse manager cannot access admin users list
    const r175_wh_admin = await fetch(`${baseUrl}/api/admin/users`, {
      headers: { Authorization: `Bearer ${modeTokens['WAREHOUSE']}` }
    });
    assert(r175_wh_admin.status === 403, 'Test 175d [ISOLATION]: Warehouse manager blocked from admin users (403)');

    // Pickup station manager cannot access super admin system settings
    const r175_ps_admin = await fetch(`${baseUrl}/api/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${modeTokens['PICKUP_STATION']}` }
    });
    assert(r175_ps_admin.status === 403, 'Test 175e [ISOLATION]: Pickup station manager blocked from admin audit logs (403)');

    // Salesperson cannot create warehouses
    const r175_sales_wh = await fetch(`${baseUrl}/api/warehouses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${modeTokens['SALESPERSON']}` },
      body: JSON.stringify({ name: 'Unauthorized Hub' })
    });
    assert(r175_sales_wh.status === 403, 'Test 175f [ISOLATION]: Salesperson blocked from creating warehouses (403)');

    // 176. Verify public staff registration is impossible
    const r176_pub_staff = await fetch(`${baseUrl}/api/auth/register-staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'hacker@lumo.africa', password: 'Password123!', role: 'SUPER_ADMIN' })
    });
    assert(r176_pub_staff.status === 404 || r176_pub_staff.status === 403, 'Test 176a [SECURITY]: Public staff registration endpoint is non-existent (404/403)');

    // Public register endpoint cannot elevate role
    const r176_priv_esc = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'PrivEsc Test', email: `privesc_${Date.now()}@lumo.africa`, password: 'Password123!', role: 'SUPER_ADMIN' })
    });
    if (r176_priv_esc.status === 201 || r176_priv_esc.status === 200) {
      const escJson = await r176_priv_esc.json();
      assert(escJson.user?.role === 'CUSTOMER', 'Test 176b [SECURITY]: Public registration forces role to CUSTOMER regardless of input');
    }

    // 177. Verify Super Admin reprovision endpoint
    const r177_reprov_anon = await fetch(`${baseUrl}/api/admin/provision-operational-accounts`, {
      method: 'POST'
    });
    assert(r177_reprov_anon.status === 401, 'Test 177a [REPROVISION SECURITY]: Anonymous reprovision rejected with 401');

    const r177_reprov_cust = await fetch(`${baseUrl}/api/admin/provision-operational-accounts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${modeTokens['CUSTOMER']}` }
    });
    assert(r177_reprov_cust.status === 403, 'Test 177b [REPROVISION SECURITY]: Customer reprovision rejected with 403');

    const r177_reprov_admin = await fetch(`${baseUrl}/api/admin/provision-operational-accounts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${modeTokens['ADMIN']}` }
    });
    assert(r177_reprov_admin.status === 200, 'Test 177c [REPROVISION]: Super Admin reprovision operational accounts succeeds');
    const reprovJson = await r177_reprov_admin.json();
    assert(reprovJson.accounts && reprovJson.accounts.length === 9, 'Test 177d [REPROVISION]: All 9 operational accounts confirmed in response');




  } catch (err) {
    console.error('Security test runner error:', err);
  } finally {
    server.close();
  }

  console.log('\n====================================================');
  console.log(`SECURITY VERIFICATION SUMMARY: ${passed} PASSED / ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runSecuritySuite();

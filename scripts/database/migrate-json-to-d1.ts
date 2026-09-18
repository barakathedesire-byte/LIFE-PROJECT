import fs from 'fs';
import path from 'path';
import { d1 } from '../../server/d1.js';

function toSqlVal(val: any): string | number | bigint | null {
  if (val === undefined || val === null) return null;
  if (typeof val === 'boolean') return val ? 1 : 0;
  if (typeof val === 'number') return Number.isNaN(val) ? null : val;
  if (typeof val === 'bigint') return val;
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

function runSql(stmt: any, ...args: any[]) {
  const safeArgs = args.map(toSqlVal);
  return stmt.run(...safeArgs);
}

async function runMigration() {
  console.log('--- STARTING LUMO JSON TO CLOUDFLARE D1 / SQLITE MIGRATION ---');

  const jsonPath = path.join(process.cwd(), 'data', 'lumo-db.json');
  const backupPath = path.join(process.cwd(), 'data', 'lumo-db.backup.json');

  if (!fs.existsSync(jsonPath)) {
    console.error('data/lumo-db.json not found!');
    return;
  }

  // 1. Create a safe backup of data/lumo-db.json
  fs.copyFileSync(jsonPath, backupPath);
  console.log(`✓ Preserved backup file at ${backupPath}`);

  const rawJson = fs.readFileSync(jsonPath, 'utf8');
  const dbData = JSON.parse(rawJson);

  const rawDb = d1.getRawDb();
  rawDb.exec('PRAGMA foreign_keys = OFF;');
  rawDb.exec('BEGIN TRANSACTION;');

  const stats: Record<string, number> = {};

  try {
    // 1. Pickup Stations
    const defaultStations = [
      {
        id: 'dar-ps-1',
        name: 'LUMO Kariakoo Station Hub',
        code: 'DAR-PS-01',
        city: 'Dar es Salaam',
        address: 'Msimbazi St, Kariakoo Commercial Arcade',
        managerName: 'Saidi Mwamburi',
        contactPhone: '+255 754 889 900',
        capacityPackages: 500,
        currentPackages: 42,
        operatingHours: '08:00 - 20:00'
      },
      {
        id: 'dar-ps-2',
        name: 'LUMO Masaki Peninsula Locker Station',
        code: 'DAR-PS-02',
        city: 'Dar es Salaam',
        address: 'Haile Selassie Rd, Slipway Complex',
        managerName: 'Neema Kavishe',
        contactPhone: '+255 768 112 334',
        capacityPackages: 300,
        currentPackages: 18,
        operatingHours: '07:30 - 21:00'
      },
      {
        id: 'dar-ps-3',
        name: 'LUMO Mlimani City Mall Hub',
        code: 'DAR-PS-03',
        city: 'Dar es Salaam',
        address: 'Sam Nujoma Rd, Mlimani City Entrance 2',
        managerName: 'Kelvin Mushi',
        contactPhone: '+255 712 334 556',
        capacityPackages: 400,
        currentPackages: 24,
        operatingHours: '08:30 - 21:30'
      }
    ];

    const insertStation = rawDb.prepare(`
      INSERT OR REPLACE INTO pickup_stations (
        id, name, code, city, address, manager_name, contact_phone, capacity_packages, current_packages, operating_hours
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stats.pickupStations = 0;
    for (const ps of defaultStations) {
      runSql(
        insertStation,
        ps.id,
        ps.name,
        ps.code,
        ps.city,
        ps.address,
        ps.managerName,
        ps.contactPhone,
        ps.capacityPackages,
        ps.currentPackages,
        ps.operatingHours
      );
      stats.pickupStations++;
    }

    // 2. Warehouses
    const insertWh = rawDb.prepare(`
      INSERT OR REPLACE INTO warehouses (
        id, name, code, city, address, manager_name, contact_phone, capacity_units, current_utilization_units, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stats.warehouses = 0;
    for (const w of dbData.warehouses || []) {
      runSql(
        insertWh,
        w.id,
        w.name,
        w.code,
        w.city,
        w.address,
        w.managerName || 'Warehouse Manager',
        w.contactPhone || '+255 700 000 000',
        w.capacityUnits || 50000,
        w.currentUtilizationUnits || 10000,
        w.isActive ? 1 : 0
      );
      stats.warehouses++;
    }

    // 3. Sellers
    const insertSeller = rawDb.prepare(`
      INSERT OR REPLACE INTO sellers (
        id, name, city, country, rating, total_reviews, products_count, 
        followers_count, is_live_commerce_active, live_stream_title, joined_year, 
        response_rate, ship_on_time_rate, is_official_store, badge, avatar, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stats.sellers = 0;
    for (const s of dbData.sellers || []) {
      runSql(
        insertSeller,
        s.id,
        s.name,
        s.city || 'Dar es Salaam',
        s.country || 'Tanzania',
        s.rating || 5.0,
        s.totalReviews || 0,
        s.productsCount || 0,
        s.followersCount || 0,
        s.isLiveCommerceActive ? 1 : 0,
        s.liveStreamTitle || null,
        s.joinedYear || 2025,
        s.responseRate || '99%',
        s.shipOnTimeRate || '98%',
        s.isOfficialStore ? 1 : 0,
        s.badge || null,
        s.avatar || null,
        s.description || null
      );
      stats.sellers++;
    }

    // 4. Users
    const insertUser = rawDb.prepare(`
      INSERT OR REPLACE INTO users (
        id, email, phone, name, role, avatar, seller_id, pickup_station_id, 
        salesperson_id, warehouse_id, is_active, is_verified, is_high_risk_flagged, 
        reliability_score, cancellation_count, uncollected_pickup_count, permissions_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stats.users = 0;
    for (const u of dbData.users || []) {
      runSql(
        insertUser,
        u.id,
        u.email,
        u.phone || '+255 700 000 000',
        u.name,
        u.role,
        u.avatar || null,
        u.sellerId || null,
        u.pickupStationId || null,
        u.salespersonId || null,
        u.warehouseId || null,
        u.isActive ? 1 : 0,
        u.isVerified ? 1 : 0,
        u.isHighRiskFlagged ? 1 : 0,
        u.reliabilityScore ?? 100,
        u.cancellationCount ?? 0,
        u.uncollectedPickupCount ?? 0,
        u.permissions || [],
        u.createdAt || new Date().toISOString()
      );
      stats.users++;
    }

    // 5. Categories
    const insertCategory = rawDb.prepare(`
      INSERT OR REPLACE INTO categories (id, name, slug, icon, image, product_count, subcategories_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stats.categories = 0;
    for (const c of dbData.categories || []) {
      runSql(
        insertCategory,
        c.id,
        c.name,
        c.slug || c.id,
        c.icon || null,
        c.image || null,
        c.productCount || 0,
        c.subcategories || []
      );
      stats.categories++;
    }

    // 6. Brands
    const insertBrand = rawDb.prepare(`
      INSERT OR REPLACE INTO brands (id, name, logo, is_official, product_count)
      VALUES (?, ?, ?, ?, ?)
    `);
    stats.brands = 0;
    for (const b of dbData.brands || []) {
      runSql(
        insertBrand,
        b.id,
        b.name,
        b.logo || null,
        b.isOfficial ? 1 : 0,
        b.productCount || 0
      );
      stats.brands++;
    }

    // 7. Products
    const insertProduct = rawDb.prepare(`
      INSERT OR REPLACE INTO products (
        id, name, brand, category, subcategory, seller_id, seller_name, seller_city,
        price, old_price, discount_percentage, rating, review_count, stock, sold_count,
        is_flash_sale, flash_sale_ends_at, badges_json, images_json, thumbnail,
        description, short_description, key_features_json, specifications_json, variations_json,
        condition, warranty, free_delivery_eligible, weight_kg, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stats.products = 0;
    for (const p of dbData.products || []) {
      runSql(
        insertProduct,
        p.id,
        p.name,
        p.brand || 'LUMO Partner',
        p.category || 'Electronics',
        p.subcategory || null,
        p.sellerId || '',
        p.sellerName || '',
        p.sellerCity || 'Dar es Salaam',
        p.price || 0,
        p.oldPrice || null,
        p.discountPercentage || 0,
        p.rating || 5.0,
        p.reviewCount || 0,
        p.stock || 0,
        p.soldCount || 0,
        p.isFlashSale ? 1 : 0,
        p.flashSaleEndsAt || null,
        p.badges || [],
        p.images || [p.thumbnail],
        p.thumbnail || p.images?.[0] || '',
        p.description || '',
        p.shortDescription || '',
        p.keyFeatures || [],
        p.specifications || [],
        p.variations || [],
        p.condition || 'Brand New',
        p.warranty || '1 Year Official Warranty',
        p.freeDeliveryEligible ? 1 : 0,
        p.weightKg || 1.0,
        p.createdAt || new Date().toISOString(),
        p.updatedAt || new Date().toISOString()
      );
      stats.products++;
    }

    // 8. Inventory
    const insertInventory = rawDb.prepare(`
      INSERT OR REPLACE INTO inventory (
        id, product_id, product_name, sku, seller_id, warehouse_id, available, reserved, reorder_level, status, location_bin, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stats.inventory = 0;
    for (const i of dbData.inventory || []) {
      runSql(
        insertInventory,
        i.id,
        i.productId,
        i.productName,
        i.sku || `LM-SKU-${i.productId}`,
        i.sellerId || '',
        i.warehouseId || 'wh-dar-central',
        i.available || 0,
        i.reserved || 0,
        i.reorderLevel || 10,
        i.status || 'IN_STOCK',
        i.locationBin || 'Aisle 1 - Shelf A',
        i.updatedAt || new Date().toISOString()
      );
      stats.inventory++;
    }

    // 9. Orders
    const insertOrder = rawDb.prepare(`
      INSERT OR REPLACE INTO orders (
        id, order_number, customer_name, customer_email, customer_phone, customer_data_json,
        items_json, delivery_address_json, delivery_method_json, payment_method_json,
        pricing_json, status, status_history_json, tracking_number, estimated_delivery_date,
        is_direct_vendor_payout, escrow_bypassed, salesperson_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stats.orders = 0;
    for (const o of dbData.orders || []) {
      runSql(
        insertOrder,
        o.id,
        o.orderNumber,
        o.customer?.name || 'Customer',
        o.customer?.email || 'customer@example.com',
        o.customer?.phone || '+255 700 000 000',
        o.customer || {},
        o.items || [],
        o.deliveryAddress || {},
        o.deliveryMethod || {},
        o.paymentMethod || {},
        o.pricing || {},
        o.status || 'Processing',
        o.statusHistory || [],
        o.trackingNumber || `LM-TZ-${Math.floor(1000000 + Math.random() * 9000000)}-EXP`,
        o.estimatedDeliveryDate || null,
        o.isDirectVendorPayout ? 1 : 0,
        o.escrowBypassed ? 1 : 0,
        o.salespersonId || null,
        o.createdAt || new Date().toISOString(),
        o.updatedAt || new Date().toISOString()
      );
      stats.orders++;
    }

    // 10. Warehouse Tasks
    const insertWhTask = rawDb.prepare(`
      INSERT OR REPLACE INTO warehouse_tasks (
        id, task_number, warehouse_id, type, order_id, order_number, items_json, status, priority, assigned_to_id, assigned_to_name, created_at, completed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stats.warehouseTasks = 0;
    for (const t of dbData.warehouseTasks || []) {
      runSql(
        insertWhTask,
        t.id,
        t.taskNumber,
        t.warehouseId || 'wh-dar-central',
        t.type || 'PICKING',
        t.orderId,
        t.orderNumber,
        t.items || [],
        t.status || 'PENDING',
        t.priority || 'MEDIUM',
        t.assignedToId || null,
        t.assignedToName || null,
        t.createdAt || new Date().toISOString(),
        t.completedAt || null
      );
      stats.warehouseTasks++;
    }

    // 11. Delivery Runs & Tasks
    const insertRun = rawDb.prepare(`
      INSERT OR REPLACE INTO delivery_runs (
        id, run_number, agent_id, agent_name, vehicle_type, status, start_time, end_time, total_parcels, completed_parcels
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stats.deliveryRuns = 0;
    for (const r of dbData.deliveryRuns || []) {
      runSql(
        insertRun,
        r.id,
        r.runNumber,
        r.agentId,
        r.agentName,
        r.vehicleType || 'Motorcycle',
        r.status || 'ASSIGNED',
        r.startTime || null,
        r.endTime || null,
        r.totalParcels || 0,
        r.completedParcels || 0
      );
      stats.deliveryRuns++;
    }

    const insertDelTask = rawDb.prepare(`
      INSERT OR REPLACE INTO delivery_tasks (
        id, delivery_run_id, order_id, order_number, customer_name, customer_phone, address, delivery_notes, payment_method, cod_amount, is_cod_collected, status, otp_code, proof_of_delivery_json, created_at, completed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stats.deliveryTasks = 0;
    for (const d of dbData.deliveryTasks || []) {
      runSql(
        insertDelTask,
        d.id,
        d.deliveryRunId || 'run-dar-01',
        d.orderId,
        d.orderNumber,
        d.customerName || 'Customer',
        d.customerPhone || '+255 700 000 000',
        d.address || 'Dar es Salaam',
        d.deliveryNotes || null,
        d.paymentMethod || 'prepaid',
        d.codAmount || 0,
        d.isCodCollected ? 1 : 0,
        d.status || 'QUEUED',
        d.otpCode || '1234',
        d.proofOfDelivery || null,
        d.createdAt || new Date().toISOString(),
        d.completedAt || null
      );
      stats.deliveryTasks++;
    }

    // 12. Pickup Inventory
    const insertPickupInv = rawDb.prepare(`
      INSERT OR REPLACE INTO pickup_inventory (
        id, station_id, station_name, order_id, order_number, customer_name, customer_phone, shelf_location, package_count, received_at, expires_at, status, otp_code, collected_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stats.pickupInventory = 0;
    for (const pi of dbData.pickupInventory || []) {
      runSql(
        insertPickupInv,
        pi.id,
        pi.stationId || 'dar-ps-1',
        pi.stationName || 'LUMO Kariakoo Station Hub',
        pi.orderId,
        pi.orderNumber,
        pi.customerName || 'Customer',
        pi.customerPhone || '+255 700 000 000',
        pi.shelfLocation || 'Shelf A-01',
        pi.packageCount || 1,
        pi.receivedAt || new Date().toISOString(),
        pi.expiresAt || new Date(Date.now() + 86400000 * 5).toISOString(),
        pi.status || 'READY_FOR_PICKUP',
        pi.otpCode || '4892',
        pi.collectedAt || null
      );
      stats.pickupInventory++;
    }

    // 13. Seller KYC & Payouts & Ledger
    const insertKyc = rawDb.prepare(`
      INSERT OR REPLACE INTO seller_kyc (
        id, seller_id, business_registration_number, tin_number, national_id_or_passport, director_name, status, submitted_at, verified_at, documents_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stats.sellerKYC = 0;
    for (const k of dbData.sellerKYC || []) {
      runSql(
        insertKyc,
        k.id,
        k.sellerId,
        k.businessRegistrationNumber || null,
        k.tinNumber || null,
        k.nationalIdOrPassport || null,
        k.directorName || null,
        k.status || 'APPROVED',
        k.submittedAt || new Date().toISOString(),
        k.verifiedAt || null,
        k.documents || []
      );
      stats.sellerKYC++;
    }

    const insertPayout = rawDb.prepare(`
      INSERT OR REPLACE INTO seller_payouts (
        id, payout_number, seller_id, amount, currency, status, method, account_details_json, requested_at, processed_at, reference_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stats.sellerPayouts = 0;
    for (const p of dbData.sellerPayouts || []) {
      runSql(
        insertPayout,
        p.id,
        p.payoutNumber,
        p.sellerId,
        p.amount || 0,
        p.currency || 'TZS',
        p.status || 'PAID',
        p.method || 'M-PESA',
        p.accountDetails || {},
        p.requestedAt || new Date().toISOString(),
        p.processedAt || null,
        p.referenceCode || null
      );
      stats.sellerPayouts++;
    }

    const insertLedger = rawDb.prepare(`
      INSERT OR REPLACE INTO financial_ledger (
        id, seller_id, order_id, type, amount, fee, net, balance_after, currency, description, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stats.financialLedger = 0;
    for (const l of dbData.financialLedger || []) {
      runSql(
        insertLedger,
        l.id,
        l.sellerId || null,
        l.orderId || null,
        l.type || 'ESCROW_DEPOSIT',
        l.amount || 0,
        l.fee || 0,
        l.net || l.amount || 0,
        l.balanceAfter || 0,
        l.currency || 'TZS',
        l.description || 'Transaction',
        l.createdAt || new Date().toISOString()
      );
      stats.financialLedger++;
    }

    // 14. Commission Rules, Sales Leads, Targets, Activities
    const insertRule = rawDb.prepare(`
      INSERT OR REPLACE INTO commission_rules (
        id, category, rate_percentage, min_fee, max_fee, is_active, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stats.commissionRules = 0;
    for (const r of dbData.commissionRules || []) {
      runSql(
        insertRule,
        r.id,
        r.category,
        r.ratePercentage || 5,
        r.minFee || 0,
        r.maxFee || null,
        r.isActive ? 1 : 0,
        r.updatedAt || new Date().toISOString()
      );
      stats.commissionRules++;
    }

    const insertLead = rawDb.prepare(`
      INSERT OR REPLACE INTO sales_leads (
        id, salesperson_id, salesperson_name, lead_type, business_name, contact_name, phone, email, region, city, status, notes_json, expected_monthly_volume, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stats.salesLeads = 0;
    for (const l of dbData.salesLeads || []) {
      runSql(
        insertLead,
        l.id,
        l.salespersonId || 'sp-01',
        l.salespersonName || 'John Mboya',
        l.leadType || 'CUSTOMER',
        l.businessName || null,
        l.contactName || 'Lead Contact',
        l.phone || '+255 700 000 000',
        l.email || 'lead@example.com',
        l.region || 'Dar es Salaam',
        l.city || 'Dar es Salaam',
        l.status || 'PROSPECT',
        l.notes || [],
        l.expectedMonthlyVolume || 0,
        l.createdAt || new Date().toISOString(),
        l.updatedAt || new Date().toISOString()
      );
      stats.salesLeads++;
    }

    const insertTarget = rawDb.prepare(`
      INSERT OR REPLACE INTO sales_targets (
        id, salesperson_id, period, target_amount, achieved_amount, commission_earned, leads_target, leads_achieved
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stats.salesTargets = 0;
    for (const t of dbData.salesTargets || []) {
      runSql(
        insertTarget,
        t.id,
        t.salespersonId || 'sp-01',
        t.period || 'Q1 2026',
        t.targetAmount || 50000000,
        t.achievedAmount || 0,
        t.commissionEarned || 0,
        t.leadsTarget || 20,
        t.leadsAchieved || 0
      );
      stats.salesTargets++;
    }

    const insertAct = rawDb.prepare(`
      INSERT OR REPLACE INTO sales_activities (
        id, salesperson_id, lead_id, type, title, details, location, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stats.salesActivities = 0;
    for (const a of dbData.salesActivities || []) {
      runSql(
        insertAct,
        a.id,
        a.salespersonId || 'sp-01',
        a.leadId || null,
        a.type || 'CALL',
        a.title || 'Client Meeting',
        a.details || 'Followed up on quote',
        a.location || 'Dar es Salaam',
        a.timestamp || new Date().toISOString()
      );
      stats.salesActivities++;
    }

    // 15. Support, Moderation, Returns, Notifications, Audit Logs
    const insertTicket = rawDb.prepare(`
      INSERT OR REPLACE INTO support_tickets (
        id, ticket_number, user_id, user_name, user_email, user_phone, role, order_id, order_number, category, subject, status, priority, messages_json, internal_notes_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stats.supportTickets = 0;
    for (const tk of dbData.supportTickets || []) {
      runSql(
        insertTicket,
        tk.id,
        tk.ticketNumber,
        tk.userId || '',
        tk.userName || 'Customer',
        tk.userEmail || 'customer@example.com',
        tk.userPhone || '+255 700 000 000',
        tk.role || 'CUSTOMER',
        tk.orderId || null,
        tk.orderNumber || null,
        tk.category || 'DELIVERY',
        tk.subject || 'Support Ticket',
        tk.status || 'OPEN',
        tk.priority || 'MEDIUM',
        tk.messages || [],
        tk.internalNotes || [],
        tk.createdAt || new Date().toISOString(),
        tk.updatedAt || new Date().toISOString()
      );
      stats.supportTickets++;
    }

    const insertMod = rawDb.prepare(`
      INSERT OR REPLACE INTO moderation_items (
        id, type, target_id, target_title, reporter_user_id, reason, status, created_at, action_taken
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stats.moderationItems = 0;
    for (const m of dbData.moderationItems || []) {
      runSql(
        insertMod,
        m.id,
        m.type || 'PRODUCT',
        m.targetId || 'item-unknown',
        m.targetTitle || m.targetId || 'Moderation Report Target',
        m.reporterUserId || null,
        m.reason || 'Policy check',
        m.status || 'PENDING',
        m.createdAt || new Date().toISOString(),
        m.actionTaken || null
      );
      stats.moderationItems++;
    }

    const insertRet = rawDb.prepare(`
      INSERT OR REPLACE INTO returns (
        id, return_number, order_id, order_number, customer_id, customer_name, seller_id, seller_name, product_id, product_name, product_image, quantity, refund_amount, reason, customer_comment, images_json, status, pickup_station_or_address, rejection_reason, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stats.returns = 0;
    for (const r of dbData.returns || []) {
      runSql(
        insertRet,
        r.id,
        r.returnNumber,
        r.orderId,
        r.orderNumber,
        r.customerId,
        r.customerName,
        r.sellerId,
        r.sellerName,
        r.productId,
        r.productName,
        r.productImage || null,
        r.quantity || 1,
        r.refundAmount || 0,
        r.reason,
        r.customerComment || '',
        r.images || [],
        r.status || 'RETURN_REQUESTED',
        r.pickupStationOrAddress || 'LUMO Kariakoo Station Hub',
        r.rejectionReason || null,
        r.createdAt || new Date().toISOString(),
        r.updatedAt || new Date().toISOString()
      );
      stats.returns++;
    }

    const insertNotif = rawDb.prepare(`
      INSERT OR REPLACE INTO notifications (
        id, user_id, title, message, type, is_read, link_url, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stats.notifications = 0;
    for (const n of dbData.notifications || []) {
      runSql(
        insertNotif,
        n.id,
        n.userId,
        n.title,
        n.message,
        n.type || 'ORDER',
        n.isRead ? 1 : 0,
        n.linkUrl || null,
        n.createdAt || new Date().toISOString()
      );
      stats.notifications++;
    }

    const insertAudit = rawDb.prepare(`
      INSERT OR REPLACE INTO audit_logs (
        id, user_id, user_name, user_role, action, entity_type, entity_id, previous_value, new_value, ip_address, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stats.auditLogs = 0;
    for (const a of dbData.auditLogs || []) {
      runSql(
        insertAudit,
        a.id,
        a.userId,
        a.userName,
        a.userRole,
        a.action,
        a.entityType,
        a.entityId,
        a.previousValue || null,
        a.newValue || null,
        a.ipAddress || null,
        a.timestamp || new Date().toISOString()
      );
      stats.auditLogs++;
    }

    // 16. Applications & Live Sessions
    const insertVApp = rawDb.prepare(`
      INSERT OR REPLACE INTO vendor_applications (id, business_name, contact_person, phone, email, category, city, status, submitted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stats.vendorApplications = 0;
    for (const va of dbData.vendorApplications || []) {
      runSql(
        insertVApp,
        va.id,
        va.businessName || va.storeName || 'Vendor Merchant',
        va.contactPerson || va.contactName || 'Contact Person',
        va.phone || '+255 700 000 000',
        va.email || 'vendor@example.com',
        va.category || 'General Merchandise',
        va.city || 'Dar es Salaam',
        va.status || 'PENDING',
        va.submittedAt || va.createdAt || new Date().toISOString()
      );
      stats.vendorApplications++;
    }

    const insertRApp = rawDb.prepare(`
      INSERT OR REPLACE INTO rider_applications (id, name, phone, city, vehicle_type, license_number, status, submitted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stats.riderApplications = 0;
    for (const ra of dbData.riderApplications || []) {
      runSql(
        insertRApp,
        ra.id,
        ra.name || ra.fullName || 'Delivery Rider',
        ra.phone || '+255 700 000 000',
        ra.city || 'Dar es Salaam',
        ra.vehicleType || 'MOTORCYCLE',
        ra.licenseNumber || ra.drivingLicenseNumber || 'DL-TZ-000000',
        ra.status || 'PENDING',
        ra.submittedAt || ra.createdAt || new Date().toISOString()
      );
      stats.riderApplications++;
    }

    const insertSApp = rawDb.prepare(`
      INSERT OR REPLACE INTO sales_applications (id, name, phone, email, region, experience_years, status, submitted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stats.salesApplications = 0;
    for (const sa of dbData.salesApplications || []) {
      runSql(
        insertSApp,
        sa.id,
        sa.name || sa.fullName || 'Sales Agent',
        sa.phone || '+255 700 000 000',
        sa.email || 'sales@example.com',
        sa.region || 'Dar es Salaam',
        parseInt(sa.experienceYears) || 1,
        sa.status || 'PENDING',
        sa.submittedAt || sa.createdAt || new Date().toISOString()
      );
      stats.salesApplications++;
    }

    const insertLive = rawDb.prepare(`
      INSERT OR REPLACE INTO live_sessions (id, seller_id, seller_name, title, is_live, is_recording, viewers_count, likes_count, tagged_product_ids_json, started_at, ended_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stats.liveSessions = 0;
    for (const ls of dbData.liveSessions || []) {
      runSql(
        insertLive,
        ls.id,
        ls.sellerId,
        ls.sellerName,
        ls.title,
        ls.isLive ? 1 : 0,
        ls.isRecording ? 1 : 0,
        ls.viewersCount || 0,
        ls.likesCount || 0,
        ls.taggedProductIds || [],
        ls.startedAt || new Date().toISOString(),
        ls.endedAt || null
      );
      stats.liveSessions++;
    }

    // Seed default Platform Builder config into D1
    const defaultBuilderConfig = {
      features: [
        { id: 'f1', name: 'Live Video Commerce', key: 'LIVE_COMMERCE', enabled: true, category: 'Marketing' },
        { id: 'f2', name: 'Escrow Protection Engine', key: 'ESCROW_ENGINE', enabled: true, category: 'Payments' },
        { id: 'f3', name: 'Automated Commission Split', key: 'AUTO_COMMISSION', enabled: true, category: 'Financials' },
        { id: 'f4', name: 'Pickup Station OTP Verification', key: 'PICKUP_OTP', enabled: true, category: 'Logistics' },
        { id: 'f5', name: 'Rider GPS Tracking Simulation', key: 'RIDER_GPS', enabled: true, category: 'Logistics' },
        { id: 'f6', name: 'Multi-Warehouse Inventory Sync', key: 'WAREHOUSE_SYNC', enabled: true, category: 'Inventory' },
        { id: 'f7', name: 'High-Risk Buyer COD Prevention', key: 'COD_RISK_LOCK', enabled: true, category: 'Risk Management' }
      ],
      commissionRules: dbData.commissionRules || [],
      deliveryRules: [
        { id: 'dr1', name: 'Same Day Express Dar es Salaam', flatRate: 5000, freeDeliveryThreshold: 100000, enabled: true },
        { id: 'dr2', name: 'Standard Nationwide Regional', flatRate: 8000, freeDeliveryThreshold: 200000, enabled: true },
        { id: 'dr3', name: 'Pickup Station Collection', flatRate: 2000, freeDeliveryThreshold: 50000, enabled: true }
      ]
    };

    const insertConfig = rawDb.prepare(`
      INSERT OR REPLACE INTO platform_builder_configs (id, config_key, config_value_json, updated_at)
      VALUES (?, ?, ?, ?)
    `);
    runSql(
      insertConfig,
      'cfg-main',
      'GLOBAL_BUILDER_CONFIG',
      defaultBuilderConfig,
      new Date().toISOString()
    );
    stats.platformBuilderConfigs = 1;

    rawDb.exec('COMMIT;');
    rawDb.exec('PRAGMA foreign_keys = ON;');

    console.log('✓ CLOUDFLARE D1 / SQLITE MIGRATION COMPLETED SUCCESSFULLY:');
    console.table(stats);
  } catch (error) {
    rawDb.exec('ROLLBACK;');
    rawDb.exec('PRAGMA foreign_keys = ON;');
    console.error('Migration failed with error:', error);
    throw error;
  }
}

runMigration().catch(console.error);

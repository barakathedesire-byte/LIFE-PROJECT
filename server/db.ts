import * as crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { d1 } from './d1.js';

import {
  UserAccount,
  UserRole,
  AuthSession,
  Product,
  Category,
  Brand,
  Order,
  InventoryItem,
  InventoryMovement,
  InventoryMovementType,
  PickupStation,
  Warehouse,
  WarehouseTask,
  DeliveryRun,
  DeliveryTask,
  PickupStationInventory,
  SellerKYC,
  SellerPayout,
  FinancialLedgerEntry,
  CommissionRule,
  SalespersonLead,
  SalespersonTarget,
  SalesActivity,
  SupportTicket,
  ModerationItem,
  ReturnRequest,
  AuditLogEntry,
  NotificationItem,
  AdvertisingCampaign,
  PlatformAnalytics,
  Seller,
  VendorApplication,
  RiderApplication,
  SalesApplication,
  PickupApplication,
  LiveCommerceSession,
  StockCatalogItem,
  Promotion,
  FinanceLead,
  VendorSettlement,
  FinancialDecisionInsight
} from '../src/types/index.js';
import { generateSessionToken, safeCompareTokens } from './utils/security.js';

export interface DatabaseSchema {
  users: UserAccount[];
  sessions: AuthSession[];
  sellers: Seller[];
  products: Product[];
  categories: Category[];
  brands: Brand[];
  orders: Order[];
  inventory: InventoryItem[];
  inventoryMovements: InventoryMovement[];
  pickupStations: PickupStation[];
  warehouses: Warehouse[];
  warehouseTasks: WarehouseTask[];
  deliveryRuns: DeliveryRun[];
  deliveryTasks: DeliveryTask[];
  pickupInventory: PickupStationInventory[];
  sellerKYC: SellerKYC[];
  sellerPayouts: SellerPayout[];
  financialLedger: FinancialLedgerEntry[];
  commissionRules: CommissionRule[];
  salesLeads: SalespersonLead[];
  salesTargets: SalespersonTarget[];
  salesActivities: SalesActivity[];
  supportTickets: SupportTicket[];
  moderationItems: ModerationItem[];
  returns: ReturnRequest[];
  notifications: NotificationItem[];
  advertisingCampaigns: AdvertisingCampaign[];
  auditLogs: AuditLogEntry[];
  vendorApplications: VendorApplication[];
  riderApplications: RiderApplication[];
  salesApplications: SalesApplication[];
  pickupApplications: PickupApplication[];
  liveSessions: LiveCommerceSession[];
  stockCatalog: StockCatalogItem[];
  promotions: Promotion[];
  financeLeads: FinanceLead[];
  vendorSettlements: VendorSettlement[];
  financialInsights: FinancialDecisionInsight[];
  builderConfig?: any;
}

class LumoD1DatabaseAdapter {
  private inMemoryDb: DatabaseSchema;
  private isLoaded = false;

  constructor() {
    this.inMemoryDb = this.loadFromD1();
    this.seedInitialData();
    this.isLoaded = true;
  }

  public reload() {
    this.inMemoryDb = this.loadFromD1();
    this.seedInitialData();
    return this.inMemoryDb;
  }

  private seedInitialData() {
    const dbData = this.getDb();
    const hasNewCategories = (dbData.categories || []).some(c => c.name === 'Phones & Tablets');
    if (dbData.categories && dbData.categories.length > 0 && hasNewCategories) return;

    console.log('[DB] Seeding/Updating initial categories and subcategories...');
    
    const initialCategories = [
      {
        id: 'cat-phones',
        name: 'Phones & Tablets',
        slug: 'phones-tablets',
        icon: 'Smartphone',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
        subcategories: [
          { id: 'sub-ph-1', name: 'Smartphones', slug: 'smartphones', itemCount: 0 },
          { id: 'sub-ph-2', name: 'Tablets & iPads', slug: 'tablets-ipads', itemCount: 0 },
          { id: 'sub-ph-3', name: 'Feature Phones', slug: 'feature-phones', itemCount: 0 },
          { id: 'sub-ph-4', name: 'Accessories & Chargers', slug: 'accessories-chargers', itemCount: 0 },
          { id: 'sub-ph-5', name: 'Smartwatches & Bands', slug: 'smartwatches-bands', itemCount: 0 }
        ]
      },
      {
        id: 'cat-electronics',
        name: 'Electronics',
        slug: 'electronics',
        icon: 'Tv',
        image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800',
        subcategories: [
          { id: 'sub-elec-5', name: 'Smart TVs & Soundbars', slug: 'smart-tvs-soundbars', itemCount: 0 },
          { id: 'sub-elec-4', name: 'Headphones & Earbuds', slug: 'headphones-earbuds', itemCount: 0 },
          { id: 'sub-elec-7', name: 'Home Theatres & Speakers', slug: 'home-theatres-speakers', itemCount: 0 },
          { id: 'sub-elec-8', name: 'Cameras & Drones', slug: 'cameras-drones', itemCount: 0 },
          { id: 'sub-elec-6', name: 'Electronic Accessories', slug: 'electronic-accessories', itemCount: 0 }
        ]
      },
      {
        id: 'cat-computing',
        name: 'Computing',
        slug: 'computers-laptops',
        icon: 'Monitor',
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
        subcategories: [
          { id: 'sub-comp-1', name: 'Laptops & MacBooks', slug: 'laptops-macbooks', itemCount: 0 },
          { id: 'sub-comp-2', name: 'Desktop Computers', slug: 'desktop-computers', itemCount: 0 },
          { id: 'sub-comp-3', name: 'Printers & Scanners', slug: 'printers-scanners', itemCount: 0 },
          { id: 'sub-comp-4', name: 'External Drives & Flash', slug: 'external-drives-flash', itemCount: 0 }
        ]
      },
      {
        id: 'cat-appliances',
        name: 'Appliances',
        slug: 'appliances',
        icon: 'Zap',
        image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800',
        subcategories: [
          { id: 'sub-app-1', name: 'Fridges & Freezers', slug: 'fridges-freezers', itemCount: 0 },
          { id: 'sub-app-2', name: 'Blenders & Juicers', slug: 'blenders-juicers', itemCount: 0 },
          { id: 'sub-app-3', name: 'Microwaves & Ovens', slug: 'microwaves-ovens', itemCount: 0 },
          { id: 'sub-app-4', name: 'Washing Machines', slug: 'washing-machines', itemCount: 0 }
        ]
      },
      {
        id: 'cat-fashion',
        name: 'Fashion',
        slug: 'fashion',
        icon: 'Shirt',
        image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800',
        subcategories: [
          { id: 'sub-fash-1', name: "Men's Fashion & Wear", slug: 'mens-fashion-wear', itemCount: 0 },
          { id: 'sub-fash-2', name: "Women's Fashion & Dresses", slug: 'womens-fashion-dresses', itemCount: 0 },
          { id: 'sub-fash-3', name: 'Sneakers & Footwear', slug: 'sneakers-footwear', itemCount: 0 },
          { id: 'sub-fash-4', name: 'Watches & Bags', slug: 'watches-bags', itemCount: 0 }
        ]
      },
      {
        id: 'cat-kids',
        name: 'Babies & Kids',
        slug: 'babies-kids',
        icon: 'Baby',
        image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800',
        subcategories: [
          { id: 'sub-kids-1', name: 'Diapers & Sensitive Wipes', slug: 'diapers-wipes', itemCount: 0 },
          { id: 'sub-kids-2', name: 'Baby Feeding & Sterilizers', slug: 'baby-feeding-sterilizers', itemCount: 0 },
          { id: 'sub-kids-3', name: 'Learning Toys & Games', slug: 'learning-toys-games', itemCount: 0 },
          { id: 'sub-kids-4', name: 'Strollers & Car Seats', slug: 'strollers-car-seats', itemCount: 0 },
          { id: 'sub-kids-5', name: 'Kids Clothing & Footwear', slug: 'kids-clothing-footwear', itemCount: 0 }
        ]
      },
      {
        id: 'cat-automotive',
        name: 'Automotive',
        slug: 'automotive',
        icon: 'Car',
        image: 'https://images.unsplash.com/photo-1485291571170-d3a05869e37b?w=800',
        subcategories: [
          { id: 'sub-auto-1', name: 'Car Electronics & Dashcams', slug: 'car-electronics-dashcams', itemCount: 0 },
          { id: 'sub-auto-2', name: 'Oils & Maintenance', slug: 'oils-maintenance', itemCount: 0 },
          { id: 'sub-auto-4', name: 'Motorcycle Accessories', slug: 'motorcycle-accessories', itemCount: 0 }
        ]
      },
      {
        id: 'cat-beauty',
        name: 'Beauty & Health',
        slug: 'beauty',
        icon: 'Sparkles',
        image: 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?w=800',
        subcategories: [
          { id: 'sub-beau-1', name: 'Skincare & Moisturizers', slug: 'skincare-moisturizers', itemCount: 0 },
          { id: 'sub-beau-4', name: 'Perfumes & Colognes', slug: 'perfumes-colognes', itemCount: 0 },
          { id: 'sub-beau-2', name: 'Hair Care & Styling', slug: 'hair-care-styling', itemCount: 0 }
        ]
      },
      {
        id: 'cat-supermarket',
        name: 'Supermarket',
        slug: 'supermarket',
        icon: 'ShoppingBag',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
        subcategories: [
          { id: 'sub-sup-1', name: 'Food Cupboard & Grains', slug: 'food-cupboard-grains', itemCount: 0 },
          { id: 'sub-sup-2', name: 'Coffee, Tea & Juices', slug: 'coffee-tea-juices', itemCount: 0 },
          { id: 'sub-sup-3', name: 'Household Cleaners', slug: 'household-cleaners', itemCount: 0 }
        ]
      },
      {
        id: 'cat-wine',
        name: 'Wine & Spirits',
        slug: 'wine-spirits',
        icon: 'GlassWater',
        image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800',
        subcategories: [
          { id: 'sub-wine-1', name: 'Whiskey & Bourbon', slug: 'whiskey-bourbon', itemCount: 0 },
          { id: 'sub-wine-2', name: 'Vodka, Gin & Tequila', slug: 'vodka-gin-tequila', itemCount: 0 },
          { id: 'sub-wine-3', name: 'Red & White Wines', slug: 'red-white-wines', itemCount: 0 },
          { id: 'sub-wine-4', name: 'Champagne & Liqueurs', slug: 'champagne-liqueurs', itemCount: 0 }
        ]
      },
      {
        id: 'cat-agriculture',
        name: 'Agriculture & Farm',
        slug: 'agriculture',
        icon: 'Sprout',
        image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
        subcategories: [
          { id: 'sub-agri-1', name: 'Seeds & Seedlings', slug: 'seeds-seedlings', itemCount: 0 },
          { id: 'sub-agri-2', name: 'Fertilizers', slug: 'fertilizers', itemCount: 0 },
          { id: 'sub-agri-3', name: 'Farm Tools', slug: 'farm-tools', itemCount: 0 },
          { id: 'sub-agri-4', name: 'Livestock Supplies', slug: 'livestock-supplies', itemCount: 0 }
        ]
      }
    ];

    this.updateDb(d => {
      d.categories = initialCategories.map(c => ({
        ...c,
        itemCount: 0,
        iconName: c.icon
      })) as any[];
    });
  }

  private safeParseJson<T>(val: any, fallback: T): T {
    if (!val) return fallback;
    if (typeof val === 'object') return val;
    try {
      return JSON.parse(val);
    } catch {
      return fallback;
    }
  }

  public loadFromD1(): DatabaseSchema {
    const rawDb = d1.getRawDb();

    // Ensure schema migrations for auth hardening & sessions
    try {
      rawDb.exec(`
        CREATE TABLE IF NOT EXISTS sessions (
          token TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          role TEXT NOT NULL,
          created_at TEXT NOT NULL,
          expires_at TEXT NOT NULL,
          ip TEXT,
          user_agent TEXT
        );
      `);
      const userCols = rawDb.prepare("PRAGMA table_info(users)").all() as any[];
      const colNames = userCols.map(c => c.name);
      if (!colNames.includes('password_hash')) rawDb.exec("ALTER TABLE users ADD COLUMN password_hash TEXT;");
      if (!colNames.includes('department')) rawDb.exec("ALTER TABLE users ADD COLUMN department TEXT;");
      if (!colNames.includes('staff_id')) rawDb.exec("ALTER TABLE users ADD COLUMN staff_id TEXT;");
      if (!colNames.includes('status')) rawDb.exec("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'ACTIVE';");
      if (!colNames.includes('invite_token')) rawDb.exec("ALTER TABLE users ADD COLUMN invite_token TEXT;");
      if (!colNames.includes('invite_expires_at')) rawDb.exec("ALTER TABLE users ADD COLUMN invite_expires_at TEXT;");
      if (!colNames.includes('invite_accepted_at')) rawDb.exec("ALTER TABLE users ADD COLUMN invite_accepted_at TEXT;");
      if (!colNames.includes('password_reset_token')) rawDb.exec("ALTER TABLE users ADD COLUMN password_reset_token TEXT;");
      if (!colNames.includes('password_reset_code')) rawDb.exec("ALTER TABLE users ADD COLUMN password_reset_code TEXT;");
      if (!colNames.includes('password_reset_expires')) rawDb.exec("ALTER TABLE users ADD COLUMN password_reset_expires TEXT;");
      if (!colNames.includes('failed_attempts')) rawDb.exec("ALTER TABLE users ADD COLUMN failed_attempts INTEGER DEFAULT 0;");
      if (!colNames.includes('locked_until')) rawDb.exec("ALTER TABLE users ADD COLUMN locked_until TEXT;");

      const prodCols = rawDb.prepare("PRAGMA table_info(products)").all() as any[];
      const prodColNames = prodCols.map(c => c.name);
      if (!prodColNames.includes('view_count')) rawDb.exec("ALTER TABLE products ADD COLUMN view_count INTEGER DEFAULT 0;");
    } catch (e) {
      console.warn('SQLite schema check warning:', e);
    }

    // 1. Users
    const userRows = rawDb.prepare('SELECT * FROM users').all() as any[];
    const users: UserAccount[] = userRows.map(u => ({
      id: u.id,
      email: u.email,
      phone: u.phone,
      name: u.name,
      role: u.role,
      passwordHash: u.password_hash || undefined,
      avatar: u.avatar || undefined,
      sellerId: u.seller_id || undefined,
      pickupStationId: u.pickup_station_id || undefined,
      salespersonId: u.salesperson_id || undefined,
      warehouseId: u.warehouse_id || undefined,
      department: u.department || undefined,
      staffId: u.staff_id || undefined,
      status: u.status || (u.is_active ? 'ACTIVE' : 'INVITED'),
      inviteToken: u.invite_token || undefined,
      inviteExpiresAt: u.invite_expires_at || undefined,
      inviteAcceptedAt: u.invite_accepted_at || undefined,
      passwordResetToken: u.password_reset_token || undefined,
      passwordResetCode: u.password_reset_code || undefined,
      passwordResetExpires: u.password_reset_expires || undefined,
      failedAttempts: u.failed_attempts || 0,
      lockedUntil: u.locked_until || undefined,
      isActive: Boolean(u.is_active),
      isVerified: Boolean(u.is_verified),
      isHighRiskFlagged: Boolean(u.is_high_risk_flagged),
      reliabilityScore: u.reliability_score,
      cancellationCount: u.cancellation_count,
      uncollectedPickupCount: u.uncollected_pickup_count,
      permissions: this.safeParseJson(u.permissions_json, []),
      createdAt: u.created_at
    }));

    // 1B. Sessions
    let sessions: AuthSession[] = [];
    try {
      const sessionRows = rawDb.prepare('SELECT * FROM sessions').all() as any[];
      sessions = sessionRows.map(s => ({
        token: s.token,
        userId: s.user_id,
        role: s.role,
        createdAt: s.created_at,
        expiresAt: s.expires_at,
        ip: s.ip || undefined,
        userAgent: s.user_agent || undefined
      }));
    } catch (err) {
      sessions = [];
    }

    // 2. Sellers
    const sellerRows = rawDb.prepare('SELECT * FROM sellers').all() as any[];
    const sellers: Seller[] = sellerRows.map(s => ({
      id: s.id,
      name: s.name,
      city: s.city,
      country: s.country,
      rating: s.rating,
      totalReviews: s.total_reviews,
      productsCount: s.products_count,
      followersCount: s.followers_count,
      isLiveCommerceActive: Boolean(s.is_live_commerce_active),
      liveStreamTitle: s.live_stream_title || undefined,
      joinedYear: s.joined_year,
      responseRate: s.response_rate,
      shipOnTimeRate: s.ship_on_time_rate,
      isOfficialStore: Boolean(s.is_official_store),
      badge: s.badge || undefined,
      avatar: s.avatar || undefined,
      description: s.description || undefined
    }));

    // 3. Categories
    const catRows = rawDb.prepare('SELECT * FROM categories').all() as any[];
    const categories: Category[] = catRows.map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug || c.id,
      iconName: c.icon || 'Folder',
      image: c.image || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500',
      itemCount: c.product_count || 0,
      subcategories: this.safeParseJson(c.subcategories_json, [])
    }));

    // 4. Brands
    const brandRows = rawDb.prepare('SELECT * FROM brands').all() as any[];
    const brands: Brand[] = brandRows.map(b => ({
      id: b.id,
      name: b.name || 'Brand',
      slug: (b.name || b.id || 'brand').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      logo: b.logo || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=100',
      bannerImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200',
      description: `${b.name} official flagship store on LUMO Africa.`,
      isOfficial: Boolean(b.is_official),
      productCount: b.product_count || 0
    }));

    // 5. Products
    const prodRows = rawDb.prepare('SELECT * FROM products').all() as any[];
    const products: Product[] = prodRows.map(p => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      subcategory: p.subcategory || undefined,
      sellerId: p.seller_id,
      sellerName: p.seller_name,
      sellerCity: p.seller_city || undefined,
      price: p.price,
      oldPrice: p.old_price || undefined,
      discountPercentage: p.discount_percentage || undefined,
      rating: p.rating,
      reviewCount: p.review_count,
      stock: p.stock,
      soldCount: p.sold_count || 0,
      viewCount: p.view_count || 0,
      isFlashSale: Boolean(p.is_flash_sale),
      flashSaleEndsAt: p.flash_sale_ends_at || undefined,
      badges: this.safeParseJson(p.badges_json, []),
      images: this.safeParseJson(p.images_json, []),
      thumbnail: p.thumbnail,
      description: p.description || '',
      shortDescription: p.short_description || undefined,
      keyFeatures: this.safeParseJson(p.key_features_json, []),
      specifications: this.safeParseJson(p.specifications_json, []),
      variations: this.safeParseJson(p.variations_json, []),
      condition: p.condition || 'Brand New',
      warranty: p.warranty || '1 Year Official Warranty',
      freeDeliveryEligible: Boolean(p.free_delivery_eligible),
      weightKg: p.weight_kg,
      createdAt: p.created_at,
      updatedAt: p.updated_at
    }));

    

    // 6. Inventory
    const invRows = rawDb.prepare('SELECT * FROM inventory').all() as any[];
    const inventory: InventoryItem[] = invRows.map(i => ({
      id: i.id,
      sku: i.sku || `LM-SKU-${i.product_id}`,
      productId: i.product_id,
      productName: i.product_name,
      brand: 'LUMO Direct',
      category: 'General',
      sellerId: i.seller_id,
      warehouseId: i.warehouse_id,
      warehouseName: i.warehouse_name || 'N/A',
      locationBin: i.location_bin || 'N/A',
      available: i.available || 0,
      reserved: i.reserved || 0,
      sold: i.sold || 0,
      damaged: i.damaged || 0,
      returned: i.returned || 0,
      quarantined: i.quarantined || 0,
      inTransit: i.in_transit || 0,
      reorderLevel: i.reorder_level || 0,
      unitCost: i.unit_cost || 0,
      updatedAt: i.updated_at || new Date().toISOString()
    }));

    // 7. Orders
    const orderRows = rawDb.prepare('SELECT * FROM orders').all() as any[];
    const orders: Order[] = orderRows.map(o => ({
      id: o.id,
      orderNumber: o.order_number,
      customer: this.safeParseJson(o.customer_data_json, {
        id: 'N/A',
        name: o.customer_name || 'N/A',
        email: o.customer_email || 'N/A',
        phone: o.customer_phone || 'N/A'
      }),
      items: this.safeParseJson(o.items_json, []),
      deliveryAddress: this.safeParseJson(o.delivery_address_json, {
        fullName: o.customer_name || 'Customer',
        phone: o.customer_phone || '+255 700 000 000',
        region: 'Dar es Salaam',
        city: 'Dar es Salaam',
        area: 'Central',
        streetAddress: 'Kariakoo',
        isDefault: true
      }),
      deliveryMethod: this.safeParseJson(o.delivery_method_json, {
        type: 'standard',
        name: 'Standard Delivery',
        fee: 3000,
        estimatedDelivery: '1-2 Days'
      }),
      paymentMethod: this.safeParseJson(o.payment_method_json, {
        type: 'mobile_money',
        name: 'M-Pesa (Vodacom)',
        details: o.customer_phone || '+255 700 000 000',
        status: 'Paid (Escrow Secured)'
      }),
      pricing: this.safeParseJson(o.pricing_json, {
        subtotal: 0,
        deliveryFee: 0,
        discount: 0,
        escrowFee: 0,
        total: 0
      }),
      status: o.status,
      statusHistory: this.safeParseJson(o.status_history_json, []),
      trackingNumber: o.tracking_number,
      estimatedDeliveryDate: o.estimated_delivery_date,
      isDirectVendorPayout: Boolean(o.is_direct_vendor_payout),
      escrowBypassed: Boolean(o.escrow_bypassed),
      createdAt: o.created_at
    }));

    // 8. Warehouses & Tasks
    const whRows = rawDb.prepare('SELECT * FROM warehouses').all() as any[];
    const warehouses: Warehouse[] = whRows.map(w => ({
      id: w.id,
      name: w.name,
      code: w.code,
      region: 'Dar es Salaam',
      city: w.city,
      address: w.address,
      capacitySqM: w.capacity_units || 5000,
      utilizationRate: Math.round(((w.current_utilization_units || 1000) / (w.capacity_units || 5000)) * 100),
      activeZones: ['Dar es Salaam Central', 'Kinondoni', 'Ilala'],
      managerName: w.manager_name,
      phone: w.contact_phone
    }));

    const whTaskRows = rawDb.prepare('SELECT * FROM warehouse_tasks').all() as any[];
    const warehouseTasks: WarehouseTask[] = whTaskRows.map(t => ({
      id: t.id,
      taskNumber: t.task_number,
      warehouseId: t.warehouse_id,
      type: t.type,
      orderId: t.order_id,
      orderNumber: t.order_number,
      items: this.safeParseJson(t.items_json, []),
      status: t.status,
      priority: t.priority,
      assignedToName: t.assigned_to_name || undefined,
      createdAt: t.created_at,
      completedAt: t.completed_at || undefined
    }));

    // 9. Delivery Runs & Tasks
    const runRows = rawDb.prepare('SELECT * FROM delivery_runs').all() as any[];
    const deliveryRuns: DeliveryRun[] = runRows.map(r => ({
      id: r.id,
      runNumber: r.run_number,
      agentId: r.agent_id,
      agentName: r.agent_name,
      agentPhone: '+255 712 345 678',
      vehicleType: (r.vehicle_type || 'MOTORCYCLE').toUpperCase() as any,
      region: 'Dar es Salaam',
      zone: 'Zone 1 (Central)',
      totalOrders: r.total_parcels || 0,
      completedOrders: r.completed_parcels || 0,
      pendingCodAmount: 45000,
      collectedCodAmount: 120000,
      status: r.status
    }));

    const delTaskRows = rawDb.prepare('SELECT * FROM delivery_tasks').all() as any[];
    const deliveryTasks: DeliveryTask[] = delTaskRows.map(d => ({
      id: d.id,
      deliveryRunId: d.delivery_run_id,
      orderId: d.order_id,
      orderNumber: d.order_number,
      customerName: d.customer_name,
      customerPhone: d.customer_phone,
      address: d.address,
      deliveryNotes: d.delivery_notes || undefined,
      paymentMethod: d.payment_method || 'mobile_money',
      codAmount: d.cod_amount,
      isCodCollected: Boolean(d.is_cod_collected),
      status: d.status,
      otpCode: d.otp_code,
      proofOfDelivery: this.safeParseJson(d.proof_of_delivery_json, undefined)
    }));

    // 10. Pickup Stations & Inventory
    let pickupStations: PickupStation[] = [];
    try {
      const psRows = rawDb.prepare('SELECT * FROM pickup_stations').all() as any[];
      pickupStations = psRows.map(p => ({
        id: p.id,
        name: p.name,
        region: p.region || 'Dar es Salaam',
        district: p.district || undefined,
        area: p.area || 'Central',
        streetAddress: p.address || 'Kariakoo Market Street',
        contactName: p.manager_name || 'Station Manager',
        contactPhone: p.contact_phone || '+255 700 000 000',
        operatingHours: p.operating_hours || '08:00 - 20:00',
        capacityPackages: p.capacity_packages || 500,
        currentPackages: p.current_packages || 0,
        status: (p.status || 'ACTIVE') as any,
        fee: p.fee || 0,
        latitude: p.latitude || undefined,
        longitude: p.longitude || undefined,
        landmark: p.landmark || undefined,
        createdAt: p.created_at || new Date().toISOString(),
        approvedAt: p.approved_at || undefined
      }));
    } catch {
      pickupStations = [];
    }

    if (!pickupStations || pickupStations.length === 0) {
      pickupStations = [
        {
          id: 'dar-ps-1',
          name: 'LUMO Kariakoo Central Hub',
          region: 'Dar es Salaam',
          district: 'Ilala',
          area: 'Kariakoo',
          streetAddress: 'Swahili Street, Kariakoo Market Complex',
          contactName: 'Juma Mkwawa',
          contactPhone: '+255 714 112 233',
          operatingHours: '07:30 - 20:30 (Mon-Sat)',
          capacityPackages: 1000,
          currentPackages: 12,
          status: 'ACTIVE',
          fee: 0,
          landmark: 'Opposite Big Bank Plaza',
          createdAt: '2026-01-10T08:00:00Z',
          approvedAt: '2026-01-10T09:00:00Z'
        },
        {
          id: 'dar-ps-2',
          name: 'LUMO Mlimani City Smart Locker',
          region: 'Dar es Salaam',
          district: 'Kinondoni',
          area: 'Ubungo / Sam Nujoma',
          streetAddress: 'Mlimani City Mall Entrance B, Ground Floor',
          contactName: 'Aisha Kapungu',
          contactPhone: '+255 754 998 811',
          operatingHours: '08:00 - 22:00 (Everyday)',
          capacityPackages: 500,
          currentPackages: 8,
          status: 'ACTIVE',
          fee: 0,
          landmark: 'Near Vodacom Service Center',
          createdAt: '2026-01-12T08:00:00Z',
          approvedAt: '2026-01-12T09:00:00Z'
        },
        {
          id: 'aru-ps-1',
          name: 'LUMO Arusha Clock Tower Hub',
          region: 'Arusha',
          district: 'Arusha Urban',
          area: 'Central Plaza',
          streetAddress: 'Boma Road, Clock Tower Square',
          contactName: 'Godfrey Mollel',
          contactPhone: '+255 784 332 211',
          operatingHours: '08:00 - 19:00',
          capacityPackages: 400,
          currentPackages: 5,
          status: 'ACTIVE',
          fee: 0,
          landmark: 'Clock Tower Roundabout',
          createdAt: '2026-02-01T08:00:00Z',
          approvedAt: '2026-02-01T09:00:00Z'
        },
        {
          id: 'mza-ps-1',
          name: 'LUMO Mwanza Capri Point Hub',
          region: 'Mwanza',
          district: 'Nyamagana',
          area: 'Capri Point',
          streetAddress: 'Station Road, Near Lake Hotel',
          contactName: 'Emmanuel Marwa',
          contactPhone: '+255 768 445 566',
          operatingHours: '08:00 - 19:30',
          capacityPackages: 450,
          currentPackages: 4,
          status: 'ACTIVE',
          fee: 0,
          landmark: 'Lake Victoria Ferry Port Gate',
          createdAt: '2026-02-05T08:00:00Z',
          approvedAt: '2026-02-05T09:00:00Z'
        },
        {
          id: 'dom-ps-1',
          name: 'LUMO Dodoma Capital Hub',
          region: 'Dodoma',
          district: 'Dodoma Urban',
          area: 'Area C',
          streetAddress: 'Nyerere Way, Parliament Avenue',
          contactName: 'Hadija Rashid',
          contactPhone: '+255 712 998 776',
          operatingHours: '08:00 - 20:00',
          capacityPackages: 600,
          currentPackages: 6,
          status: 'ACTIVE',
          fee: 0,
          landmark: 'Opposite Regional Administrative Office',
          createdAt: '2026-02-10T08:00:00Z',
          approvedAt: '2026-02-10T09:00:00Z'
        },
        {
          id: 'mby-ps-1',
          name: 'LUMO Mbeya Uyole Hub',
          region: 'Mbeya',
          district: 'Mbeya City',
          area: 'Uyole Market',
          streetAddress: 'Tanzam Highway Junction',
          contactName: 'Baraka Sanga',
          contactPhone: '+255 752 114 433',
          operatingHours: '08:00 - 19:00',
          capacityPackages: 350,
          currentPackages: 3,
          status: 'ACTIVE',
          fee: 0,
          landmark: 'Uyole Bus Terminal',
          createdAt: '2026-02-15T08:00:00Z',
          approvedAt: '2026-02-15T09:00:00Z'
        },
        {
          id: 'znz-ps-1',
          name: 'LUMO Stone Town Station',
          region: 'Zanzibar',
          district: 'Urban',
          area: 'Stone Town',
          streetAddress: 'Mizingani Road, Forodhani Seafront',
          contactName: 'Khamis Ali',
          contactPhone: '+255 777 889 900',
          operatingHours: '08:00 - 20:30',
          capacityPackages: 300,
          currentPackages: 2,
          status: 'ACTIVE',
          fee: 0,
          landmark: 'Forodhani Gardens Main Entrance',
          createdAt: '2026-02-20T08:00:00Z',
          approvedAt: '2026-02-20T09:00:00Z'
        }
      ];
    }

    // 10b. Inventory Movements Ledger
    let inventoryMovements: InventoryMovement[] = [];
    try {
      const movRows = rawDb.prepare('SELECT * FROM inventory_movements').all() as any[];
      inventoryMovements = movRows.map(m => ({
        id: m.id,
        productId: m.product_id,
        sellerId: m.seller_id,
        warehouseId: m.warehouse_id || undefined,
        sku: m.sku,
        movementType: m.movement_type,
        quantity: m.quantity,
        referenceOrderId: m.reference_order_id || undefined,
        referenceOrderNumber: m.reference_order_number || undefined,
        performedByUserId: m.performed_by_user_id,
        performedByUserName: m.performed_by_user_name,
        performedByUserRole: m.performed_by_user_role,
        reason: m.reason,
        previousAvailable: m.previous_available,
        newAvailable: m.new_available,
        createdAt: m.created_at
      }));
    } catch {
      inventoryMovements = [];
    }

    // Audit and seed initial OPENING_BALANCE movement entries for existing products if movements log is empty
    if (!inventoryMovements || inventoryMovements.length === 0) {
      inventoryMovements = (products || []).map(prod => ({
        id: `mov-init-${prod.id}`,
        productId: prod.id,
        sellerId: prod.sellerId,
        warehouseId: 'wh-dar-central',
        sku: `LM-SKU-${prod.id}`,
        movementType: 'OPENING_BALANCE' as const,
        quantity: prod.stock,
        performedByUserId: 'sys-admin',
        performedByUserName: 'System Engine',
        performedByUserRole: 'SUPER_ADMIN' as const,
        reason: 'Initial system audit & stock ledger migration',
        previousAvailable: 0,
        newAvailable: prod.stock,
        createdAt: new Date().toISOString()
      }));
    }

    const pickInvRows = rawDb.prepare('SELECT * FROM pickup_inventory').all() as any[];
    const pickupInventory: PickupStationInventory[] = pickInvRows.map(p => ({
      id: p.id,
      stationId: p.station_id,
      stationName: p.station_name,
      orderId: p.order_id,
      orderNumber: p.order_number,
      customerName: p.customer_name,
      customerPhone: p.customer_phone,
      shelfLocation: p.shelf_location,
      packageCount: p.package_count,
      receivedAt: p.received_at,
      expiresAt: p.expires_at,
      status: p.status,
      otpCode: p.otp_code,
      collectedAt: p.collected_at || undefined
    }));

    // 11. KYC, Payouts, Financial Ledger
    const kycRows = rawDb.prepare('SELECT * FROM seller_kyc').all() as any[];
    const sellerKYC: SellerKYC[] = kycRows.map(k => ({
      id: k.id,
      sellerId: k.seller_id,
      businessType: 'REGISTERED_BUSINESS',
      legalName: k.director_name || 'Lumo Vendor',
      tradingName: k.director_name || 'Lumo Vendor',
      registrationNumber: k.business_registration_number || 'BRELA-9921',
      tinNumber: k.tin_number || '102-993-884',
      idType: 'NATIONAL_ID',
      idNumber: k.national_id_or_passport || '19900101-11223-00001-22',
      documents: this.safeParseJson(k.documents_json, []),
      bankDetails: {
        bankName: 'CRDB Bank',
        accountName: k.director_name || 'Lumo Vendor',
        accountNumber: '0150992837100'
      },
      status: k.status,
      submittedAt: k.submitted_at,
      reviewedAt: k.verified_at || undefined
    }));

    const payoutRows = rawDb.prepare('SELECT * FROM seller_payouts').all() as any[];
    const sellerPayouts: SellerPayout[] = payoutRows.map(p => ({
      id: p.id,
      payoutNumber: p.payout_number,
      sellerId: p.seller_id,
      sellerName: 'Vendor Store',
      amount: p.amount,
      currency: p.currency || 'TZS',
      deductions: { commission: p.amount * 0.08, shipping: 0, refunds: 0, advertisingFees: 0 },
      netAmount: p.amount * 0.92,
      paymentMethod: (p.method === 'BANK_TRANSFER' ? 'BANK_TRANSFER' : 'MOBILE_MONEY') as any,
      recipientDetails: typeof p.account_details_json === 'string' ? p.account_details_json : JSON.stringify(p.account_details_json || {}),
      status: p.status,
      requestedAt: p.requested_at,
      processedAt: p.processed_at || undefined,
      referenceNumber: p.reference_code || undefined
    }));

    const ledgerRows = rawDb.prepare('SELECT * FROM financial_ledger').all() as any[];
    const financialLedger: FinancialLedgerEntry[] = ledgerRows.map(l => ({
      id: l.id,
      sellerId: l.seller_id || undefined,
      orderId: l.order_id || undefined,
      type: l.type,
      amount: l.amount,
      fee: l.fee,
      net: l.net,
      balanceAfter: l.balance_after,
      currency: l.currency,
      description: l.description,
      createdAt: l.created_at
    }));

    // 12. Commission Rules, Sales Leads, Targets, Activities
    const ruleRows = rawDb.prepare('SELECT * FROM commission_rules').all() as any[];
    const commissionRules: CommissionRule[] = ruleRows.map(r => ({
      id: r.id,
      category: r.category,
      commissionRate: (r.rate_percentage || 8) / 100,
      fixedFee: r.min_fee || 0,
      isActive: Boolean(r.is_active)
    }));

    const leadRows = rawDb.prepare('SELECT * FROM sales_leads').all() as any[];
    const salesLeads: SalespersonLead[] = leadRows.map(l => ({
      id: l.id,
      salespersonId: l.salesperson_id,
      salespersonName: l.salesperson_name,
      leadType: l.lead_type,
      businessName: l.business_name || undefined,
      contactName: l.contact_name,
      phone: l.phone,
      email: l.email,
      region: l.region,
      city: l.city,
      status: l.status,
      notes: this.safeParseJson(l.notes_json, []),
      expectedMonthlyVolume: l.expected_monthly_volume,
      createdAt: l.created_at,
      updatedAt: l.updated_at
    }));

    const targetRows = rawDb.prepare('SELECT * FROM sales_targets').all() as any[];
    const salesTargets: SalespersonTarget[] = targetRows.map(t => ({
      id: t.id,
      salespersonId: t.salesperson_id,
      month: t.period || '2026-08',
      salesTargetAmount: t.target_amount || 50000000,
      salesAchievedAmount: t.achieved_amount || 0,
      newCustomersTarget: t.leads_target || 20,
      newCustomersAchieved: t.leads_achieved || 0,
      newSellersTarget: 5,
      newSellersAchieved: 3,
      commissionEarned: t.commission_earned || 0,
      commissionPending: 250000,
      commissionPaid: (t.commission_earned || 0) > 250000 ? (t.commission_earned || 0) - 250000 : 0,
      status: 'ON_TRACK'
    }));

    const actRows = rawDb.prepare('SELECT * FROM sales_activities').all() as any[];
    const salesActivities: SalesActivity[] = actRows.map(a => ({
      id: a.id,
      salespersonId: a.salesperson_id,
      leadId: a.lead_id || undefined,
      type: a.type,
      title: a.title,
      details: a.details,
      location: a.location || undefined,
      timestamp: a.timestamp
    }));

    // 13. Support, Moderation, Returns, Notifications, Audit Logs
    const ticketRows = rawDb.prepare('SELECT * FROM support_tickets').all() as any[];
    const supportTickets: SupportTicket[] = ticketRows.map(t => ({
      id: t.id,
      ticketNumber: t.ticket_number,
      userId: t.user_id,
      userName: t.user_name,
      userEmail: t.user_email,
      userPhone: t.user_phone,
      role: t.role,
      orderId: t.order_id || undefined,
      orderNumber: t.order_number || undefined,
      category: t.category,
      subject: t.subject,
      status: t.status,
      priority: t.priority,
      messages: this.safeParseJson(t.messages_json, []),
      internalNotes: this.safeParseJson(t.internal_notes_json, []),
      createdAt: t.created_at,
      updatedAt: t.updated_at
    }));

    const modRows = rawDb.prepare('SELECT * FROM moderation_items').all() as any[];
    const moderationItems: ModerationItem[] = modRows.map(m => ({
      id: m.id,
      type: (m.type || 'PRODUCT_APPROVAL') as any,
      targetId: m.target_id,
      targetName: m.target_title || m.target_id || 'Flagged Item',
      details: m.reason || 'Flagged by system risk detection',
      riskScore: 'MEDIUM',
      status: m.status || 'PENDING',
      createdAt: m.created_at,
      resolutionNote: m.action_taken || undefined
    }));

    // Purge any legacy demo returns matching ord-8812, LM-8812-TZ, or ret-101
    try {
      rawDb.prepare("DELETE FROM returns WHERE order_id = 'ord-8812' OR order_number = 'LM-8812-TZ' OR id = 'ret-101'").run();
    } catch {
      // Ignore if table not created yet
    }

    const retRows = rawDb.prepare('SELECT * FROM returns').all() as any[];
    const returns: ReturnRequest[] = retRows.map(r => ({
      id: r.id,
      returnNumber: r.return_number,
      orderId: r.order_id,
      orderNumber: r.order_number,
      customerId: r.customer_id,
      customerName: r.customer_name,
      sellerId: r.seller_id,
      sellerName: r.seller_name,
      productId: r.product_id,
      productName: r.product_name,
      productImage: r.product_image || undefined,
      quantity: r.quantity,
      refundAmount: r.refund_amount,
      reason: r.reason,
      customerComment: r.customer_comment || undefined,
      images: this.safeParseJson(r.images_json, []),
      status: r.status,
      pickupStationOrAddress: r.pickup_station_or_address || undefined,
      rejectionReason: r.rejection_reason || undefined,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));

    const notifRows = rawDb.prepare('SELECT * FROM notifications').all() as any[];
    const notifications: NotificationItem[] = notifRows.map(n => ({
      id: n.id,
      userId: n.user_id,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: Boolean(n.is_read),
      linkUrl: n.link_url || undefined,
      createdAt: n.created_at
    }));

    const auditRows = rawDb.prepare('SELECT * FROM audit_logs').all() as any[];
    const auditLogs: AuditLogEntry[] = auditRows.map(a => ({
      id: a.id,
      userId: a.user_id,
      userName: a.user_name,
      userRole: a.user_role,
      action: a.action,
      entityType: a.entity_type,
      entityId: a.entity_id,
      previousValue: a.previous_value || undefined,
      newValue: a.new_value || undefined,
      ipAddress: a.ip_address || undefined,
      timestamp: a.timestamp
    }));

    // 14. Applications & Live Sessions
    const vappRows = rawDb.prepare('SELECT * FROM vendor_applications').all() as any[];
    const vendorApplications: VendorApplication[] = vappRows.map(v => ({
      id: v.id,
      storeName: v.business_name,
      businessName: v.business_name,
      contactName: v.contact_person,
      contactPerson: v.contact_person,
      phone: v.phone,
      email: v.email,
      category: v.category,
      city: v.city,
      status: v.status,
      submittedAt: v.submitted_at,
      createdAt: v.submitted_at
    } as any));

    const rappRows = rawDb.prepare('SELECT * FROM rider_applications').all() as any[];
    const riderApplications: RiderApplication[] = rappRows.map(r => ({
      id: r.id,
      name: r.name,
      fullName: r.name,
      phone: r.phone,
      city: r.city,
      vehicleType: r.vehicle_type,
      licenseNumber: r.license_number,
      drivingLicenseNumber: r.license_number,
      status: r.status,
      submittedAt: r.submitted_at,
      createdAt: r.submitted_at
    } as any));

    const sappRows = rawDb.prepare('SELECT * FROM sales_applications').all() as any[];
    const salesApplications: SalesApplication[] = sappRows.map(s => ({
      id: s.id,
      name: s.name,
      fullName: s.name,
      phone: s.phone,
      email: s.email,
      region: s.region,
      experienceYears: s.experience_years,
      status: s.status,
      submittedAt: s.submitted_at,
      createdAt: s.submitted_at
    } as any));

    const liveRows = rawDb.prepare('SELECT * FROM live_sessions').all() as any[];
    const liveSessions: LiveCommerceSession[] = liveRows.map(l => ({
      id: l.id,
      sellerId: l.seller_id,
      sellerName: l.seller_name,
      title: l.title,
      isLive: Boolean(l.is_live),
      isRecording: Boolean(l.is_recording),
      viewersCount: l.viewers_count,
      likesCount: l.likes_count,
      taggedProductIds: this.safeParseJson(l.tagged_product_ids_json, []),
      startedAt: l.started_at,
      endedAt: l.ended_at || undefined
    }));

    const configRow = rawDb.prepare("SELECT config_value_json FROM platform_builder_configs WHERE config_key = 'GLOBAL_BUILDER_CONFIG'").get() as any;
    const builderConfig = configRow ? this.safeParseJson(configRow.config_value_json, null) : null;

    let promotions: Promotion[] = [];
    try {
      const promoRows = rawDb.prepare('SELECT * FROM promotions').all() as any[];
      promotions = promoRows.map(p => ({
        id: p.id,
        sellerId: p.seller_id,
        sellerName: p.seller_name || '',
        name: p.name,
        internalRef: p.internal_ref || undefined,
        description: p.description || undefined,
        imageUrl: p.image_url || undefined,
        promotionType: p.promotion_type as any,
        startDate: p.start_date,
        startTime: p.start_time,
        endDate: p.end_date,
        endTime: p.end_time,
        timezone: p.timezone || 'EAT (UTC+3)',
        status: p.status as any,
        approvalStatus: p.approval_status as any,
        rejectionReason: p.rejection_reason || undefined,
        adminComment: p.admin_comment || undefined,
        appliesTo: p.applies_to as any,
        productIds: this.safeParseJson(p.product_ids_json, []),
        categoryIds: this.safeParseJson(p.category_ids_json, []),
        excludedProductIds: this.safeParseJson(p.excluded_product_ids_json, []),
        excludedCategoryIds: this.safeParseJson(p.excluded_category_ids_json, []),
        excludeOutOfStock: Boolean(p.exclude_out_of_stock),
        excludeAlreadyDiscounted: Boolean(p.exclude_already_discounted),
        discountConfig: this.safeParseJson(p.discount_config_json, {}),
        customerEligibility: this.safeParseJson(p.customer_eligibility_json, { targetSegment: 'All Customers' }),
        limits: this.safeParseJson(p.limits_json, {}),
        coupon: this.safeParseJson(p.coupon_json, { requireCoupon: false }),
        stacking: this.safeParseJson(p.stacking_json, { canCombine: true }),
        storefrontDisplay: this.safeParseJson(p.storefront_display_json, { placements: ['Product Page', 'Vendor Store'] }),
        ruleBuilder: this.safeParseJson(p.rule_builder_json, undefined),
        financials: this.safeParseJson(p.financials_json, { vendorFundedPercent: 100, platformFundedPercent: 0, estimatedUnitsAffected: 100, minVendorMarginPercent: 15 }),
        analytics: this.safeParseJson(p.analytics_json, { views: 420, clicks: 88, redemptions: 24, orders: 24, revenue: 3840000, totalDiscountGiven: 960000, conversionRate: 5.7 }),
        createdBy: p.created_by || p.seller_id,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        publishedAt: p.published_at || undefined,
        version: p.version || 1
      }));
    } catch (err) {
      console.warn('Promotions table not ready or empty, using defaults:', err);
    }

    if (!promotions || promotions.length === 0) {
      promotions = [
        {
          id: 'promo-1',
          sellerId: '',
          sellerName: '',
          name: 'Kariakoo Weekend Flash Sale',
          internalRef: 'KW-FLASH-2026',
          description: '20% flat discount on select flagship mobile accessories and high-speed power banks.',
          imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400',
          promotionType: 'Percentage Discount',
          startDate: '2026-08-25',
          startTime: '08:00',
          endDate: '2026-08-30',
          endTime: '23:59',
          timezone: 'EAT (UTC+3)',
          status: 'Active',
          approvalStatus: 'APPROVED',
          appliesTo: 'Specific Products',
          productIds: ['prod-1', 'prod-2'],
          categoryIds: [],
          excludedProductIds: [],
          excludedCategoryIds: [],
          excludeOutOfStock: true,
          excludeAlreadyDiscounted: true,
          discountConfig: {
            percentage: 20,
            maxDiscountAmount: 100000,
            minOrderValue: 50000
          },
          customerEligibility: { targetSegment: 'All Customers' },
          limits: { maxTotalUses: 200, maxUsesPerCustomer: 2, isUnlimitedUses: false },
          coupon: { requireCoupon: true, code: 'FLASH20', usageLimit: 200, usagePerCustomer: 2, isCaseSensitive: false },
          stacking: { canCombine: true, combineWithFreeDelivery: true },
          storefrontDisplay: { placements: ['Product Page', 'Vendor Store', 'Checkout'], badgeText: '20% FLASH', showCountdownTimer: true },
          financials: { vendorFundedPercent: 100, platformFundedPercent: 0, estimatedUnitsAffected: 150, minVendorMarginPercent: 15 },
          analytics: { views: 1240, clicks: 380, redemptions: 48, orders: 48, revenue: 7680000, totalDiscountGiven: 1920000, conversionRate: 12.6 },
          createdBy: 'system',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          publishedAt: new Date().toISOString(),
          version: 1
        },
        {
          id: 'promo-2',
          sellerId: '',
          sellerName: '',
          name: 'Dar es Salaam Free Delivery Special',
          internalRef: 'DAR-FREESHIP-2026',
          description: '100% Free Express Delivery for all store orders over 100,000 TZS within Dar es Salaam.',
          imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
          promotionType: 'Free Delivery',
          startDate: '2026-09-01',
          startTime: '00:00',
          endDate: '2026-09-15',
          endTime: '23:59',
          timezone: 'EAT (UTC+3)',
          status: 'Scheduled',
          approvalStatus: 'APPROVED',
          appliesTo: 'All Vendor Products',
          productIds: [],
          categoryIds: [],
          excludedProductIds: [],
          excludedCategoryIds: [],
          excludeOutOfStock: true,
          excludeAlreadyDiscounted: false,
          discountConfig: {
            minOrderValue: 100000,
            freeDeliveryMaxSubsidy: 15000,
            deliveryZones: ['Dar es Salaam', 'Kinondoni', 'Ilala', 'Temeke']
          },
          customerEligibility: { targetSegment: 'All Customers' },
          limits: { maxTotalUses: 500, maxUsesPerCustomer: 3, isUnlimitedUses: false },
          coupon: { requireCoupon: true, code: 'FREESHIP', usageLimit: 500, usagePerCustomer: 3 },
          stacking: { canCombine: true, combineWithVendorPromos: true },
          storefrontDisplay: { placements: ['Product Page', 'Vendor Store', 'Checkout'], badgeText: 'FREE SHIPPING' },
          financials: { vendorFundedPercent: 80, platformFundedPercent: 20, estimatedUnitsAffected: 300, minVendorMarginPercent: 20 },
          analytics: { views: 0, clicks: 0, redemptions: 0, orders: 0, revenue: 0, totalDiscountGiven: 0, conversionRate: 0 },
          createdBy: 'system',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: 1
        }
      ];
    }

    const stockCatalog: StockCatalogItem[] = [
      {
        id: 'sc-1',
        category: 'Smartphones & Flagships',
        title: 'Official 4K Samsung Galaxy Packshots & Lifestyle Assets',
        description: 'High-resolution studio renders and spec overlays for Galaxy S24 series.',
        downloadUrl: '/assets/lumo-catalog-smartphones.pdf',
        previewImage: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400',
        fileSize: '4.2 MB (PDF Guide)',
        dimensions: '3840 x 2160 (Print-Ready)'
      },
      {
        id: 'sc-2',
        category: 'Audio & Wireless Acoustics',
        title: 'Premium Audio Marketing Kit: Earbuds & Studio Headphones',
        description: 'Transparent PNG cutouts, frequency response infographics for Oraimo, Sony, and JBL.',
        downloadUrl: '/assets/lumo-catalog-audio.pdf',
        previewImage: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
        fileSize: '3.8 MB (PDF Guide)',
        dimensions: '4000 x 3000'
      },
      {
        id: 'sc-3',
        category: 'Fashion & Footwear Packshots',
        title: 'African Designer Apparel & Footwear Studio Bundle',
        description: 'Multi-angle studio photography and sizing chart templates tailored for East African fashion merchants.',
        downloadUrl: '/assets/lumo-catalog-fashion.pdf',
        previewImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
        fileSize: '5.1 MB (PDF Guide)',
        dimensions: '3000 x 3000'
      }
    ];

    this.ensureOperationalAccounts(users, sellers, warehouses, pickupStations, deliveryRuns);

    return {
      users,
      sessions,
      sellers,
      products,
      categories,
      brands,
      orders,
      inventory,
      inventoryMovements,
      pickupStations,
      warehouses,
      warehouseTasks,
      deliveryRuns,
      deliveryTasks,
      pickupInventory,
      sellerKYC,
      sellerPayouts,
      financialLedger,
      commissionRules,
      salesLeads,
      salesTargets,
      salesActivities,
      supportTickets,
      moderationItems,
      returns,
      notifications,
      advertisingCampaigns: [],
      auditLogs,
      vendorApplications,
      riderApplications,
      salesApplications,
      pickupApplications: [],
      liveSessions,
      stockCatalog,
      promotions,
      financeLeads: [],
      vendorSettlements: [],
      financialInsights: [],
      builderConfig
    };
  }

  private ensureOperationalAccounts(
    users: UserAccount[],
    sellers: Seller[],
    warehouses: Warehouse[],
    pickupStations: PickupStation[],
    deliveryRuns: DeliveryRun[]
  ): void {
    const BCRYPT_HASH = '$2b$10$mJZPyXK6VSN7Wt8rl7PWwuCbGaemnxPRKKsdUtaFW41CA3acUjXdK'; // LumoPass2026!

    const operationalAccounts: Array<{
      id: string;
      email: string;
      phone: string;
      name: string;
      role: UserRole;
      sellerId?: string;
      warehouseId?: string;
      pickupStationId?: string;
      salespersonId?: string;
      department?: string;
      staffId?: string;
      permissions?: string[];
      verificationStatus?: 'VERIFIED' | 'PENDING_VERIFICATION' | 'REJECTED';
    }> = [
      {
        id: 'usr-op-customer',
        email: 'buyer@lumo.africa',
        phone: '+255712000001',
        name: 'Rashid Mwinyi (Verified Customer)',
        role: 'CUSTOMER',
        verificationStatus: 'VERIFIED'
      },
      {
        id: 'usr-op-seller',
        email: 'seller@lumo.africa',
        phone: '+255712000002',
        name: 'Amina Juma (TechZone Store)',
        role: 'SELLER',
        sellerId: 'seller-1',
        verificationStatus: 'VERIFIED'
      },
      {
        id: 'usr-op-rider',
        email: 'rider@lumo.africa',
        phone: '+255712000003',
        name: 'Juma Hamisi (Express Rider)',
        role: 'DELIVERY_AGENT',
        verificationStatus: 'VERIFIED'
      },
      {
        id: 'usr-op-warehouse',
        email: 'warehouse@lumo.africa',
        phone: '+255712000004',
        name: 'Salim Bakari (Dar Central Fulfillment)',
        role: 'WAREHOUSE_MANAGER',
        warehouseId: warehouses[0]?.id || 'wh-dar-central',
        department: 'LOGISTICS',
        staffId: 'STF-WH-001',
        permissions: ['*'],
        verificationStatus: 'VERIFIED'
      },
      {
        id: 'usr-op-pickup',
        email: 'pickup@lumo.africa',
        phone: '+255712000005',
        name: 'Grace Mollel (Kariakoo Hub Operator)',
        role: 'PICKUP_STATION_MANAGER',
        pickupStationId: pickupStations[0]?.id || 'dar-ps-1',
        department: 'LOGISTICS',
        staffId: 'STF-PK-001',
        permissions: ['*'],
        verificationStatus: 'VERIFIED'
      },
      {
        id: 'usr-op-sales',
        email: 'sales@lumo.africa',
        phone: '+255712000006',
        name: 'Neema Mtambalike (Field Sales Agent)',
        role: 'SALESPERSON',
        salespersonId: 'sp-1',
        department: 'COMMERCIAL',
        staffId: 'STF-SL-001',
        verificationStatus: 'VERIFIED'
      },
      {
        id: 'usr-op-operations',
        email: 'operations@lumo.africa',
        phone: '+255712000007',
        name: 'Baraka Mwamba (Operations Command)',
        role: 'OPERATIONS_ADMIN',
        department: 'OPERATIONS',
        staffId: 'STF-OP-001',
        permissions: ['*'],
        verificationStatus: 'VERIFIED'
      },
      {
        id: 'usr-op-finance',
        email: 'finance@lumo.africa',
        phone: '+255712000008',
        name: 'Zawadi Kimaro (Financial Controller)',
        role: 'FINANCE_ADMIN',
        department: 'FINANCE',
        staffId: 'STF-FN-001',
        permissions: ['*'],
        verificationStatus: 'VERIFIED'
      },
      {
        id: 'usr-op-admin',
        email: 'admin@lumo.africa',
        phone: '+255712000009',
        name: 'Principal Super Administrator',
        role: 'SUPER_ADMIN',
        department: 'EXECUTIVE',
        staffId: 'STF-ADM-001',
        permissions: ['*'],
        verificationStatus: 'VERIFIED'
      },
      {
        id: 'usr-op-care',
        email: 'care@lumo.africa',
        phone: '+255712000010',
        name: 'Rehema Massawe (Customer Care Lead)',
        role: 'CUSTOMER_CARE',
        department: 'CUSTOMER_SUPPORT',
        staffId: 'STF-CC-001',
        permissions: ['*'],
        verificationStatus: 'VERIFIED'
      }
    ];

    for (const op of operationalAccounts) {
      let existing = users.find(u => u.email.toLowerCase() === op.email.toLowerCase() || u.id === op.id);
      if (existing) {
        existing.passwordHash = BCRYPT_HASH;
        existing.status = 'ACTIVE';
        existing.isActive = true;
        existing.isVerified = true;
        existing.role = op.role;
        existing.name = op.name;
        existing.phone = op.phone;
        existing.sellerId = op.sellerId || existing.sellerId;
        existing.warehouseId = op.warehouseId || existing.warehouseId;
        existing.pickupStationId = op.pickupStationId || existing.pickupStationId;
        existing.salespersonId = op.salespersonId || existing.salespersonId;
        existing.department = op.department || existing.department;
        existing.staffId = op.staffId || existing.staffId;
        existing.permissions = op.permissions || existing.permissions || ['*'];
        existing.verificationStatus = op.verificationStatus || 'VERIFIED';
        existing.failedAttempts = 0;
        existing.lockedUntil = undefined;
      } else {
        users.push({
          id: op.id,
          email: op.email,
          phone: op.phone,
          name: op.name,
          role: op.role,
          passwordHash: BCRYPT_HASH,
          sellerId: op.sellerId,
          warehouseId: op.warehouseId,
          pickupStationId: op.pickupStationId,
          salespersonId: op.salespersonId,
          department: op.department,
          staffId: op.staffId,
          status: 'ACTIVE',
          isActive: true,
          isVerified: true,
          verificationStatus: op.verificationStatus || 'VERIFIED',
          permissions: op.permissions || ['*'],
          reliabilityScore: 100,
          cancellationCount: 0,
          uncollectedPickupCount: 0,
          failedAttempts: 0,
          createdAt: new Date().toISOString()
        });
      }
    }

    // Ensure delivery run for rider exists
    if (deliveryRuns && deliveryRuns.length > 0) {
      const riderRun = deliveryRuns.find(r => r.agentId === 'usr-op-rider');
      if (!riderRun && deliveryRuns[0]) {
        deliveryRuns[0].agentId = 'usr-op-rider';
        deliveryRuns[0].agentName = 'Juma Hamisi (Express Rider)';
      }
    }
  }

  public reprovisionOperationalAccounts(): Array<{ email: string; name: string; role: string; dashboardRoute: string }> {
    const d = this.getDb();
    this.ensureOperationalAccounts(d.users, d.sellers, d.warehouses, d.pickupStations, d.deliveryRuns);
    return [
      { email: 'buyer@lumo.africa', name: 'Rashid Mwinyi (Verified Customer)', role: 'CUSTOMER', dashboardRoute: '/account' },
      { email: 'seller@lumo.africa', name: 'Amina Juma (TechZone Store)', role: 'SELLER', dashboardRoute: '/seller' },
      { email: 'rider@lumo.africa', name: 'Juma Hamisi (Express Rider)', role: 'DELIVERY_AGENT', dashboardRoute: '/delivery' },
      { email: 'warehouse@lumo.africa', name: 'Salim Bakari (Dar Central Fulfillment)', role: 'WAREHOUSE_MANAGER', dashboardRoute: '/warehouse' },
      { email: 'pickup@lumo.africa', name: 'Grace Mollel (Kariakoo Hub Operator)', role: 'PICKUP_STATION_MANAGER', dashboardRoute: '/pickup' },
      { email: 'sales@lumo.africa', name: 'Neema Mtambalike (Field Sales Agent)', role: 'SALESPERSON', dashboardRoute: '/sales' },
      { email: 'operations@lumo.africa', name: 'Baraka Mwamba (Operations Command)', role: 'OPERATIONS_ADMIN', dashboardRoute: '/operations' },
      { email: 'finance@lumo.africa', name: 'Zawadi Kimaro (Financial Controller)', role: 'FINANCE_ADMIN', dashboardRoute: '/finance' },
      { email: 'admin@lumo.africa', name: 'Principal Super Administrator', role: 'SUPER_ADMIN', dashboardRoute: '/admin' }
    ];
  }

  private redactSecrets(input?: any): string | undefined {
    if (input === undefined || input === null) return undefined;
    let text = typeof input === 'object' ? JSON.stringify(input) : String(input);
    return text
      .replace(/(\$2[aby]\$\d+\$[./A-Za-z0-9]{53})/g, '[REDACTED_HASH]')
      .replace(/("password"|"secretKey"|"token"|"passwordHash"|"inviteToken"|"passwordResetToken"|"otpCode"|"apiKey"):\s*"[^"]+"/gi, '$1:"[REDACTED]"')
      .replace(/\b(password|secret|apikey|access_token|bearer)\s*[:=]\s*[^\s,]+/gi, '$1=[REDACTED]')
      .replace(/\b\d{4,6}\b(?=.*(otp|verification code|pin))/gi, '[REDACTED_CODE]');
  }

  public addAuditLog(entry: {
    userId: string;
    userName?: string;
    userRole: string;
    action: string;
    entityType: string;
    entityId: string;
    previousValue?: string | Record<string, any>;
    newValue?: string | Record<string, any>;
    ipAddress?: string;
    status?: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
    severity?: 'INFO' | 'WARNING' | 'CRITICAL' | 'SECURITY';
    details?: string | Record<string, any>;
    userAgent?: string;
  }): AuditLogEntry {
    const dbData = this.getDb();
    let resolvedUserName = entry.userName;
    if (!resolvedUserName && entry.userId) {
      const u = (dbData.users || []).find(usr => usr.id === entry.userId);
      resolvedUserName = u?.name || entry.userId;
    }

    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}-${crypto.randomInt(100, 10000)}`,
      userId: entry.userId,
      userName: resolvedUserName || 'System Actor',
      userRole: entry.userRole as any,
      action: entry.action,
      entityType: entry.entityType as any,
      entityId: entry.entityId,
      previousValue: this.redactSecrets(entry.previousValue),
      newValue: this.redactSecrets(entry.newValue),
      status: entry.status || 'SUCCESS',
      severity: entry.severity || (entry.status === 'FAILURE' ? 'WARNING' : 'INFO'),
      details: this.redactSecrets(entry.details),
      userAgent: entry.userAgent,
      ipAddress: entry.ipAddress || '197.250.12.8',
      timestamp: new Date().toISOString()
    };

    this.updateDb(d => {
      if (!d.auditLogs) d.auditLogs = [];
      d.auditLogs.unshift(newLog);
    });

    return newLog;
  }

  public addNotification(notification: Partial<NotificationItem>): NotificationItem {
    const newNotif: NotificationItem = {
      id: notification.id || `notif-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
      userId: notification.userId as string,
      title: notification.title || 'System Notification',
      message: notification.message || '',
      type: notification.type || 'ORDER',
      isRead: false,
      linkUrl: notification.linkUrl,
      createdAt: notification.createdAt || new Date().toISOString()
    };

    this.updateDb(d => {
      if (!d.notifications) d.notifications = [];
      d.notifications.unshift(newNotif);
    });

    return newNotif;
  }

  public getCalculatedStock(productId: string): number {
    const db = this.getDb();
    const product = db.products.find(p => p.id === productId);
    if (!product) return 0;
    return Math.max(0, product.stock ?? 0);
  }

  public recordInventoryMovement(params: {
    productId: string;
    sellerId: string;
    warehouseId?: string;
    sku?: string;
    movementType: InventoryMovementType;
    quantity: number;
    referenceOrderId?: string;
    referenceOrderNumber?: string;
    performedByUserId: string;
    performedByUserName: string;
    performedByUserRole: UserRole;
    reason: string;
  }): { movement: InventoryMovement; newStock: number } {
    let newStock = 0;
    let movement: InventoryMovement | null = null;

    this.updateDb(d => {
      if (!d.inventoryMovements) d.inventoryMovements = [];
      const product = d.products.find(p => p.id === params.productId);
      if (!product) {
        throw new Error(`Product ${params.productId} not found in inventory ledger.`);
      }

      const prevStock = product.stock || 0;
      if (prevStock + params.quantity < 0) {
        throw new Error(`Insufficient stock: Cannot reduce stock by ${Math.abs(params.quantity)}. Only ${prevStock} units available.`);
      }
      if (prevStock + params.quantity > 1000000) {
        throw new Error(`Inventory limit exceeded: Stock cannot exceed 1,000,000 units.`);
      }
      newStock = prevStock + params.quantity;
      product.stock = newStock;
      (product as any).inStock = newStock > 0;

      let invItem = d.inventory.find(i => i.productId === params.productId);
      if (invItem) {
        invItem.available = newStock;
        invItem.updatedAt = new Date().toISOString();
      }

      movement = {
        id: `mov-${Date.now()}-${crypto.randomInt(0, 1000)}`,
        productId: params.productId,
        sellerId: params.sellerId || product.sellerId,
        warehouseId: params.warehouseId || 'wh-dar-central',
        sku: params.sku || `LM-SKU-${params.productId}`,
        movementType: params.movementType,
        quantity: params.quantity,
        referenceOrderId: params.referenceOrderId,
        referenceOrderNumber: params.referenceOrderNumber,
        performedByUserId: params.performedByUserId,
        performedByUserName: params.performedByUserName,
        performedByUserRole: params.performedByUserRole,
        reason: params.reason,
        previousAvailable: prevStock,
        newAvailable: newStock,
        createdAt: new Date().toISOString()
      };

      d.inventoryMovements.unshift(movement);
    });

    this.addAuditLog({
      userId: params.performedByUserId,
      userName: params.performedByUserName,
      userRole: params.performedByUserRole,
      action: `INVENTORY_MOVEMENT_${params.movementType}`,
      entityType: 'PRODUCT',
      entityId: params.productId,
      previousValue: `Stock: ${params.productId}`,
      newValue: `New Stock: ${newStock} (${params.quantity > 0 ? '+' : ''}${params.quantity}) - ${params.reason}`
    });

    return { movement: movement!, newStock };
  }

  public calculateDeliveryFeeServer(params: {
    region: string;
    district?: string;
    subtotal: number;
    deliveryType: 'standard' | 'express' | 'pickup';
    pickupStationId?: string;
  }): { fee: number; isFreeDelivery: boolean; freeDeliveryThreshold: number; discountApplied: number } {
    const region = (params.region || 'Dar es Salaam').trim();
    const subtotal = Math.max(0, params.subtotal || 0);

    if (params.deliveryType === 'pickup') {
      const db = this.getDb();
      if (params.pickupStationId) {
        const station = (db.pickupStations || []).find(s => s.id === params.pickupStationId && s.status === 'ACTIVE');
        if (station) {
          return { fee: station.fee || 0, isFreeDelivery: true, freeDeliveryThreshold: 0, discountApplied: 0 };
        }
      }
      return { fee: 0, isFreeDelivery: true, freeDeliveryThreshold: 0, discountApplied: 0 };
    }

    let baseFee = 3000;
    let threshold = 100000;

    if (region.toLowerCase().includes('dar es salaam')) {
      baseFee = params.deliveryType === 'express' ? 6000 : 3000;
      threshold = 100000;
    } else if (['arusha', 'mwanza', 'dodoma'].some(r => region.toLowerCase().includes(r))) {
      baseFee = params.deliveryType === 'express' ? 10000 : 5000;
      threshold = 150000;
    } else if (['mbeya', 'kilimanjaro', 'tanga', 'morogoro', 'zanzibar'].some(r => region.toLowerCase().includes(r))) {
      baseFee = params.deliveryType === 'express' ? 12000 : 7000;
      threshold = 200000;
    } else {
      baseFee = params.deliveryType === 'express' ? 18000 : 10000;
      threshold = 250000;
    }

    if (subtotal >= threshold) {
      return {
        fee: 0,
        isFreeDelivery: true,
        freeDeliveryThreshold: threshold,
        discountApplied: baseFee
      };
    }

    return {
      fee: baseFee,
      isFreeDelivery: false,
      freeDeliveryThreshold: threshold,
      discountApplied: 0
    };
  }

  public getPlatformAnalytics(): PlatformAnalytics {
    const currentDb = this.getDb();
    const orders = currentDb.orders || [];
    const products = currentDb.products || [];
    const sellers = currentDb.sellers || [];
    const users = currentDb.users || [];

    const totalSalesVolume = orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + (o.pricing?.total || 0), 0);

    const totalRevenue = orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + ((o.pricing?.total || 0) * 0.08), 0);

    const activeEscrowBalance = orders
      .filter(o => ['Processing', 'Packed', 'Shipped', 'OutForDelivery'].includes(o.status))
      .reduce((sum, o) => sum + (o.pricing?.total || 0), 0);

    // Calculate real-time metrics based exclusively on database state
    return {
      gmv: totalSalesVolume,
      revenue: totalRevenue,
      totalOrders: orders.length,
      totalCustomers: users.filter(u => u.role === 'CUSTOMER').length,
      totalSellers: sellers.length,
      totalSalespersons: users.filter(u => u.role === 'SALESPERSON').length,
      activeProducts: products.length,
      pendingApprovals: (currentDb.vendorApplications || []).filter(v => v.status === 'PENDING').length,
      escrowSecuredAmount: activeEscrowBalance,
      avgOrderValue: orders.length > 0 ? Math.round(totalSalesVolume / orders.length) : 0,
      returnRate: orders.length > 0 ? Number(((currentDb.returns?.length || 0) / orders.length * 100).toFixed(1)) : 0,
      growthMetrics: {
        monthlyGmvGrowth: 0,
        monthlyCustomerGrowth: 0,
        monthlySellerGrowth: 0
      }
    };
  }

  public getDb(): DatabaseSchema {
    if (!this.isLoaded) {
      this.inMemoryDb = this.loadFromD1();
      this.isLoaded = true;
    }
    return this.inMemoryDb;
  }

  public findUserByEmail(email: string): UserAccount | undefined {
    if (!email) return undefined;
    const cleanEmail = email.toLowerCase().trim();
    return this.getDb().users.find(u => u.email.toLowerCase().trim() === cleanEmail);
  }

  public findUserById(id: string): UserAccount | undefined {
    if (!id) return undefined;
    return this.getDb().users.find(u => u.id === id);
  }

  public createSession(userId: string, role: UserRole, ip?: string, userAgent?: string): AuthSession {
    const token = generateSessionToken();
    const session: AuthSession = {
      token,
      userId,
      role,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days expiration
      ip,
      userAgent
    };
    this.updateDb(d => {
      if (!d.sessions) d.sessions = [];
      // Evict expired sessions
      d.sessions = d.sessions.filter(s => new Date(s.expiresAt).getTime() > Date.now());
      d.sessions.push(session);
    });
    return session;
  }

  public getSession(token: string): AuthSession | undefined {
    if (!token) return undefined;
    const currentSessions = this.getDb().sessions || [];
    const found = currentSessions.find(s => safeCompareTokens(s.token, token));
    if (!found) return undefined;
    if (new Date(found.expiresAt).getTime() <= Date.now()) {
      this.deleteSession(token);
      return undefined;
    }
    return found;
  }

  public deleteSession(token: string): void {
    if (!token) return;
    this.updateDb(d => {
      if (d.sessions) {
        d.sessions = d.sessions.filter(s => s.token !== token);
      }
    });
  }

  public deleteUserSessions(userId: string): void {
    if (!userId) return;
    this.updateDb(d => {
      if (d.sessions) {
        d.sessions = d.sessions.filter(s => s.userId !== userId);
      }
    });
  }

  public updateDb(updater: (db: DatabaseSchema) => void): DatabaseSchema {
    updater(this.inMemoryDb);
    this.persistToD1(this.inMemoryDb);
    return this.inMemoryDb;
  }

  public persistToD1(data: DatabaseSchema, isRetry = false) {
    const rawDb = d1.getRawDb();
    try {
      d1.ensureSchemaIntegrity();
      rawDb.exec('PRAGMA foreign_keys = OFF;');
      rawDb.exec('BEGIN TRANSACTION;');
    } catch (err: any) {
      if (!isRetry && err && err.message && (err.message.includes('malformed') || err.message.includes('corrupt'))) {
        console.error('persistToD1 startup detected corrupt/malformed DB, recreating and retrying...', err);
        d1.recreateDb();
        this.persistToD1(data, true);
        return;
      }
      throw err;
    }

    try {
      // Helper for clean parameter binding
      const runSql = (stmt: any, ...args: any[]) => {
        const safe = args.map(val => {
          if (val === undefined || val === null) return null;
          if (typeof val === 'boolean') return val ? 1 : 0;
          if (typeof val === 'number') return Number.isNaN(val) ? null : val;
          if (typeof val === 'bigint') return val;
          if (typeof val === 'object') return JSON.stringify(val);
          return String(val);
        });
        return stmt.run(...safe);
      };

      // 1. Users
      const insertUser = rawDb.prepare(`
        INSERT OR REPLACE INTO users (
          id, email, phone, name, role, password_hash, avatar, seller_id, pickup_station_id, 
          salesperson_id, warehouse_id, department, staff_id, status, invite_token, invite_expires_at,
          invite_accepted_at, password_reset_token, password_reset_code, password_reset_expires, failed_attempts, locked_until, is_active, is_verified, is_high_risk_flagged, 
          reliability_score, cancellation_count, uncollected_pickup_count, permissions_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const u of data.users || []) {
        runSql(
          insertUser,
          u.id,
          u.email,
          u.phone || '+255 700 000 000',
          u.name,
          u.role,
          u.passwordHash || null,
          u.avatar || null,
          u.sellerId || null,
          u.pickupStationId || null,
          u.salespersonId || null,
          u.warehouseId || null,
          u.department || null,
          u.staffId || null,
          u.status || 'ACTIVE',
          u.inviteToken || null,
          u.inviteExpiresAt || null,
          u.inviteAcceptedAt || null,
          u.passwordResetToken || null,
          u.passwordResetCode || null,
          u.passwordResetExpires || null,
          u.failedAttempts || 0,
          u.lockedUntil || null,
          u.isActive ? 1 : 0,
          u.isVerified ? 1 : 0,
          u.isHighRiskFlagged ? 1 : 0,
          u.reliabilityScore ?? 100,
          u.cancellationCount ?? 0,
          u.uncollectedPickupCount ?? 0,
          u.permissions || [],
          u.createdAt || new Date().toISOString()
        );
      }

      // 1B. Sessions
      try {
        rawDb.exec('DELETE FROM sessions;');
        const insertSession = rawDb.prepare(`
          INSERT OR REPLACE INTO sessions (token, user_id, role, created_at, expires_at, ip, user_agent)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        for (const s of data.sessions || []) {
          runSql(insertSession, s.token, s.userId, s.role, s.createdAt, s.expiresAt, s.ip || null, s.userAgent || null);
        }
      } catch (sessErr) {
        console.warn('Session persistence notice:', sessErr);
      }

      // 2. Sellers
      const insertSeller = rawDb.prepare(`
        INSERT OR REPLACE INTO sellers (
          id, name, city, country, rating, total_reviews, products_count, 
          followers_count, is_live_commerce_active, live_stream_title, joined_year, 
          response_rate, ship_on_time_rate, is_official_store, badge, avatar, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const s of data.sellers || []) {
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
      }

      // 3. Products
      const insertProduct = rawDb.prepare(`
        INSERT OR REPLACE INTO products (
          id, name, brand, category, subcategory, seller_id, seller_name, seller_city,
          price, old_price, discount_percentage, rating, review_count, stock, sold_count, view_count,
          is_flash_sale, flash_sale_ends_at, badges_json, images_json, thumbnail,
          description, short_description, key_features_json, specifications_json, variations_json,
          condition, warranty, free_delivery_eligible, weight_kg, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const p of data.products || []) {
        runSql(
          insertProduct,
          p.id,
          p.name,
          p.brand || 'LUMO Partner',
          p.category || 'Electronics',
          p.subcategory || null,
          p.sellerId,
          p.sellerName || '',
          p.sellerCity || 'Dar es Salaam',
          p.price || 0,
          p.oldPrice || null,
          p.discountPercentage || 0,
          p.rating || 5.0,
          p.reviewCount || 0,
          p.stock || 0,
          p.soldCount || 0,
          p.viewCount || 0,
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
          (p as any).createdAt || new Date().toISOString(),
          (p as any).updatedAt || new Date().toISOString()
        );
      }

      // 4. Inventory
      const insertInventory = rawDb.prepare(`
        INSERT OR REPLACE INTO inventory (
          id, product_id, product_name, sku, seller_id, warehouse_id, available, reserved, reorder_level, status, location_bin, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const i of data.inventory || []) {
        runSql(
          insertInventory,
          i.id,
          i.productId,
          i.productName,
          i.sku || `LM-SKU-${i.productId}`,
          i.sellerId,
          i.warehouseId || 'wh-dar-central',
          i.available || 0,
          i.reserved || 0,
          i.reorderLevel || 10,
          (i as any).status || 'IN_STOCK',
          (i as any).locationBin || 'Aisle 1 - Shelf A',
          (i as any).updatedAt || new Date().toISOString()
        );
      }

      // 5. Orders
      const insertOrder = rawDb.prepare(`
        INSERT OR REPLACE INTO orders (
          id, order_number, customer_name, customer_email, customer_phone, customer_data_json,
          items_json, delivery_address_json, delivery_method_json, payment_method_json,
          pricing_json, status, status_history_json, tracking_number, estimated_delivery_date,
          is_direct_vendor_payout, escrow_bypassed, salesperson_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const o of data.orders || []) {
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
          o.trackingNumber || `LM-TZ-${crypto.randomInt(1000000, 10000000)}-EXP`,
          o.estimatedDeliveryDate || null,
          o.isDirectVendorPayout ? 1 : 0,
          o.escrowBypassed ? 1 : 0,
          (o as any).salespersonId || null,
          o.createdAt || new Date().toISOString(),
          (o as any).updatedAt || new Date().toISOString()
        );
      }

      // 6. Warehouse Tasks
      const insertWhTask = rawDb.prepare(`
        INSERT OR REPLACE INTO warehouse_tasks (
          id, task_number, warehouse_id, type, order_id, order_number, items_json, status, priority, assigned_to_id, assigned_to_name, created_at, completed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const t of data.warehouseTasks || []) {
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
          (t as any).assignedToId || null,
          t.assignedToName || null,
          t.createdAt || new Date().toISOString(),
          t.completedAt || null
        );
      }

      // 7. Delivery Runs & Tasks
      const insertRun = rawDb.prepare(`
        INSERT OR REPLACE INTO delivery_runs (
          id, run_number, agent_id, agent_name, vehicle_type, status, start_time, end_time, total_parcels, completed_parcels
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const r of data.deliveryRuns || []) {
        runSql(
          insertRun,
          r.id,
          r.runNumber || `RUN-${r.id.substring(0, 8)}`,
          r.agentId,
          r.agentName || 'Lumo Delivery Agent',
          r.vehicleType || 'Motorcycle',
          r.status || 'ASSIGNED',
          (r as any).startTime || null,
          (r as any).endTime || null,
          r.totalOrders || (r as any).totalParcels || 0,
          r.completedOrders || (r as any).completedParcels || 0
        );
      }

      const insertDelTask = rawDb.prepare(`
        INSERT OR REPLACE INTO delivery_tasks (
          id, delivery_run_id, order_id, order_number, customer_name, customer_phone, address, delivery_notes, payment_method, cod_amount, is_cod_collected, status, otp_code, proof_of_delivery_json, created_at, completed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const d of data.deliveryTasks || []) {
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
          (d as any).createdAt || new Date().toISOString(),
          (d as any).completedAt || null
        );
      }

      // 8. Pickup Inventory
      const insertPickupInv = rawDb.prepare(`
        INSERT OR REPLACE INTO pickup_inventory (
          id, station_id, station_name, order_id, order_number, customer_name, customer_phone, shelf_location, package_count, received_at, expires_at, status, otp_code, collected_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const pi of data.pickupInventory || []) {
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
      }

      // 9. Seller KYC, Payouts, Ledger
      const insertKyc = rawDb.prepare(`
        INSERT OR REPLACE INTO seller_kyc (
          id, seller_id, business_registration_number, tin_number, national_id_or_passport, director_name, status, submitted_at, verified_at, documents_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const k of data.sellerKYC || []) {
        runSql(
          insertKyc,
          k.id,
          k.sellerId,
          k.registrationNumber || null,
          k.tinNumber || null,
          k.idNumber || null,
          k.legalName || null,
          k.status || 'APPROVED',
          k.submittedAt || new Date().toISOString(),
          k.reviewedAt || null,
          k.documents || []
        );
      }

      const insertPayout = rawDb.prepare(`
        INSERT OR REPLACE INTO seller_payouts (
          id, payout_number, seller_id, amount, currency, status, method, account_details_json, requested_at, processed_at, reference_code
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const p of data.sellerPayouts || []) {
        runSql(
          insertPayout,
          p.id,
          p.payoutNumber,
          p.sellerId,
          p.amount || 0,
          p.currency || 'TZS',
          p.status || 'PAID',
          p.paymentMethod || 'MOBILE_MONEY',
          p.recipientDetails || {},
          p.requestedAt || new Date().toISOString(),
          p.processedAt || null,
          p.referenceNumber || null
        );
      }

      const insertLedger = rawDb.prepare(`
        INSERT OR REPLACE INTO financial_ledger (
          id, seller_id, order_id, type, amount, fee, net, balance_after, currency, description, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const l of data.financialLedger || []) {
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
      }

      // 10. Commission Rules, Leads, Targets, Activities
      const insertRule = rawDb.prepare(`
        INSERT OR REPLACE INTO commission_rules (
          id, category, rate_percentage, min_fee, max_fee, is_active, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const r of data.commissionRules || []) {
        runSql(
          insertRule,
          r.id,
          r.category,
          r.commissionRate ? r.commissionRate * 100 : 5,
          r.fixedFee || 0,
          null,
          r.isActive ? 1 : 0,
          new Date().toISOString()
        );
      }

      const insertLead = rawDb.prepare(`
        INSERT OR REPLACE INTO sales_leads (
          id, salesperson_id, salesperson_name, lead_type, business_name, contact_name, phone, email, region, city, status, notes_json, expected_monthly_volume, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const l of data.salesLeads || []) {
        runSql(
          insertLead,
          l.id,
          l.salespersonId,
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
      }

      const insertTarget = rawDb.prepare(`
        INSERT OR REPLACE INTO sales_targets (
          id, salesperson_id, period, target_amount, achieved_amount, commission_earned, leads_target, leads_achieved
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const t of data.salesTargets || []) {
        runSql(
          insertTarget,
          t.id,
          t.salespersonId,
          t.month || '2026-08',
          t.salesTargetAmount || 50000000,
          t.salesAchievedAmount || 0,
          t.commissionEarned || 0,
          t.newCustomersTarget || 20,
          t.newCustomersAchieved || 0
        );
      }

      const insertAct = rawDb.prepare(`
        INSERT OR REPLACE INTO sales_activities (
          id, salesperson_id, lead_id, type, title, details, location, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const a of data.salesActivities || []) {
        runSql(
          insertAct,
          a.id,
          a.salespersonId,
          a.leadId || null,
          a.type || 'CALL',
          a.title || 'Client Meeting',
          a.details || 'Followed up on quote',
          a.location || 'Dar es Salaam',
          a.timestamp || new Date().toISOString()
        );
      }

      // 11. Support, Moderation, Returns, Notifications, Audit Logs
      const insertTicket = rawDb.prepare(`
        INSERT OR REPLACE INTO support_tickets (
          id, ticket_number, user_id, user_name, user_email, user_phone, role, order_id, order_number, category, subject, status, priority, messages_json, internal_notes_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const tk of data.supportTickets || []) {
        runSql(
          insertTicket,
          tk.id,
          tk.ticketNumber,
          tk.userId,
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
      }

      const insertMod = rawDb.prepare(`
        INSERT OR REPLACE INTO moderation_items (
          id, type, target_id, target_title, reporter_user_id, reason, status, created_at, action_taken
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const m of data.moderationItems || []) {
        runSql(
          insertMod,
          m.id,
          m.type || 'PRODUCT_APPROVAL',
          m.targetId || 'item-unknown',
          m.targetName || m.targetId || 'Flagged Target',
          null,
          m.details || 'Policy Check',
          m.status || 'PENDING',
          m.createdAt || new Date().toISOString(),
          m.resolutionNote || null
        );
      }

      const existingRetIds = (data.returns || []).map(r => r.id);
      if (existingRetIds.length === 0) {
        rawDb.exec('DELETE FROM returns;');
      } else {
        const placeholders = existingRetIds.map(() => '?').join(',');
        rawDb.prepare(`DELETE FROM returns WHERE id NOT IN (${placeholders})`).run(...existingRetIds);
      }

      const insertRet = rawDb.prepare(`
        INSERT OR REPLACE INTO returns (
          id, return_number, order_id, order_number, customer_id, customer_name, seller_id, seller_name, product_id, product_name, product_image, quantity, refund_amount, reason, customer_comment, images_json, status, pickup_station_or_address, rejection_reason, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const r of data.returns || []) {
        runSql(
          insertRet,
          r.id,
          r.returnNumber || `RET-${r.id || Date.now()}`,
          r.orderId || 'ord-default',
          r.orderNumber || 'LM-DEFAULT',
          r.customerId || 'usr-default',
          r.customerName || (r as any).customer?.name || 'Customer',
          r.sellerId || 'seller-default',
          r.sellerName || 'Seller',
          r.productId || 'prod-default',
          r.productName || 'Product',
          r.productImage || null,
          r.quantity || 1,
          r.refundAmount || 0,
          r.reason || 'DEFECTIVE',
          r.customerComment || '',
          r.images || [],
          r.status || 'RETURN_REQUESTED',
          r.pickupStationOrAddress || 'LUMO Kariakoo Station Hub',
          r.rejectionReason || null,
          r.createdAt || new Date().toISOString(),
          r.updatedAt || new Date().toISOString()
        );
      }

      const insertNotif = rawDb.prepare(`
        INSERT OR REPLACE INTO notifications (
          id, user_id, title, message, type, is_read, link_url, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const n of data.notifications || []) {
        runSql(
          insertNotif,
          n.id,
          n.userId || 'system',
          n.title || '',
          n.message || '',
          n.type || 'ORDER',
          n.isRead ? 1 : 0,
          n.linkUrl || null,
          n.createdAt || new Date().toISOString()
        );
      }

      const insertAudit = rawDb.prepare(`
        INSERT OR REPLACE INTO audit_logs (
          id, user_id, user_name, user_role, action, entity_type, entity_id, previous_value, new_value, ip_address, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const a of data.auditLogs || []) {
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
      }

      const insertPromo = rawDb.prepare(`
        INSERT OR REPLACE INTO promotions (
          id, seller_id, seller_name, name, internal_ref, description, image_url, promotion_type,
          start_date, start_time, end_date, end_time, timezone, status, approval_status,
          rejection_reason, admin_comment, applies_to, product_ids_json, category_ids_json,
          excluded_product_ids_json, excluded_category_ids_json, exclude_out_of_stock,
          exclude_already_discounted, discount_config_json, customer_eligibility_json,
          limits_json, coupon_json, stacking_json, storefront_display_json, rule_builder_json,
          financials_json, analytics_json, created_by, created_at, updated_at, published_at, version
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?
        )
      `);
      for (const p of data.promotions || []) {
        runSql(
          insertPromo,
          p.id,
          p.sellerId,
          p.sellerName || null,
          p.name,
          p.internalRef || null,
          p.description || null,
          p.imageUrl || null,
          p.promotionType,
          p.startDate,
          p.startTime,
          p.endDate,
          p.endTime,
          p.timezone || 'EAT (UTC+3)',
          p.status,
          p.approvalStatus || 'APPROVED',
          p.rejectionReason || null,
          p.adminComment || null,
          p.appliesTo || 'Specific Products',
          JSON.stringify(p.productIds || []),
          JSON.stringify(p.categoryIds || []),
          JSON.stringify(p.excludedProductIds || []),
          JSON.stringify(p.excludedCategoryIds || []),
          p.excludeOutOfStock ? 1 : 0,
          p.excludeAlreadyDiscounted ? 1 : 0,
          JSON.stringify(p.discountConfig || {}),
          JSON.stringify(p.customerEligibility || {}),
          JSON.stringify(p.limits || {}),
          JSON.stringify(p.coupon || {}),
          JSON.stringify(p.stacking || {}),
          JSON.stringify(p.storefrontDisplay || {}),
          JSON.stringify(p.ruleBuilder || {}),
          JSON.stringify(p.financials || {}),
          JSON.stringify(p.analytics || {}),
          p.createdBy || null,
          p.createdAt || new Date().toISOString(),
          p.updatedAt || new Date().toISOString(),
          p.publishedAt || null,
          p.version || 1
        );
      }

      if (data.builderConfig) {
        const insertConfig = rawDb.prepare(`
          INSERT OR REPLACE INTO platform_builder_configs (id, config_key, config_value_json, updated_at)
          VALUES (?, ?, ?, ?)
        `);
        runSql(
          insertConfig,
          'cfg-main',
          'GLOBAL_BUILDER_CONFIG',
          data.builderConfig,
          new Date().toISOString()
        );
      }

      rawDb.exec('COMMIT;');
      rawDb.exec('PRAGMA foreign_keys = ON;');
    } catch (error: any) {
      try {
        rawDb.exec('ROLLBACK;');
      } catch {}
      try {
        rawDb.exec('PRAGMA foreign_keys = ON;');
      } catch {}

      if (!isRetry && error && error.message && (error.message.includes('malformed') || error.message.includes('corrupt'))) {
        console.error('persistToD1 execution detected corrupt/malformed DB, recreating and retrying...', error);
        try {
          d1.recreateDb();
          this.persistToD1(data, true);
          return;
        } catch (retryErr) {
          console.error('Failed to retry persistToD1 after recreateDb:', retryErr);
        }
      }
      console.error('Error persisting database state to Cloudflare D1/SQLite:', error);
    }
  }
}

export const db = new LumoD1DatabaseAdapter();
export default db;

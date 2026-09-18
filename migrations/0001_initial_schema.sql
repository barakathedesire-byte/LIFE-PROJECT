-- ============================================================================
-- LUMO E-COMMERCE PLATFORM — CLOUDFLARE D1 RELATIONAL DATABASE SCHEMA
-- Migration: 0001_initial_schema.sql
-- ============================================================================

-- 1. USERS & AUTHENTICATION
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  password_hash TEXT,
  avatar TEXT,
  seller_id TEXT,
  pickup_station_id TEXT,
  salesperson_id TEXT,
  warehouse_id TEXT,
  department TEXT,
  staff_id TEXT,
  status TEXT DEFAULT 'ACTIVE',
  invite_token TEXT,
  invite_expires_at TEXT,
  invite_accepted_at TEXT,
  password_reset_token TEXT,
  password_reset_code TEXT,
  password_reset_expires TEXT,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  is_verified INTEGER NOT NULL DEFAULT 0,
  is_high_risk_flagged INTEGER NOT NULL DEFAULT 0,
  reliability_score INTEGER NOT NULL DEFAULT 100,
  cancellation_count INTEGER NOT NULL DEFAULT 0,
  uncollected_pickup_count INTEGER NOT NULL DEFAULT 0,
  permissions_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_seller_id ON users(seller_id);
CREATE INDEX IF NOT EXISTS idx_users_invite_token ON users(invite_token);

-- 1B. SESSIONS & TOKENS
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  ip TEXT,
  user_agent TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);

-- 2. SELLERS & OFFICIAL STORES
CREATE TABLE IF NOT EXISTS sellers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Tanzania',
  rating REAL NOT NULL DEFAULT 5.0,
  total_reviews INTEGER NOT NULL DEFAULT 0,
  products_count INTEGER NOT NULL DEFAULT 0,
  followers_count INTEGER NOT NULL DEFAULT 0,
  is_live_commerce_active INTEGER NOT NULL DEFAULT 0,
  live_stream_title TEXT,
  joined_year INTEGER NOT NULL DEFAULT 2025,
  response_rate TEXT NOT NULL DEFAULT '99%',
  ship_on_time_rate TEXT NOT NULL DEFAULT '98%',
  is_official_store INTEGER NOT NULL DEFAULT 0,
  badge TEXT,
  avatar TEXT,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sellers_name ON sellers(name);

-- 3. CATEGORIES & BRANDS
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  image TEXT,
  product_count INTEGER NOT NULL DEFAULT 0,
  subcategories_json TEXT NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS brands (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo TEXT,
  is_official INTEGER NOT NULL DEFAULT 0,
  product_count INTEGER NOT NULL DEFAULT 0
);

-- 4. PRODUCTS & INVENTORY
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  seller_id TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  seller_city TEXT,
  price REAL NOT NULL,
  old_price REAL,
  discount_percentage REAL,
  rating REAL NOT NULL DEFAULT 5.0,
  review_count INTEGER NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  sold_count INTEGER NOT NULL DEFAULT 0,
  is_flash_sale INTEGER NOT NULL DEFAULT 0,
  flash_sale_ends_at TEXT,
  badges_json TEXT NOT NULL DEFAULT '[]',
  images_json TEXT NOT NULL DEFAULT '[]',
  thumbnail TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  key_features_json TEXT NOT NULL DEFAULT '[]',
  specifications_json TEXT NOT NULL DEFAULT '[]',
  variations_json TEXT NOT NULL DEFAULT '[]',
  condition TEXT NOT NULL DEFAULT 'Brand New',
  warranty TEXT NOT NULL DEFAULT '1 Year Official Warranty',
  free_delivery_eligible INTEGER NOT NULL DEFAULT 1,
  weight_kg REAL NOT NULL DEFAULT 1.0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (seller_id) REFERENCES sellers(id)
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  seller_id TEXT NOT NULL,
  warehouse_id TEXT,
  available INTEGER NOT NULL DEFAULT 0,
  reserved INTEGER NOT NULL DEFAULT 0,
  reorder_level INTEGER NOT NULL DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'IN_STOCK',
  location_bin TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (seller_id) REFERENCES sellers(id)
);

CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory(sku);

-- 5. ORDERS & ORDER ITEMS
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_data_json TEXT NOT NULL,
  items_json TEXT NOT NULL,
  delivery_address_json TEXT,
  delivery_method_json TEXT,
  payment_method_json TEXT NOT NULL,
  pricing_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Processing',
  status_history_json TEXT NOT NULL DEFAULT '[]',
  tracking_number TEXT,
  estimated_delivery_date TEXT,
  is_direct_vendor_payout INTEGER NOT NULL DEFAULT 0,
  escrow_bypassed INTEGER NOT NULL DEFAULT 0,
  salesperson_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_salesperson ON orders(salesperson_id);

-- 6. WAREHOUSES & TASKS
CREATE TABLE IF NOT EXISTS warehouses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  manager_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  capacity_units INTEGER NOT NULL DEFAULT 50000,
  current_utilization_units INTEGER NOT NULL DEFAULT 12000,
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS warehouse_tasks (
  id TEXT PRIMARY KEY,
  task_number TEXT UNIQUE NOT NULL,
  warehouse_id TEXT NOT NULL,
  type TEXT NOT NULL, -- PICKING, PACKING, QUALITY_CHECK, STAGING, DISPATCH
  order_id TEXT NOT NULL,
  order_number TEXT NOT NULL,
  items_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  priority TEXT NOT NULL DEFAULT 'MEDIUM',
  assigned_to_id TEXT,
  assigned_to_name TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT,
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);

CREATE INDEX IF NOT EXISTS idx_wh_tasks_order ON warehouse_tasks(order_id);
CREATE INDEX IF NOT EXISTS idx_wh_tasks_status ON warehouse_tasks(status);

-- 7. DELIVERY & RIDER LOGISTICS
CREATE TABLE IF NOT EXISTS delivery_runs (
  id TEXT PRIMARY KEY,
  run_number TEXT UNIQUE NOT NULL,
  agent_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ASSIGNED',
  start_time TEXT,
  end_time TEXT,
  total_parcels INTEGER NOT NULL DEFAULT 0,
  completed_parcels INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS delivery_tasks (
  id TEXT PRIMARY KEY,
  delivery_run_id TEXT NOT NULL,
  order_id TEXT NOT NULL,
  order_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  address TEXT NOT NULL,
  delivery_notes TEXT,
  payment_method TEXT,
  cod_amount REAL NOT NULL DEFAULT 0,
  is_cod_collected INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'QUEUED',
  otp_code TEXT NOT NULL,
  proof_of_delivery_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_delivery_tasks_order ON delivery_tasks(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_tasks_status ON delivery_tasks(status);

CREATE TABLE IF NOT EXISTS inventory_movements (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  seller_id TEXT NOT NULL,
  warehouse_id TEXT,
  sku TEXT NOT NULL,
  movement_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  reference_order_id TEXT,
  reference_order_number TEXT,
  performed_by_user_id TEXT NOT NULL,
  performed_by_user_name TEXT NOT NULL,
  performed_by_user_role TEXT NOT NULL,
  reason TEXT NOT NULL,
  previous_available INTEGER NOT NULL,
  new_available INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_inv_mov_product ON inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_inv_mov_type ON inventory_movements(movement_type);

-- 8. PICKUP STATIONS & INVENTORY
CREATE TABLE IF NOT EXISTS pickup_stations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  region TEXT NOT NULL DEFAULT 'Dar es Salaam',
  district TEXT,
  area TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  manager_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  capacity_packages INTEGER NOT NULL DEFAULT 500,
  current_packages INTEGER NOT NULL DEFAULT 0,
  operating_hours TEXT NOT NULL DEFAULT '08:00 - 20:00',
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  fee REAL NOT NULL DEFAULT 0,
  latitude REAL,
  longitude REAL,
  landmark TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  approved_at TEXT
);

CREATE TABLE IF NOT EXISTS pickup_inventory (
  id TEXT PRIMARY KEY,
  station_id TEXT NOT NULL,
  station_name TEXT NOT NULL,
  order_id TEXT NOT NULL,
  order_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shelf_location TEXT NOT NULL,
  package_count INTEGER NOT NULL DEFAULT 1,
  received_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'READY_FOR_PICKUP',
  otp_code TEXT NOT NULL,
  collected_at TEXT,
  FOREIGN KEY (station_id) REFERENCES pickup_stations(id)
);

CREATE INDEX IF NOT EXISTS idx_pickup_inv_station ON pickup_inventory(station_id);
CREATE INDEX IF NOT EXISTS idx_pickup_inv_order ON pickup_inventory(order_id);
CREATE INDEX IF NOT EXISTS idx_pickup_inv_status ON pickup_inventory(status);

-- 9. SELLER KYC & FINANCIALS / ESCROW / PAYOUTS
CREATE TABLE IF NOT EXISTS seller_kyc (
  id TEXT PRIMARY KEY,
  seller_id TEXT UNIQUE NOT NULL,
  business_registration_number TEXT,
  tin_number TEXT,
  national_id_or_passport TEXT,
  director_name TEXT,
  status TEXT NOT NULL DEFAULT 'APPROVED',
  submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
  verified_at TEXT,
  documents_json TEXT NOT NULL DEFAULT '[]',
  FOREIGN KEY (seller_id) REFERENCES sellers(id)
);

CREATE TABLE IF NOT EXISTS seller_payouts (
  id TEXT PRIMARY KEY,
  payout_number TEXT UNIQUE NOT NULL,
  seller_id TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TZS',
  status TEXT NOT NULL DEFAULT 'PENDING',
  method TEXT NOT NULL,
  account_details_json TEXT NOT NULL,
  requested_at TEXT NOT NULL DEFAULT (datetime('now')),
  processed_at TEXT,
  reference_code TEXT,
  FOREIGN KEY (seller_id) REFERENCES sellers(id)
);

CREATE TABLE IF NOT EXISTS financial_ledger (
  id TEXT PRIMARY KEY,
  seller_id TEXT,
  order_id TEXT,
  type TEXT NOT NULL, -- ESCROW_DEPOSIT, ESCROW_RELEASE, PAYOUT_DISBURSEMENT, COMMISSION_DEDUCTION, REFUND_DEDUCTION
  amount REAL NOT NULL,
  fee REAL NOT NULL DEFAULT 0,
  net REAL NOT NULL,
  balance_after REAL NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'TZS',
  description TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ledger_seller ON financial_ledger(seller_id);
CREATE INDEX IF NOT EXISTS idx_ledger_order ON financial_ledger(order_id);

-- 10. COMMISSION RULES & FIELD SALES
CREATE TABLE IF NOT EXISTS commission_rules (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  rate_percentage REAL NOT NULL,
  min_fee REAL NOT NULL DEFAULT 0,
  max_fee REAL,
  is_active INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sales_leads (
  id TEXT PRIMARY KEY,
  salesperson_id TEXT NOT NULL,
  salesperson_name TEXT NOT NULL,
  lead_type TEXT NOT NULL DEFAULT 'CUSTOMER',
  business_name TEXT,
  contact_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  region TEXT NOT NULL,
  city TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PROSPECT',
  notes_json TEXT NOT NULL DEFAULT '[]',
  expected_monthly_volume REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sales_targets (
  id TEXT PRIMARY KEY,
  salesperson_id TEXT NOT NULL,
  period TEXT NOT NULL,
  target_amount REAL NOT NULL,
  achieved_amount REAL NOT NULL DEFAULT 0,
  commission_earned REAL NOT NULL DEFAULT 0,
  leads_target INTEGER NOT NULL DEFAULT 20,
  leads_achieved INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sales_activities (
  id TEXT PRIMARY KEY,
  salesperson_id TEXT NOT NULL,
  lead_id TEXT,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  details TEXT NOT NULL,
  location TEXT,
  timestamp TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 11. SUPPORT TICKETS, MODERATION & RETURNS
CREATE TABLE IF NOT EXISTS support_tickets (
  id TEXT PRIMARY KEY,
  ticket_number TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'CUSTOMER',
  order_id TEXT,
  order_number TEXT,
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN',
  priority TEXT NOT NULL DEFAULT 'MEDIUM',
  messages_json TEXT NOT NULL DEFAULT '[]',
  internal_notes_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS moderation_items (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  target_title TEXT NOT NULL,
  reporter_user_id TEXT,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  action_taken TEXT
);

CREATE TABLE IF NOT EXISTS returns (
  id TEXT PRIMARY KEY,
  return_number TEXT UNIQUE NOT NULL,
  order_id TEXT NOT NULL,
  order_number TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  seller_id TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  refund_amount REAL NOT NULL,
  reason TEXT NOT NULL,
  customer_comment TEXT,
  images_json TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'RETURN_REQUESTED',
  pickup_station_or_address TEXT,
  rejection_reason TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 12. NOTIFICATIONS & AUDIT LOGS
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'ORDER',
  is_read INTEGER NOT NULL DEFAULT 0,
  link_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  previous_value TEXT,
  new_value TEXT,
  ip_address TEXT,
  timestamp TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- 13. APPLICATIONS, LIVE SESSIONS & PLATFORM BUILDER
CREATE TABLE IF NOT EXISTS vendor_applications (
  id TEXT PRIMARY KEY,
  business_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  category TEXT NOT NULL,
  city TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  submitted_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS rider_applications (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  license_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  submitted_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sales_applications (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  region TEXT NOT NULL,
  experience_years INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'PENDING',
  submitted_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS live_sessions (
  id TEXT PRIMARY KEY,
  seller_id TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  title TEXT NOT NULL,
  is_live INTEGER NOT NULL DEFAULT 0,
  is_recording INTEGER NOT NULL DEFAULT 1,
  viewers_count INTEGER NOT NULL DEFAULT 0,
  likes_count INTEGER NOT NULL DEFAULT 0,
  tagged_product_ids_json TEXT NOT NULL DEFAULT '[]',
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  ended_at TEXT
);

CREATE TABLE IF NOT EXISTS platform_builder_configs (
  id TEXT PRIMARY KEY,
  config_key TEXT UNIQUE NOT NULL,
  config_value_json TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 14. PROMOTIONS BUILDER
CREATE TABLE IF NOT EXISTS promotions (
  id TEXT PRIMARY KEY,
  seller_id TEXT NOT NULL,
  seller_name TEXT,
  name TEXT NOT NULL,
  internal_ref TEXT,
  description TEXT,
  image_url TEXT,
  promotion_type TEXT NOT NULL,
  start_date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_date TEXT NOT NULL,
  end_time TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'EAT (UTC+3)',
  status TEXT NOT NULL DEFAULT 'DRAFT',
  approval_status TEXT NOT NULL DEFAULT 'APPROVED',
  rejection_reason TEXT,
  admin_comment TEXT,
  applies_to TEXT NOT NULL DEFAULT 'Specific Products',
  product_ids_json TEXT NOT NULL DEFAULT '[]',
  category_ids_json TEXT NOT NULL DEFAULT '[]',
  excluded_product_ids_json TEXT NOT NULL DEFAULT '[]',
  excluded_category_ids_json TEXT NOT NULL DEFAULT '[]',
  exclude_out_of_stock INTEGER NOT NULL DEFAULT 1,
  exclude_already_discounted INTEGER NOT NULL DEFAULT 0,
  discount_config_json TEXT NOT NULL DEFAULT '{}',
  customer_eligibility_json TEXT NOT NULL DEFAULT '{}',
  limits_json TEXT NOT NULL DEFAULT '{}',
  coupon_json TEXT NOT NULL DEFAULT '{}',
  stacking_json TEXT NOT NULL DEFAULT '{}',
  storefront_display_json TEXT NOT NULL DEFAULT '{}',
  rule_builder_json TEXT NOT NULL DEFAULT '{}',
  financials_json TEXT NOT NULL DEFAULT '{}',
  analytics_json TEXT NOT NULL DEFAULT '{}',
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  published_at TEXT,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_promotions_seller_id ON promotions(seller_id);
CREATE INDEX IF NOT EXISTS idx_promotions_status ON promotions(status);


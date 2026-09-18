export interface ProductVariation {
  id: string;
  name: string; // e.g. "128GB / 6GB RAM - Phantom Black" or "Size 42 - White"
  type: 'storage' | 'size' | 'color' | 'bundle' | 'general';
  options: {
    label: string;
    value: string;
    priceAdjustment?: number; // Added to base price
    inStock: boolean;
  }[];
}

export interface ProductSpecification {
  group?: string;
  label: string;
  value: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  userLocation: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
}

export interface Seller {
  id: string;
  name: string;
  city: string;
  country: string;
  rating: number;
  totalReviews: number;
  productsCount: number;
  followersCount?: number;
  isLiveCommerceActive?: boolean;
  liveStreamTitle?: string;
  joinedYear: number;
  responseRate: string;
  shipOnTimeRate: string;
  isOfficialStore: boolean;
  badge?: string;
  avatar?: string;
  description?: string;
}

export type ProductBadge = 
  | 'SUPER DEAL' 
  | 'FLASH SALE' 
  | 'OFFICIAL STORE' 
  | 'TOP SELLER' 
  | 'FREE DELIVERY' 
  | 'LIMITED STOCK'
  | 'NEW ARRIVAL'
  | 'PROMOTION'
  | 'SPONSORED'
  | 'TRENDING'
  | 'WARRANTY INCLUDED'
  | 'CERTIFIED SEED'
  | 'INNOVATION'
  | 'CLINICALLY VALIDATED'
  | 'HOSPITAL GRADE'
  | 'HEAVY DUTY';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  sellerId: string;
  sellerName: string;
  sellerCity: string;
  price: number; // in TZS
  oldPrice?: number;
  discountPercentage?: number;
  rating: number;
  reviewCount: number;
  stock: number;
  soldCount?: number;
  viewCount?: number;
  performanceScore?: number;
  trendingRank?: number;
  autoDetectedReason?: string;
  detectionBadges?: string[];
  isFlashSale?: boolean;
  flashSaleEndsAt?: string;
  isSponsored?: boolean;
  isTrending?: boolean;
  hasWarranty?: boolean;
  status?: string;
  badges: (ProductBadge | string)[];
  images: string[];
  thumbnail: string;
  description: string;
  shortDescription?: string;
  keyFeatures: string[];
  specifications: ProductSpecification[];
  variations?: {
    type: string;
    title: string;
    options: {
      name: string;
      value: string;
      priceModifier?: number;
      image?: string;
      inStock: boolean;
    }[];
  }[];
  condition: string | 'Brand New' | 'Refurbished' | 'Open Box' | 'New';
  warranty: string;
  freeDeliveryEligible: boolean;
  weightKg?: number;
  originalPrice?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  image: string;
  description?: string;
  itemCount: number;
  subcategories: {
    id: string;
    name: string;
    slug: string;
    itemCount: number;
  }[];
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  bannerImage: string;
  description: string;
  productCount: number;
  isOfficial: boolean;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  selectedVariations: Record<string, string>; // e.g. { "Storage": "256GB", "Color": "Midnight Black" }
  unitPrice: number;
  totalPrice: number;
  savedForLater?: boolean;
}

export interface DeliveryRegion {
  id: string;
  name: string;
  hubCity: string;
  standardFee: number;
  expressFee: number;
  standardDays: string;
  expressDays: string;
  pickupStations: {
    id: string;
    name: string;
    area: string;
    address: string;
    fee: number;
    hours: string;
  }[];
}

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  additionalPhone?: string;
  region: string;
  city: string;
  area: string;
  streetAddress: string;
  street?: string;
  deliveryNotes?: string;
  isDefault?: boolean;
}

export type DeliveryMethodType = 'standard' | 'express' | 'pickup';

export type PaymentMethodType = 'mobile_money' | 'card' | 'cod';

export interface MobileMoneyDetails {
  provider: 'M-Pesa (Vodacom)' | 'Tigo Pesa' | 'Airtel Money' | 'Halopesa';
  phoneNumber: string;
}

export interface OrderItem {
  id?: string;
  name?: string;
  price?: number;
  thumbnail?: string;
  productId: string;
  productName: string;
  productImage: string;
  brand: string;
  sellerName: string;
  sellerId?: string;
  selectedVariations: Record<string, string>;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type OrderStatus = 
  | 'Pending'
  | 'Processing' 
  | 'Confirmed' 
  | 'Preparing'
  | 'Packaged'
  | 'Ready for Pickup'
  | 'Shipped' 
  | 'Dispatched'
  | 'In Transit'
  | 'Out for Delivery' 
  | 'Delivered' 
  | 'Returned'
  | 'Cancelled'
  | 'Delivery Failed'
  | 'Pickup Failed'
  | 'PLANTED';

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customer: {
    id?: string;
    name: string;
    email: string;
    phone: string;
    cancellationCount?: number;
    uncollectedPickupCount?: number;
    reliabilityScore?: number;
    isHighRiskFlagged?: boolean;
    flagReason?: string;
  };
  items: OrderItem[];
  deliveryAddress: DeliveryAddress;
  shippingAddress?: any;
  deliveryType?: 'home' | 'pickup' | 'doorstep' | 'standard' | 'express';
  deliveryMethod: {
    type: DeliveryMethodType;
    name: string;
    fee: number;
    estimatedDelivery: string;
    pickupStationName?: string;
    pickupStationId?: string;
  };
  paymentMethod: {
    type: PaymentMethodType;
    name: string;
    details?: string;
    status: 'Paid (Escrow Secured)' | 'Pending on Delivery' | 'Paid (Direct Merchant Remittance)';
    transactionRef?: string;
  };
  pricing: {
    subtotal: number;
    deliveryFee: number;
    discount: number;
    escrowFee: number; // 0 (Free escrow protection)
    total: number;
    shippingFee?: number;
    tax?: number;
  };
  total?: number;
  totalAmount?: number;
  status: OrderStatus;
  statusHistory: {
    status: OrderStatus;
    date: string;
    note: string;
  }[];
  trackingNumber: string;
  estimatedDeliveryDate?: string;
  estimatedDelivery?: string;
  isDirectVendorPayout?: boolean;
  escrowBypassed?: boolean;
  otpCode?: string;
  otpStatus?: 'ACTIVE' | 'VERIFIED' | 'EXPIRED' | 'LOCKED';
  otpExpiresAt?: string;
  otpAttempts?: number;
  paymentReleased?: boolean;
  paymentReleasedAt?: string;
  paymentStatus?: string;
  fulfillmentStatus?: string;
  riderId?: string;
  riderName?: string;
  salespersonId?: string;
  salespersonName?: string;
  salesCommission?: number;
  isAssistedOrder?: boolean;
}

export interface BuyerSellerMessage {
  id: string;
  sender: 'buyer' | 'seller';
  senderName: string;
  text: string;
  timestamp: string;
  productId?: string;
  productName?: string;
}

export interface FilterState {
  category?: string;
  subcategory?: string;
  brand?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  availability?: 'all' | 'in_stock';
  seller?: string[];
  condition?: string[];
  discountOnly?: boolean;
  freeDeliveryOnly?: boolean;
  officialStoreOnly?: boolean;
  searchQuery?: string;
  badge?: string;
}

export type SortOption = 
  | 'popularity' 
  | 'price_asc' 
  | 'price_desc' 
  | 'rating_desc' 
  | 'newest' 
  | 'discount_desc';

export interface SavedPaymentMethod {
  id: string;
  type: 'pay_on_delivery' | 'mobile_money' | 'card' | 'bank_transfer';
  provider: string; // 'Pay on Delivery' | 'M-Pesa (Vodacom)' | 'Tigo Pesa' | 'Airtel Money' | 'Halopesa' | 'Visa / MasterCard' | 'CRDB Bank' | 'NMB Bank'
  accountNumberOrPhone: string;
  accountHolderName: string;
  isDefault: boolean;
  expiryDate?: string;
  notes?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  email: string;
  phone: string;
  region: string;
  city: string;
  role?: UserRole;
  avatar?: string;
  sellerId?: string;
  salespersonId?: string;
  warehouseId?: string;
  pickupStationId?: string;
  addresses: DeliveryAddress[];
  paymentMethods?: SavedPaymentMethod[];
  walletBalance?: number;
  loyaltyPoints?: number;
  cancellationCount?: number;
  uncollectedPickupCount?: number;
  totalOrdersCount?: number;
  reliabilityScore?: number;
  isHighRiskFlagged?: boolean;
  flagReason?: string;
  termsAccepted?: boolean;
  termsAcceptedAt?: string;
}

export type UserRole =
  | 'CUSTOMER'
  | 'SELLER'
  | 'SELLER_STAFF'
  | 'SALESPERSON'
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'FINANCE_ADMIN'
  | 'FINANCE_OFFICER'
  | 'ACCOUNTING_STAFF'
  | 'CATALOG_ADMIN'
  | 'CATALOG_SPECIALIST'
  | 'MARKETING_ADMIN'
  | 'OPERATIONS_ADMIN'
  | 'WAREHOUSE_MANAGER'
  | 'WAREHOUSE_STAFF'
  | 'DELIVERY_AGENT'
  | 'PICKUP_STATION_MANAGER'
  | 'PICKUP_STATION_STAFF'
  | 'PICKUP_OPERATOR'
  | 'CUSTOMER_SUPPORT'
  | 'SUPPORT_AGENT'
  | 'CUSTOMER_CARE'
  | 'MODERATOR'
  | 'CONTENT_MODERATOR';

export type ApplicationLifecycleStatus =
  | 'PENDING'
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PENDING_VERIFICATION'
  | 'UNDER_REVIEW'
  | 'VERIFICATION_REQUIRED'
  | 'APPROVED'
  | 'ACCOUNT_ACTIVATION'
  | 'ACTIVE'
  | 'REJECTED'
  | 'SUSPENDED'
  | 'RESUBMITTED'
  | 'VERIFIED';

export type KycDocumentStatus =
  | 'Not Submitted'
  | 'Submitted'
  | 'Under Review'
  | 'Approved'
  | 'Rejected'
  | 'Expired';

export type OverallKycStatus =
  | 'Not Started'
  | 'Incomplete'
  | 'Submitted'
  | 'Under Review'
  | 'Approved'
  | 'Rejected'
  | 'Expired';

export interface KycDocumentItem {
  id: string;
  type: 'GOVERNMENT_ID' | 'ID_FRONT' | 'ID_BACK' | 'PROFILE_PHOTO' | 'PROOF_OF_ADDRESS' | 'DRIVERS_LICENSE' | 'VEHICLE_DOCS' | 'BUSINESS_LICENSE' | 'TIN_CERTIFICATE' | 'OTHER';
  name: string;
  url: string;
  status: KycDocumentStatus;
  uploadedAt: string;
  rejectionReason?: string;
  notes?: string;
}

export interface AuthSession {
  token: string;
  userId: string;
  role: UserRole;
  createdAt: string;
  expiresAt: string;
  ip?: string;
  userAgent?: string;
}

export interface UserAccount {
  id: string;
  email: string;
  phone: string;
  name: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  role: UserRole;
  passwordHash?: string;
  avatar?: string;
  sellerId?: string;
  salespersonId?: string;
  warehouseId?: string;
  pickupStationId?: string;
  department?: string;
  staffId?: string;
  status?: 'INVITED' | 'ACTIVE' | 'SUSPENDED' | 'REVOKED';
  inviteToken?: string;
  inviteExpiresAt?: string;
  inviteAcceptedAt?: string;
  passwordResetToken?: string;
  passwordResetCode?: string;
  passwordResetExpires?: string;
  failedAttempts?: number;
  lockedUntil?: string;
  isActive: boolean;
  isVerified: boolean;
  verificationStatus?: ApplicationLifecycleStatus;
  applicationId?: string;
  themePreference?: 'light' | 'dark' | 'system';
  termsAccepted?: boolean;
  termsAcceptedAt?: string;
  registrationProvider?: 'email' | 'google' | 'apple';
  createdAt: string;
  lastLoginAt?: string;
  permissions?: string[];
  cancellationCount?: number;
  uncollectedPickupCount?: number;
  totalOrdersCount?: number;
  reliabilityScore?: number;
  isHighRiskFlagged?: boolean;
  flagReason?: string;
  rejectionReason?: string;
  reviewNotes?: string;
}

export interface VendorApplication {
  id: string;
  applicantId?: string;
  storeName: string;
  contactName: string;
  email: string;
  phone: string;
  city: string;
  area: string;
  category: string;
  businessType: 'INDIVIDUAL' | 'REGISTERED_BUSINESS' | 'CORPORATE';
  brelaNumber?: string;
  tinNumber?: string;
  bankOrMpesa: string;
  expectedMonthlySales: string;
  hasPhysicalStore: boolean;
  status: ApplicationLifecycleStatus;
  verificationStatus?: ApplicationLifecycleStatus;
  kycDocuments?: KycDocumentItem[];
  overallKycStatus?: OverallKycStatus;
  reviewerId?: string;
  reviewerName?: string;
  reviewNotes?: string;
  rejectionReason?: string;
  submittedAt?: string;
  approvedAt?: string;
  verifiedAt?: string;
  notes?: string;
  createdAt?: string;
}

export interface RiderApplication {
  id: string;
  applicantId?: string;
  fullName: string;
  email: string;
  phone: string;
  dob?: string;
  address?: string;
  city: string;
  region?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  vehicleType: 'MOTORCYCLE' | 'BICYCLE' | 'TUKTUK_BAJAJ' | 'VAN';
  plateNumber: string;
  drivingLicenseNumber: string;
  nidaNumber: string;
  preferredZone: string;
  status: ApplicationLifecycleStatus;
  verificationStatus?: ApplicationLifecycleStatus;
  kycDocuments?: KycDocumentItem[];
  overallKycStatus?: OverallKycStatus;
  reviewerId?: string;
  reviewerName?: string;
  reviewNotes?: string;
  rejectionReason?: string;
  submittedAt?: string;
  approvedAt?: string;
  verifiedAt?: string;
  createdAt?: string;
}

export interface SalesApplication {
  id: string;
  applicantId?: string;
  fullName: string;
  email: string;
  phone: string;
  region: string;
  experienceYears: string;
  targetMerchantCategory: string;
  payoutAccount: string;
  status: ApplicationLifecycleStatus;
  verificationStatus?: ApplicationLifecycleStatus;
  kycDocuments?: KycDocumentItem[];
  overallKycStatus?: OverallKycStatus;
  reviewerId?: string;
  reviewerName?: string;
  reviewNotes?: string;
  rejectionReason?: string;
  submittedAt?: string;
  approvedAt?: string;
  verifiedAt?: string;
  createdAt?: string;
}

export interface PickupApplication {
  id: string;
  applicantId?: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  streetAddress?: string;
  storageCapacity?: string;
  operatingHours?: string;
  tinNumber?: string;
  status: ApplicationLifecycleStatus;
  verificationStatus?: ApplicationLifecycleStatus;
  kycDocuments?: KycDocumentItem[];
  overallKycStatus?: OverallKycStatus;
  reviewerId?: string;
  reviewerName?: string;
  reviewNotes?: string;
  rejectionReason?: string;
  submittedAt?: string;
  approvedAt?: string;
  verifiedAt?: string;
  createdAt?: string;
}

export interface FinanceLead {
  id: string;
  name: string;
  company: string;
  contactName: string;
  phone: string;
  email: string;
  source: string;
  value: number;
  probability: number;
  stage: 'PROSPECT' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST';
  owner: string;
  expectedCloseDate: string;
  notes: string[];
  status: string;
  createdAt: string;
}

export interface VendorSettlement {
  id: string;
  settlementNumber: string;
  vendorId: string;
  vendorName: string;
  grossSales: number;
  platformFees: number;
  commissionExpense: number;
  refundDeductions: number;
  netPayout: number;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'SCHEDULED' | 'PAID' | 'RECONCILED';
  requestedAt: string;
  scheduledDate?: string;
  paidAt?: string;
  bankOrMpesaDetails: string;
  referenceNo?: string;
  notes?: string;
}

export interface FinancialDecisionInsight {
  id: string;
  title: string;
  category: string;
  impactLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  metricChange: string;
  description: string;
  recommendation: string;
  createdAt: string;
}

export interface LiveCommerceSession {
  id: string;
  sellerId: string;
  sellerName: string;
  title: string;
  isLive: boolean;
  isRecording: boolean;
  viewersCount: number;
  likesCount: number;
  taggedProductIds: string[];
  startedAt: string;
  endedAt?: string;
}

export interface StockCatalogItem {
  id: string;
  category: string;
  title: string;
  description: string;
  downloadUrl: string;
  previewImage: string;
  fileSize: string;
  dimensions: string;
}

export type InventoryStatus =
  | 'AVAILABLE'
  | 'RESERVED'
  | 'PICKED'
  | 'PACKED'
  | 'IN_TRANSIT'
  | 'SOLD'
  | 'RETURNED'
  | 'DAMAGED'
  | 'LOST'
  | 'QUARANTINED';

export type InventoryMovementType =
  | 'OPENING_BALANCE'
  | 'INBOUND_RECEIVED'
  | 'STOCK_RESERVED'
  | 'STOCK_RELEASED'
  | 'PICKED'
  | 'PACKED'
  | 'DISPATCHED'
  | 'COLLECTED_SOLD'
  | 'RETURNED_SELLABLE'
  | 'RETURNED_DAMAGED'
  | 'ADJUSTED_MANUAL';

export interface InventoryMovement {
  id: string;
  productId: string;
  sellerId: string;
  warehouseId?: string;
  sku: string;
  movementType: InventoryMovementType;
  quantity: number; // Positive or negative adjustment
  referenceOrderId?: string;
  referenceOrderNumber?: string;
  performedByUserId: string;
  performedByUserName: string;
  performedByUserRole: UserRole;
  reason: string;
  previousAvailable: number;
  newAvailable: number;
  createdAt: string;
}

export interface PickupStation {
  id: string;
  name: string;
  region: string; // e.g. "Dar es Salaam", "Arusha", "Mwanza", "Dodoma", "Mbeya", "Kilimanjaro", "Tanga", "Morogoro", "Zanzibar"
  district?: string;
  area: string;
  streetAddress: string;
  contactName: string;
  contactPhone: string;
  operatingHours: string;
  capacityPackages: number;
  currentPackages?: number;
  status: 'PENDING_APPROVAL' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  fee: number; // in TZS (0 for free pickup)
  latitude?: number;
  longitude?: number;
  landmark?: string;
  createdAt?: string;
  approvedAt?: string;
}

export interface InventoryItem {
  id: string;
  productId: string;
  sellerId: string;
  sku: string;
  productName: string;
  brand: string;
  category: string;
  warehouseId: string;
  warehouseName: string;
  locationBin: string; // e.g. "Aisle 3 - Shelf B - Bin 12"
  available: number;
  reserved: number;
  sold: number;
  damaged: number;
  returned: number;
  quarantined: number;
  inTransit: number;
  reorderLevel: number;
  unitCost: number;
  updatedAt: string;
  quantityOnHand?: number;
  quantityReserved?: number;
  quantityAvailable?: number;
}

export interface SellerKYC {
  id: string;
  sellerId: string;
  businessType: 'INDIVIDUAL' | 'REGISTERED_BUSINESS' | 'CORPORATE';
  legalName: string;
  tradingName: string;
  registrationNumber: string;
  tinNumber: string;
  idType: 'NATIONAL_ID' | 'PASSPORT' | 'VOTER_ID' | 'DRIVING_LICENSE';
  idNumber: string;
  documents: {
    type: 'ID_CARD' | 'BUSINESS_LICENSE' | 'TIN_CERTIFICATE' | 'BANK_STATEMENT' | 'PROOF_OF_ADDRESS';
    name: string;
    url: string;
    status: 'PENDING' | 'VERIFIED' | 'REJECTED';
    uploadedAt: string;
  }[];
  bankDetails: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    swiftCode?: string;
    mobileMoneyNumber?: string;
    mobileMoneyProvider?: string;
  };
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  verifiedAt?: string;
  lastUpdatedAt?: string;
}

export interface SellerPayout {
  id: string;
  payoutNumber: string;
  sellerId: string;
  sellerName: string;
  amount: number;
  currency: string;
  deductions: {
    commission: number;
    shipping: number;
    refunds: number;
    advertisingFees: number;
  };
  netAmount: number;
  paymentMethod: 'MOBILE_MONEY' | 'BANK_TRANSFER';
  recipientDetails: string;
  status: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REJECTED';
  requestedAt: string;
  processedAt?: string;
  referenceNumber?: string;
  notes?: string;
}

export interface FinancialLedgerEntry {
  id: string;
  sellerId?: string;
  orderId?: string;
  type: 'ORDER_SALE' | 'COMMISSION_DEDUCTION' | 'ESCROW_RELEASE' | 'PAYOUT' | 'REFUND_DEDUCTION' | 'AD_SPEND' | 'WALLET_TOPUP' | 'COD_CASH_COLLECTED' | 'COD_HUB_RECONCILIATION';
  amount: number;
  fee: number;
  net: number;
  balanceAfter: number;
  currency: string;
  description: string;
  createdAt: string;
}

export interface CODTransaction {
  id: string;
  orderId: string;
  orderNumber: string;
  riderId: string;
  riderName: string;
  amount: number;
  currency: string;
  status: 'PENDING_COLLECTION' | 'COLLECTED_BY_RIDER' | 'DEPOSITED_TO_HUB' | 'RECONCILED' | 'DISPUTED';
  collectedAt?: string;
  depositedAt?: string;
  reconciledAt?: string;
  reconciledBy?: string;
  otpVerified: boolean;
  receivedByName?: string;
  varianceAmount?: number;
  varianceNotes?: string;
  hubLocation?: string;
  createdAt: string;
}

export interface CommissionRule {
  id: string;
  category: string;
  subCategory?: string;
  sellerTier?: 'STANDARD' | 'OFFICIAL_STORE' | 'TOP_SELLER';
  commissionRate: number; // e.g. 0.08 for 8%
  fixedFee: number;
  isActive: boolean;
}

export interface SalespersonLead {
  id: string;
  salespersonId: string;
  salespersonName: string;
  leadType: 'CUSTOMER' | 'SELLER';
  businessName?: string;
  contactName: string;
  phone: string;
  email: string;
  region: string;
  city: string;
  status: 'PROSPECT' | 'CONTACTED' | 'NEGOTIATION' | 'CONVERTED' | 'LOST';
  notes: string[];
  expectedMonthlyVolume?: number;
  convertedUserId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalespersonTarget {
  id: string;
  salespersonId: string;
  month: string; // e.g. "2026-08"
  salesTargetAmount: number;
  salesAchievedAmount: number;
  achievedAmount?: number;
  newCustomersTarget: number;
  newCustomersAchieved: number;
  newSellersTarget: number;
  newSellersAchieved: number;
  commissionEarned: number;
  commissionPending: number;
  commissionPaid: number;
  status: 'ON_TRACK' | 'BEHIND' | 'EXCEEDED';
}

export interface SalesActivity {
  id: string;
  salespersonId: string;
  leadId?: string;
  type: 'CALL' | 'VISIT' | 'MEETING' | 'ONBOARDING' | 'FOLLOWUP';
  title: string;
  details: string;
  location?: string;
  timestamp: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  region: string;
  city: string;
  address: string;
  capacitySqM: number;
  utilizationRate: number;
  activeZones: string[];
  managerName: string;
  phone: string;
}

export interface WarehouseTask {
  id: string;
  taskNumber: string;
  warehouseId: string;
  type: 'RECEIVING' | 'PUTAWAY' | 'PICKING' | 'PACKING' | 'DISPATCH' | 'CYCLE_COUNT';
  orderId?: string;
  orderNumber?: string;
  items: {
    sku: string;
    productName: string;
    quantity: number;
    locationBin: string;
    status: 'PENDING' | 'COMPLETED' | 'EXCEPTION';
  }[];
  assignedToName?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FLAGGED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
  completedAt?: string;
}

export interface DeliveryRun {
  id: string;
  runNumber: string;
  agentId: string;
  agentName: string;
  agentPhone: string;
  vehicleType: 'MOTORCYCLE' | 'VAN' | 'TRUCK';
  vehiclePlate?: string;
  vehicleRegNumber?: string;
  region: string;
  zone: string;
  routeZones?: string[];
  totalOrders: number;
  completedOrders: number;
  totalStops?: number;
  completedStops?: number;
  pendingCodAmount: number;
  collectedCodAmount: number;
  status: 'ASSIGNED' | 'OUT_FOR_DELIVERY' | 'COMPLETED' | 'RETURNED_TO_HUB';
  startedAt?: string;
  completedAt?: string;
}

export interface DeliveryTask {
  id: string;
  deliveryRunId?: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  address?: string;
  deliveryAddress?: string;
  deliveryType?: 'home' | 'pickup' | 'doorstep' | 'standard' | 'express';
  deliveryNotes?: string;
  coordinates?: { lat: number; lng: number };
  paymentMethod?: PaymentMethodType;
  codAmount: number;
  isCodCollected: boolean;
  riderId?: string;
  riderName?: string;
  assignedAt?: string;
  lastStatusUpdate?: string;
  createdAt?: string;
  status: 'QUEUED' | 'IN_TRANSIT' | 'ARRIVED' | 'DELIVERED' | 'FAILED' | 'RETURNED' | 'PENDING' | 'ASSIGNED';
  failureReason?: string;
  otpCode: string;
  proofOfDelivery?: {
    signatureUrl?: string;
    photoUrl?: string;
    receivedByName?: string;
    timestamp: string;
  };
}

export interface PickupStationInventory {
  id: string;
  stationId: string;
  stationName: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  shelfLocation: string;
  packageCount: number;
  receivedAt: string;
  expiresAt: string;
  status: 'READY_FOR_PICKUP' | 'COLLECTED' | 'EXPIRED' | 'RETURNED_TO_WAREHOUSE';
  otpCode: string;
  collectedAt?: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  role: 'CUSTOMER' | 'SELLER' | 'DELIVERY_AGENT' | 'SALESPERSON';
  orderId?: string;
  orderNumber?: string;
  category: 'ORDER_ISSUE' | 'PAYMENT' | 'DELIVERY' | 'RETURN_REFUND' | 'SELLER_ONBOARDING' | 'ACCOUNT' | 'OTHER';
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_CUSTOMER' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedTo?: string;
  assignedAgentName?: string;
  messages: {
    id: string;
    sender: 'USER' | 'AGENT' | 'SYSTEM';
    senderName: string;
    message: string;
    attachments?: string[];
    timestamp: string;
  }[];
  internalNotes?: {
    id: string;
    agentName: string;
    note: string;
    timestamp: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface ModerationItem {
  id: string;
  type: 'PRODUCT_APPROVAL' | 'SELLER_KYC' | 'REVIEW_REPORT' | 'COUNTERFEIT_FLAG' | 'FRAUD_ALERT';
  targetId: string;
  targetName: string;
  sellerId?: string;
  sellerName?: string;
  submittedBy?: string;
  details: string;
  riskScore: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED';
  reviewedBy?: string;
  resolutionNote?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface ReturnRequest {
  id: string;
  returnNumber: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  sellerId: string;
  sellerName: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  refundAmount: number;
  reason: 'WRONG_ITEM' | 'DAMAGED' | 'DEFECTIVE' | 'DEFECTIVE_ITEM' | 'WRONG_SIZE' | 'NOT_AS_DESCRIBED' | 'MISSING_PARTS' | 'CHANGED_MIND' | string;
  customerComment: string;
  images: string[];
  status: 
    | 'RETURN_REQUESTED'
    | 'RETURN_APPROVED'
    | 'RETURN_IN_TRANSIT'
    | 'RETURN_RECEIVED'
    | 'UNDER_INSPECTION'
    | 'APPROVED_FOR_REFUND'
    | 'REFUNDED'
    | 'RETURNED_TO_VENDOR'
    | 'REJECTED'
    | string;
  rejectionReason?: string;
  pickupStationOrAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole | string;
  action: string;
  entityType: 'PRODUCT' | 'ORDER' | 'PAYOUT' | 'COMMISSION' | 'KYC' | 'USER' | 'INVENTORY' | 'SUPPORT' | 'SETTINGS' | 'SECURITY' | 'PAYMENT' | 'PROMOTION' | 'WAREHOUSE' | 'PICKUP' | 'BUILDER';
  entityId: string;
  previousValue?: string;
  newValue?: string;
  status?: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
  severity?: 'INFO' | 'WARNING' | 'CRITICAL' | 'SECURITY';
  details?: string;
  userAgent?: string;
  ipAddress?: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'ORDER' | 'PAYMENT' | 'DELIVERY' | 'PAYOUT' | 'SECURITY' | 'PROMOTION' | 'KYC' | 'COMMISSION' | 'SYSTEM';
  isRead?: boolean;
  read?: boolean;
  linkUrl?: string;
  link?: string;
  createdAt: string;
}

export interface AdvertisingCampaign {
  id: string;
  sellerId: string;
  sellerName: string;
  name: string;
  productId: string;
  productName: string;
  dailyBudget: number;
  totalBudget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  cpc: number;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'DRAFT';
  startDate: string;
  endDate: string;
}

export interface PlatformAnalytics {
  gmv: number;
  revenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalSellers: number;
  totalSalespersons: number;
  activeProducts: number;
  pendingApprovals: number;
  escrowSecuredAmount: number;
  avgOrderValue: number;
  returnRate: number;
  growthMetrics: {
    monthlyGmvGrowth: number;
    monthlyCustomerGrowth: number;
    monthlySellerGrowth: number;
  };
}

export type PromotionType =
  | 'Percentage Discount'
  | 'Fixed Amount Discount'
  | 'Buy X Get Y'
  | 'Buy X Get X'
  | 'Free Delivery'
  | 'Bundle Discount'
  | 'Quantity Discount'
  | 'Flash Sale'
  | 'Product-Specific Discount'
  | 'Category Discount'
  | 'Store-Wide Discount'
  | 'Custom Promotion';

export type PromotionStatus =
  | 'Draft'
  | 'Submitted'
  | 'Under Review'
  | 'Approved'
  | 'Scheduled'
  | 'Active'
  | 'Paused'
  | 'Expired'
  | 'Cancelled'
  | 'Rejected';

export interface QuantityTier {
  minQty: number;
  maxQty: number;
  discountPercent: number;
}

export interface PromotionDiscountConfig {
  percentage?: number;
  maxDiscountAmount?: number;
  fixedDiscountAmount?: number;
  minOrderValue?: number;
  minQuantity?: number;
  maxDiscountedQuantity?: number;
  maxUses?: number;
  buyQuantity?: number;
  getQuantity?: number;
  freeProductId?: string;
  freeProductName?: string;
  buyXGetXDiscountPercent?: number;
  freeDeliveryMaxSubsidy?: number;
  deliveryZones?: string[];
  bundleProductIds?: string[];
  bundlePrice?: number;
  bundleDiscountPercent?: number;
  bundleStockLimit?: number;
  quantityTiers?: QuantityTier[];
  flashSalePrice?: number;
  maxPurchasesPerCustomer?: number;
}

export interface PromotionCustomerEligibility {
  targetSegment: 'All Customers' | 'New Customers' | 'Returning Customers' | 'First Order Customers' | 'VIP Customers';
  minPreviousOrders?: number;
  minLifetimeSpend?: number;
  minOrderValue?: number;
  minQuantity?: number;
}

export interface PromotionLimits {
  maxTotalUses?: number;
  maxUsesPerCustomer?: number;
  maxDiscountedUnits?: number;
  dailyUsageLimit?: number;
  minOrderValue?: number;
  maxOrderValue?: number;
  isUnlimitedUses?: boolean;
  isUnlimitedPerCustomer?: boolean;
}

export interface PromotionCoupon {
  requireCoupon: boolean;
  code?: string;
  prefix?: string;
  length?: number;
  usageLimit?: number;
  usagePerCustomer?: number;
  isCaseSensitive?: boolean;
  activePeriod?: string;
}

export interface PromotionStacking {
  canCombine: boolean;
  combineWithVendorPromos?: boolean;
  combineWithPlatformPromos?: boolean;
  combineWithCoupons?: boolean;
  combineWithFreeDelivery?: boolean;
  combineWithLoyalty?: boolean;
}

export interface PromotionStorefrontDisplay {
  placements: ('Product Page' | 'Category Page' | 'Vendor Store' | 'Search Results' | 'Promotion Page' | 'Checkout')[];
  badgeText?: string;
  bannerUrl?: string;
  shortMessage?: string;
  showCountdownTimer?: boolean;
  highlightProduct?: boolean;
}

export interface PromotionRuleCondition {
  field: string;
  operator: string;
  value: any;
}

export interface PromotionRuleAction {
  actionType: string;
  value: any;
}

export interface PromotionRuleBuilder {
  conditions: PromotionRuleCondition[];
  actions: PromotionRuleAction[];
}

export interface PromotionFinancials {
  vendorFundedPercent: number;
  platformFundedPercent: number;
  estimatedUnitsAffected: number;
  minVendorMarginPercent: number;
}

export interface PromotionAnalytics {
  views: number;
  clicks: number;
  redemptions: number;
  orders: number;
  revenue: number;
  totalDiscountGiven: number;
  conversionRate: number;
}

export interface Promotion {
  id: string;
  sellerId: string;
  sellerName: string;
  name: string;
  internalRef?: string;
  description?: string;
  imageUrl?: string;
  promotionType: PromotionType;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  timezone: string;
  status: PromotionStatus;
  approvalStatus: 'APPROVED' | 'SUBMITTED' | 'UNDER_REVIEW' | 'REJECTED' | 'NOT_REQUIRED';
  rejectionReason?: string;
  adminComment?: string;
  reviewer?: string;
  appliesTo: 'Specific Products' | 'Specific Categories' | 'All Vendor Products' | 'Product Collections';
  productIds: string[];
  categoryIds: string[];
  excludedProductIds: string[];
  excludedCategoryIds: string[];
  excludeOutOfStock: boolean;
  excludeAlreadyDiscounted: boolean;
  discountConfig: PromotionDiscountConfig;
  customerEligibility: PromotionCustomerEligibility;
  limits: PromotionLimits;
  coupon: PromotionCoupon;
  stacking: PromotionStacking;
  storefrontDisplay: PromotionStorefrontDisplay;
  ruleBuilder?: PromotionRuleBuilder;
  financials: PromotionFinancials;
  analytics: PromotionAnalytics;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  version: number;
}

// ----------------------------------------------------
// CUSTOM FIELDS SYSTEM (PARTS 4-8)
// ----------------------------------------------------
export type CustomFieldScope = 'Vendor' | 'Product' | 'Buyer' | 'Order' | 'Rider' | 'Warehouse' | 'PickupStation' | 'SupportTicket';

export type CustomFieldType =
  // Text
  | 'Short text'
  | 'Long text'
  | 'Rich text'
  // Numeric
  | 'Number'
  | 'Decimal'
  | 'Currency (TZS)'
  | 'Percentage (%)'
  // Date & Time
  | 'Date'
  | 'Time'
  | 'Date & Time'
  | 'Date Range'
  // Boolean
  | 'Yes/No'
  | 'Toggle Switch'
  // Selection
  | 'Dropdown Single-Select'
  | 'Multi-Select'
  | 'Radio Buttons'
  | 'Checkbox Group'
  // Contact
  | 'Email Address'
  | 'Phone Number'
  | 'Website URL'
  // Location
  | 'Physical Address'
  | 'Country'
  | 'Region / Province'
  | 'City / District'
  | 'GPS Coordinates'
  // Identification
  | 'NIDA / ID Number'
  | 'Passport Number'
  | 'BRELA Registration No'
  | 'Tax ID (TIN)'
  // Files
  | 'Single File'
  | 'Multiple Files'
  | 'Image Upload'
  | 'PDF Document'
  // Financial
  | 'Monetary Amount'
  | 'Payment Reference'
  | 'Bank Account Details'
  // Relationship
  | 'Customer Selector'
  | 'Seller Selector'
  | 'Product Selector'
  | 'Order Selector'
  | 'Rider Selector'
  | 'Warehouse Selector'
  | 'Pickup Station Selector'
  | 'Salesperson Selector'
  // System
  | 'Auto-generated ID'
  | 'Timestamp'
  | 'Created By'
  | 'Updated By'
  | 'System Status'
  // Advanced
  | 'Formula / Calculated'
  | 'Computed Value'
  | 'JSON Data Object'
  | 'API-Sourced Value';

export interface CustomFieldOption {
  label: string;
  value: string;
}

export interface CustomFieldValidationRules {
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  regexPattern?: string;
  allowedExtensions?: string[];
  maxFileSizeMb?: number;
}

export interface CustomFieldVisibility {
  searchable: boolean;
  filterable: boolean;
  sortable: boolean;
  customerVisible: boolean;
  sellerVisible: boolean;
  operationsVisible: boolean;
  adminVisible: boolean;
}

export interface CustomFieldDefinition {
  id: string;
  name: string;
  key: string;
  scope: CustomFieldScope;
  entity: string;
  type: CustomFieldType;
  description?: string;
  required: boolean;
  defaultValue?: any;
  placeholder?: string;
  validation: CustomFieldValidationRules;
  options?: CustomFieldOption[];
  visibility: CustomFieldVisibility;
  active: boolean;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt?: string;
  updatedAt?: string;
}

// ----------------------------------------------------
// DISPUTES & RISK MANAGEMENT (PART 14)
// ----------------------------------------------------
export type DisputeStatus =
  | 'OPEN'
  | 'UNDER_REVIEW'
  | 'WAITING_FOR_INFORMATION'
  | 'RESOLVED'
  | 'REJECTED'
  | 'ESCALATED'
  | 'CLOSED';

export type DisputeResolution =
  | 'FULL_REFUND_BUYER'
  | 'PARTIAL_REFUND'
  | 'RELEASE_FUNDS_SELLER'
  | 'REPLACEMENT_ORDER'
  | 'CANCEL_TRANSACTION';

export interface DisputeRecord {
  id: string;
  disputeNumber: string;
  orderId: string;
  orderNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  userRole: 'CUSTOMER' | 'SELLER' | 'OPERATIONS' | 'ADMIN';
  sellerId?: string;
  sellerName?: string;
  reason: string;
  category: 'ITEM_NOT_RECEIVED' | 'DAMAGED_GOODS' | 'WRONG_ITEM' | 'COUNTERFEIT' | 'PAYMENT_ISSUE' | 'SELLER_CANCELLATION' | 'OTHER';
  description: string;
  status: DisputeStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  evidenceUrls?: string[];
  disputedAmount: number;
  escrowFrozen: boolean;
  resolution?: DisputeResolution;
  resolutionNote?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  messages: Array<{
    id: string;
    sender: 'CUSTOMER' | 'SELLER' | 'OPERATIONS' | 'ADMIN' | 'SYSTEM';
    senderName: string;
    message: string;
    timestamp: string;
    attachments?: string[];
  }>;
  auditTrail: Array<{
    id: string;
    action: string;
    performedBy: string;
    timestamp: string;
    notes?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RiskIncident {
  id: string;
  incidentNumber: string;
  entityType: 'ORDER' | 'USER' | 'SELLER' | 'RIDER' | 'PAYMENT';
  entityId: string;
  entityReference: string;
  riskLevel: RiskLevel;
  riskScore: number; // 0 - 100
  factors: string[];
  investigationNotes?: string;
  status: 'MONITORING' | 'ACTION_REQUIRED' | 'RESTRICTED' | 'CLEARED' | 'SUSPENDED';
  actionTaken?: 'COD_RESTRICTED' | 'ACCOUNT_SUSPENDED' | 'PAYOUT_HELD' | 'KYC_MANUAL_REVIEW_REQUIRED' | 'NONE';
  reportedBy: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------
// FREE DELIVERY ENGINE & ZONES (PARTS 18 & 19)
// ----------------------------------------------------
export interface DeliveryZone {
  id: string;
  name: string;
  code: string;
  city: string;
  region: string;
  districts: string[];
  centerCoordinates?: { lat: number; lng: number };
  radiusKm?: number;
  baseDeliveryFee: number;
  expressDeliveryFee: number;
  freeDeliveryThreshold: number; // Order subtotal amount in TZS to trigger Free Delivery
  isFreeDeliveryZone: boolean;
  eligibleCategories?: string[];
  status: 'ACTIVE' | 'INACTIVE';
}



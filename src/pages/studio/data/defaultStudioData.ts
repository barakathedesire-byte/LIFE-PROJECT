import { 
  StudioPage, 
  DesignSystemTokens, 
  GlobalComponentDef, 
  PlatformMapNode, 
  PlatformMapLink, 
  ComponentCategory 
} from '../../../types/studio';

export const DEFAULT_DESIGN_TOKENS: DesignSystemTokens = {
  brandPrimary: '#FF6A00',
  brandDark: '#0F172A',
  brandSecondary: '#2563EB',
  accentSuccess: '#10B981',
  accentWarning: '#F59E0B',
  accentDanger: '#EF4444',
  surfaceLight: '#F8FAFC',
  surfaceDark: '#0B0F19',
  fontHeading: 'Inter, system-ui, sans-serif',
  fontBody: 'Inter, system-ui, sans-serif',
  fontSizeBase: 16,
  scaleRatio: 1.25,
  radiusBase: '12px',
  buttonVariant: 'solid'
};

export interface ComponentPaletteItem {
  type: string;
  name: string;
  category: ComponentCategory;
  description: string;
  iconName: string;
  defaultProps: Record<string, any>;
  defaultStyles: Record<string, any>;
  defaultDataBinding?: any;
}

export const COMPONENT_PALETTE: ComponentPaletteItem[] = [
  // Navigation
  {
    type: 'nav_header',
    name: 'LUMO Header',
    category: 'navigation',
    description: 'Main navigation bar with search, categories, cart & profile',
    iconName: 'Compass',
    defaultProps: {
      showCategoryDropdown: true,
      showSearchBar: true,
      showCartButton: true,
      showAccountMenu: true,
      bannerNotice: '⚡ Karibu LUMO! Same-day delivery available across Dar es Salaam & Arusha'
    },
    defaultStyles: { backgroundColor: '#FFFFFF', padding: 'sm', shadow: 'sm' }
  },
  {
    type: 'nav_secondary',
    name: 'Category Bar',
    category: 'navigation',
    description: 'Horizontal quick-scroll category pills bar',
    iconName: 'Layers',
    defaultProps: {
      categories: ['All', 'Phones & Tablets', 'Electronics', 'Appliances', 'Fashion', 'Beauty', 'Supermarket', 'Official Stores']
    },
    defaultStyles: { backgroundColor: '#FFFFFF', padding: 'xs', shadow: 'none' }
  },
  {
    type: 'breadcrumb',
    name: 'Breadcrumbs',
    category: 'navigation',
    description: 'Hierarchical path navigation trail',
    iconName: 'ChevronRight',
    defaultProps: {
      items: [{ label: 'Home', link: '/' }, { label: 'Electronics', link: '/category/electronics' }, { label: 'Audio & Sound' }]
    },
    defaultStyles: { padding: 'xs', fontSize: 'xs' }
  },

  // Commerce
  {
    type: 'product_carousel',
    name: 'Product Carousel',
    category: 'commerce',
    description: 'Horizontal scrolling product slider with real backend binding',
    iconName: 'Sparkles',
    defaultProps: {
      title: '⚡ Flash Deals Kariakoo Direct',
      subtitle: 'Up to 45% off guaranteed genuine electronics',
      badgeText: 'HOT OFFERS',
      itemLimit: 8
    },
    defaultStyles: { padding: 'md', columns: 4, mobileColumns: 2 },
    defaultDataBinding: { source: 'products', limit: 8, sortBy: 'sales' }
  },
  {
    type: 'product_grid',
    name: 'Product Grid',
    category: 'commerce',
    description: 'Responsive multi-column catalog grid with live inventory',
    iconName: 'Grid',
    defaultProps: {
      title: 'Trending Marketplace Products',
      subtitle: 'Verified East Africa official vendors',
      showPagination: true,
      itemsPerPage: 8
    },
    defaultStyles: { padding: 'md', columns: 4, mobileColumns: 2 },
    defaultDataBinding: { source: 'products', limit: 12, sortBy: 'newest' }
  },
  {
    type: 'category_grid',
    name: 'Category Tiles',
    category: 'commerce',
    description: 'Visual category cards with icons and product counts',
    iconName: 'FolderTree',
    defaultProps: {
      title: 'Shop by Popular Department',
      layout: 'grid'
    },
    defaultStyles: { padding: 'md', columns: 6, mobileColumns: 2 }
  },
  {
    type: 'seller_card_grid',
    name: 'Verified Sellers',
    category: 'commerce',
    description: 'Official brand stores with badges, ratings & follow counts',
    iconName: 'Store',
    defaultProps: {
      title: 'Top Rated Official Stores',
      subtitle: 'TIN & BRELA verified Tanzanian merchants',
      itemLimit: 4
    },
    defaultStyles: { padding: 'md', columns: 4, mobileColumns: 1 },
    defaultDataBinding: { source: 'sellers', limit: 4 }
  },
  {
    type: 'escrow_trust_badge',
    name: 'Escrow Guarantee Badge',
    category: 'commerce',
    description: 'LUMO Escrow SafePay assurance banner for buyer trust',
    iconName: 'ShieldCheck',
    defaultProps: {
      heading: '100% Protected by LUMO Escrow Vault',
      body: 'Your payment stays safely locked until you inspect and accept your package at your doorstep or pickup station.'
    },
    defaultStyles: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0', padding: 'md', borderRadius: 'xl' }
  },

  // Marketing
  {
    type: 'hero_banner',
    name: 'Hero Showcase Banner',
    category: 'marketing',
    description: 'High-impact promotional banner with CTA and badge',
    iconName: 'Image',
    defaultProps: {
      headline: 'Discover Genuine Quality at Wholesaler Prices',
      subheadline: 'Direct from Kariakoo, Posta & Nairobi central hubs with express same-day courier dispatch.',
      ctaText: 'Shop Mega Deals',
      ctaLink: '/products',
      badge: 'TZS BEST PRICE GUARANTEE',
      imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200'
    },
    defaultStyles: { backgroundColor: '#0F172A', textColor: '#FFFFFF', padding: 'lg', borderRadius: '2xl' }
  },
  {
    type: 'promo_banner_split',
    name: 'Dual Promo Tiles',
    category: 'marketing',
    description: 'Side-by-side promotional campaign boxes',
    iconName: 'Columns',
    defaultProps: {
      leftTitle: 'Smartphones & 5G Tablets',
      leftDiscount: 'Save up to 30%',
      leftImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',
      rightTitle: 'Home Comfort & Smart Living',
      rightDiscount: 'From 45,000 TZS',
      rightImage: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600'
    },
    defaultStyles: { padding: 'md', columns: 2, mobileColumns: 1 }
  },
  {
    type: 'trust_metrics',
    name: 'Trust & Logistics Badges',
    category: 'marketing',
    description: '4-point service features: Escrow, Delivery, Support, Quality',
    iconName: 'Award',
    defaultProps: {
      features: [
        { icon: 'ShieldCheck', title: 'Escrow Protection', desc: 'Money held until received' },
        { icon: 'Truck', title: 'Fast Door Delivery', desc: 'Same-day in Dar & Arusha' },
        { icon: 'RotateCcw', title: '7-Day Easy Returns', desc: 'No-hassle refund guarantee' },
        { icon: 'Headphones', title: 'Local 24/7 Support', desc: 'Swahili & English team' }
      ]
    },
    defaultStyles: { backgroundColor: '#FFFFFF', padding: 'md', borderRadius: 'xl', shadow: 'sm' }
  },

  // Operations
  {
    type: 'order_status_tracker',
    name: 'Live Order Tracker',
    category: 'operations',
    description: 'Visual step-by-step progress for buyer order & delivery',
    iconName: 'Clock',
    defaultProps: {
      activeStep: 'DISPATCHED',
      steps: ['Payment Secured', 'Merchant Preparing', 'Warehouse Dispatched', 'Out with Rider', 'Delivered']
    },
    defaultStyles: { backgroundColor: '#FFFFFF', padding: 'md', borderRadius: 'xl' }
  },
  {
    type: 'dispatch_queue_monitor',
    name: 'Rider Dispatch Queue',
    category: 'operations',
    description: 'Live table of active deliveries and assigned couriers',
    iconName: 'Navigation',
    defaultProps: {
      title: 'Active Fleet Operations (Lumo Move)',
      hubFilter: 'Dar es Salaam Central'
    },
    defaultStyles: { padding: 'md' }
  },
  {
    type: 'warehouse_bin_inventory',
    name: 'Warehouse Stock Shelf',
    category: 'operations',
    description: 'Fulfillment center inventory table with barcode & bin locations',
    iconName: 'Box',
    defaultProps: {
      title: 'Warehouse A1 Receiving & Put-Away',
      warehouseId: 'wh-dar-01'
    },
    defaultStyles: { padding: 'md' }
  },

  // Dashboard
  {
    type: 'kpi_stat_card',
    name: 'KPI Metric Stat Card',
    category: 'dashboard',
    description: 'Single metric card with trend indicator and icon',
    iconName: 'TrendingUp',
    defaultProps: {
      title: 'Today Gross Orders',
      value: '4,850,000 TZS',
      change: '+18.4%',
      isPositive: true,
      timeframe: 'vs yesterday'
    },
    defaultStyles: { backgroundColor: '#FFFFFF', padding: 'md', borderRadius: 'xl', shadow: 'sm' }
  },
  {
    type: 'recent_activity_feed',
    name: 'Realtime Activity Feed',
    category: 'dashboard',
    description: 'Chronological timeline of system events and transactions',
    iconName: 'Activity',
    defaultProps: {
      title: 'Live Platform Audit Feed',
      maxItems: 5
    },
    defaultStyles: { backgroundColor: '#FFFFFF', padding: 'md', borderRadius: 'xl' }
  },

  // Forms
  {
    type: 'contact_support_form',
    name: 'Dispute & Ticket Form',
    category: 'forms',
    description: 'Customer inquiry and dispute filing form with validation',
    iconName: 'FileText',
    defaultProps: {
      title: 'Lumo Care Dispute Resolution',
      buttonText: 'Submit Inquiry to Operations'
    },
    defaultStyles: { backgroundColor: '#FFFFFF', padding: 'lg', borderRadius: 'xl' }
  },
  {
    type: 'vendor_onboarding_form',
    name: 'Vendor KYC Submission',
    category: 'forms',
    description: 'Merchant registration form with TIN, BRELA, and ID upload',
    iconName: 'UserCheck',
    defaultProps: {
      title: 'Step 1: Merchant Profile & Tax Information',
      allowDocumentUpload: true
    },
    defaultStyles: { backgroundColor: '#FFFFFF', padding: 'lg', borderRadius: 'xl' }
  },

  // System
  {
    type: 'empty_state',
    name: 'Empty State Placeholder',
    category: 'system',
    description: 'Friendly illustrated empty state with action button',
    iconName: 'Inbox',
    defaultProps: {
      title: 'No Orders Found',
      description: 'You have not placed any orders yet. Start shopping our verified deals!',
      actionLabel: 'Browse Marketplace',
      actionLink: '/products'
    },
    defaultStyles: { padding: 'xl', alignment: 'center' }
  },
  {
    type: 'alert_banner',
    name: 'Alert / Notification Bar',
    category: 'system',
    description: 'Status message banner with icon and dismiss button',
    iconName: 'AlertTriangle',
    defaultProps: {
      variant: 'warning',
      title: 'Scheduled System Maintenance',
      message: 'Mobile Money payment webhooks will undergo brief maintenance at 02:00 AM EAT.'
    },
    defaultStyles: { padding: 'sm', borderRadius: 'lg' }
  }
];

export const DEFAULT_GLOBAL_COMPONENTS: GlobalComponentDef[] = [
  {
    id: 'global-lumo-header',
    name: 'Master LUMO Storefront Header',
    category: 'navigation',
    description: 'Global top navigation used across all consumer shopping views',
    instanceCount: 14,
    component: {
      id: 'g-comp-1',
      type: 'nav_header',
      name: 'LUMO Header',
      category: 'navigation',
      isGlobal: true,
      globalId: 'global-lumo-header',
      props: {
        showCategoryDropdown: true,
        showSearchBar: true,
        showCartButton: true,
        showAccountMenu: true,
        bannerNotice: '⚡ Karibu LUMO! Same-day delivery available across Dar es Salaam & Arusha'
      },
      styles: { backgroundColor: '#FFFFFF', padding: 'sm', shadow: 'sm' }
    }
  },
  {
    id: 'global-escrow-badge',
    name: 'Escrow SafePay Trust Guarantee',
    category: 'commerce',
    description: 'Security guarantee badge placed on checkout, cart and product pages',
    instanceCount: 6,
    component: {
      id: 'g-comp-2',
      type: 'escrow_trust_badge',
      name: 'Escrow Guarantee Badge',
      category: 'commerce',
      isGlobal: true,
      globalId: 'global-escrow-badge',
      props: {
        heading: '100% Protected by LUMO Escrow Vault',
        body: 'Your payment stays safely locked until you inspect and accept your package at your doorstep or pickup station.'
      },
      styles: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0', padding: 'md', borderRadius: 'xl' }
    }
  },
  {
    id: 'global-trust-metrics',
    name: 'Platform Value Propositions',
    category: 'marketing',
    description: '4-pillar service trust banner used in homepage and footer',
    instanceCount: 4,
    component: {
      id: 'g-comp-3',
      type: 'trust_metrics',
      name: 'Trust & Logistics Badges',
      category: 'marketing',
      isGlobal: true,
      globalId: 'global-trust-metrics',
      props: {
        features: [
          { icon: 'ShieldCheck', title: 'Escrow Protection', desc: 'Money held until received' },
          { icon: 'Truck', title: 'Fast Door Delivery', desc: 'Same-day in Dar & Arusha' },
          { icon: 'RotateCcw', title: '7-Day Easy Returns', desc: 'No-hassle refund guarantee' },
          { icon: 'Headphones', title: 'Local 24/7 Support', desc: 'Swahili & English team' }
        ]
      },
      styles: { backgroundColor: '#FFFFFF', padding: 'md', borderRadius: 'xl', shadow: 'sm' }
    }
  }
];

export const DEFAULT_PLATFORM_PAGES: StudioPage[] = [
  // CUSTOMER EXPERIENCE
  {
    id: 'page-home',
    name: 'Marketplace Homepage',
    slug: 'home',
    mode: 'CUSTOMER',
    route: '/',
    icon: 'Home',
    description: 'Primary landing page for consumer product discovery and flash deals',
    isPublished: true,
    isSystem: true,
    seoTitle: 'LUMO - Tanzania & East Africa Premier Marketplace',
    seoDescription: 'Shop genuine electronics, fashion, home essentials with verified escrow protection and express delivery.',
    sections: [
      {
        id: 'sec-home-hero',
        name: 'Hero Showcase',
        paddingY: 'md',
        components: [
          {
            id: 'c-hero-1',
            type: 'hero_banner',
            name: 'Hero Showcase Banner',
            category: 'marketing',
            props: {
              headline: 'Discover Genuine Quality at Wholesaler Prices',
              subheadline: 'Direct from Kariakoo, Posta & Nairobi central hubs with express same-day courier dispatch.',
              ctaText: 'Shop Kariakoo Mega Deals',
              ctaLink: '/products',
              badge: 'TZS BEST PRICE GUARANTEE',
              imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200'
            },
            styles: { backgroundColor: '#0F172A', textColor: '#FFFFFF', padding: 'lg', borderRadius: '2xl' }
          }
        ]
      },
      {
        id: 'sec-home-trust',
        name: 'Trust & SafePay Assurance',
        paddingY: 'sm',
        components: [
          {
            id: 'c-trust-1',
            type: 'trust_metrics',
            name: 'Trust & Logistics Badges',
            category: 'marketing',
            props: {
              features: [
                { icon: 'ShieldCheck', title: 'Escrow Protection', desc: 'Money held until received' },
                { icon: 'Truck', title: 'Fast Door Delivery', desc: 'Same-day in Dar & Arusha' },
                { icon: 'RotateCcw', title: '7-Day Easy Returns', desc: 'No-hassle refund guarantee' },
                { icon: 'Headphones', title: 'Local 24/7 Support', desc: 'Swahili & English team' }
              ]
            },
            styles: { backgroundColor: '#FFFFFF', padding: 'md', borderRadius: 'xl', shadow: 'sm' }
          }
        ]
      },
      {
        id: 'sec-home-flash',
        name: 'Flash Deals Carousel',
        paddingY: 'md',
        components: [
          {
            id: 'c-flash-1',
            type: 'product_carousel',
            name: 'Product Carousel',
            category: 'commerce',
            props: {
              title: '⚡ Super Flash Deals — Kariakoo Live',
              subtitle: 'Limited stock discounts expiring tonight at midnight',
              badgeText: 'HOTTEST SAVINGS',
              itemLimit: 6
            },
            styles: { padding: 'md', columns: 4, mobileColumns: 2 },
            dataBinding: { source: 'products', limit: 6, sortBy: 'sales' }
          }
        ]
      },
      {
        id: 'sec-home-catalog',
        name: 'Trending Products Catalog',
        paddingY: 'md',
        components: [
          {
            id: 'c-grid-1',
            type: 'product_grid',
            name: 'Product Grid',
            category: 'commerce',
            props: {
              title: 'Recommended For You',
              subtitle: 'Handpicked genuine products backed by LUMO escrow',
              showPagination: true,
              itemsPerPage: 8
            },
            styles: { padding: 'md', columns: 4, mobileColumns: 2 },
            dataBinding: { source: 'products', limit: 8, sortBy: 'newest' }
          }
        ]
      }
    ]
  },
  {
    id: 'page-category-electronics',
    name: 'Electronics & Audio Department',
    slug: 'category-electronics',
    mode: 'CUSTOMER',
    route: '/category/electronics',
    icon: 'Tv',
    description: 'Dedicated electronics hub with sound systems, TVs, accessories',
    isPublished: true,
    sections: [
      {
        id: 'sec-elec-grid',
        name: 'Electronics Catalog',
        paddingY: 'md',
        components: [
          {
            id: 'c-elec-1',
            type: 'product_grid',
            name: 'Product Grid',
            category: 'commerce',
            props: {
              title: 'Audio Systems, TVs & Gadgets',
              subtitle: 'Authorized brand distributors with 1-year warranties'
            },
            styles: { padding: 'md', columns: 4, mobileColumns: 2 },
            dataBinding: { source: 'products', categoryFilter: 'Electronics', limit: 8, sortBy: 'newest' }
          }
        ]
      }
    ]
  },
  {
    id: 'page-cart-checkout',
    name: 'Escrow Cart & Checkout',
    slug: 'checkout',
    mode: 'CUSTOMER',
    route: '/checkout',
    icon: 'ShoppingCart',
    description: 'Buyer multi-option checkout supporting M-Pesa, Airtel & Bank',
    isPublished: true,
    sections: [
      {
        id: 'sec-chk-trust',
        name: 'Escrow Security Notice',
        paddingY: 'sm',
        components: [
          {
            id: 'c-chk-1',
            type: 'escrow_trust_badge',
            name: 'Escrow Guarantee Badge',
            category: 'commerce',
            props: {
              heading: '100% Protected by Bank of Tanzania Trustee Escrow',
              body: 'Funds are never released to the seller until you receive the package in person.'
            },
            styles: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0', padding: 'md', borderRadius: 'xl' }
          }
        ]
      }
    ]
  },
  {
    id: 'page-marketplace-all',
    name: 'All Marketplace Catalog',
    slug: 'marketplace-all',
    mode: 'CUSTOMER',
    route: '/marketplace',
    icon: 'Store',
    description: 'Comprehensive multi-vendor product catalog with full filter matrix',
    isPublished: true,
    sections: [
      {
        id: 'sec-mkt-grid',
        name: 'Marketplace Catalog',
        paddingY: 'md',
        components: [
          {
            id: 'c-mkt-1',
            type: 'product_grid',
            name: 'Marketplace Product Grid',
            category: 'commerce',
            props: {
              title: 'All Marketplace Products',
              subtitle: 'Browse thousands of verified products from Kariakoo and East Africa'
            },
            styles: { padding: 'md', columns: 4, mobileColumns: 2 }
          }
        ]
      }
    ]
  },

  // SELLER EXPERIENCE
  {
    id: 'page-seller-dashboard',
    name: 'Seller Center Overview',
    slug: 'seller-dashboard',
    mode: 'SELLER',
    route: '/seller',
    icon: 'Store',
    description: 'Merchant operations cockpit: orders, inventory, sales & payouts',
    isPublished: true,
    requireAuth: true,
    allowedRoles: ['SELLER', 'SUPER_ADMIN'],
    sections: [
      {
        id: 'sec-seller-kpis',
        name: 'Revenue & Orders Summary',
        paddingY: 'md',
        components: [
          {
            id: 'c-s-kpi1',
            type: 'kpi_stat_card',
            name: 'KPI Metric Stat Card',
            category: 'dashboard',
            props: {
              title: '30-Day Gross Revenue',
              value: '48,200,000 TZS',
              change: '+31.2%',
              isPositive: true,
              timeframe: 'vs last month'
            },
            styles: { backgroundColor: '#FFFFFF', padding: 'md', borderRadius: 'xl', shadow: 'sm' }
          }
        ]
      }
    ]
  },

  // RIDER EXPERIENCE
  {
    id: 'page-rider-portal',
    name: 'Lumo Move Rider Dashboard',
    slug: 'rider-dashboard',
    mode: 'RIDER',
    route: '/rider',
    icon: 'Truck',
    description: 'Courier dispatch view: delivery queue, live map & earnings',
    isPublished: true,
    requireAuth: true,
    allowedRoles: ['DELIVERY_AGENT', 'SUPER_ADMIN'],
    sections: [
      {
        id: 'sec-rider-tasks',
        name: 'Active Delivery Runs',
        paddingY: 'md',
        components: [
          {
            id: 'c-r-disp',
            type: 'dispatch_queue_monitor',
            name: 'Rider Dispatch Queue',
            category: 'operations',
            props: {
              title: 'Assigned Courier Delivery Run #RUN-8821',
              hubFilter: 'Dar es Salaam (Kinondoni & Ilala)'
            },
            styles: { padding: 'md' }
          }
        ]
      }
    ]
  },

  // WAREHOUSE EXPERIENCE
  {
    id: 'page-warehouse-manager',
    name: 'Warehouse Fulfill Portal',
    slug: 'warehouse-dashboard',
    mode: 'WAREHOUSE',
    route: '/warehouse',
    icon: 'Box',
    description: 'Inbound put-away, barcode audit, picking & dispatch manifests',
    isPublished: true,
    requireAuth: true,
    allowedRoles: ['WAREHOUSE_MANAGER', 'SUPER_ADMIN'],
    sections: [
      {
        id: 'sec-wh-inv',
        name: 'Inventory Bins',
        paddingY: 'md',
        components: [
          {
            id: 'c-wh-1',
            type: 'warehouse_bin_inventory',
            name: 'Warehouse Stock Shelf',
            category: 'operations',
            props: {
              title: 'Dar Central Distribution Hub (Kurasini)',
              warehouseId: 'wh-dar-01'
            },
            styles: { padding: 'md' }
          }
        ]
      }
    ]
  },

  // OPERATIONS & DISPATCH
  {
    id: 'page-operations-hub',
    name: 'Operations & Logistics Hub',
    slug: 'operations-hub',
    mode: 'OPERATIONS',
    route: '/operations',
    icon: 'Layers',
    description: 'Central dispatch operations, real-time tracking, courier allocations',
    isPublished: true,
    requireAuth: true,
    allowedRoles: ['OPERATIONS_MANAGER', 'SUPER_ADMIN'],
    sections: [
      {
        id: 'sec-ops-disp',
        name: 'Dispatch Queues',
        paddingY: 'md',
        components: [
          {
            id: 'c-ops-1',
            type: 'dispatch_queue_monitor',
            name: 'Fleet Dispatch Queue',
            category: 'operations',
            props: {
              title: 'Pan-Tanzania Active Dispatch Runs',
              hubFilter: 'All Regions'
            },
            styles: { padding: 'md' }
          }
        ]
      }
    ]
  },

  // PICKUP STATIONS
  {
    id: 'page-pickup-portal',
    name: 'Lumo Point Pickup Station',
    slug: 'pickup-portal',
    mode: 'PICKUP',
    route: '/pickup',
    icon: 'Box',
    description: 'Collection locker and station management with customer OTP check-in',
    isPublished: true,
    requireAuth: true,
    allowedRoles: ['PICKUP_STATION_AGENT', 'SUPER_ADMIN'],
    sections: [
      {
        id: 'sec-pick-bins',
        name: 'Station Lockers',
        paddingY: 'md',
        components: [
          {
            id: 'c-pick-1',
            type: 'warehouse_bin_inventory',
            name: 'Locker Shelf Inventory',
            category: 'operations',
            props: {
              title: 'Lumo Point Kariakoo Central Locker Bank'
            },
            styles: { padding: 'md' }
          }
        ]
      }
    ]
  },

  // FIELD SALES
  {
    id: 'page-sales-portal',
    name: 'Field Sales & Merchant Growth',
    slug: 'sales-portal',
    mode: 'SALESPERSON',
    route: '/sales',
    icon: 'TrendingUp',
    description: 'Vendor acquisition pipeline, merchant commissions, performance scorecard',
    isPublished: true,
    requireAuth: true,
    allowedRoles: ['SALESPERSON', 'SUPER_ADMIN'],
    sections: [
      {
        id: 'sec-sales-kpis',
        name: 'Sales Pipeline Summary',
        paddingY: 'md',
        components: [
          {
            id: 'c-sales-1',
            type: 'kpi_stat_card',
            name: 'Merchant Pipeline KPI',
            category: 'dashboard',
            props: {
              title: 'Active Onboarded Merchants',
              value: '138',
              change: '+24 this month',
              isPositive: true,
              timeframe: 'Wholesalers & Distributors'
            },
            styles: { backgroundColor: '#FFFFFF', padding: 'md', borderRadius: 'xl', shadow: 'sm' }
          }
        ]
      }
    ]
  },

  // CUSTOMER CARE & DISPUTES
  {
    id: 'page-support-desk',
    name: 'Lumo Care Support Desk',
    slug: 'support-desk',
    mode: 'SUPPORT',
    route: '/support',
    icon: 'Headphones',
    description: 'Escalations, buyer-seller disputes & escrow release claims',
    isPublished: true,
    requireAuth: true,
    allowedRoles: ['CUSTOMER_SUPPORT', 'SUPER_ADMIN'],
    sections: [
      {
        id: 'sec-care-form',
        name: 'Dispute Investigation',
        paddingY: 'md',
        components: [
          {
            id: 'c-care-1',
            type: 'contact_support_form',
            name: 'Dispute & Ticket Form',
            category: 'forms',
            props: {
              title: 'Dispute & Claim Management System',
              buttonText: 'Save Operational Resolution'
            },
            styles: { backgroundColor: '#FFFFFF', padding: 'lg', borderRadius: 'xl' }
          }
        ]
      }
    ]
  },

  // FINANCE & ACCOUNTING
  {
    id: 'page-finance-ledger',
    name: 'Lumo Finance & Escrow Vault',
    slug: 'finance-dashboard',
    mode: 'FINANCE',
    route: '/finance',
    icon: 'DollarSign',
    description: 'Settlement ledger, commission take-rates, payouts & reconciliation',
    isPublished: true,
    requireAuth: true,
    allowedRoles: ['FINANCE_ADMIN', 'SUPER_ADMIN'],
    sections: [
      {
        id: 'sec-fin-stats',
        name: 'Financial Ledger & Pool',
        paddingY: 'md',
        components: [
          {
            id: 'c-fin-kpi',
            type: 'kpi_stat_card',
            name: 'KPI Metric Stat Card',
            category: 'dashboard',
            props: {
              title: 'Active Escrow Trust Vault',
              value: '142,800,000 TZS',
              change: '+14.1%',
              isPositive: true,
              timeframe: 'Protected in Bank of Tanzania trustee account'
            },
            styles: { backgroundColor: '#FFFFFF', padding: 'md', borderRadius: 'xl', shadow: 'sm' }
          }
        ]
      }
    ]
  },

  // ADMIN CONTROL
  {
    id: 'page-admin-control',
    name: 'Platform Admin Center',
    slug: 'admin-dashboard',
    mode: 'ADMIN',
    route: '/admin',
    icon: 'Shield',
    description: 'System administration, user RBAC, audit logs & builder management',
    isPublished: true,
    requireAuth: true,
    allowedRoles: ['SUPER_ADMIN'],
    sections: [
      {
        id: 'sec-adm-feed',
        name: 'System Logs & Activities',
        paddingY: 'md',
        components: [
          {
            id: 'c-adm-feed',
            type: 'recent_activity_feed',
            name: 'Realtime Activity Feed',
            category: 'dashboard',
            props: {
              title: 'Live Ecosystem Audit Log',
              maxItems: 5
            },
            styles: { backgroundColor: '#FFFFFF', padding: 'md', borderRadius: 'xl' }
          }
        ]
      }
    ]
  }
];

export const DEFAULT_PLATFORM_MAP_NODES: PlatformMapNode[] = [
  {
    id: 'node-customer',
    title: 'Customer Experience',
    mode: 'CUSTOMER',
    category: 'Marketplace Front',
    description: 'Buyers discover items, add to cart, and initiate escrow payments.',
    apiEndpoint: '/api/products',
    status: 'active'
  },
  {
    id: 'node-escrow',
    title: 'Lumo SafePay Escrow',
    mode: 'FINANCE',
    category: 'Trust & Banking',
    description: 'Locks customer payment in BoT trustee account until confirmed delivery.',
    apiEndpoint: '/api/orders',
    status: 'synced'
  },
  {
    id: 'node-seller',
    title: 'Seller Hub (Vendor)',
    mode: 'SELLER',
    category: 'Merchant Operations',
    description: 'Receives order notification, prepares stock, packages for fulfillment.',
    apiEndpoint: '/api/sellers',
    status: 'active'
  },
  {
    id: 'node-warehouse',
    title: 'Warehouse Fulfill',
    mode: 'WAREHOUSE',
    category: 'Logistics Core',
    description: 'Performs inbound scan, bin stocking, picking, and dispatch manifest.',
    apiEndpoint: '/api/warehouses',
    status: 'active'
  },
  {
    id: 'node-rider',
    title: 'Lumo Move (Riders)',
    mode: 'RIDER',
    category: 'Last-Mile Delivery',
    description: 'Takes parcel from hub/vendor and delivers directly with OTP handshake.',
    apiEndpoint: '/api/delivery/runs',
    status: 'active'
  },
  {
    id: 'node-pickup',
    title: 'Lumo Point (Pickup)',
    mode: 'PICKUP',
    category: 'Collection Stations',
    description: 'Secure self-collection stations across Dar es Salaam & Arusha.',
    apiEndpoint: '/api/pickup-stations',
    status: 'active'
  },
  {
    id: 'node-finance',
    title: 'Finance & Payouts',
    mode: 'FINANCE',
    category: 'Settlement Engine',
    description: 'Releases funds to merchant M-Pesa / Bank after OTP delivery acceptance.',
    apiEndpoint: '/api/admin/payouts',
    status: 'synced'
  },
  {
    id: 'node-support',
    title: 'Lumo Care & Disputes',
    mode: 'SUPPORT',
    category: 'Resolution Desk',
    description: 'Arbitrates returns, damaged items, and auto-refund workflows.',
    apiEndpoint: '/api/support/tickets',
    status: 'active'
  }
];

export const DEFAULT_PLATFORM_MAP_LINKS: PlatformMapLink[] = [
  { source: 'node-customer', target: 'node-escrow', label: 'Places Order & Deposits TZS', type: 'payment' },
  { source: 'node-escrow', target: 'node-seller', label: 'Verifies Payment & Alerts Merchant', type: 'event' },
  { source: 'node-seller', target: 'node-warehouse', label: 'Drop-off / Warehouse Inventory', type: 'logistics' },
  { source: 'node-warehouse', target: 'node-rider', label: 'Assigns Express Route', type: 'logistics' },
  { source: 'node-rider', target: 'node-customer', label: 'OTP Doorstep Handover', type: 'logistics' },
  { source: 'node-rider', target: 'node-pickup', label: 'Stashes at Collection Point', type: 'logistics' },
  { source: 'node-customer', target: 'node-finance', label: 'Buyer OTP Confirms Receipt', type: 'event' },
  { source: 'node-finance', target: 'node-seller', label: 'Releases Escrow Payout', type: 'payment' },
  { source: 'node-customer', target: 'node-support', label: 'Filing Dispute or Return', type: 'data' },
  { source: 'node-support', target: 'node-escrow', label: 'Authorizes Refund if Valid', type: 'event' }
];

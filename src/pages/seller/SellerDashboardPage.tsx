import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserAccountNavDropdown } from '../../components/common/UserAccountNavDropdown';
import { useAuth } from '../../context/AuthContext';
import { useOrder } from '../../context/OrderContext';
import { api } from '../../services/api';
import { formatTZS } from '../../utils/formatters';
import { LumoLoader } from '../../components/common/LumoLoader';
import { useCatalog } from '../../hooks/useCatalog';
import { 
  Store, 
  DollarSign, 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  AlertTriangle, 
  Plus, 
  ShieldCheck, 
  CreditCard, 
  ArrowUpRight, 
  FileText, 
  CheckCircle2, 
  Clock,
  Send,
  Layers,
  ChevronRight,
  Filter,
  Eye,
  Megaphone,
  Radio,
  Video,
  Users,
  Image as ImageIcon,
  Download,
  Upload,
  Sparkles,
  AlertOctagon,
  Percent,
  X,
  XCircle,
  Check,
  Tag,
  Camera,
  Play,
  Square,
  Settings,
  HelpCircle,
  Bell,
  Star,
  Truck,
  LogOut,
  Menu,
  BarChart3,
  Calendar,
  Search,
  SlidersHorizontal,
  ChevronDown,
  RefreshCw,
  Gift,
  Award,
  Printer,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Lock
} from 'lucide-react';
import { Product, Order, InventoryItem, SellerPayout, SellerKYC, ProductBadge, Promotion } from '../../types';
import { CreatePromotionModal } from '../../components/promotions/CreatePromotionModal';
import { PromotionAnalyticsModal } from '../../components/promotions/PromotionAnalyticsModal';
import { MobileWorkspaceSidebar } from '../../components/common/MobileWorkspaceSidebar';
import { GrowthEventsCarousel, EventCardItem } from '../../components/common/GrowthEventsCarousel';
import { UssdPaymentModal } from '../../components/common/UssdPaymentModal';
import { SellerLiveStudioModal } from '../../components/live/SellerLiveStudioModal';

export const SUBCATEGORY_BRANDS_MAP: Record<string, string[]> = {
  // Phones & Tablets
  'Smartphones': ['Samsung', 'Apple', 'Xiaomi', 'Tecno', 'Infinix', 'Oppo', 'Realme', 'Huawei', 'Google Pixel', 'Nokia', 'OnePlus'],
  'Tablets & iPads': ['Apple', 'Samsung', 'Lenovo', 'Xiaomi', 'Huawei', 'Amazon Fire'],
  'Feature Phones': ['Nokia', 'Tecno', 'Itel', 'Energizer'],
  'Accessories & Chargers': ['Oraimo', 'Anker', 'Baseus', 'Samsung', 'Apple', 'Ugreen'],
  'Smartwatches & Bands': ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Oraimo', 'Garmin'],
  
  // Electronics & Audio
  'Smart TVs & Soundbars': ['Samsung', 'Hisense', 'TCL', 'Sony', 'LG', 'Panasonic', 'Skyworth'],
  'Headphones & Earbuds': ['Sony', 'Apple', 'JBL', 'Oraimo', 'Anker', 'Bose', 'Beats'],
  'Home Theatres & Speakers': ['Sony', 'JBL', 'Harman Kardon', 'LG', 'Samsung', 'Hisense'],
  'Cameras & Drones': ['Canon', 'Nikon', 'Sony', 'DJI', 'GoPro', 'Fujifilm'],

  // Computers & Laptops
  'Laptops & MacBooks': ['Apple', 'HP', 'Dell', 'Lenovo', 'Asus', 'Acer', 'MSI'],
  'Desktop Computers': ['HP', 'Dell', 'Apple', 'Lenovo'],
  'Printers & Scanners': ['HP', 'Canon', 'Epson', 'Brother'],
  'External Drives & Flash': ['SanDisk', 'Seagate', 'Western Digital', 'Kingston', 'Transcend'],

  // Large & Small Appliances
  'Fridges & Freezers': ['Hisense', 'Samsung', 'LG', 'Beko', 'Midea', 'Haier', 'Whirlpool'],
  'Blenders & Juicers': ['Philips', 'MasterChef', 'Moulinex', 'Black & Decker', 'Kenwood', 'Bosch'],
  'Microwaves & Ovens': ['LG', 'Samsung', 'Hisense', 'Panasonic', 'Midea'],
  'Washing Machines': ['LG', 'Samsung', 'Hisense', 'Beko', 'Whirlpool'],

  // Fashion & Apparel
  "Men's Fashion & Wear": ['Nike', 'Adidas', 'Zara', 'Puma', 'Ralph Lauren', 'Tommy Hilfiger', 'H&M', 'Levi’s'],
  "Women's Fashion & Dresses": ['Zara', 'H&M', 'Shein', 'Mango', 'Nike', 'Adidas', 'Gucci', 'Forever 21'],
  'Sneakers & Footwear': ['Nike', 'Adidas', 'Puma', 'New Balance', 'Jordan', 'Converse', 'Vans', 'Timberland'],
  'Watches & Bags': ['Casio', 'Fossil', 'Michael Kors', 'Rolex', 'Seiko', 'Tommy Hilfiger'],

  // Babies & Kids
  'Diapers & Sensitive Wipes': ['Pampers', 'Huggies', 'Molfix', 'Softcare', 'Cussons Baby', 'Johnson’s Baby'],
  'Baby Feeding & Sterilizers': ['Chicco', 'Philips Avent', 'Tommee Tippee', 'Dr. Brown’s', 'Nuk', 'Cerelac'],
  'Learning Toys & Games': ['Lego', 'Fisher-Price', 'Hot Wheels', 'Hasbro', 'Barbie', 'Mattel'],
  'Strollers & Car Seats': ['Chicco', 'Graco', 'Joie', 'Baby Trend', 'Evenflo'],
  'Kids Clothing & Footwear': ['Carter’s', 'Mothercare', 'H&M Kids', 'Nike Kids', 'Adidas Kids'],

  // Automotive
  'Car Electronics & Dashcams': ['70mai', 'Garmin', 'Pioneer', 'Sony', 'Kenwood'],
  'Oils & Maintenance': ['Castrol', 'TotalEnergies', 'Shell Helix', 'Mobil 1', 'Bosch'],

  // Beauty & Health
  'Skincare & Moisturizers': ['Nivea', 'Garnier', 'CeraVe', 'La Roche-Posay', 'Neutrogena', 'The Ordinary'],
  'Perfumes & Colognes': ['Dior', 'Chanel', 'Tom Ford', 'Versace', 'Giorgio Armani', 'Hugo Boss', 'Paco Rabanne'],
  'Hair Care & Styling': ['L’Oréal', 'Shea Moisture', 'Tresemme', 'Cantu', 'Head & Shoulders'],

  // Supermarket & Groceries
  'Food Cupboard & Grains': ['Kilombero Valley', 'Azam', 'Bakhresa', 'Nestlé', 'Knorr', 'Mo Extra'],
  'Coffee, Tea & Juices': ['Africafe', 'Kilimanjaro Tea', 'Nescafe', 'Ceres', 'Coca-Cola', 'Pepsi'],
  'Household Cleaners': ['Omo', 'Sunlight', 'Dettol', 'Harpic', 'Ariel', 'Colgate'],

  // Wine & Spirits
  'Whiskey & Bourbon': ['Johnnie Walker', 'Jack Daniel’s', 'Jameson', 'Glenfiddich', 'Chivas Regal', 'Macallan'],
  'Vodka, Gin & Tequila': ['Smirnoff', 'Absolut', 'Tanqueray', 'Bombay Sapphire', 'Don Julio', 'Patrón'],
  'Red & White Wines': ['Nederburg', 'Casillero del Diablo', 'Four Cousins', 'Robertson Winery', 'Frontera'],
  'Champagne & Liqueurs': ['Moët & Chandon', 'Veuve Clicquot', 'Baileys', 'Jagermeister', 'Hennessy'],
};

export const getBrandsForSubcategory = (category: string, subcategory: string): string[] => {
  if (SUBCATEGORY_BRANDS_MAP[subcategory]) {
    return SUBCATEGORY_BRANDS_MAP[subcategory];
  }
  const matched = Object.entries(SUBCATEGORY_BRANDS_MAP).find(([subKey]) => 
    subKey.toLowerCase().includes((subcategory || '').toLowerCase()) ||
    (subcategory || '').toLowerCase().includes(subKey.toLowerCase())
  );
  if (matched) return matched[1];
  return ['Samsung', 'Apple', 'Hisense', 'Nike', 'Philips', 'Azam', 'Generic Official'];
};

export const MASTER_CATEGORY_SUBCATEGORIES = [
  {
    name: 'Electronics & Audio',
    subcategories: ['Smart TVs & Android TVs', 'Soundbars & Home Theatres', 'Bluetooth Speakers', 'Headphones & Earbuds', 'Projectors', 'Hi-Fi Audio Systems', 'Cables & Adapters']
  },
  {
    name: 'Phones & Tablets',
    subcategories: ['Smartphones (Android)', 'iPhones & Apple', 'Tablets & iPads', 'Smartwatches & Fit Bands', 'Power Banks & Chargers', 'Phone Cases & Screen Protectors', 'Feature Phones']
  },
  {
    name: 'Computing & Laptops',
    subcategories: ['Laptops & MacBooks', 'Desktop Computers', 'Gaming PCs & Monitors', 'Printers & Scanners', 'External Hard Drives & SSDs', 'USB Drives & Flash Memory', 'Keyboards & Mice', 'Networking & Wi-Fi Routers']
  },
  {
    name: 'Appliances',
    subcategories: ['Fridges & Freezers', 'Blenders & Juicers', 'Microwaves & Ovens', 'Washing Machines', 'Air Conditioners & Fans', 'Cookers & Gas Stoves', 'Electric Kettles & Coffee Makers']
  },
  {
    name: 'Fashion & Apparel',
    subcategories: ["Men's Fashion & Suits", "Women's Fashion & Dresses", 'Sneakers & Casual Shoes', 'Formal Shoes & Loafers', 'Watches & Jewelry', 'Handbags & Backpacks', 'Traditional & Kitenge Wear', 'Underwear & Loungewear']
  },
  {
    name: 'Beauty & Health',
    subcategories: ['Skincare & Moisturizers', 'Perfumes & Colognes', 'Hair Care & Braids', 'Makeup & Cosmetics', 'Personal Hygiene & Soaps', 'Oral Care & Whitening', 'Grooming & Shaving Kits']
  },
  {
    name: 'Home & Office',
    subcategories: ['Living Room Sofas & Tables', 'Bedding, Sheets & Pillows', 'Office Chairs & Desks', 'Kitchen Cookware & Cutlery', 'Lighting & Lamps', 'Curtains & Carpets', 'Storage & Organization']
  },
  {
    name: 'Supermarket & Groceries',
    subcategories: ['Food Cupboard & Grains', 'Kilombero Rice & Flour', 'Cooking Oils & Ghee', 'Coffee, Tea & Cocoa', 'Juices & Soft Drinks', 'Snacks, Biscuits & Sweets', 'Household Cleaners & Detergents']
  },
  {
    name: 'Wine & Spirits',
    subcategories: ['Whiskey & Bourbon', 'Vodka, Gin & Tequila', 'Red & White Wines', 'Champagne & Sparkling', 'Brandy & Cognac', 'Beers & Ciders', 'Liqueurs & Aperitifs']
  },
  {
    name: 'Babies & Kids',
    subcategories: ['Diapers & Sensitive Wipes', 'Baby Feeding & Bottles', 'Learning Toys & STEM', 'Strollers & Car Seats', 'Baby Care & Skincare', 'Kids Clothing & Footwear']
  },
  {
    name: 'Sporting Goods & Fitness',
    subcategories: ['Gym Equipment & Dumbbells', 'Yoga Mats & Resistance Bands', 'Sports Shoes & Running Gear', 'Football, Basketball & Balls', 'Cycling & Bicycles', 'Sports Nutrition & Protein']
  },
  {
    name: 'Automotive & Spares',
    subcategories: ['Car Electronics & Dashcams', 'Engine Oils & Lubricants', 'Tyres & Rims', 'Car Care & Cleaning', 'Batteries & Alternators', 'Motorcycle Accessories & Helmets', 'Spare Parts & Brake Pads']
  },
  {
    name: 'Agriculture & Farm Supplies',
    subcategories: ['Seeds & High-Yield Seedlings', 'Organic & NPK Fertilizers', 'Farm Tools & Sprayers', 'Irrigation Pipes & Pumps', 'Livestock Feed & Vaccines', 'Greenhouse & Netting', 'Solar Water Pumps']
  },
  {
    name: 'Health & Medical Equipment',
    subcategories: ['Blood Pressure Monitors', 'Glucometers & Test Strips', 'Wheelchairs & Walking Aids', 'First Aid Kits & Bandages', 'Pulse Oximeters & Thermometers', 'Dental Care & Orthopedics']
  }
];

export const SellerDashboardPage: React.FC = () => {
  const { catalogProducts, catalogCategories, catalogBrands } = useCatalog();

  const { user } = useAuth();
  const { orders: contextOrders, updateOrderStatus: updateOrderStatusContext, refreshOrders } = useOrder();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [payoutsList, setPayoutsList] = useState<SellerPayout[]>([]);
  const [kycData, setKycData] = useState<SellerKYC | null>(null);

  // Combine context orders (placed live in session) with API orders
  const allOrders = useMemo(() => {
    const map = new Map<string, Order>();
    (contextOrders || []).forEach(o => map.set(o.id, o));
    (ordersList || []).forEach(o => map.set(o.id, o));
    return Array.from(map.values()).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [contextOrders, ordersList]);

  // Followers & Live state
  const [followersCount, setFollowersCount] = useState<number>(3420);
  const [isLiveActive, setIsLiveActive] = useState<boolean>(false);
  const [showLiveModal, setShowLiveModal] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedSeconds, setRecordedSeconds] = useState<number>(0);

  // Store Icon / Logo State
  const [storeLogoUrl, setStoreLogoUrl] = useState<string>('https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=300');
  const [storeBannerUrl, setStoreBannerUrl] = useState<string>('https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200');
  const [storeName, setStoreName] = useState<string>('Swahili Tech Hub');
  const [storeDescription, setStoreDescription] = useState<string>('Leading electronics and mobile distributor in Kariakoo Commercial Hub, Dar es Salaam.');
  const [storePhone, setStorePhone] = useState<string>('+255 754 112 233');
  const [storeEmail, setStoreEmail] = useState<string>('support@swahilitech.co.tz');
  const [storeAddress, setStoreAddress] = useState<string>('Kariakoo Market St, Plot 42, Dar es Salaam');
  const [joinedAdWaitlist, setJoinedAdWaitlist] = useState<boolean>(false);

  // Media & Stock Catalog State
  const [showStockModal, setShowStockModal] = useState<boolean>(false);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string>('');

  const [uploadedGalleryMedia, setUploadedGalleryMedia] = useState<string[]>([
    'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'
  ]);

  // New Product Modal State
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Phones & Tablets');
  const [newProdSubcategory, setNewProdSubcategory] = useState('Smartphones');
  const [newProdStock, setNewProdStock] = useState('20');
  const [newProdBrand, setNewProdBrand] = useState('');
  const [newProdCondition, setNewProdCondition] = useState('New');
  const [newProdDescription, setNewProdDescription] = useState('');
  const [newProdHasWarranty, setNewProdHasWarranty] = useState<string>(''); // mandatory 'yes' or 'no'
  const [newProdWarrantyDuration, setNewProdWarrantyDuration] = useState<string>('12 Months (1 Year)');
  const [newProdIsPromo, setNewProdIsPromo] = useState(false);
  const [newProdOriginalPrice, setNewProdOriginalPrice] = useState('');
  const [selectedProductImage, setSelectedProductImage] = useState<string>('https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800');
  const [imageSelectMode, setImageSelectMode] = useState<'upload' | 'gallery'>('gallery');
  const [isVerifyingBrand, setIsVerifyingBrand] = useState(false);

  // Quick Stock Adjustment Modal State
  const [showStockAdjustModal, setShowStockAdjustModal] = useState(false);
  const [stockModalProduct, setStockModalProduct] = useState<any | null>(null);
  const [stockAdjustQty, setStockAdjustQty] = useState<string>('10');
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);

  // Ads & Sponsored Boost State
  const [adSelectedProductId, setAdSelectedProductId] = useState<string>('');
  const [adSelectedPlan, setAdSelectedPlan] = useState<'7days' | '14days' | '30days'>('7days');
  const [isBoostingAd, setIsBoostingAd] = useState(false);
  const [adSuccessMsg, setAdSuccessMsg] = useState('');
  const [showUssdBoostModal, setShowUssdBoostModal] = useState(false);

  // Selected Order for Details Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Payout Request Modal
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('1500000');
  const [payoutMethod, setPayoutMethod] = useState('MOBILE_MONEY');
  const [payoutRecipient, setPayoutRecipient] = useState('+255 754 112 233 (M-Pesa - Amina Selemani)');
  const [payoutSuccessMsg, setPayoutSuccessMsg] = useState('');

  // Payment Methods Management State
  const [paymentMethodsList, setPaymentMethodsList] = useState([
    { id: 'pm-1', type: 'MOBILE_MONEY', provider: 'M-Pesa (Vodacom)', details: '+255 754 *** 233', isDefault: true, verified: true },
    { id: 'pm-2', type: 'BANK_TRANSFER', provider: 'CRDB Bank Business', details: 'CRDB-01502948100', isDefault: false, verified: true }
  ]);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [newPaymentType, setNewPaymentType] = useState('MOBILE_MONEY');
  const [newPaymentProvider, setNewPaymentProvider] = useState('Tigo Pesa');
  const [newPaymentDetails, setNewPaymentDetails] = useState('');

  // Analytics timeframe & Order status tab
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<'today' | '7days' | '30days' | '3months'>('7days');
  const [hoveredChartIndex, setHoveredChartIndex] = useState<number | null>(4);
  const [storePerfTimeframe, setStorePerfTimeframe] = useState<'7days' | '30days'>('7days');
  const [orderStatusTab, setOrderStatusTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dynamic Sales Overview Chart dataset based on selected date timeframe
  const salesChartDataByTimeframe = useMemo(() => {
    return {
      '7days': {
        title: 'Last 7 Days',
        totalSales: 16890000,
        yLabels: ['TZS 3.5M', 'TZS 2.5M', 'TZS 1.5M', 'TZS 0'],
        points: [
          { label: 'May 11', value: 1650000, orders: 12, cx: 25, cy: 95 },
          { label: 'May 12', value: 2100000, orders: 16, cx: 65, cy: 78 },
          { label: 'May 13', value: 1950000, orders: 14, cx: 105, cy: 84 },
          { label: 'May 14', value: 2400000, orders: 19, cx: 145, cy: 68 },
          { label: 'May 15', value: 3120000, orders: 28, cx: 185, cy: 40 },
          { label: 'May 16', value: 3450000, orders: 31, cx: 245, cy: 28 },
          { label: 'May 17', value: 2220000, orders: 18, cx: 305, cy: 75 },
        ],
        pathD: "M 25,95 Q 65,78 105,84 T 185,40 T 245,28 T 305,75",
        areaD: "M 25,95 Q 65,78 105,84 T 185,40 T 245,28 T 305,75 L 305,125 L 25,125 Z",
      },
      '30days': {
        title: 'Last 30 Days',
        totalSales: 48900000,
        yLabels: ['TZS 10M', 'TZS 7.5M', 'TZS 5M', 'TZS 0'],
        points: [
          { label: 'Aug 05', value: 5400000, orders: 42, cx: 25, cy: 82 },
          { label: 'Aug 10', value: 6800000, orders: 54, cx: 65, cy: 65 },
          { label: 'Aug 15', value: 6100000, orders: 48, cx: 105, cy: 72 },
          { label: 'Aug 20', value: 7900000, orders: 62, cx: 145, cy: 52 },
          { label: 'Aug 25', value: 9200000, orders: 74, cx: 185, cy: 38 },
          { label: 'Aug 30', value: 8100000, orders: 68, cx: 245, cy: 50 },
          { label: 'Sep 03', value: 5400000, orders: 45, cx: 305, cy: 82 },
        ],
        pathD: "M 25,82 Q 65,65 105,72 T 185,38 T 245,50 T 305,82",
        areaD: "M 25,82 Q 65,65 105,72 T 185,38 T 245,50 T 305,82 L 305,125 L 25,125 Z",
      },
      'today': {
        title: 'Today',
        totalSales: 3850000,
        yLabels: ['TZS 1M', 'TZS 750K', 'TZS 500K', 'TZS 0'],
        points: [
          { label: '08:00', value: 350000, orders: 3, cx: 25, cy: 105 },
          { label: '10:00', value: 620000, orders: 5, cx: 65, cy: 80 },
          { label: '12:00', value: 890000, orders: 8, cx: 105, cy: 55 },
          { label: '14:00', value: 740000, orders: 7, cx: 145, cy: 68 },
          { label: '16:00', value: 980000, orders: 9, cx: 185, cy: 48 },
          { label: '18:00', value: 270000, orders: 2, cx: 245, cy: 112 },
          { label: 'Now', value: 0, orders: 0, cx: 305, cy: 125 },
        ],
        pathD: "M 25,105 Q 65,80 105,55 T 185,48 T 245,112 T 305,125",
        areaD: "M 25,105 Q 65,80 105,55 T 185,48 T 245,112 T 305,125 L 305,125 L 25,125 Z",
      },
      '3months': {
        title: 'Last 3 Months',
        totalSales: 132600000,
        yLabels: ['TZS 25M', 'TZS 18M', 'TZS 10M', 'TZS 0'],
        points: [
          { label: 'Jun Wk 1', value: 14200000, orders: 112, cx: 25, cy: 88 },
          { label: 'Jun Wk 3', value: 18500000, orders: 146, cx: 65, cy: 68 },
          { label: 'Jul Wk 1', value: 21000000, orders: 168, cx: 105, cy: 56 },
          { label: 'Jul Wk 3', value: 24800000, orders: 195, cx: 145, cy: 38 },
          { label: 'Aug Wk 1', value: 22400000, orders: 178, cx: 185, cy: 48 },
          { label: 'Aug Wk 3', value: 26100000, orders: 204, cx: 245, cy: 32 },
          { label: 'Sep Wk 1', value: 25600000, orders: 198, cx: 305, cy: 35 },
        ],
        pathD: "M 25,88 Q 65,68 105,56 T 185,48 T 245,32 T 305,35",
        areaD: "M 25,88 Q 65,68 105,56 T 185,48 T 245,32 T 305,35 L 305,125 L 25,125 Z",
      }
    };
  }, []);

  const currentChartData = salesChartDataByTimeframe[analyticsTimeframe] || salesChartDataByTimeframe['7days'];
  const activeChartPointIndex = hoveredChartIndex !== null && hoveredChartIndex < currentChartData.points.length ? hoveredChartIndex : 4;
  const activeChartPoint = currentChartData.points[activeChartPointIndex] || currentChartData.points[0];

  const storePerformanceMetrics = useMemo(() => {
    if (storePerfTimeframe === '7days') {
      return {
        conversionRate: '2.6%',
        conversionTrend: '8.4%',
        avgOrderValue: formatTZS(275000),
        aovTrend: '12.7%',
        returnRate: '1.3%',
        returnTrend: '-3.4%',
        satisfaction: '96%',
        satTrend: '4.2%'
      };
    } else {
      return {
        conversionRate: '3.1%',
        conversionTrend: '14.2%',
        avgOrderValue: formatTZS(312000),
        aovTrend: '18.5%',
        returnRate: '1.1%',
        returnTrend: '-5.1%',
        satisfaction: '98%',
        satTrend: '6.8%'
      };
    }
  }, [storePerfTimeframe]);

  // Promotions State
  const [promotionsList, setPromotionsList] = useState<Promotion[]>([]);
  const [showPromoModal, setShowPromoModal] = useState<boolean>(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState<boolean>(false);
  const [selectedPromoForAnalytics, setSelectedPromoForAnalytics] = useState<Promotion | null>(null);
  const [promoSearchQuery, setPromoSearchQuery] = useState<string>('');
  const [promoStatusFilter, setPromoStatusFilter] = useState<string>('All');

  // Product Analytics Modal State
  const [selectedProductForAnalytics, setSelectedProductForAnalytics] = useState<any | null>(null);
  const [showProductAnalyticsModal, setShowProductAnalyticsModal] = useState<boolean>(false);

  // Customer Reviews & Reply State
  const [reviewsList, setReviewsList] = useState([
    { id: 'rev-1', customer: 'Baraka Juma', rating: 5, date: '2 days ago', comment: 'Authentic product, fast delivery in Kariakoo. Highly recommended!', product: 'Samsung Galaxy S24 Ultra', reply: 'Thank you Baraka! Karibu tena kwenye duka letu.' },
    { id: 'rev-2', customer: 'Neema Mwakyusa', rating: 5, date: '5 days ago', comment: 'Original warranty card included. Great vendor service.', product: 'Anker PowerCore 24,000mAh', reply: '' },
    { id: 'rev-3', customer: 'Aisha Mwinyi', rating: 4, date: '1 week ago', comment: 'Good quality power bank, delivered right on time.', product: 'JBL Flip 6 Waterproof Speaker', reply: '' }
  ]);
  const [reviewFilter, setReviewFilter] = useState<string>('All');
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [reviewReplyText, setReviewReplyText] = useState<string>('');

  // Support Tickets State
  const [supportTicketsList, setSupportTicketsList] = useState([
    { id: 'tkt-101', category: 'Payments', subject: 'Escrow release verification inquiry', status: 'In Progress', date: '2026-08-24', lastMessage: 'Our finance team is verifying your delivery OTP confirmation.' },
    { id: 'tkt-102', category: 'Logistics', subject: 'Express rider pickup scheduling', status: 'Resolved', date: '2026-08-20', lastMessage: 'Rider assigned and package successfully handed over.' }
  ]);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [newTicketCat, setNewTicketCat] = useState('Escrow & Payouts');
  const [newTicketSub, setNewTicketSub] = useState('');
  const [newTicketDesc, setNewTicketDesc] = useState('');

  // Notifications State
  const [selectedNotification, setSelectedNotification] = useState<any | null>(null);
  const [notificationCategoryFilter, setNotificationCategoryFilter] = useState<'ALL' | 'order' | 'finance' | 'inventory' | 'review' | 'policy'>('ALL');
  const [notificationsList, setNotificationsList] = useState<any[]>([
    { 
      id: 'notif-1', 
      title: 'New Order Received (#LM-9821)', 
      time: '10 mins ago', 
      type: 'order', 
      read: false,
      priority: 'high',
      summary: 'Customer Juma Bakari purchased 1x Samsung Galaxy S24 Ultra (512GB). Escrow secured.',
      orderData: {
        orderNumber: 'LM-9821',
        customerName: 'Juma Bakari',
        customerPhone: '+255 754 883 992',
        deliveryAddress: 'Plot 42, Samora Avenue, CBD, Dar es Salaam',
        deliveryType: 'Express Door Delivery',
        items: [
          {
            title: 'Samsung Galaxy S24 Ultra (512GB, Titanium Gray)',
            quantity: 1,
            price: 2650000,
            image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400'
          }
        ],
        subtotal: 2650000,
        shippingFee: 0,
        total: 2650000,
        paymentStatus: 'PAID_ESCROW',
        escrowStatus: 'Payment Secured in LUMO Escrow - Disbursed on Customer Handover OTP',
        actionRequired: 'Package the phone with original warranty card and mark Ready for Pickup within 2 hours.'
      }
    },
    { 
      id: 'notif-2', 
      title: 'Payout of TZS 4,365,000 Processed Successfully', 
      time: 'Yesterday at 16:42', 
      type: 'finance', 
      read: true,
      priority: 'medium',
      summary: 'Automated weekly vendor settlement disbursed to your Vodacom M-Pesa business account.',
      financeData: {
        reference: 'LUM-PAY-2026-99410',
        amount: 4365000,
        channel: 'Vodacom M-Pesa Corporate Disburse',
        recipient: '+255 754 112 233 (Amina Selemani - Swahili Tech Hub)',
        status: 'Completed & Reconciled',
        dateProcessed: 'Yesterday at 16:42 EAT',
        taxDeducted: 0,
        netReceived: 4365000
      }
    },
    { 
      id: 'notif-3', 
      title: 'Low Stock Alert: Anker PowerCore 24,000mAh', 
      time: '2 days ago', 
      type: 'inventory', 
      read: false,
      priority: 'high',
      summary: 'Only 3 units remaining in your store inventory. Restock now to prevent automatic unlisting.',
      inventoryData: {
        productName: 'Anker PowerCore 24,000mAh 65W Fast Charger',
        sku: 'ANK-PWR-24K-BLK',
        unitsLeft: 3,
        reorderLevel: 5,
        recommendedRestock: 25,
        image: 'https://images.unsplash.com/photo-1609592424300-349098711477?w=400'
      }
    },
    { 
      id: 'notif-4', 
      title: 'New 5-Star Customer Review from Baraka Juma', 
      time: '3 days ago', 
      type: 'review', 
      read: true,
      priority: 'normal',
      summary: 'Baraka rated your Samsung Galaxy S24 Ultra 5/5 stars with positive delivery feedback.',
      reviewData: {
        customerName: 'Baraka Juma',
        rating: 5,
        productName: 'Samsung Galaxy S24 Ultra',
        comment: 'Authentic product, sealed in original box with warranty. Fast delivery in Kariakoo. Highly recommended vendor!',
        date: '3 days ago',
        sentiment: 'Exceptional (5/5)'
      }
    },
    { 
      id: 'notif-5', 
      title: 'Official Notice: Weekend Mega Deals & Campaign Spotlight', 
      time: '4 days ago', 
      type: 'policy', 
      read: false,
      priority: 'normal',
      summary: 'Vendor guidelines and nomination portal for the upcoming Mega Flash Sale promotion.',
      policyData: {
        noticeType: 'Promotional Campaign Enrollment',
        effectiveDate: 'Active this weekend (Friday 18:00 - Sunday 23:59)',
        details: 'Vendors offering a minimum 10% discount receive top-tier spotlight placement on the LUMO homepage, subsidized shipping for buyers, and featured push notifications.',
        actionRequired: 'Nominate eligible products in the Promotions tab before Thursday 23:59.'
      }
    }
  ]);

  // KYC Form State
  const [kycFeedbackMsg, setKycFeedbackMsg] = useState<string>('');
  const [kycForm, setKycForm] = useState({
    legalName: 'Swahili Tech Hub Limited',
    tradingName: 'Swahili Tech Hub',
    businessType: 'REGISTERED_BUSINESS',
    registrationNumber: 'TZ-BRELA-2021-99841',
    tinNumber: '142-889-102',
    idNumber: 'NIDA-19882910-0012',
    documentUploaded: true
  });

  // Deny Order Modal State
  const [showDenyModal, setShowDenyModal] = useState(false);
  const [denyTargetOrder, setDenyTargetOrder] = useState<Order | null>(null);
  const [denyReasonOption, setDenyReasonOption] = useState('Out of Stock / Inventory Shortage');
  const [denyCustomNote, setDenyCustomNote] = useState('');

  const sellerId = user?.sellerId;

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashRes, invRes, ordRes, prodRes, payRes, kycRes, liveRes, promoRes] = await Promise.all([
        api.getSellerDashboard(sellerId),
        api.getSellerInventory(sellerId),
        api.getOrders(),
        api.getProducts({ sellerId }),
        api.getSellerPayouts(sellerId),
        api.getSellerKYC(sellerId),
        api.getSellerLiveSessionHistory(sellerId),
        fetch(`/api/promotions?sellerId=${sellerId}`).then(r => r.json()).catch(() => ({ promotions: [] }))
      ]);

      setDashboardData(dashRes);
      setInventoryList(invRes.inventory || []);
      setOrdersList(ordRes.orders || []);
      setProductsList(prodRes.products || []);
      setPayoutsList(payRes.payouts || []);
      setKycData(kycRes.kyc || null);
      setPromotionsList(promoRes.promotions || []);
      if (liveRes.activeSession) {
        setIsLiveActive(liveRes.activeSession.isLive);
        setFollowersCount(liveRes.activeSession.followersCount || 3420);
      }
    } catch (err) {
      console.error('Failed to load seller dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [sellerId]);

  // Recording Timer for Live Studio
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setRecordedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice || !newProdBrand || !newProdCondition) {
      alert("Please fill all required fields including Brand and Condition.");
      return;
    }
    if (!newProdHasWarranty) {
      alert("Please select whether the product has a warranty period or not.");
      return;
    }
    try {
      setIsVerifyingBrand(true);
      
      const badges: ProductBadge[] = ['NEW ARRIVAL'];
      if (newProdIsPromo) {
        badges.push('PROMOTION');
      }

      const calculatedWarranty = newProdHasWarranty === 'yes' 
        ? `${newProdWarrantyDuration} Official Brand Warranty` 
        : 'No Warranty';

      if (editingProductId) {
        await api.updateProduct(editingProductId, {
          name: newProdName,
          price: Number(newProdPrice),
          oldPrice: newProdIsPromo && newProdOriginalPrice ? Number(newProdOriginalPrice) : undefined,
          category: newProdCategory,
          subcategory: newProdSubcategory,
          stock: Number(newProdStock),
          brand: newProdBrand,
          condition: newProdCondition,
          description: newProdDescription || `${newProdName} with authentic ${newProdBrand} build, authorized warranty, and fast East African dispatch.`,
          warranty: calculatedWarranty,
          thumbnail: selectedProductImage,
          images: [selectedProductImage]
        });
        setEditingProductId(null);
      } else {
        await api.createProduct({
          name: newProdName,
          price: Number(newProdPrice),
          oldPrice: newProdIsPromo && newProdOriginalPrice ? Number(newProdOriginalPrice) : undefined,
          category: newProdCategory,
          subcategory: newProdSubcategory,
          stock: Number(newProdStock),
          brand: newProdBrand,
          condition: newProdCondition,
          description: newProdDescription || `${newProdName} with authentic ${newProdBrand} build, authorized warranty, and fast East African dispatch.`,
          warranty: calculatedWarranty,
          sellerId,
          sellerName: storeName,
          badges,
          thumbnail: selectedProductImage,
          images: [selectedProductImage],
          status: 'Pending Verification'
        });
      }

      if (!uploadedGalleryMedia.includes(selectedProductImage)) {
        setUploadedGalleryMedia([selectedProductImage, ...uploadedGalleryMedia]);
      }

      setIsVerifyingBrand(false);
      setShowAddProduct(false);
      setEditingProductId(null);
      setNewProdName('');
      setNewProdPrice('');
      setNewProdOriginalPrice('');
      setNewProdBrand('');
      setNewProdCondition('New');
      setNewProdDescription('');
      setNewProdHasWarranty('');
      setNewProdIsPromo(false);
      await loadData();
    } catch (err) {
      setIsVerifyingBrand(false);
      console.error('Error saving product:', err);
      alert('Failed to save product');
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockModalProduct || !stockAdjustQty) return;
    try {
      setIsUpdatingStock(true);
      const newStock = Math.max(0, Number(stockModalProduct.stock || 0) + Number(stockAdjustQty));
      await api.adjustProductStock(stockModalProduct.id, newStock);
      setShowStockAdjustModal(false);
      setStockModalProduct(null);
      await loadData();
      alert(`Stock successfully updated to ${newStock} units.`);
    } catch (err) {
      console.error('Adjust stock error:', err);
      alert('Failed to adjust stock');
    } finally {
      setIsUpdatingStock(false);
    }
  };

  const handleBoostProductAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adSelectedProductId) {
      alert('Please select a product to boost with sponsored ads.');
      return;
    }
    try {
      setIsBoostingAd(true);
      const durationDays = adSelectedPlan === '7days' ? 7 : adSelectedPlan === '14days' ? 14 : 30;
      const budget = adSelectedPlan === '7days' ? 25000 : adSelectedPlan === '14days' ? 45000 : 85000;

      await api.boostProduct({
        productId: adSelectedProductId,
        sellerId,
        durationDays,
        budget
      });

      setAdSuccessMsg(`Product boosted successfully! It will appear on the customer homepage under Sponsored Products with high-visibility placement for ${durationDays} days.`);
      await loadData();
      setTimeout(() => {
        setAdSuccessMsg('');
      }, 4000);
    } catch (err) {
      console.error('Boost product error:', err);
      alert('Failed to boost product with ad campaign');
    } finally {
      setIsBoostingAd(false);
    }
  };

  const handleStoreLogoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setStoreLogoUrl(base64);
        try {
          await api.updateStoreProfile({
            sellerId,
            storeName,
            storeDescription,
            storeLogo: base64,
            storePhone,
            storeEmail,
            storeAddress
          });
        } catch (err) {
          console.error('Store profile sync error:', err);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUploadImage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const demoUrl = uploadedImagePreview || 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800';
      await api.uploadSellerMedia({
        fileName: 'Official Store Gallery Item',
        fileType: 'image/jpeg',
        imageUrl: demoUrl
      });
      setUploadedGalleryMedia([demoUrl, ...uploadedGalleryMedia]);
      setUploadSuccessMsg('High-resolution media successfully synced to LUMO CDN & available in Add Product gallery.');
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadedImagePreview(null);
        setUploadSuccessMsg('');
      }, 2000);
    } catch (err) {
      console.error('Upload media error:', err);
    }
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.requestPayout(Number(payoutAmount), payoutMethod, payoutRecipient);
      setPayoutSuccessMsg('Payout request submitted for escrow clearance.');
      setTimeout(() => {
        setShowPayoutModal(false);
        setPayoutSuccessMsg('');
      }, 2000);
      await loadData();
    } catch (err) {
      console.error('Error requesting payout:', err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      updateOrderStatusContext(orderId, newStatus as any, `Vendor updated status to ${newStatus}`);
      await api.updateOrderStatus(orderId, newStatus, `Vendor updated status to ${newStatus}`);
      await loadData();
      await refreshOrders();
      if (selectedOrder && (selectedOrder.id === orderId || selectedOrder.orderNumber === orderId)) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus as any } : null);
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const handleDenyOrder = async (orderId: string, reason: string) => {
    try {
      const fullReason = `Order Denied by Merchant: ${reason}`;
      updateOrderStatusContext(orderId, 'Cancelled' as any, fullReason);
      await api.updateOrderStatus(orderId, 'Cancelled', fullReason);
      await loadData();
      await refreshOrders();
      if (selectedOrder && (selectedOrder.id === orderId || selectedOrder.orderNumber === orderId)) {
        setSelectedOrder(prev => prev ? { ...prev, status: 'Cancelled' as any } : null);
      }
      setShowDenyModal(false);
      setDenyTargetOrder(null);
      setKycFeedbackMsg(`Order #${orderId} has been denied and cancelled. Customer & Operations notified.`);
      setTimeout(() => setKycFeedbackMsg(''), 5000);
    } catch (err) {
      console.error('Error denying order:', err);
    }
  };

  const handleQuickAdjustStock = async (prod: Product, delta: number) => {
    try {
      const newStock = Math.max(0, (prod.stock || 0) + delta);
      await api.adjustProductStock(prod.id, newStock);
      await loadData();
      setKycFeedbackMsg(`Stock for "${prod.name}" updated to ${newStock} units.`);
      setTimeout(() => setKycFeedbackMsg(''), 3000);
    } catch (err) {
      console.error('Quick adjust error:', err);
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <LumoLoader size="large" text="Loading Lumo Seller Center..." />
      </div>
    );
  }

  const metrics = dashboardData?.metrics || {
    revenue: 4850000,
    totalOrders: 14,
    completedOrders: 11,
    pendingOrders: 3,
    availableBalance: 4365000,
    pendingBalance: 360000,
    rating: 4.9,
    productsCount: productsList.length || 18
  };

  const getBrandsForSubcategory = (cat: string, sub: string) => {
    const c = cat.toLowerCase();
    if (c.includes('phones') || c.includes('electronics') || c.includes('computers')) return ['Samsung', 'Apple', 'Tecno', 'Infinix', 'Oppo', 'Sony', 'LG', 'HP', 'Dell', 'Lenovo'];
    if (c.includes('fashion') || c.includes('sports')) return ['Nike', 'Adidas', 'Puma', 'Zara', 'Gucci', 'Under Armour', 'Local Brand'];
    if (c.includes('automotive')) return ['Toyota', 'Honda', 'Bosch', 'Michelin', 'Generic Auto'];
    if (c.includes('wine')) return ['Hennessy', 'Moet', 'Jack Daniels', 'Amarula', 'Dodoma Wine'];
    if (c.includes('babies') || c.includes('kids')) return ['Pampers', 'Molfix', 'Johnson', 'Huggies', 'Mothercare'];
    return ['Generic', 'Lumo Basics', 'Premium', 'Standard'];
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-[#0f172a] flex flex-col font-sans">
      {/* Immersive Dedicated Lumo Seller Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#38006b] flex items-center justify-center text-yellow-400 font-extrabold text-sm shrink-0 shadow-xs">
                {storeLogoUrl ? (
                  <img src={storeLogoUrl} alt={storeName} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  'LUMO'
                )}
              </div>
              <div className="hidden sm:block min-w-0">
                <p className="font-bold text-slate-900 text-sm truncate">{storeName}</p>
                <p className="text-[10px] text-slate-500 font-medium">Seller ID: LUMO-786543</p>
              </div>
            </div>
          </div>

          {/* Header Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md items-center relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search anything on LUMO..."
              className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notifications Dropdown Toggle */}
            <button
              onClick={() => setActiveTab('notifications')}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 relative cursor-pointer"
              title="View Vendor Notifications"
            >
              <Bell className="w-5 h-5" />
              {notificationsList.filter(n => !n.read).length > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 bg-[#ff6a00] text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow-xs">
                  {notificationsList.filter(n => !n.read).length}
                </span>
              )}
            </button>

            {/* Messages Toggle */}
            <button
              onClick={() => setActiveTab('support')}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 relative cursor-pointer"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                3
              </span>
            </button>

            {/* Seller Identity Avatar Dropdown */}
            <div className="pl-2 border-l border-slate-200">
              <UserAccountNavDropdown variant="light" customTitle={storeName} customSubtitle="Verified Seller" />
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE WORKSPACE SIDEBAR DRAWER */}
      <MobileWorkspaceSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        title={storeName}
        subtitle="Seller Workspace Center"
        userRoleLabel="VERIFIED SELLER"
        userName={user?.name || 'Amina Selemani'}
        userAvatar={storeLogoUrl}
        activeTab={activeTab}
        onSelectTab={(tabId) => {
          if (tabId === 'add_product') {
            setShowAddProduct(true);
          } else {
            setActiveTab(tabId);
          }
        }}
        items={[
          { id: 'overview', label: 'Dashboard', icon: TrendingUp },
          { id: 'products', label: 'Products', icon: Package },
          { id: 'inventory', label: 'Inventory', icon: Layers },
          { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: metrics?.pendingOrders || 3 },
          { id: 'fulfillment', label: 'Fulfillment', icon: Truck },
          { id: 'sales_revenue', label: 'Sales & Revenue', icon: DollarSign },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'promotions', label: 'Promotions', icon: Gift },
          { id: 'ads_boost', label: 'Advertising (Coming Soon)', icon: Sparkles, badge: 'LOCKED' },
          { id: 'live_commerce', label: 'Live Stream & Video', icon: Radio },
          { id: 'stock_catalog', label: 'Stock PDF Catalog', icon: FileText },
          { id: 'payments', label: 'Payments & Payouts', icon: CreditCard },
          { id: 'kyc', label: 'KYC & Compliance', icon: ShieldCheck },
          { id: 'settings', label: 'Store Settings', icon: Settings },
          { id: 'support', label: 'Help & Support', icon: HelpCircle }
        ]}
      />

      {/* Main Layout Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        
        {/* DESKTOP SIDEBAR NAVIGATION */}
        <aside className="hidden lg:block lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-6">
          <div className="px-2 pb-2 border-b border-slate-100 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#38006b] text-yellow-400 font-extrabold text-xs flex items-center justify-center">
              L
            </div>
            <div>
              <p className="text-xs font-black text-[#38006b] tracking-wider uppercase">LUMO</p>
              <p className="text-[9px] text-slate-400 leading-tight">Smart Commerce</p>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block">Store</span>
            {[
              { id: 'overview', label: 'Dashboard', icon: TrendingUp },
              { id: 'products', label: 'Products', icon: Package },
              { id: 'inventory', label: 'Inventory', icon: Layers }
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isActive ? 'bg-[#38006b] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-1 pt-3 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block">Sales</span>
            {[
              { id: 'orders', label: 'Orders', icon: ShoppingBag },
              { id: 'fulfillment', label: 'Fulfillment', icon: Truck },
              { id: 'sales_revenue', label: 'Sales & Revenue', icon: DollarSign },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isActive ? 'bg-[#38006b] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-1 pt-3 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block">Customer</span>
            {[
              { id: 'customers', label: 'Customers', icon: Users },
              { id: 'reviews', label: 'Reviews', icon: Star }
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isActive ? 'bg-[#38006b] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-1 pt-3 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block">Marketing</span>
            {[
              { id: 'promotions', label: 'Promotions', icon: Tag },
              { id: 'ads_boost', label: 'Advertising', icon: Sparkles, tag: 'Coming Soon' },
              { id: 'live_commerce', label: 'Live Stream', icon: Radio }
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isActive ? 'bg-[#38006b] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </div>
                  {item.tag && (
                    <span className="px-1.5 py-0.5 rounded bg-yellow-400 text-slate-950 text-[9px] font-black">
                      {item.tag}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="space-y-1 pt-3 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block">Finance & Account</span>
            {[
              { id: 'payments', label: 'Payments & Wallet', icon: CreditCard },
              { id: 'kyc', label: 'KYC & Verification', icon: ShieldCheck },
              { id: 'settings', label: 'Settings', icon: Settings },
              { id: 'support', label: 'Help & Support', icon: HelpCircle }
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isActive ? 'bg-[#38006b] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Sidebar Promo Box */}
          <div className="p-3.5 rounded-2xl bg-[#38006b] text-white space-y-2 text-center shadow-xs">
            <div className="flex items-center justify-center gap-1 text-[#FF6A00]">
              <Lock size={12} className="text-yellow-400" />
              <p className="text-xs font-bold leading-tight text-white">SPONSORED ADS</p>
            </div>
            <p className="text-[10px] text-purple-200">Sponsored advertising is coming soon.</p>
            <button
              onClick={() => setActiveTab('ads_boost')}
              className="w-full py-1.5 rounded-xl bg-purple-900/80 hover:bg-purple-900 text-yellow-300 border border-purple-700/50 text-xs font-bold cursor-pointer transition flex items-center justify-center gap-1.5"
            >
              <Sparkles size={12} />
              <span>Preview Sector (Locked)</span>
            </button>
          </div>

          {/* Sidebar Footer Help */}
          <div className="pt-2 text-center">
            <button
              onClick={() => setActiveTab('support')}
              className="text-[11px] font-bold text-slate-500 hover:text-[#38006b] flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-purple-600" /> Need Help? Seller Center
            </button>
          </div>
        </aside>

        {/* CONTENT AREA (4 COLUMNS) */}
        <main className="lg:col-span-4 space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in">
              {/* Store Verification Alert Banner */}
              <div className="bg-amber-50/90 border border-amber-200/80 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 font-bold shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Store Verification: <span className="text-amber-600 font-bold">Pending</span>
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">Complete verification to unlock all features and start running sponsored ads.</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('kyc')}
                  className="px-4 py-2 rounded-xl bg-white border border-purple-900 text-purple-900 hover:bg-purple-50 font-bold text-xs transition cursor-pointer shadow-2xs whitespace-nowrap self-start sm:self-auto"
                >
                  Complete Now
                </button>
              </div>

              {/* Greeting Header */}
              <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  Welcome back, {storeName}! 👋
                </h1>
                <p className="text-xs text-slate-500 mt-1">Here's what's happening with your store today.</p>
              </div>

              {/* 5 KPI CARDS */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Total Sales</span>
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900">{formatTZS(metrics.totalRevenue || 12450000)}</p>
                  <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> 18.6% <span className="text-slate-400 font-normal">vs last 7 days</span>
                  </p>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Orders</span>
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900">{metrics.totalOrders || 126}</p>
                  <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> 15.3% <span className="text-slate-400 font-normal">vs last 7 days</span>
                  </p>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Products</span>
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700">
                      <Package className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900">{productsList.length || 48}</p>
                  <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> 6.2% <span className="text-slate-400 font-normal">vs last 7 days</span>
                  </p>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Store Views</span>
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700">
                      <Eye className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900">3,245</p>
                  <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> 21.4% <span className="text-slate-400 font-normal">vs last 7 days</span>
                  </p>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2 col-span-2 sm:col-span-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Store Rating</span>
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                      <Star className="w-4 h-4 fill-amber-500" />
                    </div>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-1">
                    {metrics.rating || 4.7} <Star className="w-4 h-4 text-amber-500 fill-amber-500 inline" />
                  </p>
                  <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> 98% <span className="text-slate-400 font-normal">Positive reviews</span>
                  </p>
                </div>
              </div>

              {/* MIDDLE ROW: Sales Overview Chart, Top Selling Products, Announcements */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Overview Chart - Fully Interactive */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Sales Overview</h3>
                      <p className="text-[11px] font-semibold text-purple-700 mt-0.5">
                        {formatTZS(currentChartData.totalSales)}
                      </p>
                    </div>
                    <select
                      value={analyticsTimeframe}
                      onChange={(e) => {
                        setAnalyticsTimeframe(e.target.value as any);
                        setHoveredChartIndex(null);
                      }}
                      className="text-xs border border-slate-200 rounded-lg px-2.5 py-1 bg-slate-50 text-slate-700 font-medium focus:outline-none cursor-pointer hover:border-purple-300 transition"
                    >
                      <option value="7days">Last 7 Days</option>
                      <option value="30days">Last 30 Days</option>
                      <option value="today">Today</option>
                      <option value="3months">Last 3 Months</option>
                    </select>
                  </div>

                  {/* SVG Line Chart */}
                  <div
                    className="relative pt-4 pb-2"
                    onMouseLeave={() => setHoveredChartIndex(null)}
                  >
                    <svg className="w-full h-44 overflow-visible" viewBox="0 0 320 140">
                      <defs>
                        <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>
                      {/* Horizontal gridlines */}
                      <line x1="0" y1="20" x2="320" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="0" y1="55" x2="320" y2="55" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="0" y1="90" x2="320" y2="90" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="0" y1="125" x2="320" y2="125" stroke="#f1f5f9" strokeWidth="1" />

                      {/* Y Axis Labels */}
                      {currentChartData.yLabels.map((lbl, idx) => (
                        <text key={idx} x="0" y={20 + idx * 35} className="text-[9px] fill-slate-400 font-medium">
                          {lbl}
                        </text>
                      ))}

                      {/* Filled Area */}
                      <path
                        d={currentChartData.areaD}
                        fill="url(#purpleGrad)"
                        className="transition-all duration-300 ease-in-out"
                      />

                      {/* Main Stroke Line */}
                      <path
                        d={currentChartData.pathD}
                        fill="none"
                        stroke="#6d28d9"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        className="transition-all duration-300 ease-in-out"
                      />

                      {/* Hover Vertical Dashed Line */}
                      {activeChartPoint && (
                        <line
                          x1={activeChartPoint.cx}
                          y1="15"
                          x2={activeChartPoint.cx}
                          y2="125"
                          stroke="#a855f7"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                          className="animate-fade-in"
                        />
                      )}

                      {/* Data Points */}
                      {currentChartData.points.map((pt, idx) => {
                        const isHovered = activeChartPointIndex === idx;
                        return (
                          <g key={idx} className="cursor-pointer">
                            {/* Hitbox circle */}
                            <circle
                              cx={pt.cx}
                              cy={pt.cy}
                              r="16"
                              fill="transparent"
                              onMouseEnter={() => setHoveredChartIndex(idx)}
                              onClick={() => setHoveredChartIndex(idx)}
                            />
                            {/* Outer Pulse Ring when hovered */}
                            {isHovered && (
                              <circle
                                cx={pt.cx}
                                cy={pt.cy}
                                r="9"
                                fill="#7c3aed"
                                fillOpacity="0.25"
                                className="animate-ping"
                              />
                            )}
                            {/* Node Dot */}
                            <circle
                              cx={pt.cx}
                              cy={pt.cy}
                              r={isHovered ? 5.5 : 3.5}
                              fill={isHovered ? "#38006b" : "#6d28d9"}
                              stroke={isHovered ? "#ffffff" : "none"}
                              strokeWidth={isHovered ? 2 : 0}
                              onMouseEnter={() => setHoveredChartIndex(idx)}
                              className="transition-all duration-200"
                            />
                          </g>
                        );
                      })}

                      {/* Active Tooltip Callout */}
                      {activeChartPoint && (
                        <g
                          transform={`translate(${Math.min(Math.max(activeChartPoint.cx - 45, 0), 225)}, ${Math.max(activeChartPoint.cy - 34, 0)})`}
                          className="transition-all duration-200"
                        >
                          <rect x="0" y="0" width="95" height="28" rx="7" fill="#38006b" className="shadow-lg" />
                          <text x="47.5" y="11" textAnchor="middle" className="text-[9px] font-bold fill-white">
                            {formatTZS(activeChartPoint.value)}
                          </text>
                          <text x="47.5" y="22" textAnchor="middle" className="text-[8px] fill-purple-200 font-medium">
                            {activeChartPoint.label} • {activeChartPoint.orders} orders
                          </text>
                        </g>
                      )}
                    </svg>

                    {/* Date Axis */}
                    <div className="flex justify-between text-[10px] text-slate-400 pt-2 px-1 font-medium">
                      {currentChartData.points.map((pt, idx) => (
                        <span
                          key={idx}
                          onMouseEnter={() => setHoveredChartIndex(idx)}
                          onClick={() => setHoveredChartIndex(idx)}
                          className={`cursor-pointer transition hover:text-purple-700 ${
                            activeChartPointIndex === idx ? 'text-purple-700 font-bold underline' : ''
                          }`}
                        >
                          {pt.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Top Selling Products */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">Top Selling Products</h3>
                    <button onClick={() => setActiveTab('products')} className="text-xs font-semibold text-purple-700 hover:underline cursor-pointer">
                      View all
                    </button>
                  </div>

                  <div className="space-y-3">
                    {[
                      { name: 'LUMO Unisex Hoodie', price: formatTZS(610000), sold: '236 Sold', img: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=120' },
                      { name: 'LUMO Sneakers', price: formatTZS(970000), sold: '189 Sold', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120' },
                      { name: 'LUMO Cap', price: formatTZS(220000), sold: '156 Sold', img: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=120' },
                      { name: 'LUMO T-Shirt', price: formatTZS(330000), sold: '142 Sold', img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=120' },
                      { name: 'LUMO Backpack', price: formatTZS(780000), sold: '98 Sold', img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=120' }
                    ].map((prod, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <img src={prod.img} alt={prod.name} className="w-10 h-10 rounded-xl object-cover bg-slate-100 border border-slate-200" />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">{prod.name}</p>
                            <p className="text-slate-500 font-medium">{prod.price}</p>
                          </div>
                        </div>
                        <span className="text-slate-500 font-semibold shrink-0 text-[11px]">{prod.sold}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Announcements Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">Announcements</h3>
                    <button onClick={() => setActiveTab('support')} className="text-xs font-semibold text-purple-700 hover:underline cursor-pointer">
                      View all
                    </button>
                  </div>

                  {/* Purple Update Banner */}
                  <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 space-y-3 relative overflow-hidden">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <span className="font-bold text-purple-900 text-xs block">LUMO Seller Update</span>
                        <p className="text-xs text-purple-800 font-semibold leading-tight">New advertising tools are here!</p>
                        <p className="text-[11px] text-purple-600">Boost your products and reach more customers.</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-purple-200/60 flex items-center justify-center text-purple-800 shrink-0">
                        <Megaphone className="w-5 h-5" />
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('ads_boost')}
                      className="px-3.5 py-1.5 rounded-lg bg-white border border-purple-300 text-purple-900 font-bold text-[11px] hover:bg-purple-100 cursor-pointer shadow-2xs"
                    >
                      Learn More
                    </button>
                    <div className="flex justify-center gap-1.5 pt-1">
                      <span className="w-2 h-2 rounded-full bg-purple-700"></span>
                      <span className="w-2 h-2 rounded-full bg-purple-200"></span>
                      <span className="w-2 h-2 rounded-full bg-purple-200"></span>
                    </div>
                  </div>

                  {/* Timed Bullet Points */}
                  <ul className="space-y-2 text-xs text-slate-700 divide-y divide-slate-100">
                    <li className="pt-2 flex items-center justify-between gap-2">
                      <span className="truncate text-slate-800">• Payouts will be processed on May 20, 2025</span>
                      <span className="text-[10px] text-slate-400 shrink-0">2 days ago</span>
                    </li>
                    <li className="pt-2 flex items-center justify-between gap-2">
                      <span className="truncate text-slate-800">• Store verification required to run ads</span>
                      <span className="text-[10px] text-slate-400 shrink-0">3 days ago</span>
                    </li>
                    <li className="pt-2 flex items-center justify-between gap-2">
                      <span className="truncate text-slate-800">• Update to our Returns & Refunds Policy</span>
                      <span className="text-[10px] text-slate-400 shrink-0">1 week ago</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* BOTTOM ROW: Orders Summary, Store Performance, Grow Ads, Recent Orders */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Orders Summary */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">Orders Summary</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-xs font-semibold text-purple-700 hover:underline cursor-pointer">
                      View all
                    </button>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {[
                      { status: 'Pending', count: 18, color: 'text-amber-600 bg-amber-50', icon: Clock },
                      { status: 'Confirmed', count: 32, color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle2 },
                      { status: 'Processing', count: 41, color: 'text-blue-600 bg-blue-50', icon: Package },
                      { status: 'Shipped', count: 21, color: 'text-purple-600 bg-purple-50', icon: Truck },
                      { status: 'Delivered', count: 14, color: 'text-emerald-700 bg-emerald-100', icon: CheckCircle },
                      { status: 'Cancelled', count: 3, color: 'text-rose-600 bg-rose-50', icon: XCircle }
                    ].map((st, idx) => {
                      const Icon = st.icon;
                      return (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-xl border border-slate-100 hover:bg-slate-50 transition">
                          <div className="flex items-center gap-2.5">
                            <div className={`p-1.5 rounded-lg ${st.color}`}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-medium text-slate-800">{st.status}</span>
                          </div>
                          <span className="font-bold text-slate-900">{st.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Store Performance - Interactive */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">Store Performance</h3>
                    <select
                      value={storePerfTimeframe}
                      onChange={(e) => setStorePerfTimeframe(e.target.value as any)}
                      className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 text-slate-700 font-medium focus:outline-none cursor-pointer hover:border-purple-300 transition"
                    >
                      <option value="7days">Last 7 Days</option>
                      <option value="30days">Last 30 Days</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-3 bg-slate-50/80 hover:bg-purple-50/40 transition rounded-xl border border-slate-100 space-y-1">
                      <span className="text-[11px] font-medium text-slate-500 block">Conversion Rate</span>
                      <p className="text-lg font-bold text-slate-900">{storePerformanceMetrics.conversionRate}</p>
                      <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" /> {storePerformanceMetrics.conversionTrend}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50/80 hover:bg-purple-50/40 transition rounded-xl border border-slate-100 space-y-1">
                      <span className="text-[11px] font-medium text-slate-500 block">Avg. Order Value</span>
                      <p className="text-lg font-bold text-slate-900">{storePerformanceMetrics.avgOrderValue}</p>
                      <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" /> {storePerformanceMetrics.aovTrend}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50/80 hover:bg-purple-50/40 transition rounded-xl border border-slate-100 space-y-1">
                      <span className="text-[11px] font-medium text-slate-500 block">Return Rate</span>
                      <p className="text-lg font-bold text-slate-900">{storePerformanceMetrics.returnRate}</p>
                      <p className="text-[10px] text-rose-600 font-semibold flex items-center gap-0.5">
                        ↘ {storePerformanceMetrics.returnTrend}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50/80 hover:bg-purple-50/40 transition rounded-xl border border-slate-100 space-y-1">
                      <span className="text-[11px] font-medium text-slate-500 block">Customer Satisfaction</span>
                      <p className="text-lg font-bold text-slate-900">{storePerformanceMetrics.satisfaction}</p>
                      <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" /> {storePerformanceMetrics.satTrend}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Grow Ads Dark Purple Card */}
                <div className="bg-[#38006b] text-white rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 relative overflow-hidden">
                  <div className="space-y-2 z-10">
                    <h3 className="font-bold text-base sm:text-lg text-white leading-tight">Grow your business with LUMO Ads</h3>
                    <p className="text-xs text-purple-200">Increase visibility and boost sales with targeted ads.</p>
                  </div>

                  <div className="py-2 z-10 flex justify-center">
                    <Sparkles className="w-16 h-16 text-yellow-400 opacity-90 animate-pulse" />
                  </div>

                  <button
                    onClick={() => setActiveTab('ads_boost')}
                    className="w-full py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs cursor-pointer shadow-md transition text-center z-10"
                  >
                    Create Ad Campaign
                  </button>
                </div>

                {/* Recent Orders List */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">Recent Orders</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-xs font-semibold text-purple-700 hover:underline cursor-pointer">
                      View all
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 text-xs">
                    {allOrders.slice(0, 5).map((ord) => (
                      <div key={ord.id} className="py-2.5 flex items-center justify-between gap-2">
                        <div>
                          <span className="font-bold text-slate-900 block">#{ord.orderNumber || ord.id.substring(0, 8)}</span>
                          <span className="text-[10px] text-slate-400">May 17, 2025</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-900 block">{formatTZS(ord.pricing?.total || 610000)}</span>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ord.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                            ord.status === 'Processing' ? 'bg-emerald-100 text-emerald-800' :
                            ord.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                            ord.status === 'Delivered' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {ord.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RECENT ORDERS & LOW STOCK */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h2 className="font-bold text-slate-900 text-base">Recent Orders</h2>
                    <button 
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-semibold text-[#ff6a00] hover:underline cursor-pointer"
                    >
                      View All Orders →
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {allOrders.slice(0, 4).map((ord) => (
                      <div key={ord.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span 
                              onClick={() => setSelectedOrder(ord)}
                              className="font-bold text-slate-955 hover:text-[#ff6a00] cursor-pointer"
                            >
                              Order #{ord.orderNumber}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-[#ff6a00]">
                              {ord.status}
                            </span>
                          </div>
                          <p className="text-slate-500 mt-0.5">{ord.customer.name} • {ord.deliveryAddress?.area}</p>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <div>
                            <span className="font-bold text-slate-900 block">{formatTZS(ord.pricing?.total || 0)}</span>
                            <span className="text-[10px] text-emerald-600 font-semibold">{ord.paymentMethod?.status}</span>
                          </div>
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Low Stock Alert
                    </h2>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">2 Items</span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/40 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <p className="font-bold text-slate-900">Anker PowerCore 24,000mAh</p>
                        <p className="text-amber-800 text-[11px] mt-0.5">Stock: <strong className="text-rose-600">3 units</strong></p>
                      </div>
                      <button 
                        onClick={() => setActiveTab('inventory')}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-700 cursor-pointer text-xs shrink-0"
                      >
                        Restock
                      </button>
                    </div>

                    <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/40 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <p className="font-bold text-slate-900">JBL Flip 6 Waterproof Speaker</p>
                        <p className="text-amber-800 text-[11px] mt-0.5">Stock: <strong className="text-rose-600">2 units</strong></p>
                      </div>
                      <button 
                        onClick={() => setActiveTab('inventory')}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-700 cursor-pointer text-xs shrink-0"
                      >
                        Restock
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SELLER GROWTH & EVENTS SECTION REMOVED */}
            </div>
          )}

          {/* 2. PRODUCTS MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">Product Catalog Management</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Manage live store inventory, pricing, and promotional tags</p>
                </div>
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ff6a00] hover:bg-[#ff6a00]/90 text-white font-semibold text-xs transition cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add New Product
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {productsList.map((prod) => {
                      const isPromo = prod.badges?.includes('PROMOTION') || (prod.originalPrice && prod.originalPrice > prod.price);
                      return (
                        <tr key={prod.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-4 flex items-center gap-3">
                            <img 
                              src={prod.thumbnail || prod.images[0]} 
                              alt={prod.name} 
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-slate-900 line-clamp-1">{prod.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">SKU: LM-{prod.id.slice(-4)}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 capitalize">{(prod?.category || '').replace(/-/g, ' ')}</td>
                          <td className="py-3 px-4">
                            <p className="font-bold text-slate-900">{formatTZS(prod.price)}</p>
                            {isPromo && <span className="text-[10px] text-amber-600 font-semibold">Promotion Active</span>}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded font-bold ${prod.stock <= 5 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                              {prod.stock} in stock
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                              Active
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setStockModalProduct(prod);
                                setStockAdjustQty('10');
                                setShowStockAdjustModal(true);
                              }}
                              className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold cursor-pointer flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" /> Stock
                            </button>
                            <button
                              onClick={() => {
                                setSelectedProductForAnalytics(prod);
                                setShowProductAnalyticsModal(true);
                              }}
                              className="px-2.5 py-1 rounded bg-orange-50 hover:bg-orange-100 text-[#ff6a00] font-semibold cursor-pointer flex items-center gap-1"
                            >
                              <BarChart3 className="w-3.5 h-3.5" /> Analytics
                            </button>
                            <button 
                              onClick={() => {
                                setEditingProductId(prod.id);
                                setNewProdName(prod.name);
                                setNewProdPrice(prod.price.toString());
                                setNewProdOriginalPrice(prod.oldPrice ? prod.oldPrice.toString() : '');
                                setNewProdCategory(prod.category || 'Phones & Tablets');
                                setNewProdSubcategory(prod.subcategory || 'Smartphones');
                                setNewProdStock(prod.stock.toString());
                                setNewProdBrand(prod.brand || 'Samsung');
                                setNewProdCondition(prod.condition || 'New');
                                setNewProdDescription(prod.description || '');
                                setNewProdHasWarranty(prod.warranty && !prod.warranty.includes('No Warranty') ? 'yes' : 'no');
                                setNewProdIsPromo(Boolean(prod.oldPrice && prod.oldPrice > prod.price));
                                setSelectedProductImage(prod.thumbnail || prod.images?.[0] || 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800');
                                setShowAddProduct(true);
                              }}
                              className="px-2.5 py-1 rounded border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={async () => {
                                if (confirm(`Are you sure you want to delete ${prod.name}?`)) {
                                  await api.deleteProduct(prod.id);
                                  await loadData();
                                }
                              }}
                              className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold cursor-pointer"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. INVENTORY MANAGEMENT */}
          {activeTab === 'inventory' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in">
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Multi-State Inventory Ledger</h2>
                <p className="text-xs text-slate-500">Real-time breakdown of warehouse stock, reserved units, and safety thresholds</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">SKU / Item</th>
                      <th className="py-3 px-4">Warehouse Stock</th>
                      <th className="py-3 px-4">Reserved in Orders</th>
                      <th className="py-3 px-4">Available To Sell</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inventoryList.map((inv) => (
                      <tr key={inv.id}>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{inv.sku}</td>
                        <td className="py-3 px-4">{inv.quantityOnHand} units</td>
                        <td className="py-3 px-4 text-[#ff6a00] font-semibold">{inv.quantityReserved} units</td>
                        <td className="py-3 px-4 font-bold text-emerald-700">{inv.quantityAvailable} units</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            OPTIMAL
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => handleQuickAdjustStock({ id: inv.productId || inv.id, name: inv.sku, stock: inv.quantityOnHand } as any, -1)}
                            className="w-7 h-7 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold flex items-center justify-center cursor-pointer"
                            title="Decrease Stock by 1"
                          >
                            -
                          </button>
                          <button 
                            onClick={() => handleQuickAdjustStock({ id: inv.productId || inv.id, name: inv.sku, stock: inv.quantityOnHand } as any, 5)}
                            className="w-7 h-7 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold flex items-center justify-center cursor-pointer"
                            title="Add 5 units"
                          >
                            +5
                          </button>
                          <button 
                            onClick={() => {
                              const prod = productsList.find(p => p.id === inv.productId || p.id === inv.id) || { id: inv.productId || inv.id, name: `SKU ${inv.sku}`, stock: inv.quantityOnHand } as any;
                              setStockModalProduct(prod);
                              setStockAdjustQty('10');
                              setShowStockAdjustModal(true);
                            }}
                            className="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                          >
                            Adjust Stock
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">Vendor Orders & Buyer Scoring</h2>
                  <p className="text-xs text-slate-500">Monitor customer trustworthiness, cancellation rates, and escrow settlement status</p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {['All', 'New', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Delivered', 'Cancelled'].map((tabName) => (
                    <button
                      key={tabName}
                      onClick={() => setOrderStatusTab(tabName)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        orderStatusTab === tabName ? 'bg-[#ff6a00] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tabName}
                    </button>
                  ))}
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {allOrders
                  .filter(ord => {
                    if (orderStatusTab === 'All') return true;
                    const statusStr = (ord.status || '').toLowerCase().replace(/_/g, '');
                    const tabStr = (orderStatusTab || '').toLowerCase().replace(/ /g, '');
                    if (tabStr === 'new') {
                      return ['new', 'processing', 'pending', 'planted'].includes(statusStr);
                    }
                    if (tabStr === 'readyforpickup') {
                      return ['readyforpickup', 'dispatched', 'intransit'].includes(statusStr);
                    }
                    return statusStr.includes(tabStr) || tabStr.includes(statusStr);
                  })
                  .map((order, idx) => {
                    const isFlagged = idx === 2;
                    const customerScore = isFlagged ? 42 : 96;

                    return (
                      <div key={order.id} className="py-5 space-y-3">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span 
                                onClick={() => setSelectedOrder(order)}
                                className="font-bold text-base text-slate-900 hover:text-[#ff6a00] cursor-pointer"
                              >
                                Order #{order.orderNumber}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-[#ff6a00]">
                                {order.status}
                              </span>
                              <span className="text-xs text-slate-400">Placed: {order.createdAt?.split('T')[0] || 'Today'}</span>
                            </div>

                            <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900">{order.customer?.name || 'Customer'}</span>
                                  <span className="text-slate-500">({order.customer?.phone || '+255 ...'})</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${customerScore >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                    Trust Score: {customerScore}/100
                                  </span>
                                </div>
                              </div>
                              <p className="text-slate-600">
                                Delivery Address: <strong className="text-slate-800">{order.deliveryAddress?.street || 'Central Hub'}, {order.deliveryAddress?.area || 'Kariakoo'}, {order.deliveryAddress?.city || 'Dar es Salaam'}</strong>
                              </p>
                            </div>
                          </div>

                          <div className="text-right lg:min-w-[180px] space-y-2">
                            <p className="text-base font-bold text-slate-900">{formatTZS(order.pricing?.total || 0)}</p>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer text-xs"
                              >
                                View Details
                              </button>
                              {['New', 'Processing', 'Pending', 'PLANTED'].includes(order.status) && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'Confirmed')}
                                  className="px-3 py-1.5 rounded-lg bg-[#ff6a00] hover:bg-[#ff6a00]/90 text-white font-bold cursor-pointer text-xs flex items-center gap-1 shadow-xs"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" /> Accept
                                </button>
                              )}
                              {order.status === 'Confirmed' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'Preparing')}
                                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer text-xs flex items-center gap-1 shadow-xs"
                                >
                                  <Clock className="w-3.5 h-3.5" /> Prepare
                                </button>
                              )}
                              {order.status === 'Preparing' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'Ready for Pickup')}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer text-xs flex items-center gap-1 shadow-xs"
                                >
                                  <Package className="w-3.5 h-3.5" /> Ready
                                </button>
                              )}
                              {['Ready for Pickup', 'Dispatched', 'In Transit', 'Delivered'].includes(order.status) && (
                                <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-200 flex items-center gap-1">
                                  <Truck className="w-3.5 h-3.5" /> {order.status}
                                </span>
                              )}
                              {!['Cancelled', 'Delivered', 'Returned'].includes(order.status) && (
                                <button
                                  onClick={() => {
                                    setDenyTargetOrder(order);
                                    setShowDenyModal(true);
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold cursor-pointer text-xs flex items-center gap-1 border border-rose-200"
                                >
                                  <XCircle className="w-3.5 h-3.5" /> Deny
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* 5. FULFILLMENT TAB */}
          {activeTab === 'fulfillment' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">Order Fulfillment Pipeline</h2>
                  <p className="text-xs text-slate-500">Live inventory reservation, order preparation, and logistics dispatch control</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-orange-100 text-[#ff6a00] font-bold text-xs border border-orange-200">
                  {allOrders.filter(o => !['Cancelled', 'Delivered'].includes(o.status)).length} Active Orders in Hub
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {[
                  { title: 'New Order', count: allOrders.filter(o => ['New', 'Processing', 'Pending', 'PLANTED'].includes(o.status)).length, color: 'bg-blue-50 border-blue-200 text-blue-800' },
                  { title: 'Confirmed', count: allOrders.filter(o => o.status === 'Confirmed').length, color: 'bg-indigo-50 border-indigo-200 text-indigo-800' },
                  { title: 'Preparing', count: allOrders.filter(o => o.status === 'Preparing').length, color: 'bg-amber-50 border-amber-200 text-amber-800' },
                  { title: 'Packaged', count: allOrders.filter(o => o.status === 'Packaged').length, color: 'bg-purple-50 border-purple-200 text-purple-800' },
                  { title: 'Ready for Pickup', count: allOrders.filter(o => ['Ready for Pickup', 'Dispatched', 'In Transit'].includes(o.status)).length, color: 'bg-emerald-50 border-emerald-200 text-emerald-800' }
                ].map((st, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border ${st.color} space-y-1`}>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-70">Stage 0{idx + 1}</span>
                    <h3 className="font-bold text-slate-900 text-sm">{st.title}</h3>
                    <p className="text-xl font-black">{st.count} <span className="text-xs font-normal">orders</span></p>
                  </div>
                ))}
              </div>

              {/* Express Active Order Dispatch Banner */}
              {(() => {
                const expressOrder = allOrders.find(o => ['New', 'Processing', 'Pending', 'Confirmed', 'Preparing'].includes(o.status)) || allOrders[0];
                if (!expressOrder) return null;
                return (
                  <div className="p-6 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg border border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded bg-[#ff6a00] text-white font-bold text-[10px] uppercase tracking-wider">EXPRESS DISPATCH ALERT</span>
                        <span className="text-xs text-amber-400 font-mono font-bold">#{expressOrder.orderNumber || expressOrder.id}</span>
                      </div>
                      <h3 className="text-base font-bold mt-2">{expressOrder.items?.[0]?.name || 'Customer Express Item'}</h3>
                      <p className="text-xs text-slate-300 mt-1">Customer: <strong className="text-white">{expressOrder.customer?.name || 'Buyer'}</strong> • Zone: {expressOrder.deliveryAddress?.area || 'Dar es Salaam'} • Current Status: <strong className="text-emerald-400">{expressOrder.status}</strong></p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button 
                        onClick={() => handleUpdateOrderStatus(expressOrder.id, 'Ready for Pickup')}
                        className="px-5 py-2.5 rounded-xl bg-[#ff6a00] hover:bg-[#ff6a00]/90 text-white font-bold text-xs cursor-pointer shadow-sm"
                      >
                        MARK READY FOR PICKUP
                      </button>
                      <button 
                        onClick={() => {
                          setDenyTargetOrder(expressOrder);
                          setShowDenyModal(true);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-xs cursor-pointer border border-rose-500/50"
                      >
                        DENY ORDER
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* 6. SALES & REVENUE TAB */}
          {activeTab === 'sales_revenue' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Sales Volume</span>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{formatTZS(metrics.revenue)}</p>
                  <p className="text-xs text-emerald-600 font-semibold mt-1">+18.5% vs last month</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Platform Take-Rate (7%)</span>
                  <p className="text-2xl font-bold text-rose-600 mt-2">-{formatTZS(metrics.revenue * 0.07)}</p>
                  <p className="text-xs text-slate-500 mt-1">Standard LUMO commission</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Available Payout Balance</span>
                  <p className="text-2xl font-bold text-emerald-700 mt-2">{formatTZS(metrics.availableBalance)}</p>
                  <button
                    onClick={() => setShowPayoutModal(true)}
                    className="mt-3 w-full py-2 rounded-xl bg-[#ff6a00] text-white font-semibold text-xs cursor-pointer shadow-sm"
                  >
                    Withdraw Funds
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 7. ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in">
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Vendor Business Analytics</h2>
                <p className="text-xs text-slate-500">Deep dive into sales velocity, category performance, and fulfillment ratings</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-xs">Fulfillment Rate</span>
                  <p className="text-2xl font-bold text-slate-900 mt-1">99.2%</p>
                  <p className="text-xs text-emerald-600 font-medium mt-1">Exceeds benchmark</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-xs">Store Followers</span>
                  <p className="text-2xl font-bold text-[#ff6a00] mt-1">{(followersCount || 0).toLocaleString()}</p>
                  <p className="text-xs text-slate-500 font-medium mt-1">Active buyer community</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-xs">Average Order Value</span>
                  <p className="text-2xl font-bold text-slate-900 mt-1">TZS 346,000</p>
                  <p className="text-xs text-[#ff6a00] font-medium mt-1">+4.1% this week</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-xs">Return Rate</span>
                  <p className="text-2xl font-bold text-slate-900 mt-1">1.1%</p>
                  <p className="text-xs text-slate-500 font-medium mt-1">Within normal range</p>
                </div>
              </div>
            </div>
          )}

          {/* 8. CUSTOMERS TAB */}
          {activeTab === 'customers' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in">
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Customer Directory & Buyer History</h2>
                <p className="text-xs text-slate-500">View repeat buyers and purchasing frequency</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Customer Name</th>
                      <th className="py-3 px-4">Phone Number</th>
                      <th className="py-3 px-4">Total Orders</th>
                      <th className="py-3 px-4">Total Spent</th>
                      <th className="py-3 px-4">Trust Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { name: 'Baraka Juma', phone: '+255 715 892 100', orders: 6, spent: 'TZS 1,850,000', score: '98 / 100' },
                      { name: 'Neema Mwakyusa', phone: '+255 762 441 992', orders: 4, spent: 'TZS 940,000', score: '95 / 100' },
                      { name: 'Aisha Mwinyi', phone: '+255 713 556 778', orders: 9, spent: 'TZS 3,420,000', score: '99 / 100' }
                    ].map((c, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900">{c.name}</td>
                        <td className="py-3 px-4">{c.phone}</td>
                        <td className="py-3 px-4">{c.orders} orders</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{c.spent}</td>
                        <td className="py-3 px-4 font-semibold text-emerald-700">{c.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 9. REVIEWS TAB */}
          {activeTab === 'reviews' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">Customer Reviews & Ratings</h2>
                  <p className="text-xs text-slate-500">Overall store rating: ★ 4.9 out of 5.0 (412 ratings)</p>
                </div>
              </div>

              <div className="space-y-4">
                {reviewsList.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{rev.customer}</span>
                        <span className="text-amber-500 text-xs">{'★'.repeat(rev.rating)}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">{rev.date}</span>
                    </div>
                    <p className="text-xs text-slate-700">{rev.comment}</p>
                    <p className="text-[11px] text-[#ff6a00] font-semibold">Product: {rev.product}</p>

                    {rev.reply ? (
                      <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-600 mt-2">
                        <strong className="text-slate-900 block mb-0.5">Store Response:</strong>
                        {rev.reply}
                      </div>
                    ) : (
                      <div>
                        {replyingReviewId === rev.id ? (
                          <div className="space-y-2 mt-2">
                            <textarea
                              rows={2}
                              value={reviewReplyText}
                              onChange={(e) => setReviewReplyText(e.target.value)}
                              placeholder="Write a professional response to this customer..."
                              className="w-full p-2 text-xs rounded-lg border border-slate-300"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => setReplyingReviewId(null)}
                                className="px-3 py-1 rounded bg-slate-200 text-slate-700 font-semibold text-xs"
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={() => {
                                  if (!reviewReplyText) return;
                                  setReviewsList(reviewsList.map(r => r.id === rev.id ? { ...r, reply: reviewReplyText } : r));
                                  setReplyingReviewId(null);
                                  setReviewReplyText('');
                                  alert('Response successfully posted to customer review.');
                                }}
                                className="px-3 py-1 rounded bg-[#ff6a00] text-white font-semibold text-xs cursor-pointer"
                              >
                                Post Reply
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setReplyingReviewId(rev.id);
                              setReviewReplyText('');
                            }}
                            className="text-xs text-[#ff6a00] font-semibold hover:underline cursor-pointer pt-1 block"
                          >
                            Reply to Review →
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 10. PROMOTIONS TAB */}
          {activeTab === 'promotions' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">Vendor Promotion Builder & Campaign Engine</h2>
                  <p className="text-xs text-slate-500">Create, configure, and monitor automated discounts, coupons, and flash sales</p>
                </div>
                <button 
                  onClick={() => setShowPromoModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#ff6a00] hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all shrink-0"
                >
                  <Plus className="w-4 h-4" /> Create Promotion
                </button>
              </div>

              {/* Summary Metrics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-medium text-slate-500">Total Campaigns</span>
                  <div className="text-xl font-black text-slate-900 mt-1">{promotionsList.length}</div>
                  <span className="text-[10px] text-slate-400">All created promotions</span>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                  <span className="text-xs font-medium text-emerald-700">Active Offers</span>
                  <div className="text-xl font-black text-emerald-900 mt-1">
                    {promotionsList.filter(p => p.status === 'Active').length}
                  </div>
                  <span className="text-[10px] text-emerald-600">Currently live on storefront</span>
                </div>
                <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200">
                  <span className="text-xs font-medium text-orange-700">Total Redemptions</span>
                  <div className="text-xl font-black text-orange-900 mt-1">
                    {promotionsList.reduce((sum, p) => sum + (p.analytics?.redemptions || 0), 0)}
                  </div>
                  <span className="text-[10px] text-orange-600">Customer orders placed</span>
                </div>
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200">
                  <span className="text-xs font-medium text-blue-700">Promo Revenue</span>
                  <div className="text-xl font-black text-blue-900 mt-1">
                    TZS {promotionsList.reduce((sum, p) => sum + (p.analytics?.revenue || 0), 0).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-blue-600">Generated sales volume</span>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="relative grow">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search campaigns by name, ref, or coupon code..."
                    value={promoSearchQuery}
                    onChange={(e) => setPromoSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-hidden"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Status:</span>
                  <select
                    value={promoStatusFilter}
                    onChange={(e) => setPromoStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-semibold outline-hidden"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Draft">Draft</option>
                    <option value="Paused">Paused</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>

              {/* Promotions List */}
              <div className="space-y-4">
                {promotionsList
                  .filter(p => {
                    if (promoStatusFilter !== 'All' && p.status !== promoStatusFilter) return false;
                    if (promoSearchQuery) {
                      const q = promoSearchQuery.toLowerCase();
                      return p.name.toLowerCase().includes(q) || 
                        (p.internalRef && p.internalRef.toLowerCase().includes(q)) ||
                        (p.coupon?.code && p.coupon.code.toLowerCase().includes(q));
                    }
                    return true;
                  })
                  .map((promo) => {
                    const statusColor = 
                      promo.status === 'Active' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                      promo.status === 'Scheduled' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                      promo.status === 'Under Review' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                      promo.status === 'Paused' ? 'bg-slate-100 text-slate-700 border-slate-300' :
                      'bg-rose-100 text-rose-800 border-rose-300';

                    return (
                      <div key={promo.id} className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-orange-300 shadow-xs transition-all space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-slate-900 text-base">{promo.name}</h3>
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ff6a00] text-white">
                                {promo.promotionType}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusColor}`}>
                                {promo.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">
                              Ref: <span className="font-mono">{promo.internalRef || promo.id}</span> • Scope: <span className="font-semibold text-slate-700">{promo.appliesTo}</span>
                            </p>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => {
                                setSelectedPromoForAnalytics(promo);
                                setShowAnalyticsModal(true);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1 cursor-pointer"
                            >
                              <BarChart3 className="w-3.5 h-3.5" /> Analytics
                            </button>

                            <button
                              onClick={async () => {
                                try {
                                  const res = await fetch(`/api/promotions/${promo.id}/duplicate`, { method: 'POST' });
                                  const data = await res.json();
                                  if (data.promotion) {
                                    setPromotionsList([data.promotion, ...promotionsList]);
                                  }
                                } catch (err) {
                                  console.error('Failed to duplicate promo:', err);
                                }
                              }}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1 cursor-pointer"
                            >
                              Duplicate
                            </button>

                            {promo.status === 'Active' ? (
                              <button
                                onClick={async () => {
                                  const res = await fetch(`/api/promotions/${promo.id}/status`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ status: 'Paused' })
                                  });
                                  const data = await res.json();
                                  if (data.promotion) {
                                    setPromotionsList(promotionsList.map(p => p.id === promo.id ? data.promotion : p));
                                  }
                                }}
                                className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs cursor-pointer"
                              >
                                Pause
                              </button>
                            ) : promo.status === 'Paused' ? (
                              <button
                                onClick={async () => {
                                  const res = await fetch(`/api/promotions/${promo.id}/status`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ status: 'Active' })
                                  });
                                  const data = await res.json();
                                  if (data.promotion) {
                                    setPromotionsList(promotionsList.map(p => p.id === promo.id ? data.promotion : p));
                                  }
                                }}
                                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs cursor-pointer"
                              >
                                Resume
                              </button>
                            ) : null}

                            <button
                              onClick={async () => {
                                if (confirm(`Are you sure you want to end promotion "${promo.name}"?`)) {
                                  const res = await fetch(`/api/promotions/${promo.id}/status`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ status: 'Cancelled' })
                                  });
                                  const data = await res.json();
                                  if (data.promotion) {
                                    setPromotionsList(promotionsList.map(p => p.id === promo.id ? data.promotion : p));
                                  }
                                }
                              }}
                              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold text-xs cursor-pointer"
                            >
                              Cancel
                            </button>

                            <button
                              onClick={async () => {
                                if (confirm(`Permanently delete promotion "${promo.name}"? This action cannot be undone.`)) {
                                  try {
                                    await api.deletePromotion(promo.id);
                                    setPromotionsList(promotionsList.filter(p => p.id !== promo.id));
                                  } catch {
                                    setPromotionsList(promotionsList.filter(p => p.id !== promo.id));
                                  }
                                }
                              }}
                              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {/* Promo Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="text-slate-400 font-medium">Coupon Code</span>
                            <div className="font-mono font-bold text-slate-900 mt-0.5">
                              {promo.coupon?.requireCoupon ? (promo.coupon.code || 'None') : 'No Code Required'}
                            </div>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="text-slate-400 font-medium">Active Window</span>
                            <div className="font-semibold text-slate-800 mt-0.5">
                              {promo.startDate} to {promo.endDate} ({promo.timezone || 'EAT'})
                            </div>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="text-slate-400 font-medium">Redemptions & Budget</span>
                            <div className="font-semibold text-slate-800 mt-0.5">
                              {promo.analytics?.redemptions || 0} / {promo.limits?.maxTotalUses || 'Unlimited'}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {promotionsList.length === 0 && (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                    <Tag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <h4 className="font-bold text-slate-800 text-sm">No promotions created yet</h4>
                    <p className="text-xs text-slate-500 mt-1">Click "+ Create Promotion" to launch your first marketing campaign.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 11. PAYMENTS & PAYOUTS TAB */}
          {activeTab === 'payments' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">Payments, Escrow & Payout Methods</h2>
                  <p className="text-xs text-slate-500">Configure where you receive released Lumo Escrow funds</p>
                </div>
                <button
                  onClick={() => setShowAddPaymentModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#ff6a00] text-white font-semibold text-xs cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Payment Method
                </button>
              </div>

              {/* Payout Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-xs">Available Balance</span>
                  <p className="text-2xl font-bold text-emerald-700 mt-1">{formatTZS(metrics.availableBalance)}</p>
                  <button 
                    onClick={() => setShowPayoutModal(true)}
                    className="mt-3 px-4 py-2 rounded-lg bg-[#ff6a00] text-white font-semibold text-xs cursor-pointer shadow-sm w-full"
                  >
                    Request Payout Now
                  </button>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-xs">Escrow Held Balance</span>
                  <p className="text-2xl font-bold text-[#ff6a00] mt-1">{formatTZS(metrics.pendingBalance)}</p>
                  <p className="text-xs text-slate-500 mt-1">Releases upon customer delivery confirmation</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-xs">Default Payout Method</span>
                  <p className="text-sm font-bold text-slate-900 mt-1">M-Pesa Mobile Wallet</p>
                  <p className="text-xs text-emerald-600 font-semibold mt-1">✓ Verified & Default</p>
                </div>
              </div>

              {/* Payment Methods Section */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <h3 className="font-bold text-slate-900 text-sm">Configured Payout Methods</h3>
                <div className="space-y-3">
                  {paymentMethodsList.map((pm) => (
                    <div key={pm.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{pm.provider}</span>
                          {pm.isDefault && (
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">DEFAULT</span>
                          )}
                          <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-semibold">{pm.type}</span>
                        </div>
                        <p className="text-slate-500 font-mono mt-1">{pm.details}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {!pm.isDefault && (
                          <button
                            onClick={() => {
                              setPaymentMethodsList(paymentMethodsList.map(m => ({ ...m, isDefault: m.id === pm.id })));
                              alert(`Default payout method updated to ${pm.provider}`);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold cursor-pointer"
                          >
                            Set as Default
                          </button>
                        )}
                        {!pm.isDefault && (
                          <button
                            onClick={() => {
                              if (confirm(`Remove ${pm.provider}?`)) {
                                setPaymentMethodsList(paymentMethodsList.filter(m => m.id !== pm.id));
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 12. KYC & COMPLIANCE TAB */}
          {activeTab === 'kyc' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in max-w-3xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">Seller Verification & Compliance</h2>
                  <p className="text-xs text-slate-500">BRELA registration, TRA TIN, and identity verification</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> VERIFIED
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400">Legal Business Name</span>
                    <input 
                      type="text" 
                      value={kycForm.legalName}
                      onChange={(e) => setKycForm({...kycForm, legalName: e.target.value})}
                      className="w-full mt-1 p-2 rounded-lg border border-slate-300 font-bold text-slate-900 bg-white"
                    />
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400">BRELA Registration Number</span>
                    <input 
                      type="text" 
                      value={kycForm.registrationNumber}
                      onChange={(e) => setKycForm({...kycForm, registrationNumber: e.target.value})}
                      className="w-full mt-1 p-2 rounded-lg border border-slate-300 font-bold text-slate-900 bg-white"
                    />
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400">TRA TIN Number</span>
                    <input 
                      type="text" 
                      value={kycForm.tinNumber}
                      onChange={(e) => setKycForm({...kycForm, tinNumber: e.target.value})}
                      className="w-full mt-1 p-2 rounded-lg border border-slate-300 font-bold text-slate-900 bg-white"
                    />
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400">National ID / Passport Number</span>
                    <input 
                      type="text" 
                      value={kycForm.idNumber}
                      onChange={(e) => setKycForm({...kycForm, idNumber: e.target.value})}
                      className="w-full mt-1 p-2 rounded-lg border border-slate-300 font-bold text-slate-900 bg-white"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="font-bold text-emerald-900">BRELA Certificate & Tax Clearance Uploaded</p>
                      <p className="text-[11px] text-emerald-700">Verified by LUMO Compliance Team on August 15, 2026</p>
                    </div>
                  </div>
                  <button 
                    onClick={async () => {
                      try {
                        const res = await api.submitSellerKYC({
                          legalName: kycForm.legalName,
                          tinNumber: kycForm.tinNumber,
                          status: 'APPROVED'
                        });
                        setKycData(res.kyc);
                        setKycFeedbackMsg('KYC documents re-submitted and verified successfully!');
                      } catch (err) {
                        setKycFeedbackMsg('KYC submission saved.');
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                  >
                    Replace / Update
                  </button>
                </div>

                <button 
                  onClick={async () => {
                    try {
                      const res = await api.submitSellerKYC({
                        legalName: kycForm.legalName,
                        tinNumber: kycForm.tinNumber,
                        status: 'APPROVED'
                      });
                      setKycData(res.kyc);
                      setKycFeedbackMsg('KYC compliance details saved successfully!');
                    } catch (err) {
                      setKycFeedbackMsg('KYC compliance details saved!');
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-[#ff6a00] hover:bg-[#ff6a00]/90 text-white font-bold cursor-pointer shadow-sm"
                >
                  Save & Submit Compliance
                </button>
              </div>
            </div>
          )}

            {/* 13. ADS & SPONSORED BOOST TAB (LOCKED - COMING SOON) */}
          {activeTab === 'ads_boost' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Hero Coming Soon Card */}
              <div className="bg-gradient-to-br from-purple-950 via-[#38006b] to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-purple-800">
                <div className="absolute -right-12 -top-12 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 space-y-6 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                      <Lock size={13} className="text-purple-300" />
                      <span>Coming Soon</span>
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                      LUMO Sponsored Ads & Boost Engine
                    </h2>
                    <p className="text-xs sm:text-sm text-purple-100 leading-relaxed font-normal">
                      Launch targeted search ads, place sponsored products on top homepage banners, and drive high-intent marketplace traffic directly to your store once advertising goes live.
                    </p>
                  </div>

                  {/* Feature Highlights Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-yellow-300">Sponsored Search Rankings</span>
                        <span className="text-[10px] font-mono text-purple-300 px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800">COMING SOON</span>
                      </div>
                      <p className="text-[11px] text-purple-200">Bid for top 3 positions in buyer search queries for target subcategories.</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-yellow-300">Homepage Feature Spotlight</span>
                        <span className="text-[10px] font-mono text-purple-300 px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800">COMING SOON</span>
                      </div>
                      <p className="text-[11px] text-purple-200">Feature store items directly inside the main marketplace Sponsored Deals slider.</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-yellow-300">Instant Wallet & USSD Billing</span>
                        <span className="text-[10px] font-mono text-purple-300 px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800">COMING SOON</span>
                      </div>
                      <p className="text-[11px] text-purple-200">Pay campaign budgets directly from seller balance or via mobile money USSD push.</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-yellow-300">Real-time Ad ROI Analytics</span>
                        <span className="text-[10px] font-mono text-purple-300 px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800">COMING SOON</span>
                      </div>
                      <p className="text-[11px] text-purple-200">Track click-through rates, conversion sales revenue, and return on ad spend (ROAS).</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setJoinedAdWaitlist(true)}
                      disabled={joinedAdWaitlist}
                      className={`px-6 py-3 rounded-xl font-bold text-xs shadow-lg transition cursor-pointer flex items-center gap-2 ${
                        joinedAdWaitlist
                          ? 'bg-emerald-500 text-white cursor-default'
                          : 'bg-yellow-400 hover:bg-yellow-300 text-slate-950'
                      }`}
                    >
                      {joinedAdWaitlist ? (
                        <>
                          <CheckCircle2 size={16} />
                          <span>Added to Advertising Priority Waitlist!</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} />
                          <span>Join Advertising Waitlist / Get Notified</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setActiveTab('promotions')}
                      className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition cursor-pointer flex items-center gap-2 border border-white/20"
                    >
                      <Tag size={15} />
                      <span>Use Active Vendor Promotions Instead</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Coming Soon Notice Card */}
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 text-purple-900 flex items-center gap-3.5 text-xs shadow-xs">
                <Sparkles className="w-5 h-5 text-[#38006b] shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-[#38006b]">Coming Soon</h4>
                  <p className="text-purple-800 text-xs mt-0.5">
                    Sponsored Ads and campaign management tools are currently in development and will be available soon.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 14. LIVE COMMERCE TAB */}
          {activeTab === 'live_commerce' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">LUMO Live Commerce Studio</h2>
                  <p className="text-xs text-slate-500">Broadcast live product unboxings to <strong className="text-[#ff6a00]">{(followersCount || 0).toLocaleString()} followers</strong></p>
                </div>
                <button
                  onClick={() => setShowLiveModal(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-white font-bold text-xs cursor-pointer flex items-center gap-2 shadow-md transition active:scale-95"
                >
                  <Radio className="w-4 h-4 animate-pulse" />
                  Go Live
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <span className="px-2.5 py-1 rounded bg-rose-600 text-white font-bold text-[10px] uppercase">Followers Reach</span>
                  <h3 className="text-2xl font-bold mt-2">{(followersCount || 0).toLocaleString()} Loyal Followers</h3>
                  <p className="text-xs text-slate-300 mt-1">Notify all followers instantly via push notification when you go live.</p>
                </div>
                <button
                  onClick={() => {
                    setFollowersCount(prev => prev + 1);
                    alert('Broadcast notification sent to all 3,420 followers!');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#ff6a00] hover:bg-[#ff6a00]/90 text-white font-semibold text-xs cursor-pointer shadow-sm"
                >
                  Broadcast Push to Followers
                </button>
              </div>
            </div>
          )}

          {/* 15. STORE SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in max-w-3xl">
              <h2 className="font-bold text-slate-900 text-lg">Store Profile & Logo Settings</h2>
              <div className="space-y-4 text-xs">
                {/* Store Icon upload strictly from device (link option removed) */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Store Icon / Logo (Upload from Device) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="w-16 h-16 rounded-2xl bg-white border-2 border-slate-300 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                      {storeLogoUrl ? (
                        <img src={storeLogoUrl} alt="Store Logo" className="w-full h-full object-cover" />
                      ) : (
                        <Store className="w-8 h-8 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs cursor-pointer shadow-xs transition">
                        <Upload size={14} className="text-[#FF6A00]" />
                        <span>Choose File from Device</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleStoreLogoUpload(file);
                            }
                          }}
                        />
                      </label>
                      <p className="text-[10px] text-slate-500">
                        Select an official square logo PNG or JPG from your phone or computer. The link URL option has been permanently removed.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Store Name</label>
                  <input 
                    type="text" 
                    value={storeName} 
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900" 
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Store Description</label>
                  <textarea 
                    rows={3} 
                    value={storeDescription} 
                    onChange={(e) => setStoreDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300" 
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Support Phone</label>
                    <input 
                      type="text" 
                      value={storePhone} 
                      onChange={(e) => setStorePhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300" 
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Support Email</label>
                    <input 
                      type="email" 
                      value={storeEmail} 
                      onChange={(e) => setStoreEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300" 
                    />
                  </div>
                </div>

                <button 
                  onClick={async () => {
                    try {
                      await api.updateStoreProfile({
                        sellerId,
                        storeName,
                        storeDescription,
                        storeLogo: storeLogoUrl,
                        storePhone,
                        storeEmail,
                        storeAddress
                      });
                      alert('Store settings and logo saved successfully!');
                    } catch (e) {
                      alert('Store profile updated in session.');
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#ff6a00] text-white font-bold cursor-pointer shadow-sm text-xs"
                >
                  Save Store Profile
                </button>
              </div>
            </div>
          )}

          {/* 15. NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in max-w-4xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
                <div>
                  <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                    <Bell className="w-5 h-5 text-[#ff6a00]" />
                    Vendor Notification & Operational Alerts
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tap any notification to view detailed order payloads, escrow status, payout vouchers, or restock alerts.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setNotificationsList(notificationsList.map(n => ({ ...n, read: true })))} 
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Mark All as Read
                  </button>
                </div>
              </div>

              {/* Notification Category Filters */}
              <div className="flex flex-wrap items-center gap-2 pb-2">
                {[
                  { id: 'ALL', label: 'All Notices', count: notificationsList.length },
                  { id: 'order', label: 'Orders', count: notificationsList.filter(n => n.type === 'order').length },
                  { id: 'finance', label: 'Payouts & Escrow', count: notificationsList.filter(n => n.type === 'finance').length },
                  { id: 'inventory', label: 'Stock Warnings', count: notificationsList.filter(n => n.type === 'inventory').length },
                  { id: 'review', label: 'Customer Reviews', count: notificationsList.filter(n => n.type === 'review').length },
                  { id: 'policy', label: 'Official Bulletins', count: notificationsList.filter(n => n.type === 'policy').length }
                ].map(filter => {
                  const isSelected = notificationCategoryFilter === filter.id;
                  return (
                    <button
                      key={filter.id}
                      onClick={() => setNotificationCategoryFilter(filter.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#ff6a00] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    >
                      <span>{filter.label}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        {filter.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Notification Cards List */}
              <div className="space-y-3">
                {notificationsList
                  .filter(n => notificationCategoryFilter === 'ALL' || n.type === notificationCategoryFilter)
                  .map((n) => {
                    const isOrder = n.type === 'order';
                    const isFinance = n.type === 'finance';
                    const isInventory = n.type === 'inventory';
                    const isReview = n.type === 'review';

                    return (
                      <div
                        key={n.id}
                        onClick={() => {
                          setNotificationsList(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
                          setSelectedNotification(n);
                        }}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          n.read
                            ? 'bg-white border-slate-200 hover:border-[#ff6a00]/40 hover:bg-slate-50/70'
                            : 'bg-orange-50/40 border-orange-200/90 shadow-xs hover:border-[#ff6a00]'
                        }`}
                      >
                        <div className="flex items-start gap-3.5 flex-1 min-w-0">
                          <div className={`p-2.5 rounded-xl shrink-0 ${
                            isOrder ? 'bg-orange-100 text-[#ff6a00]' :
                            isFinance ? 'bg-emerald-100 text-emerald-700' :
                            isInventory ? 'bg-amber-100 text-amber-700' :
                            isReview ? 'bg-purple-100 text-purple-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {isOrder && <ShoppingBag className="w-5 h-5" />}
                            {isFinance && <DollarSign className="w-5 h-5" />}
                            {isInventory && <AlertTriangle className="w-5 h-5" />}
                            {isReview && <Star className="w-5 h-5" />}
                            {!isOrder && !isFinance && !isInventory && !isReview && <Bell className="w-5 h-5" />}
                          </div>

                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs font-bold ${n.read ? 'text-slate-800' : 'text-slate-950'}`}>
                                {n.title}
                              </span>
                              {!n.read && (
                                <span className="w-2 h-2 rounded-full bg-[#ff6a00] shrink-0" />
                              )}
                              {n.priority === 'high' && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                                  Action Required
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400">
                                • {n.time}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 line-clamp-2">
                              {n.summary}
                            </p>

                            <div className="pt-1 flex items-center gap-2 text-[11px] font-semibold text-[#ff6a00]">
                              <span>Tap for full details & quick actions</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 flex sm:flex-col items-end justify-between sm:justify-center gap-1 text-[11px]">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                            isOrder ? 'bg-orange-100 text-[#ff6a00]' :
                            isFinance ? 'bg-emerald-100 text-emerald-800' :
                            isInventory ? 'bg-amber-100 text-amber-800' :
                            isReview ? 'bg-purple-100 text-purple-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {n.type}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* 16. HELP & SUPPORT */}
          {activeTab === 'support' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in max-w-3xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">Seller Help & Support Center</h2>
                  <p className="text-xs text-slate-500">Submit merchant support tickets and view FAQs</p>
                </div>
                <button
                  onClick={() => setShowTicketModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#ff6a00] text-white font-semibold text-xs cursor-pointer shadow-sm"
                >
                  + Create Support Ticket
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 text-sm">Active Support Tickets</h3>
                <div className="space-y-3">
                  {supportTicketsList.map((tkt) => (
                    <div key={tkt.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">#{tkt.id} • {tkt.subject}</span>
                        <span className={`px-2 py-0.5 rounded font-bold ${tkt.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {tkt.status}
                        </span>
                      </div>
                      <p className="text-slate-600">{tkt.lastMessage}</p>
                      <span className="text-[10px] text-slate-400">Category: {tkt?.category} • Date: {tkt.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* NOTIFICATION DETAILS MODAL */}
      {selectedNotification && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 gap-3">
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl shrink-0 ${
                  selectedNotification.type === 'order' ? 'bg-orange-100 text-[#ff6a00]' :
                  selectedNotification.type === 'finance' ? 'bg-emerald-100 text-emerald-700' :
                  selectedNotification.type === 'inventory' ? 'bg-amber-100 text-amber-700' :
                  selectedNotification.type === 'review' ? 'bg-purple-100 text-purple-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {selectedNotification.type === 'order' && <ShoppingBag className="w-6 h-6" />}
                  {selectedNotification.type === 'finance' && <DollarSign className="w-6 h-6" />}
                  {selectedNotification.type === 'inventory' && <AlertTriangle className="w-6 h-6" />}
                  {selectedNotification.type === 'review' && <Star className="w-6 h-6" />}
                  {selectedNotification.type === 'policy' && <Bell className="w-6 h-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                      {selectedNotification.type}
                    </span>
                    {selectedNotification.priority === 'high' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                        High Priority
                      </span>
                    )}
                    <span className="text-xs text-slate-400">{selectedNotification.time}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mt-1">{selectedNotification.title}</h3>
                </div>
              </div>
              <button 
                onClick={() => setSelectedNotification(null)} 
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Summary description */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
              {selectedNotification.summary}
            </div>

            {/* PAYLOAD 1: ORDER DATA */}
            {selectedNotification.orderData && (
              <div className="space-y-4 text-xs">
                {/* Customer & Delivery Details */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-slate-500" />
                      Order Details & Delivery Destination
                    </h4>
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-slate-800 bg-white border border-slate-200">
                      #{selectedNotification.orderData.orderNumber}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Customer Name:</span>
                      <strong className="text-slate-900">{selectedNotification.orderData.customerName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Customer Phone:</span>
                      <strong className="text-slate-900">{selectedNotification.orderData.customerPhone}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Delivery Type:</span>
                      <span className="font-semibold text-emerald-700">{selectedNotification.orderData.deliveryType}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Payment Status:</span>
                      <span className="font-semibold text-orange-600">{selectedNotification.orderData.paymentStatus}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-400 block text-[11px]">Drop-off Address:</span>
                      <strong className="text-slate-900">{selectedNotification.orderData.deliveryAddress}</strong>
                    </div>
                  </div>
                </div>

                {/* Escrow Guarantee Pill */}
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-emerald-900">
                    <strong>Payment Protected in LUMO Escrow:</strong> {selectedNotification.orderData.escrowStatus}
                  </div>
                </div>

                {/* Ordered Line Items */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-3.5 py-2 font-bold text-slate-700 text-[11px] border-b border-slate-200">
                    Items Included in This Order
                  </div>
                  <div className="divide-y divide-slate-100 p-2">
                    {selectedNotification.orderData.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2 gap-3">
                        <div className="flex items-center gap-3">
                          <img 
                            src={item.image} 
                            alt={item.title} 
                            className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0" 
                          />
                          <div>
                            <p className="font-bold text-slate-900">{item.title}</p>
                            <p className="text-[11px] text-slate-400">Qty: {item.quantity} × {formatTZS(item.price)}</p>
                          </div>
                        </div>
                        <span className="font-bold text-slate-900 shrink-0">
                          {formatTZS(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-slate-50 p-3 border-t border-slate-200 flex items-center justify-between font-bold text-slate-900">
                    <span>Order Total:</span>
                    <span className="text-sm text-[#ff6a00]">{formatTZS(selectedNotification.orderData.total)}</span>
                  </div>
                </div>

                {/* Instructions */}
                <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-[11px] text-orange-900">
                  <strong>Action Required:</strong> {selectedNotification.orderData.actionRequired}
                </div>
              </div>
            )}

            {/* PAYLOAD 2: FINANCE DATA */}
            {selectedNotification.financeData && (
              <div className="space-y-4 text-xs">
                <div className="p-5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-center space-y-1">
                  <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
                    Settlement Disbursed
                  </span>
                  <p className="text-3xl font-black text-emerald-800 tracking-tight">
                    {formatTZS(selectedNotification.financeData.amount)}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-mono">
                    Ref: {selectedNotification.financeData.reference}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Payout Channel:</span>
                    <strong>{selectedNotification.financeData.channel}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Recipient Account:</span>
                    <strong>{selectedNotification.financeData.recipient}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Processing Timestamp:</span>
                    <span>{selectedNotification.financeData.dateProcessed}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <span className="text-slate-500">Status:</span>
                    <span className="px-2 py-0.5 rounded font-bold text-emerald-700 bg-emerald-100">
                      {selectedNotification.financeData.status}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* PAYLOAD 3: INVENTORY DATA */}
            {selectedNotification.inventoryData && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center gap-3.5 p-4 rounded-xl bg-amber-50/70 border border-amber-200">
                  <img 
                    src={selectedNotification.inventoryData.image} 
                    alt={selectedNotification.inventoryData.productName} 
                    className="w-16 h-16 object-cover rounded-xl border border-amber-300 shrink-0" 
                  />
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-sm">{selectedNotification.inventoryData.productName}</h4>
                    <p className="text-[11px] text-slate-500 font-mono">SKU: {selectedNotification.inventoryData.sku}</p>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-bold text-rose-700 bg-rose-100">
                        {selectedNotification.inventoryData.unitsLeft} units left
                      </span>
                      <span className="text-[11px] text-slate-500">
                        (Reorder threshold: {selectedNotification.inventoryData.reorderLevel})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 space-y-1">
                  <p><strong>Recommended Restock Quantity:</strong> {selectedNotification.inventoryData.recommendedRestock} units</p>
                  <p className="text-[11px] text-slate-500">
                    Items falling below 2 units are automatically deprioritized in buyer search results to prevent stockouts.
                  </p>
                </div>
              </div>
            )}

            {/* PAYLOAD 4: REVIEW DATA */}
            {selectedNotification.reviewData && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{selectedNotification.reviewData.customerName}</span>
                      <p className="text-[11px] text-slate-500">{selectedNotification.reviewData.productName} • {selectedNotification.reviewData.date}</p>
                    </div>
                    <div className="flex items-center text-amber-500">
                      {[...Array(selectedNotification.reviewData.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <blockquote className="p-3 rounded-lg bg-white border border-purple-100 text-slate-700 italic">
                    "{selectedNotification.reviewData.comment}"
                  </blockquote>
                </div>
              </div>
            )}

            {/* PAYLOAD 5: POLICY DATA */}
            {selectedNotification.policyData && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-2">
                  <span className="font-bold text-blue-900 text-sm block">
                    {selectedNotification.policyData.noticeType}
                  </span>
                  <p className="text-slate-700 leading-relaxed">
                    {selectedNotification.policyData.details}
                  </p>
                  <div className="pt-2 border-t border-blue-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Effective Window:</span>
                    <strong className="text-blue-900">{selectedNotification.policyData.effectiveDate}</strong>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px]">
                  <strong>Action Required:</strong> {selectedNotification.policyData.actionRequired}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedNotification(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {selectedNotification.type === 'order' && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedNotification(null);
                        setActiveTab('orders');
                      }}
                      className="px-4 py-2 rounded-xl bg-[#ff6a00] text-white font-bold text-xs hover:bg-[#e55f00] cursor-pointer shadow-xs"
                    >
                      Open Orders Hub
                    </button>
                  </>
                )}

                {selectedNotification.type === 'finance' && (
                  <button
                    onClick={() => {
                      setSelectedNotification(null);
                      setActiveTab('earnings');
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 cursor-pointer shadow-xs"
                  >
                    View Earnings & Settlements
                  </button>
                )}

                {selectedNotification.type === 'inventory' && (
                  <button
                    onClick={() => {
                      setSelectedNotification(null);
                      setActiveTab('inventory');
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 cursor-pointer shadow-xs"
                  >
                    Manage Inventory & Restock
                  </button>
                )}

                {selectedNotification.type === 'review' && (
                  <button
                    onClick={() => {
                      setSelectedNotification(null);
                      setActiveTab('reviews');
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 cursor-pointer shadow-xs"
                  >
                    View & Reply to Reviews
                  </button>
                )}

                {selectedNotification.type === 'policy' && (
                  <button
                    onClick={() => {
                      setSelectedNotification(null);
                      setActiveTab('promotions');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#ff6a00] text-white font-bold text-xs hover:bg-[#e55f00] cursor-pointer shadow-xs"
                  >
                    Explore Promotions Hub
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-lg">Order #{selectedOrder.orderNumber}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-[#ff6a00]">
                  {selectedOrder.status}
                </span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Customer Info */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Customer & Delivery Information</h4>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div><span className="text-slate-400 block">Name:</span> <strong>{selectedOrder.customer.name}</strong></div>
                  <div><span className="text-slate-400 block">Phone:</span> <strong>{selectedOrder.customer.phone}</strong></div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block">Delivery Address:</span> 
                    <strong>{selectedOrder.deliveryAddress?.street}, {selectedOrder.deliveryAddress?.area}, {selectedOrder.deliveryAddress?.city}</strong>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Ordered Items</h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between bg-white">
                      <div className="flex items-center gap-3">
                        <img src={item.thumbnail} alt={item.name} className="w-10 h-10 rounded object-cover border" />
                        <div>
                          <p className="font-bold text-slate-900">{item.name}</p>
                          <p className="text-slate-500">Qty: {item.quantity} × {formatTZS(item.price)}</p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900">{formatTZS(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment & Escrow Status */}
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-900 block">Lumo Escrow Payment Secured</span>
                  <p className="text-[11px] text-emerald-700">Funds held securely in escrow. Releases to seller upon OTP delivery confirmation.</p>
                </div>
                <span className="text-base font-bold text-emerald-800">{formatTZS(selectedOrder.pricing?.total || 0)}</span>
              </div>

              {/* Actions */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Print / PDF
                </button>
                {['New', 'Processing', 'Pending', 'PLANTED'].includes(selectedOrder.status) && (
                  <button
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'Confirmed')}
                    className="px-5 py-2 rounded-xl bg-[#ff6a00] hover:bg-[#ff6a00]/90 text-white font-bold cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" /> Accept Order
                  </button>
                )}
                {selectedOrder.status === 'Confirmed' && (
                  <button
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'Preparing')}
                    className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    <Clock className="w-4 h-4" /> Start Preparing
                  </button>
                )}
                {selectedOrder.status === 'Preparing' && (
                  <button
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'Ready for Pickup')}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    <Package className="w-4 h-4" /> Mark Ready for Pickup
                  </button>
                )}
                {['Ready for Pickup', 'Dispatched', 'In Transit', 'Delivered'].includes(selectedOrder.status) && (
                  <span className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200 flex items-center gap-1.5">
                    <Truck className="w-4 h-4" /> Status: {selectedOrder.status}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD PAYMENT METHOD MODAL */}
      {showAddPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Add Payout Method</h3>
              <button onClick={() => setShowAddPaymentModal(false)} className="text-slate-400 hover:bg-slate-100 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Provider Type</label>
                <select
                  value={newPaymentType}
                  onChange={(e) => setNewPaymentType(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="MOBILE_MONEY">Mobile Money (M-Pesa / Tigo Pesa / Airtel Money)</option>
                  <option value="BANK_TRANSFER">Bank Account (CRDB / NMB / NBC)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Provider Name</label>
                <input
                  type="text"
                  value={newPaymentProvider}
                  onChange={(e) => setNewPaymentProvider(e.target.value)}
                  placeholder="e.g. M-Pesa or CRDB Bank"
                  className="w-full p-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Account Number / Phone Number</label>
                <input
                  type="text"
                  value={newPaymentDetails}
                  onChange={(e) => setNewPaymentDetails(e.target.value)}
                  placeholder="+255 754 *** *** or Account #"
                  className="w-full p-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowAddPaymentModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!newPaymentDetails) return;
                    setPaymentMethodsList([
                      ...paymentMethodsList,
                      {
                        id: `pm-${Date.now()}`,
                        type: newPaymentType,
                        provider: newPaymentProvider,
                        details: newPaymentDetails,
                        isDefault: paymentMethodsList.length === 0,
                        verified: true
                      }
                    ]);
                    setShowAddPaymentModal(false);
                    setNewPaymentDetails('');
                    alert('New payout method successfully verified and added!');
                  }}
                  className="px-5 py-2 rounded-xl bg-[#ff6a00] text-white font-bold cursor-pointer"
                >
                  Verify & Save Method
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE SUPPORT TICKET MODAL */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Create Merchant Support Ticket</h3>
              <button onClick={() => setShowTicketModal(false)} className="text-slate-400 hover:bg-slate-100 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Category</label>
                <select
                  value={newTicketCat}
                  onChange={(e) => setNewTicketCat(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="Escrow & Payouts">Escrow & Payouts</option>
                  <option value="Orders & Logistics">Orders & Logistics</option>
                  <option value="KYC Compliance">KYC Compliance</option>
                  <option value="Store Verification">Store Verification</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Subject</label>
                <input
                  type="text"
                  value={newTicketSub}
                  onChange={(e) => setNewTicketSub(e.target.value)}
                  placeholder="Brief title of your request..."
                  className="w-full p-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newTicketDesc}
                  onChange={(e) => setNewTicketDesc(e.target.value)}
                  placeholder="Describe your issue or request in detail..."
                  className="w-full p-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowTicketModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!newTicketSub || !newTicketDesc) return;
                    setSupportTicketsList([
                      {
                        id: `tkt-${Math.floor(100 + (window.crypto.getRandomValues(new Uint32Array(1))[0] % 900))}`,
                        category: newTicketCat,
                        subject: newTicketSub,
                        status: 'In Progress',
                        date: new Date().toISOString().split('T')[0],
                        lastMessage: newTicketDesc
                      },
                      ...supportTicketsList
                    ]);
                    setShowTicketModal(false);
                    setNewTicketSub('');
                    setNewTicketDesc('');
                    alert('Support ticket submitted successfully. Our merchant support team will respond within 2 hours.');
                  }}
                  className="px-5 py-2 rounded-xl bg-[#ff6a00] text-white font-bold cursor-pointer"
                >
                  Submit Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD PRODUCT MODAL WITH IMAGE UPLOAD OR GALLERY SELECTOR */}
      {showAddProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">Add New Product to Store Catalog</h3>
              <button onClick={() => setShowAddProduct(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="e.g. Samsung Galaxy S24 Ultra 5G"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#ff6a00] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Platform Category</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => {
                      const catName = e.target.value;
                      setNewProdCategory(catName);
                      const master = MASTER_CATEGORY_SUBCATEGORIES.find(c => c.name.toLowerCase() === catName.toLowerCase());
                      if (master && master.subcategories.length > 0) {
                        setNewProdSubcategory(master.subcategories[0]);
                      } else {
                        const found = catalogCategories.find(c => c.name === catName);
                        if (found && found.subcategories?.length > 0) {
                          setNewProdSubcategory(typeof found.subcategories[0] === 'string' ? found.subcategories[0] : found.subcategories[0].name);
                        }
                      }
                      setNewProdBrand(''); // Reset brand on category change
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    {MASTER_CATEGORY_SUBCATEGORIES.map((cat) => (
                      <option key={cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                    {catalogCategories.filter(c => !MASTER_CATEGORY_SUBCATEGORIES.some(m => m.name.toLowerCase() === c.name.toLowerCase())).map((cat) => (
                      <option key={cat.id || cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Subcategory <span className="text-[#ff6a00] text-[10px] font-bold">(All Subcategories Available)</span></label>
                  <select
                    value={newProdSubcategory}
                    onChange={(e) => {
                      const subName = e.target.value;
                      setNewProdSubcategory(subName);
                      // Auto-select parent category
                      const parentMaster = MASTER_CATEGORY_SUBCATEGORIES.find(c => 
                        c.subcategories.includes(subName)
                      );
                      if (parentMaster) {
                        setNewProdCategory(parentMaster.name);
                      } else {
                        const parentCat = catalogCategories.find(c => 
                          (c.subcategories || []).some((s: any) => (typeof s === 'string' ? s : s.name) === subName)
                        );
                        if (parentCat) {
                          setNewProdCategory(parentCat.name);
                        }
                      }
                      setNewProdBrand(''); // Reset brand on subcategory change
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="" disabled>Select a Subcategory</option>
                    {MASTER_CATEGORY_SUBCATEGORIES.map((cat) => (
                      <optgroup key={cat.name} label={`── ${cat.name} ──`}>
                        {cat.subcategories.map((subName) => (
                          <option key={subName} value={subName}>
                            {subName}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                    {catalogCategories
                      .filter(c => !MASTER_CATEGORY_SUBCATEGORIES.some(m => m.name.toLowerCase() === c.name.toLowerCase()))
                      .map((cat) => (
                        <optgroup key={cat.id || cat.name} label={`── ${cat.name} ──`}>
                          {(cat.subcategories || []).map((sub: any) => {
                            const subName = typeof sub === 'string' ? sub : sub.name;
                            return (
                              <option key={subName} value={subName}>
                                {subName}
                              </option>
                            );
                          })}
                        </optgroup>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Brand <span className="text-red-500">*</span></label>
                  <select
                    required
                    value={newProdBrand}
                    onChange={(e) => setNewProdBrand(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="" disabled>Select a Brand</option>
                    {getBrandsForSubcategory(newProdCategory, newProdSubcategory).map((brandName) => (
                      <option key={brandName} value={brandName}>{brandName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Condition <span className="text-red-500">*</span></label>
                  <select
                    required
                    value={newProdCondition}
                    onChange={(e) => setNewProdCondition(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="New">New</option>
                    <option value="Refurbished">Refurbished</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Price (TZS)</label>
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    placeholder="1850000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Initial Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Product Description</label>
                <textarea
                  rows={3}
                  value={newProdDescription}
                  onChange={(e) => setNewProdDescription(e.target.value)}
                  placeholder="Provide key features, technical specifications, and box contents..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#ff6a00] focus:outline-none"
                />
              </div>

              {/* WARRANTY DROPDOWNS (MANDATORY) */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Product Warranty Specification <span className="text-red-500">*</span></span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Has Warranty Period?</label>
                    <select
                      required
                      value={newProdHasWarranty}
                      onChange={(e) => setNewProdHasWarranty(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="" disabled>-- Select Warranty Option --</option>
                      <option value="yes">Yes (Product has Official Warranty)</option>
                      <option value="no">No (No Warranty)</option>
                    </select>
                  </div>
                  {newProdHasWarranty === 'yes' && (
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Warranty Duration</label>
                      <select
                        value={newProdWarrantyDuration}
                        onChange={(e) => setNewProdWarrantyDuration(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                      >
                        <option value="1 Month">1 Month</option>
                        <option value="3 Months">3 Months</option>
                        <option value="6 Months">6 Months</option>
                        <option value="1 Year">1 Year (12 Months)</option>
                        <option value="2 Years">2 Years (24 Months)</option>
                        <option value="3 Years">3 Years</option>
                        <option value="5 Years">5 Years</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* PROMOTION SPECIFICATION */}
              <div className="p-3.5 rounded-xl bg-orange-50/60 border border-orange-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#ff6a00]" />
                    <span className="font-bold text-slate-900">List Under Active Promotion / Sale</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newProdIsPromo}
                      onChange={(e) => setNewProdIsPromo(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#ff6a00]"></div>
                  </label>
                </div>
                {newProdIsPromo && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Original Retail Price (TZS)</label>
                      <input
                        type="number"
                        value={newProdOriginalPrice}
                        onChange={(e) => setNewProdOriginalPrice(e.target.value)}
                        placeholder="e.g. 2100000"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                      />
                    </div>
                    <div className="flex items-end">
                      <p className="text-[11px] text-orange-800 pb-2">
                        Promotional discount tag will be automatically calculated and displayed on the customer storefront.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* PRODUCT IMAGE SELECTION */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700">Product Image (Gallery or Device Upload)</label>
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px]">
                    <button
                      type="button"
                      onClick={() => setImageSelectMode('gallery')}
                      className={`px-2.5 py-1 rounded font-semibold cursor-pointer ${imageSelectMode === 'gallery' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
                    >
                      Use Uploaded Gallery
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageSelectMode('upload')}
                      className={`px-2.5 py-1 rounded font-semibold cursor-pointer ${imageSelectMode === 'upload' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
                    >
                      Upload from Device
                    </button>
                  </div>
                </div>

                {imageSelectMode === 'gallery' ? (
                  <div className="grid grid-cols-5 gap-2 pt-1">
                    {uploadedGalleryMedia.map((url, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => setSelectedProductImage(url)}
                        className={`relative rounded-xl overflow-hidden aspect-square border-2 cursor-pointer transition ${
                          selectedProductImage === url ? 'border-[#ff6a00] ring-2 ring-[#ff6a00]/30' : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                        {selectedProductImage === url && (
                          <div className="absolute inset-0 bg-[#ff6a00]/20 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-white drop-shadow" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-[#ff6a00] bg-slate-50 transition">
                      <Camera className="w-8 h-8 text-slate-400 mb-1.5" />
                      <span className="font-semibold text-slate-700 text-xs">Click to browse image from device</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WEBP</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (uploadEvent) => {
                              const res = uploadEvent.target?.result as string;
                              if (res) {
                                setSelectedProductImage(res);
                                if (!uploadedGalleryMedia.includes(res)) {
                                  setUploadedGalleryMedia([res, ...uploadedGalleryMedia]);
                                }
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <div className="flex items-center gap-3">
                      <img src={selectedProductImage} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-slate-200" />
                      <span className="text-[11px] text-slate-500">Selected product image preview</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#ff6a00] hover:bg-[#ff6a00]/90 text-white font-bold cursor-pointer shadow-sm"
                >
                  Publish Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAYOUT REQUEST MODAL */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Request Instant Escrow Payout</h3>
              <button onClick={() => setShowPayoutModal(false)} className="text-slate-400 hover:bg-slate-100 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestPayout} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Withdrawal Amount (TZS)</label>
                <input
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900"
                />
                <p className="text-[10px] text-slate-400 mt-1">Available balance: {formatTZS(metrics.availableBalance)}</p>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Payout Destination</label>
                <select 
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="MOBILE_MONEY">M-Pesa / Tigo Pesa Mobile Wallet</option>
                  <option value="BANK_TRANSFER">CRDB Bank Business Account</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Recipient Account / Phone</label>
                <input
                  type="text"
                  value={payoutRecipient}
                  onChange={(e) => setPayoutRecipient(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              {payoutSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
                  {payoutSuccessMsg}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#ff6a00] text-white font-bold shadow-sm cursor-pointer"
                >
                  Confirm Payout Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIVE STREAMING CREATOR STUDIO MODAL */}
      <SellerLiveStudioModal
        isOpen={showLiveModal}
        onClose={() => setShowLiveModal(false)}
        sellerId={user?.id || 'sl-101'}
        storeName={storeName || 'Swahili Tech Hub'}
        storeLogo={storeLogoUrl}
        sellerProducts={productsList}
        onSessionEnded={() => setShowLiveModal(false)}
      />

      {/* STOCK PDF CATALOG MODAL */}
      {showStockModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Export Stock & Inventory PDF</h3>
              <button onClick={() => setShowStockModal(false)} className="text-slate-400 hover:bg-slate-100 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Download or print your verified inventory sheet with barcode SKUs, wholesale cost prices, and warehouse locations.
            </p>
            <button
              onClick={() => {
                alert('Stock PDF Catalog downloaded successfully!');
                setShowStockModal(false);
              }}
              className="w-full py-2.5 rounded-xl bg-[#ff6a00] text-white font-bold text-xs cursor-pointer shadow-sm"
            >
              Download PDF Report
            </button>
          </div>
        </div>
      )}

      {/* MEDIA UPLOAD MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Upload Store Media</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:bg-slate-100 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadImage} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Image URL or File</label>
                <input
                  type="text"
                  value={uploadedImagePreview || ''}
                  onChange={(e) => setUploadedImagePreview(e.target.value)}
                  placeholder="Paste image URL (e.g. Unsplash CDN)..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              {uploadSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
                  {uploadSuccessMsg}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#ff6a00] text-white font-bold shadow-sm cursor-pointer"
                >
                  Upload & Sync
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE PROMOTION BUILDER MODAL */}
      <CreatePromotionModal
        isOpen={showPromoModal}
        onClose={() => setShowPromoModal(false)}
        onPromotionCreated={(newPromo) => {
          setPromotionsList([newPromo, ...promotionsList]);
        }}
        vendorProducts={productsList}
        sellerId={sellerId}
      />

      {/* PROMOTION ANALYTICS REPORT MODAL */}
      <PromotionAnalyticsModal
        isOpen={showAnalyticsModal}
        onClose={() => {
          setShowAnalyticsModal(false);
          setSelectedPromoForAnalytics(null);
        }}
        promotion={selectedPromoForAnalytics}
      />

      {/* PRODUCT ANALYTICS POPUP MODAL */}
      {showProductAnalyticsModal && selectedProductForAnalytics && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img 
                  src={selectedProductForAnalytics.thumbnail || selectedProductForAnalytics.images?.[0]} 
                  alt={selectedProductForAnalytics.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-base line-clamp-1">{selectedProductForAnalytics.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">SKU: LM-{selectedProductForAnalytics.id.slice(-4)} • Price: {formatTZS(selectedProductForAnalytics.price)}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowProductAnalyticsModal(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Reach</span>
                <div className="text-xl font-black text-slate-900 mt-1">14,820</div>
                <span className="text-[10px] text-emerald-600 font-semibold">+18.4% this week</span>
              </div>
              <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200">
                <span className="text-[11px] font-semibold text-orange-800 uppercase">Interactions</span>
                <div className="text-xl font-black text-orange-950 mt-1">1,240</div>
                <span className="text-[10px] text-orange-600 font-semibold">Clicks, Cart & Wishlist</span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                <span className="text-[11px] font-semibold text-emerald-800 uppercase">Conversion Rate</span>
                <div className="text-xl font-black text-emerald-950 mt-1">4.8%</div>
                <span className="text-[10px] text-emerald-600 font-semibold">Above category average</span>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200">
                <span className="text-[11px] font-semibold text-blue-800 uppercase">Total Revenue</span>
                <div className="text-xl font-black text-blue-950 mt-1">{formatTZS((selectedProductForAnalytics.price || 50000) * (selectedProductForAnalytics.soldCount || 12))}</div>
                <span className="text-[10px] text-blue-600 font-semibold">{selectedProductForAnalytics.soldCount || 12} units sold</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-amber-400">Lumo Growth & Performance Insights</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                This product is performing strongly in the <strong className="text-white">{selectedProductForAnalytics.category || 'general'}</strong> category. To boost your reach by another 40%, consider adding a 10% promotional discount or joining the upcoming Lumo Flash Sale event.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowProductAnalyticsModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
              >
                Close Analytics
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STOCK ADJUSTMENT MODAL */}
      {showStockAdjustModal && stockModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Quick Stock Restock / Adjustment</h3>
                <p className="text-[11px] text-slate-500">{stockModalProduct.name}</p>
              </div>
              <button 
                onClick={() => {
                  setShowStockAdjustModal(false);
                  setStockModalProduct(null);
                }} 
                className="text-slate-400 hover:bg-slate-100 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">Current Live Stock</span>
                <p className="text-xl font-black text-slate-900">{stockModalProduct.stock || 0} units</p>
              </div>
              <img
                src={stockModalProduct.thumbnail || stockModalProduct.images?.[0] || 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=200'}
                alt={stockModalProduct.name}
                className="w-12 h-12 rounded-lg object-cover border border-slate-200"
              />
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Quantity to Add (or Subtract with -)</label>
                <input
                  type="number"
                  required
                  value={stockAdjustQty}
                  onChange={(e) => setStockAdjustQty(e.target.value)}
                  placeholder="e.g. 25"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-base focus:ring-2 focus:ring-[#ff6a00] focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Resulting Stock after sync: <strong className="text-slate-900">{Math.max(0, Number(stockModalProduct.stock || 0) + Number(stockAdjustQty || 0))} units</strong>
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowStockAdjustModal(false);
                    setStockModalProduct(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStock}
                  className="px-5 py-2 rounded-xl bg-[#ff6a00] hover:bg-[#ff6a00]/90 text-white font-bold cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  {isUpdatingStock ? 'Updating...' : 'Confirm Stock Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DENY / REJECT ORDER MODAL */}
      {showDenyModal && (denyTargetOrder || selectedOrder) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-rose-600 text-base flex items-center gap-1.5">
                  <XCircle className="w-5 h-5" /> Deny / Reject Order
                </h3>
                <p className="text-[11px] text-slate-500">
                  Order #{(denyTargetOrder || selectedOrder)?.orderNumber || (denyTargetOrder || selectedOrder)?.id}
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowDenyModal(false);
                  setDenyTargetOrder(null);
                }} 
                className="text-slate-400 hover:bg-slate-100 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
              <strong className="block font-bold">Important Escrow Notice:</strong>
              <p>Denying this order immediately releases held escrow funds back to the buyer, notifies customer support, and logs a merchant exception event.</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Reason for Rejection</label>
                <select 
                  value={denyReasonOption}
                  onChange={(e) => setDenyReasonOption(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium bg-white"
                >
                  <option value="Out of Stock / Inventory Shortage">Out of Stock / Inventory Shortage</option>
                  <option value="Pricing / Listing Discrepancy">Pricing / Listing Discrepancy</option>
                  <option value="Item Damaged / Inspection Failed">Item Damaged / Inspection Failed</option>
                  <option value="Delivery Address Outside Merchant Area">Delivery Address Outside Merchant Area</option>
                  <option value="Customer Cancellation Request">Customer Cancellation Request</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Additional Note (Optional)</label>
                <textarea
                  value={denyCustomNote}
                  onChange={(e) => setDenyCustomNote(e.target.value)}
                  placeholder="Add details for buyer and operations tower..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs h-20 resize-none focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowDenyModal(false);
                  setDenyTargetOrder(null);
                }}
                className="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetId = (denyTargetOrder || selectedOrder)?.id;
                  if (targetId) {
                    const fullReason = `${denyReasonOption}${denyCustomNote ? `: ${denyCustomNote}` : ''}`;
                    handleDenyOrder(targetId, fullReason);
                  }
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" /> Confirm Order Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USSD Modal for Seller Ad Boost & Wallet Funding */}
      <UssdPaymentModal
        isOpen={showUssdBoostModal}
        onClose={() => setShowUssdBoostModal(false)}
        amount={adSelectedPlan === '7days' ? 25000 : adSelectedPlan === '14days' ? 45000 : 85000}
        payerPhone={user?.phone || '+255 754 112 233'}
        payerName={storeName || user?.name || 'Lumo Merchant'}
        payerType="SELLER"
        provider="M-Pesa (Vodacom)"
        referenceType="SELLER_AD_BOOST"
        referenceId={adSelectedProductId || 'SELLER-AD-WALLET'}
        description={`Sponsored Ad Placement Campaign (${adSelectedPlan}) for ${storeName}`}
        onSuccess={async () => {
          setShowUssdBoostModal(false);
          const durationDays = adSelectedPlan === '7days' ? 7 : adSelectedPlan === '14days' ? 14 : 30;
          const budget = adSelectedPlan === '7days' ? 25000 : adSelectedPlan === '14days' ? 45000 : 85000;
          await api.boostProduct({
            productId: adSelectedProductId,
            sellerId,
            durationDays,
            budget
          });
          setAdSuccessMsg(`Payment confirmed via USSD! Product boosted successfully for ${durationDays} days.`);
          await loadData();
        }}
      />

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 py-2 px-6 flex justify-between items-center shadow-lg">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer ${activeTab === 'overview' ? 'text-[#38006b]' : 'text-slate-500'}`}
        >
          <TrendingUp className="w-5 h-5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer ${activeTab === 'products' ? 'text-[#38006b]' : 'text-slate-500'}`}
        >
          <Package className="w-5 h-5" />
          <span>Products</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer ${activeTab === 'orders' ? 'text-[#38006b]' : 'text-slate-500'}`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span>Orders</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer ${activeTab === 'inventory' ? 'text-[#38006b]' : 'text-slate-500'}`}
        >
          <Layers className="w-5 h-5" />
          <span>Inventory</span>
        </button>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-500 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
          <span>More</span>
        </button>
      </div>

    </div>
  );
};

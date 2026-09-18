import * as crypto from 'crypto';
import { Router, Response } from 'express';
import { db } from '../db.js';
import { generateSecureId } from '../utils/security.js';
import { AuthenticatedRequest, requireRole } from '../middleware/auth.js';
import { requireVerified } from '../middleware/auth.js';
import { isUserVerified } from '../middleware/verificationGuard.js';
import { Product } from '../../src/types/index.js';

const router = Router();

// GET /api/products (filter, search, category, brand, sellerId, badge, sort)
router.get('/', (req, res) => {
  const {
    category,
    subcategory,
    brand,
    sellerId,
    badge,
    q,
    minPrice,
    maxPrice,
    sort,
    limit,
    offset = 0
  } = req.query;

  let products = [...db.getDb().products];

  if (category) {
    products = products.filter(p => p && p?.category && p?.category.toLowerCase() === (category as string).toLowerCase());
  }

  if (subcategory) {
    products = products.filter(p => p && p.subcategory && p.subcategory.toLowerCase() === (subcategory as string).toLowerCase());
  }

  if (brand) {
    const brandArr = Array.isArray(brand) ? brand : [brand];
    products = products.filter(p => p && p.brand && brandArr.map(b => String(b).toLowerCase()).includes(p.brand.toLowerCase()));
  }

  if (sellerId) {
    products = products.filter(p => p && p.sellerId === sellerId);
  }

  if (badge) {
    products = products.filter(p => p && p.badges && p.badges.includes(badge as any));
  }

  if (q) {
    const query = String(q).toLowerCase();
    products = products.filter(p =>
      p && (
        (p.name && p.name.toLowerCase().includes(query)) ||
        (p.brand && p.brand.toLowerCase().includes(query)) ||
        (p?.category && p?.category.toLowerCase().includes(query)) ||
        (p.description && p.description.toLowerCase().includes(query))
      )
    );
  }

  if (minPrice) {
    products = products.filter(p => p.price >= Number(minPrice));
  }

  if (maxPrice) {
    products = products.filter(p => p.price <= Number(maxPrice));
  }

  // Sorting
  if (sort === 'price_asc') {
    products.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    products.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating_desc') {
    products.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'discount_desc') {
    products.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
  }

  const total = products.length;
  if (limit) {
    products = products.slice(Number(offset), Number(offset) + Number(limit));
  }

  res.json({ products, total });
});

// GET /api/products/autocomplete (Live search suggestions)
router.get('/autocomplete', (req, res) => {
  const q = String(req.query.q || '').toLowerCase().trim();
  if (!q || q.length < 2) {
    return res.json({ products: [], categories: [], brands: [] });
  }

  const database = db.getDb();
  
  const matchedCategories = (database.categories || [])
    .filter(c => c && c.name && (c.name.toLowerCase().includes(q) || c.slug?.toLowerCase().includes(q)))
    .slice(0, 3);

  const matchedBrands = (database.brands || [])
    .filter(b => b && b.name && (b.name.toLowerCase().includes(q) || b.slug?.toLowerCase().includes(q)))
    .slice(0, 3);

  const matchedProducts = (database.products || [])
    .filter(p => p && (
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p?.category && p?.category.toLowerCase().includes(q)) ||
      (p.subcategory && p.subcategory.toLowerCase().includes(q))
    ))
    .slice(0, 6)
    .map(p => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p?.category,
      price: p.price,
      oldPrice: p.oldPrice,
      discountPercentage: p.discountPercentage,
      thumbnail: p.thumbnail || (p.images && p.images[0]) || '',
      rating: p.rating,
      stock: p.stock,
      badges: p.badges
    }));

  res.json({
    products: matchedProducts,
    categories: matchedCategories,
    brands: matchedBrands
  });
});

// GET /api/products/categories
router.get('/categories', (req, res) => {
  const currentDb = db.getDb();
  const dbCategories = currentDb.categories || [];
  const builderCategories = (currentDb.builderConfig && currentDb.builderConfig.categories) || [];
  
  const combinedMap = new Map();
  dbCategories.forEach(c => combinedMap.set(c.id, c));
  builderCategories.forEach((c: any) => {
    if (c.active !== false) {
      combinedMap.set(c.id || c.slug, {
        id: c.id || `cat-${c.slug}`,
        name: c.name,
        slug: c.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        icon: c.icon || 'Layers',
        image: c.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600',
        productCount: c.productsCount || 0,
        subcategories: c.subcategories || []
      });
    }
  });

  const categories = Array.from(combinedMap.values());
  res.json({ categories });
});

// POST /api/products/categories (Create category)
router.post('/categories', requireRole('SUPER_ADMIN', 'CATALOG_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { name, slug, icon, image, subcategories } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name is required' });

  const newCat = {
    id: generateSecureId('cat'),
    name,
    slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    icon: icon || 'Layers',
    iconName: icon || 'Layers',
    image: image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600',
    itemCount: 0,
    productCount: 0,
    subcategories: subcategories || []
  } as any;

  db.updateDb(d => {
    if (!d.categories) d.categories = [];
    d.categories.push(newCat);
  });

  res.status(201).json({ success: true, category: newCat });
});

// PUT /api/products/categories/:id (Edit category)
router.put('/categories/:id', requireRole('SUPER_ADMIN', 'CATALOG_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  let updatedCat: any = null;

  db.updateDb(d => {
    if (!d.categories) d.categories = [];
    const cat = d.categories.find(c => c.id === id || c.slug === id);
    if (cat) {
      if (updates.name) cat.name = updates.name;
      if (updates.slug) cat.slug = updates.slug;
      if (updates.icon) (cat as any).icon = updates.icon;
      if (updates.image) (cat as any).image = updates.image;
      if (updates.subcategories) (cat as any).subcategories = updates.subcategories;
      updatedCat = cat;
    }
  });

  if (!updatedCat) return res.status(404).json({ error: 'Category not found' });
  res.json({ success: true, category: updatedCat });
});

// DELETE /api/products/categories/:id (Delete category)
router.delete('/categories/:id', requireRole('SUPER_ADMIN', 'CATALOG_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  let removed = false;

  db.updateDb(d => {
    if (!d.categories) d.categories = [];
    const prev = d.categories.length;
    d.categories = d.categories.filter(c => c.id !== id && c.slug !== id);
    if (d.categories.length < prev) removed = true;
  });

  if (!removed) return res.status(404).json({ error: 'Category not found' });
  res.json({ success: true, message: 'Category deleted' });
});

// GET /api/products/brands
router.get('/brands', (req, res) => {
  const brands = db.getDb().brands || [];
  res.json({ brands });
});

// POST /api/products/brands
router.post('/brands', requireRole('SUPER_ADMIN', 'CATALOG_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { name, logo, category, isOfficial } = req.body;
  if (!name) return res.status(400).json({ error: 'Brand name is required' });

  const newBrand = {
    id: generateSecureId('brd'),
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    logo: logo || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200',
    bannerImage: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1200',
    description: `Official ${name} brand catalog on LUMO`,
    category: category || 'General',
    productCount: 0,
    isOfficial: isOfficial ?? true
  } as any;

  db.updateDb(d => {
    if (!d.brands) d.brands = [];
    d.brands.push(newBrand);
  });

  res.status(201).json({ success: true, brand: newBrand });
});

// PUT /api/products/brands/:id
router.put('/brands/:id', requireRole('SUPER_ADMIN', 'CATALOG_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  let updatedBrand: any = null;

  db.updateDb(d => {
    if (!d.brands) d.brands = [];
    const b = d.brands.find(br => br.id === id || br.slug === id);
    if (b) {
      if (updates.name) b.name = updates.name;
      if (updates.logo) (b as any).logo = updates.logo;
      if (updates.category) (b as any).category = updates.category;
      if (updates.isOfficial !== undefined) (b as any).isOfficial = updates.isOfficial;
      updatedBrand = b;
    }
  });

  if (!updatedBrand) return res.status(404).json({ error: 'Brand not found' });
  res.json({ success: true, brand: updatedBrand });
});

// DELETE /api/products/brands/:id
router.delete('/brands/:id', requireRole('SUPER_ADMIN', 'CATALOG_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  let removed = false;

  db.updateDb(d => {
    if (!d.brands) d.brands = [];
    const prev = d.brands.length;
    d.brands = d.brands.filter(b => b.id !== id && b.slug !== id);
    if (d.brands.length < prev) removed = true;
  });

  if (!removed) return res.status(404).json({ error: 'Brand not found' });
  res.json({ success: true, message: 'Brand deleted' });
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const product = db.getDb().products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Increment view count on retrieval
  db.updateDb(d => {
    const target = d.products.find(p => p.id === req.params.id);
    if (target) {
      target.viewCount = (target.viewCount || 0) + 1;
    }
  });

  res.json({ product: { ...product, viewCount: (product.viewCount || 0) + 1 } });
});

// POST /api/products/:id/view (Explicit view tracker)
router.post('/:id/view', (req, res) => {
  let updatedViews = 1;
  db.updateDb(d => {
    const target = d.products.find(p => p.id === req.params.id);
    if (target) {
      target.viewCount = (target.viewCount || 0) + 1;
      updatedViews = target.viewCount;
    }
  });
  res.json({ success: true, viewCount: updatedViews });
});

// POST /api/products/compare-validate (Validate subcategory and generate comparison matrix)
router.post('/compare-validate', (req, res) => {
  const { productIds } = req.body;
  if (!productIds || !Array.isArray(productIds) || productIds.length < 2) {
    return res.status(400).json({
      eligible: false,
      error: 'At least 2 products are required for comparison.'
    });
  }

  if (productIds.length > 4) {
    return res.status(400).json({
      eligible: false,
      error: 'A maximum of 4 products can be compared at one time.'
    });
  }

  const allProducts = db.getDb().products;
  const products: Product[] = [];
  for (const id of productIds) {
    const found = allProducts.find(p => p.id === id);
    if (found) {
      products.push(found);
    }
  }

  if (products.length !== productIds.length) {
    return res.status(404).json({
      eligible: false,
      error: 'One or more selected products are no longer available in the catalog.'
    });
  }

  // Check subcategory alignment
  const subcategories = Array.from(new Set(products.map(p => (p.subcategory || p.category || 'General').toLowerCase())));
  const sharedSubcategory = products[0].subcategory || products[0].category || 'General';

  if (subcategories.length > 1) {
    return res.status(400).json({
      eligible: false,
      sharedSubcategory: null,
      error: `Comparison is only permitted for products within the same subcategory. Found: ${subcategories.join(', ')}.`
    });
  }

  // Extract all attribute labels across the products
  const specLabelsSet = new Set<string>();
  products.forEach(p => {
    (p.specifications || []).forEach(s => {
      if (s.label) specLabelsSet.add(s.label);
    });
  });

  const specLabels = Array.from(specLabelsSet);

  // Build unified comparison matrix
  const coreAttributes = [
    {
      group: 'Overview',
      label: 'Price',
      values: products.reduce((acc, p) => ({ ...acc, [p.id]: p.price }), {}),
      hasDifference: new Set(products.map(p => p.price)).size > 1
    },
    {
      group: 'Overview',
      label: 'Brand',
      values: products.reduce((acc, p) => ({ ...acc, [p.id]: p.brand }), {}),
      hasDifference: new Set(products.map(p => p.brand)).size > 1
    },
    {
      group: 'Overview',
      label: 'Rating & Reviews',
      values: products.reduce((acc, p) => ({ ...acc, [p.id]: `${p.rating} ★ (${p.reviewCount || 0} reviews)` }), {}),
      hasDifference: new Set(products.map(p => p.rating)).size > 1
    },
    {
      group: 'Overview',
      label: 'Seller & Location',
      values: products.reduce((acc, p) => ({ ...acc, [p.id]: `${p.sellerName} (${p.sellerCity || 'Tanzania'})` }), {}),
      hasDifference: new Set(products.map(p => p.sellerName)).size > 1
    },
    {
      group: 'Overview',
      label: 'Warranty',
      values: products.reduce((acc, p) => ({ ...acc, [p.id]: p.warranty || '1-Year Official Warranty' }), {}),
      hasDifference: new Set(products.map(p => p.warranty)).size > 1
    },
    {
      group: 'Delivery & Stock',
      label: 'Stock Availability',
      values: products.reduce((acc, p) => ({ ...acc, [p.id]: p.stock > 0 ? `In Stock (${p.stock} units)` : 'Out of Stock' }), {}),
      hasDifference: new Set(products.map(p => p.stock > 0)).size > 1
    },
    {
      group: 'Delivery & Stock',
      label: 'Free Delivery Eligible',
      values: products.reduce((acc, p) => ({ ...acc, [p.id]: p.freeDeliveryEligible ? 'Yes (Free Zone Eligible)' : 'Standard Regional Rates' }), {}),
      hasDifference: new Set(products.map(p => Boolean(p.freeDeliveryEligible))).size > 1
    },
    {
      group: 'Delivery & Stock',
      label: 'Condition',
      values: products.reduce((acc, p) => ({ ...acc, [p.id]: p.condition || 'Brand New' }), {}),
      hasDifference: new Set(products.map(p => p.condition)).size > 1
    }
  ];

  const specAttributes = specLabels.map(label => {
    const values: Record<string, string> = {};
    products.forEach(p => {
      const spec = (p.specifications || []).find(s => s.label.toLowerCase() === label.toLowerCase());
      values[p.id] = spec ? spec.value : '—';
    });
    const uniqueValues = new Set(Object.values(values));
    return {
      group: 'Technical Specifications',
      label,
      values,
      hasDifference: uniqueValues.size > 1
    };
  });

  const comparisonMatrix = [...coreAttributes, ...specAttributes];

  res.json({
    eligible: true,
    sharedSubcategory,
    products,
    comparisonMatrix
  });
});

// PATCH /api/products/:id/stock (Update product stock & sync inventory ledger)
router.patch('/:id/stock', requireRole('SUPER_ADMIN', 'ADMIN', 'CATALOG_ADMIN', 'SELLER'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { stock, delta } = req.body;
  
  const sellerId = req.user?.sellerId;
  const isAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN' || req.user?.role === 'CATALOG_ADMIN';

  if (!isAdmin && req.user?.role === 'SELLER') {
    if (!isUserVerified(req.user)) {
      return res.status(403).json({
        error: 'VERIFICATION_REQUIRED',
        message: 'Seller account must be verified before modifying stock.'
      });
    }
  }

  const existing = db.getDb().products.find(p => p.id === id);
  if (!existing) {
    return res.status(404).json({ error: 'Product not found' });
  }

  if (!isAdmin && existing.sellerId !== sellerId) {
    return res.status(403).json({ error: 'Forbidden: You do not own this product.' });
  }

  if (stock === undefined && delta === undefined) {
    return res.status(400).json({ error: 'Either stock or delta must be provided.' });
  }

  let newStockLevel = 0;

  if (stock !== undefined) {
    const numStock = Number(stock);
    if (isNaN(numStock) || !Number.isInteger(numStock) || numStock < 0 || numStock > 1000000) {
      return res.status(400).json({
        error: 'Stock must be a non-negative integer between 0 and 1,000,000.'
      });
    }
    newStockLevel = numStock;
  } else if (delta !== undefined) {
    const numDelta = Number(delta);
    if (isNaN(numDelta) || !Number.isInteger(numDelta) || numDelta === 0) {
      return res.status(400).json({
        error: 'Delta must be a non-zero integer.'
      });
    }
    const currentStock = existing.stock || 0;
    if (currentStock + numDelta < 0) {
      return res.status(400).json({
        error: `Insufficient stock: Cannot reduce stock below 0. Current stock is ${currentStock}.`
      });
    }
    if (currentStock + numDelta > 1000000) {
      return res.status(400).json({
        error: 'Stock cannot exceed 1,000,000 units.'
      });
    }
    newStockLevel = currentStock + numDelta;
  }

  let updatedProduct: Product | null = null;
  const previousStock = existing.stock || 0;
  const stockDifference = newStockLevel - previousStock;

  db.updateDb(d => {
    const prod = d.products.find(p => p.id === id);
    if (prod) {
      prod.stock = newStockLevel;
      (prod as any).inStock = newStockLevel > 0;
      if (newStockLevel === 0) {
        prod.badges = prod.badges.filter(b => b !== 'LIMITED STOCK');
      } else if (newStockLevel <= 5) {
        if (!prod.badges.includes('LIMITED STOCK')) {
          prod.badges.push('LIMITED STOCK');
        }
      } else {
        prod.badges = prod.badges.filter(b => b !== 'LIMITED STOCK');
      }
      updatedProduct = prod;

      // Sync with inventory ledger
      const invItem = d.inventory.find(i => i.productId === id);
      if (invItem) {
        invItem.available = newStockLevel;
        invItem.updatedAt = new Date().toISOString();
      }

      // Record authoritative movement in movement ledger if changed
      if (stockDifference !== 0) {
        if (!d.inventoryMovements) d.inventoryMovements = [];
        d.inventoryMovements.unshift({
          id: `mov-${Date.now()}-${crypto.randomInt(100, 1000)}`,
          productId: id,
          sellerId: existing.sellerId,
          warehouseId: 'wh-dar-central',
          sku: `LM-SKU-${id}`,
          movementType: stockDifference > 0 ? 'INBOUND_RECEIVED' : 'ADJUSTED_MANUAL',
          quantity: stockDifference,
          performedByUserId: req.user?.id as string,
          performedByUserName: req.user?.name as string,
          performedByUserRole: req.user?.role as any,
          reason: `Authoritative stock level update to ${newStockLevel}`,
          previousAvailable: previousStock,
          newAvailable: newStockLevel,
          createdAt: new Date().toISOString()
        });
      }
    }
  });

  db.addAuditLog({
    userId: req.user?.id as string,
    userName: req.user?.name as string,
    userRole: req.user?.role as any,
    action: 'UPDATE_STOCK',
    entityType: 'PRODUCT',
    entityId: id,
    previousValue: `Stock: ${previousStock}`,
    newValue: `New Stock: ${newStockLevel} (${stockDifference >= 0 ? '+' : ''}${stockDifference})`
  });

  res.json({ success: true, product: updatedProduct, stock: newStockLevel });
});

// GET /api/products/:id/inventory (Get linked inventory record for product)
router.get('/:id/inventory', requireRole('SUPER_ADMIN', 'ADMIN', 'CATALOG_ADMIN', 'SELLER', 'WAREHOUSE_STAFF', 'WAREHOUSE_MANAGER', 'OPERATIONS_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const product = db.getDb().products.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const isAdminOrWarehouse = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN' || req.user?.role === 'CATALOG_ADMIN' || req.user?.role === 'WAREHOUSE_STAFF' || req.user?.role === 'WAREHOUSE_MANAGER' || req.user?.role === 'OPERATIONS_ADMIN';
  if (!isAdminOrWarehouse && req.user?.role === 'SELLER' && product.sellerId !== req.user?.sellerId) {
    return res.status(403).json({ error: 'Forbidden: You do not own this product inventory.' });
  }

  const inventoryItem = db.getDb().inventory.find(i => i.productId === id);
  if (!inventoryItem) {
    return res.status(404).json({ error: 'Inventory record not found for this product.' });
  }

  res.json({ inventory: inventoryItem });
});

// POST /api/products/:id/boost (Boost product as Sponsored)
router.post('/:id/boost', requireRole('SUPER_ADMIN', 'ADMIN', 'CATALOG_ADMIN', 'SELLER'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { planName, durationDays = 7, budget = 25000 } = req.body;

  const isAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN' || req.user?.role === 'CATALOG_ADMIN';
  const sellerId = req.user?.sellerId;

  if (!isAdmin && req.user?.role === 'SELLER') {
    if (!isUserVerified(req.user)) {
      return res.status(403).json({
        error: 'VERIFICATION_REQUIRED',
        message: 'Seller account must be verified before boosting products.'
      });
    }
  }

  const numBudget = Number(budget);
  if (isNaN(numBudget) || !Number.isInteger(numBudget) || numBudget < 1000 || numBudget > 10000000) {
    return res.status(400).json({ error: 'Budget must be an integer between 1,000 and 10,000,000 TZS.' });
  }

  const numDuration = Number(durationDays);
  if (isNaN(numDuration) || !Number.isInteger(numDuration) || numDuration < 1 || numDuration > 365) {
    return res.status(400).json({ error: 'Duration must be an integer between 1 and 365 days.' });
  }

  const existing = db.getDb().products.find(p => p.id === id);
  if (!existing) {
    return res.status(404).json({ error: 'Product not found' });
  }

  if (!isAdmin && existing.sellerId !== sellerId) {
    return res.status(403).json({ error: 'Forbidden: You do not own this product.' });
  }

  let updatedProduct: Product | null = null;
  let campaign: any = null;

  db.updateDb(d => {
    const prod = d.products.find(p => p.id === id);
    if (prod) {
      prod.isSponsored = true;
      if (!prod.badges.includes('SPONSORED')) {
        prod.badges = ['SPONSORED', ...prod.badges];
      }
      updatedProduct = prod;

      campaign = {
        id: `ad-${Date.now()}`,
        productId: prod.id,
        productName: prod.name,
        sellerId: prod.sellerId,
        planName: planName || 'Growth Turbo Boost',
        budget: numBudget,
        durationDays: numDuration,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + numDuration * 86400000).toISOString(),
        impressions: 0,
        clicks: 0,
        status: 'ACTIVE'
      };

      if (!(d as any).advertisingCampaigns) (d as any).advertisingCampaigns = [];
      (d as any).advertisingCampaigns.unshift(campaign);

      if (!(d as any).financialLedger) (d as any).financialLedger = [];
      (d as any).financialLedger.unshift({
        id: `led-${Date.now()}`,
        sellerId: prod.sellerId,
        type: 'DEBIT',
        category: 'ADVERTISING_FEE',
        amount: numBudget,
        description: `Lumo Boost Ad Campaign for ${prod.name} (${planName || 'Growth Turbo Boost'})`,
        createdAt: new Date().toISOString()
      });
    }
  });

  res.json({ success: true, product: updatedProduct, campaign });
});

// GET /api/products/sponsored/list (Fetch sponsored items for showcase)
router.get('/sponsored/list', (req, res) => {
  const products = db.getDb().products.filter(p => p.isSponsored || p.badges.includes('SPONSORED'));
  res.json({ products, total: products.length });
});

// GET /api/products/trending/auto-detected (Auto-detect high-performing products based on sold count, views, ratings, velocity)
router.get('/trending/auto-detected', (req, res) => {
  const { category, metric, limit = 50 } = req.query;
  const products = [...db.getDb().products];

  // Calculate multidimensional performance score for each product
  const rankedProducts = products
    .map(p => {
      const sold = p.soldCount || 0;
      const views = p.viewCount || Math.round(sold * 4.2 + (p.reviewCount || 0) * 15 + 180);
      const rating = p.rating || 4.5;
      const reviews = p.reviewCount || 0;
      const discount = p.discountPercentage || 0;

      // Score formula:
      // - Sales Volume Weight: sold * 4.5
      // - Customer Interest/Views Weight: views * 1.2
      // - Quality Weight: (rating - 3.5) * 60 (for rating > 3.5)
      // - Review Credibility: Math.min(reviews * 3.0, 150)
      // - Promotion/Deal Attractiveness: discount * 1.8
      const salesScore = sold * 4.5;
      const viewScore = views * 1.2;
      const qualityScore = Math.max(0, (rating - 3.5)) * 60 + Math.min(reviews * 3.0, 150);
      const dealScore = discount * 1.8;

      const performanceScore = Math.round(salesScore + viewScore + qualityScore + dealScore);

      // Generate automatic detection badges and rationale
      const detectionBadges: string[] = [];
      let autoDetectedReason = '';

      if (sold >= 500) {
        detectionBadges.push('🔥 Best Seller');
        autoDetectedReason = `Top volume product with ${sold.toLocaleString()} units sold and ${rating}★ customer rating`;
      } else if (views >= 1000) {
        detectionBadges.push('👀 High Demand');
        autoDetectedReason = `Trending with ${views.toLocaleString()}+ shopper views & high engagement`;
      } else if (rating >= 4.7 && reviews >= 100) {
        detectionBadges.push('⭐ Top Rated Choice');
        autoDetectedReason = `Exceptional quality score with ${rating}★ from ${reviews} verified buyers`;
      } else if (discount >= 20) {
        detectionBadges.push('💎 Best Value Deal');
        autoDetectedReason = `Great savings: ${discount}% OFF with strong buyer demand`;
      } else {
        detectionBadges.push('⚡ Trending Essential');
        autoDetectedReason = `Popular daily essential with high re-order rate and verified merchant fulfillment`;
      }

      return {
        ...p,
        soldCount: sold,
        viewCount: views,
        performanceScore,
        isTrending: true,
        autoDetectedReason,
        detectionBadges
      };
    });

  // Apply category filter if provided
  let filtered = rankedProducts;
  if (category && category !== 'All') {
    const catStr = String(category).toLowerCase();
    filtered = filtered.filter(p => p.category.toLowerCase().includes(catStr) || (p.subcategory && p.subcategory.toLowerCase().includes(catStr)));
  }

  // Apply metric sorting if requested
  if (metric === 'most_sold') {
    filtered.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
  } else if (metric === 'most_viewed') {
    filtered.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
  } else if (metric === 'best_rated') {
    filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.reviewCount || 0) - (a.reviewCount || 0));
  } else if (metric === 'best_discount') {
    filtered.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
  } else {
    // Default: Overall Multi-dimensional Performance Score
    filtered.sort((a, b) => (b.performanceScore || 0) - (a.performanceScore || 0));
  }

  // Assign trending rank 1..N
  const finalProducts = filtered.slice(0, Number(limit) || 50).map((p, index) => ({
    ...p,
    trendingRank: index + 1
  }));

  res.json({
    products: finalProducts,
    total: finalProducts.length,
    engineMetrics: {
      algorithm: 'LUMO Auto-Detection Performance Index v2.4',
      criteria: ['Order Sales Volume (45%)', 'Shopper View Traffic (25%)', 'Buyer Reviews & Ratings (20%)', 'Promotional Value (10%)'],
      totalCatalogAnalyzed: products.length,
      autoQualifiedCount: finalProducts.length
    }
  });
});

// POST /api/products/verify-and-create (Verify image matches brand and create product)
router.post('/verify-and-create', requireRole('SUPER_ADMIN', 'ADMIN', 'CATALOG_ADMIN', 'SELLER'), (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  const isAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN' || req.user?.role === 'CATALOG_ADMIN';

  if (!isAdmin && req.user?.role === 'SELLER') {
    if (!isUserVerified(req.user)) {
      return res.status(403).json({
        error: 'VERIFICATION_REQUIRED',
        message: 'Seller account must be verified before listing products.'
      });
    }
  }

  const sellerId = isAdmin ? (data.sellerId || req.user?.sellerId) : req.user?.sellerId;
  const seller = db.getDb().sellers.find(s => s.id === sellerId);
  
  if (!sellerId || !seller) {
    return res.status(403).json({ error: 'Valid seller identity required' });
  }

  const numPrice = Number(data.price);
  if (isNaN(numPrice) || numPrice <= 0 || !isFinite(numPrice)) {
    return res.status(400).json({ error: 'Price must be a positive number greater than 0.' });
  }

  let initialStock = 10;
  if (data.stock !== undefined) {
    const numStock = Number(data.stock);
    if (isNaN(numStock) || !Number.isInteger(numStock) || numStock < 0 || numStock > 1000000) {
      return res.status(400).json({ error: 'Stock must be a non-negative integer between 0 and 1,000,000.' });
    }
    initialStock = numStock;
  }

  let oldPriceVal: number | undefined = undefined;
  if (data.oldPrice !== undefined && data.oldPrice !== null && data.oldPrice !== '') {
    const numOld = Number(data.oldPrice);
    if (!isNaN(numOld) && numOld > 0) {
      oldPriceVal = numOld;
    }
  }

  const condition = data.condition || 'Brand New';
  const hasWarranty = data.hasWarranty === true || data.hasWarranty === 'Yes' || (data.warranty && data.warranty !== 'No Warranty');
  const warrantyStr = hasWarranty ? (data.warranty || '1 Year Official Warranty') : 'No Warranty';

  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    name: data.name || 'Untitled Product',
    brand: data.brand || 'Generic',
    category: data.category || 'electronics',
    subcategory: data.subcategory || 'accessories',
    sellerId,
    sellerName: seller.name,
    sellerCity: seller.city || 'Dar es Salaam',
    price: numPrice,
    oldPrice: oldPriceVal,
    discountPercentage: oldPriceVal && numPrice ? Math.round(((oldPriceVal - numPrice) / oldPriceVal) * 100) : 0,
    rating: 5.0,
    reviewCount: 0,
    stock: initialStock,
    soldCount: 0,
    badges: data.badges || ['NEW ARRIVAL'],
    images: data.images?.length ? data.images : ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500'],
    thumbnail: data.images?.[0] || data.thumbnail || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
    description: data.description || `Quality ${condition} product verified by LUMO escrow guarantee.`,
    keyFeatures: data.keyFeatures || ['Official East Africa warranty', 'Genuine product guarantee'],
    specifications: data.specifications || [],
    variations: data.variations || [],
    condition: condition,
    hasWarranty,
    warranty: warrantyStr,
    freeDeliveryEligible: !!data.freeDeliveryEligible,
    status: 'Pending Verification'
  };

  db.updateDb(d => {
    d.products.unshift(newProduct);
    d.moderationItems.unshift({
      id: `mod-${Date.now()}`,
      type: 'PRODUCT_APPROVAL',
      targetId: newProduct.id,
      targetName: newProduct.name,
      sellerId: newProduct.sellerId,
      sellerName: newProduct.sellerName,
      submittedBy: req.user?.name || 'Seller',
      details: `New product requires brand verification. Brand claimed: ${newProduct.brand}. Warranty: ${newProduct.warranty}`,
      riskScore: 'LOW',
      status: 'PENDING',
      createdAt: new Date().toISOString()
    });
    // Add to inventory ledger
    const invItem = {
      id: `inv-${Date.now()}`,
      productId: newProduct.id,
      sellerId: newProduct.sellerId,
      sku: `LM-${newProduct.brand.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      productName: newProduct.name,
      brand: newProduct.brand,
      category: newProduct.category,
      warehouseId: 'wh-dar-central',
      warehouseName: 'Dar es Salaam Central Fulfillment Hub',
      locationBin: 'Aisle 1 - Shelf A - Bin 01',
      available: newProduct.stock,
      reserved: 0,
      sold: 0,
      damaged: 0,
      returned: 0,
      quarantined: 0,
      inTransit: 0,
      reorderLevel: 5,
      unitCost: Math.round(newProduct.price * 0.7),
      updatedAt: new Date().toISOString()
    };
    d.inventory.unshift(invItem);

    if (newProduct.stock > 0) {
      if (!d.inventoryMovements) d.inventoryMovements = [];
      d.inventoryMovements.unshift({
        id: `mov-${Date.now()}-${crypto.randomInt(100, 1000)}`,
        productId: newProduct.id,
        sellerId: newProduct.sellerId,
        warehouseId: 'wh-dar-central',
        sku: invItem.sku,
        movementType: 'INBOUND_RECEIVED',
        quantity: newProduct.stock,
        performedByUserId: req.user?.id as string,
        performedByUserName: req.user?.name as string,
        performedByUserRole: req.user?.role as any,
        reason: 'Initial stock receipt upon product creation',
        previousAvailable: 0,
        newAvailable: newProduct.stock,
        createdAt: new Date().toISOString()
      });
    }
  });

  res.json({ product: newProduct });
});

// GET /api/products/:id/reviews (Get authentic customer reviews)
router.get('/:id/reviews', (req, res) => {
  const { id } = req.params;
  const dbData = db.getDb();
  const allReviews = (dbData as any).reviews || [];
  const productReviews = allReviews.filter((r: any) => r.productId === id);
  res.json({ reviews: productReviews, total: productReviews.length });
});

// POST /api/products/:id/reviews (Submit verified review - requires delivered purchase; seller manipulation forbidden)
router.post('/:id/reviews', requireRole('CUSTOMER', 'SUPER_ADMIN', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user?.id;
  const userName = req.user?.name;
  const userRole = req.user?.role;

  if (!userId || !userName) {
    return res.status(403).json({ error: 'Valid user identity required' });
  }

  // Sellers are strictly forbidden from submitting or altering reviews
  if (userRole === 'SELLER' || (userRole as string) === 'VENDOR') {
    return res.status(403).json({
      error: 'Integrity Violation: Sellers and vendors are strictly forbidden from submitting product reviews.'
    });
  }

  const numRating = Number(rating);
  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5 stars.' });
  }

  const dbData = db.getDb();
  const product = dbData.products.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Check if customer actually purchased and received this product in a Delivered order
  const hasDeliveredOrder = dbData.orders.some(o =>
    o.status === 'Delivered' && (
      o.customerId === userId || (req.user?.email && o.customer?.email === req.user.email)
    ) && o.items.some(item => item.productId === id || (item.productName && item.productName.toLowerCase() === product.name.toLowerCase()))
  );

  const newReview = {
    id: generateSecureId('rev'),
    productId: id,
    userId,
    userName,
    userCity: 'Dar es Salaam',
    rating: numRating,
    comment: comment || 'Verified purchase review.',
    verifiedPurchase: hasDeliveredOrder,
    createdAt: new Date().toISOString()
  };

  db.updateDb(d => {
    if (!(d as any).reviews) (d as any).reviews = [];
    (d as any).reviews.unshift(newReview);

    // Recalculate product rating & review count
    const prod = d.products.find(p => p.id === id);
    if (prod) {
      const currentReviews = (d as any).reviews.filter((r: any) => r.productId === id);
      const totalScore = currentReviews.reduce((sum: number, r: any) => sum + r.rating, 0);
      prod.rating = Number((totalScore / currentReviews.length).toFixed(1));
      prod.reviewCount = currentReviews.length;
    }
  });

  res.status(201).json({
    success: true,
    review: newReview,
    message: 'Thank you! Your verified purchase review has been published.'
  });
});

// POST /api/products/:id/check-flash-sale (Check and auto-trigger flash sale when 90% stock is sold)
router.post('/:id/check-flash-sale', requireRole('SUPER_ADMIN', 'ADMIN', 'CATALOG_ADMIN', 'SELLER'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const isAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN' || req.user?.role === 'CATALOG_ADMIN';

  const existing = db.getDb().products.find(p => p.id === id);
  if (!existing) {
    return res.status(404).json({ error: 'Product not found' });
  }

  if (!isAdmin && existing.sellerId !== req.user?.sellerId) {
    return res.status(403).json({ error: 'Forbidden: You do not own this product.' });
  }

  let flashSaleTriggered = false;
  let updatedProduct: any = null;

  db.updateDb(d => {
    const prod = d.products.find(p => p.id === id);
    if (prod) {
      const currentStock = prod.stock || 0;
      const sold = prod.soldCount || 10;
      const totalUnits = currentStock + sold;
      const soldRatio = totalUnits > 0 ? (sold / totalUnits) : 0;

      // Auto trigger if sold ratio >= 90% or currentStock <= 2
      if (soldRatio >= 0.9 || currentStock <= 2) {
        flashSaleTriggered = true;
        (prod as any).isFlashSale = true;
        if (!prod.badges.includes('FLASH SALE')) {
          prod.badges.unshift('FLASH SALE');
        }
        updatedProduct = prod;

        // Trigger platform automation alert
        d.notifications.unshift({
          id: `notif-flash-${Date.now()}`,
          userId: prod.sellerId,
          title: '🔥 Flash Sale Triggered Automatically',
          message: `Product "${prod.name}" has reached 90% sold threshold! Flash sale badge activated.`,
          type: 'SYSTEM',
          read: false,
          createdAt: new Date().toISOString(),
          link: `/seller`
        });
      }
    }
  });

  res.json({ success: true, flashSaleTriggered, product: updatedProduct });
});

// POST /api/products (Create product)
router.post('/', requireRole('SUPER_ADMIN', 'ADMIN', 'CATALOG_ADMIN', 'SELLER'), requireVerified, (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  const isAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN' || req.user?.role === 'CATALOG_ADMIN';

  if (!isAdmin && req.user?.role === 'SELLER') {
    if (!isUserVerified(req.user)) {
      return res.status(403).json({
        error: 'VERIFICATION_REQUIRED',
        message: 'Seller account must be verified before listing products.'
      });
    }
  }

  const sellerId = isAdmin ? (data.sellerId || req.user?.sellerId) : req.user?.sellerId;
  const seller = db.getDb().sellers.find(s => s.id === sellerId);

  if (!sellerId || !seller) {
    return res.status(403).json({ error: 'Valid seller identity required' });
  }

  const numPrice = Number(data.price);
  if (isNaN(numPrice) || numPrice <= 0 || !isFinite(numPrice)) {
    return res.status(400).json({ error: 'Price must be a positive number greater than 0.' });
  }

  let initialStock = 10;
  if (data.stock !== undefined) {
    const numStock = Number(data.stock);
    if (isNaN(numStock) || !Number.isInteger(numStock) || numStock < 0 || numStock > 1000000) {
      return res.status(400).json({ error: 'Stock must be a non-negative integer between 0 and 1,000,000.' });
    }
    initialStock = numStock;
  }

  let oldPriceVal: number | undefined = undefined;
  if (data.oldPrice !== undefined && data.oldPrice !== null && data.oldPrice !== '') {
    const numOld = Number(data.oldPrice);
    if (!isNaN(numOld) && numOld > 0) {
      oldPriceVal = numOld;
    }
  }

  const hasWarranty = data.hasWarranty === true || data.hasWarranty === 'Yes' || (data.warranty && data.warranty !== 'No Warranty');
  const warrantyStr = hasWarranty ? (data.warranty || '1 Year Official Warranty') : 'No Warranty';

  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    name: data.name || 'Untitled Product',
    brand: data.brand || 'Generic',
    category: data.category || 'electronics',
    subcategory: data.subcategory || 'accessories',
    sellerId,
    sellerName: seller.name,
    sellerCity: seller.city || 'Dar es Salaam',
    price: numPrice,
    oldPrice: oldPriceVal,
    discountPercentage: oldPriceVal && numPrice ? Math.round(((oldPriceVal - numPrice) / oldPriceVal) * 100) : 0,
    rating: 5.0,
    reviewCount: 0,
    stock: initialStock,
    soldCount: 0,
    badges: data.badges || ['NEW ARRIVAL'],
    images: data.images?.length ? data.images : ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500'],
    thumbnail: data.images?.[0] || data.thumbnail || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
    description: data.description || 'Quality product verified by LUMO escrow guarantee.',
    keyFeatures: data.keyFeatures || ['Official East Africa warranty', 'Genuine product guarantee'],
    specifications: data.specifications || [],
    variations: data.variations || [],
    condition: data.condition || 'Brand New',
    hasWarranty,
    warranty: warrantyStr,
    freeDeliveryEligible: !!data.freeDeliveryEligible,
    status: data.status || 'Active'
  };

  db.updateDb(d => {
    d.products.unshift(newProduct);
    // Add to moderation queue
    d.moderationItems.unshift({
      id: `mod-${Date.now()}`,
      type: 'PRODUCT_APPROVAL',
      targetId: newProduct.id,
      targetName: newProduct.name,
      sellerId: newProduct.sellerId,
      sellerName: newProduct.sellerName,
      submittedBy: req.user?.name || 'Seller',
      details: `New product listed: ${newProduct.name} at ${newProduct.price} TZS`,
      riskScore: 'LOW',
      status: 'PENDING',
      createdAt: new Date().toISOString()
    });
    // Add to inventory
    const invItem = {
      id: `inv-${Date.now()}`,
      productId: newProduct.id,
      sellerId: newProduct.sellerId,
      sku: `LM-${newProduct.brand.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      productName: newProduct.name,
      brand: newProduct.brand,
      category: newProduct.category,
      warehouseId: 'wh-dar-central',
      warehouseName: 'Dar es Salaam Central Fulfillment Hub',
      locationBin: 'Aisle 1 - Shelf A - Bin 01',
      available: newProduct.stock,
      reserved: 0,
      sold: 0,
      damaged: 0,
      returned: 0,
      quarantined: 0,
      inTransit: 0,
      reorderLevel: 5,
      unitCost: Math.round(newProduct.price * 0.7),
      updatedAt: new Date().toISOString()
    };
    d.inventory.unshift(invItem);

    if (newProduct.stock > 0) {
      if (!d.inventoryMovements) d.inventoryMovements = [];
      d.inventoryMovements.unshift({
        id: `mov-${Date.now()}-${crypto.randomInt(100, 1000)}`,
        productId: newProduct.id,
        sellerId: newProduct.sellerId,
        warehouseId: 'wh-dar-central',
        sku: invItem.sku,
        movementType: 'INBOUND_RECEIVED',
        quantity: newProduct.stock,
        performedByUserId: req.user?.id as string,
        performedByUserName: req.user?.name as string,
        performedByUserRole: req.user?.role as any,
        reason: 'Initial stock intake on product creation',
        previousAvailable: 0,
        newAvailable: newProduct.stock,
        createdAt: new Date().toISOString()
      });
    }
  });

  db.addAuditLog({
    userId: req.user?.id as string,
    userName: req.user?.name as string,
    userRole: req.user?.role as any,
    action: 'CREATE_PRODUCT',
    entityType: 'PRODUCT',
    entityId: newProduct.id,
    newValue: `Created ${newProduct.name}`
  });

  res.status(201).json({ product: newProduct });
});

// PUT /api/products/:id (Update product)
router.put('/:id', requireRole('SUPER_ADMIN', 'ADMIN', 'CATALOG_ADMIN', 'SELLER'), requireVerified, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const isAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN' || req.user?.role === 'CATALOG_ADMIN';

  if (!isAdmin && req.user?.role === 'SELLER') {
    if (!isUserVerified(req.user)) {
      return res.status(403).json({
        error: 'VERIFICATION_REQUIRED',
        message: 'Seller account must be verified before updating products.'
      });
    }
  }

  const existing = db.getDb().products.find(p => p.id === id);
  if (!existing) {
    return res.status(404).json({ error: 'Product not found' });
  }

  if (!isAdmin && existing.sellerId !== req.user?.sellerId) {
    return res.status(403).json({ error: 'Forbidden: You do not own this product.' });
  }

  const safeUpdates = { ...updates };
  delete safeUpdates.id;
  delete safeUpdates.sellerId;
  delete safeUpdates.sellerName;
  delete safeUpdates.rating;
  delete safeUpdates.reviewCount;
  delete safeUpdates.soldCount;

  if (updates.price !== undefined) {
    const numPrice = Number(updates.price);
    if (isNaN(numPrice) || numPrice <= 0 || !isFinite(numPrice)) {
      return res.status(400).json({ error: 'Price must be a positive number greater than 0.' });
    }
    safeUpdates.price = numPrice;
  }

  let stockDifference = 0;
  const previousStock = existing.stock || 0;
  if (updates.stock !== undefined) {
    const numStock = Number(updates.stock);
    if (isNaN(numStock) || !Number.isInteger(numStock) || numStock < 0 || numStock > 1000000) {
      return res.status(400).json({ error: 'Stock must be a non-negative integer between 0 and 1,000,000.' });
    }
    safeUpdates.stock = numStock;
    safeUpdates.inStock = numStock > 0;
    stockDifference = numStock - previousStock;
  }

  let updatedProduct: Product | null = null;

  db.updateDb(d => {
    const idx = d.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      d.products[idx] = { ...d.products[idx], ...safeUpdates };
      updatedProduct = d.products[idx];
    }

    if (updates.stock !== undefined) {
      const invItem = d.inventory.find(i => i.productId === id);
      if (invItem) {
        invItem.available = safeUpdates.stock;
        invItem.updatedAt = new Date().toISOString();
      }

      if (stockDifference !== 0) {
        if (!d.inventoryMovements) d.inventoryMovements = [];
        d.inventoryMovements.unshift({
          id: `mov-${Date.now()}-${crypto.randomInt(100, 1000)}`,
          productId: id,
          sellerId: existing.sellerId,
          warehouseId: 'wh-dar-central',
          sku: `LM-SKU-${id}`,
          movementType: stockDifference > 0 ? 'INBOUND_RECEIVED' : 'ADJUSTED_MANUAL',
          quantity: stockDifference,
          performedByUserId: req.user?.id as string,
          performedByUserName: req.user?.name as string,
          performedByUserRole: req.user?.role as any,
          reason: `Product edit stock update to ${safeUpdates.stock}`,
          previousAvailable: previousStock,
          newAvailable: safeUpdates.stock,
          createdAt: new Date().toISOString()
        });
      }
    }
  });

  db.addAuditLog({
    userId: req.user?.id as string,
    userName: req.user?.name as string,
    userRole: req.user?.role as any,
    action: 'UPDATE_PRODUCT',
    entityType: 'PRODUCT',
    entityId: id,
    previousValue: `Product: ${existing.name}, Price: ${existing.price}, Stock: ${existing.stock}`,
    newValue: `Updates: ${JSON.stringify(safeUpdates)}`
  });

  res.json({ product: updatedProduct });
});

// GET /api/products/:id/movements (Get authoritative inventory movement audit trail)
router.get('/:id/movements', requireRole('SUPER_ADMIN', 'ADMIN', 'CATALOG_ADMIN', 'SELLER', 'WAREHOUSE_STAFF', 'WAREHOUSE_MANAGER', 'OPERATIONS_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const product = db.getDb().products.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const isAdminOrWarehouse = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN' || req.user?.role === 'CATALOG_ADMIN' || req.user?.role === 'WAREHOUSE_STAFF' || req.user?.role === 'WAREHOUSE_MANAGER' || req.user?.role === 'OPERATIONS_ADMIN';
  if (!isAdminOrWarehouse && req.user?.role === 'SELLER' && product.sellerId !== req.user?.sellerId) {
    return res.status(403).json({ error: 'Forbidden: You do not have access to this product inventory ledger.' });
  }

  const movements = (db.getDb().inventoryMovements || []).filter(m => m.productId === id);
  const calculatedStock = db.getCalculatedStock(id);
  res.json({ productId: id, calculatedStock, movements });
});

// POST /api/products/:id/adjust-stock (Record authoritative inventory adjustment)
router.post('/:id/adjust-stock', requireRole('SUPER_ADMIN', 'ADMIN', 'CATALOG_ADMIN', 'SELLER'), requireVerified, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { quantity, quantityChange, movementType, reason } = req.body;

  const sellerId = req.user?.sellerId;
  const isAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN' || req.user?.role === 'CATALOG_ADMIN';

  if (!isAdmin && req.user?.role === 'SELLER') {
    if (!isUserVerified(req.user)) {
      return res.status(403).json({
        error: 'VERIFICATION_REQUIRED',
        message: 'Seller account must be verified before adjusting inventory.'
      });
    }
  }

  const product = db.getDb().products.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  if (!isAdmin && product.sellerId !== sellerId) {
    return res.status(403).json({ error: 'Forbidden: You do not own this product.' });
  }

  const effectiveQty = typeof quantity === 'number' ? quantity : (typeof quantityChange === 'number' ? quantityChange : null);
  if (typeof effectiveQty !== 'number' || effectiveQty === 0 || !Number.isInteger(effectiveQty)) {
    return res.status(400).json({ error: 'Valid non-zero integer adjustment quantity is required.' });
  }

  if (!reason || typeof reason !== 'string' || reason.trim().length < 5) {
    return res.status(400).json({ error: 'Audit reason is required for manual inventory adjustments (min 5 characters).' });
  }

  const currentStock = product.stock || 0;
  if (currentStock + effectiveQty < 0) {
    return res.status(400).json({
      error: `Insufficient stock: Cannot reduce stock by ${Math.abs(effectiveQty)}. Current stock is ${currentStock}.`
    });
  }

  if (currentStock + effectiveQty > 1000000) {
    return res.status(400).json({
      error: 'Stock adjustment exceeds maximum inventory constraint of 1,000,000 units.'
    });
  }

  try {
    const result = db.recordInventoryMovement({
      productId: id,
      sellerId: product.sellerId,
      warehouseId: 'wh-dar-central',
      sku: `LM-SKU-${id}`,
      movementType: movementType || 'ADJUSTED_MANUAL',
      quantity: effectiveQty,
      performedByUserId: req.user?.id as string,
      performedByUserName: req.user?.name as string,
      performedByUserRole: req.user?.role as any,
      reason: reason.trim()
    });

    res.json({
      success: true,
      message: `Inventory movement recorded successfully. Updated calculated stock: ${result.newStock}`,
      movement: result.movement,
      newStock: result.newStock
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to record inventory adjustment' });
  }
});

// DELETE /api/products/:id
router.delete('/:id', requireRole('SUPER_ADMIN', 'ADMIN', 'CATALOG_ADMIN', 'SELLER'), requireVerified, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const isAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN' || req.user?.role === 'CATALOG_ADMIN';
  
  if (!isAdmin && req.user?.role === 'SELLER') {
    if (!isUserVerified(req.user)) {
      return res.status(403).json({
        error: 'VERIFICATION_REQUIRED',
        message: 'Seller account must be verified before deleting products.'
      });
    }
  }

  const prod = db.getDb().products.find(p => p.id === id);
  if (!prod) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const userSellerId = req.user?.sellerId || req.user?.id;
  const isOwner = prod.sellerId === userSellerId || prod.sellerId === req.user?.id || prod.sellerId === req.user?.sellerId;
  if (!isAdmin && !isOwner) {
    return res.status(403).json({ error: 'Forbidden: You do not own this product.' });
  }

  db.updateDb(d => {
    d.products = d.products.filter(p => p.id !== id);
    d.inventory = (d.inventory || []).filter(i => i.productId !== id);
  });

  db.addAuditLog({
    userId: req.user?.id as string,
    userName: req.user?.name as string,
    userRole: req.user?.role as any,
    action: 'DELETE_PRODUCT',
    entityType: 'PRODUCT',
    entityId: id,
    previousValue: `Product ${prod.name} (Seller: ${prod.sellerId}) removed from catalog and inventory`
  });

  res.json({ success: true, message: 'Product removed' });
});

export default router;

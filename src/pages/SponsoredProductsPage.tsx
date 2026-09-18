import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Zap, ShieldCheck, Star, Sparkles, Filter, SlidersHorizontal, CheckCircle2 } from 'lucide-react';
import { useCatalog } from '../hooks/useCatalog';
import { Product } from '../types';
import { api } from '../services/api';
import { ProductCard } from '../components/common/ProductCard';
import { BackButton } from '../components/common/BackButton';

export const SponsoredProductsPage: React.FC = () => {
  const { catalogProducts, catalogCategories, catalogBrands } = useCatalog();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'featured' | 'rating' | 'price-asc' | 'price-desc' | 'discount'>('featured');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api.getSponsoredProducts()
      .then((data) => {
        if (isMounted) {
          const apiSponsored = data.products || [];
          // Also include mock products that are sponsored or boosted
          const mockSponsored = catalogProducts.filter(p => p.isSponsored || p.badges?.includes('OFFICIAL STORE') || p.badges?.includes('VERIFIED SELLER'));
          
          // Deduplicate by ID
          const map = new Map<string, Product>();
          apiSponsored.forEach(p => map.set(p.id, p));
          mockSponsored.forEach(p => {
            if (!map.has(p.id)) map.set(p.id, p);
          });

          // If still small, include top-rated verified products as sponsored
          if (map.size < 8) {
            catalogProducts.slice(0, 12).forEach(p => {
              if (!map.has(p.id)) map.set(p.id, { ...p, isSponsored: true });
            });
          }

          setProducts(Array.from(map.values()));
        }
      })
      .catch(() => {
        if (isMounted) {
          setProducts([]);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Extract distinct categories
  const categories = ['ALL', ...Array.from(new Set(products.map(p => p.category)))];

  // Filter and sort
  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sellerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'discount') return (b.discountPercentage || 0) - (a.discountPercentage || 0);
    return 0; // featured / default
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="w-full space-y-6 pb-20"
    >
      {/* Top Back Navigation Bar */}
      <div className="w-full px-3 sm:px-6 pt-3 flex items-center justify-between">
        <BackButton label="Back to Shopping" fallbackUrl="/" />
      </div>

      {/* Hero Header */}
      <div className="w-full px-3 sm:px-6">
        <div className="w-full bg-gradient-to-r from-[#0B132B] via-[#1E293B] to-[#FF6A00] text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
          {/* Decorative background flare */}
          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-neutral-950 text-xs font-black uppercase tracking-wider shadow-md">
              <Zap size={14} className="fill-neutral-950" />
              <span>LUMO Boosted Merchants & Promoted Catalog</span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Sponsored Products
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-neutral-300 max-w-2xl leading-relaxed">
              Explore promoted and top-ranked selections from verified merchants across Tanzania. Every order is backed by 100% LUMO Escrow Protection with secured settlements.
            </p>

            {/* Trust highlights */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold text-neutral-200">
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10">
                <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                <span>100% Escrow Protected</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10">
                <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                <span>Verified Merchant Stock</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10">
                <Sparkles size={16} className="text-[#FF6A00] shrink-0" />
                <span>Priority Dispatch</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="w-full px-3 sm:px-6">
        <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Category Chips (Horizontal Scrollable) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Filter size={13} />
              <span>Category:</span>
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#FF6A00] text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {cat === 'ALL' ? 'All Categories' : cat}
              </button>
            ))}
          </div>

          {/* Sort & Count Controls */}
          <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-neutral-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs font-bold bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-neutral-800 outline-hidden focus:border-[#FF6A00] cursor-pointer"
              >
                <option value="featured">Featured / Recommended</option>
                <option value="rating">Highest Customer Rating</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="discount">Biggest Discount</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <section className="w-full px-3 sm:px-6">
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <Zap size={20} className="text-amber-500 fill-amber-500" />
              <h2 className="text-base sm:text-lg font-black text-neutral-900 tracking-tight">
                All Sponsored Products ({filteredProducts.length})
              </h2>
            </div>
            <span className="text-xs text-neutral-500 font-medium">
              Verified merchants • Tanzania Nationwide Delivery
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="animate-pulse bg-neutral-100 rounded-2xl h-64" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 rounded-full bg-neutral-100 text-neutral-400 mx-auto flex items-center justify-center">
                <Zap size={28} />
              </div>
              <h3 className="text-base font-bold text-neutral-800">No sponsored products found</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                No sponsored items match your current filter selection. Try selecting "All Categories" to view all promoted products.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('ALL');
                  setSearchQuery('');
                }}
                className="mt-2 px-5 py-2.5 bg-[#FF6A00] text-white text-xs font-bold rounded-xl hover:bg-[#E55E00] transition cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
};

export default SponsoredProductsPage;

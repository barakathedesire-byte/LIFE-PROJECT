import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, CheckCircle2, Award, ChevronRight, Star, ShoppingBag, Search, Store } from 'lucide-react';
import { useCatalog } from '../hooks/useCatalog';
import { ProductCard } from '../components/common/ProductCard';
import { HorizontalProductCarousel } from '../components/common/HorizontalProductCarousel';
import { BackButton } from '../components/common/BackButton';

export const BrandStoreDetailPage: React.FC = () => {
  const { catalogProducts, catalogCategories, catalogBrands } = useCatalog();

  const { brandSlug } = useParams<{ brandSlug: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Find brand
  const brand = useMemo(() => {
    return catalogBrands.find((b) => b.slug === brandSlug) || catalogBrands[0];
  }, [brandSlug]);

  // Products belonging to this brand
  const brandProducts = useMemo(() => {
    let list = catalogProducts.filter(
      (p) => p.brand.toLowerCase() === brand.name.toLowerCase() || p.sellerName.toLowerCase().includes(brand.name.toLowerCase())
    );

    if (list.length === 0) {
      // Fallback if strict match doesn't yield enough
      list = catalogProducts.slice(0, 8);
    }

    if (selectedCategory !== 'All') {
      list = list.filter((p) => p && p?.category && p?.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => p && ((p.name && p.name.toLowerCase().includes(q)) || (p.description && p.description.toLowerCase().includes(q))));
    }

    return list;
  }, [brand, selectedCategory, searchQuery]);

  const categories = useMemo(() => {
    const cats = new Set(catalogProducts.filter(p => p && p?.category).map((p) => p?.category));
    return ['All', ...Array.from(cats)];
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="w-full space-y-6 pb-16 max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-6"
    >
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <BackButton label="Back to Official Stores" fallbackUrl="/official-stores" />
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 shadow-2xs">
          <ShieldCheck size={14} className="text-amber-600" />
          <span>Official Flagship Partner Store</span>
        </div>
      </div>

      {/* Brand Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0B132B] via-[#1E293B] to-[#0B132B] text-white shadow-xl border border-neutral-800">
        <div className="absolute inset-0 opacity-20">
          <img src={brand.bannerImage} alt={brand.name} className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 p-6 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-white p-2 shadow-md flex items-center justify-center shrink-0 border border-neutral-200">
                <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-4xl font-black text-white">{brand.name} Flagship Store</h1>
                  <CheckCircle2 size={22} className="text-amber-400 fill-amber-400 text-neutral-950" />
                </div>
                <p className="text-xs text-amber-300 font-bold uppercase tracking-wider mt-0.5">
                  Verified Authorized Distributor in Tanzania
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              {brand.description}
            </p>

            <div className="flex flex-wrap gap-4 pt-1 text-xs text-neutral-300">
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl">
                <Award size={14} className="text-amber-400" />
                <span>12-24 Mo. Official Warranty</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>100% Escrow Protected</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl">
                <Store size={14} className="text-blue-400" />
                <span>{brandProducts.length} Certified Products</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder={`Search ${brand.name} products...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-900 outline-hidden focus:border-[#FF6A00]"
            />
          </div>

          <div className="text-xs text-neutral-500 font-semibold">
            Showing <strong className="text-neutral-900">{brandProducts.length}</strong> items in store
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#FF6A00] text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Brand Carousel */}
      {brandProducts.length > 3 && (
        <HorizontalProductCarousel
          title={`Top Featured ${brand.name} Products`}
          subtitle={`Best-selling certified items from ${brand.name} official warehouse`}
          badge={{ text: 'Official Stock', variant: 'navy' }}
          products={brandProducts.slice(0, 8)}
          variant="card"
        />
      )}

      {/* Products Grid */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <h2 className="text-lg sm:text-xl font-black text-neutral-900 tracking-tight">
            {brand.name} Catalog & Best Sellers
          </h2>
          <span className="text-xs font-bold text-neutral-500">
            Escrow & Warranty Backed
          </span>
        </div>

        {brandProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {brandProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 space-y-3">
            <ShoppingBag size={48} className="mx-auto text-neutral-300" />
            <h3 className="font-bold text-base text-neutral-900">No products found for this search</h3>
            <p className="text-xs text-neutral-500">Try clearing your search query or selecting &quot;All&quot; categories.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="px-4 py-2 bg-[#FF6A00] text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

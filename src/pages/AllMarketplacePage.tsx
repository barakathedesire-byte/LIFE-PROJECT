import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Search, Filter, ArrowRight, Store, Zap, SlidersHorizontal } from 'lucide-react';
import { useCatalog } from '../hooks/useCatalog';
import { ProductCard } from '../components/common/ProductCard';
import { BackButton } from '../components/common/BackButton';

export const AllMarketplacePage: React.FC = () => {
  const { catalogProducts, catalogCategories, catalogBrands } = useCatalog();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('popular');

  // Filter products based on category and search query
  const filteredProducts = useMemo(() => {
    let result = [...catalogProducts];

    if (selectedCategory !== 'All') {
      result = result.filter(
        (p) => p && p?.category && p?.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) => p && (
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.sellerName && p.sellerName.toLowerCase().includes(q)) ||
          (p?.category && p?.category.toLowerCase().includes(q))
        )
      );
    }

    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else {
      result.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
    }

    return result;
  }, [selectedCategory, searchQuery, sortBy]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="w-full px-2 sm:px-4 lg:px-6 py-6 sm:py-8 space-y-8 max-w-7xl mx-auto"
    >
      <div className="flex items-center justify-between">
        <BackButton label="Back to Home" fallbackUrl="/" />
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <ShieldCheck size={14} />
          <span>100% Escrow Protected Marketplace ({catalogProducts.length} Verified Products)</span>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-[#0B132B] text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF6A00] text-white text-xs font-black uppercase tracking-wider shadow-sm">
            <ShoppingBag size={14} />
            <span>East Africa's #1 Multi-Vendor Escrow Store</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            LUMO All Marketplace Hub
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Browse all {catalogProducts.length}+ genuine products from verified authorized merchants across Dar es Salaam, Arusha, Mwanza, and Zanzibar with secure M-Pesa escrow protection. Every item has a dedicated page with doorstep delivery & guarantees.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/official-stores"
              className="px-5 py-2.5 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2"
            >
              <span>Official Brand Stores</span>
              <ArrowRight size={15} />
            </Link>
            <Link
              to="/flash-sales"
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-xl transition border border-white/20 flex items-center gap-1.5"
            >
              <Zap size={14} className="text-amber-400" />
              <span>Flash Sales</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search marketplace items, brands, sellers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-900 outline-hidden focus:border-[#FF6A00]"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <span className="text-xs font-bold text-neutral-500 whitespace-nowrap">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-900 outline-hidden focus:border-[#FF6A00]"
            >
              <option value="popular">Most Popular & Sales</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Customer Rating</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              selectedCategory === 'All'
                ? 'bg-[#FF6A00] text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            All Categories ({catalogProducts.length})
          </button>
          {catalogCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                selectedCategory === cat.name
                  ? 'bg-[#FF6A00] text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-neutral-900 tracking-tight">
          {selectedCategory === 'All' ? 'All Marketplace Products' : selectedCategory} ({filteredProducts.length} items found)
        </h2>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-[#FF6A00] font-bold hover:underline cursor-pointer"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* ALL PRODUCTS GRID */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3.5">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200 space-y-3">
          <ShoppingBag size={48} className="mx-auto text-neutral-300" />
          <h3 className="font-bold text-base text-neutral-900">No products found</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Try adjusting your search query or selecting a different category from the marketplace.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="px-5 py-2 bg-[#FF6A00] text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Official Partner Brands Section */}
      <section className="space-y-4 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-neutral-900 tracking-tight">
            Official Partner Brands
          </h2>
          <Link to="/official-stores" className="text-xs font-bold text-[#FF6A00] hover:underline flex items-center gap-1">
            <span>View All Stores</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {catalogBrands.map((brand) => (
            <Link
              key={brand.id}
              to={`/brand/${brand.slug}`}
              className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-2xs hover:border-[#FF6A00] transition text-center space-y-1.5"
            >
              <span className="font-black text-sm text-neutral-900 block truncate">{brand.name}</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block font-bold">
                Official Partner
              </span>
            </Link>
          ))}
        </div>
      </section>
    </motion.div>
  );
};


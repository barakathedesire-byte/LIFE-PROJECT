import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  ShieldCheck,
  Star,
  Sparkles,
  Filter,
  CheckCircle2,
  Search,
  ArrowUpDown,
  Flame,
  Percent,
  Eye,
  ShoppingBag,
  Cpu,
  Award,
  BarChart3
} from 'lucide-react';
import { Product } from '../types';
import { api } from '../services/api';
import { ProductCard } from '../components/common/ProductCard';
import { BackButton } from '../components/common/BackButton';
import { useSEO } from '../hooks/useSEO';

type MetricFilter = 'all' | 'most_sold' | 'most_viewed' | 'best_rated' | 'best_discount';

export const TrendingEssentialsPage: React.FC = () => {
  useSEO({
    title: 'Trending Essentials & Auto-Detected Top Sellers | LUMO Tanzania',
    description: 'Autonomous algorithm tracking top-selling essentials, most viewed products, high-velocity daily items, and best-value household deals in Tanzania.'
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedMetric, setSelectedMetric] = useState<MetricFilter>('all');
  const [selectedPriceFilter, setSelectedPriceFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'rating' | 'sold' | 'views'>('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [engineInfo, setEngineInfo] = useState<any>(null);

  const fetchTrendingData = async () => {
    setLoading(true);
    try {
      const res = await api.getTrendingAutoDetected({
        category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
        metric: selectedMetric !== 'all' ? selectedMetric : undefined,
        limit: 100
      });

      if (res && res.products) {
        setProducts(res.products);
        if (res.engineMetrics) {
          setEngineInfo(res.engineMetrics);
        }
      } else {
        // Fallback to all products
        const allRes = await api.getProducts();
        setProducts(allRes.products || []);
      }
    } catch (err) {
      console.error('Failed to load auto-detected trending products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingData();
  }, [selectedCategory, selectedMetric]);

  // Distinct categories from returned product pool
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['ALL', ...Array.from(set)];
  }, [products]);

  // Filtered & sorted products on client side for instantaneous responsiveness
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.name.toLowerCase().includes(q);
          const matchBrand = p.brand?.toLowerCase().includes(q);
          const matchCategory = p.category?.toLowerCase().includes(q);
          if (!matchTitle && !matchBrand && !matchCategory) return false;
        }

        // Price range filter
        if (selectedPriceFilter === 'UNDER_25K' && p.price > 25000) return false;
        if (selectedPriceFilter === '25K_100K' && (p.price < 25000 || p.price > 100000)) return false;
        if (selectedPriceFilter === '100K_500K' && (p.price < 100000 || p.price > 500000)) return false;
        if (selectedPriceFilter === 'OVER_500K' && p.price < 500000) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'sold') return (b.soldCount || 0) - (a.soldCount || 0);
        if (sortBy === 'views') return (b.viewCount || 0) - (a.viewCount || 0);
        return 0; // default order preserved from backend ranking
      });
  }, [products, selectedPriceFilter, sortBy, searchQuery]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <BackButton />

      {/* Hero Banner with Auto-Detection AI Engine Visual */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B132B] via-[#1C2541] to-[#0B132B] text-white p-6 sm:p-10 border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FF6A00]/20 border border-[#FF6A00]/40 text-[#FF6A00] text-xs font-black uppercase tracking-wider">
            <Cpu className="w-4 h-4 text-[#FF6A00] animate-pulse" />
            <span>Autonomous Intelligence Engine Active</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Trending Essentials & Auto-Detected Top Performers
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Real-time automated ranking algorithm analyzing verified sales velocity, daily customer page visits, authentic ratings, and merchant fulfillment speed across Tanzania.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
              <div className="flex items-center gap-1.5 text-xs text-orange-400 font-bold mb-1">
                <Flame className="w-3.5 h-3.5" />
                <span>Sales Volume</span>
              </div>
              <p className="text-xs text-slate-300">Auto-synced on every order purchase</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
              <div className="flex items-center gap-1.5 text-xs text-blue-400 font-bold mb-1">
                <Eye className="w-3.5 h-3.5" />
                <span>Shopper Traffic</span>
              </div>
              <p className="text-xs text-slate-300">Live view engagement monitoring</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Buyer Trust</span>
              </div>
              <p className="text-xs text-slate-300">100% Escrow protected delivery</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
              <div className="flex items-center gap-1.5 text-xs text-purple-400 font-bold mb-1">
                <Percent className="w-3.5 h-3.5" />
                <span>Best Values</span>
              </div>
              <p className="text-xs text-slate-300">Price advantage vs Kariakoo retail</p>
            </div>
          </div>
        </div>

        <div className="absolute -right-12 -bottom-12 w-72 h-72 bg-[#FF6A00]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-24 -top-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Detection Mode Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
        {[
          { id: 'all', label: 'Overall Top Rank', icon: Sparkles, color: 'text-amber-500' },
          { id: 'most_sold', label: 'Most Sold', icon: Flame, color: 'text-orange-500' },
          { id: 'most_viewed', label: 'Most Viewed', icon: Eye, color: 'text-blue-500' },
          { id: 'best_rated', label: 'Top Rated Choice', icon: Star, color: 'text-yellow-500' },
          { id: 'best_discount', label: 'Best Value Deals', icon: Percent, color: 'text-emerald-500' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedMetric === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedMetric(tab.id as MetricFilter)}
              className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2 ${
                isActive
                  ? 'bg-[#0B132B] text-white border-[#0B132B] shadow-md ring-2 ring-[#FF6A00]/30'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF6A00]' : tab.color}`} />
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FF6A00]" />}
              </div>
              <span className="text-xs font-black tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search within trending */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search trending items, brands, models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#FF6A00]/20 focus:border-[#FF6A00] transition"
            />
          </div>

          {/* Quick Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Price Filter Pill */}
            <select
              value={selectedPriceFilter}
              onChange={(e) => setSelectedPriceFilter(e.target.value)}
              className="px-3 py-2 text-xs font-bold bg-slate-50 text-slate-700 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#FF6A00]"
            >
              <option value="ALL">All Price Tiers</option>
              <option value="UNDER_25K">Under TZS 25,000</option>
              <option value="25K_100K">TZS 25K - 100K</option>
              <option value="100K_500K">TZS 100K - 500K</option>
              <option value="OVER_500K">Over TZS 500,000</option>
            </select>

            {/* Sort Filter Pill */}
            <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs font-bold bg-transparent text-slate-700 focus:outline-hidden"
              >
                <option value="default">Engine Ranking</option>
                <option value="sold">Most Units Sold</option>
                <option value="views">Most Page Views</option>
                <option value="rating">Top Customer Rating</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#0B132B] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header & Auto-Detection Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold text-slate-500">
            Auto-detected <span className="text-slate-900 font-bold">{filteredProducts.length}</span> top performing items
          </p>
          {engineInfo && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Catalog Indexed
            </span>
          )}
        </div>

        {(selectedCategory !== 'ALL' || selectedPriceFilter !== 'ALL' || selectedMetric !== 'all' || searchQuery) && (
          <button
            onClick={() => {
              setSelectedCategory('ALL');
              setSelectedPriceFilter('ALL');
              setSelectedMetric('all');
              setSearchQuery('');
            }}
            className="text-xs font-bold text-[#FF6A00] hover:underline self-start sm:self-auto cursor-pointer"
          >
            Reset All Filters
          </button>
        )}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {Array.from({ length: 10 }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse space-y-3">
              <div className="w-full aspect-square bg-slate-200 rounded-xl" />
              <div className="h-4 bg-slate-200 rounded-md w-3/4" />
              <div className="h-4 bg-slate-200 rounded-md w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No matching trending essentials found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your search keywords, price filter, or category selection to find products.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('ALL');
              setSelectedPriceFilter('ALL');
              setSelectedMetric('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-[#FF6A00] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#E55E00] transition"
          >
            Clear Filters
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
  );
};

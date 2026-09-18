import React from 'react';
import { motion } from 'motion/react';
import { Award, TrendingUp, Star, ShieldCheck, Flame } from 'lucide-react';
import { useCatalog } from '../hooks/useCatalog';
import { ProductCard } from '../components/common/ProductCard';
import { BackButton } from '../components/common/BackButton';

export const TopSellersPage: React.FC = () => {
  const { catalogProducts, catalogCategories, catalogBrands } = useCatalog();

  const topSellers = [...catalogProducts]
    .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="w-full space-y-6 pb-16"
    >
      {/* Top Back Navigation */}
      <div className="w-full px-2 sm:px-4 lg:px-6 pt-3 flex items-center justify-between">
        <BackButton label="Back" fallbackUrl="/" />
      </div>

      {/* Hero */}
      <div className="w-full px-2 sm:px-4 lg:px-6">
        <div className="w-full bg-gradient-to-r from-amber-600 via-[#FF6A00] to-[#0B132B] text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/30 text-amber-300 text-xs font-black uppercase tracking-wider backdrop-blur-xs border border-amber-400/30">
              <TrendingUp size={14} />
              <span>Most Popular in East Africa</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Top Sellers & Customer Favorites
            </h1>

            <p className="text-xs sm:text-base text-amber-100 max-w-2xl leading-relaxed">
              Explore the most purchased, highest-rated products trusted by thousands of buyers across Dar es Salaam, Arusha, Mwanza, Dodoma, and Zanzibar on LUMO.
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <section className="w-full px-2 sm:px-4 lg:px-6">
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <Award size={20} className="text-amber-500" />
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                Best-Selling Products ({topSellers.length} Items)
              </h2>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Ranked by Real Sales Volume
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {topSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
};

import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Compass, ShieldCheck, Tag } from 'lucide-react';
import { useCatalog } from '../hooks/useCatalog';
import { ProductCard } from '../components/common/ProductCard';
import { BackButton } from '../components/common/BackButton';

export const NewArrivalsPage: React.FC = () => {
  const { catalogProducts, catalogCategories, catalogBrands } = useCatalog();

  const newArrivals = catalogProducts.filter(
    (p) => p && (p?.badges?.includes('NEW ARRIVAL') || p?.id?.includes('samsung') || p?.id?.includes('mens') || p?.id?.includes('kitenge') || p?.id?.includes('pampers'))
  );

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
        <div className="w-full bg-gradient-to-r from-[#0B132B] via-emerald-900 to-[#FF6A00] text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-black uppercase tracking-wider shadow-md">
              <Sparkles size={14} />
              <span>Fresh Inventory • Just Landed</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              New Arrivals & Latest Releases
            </h1>
            <p className="text-xs sm:text-base text-emerald-100 max-w-2xl leading-relaxed">
              Discover the latest 2026 electronics, trendy African fashion collections, newly stocked baby care, and home essentials just added to LUMO.
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <section className="w-full px-2 sm:px-4 lg:px-6">
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-emerald-600" />
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                Recently Added Products ({newArrivals.length} Items)
              </h2>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Fresh This Week
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
};

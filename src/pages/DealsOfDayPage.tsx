import React from 'react';
import { motion } from 'motion/react';
import { Tag, Sparkles, ShieldCheck, Flame, Percent } from 'lucide-react';
import { useCatalog } from '../hooks/useCatalog';
import { ProductCard } from '../components/common/ProductCard';
import { BackButton } from '../components/common/BackButton';

export const DealsOfDayPage: React.FC = () => {
  const { catalogProducts, catalogCategories, catalogBrands } = useCatalog();

  const dealsProducts = catalogProducts.filter(
    (p) => p.discountPercentage && p.discountPercentage >= 20
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="w-full space-y-6 pb-16"
    >
      {/* Top Back Navigation Bar */}
      <div className="w-full px-2 sm:px-4 lg:px-6 pt-3 flex items-center justify-between">
        <BackButton label="Back" fallbackUrl="/" />
      </div>

      {/* Hero Header */}
      <div className="w-full px-2 sm:px-4 lg:px-6">
        <div className="w-full bg-gradient-to-r from-[#0B132B] via-[#1E293B] to-[#FF6A00] text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-neutral-950 text-xs font-black uppercase tracking-wider shadow-md">
              <Sparkles size={14} />
              <span>Today's Handpicked Offers</span>
            </div>

            <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Deals of the Day
            </h1>

            <p className="text-[10px] sm:text-sm md:text-base text-neutral-300 max-w-2xl leading-relaxed">
              Curated daily bargains with high discounts across tech gadgets, household essentials, beauty, and fashion. Verified merchant stock with 100% LUMO Escrow protection.
            </p>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <section className="w-full px-2 sm:px-4 lg:px-6">
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <Percent size={20} className="text-[#FF6A00]" />
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                Top Daily Discounts ({dealsProducts.length} Offers)
              </h2>
            </div>
            <span className="text-xs font-bold text-[#FF6A00] bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
              Updated Every Morning
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {dealsProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
};

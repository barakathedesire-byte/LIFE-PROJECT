import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, Award, ChevronRight, Star } from 'lucide-react';
import { useCatalog } from '../hooks/useCatalog';
import { ProductCard } from '../components/common/ProductCard';
import { BackButton } from '../components/common/BackButton';

export const OfficialStoresPage: React.FC = () => {
  const { catalogProducts, catalogCategories, catalogBrands } = useCatalog();

  const officialProducts = catalogProducts.filter((p) => {
    return p && (p.badges?.includes('OFFICIAL STORE') || p.sellerName?.includes('Samsung') || p.sellerName?.includes('Apple') || p.sellerName?.includes('TechZone'));
  });

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

      {/* Hero Header */}
      <div className="w-full px-2 sm:px-4 lg:px-6">
        <div className="w-full bg-gradient-to-r from-[#0B132B] via-[#1E293B] to-[#0B132B] text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden border border-neutral-800">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-neutral-950 text-xs font-black uppercase tracking-wider shadow-md">
              <ShieldCheck size={15} />
              <span>100% Guaranteed Genuine Products</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              LUMO Official Brand Stores
            </h1>

            <p className="text-xs sm:text-base text-neutral-300 max-w-2xl leading-relaxed">
              Shop directly from authorized brand distributors for Samsung, Apple, Hisense, Tecno, Philips, Nike, and Oraimo. Enjoy full 12 to 24-month local manufacturer warranties and verified seal protection.
            </p>
          </div>
        </div>
      </div>

      {/* Brand Grid Selector */}
      <section className="w-full px-2 sm:px-4 lg:px-6">
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <h3 className="text-base font-black text-neutral-900">Featured Authorized Flagship Brands</h3>
            <span className="text-xs text-neutral-500 font-medium">Click any store for dedicated page</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {catalogBrands.map((brand) => (
              <Link
                key={brand.id}
                to={`/official-stores/${brand.slug}`}
                className="p-3.5 rounded-2xl border border-neutral-200 bg-neutral-50/60 hover:bg-white hover:border-[#FF6A00] transition-all cursor-pointer flex flex-col justify-between shadow-2xs hover:shadow-md group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-neutral-900 group-hover:text-[#FF6A00] transition-colors">{brand.name}</span>
                  <ShieldCheck size={14} className="text-amber-500" />
                </div>
                <div className="flex items-center justify-between text-[11px] text-neutral-500 font-medium">
                  <span>{brand.productCount} Products</span>
                  <ChevronRight size={13} className="text-neutral-400 group-hover:text-[#FF6A00] transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="w-full px-2 sm:px-4 lg:px-6">
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                All Official Store Inventory
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Every unit is sealed and certified by brand representatives.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              {officialProducts.length} Certified Items
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {officialProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
};

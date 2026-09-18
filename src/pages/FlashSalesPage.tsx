import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Zap, Clock, Flame, ShieldCheck, Tag, ArrowLeft } from 'lucide-react';
import { useCatalog } from '../hooks/useCatalog';
import { ProductCard } from '../components/common/ProductCard';
import { BackButton } from '../components/common/BackButton';

export const FlashSalesPage: React.FC = () => {
  const { catalogProducts, catalogCategories, catalogBrands } = useCatalog();

  const [timeLeft, setTimeLeft] = useState({
    hours: 7,
    minutes: 42,
    seconds: 19,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const flashSaleItems = catalogProducts.filter(
    (p) => p && (p.isFlashSale || p.badges?.includes('FLASH SALE') || (p.discountPercentage && p.discountPercentage >= 25))
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

      {/* Hero Header */}
      <div className="w-full px-2 sm:px-4 lg:px-6">
        <div className="w-full bg-gradient-to-r from-red-600 via-[#FF6A00] to-[#0B132B] text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/30 text-amber-300 text-xs font-black uppercase tracking-wider backdrop-blur-xs border border-amber-400/30">
              <Flame size={14} className="fill-amber-300" />
              <span>Limited Stock Flash Deals</span>
            </div>

            <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              24-Hour Flash Sale Extravaganza
            </h1>

            <p className="text-[10px] sm:text-sm md:text-base text-red-100 max-w-2xl leading-relaxed">
              Huge limited-quantity price drops with genuine East African seller warranty and escrow buyer protection on LUMO. Once the timer reaches zero, prices return to standard.
            </p>

            {/* Countdown Display */}
            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                <Clock size={16} />
                <span>Deals Refresh In:</span>
              </span>
              <div className="flex items-center gap-1.5 font-mono text-sm font-black">
                <span className="bg-black/60 px-2.5 py-1 rounded-lg border border-white/20">
                  {String(timeLeft.hours).padStart(2, '0')}h
                </span>
                <span>:</span>
                <span className="bg-black/60 px-2.5 py-1 rounded-lg border border-white/20">
                  {String(timeLeft.minutes).padStart(2, '0')}m
                </span>
                <span>:</span>
                <span className="bg-black/60 px-2.5 py-1 rounded-lg border border-white/20 text-amber-400 animate-pulse">
                  {String(timeLeft.seconds).padStart(2, '0')}s
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <section className="w-full px-2 sm:px-4 lg:px-6">
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <Zap size={20} className="text-[#FF6A00] fill-[#FF6A00]" />
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                Active Flash Deals ({flashSaleItems.length} Products)
              </h2>
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
              Live Now
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {flashSaleItems.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
};

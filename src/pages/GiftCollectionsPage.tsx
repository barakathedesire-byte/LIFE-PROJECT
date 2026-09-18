import React from 'react';
import { motion } from 'motion/react';
import { Gift, ArrowLeft, Wine } from 'lucide-react';
import { Link } from 'react-router-dom';

export const GiftCollectionsPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="w-full space-y-6 pb-16 max-w-7xl mx-auto px-4 sm:px-6 py-6"
    >
      <div className="flex items-center justify-between">
        <Link to="/category/wine-spirits" className="flex items-center gap-2 text-sm font-bold text-neutral-600 hover:text-neutral-900 transition">
          <ArrowLeft size={16} />
          Back to Wine & Spirits
        </Link>
      </div>

      <div className="bg-neutral-900 rounded-3xl p-8 sm:p-12 border border-neutral-800 text-center space-y-4">
        <div className="w-20 h-20 bg-amber-500/20 border border-amber-500/30 rounded-2xl flex items-center justify-center shrink-0 mx-auto">
          <Gift className="text-amber-400" size={36} />
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
          Gift Collections & Hampers
        </h1>
        <p className="text-sm sm:text-base text-neutral-400 max-w-xl mx-auto">
          Exclusive premium gifting options for weddings, corporate events, and special moments. Coming soon with custom engraving and luxury packaging.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
            <div className="aspect-square bg-neutral-100 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <Wine size={48} className="text-neutral-300" />
              </div>
              <div className="absolute top-4 left-4 bg-black text-white text-[10px] font-black uppercase px-2 py-1 rounded">
                Coming Soon
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-lg text-neutral-900">Luxury Celebration Hamper {i}</h3>
              <p className="text-sm text-neutral-500 mt-1">Includes premium champagne, crystal flutes, and artisan chocolates.</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-black text-neutral-900">TSH 450,000</span>
                <button disabled className="px-4 py-2 bg-neutral-200 text-neutral-500 text-xs font-bold rounded-xl cursor-not-allowed">
                  Pre-order
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

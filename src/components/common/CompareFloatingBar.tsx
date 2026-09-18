import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCompare } from '../../context/CompareContext';
import { X, Scale } from 'lucide-react';
import { CompareModal } from './CompareModal';

export const CompareFloatingBar: React.FC = () => {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (compareList.length === 0) return null;

  return (
    <>
      <AnimatePresence>
        {compareList.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl bg-white rounded-2xl shadow-2xl border border-neutral-200 p-4 flex flex-col md:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4 flex-1 w-full overflow-x-auto pb-2 md:pb-0">
              <div className="text-sm font-bold text-neutral-800 shrink-0">
                Compare ({compareList.length}/3)
              </div>
              
              <div className="flex items-center gap-3">
                {compareList.map((product) => (
                  <div key={product.id} className="relative flex items-center gap-2 bg-neutral-50 rounded-lg p-2 border border-neutral-200 min-w-[150px]">
                    <img src={(product as any).image || product.images?.[0]} alt={product.name} className="w-8 h-8 object-cover rounded" />
                    <div className="truncate text-xs font-medium text-neutral-700 w-24">
                      {product.name}
                    </div>
                    <button
                      onClick={() => removeFromCompare(product.id)}
                      className="absolute -top-2 -right-2 bg-white border border-neutral-200 rounded-full p-0.5 text-neutral-400 hover:text-red-500 shadow-sm"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                
                {Array.from({ length: 3 - compareList.length }).map((_, i) => (
                  <div key={`empty-${i}`} className="w-[150px] h-[50px] rounded-lg border-2 border-dashed border-neutral-200 flex items-center justify-center text-xs text-neutral-400 font-medium">
                    Add Product
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
              <button
                onClick={clearCompare}
                className="px-4 py-2 text-sm font-bold text-neutral-500 hover:text-neutral-700 transition"
              >
                Clear
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                disabled={compareList.length < 2}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold transition ${
                  compareList.length >= 2 
                    ? 'bg-[#FF6A00] hover:bg-[#E55E00] text-white shadow-md' 
                    : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                }`}
              >
                <Scale size={18} />
                Compare Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CompareModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

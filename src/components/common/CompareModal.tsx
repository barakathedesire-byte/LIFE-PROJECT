import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCompare } from '../../context/CompareContext';
import { X, Star, ShieldCheck, Check } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({ isOpen, onClose }) => {
  const { compareList } = useCompare();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-100 shrink-0">
            <div>
              <h2 className="text-xl font-black text-neutral-900">Compare Products</h2>
              <p className="text-sm text-neutral-500">Side-by-side comparison of your selected items.</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-neutral-100 transition text-neutral-500"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content area */}
          <div className="p-6 overflow-y-auto flex-1">
            <div className="grid grid-cols-4 gap-6 min-w-[800px]">
              
              {/* Properties Column */}
              <div className="space-y-6 pt-48 font-bold text-sm text-neutral-500">
                <div className="h-10 flex items-center">Price</div>
                <div className="h-10 flex items-center">Rating</div>
                <div className="h-10 flex items-center">Brand</div>
                <div className="h-10 flex items-center">Category</div>
                <div className="h-10 flex items-center">Free Delivery</div>
                <div className="h-10 flex items-center">Condition</div>
                <div className="h-10 flex items-center">Stock</div>
              </div>

              {/* Product Columns */}
              {compareList.map((product) => (
                <div key={product.id} className="space-y-6">
                  {/* Product Summary */}
                  <div className="h-48 flex flex-col gap-3">
                    <div className="w-full h-28 bg-neutral-100 rounded-xl overflow-hidden">
                      <img src={(product as any).image || product.images?.[0]} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <h3 className="font-bold text-sm text-neutral-900 line-clamp-2">{product.name}</h3>
                  </div>

                  {/* Price */}
                  <div className="h-10 flex items-center font-black text-[#FF6A00] text-lg">
                    {formatCurrency(product.price)}
                  </div>

                  {/* Rating */}
                  <div className="h-10 flex items-center gap-1 text-sm font-bold text-neutral-700">
                    <Star size={16} className="text-amber-400 fill-amber-400" />
                    {product.rating}
                    <span className="text-neutral-400 text-xs">({product.reviewCount || (product as any).reviews || 0})</span>
                  </div>

                  {/* Brand */}
                  <div className="h-10 flex items-center text-sm font-medium text-neutral-800">
                    {product.brand}
                  </div>

                  {/* Category */}
                  <div className="h-10 flex items-center text-sm font-medium text-neutral-800">
                    {product?.category || 'General'}
                  </div>

                  {/* Free Delivery */}
                  <div className="h-10 flex items-center text-sm">
                    {product.freeDeliveryEligible ? (
                      <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">
                        <Check size={14} /> Yes
                      </span>
                    ) : (
                      <span className="text-neutral-400">No</span>
                    )}
                  </div>

                  {/* Condition */}
                  <div className="h-10 flex items-center text-sm font-medium text-neutral-800 capitalize">
                    Brand New
                  </div>

                  {/* Stock */}
                  <div className="h-10 flex items-center text-sm font-medium text-neutral-800">
                    {product.stock > 0 ? (
                      <span className="text-emerald-600">In Stock ({product.stock})</span>
                    ) : (
                      <span className="text-red-500">Out of Stock</span>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Empty place holders if < 3 */}
              {Array.from({ length: 3 - compareList.length }).map((_, i) => (
                <div key={`empty-col-${i}`} className="space-y-6">
                  <div className="h-48 border-2 border-dashed border-neutral-200 rounded-2xl flex flex-col items-center justify-center text-neutral-400 bg-neutral-50/50">
                    <div className="font-medium text-sm">Empty Slot</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

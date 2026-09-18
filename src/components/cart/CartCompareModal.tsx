import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCompare } from '../../context/CompareContext';
import { useCart } from '../../context/CartContext';
import {
  X,
  Scale,
  Check,
  ShieldCheck,
  Star,
  Sparkles,
  SlidersHorizontal,
  Loader2,
  Trash2,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { Link } from 'react-router-dom';

export const CartCompareModal: React.FC = () => {
  const { compareModalOpen, activeComparison, isLoadingComparison, closeCompareModal } = useCompare();
  const { removeFromCart } = useCart();
  const [highlightDifferences, setHighlightDifferences] = useState(true);

  if (!compareModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-neutral-200 my-auto"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 bg-neutral-50/70 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF6A00] flex items-center justify-center shrink-0">
                <Scale size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-neutral-900">
                    Cart Product Comparison
                  </h2>
                  {activeComparison?.sharedSubcategory && (
                    <span className="text-[11px] font-bold bg-[#0B132B] text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                      {activeComparison.sharedSubcategory}
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500">
                  Side-by-side specification & price breakdown verified by LUMO catalog service.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Highlight Differences Toggle */}
              {activeComparison && (
                <button
                  type="button"
                  onClick={() => setHighlightDifferences(!highlightDifferences)}
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                    highlightDifferences
                      ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-2xs'
                      : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <SlidersHorizontal size={13} className={highlightDifferences ? 'text-amber-600' : ''} />
                  <span>{highlightDifferences ? 'Differences Highlighted' : 'Highlight Differences'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={closeCompareModal}
                className="p-2 rounded-full hover:bg-neutral-200 text-neutral-500 transition cursor-pointer"
                aria-label="Close comparison modal"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
            {isLoadingComparison ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-500">
                <Loader2 size={32} className="animate-spin text-[#FF6A00]" />
                <p className="text-xs font-bold">Verifying subcategory specifications & building comparison matrix...</p>
              </div>
            ) : !activeComparison || !activeComparison.products || activeComparison.products.length < 2 ? (
              <div className="py-16 text-center text-neutral-500 space-y-2">
                <Info size={32} className="mx-auto text-neutral-400" />
                <h3 className="font-bold text-sm text-neutral-800">No Eligible Comparison Available</h3>
                <p className="text-xs max-w-md mx-auto">
                  To compare items in your cart, you must have 2 to 4 products that share the same subcategory.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Mobile difference toggle */}
                <div className="sm:hidden flex justify-end">
                  <button
                    type="button"
                    onClick={() => setHighlightDifferences(!highlightDifferences)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                      highlightDifferences
                        ? 'bg-amber-50 text-amber-900 border-amber-300'
                        : 'bg-white text-neutral-600 border-neutral-200'
                    }`}
                  >
                    <SlidersHorizontal size={13} />
                    <span>{highlightDifferences ? 'Differences Highlighted' : 'Highlight Differences'}</span>
                  </button>
                </div>

                {/* Side-by-Side Table */}
                <div className="overflow-x-auto border border-neutral-200 rounded-2xl bg-white shadow-2xs">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-neutral-200 bg-neutral-50/80">
                        <th className="p-4 w-48 text-xs font-extrabold text-neutral-500 uppercase tracking-wider sticky left-0 bg-neutral-50/95 z-10">
                          Product / Feature
                        </th>
                        {activeComparison.products.map((prod) => (
                          <th key={prod.id} className="p-4 align-top w-64 min-w-[220px]">
                            <div className="space-y-3">
                              {/* Product Thumbnail */}
                              <div className="w-full aspect-square max-h-36 bg-neutral-100 rounded-xl p-2 flex items-center justify-center overflow-hidden border border-neutral-200/80">
                                <img
                                  src={prod.thumbnail || (prod.images && prod.images[0])}
                                  alt={prod.name}
                                  className="w-full h-full object-contain mix-blend-multiply"
                                />
                              </div>

                              <div>
                                <span className="text-[10px] font-black uppercase text-red-700 tracking-wider">
                                  {prod.brand}
                                </span>
                                <h4 className="text-xs font-bold text-neutral-900 line-clamp-2 leading-snug">
                                  {prod.name}
                                </h4>
                                <div className="text-sm font-extrabold text-neutral-950 mt-1">
                                  {formatCurrency(prod.price)}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 pt-1">
                                <Link
                                  to={`/products/${prod.id}`}
                                  target="_blank"
                                  className="text-[11px] font-bold text-neutral-600 hover:text-red-700 flex items-center gap-1 bg-neutral-100 px-2 py-1 rounded-lg transition"
                                >
                                  <span>View Details</span>
                                  <ExternalLink size={11} />
                                </Link>
                              </div>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-neutral-200/70 text-xs">
                      {activeComparison.comparisonMatrix.map((row, idx) => {
                        const isDiff = highlightDifferences && row.hasDifference;
                        const isGroupHeader = idx === 0 || row.group !== activeComparison.comparisonMatrix[idx - 1]?.group;

                        return (
                          <React.Fragment key={`${row.label}-${idx}`}>
                            {isGroupHeader && row.group && (
                              <tr className="bg-neutral-100/70">
                                <td
                                  colSpan={(activeComparison.products?.length || 0) + 1}
                                  className="px-4 py-2 text-[11px] font-black text-neutral-700 uppercase tracking-wider"
                                >
                                  {row.group}
                                </td>
                              </tr>
                            )}
                            <tr
                              className={`transition-colors ${
                                isDiff ? 'bg-amber-50/50 hover:bg-amber-50' : 'hover:bg-neutral-50/60'
                              }`}
                            >
                              <td className="p-3.5 font-bold text-neutral-700 sticky left-0 bg-white/95 z-10 border-r border-neutral-100">
                                <div className="flex items-center gap-1.5">
                                  <span>{row.label}</span>
                                  {isDiff && (
                                    <span
                                      className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"
                                      title="Values differ across items"
                                    />
                                  )}
                                </div>
                              </td>
                              {activeComparison.products.map((prod) => {
                                const val = row.values[prod.id];
                                const formattedVal =
                                  typeof val === 'number' && row.label === 'Price'
                                    ? formatCurrency(val)
                                    : String(val !== undefined && val !== null ? val : '—');

                                return (
                                  <td
                                    key={prod.id}
                                    className={`p-3.5 text-neutral-800 ${
                                      isDiff ? 'font-semibold text-neutral-900' : 'font-medium'
                                    }`}
                                  >
                                    {formattedVal}
                                  </td>
                                );
                              })}
                            </tr>
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between shrink-0">
            <p className="text-xs text-neutral-500">
              Tip: Keep your preferred item in cart and remove the alternatives when you are ready to checkout.
            </p>
            <button
              type="button"
              onClick={closeCompareModal}
              className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              Done Comparing
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

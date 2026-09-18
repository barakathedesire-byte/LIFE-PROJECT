import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { formatCurrency } from '../utils/formatters';
import { BackButton } from '../components/common/BackButton';
import { CartCompareModal } from '../components/cart/CartCompareModal';
import {
  Trash2,
  Heart,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Tag,
  Truck,
  RotateCcw,
  Check,
  Sparkles,
  Bookmark,
  Scale
} from 'lucide-react';
import { EscrowBadge } from '../components/common/EscrowBadge';

export const CartPage: React.FC = () => {
  const {
    cart,
    savedForLater,
    removeFromCart,
    updateQuantity,
    saveItemForLater,
    moveToCartFromSaved,
    removeFromSaved,
    clearCart,
    subtotal,
    estimatedDeliveryFee,
    voucherDiscountAmount,
    finalTotal,
    voucherCode,
    applyVoucher,
    removeVoucher,
  } = useCart();

  const { toggleWishlist, isInWishlist } = useWishlist();
  const { getCartComparisonGroups, openCompareByIds } = useCompare();
  const [couponInput, setCouponInput] = useState('');
  const navigate = useNavigate();

  const comparisonGroups = getCartComparisonGroups(cart);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    applyVoucher(couponInput.trim());
    setCouponInput('');
  };

  const handleMoveToWishlist = (item: any) => {
    toggleWishlist(item.product);
    removeFromCart(item.productId, item.selectedVariations);
  };

  if (cart.length === 0 && savedForLater.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full px-4 sm:px-6 py-12"
      >
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-xs space-y-4">
          <div className="w-20 h-20 rounded-full bg-orange-50 text-[#FF6A00] flex items-center justify-center mx-auto">
            <ShoppingBag size={36} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-neutral-900">Your Shopping Cart is Empty</h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 leading-relaxed">
              Explore authentic products across Tanzania with guaranteed LUMO Escrow buyer protection.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <BackButton label="Go Back" fallbackUrl="/" />
            <Link
              to="/marketplace"
              className="px-6 py-3 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition"
            >
              Start Shopping
            </Link>
            <Link
              to="/deals"
              className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs sm:text-sm rounded-xl transition"
            >
              View Today&apos;s Deals
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="w-full px-2 sm:px-4 lg:px-6 py-4 sm:py-8 space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <BackButton label="Back" fallbackUrl="/products" />
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
              Shopping Cart ({cart.reduce((acc, i) => acc + i.quantity, 0)} items)
            </h1>
            <p className="text-xs text-neutral-500">
              All orders protected by LUMO Escrow guarantee
            </p>
          </div>
        </div>

        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs font-bold text-neutral-500 hover:text-red-600 cursor-pointer transition"
          >
            Clear Cart
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Cart Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Cart Comparison Banner (When 2+ items share the same subcategory) */}
          {comparisonGroups.length > 0 && (
            <div className="space-y-3">
              {comparisonGroups.map((group) => (
                <div
                  key={group.subcategory}
                  className="bg-gradient-to-r from-[#0B132B] via-[#1E293B] to-[#0B132B] text-white p-3.5 sm:p-4 rounded-2xl border border-neutral-700/80 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#FF6A00]/20 text-[#FF6A00] border border-[#FF6A00]/40 flex items-center justify-center shrink-0">
                      <Scale size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-black text-white">
                          Compare {group.subcategory} in Cart
                        </h4>
                        <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-400/30">
                          {group.items?.length || 0} Products Match
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-300 mt-0.5 leading-relaxed">
                        Compare technical specs, local warranties, prices & verified seller ratings side-by-side.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openCompareByIds((group.items || []).map((i) => i.productId || i.product.id))}
                    className="shrink-0 w-full sm:w-auto px-4 py-2 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer active:scale-98"
                  >
                    <Scale size={14} />
                    <span>Compare Now ({group.items?.length || 0})</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {cart.length > 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs divide-y divide-neutral-100 overflow-hidden">
              {cart.map((item, idx) => {
                const isSaved = isInWishlist(item.productId);
                const itemSubcat = item.product.subcategory || item.product.category || 'General';
                const hasMatchingGroup = comparisonGroups.some((g) => g.subcategory === itemSubcat);

                return (
                  <div key={`${item.productId}-${idx}`} className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-center">
                    {/* Thumbnail */}
                    <Link
                      to={`/products/${item.productId}`}
                      className="w-20 h-20 sm:w-24 sm:h-24 bg-neutral-50 rounded-xl p-2 border border-neutral-100 shrink-0 flex items-center justify-center"
                    >
                      <img
                        src={item.product.thumbnail || null}
                        alt={item.product.name}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-neutral-500">
                        <span className="font-bold text-red-700 uppercase">{item.product.brand}</span>
                        <span className="text-[10px] bg-neutral-100 px-2 py-0.5 rounded">
                          Seller: {item.product.sellerName}
                        </span>
                      </div>

                      <Link
                        to={`/products/${item.productId}`}
                        className="font-bold text-xs sm:text-sm text-neutral-900 hover:text-red-700 line-clamp-1 block transition-colors"
                      >
                        {item.product.name}
                      </Link>

                      {/* Selected Variations */}
                      {item.selectedVariations && Object.keys(item.selectedVariations).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {Object.entries(item.selectedVariations).map(([k, v]) => (
                            <span
                              key={k}
                              className="text-[10px] bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded font-medium"
                            >
                              {k}: <strong>{v}</strong>
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="pt-1 flex items-baseline gap-2">
                        <span className="font-extrabold text-sm sm:text-base text-neutral-900">
                          {formatCurrency(item.unitPrice)}
                        </span>
                        {item.product.oldPrice && item.product.oldPrice > item.unitPrice && (
                          <span className="text-xs text-neutral-400 line-through">
                            {formatCurrency(item.product.oldPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                      <div className="flex items-center border border-neutral-200 rounded-lg bg-neutral-50 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1, item.selectedVariations)}
                          className="px-2.5 py-1 text-xs font-bold hover:bg-neutral-200 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-xs font-black text-neutral-900 bg-white min-w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1, item.selectedVariations)}
                          className="px-2.5 py-1 text-xs font-bold hover:bg-neutral-200 cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        {hasMatchingGroup && (
                          <button
                            type="button"
                            onClick={() => {
                              const matchingGroup = comparisonGroups.find((g) => g.subcategory === itemSubcat);
                              if (matchingGroup) {
                                openCompareByIds(matchingGroup.items.map((i) => i.productId || i.product.id));
                              }
                            }}
                            className="text-[#FF6A00] hover:text-[#E55E00] font-bold flex items-center gap-1 cursor-pointer"
                            title="Compare with other items in this category"
                          >
                            <Scale size={13} />
                            <span className="hidden sm:inline">Compare</span>
                          </button>
                        )}
                        <button
                          onClick={() => saveItemForLater(item.productId, item.selectedVariations)}
                          className="text-neutral-500 hover:text-neutral-800 flex items-center gap-1 cursor-pointer"
                          title="Save for Later"
                        >
                          <Bookmark size={13} />
                          <span className="hidden sm:inline">Save</span>
                        </button>
                        <button
                          onClick={() => handleMoveToWishlist(item)}
                          className="text-neutral-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                        >
                          <Heart size={13} className={isSaved ? 'fill-red-600 text-red-600' : ''} />
                          <span className="hidden sm:inline">Wishlist</span>
                        </button>
                        <button
                          onClick={() => removeFromCart(item.productId, item.selectedVariations)}
                          className="text-neutral-400 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={14} />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 text-center text-xs text-neutral-500">
              Your active cart is empty, but you have saved items below.
            </div>
          )}

          {/* Saved For Later Section */}
          {savedForLater.length > 0 && (
            <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-2xs space-y-4">
              <h3 className="font-extrabold text-sm text-neutral-900 pb-2 border-b border-neutral-100 flex items-center gap-2">
                <Bookmark size={16} className="text-red-700" />
                <span>Saved For Later ({savedForLater.length} items)</span>
              </h3>

              <div className="divide-y divide-neutral-100">
                {savedForLater.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product.thumbnail || null}
                        alt={item.product.name}
                        className="w-12 h-12 rounded-lg object-contain border border-neutral-100 shrink-0"
                      />
                      <div>
                        <Link
                          to={`/products/${item.productId}`}
                          className="font-bold text-neutral-900 hover:text-red-700 line-clamp-1"
                        >
                          {item.product.name}
                        </Link>
                        <span className="font-black text-neutral-900 block mt-0.5">
                          {formatCurrency(item.unitPrice)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => moveToCartFromSaved(item.productId, item.selectedVariations)}
                        className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-lg transition cursor-pointer"
                      >
                        Move to Cart
                      </button>
                      <button
                        onClick={() => removeFromSaved(item.productId, item.selectedVariations)}
                        className="p-1.5 text-neutral-400 hover:text-red-700 cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <EscrowBadge />
        </div>

        {/* Right: Order Summary & Checkout CTA (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-2xs space-y-4">
            <h3 className="font-extrabold text-base text-neutral-900 pb-3 border-b border-neutral-100">
              Order Summary
            </h3>

            {/* Price Calculations */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal:</span>
                <span className="font-bold text-neutral-900">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between text-neutral-600">
                <span className="flex items-center gap-1">
                  <span>Estimated Delivery:</span>
                </span>
                <span className="font-bold text-neutral-900">
                  {estimatedDeliveryFee === 0 ? (
                    <span className="text-emerald-700 font-extrabold">FREE</span>
                  ) : (
                    formatCurrency(estimatedDeliveryFee)
                  )}
                </span>
              </div>

              <div className="flex justify-between text-neutral-600">
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <ShieldCheck size={13} />
                  <span>SokoDirect Escrow Hold:</span>
                </span>
                <span className="text-emerald-700 font-bold">100% FREE</span>
              </div>

              {voucherCode && (
                <div className="flex justify-between text-red-700 font-semibold pt-1 border-t border-dashed border-neutral-200">
                  <span className="flex items-center gap-1">
                    <Tag size={13} />
                    <span>Coupon ({voucherCode}):</span>
                  </span>
                  <span>-{formatCurrency(voucherDiscountAmount)}</span>
                </div>
              )}

              <div className="pt-3 border-t border-neutral-200 flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-black text-neutral-900 block">Total Payable:</span>
                  <span className="text-[10px] text-neutral-400">VAT & Taxes Included</span>
                </div>
                <span className="text-xl font-black text-red-700">
                  {formatCurrency(finalTotal)}
                </span>
              </div>
            </div>

            {/* Voucher Coupon Box */}
            <div className="pt-2">
              {voucherCode ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-emerald-600" />
                    <span className="font-bold text-emerald-900">
                      &quot;{voucherCode}&quot; applied successfully!
                    </span>
                  </div>
                  <button
                    onClick={removeVoucher}
                    className="text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo Code (e.g. KARIBU10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs uppercase font-bold outline-hidden focus:border-red-600"
                    />
                    <button
                      type="submit"
                      disabled={!couponInput.trim()}
                      className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  <p className="text-[10px] text-neutral-400">
                    Use code <strong className="text-red-700">KARIBU10</strong> for 10% off your entire order
                  </p>
                </form>
              )}
            </div>

            {/* Checkout CTA */}
            {cart.length > 0 && (
              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="w-full py-3.5 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-black text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              >
                <span>Proceed to Escrow Checkout</span>
                <ArrowRight size={16} />
              </button>
            )}

            <Link
              to="/marketplace"
              className="block text-center text-xs font-bold text-neutral-600 hover:text-[#FF6A00] transition"
            >
              ← Continue Shopping (All Marketplace Products)
            </Link>
          </div>
        </div>
      </div>

      {/* Cart-Specific Subcategory Product Comparison Dialog */}
      <CartCompareModal />
    </motion.div>
  );
};

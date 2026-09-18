import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { RatingStars } from '../components/common/RatingStars';
import { BackButton } from '../components/common/BackButton';

export const WishlistPage: React.FC = () => {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (product: any) => {
    addToCart(product, 1);
  };

  if (wishlist.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="max-w-xl mx-auto px-4 py-16 text-center space-y-4"
      >
        <div className="w-16 h-16 rounded-full bg-orange-50 text-[#FF6A00] flex items-center justify-center mx-auto">
          <Heart size={30} />
        </div>
        <h2 className="text-xl font-extrabold text-neutral-900">Your Wishlist is Empty</h2>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto">
          Save your favorite products while browsing to compare prices, check flash deals and buy later.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <BackButton label="Go Back" fallbackUrl="/" />
          <Link
            to="/products"
            className="inline-block px-5 py-2.5 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            Explore Products
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="w-full px-2 sm:px-4 lg:px-6 py-6 sm:py-8 space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <BackButton label="Back" fallbackUrl="/" />
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
              My Wishlist ({wishlist.length} Saved Items)
            </h1>
            <p className="text-xs text-neutral-500">Items saved to buy or track price drops</p>
          </div>
        </div>

        <button
          onClick={clearWishlist}
          className="text-xs font-bold text-neutral-500 hover:text-red-600 cursor-pointer transition"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {wishlist.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl border border-neutral-200/90 p-4 shadow-2xs flex flex-col justify-between space-y-3 relative group hover:border-orange-300 transition-colors"
          >
            <button
              onClick={() => removeFromWishlist(product.id)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 text-neutral-400 hover:text-red-600 hover:bg-white shadow-xs border border-neutral-100 cursor-pointer z-10"
              title="Remove from wishlist"
            >
              <Trash2 size={15} />
            </button>

            <Link
              to={`/products/${product.id}`}
              className="aspect-square bg-neutral-50 rounded-xl p-3 flex items-center justify-center overflow-hidden"
            >
              <img
                src={product.thumbnail || null}
                alt={product.name}
                className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
              />
            </Link>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#FF6A00] uppercase">{product.brand}</span>
              <Link
                to={`/products/${product.id}`}
                className="font-bold text-xs sm:text-sm text-neutral-900 hover:text-[#FF6A00] line-clamp-2 block leading-snug"
              >
                {product.name}
              </Link>
              <RatingStars rating={product.rating} reviewCount={product.reviewCount} size={12} />

              <div className="pt-1 flex items-baseline gap-2">
                <span className="text-sm sm:text-base font-black text-neutral-950">
                  {formatCurrency(product.price)}
                </span>
                {product.oldPrice && product.oldPrice > product.price && (
                  <span className="text-xs text-neutral-400 line-through">
                    {formatCurrency(product.oldPrice)}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => handleAddToCart(product)}
              className="w-full py-2 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ShoppingBag size={14} />
              <span>Add to Cart</span>
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Zap, ShoppingBag, Check } from 'lucide-react';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { RatingStars } from './RatingStars';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { LumoStarIcon } from './LumoStarIcon';

interface ProductCardProps {
  product: Product;
  showSeller?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, showSeller = true }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const isSaved = isInWishlist(product?.id);
  const badges = product?.badges || [];
  const isPromo = badges.includes('PROMOTION') || (product.oldPrice && product.oldPrice > product.price);
  const isSponsored = product.isSponsored || badges.includes('SPONSORED');
  const isVerifiedSeller = badges.includes('OFFICIAL STORE') || badges.includes('VERIFIED') || (product.sellerName && !product.sellerName.toLowerCase().includes('unverified'));

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div
      onClick={() => navigate(`/products/${product.id}`)}
      className="group relative bg-white rounded-xl border border-neutral-200/80 hover:border-[#FF6A00]/60 hover:shadow-md transition-all duration-200 flex flex-col h-full overflow-hidden cursor-pointer"
    >
      {/* Top Badges & Wishlist Heart */}
      <div className="absolute top-2 left-2 right-2 z-10 flex items-start justify-between pointer-events-none">
        <div className="flex flex-col gap-1 items-start">
          {product.trendingRank && product.trendingRank <= 10 && (
            <span className="bg-slate-900 text-white border border-slate-700 text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1">
              <span className="text-[#FF6A00]">#{product.trendingRank}</span>
              <span>TRENDING</span>
            </span>
          )}

          {product.detectionBadges && product.detectionBadges.length > 0 && !product.trendingRank && (
            <span className="bg-[#FF6A00] text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-2xs">
              {product.detectionBadges[0]}
            </span>
          )}

          {product.discountPercentage && product.discountPercentage > 0 ? (
            <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-2xs">
              -{product.discountPercentage}%
            </span>
          ) : isPromo ? (
            <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-2xs">
              PROMO
            </span>
          ) : null}

          {isSponsored && (
            <span className="bg-amber-500 text-neutral-950 text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-2xs">
              <Zap size={9} className="text-neutral-950 fill-neutral-950" />
              SPONSORED
            </span>
          )}

          {isVerifiedSeller && (
            <span className="bg-orange-50 text-[#B84000] border border-orange-200/80 text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 shadow-2xs">
              <LumoStarIcon size={10} color="#FF6A00" />
              VERIFIED
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleWishlistToggle}
          aria-label="Save to Wishlist"
          className={`pointer-events-auto p-1.5 rounded-full transition-all duration-200 shadow-2xs cursor-pointer ${
            isSaved
              ? 'bg-red-50 text-red-600 border border-red-200 scale-105'
              : 'bg-white/90 text-neutral-400 hover:text-red-600 hover:bg-white border border-neutral-100'
          }`}
        >
          <Heart size={13} className={isSaved ? 'fill-red-600 text-red-600' : ''} />
        </button>
      </div>

      {/* Image Container */}
      <div className="relative aspect-square w-full bg-neutral-50/60 overflow-hidden flex items-center justify-center p-2">
        <img
          src={product.thumbnail || null}
          alt={product.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300 ease-out"
        />

        {product.freeDeliveryEligible && (
          <div className="absolute bottom-1 left-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[8px] font-bold px-1 py-0.2 rounded shadow-2xs">
            Free Delivery
          </div>
        )}

        {/* Hover Add to Cart Button on Desktop Only */}
        <div className="hidden md:block absolute bottom-2 right-2 left-2 z-20 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
          <button
            type="button"
            onClick={handleAddToCart}
            className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer ${
              added
                ? 'bg-emerald-600 text-white'
                : 'bg-[#0B132B] hover:bg-[#1C2541] text-white active:scale-95'
            }`}
          >
            {added ? (
              <>
                <Check size={13} />
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingBag size={13} />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content Container - Compact, clean & streamlined */}
      <div className="p-2 sm:p-2.5 flex flex-col flex-1 justify-between gap-1">
        <div>
          {/* Brand & Seller */}
          <div className="flex items-center justify-between text-[9px] text-neutral-500 mb-0.5">
            <span className="font-semibold uppercase tracking-wider text-[#FF6A00]">
              {product.brand}
            </span>
            {showSeller && (
              <span className="truncate max-w-[90px] text-[9px] text-neutral-600 flex items-center gap-0.5" title={product.sellerName}>
                {product.sellerCity}
              </span>
            )}
          </div>

          {/* Product Title */}
          <h3 className="font-medium text-xs text-neutral-900 group-hover:text-[#FF6A00] line-clamp-2 leading-snug transition-colors">
            {product.name}
          </h3>

          {/* Rating Row & Popularity metrics */}
          <div className="mt-1 flex items-center justify-between gap-1 flex-wrap">
            <RatingStars rating={product.rating} reviewCount={product.reviewCount} size={10} />
            {product.soldCount && product.soldCount > 0 ? (
              <span className="text-[9px] font-bold text-slate-500">
                {product.soldCount.toLocaleString()} sold
              </span>
            ) : product.viewCount && product.viewCount > 0 ? (
              <span className="text-[9px] font-medium text-slate-400">
                {product.viewCount.toLocaleString()} views
              </span>
            ) : null}
          </div>
        </div>

        {/* Pricing Row - Clean and compact */}
        <div className="pt-1 border-t border-neutral-100 flex items-baseline justify-between gap-1">
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-extrabold text-neutral-950 leading-tight">
              {formatCurrency(product.price)}
            </span>
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="text-[9px] text-neutral-400 line-through leading-none">
                {formatCurrency(product.oldPrice)}
              </span>
            )}
          </div>
          {isPromo && (
            <span className="text-[8px] font-bold text-red-600 bg-red-50 px-1 py-0.2 rounded">
              Special Deal
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

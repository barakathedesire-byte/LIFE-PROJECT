import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { api } from '../../services/api';
import { useCatalog } from '../../hooks/useCatalog';

export interface HorizontalProductCarouselProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: {
    text: string;
    variant?: 'red' | 'amber' | 'emerald' | 'navy' | 'orange' | 'purple';
  } | React.ReactNode;
  icon?: React.ReactNode;
  viewAllLink?: string;
  viewAllLabel?: string;
  headerRight?: React.ReactNode;
  products?: Product[];
  dataSource?: {
    category?: string;
    subcategory?: string;
    brand?: string;
    badge?: string;
    isFlashSale?: boolean;
    freeDelivery?: boolean;
    sellerId?: string;
    limit?: number;
  };
  itemWidthClass?: string;
  containerClassName?: string;
  showSeller?: boolean;
  emptyMessage?: string;
  showScrollButtons?: boolean;
  footer?: React.ReactNode;
  variant?: 'default' | 'card' | 'elevated' | 'flash' | 'accent';
  hideIfEmpty?: boolean;
}

export const HorizontalProductCarousel: React.FC<HorizontalProductCarouselProps> = ({
  title,
  subtitle,
  badge,
  icon,
  viewAllLink,
  viewAllLabel = 'View All',
  headerRight,
  products: initialProducts,
  dataSource,
  itemWidthClass = 'w-[168px] sm:w-[210px] md:w-[228px] lg:w-[240px]',
  containerClassName = '',
  showSeller = true,
  emptyMessage = 'No products available at the moment.',
  showScrollButtons = true,
  footer,
  variant = 'card',
  hideIfEmpty = false
}) => {
  const { catalogProducts, catalogCategories, catalogBrands } = useCatalog();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [loading, setLoading] = useState<boolean>(!initialProducts && !!dataSource);
  const [error, setError] = useState<string | null>(null);

  // If dataSource is provided and initialProducts is not, fetch products dynamically
  useEffect(() => {
    if (initialProducts) {
      setProducts(initialProducts);
      setLoading(false);
      return;
    }

    if (!dataSource) {
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchProducts = async () => {
      try {
        const queryParams: any = {};
        if (dataSource.category) queryParams.category = dataSource.category;
        if (dataSource.brand) queryParams.brand = dataSource.brand;
        if (dataSource.badge) queryParams.badge = dataSource.badge;
        if (dataSource.isFlashSale) queryParams.isFlashSale = 'true';
        if (dataSource.limit) queryParams.limit = dataSource.limit;

        const res = await api.getProducts(queryParams);
        let list: Product[] = res?.products || [];

        if (isMounted) {
          setProducts(list);
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Error loading carousel products:', err);
        if (isMounted) {
          setProducts([]);
          setLoading(false);
          setError('Failed to load products.');
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [initialProducts, dataSource]);

  // Check scroll position to toggle navigation buttons
  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll, { passive: true });
    }
    return () => {
      if (el) {
        el.removeEventListener('scroll', checkScroll);
      }
      window.removeEventListener('resize', checkScroll);
    };
  }, [products, loading, checkScroll]);

  // Scroll smoothly left or right
  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  // Optional Mouse Drag Support for Desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    setIsDragging(true);
    setStartX(e.pageX - el.offsetLeft);
    setScrollLeftState(el.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const el = scrollRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX) * 1.5;
    el.scrollLeft = scrollLeftState - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  if (hideIfEmpty && !loading && products.length === 0) {
    return null;
  }

  // Variant styling
  const variantStyles = {
    card: 'bg-white rounded-3xl p-4 sm:p-6 border border-neutral-200/90 shadow-2xs space-y-4',
    elevated: 'bg-white rounded-3xl p-4 sm:p-6 border border-neutral-200/80 shadow-md space-y-4',
    flash: 'bg-gradient-to-b from-red-50/50 via-white to-white rounded-3xl p-4 sm:p-6 border border-red-200/70 shadow-xs space-y-4',
    accent: 'bg-gradient-to-b from-orange-50/40 via-white to-white rounded-3xl p-4 sm:p-6 border border-orange-200/70 shadow-xs space-y-4',
    default: 'space-y-4'
  };

  const renderBadge = () => {
    if (!badge) return null;
    if (React.isValidElement(badge)) return badge;
    if (typeof badge === 'object' && 'text' in badge) {
      const variantClasses: Record<string, string> = {
        red: 'bg-red-100 text-red-800 border-red-200',
        amber: 'bg-amber-100 text-amber-900 border-amber-200',
        emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        navy: 'bg-[#0B132B] text-amber-300 border-amber-400/30',
        orange: 'bg-orange-100 text-[#FF6A00] border-orange-200',
        purple: 'bg-purple-100 text-purple-800 border-purple-200'
      };
      const cls = variantClasses[badge.variant || 'orange'] || variantClasses.orange;
      return (
        <span className={`text-[10px] sm:text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border shadow-2xs ${cls}`}>
          {badge.text}
        </span>
      );
    }
    return null;
  };

  return (
    <section className={`w-full px-2 sm:px-4 lg:px-6 py-2 ${containerClassName}`}>
      <div className={variantStyles[variant]}>
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pb-2.5 sm:pb-3 border-b border-neutral-100">
          {/* Left Title & Icon */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {icon && (
              <div className="shrink-0 flex items-center justify-center">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h2 className="text-xs sm:text-base md:text-lg font-black text-neutral-900 tracking-tight truncate">
                  {title}
                </h2>
                {renderBadge()}
              </div>
              {subtitle && (
                <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5 line-clamp-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right Controls: Timer / Action / Scroll Chevrons / View All */}
          <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2.5 w-full sm:w-auto shrink-0">
            {headerRight}

            {viewAllLink && (
              <Link
                to={viewAllLink}
                className="text-[10px] sm:text-xs font-bold text-[#FF6A00] hover:text-[#E55E00] flex items-center gap-1 group px-2 py-1 sm:px-2.5 sm:py-1 rounded-xl bg-orange-50/80 hover:bg-orange-100/90 border border-orange-200/60 transition whitespace-nowrap shrink-0"
              >
                <span>{viewAllLabel}</span>
                <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}

            {/* Desktop Navigation Chevrons (Only on Desktop md+) */}
            {showScrollButtons && (
              <div className="hidden md:flex items-center gap-1 pl-1">
                <button
                  type="button"
                  onClick={() => scroll('left')}
                  disabled={!canScrollLeft}
                  aria-label="Scroll Carousel Left"
                  className={`p-1.5 rounded-full border transition-all cursor-pointer ${
                    canScrollLeft
                      ? 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200 shadow-2xs active:scale-95'
                      : 'bg-neutral-50 text-neutral-300 border-neutral-100 cursor-not-allowed opacity-40'
                  }`}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => scroll('right')}
                  disabled={!canScrollRight}
                  aria-label="Scroll Carousel Right"
                  className={`p-1.5 rounded-full border transition-all cursor-pointer ${
                    canScrollRight
                      ? 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200 shadow-2xs active:scale-95'
                      : 'bg-neutral-50 text-neutral-300 border-neutral-100 cursor-not-allowed opacity-40'
                  }`}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative group/carousel">
          {/* Edge Fade Gradients for visual cue */}
          {canScrollLeft && (
            <div className="hidden sm:block absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
          )}
          {canScrollRight && (
            <div className="hidden sm:block absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />
          )}

          {loading ? (
            /* Skeleton Loading State */
            <div className="flex gap-3 sm:gap-4 overflow-hidden py-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`${itemWidthClass} shrink-0 bg-neutral-50 rounded-2xl border border-neutral-200 p-3 space-y-3 animate-pulse`}
                >
                  <div className="w-full aspect-square bg-neutral-200/80 rounded-xl" />
                  <div className="h-3 bg-neutral-200/80 rounded-sm w-3/4" />
                  <div className="h-3 bg-neutral-200/80 rounded-sm w-1/2" />
                  <div className="h-4 bg-neutral-300 rounded-sm w-2/3 mt-2" />
                  <div className="h-8 bg-neutral-200/80 rounded-lg w-full mt-2" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            /* Native Horizontal Scroll Container with Touch Momentum & Snap */
            <div
              ref={scrollRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              className={`
                flex gap-3 sm:gap-4 overflow-x-auto py-1 scroll-smooth no-scrollbar
                scroll-snap-x snap-mandatory overscroll-x-contain select-none
                ${isDragging ? 'cursor-grabbing' : 'cursor-default'}
              `}
              style={{
                WebkitOverflowScrolling: 'touch',
                scrollSnapType: 'x mandatory'
              }}
            >
              {products.map((product) => (
                <div
                  key={product.id}
                  className={`${itemWidthClass} shrink-0 snap-start flex flex-col`}
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <ProductCard product={product} showSeller={showSeller} />
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="py-8 text-center bg-neutral-50/70 rounded-2xl border border-dashed border-neutral-200">
              <p className="text-xs font-semibold text-neutral-500">{emptyMessage}</p>
            </div>
          )}
        </div>

        {/* Optional Footer Banner / Link */}
        {footer && <div className="pt-1">{footer}</div>}
      </div>
    </section>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Zap, ChevronRight, Clock, ChevronLeft } from 'lucide-react';
import { ProductCard } from '../common/ProductCard';
import { api } from '../../services/api';
import { Product } from '../../types';

export const FlashSaleSection: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Live ticking countdown timer
  const [timeLeft, setTimeLeft] = useState({
    hours: 4,
    minutes: 18,
    seconds: 32,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 6, minutes: 0, seconds: 0 }; // reset cycle
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let mounted = true;
    api.getProducts({ badge: 'FLASH SALE', limit: 8 })
      .then(res => {
        if (mounted && res.products) {
          setFlashSaleProducts(res.products);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const formatDigits = (num: number) => num.toString().padStart(2, '0');

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll, { passive: true });
    }
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [flashSaleProducts]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  if (!loading && flashSaleProducts.length === 0) return null;

  return (
    <section className="w-full px-2 sm:px-4 lg:px-6 py-2">
      <div className="bg-gradient-to-r from-[#0B132B] via-[#451a03] to-[#0B132B] rounded-3xl p-4 sm:p-6 shadow-xl border border-amber-500/25 text-white space-y-4">
        {/* Flash Header & Countdown */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/20">
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 sm:gap-2 bg-amber-400 text-neutral-950 px-3 py-1 rounded-xl font-black text-xs sm:text-sm tracking-wider uppercase shadow-xs">
              <Zap size={16} className="fill-neutral-950" />
              <span>FLASH SALES</span>
            </div>
            <span className="text-xs font-semibold text-orange-100 hidden md:inline">
              Limited Quantities & Unbeatable Prices
            </span>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2.5">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-orange-100">
                <Clock size={14} />
                <span>Ends in:</span>
              </div>
              <div className="flex items-center gap-1 font-mono font-black text-xs sm:text-sm">
                <span className="bg-neutral-950 text-amber-400 px-2 py-0.5 rounded-lg shadow-xs">
                  {formatDigits(timeLeft.hours)}
                </span>
                <span className="text-amber-400 font-bold">:</span>
                <span className="bg-neutral-950 text-amber-400 px-2 py-0.5 rounded-lg shadow-xs">
                  {formatDigits(timeLeft.minutes)}
                </span>
                <span className="text-amber-400 font-bold">:</span>
                <span className="bg-neutral-950 text-amber-400 px-2 py-0.5 rounded-lg shadow-xs">
                  {formatDigits(timeLeft.seconds)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 pl-1">
              <Link
                to="/flash-sales"
                className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition shadow-xs cursor-pointer whitespace-nowrap"
              >
                <span>View All</span>
                <ChevronRight size={14} />
              </Link>
              {/* Desktop Scroll Arrows */}
              <div className="hidden sm:flex items-center gap-1 pl-1">
                <button
                  type="button"
                  onClick={() => scroll('left')}
                  disabled={!canScrollLeft}
                  aria-label="Previous Flash Sale Products"
                  className={`p-1.5 rounded-full border border-white/20 transition-all cursor-pointer ${
                    canScrollLeft
                      ? 'bg-white/20 hover:bg-white/30 text-white'
                      : 'bg-white/5 text-white/30 cursor-not-allowed opacity-40'
                  }`}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => scroll('right')}
                  disabled={!canScrollRight}
                  aria-label="Next Flash Sale Products"
                  className={`p-1.5 rounded-full border border-white/20 transition-all cursor-pointer ${
                    canScrollRight
                      ? 'bg-white/20 hover:bg-white/30 text-white'
                      : 'bg-white/5 text-white/30 cursor-not-allowed opacity-40'
                  }`}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Carousel / Responsive Scroll */}
        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto py-1 scroll-smooth no-scrollbar scroll-snap-x snap-mandatory overscroll-x-contain"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollSnapType: 'x mandatory'
          }}
        >
          {flashSaleProducts.map((product) => (
            <div
              key={product.id}
              className="w-[168px] sm:w-[210px] md:w-[228px] lg:w-[240px] shrink-0 snap-start flex flex-col"
              style={{ scrollSnapAlign: 'start' }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

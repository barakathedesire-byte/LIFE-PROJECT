import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Zap,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: 'Mega Electronics Expo 2026',
      subtitle: 'Up to 35% OFF on Flagship Samsung, Apple, Hisense & Oraimo',
      badge: 'OFFICIAL STORE DAYS',
      badgeColor: 'bg-amber-400 text-neutral-950 font-black',
      description: '100% Genuine with 24-Month Local Warranty & SokoDirect Escrow Protection across Tanzania.',
      cta: 'Shop Electronics Deals',
      link: '/category/electronics',
      bgGradient: 'from-[#55111B] via-[#7B1222] to-[#1A1A1A]',
      image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=1200&auto=format&fit=crop&q=80',
      highlights: ['Free 2-Yr Warranty', 'Express Dar Dispatch', 'Escrow Protected'],
    },
    {
      id: 2,
      title: 'Next-Gen Smartphones & 5G',
      subtitle: 'Samsung Galaxy A55, Tecno Camon 30 & Xiaomi Redmi Note 13 Pro',
      badge: 'TOP SELLER DEALS',
      badgeColor: 'bg-red-600 text-white font-black',
      description: 'Same-day doorstep delivery in Dar es Salaam. Fast delivery to Arusha, Mwanza & Dodoma.',
      cta: 'Explore Smartphones',
      link: '/category/phones-tablets',
      bgGradient: 'from-[#1A1A1A] via-[#66101C] to-[#282828]',
      image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=1200&auto=format&fit=crop&q=80',
      highlights: ['Dual SIM 5G', 'M-Pesa / Tigo Pesa', 'Pickup Locker Ready'],
    },
    {
      id: 3,
      title: 'Home & Kitchen Modernization',
      subtitle: 'Philips Airfryers, Hisense Refrigerators & Granite Cookware Sets',
      badge: 'FAMILY SAVINGS',
      badgeColor: 'bg-emerald-500 text-white font-black',
      description: 'Cook healthier, save power and elevate your living spaces with authentic brand appliances.',
      cta: 'Upgrade Your Home',
      link: '/category/appliances',
      bgGradient: 'from-[#282828] via-[#7B1222] to-[#121212]',
      image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=1200&auto=format&fit=crop&q=80',
      highlights: ['Energy Efficient', 'Direct Manufacturer Stock', '7-Day Return'],
    },
    {
      id: 4,
      title: 'Fashion & Premium Footwear',
      subtitle: 'Original Nike Sneakers, African Kitenge Styles & Designer Watches',
      badge: 'NEW ARRIVALS 2026',
      badgeColor: 'bg-purple-600 text-white font-black',
      description: 'Stand out with top-tier trends, high durability materials and verified seller inspection.',
      cta: 'Explore Fashion Collection',
      link: '/category/fashion',
      bgGradient: 'from-[#1A1A1A] via-[#55111B] to-[#33353A]',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=80',
      highlights: ['100% Original', 'Sizes 38-46', 'Pay on Delivery'],
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="w-full px-2 sm:px-4 lg:px-6 py-2">
      {/* Animated Product Carousel Slider for Mobile & Desktop */}
      <div className="w-full relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg min-h-[340px] sm:min-h-[420px] lg:min-h-[460px] flex flex-col justify-between border border-neutral-800/40">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out bg-gradient-to-r ${
              slide.bgGradient
            } flex items-center ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Background ambient product image */}
            <div className="absolute right-0 top-0 bottom-0 w-full lg:w-3/5 h-full overflow-hidden pointer-events-none">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover object-center opacity-40 lg:opacity-75 mix-blend-screen scale-105 transition-transform duration-7000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A] via-[#1A1A1A]/70 to-transparent hidden lg:block" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent lg:hidden" />
            </div>

            {/* Content box */}
            <div className="relative z-20 p-6 sm:p-10 lg:p-14 max-w-2xl text-white space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-[10px] sm:text-xs font-black tracking-wider uppercase shadow-xs ${slide.badgeColor}`}
                >
                  {slide.badge}
                </span>
                <span className="text-[11px] text-amber-300 font-bold bg-black/40 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-1">
                  <Sparkles size={12} />
                  <span>SokoDirect Exclusive</span>
                </span>
              </div>

              <h2 className="text-lg sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-white drop-shadow-sm">
                {slide.title}
              </h2>

              <p className="text-xs sm:text-lg md:text-xl font-bold text-red-200 leading-snug">
                {slide.subtitle}
              </p>

              <p className="text-xs sm:text-sm text-neutral-300 max-w-xl leading-relaxed hidden sm:block">
                {slide.description}
              </p>

              {/* Slide highlight pills */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                {slide.highlights.map((hl, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-semibold bg-white/10 backdrop-blur-xs px-2.5 py-1 rounded-lg text-neutral-200 border border-white/10"
                  >
                    ✓ {hl}
                  </span>
                ))}
              </div>

              <div className="pt-3 flex items-center gap-3">
                <Link
                  to={slide.link}
                  className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-[#A51C30] hover:bg-[#8B1424] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xl hover:shadow-red-900/50 transition-all duration-200 transform active:scale-95 cursor-pointer uppercase tracking-wider"
                >
                  <span>{slide.cta}</span>
                  <ArrowRight size={16} />
                </Link>

                <Link
                  to="/products"
                  className="inline-flex items-center gap-1.5 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-xl backdrop-blur-xs transition border border-white/20"
                >
                  <ShoppingBag size={15} />
                  <span>Browse All</span>
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Navigation Arrows */}
        <div className="absolute z-30 bottom-5 right-6 sm:right-10 flex items-center gap-2">
          <button
            onClick={() => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
            className="p-2.5 rounded-full bg-black/50 hover:bg-[#A51C30] text-white backdrop-blur-xs transition-colors cursor-pointer border border-white/20 shadow-md"
            aria-label="Previous slide"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            className="p-2.5 rounded-full bg-black/50 hover:bg-[#A51C30] text-white backdrop-blur-xs transition-colors cursor-pointer border border-white/20 shadow-md"
            aria-label="Next slide"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Slide Indicator Dots */}
        <div className="absolute z-30 bottom-5 left-6 sm:left-10 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                i === currentSlide ? 'w-8 bg-[#A51C30] shadow-sm' : 'w-2.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

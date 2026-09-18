import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Tag, 
  Sparkles, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight,
  ShoppingBag,
  Smartphone,
  Home,
  Tv,
  Heart,
  Shirt,
  Monitor,
  Dumbbell,
  Car,
  Baby,
  Activity,
  Sprout,
  Plus,
  Flame,
  Zap,
  Star
} from 'lucide-react';
import { api } from '../../services/api';
import { Product } from '../../types';
import { ProductCard } from '../common/ProductCard';
import { usePlatformConfig } from '../../context/PlatformConfigContext';

export const MarketplaceHighlights: React.FC = () => {
  const { desktopSidebarOpen, builderConfig } = usePlatformConfig();
  const [categories, setCategories] = useState<any[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [showMoreCategories, setShowMoreCategories] = useState(false);

  const desktopCategories = [
    { id: 'cat-supermarket', name: 'Supermarket & Groceries', slug: 'supermarket', icon: ShoppingBag },
    { id: 'cat-phones', name: 'Phones & Tablets', slug: 'phones-tablets', icon: Smartphone },
    { id: 'cat-home', name: 'Home & Office', slug: 'home-office', icon: Home },
    { id: 'cat-electronics', name: 'Electronics & Audio', slug: 'electronics-audio', icon: Tv },
    { id: 'cat-beauty', name: 'Health & Beauty', slug: 'beauty-health', icon: Heart },
    { id: 'cat-fashion', name: 'Fashion & Apparel', slug: 'fashion', icon: Shirt },
    { id: 'cat-computing', name: 'Computing & Laptops', slug: 'computers-laptops', icon: Monitor },
    { id: 'cat-sports', name: 'Sporting Goods', slug: 'sports-fitness', icon: Dumbbell },
    { id: 'cat-automotive', name: 'Automotive & Spares', slug: 'automotive', icon: Car },
    { id: 'cat-kids', name: 'Babies & Kids', slug: 'babies-kids', icon: Baby },
  ];

  const extraCategories = [
    { id: 'cat-appliances', name: 'Appliances & Kitchenware', slug: 'appliances', icon: Zap },
    { id: 'cat-agri', name: 'Agriculture & Farm Supplies', slug: 'agriculture', icon: Sprout },
    { id: 'cat-med', name: 'Health & Medical Equipment', slug: 'health-medical', icon: Activity },
    { id: 'cat-wine', name: 'Wine, Spirits & Beverages', slug: 'wine-spirits', icon: ShoppingBag },
    { id: 'cat-gift', name: 'Gift Collections & Hampers', slug: 'gift-collections', icon: Tag },
  ];

  const categoriesScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  const campaignSlides = [
    {
      id: 'slide-1',
      sectionTitle: 'Explosion Weekend | Up to 60% Off',
      mainTitle: 'Explosion Weekend',
      subTitle: 'Deal.. Dondoloo!!',
      badgeText: 'Up to 60% OFF',
      disclaimer: 'Limited quantity · T&Cs apply',
      ctaText: 'Discover More',
      ctaLink: '/marketplace',
      bgType: 'dark-lifestyle',
      bgImage: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200',
    },
    {
      id: 'slide-2',
      sectionTitle: 'Treasure Hunt | Find It & Win It!',
      mainTitle: 'Treasure Hunt',
      subTitle: 'SPJ 55" QLED 4K Smart TV',
      tagline: '· Find it & Win it!',
      badgeText: 'TZS 599K Only',
      disclaimer: 'FRI 4TH | 10 AM · Limited quantity. T&Cs apply',
      ctaText: 'Discover More',
      ctaLink: '/products',
      bgType: 'vibrant-yellow',
      bgImage: '/src/assets/images/lumo_luxury_banner_1788469174842.jpg',
    },
    {
      id: 'slide-3',
      sectionTitle: 'LUMO Fresh Harvest | Kilombero Rice Bundles',
      mainTitle: 'Fresh Harvest',
      subTitle: 'Kilombero Grade-1 Machine Cleaned Rice',
      badgeText: 'Up to 40% OFF',
      disclaimer: 'Same-Day Dar Delivery · Escrow Safe',
      ctaText: 'Discover More',
      ctaLink: '/supermarket',
      bgType: 'fresh-emerald',
      bgImage: '/src/assets/images/lumo_supermarket_hero_1788469189694.jpg',
    },
    {
      id: 'slide-4',
      sectionTitle: 'LUMO Luxe Edition | Official Brand Warranty',
      mainTitle: 'LUMO Luxe Collection',
      subTitle: 'Pro Smartphones & OLED 4K Displays',
      badgeText: '100% Genuine',
      disclaimer: 'Backed by 1-Year Local Warranty & Escrow',
      ctaText: 'Discover More',
      ctaLink: '/official-stores',
      bgType: 'deep-navy',
      bgImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200',
    }
  ];

  // Check for dynamic studio configuration or builder config
  const studioHomeConfig = builderConfig?.studioPages?.find((p: any) => p.id === 'page-home' || p.route === '/');
  const heroComponent = studioHomeConfig?.sections?.flatMap((s: any) => s.components || [])?.find((c: any) => c.type === 'hero_banner' || c.id === 'c-hero-1');

  const dynamicHeroSlide = heroComponent ? {
    id: heroComponent.id || 'slide-1',
    sectionTitle: heroComponent.props?.headline || 'Explosion Weekend | Up to 60% Off',
    mainTitle: heroComponent.props?.headline || 'Explosion Weekend',
    subTitle: heroComponent.props?.subheadline || 'Deal.. Dondoloo!!',
    tagline: heroComponent.props?.tagline || '',
    badgeText: heroComponent.props?.badge || heroComponent.props?.badgeText || 'Up to 60% OFF',
    disclaimer: heroComponent.props?.disclaimer || 'Limited quantity · T&Cs apply',
    ctaText: heroComponent.props?.ctaText || 'Discover More',
    ctaLink: heroComponent.props?.ctaLink || '/marketplace',
    bgType: 'dark-lifestyle',
    bgImage: heroComponent.props?.imageUrl || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200',
  } : null;

  const activeSlides = dynamicHeroSlide ? [dynamicHeroSlide, ...campaignSlides.slice(1)] : campaignSlides;

  // Auto slide rotation every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % activeSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.getCategories().catch(() => ({ categories: [] })),
          api.getProducts({ limit: 12 }).catch(() => ({ products: [] }))
        ]);

        // Strictly promotional-oriented attraction content rings with dedicated pages
        const promoHighlights = [
          { id: 'promo-1', name: 'Flash Deals', slug: '/flash-sales', iconComp: Zap, badge: 'Up to 70% Off', image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400' },
          { id: 'promo-2', name: 'Deals of the Day', slug: '/deals-of-the-day', iconComp: Flame, badge: 'Daily Drops', image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400' },
          { id: 'promo-3', name: 'Save the Date', slug: '/save-the-date', iconComp: Tag, badge: 'VIP Countdown', image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400' },
          { id: 'promo-4', name: 'Top 10 Picks', slug: '/trending-essentials', iconComp: Star, badge: 'Best Value', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400' },
          { id: 'promo-5', name: 'LUMO Express', slug: '/same-day-delivery', iconComp: Flame, badge: 'Dar in 24h', image: 'https://images.unsplash.com/photo-1555529771-835f59fc5efe?w=400' },
          { id: 'promo-6', name: 'Official Stores', slug: '/official-stores', iconComp: Sparkles, badge: '100% Genuine', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400' },
          { id: 'promo-7', name: 'Free Delivery', slug: '/free-delivery-zones', iconComp: ShieldCheck, badge: 'Zero Shipping', image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400' },
          { id: 'promo-8', name: 'Top Sellers', slug: '/top-sellers', iconComp: Sparkles, badge: 'Verified 5-Star', image: 'https://images.unsplash.com/photo-1556742049-0a67e5572263?w=400' },
          { id: 'promo-9', name: 'New Arrivals', slug: '/new-arrivals', iconComp: Plus, badge: 'Freshly Dropped', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400' },
          { id: 'promo-10', name: 'Rice Harvest', slug: '/supermarket', iconComp: Sprout, badge: 'Direct From Farm', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400' }
        ];
        setCategories(promoHighlights);

        if (prodRes?.products) {
          setTrendingProducts(prodRes.products);
        }
      } catch (err) {
        console.error('Error loading marketplace highlights:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const checkScroll = () => {
    if (!categoriesScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = categoriesScrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const ref = categoriesScrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', checkScroll);
      checkScroll();
    }
    return () => ref?.removeEventListener('scroll', checkScroll);
  }, [categories]);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (!categoriesScrollRef.current) return;
    const amount = direction === 'left' ? -350 : 350;
    categoriesScrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!categoriesScrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - categoriesScrollRef.current.offsetLeft);
    setScrollLeftState(categoriesScrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !categoriesScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - categoriesScrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    categoriesScrollRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleMouseUp = () => setIsDragging(false);

  const currentSlide = activeSlides[activeSlideIndex] || activeSlides[0];

  return (
    <section className="w-full px-2 sm:px-4 lg:px-6 py-2 space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* DESKTOP CATEGORY SIDEBAR (MATCHING JUMIA REFERENCE) */}
        {desktopSidebarOpen && (
          <div className="hidden lg:block lg:col-span-3 bg-white rounded-2xl border border-neutral-200 shadow-xs p-2.5 space-y-1">
            <div className="px-3 py-2 text-[11px] font-black uppercase tracking-wider text-neutral-400">
              OUR CATEGORIES
            </div>
            {[...desktopCategories, ...(showMoreCategories ? extraCategories : [])].map((cat) => {
              const IconComp = (cat as any).icon;
              return (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-neutral-700 hover:bg-orange-50 hover:text-[#FF6A00] rounded-xl transition group"
                >
                  <IconComp size={16} className="text-neutral-500 group-hover:text-[#FF6A00] transition" />
                  <span className="truncate">{cat.name}</span>
                </Link>
              );
            })}
            
            <button
              onClick={() => setShowMoreCategories(!showMoreCategories)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-[#FF6A00] hover:bg-orange-50 rounded-xl transition mt-1 pt-2 border-t border-neutral-100 cursor-pointer"
            >
              <span>{showMoreCategories ? 'Show Less' : 'See All Categories'}</span>
              {showMoreCategories ? <ChevronLeft size={14} className="rotate-90" /> : <ChevronRight size={14} />}
            </button>
          </div>
        )}

        {/* RIGHT COLUMN: BANNER AND HIGHLIGHTS */}
        <div className={`${desktopSidebarOpen ? 'lg:col-span-9' : 'lg:col-span-12'} w-full space-y-4 transition-all duration-300`}>
          {/* SECTION HEADING DIRECTLY BELOW SEARCH BAR (MATCHING REFERENCE JUMIA LAYOUT) */}
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base sm:text-xl font-bold text-neutral-900 tracking-tight">
              {currentSlide.sectionTitle}
            </h2>
          </div>

          {/* CAMPAIGN CAROUSEL BANNER CARD */}
          <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-md transition-all duration-500">
        <div className="relative min-h-[220px] sm:min-h-[280px] lg:min-h-[320px] w-full flex items-center p-5 sm:p-8 lg:p-10">
          
          {/* SLIDE BACKGROUND & GRADIENT OVERLAYS */}
          {activeSlides.map((slide, idx) => {
            const isActive = activeSlideIndex === idx;
            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {/* Background Image */}
                <img
                  src={slide.bgImage}
                  alt={slide.mainTitle}
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />

                {/* Custom Gradient Overlays based on slide type */}
                {slide.bgType === 'dark-lifestyle' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-transparent" />
                )}
                {slide.bgType === 'vibrant-yellow' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/95 via-amber-400/90 to-amber-500/80 mix-blend-multiply" />
                )}
                {slide.bgType === 'fresh-emerald' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-900/80 to-transparent" />
                )}
                {slide.bgType === 'deep-navy' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0B132B]/95 via-[#0B132B]/80 to-transparent" />
                )}

                {/* Content Overlay Container */}
                <div className="relative z-20 h-full flex flex-col justify-center max-w-xl text-white space-y-2.5 sm:space-y-4 p-5 sm:p-8">
                  {/* Main Title & Tagline */}
                  <div>
                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight drop-shadow-sm">
                      {slide.mainTitle}
                    </h1>
                    {slide.tagline && (
                      <span className="text-xs sm:text-sm font-semibold text-white/90 block mt-0.5">
                        {slide.tagline}
                      </span>
                    )}
                  </div>

                  {/* Subtitle / Product Highlight */}
                  <p className="text-sm sm:text-xl font-extrabold text-white/95 leading-snug">
                    {slide.subTitle}
                  </p>

                  {/* Price/Discount Badge Pill */}
                  <div className="inline-flex items-center gap-2">
                    <span className="bg-white text-neutral-950 text-xs sm:text-base font-black px-3 sm:px-4 py-1 rounded-full shadow-md">
                      {slide.badgeText}
                    </span>
                  </div>

                  {/* Disclaimer / Date Note */}
                  <p className="text-[10px] sm:text-xs text-white/80 font-medium">
                    {slide.disclaimer}
                  </p>

                  {/* Discover Button Pill */}
                  <div className="pt-2">
                    <Link
                      to={slide.ctaLink}
                      className="inline-flex items-center gap-2 px-5 sm:px-6 py-2 sm:py-2.5 bg-white text-neutral-900 font-bold text-xs sm:text-sm rounded-full shadow-lg hover:bg-neutral-100 transition active:scale-95"
                    >
                      <span>{slide.ctaText}</span>
                      <ArrowRight size={14} className="text-neutral-900" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PAGINATION DOTS BELOW CAROUSEL (MATCHING EXACT REFERENCE IN JUMIA SCREENSHOTS) */}
      <div className="flex items-center justify-center gap-2 pt-1 pb-1">
        {activeSlides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveSlideIndex(idx)}
            className={`transition-all duration-300 cursor-pointer ${
              activeSlideIndex === idx
                ? 'w-8 sm:w-10 h-3 bg-neutral-800 rounded-full'
                : 'w-3 h-3 rounded-full border-2 border-neutral-700 bg-transparent hover:border-neutral-900'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* PROMOTIONAL ATTRACTING CONTENT RINGS (MATCHING REFERENCE) */}
      <div className="w-full bg-slate-50/80 rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-black text-[#0B132B] tracking-tight flex items-center gap-2">
              <Sparkles size={20} className="text-[#FF6A00]" />
              LUMO Festival Specials & Exclusive Deals
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Handpicked promotional highlights, flash festivals, and seasonal collections across Tanzania
            </p>
          </div>

          {/* Scroll Controls */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <button
              onClick={() => scrollCategories('left')}
              disabled={!canScrollLeft}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition border ${
                canScrollLeft
                  ? 'bg-white text-[#0B132B] border-slate-200 hover:bg-slate-100 shadow-xs cursor-pointer'
                  : 'bg-slate-100/50 text-slate-300 border-slate-200/50 cursor-not-allowed'
              }`}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scrollCategories('right')}
              disabled={!canScrollRight}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition border ${
                canScrollRight
                  ? 'bg-white text-[#0B132B] border-slate-200 hover:bg-slate-100 shadow-xs cursor-pointer'
                  : 'bg-slate-100/50 text-slate-300 border-slate-200/50 cursor-not-allowed'
              }`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Horizontal Swipable Track */}
        <div
          ref={categoriesScrollRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-2 pt-1 cursor-grab active:cursor-grabbing select-none"
        >
          {categories.map((promo, idx) => (
            <Link
              key={promo.id || idx}
              to={promo.slug.startsWith('/') ? promo.slug : `/${promo.slug}`}
              className="group flex flex-col items-center shrink-0 w-[100px] sm:w-[120px] text-center space-y-2 transition-transform duration-200 hover:-translate-y-1"
            >
              <div className="relative w-18 h-18 sm:w-22 sm:h-22 rounded-full p-1 bg-gradient-to-br from-orange-500/40 via-transparent to-[#0B132B]/40 shadow-xs group-hover:shadow-md transition-all">
                <div className="w-full h-full rounded-full overflow-hidden bg-white border-2 border-white flex items-center justify-center relative">
                  <img
                    src={promo.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400'}
                    alt={promo.name}
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  {promo.badge && (
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                  )}
                </div>
                
                {promo.badge && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#FF6A00] text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-sm z-10">
                    {promo.badge}
                  </div>
                )}
              </div>

              <span className="text-[11px] sm:text-xs font-bold text-[#0B132B] group-hover:text-[#FF6A00] transition-colors line-clamp-2 px-0.5">
                {promo.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* TRENDING ESSENTIALS PRODUCTS */}
      {trendingProducts.length > 0 && (
        <div className="w-full bg-white rounded-3xl p-4 sm:p-6 border border-neutral-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <Link to="/trending-essentials" className="group">
              <h3 className="text-base sm:text-lg font-black text-neutral-900 group-hover:text-[#FF6A00] transition-colors tracking-tight">
                Trending Essentials & Best Value Deals
              </h3>
              <p className="text-xs text-neutral-500">
                Secured with M-Pesa escrow protection and verified local warranty
              </p>
            </Link>

            <Link
              to="/trending-essentials"
              className="text-xs font-bold text-[#FF6A00] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>View All Trending Essentials</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {trendingProducts.slice(0, 6).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
        </div>
      </div>
    </section>
  );
};




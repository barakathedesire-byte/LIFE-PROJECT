import React, { useRef, useState, useEffect } from 'react';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

interface SubcategoryItem {
  id: string;
  name: string;
  slug: string;
  image?: string;
  badge?: string;
  itemCount?: number;
}

interface CategorySubcategoryCarouselProps {
  categoryTitle: string;
  subtitle: string;
  subcategories: SubcategoryItem[];
  selectedSubcategory: string | null;
  onSelectSubcategory: (slug: string | null) => void;
  allCount: number;
  allLabel?: string;
}

export const CategorySubcategoryCarousel: React.FC<CategorySubcategoryCarouselProps> = ({
  categoryTitle,
  subtitle,
  subcategories,
  selectedSubcategory,
  onSelectSubcategory,
  allCount,
  allLabel = 'All Items'
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', checkScroll);
      checkScroll();
    }
    return () => ref?.removeEventListener('scroll', checkScroll);
  }, [subcategories]);

  const scrollContainer = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  const defaultImages = [
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400',
    'https://images.unsplash.com/photo-1555529771-835f59fc5efe?w=400',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400',
    'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400'
  ];

  return (
    <div className="w-full px-2 sm:px-4 lg:px-6">
      <div className="w-full bg-slate-50/90 backdrop-blur-xs rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#0B132B] text-white flex items-center justify-center font-bold shadow-xs">
              <Sparkles size={18} className="text-[#FF6A00]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#0B132B] tracking-tight">
                {categoryTitle}
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scrollContainer('left')}
              disabled={!canScrollLeft}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition border ${
                canScrollLeft
                  ? 'bg-white text-[#0B132B] border-slate-200 hover:bg-slate-100 shadow-xs cursor-pointer'
                  : 'bg-slate-100/50 text-slate-300 border-slate-200/50 cursor-not-allowed'
              }`}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scrollContainer('right')}
              disabled={!canScrollRight}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition border ${
                canScrollRight
                  ? 'bg-white text-[#0B132B] border-slate-200 hover:bg-slate-100 shadow-xs cursor-pointer'
                  : 'bg-slate-100/50 text-slate-300 border-slate-200/50 cursor-not-allowed'
              }`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-2 pt-1 select-none"
        >
          {/* All items button */}
          <button
            onClick={() => onSelectSubcategory(null)}
            className={`group flex flex-col items-center shrink-0 w-[110px] sm:w-[130px] text-center space-y-2.5 transition-transform duration-200 hover:-translate-y-1 cursor-pointer ${
              selectedSubcategory === null ? 'scale-105' : ''
            }`}
          >
            <div
              className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 transition-all shadow-md ${
                selectedSubcategory === null
                  ? 'bg-gradient-to-br from-[#FF6A00] to-[#0B132B] ring-4 ring-orange-400/40'
                  : 'bg-gradient-to-br from-[#0B132B]/30 via-[#0B132B]/20 to-orange-500/30 group-hover:from-[#0B132B] group-hover:to-orange-500'
              }`}
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-white border-2 border-white flex items-center justify-center relative">
                <img
                  src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400"
                  alt={allLabel}
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <span
              className={`text-xs sm:text-sm font-black tracking-tight transition-colors line-clamp-2 px-1 ${
                selectedSubcategory === null ? 'text-[#FF6A00]' : 'text-[#0B132B] group-hover:text-[#FF6A00]'
              }`}
            >
              {allLabel}
            </span>
          </button>

          {subcategories.map((sub, idx) => {
            const isSelected = selectedSubcategory === sub.slug;
            const imgUrl = sub.image || defaultImages[idx % defaultImages.length];
            return (
              <button
                key={sub.id || idx}
                onClick={() => onSelectSubcategory(sub.slug)}
                className={`group flex flex-col items-center shrink-0 w-[110px] sm:w-[130px] text-center space-y-2.5 transition-transform duration-200 hover:-translate-y-1 cursor-pointer ${
                  isSelected ? 'scale-105' : ''
                }`}
              >
                <div
                  className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 transition-all shadow-md ${
                    isSelected
                      ? 'bg-gradient-to-br from-[#FF6A00] to-[#0B132B] ring-4 ring-orange-400/40'
                      : 'bg-gradient-to-br from-[#0B132B]/30 via-[#0B132B]/20 to-orange-500/30 group-hover:from-[#0B132B] group-hover:to-orange-500'
                  }`}
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-white border-2 border-white flex items-center justify-center relative">
                    <img
                      src={imgUrl}
                      alt={sub.name}
                      className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                <span
                  className={`text-xs sm:text-sm font-black tracking-tight transition-colors line-clamp-2 px-1 ${
                    isSelected ? 'text-[#FF6A00]' : 'text-[#0B132B] group-hover:text-[#FF6A00]'
                  }`}
                >
                  {sub.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

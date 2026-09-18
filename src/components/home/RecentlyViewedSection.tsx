import React from 'react';
import { useRecentlyViewed } from '../../context/RecentlyViewedContext';
import { History, Trash2 } from 'lucide-react';
import { HorizontalProductCarousel } from '../common/HorizontalProductCarousel';

export const RecentlyViewedSection: React.FC = () => {
  const { recentlyViewed, clearRecentlyViewed } = useRecentlyViewed();

  if (!recentlyViewed || recentlyViewed.length === 0) {
    return null;
  }

  const clearButton = (
    <button
      onClick={clearRecentlyViewed}
      className="flex items-center gap-1 text-xs text-neutral-400 hover:text-red-600 transition font-medium cursor-pointer px-2 py-1 rounded-lg hover:bg-red-50"
      title="Clear Recently Viewed History"
    >
      <Trash2 size={13} />
      <span className="hidden sm:inline">Clear History</span>
    </button>
  );

  return (
    <HorizontalProductCarousel
      title="Recently Viewed"
      subtitle="Items you recently browsed on LUMO"
      icon={
        <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF6A00] flex items-center justify-center">
          <History size={18} />
        </div>
      }
      viewAllLink="/products"
      viewAllLabel="Explore More"
      headerRight={clearButton}
      products={recentlyViewed}
      variant="card"
    />
  );
};


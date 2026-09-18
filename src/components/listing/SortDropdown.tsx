import React from 'react';
import { SortOption } from '../../types';
import { LayoutGrid, List, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

interface SortDropdownProps {
  sortBy: SortOption;
  onSortChange: (newSort: SortOption) => void;
  totalCount: number;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onOpenMobileFilters?: () => void;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({
  sortBy,
  onSortChange,
  totalCount,
  viewMode,
  onViewModeChange,
  onOpenMobileFilters,
}) => {
  return (
    <div className="bg-white rounded-xl border border-neutral-200/90 p-3 sm:p-4 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
      <div className="flex items-center justify-between w-full sm:w-auto">
        <p className="text-xs text-neutral-600">
          Showing <span className="font-extrabold text-neutral-900">{totalCount}</span> verified products in Tanzania
        </p>

        {/* Mobile Filter Button */}
        {onOpenMobileFilters && (
          <button
            onClick={onOpenMobileFilters}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-lg text-xs font-bold transition cursor-pointer"
          >
            <SlidersHorizontal size={14} />
            <span>Filter</span>
          </button>
        )}
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
        {/* Sort select */}
        <div className="flex items-center gap-1.5 text-xs text-neutral-700">
          <ArrowUpDown size={14} className="text-neutral-400 shrink-0" />
          <span className="hidden md:inline font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-neutral-900 outline-hidden focus:border-red-600 cursor-pointer"
          >
            <option value="popularity">Popularity / Recommended</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Customer Rating</option>
            <option value="newest">Newest Arrivals</option>
            <option value="discount">Biggest Discounts</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="hidden sm:flex items-center bg-neutral-100 p-1 rounded-lg border border-neutral-200">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-1 rounded-md transition cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white text-red-700 shadow-2xs font-bold'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
            aria-label="Grid View"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-1 rounded-md transition cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white text-red-700 shadow-2xs font-bold'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
            aria-label="List View"
          >
            <List size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

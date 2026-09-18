import React from 'react';
import { FilterState } from '../../types';
import { useCatalog } from '../../hooks/useCatalog';
import { RotateCcw, Star, Check, X, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onClearFilters: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { catalogProducts, catalogCategories, catalogBrands } = useCatalog();

  const handleCategorySelect = (categoryName?: string, subcategoryName?: string) => {
    onFilterChange({
      ...filters,
      category: categoryName,
      subcategory: subcategoryName,
    });
  };

  const handleBrandToggle = (brandName: string) => {
    const current = filters.brand || [];
    const updated = current.includes(brandName)
      ? current.filter((b) => b !== brandName)
      : [...current, brandName];
    onFilterChange({ ...filters, brand: updated.length > 0 ? updated : undefined });
  };

  const handlePricePreset = (min?: number, max?: number) => {
    onFilterChange({ ...filters, minPrice: min, maxPrice: max });
  };

  const handleRatingSelect = (rating?: number) => {
    onFilterChange({ ...filters, minRating: rating });
  };

  const activeFilterCount = [
    filters.category,
    filters.subcategory,
    filters.brand?.length,
    filters.minPrice !== undefined || filters.maxPrice !== undefined ? 1 : 0,
    filters.minRating,
    filters.officialStoreOnly,
    filters.freeDeliveryOnly,
    filters.discountOnly,
    filters.availability === 'in_stock',
  ].filter(Boolean).length;

  const content = (
    <div className="space-y-6 text-xs text-neutral-800">
      {/* Header & Clear */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-sm text-neutral-900">Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-red-600 text-white font-bold text-[10px] px-1.5 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={onClearFilters}
            className="text-red-700 hover:text-red-850 font-bold flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* 1. Quick Toggles */}
      <div className="space-y-2 pb-4 border-b border-neutral-100">
        <label className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 cursor-pointer">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-amber-500" />
            <span className="font-semibold text-neutral-900">Official Stores Only</span>
          </div>
          <input
            type="checkbox"
            checked={!!filters.officialStoreOnly}
            onChange={(e) => onFilterChange({ ...filters, officialStoreOnly: e.target.checked })}
            className="rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 cursor-pointer">
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 font-bold text-xs">🚚</span>
            <span className="font-semibold text-neutral-900">Free Delivery Eligible</span>
          </div>
          <input
            type="checkbox"
            checked={!!filters.freeDeliveryOnly}
            onChange={(e) => onFilterChange({ ...filters, freeDeliveryOnly: e.target.checked })}
            className="rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 cursor-pointer">
          <div className="flex items-center gap-2">
            <span className="text-red-600 font-bold text-xs">🔥</span>
            <span className="font-semibold text-neutral-900">Discounted Deals Only</span>
          </div>
          <input
            type="checkbox"
            checked={!!filters.discountOnly}
            onChange={(e) => onFilterChange({ ...filters, discountOnly: e.target.checked })}
            className="rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 cursor-pointer">
          <span className="font-semibold text-neutral-900">In Stock Items Only</span>
          <input
            type="checkbox"
            checked={filters.availability === 'in_stock'}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                availability: e.target.checked ? 'in_stock' : 'all',
              })
            }
            className="rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
          />
        </label>
      </div>

      {/* 2. Categories & Subcategories */}
      <div className="pb-4 border-b border-neutral-100">
        <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px] mb-2.5">
          Category
        </h4>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => handleCategorySelect(undefined, undefined)}
            className={`w-full text-left py-1 px-2 rounded-md transition ${
              !filters.category ? 'bg-red-50 text-red-700 font-bold' : 'hover:bg-neutral-100 text-neutral-600'
            }`}
          >
            All Categories
          </button>
          {catalogCategories.map((c) => (
            <div key={c.id}>
              <button
                onClick={() => handleCategorySelect(c.name, undefined)}
                className={`w-full text-left py-1 px-2 rounded-md transition flex items-center justify-between ${
                  filters.category === c.name && !filters.subcategory
                    ? 'bg-red-50 text-red-700 font-bold'
                    : 'hover:bg-neutral-100 text-neutral-700'
                }`}
              >
                <span>{c.name}</span>
                <span className="text-[10px] text-neutral-400 font-normal">({c.itemCount})</span>
              </button>

              {/* Subcategories list when parent is active */}
              {filters.category === c.name && (
                <div className="pl-3 py-1 space-y-0.5 border-l-2 border-red-200 ml-2 mt-0.5">
                  {c.subcategories.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => handleCategorySelect(c.name, sub.name)}
                      className={`w-full text-left py-1 px-1.5 rounded text-[11px] transition ${
                        filters.subcategory === sub.name
                          ? 'bg-red-100 text-red-800 font-bold'
                          : 'hover:bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Price Range (TZS) */}
      <div className="pb-4 border-b border-neutral-100">
        <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px] mb-2.5">
          Price Range (TZS)
        </h4>

        {/* Quick Presets */}
        <div className="grid grid-cols-2 gap-1.5 mb-3">
          <button
            onClick={() => handlePricePreset(undefined, 100000)}
            className="py-1 px-2 bg-neutral-100 hover:bg-red-50 hover:text-red-700 rounded text-[11px] font-medium transition cursor-pointer"
          >
            Under 100k
          </button>
          <button
            onClick={() => handlePricePreset(100000, 500000)}
            className="py-1 px-2 bg-neutral-100 hover:bg-red-50 hover:text-red-700 rounded text-[11px] font-medium transition cursor-pointer"
          >
            100k - 500k
          </button>
          <button
            onClick={() => handlePricePreset(500000, 1000000)}
            className="py-1 px-2 bg-neutral-100 hover:bg-red-50 hover:text-red-700 rounded text-[11px] font-medium transition cursor-pointer"
          >
            500k - 1M
          </button>
          <button
            onClick={() => handlePricePreset(1000000, undefined)}
            className="py-1 px-2 bg-neutral-100 hover:bg-red-50 hover:text-red-700 rounded text-[11px] font-medium transition cursor-pointer"
          >
            Over 1 Million
          </button>
        </div>

        {/* Custom Min / Max inputs */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min (TZS)"
            value={filters.minPrice || ''}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                minPrice: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="w-full px-2 py-1.5 bg-neutral-50 border border-neutral-200 rounded text-xs outline-hidden focus:border-red-600"
          />
          <span className="text-neutral-400 font-bold">-</span>
          <input
            type="number"
            placeholder="Max (TZS)"
            value={filters.maxPrice || ''}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                maxPrice: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="w-full px-2 py-1.5 bg-neutral-50 border border-neutral-200 rounded text-xs outline-hidden focus:border-red-600"
          />
        </div>
      </div>

      {/* 4. Brands Filter */}
      <div className="pb-4 border-b border-neutral-100">
        <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px] mb-2.5">
          Brand
        </h4>
        <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
          {catalogBrands.map((brand) => {
            const isChecked = filters.brand?.includes(brand.name);
            return (
              <label
                key={brand.id}
                className="flex items-center justify-between py-1 px-1.5 hover:bg-neutral-50 rounded cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleBrandToggle(brand.name)}
                    className="rounded text-red-600 focus:ring-red-500 w-3.5 h-3.5"
                  />
                  <span className={`font-medium ${isChecked ? 'text-red-700 font-bold' : 'text-neutral-700'}`}>
                    {brand.name}
                  </span>
                </div>
                <span className="text-[10px] text-neutral-400">({brand.productCount})</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 5. Rating Filter */}
      <div>
        <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px] mb-2.5">
          Customer Rating
        </h4>
        <div className="space-y-1">
          {[4, 3, 2].map((r) => (
            <button
              key={r}
              onClick={() => handleRatingSelect(filters.minRating === r ? undefined : r)}
              className={`w-full flex items-center justify-between py-1.5 px-2 rounded-md transition cursor-pointer ${
                filters.minRating === r ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200' : 'hover:bg-neutral-50 text-neutral-700'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <div className="flex items-center text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={13}
                      className={star <= r ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold">& Above</span>
              </div>
              {filters.minRating === r && <Check size={14} className="text-amber-700" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Mobile Bottom Sheet / Modal
  if (isMobileOpen) {
    return (
      <div 
        onClick={onCloseMobile}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center animate-in fade-in"
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full sm:max-w-md max-h-[85vh] rounded-t-3xl sm:rounded-2xl p-5 overflow-y-auto shadow-2xl flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
              <h3 className="font-extrabold text-base text-neutral-900">Filter Marketplace</h3>
              <button
                onClick={onCloseMobile}
                className="p-1 rounded-full text-neutral-400 hover:bg-neutral-100"
              >
                <X size={20} />
              </button>
            </div>
            {content}
          </div>

          <div className="pt-4 mt-4 border-t border-neutral-100 flex gap-2">
            <button
              onClick={onClearFilters}
              className="flex-1 py-2.5 border border-neutral-300 rounded-xl text-neutral-700 font-bold text-xs"
            >
              Reset
            </button>
            <button
              onClick={onCloseMobile}
              className="flex-2 py-2.5 bg-red-700 text-white rounded-xl font-bold text-xs"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop Sticky Sidebar
  return (
    <aside className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-2xs sticky top-24">
      {content}
    </aside>
  );
};

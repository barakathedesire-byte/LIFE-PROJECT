import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { FilterState, SortOption, Product } from '../types';
import { useCatalog } from '../hooks/useCatalog';
import { ProductCard } from '../components/common/ProductCard';
import { FilterSidebar } from '../components/listing/FilterSidebar';
import { SortDropdown } from '../components/listing/SortDropdown';
import { BackButton } from '../components/common/BackButton';
import { ChevronRight, Home, X, ShoppingBag, SlidersHorizontal } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { useSEO } from '../hooks/useSEO';

export const ProductListingPage: React.FC = () => {
  const { catalogProducts, catalogCategories, catalogBrands } = useCatalog();

  const { category: categorySlug, brand: brandSlug } = useParams<{
    category?: string;
    brand?: string;
  }>();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search query if any
  const searchQuery = searchParams.get('q') || '';
  const badgeQuery = searchParams.get('badge') || '';
  const officialQuery = searchParams.get('officialOnly') === 'true';
  const freeDeliveryQuery = searchParams.get('freeDelivery') === 'true';

  // Find category or brand from slug
  const matchedCategory = useMemo(() => {
    if (!categorySlug) return undefined;
    return catalogCategories.find((c) => c.slug === categorySlug);
  }, [categorySlug]);

  const matchedBrand = useMemo(() => {
    if (!brandSlug) return undefined;
    return catalogBrands.find((b) => b.slug === brandSlug);
  }, [brandSlug]);

  const displayTitle = useMemo(() => {
    if (searchQuery) return `Search Results for "${searchQuery}"`;
    if (matchedCategory) return matchedCategory.name;
    if (matchedBrand) return `${matchedBrand.name} Official Store`;
    if (badgeQuery) return `${badgeQuery} Deals`;
    return 'All Marketplace Products';
  }, [searchQuery, matchedCategory, matchedBrand, badgeQuery]);

  const pageDescription = matchedCategory?.description || `Browse ${displayTitle} on LUMO Tanzania. Guaranteed authentic items with M-Pesa escrow protection.`;

  useSEO({
    title: `${displayTitle} | Buy Online Tanzania`,
    description: pageDescription,
    keywords: `${displayTitle}, buy ${displayTitle} Tanzania, Kariakoo prices, M-Pesa escrow`
  });

  // Initial Filter State
  const [filters, setFilters] = useState<FilterState>({
    category: matchedCategory?.name,
    brand: matchedBrand ? [matchedBrand.name] : undefined,
    officialStoreOnly: officialQuery || undefined,
    freeDeliveryOnly: freeDeliveryQuery || undefined,
  });

  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync state when URL params change
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      category: matchedCategory?.name,
      brand: matchedBrand ? [matchedBrand.name] : prev.brand,
      officialStoreOnly: officialQuery || prev.officialStoreOnly,
      freeDeliveryOnly: freeDeliveryQuery || prev.freeDeliveryOnly,
    }));
  }, [matchedCategory, matchedBrand, officialQuery, freeDeliveryQuery]);

  // Main Filtering Logic
  const filteredProducts = useMemo(() => {
    let result = [...catalogProducts];

    // 1. Text Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) => p && (
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p?.category && p?.category.toLowerCase().includes(q)) ||
          (p.sellerName && p.sellerName.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
        )
      );
    }

    // 2. Badge Query from URL (e.g. FLASH SALE, TOP SELLER, SUPER DEAL)
    if (badgeQuery) {
      result = result.filter((p) => p && ((p.badges && p.badges.includes(badgeQuery as any)) || (badgeQuery === 'FLASH SALE' && p.isFlashSale)));
    }

    // 3. Category & Subcategory
    if (filters.category) {
      result = result.filter((p) => p && p?.category && p?.category.toLowerCase() === filters.category!.toLowerCase());
    }
    if (filters.subcategory) {
      result = result.filter((p) => p && p.subcategory && p.subcategory.toLowerCase() === filters.subcategory!.toLowerCase());
    }

    // 4. Brands
    if (Array.isArray(filters.brand) && filters.brand.length > 0) {
      result = result.filter((p) => filters.brand!.includes(p.brand));
    }

    // 5. Price Min/Max
    if (filters.minPrice !== undefined) {
      result = result.filter((p) => p.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      result = result.filter((p) => p.price <= filters.maxPrice!);
    }

    // 6. Rating
    if (filters.minRating !== undefined) {
      result = result.filter((p) => p.rating >= filters.minRating!);
    }

    // 7. Official Store
    if (filters.officialStoreOnly) {
      result = result.filter((p) => p.badges.includes('OFFICIAL STORE'));
    }

    // 8. Free Delivery
    if (filters.freeDeliveryOnly) {
      result = result.filter((p) => p.freeDeliveryEligible);
    }

    // 9. Discount Only
    if (filters.discountOnly) {
      result = result.filter((p) => p.discountPercentage && p.discountPercentage > 0);
    }

    // 10. Availability
    if (filters.availability === 'in_stock') {
      result = result.filter((p) => p.stock > 0);
    }

    // Sorting Logic
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating_desc':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => (b.badges.includes('NEW ARRIVAL') ? 1 : 0) - (a.badges.includes('NEW ARRIVAL') ? 1 : 0));
        break;
      case 'discount_desc':
        result.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
        break;
      case 'popularity':
      default:
        result.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
        break;
    }

    return result;
  }, [catalogProducts, searchQuery, badgeQuery, filters, sortBy]);

  const handleClearAllFilters = () => {
    setFilters({});
  };

  // Determine Title & Breadcrumbs
  const pageTitle = displayTitle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="w-full px-2 sm:px-4 lg:px-6 py-4 sm:py-6"
    >
      {/* 1. Breadcrumbs and Back Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <BackButton label="Back" fallbackUrl="/" />
          <nav className="flex items-center gap-1.5 text-xs text-neutral-500 overflow-x-auto whitespace-nowrap">
            <Link to="/" className="hover:text-[#FF6A00] flex items-center gap-1">
              <Home size={13} />
              <span>Home</span>
            </Link>
            <ChevronRight size={13} className="text-neutral-400" />
            <Link to="/products" className="hover:text-[#FF6A00]">
              Products
            </Link>
            {matchedCategory && (
              <>
                <ChevronRight size={13} className="text-neutral-400" />
                <span className="font-semibold text-neutral-800">{matchedCategory.name}</span>
              </>
            )}
            {matchedBrand && (
              <>
                <ChevronRight size={13} className="text-neutral-400" />
                <span className="font-semibold text-neutral-800">{matchedBrand.name}</span>
              </>
            )}
            {searchQuery && (
              <>
                <ChevronRight size={13} className="text-neutral-400" />
                <span className="font-semibold text-neutral-800">Search: &quot;{searchQuery}&quot;</span>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* 2. Page Title Header */}
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
          {pageTitle}
        </h1>
        {matchedCategory && (
          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setFilters({ ...filters, subcategory: undefined })}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                !filters.subcategory
                  ? 'bg-[#FF6A00] text-white shadow-xs'
                  : 'bg-white text-neutral-700 border border-neutral-200 hover:border-[#FF6A00]'
              }`}
            >
              All {matchedCategory.name}
            </button>
            {matchedCategory.subcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setFilters({ ...filters, subcategory: sub.name })}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  filters.subcategory === sub.name
                    ? 'bg-[#FF6A00] text-white shadow-xs'
                    : 'bg-white text-neutral-700 border border-neutral-200 hover:border-[#FF6A00]'
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Main Grid Layout: Filter Sidebar + Products Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Desktop Sidebar (3 cols) */}
        <div className="hidden lg:block lg:col-span-3">
          <FilterSidebar
            filters={filters}
            onFilterChange={setFilters}
            onClearFilters={handleClearAllFilters}
          />
        </div>

        {/* Mobile Filter Modal */}
        <FilterSidebar
          filters={filters}
          onFilterChange={setFilters}
          onClearFilters={handleClearAllFilters}
          isMobileOpen={isMobileFilterOpen}
          onCloseMobile={() => setIsMobileFilterOpen(false)}
        />

        {/* Products Section (9 cols) */}
        <div className="lg:col-span-9 flex flex-col">
          {/* Sort bar */}
          <SortDropdown
            sortBy={sortBy}
            onSortChange={setSortBy}
            totalCount={filteredProducts.length}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onOpenMobileFilters={() => setIsMobileFilterOpen(true)}
          />

          {/* Active Filter Chips */}
          {(filters.category ||
            filters.subcategory ||
            (Array.isArray(filters.brand) && filters.brand.length > 0) ||
            filters.minPrice !== undefined ||
            filters.maxPrice !== undefined ||
            filters.minRating !== undefined ||
            filters.officialStoreOnly ||
            filters.freeDeliveryOnly ||
            filters.discountOnly ||
            filters.availability === 'in_stock') && (
            <div className="flex flex-wrap items-center gap-1.5 mb-4">
              <span className="text-xs text-neutral-500 font-medium mr-1">Active Filters:</span>

              {filters.category && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-50 text-red-800 text-xs font-semibold border border-red-200">
                  Category: {filters.category}
                  <button
                    onClick={() => setFilters({ ...filters, category: undefined, subcategory: undefined })}
                    className="hover:text-red-950 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}

              {filters.subcategory && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-50 text-red-800 text-xs font-semibold border border-red-200">
                  Sub: {filters.subcategory}
                  <button
                    onClick={() => setFilters({ ...filters, subcategory: undefined })}
                    className="hover:text-red-950 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}

              {filters.brand?.map((b) => (
                <span
                  key={b}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-800 text-xs font-semibold border border-neutral-200"
                >
                  Brand: {b}
                  <button
                    onClick={() =>
                      setFilters({
                        ...filters,
                        brand: filters.brand?.filter((item) => item !== b),
                      })
                    }
                    className="hover:text-red-700 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}

              {filters.officialStoreOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 text-xs font-semibold border border-amber-200">
                  Official Stores Only
                  <button
                    onClick={() => setFilters({ ...filters, officialStoreOnly: undefined })}
                    className="hover:text-amber-950 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}

              {filters.freeDeliveryOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-900 text-xs font-semibold border border-emerald-200">
                  Free Delivery
                  <button
                    onClick={() => setFilters({ ...filters, freeDeliveryOnly: undefined })}
                    className="hover:text-emerald-950 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}

              <button
                onClick={handleClearAllFilters}
                className="text-xs font-bold text-red-700 hover:underline ml-1 cursor-pointer"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Product Grid / List Display */}
          {filteredProducts.length > 0 ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5 sm:gap-3.5'
                  : 'flex flex-col gap-3'
              }
            >
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            /* Zero State */
            <div className="bg-white rounded-2xl border border-neutral-200 p-8 sm:p-12 text-center space-y-4 shadow-2xs">
              <div className="w-16 h-16 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
                <ShoppingBag size={28} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-neutral-900">
                  No products matched your exact filters
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto mt-1">
                  Try clearing some filter criteria, adjusting your price range, or searching with broader keywords.
                </p>
              </div>
              <button
                onClick={handleClearAllFilters}
                className="px-5 py-2.5 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

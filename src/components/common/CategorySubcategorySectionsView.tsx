import React, { useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ChevronRight as BreadcrumbChevron, Layers } from 'lucide-react';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { BackButton } from './BackButton';

export const SimpleProductItem: React.FC<{ product: Product }> = ({ product }) => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/products/${product.id}`)}
      className="group flex flex-col shrink-0 w-[180px] sm:w-[210px] bg-white p-3 cursor-pointer transition-all duration-200 hover:bg-slate-50 border-b border-transparent hover:border-slate-200"
    >
      <div className="relative w-full aspect-square bg-slate-100 mb-2.5 overflow-hidden">
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400'}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
        />
        {product.discountPercentage && product.discountPercentage > 0 && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5">
            -{product.discountPercentage}%
          </span>
        )}
      </div>
      <h3 className="text-xs font-bold text-neutral-900 group-hover:text-[#FF6A00] transition-colors line-clamp-2 mb-1">
        {product.name}
      </h3>
      <div className="mt-auto">
        <div className="text-sm font-black text-neutral-950">
          {formatCurrency(product.price)}
        </div>
        {product.oldPrice && product.oldPrice > product.price && (
          <div className="text-[11px] text-neutral-400 line-through">
            {formatCurrency(product.oldPrice)}
          </div>
        )}
      </div>
    </div>
  );
};

interface SubcategoryRowProps {
  subcategoryName: string;
  categorySlug: string;
  products: Product[];
}

const SubcategoryRow: React.FC<SubcategoryRowProps> = ({ subcategoryName, categorySlug, products }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: direction === 'left' ? -400 : 400, behavior: 'smooth' });
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="w-full bg-white border-b border-slate-100 py-6 px-4 sm:px-6 mb-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6A00]"></span>
            {subcategoryName}
          </h3>
          <div className="flex items-center gap-2">
            <Link
              to={`/category/${categorySlug}?subcategory=${encodeURIComponent(subcategoryName)}`}
              className="text-xs font-bold text-[#FF6A00] hover:underline mr-2"
            >
              See All ({products.length})
            </Link>
            <button
              onClick={() => scroll('left')}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2"
        >
          {products.map((p) => (
            <SimpleProductItem key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
};

export const CategorySubcategorySectionsView: React.FC<{
  categoryName: string;
  categorySlug: string;
  subcategories: any[];
  products: Product[];
  description?: string;
}> = ({ categoryName, categorySlug, subcategories, products, description }) => {
  return (
    <div className="min-h-screen bg-[#f8fafc] pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-4 mb-6">
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-3 font-medium">
          <Link to="/" className="hover:text-slate-900 transition">Home</Link>
          <BreadcrumbChevron size={12} className="text-slate-400" />
          <Link to="/marketplace" className="hover:text-slate-900 transition">Marketplace</Link>
          <BreadcrumbChevron size={12} className="text-slate-400" />
          <span className="text-[#0B132B] font-bold">{categoryName}</span>
        </nav>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <BackButton label="Back to Marketplace" fallbackUrl="/" />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-3 mb-1 tracking-tight">
            {categoryName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
            {description || `Explore verified products and top offers in ${categoryName}. Secured with escrow protection and local warranty.`}
          </p>
        </div>
      </div>

      {/* Stacked Subcategory Horizontal Rows */}
      <div className="w-full space-y-4">
        {subcategories && subcategories.length > 0 ? (
          subcategories.map((sub) => {
            const subName = typeof sub === 'string' ? sub : sub.name;
            const subProducts = products.filter(
              (p) =>
                p.subcategory?.toLowerCase() === subName.toLowerCase() ||
                p.name.toLowerCase().includes(subName.toLowerCase()) ||
                p.category?.toLowerCase() === subName.toLowerCase()
            );
            const displayProducts = subProducts.length > 0 ? subProducts : products.slice(0, 8);

            return (
              <SubcategoryRow
                key={subName}
                subcategoryName={subName}
                categorySlug={categorySlug}
                products={displayProducts}
              />
            );
          })
        ) : (
          <SubcategoryRow
            subcategoryName="Featured Products"
            categorySlug={categorySlug}
            products={products}
          />
        )}
      </div>
    </div>
  );
};

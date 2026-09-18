import React from 'react';
import { useCatalog } from '../hooks/useCatalog';
import { CategorySubcategorySectionsView } from '../components/common/CategorySubcategorySectionsView';

export const BeautyHealthPage: React.FC = () => {
  const { catalogProducts, catalogCategories } = useCatalog();
  const categoryData = catalogCategories.find((c) => c.slug === 'beauty-health') || {
    name: 'Beauty & Health',
    slug: 'beauty-health',
    subcategories: ['Skincare', 'Haircare', 'Makeup & Cosmetics', 'Fragrances', 'Personal Care']
  };

  const products = catalogProducts.filter((p) => p && p?.category && (p?.category.toLowerCase().includes('beauty') || p?.category.toLowerCase().includes('health')));
  const displayProducts = products.length > 0 ? products : catalogProducts;

  return (
    <CategorySubcategorySectionsView
      categoryName={categoryData.name}
      categorySlug="beauty-health"
      subcategories={categoryData.subcategories || ['Skincare', 'Haircare', 'Makeup', 'Fragrances']}
      products={displayProducts}
      description="Genuine skincare, cosmetics, and wellness essentials curated for radiant health."
    />
  );
};

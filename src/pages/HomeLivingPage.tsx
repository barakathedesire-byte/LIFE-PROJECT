import React from 'react';
import { useCatalog } from '../hooks/useCatalog';
import { CategorySubcategorySectionsView } from '../components/common/CategorySubcategorySectionsView';

export const HomeLivingPage: React.FC = () => {
  const { catalogProducts, catalogCategories } = useCatalog();
  const categoryData = catalogCategories.find((c) => c.slug === 'home-living') || {
    name: 'Home & Living',
    slug: 'home-living',
    subcategories: ['Bedding & Linens', 'Kitchen & Dining', 'Home Decor', 'Lighting', 'Furniture']
  };

  const products = catalogProducts.filter((p) => p && p?.category && (p?.category.toLowerCase().includes('home') || p?.category.toLowerCase().includes('living')));
  const displayProducts = products.length > 0 ? products : catalogProducts;

  return (
    <CategorySubcategorySectionsView
      categoryName={categoryData.name}
      categorySlug="home-living"
      subcategories={categoryData.subcategories || ['Kitchen', 'Bedding', 'Decor', 'Furniture']}
      products={displayProducts}
      description="Transform your space with stylish home decor, bedding, and premium kitchen essentials."
    />
  );
};

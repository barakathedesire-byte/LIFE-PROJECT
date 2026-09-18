import React from 'react';
import { useCatalog } from '../hooks/useCatalog';
import { CategorySubcategorySectionsView } from '../components/common/CategorySubcategorySectionsView';

export const AutomotivePage: React.FC = () => {
  const { catalogProducts, catalogCategories } = useCatalog();
  const categoryData = catalogCategories.find((c) => c.slug === 'automotive') || {
    name: 'Automotive',
    slug: 'automotive',
    subcategories: ['Car Electronics', 'Interior Accessories', 'Replacement Parts', 'Tires & Wheels', 'Car Care']
  };

  const products = catalogProducts.filter((p) => p && p?.category && p?.category.toLowerCase().includes('automotive'));
  const displayProducts = products.length > 0 ? products : catalogProducts;

  return (
    <CategorySubcategorySectionsView
      categoryName={categoryData.name}
      categorySlug="automotive"
      subcategories={categoryData.subcategories || ['Car Electronics', 'Interior Accessories', 'Parts', 'Car Care']}
      products={displayProducts}
      description="Reliable car parts, dashcams, and maintenance accessories for vehicles."
    />
  );
};

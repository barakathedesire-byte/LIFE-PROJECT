import React from 'react';
import { useCatalog } from '../hooks/useCatalog';
import { CategorySubcategorySectionsView } from '../components/common/CategorySubcategorySectionsView';

export const PhonesTabletsPage: React.FC = () => {
  const { catalogProducts, catalogCategories } = useCatalog();
  const categoryData = catalogCategories.find((c) => c.slug === 'phones-tablets') || {
    name: 'Phones & Tablets',
    slug: 'phones-tablets',
    subcategories: ['Smartphones', 'Tablets & iPads', 'Smartwatches', 'Accessories', 'Earbuds & Audio', 'Power Banks']
  };

  const products = catalogProducts.filter((p) => p && p?.category && (p?.category.toLowerCase().includes('phone') || p?.category.toLowerCase().includes('tablet') || p?.category.toLowerCase().includes('smartwatch')));
  const displayProducts = products.length > 0 ? products : catalogProducts;

  return (
    <CategorySubcategorySectionsView
      categoryName={categoryData.name}
      categorySlug="phones-tablets"
      subcategories={categoryData.subcategories || ['Smartphones', 'Tablets', 'Accessories', 'Audio']}
      products={displayProducts}
      description="Explore top smartphones, tablets, smartwatches, and mobile accessories with local warranty and escrow protection."
    />
  );
};

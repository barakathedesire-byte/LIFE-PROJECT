import React from 'react';
import { useCatalog } from '../hooks/useCatalog';
import { CategorySubcategorySectionsView } from '../components/common/CategorySubcategorySectionsView';

export const SupermarketPage: React.FC = () => {
  const { catalogProducts, catalogCategories } = useCatalog();
  const categoryData = catalogCategories.find((c) => c.slug === 'groceries') || {
    name: 'Groceries & Supermarket',
    slug: 'groceries',
    subcategories: ['Fresh Produce', 'Beverages', 'Pantry & Staples', 'Household Supplies', 'Snacks & Confectionery']
  };

  const products = catalogProducts.filter((p) => p && p?.category && (p?.category.toLowerCase().includes('grocer') || p?.category.toLowerCase().includes('supermarket') || p?.category.toLowerCase().includes('food')));
  const displayProducts = products.length > 0 ? products : catalogProducts;

  return (
    <CategorySubcategorySectionsView
      categoryName={categoryData.name}
      categorySlug="groceries"
      subcategories={categoryData.subcategories || ['Fresh Produce', 'Beverages', 'Pantry', 'Household']}
      products={displayProducts}
      description="Daily household essentials, farm-fresh produce, and pantry staples delivered straight to your door."
    />
  );
};

import React from 'react';
import { useCatalog } from '../hooks/useCatalog';
import { CategorySubcategorySectionsView } from '../components/common/CategorySubcategorySectionsView';

export const WineAndSpiritsPage: React.FC = () => {
  const { catalogProducts, catalogCategories } = useCatalog();
  const categoryData = catalogCategories.find((c) => c.slug === 'wine-spirits') || {
    name: 'Wine & Spirits',
    slug: 'wine-spirits',
    subcategories: ['Red Wine', 'White Wine', 'Whisky & Bourbon', 'Vodka & Gin', 'Champagne & Sparkling']
  };

  const products = catalogProducts.filter((p) => p && p?.category && (p?.category.toLowerCase().includes('wine') || p?.category.toLowerCase().includes('spirit') || p?.category.toLowerCase().includes('beverage')));
  const displayProducts = products.length > 0 ? products : catalogProducts;

  return (
    <CategorySubcategorySectionsView
      categoryName={categoryData.name}
      categorySlug="wine-spirits"
      subcategories={categoryData.subcategories || ['Red Wine', 'Whisky', 'Vodka & Gin', 'Champagne']}
      products={displayProducts}
      description="Fine wines, premium spirits, and celebratory beverages delivered chilled and securely."
    />
  );
};

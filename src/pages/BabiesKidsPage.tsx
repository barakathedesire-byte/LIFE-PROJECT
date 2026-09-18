import React from 'react';
import { useCatalog } from '../hooks/useCatalog';
import { CategorySubcategorySectionsView } from '../components/common/CategorySubcategorySectionsView';

export const BabiesKidsPage: React.FC = () => {
  const { catalogProducts, catalogCategories } = useCatalog();
  const categoryData = catalogCategories.find((c) => c.slug === 'babies-kids') || {
    name: 'Babies & Kids',
    slug: 'babies-kids',
    subcategories: ['Diapering & Wipes', 'Baby Clothing', 'Toys & Games', 'Feeding & Nursing', 'Strollers & Gear']
  };

  const products = catalogProducts.filter((p) => p && p?.category && (p?.category.toLowerCase().includes('baby') || p?.category.toLowerCase().includes('kid')));
  const displayProducts = products.length > 0 ? products : catalogProducts;

  return (
    <CategorySubcategorySectionsView
      categoryName={categoryData.name}
      categorySlug="babies-kids"
      subcategories={categoryData.subcategories || ['Diapering', 'Clothing', 'Toys', 'Feeding', 'Strollers']}
      products={displayProducts}
      description="Safe, gentle care products, toys, and apparel for babies and growing kids."
    />
  );
};

import React from 'react';
import { useCatalog } from '../hooks/useCatalog';
import { CategorySubcategorySectionsView } from '../components/common/CategorySubcategorySectionsView';

export const SportsFitnessPage: React.FC = () => {
  const { catalogProducts, catalogCategories } = useCatalog();
  const categoryData = catalogCategories.find((c) => c.slug === 'sports-outdoors') || {
    name: 'Sports & Outdoors',
    slug: 'sports-outdoors',
    subcategories: ['Exercise & Fitness', 'Outdoor Recreation', 'Team Sports', 'Sportswear', 'Camping & Hiking']
  };

  const products = catalogProducts.filter((p) => p && p?.category && (p?.category.toLowerCase().includes('sport') || p?.category.toLowerCase().includes('fitness')));
  const displayProducts = products.length > 0 ? products : catalogProducts;

  return (
    <CategorySubcategorySectionsView
      categoryName={categoryData.name}
      categorySlug="sports-outdoors"
      subcategories={categoryData.subcategories || ['Fitness', 'Outdoor', 'Team Sports', 'Sportswear']}
      products={displayProducts}
      description="Gym equipment, outdoor gear, and sportswear to elevate your active lifestyle."
    />
  );
};

import React from 'react';
import { useCatalog } from '../hooks/useCatalog';
import { CategorySubcategorySectionsView } from '../components/common/CategorySubcategorySectionsView';

export const ElectronicsAudioPage: React.FC = () => {
  const { catalogProducts, catalogCategories } = useCatalog();
  const categoryData = catalogCategories.find((c) => c.slug === 'electronics') || {
    name: 'Electronics & Audio',
    slug: 'electronics',
    subcategories: ['Televisions', 'Home Theater', 'Bluetooth Speakers', 'Headphones & Earbuds', 'Cameras & Drones']
  };

  const products = catalogProducts.filter((p) => p && p?.category && (p?.category.toLowerCase().includes('electronic') || p?.category.toLowerCase().includes('audio') || p?.category.toLowerCase().includes('tv')));
  const displayProducts = products.length > 0 ? products : catalogProducts;

  return (
    <CategorySubcategorySectionsView
      categoryName={categoryData.name}
      categorySlug="electronics"
      subcategories={categoryData.subcategories || ['Televisions', 'Home Theater', 'Speakers', 'Headphones']}
      products={displayProducts}
      description="Immersive sound systems, 4K Smart TVs, and professional electronics from verified brands."
    />
  );
};

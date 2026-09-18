import React from 'react';
import { useCatalog } from '../hooks/useCatalog';
import { CategorySubcategorySectionsView } from '../components/common/CategorySubcategorySectionsView';

export const FashionApparelPage: React.FC = () => {
  const { catalogProducts, catalogCategories } = useCatalog();
  const categoryData = catalogCategories.find((c) => c.slug === 'fashion') || {
    name: 'Fashion & Apparel',
    slug: 'fashion',
    subcategories: ['Men\'s Wear', 'Women\'s Wear', 'Footwear', 'Watches & Jewelry', 'Bags & Luggage']
  };

  const products = catalogProducts.filter((p) => p && p?.category && (p?.category.toLowerCase().includes('fashion') || p?.category.toLowerCase().includes('apparel') || p?.category.toLowerCase().includes('shoe')));
  const displayProducts = products.length > 0 ? products : catalogProducts;

  return (
    <CategorySubcategorySectionsView
      categoryName={categoryData.name}
      categorySlug="fashion"
      subcategories={categoryData.subcategories || ['Men Wear', 'Women Wear', 'Footwear', 'Accessories']}
      products={displayProducts}
      description="Trendy outfits, footwear, and accessories from top East African and global designers."
    />
  );
};

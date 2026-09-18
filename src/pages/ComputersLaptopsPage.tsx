import React from 'react';
import { useCatalog } from '../hooks/useCatalog';
import { CategorySubcategorySectionsView } from '../components/common/CategorySubcategorySectionsView';

export const ComputersLaptopsPage: React.FC = () => {
  const { catalogProducts, catalogCategories } = useCatalog();
  const categoryData = catalogCategories.find((c) => c.slug === 'computers') || {
    name: 'Computers & Laptops',
    slug: 'computers',
    subcategories: ['Laptops', 'Desktops & All-in-One', 'Monitors', 'Printers & Scanners', 'Computer Accessories']
  };

  const products = catalogProducts.filter((p) => p && p?.category && (p?.category.toLowerCase().includes('computer') || p?.category.toLowerCase().includes('laptop')));
  const displayProducts = products.length > 0 ? products : catalogProducts;

  return (
    <CategorySubcategorySectionsView
      categoryName={categoryData.name}
      categorySlug="computers"
      subcategories={categoryData.subcategories || ['Laptops', 'Monitors', 'Printers', 'Accessories']}
      products={displayProducts}
      description="High-performance laptops, desktop workstations, and computer peripherals for professionals and students."
    />
  );
};

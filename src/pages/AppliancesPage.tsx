import React from 'react';
import { useCatalog } from '../hooks/useCatalog';
import { CategorySubcategorySectionsView } from '../components/common/CategorySubcategorySectionsView';

export const AppliancesPage: React.FC = () => {
  const { catalogProducts, catalogCategories } = useCatalog();
  const categoryData = catalogCategories.find((c) => c.slug === 'appliances') || {
    name: 'Appliances',
    slug: 'appliances',
    subcategories: ['Refrigerators', 'Washing Machines', 'Cookers & Ovens', 'Microwaves', 'Small Kitchen Appliances']
  };

  const products = catalogProducts.filter((p) => p && p?.category && p?.category.toLowerCase().includes('appliance'));
  const displayProducts = products.length > 0 ? products : catalogProducts;

  return (
    <CategorySubcategorySectionsView
      categoryName={categoryData.name}
      categorySlug="appliances"
      subcategories={categoryData.subcategories || ['Refrigerators', 'Washing Machines', 'Cookers', 'Microwaves']}
      products={displayProducts}
      description="Energy-efficient large and small home appliances with official manufacturer warranties."
    />
  );
};

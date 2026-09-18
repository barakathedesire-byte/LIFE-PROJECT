import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useCatalog } from '../hooks/useCatalog';
import { Product } from '../types';
import { LumoLoader } from '../components/common/LumoLoader';
import { CategorySubcategorySectionsView } from '../components/common/CategorySubcategorySectionsView';

export const CategoryPage: React.FC = () => {
  const { catalogProducts, catalogCategories } = useCatalog();
  const { category: slugParam, slug } = useParams<{ category?: string; slug?: string }>();
  const categorySlug = slugParam || slug || 'electronics';
  const [searchParams] = useSearchParams();
  const selectedSubcategory = searchParams.get('subcategory') || '';

  const [categoryInfo, setCategoryInfo] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const loadCategoryData = async () => {
      const s = (categorySlug || '').toLowerCase();
      try {
        const catRes = await api.getCategories();
        const allCats = catRes.categories || [];
        const match = allCats.find((c: any) => 
          (c.slug || '').toLowerCase() === s || 
          (c.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-') === s ||
          (c.id || '').toLowerCase() === s
        ) || catalogCategories.find((c) => 
          (c.slug || '').toLowerCase() === s || 
          (c.id || '').toLowerCase() === s
        );

        const currentCat = match || {
          name: (categorySlug || 'Category').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          slug: categorySlug || '',
          subcategories: [],
          description: `Explore top-rated products in ${(categorySlug || 'this category').replace(/-/g, ' ')}. Verified seller listings with escrow protection.`
        };

        if (mounted) setCategoryInfo(currentCat);

        const prodRes = await api.getProducts({ category: currentCat.name || categorySlug });
        let list = prodRes.products || catalogProducts.filter(p => p.category?.toLowerCase().includes(categorySlug.replace(/-/g, ' ')));
        if (list.length === 0) {
          list = catalogProducts;
        }

        if (selectedSubcategory) {
          list = list.filter(p => p.subcategory?.toLowerCase() === selectedSubcategory.toLowerCase() || p.name.toLowerCase().includes(selectedSubcategory.toLowerCase()));
        }

        if (mounted) {
          setProducts(list);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load category:', err);
        if (mounted) {
          setProducts(catalogProducts);
          setLoading(false);
        }
      }
    };

    loadCategoryData();
    return () => { mounted = false; };
  }, [categorySlug, selectedSubcategory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <LumoLoader size="large" />
      </div>
    );
  }

  const subcategories = categoryInfo?.subcategories || ['Featured', 'Best Sellers', 'New Arrivals', 'Trending'];

  return (
    <CategorySubcategorySectionsView
      categoryName={categoryInfo?.name || categorySlug}
      categorySlug={categorySlug}
      subcategories={subcategories}
      products={products}
      description={categoryInfo?.description}
    />
  );
};

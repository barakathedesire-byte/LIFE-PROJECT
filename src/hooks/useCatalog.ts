import { useState, useEffect } from 'react';
import { api } from '../services/api';

let cachedProducts: any[] | null = null;
let cachedCategories: any[] | null = null;

export const useCatalog = () => {
  const [catalogProducts, setProducts] = useState<any[]>(cachedProducts || []);
  const [catalogCategories, setCategories] = useState<any[]>(cachedCategories || []);
  const [catalogBrands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(!cachedProducts);

  useEffect(() => {
    if (cachedProducts) return;
    let mounted = true;
    Promise.all([
      api.getProducts().catch(() => ({ products: [] })),
      api.getCategories().catch(() => ({ categories: [] }))
    ]).then(([prodRes, catRes]) => {
      if (mounted) {
        cachedProducts = prodRes.products || [];
        cachedCategories = catRes.categories || [];
        setProducts(cachedProducts);
        setCategories(cachedCategories);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  return { catalogProducts, catalogCategories, catalogBrands, loading };
};

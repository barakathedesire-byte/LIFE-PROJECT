import React, { useEffect, useState } from 'react';
import { Award, TrendingUp } from 'lucide-react';
import { Product } from '../../types';
import { api } from '../../services/api';
import { HorizontalProductCarousel } from '../common/HorizontalProductCarousel';

export const TopSellers: React.FC = () => {
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    api.getTrendingAutoDetected()
      .then((data) => {
        if (isMounted && data.products) {
          setTrendingProducts(data.products);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  if (!loading && trendingProducts.length === 0) return null;

  return (
    <HorizontalProductCarousel
      title="Trending & Top Sellers"
      subtitle="Algorithmically ranked by orders, customer reviews, and sales velocity"
      badge={{ text: 'Auto-Detected', variant: 'emerald' }}
      icon={
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#FF6A00] text-white flex items-center justify-center shadow-xs">
          <TrendingUp size={18} />
        </div>
      }
      viewAllLink="/top-sellers"
      viewAllLabel="View All Trending"
      products={trendingProducts}
      variant="card"
      
    />
  );
};

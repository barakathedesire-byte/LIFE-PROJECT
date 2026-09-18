import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Product } from '../../types';
import { api } from '../../services/api';
import { HorizontalProductCarousel } from '../common/HorizontalProductCarousel';

export const SponsoredSection: React.FC = () => {
  const [sponsoredProducts, setSponsoredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    api.getSponsoredProducts()
      .then((data) => {
        if (isMounted && data.products) {
          setSponsoredProducts(data.products);
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

  if (!loading && sponsoredProducts.length === 0) return null;

  return (
    <HorizontalProductCarousel
      title="Sponsored & Verified"
      subtitle="Premium recommendations from trusted partners"
      badge={{ text: 'Ad', variant: 'emerald' }}
      icon={
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-orange-100 text-[#FF6A00] flex items-center justify-center shadow-xs">
          <Sparkles size={18} className="fill-[#FF6A00]" />
        </div>
      }
      viewAllLink="/sponsored"
      viewAllLabel="See All Sponsored"
      products={sponsoredProducts}
      variant="card"
      
    />
  );
};

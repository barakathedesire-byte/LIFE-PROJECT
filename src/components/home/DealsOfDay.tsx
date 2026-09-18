import React, { useState, useEffect } from 'react';
import { Flame, Clock } from 'lucide-react';
import { HorizontalProductCarousel } from '../common/HorizontalProductCarousel';
import { api } from '../../services/api';
import { Product } from '../../types';

export const DealsOfDay: React.FC = () => {
  const [dealCountdown, setDealCountdown] = useState({
    hours: 11,
    minutes: 42,
    seconds: 15,
  });

  const [dealProducts, setDealProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setDealCountdown((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let mounted = true;
    api.getProducts({ badge: 'SUPER DEAL', limit: 8 })
      .then(res => {
        if (mounted && res.products) {
          setDealProducts(res.products);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const format2 = (n: number) => n.toString().padStart(2, '0');

  const countdownHeader = (
    <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-neutral-700 font-semibold bg-neutral-100/95 border border-neutral-200/80 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg shrink-0 whitespace-nowrap">
      <Clock size={11} className="text-[#FF6A00] shrink-0" />
      <span className="hidden sm:inline text-[10px] sm:text-xs">Resets in:</span>
      <span className="font-mono font-bold text-neutral-900 text-[10px] sm:text-xs">
        {format2(dealCountdown.hours)}h:{format2(dealCountdown.minutes)}m:{format2(dealCountdown.seconds)}s
      </span>
    </div>
  );

  if (!loading && dealProducts.length === 0) return null;

  return (
    <HorizontalProductCarousel
      title="Deals of the Day"
      subtitle="Fresh daily discounts updated every 24 hours"
      badge={{ text: 'Today Only', variant: 'orange' }}
      icon={
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#FF6A00] text-white flex items-center justify-center shadow-xs">
          <Flame size={18} />
        </div>
      }
      viewAllLink="/deals"
      viewAllLabel="View All Deals"
      headerRight={countdownHeader}
      products={dealProducts}
      variant="card"
      
    />
  );
};

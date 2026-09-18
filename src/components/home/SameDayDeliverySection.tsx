import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Clock, ArrowRight } from 'lucide-react';

import { HorizontalProductCarousel } from '../common/HorizontalProductCarousel';

export const SameDayDeliverySection: React.FC = () => {
  const [expressPreview, setProducts] = React.useState<any[]>([]);
  React.useEffect(() => {
    let mounted = true;
    import('../../services/api').then(({ api }) => {
      api.getProducts({ limit: 4 }).then(res => {
        if (mounted) setProducts(res.products);
      });
    });
    return () => { mounted = false; };
  }, []);

  

  const footerBanner = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-neutral-50 rounded-2xl p-3 border border-neutral-200/70 text-xs">
      <div className="flex items-center gap-2 text-neutral-600">
        <Clock size={15} className="text-[#FF6A00] shrink-0" />
        <span>Over <strong>45+ pickup stations</strong> across Kinondoni, Ilala, Temeke, Ubungo & Kariakoo.</span>
      </div>
      <Link
        to="/same-day-delivery"
        className="text-xs font-black text-[#FF6A00] hover:text-[#E55E00] flex items-center gap-1 group whitespace-nowrap self-start sm:self-auto"
      >
        <span>See More Same Day Items</span>
        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );

  return (
    <HorizontalProductCarousel
      title="Free Same Day Delivery Hub"
      subtitle="Orders placed before 2:00 PM are delivered directly to your doorstep or pickup station today."
      badge={{ text: 'Dar es Salaam Express', variant: 'emerald' }}
      icon={
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60 shadow-xs">
          <Truck size={18} />
        </div>
      }
      viewAllLink="/same-day-delivery"
      viewAllLabel="Explore All"
      products={expressPreview}
      footer={footerBanner}
      variant="card"
    />
  );
};


import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  Clock,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Filter,
  Zap,
  PhoneCall,
  Sparkles,
} from 'lucide-react';
import { useCatalog } from '../hooks/useCatalog';
import { ProductCard } from '../components/common/ProductCard';

export const SameDayDeliveryPage: React.FC = () => {
  const { catalogProducts, catalogCategories, catalogBrands } = useCatalog();

  const [selectedCity, setSelectedCity] = useState('dar');

  // Filter products eligible for free / express same day delivery
  const expressProducts = catalogProducts.filter(
    (p) => p && (p.freeDeliveryEligible || p.badges?.includes('FREE DELIVERY') || p.badges?.includes('TOP SELLER'))
  );

  return (
    <div className="w-full space-y-6 pb-16">
      {/* 1. HERO HEADER */}
      <div className="w-full px-2 sm:px-4 lg:px-6 pt-3">
        <div className="w-full bg-gradient-to-r from-[#FF6A00] via-[#EA580C] to-[#0B132B] text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-wider backdrop-blur-xs border border-white/20">
              <Zap size={14} className="text-amber-300 fill-amber-300" />
              <span>LUMO Express Dispatch</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Free Same-Day & Express Delivery
            </h1>

            <p className="text-xs sm:text-base text-orange-50 max-w-2xl leading-relaxed">
              Order before 2:00 PM and get doorstep delivery within Dar es Salaam by 6:00 PM today. Free delivery on orders over TZS 50,000 or collect from 15+ pickup stations with zero handling fees.
            </p>

            <div className="flex items-center gap-3 pt-2 flex-wrap text-xs">
              <div className="bg-black/30 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-white/20 flex items-center gap-2">
                <Clock size={16} className="text-amber-300" />
                <span>Today's Order Cutoff: <strong>2:00 PM</strong></span>
              </div>
              <div className="bg-black/30 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-white/20 flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span>100% Escrow Protected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. HUB COVERAGE STRIP */}
      <section className="w-full px-2 sm:px-4 lg:px-6">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-50 text-[#FF6A00] rounded-xl shrink-0">
              <MapPin size={22} />
            </div>
            <div>
              <h3 className="text-sm font-black text-neutral-900">Same-Day Express Coverage Areas</h3>
              <p className="text-xs text-neutral-500">
                Dar es Salaam: Kinondoni, Ilala, Temeke, Ubungo, Kigamboni, Posta & Kariakoo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              ✓ Fast Motorcycle Couriers
            </span>
            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              ✓ Real-time SMS Tracking
            </span>
          </div>
        </div>
      </section>

      {/* 3. PRODUCT CATALOG */}
      <section className="w-full px-2 sm:px-4 lg:px-6">
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
            <div>
              <div className="flex items-center gap-2">
                <Truck size={20} className="text-[#FF6A00]" />
                <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                  Available for Immediate Dispatch ({expressProducts.length} Items)
                </h2>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                All items below are stocked in Dar es Salaam local fulfillment centers and ready for dispatch.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {expressProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

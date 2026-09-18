import React, { useState } from 'react';
import { Truck, MapPin, CheckCircle2, ShieldCheck, Clock, Building2, Search } from 'lucide-react';
import { useCatalog } from '../hooks/useCatalog';
import { ProductCard } from '../components/common/ProductCard';

export const FreeDeliveryZonesPage: React.FC = () => {
  const { catalogProducts, catalogCategories, catalogBrands } = useCatalog();

  const [searchZone, setSearchZone] = useState('');
  
  const freeDeliveryProducts = catalogProducts.filter((p) => p && p?.freeDeliveryEligible);

  const zones = [
    {
      region: 'Dar es Salaam',
      status: '100% Free Doorstep & Pickup Stations',
      threshold: 'Orders over TZS 50,000',
      time: 'Same Day / 24 Hours',
      areas: ['Kinondoni', 'Ilala', 'Temeke', 'Ubungo', 'Kigamboni', 'Posta / CBD', 'Mlimani City', 'Kariakoo', 'Mikocheni', 'Oysterbay', 'Sinza', 'Tegeta', 'Mbezi Beach'],
    },
    {
      region: 'Arusha & Kilimanjaro (Moshi)',
      status: 'Free Pickup Stations & Subsidized Delivery',
      threshold: 'Orders over TZS 80,000',
      time: '1 to 2 Business Days',
      areas: ['Arusha Clocktower', 'Njiro Complex', 'Moshi CBD', 'KCMC Area', 'Tengeru'],
    },
    {
      region: 'Mwanza & Lake Zone',
      status: 'Free Pickup Stations & Express Bus Cargo',
      threshold: 'Orders over TZS 80,000',
      time: '2 Business Days',
      areas: ['Nyamagana', 'Ilemela', 'Capri Point', 'Mwanza CBD', 'Nyegezi'],
    },
    {
      region: 'Dodoma (Capital City)',
      status: 'Free Pickup Station Delivery',
      threshold: 'Orders over TZS 75,000',
      time: '1 to 2 Business Days',
      areas: ['Area D', 'Mtendeni', 'Dodoma Central Bus Terminal', 'University of Dodoma (UDOM)'],
    },
    {
      region: 'Zanzibar (Unguja & Pemba)',
      status: 'Fast Marine Courier Pickup',
      threshold: 'Orders over TZS 100,000',
      time: '24 to 48 Hours',
      areas: ['Stone Town', 'Malindi Port Station', 'Chake Chake', 'Bububu', 'Nungwi Hub'],
    },
  ];

  const filteredZones = zones.filter((z) =>
    z.region.toLowerCase().includes(searchZone.toLowerCase()) ||
    z.areas.some((a) => a.toLowerCase().includes(searchZone.toLowerCase()))
  );

  return (
    <div className="w-full space-y-6 pb-16">
      {/* Hero */}
      <div className="w-full px-2 sm:px-4 lg:px-6 pt-3">
        <div className="w-full bg-gradient-to-r from-emerald-800 via-teal-900 to-[#0B132B] text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-black uppercase tracking-wider shadow-md">
              <Truck size={14} />
              <span>Zero-Cost Shipping Across Tanzania</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Free Delivery Zones & Stations
            </h1>
            <p className="text-xs sm:text-base text-emerald-100 max-w-2xl leading-relaxed">
              Find out how to get free doorstep shipping or pickup at over 45+ partner hubs and courier lockers across Dar es Salaam, Arusha, Mwanza, Dodoma, Zanzibar, and Mbeya.
            </p>

            {/* Zone Search Bar */}
            <div className="pt-2 max-w-md">
              <div className="relative">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={searchZone}
                  onChange={(e) => setSearchZone(e.target.value)}
                  placeholder="Check your city or neighborhood (e.g. Sinza, Njiro, Stone Town)..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white text-neutral-900 placeholder-neutral-500 text-xs sm:text-sm font-medium focus:outline-hidden shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coverage Zones Accordion/Cards */}
      <section className="w-full px-2 sm:px-4 lg:px-6">
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200 shadow-xs space-y-4">
          <h2 className="text-lg sm:text-xl font-black text-neutral-900 tracking-tight">
            Designated Free Shipping & Pickup Hubs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredZones.map((zone, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/70 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-[#FF6A00]" />
                    <h3 className="text-sm font-black text-neutral-900">{zone.region}</h3>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    {zone.time}
                  </span>
                </div>
                <div className="text-xs text-neutral-600 space-y-1">
                  <div className="font-semibold text-emerald-700">{zone.status}</div>
                  <div className="text-[11px] text-neutral-500">{zone.threshold}</div>
                </div>
                <div className="pt-2 border-t border-neutral-200/80">
                  <div className="text-[11px] font-bold text-neutral-700 mb-1.5">Covered Sub-locations:</div>
                  <div className="flex flex-wrap gap-1">
                    {zone.areas.map((area, aIdx) => (
                      <span key={aIdx} className="text-[10px] bg-white px-2 py-0.5 rounded-md border border-neutral-200 text-neutral-600">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free Delivery Product Catalog */}
      <section className="w-full px-2 sm:px-4 lg:px-6">
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                Products with Free Shipping ({freeDeliveryProducts.length} Items)
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Qualified items are delivered at zero freight cost.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Free Shipping Tagged
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {freeDeliveryProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

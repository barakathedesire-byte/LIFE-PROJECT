import React from 'react';
import { MarketplaceHighlights } from '../components/home/MarketplaceHighlights';
import { FlashSaleSection } from '../components/home/FlashSaleSection';
import { DealsOfDay } from '../components/home/DealsOfDay';
import { OfficialStores } from '../components/home/OfficialStores';
import { SupermarketBanner } from '../components/home/SupermarketBanner';
import { SponsoredSection } from '../components/home/SponsoredSection';
import { TopSellers } from '../components/home/TopSellers';
import { SaveTheDateBanner } from '../components/home/SaveTheDateBanner';
import { SameDayDeliverySection } from '../components/home/SameDayDeliverySection';
import { RecentlyViewedSection } from '../components/home/RecentlyViewedSection';
import { EcosystemServicesSection } from '../components/home/EcosystemServicesSection';
import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';

export const HomePage: React.FC = () => {
  useSEO({
    title: 'LUMO - Escrow Multi-Vendor Marketplace Tanzania',
    description: 'Shop authentic phones, laptops, fashion, electronics, and supermarket items on LUMO Tanzania with M-Pesa escrow protection and same-day delivery.',
  });

  return (
    <div className="w-full space-y-4 pb-12">
      {/* Official Brand Store, Pickup Stations & New Customer Deal Strip */}
      <MarketplaceHighlights />

      {/* 2. Recently Viewed Products (Persisted via localStorage) */}
      <RecentlyViewedSection />

      {/* 3. Flash Sale Section with Live Countdown */}
      <FlashSaleSection />

      {/* 4. Deals of the Day */}
      <DealsOfDay />

      {/* 5. Sponsored Products Showcase Card */}
      <SponsoredSection />

      {/* 6. Official Brand Stores */}
      <OfficialStores />

      {/* 7. Supermarket & Kilombero Rice Banner */}
      <SupermarketBanner />

      {/* 8. Top Sellers & Auto-Detected Trending */}
      <TopSellers />

      {/* 9. Save The Date Tab (Dedicated Discount Day with Countdown) */}
      <SaveTheDateBanner />

      {/* 10. Free Same Day Delivery Tab */}
      <SameDayDeliverySection />

      {/* 11. LUMO Partner & Opportunity Ecosystem Cards */}
      <EcosystemServicesSection />

      {/* 12. Zero Risk Guarantee Escrow Buyer Protection Trust Banner */}
      <section className="w-full px-2 sm:px-4 lg:px-6 py-2">
        <div className="w-full bg-gradient-to-r from-[#0B132B] via-[#1E293B] to-[#0B132B] text-white rounded-3xl p-5 sm:p-8 border border-neutral-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
              <ShieldCheck size={14} />
              <span>Zero-Risk Guarantee for East Africa</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Shop With 100% Peace of Mind on LUMO
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Every single order is backed by LUMO Escrow. When you pay via M-Pesa, Tigo Pesa, Airtel Money, Halopesa or Card, the seller is only paid after you receive and confirm your item.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <Link
              to="/help"
              className="px-6 py-3 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-bold text-xs sm:text-sm rounded-xl text-center shadow-lg transition"
            >
              How Escrow Works
            </Link>
            <Link
              to="/all-marketplace"
              className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs sm:text-sm rounded-xl text-center border border-neutral-700 transition"
            >
              Start Shopping Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};



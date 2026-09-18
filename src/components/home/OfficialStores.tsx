import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ChevronRight, Sparkles } from 'lucide-react';

import { ProductCard } from '../common/ProductCard';

export const OfficialStores: React.FC = () => {
  const [sponsoredProducts, setSponsoredProducts] = React.useState<any[]>([]);
  React.useEffect(() => {
    let mounted = true;
    import('../../services/api').then(({ api }) => {
      api.getProducts({ limit: 5, badge: 'OFFICIAL STORE' }).then(res => {
        if (mounted) setSponsoredProducts(res.products.map((p, idx) => ({ id: idx, brand: p.brand, logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=100&q=80', banner: p.thumbnail, productsCount: Math.floor(Math.random() * 500) + 100 })));
      });
    });
    return () => { mounted = false; };
  }, []);

  // Select 5 sponsored products and attach 'SPONSORED' badge
  

  return (
    <section className="w-full px-2 sm:px-4 lg:px-6 py-2">
      <div className="bg-white rounded-3xl border border-neutral-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        {/* Official Brand Stores Header & Explore All Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0B132B] text-amber-400 flex items-center justify-center" style={{ height: '32.375px', width: '41.7344px' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
                Official Brand Stores
                <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded uppercase">
                  100% Genuine
                </span>
              </h2>
              <p className="text-xs text-neutral-500">
                Direct authorized flagship distributors with full manufacturer warranty
              </p>
            </div>
          </div>

          <Link
            to="/official-stores"
            className="text-xs font-bold text-[#FF6A00] hover:text-[#E55E00] flex items-center gap-1 group self-start sm:self-auto px-3.5 py-2 rounded-xl bg-orange-50/70 hover:bg-orange-100 transition cursor-pointer"
          >
            <span>Explore All Official Stores</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition" />
          </Link>
        </div>

        {/* Sponsored Products Container (In place of Brand Cards) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-neutral-800">
              <Sparkles size={15} className="text-amber-500" />
              <span>Sponsored Products</span>
              <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold uppercase">
                Featured Ads
              </span>
            </div>
            <Link
              to="/sponsored-products"
              className="text-xs font-bold text-[#FF6A00] hover:text-[#E55E00] flex items-center gap-1 group px-2.5 py-1 rounded-xl bg-orange-50/80 hover:bg-orange-100 transition"
            >
              <span>Discover More</span>
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {sponsoredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ChevronRight, Check } from 'lucide-react';

import { ProductCard } from '../common/ProductCard';

export const SupermarketBanner: React.FC = () => {
  const [groceryItems, setProducts] = React.useState<any[]>([]);
  React.useEffect(() => {
    let mounted = true;
    import('../../services/api').then(({ api }) => {
      api.getProducts({ category: 'supermarket', limit: 4 }).then(res => {
        if (mounted) setProducts(res.products);
      });
    });
    return () => { mounted = false; };
  }, []);

 

  return (
    <section className="w-full px-2 sm:px-4 lg:px-6 py-2">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Banner callout */}
        <div className="lg:col-span-4 bg-gradient-to-br from-emerald-800 via-emerald-900 to-neutral-900 text-white rounded-2xl p-6 flex flex-col justify-between shadow-md relative overflow-hidden">
          <div className="space-y-3 relative z-10">
            <span className="inline-block bg-amber-400 text-neutral-950 text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
              LUMO FRESH SUPERMARKET
            </span>
            <h3 className="text-2xl font-black leading-snug">
              Kilombero Rice, Cooking Essentials & Groceries
            </h3>
            <p className="text-xs text-emerald-200 leading-relaxed">
              Stock up your home with fresh harvest staples, household items and personal care delivered directly to your doorstep.
            </p>

            <ul className="space-y-1.5 text-xs text-white pt-2 font-medium">
              <li className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <Check size={10} />
                </div>
                <span>100% Sorted Machine-Cleaned Kilombero Rice</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <Check size={10} />
                </div>
                <span>Same-day doorstep delivery across Dar es Salaam</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <Check size={10} />
                </div>
                <span>Wholesale & Bulk family bundle pricing</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 relative z-10">
            <Link
              to="/supermarket"
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-bold text-xs rounded-xl shadow-lg transition active:scale-98"
            >
              <span>Explore LUMO Supermarket</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
          {groceryItems.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

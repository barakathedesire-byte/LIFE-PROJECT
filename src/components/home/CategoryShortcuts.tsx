import React from 'react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../../hooks/useCatalog';
import {
  Smartphone,
  Tv,
  Laptop,
  Home,
  Refrigerator,
  Shirt,
  Sparkles,
  ShoppingBag,
  Dumbbell,
  Car,
  ChevronRight,
  Baby,
  Wheat,
  Stethoscope,
  Wine,
  ShoppingBasket,
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Smartphone: <Smartphone size={20} />,
  Tv: <Tv size={20} />,
  Laptop: <Laptop size={20} />,
  Home: <Home size={20} />,
  Refrigerator: <Refrigerator size={20} />,
  Shirt: <Shirt size={20} />,
  Sparkles: <Sparkles size={20} />,
  ShoppingBag: <ShoppingBag size={20} />,
  Dumbbell: <Dumbbell size={20} />,
  Car: <Car size={20} />,
  Baby: <Baby size={20} />,
  Wheat: <Wheat size={20} />,
  Stethoscope: <Stethoscope size={20} />,
  Wine: <Wine size={20} />,
  ShoppingBasket: <ShoppingBasket size={20} />,
};

export const CategoryShortcuts: React.FC = () => {
  const { catalogCategories } = useCatalog();

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-neutral-900 tracking-tight">
            Shop by Category
          </h2>
          <p className="text-xs text-neutral-500">Explore authentic products across popular departments</p>
        </div>
        <Link
          to="/products"
          className="text-xs font-bold text-red-700 hover:text-red-800 flex items-center gap-1 group"
        >
          <span>All Categories</span>
          <ChevronRight size={14} className="group-hover:translate-x-0.5 transition" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {catalogCategories.map((category) => (
          <Link
            key={category.id}
            to={`/category/${category.slug}`}
            className="group relative bg-white hover:bg-red-50/40 rounded-xl p-3 border border-neutral-200/80 hover:border-red-300 shadow-2xs hover:shadow-md transition-all duration-300 flex items-center gap-3 overflow-hidden"
          >
            <div className="w-12 h-12 rounded-xl bg-neutral-100 group-hover:bg-red-100 text-neutral-700 group-hover:text-red-700 flex items-center justify-center shrink-0 transition-colors">
              {iconMap[category.iconName] || <ShoppingBag size={20} />}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-xs text-neutral-900 group-hover:text-red-700 transition-colors truncate">
                {category.name}
              </h3>
              <p className="text-[11px] text-neutral-500 mt-0.5 font-medium">
                {category.itemCount}+ Items
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

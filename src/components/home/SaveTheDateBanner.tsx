import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Sparkles, Clock, ArrowRight, Tag, BellRing } from 'lucide-react';

import { formatCurrency } from '../../utils/formatters';

export const SaveTheDateBanner: React.FC = () => {
  const [galaPreviewProducts, setProducts] = React.useState<any[]>([]);
  React.useEffect(() => {
    let mounted = true;
    import('../../services/api').then(({ api }) => {
      api.getProducts({ limit: 4 }).then(res => {
        if (mounted) setProducts(res.products);
      });
    });
    return () => { mounted = false; };
  }, []);

  // Target Gala: 5 Days, 18 Hours, 45 Minutes from now
  const [timeLeft, setTimeLeft] = useState({
    days: 5,
    hours: 18,
    minutes: 45,
    seconds: 20,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  

  return (
    <section className="w-full px-2 sm:px-4 lg:px-6">
      <div className="w-full bg-gradient-to-r from-[#0B132B] via-[#1E1B4B] to-[#FF6A00] text-white rounded-3xl p-5 sm:p-8 border border-neutral-800 shadow-xl overflow-hidden relative">
        {/* Ambient Decorative background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF6A00]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Left Text & Countdown */}
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 border border-white/20 text-xs font-black uppercase tracking-wider backdrop-blur-xs">
              <Calendar size={14} className="text-purple-300" />
              <span>Dedicated Discount Day</span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                Save The Date: LUMO Mega Discount Gala
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 mt-1 leading-relaxed">
                Up to <strong>70% OFF</strong> flagship smartphones, smart TVs, home appliances, and designer fashion. Mark your calendar and unlock VIP early-bird vouchers!
              </p>
            </div>

            {/* COUNTDOWN TIMER BOX */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="text-center bg-black/40 backdrop-blur-xs border border-white/20 px-3 py-2 rounded-2xl min-w-[62px]">
                <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
                  {String(timeLeft.days).padStart(2, '0')}
                </div>
                <div className="text-[10px] uppercase font-bold text-neutral-400">Days</div>
              </div>

              <div className="text-center bg-black/40 backdrop-blur-xs border border-white/20 px-3 py-2 rounded-2xl min-w-[62px]">
                <div className="text-xl sm:text-2xl font-black text-white font-mono">
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <div className="text-[10px] uppercase font-bold text-neutral-400">Hours</div>
              </div>

              <div className="text-center bg-black/40 backdrop-blur-xs border border-white/20 px-3 py-2 rounded-2xl min-w-[62px]">
                <div className="text-xl sm:text-2xl font-black text-white font-mono">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <div className="text-[10px] uppercase font-bold text-neutral-400">Minutes</div>
              </div>

              <div className="text-center bg-black/40 backdrop-blur-xs border border-white/20 px-3 py-2 rounded-2xl min-w-[62px]">
                <div className="text-xl sm:text-2xl font-black text-[#FF6A00] font-mono animate-pulse">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
                <div className="text-[10px] uppercase font-bold text-neutral-400">Seconds</div>
              </div>
            </div>

            <div className="pt-1">
              <Link
                to="/save-the-date"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#FF6A00] hover:bg-[#E55E00] text-white font-black text-xs sm:text-sm shadow-lg transition active:scale-98"
              >
                <span>View All Gala Discount Products</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Right Product Previews */}
          <div className="w-full lg:w-auto grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 shrink-0">
            {galaPreviewProducts.map((product) => (
              <Link
                key={product.id}
                to="/save-the-date"
                className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-2xl p-2.5 border border-white/20 flex flex-col justify-between transition group max-w-[170px]"
              >
                <div className="aspect-square w-full rounded-xl bg-neutral-900/50 overflow-hidden mb-2 relative">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute top-1 right-1 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                    -40%
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-amber-300">
                    {product.name}
                  </h4>
                  <div className="text-[11px] font-black text-amber-300 mt-0.5">
                    {formatCurrency(Math.round(product.price * 0.6))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

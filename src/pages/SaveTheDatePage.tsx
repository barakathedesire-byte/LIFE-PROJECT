import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Sparkles,
  Zap,
  Bell,
  CheckCircle2,
  Tag,
  ArrowRight,
  ShieldCheck,
  Flame,
  Percent,
} from 'lucide-react';
import { useCatalog } from '../hooks/useCatalog';
import { ProductCard } from '../components/common/ProductCard';
import { useNotification } from '../context/NotificationContext';

export const SaveTheDatePage: React.FC = () => {
  const { catalogProducts, catalogCategories, catalogBrands } = useCatalog();

  const { addToast } = useNotification();
  const [reminded, setReminded] = useState(false);
  const [emailOrPhone, setEmailOrPhone] = useState('');

  // Countdown to Save The Date: Set to 3 days, 14 hours, 28 minutes from now
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 14,
    minutes: 28,
    seconds: 45,
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
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSetReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) {
      addToast({
        type: 'info',
        title: 'Please enter details',
        message: 'Provide your phone number or email to receive SMS / WhatsApp alerts.',
      });
      return;
    }
    setReminded(true);
    addToast({
      type: 'success',
      title: 'Reminder Activated!',
      message: `You will receive a VIP reminder 1 hour before the LUMO Super Mega Discount Day unlocks!`,
    });
  };

  // Products featured for Save The Date Discount Gala
  const discountGalaProducts = catalogProducts.slice(0, 10);

  return (
    <div className="w-full space-y-6 pb-16">
      {/* 1. HERO EVENT BANNER */}
      <div className="w-full px-2 sm:px-4 lg:px-6 pt-3">
        <div className="w-full bg-gradient-to-br from-[#0B132B] via-[#0F172A] to-[#1E293B] text-white rounded-3xl p-6 sm:p-12 border border-neutral-800 shadow-2xl relative overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute -right-10 -top-10 w-96 h-96 bg-[#FF6A00]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 -bottom-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl space-y-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF6A00] text-white text-xs font-black uppercase tracking-wider shadow-lg">
                <Calendar size={14} />
                <span>Save The Date • Exclusive Event</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
                <Sparkles size={14} />
                <span>Up to 70% Off Across 10,000+ Items</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              LUMO Mega Discount Gala 2026
            </h1>

            <p className="text-sm sm:text-base text-neutral-300 max-w-2xl leading-relaxed">
              Tanzania’s biggest online price drop. Huge discounts on flagship smartphones, Hisense 4K TVs, Kitchen appliances, and Nike footwear with instant M-Pesa cashback and zero escrow fees.
            </p>

            {/* LIVE COUNTDOWN TIMER */}
            <div className="pt-2">
              <div className="text-xs font-bold text-amber-300 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Clock size={16} />
                <span>Event Countdown: Doors Open In</span>
              </div>
              <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-md">
                <div className="bg-[#0B132B]/90 border border-neutral-700/80 rounded-2xl p-3 text-center shadow-lg">
                  <div className="text-2xl sm:text-4xl font-black text-[#FF6A00] font-mono">
                    {String(timeLeft.days).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase mt-1">Days</div>
                </div>

                <div className="bg-[#0B132B]/90 border border-neutral-700/80 rounded-2xl p-3 text-center shadow-lg">
                  <div className="text-2xl sm:text-4xl font-black text-[#FF6A00] font-mono">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase mt-1">Hours</div>
                </div>

                <div className="bg-[#0B132B]/90 border border-neutral-700/80 rounded-2xl p-3 text-center shadow-lg">
                  <div className="text-2xl sm:text-4xl font-black text-[#FF6A00] font-mono">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase mt-1">Minutes</div>
                </div>

                <div className="bg-[#0B132B]/90 border border-neutral-700/80 rounded-2xl p-3 text-center shadow-lg">
                  <div className="text-2xl sm:text-4xl font-black text-amber-400 font-mono animate-pulse">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase mt-1">Seconds</div>
                </div>
              </div>
            </div>

            {/* REMINDER SUBSCRIPTION BOX */}
            <div className="pt-2">
              {!reminded ? (
                <form
                  onSubmit={handleSetReminder}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-xl bg-white/10 p-2 rounded-2xl border border-white/20 backdrop-blur-md"
                >
                  <input
                    type="text"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="Enter WhatsApp phone (e.g. 0712...) or Email"
                    className="flex-1 px-4 py-3 bg-transparent text-white placeholder-neutral-400 text-xs sm:text-sm focus:outline-hidden"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-extrabold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-lg active:scale-95"
                  >
                    <Bell size={16} />
                    <span>Get VIP Reminder</span>
                  </button>
                </form>
              ) : (
                <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs sm:text-sm font-bold">
                  <CheckCircle2 size={18} />
                  <span>VIP Reminder Activated! We will notify you when deals go live.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. EVENT ADVANTAGES */}
      <section className="w-full px-2 sm:px-4 lg:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs flex items-center gap-4">
            <div className="p-3.5 bg-orange-50 text-[#FF6A00] rounded-xl shrink-0">
              <Percent size={24} />
            </div>
            <div>
              <h4 className="text-sm font-black text-neutral-900">Up to 70% Markdowns</h4>
              <p className="text-xs text-neutral-500">Unbeatable prices on electronics, home, and fashion.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs flex items-center gap-4">
            <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl shrink-0">
              <Zap size={24} />
            </div>
            <div>
              <h4 className="text-sm font-black text-neutral-900">Early-Bird Access</h4>
              <p className="text-xs text-neutral-500">VIP reminders get access 30 minutes before public opening.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs flex items-center gap-4">
            <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="text-sm font-black text-neutral-900">100% Escrow Protected</h4>
              <p className="text-xs text-neutral-500">Sellers receive payout only when you inspect and confirm.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SNEAK PEEK PRODUCT CATALOG */}
      <section className="w-full px-2 sm:px-4 lg:px-6">
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
            <div>
              <div className="flex items-center gap-2">
                <Flame size={20} className="text-[#FF6A00]" />
                <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                  Sneak Peek: Confirmed Gala Deals
                </h2>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Add these products to your Wishlist now to check out instantly when the countdown hits zero.
              </p>
            </div>

            <span className="text-xs font-bold text-[#FF6A00] bg-orange-50 px-3 py-1.5 rounded-full border border-orange-200">
              {discountGalaProducts.length} Exclusive Gala Previews
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {discountGalaProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

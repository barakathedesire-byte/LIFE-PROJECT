import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Store, Users, Bike, MapPin, ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export const EcosystemServicesSection: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      checkScroll();
    }
    return () => el?.removeEventListener('scroll', checkScroll);
  }, []);

  const handleScroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = dir === 'left' ? -280 : 280;
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const cards = [
    {
      id: 'seller',
      title: 'Lumo Seller Hub',
      badge: 'VENDOR PLATFORM',
      badgeColor: 'bg-orange-500/20 text-[#FF6A00] border-orange-500/30',
      description: 'Sell to millions across East Africa. Escrow-guaranteed payouts.',
      actionText: 'Register as Seller',
      link: '/sell-on-lumo',
      icon: Store,
      iconBg: 'bg-gradient-to-br from-orange-500 to-amber-600 text-white',
      cardBg: 'bg-gradient-to-br from-orange-50/70 via-white to-amber-50/40 border-orange-200/70',
    },
    {
      id: 'lumoforce',
      title: 'LumoForce',
      badge: 'FIELD SALES NETWORK',
      badgeColor: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
      description: 'Earn uncapped weekly commissions onboarding local merchants.',
      actionText: 'Join LumoForce',
      link: '/become-lumoforce',
      icon: Users,
      iconBg: 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white',
      cardBg: 'bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/40 border-blue-200/70',
    },
    {
      id: 'rider',
      title: 'LumoRider',
      badge: 'LOGISTICS & COURIER',
      badgeColor: 'bg-amber-500/20 text-amber-700 border-amber-500/30',
      description: 'Deliver with flexible shifts, live GPS routing & instant daily cash.',
      actionText: 'Apply as Rider',
      link: '/become-rider',
      icon: Bike,
      iconBg: 'bg-gradient-to-br from-amber-600 to-yellow-600 text-white',
      cardBg: 'bg-gradient-to-br from-amber-50/70 via-white to-yellow-50/40 border-amber-200/70',
    },
    {
      id: 'pickup',
      title: 'Lumo Point',
      badge: 'PICKUP STATIONS',
      badgeColor: 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30',
      description: 'Monetize retail foot traffic and securely store neighborhood parcels.',
      actionText: 'Host a LumoPoint',
      link: '/become-pickup-point',
      icon: MapPin,
      iconBg: 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white',
      cardBg: 'bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 border-emerald-200/70',
    },
  ];

  return (
    <section className="w-full px-2 sm:px-4 lg:px-6 py-2">
      <div className="w-full bg-white rounded-3xl p-4 sm:p-6 border border-neutral-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FF6A00] text-white flex items-center justify-center font-bold shadow-xs">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-neutral-900 tracking-tight">
                LUMO Partner Ecosystem & Opportunities
              </h3>
              <p className="text-xs text-neutral-500">
                Grow your retail business, earn field commissions, or deliver parcels across Tanzania
              </p>
            </div>
          </div>

          {/* Navigation buttons for mobile/desktop slider */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition border ${
                canScrollLeft
                  ? 'bg-neutral-100 text-neutral-800 border-neutral-200 hover:bg-neutral-200 cursor-pointer'
                  : 'bg-neutral-50 text-neutral-300 border-neutral-100 cursor-not-allowed'
              }`}
              aria-label="Scroll Left"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition border ${
                canScrollRight
                  ? 'bg-neutral-100 text-neutral-800 border-neutral-200 hover:bg-neutral-200 cursor-pointer'
                  : 'bg-neutral-50 text-neutral-300 border-neutral-100 cursor-not-allowed'
              }`}
              aria-label="Scroll Right"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable on Mobile on one single row, 4 Columns on Desktop */}
        <div
          ref={scrollRef}
          className="flex flex-row overflow-x-auto no-scrollbar snap-x snap-mandatory gap-3 sm:gap-4 md:grid md:grid-cols-4 md:overflow-visible pb-2 pt-1 select-none"
        >
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className={`snap-start shrink-0 w-[240px] sm:w-[260px] md:w-auto rounded-2xl p-4 border ${card.cardBg} shadow-xs flex flex-col justify-between space-y-3 transition-all hover:shadow-md hover:-translate-y-0.5`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center shadow-xs`}>
                      <Icon size={20} />
                    </div>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border tracking-wider uppercase ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-black text-neutral-900 text-sm tracking-tight">{card.title}</h4>
                    <p className="text-[11px] text-neutral-600 line-clamp-2 leading-relaxed mt-0.5">
                      {card.description}
                    </p>
                  </div>
                </div>

                <Link
                  to={card.link}
                  className="w-full py-2 px-3 rounded-xl bg-neutral-900 hover:bg-[#FF6A00] text-white text-xs font-bold transition-colors flex items-center justify-between cursor-pointer group shadow-xs"
                >
                  <span>{card.actionText}</span>
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

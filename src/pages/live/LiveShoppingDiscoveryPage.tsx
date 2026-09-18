import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Radio,
  Users,
  Heart,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Tag,
  Store,
  Play,
  Flame,
  CheckCircle2,
  Calendar,
  Filter
} from 'lucide-react';
import { api } from '../../services/api';
import { formatCurrencyTZS } from '../../utils/formatters';
import { useSEO } from '../../hooks/useSEO';

interface LiveSessionCard {
  id: string;
  sellerId: string;
  storeName: string;
  storeLogo: string;
  title: string;
  category: string;
  viewerCount: number;
  likesCount: number;
  thumbnail: string;
  isLive: boolean;
  pinnedProduct?: {
    id: string;
    name: string;
    price: number;
    oldPrice?: number;
    image: string;
  };
  scheduledFor?: string;
}

export const LiveShoppingDiscoveryPage: React.FC = () => {
  useSEO({
    title: 'LUMO Live Shopping Tanzania - Watch Official Store Demos & Flash Deals',
    description: 'Watch live product demonstrations, ask hosts questions in real time, and grab exclusive live-only discounts with 100% escrow protection.'
  });

  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState<'live' | 'upcoming'>('live');
  const [liveSessions, setLiveSessions] = useState<LiveSessionCard[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    'All',
    'Phones & Tablets',
    'Electronics & Audio',
    'Fashion & Apparel',
    'Supermarket & Groceries',
    'Beauty & Skincare',
    'Home & Appliances'
  ];

  useEffect(() => {
    const fetchLiveStreams = async () => {
      try {
        setLoading(true);
        const res = await api.getActiveLiveSessions();
        if (res?.sessions && res.sessions.length > 0) {
          setLiveSessions(res.sessions);
        } else {
          // Default rich active live streams
          setLiveSessions([
            {
              id: 'live-samsung-tanzania',
              sellerId: 'sl-101',
              storeName: 'Samsung Official Store TZ',
              storeLogo: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=100',
              title: 'Galaxy S24 Ultra Unboxing & Nightography Camera Testing Live',
              category: 'Phones & Tablets',
              viewerCount: 428,
              likesCount: 3840,
              thumbnail: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800',
              isLive: true,
              pinnedProduct: {
                id: 'prod-s24-ultra',
                name: 'Samsung Galaxy S24 Ultra 512GB (Official Warranty)',
                price: 2850000,
                oldPrice: 3200000,
                image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400'
              }
            },
            {
              id: 'live-sony-karaoke',
              sellerId: 'sl-102',
              storeName: 'Sony Audio Tanzania',
              storeLogo: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=100',
              title: 'High-Power Party Audio Sound & Bass Booster Live Demo',
              category: 'Electronics & Audio',
              viewerCount: 280,
              likesCount: 1940,
              thumbnail: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800',
              isLive: true,
              pinnedProduct: {
                id: 'prod-sony-mhc',
                name: 'Sony MHC-V13 High Power Audio System',
                price: 680000,
                oldPrice: 790000,
                image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400'
              }
            },
            {
              id: 'live-kilombero-harvest',
              sellerId: 'sl-103',
              storeName: 'Kilombero Agro Millers',
              storeLogo: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100',
              title: 'Fresh Morogoro Grade-1 Super Aromatic Rice Unbagging',
              category: 'Supermarket & Groceries',
              viewerCount: 192,
              likesCount: 1420,
              thumbnail: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800',
              isLive: true,
              pinnedProduct: {
                id: 'prod-rice-25kg',
                name: 'Grade-1 Clean Kilombero Scented Rice (25kg Sack)',
                price: 68000,
                oldPrice: 79000,
                image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400'
              }
            },
            {
              id: 'live-zara-couture',
              sellerId: 'sl-104',
              storeName: 'LUMO Luxury Fashion Hub',
              storeLogo: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=100',
              title: 'Weekend African Print & Evening Dresses Runway Try-on',
              category: 'Fashion & Apparel',
              viewerCount: 310,
              likesCount: 2650,
              thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
              isLive: true,
              pinnedProduct: {
                id: 'prod-dress-kitenge',
                name: 'Designer Kitenge Maxi Dress (Tailored Silk Blend)',
                price: 120000,
                oldPrice: 155000,
                image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400'
              }
            }
          ]);
        }
      } catch (e) {
        console.error('Error fetching live streams:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveStreams();
  }, []);

  const filteredSessions = liveSessions.filter((s) => {
    if (selectedCategory === 'All') return true;
    return s.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  return (
    <div className="w-full space-y-6 pb-16 px-2 sm:px-4 lg:px-6 py-4">
      {/* HEADER HERO BANNER */}
      <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-r from-[#0B132B] via-purple-950 to-[#0B132B] text-white p-6 sm:p-10 border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-600/30 text-rose-400 border border-rose-500/40 text-xs font-bold animate-pulse">
            <Radio size={14} className="animate-spin" />
            <span>LUMO Live Commerce Hub</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Shop in Real Time with Verified Sellers & Official Stores
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Watch live unboxings, chat with store owners in Dar es Salaam, ask questions, and claim exclusive live flash coupons with 100% Escrow buyer protection.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-800/60">
              <ShieldCheck size={14} />
              <span>Escrow Safe Checkout</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 bg-amber-950/60 px-3 py-1.5 rounded-full border border-amber-800/60">
              <Flame size={14} />
              <span>Exclusive Live Stream Discounts</span>
            </div>
          </div>
        </div>

        {/* Subtle background art */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* CATEGORY FILTER PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition ${
              selectedCategory === cat
                ? 'bg-[#FF6A00] text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ACTIVE STREAMS GRID */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-rose-600 animate-pulse" />
            <h2 className="text-lg font-black text-slate-900">
              Broadcasting Live Now ({filteredSessions.length})
            </h2>
          </div>
        </div>

        {filteredSessions.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <Radio className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="font-bold text-base text-slate-700">No active live streams in this category</h3>
            <p className="text-xs text-slate-500">Check back shortly or select "All" to browse all active merchants.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => navigate(`/live/${session.id}`)}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
              >
                {/* VIDEO THUMBNAIL */}
                <div className="relative aspect-[4/5] bg-slate-900 overflow-hidden">
                  <img
                    src={session.thumbnail}
                    alt={session.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* TOP BADGES */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center gap-1.5 shadow-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      LIVE
                    </span>

                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold flex items-center gap-1 border border-white/20">
                      <Users size={12} className="text-amber-400" />
                      {session.viewerCount}
                    </span>
                  </div>

                  {/* PLAY HOVER OVERLAY */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                      <Play size={24} className="fill-white ml-1" />
                    </div>
                  </div>

                  {/* BOTTOM PINNED PRODUCT CARD OVERLAY */}
                  {session.pinnedProduct && (
                    <div className="absolute bottom-3 left-3 right-3 bg-slate-950/85 backdrop-blur-md rounded-2xl p-2.5 border border-white/10 flex items-center gap-2.5">
                      <img
                        src={session.pinnedProduct.image}
                        alt={session.pinnedProduct.name}
                        className="w-10 h-10 rounded-xl object-cover bg-white shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <Tag size={10} className="text-amber-400" />
                          <span className="text-[9px] font-black uppercase tracking-wider text-amber-400">Featured Item</span>
                        </div>
                        <p className="text-xs font-bold text-white truncate">
                          {session.pinnedProduct.name}
                        </p>
                        <p className="text-xs font-black text-rose-400">
                          {formatCurrencyTZS(session.pinnedProduct.price)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* STORE & TITLE DETAILS */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <img
                        src={session.storeLogo}
                        alt={session.storeName}
                        className="w-5 h-5 rounded-full object-cover border border-slate-200"
                      />
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {session.storeName}
                      </span>
                    </div>

                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-[#FF6A00] transition line-clamp-2 leading-snug">
                      {session.title}
                    </h3>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1 text-rose-500 font-bold">
                      <Heart size={13} className="fill-rose-500" />
                      {session.likesCount.toLocaleString()}
                    </span>

                    <span className="text-[#FF6A00] font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Watch Stream <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

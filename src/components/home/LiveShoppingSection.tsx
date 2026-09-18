import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Radio, Users, Heart, ArrowRight, Play, Sparkles, Tag, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import { formatCurrencyTZS } from '../../utils/formatters';

export const LiveShoppingSection: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<any[]>([
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
      pinnedProduct: {
        id: 'prod-rice-25kg',
        name: 'Grade-1 Clean Kilombero Scented Rice (25kg Sack)',
        price: 68000,
        oldPrice: 79000,
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400'
      }
    }
  ]);

  useEffect(() => {
    api.getActiveLiveSessions().then((res) => {
      if (res?.sessions && res.sessions.length > 0) {
        setSessions(res.sessions.slice(0, 4));
      }
    }).catch(() => {});
  }, []);

  return (
    <section className="w-full px-2 sm:px-4 lg:px-6 py-2">
      <div className="w-full bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-800 shadow-xl space-y-4">
        
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-rose-600 flex items-center justify-center shadow-md">
              <Radio className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  LUMO Live Shopping
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-black uppercase tracking-wider animate-pulse">
                  LIVE
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Watch real-time demonstrations from verified sellers & claim live deals
              </p>
            </div>
          </div>

          <Link
            to="/live"
            className="text-xs font-bold text-[#FF6A00] hover:text-orange-400 flex items-center gap-1 self-start sm:self-auto group"
          >
            <span>Explore All Live Streams</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* STREAMS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((stream) => (
            <div
              key={stream.id}
              onClick={() => navigate(`/live/${stream.id}`)}
              className="group bg-slate-950/70 rounded-2xl overflow-hidden border border-white/10 hover:border-rose-500/50 transition-all duration-300 cursor-pointer flex flex-col"
            >
              {/* VIDEO THUMBNAIL */}
              <div className="relative aspect-video bg-slate-900 overflow-hidden">
                <img
                  src={stream.thumbnail}
                  alt={stream.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-white animate-ping" />
                    LIVE
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[9px] font-semibold flex items-center gap-1 border border-white/10">
                    <Users size={10} className="text-amber-400" />
                    {stream.viewerCount}
                  </span>
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-11 h-11 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-lg">
                    <Play size={20} className="fill-white ml-0.5" />
                  </div>
                </div>

                {stream.pinnedProduct && (
                  <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-md rounded-xl p-1.5 flex items-center gap-2 border border-white/10">
                    <img
                      src={stream.pinnedProduct.image}
                      alt={stream.pinnedProduct.name}
                      className="w-7 h-7 rounded-lg object-cover bg-white shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold text-white truncate">
                        {stream.pinnedProduct.name}
                      </p>
                      <p className="text-[10px] font-black text-rose-400">
                        {formatCurrencyTZS(stream.pinnedProduct.price)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* INFO */}
              <div className="p-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{stream.title}</p>
                  <p className="text-[11px] text-slate-400 truncate">{stream.storeName}</p>
                </div>
                <span className="shrink-0 text-xs font-bold text-rose-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  Watch <ArrowRight size={12} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

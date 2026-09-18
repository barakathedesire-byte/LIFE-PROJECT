import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Heart,
  MessageSquare,
  Share2,
  Volume2,
  VolumeX,
  ShoppingBag,
  Users,
  Radio,
  Send,
  Plus,
  Check,
  ShieldCheck,
  Tag,
  Star,
  Zap,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useNotification } from '../../context/NotificationContext';
import { formatCurrencyTZS } from '../../utils/formatters';
import { Product } from '../../types';

interface LiveComment {
  id: string;
  userId: string;
  userName: string;
  message: string;
  createdAt: string;
  isHost?: boolean;
}

interface FloatingHeart {
  id: number;
  x: number;
  icon: string;
}

export const BuyerLiveStreamPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useNotification();

  // Stream details
  const [streamInfo, setStreamInfo] = useState<any>({
    id: sessionId || 'live-samsung-tanzania',
    sellerId: 'sl-101',
    storeName: 'Samsung Official Store TZ',
    storeLogo: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=100',
    title: 'Galaxy S24 Ultra Unboxing & Nightography Camera Testing Live',
    category: 'Phones & Tablets',
    viewerCount: 428,
    likesCount: 3840,
    videoUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=1200',
    isLive: true,
  });

  const [pinnedProduct, setPinnedProduct] = useState<Product | null>({
    id: 'prod-s24-ultra',
    name: 'Samsung Galaxy S24 Ultra 512GB (Official Local Warranty)',
    brand: 'Samsung',
    category: 'phones-tablets',
    subcategory: 'Smartphones',
    sellerId: 'sl-101',
    sellerName: 'Samsung Official Store TZ',
    sellerCity: 'Dar es Salaam',
    price: 2850000,
    oldPrice: 3200000,
    discountPercentage: 11,
    rating: 4.9,
    reviewCount: 142,
    stock: 14,
    thumbnail: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400',
    images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400'],
    description: 'Titanium Gray, 12GB RAM, 512GB Storage, 200MP Camera with Nightography.',
    condition: 'Brand New',
    warranty: '12 Months Official Samsung TZ Warranty',
    freeDeliveryEligible: true,
    badges: ['OFFICIAL STORE', 'FREE DELIVERY'],
    keyFeatures: ['Snapdragon 8 Gen 3', '200MP Camera', '5000mAh Battery', 'Titanium Frame'],
    specifications: [
      { label: 'Storage', value: '512GB' },
      { label: 'RAM', value: '12GB' },
      { label: 'Color', value: 'Titanium Gray' }
    ],
    variations: []
  });

  const [isMuted, setIsMuted] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [likesCount, setLikesCount] = useState(3840);
  const [viewersCount, setViewersCount] = useState(428);
  const [comments, setComments] = useState<LiveComment[]>([
    {
      id: 'c-1',
      userId: 'u-1',
      userName: 'Neema Joseph',
      message: 'Hello! Is this the official Tanzanian edition with warranty?',
      createdAt: '1m ago'
    },
    {
      id: 'c-2',
      userId: 'host',
      userName: 'Samsung Official (Host)',
      message: 'Yes Neema! Comes with 24 months local Samsung warranty & free screen repair!',
      createdAt: 'Just now',
      isHost: true
    },
    {
      id: 'c-3',
      userId: 'u-2',
      userName: 'Juma Kassim',
      message: 'Please test the 100x digital zoom on that tower outside!',
      createdAt: 'Just now'
    },
    {
      id: 'c-4',
      userId: 'u-3',
      userName: 'Baraka Ally',
      message: 'Just bought 1 unit via M-Pesa escrow! Can I get same day delivery in Masaki?',
      createdAt: 'Just now'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Load session from backend if available
  useEffect(() => {
    if (sessionId) {
      api.getLiveSessionDetails(sessionId).then((res) => {
        if (res?.session) {
          setStreamInfo(res.session);
          if (res.session.viewerCount) setViewersCount(res.session.viewerCount);
          if (res.session.likesCount) setLikesCount(res.session.likesCount);
          if (res.session.pinnedProduct) setPinnedProduct(res.session.pinnedProduct);
        }
      }).catch(() => {});
    }
  }, [sessionId]);

  // Periodic heartbeat & auto live simulation
  useEffect(() => {
    const timer = setInterval(() => {
      // Random heart reaction from other viewers
      if (Math.random() > 0.4) {
        spawnFloatingHeart();
        setLikesCount(prev => prev + 1);
      }
      if (Math.random() > 0.8) {
        setViewersCount(prev => Math.max(100, prev + Math.floor(Math.random() * 5) - 2));
      }
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const spawnFloatingHeart = () => {
    const id = Date.now() + Math.random();
    const x = Math.random() * 50 + 25; // 25% to 75%
    const icons = ['❤️', '🔥', '👏', '🎉', '💖', '⭐', '💯'];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];
    setFloatingHearts(prev => [...prev.slice(-15), { id, x, icon: randomIcon }]);
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => h.id !== id));
    }, 2000);
  };

  const handleHeartClick = () => {
    spawnFloatingHeart();
    setLikesCount(prev => prev + 1);
    if (sessionId) {
      api.reactToLive(sessionId, { type: 'heart' }).catch(() => {});
    }
  };

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    if (!isFollowing) {
      showToast(`Now following ${streamInfo.storeName}! You will be notified when they go live.`, 'success');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Live stream link copied to clipboard!', 'success');
    }
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    if (!isAuthenticated) {
      showToast('Please sign in to participate in the live chat.', 'info');
      navigate('/login');
      return;
    }

    const newComment: LiveComment = {
      id: `comm-${Date.now()}`,
      userId: user?.id || 'guest',
      userName: user?.name || 'LUMO Customer',
      message: chatInput.trim(),
      createdAt: 'Just now'
    };

    setComments(prev => [...prev, newComment]);
    const messageToSend = chatInput.trim();
    setChatInput('');

    if (sessionId) {
      api.commentOnLive(sessionId, {
        userId: user?.id || 'guest',
        userName: user?.name || 'Customer',
        message: messageToSend
      }).catch(() => {});
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (pinnedProduct) {
      addToCart(pinnedProduct, 1);
      showToast(`Added "${pinnedProduct.name}" to cart with Live Deal discount!`, 'success');
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (pinnedProduct) {
      addToCart(pinnedProduct, 1);
      navigate('/checkout');
    }
  };

  return (
    <div id="buyer-live-stream-screen" className="fixed inset-0 z-50 bg-black text-white flex flex-col overflow-hidden select-none">
      
      {/* 1. TOP OVERLAY BAR */}
      <div className="absolute top-0 left-0 right-0 z-30 p-3 sm:p-5 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-auto">
        
        {/* Left: Back button + Store Details + Follow */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => navigate('/live')}
            className="p-2 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 text-white transition cursor-pointer border border-white/10"
            aria-label="Back to Live Discovery"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md rounded-full p-1.5 pr-3 border border-white/10">
            <img
              src={streamInfo.storeLogo}
              alt={streamInfo.storeName}
              className="w-8 h-8 rounded-full object-cover border border-white/20"
            />
            <div className="min-w-0 pr-1">
              <p className="text-xs font-bold text-white truncate max-w-[120px] sm:max-w-[180px]">
                {streamInfo.storeName}
              </p>
              <p className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                <Star size={10} className="fill-amber-400" />
                Verified Official Store
              </p>
            </div>

            <button
              onClick={handleFollowToggle}
              className={`px-3 py-1 rounded-full text-[10px] font-extrabold cursor-pointer transition ${
                isFollowing
                  ? 'bg-slate-700 text-slate-200'
                  : 'bg-[#FF6A00] hover:bg-[#E55E00] text-white shadow-md'
              }`}
            >
              {isFollowing ? 'Following' : '+ Follow'}
            </button>
          </div>
        </div>

        {/* Right: Live Badge, Viewers Counter & Actions */}
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[11px] font-black flex items-center gap-1.5 shadow-md animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span>LIVE</span>
          </div>

          <div className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1 border border-white/10">
            <Users size={12} className="text-amber-400" />
            <span>{viewersCount}</span>
          </div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 text-white transition cursor-pointer border border-white/10"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 text-white transition cursor-pointer border border-white/10"
            title="Share Live Stream"
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>

      {/* 2. MAIN VIDEO DISPLAY BACKGROUND */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center bg-slate-950 overflow-hidden">
        <img
          src={streamInfo.videoUrl || 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=1200'}
          alt={streamInfo.title}
          className="w-full h-full object-cover"
        />

        {/* Dynamic Dark Gradient Overlays for Video Controls & Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 pointer-events-none" />

        {/* FLOATING HEARTS ANIMATION CANVAS */}
        <div className="absolute right-4 bottom-24 w-32 h-96 pointer-events-none overflow-hidden z-20">
          <AnimatePresence>
            {floatingHearts.map((h) => (
              <motion.div
                key={h.id}
                initial={{ opacity: 1, y: 150, scale: 0.8 }}
                animate={{ opacity: 0, y: -120, scale: 1.6 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.6, ease: 'easeOut' }}
                style={{ left: `${h.x}%` }}
                className="absolute bottom-4 text-3xl filter drop-shadow-lg select-none"
              >
                {h.icon}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* 3. LOWER INTERACTION OVERLAYS (PINNED PRODUCT & CHAT) */}
      <div className="absolute bottom-0 left-0 right-0 z-30 p-3 sm:p-5 flex flex-col sm:flex-row items-end justify-between gap-4 pointer-events-none">
        
        {/* LEFT COLUMN: PINNED PRODUCT CARD & CHAT STREAM */}
        <div className="w-full sm:max-w-md flex flex-col space-y-3 pointer-events-auto">
          
          {/* CHAT MESSAGES SCROLLER */}
          <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 no-scrollbar">
            {comments.map((c) => (
              <div
                key={c.id}
                className={`text-xs p-2 rounded-xl backdrop-blur-xs leading-snug animate-in fade-in ${
                  c.isHost
                    ? 'bg-gradient-to-r from-amber-500/30 to-orange-500/30 border border-amber-400/40 text-white'
                    : 'bg-black/50 text-slate-100'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`font-bold ${c.isHost ? 'text-amber-400' : 'text-slate-300'}`}>
                    {c.userName}
                  </span>
                  {c.isHost && (
                    <span className="bg-amber-500 text-black text-[9px] font-black px-1 rounded">HOST</span>
                  )}
                  <span className="text-[9px] text-slate-400 ml-auto">{c.createdAt}</span>
                </div>
                <p className="text-[11px] font-medium leading-tight">{c.message}</p>
              </div>
            ))}
            <div ref={commentsEndRef} />
          </div>

          {/* PINNED PRODUCT CARD (PROMINENT TIKTOK/SHOPEE STYLE) */}
          {pinnedProduct && (
            <div className="bg-slate-950/95 backdrop-blur-xl border border-amber-500/40 rounded-2xl p-3 shadow-2xl space-y-2 animate-in slide-in-from-bottom-2">
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-xl bg-white overflow-hidden shrink-0 border border-slate-700">
                  <img
                    src={pinnedProduct.thumbnail || pinnedProduct.images?.[0]}
                    alt={pinnedProduct.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-0 left-0 bg-[#FF6A00] text-white text-[8px] font-black px-1 rounded-br">
                    LIVE DEAL
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                    <ShieldCheck size={12} />
                    <span>LUMO Escrow Safe</span>
                  </div>
                  <h4 className="text-xs font-bold text-white truncate">{pinnedProduct.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm font-black text-amber-400">
                      {formatCurrencyTZS(pinnedProduct.price)}
                    </span>
                    {pinnedProduct.oldPrice && (
                      <span className="text-xs text-slate-400 line-through">
                        {formatCurrencyTZS(pinnedProduct.oldPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag size={13} />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="flex-1 py-2 px-3 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Zap size={13} className="fill-white" />
                  <span>Buy Now</span>
                </button>
              </div>
            </div>
          )}

          {/* CHAT INPUT BAR */}
          <form onSubmit={handleSendComment} className="relative flex items-center pointer-events-auto">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask host a question or chat live..."
              className="w-full pl-4 pr-11 py-2.5 bg-black/60 backdrop-blur-md border border-white/20 rounded-2xl text-xs text-white placeholder-slate-400 outline-none focus:border-[#FF6A00]"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="absolute right-1.5 p-2 bg-[#FF6A00] hover:bg-[#E55E00] text-white rounded-xl disabled:opacity-40 transition cursor-pointer"
            >
              <Send size={14} />
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: HEART REACTION BUTTON */}
        <div className="flex flex-col items-center gap-3 pointer-events-auto shrink-0 pb-2">
          <button
            onClick={handleHeartClick}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-rose-600 to-orange-500 text-white flex flex-col items-center justify-center shadow-2xl hover:scale-110 active:scale-90 transition cursor-pointer border-2 border-white/30"
            aria-label="Send Heart Reaction"
          >
            <Heart size={24} className="fill-white" />
            <span className="text-[10px] font-black">{likesCount.toLocaleString()}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

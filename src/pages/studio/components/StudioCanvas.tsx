import React, { useState, useEffect, useRef } from 'react';
import { 
  StudioViewport, 
  StudioCanvasMode, 
  StudioPage, 
  StudioComponentItem, 
  DesignSystemTokens 
} from '../../../types/studio';
import { 
  ArrowUp, 
  ArrowDown, 
  Copy, 
  Trash2, 
  Plus, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Headphones, 
  Star, 
  ShoppingCart, 
  Heart, 
  CheckCircle2, 
  Search, 
  ChevronRight, 
  Flame, 
  Store, 
  Box, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  Play,
  Edit3,
  RotateCw,
  ExternalLink,
  Lock,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Smartphone,
  Tablet,
  Monitor,
  Sparkles,
  Layers,
  Sliders,
  DollarSign
} from 'lucide-react';
import { api } from '../../../services/api';
import { Product } from '../../../types';

interface StudioCanvasProps {
  page: StudioPage;
  viewport: StudioViewport;
  canvasMode: StudioCanvasMode;
  onCanvasModeChange?: (mode: StudioCanvasMode) => void;
  zoom: number;
  selectedComponentId: string | null;
  onSelectComponent: (componentId: string) => void;
  onMoveComponent: (componentId: string, direction: 'up' | 'down') => void;
  onDuplicateComponent: (component: StudioComponentItem) => void;
  onDeleteComponent: (componentId: string) => void;
  onAddPlaceholderComponent: (sectionId: string) => void;
  designTokens: DesignSystemTokens;
  activeSimulatedRole: string;
  onSelectPage?: (pageId: string) => void;
}

export const StudioCanvas: React.FC<StudioCanvasProps> = ({
  page,
  viewport,
  canvasMode,
  onCanvasModeChange,
  zoom,
  selectedComponentId,
  onSelectComponent,
  onMoveComponent,
  onDuplicateComponent,
  onDeleteComponent,
  onAddPlaceholderComponent,
  designTokens,
  activeSimulatedRole,
  onSelectPage
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [realProducts, setRealProducts] = useState<Product[]>([]);
  const [realCategories, setRealCategories] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [currentIframeRoute, setCurrentIframeRoute] = useState<string>(page.route || '/');
  const [isIframeLoaded, setIsIframeLoaded] = useState<boolean>(false);

  // Sync route when page changes
  useEffect(() => {
    setCurrentIframeRoute(page.route || '/');
    setIsIframeLoaded(false);
  }, [page.route, page.id]);

  // Fetch real database products and categories for Design Mode live binding
  useEffect(() => {
    let isMounted = true;
    async function loadCatalog() {
      setIsLoadingData(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          api.getProducts({ limit: 12 }).catch(() => ({ products: [] })),
          api.getCategories().catch(() => ({ categories: [] }))
        ]);
        if (isMounted) {
          if (prodRes && prodRes.products && prodRes.products.length > 0) {
            setRealProducts(prodRes.products);
          }
          if (catRes && catRes.categories && catRes.categories.length > 0) {
            setRealCategories(catRes.categories);
          }
        }
      } catch (err) {
        console.warn('Studio canvas data sync fallback:', err);
      } finally {
        if (isMounted) setIsLoadingData(false);
      }
    }
    loadCatalog();
    return () => { isMounted = false; };
  }, []);

  const handleReloadIframe = () => {
    setIsIframeLoaded(false);
    setIframeKey(prev => prev + 1);
  };

  const handleOpenExternal = () => {
    const targetUrl = window.location.origin + currentIframeRoute;
    window.open(targetUrl, '_blank');
  };

  // Quick platform jump routes
  const quickNavRoutes = [
    { label: 'Storefront', route: '/', mode: 'CUSTOMER' },
    { label: 'Marketplace', route: '/marketplace', mode: 'CUSTOMER' },
    { label: 'Seller Center', route: '/seller', mode: 'SELLER' },
    { label: 'Rider Move', route: '/rider', mode: 'RIDER' },
    { label: 'Warehouse Hub', route: '/warehouse', mode: 'WAREHOUSE' },
    { label: 'Finance Ledger', route: '/finance', mode: 'FINANCE' },
    { label: 'Platform Admin', route: '/admin', mode: 'ADMIN' },
  ];

  // Render individual component preview in Design Mode
  const renderComponentContent = (component: StudioComponentItem) => {
    const { type, props, styles } = component;

    switch (type) {
      case 'hero_banner':
        return (
          <div 
            className="relative overflow-hidden rounded-2xl p-6 sm:p-10 text-white flex flex-col justify-center min-h-[280px] shadow-sm transition-all"
            style={{ 
              backgroundColor: styles.backgroundColor || '#0F172A',
              backgroundImage: props.imageUrl ? `linear-gradient(to right, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.45)), url(${props.imageUrl})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {props.badge && (
              <span className="self-start px-2.5 py-1 rounded-full bg-[#FF6A00] text-white font-extrabold text-[10px] tracking-wider mb-3 uppercase shadow-xs">
                {props.badge}
              </span>
            )}
            <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight max-w-xl text-white leading-tight">
              {props.headline || 'Discover Genuine Quality at Wholesaler Prices'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-lg leading-relaxed">
              {props.subheadline || 'Direct from Kariakoo, Posta & Nairobi central hubs with express same-day courier dispatch.'}
            </p>
            <div className="mt-5 flex items-center gap-3">
              <button 
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg transition cursor-pointer hover:scale-105"
                style={{ backgroundColor: designTokens.brandPrimary || '#FF6A00' }}
              >
                {props.ctaText || 'Shop Kariakoo Deals'}
              </button>
            </div>
          </div>
        );

      case 'product_carousel':
      case 'product_grid':
        const displayProducts = realProducts.length > 0 ? realProducts.slice(0, props.itemLimit || 4) : [
          {
            id: 'prod-fallback-1',
            name: 'Samsung Galaxy A54 5G - 256GB / 8GB RAM',
            price: 849000,
            originalPrice: 990000,
            rating: 4.8,
            reviewsCount: 142,
            seller: { businessName: 'Samsung Authorized TZ' },
            images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500']
          },
          {
            id: 'prod-fallback-2',
            name: 'Sony WH-1000XM5 Wireless Headphones',
            price: 780000,
            originalPrice: 890000,
            rating: 4.9,
            reviewsCount: 88,
            seller: { businessName: 'Kariakoo Electronics Hub' },
            images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500']
          },
          {
            id: 'prod-fallback-3',
            name: 'HP Victus 15 Gaming Laptop Intel Core i7',
            price: 2450000,
            originalPrice: 2800000,
            rating: 4.7,
            reviewsCount: 39,
            seller: { businessName: 'Posta Computers & IT' },
            images: ['https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500']
          },
          {
            id: 'prod-fallback-4',
            name: 'Nike Air Max 270 Athletic Sneakers',
            price: 260000,
            originalPrice: 320000,
            rating: 4.6,
            reviewsCount: 64,
            seller: { businessName: 'Kariakoo Fashion Direct' },
            images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500']
          }
        ];

        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                    {props.title || '⚡ Super Flash Deals — Kariakoo Live'}
                  </h3>
                  {props.badgeText && (
                    <span className="bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Flame size={12} /> {props.badgeText}
                    </span>
                  )}
                </div>
                {props.subtitle && (
                  <p className="text-xs text-slate-500 mt-0.5">{props.subtitle}</p>
                )}
              </div>
              <span className="text-xs font-bold text-orange-600 flex items-center gap-1">
                Live Catalog ({displayProducts.length})
              </span>
            </div>

            <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4`}>
              {displayProducts.map((prod: any) => (
                <div 
                  key={prod.id}
                  className="bg-white rounded-xl border border-slate-200 hover:border-orange-300 hover:shadow-md transition overflow-hidden group flex flex-col"
                >
                  <div className="h-36 sm:h-44 bg-slate-100 relative overflow-hidden">
                    <img 
                      src={prod.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'} 
                      alt={prod.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded">
                      VERIFIED ESCROW
                    </span>
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold truncate">
                        {prod.seller?.businessName || 'Verified Lumo Merchant'}
                      </p>
                      <h4 className="font-bold text-xs text-slate-900 line-clamp-2 mt-0.5 group-hover:text-orange-600 transition">
                        {prod.name}
                      </h4>
                      <div className="flex items-center gap-1 mt-1 text-[11px] text-amber-500 font-semibold">
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        <span>{prod.rating || 4.8}</span>
                        <span className="text-slate-400 text-[10px]">({prod.reviewsCount || 42})</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs sm:text-sm font-extrabold text-slate-900 block">
                          {(prod.price || 0).toLocaleString()} TZS
                        </span>
                        {prod.originalPrice && (
                          <span className="text-[10px] text-slate-400 line-through">
                            {prod.originalPrice.toLocaleString()} TZS
                          </span>
                        )}
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF6A00] flex items-center justify-center">
                        <ShoppingCart size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'escrow_trust_badge':
        return (
          <div className="bg-emerald-50/90 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-emerald-950">
                {props.heading || '100% Protected by Bank of Tanzania Trustee Escrow'}
              </h4>
              <p className="text-xs text-emerald-800/80 mt-1 leading-relaxed">
                {props.body || 'Buyer payments remain safely segregated in bank-regulated escrow. Sellers only receive release approval once the courier confirms physical recipient OTP verification.'}
              </p>
            </div>
          </div>
        );

      case 'trust_metrics':
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: ShieldCheck, title: 'Escrow Protection', desc: 'Money held until received' },
              { icon: Truck, title: 'Fast Door Delivery', desc: 'Same-day in Dar & Arusha' },
              { icon: RotateCcw, title: '7-Day Easy Returns', desc: 'No-hassle refund guarantee' },
              { icon: Headphones, title: 'Local 24/7 Support', desc: 'Swahili & English team' }
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                <div className="w-9 h-9 rounded-lg bg-orange-50 text-[#FF6A00] flex items-center justify-center shrink-0">
                  <f.icon size={18} />
                </div>
                <div className="min-w-0">
                  <h5 className="font-bold text-xs text-slate-800 truncate">{f.title}</h5>
                  <p className="text-[10px] text-slate-500 truncate">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        );

      case 'kpi_stat_card':
        return (
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{props.title || 'Total Volume'}</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{props.change || '+18.4%'}</span>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">{props.value || '128,450,000 TZS'}</div>
            <p className="text-[11px] text-slate-400 mt-1">{props.timeframe || 'Authoritative backend financial ledger'}</p>
          </div>
        );

      default:
        return (
          <div className="p-5 bg-white border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2 text-slate-700">
              <Layers size={16} className="text-[#FF6A00]" />
              <span className="font-bold text-xs">{component.name}</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono uppercase">{component.type}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Configurable platform block mapped to live route {page.route}</p>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 bg-slate-950 overflow-hidden flex flex-col relative select-none">
      {/* Dynamic Studio Control Bar */}
      <div className="h-11 bg-slate-900 border-b border-slate-800 px-3 md:px-4 flex items-center justify-between text-xs text-slate-300 z-20 shrink-0">
        {/* Left: Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => onCanvasModeChange && onCanvasModeChange('preview')}
              className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                canvasMode === 'preview'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Play size={12} className={canvasMode === 'preview' ? 'animate-pulse' : ''} />
              <span>⚡ Live Platform Preview</span>
            </button>
            <button
              onClick={() => onCanvasModeChange && onCanvasModeChange('design')}
              className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                canvasMode === 'design'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Edit3 size={12} />
              <span>🎨 Component Inspector</span>
            </button>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          {/* Mode Badge */}
          <span className="hidden lg:inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px] font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Mode: {page.mode}</span>
          </span>
        </div>

        {/* Center: Live Route Navigation */}
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 max-w-[280px] sm:max-w-md">
            <Lock size={11} className="text-emerald-400 mr-1.5 shrink-0" />
            <span className="text-slate-500 font-mono text-[11px]">https://lumo.africa</span>
            <span className="text-white font-mono font-bold text-[11px] ml-0.5 truncate">{currentIframeRoute}</span>
          </div>

          <button
            onClick={handleReloadIframe}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            title="Reload Platform Preview"
          >
            <RotateCw size={13} />
          </button>

          <button
            onClick={handleOpenExternal}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer flex items-center gap-1"
            title="Open in Full Browser Tab"
          >
            <ExternalLink size={13} />
          </button>
        </div>

        {/* Right: Quick Jump Menu */}
        <div className="hidden xl:flex items-center gap-1">
          <span className="text-[10px] text-slate-500 font-semibold uppercase mr-1">Quick Jump:</span>
          {quickNavRoutes.slice(0, 4).map((nav) => (
            <button
              key={nav.route}
              onClick={() => {
                setCurrentIframeRoute(nav.route);
                if (onSelectPage) {
                  const targetPage = page.route === nav.route ? page : undefined;
                  // If we have a page matching the route, we can select it
                }
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                currentIframeRoute === nav.route
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {nav.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Canvas Scroll Area */}
      <div className="flex-1 overflow-auto p-4 md:p-6 flex flex-col items-center justify-start bg-radial from-slate-900 to-slate-950">
        {/* =========================================================================
            MODE 1: INTERACTIVE LIVE PLATFORM PREVIEW (ACTUAL LUMO APP RUNNING)
           ========================================================================= */}
        {canvasMode === 'preview' && (
          <div 
            className="transition-all duration-300 ease-out flex flex-col items-center w-full"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          >
            {/* Viewport Frame Container */}
            {viewport === 'mobile' && (
              <div className="w-[390px] h-[844px] rounded-[52px] border-[12px] border-slate-900 bg-slate-950 shadow-2xl relative overflow-hidden flex flex-col ring-1 ring-slate-800">
                {/* Mobile Top Status Bar & Dynamic Island */}
                <div className="h-11 bg-slate-950 text-white flex items-center justify-between px-6 pt-1 shrink-0 z-30 select-none">
                  <span className="text-xs font-bold font-mono">9:41</span>
                  <div className="w-24 h-4 bg-black rounded-full mx-auto" />
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300">
                    <span>5G</span>
                    <div className="w-4 h-2 rounded-xs border border-white p-0.5">
                      <div className="w-full h-full bg-white rounded-2xs" />
                    </div>
                  </div>
                </div>

                {/* Live Platform Iframe */}
                <div className="flex-1 w-full relative bg-white overflow-hidden">
                  <iframe
                    key={iframeKey}
                    ref={iframeRef}
                    src={currentIframeRoute}
                    title="LUMO Live Platform Mobile"
                    className="w-full h-full border-0 bg-white"
                    onLoad={() => setIsIframeLoaded(true)}
                  />
                </div>

                {/* Mobile Bottom Bar / Home Indicator */}
                <div className="h-5 bg-slate-950 flex items-center justify-center shrink-0">
                  <div className="w-32 h-1 bg-slate-600 rounded-full" />
                </div>
              </div>
            )}

            {viewport === 'tablet' && (
              <div className="w-[768px] h-[920px] rounded-[36px] border-[10px] border-slate-900 bg-slate-950 shadow-2xl relative overflow-hidden flex flex-col ring-1 ring-slate-800">
                {/* Tablet Top Camera Bezel */}
                <div className="h-6 bg-slate-950 flex items-center justify-center shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700" />
                </div>

                {/* Live Platform Iframe */}
                <div className="flex-1 w-full relative bg-white overflow-hidden">
                  <iframe
                    key={iframeKey}
                    ref={iframeRef}
                    src={currentIframeRoute}
                    title="LUMO Live Platform Tablet"
                    className="w-full h-full border-0 bg-white"
                    onLoad={() => setIsIframeLoaded(true)}
                  />
                </div>

                {/* Tablet Bottom Bezel */}
                <div className="h-4 bg-slate-950 shrink-0" />
              </div>
            )}

            {viewport === 'desktop' && (
              <div className="w-full max-w-[1380px] h-[82vh] rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden flex flex-col ring-1 ring-slate-800/60">
                {/* Desktop Window Titlebar & Controls */}
                <div className="h-10 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 shrink-0 select-none">
                  {/* Window Action Dots */}
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-500 transition" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 transition" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 transition" />
                  </div>

                  {/* Browser URL Input inside Desktop Preview */}
                  <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1 text-xs text-slate-300 w-[420px] max-w-full justify-between">
                    <div className="flex items-center gap-1.5 truncate">
                      <Lock size={12} className="text-emerald-400 shrink-0" />
                      <span className="text-slate-400 font-mono text-[11px]">https://lumo.africa</span>
                      <input 
                        type="text"
                        value={currentIframeRoute}
                        onChange={(e) => setCurrentIframeRoute(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleReloadIframe();
                        }}
                        className="bg-transparent text-white font-mono text-[11px] font-bold outline-none border-none p-0 focus:ring-0 w-36 truncate"
                        title="Edit route and press Enter"
                      />
                    </div>
                    <button
                      onClick={handleReloadIframe}
                      className="text-slate-400 hover:text-white transition"
                      title="Reload route"
                    >
                      <RotateCw size={11} />
                    </button>
                  </div>

                  {/* Right Window Status Indicator */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-emerald-950 border border-emerald-800/80 text-emerald-400 px-2 py-0.5 rounded font-bold">
                      LIVE PLATFORM
                    </span>
                    <button
                      onClick={handleOpenExternal}
                      className="text-slate-400 hover:text-white transition p-1"
                      title="Open full page in external window"
                    >
                      <ExternalLink size={13} />
                    </button>
                  </div>
                </div>

                {/* Live Platform Iframe */}
                <div className="flex-1 w-full relative bg-white overflow-hidden">
                  <iframe
                    key={iframeKey}
                    ref={iframeRef}
                    src={currentIframeRoute}
                    title="LUMO Live Platform Desktop"
                    className="w-full h-full border-0 bg-white"
                    onLoad={() => setIsIframeLoaded(true)}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            MODE 2: VISUAL COMPONENT INSPECTOR & BUILDER CANVAS
           ========================================================================= */}
        {canvasMode === 'design' && (
          <div 
            className="transition-all duration-300 ease-out flex flex-col items-center w-full"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          >
            {/* Design Mode Helper Banner */}
            <div className="w-full max-w-[1200px] mb-4 bg-blue-950/40 border border-blue-900/60 rounded-xl p-3 flex items-center justify-between text-xs text-blue-200">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-blue-400" />
                <span>
                  <strong>Visual Component Inspector:</strong> Click any section to configure its properties, headlines, badges, or layout in the Right Inspector.
                </span>
              </div>
              <button
                onClick={() => onCanvasModeChange && onCanvasModeChange('preview')}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition flex items-center gap-1 text-[11px]"
              >
                <Play size={11} /> Run Live Preview
              </button>
            </div>

            {/* Visual Canvas Container */}
            <div className={`bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-300 ${
              viewport === 'mobile' ? 'w-[390px] min-w-[390px]' : viewport === 'tablet' ? 'w-[768px] min-w-[768px]' : 'w-full max-w-[1200px]'
            }`}>
              {/* Fake Chrome Bar in Design Mode */}
              <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  </div>
                  <span className="font-mono text-[11px] text-slate-500">Route: {page.route}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    {page.name}
                  </span>
                </div>
              </div>

              {/* Sections Container */}
              <div className="p-4 sm:p-6 space-y-6">
                {page.sections.map((section, sIdx) => (
                  <div 
                    key={section.id} 
                    className="border border-dashed border-slate-200 hover:border-blue-300 rounded-2xl p-3 sm:p-4 transition space-y-3 bg-slate-50/40"
                  >
                    <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                      <span>Section {sIdx + 1}: {section.name}</span>
                      <button 
                        onClick={() => onAddPlaceholderComponent(section.id)}
                        className="text-orange-600 hover:text-orange-700 flex items-center gap-1 font-semibold normal-case cursor-pointer"
                      >
                        <Plus size={12} /> Add Component
                      </button>
                    </div>

                    <div className="space-y-4">
                      {section.components.map((component) => {
                        const isSelected = selectedComponentId === component.id;

                        return (
                          <div
                            key={component.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectComponent(component.id);
                            }}
                            className={`relative transition-all ${
                              isSelected
                                ? 'ring-2 ring-blue-600 ring-offset-2 rounded-2xl'
                                : 'hover:ring-1 hover:ring-orange-400 rounded-2xl cursor-pointer'
                            }`}
                          >
                            {/* Floating Actions on Selected Element */}
                            {isSelected && (
                              <div className="absolute -top-7 right-2 z-30 bg-blue-600 text-white text-xs rounded-lg px-2.5 py-1 flex items-center gap-2 shadow-lg">
                                <span className="font-bold text-[10px] uppercase tracking-wide">{component.name}</span>
                                <div className="h-3 w-px bg-blue-400" />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onMoveComponent(component.id, 'up');
                                  }}
                                  title="Move Up"
                                  className="hover:bg-blue-700 p-0.5 rounded cursor-pointer"
                                >
                                  <ArrowUp size={12} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onMoveComponent(component.id, 'down');
                                  }}
                                  title="Move Down"
                                  className="hover:bg-blue-700 p-0.5 rounded cursor-pointer"
                                >
                                  <ArrowDown size={12} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDuplicateComponent(component);
                                  }}
                                  title="Duplicate"
                                  className="hover:bg-blue-700 p-0.5 rounded cursor-pointer"
                                >
                                  <Copy size={12} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteComponent(component.id);
                                  }}
                                  title="Delete"
                                  className="hover:bg-red-600 p-0.5 rounded cursor-pointer"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            )}

                            {/* Rendered Component Content with Real Data */}
                            {renderComponentContent(component)}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

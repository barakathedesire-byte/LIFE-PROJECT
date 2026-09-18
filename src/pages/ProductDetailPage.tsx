import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Heart,
  ShoppingBag,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Store,
  MessageSquare,
  Star,
  ChevronRight,
  Home,
  Check,
  CheckCircle2,
  AlertCircle,
  Share2,
  Clock,
  Phone,
  HelpCircle,
  Award,
  ExternalLink,
  ThumbsUp,
  Flag,
  X,
  Bell
} from 'lucide-react';
import { useCatalog } from '../hooks/useCatalog';
import { formatCurrency } from '../utils/formatters';
import { RatingStars } from '../components/common/RatingStars';
import { EscrowBadge } from '../components/common/EscrowBadge';
import { ProductCard } from '../components/common/ProductCard';
import { HorizontalProductCarousel } from '../components/common/HorizontalProductCarousel';
import { BackButton } from '../components/common/BackButton';
import { PickupStationsModal } from '../components/common/PickupStationsModal';
import { VerifiedMerchantBadge } from '../components/common/VerifiedMerchantBadge';
import { LumoStarIcon } from '../components/common/LumoStarIcon';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useChat } from '../context/ChatContext';
import { useNotification } from '../context/NotificationContext';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import { useSEO } from '../hooks/useSEO';

export const ProductDetailPage: React.FC = () => {
  const { catalogProducts, catalogCategories, catalogBrands } = useCatalog();

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { openChatWithSeller } = useChat();
  const { showToast } = useNotification();
  const { addRecentlyViewed } = useRecentlyViewed();

  // Find product by id from backend or catalogProducts
  const [product, setProduct] = useState<any>(() => {
    return catalogProducts.find((p) => p.id === id) ;
  });

  useEffect(() => {
    if (id) {
      fetch(`/api/products/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.product) {
            setProduct(data.product);
            if (data.product.images && data.product.images.length > 0) {
              setSelectedImage(data.product.images[0]);
            } else if (data.product.thumbnail) {
              setSelectedImage(data.product.thumbnail);
            }
          }
        })
        .catch(() => {
          const found = catalogProducts.find((p) => p.id === id) ;
          setProduct(found);
        });
    }
  }, [id]);

  // Track product in recently viewed and update SEO meta tags
  useEffect(() => {
    if (product) {
      addRecentlyViewed(product);
    }
  }, [product]);

  useSEO({
    title: product ? `${product.name} - ${formatCurrency(product.price)}` : 'Product Details',
    description: product?.description || `Buy online on LUMO Tanzania with M-Pesa escrow protection and express delivery.`,
    ogImage: product?.image,
    keywords: `${product?.name || ''}, ${product?.brand || ''}, ${product?.category || ''}, buy online Tanzania`
  });

  const [selectedImage, setSelectedImage] = useState<string>(product.images[0] || product.thumbnail);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'desc' | 'reviews' | 'escrow'>('specs');
  const [deliveryRegion, setDeliveryRegion] = useState('Dar es Salaam Region');
  const [deliveryDistrict, setDeliveryDistrict] = useState('Kinondoni District');
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'doorstep'>('pickup');
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
  const [selectedPickupStation, setSelectedPickupStation] = useState('Soko Posta Hub');
  const [isFollowingSeller, setIsFollowingSeller] = useState(false);
  const [sellerFollowers, setSellerFollowers] = useState(42);

  // Modals state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Incorrect price or specs');
  const [reportDetails, setReportDetails] = useState('');
  
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');

  const [showReturnModal, setShowReturnModal] = useState(false);
  
  const [showPriceDropModal, setShowPriceDropModal] = useState(false);
  const [priceThreshold, setPriceThreshold] = useState('');

  // Selected Variations
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (product.variations) {
      product.variations.forEach((v) => {
        const firstAvailable = v.options.find((o) => o.inStock) || v.options[0];
        if (firstAvailable) {
          initial[v.title] = firstAvailable.name;
        }
      });
    }
    return initial;
  });

  // Calculate dynamic price based on variations
  const currentPrice = useMemo(() => {
    let price = product.price;
    if (product.variations) {
      product.variations.forEach((v) => {
        const selectedOptionName = selectedVariations[v.title];
        const option = v.options.find((o) => o.name === selectedOptionName);
        if (option && option.priceAdjustment) {
          price += option.priceAdjustment;
        }
      });
    }
    return price;
  }, [product, selectedVariations]);

  const isSaved = isInWishlist(product.id);

  // Related products & seller products
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return catalogProducts
      .filter((p) => p && p?.category && p?.category === product?.category && p.id !== product.id)
      .slice(0, 6);
  }, [product]);

  const sellerProducts = useMemo(() => {
    if (!product) return [];
    return catalogProducts
      .filter((p) => p && p.sellerName && p.sellerName === product.sellerName && p.id !== product.id)
      .slice(0, 6);
  }, [product]);

  const handleVariationSelect = (variationTitle: string, optionName: string) => {
    setSelectedVariations((prev) => ({
      ...prev,
      [variationTitle]: optionName,
    }));
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariations);
    showToast(`Added ${quantity}x ${product.name} to cart with Escrow protection!`, 'success');
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedVariations);
    navigate('/checkout');
  };

  const handleShare = (platform?: string) => {
    if (platform) {
      showToast(`Sharing product link on ${platform}!`, 'success');
    } else {
      navigator.clipboard?.writeText(window.location.href);
      showToast('Product link copied to clipboard!', 'info');
    }
  };

  const handleToggleFollow = () => {
    if (isFollowingSeller) {
      setIsFollowingSeller(false);
      setSellerFollowers((prev) => Math.max(0, prev - 1));
      showToast(`Unfollowed ${product.sellerName}`, 'info');
    } else {
      setIsFollowingSeller(true);
      setSellerFollowers((prev) => prev + 1);
      showToast(`You are now following ${product.sellerName}! You will receive exclusive flash discounts.`, 'success');
    }
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    setShowReportModal(false);
    showToast('Product report submitted successfully to LUMO Quality Assurance team.', 'success');
  };

  const handleSetPriceDrop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!priceThreshold || isNaN(Number(priceThreshold))) {
      showToast('Please enter a valid amount', 'error');
      return;
    }
    setShowPriceDropModal(false);
    showToast(`You will be notified when price drops below ${formatCurrency(Number(priceThreshold))}`, 'success');
    setPriceThreshold('');
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setShowReviewModal(false);
    showToast('Review submitted successfully! Pending verification.', 'success');
  };

  // Delivery estimates based on region
  const deliveryEstimate = useMemo(() => {
    if (deliveryRegion.includes('Dar es Salaam')) {
      return {
        doorstep: 'Same Day Delivery / Within 4-6 Hours',
        doorstepFee: product.freeDeliveryEligible ? 0 : 4500,
        doorstepDate: 'Tomorrow 28 Aug',
        pickup: 'Ready within 2 Hours at Soko Posta & Mlimani Hubs',
        pickupFee: 0,
        pickupDate: 'Today 27 Aug',
      };
    } else if (deliveryRegion.includes('Arusha') || deliveryRegion.includes('Mwanza')) {
      return {
        doorstep: '1-2 Business Days Express Transit',
        doorstepFee: 9000,
        doorstepDate: '29 - 30 Aug',
        pickup: '1 Business Day at Regional Station',
        pickupFee: 4500,
        pickupDate: '29 Aug',
      };
    } else {
      return {
        doorstep: '2-3 Business Days Standard Delivery',
        doorstepFee: 12500,
        doorstepDate: '30 - 31 Aug',
        pickup: '2 Business Days at Designated Pickup Point',
        pickupFee: 5500,
        pickupDate: '30 Aug',
      };
    }
  }, [deliveryRegion, product.freeDeliveryEligible]);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-2xl font-black text-neutral-900 mb-2">Product not found</h2>
        <p className="text-neutral-500 mb-6">The product you are looking for does not exist or has been removed.</p>
        <BackButton fallbackUrl="/products" label="Back to Products" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="w-full px-2 sm:px-4 lg:px-6 py-4 sm:py-8 space-y-6 max-w-7xl mx-auto"
    >
      {/* 1. Breadcrumb and Back navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <BackButton label="Back" fallbackUrl="/products" />
          <nav className="flex items-center gap-1.5 text-xs text-neutral-500 overflow-x-auto whitespace-nowrap">
            <Link to="/" className="hover:text-[#FF6A00] flex items-center gap-1">
              <Home size={13} />
              <span>Home</span>
            </Link>
            <ChevronRight size={13} className="text-neutral-400" />
            <Link to="/products" className="hover:text-[#FF6A00]">
              Products
            </Link>
            <ChevronRight size={13} className="text-neutral-400" />
            <Link to={`/category/${(product?.category || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="hover:text-[#FF6A00]">
              {product?.category}
            </Link>
            <ChevronRight size={13} className="text-neutral-400" />
            <span className="font-semibold text-neutral-800 truncate max-w-[180px] sm:max-w-[280px]">
              {product.name}
            </span>
          </nav>
        </div>

        <button
          onClick={() => handleShare()}
          className="p-2 rounded-xl bg-white border border-neutral-200 hover:border-[#FF6A00] text-neutral-600 hover:text-[#FF6A00] transition cursor-pointer flex items-center gap-1 text-xs font-semibold shadow-2xs"
          title="Share Product"
        >
          <Share2 size={14} />
          <span className="hidden sm:inline">Share Product</span>
        </button>
      </div>

      {/* 2. Main Product Hero & Right Sidebar Grid (Jumia Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT & CENTER: Images & Main Buy Box (8 cols) */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Image Gallery Column (5 cols on md) */}
          <div className="md:col-span-5 bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-2xs space-y-3">
            <div className="relative aspect-square w-full bg-neutral-50 rounded-xl overflow-hidden flex items-center justify-center p-4 border border-neutral-100">
              <img
                src={selectedImage || null}
                alt={product.name}
                className="w-full h-full object-contain mix-blend-multiply transition-all duration-300"
              />

              {/* Badges Overlay */}
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                {product.discountPercentage && product.discountPercentage > 0 && (
                  <span className="bg-red-600 text-white text-xs font-black px-2 py-0.5 rounded shadow-xs">
                    -{product.discountPercentage}%
                  </span>
                )}
                {product.isOfficialStore && (
                  <span className="bg-neutral-900 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-xs">
                    <ShieldCheck size={12} />
                    OFFICIAL STORE
                  </span>
                )}
              </div>

              <button
                onClick={() => handleShare()}
                className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full text-neutral-600 hover:text-neutral-900 border border-neutral-200 shadow-xs cursor-pointer"
                aria-label="Share product"
              >
                <Share2 size={16} />
              </button>
            </div>

            {/* Thumbnail Strip */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-14 h-14 rounded-lg p-1 border-2 bg-neutral-50 shrink-0 overflow-hidden transition cursor-pointer ${
                      selectedImage === img
                        ? 'border-[#FF6A00] ring-2 ring-orange-100'
                        : 'border-neutral-200 hover:border-neutral-400 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-contain mix-blend-multiply" />
                  </button>
                ))}
              </div>
            )}

            {/* SHARE THIS PRODUCT */}
            <div className="pt-2 border-t border-neutral-100 space-y-2">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                Share this product
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleShare('Facebook')}
                  className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:opacity-90 transition cursor-pointer text-xs font-bold"
                  title="Share on Facebook"
                >
                  f
                </button>
                <button
                  onClick={() => handleShare('Twitter/X')}
                  className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center hover:opacity-90 transition cursor-pointer text-xs font-bold"
                  title="Share on X"
                >
                  𝕏
                </button>
                <button
                  onClick={() => handleShare('WhatsApp')}
                  className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:opacity-90 transition cursor-pointer text-xs font-bold"
                  title="Share on WhatsApp"
                >
                  w
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowReportModal(true)}
                className="text-[11px] text-neutral-500 hover:text-red-600 underline flex items-center gap-1 cursor-pointer"
              >
                <Flag size={12} />
                <span>Report incorrect product information</span>
              </button>
            </div>
          </div>

          {/* Product Info & Buy Action Column (7 cols on md) */}
          <div className="md:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-2xs space-y-4">
              <div>
                {/* Warranty Badge & Brand */}
                <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5 flex-wrap gap-2">
                  <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                    <ShieldCheck size={13} className="text-amber-700" />
                    {product.warranty || '2 Year Warranty'}
                  </span>
                  <span className="text-neutral-400">SKU: {product.id.toUpperCase()}</span>
                </div>

                <h1 className="text-lg sm:text-xl font-black text-neutral-900 leading-snug">
                  {product.name}
                </h1>

                <div className="flex items-center gap-2 text-xs text-neutral-600 mt-1 flex-wrap">
                  <span>Brand:</span>
                  <Link to={`/brand/${product.brand.toLowerCase()}`} className="font-bold text-[#FF6A00] hover:underline">
                    {product.brand}
                  </Link>
                  <span>•</span>
                  <span>Condition:</span>
                  <span className={`font-bold ${product.condition === 'Refurbished' ? 'text-blue-600' : 'text-emerald-600'}`}>
                    {product.condition || 'New'}
                  </span>
                  <span>•</span>
                  <Link to={`/products?brand=${product.brand}`} className="text-neutral-500 hover:underline">
                    Similar products from {product.brand}
                  </Link>
                </div>

                {/* Flash Sale Banner - Only displayed for products actually under active promotion */}
                {(product.isFlashDeal || product.isDealOfDay || product.isUnderPromotion || (product.badges && product.badges.includes('FLASH SALE')) || (product.discountPercentage && product.discountPercentage >= 20)) && (
                  <div className="mt-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl p-3 flex items-center justify-between text-xs shadow-xs">
                    <div className="flex items-center gap-2 font-bold">
                      <Zap size={16} className="text-amber-300 animate-pulse" />
                      <span>Active Promotion & Flash Deal</span>
                    </div>
                    <div className="bg-white/20 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold">
                      Limited Time Offer
                    </div>
                  </div>
                )}

                {/* Price Display */}
                <div className="mt-3 space-y-1">
                  <div className="flex items-baseline gap-2.5 flex-wrap">
                    <span className="text-2xl sm:text-3xl font-black text-neutral-950">
                      {formatCurrency(currentPrice)}
                    </span>
                    {product.oldPrice && product.oldPrice > currentPrice && (
                      <span className="text-sm text-neutral-400 line-through font-medium">
                        {formatCurrency(product.oldPrice)}
                      </span>
                    )}
                    {product.discountPercentage && product.discountPercentage > 0 && (
                      <span className="bg-red-100 text-red-800 text-xs font-black px-2 py-0.5 rounded">
                        -{product.discountPercentage}%
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="text-[11px] text-neutral-500">
                      + shipping from {formatCurrency(product.freeDeliveryEligible ? 0 : 3500)} to {deliveryRegion}
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowPriceDropModal(true)}
                      className="text-xs flex items-center gap-1 font-bold text-[#FF6A00] hover:text-[#E55E00] transition bg-orange-50 px-2 py-1 rounded-lg border border-orange-200"
                    >
                      <Bell size={12} />
                      Notify Me When Price Drops
                    </button>
                  </div>
                </div>

                {/* Ratings */}
                <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center gap-3 text-xs">
                  <RatingStars rating={product.rating} reviewCount={product.reviewCount} size={15} />
                  <span className="text-neutral-300">|</span>
                  <span className="text-neutral-600 font-medium">
                    <strong className="text-neutral-900 font-bold">{product.reviewCount} verified ratings</strong>
                  </span>
                </div>
              </div>

              {/* Variations Selection */}
              {product.variations && product.variations.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-neutral-100">
                  {product.variations.map((v) => (
                    <div key={v.id || v.title}>
                      <div className="text-xs font-bold text-neutral-900 mb-1.5 flex items-center justify-between">
                        <span>Select {v.title}:</span>
                        <span className="text-[#FF6A00] font-semibold">{selectedVariations[v.title]}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {v.options.map((opt) => {
                          const isSelected = selectedVariations[v.title] === opt.name;
                          return (
                            <button
                              key={opt.name}
                              type="button"
                              disabled={!opt.inStock}
                              onClick={() => handleVariationSelect(v.title, opt.name)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                                isSelected
                                  ? 'bg-[#FF6A00] text-white border-[#FF6A00] shadow-xs'
                                  : opt.inStock
                                  ? 'bg-white text-neutral-800 border-neutral-300 hover:border-[#FF6A00]'
                                  : 'bg-neutral-100 text-neutral-400 border-neutral-200 line-through cursor-not-allowed'
                              }`}
                            >
                              {opt.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add to Cart CTA */}
              <div className="space-y-3 pt-3 border-t border-neutral-100">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-neutral-800">Qty:</span>
                  <div className="flex items-center border border-neutral-300 rounded-lg bg-neutral-50 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 text-neutral-700 hover:bg-neutral-200 font-bold text-sm cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-xs font-black text-neutral-900 bg-white min-w-10 text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-3 py-1.5 text-neutral-700 hover:bg-neutral-200 font-bold text-sm cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#FF6A00] hover:bg-[#E55E00] text-white font-black text-sm transition flex items-center justify-center gap-2 shadow-md active:scale-98 cursor-pointer"
                  >
                    <ShoppingBag size={18} />
                    <span>Add to cart</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="w-full py-3 px-4 rounded-xl bg-[#0B132B] hover:bg-neutral-800 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Zap size={16} className="text-amber-400" />
                    <span>Buy Now with Escrow Protection</span>
                  </button>
                </div>
              </div>

              {/* Promotions List (Jumia style) */}
              <div className="pt-3 border-t border-neutral-100 space-y-2 text-xs">
                <span className="font-bold text-neutral-900 block uppercase tracking-wider">Promotions</span>
                <div className="space-y-1.5 text-neutral-600">
                  <div className="flex items-center gap-2">
                    <Award size={14} className="text-[#FF6A00] shrink-0" />
                    <span>Enjoy Free Delivery on selected items with LUMO Prime</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-[#FF6A00] shrink-0" />
                    <span>Exclusive Offers | Call <strong>+255 712 345 678</strong> To Order</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-[#FF6A00] shrink-0" />
                    <span>100% Escrow Protection: Funds released only after inspection.</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* RIGHT SIDEBAR: Delivery & Returns + Seller Info (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* DELIVERY & RETURNS CARD */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <span className="font-black text-xs text-neutral-900 uppercase tracking-wider">Delivery & Returns</span>
              <span className="text-[11px] text-[#FF6A00] font-bold bg-orange-50 px-2 py-0.5 rounded">
                LUMO Express
              </span>
            </div>

            {/* Choose location selectors */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-neutral-800 block">Choose your location</span>
              <div className="space-y-2">
                <select
                  value={deliveryRegion}
                  onChange={(e) => setDeliveryRegion(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-900 outline-hidden focus:border-[#FF6A00]"
                >
                  <option value="Dar es Salaam Region">Dar es Salaam Region</option>
                  <option value="Arusha Region">Arusha Region</option>
                  <option value="Mwanza Region">Mwanza Region</option>
                  <option value="Dodoma Region">Dodoma Region</option>
                  <option value="Zanzibar Region">Zanzibar Region</option>
                </select>

                <select
                  value={deliveryDistrict}
                  onChange={(e) => setDeliveryDistrict(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-900 outline-hidden focus:border-[#FF6A00]"
                >
                  <option value="Kinondoni District">Kinondoni District / CBD</option>
                  <option value="Ilala District">Ilala District (Kariakoo)</option>
                  <option value="Temeke District">Temeke District</option>
                  <option value="Ubungo District">Ubungo District</option>
                </select>
              </div>
            </div>

            {/* Delivery Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {/* Pickup Station Info */}
              <label 
                className={`p-3 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                  deliveryType === 'pickup'
                    ? 'border-[#FF6A00] bg-orange-50/50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="product_deliveryType"
                    checked={deliveryType === 'pickup'}
                    onChange={() => setDeliveryType('pickup')}
                    className="mt-1 text-[#FF6A00] focus:ring-[#FF6A00]"
                  />
                  <div className="space-y-1 text-xs flex-1">
                    <div className="flex items-center justify-between font-bold text-neutral-900">
                      <span>Pickup Station</span>
                      <button
                        onClick={(e) => {
                          e.preventDefault(); // Prevent radio label click
                          setIsPickupModalOpen(true);
                        }}
                        className="text-[11px] text-[#FF6A00] hover:underline cursor-pointer"
                      >
                        Details
                      </button>
                    </div>
                    <p className="text-neutral-600 font-medium line-clamp-1">{selectedPickupStation}</p>
                    <p className="text-neutral-600 text-[11px]">
                      Fee: <strong>{formatCurrency(deliveryEstimate.pickupFee)}</strong>
                    </p>
                    <p className="text-neutral-500 text-[10px]">
                      Ready: <strong>{deliveryEstimate.pickupDate}</strong>
                    </p>
                  </div>
                </div>
              </label>

              {/* Door Delivery Info */}
              <label 
                className={`p-3 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                  deliveryType === 'doorstep'
                    ? 'border-[#FF6A00] bg-orange-50/50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="product_deliveryType"
                    checked={deliveryType === 'doorstep'}
                    onChange={() => setDeliveryType('doorstep')}
                    className="mt-1 text-[#FF6A00] focus:ring-[#FF6A00]"
                  />
                  <div className="space-y-1 text-xs flex-1">
                    <div className="flex items-center justify-between font-bold text-neutral-900">
                      <span>Door Delivery</span>
                    </div>
                    <p className="text-neutral-600 font-medium">To {deliveryDistrict}</p>
                    <p className="text-neutral-600 text-[11px]">
                      Fee: <strong>{formatCurrency(deliveryEstimate.doorstepFee)}</strong>
                    </p>
                    <p className="text-neutral-500 text-[10px]">
                      Ready: <strong>{deliveryEstimate.doorstepDate}</strong>
                    </p>
                  </div>
                </div>
              </label>
            </div>

            {/* Return Policy & Warranty */}
            <div className="space-y-2 pt-2 border-t border-neutral-100 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-neutral-800 font-semibold">
                  <RotateCcw size={15} className="text-emerald-600" />
                  <span>Return Policy</span>
                </div>
                <button
                  onClick={() => setShowReturnModal(true)}
                  className="text-[#FF6A00] font-bold hover:underline cursor-pointer text-xs"
                >
                  Details
                </button>
              </div>
              <p className="text-[11px] text-neutral-500 pl-6">
                Free return within 7 days for defective or incorrectly described items.
              </p>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-neutral-800 font-semibold">
                  <ShieldCheck size={15} className="text-blue-600" />
                  <span>Warranty</span>
                </div>
                <span className="text-neutral-900 font-bold text-xs">
                  {product.warranty || '2 Years Warranty'}
                </span>
              </div>
            </div>

          </div>

          {/* SELLER INFORMATION CARD */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <span className="font-black text-xs text-neutral-900 uppercase tracking-wider">Seller Information</span>
              <button
                onClick={() => openChatWithSeller(product.sellerId, product.sellerName, product.id, product.name)}
                className="text-xs font-bold text-[#FF6A00] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <MessageSquare size={13} />
                <span>Chat</span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="font-extrabold text-sm text-neutral-900">{product.sellerName}</h4>
                  <VerifiedMerchantBadge size="sm" isOfficialStore={product.sellerName?.toLowerCase().includes('official') || product.sellerName?.toLowerCase().includes('samsung') || product.sellerName?.toLowerCase().includes('apple')} />
                </div>
                <p className="text-xs text-neutral-500">{product.sellerCity}, Tanzania • {sellerFollowers} Followers</p>
              </div>
              <button
                type="button"
                onClick={handleToggleFollow}
                className={`px-4 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer shadow-xs ${
                  isFollowingSeller
                    ? 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300'
                    : 'bg-[#FF6A00] text-white hover:bg-[#E55E00]'
                }`}
              >
                {isFollowingSeller ? 'Following' : 'Follow'}
              </button>
            </div>

            {/* Seller Performance Metrics */}
            <div className="p-3 bg-neutral-50 rounded-xl space-y-2 text-xs border border-neutral-200/70">
              <span className="font-bold text-neutral-900 block">Seller Performance</span>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Shipping Speed:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Excellent</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Quality Score:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Excellent</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Customer Rating:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Good ({product.sellerRating || 4.6}★)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Cancellation Rate:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">0.2% (Low)</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openChatWithSeller(product.sellerId, product.sellerName, product.id, product.name)}
              className="w-full py-2.5 bg-neutral-100 hover:bg-orange-50 hover:text-[#FF6A00] text-neutral-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-neutral-200"
            >
              <MessageSquare size={14} className="text-[#FF6A00]" />
              <span>Questions about this product? Chat</span>
            </button>
          </div>

        </div>

      </div>

      {/* 3. Detailed Tabs Section (Specs, Description, Customer Feedback, Escrow) */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex border-b border-neutral-200 overflow-x-auto gap-2 sm:gap-6">
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 text-xs sm:text-sm font-bold tracking-tight transition cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'specs'
                ? 'border-[#FF6A00] text-[#FF6A00]'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Specifications & What&apos;s in the Box
          </button>
          <button
            onClick={() => setActiveTab('desc')}
            className={`pb-3 text-xs sm:text-sm font-bold tracking-tight transition cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'desc'
                ? 'border-[#FF6A00] text-[#FF6A00]'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Product Overview
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 text-xs sm:text-sm font-bold tracking-tight transition cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'border-[#FF6A00] text-[#FF6A00]'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Customer Feedback & Ratings ({product.reviewCount})
          </button>
          <button
            onClick={() => setActiveTab('escrow')}
            className={`pb-3 text-xs sm:text-sm font-bold tracking-tight transition cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'escrow'
                ? 'border-[#FF6A00] text-[#FF6A00]'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Escrow & Safety Policy
          </button>
        </div>

        {/* Tab 1: Specifications & What's in the Box */}
        {activeTab === 'specs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-neutral-900 pb-2 border-b border-neutral-100">Key Features & Specs</h3>
              <div className="space-y-2 text-xs">
                {product.specifications && Array.isArray(product.specifications) ? (
                  product.specifications.map((spec, idx) => (
                    <div key={idx} className="flex justify-between p-2.5 bg-neutral-50 rounded-xl border border-neutral-100">
                      <span className="font-bold text-neutral-500">{spec.label}:</span>
                      <span className="font-bold text-neutral-900 text-right">{spec.value}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-neutral-50 rounded-xl">
                    <span className="font-bold text-neutral-800 block mb-1">Standard Specifications</span>
                    <p className="text-neutral-600">Model: {product.name} • Brand: {product.brand} • Condition: {product.condition}</p>
                  </div>
                )}
                <div className="flex justify-between p-2.5 bg-neutral-50 rounded-xl border border-neutral-100">
                  <span className="font-bold text-neutral-500">SKU Code:</span>
                  <span className="font-bold text-neutral-900 font-mono">TZ-{product.id.toUpperCase()}-2026</span>
                </div>
                <div className="flex justify-between p-2.5 bg-neutral-50 rounded-xl border border-neutral-100">
                  <span className="font-bold text-neutral-500">Weight (kg):</span>
                  <span className="font-bold text-neutral-900">{product.weightKg || '0.35 kg'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-sm text-neutral-900 pb-2 border-b border-neutral-100">What&apos;s in the Box</h3>
              <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-200 space-y-3 text-xs text-neutral-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#FF6A00]" />
                  <span className="font-bold">1x {product.name} (Original Sealed Unit)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#FF6A00]" />
                  <span>Manufacturer Warranty Card & Safety Manual</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#FF6A00]" />
                  <span>Official LUMO Escrow Inspection & Receipt Slip</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#FF6A00]" />
                  <span>Cables / Accessories (as specified by manufacturer)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Product Overview */}
        {activeTab === 'desc' && (
          <div className="space-y-4 text-xs sm:text-sm text-neutral-700 leading-relaxed max-w-4xl">
            <p className="font-medium text-neutral-900">{product.description}</p>
            <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
              <h4 className="font-bold text-neutral-900">Why buy this item on LUMO Tanzania?</h4>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-neutral-600">
                <li>Sourced directly from authorized distributors and verified Kariakoo/Posta importers.</li>
                <li>Protected by 100% Escrow Vaulting — payment is only released after delivery and inspection.</li>
                <li>Backed by our 7-Day Free Replacement Guarantee.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 3: Customer Feedback & Ratings */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-neutral-50 rounded-2xl border border-neutral-200">
              <div className="flex items-center gap-6">
                <div className="text-center sm:text-left">
                  <div className="text-3xl sm:text-4xl font-black text-neutral-900">{product.rating}</div>
                  <div className="text-xs text-neutral-400 font-semibold mt-0.5">out of 5.0</div>
                </div>
                <div className="space-y-1">
                  <RatingStars rating={product.rating} size={18} showText={false} />
                  <p className="text-xs text-neutral-600 font-medium">
                    {product.reviewCount} verified ratings • 100% Verified Purchases
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowReviewModal(true)}
                className="px-5 py-2.5 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
              >
                Write a Review
              </button>
            </div>

            {/* Rating breakdown progress bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 text-xs bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                <span className="font-bold text-neutral-900 block mb-1">Rating Breakdown</span>
                <div className="flex items-center gap-2">
                  <span className="w-12 text-neutral-600">5 star</span>
                  <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div className="w-[85%] h-full bg-emerald-600 rounded-full" />
                  </div>
                  <span className="w-8 text-right text-neutral-500">85%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12 text-neutral-600">4 star</span>
                  <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div className="w-[10%] h-full bg-emerald-500 rounded-full" />
                  </div>
                  <span className="w-8 text-right text-neutral-500">10%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12 text-neutral-600">3 star</span>
                  <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div className="w-[3%] h-full bg-amber-500 rounded-full" />
                  </div>
                  <span className="w-8 text-right text-neutral-500">3%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12 text-neutral-600">2 star</span>
                  <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div className="w-[2%] h-full bg-red-400 rounded-full" />
                  </div>
                  <span className="w-8 text-right text-neutral-500">2%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12 text-neutral-600">1 star</span>
                  <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div className="w-[0%] h-full bg-red-600 rounded-full" />
                  </div>
                  <span className="w-8 text-right text-neutral-500">0%</span>
                </div>
              </div>

              {/* Sample Reviews */}
              <div className="space-y-3 divide-y divide-neutral-100 text-xs bg-white p-4 rounded-xl border border-neutral-200">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-900">Rashid M. (Dar es Salaam)</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Verified Purchase</span>
                  </div>
                  <RatingStars rating={5} size={12} showText={false} />
                  <p className="text-neutral-600 pt-1">
                    Authentic item delivered via M-Pesa escrow protection. Fast delivery to Kinondoni!
                  </p>
                </div>
                <div className="pt-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-900">Amina J. (Arusha)</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Verified Purchase</span>
                  </div>
                  <RatingStars rating={5} size={12} showText={false} />
                  <p className="text-neutral-600 pt-1">
                    Pickup at Arusha Clock Tower was smooth. Excellent seller service.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Escrow & Safety Policy */}
        {activeTab === 'escrow' && (
          <div className="space-y-4 text-xs text-neutral-700 leading-relaxed max-w-4xl">
            <h3 className="font-bold text-sm text-neutral-900">LUMO Escrow Protection Guarantee</h3>
            <p>
              When you buy on LUMO, your money is vault-protected. The merchant cannot touch your funds until you receive your parcel, inspect it, and confirm receipt in the app.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1.5">
                <span className="font-bold text-[#FF6A00] block">1. Secure Vaulting</span>
                <p className="text-neutral-600 text-[11px]">Funds are held in LUMO audited escrow trust accounts upon mobile money confirmation.</p>
              </div>
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1.5">
                <span className="font-bold text-[#FF6A00] block">2. Inspection Window</span>
                <p className="text-neutral-600 text-[11px]">Inspect the item upon doorstep delivery or at our pickup station before tapping confirm.</p>
              </div>
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1.5">
                <span className="font-bold text-[#FF6A00] block">3. Guaranteed Payout / Refund</span>
                <p className="text-neutral-600 text-[11px]">If defects occur, trigger a 7-day return and get an instant refund or replacement.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. More items from this seller */}
      {sellerProducts.length > 0 && (
        <HorizontalProductCarousel
          title={`More items from ${product.sellerName}`}
          subtitle="Explore other verified products from this authorized merchant"
          viewAllLink="/products"
          viewAllLabel="View Store"
          products={sellerProducts}
          variant="card"
        />
      )}

      {/* 5. Customers who viewed this also viewed */}
      {relatedProducts.length > 0 && (
        <HorizontalProductCarousel
          title="Customers who viewed this item also viewed"
          subtitle="Related authentic listings matching this category"
          viewAllLink={`/category/${(product?.category || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
          viewAllLabel="View Category"
          products={relatedProducts}
          variant="card"
        />
      )}

      {/* MODALS */}
      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative"
          >
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 cursor-pointer"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-black text-neutral-900">Report Product Information</h3>
            <p className="text-xs text-neutral-500">
              Help us maintain accurate product listings across Tanzania.
            </p>
            <form onSubmit={handleSubmitReport} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-neutral-800 block mb-1">Reason for Report</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden"
                >
                  <option value="Incorrect price or specs">Incorrect price or specifications</option>
                  <option value="Wrong images or description">Wrong images or description</option>
                  <option value="Counterfeit or prohibited item">Counterfeit or prohibited item</option>
                  <option value="Other issue">Other issue</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-neutral-800 block mb-1">Additional Details</label>
                <textarea
                  rows={3}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Describe the discrepancy..."
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-[#FF6A00] text-white font-black text-sm rounded-xl shadow-md cursor-pointer"
              >
                Submit Report
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Return Policy Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative"
          >
            <button
              onClick={() => setShowReturnModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 cursor-pointer"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-black text-neutral-900 flex items-center gap-2">
              <RotateCcw size={20} className="text-emerald-600" />
              <span>7-Day Free Return Policy</span>
            </h3>
            <div className="text-xs text-neutral-600 space-y-2 leading-relaxed">
              <p>
                All products purchased on LUMO are covered under our 7-Day Return & Refund Guarantee.
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Free return pickup in Dar es Salaam, Arusha, and Mwanza.</li>
                <li>Item must be in original packaging with all accessories.</li>
                <li>Immediate escrow refund or replacement issued upon warehouse inspection.</li>
              </ul>
            </div>
            <button
              onClick={() => setShowReturnModal(false)}
              className="w-full py-2.5 bg-[#0B132B] text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Got It
            </button>
          </motion.div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative"
          >
            <button
              onClick={() => setShowReviewModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 cursor-pointer"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-black text-neutral-900">Write Verified Review</h3>
            <form onSubmit={handleSubmitReview} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-neutral-800 block mb-1">Rating (1 to 5 Stars)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReviewRating(star)}
                      className={`p-2 rounded-lg font-bold text-sm transition cursor-pointer ${
                        newReviewRating >= star ? 'bg-amber-400 text-white' : 'bg-neutral-100 text-neutral-400'
                      }`}
                    >
                      ★ {star}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="font-bold text-neutral-800 block mb-1">Your Review Comment</label>
                <textarea
                  rows={3}
                  required
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-[#FF6A00] text-white font-black text-sm rounded-xl shadow-md cursor-pointer"
              >
                Submit Review
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Price Drop Modal */}
      {showPriceDropModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative"
          >
            <button
              onClick={() => setShowPriceDropModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 cursor-pointer"
            >
              <X size={18} />
            </button>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto text-[#FF6A00]">
                <Bell size={24} />
              </div>
              <h3 className="text-lg font-black text-neutral-900">Notify Me When Price Drops</h3>
              <p className="text-xs text-neutral-500">
                Current price is {formatCurrency(currentPrice)}. What price should we notify you at?
              </p>
            </div>
            <form onSubmit={handleSetPriceDrop} className="space-y-3 text-xs">
              <div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-bold text-sm">TZS</span>
                  <input
                    type="number"
                    required
                    value={priceThreshold}
                    onChange={(e) => setPriceThreshold(e.target.value)}
                    placeholder="e.g. 50000"
                    className="w-full pl-12 pr-3 py-3 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-sm outline-hidden"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-black text-sm rounded-xl shadow-md transition cursor-pointer"
              >
                Set Alert
              </button>
            </form>
          </motion.div>
        </div>
      )}

      <PickupStationsModal
        isOpen={isPickupModalOpen}
        onClose={() => setIsPickupModalOpen(false)}
        onSelectStation={(station) => {
          setSelectedPickupStation(typeof station === 'string' ? station : station.name);
          setDeliveryType('pickup');
        }}
      />
    </motion.div>
  );
};

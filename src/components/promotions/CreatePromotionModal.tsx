import React, { useState, useEffect } from 'react';
import { 
  X, Tag, Percent, Gift, Truck, Zap, Layers, ShoppingBag, Store, Sparkles, 
  Calendar, Clock, ShieldAlert, ArrowRight, ArrowLeft, Check, Plus, Trash2, 
  Search, Eye, RefreshCw, AlertTriangle, DollarSign, Calculator, HelpCircle
} from 'lucide-react';
import { PromotionType, Product, Promotion } from '../../types/index';

interface CreatePromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPromotionCreated: (promo: Promotion) => void;
  vendorProducts: Product[];
  sellerId: string;
}

const PROMOTION_TYPES: { type: PromotionType; title: string; desc: string; icon: any }[] = [
  { type: 'Percentage Discount', title: 'Percentage Discount', desc: 'Apply a percentage discount (e.g., 20% OFF) to selected items.', icon: Percent },
  { type: 'Fixed Amount Discount', title: 'Fixed Amount Discount', desc: 'Deduct a flat cash amount (e.g., TZS 20,000 OFF) from order.', icon: Tag },
  { type: 'Buy X Get Y', title: 'Buy X Get Y', desc: 'Buy a specified quantity and get a free or discounted item.', icon: Gift },
  { type: 'Buy X Get X', title: 'Buy X Get X', desc: 'Buy X units of a product and get extra units of the same item.', icon: ShoppingBag },
  { type: 'Free Delivery', title: 'Free Delivery', desc: 'Subsidize or waive delivery fees for qualifying customer orders.', icon: Truck },
  { type: 'Bundle Discount', title: 'Bundle Discount', desc: 'Offer a special combined package price when purchasing grouped items.', icon: Layers },
  { type: 'Quantity Discount', title: 'Quantity Tier Discount', desc: 'Volume pricing with progressive discounts based on order bulk.', icon: Zap },
  { type: 'Flash Sale', title: 'Flash Sale', desc: 'High-urgency limited-time promotion with countdown timer & unit limits.', icon: Sparkles },
  { type: 'Product-Specific Discount', title: 'Product-Specific Discount', desc: 'Target individual SKUs with customized discount rates.', icon: Tag },
  { type: 'Category Discount', title: 'Category Discount', desc: 'Apply discount across an entire store category (e.g., Accessories).', icon: Layers },
  { type: 'Store-Wide Discount', title: 'Store-Wide Discount', desc: 'Universal discount across your entire catalog.', icon: Store },
  { type: 'Custom Promotion', title: 'Custom Promotion', desc: 'Advanced visual rule builder for tailored promo logic.', icon: Calculator }
];

export const CreatePromotionModal: React.FC<CreatePromotionModalProps> = ({
  isOpen,
  onClose,
  onPromotionCreated,
  vendorProducts,
  sellerId
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [promoType, setPromoType] = useState<PromotionType>('Percentage Discount');
  const [name, setName] = useState<string>('');
  const [internalRef, setInternalRef] = useState<string>(`REF-${Math.floor(1000 + (window.crypto.getRandomValues(new Uint32Array(1))[0] % 9000))}`);
  const [description, setDescription] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState<string>('08:00');
  const [endDate, setEndDate] = useState<string>(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
  const [endTime, setEndTime] = useState<string>('23:59');
  const [timezone, setTimezone] = useState<string>('EAT (UTC+3)');

  // Step 3 Scope State
  const [appliesTo, setAppliesTo] = useState<'Specific Products' | 'Specific Categories' | 'All Vendor Products' | 'Product Collections'>('Specific Products');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [searchProductQuery, setSearchProductQuery] = useState<string>('');
  const [excludeOutOfStock, setExcludeOutOfStock] = useState<boolean>(true);

  // Step 4 Discount Config
  const [percentage, setPercentage] = useState<number>(15);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number>(50000);
  const [fixedDiscountAmount, setFixedDiscountAmount] = useState<number>(10000);
  const [minOrderValue, setMinOrderValue] = useState<number>(20000);
  const [buyQuantity, setBuyQuantity] = useState<number>(2);
  const [getQuantity, setGetQuantity] = useState<number>(1);
  const [freeDeliveryMaxSubsidy, setFreeDeliveryMaxSubsidy] = useState<number>(15000);
  const [flashSalePrice, setFlashSalePrice] = useState<number>(45000);
  const [quantityTiers, setQuantityTiers] = useState<{ minQty: number; maxQty: number; discountPercent: number }[]>([
    { minQty: 3, maxQty: 5, discountPercent: 10 },
    { minQty: 6, maxQty: 10, discountPercent: 20 }
  ]);

  // Step 5 Eligibility & Limits
  const [targetSegment, setTargetSegment] = useState<'All Customers' | 'New Customers' | 'Returning Customers' | 'First Order Customers' | 'VIP Customers'>('All Customers');
  const [maxTotalUses, setMaxTotalUses] = useState<number>(200);
  const [maxUsesPerCustomer, setMaxUsesPerCustomer] = useState<number>(2);
  const [isUnlimitedUses, setIsUnlimitedUses] = useState<boolean>(false);

  // Step 6 Coupon & Stacking
  const [requireCoupon, setRequireCoupon] = useState<boolean>(true);
  const [couponCode, setCouponCode] = useState<string>('DEAL15');
  const [canCombine, setCanCombine] = useState<boolean>(true);
  const [combineWithFreeDelivery, setCombineWithFreeDelivery] = useState<boolean>(true);

  // Step 7 Storefront Display
  const [badgeText, setBadgeText] = useState<string>('SPECIAL OFFER');
  const [showCountdownTimer, setShowCountdownTimer] = useState<boolean>(true);
  const [placements, setPlacements] = useState<string[]>(['Product Page', 'Vendor Store', 'Checkout']);

  // Preview Mode
  const [activePreviewTab, setActivePreviewTab] = useState<'card' | 'page' | 'checkout'>('card');

  useEffect(() => {
    if (vendorProducts.length > 0 && selectedProductIds.length === 0) {
      setSelectedProductIds([vendorProducts[0].id]);
    }
  }, [vendorProducts]);

  if (!isOpen) return null;

  // Search filtered products (Vendor Isolated)
  const filteredProducts = vendorProducts.filter(p => 
    p.name.toLowerCase().includes(searchProductQuery.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchProductQuery.toLowerCase())
  );

  // Helper Auto Generate Coupon Code using Web Crypto API
  const handleGenerateCoupon = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'LUMO';
    const randArr = new Uint32Array(4);
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(randArr);
    } else {
      for (let i = 0; i < 4; i++) randArr[i] = Math.floor((window.crypto.getRandomValues(new Uint32Array(1))[0] % chars.length));
    }
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(randArr[i] % chars.length);
    }
    setCouponCode(result);
  };

  // Financial & Margin Protection Calculations
  const selectedProduct = vendorProducts.find(p => selectedProductIds.includes(p.id)) || vendorProducts[0];
  const originalPrice = selectedProduct?.price || 100000;
  let calculatedDiscount = 0;

  if (promoType === 'Percentage Discount') {
    calculatedDiscount = Math.min((originalPrice * percentage) / 100, maxDiscountAmount || Infinity);
  } else if (promoType === 'Fixed Amount Discount') {
    calculatedDiscount = Math.min(fixedDiscountAmount, originalPrice);
  } else if (promoType === 'Flash Sale') {
    calculatedDiscount = Math.max(0, originalPrice - flashSalePrice);
  } else if (promoType === 'Free Delivery') {
    calculatedDiscount = freeDeliveryMaxSubsidy;
  }

  const finalPrice = Math.max(0, originalPrice - calculatedDiscount);
  const estimatedVendorMargin = Math.round(((finalPrice * 0.85) / originalPrice) * 100);
  const isMarginWarning = estimatedVendorMargin < 15;

  const handleSubmit = async (asDraft: boolean = false) => {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const payload = {
        name,
        internalRef,
        description,
        imageUrl,
        promotionType: promoType,
        startDate,
        startTime,
        endDate,
        endTime,
        timezone,
        status: asDraft ? 'Draft' : (isMarginWarning ? 'Under Review' : 'Active'),
        appliesTo,
        productIds: appliesTo === 'Specific Products' ? selectedProductIds : [],
        excludeOutOfStock,
        discountConfig: {
          percentage,
          maxDiscountAmount,
          fixedDiscountAmount,
          minOrderValue,
          buyQuantity,
          getQuantity,
          freeDeliveryMaxSubsidy,
          flashSalePrice,
          quantityTiers
        },
        customerEligibility: { targetSegment },
        limits: {
          maxTotalUses: isUnlimitedUses ? undefined : maxTotalUses,
          maxUsesPerCustomer,
          isUnlimitedUses
        },
        coupon: {
          requireCoupon,
          code: requireCoupon ? couponCode.trim().toUpperCase() : undefined
        },
        stacking: {
          canCombine,
          combineWithFreeDelivery
        },
        storefrontDisplay: {
          placements: placements as any,
          badgeText,
          showCountdownTimer
        },
        financials: {
          vendorFundedPercent: 100,
          platformFundedPercent: 0,
          estimatedUnitsAffected: 100,
          minVendorMarginPercent: 15
        },
        sellerId
      };

      const res = await fetch('/api/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create promotion');
      }

      onPromotionCreated(data.promotion);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-5xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#ff6a00] text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-white">Promotion & Campaign Builder</h2>
              <p className="text-xs text-slate-400">Configure no-code promotions, coupons, and discounts</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between overflow-x-auto text-xs font-semibold shrink-0">
          {[
            { step: 1, label: 'Type' },
            { step: 2, label: 'Details' },
            { step: 3, label: 'Products' },
            { step: 4, label: 'Discount' },
            { step: 5, label: 'Limits' },
            { step: 6, label: 'Coupons' },
            { step: 7, label: 'Display' },
            { step: 8, label: 'Preview' }
          ].map((s) => (
            <button
              key={s.step}
              onClick={() => setCurrentStep(s.step)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl cursor-pointer transition-all whitespace-nowrap ${
                currentStep === s.step
                  ? 'bg-[#ff6a00] text-white font-bold shadow-xs'
                  : currentStep > s.step
                  ? 'bg-emerald-100 text-emerald-800 font-bold'
                  : 'text-slate-500 hover:bg-slate-200/60'
              }`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                currentStep === s.step ? 'bg-white text-[#ff6a00]' : 'bg-slate-200 text-slate-700'
              }`}>
                {currentStep > s.step ? '✓' : s.step}
              </span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Body Content Scroll Area */}
        <div className="p-6 overflow-y-auto grow space-y-6">
          {/* STEP 1: PROMOTION TYPE */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Step 1 — Choose Promotion Type</h3>
                <p className="text-xs text-slate-500">Select the offer model you wish to build for your vendor store</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {PROMOTION_TYPES.map((pt) => {
                  const Icon = pt.icon;
                  const isSelected = promoType === pt.type;
                  return (
                    <div
                      key={pt.type}
                      onClick={() => setPromoType(pt.type)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-orange-50/80 border-[#ff6a00] ring-2 ring-orange-500/20 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className={`p-2 rounded-xl ${isSelected ? 'bg-[#ff6a00] text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#ff6a00]" />}
                      </div>
                      <div className="mt-3">
                        <h4 className="font-bold text-xs text-slate-900">{pt.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{pt.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: PROMOTION DETAILS */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in max-w-2xl">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Step 2 — Basic Campaign Details</h3>
                <p className="text-xs text-slate-500">Provide campaign naming, banner, and scheduling</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Promotion Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Kariakoo Weekend Mega Flash Sale"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Internal Reference Code</label>
                    <input
                      type="text"
                      value={internalRef}
                      onChange={(e) => setInternalRef(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Timezone</label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white outline-hidden"
                    >
                      <option value="EAT (UTC+3)">East Africa Time (EAT - UTC+3)</option>
                      <option value="CAT (UTC+2)">Central Africa Time (CAT - UTC+2)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Customer Description / Terms</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe promotion benefits and eligibility criteria..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Start Date & Time</label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-hidden"
                      />
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-24 px-2 py-2 rounded-xl border border-slate-200 text-xs outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">End Date & Time</label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-hidden"
                      />
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-24 px-2 py-2 rounded-xl border border-slate-200 text-xs outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PRODUCTS & CATEGORIES */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Step 3 — Select Eligible Vendor Products</h3>
                <p className="text-xs text-slate-500">Choose products that belong to your vendor store</p>
              </div>

              <div className="flex gap-3 text-xs">
                {(['Specific Products', 'All Vendor Products'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setAppliesTo(mode)}
                    className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-all ${
                      appliesTo === mode
                        ? 'bg-[#ff6a00] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {appliesTo === 'Specific Products' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="relative grow">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search your store products by name or SKU..."
                        value={searchProductQuery}
                        onChange={(e) => setSearchProductQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs outline-hidden"
                      />
                    </div>
                    <button
                      onClick={() => setSelectedProductIds(vendorProducts.map(p => p.id))}
                      className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      Select All ({vendorProducts.length})
                    </button>
                    <button
                      onClick={() => setSelectedProductIds([])}
                      className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-1 border border-slate-200 rounded-2xl">
                    {filteredProducts.map((p) => {
                      const isChecked = selectedProductIds.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            if (isChecked) {
                              setSelectedProductIds(selectedProductIds.filter(id => id !== p.id));
                            } else {
                              setSelectedProductIds([...selectedProductIds, p.id]);
                            }
                          }}
                          className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                            isChecked
                              ? 'bg-orange-50 border-[#ff6a00] ring-1 ring-orange-400'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <img src={p.thumbnail} alt={p.name} className="w-10 h-10 object-cover rounded-lg border border-slate-200" />
                          <div className="grow min-w-0">
                            <h5 className="font-bold text-xs text-slate-900 truncate">{p.name}</h5>
                            <p className="text-[10px] text-slate-500">TZS {p.price.toLocaleString()} • Stock: {p.stock}</p>
                          </div>
                          <input type="checkbox" checked={isChecked} onChange={() => {}} className="accent-[#ff6a00] shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: DISCOUNT CONFIGURATION */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in max-w-2xl">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Step 4 — Discount Rules Configuration</h3>
                <p className="text-xs text-slate-500">Tailored inputs for {promoType}</p>
              </div>

              {promoType === 'Percentage Discount' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">Discount Percentage (%)</label>
                      <input
                        type="number"
                        min={1}
                        max={90}
                        value={percentage}
                        onChange={(e) => setPercentage(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">Max Discount Amount (TZS)</label>
                      <input
                        type="number"
                        value={maxDiscountAmount}
                        onChange={(e) => setMaxDiscountAmount(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {promoType === 'Fixed Amount Discount' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Fixed Cash Discount (TZS)</label>
                    <input
                      type="number"
                      value={fixedDiscountAmount}
                      onChange={(e) => setFixedDiscountAmount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-hidden"
                    />
                  </div>
                </div>
              )}

              {promoType === 'Free Delivery' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Max Shipping Subsidy (TZS)</label>
                    <input
                      type="number"
                      value={freeDeliveryMaxSubsidy}
                      onChange={(e) => setFreeDeliveryMaxSubsidy(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-hidden"
                    />
                  </div>
                </div>
              )}

              {promoType === 'Flash Sale' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Flash Sale Special Price (TZS)</label>
                    <input
                      type="number"
                      value={flashSalePrice}
                      onChange={(e) => setFlashSalePrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-hidden"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Minimum Order Value (TZS)</label>
                <input
                  type="number"
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-hidden"
                />
              </div>
            </div>
          )}

          {/* STEP 5: CUSTOMER ELIGIBILITY & LIMITS */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-in fade-in max-w-2xl">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Step 5 — Customer Eligibility & Usage Limits</h3>
                <p className="text-xs text-slate-500">Control budget limits and targeting</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Target Customer Segment</label>
                  <select
                    value={targetSegment}
                    onChange={(e: any) => setTargetSegment(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-hidden bg-white"
                  >
                    <option value="All Customers">All Customers</option>
                    <option value="New Customers">New Customers Only</option>
                    <option value="Returning Customers">Returning Customers</option>
                    <option value="First Order Customers">First Order Customers</option>
                    <option value="VIP Customers">VIP / Top Buyers</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Total Max Uses</label>
                    <input
                      type="number"
                      disabled={isUnlimitedUses}
                      value={maxTotalUses}
                      onChange={(e) => setMaxTotalUses(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-hidden disabled:bg-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Max Uses Per Customer</label>
                    <input
                      type="number"
                      value={maxUsesPerCustomer}
                      onChange={(e) => setMaxUsesPerCustomer(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    id="unlimited"
                    checked={isUnlimitedUses}
                    onChange={(e) => setIsUnlimitedUses(e.target.checked)}
                    className="accent-[#ff6a00]"
                  />
                  <label htmlFor="unlimited" className="font-semibold text-slate-700">Unlimited Total Redemptions</label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: COUPON CODE & STACKING */}
          {currentStep === 6 && (
            <div className="space-y-4 animate-in fade-in max-w-2xl">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Step 6 — Coupon Code & Stacking Rules</h3>
                <p className="text-xs text-slate-500">Configure mandatory promo codes and compatibility</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">Require Coupon Code</h5>
                    <p className="text-[11px] text-slate-500">Customers must enter code at checkout</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={requireCoupon}
                    onChange={(e) => setRequireCoupon(e.target.checked)}
                    className="w-5 h-5 accent-[#ff6a00]"
                  />
                </div>

                {requireCoupon && (
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Coupon Code</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 uppercase outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={handleGenerateCoupon}
                        className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Auto-Generate
                      </button>
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-200 space-y-2 text-xs">
                  <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-[#ff6a00]" /> Stacking & Compatibility Settings
                  </h5>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="combine"
                      checked={canCombine}
                      onChange={(e) => setCanCombine(e.target.checked)}
                      className="accent-[#ff6a00]"
                    />
                    <label htmlFor="combine" className="font-semibold text-slate-800">Can be combined with other store promotions</label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: STOREFRONT DISPLAY */}
          {currentStep === 7 && (
            <div className="space-y-4 animate-in fade-in max-w-2xl">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Step 7 — Storefront Display & Badges</h3>
                <p className="text-xs text-slate-500">Configure visual badges on product cards and checkout</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Promotion Badge Text</label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder="e.g. 20% FLASH SALE"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-hidden"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    id="countdown"
                    checked={showCountdownTimer}
                    onChange={(e) => setShowCountdownTimer(e.target.checked)}
                    className="accent-[#ff6a00]"
                  />
                  <label htmlFor="countdown" className="font-semibold text-slate-800">Display Live Countdown Timer on Product Cards</label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: PREVIEW & MARGIN CHECK */}
          {currentStep === 8 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Step 8 — Financial Impact & Live Storefront Preview</h3>
                <p className="text-xs text-slate-500">Real-time calculations and storefront component preview</p>
              </div>

              {/* Margin Protection Card */}
              <div className={`p-4 rounded-2xl border ${
                isMarginWarning ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-emerald-50 border-emerald-300 text-emerald-900'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {isMarginWarning ? <AlertTriangle className="w-5 h-5 text-amber-600" /> : <Check className="w-5 h-5 text-emerald-600" />}
                    <h4 className="font-bold text-xs">
                      {isMarginWarning ? '⚠ Margin Warning: Threshold Review Triggered' : '✓ Margin Protection Verified'}
                    </h4>
                  </div>
                  <span className="text-xs font-black">Est. Vendor Margin: {estimatedVendorMargin}%</span>
                </div>
                <p className="text-[11px] mt-1 opacity-80">
                  {isMarginWarning 
                    ? 'Your calculated margin falls below 15%. This promotion will require Lumo Super Admin approval before going live.'
                    : 'Your promotion maintains healthy vendor margins and is ready for immediate launch.'}
                </p>
              </div>

              {/* Preview Mode Switcher */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <button
                    onClick={() => setActivePreviewTab('card')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                      activePreviewTab === 'card' ? 'bg-[#ff6a00] text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Product Card Preview
                  </button>
                  <button
                    onClick={() => setActivePreviewTab('checkout')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                      activePreviewTab === 'checkout' ? 'bg-[#ff6a00] text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Checkout Summary Preview
                  </button>
                </div>

                {/* Card Preview */}
                {activePreviewTab === 'card' && (
                  <div className="p-6 bg-slate-100 rounded-3xl flex justify-center">
                    <div className="w-64 bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden relative">
                      <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-md bg-[#ff6a00] text-white text-[10px] font-bold z-10">
                        {badgeText}
                      </span>
                      <img src={selectedProduct?.thumbnail} alt="Preview" className="w-full h-40 object-cover" />
                      <div className="p-3 space-y-1">
                        <h5 className="font-bold text-xs text-slate-900 truncate">{selectedProduct?.name}</h5>
                        <div className="flex items-baseline gap-2">
                          <span className="font-black text-sm text-[#ff6a00]">TZS {finalPrice.toLocaleString()}</span>
                          <span className="text-[11px] text-slate-400 line-through">TZS {originalPrice.toLocaleString()}</span>
                        </div>
                        {requireCoupon && (
                          <div className="mt-2 p-1.5 rounded-lg bg-orange-50 border border-orange-200 text-[10px] font-mono text-[#ff6a00] font-bold text-center">
                            Use Code: {couponCode}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Checkout Preview */}
                {activePreviewTab === 'checkout' && (
                  <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2 text-xs max-w-md mx-auto">
                    <h5 className="font-bold text-slate-900 border-b pb-2">Order Summary</h5>
                    <div className="flex justify-between text-slate-600">
                      <span>Item Subtotal:</span>
                      <span>TZS {originalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Promotion Discount ({name}):</span>
                      <span>- TZS {calculatedDiscount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-black text-slate-900 border-t pt-2 text-sm">
                      <span>Total Payable:</span>
                      <span>TZS {finalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            disabled={currentStep === 1}
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs flex items-center gap-1 cursor-pointer disabled:opacity-40"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs cursor-pointer"
            >
              Save as Draft
            </button>

            {currentStep < 8 ? (
              <button
                onClick={() => setCurrentStep(prev => Math.min(8, prev + 1))}
                className="px-5 py-2 rounded-xl bg-[#ff6a00] hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-sm"
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} 
                Publish Promotion
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

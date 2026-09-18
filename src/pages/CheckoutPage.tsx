import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../context/OrderContext';
import { useNotification } from '../context/NotificationContext';
import { DeliveryAddress, DeliveryMethodType, PaymentMethodType } from '../types';
import { formatCurrency } from '../utils/formatters';
import { BackButton } from '../components/common/BackButton';
import {
  ShieldCheck,
  Truck,
  MapPin,
  CreditCard,
  Smartphone,
  Lock,
  ArrowRight,
  CheckCircle2,
  Building,
} from 'lucide-react';
import { EscrowBadge } from '../components/common/EscrowBadge';
import { PickupStationsModal } from '../components/common/PickupStationsModal';
import { UssdPaymentModal } from '../components/common/UssdPaymentModal';
import { calculateDeliveryFee } from '../utils/deliveryZoneEngine';
import { Navigation, Sparkles, AlertCircle } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    subtotal,
    estimatedDeliveryFee,
    voucherDiscountAmount,
    finalTotal,
    voucherCode,
    clearCart,
  } = useCart();
  const { user } = useAuth();
  const { placeOrder } = useOrder();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const userDefaultAddress = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];

  // Customer Contact & Shipping States
  const [fullName, setFullName] = useState(userDefaultAddress?.fullName || user?.name || '');
  const [phone, setPhone] = useState(userDefaultAddress?.phone || user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [region, setRegion] = useState(userDefaultAddress?.region || '');
  const [city, setCity] = useState(userDefaultAddress?.city || '');
  const [area, setArea] = useState(userDefaultAddress?.area || 'Sinza Mori');
  const [streetAddress, setStreetAddress] = useState(
    userDefaultAddress?.streetAddress || 'House No. 42, Shekilango Road'
  );
  const [deliveryNotes, setDeliveryNotes] = useState(userDefaultAddress?.deliveryNotes || '');

  // Delivery Method State
  const [deliveryType, setDeliveryType] = useState<DeliveryMethodType>('express');
  const [pickupStationName, setPickupStationName] = useState('LUMO Kariakoo Station Hub');
  const [selectedPickupStationId, setSelectedPickupStationId] = useState('dar-ps-1');
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);

  // Payment Method State
  const [paymentType, setPaymentType] = useState<PaymentMethodType>('mobile_money');
  const [mobileProvider, setMobileProvider] = useState<'M-Pesa (Vodacom)' | 'Tigo Pesa' | 'Airtel Money' | 'Halopesa'>('M-Pesa (Vodacom)');
  const [mobileMoneyPhone, setMobileMoneyPhone] = useState(phone);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUssdModalOpen, setIsUssdModalOpen] = useState(false);
  const [subscribePromotions, setSubscribePromotions] = useState(false);

  // Dynamic Free Delivery Zone Calculation
  const deliveryInfo = calculateDeliveryFee(
    `${area} ${city} ${region}`,
    subtotal,
    undefined,
    deliveryType === 'pickup' ? 'pickup' : (deliveryType === 'express' ? 'express' : 'standard')
  );

  const calculatedDeliveryFee = deliveryType === 'pickup' ? 0 : (deliveryType === 'express' ? deliveryInfo.expressFee : deliveryInfo.standardFee);
  const checkoutFinalTotal = Math.max(0, subtotal - voucherDiscountAmount + calculatedDeliveryFee);

  const setLocationPreset = (newRegion: string, newCity: string, newArea: string, newStreet: string) => {
    setRegion(newRegion);
    setCity(newCity);
    setArea(newArea);
    setStreetAddress(newStreet);
  };

  const handleDetectGPS = () => {
    setLocationPreset('', '', 'Masaki / Mikocheni', 'Toure Drive, Masaki, Plot 14');
    showToast('GPS Location Detected: Masaki, Kinondoni (Dar es Salaam Central Zone)', 'success');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-neutral-900">Your Cart is Empty</h2>
        <p className="text-xs text-neutral-500">Please add items to your cart before proceeding to checkout.</p>
        <Link to="/products" className="inline-block px-5 py-2.5 bg-red-700 text-white text-xs font-bold rounded-xl">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const executeOrderCreation = (
    paymentRef?: string, 
    paymentStatus: 'Paid (Escrow Secured)' | 'Pending on Delivery' | 'Paid (Direct Merchant Remittance)' = 'Paid (Escrow Secured)'
  ) => {
    const deliveryAddressObj: DeliveryAddress = {
      fullName,
      phone,
      region,
      city,
      area,
      streetAddress: deliveryType === 'pickup' ? `Pickup Station: ${pickupStationName}` : streetAddress,
      deliveryNotes,
      isDefault: true,
    };

    const orderItems = cart.map((item) => ({
      productId: item.productId,
      productName: item.product.name,
      productImage: item.product.thumbnail,
      brand: item.product.brand,
      sellerName: item.product.sellerName,
      selectedVariations: item.selectedVariations,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    }));

    const newOrder = placeOrder({
      customer: {
        name: fullName,
        email,
        phone,
      },
      items: orderItems,
      deliveryAddress: deliveryAddressObj,
      deliveryMethod: {
        type: deliveryType,
        name: deliveryType === 'pickup' ? `Pickup: ${pickupStationName}` : (deliveryType === 'express' ? 'Express Doorstep Delivery' : 'Standard Delivery'),
        fee: calculatedDeliveryFee,
        estimatedDelivery: deliveryType === 'express' ? deliveryInfo.expressDaysEstimate : deliveryInfo.deliveryDaysEstimate,
        pickupStationName: deliveryType === 'pickup' ? pickupStationName : undefined,
        pickupStationId: deliveryType === 'pickup' ? selectedPickupStationId : undefined,
      },
      paymentMethod: {
        type: paymentType,
        name: paymentType === 'mobile_money' ? mobileProvider : paymentType === 'card' ? 'Visa / MasterCard' : 'Cash on Delivery',
        details: paymentType === 'mobile_money' ? (mobileMoneyPhone || phone) : undefined,
        status: paymentStatus,
        transactionRef: paymentRef
      },
      pricing: {
        subtotal,
        deliveryFee: calculatedDeliveryFee,
        discount: voucherDiscountAmount,
        escrowFee: 0,
        total: checkoutFinalTotal,
      },
      status: 'Processing',
    });

    clearCart();
    setIsProcessing(false);
    if (paymentType === 'cod') {
      showToast(`Order #${newOrder.orderNumber} placed! Pay TZS ${checkoutFinalTotal.toLocaleString()} cash to courier on arrival.`, 'success');
    } else {
      showToast('Order placed successfully! Payment secured in LUMO Escrow.', 'success');
    }
    navigate(`/order-success/${newOrder.id}`);
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !phone.trim() || !streetAddress.trim()) {
      showToast('Please fill all required shipping address fields', 'error');
      return;
    }

    if (paymentType === 'mobile_money') {
      const activePhone = mobileMoneyPhone.trim() || phone.trim();
      if (!activePhone) {
        showToast('Please provide a valid phone number for the USSD prompt', 'error');
        return;
      }
      setIsUssdModalOpen(true);
      return;
    }

    setIsProcessing(true);

    if (paymentType === 'cod') {
      setTimeout(() => {
        executeOrderCreation(undefined, 'Pending on Delivery');
      }, 800);
      return;
    }

    if (paymentType === 'card') {
      setTimeout(() => {
        executeOrderCreation(`CARD-TZ-${Math.floor(100000 + (window.crypto.getRandomValues(new Uint32Array(1))[0] % 900000))}`, 'Paid (Escrow Secured)');
      }, 1000);
      return;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="w-full px-2 sm:px-4 lg:px-6 py-4 sm:py-8 space-y-6"
    >
      {/* Checkout Header and Back Button */}
      <div className="flex flex-wrap items-center justify-between border-b border-neutral-200 pb-4 gap-3">
        <div className="flex items-center gap-3">
          <BackButton label="Back to Cart" fallbackUrl="/cart" />
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
              <span>Secure LUMO Escrow Checkout</span>
              <Lock size={18} className="text-emerald-600" />
            </h1>
            <p className="text-xs text-neutral-500">
              Protected transaction: Payment released to merchant only upon verified delivery
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
          <ShieldCheck size={16} />
          <span>256-Bit SSL Escrow Protected</span>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Steps 1, 2, 3 (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: Delivery Address */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between gap-2.5 pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-red-700 text-white font-bold text-xs flex items-center justify-center">
                  1
                </div>
                <h2 className="font-extrabold text-sm sm:text-base text-neutral-900">
                  Customer Contact & Destination in Tanzania
                </h2>
              </div>
              <button
                type="button"
                onClick={handleDetectGPS}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Navigation size={13} />
                <span className="hidden sm:inline">Auto-Detect GPS</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Recipient Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rashid Mohamed"
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-hidden focus:border-red-600 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Phone Number (M-Pesa / Tigo) *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setMobileMoneyPhone(e.target.value);
                  }}
                  placeholder="e.g. +255 754 892 314"
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-hidden focus:border-red-600 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-hidden focus:border-red-600 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Region in Tanzania *</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-hidden focus:border-red-600 font-bold text-neutral-900"
                >
                  <option value="Dar es Salaam">Dar es Salaam</option>
                  <option value="Arusha">Arusha</option>
                  <option value="Mwanza">Mwanza</option>
                  <option value="Dodoma">Dodoma</option>
                  <option value="Zanzibar">Zanzibar</option>
                  <option value="Mbeya">Mbeya</option>
                  <option value="Morogoro">Morogoro</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">City / District / Area *</label>
                <input
                  type="text"
                  required
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. Kinondoni / Sinza Mori"
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-hidden focus:border-red-600 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Street, Building or Landmark *</label>
                <input
                  type="text"
                  required
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="e.g. House 42, Shekilango Road"
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-hidden focus:border-red-600 font-medium"
                />
              </div>
            </div>

            {/* Quick Location Preset Selector Chips for dynamic rate & zone testing */}
            <div className="pt-2 border-t border-neutral-100">
              <span className="text-[11px] font-bold text-neutral-500 block mb-1.5">
                Quick Test Delivery Locations (Test Free vs. Paid Zone Rates):
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setLocationPreset('', '', 'Kinondoni / Kariakoo', 'Plot 12, Kawawa Rd')}
                  className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-lg border border-emerald-200 transition cursor-pointer"
                >
                  📍 Dar Central (Free &ge; 50k)
                </button>
                <button
                  type="button"
                  onClick={() => setLocationPreset('', 'Temeke', 'Temeke / Ubungo', 'Kilwa Rd, Mbagala')}
                  className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 text-[10px] font-bold rounded-lg border border-teal-200 transition cursor-pointer"
                >
                  📍 Dar Outer (Free &ge; 80k)
                </button>
                <button
                  type="button"
                  onClick={() => setLocationPreset('Arusha', 'Arusha', 'Arusha Urban / Njiro', 'Njiro Block C')}
                  className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-bold rounded-lg border border-amber-200 transition cursor-pointer"
                >
                  📍 Arusha Hub (Free &ge; 100k)
                </button>
                <button
                  type="button"
                  onClick={() => setLocationPreset('Zanzibar', 'Zanzibar', 'Stone Town / Malindi', 'Shangani Street')}
                  className="px-2 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 text-[10px] font-bold rounded-lg border border-sky-200 transition cursor-pointer"
                >
                  📍 Zanzibar (Paid Courier: 12k)
                </button>
                <button
                  type="button"
                  onClick={() => setLocationPreset('Mbeya', 'Mbeya', 'Mbeya Urban / Iyunga', 'Uhuru St')}
                  className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 text-[10px] font-bold rounded-lg border border-purple-200 transition cursor-pointer"
                >
                  📍 Upcountry (Paid Freight: 11k)
                </button>
              </div>
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1 text-xs">
                Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="e.g. Ring bell at the black gate, call before arrival"
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs outline-hidden focus:border-red-600"
              />
            </div>
          </div>

          {/* STEP 2: Delivery Method */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-100">
              <div className="w-7 h-7 rounded-full bg-red-700 text-white font-bold text-xs flex items-center justify-center">
                2
              </div>
              <div className="flex-1">
                <h2 className="font-extrabold text-sm sm:text-base text-neutral-900">
                  Choose Delivery Method
                </h2>
                <p className="text-[11px] text-neutral-500">
                  Door delivery fees automatically calibrate to your selected location
                </p>
              </div>
            </div>

            {/* Platform Location Detection Banner */}
            <div className={`p-3.5 rounded-2xl border transition-all ${
              deliveryInfo.isFreeDeliveryEligible
                ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                : deliveryInfo.isFreeDeliveryZone
                  ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                  : 'bg-blue-50/90 border-blue-300 text-blue-950'
            }`}>
              <div className="flex items-start gap-2.5">
                <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                  deliveryInfo.isFreeDeliveryEligible
                    ? 'bg-emerald-600 text-white'
                    : deliveryInfo.isFreeDeliveryZone
                      ? 'bg-amber-600 text-white'
                      : 'bg-blue-600 text-white'
                }`}>
                  <Truck size={17} />
                </div>
                <div className="flex-1 text-xs">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-extrabold">
                      Location Detected: {deliveryInfo.zone.name}
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      deliveryInfo.isFreeDeliveryEligible
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : deliveryInfo.isFreeDeliveryZone
                          ? 'bg-amber-600 text-white'
                          : 'bg-blue-600 text-white'
                    }`}>
                      {deliveryInfo.isFreeDeliveryEligible
                        ? '✓ FREE DOOR DELIVERY ACTIVE'
                        : deliveryInfo.isFreeDeliveryZone
                          ? `ELIGIBLE FOR FREE DELIVERY AT ${formatCurrency(deliveryInfo.zone.freeDeliveryThreshold)}`
                          : 'STANDARD PAID COURIER ZONE'}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-95">
                    {deliveryInfo.ruleExplanation}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* Option 1: Standard Doorstep Delivery (Adjusts to Free or Paid) */}
              <label
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                  deliveryType === 'standard'
                    ? 'border-red-600 bg-red-50/40 shadow-2xs'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="deliveryType"
                        checked={deliveryType === 'standard'}
                        onChange={() => setDeliveryType('standard')}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <span className="font-bold text-neutral-900 block leading-tight">
                        Standard Door Delivery
                      </span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-baseline gap-1.5">
                    {deliveryInfo.standardFee === 0 ? (
                      <>
                        <span className="font-black text-emerald-700 bg-emerald-100 text-xs px-2 py-0.5 rounded-full">
                          100% FREE
                        </span>
                        <span className="line-through text-neutral-400 text-[10px]">
                          {formatCurrency(deliveryInfo.zone.baseDeliveryFee)}
                        </span>
                      </>
                    ) : (
                      <span className="font-black text-neutral-900 text-xs">
                        {formatCurrency(deliveryInfo.standardFee)}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-neutral-500 leading-snug">
                    {deliveryInfo.standardFee === 0
                      ? 'Free door delivery automatically applied for your zone'
                      : `Fixed courier delivery to ${deliveryInfo.zone.city || region}`}
                  </p>
                </div>

                <div className="text-[10px] text-neutral-600 font-semibold mt-3 pt-2 border-t border-neutral-200/60">
                  ETA: {deliveryInfo.deliveryDaysEstimate}
                </div>
              </label>

              {/* Option 2: Express Priority Doorstep Courier */}
              <label
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                  deliveryType === 'express'
                    ? 'border-red-600 bg-red-50/40 shadow-2xs'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="deliveryType"
                        checked={deliveryType === 'express'}
                        onChange={() => setDeliveryType('express')}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <span className="font-bold text-neutral-900 block leading-tight">
                        Express Priority Courier
                      </span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-baseline gap-1.5">
                    <span className="font-black text-neutral-900 text-xs">
                      {formatCurrency(deliveryInfo.expressFee)}
                    </span>
                    {deliveryInfo.isFreeDeliveryEligible && (
                      <span className="line-through text-neutral-400 text-[10px]">
                        {formatCurrency(deliveryInfo.zone.expressDeliveryFee)}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-neutral-500 leading-snug">
                    Dedicated courier dispatch with live parcel tracking
                  </p>
                </div>

                <div className="text-[10px] text-emerald-700 font-semibold mt-3 pt-2 border-t border-neutral-200/60">
                  ETA: {deliveryInfo.expressDaysEstimate}
                </div>
              </label>

              {/* Option 3: Pickup Station */}
              <label
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                  deliveryType === 'pickup'
                    ? 'border-red-600 bg-red-50/40 shadow-2xs'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="deliveryType"
                        checked={deliveryType === 'pickup'}
                        onChange={() => setDeliveryType('pickup')}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <span className="font-bold text-neutral-900 block leading-tight">
                        LUMO Point Pickup
                      </span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <span className="font-black text-emerald-700 bg-emerald-100 text-xs px-2 py-0.5 rounded-full">
                      FREE PICKUP
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-neutral-600 font-semibold line-clamp-1">
                      {pickupStationName}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsPickupModalOpen(true);
                      }}
                      className="text-[10px] text-red-600 hover:underline font-bold mt-0.5 cursor-pointer block"
                    >
                      Change Station &rarr;
                    </button>
                  </div>
                </div>

                <div className="text-[10px] text-neutral-600 font-semibold mt-3 pt-2 border-t border-neutral-200/60">
                  Ready within 2 hours
                </div>
              </label>
            </div>
          </div>

          {/* STEP 3: Payment Method */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-100">
              <div className="w-7 h-7 rounded-full bg-red-700 text-white font-bold text-xs flex items-center justify-center">
                3
              </div>
              <div>
                <h2 className="font-extrabold text-sm sm:text-base text-neutral-900">
                  Select Payment Method (Protected by Escrow)
                </h2>
                <p className="text-[11px] text-neutral-500">
                  Funds held in SokoDirect Escrow until you inspect your items
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* M-Pesa */}
              <label
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex items-center gap-3 ${
                  paymentType === 'mobile_money' && mobileProvider === 'M-Pesa (Vodacom)'
                    ? 'border-red-600 bg-red-50/60 font-bold'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentType === 'mobile_money' && mobileProvider === 'M-Pesa (Vodacom)'}
                  onChange={() => {
                    setPaymentType('mobile_money');
                    setMobileProvider('M-Pesa (Vodacom)');
                  }}
                  className="text-red-600 focus:ring-red-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-900 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-600"></span>
                      Vodacom M-Pesa
                    </span>
                    <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded font-black">
                      POPULAR
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-500 font-normal">Instant USSD PIN Prompt</span>
                </div>
              </label>

              {/* Tigo Pesa */}
              <label
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex items-center gap-3 ${
                  paymentType === 'mobile_money' && mobileProvider === 'Tigo Pesa'
                    ? 'border-blue-600 bg-blue-50/60 font-bold'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentType === 'mobile_money' && mobileProvider === 'Tigo Pesa'}
                  onChange={() => {
                    setPaymentType('mobile_money');
                    setMobileProvider('Tigo Pesa');
                  }}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <span className="text-neutral-900 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    Tigo Pesa
                  </span>
                  <span className="text-[11px] text-neutral-500 font-normal">Instant Mobile Money</span>
                </div>
              </label>

              {/* Airtel Money */}
              <label
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex items-center gap-3 ${
                  paymentType === 'mobile_money' && mobileProvider === 'Airtel Money'
                    ? 'border-red-600 bg-red-50/60 font-bold'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentType === 'mobile_money' && mobileProvider === 'Airtel Money'}
                  onChange={() => {
                    setPaymentType('mobile_money');
                    setMobileProvider('Airtel Money');
                  }}
                  className="text-red-600 focus:ring-red-500"
                />
                <div className="flex-1">
                  <span className="text-neutral-900 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Airtel Money
                  </span>
                  <span className="text-[11px] text-neutral-500 font-normal">Mobile Wallet</span>
                </div>
              </label>

              {/* Halopesa */}
              <label
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex items-center gap-3 ${
                  paymentType === 'mobile_money' && mobileProvider === 'Halopesa'
                    ? 'border-orange-500 bg-orange-50/60 font-bold'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentType === 'mobile_money' && mobileProvider === 'Halopesa'}
                  onChange={() => {
                    setPaymentType('mobile_money');
                    setMobileProvider('Halopesa');
                  }}
                  className="text-orange-500 focus:ring-orange-400"
                />
                <div className="flex-1">
                  <span className="text-neutral-900 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    Halopesa
                  </span>
                  <span className="text-[11px] text-neutral-500 font-normal">Halotel Wallet</span>
                </div>
              </label>

              {/* Bank Card (Visa / Mastercard) */}
              <label
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex items-center gap-3 ${
                  paymentType === 'card'
                    ? 'border-neutral-900 bg-neutral-100 font-bold'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentType === 'card'}
                  onChange={() => setPaymentType('card')}
                  className="text-neutral-900 focus:ring-neutral-700"
                />
                <div className="flex-1">
                  <span className="text-neutral-900 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    Visa / MasterCard
                  </span>
                  <span className="text-[11px] text-neutral-500 font-normal">Debit & Credit Cards</span>
                </div>
              </label>

              {/* Pay on Delivery — Cash (Dar & Major Hubs) */}
              <label
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex items-center gap-3 ${
                  paymentType === 'cod'
                    ? 'border-emerald-600 bg-emerald-50/80 font-bold shadow-xs'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentType === 'cod'}
                  onChange={() => setPaymentType('cod')}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-900 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      Pay on Delivery (Cash)
                    </span>
                    <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-black">
                      NO SURCHARGE
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-500 font-normal">
                    Physical Cash Handover to Courier (TZS {checkoutFinalTotal.toLocaleString()})
                  </span>
                </div>
              </label>
            </div>

            {/* Cash on Delivery Advisory Prompt */}
            {paymentType === 'cod' && (
              <div className="p-4 bg-emerald-50/80 rounded-xl border border-emerald-300 text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                    <ShieldCheck size={16} className="text-emerald-700" />
                    <span>Cash on Delivery Terms & Verification</span>
                  </span>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Exact Amount: TZS {checkoutFinalTotal.toLocaleString()}
                  </span>
                </div>
                <div className="text-[11px] text-emerald-900 space-y-1">
                  <p>
                    • <b>Exact Cash:</b> Please prepare exactly <span className="font-bold underline font-mono">TZS {checkoutFinalTotal.toLocaleString()}</span> in Tanzanian Shillings for courier collection.
                  </p>
                  <p>
                    • <b>Handover OTP:</b> A secure 4-digit code will appear in your orders tab. Only give this code to the courier after you have physically inspected your parcel and handed over cash.
                  </p>
                  <p>
                    • <b>Regional Coverage:</b> Available for door delivery across Dar es Salaam (Kinondoni, Ilala, Temeke, Ubungo, Kigamboni).
                  </p>
                </div>
                {region !== '' && (
                  <p className="text-[11px] font-bold text-amber-800 bg-amber-100/80 p-2 rounded-lg border border-amber-300">
                    Note: For deliveries outside Dar es Salaam ({region}), courier COD route availability is subject to local hub dispatch. Instant Mobile Money is recommended.
                  </p>
                )}
              </div>
            )}

            {/* Mobile money phone prompt */}
            {paymentType === 'mobile_money' && (
              <div className="p-4 bg-red-50/60 rounded-xl border border-red-200 text-xs space-y-2">
                <label className="font-bold text-neutral-900 block">
                  {mobileProvider} Phone Number for USSD Prompt:
                </label>
                <input
                  type="text"
                  value={mobileMoneyPhone}
                  onChange={(e) => setMobileMoneyPhone(e.target.value)}
                  placeholder="+255 7XX XXX XXX"
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg font-bold text-neutral-900"
                />
                <p className="text-[11px] text-neutral-600">
                  After clicking &quot;Authorize Escrow Payment&quot;, a secure PIN prompt will appear on your phone screen.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Order Summary Card (4 cols) */}
        <div className="lg:col-span-4 space-y-4 sticky top-24">
          <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-2xs space-y-4">
            <h3 className="font-extrabold text-base text-neutral-900 pb-3 border-b border-neutral-100">
              Checkout Summary
            </h3>

            {/* Cart Items Preview */}
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1 divide-y divide-neutral-100">
              {cart.map((item, idx) => (
                <div key={idx} className="pt-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate max-w-[200px]">
                    <img
                      src={item.product.thumbnail || null}
                      alt={item.product.name}
                      className="w-8 h-8 rounded object-contain border border-neutral-100 shrink-0"
                    />
                    <div className="truncate">
                      <span className="font-medium text-neutral-800 truncate block">
                        {item.product.name}
                      </span>
                      <span className="text-[10px] text-neutral-400">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-bold text-neutral-900 shrink-0">
                    {formatCurrency(item.totalPrice)}
                  </span>
                </div>
              ))}
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-2 pt-3 border-t border-neutral-100 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Items Subtotal:</span>
                <span className="font-bold text-neutral-900">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between items-center text-neutral-600">
                <div className="flex flex-col">
                  <span>Delivery ({deliveryType === 'pickup' ? 'Pickup Station' : deliveryType === 'express' ? 'Express Courier' : 'Standard Door'}):</span>
                  <span className="text-[10px] text-neutral-400">
                    {deliveryInfo.zone.name}
                  </span>
                </div>
                <span className="font-bold">
                  {calculatedDeliveryFee === 0 ? (
                    <span className="text-emerald-700 font-extrabold bg-emerald-100/80 px-2 py-0.5 rounded text-xs">
                      FREE
                    </span>
                  ) : (
                    <span className="text-neutral-900 font-bold">
                      {formatCurrency(calculatedDeliveryFee)}
                    </span>
                  )}
                </span>
              </div>

              <div className="flex justify-between text-emerald-700 font-semibold">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={14} />
                  <span>LUMO Escrow Vault:</span>
                </span>
                <span>FREE & INCLUDED</span>
              </div>

              {voucherDiscountAmount > 0 && (
                <div className="flex justify-between text-red-700 font-semibold">
                  <span>Voucher Discount ({voucherCode}):</span>
                  <span>-{formatCurrency(voucherDiscountAmount)}</span>
                </div>
              )}

              <div className="pt-3 border-t border-neutral-200 flex justify-between items-baseline">
                <span className="text-sm font-black text-neutral-900">Grand Total:</span>
                <span className="text-xl font-black text-red-700">{formatCurrency(checkoutFinalTotal)}</span>
              </div>
            </div>

            {/* Customer Receipts Policy & Promotional Subscription */}
            <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2.5 text-xs">
              <div className="flex items-start gap-2 text-neutral-700">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Automatic Order Receipts:</strong> Digital order receipt with itemized breakdown and escrow code is automatically dispatched to <span className="font-semibold text-neutral-900">{phone || 'your phone'}</span>.
                </p>
              </div>

              <label className="flex items-start gap-2 pt-2 border-t border-neutral-200/70 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={subscribePromotions}
                  onChange={(e) => setSubscribePromotions(e.target.checked)}
                  className="mt-0.5 rounded text-[#FF6A00] focus:ring-[#FF6A00] h-4 w-4 border-neutral-300"
                />
                <span className="text-[11px] text-neutral-600 leading-snug">
                  <strong>Promotional Emails (Opt-In):</strong> Subscribe to receive weekly promotional deals, voucher codes, and flash sale announcements.
                </span>
              </label>
            </div>

            {/* Escrow assurance snippet */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-[11px] leading-snug">
              <span className="font-bold block mb-0.5">🔒 Escrow Vault Guarantee</span>
              LUMO holds your payment in trust. The merchant is NOT paid until you receive and approve your order.
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 bg-[#FF6A00] hover:bg-[#E55E00] disabled:opacity-50 text-white font-black text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {isProcessing ? (
                <span>{paymentType === 'cod' ? 'Confirming Cash on Delivery Order...' : 'Securing Funds in Escrow...'}</span>
              ) : (
                <>
                  <span>
                    {paymentType === 'cod'
                      ? `Confirm Pay on Delivery Order (TZS ${checkoutFinalTotal.toLocaleString()})`
                      : 'Authorize Escrow & Place Order'}
                  </span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      <PickupStationsModal
        isOpen={isPickupModalOpen}
        onClose={() => setIsPickupModalOpen(false)}
        selectedRegion={region}
        onSelectStation={(station) => {
          setPickupStationName(station.name);
          setSelectedPickupStationId(station.id);
          if (station.region) setRegion(station.region);
          setDeliveryType('pickup');
        }}
      />

      <UssdPaymentModal
        isOpen={isUssdModalOpen}
        onClose={() => setIsUssdModalOpen(false)}
        amount={checkoutFinalTotal}
        payerPhone={mobileMoneyPhone || phone}
        payerName={fullName}
        payerType="CUSTOMER"
        provider={mobileProvider}
        referenceType="ORDER_CHECKOUT"
        referenceId={cart[0]?.productId || 'CART-CHECKOUT'}
        description={`Checkout payment for ${cart.length} item(s) to LUMO Escrow`}
        onSuccess={(tx) => {
          setIsUssdModalOpen(false);
          executeOrderCreation(tx?.transactionNumber, 'Paid (Escrow Secured)');
        }}
      />
    </motion.div>
  );
};

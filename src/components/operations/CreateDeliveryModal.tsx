import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Truck,
  MapPin,
  Clock,
  Package,
  User,
  Phone,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Zap,
  ShieldCheck,
  Building2,
  Sparkles,
  Printer,
  ChevronRight,
  Info,
  Navigation
} from 'lucide-react';
import { usePlatformConfig } from '../../context/PlatformConfigContext';
import { useOrder } from '../../context/OrderContext';
import { api } from '../../services/api';
import { Order, OrderStatus } from '../../types';

interface CreateDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (deliveryOrder: Order) => void;
}

export const PICKUP_STATIONS_LIST = [
  { id: 'pk-1', name: 'LUMO Point - Posta Central Station', zone: 'Zone 1: Dar CBD', address: 'Samora Avenue, Next to Post Office, Ground Floor', fee: 1500, hours: 'Mon-Sat 8am-7pm' },
  { id: 'pk-2', name: 'LUMO Point - Kariakoo Express Hub', zone: 'Zone 1: Dar CBD', address: 'Msimbazi St, Opposite Soko Kuu Plaza', fee: 1500, hours: 'Mon-Sun 8am-8pm' },
  { id: 'pk-3', name: 'LUMO Point - Mlimani City Mall Hub', zone: 'Zone 2: Dar Inner Ring', address: 'Mlimani City Mall, West Wing Arcade #14', fee: 2000, hours: 'Mon-Sun 9am-9pm' },
  { id: 'pk-4', name: 'LUMO Point - Sinza Mori Station', zone: 'Zone 2: Dar Inner Ring', address: 'Mori Road, Near Mori Towers Building', fee: 1500, hours: 'Mon-Sat 8am-8pm' },
  { id: 'pk-5', name: 'LUMO Point - Masaki Peninsula Station', zone: 'Zone 2: Dar Inner Ring', address: 'Haile Selassie Rd, Slipway Plaza', fee: 2000, hours: 'Mon-Sun 9am-8pm' },
  { id: 'pk-6', name: 'LUMO Point - Tegeta Kibaoni Station', zone: 'Zone 3: Dar Outer Ring', address: 'Bagamoyo Road, Near Kibaoni Junction', fee: 2500, hours: 'Mon-Sat 8am-7pm' },
  { id: 'pk-7', name: 'LUMO Point - Arusha Clock Tower Hub', zone: 'Zone 5: Northern Zone', address: 'Boma Road, Next to Clock Tower Roundabout', fee: 3000, hours: 'Mon-Sat 8am-6pm' },
  { id: 'pk-8', name: 'LUMO Point - Mwanza Nyamagana Plaza', zone: 'Zone 6: Lake Zone', address: 'Kenyatta Road, Rock City Commercial Center', fee: 3500, hours: 'Mon-Sat 8am-6pm' },
  { id: 'pk-9', name: 'LUMO Point - Dodoma Nyerere Square', zone: 'Zone 7: Central Zone', address: 'Kuu Street, Near Nyerere Square Mall', fee: 2500, hours: 'Mon-Sat 8am-6:30pm' }
];

export const ACTIVE_RIDERS_LIST = [
  { id: 'rd-1', name: 'Juma Mwita', phone: '+255 714 882 101', vehicle: 'Boda-Boda (Boxer 150cc)', zone: 'Dar Central / Kariakoo', activeRuns: 1, rating: 4.9, available: true },
  { id: 'rd-2', name: 'Baraka Kimaro', phone: '+255 754 991 302', vehicle: 'Bajaj Cargo (TVS King)', zone: 'Kinondoni / Sinza', activeRuns: 0, rating: 4.8, available: true },
  { id: 'rd-3', name: 'Emmanuel Sokoine', phone: '+255 682 334 509', vehicle: 'Boda-Boda (Honda Ace)', zone: 'Masaki / Mikocheni', activeRuns: 2, rating: 4.9, available: true },
  { id: 'rd-4', name: 'Asha Bakari', phone: '+255 773 112 890', vehicle: 'Delivery Van (Toyota TownAce)', zone: 'Dar Outer / Bulky Freight', activeRuns: 0, rating: 5.0, available: true }
];

export const CreateDeliveryModal: React.FC<CreateDeliveryModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { builderConfig } = usePlatformConfig();
  const { placeOrder } = useOrder();

  // Dynamic Riders & Stations State
  const [activeRiders, setActiveRiders] = useState<any[]>(ACTIVE_RIDERS_LIST);
  const [pickupStations, setPickupStations] = useState<any[]>(PICKUP_STATIONS_LIST);

  // Form State
  const [deliveryType, setDeliveryType] = useState<'standard' | 'express' | 'same_day' | 'pickup'>('express');
  const [destinationMode, setDestinationMode] = useState<'address' | 'pickup_station'>('address');
  
  // Recipient details
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [city, setCity] = useState('Dar es Salaam');
  const [region, setRegion] = useState('Kinondoni');
  const [streetAddress, setStreetAddress] = useState('');
  const [selectedStationId, setSelectedStationId] = useState(PICKUP_STATIONS_LIST[0].id);

  // Package details
  const [packageSize, setPackageSize] = useState<'envelope' | 'small_box' | 'medium_carton' | 'large_bulky'>('small_box');
  const [packageWeight, setPackageWeight] = useState<number>(1.5);
  const [itemDescription, setItemDescription] = useState('');
  const [itemCategory, setItemCategory] = useState('Electronics');
  const [isFragile, setIsFragile] = useState(false);
  const [isPerishable, setIsPerishable] = useState(false);

  // Routing & Assignment
  const [assignmentType, setAssignmentType] = useState<'auto' | 'manual'>('auto');
  const [selectedRiderId, setSelectedRiderId] = useState(ACTIVE_RIDERS_LIST[0].id);
  const [priority, setPriority] = useState<'Normal' | 'High' | 'Urgent'>('Normal');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Payment & Schedule
  const [paymentStatus, setPaymentStatus] = useState<'PAID_ESCROW' | 'COD' | 'PAY_AT_STATION'>('PAID_ESCROW');
  const [scheduleType, setScheduleType] = useState<'immediate' | 'scheduled'>('immediate');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduledTimeSlot, setScheduledTimeSlot] = useState('14:00 - 18:00 (Afternoon)');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdDelivery, setCreatedDelivery] = useState<any>(null);

  // Fetch live riders and stations
  useEffect(() => {
    if (isOpen) {
      api.getAvailableRiders().then(res => {
        if (res.success && res.riders && res.riders.length > 0) {
          setActiveRiders(res.riders);
          setSelectedRiderId(res.riders[0].id);
        }
      }).catch(console.warn);
    }
  }, [isOpen]);

  // Auto-Detect Zone from Destination
  const detectedZone = useMemo(() => {
    if (destinationMode === 'pickup_station') {
      const st = pickupStations.find(s => s.id === selectedStationId);
      return st?.zone || 'Zone 1: Dar CBD';
    }

    const fullText = `${streetAddress} ${region} ${city}`.toLowerCase();
    if (fullText.includes('kariakoo') || fullText.includes('posta') || fullText.includes('ilala') || fullText.includes('kisutu') || fullText.includes('upanga')) {
      return 'Zone 1: Dar es Salaam CBD';
    }
    if (fullText.includes('sinza') || fullText.includes('kinondoni') || fullText.includes('masaki') || fullText.includes('mikocheni') || fullText.includes('oysterbay') || fullText.includes('kurasini')) {
      return 'Zone 2: Dar es Salaam Inner Ring';
    }
    if (fullText.includes('tegeta') || fullText.includes('mbezi') || fullText.includes('kigamboni') || fullText.includes('goba') || fullText.includes('tabata')) {
      return 'Zone 3: Dar es Salaam Outer Ring';
    }
    if (fullText.includes('arusha') || fullText.includes('moshi') || fullText.includes('kilimanjaro') || fullText.includes('tanga')) {
      return 'Zone 5: Northern Zone';
    }
    if (fullText.includes('mwanza') || fullText.includes('shinyanga') || fullText.includes('bukoba')) {
      return 'Zone 6: Lake Zone';
    }
    if (fullText.includes('dodoma') || fullText.includes('morogoro') || fullText.includes('iringa') || fullText.includes('mbeya')) {
      return 'Zone 7: Central & Highlands Zone';
    }
    return 'Zone 1: Dar es Salaam CBD';
  }, [destinationMode, selectedStationId, streetAddress, region, city, pickupStations]);

  // Auto-Calculated Delivery Fee
  const calculatedFee = useMemo(() => {
    if (destinationMode === 'pickup_station') {
      const st = pickupStations.find(s => s.id === selectedStationId);
      return st?.fee || 1500;
    }

    let base = 3500;
    if (detectedZone.includes('Zone 2')) base = 5500;
    else if (detectedZone.includes('Zone 3')) base = 8000;
    else if (detectedZone.includes('Zone 5') || detectedZone.includes('Zone 6') || detectedZone.includes('Zone 7')) base = 15000;

    // Delivery type surcharge
    if (deliveryType === 'same_day') base += 2000;
    if (deliveryType === 'express') base += 3500;

    // Weight surcharge (> 5kg is +2,000 TZS/kg)
    if (packageWeight > 5) {
      base += Math.ceil(packageWeight - 5) * 2000;
    }

    // Bulky surcharge
    if (packageSize === 'large_bulky') {
      base += 6000;
    }

    // Priority multiplier
    if (priority === 'High') base = Math.round(base * 1.25);
    if (priority === 'Urgent') base = Math.round(base * 1.5);

    return base;
  }, [destinationMode, selectedStationId, detectedZone, deliveryType, packageWeight, packageSize, priority, pickupStations]);

  // Auto-Generated Estimated Delivery Time SLA
  const estimatedTimeSLA = useMemo(() => {
    if (destinationMode === 'pickup_station') {
      return 'Ready for collection within 24 Hours at selected Hub';
    }

    const isUpcountry = detectedZone.includes('Zone 5') || detectedZone.includes('Zone 6') || detectedZone.includes('Zone 7');

    if (isUpcountry) {
      return '2 - 3 Business Days via Inter-Regional Logistics Express';
    }

    if (deliveryType === 'same_day') {
      return 'Today within 2 - 4 Hours (Dispatched via Nearest Rider)';
    }
    if (deliveryType === 'express') {
      return 'Express Priority: 60 - 90 Minutes Doorstep Dropoff';
    }
    return 'Tomorrow by 5:00 PM (Standard Doorstep SLA)';
  }, [destinationMode, detectedZone, deliveryType]);

  // Restriction / Rule Check Flags
  const restrictionWarnings = useMemo(() => {
    const warnings: string[] = [];
    const isUpcountry = detectedZone.includes('Zone 5') || detectedZone.includes('Zone 6') || detectedZone.includes('Zone 7');

    if (isUpcountry && (deliveryType === 'express' || deliveryType === 'same_day')) {
      warnings.push('Same-day express is not available for Upcountry destinations; inter-hub linehaul routing (2-3 days) will be used.');
    }

    if (packageWeight > 15 && assignmentType === 'manual') {
      const selectedRider = activeRiders.find(r => r.id === selectedRiderId);
      if (selectedRider?.vehicle?.includes('Motorbike') || selectedRider?.vehicle?.includes('Boda-Boda')) {
        warnings.push(`Package weight (${packageWeight} kg) exceeds standard motorcycle capacity (15 kg). Please assign a Bajaj or Delivery Van.`);
      }
    }

    if (paymentStatus === 'COD' && calculatedFee > 200000) {
      warnings.push('High-value Cash on Delivery orders (> TZS 200,000) require advance escrow approval.');
    }

    return warnings;
  }, [detectedZone, deliveryType, packageWeight, assignmentType, selectedRiderId, paymentStatus, calculatedFee, activeRiders]);

  // Auto-select best rider if auto is enabled
  const assignedRider = useMemo(() => {
    if (assignmentType === 'manual') {
      return activeRiders.find(r => r.id === selectedRiderId) || activeRiders[0];
    }
    // Auto find lowest active runs and appropriate vehicle
    if (packageWeight > 15 || packageSize === 'large_bulky') {
      return activeRiders.find(r => r.vehicle?.includes('Van') || r.vehicle?.includes('Bajaj')) || activeRiders[1] || activeRiders[0];
    }
    return activeRiders.find(r => (r.available || r.isOnline) && (r.activeRuns || 0) === 0) || activeRiders[0];
  }, [assignmentType, selectedRiderId, packageWeight, packageSize, activeRiders]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (destinationMode === 'address' && (!recipientName || !recipientPhone || !streetAddress)) {
      alert('Please fill in recipient name, phone, and delivery address.');
      return;
    }

    setIsSubmitting(true);
    const randArr = new Uint32Array(2);
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(randArr);
    } else {
      randArr[0] = Math.floor((window.crypto.getRandomValues(new Uint32Array(1))[0] % 9000000));
      randArr[1] = Math.floor((window.crypto.getRandomValues(new Uint32Array(1))[0] % 900000));
    }
    const waybillNumber = `LM-WB-${1000000 + (randArr[0] % 9000000)}`;
    const otpCode = (100000 + (randArr[1] % 900000)).toString();

    const selectedStation = destinationMode === 'pickup_station' ? PICKUP_STATIONS_LIST.find(s => s.id === selectedStationId) : null;

    const deliveryPayload: any = {
      customer: {
        name: recipientName || (selectedStation ? 'Pickup Customer' : 'Walk-in Customer'),
        email: 'delivery@lumo.co.tz',
        phone: recipientPhone || '+255 700 000 000'
      },
      items: [
        {
          productId: `pkg-${Date.now()}`,
          productName: itemDescription || `Dispatched Package (${itemCategory})`,
          productImage: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500',
          brand: 'LUMO Logistics',
          sellerName: 'LUMO Central Hub Dispatch',
          selectedVariations: { Weight: `${packageWeight}kg`, Size: packageSize },
          quantity: 1,
          unitPrice: 50000,
          totalPrice: 50000
        }
      ],
      deliveryAddress: {
        fullName: recipientName || 'Pickup Customer',
        phone: recipientPhone || '+255 700 000 000',
        region: destinationMode === 'pickup_station' ? selectedStation?.zone || 'Dar es Salaam' : region,
        city: destinationMode === 'pickup_station' ? 'Dar es Salaam' : city,
        area: destinationMode === 'pickup_station' ? selectedStation?.name || 'Pickup Hub' : streetAddress,
        streetAddress: destinationMode === 'pickup_station' ? selectedStation?.address || '' : streetAddress,
        isDefault: false
      },
      deliveryMethod: {
        type: deliveryType,
        name: destinationMode === 'pickup_station' ? `Pickup: ${selectedStation?.name}` : (deliveryType === 'express' ? 'LUMO Express 1-Hour Run' : 'LUMO Standard Delivery'),
        fee: calculatedFee,
        estimatedDelivery: estimatedTimeSLA,
        pickupStationName: selectedStation?.name
      },
      paymentMethod: {
        type: paymentStatus === 'COD' ? 'cod' : 'mobile_money',
        name: paymentStatus === 'COD' ? 'Cash on Delivery' : 'LUMO Escrow Secured',
        status: paymentStatus === 'COD' ? 'Pending on Delivery' : 'Paid (Escrow Secured)'
      },
      pricing: {
        subtotal: 50000,
        deliveryFee: calculatedFee,
        discount: 0,
        escrowFee: 0,
        total: 50000 + calculatedFee
      },
      status: 'Shipped' as OrderStatus
    };

    try {
      const newOrder = placeOrder(deliveryPayload);

      // Create linked delivery run for rider network
      const deliveryRunData = {
        id: `run-${Date.now()}`,
        orderId: newOrder.id,
        orderNumber: newOrder.orderNumber,
        waybillNumber,
        otpCode,
        riderId: assignedRider.id,
        riderName: assignedRider.name,
        riderPhone: assignedRider.phone,
        pickupStation: selectedStation?.name,
        deliveryZone: detectedZone,
        deliveryFee: calculatedFee,
        priority,
        specialInstructions,
        status: 'DISPATCHED',
        createdAt: new Date().toISOString()
      };

      await api.createDeliveryRun(deliveryRunData).catch(err => console.warn('Sync delivery run error:', err));

      setCreatedDelivery({
        order: newOrder,
        run: deliveryRunData
      });

      if (onSuccess) {
        onSuccess(newOrder);
      }
    } catch (err) {
      console.error('Failed to create delivery:', err);
      alert('Failed to dispatch delivery. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden text-xs flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                <span>Create & Dispatch New Delivery</span>
                <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-bold border border-orange-500/30">
                  LUMO Move Engine
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Connected workflow: Seller → Warehouse Picking → Pickup Station → Rider Dispatch → Customer Delivery
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        {!createdDelivery ? (
          <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1">
            
            {/* 1. Delivery Type & Destination Mode Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                <span className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  1. Delivery Service Type & Fulfillment Destination
                </span>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setDestinationMode('address')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      destinationMode === 'address' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Doorstep Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setDestinationMode('pickup_station')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      destinationMode === 'pickup_station' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    LUMO Point Pickup Hub
                  </button>
                </div>
              </div>

              {/* Delivery Service Type Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'express', label: 'Express Rush', desc: '60-90 Min Dropoff', badge: 'High SLA' },
                  { id: 'same_day', label: 'Same-Day', desc: 'Within 2-4 Hours', badge: 'Popular' },
                  { id: 'standard', label: 'Standard Doorstep', desc: 'Next-Day Delivery', badge: 'Economy' },
                  { id: 'pickup', label: 'LUMO Point', desc: 'Station Collection', badge: 'Low Fee' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setDeliveryType(opt.id as any);
                      if (opt.id === 'pickup') setDestinationMode('pickup_station');
                    }}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      deliveryType === opt.id
                        ? 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-slate-900 text-xs">{opt.label}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {opt.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{opt.desc}</p>
                  </button>
                ))}
              </div>

              {/* Destination Form Fields */}
              {destinationMode === 'address' ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Recipient Full Name *</label>
                      <input
                        type="text"
                        required
                        value={recipientName}
                        onChange={e => setRecipientName(e.target.value)}
                        placeholder="e.g. Rashid Mohamed"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Recipient Phone Number (Tanzania) *</label>
                      <input
                        type="tel"
                        required
                        value={recipientPhone}
                        onChange={e => setRecipientPhone(e.target.value)}
                        placeholder="+255 714 000 000"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium font-mono focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Region / City *</label>
                      <select
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold"
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
                      <label className="block font-bold text-slate-700 mb-1">District / Suburb *</label>
                      <input
                        type="text"
                        required
                        value={region}
                        onChange={e => setRegion(e.target.value)}
                        placeholder="e.g. Kinondoni / Sinza"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Street / House No. / Landmark *</label>
                      <input
                        type="text"
                        required
                        value={streetAddress}
                        onChange={e => setStreetAddress(e.target.value)}
                        placeholder="e.g. Shekilango Rd, Plot 42"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-blue-950 mb-1">Customer / Contact Name *</label>
                      <input
                        type="text"
                        required
                        value={recipientName}
                        onChange={e => setRecipientName(e.target.value)}
                        placeholder="e.g. Halima Juma"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-blue-950 mb-1">Pickup Notification SMS Phone *</label>
                      <input
                        type="tel"
                        required
                        value={recipientPhone}
                        onChange={e => setRecipientPhone(e.target.value)}
                        placeholder="+255 754 000 000"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-blue-950 mb-1">Select LUMO Pickup Station *</label>
                    <select
                      value={selectedStationId}
                      onChange={e => setSelectedStationId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white text-slate-900 border border-blue-300 rounded-xl font-bold text-xs focus:ring-2 focus:ring-orange-500"
                    >
                      {pickupStations.map(st => (
                        <option key={st.id} value={st.id} className="text-slate-900 bg-white">
                          {st.name} — {st.address} ({st.hours}) • Fee: TZS {st.fee.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Live Detected Zone & SLA Banner */}
              <div className="p-3 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-inner">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Auto-Determined Spatial Zone</span>
                    <strong className="text-white text-xs font-bold">{detectedZone}</strong>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-right">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Estimated SLA</span>
                    <span className="text-amber-300 font-bold text-xs">{estimatedTimeSLA}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Package Details & Classification */}
            <div className="space-y-3">
              <span className="font-extrabold text-slate-900 text-sm flex items-center gap-2 pb-1 border-b border-slate-200">
                <Package className="w-4 h-4 text-orange-500" />
                2. Package Specifications & Handling Flags
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Package Dimensions / Tier</label>
                  <select
                    value={packageSize}
                    onChange={e => setPackageSize(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-xl font-semibold"
                  >
                    <option value="envelope">Small Envelope / Document (&lt; 1kg)</option>
                    <option value="small_box">Standard Parcel Box (1 - 5kg)</option>
                    <option value="medium_carton">Medium Carton (5 - 15kg)</option>
                    <option value="large_bulky">Large Bulky Freight (&gt; 15kg, Van req.)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Weight (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={packageWeight}
                    onChange={e => setPackageWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Merchandise Category</label>
                  <select
                    value={itemCategory}
                    onChange={e => setItemCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-xl font-semibold"
                  >
                    <option value="Electronics">Electronics & Gadgets</option>
                    <option value="Phones & Tablets">Phones & Accessories</option>
                    <option value="Fashion">Fashion & Apparel</option>
                    <option value="Beauty">Beauty & Cosmetics</option>
                    <option value="Groceries">Groceries & Foodstuffs</option>
                    <option value="Medical">Health & Medical Supplies</option>
                    <option value="General">General Merchandise</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Item Contents / Manifest Summary</label>
                <input
                  type="text"
                  value={itemDescription}
                  onChange={e => setItemDescription(e.target.value)}
                  placeholder="e.g. 1x Samsung Galaxy S24 Ultra Titanium & Charger"
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              {/* Handling Flags */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFragile}
                    onChange={e => setIsFragile(e.target.checked)}
                    className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                  />
                  <span className="font-bold text-slate-700">Fragile / Handle With Care</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPerishable}
                    onChange={e => setIsPerishable(e.target.checked)}
                    className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                  />
                  <span className="font-bold text-slate-700">Perishable / Cold-Chain Priority</span>
                </label>
              </div>
            </div>

            {/* 3. Rider Assignment & Priority Controls */}
            <div className="space-y-3">
              <span className="font-extrabold text-slate-900 text-sm flex items-center gap-2 pb-1 border-b border-slate-200">
                <Zap className="w-4 h-4 text-orange-500" />
                3. Rider Fleet Assignment & Dispatch Priority
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assignment Mode</label>
                  <select
                    value={assignmentType}
                    onChange={e => setAssignmentType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-xl font-semibold"
                  >
                    <option value="auto">⚡ Auto-Assign Nearest Available Rider</option>
                    <option value="manual">Manual Select Specific Rider</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {assignmentType === 'auto' ? 'Calculated Auto-Assigned Courier' : 'Select Fleet Rider'}
                  </label>
                  {assignmentType === 'auto' ? (
                    <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{assignedRider.name} ({assignedRider.vehicle})</span>
                    </div>
                  ) : (
                    <select
                      value={selectedRiderId}
                      onChange={e => setSelectedRiderId(e.target.value)}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-xl font-bold"
                    >
                      {activeRiders.map(r => (
                        <option key={r.id} value={r.id} className="text-slate-900 bg-white">
                          {r.name} — {r.vehicle} ({r.zone}) • {r.activeRuns || 0} active
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dispatch Priority Level</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="Normal">Normal Standard (1.0x)</option>
                    <option value="High">High Priority (+25% Fee)</option>
                    <option value="Urgent">Urgent Priority (+50% Fee)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Rider Delivery Notes & Access Codes</label>
                <textarea
                  rows={2}
                  value={specialInstructions}
                  onChange={e => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. Call 10 mins before arrival. Gate code #4921. Drop at reception if customer is in meeting."
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-xl font-medium"
                />
              </div>
            </div>

            {/* 4. Payment, Fee & Scheduling Matrix */}
            <div className="space-y-3">
              <span className="font-extrabold text-slate-900 text-sm flex items-center gap-2 pb-1 border-b border-slate-200">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                4. Payment Method & Timing Schedule
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment / Escrow Status</label>
                  <select
                    value={paymentStatus}
                    onChange={e => setPaymentStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="PAID_ESCROW">Paid (LUMO Escrow Secured via M-Pesa / Card)</option>
                    <option value="COD">Cash on Delivery (Pay to Rider Upon Inspection)</option>
                    <option value="PAY_AT_STATION">Pay Upon Pickup at Station Hub</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dispatch Timing</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setScheduleType('immediate')}
                      className={`px-3 py-2 rounded-xl border font-bold text-xs transition cursor-pointer ${
                        scheduleType === 'immediate'
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      ⚡ Immediate (ASAP)
                    </button>
                    <button
                      type="button"
                      onClick={() => setScheduleType('scheduled')}
                      className={`px-3 py-2 rounded-xl border font-bold text-xs transition cursor-pointer ${
                        scheduleType === 'scheduled'
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      📅 Scheduled Window
                    </button>
                  </div>
                </div>
              </div>

              {scheduleType === 'scheduled' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Scheduled Delivery Date</label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={e => setScheduledDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Preferred Time Window</label>
                    <select
                      value={scheduledTimeSlot}
                      onChange={e => setScheduledTimeSlot(e.target.value)}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-xl font-semibold focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="08:00 - 12:00 (Morning)">08:00 - 12:00 (Morning)</option>
                      <option value="12:00 - 16:00 (Afternoon)">12:00 - 16:00 (Afternoon)</option>
                      <option value="16:00 - 20:00 (Evening)">16:00 - 20:00 (Evening)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Restriction Warnings Banner */}
              {restrictionWarnings.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl space-y-1 text-amber-900">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Delivery Rule Advisory / Policy Checks:</span>
                  </div>
                  <ul className="list-disc pl-5 text-[11px] space-y-0.5 font-medium">
                    {restrictionWarnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Fee & Calculation Summary Footer Banner */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Auto-Calculated Delivery Fee</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-emerald-400 font-mono">
                    TZS {calculatedFee.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    ({detectedZone} • {priority} Priority)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs shadow-lg shadow-orange-600/30 transition cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Dispatching Run...</span>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Confirm & Dispatch Delivery</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Success Confirmation View */
          <div className="p-8 text-center space-y-6 overflow-y-auto">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center border-4 border-emerald-50 shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900">Delivery Successfully Created & Dispatched!</h3>
              <p className="text-xs text-slate-500">
                The order has entered the active fulfillment pipeline with live notifications sent across all connected roles.
              </p>
            </div>

            {/* Waybill & Rider Card */}
            <div className="max-w-md mx-auto p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Waybill Number</span>
                  <strong className="font-mono text-sm text-orange-600 font-black">{createdDelivery.run.waybillNumber}</strong>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Customer Delivery OTP</span>
                  <strong className="font-mono text-sm bg-slate-900 text-emerald-400 px-2 py-0.5 rounded font-black tracking-widest">
                    {createdDelivery.run.otpCode}
                  </strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Assigned Rider</span>
                  <strong className="text-slate-900">{createdDelivery.run.riderName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Rider Phone</span>
                  <strong className="text-slate-900 font-mono">{createdDelivery.run.riderPhone}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Delivery Zone</span>
                  <strong className="text-slate-900">{createdDelivery.run.deliveryZone}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Calculated Fee</span>
                  <strong className="text-emerald-700 font-mono font-bold">TZS {createdDelivery.run.deliveryFee.toLocaleString()}</strong>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print Waybill Label
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs cursor-pointer shadow-md"
              >
                Done / Back to Operations
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

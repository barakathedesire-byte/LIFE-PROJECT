import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Navigation,
  Phone,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Clock,
  ShieldCheck,
  Package,
  Layers,
  KeyRound,
  RotateCcw
} from 'lucide-react';
import { DeliveryTask } from '../../types';
import { api } from '../../services/api';
import { RiderIncidentModal } from './RiderIncidentModal';
import { useNotification } from '../../context/NotificationContext';

interface RiderActiveDeliveryViewProps {
  task: DeliveryTask;
  onBack: () => void;
  onDeliveryCompleted: (task: DeliveryTask) => void;
  isLight?: boolean;
}

export const RiderActiveDeliveryView: React.FC<RiderActiveDeliveryViewProps> = ({
  task,
  onBack,
  onDeliveryCompleted,
  isLight = false,
}) => {
  const { addNotification } = useNotification();
  // State Machine Step
  // 1: ASSIGNED -> 2: GOING_TO_PICKUP -> 3: ARRIVED_PICKUP -> 4: IN_TRANSIT -> 5: ARRIVED_CUSTOMER -> 6: OTP_VERIFIED -> 7: COMPLETED
  const [currentStep, setCurrentStep] = useState<
    'GOING_TO_PICKUP' | 'ARRIVED_PICKUP' | 'IN_TRANSIT' | 'ARRIVED_CUSTOMER' | 'OTP_VERIFICATION' | 'COMPLETED'
  >(task.status === 'IN_TRANSIT' ? 'IN_TRANSIT' : 'GOING_TO_PICKUP');

  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [recipientName, setRecipientName] = useState(task.customerName || 'Amina Juma');
  const [cashCollectedCheck, setCashCollectedCheck] = useState(false);
  const [hubDeposited, setHubDeposited] = useState(false);
  const [depositingHub, setDepositingHub] = useState(false);
  const isCod = Boolean(task.codAmount && task.codAmount > 0 || task.paymentMethod === 'cod');
  const codAmount = task.codAmount || 85000;

  const handleDepositToHub = async () => {
    try {
      setDepositingHub(true);
      const res = await fetch('/api/delivery/deposit-cod', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: codAmount,
          hubLocation: 'Dar es Salaam Central Hub (Kariakoo)',
          receiptNumber: `HUB-DEP-${Math.floor(100000 + (window.crypto.getRandomValues(new Uint32Array(1))[0] % 900000))}`
        })
      });
      const data = await res.json();
      if (data.success) {
        setHubDeposited(true);
        addNotification({
          title: 'COD Cash Reconciled at Hub',
          message: `TZS ${codAmount.toLocaleString()} deposited at Dar Central Hub. Zero variance recorded.`,
          type: 'PAYMENT',
          link: '/finance'
        });
      }
    } catch {
      setHubDeposited(true);
    } finally {
      setDepositingHub(false);
    }
  };

  // Interactive Leaflet Map Reference
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // Dar es Salaam coordinates
  const pickupCoords = { lat: -6.7725, lng: 39.2458 }; // Mikocheni
  const dropoffCoords = { lat: -6.7865, lng: 39.2592 }; // Kijitonyama
  const riderCoords = { lat: -6.7780, lng: 39.2510 }; // Between

  useEffect(() => {
    // Dynamic Leaflet Map setup if leaflet is available in window or module
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current) return;

      try {
        const L = (await import('leaflet')).default;
        if (!isMounted || !mapContainerRef.current) return;

        // Clean existing
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const map = L.map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: false,
        }).setView([riderCoords.lat, riderCoords.lng], 14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        }).addTo(map);

        // Marker icons
        const riderIcon = L.divIcon({
          className: 'custom-rider-icon',
          html: `<div style="background-color: #059669; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); font-weight: bold; font-size: 16px;">🛵</div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        const pickupIcon = L.divIcon({
          className: 'custom-pickup-icon',
          html: `<div style="background-color: #10B981; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">🏪</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        const dropoffIcon = L.divIcon({
          className: 'custom-dropoff-icon',
          html: `<div style="background-color: #EF4444; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">📍</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        // Add markers
        L.marker([pickupCoords.lat, pickupCoords.lng], { icon: pickupIcon }).addTo(map).bindPopup('<b>Lumo Fresh Supermarket</b><br/>Mikocheni');
        L.marker([dropoffCoords.lat, dropoffCoords.lng], { icon: dropoffIcon }).addTo(map).bindPopup(`<b>${task.customerName || 'Amina Juma'}</b><br/>${task.address || 'Kijitonyama'}`);
        L.marker([riderCoords.lat, riderCoords.lng], { icon: riderIcon }).addTo(map).bindPopup('<b>You (Alex Mwita)</b><br/>En Route');

        // Draw Polyline Route
        const routePoints: [number, number][] = [
          [pickupCoords.lat, pickupCoords.lng],
          [riderCoords.lat, riderCoords.lng],
          [dropoffCoords.lat, dropoffCoords.lng]
        ];

        L.polyline(routePoints, {
          color: '#059669',
          weight: 4,
          dashArray: '6, 8',
          opacity: 0.85
        }).addTo(map);

        mapInstanceRef.current = map;
      } catch (e) {
        console.warn('Map initialization note:', e);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Workflow Handlers
  const handleArrivePickup = async () => {
    setCurrentStep('ARRIVED_PICKUP');
    await api.updateDeliveryTaskStatus(task.id, 'ARRIVED_PICKUP', 'Rider arrived at merchant pickup point.');
  };

  const handleConfirmPickup = async () => {
    setCurrentStep('IN_TRANSIT');
    await api.updateDeliveryTaskStatus(task.id, 'IN_TRANSIT', 'Package picked up from merchant. Out for delivery.');
  };

  const handleArriveCustomer = async () => {
    setCurrentStep('OTP_VERIFICATION');
    await api.updateDeliveryTaskStatus(task.id, 'ARRIVED', 'Rider arrived at customer delivery location.');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput || otpInput.length < 4) {
      setOtpError('Please enter the 4-digit code provided by customer.');
      return;
    }

    setVerifyingOtp(true);
    setOtpError('');

    const triggerDeliverySuccessNotices = () => {
      const orderNumber = task.orderNumber || 'ORD-784512';
      
      // Dispatch notifications across the platform
      addNotification({
        title: `Delivery Completed: Order #${orderNumber}`,
        message: `Rider verified customer security OTP code. Package handoff completed successfully to ${recipientName}.`,
        type: 'DELIVERY',
        orderId: task.id,
        link: '/account/orders',
        targetRoles: ['CUSTOMER']
      });

      addNotification({
        title: `Rider Completed Order #${orderNumber}`,
        message: `Rider successfully completed delivery for Order #${orderNumber}. Customer OTP verified.`,
        type: 'DELIVERY',
        orderId: task.id,
        link: '/operations',
        targetRoles: ['OPERATIONS']
      });

      addNotification({
        title: `Order #${orderNumber} Fulfilled`,
        message: `Delivery successfully completed. Order state updated to DELIVERED.`,
        type: 'DELIVERY',
        orderId: task.id,
        link: '/admin',
        targetRoles: ['ADMIN']
      });

      addNotification({
        title: `Ledger Settled: Order #${orderNumber}`,
        message: `Delivery verification completed. Stocks have been reconciled at Warehouse and ready for financial settlement.`,
        type: 'DELIVERY',
        orderId: task.id,
        link: '/warehouse',
        targetRoles: ['WAREHOUSE']
      });

      addNotification({
        title: `Escrow Released: Order #${orderNumber}`,
        message: `OTP verified and delivery confirmed. Payout has been released to your escrow earnings.`,
        type: 'PAYMENT',
        orderId: task.id,
        link: '/seller',
        targetRoles: ['SELLER']
      });
    };

    try {
      // Test code or customer code
      const codeToVerify = otpInput.trim();
      const res = await api.verifyDeliveryOtp(task.id, codeToVerify, recipientName);

      if (res.success) {
        triggerDeliverySuccessNotices();
        setCurrentStep('COMPLETED');
        if (res.task) {
          onDeliveryCompleted(res.task);
        }
      } else {
        setOtpError(res.error || 'Invalid OTP code. Please confirm with customer or check order details.');
      }
    } catch {
      setOtpError('Invalid OTP code. Please enter valid 4-digit code.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-white'}`}>
      
      {/* Top Header */}
      <div className={`px-4 py-3 border-b flex items-center justify-between sticky top-0 z-30 ${
        isLight ? 'bg-white/95 border-slate-200 backdrop-blur-md' : 'bg-slate-900/95 border-slate-800 backdrop-blur-md'
      }`}>
        <button
          onClick={onBack}
          className={`p-2 rounded-xl border transition-colors ${
            isLight ? 'border-slate-200 text-slate-700 hover:bg-slate-100' : 'border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
            #{task.orderNumber || 'ORD-784512'}
          </span>
          <p className="text-[10px] text-slate-500 font-medium">Live Delivery Trip</p>
        </div>

        <button
          onClick={() => setShowIncidentModal(true)}
          className="p-2 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 transition-colors"
          title="Report Problem"
        >
          <AlertTriangle className="w-5 h-5" />
        </button>
      </div>

      {/* Map Section */}
      <div className="relative w-full h-64 sm:h-72 shrink-0 bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div ref={mapContainerRef} className="w-full h-full" />
        
        {/* Floating Route Banner */}
        <div className="absolute top-3 left-3 right-3 z-10 p-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold">2.4 km • 8 min</p>
              <p className="text-[11px] text-slate-500">Via Bagamoyo Rd / Kijitonyama</p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-extrabold text-xs shadow-sm">
            TZS 8,500
          </span>
        </div>
      </div>

      {/* Main Delivery Workflow Details Container */}
      <div className="flex-1 p-4 space-y-4 pb-28">
        
        {/* State Timeline Stepper */}
        <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-emerald-600 dark:text-emerald-400">Step {
              currentStep === 'GOING_TO_PICKUP' ? '1 of 3: Head to Store' :
              currentStep === 'ARRIVED_PICKUP' ? '2 of 3: Pickup Confirmation' :
              currentStep === 'IN_TRANSIT' ? '3 of 3: En Route to Customer' :
              currentStep === 'OTP_VERIFICATION' ? 'Final: Verify Customer OTP' :
              'Completed'
            }</span>
            <span className="text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> SLA: 28 min
            </span>
          </div>

          {/* Stepper Bar */}
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div className={`h-full bg-emerald-500 transition-all duration-500 ${
              currentStep === 'GOING_TO_PICKUP' ? 'w-1/4' :
              currentStep === 'ARRIVED_PICKUP' ? 'w-2/4' :
              currentStep === 'IN_TRANSIT' ? 'w-3/4' : 'w-full'
            }`} />
          </div>
        </div>

        {/* Customer & Merchant Information Card */}
        <div className={`p-4 rounded-2xl border shadow-sm space-y-3.5 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
          
          {/* Pickup Detail */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/20">
              <Package className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Pickup Merchant</span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Lumo Fresh Supermarket</p>
                  <p className="text-[11px] text-slate-500">Mikocheni Industrial Area, Gate 4</p>
                </div>
                <a
                  href="tel:+255712000111"
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* Delivery Destination Detail */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 mt-0.5 border border-rose-500/20">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-bold text-rose-500 tracking-wider">Customer Destination</span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{task.customerName || 'Amina Juma'}</p>
                  <p className="text-[11px] text-slate-500">{task.address || 'Julius Nyerere Rd, Kijitonyama, Dar es Salaam'}</p>
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                    Notes: Ring the black gate doorbell or call on arrival.
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setShowCallModal(true)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600"
                    title="Call Customer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={`sms:${task.customerPhone || '+255712345678'}`}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600"
                    title="Send SMS"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Package contents summary */}
          <div className={`p-2.5 rounded-xl text-xs space-y-1.5 ${isLight ? 'bg-slate-50' : 'bg-slate-800/50'}`}>
            <div className="flex justify-between font-semibold">
              <span className="text-slate-500">Order Items:</span>
              <span>2 packages (1.4 kg)</span>
            </div>
            <div className="flex justify-between items-center font-semibold">
              <span className="text-slate-500">Payment Collection:</span>
              {isCod ? (
                <span className="bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 font-extrabold px-2 py-0.5 rounded text-[11px] border border-amber-300">
                  💵 COLLECT CASH: TZS {codAmount.toLocaleString()}
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  🛡️ Prepaid via Escrow (No Cash)
                </span>
              )}
            </div>
          </div>

        </div>

        {/* Step-specific Actions and Forms */}
        {currentStep === 'GOING_TO_PICKUP' && (
          <div className="space-y-2.5">
            <button
              onClick={handleArrivePickup}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-sm shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>I Have Arrived at Merchant</span>
            </button>
          </div>
        )}

        {currentStep === 'ARRIVED_PICKUP' && (
          <div className="space-y-3">
            <div className={`p-3 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs space-y-1.5`}>
              <p className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Merchant Package Handover
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                Please collect parcel labeled <b>#{task.orderNumber || 'ORD-784512'}</b> and ensure seals are intact.
              </p>
            </div>

            <button
              onClick={handleConfirmPickup}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-sm shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Package className="w-4 h-4" />
              <span>Confirm Pickup & Start Delivery</span>
            </button>
          </div>
        )}

        {currentStep === 'IN_TRANSIT' && (
          <div className="space-y-2.5">
            <button
              onClick={handleArriveCustomer}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-sm shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <MapPin className="w-4 h-4" />
              <span>Arrived at Customer Doorstep</span>
            </button>
          </div>
        )}

        {currentStep === 'OTP_VERIFICATION' && (
          <div className={`p-4 rounded-2xl border shadow-md space-y-4 ${isLight ? 'bg-white border-emerald-300' : 'bg-slate-900 border-emerald-800'}`}>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20 mb-2">
                <KeyRound className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-extrabold">
                {isCod ? 'Cash Collection & Customer OTP' : 'Enter Customer Escrow OTP'}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Ask <span className="font-bold text-slate-700 dark:text-slate-300">{task.customerName || 'Amina'}</span> for their 4-digit handover code.
              </p>
            </div>

            {/* Cash Handover Confirmation for COD */}
            {isCod && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-300 dark:border-amber-700/60 text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-amber-950 dark:text-amber-200">
                  <span>Physical Cash Checklist</span>
                  <span className="font-mono text-emerald-700 dark:text-emerald-400">TZS {codAmount.toLocaleString()}</span>
                </div>
                <label className="flex items-start gap-2 cursor-pointer text-[11px] text-amber-900 dark:text-amber-300 font-semibold">
                  <input
                    type="checkbox"
                    checked={cashCollectedCheck}
                    onChange={e => setCashCollectedCheck(e.target.checked)}
                    className="mt-0.5 text-emerald-600 rounded"
                  />
                  <span>
                    I confirm that I have received, counted, and verified <b>TZS {codAmount.toLocaleString()}</b> in physical Tanzanian cash from customer.
                  </span>
                </label>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-3">
              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={e => setOtpInput(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="• • • •"
                  className={`w-full py-3 text-center text-2xl tracking-[0.5em] font-extrabold rounded-xl border outline-hidden transition-all ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-500'
                      : 'bg-slate-800 border-slate-700 text-white focus:border-emerald-400'
                  }`}
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Handed Over To</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={e => setRecipientName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border outline-hidden ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-700'
                  }`}
                  placeholder="Recipient Name"
                />
              </div>

              {otpError && (
                <p className="text-xs text-rose-500 font-semibold text-center">{otpError}</p>
              )}



              <button
                type="submit"
                disabled={verifyingOtp || otpInput.length < 4 || (isCod && !cashCollectedCheck)}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-sm shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {verifyingOtp ? (
                  <span>Validating OTP & Logging Cash...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>
                      {isCod ? 'Confirm Cash Handover & Complete Delivery' : 'Verify Code & Complete Delivery'}
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {currentStep === 'COMPLETED' && (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 border-2 border-emerald-500/30 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                Delivery Successfully Completed!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Trip verified and <span className="font-bold text-emerald-600">TZS 8,500</span> delivery fee credited to your wallet balance.
              </p>
            </div>

            {/* COD Cash on Hand Ledger & Hub Deposit Box */}
            {isCod && (
              <div className={`p-4 rounded-2xl border text-left space-y-3 ${isLight ? 'bg-amber-50/70 border-amber-200' : 'bg-slate-900 border-amber-800/60'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-amber-950 dark:text-amber-200">
                    💰 Cash on Hand Held by Rider
                  </span>
                  <span className="font-mono font-bold text-xs text-emerald-700 dark:text-emerald-400">
                    TZS {codAmount.toLocaleString()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  You are holding TZS {codAmount.toLocaleString()} in physical cash for Order #{task.orderNumber}. This is tracked in the LUMO Central Treasury Ledger.
                </p>

                {hubDeposited ? (
                  <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={16} />
                    <span>Reconciled at Dar Central Hub (Zero Variance)</span>
                  </div>
                ) : (
                  <button
                    onClick={handleDepositToHub}
                    disabled={depositingHub}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${depositingHub ? 'animate-spin' : ''}`} />
                    <span>{depositingHub ? 'Reconciling with Hub...' : 'Simulate Hub Deposit & Sign Off'}</span>
                  </button>
                )}
              </div>
            )}

            <button
              onClick={onBack}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/30 cursor-pointer"
            >
              Return to Rider Dashboard
            </button>
          </div>
        )}

      </div>

      {/* Incident Modal */}
      <RiderIncidentModal
        isOpen={showIncidentModal}
        onClose={() => setShowIncidentModal(false)}
        orderNumber={task.orderNumber || 'ORD-784512'}
        taskId={task.id}
        isLight={isLight}
      />

      {/* Call Customer Masked Modal Simulation */}
      {showCallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className={`w-full max-w-xs rounded-2xl p-5 border text-center space-y-3 ${isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'}`}>
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
              <Phone className="w-6 h-6 animate-pulse" />
            </div>
            <h4 className="text-sm font-bold">LUMO Masked Calling</h4>
            <p className="text-xs text-slate-500">
              Calling customer <span className="font-bold">{task.customerName || 'Amina Juma'}</span> via privacy-protected relay:
            </p>
            <p className="text-base font-extrabold font-mono text-emerald-600">
              {task.customerPhone || '+255 712 345 678'}
            </p>
            <div className="flex gap-2 pt-2">
              <a
                href={`tel:${task.customerPhone || '+255712345678'}`}
                className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
              >
                Dial Now
              </a>
              <button
                onClick={() => setShowCallModal(false)}
                className="flex-1 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

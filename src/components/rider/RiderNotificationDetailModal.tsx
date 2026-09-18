import React from 'react';
import { 
  Package, 
  Wallet, 
  ShieldAlert, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle2, 
  ExternalLink, 
  X, 
  Send, 
  Truck, 
  DollarSign, 
  AlertTriangle,
  Navigation,
  Check
} from 'lucide-react';
import { formatTZS } from '../../utils/formatters';

export interface RiderNotificationItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'orders' | 'finance' | 'safety' | 'system';
  time: string;
  unread: boolean;
  orderNumber?: string;
  details?: {
    merchantName?: string;
    pickupAddress?: string;
    deliveryAddress?: string;
    payoutAmount?: number;
    codAmount?: number;
    distanceKm?: number;
    estimatedEarnings?: number;
    itemsSummary?: string;
    customerName?: string;
    customerPhone?: string;
    safetyLevel?: 'HIGH' | 'MEDIUM' | 'INFO';
    affectedZones?: string[];
    actionRequired?: string;
  };
}

interface RiderNotificationDetailModalProps {
  notification: RiderNotificationItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAcceptOrder?: (orderNumber: string) => void;
  onNavigateOrder?: (orderNumber: string) => void;
  onViewWallet?: () => void;
  onMarkRead?: (id: string) => void;
  isLight?: boolean;
}

export const RiderNotificationDetailModal: React.FC<RiderNotificationDetailModalProps> = ({
  notification,
  isOpen,
  onClose,
  onAcceptOrder,
  onNavigateOrder,
  onViewWallet,
  onMarkRead,
  isLight = false,
}) => {
  if (!isOpen || !notification) return null;

  const isOrder = notification.category === 'orders';
  const isFinance = notification.category === 'finance';
  const isSafety = notification.category === 'safety';
  const isSystem = notification.category === 'system';

  const handleAction = () => {
    if (notification.id && onMarkRead) {
      onMarkRead(notification.id);
    }

    if (isOrder) {
      if (onAcceptOrder) {
        onAcceptOrder(notification.orderNumber || 'ORD-784512');
      }
      onClose();
    } else if (isFinance) {
      if (onViewWallet) {
        onViewWallet();
      }
      onClose();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-sm rounded-3xl p-5 border shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 ${
          isLight 
            ? 'bg-white border-slate-200 text-slate-900' 
            : 'bg-slate-900 border-slate-800 text-white'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
              isOrder
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                : isFinance
                ? 'bg-sky-500/10 text-sky-500 border border-sky-500/20'
                : isSafety
                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
            }`}>
              {isOrder && <Package className="w-5 h-5" />}
              {isFinance && <Wallet className="w-5 h-5" />}
              {isSafety && <ShieldAlert className="w-5 h-5" />}
              {isSystem && <Clock className="w-5 h-5" />}
            </div>
            <div>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                isOrder
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : isFinance
                  ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                  : isSafety
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
              }`}>
                {notification.category} NOTICE
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3" /> {notification.time}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title and Main Description */}
        <div className="space-y-1">
          <h3 className="text-base font-extrabold leading-snug">
            {notification.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {notification.subtitle}
          </p>
        </div>

        {/* Dynamic Context Details Panel */}
        {isOrder && (
          <div className={`p-3.5 rounded-2xl border space-y-2.5 text-xs ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
          }`}>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800 font-mono">
              <span className="text-slate-400 text-[11px] font-bold">ORDER REF:</span>
              <span className="font-extrabold text-orange-500 font-mono">#{notification.orderNumber || 'ORD-784512'}</span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">PICKUP MERCHANT</span>
                  <strong className="text-slate-800 dark:text-slate-200">
                    {notification.details?.merchantName || 'Lumo Fresh Supermarket (Mwananyamala)'}
                  </strong>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Navigation className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">DROP-OFF DESTINATION</span>
                  <strong className="text-slate-800 dark:text-slate-200">
                    {notification.details?.deliveryAddress || 'Plot 42, Mbezi Beach, Dar es Salaam'}
                  </strong>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2 text-center">
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Est. Delivery Fee</span>
                <strong className="text-emerald-500 font-mono font-bold text-xs">
                  {formatTZS(notification.details?.estimatedEarnings || 8500)}
                </strong>
              </div>
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">COD Collection</span>
                <strong className="text-orange-400 font-mono font-bold text-xs">
                  {formatTZS(notification.details?.codAmount || 85000)}
                </strong>
              </div>
            </div>
          </div>
        )}

        {isFinance && (
          <div className={`p-3.5 rounded-2xl border space-y-2.5 text-xs ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
          }`}>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 text-[11px] font-bold">CREDITED WALLET</span>
              <span className="font-extrabold text-emerald-500 font-mono text-sm">
                +{formatTZS(notification.details?.payoutAmount || 8500)}
              </span>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>Settlement Source:</span>
                <strong className="text-slate-200 font-mono">Instant Run Escrow Release</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Associated Waybill:</span>
                <strong className="text-orange-400 font-mono">#{notification.orderNumber || 'ORD-784509'}</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Status:</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-bold">
                  Available for Instant Payout
                </span>
              </div>
            </div>
          </div>
        )}

        {isSafety && (
          <div className={`p-3.5 rounded-2xl border space-y-2 text-xs ${
            isLight ? 'bg-amber-50 border-amber-200 text-amber-950' : 'bg-amber-950/30 border-amber-800/60 text-amber-200'
          }`}>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <strong className="font-bold text-xs">Traffic & Operational Advisory</strong>
            </div>
            <p className="text-[11px] leading-relaxed">
              Selander Bridge & Ali Hassan Mwinyi Rd experiencing congestion. Please adjust route via Kawawa / Morocco junction. Surge bonus active.
            </p>
            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400 pt-1">
              <span>Emergency Fleet SOS Line:</span>
              <a href="tel:+255700000000" className="underline font-mono">+255 700 000 000</a>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          {isOrder && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleAction}
                className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition shadow-lg shadow-emerald-600/30 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Truck className="w-4 h-4" />
                View & Accept Order
              </button>
              {notification.details?.customerPhone && (
                <a
                  href={`tel:${notification.details.customerPhone}`}
                  className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white transition border border-slate-700 flex items-center justify-center cursor-pointer"
                  title="Call Customer"
                >
                  <Phone className="w-4 h-4 text-orange-400" />
                </a>
              )}
            </div>
          )}

          {isFinance && (
            <button
              onClick={handleAction}
              className="w-full py-3 px-4 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs transition shadow-lg shadow-sky-600/30 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Wallet className="w-4 h-4" />
              Open Earnings & Wallet
            </button>
          )}

          {isSafety && (
            <button
              onClick={handleAction}
              className="w-full py-3 px-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs transition shadow-lg shadow-amber-600/30 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Acknowledge & Dismiss
            </button>
          )}

          {isSystem && (
            <button
              onClick={handleAction}
              className="w-full py-3 px-4 rounded-2xl bg-slate-700 hover:bg-slate-600 text-white font-extrabold text-xs transition shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Dismiss
            </button>
          )}

          <button
            onClick={onClose}
            className={`w-full py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
              isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

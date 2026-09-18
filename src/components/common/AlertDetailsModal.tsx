import React from 'react';
import { 
  X, 
  MapPin, 
  Navigation, 
  Package, 
  Bell, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  FileText, 
  ExternalLink,
  DollarSign
} from 'lucide-react';

interface AlertDetailsModalProps {
  alert: any;
  isOpen: boolean;
  onClose: () => void;
  onAction?: (actionType: string, alert: any) => void;
  isLight?: boolean;
}

export const AlertDetailsModal: React.FC<AlertDetailsModalProps> = ({
  alert,
  isOpen,
  onClose,
  onAction,
  isLight = false
}) => {
  if (!isOpen || !alert) return null;

  // Determine alert category & type
  const typeLower = (alert.type || alert.title || '').toLowerCase();
  
  const isPickup = typeLower.includes('pickup') || typeLower.includes('vendor');
  const isDelivery = typeLower.includes('express') || typeLower.includes('delivery') || typeLower.includes('customer');
  const isOrderIssue = typeLower.includes('issue') || typeLower.includes('problem') || typeLower.includes('failed');
  const isPayment = typeLower.includes('payment') || typeLower.includes('payout') || typeLower.includes('surge');
  const isOperations = typeLower.includes('operations') || typeLower.includes('support') || typeLower.includes('message');

  // Determine secondary action button text & type
  let secondaryActionLabel = '';
  let secondaryActionType = '';

  if (isPickup) {
    secondaryActionLabel = 'VIEW PICKUP LOCATION';
    secondaryActionType = 'VIEW_PICKUP_LOCATION';
  } else if (isDelivery) {
    secondaryActionLabel = 'GET DIRECTIONS';
    secondaryActionType = 'GET_DIRECTIONS';
  } else if (isOrderIssue) {
    secondaryActionLabel = 'VIEW ORDER';
    secondaryActionType = 'VIEW_ORDER';
  } else if (isPayment) {
    secondaryActionLabel = 'VIEW PAYMENT / TRANSACTION';
    secondaryActionType = 'VIEW_PAYMENT';
  } else if (isOperations) {
    // Spec Item 2: Operations messages must NOT have a navigation option. Only View Details.
    secondaryActionLabel = '';
    secondaryActionType = '';
  } else {
    secondaryActionLabel = '';
    secondaryActionType = '';
  }

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 cursor-pointer"
    >
      <div 
        onClick={e => e.stopPropagation()}
        className={`${isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'} border rounded-2xl w-full max-w-lg p-5 sm:p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200 cursor-default max-h-[90vh] overflow-y-auto`}
      >
        {/* Modal Header */}
        <div className={`flex items-center justify-between pb-4 border-b ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-[#FF6A00] flex items-center justify-center font-bold">
              {isPickup ? <Package size={20} /> : isDelivery ? <Navigation size={20} /> : isOperations ? <Bell size={20} /> : <ShieldAlert size={20} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded border border-orange-500/20">
                  {alert.type || 'Alert Notice'}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock size={11} /> {alert.time || 'Just now'}
                </span>
              </div>
              <h3 className={`font-extrabold text-base mt-0.5 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                {alert.title || 'Dispatch & Operational Notice'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg ${isLight ? 'text-slate-500 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'} transition cursor-pointer`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Alert Metadata */}
        <div className="space-y-4 text-xs">
          <div className={`${isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-300'} p-4 rounded-xl border space-y-3`}>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Message / Notice Body</span>
              <p className="text-sm font-semibold mt-1 leading-relaxed">{alert.message || alert.text || 'No detailed message provided.'}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/60">
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Reference / ID</span>
                <p className="font-mono font-bold text-slate-200 mt-0.5">#{alert.id || 'ORD-10482'}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Priority Status</span>
                <p className="font-bold text-orange-500 mt-0.5">High Priority SLA</p>
              </div>
            </div>

            {(isPickup || isDelivery) && (
              <div className="pt-2 border-t border-slate-800/60 space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase block">Destination / Location Address</span>
                <div className="flex items-start gap-2 text-slate-200 font-medium">
                  <MapPin size={15} className="text-[#FF6A00] shrink-0 mt-0.5" />
                  <span>{isPickup ? 'Kariakoo Market Express Hub, Plot 12, Dar es Salaam' : 'Plot 42, Haile Selassie Rd, Masaki, Dar es Salaam'}</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-xl text-orange-600 dark:text-orange-400 flex items-start gap-2">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              {isOperations 
                ? 'ℹ️ Operations communication from Lumo Dispatch Command. Read and acknowledge instructions.'
                : '⚡ Follow standard Lumo safety guidelines and verify customer OTP upon handover.'}
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
          >
            Close Details
          </button>

          {secondaryActionLabel && secondaryActionType && (
            <button
              onClick={() => {
                onAction?.(secondaryActionType, alert);
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-[#FF6A00] hover:bg-[#e05d00] text-white font-extrabold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <Navigation size={14} />
              <span>{secondaryActionLabel}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

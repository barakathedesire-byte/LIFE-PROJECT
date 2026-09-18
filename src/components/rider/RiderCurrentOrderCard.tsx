import React from 'react';
import { Phone, Navigation, MapPin } from 'lucide-react';
import { DeliveryTask } from '../../types';

interface RiderCurrentOrderCardProps {
  task?: DeliveryTask | null;
  onViewDetails?: (task?: DeliveryTask) => void;
  onStartDelivery?: (task?: DeliveryTask) => void;
  onCallCustomer?: (phone?: string, name?: string) => void;
  onNavigate?: (task?: DeliveryTask) => void;
  onReportProblem?: () => void;
  isLight?: boolean;
}

export const RiderCurrentOrderCard: React.FC<RiderCurrentOrderCardProps> = ({
  task,
  onViewDetails,
  onStartDelivery,
  onCallCustomer,
  onNavigate,
  onReportProblem,
  isLight = false,
}) => {
  // Default values aligned with reference screenshot
  const orderNumber = task?.orderNumber || 'ORD-784512';
  const pickupName = 'Lumo Fresh Supermarket';
  const pickupAddress = 'Mikocheni, Dar es Salaam';
  const dropoffAddress = task?.address || 'Julius Nyerere Rd, Kijitonyama, Dar es Salaam';
  const earnings = task?.codAmount ? Math.min(8500, Math.round(task.codAmount * 0.1)) : 8500;
  const distance = '2.4 km';
  const statusLabel = task?.status === 'IN_TRANSIT' ? 'IN TRANSIT' : 'PICK UP';
  const customerPhone = task?.customerPhone || '+255 712 345 678';
  const customerName = task?.customerName || 'Amina Juma';

  const handleDetailsClick = () => {
    if (onViewDetails) {
      onViewDetails(task || undefined);
    } else if (onStartDelivery) {
      onStartDelivery(task || undefined);
    }
  };

  const handleCallClick = () => {
    if (onCallCustomer) {
      onCallCustomer(customerPhone, customerName);
    } else {
      window.location.href = `tel:${(customerPhone || '').replace(/\s+/g, '')}`;
    }
  };

  const handleNavigateClick = () => {
    if (onNavigate) {
      onNavigate(task || undefined);
    } else if (onStartDelivery) {
      onStartDelivery(task || undefined);
    }
  };

  return (
    <div className="w-full px-4 py-2">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-2">
        <h3
          className={`text-sm font-bold tracking-tight ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}
        >
          Current Order
        </h3>
        <button
          onClick={handleDetailsClick}
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
        >
          View Details
        </button>
      </div>

      {/* Main Order Card */}
      <div
        className={`w-full rounded-2xl p-4 border shadow-sm transition-all duration-200 ${
          isLight
            ? 'bg-white border-slate-200 hover:border-slate-300'
            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
        }`}
      >
        {/* Top Badges Row */}
        <div className="flex items-center justify-between mb-3.5">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs tracking-tight border border-emerald-500/20">
            #{orderNumber}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider border border-amber-500/30">
            {statusLabel}
          </span>
        </div>

        {/* Route Steps (Pickup -> Destination) */}
        <div className="relative pl-6 space-y-4">
          
          {/* Vertical Connecting Line */}
          <div className="absolute left-2.5 top-2 bottom-2 w-0.5 border-l-2 border-dashed border-slate-300 dark:border-slate-700" />

          {/* Pickup Step */}
          <div className="relative">
            <span className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-sm" />
            <div className="flex items-start justify-between">
              <div>
                <p
                  className={`text-xs font-bold leading-none ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {pickupName}
                </p>
                <p
                  className={`text-[11px] mt-1 ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  {pickupAddress}
                </p>
              </div>
            </div>
          </div>

          {/* Destination Step */}
          <div className="relative pt-1">
            <span className="absolute -left-6 top-2 w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-white dark:border-slate-900 shadow-sm" />
            <div className="flex items-start justify-between">
              <div className="max-w-[70%]">
                <p
                  className={`text-xs font-bold leading-tight ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {dropoffAddress}
                </p>
                <p
                  className={`text-[11px] mt-0.5 ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Dar es Salaam
                </p>
              </div>

              {/* Earnings & Distance Pill */}
              <div className="text-right shrink-0">
                <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                  TZS {earnings.toLocaleString()}
                </p>
                <p
                  className={`text-[11px] font-medium mt-0.5 flex items-center justify-end gap-0.5 ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {distance}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-2 gap-2.5 mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80">
          
          {/* Call Customer Button */}
          <button
            onClick={handleCallClick}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all active:scale-95 cursor-pointer ${
              isLight
                ? 'border-slate-200 text-slate-700 hover:bg-slate-50'
                : 'border-slate-700 text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Phone className="w-3.5 h-3.5 text-slate-500" />
            <span>Call Customer</span>
          </button>

          {/* Navigate Button */}
          <button
            onClick={handleNavigateClick}
            className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/25 cursor-pointer transition-all"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Navigate</span>
          </button>

        </div>

      </div>
    </div>
  );
};

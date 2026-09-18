import React from 'react';
import { Star } from 'lucide-react';

interface RiderGreetingCardProps {
  riderName?: string;
  isOnline: boolean;
  onToggleOnline?: () => void;
  onToggleStatus?: () => void;
  todayEarnings?: number;
  completedDeliveries?: number;
  acceptanceRate?: number;
  rating?: number;
  avatarUrl?: string;
  fleetId?: string;
  isLight?: boolean;
}

export const RiderGreetingCard: React.FC<RiderGreetingCardProps> = ({
  riderName = 'Alex',
  isOnline,
  onToggleOnline,
  onToggleStatus,
  todayEarnings = 78500,
  completedDeliveries = 12,
  acceptanceRate = 95,
  rating = 4.8,
  avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
}) => {
  const handleToggle = () => {
    if (onToggleOnline) onToggleOnline();
    if (onToggleStatus) onToggleStatus();
  };
  return (
    <div className="w-full px-4 pt-3 pb-1">
      {/* Main Emerald Gradient Card */}
      <div className="w-full rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-4 shadow-lg shadow-emerald-950/20 relative overflow-hidden">
        
        {/* Subtle Decorative Background Star Glow */}
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        
        {/* Top Profile & Availability Row */}
        <div className="flex items-center justify-between gap-3 relative z-10">
          
          {/* Avatar + Info */}
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-400/80 shadow-md bg-emerald-900">
                <img
                  src={avatarUrl}
                  alt={riderName}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Online Pulse Indicator */}
              {isOnline ? (
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-emerald-900 rounded-full flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                </span>
              ) : (
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-slate-400 border-2 border-emerald-900 rounded-full" />
              )}
            </div>

            <div>
              <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                Good morning, {riderName} <span className="text-lg">👋</span>
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-300'
                  }`}
                />
                <span className="text-xs font-medium text-emerald-100/90">
                  {isOnline ? 'Available for orders' : 'Offline (Not receiving orders)'}
                </span>
              </div>
            </div>
          </div>

          {/* Online Toggle Switch */}
          <button
            onClick={handleToggle}
            className={`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-300 flex items-center shrink-0 cursor-pointer ${
              isOnline ? 'bg-emerald-400' : 'bg-slate-500/80'
            }`}
            aria-label="Toggle Online Status"
            title={isOnline ? 'Go Offline' : 'Go Online'}
          >
            <div
              className={`w-5.5 h-5.5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                isOnline ? 'translate-x-5.5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-emerald-600/50 my-3.5" />

        {/* 4 Bottom Stats Row */}
        <div className="grid grid-cols-4 gap-1 text-center relative z-10">
          
          {/* Today's Earnings */}
          <div className="flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase font-medium text-emerald-200/80 tracking-wider">
              Today's Earnings
            </span>
            <span className="text-xs sm:text-sm font-bold text-white mt-0.5 truncate max-w-full">
              TZS {todayEarnings.toLocaleString()}
            </span>
          </div>

          {/* Deliveries */}
          <div className="flex flex-col items-center justify-center border-l border-emerald-600/40">
            <span className="text-[10px] uppercase font-medium text-emerald-200/80 tracking-wider">
              Deliveries
            </span>
            <span className="text-xs sm:text-sm font-bold text-white mt-0.5">
              {completedDeliveries}
            </span>
          </div>

          {/* Acceptance Rate */}
          <div className="flex flex-col items-center justify-center border-l border-emerald-600/40">
            <span className="text-[10px] uppercase font-medium text-emerald-200/80 tracking-wider">
              Acceptance
            </span>
            <span className="text-xs sm:text-sm font-bold text-white mt-0.5">
              {acceptanceRate}%
            </span>
          </div>

          {/* Rating */}
          <div className="flex flex-col items-center justify-center border-l border-emerald-600/40">
            <span className="text-[10px] uppercase font-medium text-emerald-200/80 tracking-wider">
              Rating
            </span>
            <span className="text-xs sm:text-sm font-bold text-white mt-0.5 flex items-center justify-center gap-0.5">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {rating.toFixed(1)}
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};

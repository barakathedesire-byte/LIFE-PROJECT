import React from 'react';
import { Home, Package, Power, Wallet, User } from 'lucide-react';

interface RiderBottomNavProps {
  activeTab: 'home' | 'orders' | 'earnings' | 'profile' | 'active-delivery' | string;
  onSelectTab?: (tab: 'home' | 'orders' | 'earnings' | 'profile' | string) => void;
  onTabChange?: (tab: string) => void;
  isOnline: boolean;
  onToggleOnline?: () => void;
  activeOrdersCount?: number;
  isLight?: boolean;
}

export const RiderBottomNav: React.FC<RiderBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onTabChange,
  isOnline,
  onToggleOnline,
  activeOrdersCount = 1,
  isLight = false,
}) => {
  const handleTabClick = (tab: 'home' | 'orders' | 'earnings' | 'profile') => {
    if (onSelectTab) onSelectTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  const handleToggle = () => {
    if (onToggleOnline) onToggleOnline();
  };
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto pointer-events-auto">
      {/* Navigation Bar Body */}
      <div
        className={`w-full px-4 pt-2 pb-5 border-t shadow-2xl flex items-center justify-between relative transition-colors duration-200 ${
          isLight
            ? 'bg-white/95 backdrop-blur-md border-slate-200 text-slate-600'
            : 'bg-slate-900/95 backdrop-blur-md border-slate-800 text-slate-400'
        }`}
      >
        {/* 1. Home Tab */}
        <button
          onClick={() => handleTabClick('home')}
          className={`flex flex-col items-center justify-center py-1 px-3 transition-colors active:scale-95 cursor-pointer ${
            activeTab === 'home'
              ? 'text-emerald-600 dark:text-emerald-400'
              : isLight
              ? 'hover:text-slate-900 text-slate-500'
              : 'hover:text-slate-200 text-slate-400'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] font-bold mt-1 tracking-tight">Home</span>
        </button>

        {/* 2. Orders Tab */}
        <button
          onClick={() => handleTabClick('orders')}
          className={`flex flex-col items-center justify-center py-1 px-3 relative transition-colors active:scale-95 cursor-pointer ${
            activeTab === 'orders'
              ? 'text-emerald-600 dark:text-emerald-400'
              : isLight
              ? 'hover:text-slate-900 text-slate-500'
              : 'hover:text-slate-200 text-slate-400'
          }`}
        >
          <div className="relative">
            <Package className={`w-5 h-5 ${activeTab === 'orders' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            {activeOrdersCount > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
                {activeOrdersCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold mt-1 tracking-tight">Orders</span>
        </button>

        {/* 3. Center Elevated Go Online / Go Offline Button */}
        <div className="relative -top-5 flex flex-col items-center justify-center">
          <button
            onClick={handleToggle}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform active:scale-90 cursor-pointer ${
              isOnline
                ? 'bg-emerald-600 text-white shadow-emerald-600/40 ring-4 ring-emerald-500/20 hover:bg-emerald-500'
                : 'bg-slate-700 text-slate-300 shadow-slate-900/40 ring-4 ring-slate-600/20 hover:bg-slate-600'
            }`}
            aria-label={isOnline ? 'Go Offline' : 'Go Online'}
          >
            <Power className="w-6 h-6 stroke-[2.5]" />
          </button>
          <span
            className={`text-[9px] font-extrabold uppercase tracking-wider mt-1 ${
              isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
            }`}
          >
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* 4. Earnings Tab */}
        <button
          onClick={() => handleTabClick('earnings')}
          className={`flex flex-col items-center justify-center py-1 px-3 transition-colors active:scale-95 cursor-pointer ${
            activeTab === 'earnings'
              ? 'text-emerald-600 dark:text-emerald-400'
              : isLight
              ? 'hover:text-slate-900 text-slate-500'
              : 'hover:text-slate-200 text-slate-400'
          }`}
        >
          <Wallet className={`w-5 h-5 ${activeTab === 'earnings' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] font-bold mt-1 tracking-tight">Earnings</span>
        </button>

        {/* 5. Profile Tab */}
        <button
          onClick={() => handleTabClick('profile')}
          className={`flex flex-col items-center justify-center py-1 px-3 transition-colors active:scale-95 cursor-pointer ${
            activeTab === 'profile'
              ? 'text-emerald-600 dark:text-emerald-400'
              : isLight
              ? 'hover:text-slate-900 text-slate-500'
              : 'hover:text-slate-200 text-slate-400'
          }`}
        >
          <User className={`w-5 h-5 ${activeTab === 'profile' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] font-bold mt-1 tracking-tight">Profile</span>
        </button>
      </div>

      {/* iOS Home Indicator Pill */}
      <div className={`w-full py-1 flex justify-center ${isLight ? 'bg-white' : 'bg-slate-900'}`}>
        <div className={`w-32 h-1 rounded-full ${isLight ? 'bg-slate-300' : 'bg-slate-700'}`} />
      </div>
    </div>
  );
};

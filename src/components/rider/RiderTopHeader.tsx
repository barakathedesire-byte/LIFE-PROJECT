import React from 'react';
import { Menu, Bell, Wifi, Battery, Signal } from 'lucide-react';
import { LumoStarIcon } from '../common/LumoStarIcon';
import { UserAccountNavDropdown } from '../common/UserAccountNavDropdown';

interface RiderTopHeaderProps {
  isOnline?: boolean;
  unreadCount?: number;
  onOpenMenu: () => void;
  onOpenNotifications: () => void;
  isLight?: boolean;
}

export const RiderTopHeader: React.FC<RiderTopHeaderProps> = ({
  unreadCount = 3,
  onOpenMenu,
  onOpenNotifications,
  isLight = false,
}) => {
  return (
    <header className="w-full shrink-0 select-none">
      {/* iOS Status Bar Simulation */}
      <div className={`px-5 pt-3 pb-1 flex items-center justify-between text-xs font-semibold ${
        isLight ? 'text-slate-800' : 'text-slate-200'
      }`}>
        <span className="tracking-tight font-medium">9:41</span>
        <div className="flex items-center gap-1.5">
          <Signal className="w-3.5 h-3.5" />
          <Wifi className="w-3.5 h-3.5" />
          <div className="flex items-center gap-0.5">
            <Battery className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className={`px-4 py-2.5 flex items-center justify-between border-b ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        {/* Menu Hamburger */}
        <button
          onClick={onOpenMenu}
          className={`p-2 rounded-xl transition-colors active:scale-95 ${
            isLight
              ? 'hover:bg-slate-100 text-slate-700'
              : 'hover:bg-slate-800 text-slate-200'
          }`}
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* LUMO Brand Center Logo */}
        <div className="flex items-center gap-1.5 cursor-pointer select-none">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-600/30">
            <LumoStarIcon size={20} color="#FFFFFF" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-emerald-600 dark:text-emerald-400">
            LUMO
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 ml-0.5">
            Rider
          </span>
        </div>

        {/* Right Controls: Notifications & Account Dropdown */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenNotifications}
            className={`p-2 rounded-xl relative transition-colors active:scale-95 ${
              isLight
                ? 'hover:bg-slate-100 text-slate-700'
                : 'hover:bg-slate-800 text-slate-200'
            }`}
            aria-label="View Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>
          <UserAccountNavDropdown variant={isLight ? 'light' : 'dark'} compact />
        </div>
      </div>
    </header>
  );
};

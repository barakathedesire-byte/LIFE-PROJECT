import React from 'react';
import {
  X,
  User,
  Package,
  Wallet,
  TrendingUp,
  Headphones,
  ShieldCheck,
  MapPin,
  Moon,
  Sun,
  Globe,
  LogOut,
  ExternalLink,
  ChevronRight,
  Truck,
  Building,
  Store,
  Layers,
  ShoppingBag
} from 'lucide-react';
import { LumoStarIcon } from '../common/LumoStarIcon';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface RiderMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: any) => void;
  isLight: boolean;
  onToggleTheme?: () => void;
}

export const RiderMenuDrawer: React.FC<RiderMenuDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  isLight,
  onToggleTheme,
}) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  if (!isOpen) return null;

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out of your Lumo Rider session?')) {
      logout();
      onClose();
      navigate('/login', { replace: true });
    }
  };

  const menuSections = [
    {
      title: 'Operations & Deliveries',
      items: [
        { id: 'home', label: 'Rider Dashboard', icon: Package },
        { id: 'orders', label: 'Delivery Requests & History', icon: Truck },
        { id: 'active_delivery', label: 'Active Delivery Navigation', icon: MapPin },
        { id: 'wallet', label: 'Earnings & Payout Wallet', icon: Wallet },
        { id: 'performance', label: 'Lumo Pulse Performance', icon: TrendingUp },
      ]
    },
    {
      title: 'Account & Safety',
      items: [
        { id: 'profile', label: 'KYC & Vehicle Profile', icon: ShieldCheck },
        { id: 'support', label: 'Safety & Dispatch Support', icon: Headphones },
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Body */}
      <div
        className={`relative w-4/5 max-w-xs h-full shadow-2xl z-10 flex flex-col justify-between p-5 overflow-y-auto transition-colors ${
          isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'
        }`}
      >
        {/* Top Header & Rider Badge */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-md">
                <LumoStarIcon size={18} color="#FFFFFF" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-emerald-600 dark:text-emerald-400">
                LUMO
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Rider Quick Card */}
          <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700'
          }`}>
            <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-emerald-500 shrink-0">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                alt="Alex"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-extrabold truncate">Alex Mwita</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                Diamond Star Rider • Active
              </p>
            </div>
          </div>

          {/* Nav Items */}
          <div className="space-y-4 pt-2">
            {menuSections.map((sec, idx) => (
              <div key={idx} className="space-y-1.5">
                <h4 className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider px-2">
                  {sec.title}
                </h4>

                <div className="space-y-1">
                  {sec.items.map((item: any, i) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          if (item.route) {
                            navigate(item.route);
                          } else if (onNavigateTab) {
                            onNavigateTab(item.id);
                          }
                          onClose();
                        }}
                        className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                          isLight
                            ? 'text-slate-700 hover:bg-slate-100 hover:text-emerald-600'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-emerald-400'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-emerald-500" />
                          <span>{item.label}</span>
                        </div>
                        {item.route ? (
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions: Theme Toggle + Language + App Version */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Appearance</span>
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-xl border flex items-center gap-1.5 font-bold ${
                isLight ? 'border-slate-200 bg-slate-100 text-slate-700' : 'border-slate-700 bg-slate-800 text-slate-300'
              }`}
            >
              {isLight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
              <span>{isLight ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>LUMO Rider v3.4.2</span>
            <span>Dar es Salaam Fleet</span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-3 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout of Rider Session
          </button>
        </div>

      </div>
    </div>
  );
};

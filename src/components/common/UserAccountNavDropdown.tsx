import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  LogOut, 
  ShieldCheck, 
  ChevronDown, 
  Store, 
  ExternalLink, 
  HelpCircle, 
  Settings,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { getRoleDisplayName } from './ProtectedRoute';

export interface UserAccountNavDropdownProps {
  variant?: 'light' | 'dark' | 'glass';
  compact?: boolean;
  className?: string;
  showRoleBadge?: boolean;
  customTitle?: string;
  customSubtitle?: string;
  align?: 'left' | 'right';
  badgeColor?: string;
}

export const UserAccountNavDropdown: React.FC<UserAccountNavDropdownProps> = ({
  variant = 'light',
  compact = false,
  className = '',
  showRoleBadge = true,
  customTitle,
  customSubtitle,
  align = 'right',
  badgeColor
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, currentAccount, logout } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const displayName = customTitle || user?.name || currentAccount?.name || 'Lumo User';
  const displayEmail = user?.email || currentAccount?.email || 'user@lumo.co.tz';
  const role = currentAccount?.role || user?.role || 'CUSTOMER';
  const roleTitle = getRoleDisplayName(role);
  const isVerified = currentAccount?.isVerified !== false;

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'LU';

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    showToast('You have been safely signed out.', 'info');
    navigate('/login', { replace: true });
  };

  const isDark = variant === 'dark';

  // Role accent colors for avatar
  const getRoleAvatarStyle = () => {
    switch (role) {
      case 'SUPER_ADMIN':
      case 'ADMIN':
        return 'bg-gradient-to-tr from-purple-700 to-indigo-600 text-white shadow-purple-500/20';
      case 'SELLER':
      case 'SELLER_STAFF':
        return 'bg-gradient-to-tr from-amber-600 to-orange-500 text-white shadow-orange-500/20';
      case 'OPERATIONS_ADMIN':
        return 'bg-gradient-to-tr from-orange-600 to-red-500 text-white shadow-orange-500/20';
      case 'WAREHOUSE_MANAGER':
      case 'WAREHOUSE_STAFF':
        return 'bg-gradient-to-tr from-teal-600 to-emerald-600 text-white shadow-teal-500/20';
      case 'DELIVERY_AGENT':
        return 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-500/20';
      case 'PICKUP_STATION_MANAGER':
      case 'PICKUP_STATION_STAFF':
        return 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-cyan-500/20';
      case 'SALESPERSON':
        return 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-blue-500/20';
      case 'FINANCE_ADMIN':
      case 'FINANCE_OFFICER':
      case 'ACCOUNTING_STAFF':
        return 'bg-gradient-to-tr from-purple-800 to-violet-600 text-white shadow-purple-500/20';
      case 'CUSTOMER_SUPPORT':
      case 'CUSTOMER_CARE':
        return 'bg-gradient-to-tr from-sky-600 to-blue-500 text-white shadow-sky-500/20';
      case 'MODERATOR':
      case 'CONTENT_MODERATOR':
        return 'bg-gradient-to-tr from-slate-700 to-slate-900 text-white shadow-slate-500/20';
      default:
        return 'bg-gradient-to-tr from-[#FF6A00] to-amber-500 text-white shadow-orange-500/20';
    }
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        id="user-account-nav-dropdown-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`flex items-center gap-2.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl transition-all duration-150 cursor-pointer select-none ${
          isDark 
            ? 'hover:bg-slate-800/80 text-slate-200 border border-slate-700/60' 
            : 'hover:bg-slate-100/90 text-slate-800 border border-slate-200/80 shadow-2xs'
        } ${isOpen ? (isDark ? 'bg-slate-800 ring-2 ring-purple-500/30' : 'bg-slate-100 ring-2 ring-[#FF6A00]/20') : ''}`}
      >
        {/* Avatar Circle */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs shadow-sm shrink-0 ${getRoleAvatarStyle()}`}>
          {initials}
        </div>

        {/* Text Details (hidden in compact mode) */}
        {!compact && (
          <div className="hidden md:block text-left max-w-[130px] lg:max-w-[170px] truncate">
            <div className={`text-xs font-bold leading-tight truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {displayName}
            </div>
            <div className={`text-[10px] font-semibold leading-tight truncate flex items-center gap-1 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              {customSubtitle || roleTitle}
            </div>
          </div>
        )}

        <ChevronDown 
          className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          } ${isDark ? 'text-slate-400' : 'text-slate-500'}`} 
        />
      </button>

      {/* Animated Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute z-50 mt-2 w-64 rounded-2xl shadow-2xl border p-2 text-xs origin-top focus:outline-none ${
              align === 'left' ? 'left-0' : 'right-0'
            } ${
              isDark 
                ? 'bg-slate-900 border-slate-700 text-slate-200 shadow-black/60' 
                : 'bg-white border-slate-200 text-slate-800 shadow-slate-300/50'
            }`}
          >
            {/* User Account Header */}
            <div className={`p-3 rounded-xl mb-1.5 ${isDark ? 'bg-slate-800/80 border border-slate-700/60' : 'bg-slate-50 border border-slate-100'}`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${getRoleAvatarStyle()}`}>
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`font-bold text-xs truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {displayName}
                  </p>
                  <p className={`text-[11px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {displayEmail}
                  </p>
                </div>
              </div>

              {/* Status and Role Pill */}
              <div className="mt-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wide ${
                  isDark ? 'bg-purple-900/60 text-purple-300 border border-purple-700/50' : 'bg-orange-100 text-[#FF6A00] border border-orange-200'
                }`}>
                  {role.replace(/_/g, ' ')}
                </span>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                  isVerified ? 'text-emerald-500' : 'text-amber-500'
                }`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isVerified ? 'Verified Account' : 'Verification Pending'}</span>
                </span>
              </div>
            </div>

            {/* Navigation Options - ONLY shown for BUYER / CUSTOMER accounts */}
            {role === 'CUSTOMER' && (
              <div className="space-y-0.5">
                <Link
                  to="/account"
                  onClick={() => setIsOpen(false)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition cursor-pointer ${
                    isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>My Profile & Preferences</span>
                </Link>

                <Link
                  to="/"
                  onClick={() => setIsOpen(false)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition cursor-pointer ${
                    isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <Store className="w-4 h-4 text-slate-400" />
                  <span>View LUMO Marketplace</span>
                </Link>
              </div>
            )}

            {/* Logout Action */}
            <div className={`mt-1.5 pt-1.5 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <button
                type="button"
                id="user-account-logout-btn"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer text-left"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

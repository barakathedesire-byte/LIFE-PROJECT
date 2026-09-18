import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag,
  Heart,
  User,
  HelpCircle,
  Menu,
  X,
  MapPin,
  ChevronDown,
  ShieldCheck,
  Zap,
  Flame,
  Tag,
  Truck,
  Sparkles,
  Award,
  MessageSquare,
  LogOut,
  Package,
  Calendar,
  Store,
  ArrowRight,
  Bell,
  Coins,
  TrendingUp,
  Layers,
  Compass,
  Building2,
  Navigation,
  Radio,
  Home,
  Smartphone,
  Tv,
  Shirt,
  Monitor,
  Dumbbell,
  Star,
  ChevronRight,
} from 'lucide-react';
import { LumoLogo } from './LumoLogo';
import { SearchBar } from './SearchBar';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useNotification } from '../../context/NotificationContext';
import { useCurrency } from '../../context/CurrencyContext';
import { CurrencyCode, CURRENCY_RATES } from '../../utils/formatters';
import { useCatalog } from '../../hooks/useCatalog';
import { getRoleDashboardRoute, getRoleDisplayName } from './ProtectedRoute';

import { usePlatformConfig } from '../../context/PlatformConfigContext';

export const Header: React.FC = () => {
  const { catalogProducts, catalogCategories, catalogBrands } = useCatalog();

  const { cartCount, subtotal } = useCart();
  const { wishlist } = useWishlist();
  const { user, isAuthenticated, logout } = useAuth();
  const { openChatWithSeller } = useChat();
  const { showToast, notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const { currency, setCurrency, formatCurrency } = useCurrency();

  const {
    desktopSidebarOpen,
    toggleDesktopSidebar,
    setDesktopSidebarOpen
  } = usePlatformConfig();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Dar es Salaam');

  const navigate = useNavigate();
  const location = useLocation();

  const cities = [
    'Dar es Salaam',
    'Arusha',
    'Mwanza',
    'Dodoma',
    'Zanzibar (Stone Town)',
    'Mbeya',
    'Morogoro',
  ];

  const requestNotificationPermission = async () => {
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          showToast('Push notifications enabled successfully!', 'success');
        } else {
          showToast('Push notifications were denied.', 'error');
        }
      } else {
        showToast('Push notifications are not supported in this browser.', 'error');
      }
    } catch (error) {
      showToast('Error enabling notifications.', 'error');
    }
  };

  const hiddenNavPaths = [
    '/checkout', 
    '/cart', 
    '/login', 
    '/register', 
    '/vendor/register', 
    '/sell-on-lumo', 
    '/rider/register',
    '/become-rider',
    '/sales/register',
    '/become-lumoforce',
    '/pickup/register',
    '/become-pickup-point',
    '/seller-education'
  ];
  const isSignUpPage = 
    location.pathname.includes('/register') || 
    location.pathname.includes('/signup') || 
    location.pathname.includes('/sign-up') ||
    location.pathname === '/sell-on-lumo' ||
    location.pathname === '/become-rider' ||
    location.pathname === '/become-lumoforce' ||
    location.pathname === '/become-pickup-point';
  const isSignInPage = 
    location.pathname.includes('/login') || 
    location.pathname.includes('/signin') || 
    location.pathname.includes('/sign-in');
  const isAuthPage = isSignUpPage || isSignInPage;
  const isSecondaryNavHidden = isAuthPage || hiddenNavPaths.includes(location.pathname) || location.pathname.startsWith('/account');

  return (
    <header className="sticky top-0 z-40 bg-white shadow-xs">
      {/* 1. TOP UTILITY BAR */}
      <div className="bg-[#0B132B] text-neutral-300 text-[11px] border-b border-neutral-800">
        <div className="w-full px-3 sm:px-6 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Escrow Guarantee Pill */}
            <div className="flex items-center gap-1 text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/40">
              <ShieldCheck size={12} />
              <span className="font-medium pr-0 text-[7px]">100% LUMO Escrow Protected</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-neutral-300">
            {/* Currency Converter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                className="flex items-center gap-1 font-bold text-neutral-200 hover:text-white bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 transition cursor-pointer text-xs"
                title="Change Platform Currency"
              >
                <Coins size={13} className="text-[#FF6A00]" />
                <span>{currency}</span>
                <ChevronDown size={11} />
              </button>

              <AnimatePresence>
                {currencyDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.95 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="absolute top-full right-0 mt-1 bg-white text-neutral-900 rounded-2xl shadow-xl border border-neutral-200 py-2 w-48 z-50 origin-top-right"
                  >
                    <div className="px-3 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      Select Currency
                    </div>
                    {(Object.keys(CURRENCY_RATES) as CurrencyCode[]).map((code) => {
                      const item = CURRENCY_RATES[code];
                      const isSelected = currency === code;
                      return (
                        <button
                          key={code}
                          onClick={() => {
                            setCurrency(code);
                            setCurrencyDropdownOpen(false);
                            showToast(`Currency changed to ${code}`, 'info');
                          }}
                          className={`w-full text-left px-3 py-1.5 text-xs hover:bg-orange-50 hover:text-[#FF6A00] transition flex items-center justify-between cursor-pointer ${
                            isSelected ? 'font-bold text-[#FF6A00] bg-orange-50/70' : ''
                          }`}
                        >
                          <span>{item.label}</span>
                          <span className="font-mono font-bold text-neutral-400">{item.symbol.trim()}</span>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER BAR */}
      <div className="bg-white border-b border-neutral-200">
        <div className="w-full px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-6">
          {/* Mobile/Desktop menu toggle & Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            {!isAuthPage && (
              <button
                onClick={() => {
                  if (window.innerWidth >= 1024) {
                    toggleDesktopSidebar();
                  } else {
                    setMobileMenuOpen(!mobileMenuOpen);
                  }
                }}
                className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-700 cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen || (window.innerWidth >= 1024 && desktopSidebarOpen) ? <X size={22} /> : <Menu size={22} />}
              </button>
            )}

            {/* LUMO BRAND LOGO */}
            <Link to="/" className="flex items-center">
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <LumoLogo size="md" variant="dark" />
              </motion.div>
            </Link>
          </div>

          {/* Prominent Search Bar (Desktop / Tablet) - Hidden on all Sign In / Sign Up pages */}
          {!isAuthPage && (
            <div className="flex-1 max-w-2xl hidden md:block">
              <SearchBar />
            </div>
          )}

          {/* Right Action Icons */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            {/* Direct Sign In button on Sign Up pages */}
            {isSignUpPage && !isAuthenticated && (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#FF6A00] font-bold text-xs rounded-xl border border-orange-200 transition"
              >
                <User size={14} />
                <span>Sign In</span>
              </Link>
            )}

            {/* Account Menu */}
            <div className="relative">
              <button
                onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                className="flex items-center gap-1.5 p-2 rounded-xl hover:bg-neutral-100 text-neutral-700 transition cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-orange-50 border border-orange-200/80 flex items-center justify-center text-[#FF6A00]">
                  <User size={18} />
                </div>
                <div className="text-left hidden lg:block">
                  <div className="text-[10px] text-neutral-500 font-medium">
                    {isAuthenticated ? 'Habari,' : 'Welcome'}
                  </div>
                  <div className="text-xs font-bold text-neutral-900 flex items-center gap-0.5">
                    <span className="truncate max-w-[90px]">
                      {isAuthenticated ? user?.name?.split(' ')[0] || 'User' : 'Sign In / Account'}
                    </span>
                    <ChevronDown size={12} />
                  </div>
                </div>
              </button>

              <AnimatePresence>
                {accountDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    onMouseLeave={() => setAccountDropdownOpen(false)}
                    className="absolute right-0 top-full mt-1 w-56 bg-white rounded-2xl shadow-2xl border border-neutral-200 py-2 z-50 text-xs origin-top-right"
                  >
                    {isAuthenticated ? (
                      <div className="px-4 py-2 border-b border-neutral-100">
                        <p className="font-bold text-neutral-900 text-sm truncate">{user?.name}</p>
                        <p className="text-[11px] text-neutral-500 truncate">{user?.email}</p>
                      </div>
                    ) : (
                      <div className="p-3 border-b border-neutral-100">
                        <Link
                          to="/login"
                          onClick={() => setAccountDropdownOpen(false)}
                          className="block w-full py-2 text-center bg-[#FF6A00] hover:bg-[#E55E00] text-white font-bold rounded-xl transition shadow-xs"
                        >
                          Sign In / Register
                        </Link>
                      </div>
                    )}

                    <div className="py-1">
                      <Link
                        to="/account"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-neutral-50 text-neutral-700 font-medium"
                      >
                        <User size={15} />
                        <span>My Account Overview</span>
                      </Link>
                      <Link
                        to="/account/orders"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-neutral-50 text-neutral-700 font-medium"
                      >
                        <Package size={15} />
                        <span>My Orders</span>
                      </Link>
                      <Link
                        to="/wishlist"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-neutral-50 text-neutral-700 font-medium"
                      >
                        <Heart size={15} />
                        <span>Saved Wishlist ({wishlist.length})</span>
                      </Link>
                    </div>

                    {isAuthenticated && user && user.role !== 'CUSTOMER' && (
                      <div className="border-t border-neutral-100 py-1 bg-amber-50/50">
                        <Link
                          to={getRoleDashboardRoute(user.role)}
                          onClick={() => setAccountDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-amber-100 text-amber-900 font-bold text-xs"
                        >
                          <ShieldCheck size={15} className="text-amber-600" />
                          <span>{getRoleDisplayName(user.role)}</span>
                        </Link>
                      </div>
                    )}

                    {isAuthenticated && (
                      <div className="border-t border-neutral-100 pt-1">
                        <button
                          onClick={() => {
                            logout();
                            setAccountDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 hover:bg-orange-50 text-[#FF6A00] font-semibold cursor-pointer"
                        >
                          <LogOut size={15} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications Button - Hidden on sign in or sign up pages */}
            {!isAuthPage && (
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 rounded-xl hover:bg-neutral-100 text-neutral-700 transition flex items-center gap-1.5 cursor-pointer"
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <>
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#FF6A00] animate-ping border border-white"></span>
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#FF6A00] text-white text-[9px] font-black flex items-center justify-center border border-white"></span>
                    </>
                  )}
                </button>
                
                <AnimatePresence>
                  {notificationsOpen && (
                    <>
                      {/* Tap-out backdrop to collapse popup */}
                      <div 
                        className="fixed inset-0 z-40 bg-black/5" 
                        onClick={() => setNotificationsOpen(false)} 
                      />

                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-neutral-200 z-50 overflow-hidden origin-top-right"
                      >
                        <div className="p-3.5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-neutral-900">Notifications</h3>
                            {unreadCount > 0 && (
                              <span className="bg-[#FF6A00] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                                {unreadCount} New
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                              <button
                                onClick={() => markAllAsRead()}
                                className="text-[10px] font-bold text-neutral-500 hover:text-neutral-800 cursor-pointer"
                              >
                                Mark All Read
                              </button>
                            )}
                            <button 
                              onClick={requestNotificationPermission}
                              className="text-[10px] font-bold text-[#FF6A00] hover:underline cursor-pointer"
                            >
                              Enable Push
                            </button>
                          </div>
                        </div>

                        <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100">
                          {notifications && notifications.length > 0 ? (
                            notifications.map((notif) => (
                              <div
                                key={notif.id}
                                onClick={() => {
                                  markAsRead(notif.id);
                                  setNotificationsOpen(false);
                                  if (notif.link) {
                                    navigate(notif.link);
                                  } else if (notif.orderId) {
                                    navigate('/account/orders');
                                  }
                                }}
                                className={`p-3.5 hover:bg-orange-50/60 transition cursor-pointer flex items-start gap-3 ${
                                  !notif.isRead ? 'bg-orange-50/30' : 'bg-white'
                                }`}
                              >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                  notif.type === 'PICKUP' ? 'bg-teal-100 text-teal-700' :
                                  notif.type === 'DELIVERY' ? 'bg-blue-100 text-blue-700' :
                                  notif.type === 'PAYMENT' ? 'bg-emerald-100 text-emerald-700' :
                                  'bg-orange-100 text-[#FF6A00]'
                                }`}>
                                  {notif.type === 'PICKUP' ? <MapPin size={15} /> :
                                   notif.type === 'DELIVERY' ? <Truck size={15} /> :
                                   notif.type === 'PAYMENT' ? <Coins size={15} /> :
                                   <Package size={15} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1 mb-0.5">
                                    <p className={`text-xs font-bold truncate ${!notif.isRead ? 'text-neutral-900' : 'text-neutral-700'}`}>
                                      {notif.title}
                                    </p>
                                    {!notif.isRead && (
                                      <span className="w-2 h-2 rounded-full bg-[#FF6A00] shrink-0"></span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-neutral-600 line-clamp-2 leading-snug">
                                    {notif.message}
                                  </p>
                                  <div className="mt-1 flex items-center justify-between text-[10px] text-neutral-400">
                                    <span>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    <span className="text-[#FF6A00] font-bold group-hover:underline flex items-center gap-0.5">
                                      Tap to open details <ArrowRight size={10} />
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-8 text-center text-neutral-400 text-xs">
                              <Bell size={24} className="mx-auto mb-2 opacity-40" />
                              No notifications yet.
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Wishlist Button - Hidden on sign in / sign up pages */}
            {!isAuthPage && (
              <Link
                to="/wishlist"
                className="relative p-2 rounded-xl hover:bg-neutral-100 text-neutral-700 transition flex items-center gap-1.5"
                aria-label="Wishlist"
              >
                <Heart size={20} />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#FF6A00] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {wishlist.length}
                  </span>
                )}
                <span className="hidden xl:inline text-xs font-semibold">Wishlist</span>
              </Link>
            )}

            {/* Cart Button - Hidden on sign in / sign up pages */}
            {!isAuthPage && (
              <Link
                to="/cart"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100/80 border border-orange-200/80 text-orange-950 transition relative"
              >
                <div className="relative">
                  <ShoppingBag size={21} className="text-[#FF6A00]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-[#FF6A00] text-white text-[11px] font-black flex items-center justify-center shadow-sm animate-pulse">
                      {cartCount}
                    </span>
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-[10px] text-[#FF6A00] font-bold uppercase tracking-wider">Cart</div>
                  <div className="text-xs font-extrabold text-neutral-900">
                    {subtotal > 0 ? formatCurrency(subtotal) : 'TZS 0'}
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search Bar (Below logo on small screens) - Hidden on sign in / sign up pages */}
        {!isAuthPage && (
          <div className="px-3 pb-2.5 md:hidden">
            <SearchBar />
          </div>
        )}
      </div>

      {/* 3. SECONDARY CATEGORY & PROMOTION NAVIGATION (Only on Customer Homepage) */}
      {location.pathname === '/' && (
        <div className="bg-neutral-50 border-b border-neutral-200 hidden lg:block">
        <div className="w-full px-3 sm:px-6 flex items-center justify-between text-xs font-semibold">
          {/* Categories mega-menu trigger */}
          <div className="relative">
            <button
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              className="flex items-center gap-2 bg-[#0B132B] hover:bg-[#1E293B] text-white px-4 py-2.5 font-bold transition cursor-pointer rounded-t-lg"
            >
              <Menu size={16} className="text-[#FF6A00]" />
              <span>All Categories</span>
              <motion.span
                animate={{ rotate: categoryDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={14} />
              </motion.span>
            </button>

            <AnimatePresence>
              {categoryDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scaleY: 0.95 }}
                  animate={{ opacity: 1, y: 0, scaleY: 1 }}
                  exit={{ opacity: 0, y: -10, scaleY: 0.95 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  onMouseLeave={() => setCategoryDropdownOpen(false)}
                  className="absolute left-0 top-full w-72 bg-white rounded-b-2xl shadow-2xl border border-neutral-200 py-2 z-50 divide-y divide-neutral-100 origin-top"
                >
                  {catalogCategories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/category/${category.slug}`}
                      onClick={() => setCategoryDropdownOpen(false)}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-orange-50 hover:text-[#FF6A00] text-neutral-800 transition group"
                    >
                      <span className="font-medium group-hover:font-semibold">{category.name}</span>
                      <span className="text-[10px] text-neutral-400 bg-neutral-100 group-hover:bg-orange-100 group-hover:text-[#FF6A00] px-1.5 py-0.5 rounded font-bold">
                        {category.itemCount}+
                      </span>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick promotion tabs */}
          <div className="flex items-center gap-4 xl:gap-5 overflow-x-auto py-2">
            {/* Deals of the day */}
            <Link
              to="/deals"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-neutral-700 hover:text-[#FF6A00] hover:bg-neutral-100 transition-all"
            >
              <Flame size={15} className="text-[#FF6A00] animate-bounce" />
              <span>Deals of the day</span>
            </Link>

            {/* Flash Sales */}
            <Link
              to="/flash-sales"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-neutral-700 hover:text-[#FF6A00] hover:bg-neutral-100 transition-all"
            >
              <Zap size={15} className="text-amber-500 fill-amber-500" />
              <span>Flash Sales</span>
            </Link>

            {/* Save The Date */}
            <Link
              to="/save-the-date"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-neutral-700 hover:text-purple-700 hover:bg-purple-50/50 transition-all font-bold text-purple-700"
            >
              <Calendar size={15} className="text-purple-600" />
              <span>Save The Date</span>
            </Link>

            {/* Free Same Day Delivery */}
            <Link
              to="/same-day-delivery"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-neutral-700 hover:text-emerald-700 hover:bg-emerald-50/50 transition-all font-bold text-emerald-700"
            >
              <Truck size={15} className="text-emerald-600" />
              <span>Same Day Delivery</span>
            </Link>

            {/* Official Stores */}
            <Link
              to="/official-stores"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-neutral-700 hover:text-blue-700 hover:bg-neutral-100 transition-all"
            >
              <ShieldCheck size={15} className="text-blue-600" />
              <span>Official Stores</span>
            </Link>

            {/* Top Sellers */}
            <Link
              to="/top-sellers"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-neutral-700 hover:text-amber-700 hover:bg-neutral-100 transition-all"
            >
              <Award size={15} className="text-amber-500" />
              <span>Top Sellers</span>
            </Link>

            {/* New Arrivals */}
            <Link
              to="/new-arrivals"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-neutral-700 hover:text-emerald-700 hover:bg-neutral-100 transition-all"
            >
              <Sparkles size={15} className="text-emerald-600" />
              <span>New Arrivals</span>
            </Link>

            {/* Free Delivery Zones */}
            <Link
              to="/free-delivery"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-neutral-700 hover:text-emerald-700 hover:bg-neutral-100 transition-all"
            >
              <Truck size={15} className="text-emerald-600" />
              <span>Free Delivery Zones</span>
            </Link>

            {/* Supermarket */}
            <Link
              to="/supermarket"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-neutral-700 hover:text-[#FF6A00] hover:bg-neutral-100 transition-all"
            >
              <ShoppingBag size={15} className="text-[#FF6A00]" />
              <span>Supermarket</span>
            </Link>
          </div>

          {/* Dedicated Live Shopping Button replacing the right text element */}
          <div className="hidden lg:flex items-center shrink-0 pl-3">
            <Link
              to="/live"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-extrabold text-xs shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <Radio size={13} className="text-white" />
              <span className="tracking-wide uppercase">Live Shopping</span>
              <span className="text-[9px] bg-white/20 text-white font-bold px-1.5 py-0.5 rounded-full">
                ON AIR
              </span>
            </Link>
          </div>
        </div>
      </div>
      )}

      {/* 4. MOBILE NAVIGATION DRAWER */}
      <AnimatePresence>
        {!isSignUpPage && mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex"
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-4/5 max-w-sm h-full overflow-y-auto p-5 flex flex-col justify-between shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                  <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                    <LumoLogo size="sm" variant="dark" />
                  </Link>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded-lg text-neutral-500 hover:bg-neutral-100 cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* User Greeting */}
                <div className="py-4 border-b border-neutral-100">
                  {isAuthenticated ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-neutral-900">{user?.name}</p>
                        <p className="text-xs text-neutral-500">{user?.phone}</p>
                      </div>
                      <Link
                        to="/account"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-xs text-[#FF6A00] font-bold"
                      >
                        View Account
                      </Link>
                    </div>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full py-2 text-center bg-[#FF6A00] text-white font-bold text-xs rounded-xl shadow-xs"
                    >
                      Sign In / Register
                    </Link>
                  )}
                </div>

                {/* Dedicated Navigation Quick links matching reference layout */}
                <div className="py-2 border-b border-neutral-100 space-y-0.5">
                  <Link
                    to="/account?tab=orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-neutral-800 hover:bg-neutral-50 rounded-xl"
                  >
                    <Package size={17} className="text-[#FF6A00]" />
                    <span>Orders</span>
                  </Link>

                  <Link
                    to="/account?tab=reviews"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-neutral-800 hover:bg-neutral-50 rounded-xl"
                  >
                    <Star size={17} className="text-amber-500" />
                    <span>Pending Reviews</span>
                  </Link>

                  <Link
                    to="/account?tab=vouchers"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-neutral-800 hover:bg-neutral-50 rounded-xl"
                  >
                    <Tag size={17} className="text-purple-600" />
                    <span>Vouchers</span>
                  </Link>

                  <Link
                    to="/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-neutral-800 hover:bg-neutral-50 rounded-xl"
                  >
                    <Heart size={17} className="text-rose-600" />
                    <span>Wishlist</span>
                  </Link>
                </div>

                {/* OUR CATEGORIES SECTION (MATCHING REFERENCE) */}
                <div className="py-3">
                  <div className="px-3 mb-2 flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400">
                      OUR CATEGORIES
                    </span>
                    <Link
                      to="/all-marketplace"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-xs font-bold text-[#FF6A00] hover:underline"
                    >
                      See All
                    </Link>
                  </div>
                  <div className="space-y-0.5">
                    <Link
                      to="/category/supermarket"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-neutral-800 hover:bg-orange-50 hover:text-[#FF6A00] rounded-xl transition"
                    >
                      <ShoppingBag size={17} className="text-neutral-500" />
                      <span>Supermarket</span>
                    </Link>

                    <Link
                      to="/category/phones-tablets"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-neutral-800 hover:bg-orange-50 hover:text-[#FF6A00] rounded-xl transition"
                    >
                      <Smartphone size={17} className="text-neutral-500" />
                      <span>Phones & Tablets</span>
                    </Link>

                    <Link
                      to="/category/home-office"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-neutral-800 hover:bg-orange-50 hover:text-[#FF6A00] rounded-xl transition"
                    >
                      <Home size={17} className="text-neutral-500" />
                      <span>Home & Office</span>
                    </Link>

                    <Link
                      to="/category/electronics-audio"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-neutral-800 hover:bg-orange-50 hover:text-[#FF6A00] rounded-xl transition"
                    >
                      <Tv size={17} className="text-neutral-500" />
                      <span>Electronics</span>
                    </Link>

                    <Link
                      to="/category/beauty-health"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-neutral-800 hover:bg-orange-50 hover:text-[#FF6A00] rounded-xl transition"
                    >
                      <Heart size={17} className="text-neutral-500" />
                      <span>Health & Beauty</span>
                    </Link>

                    <Link
                      to="/category/fashion"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-neutral-800 hover:bg-orange-50 hover:text-[#FF6A00] rounded-xl transition"
                    >
                      <Shirt size={17} className="text-neutral-500" />
                      <span>Fashion</span>
                    </Link>

                    <Link
                      to="/category/computers-laptops"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-neutral-800 hover:bg-orange-50 hover:text-[#FF6A00] rounded-xl transition"
                    >
                      <Monitor size={17} className="text-neutral-500" />
                      <span>Computing</span>
                    </Link>

                    <Link
                      to="/category/sports-fitness"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-neutral-800 hover:bg-orange-50 hover:text-[#FF6A00] rounded-xl transition"
                    >
                      <Dumbbell size={17} className="text-neutral-500" />
                      <span>Sporting Goods</span>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 text-xs text-neutral-500 space-y-2">
                <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <ShieldCheck size={14} />
                  <span>100% LUMO Escrow Protection</span>
                </div>
                <p>Dar es Salaam, Tanzania</p>
              </div>
            </motion.div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};


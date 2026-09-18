import React, { useState } from 'react';
import { Bell, MapPin, Truck, Coins, Package, ArrowRight, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';

interface Props {
  dark?: boolean;
  roleFilter?: string;
}

export const HeaderNotificationBell: React.FC<Props> = ({ dark = false, roleFilter }) => {
  const { notifications, markAsRead, markAllAsRead } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Filter notifications relevant to role if specified or show all if targetRoles includes 'ALL'
  const filteredNotifications = roleFilter 
    ? notifications.filter(n => !n.targetRoles || n.targetRoles.includes('ALL') || n.targetRoles.includes(roleFilter))
    : notifications;

  const roleUnreadCount = filteredNotifications.filter(n => !n.isRead).length;

  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          alert('Web Push notifications enabled for LUMO platform updates.');
        } else {
          alert('Notification permission denied or dismissed.');
        }
      });
    } else {
      alert('Browser does not support desktop notifications.');
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl transition cursor-pointer flex items-center justify-center ${
          dark
            ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs'
        }`}
        title="Platform Notifications"
        aria-label="Platform Notifications"
      >
        <Bell size={18} />
        {roleUnreadCount > 0 && (
          <>
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#FF6A00] animate-ping"></span>
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#FF6A00] text-white text-[10px] font-black flex items-center justify-center border border-white">
              {roleUnreadCount > 9 ? '9+' : roleUnreadCount}
            </span>
          </>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for easy tap-out collapse */}
            <div
              className="fixed inset-0 z-40 bg-black/10"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={`absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl shadow-2xl border z-50 overflow-hidden origin-top-right ${
                dark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className={`p-3.5 border-b flex items-center justify-between ${
                dark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-100 bg-slate-50/70'
              }`}>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm">Platform Notifications</h3>
                  {roleUnreadCount > 0 && (
                    <span className="bg-[#FF6A00] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      {roleUnreadCount} New
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {roleUnreadCount > 0 && (
                    <button
                      onClick={() => markAllAsRead()}
                      className={`text-[10px] font-bold cursor-pointer ${
                        dark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'
                      }`}
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

              <div className={`max-h-80 overflow-y-auto divide-y ${
                dark ? 'divide-slate-800' : 'divide-slate-100'
              }`}>
                {filteredNotifications && filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markAsRead(notif.id);
                        setIsOpen(false);
                        if (notif.link) {
                          navigate(notif.link);
                        } else if (notif.orderId) {
                          navigate('/account/orders');
                        }
                      }}
                      className={`p-3.5 transition cursor-pointer flex items-start gap-3 ${
                        dark
                          ? !notif.isRead ? 'bg-slate-800/70 hover:bg-slate-800' : 'hover:bg-slate-800/40'
                          : !notif.isRead ? 'bg-orange-50/40 hover:bg-orange-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        notif.type === 'PICKUP' ? 'bg-teal-100 text-teal-700' :
                        notif.type === 'DELIVERY' ? 'bg-blue-100 text-blue-700' :
                        notif.type === 'PAYMENT' ? 'bg-emerald-100 text-emerald-700' :
                        notif.type === 'KYC' ? 'bg-purple-100 text-purple-700' :
                        'bg-orange-100 text-[#FF6A00]'
                      }`}>
                        {notif.type === 'PICKUP' ? <MapPin size={15} /> :
                         notif.type === 'DELIVERY' ? <Truck size={15} /> :
                         notif.type === 'PAYMENT' ? <Coins size={15} /> :
                         notif.type === 'KYC' ? <ShieldAlert size={15} /> :
                         <Package size={15} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <p className={`text-xs font-bold truncate ${
                            dark
                              ? !notif.isRead ? 'text-white' : 'text-slate-300'
                              : !notif.isRead ? 'text-slate-900' : 'text-slate-700'
                          }`}>
                            {notif.title}
                          </p>
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-[#FF6A00] shrink-0"></span>
                          )}
                        </div>
                        <p className={`text-[11px] line-clamp-2 leading-snug ${
                          dark ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          {notif.message}
                        </p>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                          <span>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="text-[#FF6A00] font-bold flex items-center gap-0.5">
                            Details <ArrowRight size={10} />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs">
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
  );
};

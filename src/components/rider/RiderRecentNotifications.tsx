import React from 'react';
import { Bell } from 'lucide-react';

interface RiderRecentNotificationsProps {
  onViewAll?: () => void;
  onSelectNotification?: (item: any) => void;
  onSelectOrder?: (orderId: string) => void;
  isLight?: boolean;
}

export const RiderRecentNotifications: React.FC<RiderRecentNotificationsProps> = ({
  onViewAll,
  onSelectNotification,
  onSelectOrder,
  isLight = false,
}) => {
  const recentItem = {
    id: 'notif-1',
    orderNumber: 'ORD-784512',
    title: 'New order available',
    subtitle: 'Mwananyamala to Mbezi Beach',
    time: '1 min ago',
    unread: true,
  };

  const handleCardClick = () => {
    if (onSelectNotification) {
      onSelectNotification(recentItem);
    } else if (onSelectOrder) {
      onSelectOrder(recentItem.orderNumber);
    } else if (onViewAll) {
      onViewAll();
    }
  };

  return (
    <div className="w-full px-4 py-2 mb-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-2">
        <h3
          className={`text-sm font-bold tracking-tight ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}
        >
          Recent Notifications
        </h3>
        <button
          onClick={() => onViewAll && onViewAll()}
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* Notification Card */}
      <div
        onClick={handleCardClick}
        className={`w-full p-3.5 rounded-xl border shadow-sm flex items-center justify-between cursor-pointer transition-all duration-200 active:scale-98 ${
          isLight
            ? 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50/50'
            : 'bg-slate-900 border-slate-800 hover:border-emerald-800 hover:bg-slate-800/50'
        }`}
      >
        {/* Left Side: Bell Icon + Notification text */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <Bell className="w-5 h-5" />
          </div>

          <div className="min-w-0 flex-1">
            <p
              className={`text-xs font-bold truncate ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              {recentItem.title}
            </p>
            <p
              className={`text-[11px] font-medium truncate mt-0.5 ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              {recentItem.subtitle}
            </p>
          </div>
        </div>

        {/* Right Side: Timestamp + Unread Dot */}
        <div className="flex items-center gap-2 shrink-0 ml-3">
          <span
            className={`text-[11px] font-medium ${
              isLight ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            {recentItem.time}
          </span>
          {recentItem.unread && (
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          )}
        </div>
      </div>
    </div>
  );
};

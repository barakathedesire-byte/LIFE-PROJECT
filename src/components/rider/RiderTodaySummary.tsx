import React from 'react';
import { ShoppingBag, Clock, Navigation, Banknote } from 'lucide-react';

interface RiderTodaySummaryProps {
  completedCount?: number;
  deliveriesCount?: number;
  hoursOnline?: number;
  hoursActive?: string | number;
  distanceKm?: number;
  todayEarnings?: number;
  earnings?: number;
  rating?: number;
  isLight?: boolean;
}

export const RiderTodaySummary: React.FC<RiderTodaySummaryProps> = ({
  completedCount,
  deliveriesCount,
  hoursOnline,
  hoursActive,
  distanceKm = 45.6,
  todayEarnings,
  earnings,
  isLight = false,
}) => {
  const actualCompleted = completedCount ?? deliveriesCount ?? 12;
  const actualEarnings = todayEarnings ?? earnings ?? 78500;
  const actualHours = hoursOnline ?? (typeof hoursActive === 'number' ? hoursActive : 3.5);

  const cards = [
    {
      label: 'Completed',
      value: actualCompleted.toString(),
      icon: ShoppingBag,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    },
    {
      label: 'Hours Online',
      value: `${actualHours} hrs`,
      icon: Clock,
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    },
    {
      label: 'Distance',
      value: `${distanceKm} km`,
      icon: Navigation,
      iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    },
    {
      label: 'Earnings',
      value: `TZS ${actualEarnings.toLocaleString()}`,
      icon: Banknote,
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    },
  ];

  return (
    <div className="w-full px-4 py-2">
      <h3
        className={`text-sm font-bold tracking-tight mb-2 ${
          isLight ? 'text-slate-900' : 'text-white'
        }`}
      >
        Today's Summary
      </h3>

      <div className="grid grid-cols-2 gap-2.5">
        {cards.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className={`p-3 rounded-xl border shadow-sm flex items-center gap-3 transition-colors ${
                isLight
                  ? 'bg-white border-slate-200 hover:border-slate-300'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${item.iconBg}`}
              >
                <Icon className="w-4.5 h-4.5" />
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-extrabold tracking-tight truncate ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {item.value}
                </p>
                <p
                  className={`text-[11px] font-medium truncate ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  {item.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

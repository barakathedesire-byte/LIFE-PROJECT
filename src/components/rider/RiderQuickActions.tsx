import React from 'react';
import { Package, Wallet, TrendingUp, Headphones, MoreHorizontal } from 'lucide-react';

interface RiderQuickActionsProps {
  onNavigateTab?: (tab: 'orders' | 'earnings' | 'performance' | 'support' | 'more' | string) => void;
  onActionClick?: (tab: string) => void;
  isLight?: boolean;
}

export const RiderQuickActions: React.FC<RiderQuickActionsProps> = ({
  onNavigateTab,
  onActionClick,
  isLight = false,
}) => {
  const actions = [
    {
      id: 'orders' as const,
      label: 'My Orders',
      icon: Package,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      id: 'earnings' as const,
      label: 'Earnings',
      icon: Wallet,
      color: 'text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20',
    },
    {
      id: 'performance' as const,
      label: 'Performance',
      icon: TrendingUp,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      id: 'support' as const,
      label: 'Support',
      icon: Headphones,
      color: 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
    {
      id: 'more' as const,
      label: 'More',
      icon: MoreHorizontal,
      color: 'text-slate-600 dark:text-slate-400 bg-slate-500/10 border-slate-500/20',
    },
  ];

  const handleClick = (id: string) => {
    if (onNavigateTab) onNavigateTab(id as any);
    if (onActionClick) onActionClick(id);
  };

  return (
    <div className="w-full px-4 py-2">
      <h3
        className={`text-sm font-bold tracking-tight mb-2 ${
          isLight ? 'text-slate-900' : 'text-white'
        }`}
      >
        Quick Actions
      </h3>

      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => handleClick(action.id)}
              className="flex flex-col items-center justify-center p-2 rounded-xl transition-all active:scale-95 group cursor-pointer"
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center border shadow-sm transition-transform group-hover:scale-105 ${action.color}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`text-[11px] font-semibold mt-1.5 tracking-tight text-center leading-tight truncate max-w-full ${
                  isLight
                    ? 'text-slate-700 group-hover:text-emerald-600'
                    : 'text-slate-300 group-hover:text-emerald-400'
                }`}
              >
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

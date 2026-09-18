import React from 'react';
import { Wallet, ArrowUpRight, ChevronRight } from 'lucide-react';

interface RiderWalletCardProps {
  balance?: number;
  todayEarnings?: number;
  onOpenWallet?: () => void;
  onOpenWithdraw?: () => void;
  onWithdraw?: () => void;
  isLight?: boolean;
}

export const RiderWalletCard: React.FC<RiderWalletCardProps> = ({
  balance = 245300,
  onOpenWallet,
  onOpenWithdraw,
  onWithdraw,
  isLight = false,
}) => {
  const handleWithdraw = () => {
    if (onOpenWithdraw) onOpenWithdraw();
    if (onWithdraw) onWithdraw();
  };

  return (
    <div className="w-full px-4 py-2">
      <div
        className={`w-full rounded-xl p-3.5 flex items-center justify-between border shadow-sm transition-all duration-200 ${
          isLight
            ? 'bg-white border-slate-200 hover:border-emerald-300'
            : 'bg-slate-900 border-slate-800 hover:border-emerald-800'
        }`}
      >
        {/* Left Side: Icon + Balance Details (Clickable) */}
        <div
          onClick={() => onOpenWallet && onOpenWallet()}
          className="flex items-center gap-3 cursor-pointer group select-none flex-1"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <Wallet className="w-5 h-5" />
          </div>

          <div>
            <span
              className={`text-xs font-medium ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              Wallet Balance
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`text-base font-extrabold tracking-tight ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                TZS {balance.toLocaleString()}
              </span>
              <ChevronRight
                className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${
                  isLight ? 'text-slate-400' : 'text-slate-500'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Right Side: Withdraw Button */}
        <button
          onClick={handleWithdraw}
          className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 cursor-pointer transition-all duration-200"
          aria-label="Withdraw Funds"
        >
          <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Withdraw</span>
        </button>
      </div>
    </div>
  );
};

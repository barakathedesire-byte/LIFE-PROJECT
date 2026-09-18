import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpRight,
  TrendingUp,
  ArrowDownLeft,
  Calendar,
  DollarSign,
  Download,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { RiderWithdrawModal } from './RiderWithdrawModal';

interface RiderEarningsWalletViewProps {
  walletBalance: number;
  todayEarnings: number;
  onBalanceUpdated: (balance: number) => void;
  isLight?: boolean;
}

export const RiderEarningsWalletView: React.FC<RiderEarningsWalletViewProps> = ({
  walletBalance,
  todayEarnings,
  onBalanceUpdated,
  isLight = false,
}) => {
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month'>('today');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const transactions = [
    {
      id: 'tx-1',
      title: 'Delivery Payout #ORD-784512',
      date: 'Today, 18:42',
      amount: 8500,
      type: 'EARNING',
      status: 'COMPLETED'
    },
    {
      id: 'tx-2',
      title: 'Delivery Payout #ORD-784509',
      date: 'Today, 16:15',
      amount: 7000,
      type: 'EARNING',
      status: 'COMPLETED'
    },
    {
      id: 'tx-3',
      title: 'Customer Tip (Express Bonus)',
      date: 'Today, 15:30',
      amount: 2500,
      type: 'EARNING',
      status: 'COMPLETED'
    },
    {
      id: 'tx-4',
      title: 'Instant M-Pesa Withdrawal',
      date: 'Yesterday, 20:10',
      amount: -50000,
      type: 'WITHDRAWAL',
      status: 'COMPLETED'
    },
    {
      id: 'tx-5',
      title: 'Delivery Payout #ORD-784488',
      date: 'Yesterday, 14:20',
      amount: 9500,
      type: 'EARNING',
      status: 'COMPLETED'
    }
  ];

  return (
    <div className="w-full px-4 py-3 space-y-4 pb-28">
      
      {/* Wallet Balance Hero Card */}
      <div className="w-full rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-400/30">
              <Wallet className="w-5 h-5 text-emerald-300" />
            </div>
            <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">
              Available for Payout
            </span>
          </div>

          <button
            onClick={() => setShowWithdrawModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-white text-emerald-800 font-extrabold text-xs flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            <span>Withdraw</span>
          </button>
        </div>

        <div className="mt-4">
          <h2 className="text-3xl font-extrabold tracking-tight">
            TZS {walletBalance.toLocaleString()}
          </h2>
          <p className="text-xs text-emerald-200/90 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Escrow balance settled in real-time
          </p>
        </div>
      </div>

      {/* Time Filter Pills */}
      <div className={`p-1 rounded-xl border flex gap-1 ${
        isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        {[
          { id: 'today', label: 'Today (TZS 78,500)' },
          { id: 'week', label: 'This Week (TZS 412,000)' },
          { id: 'month', label: 'This Month (TZS 1,640,000)' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTimeFilter(t.id as any)}
            className={`flex-1 py-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer truncate px-2 ${
              timeFilter === t.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Earnings Breakdown 2x2 Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className={`p-3.5 rounded-xl border shadow-sm ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <span className="text-[11px] text-slate-500 font-medium">Standard Trip Fees</span>
          <p className="text-base font-bold text-slate-900 dark:text-white mt-1">TZS 62,000</p>
          <span className="text-[10px] text-emerald-600 font-bold">10 deliveries</span>
        </div>

        <div className={`p-3.5 rounded-xl border shadow-sm ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <span className="text-[11px] text-slate-500 font-medium">Express Surge Bonus</span>
          <p className="text-base font-bold text-slate-900 dark:text-white mt-1">TZS 11,500</p>
          <span className="text-[10px] text-amber-600 font-bold">2 express trips</span>
        </div>

        <div className={`p-3.5 rounded-xl border shadow-sm ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <span className="text-[11px] text-slate-500 font-medium">Customer Tips</span>
          <p className="text-base font-bold text-slate-900 dark:text-white mt-1">TZS 5,000</p>
          <span className="text-[10px] text-sky-600 font-bold">100% kept by rider</span>
        </div>

        <div className={`p-3.5 rounded-xl border shadow-sm ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <span className="text-[11px] text-slate-500 font-medium">COD Cash Collected</span>
          <p className="text-base font-bold text-slate-900 dark:text-white mt-1">TZS 120,000</p>
          <span className="text-[10px] text-purple-600 font-bold">Reconciled</span>
        </div>
      </div>

      {/* Transaction History */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Recent Transactions & Payouts
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">Ledger Synchronized</span>
        </div>

        <div className="space-y-2">
          {transactions.map(tx => (
            <div
              key={tx.id}
              className={`p-3.5 rounded-xl border shadow-sm flex items-center justify-between ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  tx.amount > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                }`}>
                  {tx.amount > 0 ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{tx.title}</p>
                  <p className="text-[10px] text-slate-500">{tx.date}</p>
                </div>
              </div>

              <span className={`text-xs font-extrabold ${
                tx.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
              }`}>
                {tx.amount > 0 ? `+TZS ${tx.amount.toLocaleString()}` : `-TZS ${Math.abs(tx.amount).toLocaleString()}`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Withdraw Modal */}
      <RiderWithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        availableBalance={walletBalance}
        onWithdrawSuccess={onBalanceUpdated}
        isLight={isLight}
      />

    </div>
  );
};

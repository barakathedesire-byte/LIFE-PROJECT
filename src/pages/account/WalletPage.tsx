import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatTZS } from '../../utils/formatters';
import { 
  Wallet, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck, 
  Award, 
  Plus, 
  CheckCircle2, 
  CreditCard,
  Smartphone
} from 'lucide-react';

export const WalletPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [topUpModal, setTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('100000');
  const [topUpPhone, setTopUpPhone] = useState('+255 714 882 910');
  const [topUpSuccess, setTopUpSuccess] = useState('');

  const walletBalance = user?.walletBalance || 0;
  const loyaltyPoints = user?.loyaltyPoints || 0;

  const handleTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(topUpAmount) || 0;
    const newBalance = walletBalance + amount;
    updateProfile({ walletBalance: newBalance });
    setTopUpSuccess(`Successfully topped up ${formatTZS(amount)} via M-Pesa STK push!`);
    setTimeout(() => {
      setTopUpModal(false);
      setTopUpSuccess('');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* Top Banner */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 font-bold text-xl">
                <Wallet className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  LUMO Escrow Wallet & Loyalty Rewards
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Instant 1-click checkout, escrow protected balances, and loyalty discount points
                </p>
              </div>
            </div>

            <button
              onClick={() => setTopUpModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Top Up Balance
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 pt-8 space-y-8">
        {/* Wallet Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-slate-900 to-[#0B132B] text-white p-6 rounded-2xl shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  Available Escrow Wallet
                </span>
                <span className="text-xs bg-white/10 px-2.5 py-0.5 rounded-full text-slate-300">
                  LUMO Direct Pay
                </span>
              </div>
              <p className="text-3xl font-bold mt-4">{formatTZS(walletBalance)}</p>
              <p className="text-xs text-slate-400 mt-1">
                Zero fees on marketplace transactions & instant refund settlement
              </p>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => setTopUpModal(true)}
                className="flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowDownLeft className="w-4 h-4" /> Top Up M-Pesa
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-4 h-4 text-primary" />
                  LUMO Loyalty Club
                </span>
                <span className="text-xs bg-orange-50 text-orange-700 px-2.5 py-0.5 rounded-full border border-orange-200 font-semibold">
                  Gold Tier Member
                </span>
              </div>
              <p className="text-3xl font-bold text-slate-900 mt-4">{(loyaltyPoints || 0).toLocaleString()} Pts</p>
              <p className="text-xs text-slate-500 mt-1">
                Worth <span className="font-semibold text-slate-700">{formatTZS(loyaltyPoints * 50)}</span> in checkout discounts
              </p>
            </div>

            <div className="mt-6 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600">
              Earn 5 points for every 10,000 TZS spent on verified official brand stores.
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-slate-900 text-lg mb-4">Wallet Activity History</h2>
          <div className="divide-y divide-slate-100">
            {[
              { type: 'TOP_UP', label: 'M-Pesa Wallet Top-Up', amount: 200000, date: '2026-08-25', positive: true },
              { type: 'PURCHASE', label: 'Order #LM-8812-TZ Escrow Payment', amount: 2491500, date: '2026-08-25', positive: false },
              { type: 'REFUND', label: 'Escrow Refund: Oraimo Earbuds Return', amount: 85000, date: '2026-08-22', positive: true }
            ].map((tx, idx) => (
              <div key={idx} className="py-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${tx.positive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-700'}`}>
                    {tx.positive ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{tx.label}</p>
                    <p className="text-slate-400">{tx.date}</p>
                  </div>
                </div>
                <span className={`font-bold text-sm ${tx.positive ? 'text-emerald-600' : 'text-slate-900'}`}>
                  {tx.positive ? '+' : '-'}{formatTZS(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TOP UP MODAL */}
      {topUpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h2 className="font-bold text-lg text-slate-900">Top Up LUMO Escrow Wallet</h2>
            <p className="text-xs text-slate-500 mt-1">Instant M-Pesa / Tigo Pesa prompt sent to your mobile phone.</p>

            {topUpSuccess ? (
              <div className="my-4 p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                {topUpSuccess}
              </div>
            ) : (
              <form onSubmit={handleTopUp} className="space-y-4 mt-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Top-Up Amount (TZS)</label>
                  <input
                    type="number"
                    required
                    value={topUpAmount}
                    onChange={e => setTopUpAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mobile Money Number</label>
                  <input
                    type="text"
                    required
                    value={topUpPhone}
                    onChange={e => setTopUpPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setTopUpModal(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                  >
                    Send M-Pesa PIN Prompt
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

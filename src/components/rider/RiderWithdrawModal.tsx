import React, { useState } from 'react';
import { X, ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

interface RiderWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  onWithdrawSuccess: (newBalance: number) => void;
  isLight?: boolean;
}

export const RiderWithdrawModal: React.FC<RiderWithdrawModalProps> = ({
  isOpen,
  onClose,
  availableBalance,
  onWithdrawSuccess,
  isLight = false,
}) => {
  const [provider, setProvider] = useState<'mpesa' | 'tigo' | 'airtel' | 'crdb'>('mpesa');
  const [amount, setAmount] = useState<string>('50000');
  const [accountNo, setAccountNo] = useState('+255 714 882 910');
  const [accountName, setAccountName] = useState('Alex Mwita');
  const [loading, setLoading] = useState(false);
  const [successResult, setSuccessResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const providers = [
    { id: 'mpesa', name: 'M-Pesa', color: 'border-rose-500 text-rose-600 bg-rose-50/50 dark:bg-rose-950/20' },
    { id: 'tigo', name: 'Tigo Pesa', color: 'border-blue-500 text-blue-600 bg-blue-50/50 dark:bg-blue-950/20' },
    { id: 'airtel', name: 'Airtel Money', color: 'border-red-500 text-red-600 bg-red-50/50 dark:bg-red-950/20' },
    { id: 'crdb', name: 'CRDB Bank', color: 'border-emerald-500 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20' },
  ];

  const presets = [25000, 50000, 100000, availableBalance];

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawVal = Number(amount);
    if (!withdrawVal || withdrawVal <= 0) {
      setErrorMsg('Please enter a valid withdrawal amount.');
      return;
    }
    if (withdrawVal > availableBalance) {
      setErrorMsg(`Insufficient funds. Available balance is TZS ${availableBalance.toLocaleString()}`);
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const selectedProviderName = providers.find(p => p.id === provider)?.name || 'M-Pesa';
      const res = await api.riderWithdraw({
        amount: withdrawVal,
        provider: selectedProviderName,
        accountNo,
        accountName
      });

      if (res.success) {
        setSuccessResult({
          transactionId: res.transactionId || `WTH-${Date.now().toString().slice(-6)}`,
          amount: withdrawVal,
          provider: selectedProviderName,
          accountNo,
          fee: 1000,
          net: withdrawVal - 1000,
        });
        const updatedBalance = Math.max(0, availableBalance - withdrawVal);
        onWithdrawSuccess(updatedBalance);
      } else {
        setErrorMsg(res.error || 'Withdrawal failed. Please try again.');
      }
    } catch {
      setErrorMsg('Network error while processing withdrawal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setSuccessResult(null);
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div
        className={`w-full max-w-sm rounded-2xl border shadow-2xl p-5 relative overflow-hidden transition-colors ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Instant Payout</h3>
              <p className="text-[11px] text-slate-500">Fast mobile money & bank transfer</p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success State Screen */}
        {successResult ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                Payout Dispatched!
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Ref: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{successResult.transactionId}</span>
              </p>
            </div>

            <div className={`p-3 rounded-xl border text-xs space-y-1.5 text-left ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-slate-700'}`}>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="font-bold">TZS {successResult.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Destination:</span>
                <span className="font-bold">{successResult.provider} ({successResult.accountNo})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Carrier Fee:</span>
                <span className="font-bold text-amber-500">TZS {successResult.fee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700 font-extrabold text-emerald-600">
                <span>Net Credited:</span>
                <span>TZS {successResult.net.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleResetAndClose}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
            >
              Done & Return to Dashboard
            </button>
          </div>
        ) : (
          /* Withdrawal Form */
          <form onSubmit={handleWithdraw} className="space-y-4 pt-3">
            {/* Available Balance Box */}
            <div className={`p-3 rounded-xl border flex items-center justify-between ${isLight ? 'bg-emerald-50/60 border-emerald-200' : 'bg-emerald-950/30 border-emerald-900/50'}`}>
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Available Balance:</span>
              <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                TZS {availableBalance.toLocaleString()}
              </span>
            </div>

            {/* Provider Selector Tabs */}
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1.5">Select Payout Channel</label>
              <div className="grid grid-cols-2 gap-2">
                {providers.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProvider(p.id as any)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      provider === p.id
                        ? `${p.color} ring-2 ring-emerald-500/40`
                        : isLight
                        ? 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        : 'border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Field + Presets */}
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Withdrawal Amount (TZS)</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className={`w-full px-3.5 py-2 rounded-xl text-sm font-extrabold border outline-hidden transition-colors ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                    : 'bg-slate-800 border-slate-700 text-white focus:border-emerald-400'
                }`}
                placeholder="Enter amount"
                required
              />

              {/* Presets */}
              <div className="flex gap-1.5 mt-2">
                {presets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAmount(preset.toString())}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                      amount === preset.toString()
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : isLight
                        ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {preset === availableBalance ? 'Max' : `${(preset / 1000)}k`}
                  </button>
                ))}
              </div>
            </div>

            {/* Account Details */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Phone / Account No</label>
                <input
                  type="text"
                  value={accountNo}
                  onChange={e => setAccountNo(e.target.value)}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold border outline-hidden ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-700'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Account Holder</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={e => setAccountName(e.target.value)}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold border outline-hidden ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-700'
                  }`}
                  required
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Processing Transfer...</span>
              ) : (
                <>
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Withdraw TZS {Number(amount || 0).toLocaleString()}</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { ShieldAlert, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { UserAccount } from '../../types';

interface VerificationBannerProps {
  user?: UserAccount | null;
  roleName: string;
}

export const VerificationBanner: React.FC<VerificationBannerProps> = ({ user, roleName }) => {
  const status = user?.verificationStatus || 'PENDING_VERIFICATION';

  if (status === 'VERIFIED' || user?.isVerified) {
    return (
      <div className="w-full bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between text-emerald-900 mb-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h4 className="font-black text-sm">Account Fully Verified & Operational</h4>
            <p className="text-xs text-emerald-700">Your {roleName} account has been verified by LUMO operations. All tools and escrow payouts are active.</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-black rounded-full uppercase tracking-wider">
          VERIFIED
        </span>
      </div>
    );
  }

  return (
    <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-amber-900 mb-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 font-bold shadow-sm">
          <ShieldAlert size={20} />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-black text-sm sm:text-base">Account Verification Pending</h4>
            <span className="px-2.5 py-0.5 bg-amber-200 text-amber-900 text-[10px] font-black rounded-full uppercase tracking-wider">
              {status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed max-w-2xl">
            Your registration as a {roleName} has been received. Operational features (such as receiving/accepting orders, dispatches, and disbursements) are currently locked and read-only until verification is confirmed by LUMO compliance.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        <div className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-xl border border-amber-300 text-amber-900 text-xs font-bold shadow-xs">
          <Clock size={14} className="text-amber-600 animate-pulse" />
          <span>Under Review</span>
        </div>
      </div>
    </div>
  );
};

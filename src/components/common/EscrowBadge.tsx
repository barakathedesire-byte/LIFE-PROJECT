import React, { useState } from 'react';
import { ShieldCheck, Info, X, Lock, CheckCircle2 } from 'lucide-react';

export const EscrowBadge: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [showModal, setShowModal] = useState(false);

  if (compact) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded transition-colors cursor-pointer"
        >
          <ShieldCheck size={13} className="text-emerald-600" />
          <span>SokoDirect Escrow Protected</span>
          <Info size={11} className="text-emerald-500 ml-0.5" />
        </button>

        {showModal && <EscrowInfoModal onClose={() => setShowModal(false)} />}
      </>
    );
  }

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-3 flex items-start gap-3 cursor-pointer hover:border-emerald-300 transition-all"
      >
        <div className="p-2 bg-emerald-600 text-white rounded-lg shrink-0 mt-0.5">
          <ShieldCheck size={20} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
              100% Escrow Buyer Protection
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white px-1.5 py-0.5 rounded">
                Guaranteed
              </span>
            </h4>
            <span className="text-xs text-emerald-700 font-medium underline">How it works</span>
          </div>
          <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
            Your payment is held safely in SokoDirect Escrow. The seller is only paid after you inspect and confirm delivery.
          </p>
        </div>
      </div>

      {showModal && <EscrowInfoModal onClose={() => setShowModal(false)} />}
    </>
  );
};

const EscrowInfoModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-neutral-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
            <Lock size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900">SokoDirect Escrow Guarantee</h3>
            <p className="text-xs text-neutral-500">Zero-Risk Shopping in Tanzania & East Africa</p>
          </div>
        </div>

        <div className="space-y-3.5 my-5 text-xs text-neutral-700">
          <div className="flex items-start gap-2.5 p-2.5 bg-neutral-50 rounded-lg">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-neutral-900 block">1. You Make Secure Payment</span>
              Your money (via M-Pesa, Tigo Pesa, Airtel Money, or Card) is vaulted safely with SokoDirect, NOT sent directly to individual sellers.
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 bg-neutral-50 rounded-lg">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-neutral-900 block">2. Seller Dispatches Order</span>
              The verified seller packages your authentic item and sends it via SokoDirect delivery or pickup station with full tracking.
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 bg-neutral-50 rounded-lg">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-neutral-900 block">3. You Inspect & Release Funds</span>
              You inspect the package. Only once you confirm satisfactory condition is the seller paid. 7-day hassle-free returns guaranteed.
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition cursor-pointer"
        >
          Got it, shop with confidence
        </button>
      </div>
    </div>
  );
};

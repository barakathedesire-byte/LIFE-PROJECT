import React, { useState } from 'react';
import { PickupOrder } from '../types';
import { QrCode, Search, CheckCircle2, ShieldCheck, UserCheck, PackageOpen } from 'lucide-react';
import { api } from '../../../services/api';

interface Props {
  orders: PickupOrder[];
  setOrders: React.Dispatch<React.SetStateAction<PickupOrder[]>>;
}

export const CustomerHandoverView: React.FC<Props> = ({ orders, setOrders }) => {
  const [searchInput, setSearchInput] = useState('');
  const [activeCustomer, setActiveCustomer] = useState<PickupOrder | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Search, 2: Verify Code, 3: Handover

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const pkg = orders.find(o => 
      ['READY', 'NOTIFIED'].includes(o.status) && 
      (o.customerPhone.includes(searchInput) || o.orderId === searchInput || o.packageId === searchInput)
    );
    if (pkg) {
      setActiveCustomer(pkg);
      setStep(2);
      setOtpInput('');
      setOtpError('');
    } else {
      alert('No active pickup found for this criteria.');
    }
    setSearchInput('');
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput === activeCustomer?.pickupOtpCode) {
      setStep(3);
    } else {
      setOtpError('Invalid pickup code. Please check SMS.');
    }
  };

  const completeHandover = async () => {
    if (!activeCustomer) return;
    try {
      setOrders(prev => prev.map(o => 
        o.id === activeCustomer.id ? { ...o, status: 'COLLECTED' } : o
      ));
      await api.handoverPickupPackage(activeCustomer.id, otpInput || activeCustomer.pickupOtpCode);
    } catch (err) {
      console.error('Failed to handover pickup package:', err);
    } finally {
      setActiveCustomer(null);
      setStep(1);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      
      {/* Progress Indicator */}
      {activeCustomer && (
        <div className="flex items-center justify-between max-w-2xl mx-auto mb-8 relative">
           <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10"></div>
           <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-teal-500 -z-10 transition-all duration-500" style={{ width: step === 2 ? '50%' : step === 3 ? '100%' : '0%' }}></div>
           
           <div className="flex flex-col items-center bg-slate-50 p-1">
             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
             <span className="text-[10px] uppercase font-bold mt-2 text-slate-500">Locate</span>
           </div>
           <div className="flex flex-col items-center bg-slate-50 p-1">
             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
             <span className="text-[10px] uppercase font-bold mt-2 text-slate-500">Verify</span>
           </div>
           <div className="flex flex-col items-center bg-slate-50 p-1">
             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 3 ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'}`}>3</div>
             <span className="text-[10px] uppercase font-bold mt-2 text-slate-500">Handover</span>
           </div>
        </div>
      )}

      {step === 1 && (
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
          <QrCode className="w-16 h-16 text-slate-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Customer Arrival</h2>
          <p className="text-slate-500 mb-8">Scan customer QR code or enter their phone/order number.</p>
          
          <form onSubmit={handleSearch} className="space-y-4 max-w-md mx-auto">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                autoFocus
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Phone or Order ID..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-base focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Locate Customer & Initiate Handover</span>
            </button>
          </form>

          {/* Quick Select Ready Packages */}
          <div className="mt-8 text-left border-t border-slate-100 pt-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Packages Ready for Pickup ({orders.filter(o => ['READY', 'NOTIFIED'].includes(o.status)).length})</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {orders.filter(o => ['READY', 'NOTIFIED'].includes(o.status)).map(pkg => (
                <div 
                  key={pkg.id} 
                  onClick={() => {
                    setActiveCustomer(pkg);
                    setStep(2);
                    setOtpInput('');
                    setOtpError('');
                  }}
                  className="p-3 bg-slate-50 hover:bg-teal-50/50 border border-slate-200 hover:border-teal-300 rounded-xl flex items-center justify-between cursor-pointer transition"
                >
                  <div>
                    <p className="font-bold text-sm text-slate-800">{pkg.customerName}</p>
                    <p className="text-xs text-slate-500 font-mono">{pkg.orderId} • {pkg.customerPhone}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold font-mono bg-slate-200 text-slate-800 px-2 py-0.5 rounded">{pkg.shelfLocation}</span>
                    <p className="text-[10px] text-teal-600 font-bold mt-0.5">Click to Handover</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 2 && activeCustomer && (
         <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-2xl p-8 shadow-sm animate-in zoom-in-95">
           <div className="text-center mb-6">
             <UserCheck className="w-12 h-12 text-teal-500 mx-auto mb-4" />
             <h2 className="text-xl font-bold text-slate-800">{activeCustomer.customerName}</h2>
             <p className="text-sm text-slate-500 mt-1">{activeCustomer.customerPhone}</p>
           </div>
           
           <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-6">
             <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Retrieval Target</p>
             <p className="font-mono text-lg font-bold text-slate-900">{activeCustomer.shelfLocation}</p>
             <p className="text-sm text-slate-600 mt-2">Order: {activeCustomer.orderId}</p>
           </div>

           <form onSubmit={handleVerify} className="space-y-4">
             {otpError && <p className="text-sm text-rose-600 font-bold bg-rose-50 p-3 rounded-lg">{otpError}</p>}
             <div>
               <label className="text-sm font-bold text-slate-700 block mb-2 text-center">Enter 4-Digit Pickup Code</label>
               <input 
                 type="text" 
                 autoFocus
                 maxLength={4}
                 value={otpInput}
                 onChange={e => setOtpInput(e.target.value)}
                 placeholder="0000"
                 className="w-full text-center tracking-[1em] text-3xl font-mono bg-white border border-slate-300 rounded-xl py-4 focus:ring-2 focus:ring-teal-500 outline-none transition"
               />
               <p className="text-[10px] text-slate-400 mt-2 text-center">(Demo Code: {activeCustomer.pickupOtpCode})</p>
             </div>
             <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition">Cancel</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-500 transition">Verify Code</button>
             </div>
           </form>
         </div>
      )}

      {step === 3 && activeCustomer && (
         <div className="max-w-2xl mx-auto bg-white border border-teal-200 rounded-2xl p-8 shadow-lg text-center animate-in slide-in-from-bottom-4">
           <ShieldCheck className="w-20 h-20 text-teal-500 mx-auto mb-6" />
           <h2 className="text-2xl font-bold text-slate-800 mb-2">Verification Successful</h2>
           <p className="text-slate-600 mb-8">Hand over the package(s) to the customer to complete this order.</p>

           <div className="grid grid-cols-2 gap-4 text-left max-w-md mx-auto mb-8">
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Packages</p>
                <p className="text-lg font-bold text-slate-900">{activeCustomer.packageCount} Items</p>
             </div>
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Payment Status</p>
                <p className={`text-lg font-bold ${activeCustomer.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {activeCustomer.paymentStatus}
                </p>
             </div>
           </div>

           <button 
             onClick={completeHandover}
             className="w-full max-w-md mx-auto flex items-center justify-center gap-3 bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition"
           >
             <PackageOpen className="w-6 h-6" /> Complete Physical Handover
           </button>
         </div>
      )}

    </div>
  );
};

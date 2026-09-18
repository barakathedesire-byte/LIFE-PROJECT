import React, { useState } from 'react';
import { Truck, CheckCircle2, QrCode, RefreshCw, X, ShieldCheck, UserCheck, KeyRound } from 'lucide-react';
import { WHOrder } from '../types';
import { api } from '../../../services/api';
import { LumoLoader } from '../../../components/common/LumoLoader';

interface DispatchViewProps {
  orders: WHOrder[];
  setOrders: React.Dispatch<React.SetStateAction<WHOrder[]>>;
}

export const DispatchView: React.FC<DispatchViewProps> = ({ orders, setOrders }) => {
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [qrModalOrder, setQrModalOrder] = useState<WHOrder | null>(null);
  const [handoverOtp, setHandoverOtp] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const readyOrders = orders.filter(o => o.status === 'READY' || o.status === 'STAGING');

  const handleConfirmHandover = async (order: WHOrder) => {
    try {
      setDispatchingId(order.id);
      // Update local state
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'DISPATCHED', timeInStage: 'Dispatched to Courier' } : o));
      // Call backend API
      await api.updateOrderStatus(order.id, 'Shipped', 'Handed over to delivery rider at warehouse bay');
      showToast(`Order #${order.orderNumber} successfully handed over to courier Juma Kelvin (KZM 123)!`);
      setQrModalOrder(null);
      setHandoverOtp('');
    } catch (err) {
      console.error('Failed to dispatch order:', err);
      showToast(`Order #${order.orderNumber} dispatched locally.`);
      setQrModalOrder(null);
    } finally {
      setDispatchingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in h-full flex flex-col">
      {toastMessage && (
        <div className="p-3 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-lg flex items-center justify-between animate-in fade-in sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="p-1 hover:bg-emerald-700 rounded"><X size={14} /></button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Dispatch & Rider Handover Hub</h2>
          <p className="text-xs text-slate-500 mt-1">Scan rider app QR code, confirm handover OTP, and release out-for-delivery packages.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {readyOrders.map(order => (
          <div key={order.id} className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col sm:flex-row">
            <div className="p-6 flex-1 space-y-3 border-r border-slate-100">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 font-mono">{order.orderNumber}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Location: <span className="font-bold text-slate-800">BAY-01 (Standard)</span></p>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-extrabold uppercase">
                  Ready for Pickup
                </span>
              </div>
              
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Courier</span>
                  <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">Arrived at Bay</span>
                </div>
                <p className="font-bold text-slate-900">Juma Kelvin (KZM 123 - Boxer 150)</p>
                <p className="text-[11px] text-slate-500 font-mono">+255 684 928 110 • SLA: 45 min target</p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Customer: <strong className="text-slate-800">{order.customerName}</strong></span>
                <span>Value: <strong className="text-slate-900">{order.itemCount} items</strong></span>
              </div>
            </div>
            
            <div className="bg-slate-50 p-6 flex flex-col justify-center gap-2.5 min-w-[210px] text-center border-t sm:border-t-0">
               <div 
                 onClick={() => setQrModalOrder(order)}
                 className="p-3 bg-white border border-slate-200 rounded-2xl hover:border-[#FF6A00] transition cursor-pointer flex flex-col items-center gap-1 group shadow-xs"
               >
                 <QrCode className="w-12 h-12 text-slate-400 group-hover:text-[#FF6A00] transition" />
                 <span className="text-[10px] font-bold text-slate-600 group-hover:text-[#FF6A00]">Click to scan rider QR</span>
               </div>
               
               <button 
                  disabled={dispatchingId === order.id}
                  onClick={() => handleConfirmHandover(order)}
                  className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {dispatchingId === order.id ? (
                    <>
                      <LumoLoader size="small" /> Handing over...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Quick Handover
                    </>
                  )}
                </button>
            </div>
          </div>
        ))}

        {readyOrders.length === 0 && (
          <div className="col-span-full p-12 text-center text-slate-500 bg-white rounded-3xl border border-dashed border-slate-300">
            <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-slate-700">No packages currently waiting for rider handover</p>
            <p className="text-xs text-slate-400 mt-1">Orders staged at bays will appear here for courier dispatch.</p>
          </div>
        )}
      </div>

      {/* RIDER HANDOVER QR & OTP MODAL */}
      {qrModalOrder && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 border border-slate-200 space-y-4 text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-600" />
                <span className="font-extrabold text-sm text-slate-900">Secure Courier Handover</span>
              </div>
              <button onClick={() => setQrModalOrder(null)} className="p-1 hover:bg-slate-100 rounded-full"><X size={18} /></button>
            </div>

            <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="w-28 h-28 bg-white border-2 border-dashed border-slate-300 rounded-2xl mx-auto flex items-center justify-center">
                <QrCode size={70} className="text-slate-800" />
              </div>
              <p className="font-bold text-slate-800 text-sm">{qrModalOrder.orderNumber}</p>
              <p className="text-[11px] text-slate-500">Ask Rider <strong className="text-slate-900">Juma Kelvin</strong> to scan this QR code or provide the 4-digit handover OTP.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Rider Handover PIN / OTP</label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 4-digit PIN (e.g. 4821)"
                  value={handoverOtp}
                  onChange={e => setHandoverOtp(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-center font-bold text-base tracking-widest text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setQrModalOrder(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmHandover(qrModalOrder)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <UserCheck size={16} /> Confirm Rider Pickup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

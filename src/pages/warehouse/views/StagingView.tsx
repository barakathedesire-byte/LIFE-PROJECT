import React, { useState } from 'react';
import { MapPin, ArrowRight, CheckCircle2, X, Boxes, Truck } from 'lucide-react';
import { WHOrder } from '../types';

interface StagingViewProps {
  orders: WHOrder[];
  setOrders: React.Dispatch<React.SetStateAction<WHOrder[]>>;
}

export const StagingView: React.FC<StagingViewProps> = ({ orders, setOrders }) => {
  const stagingOrders = orders.filter(o => o.status === 'STAGING');
  const [bayAssignments, setBayAssignments] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleStage = (orderId: string, orderNumber: string) => {
    const bay = bayAssignments[orderId] || 'BAY-01 (Standard)';
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'READY', timeInStage: `Staged at ${bay}` } : o));
    showToast(`Order #${orderNumber} staged at ${bay}. Marked ready for courier pickup!`);
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
          <h2 className="text-xl font-bold text-slate-900">Staging Bays Management</h2>
          <p className="text-xs text-slate-500 mt-1">Organize packages into outgoing dispatch bays according to carrier route and delivery speed.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {stagingOrders.map(order => {
          const currentBay = bayAssignments[order.id] || (order.priority === 'EXPRESS' ? 'BAY-EX-01 (Express Rider)' : 'BAY-01 (Standard)');

          return (
            <div key={order.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between group hover:border-[#FF6A00] transition">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 font-mono">{order.orderNumber}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{order.deliveryType} Delivery</p>
                  </div>
                  {order.priority === 'EXPRESS' && (
                    <span className="px-2.5 py-0.5 bg-red-100 text-red-700 font-bold text-[10px] rounded-full uppercase">
                      Express
                    </span>
                  )}
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Customer:</span>
                    <span className="font-bold text-slate-800">{order.customerName}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Destination:</span>
                    <span className="font-bold text-slate-800">Dar es Salaam (Zone 1)</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Assign Staging Bay</label>
                  <select 
                    value={currentBay}
                    onChange={e => setBayAssignments(prev => ({ ...prev, [order.id]: e.target.value }))}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-slate-50 font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-[#FF6A00]"
                  >
                    <option value="BAY-01 (Standard)">BAY-01 (Standard - Kariakoo / City Center)</option>
                    <option value="BAY-02 (Standard)">BAY-02 (Standard - Kinondoni / Mikocheni)</option>
                    <option value="BAY-EX-01 (Express Rider)">BAY-EX-01 (Express Flash Fleet)</option>
                    <option value="BAY-PK-01 (Customer Pickup)">BAY-PK-01 (Self Pickup Locker)</option>
                  </select>
                </div>
              </div>
              
              <button 
                onClick={() => handleStage(order.id, order.orderNumber)}
                className="mt-5 w-full py-2.5 bg-[#FF6A00] hover:bg-[#E55E00] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Boxes size={15} /> Mark Ready for Courier Pickup
              </button>
            </div>
          );
        })}
        
        {stagingOrders.length === 0 && (
          <div className="col-span-full p-12 text-center text-slate-500 bg-white rounded-3xl border border-dashed border-slate-300">
            <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-slate-700">No packages waiting for staging</p>
            <p className="text-xs text-slate-400 mt-1">Packed boxes will appear here ready for bay assignments.</p>
          </div>
        )}
      </div>
    </div>
  );
};

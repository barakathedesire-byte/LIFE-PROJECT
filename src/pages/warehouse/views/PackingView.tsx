import React, { useState } from 'react';
import { Box, Printer, PackageCheck, AlertCircle, CheckCircle2, X, Scale } from 'lucide-react';
import { WHOrder } from '../types';

interface PackingViewProps {
  orders: WHOrder[];
  setOrders: React.Dispatch<React.SetStateAction<WHOrder[]>>;
}

export const PackingView: React.FC<PackingViewProps> = ({ orders, setOrders }) => {
  const packingOrders = orders.filter(o => o.status === 'PACKING');
  const [toastMessage, setToastMessage] = useState('');
  const [printingOrder, setPrintingOrder] = useState<WHOrder | null>(null);
  const [packageConfigs, setPackageConfigs] = useState<Record<string, { type: string; weight: number }>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleUpdateConfig = (orderId: string, field: 'type' | 'weight', value: any) => {
    setPackageConfigs(prev => ({
      ...prev,
      [orderId]: {
        type: prev[orderId]?.type || 'Lumo Standard Box (M)',
        weight: prev[orderId]?.weight || 1.2,
        [field]: value
      }
    }));
  };

  const handleCompletePack = (orderId: string, orderNumber: string) => {
    const config = packageConfigs[orderId] || { type: 'Lumo Standard Box (M)', weight: 1.2 };
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'STAGING', timeInStage: 'Packed' } : o));
    showToast(`Order #${orderNumber} packed (${config.type}, ${config.weight}kg). Moved to Staging.`);
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
          <h2 className="text-xl font-bold text-slate-900">Packing & Label Station</h2>
          <p className="text-xs text-slate-500 mt-1">Pack inspected goods into tamper-proof LUMO boxes and print waybills.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {packingOrders.map(order => {
          const cfg = packageConfigs[order.id] || { type: 'Lumo Standard Box (M)', weight: 1.4 };

          return (
            <div key={order.id} className="bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row overflow-hidden group">
              <div className="p-6 flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 font-mono">{order.orderNumber}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Customer: {order.customerName}</p>
                  </div>
                  {order.priority === 'EXPRESS' && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 font-bold text-[10px] rounded-full uppercase">
                      Express Delivery
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Package Type</label>
                    <select 
                      value={cfg.type}
                      onChange={e => handleUpdateConfig(order.id, 'type', e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-2 text-xs bg-slate-50 font-semibold outline-none"
                    >
                      <option value="Lumo Polybag (S)">Lumo Polybag (S)</option>
                      <option value="Lumo Polybag (M)">Lumo Polybag (M)</option>
                      <option value="Lumo Standard Box (S)">Lumo Standard Box (S)</option>
                      <option value="Lumo Standard Box (M)">Lumo Standard Box (M)</option>
                      <option value="Lumo Standard Box (L)">Lumo Standard Box (L)</option>
                      <option value="Heavy Duty Crate">Heavy Duty Crate</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Weight (kg)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        step="0.1" 
                        value={cfg.weight} 
                        onChange={e => handleUpdateConfig(order.id, 'weight', parseFloat(e.target.value) || 0.1)}
                        className="w-full border border-slate-300 rounded-xl p-2 pr-7 text-xs bg-slate-50 font-bold outline-none" 
                      />
                      <Scale size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span>Verified Items: <strong className="text-slate-900">{order.itemCount} units</strong></span>
                  <span className="text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-full">QC Approved</span>
                </div>
              </div>
              
              <div className="bg-slate-50 p-5 border-t sm:border-t-0 sm:border-l border-slate-200 flex flex-col justify-center gap-3 min-w-[170px]">
                <button 
                  onClick={() => setPrintingOrder(order)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4 text-slate-600" /> Print Waybill
                </button>
                <button 
                  onClick={() => handleCompletePack(order.id, order.orderNumber)}
                  className="w-full px-4 py-2.5 bg-[#FF6A00] hover:bg-[#E55E00] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <PackageCheck className="w-4 h-4" /> Seal & Stage
                </button>
              </div>
            </div>
          );
        })}
        
        {packingOrders.length === 0 && (
          <div className="col-span-full p-12 text-center text-slate-500 bg-white rounded-3xl border border-dashed border-slate-300">
            <Box className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-slate-700">No orders queued for packing</p>
            <p className="text-xs text-slate-400 mt-1">Orders that pass Quality Check will automatically arrive here.</p>
          </div>
        )}
      </div>

      {/* PRINT WAYBILL THERMAL MODAL */}
      {printingOrder && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl p-6 border border-slate-200 space-y-4 font-mono text-xs">
            <div className="text-center border-b pb-3 border-slate-200">
              <span className="font-extrabold text-xs tracking-widest text-[#FF6A00]">LUMO EXPRESS LOGISTICS</span>
              <h2 className="font-extrabold text-base text-slate-900 mt-1">SHIPMENT WAYBILL</h2>
              <div className="my-2 bg-slate-100 p-2 rounded text-center">
                <span className="font-bold text-lg text-slate-900 tracking-widest">{printingOrder.orderNumber}</span>
              </div>
            </div>

            <div className="space-y-2 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">Recipient:</span>
                <span className="font-bold text-slate-900">{printingOrder.customerName}</span>
                <p className="text-slate-600 text-[10px]">Kariakoo Commercial Zone, Dar es Salaam</p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">Package Type:</span>
                  <span className="font-bold">Box (M)</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">Service Level:</span>
                  <span className="font-bold text-red-600">{printingOrder.priority}</span>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-dashed border-slate-300 pt-3 text-center">
              <div className="h-12 bg-slate-900 text-white flex items-center justify-center font-bold tracking-widest text-xs rounded-lg">
                ||| |||| || | |||| |||||| |||||
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 font-mono tracking-wider">TRACK: LM-TZ-2026-99120</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => {
                  showToast('Shipping label printed successfully to thermal station.');
                  setPrintingOrder(null);
                }}
                className="flex-1 py-2.5 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Print Now
              </button>
              <button 
                onClick={() => setPrintingOrder(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

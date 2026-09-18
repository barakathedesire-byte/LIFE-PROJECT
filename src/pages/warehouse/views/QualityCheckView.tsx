import React, { useState } from 'react';
import { CheckSquare, AlertCircle, X, Check, ArrowRight, ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { WHOrder } from '../types';

interface QualityCheckViewProps {
  orders: WHOrder[];
  setOrders: React.Dispatch<React.SetStateAction<WHOrder[]>>;
}

export const QualityCheckView: React.FC<QualityCheckViewProps> = ({ orders, setOrders }) => {
  const qcOrders = orders.filter(o => o.status === 'QUALITY_CHECK');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState('');
  const [failedModalOrder, setFailedModalOrder] = useState<WHOrder | null>(null);
  const [failReason, setFailReason] = useState('DAMAGED_PACKAGING');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleToggleItem = (orderId: string, itemIdx: number) => {
    const key = `${orderId}-${itemIdx}`;
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePassQC = (orderId: string, orderNumber: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'PACKING', timeInStage: 'Passed QC' } : o));
    showToast(`Order #${orderNumber} passed Quality Check! Sent to Packing Station.`);
  };

  const handleFailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!failedModalOrder) return;
    setOrders(prev => prev.map(o => o.id === failedModalOrder.id ? { ...o, status: 'EXCEPTION', timeInStage: 'QC Failed' } : o));
    showToast(`Order #${failedModalOrder.orderNumber} flagged as exception: ${failReason.replace(/_/g, ' ')}.`);
    setFailedModalOrder(null);
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
          <h2 className="text-xl font-bold text-slate-900">Quality Check (QC) Station</h2>
          <p className="text-xs text-slate-500 mt-1">Verify SKU authenticity, sealed packaging, and warranty seals before boxing.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {qcOrders.map(order => {
          const item1Checked = !!checkedItems[`${order.id}-0`];
          const item2Checked = order.itemCount > 1 ? !!checkedItems[`${order.id}-1`] : true;
          const allChecked = item1Checked && item2Checked;

          return (
            <div key={order.id} className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
              <div className="p-5 bg-slate-50 border-b border-slate-200 flex justify-between items-start">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 font-mono">{order.orderNumber}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Customer: {order.customerName} • {order.vendorName}</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-extrabold uppercase">
                  {order.itemCount} Items
                </span>
              </div>
              
              <div className="p-5 flex-1 space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Physical Verification Checklist</p>
                
                <div 
                  onClick={() => handleToggleItem(order.id, 0)}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border transition cursor-pointer ${
                    item1Checked ? 'bg-emerald-50/80 border-emerald-300' : 'bg-slate-50 border-slate-200 hover:border-orange-300'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    checked={item1Checked}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-[#FF6A00] focus:ring-[#FF6A00] cursor-pointer" 
                  />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-800">Samsung Galaxy S24 Ultra 256GB</p>
                    <p className="text-[10px] text-slate-500 font-mono">SKU: SAM-S24U-256 • Factory Seal Intact</p>
                  </div>
                  {item1Checked && <CheckCircle2 size={16} className="text-emerald-600" />}
                </div>

                {order.itemCount > 1 && (
                  <div 
                    onClick={() => handleToggleItem(order.id, 1)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border transition cursor-pointer ${
                      item2Checked ? 'bg-emerald-50/80 border-emerald-300' : 'bg-slate-50 border-slate-200 hover:border-orange-300'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={item2Checked}
                      onChange={() => {}}
                      className="w-4 h-4 rounded text-[#FF6A00] focus:ring-[#FF6A00] cursor-pointer" 
                    />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-800">Anker 65W GaN Fast Charger</p>
                      <p className="text-[10px] text-slate-500 font-mono">SKU: ANK-GAN-65W • Hologram Verified</p>
                    </div>
                    {item2Checked && <CheckCircle2 size={16} className="text-emerald-600" />}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
                <button 
                  onClick={() => setFailedModalOrder(order)}
                  className="px-4 py-2.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 flex-1 cursor-pointer"
                >
                  <X className="w-4 h-4" /> Fail QC
                </button>
                <button 
                  onClick={() => handlePassQC(order.id, order.orderNumber)}
                  disabled={!allChecked}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 flex-1 cursor-pointer shadow-xs ${
                    allChecked ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Check className="w-4 h-4" /> Pass & Pack
                </button>
              </div>
            </div>
          );
        })}

        {qcOrders.length === 0 && (
          <div className="col-span-full p-12 text-center text-slate-500 bg-white rounded-3xl border border-dashed border-slate-300">
            <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-slate-700">No orders awaiting Quality Check</p>
            <p className="text-xs text-slate-400 mt-1">Orders from picking will automatically queue up here.</p>
          </div>
        )}
      </div>

      {/* FAIL QC MODAL */}
      {failedModalOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleFailSubmit} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                <AlertTriangle size={18} />
                <span>Fail QC on {failedModalOrder.orderNumber}</span>
              </div>
              <button type="button" onClick={() => setFailedModalOrder(null)} className="p-1 hover:bg-slate-100 rounded-full"><X size={18} /></button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Rejection</label>
              <select
                value={failReason}
                onChange={e => setFailReason(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-white text-slate-800 outline-none"
              >
                <option value="DAMAGED_PACKAGING">Damaged Outer Packaging / Box</option>
                <option value="MISSING_ACCESSORY">Missing Cable / Power Adapter</option>
                <option value="WRONG_COLOR_SPEC">Color or Storage Spec Mismatch</option>
                <option value="BROKEN_SEAL">Warranty Hologram Seal Broken</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFailedModalOrder(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Confirm QC Rejection
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

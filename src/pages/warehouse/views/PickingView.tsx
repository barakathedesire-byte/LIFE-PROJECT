import React, { useState } from 'react';
import { Package, ScanLine, ArrowRight, CheckCircle2, AlertTriangle, AlertCircle, Camera, Clock, X, Check, RefreshCw } from 'lucide-react';
import { WHOrder, WHInventoryItem } from '../types';

interface PickingViewProps {
  orders: WHOrder[];
  inventory: WHInventoryItem[];
  setOrders?: React.Dispatch<React.SetStateAction<WHOrder[]>>;
}

export const PickingView: React.FC<PickingViewProps> = ({ orders, inventory, setOrders }) => {
  const [activePickId, setActivePickId] = useState<string | null>(null);
  const [scannedSku, setScannedSku] = useState('');
  const [scannedItems, setScannedItems] = useState<Record<string, number>>({});
  const [showExceptionModal, setShowExceptionModal] = useState(false);
  const [exceptionReason, setExceptionReason] = useState('MISSING_STOCK');
  const [exceptionNotes, setExceptionNotes] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const pickingOrders = orders.filter(o => o.status === 'NEW' || o.status === 'PICKING');
  const activeOrder = orders.find(o => o.id === activePickId);

  // Generate deterministic pick items for the active order
  const pickList = activeOrder ? inventory.slice(0, Math.max(1, activeOrder.itemCount)).map((item, idx) => ({
    ...item,
    id: `pick-${item.sku}-${idx}`,
    requiredQty: idx === 0 ? 1 : 2,
  })) : [];

  const handleStartPicking = (order: WHOrder) => {
    setActivePickId(order.id);
    setScannedItems({});
    if (setOrders && order.status === 'NEW') {
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'PICKING' } : o));
    }
    showToast(`Order #${order.orderNumber} assigned to active picking session.`);
  };

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedSku.trim()) return;

    const matchedItem = pickList.find(
      i => i.sku.toLowerCase() === scannedSku.trim().toLowerCase() ||
           i.productName.toLowerCase().includes(scannedSku.trim().toLowerCase())
    );

    if (matchedItem) {
      const current = scannedItems[matchedItem.sku] || 0;
      if (current < matchedItem.requiredQty) {
        const nextCount = current + 1;
        setScannedItems(prev => ({ ...prev, [matchedItem.sku]: nextCount }));
        showToast(`Scanned SKU: ${matchedItem.sku} (${nextCount}/${matchedItem.requiredQty})`);
      } else {
        showToast(`SKU ${matchedItem.sku} is already fully picked!`);
      }
    } else {
      showToast(`SKU "${scannedSku}" is not part of this order!`);
    }
    setScannedSku('');
  };

  const handleQuickPickItem = (sku: string, maxQty: number) => {
    const current = scannedItems[sku] || 0;
    if (current < maxQty) {
      setScannedItems(prev => ({ ...prev, [sku]: current + 1 }));
      showToast(`Item ${sku} confirmed picked.`);
    }
  };

  const isAllPicked = pickList.length > 0 && pickList.every(i => (scannedItems[i.sku] || 0) >= i.requiredQty);

  const handleCompletePicking = () => {
    if (!activeOrder) return;
    if (setOrders) {
      setOrders(prev => prev.map(o => o.id === activeOrder.id ? { ...o, status: 'QUALITY_CHECK', timeInStage: 'Just picked' } : o));
    }
    showToast(`Order #${activeOrder.orderNumber} picked successfully! Moved to Quality Check.`);
    setActivePickId(null);
    setScannedItems({});
  };

  const handleReportException = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;
    showToast(`Exception recorded: ${exceptionReason.replace(/_/g, ' ')} on Order #${activeOrder.orderNumber}`);
    setShowExceptionModal(false);
    setExceptionNotes('');
  };

  if (activePickId && activeOrder) {
    return (
      <div className="space-y-6 animate-in fade-in h-full flex flex-col max-w-4xl mx-auto w-full">
        {toastMessage && (
          <div className="p-3 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-lg flex items-center justify-between animate-in fade-in sticky top-0 z-30">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage('')} className="p-1 hover:bg-emerald-700 rounded"><X size={14} /></button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <button 
                onClick={() => setActivePickId(null)} 
                className="text-slate-400 hover:text-slate-900 transition p-1 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                <ArrowRight className="w-5 h-5 rotate-180" />
              </button>
              <h2 className="text-xl font-bold text-slate-900">Active Pick: {activeOrder.orderNumber}</h2>
              {activeOrder.priority === 'EXPRESS' && (
                <span className="px-2 py-0.5 bg-red-100 text-red-700 font-bold text-[10px] rounded uppercase animate-pulse">
                  Express SLA
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 pl-8">Customer: {activeOrder.customerName} • {pickList.length} distinct item lines</p>
          </div>
          <button 
            onClick={() => setShowExceptionModal(true)} 
            className="px-3 py-2 bg-white border border-red-200 text-red-600 rounded-xl text-xs font-bold hover:bg-red-50 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <AlertTriangle className="w-4 h-4" /> Report Exception
          </button>
        </div>

        {/* SCANNER CONSOLE */}
        <div className="bg-[#0B132B] rounded-3xl p-6 shadow-xl text-white">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center border-2 border-dashed border-white/20 shrink-0">
              <ScanLine className="w-9 h-9 text-[#FF6A00]" />
            </div>
            <div className="flex-1 w-full">
              <h3 className="font-bold text-base mb-2 flex items-center gap-2">
                Digital Barcode Scanner Input
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                  Laser Ready
                </span>
              </h3>
              <form onSubmit={handleScan} className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={scannedSku}
                  onChange={e => setScannedSku(e.target.value)}
                  placeholder="Scan barcode, type SKU, or click item below..." 
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/40 transition"
                  autoFocus
                />
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-[#FF6A00] hover:bg-[#E55E00] text-white rounded-xl font-bold text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
                >
                  <Check size={14} /> Confirm Scan
                </button>
                <button 
                  type="button" 
                  onClick={() => setCameraActive(!cameraActive)}
                  className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition shrink-0 cursor-pointer text-xs flex items-center gap-1" 
                  title="Toggle Optical Camera"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </form>
              {cameraActive && (
                <div className="mt-3 p-3 bg-slate-900 border border-slate-700 rounded-xl text-center text-xs text-slate-300 flex items-center justify-center gap-2 animate-in fade-in">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></div>
                  <span>Optical Camera Active: Pointing at Bin Barcode...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PICK LIST ITEMS */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">Picking Route & Item Checklist</span>
            <span className="text-xs font-semibold text-slate-500">
              {Object.values(scannedItems).reduce((a: number, b: any) => a + (Number(b) || 0), 0)} items picked
            </span>
          </div>
          
          <div className="overflow-y-auto p-4 space-y-3 flex-1">
            {pickList.map((item) => {
              const count = scannedItems[item.sku] || 0;
              const isItemComplete = count >= item.requiredQty;
              return (
                <div 
                  key={item.sku} 
                  className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row gap-4 items-center ${
                    isItemComplete ? 'bg-emerald-50/70 border-emerald-300' : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                    <Package className={`w-7 h-7 ${isItemComplete ? 'text-emerald-600' : 'text-slate-400'}`} />
                  </div>
                  
                  <div className="flex-1 w-full text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-sm">{item.productName}</h4>
                      {isItemComplete && (
                        <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 size={12} /> PICKED
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-xs text-slate-500 my-0.5">SKU: {item.sku}</p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded text-[11px] font-bold border border-blue-200">
                        ZONE {item.zone}
                      </span>
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-900 rounded font-mono text-[11px] font-bold border border-amber-200">
                        BIN: {item.bin}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-center sm:text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Picked / Req</span>
                      <span className={`text-xl font-black ${isItemComplete ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {count} / {item.requiredQty}
                      </span>
                    </div>
                    {!isItemComplete && (
                      <button
                        onClick={() => handleQuickPickItem(item.sku, item.requiredQty)}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-[#FF6A00] hover:text-white text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        Quick Pick
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <button
              onClick={() => setActivePickId(null)}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel Picking
            </button>

            <button
              onClick={handleCompletePicking}
              disabled={!isAllPicked}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                isAllPicked 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 size={16} /> Complete & Move to Quality Check
            </button>
          </div>
        </div>

        {/* REPORT EXCEPTION MODAL */}
        {showExceptionModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <form onSubmit={handleReportException} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                  <AlertTriangle size={18} />
                  <span>Report Picking Exception</span>
                </div>
                <button type="button" onClick={() => setShowExceptionModal(false)} className="p-1 hover:bg-slate-100 rounded-full"><X size={18} /></button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Issue Type</label>
                <select
                  value={exceptionReason}
                  onChange={e => setExceptionReason(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-white text-slate-800 outline-none"
                >
                  <option value="MISSING_STOCK">Missing Stock in Bin</option>
                  <option value="DAMAGED_ITEM">Item in Bin is Damaged</option>
                  <option value="WRONG_BARCODE">Barcode Scan Mismatch</option>
                  <option value="ZONE_BLOCKED">Zone Aisle Obstructed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Notes</label>
                <textarea
                  rows={3}
                  value={exceptionNotes}
                  onChange={e => setExceptionNotes(e.target.value)}
                  placeholder="Provide details for warehouse floor supervisor..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExceptionModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Submit Exception Ticket
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

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
          <h2 className="text-xl font-bold text-slate-900">Picking Waves Station</h2>
          <p className="text-xs text-slate-500 mt-1">Select an allocated wave or order to initiate digital barcode picking.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pickingOrders.map(order => (
          <div 
            key={order.id} 
            className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-[#FF6A00] transition group"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono font-bold text-slate-900 text-sm">{order.orderNumber}</span>
                  <p className="text-xs text-slate-500 mt-0.5">{order.customerName}</p>
                </div>
                {order.priority === 'EXPRESS' && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 font-extrabold text-[10px] rounded-full uppercase border border-red-200 animate-pulse">
                    Express
                  </span>
                )}
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Items to pick:</span>
                  <span className="font-bold text-slate-900">{order.itemCount} SKUs</span>
                </div>
                <div className="flex justify-between">
                  <span>Location zones:</span>
                  <span className="font-bold text-blue-700">Zone A & Zone B</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-bold text-slate-900">{order.status}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleStartPicking(order)}
              className="mt-4 w-full py-2.5 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-bold text-xs rounded-2xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ScanLine size={15} />
              <span>Start Picking Session</span>
            </button>
          </div>
        ))}

        {pickingOrders.length === 0 && (
          <div className="col-span-full p-12 text-center text-slate-500 bg-white rounded-3xl border border-dashed border-slate-300">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-slate-700">No orders awaiting picking at this time</p>
            <p className="text-xs text-slate-400 mt-1">All waves are fulfilled or progressing through packing stations.</p>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { PickupOrder } from '../types';
import { ScanBarcode, ShieldAlert, CheckCircle2, Search, ArrowRight, Package } from 'lucide-react';

interface Props {
  orders: PickupOrder[];
  setOrders: React.Dispatch<React.SetStateAction<PickupOrder[]>>;
}

export const IncomingPackagesView: React.FC<Props> = ({ orders, setOrders }) => {
  const [scanInput, setScanInput] = useState('');
  const [scannedPkg, setScannedPkg] = useState<PickupOrder | null>(null);

  const incoming = orders.filter(o => o.status === 'INCOMING');

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    const pkg = incoming.find(o => o.packageId === scanInput || o.orderId === scanInput);
    if (pkg) {
      setScannedPkg(pkg);
    } else {
      alert('Package not found in incoming manifest.');
    }
    setScanInput('');
  };

  const markReceived = (condition: 'GOOD' | 'DAMAGED') => {
    if (!scannedPkg) return;
    setOrders(prev => prev.map(o => 
      o.id === scannedPkg.id 
        ? { ...o, status: 'RECEIVED', arrivalStatus: 'ARRIVED', condition, arrivedAt: new Date().toISOString() } 
        : o
    ));
    setScannedPkg(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 flex flex-col md:flex-row gap-6">
      {/* Scan / Receive Area */}
      <div className="md:w-1/3 space-y-4">
        <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm">
          <h3 className="font-bold mb-4 flex items-center gap-2"><ScanBarcode className="w-5 h-5 text-teal-400" /> Scanner Input</h3>
          <form onSubmit={handleScan} className="flex gap-2">
            <input 
              type="text" 
              autoFocus
              value={scanInput}
              onChange={e => setScanInput(e.target.value)}
              placeholder="Scan Barcode (e.g. PKG-1002-A)"
              className="flex-1 bg-slate-800 border-transparent rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none text-white font-mono"
            />
            <button type="submit" className="bg-teal-600 hover:bg-teal-500 px-4 py-2 rounded-lg font-bold text-sm transition">
              Scan
            </button>
          </form>
          <p className="text-xs text-slate-400 mt-3">Waiting for scanner input...</p>
        </div>

        {scannedPkg && (
          <div className="bg-white border border-teal-200 rounded-xl p-6 shadow-lg animate-in slide-in-from-top-2">
             <div className="flex justify-between items-start mb-4">
               <div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Scanned Package</h3>
                  <p className="text-xl font-bold font-mono text-slate-900 mt-1">{scannedPkg.packageId}</p>
               </div>
               <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs font-bold">{scannedPkg.deliveryType}</span>
             </div>
             
             <div className="space-y-2 text-sm text-slate-600 mb-6 border-t border-slate-100 pt-4">
               <p><span className="font-semibold text-slate-800">Order:</span> {scannedPkg.orderId}</p>
               <p><span className="font-semibold text-slate-800">Customer:</span> {scannedPkg.customerName}</p>
               <p><span className="font-semibold text-slate-800">Pieces:</span> {scannedPkg.packageCount}</p>
             </div>

             <div className="space-y-3">
               <p className="text-xs font-bold text-slate-800 text-center uppercase tracking-wider">Confirm Condition</p>
               <button 
                  onClick={() => markReceived('GOOD')}
                  className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-bold transition"
               >
                 <CheckCircle2 className="w-5 h-5" /> Receive - Condition Good
               </button>
               <button 
                 onClick={() => markReceived('DAMAGED')}
                 className="w-full flex items-center justify-center gap-2 bg-white border-2 border-rose-200 text-rose-600 hover:bg-rose-50 py-3 rounded-xl font-bold transition"
               >
                 <ShieldAlert className="w-5 h-5" /> Report Damaged / Tampered
               </button>
             </div>
          </div>
        )}
      </div>

      {/* Manifest Area */}
      <div className="md:w-2/3">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-140px)]">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Expected Incoming Manifest</h3>
            <span className="text-sm font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">{incoming.length} Packages</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {incoming.map(pkg => (
              <div key={pkg.id} className="border border-slate-200 rounded-lg p-4 flex items-center justify-between hover:border-teal-300 transition group cursor-pointer" onClick={() => setScannedPkg(pkg)}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-slate-900">{pkg.packageId}</span>
                    {pkg.deliveryType === 'EXPRESS' && <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">Express</span>}
                  </div>
                  <p className="text-sm text-slate-500">Order: {pkg.orderId} • Cust: {pkg.customerName}</p>
                </div>
                <button className="opacity-0 group-hover:opacity-100 text-teal-600 flex items-center gap-1 text-sm font-bold transition">
                  Simulate Scan <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
            {incoming.length === 0 && (
              <div className="text-center text-slate-400 py-12">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No incoming packages expected right now.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

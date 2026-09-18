import React, { useState } from 'react';
import { PickupOrder } from '../types';
import { Map, Layers, Send, Search, CheckCircle } from 'lucide-react';

interface Props {
  orders: PickupOrder[];
  setOrders: React.Dispatch<React.SetStateAction<PickupOrder[]>>;
}

export const StorageManagementView: React.FC<Props> = ({ orders, setOrders }) => {
  const [selectedPkg, setSelectedPkg] = useState<PickupOrder | null>(null);
  const [shelfInput, setShelfInput] = useState('');

  const received = orders.filter(o => o.status === 'RECEIVED');
  const stored = orders.filter(o => o.status === 'STORED' || o.status === 'READY' || o.status === 'NOTIFIED');

  const assignStorage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPkg || !shelfInput) return;

    setOrders(prev => prev.map(o => 
      o.id === selectedPkg.id 
        ? { ...o, status: 'STORED', shelfLocation: shelfInput } 
        : o
    ));
    setSelectedPkg(null);
    setShelfInput('');
  };

  const notifyCustomer = (id: string) => {
    let otp = '';
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const array = new Uint32Array(1);
      window.crypto.getRandomValues(array);
      otp = (100000 + (array[0] % 900000)).toString();
    } else {
      otp = Math.floor(100000 + (window.crypto.getRandomValues(new Uint32Array(1))[0] % 900000)).toString();
    }

    setOrders(prev => prev.map(o => 
      o.id === id 
        ? { 
            ...o, 
            status: 'NOTIFIED', 
            pickupOtpCode: otp,
            pickupDeadline: new Date(Date.now() + 172800000).toISOString() 
          } 
        : o
    ));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 flex flex-col lg:flex-row gap-6">
      {/* Action Column */}
      <div className="lg:w-1/3 space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col max-h-[500px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-800">Requires Shelving ({received.length})</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {received.map(pkg => (
              <div 
                key={pkg.id} 
                onClick={() => setSelectedPkg(pkg)}
                className={`border rounded-lg p-3 cursor-pointer transition ${selectedPkg?.id === pkg.id ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-teal-300'}`}
              >
                <p className="font-mono font-bold text-slate-900 text-sm">{pkg.packageId}</p>
                <p className="text-xs text-slate-500 mt-1">Cust: {pkg.customerName}</p>
              </div>
            ))}
            {received.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No packages need shelving.</p>}
          </div>
        </div>

        {selectedPkg && (
           <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm animate-in slide-in-from-bottom-2">
             <h3 className="font-bold mb-4 flex items-center gap-2"><Layers className="w-5 h-5 text-teal-400" /> Assign Location</h3>
             <p className="font-mono text-xl text-teal-400 mb-4">{selectedPkg.packageId}</p>
             <form onSubmit={assignStorage} className="space-y-4">
               <div>
                 <label className="text-xs text-slate-400 block mb-1 uppercase tracking-wider">Scan or Type Bin Location</label>
                 <input 
                   type="text" 
                   autoFocus
                   value={shelfInput}
                   onChange={e => setShelfInput(e.target.value)}
                   placeholder="e.g. A-04-12"
                   className="w-full bg-slate-800 border-transparent rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none text-white font-mono uppercase"
                 />
               </div>
               <button type="submit" className="w-full bg-teal-600 hover:bg-teal-500 py-3 rounded-lg font-bold transition">
                 Confirm Storage
               </button>
             </form>
           </div>
        )}
      </div>

      {/* Map / Inventory Column */}
      <div className="lg:w-2/3 space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-140px)]">
           <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Map className="w-4 h-4 text-slate-400" /> Station Inventory</h3>
            <div className="flex gap-2 text-xs">
               <span className="px-2 py-1 bg-slate-100 rounded text-slate-600">Stored: {stored.length}</span>
               <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded font-bold">Cap: 41%</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 font-semibold">Location</th>
                  <th className="py-3 px-4 font-semibold">Package ID</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stored.map(pkg => (
                  <tr key={pkg.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                       <span className="bg-slate-800 text-white px-2 py-1 rounded font-mono text-xs shadow-sm">
                         {pkg.shelfLocation}
                       </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{pkg.packageId}</td>
                    <td className="py-3 px-4">{pkg.customerName}</td>
                    <td className="py-3 px-4">
                      {pkg.status === 'STORED' && <span className="text-slate-500 font-semibold text-xs">Stored</span>}
                      {pkg.status === 'NOTIFIED' && <span className="text-teal-600 font-semibold text-xs flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Customer Notified</span>}
                      {pkg.status === 'READY' && <span className="text-emerald-600 font-semibold text-xs flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Ready</span>}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {(pkg.status === 'STORED' || pkg.status === 'READY') && (
                        <button 
                          onClick={() => notifyCustomer(pkg.id)}
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ml-auto"
                        >
                          <Send className="w-3.5 h-3.5" /> Notify Buyer
                        </button>
                      )}
                      {pkg.status === 'NOTIFIED' && (
                         <span className="text-slate-400 text-xs">Awaiting Pickup</span>
                      )}
                    </td>
                  </tr>
                ))}
                {stored.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">Inventory is empty.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

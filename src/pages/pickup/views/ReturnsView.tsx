import React, { useState } from 'react';
import { PickupReturn } from '../types';
import { ArrowLeftRight, Check, X, Search, FileText } from 'lucide-react';

interface Props {
  returns: PickupReturn[];
  setReturns: React.Dispatch<React.SetStateAction<PickupReturn[]>>;
}

export const ReturnsView: React.FC<Props> = ({ returns, setReturns }) => {
  const [selectedReturn, setSelectedReturn] = useState<PickupReturn | null>(null);

  const receiveReturn = (id: string, action: 'APPROVE' | 'REJECT') => {
    setReturns(prev => prev.map(r => 
      r.id === id ? { ...r, status: action === 'APPROVE' ? 'RECEIVED' : 'REJECTED' } : r
    ));
    setSelectedReturn(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 flex flex-col md:flex-row gap-6">
      <div className="md:w-2/3">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden h-[calc(100vh-140px)] flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Customer Returns Queue</h3>
            <div className="relative">
               <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
               <input type="text" placeholder="Search Return ID..." className="pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-0">
             <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white text-slate-500 border-b border-slate-100 sticky top-0">
                <tr>
                  <th className="py-3 px-4 font-semibold">Return ID</th>
                  <th className="py-3 px-4 font-semibold">Order</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {returns.map(ret => (
                  <tr key={ret.id} className={`hover:bg-slate-50 transition cursor-pointer ${selectedReturn?.id === ret.id ? 'bg-blue-50/50' : ''}`} onClick={() => setSelectedReturn(ret)}>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{ret.id}</td>
                    <td className="py-3 px-4 text-slate-500">{ret.orderId}</td>
                    <td className="py-3 px-4">{ret.customerName}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        ret.status === 'REQUESTED' ? 'bg-amber-100 text-amber-800' :
                        ret.status === 'RECEIVED' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {ret.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                       <button className="text-blue-600 font-semibold text-xs hover:underline">View</button>
                    </td>
                  </tr>
                ))}
                {returns.length === 0 && (
                  <tr><td colSpan={5} className="py-12 text-center text-slate-500">No returns in queue.</td></tr>
                )}
              </tbody>
             </table>
          </div>
        </div>
      </div>

      <div className="md:w-1/3">
        {selectedReturn ? (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm sticky top-6">
             <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><ArrowLeftRight className="w-6 h-6" /></div>
                <div>
                   <h3 className="font-bold text-lg text-slate-900">Return Intake</h3>
                   <p className="text-sm font-mono text-slate-500">{selectedReturn.id}</p>
                </div>
             </div>

             <div className="space-y-4 text-sm text-slate-600 mb-8">
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400 mb-1">Product</p>
                  <p className="font-semibold text-slate-800">{selectedReturn.productName}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400 mb-1">Customer Reason</p>
                  <p className="bg-slate-50 p-3 rounded-lg border border-slate-100">{selectedReturn.reason}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400 mb-1">Declared Condition</p>
                  <p className="font-semibold text-rose-600">{selectedReturn.condition}</p>
                </div>
             </div>

             {selectedReturn.status === 'REQUESTED' ? (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-800 text-center uppercase">Station Inspection Action</p>
                  <button 
                    onClick={() => receiveReturn(selectedReturn.id, 'APPROVE')}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition"
                  >
                    <Check className="w-5 h-5" /> Accept Return Package
                  </button>
                  <button 
                    onClick={() => receiveReturn(selectedReturn.id, 'REJECT')}
                    className="w-full bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition"
                  >
                    <X className="w-5 h-5" /> Reject (Does not match)
                  </button>
                </div>
             ) : (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                  <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="font-bold text-slate-700">Return Processed</p>
                  <p className="text-xs text-slate-500 mt-1">Status: {selectedReturn.status}</p>
                </div>
             )}
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-400 flex flex-col items-center justify-center h-[300px]">
            <ArrowLeftRight className="w-12 h-12 mb-3 opacity-50" />
            <p>Select a return from the queue<br/>to inspect and process.</p>
          </div>
        )}
      </div>
    </div>
  );
};

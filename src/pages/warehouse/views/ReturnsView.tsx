import React, { useState } from 'react';
import { RotateCcw, Check, X, Search, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, DollarSign, Package, Eye } from 'lucide-react';
import { formatTZS } from '../../../utils/formatters';

interface ReturnItem {
  id: string;
  returnNumber: string;
  orderNumber: string;
  customerName: string;
  productName: string;
  sku: string;
  reason: string;
  amount: number;
  status: 'PENDING_INSPECTION' | 'INSPECTED' | 'RESTOCKED' | 'VENDOR_RETURN' | 'REFUNDED';
  grade?: 'GRADE_A' | 'GRADE_B' | 'GRADE_C';
  createdAt: string;
}

const INITIAL_RETURNS: ReturnItem[] = [
  {
    id: 'ret-101',
    returnNumber: 'RET-TZ-8801',
    orderNumber: 'LM-2026-99120',
    customerName: 'Fatma Juma',
    productName: 'Samsung Galaxy S24 Ultra 256GB',
    sku: 'SAM-S24U-256',
    reason: 'Color shade different from screen preview; packaging unopened',
    amount: 2850000,
    status: 'PENDING_INSPECTION',
    createdAt: '2026-08-27 09:15'
  },
  {
    id: 'ret-102',
    returnNumber: 'RET-TZ-8802',
    orderNumber: 'LM-2026-99118',
    customerName: 'Emanuel Minja',
    productName: 'Anker 65W GaN Fast Charger',
    sku: 'ANK-GAN-65W',
    reason: 'Intermittent charging connection on USB-C port 2',
    amount: 145000,
    status: 'PENDING_INSPECTION',
    createdAt: '2026-08-27 08:30'
  },
  {
    id: 'ret-103',
    returnNumber: 'RET-TZ-8803',
    orderNumber: 'LM-2026-99084',
    customerName: 'Neema Mwangi',
    productName: 'Nike Air Max 270 (Size 42)',
    sku: 'NK-AM270-42',
    reason: 'Size too tight, requested size 43 exchange',
    amount: 320000,
    status: 'RESTOCKED',
    grade: 'GRADE_A',
    createdAt: '2026-08-26 16:40'
  }
];

export const ReturnsView: React.FC = () => {
  const [returns, setReturns] = useState<ReturnItem[]>(INITIAL_RETURNS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedReturn, setSelectedReturn] = useState<ReturnItem | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<'GRADE_A' | 'GRADE_B' | 'GRADE_C'>('GRADE_A');
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const filteredReturns = returns.filter(r => {
    const matchesSearch = r.returnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleInspectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReturn) return;

    const nextStatus = selectedGrade === 'GRADE_A' ? 'RESTOCKED' : selectedGrade === 'GRADE_B' ? 'INSPECTED' : 'VENDOR_RETURN';

    setReturns(prev => prev.map(r => {
      if (r.id === selectedReturn.id) {
        return {
          ...r,
          status: nextStatus,
          grade: selectedGrade
        };
      }
      return r;
    }));

    showToast(`Return ${selectedReturn.returnNumber} graded as ${selectedGrade}. Escrow refund of ${formatTZS(selectedReturn.amount)} authorized!`);
    setSelectedReturn(null);
    setInspectionNotes('');
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
          <h2 className="text-xl font-bold text-slate-900">Returns & Reverse Logistics Inspection</h2>
          <p className="text-xs text-slate-500 mt-1">Inspect returned merchandise, restock sellable items, and trigger escrow buyer refunds.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex-1 flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search Return ID, Order Number, Customer..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#FF6A00] focus:border-[#FF6A00] outline-none"
            />
          </div>
          <select 
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer"
          >
            <option value="ALL">All Return Statuses</option>
            <option value="PENDING_INSPECTION">Pending Inspection</option>
            <option value="RESTOCKED">Restocked to Bin</option>
            <option value="VENDOR_RETURN">Return to Vendor (RTV)</option>
          </select>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 sticky top-0 z-10 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Return ID & Order</th>
                <th className="py-3 px-4">Customer & Claim</th>
                <th className="py-3 px-4">Item & SKU</th>
                <th className="py-3 px-4">Escrow Value</th>
                <th className="py-3 px-4">Condition Grade</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredReturns.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 font-mono text-xs">{item.returnNumber}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">Order: {item.orderNumber}</div>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs truncate">
                    <div className="font-bold text-slate-800">{item.customerName}</div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5" title={item.reason}>{item.reason}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{item.productName}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">SKU: {item.sku}</div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                    {formatTZS(item.amount)}
                  </td>
                  <td className="py-3.5 px-4">
                    {item.grade === 'GRADE_A' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Grade A (New)</span>
                    ) : item.grade === 'GRADE_B' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">Grade B (Refurb)</span>
                    ) : item.grade === 'GRADE_C' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">Grade C (Damaged)</span>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Uninspected</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                      item.status === 'RESTOCKED' ? 'bg-emerald-100 text-emerald-800' :
                      item.status === 'PENDING_INSPECTION' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {(item.status || '').replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {item.status === 'PENDING_INSPECTION' ? (
                      <button 
                        onClick={() => setSelectedReturn(item)}
                        className="px-3 py-1.5 bg-[#FF6A00] hover:bg-[#E55E00] text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                      >
                        Inspect Return
                      </button>
                    ) : (
                      <button 
                        onClick={() => setSelectedReturn(item)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        View Inspection
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredReturns.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              <RotateCcw className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700">No return requests match filter criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* INSPECT RETURN MODAL */}
      {selectedReturn && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleInspectSubmit} className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                <ShieldCheck size={18} className="text-[#FF6A00]" />
                <span>Return Item Inspection & Escrow Refund</span>
              </div>
              <button type="button" onClick={() => setSelectedReturn(null)} className="p-1 hover:bg-slate-100 rounded-full"><X size={18} /></button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <div className="flex justify-between">
                <span className="font-bold text-slate-900 text-xs">{selectedReturn.returnNumber}</span>
                <span className="font-mono text-slate-500">Order: {selectedReturn.orderNumber}</span>
              </div>
              <p className="font-bold text-slate-800">{selectedReturn.productName}</p>
              <p className="text-slate-600 bg-white p-2 rounded-xl border border-slate-200">
                <strong>Buyer Stated Issue:</strong> "{selectedReturn.reason}"
              </p>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Inspection Condition Assessment</label>
              <div className="grid grid-cols-3 gap-2">
                <div 
                  onClick={() => setSelectedGrade('GRADE_A')}
                  className={`p-3 rounded-2xl border cursor-pointer text-center transition ${
                    selectedGrade === 'GRADE_A' ? 'bg-emerald-50 border-emerald-500 text-emerald-900' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <p className="font-extrabold text-xs">Grade A</p>
                  <p className="text-[10px] mt-0.5">Brand New / Restock to Bin</p>
                </div>

                <div 
                  onClick={() => setSelectedGrade('GRADE_B')}
                  className={`p-3 rounded-2xl border cursor-pointer text-center transition ${
                    selectedGrade === 'GRADE_B' ? 'bg-blue-50 border-blue-500 text-blue-900' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <p className="font-extrabold text-xs">Grade B</p>
                  <p className="text-[10px] mt-0.5">Open Box / Clearance</p>
                </div>

                <div 
                  onClick={() => setSelectedGrade('GRADE_C')}
                  className={`p-3 rounded-2xl border cursor-pointer text-center transition ${
                    selectedGrade === 'GRADE_C' ? 'bg-red-50 border-red-500 text-red-900' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <p className="font-extrabold text-xs">Grade C</p>
                  <p className="text-[10px] mt-0.5">Damaged / Return to Vendor</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Inspector Notes</label>
              <textarea
                rows={2}
                value={inspectionNotes}
                onChange={e => setInspectionNotes(e.target.value)}
                placeholder="Log physical seal condition, serial number verification..."
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-white outline-none"
              />
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">Automatic Escrow Refund</span>
                <span className="font-bold text-slate-900 text-sm font-mono">{formatTZS(selectedReturn.amount)}</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-lg">Instant Buyer Credit</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedReturn(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-bold rounded-xl transition cursor-pointer"
              >
                Authorize & Finalize
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, X, ShieldAlert, Check, RefreshCw } from 'lucide-react';
import { WHException } from '../types';

interface AlertsViewProps {
  exceptions: WHException[];
}

export const AlertsView: React.FC<AlertsViewProps> = ({ exceptions: initialExceptions }) => {
  const [exceptions, setExceptions] = useState<WHException[]>(initialExceptions);
  const [selectedException, setSelectedException] = useState<WHException | null>(null);
  const [resolutionAction, setResolutionAction] = useState('REPICK_ZONE_B');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedException) return;

    setExceptions(prev => prev.map(exc => {
      if (exc.id === selectedException.id) {
        return {
          ...exc,
          status: 'RESOLVED'
        };
      }
      return exc;
    }));

    showToast(`Exception #${selectedException.id} marked as RESOLVED (${resolutionAction.replace(/_/g, ' ')}).`);
    setSelectedException(null);
    setResolutionNotes('');
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
          <h2 className="text-xl font-bold text-slate-900">Warehouse Exceptions & Floor Alerts</h2>
          <p className="text-xs text-slate-500 mt-1">Manage picking shortages, barcode discrepancies, damaged bin stock, and floor escalations.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 sticky top-0 z-10 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Exception Type</th>
                <th className="py-3 px-4">Priority SLA</th>
                <th className="py-3 px-4">Context (Order / SKU)</th>
                <th className="py-3 px-4">Reported By</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {exceptions.map(exception => (
                <tr key={exception.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900 text-xs">
                    {(exception.type || '').replace(/_/g, ' ')}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      exception.priority === 'HIGH' || exception.priority === 'URGENT' ? 'bg-red-100 text-red-700 border border-red-200' : 
                      exception.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {exception.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-mono text-slate-600">
                    {exception.orderId && <div>Order: <span className="font-bold text-slate-800">{exception.orderId}</span></div>}
                    {exception.sku && <div>SKU: <span className="font-bold text-slate-800">{exception.sku}</span></div>}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">
                    {exception.reportedBy}
                  </td>
                  <td className="py-3.5 px-4">
                     <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      exception.status === 'OPEN' ? 'bg-amber-100 text-amber-800' : 
                      exception.status === 'INVESTIGATING' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {exception.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {exception.status !== 'RESOLVED' ? (
                      <button 
                        onClick={() => setSelectedException(exception)}
                        className="px-3 py-1.5 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-xs"
                      >
                        Resolve Issue
                      </button>
                    ) : (
                      <span className="text-emerald-700 font-bold text-xs flex items-center gap-1 justify-end">
                        <Check size={14} /> Solved
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {exceptions.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-700">No active warehouse exceptions.</p>
            </div>
          )}
        </div>
      </div>

      {/* RESOLVE EXCEPTION MODAL */}
      {selectedException && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleResolveSubmit} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                <ShieldAlert size={18} className="text-[#FF6A00]" />
                <span>Resolve Warehouse Exception</span>
              </div>
              <button type="button" onClick={() => setSelectedException(null)} className="p-1 hover:bg-slate-100 rounded-full"><X size={18} /></button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <p className="font-bold text-slate-900 text-xs">Type: {(selectedException.type || '').replace(/_/g, ' ')}</p>
              <p className="text-slate-500 font-mono text-[10px]">Context: {selectedException.orderId || selectedException.sku || 'General Floor'}</p>
              <p className="text-slate-600">Reported by: <span className="font-semibold text-slate-900">{selectedException.reportedBy}</span></p>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Resolution Action</label>
              <select
                value={resolutionAction}
                onChange={e => setResolutionAction(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-white outline-none"
              >
                <option value="REPICK_ZONE_B">Re-allocate and Pick from Backup Zone B Bin</option>
                <option value="CYCLE_COUNT_ADJUST">Perform Instant Cycle Count & Mark Bin Depleted</option>
                <option value="REPLACE_DAMAGED">Replace Damaged Unit with Fresh Merchant Stock</option>
                <option value="ESCALATE_VENDOR">Escalate to Vendor for Emergency Inbound Restock</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Supervisor Resolution Notes</label>
              <textarea
                rows={2}
                value={resolutionNotes}
                onChange={e => setResolutionNotes(e.target.value)}
                placeholder="Document actions taken..."
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-white outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedException(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-bold rounded-xl transition cursor-pointer"
              >
                Confirm Resolution
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

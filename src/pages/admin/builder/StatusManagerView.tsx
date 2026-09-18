import React, { useState } from 'react';
import { Activity, Plus, Trash2, X } from 'lucide-react';
import { useBuilderConfig } from '../../../hooks/useBuilderConfig';

interface StatusDef {
  id: string;
  entity: string;
  code: string;
  label: string;
  color: string;
}

const defaultStatuses: StatusDef[] = [
  { id: 'st-1', entity: 'Order', code: 'PENDING_PAYMENT', label: 'Pending Payment', color: 'bg-amber-100 text-amber-800' },
  { id: 'st-2', entity: 'Order', code: 'PROCESSING', label: 'Processing & Picking', color: 'bg-blue-100 text-blue-800' },
  { id: 'st-3', entity: 'Order', code: 'SHIPPED', label: 'Dispatched / In-Transit', color: 'bg-purple-100 text-purple-800' },
  { id: 'st-4', entity: 'Order', code: 'DELIVERED', label: 'Delivered & Completed', color: 'bg-emerald-100 text-emerald-800' },
  { id: 'st-5', entity: 'Order', code: 'CANCELLED', label: 'Order Cancelled', color: 'bg-rose-100 text-rose-800' },
  { id: 'st-6', entity: 'Vendor', code: 'PENDING_KYC', label: 'KYC Document Required', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'st-7', entity: 'Vendor', code: 'UNDER_REVIEW', label: 'Under Review', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'st-8', entity: 'Vendor', code: 'APPROVED', label: 'Verified Active Merchant', color: 'bg-emerald-100 text-emerald-800' },
  { id: 'st-9', entity: 'Vendor', code: 'SUSPENDED', label: 'Account Suspended', color: 'bg-rose-100 text-rose-800' },
  { id: 'st-10', entity: 'Product', code: 'PENDING_MODERATION', label: 'Pending Quality Moderation', color: 'bg-amber-100 text-amber-800' },
  { id: 'st-11', entity: 'Product', code: 'APPROVED', label: 'Live on Marketplace', color: 'bg-emerald-100 text-emerald-800' },
  { id: 'st-12', entity: 'Rider', code: 'AVAILABLE', label: 'Online & Available', color: 'bg-emerald-100 text-emerald-800' },
  { id: 'st-13', entity: 'Rider', code: 'ON_DISPATCH', label: 'En-Route with Order', color: 'bg-blue-100 text-blue-800' },
  { id: 'st-14', entity: 'Payout', code: 'ESCROW_HOLD', label: 'Escrow Security Hold', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'st-15', entity: 'Payout', code: 'DISBURSED', label: 'Disbursed to Bank/Wallet', color: 'bg-emerald-100 text-emerald-800' }
];

export const StatusManagerView = () => {
  const { data: statuses, updateConfig: setStatuses, isSaving } = useBuilderConfig('statusManager', defaultStatuses);
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState('');
  const [label, setLabel] = useState('');
  const [entity, setEntity] = useState('Order');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !label.trim()) return;
    const newStatus: StatusDef = {
      id: `st-${Date.now()}`,
      entity,
      code: code.toUpperCase(),
      label,
      color: 'bg-slate-100 text-slate-700'
    };
    setStatuses([...statuses, newStatus]);
    setShowModal(false);
    setCode('');
    setLabel('');
  };

  const deleteStatus = (id: string) => {
    if (confirm('Are you sure you want to delete this status?')) {
      setStatuses(statuses.filter((s: any) => s.id !== id));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Status Manager</h2>
          <p className="text-sm text-slate-500">Configure global lifecycle states for orders, vendors, and products.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer">
          <Plus className="w-4 h-4" /> New Status
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
            <tr>
              <th className="p-4">Entity</th>
              <th className="p-4">System Code</th>
              <th className="p-4">Display Label</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {statuses.map((s: any) => (
              <tr key={s.id} className="hover:bg-slate-50/50">
                <td className="p-4 font-bold text-slate-800">{s.entity}</td>
                <td className="p-4"><span className="font-mono text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">{s.code}</span></td>
                <td className="p-4"><span className={`px-2.5 py-1 rounded-md text-xs font-bold ${s.color}`}>{s.label}</span></td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => deleteStatus(s.id)} className="p-1.5 text-slate-400 hover:text-rose-600 transition"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Define Status</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:bg-slate-100 p-1 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4 text-sm">
              <div>
                <label className="font-semibold block mb-1">Entity</label>
                <select value={entity} onChange={e => setEntity(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white">
                  <option value="Order">Order</option>
                  <option value="Vendor">Vendor</option>
                  <option value="Product">Product</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">System Code (Unique)</label>
                <input required value={code} onChange={e => setCode(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono" placeholder="e.g. IN_TRANSIT" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Display Label</label>
                <input required value={label} onChange={e => setLabel(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300" placeholder="e.g. In Transit" />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-xl font-semibold">Cancel</button>
                <button type="submit" disabled={isSaving} className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl">{isSaving ? 'Saving...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

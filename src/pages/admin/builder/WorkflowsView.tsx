import React, { useState } from 'react';
import { useBuilderConfig } from '../../../hooks/useBuilderConfig';
import { GitBranch, Plus, Play, Pause, Settings, Trash2 } from 'lucide-react';
import { WorkflowModal } from './WorkflowModal';

interface Workflow {
  id: string;
  name: string;
  trigger: string;
  stepsCount: number;
  active: boolean;
}

const initialWorkflows: Workflow[] = [
  { id: 'wf-1', name: 'Vendor KYC & Anti-Fraud Verification Pipeline', trigger: 'Vendor Registration Submitted', stepsCount: 5, active: true },
  { id: 'wf-2', name: 'High-Value Order Escrow Hold & Approval Pipeline', trigger: 'Order Amount > 1,000,000 TZS', stepsCount: 4, active: true },
  { id: 'wf-3', name: 'Automated Refund & Dispute Mediation Pipeline', trigger: 'Customer Dispute Filed', stepsCount: 4, active: true },
  { id: 'wf-4', name: 'Rider Proximity Dispatch & Anti-Collision Pipeline', trigger: 'Order Ready for Pickup', stepsCount: 3, active: true },
  { id: 'wf-5', name: 'Pickup Station Parcel Inbound & OTP Handover Pipeline', trigger: 'Package Arrived at Station', stepsCount: 4, active: true },
  { id: 'wf-6', name: 'Damage Claim Inspection & Seller Audit Pipeline', trigger: 'Damage Claim Submitted', stepsCount: 5, active: true },
  { id: 'wf-7', name: 'Flash Sale Automatic Activation & Stock Guard Pipeline', trigger: 'Inventory Sold Ratio >= 90%', stepsCount: 3, active: true }
];

export const WorkflowsView = () => {
  const { data: workflows, updateConfig: setWorkflows } = useBuilderConfig('workflows', initialWorkflows);
  const [showModal, setShowModal] = useState(false);
  const [editingWf, setEditingWf] = useState<any>(null);

  const toggleActive = (id: string) => {
    setWorkflows(workflows.map((w: any) => w.id === id ? { ...w, active: !w.active } : w));
  };

  const deleteWorkflow = (id: string) => {
    if (confirm('Are you sure you want to delete this workflow pipeline?')) {
      setWorkflows(workflows.filter((w: any) => w.id !== id));
    }
  };

  const handleSaveModal = (data: any, status: string) => {
    const newWf = { ...data, stepsCount: data.stepsCount || 3, active: status === 'PUBLISHED' };
    if (!newWf.id) newWf.id = `wf-${Date.now()}`;
    let newWorkflows = [...workflows];
    if (editingWf) {
      newWorkflows = newWorkflows.map((w: any) => w.id === newWf.id ? newWf : w);
    } else {
      newWorkflows.push(newWf);
    }
    setWorkflows(newWorkflows);
    setShowModal(false);
    setEditingWf(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Automated Workflows & Pipelines</h2>
          <p className="text-sm text-slate-500">Design multi-step event triggers, approvals, and system state transitions.</p>
        </div>
        <button
          onClick={() => { setEditingWf(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" /> Create Workflow
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold">
            <tr>
              <th className="py-3 px-4">Workflow Name</th>
              <th className="py-3 px-4">Trigger Event</th>
              <th className="py-3 px-4">Steps</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {workflows.map((wf: any) => (
              <tr key={wf.id} className="hover:bg-slate-50 transition">
                <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-blue-600 shrink-0" />
                  {wf.name}
                </td>
                <td className="py-3 px-4 font-mono text-slate-600">{wf.trigger}</td>
                <td className="py-3 px-4 text-slate-600 font-bold">{wf.stepsCount} Steps</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => toggleActive(wf.id)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase cursor-pointer transition ${
                      wf.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {wf.active ? 'Active' : 'Disabled'}
                  </button>
                </td>
                <td className="py-3 px-4 text-right flex justify-end gap-1">
                  <button
                    onClick={() => { setEditingWf(wf); setShowModal(true); }}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition cursor-pointer"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteWorkflow(wf.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <WorkflowModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveModal}
        initialData={editingWf || {}}
      />
    </div>
  );
};

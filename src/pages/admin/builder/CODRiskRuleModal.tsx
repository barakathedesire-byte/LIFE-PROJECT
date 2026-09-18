import React, { useState } from 'react';
import { SearchableSelect } from '../../../components/common/SearchableSelect';
import { X, ShieldAlert, CheckCircle, Save } from 'lucide-react';

export const COD_TRIGGERS = [
  'Order Cancelled',
  'Delivery Failed',
  'Pickup Failed',
  'Pickup Expired',
  'Customer Refused Delivery',
  'Order Not Collected',
  'Multiple Failed COD Orders'
];

export const RELEVANT_ORDER_STATES = [
  'Dispatched',
  'In Transit',
  'Out for Delivery',
  'Delivery Attempted',
  'Pickup Ready',
  'Pickup Expired',
  'Pickup Failed',
  'Refused',
  'Cancelled'
];

export const RESTRICTION_ACTIONS = [
  'Disable Pay on Delivery',
  'Require Prepayment',
  'Require Partial Payment',
  'Require Deposit',
  'Require Admin Review',
  'Flag Customer',
  'Block COD temporarily'
];

export const RESTRICTION_DURATIONS = [
  'Permanent',
  '7 days',
  '14 days',
  '30 days',
  '60 days',
  '90 days',
  'Custom'
];

export const REINSTATEMENT_METHODS = [
  'Automatic after restriction period',
  'Manual admin approval',
  'Customer support approval',
  'Successful prepaid orders',
  'Combination'
];

export interface CODRiskRuleConfig {
  id?: string;
  name: string;
  trigger: string;
  threshold: number;
  relevantStates: string[];
  paymentMethod: string;
  action: string;
  duration: string;
  reinstatementMethod: string;
  resetCriteriaOrdersCount: number;
  status: 'ENFORCED' | 'DRAFT';
}

interface CODRiskRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: CODRiskRuleConfig, status: string) => void;
  initialData?: CODRiskRuleConfig | null;
}

export const CODRiskRuleModal: React.FC<CODRiskRuleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [data, setData] = useState<CODRiskRuleConfig>({
    name: initialData?.name || 'Repeated COD Failure Protection',
    trigger: initialData?.trigger || 'Order Cancelled',
    threshold: initialData?.threshold ?? 2,
    relevantStates: initialData?.relevantStates || ['Dispatched', 'In Transit', 'Out for Delivery', 'Pickup Failed'],
    paymentMethod: initialData?.paymentMethod || 'Pay on Delivery',
    action: initialData?.action || 'Disable Pay on Delivery',
    duration: initialData?.duration || 'Permanent',
    reinstatementMethod: initialData?.reinstatementMethod || 'Manual admin approval',
    resetCriteriaOrdersCount: initialData?.resetCriteriaOrdersCount ?? 3,
    status: initialData?.status || 'ENFORCED'
  });

  if (!isOpen) return null;

  const handleSave = (status: string) => {
    onSave({ ...data, status: status === 'PUBLISHED' ? 'ENFORCED' : 'DRAFT' }, status);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-base">Configure Cash/Pay on Delivery Risk Rule</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:bg-slate-200 p-1.5 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Rule Name</label>
            <input
              type="text"
              value={data.name}
              onChange={e => setData({ ...data, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
              placeholder="e.g. Repeated COD Failure Protection"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Primary Failure Trigger</label>
              <SearchableSelect
                options={COD_TRIGGERS}
                value={data.trigger}
                onChange={val => setData({ ...data, trigger: val })}
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Failure Count Threshold</label>
              <input
                type="number"
                min={1}
                max={20}
                value={data.threshold}
                onChange={e => setData({ ...data, threshold: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold"
              />
              <p className="text-[10px] text-slate-400 mt-1">Default = 2 failed COD orders or uncollected pickup attempts.</p>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Relevant In-Transit Order States</label>
            <SearchableSelect
              options={RELEVANT_ORDER_STATES}
              value={data.relevantStates}
              onChange={vals => setData({ ...data, relevantStates: vals })}
              isMulti
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Restricted Payment Method</label>
              <select
                value={data.paymentMethod}
                onChange={e => setData({ ...data, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="Pay on Delivery">Pay on Delivery (COD)</option>
                <option value="Cash on Delivery">Cash on Delivery</option>
                <option value="All COD variants">All COD variants</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Customer Restriction Action</label>
              <SearchableSelect
                options={RESTRICTION_ACTIONS}
                value={data.action}
                onChange={val => setData({ ...data, action: val })}
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Restriction Duration</label>
              <SearchableSelect
                options={RESTRICTION_DURATIONS}
                value={data.duration}
                onChange={val => setData({ ...data, duration: val })}
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Reinstatement Method</label>
              <SearchableSelect
                options={REINSTATEMENT_METHODS}
                value={data.reinstatementMethod}
                onChange={val => setData({ ...data, reinstatementMethod: val })}
              />
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl space-y-2">
            <span className="font-bold text-amber-900 block text-xs">Reset / Risk Score Reduction Criteria</span>
            <div className="flex items-center gap-2">
              <span className="text-amber-800">Completing</span>
              <input
                type="number"
                min={1}
                value={data.resetCriteriaOrdersCount}
                onChange={e => setData({ ...data, resetCriteriaOrdersCount: Number(e.target.value) })}
                className="w-16 px-2 py-1 border border-amber-300 bg-white rounded text-center font-bold"
              />
              <span className="text-amber-800">successful prepaid orders reduces COD risk score by 1.</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button onClick={onClose} className="px-4 py-2 border border-slate-300 bg-white rounded-xl font-bold hover:bg-slate-100">
            Cancel
          </button>
          <div className="flex gap-2">
            <button onClick={() => handleSave('DRAFT')} className="px-4 py-2 border border-slate-300 bg-white rounded-xl font-bold hover:bg-slate-100 flex items-center gap-1">
              <Save className="w-4 h-4" /> Save Draft
            </button>
            <button onClick={() => handleSave('PUBLISHED')} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Enforce COD Rule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

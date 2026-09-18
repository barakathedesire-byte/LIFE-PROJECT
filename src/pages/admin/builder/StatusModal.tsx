import React from 'react';
import { BuilderModal } from '../../../components/builder/BuilderModal';
import { SearchableSelect } from '../../../components/common/SearchableSelect';

export const STATUS_ENTITIES = [
  'Order',
  'Payment',
  'Product',
  'Vendor',
  'Buyer',
  'Salesperson',
  'Inventory',
  'Return',
  'Refund',
  'Delivery',
  'Pickup',
  'Commission',
  'Support Ticket',
  'Promotion'
];

export const STATUS_PRESETS: Record<string, string[]> = {
  'Order': ['Pending', 'Processing', 'Packed', 'Dispatched', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled', 'Delivery Failed', 'COD Restricted'],
  'Vendor': ['APPLICATION_PENDING', 'KYC_PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'],
  'Product': ['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'OUT_OF_STOCK', 'ARCHIVED'],
  'Buyer': ['ACTIVE', 'UNVERIFIED', 'HIGH_RISK_FLAGGED', 'COD_RESTRICTED', 'SUSPENDED']
};

const BasicSection = ({ data, onChange }: any) => {
  const selectedEntity = data.entity || 'Order';

  return (
    <div className="space-y-4 text-xs">
      <h4 className="font-bold text-slate-800 text-base mb-2">1. Status Identity & Target Entity</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Status Name</label>
          <input
            type="text"
            value={data.name || ''}
            onChange={e => onChange({ name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
            placeholder="e.g. COD Restricted"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Target Entity</label>
          <SearchableSelect
            options={STATUS_ENTITIES}
            value={selectedEntity}
            onChange={val => onChange({ entity: val })}
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Internal Key / Enum</label>
          <input
            type="text"
            value={data.key || ''}
            onChange={e => onChange({ key: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
            placeholder="e.g. COD_RESTRICTED"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Color Badge Style</label>
          <select
            value={data.color || 'Amber'}
            onChange={e => onChange({ color: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
          >
            <option value="Emerald">Emerald (Success)</option>
            <option value="Blue">Blue (Info)</option>
            <option value="Amber">Amber (Warning)</option>
            <option value="Rose">Rose (Error / Critical)</option>
            <option value="Purple">Purple (Special)</option>
            <option value="Slate">Slate (Neutral)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

const BehaviorSection = ({ data, onChange }: any) => (
  <div className="space-y-3 text-xs">
    <h4 className="font-bold text-slate-800 text-base mb-2">2. Status Transition Rules & Constraints</h4>

    <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-2.5 rounded-lg border border-slate-200">
      <input
        type="checkbox"
        checked={Boolean(data.isInitial)}
        onChange={e => onChange({ isInitial: e.target.checked })}
        className="w-4 h-4"
      />
      <div>
        <span className="font-bold text-slate-800 block">Initial Default Status</span>
        <span className="text-[10px] text-slate-500">Automatically set when a new record is created.</span>
      </div>
    </label>

    <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-2.5 rounded-lg border border-slate-200">
      <input
        type="checkbox"
        checked={Boolean(data.isFinal)}
        onChange={e => onChange({ isFinal: e.target.checked })}
        className="w-4 h-4"
      />
      <div>
        <span className="font-bold text-slate-800 block">Terminal / Final Status</span>
        <span className="text-[10px] text-slate-500">No further status transitions allowed once reached.</span>
      </div>
    </label>

    <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-2.5 rounded-lg border border-slate-200">
      <input
        type="checkbox"
        checked={Boolean(data.reasonRequired)}
        onChange={e => onChange({ reasonRequired: e.target.checked })}
        className="w-4 h-4"
      />
      <div>
        <span className="font-bold text-slate-800 block">Require Reason Note</span>
        <span className="text-[10px] text-slate-500">User or staff must provide a mandatory note when moving to this status.</span>
      </div>
    </label>
  </div>
);

export const StatusModal: React.FC<any> = ({ isOpen, onClose, onSave, initialData }) => {
  return (
    <BuilderModal
      title={initialData?.id ? 'Edit Status' : 'Add Status'}
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      initialData={initialData || { name: '', entity: 'Order', color: 'Amber' }}
      sections={[
        { id: 'basic', label: 'Status Identity', component: BasicSection },
        { id: 'behavior', label: 'Behavior & Flow', component: BehaviorSection }
      ]}
    />
  );
};

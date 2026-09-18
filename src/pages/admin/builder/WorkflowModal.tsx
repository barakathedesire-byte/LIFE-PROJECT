import React from 'react';
import { BuilderModal } from '../../../components/builder/BuilderModal';
import { SearchableSelect } from '../../../components/common/SearchableSelect';
import { Zap, GitBranch, PlayCircle } from 'lucide-react';

export const WORKFLOW_TYPES = [
  'Order Workflow',
  'Vendor Approval Workflow',
  'Return Approval Workflow',
  'Refund Workflow',
  'KYC Verification Workflow',
  'Commission Payout Workflow',
  'Support Ticket Escalation',
  'Rider Dispatch Workflow',
  'Delivery Failure Workflow',
  'Pickup Expiry Workflow',
  'Customer COD Risk Restrict Workflow',
  'Customer COD Reinstatement Workflow',
  'Marketing Campaign Workflow',
  'Custom Workflow'
];

export const WORKFLOW_TRIGGERS = [
  'Record Created',
  'Record Updated',
  'Status Changed',
  'Field Value Changed',
  'Threshold Reached',
  'Time-based Schedule / Cron',
  'API Request / Webhook',
  'Form Submitted',
  'Payment Completed',
  'Payment Failed',
  'Order Cancelled',
  'Delivery Failed',
  'Pickup Expired',
  'Manual Button Trigger'
];

export const WORKFLOW_CONDITIONS = [
  'Field Equals Value',
  'Field Greater Than',
  'Field Less Than',
  'Field In List',
  'User Has Role',
  'Customer COD Failures >= Threshold',
  'Customer Risk Score > Threshold',
  'Vendor SLA Exceeded',
  'Order Total > Threshold',
  'Custom Logical Expression'
];

export const WORKFLOW_ACTIONS = [
  'Update Status',
  'Update Field Value',
  'Restrict COD Payment Option',
  'Reinstate COD Payment Option',
  'Send Email Notification',
  'Send SMS / WhatsApp Notification',
  'Send Push Notification',
  'Create Task',
  'Assign Task',
  'Trigger Webhook / API Call',
  'Generate Audit Log',
  'Flag Record / User',
  'Apply Commission Fee',
  'Hold Escrow Funds',
  'Release Escrow Funds'
];

const BasicSection = ({ data, onChange }: any) => (
  <div className="space-y-4 text-xs">
    <h4 className="font-bold text-slate-800 text-base mb-2">1. Workflow Identity & Predefined Type</h4>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block font-semibold text-slate-700 mb-1">Workflow Name</label>
        <input
          type="text"
          value={data.name || ''}
          onChange={e => onChange({ name: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
          placeholder="e.g. COD Risk Restriction Workflow"
        />
      </div>

      <div>
        <label className="block font-semibold text-slate-700 mb-1">Predefined Workflow Type</label>
        <SearchableSelect
          options={WORKFLOW_TYPES}
          value={data.workflowType || 'Customer COD Risk Restrict Workflow'}
          onChange={val => onChange({ workflowType: val, name: data.name || val })}
        />
      </div>

      <div>
        <label className="block font-semibold text-slate-700 mb-1">Unique Key</label>
        <input
          type="text"
          value={data.key || ''}
          onChange={e => onChange({ key: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
          placeholder="e.g. wf_cod_risk_restrict"
        />
      </div>

      <div>
        <label className="block font-semibold text-slate-700 mb-1">Target Entity</label>
        <SearchableSelect
          options={['Order', 'Customer', 'Vendor', 'DeliveryRun', 'Payment', 'Return', 'SupportTicket']}
          value={data.entity || 'Customer'}
          onChange={val => onChange({ entity: val })}
        />
      </div>
    </div>
  </div>
);

const StepDesignerSection = ({ data, onChange }: any) => (
  <div className="space-y-4 text-xs">
    <h4 className="font-bold text-slate-800 text-base mb-2">2. Trigger, Condition & Action Pipeline</h4>

    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
      <div>
        <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1">
          <Zap className="w-4 h-4 text-amber-500" /> Trigger Event
        </label>
        <SearchableSelect
          options={WORKFLOW_TRIGGERS}
          value={data.trigger || 'Threshold Reached'}
          onChange={val => onChange({ trigger: val })}
        />
      </div>

      <div>
        <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1">
          <GitBranch className="w-4 h-4 text-blue-500" /> Evaluation Condition
        </label>
        <SearchableSelect
          options={WORKFLOW_CONDITIONS}
          value={data.condition || 'Customer COD Failures >= Threshold'}
          onChange={val => onChange({ condition: val })}
        />
      </div>

      <div>
        <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1">
          <PlayCircle className="w-4 h-4 text-emerald-500" /> Executive Action
        </label>
        <SearchableSelect
          options={WORKFLOW_ACTIONS}
          value={data.action || 'Restrict COD Payment Option'}
          onChange={val => onChange({ action: val })}
        />
      </div>
    </div>
  </div>
);

export const WorkflowModal: React.FC<any> = ({ isOpen, onClose, onSave, initialData }) => {
  return (
    <BuilderModal
      title={initialData?.id ? 'Edit Workflow' : 'Create Workflow'}
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      initialData={initialData || { name: '', workflowType: 'Customer COD Risk Restrict Workflow' }}
      sections={[
        { id: 'basic', label: 'Workflow Identity', component: BasicSection },
        { id: 'steps', label: 'Trigger & Action Pipeline', component: StepDesignerSection }
      ]}
    />
  );
};

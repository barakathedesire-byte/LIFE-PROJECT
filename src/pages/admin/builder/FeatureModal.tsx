import React from 'react';
import { BuilderModal } from '../../../components/builder/BuilderModal';
import { SearchableSelect } from '../../../components/common/SearchableSelect';
import { Sparkles, Layers, CheckCircle } from 'lucide-react';

export const FEATURE_TYPES = [
  'Marketplace',
  'Product Catalog',
  'Product Search',
  'Product Reviews',
  'Cart',
  'Checkout',
  'Order Tracking',
  'Vendor Onboarding',
  'Vendor Dashboard',
  'Vendor Payouts',
  'Admin Dashboard',
  'Customer Support',
  'Live Chat',
  'AI Assistant',
  'Analytics',
  'Multi-Currency',
  'Multi-Language',
  'Logistics Integration',
  'Warehouse Management',
  'Inventory Control',
  'Commission Engine',
  'Loyalty System',
  'Referral System',
  'Coupon System',
  'Flash Sales',
  'Subscriptions',
  'B2B Bulk Orders',
  'Quotation System',
  'Return Management',
  'Refund Engine',
  'Pickup Station Network',
  'Rider Delivery App',
  'Sales Representative Portal',
  'Content Management',
  'Banner Ads',
  'Live Streaming Commerce',
  'Group Buying',
  'Social Sharing',
  'Fraud Protection',
  'Audit Logging',
  'Notification Engine',
  'Webhook Engine',
  'Custom Feature',
  'Other Feature'
];

interface FeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any, status: string) => void;
  initialData?: any;
}

const FEATURE_SUGGESTIONS: Record<string, {
  entities: string[];
  forms: string[];
  statuses: string[];
  workflows: string[];
  notifications: string[];
  widgets: string[];
}> = {
  'Return Management': {
    entities: ['ReturnRequest', 'RefundLedger', 'InspectionItem'],
    forms: ['Return Request Form', 'Return Inspection Form'],
    statuses: ['RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURN_INSPECTED', 'RETURN_REFUNDED'],
    workflows: ['Return Approval Workflow', 'Refund Processing Workflow'],
    notifications: ['Return Status Update', 'Refund Issued Notice'],
    widgets: ['Return Rate KPI', 'Pending Returns Table']
  },
  'Vendor Onboarding': {
    entities: ['VendorApplication', 'SellerKYC', 'BankDetails'],
    forms: ['Vendor Registration Form', 'KYC Document Verification Form'],
    statuses: ['APPLICATION_PENDING', 'KYC_VERIFIED', 'APPLICATION_APPROVED'],
    workflows: ['Vendor Review Workflow', 'Commission Assign Workflow'],
    notifications: ['Application Received', 'Store Approved Welcome Email'],
    widgets: ['Pending Vendors Widget', 'Vendor Growth Chart']
  },
  'Rider Delivery App': {
    entities: ['DeliveryRun', 'DeliveryTask', 'RiderAccount'],
    forms: ['Rider Onboarding Form', 'Delivery Proof Signature Form'],
    statuses: ['RUN_ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'DELIVERY_FAILED'],
    workflows: ['Auto-Dispatch Workflow', 'COD Collection Verification Workflow'],
    notifications: ['Order Assigned to Rider', 'Customer Delivery ETA SMS'],
    widgets: ['Live Delivery Runs Map', 'Rider SLA KPI']
  }
};

const BasicSection = ({ data, onChange }: any) => {
  const selectedType = data.featureType || 'Marketplace';
  const suggestions = FEATURE_SUGGESTIONS[selectedType];

  return (
    <div className="space-y-4 text-xs">
      <h4 className="font-bold text-slate-800 text-base mb-2">Feature Identity & Predefined Type</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Feature Name</label>
          <input
            type="text"
            value={data.name || ''}
            onChange={e => onChange({ name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
            placeholder="e.g. Return Management"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Predefined Feature Type</label>
          <SearchableSelect
            options={FEATURE_TYPES}
            value={selectedType}
            onChange={val => {
              const suggestedData = FEATURE_SUGGESTIONS[val];
              onChange({
                featureType: val,
                name: data.name || val,
                key: data.key || `feat_${val.toLowerCase().replace(/[^a-z0-0]/g, '_')}`,
                category: data.category || 'Platform Core',
                suggestedComponents: suggestedData
              });
            }}
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Internal Unique Key</label>
          <input
            type="text"
            value={data.key || ''}
            onChange={e => onChange({ key: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
            placeholder="e.g. feat_returns"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Category</label>
          <input
            type="text"
            value={data.category || 'Operations'}
            onChange={e => onChange({ category: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>
      </div>

      <div>
        <label className="block font-semibold text-slate-700 mb-1">Description</label>
        <textarea
          value={data.description || ''}
          onChange={e => onChange({ description: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          rows={2}
          placeholder="Detailed explanation of what this feature handles..."
        />
      </div>

      {/* Smart Dependency Auto-suggestion box */}
      {suggestions && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Smart Auto-Suggested Related Components for {selectedType}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[11px]">
            <div>
              <span className="font-bold text-blue-800 block">Entities:</span>
              <ul className="list-disc list-inside text-slate-600">{suggestions.entities.map(e => <li key={e}>{e}</li>)}</ul>
            </div>
            <div>
              <span className="font-bold text-blue-800 block">Forms:</span>
              <ul className="list-disc list-inside text-slate-600">{suggestions.forms.map(f => <li key={f}>{f}</li>)}</ul>
            </div>
            <div>
              <span className="font-bold text-blue-800 block">Statuses:</span>
              <ul className="list-disc list-inside text-slate-600">{suggestions.statuses.map(s => <li key={s}>{s}</li>)}</ul>
            </div>
            <div>
              <span className="font-bold text-blue-800 block">Workflows:</span>
              <ul className="list-disc list-inside text-slate-600">{suggestions.workflows.map(w => <li key={w}>{w}</li>)}</ul>
            </div>
            <div>
              <span className="font-bold text-blue-800 block">Notifications:</span>
              <ul className="list-disc list-inside text-slate-600">{suggestions.notifications.map(n => <li key={n}>{n}</li>)}</ul>
            </div>
            <div>
              <span className="font-bold text-blue-800 block">Widgets:</span>
              <ul className="list-disc list-inside text-slate-600">{suggestions.widgets.map(w => <li key={w}>{w}</li>)}</ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PermissionsSection = ({ data, onChange }: any) => (
  <div className="space-y-4 text-xs">
    <h4 className="font-bold text-slate-800 text-base mb-2">Role Access & Capabilities</h4>
    <div>
      <label className="block font-semibold text-slate-700 mb-2">Available to User Roles</label>
      <div className="flex flex-wrap gap-2">
        {['Buyer', 'Vendor', 'Field Sales', 'Warehouse', 'Delivery Rider', 'Pickup Station Agent', 'Admin', 'Super Admin'].map(role => (
          <label key={role} className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100">
            <input
              type="checkbox"
              className="w-3.5 h-3.5"
              checked={(data.roles || []).includes(role)}
              onChange={e => {
                const roles = new Set(data.roles || []);
                if (e.target.checked) roles.add(role);
                else roles.delete(role);
                onChange({ roles: Array.from(roles) });
              }}
            />
            <span className="font-semibold text-slate-700">{role}</span>
          </label>
        ))}
      </div>
    </div>
  </div>
);

export const FeatureModal: React.FC<FeatureModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  return (
    <BuilderModal
      title={initialData?.id ? 'Edit Feature Configuration' : 'Create Feature'}
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      initialData={initialData || { name: '', featureType: 'Marketplace', status: 'Active', roles: ['Admin', 'Super Admin'] }}
      sections={[
        { id: 'basic', label: 'Feature Identity', component: BasicSection },
        { id: 'permissions', label: 'Role Access', component: PermissionsSection }
      ]}
    />
  );
};

import React from 'react';
import { BuilderModal } from '../../../components/builder/BuilderModal';
import { SearchableSelect } from '../../../components/common/SearchableSelect';
import { LUMO_EVENTS } from './IntegrationModal';

const BasicSection = ({ data, onChange }: any) => (
  <div className="space-y-4 text-xs">
    <h4 className="font-bold text-slate-800 text-base mb-2">1. Notification Identity & Event Trigger</h4>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block font-semibold text-slate-700 mb-1">Notification Name</label>
        <input
          type="text"
          value={data.name || ''}
          onChange={e => onChange({ name: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
          placeholder="e.g. COD Restricted Alert"
        />
      </div>

      <div>
        <label className="block font-semibold text-slate-700 mb-1">Predefined Lumo Event Trigger</label>
        <SearchableSelect
          options={['COD_RESTRICTED', 'COD_REINSTATED', 'INTRANSIT_CANCELLATION_RECORDED', ...LUMO_EVENTS]}
          value={data.event || 'COD_RESTRICTED'}
          onChange={val => onChange({ event: val, name: data.name || `${val} Notification` })}
        />
      </div>
    </div>
  </div>
);

const AudienceSection = ({ data, onChange }: any) => (
  <div className="space-y-4 text-xs">
    <h4 className="font-bold text-slate-800 text-base mb-2">2. Audience & Delivery Channels</h4>
    <div>
      <label className="block font-semibold text-slate-700 mb-2">Recipient Roles</label>
      <div className="flex flex-wrap gap-2">
        {['Buyer', 'Vendor', 'Field Sales', 'Warehouse', 'Rider', 'Pickup Manager', 'Admin', 'Super Admin'].map(role => (
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

    <div>
      <label className="block font-semibold text-slate-700 mb-2">Delivery Channels</label>
      <div className="flex flex-wrap gap-2">
        {['In-App', 'Email', 'SMS', 'Push', 'WhatsApp'].map(channel => (
          <label key={channel} className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100">
            <input
              type="checkbox"
              className="w-3.5 h-3.5"
              checked={(data.channels || []).includes(channel)}
              onChange={e => {
                const channels = new Set(data.channels || []);
                if (e.target.checked) channels.add(channel);
                else channels.delete(channel);
                onChange({ channels: Array.from(channels) });
              }}
            />
            <span className="font-semibold text-slate-700">{channel}</span>
          </label>
        ))}
      </div>
    </div>
  </div>
);

const TemplateSection = ({ data, onChange }: any) => (
  <div className="space-y-4 text-xs">
    <h4 className="font-bold text-slate-800 text-base mb-2">3. Message Template & Placeholders</h4>
    <div>
      <label className="block font-semibold text-slate-700 mb-1">Subject / Title</label>
      <input
        type="text"
        value={data.subject || ''}
        onChange={e => onChange({ subject: e.target.value })}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
        placeholder="e.g. Notice: Pay on Delivery Option Restricted"
      />
    </div>

    <div>
      <label className="block font-semibold text-slate-700 mb-1">Message Body Template</label>
      <textarea
        value={data.body || ''}
        onChange={e => onChange({ body: e.target.value })}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
        rows={4}
        placeholder="Hi {{customer_name}}, Pay on Delivery (COD) has been restricted on your account due to multiple order cancellations while in transit."
      />
    </div>
  </div>
);

export const NotificationModal: React.FC<any> = ({ isOpen, onClose, onSave, initialData }) => {
  return (
    <BuilderModal
      title={initialData?.id ? 'Edit Notification' : 'Create Notification'}
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      initialData={initialData || { name: '', event: 'COD_RESTRICTED', roles: ['Buyer'], channels: ['In-App', 'SMS'] }}
      sections={[
        { id: 'basic', label: 'Identity & Triggers', component: BasicSection },
        { id: 'audience', label: 'Audience & Channels', component: AudienceSection },
        { id: 'template', label: 'Message Template', component: TemplateSection }
      ]}
    />
  );
};

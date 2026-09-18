import React from 'react';
import { BuilderModal } from '../../../components/builder/BuilderModal';

const BasicSection = ({ data, onChange }: any) => (
  <div className="space-y-4">
    <h4 className="font-bold text-slate-800 text-lg mb-4">Role Identity</h4>
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1">Role Name</label>
      <input type="text" value={data.name || ''} onChange={e => onChange({ name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="e.g. Content Moderator" />
    </div>
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1">Internal Key</label>
      <input type="text" value={data.key || ''} onChange={e => onChange({ key: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm" placeholder="e.g. role_content_mod" />
    </div>
  </div>
);

const PermissionSection = ({ data, onChange }: any) => {
  const permGroups = [
    { label: 'Products', perms: ['product.view', 'product.create', 'product.edit', 'product.delete'] },
    { label: 'Orders', perms: ['order.view', 'order.process', 'order.refund'] },
    { label: 'Users', perms: ['user.view', 'user.create', 'user.ban'] }
  ];

  const currentPerms = data.permissions || [];

  return (
    <div className="space-y-4">
      <h4 className="font-bold text-slate-800 text-lg mb-4">Granular Permissions</h4>
      {permGroups.map(group => (
        <div key={group.label} className="mb-4">
          <h5 className="text-sm font-bold text-slate-700 mb-2">{group.label}</h5>
          <div className="flex flex-wrap gap-2">
            {group.perms.map(p => (
              <label key={p} className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100">
                <input type="checkbox" className="w-3.5 h-3.5" checked={currentPerms.includes(p)} onChange={e => {
                  const set = new Set(currentPerms);
                  if (e.target.checked) set.add(p);
                  else set.delete(p);
                  onChange({ permissions: Array.from(set) });
                }} />
                <span className="text-xs font-semibold text-slate-700">{p}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export const RoleModal: React.FC<any> = ({ isOpen, onClose, onSave, initialData }) => {
  return (
    <BuilderModal
      title={initialData?.id ? 'Edit Custom Role' : 'Create Custom Role'}
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      initialData={initialData}
      sections={[
        { id: 'basic', label: 'Basic Info', component: BasicSection },
        { id: 'perms', label: 'Permissions', component: PermissionSection }
      ]}
    />
  );
};

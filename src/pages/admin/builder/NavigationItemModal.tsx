import React from 'react';
import { BuilderModal } from '../../../components/builder/BuilderModal';

interface NavItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any, status: string) => void;
  initialData?: any;
}

const BasicSection = ({ data, onChange }: any) => (
  <div className="space-y-4">
    <h4 className="font-bold text-slate-800 text-lg mb-4">Basic Information</h4>
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1">Menu Label</label>
      <input type="text" value={data.label || ''} onChange={e => onChange({ label: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="e.g. Inbound Dock" />
    </div>
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1">Internal Key</label>
      <input type="text" value={data.key || ''} onChange={e => onChange({ key: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm" placeholder="e.g. nav-inbound" />
    </div>
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
      <textarea value={data.description || ''} onChange={e => onChange({ description: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" rows={3} placeholder="Menu description..." />
    </div>
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1">Icon Name</label>
      <input type="text" value={data.icon || 'Link'} onChange={e => onChange({ icon: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="e.g. Box, Map, User" />
    </div>
  </div>
);

const DestinationSection = ({ data, onChange }: any) => (
  <div className="space-y-4">
    <h4 className="font-bold text-slate-800 text-lg mb-4">Destination & Type</h4>
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1">Menu Type</label>
      <select value={data.type || 'Internal route'} onChange={e => onChange({ type: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white">
        <option>Internal route</option>
        <option>External URL</option>
        <option>Dashboard</option>
        <option>Submenu</option>
        <option>Action</option>
      </select>
    </div>
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1">Route / Path</label>
      <input type="text" value={data.path || ''} onChange={e => onChange({ path: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm" placeholder="e.g. /warehouse/inbound" />
    </div>
  </div>
);

const VisibilitySection = ({ data, onChange }: any) => (
  <div className="space-y-4">
    <h4 className="font-bold text-slate-800 text-lg mb-4">Visibility & Permissions</h4>
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1">Feature Dependency</label>
      <input type="text" value={data.featureDependency || ''} onChange={e => onChange({ featureDependency: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="e.g. feat_warehouse_advanced" />
    </div>
    <div className="flex items-center gap-2 mt-4">
      <input type="checkbox" checked={data.openInNewTab || false} onChange={e => onChange({ openInNewTab: e.target.checked })} id="newtab" className="w-4 h-4" />
      <label htmlFor="newtab" className="text-sm font-medium text-slate-700">Open in new tab</label>
    </div>
  </div>
);

export const NavigationItemModal: React.FC<NavItemModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  return (
    <BuilderModal
      title={initialData?.id ? 'Edit Menu Item' : 'Add Menu Item'}
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      initialData={initialData}
      sections={[
        { id: 'basic', label: 'Basic Information', component: BasicSection },
        { id: 'destination', label: 'Destination', component: DestinationSection },
        { id: 'visibility', label: 'Visibility & Behavior', component: VisibilitySection }
      ]}
    />
  );
};

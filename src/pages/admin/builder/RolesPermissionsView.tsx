import React, { useState } from 'react';
import { Shield, Plus, Edit2, Trash2, X, Check, Settings } from 'lucide-react';
import { RoleModal } from './RoleModal';
import { useBuilderConfig } from '../../../hooks/useBuilderConfig';

interface CustomRole {
  id: string;
  name: string;
  users: number;
  permissions: string[];
}

const defaultRoles: CustomRole[] = [
  { id: 'r-0', name: 'Platform Super Admin (SUPER_ADMIN)', users: 2, permissions: ['*.*', 'builder.edit', 'system.full_control'] },
  { id: 'r-1', name: 'System Operations Manager (ADMIN)', users: 5, permissions: ['orders.manage', 'vendors.approve', 'riders.dispatch', 'audit.view'] },
  { id: 'r-2', name: 'Finance & Treasury Administrator (FINANCE_ADMIN)', users: 3, permissions: ['finance.payouts', 'escrow.release', 'commissions.audit', 'reports.export'] },
  { id: 'r-3', name: 'Verified Store Merchant (SELLER)', users: 1420, permissions: ['products.manage', 'orders.fulfill', 'wallet.withdraw', 'promotions.create'] },
  { id: 'r-4', name: 'Express Delivery Rider (DELIVERY_AGENT)', users: 380, permissions: ['deliveries.accept', 'gps.broadcast', 'otp.validate', 'cash.collect'] },
  { id: 'r-5', name: 'Pickup Station Operator (PICKUP_OPERATOR)', users: 64, permissions: ['station.receive', 'station.handover', 'station.otp_verify', 'station.returns'] },
  { id: 'r-6', name: 'Warehouse Fulfillment Specialist (WAREHOUSE_STAFF)', users: 48, permissions: ['warehouse.receive', 'warehouse.bin_assign', 'barcode.scan', 'manifest.dispatch'] },
  { id: 'r-7', name: 'Regional Field Sales Lead (SALESPERSON)', users: 85, permissions: ['sales.leads', 'vendors.onboard', 'commissions.view'] },
  { id: 'r-8', name: 'Customer Support Agent (SUPPORT_STAFF)', users: 18, permissions: ['tickets.resolve', 'disputes.arbitrate', 'refunds.initiate'] },
  { id: 'r-9', name: 'Catalog & Content Moderator (MODERATION_STAFF)', users: 8, permissions: ['catalog.moderate', 'reviews.approve', 'fraud.flag'] },
  { id: 'r-10', name: 'Marketplace Buyer (CUSTOMER)', users: 24500, permissions: ['marketplace.browse', 'cart.checkout', 'orders.track', 'dispute.file'] }
];

export const RolesPermissionsView = () => {
  const { data: roles, updateConfig: setRoles, isSaving } = useBuilderConfig('rolesPermissions', defaultRoles);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [roleName, setRoleName] = useState('');

  
  const handleSaveModal = (data: any, status: string) => {
    const newRole = { ...data, status: status === 'PUBLISHED' ? 'ACTIVE' : 'DRAFT' };
    if (!newRole.id) {
      newRole.id = `r-${Date.now()}`;
      newRole.users = 0;
    }
    
    let newRoles = [...roles];
    if (editingRole) {
      newRoles = newRoles.map(r => r.id === newRole.id ? newRole : r);
    } else {
      newRoles.push(newRole);
    }
    
    setRoles(newRoles);
    setShowModal(false);
    setEditingRole(null);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;
    const newRole: CustomRole = {
      id: `r-${Date.now()}`,
      name: roleName,
      users: 0,
      permissions: []
    };
    setRoles([...roles, newRole]);
    setShowModal(false);
    setRoleName('');
  };

  const deleteRole = (id: string) => {
    if (confirm('Are you sure you want to delete this role?')) {
      setRoles(roles.filter((r: any) => r.id !== id));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Roles & Permissions</h2>
          <p className="text-sm text-slate-500">Configure RBAC (Role-Based Access Control) for internal users.</p>
        </div>
        <button onClick={() => { setEditingRole(null); setShowModal(true); }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer">
          <Plus className="w-4 h-4" /> Create Custom Role
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          {roles.map((r: any) => (
            <div key={r.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex justify-between items-center group hover:border-blue-300 transition">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{r.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{r.users} Assigned Users</p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => { setEditingRole(r); setShowModal(true); }} className="p-1.5 text-slate-400 hover:text-blue-600"><Settings className="w-4 h-4" /></button>
                  <button onClick={() => deleteRole(r.id)} className="p-1.5 text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                </div>
            </div>
          ))}
        </div>
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Permission Matrix</h3>
          <p className="text-sm text-slate-500 mb-6">Select a role on the left to configure granular permissions.</p>
          <div className="p-10 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl">
            <Shield className="w-12 h-12 text-slate-300 mb-2" />
            <p className="text-slate-500 font-medium">Select a role to view permissions</p>
          </div>
        </div>
      </div>

            <RoleModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveModal}
        initialData={editingRole || {}}
      />
    </div>
  );
};


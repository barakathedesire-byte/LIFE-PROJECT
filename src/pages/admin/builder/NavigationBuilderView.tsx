
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { useState, useEffect } from 'react';
import { useBuilderConfig } from '../../../hooks/useBuilderConfig';
import { usePlatformConfig } from '../../../context/PlatformConfigContext';

import { GripVertical, Plus, Trash2, Edit2, Link, Save, RefreshCw, CheckCircle2, ArrowUp, ArrowDown } from 'lucide-react';
import { api } from '../../../services/api';
import { LumoLoader } from '../../../components/common/LumoLoader';
import { NavigationItemModal } from './NavigationItemModal';

const mockRoles = ['Buyer', 'Vendor', 'Field Sales', 'Warehouse', 'Admin', 'Super Admin'];

const defaultRoleNavs: Record<string, Array<{ id: string; label: string; path: string; icon: string }>> = {
  Vendor: [
    { id: 'nav-v1', label: 'Vendor Overview', path: '/seller/dashboard', icon: 'LayoutDashboard' },
    { id: 'nav-v2', label: 'Product Catalog', path: '/seller/products', icon: 'Box' },
    { id: 'nav-v3', label: 'Customer Orders', path: '/seller/orders', icon: 'ShoppingBag' },
    { id: 'nav-v4', label: 'Financial Wallet & Payouts', path: '/seller/finance', icon: 'TrendingUp' },
    { id: 'nav-v5', label: 'Courier Pickup Requests', path: '/seller/pickups', icon: 'Truck' }
  ],
  Warehouse: [
    { id: 'nav-w1', label: 'Inbound Stock Receiving', path: '/warehouse?tab=inbound', icon: 'Box' },
    { id: 'nav-w2', label: 'Bin & Shelf Inventory', path: '/warehouse?tab=inventory', icon: 'Layers' },
    { id: 'nav-w3', label: 'Packing & Barcode Audit', path: '/warehouse?tab=packing', icon: 'ScanLine' },
    { id: 'nav-w4', label: 'Outbound Dispatch Manifest', path: '/warehouse?tab=manifest', icon: 'Truck' }
  ],
  'Field Sales': [
    { id: 'nav-s1', label: 'Merchant Leads Pipeline', path: '/sales?tab=leads', icon: 'Users' },
    { id: 'nav-s2', label: 'Vendor Onboarding Portal', path: '/sales?tab=onboarding', icon: 'Store' },
    { id: 'nav-s3', label: 'Sales Commission Earnings', path: '/sales?tab=commission', icon: 'Percent' }
  ],
  Admin: [
    { id: 'nav-a1', label: 'Executive Analytics', path: '/admin?tab=analytics', icon: 'LayoutDashboard' },
    { id: 'nav-a2', label: 'Staff & Role Manager', path: '/admin?tab=users', icon: 'Users' },
    { id: 'nav-a3', label: 'Vendor Verification (KYC)', path: '/admin?tab=kyc', icon: 'ShieldCheck' },
    { id: 'nav-a4', label: 'Escrow Payout Approvals', path: '/admin?tab=payouts', icon: 'DollarSign' }
  ],
  'Super Admin': [
    { id: 'nav-sa1', label: 'Platform Architecture Control', path: '/admin?tab=builder', icon: 'Settings' },
    { id: 'nav-sa2', label: 'Feature Flags & Releases', path: '/admin?tab=features', icon: 'Zap' },
    { id: 'nav-sa3', label: 'Cloudflare D1 & Database Sync', path: '/admin?tab=database', icon: 'Database' },
    { id: 'nav-sa4', label: 'Audit Security Logs', path: '/admin?tab=audit', icon: 'Terminal' }
  ],
  Buyer: [
    { id: 'nav-b1', label: 'Marketplace Feed', path: '/', icon: 'Home' },
    { id: 'nav-b2', label: 'My Escrow Orders', path: '/account/orders', icon: 'ShoppingBag' },
    { id: 'nav-b3', label: 'Saved Wishlist', path: '/wishlist', icon: 'Heart' },
    { id: 'nav-b4', label: 'Help & Disputes', path: '/help', icon: 'Shield' }
  ]
};


const SortableNavItem: React.FC<{ item: any, handleDeleteItem: (id: string) => void, handleEditItem: (item: any) => void }> = ({ item, handleDeleteItem, handleEditItem }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition group bg-white z-10 relative">
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners} className="cursor-grab touch-none p-1 -ml-2 text-slate-300 group-hover:text-slate-500">
          <GripVertical size={16} />
        </div>
        <div>
          <h4 className="font-bold text-slate-800 text-sm">{item.label}</h4>
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5 font-mono">
            <Link className="w-3 h-3 text-slate-400" /> {item.path}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => handleEditItem(item)}
          title="Edit menu item"
          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button 
          onClick={() => handleDeleteItem(item.id)}
          title="Delete menu item"
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    
    </div>
  );
};

export const NavigationBuilderView = () => {
  const { data: activeRole, updateConfig: setActiveRole, isSaving } = useBuilderConfig('navigationBuilder', 'Vendor');
  const { refreshConfig } = usePlatformConfig();
  const [roleNavs, setRoleNavs] = useState<Record<string, Array<{ id: string; label: string; path: string; icon: string }>>>(defaultRoleNavs);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newPath, setNewPath] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Load from backend configuration
  useEffect(() => {
    const loadNavConfig = async () => {
      try {
        const res = await api.getBuilderConfig();
        if (res.builderConfig?.navigation && typeof res.builderConfig.navigation === 'object') {
          setRoleNavs(prev => ({ ...prev, ...res.builderConfig.navigation }));
        }
      } catch (err) {
        console.error('Failed to load navigation builder config:', err);
      }
    };
    loadNavConfig();
  }, []);

  const navItems = roleNavs[activeRole] || [];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const newItems = [...navItems];
      const oldIndex = newItems.findIndex(i => i.id === active.id);
      const newIndex = newItems.findIndex(i => i.id === over.id);
      const updatedArray = arrayMove(newItems, oldIndex, newIndex);
      
      const updated = {
        ...roleNavs,
        [activeRole]: updatedArray
      };
      setRoleNavs(updated);
      handleSaveToBackend(updated);
    }
  };

  
  const handleSaveModal = (data: any, status: string) => {
    let newItem = { ...data };
    if (!newItem.id) {
      newItem.id = `nav-${Date.now()}`;
      newItem.icon = newItem.icon || 'Link';
    }
    
    let newItems = [...navItems];
    if (editingItem) {
      newItems = newItems.map(i => i.id === newItem.id ? newItem : i);
    } else {
      newItems.push(newItem);
    }
    
    const updated = {
      ...roleNavs,
      [activeRole]: newItems
    };
    setRoleNavs(updated);
    setIsModalOpen(false);
    setEditingItem(null);
    handleSaveToBackend(updated);
  };

  const handleSaveToBackend = async (updatedNavs = roleNavs) => {
    try {
      await api.updateBuilderConfig({ navigation: updatedNavs });
      await refreshConfig();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save navigation:', err);
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim() || !newPath.trim()) return;

    const newItem = {
      id: `nav-${Date.now()}`,
      label: newLabel.trim(),
      path: newPath.trim(),
      icon: 'Link'
    };

    const updated = {
      ...roleNavs,
      [activeRole]: [...navItems, newItem]
    };

    setRoleNavs(updated);
    setNewLabel('');
    setNewPath('');
    setIsAdding(false);
    handleSaveToBackend(updated);
  };

  const handleDeleteItem = (id: string) => {
    const updated = {
      ...roleNavs,
      [activeRole]: navItems.filter(item => item.id !== id)
    };
    setRoleNavs(updated);
    handleSaveToBackend(updated);
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...navItems];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;

    const updated = {
      ...roleNavs,
      [activeRole]: newItems
    };
    setRoleNavs(updated);
    handleSaveToBackend(updated);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Dynamic Navigation & Hierarchy Builder</h2>
          <p className="text-sm text-slate-500">Configure role-isolated navigation sidebars, menus, and deep links across LUMO.</p>
        </div>
        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <CheckCircle2 size={14} /> Saved & Synced
            </span>
          )}
          <button 
            onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Menu Item
          </button>
        </div>
      </div>

      {/* Role Switcher Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {mockRoles.map(role => (
          <button
            key={role}
            onClick={() => setActiveRole(role)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeRole === role 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {role}
          </button>
        ))}
      </div>

      {/* Navigation Items List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">{activeRole} Navigation Menu Items ({navItems.length})</h3>
          {isSaving && (
            <span className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold">
              <LumoLoader size="small" /> Syncing with D1 Database...
            </span>
          )}
        </div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={navItems.map((i: any) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="divide-y divide-slate-100">
              {navItems.map((item: any) => (
                <SortableNavItem key={item.id} item={item} handleDeleteItem={handleDeleteItem} handleEditItem={(item) => { setEditingItem(item); setIsModalOpen(true); }} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
          <NavigationItemModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        initialData={editingItem || {}}
      />
    </div>
  );
};

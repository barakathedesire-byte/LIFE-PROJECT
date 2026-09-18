
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { useState } from 'react';
import { useBuilderConfig } from '../../../hooks/useBuilderConfig';

import { GripVertical, Eye, EyeOff, Settings } from 'lucide-react';

const mockModules = [
  { id: 'm-1', name: 'Marketplace & Customer Storefront', description: 'Public buyer shopping experience, product search, deals & checkout', visible: true, locked: true },
  { id: 'm-2', name: 'Seller Center & Vendor Hub', description: 'Merchant store management, product listing, order fulfillment & wallet', visible: true, locked: true },
  { id: 'm-3', name: 'Order Management & Escrow Engine', description: 'Central transactional processing, payment holds, and OTP settlements', visible: true, locked: true },
  { id: 'm-4', name: 'Product Catalog & Inventory Taxonomy', description: 'Category trees, product specifications, inventory tracking & stock alerts', visible: true, locked: true },
  { id: 'm-5', name: 'Rider Delivery Fleet (Lumo Move)', description: 'Real-time rider dispatch, proximity assignment, and live GPS tracking', visible: true, locked: false },
  { id: 'm-6', name: 'Warehouse & Fulfillment Center (Lumo Fulfill)', description: 'Inbound stock receiving, bin placement, barcode scanning, picking & packing', visible: true, locked: false },
  { id: 'm-7', name: 'Regional Pickup Station Hubs (Lumo Point)', description: 'Pickup station parcel receiving, shelf storage, buyer OTP handover & returns', visible: true, locked: false },
  { id: 'm-8', name: 'Field Sales & Lead Operations (Lumo Leads)', description: 'Field agent sales pipeline, vendor onboarding, commission ledger & tracking', visible: true, locked: false },
  { id: 'm-9', name: 'Financial Intelligence & Treasury (Lumo Finance)', description: 'Revenue tracking, vendor settlements, rider payouts, commission ledger & audits', visible: true, locked: false },
  { id: 'm-10', name: 'Customer Support & Dispute Desk (Lumo Care)', description: 'Customer ticketing, dispute arbitration, return refunds & live assistance', visible: true, locked: false },
  { id: 'm-11', name: 'Executive Analytics & Reporting', description: 'Cross-portal metrics, regional heatmaps, sales performance & platform ROI', visible: true, locked: false },
  { id: 'm-12', name: 'Content Moderation & Quality Control', description: 'Product review moderation, catalog verification & seller fraud detection', visible: true, locked: false },
  { id: 'm-13', name: 'Platform Builder & System Control Center', description: 'No-code architecture engine, workflows, automation rules, roles & security', visible: true, locked: true }
];


const SortableModule: React.FC<{ mod: any, toggleVisibility: (id: string, locked: boolean) => void }> = ({ mod, toggleVisibility }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: mod.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="p-4 flex items-center justify-between hover:bg-slate-50 transition group bg-white z-10 relative">
      <div className="flex items-center gap-4">
        <div {...attributes} {...listeners} className="cursor-grab touch-none p-1 -ml-1">
          <GripVertical className="w-5 h-5 text-slate-300 group-hover:text-slate-500" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            {mod.name}
            {mod.locked && <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono">CORE</span>}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">{mod.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="p-2 text-slate-400 hover:text-blue-600 transition rounded-lg hover:bg-blue-50 cursor-pointer" title="Configure">
          <Settings className="w-4 h-4" />
        </button>
        <button 
          onClick={() => toggleVisibility(mod.id, mod.locked)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            mod.visible 
              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {mod.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          {mod.visible ? 'VISIBLE' : 'HIDDEN'}
        </button>
      </div>
    </div>
  );
};

export const ModulesView = () => {
  const { data: modules, updateConfig: setModules, isSaving } = useBuilderConfig('modules', mockModules);

  const toggleVisibility = (id: string, locked: boolean) => {
    if (locked) {
      alert('This core module cannot be disabled.');
      return;
    }
    setModules(modules.map((m: any) => m.id === id ? { ...m, visible: !m.visible } : m));
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = modules.findIndex((i: any) => i.id === active.id);
      const newIndex = modules.findIndex((i: any) => i.id === over.id);
      setModules(arrayMove(modules, oldIndex, newIndex));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Module Manager</h2>
          <p className="text-sm text-slate-500">Enable, disable, and order top-level platform modules.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={modules.map((m: any) => m.id)} strategy={verticalListSortingStrategy}>
            <div className="divide-y divide-slate-100">
              {modules.map((mod: any) => (
                <SortableModule key={mod.id} mod={mod} toggleVisibility={toggleVisibility} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useBuilderConfig } from '../../../hooks/useBuilderConfig';
import { LayoutGrid, Plus, Move, Eye, EyeOff, Settings, Trash2 } from 'lucide-react';
import { DashboardWidgetModal } from './DashboardWidgetModal';

interface DashboardWidget {
  id: string;
  title: string;
  type: string;
  portal: string;
  size: string;
  visible: boolean;
}

const initialWidgets: DashboardWidget[] = [
  { id: 'w-1', title: 'Real-time GMV Sparkline', type: 'Chart', portal: 'Admin', size: 'Full Width', visible: true },
  { id: 'w-2', title: 'Active Escrow Balance', type: 'Metric Card', portal: 'Admin', size: '1/3 Width', visible: true },
  { id: 'w-3', title: 'Pending Vendor Applications', type: 'Table List', portal: 'Admin', size: '2/3 Width', visible: true },
  { id: 'w-4', title: 'Top Performing Products', type: 'Ranked List', portal: 'Vendor', size: 'Half Width', visible: true }
];

export const DashboardBuilderView = () => {
  const { data: activePortal, updateConfig: setActivePortal } = useBuilderConfig('dashboardActivePortal', 'Admin');
  const { data: widgets, updateConfig: setWidgets } = useBuilderConfig('dashboardWidgets', initialWidgets);
  const [showModal, setShowModal] = useState(false);
  const [editingWidget, setEditingWidget] = useState<any>(null);

  const safeWidgets = Array.isArray(widgets) ? widgets : initialWidgets;

  const toggleVisibility = (id: string) => {
    setWidgets(safeWidgets.map((w: any) => w.id === id ? { ...w, visible: !w.visible } : w));
  };

  const deleteWidget = (id: string) => {
    if (confirm('Are you sure you want to remove this widget from the dashboard layout?')) {
      setWidgets(safeWidgets.filter((w: any) => w.id !== id));
    }
  };

  const handleSaveModal = (data: any, status: string) => {
    const newWidget = { ...data, portal: activePortal, visible: status === 'PUBLISHED' };
    if (!newWidget.id) newWidget.id = `w-${Date.now()}`;
    let newWidgets = [...safeWidgets];
    if (editingWidget) {
      newWidgets = newWidgets.map((w: any) => w.id === newWidget.id ? newWidget : w);
    } else {
      newWidgets.push(newWidget);
    }
    setWidgets(newWidgets);
    setShowModal(false);
    setEditingWidget(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Dashboard Layout Builder</h2>
          <p className="text-sm text-slate-500">Configure visual widgets, KPI metrics, and analytical views for each portal.</p>
        </div>
        <button
          onClick={() => { setEditingWidget(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Widget to {activePortal} Portal
        </button>
      </div>

      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {['Admin', 'Vendor', 'Buyer', 'Rider'].map(portal => (
          <button
            key={portal}
            onClick={() => setActivePortal(portal)}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
              activePortal === portal ? 'bg-slate-900 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {portal} Dashboard
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {safeWidgets.filter((w: any) => w.portal === activePortal).map((widget: any) => (
          <div key={widget.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3 relative group">
            <div className="flex justify-between items-start">
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px] uppercase">
                {widget.type}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleVisibility(widget.id)}
                  className="p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                >
                  {widget.visible ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-300" />}
                </button>
                <button
                  onClick={() => { setEditingWidget(widget); setShowModal(true); }}
                  className="p-1 text-slate-400 hover:text-blue-600 transition cursor-pointer"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteWidget(widget.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 text-sm">{widget.title}</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Size: {widget.size}</p>
            </div>
          </div>
        ))}
      </div>

      <DashboardWidgetModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveModal}
        initialData={editingWidget || { portal: activePortal }}
      />
    </div>
  );
};

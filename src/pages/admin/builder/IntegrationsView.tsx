import React, { useState } from 'react';
import { useBuilderConfig } from '../../../hooks/useBuilderConfig';
import { Plus, Settings, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { IntegrationModal } from './IntegrationModal';

interface Integration {
  id: string;
  name: string;
  category: string;
  provider: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'Draft' | 'Active' | 'Disabled';
  lastSync: string;
  connectionMethod?: string;
  apiKey?: string;
  baseUrl?: string;
  lumoEvent?: string;
}

const initialIntegrations: Integration[] = [
  { id: 'int-1', name: 'M-Pesa & Tigo Pesa Gateway', category: 'Payments', provider: 'Vodacom TZ / Selcom API', status: 'CONNECTED', lastSync: '2 mins ago' },
  { id: 'int-2', name: 'Twilio SMS Notification Gateway', category: 'Communications', provider: 'Twilio Global', status: 'CONNECTED', lastSync: '10 mins ago' },
  { id: 'int-3', name: 'Google Maps & Geocoding API', category: 'Logistics Map', provider: 'Google Maps Platform', status: 'CONNECTED', lastSync: 'Realtime' },
  { id: 'int-4', name: 'AWS S3 / Cloudflare R2 Media Storage', category: 'Storage', provider: 'Cloudflare R2', status: 'CONNECTED', lastSync: 'Realtime' },
  { id: 'int-5', name: 'WhatsApp Business API Gateway', category: 'Communications', provider: 'Meta Cloud API', status: 'CONNECTED', lastSync: '1 min ago' },
  { id: 'int-6', name: 'Google Gemini AI Intelligence Engine', category: 'AI Services', provider: 'Google AI Studio / GenAI', status: 'CONNECTED', lastSync: 'Realtime' },
  { id: 'int-7', name: 'Stripe Global Card Processing', category: 'International Payments', provider: 'Stripe', status: 'DISCONNECTED', lastSync: 'Never' }
];

export const IntegrationsView = () => {
  const { data: integrations, updateConfig: setIntegrations } = useBuilderConfig('integrations', initialIntegrations);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingInt, setEditingInt] = useState<Integration | null>(null);

  const safeIntegrations = Array.isArray(integrations) ? integrations : initialIntegrations;

  const toggleStatus = (id: string) => {
    setIntegrations(safeIntegrations.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === 'CONNECTED' || item.status === 'Active' ? 'DISCONNECTED' : 'CONNECTED';
        return { ...item, status: nextStatus, lastSync: nextStatus === 'CONNECTED' ? 'Just now' : 'Never' };
      }
      return item;
    }));
  };

  const deleteIntegration = (id: string) => {
    if (confirm('Are you sure you want to delete this integration configuration?')) {
      setIntegrations(safeIntegrations.filter(i => i.id !== id));
    }
  };

  const handleSaveModal = (data: any, publishStatus: string) => {
    const newInt = {
      ...data,
      id: data.id || `int-${Date.now()}`,
      category: data.category || data.type || 'Custom Integration',
      status: publishStatus === 'PUBLISHED' ? 'CONNECTED' : (data.status || 'Draft'),
      lastSync: 'Just now'
    };

    let updated = [...safeIntegrations];
    if (editingInt) {
      updated = updated.map(i => i.id === editingInt.id ? newInt : i);
    } else {
      updated = [newInt, ...updated];
    }

    setIntegrations(updated);
    setShowAddModal(false);
    setEditingInt(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Integration Manager</h2>
          <p className="text-sm text-slate-500">Manage API keys, webhooks, payment gateways, and third-party services.</p>
        </div>

        {/* PROMINENT + ADD INTEGRATION BUTTON */}
        <button
          onClick={() => {
            setEditingInt(null);
            setShowAddModal(true);
          }}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-5 h-5" /> + Add Integration
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {safeIntegrations.map(item => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {item?.category}
                </span>
                <span className={`flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  item.status === 'CONNECTED' || item.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {item.status === 'CONNECTED' || item.status === 'Active' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                  {item.status}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-base">{item.name}</h3>
              <p className="text-xs text-slate-500 font-mono">Provider: {item.provider}</p>
              <p className="text-[11px] text-slate-400 font-mono">Last Sync: {item.lastSync}</p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setEditingInt(item);
                  setShowAddModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" /> Configure
              </button>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleStatus(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    item.status === 'CONNECTED' || item.status === 'Active'
                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {item.status === 'CONNECTED' || item.status === 'Active' ? 'Disconnect' : 'Connect'}
                </button>
                <button
                  onClick={() => deleteIntegration(item.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                  title="Delete Integration"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <IntegrationModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingInt(null);
        }}
        onSave={handleSaveModal}
        initialData={editingInt}
      />
    </div>
  );
};

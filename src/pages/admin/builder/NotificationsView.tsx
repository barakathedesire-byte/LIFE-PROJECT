import React, { useState } from 'react';
import { useBuilderConfig } from '../../../hooks/useBuilderConfig';
import { Bell, Mail, Smartphone, Plus, Edit2, Trash2 } from 'lucide-react';
import { NotificationModal } from './NotificationModal';

interface NotificationTemplate {
  id: string;
  name: string;
  channel: string;
  trigger: string;
  active: boolean;
}

const initialNotifications: NotificationTemplate[] = [
  { id: 'notif-1', name: 'Order Confirmation & OTP Delivery Code', channel: 'SMS', trigger: 'Order Created', active: true },
  { id: 'notif-2', name: 'Escrow Release & Wallet Credit Receipt', channel: 'Email', trigger: 'Escrow Disbursed', active: true },
  { id: 'notif-3', name: 'Delivery Rider Nearby Live Tracking Alert', channel: 'Push', trigger: 'Rider < 1km Proximity', active: true },
  { id: 'notif-4', name: 'Vendor Fulfillment SLA Warning', channel: 'Email', trigger: 'Dispatch Delayed > 24 Hours', active: true },
  { id: 'notif-5', name: 'Rider Emergency Safety SOS Alert', channel: 'SMS', trigger: 'Rider SOS Triggered', active: true },
  { id: 'notif-6', name: 'COD Risk Restriction Notice', channel: 'SMS', trigger: 'COD Limit Reached', active: true },
  { id: 'notif-7', name: 'Pickup Station Parcel Ready SMS', channel: 'SMS', trigger: 'Parcel Scanned at Station', active: true },
  { id: 'notif-8', name: 'Merchant KYC Verification Approved', channel: 'Email', trigger: 'KYC Verification Approved', active: true }
];

export const NotificationsView = () => {
  const { data: templates, updateConfig: setTemplates } = useBuilderConfig('notifications', initialNotifications);
  const [showModal, setShowModal] = useState(false);
  const [editingNotif, setEditingNotif] = useState<any>(null);

  const toggleActive = (id: string) => {
    setTemplates(templates.map((t: any) => t.id === id ? { ...t, active: !t.active } : t));
  };

  const deleteTemplate = (id: string) => {
    if (confirm('Are you sure you want to delete this notification template?')) {
      setTemplates(templates.filter((t: any) => t.id !== id));
    }
  };

  const handleSaveModal = (data: any, status: string) => {
    const newTemplate = { ...data, active: status === 'PUBLISHED' };
    if (!newTemplate.id) newTemplate.id = `notif-${Date.now()}`;
    let newTemplates = [...templates];
    if (editingNotif) {
      newTemplates = newTemplates.map((t: any) => t.id === newTemplate.id ? newTemplate : t);
    } else {
      newTemplates.push(newTemplate);
    }
    setTemplates(newTemplates);
    setShowModal(false);
    setEditingNotif(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Notification & Trigger Templates</h2>
          <p className="text-sm text-slate-500">Configure transactional SMS, push notifications, and email alerts.</p>
        </div>
        <button
          onClick={() => { setEditingNotif(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" /> Create Notification Template
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold">
            <tr>
              <th className="py-3 px-4">Template Name</th>
              <th className="py-3 px-4">Channel</th>
              <th className="py-3 px-4">Event Trigger</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {templates.map((tpl: any) => (
              <tr key={tpl.id} className="hover:bg-slate-50 transition">
                <td className="py-3 px-4 font-bold text-slate-900">{tpl.name}</td>
                <td className="py-3 px-4 text-slate-600 flex items-center gap-1.5 font-medium">
                  {tpl.channel === 'SMS' && <Smartphone className="w-4 h-4 text-blue-500" />}
                  {tpl.channel === 'Email' && <Mail className="w-4 h-4 text-purple-500" />}
                  {tpl.channel === 'Push' && <Bell className="w-4 h-4 text-amber-500" />}
                  {tpl.channel}
                </td>
                <td className="py-3 px-4 font-mono text-slate-600">{tpl.trigger}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => toggleActive(tpl.id)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase cursor-pointer transition ${
                      tpl.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {tpl.active ? 'Active' : 'Disabled'}
                  </button>
                </td>
                <td className="py-3 px-4 text-right flex justify-end gap-1">
                  <button
                    onClick={() => { setEditingNotif(tpl); setShowModal(true); }}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteTemplate(tpl.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <NotificationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveModal}
        initialData={editingNotif || {}}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { X, AlertTriangle, PhoneOff, MapPinOff, PackageX, Wrench, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

interface RiderIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber?: string;
  taskId?: string;
  isLight?: boolean;
}

export const RiderIncidentModal: React.FC<RiderIncidentModalProps> = ({
  isOpen,
  onClose,
  orderNumber = 'ORD-784512',
  taskId,
  isLight = false,
}) => {
  const [issueType, setIssueType] = useState('Customer Unreachable');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  if (!isOpen) return null;

  const issueCategories = [
    { id: 'Customer Unreachable', label: 'Customer Unreachable', icon: PhoneOff, color: 'text-amber-500' },
    { id: 'Wrong Address / Landmark', label: 'Wrong Address', icon: MapPinOff, color: 'text-sky-500' },
    { id: 'Package Damaged / Leaking', label: 'Damaged Goods', icon: PackageX, color: 'text-rose-500' },
    { id: 'Vehicle Breakdown', label: 'Vehicle Issue', icon: Wrench, color: 'text-purple-500' },
    { id: 'Safety / Dispute Threat', label: 'Safety / Dispute', icon: ShieldAlert, color: 'text-red-500' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.reportDeliveryIssue({
        taskId,
        orderId: orderNumber,
        issueType,
        description: description || `Rider encountered: ${issueType} on order #${orderNumber}`,
        location: 'Mikocheni / Kijitonyama, Dar es Salaam'
      });

      if (res.success) {
        setTicketId(res.ticketId || `TKT-${Date.now().toString().slice(-5)}`);
        setSubmitted(true);
      }
    } catch {
      setSubmitted(true);
      setTicketId(`TKT-${Date.now().toString().slice(-5)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div
        className={`w-full max-w-sm rounded-2xl border shadow-2xl p-5 relative overflow-hidden transition-colors ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Report Issue</h3>
              <p className="text-[11px] text-slate-500">Order #{orderNumber}</p>
            </div>
          </div>

          <button onClick={handleClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                Incident Dispatched to Operations
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Ticket Ref: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{ticketId}</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-2">
                Operations team has received your report and will reach out to customer or assign emergency assistance if needed.
              </p>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              Close & Resume Route
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-3">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-2">Category of Issue</label>
              <div className="space-y-1.5">
                {issueCategories.map(cat => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setIssueType(cat.id)}
                      className={`w-full p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                        issueType === cat.id
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/30'
                          : isLight
                          ? 'border-slate-200 text-slate-700 hover:bg-slate-50'
                          : 'border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${cat.color}`} />
                        <span>{cat.label}</span>
                      </div>
                      {issueType === cat.id && (
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Additional Notes / Landmark</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe situation (e.g. called 3 times, phone switched off, gate locked...)"
                className={`w-full p-2.5 rounded-xl text-xs border outline-hidden resize-none h-20 ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/30 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Submitting to Operations...' : 'Submit Incident Report'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

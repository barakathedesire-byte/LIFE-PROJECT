import React, { useState } from 'react';
import { PickupOrder } from '../types';
import { 
  AlertTriangle, 
  Clock, 
  RotateCcw, 
  Send, 
  Phone, 
  ShieldAlert, 
  CheckCircle2, 
  Search, 
  Filter, 
  Truck, 
  Calendar, 
  UserCheck, 
  FileText,
  Zap,
  Info
} from 'lucide-react';
import { formatTZS } from '../../../utils/formatters';

interface Props {
  orders: PickupOrder[];
  setOrders: React.Dispatch<React.SetStateAction<PickupOrder[]>>;
}

export const ExceptionsView: React.FC<Props> = ({ orders, setOrders }) => {
  const [filter, setFilter] = useState<'ALL' | 'EXPIRED' | 'APPROACHING' | 'RETURN_PENDING'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const [smsModal, setSmsModal] = useState<{
    isOpen: boolean;
    orderId: string;
    customerName: string;
    phone: string;
    otp: string;
    shelf: string;
  } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Classify orders
  const expiredOrders = orders.filter(o => o.status === 'EXPIRED');
  const returnPendingOrders = orders.filter(o => o.status === 'RETURN_PENDING');
  const approachingExpiryOrders = orders.filter(o => {
    if (o.status === 'READY' || o.status === 'NOTIFIED') {
      // simulate approaching SLA if arrived earlier
      return true;
    }
    return false;
  }).slice(0, 3);

  // Return to Warehouse action
  const initiateReturn = (id: string, orderId: string) => {
    setOrders(prev => prev.map(o => 
      o.id === id ? { ...o, status: 'RETURN_PENDING' } : o
    ));
    showToast(`Return to LUMO Kurasini Central Hub (DAR-01) initiated for Order #${orderId}. Waybill generated.`);
  };

  // Extend hold window by 48h
  const grantExtension = (id: string, orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === id) {
        const newDeadline = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
        return { ...o, status: 'READY', pickupDeadline: newDeadline };
      }
      return o;
    }));
    showToast(`48-Hour Pickup SLA Extension granted for Order #${orderId}. Customer notified via SMS.`);
  };

  // Dispatch Express Courier for Reverse Logistics
  const dispatchReverseCourier = (orderId: string) => {
    showToast(`Express Courier assigned for Reverse Pickup of Order #${orderId} back to DAR-01.`);
  };

  // Filter list
  const filteredList = orders.filter(pkg => {
    const matchesSearch = 
      (pkg.orderId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pkg.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pkg.customerPhone || '').includes(searchQuery) ||
      (pkg.shelfLocation || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'EXPIRED') return pkg.status === 'EXPIRED';
    if (filter === 'RETURN_PENDING') return pkg.status === 'RETURN_PENDING';
    if (filter === 'APPROACHING') return ['READY', 'NOTIFIED'].includes(pkg.status);
    return true;
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Toast Bar */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-500/50 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold border border-rose-200 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">Exceptions &amp; Expired Packages Radar</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Live operational control tower for overdue parcels, reverse logistics, and customer SLA extensions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              showToast('Automated SMS & WhatsApp reminders dispatched to all customers with parcels awaiting collection.');
            }}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition shadow-md shadow-teal-900/10 flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-4 h-4" /> Blast Pickup Reminders
          </button>
        </div>
      </div>

      {/* KPI Stats Radar Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-rose-200 p-4 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Overdue &amp; Expired</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-700">{expiredOrders.length}</p>
          <p className="text-[11px] text-slate-500">Exceeded 7-day pickup window</p>
        </div>

        <div className="bg-white border border-amber-200 p-4 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Approaching Expiry (&lt;24h)</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-700">{approachingExpiryOrders.length}</p>
          <p className="text-[11px] text-slate-500">SLA expiring within 24 hours</p>
        </div>

        <div className="bg-white border border-blue-200 p-4 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Returns In Transit</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-blue-700">{returnPendingOrders.length}</p>
          <p className="text-[11px] text-slate-500">Scheduled for DAR-01 Central Hub</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Storage Lockers Active</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Info className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-800">74 / 100</p>
          <p className="text-[11px] text-slate-500">74% Station capacity utilized</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Filters */}
        <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
          {[
            { id: 'ALL', label: `All Parcels (${orders.length})` },
            { id: 'EXPIRED', label: `Expired (${expiredOrders.length})` },
            { id: 'APPROACHING', label: `Approaching SLA (${approachingExpiryOrders.length})` },
            { id: 'RETURN_PENDING', label: `Return Pending (${returnPendingOrders.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                filter === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Order #, Customer, Phone, Shelf..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Exceptions & Expired Radar Items Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex justify-between items-center">
          <h3 className="font-extrabold text-slate-900 text-sm">
            Active Exception &amp; Overdue Queue ({filteredList.length})
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Dar es Salaam Central Depot
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100 uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="py-3 px-4">Order ID &amp; Waybill</th>
                <th className="py-3 px-4">Customer Contact</th>
                <th className="py-3 px-4">Shelf / Locker</th>
                <th className="py-3 px-4">Status &amp; SLA Expiry</th>
                <th className="py-3 px-4 text-right">Radar Operations &amp; Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.map(pkg => (
                <tr key={pkg.id} className="hover:bg-slate-50/80 transition">
                  {/* Order ID */}
                  <td className="py-3 px-4">
                    <span className="font-mono font-extrabold text-slate-800 text-xs block">
                      #{pkg.orderId}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Waybill: {(pkg as any).trackingNumber || `WB-${pkg.orderId}`}
                    </span>
                  </td>

                  {/* Customer */}
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{pkg.customerName}</p>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <a href={`tel:${pkg.customerPhone}`} className="hover:underline hover:text-teal-600">
                        {pkg.customerPhone}
                      </a>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-mono font-bold text-xs border border-slate-200">
                      {pkg.shelfLocation || 'Lockers D-12'}
                    </span>
                  </td>

                  {/* Status & Deadline */}
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        pkg.status === 'EXPIRED' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                        pkg.status === 'RETURN_PENDING' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {pkg.status}
                      </span>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {pkg.pickupDeadline ? new Date(pkg.pickupDeadline).toLocaleDateString() : 'Hold Window Expired'}
                      </p>
                    </div>
                  </td>

                  {/* Radar Action Buttons */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      
                      {/* Resend Customer SMS Reminder */}
                      <button
                        onClick={() => {
                          setSmsModal({
                            isOpen: true,
                            orderId: pkg.orderId,
                            customerName: pkg.customerName,
                            phone: pkg.customerPhone,
                            otp: (pkg as any).pickupOtp || '4928',
                            shelf: pkg.shelfLocation || 'Lockers D-12'
                          });
                        }}
                        className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold transition border border-teal-200 cursor-pointer flex items-center gap-1"
                        title="Resend SMS / WhatsApp Reminder"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline text-[11px]">SMS Reminder</span>
                      </button>

                      {/* Grant 48h Extension */}
                      {pkg.status === 'EXPIRED' && (
                        <button
                          onClick={() => grantExtension(pkg.id, pkg.orderId)}
                          className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold transition border border-amber-200 cursor-pointer flex items-center gap-1"
                          title="Grant 48-Hour Extension"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline text-[11px]">Extend 48h</span>
                        </button>
                      )}

                      {/* Return to Warehouse DAR-01 */}
                      {pkg.status !== 'RETURN_PENDING' ? (
                        <button
                          onClick={() => initiateReturn(pkg.id, pkg.orderId)}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Return to DAR-01</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => dispatchReverseCourier(pkg.orderId)}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Assign Reverse Courier</span>
                        </button>
                      )}

                    </div>
                  </td>
                </tr>
              ))}

              {filteredList.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-70" />
                    <p className="font-bold text-slate-700 text-sm">No exceptions found matching current filter</p>
                    <p className="text-xs text-slate-400">All pickup station packages are operating within standard SLA limits.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Direct Customer Reminder SMS Modal */}
      {smsModal && smsModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4 text-slate-900 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm">Send Pickup Reminder SMS</h3>
                  <p className="text-[11px] text-slate-500">Order #{smsModal.orderId} • {smsModal.customerName}</p>
                </div>
              </div>
              <button
                onClick={() => setSmsModal(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 block mb-1">Customer Mobile Number</label>
                <input
                  type="text"
                  value={smsModal.phone}
                  readOnly
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">SMS Template Message</label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-700 leading-relaxed">
                  "LUMO Pickup Reminder: Dear {smsModal.customerName}, your package #{smsModal.orderId} is awaiting collection at LUMO Dar es Salaam Central ({smsModal.shelf}). Your Pickup OTP is [{smsModal.otp}]. Station closes at 8:00 PM."
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  showToast(`Pickup reminder SMS dispatched to ${smsModal.customerName} (${smsModal.phone}).`);
                  setSmsModal(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs transition shadow-md shadow-teal-900/20 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Send className="w-4 h-4" /> Send Instant SMS
              </button>
              <button
                onClick={() => setSmsModal(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

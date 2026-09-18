import React from 'react';
import { PickupOrder } from '../types';
import { Package, Clock, CheckCircle2, AlertTriangle, Users } from 'lucide-react';

interface Props {
  orders: PickupOrder[];
  setOrders: React.Dispatch<React.SetStateAction<PickupOrder[]>>;
}

export const OverviewView: React.FC<Props> = ({ orders }) => {
  const incoming = orders.filter(o => o.status === 'INCOMING').length;
  const ready = orders.filter(o => ['READY', 'NOTIFIED'].includes(o.status)).length;
  const expired = orders.filter(o => o.status === 'EXPIRED').length;
  const collected = orders.filter(o => o.status === 'COLLECTED').length;
  const stored = orders.filter(o => o.status === 'STORED').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Station Overview</h2>
          <p className="text-sm text-slate-500 mt-1">Real-time status of Dar es Salaam Central Station.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-bold">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          Station Open (74% Capacity)
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Incoming Today', value: incoming, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Stored (Not Ready)', value: stored, icon: Box, color: 'text-slate-600', bg: 'bg-slate-50' },
          { label: 'Ready for Pickup', value: ready, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Collected Today', value: collected, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Expired / Action Req', value: expired, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold text-slate-800">{stat.value}</span>
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase mt-3 tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Live Station Queue</h3>
          <button className="text-xs font-bold text-teal-600 hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4 font-semibold">Order ID</th>
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Location</th>
                <th className="py-3 px-4 font-semibold text-right">Time in Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.slice(0, 8).map(order => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-700">{order.orderId}</td>
                  <td className="py-3 px-4">{order.customerName}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      ['READY', 'NOTIFIED'].includes(order.status) ? 'bg-emerald-50 text-emerald-700' :
                      order.status === 'EXPIRED' ? 'bg-rose-50 text-rose-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">{order.shelfLocation || '-'}</td>
                  <td className="py-3 px-4 text-right text-slate-400 text-xs">
                    {order.arrivedAt ? new Date(order.arrivedAt).toLocaleTimeString() : 'N/A'}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">No active queue.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

function Box(props: any) { return <Package {...props} />; }

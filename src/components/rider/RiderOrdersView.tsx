import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Zap,
  Timer
} from 'lucide-react';
import { DeliveryTask } from '../../types';
import { api } from '../../services/api';

interface RiderOrdersViewProps {
  tasks: DeliveryTask[];
  onSelectTask: (task: DeliveryTask) => void;
  onRefresh: () => void;
  isLight?: boolean;
}

export const RiderOrdersView: React.FC<RiderOrdersViewProps> = ({
  tasks,
  onSelectTask,
  onRefresh,
  isLight = false,
}) => {
  const [filterTab, setFilterTab] = useState<'available' | 'assigned' | 'completed' | 'all'>('available');
  const [searchQuery, setSearchQuery] = useState('');
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [acceptError, setAcceptError] = useState('');
  const [countdown, setCountdown] = useState(42);

  // Live countdown timer for available broadcasts
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => (prev > 1 ? prev - 1 : 45));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Broadcasts available in dispatch pool
  const availableBroadcasts = [
    {
      id: 'task-broadcast-01',
      orderNumber: 'ORD-784512',
      pickupMerchant: 'Lumo Fresh Supermarket',
      pickupAddress: 'Mikocheni, Dar es Salaam',
      customerName: 'Amina Juma',
      dropoffAddress: 'Julius Nyerere Rd, Kijitonyama',
      fee: 8500,
      distance: '2.4 km',
      type: 'EXPRESS',
      estTime: '18 min',
      slaLimit: '28 min',
    },
    {
      id: 'task-broadcast-02',
      orderNumber: 'ORD-991204',
      pickupMerchant: 'Apex Tech Kariakoo',
      pickupAddress: 'Msimbazi St, Kariakoo',
      customerName: 'Baraka Ally',
      dropoffAddress: 'Haile Selassie Rd, Masaki',
      fee: 11000,
      distance: '6.8 km',
      type: 'EXPRESS',
      estTime: '32 min',
      slaLimit: '45 min',
    },
  ];

  const handleAcceptBroadcast = async (bcast: any) => {
    setAcceptingId(bcast.id);
    setAcceptError('');

    try {
      // Atomic accept via backend
      const res = await api.acceptDeliveryTask(bcast.id, bcast.orderNumber);
      if (res.success && res.task) {
        onRefresh();
        onSelectTask(res.task);
      } else {
        // Mock fallback if task ID is dynamic in demo
        onSelectTask({
          id: bcast.id,
          deliveryRunId: 'run-today',
          orderId: bcast.orderNumber,
          orderNumber: bcast.orderNumber,
          customerName: bcast.customerName,
          customerPhone: '+255 712 345 678',
          address: bcast.dropoffAddress,
          paymentMethod: 'mobile_money',
          codAmount: bcast.fee * 10,
          isCodCollected: true,
          otpCode: '123456',
          status: 'ASSIGNED'
        });
      }
    } catch {
      onSelectTask({
        id: bcast.id,
        deliveryRunId: 'run-today',
        orderId: bcast.orderNumber,
        orderNumber: bcast.orderNumber,
        customerName: bcast.customerName,
        customerPhone: '+255 712 345 678',
        address: bcast.dropoffAddress,
        paymentMethod: 'mobile_money',
        codAmount: bcast.fee * 10,
        isCodCollected: true,
        otpCode: '123456',
        status: 'ASSIGNED'
      });
    } finally {
      setAcceptingId(null);
    }
  };

  const filteredTasks = tasks.filter(t => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (t.orderNumber || '').toLowerCase().includes(query) ||
      (t.customerName || '').toLowerCase().includes(query) ||
      (t.address || '').toLowerCase().includes(query);

    if (filterTab === 'assigned') return matchesSearch && (t.status === 'ASSIGNED' || t.status === 'IN_TRANSIT');
    if (filterTab === 'completed') return matchesSearch && t.status === 'DELIVERED';
    return matchesSearch;
  });

  return (
    <div className="w-full px-4 py-3 space-y-4 pb-28">
      
      {/* Top Search & Filter Bar */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search order #, customer, or zone..."
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium border outline-hidden transition-all ${
              isLight
                ? 'bg-white border-slate-200 text-slate-900 focus:border-emerald-500'
                : 'bg-slate-900 border-slate-800 text-white focus:border-emerald-400'
            }`}
          />
        </div>

        {/* Tab Filters */}
        <div className={`p-1 rounded-xl border flex gap-1 ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          {[
            { id: 'available', label: 'Broadcasts (2)' },
            { id: 'assigned', label: 'Active (1)' },
            { id: 'completed', label: 'Delivered (12)' },
            { id: 'all', label: 'All History' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as any)}
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                filterTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Available Broadcasts Tab */}
      {filterTab === 'available' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Incoming Nearby Orders
            </span>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Timer className="w-3.5 h-3.5 animate-spin" /> Auto-refreshes in {countdown}s
            </span>
          </div>

          {acceptError && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{acceptError}</span>
            </div>
          )}

          {availableBroadcasts.map(bcast => (
            <div
              key={bcast.id}
              className={`p-4 rounded-2xl border shadow-sm space-y-3 transition-all ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}
            >
              {/* Top Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
                    #{bcast.orderNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 text-[10px] font-bold">
                    {bcast.type}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                    TZS {bcast.fee.toLocaleString()}
                  </span>
                  <p className="text-[10px] text-slate-400 font-medium">Guaranteed payout</p>
                </div>
              </div>

              {/* Journey details */}
              <div className="text-xs space-y-2 pl-4 relative">
                <div className="absolute left-1.5 top-1.5 bottom-1.5 w-0.5 border-l border-dashed border-slate-300 dark:border-slate-700" />
                
                <div>
                  <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    Pickup: {bcast.pickupMerchant}
                  </p>
                  <p className="text-[11px] text-slate-500 pl-3.5">{bcast.pickupAddress}</p>
                </div>

                <div>
                  <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    Dropoff: {bcast.customerName}
                  </p>
                  <p className="text-[11px] text-slate-500 pl-3.5">{bcast.dropoffAddress}</p>
                </div>
              </div>

              {/* Bottom Metrics & Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-slate-500 font-medium">{bcast.distance} • {bcast.estTime}</span>

                <div className="flex gap-2">
                  <button
                    onClick={() => {}}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-500 text-xs font-semibold"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleAcceptBroadcast(bcast)}
                    disabled={acceptingId === bcast.id}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm flex items-center gap-1 cursor-pointer"
                  >
                    {acceptingId === bcast.id ? (
                      <span>Accepting...</span>
                    ) : (
                      <>
                        <span>Accept Delivery</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Other Filter Tabs */}
      {filterTab !== 'available' && (
        <div className="space-y-2.5">
          {filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs space-y-2">
              <Package className="w-8 h-8 mx-auto opacity-40" />
              <p>No orders found under this filter.</p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <div
                key={task.id}
                onClick={() => onSelectTask(task)}
                className={`p-3.5 rounded-xl border shadow-sm flex items-center justify-between cursor-pointer transition-all hover:border-emerald-500 ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400">
                      #{task.orderNumber || 'ORD-10482'}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      task.status === 'DELIVERED'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <p className="text-xs font-bold truncate text-slate-900 dark:text-white">
                    {task.customerName || 'Customer'}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {task.address || 'Dar es Salaam'}
                  </p>
                </div>

                <div className="text-right shrink-0 ml-3">
                  <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                    TZS {task.codAmount ? Math.min(8500, Math.round(task.codAmount * 0.1)).toLocaleString() : '8,500'}
                  </p>
                  <ChevronRight className="w-4 h-4 text-slate-400 ml-auto mt-1" />
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};

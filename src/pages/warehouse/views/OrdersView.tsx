import React, { useState } from 'react';
import { Search, Filter, Eye, Clock, AlertTriangle, X, User, MapPin, Printer, ShieldCheck, CheckCircle2, ChevronRight, ArrowRight } from 'lucide-react';
import { WHOrder } from '../types';
import { formatTZS } from '../../../utils/formatters';

interface OrdersViewProps {
  orders: WHOrder[];
  setOrders?: React.Dispatch<React.SetStateAction<WHOrder[]>>;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ orders, setOrders }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<WHOrder | null>(null);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.vendorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || o.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleUpdateStatus = (orderId: string, nextStatus: WHOrder['status']) => {
    if (setOrders) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus, timeInStage: 'Just now' } : o));
    }
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: nextStatus, timeInStage: 'Just now' } : null);
    }
    showToast(`Order #${selectedOrder?.orderNumber || orderId} advanced to ${nextStatus.replace(/_/g, ' ')}`);
  };

  const handleTogglePriority = (orderId: string) => {
    if (setOrders) {
      setOrders(prev => prev.map(o => {
        if (o.id === orderId) {
          const newPriority = o.priority === 'EXPRESS' ? 'NORMAL' : 'EXPRESS';
          return { ...o, priority: newPriority, expressDeadline: newPriority === 'EXPRESS' ? '45 mins' : undefined };
        }
        return o;
      }));
    }
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => prev ? {
        ...prev,
        priority: prev.priority === 'EXPRESS' ? 'NORMAL' : 'EXPRESS',
        expressDeadline: prev.priority === 'EXPRESS' ? undefined : '45 mins'
      } : null);
    }
    showToast('Priority updated successfully.');
  };

  return (
    <div className="space-y-6 animate-in fade-in h-full flex flex-col">
      {toastMessage && (
        <div className="p-3 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-lg flex items-center justify-between animate-in fade-in sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="p-1 hover:bg-emerald-700 rounded"><X size={14} /></button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Warehouse Fulfillment Orders Queue</h2>
          <p className="text-xs text-slate-500 mt-1">Track picking, packing, QC inspections, and dispatch status across Dar es Salaam Hub.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search Order ID, Customer..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#FF6A00] focus:border-[#FF6A00] outline-none"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#FF6A00]"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New Awaiting Picking</option>
            <option value="PICKING">In Picking</option>
            <option value="QUALITY_CHECK">Quality Check (QC)</option>
            <option value="PACKING">Packing Station</option>
            <option value="STAGING">Staged at Bay</option>
            <option value="READY">Ready for Handover</option>
            <option value="DISPATCHED">Dispatched</option>
          </select>
          <select 
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#FF6A00]"
          >
            <option value="ALL">All Priorities</option>
            <option value="EXPRESS">Express Only</option>
            <option value="HIGH">High Priority</option>
            <option value="NORMAL">Standard</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 sticky top-0 z-10 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Order ID & Type</th>
                <th className="py-3 px-4">Customer & Merchant</th>
                <th className="py-3 px-4">Order Value</th>
                <th className="py-3 px-4">Priority SLA</th>
                <th className="py-3 px-4">Stage Status</th>
                <th className="py-3 px-4">Assigned Personnel</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredOrders.map(order => (
                <tr 
                  key={order.id} 
                  onClick={() => setSelectedOrder(order)}
                  className="hover:bg-orange-50/50 transition cursor-pointer group"
                >
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 font-mono text-xs">{order.orderNumber}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{order.itemCount} items • {order.deliveryType}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-800">{order.customerName}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{order.vendorName}</div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                    {formatTZS(order.totalValue || (order.itemCount * 85000))}
                  </td>
                  <td className="py-3.5 px-4">
                    {order.priority === 'EXPRESS' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700 uppercase border border-red-200 animate-pulse">
                        <AlertTriangle size={11} /> Express
                      </span>
                    ) : order.priority === 'HIGH' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                        High Priority
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 uppercase">
                        Normal
                      </span>
                    )}
                    {order.expressDeadline && (
                      <div className="text-[10px] font-bold text-red-600 mt-1 flex items-center gap-1">
                        <Clock size={11} /> {order.expressDeadline} remaining
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                      {(order.status || '').replace(/_/g, ' ')}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1">{order.timeInStage} in current station</div>
                  </td>
                  <td className="py-3.5 px-4">
                    {order.assignedPicker || order.assignedPacker ? (
                      <div className="text-[11px] text-slate-700">
                        {order.assignedPicker && <div>Picker: <span className="font-bold">{order.assignedPicker}</span></div>}
                        {order.assignedPacker && <div>Packer: <span className="font-bold">{order.assignedPacker}</span></div>}
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Auto-allocation pending</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(order);
                      }}
                      className="p-2 text-slate-400 hover:text-[#FF6A00] hover:bg-orange-100/60 rounded-xl transition cursor-pointer"
                      title="Inspect full order breakdown"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              <p className="font-medium text-sm">No orders found matching the filter criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* DETAILED ORDER INSPECTION DRAWER / MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-slate-900 text-lg font-mono">Order {selectedOrder.orderNumber}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                    {(selectedOrder.status || '').replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Created: {(selectedOrder?.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : '')}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Customer & Merchant Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase text-[10px]">
                    <User size={14} /> Customer Information
                  </div>
                  <p className="font-bold text-slate-900 text-sm">{selectedOrder.customerName}</p>
                  <p className="text-slate-600 flex items-center gap-1">
                    <MapPin size={13} className="text-slate-400" /> Kariakoo, Dar es Salaam (Zone 2)
                  </p>
                  <p className="text-slate-500 font-mono text-[11px]">+255 754 *** 892 • Escrow Paid (M-Pesa)</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase text-[10px]">
                    <ShieldCheck size={14} /> Fulfillment Merchant & SLA
                  </div>
                  <p className="font-bold text-slate-900 text-sm">{selectedOrder.vendorName}</p>
                  <p className="text-slate-600">Type: <span className="font-semibold text-slate-900">{selectedOrder.deliveryType} Delivery</span></p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-500">Priority:</span>
                    <button
                      onClick={() => handleTogglePriority(selectedOrder.id)}
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] cursor-pointer transition ${
                        selectedOrder.priority === 'EXPRESS' ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {selectedOrder.priority === 'EXPRESS' ? 'EXPRESS (Click to Normal)' : 'NORMAL (Click for Express)'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Items Manifest */}
              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-3">Order Items Manifest ({selectedOrder.itemCount} SKUs)</h4>
                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                  <div className="p-3 bg-slate-50 flex items-center justify-between font-bold text-slate-600 text-[11px]">
                    <span>Item & SKU</span>
                    <span>Bin / Zone</span>
                    <span>Quantity</span>
                  </div>
                  <div className="p-3 flex items-center justify-between hover:bg-slate-50/50">
                    <div>
                      <p className="font-bold text-slate-900">Samsung Galaxy S24 Ultra 256GB</p>
                      <p className="font-mono text-[10px] text-slate-400">SKU: SAM-S24U-256</p>
                    </div>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded font-mono font-bold">
                      ZONE-A / BIN-04-C
                    </span>
                    <span className="font-bold text-slate-900">1 unit</span>
                  </div>
                  {selectedOrder.itemCount > 1 && (
                    <div className="p-3 flex items-center justify-between hover:bg-slate-50/50">
                      <div>
                        <p className="font-bold text-slate-900">Anker 65W GaN Fast Charger</p>
                        <p className="font-mono text-[10px] text-slate-400">SKU: ANK-GAN-65W</p>
                      </div>
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded font-mono font-bold">
                        ZONE-B / BIN-12-A
                      </span>
                      <span className="font-bold text-slate-900">{selectedOrder.itemCount - 1} units</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Advance Station Workflow Quick Action */}
              <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">Fulfillment Station Movement</span>
                  <span className="text-[11px] text-orange-700 font-semibold">Advance along pipeline</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {(['NEW', 'PICKING', 'QUALITY_CHECK', 'PACKING', 'STAGING', 'READY', 'DISPATCHED'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition cursor-pointer ${
                        selectedOrder.status === st 
                          ? 'bg-[#FF6A00] text-white shadow-xs' 
                          : 'bg-white text-slate-700 border border-slate-200 hover:border-orange-300'
                      }`}
                    >
                      {st.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
              <button
                onClick={() => setShowSlipModal(true)}
                className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold rounded-xl transition flex items-center gap-1.5 text-xs cursor-pointer shadow-xs"
              >
                <Printer size={15} />
                <span>Print Pick Slip & Barcode</span>
              </button>

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT PICK SLIP THERMAL PREVIEW MODAL */}
      {showSlipModal && selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 border border-slate-200 space-y-4 font-mono text-xs">
            <div className="text-center border-b pb-3 border-slate-200">
              <h2 className="font-extrabold text-base text-slate-900 tracking-wider">LUMO WAREHOUSE MANIFEST</h2>
              <p className="text-[10px] text-slate-500">DAR ES SALAAM CENTRAL HUB • DAR-01</p>
              <div className="my-2 bg-slate-100 p-2 rounded text-center">
                <span className="font-bold text-lg text-slate-900 tracking-widest">{selectedOrder.orderNumber}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between"><span className="text-slate-500">Customer:</span><span className="font-bold text-slate-800">{selectedOrder.customerName}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Priority:</span><span className="font-bold text-red-600">{selectedOrder.priority}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Items Count:</span><span className="font-bold">{selectedOrder.itemCount} SKUs</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Bin Location:</span><span className="font-bold text-blue-700">ZONE-A / BIN-04</span></div>
            </div>

            <div className="border-t border-dashed border-slate-300 pt-3 text-center">
              <div className="h-10 bg-slate-900 text-white flex items-center justify-center font-bold tracking-widest text-xs rounded">
                |||| | |||||| || |||| |||| |||||
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Scan at packing and staging bays</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => {
                  showToast('Thermal pick slip sent to Zebra ZT410 printer queue.');
                  setShowSlipModal(false);
                }}
                className="flex-1 py-2.5 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Send to Printer
              </button>
              <button 
                onClick={() => setShowSlipModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

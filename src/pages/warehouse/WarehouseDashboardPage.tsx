import React, { useState, useEffect } from 'react';
import { HeaderNotificationBell } from '../../components/common/HeaderNotificationBell';
import { UserAccountNavDropdown } from '../../components/common/UserAccountNavDropdown';
import { 
  Package, LayoutDashboard, ListTodo, CheckSquare, Box, Truck, 
  MapPin, AlertCircle, RotateCcw, Search, Filter, ScanLine, 
  Settings, Users, Activity, ChevronRight, Menu, CheckCircle2, XCircle, ArrowRight, Clock, AlertTriangle, ShieldAlert
} from 'lucide-react';
import { WarehouseActiveTab, WHOrder } from './types';


// VIEWS
import { OrdersView } from './views/OrdersView';
import { InventoryView } from './views/InventoryView';
import { PickingView } from './views/PickingView';
import { QualityCheckView } from './views/QualityCheckView';
import { PackingView } from './views/PackingView';
import { StagingView } from './views/StagingView';
import { DispatchView } from './views/DispatchView';
import { ReturnsView } from './views/ReturnsView';
import { AlertsView } from './views/AlertsView';
import { StaffView } from './views/StaffView';
import { LowStockView } from './views/LowStockView';

// --- DASHBOARD & LIVE FULFILLMENT ---


const DashboardView = ({ orders, inventory }: { orders: WHOrder[], inventory: any[] }) => {
  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Warehouse Fulfillment Hub</h2>
          <p className="text-slate-500">DAR-01 Central Hub • Shift: MORNING • 18 Staff Active</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-semibold text-sm border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Operations Normal
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Orders KPIs */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Package className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Orders</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Awaiting Fulfillment</span>
              <span className="font-bold text-slate-900">{orders.filter(o => o.status === 'NEW').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">In Progress</span>
              <span className="font-bold text-slate-900">{orders.filter(o => ['PICKING', 'QUALITY_CHECK', 'PACKING', 'STAGING'].includes(o.status)).length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Delayed/Exception</span>
              <span className="font-bold text-red-600">{orders.filter(o => ['DELAYED', 'EXCEPTION'].includes(o.status)).length}</span>
            </div>
          </div>
        </div>

        {/* Inventory KPIs */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <Box className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Inventory</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Total SKUs</span>
              <span className="font-bold text-slate-900">{inventory.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Low Stock</span>
              <span className="font-bold text-amber-600">{inventory.filter(i => i.status === 'LOW_STOCK').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Out of Stock</span>
              <span className="font-bold text-red-600">{inventory.filter(i => i.status === 'OUT_OF_STOCK').length}</span>
            </div>
          </div>
        </div>

        {/* Delivery KPIs */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <Truck className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Dispatch</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Ready for Pickup</span>
              <span className="font-bold text-emerald-600">{orders.filter(o => o.status === 'READY').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Handover in Progress</span>
              <span className="font-bold text-slate-900">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Dispatched Today</span>
              <span className="font-bold text-slate-900">{orders.filter(o => o.status === 'DISPATCHED').length}</span>
            </div>
          </div>
        </div>

        {/* Returns KPIs */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <RotateCcw className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Returns</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Pending Returns</span>
              <span className="font-bold text-slate-900">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Awaiting Inspection</span>
              <span className="font-bold text-amber-600">5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Restocked Today</span>
              <span className="font-bold text-slate-900">18</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const LiveFulfillmentView = ({ orders, setOrders }: { orders: WHOrder[], setOrders: React.Dispatch<React.SetStateAction<WHOrder[]>> }) => {
  const columns: { id: WHOrder['status'], title: string }[] = [
    { id: 'NEW', title: 'New' },
    { id: 'PICKING', title: 'Picking' },
    { id: 'QUALITY_CHECK', title: 'Quality Check' },
    { id: 'PACKING', title: 'Packing' },
    { id: 'STAGING', title: 'Staging' },
    { id: 'READY', title: 'Ready' }
  ];

  const handleMoveOrder = (orderId: string, nextStatus: WHOrder['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
  };

  return (
    <div className="space-y-4 animate-in fade-in h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Live Fulfillment Board</h2>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Clock className="w-4 h-4" /> Live Updates
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max h-full">
          {columns.map(col => {
            const columnOrders = orders.filter(o => o.status === col.id);
            return (
              <div key={col.id} className="w-72 flex flex-col bg-slate-50 rounded-xl border border-slate-200 overflow-hidden h-full max-h-[75vh]">
                <div className="p-3 bg-slate-100 border-b border-slate-200 flex justify-between items-center font-bold text-sm text-slate-700 shrink-0">
                  {col.title}
                  <span className="px-2 py-0.5 bg-slate-200 rounded-full text-xs">{columnOrders.length}</span>
                </div>
                <div className="p-2 space-y-3 overflow-y-auto flex-1">
                  {columnOrders.map(order => (
                    <div key={order.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm text-sm hover:border-[#FF6A00] transition cursor-pointer group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold font-mono text-slate-900 text-xs">{order.orderNumber}</span>
                        {order.priority === 'EXPRESS' && (
                          <span className="px-1.5 py-0.5 bg-red-100 text-red-700 font-bold text-[10px] rounded uppercase animate-pulse">
                            Express
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-600 space-y-1 mb-3">
                        <p className="truncate">{order.customerName}</p>
                        <p>{order.itemCount} items</p>
                        {order.expressDeadline && (
                          <p className="text-red-600 font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {order.expressDeadline}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                        <span className="text-[10px] text-slate-400">{order.timeInStage}</span>
                        {/* Mock action button to move it to next stage for demonstration */}
                        {col.id !== 'READY' && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const nextIdx = columns.findIndex(c => c.id === col.id) + 1;
                              if (nextIdx < columns.length) handleMoveOrder(order.id, columns[nextIdx].id);
                            }}
                            className="p-1 text-slate-400 hover:text-[#FF6A00] hover:bg-orange-50 rounded transition opacity-0 group-hover:opacity-100"
                            title="Move to next stage"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {columnOrders.length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-400 italic">No orders</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};


// --- MAIN LAYOUT ---

export function WarehouseDashboardPage() {
  const [activeTab, setActiveTab] = useState<WarehouseActiveTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // State
  const [orders, setOrders] = useState<WHOrder[]>([]);
  const [inventory] = useState<any[]>([]);
  const [staff] = useState<any[]>([]);

  const navigation = [
    { 
      title: 'Overview', 
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'live-fulfillment', label: 'Live Fulfillment', icon: Activity },
      ]
    },
    { 
      title: 'Fulfillment', 
      items: [
        { id: 'orders', label: 'Orders', icon: ListTodo },
        { id: 'picking', label: 'Picking', icon: Package },
        { id: 'quality', label: 'Quality Check', icon: CheckSquare },
        { id: 'packing', label: 'Packing', icon: Box },
        { id: 'staging', label: 'Staging', icon: MapPin },
        { id: 'dispatch', label: 'Dispatch', icon: Truck },
      ]
    },
    { 
      title: 'Inventory', 
      items: [
        { id: 'inventory', label: 'Inventory', icon: Box },
        { id: 'low-stock', label: 'Low Stock', icon: AlertTriangle },
      ]
    },
    { 
      title: 'Returns', 
      items: [
        { id: 'returns', label: 'Returns', icon: RotateCcw },
      ]
    },
    {
      title: 'Support & Settings',
      items: [
        { id: 'alerts', label: 'Exceptions & Alerts', icon: AlertCircle },
        { id: 'staff', label: 'Warehouse Staff', icon: Users },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className={`bg-[#0B132B] text-white flex flex-col shrink-0 border-r border-slate-800 shadow-xl transition-all duration-300 ${isSidebarOpen ? 'w-full md:w-64' : 'w-full md:w-20'} h-screen z-20 absolute md:relative`}>
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'md:hidden' : ''}`}>
            <div className="w-8 h-8 rounded-lg bg-[#FF6A00]/20 flex items-center justify-center text-[#FF6A00]">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-sm">LUMO Hub</h1>
              <p className="text-[10px] text-slate-400">Fulfillment Center</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white hidden md:block">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          {navigation.map((group, idx) => (
            <div key={idx}>
              {isSidebarOpen && <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-3">{group.title}</h3>}
              <div className="space-y-1">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as WarehouseActiveTab)}
                      title={!isSidebarOpen ? item.label : undefined}
                      className={`w-full flex items-center ${isSidebarOpen ? 'gap-3 px-3 py-2' : 'justify-center p-2'} rounded-lg text-xs font-semibold transition-all ${
                        isActive ? 'bg-[#FF6A00] text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {isSidebarOpen && <span>{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer with Account & Logout */}
        <div className="p-3 border-t border-slate-800 shrink-0">
          <UserAccountNavDropdown variant="dark" compact={!isSidebarOpen} align="left" className="w-full" />
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 h-screen overflow-hidden flex flex-col bg-slate-50 relative">
        
        {/* Top Header Bar */}
        <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-xs z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-xl md:hidden text-slate-700 cursor-pointer">
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FF6A00]/10 flex items-center justify-center text-[#FF6A00]">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-sm md:text-base">Central Warehouse Hub</span>
                <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 text-teal-800">
                  Dar Fulfillment Staging
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <HeaderNotificationBell roleFilter="WAREHOUSE" />
            <UserAccountNavDropdown variant="light" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {activeTab === 'dashboard' && <DashboardView orders={orders} inventory={inventory} />}
          {activeTab === 'live-fulfillment' && <LiveFulfillmentView orders={orders} setOrders={setOrders} />}
          {activeTab === 'orders' && <OrdersView orders={orders} setOrders={setOrders} />}
          {activeTab === 'inventory' && <InventoryView inventory={inventory} />}
          {activeTab === 'low-stock' && <LowStockView />}
          {activeTab === 'picking' && <PickingView orders={orders} inventory={inventory} setOrders={setOrders} />}
          {activeTab === 'quality' && <QualityCheckView orders={orders} setOrders={setOrders} />}
          {activeTab === 'packing' && <PackingView orders={orders} setOrders={setOrders} />}
          {activeTab === 'staging' && <StagingView orders={orders} setOrders={setOrders} />}
          {activeTab === 'dispatch' && <DispatchView orders={orders} setOrders={setOrders} />}
          {activeTab === 'returns' && <ReturnsView />}
          {activeTab === 'alerts' && <AlertsView exceptions={[]} />}
          {activeTab === 'staff' && <StaffView staff={staff} />}
          
          {/* Work in progress placeholders for others while we build them out */}
          {!['dashboard', 'live-fulfillment', 'orders', 'inventory', 'picking', 'quality', 'packing', 'staging', 'dispatch', 'returns', 'alerts', 'staff'].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-slate-500 animate-in fade-in">
              <Package className="w-16 h-16 text-slate-300" />
              <div>
                <h3 className="text-xl font-bold text-slate-700 capitalize">{(activeTab || '').replace(/-/g, ' ')}</h3>
                <p className="text-sm mt-1">This module is actively being implemented in the Lumo Warehouse rollout.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

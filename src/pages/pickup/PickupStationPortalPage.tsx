import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, LayoutDashboard, QrCode, ArrowLeftRight, Box, AlertTriangle, 
  Settings, Users, DollarSign, Activity, FileText, Bell, Search, X, CheckCircle2,
  Clock, Truck, Send, Phone, ChevronRight, Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserAccountNavDropdown } from '../../components/common/UserAccountNavDropdown';
import { VerificationBanner } from '../../components/common/VerificationBanner';
import { OverviewView } from './views/OverviewView';
import { IncomingPackagesView } from './views/IncomingPackagesView';
import { StorageManagementView } from './views/StorageManagementView';
import { CustomerHandoverView } from './views/CustomerHandoverView';
import { ReturnsView } from './views/ReturnsView';
import { ExceptionsView } from './views/ExceptionsView';
import { StationManagementView } from './views/StationManagementView';
import { FinanceView } from './views/FinanceView';
import { AnalyticsView } from './views/AnalyticsView';

// Initial Mock Data to share across views


export const PickupStationPortalPage = () => {
  const { currentAccount } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [staff, setStaff] = useState([]);
  
  // Notification Modal State
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [selectedNotifDetail, setSelectedNotifDetail] = useState<any | null>(null);
  const [stationNotifs, setStationNotifs] = useState([
    {
      id: 'st-notif-1',
      title: 'Inbound Freight Manifest Dispatched',
      subtitle: 'Truck #TRK-892 en route from DAR-01 Central Hub with 24 parcels',
      category: 'INBOUND',
      time: '12m ago',
      unread: true,
      details: {
        manifestNumber: 'MAN-DAR01-892',
        truckPlate: 'T 920 DTZ',
        driverName: 'Rashid Mwangi',
        driverPhone: '+255 712 998 877',
        parcelsCount: 24,
        eta: '2:15 PM Today',
        action: 'incoming'
      }
    },
    {
      id: 'st-notif-2',
      title: '3 Overdue Packages Exceeded 7-Day Hold',
      subtitle: 'Orders #ORD-10482, #ORD-10499, #ORD-10512 require return or extension',
      category: 'EXCEPTION',
      time: '45m ago',
      unread: true,
      details: {
        affectedOrders: ['ORD-10482', 'ORD-10499', 'ORD-10512'],
        urgency: 'HIGH',
        reason: 'Maximum free customer hold duration (7 business days) reached.',
        action: 'exceptions'
      }
    },
    {
      id: 'st-notif-3',
      title: 'Customer OTP Verification Success',
      subtitle: 'Order #ORD-10479 handed over to buyer David Kimaro',
      category: 'HANDOVER',
      time: '1h ago',
      unread: false,
      details: {
        orderId: 'ORD-10479',
        customerName: 'David Kimaro',
        otpVerified: '6192',
        action: 'handover'
      }
    },
    {
      id: 'st-notif-4',
      title: 'Station Smart Locker Firmware Updated',
      subtitle: 'Lockers A1-D24 calibrated and synchronized with LUMO Core',
      category: 'SYSTEM',
      time: '3h ago',
      unread: false,
      details: {
        firmwareVersion: 'v2.4.1-LUMO',
        batteryStatus: 'Main Grid Active (100%)'
      }
    }
  ]);
  
  const navGroups = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { id: 'incoming', label: 'Incoming Packages', icon: Box },
        { id: 'storage', label: 'Package Storage', icon: Package },
        { id: 'handover', label: 'Customer Handover', icon: QrCode },
      ]
    },
    {
      title: 'EXCEPTIONS & RETURNS',
      items: [
        { id: 'returns', label: 'Customer Returns', icon: ArrowLeftRight },
        { id: 'exceptions', label: 'Exceptions & Expired', icon: AlertTriangle },
      ]
    },
    {
      title: 'STATION MANAGEMENT',
      items: [
        { id: 'station', label: 'Station & Staff', icon: Users },
        { id: 'finance', label: 'Finance & Payments', icon: DollarSign },
      ]
    },
    {
      title: 'REPORTING',
      items: [
        { id: 'analytics', label: 'Analytics', icon: Activity },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full overflow-y-auto shrink-0 border-r border-slate-800">
        <div className="p-6">
          <div className="flex items-center gap-2 text-white mb-1">
            <Package className="w-6 h-6 text-teal-500" />
            <h1 className="text-xl font-bold tracking-tight">Lumo Pickup</h1>
          </div>
          <p className="text-xs text-slate-500 font-mono">Dar es Salaam Central</p>
        </div>
        
        <div className="flex-1 py-4">
          {navGroups.map((group, idx) => (
            <div key={idx} className="mb-6">
              <div className="px-6 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {group.title}
              </div>
              <ul className="space-y-0.5">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition ${
                          isActive 
                            ? 'bg-teal-500/10 text-teal-400 border-r-2 border-teal-400' 
                            : 'hover:bg-slate-800 hover:text-white border-r-2 border-transparent'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                        {item.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Sidebar User Account & Logout */}
        <div className="p-4 border-t border-slate-800">
          <UserAccountNavDropdown variant="dark" align="left" className="w-full" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-slate-800">
              {navGroups.flatMap(g => g.items).find(i => i.id === activeTab)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search orders, packages..." 
                className="pl-9 pr-4 py-2 bg-slate-100 border-transparent rounded-lg text-sm focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none w-64 transition"
              />
            </div>
            <button 
              onClick={() => setIsNotifDrawerOpen(true)}
              className="relative p-2 text-slate-500 hover:text-teal-600 transition bg-slate-100 hover:bg-teal-50 rounded-full cursor-pointer"
              title="Station Notifications & Radar"
            >
              <Bell className="w-5 h-5" />
              {stationNotifs.some(n => n.unread) && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
              )}
            </button>
            <UserAccountNavDropdown variant="light" />
          </div>
        </header>

        {/* Scrollable View Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <VerificationBanner user={currentAccount} roleName="Pickup Station" />
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'overview' && <OverviewView orders={orders} setOrders={setOrders} />}
              {activeTab === 'incoming' && <IncomingPackagesView orders={orders} setOrders={setOrders} />}
              {activeTab === 'storage' && <StorageManagementView orders={orders} setOrders={setOrders} />}
              {activeTab === 'handover' && <CustomerHandoverView orders={orders} setOrders={setOrders} />}
              {activeTab === 'returns' && <ReturnsView returns={returns} setReturns={setReturns} />}
              {activeTab === 'exceptions' && <ExceptionsView orders={orders} setOrders={setOrders} />}
              {activeTab === 'station' && <StationManagementView staff={staff} setStaff={setStaff} />}
              {activeTab === 'finance' && <FinanceView orders={orders} setOrders={setOrders} />}
              {activeTab === 'analytics' && <AnalyticsView orders={orders} returns={returns} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Station Notifications & Alerts Drawer */}
        {isNotifDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-teal-100 text-teal-700">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">Station Operational Notices</h3>
                    <p className="text-xs text-slate-500">Live depot alerts &amp; radar broadcasts</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsNotifDrawerOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Action Toolbar */}
              <div className="p-3 border-b border-slate-100 bg-white flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">
                  {stationNotifs.filter(n => n.unread).length} Unread Notices
                </span>
                <button
                  onClick={() => {
                    setStationNotifs(prev => prev.map(n => ({ ...n, unread: false })));
                  }}
                  className="text-teal-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Mark all read
                </button>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {stationNotifs.map(n => (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (n.unread) {
                        setStationNotifs(prev => prev.map(item => item.id === n.id ? { ...item, unread: false } : item));
                      }
                      setSelectedNotifDetail(n);
                    }}
                    className={`p-3.5 rounded-2xl border shadow-xs cursor-pointer transition hover:scale-[1.01] ${
                      n.unread ? 'bg-teal-50/60 border-teal-300 ring-1 ring-teal-400/30' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          n.category === 'EXCEPTION' ? 'bg-rose-100 text-rose-800' :
                          n.category === 'INBOUND' ? 'bg-blue-100 text-blue-800' :
                          n.category === 'HANDOVER' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {n.category}
                        </span>
                        {n.unread && <span className="w-2 h-2 rounded-full bg-teal-500" />}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-xs mt-1.5">{n.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{n.subtitle}</p>

                    <div className="flex items-center justify-end gap-1 mt-2 text-[11px] font-bold text-teal-600">
                      <span>View details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Selected Station Notice Detail Modal */}
        {selectedNotifDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl text-slate-900 space-y-4 animate-in zoom-in-95">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                    selectedNotifDetail.category === 'EXCEPTION' ? 'bg-rose-50 text-rose-600' :
                    selectedNotifDetail.category === 'INBOUND' ? 'bg-blue-50 text-blue-600' :
                    'bg-teal-50 text-teal-600'
                  }`}>
                    {selectedNotifDetail.category === 'EXCEPTION' && <AlertTriangle className="w-5 h-5" />}
                    {selectedNotifDetail.category === 'INBOUND' && <Truck className="w-5 h-5" />}
                    {selectedNotifDetail.category === 'HANDOVER' && <CheckCircle2 className="w-5 h-5" />}
                    {selectedNotifDetail.category === 'SYSTEM' && <Settings className="w-5 h-5" />}
                  </div>
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                      {selectedNotifDetail.category} NOTICE
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{selectedNotifDetail.time}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNotifDetail(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-slate-900">{selectedNotifDetail.title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{selectedNotifDetail.subtitle}</p>
              </div>

              {/* Context Breakdown */}
              {selectedNotifDetail.details && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  {selectedNotifDetail.details.manifestNumber && (
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold">Manifest ID:</span>
                      <strong className="font-mono text-slate-900">{selectedNotifDetail.details.manifestNumber}</strong>
                    </div>
                  )}
                  {selectedNotifDetail.details.truckPlate && (
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold">Truck &amp; Driver:</span>
                      <strong className="font-mono text-slate-900">{selectedNotifDetail.details.truckPlate} ({selectedNotifDetail.details.driverName})</strong>
                    </div>
                  )}
                  {selectedNotifDetail.details.parcelsCount && (
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold">Total Parcels:</span>
                      <strong className="text-teal-700 font-bold">{selectedNotifDetail.details.parcelsCount} Packages for Intake</strong>
                    </div>
                  )}
                  {selectedNotifDetail.details.affectedOrders && (
                    <div className="space-y-1">
                      <span className="text-slate-400 font-bold block">Overdue Order References:</span>
                      <div className="flex gap-1.5 flex-wrap">
                        {selectedNotifDetail.details.affectedOrders.map((ord: string) => (
                          <span key={ord} className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-mono font-bold text-[10px]">
                            #{ord}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Modal Actions */}
              <div className="space-y-2 pt-1">
                {selectedNotifDetail.details?.action === 'exceptions' && (
                  <button
                    onClick={() => {
                      setSelectedNotifDetail(null);
                      setIsNotifDrawerOpen(false);
                      setActiveTab('exceptions');
                    }}
                    className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition shadow-md shadow-rose-900/20 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <AlertTriangle className="w-4 h-4" /> Open Exceptions &amp; Expired Radar
                  </button>
                )}

                {selectedNotifDetail.details?.action === 'incoming' && (
                  <button
                    onClick={() => {
                      setSelectedNotifDetail(null);
                      setIsNotifDrawerOpen(false);
                      setActiveTab('incoming');
                    }}
                    className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs transition shadow-md shadow-teal-900/20 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Box className="w-4 h-4" /> View Incoming Packages Queue
                  </button>
                )}

                {selectedNotifDetail.details?.driverPhone && (
                  <a
                    href={`tel:${selectedNotifDetail.details.driverPhone}`}
                    className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 border border-slate-200"
                  >
                    <Phone className="w-4 h-4 text-teal-600" /> Call Inbound Driver ({selectedNotifDetail.details.driverPhone})
                  </a>
                )}

                <button
                  onClick={() => setSelectedNotifDetail(null)}
                  className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

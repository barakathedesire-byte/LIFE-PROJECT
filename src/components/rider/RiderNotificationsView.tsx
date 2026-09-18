import React, { useState } from 'react';
import { Bell, Package, Wallet, ShieldAlert, CheckCircle2, ChevronRight, Check } from 'lucide-react';
import { RiderNotificationDetailModal, RiderNotificationItem } from './RiderNotificationDetailModal';

interface RiderNotificationsViewProps {
  onSelectOrder?: (orderNumber: string) => void;
  onOpenWallet?: () => void;
  onUnreadCountChange?: (count: number) => void;
  isLight?: boolean;
}

export const RiderNotificationsView: React.FC<RiderNotificationsViewProps> = ({
  onSelectOrder,
  onOpenWallet,
  onUnreadCountChange,
  isLight = false,
}) => {
  const [filter, setFilter] = useState<'all' | 'orders' | 'finance' | 'safety'>('all');
  const [selectedNotice, setSelectedNotice] = useState<RiderNotificationItem | null>(null);
  const [notifications, setNotifications] = useState<RiderNotificationItem[]>([
    {
      id: 'n-1',
      title: 'New Express Order Available',
      subtitle: 'Mwananyamala to Mbezi Beach (2.4 km) • TZS 8,500 delivery fee',
      category: 'orders',
      time: '1 min ago',
      unread: true,
      orderNumber: 'ORD-784512',
      details: {
        merchantName: 'Lumo Fresh Supermarket (Mwananyamala)',
        pickupAddress: 'Block 4, Mwananyamala Market Rd',
        deliveryAddress: 'Plot 42, Mbezi Beach, Dar es Salaam',
        estimatedEarnings: 8500,
        codAmount: 85000,
        distanceKm: 2.4,
        customerName: 'Amina Juma',
        customerPhone: '+255 712 345 678'
      }
    },
    {
      id: 'n-2',
      title: 'Escrow Payout Credited',
      subtitle: 'TZS 8,500 credited to wallet for order #ORD-784509',
      category: 'finance',
      time: '18 min ago',
      unread: true,
      orderNumber: 'ORD-784509',
      details: {
        payoutAmount: 8500,
        actionRequired: 'Available for immediate instant withdrawal to M-Pesa / Tigo Pesa.'
      }
    },
    {
      id: 'n-3',
      title: 'Merchant Packed & Ready for Pickup',
      subtitle: 'Kariakoo Electronics Hub ready with order #ORD-784515',
      category: 'orders',
      time: '35 min ago',
      unread: false,
      orderNumber: 'ORD-784515',
      details: {
        merchantName: 'Kariakoo Electronics Hub',
        pickupAddress: 'Msimbazi St, Kariakoo CBD',
        deliveryAddress: 'Slipway Plaza, Masaki Peninsula',
        estimatedEarnings: 9500,
        codAmount: 0,
        distanceKm: 4.8,
        customerName: 'David Kimaro',
        customerPhone: '+255 784 556 677'
      }
    },
    {
      id: 'n-4',
      title: 'Zone Surge Active: +25% Bonus',
      subtitle: 'Kinondoni & Mikocheni experiencing elevated order demand',
      category: 'safety',
      time: '1 hour ago',
      unread: false,
      details: {
        safetyLevel: 'INFO',
        affectedZones: ['Kinondoni', 'Mikocheni', 'Sinza'],
        actionRequired: 'Stay active in high surge zones for automatic 25% earnings boost.'
      }
    },
    {
      id: 'n-5',
      title: 'Road Safety & Traffic Advisory',
      subtitle: 'Heavy traffic reported along Ali Hassan Mwinyi Rd near Selander Bridge',
      category: 'safety',
      time: '2 hours ago',
      unread: false,
      details: {
        safetyLevel: 'HIGH',
        affectedZones: ['Selander Bridge', 'Morocco Junction'],
        actionRequired: 'Recommended alternative route: Kawawa Rd corridor.'
      }
    }
  ]);

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, unread: false }));
    setNotifications(updated);
    if (onUnreadCountChange) {
      onUnreadCountChange(0);
    }
  };

  const handleNotificationClick = (n: RiderNotificationItem) => {
    if (n.unread) {
      const updated = notifications.map(item => item.id === n.id ? { ...item, unread: false } : item);
      setNotifications(updated);
      const remaining = updated.filter(item => item.unread).length;
      if (onUnreadCountChange) {
        onUnreadCountChange(remaining);
      }
    }
    // Show full details in modal
    setSelectedNotice(n);
  };

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'orders') return n.category === 'orders';
    if (filter === 'finance') return n.category === 'finance';
    if (filter === 'safety') return n.category === 'safety';
    return true;
  });

  return (
    <div className="w-full px-4 py-3 space-y-4 pb-28">
      
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Alerts &amp; Operational Notices
          </h3>
          <p className="text-[10px] text-slate-400">Tap notice to view breakdown and trigger dispatch actions</p>
        </div>
        <button
          onClick={markAllRead}
          className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline cursor-pointer"
        >
          <Check className="w-3.5 h-3.5" /> Mark all read
        </button>
      </div>

      {/* Filter Tabs */}
      <div className={`p-1 rounded-xl border flex gap-1 ${
        isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        {[
          { id: 'all', label: 'All' },
          { id: 'orders', label: 'Orders' },
          { id: 'finance', label: 'Finance' },
          { id: 'safety', label: 'Safety' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id as any)}
            className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              filter === t.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {filteredNotifs.map(n => (
          <div
            key={n.id}
            onClick={() => handleNotificationClick(n)}
            className={`p-3.5 rounded-2xl border shadow-xs flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] ${
              n.unread
                ? isLight
                  ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-400/30'
                  : 'bg-emerald-950/20 border-emerald-800 ring-1 ring-emerald-500/20'
                : isLight
                ? 'bg-white border-slate-200'
                : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                n.category === 'orders'
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  : n.category === 'finance'
                  ? 'bg-sky-500/10 text-sky-500 border-sky-500/20'
                  : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
              }`}>
                {n.category === 'orders' && <Package className="w-5 h-5" />}
                {n.category === 'finance' && <Wallet className="w-5 h-5" />}
                {n.category === 'safety' && <ShieldAlert className="w-5 h-5" />}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{n.title}</p>
                  {n.unread && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />}
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{n.subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 ml-2">
              <span className="text-[10px] text-slate-400">{n.time}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal with actions */}
      <RiderNotificationDetailModal
        notification={selectedNotice}
        isOpen={!!selectedNotice}
        onClose={() => setSelectedNotice(null)}
        onAcceptOrder={(ordNum) => {
          setSelectedNotice(null);
          onSelectOrder?.(ordNum);
        }}
        onViewWallet={() => {
          setSelectedNotice(null);
          onOpenWallet?.();
        }}
        onMarkRead={(id) => {
          const updated = notifications.map(item => item.id === id ? { ...item, unread: false } : item);
          setNotifications(updated);
          if (onUnreadCountChange) {
            onUnreadCountChange(updated.filter(i => i.unread).length);
          }
        }}
        isLight={isLight}
      />

    </div>
  );
};

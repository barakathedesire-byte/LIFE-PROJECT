import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { DeliveryTask } from '../../types';
import { api } from '../../services/api';

// Rider Specific Components
import { RiderTopHeader } from '../../components/rider/RiderTopHeader';
import { RiderGreetingCard } from '../../components/rider/RiderGreetingCard';
import { RiderWalletCard } from '../../components/rider/RiderWalletCard';
import { RiderCurrentOrderCard } from '../../components/rider/RiderCurrentOrderCard';
import { RiderTodaySummary } from '../../components/rider/RiderTodaySummary';
import { RiderQuickActions } from '../../components/rider/RiderQuickActions';
import { RiderRecentNotifications } from '../../components/rider/RiderRecentNotifications';
import { RiderBottomNav } from '../../components/rider/RiderBottomNav';
import { RiderActiveDeliveryView } from '../../components/rider/RiderActiveDeliveryView';
import { RiderOrdersView } from '../../components/rider/RiderOrdersView';
import { RiderEarningsWalletView } from '../../components/rider/RiderEarningsWalletView';
import { RiderPerformanceView } from '../../components/rider/RiderPerformanceView';
import { RiderProfileKycView } from '../../components/rider/RiderProfileKycView';
import { RiderSupportSafetyView } from '../../components/rider/RiderSupportSafetyView';
import { RiderNotificationsView } from '../../components/rider/RiderNotificationsView';
import { RiderNotificationDetailModal, RiderNotificationItem } from '../../components/rider/RiderNotificationDetailModal';
import { RiderMenuDrawer } from '../../components/rider/RiderMenuDrawer';
import { RiderWithdrawModal } from '../../components/rider/RiderWithdrawModal';
import { RiderIncidentModal } from '../../components/rider/RiderIncidentModal';

export const DeliveryAgentPortalPage: React.FC = () => {
  const { user } = useAuth();

  // Navigation State
  // 'home' | 'orders' | 'wallet' | 'performance' | 'profile' | 'support' | 'notifications' | 'active_delivery'
  const [activeTab, setActiveTab] = useState<string>('home');
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(2);
  const [homeNotificationDetail, setHomeNotificationDetail] = useState<RiderNotificationItem | null>(null);

  // Status & Theme State
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');

  // Profile & Wallet State
  const [profile, setProfile] = useState<any>({
    name: 'Alex Mwita',
    fleetId: 'RD-8942',
    tier: 'Diamond Star Rider',
    rating: 4.8,
    todayEarnings: 78500,
    walletBalance: 345000,
    todayDeliveries: 12,
    hoursActive: '6.5 hrs',
    isOnline: true,
  });

  // Delivery Tasks State
  const [tasks, setTasks] = useState<DeliveryTask[]>([]);
  const [activeTask, setActiveTask] = useState<DeliveryTask | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals & Drawers State
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState<boolean>(false);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState<boolean>(false);

  // Load Rider Profile and Tasks
  const loadData = async () => {
    try {
      setLoading(true);
      const profileRes = await api.getRiderProfile();
      if (profileRes.success && profileRes.profile) {
        setProfile(profileRes.profile);
        setIsOnline(profileRes.profile.isOnline ?? true);
      }

      const tasksRes = await api.getDeliveryTasks();
      if (tasksRes.tasks && tasksRes.tasks.length > 0) {
        setTasks(tasksRes.tasks);
        // Find active task or default
        const active = tasksRes.tasks.find(t => t.status === 'ASSIGNED' || t.status === 'IN_TRANSIT');
        if (active) {
          setActiveTask(active);
        } else {
          setActiveTask(tasksRes.tasks[0]);
        }
      } else {
        // Fallback robust default task
        const defaultTask: DeliveryTask = {
          id: 'task-live-01',
          deliveryRunId: 'run-today',
          orderId: 'ORD-784512',
          orderNumber: 'ORD-784512',
          customerName: 'Amina Juma',
          customerPhone: '+255 712 345 678',
          address: 'Julius Nyerere Rd, Kijitonyama, Dar es Salaam',
          paymentMethod: 'mobile_money',
          codAmount: 85000,
          isCodCollected: true,
          status: 'ASSIGNED',
          otpCode: '----'
        };
        setTasks([defaultTask]);
        setActiveTask(defaultTask);
      }
    } catch (e) {
      console.warn('Error loading rider data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Online Toggle
  const handleToggleOnline = async () => {
    const nextStatus = !isOnline;
    setIsOnline(nextStatus);
    setProfile((prev: any) => ({ ...prev, isOnline: nextStatus }));
    try {
      await api.toggleRiderAvailability(nextStatus);
    } catch {
      // Graceful fallback
    }
  };

  // Theme Toggle
  const handleToggleTheme = () => {
    const nextTheme = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(nextTheme);
  };

  const isLight = themeMode === 'light';

  // Handle Delivery completion
  const handleDeliveryComplete = (completedTask: DeliveryTask) => {
    setProfile((prev: any) => ({
      ...prev,
      walletBalance: (prev.walletBalance || 345000) + 8500,
      todayEarnings: (prev.todayEarnings || 78500) + 8500,
      todayDeliveries: (prev.todayDeliveries || 12) + 1,
    }));
    setActiveTab('home');
    loadData();
  };

  return (
    <div
      className={`min-h-screen flex justify-center selection:bg-emerald-500 selection:text-white transition-colors duration-200 ${
        isLight ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-white'
      }`}
    >
      {/* Mobile Shell Container (Max 430px wide like native iOS/Android device) */}
      <div
        className={`w-full max-w-md min-h-screen flex flex-col relative shadow-2xl overflow-x-hidden ${
          isLight ? 'bg-white' : 'bg-slate-900'
        }`}
      >
        {/* Status Bar & Top Brand Header */}
        <RiderTopHeader
          isOnline={isOnline}
          onOpenMenu={() => setIsMenuOpen(true)}
          onOpenNotifications={() => setActiveTab('notifications')}
          unreadCount={unreadNotificationsCount}
          isLight={isLight}
        />

        {/* Dynamic Screen View Router */}
        {activeTab === 'home' && (
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 pb-28">
            {/* 1. Greeting & Live Status Toggle */}
            <RiderGreetingCard
              riderName={profile.name || 'Alex Mwita'}
              fleetId={profile.fleetId || 'RD-8942'}
              isOnline={isOnline}
              onToggleOnline={handleToggleOnline}
              onToggleStatus={handleToggleOnline}
              todayEarnings={profile.todayEarnings || 78500}
              completedDeliveries={profile.todayDeliveries || 12}
              acceptanceRate={95}
              rating={profile.rating || 4.8}
              isLight={isLight}
            />

            {/* 2. Wallet & Quick Withdrawal Card */}
            <RiderWalletCard
              balance={profile.walletBalance || 345000}
              todayEarnings={profile.todayEarnings || 78500}
              onOpenWallet={() => setActiveTab('wallet')}
              onOpenWithdraw={() => setIsWithdrawModalOpen(true)}
              onWithdraw={() => setIsWithdrawModalOpen(true)}
              isLight={isLight}
            />

            {/* 3. Active Delivery Card */}
            {activeTask && (
              <RiderCurrentOrderCard
                task={activeTask}
                onViewDetails={(task) => {
                  if (task) setActiveTask(task);
                  setActiveTab('active_delivery');
                }}
                onStartDelivery={(task) => {
                  if (task) setActiveTask(task);
                  setActiveTab('active_delivery');
                }}
                onCallCustomer={(phone, name) => {
                  if (phone) {
                    window.location.href = `tel:${phone.replace(/\s+/g, '')}`;
                  }
                }}
                onNavigate={(task) => {
                  if (task) setActiveTask(task);
                  setActiveTab('active_delivery');
                }}
                onReportProblem={() => setIsIncidentModalOpen(true)}
                isLight={isLight}
              />
            )}

            {/* 4. Today's Performance Summary */}
            <RiderTodaySummary
              todayEarnings={profile.todayEarnings || 78500}
              completedCount={profile.todayDeliveries || 12}
              hoursOnline={6.5}
              hoursActive="6.5 hrs"
              distanceKm={45.6}
              rating={profile.rating || 4.8}
              isLight={isLight}
            />

            {/* 5. 5-Button Quick Actions Grid */}
            <RiderQuickActions
              onNavigateTab={(tab) => {
                if (tab === 'orders') setActiveTab('orders');
                else if (tab === 'earnings') setActiveTab('wallet');
                else if (tab === 'performance') setActiveTab('performance');
                else if (tab === 'support') setActiveTab('support');
                else if (tab === 'more') setIsMenuOpen(true);
                else setActiveTab(tab);
              }}
              onActionClick={(actionId) => {
                if (actionId === 'orders') setActiveTab('orders');
                else if (actionId === 'earnings') setActiveTab('wallet');
                else if (actionId === 'performance') setActiveTab('performance');
                else if (actionId === 'support') setActiveTab('support');
                else if (actionId === 'more') setIsMenuOpen(true);
                else setActiveTab(actionId);
              }}
              isLight={isLight}
            />

            {/* 6. Recent Notifications Card */}
            <RiderRecentNotifications
              onViewAll={() => setActiveTab('notifications')}
              onSelectNotification={(item) => {
                setHomeNotificationDetail({
                  id: item.id || 'notif-1',
                  title: item.title || 'New Express Order Available',
                  subtitle: item.subtitle || 'Mwananyamala to Mbezi Beach (2.4 km)',
                  category: 'orders',
                  time: item.time || '1 min ago',
                  unread: false,
                  orderNumber: item.orderNumber || 'ORD-784512',
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
                });
              }}
              onSelectOrder={() => setActiveTab('orders')}
              isLight={isLight}
            />
          </div>
        )}

        {/* Active Live Delivery View */}
        {activeTab === 'active_delivery' && activeTask && (
          <RiderActiveDeliveryView
            task={activeTask}
            onBack={() => setActiveTab('home')}
            onDeliveryCompleted={handleDeliveryComplete}
            isLight={isLight}
          />
        )}

        {/* Orders & Broadcasts View */}
        {activeTab === 'orders' && (
          <RiderOrdersView
            tasks={tasks}
            onSelectTask={(task) => {
              setActiveTask(task);
              setActiveTab('active_delivery');
            }}
            onRefresh={loadData}
            isLight={isLight}
          />
        )}

        {/* Earnings & Wallet View */}
        {(activeTab === 'wallet' || activeTab === 'earnings') && (
          <RiderEarningsWalletView
            walletBalance={profile.walletBalance || 345000}
            todayEarnings={profile.todayEarnings || 78500}
            onBalanceUpdated={(newBal) => {
              setProfile((prev: any) => ({ ...prev, walletBalance: newBal }));
            }}
            isLight={isLight}
          />
        )}

        {/* Lumo Pulse Performance View */}
        {activeTab === 'performance' && (
          <RiderPerformanceView
            rating={profile.rating || 4.8}
            acceptanceRate={95}
            onTimeRate={98.2}
            completedCount={profile.todayDeliveries || 12}
            isLight={isLight}
          />
        )}

        {/* KYC & Vehicle Profile View */}
        {activeTab === 'profile' && (
          <RiderProfileKycView isLight={isLight} />
        )}

        {/* Support & Safety SOS View */}
        {activeTab === 'support' && (
          <RiderSupportSafetyView
            onOpenReportIncident={() => setIsIncidentModalOpen(true)}
            isLight={isLight}
          />
        )}

        {/* Notifications & Broadcasts View */}
        {activeTab === 'notifications' && (
          <RiderNotificationsView
            onSelectOrder={(ordNum) => {
              setActiveTab('orders');
            }}
            onOpenWallet={() => setActiveTab('wallet')}
            onUnreadCountChange={setUnreadNotificationsCount}
            isLight={isLight}
          />
        )}

        {/* Home Screen Notification Detail Modal */}
        <RiderNotificationDetailModal
          notification={homeNotificationDetail}
          isOpen={!!homeNotificationDetail}
          onClose={() => setHomeNotificationDetail(null)}
          onAcceptOrder={(ordNum) => {
            setHomeNotificationDetail(null);
            setActiveTab('orders');
          }}
          onViewWallet={() => {
            setHomeNotificationDetail(null);
            setActiveTab('wallet');
          }}
          isLight={isLight}
        />

        {/* Fixed Native-Styled Bottom Navigation Bar */}
        {activeTab !== 'active_delivery' && (
          <RiderBottomNav
            activeTab={activeTab === 'wallet' ? 'earnings' : activeTab}
            onSelectTab={(tab) => {
              if (tab === 'earnings') setActiveTab('wallet');
              else setActiveTab(tab);
            }}
            onTabChange={(tab) => {
              if (tab === 'earnings') setActiveTab('wallet');
              else setActiveTab(tab);
            }}
            isOnline={isOnline}
            onToggleOnline={handleToggleOnline}
            isLight={isLight}
          />
        )}

        {/* Side Menu Drawer */}
        <RiderMenuDrawer
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onNavigateTab={(tab) => setActiveTab(tab)}
          isLight={isLight}
          onToggleTheme={handleToggleTheme}
        />

        {/* Instant Withdraw Modal */}
        <RiderWithdrawModal
          isOpen={isWithdrawModalOpen}
          onClose={() => setIsWithdrawModalOpen(false)}
          availableBalance={profile.walletBalance || 345000}
          onWithdrawSuccess={(newBal) => {
            setProfile((prev: any) => ({ ...prev, walletBalance: newBal }));
          }}
          isLight={isLight}
        />

        {/* Report Incident Modal */}
        <RiderIncidentModal
          isOpen={isIncidentModalOpen}
          onClose={() => setIsIncidentModalOpen(false)}
          orderNumber={activeTask?.orderNumber || 'ORD-784512'}
          taskId={activeTask?.id}
          isLight={isLight}
        />
      </div>
    </div>
  );
};

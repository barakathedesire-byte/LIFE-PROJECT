import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserAccountNavDropdown } from '../../components/common/UserAccountNavDropdown';
import { api } from '../../services/api';
import { formatTZS } from '../../utils/formatters';
import { LumoLoader } from '../../components/common/LumoLoader';
import { 
  Briefcase, 
  Target, 
  TrendingUp, 
  Users, 
  Store, 
  DollarSign, 
  UserPlus, 
  PhoneCall, 
  Calendar, 
  CheckCircle2, 
  Copy, 
  Clock,
  Send,
  Plus,
  ShoppingBag,
  Truck,
  MapPin,
  CheckCircle,
  AlertCircle,
  FileText,
  ShieldCheck,
  CreditCard,
  MessageSquare,
  Bell,
  Settings,
  HelpCircle,
  User,
  LogOut,
  Menu,
  X,
  Search,
  Filter,
  ArrowUpRight,
  Phone,
  Mail,
  Check,
  Navigation,
  CheckSquare,
  Square,
  AlertTriangle,
  Award,
  Trash2
} from 'lucide-react';
import { SalespersonLead, SalespersonTarget, SalesActivity, Order, Product } from '../../types';
import { MobileWorkspaceSidebar } from '../../components/common/MobileWorkspaceSidebar';
import { GrowthEventsCarousel } from '../../components/common/GrowthEventsCarousel';
import { VerificationBanner } from '../../components/common/VerificationBanner';

export const SalespersonPortalPage: React.FC = () => {
  const { user, currentAccount } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedReferral, setCopiedReferral] = useState(false);

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [leadsList, setLeadsList] = useState<SalespersonLead[]>([]);
  const [activitiesList, setActivitiesList] = useState<SalesActivity[]>([]);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);

  // Expanded Lists for Field Sales CRM
  const [prospectsList, setProspectsList] = useState([
    { id: 'pr-1', businessName: 'Kariakoo Mobile Hub', contactName: 'Juma Ally', phone: '+255 754 112 233', category: 'Phones & Accessories', location: 'Kariakoo Market St', estPotential: '15000000', status: 'Prospect' },
    { id: 'pr-2', businessName: 'Mlimani Electronics & TV', contactName: 'Amina Selemani', phone: '+255 713 889 102', category: 'Home Appliances', location: 'Mlimani City Mall', estPotential: '28000000', status: 'Contacted' },
    { id: 'pr-3', businessName: 'Zanzibar Spice & Tech', contactName: 'Salum Omar', phone: '+255 777 450 991', category: 'Consumer Electronics', location: 'Stone Town', estPotential: '12000000', status: 'Interested' }
  ]);

  const [vendorsList, setVendorsList] = useState([
    { id: 'v-1', name: 'Swahili Tech Hub', category: 'Mobile & Gadgets', location: 'Kariakoo', status: 'Active', orders: 18, sales: '8450000', onboardingStatus: 'Approved' },
    { id: 'v-2', name: 'Dar es Salaam Wholesale Direct', category: 'Electronics', location: 'Posta', status: 'Active', orders: 24, sales: '14200000', onboardingStatus: 'Approved' },
    { id: 'v-3', name: 'Arusha Home Appliances', category: 'Home Appliances', location: 'Arusha Central', status: 'Pending KYC', orders: 2, sales: '950000', onboardingStatus: 'Application Submitted' }
  ]);

  const [customersList, setCustomersList] = useState([
    { id: 'cust-1', name: 'Baraka Juma', contact: '+255 755 332 111', location: 'Kinondoni, DSM', orders: 5, totalSales: '1850000', status: 'Active' },
    { id: 'cust-2', name: 'Neema Mwakyusa', contact: '+255 712 990 443', location: 'Upanga, DSM', orders: 3, totalSales: '720000', status: 'Active' }
  ]);

  const [visitsList, setVisitsList] = useState([
    { id: 'vis-1', targetName: 'Kariakoo Mobile Hub', time: '10:00 AM Today', location: 'Kariakoo Market St', purpose: 'Vendor Onboarding & Inventory Sync', status: 'Scheduled' },
    { id: 'vis-2', targetName: 'Mlimani Electronics & TV', time: '02:30 PM Today', location: 'Mlimani City Mall', purpose: 'Contract & Commission Agreement', status: 'Scheduled' },
    { id: 'vis-3', targetName: 'Zanzibar Spice & Tech', time: 'Yesterday', location: 'Stone Town', purpose: 'Initial Discovery & Pitch', status: 'Completed' }
  ]);

  const [tasksList, setTasksList] = useState([
    { id: 'tsk-1', task: 'Follow up on KYC document upload for Arusha Home Appliances', related: 'Arusha Home Appliances', dueDate: 'Today, 4:00 PM', priority: 'High', status: 'Pending' },
    { id: 'tsk-2', task: 'Deliver promotional banner kit to Swahili Tech Hub', related: 'Swahili Tech Hub', dueDate: 'Tomorrow', priority: 'Medium', status: 'In Progress' }
  ]);

  const [followupsList, setFollowupsList] = useState([
    { id: 'fu-1', target: 'Juma Ally (Kariakoo Mobile Hub)', date: '2026-08-27', reason: 'Review commission contract', priority: 'High', status: 'Due' },
    { id: 'fu-2', target: 'Amina Selemani (Mlimani Electronics)', date: '2026-08-28', reason: 'Discuss bulk order discount', priority: 'Medium', status: 'Upcoming' }
  ]);

  const [commissionsList, setCommissionsList] = useState([
    { id: 'com-1', orderNumber: 'LM-9820', customer: 'Baraka Juma', vendor: 'Swahili Tech Hub', saleValue: 450000, rate: '4%', amount: 18000, status: 'Approved', date: '2026-08-25' },
    { id: 'com-2', orderNumber: 'LM-9814', customer: 'Neema Mwakyusa', vendor: 'Dar es Salaam Wholesale', saleValue: 1250000, rate: '4%', amount: 50000, status: 'Paid', date: '2026-08-22' }
  ]);

  const [payoutsList, setPayoutsList] = useState([
    { id: 'pay-1', amount: 850000, method: 'M-Pesa (Vodacom)', recipient: '+255 754 *** 111', status: 'SUCCESS', date: '2026-08-15' }
  ]);

  const [paymentMethodsList, setPaymentMethodsList] = useState([
    { id: 'pm-1', type: 'MOBILE_MONEY', provider: 'M-Pesa (Vodacom)', details: '+255 754 *** 111', isDefault: true, verified: true },
    { id: 'pm-2', type: 'BANK_TRANSFER', provider: 'CRDB Bank', details: 'CRDB-0150928100', isDefault: false, verified: true }
  ]);

  const [messagesList, setMessagesList] = useState([
    { id: 'msg-1', sender: 'Operations Team', message: 'Kariakoo delivery batch #4 has been successfully dispatched.', time: '1 hour ago', unread: true },
    { id: 'msg-2', sender: 'Vendor Support', message: 'Arusha Home Appliances KYC submitted successfully.', time: 'Yesterday', unread: false }
  ]);

  const [notificationsList, setNotificationsList] = useState([
    { id: 'notif-1', title: 'New lead assigned in Kariakoo', time: '10 mins ago', type: 'lead', read: false },
    { id: 'notif-2', title: 'Commission of TZS 18,000 approved', time: '2 hours ago', type: 'commission', read: false },
    { id: 'notif-3', title: 'Visit scheduled in 30 minutes', time: '30 mins ago', type: 'visit', read: true }
  ]);

  const [supportTicketsList, setSupportTicketsList] = useState([
    { id: 'tkt-s1', category: 'Commission Payout', subject: 'Delay in M-Pesa escrow payout', status: 'In Progress', date: '2026-08-24' }
  ]);

  // Modals
  const [showAddLead, setShowAddLead] = useState(false);
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadBusiness, setNewLeadBusiness] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadValue, setNewLeadValue] = useState('5000000');

  const [showLogActivity, setShowLogActivity] = useState(false);
  const [activityLeadId, setActivityLeadId] = useState('');
  const [activityType, setActivityType] = useState<'CALL' | 'VISIT' | 'MEETING' | 'ONBOARDING' | 'FOLLOW_UP'>('VISIT');
  const [activityNotes, setActivityNotes] = useState('');

  const [showScheduleVisit, setShowScheduleVisit] = useState(false);
  const [visitTarget, setVisitTarget] = useState('');
  const [visitPurpose, setVisitPurpose] = useState('');
  const [visitTime, setVisitTime] = useState('');

  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [activeVisit, setActiveVisit] = useState<any>(null);

  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [visitOutcome, setVisitOutcome] = useState('Successful');
  const [checkoutNotes, setCheckoutNotes] = useState('');

  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [onboardForm, setOnboardForm] = useState({
    businessName: '',
    ownerName: '',
    phone: '',
    email: '',
    category: 'Phones & Tablets',
    address: 'Kariakoo Market St',
    tinNumber: '',
    idNumber: ''
  });

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedProductForOrder, setSelectedProductForOrder] = useState<Product | null>(null);
  const [orderQuantity, setOrderQuantity] = useState('1');

  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('450000');
  const [payoutSuccessMsg, setPayoutSuccessMsg] = useState('');

  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [newPmProvider, setNewPmProvider] = useState('Tigo Pesa');
  const [newPmDetails, setNewPmDetails] = useState('');

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskRelated, setNewTaskRelated] = useState('');

  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportSub, setSupportSub] = useState('');
  const [supportDesc, setSupportDesc] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashRes, leadsRes, actRes, ordRes, prodRes] = await Promise.all([
        api.getSalesDashboard(user?.salespersonId),
        api.getSalesLeads(user?.salespersonId),
        api.getSalesActivities(user?.salespersonId),
        api.getOrders(),
        api.getProducts()
      ]);

      setDashboardData(dashRes);
      setLeadsList(leadsRes.leads || []);
      setActivitiesList(actRes.activities || []);
      setOrdersList(ordRes.orders || []);
      setProductsList(prodRes.products || []);
    } catch (err) {
      console.error('Failed to load field sales data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createSalesLead({
        contactName: newLeadName,
        phone: newLeadPhone,
        businessName: newLeadBusiness,
        expectedMonthlyVolume: Number(newLeadValue),
        leadType: 'SELLER'
      });
      setShowAddLead(false);
      setNewLeadName('');
      setNewLeadBusiness('');
      setNewLeadPhone('');
      await loadData();
    } catch (err) {
      console.error('Error creating lead:', err);
    }
  };

  const handleLogActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.logSalesActivity({
        leadId: activityLeadId || leadsList[0]?.id,
        type: (activityType === 'FOLLOW_UP' ? 'FOLLOWUP' : activityType) as any,
        title: `${activityType} recorded`,
        details: activityNotes
      });
      setShowLogActivity(false);
      setActivityNotes('');
      await loadData();
    } catch (err) {
      console.error('Error logging activity:', err);
    }
  };

  const handleCopyReferral = () => {
    const code = dashboardData?.referralCode || 'LUMO-AGENT-BARAKA26';
    const link = `https://lumo.africa/sell?ref=${code}`;
    navigator.clipboard.writeText(link);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2500);
  };

  const target = dashboardData?.target || {
    targetGMV: 45000000,
    achievedGMV: 31800000,
    targetSellersOnboarded: 15,
    achievedSellersOnboarded: 11,
    commissionEarned: 1272000,
    commissionPaid: 850000,
    month: 'August 2026'
  };

  const progressPercent = Math.min(100, Math.round((target.achievedGMV / target.targetGMV) * 100));

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <LumoLoader size="large" text="Loading Lumo Field Sales CRM..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-[#0f172a] flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600 font-bold border border-blue-600/20">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm sm:text-base">Lumo Field Sales CRM</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                    FIELD AGENT
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Agent: <strong className="text-slate-700">{user?.name || 'Baraka Mushi'}</strong> • Territory: Dar es Salaam
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLogActivity(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-xs border border-slate-200 transition"
            >
              <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
              Log Activity
            </button>

            <button
              onClick={() => setShowAddLead(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Lead
            </button>

            <UserAccountNavDropdown variant="light" />
          </div>
        </div>
      </header>

      {/* MOBILE WORKSPACE SIDEBAR DRAWER */}
      <MobileWorkspaceSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        title="Field Sales Portal"
        subtitle="Sales Operations & CRM"
        userRoleLabel="FIELD SALES EXECUTIVE"
        userName={user?.name || 'Baraka Mushi'}
        activeTab={activeTab}
        onSelectTab={(tabId) => setActiveTab(tabId)}
        items={[
          { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
          { id: 'leads', label: `Leads (${leadsList.length})`, icon: Target, badge: leadsList.length },
          { id: 'prospects', label: 'Prospects', icon: Users },
          { id: 'vendors', label: 'Vendors', icon: Store },
          { id: 'customers', label: 'Customers', icon: User },
          { id: 'orders', label: 'Orders', icon: ShoppingBag },
          { id: 'visits', label: 'Field Visits', icon: Navigation },
          { id: 'commission', label: 'Commissions & Earnings', icon: DollarSign },
          { id: 'performance', label: 'Targets & Stats', icon: Award },
          { id: 'kyc_approvals', label: 'Vendor Onboarding KYC', icon: ShieldCheck },
          { id: 'settings', label: 'Profile Settings', icon: Settings }
        ]}
      />

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        
        {/* DESKTOP SIDEBAR NAVIGATION */}
        <aside className="hidden lg:block lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-6">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 block">Main</span>
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'leads', label: `Leads (${leadsList.length})`, icon: Target },
              { id: 'prospects', label: 'Prospects', icon: Users },
              { id: 'vendors', label: 'Vendors', icon: Store },
              { id: 'customers', label: 'Customers', icon: User },
              { id: 'orders', label: 'Orders', icon: ShoppingBag }
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-1 pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 block">Field Activity</span>
            {[
              { id: 'visits', label: 'Visits', icon: Calendar },
              { id: 'route', label: 'Route / Map', icon: Navigation },
              { id: 'tasks', label: 'Tasks', icon: CheckSquare },
              { id: 'followups', label: 'Follow-ups', icon: Clock }
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-1 pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 block">Sales</span>
            {[
              { id: 'sales', label: 'Sales', icon: DollarSign },
              { id: 'targets', label: 'Targets', icon: Target },
              { id: 'performance', label: 'Performance', icon: Award }
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-1 pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 block">Commissions</span>
            {[
              { id: 'commissions', label: 'Commissions', icon: DollarSign },
              { id: 'payouts', label: 'Payouts', icon: CreditCard }
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-1 pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 block">Communication</span>
            {[
              { id: 'messages', label: 'Messages', icon: MessageSquare },
              { id: 'notifications', label: 'Notifications', icon: Bell }
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-1 pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 block">Account</span>
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'support', label: 'Help & Support', icon: HelpCircle },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-200 mt-4">
            <UserAccountNavDropdown variant="light" align="left" className="w-full" />
          </div>
        </aside>

        {/* CONTENT AREA (4 COLUMNS) */}
        <main className="lg:col-span-4 space-y-8">
          <VerificationBanner user={currentAccount} roleName="LumoForce Sales Agent" />

          {/* 1. DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in">
              {/* Greeting & Quick Action Bar */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                    Good morning, {user?.name || 'Baraka Mushi'}
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Today's Field Activity • <strong className="text-blue-600">3 Visits Scheduled</strong> • <strong className="text-emerald-600">{progressPercent}% Target Completed</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowScheduleVisit(true)}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5 text-blue-600" /> Schedule Visit
                  </button>
                  <button
                    onClick={() => setShowOnboardingModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <Store className="w-3.5 h-3.5" /> Onboard Vendor
                  </button>
                </div>
              </div>

              {/* KPI CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Active Leads', value: leadsList.length.toString(), trend: '5 need follow-up', icon: Target, color: 'text-blue-600' },
                  { label: 'Visits Today', value: '3', trend: 'Next at 10:00 AM', icon: Calendar, color: 'text-purple-600' },
                  { label: 'Vendors Onboarded', value: `${target.achievedSellersOnboarded} / ${target.targetSellersOnboarded}`, trend: '4 needed for bonus', icon: Store, color: 'text-emerald-600' },
                  { label: 'Commission Earned', value: formatTZS(target.commissionEarned), trend: '4.0% sales commission', icon: DollarSign, color: 'text-amber-600' }
                ].map((kpi, idx) => {
                  const Icon = kpi.icon;
                  return (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{kpi.label}</span>
                        <div className={`w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center ${kpi.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{kpi.trend}</p>
                    </div>
                  );
                })}
              </div>

              {/* PRIORITY ACTIONS & TODAY'S SCHEDULE */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Needs Your Attention */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Needs Your Attention
                    </h2>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">5 Items</span>
                  </div>

                  <div className="space-y-3">
                    {[
                      { title: '5 merchant leads need follow-up today', sub: 'Kariakoo & Posta region', action: 'Call Leads' },
                      { title: 'Arusha Home Appliances KYC incomplete', sub: 'Awaiting tax clearance upload', action: 'Complete KYC' },
                      { title: '3 scheduled visits starting at 10:00 AM', sub: 'Kariakoo Market St', action: 'Check In' }
                    ].map((item, i) => (
                      <div key={i} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3 text-xs">
                        <div>
                          <p className="font-bold text-slate-900">{item.title}</p>
                          <p className="text-slate-500 text-[11px] mt-0.5">{item.sub}</p>
                        </div>
                        <button
                          onClick={() => {
                            if (i === 0) setActiveTab('leads');
                            else if (i === 1) setShowOnboardingModal(true);
                            else setActiveTab('visits');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 cursor-pointer text-xs shrink-0"
                        >
                          {item.action}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Today's Schedule */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      Today's Schedule
                    </h2>
                    <button onClick={() => setActiveTab('visits')} className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer">
                      View All Visits →
                    </button>
                  </div>

                  <div className="space-y-3">
                    {visitsList.map((vis) => (
                      <div key={vis.id} className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{vis.targetName}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">{vis.status}</span>
                          </div>
                          <p className="text-slate-500 text-[11px] mt-0.5">{vis.time} • {vis.location}</p>
                        </div>
                        <button
                          onClick={() => {
                            setActiveVisit(vis);
                            setShowCheckInModal(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 cursor-pointer text-xs shrink-0"
                        >
                          Check In
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* SALES GROWTH & EVENTS SECTION */}
              <GrowthEventsCarousel
                title="Sales Growth & Events"
                subtitle="Field sales masterclasses, deal closing techniques, commission accelerators & product training"
                theme="blue"
                events={[
                  {
                    id: 'sge-sales-1',
                    title: 'Field Sales Masterclass: Closing Enterprise Wholesale Merchants',
                    category: 'Sales Training',
                    date: 'Sep 14, 2026',
                    time: '09:00 EAT',
                    description: 'Strategies for negotiating bulk listing terms with large Kariakoo and Mlimani City electronics distributors.',
                    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600',
                    ctaText: 'Attend Workshop',
                    badge: 'STRATEGY SESSION',
                    type: 'training'
                  },
                  {
                    id: 'sge-sales-2',
                    title: 'Q3 Tier-1 Commission Multiplier Challenge',
                    category: 'Sales Challenges',
                    date: 'Sep 20, 2026',
                    time: '18:00 EAT',
                    description: 'Onboard 8 verified merchants this month to unlock a 25% extra commission bonus and dedicated field vehicle allowance.',
                    imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600',
                    ctaText: 'Join Challenge',
                    badge: 'COMMISSION BONUS',
                    type: 'challenge'
                  },
                  {
                    id: 'sge-sales-3',
                    title: 'New Electronics & Agriculture Categories Onboarding Guidelines',
                    category: 'Product Training',
                    date: 'Sep 28, 2026',
                    time: '11:30 EAT',
                    description: 'Full briefing on pitching the newly launched Babies & Kids, Agriculture, and Medical Equipment categories to regional suppliers.',
                    imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600',
                    ctaText: 'View Materials',
                    badge: 'CATEGORY LAUNCH',
                    type: 'announcement'
                  }
                ]}
              />
            </div>
          )}

          {/* 2. LEADS TAB */}
          {activeTab === 'leads' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">Merchant Lead Pipeline</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Manage and track vendor prospects from initial contact to conversion</p>
                </div>
                <button
                  onClick={() => setShowAddLead(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add Lead
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {leadsList.map((lead) => (
                  <div key={lead.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{lead.businessName}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">
                            {lead.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Contact: <strong className="text-slate-700">{lead.contactName}</strong> ({lead.phone}) • {lead.region}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Est. Monthly Volume</span>
                        <span className="font-bold text-sm text-slate-900">{formatTZS(lead.expectedMonthlyVolume)}</span>
                      </div>
                      <button
                        onClick={() => {
                          setActivityLeadId(lead.id);
                          setShowLogActivity(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
                      >
                        Log Action
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm(`Are you sure you want to delete lead for "${lead.businessName}"?`)) {
                            try {
                              const res = await api.deleteSalesLead(lead.id);
                              if (res.success || !res.error) {
                                setLeadsList(prev => prev.filter(l => l.id !== lead.id));
                              } else {
                                alert(res.error || 'Failed to delete lead');
                              }
                            } catch (err: any) {
                              alert(err.message || 'Error deleting lead');
                            }
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        title="Delete Lead"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. PROSPECTS TAB */}
          {activeTab === 'prospects' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between pb-6 border-b border-slate-200">
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">Vendor Prospecting Database</h2>
                  <p className="text-xs text-slate-500">Unassigned or newly discovered vendor stores in territory</p>
                </div>
                <button 
                  onClick={() => setShowOnboardingModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 cursor-pointer"
                >
                  Start Onboarding
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {prospectsList.map((pr) => (
                  <div key={pr.id} className="py-4 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{pr.businessName}</p>
                      <p className="text-slate-500">{pr.contactName} • {pr.phone} • {pr.location}</p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <span className="font-bold text-slate-900 block">{formatTZS(Number(pr.estPotential))}</span>
                        <span className="text-[10px] text-blue-600 font-semibold">{pr.status}</span>
                      </div>
                      <button
                        onClick={() => setShowOnboardingModal(true)}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 cursor-pointer"
                      >
                        Onboard
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. VENDORS TAB */}
          {activeTab === 'vendors' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between pb-6 border-b border-slate-200">
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">Onboarded Vendors ({vendorsList.length})</h2>
                  <p className="text-xs text-slate-500">Vendors successfully registered and active in your territory</p>
                </div>
                <button
                  onClick={() => setShowOnboardingModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 cursor-pointer"
                >
                  + Onboard New Vendor
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vendorsList.map((v) => (
                  <div key={v.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">{v.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">{v.status}</span>
                    </div>
                    <p className="text-xs text-slate-600">Category: {v?.category} • Location: {v.location}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                      <span className="font-semibold text-slate-700">{v.orders} Orders Fulfilled</span>
                      <span className="font-bold text-emerald-700">{formatTZS(Number(v.sales))}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. CUSTOMERS TAB */}
          {activeTab === 'customers' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in">
              <h2 className="font-bold text-slate-900 text-lg">Customer Management & Assisted Orders</h2>
              <div className="divide-y divide-slate-100">
                {customersList.map((c) => (
                  <div key={c.id} className="py-4 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{c.name}</p>
                      <p className="text-slate-500">{c.contact} • {c.location}</p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <span className="font-bold text-slate-900 block">{formatTZS(Number(c.totalSales))}</span>
                        <span className="text-[10px] text-emerald-600 font-semibold">{c.orders} Orders</span>
                      </div>
                      <button
                        onClick={() => setShowOrderModal(true)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 cursor-pointer"
                      >
                        Assist Order
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between pb-6 border-b border-slate-200">
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">Generated Orders & Attribution</h2>
                  <p className="text-xs text-slate-500">Orders placed by vendors or customers attributed to your agent code</p>
                </div>
                <button
                  onClick={() => setShowOrderModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 cursor-pointer"
                >
                  + Create Assisted Order
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {ordersList.slice(0, 5).map((ord) => (
                  <div key={ord.id} className="py-4 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">Order #{ord.orderNumber}</span>
                        <span className="px-2 py-0.5 rounded bg-orange-100 text-[#ff6a00] font-bold text-[10px]">{ord.status}</span>
                      </div>
                      <p className="text-slate-500 mt-0.5">{ord.customer.name} • {ord.deliveryAddress?.area}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 block text-sm">{formatTZS(ord.pricing?.total || 0)}</span>
                      <span className="text-[10px] text-emerald-600 font-semibold">Attributed to Rep</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. VISITS TAB */}
          {activeTab === 'visits' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between pb-6 border-b border-slate-200">
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">Field Visits & Schedule</h2>
                  <p className="text-xs text-slate-500">Today's appointments and shop visits</p>
                </div>
                <button
                  onClick={() => setShowScheduleVisit(true)}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 cursor-pointer"
                >
                  + Schedule Visit
                </button>
              </div>

              <div className="space-y-3">
                {visitsList.map((vis) => (
                  <div key={vis.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{vis.targetName}</span>
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">{vis.status}</span>
                      </div>
                      <p className="text-slate-600 mt-1">{vis.purpose}</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">{vis.time} • {vis.location}</p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveVisit(vis);
                        setShowCheckInModal(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer shrink-0"
                    >
                      Check In
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. ROUTE / MAP TAB */}
          {activeTab === 'route' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in">
              <h2 className="font-bold text-slate-900 text-lg">Field Route & Territory Map</h2>
              <p className="text-xs text-slate-500">Optimized route for today's visits across Kariakoo and Posta.</p>
              
              <div className="p-6 rounded-2xl bg-blue-50 border border-blue-200 text-center space-y-3">
                <Navigation className="w-10 h-10 text-blue-600 mx-auto animate-bounce" />
                <h3 className="font-bold text-slate-900 text-base">Territory Navigation Active</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  3 stops planned today. Total distance estimated at 4.2 km across Kariakoo Commercial Center.
                </p>
                <button
                  onClick={() => alert('Launching GPS turn-by-turn navigation simulation.')}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 cursor-pointer shadow-sm inline-flex items-center gap-2"
                >
                  <Navigation className="w-4 h-4" /> Start GPS Navigation
                </button>
              </div>
            </div>
          )}

          {/* 9. TASKS TAB */}
          {activeTab === 'tasks' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between pb-6 border-b border-slate-200">
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">Salesperson Task Manager</h2>
                  <p className="text-xs text-slate-500">Assigned duties and follow-up reminders</p>
                </div>
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 cursor-pointer"
                >
                  + Add Task
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {tasksList.map((tsk) => (
                  <div key={tsk.id} className="py-4 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-start gap-3">
                      <input 
                        type="checkbox" 
                        onChange={() => alert(`Marked task "${tsk.task}" as completed.`)}
                        className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 cursor-pointer" 
                      />
                      <div>
                        <p className="font-bold text-slate-900">{tsk.task}</p>
                        <p className="text-slate-500 mt-0.5">Related: {tsk.related} • Due: {tsk.dueDate}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                      {tsk.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 10. FOLLOW-UPS TAB */}
          {activeTab === 'followups' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in">
              <h2 className="font-bold text-slate-900 text-lg">Follow-Up Schedule</h2>
              <div className="divide-y divide-slate-100">
                {followupsList.map((fu) => (
                  <div key={fu.id} className="py-4 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{fu.target}</p>
                      <p className="text-slate-600 mt-0.5">Reason: {fu.reason}</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">Due Date: {fu.date}</p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded bg-red-100 text-red-800 font-bold text-[10px]">{fu.status}</span>
                      <button
                        onClick={() => alert(`Calling ${fu.target}...`)}
                        className="px-3 py-1.5 rounded bg-blue-600 text-white font-semibold cursor-pointer"
                      >
                        Call Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 11. SALES TAB */}
          {activeTab === 'sales' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in">
              <h2 className="font-bold text-slate-900 text-lg">Territory Sales Volume</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500 font-bold uppercase">Today's Sales</span>
                  <p className="text-xl font-bold text-slate-900 mt-1">{formatTZS(1450000)}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500 font-bold uppercase">This Week</span>
                  <p className="text-xl font-bold text-slate-900 mt-1">{formatTZS(8900000)}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500 font-bold uppercase">This Month</span>
                  <p className="text-xl font-bold text-blue-600 mt-1">{formatTZS(target.achievedGMV)}</p>
                </div>
              </div>
            </div>
          )}

          {/* 12. TARGETS TAB */}
          {activeTab === 'targets' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in max-w-2xl">
              <h2 className="font-bold text-slate-900 text-lg">Monthly Targets & Quota: {target.month}</h2>
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-sm mb-1">
                    <span>GMV Sales Target</span>
                    <span className="text-blue-600">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <p className="text-slate-500 mt-1">Achieved {formatTZS(target.achievedGMV)} of {formatTZS(target.targetGMV)}</p>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between font-bold">
                  <span>Vendor Onboarding Target</span>
                  <span>{target.achievedSellersOnboarded} / {target.targetSellersOnboarded} Stores</span>
                </div>
              </div>
            </div>
          )}

          {/* 13. PERFORMANCE TAB */}
          {activeTab === 'performance' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in">
              <h2 className="font-bold text-slate-900 text-lg">Salesperson Performance Dashboard</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <span className="font-bold text-slate-500 uppercase">Conversion Rate</span>
                  <p className="text-2xl font-bold text-slate-900">38.4%</p>
                  <p className="text-emerald-600 font-semibold">+4.2% vs last month</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <span className="font-bold text-slate-500 uppercase">Visits Completed</span>
                  <p className="text-2xl font-bold text-slate-900">42 this month</p>
                  <p className="text-blue-600 font-semibold">100% on-time arrival rate</p>
                </div>
              </div>
            </div>
          )}

          {/* 14. COMMISSIONS TAB */}
          {activeTab === 'commissions' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between pb-6 border-b border-slate-200">
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">Commission Ledger & Earnings</h2>
                  <p className="text-xs text-slate-500">4.0% recurring commission on completed orders from onboarded merchants</p>
                </div>
                <button
                  onClick={() => setShowPayoutModal(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 cursor-pointer shadow-sm"
                >
                  Request Payout
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {commissionsList.map((com) => (
                  <div key={com.id} className="py-4 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">Order #{com.orderNumber}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">{com.status}</span>
                      </div>
                      <p className="text-slate-500 mt-0.5">{com.customer} • Vendor: {com.vendor}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-700 text-sm block">+{formatTZS(com.amount)}</span>
                      <span className="text-[10px] text-slate-400">Sale: {formatTZS(com.saleValue)} ({com.rate})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 15. PAYOUTS TAB */}
          {activeTab === 'payouts' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between pb-6 border-b border-slate-200">
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">Payouts & Mobile Money Accounts</h2>
                  <p className="text-xs text-slate-500">Manage instant payout destinations (M-Pesa, Tigo Pesa, Bank)</p>
                </div>
                <button
                  onClick={() => setShowAddPaymentModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 cursor-pointer"
                >
                  + Add Payment Method
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Configured Payout Methods</h3>
                <div className="space-y-2">
                  {paymentMethodsList.map((pm) => (
                    <div key={pm.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-bold text-slate-900">{pm.provider} ({pm.details})</p>
                          <span className="text-[10px] text-emerald-600 font-semibold">Verified Account</span>
                        </div>
                      </div>
                      {pm.isDefault && (
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">Default</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 16. MESSAGES TAB */}
          {activeTab === 'messages' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in">
              <h2 className="font-bold text-slate-900 text-lg">Field Communications</h2>
              <div className="divide-y divide-slate-100">
                {messagesList.map((msg) => (
                  <div key={msg.id} className="py-4 flex items-start justify-between gap-4 text-xs">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900">{msg.sender}</span>
                        <p className="text-slate-700 mt-1">{msg.message}</p>
                      </div>
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">{msg.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 17. NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in">
              <h2 className="font-bold text-slate-900 text-lg">Sales Notifications</h2>
              <div className="divide-y divide-slate-100">
                {notificationsList.map((notif) => (
                  <div key={notif.id} className="py-4 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <Bell className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="font-bold text-slate-900">{notif.title}</p>
                        <span className="text-slate-400 text-[11px]">{notif.time}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => alert(`Marked notification "${notif.title}" as read.`)}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                    >
                      Mark Read
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 18. PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in max-w-xl">
              <h2 className="font-bold text-slate-900 text-lg">Salesperson Profile & Territory</h2>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-semibold">Full Name</span>
                  <span className="font-bold text-slate-900">{user?.name || 'Baraka Mushi'}</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-semibold">Salesperson ID</span>
                  <span className="font-bold font-mono text-slate-900">{user?.salespersonId}</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-semibold">Assigned Territory</span>
                  <span className="font-bold text-blue-600">Dar es Salaam (Kariakoo & Posta Hub)</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-semibold">Manager</span>
                  <span className="font-bold text-slate-900">Amina Juma (Regional Director)</span>
                </div>
              </div>
            </div>
          )}

          {/* 19. SUPPORT TAB */}
          {activeTab === 'support' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between pb-6 border-b border-slate-200">
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">Sales Help & Support Desk</h2>
                  <p className="text-xs text-slate-500">Contact operations or raise technical support tickets</p>
                </div>
                <button
                  onClick={() => setShowSupportModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 cursor-pointer"
                >
                  + New Support Ticket
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {supportTicketsList.map((t) => (
                  <div key={t.id} className="py-4 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{t.subject}</p>
                      <p className="text-slate-500 mt-0.5">Category: {t?.category} • Date: {t.date}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 20. SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in max-w-xl">
              <h2 className="font-bold text-slate-900 text-lg">Field Portal Settings</h2>
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <p className="font-bold text-slate-900">Push Notifications for Leads</p>
                    <p className="text-slate-500 text-[11px]">Receive instant alerts when new leads are assigned</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded cursor-pointer" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <p className="font-bold text-slate-900">GPS Location Tracking</p>
                    <p className="text-slate-500 text-[11px]">Enable GPS verification for field visit check-ins</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded cursor-pointer" />
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODALS */}

      {/* 1. ADD LEAD MODAL */}
      {showAddLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h2 className="font-bold text-lg text-slate-900">Add Merchant Lead</h2>
            <form onSubmit={handleCreateLead} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Business / Store Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kariakoo Electronics"
                  value={newLeadBusiness}
                  onChange={e => setNewLeadBusiness(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Contact Person Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Juma Ally"
                  value={newLeadName}
                  onChange={e => setNewLeadName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="+255 754 000 111"
                  value={newLeadPhone}
                  onChange={e => setNewLeadPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddLead(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. LOG ACTIVITY MODAL */}
      {showLogActivity && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h2 className="font-bold text-lg text-slate-900">Log Field Activity</h2>
            <form onSubmit={handleLogActivity} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Activity Type</label>
                <select
                  value={activityType}
                  onChange={e => setActivityType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none text-xs"
                >
                  <option value="VISIT">In-Person Shop Visit</option>
                  <option value="CALL">Phone Call</option>
                  <option value="MEETING">Contract Meeting</option>
                  <option value="ONBOARDING">KYC / Onboarding</option>
                  <option value="FOLLOW_UP">Follow Up</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Interaction Notes</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Notes from vendor discussion..."
                  value={activityNotes}
                  onChange={e => setActivityNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLogActivity(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. CHECK-IN MODAL */}
      {showCheckInModal && activeVisit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 text-xs">
            <h2 className="font-bold text-lg text-slate-900">Field Visit Check-In</h2>
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
              <p className="font-bold text-slate-900 text-sm">{activeVisit.targetName}</p>
              <p className="text-slate-600">Location: {activeVisit.location}</p>
              <p className="text-slate-600">Purpose: {activeVisit.purpose}</p>
            </div>
            <p className="text-slate-500">GPS location verified successfully for Kariakoo district.</p>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowCheckInModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowCheckInModal(false);
                  setShowCheckOutModal(true);
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 cursor-pointer"
              >
                Confirm Arrival & Check In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. CHECK-OUT MODAL */}
      {showCheckOutModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 text-xs">
            <h2 className="font-bold text-lg text-slate-900">Field Visit Check-Out & Outcome</h2>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Visit Outcome</label>
              <select
                value={visitOutcome}
                onChange={e => setVisitOutcome(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
              >
                <option value="Successful">Successful / Converted</option>
                <option value="Follow-up Required">Follow-up Required</option>
                <option value="Interested">Interested</option>
                <option value="Not Interested">Not Interested</option>
                <option value="Rescheduled">Rescheduled</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Meeting Notes & Next Actions</label>
              <textarea
                rows={3}
                placeholder="Details on vendor agreement..."
                value={checkoutNotes}
                onChange={e => setCheckoutNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowCheckOutModal(false);
                  alert('Visit successfully checked out and logged to audit trail.');
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 cursor-pointer"
              >
                Complete Visit & Check Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. VENDOR ONBOARDING WIZARD MODAL */}
      {showOnboardingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-base text-slate-900">Vendor Onboarding Wizard (Step {onboardingStep} of 4)</h2>
              <button onClick={() => setShowOnboardingModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {onboardingStep === 1 && (
              <div className="space-y-3">
                <label className="font-semibold text-slate-700 block">Business & Legal Name</label>
                <input
                  type="text"
                  placeholder="e.g. Swahili Tech Distributors"
                  value={onboardForm.businessName}
                  onChange={e => setOnboardForm({ ...onboardForm, businessName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
                <label className="font-semibold text-slate-700 block">Owner / Contact Person</label>
                <input
                  type="text"
                  placeholder="e.g. Amina Selemani"
                  value={onboardForm.ownerName}
                  onChange={e => setOnboardForm({ ...onboardForm, ownerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>
            )}

            {onboardingStep === 2 && (
              <div className="space-y-3">
                <label className="font-semibold text-slate-700 block">Phone Number</label>
                <input
                  type="text"
                  placeholder="+255 754 112 233"
                  value={onboardForm.phone}
                  onChange={e => setOnboardForm({ ...onboardForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
                <label className="font-semibold text-slate-700 block">Store Category</label>
                <select
                  value={onboardForm.category}
                  onChange={e => setOnboardForm({ ...onboardForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                >
                  <option value="Phones & Tablets">Phones & Tablets</option>
                  <option value="Home Appliances">Home Appliances</option>
                  <option value="Fashion">Fashion & Apparel</option>
                </select>
              </div>
            )}

            {onboardingStep === 3 && (
              <div className="space-y-3">
                <label className="font-semibold text-slate-700 block">BRELA / TIN Compliance Number</label>
                <input
                  type="text"
                  placeholder="TZ-BRELA-2026-991"
                  value={onboardForm.tinNumber}
                  onChange={e => setOnboardForm({ ...onboardForm, tinNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
                <p className="text-slate-500 text-[11px]">Compliance documents verified by agent in the field.</p>
              </div>
            )}

            {onboardingStep === 4 && (
              <div className="space-y-3">
                <p className="font-bold text-slate-900">Review Onboarding Submission</p>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <p><strong>Business:</strong> {onboardForm.businessName || 'Swahili Tech Hub'}</p>
                  <p><strong>Owner:</strong> {onboardForm.ownerName || 'Amina Selemani'}</p>
                  <p><strong>Category:</strong> {onboardForm.category}</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {onboardingStep > 1 ? (
                <button
                  onClick={() => setOnboardingStep(onboardingStep - 1)}
                  className="px-4 py-2 rounded-lg border border-slate-300 font-semibold cursor-pointer"
                >
                  Back
                </button>
              ) : <div />}

              {onboardingStep < 4 ? (
                <button
                  onClick={() => setOnboardingStep(onboardingStep + 1)}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 cursor-pointer"
                >
                  Next Step
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowOnboardingModal(false);
                    setOnboardingStep(1);
                    alert('Vendor application successfully submitted for Lumo approval.');
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 cursor-pointer"
                >
                  Submit Onboarding
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. PAYOUT REQUEST MODAL */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 text-xs">
            <h2 className="font-bold text-lg text-slate-900">Request Commission Payout</h2>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Payout Amount (TZS)</label>
              <input
                type="number"
                value={payoutAmount}
                onChange={e => setPayoutAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Destination Mobile Money / Bank</label>
              <select className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs">
                <option>M-Pesa (+255 754 *** 111 - Baraka Mushi)</option>
                <option>CRDB Bank Business Account</option>
              </select>
            </div>
            {payoutSuccessMsg && <p className="text-emerald-600 font-bold">{payoutSuccessMsg}</p>}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowPayoutModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setPayoutSuccessMsg('Payout request successfully submitted to Lumo finance.');
                  setTimeout(() => {
                    setShowPayoutModal(false);
                    setPayoutSuccessMsg('');
                  }, 1800);
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 cursor-pointer"
              >
                Confirm Payout Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. SCHEDULE VISIT MODAL */}
      {showScheduleVisit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 text-xs">
            <h2 className="font-bold text-lg text-slate-900">Schedule Field Visit</h2>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Store / Lead Name</label>
              <input
                type="text"
                placeholder="e.g. Kariakoo Mobile Hub"
                value={visitTarget}
                onChange={e => setVisitTarget(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Visit Purpose</label>
              <input
                type="text"
                placeholder="e.g. Contract signing & POS setup"
                value={visitPurpose}
                onChange={e => setVisitPurpose(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowScheduleVisit(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowScheduleVisit(false);
                  alert('Visit successfully added to today schedule.');
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 cursor-pointer"
              >
                Save Appointment
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  Building2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Layers,
  Clock,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  Filter,
  Plus,
  ShieldCheck,
  Menu,
  X,
  Search,
  Download,
  Check,
  RefreshCw,
  Bell,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Headphones,
  Settings,
  Shield,
  Wallet,
  Receipt,
  BarChart3,
  Percent,
  Calendar,
  Sparkles,
  Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { UserAccountNavDropdown } from '../../components/common/UserAccountNavDropdown';
import {
  CreateInvoiceModal,
  RecordExpenseModal,
  ProcessPayoutModal,
  ReconcileAccountModal,
  TransferFundsModal,
  GenerateReportModal,
  ManageBudgetsModal,
  TaxSummaryModal,
  FiscalCalendarModal,
  NotificationCenterModal,
  MessagingHubModal
} from './FinanceModals';
import { FinanceDetailTabs } from './FinanceDetailTabs';

export const FinanceDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Filter selections
  const [selectedAccountFilter, setSelectedAccountFilter] = useState('ALL');
  const [selectedPeriodFilter, setSelectedPeriodFilter] = useState('THIS_MONTH');

  // Backend state
  const [overviewData, setOverviewData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [reportsData, setReportsData] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Modals state
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Search input in top header
  const [headerSearch, setHeaderSearch] = useState('');

  // Fetch all backend financial data
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [ovRes, txRes, accRes, setRes, invRes, billRes, repRes] = await Promise.all([
        fetch('/api/finance/overview').then(r => r.json()),
        fetch('/api/finance/transactions').then(r => r.json()),
        fetch('/api/finance/accounts').then(r => r.json()),
        fetch('/api/finance/settlements').then(r => r.json()),
        fetch('/api/finance/invoices').then(r => r.json()),
        fetch('/api/finance/bills').then(r => r.json()),
        fetch('/api/finance/reports').then(r => r.json())
      ]);

      if (ovRes) setOverviewData(ovRes);
      if (txRes.transactions) setTransactions(txRes.transactions);
      if (accRes.accounts) setAccounts(accRes.accounts);
      if (setRes.settlements) setSettlements(setRes.settlements);
      if (invRes.invoices) setInvoices(invRes.invoices);
      if (billRes.bills) setBills(billRes.bills);
      if (repRes) setReportsData(repRes);
    } catch (err) {
      console.error('Error fetching finance data:', err);
      addToast('Failed to sync financial ledger with server', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const openModal = (modalName: string) => {
    setActiveModal(modalName);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const handleExport = () => {
    window.location.href = '/api/finance/export';
    addToast('Financial export file generated and downloaded', 'success');
  };

  // Nav menu items strictly following ACCOUNTING.png
  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'transactions', label: 'Transactions', icon: ArrowRightLeft },
    { id: 'accounts', label: 'Accounts', icon: Building2 },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'payouts', label: 'Payouts', icon: ArrowUpRight },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'bills', label: 'Bills & Expenses', icon: Receipt },
    { id: 'reconciliation', label: 'Reconciliation', icon: RefreshCw },
    { id: 'wallets', label: 'Wallets', icon: Wallet },
    { id: 'budgets', label: 'Budgets', icon: PieChart },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'taxes', label: 'Taxes', icon: Percent },
    { id: 'audit-logs', label: 'Audit Logs', icon: Shield },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const metrics = overviewData?.metrics;
  const cashFlow = overviewData?.cashFlow;
  const liquidity = overviewData?.liquidity;
  const agedReceivables = overviewData?.agedReceivables;
  const fundDist = overviewData?.fundDistribution;
  const paymentSuccess = overviewData?.paymentSuccess;
  const activities = overviewData?.recentActivities || [];

  return (
    <div className="flex h-screen bg-[#f8f9fc] font-sans antialiased text-slate-800 overflow-hidden">
      {/* 1. LEFT SIDEBAR NAVIGATION */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0B132B] text-white flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header / Brand */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF6A00]/20 text-[#FF6A00] flex items-center justify-center font-black text-lg tracking-tight">
              L<span className="text-amber-400">✦</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-lg tracking-wider">LUMO</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-orange-950 text-orange-400 border border-orange-800">FINANCE</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-none">Smart Commerce. Delivered.</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5 scrollbar-thin scrollbar-thumb-slate-800">
          {navigationItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#FF6A00] text-white shadow-md font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Promotional Sidebar Card */}
          <div className="mt-6 mx-1 p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 text-white relative overflow-hidden">
            <div className="relative z-10 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs leading-tight">Financial Control Made Simple</h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                Get real-time visibility into all financial activities across LUMO ecosystem.
              </p>
              <button
                onClick={() => setActiveTab('reports')}
                className="mt-2 w-full py-1.5 px-3 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition"
              >
                <span>Explore Reports</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Footer Help & User Account */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          <UserAccountNavDropdown variant="dark" align="left" className="w-full" />
          <button
            onClick={() => addToast('Connecting with Corporate Finance Desk (+255 700 000 000)', 'info')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] font-medium text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
          >
            <Headphones className="w-4 h-4 text-orange-400" />
            <span>Finance Desk &amp; Audit</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-100 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 flex-1 max-w-lg">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search Bar */}
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search transactions, invoices, accounts..."
                value={headerSearch}
                onChange={e => setHeaderSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-600 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setActiveTab('reports')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50/50 text-purple-900 text-xs font-semibold hover:bg-purple-100 transition"
            >
              <BarChart3 className="w-3.5 h-3.5 text-purple-700" />
              <span>Reports</span>
            </button>

            <button
              onClick={() => openModal('calendar')}
              title="Fiscal Calendar & Statutory Deadlines"
              className="p-2 text-slate-500 hover:text-purple-900 hover:bg-purple-50 rounded-xl transition cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
            </button>

            <button
              onClick={() => openModal('notifications')}
              title="Finance Alerts & Automated Events"
              className="p-2 text-slate-500 hover:text-purple-900 hover:bg-purple-50 rounded-xl relative transition cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                3
              </span>
            </button>

            <button
              onClick={() => openModal('messages')}
              title="Automated Dispatch & Outbox Hub"
              className="p-2 text-slate-500 hover:text-purple-900 hover:bg-purple-50 rounded-xl relative transition cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center">
                5
              </span>
            </button>

            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

            {/* Profile Dropdown Badge */}
            <UserAccountNavDropdown variant="light" />
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 space-y-6">
          {/* Top Page Header with Title & Filter Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Finance & Accounting Hub
                </h1>
                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time financial overview of the LUMO ecosystem.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Account Dropdown */}
              <select
                value={selectedAccountFilter}
                onChange={e => setSelectedAccountFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-600 shadow-xs"
              >
                <option value="ALL">All Accounts</option>
                <option value="MAIN">Main Wallet (CRDB)</option>
                <option value="PAYOUT">Payout Wallet (M-Pesa)</option>
                <option value="ESCROW">Escrow Lockbox Vault</option>
                <option value="OPS">Operations Wallet (NMB)</option>
              </select>

              {/* Period Dropdown */}
              <select
                value={selectedPeriodFilter}
                onChange={e => setSelectedPeriodFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-600 shadow-xs"
              >
                <option value="THIS_MONTH">This Month</option>
                <option value="LAST_MONTH">Last Month</option>
                <option value="THIS_QUARTER">This Quarter</option>
                <option value="YEAR_TO_DATE">Year to Date</option>
              </select>

              {/* Export Button */}
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-[#2d1259] hover:bg-[#3d1a78] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Conditional View: If Tab is not 'overview', render dedicated full-screen module */}
          {activeTab !== 'overview' ? (
            <FinanceDetailTabs
              activeTab={activeTab}
              transactions={transactions}
              accounts={accounts}
              settlements={settlements}
              invoices={invoices}
              bills={bills}
              reportsData={reportsData}
              auditLogs={auditLogs}
              onOpenModal={openModal}
              onRefresh={fetchAllData}
              addToast={addToast}
            />
          ) : (
            /* OVERVIEW TAB (Exactly following ACCOUNTING.png) */
            <div className="space-y-6">
              {/* 1. TOP 6 KPI METRIC CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
                {/* 1. Total Revenue */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs hover:border-purple-200 transition">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                      <Zap className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-400">Total Revenue</p>
                  <p className="text-lg font-black text-slate-900 mt-0.5 tracking-tight">
                    TZS {metrics?.totalRevenue?.toLocaleString() || '1,245,670,000'}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-2">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>23.6% vs last month</span>
                  </div>
                </div>

                {/* 2. Total Payouts */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs hover:border-purple-200 transition">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                      <Bell className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-400">Total Payouts</p>
                  <p className="text-lg font-black text-slate-900 mt-0.5 tracking-tight">
                    TZS {metrics?.totalPayouts?.toLocaleString() || '982,345,000'}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-2">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>19.4% vs last month</span>
                  </div>
                </div>

                {/* 3. Net Profit */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs hover:border-purple-200 transition">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-400">Net Profit</p>
                  <p className="text-lg font-black text-slate-900 mt-0.5 tracking-tight">
                    TZS {metrics?.netProfit?.toLocaleString() || '263,325,000'}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-2">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>28.7% vs last month</span>
                  </div>
                </div>

                {/* 4. Total Transactions */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs hover:border-purple-200 transition">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <CreditCard className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-400">Total Transactions</p>
                  <p className="text-lg font-black text-slate-900 mt-0.5 tracking-tight">
                    {metrics?.totalTransactions?.toLocaleString() || '124,856'}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-2">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>16.3% vs last month</span>
                  </div>
                </div>

                {/* 5. Pending Settlements */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs hover:border-purple-200 transition">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-400">Pending Settlements</p>
                  <p className="text-lg font-black text-slate-900 mt-0.5 tracking-tight">
                    TZS {metrics?.pendingSettlements?.toLocaleString() || '231,450,000'}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-rose-600 mt-2">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>5.2% vs last month</span>
                  </div>
                </div>

                {/* 6. Outstanding Receivables */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs hover:border-purple-200 transition">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                      <Receipt className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-400">Outstanding Receivables</p>
                  <p className="text-lg font-black text-slate-900 mt-0.5 tracking-tight">
                    TZS {metrics?.outstandingReceivables?.toLocaleString() || '178,670,000'}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-rose-600 mt-2">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>3.1% vs last month</span>
                  </div>
                </div>
              </div>

              {/* 2. MIDDLE ROW: 4 MAJOR ANALYTICAL CARDS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* CARD 1: Revenue Overview Line Chart */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-900 text-sm">Revenue Overview</h3>
                    <select className="text-[11px] font-semibold text-slate-600 border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 focus:outline-hidden">
                      <option>This Month</option>
                      <option>Last Month</option>
                    </select>
                  </div>

                  {/* SVG Line Chart Graphic matching reference */}
                  <div className="relative h-48 w-full mt-2">
                    <svg viewBox="0 0 400 180" className="w-full h-full overflow-visible">
                      {/* Horizontal Grid lines */}
                      <line x1="45" y1="20" x2="390" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="45" y1="60" x2="390" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="45" y1="100" x2="390" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="45" y1="140" x2="390" y2="140" stroke="#f1f5f9" strokeWidth="1" />

                      {/* Y-Axis Labels */}
                      <text x="5" y="24" fill="#94a3b8" fontSize="9" fontWeight="600">TZS 1.5B</text>
                      <text x="5" y="64" fill="#94a3b8" fontSize="9" fontWeight="600">TZS 1.2B</text>
                      <text x="5" y="104" fill="#94a3b8" fontSize="9" fontWeight="600">TZS 600M</text>
                      <text x="5" y="144" fill="#94a3b8" fontSize="9" fontWeight="600">TZS 0</text>

                      {/* Expenses Line (Green) */}
                      <path
                        d="M 60 130 C 110 120, 160 135, 210 115 C 260 100, 310 110, 370 95"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2"
                        strokeDasharray="4 3"
                      />

                      {/* Payouts Line (Orange) */}
                      <path
                        d="M 60 110 C 110 95, 160 105, 210 85 C 260 70, 310 75, 370 65"
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="2.5"
                      />

                      {/* Revenue Line (Purple Solid with Gradient Fill) */}
                      <defs>
                        <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 60 90 C 110 70, 160 80, 210 55 C 260 38, 310 45, 370 30 L 370 140 L 60 140 Z"
                        fill="url(#purpleGrad)"
                      />
                      <path
                        d="M 60 90 C 110 70, 160 80, 210 55 C 260 38, 310 45, 370 30"
                        fill="none"
                        stroke="#6d28d9"
                        strokeWidth="3"
                      />

                      {/* Glowing Node on May 18 / TZS 125,450,000 */}
                      <circle cx="240" cy="48" r="6" fill="#6d28d9" stroke="#ffffff" strokeWidth="2.5" />

                      {/* Tooltip badge */}
                      <g transform="translate(160, 10)">
                        <rect width="130" height="26" rx="6" fill="#1e1b4b" />
                        <text x="65" y="16" fill="#ffffff" fontSize="9" fontWeight="700" textAnchor="middle">
                          TZS 125,450,000 / May 18
                        </text>
                      </g>

                      {/* X-Axis Dates */}
                      <text x="60" y="165" fill="#94a3b8" fontSize="8" textAnchor="middle">May 1</text>
                      <text x="110" y="165" fill="#94a3b8" fontSize="8" textAnchor="middle">May 5</text>
                      <text x="160" y="165" fill="#94a3b8" fontSize="8" textAnchor="middle">May 10</text>
                      <text x="210" y="165" fill="#94a3b8" fontSize="8" textAnchor="middle">May 15</text>
                      <text x="260" y="165" fill="#94a3b8" fontSize="8" textAnchor="middle">May 20</text>
                      <text x="310" y="165" fill="#94a3b8" fontSize="8" textAnchor="middle">May 25</text>
                      <text x="365" y="165" fill="#94a3b8" fontSize="8" textAnchor="middle">May 30</text>
                    </svg>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-center gap-4 pt-3 border-t border-slate-100 text-[11px] font-semibold">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-700" />
                      <span className="text-slate-600">Revenue</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                      <span className="text-slate-600">Payouts</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-slate-600">Expenses</span>
                    </div>
                  </div>
                </div>

                {/* CARD 2: Cash Flow Summary */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-900 text-sm">Cash Flow Summary</h3>
                    <select className="text-[11px] font-semibold text-slate-600 border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 focus:outline-hidden">
                      <option>This Month</option>
                    </select>
                  </div>

                  <div className="space-y-3.5 my-auto">
                    {/* Cash Inflows */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-slate-600 font-medium">Cash Inflows</span>
                      </div>
                      <span className="font-bold text-emerald-600">
                        TZS {cashFlow?.inflows?.toLocaleString() || '1,482,230,000'}
                      </span>
                    </div>

                    {/* Cash Outflows */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-slate-600 font-medium">Cash Outflows</span>
                      </div>
                      <span className="font-bold text-rose-600">
                        TZS {cashFlow?.outflows?.toLocaleString() || '1,067,890,000'}
                      </span>
                    </div>

                    {/* Net Cash Flow */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                          <Zap className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-slate-600 font-medium">Net Cash Flow</span>
                      </div>
                      <span className="font-bold text-emerald-600">
                        TZS {cashFlow?.netCashFlow?.toLocaleString() || '414,340,000'}
                      </span>
                    </div>

                    {/* Opening Balance */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-slate-600 font-medium">Opening Balance</span>
                      </div>
                      <span className="font-bold text-slate-800">
                        TZS {cashFlow?.openingBalance?.toLocaleString() || '653,210,000'}
                      </span>
                    </div>

                    {/* Closing Balance */}
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-slate-900 font-bold">Closing Balance</span>
                      </div>
                      <span className="font-black text-slate-900 text-sm">
                        TZS {cashFlow?.closingBalance?.toLocaleString() || '1,067,550,000'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* CARD 3: Fund Distribution (Donut Chart) */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-slate-900 text-sm">Fund Distribution</h3>
                  </div>

                  {/* SVG Donut Chart */}
                  <div className="relative flex items-center justify-center my-2">
                    <svg width="150" height="150" viewBox="0 0 160 160" className="transform -rotate-90">
                      {/* Circle 1: Seller Payouts 52.1% (stroke-dasharray = 0.521 * 377 = 196) */}
                      <circle
                        cx="80"
                        cy="80"
                        r="60"
                        fill="transparent"
                        stroke="#311b92"
                        strokeWidth="24"
                        strokeDasharray="196 377"
                        strokeDashoffset="0"
                      />
                      {/* Circle 2: Operations 18.7% (0.187 * 377 = 70) */}
                      <circle
                        cx="80"
                        cy="80"
                        r="60"
                        fill="transparent"
                        stroke="#06b6d4"
                        strokeWidth="24"
                        strokeDasharray="70 377"
                        strokeDashoffset="-196"
                      />
                      {/* Circle 3: Riders & Delivery 12.4% (0.124 * 377 = 47) */}
                      <circle
                        cx="80"
                        cy="80"
                        r="60"
                        fill="transparent"
                        stroke="#f97316"
                        strokeWidth="24"
                        strokeDasharray="47 377"
                        strokeDashoffset="-266"
                      />
                      {/* Circle 4: Marketing 6.8% (0.068 * 377 = 26) */}
                      <circle
                        cx="80"
                        cy="80"
                        r="60"
                        fill="transparent"
                        stroke="#10b981"
                        strokeWidth="24"
                        strokeDasharray="26 377"
                        strokeDashoffset="-313"
                      />
                      {/* Circle 5: Others 10.0% (0.10 * 377 = 38) */}
                      <circle
                        cx="80"
                        cy="80"
                        r="60"
                        fill="transparent"
                        stroke="#ef4444"
                        strokeWidth="24"
                        strokeDasharray="38 377"
                        strokeDashoffset="-339"
                      />
                    </svg>

                    {/* Donut Cutout Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] text-slate-400 font-semibold">Total Disbursed</span>
                      <span className="text-xs font-black text-slate-900 leading-tight">TZS 982.3M</span>
                    </div>
                  </div>

                  {/* Donut Legend */}
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px] font-semibold text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#311b92]" />
                      <span>Seller Payouts (52.1%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#06b6d4]" />
                      <span>Operations (18.7%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#f97316]" />
                      <span>Riders & Delivery (12.4%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                      <span>Marketing (6.8%)</span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2">
                      <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
                      <span>Others (10.0%)</span>
                    </div>
                  </div>
                </div>

                {/* CARD 4: System Liquidity, Aged Receivables & Quick Actions */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between space-y-4">
                  {/* System Liquidity Stat */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400 font-medium">System Liquidity</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                        {liquidity?.status || 'Healthy'}
                      </span>
                    </div>
                    <p className="text-base font-black text-slate-900">
                      TZS {liquidity?.available?.toLocaleString() || '1,067,550,000'}
                    </p>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${liquidity?.percentage || 78}%` }}
                      />
                    </div>
                  </div>

                  {/* Payment Success Rate */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Payment Success Rate</span>
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        1.3% vs last month
                      </span>
                    </div>
                    <p className="text-lg font-black text-slate-900 mt-0.5">
                      {paymentSuccess?.rate || '98.7%'}
                    </p>
                  </div>

                  {/* Aged Receivables */}
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[11px] font-bold text-slate-900 mb-2">Aged Receivables</p>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <div className="flex items-center gap-1 text-slate-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>0 - 30 Days</span>
                        </div>
                        <p className="font-bold text-slate-800 mt-0.5">TZS 98,450,000</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-slate-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>31 - 60 Days</span>
                        </div>
                        <p className="font-bold text-slate-800 mt-0.5">TZS 45,230,000</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-slate-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          <span>61 - 90 Days</span>
                        </div>
                        <p className="font-bold text-slate-800 mt-0.5">TZS 21,600,000</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-slate-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-900" />
                          <span>90+ Days</span>
                        </div>
                        <p className="font-bold text-slate-800 mt-0.5">TZS 13,390,000</p>
                      </div>
                    </div>
                  </div>

                  {/* 8 Quick Action Buttons */}
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[11px] font-bold text-slate-900 mb-2">Quick Actions</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => openModal('createInvoice')}
                        className="py-1.5 px-2 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 text-slate-700 rounded-lg text-[11px] font-semibold text-center border border-slate-100 transition"
                      >
                        Create Invoice
                      </button>
                      <button
                        onClick={() => openModal('recordExpense')}
                        className="py-1.5 px-2 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 text-slate-700 rounded-lg text-[11px] font-semibold text-center border border-slate-100 transition"
                      >
                        Record Expense
                      </button>
                      <button
                        onClick={() => openModal('processPayout')}
                        className="py-1.5 px-2 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 text-slate-700 rounded-lg text-[11px] font-semibold text-center border border-slate-100 transition"
                      >
                        Process Payout
                      </button>
                      <button
                        onClick={() => openModal('reconcile')}
                        className="py-1.5 px-2 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 text-slate-700 rounded-lg text-[11px] font-semibold text-center border border-slate-100 transition"
                      >
                        Reconcile Account
                      </button>
                      <button
                        onClick={() => openModal('transferFunds')}
                        className="py-1.5 px-2 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 text-slate-700 rounded-lg text-[11px] font-semibold text-center border border-slate-100 transition"
                      >
                        Transfer Funds
                      </button>
                      <button
                        onClick={() => openModal('generateReport')}
                        className="py-1.5 px-2 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 text-slate-700 rounded-lg text-[11px] font-semibold text-center border border-slate-100 transition"
                      >
                        Generate Report
                      </button>
                      <button
                        onClick={() => openModal('manageBudgets')}
                        className="py-1.5 px-2 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 text-slate-700 rounded-lg text-[11px] font-semibold text-center border border-slate-100 transition"
                      >
                        Manage Budgets
                      </button>
                      <button
                        onClick={() => openModal('taxSummary')}
                        className="py-1.5 px-2 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 text-slate-700 rounded-lg text-[11px] font-semibold text-center border border-slate-100 transition"
                      >
                        Tax Summary
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. LOWER SECTION: RECENT TRANSACTIONS TABLE & RECENT ACTIVITIES */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Recent Transactions Table (2 cols) */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-xs p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">Recent Transactions</h3>
                    <button
                      onClick={() => setActiveTab('transactions')}
                      className="text-xs font-semibold text-purple-700 hover:text-purple-900"
                    >
                      View all
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-100">
                        <tr>
                          <th className="py-2.5 px-3">Transaction ID</th>
                          <th className="py-2.5 px-3">Description</th>
                          <th className="py-2.5 px-3">Type</th>
                          <th className="py-2.5 px-3">Account</th>
                          <th className="py-2.5 px-3 text-right">Amount (TZS)</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(transactions.slice(0, 6).length > 0 ? transactions.slice(0, 6) : [
                          { id: 'TXN-89234', description: 'Customer Order #ORD-4521', type: 'Inflow', account: 'Main Wallet', amount: 350000, status: 'Completed', date: '2025-05-18 14:32' },
                          { id: 'TXN-89233', description: 'Vendor Payout - Lumo Fashion', type: 'Payout', account: 'Payout Wallet', amount: -2450000, status: 'Completed', date: '2025-05-18 14:15' },
                          { id: 'TXN-89232', description: 'Warehouse Expense - Lagos WH', type: 'Expense', account: 'Operations Wallet', amount: -180000, status: 'Completed', date: '2025-05-18 13:45' },
                          { id: 'TXN-89231', description: 'Customer Order #ORD-4520', type: 'Inflow', account: 'Main Wallet', amount: 780000, status: 'Completed', date: '2025-05-18 13:20' },
                          { id: 'TXN-89230', description: 'Wallet Transfer - Main to Payout', type: 'Transfer', account: 'Main Wallet', amount: -50000000, status: 'Completed', date: '2025-05-18 12:00' },
                          { id: 'TXN-89229', description: 'Commission - Tech Hub TZ', type: 'Inflow', account: 'Main Wallet', amount: 125000, status: 'Completed', date: '2025-05-18 11:30' }
                        ]).map((tx, idx) => {
                          const isPos = tx.amount > 0;
                          return (
                            <tr key={tx.id || idx} className="hover:bg-slate-50/70 transition">
                              <td className="py-3 px-3 font-mono font-medium text-slate-900">{tx.id}</td>
                              <td className="py-3 px-3 font-medium text-slate-800 truncate max-w-[180px]">
                                {tx.description}
                              </td>
                              <td className="py-3 px-3">
                                <span
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                    tx.type === 'Inflow'
                                      ? 'bg-emerald-50 text-emerald-700'
                                      : tx.type === 'Payout'
                                      ? 'bg-blue-50 text-blue-700'
                                      : tx.type === 'Transfer'
                                      ? 'bg-purple-50 text-purple-700'
                                      : 'bg-amber-50 text-amber-700'
                                  }`}
                                >
                                  {tx.type}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-slate-600 text-[11px]">{tx.account}</td>
                              <td
                                className={`py-3 px-3 text-right font-bold ${
                                  isPos ? 'text-emerald-600' : 'text-slate-900'
                                }`}
                              >
                                {isPos ? '+' : ''}TZS {Math.abs(tx.amount).toLocaleString()}
                              </td>
                              <td className="py-3 px-3">
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                  <Check className="w-2.5 h-2.5" />
                                  {tx.status}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right text-slate-400 text-[11px]">{tx.date}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent Activities (1 col) */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">Recent Activities</h3>
                    <button
                      onClick={() => setActiveTab('audit-logs')}
                      className="text-xs font-semibold text-purple-700 hover:text-purple-900"
                    >
                      View all
                    </button>
                  </div>

                  <div className="space-y-3.5">
                    {(activities.length > 0 ? activities : [
                      { title: 'Payout #PO-4589 Approved', description: 'TZS 45,230,000 to Electronics Hub', timeAgo: '2 minutes ago', type: 'payout' },
                      { title: 'Invoice #INV-2025-089 Paid', description: 'TZS 12,450,000 from Fashion Express', timeAgo: '15 minutes ago', type: 'invoice' },
                      { title: 'Account Reconciled', description: 'Main Wallet reconciled with CRDB Bank feed', timeAgo: '1 hour ago', type: 'reconcile' },
                      { title: 'Budget Threshold Reached', description: 'Operations budget reached 85% of monthly allocation', timeAgo: '3 hours ago', type: 'budget' },
                      { title: 'Tax Report Generated', description: 'Monthly TRA VAT report compiled for April 2025', timeAgo: '5 hours ago', type: 'tax' }
                    ]).map((act: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 text-xs">
                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                          {act.type === 'payout' ? (
                            <CreditCard className="w-4 h-4" />
                          ) : act.type === 'invoice' ? (
                            <FileText className="w-4 h-4" />
                          ) : act.type === 'reconcile' ? (
                            <RefreshCw className="w-4 h-4" />
                          ) : act.type === 'budget' ? (
                            <PieChart className="w-4 h-4" />
                          ) : (
                            <ShieldCheck className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 truncate">{act.title}</p>
                          <p className="text-slate-500 text-[11px] truncate mt-0.5">{act.description}</p>
                          <p className="text-slate-400 text-[10px] mt-1">{act.timeAgo}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. BOTTOM METRIC STRIP (8 items matching ACCOUNTING.png) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
                {/* 1 */}
                <div className="space-y-0.5">
                  <p className="text-[10px] font-semibold text-slate-400">Total Accounts</p>
                  <p className="text-base font-black text-slate-900">27</p>
                  <p className="text-[10px] text-slate-400">Active accounts</p>
                </div>
                {/* 2 */}
                <div className="space-y-0.5">
                  <p className="text-[10px] font-semibold text-slate-400">Total Wallet Balance</p>
                  <p className="text-base font-black text-slate-900">TZS 1,067,550,000</p>
                  <p className="text-[10px] text-slate-400">Across all wallets</p>
                </div>
                {/* 3 */}
                <div className="space-y-0.5">
                  <p className="text-[10px] font-semibold text-slate-400">Total Invoices</p>
                  <p className="text-base font-black text-slate-900">856</p>
                  <p className="text-[10px] text-slate-400">This month</p>
                </div>
                {/* 4 */}
                <div className="space-y-0.5">
                  <p className="text-[10px] font-semibold text-slate-400">Paid Invoices</p>
                  <p className="text-base font-black text-slate-900">742</p>
                  <p className="text-[10px] text-slate-400">86.7% paid</p>
                </div>
                {/* 5 */}
                <div className="space-y-0.5">
                  <p className="text-[10px] font-semibold text-slate-400">Total Bills</p>
                  <p className="text-base font-black text-slate-900">234</p>
                  <p className="text-[10px] text-slate-400">This month</p>
                </div>
                {/* 6 */}
                <div className="space-y-0.5">
                  <p className="text-[10px] font-semibold text-slate-400">Overdue Bills</p>
                  <p className="text-base font-black text-rose-600">18</p>
                  <p className="text-[10px] text-slate-400">TZS 12,450,000</p>
                </div>
                {/* 7 */}
                <div className="space-y-0.5">
                  <p className="text-[10px] font-semibold text-slate-400">Tax Collected</p>
                  <p className="text-base font-black text-slate-900">TZS 98,670,000</p>
                  <p className="text-[10px] text-slate-400">This month</p>
                </div>
                {/* 8 */}
                <div className="space-y-0.5">
                  <p className="text-[10px] font-semibold text-slate-400">Audit Score</p>
                  <p className="text-base font-black text-emerald-600">98.5%</p>
                  <p className="text-[10px] text-slate-400">Excellent</p>
                </div>
              </div>

              {/* 5. FOOTER */}
              <footer className="pt-4 pb-2 text-center text-xs text-slate-400 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2">
                <span>© 2025 LUMO. All rights reserved.</span>
                <div className="flex items-center gap-4 text-[11px]">
                  <a href="#" className="hover:text-slate-600">Privacy Policy</a>
                  <a href="#" className="hover:text-slate-600">Terms of Service</a>
                  <a href="#" className="hover:text-slate-600">Support</a>
                  <span>Version 1.0.0</span>
                </div>
              </footer>
            </div>
          )}
        </main>
      </div>

      {/* 3. INTERACTIVE MODALS */}
      <CreateInvoiceModal
        isOpen={activeModal === 'createInvoice'}
        onClose={closeModal}
        onSuccess={fetchAllData}
        accounts={accounts}
        addToast={addToast}
      />

      <RecordExpenseModal
        isOpen={activeModal === 'recordExpense'}
        onClose={closeModal}
        onSuccess={fetchAllData}
        accounts={accounts}
        addToast={addToast}
      />

      <ProcessPayoutModal
        isOpen={activeModal === 'processPayout'}
        onClose={closeModal}
        onSuccess={fetchAllData}
        accounts={accounts}
        addToast={addToast}
      />

      <ReconcileAccountModal
        isOpen={activeModal === 'reconcile'}
        onClose={closeModal}
        onSuccess={fetchAllData}
        accounts={accounts}
        addToast={addToast}
      />

      <TransferFundsModal
        isOpen={activeModal === 'transferFunds'}
        onClose={closeModal}
        onSuccess={fetchAllData}
        accounts={accounts}
        addToast={addToast}
      />

      <GenerateReportModal
        isOpen={activeModal === 'generateReport'}
        onClose={closeModal}
        accounts={accounts}
        addToast={addToast}
      />

      <ManageBudgetsModal
        isOpen={activeModal === 'manageBudgets'}
        onClose={closeModal}
        accounts={accounts}
        addToast={addToast}
      />

      <TaxSummaryModal
        isOpen={activeModal === 'taxSummary'}
        onClose={closeModal}
        accounts={accounts}
        addToast={addToast}
      />

      <FiscalCalendarModal
        isOpen={activeModal === 'calendar'}
        onClose={closeModal}
        accounts={accounts}
        addToast={addToast}
      />

      <NotificationCenterModal
        isOpen={activeModal === 'notifications'}
        onClose={closeModal}
        accounts={accounts}
        addToast={addToast}
      />

      <MessagingHubModal
        isOpen={activeModal === 'messages'}
        onClose={closeModal}
        accounts={accounts}
        addToast={addToast}
      />
    </div>
  );
};
export default FinanceDashboardPage;

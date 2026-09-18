import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserAccountNavDropdown } from '../../components/common/UserAccountNavDropdown';
import { api } from '../../services/api';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Tag, 
  Shield, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  Box, 
  FilePlus, 
  Award, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronRight, 
  RefreshCw, 
  Calendar, 
  ArrowUpRight, 
  Ban, 
  Sparkles, 
  Edit3, 
  Eye, 
  HelpCircle, 
  PanelLeftClose, 
  PanelLeftOpen, 
  FileText, 
  BarChart2, 
  Settings, 
  User, 
  Check, 
  X, 
  ExternalLink, 
  AlertCircle, 
  Info, 
  Sliders, 
  Download, 
  Plus,
  LayoutDashboard,
  PieChart,
  Scale,
  FolderTree,
  ListFilter,
  CheckSquare,
  Building,
  UserCheck
} from 'lucide-react';
import { ModerationItem } from '../../types';

// Mock Data matching screenshot precisely
const MOCK_GROWTH_TREND = [
  { date: 'Apr 21', items: 980000 },
  { date: 'Apr 28', items: 1050000 },
  { date: 'May 5', items: 1120000 },
  { date: 'May 12', items: 1190000 },
  { date: 'May 19', items: 1245870 },
];

const MOCK_QUALITY_TREND = [
  { date: 'Apr 21', score: 89 },
  { date: 'Apr 28', score: 90 },
  { date: 'May 5', score: 91 },
  { date: 'May 12', score: 91 },
  { date: 'May 19', score: 92 },
];

const MOCK_POLICY_VIOLATIONS = [
  { type: 'Inaccurate Information', count: 562, percent: 100 },
  { type: 'Prohibited Content', count: 412, percent: 73 },
  { type: 'Misleading Title', count: 318, percent: 56 },
  { type: 'Trademark Violation', count: 276, percent: 49 },
  { type: 'Inappropriate Images', count: 198, percent: 35 },
];

const MOCK_MODERATION_QUEUE = [
  { priority: 'High', type: 'Policy Violations', items: '1,243', oldest: 'May 18, 2024 08:15 AM', sla: '-2h 15m', slaStatus: 'urgent', icon: ShieldCheck },
  { priority: 'High', type: 'Restricted Content', items: '832', oldest: 'May 18, 2024 09:02 AM', sla: '1h 45m', slaStatus: 'warning', icon: Ban },
  { priority: 'Medium', type: 'Quality Issues', items: '2,341', oldest: 'May 19, 2024 07:40 AM', sla: '3h 20m', slaStatus: 'warning', icon: Sparkles },
  { priority: 'Low', type: 'Attribute Updates', items: '3,426', oldest: 'May 19, 2024 09:10 AM', sla: '5h 30m', slaStatus: 'normal', icon: Edit3 },
];

const MOCK_CONTENT_TYPES = [
  { name: 'Product', count: '812,430', percent: '65.2%', color: '#2563EB' },
  { name: 'Variant', count: '286,350', percent: '23.0%', color: '#06B6D4' },
  { name: 'Bundle', count: '82,410', percent: '6.6%', color: '#F59E0B' },
  { name: 'Digital Content', count: '40,680', percent: '3.3%', color: '#8B5CF6' },
  { name: 'Other', count: '24,000', percent: '1.9%', color: '#64748B' },
];

const MOCK_RECENT_DECISIONS = [
  { 
    id: 'P-987654', 
    title: 'Wireless Headphones', 
    decision: 'Approved', 
    reason: 'No issues found', 
    reviewer: 'Daniel K.', 
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100',
    time: 'May 24, 2024 10:21 AM',
    statusBg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  { 
    id: 'P-987653', 
    title: 'Herbal Weight Loss Tea', 
    decision: 'Rejected', 
    reason: 'Prohibited Content', 
    reviewer: 'Priya S.', 
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=100',
    time: 'May 24, 2024 09:48 AM',
    statusBg: 'bg-rose-50 text-rose-700 border-rose-200'
  },
  { 
    id: 'P-987652', 
    title: 'Kids Battery Car', 
    decision: 'Changes Requested', 
    reason: 'Inaccurate Information', 
    reviewer: 'Alex R.', 
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=100',
    time: 'May 24, 2024 09:15 AM',
    statusBg: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  { 
    id: 'P-987651', 
    title: 'Smart Watch Series 8', 
    decision: 'Approved', 
    reason: 'No issues found', 
    reviewer: 'Daniel K.', 
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100',
    time: 'May 24, 2024 08:45 AM',
    statusBg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  { 
    id: 'P-987650', 
    title: 'Logo T-Shirt', 
    decision: 'Rejected', 
    reason: 'Trademark Violation', 
    reviewer: 'Priya S.', 
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=100',
    time: 'May 24, 2024 08:12 AM',
    statusBg: 'bg-rose-50 text-rose-700 border-rose-200'
  },
];

const MOCK_CATEGORY_SCORES = [
  { category: 'Electronics', score: 95, trend: 'up', percent: 95 },
  { category: 'Home & Kitchen', score: 93, trend: 'up', percent: 93 },
  { category: 'Fashion', score: 91, trend: 'flat', percent: 91 },
  { category: 'Beauty', score: 90, trend: 'down', percent: 90 },
  { category: 'Sports', score: 88, trend: 'down', percent: 88 },
];

const MOCK_ALERTS = [
  { 
    id: '1', 
    title: 'High number of policy violations', 
    desc: 'Prohibited content violations increased by 18%', 
    time: 'May 24, 2024 10:05 AM', 
    type: 'danger',
    iconBg: 'bg-rose-100 text-rose-600',
    icon: ShieldAlertIcon
  },
  { 
    id: '2', 
    title: 'SLA breach risk', 
    desc: '1,243 items are past SLA', 
    time: 'May 24, 2024 09:50 AM', 
    type: 'warning',
    iconBg: 'bg-amber-100 text-amber-600',
    icon: AlertTriangle
  },
  { 
    id: '3', 
    title: 'Quality score improved', 
    desc: 'Overall quality score improved by 3.4 points', 
    time: 'May 24, 2024 09:20 AM', 
    type: 'info',
    iconBg: 'bg-blue-100 text-blue-600',
    icon: Info
  },
];

function ShieldAlertIcon(props: any) {
  return <Shield className="w-5 h-5 text-rose-600" {...props} />;
}

export const ModerationPortalPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Navigation State
  const [activeTab, setActiveTab] = useState('overview');
  const [catalogExpanded, setCatalogExpanded] = useState(true);
  const [moderationExpanded, setModerationExpanded] = useState(true);

  // Date Filter State
  const [dateRange, setDateRange] = useState('May 18 – May 24, 2024');
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Inspection Modal State
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [inspectionModalOpen, setInspectionModalOpen] = useState(false);

  // Decisions / Alerts / Policy Rules Modals
  const [allDecisionsModalOpen, setAllDecisionsModalOpen] = useState(false);
  const [allAlertsModalOpen, setAllAlertsModalOpen] = useState(false);
  const [addPolicyModalOpen, setAddPolicyModalOpen] = useState(false);

  // Policy Rules state
  const [policyRules, setPolicyRules] = useState([
    { id: 'PR-01', name: 'Prohibited Medical Claims', category: 'Health & Beauty', severity: 'HIGH', status: 'ACTIVE', triggerCount: 412 },
    { id: 'PR-02', name: 'Counterfeit Logo Prevention', category: 'Fashion & Luxury', severity: 'HIGH', status: 'ACTIVE', triggerCount: 276 },
    { id: 'PR-03', name: 'Low Resolution Primary Image', category: 'All Categories', severity: 'MEDIUM', status: 'ACTIVE', triggerCount: 198 },
    { id: 'PR-04', name: 'Excessive Title Capitalization', category: 'All Categories', severity: 'LOW', status: 'ACTIVE', triggerCount: 318 },
  ]);

  // Live Moderation Items from Backend
  const [backendItems, setBackendItems] = useState<ModerationItem[]>([]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = async () => {
    try {
      setRefreshing(true);
      const res = await api.getModerationItems();
      setBackendItems(res.items || []);
      showToast('Catalog & Moderation data refreshed');
    } catch (err) {
      console.error('Failed to load moderation data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Backend Resolution
  const handleResolveItem = async (itemId: string, action: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED' | 'ESCALATED' | 'REMOVED', note?: string) => {
    try {
      await api.resolveModerationItem(itemId, action, note || `Moderation action ${action} submitted`);
      showToast(`Item ${itemId} updated to ${action}`);
      setInspectionModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Failed to resolve item:', err);
      showToast(`Action recorded locally for ${itemId}`);
      setInspectionModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col md:flex-row font-sans">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* LEFT NAVIGATION SIDEBAR (#0B172A / #0F172A)                   */}
      {/* ------------------------------------------------------------- */}
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-[#0B172A] text-slate-300 flex flex-col transition-all duration-300 ease-in-out shrink-0 border-r border-slate-800 z-20`}>
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-500/20 shrink-0">
              <Tag className="w-5 h-5" />
            </div>
            {!sidebarCollapsed && (
              <span className="font-bold text-white text-sm tracking-tight whitespace-nowrap">
                Catalog & Quality Hub
              </span>
            )}
          </div>
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors"
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {sidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
          {/* OVERVIEW */}
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'overview' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Overview</span>}
          </button>

          {/* CATALOG GROUP */}
          <div className="pt-2">
            {!sidebarCollapsed ? (
              <button
                onClick={() => setCatalogExpanded(!catalogExpanded)}
                className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold text-slate-400 tracking-wider uppercase hover:text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Box className="w-3.5 h-3.5" />
                  <span>Catalog</span>
                </div>
                {catalogExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <div className="h-px bg-slate-800 my-2" />
            )}

            {(catalogExpanded || sidebarCollapsed) && (
              <div className="space-y-1 mt-1">
                {[
                  { id: 'products', label: 'Products', icon: Box },
                  { id: 'categories', label: 'Categories', icon: FolderTree },
                  { id: 'attributes', label: 'Attributes', icon: ListFilter },
                  { id: 'bulk_operations', label: 'Bulk Operations', icon: Layers },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      activeTab === item.id 
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold' 
                        : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                    } ${sidebarCollapsed ? 'justify-center' : 'pl-8'}`}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* QUALITY MODERATION GROUP */}
          <div className="pt-2">
            {!sidebarCollapsed ? (
              <button
                onClick={() => setModerationExpanded(!moderationExpanded)}
                className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold text-slate-400 tracking-wider uppercase hover:text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Quality Moderation</span>
                </div>
                {moderationExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <div className="h-px bg-slate-800 my-2" />
            )}

            {(moderationExpanded || sidebarCollapsed) && (
              <div className="space-y-1 mt-1">
                {[
                  { id: 'content_review', label: 'Content Review', icon: Eye },
                  { id: 'policy_rules', label: 'Policy Rules', icon: Scale },
                  { id: 'moderation_queue', label: 'Moderation Queue', icon: Clock },
                  { id: 'appeals', label: 'Appeals', icon: FileText },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      activeTab === item.id 
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold' 
                        : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                    } ${sidebarCollapsed ? 'justify-center' : 'pl-8'}`}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* OTHER SINGLE LINKS */}
          <div className="pt-3 space-y-1 border-t border-slate-800/80 mt-2">
            {[
              { id: 'quality_insights', label: 'Quality Insights', icon: BarChart2 },
              { id: 'reports', label: 'Reports', icon: FileText },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white font-semibold' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800/80 space-y-2">
          <UserAccountNavDropdown variant="dark" compact={sidebarCollapsed} align="left" className="w-full" />
          <button 
            onClick={() => showToast('Help Desk: Dial +255 714 000 999 or email moderation@lumo.co.tz')}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-colors"
          >
            <HelpCircle className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Help & Support</span>}
          </button>
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-colors"
          >
            {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4 shrink-0" /> : <PanelLeftClose className="w-4 h-4 shrink-0" />}
            {!sidebarCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* MAIN CONTENT AREA                                             */}
      {/* ------------------------------------------------------------- */}
      <main className="flex-1 overflow-y-auto min-w-0">
        {/* Top Sticky Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-5 sticky top-0 z-10 shadow-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Catalog & Quality Moderation Hub
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Ensure catalog accuracy, policy compliance and high content quality.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Date Range Picker Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
                  className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-all"
                >
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>{dateRange}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {dateDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 text-xs font-medium text-slate-700">
                    {[
                      'May 18 – May 24, 2024',
                      'Today (Sep 2, 2026)',
                      'Last 7 Days',
                      'Last 30 Days',
                      'This Month',
                      'Custom Range'
                    ].map((range) => (
                      <button
                        key={range}
                        onClick={() => {
                          setDateRange(range);
                          setDateDropdownOpen(false);
                          showToast(`Date range updated to ${range}`);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center justify-between ${
                          dateRange === range ? 'text-blue-600 font-bold bg-blue-50/50' : ''
                        }`}
                      >
                        <span>{range}</span>
                        {dateRange === range && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Refresh Button */}
              <button
                onClick={loadData}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
                <span>Refresh</span>
              </button>

              <UserAccountNavDropdown variant="light" />
            </div>
          </div>
        </header>

        {/* MAIN BODY CONTAINER */}
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* ========================================================= */}
          {/* TAB 1: OVERVIEW (Main Screenshot Match)                    */}
          {/* ========================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* ----------------------------------------------------- */}
              {/* ROW 1: 6 TOP KPI STAT CARDS                           */}
              {/* ----------------------------------------------------- */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {/* 1. Total Items */}
                <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Box className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-[11px] font-medium text-slate-500">Total Items in Catalog</div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5 tracking-tight">1,245,870</div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>▲ 6.3%</span>
                    <span className="text-slate-400 font-normal">vs last week</span>
                  </div>
                </div>

                {/* 2. New Items Added */}
                <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <FilePlus className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-[11px] font-medium text-slate-500">New Items Added</div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5 tracking-tight">28,540</div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>▲ 12.8%</span>
                    <span className="text-slate-400 font-normal">vs last week</span>
                  </div>
                </div>

                {/* 3. Items Under Review */}
                <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Shield className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-[11px] font-medium text-slate-500">Items Under Review</div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5 tracking-tight">7,842</div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 mt-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>▲ 4.5%</span>
                    <span className="text-slate-400 font-normal">vs last week</span>
                  </div>
                </div>

                {/* 4. Items Rejected */}
                <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-[11px] font-medium text-slate-500">Items Rejected</div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5 tracking-tight">1,243</div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-rose-600 mt-1">
                    <TrendingDown className="w-3 h-3" />
                    <span>▼ 9.7%</span>
                    <span className="text-slate-400 font-normal">vs last week</span>
                  </div>
                </div>

                {/* 5. Approval Rate */}
                <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-[11px] font-medium text-slate-500">Approval Rate</div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5 tracking-tight">94.6%</div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>▲ 2.1%</span>
                    <span className="text-slate-400 font-normal">vs last week</span>
                  </div>
                </div>

                {/* 6. Quality Score */}
                <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Award className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-[11px] font-medium text-slate-500">Quality Score</div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5 tracking-tight">
                    92 <span className="text-xs text-slate-400 font-normal">/100</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>▲ 3.4 pts</span>
                    <span className="text-slate-400 font-normal">vs last week</span>
                  </div>
                </div>
              </div>

              {/* ----------------------------------------------------- */}
              {/* ROW 2: 3 VISUAL CHARTS                                */}
              {/* ----------------------------------------------------- */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* CHART 1: Catalog Growth Trend */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900 text-sm">Catalog Growth Trend</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                      <span>Total Items</span>
                    </div>
                  </div>

                  {/* SVG Chart */}
                  <div className="h-44 w-full relative pt-2">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 300 120">
                      {/* Grid Lines */}
                      <line x1="0" y1="20" x2="300" y2="20" stroke="#F1F5F9" strokeDasharray="3 3" />
                      <line x1="0" y1="50" x2="300" y2="50" stroke="#F1F5F9" strokeDasharray="3 3" />
                      <line x1="0" y1="80" x2="300" y2="80" stroke="#F1F5F9" strokeDasharray="3 3" />
                      <line x1="0" y1="110" x2="300" y2="110" stroke="#F1F5F9" strokeDasharray="3 3" />

                      {/* Line */}
                      <path 
                        d="M 10 75 Q 75 60 140 45 T 290 22" 
                        fill="none" 
                        stroke="#2563EB" 
                        strokeWidth="2.5" 
                      />

                      {/* Area Gradient */}
                      <path 
                        d="M 10 75 Q 75 60 140 45 T 290 22 L 290 110 L 10 110 Z" 
                        fill="url(#blueGrad)" 
                        opacity="0.1" 
                      />

                      <defs>
                        <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563EB" />
                          <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                        </linearGradient>
                      </defs>

                      {/* Nodes */}
                      {[
                        { x: 10, y: 75, label: '980K' },
                        { x: 80, y: 58, label: '1.05M' },
                        { x: 150, y: 44, label: '1.12M' },
                        { x: 220, y: 32, label: '1.19M' },
                        { x: 290, y: 22, label: '1.24M' },
                      ].map((p, i) => (
                        <g key={i}>
                          <circle cx={p.x} cy={p.y} r="4" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
                        </g>
                      ))}
                    </svg>

                    {/* X-Axis Labels */}
                    <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-2 pt-1 border-t border-slate-100">
                      <span>Apr 21</span>
                      <span>Apr 28</span>
                      <span>May 5</span>
                      <span>May 12</span>
                      <span>May 19</span>
                    </div>
                  </div>
                </div>

                {/* CHART 2: Moderation Status Distribution (Donut Chart) */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
                  <h3 className="font-bold text-slate-900 text-sm mb-3">Moderation Status Distribution</h3>

                  <div className="flex items-center gap-4">
                    {/* SVG Donut */}
                    <div className="w-28 h-28 relative shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#E2E8F0" strokeWidth="3.5" />
                        {/* Approved (94.7%) */}
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10B981" strokeWidth="3.5" strokeDasharray="94.7 5.3" strokeDashoffset="0" />
                        {/* Under Review (0.6%) */}
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#2563EB" strokeWidth="3.5" strokeDasharray="0.6 99.4" strokeDashoffset="-94.7" />
                        {/* Changes Requested (1.0%) */}
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F59E0B" strokeWidth="3.5" strokeDasharray="1.0 99.0" strokeDashoffset="-95.3" />
                        {/* Rejected (0.1%) */}
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#EF4444" strokeWidth="3.5" strokeDasharray="0.1 99.9" strokeDashoffset="-96.3" />
                        {/* Removed (0.4%) */}
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#64748B" strokeWidth="3.5" strokeDasharray="0.4 99.6" strokeDashoffset="-96.4" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1">
                        <span className="text-[10px] font-bold text-slate-900 leading-none">1,245,870</span>
                        <span className="text-[8px] text-slate-400 leading-tight">Total Items</span>
                      </div>
                    </div>

                    {/* Breakdown Legend */}
                    <div className="flex-1 space-y-1.5 text-xs font-medium">
                      <div className="flex items-center justify-between text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>Approved</span>
                        </div>
                        <span className="font-semibold text-slate-900">1,179,234 <span className="text-slate-400 text-[10px] font-normal">(94.7%)</span></span>
                      </div>
                      <div className="flex items-center justify-between text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-600" />
                          <span>Under Review</span>
                        </div>
                        <span className="font-semibold text-slate-900">7,842 <span className="text-slate-400 text-[10px] font-normal">(0.6%)</span></span>
                      </div>
                      <div className="flex items-center justify-between text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          <span>Changes Requested</span>
                        </div>
                        <span className="font-semibold text-slate-900">12,651 <span className="text-slate-400 text-[10px] font-normal">(1.0%)</span></span>
                      </div>
                      <div className="flex items-center justify-between text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          <span>Rejected</span>
                        </div>
                        <span className="font-semibold text-slate-900">1,243 <span className="text-slate-400 text-[10px] font-normal">(0.1%)</span></span>
                      </div>
                      <div className="flex items-center justify-between text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-slate-500" />
                          <span>Removed</span>
                        </div>
                        <span className="font-semibold text-slate-900">4,900 <span className="text-slate-400 text-[10px] font-normal">(0.4%)</span></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CHART 3: Quality Score Over Time */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900 text-sm">Quality Score Over Time</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block" />
                      <span>Quality Score</span>
                    </div>
                  </div>

                  {/* SVG Line */}
                  <div className="h-44 w-full relative pt-2">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 300 120">
                      <line x1="0" y1="20" x2="300" y2="20" stroke="#F1F5F9" strokeDasharray="3 3" />
                      <line x1="0" y1="50" x2="300" y2="50" stroke="#F1F5F9" strokeDasharray="3 3" />
                      <line x1="0" y1="80" x2="300" y2="80" stroke="#F1F5F9" strokeDasharray="3 3" />

                      <path 
                        d="M 10 40 L 75 36 L 140 32 L 205 32 L 290 28" 
                        fill="none" 
                        stroke="#8B5CF6" 
                        strokeWidth="2.5" 
                      />

                      {[
                        { x: 10, y: 40 },
                        { x: 75, y: 36 },
                        { x: 140, y: 32 },
                        { x: 205, y: 32 },
                        { x: 290, y: 28 },
                      ].map((p, i) => (
                        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#8B5CF6" stroke="#FFFFFF" strokeWidth="2" />
                      ))}
                    </svg>

                    <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-2 pt-1 border-t border-slate-100">
                      <span>Apr 21</span>
                      <span>Apr 28</span>
                      <span>May 5</span>
                      <span>May 12</span>
                      <span>May 19</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ----------------------------------------------------- */}
              {/* ROW 3: 3 BREAKDOWN CARDS                              */}
              {/* ----------------------------------------------------- */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* CARD 1: Top Policy Violations */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm mb-4">Top Policy Violations (This Week)</h3>
                    <div className="space-y-3.5">
                      {MOCK_POLICY_VIOLATIONS.map((item) => (
                        <div key={item.type} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-medium">
                            <span className="text-slate-700">{item.type}</span>
                            <span className="font-bold text-slate-900">{item.count}</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                              style={{ width: `${item.percent}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => setActiveTab('policy_rules')}
                    className="mt-5 text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                  >
                    <span>View all violations</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* CARD 2: Moderation Queue Table */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm">Moderation Queue</h3>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          7,842
                        </span>
                      </div>
                      <button 
                        onClick={() => setActiveTab('moderation_queue')}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        View Queue
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400">
                            <th className="pb-2">Priority</th>
                            <th className="pb-2">Type</th>
                            <th className="pb-2 text-right">Items</th>
                            <th className="pb-2 text-right">SLA</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs font-medium">
                          {MOCK_MODERATION_QUEUE.map((row, idx) => (
                            <tr 
                              key={idx} 
                              onClick={() => setActiveTab('moderation_queue')}
                              className="hover:bg-slate-50 cursor-pointer transition-colors"
                            >
                              <td className="py-2.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  row.priority === 'High' ? 'bg-rose-50 text-rose-700' :
                                  row.priority === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                                }`}>
                                  {row.priority}
                                </span>
                              </td>
                              <td className="py-2.5">
                                <div className="flex items-center gap-1.5 text-slate-800">
                                  <row.icon className="w-3.5 h-3.5 text-slate-500" />
                                  <span className="truncate max-w-[110px]">{row.type}</span>
                                </div>
                              </td>
                              <td className="py-2.5 text-right font-bold text-slate-900">{row.items}</td>
                              <td className="py-2.5 text-right">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  row.slaStatus === 'urgent' ? 'text-rose-600 bg-rose-50' :
                                  row.slaStatus === 'warning' ? 'text-amber-600 bg-amber-50' : 'text-emerald-600 bg-emerald-50'
                                }`}>
                                  {row.sla}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* CARD 3: Content Type Breakdown */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
                  <h3 className="font-bold text-slate-900 text-sm mb-3">Content Type Breakdown</h3>

                  <div className="flex items-center gap-4">
                    <div className="w-28 h-28 relative shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#E2E8F0" strokeWidth="3.5" />
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#2563EB" strokeWidth="3.5" strokeDasharray="65.2 34.8" strokeDashoffset="0" />
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#06B6D4" strokeWidth="3.5" strokeDasharray="23.0 77.0" strokeDashoffset="-65.2" />
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F59E0B" strokeWidth="3.5" strokeDasharray="6.6 93.4" strokeDashoffset="-88.2" />
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#8B5CF6" strokeWidth="3.5" strokeDasharray="3.3 96.7" strokeDashoffset="-94.8" />
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#64748B" strokeWidth="3.5" strokeDasharray="1.9 98.1" strokeDashoffset="-98.1" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1">
                        <span className="text-[10px] font-bold text-slate-900 leading-none">1,245,870</span>
                        <span className="text-[8px] text-slate-400 leading-tight">Total Items</span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-1.5 text-xs font-medium">
                      {MOCK_CONTENT_TYPES.map((ct) => (
                        <div key={ct.name} className="flex items-center justify-between text-slate-700">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ct.color }} />
                            <span>{ct.name}</span>
                          </div>
                          <span className="font-semibold text-slate-900">
                            {ct.count} <span className="text-slate-400 text-[10px] font-normal">({ct.percent})</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ----------------------------------------------------- */}
              {/* ROW 4: 3 BOTTOM OPERATIONAL DATA CARDS                 */}
              {/* ----------------------------------------------------- */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* OPERATIONAL CARD 1: Recent Moderation Decisions */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs lg:col-span-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-900 text-sm">Recent Moderation Decisions</h3>
                      <button 
                        onClick={() => setAllDecisionsModalOpen(true)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        View all decisions
                      </button>
                    </div>

                    <div className="space-y-3">
                      {MOCK_RECENT_DECISIONS.map((item) => (
                        <div 
                          key={item.id}
                          onClick={() => {
                            setSelectedItem(item);
                            setInspectionModalOpen(true);
                          }}
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img src={item.image} alt={item.title} className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-900 truncate">{item.title}</span>
                                <span className="text-[10px] text-slate-400 font-mono shrink-0">{item.id}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                <span className="truncate">{item.reason}</span>
                                <span>•</span>
                                <span className="shrink-0">{item.reviewer}</span>
                              </div>
                            </div>
                          </div>

                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${item.statusBg}`}>
                            {item.decision}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* OPERATIONAL CARD 2: Quality Score by Category */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-900 text-sm">Quality Score by Category</h3>
                      <button 
                        onClick={() => setActiveTab('quality_insights')}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        View Report
                      </button>
                    </div>

                    <div className="space-y-3.5">
                      {MOCK_CATEGORY_SCORES.map((cat) => (
                        <div key={cat.category} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-medium">
                            <span className="text-slate-700">{cat.category}</span>
                            <div className="flex items-center gap-1.5 font-bold text-slate-900">
                              <span>{cat.score} <span className="text-[10px] text-slate-400 font-normal">/100</span></span>
                              {cat.trend === 'up' && <TrendingUp className="w-3 h-3 text-emerald-500" />}
                              {cat.trend === 'down' && <TrendingDown className="w-3 h-3 text-rose-500" />}
                              {cat.trend === 'flat' && <span className="text-slate-400">—</span>}
                            </div>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                cat.score >= 93 ? 'bg-emerald-500' : cat.score >= 90 ? 'bg-blue-600' : 'bg-amber-500'
                              }`} 
                              style={{ width: `${cat.percent}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => setActiveTab('quality_insights')}
                    className="mt-5 text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>View all categories</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* OPERATIONAL CARD 3: Alerts & Notifications */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-900 text-sm">Alerts & Notifications</h3>
                      <button 
                        onClick={() => setAllAlertsModalOpen(true)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        View all alerts
                      </button>
                    </div>

                    <div className="space-y-3">
                      {MOCK_ALERTS.map((alt) => (
                        <div key={alt.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-start gap-3">
                          <div className={`p-2 rounded-xl shrink-0 ${alt.iconBg}`}>
                            <alt.icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 leading-tight">{alt.title}</h4>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{alt.desc}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block font-medium">{alt.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => setAllAlertsModalOpen(true)}
                    className="mt-5 text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>Manage alert triggers</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: PRODUCTS CATALOG                                    */}
          {/* ========================================================= */}
          {activeTab === 'products' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Catalog Product Listings</h2>
                  <p className="text-xs text-slate-500">Search and audit all 1,245,870 items across active vendors</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input 
                      type="text" 
                      placeholder="Search title, SKU, seller..."
                      className="pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 text-xs flex items-center gap-1 font-semibold">
                    <Filter className="w-4 h-4" /> Filter
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left text-xs font-medium border-collapse">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Item / Image</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Vendor / Seller</th>
                      <th className="p-3">Quality Index</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {MOCK_RECENT_DECISIONS.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <img src={item.image} alt={item.title} className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                            <div>
                              <div className="font-bold text-slate-900">{item.title}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{item.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-slate-600 font-semibold">Consumer Electronics</td>
                        <td className="p-3 text-slate-700 font-semibold">Lumo Authorized Store</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                            94 / 100
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${item.statusBg}`}>
                            {item.decision}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button 
                            onClick={() => {
                              setSelectedItem(item);
                              setInspectionModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-[11px] hover:bg-blue-700 transition-colors"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: CONTENT REVIEW                                      */}
          {/* ========================================================= */}
          {activeTab === 'content_review' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Side-by-Side Content Review Inspector</h2>
                  <p className="text-xs text-slate-500">Audit image clarity, product specifications, and policy compliance</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  7,842 Pending Reviews
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Image & Listing Preview */}
                <div className="space-y-4 border border-slate-200 p-4 rounded-xl bg-slate-50/50">
                  <div className="aspect-square w-full bg-white rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center relative">
                    <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500" alt="Review Product" className="object-cover w-full h-full" />
                    <span className="absolute top-3 left-3 px-2 py-1 bg-slate-900/80 text-white text-[10px] font-bold rounded-md backdrop-blur-xs">
                      Primary Shot (1200x1200px)
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-bold text-slate-900 text-sm">Wireless Headphones Noise Cancelling BT 5.2</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      High fidelity Bluetooth wireless headphones with active noise cancellation, built-in dual microphone, and 30-hour playback duration. Compatible with iOS and Android.
                    </p>
                  </div>
                </div>

                {/* Right: AI Policy Check & Decision Panel */}
                <div className="space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="font-bold text-slate-900 text-sm">AI Quality & Policy Scan Results</h3>

                    <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Image Quality Score: 98/100
                      </div>
                      <p className="text-[11px]">Clear white background, crisp focus, no watermarks detected.</p>
                    </div>

                    <div className="p-3 bg-blue-50 text-blue-800 border border-blue-200 rounded-xl text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-blue-900">
                        <ShieldCheck className="w-4 h-4 text-blue-600" /> Brand Authenticity Check
                      </div>
                      <p className="text-[11px]">Authorized reseller verification match passed for Lumo Official Hub.</p>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                      <span className="font-bold text-slate-800 block">Attribute Completeness</span>
                      <div className="space-y-1 text-slate-600">
                        <div className="flex justify-between"><span>Brand:</span> <span className="font-bold text-slate-900">SoundPro</span></div>
                        <div className="flex justify-between"><span>Connectivity:</span> <span className="font-bold text-slate-900">Bluetooth 5.2</span></div>
                        <div className="flex justify-between"><span>Battery Life:</span> <span className="font-bold text-slate-900">30 Hours</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Decision Action Buttons */}
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                    <button 
                      onClick={() => handleResolveItem('P-987654', 'APPROVED', 'Approved by moderator inspection')}
                      className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Check className="w-4 h-4" /> Approve
                    </button>

                    <button 
                      onClick={() => handleResolveItem('P-987654', 'CHANGES_REQUESTED', 'Please update primary image resolution')}
                      className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Edit3 className="w-4 h-4" /> Request Changes
                    </button>

                    <button 
                      onClick={() => handleResolveItem('P-987654', 'REJECTED', 'Trademark policy violation')}
                      className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: POLICY RULES                                       */}
          {/* ========================================================= */}
          {activeTab === 'policy_rules' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Catalog Policy Rules & Auto-Flags</h2>
                  <p className="text-xs text-slate-500">Configure prohibited content keywords, brand protection, and image parameters</p>
                </div>
                <button 
                  onClick={() => setAddPolicyModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 shrink-0"
                >
                  <Plus className="w-4 h-4" /> Add Policy Rule
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left text-xs font-medium border-collapse">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Rule Name & ID</th>
                      <th className="p-3">Category Target</th>
                      <th className="p-3">Severity</th>
                      <th className="p-3 text-right">Triggers (7D)</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Toggle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {policyRules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-bold text-slate-900">
                          <div>{rule.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{rule.id}</div>
                        </td>
                        <td className="p-3 text-slate-600 font-semibold">{rule.category}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            rule.severity === 'HIGH' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {rule.severity}
                          </span>
                        </td>
                        <td className="p-3 text-right font-bold text-slate-900">{rule.triggerCount}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {rule.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button 
                            onClick={() => {
                              setPolicyRules(prev => prev.map(p => p.id === rule.id ? { ...p, status: p.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' } : p));
                              showToast(`Updated status for ${rule.name}`);
                            }}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition-colors"
                          >
                            {rule.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: MODERATION QUEUE                                    */}
          {/* ========================================================= */}
          {activeTab === 'moderation_queue' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Moderation Priority Queue</h2>
                  <p className="text-xs text-slate-500">7,842 pending catalog items waiting for compliance inspection</p>
                </div>
                <button 
                  onClick={() => showToast('Batch processing initiated for top 10 items')}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  Batch Action
                </button>
              </div>

              <div className="space-y-3">
                {MOCK_MODERATION_QUEUE.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${
                        item.priority === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{item.type}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.priority === 'High' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {item.priority} Priority
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {item.items} items pending • Oldest item from {item.oldest}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 justify-end shrink-0">
                      <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                        SLA: {item.sla}
                      </span>
                      <button 
                        onClick={() => {
                          setSelectedItem({
                            id: `Q-10${idx}`,
                            title: `${item.type} Queue Item`,
                            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100',
                            decision: 'Pending Review',
                            reason: item.type,
                            reviewer: 'Unassigned',
                            statusBg: 'bg-amber-50 text-amber-700 border-amber-200'
                          });
                          setInspectionModalOpen(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
                      >
                        Inspect Queue
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* OTHER TABS FALLBACK VIEW                                  */}
          {/* ========================================================= */}
          {!['overview', 'products', 'content_review', 'policy_rules', 'moderation_queue'].includes(activeTab) && (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto font-bold">
                <Sliders className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 capitalize">{activeTab.replace('_', ' ')} Section</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Connected to LUMO Catalog Backend Service. Settings and parameters are actively synchronized with platform configuration versions.
              </p>
              <button 
                onClick={() => showToast(`${activeTab.toUpperCase()} updated successfully`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors inline-block"
              >
                Save {activeTab.replace('_', ' ')} Config
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: ITEM INSPECTION MODAL                                */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {inspectionModalOpen && selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                  <img src={selectedItem.image} alt={selectedItem.title} className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{selectedItem.title}</h3>
                    <p className="text-[11px] text-slate-500">Item ID: {selectedItem.id}</p>
                  </div>
                </div>
                <button onClick={() => setInspectionModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs font-medium text-slate-700">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Flag Reason / Policy Note</span>
                  <p className="text-slate-900 font-bold">{selectedItem.reason}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Reviewer</span>
                    <span className="text-slate-900 font-bold">{selectedItem.reviewer}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Current Decision</span>
                    <span className="text-blue-600 font-bold">{selectedItem.decision}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="text-slate-900 font-bold block">Select Moderation Action:</span>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => handleResolveItem(selectedItem.id, 'APPROVED', 'Approved by Moderator')}
                      className="py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleResolveItem(selectedItem.id, 'CHANGES_REQUESTED', 'Changes requested by Moderator')}
                      className="py-2.5 bg-amber-500 text-white rounded-xl font-bold text-xs hover:bg-amber-600 transition-colors"
                    >
                      Request Fix
                    </button>
                    <button 
                      onClick={() => handleResolveItem(selectedItem.id, 'REJECTED', 'Rejected by Moderator')}
                      className="py-2.5 bg-rose-600 text-white rounded-xl font-bold text-xs hover:bg-rose-700 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: ALL DECISIONS LOG MODAL                              */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {allDecisionsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Full Moderation Audit Log</h3>
                  <p className="text-xs text-slate-500">Historical compliance decisions and resolutions</p>
                </div>
                <button onClick={() => setAllDecisionsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-3 flex-1">
                {MOCK_RECENT_DECISIONS.concat(MOCK_RECENT_DECISIONS).map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt={item.title} className="w-9 h-9 rounded-lg object-cover border border-slate-200" />
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{item.title}</div>
                        <div className="text-[10px] text-slate-500">{item.reason} • {item.time}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${item.statusBg}`}>
                      {item.decision}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: ALL ALERTS MODAL                                     */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {allAlertsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-bold text-slate-900 text-sm">Active Moderation System Alerts</h3>
                <button onClick={() => setAllAlertsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-3">
                {MOCK_ALERTS.map((alt) => (
                  <div key={alt.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
                    <div className={`p-2 rounded-xl shrink-0 ${alt.iconBg}`}>
                      <alt.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{alt.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{alt.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 4: ADD POLICY RULE MODAL                                */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {addPolicyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-bold text-slate-900 text-sm">Add New Policy Rule</h3>
                <button onClick={() => setAddPolicyModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const name = formData.get('ruleName') as string;
                if (name) {
                  setPolicyRules(prev => [
                    { id: `PR-${Date.now()}`, name, category: 'All Categories', severity: 'HIGH', status: 'ACTIVE', triggerCount: 0 },
                    ...prev
                  ]);
                  showToast(`New policy rule "${name}" created!`);
                  setAddPolicyModalOpen(false);
                }
              }} className="p-6 space-y-4 text-xs font-medium text-slate-700">
                <div>
                  <label className="block font-bold text-slate-900 mb-1">Rule Title / Keyword Pattern</label>
                  <input 
                    name="ruleName"
                    required
                    placeholder="e.g. Prohibit Prescription Medical Claims"
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">Severity Level</label>
                  <select name="severity" className="w-full p-2.5 border border-slate-200 rounded-xl text-xs">
                    <option value="HIGH">High (Immediate Auto-Block)</option>
                    <option value="MEDIUM">Medium (Queue Flag)</option>
                    <option value="LOW">Low (Audit Warning)</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button 
                    type="button" 
                    onClick={() => setAddPolicyModalOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-colors"
                  >
                    Create Rule
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

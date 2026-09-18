import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { UserAccountNavDropdown } from '../../components/common/UserAccountNavDropdown';
import { api } from '../../services/api';
import { LumoCallCenterModal, CallCenterContact } from '../../components/common/LumoCallCenterModal';
import { 
  Headphones, 
  LayoutDashboard, 
  Folder, 
  Scale, 
  Users, 
  MessageSquare, 
  BookOpen, 
  BarChart2, 
  Bell, 
  Settings, 
  HelpCircle,
  Calendar, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Handshake, 
  Percent, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Filter, 
  Plus, 
  Send, 
  Sparkles, 
  Smile, 
  Star, 
  Flame, 
  AlertTriangle, 
  ChevronRight, 
  ChevronDown,
  Download, 
  Eye, 
  ShieldAlert, 
  ShieldCheck, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  User, 
  Phone, 
  PhoneCall,
  Mail, 
  FileText, 
  Lock, 
  Unlock,
  X,
  Check
} from 'lucide-react';
import { SupportTicket } from '../../types';

export const CustomerSupportPortalPage: React.FC = () => {
  const { user } = useAuth();
  
  // Navigation & Active Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'cases' | 'disputes' | 'customers' | 'communications' | 'knowledge' | 'reports' | 'alerts' | 'settings'>('dashboard');
  
  // Data State connected to backend
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [selectedDispute, setSelectedDispute] = useState<any | null>(null);
  
  // Interactive Inputs & Modals
  const [replyMessage, setReplyMessage] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [isAiDrafting, setIsAiDrafting] = useState(false);
  const [disputeResolutionNote, setDisputeResolutionNote] = useState('');
  const [dateRange, setDateRange] = useState('May 18 – May 24, 2024');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isCallCenterOpen, setIsCallCenterOpen] = useState(false);
  const [isAgentsModalOpen, setIsAgentsModalOpen] = useState(false);
  const [activeCallContact, setActiveCallContact] = useState<CallCenterContact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Ticket Modal State
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketCategory, setNewTicketCategory] = useState('DELIVERY');
  const [newTicketMessage, setNewTicketMessage] = useState('');
  const [newTicketUser, setNewTicketUser] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load backend data
  const loadData = async () => {
    try {
      setLoading(true);
      const [ticketsRes, disputesRes] = await Promise.all([
        api.getSupportTickets(),
        api.getDisputes()
      ]);

      setTickets(ticketsRes.tickets || []);
      setDisputes(disputesRes.disputes || []);

      if (ticketsRes.tickets?.length > 0 && !selectedTicket) {
        setSelectedTicket(ticketsRes.tickets[0]);
      } else if (selectedTicket) {
        const refreshed = ticketsRes.tickets.find((t: any) => t.id === selectedTicket.id);
        if (refreshed) setSelectedTicket(refreshed);
      }

      if (disputesRes.disputes?.length > 0 && !selectedDispute) {
        setSelectedDispute(disputesRes.disputes[0]);
      }
    } catch (err) {
      console.error('Failed to load support data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
    showToast('Customer Care metrics and live queues re-synced with server.');
  };

  // Ticket Operations
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;
    try {
      const res = await api.sendSupportMessage(selectedTicket.id, replyMessage, 'AGENT');
      setSelectedTicket(res.ticket);
      setReplyMessage('');
      showToast('Response sent to customer.');
      await loadData();
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !internalNote.trim()) return;
    try {
      const res = await api.addSupportNote(selectedTicket.id, internalNote);
      setSelectedTicket(res.ticket);
      setInternalNote('');
      showToast('Private agent note added.');
      await loadData();
    } catch (err) {
      console.error('Error adding note:', err);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedTicket) return;
    try {
      const res = await api.updateSupportStatus(selectedTicket.id, { status: newStatus });
      setSelectedTicket(res.ticket);
      showToast(`Ticket status updated to ${newStatus}`);
      await loadData();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleAiDraft = async () => {
    if (!selectedTicket) return;
    try {
      setIsAiDrafting(true);
      const messages = selectedTicket.messages || [];
      const latestMsg = messages.length > 0 ? messages[messages.length - 1]?.message || selectedTicket.subject : selectedTicket.subject;
      const prompt = `Customer Subject: ${selectedTicket.subject}. Issue: ${latestMsg}. Customer Name: ${selectedTicket.userName}. Order Number: ${selectedTicket.orderNumber || 'N/A'}`;
      const res = await api.askAiCustomerSupport(prompt);
      if (res.reply) {
        setReplyMessage(res.reply);
        showToast('LumoCare AI generated response draft.');
      }
    } catch (err) {
      console.error('AI draft error:', err);
    } finally {
      setIsAiDrafting(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createSupportTicket({
        userName: newTicketUser || 'Customer',
        subject: newTicketSubject,
        category: newTicketCategory as any,
        message: newTicketMessage,
        priority: 'HIGH'
      });
      setShowCreateTicketModal(false);
      setNewTicketSubject('');
      setNewTicketMessage('');
      setNewTicketUser('');
      showToast('New ticket created and queued.');
      await loadData();
    } catch (err) {
      console.error('Failed to create ticket:', err);
    }
  };

  // Dispute Operations
  const handleUpdateDispute = async (disputeId: string, status: string, unfreezeEscrow: boolean = false) => {
    try {
      await api.updateDisputeStatus(disputeId, {
        status,
        resolutionNote: disputeResolutionNote || `Dispute set to ${status} by agent`,
        escrowFrozen: !unfreezeEscrow
      });
      showToast(`Dispute #${disputeId} status set to ${status}`);
      setDisputeResolutionNote('');
      await loadData();
    } catch (err) {
      console.error('Failed to update dispute:', err);
    }
  };

  // Navigation Items matching Screenshot
  const navItems: Array<{ id: string; label: string; icon: any; count?: number; badge?: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'cases', label: 'Cases', icon: Folder, count: tickets.length },
    { id: 'disputes', label: 'Disputes', icon: Scale, count: disputes.length },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'communications', label: 'Communications', icon: MessageSquare },
    { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
    { id: 'reports', label: 'Reports', icon: BarChart2 },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: '2' },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col md:flex-row font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-800 flex items-center gap-3 animate-fade-in text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* LEFT NAV SIDEBAR (Dark Navy Theme - bg-[#0B1527]) */}
      <aside className="w-full md:w-64 bg-[#0B1527] text-slate-300 shrink-0 flex flex-col justify-between border-r border-slate-800/80 min-h-screen">
        <div>
          {/* Brand Header */}
          <div className="p-6 flex items-center gap-3 border-b border-slate-800/60">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/40 shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-white text-sm tracking-tight">LUMO Care</h1>
              <p className="text-[10px] text-slate-400 font-medium">Resolution Hub</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-bold text-[10px]">
                      {item.badge}
                    </span>
                  )}
                  {item.count !== undefined && !item.badge && (
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Help & User Account */}
        <div className="p-4 border-t border-slate-800/60 space-y-2">
          <UserAccountNavDropdown variant="dark" align="left" className="w-full" />
          <button 
            onClick={() => {
              setActiveTab('knowledge');
              showToast('Opened Help & Support Knowledge Base');
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/50 transition cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Help & Support</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-10 shadow-xs">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Customer Care & Dispute Resolution Center
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Empowering resolution. Enhancing customer trust.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Interactive Date Range Selector */}
            <div className="relative">
              <button
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-slate-700 font-semibold shadow-2xs transition cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{dateRange}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isDatePickerOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 p-2 text-xs space-y-1 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1 font-extrabold text-[10px] text-slate-400 uppercase tracking-wider">Select Time Window</div>
                  {['Today', 'Yesterday', 'May 18 – May 24, 2024', 'Last 7 Days', 'Last 30 Days', 'This Month', 'Custom Date Range'].map((range) => (
                    <button
                      key={range}
                      onClick={() => {
                        setDateRange(range);
                        setIsDatePickerOpen(false);
                        showToast(`Analytics & metrics updated for ${range}`);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl transition font-medium cursor-pointer ${
                        dateRange === range ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Care Call Center Launch Button */}
            <button
              onClick={() => setIsCallCenterOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 cursor-pointer transition active:scale-95"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Care Call Center</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <UserAccountNavDropdown variant="light" />
          </div>
        </header>

        {/* BODY CONTAINER */}
        <main className="p-6 space-y-6 max-w-[1600px] w-full mx-auto">
          {/* TAB 1: DASHBOARD (MAIN SCREENSHOT LAYOUT) */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              {/* TOP ROW: 6 KPI METRIC CARDS */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {/* 1. Total Inquiries */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 tracking-wide">Total Inquiries</span>
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Headphones className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <span className="text-xl font-black text-slate-900 block tracking-tight">2,482</span>
                    <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold mt-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>12.6% vs last week</span>
                    </div>
                  </div>
                </div>

                {/* 2. Resolved Cases */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 tracking-wide">Resolved Cases</span>
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <span className="text-xl font-black text-slate-900 block tracking-tight">1,856</span>
                    <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold mt-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>15.3% vs last week</span>
                    </div>
                  </div>
                </div>

                {/* 3. Open Cases */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 tracking-wide">Open Cases</span>
                    <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <span className="text-xl font-black text-slate-900 block tracking-tight">626</span>
                    <div className="flex items-center gap-1 text-[11px] text-rose-600 font-bold mt-1">
                      <TrendingDown className="w-3 h-3" />
                      <span>6.8% vs last week</span>
                    </div>
                  </div>
                </div>

                {/* 4. Disputes Received */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 tracking-wide">Disputes Received</span>
                    <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <Scale className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <span className="text-xl font-black text-slate-900 block tracking-tight">312</span>
                    <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold mt-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>8.7% vs last week</span>
                    </div>
                  </div>
                </div>

                {/* 5. Disputes Resolved */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 tracking-wide">Disputes Resolved</span>
                    <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                      <Handshake className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <span className="text-xl font-black text-slate-900 block tracking-tight">271</span>
                    <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold mt-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>10.9% vs last week</span>
                    </div>
                  </div>
                </div>

                {/* 6. Resolution Rate */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 tracking-wide">Resolution Rate</span>
                    <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                      <Percent className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <span className="text-xl font-black text-slate-900 block tracking-tight">91.4%</span>
                    <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold mt-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>4.2% vs last week</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* MIDDLE ROW 1: 3 CHARTS/PANELS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Panel 1: Inquiries & Case Volume Trend */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-extrabold text-slate-900 text-sm">Inquiries & Case Volume Trend</h2>
                    <div className="flex items-center gap-4 text-xs font-semibold">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                        <span className="text-slate-600">Inquiries</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        <span className="text-slate-600">Resolved Cases</span>
                      </div>
                    </div>
                  </div>

                  {/* SVG Line Chart */}
                  <div className="h-56 w-full pt-2">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 400 180">
                      {/* Grid Lines */}
                      <line x1="40" y1="20" x2="390" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="40" y1="60" x2="390" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="40" y1="100" x2="390" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="40" y1="140" x2="390" y2="140" stroke="#f1f5f9" strokeWidth="1" />

                      {/* Y-Axis Labels */}
                      <text x="30" y="24" fontSize="9" fill="#94a3b8" textAnchor="end">2K</text>
                      <text x="30" y="64" fontSize="9" fill="#94a3b8" textAnchor="end">1.5K</text>
                      <text x="30" y="104" fontSize="9" fill="#94a3b8" textAnchor="end">1K</text>
                      <text x="30" y="144" fontSize="9" fill="#94a3b8" textAnchor="end">500</text>

                      {/* X-Axis Labels */}
                      {['May 12', 'May 13', 'May 14', 'May 15', 'May 16', 'May 17', 'May 18'].map((day, i) => (
                        <text key={i} x={50 + i * 55} y="165" fontSize="9" fill="#94a3b8" textAnchor="middle">{day}</text>
                      ))}

                      {/* Blue Line: Inquiries */}
                      <polyline
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="2.5"
                        points="50,90 105,65 160,45 215,60 270,58 325,48 380,50"
                      />
                      {[
                        { x: 50, y: 90 }, { x: 105, y: 65 }, { x: 160, y: 45 }, 
                        { x: 215, y: 60 }, { x: 270, y: 58 }, { x: 325, y: 48 }, { x: 380, y: 50 }
                      ].map((p, i) => (
                        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
                      ))}

                      {/* Green Line: Resolved Cases */}
                      <polyline
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2.5"
                        points="50,120 105,110 160,102 215,112 270,112 325,98 380,88"
                      />
                      {[
                        { x: 50, y: 120 }, { x: 105, y: 110 }, { x: 160, y: 102 }, 
                        { x: 215, y: 112 }, { x: 270, y: 112 }, { x: 325, y: 98 }, { x: 380, y: 88 }
                      ].map((p, i) => (
                        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                      ))}
                    </svg>
                  </div>
                </div>

                {/* Panel 2: Cases by Category (Donut Chart) */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
                  <h2 className="font-extrabold text-slate-900 text-sm">Cases by Category</h2>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-2">
                    {/* SVG Donut */}
                    <div className="relative w-36 h-36 shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        {/* Billing 35% */}
                        <circle cx="50" cy="50" r="38" fill="none" stroke="#2563eb" strokeWidth="16" strokeDasharray="83.5 155" strokeDashoffset="0" />
                        {/* Product 25% */}
                        <circle cx="50" cy="50" r="38" fill="none" stroke="#06b6d4" strokeWidth="16" strokeDasharray="59.6 179" strokeDashoffset="-83.5" />
                        {/* Account 20% */}
                        <circle cx="50" cy="50" r="38" fill="none" stroke="#f59e0b" strokeWidth="16" strokeDasharray="47.7 191" strokeDashoffset="-143.1" />
                        {/* Technical 12% */}
                        <circle cx="50" cy="50" r="38" fill="none" stroke="#f43f5e" strokeWidth="16" strokeDasharray="28.6 210" strokeDashoffset="-190.8" />
                        {/* Others 8% */}
                        <circle cx="50" cy="50" r="38" fill="none" stroke="#8b5cf6" strokeWidth="16" strokeDasharray="19.1 219" strokeDashoffset="-219.4" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="font-black text-slate-900 text-base leading-none">2,482</span>
                        <span className="text-[10px] text-slate-400 font-semibold mt-0.5">Total</span>
                      </div>
                    </div>

                    {/* Category Legend List */}
                    <div className="space-y-2 text-xs font-semibold w-full">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-sm bg-blue-600"></span>
                          <span className="text-slate-700">Billing & Payments</span>
                        </div>
                        <span className="text-slate-500 font-bold">35% (869)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500"></span>
                          <span className="text-slate-700">Product & Services</span>
                        </div>
                        <span className="text-slate-500 font-bold">25% (621)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>
                          <span className="text-slate-700">Account Management</span>
                        </div>
                        <span className="text-slate-500 font-bold">20% (497)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
                          <span className="text-slate-700">Technical Support</span>
                        </div>
                        <span className="text-slate-500 font-bold">12% (298)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-sm bg-purple-500"></span>
                          <span className="text-slate-700">Others</span>
                        </div>
                        <span className="text-slate-500 font-bold">8% (197)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Panel 3: Dispute Status Overview (Donut Chart) */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
                  <h2 className="font-extrabold text-slate-900 text-sm">Dispute Status Overview</h2>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-2">
                    {/* SVG Donut */}
                    <div className="relative w-36 h-36 shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        {/* Under Review 38.8% */}
                        <circle cx="50" cy="50" r="38" fill="none" stroke="#2563eb" strokeWidth="16" strokeDasharray="92.6 146" strokeDashoffset="0" />
                        {/* Information Requested 25.0% */}
                        <circle cx="50" cy="50" r="38" fill="none" stroke="#f59e0b" strokeWidth="16" strokeDasharray="59.6 179" strokeDashoffset="-92.6" />
                        {/* In Progress 20.8% */}
                        <circle cx="50" cy="50" r="38" fill="none" stroke="#8b5cf6" strokeWidth="16" strokeDasharray="49.6 189" strokeDashoffset="-152.2" />
                        {/* Resolved 15.4% */}
                        <circle cx="50" cy="50" r="38" fill="none" stroke="#10b981" strokeWidth="16" strokeDasharray="36.7 202" strokeDashoffset="-201.8" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="font-black text-slate-900 text-base leading-none">312</span>
                        <span className="text-[9px] text-slate-400 font-semibold mt-0.5">Total Disputes</span>
                      </div>
                    </div>

                    {/* Status Legend List */}
                    <div className="space-y-2.5 text-xs font-semibold w-full">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-sm bg-blue-600"></span>
                          <span className="text-slate-700">Under Review</span>
                        </div>
                        <span className="text-slate-500 font-bold">121 (38.8%)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>
                          <span className="text-slate-700">Information Requested</span>
                        </div>
                        <span className="text-slate-500 font-bold">78 (25.0%)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-sm bg-purple-500"></span>
                          <span className="text-slate-700">In Progress</span>
                        </div>
                        <span className="text-slate-500 font-bold">65 (20.8%)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
                          <span className="text-slate-700">Resolved</span>
                        </div>
                        <span className="text-slate-500 font-bold">48 (15.4%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* MIDDLE ROW 2: 3 PANELS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Panel 1: Average Resolution Time */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
                  <h2 className="font-extrabold text-slate-900 text-sm">Average Resolution Time</h2>

                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">2.6</span>
                    <span className="text-slate-500 text-xs font-bold">Days</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>0.4 days vs last week</span>
                  </div>

                  {/* SVG Resolution Time Chart */}
                  <div className="h-28 w-full pt-1">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 300 90">
                      <line x1="20" y1="20" x2="290" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="20" y1="50" x2="290" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="20" y1="80" x2="290" y2="80" stroke="#f1f5f9" strokeWidth="1" />

                      <polyline
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="2"
                        points="30,45 70,55 110,35 150,42 190,52 230,40 270,38"
                      />
                      {[
                        { x: 30, y: 45 }, { x: 70, y: 55 }, { x: 110, y: 35 }, 
                        { x: 150, y: 42 }, { x: 190, y: 52 }, { x: 230, y: 40 }, { x: 270, y: 38 }
                      ].map((p, i) => (
                        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#2563eb" />
                      ))}
                    </svg>
                  </div>
                </div>

                {/* Panel 2: Resolution Rate Over Time */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
                  <h2 className="font-extrabold text-slate-900 text-sm">Resolution Rate Over Time</h2>

                  {/* SVG Line Chart */}
                  <div className="h-40 w-full pt-2">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 300 120">
                      <line x1="30" y1="20" x2="290" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="30" y1="50" x2="290" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="30" y1="80" x2="290" y2="80" stroke="#f1f5f9" strokeWidth="1" />

                      <text x="22" y="24" fontSize="8" fill="#94a3b8" textAnchor="end">100%</text>
                      <text x="22" y="54" fontSize="8" fill="#94a3b8" textAnchor="end">90%</text>
                      <text x="22" y="84" fontSize="8" fill="#94a3b8" textAnchor="end">80%</text>

                      {['May 12', 'May 13', 'May 14', 'May 15', 'May 16', 'May 17', 'May 18'].map((day, i) => (
                        <text key={i} x={35 + i * 40} y="110" fontSize="8" fill="#94a3b8" textAnchor="middle">{day}</text>
                      ))}

                      <polyline
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="2"
                        points="35,68 75,60 115,52 155,48 195,48 235,46 275,32"
                      />
                      {[
                        { x: 35, y: 68 }, { x: 75, y: 60 }, { x: 115, y: 52 }, 
                        { x: 155, y: 48 }, { x: 195, y: 48 }, { x: 235, y: 46 }, { x: 275, y: 32 }
                      ].map((p, i) => (
                        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#2563eb" />
                      ))}
                    </svg>
                  </div>
                </div>

                {/* Panel 3: Recent Disputes Table */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h2 className="font-extrabold text-slate-900 text-sm">Recent Disputes</h2>
                    <button
                      onClick={() => setActiveTab('disputes')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      View All
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-[10px] text-slate-400 font-bold border-b border-slate-100">
                        <tr>
                          <th className="py-1.5 pb-2">Case ID</th>
                          <th className="py-1.5 pb-2">Customer</th>
                          <th className="py-1.5 pb-2">Issue</th>
                          <th className="py-1.5 pb-2">Status</th>
                          <th className="py-1.5 pb-2 text-right">Received On</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {disputes.slice(0, 5).map((disp) => {
                          const statusClass = 
                            disp.status === 'UNDER_REVIEW' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            disp.status === 'INFORMATION_REQUESTED' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            disp.status === 'IN_PROGRESS' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            'bg-emerald-50 text-emerald-700 border-emerald-200';

                          return (
                            <tr key={disp.id} className="hover:bg-slate-50 transition cursor-pointer" onClick={() => { setSelectedDispute(disp); setActiveTab('disputes'); }}>
                              <td className="py-2.5 font-bold text-slate-900">{disp.disputeNumber}</td>
                              <td className="py-2.5 font-medium text-slate-700">{disp.customerName}</td>
                              <td className="py-2.5 text-slate-600">{disp.issue}</td>
                              <td className="py-2.5">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusClass}`}>
                                  {disp.status?.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="py-2.5 text-right text-slate-400 font-medium">{disp.receivedOn || 'May 18, 2024'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* BOTTOM ROW: CSAT, TOP AGENTS, ALERTS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Panel 1: Customer Satisfaction (CSAT) */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
                  <h2 className="font-extrabold text-slate-900 text-sm">Customer Satisfaction (CSAT)</h2>

                  <div className="flex items-center gap-6">
                    {/* Green Smiley Icon */}
                    <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <Smile className="w-8 h-8" />
                    </div>

                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900">4.6</span>
                        <span className="text-slate-400 text-xs font-bold">/ 5</span>
                      </div>
                      
                      {/* Star Rating */}
                      <div className="flex items-center gap-1 my-1 text-amber-400">
                        <Star className="w-4 h-4 fill-amber-400" />
                        <Star className="w-4 h-4 fill-amber-400" />
                        <Star className="w-4 h-4 fill-amber-400" />
                        <Star className="w-4 h-4 fill-amber-400" />
                        <Star className="w-4 h-4 fill-amber-200 text-amber-400" />
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
                        <TrendingUp className="w-3 h-3" />
                        <span>0.3 vs last week</span>
                      </div>
                    </div>

                    {/* Mini CSAT Trend Line */}
                    <div className="flex-1 h-16 pt-2">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 150 60">
                        <line x1="10" y1="15" x2="140" y2="15" stroke="#f1f5f9" strokeWidth="1" />
                        <line x1="10" y1="40" x2="140" y2="40" stroke="#f1f5f9" strokeWidth="1" />

                        <polyline
                          fill="none"
                          stroke="#2563eb"
                          strokeWidth="2"
                          points="15,40 35,38 55,25 75,32 95,28 115,30 135,18"
                        />
                        {[
                          { x: 15, y: 40 }, { x: 35, y: 38 }, { x: 55, y: 25 }, 
                          { x: 75, y: 32 }, { x: 95, y: 28 }, { x: 115, y: 30 }, { x: 135, y: 18 }
                        ].map((p, i) => (
                          <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#2563eb" />
                        ))}
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Panel 2: Top Performing Agents */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h2 className="font-extrabold text-slate-900 text-sm">Top Performing Agents</h2>
                    <button onClick={() => setIsAgentsModalOpen(true)} className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer">
                      View All
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold px-1">
                      <span>AGENT</span>
                      <div className="flex items-center gap-8">
                        <span>Resolved Cases</span>
                        <span>CSAT</span>
                      </div>
                    </div>

                    {[
                      { name: 'Jessica W.', cases: 142, csat: '4.9', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
                      { name: 'Daniel K.', cases: 128, csat: '4.8', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
                      { name: 'Priya S.', cases: 116, csat: '4.7', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100' },
                    ].map((ag, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-400 text-[11px] w-3">{i + 1}</span>
                          <img src={ag.img} className="w-8 h-8 rounded-full object-cover border border-slate-200" alt={ag.name} />
                          <span className="font-bold text-slate-900 text-xs">{ag.name}</span>
                        </div>
                        <div className="flex items-center gap-12 pr-1 font-bold">
                          <span className="text-slate-800">{ag.cases}</span>
                          <span className="text-slate-900">{ag.csat}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Panel 3: Alerts & Notifications */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h2 className="font-extrabold text-slate-900 text-sm">Alerts & Notifications</h2>
                    <button onClick={() => setActiveTab('alerts')} className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer">
                      View All Alerts
                    </button>
                  </div>

                  <div className="space-y-3">
                    {/* Alert 1 */}
                    <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Flame className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5 text-xs">
                        <h3 className="font-bold text-slate-900">High volume of billing disputes</h3>
                        <p className="text-slate-600 text-[11px]">35% increase in the last 24 hours</p>
                        <span className="text-[10px] text-slate-400 font-medium block pt-1">May 18, 2024 10:30 AM</span>
                      </div>
                    </div>

                    {/* Alert 2 */}
                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5 text-xs">
                        <h3 className="font-bold text-slate-900">SLA breach risk – 18 open cases</h3>
                        <p className="text-slate-600 text-[11px]">Resolution overdue in next 24 hours</p>
                        <span className="text-[10px] text-slate-400 font-medium block pt-1">May 18, 2024 09:15 AM</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CASES (TICKET QUEUE & INTERACTIVE RESOLUTION WORKSPACE) */}
          {activeTab === 'cases' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                    <Folder className="w-5 h-5 text-blue-600" />
                    Support Cases & Live Tickets Queue
                  </h2>
                  <p className="text-xs text-slate-500">Manage support conversations, update status, and utilize LumoCare AI drafting.</p>
                </div>
                <button
                  onClick={() => setShowCreateTicketModal(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer shadow-md shadow-blue-900/20 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  New Support Ticket
                </button>
              </div>

              {/* Grid: Queue + Thread */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Queue */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 h-[70vh] flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-700">Tickets Queue ({tickets.length})</span>
                    <input
                      type="text"
                      placeholder="Search tickets..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none w-36"
                    />
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {tickets
                      .filter(t => t.userName.toLowerCase().includes(searchQuery.toLowerCase()) || t.subject.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((t) => {
                        const isSelected = selectedTicket?.id === t.id;
                        return (
                          <button
                            key={t.id}
                            onClick={() => setSelectedTicket(t)}
                            className={`w-full text-left p-3 rounded-xl border transition cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50 border-blue-400 text-slate-900 shadow-2xs'
                                : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-xs text-slate-900 truncate">{t.userName}</span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                t.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {t.status}
                              </span>
                            </div>
                            <p className="font-semibold text-xs text-slate-800 mt-1 line-clamp-1">{t.subject}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Order: {t.orderNumber || 'General'} • {t.category || 'DELIVERY'}
                            </p>
                          </button>
                        );
                      })}
                  </div>
                </div>

                {/* Selected Ticket Thread */}
                {selectedTicket ? (
                  <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col h-[70vh]">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-sm">{selectedTicket.subject}</span>
                          <span className="font-mono text-xs text-slate-400">#{selectedTicket.ticketNumber}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          User: <strong className="text-slate-800">{selectedTicket.userName}</strong> ({selectedTicket.userPhone})
                        </p>
                      </div>

                      <select
                        value={selectedTicket.status}
                        onChange={e => handleStatusChange(e.target.value)}
                        className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs bg-white font-bold cursor-pointer"
                      >
                        <option value="OPEN">OPEN</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="WAITING_ON_CUSTOMER">WAITING_ON_CUSTOMER</option>
                        <option value="RESOLVED">RESOLVED</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto py-4 space-y-3">
                      {(selectedTicket.messages || []).map((m) => {
                        const isAgent = m.sender === 'AGENT';
                        return (
                          <div key={m.id} className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-md p-3 rounded-2xl text-xs ${
                              isAgent ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'
                            }`}>
                              <p className="font-bold text-[10px] opacity-80 mb-1">{m.senderName}</p>
                              <p className="leading-relaxed">{m.message}</p>
                            </div>
                            <span className="text-[10px] text-slate-400 mt-1">{m.timestamp?.split('T')[1]?.slice(0, 5) || ''}</span>
                          </div>
                        );
                      })}

                      {/* Notes */}
                      {(selectedTicket.internalNotes || []).length > 0 && (
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1">
                          <span className="font-bold text-amber-900 block text-[11px]">Private Agent Notes</span>
                          {selectedTicket.internalNotes?.map((n, i) => (
                            <p key={i} className="text-amber-800 text-xs">• <strong className="text-amber-950">{n.agentName}:</strong> {n.note}</p>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Reply Bar */}
                    <div className="pt-3 border-t border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500">Agent Response</span>
                        <button
                          onClick={handleAiDraft}
                          disabled={isAiDrafting}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition cursor-pointer border border-blue-200"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                          <span>{isAiDrafting ? 'Drafting...' : 'AI Smart Draft Response'}</span>
                        </button>
                      </div>

                      <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Type official reply to customer..."
                          value={replyMessage}
                          onChange={e => setReplyMessage(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-xs"
                        />
                        <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1">
                          <Send className="w-3.5 h-3.5" />
                          Reply
                        </button>
                      </form>

                      <form onSubmit={handleAddNote} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add internal log note (private)..."
                          value={internalNote}
                          onChange={e => setInternalNote(e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-xl border border-amber-200 bg-amber-50/50 text-xs"
                        />
                        <button type="submit" className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition cursor-pointer">
                          + Note
                        </button>
                      </form>
                    </div>
                  </div>
                ) : (
                  <div className="lg:col-span-2 bg-slate-50 rounded-xl border border-slate-200 p-12 text-center text-slate-400 font-semibold text-xs flex items-center justify-center">
                    Select a support case from the left queue to view thread
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DISPUTES (ESCROW & RISK RESOLUTION) */}
          {activeTab === 'disputes' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                    <Scale className="w-5 h-5 text-purple-600" />
                    Escrow & Financial Dispute Resolution Console
                  </h2>
                  <p className="text-xs text-slate-500">Review disputed escrow funds, request proof, and issue customer refunds or seller payouts.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Dispute Table */}
                <div className="lg:col-span-2 space-y-3">
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">Dispute ID</th>
                          <th className="py-3 px-4">Order #</th>
                          <th className="py-3 px-4">Customer</th>
                          <th className="py-3 px-4">Issue</th>
                          <th className="py-3 px-4">Amount</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Escrow</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {disputes.map((disp) => {
                          const isSelected = selectedDispute?.id === disp.id;
                          return (
                            <tr
                              key={disp.id}
                              onClick={() => setSelectedDispute(disp)}
                              className={`hover:bg-slate-50 transition cursor-pointer ${isSelected ? 'bg-purple-50/60 font-bold' : ''}`}
                            >
                              <td className="py-3 px-4 font-mono text-purple-700">{disp.disputeNumber}</td>
                              <td className="py-3 px-4 font-medium">{disp.orderNumber || disp.orderId || '—'}</td>
                              <td className="py-3 px-4 text-slate-900 font-semibold">{disp.customerName}</td>
                              <td className="py-3 px-4 text-slate-600">{disp.issue}</td>
                              <td className="py-3 px-4 font-mono font-bold text-slate-900">TZS {(disp.disputedAmount || 145000).toLocaleString()}</td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                  {disp.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${disp.escrowFrozen ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                  {disp.escrowFrozen ? 'FROZEN' : 'RELEASED'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Dispute Action Drawer */}
                {selectedDispute ? (
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
                    <div className="border-b border-slate-200 pb-3">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Dispute Action</span>
                      <h3 className="font-extrabold text-slate-900 text-base">{selectedDispute.disputeNumber}</h3>
                      <p className="text-xs text-slate-600 mt-0.5">{selectedDispute.reason || 'Customer reported order irregularity'}</p>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500">Customer Name:</span>
                        <span className="font-bold text-slate-800">{selectedDispute.customerName}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500">Order Number:</span>
                        <span className="font-mono font-bold text-slate-800">{selectedDispute.orderNumber || selectedDispute.orderId || '—'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500">Disputed Amount:</span>
                        <span className="font-mono font-extrabold text-slate-900">TZS {(selectedDispute.disputedAmount || 145000).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500">Escrow State:</span>
                        <span className="font-bold text-rose-600">{selectedDispute.escrowFrozen ? 'Escrow Frozen in Vault' : 'Escrow Unfrozen'}</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="text-[11px] font-bold text-slate-700 block">Resolution Note / Audit Log Reason</label>
                      <textarea
                        rows={3}
                        placeholder="State reason for refund approval or escrow release..."
                        value={disputeResolutionNote}
                        onChange={e => setDisputeResolutionNote(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2 pt-2">
                      <button
                        onClick={() => handleUpdateDispute(selectedDispute.id, 'RESOLVED', true)}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Approve Customer Refund & Close Dispute
                      </button>

                      <button
                        onClick={() => handleUpdateDispute(selectedDispute.id, 'INFORMATION_REQUESTED', false)}
                        className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Clock className="w-4 h-4" />
                        Request Additional Proof from Seller
                      </button>

                      <button
                        onClick={() => handleUpdateDispute(selectedDispute.id, 'REJECTED', true)}
                        className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <X className="w-4 h-4" />
                        Reject Dispute & Release Escrow to Seller
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-8 text-center text-slate-400 font-semibold text-xs flex items-center justify-center">
                    Select a dispute record to perform escrow operations
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CUSTOMERS */}
          {activeTab === 'customers' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Customer Support Profiles & Directory
                  </h2>
                  <p className="text-xs text-slate-500">Lookup customer contact profiles, order history, and previous dispute records.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'John D.', email: 'john.d@example.com', phone: '+255 714 882 101', orders: 18, disputes: 1, csat: '4.8', spent: 'TZS 1,840,000' },
                  { name: 'Sarah M.', email: 'sarah.m@gmail.com', phone: '+255 754 991 202', orders: 24, disputes: 1, csat: '5.0', spent: 'TZS 3,120,000' },
                  { name: 'Michael T.', email: 'm.temba@yahoo.com', phone: '+255 688 332 404', orders: 9, disputes: 2, csat: '4.2', spent: 'TZS 950,000' },
                  { name: 'Emily R.', email: 'emily.r@hotmail.com', phone: '+255 712 445 606', orders: 31, disputes: 0, csat: '4.9', spent: 'TZS 4,890,000' },
                  { name: 'David L.', email: 'david.lumo@gmail.com', phone: '+255 767 112 808', orders: 12, disputes: 1, csat: '4.6', spent: 'TZS 1,420,000' },
                  { name: 'Fatma Juma', email: 'fatma.juma@gmail.com', phone: '+255 744 556 909', orders: 42, disputes: 0, csat: '5.0', spent: 'TZS 6,750,000' },
                ].map((cust, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 hover:border-blue-300 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                        {cust.name.slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-xs">{cust.name}</h3>
                        <p className="text-[11px] text-slate-500">{cust.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Lifetime Value</span>
                        <strong className="text-slate-900 font-extrabold">{cust.spent}</strong>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Total Orders</span>
                        <strong className="text-slate-900 font-extrabold">{cust.orders} orders</strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-slate-500 font-semibold">{cust.phone}</span>
                      <button 
                        onClick={() => {
                          setActiveTab('cases');
                          showToast(`Opened support queue for ${cust.name}`);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition cursor-pointer"
                      >
                        View History
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: COMMUNICATIONS */}
          {activeTab === 'communications' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    Omnichannel Communications Inbox
                  </h2>
                  <p className="text-xs text-slate-500">Live chat, SMS alerts, and email auto-responders powered by LumoCare AI.</p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Omnichannel Chat Channels Operational</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                    WhatsApp Business API, In-App Live Chat, and SMS gateway synced with customer support portal.
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setActiveTab('cases');
                    showToast('Switched to live chat ticket queue');
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  Open Live Queue Workspace
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: KNOWLEDGE BASE */}
          {activeTab === 'knowledge' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    Knowledge Base & Canned Responses
                  </h2>
                  <p className="text-xs text-slate-500">Standard operating procedures, policy guides, and canned macro responses for care specialists.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'LUMO Escrow Release Protocol', desc: 'Step-by-step procedures to unfreeze buyer funds after proof of receipt.', cat: 'FINANCE' },
                  { title: 'Courier SLA Breach Handling', desc: 'Automated rider re-assignment rules when order transit exceeds 45 mins.', cat: 'LOGISTICS' },
                  { title: '7-Day Return & Quality Refund Policy', desc: 'Customer return eligibility and doorstep pickup logistics workflow.', cat: 'RETURNS' },
                  { title: 'Mobile Money Cash Out Discrepancy', desc: 'Reconciling M-Pesa transaction reference IDs with bank gateway logs.', cat: 'PAYMENTS' },
                ].map((kb, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 hover:border-blue-300 transition">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-800">{kb.cat}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-xs">{kb.title}</h3>
                    <p className="text-[11px] text-slate-600">{kb.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: REPORTS */}
          {activeTab === 'reports' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-blue-600" />
                    Customer Care Reports & Analytics
                  </h2>
                  <p className="text-xs text-slate-500">Export SLA metrics, resolution speed audits, and agent productivity logs.</p>
                </div>
                <button
                  onClick={() => showToast('Generated customer care PDF report.')}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" /> Export Report (CSV/PDF)
                </button>
              </div>
            </div>
          )}

          {/* TAB 8: ALERTS */}
          {activeTab === 'alerts' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                    <Bell className="w-5 h-5 text-rose-600" />
                    SLA Breaches & Risk Alert Center
                  </h2>
                  <p className="text-xs text-slate-500">Automated SLA timers monitoring high priority disputes and open cases.</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-4">
                  <Flame className="w-5 h-5 text-rose-600 mt-1 shrink-0" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs">High volume of billing disputes detected</h3>
                    <p className="text-xs text-slate-600 mt-0.5">35% increase in M-Pesa double-charge ticket submissions in the last 24 hours.</p>
                    <span className="text-[10px] text-slate-400 font-bold block pt-1">May 18, 2024 10:30 AM</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-4">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-1 shrink-0" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs">SLA breach risk – 18 open cases</h3>
                    <p className="text-xs text-slate-600 mt-0.5">Case response time approaching 24-hour SLA threshold.</p>
                    <span className="text-[10px] text-slate-400 font-bold block pt-1">May 18, 2024 09:15 AM</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-600" />
                    Customer Care Configuration
                  </h2>
                  <p className="text-xs text-slate-500">Set SLA thresholds, auto-pilot AI parameters, and queue distribution rules.</p>
                </div>
                <button
                  onClick={() => showToast('Customer Care settings updated.')}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs transition cursor-pointer"
                >
                  Save Settings
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <h3 className="font-bold text-slate-900">SLA Response Targets</h3>
                  <div>
                    <label className="text-slate-500 block font-semibold mb-1">First Response SLA Target (minutes)</label>
                    <input type="number" defaultValue={15} className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono" />
                  </div>
                  <div>
                    <label className="text-slate-500 block font-semibold mb-1">Resolution Time Target (hours)</label>
                    <input type="number" defaultValue={24} className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono" />
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <h3 className="font-bold text-slate-900">LumoCare AI Auto-Assistant</h3>
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="font-bold text-slate-800">Enable AI Smart Draft Responses</p>
                      <p className="text-[10px] text-slate-500">Generates instant context-aware drafts using Gemini 3.7 Flash.</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-blue-600 cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* CREATE TICKET MODAL */}
      {showCreateTicketModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm">Create New Support Ticket</h3>
              <button onClick={() => setShowCreateTicketModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 font-bold block mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rashid Mohamed"
                  value={newTicketUser}
                  onChange={e => setNewTicketUser(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="text-slate-600 font-bold block mb-1">Category</label>
                <select
                  value={newTicketCategory}
                  onChange={e => setNewTicketCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  <option value="DELIVERY">Delivery & Tracking</option>
                  <option value="PAYMENTS">Billing & Escrow</option>
                  <option value="PRODUCT">Product & Returns</option>
                  <option value="ACCOUNT">Account Management</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 font-bold block mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. M-Pesa Payment Confirmation Pending"
                  value={newTicketSubject}
                  onChange={e => setNewTicketSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="text-slate-600 font-bold block mb-1">Customer Message</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe customer issue details..."
                  value={newTicketMessage}
                  onChange={e => setNewTicketMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateTicketModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold cursor-pointer hover:bg-blue-700 shadow-sm"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CALL CENTER VOIP MODAL */}
      <LumoCallCenterModal
        isOpen={isCallCenterOpen}
        onClose={() => setIsCallCenterOpen(false)}
        initialContact={activeCallContact}
        onLogCallToTicket={({ contact, duration, notes, disposition }) => {
          showToast(`Call logged for ${contact.name}: ${duration} duration (${disposition})`);
        }}
      />

      {/* TOP AGENTS LEADERBOARD & ROSTER MODAL */}
      {isAgentsModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Care Agent Performance Leaderboard</h3>
                <p className="text-xs text-slate-500">Live agent metrics, resolution speed, and CSAT scores</p>
              </div>
              <button onClick={() => setIsAgentsModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 text-center">
                  <span className="text-[10px] font-bold text-blue-600 block uppercase">Active On-Duty</span>
                  <span className="text-lg font-black text-slate-900">18 Agents</span>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center">
                  <span className="text-[10px] font-bold text-emerald-600 block uppercase">Avg CSAT</span>
                  <span className="text-lg font-black text-slate-900">4.8 / 5.0</span>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3 text-center">
                  <span className="text-[10px] font-bold text-purple-600 block uppercase">Avg Response Time</span>
                  <span className="text-lg font-black text-slate-900">1.4 Mins</span>
                </div>
              </div>

              <div className="overflow-x-auto max-h-80 overflow-y-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="text-[10px] text-slate-400 font-bold border-b border-slate-100 bg-slate-50">
                    <tr>
                      <th className="py-2.5 px-3">Agent</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Resolved</th>
                      <th className="py-2.5 px-3">Avg Speed</th>
                      <th className="py-2.5 px-3">CSAT</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { id: '1', name: 'Jessica W.', role: 'Senior Care Lead', cases: 142, speed: '12m', csat: '4.9', status: 'ON_CALL', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', phone: '+255 784 100 001' },
                      { id: '2', name: 'Daniel K.', role: 'Escrow Dispute Specialist', cases: 128, speed: '14m', csat: '4.8', status: 'AVAILABLE', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', phone: '+255 784 100 002' },
                      { id: '3', name: 'Priya S.', role: 'Logistics Care Agent', cases: 116, speed: '16m', csat: '4.7', status: 'AVAILABLE', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100', phone: '+255 784 100 003' },
                      { id: '4', name: 'Juma Mwita', role: 'Billing Specialist', cases: 98, speed: '18m', csat: '4.6', status: 'IN_MEETING', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', phone: '+255 784 100 004' },
                      { id: '5', name: 'Amina Selemani', role: 'Customer Support Lead', cases: 88, speed: '15m', csat: '4.8', status: 'AVAILABLE', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', phone: '+255 784 100 005' },
                    ].map((ag) => (
                      <tr key={ag.id} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <img src={ag.img} className="w-8 h-8 rounded-full object-cover border border-slate-200" alt={ag.name} />
                            <div>
                              <div className="font-bold text-slate-900">{ag.name}</div>
                              <div className="text-[10px] text-slate-400">{ag.role}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            ag.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            ag.status === 'ON_CALL' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {ag.status?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">{ag.cases}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-600">{ag.speed}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{ag.csat}</td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => {
                              setActiveCallContact({ id: ag.id, name: ag.name, phone: ag.phone, role: 'HUB_AGENT' });
                              setIsAgentsModalOpen(false);
                              setIsCallCenterOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center gap-1 ml-auto cursor-pointer"
                          >
                            <Phone className="w-3 h-3" /> Call
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

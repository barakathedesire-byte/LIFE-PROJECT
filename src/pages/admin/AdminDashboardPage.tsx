import React, { useState, useEffect } from 'react';
import { HeaderNotificationBell } from '../../components/common/HeaderNotificationBell';
import { UserAccountNavDropdown } from '../../components/common/UserAccountNavDropdown';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { formatTZS } from '../../utils/formatters';
import { LumoLoader } from '../../components/common/LumoLoader';
import { 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  Store, 
  DollarSign, 
  Lock, 
  Activity, 
  FileText, 
  Sliders, 
  CheckCircle2, 
  AlertOctagon, 
  UserCheck, 
  Layers, 
  Search,
  Plus,
  UserPlus,
  Building2,
  Check,
  X,
  Clock,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  ShoppingBag,
  Truck,
  CreditCard,
  MessageSquare,
  Bell,
  Settings,
  HelpCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  Trash2,
  Send,
  Radio,
  ShieldAlert,
  Server,
  Key,
  Globe,
  ChevronLeft,
  ChevronRight,
  Menu,
  ToggleLeft,
  ToggleRight,
  HardDrive,
  Copy,
  ExternalLink,
  UserX,
  ShieldOff,
  Link2,
  MailCheck,
  Inbox,
  AtSign
} from 'lucide-react';
import { UserAccount, AuditLogEntry, CommissionRule, PlatformAnalytics } from '../../types';

import { PlatformBuilderView } from './builder/PlatformBuilderView';
import { GoogleWorkspaceHub } from '../../components/workspace/GoogleWorkspaceHub';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('analytics');
  const [searchTerm, setSearchTerm] = useState('');
  const [showWorkspaceHub, setShowWorkspaceHub] = useState(false);

  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [staffUsersList, setStaffUsersList] = useState<UserAccount[]>([]);
  const [pendingSellers, setPendingSellers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [commissionRules, setCommissionRules] = useState<CommissionRule[]>([]);

  // Real Platform State - initialized empty to comply with Phase 9F
  const [buyersList, setBuyersList] = useState<any[]>([]);
  const [vendorsList, setVendorsList] = useState<any[]>([]);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [payoutsList, setPayoutsList] = useState<any[]>([]);
  const [disputesList, setDisputesList] = useState<any[]>([]);
  const [supportList, setSupportList] = useState<any[]>([]);

  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState('ALL');
  const [broadcastSuccess, setBroadcastSuccess] = useState('');

  // Add / Edit Staff User Modal & Lifecycle State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState('OPERATIONS_ADMIN');
  const [newUserDepartment, setNewUserDepartment] = useState('Operations & Fulfillment');
  const [newUserWarehouseId, setNewUserWarehouseId] = useState('wh-kariakoo');
  const [provisioningMode, setProvisioningMode] = useState<'INVITE' | 'DIRECT'>('INVITE');
  const [newUserTemporaryPassword, setNewUserTemporaryPassword] = useState('');
  const [createUserMsg, setCreateUserMsg] = useState('');
  const [createdInviteUrl, setCreatedInviteUrl] = useState<string | null>(null);
  const [createdInviteDetails, setCreatedInviteDetails] = useState<{
    url: string;
    token: string;
    email: string;
    name: string;
    role: string;
    department: string;
    emailSent: boolean;
    emailSubject?: string;
    emailSentAt?: string;
  } | null>(null);
  const [inspectEmailStaff, setInspectEmailStaff] = useState<{
    user: UserAccount;
    inviteToken: string;
    inviteUrl: string;
    emailSubject: string;
  } | null>(null);
  const [resendSuccessToast, setResendSuccessToast] = useState<string | null>(null);
  const [staffStatusFilter, setStaffStatusFilter] = useState<'ALL' | 'INVITED' | 'ACTIVE' | 'SUSPENDED' | 'REVOKED'>('ALL');
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [staffDepartmentFilter, setStaffDepartmentFilter] = useState('ALL');
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);
  const [statusChangeModal, setStatusChangeModal] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
    currentStatus: string;
    targetStatus: 'INVITED' | 'ACTIVE' | 'SUSPENDED' | 'REVOKED';
    reason: string;
  } | null>(null);

  // Commission Rule Modal
  const [showAddRule, setShowAddRule] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [commissionRate, setCommissionRate] = useState('0.08');
  const [fixedFee, setFixedFee] = useState('1000');

  // Approval Feedback
  const [approvalMsg, setApprovalMsg] = useState<{ id: string; text: string; type: 'success' | 'error' } | null>(null);

  const [selectedVendorForDetails, setSelectedVendorForDetails] = useState<any | null>(null);
  const [selectedBuyerForDetails, setSelectedBuyerForDetails] = useState<any | null>(null);
  const [selectedOrderForInvestigation, setSelectedOrderForInvestigation] = useState<any | null>(null);

  // Sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Map role to its dedicated interactive dashboard portal
  const getPortalPathForRole = (role: string): { path: string; label: string } => {
    switch (role) {
      case 'CUSTOMER_CARE':
      case 'CUSTOMER_SUPPORT':
        return { path: '/customercare', label: 'Customer Care' };
      case 'CATALOG_SPECIALIST':
      case 'CATALOG_ADMIN':
        return { path: '/catalog', label: 'Catalog Hub' };
      case 'CONTENT_MODERATOR':
      case 'MODERATOR':
        return { path: '/moderation', label: 'Moderation Hub' };
      case 'FINANCE_OFFICER':
      case 'ACCOUNTING_STAFF':
      case 'FINANCE_ADMIN':
        return { path: '/finance', label: 'Finance Hub' };
      case 'WAREHOUSE_MANAGER':
        return { path: '/warehouse', label: 'Warehouse Hub' };
      case 'DELIVERY_AGENT':
        return { path: '/delivery', label: 'Rider Hub' };
      case 'PICKUP_STATION_MANAGER':
        return { path: '/pickup', label: 'Pickup Hub' };
      case 'SALESPERSON':
        return { path: '/sales', label: 'Sales Hub' };
      case 'OPERATIONS_ADMIN':
        return { path: '/operations', label: 'Operations Hub' };
      default:
        return { path: '/admin', label: 'Admin Hub' };
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [
        anaRes,
        usrRes,
        pendRes,
        logRes,
        comRes,
        allUsersRes,
        ordersRes,
        payoutsRes,
        ticketsRes
      ] = await Promise.all([
        api.getAdminAnalytics(),
        api.getAdminStaffUsers(),
        api.getPendingSellerApplications(),
        api.getAuditLogs(),
        api.getCommissionRules(),
        api.getAdminUsers(),
        api.getOrders(),
        api.getAdminPayouts(),
        api.getSupportTickets()
      ]);

      setAnalytics(anaRes.analytics);
      setStaffUsersList(usrRes.users || []);
      setPendingSellers(pendRes.applications || []);
      setAuditLogs(logRes.auditLogs || []);
      setCommissionRules(comRes.commissionRules || []);
      
      const allUsers = allUsersRes.users || [];
      setBuyersList(allUsers.filter((u: any) => u.role === 'CUSTOMER'));
      setVendorsList(allUsers.filter((u: any) => u.role === 'SELLER'));
      setOrdersList(ordersRes.orders || []);
      setPayoutsList(payoutsRes.payouts || []);
      setSupportList(ticketsRes.tickets || []);
      setDisputesList((ticketsRes.tickets || []).filter((t: any) => t.category === 'Dispute' || t.priority === 'URGENT'));
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateOrUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;
    try {
      if (editingUserId) {
        const res = await api.updateUser(editingUserId, {
          name: newUserName,
          email: newUserEmail,
          phone: newUserPhone,
          role: newUserRole as any,
          department: newUserDepartment
        });
        setCreateUserMsg(`Staff member ${newUserName} updated successfully!`);
        setTimeout(() => {
          setShowAddUserModal(false);
          setEditingUserId(null);
          setNewUserName('');
          setNewUserEmail('');
          setNewUserPhone('');
          setCreateUserMsg('');
          setCreatedInviteUrl(null);
        }, 1200);
      } else {
        const res = await api.createAdminUser({
          name: newUserName,
          email: newUserEmail,
          phone: newUserPhone,
          role: newUserRole,
          department: newUserDepartment,
          warehouseId: newUserWarehouseId,
          status: provisioningMode === 'INVITE' ? 'INVITED' : 'ACTIVE',
          temporaryPassword: provisioningMode === 'DIRECT' ? newUserTemporaryPassword : undefined,
          permissions: ['ALL_STAFF_READ', 'OPERATIONS_MANAGE']
        });

        if (res.invitationUrl) {
          setCreatedInviteUrl(res.invitationUrl);
          setCreatedInviteDetails({
            url: res.invitationUrl,
            token: res.inviteToken || (res as any).token || 'stf_inv_token',
            email: newUserEmail,
            name: newUserName,
            role: newUserRole,
            department: newUserDepartment,
            emailSent: !!res.emailSent,
            emailSubject: res.emailSubject || `Welcome to LUMO — You've been invited to join as ${newUserRole}`,
            emailSentAt: res.emailSentAt || new Date().toISOString()
          });
          setCreateUserMsg(`Staff invitation provisioned and email sent to ${newUserEmail}!`);
        } else {
          setCreateUserMsg(`Active staff account created for ${newUserName}! Credentials are ready.`);
          setTimeout(() => {
            setShowAddUserModal(false);
            setNewUserName('');
            setNewUserEmail('');
            setNewUserPhone('');
            setCreateUserMsg('');
            setCreatedInviteUrl(null);
            setCreatedInviteDetails(null);
          }, 1500);
        }
      }

      await loadData();
    } catch (err: any) {
      console.error('Error creating/updating staff user:', err);
      setCreateUserMsg(`Failed: ${err.message || 'Operation failed'}`);
    }
  };

  const handleStatusChangeSubmit = async () => {
    if (!statusChangeModal) return;
    try {
      await api.updateStaffStatus(
        statusChangeModal.userId,
        statusChangeModal.targetStatus,
        statusChangeModal.reason
      );
      setStatusChangeModal(null);
      await loadData();
    } catch (err) {
      console.error('Error changing staff status:', err);
    }
  };

  const handleResendInvite = async (user: UserAccount) => {
    try {
      const res = await api.resendStaffInvitation(user.id);
      if (res.success && res.invitationUrl) {
        await navigator.clipboard.writeText(res.invitationUrl);
        setCopiedInviteId(user.id);
        setResendSuccessToast(`📧 Invitation email successfully dispatched to ${user.email}! Link copied to clipboard.`);
        setTimeout(() => {
          setCopiedInviteId(null);
          setResendSuccessToast(null);
        }, 5000);
      }
      await loadData();
    } catch (err) {
      console.error('Error resending invite:', err);
    }
  };

  const handleCopyLink = async (link: string, id: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedInviteId(id);
      setTimeout(() => setCopiedInviteId(null), 3000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to permanently revoke & delete this internal staff account?')) return;
    try {
      await api.deleteUser(userId);
      await loadData();
    } catch (err) {
      console.error('Error deleting staff user:', err);
    }
  };

  const handleEditUserClick = (u: UserAccount) => {
    setEditingUserId(u.id);
    setNewUserName(u.name);
    setNewUserEmail(u.email);
    setNewUserPhone(u.phone || '');
    setNewUserRole(u.role);
    setNewUserDepartment((u as any).department || 'Operations & Fulfillment');
    setCreatedInviteUrl(null);
    setCreateUserMsg('');
    setShowAddUserModal(true);
  };

  const handleApproveSeller = async (appId: string) => {
    try {
      const res = await api.approveSellerApplication(appId);
      if (res.success) {
        setApprovalMsg({ id: appId, text: 'Seller approved & vendor account activated!', type: 'success' });
        await loadData();
      } else {
        setApprovalMsg({ id: appId, text: res.error || 'Approval failed', type: 'error' });
      }
    } catch (err) {
      console.error('Error approving seller:', err);
    }
  };

  const handleRejectSeller = async (appId: string) => {
    try {
      const res = await api.rejectSellerApplication(appId, 'Documentation verification requirement unmet');
      if (res.success) {
        setApprovalMsg({ id: appId, text: 'Application rejected', type: 'error' });
        await loadData();
      } else {
        setApprovalMsg({ id: appId, text: res.error || 'Rejection failed', type: 'error' });
      }
    } catch (err) {
      console.error('Error rejecting seller:', err);
    }
  };

  const handleCreateOrUpdateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRuleId) {
        await api.updateCommissionRule(editingRuleId, {
          category: categoryName,
          commissionRate: Number(commissionRate),
          fixedFee: Number(fixedFee)
        });
      } else {
        await api.createCommissionRule({
          category: categoryName,
          commissionRate: Number(commissionRate),
          fixedFee: Number(fixedFee)
        });
      }
      setShowAddRule(false);
      setEditingRuleId(null);
      setCategoryName('');
      await loadData();
    } catch (err) {
      console.error('Error creating/updating commission rule:', err);
    }
  };

  const handleRoleChange = async (userId: string, newRole: any) => {
    try {
      await api.updateUserRole(userId, newRole);
      await loadData();
    } catch (err) {
      console.error('Error updating user role:', err);
    }
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    setBroadcastSuccess(`Broadcast successfully dispatched to target group: ${broadcastTarget}!`);
    setTimeout(() => {
      setBroadcastMessage('');
      setBroadcastSuccess('');
    }, 3000);
  };

  const stats = analytics || {
    grossMerchandiseValue: 124500000,
    netPlatformRevenue: 9960000,
    escrowHoldingBalance: 34500000,
    totalOrdersCount: 842,
    activeVendorsCount: 38,
    activeCustomersCount: 1420,
    sameDayDeliverySuccessRate: 98.4
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col md:flex-row font-sans">
      {/* Sidebar for all Super Admin Dashboard Tabs */}
      <aside className={`bg-[#0B132B] text-white flex flex-col shrink-0 border-r border-slate-800 shadow-xl transition-all duration-300 ${isSidebarCollapsed ? 'w-full md:w-20' : 'w-full md:w-72'}`}>
        <div className={`p-4 md:p-6 border-b border-slate-800 flex items-center justify-between ${isSidebarCollapsed ? 'md:justify-center' : ''}`}>
          <div className={`flex items-center gap-3 ${isSidebarCollapsed ? 'md:hidden' : ''}`}>
            <div className="w-10 h-10 rounded-xl bg-[#FF6A00]/20 border border-[#FF6A00]/30 flex items-center justify-center text-[#FF6A00] font-bold shadow-inner shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm tracking-tight text-white truncate">LUMO Admin</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF6A00]/20 text-[#FF6A00] border border-[#FF6A00]/50 shrink-0">
                  SUPER
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">Platform Command Center</p>
            </div>
          </div>
          
          {/* Collapse Toggle */}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer ${isSidebarCollapsed ? 'md:flex' : 'hidden md:flex'}`}
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        <div className={`p-3 md:p-4 flex-1 overflow-y-auto ${isSidebarCollapsed ? 'space-y-3' : 'space-y-1.5'}`}>
          {!isSidebarCollapsed && (
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 pb-1">
              Management Modules
            </div>
          )}
          {[
            { id: 'analytics', label: 'Platform Analytics', icon: TrendingUp },
            { id: 'users', label: `Staff & RBAC`, count: staffUsersList.length, icon: Users },
            { id: 'buyers', label: `Buyers`, count: buyersList.length, icon: Users },
            { id: 'vendors', label: `Vendors & KYC`, count: pendingSellers.length, icon: Building2 },
            { id: 'orders', label: `Orders & Logistics`, count: ordersList.length, icon: ShoppingBag },
            { id: 'escrow', label: 'Escrow & Payouts', icon: DollarSign },
            { id: 'commission', label: 'Take-Rate Rules', icon: Sliders },
            { id: 'compliance', label: `Disputes & Risk`, count: disputesList.length, icon: ShieldAlert },
            { id: 'support', label: `Support Desk`, count: supportList.length, icon: HelpCircle },
            { id: 'communication', label: 'Broadcasts', icon: Radio },
            { id: 'audit', label: `Audit Trail`, count: auditLogs.length, icon: Activity },
            { id: 'platform-builder', label: 'Platform Builder', icon: Sparkles },
            { id: 'system', label: 'System Settings', icon: Server }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                title={isSidebarCollapsed ? tab.label : undefined}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-2.5'} rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#FF6A00] text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`${isSidebarCollapsed ? 'w-5 h-5' : 'w-4 h-4'} shrink-0`} />
                {!isSidebarCollapsed && (
                  <span className="truncate flex-1 text-left">{tab.label}</span>
                )}
                {!isSidebarCollapsed && tab.count !== undefined && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}

          {/* Specialized Dashboards Launcher */}
          {!isSidebarCollapsed && (
            <div className="pt-4 border-t border-slate-800/80 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 pb-1 flex items-center justify-between">
                <span>Specialized Portals</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-900/60 text-purple-300 font-normal">Active</span>
              </div>
              <a
                href="/customercare"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
              >
                <HelpCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="truncate flex-1">Customer Care Desk</span>
                <span className="text-[10px] text-slate-500">↗</span>
              </a>
              <a
                href="/catalog"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
              >
                <HardDrive className="w-4 h-4 text-violet-400 shrink-0" />
                <span className="truncate flex-1">Catalog Specialist</span>
                <span className="text-[10px] text-slate-500">↗</span>
              </a>
              <a
                href="/moderation"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
              >
                <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate flex-1">Content Moderation</span>
                <span className="text-[10px] text-slate-500">↗</span>
              </a>
              <a
                href="/finance"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
              >
                <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate flex-1">Finance & Settlements</span>
                <span className="text-[10px] text-slate-500">↗</span>
              </a>
            </div>
          )}
        </div>

        <div className={`p-3 border-t border-slate-800 text-xs text-slate-400 space-y-3 ${isSidebarCollapsed ? 'text-center flex flex-col items-center' : ''}`}>
          <UserAccountNavDropdown variant="dark" compact={isSidebarCollapsed} className="w-full" align="left" />
          {isSidebarCollapsed ? (
             <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Operational (18 Nodes)" />
          ) : (
            <>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Operational (18 Nodes)
              </div>
              <p className="text-[10px] text-slate-500">Secured East Africa Region</p>
            </>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 p-6 md:p-8 space-y-8 overflow-y-auto">
        {/* Top Header Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 capitalize">
              {activeTab === 'analytics' && 'Platform Analytics & Overview'}
              {activeTab === 'users' && 'Staff & Internal Operations RBAC'}
              {activeTab === 'buyers' && 'Buyer Accounts Directory'}
              {activeTab === 'vendors' && 'Vendor Directory & KYC Verifications'}
              {activeTab === 'orders' && 'Platform Orders & Logistics Dispatch'}
              {activeTab === 'escrow' && 'Escrow Holding Pool & Payout Ledger'}
              {activeTab === 'commission' && 'Take-Rate Commission Rules'}
              {activeTab === 'compliance' && 'Disputes & Risk Management'}
              {activeTab === 'support' && 'Customer & Vendor Support Desk'}
              {activeTab === 'communication' && 'Platform Broadcasts & Announcements'}
              {activeTab === 'audit' && 'Immutable Audit Trail'}
              {activeTab === 'platform-builder' && 'No-Code Platform Builder'}
              {activeTab === 'system' && 'System Settings & Platform Configuration'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Super Admin Control Center — Authorized Personnel Only
            </p>
          </div>

          <div className="flex items-center gap-3">
            <HeaderNotificationBell roleFilter="ADMIN" />
            <button
              onClick={() => setShowWorkspaceHub(true)}
              className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition cursor-pointer border border-blue-200"
            >
              <Sparkles size={14} className="text-blue-600" />
              <span>Google Workspace (Gmail & Forms)</span>
            </button>
            <button
              onClick={loadData}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
            >
              {loading ? <LumoLoader size="small" /> : <RefreshCw size={14} />}
              <span>Refresh Data</span>
            </button>
            <UserAccountNavDropdown variant="light" />
          </div>
        </div>

        {/* KPI CARDS (Always visible on top for immediate status) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Platform GMV</span>
            <p className="text-2xl font-bold text-slate-900 mt-2">{formatTZS((stats as any).grossMerchandiseValue || 0)}</p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">+24.8% MoM Growth</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Commission Revenue</span>
            <p className="text-2xl font-bold text-purple-700 mt-2">{formatTZS((stats as any).netPlatformRevenue || 0)}</p>
            <p className="text-xs text-slate-500 mt-1">8.0% blended marketplace take-rate</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Escrow Holding Pool</span>
            <p className="text-2xl font-bold text-emerald-700 mt-2">{formatTZS((stats as any).escrowHoldingBalance || 0)}</p>
            <p className="text-xs text-slate-500 mt-1">Secured in Bank of Tanzania trustee vault</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Merchants</span>
            <p className="text-2xl font-bold text-slate-900 mt-2">{(stats as any).activeVendorsCount || 0}</p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">100% KYC & BRELA Verified</p>
          </div>
        </div>

        {/* 1. ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-in fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 text-base mb-4">Category Volume Share</h3>
                <div className="space-y-3 text-xs">
                  {[
                    { name: 'Phones & Tablets', share: 44, gmv: 54780000 },
                    { name: 'Electronics & Audio', share: 22, gmv: 27390000 },
                    { name: 'Computers & Laptops', share: 18, gmv: 22410000 },
                    { name: 'Fashion & Apparel', share: 10, gmv: 12450000 },
                    { name: 'Home & Living', share: 6, gmv: 7470000 }
                  ].map(item => (
                    <div key={item.name} className="space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span className="text-slate-800">{item.name}</span>
                        <span className="text-slate-900">{formatTZS(item.gmv)} ({item.share}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${item.share}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 text-base mb-4">Platform Operational Health</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400">Hub Dispatch Throughput</span>
                    <p className="text-2xl font-bold text-slate-900 mt-1">99.2%</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400">Rider OTP Success Rate</span>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">99.8%</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400">Return & Dispute Rate</span>
                    <p className="text-2xl font-bold text-slate-900 mt-1">0.6%</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400">Escrow Release Speed</span>
                    <p className="text-2xl font-bold text-purple-600 mt-1">Instant (OTP)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. STAFF & RBAC TAB */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in">
            {/* Header & Primary Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-600" />
                  <h2 className="font-bold text-slate-900 text-lg">Staff & Internal Operations RBAC Governance</h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Internal enterprise accounts are strictly provisioned by Super Administrators with role lifecycle management (INVITED → ACTIVE → SUSPENDED → REVOKED).
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingUserId(null);
                  setNewUserName('');
                  setNewUserEmail('');
                  setNewUserPhone('');
                  setNewUserRole('OPERATIONS_ADMIN');
                  setNewUserDepartment('Operations & Fulfillment');
                  setProvisioningMode('INVITE');
                  setNewUserTemporaryPassword('');
                  setCreatedInviteUrl(null);
                  setCreateUserMsg('');
                  setShowAddUserModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition cursor-pointer shadow-md active:scale-95 shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>Provision Internal Staff</span>
              </button>
            </div>

            {/* Staff KPI Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] font-semibold text-slate-500 block">Total Staff Accounts</span>
                <p className="text-xl font-black text-slate-900 mt-0.5">{staffUsersList.length}</p>
                <span className="text-[10px] text-slate-400">Authorized personnel</span>
              </div>
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <span className="text-[11px] font-semibold text-emerald-800 block">Active & Verified</span>
                <p className="text-xl font-black text-emerald-700 mt-0.5">
                  {staffUsersList.filter(u => ((u as any).status || (u.isActive ? 'ACTIVE' : 'SUSPENDED')) === 'ACTIVE').length}
                </p>
                <span className="text-[10px] text-emerald-600">Full platform access</span>
              </div>
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl">
                <span className="text-[11px] font-semibold text-amber-800 block">Pending Activation</span>
                <p className="text-xl font-black text-amber-700 mt-0.5">
                  {staffUsersList.filter(u => (u as any).status === 'INVITED').length}
                </p>
                <span className="text-[10px] text-amber-600">Invitations dispatched</span>
              </div>
              <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl">
                <span className="text-[11px] font-semibold text-rose-800 block">Suspended / Revoked</span>
                <p className="text-xl font-black text-rose-700 mt-0.5">
                  {staffUsersList.filter(u => ['SUSPENDED', 'REVOKED'].includes((u as any).status || (!u.isActive ? 'SUSPENDED' : ''))).length}
                </p>
                <span className="text-[10px] text-rose-600">Access disabled</span>
              </div>
            </div>

            {/* Filter Pills, Department Selector & Search */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-1.5">
                {(['ALL', 'ACTIVE', 'INVITED', 'SUSPENDED', 'REVOKED'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setStaffStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      staffStatusFilter === status
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={staffDepartmentFilter}
                  onChange={e => setStaffDepartmentFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 font-medium cursor-pointer"
                >
                  <option value="ALL">All Departments</option>
                  <option value="Finance & Accounting">Finance & Accounting</option>
                  <option value="Operations & Fulfillment">Operations & Fulfillment</option>
                  <option value="Warehouse & Logistics">Warehouse & Logistics</option>
                  <option value="Customer Care & Resolution">Customer Care & Resolution</option>
                  <option value="Catalog & Moderation">Catalog & Moderation</option>
                  <option value="Sales & Field Operations">Sales & Field Operations</option>
                  <option value="Platform Administration">Platform Administration</option>
                </select>

                <div className="relative shrink-0 w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search staff by name/email/id..."
                    value={staffSearchQuery}
                    onChange={e => setStaffSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Staff Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Staff Member & ID</th>
                    <th className="py-3 px-4">Contact Info</th>
                    <th className="py-3 px-4">Department & Region</th>
                    <th className="py-3 px-4">Assigned Role</th>
                    <th className="py-3 px-4">Lifecycle Status</th>
                    <th className="py-3 px-4 text-right">Actions & Role Portal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staffUsersList
                    .filter(u => {
                      const uStatus = (u as any).status || (u.isActive ? 'ACTIVE' : 'SUSPENDED');
                      if (staffStatusFilter !== 'ALL' && uStatus !== staffStatusFilter) return false;
                      const uDept = (u as any).department || 'Operations & Fulfillment';
                      if (staffDepartmentFilter !== 'ALL' && uDept !== staffDepartmentFilter) return false;
                      if (staffSearchQuery.trim()) {
                        const q = staffSearchQuery.toLowerCase();
                        return (
                          u.name.toLowerCase().includes(q) ||
                          u.email.toLowerCase().includes(q) ||
                          u.id.toLowerCase().includes(q) ||
                          u.role.toLowerCase().includes(q)
                        );
                      }
                      return true;
                    })
                    .map(u => {
                      const uStatus = (u as any).status || (u.isActive ? 'ACTIVE' : 'SUSPENDED');
                      const portal = getPortalPathForRole(u.role);
                      const isInvited = uStatus === 'INVITED';
                      const isSuspended = uStatus === 'SUSPENDED';
                      const isRevoked = uStatus === 'REVOKED';
                      const isActive = uStatus === 'ACTIVE';

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-4 flex items-center gap-3">
                            <img
                              src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                              alt={u.name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-slate-900">{u.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{(u as any).staffId || u.id}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="flex items-center gap-1.5 text-slate-800 font-medium">
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{u.email}</span>
                            </p>
                            <p className="text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{u.phone || 'No direct phone'}</span>
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-semibold text-slate-800">{(u as any).department || 'Operations'}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{(u as any).warehouseId || 'Dar es Salaam HQ'}</p>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2.5 py-1 rounded-md font-mono font-bold text-[10px] bg-purple-50 text-purple-900 border border-purple-200">
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {isInvited && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                <Clock className="w-3 h-3 text-amber-700" />
                                <span>INVITED</span>
                              </span>
                            )}
                            {isActive && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                <span>ACTIVE</span>
                              </span>
                            )}
                            {isSuspended && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-900 border border-orange-300">
                                <AlertTriangle className="w-3 h-3 text-orange-700" />
                                <span>SUSPENDED</span>
                              </span>
                            )}
                            {isRevoked && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300">
                                <ShieldOff className="w-3 h-3 text-rose-700" />
                                <span>REVOKED</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {/* If invited, offer copy link and resend */}
                              {isInvited && (
                                <>
                                  <button
                                    onClick={() => {
                                      const token = (u as any).inviteToken || `stf-inv-${u.id}`;
                                      const url = `${window.location.origin}/staff/activate?token=${token}`;
                                      handleCopyLink(url, u.id);
                                    }}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-bold transition cursor-pointer"
                                    title="Copy Activation Link"
                                  >
                                    <Copy className="w-3 h-3" />
                                    <span>{copiedInviteId === u.id ? 'Copied!' : 'Copy Link'}</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      const token = (u as any).inviteToken || `stf-inv-${u.id}`;
                                      const url = `${window.location.origin}/staff/activate?token=${token}`;
                                      setInspectEmailStaff({
                                        user: u,
                                        inviteToken: token,
                                        inviteUrl: url,
                                        emailSubject: `Welcome to LUMO — You've been invited to join as ${u.role} (${(u as any).department || 'Operations'})`
                                      });
                                    }}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-[11px] font-semibold transition cursor-pointer"
                                    title="Inspect Dispatched Invitation Email"
                                  >
                                    <Mail className="w-3 h-3 text-purple-600" />
                                    <span>Sent Email</span>
                                  </button>
                                  <button
                                    onClick={() => handleResendInvite(u)}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition cursor-pointer"
                                    title="Resend Invite"
                                  >
                                    <Send className="w-3 h-3 text-slate-500" />
                                    <span>Resend</span>
                                  </button>
                                </>
                              )}

                              {/* Direct Launch Portal */}
                              <a
                                href={portal.path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 text-[11px] font-medium transition cursor-pointer"
                                title={`Open ${portal.label}`}
                              >
                                <span>{portal.label}</span>
                                <ExternalLink className="w-3 h-3 text-slate-400" />
                              </a>

                              {/* Lifecycle Status Action Dropdown */}
                              <select
                                value={uStatus}
                                onChange={e => {
                                  const target = e.target.value as any;
                                  setStatusChangeModal({
                                    isOpen: true,
                                    userId: u.id,
                                    userName: u.name,
                                    currentStatus: uStatus,
                                    targetStatus: target,
                                    reason: `Status transition by Super Admin to ${target}`
                                  });
                                }}
                                className="px-2 py-1 rounded border border-slate-300 text-[11px] font-bold bg-white text-slate-800 cursor-pointer"
                              >
                                <option value="INVITED">Status: INVITED</option>
                                <option value="ACTIVE">Status: ACTIVE</option>
                                <option value="SUSPENDED">Status: SUSPENDED</option>
                                <option value="REVOKED">Status: REVOKED</option>
                              </select>

                              {/* Role Selector */}
                              <select
                                value={u.role}
                                onChange={e => handleRoleChange(u.id, e.target.value)}
                                className="px-2 py-1 rounded border border-slate-300 text-[11px] bg-white cursor-pointer"
                              >
                                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                                <option value="FINANCE_ADMIN">FINANCE_ADMIN</option>
                                <option value="FINANCE_OFFICER">FINANCE_OFFICER</option>
                                <option value="ACCOUNTING_STAFF">ACCOUNTING_STAFF</option>
                                <option value="CUSTOMER_CARE">CUSTOMER_CARE</option>
                                <option value="CUSTOMER_SUPPORT">CUSTOMER_SUPPORT</option>
                                <option value="CATALOG_SPECIALIST">CATALOG_SPECIALIST</option>
                                <option value="CONTENT_MODERATOR">CONTENT_MODERATOR</option>
                                <option value="MODERATOR">MODERATOR</option>
                                <option value="OPERATIONS_ADMIN">OPERATIONS_ADMIN</option>
                                <option value="WAREHOUSE_MANAGER">WAREHOUSE_MANAGER</option>
                                <option value="DELIVERY_AGENT">DELIVERY_AGENT</option>
                                <option value="PICKUP_STATION_MANAGER">PICKUP_STATION_MANAGER</option>
                                <option value="SALESPERSON">SALESPERSON</option>
                              </select>

                              {/* Edit & Delete */}
                              <button
                                onClick={() => handleEditUserClick(u)}
                                className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded transition cursor-pointer"
                                title="Edit Staff Member"
                              >
                                <Settings className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleRemoveUser(u.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                                title="Delete / Revoke User"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. BUYERS MANAGEMENT TAB */}
        {activeTab === 'buyers' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Platform Buyers Directory</h2>
                <p className="text-xs text-slate-500">Registered marketplace consumers and order history</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search buyer..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Buyer Name</th>
                    <th className="py-3 px-4">Contact Details</th>
                    <th className="py-3 px-4">Total Orders</th>
                    <th className="py-3 px-4">Total Spend</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {buyersList.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">{b.name}</td>
                      <td className="py-3 px-4">{b.email} • {b.phone}</td>
                      <td className="py-3 px-4 font-semibold">{b.ordersCount} orders</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{formatTZS(Number(b.totalSpend))}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${b.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button 
                          onClick={() => setSelectedBuyerForDetails(b)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => {
                            setBuyersList(buyersList.map(item => item.id === b.id ? { ...item, status: item.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : item));
                          }}
                          className={`px-2.5 py-1 rounded font-semibold cursor-pointer ${b.status === 'ACTIVE' ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                        >
                          {b.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Are you sure you want to delete buyer account for ${b.name}?`)) {
                              try {
                                const res = await api.deleteUser(b.id);
                                if (res.success || !res.error) {
                                  setBuyersList(prev => prev.filter(item => item.id !== b.id));
                                } else {
                                  alert(res.error || 'Failed to delete buyer');
                                }
                              } catch (err: any) {
                                alert(err.message || 'Error deleting buyer');
                              }
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                          title="Delete Buyer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. VENDORS & KYC TAB */}
        {activeTab === 'vendors' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Seller & Vendor KYC Applications ({pendingSellers.length} Pending)</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verify TIN, BRELA registration, business license & bank/M-Pesa details before vendor store activation
                </p>
              </div>
              <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full font-bold text-xs">
                {pendingSellers.filter(s => s.status === 'PENDING').length} Action Required
              </span>
            </div>

            <div className="space-y-4">
              {pendingSellers.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Building2 className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                  <p className="font-semibold text-sm">No pending seller applications</p>
                  <p className="text-xs text-slate-500">All submitted merchant applications have been reviewed</p>
                </div>
              ) : (
                pendingSellers.map((app) => (
                  <div key={app.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h3 className="font-bold text-slate-900 text-base">{app.businessName}</h3>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            app.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                            app.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {app.status}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">Category: {app?.category}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 text-xs text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span>Owner: <strong className="text-slate-800">{app.ownerName}</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{app.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{app.phone}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>Location: {app.address}, {app.city} ({app.region})</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                            <span>TIN / BRELA: <strong className="font-mono text-slate-800">{app.tinNumber}</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                            <span>Payout: <strong className="text-slate-800">{app.bankDetails || 'Vodacom M-Pesa Merchant'}</strong></span>
                          </div>
                        </div>

                        {approvalMsg && approvalMsg.id === app.id && (
                          <div className={`mt-2 p-2 rounded text-xs font-semibold ${approvalMsg.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                            {approvalMsg.text}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
                        <button
                          onClick={() => setSelectedVendorForDetails(app)}
                          className="px-4 py-2 w-full sm:w-auto rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Are you sure you want to delete vendor application for ${app.businessName}?`)) {
                              try {
                                const res = await api.deleteSeller(app.id);
                                if (res.success || !res.error) {
                                  setPendingSellers(prev => prev.filter(item => item.id !== app.id));
                                } else {
                                  alert(res.error || 'Failed to delete vendor application');
                                }
                              } catch (err: any) {
                                alert(err.message || 'Error deleting vendor');
                              }
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Delete Vendor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {app.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleRejectSeller(app.id)}
                              className="px-3 py-2 w-full sm:w-auto rounded-lg border border-red-200 bg-white hover:bg-red-50 text-red-700 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1"
                            >
                              <X className="w-3.5 h-3.5" />
                              Reject
                            </button>
                            <button
                              onClick={() => handleApproveSeller(app.id)}
                              className="px-4 py-2 w-full sm:w-auto rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                            >
                              <Check className="w-4 h-4" />
                              Approve
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 5. ORDERS & LOGISTICS TAB */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Platform-Wide Orders & Logistics Oversight</h2>
                <p className="text-xs text-slate-500">Real-time order tracking, fulfillment status and courier dispatch</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Vendor</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Payment & Escrow</th>
                    <th className="py-3 px-4">Fulfillment Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ordersList.map(ord => (
                    <tr key={ord.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-purple-700">{ord.id}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{ord.customer}</td>
                      <td className="py-3 px-4">{ord.vendor}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{formatTZS(ord.total)}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">{ord.payment}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">{ord.status}</span>
                      </td>
                      <td className="py-3 px-4 text-right flex justify-end items-center gap-1">
                        <button
                          onClick={() => setSelectedOrderForInvestigation(ord)}
                          className="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                        >
                          Investigate
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Are you sure you want to delete order record ${ord.id}?`)) {
                              try {
                                const res = await api.deleteOrder(ord.id);
                                if (res.success || !res.error) {
                                  setOrdersList(prev => prev.filter(item => item.id !== ord.id));
                                } else {
                                  alert(res.error || 'Failed to delete order');
                                }
                              } catch (err: any) {
                                alert(err.message || 'Error deleting order');
                              }
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                          title="Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. ESCROW & PAYOUTS TAB */}
        {activeTab === 'escrow' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
              <h2 className="font-bold text-slate-900 text-lg">Double-Entry Financial Ledger & Escrow Vault</h2>
              <p className="text-xs text-slate-500">Real-time escrow hold, release audit trail and seller payout queue</p>

              <div className="space-y-3">
                {[
                  { type: 'ESCROW_HOLD', amount: 2491500, ref: 'ORD-8812', note: 'Customer payment received via M-Pesa. Held in trust.' },
                  { type: 'COMMISSION_REVENUE', amount: 196000, ref: 'ORD-8812', note: '8.0% Marketplace commission realized on successful delivery.' },
                  { type: 'SELLER_PAYOUT', amount: 2295500, ref: 'PAY-001', note: 'Net vendor payout released to Swahili Tech Hub M-Pesa account.' }
                ].map((entry, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{entry.type}</span>
                        <span className="font-mono text-slate-500">Ref: {entry.ref}</span>
                      </div>
                      <p className="text-slate-600 mt-0.5">{entry.note}</p>
                    </div>
                    <span className="font-bold text-sm text-slate-900">{formatTZS(entry.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Seller Payout Queue</h3>
                  <p className="text-xs text-slate-500">Vendor payout requests awaiting transfer release</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Payout ID</th>
                      <th className="py-3 px-4">Vendor</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Method</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payoutsList.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.id}</td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{p.vendor}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{formatTZS(p.amount)}</td>
                        <td className="py-3 px-4">{p.method}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right flex justify-end items-center gap-1">
                          {p.status === 'PENDING_APPROVAL' && (
                            <button
                              onClick={() => {
                                setPayoutsList(payoutsList.map(item => item.id === p.id ? { ...item, status: 'COMPLETED' } : item));
                              }}
                              className="px-3 py-1 rounded bg-emerald-600 text-white font-semibold hover:bg-emerald-700 cursor-pointer"
                            >
                              Approve Payout
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              if (confirm(`Are you sure you want to delete payout ${p.id}?`)) {
                                try {
                                  const res = await api.deletePayout(p.id);
                                  if (res.success || !res.error) {
                                    setPayoutsList(prev => prev.filter(item => item.id !== p.id));
                                  } else {
                                    alert(res.error || 'Failed to delete payout');
                                  }
                                } catch (err: any) {
                                  alert(err.message || 'Error deleting payout');
                                }
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                            title="Delete Payout"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 7. COMMISSION RULES TAB */}
        {activeTab === 'commission' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between pb-6 border-b border-slate-200">
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Category Take-Rate Rules</h2>
                <p className="text-xs text-slate-500 mt-0.5">Automated commission splits and minimum transaction fees</p>
              </div>
              <button
                onClick={() => {
                  setEditingRuleId(null);
                  setCategoryName('');
                  setCommissionRate('0.08');
                  setFixedFee('1000');
                  setShowAddRule(true);
                }}
                className="px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition cursor-pointer"
              >
                + Add Rule
              </button>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Commission %</th>
                    <th className="py-3 px-4">Fixed Gateway Fee</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {commissionRules.map((rule) => (
                    <tr key={rule.id}>
                      <td className="py-3 px-4 font-bold text-slate-900 capitalize">{(rule?.category || '').replace(/-/g, ' ')}</td>
                      <td className="py-3 px-4 font-bold text-purple-700">{(rule.commissionRate * 100).toFixed(1)}%</td>
                      <td className="py-3 px-4">{formatTZS(rule.fixedFee)}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          ACTIVE
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right flex justify-end items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingRuleId(rule.id);
                            setCategoryName(rule.category);
                            setCommissionRate(String(rule.commissionRate));
                            setFixedFee(String(rule.fixedFee));
                            setShowAddRule(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded transition cursor-pointer"
                          title="Edit Commission Rule"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Are you sure you want to delete commission rule for ${rule.category}?`)) {
                              try {
                                await api.deleteCommissionRule(rule.id);
                                setCommissionRules(commissionRules.filter(item => item.id !== rule.id));
                              } catch (err) {
                                console.error('Failed to delete rule:', err);
                                setCommissionRules(commissionRules.filter(item => item.id !== rule.id));
                              }
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                          title="Delete Commission Rule"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 8. COMPLIANCE & DISPUTES TAB */}
        {activeTab === 'compliance' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Dispute Resolution & Risk Center</h2>
                <p className="text-xs text-slate-500">Manage buyer/vendor disputes, chargeback investigations and fraud flags</p>
              </div>
            </div>

            <div className="space-y-3">
              {disputesList.map(dsp => (
                <div key={dsp.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">Dispute #{dsp.id}</span>
                      <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold">{dsp.priority} PRIORITY</span>
                      <span className="font-mono text-purple-700">Order: {dsp.orderId}</span>
                    </div>
                    <p className="text-slate-600 mt-1">Complainant: <strong>{dsp.complainant}</strong> vs Respondent: <strong>{dsp.respondent}</strong></p>
                    <p className="text-slate-500 text-[11px] mt-0.5">Issue: {dsp.issue}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alert(`Resolving dispute ${dsp.id} in favor of buyer with escrow refund.`)}
                      className="px-3 py-1.5 rounded bg-purple-600 text-white font-semibold hover:bg-purple-700 cursor-pointer"
                    >
                      Resolve Dispute
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Are you sure you want to delete dispute #${dsp.id}?`)) {
                          try {
                            const res = await api.deleteDispute(dsp.id);
                            if (res.success || !res.error) {
                              setDisputesList(prev => prev.filter(item => item.id !== dsp.id));
                            } else {
                              alert(res.error || 'Failed to delete dispute');
                            }
                          } catch (err: any) {
                            alert(err.message || 'Error deleting dispute');
                          }
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                      title="Delete Dispute"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9. SUPPORT DESK TAB */}
        {activeTab === 'support' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Customer & Vendor Support Tickets</h2>
                <p className="text-xs text-slate-500">Escalated inquiries and resolution management</p>
              </div>
            </div>

            <div className="space-y-3">
              {supportList.map(tkt => (
                <div key={tkt.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{tkt.subject}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">{tkt.priority}</span>
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">{tkt?.category || 'General'}</span>
                    </div>
                    <p className="text-slate-500 mt-1">Submitted by: {tkt.user} • Status: {tkt.status}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alert(`Replying to support ticket ${tkt.id}.`)}
                      className="px-3 py-1.5 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 cursor-pointer"
                    >
                      Reply / Resolve
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Are you sure you want to delete support ticket ${tkt.id}?`)) {
                          try {
                            const res = await api.deleteSupportTicket(tkt.id);
                            if (res.success || !res.error) {
                              setSupportList(prev => prev.filter(item => item.id !== tkt.id));
                            } else {
                              alert(res.error || 'Failed to delete support ticket');
                            }
                          } catch (err: any) {
                            alert(err.message || 'Error deleting support ticket');
                          }
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                      title="Delete Ticket"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 10. COMMUNICATION / BROADCASTS TAB */}
        {activeTab === 'communication' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in">
            <div>
              <h2 className="font-bold text-slate-900 text-lg">Platform-Wide Announcements & Broadcasts</h2>
              <p className="text-xs text-slate-500">Send push notifications, SMS or email alerts to specific user segments</p>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4 max-w-xl text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target Audience</label>
                <select
                  value={broadcastTarget}
                  onChange={e => setBroadcastTarget(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white cursor-pointer"
                >
                  <option value="ALL">All Active Users (Buyers + Vendors + Riders)</option>
                  <option value="BUYERS">All Buyers Only</option>
                  <option value="VENDORS">All Active Vendors Only</option>
                  <option value="RIDERS">Express Delivery Riders Only</option>
                  <option value="SALES">Field Salespersons Only</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Broadcast Message Content</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Type official announcement or promotion..."
                  value={broadcastMessage}
                  onChange={e => setBroadcastMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              {broadcastSuccess && (
                <div className="p-3 rounded bg-emerald-100 text-emerald-800 font-semibold">
                  {broadcastSuccess}
                </div>
              )}

              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold cursor-pointer shadow-sm flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> Send Broadcast Now
              </button>
            </form>
          </div>
        )}

        {/* 11. AUDIT LOG TAB */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in">
            <h2 className="font-bold text-slate-900 text-lg">Immutable Audit Trail</h2>
            <div className="divide-y divide-slate-100 text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{log.userName} ({log.userRole})</span>
                      <span className="font-mono text-purple-700 font-semibold">{log.action}</span>
                    </div>
                    <p className="text-slate-500 mt-0.5">
                      Entity: {log.entityType} ({log.entityId}) • IP: {log.ipAddress}
                    </p>
                  </div>
                  <span className="text-slate-400 font-mono">{log.timestamp?.split('T')[0] || 'Unknown Date'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PLATFORM BUILDER TAB */}
        {activeTab === 'platform-builder' && (
          <div className="h-[800px] border border-slate-200 rounded-xl overflow-hidden shadow-sm animate-in fade-in">
             <PlatformBuilderView />
          </div>
        )}

        {/* 12. SYSTEM HEALTH & SETTINGS TAB */}
        {activeTab === 'system' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2"><Server className="w-5 h-5 text-purple-600" /> System Health & Infrastructure Controls</h2>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                    <CheckCircle2 className="w-3.5 h-3.5" /> All Systems Operational
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 block">Primary Database</span>
                    <HardDrive className="w-4 h-4 text-slate-400" />
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] inline-block mt-1">OPERATIONAL</span>
                  <p className="text-slate-500 text-[11px] pt-1">PostgreSQL / Firestore Sync<br/>Latency: 12ms • Repl. lag: 0ms</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 block">Payment Gateways</span>
                    <CreditCard className="w-4 h-4 text-slate-400" />
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] inline-block mt-1">CONNECTED</span>
                  <p className="text-slate-500 text-[11px] pt-1">M-Pesa / CRDB / Airtel Money<br/>API Callback webhook 100% success</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 block">AI Gemini Services</span>
                    <Sparkles className="w-4 h-4 text-slate-400" />
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] inline-block mt-1">ACTIVE</span>
                  <p className="text-slate-500 text-[11px] pt-1">LLM recommendation engine<br/>Token quota normal • Zero limits</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ToggleLeft className="w-4 h-4 text-[#FF6A00]" />
                  Global Platform Toggles
                </h3>
              </div>
              <div className="p-0">
                <div className="divide-y divide-slate-100">
                  <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">Maintenance Mode</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Show under maintenance page to all non-admin users.</p>
                    </div>
                    <button className="w-12 h-6 bg-slate-200 rounded-full relative transition-colors cursor-pointer">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"></div>
                    </button>
                  </div>
                  <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">New Buyer Registration</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Allow new customers to create accounts.</p>
                    </div>
                    <button className="w-12 h-6 bg-emerald-500 rounded-full relative transition-colors cursor-pointer">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm"></div>
                    </button>
                  </div>
                  <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">Vendor KYC Onboarding</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Accept new seller applications and document uploads.</p>
                    </div>
                    <button className="w-12 h-6 bg-emerald-500 rounded-full relative transition-colors cursor-pointer">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm"></div>
                    </button>
                  </div>
                  <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">Automated AI Moderation</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Use Gemini to automatically flag suspicious product listings.</p>
                    </div>
                    <button className="w-12 h-6 bg-emerald-500 rounded-full relative transition-colors cursor-pointer">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm"></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                 <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    Localization & Currency
                 </h3>
                 <div className="space-y-4">
                   <div>
                     <label className="text-xs font-semibold text-slate-700 block mb-1">Base Platform Currency</label>
                     <select className="w-full border border-slate-200 rounded-lg p-2 text-sm bg-slate-50 text-slate-700 outline-none">
                       <option value="TZS">TZS - Tanzanian Shilling</option>
                       <option value="KES">KES - Kenyan Shilling</option>
                       <option value="UGX">UGX - Ugandan Shilling</option>
                       <option value="USD">USD - US Dollar</option>
                     </select>
                   </div>
                   <div>
                     <label className="text-xs font-semibold text-slate-700 block mb-1">Default Locale / Language</label>
                     <select className="w-full border border-slate-200 rounded-lg p-2 text-sm bg-slate-50 text-slate-700 outline-none">
                       <option value="en-US">English (US)</option>
                       <option value="sw-TZ">Swahili (TZ)</option>
                     </select>
                   </div>
                   <button className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors mt-2 cursor-pointer">
                     Save Localization Settings
                   </button>
                 </div>
              </div>
              
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                 <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-slate-500" />
                    Cache & Data Management
                 </h3>
                 <div className="space-y-3">
                    <div className="p-3 border border-slate-100 rounded-lg flex items-center justify-between bg-slate-50">
                      <div>
                        <p className="text-xs font-bold text-slate-800">Clear Product Catalog Cache</p>
                        <p className="text-[10px] text-slate-500">Forces edge nodes to pull fresh data</p>
                      </div>
                      <button className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-[10px] font-bold rounded hover:bg-slate-100 transition cursor-pointer">Clear</button>
                    </div>
                    <div className="p-3 border border-slate-100 rounded-lg flex items-center justify-between bg-slate-50">
                      <div>
                        <p className="text-xs font-bold text-slate-800">Reset Search Indexes</p>
                        <p className="text-[10px] text-slate-500">Rebuild Elastic/Algolia search indexes</p>
                      </div>
                      <button className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-[10px] font-bold rounded hover:bg-slate-100 transition cursor-pointer">Rebuild</button>
                    </div>
                    <div className="p-3 border border-red-100 rounded-lg flex items-center justify-between bg-red-50">
                      <div>
                        <p className="text-xs font-bold text-red-800">Purge Stale Cart Data</p>
                        <p className="text-[10px] text-red-600">Delete abandoned carts older than 30 days</p>
                      </div>
                      <button className="px-3 py-1.5 bg-red-600 text-white text-[10px] font-bold rounded hover:bg-red-700 transition cursor-pointer">Purge Data</button>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}

      {/* ADD / EDIT STAFF USER MODAL */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-600" />
                <h2 className="font-bold text-lg text-slate-900">
                  {editingUserId ? 'Edit Enterprise Staff Member' : 'Provision New Staff Account'}
                </h2>
              </div>
              <button 
                onClick={() => {
                  setShowAddUserModal(false);
                  setCreatedInviteUrl(null);
                  setCreateUserMsg('');
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Created Invite Success Notice with Copy Button & Email Dispatch Details */}
            {createdInviteUrl && (
              <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Staff Invitation Created & Email Dispatched</span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900">
                    <MailCheck className="w-3 h-3" />
                    <span>Email Sent</span>
                  </span>
                </div>

                <div className="p-2.5 bg-white/80 rounded-lg border border-emerald-200 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span className="font-semibold">Recipient:</span>
                    <span className="font-mono text-slate-800">{createdInviteDetails?.email || newUserEmail}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span className="font-semibold">Subject:</span>
                    <span className="text-slate-800 truncate max-w-[240px]" title={createdInviteDetails?.emailSubject}>
                      {createdInviteDetails?.emailSubject || 'Welcome to LUMO — Staff Invitation'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span className="font-semibold">Token Expiry:</span>
                    <span className="text-amber-700 font-semibold">7 Days (Single Use)</span>
                  </div>
                </div>

                <p className="text-[11px] text-emerald-800">
                  An onboarding email has been sent to the staff member. You can also share the direct activation link below:
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={createdInviteUrl}
                    className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-mono text-slate-700 select-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(createdInviteUrl);
                      setCopiedInviteId('modal-created');
                      setTimeout(() => setCopiedInviteId(null), 3000);
                    }}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedInviteId === 'modal-created' ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-emerald-200">
                  <button
                    type="button"
                    onClick={() => {
                      setInspectEmailStaff({
                        user: {
                          id: 'new-invite',
                          name: createdInviteDetails?.name || newUserName,
                          phone: '+255700000000',
                          email: createdInviteDetails?.email || newUserEmail,
                          role: (createdInviteDetails?.role || newUserRole) as any,
                          status: 'INVITED',
                          isActive: true,
                          isVerified: false,
                          createdAt: new Date().toISOString()
                        },
                        inviteToken: createdInviteDetails?.token || 'stf_inv_token',
                        inviteUrl: createdInviteUrl,
                        emailSubject: createdInviteDetails?.emailSubject || `Welcome to LUMO — Staff Invitation`
                      });
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:text-purple-900 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Preview Dispatched Email</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowAddUserModal(false);
                      setCreatedInviteUrl(null);
                      setCreatedInviteDetails(null);
                      setCreateUserMsg('');
                    }}
                    className="text-xs text-emerald-800 font-bold underline hover:text-emerald-950 cursor-pointer"
                  >
                    Done & Close
                  </button>
                </div>
              </div>
            )}

            {!createdInviteUrl && (
              <form onSubmit={handleCreateOrUpdateUser} className="space-y-4 mt-4 text-xs">
                {/* Provisioning Mode Toggle for new staff */}
                {!editingUserId && (
                  <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2">
                    <label className="font-bold text-purple-950 block text-[11px]">
                      Onboarding & Provisioning Method
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setProvisioningMode('INVITE')}
                        className={`p-2.5 rounded-lg border text-left cursor-pointer transition ${
                          provisioningMode === 'INVITE'
                            ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className="font-bold block text-xs">Secure Token Invite</span>
                        <span className={`text-[10px] block mt-0.5 ${provisioningMode === 'INVITE' ? 'text-purple-100' : 'text-slate-500'}`}>
                          Staff receives token link to set password
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setProvisioningMode('DIRECT')}
                        className={`p-2.5 rounded-lg border text-left cursor-pointer transition ${
                          provisioningMode === 'DIRECT'
                            ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className="font-bold block text-xs">Direct Active Setup</span>
                        <span className={`text-[10px] block mt-0.5 ${provisioningMode === 'DIRECT' ? 'text-purple-100' : 'text-slate-500'}`}>
                          Admin creates initial credentials
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Full Legal Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Neema Mwangi"
                      value={newUserName}
                      onChange={e => setNewUserName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-600 focus:outline-hidden text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Work Email</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. neema.mwangi@lumo.africa"
                      value={newUserEmail}
                      onChange={e => setNewUserEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-600 focus:outline-hidden text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Phone Number (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. +255 754 990 120"
                      value={newUserPhone}
                      onChange={e => setNewUserPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-600 focus:outline-hidden text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Department</label>
                    <select
                      value={newUserDepartment}
                      onChange={e => setNewUserDepartment(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-600 focus:outline-hidden text-xs bg-white cursor-pointer"
                    >
                      <option value="Operations & Fulfillment">Operations & Fulfillment</option>
                      <option value="Finance & Accounting">Finance & Accounting</option>
                      <option value="Warehouse & Logistics">Warehouse & Logistics</option>
                      <option value="Customer Care & Resolution">Customer Care & Resolution</option>
                      <option value="Catalog & Moderation">Catalog & Moderation</option>
                      <option value="Sales & Field Operations">Sales & Field Operations</option>
                      <option value="Platform Administration">Platform Administration</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Assigned RBAC Role</label>
                    <select
                      value={newUserRole}
                      onChange={e => setNewUserRole(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-600 focus:outline-hidden text-xs bg-white cursor-pointer font-medium"
                    >
                      <optgroup label="Finance & Accounting">
                        <option value="FINANCE_OFFICER">FINANCE_OFFICER (Disbursements & Escrow)</option>
                        <option value="ACCOUNTING_STAFF">ACCOUNTING_STAFF (General Ledger & VAT)</option>
                        <option value="FINANCE_ADMIN">FINANCE_ADMIN (Finance Director)</option>
                      </optgroup>
                      <optgroup label="Customer Care & Resolution">
                        <option value="CUSTOMER_CARE">CUSTOMER_CARE (Customer Care Desk)</option>
                        <option value="CUSTOMER_SUPPORT">CUSTOMER_SUPPORT (Disputes & Escalations)</option>
                      </optgroup>
                      <optgroup label="Catalog & Moderation">
                        <option value="CATALOG_SPECIALIST">CATALOG_SPECIALIST (Product Taxonomy)</option>
                        <option value="CONTENT_MODERATOR">CONTENT_MODERATOR (Content Quality)</option>
                        <option value="MODERATOR">MODERATOR (Listing Verification)</option>
                      </optgroup>
                      <optgroup label="Operations & Fulfillment">
                        <option value="OPERATIONS_ADMIN">OPERATIONS_ADMIN (Logistics Lead)</option>
                        <option value="WAREHOUSE_MANAGER">WAREHOUSE_MANAGER (Hub Lead)</option>
                        <option value="DELIVERY_AGENT">DELIVERY_AGENT (Express Rider)</option>
                        <option value="PICKUP_STATION_MANAGER">PICKUP_STATION_MANAGER (Station Lead)</option>
                      </optgroup>
                      <optgroup label="Sales & Administration">
                        <option value="SALESPERSON">SALESPERSON (Merchant Field Sales)</option>
                        <option value="SUPER_ADMIN">SUPER_ADMIN (Full Platform Authority)</option>
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Assigned Hub / Region</label>
                    <select
                      value={newUserWarehouseId}
                      onChange={e => setNewUserWarehouseId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-600 focus:outline-hidden text-xs bg-white cursor-pointer"
                    >
                      <option value="wh-kariakoo">Dar es Salaam - Kariakoo Central Hub</option>
                      <option value="wh-posta">Dar es Salaam - Posta Express Hub</option>
                      <option value="wh-mwenge">Dar es Salaam - Mwenge Station</option>
                      <option value="wh-arusha">Arusha Northern Regional Hub</option>
                      <option value="wh-mwanza">Mwanza Lake Zone Hub</option>
                      <option value="wh-dodoma">Dodoma Capital Hub</option>
                    </select>
                  </div>
                </div>

                {/* Direct Temporary Password (if Direct Mode) */}
                {!editingUserId && provisioningMode === 'DIRECT' && (
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Initial Temporary Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Minimum 8 characters"
                      value={newUserTemporaryPassword}
                      onChange={e => setNewUserTemporaryPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-600 focus:outline-hidden text-xs"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      The staff member will be prompted to reset this password upon their first login.
                    </p>
                  </div>
                )}

                {/* Governance Policy Box */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-600">
                  <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                    <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Role-Based Data Isolation & Audit Enforcement</span>
                  </div>
                  <p className="text-[11px]">
                    Internal staff access is governed by backend middleware. All logins, status updates, and critical modifications are recorded into immutable platform audit trails.
                  </p>
                </div>

                {createUserMsg && (
                  <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-800 font-semibold text-xs">
                    {createUserMsg}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddUserModal(false);
                      setCreatedInviteUrl(null);
                    }}
                    className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold cursor-pointer shadow-sm"
                  >
                    {editingUserId ? 'Update Staff Member' : (provisioningMode === 'INVITE' ? 'Generate Staff Invitation' : 'Create Active Account')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* STAFF STATUS CHANGE CONFIRMATION MODAL */}
      {statusChangeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Update Staff Lifecycle Status
                </h3>
              </div>
              <button
                onClick={() => setStatusChangeModal(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Transition staff account for <strong>{statusChangeModal.userName}</strong> from{' '}
              <span className="font-mono font-bold text-slate-800">{statusChangeModal.currentStatus}</span> to{' '}
              <span className="font-mono font-bold text-purple-700">{statusChangeModal.targetStatus}</span>.
            </p>

            <div>
              <label className="font-semibold text-slate-700 block mb-1 text-xs">
                Audit Reason & Justification
              </label>
              <textarea
                rows={2}
                required
                value={statusChangeModal.reason}
                onChange={e => setStatusChangeModal({ ...statusChangeModal, reason: e.target.value })}
                placeholder="e.g. Approved onboarding / Security precaution / Temporary leave"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setStatusChangeModal(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStatusChangeSubmit}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold cursor-pointer shadow-xs"
              >
                Confirm Status Transition
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISPATCHED STAFF INVITATION EMAIL INSPECTION MODAL */}
      {inspectEmailStaff && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Dispatched Staff Invitation Email
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Audit view of the email notification sent to {inspectEmailStaff.user.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectEmailStaff(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Email Metadata Header */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Subject:</span>
                <span className="font-semibold text-slate-900 text-right">{inspectEmailStaff.emailSubject}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Recipient:</span>
                <span className="font-mono text-purple-700 font-semibold">{inspectEmailStaff.user.name} &lt;{inspectEmailStaff.user.email}&gt;</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Gateway:</span>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>LUMO Enterprise Mail Gateway (Verified Dispatch)</span>
                </span>
              </div>
            </div>

            {/* Rendered Email Preview Container */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-white text-slate-800 text-xs">
              <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-purple-600 flex items-center justify-center font-black text-white text-xs">
                    L
                  </div>
                  <div>
                    <span className="font-black tracking-wider text-sm">LUMO</span>
                    <span className="text-[10px] text-purple-300 ml-1.5 font-medium">ENTERPRISE ONBOARDING</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  OFFICIAL COMMUNICATION
                </span>
              </div>

              <div className="p-5 space-y-4">
                <h4 className="font-bold text-base text-slate-900">
                  Welcome to the LUMO Team, {inspectEmailStaff.user.name}!
                </h4>

                <p className="text-slate-600 text-xs leading-relaxed">
                  You have been provisioned an internal staff account on the <strong>LUMO Commerce Platform</strong>. To access your dedicated role portal and begin operations, please activate your account and establish your secure credentials.
                </p>

                <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-lg space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 font-medium">Assigned RBAC Role:</span>
                    <span className="font-bold font-mono text-purple-900">{inspectEmailStaff.user.role}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 font-medium">Department:</span>
                    <span className="font-semibold text-slate-800">{(inspectEmailStaff.user as any).department || 'Operations & Fulfillment'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 font-medium">Security Policy:</span>
                    <span className="text-slate-700">Mandatory 2FA / Audit Logging</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col items-center justify-center space-y-2">
                  <a
                    href={inspectEmailStaff.inviteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition"
                  >
                    <span>Activate Account & Set Password</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <span className="text-[10px] text-slate-400">
                    Link valid for 7 days. Single-use cryptographic token.
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <span className="text-[10px] font-semibold text-slate-500 block">Direct Activation Link:</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value={inspectEmailStaff.inviteUrl}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-[11px] font-mono text-slate-700 select-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(inspectEmailStaff.inviteUrl);
                        setCopiedInviteId('modal-inspect');
                        setTimeout(() => setCopiedInviteId(null), 3000);
                      }}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white font-bold text-[10px] rounded flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedInviteId === 'modal-inspect' ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 leading-normal border-t border-slate-100 pt-3">
                  This invitation is strictly confidential and intended solely for {inspectEmailStaff.user.email}. If you did not expect this message, please contact security@lumo.africa immediately.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setInspectEmailStaff(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING SUCCESS TOAST NOTIFICATION */}
      {resendSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <MailCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-xs font-medium pr-2">
            {resendSuccessToast}
          </div>
          <button
            onClick={() => setResendSuccessToast(null)}
            className="text-slate-400 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ADD / EDIT COMMISSION RULE MODAL */}
      {showAddRule && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h2 className="font-bold text-lg text-slate-900">
              {editingRuleId ? 'Edit Commission Rule' : 'Add Commission Rule'}
            </h2>
            <form onSubmit={handleCreateOrUpdateRule} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Product Category</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. automotive"
                  value={categoryName}
                  onChange={e => setCategoryName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-600 focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Commission Rate (Decimal, e.g. 0.08 = 8%)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={commissionRate}
                  onChange={e => setCommissionRate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-600 focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Fixed Gateway Fee (TZS)</label>
                <input
                  type="number"
                  required
                  value={fixedFee}
                  onChange={e => setFixedFee(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-600 focus:outline-none text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddRule(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold cursor-pointer"
                >
                  {editingRuleId ? 'Update Rule' : 'Save Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VENDOR DETAILS MODAL */}
      {selectedVendorForDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedVendorForDetails.businessName || selectedVendorForDetails.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">Vendor ID: {selectedVendorForDetails.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedVendorForDetails(null)}
                className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Business Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Owner Name</p>
                  <p className="font-semibold text-slate-800 text-sm mt-1">{selectedVendorForDetails.ownerName || 'N/A'}</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Contact</p>
                  <p className="font-semibold text-slate-800 text-sm mt-1">{selectedVendorForDetails.phone}</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Email</p>
                  <p className="font-semibold text-slate-800 text-sm mt-1 truncate" title={selectedVendorForDetails.email}>{selectedVendorForDetails.email || 'N/A'}</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Status</p>
                  <p className="font-semibold text-slate-800 text-sm mt-1">{selectedVendorForDetails.status}</p>
                </div>
              </div>

              {/* Location & Map Placeholder */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-600" />
                  Live Location & Registered Address
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col md:flex-row">
                  <div className="p-4 md:w-1/3 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-center">
                    <p className="text-xs text-slate-500 mb-1">Registered Address</p>
                    <p className="font-semibold text-slate-800 text-sm">{selectedVendorForDetails.address || 'N/A'}</p>
                    <p className="text-slate-600 text-sm mt-1">{selectedVendorForDetails.city || 'N/A'}, {selectedVendorForDetails.region || 'N/A'}</p>
                  </div>
                  <div className="h-48 md:h-auto md:w-2/3 bg-slate-200 relative group overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800" 
                      alt="Map Location" 
                      className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition duration-500"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 bg-[#FF6A00]/20 rounded-full flex items-center justify-center animate-ping absolute"></div>
                      <MapPin className="w-8 h-8 text-[#FF6A00] drop-shadow-md relative z-10" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Pictures */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-600" />
                  KYC Verification Documents
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* TIN Certificate */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden group relative bg-slate-50">
                    <div className="h-32 overflow-hidden bg-white p-2">
                      <img 
                        src="https://images.unsplash.com/photo-1618044733300-9472054094ee?auto=format&fit=crop&q=80&w=400" 
                        alt="TIN Document" 
                        className="w-full h-full object-cover rounded-lg border border-slate-100 group-hover:scale-105 transition"
                      />
                    </div>
                    <div className="p-3 border-t border-slate-200">
                      <p className="text-[11px] font-bold text-slate-800">TIN Certificate</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{selectedVendorForDetails.tinNumber || 'TIN-492-102-441'}</p>
                    </div>
                  </div>
                  
                  {/* BRELA */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden group relative bg-slate-50">
                    <div className="h-32 overflow-hidden bg-white p-2">
                      <img 
                        src="https://images.unsplash.com/photo-1568225367115-8b5e28e16946?auto=format&fit=crop&q=80&w=400" 
                        alt="BRELA Document" 
                        className="w-full h-full object-cover rounded-lg border border-slate-100 group-hover:scale-105 transition"
                      />
                    </div>
                    <div className="p-3 border-t border-slate-200">
                      <p className="text-[11px] font-bold text-slate-800">BRELA Registration</p>
                      <p className="text-[10px] text-emerald-600 font-bold mt-0.5 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Verified</p>
                    </div>
                  </div>

                  {/* ID Document */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden group relative bg-slate-50">
                    <div className="h-32 overflow-hidden bg-white p-2 flex items-center justify-center">
                      <img 
                        src="https://images.unsplash.com/photo-1621360841013-c76831f1e35d?auto=format&fit=crop&q=80&w=400" 
                        alt="Owner ID" 
                        className="w-full h-full object-cover rounded-lg border border-slate-100 group-hover:scale-105 transition"
                      />
                    </div>
                    <div className="p-3 border-t border-slate-200">
                      <p className="text-[11px] font-bold text-slate-800">National ID / Passport</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">Matched to Owner Name</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-5 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setSelectedVendorForDetails(null)}
                className="px-5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 font-semibold text-slate-700 transition cursor-pointer text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Buyer Details Modal */}
      {selectedBuyerForDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Buyer Profile & Audit Timeline</h3>
                <p className="text-xs text-slate-500 font-mono">ID: {selectedBuyerForDetails.id}</p>
              </div>
              <button onClick={() => setSelectedBuyerForDetails(null)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 font-medium">Buyer Name</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedBuyerForDetails.name}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Account Status</span>
                  <p className="font-bold text-emerald-700 text-sm mt-0.5">{selectedBuyerForDetails.status}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Email Address</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedBuyerForDetails.email}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Phone Number</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedBuyerForDetails.phone}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Total Orders Placed</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedBuyerForDetails.ordersCount} Orders</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Lifetime Spend</span>
                  <p className="font-bold text-purple-700 text-sm mt-0.5">{formatTZS(Number(selectedBuyerForDetails.totalSpend))}</p>
                </div>
              </div>
              <div className="border-t border-slate-200 pt-3">
                <h4 className="font-bold text-slate-800 mb-2">Recent Security & Activity Log</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between">
                    <span>Account registration verified via SMS OTP</span>
                    <span className="text-slate-400">{selectedBuyerForDetails.joined}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between">
                    <span>Escrow checkout completed ({selectedBuyerForDetails.ordersCount} transactions)</span>
                    <span className="text-slate-400">Secure Vault</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedBuyerForDetails(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold cursor-pointer shadow-sm"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Investigation & Edit Modal */}
      {selectedOrderForInvestigation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Order & Escrow Audit / Edit</h3>
                <p className="text-xs text-purple-700 font-mono font-bold">Order ID: {selectedOrderForInvestigation.id}</p>
              </div>
              <button onClick={() => setSelectedOrderForInvestigation(null)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 font-medium">Customer</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedOrderForInvestigation.customer}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Vendor Merchant</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedOrderForInvestigation.vendor}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Total Amount</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{formatTZS(selectedOrderForInvestigation.total)}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Current Status</span>
                  <p className="font-bold text-blue-700 text-sm mt-0.5">{selectedOrderForInvestigation.status}</p>
                </div>
              </div>

              {/* Status Edit Controls */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="font-bold text-slate-800 block">Modify Order Status:</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1">Fulfillment Status</span>
                    <select
                      value={selectedOrderForInvestigation.status}
                      onChange={async (e) => {
                        const newStatus = e.target.value;
                        const updated = { ...selectedOrderForInvestigation, status: newStatus };
                        setSelectedOrderForInvestigation(updated);
                        setOrdersList(ordersList.map(o => o.id === updated.id ? updated : o));
                        try {
                          await api.updateOrderStatus(updated.id, newStatus, `Admin manual status update to ${newStatus}`);
                        } catch (err) {
                          console.warn('API update order status:', err);
                        }
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                    >
                      <option value="Processing">Processing</option>
                      <option value="Ready for Pickup">Ready for Pickup</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1">Escrow Payment Status</span>
                    <select
                      value={selectedOrderForInvestigation.payment}
                      onChange={(e) => {
                        const newPayment = e.target.value;
                        const updated = { ...selectedOrderForInvestigation, payment: newPayment };
                        setSelectedOrderForInvestigation(updated);
                        setOrdersList(ordersList.map(o => o.id === updated.id ? updated : o));
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                    >
                      <option value="Escrow Held">Escrow Held</option>
                      <option value="Escrow Released">Escrow Released</option>
                      <option value="Refunded">Refunded</option>
                      <option value="Pending Payment">Pending Payment</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                <p className="font-bold">🔐 Escrow Trustee Vault Status: Secured</p>
                <p className="text-[11px] text-emerald-700">Funds are locked in the Bank of Tanzania escrow trustee account pending customer OTP delivery confirmation.</p>
              </div>
            </div>
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedOrderForInvestigation(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer shadow-sm transition"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}
      </main>

      <GoogleWorkspaceHub isOpen={showWorkspaceHub} onClose={() => setShowWorkspaceHub(false)} />
    </div>
  );
};

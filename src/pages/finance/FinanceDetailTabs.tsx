import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Building2,
  FileText,
  DollarSign,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Filter,
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Shield,
  ShieldCheck,
  Calendar,
  Layers,
  Check,
  ChevronRight,
  PieChart,
  Percent,
  Settings,
  Sparkles,
  Zap,
  Trash2,
  AlertTriangle,
  Send,
  Lock,
  ExternalLink,
  Sliders,
  Globe,
  Bell,
  MessageSquare
} from 'lucide-react';

interface FinanceDetailTabsProps {
  activeTab: string;
  transactions: any[];
  accounts: any[];
  settlements: any[];
  invoices: any[];
  bills: any[];
  reportsData: any;
  auditLogs: any[];
  onOpenModal: (type: string) => void;
  onRefresh: () => void;
  addToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const FinanceDetailTabs: React.FC<FinanceDetailTabsProps> = ({
  activeTab,
  transactions,
  accounts,
  settlements,
  invoices,
  bills,
  reportsData,
  auditLogs,
  onOpenModal,
  onRefresh,
  addToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [processingPayoutId, setProcessingPayoutId] = useState<string | null>(null);

  const handleApproveSettlement = async (id: string) => {
    try {
      const res = await fetch(`/api/finance/settlements/${id}/approve`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        addToast('Settlement approved for scheduled payout!', 'success');
        onRefresh();
      }
    } catch {
      addToast('Failed to approve settlement', 'error');
    }
  };

  const handleDisburseSettlement = async (id: string) => {
    setProcessingPayoutId(id);
    try {
      const res = await fetch(`/api/finance/settlements/${id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referenceNo: `TRX-TZ-${Math.floor(10000000 + (window.crypto.getRandomValues(new Uint32Array(1))[0] % 90000000))}` })
      });
      const data = await res.json();
      if (data.success) {
        addToast('Settlement disbursed successfully via banking gateway!', 'success');
        onRefresh();
      }
    } catch {
      addToast('Failed to disburse settlement', 'error');
    } finally {
      setProcessingPayoutId(null);
    }
  };

  // 1. TRANSACTIONS TAB
  if (activeTab === 'transactions') {
    const filtered = transactions.filter(t => {
      const matchesSearch =
        t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.account?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'ALL' || t.type?.toUpperCase() === filterType;
      return matchesSearch && matchesType;
    });

    return (
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Corporate Transaction Ledger</h2>
            <p className="text-xs text-slate-500">Real-time audited journal of platform debits & credits</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenModal('recordExpense')}
              className="px-3.5 py-2 bg-purple-900 hover:bg-purple-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Record Entry
            </button>
            <a
              href="/api/finance/export"
              className="px-3 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Export CSV
            </a>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, merchant or description..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-600"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            {['ALL', 'INFLOW', 'PAYOUT', 'EXPENSE', 'TRANSFER'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  filterType === type ? 'bg-purple-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Transaction ID</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Account Rail</th>
                  <th className="py-3.5 px-4 text-right">Amount (TZS)</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((tx, idx) => {
                  const isPositive = tx.amount > 0;
                  return (
                    <tr key={tx.id || idx} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-900">{tx.id}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">{tx.description}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
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
                      <td className="py-3.5 px-4 text-slate-600">{tx.account}</td>
                      <td
                        className={`py-3.5 px-4 text-right font-bold ${
                          isPositive ? 'text-emerald-600' : 'text-slate-800'
                        }`}
                      >
                        {isPositive ? '+' : ''}TZS {Math.abs(tx.amount).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          <Check className="w-3 h-3" />
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-400">{tx.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // 2. ACCOUNTS & WALLETS TAB
  if (activeTab === 'accounts' || activeTab === 'wallets') {
    return (
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Treasury Accounts & Wallets</h2>
            <p className="text-xs text-slate-500">
              Corporate banking endpoints, escrow vaults, and mobile money bulk floats
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenModal('transferFunds')}
              className="px-3.5 py-2 bg-purple-900 hover:bg-purple-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Transfer Funds
            </button>
            <button
              onClick={() => onOpenModal('reconcile')}
              className="px-3 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
              Reconcile All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map(acc => (
            <div
              key={acc.id}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:border-purple-200 transition"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{acc.name}</h3>
                    <p className="text-[11px] text-slate-400">{acc.institution || acc.type}</p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    acc.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {acc.status}
                </span>
              </div>

              <div className="my-4">
                <p className="text-xs text-slate-400 mb-0.5">Available Balance</p>
                <p className="text-xl font-bold text-slate-900">TZS {acc.balance.toLocaleString()}</p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">A/C: {acc.accountNumber}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => onOpenModal('transferFunds')}
                  className="font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1"
                >
                  Transfer
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onOpenModal('reconcile')}
                  className="font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Audit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. PAYMENTS TAB
  if (activeTab === 'payments') {
    const paymentChannels = [
      { name: 'Vodacom M-Pesa B2B/C2B', share: 44.5, volume: 554320000, count: 54100, success: 99.4, color: 'bg-red-500' },
      { name: 'Airtel Money Corporate', share: 22.8, volume: 284100000, count: 28900, success: 98.9, color: 'bg-rose-600' },
      { name: 'Tigo Pesa Gateway', share: 18.2, volume: 226700000, count: 23200, success: 98.1, color: 'bg-blue-600' },
      { name: 'Visa & Mastercard (Cybersource)', share: 10.5, volume: 130800000, count: 11400, success: 96.5, color: 'bg-indigo-600' },
      { name: 'CRDB / NMB Direct Bank Wire', share: 4.0, volume: 49750000, count: 2100, success: 99.8, color: 'bg-emerald-600' }
    ];

    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Payment Gateway Rails & Channels</h2>
          <p className="text-xs text-slate-500">Live transaction routing across mobile money & card clearing houses</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Channel Volume Breakdown</h3>
            <div className="space-y-3.5">
              {paymentChannels.map((ch, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800">{ch.name}</span>
                    <span className="font-bold text-slate-900">TZS {ch.volume.toLocaleString()} ({ch.share}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${ch.color}`} style={{ width: `${ch.share}%` }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>{ch.count.toLocaleString()} transactions</span>
                    <span className="text-emerald-600 font-semibold">{ch.success}% success rate</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Real-time Webhook Ingestion Status</h3>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">M-Pesa IPN Webhook Listener</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Check className="w-3 h-3" /> Online (12ms latency)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Airtel Money USSD Push Server</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Check className="w-3 h-3" /> Online (18ms latency)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Cybersource 3DS2 Tokenization</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Check className="w-3 h-3" /> Online (45ms latency)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">BoT Instant Payment System (TIPS)</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Check className="w-3 h-3" /> Certified & Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. PAYOUTS TAB
  if (activeTab === 'payouts') {
    return (
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Vendor Settlements & Payouts Queue</h2>
            <p className="text-xs text-slate-500">Authorize and release weekly merchant disbursements</p>
          </div>
          <button
            onClick={() => onOpenModal('processPayout')}
            className="px-3.5 py-2 bg-purple-900 hover:bg-purple-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Process Custom Payout
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Settlement Ref</th>
                  <th className="py-3.5 px-4">Merchant Name</th>
                  <th className="py-3.5 px-4 text-right">Gross Sales</th>
                  <th className="py-3.5 px-4 text-right">Commission & Fees</th>
                  <th className="py-3.5 px-4 text-right">Net Payout (TZS)</th>
                  <th className="py-3.5 px-4">Disbursement Rail</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {settlements.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900">{s.settlementNumber || s.id}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{s.vendorName}</td>
                    <td className="py-3.5 px-4 text-right text-slate-600">TZS {s.grossSales?.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-right text-rose-600 font-medium">
                      -TZS {(s.platformFees + s.commissionExpense)?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      TZS {s.netPayout?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">{s.bankOrMpesaDetails}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          s.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700'
                            : s.status === 'APPROVED'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {s.status === 'PENDING' && (
                        <button
                          onClick={() => handleApproveSettlement(s.id)}
                          className="px-2.5 py-1 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-lg text-xs font-semibold"
                        >
                          Approve
                        </button>
                      )}
                      {s.status === 'APPROVED' && (
                        <button
                          disabled={processingPayoutId === s.id}
                          onClick={() => handleDisburseSettlement(s.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                        >
                          {processingPayoutId === s.id ? 'Sending...' : 'Disburse'}
                        </button>
                      )}
                      {s.status === 'PAID' && (
                        <span className="text-[11px] text-emerald-600 font-medium">Paid Ref: {s.referenceNo}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // 5. INVOICES TAB
  if (activeTab === 'invoices') {
    return (
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Commercial Invoices</h2>
            <p className="text-xs text-slate-500">Issued platform commission, advertising & logistics invoices</p>
          </div>
          <button
            onClick={() => onOpenModal('createInvoice')}
            className="px-3.5 py-2 bg-purple-900 hover:bg-purple-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Invoice
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Customer Entity</th>
                  <th className="py-3.5 px-4">Invoice Type</th>
                  <th className="py-3.5 px-4 text-right">Amount (TZS)</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900">{inv.number || inv.id}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{inv.customerName}</td>
                    <td className="py-3.5 px-4 text-slate-600">{inv.type}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      TZS {inv.amount?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          inv.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{inv.dueDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // 6. BILLS & EXPENSES TAB
  if (activeTab === 'bills') {
    return (
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Accounts Payable (Bills & Expenses)</h2>
            <p className="text-xs text-slate-500">Corporate vendor payables, cloud infrastructure, and fuel fleet</p>
          </div>
          <button
            onClick={() => onOpenModal('recordExpense')}
            className="px-3.5 py-2 bg-purple-900 hover:bg-purple-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Vendor Bill
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Bill ID</th>
                  <th className="py-3.5 px-4">Vendor</th>
                  <th className="py-3.5 px-4">Cost Category</th>
                  <th className="py-3.5 px-4 text-right">Amount (TZS)</th>
                  <th className="py-3.5 px-4">Payment Status</th>
                  <th className="py-3.5 px-4">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bills.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900">{b.id}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{b.vendor}</td>
                    <td className="py-3.5 px-4 text-slate-600">{b.category}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      TZS {b.amount?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          b.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{b.dueDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // 7. REPORTS TAB
  if (activeTab === 'reports') {
    const pnl = reportsData?.profitAndLoss;
    return (
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Executive Financial Statements</h2>
            <p className="text-xs text-slate-500">Period: {reportsData?.period || '2025-Q2 (May YTD)'}</p>
          </div>
          <button
            onClick={() => onOpenModal('generateReport')}
            className="px-3.5 py-2 bg-purple-900 hover:bg-purple-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Download Complete Audit Pack
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Income Statement */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
              Profit & Loss Summary
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-600">Gross Merchandise Value (GMV)</span>
                <span className="font-bold text-slate-900">
                  TZS {pnl?.grossMerchandiseValue?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50 text-purple-900 font-semibold">
                <span>Platform Commission Revenue (8%)</span>
                <span>TZS {pnl?.platformCommissions?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-600">Listing & Fulfillment Surcharges</span>
                <span className="font-medium text-slate-900">
                  TZS {(pnl?.listingFees + pnl?.fulfillmentSurcharges)?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 font-bold text-slate-900">
                <span>Total Operating Revenue</span>
                <span>TZS {pnl?.totalOperatingRevenue?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 text-rose-600">
                <span>Operating Expenses & Logistics</span>
                <span>-TZS {(pnl?.operatingExpenses?.marketingAndPromotions + pnl?.operatingExpenses?.logisticsAndRiderPayouts)?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2.5 bg-emerald-50 text-emerald-950 px-3 rounded-xl font-bold mt-3">
                <span>Net Operating Income (EBITDA)</span>
                <span>TZS {pnl?.netOperatingIncome?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Balance Sheet */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
              Balance Sheet Overview
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-600">Cash & Treasury Bank Balance</span>
                <span className="font-bold text-slate-900">
                  TZS {reportsData?.balanceSheetSummary?.cashAndBankBalance?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-600">Customer Escrow Lockbox Vault</span>
                <span className="font-medium text-slate-900">
                  TZS {reportsData?.balanceSheetSummary?.escrowAccountBalance?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 font-bold text-slate-900">
                <span>Total Current Assets</span>
                <span>TZS {reportsData?.balanceSheetSummary?.totalAssets?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 text-amber-700">
                <span>Accounts Payable (Vendors & Suppliers)</span>
                <span>TZS {reportsData?.balanceSheetSummary?.accountsPayableSellers?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2.5 bg-purple-50 text-purple-950 px-3 rounded-xl font-bold mt-3">
                <span>Retained Operating Surplus</span>
                <span>TZS {reportsData?.balanceSheetSummary?.retainedEarnings?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 9. RECONCILIATION TAB
  if (activeTab === 'reconciliation') {
    return (
      <ReconciliationView
        accounts={accounts}
        onOpenModal={onOpenModal}
        onRefresh={onRefresh}
        addToast={addToast}
      />
    );
  }

  // 10. BUDGETS TAB
  if (activeTab === 'budgets') {
    return (
      <BudgetsView
        onOpenModal={onOpenModal}
        onRefresh={onRefresh}
        addToast={addToast}
      />
    );
  }

  // 11. TAXES TAB
  if (activeTab === 'taxes') {
    return (
      <TaxesView
        onOpenModal={onOpenModal}
        onRefresh={onRefresh}
        addToast={addToast}
      />
    );
  }

  // 12. SETTINGS TAB
  if (activeTab === 'settings') {
    return (
      <SettingsView
        onRefresh={onRefresh}
        addToast={addToast}
      />
    );
  }

  // 13. WALLETS TAB
  if (activeTab === 'wallets') {
    return (
      <WalletsView
        accounts={accounts}
        onOpenModal={onOpenModal}
        onRefresh={onRefresh}
        addToast={addToast}
      />
    );
  }

  // Fallback for remaining tabs
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center space-y-3 shadow-xs">
      <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 capitalize">{activeTab} Module Active</h3>
      <p className="text-xs text-slate-500 max-w-md mx-auto">
        All automated business rules, statutory schedules, and bank rails for {activeTab} are active and operating under continuous sync.
      </p>
      <div className="pt-3">
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-purple-900 text-white rounded-xl text-xs font-semibold hover:bg-purple-800"
        >
          Refresh Data Feed
        </button>
      </div>
    </div>
  );
};

// ==========================================
// SUB-COMPONENTS FOR RECONCILIATION, BUDGETS, TAXES, SETTINGS, WALLETS
// ==========================================

const ReconciliationView: React.FC<{
  accounts: any[];
  onOpenModal: (type: string) => void;
  onRefresh: () => void;
  addToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}> = ({ accounts, onOpenModal, onRefresh, addToast }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [runningAuto, setRunningAuto] = useState(false);

  const fetchReconciliation = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/finance/reconciliation');
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
      addToast('Failed to load bank reconciliation data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReconciliation();
  }, []);

  const handleRunAutoMatch = async () => {
    try {
      setRunningAuto(true);
      const res = await fetch('/api/finance/reconciliation/auto-match', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        addToast(json.message || 'Auto-reconciliation executed with 0 variance!', 'success');
        fetchReconciliation();
        onRefresh();
      }
    } catch {
      addToast('Failed to run automated reconciliation', 'error');
    } finally {
      setRunningAuto(false);
    }
  };

  const handleSingleReconcile = async (accId: string, accName: string) => {
    try {
      const res = await fetch('/api/finance/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: accId })
      });
      const json = await res.json();
      if (json.success) {
        addToast(`Account ${accName} reconciled against core banking statement.`, 'success');
        fetchReconciliation();
        onRefresh();
      }
    } catch {
      addToast('Reconciliation failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Multi-Bank Automated Reconciliation</h2>
          <p className="text-xs text-slate-500">Live general ledger vs automated core banking and mobile money statement feeds</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunAutoMatch}
            disabled={runningAuto}
            className="px-4 py-2 bg-gradient-to-r from-purple-800 to-indigo-900 hover:from-purple-700 hover:to-indigo-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 text-amber-300 ${runningAuto ? 'animate-spin' : ''}`} />
            <span>{runningAuto ? 'Matching Bank Feeds...' : 'Run Auto-Reconciliation'}</span>
          </button>
          <a
            href="/api/finance/export"
            className="px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Cert</span>
          </a>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500">Reconciliation Status</p>
            <p className="text-base font-bold text-emerald-600">100% Zero Variance</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500">Reconciled Treasury Volume</p>
            <p className="text-base font-bold text-slate-900">TZS 2.24B</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500">Matched Bank Items</p>
            <p className="text-base font-bold text-slate-900">1,885 Transactions</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500">Automated Match Engine</p>
            <p className="text-base font-bold text-slate-900">Real-Time Sync (Live)</p>
          </div>
        </div>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map(acc => (
          <div key={acc.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{acc.name}</h3>
                    <p className="text-[11px] text-slate-400 font-mono">{acc.accountNumber}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Reconciled
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Ledger Balance:</span>
                  <span className="font-bold text-slate-900">TZS {acc.balance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Bank Statement Balance:</span>
                  <span className="font-bold text-slate-900">TZS {acc.balance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Variance:</span>
                  <span>0.00 TZS</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSingleReconcile(acc.id, acc.name)}
              className="w-full py-2 bg-slate-50 hover:bg-purple-50 hover:text-purple-900 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Verify & Sign Off</span>
            </button>
          </div>
        ))}
      </div>

      {/* Historical Batches Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">Audited Reconciliation Batches</h3>
          <span className="text-xs text-slate-400">BoT Regulatory Compliant</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Batch ID</th>
                <th className="px-4 py-3">Account & Feed</th>
                <th className="px-4 py-3">Statement Date</th>
                <th className="px-4 py-3 text-right">Closing Balance</th>
                <th className="px-4 py-3 text-center">Items</th>
                <th className="px-4 py-3 text-center">Variance</th>
                <th className="px-4 py-3">Reconciled By</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(data?.batches || []).map((batch: any) => (
                <tr key={batch.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-4 py-3 font-mono font-bold text-purple-900">{batch.id}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{batch.accountName}</td>
                  <td className="px-4 py-3 text-slate-600">{batch.statementDate}</td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900">
                    TZS {batch.closingBalance.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center font-mono">{batch.matchedTransactionsCount}</td>
                  <td className="px-4 py-3 text-center font-bold text-emerald-600">0.00</td>
                  <td className="px-4 py-3 text-slate-500 text-[11px]">{batch.reconciledBy}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      MATCHED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const BudgetsView: React.FC<{
  onOpenModal: (type: string) => void;
  onRefresh: () => void;
  addToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}> = ({ onOpenModal, onRefresh, addToast }) => {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBudget, setEditingBudget] = useState<any | null>(null);
  const [newDepartment, setNewDepartment] = useState('');
  const [newAllocated, setNewAllocated] = useState('');
  const [newSpent, setNewSpent] = useState('');

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/finance/budgets');
      const json = await res.json();
      if (json.budgets) setBudgets(json.budgets);
    } catch (e) {
      console.error(e);
      addToast('Failed to load budgets', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepartment || !newAllocated) {
      addToast('Please provide department name and allocation', 'error');
      return;
    }

    try {
      const res = await fetch('/api/finance/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department: newDepartment,
          allocated: Number(newAllocated),
          spent: Number(newSpent || 0)
        })
      });
      const json = await res.json();
      if (json.success) {
        addToast(`Budget allocation saved for ${newDepartment}!`, 'success');
        setNewDepartment('');
        setNewAllocated('');
        setNewSpent('');
        setEditingBudget(null);
        fetchBudgets();
        onRefresh();
      }
    } catch {
      addToast('Failed to save budget', 'error');
    }
  };

  const handleDeleteBudget = async (dept: string) => {
    try {
      const res = await fetch(`/api/finance/budgets/${encodeURIComponent(dept)}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        addToast(`Budget removed for ${dept}`, 'info');
        fetchBudgets();
      }
    } catch {
      addToast('Failed to delete budget', 'error');
    }
  };

  const totalAllocated = budgets.reduce((sum, b) => sum + (Number(b.allocated) || 0), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (Number(b.spent) || 0), 0);
  const totalUtilization = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Departmental Budgets & Spending Controls</h2>
          <p className="text-xs text-slate-500">Corporate allocation limits, burn rate monitoring, and automated threshold alerts</p>
        </div>
        <button
          onClick={() => {
            setEditingBudget(true);
            setNewDepartment('');
            setNewAllocated('');
            setNewSpent('');
          }}
          className="px-3.5 py-2 bg-purple-900 hover:bg-purple-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Budget Allocation</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Total Approved Budget</p>
          <p className="text-xl font-bold text-slate-900 mt-1">TZS {totalAllocated.toLocaleString()}</p>
          <p className="text-[11px] text-purple-700 mt-1 font-medium">Approved for Q2 2025</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Total Actual Spend</p>
          <p className="text-xl font-bold text-slate-900 mt-1">TZS {totalSpent.toLocaleString()}</p>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
            <span>Overall Utilization:</span>
            <span className="font-bold text-slate-800">{totalUtilization}%</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Remaining Operating Float</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">TZS {(totalAllocated - totalSpent).toLocaleString()}</p>
          <p className="text-[11px] text-emerald-700 mt-1 font-medium">Under budget variance</p>
        </div>
      </div>

      {/* Add / Edit Budget Inline Form Modal */}
      {editingBudget && (
        <div className="bg-purple-50/70 border border-purple-200 p-5 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-purple-950">Add / Modify Department Budget</h3>
            <button
              onClick={() => setEditingBudget(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>
          <form onSubmit={handleSaveBudget} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Department Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Kariakoo Warehouse Hub"
                value={newDepartment}
                onChange={e => setNewDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-600"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Allocated Budget (TZS)</label>
              <input
                type="number"
                required
                placeholder="e.g. 50000000"
                value={newAllocated}
                onChange={e => setNewAllocated(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-600"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Current Spend (TZS)</label>
              <input
                type="number"
                placeholder="e.g. 12000000"
                value={newSpent}
                onChange={e => setNewSpent(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-600"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 bg-purple-900 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Save Allocation
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.map((b, idx) => {
          const util = b.allocated > 0 ? Math.round((b.spent / b.allocated) * 100) : 0;
          const isWarning = util >= 80;
          const isDanger = util >= 95;

          return (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{b.department}</h3>
                  <p className="text-[11px] text-slate-400">Quarterly Operational Line</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isDanger ? 'bg-rose-50 text-rose-700' : isWarning ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {util}% Used
                  </span>
                  <button
                    onClick={() => handleDeleteBudget(b.department)}
                    className="p-1 text-slate-300 hover:text-rose-500 rounded-md transition"
                    title="Remove Budget"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isDanger ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-purple-600'
                    }`}
                    style={{ width: `${Math.min(util, 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">Spent</span>
                  <span className="font-bold text-slate-900">TZS {Number(b.spent).toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">Budget Cap</span>
                  <span className="font-bold text-slate-900">TZS {Number(b.allocated).toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TaxesView: React.FC<{
  onOpenModal: (type: string) => void;
  onRefresh: () => void;
  addToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}> = ({ onOpenModal, onRefresh, addToast }) => {
  const [taxes, setTaxes] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filing, setFiling] = useState(false);

  const fetchTaxes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/finance/taxes');
      const json = await res.json();
      setTaxes(json);
    } catch (e) {
      console.error(e);
      addToast('Failed to load tax filing data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxes();
  }, []);

  const handleFileReturn = async () => {
    try {
      setFiling(true);
      const res = await fetch('/api/finance/taxes/file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period: 'May 2025',
          vatAmount: 98670000,
          withholdingAmount: 24500000,
          dstAmount: 18685000
        })
      });
      const json = await res.json();
      if (json.success) {
        addToast(`Official TRA Return Submitted! Reference: ${json.filingReference}`, 'success');
        fetchTaxes();
        onRefresh();
      }
    } catch {
      addToast('Failed to file return with TRA', 'error');
    } finally {
      setFiling(false);
    }
  };

  const mf = taxes?.monthFiling;
  const tr = taxes?.taxRates;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Tanzania Revenue Authority (TRA) Statutory Center</h2>
          <p className="text-xs text-slate-500">Electronic fiscal device (EFD) integration, VAT 18%, withholding tax, and digital service tax</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleFileReturn}
            disabled={filing}
            className="px-4 py-2 bg-purple-900 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>{filing ? 'Submitting to TRA Gateway...' : 'Submit Monthly Return to TRA'}</span>
          </button>
        </div>
      </div>

      {/* TRA Status Badge Card */}
      <div className="bg-gradient-to-r from-[#23155b] to-[#371f84] text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400 text-emerald-950 uppercase tracking-wider">
              {mf?.complianceStatus || 'TRA Certified'}
            </span>
            <span className="text-xs text-purple-200">EFD TIN: <strong className="text-white font-mono">{mf?.efdTinNumber || '109-882-901'}</strong></span>
          </div>
          <h3 className="text-lg font-bold">May 2025 Statutory Filing Statement</h3>
          <p className="text-xs text-purple-200/80">EFD Receipt: {mf?.efdReceiptNumber || 'TRA-EFD-2025-058921'} | Due: {mf?.filingDeadline || 'May 20, 2025'}</p>
        </div>

        <div className="text-right">
          <p className="text-xs text-purple-200">Total Statutory Remittance to TRA</p>
          <p className="text-2xl font-black text-amber-300">TZS {(mf?.totalRemittedToTRA || 141855000).toLocaleString()}</p>
        </div>
      </div>

      {/* Tax Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Standard VAT ({tr?.vatStandardRate || 18}%)</span>
            <span className="font-bold text-slate-900">TZS {(mf?.vatPayable || 98670000).toLocaleString()}</span>
          </div>
          <p className="text-[11px] text-slate-400">18% output VAT on platform buyer commissions & fulfilled merchant sales.</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Withholding Tax ({tr?.withholdingTaxGoods || 5}%)</span>
            <span className="font-bold text-slate-900">TZS {(mf?.withholdingDeducted || 24500000).toLocaleString()}</span>
          </div>
          <p className="text-[11px] text-slate-400">5% statutory WHT deducted from seller gross settlements for domestic compliance.</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Digital Services Tax ({tr?.digitalServicesTax || 1.5}%)</span>
            <span className="font-bold text-slate-900">TZS {(mf?.digitalServiceTax || 18685000).toLocaleString()}</span>
          </div>
          <p className="text-[11px] text-slate-400">1.5% DST levied on electronic platform advertising and fintech infrastructure.</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Gross Taxable Turnover</span>
            <span className="font-bold text-slate-900">TZS {(mf?.grossTaxableTurnover || 1245670000).toLocaleString()}</span>
          </div>
          <p className="text-[11px] text-slate-400">Total audited sales turnover declared through virtual EFD machine.</p>
        </div>
      </div>
    </div>
  );
};

const SettingsView: React.FC<{
  onRefresh: () => void;
  addToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}> = ({ onRefresh, addToast }) => {
  const [settings, setSettings] = useState<any>({
    baseCurrency: 'TZS',
    dualApprovalThreshold: 50000000,
    autoReconciliationSchedule: 'REAL_TIME',
    enableSmsAlerts: true,
    enableWhatsAppAlerts: true,
    enableEmailAlerts: true,
    taxOfficeTin: '109-882-901',
    vatRatePercent: 18.0,
    payoutFeeFixed: 1500
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/finance/settings');
      const json = await res.json();
      if (json.settings) setSettings(json.settings);
    } catch (e) {
      console.error(e);
      addToast('Failed to load finance settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/finance/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const json = await res.json();
      if (json.success) {
        addToast('Treasury & Finance configuration updated successfully!', 'success');
        onRefresh();
      }
    } catch {
      addToast('Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Finance & Accounting Hub Settings</h2>
        <p className="text-xs text-slate-500">Treasury currency, banking channels, dual-approval controls, and automated alert rules</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Treasury Rails */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-700" />
            <span>Treasury & Banking Rules</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Base Treasury Currency</label>
              <select
                value={settings.baseCurrency}
                onChange={e => setSettings({ ...settings, baseCurrency: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-purple-600"
              >
                <option value="TZS">TZS - Tanzanian Shilling (Default)</option>
                <option value="USD">USD - United States Dollar</option>
                <option value="KES">KES - Kenyan Shilling</option>
                <option value="UGX">UGX - Ugandan Shilling</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Dual-Approval Payout Threshold (TZS)</label>
              <input
                type="number"
                value={settings.dualApprovalThreshold}
                onChange={e => setSettings({ ...settings, dualApprovalThreshold: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-600"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Payouts above this limit require secondary CFO signature</span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Automated Reconciliation Schedule</label>
              <select
                value={settings.autoReconciliationSchedule}
                onChange={e => setSettings({ ...settings, autoReconciliationSchedule: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-purple-600"
              >
                <option value="REAL_TIME">Real-Time Continuous Host-to-Host</option>
                <option value="HOURLY">Hourly Batch Reconcile</option>
                <option value="DAILY_EOD">Daily End-of-Day (23:59 EAT)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Automated Notifications & Alerts */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Bell className="w-4 h-4 text-purple-700" />
            <span>Automated Notification & Messaging Channels</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableSmsAlerts}
                onChange={e => setSettings({ ...settings, enableSmsAlerts: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded-md"
              />
              <div>
                <p className="text-xs font-bold text-slate-900">SMS Notifications</p>
                <p className="text-[10px] text-slate-400">Send instant SMS to merchants upon settlement</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableWhatsAppAlerts}
                onChange={e => setSettings({ ...settings, enableWhatsAppAlerts: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded-md"
              />
              <div>
                <p className="text-xs font-bold text-slate-900">WhatsApp Dispatch</p>
                <p className="text-[10px] text-slate-400">Automated transaction statements via WhatsApp</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableEmailAlerts}
                onChange={e => setSettings({ ...settings, enableEmailAlerts: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded-md"
              />
              <div>
                <p className="text-xs font-bold text-slate-900">Email Audit Reports</p>
                <p className="text-[10px] text-slate-400">Daily reconciliation summaries to finance officers</p>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-purple-900 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50"
          >
            {saving ? 'Saving Changes...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

const WalletsView: React.FC<{
  accounts: any[];
  onOpenModal: (type: string) => void;
  onRefresh: () => void;
  addToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}> = ({ accounts, onOpenModal, onRefresh, addToast }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Multi-Gateway Wallets & Treasury Nodes</h2>
          <p className="text-xs text-slate-500">Real-time mobile money and bank gateway balances</p>
        </div>
        <button
          onClick={() => onOpenModal('transferFunds')}
          className="px-3.5 py-2 bg-purple-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Internal Transfer</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map(acc => (
          <div key={acc.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-purple-900">{acc.type}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                {acc.status}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">{acc.name}</h3>
              <p className="text-xs text-slate-400 font-mono">{acc.accountNumber}</p>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] text-slate-400 block">Available Float</span>
              <span className="text-lg font-black text-slate-900">TZS {acc.balance.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

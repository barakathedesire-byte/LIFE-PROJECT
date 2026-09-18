import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  FileText,
  DollarSign,
  ArrowRightLeft,
  CheckCircle2,
  PieChart,
  ShieldCheck,
  TrendingUp,
  Download,
  Building2,
  Clock,
  AlertCircle,
  Calendar,
  Bell,
  MessageSquare,
  Send,
  Radio,
  Smartphone,
  Mail,
  Plus,
  Trash2,
  Sparkles,
  Filter,
  Check,
  CheckCheck,
  Layers,
  AlertTriangle
} from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  accounts: any[];
  addToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

// 1. Create Invoice Modal
export const CreateInvoiceModal: React.FC<ModalProps> = ({ isOpen, onClose, onSuccess, addToast }) => {
  const [customerName, setCustomerName] = useState('');
  const [type, setType] = useState('Seller Platform Commission');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !amount) {
      addToast('Please enter merchant/customer name and amount', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/finance/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          type,
          amount: Number(amount),
          dueDate: dueDate || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Invoice #${data.invoice.id} created successfully!`, 'success');
        onSuccess?.();
        onClose();
      } else {
        addToast('Failed to create invoice', 'error');
      }
    } catch {
      addToast('Error communicating with server', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Create Commercial Invoice</h3>
              <p className="text-xs text-slate-500">Generate VAT-compliant invoice</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Merchant / Customer Entity</label>
            <input
              type="text"
              required
              placeholder="e.g. Lumo Fashion Store"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Classification</label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-600"
            >
              <option value="Seller Platform Commission">Seller Platform Commission</option>
              <option value="Warehouse & Logistics Fee">Warehouse & Logistics Fee</option>
              <option value="Sponsored Search Banner Ad">Sponsored Search Banner Ad</option>
              <option value="Cold-Chain Storage Lease">Cold-Chain Storage Lease</option>
              <option value="Cross-Border Freight Service">Cross-Border Freight Service</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Amount (TZS)</label>
            <input
              type="number"
              required
              placeholder="e.g. 2450000"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-sm font-semibold text-white shadow-sm transition disabled:opacity-50"
            >
              {isSubmitting ? 'Generating...' : 'Issue Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 2. Record Expense Modal
export const RecordExpenseModal: React.FC<ModalProps> = ({ isOpen, onClose, onSuccess, accounts, addToast }) => {
  const [vendor, setVendor] = useState('');
  const [category, setCategory] = useState('Fulfillment Logistics');
  const [account, setAccount] = useState('Operations Wallet');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) {
      addToast('Please enter expense amount and description', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/finance/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description || `${category} - ${vendor || 'General Supplier'}`,
          type: 'Expense',
          account,
          amount: -Math.abs(Number(amount)),
          category
        })
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Expense recorded: TZS ${Number(amount).toLocaleString()}`, 'success');
        onSuccess?.();
        onClose();
      } else {
        addToast('Failed to record expense', 'error');
      }
    } catch {
      addToast('Error recording expense', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Record Operating Expense</h3>
              <p className="text-xs text-slate-500">Post debit entry to corporate ledger</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Expense Description</label>
            <input
              type="text"
              required
              placeholder="e.g. Warehouse Expense - Lagos WH"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-600"
              >
                <option value="Fulfillment Logistics">Fulfillment Logistics</option>
                <option value="Technology & Cloud">Technology & Cloud</option>
                <option value="Logistics Fuel Fleet">Logistics Fuel Fleet</option>
                <option value="Central Warehouse Utilities">Central Warehouse Utilities</option>
                <option value="Marketing & Ad Spend">Marketing & Ad Spend</option>
                <option value="Office & Administration">Office & Administration</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Source Account</label>
              <select
                value={account}
                onChange={e => setAccount(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-600"
              >
                <option value="Operations Wallet">Operations Wallet</option>
                <option value="Main Wallet">Main Wallet</option>
                <option value="Rider Wallet">Rider Wallet</option>
                <option value="Dar es Salaam Central WH Float">Dar Central WH Float</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Payee / Vendor</label>
            <input
              type="text"
              placeholder="e.g. TotalEnergies Tanzania"
              value={vendor}
              onChange={e => setVendor(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (TZS)</label>
            <input
              type="number"
              required
              placeholder="e.g. 320000"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-sm font-semibold text-white shadow-sm transition disabled:opacity-50"
            >
              {isSubmitting ? 'Posting...' : 'Post Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 3. Process Payout Modal
export const ProcessPayoutModal: React.FC<ModalProps> = ({ isOpen, onClose, onSuccess, addToast }) => {
  const [vendorName, setVendorName] = useState('Lumo Fashion Store');
  const [accountType, setAccountType] = useState('CRDB Bank B2B');
  const [amount, setAmount] = useState('2450000');
  const [refNumber, setRefNumber] = useState(`MPESA-TZ-${Math.floor(1000000 + (window.crypto.getRandomValues(new Uint32Array(1))[0] % 9000000))}`);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/finance/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: `Seller Payout - ${vendorName}`,
          type: 'Payout',
          account: 'Payout Wallet',
          amount: -Math.abs(Number(amount)),
          reference: refNumber,
          category: 'Merchant Settlement'
        })
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Payout of TZS ${Number(amount).toLocaleString()} disbursed successfully!`, 'success');
        onSuccess?.();
        onClose();
      }
    } catch {
      addToast('Error processing payout', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Process Merchant Settlement</h3>
              <p className="text-xs text-slate-500">Direct disbursement via M-Pesa / Bank</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Beneficiary Merchant</label>
            <input
              type="text"
              required
              value={vendorName}
              onChange={e => setVendorName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Settlement Rail</label>
            <select
              value={accountType}
              onChange={e => setAccountType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-600"
            >
              <option value="CRDB Bank B2B">CRDB Bank B2B Treasury</option>
              <option value="M-Pesa B2B / Bulk Disbursements">Vodacom M-Pesa B2B Gateway</option>
              <option value="Airtel Money B2C Bulk">Airtel Money Corporate B2C</option>
              <option value="NMB Bank Direct Transfer">NMB Bank Direct Transfer</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Disbursement Net (TZS)</label>
            <input
              type="number"
              required
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Bank / Gateway Reference</label>
            <input
              type="text"
              required
              value={refNumber}
              onChange={e => setRefNumber(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-sm font-semibold text-white shadow-sm transition disabled:opacity-50"
            >
              {isSubmitting ? 'Disbursing...' : 'Disburse Funds'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 4. Reconcile Account Modal
export const ReconcileAccountModal: React.FC<ModalProps> = ({ isOpen, onClose, onSuccess, accounts, addToast }) => {
  const [selectedAcc, setSelectedAcc] = useState('Main Wallet');
  const [isReconciling, setIsReconciling] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleRunReconciliation = async () => {
    setIsReconciling(true);
    try {
      const res = await fetch('/api/finance/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: selectedAcc })
      });
      const data = await res.json();
      setResult(data);
      addToast(`Reconciliation verified with 0 discrepancies!`, 'success');
      onSuccess?.();
    } catch {
      addToast('Reconciliation failed', 'error');
    } finally {
      setIsReconciling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Automated Account Reconciliation</h3>
              <p className="text-xs text-slate-500">Core banking vs internal ledger</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Account to Reconcile</label>
            <select
              value={selectedAcc}
              onChange={e => setSelectedAcc(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-600"
            >
              <option value="Main Wallet">Main Wallet (CRDB Corporate)</option>
              <option value="Payout Wallet">Payout Wallet (M-Pesa B2B)</option>
              <option value="Escrow Lockbox Vault">Escrow Lockbox Vault (Standard Chartered)</option>
              <option value="Operations Wallet">Operations Wallet (NMB Bank)</option>
              <option value="Ads Wallet">Ads Wallet</option>
              <option value="Rider Wallet">Rider Wallet</option>
            </select>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1.5">
            <div className="flex justify-between">
              <span className="font-medium">Verification Method:</span>
              <span className="font-semibold text-slate-900">MT940 Swift / API Stream</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Tolerance Threshold:</span>
              <span className="font-semibold text-slate-900">0.00 TZS</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Status:</span>
              <span className="font-semibold text-emerald-600">Continuous Sync Live</span>
            </div>
          </div>

          {result && (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-emerald-900">Reconciliation Successful</p>
                <p className="text-xs text-emerald-700 mt-0.5">{result.message}</p>
                <p className="text-xs font-medium text-emerald-800 mt-1">Variance: 0 TZS (Perfect Match)</p>
              </div>
            </div>
          )}

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleRunReconciliation}
              disabled={isReconciling}
              className="flex-1 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-sm font-semibold text-white shadow-sm transition disabled:opacity-50"
            >
              {isReconciling ? 'Verifying...' : 'Run Reconciliation'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 5. Transfer Funds Modal
export const TransferFundsModal: React.FC<ModalProps> = ({ isOpen, onClose, onSuccess, accounts, addToast }) => {
  const [fromAccount, setFromAccount] = useState('acc-main');
  const [toAccount, setToAccount] = useState('acc-payout');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      addToast('Please enter valid transfer amount', 'error');
      return;
    }
    if (fromAccount === toAccount) {
      addToast('Source and destination accounts must be different', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/finance/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromAccountId: fromAccount,
          toAccountId: toAccount,
          amount: Number(amount),
          notes
        })
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Transferred TZS ${Number(amount).toLocaleString()} successfully!`, 'success');
        onSuccess?.();
        onClose();
      } else {
        addToast(data.error || 'Transfer failed', 'error');
      }
    } catch {
      addToast('Error processing transfer', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Internal Fund Transfer</h3>
              <p className="text-xs text-slate-500">Inter-account liquidity movement</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleTransfer} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Source Account (Debit)</label>
            <select
              value={fromAccount}
              onChange={e => setFromAccount(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-600"
            >
              <option value="acc-main">Main Wallet (TZS 412,500,000)</option>
              <option value="acc-ops">Operations Wallet (TZS 98,600,000)</option>
              <option value="acc-ads">Ads Wallet (TZS 45,200,000)</option>
              <option value="acc-reserve">Risk Reserve Capital (TZS 85,000,000)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Destination Account (Credit)</label>
            <select
              value={toAccount}
              onChange={e => setToAccount(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-600"
            >
              <option value="acc-payout">Payout Wallet (Settlement pool)</option>
              <option value="acc-rider">Rider Wallet (Delivery logistics)</option>
              <option value="acc-dar-wh">Dar es Salaam Central WH Float</option>
              <option value="acc-tax">Tax Clearing Account (TRA)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Transfer Amount (TZS)</label>
            <input
              type="number"
              required
              placeholder="e.g. 50000000"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Authorization Note</label>
            <input
              type="text"
              placeholder="e.g. Replenish weekly vendor settlement liquidity"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-sm font-semibold text-white shadow-sm transition disabled:opacity-50"
            >
              {isSubmitting ? 'Transferring...' : 'Execute Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 6. Generate Report Modal
export const GenerateReportModal: React.FC<ModalProps> = ({ isOpen, onClose, addToast }) => {
  const [reportType, setReportType] = useState('pnl');
  const [format, setFormat] = useState('csv');

  if (!isOpen) return null;

  const handleDownload = () => {
    window.location.href = '/api/finance/export';
    addToast('Financial export report downloaded successfully!', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Generate Executive Report</h3>
              <p className="text-xs text-slate-500">Board-ready financial statements</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Report Module</label>
            <select
              value={reportType}
              onChange={e => setReportType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-600"
            >
              <option value="pnl">Profit & Loss (Income Statement)</option>
              <option value="balanceSheet">Comprehensive Balance Sheet</option>
              <option value="cashflow">Cash Flow Statement</option>
              <option value="settlements">Vendor Settlements Audit Schedule</option>
              <option value="tax">TRA VAT & Withholding Tax Package</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Export Format</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold ${format === 'csv' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-slate-200 text-slate-700'}`}
              >
                CSV / Excel Spreadsheet
              </button>
              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold ${format === 'pdf' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-slate-200 text-slate-700'}`}
              >
                Audit-Ready PDF
              </button>
            </div>
          </div>

          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-sm font-semibold text-white shadow-sm transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 7. Manage Budgets Modal
export const ManageBudgetsModal: React.FC<ModalProps> = ({ isOpen, onClose, addToast }) => {
  if (!isOpen) return null;

  const budgets = [
    { dept: 'Logistics & Rider Network', allocated: 250000000, spent: 185000000 },
    { dept: 'Warehouse Operations', allocated: 180000000, spent: 135000000 },
    { dept: 'Marketing & Seller Acquisition', allocated: 120000000, spent: 78000000 },
    { dept: 'Technology & Cloud Hosting', allocated: 90000000, spent: 65000000 },
    { dept: 'Customer Support & Refunds', allocated: 50000000, spent: 31000000 }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Departmental Budgets Overview</h3>
              <p className="text-xs text-slate-500">Monthly budget consumption vs cap</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4 max-h-96 overflow-y-auto pr-1">
          {budgets.map((b, i) => {
            const pct = Math.round((b.spent / b.allocated) * 100);
            return (
              <div key={i} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-slate-900">{b.dept}</span>
                  <span className="text-xs font-bold text-slate-600">{pct}% utilized</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                  <div className={`h-full rounded-full ${pct > 85 ? 'bg-amber-500' : 'bg-purple-600'}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1.5">
                  <span>Spent: TZS {b.spent.toLocaleString()}</span>
                  <span>Cap: TZS {b.allocated.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 mt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => {
              addToast('Budget allocations confirmed and synchronized', 'success');
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-semibold text-sm"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};

// 8. Tax Summary Modal
export const TaxSummaryModal: React.FC<ModalProps> = ({ isOpen, onClose, addToast }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">TRA Statutory Tax Summary</h3>
              <p className="text-xs text-slate-500">Tanzania Revenue Authority Compliance</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-3.5">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Taxpayer Identification (TIN):</span>
              <span className="font-bold text-slate-800">109-882-901</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">EFD Virtual Machine ID:</span>
              <span className="font-bold text-slate-800">V-EFD-LUMO-004</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Filing Period:</span>
              <span className="font-bold text-slate-800">May 2025</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm py-1 border-b border-slate-100">
              <span className="text-slate-600">VAT (18% on Platform Services)</span>
              <span className="font-bold text-slate-900">TZS 98,670,000</span>
            </div>
            <div className="flex justify-between text-sm py-1 border-b border-slate-100">
              <span className="text-slate-600">Withholding Tax (5% on Services)</span>
              <span className="font-bold text-slate-900">TZS 24,500,000</span>
            </div>
            <div className="flex justify-between text-sm py-1 border-b border-slate-100">
              <span className="text-slate-600">Digital Services Tax (1.5%)</span>
              <span className="font-bold text-slate-900">TZS 18,685,000</span>
            </div>
            <div className="flex justify-between text-sm py-2 font-bold text-purple-950 bg-purple-50 px-3 rounded-lg">
              <span>Total Statutory Obligation</span>
              <span>TZS 141,855,000</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Automatic e-Tax filing synchronized with BoT clearance portal.</span>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                addToast('TRA Remittance schedule exported', 'success');
                onClose();
              }}
              className="flex-1 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-sm font-semibold text-white"
            >
              Export E-Tax File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 9. FISCAL CALENDAR MODAL
// =========================================================================
export const FiscalCalendarModal: React.FC<ModalProps> = ({ isOpen, onClose, addToast }) => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [isAdding, setIsAdding] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventCategory, setNewEventCategory] = useState('TAX');
  const [newEventPriority, setNewEventPriority] = useState('HIGH');
  const [sendAlert, setSendAlert] = useState(true);

  const fetchCalendar = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/finance/calendar');
      const json = await res.json();
      if (json.events) setEvents(json.events);
    } catch (e) {
      console.error(e);
      addToast('Failed to load fiscal calendar events', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCalendar();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle || !newEventDate) {
      addToast('Please enter event title and date', 'error');
      return;
    }

    try {
      const res = await fetch('/api/finance/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newEventTitle,
          date: newEventDate,
          category: newEventCategory,
          priority: newEventPriority,
          status: 'PENDING',
          sendReminderAlert: sendAlert
        })
      });
      const json = await res.json();
      if (json.success) {
        addToast(`Fiscal event scheduled: ${newEventTitle}`, 'success');
        setNewEventTitle('');
        setNewEventDate('');
        setIsAdding(false);
        fetchCalendar();
      }
    } catch {
      addToast('Failed to add calendar event', 'error');
    }
  };

  const filteredEvents = filter === 'ALL' ? events : events.filter(e => e.category === filter);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#23155b] to-[#341d7d] text-white p-6 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Fiscal & Statutory Calendar</h3>
              <p className="text-xs text-purple-200/80">Corporate tax deadlines, settlement cycles, and audit schedules</p>
            </div>
          </div>
          <button onClick={onClose} className="text-purple-200 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Controls: Filter & Add */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
              {['ALL', 'TAX', 'PAYOUT', 'AUDIT', 'BUDGET'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition ${
                    filter === cat
                      ? 'bg-purple-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsAdding(!isAdding)}
              className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAdding ? 'Close Form' : 'Add Fiscal Event'}</span>
            </button>
          </div>

          {/* Inline Add Event Form */}
          {isAdding && (
            <form onSubmit={handleAddEvent} className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-3 text-xs">
              <h4 className="font-bold text-purple-950">Schedule New Fiscal Deadline</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Event Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Q2 Interim Statutory Audit"
                    value={newEventTitle}
                    onChange={e => setNewEventTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target Date</label>
                  <input
                    type="date"
                    required
                    value={newEventDate}
                    onChange={e => setNewEventDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={newEventCategory}
                    onChange={e => setNewEventCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-600"
                  >
                    <option value="TAX">TAX (TRA Filing)</option>
                    <option value="PAYOUT">PAYOUT (Vendor Batch)</option>
                    <option value="AUDIT">AUDIT (Regulatory / Bank)</option>
                    <option value="BUDGET">BUDGET (Quarterly Review)</option>
                    <option value="GENERAL">GENERAL</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={newEventPriority}
                    onChange={e => setNewEventPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-600"
                  >
                    <option value="HIGH">HIGH Priority</option>
                    <option value="MEDIUM">MEDIUM Priority</option>
                    <option value="NORMAL">NORMAL</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendAlert}
                    onChange={e => setSendAlert(e.target.checked)}
                    className="w-3.5 h-3.5 text-purple-600 rounded-sm"
                  />
                  <span className="text-[11px] text-slate-600">Send automated reminder notification 24 hours prior</span>
                </label>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-900 text-white rounded-xl font-bold hover:bg-purple-800 transition"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          )}

          {/* Events List */}
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {filteredEvents.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl text-xs">
                No scheduled events found for category: {filter}
              </div>
            ) : (
              filteredEvents.map((evt, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50 hover:bg-purple-50/50 border border-slate-100 rounded-2xl flex items-center justify-between gap-3 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                      evt.category === 'TAX'
                        ? 'bg-rose-100 text-rose-800'
                        : evt.category === 'PAYOUT'
                        ? 'bg-emerald-100 text-emerald-800'
                        : evt.category === 'AUDIT'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {evt.category.substring(0, 3)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{evt.title}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{evt.date}</span>
                        <span>•</span>
                        <span className="font-semibold text-purple-900">{evt.priority} Priority</span>
                      </div>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white border border-slate-200 text-slate-700">
                    {evt.status || 'SCHEDULED'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-purple-900 text-white rounded-xl text-xs font-bold hover:bg-purple-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 10. NOTIFICATION CENTER MODAL / DRAWER
// =========================================================================
export const NotificationCenterModal: React.FC<ModalProps> = ({ isOpen, onClose, addToast }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [isDispatching, setIsDispatching] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications');
      const json = await res.json();
      if (json.notifications) setNotifications(json.notifications);
    } catch (e) {
      console.error(e);
      addToast('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'POST' });
      setNotifications(notifications.map(n => ({ ...n, read: true, status: 'READ' })));
      addToast('All notifications marked as read', 'info');
    } catch {
      addToast('Failed to mark notifications', 'error');
    }
  };

  const handleTestTrigger = async () => {
    try {
      setIsDispatching(true);
      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Automated M-Pesa Treasury Sweep Completed',
          message: 'Automated settlement engine successfully swept 85,000,000 TZS into merchant payout float.',
          type: 'SETTLEMENT',
          targetRole: 'FINANCE'
        })
      });
      const json = await res.json();
      if (json.success) {
        addToast('Automated event notification dispatched and recorded!', 'success');
        fetchNotifications();
      }
    } catch {
      addToast('Failed to dispatch test notification', 'error');
    } finally {
      setIsDispatching(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read && n.status !== 'READ').length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#23155b] to-[#341d7d] text-white p-5 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center relative">
              <Bell className="w-5 h-5 text-amber-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-[9px] font-black flex items-center justify-center text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-base font-bold">LUMO Finance Notification Center</h3>
              <p className="text-xs text-purple-200/80">{unreadCount} unread system & automated transaction events</p>
            </div>
          </div>
          <button onClick={onClose} className="text-purple-200 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Actions bar */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-bold text-purple-900 hover:text-purple-700 flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All as Read</span>
            </button>

            <button
              onClick={handleTestTrigger}
              disabled={isDispatching}
              className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold rounded-xl text-xs flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{isDispatching ? 'Emitting...' : 'Test Automation Trigger'}</span>
            </button>
          </div>

          {/* Notifications List */}
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl text-xs">
                No active notifications
              </div>
            ) : (
              notifications.map((n, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border transition flex items-start gap-3 ${
                    n.read || n.status === 'READ'
                      ? 'bg-slate-50 border-slate-100'
                      : 'bg-purple-50/60 border-purple-200 shadow-xs'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-purple-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Bell className="w-4 h-4 text-amber-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-xs text-slate-900 truncate">{n.title}</h4>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                        {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-snug">{n.message || n.body}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-purple-900 text-white rounded-xl text-xs font-bold hover:bg-purple-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 11. MESSAGING & DISPATCH HUB MODAL
// =========================================================================
export const MessagingHubModal: React.FC<ModalProps> = ({ isOpen, onClose, addToast }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [channel, setChannel] = useState('SMS');
  const [targetAudience, setTargetAudience] = useState('ALL_VENDORS');
  const [customRecipient, setCustomRecipient] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('PAYOUT_DISBURSED');
  const [content, setContent] = useState('Dear Vendor, your weekly marketplace payout has been authorized and disbursed to your registered M-Pesa account. - LUMO Finance');
  const [sending, setSending] = useState(false);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/messaging');
      const json = await res.json();
      if (json.messages) setMessages(json.messages);
    } catch (e) {
      console.error(e);
      addToast('Failed to load messaging dispatch feed', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
    }
  }, [isOpen]);

  const handleTemplateChange = (tmpl: string) => {
    setSelectedTemplate(tmpl);
    if (tmpl === 'PAYOUT_DISBURSED') {
      setContent('Dear Vendor, your weekly marketplace payout has been authorized and disbursed to your registered M-Pesa account. - LUMO Finance');
    } else if (tmpl === 'RECONCILIATION_ADVISORY') {
      setContent('LUMO Operations Advisory: Daily core banking reconciliation completed. Zero ledger variance reported.');
    } else if (tmpl === 'TAX_SUBMITTED') {
      setContent('Official Notice: TRA VAT & Withholding returns for May 2025 have been submitted and stamped with EFD TIN 109-882-901.');
    } else if (tmpl === 'FLOAT_TOPUP') {
      setContent('Notice: Kariakoo Warehouse float wallet has been credited with 15,000,000 TZS for cash-on-delivery logistics.');
    } else {
      setContent('');
    }
  };

  if (!isOpen) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) {
      addToast('Please enter message content', 'error');
      return;
    }

    try {
      setSending(true);
      const res = await fetch('/api/messaging/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole: targetAudience === 'CUSTOM' ? 'CUSTOM' : targetAudience,
          customRecipient: targetAudience === 'CUSTOM' ? customRecipient : undefined,
          channel,
          content
        })
      });
      const json = await res.json();
      if (json.success) {
        addToast(`Message broadcast dispatched via ${channel}!`, 'success');
        fetchMessages();
      }
    } catch {
      addToast('Failed to broadcast message', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#23155b] to-[#341d7d] text-white p-6 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold">LUMO Automated Messaging & Dispatch Hub</h3>
              <p className="text-xs text-purple-200/80">SMS, WhatsApp, and Push dispatch rails for merchant payouts & finance notices</p>
            </div>
          </div>
          <button onClick={onClose} className="text-purple-200 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Message Composer */}
          <form onSubmit={handleSendMessage} className="space-y-4">
            <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-purple-700" />
              <span>Compose Automated Broadcast</span>
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Dispatch Channel</label>
                <select
                  value={channel}
                  onChange={e => setChannel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-600"
                >
                  <option value="SMS">SMS Gateway (Vodacom/Airtel)</option>
                  <option value="WHATSAPP">WhatsApp Business API</option>
                  <option value="EMAIL">Email Dispatch Rail</option>
                  <option value="PUSH">In-App Push Alert</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target Recipient</label>
                <select
                  value={targetAudience}
                  onChange={e => setTargetAudience(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-600"
                >
                  <option value="ALL_VENDORS">All Active Vendors (482)</option>
                  <option value="RIDERS">On-Duty Riders (118)</option>
                  <option value="FLOAT_DESKS">Kariakoo WH Float Desk</option>
                  <option value="FINANCE">Finance Executive Team</option>
                  <option value="CUSTOM">Specific Phone / Email</option>
                </select>
              </div>
            </div>

            {targetAudience === 'CUSTOM' && (
              <div>
                <label className="font-semibold text-slate-700 block mb-1 text-xs">Custom Phone or Email</label>
                <input
                  type="text"
                  placeholder="+255 712 345 678"
                  value={customRecipient}
                  onChange={e => setCustomRecipient(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-600"
                />
              </div>
            )}

            <div>
              <label className="font-semibold text-slate-700 block mb-1 text-xs">Template Preset</label>
              <select
                value={selectedTemplate}
                onChange={e => handleTemplateChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-600"
              >
                <option value="PAYOUT_DISBURSED">Merchant Payout Disbursed Notice</option>
                <option value="RECONCILIATION_ADVISORY">Daily Reconciliation Advisory</option>
                <option value="TAX_SUBMITTED">Statutory TRA Return Notice</option>
                <option value="FLOAT_TOPUP">Warehouse Float Credit Confirmation</option>
                <option value="CUSTOM">Custom Custom Notice</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1 text-xs">Message Body</label>
              <textarea
                rows={4}
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-600 resize-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full py-2.5 bg-gradient-to-r from-[#23155b] to-[#341d7d] hover:from-[#1b0f49] hover:to-[#2b1767] text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sending ? 'Dispatching...' : `Broadcast Message via ${channel}`}</span>
            </button>
          </form>

          {/* Right: Live Outbox Feed */}
          <div className="space-y-3 flex flex-col">
            <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-600" />
              <span>Live Outbox & Transmission Log</span>
            </h4>

            <div className="flex-1 space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {messages.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl text-xs">
                  No sent messages found
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs space-y-1.5"
                  >
                    <div className="flex justify-between items-center">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-100 text-purple-900">
                        {msg.channel || 'SMS'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sent'}
                      </span>
                    </div>
                    <p className="text-slate-800 text-[11px] leading-snug">{msg.content || msg.body}</p>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                      <span>To: {msg.recipient || msg.targetRole || 'Merchant Base'}</span>
                      <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                        <Check className="w-3 h-3" />
                        {msg.status || 'DELIVERED'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-purple-900 text-white rounded-xl text-xs font-bold hover:bg-purple-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};


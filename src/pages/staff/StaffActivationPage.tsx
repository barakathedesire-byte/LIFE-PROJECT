import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  ShieldCheck,
  Lock,
  Mail,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Building2,
  KeyRound,
  Shield,
  BadgeCheck
} from 'lucide-react';
import { LumoLogo } from '../../components/common/LumoLogo';
import { api } from '../../services/api';

export const StaffActivationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  const [token, setToken] = useState(tokenFromUrl);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteDetails, setInviteDetails] = useState<{
    email?: string;
    name?: string;
    role?: string;
    department?: string;
  } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [activationSuccess, setActivationSuccess] = useState<boolean>(false);
  const [assignedRole, setAssignedRole] = useState<string>('');

  const { login, setSession } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  // Validate token on mount if present in URL
  useEffect(() => {
    if (tokenFromUrl) {
      validateInviteToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const validateInviteToken = async (tokenToVerify: string) => {
    if (!tokenToVerify.trim()) return;
    setIsValidating(true);
    setValidationError(null);
    try {
      const res = await api.verifyStaffInviteToken(tokenToVerify.trim());
      if (res.success && res.valid) {
        setInviteDetails({
          email: res.email,
          name: res.name,
          role: res.role,
          department: res.department
        });
        if (res.name) setFullName(res.name);
        if (res.role) setAssignedRole(res.role);
      } else {
        setValidationError(res.error || 'Invitation token is invalid, expired, or has already been used.');
        setInviteDetails(null);
      }
    } catch (err: any) {
      setValidationError('Failed to reach authentication server. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleManualTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateInviteToken(token);
  };

  const getPortalForRole = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return { path: '/admin', label: 'Admin Command Center' };
      case 'FINANCE_ADMIN':
      case 'FINANCE_OFFICER':
      case 'ACCOUNTING_STAFF':
        return { path: '/finance', label: 'Finance & Treasury Hub' };
      case 'WAREHOUSE_MANAGER':
        return { path: '/warehouse', label: 'Warehouse & Fulfillment Hub' };
      case 'OPERATIONS_ADMIN':
        return { path: '/operations', label: 'Operations & Logistics Hub' };
      case 'DELIVERY_AGENT':
        return { path: '/delivery', label: 'Express Courier Portal' };
      case 'PICKUP_STATION_MANAGER':
        return { path: '/pickup', label: 'Pickup Point Lead Hub' };
      case 'CUSTOMER_SUPPORT':
      case 'CUSTOMER_CARE':
        return { path: '/support', label: 'Customer Care & Resolution Hub' };
      case 'CATALOG_ADMIN':
      case 'CATALOG_SPECIALIST':
        return { path: '/catalog', label: 'Taxonomy & Catalog Hub' };
      case 'MODERATOR':
      case 'CONTENT_MODERATOR':
        return { path: '/moderation', label: 'Moderation & Trust Desk' };
      case 'SALESPERSON':
        return { path: '/sales', label: 'Field Sales & Merchant Growth' };
      default:
        return { path: '/admin', label: 'LUMO Workspace' };
    }
  };

  const handleActivateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      showToast('Password must be at least 8 characters with letters and numbers', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match. Please verify.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.activateStaffAccount({
        token: token.trim(),
        password,
        confirmPassword,
        name: fullName,
        phone
      });

      if (!res.success || !res.user) {
        throw new Error(res.error || 'Failed to activate staff account');
      }

      setActivationSuccess(true);
      const user = res.user;
      setAssignedRole(user.role);

      // Auto login into context
      if (res.token) {
        setSession(user, res.token);
      } else {
        await login(user.email, password, user.role);
      }
      showToast(`Account successfully activated! Welcome to LUMO, ${user.name}.`, 'success');

      // Direct to their respective role dashboard after a moment
      const portal = getPortalForRole(user.role);
      setTimeout(() => {
        navigate(portal.path);
      }, 2000);
    } catch (err: any) {
      showToast(err.message || 'Activation failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-neutral-900/5">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-neutral-200/90 p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <LumoLogo size="lg" variant="dark" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-900 rounded-full text-[11px] font-black uppercase tracking-wider mt-2">
            <ShieldCheck size={14} className="text-purple-700" />
            <span>Staff Onboarding & Security Setup</span>
          </div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
            Activate Enterprise Staff Account
          </h1>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Internal accounts are provisioned exclusively by LUMO platform administrators. Set your permanent credentials below to access your role workspace.
          </p>
        </div>

        {/* Step 1: Enter or Verify Token */}
        {!inviteDetails && !activationSuccess && (
          <div className="space-y-4">
            {validationError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-xs text-red-800">
                <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Invalid or Expired Invitation</p>
                  <p className="mt-0.5 text-[11px]">{validationError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleManualTokenSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-neutral-800 block mb-1">
                  Invitation Security Token
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="e.g. stf-inv-8829-ab44 or paste link"
                    className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-mono text-xs font-semibold outline-hidden focus:border-purple-600"
                  />
                  <KeyRound size={15} className="absolute left-3 top-3 text-neutral-400" />
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">
                  Found in your official welcome email or provided by your LUMO Super Administrator.
                </p>
              </div>

              <button
                type="submit"
                disabled={isValidating || !token.trim()}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isValidating ? (
                  <RefreshCw size={15} className="animate-spin" />
                ) : (
                  <>
                    <span>Verify Security Token</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2">
              <Link to="/admin/login" className="text-xs text-purple-600 font-bold hover:underline">
                Already activated? Sign In to Staff Console →
              </Link>
            </div>
          </div>
        )}

        {/* Step 2: Set Password & Activate */}
        {inviteDetails && !activationSuccess && (
          <form onSubmit={handleActivateAccount} className="space-y-4 text-xs">
            {/* Account Metadata Card */}
            <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-900 flex items-center gap-1.5">
                  <BadgeCheck size={16} className="text-purple-700" /> Verified Staff Identity
                </span>
                <span className="px-2 py-0.5 rounded font-mono font-black text-[10px] bg-purple-200 text-purple-900 border border-purple-300">
                  {inviteDetails.role}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-700 pt-1">
                <div>
                  <span className="text-neutral-400 block text-[10px]">Work Email</span>
                  <strong className="font-mono text-neutral-900">{inviteDetails.email}</strong>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px]">Department</span>
                  <strong className="text-neutral-900">{inviteDetails.department || 'Operations'}</strong>
                </div>
              </div>
            </div>

            <div>
              <label className="font-bold text-neutral-800 block mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Confirm your full legal name"
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-purple-600"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-800 block mb-1">
                Direct Contact Phone (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +255 754 000 000"
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-purple-600"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-800 block mb-1">
                Create Secure Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters (letters, numbers)"
                  className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-purple-600"
                />
                <Lock size={14} className="absolute left-3 top-2.5 text-neutral-400" />
              </div>
            </div>

            <div>
              <label className="font-bold text-neutral-800 block mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type password"
                  className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-purple-600"
                />
                <Lock size={14} className="absolute left-3 top-2.5 text-neutral-400" />
              </div>
            </div>

            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-[11px] text-neutral-600 space-y-1">
              <div className="flex items-center gap-1.5 text-neutral-900 font-bold">
                <Shield size={13} className="text-emerald-600" />
                <span>Enterprise Access Compliance</span>
              </div>
              <p>
                By activating your staff account, you agree to adhere to LUMO internal data protection policies and role-based confidentiality agreements.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <RefreshCw size={15} className="animate-spin" />
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Activate Account & Enter Workspace</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 3: Success State */}
        {activationSuccess && (
          <div className="text-center py-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={36} />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-neutral-900">
                Staff Account Activated!
              </h2>
              <p className="text-xs text-neutral-600 max-w-xs mx-auto">
                Your credentials are active with role <strong className="text-purple-700 font-mono font-bold">{assignedRole}</strong>.
              </p>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-semibold">
              Redirecting you to your assigned portal ({getPortalForRole(assignedRole).label})...
            </div>

            <button
              onClick={() => navigate(getPortalForRole(assignedRole).path)}
              className="w-full py-3 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Go to Workspace Now</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

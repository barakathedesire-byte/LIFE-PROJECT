import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  Key,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Terminal,
  RefreshCw,
  Server
} from 'lucide-react';
import { LumoLogo } from '../../components/common/LumoLogo';
import { ForgotPasswordModal } from '../../components/auth/ForgotPasswordModal';
import { getRoleDashboardRoute } from '../../components/common/ProtectedRoute';

export const AdminLoginPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'bootstrap'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [bootstrapStatus, setBootstrapStatus] = useState<{ isBootstrapped: boolean; adminEmail: string | null } | null>(null);

  const { login, setSession } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch('/api/auth/admin-bootstrap-status');
        const data = await res.json();
        setBootstrapStatus(data);
        if (!data.isBootstrapped) {
          setMode('bootstrap');
        }
      } catch (err) {
        console.warn('Failed to fetch admin bootstrap status', err);
      }
    }
    checkStatus();
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Synchronize into AuthContext
      if (data.token && data.user) {
        setSession(data.user, data.token);
      } else {
        await login(data.user.email, password, data.user.role);
      }
      showToast(`Welcome Administrator. Console session initialized.`, 'success');
      
      const destination = (location.state as any)?.from || getRoleDashboardRoute(data.user?.role || 'SUPER_ADMIN') || '/admin';
      navigate(destination);
    } catch (err: any) {
      showToast(err.message || 'Administrative login rejected', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBootstrap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 8) {
      showToast('Admin password must be at least 8 characters long.', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/admin-bootstrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secretKey: secretKey.trim(),
          email: email.trim(),
          name: name.trim() || 'Super Administrator',
          password
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Bootstrap failed');
      }

      if (data.token && data.user) {
        setSession(data.user, data.token);
      }
      showToast('Super Administrator account successfully provisioned!', 'success');
      navigate('/admin');
    } catch (err: any) {
      showToast(err.message || 'Failed to initialize administrator', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-neutral-900/5">
      <div className="w-full max-w-md bg-white rounded-3xl border border-neutral-200/90 p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <LumoLogo size="lg" variant="dark" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-[11px] font-black uppercase tracking-wider mt-2">
            <ShieldAlert size={14} className="text-amber-700" />
            <span>Operational Command Console</span>
          </div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
            {mode === 'login' ? 'Administrator Authentication' : 'Production Admin Provisioning'}
          </h1>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto">
            {mode === 'login'
              ? 'Authorized platform personnel only. Every administrative action is logged to immutable audit logs.'
              : 'Initialize the root Super Administrator credentials for production ecosystem control.'}
          </p>
        </div>

        {/* Mode switcher tabs */}
        <div className="flex p-1 bg-neutral-100 rounded-xl text-xs font-bold text-neutral-600">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'login' ? 'bg-white text-neutral-900 shadow-xs' : 'hover:text-neutral-900'
            }`}
          >
            <Lock size={13} />
            <span>Admin Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('bootstrap')}
            className={`flex-1 py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'bootstrap' ? 'bg-white text-neutral-900 shadow-xs' : 'hover:text-neutral-900'
            }`}
          >
            <Key size={13} />
            <span>Root Bootstrap</span>
          </button>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-neutral-800 block mb-1">
                Administrator Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@yourdomain.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-[#FF6A00]"
                />
                <Mail size={15} className="absolute left-3 top-3 text-neutral-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-neutral-800">
                  Administrator Password / Security Token
                </label>
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(true)}
                  className="text-[11px] font-bold text-[#FF6A00] hover:text-[#E55E00] hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-[#FF6A00]"
                />
                <Lock size={15} className="absolute left-3 top-3 text-neutral-400" />
              </div>
            </div>

            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 text-[11px] text-neutral-600 space-y-1">
              <div className="flex items-center gap-1.5 text-neutral-900 font-bold">
                <Server size={13} className="text-emerald-600" />
                <span>Authoritative Production Console</span>
              </div>
              <p>
                Session tokens are strictly cryptographically verified on all administrative API routes.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw size={15} className="animate-spin" />
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>Authenticate to Admin Console</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleBootstrap} className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[11px] space-y-1">
              <span className="font-bold flex items-center gap-1">
                <AlertCircle size={13} />
                Root Setup Key Authorization
              </span>
              <p>
                Deployment master secret key is configured via secure server environment variable (<code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">ADMIN_BOOTSTRAP_KEY</code>).
              </p>
            </div>

            <div>
              <label className="font-bold text-neutral-800 block mb-1">
                Master Deployment Secret Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="Enter master deployment secret key..."
                  className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-[#FF6A00]"
                />
                <Key size={15} className="absolute left-3 top-3 text-neutral-400" />
              </div>
            </div>

            <div>
              <label className="font-bold text-neutral-800 block mb-1">
                Super Admin Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@yourdomain.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-[#FF6A00]"
                />
                <Mail size={15} className="absolute left-3 top-3 text-neutral-400" />
              </div>
            </div>

            <div>
              <label className="font-bold text-neutral-800 block mb-1">
                Administrator Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Super Administrator"
                className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-[#FF6A00]"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-800 block mb-1">
                Admin Master Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create strong admin password (min 8 characters)..."
                  className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-[#FF6A00]"
                />
                <Lock size={15} className="absolute left-3 top-3 text-neutral-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-neutral-900 hover:bg-black text-white font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw size={15} className="animate-spin" />
              ) : (
                <>
                  <Terminal size={16} className="text-[#FF6A00]" />
                  <span>Provision Super Administrator</span>
                </>
              )}
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
          <Link to="/" className="hover:text-neutral-900 transition font-medium">
            ← Return to Storefront
          </Link>
          <Link to="/login" className="hover:text-neutral-900 transition font-medium">
            Standard Customer Login
          </Link>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
        initialIdentifier={email}
      />
    </div>
  );
};

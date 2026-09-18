import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  ShieldCheck,
  Lock,
  User,
  Phone,
  Mail,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff,
  Store,
  Truck,
  TrendingUp,
  MapPin,
  FileText,
  CreditCard,
  Building2,
  CheckCircle2,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { LumoLogo } from '../components/common/LumoLogo';
import { SocialSignInModal } from '../components/auth/SocialSignInModal';
import { ForgotPasswordModal } from '../components/auth/ForgotPasswordModal';
import { UserRole } from '../types';
import { getRoleDashboardRoute } from '../components/common/ProtectedRoute';

const validatePassword = (password: string) => {
  const minLength = 8;
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);
  return password.length >= minLength && hasSpecialChar;
};

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [accountNotFoundNotice, setAccountNotFoundNotice] = useState<string | null>(null);
  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const [socialProvider, setSocialProvider] = useState<'google' | 'apple'>('google');
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const { login } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/account';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter your email and password', 'error');
      return;
    }
    try {
      setAccountNotFoundNotice(null);
      const authUser = await login(email, password);
      showToast('Signed in successfully! Welcome to LUMO.', 'success');
      if (from && from !== '/account' && from !== '/login' && from !== '/register') {
        navigate(from, { replace: true });
      } else {
        const targetRoute = getRoleDashboardRoute(authUser.role);
        navigate(targetRoute, { replace: true });
      }
    } catch (err: any) {
      const msg = err.message || 'Login failed';
      if (err.code === 'ACCOUNT_NOT_FOUND' || err.status === 404 || msg.toLowerCase().includes('does not exist')) {
        setAccountNotFoundNotice('The account associated with the above email does not exist.');
      } else {
        setAccountNotFoundNotice(null);
        showToast(msg, 'error');
      }
    }
  };

  const handleOAuthLogin = (provider: 'google' | 'apple') => {
    setAccountNotFoundNotice(null);
    setSocialProvider(provider);
    setSocialModalOpen(true);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl border border-neutral-200/90 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <LumoLogo size="lg" variant="dark" />
          </div>
          <h1 className="text-xl font-black text-neutral-900 tracking-tight pt-2">
            Sign In to LUMO Tanzania
          </h1>
          <p className="text-xs text-neutral-500">
            Access your orders, vendor hub, rider portal, or staff workspaces
          </p>
        </div>

        {/* Account not found alert notice */}
        {accountNotFoundNotice && (
          <div
            id="login-account-not-found-notice"
            className="p-4 bg-rose-50 border border-rose-200/90 rounded-2xl flex items-start gap-3 text-xs text-rose-900 shadow-xs animate-in fade-in"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1.5 min-w-0">
              <p className="font-bold text-rose-950 text-xs">
                The account associated with the above email does not exist.
              </p>
              <p className="text-rose-700 text-[11px] leading-relaxed">
                Please check for typing errors or create a new account to continue.
              </p>
              <div className="pt-1">
                <Link
                  to={`/register?email=${encodeURIComponent(email)}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-bold text-[11px] rounded-lg shadow-xs transition cursor-pointer"
                >
                  <span>Create an account now</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* OAuth Buttons */}
        <div className="space-y-2.5">
          <button 
            id="login-continue-with-google-btn"
            type="button"
            onClick={() => handleOAuthLogin('google')}
            className="w-full py-2.5 bg-white border-2 border-neutral-200 hover:border-neutral-300 rounded-xl flex items-center justify-center gap-2 font-bold text-neutral-700 text-xs transition cursor-pointer"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>
          <button 
            id="login-continue-with-apple-btn"
            type="button"
            onClick={() => handleOAuthLogin('apple')}
            className="w-full py-2.5 bg-black border-2 border-black hover:bg-neutral-900 rounded-xl flex items-center justify-center gap-2 font-bold text-white text-xs transition cursor-pointer"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="white"><path d="M12.15 8.73c-1.39 0-2.81.95-3.66.95-.88 0-2.06-.88-3.19-.88-1.5 0-2.89.87-3.66 2.22-1.56 2.72-.4 6.75 1.13 8.95.75 1.08 1.62 2.28 2.81 2.24 1.13-.04 1.56-.73 2.94-.73 1.38 0 1.84.73 3 .73 1.2 0 1.96-1.12 2.7-2.19.85-1.24 1.2-2.45 1.22-2.51-.03-.02-2.35-.91-2.38-3.62-.03-2.26 1.84-3.35 1.93-3.41-1.06-1.55-2.7-1.76-3.29-1.81-1.36-.14-2.85.83-3.7.83h-.01zM14.92 6.01c.62-.75 1.04-1.79.93-2.83-1.11.04-2.41.67-3.13 1.5-.66.75-1.13 1.83-1.02 2.85 1.23.09 2.53-.69 3.22-1.52z"/></svg>
            Continue with Apple
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-neutral-200"></div>
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">OR SIGN IN WITH CREDENTIALS</span>
          <div className="flex-1 h-px bg-neutral-200"></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-neutral-800 block mb-1">
              Email Address or Phone Number
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (accountNotFoundNotice) setAccountNotFoundNotice(null);
                }}
                placeholder="e.g. rashid.mohamed@gmail.com"
                className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-[#FF6A00]"
              />
              <Mail size={15} className="absolute left-3 top-3 text-neutral-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-neutral-800">Password</label>
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
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-[#FF6A00]"
              />
              <Lock size={15} className="absolute left-3 top-3 text-neutral-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600 cursor-pointer"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-black text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <span>Sign In</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="text-center text-xs text-neutral-500 pt-2 border-t border-neutral-100">
          <div>
            <span>New to LUMO? </span>
            <Link to="/register" className="font-bold text-[#FF6A00] hover:underline">
              Create an Account / Become a Partner
            </Link>
          </div>
        </div>
      </div>

      <SocialSignInModal
        isOpen={socialModalOpen}
        onClose={() => setSocialModalOpen(false)}
        provider={socialProvider}
        mode="login"
        onSuccess={() => {
          navigate(from, { replace: true });
        }}
      />

      <ForgotPasswordModal
        isOpen={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
        initialIdentifier={email}
      />
    </div>
  );
};

export const RegisterPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const roleParam = (searchParams.get('role') || 'customer').toLowerCase();
  const emailParam = searchParams.get('email') || '';
  const nameParam = searchParams.get('name') || '';
  const firstNameParam = searchParams.get('firstName') || '';
  const lastNameParam = searchParams.get('lastName') || '';
  const noticeParam = searchParams.get('notice') || '';

  // Selected registration role tab: 'customer' | 'vendor' | 'delivery' | 'sales'
  const [activeTab, setActiveTab] = useState<'customer' | 'vendor' | 'delivery' | 'sales'>(() => {
    if (roleParam === 'vendor' || roleParam === 'seller') return 'vendor';
    if (roleParam === 'delivery' || roleParam === 'rider') return 'delivery';
    if (roleParam === 'sales' || roleParam === 'salesperson') return 'sales';
    return 'customer';
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (roleParam === 'pickup' || roleParam === 'lumopoint' || roleParam === 'station') {
      navigate('/pickup/register', { replace: true });
      return;
    }
    if (roleParam === 'vendor' || roleParam === 'seller') setActiveTab('vendor');
    else if (roleParam === 'delivery' || roleParam === 'rider') setActiveTab('delivery');
    else if (roleParam === 'sales' || roleParam === 'salesperson') setActiveTab('sales');
    else if (roleParam === 'customer') setActiveTab('customer');
  }, [roleParam, navigate]);

  const handleTabChange = (tab: 'customer' | 'vendor' | 'delivery' | 'sales') => {
    if (tab === 'pickup' as any) {
      navigate('/pickup/register');
      return;
    }
    setActiveTab(tab);
    setSearchParams({ role: tab });
  };

  const { register } = useAuth();
  const { showToast } = useNotification();
  const location = useLocation();
  const from = location.state?.from || '/account';

  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const [socialProvider, setSocialProvider] = useState<'google' | 'apple'>('google');

  // Universal password state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 1. Customer Form Fields
  const [customerFirstName, setCustomerFirstName] = useState('');
  const [customerLastName, setCustomerLastName] = useState('');
  const [customerBirthDate, setCustomerBirthDate] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+255 ');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerRegion, setCustomerRegion] = useState('Dar es Salaam');
  const [customerCity, setCustomerCity] = useState('Kinondoni');
  const [customerSubscribePromotions, setCustomerSubscribePromotions] = useState(false);
  const [customerTermsAccepted, setCustomerTermsAccepted] = useState(false);

  // 2. Vendor / Seller Form Fields
  const [vendorBusinessName, setVendorBusinessName] = useState('');
  const [vendorContactName, setVendorContactName] = useState('');
  const [vendorPhone, setVendorPhone] = useState('+255 ');
  const [vendorEmail, setVendorEmail] = useState('');
  const [vendorTin, setVendorTin] = useState('');
  const [vendorCategory, setVendorCategory] = useState('Electronics & Smartphones');
  const [vendorRegion, setVendorRegion] = useState('Dar es Salaam');
  const [vendorMarketArea, setVendorMarketArea] = useState('Kariakoo Market');
  const [vendorPayoutAccount, setVendorPayoutAccount] = useState('');
  const [vendorAgreedTerms, setVendorAgreedTerms] = useState(true);

  // 3. Delivery Agent / Rider Form Fields
  const [riderFullName, setRiderFullName] = useState('');
  const [riderPhone, setRiderPhone] = useState('+255 ');
  const [riderEmail, setRiderEmail] = useState('');
  const [riderVehicleType, setRiderVehicleType] = useState<'MOTORCYCLE' | 'TUKTUK_BAJAJ' | 'VAN' | 'BICYCLE'>('MOTORCYCLE');
  const [riderPlateNumber, setRiderPlateNumber] = useState('');
  const [riderLicenseNumber, setRiderLicenseNumber] = useState('');
  const [riderZone, setRiderZone] = useState('Kinondoni & Sinza Hub Corridor');
  const [riderEmergencyContact, setRiderEmergencyContact] = useState('');

  // 4. Salesperson / Field Agent Form Fields
  const [salesFullName, setSalesFullName] = useState('');
  const [salesPhone, setSalesPhone] = useState('+255 ');
  const [salesEmail, setSalesEmail] = useState('');
  const [salesNidaNumber, setSalesNidaNumber] = useState('');
  const [salesTerritory, setSalesTerritory] = useState('Dar es Salaam Central (Kariakoo / Posta)');
  const [salesExperience, setSalesExperience] = useState('2-4 years retail & field merchant acquisition');
  const [salesCommissionMpesa, setSalesCommissionMpesa] = useState('');



  // Auto-fill parameters if redirected with email or name
  useEffect(() => {
    if (emailParam) {
      setCustomerEmail(emailParam);
      setVendorEmail(emailParam);
      setRiderEmail(emailParam);
      setSalesEmail(emailParam);
    }
    if (firstNameParam) setCustomerFirstName(firstNameParam);
    if (lastNameParam) setCustomerLastName(lastNameParam);
    if (nameParam) {
      setCustomerName(nameParam);
      setVendorContactName(nameParam);
      setRiderFullName(nameParam);
      setSalesFullName(nameParam);
    }
  }, [emailParam, nameParam, firstNameParam, lastNameParam]);

  // Form Submissions
  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerFirstName || !customerLastName || !customerPhone || !customerEmail || !customerBirthDate) {
      showToast('Please fill all required fields (First Name, Last Name, Phone, Email, Birth Date)', 'error');
      return;
    }
    if (!customerTermsAccepted) {
      showToast('You must accept LUMO Terms and Conditions to complete registration.', 'error');
      return;
    }
    if (!validatePassword(password)) {
      showToast('Password must be at least 8 characters and include a special character.', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    try {
      await register(
        undefined, 
        customerEmail, 
        customerPhone, 
        customerRegion, 
        customerCity, 
        'CUSTOMER', 
        undefined,
        {
          firstName: customerFirstName,
          lastName: customerLastName,
          birthDate: customerBirthDate,
          termsAccepted: customerTermsAccepted,
          provider: searchParams.get('fromSocial') || 'email'
        }
      );
      showToast('Customer account created! Welcome to LUMO Tanzania.', 'success');
      navigate(from, { replace: true });
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
    }
  };

  const handleVendorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorBusinessName || !vendorContactName || !vendorPhone || !vendorEmail) {
      showToast('Please complete all mandatory merchant details', 'error');
      return;
    }
    if (!validatePassword(password)) {
      showToast('Password must be at least 8 characters and include a special character.', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }
    if (!vendorAgreedTerms) {
      showToast('Please agree to the LUMO Escrow & Seller SLA terms.', 'error');
      return;
    }

    try {
      await register(
        vendorContactName,
        vendorEmail,
        vendorPhone,
        vendorRegion,
        vendorMarketArea,
        'SELLER',
        vendorBusinessName
      );
      showToast(`Hongera! Store "${vendorBusinessName}" registered. Welcome to LUMO Seller Center.`, 'success');
      navigate('/seller-education');
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
    }
  };

  const handleDeliverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!riderFullName || !riderPhone || !riderEmail || !riderPlateNumber) {
      showToast('Please fill in rider name, phone, email, and vehicle plate number.', 'error');
      return;
    }
    if (!validatePassword(password)) {
      showToast('Password must be at least 8 characters and include a special character.', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    try {
      await register(
        riderFullName,
        riderEmail,
        riderPhone,
        'Dar es Salaam',
        riderZone,
        'DELIVERY_AGENT'
      );
      showToast('Hongera! Express Delivery Rider account registered. Opening your dispatch hub...', 'success');
      navigate('/delivery');
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
    }
  };

  const handleSalesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salesFullName || !salesPhone || !salesEmail || !salesNidaNumber) {
      showToast('Please fill in sales agent name, phone, email, and NIDA ID number.', 'error');
      return;
    }
    if (!validatePassword(password)) {
      showToast('Password must be at least 8 characters and include a special character.', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    try {
      await register(
        salesFullName,
        salesEmail,
        salesPhone,
        'Dar es Salaam',
        salesTerritory,
        'SALESPERSON'
      );
      showToast('Hongera! Field Sales Agent account created. Launching sales lead portal...', 'success');
      navigate('/sales');
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
    }
  };



  const handleOAuthRegister = (provider: 'google' | 'apple') => {
    setSocialProvider(provider);
    setSocialModalOpen(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="bg-white rounded-3xl border border-neutral-200/90 p-6 sm:p-9 shadow-xl space-y-7">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <LumoLogo size="lg" variant="dark" />
          </div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight pt-2">
            Join the LUMO Marketplace Network
          </h1>
          <p className="text-xs text-neutral-500 max-w-lg mx-auto">
            Choose your account role below to open your specialized workspace or register as a shopper with instant escrow security.
          </p>
        </div>

        {/* Notice banner if redirected due to non-existent account */}
        {(noticeParam === 'no_account' || emailParam) && (
          <div
            id="register-no-account-notice"
            className="p-4 bg-orange-50 border border-orange-200/90 rounded-2xl flex items-start gap-3 text-xs text-orange-950 shadow-xs animate-in fade-in"
          >
            <AlertCircle className="w-5 h-5 text-[#FF6A00] shrink-0 mt-0.5" />
            <div className="space-y-1 min-w-0">
              <p className="font-bold text-neutral-900">
                Account Not Found: Create Your Account
              </p>
              <p className="text-neutral-600 text-[11px] leading-relaxed">
                {emailParam
                  ? `No account was found for ${emailParam}. Please choose your role and complete your registration below to create your LUMO account.`
                  : 'The requested account was not found. Please complete your registration details below to create your LUMO account.'}
              </p>
            </div>
          </div>
        )}

        {/* DISTINCT ROLE SELECTION BUTTONS */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider text-center">
            Select Registration Type:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {/* 1. Customer Button */}
            <button
              type="button"
              onClick={() => handleTabChange('customer')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                activeTab === 'customer'
                  ? 'border-[#FF6A00] bg-orange-50/70 shadow-sm ring-2 ring-[#FF6A00]/20'
                  : 'border-neutral-200 bg-neutral-50/80 hover:bg-neutral-100/80 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-xl ${activeTab === 'customer' ? 'bg-[#FF6A00] text-white' : 'bg-neutral-200 text-neutral-700'}`}>
                  <User size={16} />
                </div>
                {activeTab === 'customer' && (
                  <span className="w-2 h-2 rounded-full bg-[#FF6A00]"></span>
                )}
              </div>
              <div>
                <span className="font-extrabold text-xs text-neutral-900 block">Customer Account</span>
                <span className="text-[10px] text-neutral-500 leading-tight block mt-0.5">Shop & Escrow</span>
              </div>
            </button>

            {/* 2. Become a Vendor Button */}
            <button
              type="button"
              onClick={() => handleTabChange('vendor')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                activeTab === 'vendor'
                  ? 'border-indigo-600 bg-indigo-50/70 shadow-sm ring-2 ring-indigo-600/20'
                  : 'border-neutral-200 bg-neutral-50/80 hover:bg-neutral-100/80 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-xl ${activeTab === 'vendor' ? 'bg-indigo-600 text-white' : 'bg-neutral-200 text-neutral-700'}`}>
                  <Store size={16} />
                </div>
                {activeTab === 'vendor' && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                )}
              </div>
              <div>
                <span className="font-extrabold text-xs text-neutral-900 block">Become a Vendor</span>
                <span className="text-[10px] text-neutral-500 leading-tight block mt-0.5">Sell & Payouts</span>
              </div>
            </button>

            {/* 3. Become a Delivery Agent Button */}
            <button
              type="button"
              onClick={() => handleTabChange('delivery')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                activeTab === 'delivery'
                  ? 'border-cyan-600 bg-cyan-50/70 shadow-sm ring-2 ring-cyan-600/20'
                  : 'border-neutral-200 bg-neutral-50/80 hover:bg-neutral-100/80 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-xl ${activeTab === 'delivery' ? 'bg-cyan-600 text-white' : 'bg-neutral-200 text-neutral-700'}`}>
                  <Truck size={16} />
                </div>
                {activeTab === 'delivery' && (
                  <span className="w-2 h-2 rounded-full bg-cyan-600"></span>
                )}
              </div>
              <div>
                <span className="font-extrabold text-xs text-neutral-900 block">Become a Delivery Agent</span>
                <span className="text-[10px] text-neutral-500 leading-tight block mt-0.5">Express Rider Hub</span>
              </div>
            </button>

            {/* 4. Become a Salesperson Button */}
            <button
              type="button"
              onClick={() => handleTabChange('sales')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                activeTab === 'sales'
                  ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-600/20'
                  : 'border-neutral-200 bg-neutral-50/80 hover:bg-neutral-100/80 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-xl ${activeTab === 'sales' ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-700'}`}>
                  <TrendingUp size={16} />
                </div>
                {activeTab === 'sales' && (
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                )}
              </div>
              <div>
                <span className="font-extrabold text-xs text-neutral-900 block">Become a Salesperson</span>
                <span className="text-[10px] text-neutral-500 leading-tight block mt-0.5">Field Commissions</span>
              </div>
            </button>


          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* FORM 1: CUSTOMER REGISTRATION */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'customer' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-200/80 flex items-start gap-3">
              <div className="p-2 bg-[#FF6A00] text-white rounded-xl shrink-0 mt-0.5">
                <ShieldCheck size={18} />
              </div>
              <div className="text-xs">
                <h3 className="font-bold text-neutral-900">Shopper Escrow Protection Included</h3>
                <p className="text-neutral-600 mt-0.5">
                  Your funds are kept 100% safe in LUMO Escrow until your items are delivered, inspected, and confirmed.
                </p>
              </div>
            </div>

            {/* OAuth Quick Sign Up */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button 
                id="register-google-btn"
                type="button"
                onClick={() => handleOAuthRegister('google')}
                className="w-full py-2.5 bg-white border-2 border-neutral-200 hover:border-neutral-300 rounded-xl flex items-center justify-center gap-2 font-bold text-neutral-700 text-xs transition cursor-pointer"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Sign up with Google
              </button>
              <button 
                id="register-apple-btn"
                type="button"
                onClick={() => handleOAuthRegister('apple')}
                className="w-full py-2.5 bg-black border-2 border-black hover:bg-neutral-900 rounded-xl flex items-center justify-center gap-2 font-bold text-white text-xs transition cursor-pointer"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="white"><path d="M12.15 8.73c-1.39 0-2.81.95-3.66.95-.88 0-2.06-.88-3.19-.88-1.5 0-2.89.87-3.66 2.22-1.56 2.72-.4 6.75 1.13 8.95.75 1.08 1.62 2.28 2.81 2.24 1.13-.04 1.56-.73 2.94-.73 1.38 0 1.84.73 3 .73 1.2 0 1.96-1.12 2.7-2.19.85-1.24 1.2-2.45 1.22-2.51-.03-.02-2.35-.91-2.38-3.62-.03-2.26 1.84-3.35 1.93-3.41-1.06-1.55-2.7-1.76-3.29-1.81-1.36-.14-2.85.83-3.7.83h-.01zM14.92 6.01c.62-.75 1.04-1.79.93-2.83-1.11.04-2.41.67-3.13 1.5-.66.75-1.13 1.83-1.02 2.85 1.23.09 2.53-.69 3.22-1.52z"/></svg>
                Sign up with Apple
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-neutral-200"></div>
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">OR SIGN UP WITH EMAIL</span>
              <div className="flex-1 h-px bg-neutral-200"></div>
            </div>

            <form onSubmit={handleCustomerSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-800 block mb-1">First Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={customerFirstName}
                      onChange={(e) => setCustomerFirstName(e.target.value)}
                      placeholder="e.g. Amina"
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-[#FF6A00]"
                    />
                    <User size={15} className="absolute left-3 top-3 text-neutral-400" />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Last Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={customerLastName}
                      onChange={(e) => setCustomerLastName(e.target.value)}
                      placeholder="e.g. Juma"
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-[#FF6A00]"
                    />
                    <User size={15} className="absolute left-3 top-3 text-neutral-400" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Mobile Phone (M-Pesa / Tigo Pesa)</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+255 712 345 678"
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-[#FF6A00]"
                    />
                    <Phone size={15} className="absolute left-3 top-3 text-neutral-400" />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="amina@gmail.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-[#FF6A00]"
                    />
                    <Mail size={15} className="absolute left-3 top-3 text-neutral-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-800 block mb-1">Date of Birth</label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={customerBirthDate}
                    onChange={(e) => setCustomerBirthDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-[#FF6A00]"
                  />
                  <Calendar size={15} className="absolute left-3 top-3 text-neutral-400" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Delivery Region</label>
                  <select
                    value={customerRegion}
                    onChange={(e) => setCustomerRegion(e.target.value)}
                    className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-[#FF6A00]"
                  >
                    <option value="Dar es Salaam">Dar es Salaam</option>
                    <option value="Arusha">Arusha</option>
                    <option value="Mwanza">Mwanza</option>
                    <option value="Dodoma">Dodoma</option>
                    <option value="Zanzibar">Zanzibar</option>
                    <option value="Mbeya">Mbeya</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-neutral-800 block mb-1">City / District</label>
                  <input
                    type="text"
                    value={customerCity}
                    onChange={(e) => setCustomerCity(e.target.value)}
                    placeholder="Kinondoni"
                    className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-[#FF6A00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full pl-9 pr-10 py-2.5 bg-neutral-50 border rounded-xl font-medium outline-hidden focus:border-[#FF6A00] ${
                        password && !validatePassword(password) ? 'border-red-500' : 'border-neutral-200'
                      }`}
                    />
                    <Lock size={15} className="absolute left-3 top-3 text-neutral-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full pl-9 pr-10 py-2.5 bg-neutral-50 border rounded-xl font-medium outline-hidden focus:border-[#FF6A00] ${
                        confirmPassword && confirmPassword !== password ? 'border-red-500' : 'border-neutral-200'
                      }`}
                    />
                    <Lock size={15} className="absolute left-3 top-3 text-neutral-400" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Transactional Receipts Guarantee & Marketing Opt-In */}
              <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                <div className="flex items-start gap-2 text-neutral-700">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    <strong>Automatic Order Receipts:</strong> You will automatically receive digital itemized order receipts, escrow confirmation, and live parcel tracking details via SMS and email.
                  </p>
                </div>

                <label className="flex items-start gap-2.5 pt-2 border-t border-neutral-200 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    required
                    checked={customerTermsAccepted}
                    onChange={(e) => setCustomerTermsAccepted(e.target.checked)}
                    className="mt-0.5 rounded text-[#FF6A00] focus:ring-[#FF6A00] h-4 w-4 border-neutral-300"
                  />
                  <span className="text-[11px] text-neutral-600 leading-snug">
                    I accept the <a href="/terms" target="_blank" className="text-blue-600 hover:underline">LUMO Terms and Conditions</a> and confirm that I have read the Privacy Policy. *
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={customerSubscribePromotions}
                    onChange={(e) => setCustomerSubscribePromotions(e.target.checked)}
                    className="mt-0.5 rounded text-[#FF6A00] focus:ring-[#FF6A00] h-4 w-4 border-neutral-300"
                  />
                  <span className="text-[11px] text-neutral-600 leading-snug">
                    <strong>Subscribe to promotional communications:</strong> Send me flash sale alerts, weekly voucher discounts, and exclusive seasonal product deals (Optional).
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-black text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Create Customer Account</span>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* FORM 2: BECOME A VENDOR / SELLER REGISTRATION */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'vendor' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-200 flex items-start gap-3">
              <div className="p-2 bg-indigo-600 text-white rounded-xl shrink-0 mt-0.5">
                <Store size={18} />
              </div>
              <div className="text-xs">
                <h3 className="font-bold text-neutral-900">Official Merchant & Seller Onboarding</h3>
                <p className="text-neutral-600 mt-0.5">
                  Sell your inventory directly to hundreds of thousands of buyers across Tanzania. Access direct warehouse fulfillment and automatic M-Pesa escrow payouts.
                </p>
              </div>
            </div>

            <form onSubmit={handleVendorSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Store / Business Name *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={vendorBusinessName}
                      onChange={(e) => setVendorBusinessName(e.target.value)}
                      placeholder="e.g. Kariakoo Prime Electronics"
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-indigo-600"
                    />
                    <Store size={15} className="absolute left-3 top-3 text-neutral-400" />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Primary Product Category *</label>
                  <select
                    value={vendorCategory}
                    onChange={(e) => setVendorCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-indigo-600"
                  >
                    <option value="Electronics & Smartphones">Electronics & Smartphones</option>
                    <option value="Fashion & Apparel">Fashion & Apparel (Kariakoo Wholesale)</option>
                    <option value="Home & Appliances">Home & Kitchen Appliances</option>
                    <option value="Supermarket & FMCG">Supermarket & FMCG Groceries</option>
                    <option value="Beauty & Cosmetics">Beauty, Fragrance & Personal Care</option>
                    <option value="Automotive & Hardware">Automotive Parts & Hardware</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Contact Person Full Name *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={vendorContactName}
                      onChange={(e) => setVendorContactName(e.target.value)}
                      placeholder="e.g. Kassim Bakari"
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-indigo-600"
                    />
                    <User size={15} className="absolute left-3 top-3 text-neutral-400" />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-neutral-800 block mb-1">TRA TIN or BRELA Registration No.</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={vendorTin}
                      onChange={(e) => setVendorTin(e.target.value)}
                      placeholder="e.g. 104-892-331"
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-indigo-600"
                    />
                    <FileText size={15} className="absolute left-3 top-3 text-neutral-400" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Business Mobile Phone (M-Pesa / Tigo Pesa) *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={vendorPhone}
                      onChange={(e) => setVendorPhone(e.target.value)}
                      placeholder="+255 784 112 233"
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-indigo-600"
                    />
                    <Phone size={15} className="absolute left-3 top-3 text-neutral-400" />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Store Official Email *</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={vendorEmail}
                      onChange={(e) => setVendorEmail(e.target.value)}
                      placeholder="store@kariakooprime.tz"
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-indigo-600"
                    />
                    <Mail size={15} className="absolute left-3 top-3 text-neutral-400" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Physical Store Location / Market Area</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={vendorMarketArea}
                      onChange={(e) => setVendorMarketArea(e.target.value)}
                      placeholder="e.g. Kariakoo, Aggrey Street Shop #4"
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-indigo-600"
                    />
                    <MapPin size={15} className="absolute left-3 top-3 text-neutral-400" />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Payout Method (Till / Bank / Mobile)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={vendorPayoutAccount}
                      onChange={(e) => setVendorPayoutAccount(e.target.value)}
                      placeholder="e.g. M-Pesa Till 559981 or CRDB Account"
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-indigo-600"
                    />
                    <CreditCard size={15} className="absolute left-3 top-3 text-neutral-400" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-indigo-600"
                    />
                    <Lock size={15} className="absolute left-3 top-3 text-neutral-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Confirm Password *</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-indigo-600"
                    />
                    <Lock size={15} className="absolute left-3 top-3 text-neutral-400" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="vendorTerms"
                  checked={vendorAgreedTerms}
                  onChange={(e) => setVendorAgreedTerms(e.target.checked)}
                  className="mt-1 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="vendorTerms" className="text-[11px] text-neutral-600 cursor-pointer leading-tight">
                  I agree to the <strong className="text-neutral-900">LUMO Vendor Agreement</strong>, Escrow fulfillment rules (genuine products only), and 48-hour delivery commitment.
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Store size={16} />
                <span>Complete Vendor Registration & Open Seller Center</span>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* FORM 3: BECOME A DELIVERY AGENT (EXPRESS RIDER) */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'delivery' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-4 bg-cyan-50/70 rounded-2xl border border-cyan-200 flex items-start gap-3">
              <div className="p-2 bg-cyan-600 text-white rounded-xl shrink-0 mt-0.5">
                <Truck size={18} />
              </div>
              <div className="text-xs">
                <h3 className="font-bold text-neutral-900">Express Rider & Dispatch Fleet Portal</h3>
                <p className="text-neutral-600 mt-0.5">
                  Deliver packages across Dar es Salaam & regional corridors. Daily shift payouts, customer OTP signature verification, and COD collection wallet.
                </p>
              </div>
            </div>

            <form onSubmit={handleDeliverySubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Rider Full Name *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={riderFullName}
                      onChange={(e) => setRiderFullName(e.target.value)}
                      placeholder="e.g. Juma Mwita"
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-cyan-600"
                    />
                    <User size={15} className="absolute left-3 top-3 text-neutral-400" />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Vehicle Type *</label>
                  <select
                    value={riderVehicleType}
                    onChange={(e) => setRiderVehicleType(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-cyan-600"
                  >
                    <option value="MOTORCYCLE">Motorcycle / Boda Boda (Bajaj Boxer 150)</option>
                    <option value="TUKTUK_BAJAJ">Three-Wheeler / Bajaj Cargo</option>
                    <option value="VAN">Delivery Van / Small Pickup Truck</option>
                    <option value="BICYCLE">Bicycle (CBD Express Courier)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Mobile Phone (M-Pesa / Tigo Pesa for Daily Payouts) *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={riderPhone}
                      onChange={(e) => setRiderPhone(e.target.value)}
                      placeholder="+255 754 110 998"
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-cyan-600"
                    />
                    <Phone size={15} className="absolute left-3 top-3 text-neutral-400" />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Email Address *</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={riderEmail}
                      onChange={(e) => setRiderEmail(e.target.value)}
                      placeholder="rider.juma@lumo.tz"
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-cyan-600"
                    />
                    <Mail size={15} className="absolute left-3 top-3 text-neutral-400" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Vehicle Plate Number (TRA) *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={riderPlateNumber}
                      onChange={(e) => setRiderPlateNumber(e.target.value)}
                      placeholder="e.g. MC-892-TZ"
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium uppercase font-mono outline-hidden focus:border-cyan-600"
                    />
                    <Truck size={15} className="absolute left-3 top-3 text-neutral-400" />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Driving License / NIDA ID Number *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={riderLicenseNumber}
                      onChange={(e) => setRiderLicenseNumber(e.target.value)}
                      placeholder="e.g. DL-9920192-TZ"
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-cyan-600"
                    />
                    <FileText size={15} className="absolute left-3 top-3 text-neutral-400" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Preferred Delivery Zone / Hub</label>
                  <select
                    value={riderZone}
                    onChange={(e) => setRiderZone(e.target.value)}
                    className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-cyan-600"
                  >
                    <option value="Kinondoni & Sinza Hub Corridor">Kinondoni & Sinza Hub Corridor</option>
                    <option value="Ilala CBD & Kariakoo Corridor">Ilala CBD & Kariakoo Corridor</option>
                    <option value="Temeke & Kurasini Port Hub">Temeke & Kurasini Port Hub</option>
                    <option value="Ubungo & Mlimani City Corridor">Ubungo & Mlimani City Corridor</option>
                    <option value="Arusha Northern Hub (Njiro)">Arusha Northern Hub (Njiro)</option>
                    <option value="Mwanza Lake Zone Hub">Mwanza Lake Zone Hub</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Emergency Contact Person & Phone</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={riderEmergencyContact}
                      onChange={(e) => setRiderEmergencyContact(e.target.value)}
                      placeholder="e.g. Hamisi Mwita (+255 714 000 111)"
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-cyan-600"
                    />
                    <Phone size={15} className="absolute left-3 top-3 text-neutral-400" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-cyan-600"
                    />
                    <Lock size={15} className="absolute left-3 top-3 text-neutral-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Confirm Password *</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-cyan-600"
                    />
                    <Lock size={15} className="absolute left-3 top-3 text-neutral-400" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-black text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Truck size={16} />
                <span>Register as Delivery Agent & Open Rider Hub</span>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* FORM 4: BECOME A SALESPERSON (FIELD AGENT) */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'sales' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex items-start gap-3">
              <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0 mt-0.5">
                <TrendingUp size={18} />
              </div>
              <div className="text-xs">
                <h3 className="font-bold text-neutral-900">Field Sales & Merchant Acquisition Representative</h3>
                <p className="text-neutral-600 mt-0.5">
                  Onboard Kariakoo merchants, brand distributors, and corporate buyers. Earn recurring weekly commissions on order volume with live CRM target tracking.
                </p>
              </div>
            </div>

            <form onSubmit={handleSalesSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Agent Full Name *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={salesFullName}
                      onChange={(e) => setSalesFullName(e.target.value)}
                      placeholder="e.g. Samuel Mvungi"
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-emerald-600"
                    />
                    <User size={15} className="absolute left-3 top-3 text-neutral-400" />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-neutral-800 block mb-1">National ID (NIDA) Number *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={salesNidaNumber}
                      onChange={(e) => setSalesNidaNumber(e.target.value)}
                      placeholder="e.g. 19920101-14112-00001-22"
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-emerald-600"
                    />
                    <FileText size={15} className="absolute left-3 top-3 text-neutral-400" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Mobile Phone (M-Pesa for Weekly Commission Payouts) *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={salesPhone}
                      onChange={(e) => setSalesPhone(e.target.value)}
                      placeholder="+255 765 889 001"
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-emerald-600"
                    />
                    <Phone size={15} className="absolute left-3 top-3 text-neutral-400" />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Official Email Address *</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={salesEmail}
                      onChange={(e) => setSalesEmail(e.target.value)}
                      placeholder="samuel.sales@lumo.tz"
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-emerald-600"
                    />
                    <Mail size={15} className="absolute left-3 top-3 text-neutral-400" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Assigned Sales Territory *</label>
                  <select
                    value={salesTerritory}
                    onChange={(e) => setSalesTerritory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-emerald-600"
                  >
                    <option value="Dar es Salaam Central (Kariakoo / Posta)">Dar es Salaam Central (Kariakoo Wholesale & Posta CBD)</option>
                    <option value="Dar es Salaam North (Mwenge / Kinondoni / Sinza)">Dar es Salaam North (Mwenge, Kinondoni & Sinza)</option>
                    <option value="Dar es Salaam South (Kurasini / Temeke / Kigamboni)">Dar es Salaam South (Kurasini, Temeke & Kigamboni)</option>
                    <option value="Arusha & Northern Zone">Arusha & Kilimanjaro Northern Zone</option>
                    <option value="Mwanza Lake Victoria Zone">Mwanza & Lake Victoria Region</option>
                    <option value="Dodoma Capital Zone">Dodoma Capital & Central Region</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Sales & Merchant Experience</label>
                  <select
                    value={salesExperience}
                    onChange={(e) => setSalesExperience(e.target.value)}
                    className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-emerald-600"
                  >
                    <option value="1-2 years retail & field sales">1-2 years retail & field sales</option>
                    <option value="2-4 years retail & field merchant acquisition">2-4 years field merchant acquisition</option>
                    <option value="5+ years senior corporate B2B sales">5+ years senior corporate & FMCG sales</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-emerald-600"
                    />
                    <Lock size={15} className="absolute left-3 top-3 text-neutral-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Confirm Password *</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-emerald-600"
                    />
                    <Lock size={15} className="absolute left-3 top-3 text-neutral-400" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <TrendingUp size={16} />
                <span>Register as Salesperson & Open Field Sales Hub</span>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        )}



        <div className="text-center text-xs text-neutral-500 pt-2 border-t border-neutral-100 flex items-center justify-between flex-wrap gap-2">
          <span>Already have an account?</span>
          <Link to="/login" className="font-bold text-[#FF6A00] hover:underline">
            Sign In with Existing Credentials
          </Link>
        </div>
      </div>

      <SocialSignInModal
        isOpen={socialModalOpen}
        onClose={() => setSocialModalOpen(false)}
        provider={socialProvider}
        mode="register"
        onSuccess={() => {
          navigate(from, { replace: true });
        }}
      />
    </div>
  );
};

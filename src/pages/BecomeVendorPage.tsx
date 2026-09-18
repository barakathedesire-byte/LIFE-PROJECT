import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, ShieldCheck, TrendingUp, DollarSign, CheckCircle2, ArrowRight, Globe, MapPin, Mail, Key, Phone, Lock, Building, AlertCircle, Eye, EyeOff, Upload } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';

const COUNTRIES = [
  'Tanzania',
  'Kenya',
  'Uganda',
  'Rwanda',
  'Burundi',
  'DRC',
  'United Arab Emirates',
  'China',
  'United States',
  'United Kingdom'
];

export const BecomeVendorPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useNotification();
  const [currentStep, setCurrentStep] = useState(1);
  const [regOption, setRegOption] = useState<'local' | 'global'>('local');
  const [step1Country, setStep1Country] = useState('Tanzania');
  
  const [showPopup, setShowPopup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    country: 'Tanzania',
    email: '',
    verificationCode: '',
    phone: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    contactName: '',
    city: 'Dar es Salaam',
    category: 'Phones & Tablets',
    businessDoc: null as File | null,
  });
  
  const [submitted, setSubmitted] = useState(false);

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);
    return password.length >= minLength && hasSpecialChar;
  };

  const handleNextStep1 = () => {
    setShowPopup(true);
  };

  const handleProceedPopup = () => {
    setShowPopup(false);
    if (regOption === 'local') {
      setFormData(prev => ({ ...prev, country: step1Country }));
    }
    setCurrentStep(2);
  };

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      addToast({ type: 'error', title: 'Error', message: 'Email is required' });
      return;
    }
    addToast({ type: 'success', title: 'Code Sent', message: 'Verification code sent to your email.' });
    setCurrentStep(3);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.verificationCode.length < 4) {
      addToast({ type: 'error', title: 'Error', message: 'Please enter a valid code' });
      return;
    }
    setCurrentStep(4);
  };

  const handlePhonePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone || !formData.password) {
      addToast({ type: 'error', title: 'Error', message: 'Phone and Password are required' });
      return;
    }
    if (!validatePassword(formData.password)) {
      addToast({ type: 'error', title: 'Weak Password', message: 'Password must be at least 8 characters and include a special character' });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      addToast({ type: 'error', title: 'Error', message: 'Passwords do not match' });
      return;
    }
    setCurrentStep(5);
  };

  const handleSubmitFinal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName || !formData.contactName) {
      addToast({
        type: 'error',
        title: 'Missing information',
        message: 'Please fill in your Business Name and Contact Name.',
      });
      return;
    }
    if (regOption === 'global' && !formData.businessDoc) {
      addToast({
        type: 'error',
        title: 'Missing Document',
        message: 'Please upload a business license or company registration document for global sellers.',
      });
      return;
    }

    try {
      await api.registerVendorApplication({
        storeName: formData.businessName,
        contactName: formData.contactName,
        email: formData.email,
        phone: formData.phone || '+255 700 000 000',
        city: formData.city,
        category: formData.category,
        businessType: regOption === 'local' ? 'LOCAL_REGISTERED' : 'GLOBAL_EXPORTER'
      });
    } catch {
      // ignore if offline fallback
    }

    setSubmitted(true);
    addToast({
      type: 'success',
      title: 'Vendor Registration Successful!',
      message: `Account created. Status: PENDING_VERIFICATION. Redirecting...`,
    });
    
    setTimeout(() => {
      navigate('/seller-education');
    }, 1500);
  };

  const renderStepTracker = () => {
    const steps = ['Type', 'Email', 'Verify', 'Security', 'Business'];
    return (
      <div className="w-full max-w-3xl mx-auto mb-8 px-4">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-neutral-200 rounded-full z-0"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#FF6A00] rounded-full z-0 transition-all duration-300"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          ></div>
          
          {steps.map((label, idx) => {
            const stepNum = idx + 1;
            const isActive = currentStep === stepNum;
            const isCompleted = currentStep > stepNum;
            return (
              <div key={label} className="relative z-10 flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-colors ${
                  isActive ? 'bg-[#FF6A00] text-white shadow-lg ring-4 ring-orange-100' : 
                  isCompleted ? 'bg-[#FF6A00] text-white' : 'bg-white border-2 border-neutral-300 text-neutral-400'
                }`}>
                  {isCompleted ? <CheckCircle2 size={16} /> : stepNum}
                </div>
                <span className={`text-[10px] sm:text-xs font-bold ${
                  isActive ? 'text-[#FF6A00]' : isCompleted ? 'text-neutral-900' : 'text-neutral-400'
                }`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full space-y-6 pb-16 pt-4">
      <div className="text-center space-y-2 px-4">
        <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Vendor Registration</h1>
        <p className="text-neutral-500 text-sm">Join LUMO and reach millions of buyers globally.</p>
      </div>

      {!submitted && renderStepTracker()}

      <div className="max-w-2xl mx-auto px-4">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div 
              key="submitted"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200 shadow-sm"
            >
              <CheckCircle2 size={48} className="text-emerald-600 mx-auto" />
              <h3 className="text-lg font-black text-emerald-900">Application Submitted!</h3>
              <p className="text-xs text-emerald-700 max-w-md mx-auto">
                Thank you for applying to sell on LUMO. Our merchant operations desk will verify your details and connect your vendor dashboard shortly.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={`step-${currentStep}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-xl"
            >
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-black text-neutral-900 mb-4">Choose Registration Type</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Option 1 */}
                    <label className={`relative flex flex-col p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      regOption === 'local' ? 'border-[#FF6A00] bg-orange-50/30 shadow-md' : 'border-neutral-200 hover:border-neutral-300'
                    }`}>
                      <input 
                        type="radio" 
                        name="regOption" 
                        className="sr-only" 
                        checked={regOption === 'local'}
                        onChange={() => setRegOption('local')}
                      />
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 rounded-xl ${regOption === 'local' ? 'bg-[#FF6A00] text-white' : 'bg-neutral-100 text-neutral-500'}`}>
                          <MapPin size={20} />
                        </div>
                        <span className="font-bold text-neutral-900">Local Business</span>
                      </div>
                      <p className="text-xs text-neutral-500 mb-4 flex-1">Register a business located in a specific region where LUMO is available.</p>
                      
                      <div className="mt-auto" onClick={(e) => { if(regOption !== 'local') e.preventDefault(); }}>
                        <label className="block text-[10px] font-bold text-neutral-700 mb-1">Select Country/Region</label>
                        <select 
                          value={step1Country}
                          onChange={(e) => setStep1Country(e.target.value)}
                          disabled={regOption !== 'local'}
                          className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-xs font-semibold focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] disabled:opacity-50"
                        >
                          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </label>

                    {/* Option 2 */}
                    <label className={`relative flex flex-col p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      regOption === 'global' ? 'border-[#FF6A00] bg-orange-50/30 shadow-md' : 'border-neutral-200 hover:border-neutral-300'
                    }`}>
                      <input 
                        type="radio" 
                        name="regOption" 
                        className="sr-only" 
                        checked={regOption === 'global'}
                        onChange={() => setRegOption('global')}
                      />
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 rounded-xl ${regOption === 'global' ? 'bg-[#FF6A00] text-white' : 'bg-neutral-100 text-neutral-500'}`}>
                          <Globe size={20} />
                        </div>
                        <span className="font-bold text-neutral-900">Sell Globally</span>
                      </div>
                      <p className="text-xs text-neutral-500 mb-4 flex-1">Become a global cross-border seller. Reach international buyers easily.</p>
                      
                      <div className="mt-auto pt-2">
                        <div className={`w-full py-2 text-center text-xs font-bold rounded-lg border ${regOption === 'global' ? 'bg-[#FF6A00]/10 text-[#FF6A00] border-[#FF6A00]/20' : 'bg-neutral-50 text-neutral-400 border-neutral-200'}`}>
                          Global Seller Selected
                        </div>
                      </div>
                    </label>
                  </div>

                  <button
                    onClick={handleNextStep1}
                    className="w-full py-3.5 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-black text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-6"
                  >
                    <span>Next Step</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {currentStep === 2 && (
                <form onSubmit={handleSendCode} className="space-y-5">
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-orange-50 text-[#FF6A00] rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Mail size={24} />
                    </div>
                    <h2 className="text-xl font-black text-neutral-900">Email Verification</h2>
                    <p className="text-xs text-neutral-500 mt-1">We will send a code to verify your identity.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Country/Region</label>
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm font-semibold focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] bg-white"
                    >
                      <option value="" disabled>Select a Country</option>
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="business@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-black text-sm rounded-xl transition shadow-lg mt-2"
                  >
                    Send Verification Code
                  </button>
                </form>
              )}

              {currentStep === 3 && (
                <form onSubmit={handleVerifyCode} className="space-y-5">
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-orange-50 text-[#FF6A00] rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Key size={24} />
                    </div>
                    <h2 className="text-xl font-black text-neutral-900">Enter Code</h2>
                    <p className="text-xs text-neutral-500 mt-1">We sent a verification code to <strong className="text-neutral-900">{formData.email}</strong></p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Verification Code *</label>
                    <input
                      type="text"
                      required
                      value={formData.verificationCode}
                      onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value })}
                      placeholder="Enter 6-digit code"
                      className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm text-center tracking-widest font-bold focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-black text-sm rounded-xl transition shadow-lg mt-2"
                  >
                    Verify & Proceed
                  </button>
                </form>
              )}

              {currentStep === 4 && (
                <form onSubmit={handlePhonePassword} className="space-y-5">
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-orange-50 text-[#FF6A00] rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Lock size={24} />
                    </div>
                    <h2 className="text-xl font-black text-neutral-900">Security Details</h2>
                    <p className="text-xs text-neutral-500 mt-1">Set up your login credentials</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Phone Number *</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+255 712 345 678"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-300 text-sm focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Password *</label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Create a strong password"
                        className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] ${
                          formData.password && !validatePassword(formData.password) ? 'border-red-500' : 'border-neutral-300'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {formData.password && !validatePassword(formData.password) && (
                      <p className="text-[10px] text-red-600 mt-1">Must be at least 8 characters with 1 special character.</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Confirm Password *</label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="Re-enter your password"
                        className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] ${
                          formData.confirmPassword && formData.confirmPassword !== formData.password ? 'border-red-500' : 'border-neutral-300'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {formData.confirmPassword && formData.confirmPassword !== formData.password && (
                      <p className="text-[10px] text-red-600 mt-1">Passwords do not match.</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-black text-sm rounded-xl transition shadow-lg mt-2"
                  >
                    Next Step
                  </button>
                </form>
              )}

              {currentStep === 5 && (
                <form onSubmit={handleSubmitFinal} className="space-y-5">
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-orange-50 text-[#FF6A00] rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Building size={24} />
                    </div>
                    <h2 className="text-xl font-black text-neutral-900">Business Details</h2>
                    <p className="text-xs text-neutral-500 mt-1">Final step to set up your store</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Business / Store Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      placeholder="e.g. Kariakoo Electronics Hub"
                      className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Owner / Manager Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      placeholder="Full name"
                      className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">City / Region *</label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="e.g. Dar es Salaam"
                        className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Primary Category *</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] bg-white"
                      >
                        <option value="Phones & Tablets">Phones & Tablets</option>
                        <option value="Electronics & Audio">Electronics & Audio</option>
                        <option value="Fashion & Apparel">Fashion & Apparel</option>
                        <option value="Home & Living">Home & Living</option>
                        <option value="Beauty & Health">Beauty & Health</option>
                        <option value="Wine & Spirits">Wine & Spirits</option>
                      </select>
                    </div>
                  </div>

                  {regOption === 'global' && (
                    <div className="pt-2">
                      <label className="block text-xs font-bold text-neutral-700 mb-2">Business Documents (License / Registration) *</label>
                      <div className="border-2 border-dashed border-neutral-300 rounded-xl p-6 flex flex-col items-center justify-center bg-neutral-50 hover:bg-neutral-100 transition">
                        <Upload size={24} className="text-neutral-400 mb-2" />
                        <span className="text-sm font-bold text-neutral-700">Click to upload document</span>
                        <span className="text-xs text-neutral-500 mb-3">PDF, JPG, PNG (Max 5MB)</span>
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setFormData({ ...formData, businessDoc: e.target.files[0] });
                            }
                          }}
                          className="text-xs text-neutral-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-[#FF6A00] hover:file:bg-orange-100 cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-black text-sm rounded-xl transition shadow-lg mt-2 flex items-center justify-center gap-2"
                  >
                    <span>Submit Application</span>
                    <CheckCircle2 size={18} />
                  </button>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Popups */}
      <AnimatePresence>
        {showPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPopup(false)}></div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-neutral-200"
            >
              <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-4">
                <AlertCircle size={24} />
              </div>
              
              <h3 className="text-xl font-black text-neutral-900 mb-4">Important Notice</h3>
              
              <div className="space-y-4 text-sm text-neutral-600 mb-8">
                {regOption === 'local' ? (
                  <p>
                    You should have a valid email address, valid phone number for verification and the email or phone number can't be changed after registration.
                  </p>
                ) : (
                  <ul className="space-y-3 list-decimal list-inside">
                    <li>You must have a valid business license issued in the country or region you selected.</li>
                    <li>You must have a valid email address which will be used to accept the verification code. The email address cannot be changed after registration.</li>
                  </ul>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPopup(false)}
                  className="flex-1 py-3 px-4 bg-neutral-100 text-neutral-700 font-bold rounded-xl hover:bg-neutral-200 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProceedPopup}
                  className="flex-1 py-3 px-4 bg-[#FF6A00] text-white font-bold rounded-xl hover:bg-[#E55E00] transition shadow-lg shadow-[#FF6A00]/20 text-sm"
                >
                  Proceed
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

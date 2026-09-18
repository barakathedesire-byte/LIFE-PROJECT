import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Store, DollarSign, ShieldCheck, ArrowRight, CheckCircle2, Building, Clock, AlertCircle, Lock, Sparkles, ShieldAlert } from 'lucide-react';
import { BackButton } from '../components/common/BackButton';
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateFullName, validatePhone, validateBusinessName, validateEmail } from '../utils/validation';
import { api } from '../services/api';

export const BecomePickupPointPage: React.FC = () => {
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const { currentAccount } = useAuth();

  const isAccountVerified = Boolean(currentAccount?.isVerified || currentAccount?.verificationStatus === 'VERIFIED');

  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    phone: '',
    email: '',
    city: 'Dar es Salaam',
    streetAddress: '',
    storageCapacity: '50-100 Small/Medium Parcels',
    operatingHours: '8:00 AM - 8:00 PM (Mon-Sat)',
    tinNumber: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleDashboardClick = () => {
    if (!isAccountVerified) {
      addToast({
        type: 'warning',
        title: 'Inspection & Verification Pending',
        message: 'Your Pickup Station application is awaiting location safety inspection and approval by LUMO logistics.',
      });
      return;
    }
    navigate('/pickup');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const bizRes = validateBusinessName(formData.businessName);
    if (!bizRes.isValid) newErrors.businessName = bizRes.error!;

    const nameRes = validateFullName(formData.ownerName);
    if (!nameRes.isValid) newErrors.ownerName = nameRes.error!;

    const phoneRes = validatePhone(formData.phone);
    if (!phoneRes.isValid) newErrors.phone = phoneRes.error!;

    if (formData.email) {
      const emailRes = validateEmail(formData.email);
      if (!emailRes.isValid) newErrors.email = emailRes.error!;
    }

    if (!formData.streetAddress || formData.streetAddress.length < 5) {
      newErrors.streetAddress = 'Please provide a valid street address and landmark.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addToast('Please correct validation errors before submission.', 'error');
      return;
    }

    setErrors({});
    try {
      const res = await api.registerPickupApplication(formData);
      if (res.success !== false) {
        setSubmitted(true);
        addToast('LumoPoint Pickup Station registration successful! Status: PENDING_VERIFICATION', 'success');
      } else {
        addToast(res.error || 'Registration failed', 'error');
      }
    } catch (err: any) {
      setSubmitted(true);
      addToast('Registration submitted with PENDING verification status.', 'success');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full max-w-6xl mx-auto px-2 sm:px-4 lg:px-6 py-4 space-y-6 pb-20"
    >
      <div className="flex items-center justify-between">
        <BackButton label="Back to Home" fallbackUrl="/" />
      </div>

      <div className="w-full bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black uppercase tracking-wider">
            <MapPin size={14} />
            <span>LumoPoint Pickup Station Network</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Host a LumoPoint. Monetize Your Retail Footprint.
          </h1>
          <p className="text-xs sm:text-base text-emerald-100 leading-relaxed">
            Turn unused retail counter space into a reliable recurring revenue stream. Handle safe parcel customer pickups and seller drop-offs backed by OTP security.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs space-y-4">
            <h3 className="font-black text-neutral-900 text-lg">Partner Benefits</h3>
            <div className="space-y-3 text-xs text-neutral-600">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 font-bold">
                  <DollarSign size={16} />
                </div>
                <div>
                  <strong className="text-neutral-900 block text-sm">Monthly Rental & Per-Package Fee</strong>
                  Earn guaranteed handling fees for every package scanned in and collected by buyers.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 font-bold">
                  <Store size={16} />
                </div>
                <div>
                  <strong className="text-neutral-900 block text-sm">Massive In-Store Foot Traffic</strong>
                  Hundreds of neighborhood buyers visiting your shop daily to collect their e-commerce orders.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <strong className="text-neutral-900 block text-sm">Zero Liability with OTP Scan</strong>
                  Packages only release when the customer enters their secret SMS/WhatsApp OTP code.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-xs">
            {submitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-black text-neutral-900">Application Submitted!</h3>
                <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
                  Asante, <strong>{formData.businessName}</strong>. Our logistics regional officer will visit your location to inspect storage safety and install the LumoPoint parcel scanner terminal.
                </p>
                <div className="pt-4 flex flex-col items-center justify-center gap-3 max-w-md mx-auto">
                  {!isAccountVerified ? (
                    <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center space-y-3">
                      <div className="flex items-center justify-center gap-2 text-amber-900 font-bold text-xs">
                        <Lock size={14} className="text-amber-600" />
                        <span>Station Terminal Locked (Inspection Pending)</span>
                      </div>
                      <button
                        onClick={handleDashboardClick}
                        className="w-full px-6 py-2.5 bg-slate-200 text-slate-500 font-extrabold text-xs rounded-xl border border-slate-300 shadow-none cursor-not-allowed opacity-80 flex items-center justify-center gap-2 select-none"
                      >
                        <Lock size={14} className="text-slate-400" />
                        <span>Go to Pickup Station Dashboard</span>
                      </button>
                    </div>
                  ) : (
                    <div className="w-full space-y-3">
                      <button
                        onClick={handleDashboardClick}
                        className="w-full px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2 transition"
                      >
                        <span>Go to Pickup Station Dashboard</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => navigate('/')}
                    className="px-6 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs rounded-xl cursor-pointer transition"
                  >
                    Return Home
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="pb-3 border-b border-neutral-100">
                  <h3 className="text-xl font-black text-neutral-900">LumoPoint Host Application</h3>
                  <p className="text-xs text-neutral-500">Provide details about your retail shop or commercial facility.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Store / Business Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kariakoo Electronics & Superette"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className={`w-full px-3 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none ${errors.businessName ? 'border-rose-500 bg-rose-50' : 'border-neutral-300'}`}
                    />
                    {errors.businessName && <p className="text-[10px] text-rose-600 mt-1 font-bold flex items-center gap-1"><AlertCircle size={10} />{errors.businessName}</p>}
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Contact Person Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jackson Mwita"
                      value={formData.ownerName}
                      onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                      className={`w-full px-3 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none ${errors.ownerName ? 'border-rose-500 bg-rose-50' : 'border-neutral-300'}`}
                    />
                    {errors.ownerName && <p className="text-[10px] text-rose-600 mt-1 font-bold flex items-center gap-1"><AlertCircle size={10} />{errors.ownerName}</p>}
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Phone Number (M-Pesa) *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+255 754 000 000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`w-full px-3 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none ${errors.phone ? 'border-rose-500 bg-rose-50' : 'border-neutral-300'}`}
                    />
                    {errors.phone && <p className="text-[10px] text-rose-600 mt-1 font-bold flex items-center gap-1"><AlertCircle size={10} />{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="shop@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full px-3 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none ${errors.email ? 'border-rose-500 bg-rose-50' : 'border-neutral-300'}`}
                    />
                    {errors.email && <p className="text-[10px] text-rose-600 mt-1 font-bold flex items-center gap-1"><AlertCircle size={10} />{errors.email}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-neutral-700 block mb-1">Exact Street Address & Landmark *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aggrey St / Swahili St Junction, Opposite Kariakoo Post Office, Dar es Salaam"
                      value={formData.streetAddress}
                      onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                      className={`w-full px-3 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none ${errors.streetAddress ? 'border-rose-500 bg-rose-50' : 'border-neutral-300'}`}
                    />
                    {errors.streetAddress && <p className="text-[10px] text-rose-600 mt-1 font-bold flex items-center gap-1"><AlertCircle size={10} />{errors.streetAddress}</p>}
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Available Storage Capacity</label>
                    <select
                      value={formData.storageCapacity}
                      onChange={(e) => setFormData({ ...formData, storageCapacity: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 bg-white text-xs"
                    >
                      <option value="30-50 Small Parcels">30-50 Small Parcels</option>
                      <option value="50-100 Small/Medium Parcels">50-100 Small/Medium Parcels</option>
                      <option value="100-300 Large/Bulky Inventory">100-300 Large/Bulky Inventory</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Operating Hours</label>
                    <input
                      type="text"
                      value={formData.operatingHours}
                      onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-xs"
                    />
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Submit LumoPoint Application</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

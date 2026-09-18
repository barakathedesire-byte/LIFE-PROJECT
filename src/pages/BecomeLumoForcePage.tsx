import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, TrendingUp, DollarSign, Award, ArrowRight, CheckCircle2, Building, Target, ShieldCheck, Lock, Sparkles } from 'lucide-react';
import { BackButton } from '../components/common/BackButton';
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const BecomeLumoForcePage: React.FC = () => {
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const { currentAccount } = useAuth();

  const isAccountVerified = Boolean(currentAccount?.isVerified || currentAccount?.verificationStatus === 'VERIFIED');

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    city: 'Dar es Salaam',
    region: 'Kariakoo & CBD Commercial District',
    salesExperience: '1-3 Years Direct Sales',
    targetCategory: 'Electronics & Phones',
    nationalId: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleDashboardClick = () => {
    if (!isAccountVerified) {
      addToast({
        type: 'warning',
        title: 'NIDA Verification Pending',
        message: 'Your Sales Agent registration is awaiting NIDA ID verification and activation by LUMO sales operations.',
      });
      return;
    }
    navigate('/sales');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.nationalId) {
      addToast('Please fill all required agent fields', 'error');
      return;
    }
    setSubmitted(true);
    addToast('LumoForce Agent application registered successfully!', 'success');
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

      <div className="w-full bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-black uppercase tracking-wider">
            <Users size={14} />
            <span>LumoForce Field Sales Network</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Join LumoForce. Earn Uncapped Commissions.
          </h1>
          <p className="text-xs sm:text-base text-blue-100 leading-relaxed">
            Empower local shopkeepers, wholesalers, and retail merchants to list on LUMO. Earn direct commissions for every verified vendor onboarded and percentage cuts on their ongoing sales.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs space-y-4">
            <h3 className="font-black text-neutral-900 text-lg">Agent Benefits</h3>
            <div className="space-y-3 text-xs text-neutral-600">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold">
                  <DollarSign size={16} />
                </div>
                <div>
                  <strong className="text-neutral-900 block text-sm">Weekly Direct Payouts</strong>
                  Earn up to TZS 50,000 per verified vendor signup plus 1.5% commission on first 90 days GMV.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 font-bold">
                  <Target size={16} />
                </div>
                <div>
                  <strong className="text-neutral-900 block text-sm">Official Sales Toolkit</strong>
                  Get access to the LumoForce mobile agent app, merchant flyers, and digital registration barcode scanners.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 font-bold">
                  <Award size={16} />
                </div>
                <div>
                  <strong className="text-neutral-900 block text-sm">Top Performer Bonuses</strong>
                  Monthly cash bonuses, smartphones, and fast-track leadership opportunities across East Africa.
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
                  Welcome to LumoForce, <strong>{formData.fullName}</strong>. Check your phone for agent onboarding instructions and access credentials.
                </p>
                <div className="pt-4 flex flex-col items-center justify-center gap-3 max-w-md mx-auto">
                  {!isAccountVerified ? (
                    <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center space-y-3">
                      <div className="flex items-center justify-center gap-2 text-amber-900 font-bold text-xs">
                        <Lock size={14} className="text-amber-600" />
                        <span>Sales Lead Portal Locked (NIDA Check Pending)</span>
                      </div>
                      <button
                        onClick={handleDashboardClick}
                        className="w-full px-6 py-2.5 bg-slate-200 text-slate-500 font-extrabold text-xs rounded-xl border border-slate-300 shadow-none cursor-not-allowed opacity-80 flex items-center justify-center gap-2 select-none"
                      >
                        <Lock size={14} className="text-slate-400" />
                        <span>Go to Sales Dashboard</span>
                      </button>
                    </div>
                  ) : (
                    <div className="w-full space-y-3">
                      <button
                        onClick={handleDashboardClick}
                        className="w-full px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2 transition"
                      >
                        <span>Go to Sales Dashboard</span>
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
                  <h3 className="text-xl font-black text-neutral-900">LumoForce Agent Registration</h3>
                  <p className="text-xs text-neutral-500">Sign up to become an authorized field representative.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Full Legal Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Amina Selemani Bakari"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Phone Number (M-Pesa) *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+255 754 000 000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="agent@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">National ID (NIDA) *</label>
                    <input
                      type="text"
                      required
                      placeholder="NIDA-19950505-00000"
                      value={formData.nationalId}
                      onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Target Commercial Zone *</label>
                    <select
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 bg-white text-xs"
                    >
                      <option value="Kariakoo & CBD Commercial District">Kariakoo & CBD Commercial District</option>
                      <option value="Mwenge, Sinza & Ubungo Electronics Hub">Mwenge, Sinza & Ubungo Electronics Hub</option>
                      <option value="Mlimani & University Zone">Mlimani & University Zone</option>
                      <option value="Arusha Town & Central Market">Arusha Town & Central Market</option>
                      <option value="Mwanza Capripoint & Nyamagana">Mwanza Capripoint & Nyamagana</option>
                      <option value="Dodoma Majengo Market">Dodoma Majengo Market</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Primary Vendor Category</label>
                    <select
                      value={formData.targetCategory}
                      onChange={(e) => setFormData({ ...formData, targetCategory: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 bg-white text-xs"
                    >
                      <option value="Electronics & Phones">Electronics & Phones</option>
                      <option value="Fashion & Shoes">Fashion & Shoes</option>
                      <option value="Home & Kitchenware">Home & Kitchenware</option>
                      <option value="Supermarket & Grains">Supermarket & Grains</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Register as LumoForce Agent</span>
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

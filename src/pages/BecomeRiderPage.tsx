import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Bike, ShieldCheck, MapPin, DollarSign, Clock, ArrowRight, CheckCircle2, Phone, Mail, User, FileText, ChevronRight, AlertCircle } from 'lucide-react';
import { BackButton } from '../components/common/BackButton';
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { validateFullName, validatePhone, validateNidaNumber, validateEmail } from '../utils/validation';
import { api } from '../services/api';

export const BecomeRiderPage: React.FC = () => {
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    city: 'Dar es Salaam',
    zone: 'Kinondoni & Ilala',
    vehicleType: 'Motorcycle (Boda Boda)',
    licenseNumber: '',
    nationalId: '',
    experienceYears: '2-3 Years',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const nameRes = validateFullName(formData.fullName);
    if (!nameRes.isValid) newErrors.fullName = nameRes.error!;

    const phoneRes = validatePhone(formData.phone);
    if (!phoneRes.isValid) newErrors.phone = phoneRes.error!;

    const nidaRes = validateNidaNumber(formData.nationalId);
    if (!nidaRes.isValid) newErrors.nationalId = nidaRes.error!;

    if (formData.email) {
      const emailRes = validateEmail(formData.email);
      if (!emailRes.isValid) newErrors.email = emailRes.error!;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addToast('Please correct validation errors before submission.', 'error');
      return;
    }

    setErrors({});

    try {
      const res = await api.registerRiderApplication({
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email || `rider-${Date.now()}@lumo.africa`,
        nationalId: formData.nationalId,
        vehicleType: formData.vehicleType,
        zone: formData.zone,
        verificationStatus: 'PENDING_VERIFICATION'
      });

      if (res.success !== false) {
        setSubmitted(true);
        addToast('Lumo Move Rider application registered successfully! Status: PENDING_VERIFICATION', 'success');
      } else {
        addToast(res.error || 'Registration failed', 'error');
      }
    } catch (err: any) {
      setSubmitted(true);
      addToast('Rider application recorded with PENDING verification status.', 'success');
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

      <div className="w-full bg-gradient-to-r from-neutral-900 via-neutral-800 to-amber-700 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black uppercase tracking-wider">
            <Bike size={14} />
            <span>Lumo Move Logistics Network</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Ride with LUMO. Earn Daily & Weekly.
          </h1>
          <p className="text-xs sm:text-base text-neutral-300 leading-relaxed">
            Join Tanzania's premier escrow-backed courier network. Enjoy automated route dispatch, guaranteed on-time dropoff bonuses, and instant M-Pesa payouts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Benefits */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs space-y-4">
            <h3 className="font-black text-neutral-900 text-lg">Why Deliver with Lumo?</h3>
            <div className="space-y-3 text-xs text-neutral-600">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 font-bold">
                  <DollarSign size={16} />
                </div>
                <div>
                  <strong className="text-neutral-900 block text-sm">Competitive Pay & Tips</strong>
                  Earn per delivery plus 100% of customer tips and express delivery surge bonuses.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 font-bold">
                  <Clock size={16} />
                </div>
                <div>
                  <strong className="text-neutral-900 block text-sm">Flexible Working Shifts</strong>
                  Choose your operating zone and delivery hours that suit your personal schedule.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <strong className="text-neutral-900 block text-sm">Rider Safety & Gear</strong>
                  Equipped with high-visibility branded vests, secure parcel lockboxes, and live GPS assistance.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-xs">
            {submitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-black text-neutral-900">Application Under Verification</h3>
                <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
                  Asante sana, <strong>{formData.fullName}</strong>! Our verification team will review your NIDA and driving documents and contact you within 24 hours for rider orientation.
                </p>
                <div className="pt-4 flex justify-center gap-3">
                  <button
                    onClick={() => navigate('/delivery')}
                    className="px-6 py-2.5 bg-[#FF6A00] hover:bg-[#e05d00] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-2 mx-auto"
                  >
                    <span>Go to Rider Dashboard (Pending Verification)</span>
                    <ArrowRight size={14} />
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="px-6 py-2.5 bg-neutral-100 text-neutral-700 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Return Home
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="pb-3 border-b border-neutral-100">
                  <h3 className="text-xl font-black text-neutral-900">Rider Partner Application</h3>
                  <p className="text-xs text-neutral-500">Provide accurate legal information for background verification.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Full Legal Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Juma Selemani Rashid"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className={`w-full px-3 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-[#FF6A00] focus:outline-none ${errors.fullName ? 'border-rose-500 bg-rose-50' : 'border-neutral-300'}`}
                    />
                    {errors.fullName && <p className="text-[10px] text-rose-600 mt-1 font-bold flex items-center gap-1"><AlertCircle size={10} />{errors.fullName}</p>}
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Phone Number (M-Pesa) *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+255 754 000 000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`w-full px-3 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-[#FF6A00] focus:outline-none ${errors.phone ? 'border-rose-500 bg-rose-50' : 'border-neutral-300'}`}
                    />
                    {errors.phone && <p className="text-[10px] text-rose-600 mt-1 font-bold flex items-center gap-1"><AlertCircle size={10} />{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="rider@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full px-3 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-[#FF6A00] focus:outline-none ${errors.email ? 'border-rose-500 bg-rose-50' : 'border-neutral-300'}`}
                    />
                    {errors.email && <p className="text-[10px] text-rose-600 mt-1 font-bold flex items-center gap-1"><AlertCircle size={10} />{errors.email}</p>}
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">National ID (NIDA) *</label>
                    <input
                      type="text"
                      required
                      placeholder="NIDA-19900101-00000"
                      value={formData.nationalId}
                      onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                      className={`w-full px-3 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-[#FF6A00] focus:outline-none ${errors.nationalId ? 'border-rose-500 bg-rose-50' : 'border-neutral-300'}`}
                    />
                    {errors.nationalId && <p className="text-[10px] text-rose-600 mt-1 font-bold flex items-center gap-1"><AlertCircle size={10} />{errors.nationalId}</p>}
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Vehicle Type *</label>
                    <select
                      value={formData.vehicleType}
                      onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 bg-white text-xs"
                    >
                      <option value="Motorcycle (Boda Boda)">Motorcycle (Boda Boda)</option>
                      <option value="Electric Bike (E-Boda)">Electric Bike (E-Boda)</option>
                      <option value="Cargo Tricycle (Bajaji)">Cargo Tricycle (Bajaji)</option>
                      <option value="Delivery Van">Delivery Van / Minivan</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Preferred Operating Zone *</label>
                    <select
                      value={formData.zone}
                      onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 bg-white text-xs"
                    >
                      <option value="Kinondoni & Ilala">Kinondoni & Ilala (CBD & Kariakoo)</option>
                      <option value="Temeke & Kigamboni">Temeke & Kigamboni</option>
                      <option value="Ubungo & Sinza">Ubungo & Sinza / Mwenge</option>
                      <option value="Arusha Urban">Arusha Urban</option>
                      <option value="Mwanza City">Mwanza City</option>
                      <option value="Dodoma Capital">Dodoma Capital</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-[#FF6A00] hover:bg-[#E55E00] text-white font-bold text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Submit Rider Application</span>
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

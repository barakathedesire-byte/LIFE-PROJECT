import React, { useState } from 'react';
import { Download, CheckCircle2, XCircle, Lightbulb, FileText, BookOpen, Presentation, Video, Camera, ArrowRight, Lock, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export const SellerEducationPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentAccount } = useAuth();
  const { addToast } = useNotification();

  // Check account verification status
  const isAccountVerified = Boolean(currentAccount?.isVerified || currentAccount?.verificationStatus === 'VERIFIED');

  const handleDashboardClick = () => {
    if (!isAccountVerified) {
      addToast({
        type: 'warning',
        title: 'Verification Required',
        message: 'Your seller account is awaiting verification by LUMO Compliance. Dashboard access will unlock upon verification approval.',
      });
      return;
    }
    navigate('/seller');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto px-4 py-12 space-y-10"
    >
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="w-16 h-16 bg-orange-100 text-[#FF6A00] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs">
          <BookOpen size={32} />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight">
          Seller Education & Success Portal
        </h1>
        <p className="text-neutral-600 text-sm md:text-base leading-relaxed">
          Welcome to LUMO! As a newly registered seller, your account is currently undergoing verification by our compliance team. Explore our seller guidelines below while you wait for verification.
        </p>

        {/* Verification Status Banner & Dashboard Access Button */}
        <div className="pt-2 flex flex-col items-center justify-center gap-4 max-w-xl mx-auto">
          {!isAccountVerified ? (
            <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left text-amber-900 space-y-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 font-bold shadow-xs">
                  <ShieldAlert size={22} />
                </div>
                <div>
                  <h4 className="font-black text-sm text-amber-950">Registration Submitted — Verification Pending</h4>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Dashboard access is locked until BRELA & TIN compliance check is approved.
                  </p>
                </div>
              </div>

              <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-amber-200/80 pt-3">
                <button
                  onClick={handleDashboardClick}
                  disabled={!isAccountVerified}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-200 text-slate-500 font-extrabold text-xs sm:text-sm rounded-2xl border border-slate-300 shadow-none cursor-not-allowed opacity-80 flex items-center justify-center gap-2 transition select-none"
                  title="Dashboard access disabled until verification is complete"
                >
                  <Lock size={16} className="text-slate-400" />
                  <span>Go to Seller Dashboard</span>
                  <ArrowRight size={16} className="text-slate-400" />
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-left text-emerald-900 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold shadow-xs">
                    <CheckCircle2 size={22} />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-emerald-950">Account Fully Verified & Active</h4>
                    <p className="text-xs text-emerald-700">All seller tools, inventory listing, and payouts are unlocked.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-200">
                <button
                  onClick={handleDashboardClick}
                  className="w-full sm:w-auto px-6 py-3 bg-[#FF6A00] hover:bg-[#e05d00] text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  <span>Go to Seller Dashboard</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Do's */}
        <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100">
          <h2 className="text-xl font-black text-emerald-900 flex items-center gap-2 mb-4">
            <CheckCircle2 className="text-emerald-600" />
            Best Practices (Do's)
          </h2>
          <ul className="space-y-3">
            {[
              "Provide accurate, high-quality photos of your products.",
              "Write detailed descriptions including dimensions and specs.",
              "Ship orders within 24 hours of receiving them.",
              "Respond to buyer inquiries politely and promptly.",
              "Use secure packaging to prevent damage during transit.",
              "Keep your inventory updated in real-time."
            ].map((item, i) => (
              <li key={i} className="flex gap-2 text-emerald-800 text-sm">
                <span className="text-emerald-500 font-bold">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Don'ts */}
        <div className="bg-red-50 rounded-3xl p-6 border border-red-100">
          <h2 className="text-xl font-black text-red-900 flex items-center gap-2 mb-4">
            <XCircle className="text-red-600" />
            Strict Policies (Don'ts)
          </h2>
          <ul className="space-y-3">
            {[
              "Do NOT post counterfeit or prohibited items.",
              "Do NOT attempt to bypass the LUMO Escrow system.",
              "Do NOT use misleading titles or clickbait pricing.",
              "Do NOT ignore customer return requests.",
              "Do NOT share personal contact details in product descriptions.",
              "Do NOT use watermarked images from competitors."
            ].map((item, i) => (
              <li key={i} className="flex gap-2 text-red-800 text-sm">
                <span className="text-red-500 font-bold">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Content Ideas */}
      <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xl space-y-6">
        <h2 className="text-2xl font-black text-neutral-900 flex items-center gap-2">
          <Lightbulb className="text-amber-500" />
          Content Ideas for Better Listings
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-neutral-50 rounded-2xl">
            <Camera size={24} className="text-[#FF6A00] mb-3" />
            <h3 className="font-bold text-neutral-900 mb-2">Lifestyle Photography</h3>
            <p className="text-xs text-neutral-500">Show your product in use. A phone being held, or clothes being worn helps buyers visualize the item.</p>
          </div>
          <div className="p-4 bg-neutral-50 rounded-2xl">
            <Video size={24} className="text-[#FF6A00] mb-3" />
            <h3 className="font-bold text-neutral-900 mb-2">Unboxing Shorts</h3>
            <p className="text-xs text-neutral-500">Upload 15-second clips of your product being unboxed to build trust and prove authenticity.</p>
          </div>
          <div className="p-4 bg-neutral-50 rounded-2xl">
            <Presentation size={24} className="text-[#FF6A00] mb-3" />
            <h3 className="font-bold text-neutral-900 mb-2">Size & Scale Guides</h3>
            <p className="text-xs text-neutral-500">Include a graphic comparing your product size to standard items (like a coin or hand) to reduce return rates.</p>
          </div>
        </div>
      </div>

      {/* Downloadable Materials */}
      <div className="bg-neutral-900 text-white rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6A00] rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-black mb-2">Download Marketing Materials</h2>
          <p className="text-neutral-400 text-sm mb-6 max-w-2xl">
            Access our official brand guidelines, promotional social media templates, and high-resolution logos to use on your own channels to drive traffic to your LUMO store.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center justify-between p-4 bg-neutral-800 hover:bg-neutral-700 rounded-2xl transition border border-neutral-700">
              <div className="flex items-center gap-3">
                <FileText className="text-[#FF6A00]" />
                <div>
                  <h4 className="font-bold text-sm">LUMO Vendor Handbook.pdf</h4>
                  <p className="text-xs text-neutral-400">Complete policy guide (2.4 MB)</p>
                </div>
              </div>
              <Download size={18} className="text-neutral-400" />
            </a>
            
            <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center justify-between p-4 bg-neutral-800 hover:bg-neutral-700 rounded-2xl transition border border-neutral-700">
              <div className="flex items-center gap-3">
                <Presentation className="text-blue-400" />
                <div>
                  <h4 className="font-bold text-sm">Social Media Promo Kit.zip</h4>
                  <p className="text-xs text-neutral-400">Instagram/FB Templates (15 MB)</p>
                </div>
              </div>
              <Download size={18} className="text-neutral-400" />
            </a>
          </div>
        </div>
      </div>
      
    </motion.div>
  );
};

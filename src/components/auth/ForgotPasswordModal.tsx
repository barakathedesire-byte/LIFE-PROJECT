import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Eye,
  EyeOff,
  KeyRound
} from 'lucide-react';
import { LumoLogo } from '../common/LumoLogo';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (identifier: string) => void;
  initialIdentifier?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialIdentifier = ''
}) => {
  const [step, setStep] = useState<'request' | 'verify' | 'success'>('request');
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [maskedContact, setMaskedContact] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [devResetCode, setDevResetCode] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Reset state when opening
  React.useEffect(() => {
    if (isOpen) {
      setStep('request');
      setIdentifier(initialIdentifier);
      setCode('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMessage(null);
      setStatusMessage(null);
      setDevResetCode(null);
    }
  }, [isOpen, initialIdentifier]);

  if (!isOpen) return null;

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = identifier.trim();
    if (!cleanId) {
      setErrorMessage('Please enter the email address or phone number you used for registration.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: cleanId,
          validateAccount: true
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Unable to process password reset request.');
      }

      setMaskedContact(data.maskedContact || cleanId);
      if (data.resetToken) setResetToken(data.resetToken);
      if (data.resetCode) setDevResetCode(data.resetCode);

      setStatusMessage(data.message || 'Verification code dispatched.');
      setStep('verify');
    } catch (err: any) {
      setErrorMessage(err.message || 'Password reset request failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: resetToken || undefined,
          code: code.trim(),
          identifier: identifier.trim(),
          newPassword
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to reset password. Code may have expired.');
      }

      setStep('success');
      if (onSuccess) {
        onSuccess(identifier.trim());
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update password.');
    } finally {
      setIsLoading(false);
    }
  };

  const isPasswordValid = newPassword.length >= 8 && /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-white rounded-3xl border border-neutral-200/90 shadow-2xl p-6 sm:p-8 my-8 text-neutral-900"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="text-center space-y-2 mb-6">
            <div className="flex justify-center mb-1">
              <LumoLogo size="md" variant="dark" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-[#FF6A00] border border-orange-200/70 text-xs font-bold">
              <KeyRound size={13} />
              <span>Password Recovery</span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-neutral-900">
              {step === 'request' && 'Forgot Your Password?'}
              {step === 'verify' && 'Verify & Set New Password'}
              {step === 'success' && 'Password Reset Complete!'}
            </h2>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              {step === 'request' && 'Enter the registered email address or phone number you used when creating your LUMO account.'}
              {step === 'verify' && `We sent a 6-digit verification code to ${maskedContact}. Enter it below to set your new password.`}
              {step === 'success' && 'Your password has been securely updated. You can now log into your account.'}
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 mb-4"
            >
              <AlertCircle size={16} className="shrink-0 text-red-500 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold">Verification Failed</span>
                <p>{errorMessage}</p>
              </div>
            </motion.div>
          )}

          {/* Status Banner */}
          {statusMessage && step === 'verify' && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-800 mb-4">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <span className="font-bold">Code Sent Successfully</span>
                <p>{statusMessage}</p>
                {devResetCode && (
                  <div className="mt-1.5 pt-1.5 border-t border-emerald-200/60 font-mono text-[11px] text-emerald-900">
                    <span>Quick verification code: </span>
                    <strong className="bg-emerald-100 px-1.5 py-0.5 rounded font-black tracking-widest">{devResetCode}</strong>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 1: Enter email or phone */}
          {step === 'request' && (
            <form onSubmit={handleRequestCode} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-neutral-800 block mb-1">
                  Registered Email Address or Phone Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    autoFocus
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. rashid@example.com or +255 712 345 678"
                    className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-[#FF6A00] focus:bg-white text-xs sm:text-sm"
                  />
                  {identifier.includes('@') ? (
                    <Mail size={15} className="absolute left-3 top-3 text-neutral-400" />
                  ) : (
                    <Phone size={15} className="absolute left-3 top-3 text-neutral-400" />
                  )}
                </div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 text-[11px] text-neutral-600 flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                <span>Security validation: Reset codes are strictly issued only to verified registered accounts.</span>
              </div>

              <button
                type="submit"
                disabled={isLoading || !identifier.trim()}
                className="w-full py-3 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
              >
                {isLoading ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <>
                    <span>Verify Account & Send Code</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Enter 6-digit code & new password */}
          {step === 'verify' && (
            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-neutral-800 block mb-1">
                  6-Digit Verification Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="w-full tracking-widest text-center text-lg font-mono font-black py-2 bg-neutral-50 border border-neutral-200 rounded-xl outline-hidden focus:border-[#FF6A00] focus:bg-white"
                  />
                </div>
                <div className="flex justify-between items-center mt-1 text-[11px]">
                  <span className="text-neutral-400">Valid for 15 minutes</span>
                  <button
                    type="button"
                    onClick={handleRequestCode}
                    disabled={isLoading}
                    className="text-[#FF6A00] font-bold hover:underline cursor-pointer"
                  >
                    Resend Code
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-800 block mb-1">
                  New Secure Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters..."
                    className="w-full pl-9 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-[#FF6A00] focus:bg-white"
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
                {newPassword && (
                  <div className="mt-1 flex items-center gap-1.5 text-[10px]">
                    <div className={`h-1.5 flex-1 rounded-full ${isPasswordValid ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                    <span className={isPasswordValid ? 'text-emerald-600 font-bold' : 'text-amber-600'}>
                      {isPasswordValid ? 'Strong Password' : 'Min 8 characters + number or symbol'}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-neutral-800 block mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type your new password"
                    className="w-full pl-9 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-hidden focus:border-[#FF6A00] focus:bg-white"
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

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStep('request')}
                  className="px-4 py-2.5 border border-neutral-200 rounded-xl text-neutral-600 hover:bg-neutral-50 font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !code || !isPasswordValid || newPassword !== confirmPassword}
                  className="flex-1 py-2.5 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
                >
                  {isLoading ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <>
                      <span>Set New Password</span>
                      <ShieldCheck size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Success state */}
          {step === 'success' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center">
                <CheckCircle2 size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-neutral-900">
                  Password Successfully Reset!
                </h3>
                <p className="text-xs text-neutral-500">
                  Your new credentials are now active across all LUMO systems. You may now sign into your account.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition cursor-pointer"
              >
                Sign In With New Password
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

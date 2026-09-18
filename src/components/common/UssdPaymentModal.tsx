import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, CheckCircle2, AlertCircle, Loader2, X, RefreshCw, Lock } from 'lucide-react';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

interface UssdPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (transaction: any) => void;
  amount: number;
  payerPhone: string;
  payerName?: string;
  payerType?: 'CUSTOMER' | 'SELLER' | 'PICKUP_STATION' | 'USER';
  provider?: string;
  referenceType?: 'ORDER_CHECKOUT' | 'SELLER_AD_WALLET' | 'SELLER_AD_BOOST' | 'PICKUP_DEPOSIT' | 'PICKUP_ORDER_PAYMENT' | 'WALLET_TOPUP' | string;
  referenceId?: string;
  description?: string;
  metadata?: any;
}

export const UssdPaymentModal: React.FC<UssdPaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  amount,
  payerPhone,
  payerName = 'LUMO User',
  payerType = 'CUSTOMER',
  provider = 'M-Pesa (Vodacom)',
  referenceType = 'ORDER_CHECKOUT',
  referenceId,
  description,
  metadata
}) => {
  const [stage, setStage] = useState<'INITIATING' | 'WAITING_PIN' | 'VERIFYING' | 'SUCCESS' | 'FAILED'>('INITIATING');
  const [transaction, setTransaction] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const pollIntervalRef = useRef<any>(null);
  const countdownTimerRef = useRef<any>(null);

  // Clean phone number display
  const formattedPhone = payerPhone.startsWith('+') ? payerPhone : `+255 ${payerPhone.replace(/^0/, '')}`;

  useEffect(() => {
    if (!isOpen) {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      setStage('INITIATING');
      setTransaction(null);
      setErrorMessage('');
      setSecondsRemaining(60);
      return;
    }

    let isMounted = true;

    // Start USSD Payment flow with backend
    const initiatePayment = async () => {
      setStage('INITIATING');
      setErrorMessage('');
      setSecondsRemaining(60);

      try {
        const res = await api.initiateUssdPayment({
          payerType: payerType as any,
          payerName,
          payerPhone,
          provider,
          amount,
          referenceType: referenceType as any,
          referenceId,
          description: description || `Payment for ${referenceType.replace(/_/g, ' ')}`,
          metadata
        });

        if (!isMounted) return;

        if (!res.success || !res.transactionId) {
          setStage('FAILED');
          setErrorMessage(res.error || 'Failed to dispatch USSD prompt. Please verify phone number.');
          return;
        }

        setTransaction(res);
        setStage('WAITING_PIN');

        // Start countdown
        countdownTimerRef.current = setInterval(() => {
          setSecondsRemaining((prev) => {
            if (prev <= 1) {
              clearInterval(countdownTimerRef.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        // Start polling backend for phone approval
        pollIntervalRef.current = setInterval(async () => {
          try {
            const statusRes = await api.getUssdPaymentStatus(res.transactionId);
            if (statusRes.success && statusRes.status === 'SUCCESS') {
              if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
              if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
              setStage('SUCCESS');
              setTransaction(statusRes.transaction);
              setTimeout(() => {
                onSuccess(statusRes.transaction);
              }, 1200);
            } else if (statusRes.status === 'CANCELLED' || statusRes.status === 'FAILED') {
              if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
              if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
              setStage('FAILED');
              setErrorMessage('Payment was rejected or cancelled on the handset.');
            }
          } catch {
            // keep polling
          }
        }, 1200);
      } catch (err: any) {
        if (!isMounted) return;
        setStage('FAILED');
        setErrorMessage(err?.message || 'Network connection failed during payment initiation.');
      }
    };

    initiatePayment();

    return () => {
      isMounted = false;
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [isOpen, amount, payerPhone, provider, referenceType, referenceId]);

  if (!isOpen) return null;

  const handleCancel = async () => {
    if (transaction?.transactionId) {
      try {
        await api.cancelUssdPayment(transaction.transactionId);
      } catch {
        // silent
      }
    }
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden text-neutral-900 animate-scaleUp">
        {/* Header */}
        <div className="bg-neutral-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center font-bold">
              <Smartphone size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base leading-tight">
                LUMO Pay · USSD Push
              </h3>
              <p className="text-[11px] text-neutral-400">
                Authorizing via {provider}
              </p>
            </div>
          </div>
          {stage !== 'SUCCESS' && (
            <button
              onClick={handleCancel}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Amount Badge */}
          <div className="bg-neutral-50 border border-neutral-200/80 rounded-2xl p-4 text-center space-y-1">
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Amount Due
            </div>
            <div className="text-2xl sm:text-3xl font-black text-neutral-900">
              {formatCurrency(amount)}
            </div>
            <div className="text-xs text-neutral-600 font-medium">
              Recipient: <span className="font-bold text-neutral-900">LUMO Escrow Vault</span>
            </div>
          </div>

          {/* Dynamic Stages */}
          {stage === 'INITIATING' && (
            <div className="py-6 text-center space-y-3">
              <Loader2 size={36} className="animate-spin text-red-600 mx-auto" />
              <div className="text-sm font-bold text-neutral-800">
                Sending USSD Push Prompt...
              </div>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                Contacting mobile money gateway for {formattedPhone}
              </p>
            </div>
          )}

          {stage === 'WAITING_PIN' && (
            <div className="space-y-4">
              {/* Phone Prompt Graphic / Instruction */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs sm:text-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                  <span>Check Your Phone Screen Now</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  A USSD payment prompt has been sent to{' '}
                  <strong className="text-amber-950 font-bold">{formattedPhone}</strong>.
                  Please enter your <strong className="text-amber-950">Mobile Money PIN</strong> on your handset to approve.
                </p>
              </div>

              {/* Security Banner */}
              <div className="flex items-start gap-2.5 p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-[11px] text-neutral-600">
                <Lock size={15} className="text-neutral-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Safe & Encrypted:</strong> LUMO will never ask you to type your PIN on this website. Keep your PIN private.
                </span>
              </div>

              {/* Status / Countdown */}
              <div className="flex items-center justify-between text-xs text-neutral-500 pt-1">
                <div className="flex items-center gap-2">
                  <Loader2 size={13} className="animate-spin text-neutral-600" />
                  <span>Waiting for handset confirmation...</span>
                </div>
                <span className="font-mono font-bold text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded-md">
                  0:{secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining}
                </span>
              </div>
            </div>
          )}

          {stage === 'SUCCESS' && (
            <div className="py-4 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-scaleUp">
                <CheckCircle2 size={32} />
              </div>
              <h4 className="text-base sm:text-lg font-black text-neutral-900">
                Payment Confirmed & Secured!
              </h4>
              <p className="text-xs text-neutral-600 max-w-xs mx-auto">
                Transaction Ref: <strong className="font-mono text-neutral-900">{transaction?.transactionNumber || 'TZ-USSD-SUCCESS'}</strong>
              </p>
            </div>
          )}

          {stage === 'FAILED' && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <strong className="font-bold text-red-900 block">Payment Incomplete</strong>
                  <p className="text-red-700">{errorMessage || 'The payment request timed out or was rejected on the phone.'}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStage('INITIATING');
                    setErrorMessage('');
                  }}
                  className="flex-1 py-2.5 bg-neutral-900 text-white text-xs font-bold rounded-xl hover:bg-neutral-800 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw size={13} />
                  <span>Retry USSD Push</span>
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2.5 bg-neutral-100 text-neutral-700 text-xs font-bold rounded-xl hover:bg-neutral-200 transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

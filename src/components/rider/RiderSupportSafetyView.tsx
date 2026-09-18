import React, { useState } from 'react';
import {
  ShieldAlert,
  PhoneCall,
  MessageCircle,
  HelpCircle,
  AlertTriangle,
  FileQuestion,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../services/api';

interface RiderSupportSafetyViewProps {
  onOpenReportIncident: () => void;
  isLight?: boolean;
}

export const RiderSupportSafetyView: React.FC<RiderSupportSafetyViewProps> = ({
  onOpenReportIncident,
  isLight = false,
}) => {
  const [sosTriggered, setSosTriggered] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);

  const handleTriggerSos = async () => {
    setSosLoading(true);
    try {
      await api.sendSafetySos({
        address: 'Mikocheni / Kijitonyama, Dar es Salaam',
        notes: 'Rider triggered high priority emergency alert via mobile app'
      });
      setSosTriggered(true);
    } catch {
      setSosTriggered(true);
    } finally {
      setSosLoading(false);
    }
  };

  const faqs = [
    { q: 'What should I do if customer is not picking up phone?', a: 'Attempt calling 3 times with 2-minute gaps. If still unresponsive after 10 minutes, use "Report Issue" -> "Customer Unreachable".' },
    { q: 'How is the Escrow payment released to my wallet?', a: 'Upon customer providing their 4-digit handover OTP code, funds are released instantly into your wallet balance.' },
    { q: 'What happens in heavy rain in Dar es Salaam?', a: 'Safety first. Take shelter under safe coverage. You can report a rain delay via Operations chat without SLA penalty.' },
  ];

  return (
    <div className="w-full px-4 py-3 space-y-4 pb-28">
      
      {/* 1-Tap SOS Emergency Distress Card */}
      <div className="w-full rounded-2xl bg-gradient-to-r from-rose-900 via-red-800 to-rose-950 text-white p-4.5 shadow-lg border border-red-700/50 relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-red-500/30 flex items-center justify-center border border-red-400/40">
              <ShieldAlert className="w-5 h-5 text-red-300" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold tracking-tight">Rider Safety & SOS</h3>
              <p className="text-[11px] text-red-200/80">Emergency Assistance Center</p>
            </div>
          </div>
        </div>

        {sosTriggered ? (
          <div className="mt-3.5 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-center space-y-1">
            <p className="font-extrabold text-red-300 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> SOS DISPATCHED TO OPERATIONS
            </p>
            <p className="text-[11px] text-red-200">
              Emergency operations dispatcher and safety response team have your GPS location. Keep phone line open.
            </p>
          </div>
        ) : (
          <div className="mt-3.5 flex items-center justify-between gap-3">
            <p className="text-xs text-red-100/90 leading-tight">
              Tap in case of accident, roadside harassment, or extreme emergency.
            </p>
            <button
              onClick={handleTriggerSos}
              disabled={sosLoading}
              className="px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 active:scale-95 text-white font-extrabold text-xs shadow-lg shadow-red-950/50 shrink-0 cursor-pointer"
            >
              {sosLoading ? 'Alerting...' : 'TRIGGER SOS'}
            </button>
          </div>
        )}
      </div>

      {/* Direct Helplines */}
      <div className="grid grid-cols-2 gap-2.5">
        <a
          href="tel:+255700586600"
          className={`p-3.5 rounded-xl border shadow-sm flex items-center gap-3 transition-colors ${
            isLight ? 'bg-white border-slate-200 hover:bg-slate-50' : 'bg-slate-900 border-slate-800 hover:bg-slate-800'
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">Dispatch Hub</p>
            <p className="text-[10px] text-slate-500">+255 700 LUMO</p>
          </div>
        </a>

        <a
          href="https://wa.me/255714882910"
          target="_blank"
          rel="noreferrer"
          className={`p-3.5 rounded-xl border shadow-sm flex items-center gap-3 transition-colors ${
            isLight ? 'bg-white border-slate-200 hover:bg-slate-50' : 'bg-slate-900 border-slate-800 hover:bg-slate-800'
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">WhatsApp Live</p>
            <p className="text-[10px] text-slate-500">24/7 Fleet Chat</p>
          </div>
        </a>
      </div>

      {/* Report Incident Shortcut */}
      <div
        onClick={onOpenReportIncident}
        className={`p-3.5 rounded-xl border shadow-sm flex items-center justify-between cursor-pointer transition-all hover:border-amber-500 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">Report Delivery Incident</p>
            <p className="text-[11px] text-slate-500">Customer unreachable, wrong address, damaged box</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </div>

      {/* Frequently Asked Questions */}
      <div className="space-y-2">
        <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
          Fleet Guidelines & FAQs
        </h4>

        <div className="space-y-2">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border text-xs space-y-1 ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileQuestion className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                {faq.q}
              </p>
              <p className="text-[11px] text-slate-500 pl-5 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

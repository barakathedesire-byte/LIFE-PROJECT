import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  CheckCircle2,
  FileText,
  MapPin,
  Clock,
  Phone,
  Mail,
  ChevronRight,
  Upload,
  AlertCircle,
  LogOut,
  Power
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface RiderProfileKycViewProps {
  isLight?: boolean;
}

export const RiderProfileKycView: React.FC<RiderProfileKycViewProps> = ({
  isLight = false,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeZone, setActiveZone] = useState('Kinondoni & Ilala');
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out of your Lumo Rider session?')) {
      logout();
      navigate('/login', { replace: true });
    }
  };

  const kycDocs = [
    { id: 'nida', name: 'National ID / NIDA', number: '19920814-14102-00003-24', status: 'VERIFIED', expiry: 'Permanent' },
    { id: 'license', name: "Driver's License (Class A)", number: 'DL-TZ-8849201', status: 'VERIFIED', expiry: '12 Nov 2028' },
    { id: 'police', name: 'Police Clearance Certificate', number: 'PCC-DAR-2025-08', status: 'VERIFIED', expiry: '15 Jan 2027' },
    { id: 'insurance', name: 'Commercial Vehicle Insurance', number: 'INS-TZ-BAJAJ-492', status: 'VERIFIED', expiry: '30 Apr 2027' },
  ];

  return (
    <div className="w-full px-4 py-3 space-y-4 pb-28">
      
      {/* Profile Header Card */}
      <div className={`p-4 rounded-2xl border shadow-sm flex items-center gap-3.5 ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="relative">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-500 shadow-md bg-emerald-950">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              alt="Alex Mwita"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-3 h-3 text-white" />
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{user?.name || 'Alex Mwita'}</h3>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">
              VERIFIED
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono">Fleet ID: #RD-8942</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
            Diamond Star Fleet • Member since Mar 2025
          </p>
        </div>
      </div>

      {/* Account Details & Contact */}
      <div className={`p-4 rounded-2xl border shadow-sm space-y-2.5 ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <span className="text-xs font-bold text-slate-500">Contact & Shift Details</span>
        <div className="space-y-2 pt-1 text-xs">
          <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> Phone</span>
            <span className="font-bold text-slate-900 dark:text-white font-mono">{user?.phone || '+255 712 345 678'}</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> Email</span>
            <span className="font-bold text-slate-900 dark:text-white">{user?.email || 'alex.mwita@lumoriders.co.tz'}</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-slate-500 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> Current Shift</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">Day Shift (08:00 - 18:00)</span>
          </div>
        </div>
      </div>

      {/* Vehicle Specification Box */}
      <div className={`p-4 rounded-2xl border shadow-sm space-y-2.5 ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">Registered Fleet Vehicle</span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">
            ROADWORTHY
          </span>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xl shrink-0">
            🛵
          </div>
          <div>
            <p className="text-xs font-extrabold text-slate-900 dark:text-white">
              Bajaj Boxer 150cc (Motorcycle)
            </p>
            <p className="text-[11px] font-mono text-slate-500">
              Plate: <span className="font-bold text-slate-700 dark:text-slate-300">T 492 EDK</span> • Red
            </p>
          </div>
        </div>
      </div>

      {/* KYC & Identity Documents Inspection */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            KYC Compliance & Verification
          </h4>
          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Compliant
          </span>
        </div>

        <div className="space-y-2">
          {kycDocs.map(doc => (
            <div
              key={doc.id}
              onClick={() => setSelectedDoc(doc.id)}
              className={`p-3 rounded-xl border shadow-sm flex items-center justify-between cursor-pointer transition-all hover:border-emerald-500 ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{doc.name}</p>
                  <p className="text-[10px] font-mono text-slate-500">{doc.number} • Exp: {doc.expiry}</p>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500/10 text-emerald-600">
                {doc.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Operating Zone Preferences */}
      <div className={`p-4 rounded-2xl border shadow-sm space-y-2.5 ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-500" /> Preferred Operating Zone
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {['Kinondoni & Ilala', 'Masaki & Oysterbay', 'Kariakoo Commercial', 'Ubungo & Sinza'].map(zone => (
            <button
              key={zone}
              onClick={() => setActiveZone(zone)}
              className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold transition-all text-left truncate cursor-pointer ${
                activeZone === zone
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : isLight
                  ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {zone}
            </button>
          ))}
        </div>
      </div>

      {/* Explicit Logout Button */}
      <div className="pt-2">
        <button
          onClick={handleLogout}
          className="w-full py-3.5 px-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer active:scale-98 shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          Log Out of Rider Portal
        </button>
      </div>

    </div>
  );
};


import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Radio,
  Server,
  AlertTriangle,
  RefreshCw,
  Ban,
  CheckCircle2,
  Terminal,
  Activity,
  UserX,
  KeyRound
} from 'lucide-react';

export const CyberSecurityView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [securityData, setSecurityData] = useState<any>(null);
  const [unbanning, setUnbanning] = useState<string | null>(null);

  const fetchSecurityOverview = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/security/overview');
      if (!response.ok) throw new Error('Failed to fetch security data');
      const res = await response.json();
      setSecurityData(res);
    } catch (err) {
      console.error('Error fetching security overview:', err);
      // Fallback data if offline
      setSecurityData({
        status: 'UNREACHABLE',
        wafShieldEnabled: false,
        ddosProtectionEnabled: false,
        owaspHeadersActive: false,
        totalIncidentsDetected: 0,
        criticalThreats: 0,
        highThreats: 0,
        bannedIPsCount: 0,
        bannedIPs: [],
        recentLogs: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityOverview();
  }, []);

  const handleUnbanIP = async (ip: string) => {
    setUnbanning(ip);
    try {
      await fetch('/api/admin/security/unban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip })
      });
      await fetchSecurityOverview();
    } catch (err) {
      console.error('Failed to unban IP:', err);
    } finally {
      setUnbanning(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl">
              <ShieldCheck size={20} />
            </span>
            <h2 className="text-xl font-black tracking-tight">
              LUMO CyberSecurity & WAF Defense Engine
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Real-time OWASP threat inspection, SQLi/XSS attack filtering, DDoS rate limiting, and bot shield.
          </p>
        </div>

        <button
          onClick={fetchSecurityOverview}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl border border-slate-700 transition"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Shield Status</span>
        </button>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">WAF Status</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <ShieldCheck size={18} />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black ${securityData?.status === 'ACTIVE' ? 'text-emerald-600' : 'text-rose-600'}`}>
              {securityData?.status || 'UNKNOWN'}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${securityData?.status === 'ACTIVE' ? 'text-emerald-700 bg-emerald-100' : 'text-rose-700 bg-rose-100'}`}>
              {securityData?.status === 'ACTIVE' ? '100% Guarded' : 'Protection Offline'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">OWASP headers & signature filter active</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Rate Limiter & Anti-DDoS</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Activity size={18} />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">Enforced</span>
          </div>
          <p className="text-[11px] text-slate-500">200 req/min API guard, 20 req/min Auth guard</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Critical Threat Blocks</span>
            <span className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <ShieldAlert size={18} />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600">
              {securityData?.criticalThreats ?? 0}
            </span>
            <span className="text-[10px] font-bold text-slate-400">Total detected</span>
          </div>
          <p className="text-[11px] text-slate-500">SQLi, XSS, and RCE signature stops</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Active Banned IPs</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Ban size={18} />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">
              {securityData?.bannedIPsCount ?? 0}
            </span>
            <span className="text-[10px] font-bold text-slate-400">Auto-Banned</span>
          </div>
          <p className="text-[11px] text-slate-500">Banned after repeated attack violations</p>
        </div>
      </div>

      {/* SECURITY SHIELD MATRIX & POLICIES */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <Lock size={16} className="text-[#FF6A00]" />
          <span>Active Cybersecurity Protections & OWASP Safeguards</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-slate-900">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>SQLi & XSS Payload Sanitizer</span>
            </div>
            <p className="text-xs text-slate-600">
              Inspects incoming query strings, headers, and JSON request bodies to block malicious script injections.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-slate-900">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>Brute-Force & OTP Shield</span>
            </div>
            <p className="text-xs text-slate-600">
              Restricts endpoint hammering on `/api/auth/login`, `/api/otp/send`, and `/api/payments/checkout`.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-slate-900">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>Vulnerability Scanner Blocker</span>
            </div>
            <p className="text-xs text-slate-600">
              Blocks automated vulnerability probes (sqlmap, nmap, nikto, dirbuster) via User-Agent inspection.
            </p>
          </div>
        </div>
      </div>

      {/* BANNED IPS SECTION */}
      {securityData?.bannedIPs && securityData.bannedIPs.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-rose-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-rose-600 font-extrabold text-sm">
            <Ban size={18} />
            <span>Currently Banned IP Addresses</span>
          </div>

          <div className="divide-y divide-slate-100">
            {securityData.bannedIPs.map((ip: string) => (
              <div key={ip} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-xs font-mono font-bold text-slate-900">{ip}</span>
                  <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">
                    Auto-Banned
                  </span>
                </div>

                <button
                  onClick={() => handleUnbanIP(ip)}
                  disabled={unbanning === ip}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition"
                >
                  {unbanning === ip ? 'Unbanning...' : 'Unban IP'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECENT SECURITY LOGS LEDGER */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Terminal size={16} className="text-slate-600" />
            <span>Real-time WAF Security Incident Logs</span>
          </h3>
          <span className="text-xs text-slate-500">
            Showing last {securityData?.recentLogs?.length || 0} incidents
          </span>
        </div>

        {securityData?.recentLogs && securityData.recentLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">IP Address</th>
                  <th className="p-3">Threat Type</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {securityData.recentLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-3 text-slate-500 text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="p-3 font-bold text-slate-800">{log.ip}</td>
                    <td className="p-3">
                      <span className="font-bold text-slate-900">{log.threatType}</span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.severity === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-700'
                            : log.severity === 'HIGH'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {log.severity}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white">
                        {log.actionTaken}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 max-w-xs truncate">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
            <ShieldCheck size={32} className="mx-auto text-emerald-500" />
            <p className="text-xs font-bold text-slate-800">Zero Security Incidents Detected</p>
            <p className="text-[11px] text-slate-500">
              LUMO Cybersecurity Shield is actively protecting all endpoints against attacks.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

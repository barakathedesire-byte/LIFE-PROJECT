import React, { useState } from 'react';
import { useBuilderConfig } from '../../../hooks/useBuilderConfig';

import { Terminal, Search, Download, ShieldCheck, Filter } from 'lucide-react';

const initialLogs = [
  { id: 'log-1', admin: 'superadmin@lumo.com', action: 'UPDATE_FEATURE_FLAG', details: 'Enabled Express Delivery feature flag', timestamp: '2026-08-27 09:14:22', ip: '192.168.1.45' },
  { id: 'log-2', admin: 'superadmin@lumo.com', action: 'ADD_CUSTOM_FIELD', details: 'Added Business Registration No to Vendor entity', timestamp: '2026-08-27 08:30:11', ip: '192.168.1.45' },
  { id: 'log-3', admin: 'ops.lead@lumo.com', action: 'UPDATE_COMMISSION_RULE', details: 'Modified electronics tier commission from 8% to 7.5%', timestamp: '2026-08-26 16:45:00', ip: '10.0.4.12' },
  { id: 'log-4', admin: 'superadmin@lumo.com', action: 'PUBLISH_CONFIG_VERSION', details: 'Published Platform Release v2.4.1', timestamp: '2026-08-26 11:20:00' }
];

export const AuditLogsView = () => {
  const { data: logs, updateConfig: setLogs, isSaving } = useBuilderConfig('auditLogs', initialLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.admin.toLowerCase().includes(searchTerm.toLowerCase()) || log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterAction === 'ALL' || log.action === filterAction;
    return matchesSearch && matchesFilter;
  });

  const exportLogs = () => {
    alert(`Exporting ${filteredLogs.length} audit trail records as CSV report...`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Immutable Audit Logs</h2>
          <p className="text-sm text-slate-500">Track all administrative changes, security events, and configuration publishes.</p>
        </div>
        <button
          onClick={exportLogs}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer shadow-sm"
        >
          <Download className="w-4 h-4 text-orange-400" /> Export Audit Trail (CSV)
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by admin email or event details..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-blue-600 bg-white"
          />
        </div>
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white w-full sm:w-auto"
        >
          <option value="ALL">All Actions</option>
          <option value="UPDATE_FEATURE_FLAG">UPDATE_FEATURE_FLAG</option>
          <option value="ADD_CUSTOM_FIELD">ADD_CUSTOM_FIELD</option>
          <option value="UPDATE_COMMISSION_RULE">UPDATE_COMMISSION_RULE</option>
          <option value="PUBLISH_CONFIG_VERSION">PUBLISH_CONFIG_VERSION</option>
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold">
            <tr>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Administrator</th>
              <th className="py-3 px-4">Action Type</th>
              <th className="py-3 px-4">Details</th>
              <th className="py-3 px-4">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.map(log => (
              <tr key={log.id} className="hover:bg-slate-50 transition">
                <td className="py-3 px-4 font-mono text-slate-500">{log.timestamp}</td>
                <td className="py-3 px-4 font-bold text-slate-900">{log.admin}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] font-bold">
                    {log.action}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-700 font-medium">{log.details}</td>
                <td className="py-3 px-4 font-mono text-slate-400">{log.ip}</td>
              </tr>
            ))}
            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">
                  <Terminal className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  No audit logs matching your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

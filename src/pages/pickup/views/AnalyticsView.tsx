import React, { useState } from 'react';
import { PickupOrder, PickupReturn } from '../types';
import { Activity, TrendingUp, PackageCheck, Clock, Download, FileText, CheckCircle } from 'lucide-react';

interface Props {
  orders: PickupOrder[];
  returns: PickupReturn[];
}

export const AnalyticsView: React.FC<Props> = ({ orders, returns }) => {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownloadReport = (reportTitle: string) => {
    setDownloading(reportTitle);

    setTimeout(() => {
      const reportHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>LUMO Pickup Station Operational Report - ${reportTitle}</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #0f172a; line-height: 1.5; }
              .header { border-bottom: 2px solid #0d9488; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
              h1 { color: #0d9488; margin: 0; font-size: 24px; }
              .subtitle { color: #64748b; font-size: 13px; margin-top: 4px; }
              .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
              .stat-card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 12px; }
              .stat-val { font-size: 26px; font-weight: bold; color: #0f172a; }
              .stat-lbl { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #64748b; margin-top: 4px; }
              table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
              th, td { border: 1px solid #e2e8f0; padding: 10px 12px; text-align: left; }
              th { background: #f1f5f9; font-weight: bold; color: #334155; }
              tr:nth-child(even) { background: #f8fafc; }
              .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: bold; }
              .badge-paid { background: #d1fae5; color: #065f46; }
              .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <h1>LUMO Station Performance Report</h1>
                <p class="subtitle">Station: Dar es Salaam Central (STA-DAR-001) • ${reportTitle}</p>
              </div>
              <div style="text-align: right; font-size: 12px; color: #64748b;">
                <strong>Generated:</strong> ${new Date().toLocaleString()}
              </div>
            </div>

            <div class="stat-grid">
              <div class="stat-card"><div class="stat-val">94%</div><div class="stat-lbl">Collection Rate</div></div>
              <div class="stat-card"><div class="stat-val">2m 14s</div><div class="stat-lbl">Avg Handover Time</div></div>
              <div class="stat-card"><div class="stat-val">142</div><div class="stat-lbl">Orders Processed</div></div>
              <div class="stat-card"><div class="stat-val">1.2%</div><div class="stat-lbl">Return Rate</div></div>
            </div>

            <h2 style="font-size: 16px; color: #334155;">Active Station Inventory & Handover Status</h2>
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Name</th>
                  <th>Phone Number</th>
                  <th>Shelf Location</th>
                  <th>Payment Status</th>
                  <th>Amount Due</th>
                </tr>
              </thead>
              <tbody>
                ${orders.map(o => `
                  <tr>
                    <td><strong>${o.orderId}</strong></td>
                    <td>${o.customerName}</td>
                    <td>${o.customerPhone}</td>
                    <td>${o.shelfLocation}</td>
                    <td><span class="badge badge-paid">${o.paymentStatus}</span></td>
                    <td>TSh ${(o.amountDue || 0).toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="footer">
              LUMO E-Commerce Operations & Logistics Platform • Official Station Audit Document
            </div>
          </body>
        </html>
      `;

      const blob = new Blob([reportHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      } else {
        const a = document.createElement('a');
        a.href = url;
        a.download = `LUMO_Station_Report_${reportTitle.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
        a.click();
      }

      setDownloading(null);
    }, 600);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3 text-slate-800 mb-6">
        <Activity className="w-8 h-8 text-teal-600" />
        <div>
          <h2 className="text-2xl font-bold">Station Analytics</h2>
          <p className="text-sm text-slate-500">Performance and operational metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Collection Rate', value: '94%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Avg Handover Time', value: '2m 14s', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Orders Processed (Today)', value: `${orders.length * 15 + 142}`, icon: PackageCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Return Rate', value: '1.2%', icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-start mb-4">
               <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                 <stat.icon className="w-6 h-6" />
               </div>
            </div>
            <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
            <p className="text-xs font-bold text-slate-500 uppercase mt-1 tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
           <h3 className="font-bold text-slate-800 mb-6">Storage Utilization (Last 7 Days)</h3>
           <div className="h-48 flex items-end justify-between gap-2">
             {[40, 45, 60, 55, 75, 80, 74].map((val, i) => (
               <div key={i} className="w-full bg-slate-100 rounded-t-sm relative group">
                 <div className="absolute bottom-0 w-full bg-teal-500 rounded-t-sm transition-all" style={{ height: `${val}%` }}></div>
                 <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">{val}%</div>
               </div>
             ))}
           </div>
           <div className="flex justify-between mt-2 text-xs text-slate-400 font-bold uppercase">
             <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Today</span>
           </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
           <h3 className="font-bold text-slate-800 mb-2">Daily Station Operational Reports</h3>
           <p className="text-sm text-slate-600 mb-6">Generate and export end-of-day operational summaries for accounting and regional logistics managers.</p>
           
           <div className="space-y-3">
             <button 
               onClick={() => handleDownloadReport("Today's EOD Report")}
               disabled={downloading === "Today's EOD Report"}
               className="w-full bg-slate-50 hover:bg-teal-50/50 border border-slate-200 hover:border-teal-500 text-slate-800 font-bold py-3.5 px-4 rounded-xl transition flex justify-between items-center cursor-pointer"
             >
               <span className="flex items-center gap-2">
                 <FileText className="w-4 h-4 text-teal-600" />
                 <span>Today's EOD Operational Report</span>
               </span>
               <span className="text-teal-600 text-xs font-bold flex items-center gap-1">
                 {downloading === "Today's EOD Report" ? (
                   <span>Generating...</span>
                 ) : (
                   <>
                     <Download className="w-4 h-4" />
                     <span>Export PDF</span>
                   </>
                 )}
               </span>
             </button>

             <button 
               onClick={() => handleDownloadReport("Yesterday EOD Report (Aug 25, 2026)")}
               disabled={downloading === "Yesterday EOD Report (Aug 25, 2026)"}
               className="w-full bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-800 font-bold py-3.5 px-4 rounded-xl transition flex justify-between items-center cursor-pointer"
             >
               <span className="flex items-center gap-2">
                 <FileText className="w-4 h-4 text-blue-600" />
                 <span>Yesterday (Aug 25, 2026)</span>
               </span>
               <span className="text-blue-600 text-xs font-bold flex items-center gap-1">
                 {downloading === "Yesterday EOD Report (Aug 25, 2026)" ? (
                   <span>Generating...</span>
                 ) : (
                   <>
                     <Download className="w-4 h-4" />
                     <span>Download PDF</span>
                   </>
                 )}
               </span>
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

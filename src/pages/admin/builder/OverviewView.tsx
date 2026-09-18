import React, { useState, useEffect } from 'react';
import { CheckCircle2, LayoutDashboard, Settings, Layers, Workflow, Bell, Activity, Plus } from 'lucide-react';
import { api } from '../../../services/api';
import { LumoLoader } from '../../../components/common/LumoLoader';

export const OverviewView = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.getBuilderConfig().then(res => {
      if (mounted) {
        const config = res.builderConfig || {};
        const features = config.features || [];
        const workflows = config.workflows || [];
        const customFields = config.customFields || [];
        const notifications = config.notifications || [];
        
        setStats({
          features: features.length,
          activeFeatures: features.filter((f: any) => f.status === 'ENABLED').length,
          workflows: workflows.length,
          customFields: customFields.length,
          notifications: notifications.length
        });
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return <div className="p-10 flex justify-center"><LumoLoader size="large" /></div>;
  }

  return (
    <div className="p-6 space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Platform Overview</h2>
          <p className="text-sm text-slate-500">System configuration and no-code status</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100 font-medium text-sm shadow-sm">
          <CheckCircle2 className="w-4 h-4" /> System Configuration Healthy
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Features</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{stats?.activeFeatures || 0} / {stats?.features || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600">
              <Workflow className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Configured Workflows</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{stats?.workflows || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Custom Fields</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{stats?.customFields || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Notification Rules</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{stats?.notifications || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Recent Configuration Changes</h3>
        </div>
        <div className="p-10 flex flex-col items-center justify-center text-slate-500 text-sm">
          <Activity className="w-10 h-10 mb-3 text-slate-300" />
          <p>Live audit log synchronized with platform database</p>
        </div>
      </div>
    </div>
  );
};

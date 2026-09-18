import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  Layers, 
  Box, 
  Map, 
  Users, 
  TextCursorInput, 
  FileText, 
  GitBranch, 
  Activity, 
  Bell, 
  Percent, 
  Truck, 
  LayoutDashboard, 
  Zap, 
  FileEdit, 
  FolderTree, 
  Plug, 
  History, 
  Shield,
  ShieldCheck, 
  UploadCloud, 
  Terminal,
  Cpu,
  Eye,
  X,
  Smartphone,
  Tablet,
  Monitor,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

import { OverviewView } from './OverviewView';
import { FeaturesView } from './FeaturesView';
import { ModulesView } from './ModulesView';
import { NavigationBuilderView } from './NavigationBuilderView';
import { RolesPermissionsView } from './RolesPermissionsView';
import { CustomFieldsView } from './CustomFieldsView';
import { FormBuilderView } from './FormBuilderView';
import { WorkflowsView } from './WorkflowsView';
import { StatusManagerView } from './StatusManagerView';
import { NotificationsView } from './NotificationsView';
import { CommissionRulesView } from './CommissionRulesView';
import { DeliveryRulesView } from './DeliveryRulesView';
import { DashboardBuilderView } from './DashboardBuilderView';
import { BusinessRulesView } from './BusinessRulesView';
import { ContentManagerView } from './ContentManagerView';
import { CategoriesView } from './CategoriesView';
import { IntegrationsView } from './IntegrationsView';
import { ConfigurationVersionsView } from './ConfigurationVersionsView';
import { AuditLogsView } from './AuditLogsView';
import { AutomationEngineView } from './AutomationEngineView';
import { CyberSecurityView } from './CyberSecurityView';

export const PlatformBuilderView = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Settings },
    { id: 'cybersecurity', label: 'Cybersecurity Shield', icon: ShieldCheck },
    { id: 'features', label: 'Features', icon: Zap },
    { id: 'modules', label: 'Modules', icon: Box },
    { id: 'navigation', label: 'Navigation', icon: Map },
    { id: 'roles', label: 'Roles & Permissions', icon: Users },
    { id: 'fields', label: 'Custom Fields', icon: TextCursorInput },
    { id: 'forms', label: 'Form Builder', icon: FileText },
    { id: 'workflows', label: 'Workflows', icon: GitBranch },
    { id: 'automation', label: 'Automation Engine', icon: Cpu },
    { id: 'statuses', label: 'Status Manager', icon: Activity },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'commission', label: 'Commission Rules', icon: Percent },
    { id: 'delivery', label: 'Delivery Rules', icon: Truck },
    { id: 'dashboards', label: 'Dashboard Builder', icon: LayoutDashboard },
    { id: 'business_rules', label: 'Business Rules', icon: Shield },
    { id: 'content', label: 'Content Manager', icon: FileEdit },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'integrations', label: 'Integrations', icon: Plug },
    { id: 'versions', label: 'Config Versions', icon: History },
    { id: 'audit', label: 'Audit Logs', icon: Terminal }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewView />;
      case 'cybersecurity': return <CyberSecurityView />;
      case 'features': return <FeaturesView />;
      case 'modules': return <ModulesView />;
      case 'navigation': return <NavigationBuilderView />;
      case 'roles': return <RolesPermissionsView />;
      case 'fields': return <CustomFieldsView />;
      case 'forms': return <FormBuilderView />;
      case 'workflows': return <WorkflowsView />;
      case 'automation': return <AutomationEngineView />;
      case 'statuses': return <StatusManagerView />;
      case 'notifications': return <NotificationsView />;
      case 'commission': return <CommissionRulesView />;
      case 'delivery': return <DeliveryRulesView />;
      case 'dashboards': return <DashboardBuilderView />;
      case 'business_rules': return <BusinessRulesView />;
      case 'content': return <ContentManagerView />;
      case 'categories': return <CategoriesView />;
      case 'integrations': return <IntegrationsView />;
      case 'versions': return <ConfigurationVersionsView />;
      case 'audit': return <AuditLogsView />;
      default: return <OverviewView />;
    }
  };

  return (
    <div className="flex h-full bg-slate-50 relative">
      {/* Platform Builder Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 overflow-y-auto flex-shrink-0">
        <div className="p-4 border-b border-slate-200 sticky top-0 bg-white z-10 space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Platform Builder</h2>
              <p className="text-xs text-slate-500">No-Code Configuration</p>
            </div>
            <button
              onClick={() => setShowPreviewModal(true)}
              className="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#FF6A00] font-bold rounded-lg text-xs flex items-center gap-1 transition cursor-pointer border border-orange-200"
              title="Preview current platform configuration"
            >
              <Eye size={13} /> Preview
            </button>
          </div>

          <button
            onClick={() => navigate('/studio')}
            className="w-full py-2 bg-gradient-to-r from-orange-500 to-[#FF6A00] hover:from-orange-600 hover:to-orange-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 transition cursor-pointer"
          >
            <Sparkles size={14} />
            <span>Open LUMO Visual Studio</span>
          </button>
        </div>
        <div className="p-2 space-y-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>

      {/* LIVE PREVIEW MODAL (Spec Item 5) */}
      {showPreviewModal && (
        <div 
          onClick={() => setShowPreviewModal(false)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 cursor-default"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <h3 className="font-extrabold text-base">LUMO Runtime Preview ({activeTab.toUpperCase()})</h3>
                  <p className="text-xs text-slate-400">Live simulation of current configuration state</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition cursor-pointer ${
                      previewDevice === 'mobile' ? 'bg-[#FF6A00] text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone size={13} /> Mobile
                  </button>
                  <button
                    onClick={() => setPreviewDevice('tablet')}
                    className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition cursor-pointer ${
                      previewDevice === 'tablet' ? 'bg-[#FF6A00] text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Tablet size={13} /> Tablet
                  </button>
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition cursor-pointer ${
                      previewDevice === 'desktop' ? 'bg-[#FF6A00] text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Monitor size={13} /> Desktop
                  </button>
                </div>

                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body / Viewport Frame */}
            <div className="flex-1 bg-slate-100 p-6 flex items-center justify-center overflow-auto">
              <div className={`bg-white rounded-xl shadow-lg border border-slate-300 transition-all duration-300 overflow-hidden flex flex-col ${
                previewDevice === 'mobile' ? 'w-[380px] h-[650px] rounded-[36px] border-4 border-slate-800 shadow-2xl' :
                previewDevice === 'tablet' ? 'w-[768px] h-[600px]' : 'w-full h-full max-w-4xl'
              }`}>
                {/* Simulated App Header */}
                <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between text-xs">
                  <div className="font-bold flex items-center gap-2">
                    <span className="text-orange-500 font-black">LUMO</span>
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">Live Preview</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    <span>Config Synced</span>
                  </div>
                </div>

                {/* Simulated Content Area */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                  <div className="p-4 bg-orange-50 rounded-xl border border-orange-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded uppercase">Active Preview Mode</span>
                      <h4 className="font-extrabold text-neutral-900 text-sm mt-1">Rendering active {activeTab} module</h4>
                      <p className="text-xs text-slate-600">All rules, widgets, and integrations configured in Platform Builder are active in this runtime frame.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">System Status</span>
                      <h5 className="font-bold text-slate-900 text-sm">Runtime Operational</h5>
                      <p className="text-xs text-slate-500">Database connected and automation workers active.</p>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Config Version</span>
                      <h5 className="font-bold text-slate-900 text-sm">v2.4.0-prod</h5>
                      <p className="text-xs text-slate-500">Latest changes successfully applied to runtime.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

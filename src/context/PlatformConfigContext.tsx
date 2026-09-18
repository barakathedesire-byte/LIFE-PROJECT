import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface PlatformConfigContextType {
  builderConfig: any;
  activeVersion: string;
  isLoading: boolean;
  refreshConfig: () => Promise<void>;
  updateConfigSection: (key: string, value: any, auditMessage?: string) => Promise<void>;
  getNavigationForRole: (role: string) => any[];
  getCustomFieldsForEntity: (entity: string) => any[];
  getForm: (formId: string) => any;
  isFeatureEnabled: (featureKey: string) => boolean;
  getCategories: () => any[];
  getContentByPlacement: (placement: string, audience?: string) => any[];
  getCommissionRuleForCategory: (category: string) => any;
  getDeliveryRuleForRegion: (region: string) => any;
  getStatusesForEntity: (entity: string) => any[];
  getDashboardWidgets: (role: string) => any[];
  getIntegrations: () => any[];
  publishConfig: (title?: string, notes?: string) => Promise<any>;
  rollbackConfig: (versionId: string) => Promise<any>;
  desktopSidebarOpen: boolean;
  toggleDesktopSidebar: () => void;
  setDesktopSidebarOpen: (open: boolean) => void;
}

const defaultRoleNavs: Record<string, any[]> = {
  Vendor: [
    { id: 'nav-v1', label: 'Vendor Overview', path: '/seller', icon: 'LayoutDashboard' },
    { id: 'nav-v2', label: 'Product Catalog', path: '/seller?tab=products', icon: 'Box' },
    { id: 'nav-v3', label: 'Customer Orders', path: '/seller?tab=orders', icon: 'ShoppingBag' },
    { id: 'nav-v4', label: 'Financial Wallet & Payouts', path: '/seller?tab=wallet', icon: 'TrendingUp' },
    { id: 'nav-v5', label: 'Courier Pickup Requests', path: '/seller?tab=pickups', icon: 'Truck' }
  ],
  Warehouse: [
    { id: 'nav-w1', label: 'Inbound Stock Receiving', path: '/warehouse?tab=inbound', icon: 'Box' },
    { id: 'nav-w2', label: 'Bin & Shelf Inventory', path: '/warehouse?tab=inventory', icon: 'Layers' },
    { id: 'nav-w3', label: 'Packing & Barcode Audit', path: '/warehouse?tab=packing', icon: 'ScanLine' },
    { id: 'nav-w4', label: 'Outbound Dispatch Manifest', path: '/warehouse?tab=manifest', icon: 'Truck' }
  ],
  'Field Sales': [
    { id: 'nav-s1', label: 'Merchant Leads Pipeline', path: '/sales?tab=leads', icon: 'Users' },
    { id: 'nav-s2', label: 'Vendor Onboarding Portal', path: '/sales?tab=onboarding', icon: 'Store' },
    { id: 'nav-s3', label: 'Sales Commission Earnings', path: '/sales?tab=commission', icon: 'Percent' }
  ],
  Admin: [
    { id: 'nav-a1', label: 'Executive Analytics', path: '/admin?tab=analytics', icon: 'LayoutDashboard' },
    { id: 'nav-a2', label: 'Staff & Role Manager', path: '/admin?tab=users', icon: 'Users' },
    { id: 'nav-a3', label: 'Vendor Verification (KYC)', path: '/admin?tab=vendors', icon: 'ShieldCheck' },
    { id: 'nav-a4', label: 'Escrow Payout Approvals', path: '/admin?tab=escrow', icon: 'DollarSign' }
  ],
  'Super Admin': [
    { id: 'nav-sa1', label: 'Platform Architecture Control', path: '/admin?tab=platform-builder', icon: 'Settings' },
    { id: 'nav-sa2', label: 'Feature Flags & Releases', path: '/admin?tab=features', icon: 'Zap' },
    { id: 'nav-sa3', label: 'Cloudflare D1 & Database Sync', path: '/admin?tab=database', icon: 'Database' },
    { id: 'nav-sa4', label: 'Audit Security Logs', path: '/admin?tab=audit', icon: 'Terminal' }
  ],
  Buyer: [
    { id: 'nav-b1', label: 'Marketplace Feed', path: '/', icon: 'Home' },
    { id: 'nav-b2', label: 'My Escrow Orders', path: '/account/orders', icon: 'ShoppingBag' },
    { id: 'nav-b3', label: 'Saved Wishlist', path: '/wishlist', icon: 'Heart' },
    { id: 'nav-b4', label: 'Help & Disputes', path: '/help', icon: 'Shield' }
  ]
};

const PlatformConfigContext = createContext<PlatformConfigContextType | undefined>(undefined);

export const PlatformConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [builderConfig, setBuilderConfig] = useState<any>({});
  const [activeVersion, setActiveVersion] = useState<string>('v1.0.0-live');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState<boolean>(false);

  const toggleDesktopSidebar = () => setDesktopSidebarOpen(prev => !prev);

  const refreshConfig = async () => {
    try {
      const res = await api.getBuilderConfig();
      if (res && res.builderConfig) {
        setBuilderConfig(res.builderConfig);
        if (res.builderConfig.activeVersion) {
          setActiveVersion(res.builderConfig.activeVersion);
        }
      }
    } catch (err) {
      console.error('Failed to load active builder configuration:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshConfig();
  }, []);

  const updateConfigSection = async (key: string, value: any, auditMessage?: string) => {
    const updated = { ...builderConfig, [key]: value };
    setBuilderConfig(updated);
    try {
      await api.updateBuilderConfig({ [key]: value });
      if (auditMessage) {
        await api.createAuditLog({
          action: 'UPDATE_CONFIG_SECTION',
          details: auditMessage || `Updated ${key} in Platform Builder`
        });
      }
    } catch (err) {
      console.error(`Failed to save builder config section ${key}:`, err);
    }
  };

  const getNavigationForRole = (role: string): any[] => {
    if (builderConfig.navigation && builderConfig.navigation[role]) {
      return builderConfig.navigation[role].filter((item: any) => item.active !== false && item.enabled !== false);
    }
    return defaultRoleNavs[role] || [];
  };

  const getCustomFieldsForEntity = (entity: string): any[] => {
    const allFields = builderConfig.customFields || [];
    if (Array.isArray(allFields)) {
      return allFields.filter((f: any) => f.entity === entity || f.targetEntity === entity || f.active !== false);
    }
    return [];
  };

  const getForm = (formId: string): any => {
    const forms = builderConfig.forms || [];
    if (Array.isArray(forms)) {
      return forms.find((f: any) => f.id === formId || f.slug === formId);
    }
    return null;
  };

  const isFeatureEnabled = (featureKey: string): boolean => {
    const features = builderConfig.features || [];
    if (Array.isArray(features)) {
      const feat = features.find((f: any) => f.key === featureKey || f.id === featureKey);
      if (feat) return Boolean(feat.enabled);
    }
    return true; // default enabled
  };

  const getCategories = (): any[] => {
    if (builderConfig.categories && Array.isArray(builderConfig.categories)) {
      return builderConfig.categories.filter((c: any) => c.active !== false);
    }
    return [];
  };

  const getContentByPlacement = (placement: string, audience?: string): any[] => {
    const items = builderConfig.content || [];
    if (Array.isArray(items)) {
      return items.filter((item: any) => {
        const matchPlacement = item.placement === placement || item.section === placement;
        const matchAudience = !audience || item.audience === audience || item.audience === 'All Users';
        return matchPlacement && matchAudience && item.status !== 'ARCHIVED' && item.active !== false;
      });
    }
    return [];
  };

  const getCommissionRuleForCategory = (category: string): any => {
    const rules = builderConfig.commissionRules || [];
    if (Array.isArray(rules)) {
      return rules.find((r: any) => r?.category?.toLowerCase() === category?.toLowerCase() && r.isActive !== false);
    }
    return null;
  };

  const getDeliveryRuleForRegion = (region: string): any => {
    const rules = builderConfig.deliveryRules || [];
    if (Array.isArray(rules)) {
      return rules.find((r: any) => r.region?.toLowerCase() === region?.toLowerCase() && r.enabled !== false);
    }
    return null;
  };

  const getStatusesForEntity = (entity: string): any[] => {
    const statuses = builderConfig.statuses || [];
    if (Array.isArray(statuses)) {
      return statuses.filter((s: any) => s.entity === entity || s.targetEntity === entity);
    }
    return [];
  };

  const getDashboardWidgets = (role: string): any[] => {
    const dashboards = builderConfig.dashboards || {};
    if (dashboards[role] && Array.isArray(dashboards[role])) {
      return dashboards[role].filter((w: any) => w.enabled !== false);
    }
    return [];
  };

  const getIntegrations = (): any[] => {
    const integrations = builderConfig.integrations || [];
    if (Array.isArray(integrations)) {
      return integrations;
    }
    return [];
  };

  const publishConfig = async (title?: string, notes?: string) => {
    try {
      const res = await fetch('/api/config/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, notes })
      });
      const data = await res.json();
      await refreshConfig();
      return data;
    } catch (err) {
      console.error('Failed to publish configuration version:', err);
      throw err;
    }
  };

  const rollbackConfig = async (versionId: string) => {
    try {
      const res = await fetch('/api/config/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId })
      });
      const data = await res.json();
      await refreshConfig();
      return data;
    } catch (err) {
      console.error('Failed to rollback configuration version:', err);
      throw err;
    }
  };

  return (
    <PlatformConfigContext.Provider
      value={{
        builderConfig,
        activeVersion,
        isLoading,
        refreshConfig,
        updateConfigSection,
        getNavigationForRole,
        getCustomFieldsForEntity,
        getForm,
        isFeatureEnabled,
        getCategories,
        getContentByPlacement,
        getCommissionRuleForCategory,
        getDeliveryRuleForRegion,
        getStatusesForEntity,
        getDashboardWidgets,
        getIntegrations,
        publishConfig,
        rollbackConfig,
        desktopSidebarOpen,
        toggleDesktopSidebar,
        setDesktopSidebarOpen
      }}
    >
      {children}
    </PlatformConfigContext.Provider>
  );
};

export const usePlatformConfig = () => {
  const context = useContext(PlatformConfigContext);
  if (!context) {
    throw new Error('usePlatformConfig must be used within a PlatformConfigProvider');
  }
  return context;
};

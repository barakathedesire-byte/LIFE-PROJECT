import React, { useState } from 'react';
import { 
  StudioComponentItem, 
  StudioPage, 
  ComponentCategory, 
  ActionType 
} from '../../../types/studio';
import { 
  Sliders, 
  Type, 
  Paintbrush, 
  Database, 
  Zap, 
  Smartphone, 
  Shield, 
  X, 
  Eye, 
  ExternalLink, 
  Check 
} from 'lucide-react';

interface StudioRightInspectorProps {
  selectedComponent: StudioComponentItem | null;
  onUpdateComponent: (updated: StudioComponentItem) => void;
  onDeselect: () => void;
  activePage: StudioPage;
  onUpdatePage: (updated: Partial<StudioPage>) => void;
}

type InspectorTab = 'content' | 'appearance' | 'data' | 'behavior' | 'responsive' | 'advanced';

export const StudioRightInspector: React.FC<StudioRightInspectorProps> = ({
  selectedComponent,
  onUpdateComponent,
  onDeselect,
  activePage,
  onUpdatePage
}) => {
  const [activeTab, setActiveTab] = useState<InspectorTab>('content');

  // If no component is selected, render Page Settings
  if (!selectedComponent) {
    return (
      <aside className="w-72 sm:w-80 bg-white border-l border-slate-200 h-full flex flex-col shrink-0 select-none shadow-xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900">Page Configuration</h3>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">{activePage.route}</p>
          </div>
          <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
            {activePage.mode}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Page Title</label>
            <input
              type="text"
              value={activePage.name}
              onChange={(e) => onUpdatePage({ name: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">URL Route Path</label>
            <input
              type="text"
              value={activePage.route}
              onChange={(e) => onUpdatePage({ route: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Platform Mode</label>
            <select
              value={activePage.mode}
              onChange={(e) => onUpdatePage({ mode: e.target.value as any })}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold bg-white"
            >
              <option value="CUSTOMER">CUSTOMER (Consumer Marketplace)</option>
              <option value="SELLER">SELLER (Vendor Portal)</option>
              <option value="RIDER">RIDER (Delivery Operations)</option>
              <option value="WAREHOUSE">WAREHOUSE (Fulfillment)</option>
              <option value="SUPPORT">SUPPORT (Dispute Desk)</option>
              <option value="FINANCE">FINANCE (Escrow & Accounting)</option>
              <option value="ADMIN">ADMIN (Platform Control)</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <label className="font-bold text-slate-700 block mb-1">SEO Title Tag</label>
            <input
              type="text"
              value={activePage.seoTitle || ''}
              placeholder="e.g. LUMO Tanzania"
              onChange={(e) => onUpdatePage({ seoTitle: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">SEO Meta Description</label>
            <textarea
              rows={3}
              value={activePage.seoDescription || ''}
              placeholder="Brief summary for search engines..."
              onChange={(e) => onUpdatePage({ seoDescription: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 block">Require Authentication</span>
              <p className="text-[10px] text-slate-500">Only logged in users can view</p>
            </div>
            <input
              type="checkbox"
              checked={activePage.requireAuth || false}
              onChange={(e) => onUpdatePage({ requireAuth: e.target.checked })}
              className="w-4 h-4 accent-[#FF6A00]"
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] text-slate-500 leading-relaxed">
            💡 Click on any component inside the canvas to inspect its properties, styles, and data bindings.
          </div>
        </div>
      </aside>
    );
  }

  // Component is selected: show tabs
  const handlePropChange = (key: string, value: any) => {
    onUpdateComponent({
      ...selectedComponent,
      props: {
        ...selectedComponent.props,
        [key]: value
      }
    });
  };

  const handleStyleChange = (key: string, value: any) => {
    onUpdateComponent({
      ...selectedComponent,
      styles: {
        ...selectedComponent.styles,
        [key]: value
      }
    });
  };

  const handleDataBindingChange = (key: string, value: any) => {
    onUpdateComponent({
      ...selectedComponent,
      dataBinding: {
        ...(selectedComponent.dataBinding || { source: 'products' }),
        [key]: value
      }
    });
  };

  const handleActionChange = (key: string, value: any) => {
    onUpdateComponent({
      ...selectedComponent,
      action: {
        ...(selectedComponent.action || { type: 'navigate' }),
        [key]: value
      }
    });
  };

  return (
    <aside className="w-72 sm:w-80 bg-white border-l border-slate-200 h-full flex flex-col shrink-0 select-none shadow-xs">
      {/* Header */}
      <div className="p-3 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
        <div className="min-w-0 flex-1 pr-2">
          <div className="flex items-center gap-1.5">
            <h3 className="font-extrabold text-xs text-slate-900 truncate">{selectedComponent.name}</h3>
            <span className="text-[9px] uppercase font-bold text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded">
              {selectedComponent.type}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono truncate">ID: {selectedComponent.id}</p>
        </div>
        <button
          onClick={onDeselect}
          className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded transition cursor-pointer"
          title="Deselect"
        >
          <X size={15} />
        </button>
      </div>

      {/* Tabs strip */}
      <div className="grid grid-cols-6 border-b border-slate-200 bg-slate-100/70 p-1 text-[10px] font-bold text-slate-600">
        <button
          onClick={() => setActiveTab('content')}
          className={`py-1 rounded text-center transition cursor-pointer ${
            activeTab === 'content' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
          }`}
          title="Content & Copy"
        >
          Content
        </button>
        <button
          onClick={() => setActiveTab('appearance')}
          className={`py-1 rounded text-center transition cursor-pointer ${
            activeTab === 'appearance' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
          }`}
          title="Styles & Colors"
        >
          Styles
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`py-1 rounded text-center transition cursor-pointer ${
            activeTab === 'data' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
          }`}
          title="Data Binding"
        >
          Data
        </button>
        <button
          onClick={() => setActiveTab('behavior')}
          className={`py-1 rounded text-center transition cursor-pointer ${
            activeTab === 'behavior' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
          }`}
          title="Actions & Click Events"
        >
          Action
        </button>
        <button
          onClick={() => setActiveTab('responsive')}
          className={`py-1 rounded text-center transition cursor-pointer ${
            activeTab === 'responsive' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
          }`}
          title="Device Visibility"
        >
          Device
        </button>
        <button
          onClick={() => setActiveTab('advanced')}
          className={`py-1 rounded text-center transition cursor-pointer ${
            activeTab === 'advanced' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
          }`}
          title="RBAC & Advanced"
        >
          RBAC
        </button>
      </div>

      {/* Tab Content Panels */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* 1. CONTENT TAB */}
        {activeTab === 'content' && (
          <div className="space-y-3">
            {Object.keys(selectedComponent.props).map((key) => {
              const val = selectedComponent.props[key];
              const isBool = typeof val === 'boolean';
              const isNum = typeof val === 'number';

              if (isBool) {
                return (
                  <div key={key} className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <input
                      type="checkbox"
                      checked={val}
                      onChange={(e) => handlePropChange(key, e.target.checked)}
                      className="w-4 h-4 accent-[#FF6A00]"
                    />
                  </div>
                );
              }

              return (
                <div key={key}>
                  <label className="font-bold text-slate-700 block mb-1 capitalize">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </label>
                  {typeof val === 'string' && val.length > 50 ? (
                    <textarea
                      rows={3}
                      value={val}
                      onChange={(e) => handlePropChange(key, e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                  ) : (
                    <input
                      type={isNum ? 'number' : 'text'}
                      value={val || ''}
                      onChange={(e) => handlePropChange(key, isNum ? Number(e.target.value) : e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 2. APPEARANCE TAB */}
        {activeTab === 'appearance' && (
          <div className="space-y-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Background Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedComponent.styles.backgroundColor || '#ffffff'}
                  onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0"
                />
                <input
                  type="text"
                  value={selectedComponent.styles.backgroundColor || '#ffffff'}
                  onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  className="flex-1 px-2.5 py-1 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Border Radius</label>
              <select
                value={selectedComponent.styles.borderRadius || 'xl'}
                onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
              >
                <option value="none">None (0px)</option>
                <option value="sm">Small (4px)</option>
                <option value="md">Medium (8px)</option>
                <option value="lg">Large (12px)</option>
                <option value="xl">Extra Large (16px)</option>
                <option value="2xl">2XL (24px)</option>
                <option value="full">Pill / Circle (Full)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Drop Shadow</label>
              <select
                value={selectedComponent.styles.shadow || 'none'}
                onChange={(e) => handleStyleChange('shadow', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
              >
                <option value="none">None</option>
                <option value="sm">Subtle Elevation (sm)</option>
                <option value="md">Medium Card (md)</option>
                <option value="lg">Floating Popover (lg)</option>
              </select>
            </div>
          </div>
        )}

        {/* 3. DATA TAB */}
        {activeTab === 'data' && (
          <div className="space-y-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Backend Data Source</label>
              <select
                value={selectedComponent.dataBinding?.source || 'products'}
                onChange={(e) => handleDataBindingChange('source', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white font-semibold"
              >
                <option value="products">Products Catalog (/api/products)</option>
                <option value="sellers">Verified Merchants (/api/sellers)</option>
                <option value="orders">Live Orders (/api/orders)</option>
                <option value="warehouses">Warehouse Stock (/api/warehouses)</option>
                <option value="categories">Marketplace Categories</option>
                <option value="static">Static Mock Only</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Category Filter</label>
              <input
                type="text"
                value={selectedComponent.dataBinding?.categoryFilter || ''}
                placeholder="e.g. Electronics or Phones"
                onChange={(e) => handleDataBindingChange('categoryFilter', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Max Items Limit</label>
              <input
                type="number"
                value={selectedComponent.dataBinding?.limit || 4}
                onChange={(e) => handleDataBindingChange('limit', Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Sort Order</label>
              <select
                value={selectedComponent.dataBinding?.sortBy || 'newest'}
                onChange={(e) => handleDataBindingChange('sortBy', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="sales">Best Sellers / Top Volume</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Customer Rating</option>
              </select>
            </div>
          </div>
        )}

        {/* 4. BEHAVIOR TAB */}
        {activeTab === 'behavior' && (
          <div className="space-y-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">On Click Action</label>
              <select
                value={selectedComponent.action?.type || 'navigate'}
                onChange={(e) => handleActionChange('type', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white font-semibold"
              >
                <option value="navigate">Navigate to Page / Route</option>
                <option value="add_to_cart">Add Item to Escrow Cart</option>
                <option value="open_modal">Open Modal Dialog</option>
                <option value="open_drawer">Open Side Drawer</option>
                <option value="trigger_automation">Trigger Lumo Flow Automation</option>
                <option value="toast">Show Notification Message</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Target Destination / Link</label>
              <input
                type="text"
                value={selectedComponent.action?.target || ''}
                placeholder="e.g. /products or /checkout"
                onChange={(e) => handleActionChange('target', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono"
              />
            </div>
          </div>
        )}

        {/* 5. RESPONSIVE TAB */}
        {activeTab === 'responsive' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-bold text-slate-700">Hide on Mobile (&lt;640px)</span>
              <input
                type="checkbox"
                checked={selectedComponent.styles.hideOnMobile || false}
                onChange={(e) => handleStyleChange('hideOnMobile', e.target.checked)}
                className="w-4 h-4 accent-[#FF6A00]"
              />
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-bold text-slate-700">Hide on Tablet (&lt;1024px)</span>
              <input
                type="checkbox"
                checked={selectedComponent.styles.hideOnTablet || false}
                onChange={(e) => handleStyleChange('hideOnTablet', e.target.checked)}
                className="w-4 h-4 accent-[#FF6A00]"
              />
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-bold text-slate-700">Hide on Desktop</span>
              <input
                type="checkbox"
                checked={selectedComponent.styles.hideOnDesktop || false}
                onChange={(e) => handleStyleChange('hideOnDesktop', e.target.checked)}
                className="w-4 h-4 accent-[#FF6A00]"
              />
            </div>
          </div>
        )}

        {/* 6. ADVANCED / RBAC TAB */}
        {activeTab === 'advanced' && (
          <div className="space-y-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Role-Based Visibility (RBAC)</label>
              <p className="text-[10px] text-slate-500 mb-2">Leave blank to make visible to all platform visitors.</p>
              
              <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                {['BUYER', 'SELLER', 'DELIVERY_AGENT', 'WAREHOUSE_MANAGER', 'CUSTOMER_SUPPORT', 'SUPER_ADMIN'].map(r => {
                  const hasRole = (selectedComponent.roleRestriction || []).includes(r);
                  return (
                    <label key={r} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasRole}
                        onChange={(e) => {
                          const current = selectedComponent.roleRestriction || [];
                          const updated = e.target.checked 
                            ? [...current, r] 
                            : current.filter(x => x !== r);
                          onUpdateComponent({
                            ...selectedComponent,
                            roleRestriction: updated
                          });
                        }}
                        className="w-3.5 h-3.5 accent-[#FF6A00]"
                      />
                      <span className="text-[11px] font-semibold text-slate-700">{r}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

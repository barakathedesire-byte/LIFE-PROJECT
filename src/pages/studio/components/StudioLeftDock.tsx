import React, { useState } from 'react';
import { 
  Layers, 
  Palette, 
  Database, 
  Zap, 
  Compass, 
  Sliders, 
  Plus, 
  FileText, 
  FolderTree, 
  Grid, 
  Image, 
  Sparkles, 
  Store, 
  Truck, 
  Box, 
  ShieldCheck, 
  DollarSign, 
  Headphones, 
  Search, 
  ChevronRight, 
  Check, 
  Globe, 
  Copy, 
  Trash2, 
  Eye, 
  Cpu, 
  Terminal, 
  History, 
  Clock, 
  Award,
  ChevronDown
} from 'lucide-react';
import { 
  StudioDockTab, 
  StudioBuildSubTab, 
  StudioPage, 
  DesignSystemTokens, 
  GlobalComponentDef, 
  ComponentCategory 
} from '../../../types/studio';
import { COMPONENT_PALETTE, ComponentPaletteItem } from '../data/defaultStudioData';

interface StudioLeftDockProps {
  activeTab: StudioDockTab;
  onTabChange: (tab: StudioDockTab) => void;
  pages: StudioPage[];
  activePage: StudioPage;
  onSelectPage: (pageId: string) => void;
  onAddPage: () => void;
  onDuplicatePage: (page: StudioPage) => void;
  onDeletePage: (pageId: string) => void;
  onAddComponent: (paletteItem: ComponentPaletteItem) => void;
  onOpenTemplates: () => void;
  designTokens: DesignSystemTokens;
  onUpdateDesignTokens: (tokens: Partial<DesignSystemTokens>) => void;
  globalComponents: GlobalComponentDef[];
  activeSimulatedRole: string;
  onSelectSimulatedRole: (role: string) => void;
  onOpenAdminConfigModal: (configTab: string) => void;
  onOpenVersionsModal: () => void;
}

export const StudioLeftDock: React.FC<StudioLeftDockProps> = ({
  activeTab,
  onTabChange,
  pages,
  activePage,
  onSelectPage,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
  onAddComponent,
  onOpenTemplates,
  designTokens,
  onUpdateDesignTokens,
  globalComponents,
  activeSimulatedRole,
  onSelectSimulatedRole,
  onOpenAdminConfigModal,
  onOpenVersionsModal
}) => {
  const [buildSubTab, setBuildSubTab] = useState<StudioBuildSubTab>('components');
  const [componentSearch, setComponentSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const filteredComponents = COMPONENT_PALETTE.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(componentSearch.toLowerCase()) || 
                          c.description.toLowerCase().includes(componentSearch.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const dockTabs = [
    { id: 'build', label: 'Build', icon: Layers },
    { id: 'design', label: 'Design', icon: Palette },
    { id: 'data', label: 'Data', icon: Database },
    { id: 'behavior', label: 'Behavior', icon: Zap },
    { id: 'platform', label: 'Platform', icon: Compass },
    { id: 'manage', label: 'Manage', icon: Sliders }
  ];

  return (
    <div className="flex h-full bg-white border-r border-slate-200 shrink-0 select-none z-20 shadow-xs">
      {/* 1. Primary Vertical Icon Strip */}
      <div className="w-14 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-3 space-y-3 shrink-0">
        {dockTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                onTabChange(tab.id as StudioDockTab);
                if (isCollapsed) setIsCollapsed(false);
              }}
              title={tab.label}
              className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center transition cursor-pointer relative group ${
                isActive
                  ? 'bg-[#FF6A00] text-white shadow-md shadow-orange-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon size={18} />
              <span className="text-[9px] font-bold tracking-tight mt-0.5">{tab.label}</span>
              {/* Tooltip on hover */}
              <span className="absolute left-14 bg-slate-950 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition z-50 whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Secondary Contextual Panel */}
      {!isCollapsed && (
        <div className="w-72 sm:w-80 bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden">
          {/* TAB 1: BUILD */}
          {activeTab === 'build' && (
            <div className="flex flex-col h-full">
              {/* Sub-nav pills */}
              <div className="p-3 border-b border-slate-200 bg-slate-50/80">
                <div className="grid grid-cols-4 gap-1 p-0.5 bg-slate-200/80 rounded-lg text-xs font-semibold">
                  <button
                    onClick={() => setBuildSubTab('components')}
                    className={`py-1 rounded text-center transition cursor-pointer text-[11px] ${
                      buildSubTab === 'components' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Elements
                  </button>
                  <button
                    onClick={() => setBuildSubTab('pages')}
                    className={`py-1 rounded text-center transition cursor-pointer text-[11px] ${
                      buildSubTab === 'pages' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Pages
                  </button>
                  <button
                    onClick={() => setBuildSubTab('global')}
                    className={`py-1 rounded text-center transition cursor-pointer text-[11px] ${
                      buildSubTab === 'global' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Global
                  </button>
                  <button
                    onClick={onOpenTemplates}
                    className="py-1 rounded text-center text-[11px] text-orange-600 font-bold hover:bg-orange-50 transition cursor-pointer"
                  >
                    Templates
                  </button>
                </div>
              </div>

              {/* Sub-tab: COMPONENTS */}
              {buildSubTab === 'components' && (
                <div className="flex-1 flex flex-col overflow-hidden p-3 space-y-3">
                  {/* Search and Category Filter */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search elements (e.g. Carousel, Grid)..."
                        value={componentSearch}
                        onChange={(e) => setComponentSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-100 rounded-lg text-xs border border-transparent focus:border-[#FF6A00] focus:bg-white focus:outline-none"
                      />
                    </div>
                    {/* Category Filter Badges */}
                    <div className="flex gap-1 overflow-x-auto pb-1 text-[10px] font-semibold text-slate-600 scrollbar-none">
                      {['all', 'commerce', 'marketing', 'navigation', 'operations', 'dashboard', 'forms'].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-2 py-0.5 rounded-full capitalize shrink-0 transition cursor-pointer ${
                            selectedCategory === cat ? 'bg-[#FF6A00] text-white' : 'bg-slate-100 hover:bg-slate-200'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Components List */}
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {filteredComponents.map(item => (
                      <div
                        key={item.type}
                        onClick={() => onAddComponent(item)}
                        className="p-3 bg-white hover:bg-orange-50/60 rounded-xl border border-slate-200 hover:border-orange-300 transition-all cursor-pointer group shadow-2xs hover:shadow-xs flex items-start gap-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-orange-100/70 text-[#FF6A00] flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                          <Plus size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-xs text-slate-900 group-hover:text-orange-600 transition truncate">
                              {item.name}
                            </h4>
                            <span className="text-[9px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                              {item.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-tab: PAGES */}
              {buildSubTab === 'pages' && (
                <div className="flex-1 flex flex-col overflow-hidden p-3 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Pages ({pages.length})</span>
                    <button
                      onClick={onAddPage}
                      className="px-2 py-1 bg-orange-50 hover:bg-orange-100 text-[#FF6A00] text-xs font-bold rounded-lg flex items-center gap-1 transition cursor-pointer border border-orange-200"
                    >
                      <Plus size={13} /> Add Page
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                    {pages.map(p => {
                      const isSelected = activePage.id === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => onSelectPage(p.id)}
                          className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-xs'
                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs truncate">{p.name}</span>
                              <span className="text-[9px] bg-slate-100 text-slate-600 px-1 rounded font-mono font-medium">{p.mode}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{p.route}</p>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDuplicatePage(p);
                              }}
                              title="Duplicate Page"
                              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded transition"
                            >
                              <Copy size={12} />
                            </button>
                            {!p.isSystem && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeletePage(p.id);
                                }}
                                title="Delete Page"
                                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sub-tab: GLOBAL COMPONENTS */}
              {buildSubTab === 'global' && (
                <div className="flex-1 flex flex-col overflow-hidden p-3 space-y-3">
                  <div className="pb-2 border-b border-slate-100">
                    <h4 className="text-xs font-bold text-slate-900">Master Global Components</h4>
                    <p className="text-[11px] text-slate-500">Updating a global component syncs changes across every view.</p>
                  </div>

                  <div className="space-y-2 overflow-y-auto flex-1">
                    {globalComponents.map(gc => (
                      <div
                        key={gc.id}
                        onClick={() => onAddComponent({
                          type: gc.component.type,
                          name: gc.name,
                          category: gc.category,
                          description: gc.description,
                          iconName: 'Sparkles',
                          defaultProps: gc.component.props,
                          defaultStyles: gc.component.styles
                        })}
                        className="p-3 rounded-xl border border-purple-200 bg-purple-50/40 hover:bg-purple-50 transition cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-purple-900">{gc.name}</span>
                          <span className="text-[10px] bg-purple-200/80 text-purple-800 font-bold px-1.5 py-0.5 rounded-full">
                            {gc.instanceCount} instances
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">{gc.description}</p>
                        <div className="mt-2 text-[10px] text-purple-700 font-semibold flex items-center gap-1">
                          <Plus size={12} /> Click to insert linked master instance
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DESIGN SYSTEM TOKENS */}
          {activeTab === 'design' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              <div className="pb-2 border-b border-slate-100">
                <h3 className="font-extrabold text-sm text-slate-900">Global Design Tokens</h3>
                <p className="text-[11px] text-slate-500">Live styling rules applied universally across the LUMO ecosystem.</p>
              </div>

              {/* Brand Colors */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Brand Color Palette</label>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1">Primary (LUMO Orange)</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={designTokens.brandPrimary}
                        onChange={(e) => onUpdateDesignTokens({ brandPrimary: e.target.value })}
                        className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0"
                      />
                      <span className="font-mono text-[11px] text-slate-700">{designTokens.brandPrimary}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1">Dark Accent (Slate)</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={designTokens.brandDark}
                        onChange={(e) => onUpdateDesignTokens({ brandDark: e.target.value })}
                        className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0"
                      />
                      <span className="font-mono text-[11px] text-slate-700">{designTokens.brandDark}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1">Secondary (Cobalt)</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={designTokens.brandSecondary}
                        onChange={(e) => onUpdateDesignTokens({ brandSecondary: e.target.value })}
                        className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0"
                      />
                      <span className="font-mono text-[11px] text-slate-700">{designTokens.brandSecondary}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1">Success (Emerald)</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={designTokens.accentSuccess}
                        onChange={(e) => onUpdateDesignTokens({ accentSuccess: e.target.value })}
                        className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0"
                      />
                      <span className="font-mono text-[11px] text-slate-700">{designTokens.accentSuccess}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Typography */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Typography & Scale</label>
                
                <div>
                  <span className="text-[11px] text-slate-500 block mb-1">Heading Font Family</span>
                  <select
                    value={designTokens.fontHeading}
                    onChange={(e) => onUpdateDesignTokens({ fontHeading: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                  >
                    <option value="Inter, system-ui, sans-serif">Inter (Modern Neutral)</option>
                    <option value="Plus Jakarta Sans, sans-serif">Plus Jakarta Sans (Refined Product)</option>
                    <option value="Cabinet Grotesk, sans-serif">Cabinet Grotesk (High-Contrast Bold)</option>
                  </select>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 block mb-1">Base Body Size ({designTokens.fontSizeBase}px)</span>
                  <input
                    type="range"
                    min="14"
                    max="18"
                    value={designTokens.fontSizeBase}
                    onChange={(e) => onUpdateDesignTokens({ fontSizeBase: Number(e.target.value) })}
                    className="w-full accent-[#FF6A00]"
                  />
                </div>
              </div>

              {/* Shapes & Radii */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Border Radius</label>
                <div className="grid grid-cols-4 gap-1.5 text-xs">
                  {['0px', '8px', '12px', '16px'].map(r => (
                    <button
                      key={r}
                      onClick={() => onUpdateDesignTokens({ radiusBase: r })}
                      className={`py-1.5 rounded-lg border text-center font-bold text-xs transition cursor-pointer ${
                        designTokens.radiusBase === r
                          ? 'bg-[#FF6A00] text-white border-[#FF6A00]'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DATA BINDING */}
          {activeTab === 'data' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              <div className="pb-2 border-b border-slate-100">
                <h3 className="font-extrabold text-sm text-slate-900">Backend Data Sources</h3>
                <p className="text-[11px] text-slate-500">Live API endpoints powering dynamic platform components.</p>
              </div>

              <div className="space-y-2">
                {[
                  { name: 'Products Catalog', endpoint: '/api/products', count: 'Live SQL Items', status: 'Connected' },
                  { name: 'Sellers & Brands', endpoint: '/api/sellers', count: 'Verified Merchants', status: 'Connected' },
                  { name: 'Customer Orders', endpoint: '/api/orders', count: 'Escrow Transactions', status: 'Connected' },
                  { name: 'Warehouse Inventories', endpoint: '/api/warehouses', count: 'Dar & Arusha Hubs', status: 'Connected' },
                  { name: 'Rider Delivery Runs', endpoint: '/api/delivery/runs', count: 'Lumo Move Network', status: 'Connected' },
                  { name: 'Take-rate Commission Rules', endpoint: '/api/admin/commission-rules', count: '8 Category Rules', status: 'Connected' }
                ].map(ds => (
                  <div key={ds.name} className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{ds.name}</span>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                        {ds.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">{ds.endpoint}</p>
                    <p className="text-[11px] text-slate-600">{ds.count}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: BEHAVIOR & AUTOMATION */}
          {activeTab === 'behavior' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              <div className="pb-2 border-b border-slate-100">
                <h3 className="font-extrabold text-sm text-slate-900">Actions & Automations</h3>
                <p className="text-[11px] text-slate-500">Configure what happens on clicks, form submissions and system triggers.</p>
              </div>

              <div className="space-y-2">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                  <span className="font-bold text-blue-900 block">Workflow: Order Lifecycle</span>
                  <p className="text-[11px] text-blue-700">Order Placed → Escrow Lock → SMS Alert to Merchant → Courier Dispatch → OTP Customer Confirmation.</p>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                  <span className="font-bold text-emerald-900 block">Workflow: Flash Sale Auto-Expiration</span>
                  <p className="text-[11px] text-emerald-700">Midnight countdown timer automatically reverts promotional pricing to normal catalog list price.</p>
                </div>
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
                  <span className="font-bold text-purple-900 block">Workflow: Seller Settlement</span>
                  <p className="text-[11px] text-purple-700">Upon successful OTP verification at door or pickup station, escrow releases funds to seller wallet balance.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PLATFORM MODES & SIMULATION */}
          {activeTab === 'platform' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              <div className="pb-2 border-b border-slate-100">
                <h3 className="font-extrabold text-sm text-slate-900">Platform Modes & RBAC</h3>
                <p className="text-[11px] text-slate-500">Simulate role perspective and configure platform rules.</p>
              </div>

              {/* Role Simulation Selector */}
              <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="font-bold text-slate-800 block">Simulate Role Perspective:</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { role: 'BUYER', label: 'Buyer (Customer)' },
                    { role: 'SELLER', label: 'Vendor (Merchant)' },
                    { role: 'DELIVERY_AGENT', label: 'Rider (Logistics)' },
                    { role: 'WAREHOUSE_MANAGER', label: 'Warehouse Manager' },
                    { role: 'CUSTOMER_SUPPORT', label: 'Support Agent' },
                    { role: 'SUPER_ADMIN', label: 'Super Admin' }
                  ].map(r => (
                    <button
                      key={r.role}
                      onClick={() => onSelectSimulatedRole(r.role)}
                      className={`p-1.5 text-left rounded-lg font-semibold text-[11px] transition cursor-pointer border ${
                        activeSimulatedRole === r.role
                          ? 'bg-[#FF6A00] text-white border-[#FF6A00]'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Platform Modules & Config Jump Points */}
              <div className="space-y-2 pt-2">
                <label className="font-bold text-slate-800 block">Ecosystem Configuration Modules:</label>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    { id: 'features', label: 'Platform Features & Flags' },
                    { id: 'commission', label: 'Commission Take-Rate Rules' },
                    { id: 'delivery', label: 'Delivery Zones & Pricing Rules' },
                    { id: 'roles', label: 'Roles & RBAC Permissions' },
                    { id: 'fields', label: 'Custom Attributes & Fields' },
                    { id: 'categories', label: 'Product Category Architecture' },
                    { id: 'integrations', label: 'Payment & Carrier Integrations' }
                  ].map(mod => (
                    <button
                      key={mod.id}
                      onClick={() => onOpenAdminConfigModal(mod.id)}
                      className="p-2 bg-white hover:bg-orange-50/70 border border-slate-200 hover:border-orange-300 rounded-lg text-left text-xs font-semibold text-slate-700 hover:text-orange-700 flex items-center justify-between transition cursor-pointer"
                    >
                      <span>{mod.label}</span>
                      <ChevronRight size={13} className="text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: MANAGE & VERSIONS */}
          {activeTab === 'manage' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              <div className="pb-2 border-b border-slate-100">
                <h3 className="font-extrabold text-sm text-slate-900">Manage & Releases</h3>
                <p className="text-[11px] text-slate-500">Releases, snapshots, audit records and runtime health.</p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={onOpenVersionsModal}
                  className="w-full p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-left font-bold flex items-center justify-between transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <History size={16} className="text-orange-400" />
                    <div>
                      <span>Config Version History</span>
                      <p className="text-[10px] text-slate-400 font-normal">View all release snapshots & rollback</p>
                    </div>
                  </div>
                  <ChevronRight size={14} />
                </button>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-slate-800 block">Cloudflare D1 & SQLite Status</span>
                  <p className="text-[11px] text-slate-500">Table: <code className="text-purple-700 font-mono font-bold">platform_builder_configs</code></p>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] inline-block">SYNCHRONIZED</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

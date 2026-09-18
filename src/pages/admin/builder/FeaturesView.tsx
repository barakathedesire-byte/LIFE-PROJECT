import React, { useState, useEffect, useMemo } from 'react';
import { Power, Settings, RefreshCw, Plus, Trash2, Search, Filter, Lock, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { FeatureModal } from './FeatureModal';
import { api } from '../../../services/api';
import { LumoLoader } from '../../../components/common/LumoLoader';

export const defaultFeatures = [
  { 
    id: 'f-ads', 
    name: 'LUMO Sponsored Ads Engine (Advertising)', 
    description: 'Sponsored product placement, top-of-search ad bidding, and homepage feature boost campaigns for vendors.', 
    status: 'COMING_SOON', 
    category: 'Marketing', 
    version: '1.0-RC' 
  },
  { 
    id: 'f-1', 
    name: 'Express Delivery & Rider Dispatch', 
    description: 'Enable 1-hour/same-day fulfillment via mapped rider network and automated dispatch.', 
    status: 'ENABLED', 
    category: 'Logistics', 
    version: '2.1' 
  },
  { 
    id: 'f-pickup', 
    name: 'Pickup Station Regional Network', 
    description: 'Regional pickup points with OTP parcel handover, customer notifications, and station settlements.', 
    status: 'ENABLED', 
    category: 'Logistics', 
    version: '2.0' 
  },
  { 
    id: 'f-3', 
    name: 'Vendor Promotions & Flash Sales', 
    description: 'Allow vendors to create discount campaigns, time-bound flash sales, and coupon promotions.', 
    status: 'ENABLED', 
    category: 'Marketing', 
    version: '3.0' 
  },
  { 
    id: 'f-2', 
    name: 'Live Stream & Video Commerce', 
    description: 'Real-time video broadcasting and live interactive shopping for sellers.', 
    status: 'REQUIRES_INTEGRATION', 
    category: 'Sales', 
    version: '1.0' 
  },
  { 
    id: 'f-ussd', 
    name: 'USSD & Mobile Money Auto-Verification', 
    description: 'Instant USSD payment requests via M-Pesa, TigoPesa, Airtel Money, and HaloPesa PIN callbacks.', 
    status: 'ENABLED', 
    category: 'Finance', 
    version: '2.5' 
  },
  { 
    id: 'f-escrow', 
    name: 'Escrow Payments & Automated Payouts', 
    description: 'Automated seller escrow holding, delivery confirmation releases, and payout voucher processing.', 
    status: 'ENABLED', 
    category: 'Finance', 
    version: '2.0' 
  },
  { 
    id: 'f-sos', 
    name: 'Rider Emergency Safety & SOS Radar', 
    description: 'One-click rider panic trigger with real-time Leaflet map tracking & WhatsApp response dispatch.', 
    status: 'ENABLED', 
    category: 'Logistics', 
    version: '1.5' 
  },
  { 
    id: 'f-support', 
    name: 'Customer Care & Dispute Desk', 
    description: 'Integrated support ticket desk, WhatsApp buyer-seller chat, and refund escalation workflows.', 
    status: 'ENABLED', 
    category: 'Support', 
    version: '2.0' 
  },
  { 
    id: 'f-kyc', 
    name: 'Seller KYC Verification & Onboarding', 
    description: 'Multi-step TIN/NIDA document verification, business compliance review, and store activation.', 
    status: 'ENABLED', 
    category: 'Compliance', 
    version: '2.2' 
  },
  { 
    id: 'f-warehouse', 
    name: 'Warehouse Staging & Inventory Ledger', 
    description: 'Multi-warehouse receiving, pick-pack-dispatch workflows, and atomic stock movement logs.', 
    status: 'ENABLED', 
    category: 'Inventory', 
    version: '2.0' 
  },
  { 
    id: 'f-sales', 
    name: 'Field Sales & LumoForce Commissions', 
    description: 'Commission tracking, lead management, and referral targets for field sales teams.', 
    status: 'ENABLED', 
    category: 'Sales', 
    version: '1.8' 
  },
  { 
    id: 'f-catalog', 
    name: 'Catalog Schema & Category Attributes', 
    description: 'Category-specific mandatory attributes, specification filters, and product moderation queues.', 
    status: 'ENABLED', 
    category: 'Catalog', 
    version: '2.0' 
  },
  { 
    id: 'f-wallet', 
    name: 'Customer Digital Wallet & Refund Credit', 
    description: 'In-app digital balance for instant refund deposits, store credit, and peer transfers.', 
    status: 'ENABLED', 
    category: 'Finance', 
    version: '1.2' 
  },
  { 
    id: 'f-4', 
    name: 'Referral & Growth Rewards', 
    description: 'Affiliate rewards for new buyer invitations and seller recruitment bonuses.', 
    status: 'DISABLED', 
    category: 'Marketing', 
    version: '1.0' 
  },
  { 
    id: 'f-security', 
    name: 'CyberSecurity Shield & Threat Monitor', 
    description: 'Real-time IP rate limiting, brute force defense, SQL injection protection, and threat logging.', 
    status: 'ENABLED', 
    category: 'Security', 
    version: '3.1' 
  }
];

export const FeaturesView = () => {
  const [features, setFeatures] = useState(defaultFeatures);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    const loadFeatures = async () => {
      try {
        const res = await api.getBuilderConfig();
        if (res.builderConfig?.features && Array.isArray(res.builderConfig.features) && res.builderConfig.features.length > 0) {
          // Merge missing features from defaultFeatures into backend config to ensure complete coverage
          const existingIds = new Set(res.builderConfig.features.map((f: any) => f.id));
          const missingDefaults = defaultFeatures.filter(df => !existingIds.has(df.id));
          setFeatures([...res.builderConfig.features, ...missingDefaults]);
        }
      } catch (err) {
        console.error('Failed to load builder features config:', err);
      }
    };
    loadFeatures();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(features.map(f => f.category));
    return ['ALL', ...Array.from(cats)];
  }, [features]);

  const filteredFeatures = useMemo(() => {
    return features.filter(f => {
      const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            f.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (f.category || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'ALL' || f.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [features, searchQuery, selectedCategory]);

  const handleSaveModal = async (data: any, status: string) => {
    const newFeature = { 
      ...data, 
      status: status === 'PUBLISHED' ? 'ENABLED' : status || 'DISABLED' 
    };
    if (!newFeature.id) {
      newFeature.id = `f-${Date.now()}`;
      newFeature.version = newFeature.version || '1.0';
      newFeature.category = newFeature.category || 'General';
    }
    
    let newFeatures = [...features];
    if (editingFeature) {
      newFeatures = newFeatures.map(f => f.id === newFeature.id ? newFeature : f);
    } else {
      newFeatures.push(newFeature);
    }
    
    setFeatures(newFeatures);
    setIsModalOpen(false);
    setEditingFeature(null);
    try {
      setSaving(true);
      await api.updateBuilderConfig({ features: newFeatures });
    } catch (err) {
      console.error('Failed to save feature:', err);
    } finally {
      setSaving(false);
    }
  };

  const deleteFeature = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to permanently delete feature "${name}"?`)) {
      const updated = features.filter(f => f.id !== id);
      setFeatures(updated);
      try {
        setSaving(true);
        await api.updateBuilderConfig({ features: updated });
      } catch (err) {
        console.error('Failed to delete feature:', err);
      } finally {
        setSaving(false);
      }
    }
  };

  const toggleFeature = async (id: string, currentStatus: string) => {
    if (currentStatus === 'REQUIRES_INTEGRATION') {
      alert('Cannot enable this feature until dependencies are met (Media Server required).');
      return;
    }
    if (currentStatus === 'COMING_SOON' || currentStatus === 'LOCKED') {
      alert('This sector feature is currently locked for the upcoming platform ecosystem update.');
      return;
    }
    const nextStatus = currentStatus === 'ENABLED' ? 'DISABLED' : 'ENABLED';
    const updated = features.map(f => f.id === id ? { ...f, status: nextStatus } : f);
    setFeatures(updated);

    try {
      setSaving(true);
      await api.updateBuilderConfig({ features: updated });
    } catch (err) {
      console.error('Failed to update feature flag:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800">Platform Feature Builder</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-black">
              {features.length} Features
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Control, audit, and configure all platform-wide operational capabilities globally.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {saving && (
            <span className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full font-semibold">
              <LumoLoader size="small" /> Saving to Cloud...
            </span>
          )}
          <button 
            onClick={() => { setEditingFeature(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-[#38006b] hover:bg-[#2a0052] text-white px-4 py-2 rounded-xl font-bold text-sm transition cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Feature
          </button>
        </div>
      </div>

      {/* Controls Bar: Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search platform features by name, category, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#38006b]/20 focus:border-[#38006b]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          <div className="flex gap-1.5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#38006b] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFeatures.map((feature) => {
          const isComingSoon = feature.status === 'COMING_SOON' || feature.status === 'LOCKED';
          const isRequiresIntegration = feature.status === 'REQUIRES_INTEGRATION';
          const isEnabled = feature.status === 'ENABLED';

          return (
            <div 
              key={feature.id} 
              className={`bg-white border rounded-2xl shadow-2xs flex flex-col group overflow-hidden transition ${
                isComingSoon 
                  ? 'border-purple-200 ring-2 ring-purple-500/10 bg-gradient-to-b from-purple-50/20 to-white' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="p-5 flex-1 space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#38006b] bg-purple-50 border border-purple-100 px-2.5 py-0.5 rounded-full">
                    {feature.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono font-bold">v{feature.version}</span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    {feature.name}
                    {isComingSoon && <Lock className="w-3.5 h-3.5 text-purple-600 shrink-0" />}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-3">
                    {feature.description}
                  </p>
                </div>
              </div>

              {/* Status Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    isEnabled ? 'bg-emerald-500 ring-2 ring-emerald-200' : 
                    isRequiresIntegration ? 'bg-amber-500 ring-2 ring-amber-200' : 
                    isComingSoon ? 'bg-purple-600 ring-2 ring-purple-200 animate-pulse' : 
                    'bg-slate-300'
                  }`} />
                  <span className={`text-xs font-black uppercase tracking-wide ${
                    isComingSoon ? 'text-purple-800' : 'text-slate-700'
                  }`}>
                    {(feature.status || '').replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => { setEditingFeature(feature); setIsModalOpen(true); }}
                    className="p-1.5 text-slate-400 hover:text-[#38006b] hover:bg-purple-50 rounded-lg transition cursor-pointer"
                    title="Configure"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteFeature(feature.id, feature.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="Delete Feature"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => toggleFeature(feature.id, feature.status)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      isEnabled 
                        ? 'bg-rose-50 text-rose-700 hover:bg-rose-100' 
                        : isRequiresIntegration
                        ? 'bg-amber-50 text-amber-700 cursor-not-allowed'
                        : isComingSoon
                        ? 'bg-purple-100 text-purple-900 border border-purple-200 cursor-not-allowed font-black'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    {isComingSoon ? <Lock className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                    {isComingSoon ? 'LOCKED' : isEnabled ? 'DISABLE' : 'ENABLE'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredFeatures.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <Sparkles className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800">No platform features found</h3>
          <p className="text-xs text-slate-500">Try adjusting your search query or category filter.</p>
        </div>
      )}

      <FeatureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        initialData={editingFeature || {}}
      />
    </div>
  );
};



import React, { useState } from 'react';
import { useBuilderConfig } from '../../../hooks/useBuilderConfig';
import { Percent, Plus, Settings, Trash2, Filter, DollarSign, Calculator, CheckCircle2, TrendingUp, Sparkles, RefreshCw } from 'lucide-react';
import { CommissionRuleModal } from './CommissionRuleModal';
import { api } from '../../../services/api';

interface CommissionRule {
  id: string;
  name: string;
  beneficiary: 'SELLER' | 'RIDER' | 'PICKUP_STATION' | 'SALESPERSON';
  category?: string;
  calculationMethod: 'PERCENTAGE' | 'FIXED_FLAT' | 'TIERED_VOLUME' | 'DISTANCE_BASED' | 'ZONE_BASED' | 'PEAK_SURCHARGE' | 'HYBRID';
  rate: number;
  qualificationTrigger?: string;
  active: boolean;
  minAmount?: number;
  maxAmount?: number;
  notes?: string;
}

const initialCommissionRules: CommissionRule[] = [
  {
    id: 'cr-1',
    name: 'Electronics & Phones Marketplace Take-Rate',
    beneficiary: 'SELLER',
    category: 'Phones & Tablets, Computers',
    calculationMethod: 'PERCENTAGE',
    rate: 6.5,
    qualificationTrigger: 'ESCROW_RELEASED',
    active: true,
    notes: 'Competitive take-rate for high-ticket electronic devices.'
  },
  {
    id: 'cr-2',
    name: 'Fashion & Apparel Standard Commission',
    beneficiary: 'SELLER',
    category: 'Fashion & Apparel, Shoes',
    calculationMethod: 'PERCENTAGE',
    rate: 12.0,
    qualificationTrigger: 'ESCROW_RELEASED',
    active: true,
    notes: 'Standard marketplace take-rate for apparel items.'
  },
  {
    id: 'cr-3',
    name: 'Rider Standard Delivery Earnings Split',
    beneficiary: 'RIDER',
    category: 'Door Delivery (0 - 10km)',
    calculationMethod: 'FIXED_FLAT',
    rate: 3500,
    qualificationTrigger: 'ORDER_DELIVERED',
    active: true,
    notes: 'Base guaranteed rider compensation per completed drop-off.'
  },
  {
    id: 'cr-4',
    name: 'Rider Extended Distance Surcharge',
    beneficiary: 'RIDER',
    category: 'Long-Haul Courier (> 10km)',
    calculationMethod: 'DISTANCE_BASED',
    rate: 450,
    qualificationTrigger: 'ORDER_DELIVERED',
    active: true,
    notes: 'TZS 450 per additional kilometer beyond the 10km base radius.'
  },
  {
    id: 'cr-5',
    name: 'Pickup Station Handling Commission',
    beneficiary: 'PICKUP_STATION',
    category: 'LUMO Point Pickup Network',
    calculationMethod: 'FIXED_FLAT',
    rate: 1500,
    qualificationTrigger: 'PACKAGE_COLLECTED_AT_STATION',
    active: true,
    notes: 'Credit to pickup station partner wallet upon verified customer collection.'
  },
  {
    id: 'cr-6',
    name: 'Field Salesperson Vendor Acquisition Commission',
    beneficiary: 'SALESPERSON',
    category: 'Direct Vendor Referrals',
    calculationMethod: 'PERCENTAGE',
    rate: 3.0,
    qualificationTrigger: 'VENDOR_FIRST_SALE',
    active: true,
    notes: '3% of GMV from onboarded vendors during their first 60 days on LUMO.'
  }
];

export const CommissionRulesView = () => {
  const { data: rules, updateConfig: setRules } = useBuilderConfig('commissionRules', initialCommissionRules);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<CommissionRule | null>(null);
  const [selectedBeneficiaryFilter, setSelectedBeneficiaryFilter] = useState<string>('ALL');

  // Simulation State
  const [simRule, setSimRule] = useState<CommissionRule | null>(null);
  const [testOrderAmount, setTestOrderAmount] = useState<number>(150000);
  const [testDistanceKm, setTestDistanceKm] = useState<number>(14);

  const safeRules: CommissionRule[] = Array.isArray(rules) ? rules : initialCommissionRules;

  const filteredRules = selectedBeneficiaryFilter === 'ALL'
    ? safeRules
    : safeRules.filter(r => r.beneficiary === selectedBeneficiaryFilter);

  const toggleRule = (id: string) => {
    setRules(safeRules.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const deleteRule = async (id: string) => {
    if (confirm('Delete this commission rule? This will affect upcoming automated settlements.')) {
      try {
        await api.deleteCommissionRule(id);
      } catch (err) {
        console.warn('Backend commission rule delete notice:', err);
      }
      setRules(safeRules.filter(r => r.id !== id), `Deleted commission rule ${id}`);
    }
  };

  const handleSave = (data: any, status: string) => {
    const newRule: CommissionRule = {
      ...data,
      id: data.id || `cr-${Date.now()}`,
      active: status === 'PUBLISHED'
    };

    let newRules = [...safeRules];
    if (editingRule) {
      newRules = newRules.map(r => r.id === newRule.id ? newRule : r);
    } else {
      newRules.push(newRule);
    }
    setRules(newRules);
    setShowModal(false);
    setEditingRule(null);
  };

  const calculateSimResult = (rule: CommissionRule) => {
    let earned = 0;
    let explanation = '';

    if (rule.calculationMethod === 'PERCENTAGE') {
      earned = (testOrderAmount * rule.rate) / 100;
      explanation = `${rule.rate}% applied to TZS ${testOrderAmount.toLocaleString()}`;
    } else if (rule.calculationMethod === 'DISTANCE_BASED') {
      const extraKm = Math.max(0, testDistanceKm - 10);
      earned = rule.rate * extraKm;
      explanation = `TZS ${rule.rate}/km x ${extraKm}km (Distance beyond 10km base)`;
    } else {
      earned = rule.rate;
      explanation = `Fixed flat rate of TZS ${rule.rate.toLocaleString()} per transaction`;
    }

    return { earned, explanation };
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800">Multi-Role Commission & Settlement Rules</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
              Authoritative Backend Engine
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Configure automated take-rates and wallet earnings for Sellers, Riders, Pickup Stations, and Sales Agents.
          </p>
        </div>
        <button
          onClick={() => { setEditingRule(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" /> Create Commission Rule
        </button>
      </div>

      {/* Beneficiary Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0">
          <Filter className="w-3.5 h-3.5" /> Filter by Beneficiary:
        </span>
        {['ALL', 'SELLER', 'RIDER', 'PICKUP_STATION', 'SALESPERSON'].map(b => (
          <button
            key={b}
            onClick={() => setSelectedBeneficiaryFilter(b)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
              selectedBeneficiaryFilter === b
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {b === 'ALL' ? 'All Roles' : (b || '').replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Rules Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold">
            <tr>
              <th className="py-3 px-4">Rule Identity & Scope</th>
              <th className="py-3 px-4">Beneficiary</th>
              <th className="py-3 px-4">Calculation Method</th>
              <th className="py-3 px-4">Configured Rate</th>
              <th className="py-3 px-4">Settlement Release Trigger</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRules.map((rule) => {
              const ben = (rule.beneficiary || (rule as any).targetType || (rule as any).role || 'SELLER').toString();
              const calcMethod = (rule.calculationMethod || 'PERCENTAGE').toString();
              const trigger = (rule.qualificationTrigger || 'ESCROW_RELEASED').toString();
              return (
              <tr key={rule.id} className="hover:bg-slate-50 transition">
                <td className="py-3 px-4 max-w-xs">
                  <p className="font-bold text-slate-900">{rule.name}</p>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{rule.notes || rule.category}</p>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase border ${
                    ben === 'SELLER'
                      ? 'bg-orange-50 text-orange-800 border-orange-200'
                      : ben === 'RIDER'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : ben === 'PICKUP_STATION'
                      ? 'bg-teal-50 text-teal-800 border-teal-200'
                      : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                  }`}>
                    {ben.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-slate-700 text-[11px]">
                  {calcMethod.replace(/_/g, ' ')}
                </td>
                <td className="py-3 px-4">
                  <span className="font-extrabold text-sm text-slate-900 font-mono">
                    {calcMethod === 'PERCENTAGE'
                      ? `${rule.rate}%`
                      : calcMethod === 'DISTANCE_BASED'
                      ? `TZS ${(Number(rule.rate) || 0).toLocaleString()} / km`
                      : `TZS ${(Number(rule.rate) || 0).toLocaleString()}`}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-[11px] font-semibold text-slate-600">
                    {trigger.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase cursor-pointer transition ${
                      rule.active
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {rule.active ? 'Active' : 'Paused'}
                  </button>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setSimRule(rule)}
                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition cursor-pointer"
                      title="Test Commission Calculation"
                    >
                      <Calculator className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setEditingRule(rule); setShowModal(true); }}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition cursor-pointer"
                      title="Edit Rule"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteRule(rule.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                      title="Delete Rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
          </tbody>
        </table>
      </div>

      {/* COMMISSION SIMULATION MODAL */}
      {simRule && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Commission & Payout Simulator</h3>
              </div>
              <button
                onClick={() => setSimRule(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <p className="font-bold text-slate-900 text-sm">{simRule.name}</p>
              <p className="text-slate-600 text-xs">
                Beneficiary: <strong>{((simRule.beneficiary || (simRule as any).targetType || 'SELLER') as string).toString().replace(/_/g, ' ')}</strong> | Method: <strong>{((simRule.calculationMethod || 'PERCENTAGE') as string).toString().replace(/_/g, ' ')}</strong>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Simulated Order Subtotal (TZS)</label>
                <input
                  type="number"
                  value={testOrderAmount}
                  onChange={e => setTestOrderAmount(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Simulated Distance (KM)</label>
                <input
                  type="number"
                  value={testDistanceKm}
                  onChange={e => setTestDistanceKm(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono font-bold"
                />
              </div>
            </div>

            {(() => {
              const res = calculateSimResult(simRule);
              return (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900">Calculated Payout / Fee:</span>
                    <span className="text-xl font-extrabold text-emerald-700 font-mono">
                      TZS {Math.round(res.earned).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800 font-mono">
                    Formula breakdown: {res.explanation}
                  </p>
                </div>
              );
            })()}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSimRule(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Create Modal */}
      <CommissionRuleModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        initialData={editingRule || {}}
      />
    </div>
  );
};

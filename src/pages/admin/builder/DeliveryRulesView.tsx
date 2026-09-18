import React, { useState, useEffect } from 'react';
import { useBuilderConfig } from '../../../hooks/useBuilderConfig';
import { Truck, Plus, Settings, Trash2, Check, RefreshCw, Sparkles, MapPin, Clock, DollarSign, Zap } from 'lucide-react';
import { api } from '../../../services/api';
import { LumoLoader } from '../../../components/common/LumoLoader';
import { DeliveryRuleModal } from './DeliveryRuleModal';

const defaultDeliveryRules = [
  {
    id: 'dr-1',
    name: 'Dar es Salaam Central (Zone 1)',
    type: 'Same-Day',
    zone: 'Zone 1: Dar es Salaam CBD (Kariakoo, Posta, Ilala, Kisutu)',
    keywords: 'kariakoo, posta, ilala, kisutu, upanga, kivukoni',
    baseFee: 3000,
    fee: 3000,
    distanceRate: 500,
    freeThresholdAmount: 150000,
    slaText: 'Same-Day (1 - 3 Hours)',
    assignmentMode: 'AUTO_PROXIMITY',
    allowCOD: true,
    express: true,
    status: 'ACTIVE'
  },
  {
    id: 'dr-2',
    name: 'Dar es Salaam Inner & Outer Suburbs (Zone 2 & 3)',
    type: 'Standard',
    zone: 'Zone 2: Dar es Salaam Inner Ring (Kinondoni, Sinza, Mikocheni, Masaki, Oysterbay)',
    keywords: 'kinondoni, sinza, mikocheni, masaki, oysterbay, tegeta, mbezi, kigamboni',
    baseFee: 6500,
    fee: 6500,
    distanceRate: 600,
    freeThresholdAmount: 250000,
    slaText: 'Next-Day (24 Hours)',
    assignmentMode: 'AUTO_PROXIMITY',
    allowCOD: true,
    express: true,
    status: 'ACTIVE'
  },
  {
    id: 'dr-3',
    name: 'Upcountry Major Hubs (Arusha, Mwanza, Dodoma)',
    type: 'Standard',
    zone: 'Zone 5: Northern Zone (Arusha, Moshi, Tanga, Kilimanjaro)',
    keywords: 'arusha, mwanza, dodoma, moshi, mbeya, morogoro, tanga',
    baseFee: 15000,
    fee: 15000,
    distanceRate: 1000,
    freeThresholdAmount: 500000,
    slaText: '2 - 4 Business Days',
    assignmentMode: 'STATION_INBOUND',
    allowCOD: false,
    restrictUpcountrySameDay: true,
    express: false,
    status: 'ACTIVE'
  },
  {
    id: 'dr-4',
    name: 'LUMO Point Pickup Station Collection',
    type: 'Pickup Station',
    zone: 'All Tanzania Serviceable Zones',
    keywords: 'pickup, station, hub, agent, point',
    baseFee: 2000,
    fee: 2000,
    distanceRate: 0,
    freeThresholdAmount: 80000,
    slaText: 'Ready within 24h at Station',
    assignmentMode: 'STATION_INBOUND',
    allowCOD: true,
    express: false,
    status: 'ACTIVE'
  }
];

export const DeliveryRulesView = () => {
  const { data: rules, updateConfig: setRules, isSaving } = useBuilderConfig('deliveryRules', defaultDeliveryRules);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [simulating, setSimulating] = useState(false);
  const [testAddress, setTestAddress] = useState('Sinza Mori, Dar es Salaam');
  const [testWeight, setTestWeight] = useState(2.5);
  const [testType, setTestType] = useState('Same-Day');
  const [testPriority, setTestPriority] = useState<'Normal' | 'High' | 'Urgent'>('Normal');
  const [simResult, setSimResult] = useState<any>(null);

  const safeRules = Array.isArray(rules) && rules.length > 0 ? rules : defaultDeliveryRules;

  const handleSaveModal = (data: any, status: string) => {
    const newRule = {
      ...data,
      baseFee: Number(data.baseFee ?? data.fee ?? 3500),
      fee: Number(data.baseFee ?? data.fee ?? 3500),
      status: status === 'PUBLISHED' ? 'ACTIVE' : 'DRAFT'
    };
    if (!newRule.id) {
      newRule.id = `dr-${Date.now()}`;
    }

    let newRules = [...safeRules];
    if (editingRule) {
      newRules = newRules.map(r => r.id === newRule.id ? newRule : r);
    } else {
      newRules.push(newRule);
    }

    setRules(newRules, `Saved delivery rule "${newRule.name}"`);
    setShowModal(false);
    setEditingRule(null);
  };

  const deleteRule = (id: string) => {
    const ruleToDelete = safeRules.find(r => r.id === id);
    const ruleName = ruleToDelete?.name || 'this delivery rule';
    if (confirm(`Are you sure you want to permanently delete "${ruleName}"? This action cannot be undone.`)) {
      const updated = safeRules.filter(r => r.id !== id);
      setRules(updated, `Deleted delivery rule "${ruleName}"`);
    }
  };

  const toggleStatus = async (id: string) => {
    const updated = safeRules.map(r => {
      if (r.id === id) {
        return { ...r, status: r.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE' };
      }
      return r;
    });
    setRules(updated);
  };

  const runSimulation = () => {
    const query = (testAddress || '').toLowerCase();
    let matchedRule = safeRules.find(r => {
      if (!r.status || r.status === 'ACTIVE') {
        const kwList = (r.keywords || '').toLowerCase().split(',').map((k: string) => k.trim()).filter(Boolean);
        return kwList.some((kw: string) => query.includes(kw)) || (r.zone || '').toLowerCase().includes(query);
      }
      return false;
    }) || safeRules[0];

    let base = Number(matchedRule.baseFee ?? matchedRule.fee ?? 3500);
    let weightSurcharge = 0;
    if (testWeight > 5) {
      weightSurcharge = Number((matchedRule as any).weightSurchargeTier1 ?? 2000) * Math.ceil(testWeight - 5);
    }

    let priorityMult = 1.0;
    if (testPriority === 'High') priorityMult = Number((matchedRule as any).highPriorityMultiplier ?? 1.25);
    if (testPriority === 'Urgent') priorityMult = Number((matchedRule as any).urgentPriorityMultiplier ?? 1.5);

    const calculatedTotal = Math.round((base + weightSurcharge) * priorityMult);

    setSimResult({
      ruleName: matchedRule.name,
      zone: matchedRule.zone || 'Zone 1: Dar es Salaam CBD',
      sla: matchedRule.slaText || (testType === 'Same-Day' ? '2 - 4 Hours' : '24 - 48 Hours'),
      baseFee: base,
      weightSurcharge,
      priorityMult,
      calculatedFee: calculatedTotal,
      assignmentMode: matchedRule.assignmentMode || 'AUTO_PROXIMITY',
      codEligible: matchedRule.allowCOD !== false
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Delivery Rules & Zone Matrix</h2>
          <p className="text-sm text-slate-500">
            Configure spatial rates, automated zone detection, SLA guarantees, rider auto-dispatch, and COD eligibility.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSimulating(true);
              runSimulation();
            }}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl font-bold text-xs transition cursor-pointer shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-400" /> Rate Calculator
          </button>
          <button
            onClick={() => {
              setEditingRule(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" /> Create Delivery Rule
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-bold tracking-wider">
            <tr>
              <th className="py-3 px-4">Rule Name & Zone</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Base Fee</th>
              <th className="py-3 px-4">Free Threshold</th>
              <th className="py-3 px-4">SLA Time</th>
              <th className="py-3 px-4">Auto-Dispatch</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {safeRules.map((rule: any) => (
              <tr key={rule.id} className="hover:bg-slate-50 transition">
                <td className="py-3.5 px-4">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                    {rule.name}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium truncate max-w-xs">{rule.zone || 'All Zones'}</div>
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold font-mono text-[10px]">
                    {rule.type || 'Standard'}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                  TZS {Number(rule.baseFee ?? rule.fee ?? 0).toLocaleString()}
                </td>
                <td className="py-3.5 px-4 font-mono text-emerald-600 font-semibold">
                  {rule.freeThresholdAmount ? `TZS ${Number(rule.freeThresholdAmount).toLocaleString()}` : rule.freeThreshold || '—'}
                </td>
                <td className="py-3.5 px-4 text-slate-700 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{rule.slaText || '24 - 48 Hours'}</span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                    {rule.assignmentMode === 'AUTO_PROXIMITY' ? '⚡ Nearest Rider' : rule.assignmentMode === 'STATION_INBOUND' ? '📦 Station Hub' : 'Pool / Manual'}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <button
                    onClick={() => toggleStatus(rule.id)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition cursor-pointer ${
                      rule.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    {rule.status || 'ACTIVE'}
                  </button>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => {
                        setEditingRule(rule);
                        setShowModal(true);
                      }}
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
            ))}
          </tbody>
        </table>
      </div>

      {/* RATE SIMULATION MODAL */}
      {simulating && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">Delivery Zone & Rate Calculator</h3>
              </div>
              <button
                onClick={() => setSimulating(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Destination Address / Landmark</label>
                <input
                  type="text"
                  value={testAddress}
                  onChange={e => setTestAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                  placeholder="e.g. Shekilango Road, Sinza"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Package Weight (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={testWeight}
                  onChange={e => setTestWeight(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Requested SLA Service</label>
                <select
                  value={testType}
                  onChange={e => setTestType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold"
                >
                  <option value="Same-Day">Same-Day Express</option>
                  <option value="Standard">Standard Doorstep</option>
                  <option value="Pickup Station">LUMO Point Collection</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Dispatch Priority</label>
                <select
                  value={testPriority}
                  onChange={e => setTestPriority(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold"
                >
                  <option value="Normal">Normal (1.0x)</option>
                  <option value="High">High Priority (+25%)</option>
                  <option value="Urgent">Urgent Rush (+50%)</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={runSimulation}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" /> Calculate Zone & Shipping Price
            </button>

            {simResult && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Detected Zone Rule</span>
                    <strong className="text-slate-900 text-sm">{simResult.ruleName}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Estimated Fee</span>
                    <strong className="text-emerald-700 text-base font-mono font-black">
                      TZS {simResult.calculatedFee.toLocaleString()}
                    </strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">SLA Commitment</span>
                    <strong className="text-slate-800">{simResult.sla}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Rider Routing</span>
                    <strong className="text-indigo-700">{simResult.assignmentMode}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">COD Status</span>
                    <strong className={simResult.codEligible ? 'text-emerald-600' : 'text-rose-600'}>
                      {simResult.codEligible ? 'Allowed' : 'Prepaid Only'}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <DeliveryRuleModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingRule(null);
        }}
        onSave={handleSaveModal}
        initialData={editingRule || {}}
      />
    </div>
  );
};


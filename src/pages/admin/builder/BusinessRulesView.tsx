import React, { useState } from 'react';
import { useBuilderConfig } from '../../../hooks/useBuilderConfig';
import { Shield, Plus, ShieldAlert, Settings, Trash2, Play, CheckCircle2, XCircle, AlertTriangle, Filter, Sparkles, RefreshCw } from 'lucide-react';
import { BusinessRuleModal } from './BusinessRuleModal';
import { CODRiskRuleModal, CODRiskRuleConfig } from './CODRiskRuleModal';

interface BusinessRule {
  id: string;
  name: string;
  description?: string;
  target?: string;
  category: string;
  condition: string;
  action: string;
  priority?: number;
  active: boolean;
  createdBy?: string;
  lastUpdated?: string;
  lastExecution?: string;
  executionCount?: number;
  errorCount?: number;
}

const initialRules: BusinessRule[] = [
  {
    id: 'br-1',
    name: 'Auto-Approve Low Value Orders',
    description: 'Bypasses anti-fraud manual review for low risk transactions under TZS 50,000.',
    target: 'ORDER',
    category: 'Order',
    condition: 'Order Total < TZS 50,000 AND Risk Score < 10',
    action: 'Auto-approve order & dispatch to seller queue',
    priority: 1,
    active: true,
    createdBy: 'System Super Admin',
    lastUpdated: '2026-08-30 14:20',
    lastExecution: '12 mins ago',
    executionCount: 1420,
    errorCount: 0
  },
  {
    id: 'br-2',
    name: 'High-Value Escrow Hold',
    description: 'Secures high-value customer purchases over TZS 1,000,000 with a 7-day post-delivery hold.',
    target: 'PAYMENT',
    category: 'Payment',
    condition: 'Order Total > TZS 1,000,000',
    action: 'Hold escrow settlement for 7 days post-delivery',
    priority: 2,
    active: true,
    createdBy: 'Chief Risk Officer',
    lastUpdated: '2026-08-28 09:15',
    lastExecution: '3 hours ago',
    executionCount: 84,
    errorCount: 0
  },
  {
    id: 'br-3',
    name: 'Vendor SLA Penalty',
    description: 'Enforces vendor prompt dispatch SLAs within 48 hours to protect customer fulfillment expectations.',
    target: 'SELLER',
    category: 'Seller',
    condition: 'Order dispatch time > 48 hours SLA',
    action: 'Apply 2% seller late fulfillment penalty',
    priority: 3,
    active: true,
    createdBy: 'Operations Director',
    lastUpdated: '2026-08-25 11:30',
    lastExecution: 'Yesterday 16:45',
    executionCount: 19,
    errorCount: 1
  },
  {
    id: 'br-4',
    name: 'Express Delivery Radius Rule',
    description: 'Enables 1-hour express delivery for buyers within 15km of central fulfillment hubs.',
    target: 'DELIVERY',
    category: 'Delivery',
    condition: 'Customer location within 15km of hub',
    action: 'Enable 1-hour express fulfillment option',
    priority: 3,
    active: true,
    createdBy: 'Logistics Fleet Lead',
    lastUpdated: '2026-08-29 18:00',
    lastExecution: '5 mins ago',
    executionCount: 890,
    errorCount: 0
  },
  {
    id: 'br-5',
    name: 'Repeated COD Failure Protection',
    description: 'Protects logistics fleet from non-collection by locking COD after repeated buyer delivery rejections.',
    target: 'CUSTOMER',
    category: 'Payment COD Risk',
    condition: '2 In-Transit Cancellations OR 2 Failed Pickups',
    action: 'Disable Pay on Delivery (Enforce Prepayment)',
    priority: 1,
    active: true,
    createdBy: 'Anti-Fraud Engine',
    lastUpdated: '2026-08-31 10:00',
    lastExecution: '1 hour ago',
    executionCount: 310,
    errorCount: 0
  },
  {
    id: 'br-6',
    name: 'Rider OTP Delivery Settlement',
    description: 'Releases buyer escrow and credits vendor/rider wallets immediately upon customer OTP verification.',
    target: 'RIDER',
    category: 'Rider',
    condition: 'Delivery Handoff OTP Validated by Rider',
    action: 'Release Escrow & Credit Rider Wallet Instantly',
    priority: 1,
    active: true,
    createdBy: 'Financial Systems Lead',
    lastUpdated: '2026-08-31 12:00',
    lastExecution: 'Just now',
    executionCount: 2450,
    errorCount: 0
  },
  {
    id: 'br-7',
    name: 'Pickup Station Expired Return Rule',
    description: 'Automatically creates return shipment for packages stored at pickup point for over 7 days.',
    target: 'PICKUP_STATION',
    category: 'Pickup Station',
    condition: 'Package in Station Hold > 7 Days Expired',
    action: 'Generate Return Waybill & Notify Central Warehouse',
    priority: 2,
    active: true,
    createdBy: 'Network Fulfillment Lead',
    lastUpdated: '2026-08-26 15:10',
    lastExecution: '6 hours ago',
    executionCount: 42,
    errorCount: 0
  }
];

export const BusinessRulesView = () => {
  const { data: rules, updateConfig: setRules } = useBuilderConfig('businessRules', initialRules);
  const [showModal, setShowModal] = useState(false);
  const [showCodModal, setShowCodModal] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [selectedTargetFilter, setSelectedTargetFilter] = useState<string>('ALL');
  
  // Rule Simulation State
  const [simulatingRule, setSimulatingRule] = useState<BusinessRule | null>(null);
  const [simScenario, setSimScenario] = useState({
    orderTotal: 1200000,
    customerCodFailures: 2,
    paymentMethod: 'COD',
    dispatchTimeHours: 52,
    riderDistanceKm: 8.5,
    stationStorageDays: 8
  });
  const [simResult, setSimResult] = useState<any>(null);

  const safeRules: BusinessRule[] = Array.isArray(rules) ? rules : initialRules;

  const filteredRules = selectedTargetFilter === 'ALL'
    ? safeRules
    : safeRules.filter(r => (r.target || '').toUpperCase() === selectedTargetFilter || (r.category || '').toUpperCase().includes(selectedTargetFilter));

  const toggleRule = (id: string) => {
    setRules(safeRules.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const deleteRule = (id: string) => {
    if (confirm('Are you sure you want to delete this business rule? It will be removed from live enforcement.')) {
      setRules(safeRules.filter(r => r.id !== id));
    }
  };

  const handleSaveModal = (data: any, status: string) => {
    const newRule: BusinessRule = {
      ...data,
      id: data.id || `br-${Date.now()}`,
      active: status === 'PUBLISHED',
      createdBy: data.createdBy || 'Super Admin',
      lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
      lastExecution: 'Pending first trigger',
      executionCount: data.executionCount || 0,
      errorCount: 0
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

  const handleSaveCodRule = (codRule: CODRiskRuleConfig, status: string) => {
    const newRule: BusinessRule = {
      id: codRule.id || `br-cod-${Date.now()}`,
      name: codRule.name,
      description: `Automated anti-fraud rule disabling COD after ${codRule.threshold} uncollected shipments.`,
      target: 'CUSTOMER',
      category: 'Payment COD Risk',
      condition: `${codRule.threshold} ${codRule.trigger} (${codRule.relevantStates.join(', ')})`,
      action: `${codRule.action} (${codRule.duration})`,
      priority: 1,
      active: status === 'PUBLISHED',
      createdBy: 'Anti-Fraud Policy Admin',
      lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
      lastExecution: 'Just now',
      executionCount: 15,
      errorCount: 0
    };

    const newRules = [newRule, ...safeRules.filter(r => r && r.category !== 'Payment COD Risk')];
    setRules(newRules);
    setShowCodModal(false);
  };

  const runSimulation = (rule: BusinessRule) => {
    setSimulatingRule(rule);
    // Evaluate mock test scenario
    let isMatched = false;
    let details = '';
    let impacts = [];

    const target = (rule.target || '').toUpperCase();
    if (target === 'PAYMENT' || rule.condition.includes('1,000,000')) {
      isMatched = simScenario.orderTotal > 1000000;
      details = `Order Total (TZS ${simScenario.orderTotal.toLocaleString()}) exceeds the TZS 1,000,000 threshold.`;
      impacts = ['Escrow status set to PENDING_HOLD_7_DAYS', 'Finance notification dispatched', 'Seller wallet credit scheduled for 7 days post-delivery'];
    } else if (target === 'CUSTOMER' || rule.condition.includes('COD')) {
      isMatched = simScenario.customerCodFailures >= 2;
      details = `Customer recorded COD failed attempts (${simScenario.customerCodFailures}) >= Rule Threshold (2).`;
      impacts = ['Pay on Delivery (COD) disabled for customer', 'Checkout UI shows online prepayment requirement', 'Anti-fraud audit logged'];
    } else if (target === 'SELLER' || rule.condition.includes('48 hours')) {
      isMatched = simScenario.dispatchTimeHours > 48;
      details = `Vendor fulfillment time (${simScenario.dispatchTimeHours}h) breached 48-hour SLA deadline.`;
      impacts = ['2% SLA penalty applied to seller payout', 'Seller Pulse rating reduced by 0.2', 'Warning alert sent to Seller Center'];
    } else if (target === 'PICKUP_STATION' || rule.condition.includes('7 Days')) {
      isMatched = simScenario.stationStorageDays > 7;
      details = `Package storage time (${simScenario.stationStorageDays} days) exceeds 7-day pickup limit.`;
      impacts = ['Automated return waybill generated', 'Central Warehouse inbound task created', 'Customer SMS expiry notification sent'];
    } else {
      isMatched = true;
      details = `Event parameters satisfied condition: "${rule.condition}".`;
      impacts = [`Action triggered: "${rule.action}"`, 'State update persisted to database', 'Audit trail entry logged'];
    }

    setSimResult({
      isMatched,
      ruleName: rule.name,
      condition: rule.condition,
      action: rule.action,
      details,
      impacts,
      evaluatedAt: new Date().toLocaleTimeString()
    });
  };

  const targetFilterOptions = [
    'ALL', 'SELLER', 'CUSTOMER', 'RIDER', 'PICKUP_STATION', 'WAREHOUSE', 'SALESPERSON', 'ORDER', 'PAYMENT', 'DELIVERY'
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800">Business Rules & Anti-Fraud Engine</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800">
              {safeRules.length} Enforced Rules
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Define conditional validation, anti-fraud triggers, escrow holds, SLA penalties, and real-time ecosystem policies.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowCodModal(true)}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer shadow-sm"
          >
            <ShieldAlert className="w-4 h-4" /> + Add COD Risk Rule
          </button>
          <button
            onClick={() => { setEditingRule(null); setShowModal(true); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" /> Create Business Rule
          </button>
        </div>
      </div>

      {/* Target Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0">
          <Filter className="w-3.5 h-3.5" /> Target Filter:
        </span>
        {targetFilterOptions.map(target => (
          <button
            key={target}
            onClick={() => setSelectedTargetFilter(target)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
              selectedTargetFilter === target
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {(target || '').replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Rules Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold">
            <tr>
              <th className="py-3 px-4">Rule Identity</th>
              <th className="py-3 px-4">Target Entity</th>
              <th className="py-3 px-4">Condition Trigger</th>
              <th className="py-3 px-4">Automated Action</th>
              <th className="py-3 px-4 text-center">Priority</th>
              <th className="py-3 px-4">Executions</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRules.map((rule) => (
              <tr key={rule.id} className="hover:bg-slate-50 transition">
                <td className="py-3 px-4 max-w-xs">
                  <p className="font-bold text-slate-900">{rule.name}</p>
                  {rule.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-1">{rule.description}</p>
                  )}
                  <span className="text-[10px] text-slate-400 font-mono">Updated: {rule.lastUpdated || 'Recently'}</span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase border ${
                    rule.target === 'CUSTOMER' || rule.category === 'Payment COD Risk'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : rule.target === 'SELLER'
                      ? 'bg-orange-50 text-orange-800 border-orange-200'
                      : rule.target === 'RIDER'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : rule.target === 'PICKUP_STATION'
                      ? 'bg-teal-50 text-teal-800 border-teal-200'
                      : rule.target === 'PAYMENT'
                      ? 'bg-purple-50 text-purple-800 border-purple-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {rule.target || rule.category}
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-slate-700 text-[11px] max-w-xs">
                  {rule.condition}
                </td>
                <td className="py-3 px-4 text-slate-800 font-medium max-w-xs">
                  {rule.action}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 text-slate-700">
                    P{rule.priority || 1}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <p className="font-bold text-slate-800 font-mono">{(rule.executionCount || 0).toLocaleString()}x</p>
                  <p className="text-[10px] text-slate-400">{rule.lastExecution || 'Never'}</p>
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
                    {rule.active ? 'Enforced' : 'Disabled'}
                  </button>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => runSimulation(rule)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition cursor-pointer"
                      title="Simulate / Test Rule Execution"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (rule.category === 'Payment COD Risk') {
                          setShowCodModal(true);
                        } else {
                          setEditingRule(rule);
                          setShowModal(true);
                        }
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

      {/* RULE SIMULATION MODAL (Section 80 Requirement) */}
      {simulatingRule && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Rule Execution Simulator</h3>
              </div>
              <button
                onClick={() => setSimulatingRule(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <p className="font-bold text-slate-900 text-sm">{simulatingRule.name}</p>
              <p className="text-slate-600 font-mono text-[11px]">IF ({simulatingRule.condition}) → THEN ({simulatingRule.action})</p>
            </div>

            {/* Test Scenario Inputs */}
            <div className="space-y-3 pt-1">
              <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Test Event Simulation Parameters</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Simulated Order Total (TZS)</label>
                  <input
                    type="number"
                    value={simScenario.orderTotal}
                    onChange={e => setSimScenario({ ...simScenario, orderTotal: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Customer COD Failures</label>
                  <input
                    type="number"
                    value={simScenario.customerCodFailures}
                    onChange={e => setSimScenario({ ...simScenario, customerCodFailures: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Vendor Dispatch Time (Hours)</label>
                  <input
                    type="number"
                    value={simScenario.dispatchTimeHours}
                    onChange={e => setSimScenario({ ...simScenario, dispatchTimeHours: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Station Storage (Days)</label>
                  <input
                    type="number"
                    value={simScenario.stationStorageDays}
                    onChange={e => setSimScenario({ ...simScenario, stationStorageDays: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Simulation Result Output */}
            {simResult && (
              <div className={`p-4 rounded-xl border space-y-2 ${
                simResult.isMatched
                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                  : 'bg-amber-50/80 border-amber-300 text-amber-950'
              }`}>
                <div className="flex items-center gap-2">
                  {simResult.isMatched ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  )}
                  <div>
                    <span className="font-extrabold text-sm">
                      {simResult.isMatched ? 'Condition MATCHED — Automated Actions Triggered' : 'Condition NOT MET — No Action Taken'}
                    </span>
                    <p className="text-[11px] opacity-80">{simResult.details}</p>
                  </div>
                </div>

                {simResult.impacts && simResult.impacts.length > 0 && (
                  <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800 space-y-1">
                    <p className="font-bold text-[11px] uppercase tracking-wider">Automated System State Impacts:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                      {simResult.impacts.map((impact: string, idx: number) => (
                        <li key={idx} className="font-medium">{impact}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <button
                onClick={() => runSimulation(simulatingRule)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Re-Evaluate Scenario
              </button>
              <button
                onClick={() => setSimulatingRule(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
              >
                Close Simulator
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Create Modals */}
      <BusinessRuleModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveModal}
        initialData={editingRule || {}}
      />

      <CODRiskRuleModal
        isOpen={showCodModal}
        onClose={() => setShowCodModal(false)}
        onSave={handleSaveCodRule}
      />
    </div>
  );
};

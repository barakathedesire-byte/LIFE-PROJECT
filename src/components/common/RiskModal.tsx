import React, { useState } from 'react';
import {
  AlertTriangle,
  X,
  Shield,
  ShieldAlert,
  CheckCircle2,
  Lock,
  UserX,
  RotateCcw,
  Flag
} from 'lucide-react';
import { api } from '../../services/api';
import { RiskIncident, RiskLevel } from '../../types';

interface RiskModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'ORDER' | 'USER' | 'SELLER' | 'RIDER' | 'PAYMENT';
  entityId: string;
  entityReference: string;
  onSuccess?: (incident: RiskIncident) => void;
}

export const RiskModal: React.FC<RiskModalProps> = ({
  isOpen,
  onClose,
  entityType,
  entityId,
  entityReference,
  onSuccess
}) => {
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('HIGH');
  const [riskScore, setRiskScore] = useState<number>(75);
  const [selectedFactors, setSelectedFactors] = useState<string[]>([
    'Repeated in-transit delivery cancellations'
  ]);
  const [newFactor, setNewFactor] = useState('');
  const [investigationNotes, setInvestigationNotes] = useState('');
  const [actionTaken, setActionTaken] = useState<'COD_RESTRICTED' | 'ACCOUNT_SUSPENDED' | 'PAYOUT_HELD' | 'KYC_MANUAL_REVIEW_REQUIRED' | 'NONE'>('COD_RESTRICTED');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState<RiskIncident | null>(null);

  if (!isOpen) return null;

  const COMMON_FACTORS = [
    'Repeated in-transit delivery cancellations',
    'Uncollected packages at pickup station',
    'Multiple payment chargebacks / reversals',
    'Suspicious device / location fingerprint change',
    'Counterfeit product report by customer',
    'High return rate (> 15%)',
    'GPS spoofing or route manipulation'
  ];

  const toggleFactor = (factor: string) => {
    if (selectedFactors.includes(factor)) {
      setSelectedFactors(prev => prev.filter(f => f !== factor));
    } else {
      setSelectedFactors(prev => [...prev, factor]);
    }
  };

  const handleAddCustomFactor = () => {
    if (!newFactor.trim()) return;
    if (!selectedFactors.includes(newFactor.trim())) {
      setSelectedFactors(prev => [...prev, newFactor.trim()]);
    }
    setNewFactor('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFactors.length === 0 && !investigationNotes.trim()) {
      alert('Please select at least one risk factor or provide investigation notes.');
      return;
    }

    setIsSubmitting(true);
    try {
      const incidentData = {
        entityType,
        entityId,
        entityReference,
        riskLevel,
        riskScore,
        factors: selectedFactors,
        investigationNotes: investigationNotes.trim(),
        actionTaken,
        status: actionTaken === 'NONE' ? 'MONITORING' : 'ACTION_REQUIRED'
      };

      const res = await api.createRiskIncident(incidentData);
      setSuccessResult(res.incident || incidentData);
      if (onSuccess) {
        onSuccess(res.incident || incidentData);
      }
    } catch (err: any) {
      console.error('Error logging risk incident:', err);
      const fallback: any = {
        id: `rsk-${Date.now()}`,
        incidentNumber: `RSK-TZ-${Math.floor(1000 + (window.crypto.getRandomValues(new Uint32Array(1))[0] % 9000))}`,
        entityType,
        entityId,
        entityReference,
        riskLevel,
        riskScore,
        factors: selectedFactors,
        actionTaken,
        status: 'ACTION_REQUIRED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setSuccessResult(fallback);
      if (onSuccess) onSuccess(fallback);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        >
          <X size={18} />
        </button>

        {successResult ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-50 border-2 border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Risk Incident & Action Registered</h3>
              <p className="text-xs text-slate-500 mt-1">
                Incident ID: <strong className="font-mono text-slate-800">{successResult.incidentNumber || successResult.id}</strong>
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-1.5 text-xs text-slate-700">
              <div><strong>Target:</strong> {entityType} ({entityReference})</div>
              <div><strong>Risk Level:</strong> <span className="text-rose-600 font-bold">{riskLevel} ({riskScore}/100)</span></div>
              <div><strong>Action Enforced:</strong> <span className="font-mono font-bold text-slate-900">{actionTaken}</span></div>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
              >
                Close & Return
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl">
                <Flag className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Risk & Fraud Flagging Panel</h3>
                <p className="text-xs text-slate-500">
                  Flagging {entityType}: <strong>{entityReference}</strong>
                </p>
              </div>
            </div>

            {/* Risk Level & Score */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Risk Severity</label>
                <select
                  value={riskLevel}
                  onChange={e => setRiskLevel(e.target.value as RiskLevel)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 bg-white"
                >
                  <option value="LOW">LOW RISK (0-30)</option>
                  <option value="MEDIUM">MEDIUM RISK (31-60)</option>
                  <option value="HIGH">HIGH RISK (61-85)</option>
                  <option value="CRITICAL">CRITICAL RISK (86-100)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Risk Score (0-100)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={riskScore}
                  onChange={e => setRiskScore(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold bg-white"
                />
              </div>
            </div>

            {/* Risk Factors Checklist */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">Identified Risk Indicators</label>
              <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                {COMMON_FACTORS.map((factor, idx) => {
                  const isChecked = selectedFactors.includes(factor);
                  return (
                    <label
                      key={idx}
                      className="flex items-center gap-2 p-1.5 hover:bg-white rounded-lg cursor-pointer transition text-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleFactor(factor)}
                        className="rounded text-rose-600 focus:ring-rose-500 w-3.5 h-3.5"
                      />
                      <span className={`text-[11px] ${isChecked ? 'font-bold text-slate-900' : ''}`}>
                        {factor}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Enforcement Action */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Enforcement Action to Apply</label>
              <select
                value={actionTaken}
                onChange={e => setActionTaken(e.target.value as any)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 bg-white"
              >
                <option value="COD_RESTRICTED">Lock Pay-on-Delivery (COD) & Require Online Payment</option>
                <option value="PAYOUT_HELD">Freeze Escrow Payouts to Merchant/Rider</option>
                <option value="KYC_MANUAL_REVIEW_REQUIRED">Require Manual Re-verification & Identity Check</option>
                <option value="ACCOUNT_SUSPENDED">Suspend Account & Immediate Access Revocation</option>
                <option value="NONE">No Action (Passive Monitoring Only)</option>
              </select>
            </div>

            {/* Investigation Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Investigation & Audit Notes
              </label>
              <textarea
                rows={2}
                value={investigationNotes}
                onChange={e => setInvestigationNotes(e.target.value)}
                placeholder="Details of audit findings, customer communications, or courier report..."
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 bg-white"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldAlert size={14} />
                <span>Enforce Risk Action</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { BuilderModal } from '../../../components/builder/BuilderModal';
import { SearchableSelect, SelectOption } from '../../../components/common/SearchableSelect';

export const BENEFICIARY_TYPES: SelectOption[] = [
  { value: 'SELLER', label: 'Seller Marketplace Commission (LUMO Take-Rate)', group: 'Beneficiary Role' },
  { value: 'RIDER', label: 'Rider Delivery Earnings & Surcharges', group: 'Beneficiary Role' },
  { value: 'PICKUP_STATION', label: 'Pickup Station Handling Commission', group: 'Beneficiary Role' },
  { value: 'SALESPERSON', label: 'Salesperson Acquisition Commission', group: 'Beneficiary Role' }
];

export const CALCULATION_METHODS: SelectOption[] = [
  { value: 'PERCENTAGE', label: 'Percentage of Order Value (%)', group: 'Calculation Logic' },
  { value: 'FIXED_FLAT', label: 'Fixed Flat Amount (TZS)', group: 'Calculation Logic' },
  { value: 'TIERED_VOLUME', label: 'Tiered Volume-Based Rate', group: 'Calculation Logic' },
  { value: 'DISTANCE_BASED', label: 'Distance-Based Rate (TZS / KM)', group: 'Logistics Calculations' },
  { value: 'ZONE_BASED', label: 'Zone-Based Flat Rate', group: 'Logistics Calculations' },
  { value: 'PEAK_SURCHARGE', label: 'Peak Period Surge Multiplier (1.25x)', group: 'Surge Calculations' },
  { value: 'HYBRID', label: 'Hybrid (Base Flat Fee + Percentage)', group: 'Calculation Logic' }
];

export const QUALIFICATION_TRIGGERS: SelectOption[] = [
  { value: 'ESCROW_RELEASED', label: 'Escrow Released (OTP Verified)', group: 'Standard Release' },
  { value: 'ORDER_DELIVERED', label: 'Order Successfully Delivered', group: 'Logistics Trigger' },
  { value: 'PACKAGE_COLLECTED_AT_STATION', label: 'Customer Package Collected at Pickup Point', group: 'Pickup Trigger' },
  { value: 'VENDOR_FIRST_SALE', label: 'Referred Vendor Completes First Sale', group: 'Sales Trigger' },
  { value: 'RETURN_WINDOW_EXPIRED', label: '7-Day Return Window Expired with No Dispute', group: 'Safety Trigger' }
];

const BasicSection = ({ data, onChange }: any) => {
  const beneficiary = data.beneficiary || 'SELLER';
  const calculationMethod = data.calculationMethod || 'PERCENTAGE';

  return (
    <div className="space-y-4 text-xs">
      <h4 className="font-bold text-slate-800 text-base mb-2">1. Commission & Settlement Identity</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Beneficiary Entity</label>
          <SearchableSelect
            options={BENEFICIARY_TYPES}
            value={beneficiary}
            onChange={val => onChange({ beneficiary: val, targetType: val })}
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Rule Name</label>
          <input
            type="text"
            value={data.name || ''}
            onChange={e => onChange({ name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
            placeholder="e.g. Standard Electronics Take-Rate or Rider Distance Split"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Calculation Method</label>
          <SearchableSelect
            options={CALCULATION_METHODS}
            value={calculationMethod}
            onChange={val => onChange({ calculationMethod: val })}
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            {calculationMethod === 'PERCENTAGE'
              ? 'Commission Rate (%)'
              : calculationMethod === 'DISTANCE_BASED'
              ? 'Fee Per Kilometer (TZS / KM)'
              : 'Fixed Amount / Base Rate (TZS)'}
          </label>
          <input
            type="number"
            value={data.rate || 10}
            onChange={e => onChange({ rate: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
            placeholder="10"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Target Category / Scope</label>
          <input
            type="text"
            value={data.category || 'All Marketplace Categories'}
            onChange={e => onChange({ category: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
            placeholder="e.g. Phones & Tablets, or Kariakoo Zone"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Qualification Release Trigger</label>
          <SearchableSelect
            options={QUALIFICATION_TRIGGERS}
            value={data.qualificationTrigger || 'ESCROW_RELEASED'}
            onChange={val => onChange({ qualificationTrigger: val })}
          />
        </div>
      </div>

      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 mt-2">
        <p className="font-bold text-slate-900 text-xs">💡 Automated Calculation Formula Preview:</p>
        <p className="font-mono text-[11px] text-blue-700">
          {beneficiary === 'SELLER'
            ? `Seller Net Payout = Order Total - (${data.rate || 10}% Commission)`
            : beneficiary === 'RIDER'
            ? `Rider Credit = Base Fee (TZS ${(Number(data.rate) || 3500).toLocaleString()}) + Distance Rate + Peak Multiplier`
            : beneficiary === 'PICKUP_STATION'
            ? `Station Partner Credit = Fixed Handling Fee (TZS ${(Number(data.rate) || 1500).toLocaleString()}) per Verified Package`
            : `Salesperson Commission = ${data.rate || 5}% of Onboarded Vendor 30-Day GMV`}
        </p>
      </div>
    </div>
  );
};

export const CommissionRuleModal: React.FC<any> = ({ isOpen, onClose, onSave, initialData }) => {
  return (
    <BuilderModal
      title={initialData?.id ? 'Edit Commission & Settlement Rule' : 'Create Commission Rule'}
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      initialData={initialData || { name: '', beneficiary: 'SELLER', calculationMethod: 'PERCENTAGE', rate: 10, category: 'All Categories' }}
      sections={[
        { id: 'basic', label: 'Rule Specification', component: BasicSection }
      ]}
    />
  );
};

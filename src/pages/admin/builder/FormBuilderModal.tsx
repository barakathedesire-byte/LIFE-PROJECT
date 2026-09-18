import React, { useState } from 'react';
import { BuilderModal } from '../../../components/builder/BuilderModal';
import { SearchableSelect } from '../../../components/common/SearchableSelect';
import { Plus, Trash2, ArrowUp, ArrowDown, Layout, Settings } from 'lucide-react';

export const FORM_TYPES = [
  'Buyer Registration',
  'Vendor Registration',
  'Vendor Store Setup',
  'KYC Verification',
  'Product Creation',
  'Product Quick Edit',
  'Checkout Address',
  'Checkout Payment',
  'Return Request',
  'Refund Claim',
  'Support Ticket',
  'Contact Us',
  'Review Submission',
  'Rating Submission',
  'Delivery Address',
  'Pickup Station Selector',
  'Rider Registration',
  'Sales Representative Registration',
  'Commission Payout Request',
  'Coupon Creation',
  'Flash Sale Setup',
  'Banner Ad Setup',
  'Custom Survey',
  'Feedback Form',
  'Employee Onboarding',
  'Warehouse Stock Adjustment',
  'Live Commerce Setup',
  'B2B Quotation Request',
  'Custom Form',
  'Generic Data Capture'
];

export const FORM_COMPONENT_TYPES = [
  'Text',
  'Textarea',
  'Number',
  'Currency',
  'Percentage',
  'Email',
  'Phone',
  'Password',
  'Date',
  'Date/time',
  'Time',
  'Dropdown',
  'Multi-select',
  'Radio',
  'Checkbox',
  'Toggle',
  'File',
  'Image',
  'Video',
  'Address',
  'Location',
  'Map',
  'Product selector',
  'Category selector',
  'Vendor selector',
  'Buyer selector',
  'Salesperson selector',
  'Order selector',
  'Warehouse selector',
  'Delivery selector',
  'Status selector',
  'Rich text',
  'Signature',
  'Rating',
  'OTP',
  'CAPTCHA',
  'Divider',
  'Heading',
  'Section',
  'Tabs'
];

const FORM_PRESETS: Record<string, any[]> = {
  'Vendor Registration': [
    { id: 'f1', type: 'Text', label: 'Business / Company Name', required: true, placeholder: 'e.g. Swahili Tech Hub Ltd' },
    { id: 'f2', type: 'Email', label: 'Business Email Address', required: true, placeholder: 'vendor@swahili.co.tz' },
    { id: 'f3', type: 'Phone', label: 'Phone Number', required: true, placeholder: '+255 700 000 000' },
    { id: 'f4', type: 'Category selector', label: 'Primary Business Category', required: true },
    { id: 'f5', type: 'File', label: 'Business Registration / TIN Certificate', required: true }
  ],
  'Return Request': [
    { id: 'f1', type: 'Order selector', label: 'Select Original Order', required: true },
    { id: 'f2', type: 'Dropdown', label: 'Reason for Return', required: true, options: ['Damaged item', 'Wrong item received', 'Defective', 'Changed mind'] },
    { id: 'f3', type: 'Textarea', label: 'Detailed Description of Issue', required: true },
    { id: 'f4', type: 'Image', label: 'Upload Photo Proof of Damage', required: false }
  ],
  'Product Creation': [
    { id: 'f1', type: 'Text', label: 'Product Title', required: true },
    { id: 'f2', type: 'Category selector', label: 'Category', required: true },
    { id: 'f3', type: 'Currency', label: 'Retail Price (TZS)', required: true },
    { id: 'f4', type: 'Number', label: 'Stock Quantity', required: true },
    { id: 'f5', type: 'Image', label: 'Product Gallery Images', required: true }
  ]
};

const BasicSection = ({ data, onChange }: any) => {
  const formType = data.type || 'Vendor Registration';

  return (
    <div className="space-y-4 text-xs">
      <h4 className="font-bold text-slate-800 text-base mb-2">1. Form Identity & Predefined Type</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Form Name</label>
          <input
            type="text"
            value={data.name || ''}
            onChange={e => onChange({ name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
            placeholder="e.g. Vendor Registration Intake"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Predefined Form Type</label>
          <SearchableSelect
            options={FORM_TYPES}
            value={formType}
            onChange={val => {
              const presetFields = FORM_PRESETS[val] || [
                { id: 'f1', type: 'Text', label: 'Full Name', required: true },
                { id: 'f2', type: 'Email', label: 'Email Address', required: true }
              ];
              onChange({
                type: val,
                name: data.name || val,
                key: data.key || `form_${val.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
                fields: presetFields
              });
            }}
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Unique Key</label>
          <input
            type="text"
            value={data.key || ''}
            onChange={e => onChange({ key: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
            placeholder="e.g. form_vendor_reg"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Target Entity / Context</label>
          <input
            type="text"
            value={data.entity || 'Vendor'}
            onChange={e => onChange({ entity: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
          />
        </div>
      </div>

      <div>
        <label className="block font-semibold text-slate-700 mb-1">Purpose / Description</label>
        <textarea
          value={data.description || ''}
          onChange={e => onChange({ description: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          rows={2}
        />
      </div>
    </div>
  );
};

const DesignerSection = ({ data, onChange }: any) => {
  const fields = data.fields || [
    { id: 'f1', type: 'Text', label: 'Full Name', required: true },
    { id: 'f2', type: 'Email', label: 'Email Address', required: true }
  ];

  const addComponent = (compType: string) => {
    const newField = {
      id: `f-${Date.now()}`,
      type: compType,
      label: `New ${compType} Field`,
      required: false,
      placeholder: ''
    };
    onChange({ fields: [...fields, newField] });
  };

  const updateField = (index: number, key: string, val: any) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], [key]: val };
    onChange({ fields: updated });
  };

  const removeField = (index: number) => {
    onChange({ fields: fields.filter((_: any, i: number) => i !== index) });
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= fields.length) return;
    const updated = [...fields];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    onChange({ fields: updated });
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex justify-between items-center">
        <h4 className="font-bold text-slate-800 text-base">2. Form Layout & Field Designer</h4>
        <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200">
          {fields.length} Mapped Inputs
        </span>
      </div>

      {/* Palette selector */}
      <div>
        <label className="block font-bold text-slate-700 mb-1">Add Component from Predefined Library (38 Options)</label>
        <SearchableSelect
          options={FORM_COMPONENT_TYPES}
          value=""
          onChange={val => val && addComponent(val)}
          placeholder="+ Select component type to insert into form..."
        />
      </div>

      {/* Mapped Fields List */}
      <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
        {fields.map((field: any, idx: number) => (
          <div key={field.id} className="bg-white border border-slate-200 p-3 rounded-lg shadow-2xs space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded text-[10px] uppercase font-mono">
                #{idx + 1} {field.type}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveField(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveField(idx, 'down')}
                  disabled={idx === fields.length - 1}
                  className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeField(idx)}
                  className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Field Label</label>
                <input
                  type="text"
                  value={field.label}
                  onChange={e => updateField(idx, 'label', e.target.value)}
                  className="w-full px-2 py-1 border border-slate-300 rounded font-semibold text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Required</label>
                <label className="flex items-center gap-1 mt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(field.required)}
                    onChange={e => updateField(idx, 'required', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="font-bold text-slate-700">Mandatory</span>
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const FormBuilderModal: React.FC<any> = ({ isOpen, onClose, onSave, initialData }) => {
  return (
    <BuilderModal
      title={initialData?.id ? 'Edit Form Configuration' : 'Create Dynamic Form'}
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      initialData={initialData || { name: '', type: 'Vendor Registration', fields: FORM_PRESETS['Vendor Registration'] }}
      sections={[
        { id: 'basic', label: 'Form Identity', component: BasicSection },
        { id: 'designer', label: 'Field Designer', component: DesignerSection }
      ]}
    />
  );
};

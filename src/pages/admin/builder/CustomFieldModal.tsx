import React, { useState, useEffect } from 'react';
import { BuilderModal } from '../../../components/builder/BuilderModal';
import {
  CustomFieldDefinition,
  CustomFieldScope,
  CustomFieldType,
  CustomFieldOption,
  CustomFieldValidationRules,
  CustomFieldVisibility
} from '../../../types';
import {
  Plus,
  Trash2,
  AlertCircle,
  HelpCircle,
  Eye,
  Lock,
  Sparkles,
  Sliders,
  CheckCircle2
} from 'lucide-react';

const FIELD_TYPE_GROUPS: { group: string; types: CustomFieldType[] }[] = [
  {
    group: 'Text',
    types: ['Short text', 'Long text', 'Rich text']
  },
  {
    group: 'Numeric',
    types: ['Number', 'Decimal', 'Currency (TZS)', 'Percentage (%)']
  },
  {
    group: 'Date & Time',
    types: ['Date', 'Time', 'Date & Time', 'Date Range']
  },
  {
    group: 'Boolean',
    types: ['Yes/No', 'Toggle Switch']
  },
  {
    group: 'Selection & Choice',
    types: ['Dropdown Single-Select', 'Multi-Select', 'Radio Buttons', 'Checkbox Group']
  },
  {
    group: 'Contact Details',
    types: ['Email Address', 'Phone Number', 'Website URL']
  },
  {
    group: 'Location & Geography',
    types: ['Physical Address', 'Country', 'Region / Province', 'City / District', 'GPS Coordinates']
  },
  {
    group: 'Identification & Compliance',
    types: ['NIDA / ID Number', 'Passport Number', 'BRELA Registration No', 'Tax ID (TIN)']
  },
  {
    group: 'File Attachments',
    types: ['Single File', 'Multiple Files', 'Image Upload', 'PDF Document']
  },
  {
    group: 'Financial & Banking',
    types: ['Monetary Amount', 'Payment Reference', 'Bank Account Details']
  },
  {
    group: 'Entity Relationships',
    types: [
      'Customer Selector',
      'Seller Selector',
      'Product Selector',
      'Order Selector',
      'Rider Selector',
      'Warehouse Selector',
      'Pickup Station Selector',
      'Salesperson Selector'
    ]
  },
  {
    group: 'System & Audit',
    types: ['Auto-generated ID', 'Timestamp', 'Created By', 'Updated By', 'System Status']
  },
  {
    group: 'Advanced & Formulas',
    types: ['Formula / Calculated', 'Computed Value', 'JSON Data Object', 'API-Sourced Value']
  }
];

const SCOPES: { id: CustomFieldScope; label: string; desc: string }[] = [
  { id: 'Vendor', label: 'Vendor / Seller Fields', desc: 'Custom KYC, business attributes, seller tier, warehouse drop preferences' },
  { id: 'Product', label: 'Product Catalog Fields', desc: 'Category specifications, technical attributes, dimensions, warranty rules' },
  { id: 'Buyer', label: 'Buyer / Customer Fields', desc: 'Delivery preferences, customer segment, tax numbers, profile extras' },
  { id: 'Order', label: 'Order & Fulfillment Fields', desc: 'Special dispatch notes, internal operational tags, gift wrap, logistics flags' },
  { id: 'Rider', label: 'Rider / Delivery Fields', desc: 'Vehicle capacity, delivery zones, gear checklist, shift classification' },
  { id: 'Warehouse', label: 'Warehouse Storage Fields', desc: 'Bin codes, temperature requirements, hazardous flags' },
  { id: 'PickupStation', label: 'Pickup Station Fields', desc: 'Locker capacity, operating hours, hub manager contacts' },
  { id: 'SupportTicket', label: 'Support & Dispute Fields', desc: 'Escalation tags, fraud indicators, root cause markers' }
];

export interface CustomFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (field: CustomFieldDefinition, status: string) => void;
  initialData?: Partial<CustomFieldDefinition>;
  existingKeys?: string[];
}

export const CustomFieldModal: React.FC<CustomFieldModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  existingKeys = []
}) => {
  const [formData, setFormData] = useState<Partial<CustomFieldDefinition>>({
    id: initialData?.id || `cf-${Date.now()}`,
    name: initialData?.name || '',
    key: initialData?.key || '',
    scope: initialData?.scope || (initialData?.entity as CustomFieldScope) || 'Vendor',
    entity: initialData?.entity || initialData?.scope || 'Vendor',
    type: initialData?.type || 'Short text',
    description: initialData?.description || '',
    required: initialData?.required ?? false,
    defaultValue: initialData?.defaultValue || '',
    placeholder: initialData?.placeholder || '',
    validation: initialData?.validation || {
      minLength: undefined,
      maxLength: undefined,
      minValue: undefined,
      maxValue: undefined,
      regexPattern: '',
      allowedExtensions: ['jpg', 'png', 'pdf'],
      maxFileSizeMb: 10
    },
    options: initialData?.options || [
      { label: 'Option 1', value: 'opt_1' },
      { label: 'Option 2', value: 'opt_2' }
    ],
    visibility: initialData?.visibility || {
      searchable: true,
      filterable: true,
      sortable: false,
      customerVisible: true,
      sellerVisible: true,
      operationsVisible: true,
      adminVisible: true
    },
    active: initialData?.active ?? true,
    status: initialData?.status || 'PUBLISHED'
  });

  const [keyManuallyEdited, setKeyManuallyEdited] = useState(false);
  const [keyError, setKeyError] = useState('');
  const [newOptionLabel, setNewOptionLabel] = useState('');
  const [newOptionValue, setNewOptionValue] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        scope: initialData.scope || (initialData.entity as CustomFieldScope) || 'Vendor',
        entity: initialData.entity || initialData.scope || 'Vendor',
        type: initialData.type || 'Short text',
        validation: initialData.validation || {},
        visibility: initialData.visibility || {
          searchable: true,
          filterable: true,
          sortable: false,
          customerVisible: true,
          sellerVisible: true,
          operationsVisible: true,
          adminVisible: true
        },
        options: initialData.options || [
          { label: 'Option 1', value: 'opt_1' },
          { label: 'Option 2', value: 'opt_2' }
        ]
      });
      if (initialData.key) {
        setKeyManuallyEdited(true);
      }
    }
  }, [initialData]);

  // Auto-generate key from name if not manually edited
  const handleNameChange = (name: string) => {
    const sanitizedKey = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

    setFormData(prev => ({
      ...prev,
      name,
      key: keyManuallyEdited ? prev.key : `${(prev.scope || 'vendor').toLowerCase()}_${sanitizedKey}`
    }));

    validateKey(keyManuallyEdited ? (formData.key || '') : `${(formData.scope || 'vendor').toLowerCase()}_${sanitizedKey}`);
  };

  const handleKeyChange = (rawKey: string) => {
    setKeyManuallyEdited(true);
    const sanitizedKey = rawKey
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '');

    setFormData(prev => ({ ...prev, key: sanitizedKey }));
    validateKey(sanitizedKey);
  };

  const validateKey = (key: string) => {
    if (!key) {
      setKeyError('Field key is required');
      return;
    }
    const isDuplicate = existingKeys.some(
      k => k.toLowerCase() === key.toLowerCase() && k.toLowerCase() !== initialData?.key?.toLowerCase()
    );
    if (isDuplicate) {
      setKeyError('This field key is already in use for this entity.');
    } else {
      setKeyError('');
    }
  };

  const handleScopeChange = (scope: CustomFieldScope) => {
    setFormData(prev => {
      const sanitizedName = (prev.name || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      const newKey = keyManuallyEdited ? prev.key : `${scope.toLowerCase()}_${sanitizedName || 'field'}`;
      return {
        ...prev,
        scope,
        entity: scope,
        key: newKey
      };
    });
  };

  const addOption = () => {
    if (!newOptionLabel.trim()) return;
    const value = newOptionValue.trim() || newOptionLabel.toLowerCase().replace(/[^a-z0-9]/g, '_');
    setFormData(prev => ({
      ...prev,
      options: [...(prev.options || []), { label: newOptionLabel.trim(), value }]
    }));
    setNewOptionLabel('');
    setNewOptionValue('');
  };

  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: (prev.options || []).filter((_, idx) => idx !== index)
    }));
  };

  const isSelectionType = [
    'Dropdown Single-Select',
    'Multi-Select',
    'Radio Buttons',
    'Checkbox Group'
  ].includes(formData.type as string);

  const isNumericType = [
    'Number',
    'Decimal',
    'Currency (TZS)',
    'Percentage (%)'
  ].includes(formData.type as string);

  const isTextType = [
    'Short text',
    'Long text',
    'Rich text'
  ].includes(formData.type as string);

  const isFileType = [
    'Single File',
    'Multiple Files',
    'Image Upload',
    'PDF Document'
  ].includes(formData.type as string);

  const handleModalSave = (data: any, status: string) => {
    if (!formData.name?.trim()) {
      alert('Please provide a descriptive Field Name.');
      return;
    }
    if (keyError) {
      alert('Please resolve the field key error before saving.');
      return;
    }

    const payload: CustomFieldDefinition = {
      id: formData.id || `cf-${Date.now()}`,
      name: formData.name.trim(),
      key: formData.key || `${(formData.scope || 'vendor').toLowerCase()}_${Date.now()}`,
      scope: formData.scope || 'Vendor',
      entity: formData.scope || 'Vendor',
      type: formData.type || 'Short text',
      description: formData.description || '',
      required: Boolean(formData.required),
      defaultValue: formData.defaultValue,
      placeholder: formData.placeholder,
      validation: formData.validation || {},
      options: isSelectionType ? formData.options : undefined,
      visibility: formData.visibility || {
        searchable: true,
        filterable: true,
        sortable: false,
        customerVisible: true,
        sellerVisible: true,
        operationsVisible: true,
        adminVisible: true
      },
      active: status === 'PUBLISHED',
      status: status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
      updatedAt: new Date().toISOString()
    };

    onSave(payload, status);
  };

  // Section Components for BuilderModal
  const IdentitySection = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-base font-extrabold text-slate-900">1. Target Scope & Hierarchy</h4>
        <p className="text-xs text-slate-500 mt-0.5">Select the platform entity where this custom field will be injected.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
          {SCOPES.map(s => {
            const isSelected = formData.scope === s.id;
            return (
              <button
                type="button"
                key={s.id}
                onClick={() => handleScopeChange(s.id)}
                className={`p-3 text-left rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                    {s.label}
                  </span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                  {s.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Field Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name || ''}
            onChange={e => handleNameChange(e.target.value)}
            placeholder="e.g. Business Registration Number (BRELA)"
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Internal Unique Key <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={formData.key || ''}
              onChange={e => handleKeyChange(e.target.value)}
              placeholder="e.g. vendor_brela_number"
              className={`w-full px-3.5 py-2.5 border rounded-xl font-mono text-xs focus:ring-2 bg-white ${
                keyError ? 'border-rose-300 focus:ring-rose-400' : 'border-slate-300 focus:ring-blue-500'
              }`}
            />
          </div>
          {keyError ? (
            <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-semibold">
              <AlertCircle size={12} /> {keyError}
            </p>
          ) : (
            <p className="text-[10px] text-slate-400 mt-1">
              Programmatic variable key used in APIs, database queries, and automations.
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-800 mb-1">Field Description / Help Tooltip</label>
        <textarea
          rows={2}
          value={formData.description || ''}
          onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Guidance shown below the field to help merchants or customers input correct data..."
          className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-700 bg-white"
        />
      </div>
    </div>
  );

  const TypeConfigSection = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-xs font-extrabold text-slate-900 mb-1.5">
          Select Field Data Type <span className="text-rose-500">*</span>
        </label>
        <select
          value={formData.type || 'Short text'}
          onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as CustomFieldType }))}
          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-800 bg-white focus:ring-2 focus:ring-blue-500"
        >
          {FIELD_TYPE_GROUPS.map(grp => (
            <optgroup key={grp.group} label={`── ${grp.group.toUpperCase()} ──`}>
              {grp.types.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <p className="text-[11px] text-slate-500 mt-1">
          Currently configured as <strong>{formData.type}</strong>. The UI will render appropriate input controls, masks, and validators.
        </p>
      </div>

      {/* Dynamic Sub-Config based on Type */}
      {isSelectionType && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700">
              Dropdown / Choice Options
            </span>
            <span className="text-[11px] text-slate-400">{formData.options?.length || 0} Options Defined</span>
          </div>

          <div className="space-y-2">
            {(formData.options || []).map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
                <span className="w-5 text-center text-xs font-bold text-slate-400">{idx + 1}.</span>
                <input
                  type="text"
                  value={opt.label}
                  onChange={e => {
                    const updated = [...(formData.options || [])];
                    updated[idx].label = e.target.value;
                    setFormData(prev => ({ ...prev, options: updated }));
                  }}
                  className="flex-1 px-2.5 py-1 text-xs border border-slate-200 rounded-lg"
                  placeholder="Option Display Label"
                />
                <input
                  type="text"
                  value={opt.value}
                  onChange={e => {
                    const updated = [...(formData.options || [])];
                    updated[idx].value = e.target.value;
                    setFormData(prev => ({ ...prev, options: updated }));
                  }}
                  className="w-32 px-2.5 py-1 text-xs border border-slate-200 rounded-lg font-mono text-slate-600"
                  placeholder="Stored Key"
                />
                <button
                  type="button"
                  onClick={() => removeOption(idx)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
            <input
              type="text"
              value={newOptionLabel}
              onChange={e => setNewOptionLabel(e.target.value)}
              placeholder="New Option Label (e.g. Standard Organic)"
              className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white"
            />
            <input
              type="text"
              value={newOptionValue}
              onChange={e => setNewOptionValue(e.target.value)}
              placeholder="Code (optional)"
              className="w-32 px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white font-mono"
            />
            <button
              type="button"
              onClick={addOption}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-blue-700 transition"
            >
              <Plus size={14} /> Add
            </button>
          </div>
        </div>
      )}

      {/* Input Formatting & Defaults */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">Placeholder Text</label>
          <input
            type="text"
            value={formData.placeholder || ''}
            onChange={e => setFormData(prev => ({ ...prev, placeholder: e.target.value }))}
            placeholder="e.g. Enter 9-digit TIN"
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">Default Value</label>
          <input
            type="text"
            value={formData.defaultValue || ''}
            onChange={e => setFormData(prev => ({ ...prev, defaultValue: e.target.value }))}
            placeholder="Pre-populated value"
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
          />
        </div>
      </div>
    </div>
  );

  const ValidationSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
        <div>
          <span className="text-xs font-bold text-slate-900 block">Mandatory Field Requirement</span>
          <span className="text-[11px] text-slate-500">Prevent form submission when this field is left empty.</span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={formData.required || false}
            onChange={e => setFormData(prev => ({ ...prev, required: e.target.checked }))}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {isTextType && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Min Length (Characters)</label>
            <input
              type="number"
              value={formData.validation?.minLength ?? ''}
              onChange={e => setFormData(prev => ({
                ...prev,
                validation: { ...prev.validation, minLength: e.target.value ? Number(e.target.value) : undefined }
              }))}
              placeholder="e.g. 3"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Max Length (Characters)</label>
            <input
              type="number"
              value={formData.validation?.maxLength ?? ''}
              onChange={e => setFormData(prev => ({
                ...prev,
                validation: { ...prev.validation, maxLength: e.target.value ? Number(e.target.value) : undefined }
              }))}
              placeholder="e.g. 100"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
            />
          </div>
        </div>
      )}

      {isNumericType && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Minimum Numeric Value</label>
            <input
              type="number"
              value={formData.validation?.minValue ?? ''}
              onChange={e => setFormData(prev => ({
                ...prev,
                validation: { ...prev.validation, minValue: e.target.value ? Number(e.target.value) : undefined }
              }))}
              placeholder="e.g. 0"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Maximum Numeric Value</label>
            <input
              type="number"
              value={formData.validation?.maxValue ?? ''}
              onChange={e => setFormData(prev => ({
                ...prev,
                validation: { ...prev.validation, maxValue: e.target.value ? Number(e.target.value) : undefined }
              }))}
              placeholder="e.g. 10000000"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
            />
          </div>
        </div>
      )}

      {isFileType && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Max File Size (MB)</label>
            <input
              type="number"
              value={formData.validation?.maxFileSizeMb ?? 10}
              onChange={e => setFormData(prev => ({
                ...prev,
                validation: { ...prev.validation, maxFileSizeMb: Number(e.target.value) || 10 }
              }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Allowed Extensions (comma separated)</label>
            <input
              type="text"
              value={(formData.validation?.allowedExtensions || []).join(', ')}
              onChange={e => setFormData(prev => ({
                ...prev,
                validation: { ...prev.validation, allowedExtensions: e.target.value.split(',').map(s => s.trim().toLowerCase()).filter(Boolean) }
              }))}
              placeholder="jpg, png, pdf, docx"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
            />
          </div>
        </div>
      )}
    </div>
  );

  const VisibilitySection = () => (
    <div className="space-y-4">
      <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">Role & Storefront Visibility Matrix</h4>
      <p className="text-xs text-slate-500">Control which personas can view, search, or filter on this custom field attribute.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
          <input
            type="checkbox"
            checked={formData.visibility?.customerVisible ?? true}
            onChange={e => setFormData(prev => ({
              ...prev,
              visibility: { ...prev.visibility!, customerVisible: e.target.checked }
            }))}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <div>
            <span className="text-xs font-bold text-slate-900 block">Customer Visible</span>
            <span className="text-[10px] text-slate-400">Display on Marketplace product page & order summary</span>
          </div>
        </label>

        <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
          <input
            type="checkbox"
            checked={formData.visibility?.sellerVisible ?? true}
            onChange={e => setFormData(prev => ({
              ...prev,
              visibility: { ...prev.visibility!, sellerVisible: e.target.checked }
            }))}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <div>
            <span className="text-xs font-bold text-slate-900 block">Seller Hub Visible</span>
            <span className="text-[10px] text-slate-400">Available in Vendor catalog & onboarding manager</span>
          </div>
        </label>

        <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
          <input
            type="checkbox"
            checked={formData.visibility?.operationsVisible ?? true}
            onChange={e => setFormData(prev => ({
              ...prev,
              visibility: { ...prev.visibility!, operationsVisible: e.target.checked }
            }))}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <div>
            <span className="text-xs font-bold text-slate-900 block">Operations & Warehouse</span>
            <span className="text-[10px] text-slate-400">Visible on dispatch manifests and picker screens</span>
          </div>
        </label>

        <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
          <input
            type="checkbox"
            checked={formData.visibility?.searchable ?? true}
            onChange={e => setFormData(prev => ({
              ...prev,
              visibility: { ...prev.visibility!, searchable: e.target.checked, filterable: e.target.checked }
            }))}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <div>
            <span className="text-xs font-bold text-slate-900 block">Searchable & Filterable</span>
            <span className="text-[10px] text-slate-400">Indexed in marketplace faceted navigation & search engine</span>
          </div>
        </label>
      </div>
    </div>
  );

  return (
    <BuilderModal
      title={initialData?.id && initialData.name ? `Edit Field: ${initialData.name}` : `Create New ${formData.scope || 'Custom'} Field`}
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleModalSave}
      initialData={formData}
      sections={[
        { id: 'identity', label: '1. Identity & Scope', component: IdentitySection },
        { id: 'type_config', label: '2. Type & Data Options', component: TypeConfigSection },
        { id: 'validation', label: '3. Rules & Validation', component: ValidationSection },
        { id: 'visibility', label: '4. Permissions & Visibility', component: VisibilitySection }
      ]}
    />
  );
};

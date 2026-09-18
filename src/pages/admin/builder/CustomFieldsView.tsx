import React, { useState, useMemo } from 'react';
import { useBuilderConfig } from '../../../hooks/useBuilderConfig';
import {
  Plus,
  Database,
  Search,
  Settings,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  Sliders,
  Shield,
  Layers,
  ArrowUpDown,
  FileCode,
  Sparkles,
  HelpCircle,
  Filter
} from 'lucide-react';
import { CustomFieldModal } from './CustomFieldModal';
import { CustomFieldDefinition, CustomFieldScope } from '../../../types';
import { api } from '../../../services/api';

const DEFAULT_CUSTOM_FIELDS: CustomFieldDefinition[] = [
  {
    id: 'cf-v1',
    name: 'Business Registration Number (BRELA)',
    key: 'vendor_brela_reg_number',
    scope: 'Vendor',
    entity: 'Vendor',
    type: 'BRELA Registration No',
    description: 'Mandatory Tanzanian company registration number for compliance verification',
    required: true,
    validation: { minLength: 6, maxLength: 20 },
    visibility: {
      searchable: true,
      filterable: true,
      sortable: true,
      customerVisible: false,
      sellerVisible: true,
      operationsVisible: true,
      adminVisible: true
    },
    active: true,
    status: 'PUBLISHED'
  },
  {
    id: 'cf-v2',
    name: 'Taxpayer Identification Number (TIN)',
    key: 'vendor_tin_number',
    scope: 'Vendor',
    entity: 'Vendor',
    type: 'Tax ID (TIN)',
    description: '9-digit TRA TIN certificate number for tax clearance',
    required: true,
    validation: { minLength: 9, maxLength: 11 },
    visibility: {
      searchable: true,
      filterable: true,
      sortable: false,
      customerVisible: false,
      sellerVisible: true,
      operationsVisible: true,
      adminVisible: true
    },
    active: true,
    status: 'PUBLISHED'
  },
  {
    id: 'cf-p1',
    name: 'Manufacturer Warranty Period',
    key: 'product_warranty_months',
    scope: 'Product',
    entity: 'Product',
    type: 'Dropdown Single-Select',
    description: 'Official manufacturer warranty duration in months',
    required: false,
    validation: {},
    options: [
      { label: 'No Warranty', value: '0_months' },
      { label: '6 Months Local Warranty', value: '6_months' },
      { label: '12 Months Official Warranty', value: '12_months' },
      { label: '24 Months Extended Warranty', value: '24_months' }
    ],
    visibility: {
      searchable: true,
      filterable: true,
      sortable: true,
      customerVisible: true,
      sellerVisible: true,
      operationsVisible: true,
      adminVisible: true
    },
    active: true,
    status: 'PUBLISHED'
  },
  {
    id: 'cf-b1',
    name: 'Customer Delivery Landmark',
    key: 'buyer_delivery_landmark',
    scope: 'Buyer',
    entity: 'Buyer',
    type: 'Physical Address',
    description: 'Prominent nearby building, church, mosque, or pharmacy to guide couriers',
    required: false,
    placeholder: 'e.g. Near Mlimani City Gate 2',
    validation: { maxLength: 120 },
    visibility: {
      searchable: true,
      filterable: false,
      sortable: false,
      customerVisible: true,
      sellerVisible: false,
      operationsVisible: true,
      adminVisible: true
    },
    active: true,
    status: 'PUBLISHED'
  },
  {
    id: 'cf-o1',
    name: 'Special Delivery Instructions / Gate Code',
    key: 'order_gate_passcode',
    scope: 'Order',
    entity: 'Order',
    type: 'Short text',
    description: 'Security gate access code or drop-off guard instructions',
    required: false,
    validation: { maxLength: 80 },
    visibility: {
      searchable: false,
      filterable: false,
      sortable: false,
      customerVisible: true,
      sellerVisible: false,
      operationsVisible: true,
      adminVisible: true
    },
    active: true,
    status: 'PUBLISHED'
  },
  {
    id: 'cf-r1',
    name: 'Driver License Number (LATRA / Police)',
    key: 'rider_driver_license_no',
    scope: 'Rider',
    entity: 'Rider',
    type: 'NIDA / ID Number',
    description: 'Class A/B Motorbike Driver License verified for commercial dispatch',
    required: true,
    validation: { minLength: 8, maxLength: 16 },
    visibility: {
      searchable: true,
      filterable: true,
      sortable: false,
      customerVisible: false,
      sellerVisible: false,
      operationsVisible: true,
      adminVisible: true
    },
    active: true,
    status: 'PUBLISHED'
  }
];

const SCOPES: { id: CustomFieldScope | 'ALL'; label: string; countBadge?: string }[] = [
  { id: 'ALL', label: 'All Scopes' },
  { id: 'Vendor', label: 'Vendors / Sellers' },
  { id: 'Product', label: 'Products' },
  { id: 'Buyer', label: 'Buyers / Customers' },
  { id: 'Order', label: 'Orders & Logistics' },
  { id: 'Rider', label: 'Riders & Fleets' },
  { id: 'Warehouse', label: 'Warehouses' },
  { id: 'PickupStation', label: 'Pickup Stations' },
  { id: 'SupportTicket', label: 'Support & Disputes' }
];

export const CustomFieldsView: React.FC = () => {
  const { data: activeEntity, updateConfig: setActiveEntity } = useBuilderConfig<CustomFieldScope | 'ALL'>('customFieldsEntity', 'ALL');
  const { data: fields, updateConfig: setFields } = useBuilderConfig<CustomFieldDefinition[]>('customFields', DEFAULT_CUSTOM_FIELDS);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingField, setEditingField] = useState<CustomFieldDefinition | null>(null);
  const [fieldToDelete, setFieldToDelete] = useState<CustomFieldDefinition | null>(null);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const safeFields: CustomFieldDefinition[] = Array.isArray(fields) && fields.length > 0 ? fields : DEFAULT_CUSTOM_FIELDS;

  const showToast = (msg: string) => {
    setFeedbackNotice(msg);
    setTimeout(() => setFeedbackNotice(null), 3500);
  };

  const filteredFields = useMemo(() => {
    return safeFields.filter(f => {
      const matchesScope = activeEntity === 'ALL' || f.scope === activeEntity || f.entity === activeEntity;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        f.name.toLowerCase().includes(q) ||
        f.key.toLowerCase().includes(q) ||
        (f.description && f.description.toLowerCase().includes(q)) ||
        f.type.toLowerCase().includes(q);
      return matchesScope && matchesSearch;
    });
  }, [safeFields, activeEntity, searchQuery]);

  const toggleFieldActive = (id: string) => {
    const updated = safeFields.map(f => {
      if (f.id === id) {
        const nextActive = !f.active;
        showToast(`Field "${f.name}" is now ${nextActive ? 'Active' : 'Disabled'}`);
        return { ...f, active: nextActive, status: (nextActive ? 'PUBLISHED' : 'DRAFT') as 'PUBLISHED' | 'DRAFT' };
      }
      return f;
    });
    setFields(updated);
  };

  const handleDeleteConfirm = () => {
    if (!fieldToDelete) return;
    const updated = safeFields.filter(f => f.id !== fieldToDelete.id);
    setFields(updated);
    showToast(`Custom field "${fieldToDelete.name}" deleted successfully.`);
    setFieldToDelete(null);
  };

  const handleSaveModal = (data: CustomFieldDefinition, status: string) => {
    let updatedList = [...safeFields];
    if (editingField) {
      updatedList = updatedList.map(f => f.id === data.id ? data : f);
      showToast(`Updated custom field "${data.name}"`);
    } else {
      updatedList.unshift(data);
      showToast(`Created new custom field "${data.name}" in ${data.scope}`);
    }
    setFields(updatedList);
    setShowModal(false);
    setEditingField(null);
  };

  const existingKeys = useMemo(() => safeFields.map(f => f.key), [safeFields]);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Toast Feedback */}
      {feedbackNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{feedbackNotice}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Custom Fields Engine
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Declare, validate, and dynamically bind custom metadata attributes across all platform entities.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setEditingField(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Field {activeEntity !== 'ALL' ? `to ${activeEntity}` : ''}
          </button>
        </div>
      </div>

      {/* Scope Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {SCOPES.map(s => {
          const isSelected = activeEntity === s.id;
          const count = s.id === 'ALL'
            ? safeFields.length
            : safeFields.filter(f => f.scope === s.id || f.entity === s.id).length;

          return (
            <button
              key={s.id}
              onClick={() => setActiveEntity(s.id)}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{s.label}</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-black ${
                isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search fields by name, key, or data type..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
          />
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <span>Showing <strong>{filteredFields.length}</strong> of <strong>{safeFields.length}</strong> fields</span>
        </div>
      </div>

      {/* Fields Data Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold text-[10px]">
              <tr>
                <th className="py-3 px-4">Field Name & Key</th>
                <th className="py-3 px-4">Scope</th>
                <th className="py-3 px-4">Data Type</th>
                <th className="py-3 px-4">Validation</th>
                <th className="py-3 px-4">Visibility Matrix</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFields.map(field => {
                const isMandatory = field.required;
                return (
                  <tr key={field.id} className="hover:bg-slate-50/60 transition group">
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                          {field.name}
                          {isMandatory && (
                            <span className="text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded font-black">
                              *Required
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          {field.key}
                        </div>
                        {field.description && (
                          <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                            {field.description}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-100">
                        {field.scope || field.entity}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-700 font-semibold">
                      <span className="bg-slate-100 px-2 py-1 rounded-md text-[11px]">
                        {field.type}
                      </span>
                      {Array.isArray(field.options) && field.options.length > 0 && (
                        <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                          {field.options.length} options defined
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="space-y-0.5 text-[11px]">
                        {field.validation?.minLength && (
                          <div>Min: {field.validation.minLength} chars</div>
                        )}
                        {field.validation?.maxLength && (
                          <div>Max: {field.validation.maxLength} chars</div>
                        )}
                        {field.validation?.minValue !== undefined && (
                          <div>Min val: {field.validation.minValue}</div>
                        )}
                        {!field.validation?.minLength && !field.validation?.maxLength && !field.validation?.minValue && (
                          <span className="text-slate-400 font-sans">Default rules</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          title={field.visibility?.customerVisible ? 'Customer Visible' : 'Customer Hidden'}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            field.visibility?.customerVisible ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          BUYER
                        </span>
                        <span
                          title={field.visibility?.sellerVisible ? 'Seller Hub Visible' : 'Seller Hub Hidden'}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            field.visibility?.sellerVisible ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          SELLER
                        </span>
                        <span
                          title={field.visibility?.operationsVisible ? 'Operations Visible' : 'Operations Hidden'}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            field.visibility?.operationsVisible ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          OPS
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => toggleFieldActive(field.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase cursor-pointer transition ${
                          field.active
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${field.active ? 'bg-emerald-600' : 'bg-slate-400'}`}></span>
                        {field.active ? 'Active' : 'Disabled'}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex justify-end items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingField(field);
                            setShowModal(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          title="Edit Custom Field"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setFieldToDelete(field)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Delete Custom Field"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredFields.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500">
                    <Database className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="font-bold text-slate-700">No custom fields found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {searchQuery
                        ? `No fields match query "${searchQuery}" in ${activeEntity}`
                        : `No custom fields configured for ${activeEntity}. Click "Add Field" to create one.`}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {fieldToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">Delete Custom Field?</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Are you sure you want to permanently delete <strong>"{fieldToDelete.name}"</strong> (<code>{fieldToDelete.key}</code>)? Any stored data referencing this key will no longer be visible on forms.
            </p>
            <div className="flex items-center justify-end gap-2.5 mt-6">
              <button
                type="button"
                onClick={() => setFieldToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition cursor-pointer shadow-xs"
              >
                Delete Field
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <CustomFieldModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingField(null);
          }}
          onSave={handleSaveModal}
          initialData={editingField || { scope: activeEntity === 'ALL' ? 'Vendor' : activeEntity }}
          existingKeys={existingKeys}
        />
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useBuilderConfig } from '../../../hooks/useBuilderConfig';

import { FileText, Plus, Settings, Trash2, X } from 'lucide-react';
import { FormBuilderModal } from './FormBuilderModal';

interface FormTemplate {
  id: string;
  name: string;
  type: string;
  fields: number;
  status: string;
}

const initialForms: FormTemplate[] = [
  { id: 'frm-1', name: 'Vendor Onboarding (Standard)', type: 'Registration', fields: 12, status: 'PUBLISHED' },
  { id: 'frm-2', name: 'Vendor KYC Compliance', type: 'Verification', fields: 5, status: 'PUBLISHED' },
  { id: 'frm-3', name: 'Customer Return Request', type: 'Support', fields: 6, status: 'PUBLISHED' },
  { id: 'frm-4', name: 'Field Sales Lead Generation', type: 'Internal', fields: 4, status: 'Draft' }
];

export const FormBuilderView = () => {
  const { data: forms, updateConfig: setForms, isSaving } = useBuilderConfig('formBuilder', initialForms);
  const [showModal, setShowModal] = useState(false);
  const [editingForm, setEditingForm] = useState<any>(null);
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('Registration');

  
  const handleSaveModal = (data: any, status: string) => {
    const newForm = { ...data, status };
    if (!newForm.id) {
      newForm.id = `frm-${Date.now()}`;
      newForm.fields = newForm.fields || 0;
    }
    
    let newForms = [...forms];
    if (editingForm) {
      newForms = newForms.map(f => f.id === newForm.id ? newForm : f);
    } else {
      newForms.push(newForm);
    }
    
    setForms(newForms, `Updated form ${newForm.name}`);
    setShowModal(false);
    setEditingForm(null);
  };

  const handleCreateForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    const newForm: FormTemplate = {
      id: `frm-${Date.now()}`,
      name: formName,
      type: formType,
      fields: 4,
      status: 'PUBLISHED'
    };
    setForms([newForm, ...forms]);
    setFormName('');
    setShowModal(false);
    alert(`Form "${formName}" successfully created and ready for intake!`);
  };

  const deleteForm = (id: string) => {
    if (confirm('Are you sure you want to delete this form template?')) {
      setForms(forms.filter(f => f.id !== id));
      alert('Form deleted successfully.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Dynamic Form Builder</h2>
          <p className="text-sm text-slate-500">Design intake forms, onboarding steps, and compliance docs visually.</p>
        </div>
        <button
          onClick={() => { setEditingForm(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" /> Create Form
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
         <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Form Name</th>
                <th className="py-3 px-4">Use Case / Type</th>
                <th className="py-3 px-4">Fields</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {forms.map(form => (
                <tr key={form.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">{form.name}</td>
                  <td className="py-3 px-4 text-slate-600 font-mono">{form.type}</td>
                  <td className="py-3 px-4 text-slate-700">{form.fields} mapped inputs</td>
                  <td className="py-3 px-4">
                     <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                       form.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                     }`}>
                       {form.status}
                     </span>
                  </td>
                  <td className="py-3 px-4 text-right flex items-center justify-end gap-2">
                    <button
                      onClick={() => { setEditingForm(form); setShowModal(true); }}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition cursor-pointer"
                      title="Configure"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteForm(form.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>

            <FormBuilderModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveModal}
        initialData={editingForm || {}}
      />
    </div>
  );
};


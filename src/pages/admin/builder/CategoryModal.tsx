import React from 'react';
import { BuilderModal } from '../../../components/builder/BuilderModal';
import { SearchableSelect } from '../../../components/common/SearchableSelect';

export const CATEGORY_PRESETS = [
  'Electronics',
  'Phones & Tablets',
  'Computers & Laptops',
  'Fashion & Apparel',
  'Beauty & Personal Care',
  'Home & Kitchen',
  'Supermarket & Grocery',
  'Automotive & Hardware',
  'Sports & Outdoor',
  'Books & Stationery',
  'Baby & Kids',
  'Industrial & Supplies',
  'Digital Goods',
  'Custom Category'
];

const BasicSection = ({ data, onChange }: any) => (
  <div className="space-y-4 text-xs">
    <h4 className="font-bold text-slate-800 text-base mb-2">1. Category Identity & Predefined Starter</h4>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block font-semibold text-slate-700 mb-1">Category Name</label>
        <input
          type="text"
          value={data.name || ''}
          onChange={e => onChange({ name: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
          placeholder="e.g. Phones & Tablets"
        />
      </div>

      <div>
        <label className="block font-semibold text-slate-700 mb-1">Predefined Starter Category</label>
        <SearchableSelect
          options={CATEGORY_PRESETS}
          value={data.preset || 'Phones & Tablets'}
          onChange={val => onChange({ preset: val, name: data.name || val })}
        />
      </div>

      <div>
        <label className="block font-semibold text-slate-700 mb-1">Parent Category</label>
        <SearchableSelect
          options={['None (Top-Level)', 'Electronics', 'Fashion & Apparel', 'Home & Kitchen']}
          value={data.parent || 'None (Top-Level)'}
          onChange={val => onChange({ parent: val })}
        />
      </div>

      <div>
        <label className="block font-semibold text-slate-700 mb-1">Commission Rate % Override</label>
        <input
          type="number"
          value={data.commissionRate || 10}
          onChange={e => onChange({ commissionRate: Number(e.target.value) })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
        />
      </div>
    </div>
  </div>
);

const SubcategoriesSection = ({ data, onChange }: any) => {
  const [newSub, setNewSub] = React.useState('');
  const subs = data.subcategories || [];

  const addSub = () => {
    if (!newSub.trim()) return;
    const item = { id: `sub-${Date.now()}`, name: newSub.trim(), slug: newSub.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') };
    onChange({ subcategories: [...subs, item], subcategoriesCount: subs.length + 1 });
    setNewSub('');
  };

  const removeSub = (id: string) => {
    const updated = subs.filter((s: any) => (s.id || s) !== id);
    onChange({ subcategories: updated, subcategoriesCount: updated.length });
  };

  return (
    <div className="space-y-4 text-xs">
      <h4 className="font-bold text-slate-800 text-base mb-2">2. Manage Subcategories</h4>
      <p className="text-slate-500">Add or remove subcategories that appear on the category page and seller add product form.</p>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={newSub}
          onChange={e => setNewSub(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSub(); } }}
          placeholder="e.g. Smartphones, Laptops, Fresh Produce..."
          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
        />
        <button
          type="button"
          onClick={addSub}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold cursor-pointer"
        >
          Add Subcategory
        </button>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        {subs.map((sub: any, idx: number) => {
          const subName = typeof sub === 'string' ? sub : sub.name;
          const subId = sub.id || idx;
          return (
            <div key={subId} className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg font-bold text-slate-700">
              <span>{subName}</span>
              <button
                type="button"
                onClick={() => removeSub(subId)}
                className="text-slate-400 hover:text-rose-600 ml-1 font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const CategoryModal: React.FC<any> = ({ isOpen, onClose, onSave, initialData }) => {
  return (
    <BuilderModal
      title={initialData?.id ? 'Edit Category' : 'Create Category'}
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      initialData={initialData || { name: '', preset: 'Phones & Tablets', commissionRate: 10, subcategories: [] }}
      sections={[
        { id: 'basic', label: 'Category Identity', component: BasicSection },
        { id: 'subs', label: 'Subcategories', component: SubcategoriesSection }
      ]}
    />
  );
};

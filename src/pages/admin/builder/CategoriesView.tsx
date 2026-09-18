import React, { useState } from 'react';
import { useBuilderConfig } from '../../../hooks/useBuilderConfig';
import { Layers, Plus, Trash2, Edit2, ChevronRight, Tag } from 'lucide-react';
import { CategoryModal } from './CategoryModal';

interface Category {
  id: string;
  name: string;
  slug: string;
  subcategoriesCount: number;
  productsCount: number;
  active: boolean;
}

const initialCategories: Category[] = [
  { id: 'cat-1', name: 'Consumer Electronics & Gadgets', slug: 'electronics', subcategoriesCount: 14, productsCount: 1840, active: true },
  { id: 'cat-2', name: 'Phones, Tablets & Smart Accessories', slug: 'phones-tablets', subcategoriesCount: 12, productsCount: 2150, active: true },
  { id: 'cat-3', name: 'Fashion, Apparel & Shoes', slug: 'fashion', subcategoriesCount: 18, productsCount: 3400, active: true },
  { id: 'cat-4', name: 'Home Appliances & Furniture', slug: 'home-appliances', subcategoriesCount: 10, productsCount: 980, active: true },
  { id: 'cat-5', name: 'Beauty, Cosmetics & Personal Care', slug: 'beauty', subcategoriesCount: 15, productsCount: 2300, active: true },
  { id: 'cat-6', name: 'Babies & Kids Store', slug: 'kids-babies', subcategoriesCount: 10, productsCount: 450, active: true },
  { id: 'cat-7', name: 'Agriculture & Farm Supplies', slug: 'agriculture-farm-supplies', subcategoriesCount: 10, productsCount: 520, active: true },
  { id: 'cat-8', name: 'Health & Medical Equipment', slug: 'health-medical-equipment', subcategoriesCount: 8, productsCount: 380, active: true },
  { id: 'cat-9', name: 'Automotive & Spare Parts', slug: 'automotive-spares', subcategoriesCount: 9, productsCount: 640, active: true },
  { id: 'cat-10', name: 'Groceries & Supermarket Essentials', slug: 'groceries', subcategoriesCount: 16, productsCount: 1250, active: true },
  { id: 'cat-11', name: 'Sports, Outdoor & Fitness', slug: 'sports-fitness', subcategoriesCount: 7, productsCount: 290, active: true }
];

export const CategoriesView = () => {
  const { data: categories, updateConfig: setCategories } = useBuilderConfig('categories', initialCategories);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const safeCategories = Array.isArray(categories) ? categories : initialCategories;

  const toggleActive = (id: string) => {
    setCategories(safeCategories.map((c: any) => c.id === id ? { ...c, active: !c.active } : c));
  };

  const deleteCategory = (id: string) => {
    if (confirm('Are you sure you want to delete this product category?')) {
      setCategories(safeCategories.filter((c: any) => c.id !== id));
    }
  };

  const handleSaveModal = (data: any, status: string) => {
    const newCat = { 
      ...data, 
      subcategoriesCount: data.subcategoriesCount || 0,
      productsCount: data.productsCount || 0,
      active: status === 'PUBLISHED' 
    };
    if (!newCat.id) newCat.id = `cat-${Date.now()}`;
    let newCategories = [...safeCategories];
    if (editingCategory) {
      newCategories = newCategories.map((c: any) => c.id === newCat.id ? newCat : c);
    } else {
      newCategories.push(newCat);
    }
    setCategories(newCategories);
    setShowModal(false);
    setEditingCategory(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Product Categories Taxonomy</h2>
          <p className="text-sm text-slate-500">Manage hierarchical product categories, subcategories, and tags.</p>
        </div>
        <button
          onClick={() => { setEditingCategory(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Main Category
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold">
            <tr>
              <th className="py-3 px-4">Category Name</th>
              <th className="py-3 px-4">Slug</th>
              <th className="py-3 px-4">Subcategories</th>
              <th className="py-3 px-4">Mapped Products</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {safeCategories.map((cat: any) => (
              <tr key={cat.id} className="hover:bg-slate-50 transition">
                <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-400 shrink-0" />
                  {cat.name}
                </td>
                <td className="py-3 px-4 font-mono text-slate-600">{cat.slug}</td>
                <td className="py-3 px-4 text-slate-600 font-bold">{cat.subcategoriesCount ?? 0} Subs</td>
                <td className="py-3 px-4 text-slate-600 font-bold">{(cat.productsCount ?? 0).toLocaleString()} Products</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => toggleActive(cat.id)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase cursor-pointer transition ${
                      cat.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {cat.active ? 'Active' : 'Hidden'}
                  </button>
                </td>
                <td className="py-3 px-4 text-right flex justify-end gap-1">
                  <button
                    onClick={() => { setEditingCategory(cat); setShowModal(true); }}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CategoryModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveModal}
        initialData={editingCategory || {}}
      />
    </div>
  );
};

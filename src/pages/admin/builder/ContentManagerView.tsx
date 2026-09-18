import React, { useState } from 'react';
import { useBuilderConfig } from '../../../hooks/useBuilderConfig';
import { FileText, Plus, Edit2, Trash2, Eye, Calendar, Tag } from 'lucide-react';
import { ContentModal } from './ContentModal';

interface ContentBlock {
  id: string;
  title: string;
  type: string;
  location: string;
  status: string;
  updatedAt: string;
}

const initialBlocks: ContentBlock[] = [
  { id: 'cnt-1', title: 'Homepage Hero Banner Announcement', type: 'Banner', location: 'Home Banner', status: 'Published', updatedAt: '2 hours ago' },
  { id: 'cnt-2', title: 'Seller Onboarding Terms & Conditions v2.1', type: 'Policy', location: 'Vendor Portal', status: 'Published', updatedAt: '1 day ago' },
  { id: 'cnt-3', title: 'Kariao Loyalty Program FAQ', type: 'Article', location: 'Help Center', status: 'Draft', updatedAt: '3 days ago' },
  { id: 'cnt-4', title: 'Flash Sale Promotion Popup Modal', type: 'Modal', location: 'Global App', status: 'Published', updatedAt: '5 mins ago' }
];

export const ContentManagerView = () => {
  const { data: blocks, updateConfig: setBlocks, isSaving } = useBuilderConfig('contentBlocks', initialBlocks);
  const [showModal, setShowModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState<any>(null);

  const safeBlocks = Array.isArray(blocks) ? blocks : initialBlocks;

  const toggleStatus = (id: string) => {
    setBlocks(safeBlocks.map((b: any) => b.id === id ? { ...b, status: b.status === 'Published' ? 'Draft' : 'Published' } : b));
  };

  const deleteBlock = (id: string) => {
    if (confirm('Are you sure you want to delete this content block?')) {
      setBlocks(safeBlocks.filter((b: any) => b.id !== id));
    }
  };

  const handleSaveModal = (data: any, status: string) => {
    const newBlock = { ...data, status: status === 'PUBLISHED' ? 'Published' : 'Draft', updatedAt: 'Just now' };
    if (!newBlock.id) newBlock.id = `cnt-${Date.now()}`;
    let newBlocks = [...safeBlocks];
    if (editingBlock) {
      newBlocks = newBlocks.map((b: any) => b.id === newBlock.id ? newBlock : b);
    } else {
      newBlocks.unshift(newBlock);
    }
    setBlocks(newBlocks);
    setShowModal(false);
    setEditingBlock(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Content & CMS Manager</h2>
          <p className="text-sm text-slate-500">Manage promotional banners, terms, policies, and embedded content blocks.</p>
        </div>
        <button
          onClick={() => { setEditingBlock(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" /> Create Content Block
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold">
            <tr>
              <th className="py-3 px-4">Title / Name</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Placement Location</th>
              <th className="py-3 px-4">Last Updated</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {safeBlocks.map((block: any) => (
              <tr key={block.id} className="hover:bg-slate-50 transition">
                <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  {block.title}
                </td>
                <td className="py-3 px-4 text-slate-600 font-medium">{block.type}</td>
                <td className="py-3 px-4 text-slate-600">
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[10px]">
                    {block.location}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {block.updatedAt}
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => toggleStatus(block.id)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase cursor-pointer transition ${
                      block.status === 'Published' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    {block.status}
                  </button>
                </td>
                <td className="py-3 px-4 text-right flex justify-end gap-1">
                  <button
                    onClick={() => { setEditingBlock(block); setShowModal(true); }}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteBlock(block.id)}
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

      <ContentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveModal}
        initialData={editingBlock || {}}
      />
    </div>
  );
};

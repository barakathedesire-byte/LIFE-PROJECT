import React, { useState } from 'react';
import { X, Save, Eye, CheckCircle } from 'lucide-react';

interface BuilderModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any, status: string) => void;
  initialData?: any;
  sections?: { id: string; label: string; component: React.FC<{ data: any; onChange: (data: any) => void }> }[];
}

export const BuilderModal: React.FC<BuilderModalProps> = ({ title, isOpen, onClose, onSave, initialData, sections = [] }) => {
  const [data, setData] = useState<any>(initialData || {});
  const [activeSection, setActiveSection] = useState(sections[0]?.id);

  if (!isOpen) return null;

  const handleChange = (update: any) => {
    setData((prev: any) => ({ ...prev, ...update }));
  };

  const handleSave = (status: string) => {
    // Validate
    onSave(data, status);
  };

  const ActiveComponent = sections.find(s => s.id === activeSection)?.component;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0 bg-slate-50">
          <h3 className="font-bold text-slate-900 text-lg">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:bg-slate-200 p-1.5 rounded-lg transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r border-slate-100 bg-slate-50 overflow-y-auto p-4 shrink-0 space-y-1">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  activeSection === section.id 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
          
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-white">
            {ActiveComponent && <ActiveComponent data={data} onChange={handleChange} />}
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-100 shrink-0 bg-slate-50">
          <div>
            {data.status && (
              <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${data.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                Status: {data.status}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 text-sm font-bold transition cursor-pointer">
              Cancel
            </button>
            <button onClick={() => handleSave('DRAFT')} className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold transition cursor-pointer shadow-sm">
              Save Draft
            </button>
            <button onClick={() => alert('Preview not yet implemented for this module.')} className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold flex items-center gap-1 transition cursor-pointer shadow-sm">
              <Eye className="w-4 h-4" /> Preview
            </button>
            <button onClick={() => handleSave('PUBLISHED')} className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold flex items-center gap-1 transition cursor-pointer shadow-sm">
              <CheckCircle className="w-4 h-4" /> Publish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

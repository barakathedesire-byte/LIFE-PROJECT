import React, { useState, useEffect } from 'react';
import { Search, Layers, FileText, Palette, Zap, X, ChevronRight } from 'lucide-react';
import { StudioPage } from '../../../types/studio';
import { COMPONENT_PALETTE } from '../data/defaultStudioData';

interface StudioCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  pages: StudioPage[];
  onSelectPage: (pageId: string) => void;
  onAddComponentByType: (type: string) => void;
  onOpenTemplates: () => void;
  onOpenValidation: () => void;
  onOpenPublish: () => void;
  onOpenPlatformMap: () => void;
}

export const StudioCommandPalette: React.FC<StudioCommandPaletteProps> = ({
  isOpen,
  onClose,
  pages,
  onSelectPage,
  onAddComponentByType,
  onOpenTemplates,
  onOpenValidation,
  onOpenPublish,
  onOpenPlatformMap
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredPages = pages.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) || 
    p.route.toLowerCase().includes(query.toLowerCase())
  );

  const filteredComponents = COMPONENT_PALETTE.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase()) || 
    c.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[70vh]">
        {/* Search Input Bar */}
        <div className="p-3 border-b border-slate-200 flex items-center gap-3 bg-slate-50">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search pages, elements, actions or settings..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent border-none text-sm text-slate-900 focus:outline-none placeholder-slate-400"
          />
          <kbd className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-mono">ESC</kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-3 text-xs">
          {/* Quick Actions */}
          <div>
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Studio Quick Actions
            </div>
            <div className="space-y-1">
              <button
                onClick={() => { onOpenPublish(); onClose(); }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-orange-50 hover:text-orange-900 flex items-center justify-between text-slate-700 transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-[#FF6A00]" />
                  <span className="font-semibold">Publish Release to Live Production</span>
                </div>
                <ChevronRight size={13} className="text-slate-400" />
              </button>

              <button
                onClick={() => { onOpenValidation(); onClose(); }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-emerald-900 flex items-center justify-between text-slate-700 transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-emerald-600" />
                  <span className="font-semibold">Run Pre-Flight Platform Validation</span>
                </div>
                <ChevronRight size={13} className="text-slate-400" />
              </button>

              <button
                onClick={() => { onOpenPlatformMap(); onClose(); }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-900 flex items-center justify-between text-slate-700 transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-blue-600" />
                  <span className="font-semibold">Open Visual Ecosystem Platform Map</span>
                </div>
                <ChevronRight size={13} className="text-slate-400" />
              </button>
            </div>
          </div>

          {/* Pages */}
          {filteredPages.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Pages ({filteredPages.length})
              </div>
              <div className="space-y-1">
                {filteredPages.map(page => (
                  <button
                    key={page.id}
                    onClick={() => { onSelectPage(page.id); onClose(); }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center justify-between text-slate-700 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-blue-500" />
                      <div>
                        <span className="font-bold text-slate-900">{page.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono ml-2">{page.route}</span>
                      </div>
                    </div>
                    <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold">
                      {page.mode}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Elements */}
          {filteredComponents.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Components & Elements
              </div>
              <div className="space-y-1">
                {filteredComponents.map(comp => (
                  <button
                    key={comp.type}
                    onClick={() => { onAddComponentByType(comp.type); onClose(); }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-orange-50/60 flex items-center justify-between text-slate-700 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Layers size={14} className="text-[#FF6A00]" />
                      <span className="font-semibold text-slate-800">{comp.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                      {comp.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

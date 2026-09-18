import React from 'react';
import { Network, X, ArrowRight, ShieldCheck, CheckCircle2, ChevronRight } from 'lucide-react';
import { DEFAULT_PLATFORM_MAP_NODES, DEFAULT_PLATFORM_MAP_LINKS } from '../data/defaultStudioData';

interface StudioPlatformMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: string) => void;
}

export const StudioPlatformMapModal: React.FC<StudioPlatformMapModalProps> = ({
  isOpen,
  onClose,
  onSelectMode
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Network size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">LUMO Ecosystem Architecture Map</h3>
              <p className="text-xs text-slate-500">Autonomous loop from buyer checkout to warehouse dispatch, OTP delivery and escrow settlement</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Visual Workflow Canvas */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-900 text-white">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-slate-200">8 Unified Operational Nodes Active</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">D1 SQLite + PostgreSQL Event Bus</span>
          </div>

          {/* Flow Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {DEFAULT_PLATFORM_MAP_NODES.map((node, idx) => (
              <div
                key={node.id}
                onClick={() => {
                  onSelectMode(node.mode);
                  onClose();
                }}
                className="bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-orange-500 rounded-xl p-4 space-y-2 transition cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-orange-400">0{idx + 1} • {node.mode}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <h4 className="font-bold text-sm text-white group-hover:text-orange-400 transition mt-1">
                    {node.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {node.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-mono">{node.apiEndpoint}</span>
                  <ChevronRight size={12} className="text-slate-500 group-hover:text-orange-400 transition" />
                </div>
              </div>
            ))}
          </div>

          {/* Sequential Links & Trust Pipeline */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-3">
            <h5 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-400" />
              Tanzanian Commerce & Trust Handshake Pipeline
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {DEFAULT_PLATFORM_MAP_LINKS.slice(0, 6).map((link, lIdx) => (
                <div key={lIdx} className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800 text-[11px]">
                  <ArrowRight size={12} className="text-orange-400 shrink-0" />
                  <span className="text-slate-300 font-medium">{link.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">Click any node to switch the canvas directly to that experience</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Close Map
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Send, X, ShieldCheck, CheckCircle2, AlertCircle, History, Sparkles } from 'lucide-react';

interface StudioPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeVersion: string;
  onPublish: (version: string, notes: string) => Promise<boolean>;
}

export const StudioPublishModal: React.FC<StudioPublishModalProps> = ({
  isOpen,
  onClose,
  activeVersion,
  onPublish
}) => {
  const [version, setVersion] = useState('v2.5.0');
  const [notes, setNotes] = useState('Updated Kariakoo direct showcase, improved escrow badges, enhanced rider queue.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const ok = await onPublish(version, notes);
      if (ok) {
        onClose();
      } else {
        setErrorMsg('Failed to publish release. Please verify server connection.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during publishing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF6A00] flex items-center justify-center">
              <Send size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Publish Production Release</h3>
              <p className="text-xs text-slate-500">Deploys working visual changes directly to the live platform</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-slate-400 font-bold block">Current Live Snapshot:</span>
              <span className="font-mono font-extrabold text-slate-800 text-sm">{activeVersion}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 font-bold block">Database Target:</span>
              <span className="font-mono font-bold text-emerald-600 text-xs">Cloudflare D1 & SQLite</span>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Target Version Tag</label>
            <input
              type="text"
              required
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="e.g. v2.5.0"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono font-semibold"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Changelog & Release Notes</label>
            <textarea
              rows={3}
              required
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe modifications made in this release..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>Immutable Rollback Protection Active</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              A point-in-time snapshot will automatically be archived in <code className="font-mono">platform_builder_configs</code> allowing 1-click rollback anytime.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#FF6A00] hover:bg-[#E55F00] text-white font-extrabold rounded-xl flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition cursor-pointer"
            >
              <Send size={13} />
              <span>{isSubmitting ? 'Deploying...' : 'Deploy Live Release'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

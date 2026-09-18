import React, { useState, useEffect } from 'react';
import { usePlatformConfig } from '../../../context/PlatformConfigContext';
import { api } from '../../../services/api';
import { History, CheckCircle, RotateCcw, UploadCloud, Eye, RefreshCw, Layers } from 'lucide-react';
import { LumoLoader } from '../../../components/common/LumoLoader';

export const ConfigurationVersionsView = () => {
  const { activeVersion, publishConfig, rollbackConfig, refreshConfig } = usePlatformConfig();
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [previewRole, setPreviewRole] = useState<string | null>(null);

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/config/versions');
      const data = await res.json();
      if (data.versions) {
        setVersions(data.versions);
      }
    } catch (err) {
      console.error('Failed to load version history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, [activeVersion]);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishing(true);
    try {
      await publishConfig(title || 'Platform Release Update', notes || 'Published live platform changes.');
      setShowPublishModal(false);
      setTitle('');
      setNotes('');
      await fetchVersions();
      alert('Configuration successfully compiled, published, and persisted to SQLite/D1!');
    } catch (err) {
      alert('Failed to publish version');
    } finally {
      setPublishing(false);
    }
  };

  const handleRollback = async (versionId: string, versionNumber: string) => {
    if (confirm(`Are you sure you want to rollback platform architecture to version ${versionNumber}?`)) {
      try {
        setLoading(true);
        await rollbackConfig(versionId);
        await fetchVersions();
        alert(`Platform successfully rolled back to version ${versionNumber}!`);
      } catch (err) {
        alert('Failed to rollback version');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Configuration Versions & Rollback</h2>
          <p className="text-sm text-slate-500">
            Publish snapshots, manage release history, and trigger instant rollbacks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPublishModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer shadow-sm"
          >
            <UploadCloud className="w-4 h-4" /> Publish New Release
          </button>
        </div>
      </div>

      {/* Preview Mode Switcher */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
            <Eye className="w-4 h-4" /> Real-time Sandbox & Preview Engine
          </div>
          <p className="text-xs text-slate-400">
            Current Active Production Version: <span className="font-mono font-bold text-emerald-400">{activeVersion}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300">Preview Mode:</span>
          <select
            value={previewRole || ''}
            onChange={e => setPreviewRole(e.target.value || null)}
            className="bg-slate-800 border border-slate-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl"
          >
            <option value="">Off (Live Admin Mode)</option>
            <option value="Vendor">Preview as Vendor</option>
            <option value="Rider">Preview as Rider</option>
            <option value="Field Sales">Preview as Field Sales</option>
            <option value="Warehouse">Preview as Warehouse</option>
            <option value="Buyer">Preview as Buyer Storefront</option>
          </select>
        </div>
      </div>

      {previewRole && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-bold flex items-center justify-between">
          <span>⚠️ Currently previewing active platform configuration as role: <strong>{previewRole}</strong>. Navigation & fields render in sandbox mode.</span>
          <button onClick={() => setPreviewRole(null)} className="underline text-amber-800">Exit Preview</button>
        </div>
      )}

      {/* Version History List */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <LumoLoader size="medium" />
          <p className="text-xs font-bold text-slate-500 mt-2">Loading version snapshots from database...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {versions.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-sm">
              <History className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-bold">No previous release versions found.</p>
              <p className="text-xs text-slate-400 mt-1">Publish your current draft configuration to create version v1.0.0.</p>
            </div>
          ) : (
            versions.map(ver => (
              <div key={ver.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-slate-900 text-base font-mono">{ver.version}</h3>
                    {ver.status === 'PUBLISHED' || ver.version === activeVersion ? (
                      <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border border-emerald-200">
                        <CheckCircle className="w-3 h-3" /> Active Release
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase">
                        Archived Snapshot
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 font-medium">{ver.title} — {ver.notes || ver.changes}</p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Published by {ver.publishedBy || ver.author || 'Super Admin'} at {new Date(ver.publishedAt || ver.timestamp).toLocaleString()}
                  </p>
                </div>
                <div>
                  {ver.version !== activeVersion && (
                    <button
                      onClick={() => handleRollback(ver.id, ver.version)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer border border-slate-300"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Rollback to this Version
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Publish Platform Configuration Release</h3>
            <p className="text-xs text-slate-500">
              Compiles current no-code configurations into a persistent snapshot and deploys it live to SQLite / D1.
            </p>
            <form onSubmit={handlePublish} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Release Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Q3 Logistics & Form Field Update"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Release Notes / Change Description</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Describe key configuration changes in this release..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={publishing}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer flex items-center gap-2 shadow-sm"
                >
                  {publishing ? <LumoLoader size="small" /> : <UploadCloud className="w-4 h-4" />}
                  {publishing ? 'Publishing...' : 'Publish Release'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

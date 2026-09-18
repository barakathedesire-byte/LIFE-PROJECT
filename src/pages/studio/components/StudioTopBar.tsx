import React from 'react';
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  RotateCcw, 
  RotateCw, 
  Save, 
  Send, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles, 
  Play, 
  Edit3, 
  Search, 
  Network, 
  ChevronDown, 
  Sliders, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  History 
} from 'lucide-react';
import { StudioViewport, StudioCanvasMode, StudioPage } from '../../../types/studio';

interface StudioTopBarProps {
  pages: StudioPage[];
  activePage: StudioPage;
  onSelectPage: (pageId: string) => void;
  viewport: StudioViewport;
  onViewportChange: (viewport: StudioViewport) => void;
  canvasMode: StudioCanvasMode;
  onCanvasModeChange: (mode: StudioCanvasMode) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onSaveDraft: () => void;
  onOpenPublish: () => void;
  onOpenValidation: () => void;
  onOpenPlatformMap: () => void;
  onOpenCommandPalette: () => void;
  onOpenVersionsModal: () => void;
  onExit: () => void;
  activeVersion: string;
}

export const StudioTopBar: React.FC<StudioTopBarProps> = ({
  pages,
  activePage,
  onSelectPage,
  viewport,
  onViewportChange,
  canvasMode,
  onCanvasModeChange,
  zoom,
  onZoomChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  hasUnsavedChanges,
  isSaving,
  onSaveDraft,
  onOpenPublish,
  onOpenValidation,
  onOpenPlatformMap,
  onOpenCommandPalette,
  onOpenVersionsModal,
  onExit,
  activeVersion
}) => {
  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between px-3 md:px-4 shrink-0 select-none z-30 shadow-md">
      {/* Left Section: Logo & Page Selector */}
      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={onExit}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
          title="Exit to LUMO Admin Dashboard"
        >
          <ArrowLeft size={16} />
          <span className="hidden xl:inline">Admin</span>
        </button>

        <div className="h-4 w-px bg-slate-800 hidden sm:block" />

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#FF6A00] to-amber-500 flex items-center justify-center font-black text-white text-xs shadow-sm shadow-orange-500/20">
            L
          </div>
          <div className="hidden lg:block">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-white">LUMO Studio</span>
              <button 
                onClick={onOpenVersionsModal}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-orange-400 font-mono font-bold px-1.5 py-0.5 rounded border border-orange-500/30 transition cursor-pointer flex items-center gap-1"
                title="View Release Versions"
              >
                <History size={10} />
                <span>{activeVersion}</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 -mt-0.5">Independent Visual Builder</p>
          </div>
        </div>

        {/* Page Switcher Dropdown */}
        <div className="relative ml-1 sm:ml-2">
          <select
            value={activePage.id}
            onChange={(e) => onSelectPage(e.target.value)}
            aria-label="Active Page Selector"
            className="bg-slate-800/90 hover:bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-[#FF6A00] cursor-pointer max-w-[150px] sm:max-w-[210px] md:max-w-[260px] truncate"
          >
            <optgroup label="Customer Marketplace">
              {pages.filter(p => p.mode === 'CUSTOMER').map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.route})</option>
              ))}
            </optgroup>
            <optgroup label="Seller Center (Vendor)">
              {pages.filter(p => p.mode === 'SELLER').map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.route})</option>
              ))}
            </optgroup>
            <optgroup label="Lumo Move (Rider)">
              {pages.filter(p => p.mode === 'RIDER').map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.route})</option>
              ))}
            </optgroup>
            <optgroup label="Warehouse & Fulfillment">
              {pages.filter(p => p.mode === 'WAREHOUSE').map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.route})</option>
              ))}
            </optgroup>
            <optgroup label="Operations & Dispatch">
              {pages.filter(p => p.mode === 'OPERATIONS').map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.route})</option>
              ))}
            </optgroup>
            <optgroup label="Lumo Point (Pickup Stations)">
              {pages.filter(p => p.mode === 'PICKUP').map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.route})</option>
              ))}
            </optgroup>
            <optgroup label="Field Sales & Growth">
              {pages.filter(p => p.mode === 'SALESPERSON').map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.route})</option>
              ))}
            </optgroup>
            <optgroup label="Support & Disputes">
              {pages.filter(p => p.mode === 'SUPPORT').map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.route})</option>
              ))}
            </optgroup>
            <optgroup label="Finance & Accounting">
              {pages.filter(p => p.mode === 'FINANCE').map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.route})</option>
              ))}
            </optgroup>
            <optgroup label="Platform Administration">
              {pages.filter(p => p.mode === 'ADMIN').map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.route})</option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Quick Search / Command Palette trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs border border-slate-700/80 transition cursor-pointer"
          title="Search anything (Cmd+K)"
        >
          <Search size={13} />
          <span className="text-[11px]">Quick Search</span>
          <kbd className="text-[9px] bg-slate-900 px-1 py-0.2 rounded text-slate-400 font-mono">⌘K</kbd>
        </button>
      </div>

      {/* Center Section: Viewport Switcher & Canvas Mode Toggle */}
      <div className="flex items-center gap-2">
        {/* Device Switcher */}
        <div className="flex items-center bg-slate-800/90 p-0.5 rounded-lg border border-slate-700">
          <button
            onClick={() => onViewportChange('desktop')}
            className={`px-2 py-1 rounded text-xs flex items-center gap-1 font-medium transition cursor-pointer ${
              viewport === 'desktop' ? 'bg-[#FF6A00] text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
            title="Desktop View (100%)"
          >
            <Monitor size={13} />
            <span className="hidden sm:inline text-[11px]">Desktop</span>
          </button>
          <button
            onClick={() => onViewportChange('tablet')}
            className={`px-2 py-1 rounded text-xs flex items-center gap-1 font-medium transition cursor-pointer ${
              viewport === 'tablet' ? 'bg-[#FF6A00] text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
            title="Tablet View (768px)"
          >
            <Tablet size={13} />
            <span className="hidden sm:inline text-[11px]">Tablet</span>
          </button>
          <button
            onClick={() => onViewportChange('mobile')}
            className={`px-2 py-1 rounded text-xs flex items-center gap-1 font-medium transition cursor-pointer ${
              viewport === 'mobile' ? 'bg-[#FF6A00] text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
            title="Mobile View (390px)"
          >
            <Smartphone size={13} />
            <span className="hidden sm:inline text-[11px]">Mobile</span>
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="hidden lg:flex items-center bg-slate-800/90 px-1 py-0.5 rounded-lg border border-slate-700 text-xs text-slate-300">
          <button
            onClick={() => onZoomChange(Math.max(50, zoom - 25))}
            className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={13} />
          </button>
          <span className="px-1 text-[11px] font-mono min-w-[36px] text-center">{zoom}%</span>
          <button
            onClick={() => onZoomChange(Math.min(150, zoom + 25))}
            className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={13} />
          </button>
        </div>

        {/* Mode Toggle: Design (selectable boxes) vs Live Interactive Preview */}
        <div className="flex items-center bg-slate-800/90 p-0.5 rounded-lg border border-slate-700">
          <button
            onClick={() => onCanvasModeChange('design')}
            className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 font-bold transition cursor-pointer ${
              canvasMode === 'design'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Design Mode (Visual Selection, Inspector & Edits)"
          >
            <Edit3 size={13} />
            <span className="hidden md:inline">Design</span>
          </button>
          <button
            onClick={() => onCanvasModeChange('preview')}
            className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 font-bold transition cursor-pointer ${
              canvasMode === 'preview'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Functional Live Preview (Real backend interactive test mode!)"
          >
            <Play size={13} />
            <span className="hidden md:inline">Live Test</span>
          </button>
        </div>
      </div>

      {/* Right Section: Undo/Redo, Validate, Save Draft, Publish */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Undo / Redo */}
        <div className="hidden sm:flex items-center gap-0.5 text-slate-400">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded hover:bg-slate-800 transition cursor-pointer ${
              canUndo ? 'text-slate-300 hover:text-white' : 'opacity-30 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded hover:bg-slate-800 transition cursor-pointer ${
              canRedo ? 'text-slate-300 hover:text-white' : 'opacity-30 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <RotateCw size={14} />
          </button>
        </div>

        {/* Platform Map Button */}
        <button
          onClick={onOpenPlatformMap}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1 transition cursor-pointer border border-slate-700"
          title="View Visual Ecosystem Platform Map"
        >
          <Network size={14} className="text-blue-400" />
          <span className="hidden xl:inline text-[11px] font-semibold">Platform Map</span>
        </button>

        {/* Validation Button */}
        <button
          onClick={onOpenValidation}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1 transition cursor-pointer border border-slate-700"
          title="Run Pre-Flight Platform Validation Engine"
        >
          <CheckCircle2 size={14} className="text-emerald-400" />
          <span className="hidden xl:inline text-[11px] font-semibold">Validate</span>
        </button>

        {/* Save Draft */}
        <button
          onClick={onSaveDraft}
          disabled={isSaving}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
            hasUnsavedChanges
              ? 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60'
          }`}
          title="Save Working Draft to Backend"
        >
          <Save size={13} className={hasUnsavedChanges ? 'text-amber-400 animate-pulse' : ''} />
          <span className="hidden md:inline">{isSaving ? 'Saving...' : 'Save Draft'}</span>
        </button>

        {/* Publish Button */}
        <button
          onClick={onOpenPublish}
          className="px-3.5 py-1.5 rounded-lg bg-[#FF6A00] hover:bg-[#E55F00] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm shadow-orange-500/30 transition cursor-pointer"
          title="Publish Live Platform Release"
        >
          <Send size={13} />
          <span>Publish</span>
        </button>
      </div>
    </header>
  );
};

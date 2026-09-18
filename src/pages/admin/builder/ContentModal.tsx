import React, { useState } from 'react';
import { BuilderModal } from '../../../components/builder/BuilderModal';
import { SearchableSelect } from '../../../components/common/SearchableSelect';
import { Upload, X, CheckCircle2, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';

export const CONTENT_TYPES = [
  'Hero Banner',
  'Promotional Slider',
  'Announcement Bar',
  'Featured Categories',
  'Featured Products Grid',
  'Flash Sale Widget',
  'Vendor Showcase',
  'Brand Showcase',
  'Video Banner',
  'Interactive Quiz',
  'FAQ Accordion',
  'Testimonials Slider',
  'Blog / Article Card',
  'Custom HTML Block',
  'Rich Text Section',
  'Footer Navigation',
  'Header Announcement',
  'Modal Popup',
  'Floating Drawer',
  'App Download CTA',
  'Newsletter Signup',
  'Custom Component Block'
];

const BasicSection = ({ data, onChange }: any) => (
  <div className="space-y-4 text-xs">
    <h4 className="font-bold text-slate-800 text-base mb-2">1. Content Identity & Predefined Type</h4>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block font-semibold text-slate-700 mb-1">Content Block Title</label>
        <input
          type="text"
          value={data.title || ''}
          onChange={e => onChange({ title: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
          placeholder="e.g. Swahili Tech Mega Sale Banner"
        />
      </div>

      <div>
        <label className="block font-semibold text-slate-700 mb-1">Predefined Content Type</label>
        <SearchableSelect
          options={CONTENT_TYPES}
          value={data.type || 'Hero Banner'}
          onChange={val => onChange({ type: val })}
        />
      </div>
    </div>
  </div>
);

const DesignerSection = ({ data, onChange }: any) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg('File size exceeds 25MB limit.');
      return;
    }

    setErrorMsg('');
    setUploading(true);
    setUploadProgress(15);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 100;
        }
        return prev + 25;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setUploading(false);
      setUploadProgress(100);
      const reader = new FileReader();
      reader.onload = (event) => {
        onChange({ 
          imageUrl: event.target?.result as string,
          fileName: file.name,
          fileSize: `${(file.size / (1024*1024)).toFixed(2)} MB`
        });
      };
      reader.readAsDataURL(file);
    }, 1000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const fakeEvent = { target: { files: [file] } } as any;
      handleFileSelect(fakeEvent);
    }
  };

  return (
    <div className="space-y-4 text-xs">
      <h4 className="font-bold text-slate-800 text-base mb-2">2. Content & Media Upload</h4>

      <div>
        <label className="block font-semibold text-slate-700 mb-2">Upload Media (Image / Video)</label>
        
        {data.imageUrl ? (
          <div className="relative border border-slate-300 rounded-xl p-3 bg-slate-50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-lg bg-slate-200 overflow-hidden flex items-center justify-center border border-slate-300">
                <img src={data.imageUrl} alt="Uploaded Media" className="w-full h-full object-cover" />
              </div>
              <div>
                <strong className="text-slate-900 block text-xs truncate max-w-[200px]">{data.fileName || 'Media_Asset.png'}</strong>
                <span className="text-[10px] text-slate-500">{data.fileSize || 'Uploaded successfully'}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onChange({ imageUrl: '', fileName: '', fileSize: '' })}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-xs transition cursor-pointer flex items-center gap-1"
            >
              <X size={13} /> Remove
            </button>
          </div>
        ) : (
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-slate-300 hover:border-orange-500 rounded-2xl p-6 text-center bg-slate-50/60 transition cursor-pointer group"
          >
            <input
              type="file"
              id="media-upload-input"
              className="hidden"
              accept="image/*,video/*,.pdf"
              onChange={handleFileSelect}
            />
            <label htmlFor="media-upload-input" className="cursor-pointer space-y-2 block">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#FF6A00] flex items-center justify-center mx-auto group-hover:scale-110 transition">
                <Upload size={22} />
              </div>
              <div>
                <strong className="text-slate-800 text-sm block">Click to browse or drag & drop</strong>
                <span className="text-slate-500 text-[11px]">Supports PNG, JPG, MP4, WebP up to 25MB</span>
              </div>
            </label>
          </div>
        )}

        {uploading && (
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-[11px] font-bold text-slate-700">
              <span>Uploading to Lumo Media Store...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#FF6A00] transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mt-2 text-rose-600 text-[11px] font-bold flex items-center gap-1">
            <AlertCircle size={13} /> {errorMsg}
          </div>
        )}
      </div>

      <div>
        <label className="block font-semibold text-slate-700 mb-1">Body Text / Markdown</label>
        <textarea
          value={data.content || ''}
          onChange={e => onChange({ content: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
          rows={4}
          placeholder="Promotional copy and details..."
        />
      </div>
    </div>
  );
};

export const ContentModal: React.FC<any> = ({ isOpen, onClose, onSave, initialData }) => {
  return (
    <BuilderModal
      title={initialData?.id ? 'Edit Content Block' : 'Create Content Block'}
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      initialData={initialData || { title: '', type: 'Hero Banner' }}
      sections={[
        { id: 'basic', label: 'Identity', component: BasicSection },
        { id: 'designer', label: 'Content & Media', component: DesignerSection }
      ]}
    />
  );
};

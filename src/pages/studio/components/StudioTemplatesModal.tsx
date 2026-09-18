import React from 'react';
import { Layers, X, Sparkles, Check, ArrowRight } from 'lucide-react';
import { StudioPage } from '../../../types/studio';

interface StudioTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (templateName: string) => void;
}

export const StudioTemplatesModal: React.FC<StudioTemplatesModalProps> = ({
  isOpen,
  onClose,
  onApplyTemplate
}) => {
  if (!isOpen) return null;

  const templates = [
    {
      id: 'kariakoo-home',
      name: 'Kariakoo Mega Deals Homepage',
      mode: 'CUSTOMER',
      desc: 'High-conversion retail layout featuring hero banner, trust metrics, flash deals countdown and product grid.',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600'
    },
    {
      id: 'electronics-hub',
      name: 'Electronics & Audio Department',
      mode: 'CUSTOMER',
      desc: 'Category catalog with brand filter, warranty badges, price range sorter and 4-column product grid.',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'
    },
    {
      id: 'seller-cockpit',
      name: 'Seller Center Cockpit',
      mode: 'SELLER',
      desc: 'Merchant operations overview with real-time gross revenue KPI, order backlog, inventory alerts & payouts.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600'
    },
    {
      id: 'rider-dispatch',
      name: 'Lumo Move Fleet Dispatch',
      mode: 'RIDER',
      desc: 'Logistics delivery queue with route tracking, OTP verification trigger and customer phone call action.',
      image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600'
    },
    {
      id: 'warehouse-hub',
      name: 'Warehouse Fulfillment Inbound',
      mode: 'WAREHOUSE',
      desc: 'Bin shelf inventory, SKU scanning table, package put-away audit and dispatch staging bay.',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600'
    },
    {
      id: 'escrow-checkout',
      name: 'Escrow SafePay Trust Checkout',
      mode: 'CUSTOMER',
      desc: 'Bank of Tanzania trustee escrow assurance, M-Pesa / Tigo Pesa integration and delivery address picker.',
      image: 'https://images.unsplash.com/photo-1556742049-0a67e55722c0?w=600'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF6A00] flex items-center justify-center">
              <Layers size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Pre-Built Platform Page Templates</h3>
              <p className="text-xs text-slate-500">1-click production-tested layouts designed for East African commerce</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map(tmpl => (
            <div
              key={tmpl.id}
              className="border border-slate-200 hover:border-orange-400 rounded-xl overflow-hidden group hover:shadow-md transition flex flex-col justify-between bg-white"
            >
              <div>
                <div className="h-32 bg-slate-100 relative overflow-hidden">
                  <img
                    src={tmpl.image}
                    alt={tmpl.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <span className="absolute top-2 left-2 bg-slate-950/80 text-white text-[9px] font-bold px-2 py-0.5 rounded backdrop-blur-xs">
                    {tmpl.mode}
                  </span>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-orange-600 transition">
                    {tmpl.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {tmpl.desc}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  onClick={() => {
                    onApplyTemplate(tmpl.id);
                    onClose();
                  }}
                  className="w-full py-2 bg-slate-100 hover:bg-[#FF6A00] text-slate-700 hover:text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <span>Apply Template to Canvas</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

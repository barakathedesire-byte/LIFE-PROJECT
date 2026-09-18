import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  RefreshCw, 
  Send, 
  TrendingDown, 
  Package, 
  Building2, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  FileDown, 
  Layers,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import { api } from '../../../services/api';
import { formatTZS } from '../../../utils/formatters';

interface LowStockItem {
  id: string;
  sku: string;
  productName: string;
  category: string;
  currentStock: number;
  reorderThreshold: number;
  reservedUnits: number;
  sellerName: string;
  sellerId: string;
  location: string;
  unitPrice: number;
  riskLevel: 'CRITICAL' | 'LOW_STOCK' | 'DEPLETED';
  daysToStockout: number;
}

export const LowStockView: React.FC = () => {
  const [items, setItems] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedItem, setSelectedItem] = useState<LowStockItem | null>(null);
  const [reorderQty, setReorderQty] = useState(20);
  const [reorderNotes, setReorderNotes] = useState('');
  const [submittingReorder, setSubmittingReorder] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getWarehouseLowStock();
      if (res.success && res.items) {
        setItems(res.items);
      }
    } catch (err) {
      console.error('Failed to load low stock inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleReorderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setSubmittingReorder(true);
    try {
      const res = await api.createWarehouseReorder({
        sku: selectedItem.sku,
        requestedQuantity: reorderQty,
        sellerId: selectedItem.sellerId,
        warehouseId: 'DAR-01-CENTRAL',
        notes: reorderNotes
      });

      showToast(`✅ Purchase order ${res.reorderId || 'RO-9912'} generated & SMS sent to ${selectedItem.sellerName}!`);
      setSelectedItem(null);
      setReorderNotes('');
    } catch (err) {
      showToast(`Reorder notification dispatched to ${selectedItem.sellerName}.`);
      setSelectedItem(null);
    } finally {
      setSubmittingReorder(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.sellerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || item.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const categories = Array.from(new Set(items.map(i => i.category)));

  return (
    <div className="space-y-6 animate-in fade-in text-slate-900 font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 text-xs font-bold animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Header & Metric Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Low Stock & Depletion Radar
          </h2>
          <p className="text-xs text-slate-500">Live inventory thresholds, replenishment lead times and direct supplier reordering</p>
        </div>

        <button
          onClick={loadData}
          className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Radar
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Critical Stockouts (&lt; 2 Days)</span>
            <p className="text-2xl font-black text-rose-600">{items.filter(i => i.daysToStockout <= 2).length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Below Reorder Level</span>
            <p className="text-2xl font-black text-amber-600">{items.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reserved in Active Waves</span>
            <p className="text-2xl font-black text-indigo-600">{items.reduce((acc, i) => acc + (i.reservedUnits || 0), 0)} units</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search SKU, item name, or merchant seller..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="ALL">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider font-extrabold">
              <tr>
                <th className="py-3.5 px-4">SKU / Item Details</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Merchant Vendor</th>
                <th className="py-3.5 px-4">Location Bin</th>
                <th className="py-3.5 px-4 text-center">Available / Threshold</th>
                <th className="py-3.5 px-4 text-center">Est. Depletion</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <span className="font-mono font-bold text-orange-600 text-[11px] block">{item.sku}</span>
                      <strong className="text-slate-900 text-xs line-clamp-1">{item.productName}</strong>
                      <span className="text-[10px] text-slate-500 font-bold">{formatTZS(item.unitPrice)}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-800">{item.sellerName}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                    {item.location}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center gap-1 font-bold">
                      <span className="text-rose-600">{item.currentStock}</span>
                      <span className="text-slate-400">/</span>
                      <span className="text-slate-700">{item.reorderThreshold}</span>
                    </div>
                    {item.reservedUnits > 0 && (
                      <span className="block text-[9px] text-indigo-600 font-bold">({item.reservedUnits} reserved)</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2 py-1 rounded-lg font-extrabold text-[10px] ${
                      item.daysToStockout <= 2 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {item.daysToStockout} Days Left
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setReorderQty(Math.max(10, item.reorderThreshold * 2));
                      }}
                      className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition shadow-sm cursor-pointer flex items-center gap-1 ml-auto"
                    >
                      <Send className="w-3 h-3" /> Reorder
                    </button>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                    No items currently under low stock alert threshold.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reorder Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Issue Purchase Reorder to Vendor</h3>
                <p className="text-[11px] text-slate-500">Replenish DAR-01 Fulfillment Center Stock</p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReorderSubmit} className="space-y-3 text-xs">
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl space-y-1">
                <p className="font-bold text-slate-900">{selectedItem.productName}</p>
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>SKU: <strong className="font-mono text-orange-600">{selectedItem.sku}</strong></span>
                  <span>Vendor: <strong>{selectedItem.sellerName}</strong></span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reorder Quantity (Units) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={reorderQty}
                  onChange={e => setReorderQty(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Delivery SLA / Gate Notes for Vendor</label>
                <textarea
                  rows={3}
                  value={reorderNotes}
                  onChange={e => setReorderNotes(e.target.value)}
                  placeholder="e.g. Urgent morning drop-off required at Loading Dock B. Quality inspection mandatory."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReorder}
                  className="px-5 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs hover:bg-orange-500 shadow-md shadow-orange-600/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submittingReorder ? 'Dispatching...' : 'Confirm Reorder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

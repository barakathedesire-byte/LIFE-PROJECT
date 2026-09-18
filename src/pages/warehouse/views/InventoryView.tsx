import React, { useState } from 'react';
import { Search, Filter, Box, AlertTriangle, ArrowRightLeft, FileDown, CheckCircle2, X, Plus, Minus, MoveRight, Layers, Trash2 } from 'lucide-react';
import { WHInventoryItem } from '../types';
import { api } from '../../../services/api';

interface InventoryViewProps {
  inventory: WHInventoryItem[];
}

export const InventoryView: React.FC<InventoryViewProps> = ({ inventory: initialInventory }) => {
  const [inventory, setInventory] = useState<WHInventoryItem[]>(initialInventory);
  const [searchTerm, setSearchTerm] = useState('');
  const [zoneFilter, setZoneFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState('');
  
  // Modals
  const [moveModalItem, setMoveModalItem] = useState<WHInventoryItem | null>(null);
  const [targetZone, setTargetZone] = useState('Zone B');
  const [targetBin, setTargetBin] = useState('BIN-05-B');
  const [moveQuantity, setMoveQuantity] = useState(5);

  const [adjustModalItem, setAdjustModalItem] = useState<WHInventoryItem | null>(null);
  const [adjustDelta, setAdjustDelta] = useState(0);
  const [adjustReason, setAdjustReason] = useState('CYCLE_COUNT');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const filteredInventory = inventory.filter(i => {
    const matchesSearch = i.sku.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          i.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          i.vendorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesZone = zoneFilter === 'ALL' || i.zone.toLowerCase() === zoneFilter.toLowerCase();
    return matchesSearch && matchesZone;
  });

  const handleExportCSV = () => {
    const headers = ['SKU', 'Product Name', 'Merchant', 'Zone', 'Bin', 'Available', 'Reserved', 'Damaged', 'Status'];
    const rows = filteredInventory.map(i => [
      `"${i.sku}"`,
      `"${i.productName}"`,
      `"${i.vendorName}"`,
      `"${i.zone}"`,
      `"${i.bin}"`,
      i.available,
      i.reserved,
      i.damaged,
      i.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lumo_warehouse_inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Inventory report exported as CSV successfully!');
  };

  const handleMoveStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!moveModalItem) return;
    
    setInventory(prev => prev.map(item => {
      if (item.sku === moveModalItem.sku) {
        return {
          ...item,
          zone: targetZone.replace('Zone ', ''),
          bin: targetBin
        };
      }
      return item;
    }));

    showToast(`Transferred ${moveQuantity} units of ${moveModalItem.sku} to ${targetZone} (${targetBin}).`);
    setMoveModalItem(null);
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModalItem) return;

    setInventory(prev => prev.map(item => {
      if (item.sku === adjustModalItem.sku) {
        const newAvailable = Math.max(0, item.available + adjustDelta);
        const newStatus = newAvailable === 0 ? 'OUT_OF_STOCK' : newAvailable < item.reorderLevel ? 'LOW_STOCK' : 'IN_STOCK';
        return {
          ...item,
          available: newAvailable,
          status: newStatus
        };
      }
      return item;
    }));

    showToast(`Adjusted ${adjustModalItem.sku} stock by ${adjustDelta >= 0 ? `+${adjustDelta}` : adjustDelta} units (${adjustReason.replace(/_/g, ' ')}).`);
    setAdjustModalItem(null);
    setAdjustDelta(0);
  };

  return (
    <div className="space-y-6 animate-in fade-in h-full flex flex-col">
      {toastMessage && (
        <div className="p-3 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-lg flex items-center justify-between animate-in fade-in sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="p-1 hover:bg-emerald-700 rounded"><X size={14} /></button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Warehouse Inventory & Stock Bins</h2>
          <p className="text-xs text-slate-500 mt-1">Real-time stock levels, bin mapping, zone relocation, and stock adjustments.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={() => {
              if (inventory.length > 0) setMoveModalItem(inventory[0]);
            }}
            className="px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500" /> Relocate Stock
          </button>
          <button 
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-[#FF6A00] hover:bg-[#E55E00] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <FileDown className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex-1 flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by SKU, Product Name, Merchant..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#FF6A00] focus:border-[#FF6A00] outline-none"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Zone:</span>
            <select 
              value={zoneFilter}
              onChange={e => setZoneFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold outline-none cursor-pointer"
            >
              <option value="ALL">All Zones</option>
              <option value="A">Zone A (Electronics)</option>
              <option value="B">Zone B (Appliances)</option>
              <option value="C">Zone C (Groceries)</option>
              <option value="D">Zone D (Fashion)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 sticky top-0 z-10 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">SKU / Product Info</th>
                <th className="py-3 px-4">Bin Location</th>
                <th className="py-3 px-4 text-right">Available</th>
                <th className="py-3 px-4 text-right">Reserved</th>
                <th className="py-3 px-4 text-right">Damaged</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredInventory.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold font-mono text-slate-900 text-xs">{item.sku}</div>
                    <div className="font-bold text-slate-800 mt-0.5">{item.productName}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{item.vendorName} • {item?.category}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded font-bold text-[11px] border border-blue-200">
                        ZONE {item.zone}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {item.bin}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-slate-900 text-sm">
                    {item.available}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-amber-600">
                    {item.reserved}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-red-600">
                    {item.damaged}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {item.status === 'IN_STOCK' ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">IN STOCK</span>
                    ) : item.status === 'LOW_STOCK' ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">LOW STOCK</span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-100 text-red-800">OUT OF STOCK</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setMoveModalItem(item)}
                        className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                        title="Move to another bin"
                      >
                        Relocate
                      </button>
                      <button 
                        onClick={() => {
                          setAdjustModalItem(item);
                          setAdjustDelta(0);
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold text-[#FF6A00] bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition cursor-pointer"
                      >
                        Adjust
                      </button>
                      <button 
                        onClick={async () => {
                          if (confirm(`Are you sure you want to write off / decommission SKU ${item.sku} (${item.productName})?`)) {
                            try {
                              const res = await api.deleteWarehouseInventory(item.sku);
                              if (res.success || !res.error) {
                                setInventory(prev => prev.filter(i => i.sku !== item.sku));
                                showToast(`Inventory SKU ${item.sku} decommissioned.`);
                              } else {
                                alert(res.error || 'Failed to delete inventory item');
                              }
                            } catch (err: any) {
                              alert(err.message || 'Error decommissioning inventory item');
                            }
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        title="Decommission / Delete SKU"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredInventory.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              <Box className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700">No inventory items matched your search query</p>
            </div>
          )}
        </div>
      </div>

      {/* RELOCATE STOCK MODAL */}
      {moveModalItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleMoveStockSubmit} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                <ArrowRightLeft size={17} className="text-[#FF6A00]" />
                <span>Relocate SKU to Bin</span>
              </div>
              <button type="button" onClick={() => setMoveModalItem(null)} className="p-1 hover:bg-slate-100 rounded-full"><X size={18} /></button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <p className="font-bold text-slate-900 text-xs">{moveModalItem.productName}</p>
              <p className="text-slate-500 font-mono text-[10px]">SKU: {moveModalItem.sku} • Current: Zone {moveModalItem.zone} ({moveModalItem.bin})</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Target Zone</label>
                <select
                  value={targetZone}
                  onChange={e => setTargetZone(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white outline-none"
                >
                  <option value="Zone A">Zone A (High Velocity)</option>
                  <option value="Zone B">Zone B (Mid-Size)</option>
                  <option value="Zone C">Zone C (Bulk / Pallets)</option>
                  <option value="Zone D">Zone D (Secure Electronics)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Target Bin ID</label>
                <input
                  type="text"
                  value={targetBin}
                  onChange={e => setTargetBin(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-mono font-bold outline-none"
                  placeholder="BIN-XX-X"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Quantity to Relocate (Units)</label>
              <input
                type="number"
                min={1}
                max={moveModalItem.available}
                value={moveQuantity}
                onChange={e => setMoveQuantity(parseInt(e.target.value) || 1)}
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-bold outline-none"
                required
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Max available for transfer: {moveModalItem.available} units</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMoveModalItem(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-bold rounded-xl transition cursor-pointer"
              >
                Confirm Bin Transfer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADJUST INVENTORY MODAL */}
      {adjustModalItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAdjustSubmit} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                <Layers size={17} className="text-[#FF6A00]" />
                <span>Adjust Stock Count</span>
              </div>
              <button type="button" onClick={() => setAdjustModalItem(null)} className="p-1 hover:bg-slate-100 rounded-full"><X size={18} /></button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <p className="font-bold text-slate-900 text-xs">{adjustModalItem.productName}</p>
              <p className="text-slate-500 font-mono text-[10px]">SKU: {adjustModalItem.sku}</p>
              <div className="mt-2 text-slate-800 font-bold">Current Available Stock: <span className="text-[#FF6A00] text-sm">{adjustModalItem.available}</span></div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Adjustment Delta (+ / - Units)</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustDelta(prev => prev - 1)}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  <Minus size={15} />
                </button>
                <input
                  type="number"
                  value={adjustDelta}
                  onChange={e => setAdjustDelta(parseInt(e.target.value) || 0)}
                  className="flex-1 p-2.5 border border-slate-300 rounded-xl text-center font-black text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => setAdjustDelta(prev => prev + 1)}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  <Plus size={15} />
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 text-center">
                Resulting Available: <strong className="text-slate-900">{Math.max(0, adjustModalItem.available + adjustDelta)} units</strong>
              </p>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Reason for Adjustment</label>
              <select
                value={adjustReason}
                onChange={e => setAdjustReason(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-white outline-none"
              >
                <option value="CYCLE_COUNT">Physical Cycle Count Discrepancy</option>
                <option value="DAMAGED_IN_BIN">Damaged in Warehouse Bin</option>
                <option value="VENDOR_RESTOCK">Inbound Vendor Delivery Batch</option>
                <option value="RETURNED_GOOD">Customer Return Restocked</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAdjustModalItem(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-bold rounded-xl transition cursor-pointer"
              >
                Save Adjustment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

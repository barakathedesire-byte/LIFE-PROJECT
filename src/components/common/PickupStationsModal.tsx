import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, MapPin, Search, CheckCircle, Clock, Phone, Building, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { PickupStation } from '../../types';

interface PickupStationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStation: (station: { id: string; name: string; address: string; region: string }) => void;
  selectedRegion?: string;
}

export const PickupStationsModal: React.FC<PickupStationsModalProps> = ({
  isOpen,
  onClose,
  onSelectStation,
  selectedRegion = 'Dar es Salaam'
}) => {
  const [activeRegionTab, setActiveRegionTab] = useState<string>(selectedRegion || 'Dar es Salaam');
  const [searchQuery, setSearchQuery] = useState('');
  const [stations, setStations] = useState<PickupStation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const canonicalRegions = [
    'Dar es Salaam',
    'Arusha',
    'Mwanza',
    'Dodoma',
    'Mbeya',
    'Kilimanjaro',
    'Tanga',
    'Morogoro',
    'Zanzibar'
  ];

  useEffect(() => {
    if (isOpen) {
      fetchStations();
    }
  }, [isOpen, activeRegionTab]);

  const fetchStations = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/pickup/stations?region=${encodeURIComponent(activeRegionTab)}&status=ACTIVE`);
      if (res.ok) {
        const data = await res.json();
        setStations(data.stations || []);
      }
    } catch (err) {
      console.error('Failed to load regional pickup stations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredStations = stations.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.streetAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.district && s.district.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[88vh] overflow-hidden flex flex-col z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-100 bg-neutral-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#FF6A00] rounded-xl text-white">
              <Building size={20} />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-white">LUMO Regional Pickup Stations</h3>
              <p className="text-xs text-neutral-400">Select an approved regional hub for 100% Free or low-cost pickup</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Region Tabs Header */}
        <div className="bg-neutral-100 p-2 sm:p-3 border-b border-neutral-200 overflow-x-auto custom-scrollbar flex items-center gap-1.5">
          {canonicalRegions.map((reg) => (
            <button
              key={reg}
              onClick={() => setActiveRegionTab(reg)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeRegionTab.toLowerCase() === reg.toLowerCase()
                  ? 'bg-red-700 text-white shadow-md'
                  : 'bg-white text-neutral-700 hover:bg-neutral-200 border border-neutral-200'
              }`}
            >
              <MapPin size={12} className={activeRegionTab.toLowerCase() === reg.toLowerCase() ? 'text-white' : 'text-red-700'} />
              {reg}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="p-3 sm:p-4 border-b border-neutral-100 bg-neutral-50 flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search station name, district, or street in ${activeRegionTab}...`}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
            />
          </div>
          <div className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
            <Sparkles size={13} />
            <span>Server Verified Routing</span>
          </div>
        </div>

        {/* Stations Grid */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 custom-scrollbar bg-neutral-50/50">
          {isLoading ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-red-700 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-neutral-500 font-medium">Loading active pickup stations for {activeRegionTab}...</p>
            </div>
          ) : filteredStations.length === 0 ? (
            <div className="py-12 text-center space-y-3 bg-white p-6 rounded-2xl border border-dashed border-neutral-300">
              <Building size={32} className="mx-auto text-neutral-400" />
              <p className="text-sm font-bold text-neutral-800">No active pickup stations found in {activeRegionTab}</p>
              <p className="text-xs text-neutral-500 max-w-md mx-auto">
                Select another region above or switch to Doorstep Delivery during checkout.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredStations.map((station) => (
                <button
                  key={station.id}
                  onClick={() => {
                    onSelectStation({
                      id: station.id,
                      name: station.name,
                      address: `${station.streetAddress}, ${station.area}, ${station.region}`,
                      region: station.region
                    });
                    onClose();
                  }}
                  className="text-left p-4 rounded-2xl bg-white border border-neutral-200 hover:border-red-600 hover:shadow-lg transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="font-black text-neutral-900 text-sm group-hover:text-red-700 transition-colors leading-snug">
                        {station.name}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                        station.fee === 0 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {station.fee === 0 ? 'FREE PICKUP' : formatCurrency(station.fee)}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-neutral-600 my-2">
                      <p className="flex items-center gap-1.5 text-neutral-700 font-medium">
                        <MapPin size={13} className="text-red-600 shrink-0" />
                        <span>{station.streetAddress}, {station.area} {station.district ? `(${station.district})` : ''}</span>
                      </p>
                      {station.landmark && (
                        <p className="text-[11px] text-neutral-500 pl-5">
                          Landmark: <span className="text-neutral-700 font-semibold">{station.landmark}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
                    <span className="flex items-center gap-1 font-medium text-neutral-600">
                      <Clock size={12} className="text-neutral-400" />
                      {station.operatingHours}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-red-700 group-hover:translate-x-0.5 transition-transform">
                      Select Hub →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-neutral-200 bg-white flex items-center justify-between">
          <p className="text-[11px] text-neutral-500">
            Showing <strong className="text-neutral-800">{filteredStations.length}</strong> verified stations in {activeRegionTab}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-bold text-xs rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Truck, 
  Package, 
  MapPin, 
  AlertTriangle, 
  Layers, 
  Navigation, 
  RefreshCw, 
  ZoomIn, 
  ZoomOut, 
  Phone, 
  Send, 
  CheckCircle2, 
  Clock, 
  Battery, 
  Zap, 
  ShieldCheck, 
  ArrowUpRight, 
  RotateCcw,
  ExternalLink,
  Users,
  Building2,
  Box,
  ShieldAlert,
  MessageSquare
} from 'lucide-react';
import { formatTZS } from '../../utils/formatters';
import { openWhatsApp, WhatsAppTemplates } from '../../utils/whatsapp';

export interface MapEntity {
  id: string;
  type: 'RIDER' | 'WAREHOUSE' | 'PICKUP' | 'ORDER_DELIVERY' | 'SOS';
  title: string;
  subtitle?: string;
  lat: number;
  lng: number;
  status: string;
  isSos?: boolean;
  details?: {
    assignedOrders?: number;
    phone?: string;
    zone?: string;
    vehiclePlate?: string;
    speed?: string;
    battery?: string;
    slaRemaining?: string;
    capacityUtilized?: string;
    inboundTrucks?: number;
    readyOrders?: number;
    expiredOrders?: number;
    codAmount?: number;
    buyerName?: string;
    address?: string;
    rating?: number;
    notes?: string;
  };
}

interface LiveOperationsMapProps {
  entities?: MapEntity[];
  center?: [number, number];
  zoom?: number;
  filter?: 'ALL' | 'RIDERS' | 'PICKUPS' | 'DELIVERIES' | 'DELAYED' | 'EXPRESS';
  height?: string;
  showRoutePolyline?: boolean;
  selectedEntityId?: string;
  onSelectEntity?: (entity: MapEntity) => void;
  onDispatchAction?: (actionType: string, entity: MapEntity) => void;
  theme?: 'dark' | 'light';
  className?: string;
}

const DEFAULT_DAR_ES_SALAAM: [number, number] = [-6.7924, 39.2083];

// Initial coordinates in Dar es Salaam for operations tower
export const defaultMapEntities: MapEntity[] = [
  {
    id: 'wh-main-01',
    type: 'WAREHOUSE',
    title: 'LUMO Kurasini Central Hub (DAR-01)',
    subtitle: 'Primary Sorting & Fulfillment Depot',
    lat: -6.8450,
    lng: 39.2780,
    status: 'Operational',
    details: {
      zone: 'Kurasini Port Zone',
      assignedOrders: 1420,
      phone: '+255 22 211 0000',
      capacityUtilized: '84% (42,000 / 50,000 SKUs)',
      inboundTrucks: 4
    }
  },
  {
    id: 'wh-north-02',
    type: 'WAREHOUSE',
    title: 'LUMO Mikocheni Hub (DAR-02)',
    subtitle: 'North Distribution Center',
    lat: -6.7620,
    lng: 39.2450,
    status: 'Operational',
    details: {
      zone: 'Mikocheni / Kawe',
      assignedOrders: 580,
      phone: '+255 22 277 8899',
      capacityUtilized: '62% (18,600 / 30,000 SKUs)',
      inboundTrucks: 2
    }
  },
  {
    id: 'pk-kariakoo',
    type: 'PICKUP',
    title: 'Kariakoo Msimbazi Pickup Station',
    subtitle: '64 Lockers Active • 3 Expired Parcels',
    lat: -6.8180,
    lng: 39.2770,
    status: 'Ready',
    details: {
      zone: 'Kariakoo CBD',
      assignedOrders: 64,
      readyOrders: 52,
      expiredOrders: 3,
      phone: '+255 754 112 233',
      capacityUtilized: '78% (78 / 100 Lockers)'
    }
  },
  {
    id: 'pk-masaki',
    type: 'PICKUP',
    title: 'Masaki Slipway Pickup Station',
    subtitle: '28 Orders Ready for Customer Collection',
    lat: -6.7490,
    lng: 39.2680,
    status: 'Ready',
    details: {
      zone: 'Masaki / Peninsula',
      assignedOrders: 28,
      readyOrders: 24,
      expiredOrders: 1,
      phone: '+255 765 998 877',
      capacityUtilized: '45% (45 / 100 Lockers)'
    }
  },
  {
    id: 'pk-mwenge',
    type: 'PICKUP',
    title: 'Mwenge Bus Terminal Station',
    subtitle: 'Smart Parcel Lockers 24/7',
    lat: -6.7710,
    lng: 39.2210,
    status: 'Ready',
    details: {
      zone: 'Mwenge Hub',
      assignedOrders: 42,
      readyOrders: 38,
      expiredOrders: 0,
      phone: '+255 788 443 322',
      capacityUtilized: '60% (60 / 100 Lockers)'
    }
  },
  {
    id: 'rdr-juma',
    type: 'RIDER',
    title: 'Rider Juma Mwita',
    subtitle: 'Boda-Boda Express (T 482 DTZ)',
    lat: -6.7760,
    lng: 39.2400,
    status: 'IN_TRANSIT',
    details: {
      zone: 'Kinondoni / Oysterbay',
      vehiclePlate: 'T 482 DTZ',
      speed: '34 km/h',
      battery: '88%',
      assignedOrders: 4,
      phone: '+255 712 345 678',
      rating: 4.9,
      codAmount: 320000
    }
  },
  {
    id: 'rdr-baraka',
    type: 'RIDER',
    title: 'Rider Baraka Ally',
    subtitle: 'Electric Scooter (T 193 EEE)',
    lat: -6.8120,
    lng: 39.2840,
    status: 'DELIVERING',
    details: {
      zone: 'Ilala City Center',
      vehiclePlate: 'T 193 EEE',
      speed: '18 km/h',
      battery: '62%',
      assignedOrders: 3,
      phone: '+255 744 887 766',
      rating: 4.8,
      codAmount: 185000
    }
  },
  {
    id: 'rdr-rashid',
    type: 'RIDER',
    title: 'Rider Rashid Selemani',
    subtitle: 'Cargo Bajaj / Van (T 901 DFZ)',
    lat: -6.7890,
    lng: 39.2130,
    status: 'IN_TRANSIT',
    details: {
      zone: 'Ubungo / Sinza',
      vehiclePlate: 'T 901 DFZ',
      speed: '42 km/h',
      battery: '100%',
      assignedOrders: 8,
      phone: '+255 766 223 344',
      rating: 4.7,
      codAmount: 450000
    }
  },
  {
    id: 'del-10482',
    type: 'ORDER_DELIVERY',
    title: 'Express Delivery #ORD-10482',
    subtitle: 'Buyer: Amina Juma (Plot 42 Masaki)',
    lat: -6.7420,
    lng: 39.2720,
    status: 'DELAYED',
    details: {
      zone: 'Masaki Peninsula',
      buyerName: 'Amina Juma',
      address: 'Plot 42, Chole Rd, Masaki',
      slaRemaining: '+18m Delay (Traffic on Ali Hassan Mwinyi)',
      phone: '+255 712 990 011',
      codAmount: 85000
    }
  },
  {
    id: 'del-10479',
    type: 'ORDER_DELIVERY',
    title: 'Express Delivery #ORD-10479',
    subtitle: 'Buyer: David Kimaro (Upanga West)',
    lat: -6.8040,
    lng: 39.2690,
    status: 'IN_TRANSIT',
    details: {
      zone: 'Upanga West',
      buyerName: 'David Kimaro',
      address: 'United Nations Rd, Upanga',
      slaRemaining: '22m remaining (On Time)',
      phone: '+255 784 556 677',
      codAmount: 120000
    }
  }
];

export const LiveOperationsMap: React.FC<LiveOperationsMapProps> = ({
  entities = defaultMapEntities,
  center = DEFAULT_DAR_ES_SALAAM,
  zoom = 12,
  filter = 'ALL',
  height = '480px',
  showRoutePolyline = true,
  selectedEntityId,
  onSelectEntity,
  onDispatchAction,
  theme = 'light',
  className = ''
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const polylineGroupRef = useRef<L.LayerGroup | null>(null);
  
  const [activeTelemetry, setActiveTelemetry] = useState<MapEntity | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [smsModal, setSmsModal] = useState<{ isOpen: boolean; text: string; targetPhone: string; title: string } | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: false,
        attributionControl: false
      });

      // CartoDB tiles based on theme
      const tileUrl = theme === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

      L.tileLayer(tileUrl, {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Attribution
      L.control.attribution({ position: 'bottomright', prefix: '© OpenStreetMap, © CARTO • LUMO Logistics' }).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);
      polylineGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [theme]);

  // Update Markers and Polyline when entities or filter changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    const polylineGroup = polylineGroupRef.current;
    if (!map || !markersGroup || !polylineGroup) return;

    markersGroup.clearLayers();
    polylineGroup.clearLayers();

    // Filter entities
    const filteredEntities = (entities || []).filter(ent => {
      const eType = (ent.type || '').toUpperCase();
      if (filter === 'ALL') return true;
      if (filter === 'RIDERS') return eType === 'RIDER';
      if (filter === 'PICKUPS') return eType === 'PICKUP';
      if (filter === 'DELIVERIES') return eType === 'ORDER_DELIVERY' || eType === 'DELIVERY';
      if (filter === 'DELAYED') return ent.status === 'DELAYED' || ent.status === 'EXCEPTION';
      if (filter === 'EXPRESS') return eType === 'ORDER_DELIVERY' || eType === 'DELIVERY' || eType === 'RIDER';
      return true;
    });

    // Custom Icon HTML Creators
    const createIcon = (ent: MapEntity, isSelected: boolean) => {
      let bgClass = 'bg-[#FF6A00] text-white';
      let pingClass = '';
      let iconSymbol = '📍';

      const titleText = ent.title || (ent as any).name || 'Location Pin';
      const entityType = (ent.type || '').toUpperCase();

      // Check if entity is SOS or Emergency
      const isSosEntity = ent.isSos || ent.type === 'SOS' || ent.status === 'ACTIVE_EMERGENCY' || ent.status === 'SOS' || ent.status === 'EMERGENCY';

      if (isSosEntity) {
        bgClass = 'bg-red-600 text-white border-2 border-red-200 shadow-2xl font-black ring-4 ring-red-500/60';
        pingClass = 'animate-ping';
        iconSymbol = '🚨';
      } else if (entityType === 'WAREHOUSE') {
        bgClass = 'bg-blue-600 text-white border-2 border-white shadow-xl';
        iconSymbol = '🏭';
      } else if (entityType === 'PICKUP') {
        bgClass = 'bg-indigo-600 text-white border-2 border-white shadow-xl';
        iconSymbol = '📦';
      } else if (entityType === 'RIDER') {
        bgClass = 'bg-amber-500 text-slate-950 border-2 border-white shadow-xl font-bold';
        pingClass = 'animate-pulse';
        iconSymbol = '🛵';
      } else if (entityType === 'ORDER_DELIVERY' || entityType === 'DELIVERY') {
        if (ent.status === 'DELAYED') {
          bgClass = 'bg-rose-600 text-white border-2 border-white shadow-xl';
          pingClass = 'animate-ping';
          iconSymbol = '⚠️';
        } else {
          bgClass = 'bg-emerald-600 text-white border-2 border-white shadow-xl';
          iconSymbol = '🎯';
        }
      }

      const ringClass = isSelected ? 'ring-4 ring-orange-500 scale-125 z-50' : 'hover:scale-110';
      const labelText = isSosEntity ? `🚨 SOS: ${titleText}` : titleText;

      return L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer transition-all duration-200 ${ringClass}">
            ${pingClass ? `<span class="absolute w-10 h-10 rounded-full ${isSosEntity ? 'bg-red-500' : bgClass} opacity-60 ${pingClass}"></span>` : ''}
            <div class="w-8 h-8 rounded-xl ${bgClass} flex items-center justify-center text-sm shadow-lg font-sans">
              <span>${iconSymbol}</span>
            </div>
            <div class="absolute -bottom-5 whitespace-nowrap px-1.5 py-0.5 rounded ${isSosEntity ? 'bg-red-950 text-red-200 border-red-500' : 'bg-slate-900/90 text-white border-slate-700'} text-[10px] font-extrabold border shadow pointer-events-none">
              ${labelText.length > 22 ? labelText.substring(0, 22) + '...' : labelText}
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18]
      });
    };

    filteredEntities.forEach(ent => {
      const isSelected = ent.id === selectedEntityId || (activeTelemetry && activeTelemetry.id === ent.id);
      const marker = L.marker([ent.lat, ent.lng], {
        icon: createIcon(ent, isSelected || false)
      });

      marker.on('click', () => {
        setActiveTelemetry(ent);
        onSelectEntity?.(ent);
        // Pan slightly above center to ensure drawer doesn't obstruct marker
        map.panTo([ent.lat + 0.005, ent.lng], { animate: true, duration: 0.5 });
      });

      marker.addTo(markersGroup);
    });

    // Draw Corridors / Delivery routes if requested
    if (showRoutePolyline) {
      // Connect Rider Juma -> Kariakoo -> Masaki Dropoff
      const routeCoords: [number, number][] = [
        [-6.8450, 39.2780], // Kurasini Hub
        [-6.8180, 39.2770], // Kariakoo
        [-6.7760, 39.2400], // Rider Juma
        [-6.7420, 39.2720]  // Masaki Delivery
      ];

      const polyline = L.polyline(routeCoords, {
        color: '#FF6A00',
        weight: 3,
        opacity: 0.8,
        dashArray: '8, 8',
        lineCap: 'round'
      });

      polyline.addTo(polylineGroup);
    }
  }, [entities, filter, selectedEntityId, showRoutePolyline, activeTelemetry, onSelectEntity]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetCenter = () => {
    setActiveTelemetry(null);
    mapInstanceRef.current?.setView(DEFAULT_DAR_ES_SALAAM, zoom);
  };

  const triggerFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950 font-sans ${className}`} style={{ height }}>
      {/* Real Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Action Toast Feedback Overlay */}
      {actionFeedback && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-slate-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-orange-500/60 shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Floating Map Controls Top Right */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700 shadow-xl">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer"
        >
          <ZoomOut size={16} />
        </button>
        <button
          onClick={handleResetCenter}
          title="Reset Dar es Salaam View"
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-orange-400 transition cursor-pointer"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Map Legend Overlay Bottom Left */}
      <div className="absolute bottom-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs text-white shadow-xl flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          <span className="text-[11px] text-slate-300">Hubs (2)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
          <span className="text-[11px] text-slate-300">Pickups (3)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span className="text-[11px] text-slate-300">Active Riders (3)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="text-[11px] text-slate-300">Express Deliveries (2)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
          <span className="text-[11px] text-rose-400 font-semibold">Delayed (1)</span>
        </div>
      </div>

      {/* COMPREHENSIVE INTERACTIVE ACTIONS & TELEMETRY DRAWER TOP LEFT (REVEAL DETAILS & ACTIONS ON TAP) */}
      {activeTelemetry && (
        <div className="absolute top-4 left-4 z-20 w-80 sm:w-88 bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl border border-orange-500/60 shadow-2xl text-xs text-white animate-in fade-in slide-in-from-top-2 space-y-3.5">
          
          {/* Header */}
          <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                activeTelemetry.type === 'RIDER' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                activeTelemetry.type === 'WAREHOUSE' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                activeTelemetry.type === 'PICKUP' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                activeTelemetry.status === 'DELAYED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {activeTelemetry.type} • {activeTelemetry.status}
              </span>
            </div>
            <button
              onClick={() => setActiveTelemetry(null)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Title & Subtitle */}
          <div className="space-y-0.5">
            <h4 className="font-extrabold text-white text-sm leading-snug">
              {activeTelemetry.title || (activeTelemetry as any).name || 'Location Telemetry'}
            </h4>
            <p className="text-slate-400 text-[11px]">
              {activeTelemetry.subtitle || activeTelemetry.details?.zone}
            </p>
          </div>

          {/* RIDER DETAILS & ACTIONS */}
          {activeTelemetry.type === 'RIDER' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px]">
                <div>
                  <span className="text-slate-400 text-[10px] block">Plate &amp; Zone</span>
                  <strong className="text-white font-mono">{activeTelemetry.details?.vehiclePlate || 'T 482 DTZ'}</strong>
                  <p className="text-slate-400 text-[10px] truncate">{activeTelemetry.details?.zone}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Speed &amp; Battery</span>
                  <p className="text-emerald-400 font-mono font-bold">{activeTelemetry.details?.speed || '32 km/h'}</p>
                  <p className="text-slate-300 text-[10px] flex items-center gap-1">
                    <Battery className="w-3 h-3 text-emerald-400" /> {activeTelemetry.details?.battery || '90%'}
                  </p>
                </div>
                <div className="col-span-2 pt-1.5 border-t border-slate-800 flex justify-between">
                  <span className="text-slate-400">COD Collected Today:</span>
                  <strong className="text-orange-400 font-mono">
                    {formatTZS(activeTelemetry.details?.codAmount || 320000)}
                  </strong>
                </div>
              </div>

              {/* Action Buttons for Rider */}
              <div className="grid grid-cols-2 gap-2">
                {activeTelemetry.details?.phone && (
                  <a
                    href={`tel:${activeTelemetry.details.phone}`}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" /> Call Rider
                  </a>
                )}
                {activeTelemetry.details?.phone && (
                  <button
                    onClick={() => {
                      const msg = WhatsAppTemplates.driverArrivedAtBuyer(
                        'Customer',
                        'ORD-10482',
                        activeTelemetry.details?.zone || 'Dar es Salaam'
                      );
                      openWhatsApp(activeTelemetry.details.phone, msg);
                    }}
                    className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                  </button>
                )}
                <button
                  onClick={() => {
                    setSmsModal({
                      isOpen: true,
                      targetPhone: activeTelemetry.details?.phone || '+255 712 345 678',
                      title: `Dispatch SMS to ${activeTelemetry.title}`,
                      text: `LUMO Dispatch Alert: Route priority updated for ${activeTelemetry.details?.zone}. Please confirm next parcel delivery.`
                    });
                  }}
                  className="py-2 px-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-orange-950 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> Send SMS
                </button>
                <button
                  onClick={() => {
                    triggerFeedback(`Rider ${activeTelemetry.title} assigned to priority express queue.`);
                    onDispatchAction?.('ASSIGN_RIDER', activeTelemetry);
                  }}
                  className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-950 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" /> Dispatch Order
                </button>
              </div>
            </div>
          )}

          {/* WAREHOUSE DETAILS & ACTIONS */}
          {activeTelemetry.type === 'WAREHOUSE' && (
            <div className="space-y-3">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Storage Utilization:</span>
                  <strong className="text-blue-400 font-bold">{activeTelemetry.details?.capacityUtilized || '78% Full'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Inbound Freight Trucks:</span>
                  <strong className="text-emerald-400 font-bold">{activeTelemetry.details?.inboundTrucks || 3} Trucks En Route</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Sorting Queue:</span>
                  <strong className="text-white font-mono">{activeTelemetry.details?.assignedOrders || 1200} Parcels</strong>
                </div>
              </div>

              {/* Action Buttons for Warehouse */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    triggerFeedback(`Inbound dock manifest refreshed for ${activeTelemetry.title}`);
                    onDispatchAction?.('INSPECT_WAREHOUSE', activeTelemetry);
                  }}
                  className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Package className="w-3.5 h-3.5" /> Dock Waves
                </button>
                {activeTelemetry.details?.phone && (
                  <a
                    href={`tel:${activeTelemetry.details.phone}`}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" /> Call Hub
                  </a>
                )}
                <button
                  onClick={() => {
                    triggerFeedback(`Inter-hub transfer request broadcasted from ${activeTelemetry.title}`);
                    onDispatchAction?.('SCHEDULE_TRANSFER', activeTelemetry);
                  }}
                  className="col-span-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer"
                >
                  <Truck className="w-3.5 h-3.5 text-orange-400" /> Schedule Freight Transfer
                </button>
              </div>
            </div>
          )}

          {/* PICKUP STATION DETAILS & ACTIONS */}
          {activeTelemetry.type === 'PICKUP' && (
            <div className="space-y-3">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Locker Occupancy:</span>
                  <strong className="text-indigo-400 font-bold">{activeTelemetry.details?.capacityUtilized || '65% Full'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ready for Pickup:</span>
                  <strong className="text-emerald-400 font-bold">{activeTelemetry.details?.readyOrders || 42} Packages</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Overdue / Expired:</span>
                  <strong className="text-rose-400 font-bold">{activeTelemetry.details?.expiredOrders || 2} Overdue</strong>
                </div>
              </div>

              {/* Action Buttons for Pickup Station */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    triggerFeedback(`Automated SMS pickup reminders sent to all waiting customers at ${activeTelemetry.title}`);
                    onDispatchAction?.('BROADCAST_REMINDERS', activeTelemetry);
                  }}
                  className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> SMS Blast
                </button>
                {activeTelemetry.details?.phone && (
                  <a
                    href={`tel:${activeTelemetry.details.phone}`}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" /> Station Lead
                  </a>
                )}
                <button
                  onClick={() => {
                    triggerFeedback(`Expired package return initiated for ${activeTelemetry.title}`);
                    onDispatchAction?.('RETURN_EXPIRED', activeTelemetry);
                  }}
                  className="col-span-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 font-bold text-xs transition flex items-center justify-center gap-1.5 border border-rose-500/30 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-400" /> Resolve Expired Radar ({activeTelemetry.details?.expiredOrders || 2})
                </button>
              </div>
            </div>
          )}

          {/* ORDER DELIVERY / DELAYED DETAILS & ACTIONS */}
          {activeTelemetry.type === 'ORDER_DELIVERY' && (
            <div className="space-y-3">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Buyer Contact:</span>
                  <strong className="text-white">{activeTelemetry.details?.buyerName || 'Customer'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Delivery Address:</span>
                  <strong className="text-slate-200 truncate max-w-[180px]">{activeTelemetry.details?.address || 'Dar es Salaam'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">SLA Status:</span>
                  <strong className={activeTelemetry.status === 'DELAYED' ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {activeTelemetry.details?.slaRemaining || activeTelemetry.status}
                  </strong>
                </div>
                {activeTelemetry.details?.codAmount && (
                  <div className="flex justify-between pt-1 border-t border-slate-800">
                    <span className="text-slate-400">COD Payable:</span>
                    <strong className="text-orange-400 font-mono">{formatTZS(activeTelemetry.details.codAmount)}</strong>
                  </div>
                )}
              </div>

              {/* Action Buttons for Delivery */}
              <div className="grid grid-cols-2 gap-2">
                {activeTelemetry.details?.phone && (
                  <a
                    href={`tel:${activeTelemetry.details.phone}`}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" /> Call Buyer
                  </a>
                )}
                <button
                  onClick={() => {
                    triggerFeedback(`Delivery #${activeTelemetry.id} escalated to priority dispatch.`);
                    onDispatchAction?.('ESCALATE_DELIVERY', activeTelemetry);
                  }}
                  className="py-2 px-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" /> Re-route Express
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* SMS Broadcast Quick Modal */}
      {smsModal && smsModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-5 text-white shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-orange-400" />
                <h3 className="font-extrabold text-sm">{smsModal.title}</h3>
              </div>
              <button 
                onClick={() => setSmsModal(null)} 
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="text-slate-400 font-bold block">Target Mobile Number</label>
              <input
                type="text"
                value={smsModal.targetPhone}
                readOnly
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />

              <label className="text-slate-400 font-bold block pt-1">SMS Message Content</label>
              <textarea
                value={smsModal.text}
                onChange={(e) => setSmsModal({ ...smsModal, text: e.target.value })}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  triggerFeedback(`SMS successfully dispatched to ${smsModal.targetPhone}`);
                  setSmsModal(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs transition shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Dispatch SMS
              </button>
              <button
                onClick={() => setSmsModal(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

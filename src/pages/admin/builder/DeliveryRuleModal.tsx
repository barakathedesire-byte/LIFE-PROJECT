import React from 'react';
import { BuilderModal } from '../../../components/builder/BuilderModal';
import { SearchableSelect } from '../../../components/common/SearchableSelect';
import { Truck, MapPin, DollarSign, Clock, Package, UserCheck, ShieldAlert, ArrowRight, Zap } from 'lucide-react';

export const DELIVERY_RULE_TYPES = [
  'Standard',
  'Express',
  'Same-Day',
  'Pickup Station',
  'Free Delivery Threshold',
  'Distance-Based (per km)',
  'Weight-Based Surcharge',
  'Zone-Based Spatial Tier',
  'Bulky & Heavy Freight',
  'Cold Chain / Perishable',
  'Cash on Delivery Protected',
  'Custom Enterprise SLA'
];

export const DELIVERY_ZONES = [
  'Zone 1: Dar es Salaam CBD (Kariakoo, Posta, Ilala, Kisutu)',
  'Zone 2: Dar es Salaam Inner Ring (Kinondoni, Sinza, Mikocheni, Masaki, Oysterbay)',
  'Zone 3: Dar es Salaam Outer Ring (Mbezi Beach, Tegeta, Kigamboni, Goba, Tabata)',
  'Zone 4: Pwani & Suburbs (Bagamoyo, Kibaha, Mkuranga)',
  'Zone 5: Northern Zone (Arusha, Moshi, Tanga, Kilimanjaro)',
  'Zone 6: Lake Zone (Mwanza, Shinyanga, Bukoba, Musoma)',
  'Zone 7: Central & Southern Highlands (Dodoma, Morogoro, Iringa, Mbeya)',
  'All Tanzania Serviceable Zones'
];

const IdentitySection = ({ data, onChange }: any) => (
  <div className="space-y-4 text-xs">
    <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
      <Truck className="w-4 h-4 text-blue-600" />
      <h4 className="font-bold text-slate-800 text-sm">1. Delivery Rule Identity & Classification</h4>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block font-bold text-slate-700 mb-1">Rule Name *</label>
        <input
          type="text"
          value={data.name || ''}
          onChange={e => onChange({ name: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500"
          placeholder="e.g. Express Same-Day Dar CBD"
        />
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1">Delivery Type *</label>
        <SearchableSelect
          options={DELIVERY_RULE_TYPES}
          value={data.type || 'Same-Day'}
          onChange={val => onChange({ type: val })}
        />
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1">Target Delivery Zone *</label>
        <SearchableSelect
          options={DELIVERY_ZONES}
          value={data.zone || 'Zone 1: Dar es Salaam CBD (Kariakoo, Posta, Ilala, Kisutu)'}
          onChange={val => onChange({ zone: val })}
        />
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1">Zone Detection Keywords (Comma-separated)</label>
        <input
          type="text"
          value={data.keywords || 'kariakoo, posta, ilala, kisutu, upanga, kivukoni'}
          onChange={e => onChange({ keywords: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
          placeholder="kariakoo, posta, ilala"
        />
        <p className="text-[10px] text-slate-400 mt-1">Automatically assigns destination address to this zone based on match.</p>
      </div>
    </div>
  </div>
);

const PricingSection = ({ data, onChange }: any) => (
  <div className="space-y-4 text-xs">
    <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
      <DollarSign className="w-4 h-4 text-emerald-600" />
      <h4 className="font-bold text-slate-800 text-sm">2. Automated Fee Calculation & Pricing Matrix</h4>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block font-bold text-slate-700 mb-1">Base Delivery Fee (TZS)</label>
        <input
          type="number"
          value={data.baseFee ?? data.fee ?? 3500}
          onChange={e => onChange({ baseFee: Number(e.target.value), fee: Number(e.target.value) })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-xs"
        />
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1">Distance Rate (TZS / km)</label>
        <input
          type="number"
          value={data.distanceRate ?? 500}
          onChange={e => onChange({ distanceRate: Number(e.target.value) })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-xs"
        />
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1">Free Delivery Threshold (TZS)</label>
        <input
          type="number"
          value={data.freeThresholdAmount ?? 150000}
          onChange={e => onChange({ freeThresholdAmount: Number(e.target.value) })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-xs"
          placeholder="0 to disable"
        />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
        <label className="font-bold text-slate-700 block">Priority Multipliers</label>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <span className="text-[10px] text-slate-500 font-semibold block">Normal</span>
            <input
              type="text"
              readOnly
              value="1.0x"
              className="w-full bg-slate-200/60 px-2 py-1 rounded text-center font-mono font-bold"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-semibold block">High (+25%)</span>
            <input
              type="number"
              step="0.05"
              value={data.highPriorityMultiplier ?? 1.25}
              onChange={e => onChange({ highPriorityMultiplier: Number(e.target.value) })}
              className="w-full bg-white border border-slate-300 px-2 py-1 rounded text-center font-mono font-bold"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-semibold block">Urgent (+50%)</span>
            <input
              type="number"
              step="0.05"
              value={data.urgentPriorityMultiplier ?? 1.5}
              onChange={e => onChange({ urgentPriorityMultiplier: Number(e.target.value) })}
              className="w-full bg-white border border-slate-300 px-2 py-1 rounded text-center font-mono font-bold"
            />
          </div>
        </div>
      </div>

      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
        <label className="font-bold text-slate-700 block">Payment Method Feasibility</label>
        <div className="space-y-1.5 pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.allowCOD ?? true}
              onChange={e => onChange({ allowCOD: e.target.checked })}
              className="rounded text-blue-600"
            />
            <span className="text-slate-700 font-medium">Allow Cash on Delivery (subject to Risk Engine)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.allowPrepaid ?? true}
              onChange={e => onChange({ allowPrepaid: e.target.checked })}
              className="rounded text-blue-600"
            />
            <span className="text-slate-700 font-medium">Allow Prepaid Escrow (Mobile Money & Card)</span>
          </label>
        </div>
      </div>
    </div>
  </div>
);

const SLAAndPackageSection = ({ data, onChange }: any) => (
  <div className="space-y-4 text-xs">
    <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
      <Clock className="w-4 h-4 text-amber-600" />
      <h4 className="font-bold text-slate-800 text-sm">3. Estimated Delivery Time (SLA) & Package Rules</h4>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block font-bold text-slate-700 mb-1">Estimated Delivery SLA Text *</label>
        <input
          type="text"
          value={data.slaText || 'Same-Day (2 - 4 Hours)'}
          onChange={e => onChange({ slaText: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
          placeholder="e.g. 1 - 2 Hours, 24 - 48 Hours"
        />
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1">Same-Day Cutoff Time</label>
        <input
          type="time"
          value={data.cutoffTime || '15:00'}
          onChange={e => onChange({ cutoffTime: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
        />
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1">Max Weight for Boda-Boda (kg)</label>
        <input
          type="number"
          value={data.maxBikeWeight ?? 15}
          onChange={e => onChange({ maxBikeWeight: Number(e.target.value) })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-xs"
        />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
      <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
        <div className="flex items-center gap-1.5 text-amber-900 font-bold">
          <Package className="w-4 h-4 text-amber-700" />
          <span>Weight & Bulky Surcharges</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] text-slate-600 font-semibold mb-1">Over 5kg Surcharge (TZS)</label>
            <input
              type="number"
              value={data.weightSurchargeTier1 ?? 2000}
              onChange={e => onChange({ weightSurchargeTier1: Number(e.target.value) })}
              className="w-full bg-white px-2 py-1 border border-slate-300 rounded font-mono font-bold"
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-600 font-semibold mb-1">Bulky / Van Surcharge (TZS)</label>
            <input
              type="number"
              value={data.bulkyVanSurcharge ?? 8000}
              onChange={e => onChange({ bulkyVanSurcharge: Number(e.target.value) })}
              className="w-full bg-white px-2 py-1 border border-slate-300 rounded font-mono font-bold"
            />
          </div>
        </div>
      </div>

      <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl space-y-2">
        <div className="flex items-center gap-1.5 text-rose-900 font-bold">
          <ShieldAlert className="w-4 h-4 text-rose-700" />
          <span>Delivery Restrictions & Rule Flags</span>
        </div>
        <div className="space-y-1 text-[11px] text-slate-700">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.restrictUpcountrySameDay ?? true}
              onChange={e => onChange({ restrictUpcountrySameDay: e.target.checked })}
              className="rounded text-rose-600"
            />
            <span>Block Same-Day requests for Upcountry destinations</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.requireProofOfDelivery ?? true}
              onChange={e => onChange({ requireProofOfDelivery: e.target.checked })}
              className="rounded text-rose-600"
            />
            <span>Mandatory OTP / Digital signature on delivery completion</span>
          </label>
        </div>
      </div>
    </div>
  </div>
);

const AutomationRoutingSection = ({ data, onChange }: any) => (
  <div className="space-y-4 text-xs">
    <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
      <Zap className="w-4 h-4 text-indigo-600" />
      <h4 className="font-bold text-slate-800 text-sm">4. Rider Auto-Assignment & Workflow Automation</h4>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block font-bold text-slate-700 mb-1">Rider Assignment Mode</label>
        <select
          value={data.assignmentMode || 'AUTO_PROXIMITY'}
          onChange={e => onChange({ assignmentMode: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
        >
          <option value="AUTO_PROXIMITY">Auto-Assign: Nearest Available Rider (Radius 5km)</option>
          <option value="AUTO_LEAST_LOADED">Auto-Assign: Least Loaded Active Rider</option>
          <option value="DISPATCH_POOL">Broadcast to Zone Rider Pool (First to Claim)</option>
          <option value="MANUAL_DISPATCH">Manual Operations Tower Assignment Only</option>
          <option value="STATION_INBOUND">Auto-Route to Selected Pickup Station Hub</option>
        </select>
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1">Initial Delivery Status</label>
        <select
          value={data.initialStatus || 'PENDING_UNASSIGNED'}
          onChange={e => onChange({ initialStatus: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
        >
          <option value="PENDING_UNASSIGNED">PENDING_UNASSIGNED (Awaiting Dispatch)</option>
          <option value="ASSIGNED">ASSIGNED (Immediately dispatches push alert to rider)</option>
          <option value="WAREHOUSE_STAGING">WAREHOUSE_STAGING (Awaiting Picking/Packing)</option>
        </select>
      </div>
    </div>

    <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2">
      <p className="font-bold text-indigo-950 text-xs flex items-center gap-1.5">
        <UserCheck className="w-4 h-4 text-indigo-600" />
        Connected Lifecycle Automation:
      </p>
      <p className="text-slate-600 leading-relaxed text-[11px]">
        When a delivery matching this rule is triggered, the system automatically dispatches notifications across
        <strong> Seller Hub → Warehouse Picking Floor → Pickup Station → Rider App → Customer Live Tracker</strong> with
        turn-by-turn map directions and escrow state synchronization.
      </p>
    </div>
  </div>
);

export const DeliveryRuleModal: React.FC<any> = ({ isOpen, onClose, onSave, initialData }) => {
  return (
    <BuilderModal
      title={initialData?.id ? `Edit Delivery Rule: ${initialData.name || 'Rule'}` : 'Create Delivery Rule Matrix'}
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      initialData={
        initialData || {
          name: '',
          type: 'Same-Day',
          zone: 'Zone 1: Dar es Salaam CBD (Kariakoo, Posta, Ilala, Kisutu)',
          keywords: 'kariakoo, posta, ilala, kisutu, upanga, kivukoni',
          baseFee: 3500,
          fee: 3500,
          distanceRate: 500,
          freeThresholdAmount: 150000,
          highPriorityMultiplier: 1.25,
          urgentPriorityMultiplier: 1.5,
          allowCOD: true,
          allowPrepaid: true,
          slaText: 'Same-Day (2 - 4 Hours)',
          cutoffTime: '15:00',
          maxBikeWeight: 15,
          weightSurchargeTier1: 2000,
          bulkyVanSurcharge: 8000,
          restrictUpcountrySameDay: true,
          requireProofOfDelivery: true,
          assignmentMode: 'AUTO_PROXIMITY',
          initialStatus: 'PENDING_UNASSIGNED',
          status: 'ACTIVE'
        }
      }
      sections={[
        { id: 'identity', label: '1. Identity & Zone', component: IdentitySection },
        { id: 'pricing', label: '2. Fee Matrix & COD', component: PricingSection },
        { id: 'sla', label: '3. SLA & Restrictions', component: SLAAndPackageSection },
        { id: 'automation', label: '4. Rider & Workflows', component: AutomationRoutingSection }
      ]}
    />
  );
};


import React from 'react';
import { BuilderModal } from '../../../components/builder/BuilderModal';
import { SearchableSelect, SelectOption } from '../../../components/common/SearchableSelect';

export const TARGET_TYPES: SelectOption[] = [
  { value: 'SELLER', label: 'Seller & Vendor Management', group: 'Ecosystem Targets' },
  { value: 'CUSTOMER', label: 'Customer & Shopper Policies', group: 'Ecosystem Targets' },
  { value: 'RIDER', label: 'Rider & Courier Logistics', group: 'Ecosystem Targets' },
  { value: 'PICKUP_STATION', label: 'Pickup Station Network', group: 'Ecosystem Targets' },
  { value: 'WAREHOUSE', label: 'Warehouse & Fulfillment Ops', group: 'Ecosystem Targets' },
  { value: 'SALESPERSON', label: 'Salesperson & Field Agents', group: 'Ecosystem Targets' },
  { value: 'ORDER', label: 'Order Processing & Checkout', group: 'Transaction Targets' },
  { value: 'PAYMENT', label: 'Payment, Escrow & COD Risk', group: 'Transaction Targets' },
  { value: 'DELIVERY', label: 'Delivery Zones & SLAs', group: 'Logistics Targets' },
  { value: 'INVENTORY', label: 'Inventory & Stock Governance', group: 'Operations Targets' },
  { value: 'COMMISSION', label: 'Commission & Take-Rates', group: 'Finance Targets' },
  { value: 'NOTIFICATION', label: 'Automated Notifications', group: 'Communication Targets' },
  { value: 'RISK', label: 'Fraud & Anti-Abuse Shield', group: 'Risk Targets' },
  { value: 'PLATFORM', label: 'Global Platform Policies', group: 'System Targets' }
];

export const TARGET_SPECIFIC_CONDITIONS: Record<string, SelectOption[]> = {
  SELLER: [
    { value: 'SELLER_KYC_UNVERIFIED', label: 'Seller KYC Status != APPROVED', group: 'Seller Conditions' },
    { value: 'SELLER_DISPATCH_TIME_GT_48H', label: 'Seller Dispatch Time > 48 Hours SLA', group: 'Seller Conditions' },
    { value: 'SELLER_RATING_LT_3_5', label: 'Seller Average Rating < 3.5 Stars', group: 'Seller Conditions' },
    { value: 'SELLER_CANCELLATION_RATE_GT_5', label: 'Seller Order Cancellation Rate > 5%', group: 'Seller Conditions' },
    { value: 'SELLER_BALANCE_GTE_MIN_PAYOUT', label: 'Available Balance >= Minimum Payout (TZS 20,000)', group: 'Seller Conditions' }
  ],
  CUSTOMER: [
    { value: 'CUSTOMER_COD_FAILURES_GTE', label: 'Customer COD Failures >= 2 Instances', group: 'Customer Conditions' },
    { value: 'CUSTOMER_UNCOLLECTED_PICKUPS_GTE', label: 'Uncollected Pickup Packages >= 2', group: 'Customer Conditions' },
    { value: 'CUSTOMER_RISK_SCORE_GT_50', label: 'Customer Risk Score > 50 (High Risk)', group: 'Customer Conditions' },
    { value: 'CUSTOMER_FIRST_ORDER', label: 'Customer Is Making First Platform Purchase', group: 'Customer Conditions' },
    { value: 'CUSTOMER_CART_TOTAL_GTE_100K', label: 'Order Subtotal >= TZS 100,000 (Free Shipping Eligible)', group: 'Customer Conditions' }
  ],
  RIDER: [
    { value: 'RIDER_ACTIVE_DELIVERIES_GTE_3', label: 'Rider Active Assigned Deliveries >= 3', group: 'Rider Conditions' },
    { value: 'RIDER_ACCEPTANCE_RATE_LT_80', label: 'Rider Delivery Acceptance Rate < 80%', group: 'Rider Conditions' },
    { value: 'RIDER_DELIVERY_SUCCESS_RATE_LT_90', label: 'Rider Successful Completion Rate < 90%', group: 'Rider Conditions' },
    { value: 'RIDER_OUTSIDE_GEOFENCE', label: 'Rider GPS Location Outside Assigned Geo-Zone', group: 'Rider Conditions' },
    { value: 'RIDER_OTP_VERIFIED', label: 'Delivery Handoff OTP Successfully Verified', group: 'Rider Conditions' }
  ],
  PICKUP_STATION: [
    { value: 'STATION_CAPACITY_GTE_90', label: 'Station Storage Capacity Utilization >= 90%', group: 'Station Conditions' },
    { value: 'PACKAGE_HELD_DAYS_GT_7', label: 'Package In-Station Hold Duration > 7 Days Expired', group: 'Station Conditions' },
    { value: 'STATION_OTP_MATCH', label: 'Customer Handover 4-Digit OTP Validated', group: 'Station Conditions' },
    { value: 'STATION_UNVERIFIED_PACKAGE', label: 'Incoming Package Physical Scan Mismatch', group: 'Station Conditions' }
  ],
  WAREHOUSE: [
    { value: 'INBOUND_PO_DISCREPANCY', label: 'Receiving Scan Count != Purchase Order Count', group: 'Warehouse Conditions' },
    { value: 'PICK_PACK_SLA_BREACH_GT_4H', label: 'Order Pick & Pack Queue Wait Time > 4 Hours', group: 'Warehouse Conditions' },
    { value: 'STOCK_LEVEL_BELOW_REORDER', label: 'Warehouse Stock Level <= Automated Reorder Point', group: 'Warehouse Conditions' }
  ],
  SALESPERSON: [
    { value: 'SALES_MONTHLY_TARGET_MET', label: 'Monthly Vendor Onboarding Target >= 100%', group: 'Sales Conditions' },
    { value: 'VENDOR_FIRST_SALE_COMPLETED', label: 'Referred Vendor Completes First Sale > TZS 100k', group: 'Sales Conditions' },
    { value: 'COMMISSION_PAYOUT_REQUESTED', label: 'Salesperson Balance >= TZS 50,000 Requested', group: 'Sales Conditions' }
  ],
  ORDER: [
    { value: 'ORDER_TOTAL_GT_1M', label: 'Order Grand Total > TZS 1,000,000', group: 'Order Conditions' },
    { value: 'PAYMENT_METHOD_IS_COD', label: 'Payment Method == Cash On Delivery (COD)', group: 'Order Conditions' },
    { value: 'ORDER_DESTINATION_REMOTE', label: 'Destination Outside Standard Courier Zone', group: 'Order Conditions' }
  ],
  PAYMENT: [
    { value: 'ESCROW_AUTO_RELEASE_CONDITIONS_MET', label: 'Order Delivered + OTP Confirmed + Dispute Free', group: 'Payment Conditions' },
    { value: 'REPEATED_PAYMENT_FAILURE', label: 'Payment Gateway Failures >= 3 Consecutive Times', group: 'Payment Conditions' },
    { value: 'COD_ORDER_REJECTED_AT_DOOR', label: 'Buyer Refuses COD Payment at Doorstep', group: 'Payment Conditions' }
  ],
  DELIVERY: [
    { value: 'DELIVERY_DISTANCE_GT_15KM', label: 'Distance from Fulfillment Hub > 15 KM', group: 'Delivery Conditions' },
    { value: 'PEAK_HOURS_ACTIVE', label: 'Time of Day Between 16:30 - 20:00 (Rush Hour)', group: 'Delivery Conditions' },
    { value: 'INCLEMENT_WEATHER_ALERT', label: 'Severe Weather Warning Flagged in Delivery Zone', group: 'Delivery Conditions' }
  ],
  INVENTORY: [
    { value: 'INVENTORY_STOCK_ZERO', label: 'Stock Quantity Available == 0', group: 'Inventory Conditions' },
    { value: 'INVENTORY_BELOW_MINIMUM', label: 'Stock Quantity < Safety Stock Minimum', group: 'Inventory Conditions' }
  ],
  COMMISSION: [
    { value: 'CATEGORY_ELECTRONICS_QUALIFIED', label: 'Product Category in [Phones, Computers, Audio]', group: 'Commission Conditions' },
    { value: 'VENDOR_VOLUME_TIER_GOLD', label: 'Vendor 30-Day Completed GMV >= TZS 50,000,000', group: 'Commission Conditions' }
  ],
  NOTIFICATION: [
    { value: 'ORDER_SHIPPED_EVENT', label: 'Order Status Changed to SHIPPED / OUT_FOR_DELIVERY', group: 'Notification Conditions' },
    { value: 'LOW_STOCK_EVENT', label: 'Item Stock Level Reaches Warning Threshold', group: 'Notification Conditions' }
  ],
  RISK: [
    { value: 'RISK_IP_SUSPICIOUS', label: 'Order IP Location Differs from Shipping City', group: 'Risk Conditions' },
    { value: 'RISK_HIGH_VELOCITY_ORDERS', label: 'Multiple High-Value Orders from Same Device ID < 10min', group: 'Risk Conditions' }
  ],
  PLATFORM: [
    { value: 'SYSTEM_MAINTENANCE_SCHEDULED', label: 'Maintenance Window Active', group: 'Platform Conditions' },
    { value: 'SYSTEM_ERROR_RATE_GT_1', label: 'System API Error Rate > 1%', group: 'Platform Conditions' }
  ]
};

export const TARGET_SPECIFIC_ACTIONS: Record<string, SelectOption[]> = {
  SELLER: [
    { value: 'LOCK_SELLER_CATALOG_LISTING', label: 'Lock Catalog: Restrict New Product Creation', group: 'Seller Actions' },
    { value: 'APPLY_VENDOR_SLA_PENALTY', label: 'Apply 2% Late Fulfillment SLA Penalty', group: 'Seller Actions' },
    { value: 'TEMPORARILY_SUSPEND_PAYOUTS', label: 'Freeze Seller Payout Wallet Pending Review', group: 'Seller Actions' },
    { value: 'AWARD_SELLER_BADGE_TOP_RATED', label: 'Promote Seller: Award Diamond Star Verified Badge', group: 'Seller Actions' }
  ],
  CUSTOMER: [
    { value: 'DISABLE_PAYMENT_COD', label: 'Disable Pay on Delivery (Enforce Online Prepayment)', group: 'Customer Actions' },
    { value: 'APPLY_FREE_DELIVERY_DISCOUNT', label: 'Apply 100% Free Shipping Voucher Discount', group: 'Customer Actions' },
    { value: 'FLAG_FOR_ANTI_FRAUD_REVIEW', label: 'Flag Customer Account for Anti-Fraud Review', group: 'Customer Actions' },
    { value: 'SEND_SMS_REMINDER', label: 'Trigger Automated SMS Reminder with Action Link', group: 'Customer Actions' }
  ],
  RIDER: [
    { value: 'ASSIGN_NEAREST_RIDER', label: 'Auto-Assign Next Order to Nearest Active Rider', group: 'Rider Actions' },
    { value: 'PAUSE_RIDER_ORDER_QUEUE', label: 'Pause Delivery Intake Queue for Rider', group: 'Rider Actions' },
    { value: 'CREDIT_RIDER_WALLET_INSTANT', label: 'Credit Rider Wallet with Delivery Fee + Bonus', group: 'Rider Actions' },
    { value: 'DISPATCH_SOS_SAFETY_SUPPORT', label: 'Alert Operations Dispatch Team for Support', group: 'Rider Actions' }
  ],
  PICKUP_STATION: [
    { value: 'ROUTE_TO_ALTERNATIVE_STATION', label: 'Reroute New Shipments to Nearest Available Station', group: 'Station Actions' },
    { value: 'TRIGGER_EXPIRED_PACKAGE_RETURN', label: 'Generate Return Waybill & Notify Central Warehouse', group: 'Station Actions' },
    { value: 'CREDIT_STATION_HANDLING_FEE', label: 'Credit Station Partner Wallet with TZS 1,500 Fee', group: 'Station Actions' }
  ],
  WAREHOUSE: [
    { value: 'GENERATE_STOCK_REORDER_ALERT', label: 'Generate Automated Supplier Reorder Request', group: 'Warehouse Actions' },
    { value: 'ESCALATE_TO_FLOOR_SUPERVISOR', label: 'Escalate Queue Delay to Floor Operations Supervisor', group: 'Warehouse Actions' }
  ],
  SALESPERSON: [
    { value: 'CREDIT_SALESPERSON_COMMISSION', label: 'Credit Salesperson Commission Account', group: 'Sales Actions' },
    { value: 'AWARD_SALES_TARGET_BONUS', label: 'Unlock Tier Target Accelerator Bonus', group: 'Sales Actions' }
  ],
  ORDER: [
    { value: 'REQUIRE_PREPAYMENT', label: 'Require Immediate Mobile Money / Card Prepayment', group: 'Order Actions' },
    { value: 'HOLD_ESCROW_7_DAYS', label: 'Hold Escrow Settlement for 7 Days Post-Delivery', group: 'Order Actions' },
    { value: 'AUTO_APPROVE_ORDER', label: 'Auto-Approve Order & Send to Vendor Queue', group: 'Order Actions' }
  ],
  PAYMENT: [
    { value: 'RELEASE_ESCROW_IMMEDIATE', label: 'Release Escrow & Credit Seller/Rider Wallets Instantly', group: 'Payment Actions' },
    { value: 'FREEZE_ESCROW_DISPUTE', label: 'Freeze Escrow Funds & Open Support Dispute Ticket', group: 'Payment Actions' }
  ],
  DELIVERY: [
    { value: 'APPLY_SURCHARGE_TZS_3000', label: 'Apply Distance / Peak Surge Fee (TZS 3,000)', group: 'Delivery Actions' },
    { value: 'ENABLE_EXPRESS_1HR_OPTION', label: 'Enable 1-Hour Ultra-Fast Delivery Option', group: 'Delivery Actions' }
  ],
  INVENTORY: [
    { value: 'MARK_PRODUCT_OUT_OF_STOCK', label: 'Mark Product Listing as OUT OF STOCK on Storefront', group: 'Inventory Actions' },
    { value: 'SEND_LOW_STOCK_ALERT_TO_SELLER', label: 'Send Low Stock Warning Alert to Seller Dashboard', group: 'Inventory Actions' }
  ],
  COMMISSION: [
    { value: 'APPLY_REDUCED_COMMISSION_TIER', label: 'Apply Reduced 8% Gold Partner Take-Rate', group: 'Commission Actions' },
    { value: 'APPLY_STANDARD_COMMISSION', label: 'Apply Standard Category Base Commission', group: 'Commission Actions' }
  ],
  NOTIFICATION: [
    { value: 'SEND_PUSH_AND_SMS', label: 'Broadcast Real-Time App Push & SMS Notification', group: 'Notification Actions' },
    { value: 'NOTIFY_DISPATCH_AND_SELLER', label: 'Notify Operations Dispatch and Vendor Simultaneously', group: 'Notification Actions' }
  ],
  RISK: [
    { value: 'BLOCK_CHECKOUT_ATTEMPT', label: 'Block Suspicious Checkout Attempt & Alert Security', group: 'Risk Actions' },
    { value: 'REQUIRE_STEP_UP_OTP', label: 'Require Step-Up SMS/Email OTP Authentication', group: 'Risk Actions' }
  ],
  PLATFORM: [
    { value: 'ENABLE_MAINTENANCE_BANNER', label: 'Display System Notification Banner on Storefront', group: 'Platform Actions' },
    { value: 'TRIGGER_SYSTEM_HEALTH_ALERT', label: 'Trigger DevOps Incident Alert to Engineering', group: 'Platform Actions' }
  ]
};

const BasicSection = ({ data, onChange }: any) => {
  const currentTarget = data.target || 'ORDER';

  return (
    <div className="space-y-4 text-xs">
      <h4 className="font-bold text-slate-800 text-base mb-2">1. Business Rule Identity & Ecosystem Target</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Target Ecosystem Entity</label>
          <SearchableSelect
            options={TARGET_TYPES}
            value={currentTarget}
            onChange={val => {
              const condOptions = TARGET_SPECIFIC_CONDITIONS[val] || [];
              const actOptions = TARGET_SPECIFIC_ACTIONS[val] || [];
              onChange({
                target: val,
                category: val.charAt(0) + val.slice(1).toLowerCase().replace(/_/g, ' '),
                condition: condOptions[0]?.value || data.condition,
                action: actOptions[0]?.value || data.action
              });
            }}
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Rule Name</label>
          <input
            type="text"
            value={data.name || ''}
            onChange={e => onChange({ name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
            placeholder="e.g. Prevent Repeated COD Non-Collection"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block font-semibold text-slate-700 mb-1">Rule Description & Business Intent</label>
          <input
            type="text"
            value={data.description || ''}
            onChange={e => onChange({ description: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
            placeholder="e.g. Automatically switches customer to online prepayment if 2 previous COD orders were rejected or uncollected."
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Execution Priority (1 = Highest)</label>
          <select
            value={data.priority || 1}
            onChange={e => onChange({ priority: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
          >
            <option value={1}>1 - Critical Security / Anti-Fraud</option>
            <option value={2}>2 - High Financial / Escrow Control</option>
            <option value={3}>3 - Medium Fulfillment / Logistics</option>
            <option value={4}>4 - Standard Customer Policy</option>
            <option value={5}>5 - Low Informational / Bonus Rule</option>
          </select>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <input
            type="checkbox"
            id="ruleActive"
            checked={data.active !== false}
            onChange={e => onChange({ active: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded cursor-pointer"
          />
          <label htmlFor="ruleActive" className="font-bold text-slate-800 cursor-pointer">
            Enable Rule Enactment Immediately
          </label>
        </div>
      </div>
    </div>
  );
};

const LogicSection = ({ data, onChange }: any) => {
  const currentTarget = data.target || 'ORDER';
  const availableConditions = TARGET_SPECIFIC_CONDITIONS[currentTarget] || TARGET_SPECIFIC_CONDITIONS.ORDER;
  const availableActions = TARGET_SPECIFIC_ACTIONS[currentTarget] || TARGET_SPECIFIC_ACTIONS.ORDER;

  return (
    <div className="space-y-4 text-xs">
      <h4 className="font-bold text-slate-800 text-base mb-2">2. Conditional IF → THEN Logic ({currentTarget})</h4>

      <div>
        <label className="block font-bold text-slate-800 mb-1">
          IF Condition Trigger (Filtered for {currentTarget})
        </label>
        <SearchableSelect
          options={availableConditions}
          value={data.condition || availableConditions[0]?.value}
          onChange={val => onChange({ condition: val })}
        />
      </div>

      <div>
        <label className="block font-bold text-slate-800 mb-1">
          THEN Automated Action (Filtered for {currentTarget})
        </label>
        <SearchableSelect
          options={availableActions}
          value={data.action || availableActions[0]?.value}
          onChange={val => onChange({ action: val })}
        />
      </div>

      <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-slate-700">
        <p className="font-bold text-blue-900 mb-1">⚡ Dynamic System Execution Preview:</p>
        <p className="font-mono text-[11px] text-blue-800">
          WHEN <strong>[{currentTarget}]</strong> EVENT OCCURS AND (<strong>{data.condition || availableConditions[0]?.label}</strong>) → EXECUTE (<strong>{data.action || availableActions[0]?.label}</strong>)
        </p>
      </div>
    </div>
  );
};

export const BusinessRuleModal: React.FC<any> = ({ isOpen, onClose, onSave, initialData }) => {
  return (
    <BuilderModal
      title={initialData?.id ? 'Edit Business Rule' : 'Create Business Rule'}
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      initialData={initialData || { name: '', target: 'ORDER', category: 'Order', active: true, priority: 1 }}
      sections={[
        { id: 'basic', label: 'Rule Identity & Target', component: BasicSection },
        { id: 'logic', label: 'Conditional Logic', component: LogicSection }
      ]}
    />
  );
};

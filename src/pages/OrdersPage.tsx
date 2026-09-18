import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useOrder } from '../context/OrderContext';
import { useChat } from '../context/ChatContext';
import { useNotification } from '../context/NotificationContext';
import { formatCurrency, formatOrderDate } from '../utils/formatters';
import { BackButton } from '../components/common/BackButton';
import {
  Package,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Clock,
  MessageSquare,
  RotateCcw,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  MapPin,
  Check,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';
import { OrderStatus, Order } from '../types';
import { DisputeModal } from '../components/common/DisputeModal';

export const OrdersPage: React.FC = () => {
  const { orders, updateOrderStatus, cancelOrder } = useOrder();
  const { openChatWithSeller } = useChat();
  const { showToast } = useNotification();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(orders[0]?.id || null);
  const [disputingOrder, setDisputingOrder] = useState<Order | null>(null);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Processing':
        return (
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <ShieldCheck size={12} />
            LUMO Escrow Vaulted
          </span>
        );
      case 'Confirmed':
        return (
          <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 size={12} />
            Merchant Packed
          </span>
        );
      case 'Shipped':
        return (
          <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Truck size={12} />
            Dispatched & In Transit
          </span>
        );
      case 'Out for Delivery':
        return (
          <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Package size={12} />
            Out for Delivery
          </span>
        );
      case 'Delivered':
        return (
          <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 size={12} />
            Delivered & Escrow Released
          </span>
        );
      case 'Cancelled':
        return (
          <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <RotateCcw size={12} />
            Cancelled & Refunded
          </span>
        );
      default:
        return (
          <span className="bg-neutral-100 text-neutral-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
            {status}
          </span>
        );
    }
  };

  const handleConfirmReceipt = (orderId: string) => {
    updateOrderStatus(orderId, 'Delivered', 'Customer confirmed receipt and inspection. Escrow payment released to seller.');
    showToast('Delivery confirmed! Merchant payout released from Escrow.', 'success');
  };

  const handleRequestReturn = (orderId: string) => {
    cancelOrder(orderId, 'Customer requested return within 7-day guarantee window.');
    showToast('Return dispute opened. LUMO Escrow freeze activated.', 'info');
  };

  // Helper to determine step progress index (0 to 3)
  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'Processing':
      case 'Confirmed':
        return 0;
      case 'Shipped':
        return 1;
      case 'Out for Delivery':
        return 2;
      case 'Delivered':
        return 3;
      default:
        return 0;
    }
  };

  const steps = [
    { title: 'Confirmed', desc: 'Order placed & escrow vaulted' },
    { title: 'Shipped', desc: 'Dispatched from hub' },
    { title: 'Out for Delivery', desc: 'Courier on the way' },
    { title: 'Delivered', desc: 'Inspected & payout released' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="w-full px-2 sm:px-4 lg:px-6 py-6 sm:py-8 space-y-6 max-w-5xl mx-auto"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <BackButton label="Back" fallbackUrl="/account" />
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
              My Orders & Visual Escrow Tracking
            </h1>
            <p className="text-xs text-neutral-500">
              Track your packages live, inspect delivered items and release payments to merchants
            </p>
          </div>
        </div>

        <Link
          to="/products"
          className="text-xs font-bold text-[#FF6A00] hover:underline flex items-center gap-1"
        >
          <span>Shop More</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center space-y-3">
          <Package size={32} className="text-neutral-400 mx-auto" />
          <h3 className="font-bold text-sm text-neutral-800">No Orders Placed Yet</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            When you purchase items on LUMO, your active orders and visual escrow tracking will appear here.
          </p>
          <Link
            to="/products"
            className="inline-block px-4 py-2 bg-[#FF6A00] text-white font-bold text-xs rounded-xl shadow-xs"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const currentStepIdx = getStepIndex(order.status);
            const isCancelled = order.status === 'Cancelled';

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden"
              >
                {/* Order Header Summary */}
                <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 bg-neutral-50/60">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-sm text-neutral-900">{order.orderNumber}</span>
                      {getStatusBadge(order.status)}
                      {order.paymentMethod?.type === 'cod' && (
                        <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                          💵 COD ({formatCurrency(order.pricing.total)})
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500">
                      Placed on {formatOrderDate(order.createdAt)} • Payment: <strong>{order.paymentMethod.name}</strong>
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-neutral-400 font-bold uppercase block">Total Amount</span>
                      <span className="font-black text-sm sm:text-base text-neutral-900">
                        {formatCurrency(order.pricing.total)}
                      </span>
                    </div>

                    <button
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className="px-3 py-2 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isExpanded ? 'Hide Tracking' : 'Track Order'}</span>
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                  </div>
                </div>

                {/* COD Customer Handover Notice */}
                {order.paymentMethod?.type === 'cod' && order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                  <div className="p-4 bg-amber-50/90 border-b border-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="font-extrabold text-amber-950 flex items-center gap-1.5">
                        <span>💵 Pay on Delivery Handover Instructions</span>
                      </div>
                      <p className="text-amber-900 text-[11px]">
                        Please have exactly <span className="font-bold font-mono underline">{formatCurrency(order.pricing.total)}</span> ready in cash for the courier. Provide this 4-digit handover code only after inspecting parcel.
                      </p>
                    </div>
                    <div className="bg-white px-3.5 py-2 rounded-xl border border-amber-300 shadow-2xs text-center shrink-0">
                      <span className="text-[9px] uppercase tracking-wider text-neutral-500 block font-bold">Handover OTP</span>
                      <span className="font-mono text-base font-extrabold text-emerald-700 tracking-widest">{order.otpCode || '----'}</span>
                    </div>
                  </div>
                )}

                {/* VISUAL ORDER TRACKING PROGRESS STEP INDICATOR */}
                {!isCancelled && (
                  <div className="p-5 sm:p-6 bg-white border-b border-neutral-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                        <Truck size={14} className="text-[#FF6A00]" />
                        <span>Live Delivery & Escrow Progress</span>
                      </h4>
                      <span className="text-xs font-bold text-[#FF6A00]">
                        {steps[currentStepIdx]?.title} ({Math.round(((currentStepIdx + 1) / steps.length) * 100)}%)
                      </span>
                    </div>

                    {/* Step Bar Visual */}
                    <div className="relative py-2">
                      <div className="absolute top-1/2 left-0 right-0 h-1 bg-neutral-100 -translate-y-1/2 z-0" />
                      <div
                        className="absolute top-1/2 left-0 h-1 bg-[#FF6A00] -translate-y-1/2 transition-all duration-500 z-0"
                        style={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}
                      />

                      <div className="relative z-10 flex items-center justify-between">
                        {steps.map((step, sIdx) => {
                          const isCompleted = sIdx <= currentStepIdx;
                          const isCurrent = sIdx === currentStepIdx;

                          return (
                            <div key={sIdx} className="flex flex-col items-center text-center group">
                              <div
                                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                                  isCompleted
                                    ? 'bg-[#FF6A00] text-white shadow-md'
                                    : 'bg-neutral-100 text-neutral-400 border border-neutral-200'
                                } ${isCurrent ? 'ring-4 ring-orange-100 scale-110' : ''}`}
                              >
                                {isCompleted ? <Check size={16} /> : sIdx + 1}
                              </div>
                              <div className="mt-2 max-w-[80px] sm:max-w-[120px]">
                                <div className={`text-[11px] sm:text-xs font-bold ${isCurrent ? 'text-[#FF6A00]' : 'text-neutral-800'}`}>
                                  {step.title}
                                </div>
                                <div className="text-[10px] text-neutral-400 hidden sm:block leading-tight mt-0.5">
                                  {step.desc}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Items & Audit Log (Expandable details) */}
                {isExpanded && (
                  <div className="p-4 sm:p-6 space-y-5 bg-neutral-50/40">
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Ordered Items</h4>
                      <div className="divide-y divide-neutral-100 bg-white rounded-2xl border border-neutral-200 px-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="py-3 flex items-center justify-between text-xs gap-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                className="w-12 h-12 rounded-xl object-contain border border-neutral-100 shrink-0 bg-neutral-50"
                              />
                              <div>
                                <Link
                                  to={`/products/${item.productId}`}
                                  className="font-bold text-neutral-900 hover:text-[#FF6A00] line-clamp-1"
                                >
                                  {item.productName}
                                </Link>
                                <span className="text-[11px] text-neutral-500">
                                  Seller: {item.sellerName} • Qty: {item.quantity}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="font-bold text-neutral-900">
                                {formatCurrency(item.totalPrice)}
                              </span>
                              <button
                                onClick={() =>
                                  openChatWithSeller(
                                    'seller-1',
                                    item.sellerName,
                                    item.productId,
                                    item.productName
                                  )
                                }
                                className="p-2 bg-neutral-100 hover:bg-orange-50 hover:text-[#FF6A00] rounded-xl text-neutral-600 transition cursor-pointer"
                                title="Chat with Seller"
                              >
                                <MessageSquare size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status Audit Log */}
                    <div className="p-4 bg-white rounded-2xl border border-neutral-200 space-y-2.5 text-xs">
                      <span className="font-bold text-neutral-900 block">Escrow & Tracking Audit Trail</span>
                      <div className="space-y-2">
                        {order.statusHistory.map((h, hIdx) => (
                          <div key={hIdx} className="flex items-start gap-2.5 text-[11px]">
                            <div className="w-2 h-2 rounded-full bg-[#FF6A00] mt-1 shrink-0" />
                            <div>
                              <div className="font-bold text-neutral-800">{h.status}</div>
                              <div className="text-neutral-600">{h.note}</div>
                              <div className="text-neutral-400 text-[10px]">{formatOrderDate(h.date)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Escrow Status & Confirmation Actions */}
                <div className="p-4 sm:p-5 border-t border-neutral-100 bg-neutral-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs">
                    <ShieldCheck size={16} className="text-emerald-600" />
                    <span className="font-bold text-neutral-900">LUMO Escrow Status:</span>
                    <span className="text-neutral-700 font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-neutral-200">
                      {order.paymentMethod.status}
                    </span>
                  </div>

                  {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => handleConfirmReceipt(order.id)}
                        className="flex-1 sm:flex-none py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 size={15} />
                        <span>Confirm Receipt & Release Payout</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDisputingOrder(order)}
                        className="py-2 px-4 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ShieldAlert size={14} />
                        <span>Open Dispute / Return</span>
                      </button>
                    </div>
                  )}

                  {order.status === 'Delivered' && (
                    <div className="flex items-center justify-between w-full sm:w-auto gap-3">
                      <div className="text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-emerald-600" />
                        <span>Funds successfully released to merchant from Escrow Vault.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDisputingOrder(order)}
                        className="text-[11px] text-slate-500 hover:text-rose-600 underline font-bold"
                      >
                        Post-delivery claim?
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reusable Dispute & Escrow Modal */}
      {disputingOrder && (
        <DisputeModal
          isOpen={Boolean(disputingOrder)}
          onClose={() => setDisputingOrder(null)}
          order={disputingOrder}
          onSuccess={(dispute) => {
            showToast(`Dispute #${dispute.disputeNumber || dispute.id} submitted. Escrow funds locked.`, 'info');
          }}
        />
      )}
    </motion.div>
  );
};

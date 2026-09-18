import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useOrder } from '../context/OrderContext';
import { formatCurrency, formatOrderDate } from '../utils/formatters';
import { BackButton } from '../components/common/BackButton';
import {
  CheckCircle2,
  ShieldCheck,
  Package,
  MapPin,
  Truck,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';

export const OrderSuccessPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { getOrderById } = useOrder();

  const order = orderId ? getOrderById(orderId) : undefined;

  if (!order) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="max-w-xl mx-auto px-4 py-16 text-center space-y-4"
      >
        <h2 className="text-xl font-bold text-neutral-900">Order Placed Successfully</h2>
        <p className="text-xs text-neutral-500">Thank you for your order on LUMO.</p>
        <div className="pt-2 flex justify-center gap-3">
          <BackButton label="Home" fallbackUrl="/" />
          <Link to="/account/orders" className="inline-block px-5 py-2.5 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-bold text-xs rounded-xl transition">
            View My Orders
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="w-full px-2 sm:px-4 lg:px-6 py-8 sm:py-12 space-y-6 max-w-4xl mx-auto"
    >
      <div className="flex items-center justify-start">
        <BackButton label="Back to Orders" fallbackUrl="/account/orders" />
      </div>

      {/* Success Badge Banner */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-6 sm:p-8 text-center shadow-xl space-y-3">
        <div className="w-16 h-16 rounded-full bg-white text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 size={36} />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          Asante Sana! Order Confirmed
        </h1>

        <p className="text-xs sm:text-sm text-emerald-100 max-w-md mx-auto leading-relaxed">
          Your payment of <strong className="text-white font-black">{formatCurrency(order.pricing.total)}</strong> has been secured in <strong>LUMO Escrow</strong>.
        </p>

        <div className="inline-flex items-center gap-2 bg-emerald-950/40 text-emerald-200 border border-emerald-400/30 px-3.5 py-1.5 rounded-full text-xs font-bold">
          <ShieldCheck size={16} />
          <span>Tracking Ref: {order.trackingNumber}</span>
        </div>
      </div>

      {/* Order Details Receipt Card */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-100 gap-2">
          <div>
            <span className="text-xs text-neutral-400 uppercase font-bold tracking-wider">Order Reference</span>
            <h3 className="text-base font-black text-neutral-900">{order.orderNumber}</h3>
            <span className="text-xs text-neutral-500">{formatOrderDate(order.createdAt)}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
              ESCROW FUNDS SECURED
            </span>
          </div>
        </div>

        {/* Delivery & Payment info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-100 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-neutral-900 mb-1">
              <MapPin size={14} className="text-[#FF6A00]" />
              <span>Delivery Details:</span>
            </div>
            <p className="font-semibold text-neutral-800">{order.customer.name}</p>
            <p className="text-neutral-600">{order.customer.phone}</p>
            <p className="text-neutral-600">
              {order.deliveryAddress.streetAddress}, {order.deliveryAddress.area}, {order.deliveryAddress.region}
            </p>
            <p className="text-[11px] text-neutral-500 pt-1">Method: {order.deliveryMethod.name}</p>
          </div>

          <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-100 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-neutral-900 mb-1">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Payment & Escrow Protection:</span>
            </div>
            <p className="text-neutral-700">Payment: <strong>{order.paymentMethod.name}</strong></p>
            <p className="text-neutral-700">Status: <strong className="text-emerald-700">{order.paymentMethod.status}</strong></p>
            <p className="text-[11px] text-neutral-500 leading-tight pt-1">
              The merchant will prepare your package. Funds are released only after you confirm satisfaction.
            </p>
          </div>
        </div>

        {/* Purchased Items List */}
        <div className="space-y-3 pt-2">
          <h4 className="font-bold text-xs text-neutral-900 uppercase tracking-wider">Ordered Items</h4>
          <div className="divide-y divide-neutral-100">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-10 h-10 rounded-lg object-contain border border-neutral-100 shrink-0"
                  />
                  <div>
                    <span className="font-bold text-neutral-900 line-clamp-1">{item.productName}</span>
                    <span className="text-[11px] text-neutral-500">
                      Qty: {item.quantity} • {formatCurrency(item.unitPrice)} each
                    </span>
                  </div>
                </div>
                <span className="font-extrabold text-neutral-900 shrink-0">
                  {formatCurrency(item.totalPrice)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row gap-3 justify-between">
          <Link
            to="/account/orders"
            className="px-5 py-3 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-bold text-xs sm:text-sm rounded-xl text-center shadow-md transition flex items-center justify-center gap-1.5"
          >
            <Package size={16} />
            <span>Track Order Status</span>
          </Link>

          <Link
            to="/products"
            className="px-5 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs sm:text-sm rounded-xl text-center transition flex items-center justify-center gap-1.5"
          >
            <ShoppingBag size={16} />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

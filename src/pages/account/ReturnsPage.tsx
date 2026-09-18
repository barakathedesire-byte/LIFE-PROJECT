import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { formatTZS } from '../../utils/formatters';
import { 
  RotateCcw, 
  ShieldCheck, 
  Package, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Plus,
  X,
  Building2,
  FileText,
  Ban
} from 'lucide-react';
import { ReturnRequest, Order } from '../../types';

export const ReturnsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [returnsList, setReturnsList] = useState<ReturnRequest[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [returnQuantity, setReturnQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>('DEFECTIVE');
  const [customerComment, setCustomerComment] = useState<string>('');
  const [pickupHub, setPickupHub] = useState<string>('LUMO Kariakoo Central Station Hub');

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const [retRes, ordRes] = await Promise.all([
        api.getReturns(),
        api.getOrders()
      ]);

      setReturnsList(retRes.returns || []);
      // Filter orders to non-cancelled orders belonging to this customer
      const validOrders = (ordRes.orders || []).filter(o => o.status !== 'Cancelled');
      setMyOrders(validOrders);
      if (validOrders.length > 0 && !selectedOrderId) {
        setSelectedOrderId(validOrders[0].id);
        if (validOrders[0].items && validOrders[0].items.length > 0) {
          setSelectedProductId(validOrders[0].items[0].productId);
        }
      }
    } catch (err: any) {
      console.error('Failed to load returns data:', err);
      setErrorMsg(err?.message || 'Failed to load your return requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeOrder = myOrders.find(o => o.id === selectedOrderId) || myOrders[0];
  const orderItems = activeOrder?.items || [];
  const activeItem = orderItems.find(i => i.productId === selectedProductId) || orderItems[0];
  const calculatedRefund = (Number(activeItem?.price) || 0) * returnQuantity;

  const handleOrderChange = (orderId: string) => {
    setSelectedOrderId(orderId);
    const ord = myOrders.find(o => o.id === orderId);
    if (ord && ord.items && ord.items.length > 0) {
      setSelectedProductId(ord.items[0].productId);
      setReturnQuantity(1);
    }
  };

  const handleItemChange = (productId: string) => {
    setSelectedProductId(productId);
    setReturnQuantity(1);
  };

  const handleCreateReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) {
      setErrorMsg('No eligible order selected.');
      return;
    }
    if (!activeItem) {
      setErrorMsg('No item selected from this order.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      const res = await api.requestReturn({
        orderId: activeOrder.id,
        orderNumber: activeOrder.orderNumber || activeOrder.id,
        productId: activeItem.productId,
        quantity: returnQuantity,
        reason: reason as any,
        customerComment,
        pickupStationOrAddress: pickupHub
      });

      if (res?.returnRequest) {
        setReturnsList(prev => [res.returnRequest, ...prev]);
        setSuccessMsg(`Return request #${res.returnRequest.returnNumber} submitted successfully.`);
      }
      setShowRequestModal(false);
      setCustomerComment('');
      setReturnQuantity(1);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit return request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelReturn = async (returnId: string) => {
    if (!confirm('Are you sure you want to cancel this return request?')) return;
    try {
      const res = await api.updateReturnStatus(returnId, 'CANCELLED');
      setReturnsList(prev => prev.map(r => r.id === returnId ? (res.returnRequest || { ...r, status: 'CANCELLED' }) : r));
      setSuccessMsg('Return request was cancelled.');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to cancel return request.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'REFUNDED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Refunded</span>;
      case 'APPROVED_FOR_REFUND':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Refund Approved</span>;
      case 'RETURN_REQUESTED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1"><Clock className="w-3 h-3" /> Under Review</span>;
      case 'UNDER_INSPECTION':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1"><RotateCcw className="w-3 h-3" /> Depot Inspection</span>;
      case 'RETURNED_TO_VENDOR':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1"><Package className="w-3 h-3" /> Returned to Seller</span>;
      case 'REJECTED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Rejected</span>;
      case 'CANCELLED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1"><Ban className="w-3 h-3" /> Cancelled</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* Top Banner */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 font-bold text-xl shadow-xs">
                <RotateCcw className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Returns & Escrow Refunds
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  7-Day Hassle-Free Returns with verified Escrow Wallet or M-Pesa refund clearance
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setErrorMsg(null);
                setSuccessMsg(null);
                setShowRequestModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Request New Return
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="max-w-5xl mx-auto px-4 pt-4">
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center justify-between mb-4">
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-900 cursor-pointer"><X className="w-4 h-4" /></button>
          </div>
        )}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800 flex items-center justify-between mb-4">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-rose-600 hover:text-rose-900 cursor-pointer"><X className="w-4 h-4" /></button>
          </div>
        )}
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 pt-2 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 text-lg">My Return Requests</h2>
            <span className="text-xs text-slate-500 font-medium">{returnsList.length} total requests</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">Loading return records...</div>
          ) : returnsList.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-800">No Return Requests Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You have not initiated any product return requests. When an eligible order arrives, you can request returns directly from here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {returnsList.map((ret) => (
                <div key={ret.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5 border border-slate-200 overflow-hidden">
                      {ret.productImage ? (
                        <img src={ret.productImage} alt={ret.productName} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900">{ret.productName}</span>
                        {getStatusBadge(ret.status)}
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        <span className="font-semibold text-slate-700">Reason:</span> {ret.reason.replace(/_/g, ' ')}
                        {ret.customerComment && <span className="text-slate-500 italic ml-1"> — "{ret.customerComment}"</span>}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        Return #{ret.returnNumber} • Order #{ret.orderNumber} • Seller: {ret.sellerName} • Qty: {ret.quantity}
                      </p>
                      {ret.rejectionReason && (
                        <p className="text-[11px] text-rose-600 mt-1 font-semibold">
                          Rejection note: {ret.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">Refund Amount</span>
                      <span className="font-bold text-sm text-slate-900">{formatTZS(ret.refundAmount)}</span>
                    </div>
                    {ret.status === 'RETURN_REQUESTED' && (
                      <button
                        onClick={() => handleCancelReturn(ret.id)}
                        className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 hover:underline mt-2 cursor-pointer"
                      >
                        Cancel Request
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* NEW RETURN MODAL */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-teal-600" />
                <h2 className="font-bold text-base text-slate-900">Initiate Return & Refund</h2>
              </div>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {myOrders.length === 0 ? (
              <div className="py-8 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                <h4 className="font-bold text-sm text-slate-800">No Eligible Orders Found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  You can only request returns for orders placed on your account. Once you place an order, you will be able to initiate returns here.
                </p>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateReturn} className="space-y-4 mt-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Select Order</label>
                  <select
                    value={selectedOrderId}
                    onChange={e => handleOrderChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none text-xs font-medium bg-white text-slate-900"
                  >
                    {myOrders.map(o => (
                      <option key={o.id} value={o.id}>
                        #{o.orderNumber || o.id} • {formatTZS(o.total)} • ({new Date(o.createdAt).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>

                {orderItems.length > 0 && (
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Select Purchased Item</label>
                    <select
                      value={selectedProductId}
                      onChange={e => handleItemChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none text-xs font-medium bg-white text-slate-900"
                    >
                      {orderItems.map(item => (
                        <option key={item.productId} value={item.productId}>
                          {item.productName} • {formatTZS(item.price)} (Qty: {item.quantity})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Quantity to Return</label>
                    <input
                      type="number"
                      min={1}
                      max={activeItem?.quantity || 1}
                      value={returnQuantity}
                      onChange={e => setReturnQuantity(Math.min(activeItem?.quantity || 1, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none text-xs font-medium bg-white text-slate-900"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Max available: {activeItem?.quantity || 1}</span>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Estimated Refund Value</label>
                    <div className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs">
                      {formatTZS(calculatedRefund)}
                    </div>
                    <span className="text-[10px] text-emerald-600 mt-0.5 block font-medium">Auto-calculated from item price</span>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Reason for Return</label>
                  <select
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none text-xs font-medium bg-white text-slate-900"
                  >
                    <option value="DEFECTIVE">Defective / Damaged in Transit</option>
                    <option value="WRONG_ITEM">Wrong Item Received</option>
                    <option value="WRONG_SIZE">Wrong Size / Fit Issue</option>
                    <option value="NOT_AS_DESCRIBED">Item Not as Described on Listing</option>
                    <option value="MISSING_PARTS">Missing Accessories / Components</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Return Handover Station / Point</label>
                  <select
                    value={pickupHub}
                    onChange={e => setPickupHub(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none text-xs font-medium bg-white text-slate-900"
                  >
                    <option value="LUMO Kariakoo Central Station Hub">LUMO Kariakoo Central Station Hub (Kariakoo Market)</option>
                    <option value="LUMO Kinondoni Station Hub">LUMO Kinondoni Station Hub (Kinondoni Road)</option>
                    <option value="LUMO Mlimani Hub">LUMO Mlimani Hub (Mlimani City Mall)</option>
                    <option value="LUMO Posta Hub">LUMO Posta Hub (Samora Avenue)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Customer Explanation / Details</label>
                  <textarea
                    rows={2}
                    value={customerComment}
                    onChange={e => setCustomerComment(e.target.value)}
                    placeholder="Describe the issue with the item (optional)..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Return Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

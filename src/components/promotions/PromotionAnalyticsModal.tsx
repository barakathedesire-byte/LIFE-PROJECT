import React from 'react';
import { X, TrendingUp, Eye, MousePointer, Tag, DollarSign, Award, ArrowUpRight, CheckCircle, BarChart2 } from 'lucide-react';
import { Promotion } from '../../types/index';

interface PromotionAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  promotion: Promotion | null;
}

export const PromotionAnalyticsModal: React.FC<PromotionAnalyticsModalProps> = ({
  isOpen,
  onClose,
  promotion
}) => {
  if (!isOpen || !promotion) return null;

  const analytics = promotion.analytics || {
    views: 1240,
    clicks: 380,
    redemptions: 48,
    orders: 48,
    revenue: 7680000,
    totalDiscountGiven: 1920000,
    conversionRate: 12.6
  };

  const formattedRevenue = (analytics.revenue || 0).toLocaleString();
  const formattedDiscount = (analytics.totalDiscountGiven || 0).toLocaleString();
  const ctr = analytics.views > 0 ? ((analytics.clicks / analytics.views) * 100).toFixed(1) : '0';
  const roi = analytics.totalDiscountGiven > 0 
    ? (((analytics.revenue - analytics.totalDiscountGiven) / analytics.totalDiscountGiven) * 100).toFixed(0)
    : 'N/A';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#ff6a00] text-white">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white">{promotion.name}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ff6a00] text-white">
                  {promotion.promotionType}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Ref: {promotion.internalRef || promotion.id} • Status: <span className="text-emerald-400 font-semibold">{promotion.status}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Top Performance Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-medium">Storefront Views</span>
                <Eye className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-xl font-black text-slate-900">{(analytics.views || 0).toLocaleString()}</div>
              <span className="text-[10px] text-slate-500">Impressions on product pages</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-medium">Clicks & Engagement</span>
                <MousePointer className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-xl font-black text-slate-900">{(analytics.clicks || 0).toLocaleString()}</div>
              <span className="text-[10px] text-emerald-600 font-semibold">CTR: {ctr}%</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-medium">Coupon Redemptions</span>
                <Tag className="w-4 h-4 text-[#ff6a00]" />
              </div>
              <div className="text-xl font-black text-slate-900">{(analytics.redemptions || 0).toLocaleString()}</div>
              <span className="text-[10px] text-slate-500">Total orders completed</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-medium">Gross Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-xl font-black text-slate-900">TZS {formattedRevenue}</div>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> ROI: {roi}%
              </span>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="p-5 rounded-2xl bg-orange-50/50 border border-orange-200 space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-[#ff6a00]" /> Financial Impact & Subsidy Summary
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-white p-3.5 rounded-xl border border-orange-100">
                <span className="text-slate-500 font-medium">Total Discount Subsidized</span>
                <div className="text-base font-bold text-rose-600 mt-0.5">TZS {formattedDiscount}</div>
                <span className="text-[10px] text-slate-400">Vendor funded: {promotion.financials?.vendorFundedPercent || 100}%</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-orange-100">
                <span className="text-slate-500 font-medium">Conversion Rate</span>
                <div className="text-base font-bold text-slate-900 mt-0.5">{analytics.conversionRate || 0}%</div>
                <span className="text-[10px] text-slate-400">Views → Orders</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-orange-100">
                <span className="text-slate-500 font-medium">Coupon Usage Limit</span>
                <div className="text-base font-bold text-slate-900 mt-0.5">
                  {analytics.redemptions || 0} / {promotion.limits?.maxTotalUses || 'Unlimited'}
                </div>
                <span className="text-[10px] text-slate-400">Redemptions used</span>
              </div>
            </div>
          </div>

          {/* Promotion Rules & Dates */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <h5 className="font-bold text-slate-900">Configured Rule Specifications</h5>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-600">
              <div><span className="font-semibold text-slate-800">Coupon Code:</span> {promotion.coupon?.requireCoupon ? (promotion.coupon.code || 'None') : 'No Coupon Required'}</div>
              <div><span className="font-semibold text-slate-800">Applies To:</span> {promotion.appliesTo}</div>
              <div><span className="font-semibold text-slate-800">Active Period:</span> {promotion.startDate} to {promotion.endDate}</div>
              <div><span className="font-semibold text-slate-800">Stackable:</span> {promotion.stacking?.canCombine ? 'Yes' : 'No'}</div>
              <div><span className="font-semibold text-slate-800">Target Customer:</span> {promotion.customerEligibility?.targetSegment || 'All'}</div>
              <div><span className="font-semibold text-slate-800">Min Order Value:</span> {promotion.discountConfig?.minOrderValue ? `TZS ${promotion.discountConfig.minOrderValue.toLocaleString()}` : 'None'}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs cursor-pointer hover:bg-slate-800 transition-colors"
          >
            Close Performance Report
          </button>
        </div>
      </div>
    </div>
  );
};

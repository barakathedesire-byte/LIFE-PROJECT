import React, { useState } from 'react';
import { BuilderModal } from '../../../components/builder/BuilderModal';
import { SearchableSelect } from '../../../components/common/SearchableSelect';

export const WIDGET_CATEGORIES = [
  'Content Widgets',
  'Product Widgets',
  'Shopping Widgets',
  'Navigation Widgets',
  'Social & Trust Widgets',
  'Marketing Widgets',
  'Information Widgets',
  'Interactive Widgets',
  'Data & Business Widgets',
  'Media Widgets'
];

export const WIDGET_TYPES_BY_CATEGORY: Record<string, string[]> = {
  'Content Widgets': ['Banner', 'Hero Banner', 'Image', 'Video', 'Text Block', 'Rich Text', 'Announcement', 'Promotional Banner'],
  'Product Widgets': ['Product Carousel', 'Product Grid', 'Product List', 'Product Spotlight', 'Top Sellers', 'New Arrivals', 'Flash Sales', 'Recommended Products', 'Recently Viewed', 'Trending Products', 'Deals Widget', 'Category Products'],
  'Shopping Widgets': ['Shopping Categories', 'Brand Showcase', 'Official Brand Stores', 'Seller Showcase', 'Coupon / Voucher Widget', 'Promotional Deals', 'Bundle Offers', 'Wishlist', 'Recently Purchased'],
  'Navigation Widgets': ['Category Navigation', 'Quick Links', 'Menu', 'Breadcrumbs', 'Tabs', 'Navigation Tiles'],
  'Social & Trust Widgets': ['Customer Reviews', 'Ratings', 'Testimonials', 'Trust Badges', 'Verified Seller Widget', 'Secure Payment Widget', 'Delivery Assurance', 'Returns Information'],
  'Marketing Widgets': ['Countdown Timer', 'Flash Sale Timer', 'Coupon Widget', 'Promotional Offer', 'Newsletter Signup', 'Campaign Banner', 'Loyalty & Rewards Widget'],
  'Information Widgets': ['FAQ', 'Information Panel', 'Statistics', 'Announcement Bar', 'Contact Information', 'Store Information'],
  'Interactive Widgets': ['Search', 'Filter', 'Product Comparison', 'Location Selector', 'Map', 'Store Locator', 'Calculator', 'Form', 'Survey'],
  'Data & Business Widgets': ['Sales Statistics', 'Orders Summary', 'Inventory Summary', 'Revenue Widget', 'Customer Statistics', 'Performance Chart', 'Analytics Chart', 'KPI Widget'],
  'Media Widgets': ['Image Gallery', 'Video', 'Product Video', 'Promotional Media', 'Media Carousel']
};

const BasicSection = ({ data, onChange }: any) => {
  const selectedCategory = data.category || 'Product Widgets';
  const availableTypes = WIDGET_TYPES_BY_CATEGORY[selectedCategory] || WIDGET_TYPES_BY_CATEGORY['Product Widgets'];

  return (
    <div className="space-y-4 text-xs">
      <h4 className="font-bold text-slate-800 text-base mb-2">1. Widget Category & Type</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Widget Title</label>
          <input
            type="text"
            value={data.title || data.name || ''}
            onChange={e => onChange({ title: e.target.value, name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
            placeholder="e.g. Flash Sales Carousel"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Widget Category</label>
          <SearchableSelect
            options={WIDGET_CATEGORIES}
            value={selectedCategory}
            onChange={val => {
              const types = WIDGET_TYPES_BY_CATEGORY[val] || [];
              onChange({ category: val, type: types[0] || 'Banner' });
            }}
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Specific Widget Type</label>
          <SearchableSelect
            options={availableTypes}
            value={data.type || availableTypes[0]}
            onChange={val => onChange({ type: val })}
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Grid Size Width</label>
          <select
            value={data.size || '1/2 Width'}
            onChange={e => onChange({ size: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold"
          >
            <option value="1/4 Width">1/4 Width (Small)</option>
            <option value="1/2 Width">1/2 Width (Medium)</option>
            <option value="3/4 Width">3/4 Width (Large)</option>
            <option value="Full Width">Full Width (1/1)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

const ConfigSection = ({ data, onChange }: any) => {
  const widgetType = data.type || '';

  return (
    <div className="space-y-4 text-xs">
      <h4 className="font-bold text-slate-800 text-base mb-2">2. Dynamic Widget Configuration</h4>

      {widgetType.includes('Carousel') || widgetType.includes('Grid') || widgetType.includes('List') ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Product Source / Query</label>
            <select
              value={data.productSource || 'Featured'}
              onChange={e => onChange({ productSource: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
            >
              <option value="Featured">Featured Products</option>
              <option value="Top Sellers">Top Sellers</option>
              <option value="Flash Sales">Active Flash Sales</option>
              <option value="New Arrivals">New Arrivals</option>
              <option value="Category Specific">Category Specific</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Number of Items</label>
            <input
              type="number"
              value={data.itemCount || 8}
              onChange={e => onChange({ itemCount: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              min={1}
              max={50}
            />
          </div>
        </div>
      ) : widgetType.includes('Banner') || widgetType.includes('Image') ? (
        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Banner Image URL or Media</label>
            <input
              type="text"
              value={data.bannerImageUrl || ''}
              onChange={e => onChange({ bannerImageUrl: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
              placeholder="https://images.unsplash.com/photo-..."
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Call to Action (CTA) Text & Link</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={data.ctaText || ''}
                onChange={e => onChange({ ctaText: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="Shop Now"
              />
              <input
                type="text"
                value={data.ctaLink || ''}
                onChange={e => onChange({ ctaLink: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
                placeholder="/category/electronics"
              />
            </div>
          </div>
        </div>
      ) : widgetType.includes('Countdown') || widgetType.includes('Timer') ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Countdown End Date & Time</label>
            <input
              type="datetime-local"
              value={data.countdownEnd || ''}
              onChange={e => onChange({ countdownEnd: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Display Style</label>
            <select
              value={data.countdownStyle || 'Modern Dark'}
              onChange={e => onChange({ countdownStyle: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
            >
              <option value="Modern Dark">Modern Dark with Lumo Orange</option>
              <option value="Minimalist">Minimalist Outline</option>
              <option value="Urgency Banner">Urgency Solid Red/Orange</option>
            </select>
          </div>
        </div>
      ) : widgetType.includes('Map') || widgetType.includes('Location') ? (
        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Default Coordinates (Lat, Lng)</label>
            <input
              type="text"
              value={data.coordinates || '-6.7924, 39.2083'}
              onChange={e => onChange({ coordinates: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
              placeholder="-6.7924, 39.2083 (Dar es Salaam)"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Initial Zoom Level</label>
            <input
              type="number"
              value={data.zoom || 13}
              onChange={e => onChange({ zoom: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              min={1}
              max={20}
            />
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-500">
          Configuring parameters for <strong className="text-slate-800">{widgetType}</strong>. Data bindings and display preferences will apply automatically across the platform runtime.
        </div>
      )}
    </div>
  );
};

export const DashboardWidgetModal: React.FC<any> = ({ isOpen, onClose, onSave, initialData }) => {
  return (
    <BuilderModal
      title={initialData?.id ? 'Edit Widget' : 'Add Widget from Library'}
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      initialData={initialData || { title: '', category: 'Product Widgets', type: 'Product Carousel', size: '1/2 Width' }}
      sections={[
        { id: 'basic', label: 'Identity & Category', component: BasicSection },
        { id: 'config', label: 'Dynamic Configuration', component: ConfigSection }
      ]}
    />
  );
};

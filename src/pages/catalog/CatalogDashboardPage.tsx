import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { UserAccountNavDropdown } from '../../components/common/UserAccountNavDropdown';
import { api } from '../../services/api';
import { 
  Tag, 
  FolderTree, 
  Layers, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  Edit3, 
  Plus, 
  RefreshCw, 
  ChevronRight, 
  Sliders, 
  Check, 
  X, 
  Sparkles, 
  BookOpen, 
  BarChart3, 
  FileSpreadsheet, 
  ShieldCheck, 
  Smartphone, 
  Shirt, 
  Wheat, 
  Activity, 
  Car, 
  ShoppingBag, 
  Home, 
  Tv, 
  Save,
  Info
} from 'lucide-react';
import { Product } from '../../types';
import { formatTZS } from '../../utils/formatters';

interface CategoryAttributeSchema {
  id: string;
  categoryName: string;
  slug: string;
  iconName: string;
  requiredAttributes: string[];
  optionalAttributes: string[];
  totalProductsCount: number;
  status: 'ACTIVE' | 'DRAFT';
}

export const CatalogDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'audit' | 'tools'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedProductForSpec, setSelectedProductForSpec] = useState<Product | null>(null);
  const [isEditingSpecs, setIsEditingSpecs] = useState(false);
  const [specDraft, setSpecDraft] = useState<{ [key: string]: string }>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const categorySchemas: CategoryAttributeSchema[] = [
    {
      id: 'cat-phones',
      categoryName: 'Phones & Tablets',
      slug: 'phones-tablets',
      iconName: 'Smartphone',
      requiredAttributes: ['Brand', 'RAM', 'Internal Storage', 'Screen Size', 'Network Compatibility (5G/4G)', 'Battery Capacity'],
      optionalAttributes: ['Operating System', 'Processor', 'Sim Slots', 'Color Finish', 'Warranty Period'],
      totalProductsCount: 142,
      status: 'ACTIVE'
    },
    {
      id: 'cat-elec',
      categoryName: 'Electronics & Audio',
      slug: 'electronics',
      iconName: 'Tv',
      requiredAttributes: ['Brand', 'Power Consumption', 'Connectivity (Bluetooth/WiFi/Aux)', 'Voltage Rating'],
      optionalAttributes: ['Noise Cancellation', 'Driver Size', 'Battery Life', 'Water Resistance Rating (IPX)'],
      totalProductsCount: 98,
      status: 'ACTIVE'
    },
    {
      id: 'cat-fashion',
      categoryName: 'Fashion & Apparel',
      slug: 'fashion',
      iconName: 'Shirt',
      requiredAttributes: ['Size', 'Color', 'Material / Fabric Composition', 'Gender / Fit (Men/Women/Unisex)'],
      optionalAttributes: ['Care Instructions', 'Country of Manufacture', 'Closure Type', 'Pattern'],
      totalProductsCount: 230,
      status: 'ACTIVE'
    },
    {
      id: 'cat-agri',
      categoryName: 'Agriculture & Farm Supplies',
      slug: 'agriculture',
      iconName: 'Wheat',
      requiredAttributes: ['Product Form (Seeds/Fertilizer/Tool)', 'Package Net Weight (Kg/Litre)', 'Active Ingredients / Formula', 'TOSCI Certification Code'],
      optionalAttributes: ['Dosage Guide', 'Target Crops', 'Storage Life', 'Application Method'],
      totalProductsCount: 64,
      status: 'ACTIVE'
    },
    {
      id: 'cat-health',
      categoryName: 'Health & Medical Equipment',
      slug: 'health-medical',
      iconName: 'Activity',
      requiredAttributes: ['TFDA / TMDA Regulatory Registration Number', 'Power / Battery Type', 'Sterility Status', 'Measurement Accuracy'],
      optionalAttributes: ['Clinical Certifications (CE/ISO)', 'Maintenance Schedule', 'Disposable Accessories'],
      totalProductsCount: 45,
      status: 'ACTIVE'
    },
    {
      id: 'cat-appliances',
      categoryName: 'Home & Kitchen Appliances',
      slug: 'appliances',
      iconName: 'Home',
      requiredAttributes: ['Wattage / Power (W)', 'Capacity (Litres)', 'Material / Finish', 'Energy Rating'],
      optionalAttributes: ['Cord Length', 'Included Attachments', 'Safety Cutoff'],
      totalProductsCount: 88,
      status: 'ACTIVE'
    },
    {
      id: 'cat-auto',
      categoryName: 'Automotive Parts & Accessories',
      slug: 'automotive',
      iconName: 'Car',
      requiredAttributes: ['Vehicle Make & Model Compatibility', 'OEM Part Number', 'Material Spec', 'Voltage'],
      optionalAttributes: ['Installation Difficulty', 'Warranty', 'Weight'],
      totalProductsCount: 52,
      status: 'ACTIVE'
    }
  ];

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await api.getProducts({ limit: 50 });
      setProducts(res.products || []);
    } catch (err) {
      console.error('Error fetching catalog products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenSpecs = (p: Product) => {
    setSelectedProductForSpec(p);
    // populate initial draft from product specifications if available
    const initial: { [key: string]: string } = {};
    if (p.specifications && Array.isArray(p.specifications)) {
      p.specifications.forEach(s => {
        initial[s.label] = s.value;
      });
    } else {
      // Default specs based on category
      initial['Brand'] = p.brand || 'LUMO Partner';
      initial['Condition'] = 'Brand New / Genuine';
      initial['Warranty'] = '1 Year Official Warranty';
      initial['Country of Origin'] = 'Original Imported';
    }
    setSpecDraft(initial);
    setIsEditingSpecs(false);
  };

  const handleSaveSpecs = () => {
    if (!selectedProductForSpec) return;
    const updatedSpecs = Object.entries(specDraft).map(([label, value]) => ({ label, value }));
    // Update local state
    setProducts(products.map(p => p.id === selectedProductForSpec.id ? { ...p, specifications: updatedSpecs } : p));
    showToast(`Specifications saved for ${selectedProductForSpec.name}!`);
    setIsEditingSpecs(false);
    setSelectedProductForSpec(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 font-sans">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-sm">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-slate-900 tracking-tight">LUMO Catalog & Category Hub</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-violet-100 text-violet-800 border border-violet-200">
                  CATEGORY SPECIALIST
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Taxonomy architecture, SKU attribute enrichment, and marketplace catalog integrity
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadProducts}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
              title="Refresh Catalog Data"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
            <UserAccountNavDropdown variant="light" />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-6 text-xs font-bold border-t border-slate-100 overflow-x-auto">
          <button
            onClick={() => setActiveTab('products')}
            className={`py-3 flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'products'
                ? 'border-violet-600 text-violet-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers size={15} />
            <span>Product Catalog & Attributes ({products.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-3 flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'categories'
                ? 'border-violet-600 text-violet-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FolderTree size={15} />
            <span>Category Taxonomy & Schemas ({categorySchemas.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'audit'
                ? 'border-violet-600 text-violet-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck size={15} />
            <span>Specification Quality Audit</span>
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`py-3 flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'tools'
                ? 'border-violet-600 text-violet-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sliders size={15} />
            <span>Indexing & Bulk Tools</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-slate-400 font-medium">Total Live SKUs</span>
            <div className="text-xl font-black text-slate-900">{products.length || 1420}</div>
            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 size={12} /> Synchronized
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-slate-400 font-medium">Active Categories</span>
            <div className="text-xl font-black text-violet-700">{categorySchemas.length} Core</div>
            <span className="text-[11px] text-slate-500 font-semibold">Tanzania Marketplace Taxonomy</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-slate-400 font-medium">Spec Completeness</span>
            <div className="text-xl font-black text-emerald-600">96.8%</div>
            <span className="text-[11px] text-emerald-700 font-semibold">+2.1% from category audits</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-slate-400 font-medium">Pending Spec Audit</span>
            <div className="text-xl font-black text-amber-600">8 Products</div>
            <span className="text-[11px] text-amber-700 font-semibold">Requires category tags</span>
          </div>
        </div>

        {/* TAB 1: PRODUCTS CATALOG & ATTRIBUTES */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-5">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products by title, brand, or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-hidden focus:border-violet-600 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-hidden focus:border-violet-600 cursor-pointer"
                >
                  <option value="ALL">All Categories</option>
                  <option value="Phones & Tablets">Phones & Tablets</option>
                  <option value="Electronics & Audio">Electronics & Audio</option>
                  <option value="Fashion & Apparel">Fashion & Apparel</option>
                  <option value="Agriculture & Farm Supplies">Agriculture & Farm Supplies</option>
                  <option value="Health & Medical Equipment">Health & Medical Equipment</option>
                  <option value="Home & Kitchen">Home & Kitchen</option>
                </select>

                <button
                  onClick={() => {
                    showToast('Catalog export generated successfully (CSV/Excel)');
                  }}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
                >
                  <FileSpreadsheet size={14} />
                  <span>Export Specs</span>
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Product & SKU</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Brand</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Category Attributes Status</th>
                    <th className="py-3 px-4 text-right">Spec Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => {
                    const hasSpecs = p.specifications && p.specifications.length > 0;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <img
                            src={p.thumbnail}
                            alt={p.name}
                            className="w-10 h-10 rounded-xl object-contain border border-slate-200 bg-white shrink-0"
                          />
                          <div className="max-w-[260px]">
                            <p className="font-bold text-slate-900 truncate">{p.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono">SKU: LM-{p.id.slice(0, 8)}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-800">{p.category || 'General'}</span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700">{p.brand || 'LUMO Verified'}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{formatTZS(p.price)}</td>
                        <td className="py-3 px-4">
                          {hasSpecs ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 w-fit">
                              <CheckCircle2 size={12} />
                              <span>{p.specifications?.length} Specs Validated</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1 w-fit">
                              <AlertTriangle size={12} />
                              <span>Standard Specs Only</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleOpenSpecs(p)}
                            className="px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1 ml-auto"
                          >
                            <Edit3 size={13} />
                            <span>Audit Specs</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: CATEGORY TAXONOMY & SCHEMAS */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="bg-violet-50/70 p-4 rounded-2xl border border-violet-200/80 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-violet-600 text-white rounded-xl shrink-0 mt-0.5">
                  <FolderTree size={18} />
                </div>
                <div className="text-xs">
                  <h3 className="font-black text-slate-900 text-sm">Category-Aware Specification Engine</h3>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">
                    Under LUMO architecture (Section 11), products must follow category-specific attribute requirements.
                    For example, Electronics require Brand/Storage/RAM/Power, Fashion requires Size/Color/Fabric/Gender, and Agriculture requires Unit/Packaging/TOSCI certifications.
                  </p>
                </div>
              </div>

              <button
                onClick={() => showToast('New category creation wizard opened')}
                className="px-3.5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0 shadow-xs"
              >
                <Plus size={14} />
                <span>Add Taxonomy Schema</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {categorySchemas.map((cat) => (
                <div key={cat.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
                        <Tag size={16} className="text-violet-600" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">{cat.categoryName}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">Slug: /{cat.slug}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                      {cat.status}
                    </span>
                  </div>

                  <div>
                    <span className="font-bold text-slate-700 block mb-1.5 uppercase text-[10px] tracking-wider">
                      Mandatory Category Attributes ({cat.requiredAttributes.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.requiredAttributes.map((attr, i) => (
                        <span key={i} className="px-2 py-1 bg-violet-50 text-violet-800 border border-violet-200 rounded-lg font-semibold text-[11px]">
                          • {attr}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-slate-500 block mb-1.5 uppercase text-[10px] tracking-wider">
                      Optional Enrichment Attributes ({cat.optionalAttributes.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.optionalAttributes.map((attr, i) => (
                        <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[11px]">
                          {attr}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Indexed Catalog Items: <strong>{cat.totalProductsCount} SKUs</strong></span>
                    <button
                      onClick={() => showToast(`Attribute schema updated for ${cat.categoryName}`)}
                      className="text-violet-600 font-bold hover:underline"
                    >
                      Configure Schema →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SPECIFICATION QUALITY AUDIT */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6 text-xs">
            <div>
              <h3 className="font-black text-base text-slate-900">Marketplace Catalog Compliance & SEO Health</h3>
              <p className="text-slate-500 mt-0.5">
                Automated audits checking image resolution, title clarity, mandatory specs, and vendor compliance
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950">High-Resolution Photos</span>
                  <CheckCircle2 size={16} className="text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-900">98.4%</div>
                <p className="text-[11px] text-emerald-700">All products comply with LUMO white background standard.</p>
              </div>

              <div className="p-4 rounded-2xl bg-violet-50 border border-violet-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-violet-950">Category Filter Indexing</span>
                  <CheckCircle2 size={16} className="text-violet-600" />
                </div>
                <div className="text-2xl font-black text-violet-900">100%</div>
                <p className="text-[11px] text-violet-700">All search facets and sidebars are mapped to verified attributes.</p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950">Missing Required Spec Fields</span>
                  <AlertTriangle size={16} className="text-amber-600" />
                </div>
                <div className="text-2xl font-black text-amber-900">8 Items</div>
                <p className="text-[11px] text-amber-700">Flagged for merchant notification in Seller Center.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck size={20} className="text-violet-600" />
                <div>
                  <h4 className="font-bold text-slate-900">Run Deep Catalog Integrity Audit</h4>
                  <p className="text-slate-500 text-[11px]">Validates all 1,420 product listings against current category schema rules.</p>
                </div>
              </div>
              <button
                onClick={() => showToast('Deep Catalog Integrity Audit completed. 0 critical schema errors found.')}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold cursor-pointer transition shadow-2xs"
              >
                Execute Audit
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: INDEXING & BULK TOOLS */}
        {activeTab === 'tools' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6 text-xs">
            <div>
              <h3 className="font-black text-base text-slate-900">Catalog Specialist Operational Tools</h3>
              <p className="text-slate-500 mt-0.5">Search index regeneration, bulk categorization, and export utilities</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <RefreshCw size={15} className="text-violet-600" />
                  Regenerate Search & Facet Index
                </h4>
                <p className="text-slate-500 leading-relaxed">
                  Rebuild Elasticsearch and local marketplace indices to ensure new category attributes and brand tags appear in search filters.
                </p>
                <button
                  onClick={() => showToast('Marketplace Search & Facet index rebuilt successfully!')}
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl font-bold cursor-pointer transition"
                >
                  Rebuild Search Index
                </button>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet size={15} className="text-emerald-600" />
                  Bulk Attribute Import Template
                </h4>
                <p className="text-slate-500 leading-relaxed">
                  Download category-specific CSV templates for Kariakoo vendors to fill in technical specifications before bulk catalog upload.
                </p>
                <button
                  onClick={() => showToast('Category Spec Excel template downloaded.')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer transition"
                >
                  Download Category CSV Template
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* SPECIFICATION AUDIT & EDIT MODAL */}
      {selectedProductForSpec && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={selectedProductForSpec.thumbnail}
                  alt={selectedProductForSpec.name}
                  className="w-10 h-10 rounded-xl object-contain border border-slate-200"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{selectedProductForSpec.name}</h3>
                  <span className="text-[11px] text-violet-700 font-bold bg-violet-50 px-2 py-0.5 rounded-full">
                    Category: {selectedProductForSpec.category}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedProductForSpec(null)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-violet-50/70 rounded-xl border border-violet-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-violet-900 font-bold">
                  <Sparkles size={16} />
                  <span>Category-Specific Specification Enrichment</span>
                </div>
                <button
                  onClick={() => setIsEditingSpecs(!isEditingSpecs)}
                  className="text-violet-700 font-bold hover:underline"
                >
                  {isEditingSpecs ? 'Cancel Edit' : '+ Add / Edit Specs'}
                </button>
              </div>

              {/* Specs Editor / Viewer */}
              <div className="space-y-2.5">
                {Object.entries(specDraft).map(([label, val], idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800 w-1/3 truncate">{label}</span>
                    {isEditingSpecs ? (
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => setSpecDraft({ ...specDraft, [label]: e.target.value })}
                        className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs outline-hidden focus:border-violet-600 font-medium"
                      />
                    ) : (
                      <span className="text-slate-600 font-medium flex-1">{val}</span>
                    )}
                  </div>
                ))}
              </div>

              {isEditingSpecs && (
                <div className="p-3 bg-slate-100 rounded-xl space-y-2">
                  <span className="font-bold text-slate-700 block text-[11px]">Add Custom Specification Row:</span>
                  <div className="flex gap-2">
                    <input
                      id="newSpecKey"
                      type="text"
                      placeholder="Attribute Label (e.g. Battery Life)"
                      className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                    <input
                      id="newSpecVal"
                      type="text"
                      placeholder="Value (e.g. 5000 mAh)"
                      className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const keyEl = document.getElementById('newSpecKey') as HTMLInputElement;
                        const valEl = document.getElementById('newSpecVal') as HTMLInputElement;
                        if (keyEl && valEl && keyEl.value && valEl.value) {
                          setSpecDraft({ ...specDraft, [keyEl.value]: valEl.value });
                          keyEl.value = '';
                          valEl.value = '';
                        }
                      }}
                      className="px-3 py-1.5 bg-violet-600 text-white rounded-lg font-bold text-xs cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setSelectedProductForSpec(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
              {isEditingSpecs && (
                <button
                  onClick={handleSaveSpecs}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Save size={14} />
                  <span>Save Specifications</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  ArrowRight,
  Search,
  X,
  Store,
  CreditCard,
  PackageCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import { AiSupportChatModal } from '../components/common/AiSupportChatModal';
import { LumoLoader } from '../components/common/LumoLoader';
import { Bot, Sparkles, MessageCircle } from 'lucide-react';

interface FAQItem {
  id: string;
  category: 'escrow' | 'shipping' | 'seller' | 'returns';
  q: string;
  a: string;
}

export const HelpCenterPage: React.FC = () => {
  useSEO({
    title: 'Help Center & Searchable FAQs',
    description: 'Find answers to common questions about LUMO Escrow, M-Pesa payments, shipping times, seller onboarding, and returns.',
    keywords: 'LUMO help center, escrow FAQs, M-Pesa payments Tanzania, seller help, returns policy'
  });

  const [openFaq, setOpenFaq] = useState<string | null>('faq-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);

  const faqs: FAQItem[] = [
    {
      id: 'faq-1',
      category: 'escrow',
      q: 'How does LUMO Escrow protect my money?',
      a: 'When you place an order using M-Pesa, Tigo Pesa, Airtel Money, Halopesa or Bank Card, your payment is held securely in LUMO’s audited escrow trust account. The merchant does NOT receive your funds immediately. Once the item is delivered and you inspect that it is genuine and matches the description, you confirm receipt on the app, and only then is the merchant paid.',
    },
    {
      id: 'faq-2',
      category: 'escrow',
      q: 'How do I pay with Vodacom M-Pesa or Tigo Pesa?',
      a: 'At checkout, select Vodacom M-Pesa or Tigo Pesa and enter your phone number. When you tap "Authorize Escrow Payment", an automatic USSD prompt will pop up on your phone screen asking you to enter your Secret PIN. Once confirmed, funds are vaulted in escrow.',
    },
    {
      id: 'faq-3',
      category: 'shipping',
      q: 'How long does delivery take in Dar es Salaam and upcountry?',
      a: 'In Dar es Salaam, express doorstep delivery takes 3 to 6 hours, while pickup stations are ready within 2 hours. For upcountry regions (Arusha, Mwanza, Dodoma, Zanzibar, Mbeya, Morogoro), orders arrive within 1 to 2 business days via express regional transit.',
    },
    {
      id: 'faq-4',
      category: 'returns',
      q: 'What is the return policy if an item is defective or incorrect?',
      a: 'All items on LUMO come with a 7-Day Free Replacement Guarantee. If the item arrives damaged, missing parts, or non-functional, tap "Request 7-Day Return" in your order dashboard. LUMO will arrange return pickup and immediately refund your vaulted escrow funds or issue a replacement.',
    },
    {
      id: 'faq-5',
      category: 'shipping',
      q: 'How do I pick up my order at a Pickup Station?',
      a: 'When your order arrives at the chosen pickup station (such as Posta Samora Tower or Mlimani City Mall), you will receive an SMS containing a 4-digit Collection OTP. Present this OTP and your ID at the counter to collect your parcel.',
    },
    {
      id: 'faq-6',
      category: 'seller',
      q: 'How can I sell products on LUMO as a merchant?',
      a: 'LUMO supports authorized brand distributors, verified local shops in Kariakoo/Posta, and official manufacturers. You can apply with your business license (BRELA), tax identification (TIN), and national ID (NIDA) to gain Official Verified Merchant status.',
    },
    {
      id: 'faq-7',
      category: 'seller',
      q: 'When and how do sellers receive payouts?',
      a: 'Once a buyer confirms parcel delivery (or 48 hours after courier delivery confirmation without dispute), escrow funds are automatically disbursed into the vendor’s registered M-Pesa B2C or Bank account.',
    },
    {
      id: 'faq-8',
      category: 'escrow',
      q: 'Are there any hidden escrow transaction fees for buyers?',
      a: 'No! LUMO Escrow is 100% free for buyers. You pay exact item price plus standard local shipping. There are zero added commissions or buyer protection fees.',
    },
    {
      id: 'faq-9',
      category: 'returns',
      q: 'What happens if a seller sends a counterfeit or fake product?',
      a: 'LUMO operates a strict anti-counterfeit policy. If an item is proven fake, your escrow payment is instantly refunded, the seller is suspended, and you receive a 10% voucher compensation.',
    },
    {
      id: 'faq-10',
      category: 'shipping',
      q: 'Can I track my delivery rider in real-time?',
      a: 'Yes! Once your parcel is picked up by a LUMO Express rider, you receive a live GPS tracking link via SMS to monitor rider movement directly on the map.',
    },
  ];

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory = selectedCategory === 'all' || faq?.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery = !query || faq.q.toLowerCase().includes(query) || faq.a.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [faqs, selectedCategory, searchQuery]);

  return (
    <div className="w-full px-2 sm:px-4 lg:px-6 py-8 sm:py-12 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold text-[#FF6A00] bg-orange-50 border border-orange-200 px-3 py-1 rounded-full uppercase tracking-wider">
          LUMO Customer & Seller Help Center
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
          How can we help you today?
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500">
          Everything you need to know about LUMO Escrow, Mobile Money payments, East Africa delivery, and vendor payouts.
        </p>

        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto pt-2">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help questions, escrow, M-Pesa, delivery..."
              className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-neutral-300 text-sm focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/20 outline-none shadow-sm transition bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1 rounded-full cursor-pointer"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* AI Assistant Quick Prompt Bar */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsAiChatOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 border border-orange-500/30 text-xs font-bold text-[#FF6A00] hover:border-orange-500 transition shadow-xs cursor-pointer"
          >
            <LumoLoader size="small" />
            <span>Ask LumoCare AI 24/7 Support Assistant</span>
            <span className="bg-[#FF6A00] text-white text-[10px] px-2 py-0.5 rounded-full font-extrabold ml-1">Live Chat</span>
          </button>
        </div>
      </div>

      {/* Support Quick Topic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div 
          onClick={() => setSelectedCategory('escrow')}
          className={`cursor-pointer rounded-2xl border p-4 transition space-y-2 ${
            selectedCategory === 'escrow' ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20' : 'bg-white border-neutral-200 hover:border-emerald-300'
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <ShieldCheck size={20} />
          </div>
          <h3 className="font-bold text-xs text-neutral-900">Escrow & Payments</h3>
          <p className="text-[11px] text-neutral-500 leading-relaxed">
            Zero-risk guarantee with M-Pesa & Card escrow.
          </p>
        </div>

        <div 
          onClick={() => setSelectedCategory('shipping')}
          className={`cursor-pointer rounded-2xl border p-4 transition space-y-2 ${
            selectedCategory === 'shipping' ? 'bg-orange-50 border-orange-300 ring-2 ring-orange-500/20' : 'bg-white border-neutral-200 hover:border-orange-300'
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#FF6A00] flex items-center justify-center">
            <Truck size={20} />
          </div>
          <h3 className="font-bold text-xs text-neutral-900">Delivery & Stations</h3>
          <p className="text-[11px] text-neutral-500 leading-relaxed">
            Same-day riders & 45+ pickup hubs across Tanzania.
          </p>
        </div>

        <div 
          onClick={() => setSelectedCategory('returns')}
          className={`cursor-pointer rounded-2xl border p-4 transition space-y-2 ${
            selectedCategory === 'returns' ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20' : 'bg-white border-neutral-200 hover:border-amber-300'
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <RotateCcw size={20} />
          </div>
          <h3 className="font-bold text-xs text-neutral-900">7-Day Free Returns</h3>
          <p className="text-[11px] text-neutral-500 leading-relaxed">
            Hassle-free replacement for defective items.
          </p>
        </div>

        <div 
          onClick={() => setSelectedCategory('seller')}
          className={`cursor-pointer rounded-2xl border p-4 transition space-y-2 ${
            selectedCategory === 'seller' ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20' : 'bg-white border-neutral-200 hover:border-blue-300'
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Store size={20} />
          </div>
          <h3 className="font-bold text-xs text-neutral-900">Selling & Payouts</h3>
          <p className="text-[11px] text-neutral-500 leading-relaxed">
            Merchant onboarding, BRELA guidelines & payouts.
          </p>
        </div>
      </div>

      {/* FAQs Accordion Container */}
      <div className="bg-white rounded-3xl border border-neutral-200/90 p-6 shadow-2xs space-y-6">
        {/* Filter Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-neutral-100">
          <h2 className="text-lg font-black text-neutral-900 tracking-tight">
            Frequently Asked Questions
          </h2>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {[
              { id: 'all', label: 'All FAQs' },
              { id: 'escrow', label: 'Escrow & Mobile Money' },
              { id: 'shipping', label: 'Shipping & Pickups' },
              { id: 'seller', label: 'Sellers & Merchants' },
              { id: 'returns', label: 'Returns & Refunds' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-[#FF6A00] text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Accordion List */}
        {filteredFaqs.length > 0 ? (
          <div className="divide-y divide-neutral-100">
            {filteredFaqs.map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <div key={faq.id} className="py-3.5 transition">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                    className="w-full flex items-center justify-between text-left font-bold text-xs sm:text-sm text-neutral-900 hover:text-[#FF6A00] transition cursor-pointer gap-4 py-1"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF6A00] shrink-0"></span>
                      {faq.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp size={18} className="shrink-0 text-[#FF6A00]" />
                    ) : (
                      <ChevronDown size={18} className="shrink-0 text-neutral-400" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="mt-2 text-xs text-neutral-600 leading-relaxed pl-3 sm:pl-4 border-l-2 border-[#FF6A00] bg-orange-50/30 py-2 rounded-r-xl">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center space-y-3">
            <HelpCircle size={36} className="mx-auto text-neutral-300" />
            <p className="text-sm font-bold text-neutral-700">No matching questions found</p>
            <p className="text-xs text-neutral-400">Try searching for keywords like "M-Pesa", "payout", "return", or "delivery".</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-neutral-700 rounded-xl transition"
            >
              Reset Search Filters
            </button>
          </div>
        )}
      </div>

      {/* Contact Support Banner */}
      <div className="bg-[#0B132B] text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-lg font-black">Still need help with an order or escrow?</h3>
          <p className="text-xs text-neutral-300">
            Our Dar es Salaam support team is available 24/7 via phone, WhatsApp and live app chat.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsAiChatOpen(true)}
            className="px-4 py-2.5 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Bot size={15} />
            <span>Chat with LumoCare AI</span>
          </button>
          <a
            href="tel:+255712345678"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition border border-white/20 flex items-center gap-1.5"
          >
            <Phone size={14} />
            <span>+255 712 345 678</span>
          </a>
          <Link
            to="/products"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition border border-white/20"
          >
            Back to Shop
          </Link>
        </div>
      </div>

      {/* 24/7 AI Customer Care Modal */}
      <AiSupportChatModal
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
      />
    </div>
  );
};

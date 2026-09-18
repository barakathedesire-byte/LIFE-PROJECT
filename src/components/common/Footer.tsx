import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Mail,
  ArrowRight,
  CreditCard,
  Smartphone,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { LumoLogo } from './LumoLogo';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const { showToast } = useNotification();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    showToast('Asante! You have subscribed to LUMO daily deals and voucher drops.', 'success');
    setEmail('');
  };

  return (
    <footer className="bg-[#0B132B] text-neutral-300 border-t border-neutral-800">
      {/* 1. TRUST FEATURES BANNER */}
      <div className="border-b border-neutral-800/80 bg-black/20 py-8 px-3 sm:px-6">
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-orange-950/80 border border-orange-800/60 text-[#FF6A00] rounded-2xl shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">LUMO Escrow</h4>
              <p className="text-xs text-neutral-400 mt-0.5">
                Funds held safe until you inspect & confirm delivery.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-orange-950/80 border border-orange-800/60 text-[#FF6A00] rounded-2xl shrink-0">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Tanzania-Wide Delivery</h4>
              <p className="text-xs text-neutral-400 mt-0.5">
                Doorstep dispatch & 45+ convenient pickup stations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-orange-950/80 border border-orange-800/60 text-[#FF6A00] rounded-2xl shrink-0">
              <RotateCcw size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">7-Day Free Returns</h4>
              <p className="text-xs text-neutral-400 mt-0.5">
                Hassle-free replacement for defective items.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-orange-950/80 border border-orange-800/60 text-[#FF6A00] rounded-2xl shrink-0">
              <Headphones size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Dedicated Support</h4>
              <p className="text-xs text-neutral-400 mt-0.5">
                Swahili & English helpline: +255 700 000 000.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN FOOTER CONTENT & LINKS */}
      <div className="w-full px-3 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand & Mission Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <LumoLogo size="md" variant="light" />
            </Link>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              LUMO is Tanzania's premier high-density direct multi-vendor marketplace connecting verified local & international merchants with shoppers across East Africa with instant escrow protection.
            </p>

            <form onSubmit={handleSubscribe} className="pt-2 max-w-sm">
              <div className="text-xs font-semibold text-white mb-1.5">
                Subscribe for Exclusive Deals & Vouchers
              </div>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-700 focus:border-[#FF6A00] text-white placeholder:text-neutral-500 text-xs rounded-xl outline-hidden"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <span>Join</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          </div>

          {/* Column 2: Customer Care */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-sm text-white uppercase tracking-wider">Customer Care</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="hover:text-[#FF6A00] transition">
                  Help Center & FAQs
                </Link>
              </li>
              <li>
                <Link to="/account/orders" className="hover:text-[#FF6A00] transition">
                  Track Your Package
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-[#FF6A00] transition">
                  Escrow Guarantee Guide
                </Link>
              </li>
              <li>
                <Link to="/free-delivery" className="hover:text-[#FF6A00] transition">
                  Delivery Zones & Fees (TZS)
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-[#FF6A00] transition">
                  Return & Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/free-delivery" className="hover:text-[#FF6A00] transition">
                  Pickup Stations in Dar & Arusha
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Top Categories */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-sm text-white uppercase tracking-wider">Top Categories</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/category/phones-tablets" className="hover:text-[#FF6A00] transition">
                  Smartphones & Tablets
                </Link>
              </li>
              <li>
                <Link to="/category/electronics" className="hover:text-[#FF6A00] transition">
                  Smart TVs & Sound Systems
                </Link>
              </li>
              <li>
                <Link to="/category/fashion" className="hover:text-[#FF6A00] transition">
                  Fashion & Apparel (Men's & Women's)
                </Link>
              </li>
              <li>
                <Link to="/category/kids-babies" className="hover:text-[#FF6A00] transition">
                  Kids & Babies
                </Link>
              </li>
              <li>
                <Link to="/supermarket" className="hover:text-[#FF6A00] transition">
                  LUMO Supermarket & Groceries
                </Link>
              </li>
              <li>
                <Link to="/save-the-date" className="hover:text-[#FF6A00] transition">
                  Save The Date Discount Gala
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Sell & Partner Workspaces */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-sm text-white uppercase tracking-wider">Partner & Portals</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/register?role=vendor" className="text-[#FF6A00] font-bold hover:underline">
                  Become a Vendor (Sell on LUMO)
                </Link>
              </li>
              <li>
                <Link to="/register?role=delivery" className="text-cyan-400 font-bold hover:underline">
                  Become a Delivery Agent (Rider)
                </Link>
              </li>
              <li>
                <Link to="/register?role=sales" className="text-emerald-400 font-bold hover:underline">
                  Become a Salesperson (Field Rep)
                </Link>
              </li>
              <li className="pt-1 text-neutral-400 font-semibold text-[11px] uppercase tracking-wider">
                Staff & Partner Portals:
              </li>
              <li>
                <Link to="/operations" className="hover:text-[#FF6A00] transition">
                  Operations & Dispatch Hub
                </Link>
              </li>
              <li>
                <Link to="/delivery" className="hover:text-[#FF6A00] transition">
                  Express Delivery Rider Hub
                </Link>
              </li>
              <li>
                <Link to="/seller" className="hover:text-[#FF6A00] transition">
                  Seller Center Dashboard
                </Link>
              </li>
              <li>
                <Link to="/sales" className="hover:text-[#FF6A00] transition">
                  Field Sales Agent Portal
                </Link>
              </li>
              <li className="pt-2 text-neutral-400 border-t border-neutral-800/80">
                <div className="flex items-center gap-1.5 font-medium text-white mb-1">
                  <MapPin size={13} className="text-[#FF6A00]" />
                  <span>Headquarters:</span>
                </div>
                Samora Tower, 4th Floor, Samora Avenue, Dar es Salaam, Tanzania
              </li>
            </ul>
          </div>
        </div>

        {/* 3. PAYMENT METHODS & REGIONAL HUBS */}
        <div className="mt-12 pt-6 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <div>
            <span className="font-semibold text-white mr-3">Accepted Secure Payments:</span>
            <div className="inline-flex items-center gap-2 flex-wrap mt-2 sm:mt-0">
              <span className="px-3 py-1.5 bg-white border border-neutral-200 rounded-xl font-black text-red-600 text-[11px] shadow-2xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                M-PESA (Vodacom)
              </span>
              <span className="px-3 py-1.5 bg-white border border-neutral-200 rounded-xl font-black text-blue-600 text-[11px] shadow-2xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                TIGO PESA
              </span>
              <span className="px-3 py-1.5 bg-white border border-neutral-200 rounded-xl font-black text-red-500 text-[11px] shadow-2xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                AIRTEL MONEY
              </span>
              <span className="px-3 py-1.5 bg-white border border-neutral-200 rounded-xl font-black text-orange-500 text-[11px] shadow-2xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                HALOPESA
              </span>
              <span className="px-3 py-1.5 bg-white border border-neutral-200 rounded-xl font-black text-indigo-900 text-[11px] shadow-2xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                VISA / MASTERCARD
              </span>
              <span className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl font-semibold text-emerald-400 text-[11px]">
                Cash on Delivery (Dar)
              </span>
            </div>
          </div>

          <div className="text-center md:text-right">
            <p>© 2026 LUMO Limited. All rights reserved.</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Empowering High-Density African Commerce • Tanzania • East Africa
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

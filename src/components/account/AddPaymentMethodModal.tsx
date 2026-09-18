import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Phone,
  Banknote,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { SavedPaymentMethod } from '../../types';

interface AddPaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (method: SavedPaymentMethod) => void;
}

type MethodCategory = 'pay_on_delivery' | 'mobile_money' | 'card' | 'bank_transfer';

export const AddPaymentMethodModal: React.FC<AddPaymentMethodModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [category, setCategory] = useState<MethodCategory>('pay_on_delivery');
  
  // Mobile Money fields
  const [mobileProvider, setMobileProvider] = useState<'M-Pesa (Vodacom)' | 'Tigo Pesa' | 'Airtel Money' | 'Halopesa'>('M-Pesa (Vodacom)');
  const [phoneNumber, setPhoneNumber] = useState('+255 ');
  const [mobileHolderName, setMobileHolderName] = useState('');

  // Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // Bank fields
  const [bankName, setBankName] = useState('CRDB Bank PLC');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');

  // Pay on delivery fields
  const [codHolder, setCodHolder] = useState('');
  const [codNotes, setCodNotes] = useState('Inspect products at doorstep before cash/POS settlement');
  
  const [setAsDefault, setSetAsDefault] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let newMethod: SavedPaymentMethod;

    if (category === 'pay_on_delivery') {
      newMethod = {
        id: `pay-cod-${Date.now()}`,
        type: 'pay_on_delivery',
        provider: 'Pay on Delivery',
        accountNumberOrPhone: 'Cash / Mobile POS on Arrival',
        accountHolderName: codHolder || 'Customer',
        isDefault: setAsDefault,
        notes: codNotes,
      };
    } else if (category === 'mobile_money') {
      newMethod = {
        id: `pay-mobile-${Date.now()}`,
        type: 'mobile_money',
        provider: mobileProvider,
        accountNumberOrPhone: phoneNumber,
        accountHolderName: mobileHolderName || 'Subscriber Account',
        isDefault: setAsDefault,
        notes: 'Instant PIN-prompt direct escrow payment',
      };
    } else if (category === 'card') {
      const sanitized = (cardNumber || '').replace(/\s+/g, '');
      const masked = sanitized.length >= 4 
        ? `•••• •••• •••• ${sanitized.slice(-4)}` 
        : '•••• •••• •••• 1234';
      newMethod = {
        id: `pay-card-${Date.now()}`,
        type: 'card',
        provider: 'Visa / MasterCard',
        accountNumberOrPhone: masked,
        accountHolderName: cardHolder || 'Cardholder',
        expiryDate: expiry || '12/28',
        isDefault: setAsDefault,
        notes: '3D Secure Bank Encrypted',
      };
    } else {
      newMethod = {
        id: `pay-bank-${Date.now()}`,
        type: 'bank_transfer',
        provider: bankName,
        accountNumberOrPhone: accountNumber ? `Acc: ${accountNumber}` : 'Account ending in 8921',
        accountHolderName: accountHolder || 'Account Holder',
        isDefault: setAsDefault,
        notes: 'National bank direct wire transfer',
      };
    }

    onAdd(newMethod);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-5 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#FF6A00] flex items-center justify-center">
              <CreditCard size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-neutral-900">
                Add New Payment Method
              </h3>
              <p className="text-xs text-neutral-500">
                Securely encrypted and protected by LUMO Escrow
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Method Type Selector Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => setCategory('pay_on_delivery')}
            className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1.5 text-center transition cursor-pointer ${
              category === 'pay_on_delivery'
                ? 'border-[#FF6A00] bg-orange-50/80 text-[#FF6A00] font-bold shadow-xs'
                : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-medium'
            }`}
          >
            <Banknote size={20} className={category === 'pay_on_delivery' ? 'text-[#FF6A00]' : 'text-neutral-500'} />
            <span className="text-[11px] leading-tight">Pay on Delivery</span>
          </button>

          <button
            type="button"
            onClick={() => setCategory('mobile_money')}
            className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1.5 text-center transition cursor-pointer ${
              category === 'mobile_money'
                ? 'border-[#FF6A00] bg-orange-50/80 text-[#FF6A00] font-bold shadow-xs'
                : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-medium'
            }`}
          >
            <Phone size={20} className={category === 'mobile_money' ? 'text-[#FF6A00]' : 'text-neutral-500'} />
            <span className="text-[11px] leading-tight">Mobile Money</span>
          </button>

          <button
            type="button"
            onClick={() => setCategory('card')}
            className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1.5 text-center transition cursor-pointer ${
              category === 'card'
                ? 'border-[#FF6A00] bg-orange-50/80 text-[#FF6A00] font-bold shadow-xs'
                : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-medium'
            }`}
          >
            <CreditCard size={20} className={category === 'card' ? 'text-[#FF6A00]' : 'text-neutral-500'} />
            <span className="text-[11px] leading-tight">Debit/Credit Card</span>
          </button>

          <button
            type="button"
            onClick={() => setCategory('bank_transfer')}
            className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1.5 text-center transition cursor-pointer ${
              category === 'bank_transfer'
                ? 'border-[#FF6A00] bg-orange-50/80 text-[#FF6A00] font-bold shadow-xs'
                : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-medium'
            }`}
          >
            <Building2 size={20} className={category === 'bank_transfer' ? 'text-[#FF6A00]' : 'text-neutral-500'} />
            <span className="text-[11px] leading-tight">Bank Wire</span>
          </button>
        </div>

        {/* Dynamic Form Content */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {category === 'pay_on_delivery' && (
            <div className="space-y-3 p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80">
              <div className="flex items-start gap-2.5">
                <ShieldCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-neutral-900 text-xs">Pay on Delivery (Zero Advance Risk)</h4>
                  <p className="text-neutral-600 text-[11px]">
                    Available across Dar es Salaam, Arusha, and all partner pickup station hubs. You inspect the parcel before paying with cash or mobile POS.
                  </p>
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Recipient Name</label>
                <input
                  type="text"
                  required
                  value={codHolder}
                  onChange={(e) => setCodHolder(e.target.value)}
                  placeholder="e.g. Rashid Mohamed"
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl focus:border-[#FF6A00] outline-hidden text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Delivery Handover Preference</label>
                <input
                  type="text"
                  value={codNotes}
                  onChange={(e) => setCodNotes(e.target.value)}
                  placeholder="e.g. Cash exact change or Tigo Pesa POS swipe"
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl focus:border-[#FF6A00] outline-hidden text-xs"
                />
              </div>
            </div>
          )}

          {category === 'mobile_money' && (
            <div className="space-y-3">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Select Network Provider</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'M-Pesa (Vodacom)', color: 'text-red-600 border-red-200' },
                    { id: 'Tigo Pesa', color: 'text-blue-600 border-blue-200' },
                    { id: 'Airtel Money', color: 'text-red-500 border-red-200' },
                    { id: 'Halopesa', color: 'text-orange-500 border-orange-200' },
                  ].map((prov) => (
                    <button
                      key={prov.id}
                      type="button"
                      onClick={() => setMobileProvider(prov.id as any)}
                      className={`p-2 rounded-xl border text-center transition font-bold text-xs cursor-pointer ${
                        mobileProvider === prov.id
                          ? 'border-[#FF6A00] bg-orange-50 text-[#FF6A00] shadow-xs'
                          : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      {prov.id}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Mobile Phone Number *</label>
                <input
                  type="text"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+255 754 892 314"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-[#FF6A00] outline-hidden text-xs"
                />
                <span className="text-[10px] text-neutral-400 mt-1 block">
                  Tanzanian format (+255 7XX XXX XXX or 07XX XXX XXX)
                </span>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Account Holder Full Name</label>
                <input
                  type="text"
                  required
                  value={mobileHolderName}
                  onChange={(e) => setMobileHolderName(e.target.value)}
                  placeholder="Registered name on SIM card"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-[#FF6A00] outline-hidden text-xs"
                />
              </div>
            </div>
          )}

          {category === 'card' && (
            <div className="space-y-3">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Card Number *</label>
                <input
                  type="text"
                  required
                  maxLength={19}
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4000 1234 5678 9010"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-[#FF6A00] outline-hidden text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Cardholder Name *</label>
                <input
                  type="text"
                  required
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder="Name as printed on card"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-[#FF6A00] outline-hidden text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Expiry Date (MM/YY) *</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="08/28"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-[#FF6A00] outline-hidden text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">CVV / Security Code *</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="•••"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-[#FF6A00] outline-hidden text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {category === 'bank_transfer' && (
            <div className="space-y-3">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Select Bank</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-[#FF6A00] outline-hidden text-xs font-medium"
                >
                  <option value="CRDB Bank PLC">CRDB Bank PLC</option>
                  <option value="NMB Bank PLC">NMB Bank PLC</option>
                  <option value="Standard Chartered Tanzania">Standard Chartered Tanzania</option>
                  <option value="Stanbic Bank Tanzania">Stanbic Bank Tanzania</option>
                  <option value="KCB Bank Tanzania">KCB Bank Tanzania</option>
                  <option value="Absa Bank Tanzania">Absa Bank Tanzania</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Account Number *</label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="0150XXXXXXXXXX"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-[#FF6A00] outline-hidden text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Account Holder Name *</label>
                <input
                  type="text"
                  required
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder="Full Legal Account Name"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-[#FF6A00] outline-hidden text-xs"
                />
              </div>
            </div>
          )}

          {/* Set as default checkbox */}
          <div className="pt-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="setAsDefault"
              checked={setAsDefault}
              onChange={(e) => setSetAsDefault(e.target.checked)}
              className="rounded text-[#FF6A00] focus:ring-[#FF6A00] cursor-pointer"
            />
            <label htmlFor="setAsDefault" className="text-xs font-medium text-neutral-700 cursor-pointer">
              Set as primary default payment method
            </label>
          </div>

          {/* Buttons */}
          <div className="pt-3 flex gap-2.5">
            <button
              type="submit"
              className="flex-1 py-3 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-bold text-xs rounded-xl shadow-lg transition active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 size={16} />
              <span>Save Payment Method</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

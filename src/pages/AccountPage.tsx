import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../context/OrderContext';
import { useWishlist } from '../context/WishlistContext';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  User,
  Package,
  Heart,
  MapPin,
  ShieldCheck,
  CreditCard,
  Edit2,
  Plus,
  Trash2,
  CheckCircle2,
  LogOut,
  Banknote,
  Phone,
  Building2,
  ExternalLink,
  Store,
  Truck,
  TrendingUp,
  Compass,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { DeliveryAddress, SavedPaymentMethod } from '../types';
import { BackButton } from '../components/common/BackButton';
import { AddPaymentMethodModal } from '../components/account/AddPaymentMethodModal';

export const AccountPage: React.FC = () => {
  const {
    user,
    addAddress,
    deleteAddress,
    setDefaultAddress,
    updateProfile,
    logout,
    addPaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
  } = useAuth();

  const { orders } = useOrder();
  const { wishlist } = useWishlist();
  const { showToast } = useNotification();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');

  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);

  const [newRegion, setNewRegion] = useState('Dar es Salaam');
  const [newCity, setNewCity] = useState('Kinondoni');
  const [newArea, setNewArea] = useState('');
  const [newStreet, setNewStreet] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, phone, email });
    setIsEditingProfile(false);
    showToast('Profile updated successfully!', 'success');
  };

  const handleCreateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArea || !newStreet) {
      showToast('Please fill all address fields', 'error');
      return;
    }

    const newAddr: DeliveryAddress = {
      fullName: name || user?.name || 'Customer',
      phone: phone || user?.phone || '+255 754 892 314',
      region: newRegion,
      city: newCity,
      area: newArea,
      streetAddress: newStreet,
      isDefault: (user?.addresses?.length || 0) === 0,
    };

    addAddress(newAddr);
    setShowAddAddressModal(false);
    setNewArea('');
    setNewStreet('');
    showToast('New shipping address saved!', 'success');
  };

  const handleAddPaymentMethod = (method: SavedPaymentMethod) => {
    addPaymentMethod(method);
    showToast(`Payment method (${method.provider}) saved!`, 'success');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="w-full px-2 sm:px-4 lg:px-6 py-6 sm:py-8 space-y-6"
    >
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <BackButton label="Back to Shopping" fallbackUrl="/" />
        <div className="text-xs text-neutral-500 font-medium hidden sm:block">
          LUMO Customer Security & Account Center
        </div>
      </div>

      {/* Account Header */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0B132B] to-[#FF6A00] text-white font-black text-xl flex items-center justify-center shadow-md">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-neutral-900">{user?.name}</h1>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 size={11} />
                Verified Buyer
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              {user?.phone} • {user?.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="flex-1 sm:flex-none px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Edit2 size={13} />
            <span>Edit Profile</span>
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-red-200"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Edit Profile Form */}
      {isEditingProfile && (
        <form
          onSubmit={handleSaveProfile}
          className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs space-y-4 animate-in fade-in"
        >
          <h3 className="font-bold text-sm text-neutral-900">Update Profile Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl outline-hidden focus:border-[#FF6A00]"
              />
            </div>
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Phone Number</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl outline-hidden focus:border-[#FF6A00]"
              />
            </div>
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl outline-hidden focus:border-[#FF6A00]"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setIsEditingProfile(false)}
              className="px-4 py-2 bg-neutral-100 text-neutral-700 font-bold text-xs rounded-xl cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/account/orders"
          className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-2xs hover:border-[#FF6A00] transition group flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-neutral-400 uppercase">My Orders</span>
            <div className="text-xl font-black text-neutral-900 group-hover:text-[#FF6A00]">
              {orders.length} Orders
            </div>
            <p className="text-[11px] text-neutral-500">Track current status & escrow</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6A00] flex items-center justify-center">
            <Package size={20} />
          </div>
        </Link>

        <Link
          to="/wishlist"
          className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-2xs hover:border-[#FF6A00] transition group flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-neutral-400 uppercase">Saved Wishlist</span>
            <div className="text-xl font-black text-neutral-900 group-hover:text-[#FF6A00]">
              {wishlist.length} Items
            </div>
            <p className="text-[11px] text-neutral-500">View saved products</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <Heart size={20} />
          </div>
        </Link>

        <div className="bg-gradient-to-br from-[#0B132B] to-[#1E293B] text-white rounded-2xl border border-neutral-800 p-5 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-orange-300 uppercase">Buyer Security</span>
            <div className="text-xl font-black text-white">100% Escrow</div>
            <p className="text-[11px] text-neutral-300">Funds held safe until inspection</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FF6A00] text-white flex items-center justify-center">
            <ShieldCheck size={20} />
          </div>
        </div>
      </div>



      {/* Payment Methods Section with Add Payment Method Button */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-neutral-900">Saved Payment Methods</h3>
              <span className="px-2 py-0.5 rounded-full bg-orange-50 text-[#FF6A00] text-[10px] font-extrabold">
                {(user?.paymentMethods || []).length} Saved
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              Manage Pay on Delivery, Mobile Money (M-Pesa / Tigo Pesa), and Bank Cards
            </p>
          </div>

          <button
            onClick={() => setShowAddPaymentModal(true)}
            className="px-4 py-2 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs active:scale-98 self-start sm:self-auto"
          >
            <Plus size={15} />
            <span>Add Payment Method</span>
          </button>
        </div>

        {/* Payment Methods List Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
          {(user?.paymentMethods || []).map((method) => {
            const isDefault = method.isDefault;

            return (
              <div
                key={method.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 relative ${
                  isDefault
                    ? 'border-[#FF6A00] bg-orange-50/40 shadow-xs'
                    : 'border-neutral-200 bg-neutral-50/60 hover:bg-neutral-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-800 shadow-2xs">
                        {method.type === 'pay_on_delivery' && <Banknote size={17} className="text-emerald-600" />}
                        {method.type === 'mobile_money' && <Phone size={17} className="text-[#FF6A00]" />}
                        {method.type === 'card' && <CreditCard size={17} className="text-blue-600" />}
                        {method.type === 'bank_transfer' && <Building2 size={17} className="text-purple-600" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-900 text-xs">{method.provider}</h4>
                        <span className="text-[10px] text-neutral-400 font-medium capitalize">
                          {(method.type || '').replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    {isDefault && (
                      <span className="bg-[#FF6A00] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-2xs">
                        Default
                      </span>
                    )}
                  </div>

                  <div className="bg-white rounded-xl p-2.5 border border-neutral-200/80 space-y-1">
                    <div className="font-mono font-bold text-neutral-900 text-xs truncate">
                      {method.accountNumberOrPhone}
                    </div>
                    <div className="text-[11px] text-neutral-600 font-medium truncate">
                      {method.accountHolderName}
                    </div>
                    {method.expiryDate && (
                      <div className="text-[10px] text-neutral-400">
                        Expires: {method.expiryDate}
                      </div>
                    )}
                  </div>

                  {method.notes && (
                    <p className="text-[10px] text-neutral-500 mt-2 italic">
                      {method.notes}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-neutral-200/70 flex items-center justify-between">
                  {!isDefault ? (
                    <button
                      onClick={() => setDefaultPaymentMethod(method.id)}
                      className="text-[#FF6A00] hover:text-[#E55E00] hover:underline font-bold text-[11px] cursor-pointer"
                    >
                      Set as Default
                    </button>
                  ) : (
                    <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      <span>Primary Method</span>
                    </span>
                  )}

                  {(user?.paymentMethods?.length || 0) > 1 && (
                    <button
                      onClick={() => deletePaymentMethod(method.id)}
                      className="text-neutral-400 hover:text-red-600 flex items-center gap-1 text-[11px] cursor-pointer transition"
                    >
                      <Trash2 size={12} />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shipping Addresses Section */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h3 className="font-extrabold text-base text-neutral-900">Saved Shipping Addresses</h3>
            <p className="text-xs text-neutral-500">Default delivery destinations in Tanzania</p>
          </div>
          <button
            onClick={() => setShowAddAddressModal(true)}
            className="px-3.5 py-1.5 bg-[#0B132B] hover:bg-[#1E293B] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Address</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {(user?.addresses || []).map((addr, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 flex flex-col justify-between space-y-2 relative"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-neutral-900">{addr.fullName}</span>
                  {addr.isDefault && (
                    <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-neutral-600">{addr.phone}</p>
                <p className="text-neutral-700 font-medium mt-1">
                  {addr.streetAddress}, {addr.area}, {addr.city}, {addr.region}
                </p>
              </div>

              <div className="pt-2 border-t border-neutral-200/60 flex items-center justify-between">
                {!addr.isDefault ? (
                  <button
                    onClick={() => setDefaultAddress(idx)}
                    className="text-[#FF6A00] hover:underline font-bold text-[11px] cursor-pointer"
                  >
                    Set as Default
                  </button>
                ) : (
                  <span className="text-emerald-700 font-bold text-[11px]">Default Address</span>
                )}

                {(user?.addresses?.length || 0) > 1 && (
                  <button
                    onClick={() => deleteAddress(idx)}
                    className="text-neutral-400 hover:text-red-600 flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    <Trash2 size={12} />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Address Modal */}
      {showAddAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-neutral-900">Add New Delivery Address</h3>
            <form onSubmit={handleCreateAddress} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Region</label>
                <select
                  value={newRegion}
                  onChange={(e) => setNewRegion(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                >
                  <option value="Dar es Salaam">Dar es Salaam</option>
                  <option value="Arusha">Arusha</option>
                  <option value="Mwanza">Mwanza</option>
                  <option value="Dodoma">Dodoma</option>
                  <option value="Zanzibar">Zanzibar</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">City / District</label>
                <input
                  type="text"
                  required
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  placeholder="e.g. Kinondoni, Ilala, Temeke, Arusha Urban"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Area / Neighborhood *</label>
                <input
                  type="text"
                  required
                  value={newArea}
                  onChange={(e) => setNewArea(e.target.value)}
                  placeholder="e.g. Sinza Mori, Masaki, Mikocheni"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Street Address / Building *</label>
                <input
                  type="text"
                  required
                  value={newStreet}
                  onChange={(e) => setNewStreet(e.target.value)}
                  placeholder="e.g. House No. 42, Shekilango Road"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-bold rounded-xl cursor-pointer"
                >
                  Save Address
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddAddressModal(false)}
                  className="px-4 py-2.5 bg-neutral-100 text-neutral-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Payment Method Modal */}
      <AddPaymentMethodModal
        isOpen={showAddPaymentModal}
        onClose={() => setShowAddPaymentModal(false)}
        onAdd={handleAddPaymentMethod}
      />
    </motion.div>
  );
};

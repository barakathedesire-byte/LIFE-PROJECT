import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Phone, 
  PhoneOff, 
  PhoneCall, 
  PhoneIncoming, 
  PhoneOutgoing, 
  Mic, 
  MicOff, 
  Pause, 
  Play, 
  User, 
  Clock, 
  MessageSquare, 
  X, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Search, 
  CheckCircle2, 
  FileText,
  Radio,
  Headphones
} from 'lucide-react';

export interface CallCenterContact {
  id: string;
  name: string;
  phone: string;
  role: 'CUSTOMER' | 'RIDER' | 'SELLER' | 'HUB_AGENT';
  orderId?: string;
  ticketId?: string;
  avatar?: string;
}

const MOCK_CONTACTS: CallCenterContact[] = [
  { id: 'c1', name: 'Juma Hassan', phone: '+255 784 123 456', role: 'CUSTOMER', orderId: 'ORD-8812', ticketId: 'TCK-1042', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
  { id: 'c2', name: 'Baraka Ally (Rider)', phone: '+255 744 887 766', role: 'RIDER', orderId: 'ORD-8812', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' },
  { id: 'c3', name: 'Fatuma Said', phone: '+255 712 990 011', role: 'CUSTOMER', orderId: 'ORD-10482', ticketId: 'TCK-1039', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
  { id: 'c4', name: 'Kariakoo Electronics', phone: '+255 22 211 4455', role: 'SELLER', orderId: 'ORD-10479', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' },
  { id: 'c5', name: 'Kurasini Hub Controller', phone: '+255 22 211 0000', role: 'HUB_AGENT', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100' },
];

export interface CallHistoryItem {
  id: string;
  contactName: string;
  phone: string;
  role: string;
  type: 'INBOUND' | 'OUTBOUND' | 'MISSED';
  duration: string;
  timestamp: string;
  notes?: string;
  disposition?: string;
}

interface LumoCallCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContact?: CallCenterContact | null;
  onLogCallToTicket?: (callDetails: { contact: CallCenterContact; duration: string; notes: string; disposition: string }) => void;
}

export const LumoCallCenterModal: React.FC<LumoCallCenterModalProps> = ({
  isOpen,
  onClose,
  initialContact,
  onLogCallToTicket
}) => {
  const [activeTab, setActiveTab] = useState<'dialer' | 'active' | 'history'>('dialer');
  const [phoneNumber, setPhoneNumber] = useState(initialContact?.phone || '');
  const [selectedContact, setSelectedContact] = useState<CallCenterContact | null>(initialContact || MOCK_CONTACTS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Call States
  const [callState, setCallState] = useState<'IDLE' | 'RINGING_INBOUND' | 'DIALING' | 'CONNECTED' | 'ENDED'>('IDLE');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [callNotes, setCallNotes] = useState('');
  const [disposition, setDisposition] = useState('RESOLVED_ON_CALL');
  const [liveTranscript, setLiveTranscript] = useState<string[]>([
    'Agent: Habari, thank you for calling LUMO Care & Command Center. My name is Jessica. How may I assist you today?',
    'Customer: Habari Jessica! I am inquiring about my delivery for order #ORD-8812.',
    'Agent: Let me check that right away. I see Rider Baraka is currently 5 minutes away from your location in Upanga.'
  ]);

  // Call History
  const [callHistory, setCallHistory] = useState<CallHistoryItem[]>([
    { id: 'h1', contactName: 'Juma Hassan', phone: '+255 784 123 456', role: 'CUSTOMER', type: 'INBOUND', duration: '03:45', timestamp: '10 mins ago', notes: 'Confirmed doorstep address in Upanga West.', disposition: 'RESOLVED_ON_CALL' },
    { id: 'h2', contactName: 'Baraka Ally (Rider)', phone: '+255 744 887 766', role: 'RIDER', type: 'OUTBOUND', duration: '01:20', timestamp: '35 mins ago', notes: 'Instructed rider to prioritize express parcel.', disposition: 'DISPATCH_UPDATED' },
    { id: 'h3', contactName: 'Fatuma Said', phone: '+255 712 990 011', role: 'CUSTOMER', type: 'MISSED', duration: '00:00', timestamp: '1 hour ago', notes: 'Missed call during peak queue. Returned call.', disposition: 'FOLLOW_UP_NEEDED' }
  ]);

  // Set initial contact if passed
  useEffect(() => {
    if (initialContact) {
      setSelectedContact(initialContact);
      setPhoneNumber(initialContact.phone);
    }
  }, [initialContact]);

  // Timer effect for connected call
  useEffect(() => {
    let interval: any;
    if (callState === 'CONNECTED') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [callState]);

  // Format call duration (e.g. 02:15)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartCall = (contact?: CallCenterContact) => {
    const target = contact || selectedContact || {
      id: 'custom-' + Date.now(),
      name: phoneNumber || 'Direct Caller',
      phone: phoneNumber || '+255 700 000 000',
      role: 'CUSTOMER'
    };
    setSelectedContact(target);
    setCallState('DIALING');
    setActiveTab('active');

    // Simulate connection after 2.5 seconds
    setTimeout(() => {
      setCallState('CONNECTED');
    }, 2500);
  };

  const handleSimulateIncomingCall = () => {
    const randomContact = MOCK_CONTACTS[Math.floor(Math.random() * MOCK_CONTACTS.length)];
    setSelectedContact(randomContact);
    setPhoneNumber(randomContact.phone);
    setCallState('RINGING_INBOUND');
    setActiveTab('active');
  };

  const handleAcceptCall = () => {
    setCallState('CONNECTED');
  };

  const handleEndCall = () => {
    setCallState('ENDED');
    const newRecord: CallHistoryItem = {
      id: 'h-' + Date.now(),
      contactName: selectedContact?.name || phoneNumber || 'Unknown',
      phone: selectedContact?.phone || phoneNumber,
      role: selectedContact?.role || 'CUSTOMER',
      type: callState === 'RINGING_INBOUND' ? 'INBOUND' : 'OUTBOUND',
      duration: formatTime(callDuration),
      timestamp: 'Just now',
      notes: callNotes || 'Call completed.',
      disposition
    };

    setCallHistory(prev => [newRecord, ...prev]);

    if (onLogCallToTicket && selectedContact) {
      onLogCallToTicket({
        contact: selectedContact,
        duration: formatTime(callDuration),
        notes: callNotes,
        disposition
      });
    }

    setTimeout(() => {
      setCallState('IDLE');
      setActiveTab('history');
      setCallNotes('');
    }, 1500);
  };

  const handleDialDigit = (digit: string) => {
    setPhoneNumber(prev => prev + digit);
  };

  const filteredContacts = MOCK_CONTACTS.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery) ||
    (c.orderId && c.orderId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header Bar */}
        <div className="bg-[#0F172A] text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-sm tracking-tight">LUMO Care & Command VoIP Call Center</h2>
                <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> ONLINE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Integrated voice communications for customers, riders & hubs</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Simulate Incoming Call Trigger */}
            {callState === 'IDLE' && (
              <button
                onClick={handleSimulateIncomingCall}
                className="px-3 py-1.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-indigo-500/30"
              >
                <PhoneIncoming className="w-3.5 h-3.5 animate-bounce" /> Test Incoming Call
              </button>
            )}

            <button 
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-6 py-2 gap-2">
          <button
            onClick={() => setActiveTab('dialer')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'dialer' ? 'bg-white text-blue-600 shadow-xs border border-slate-200' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Phone className="w-3.5 h-3.5" /> Dialer & Contacts
          </button>

          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer relative ${
              activeTab === 'active' ? 'bg-white text-blue-600 shadow-xs border border-slate-200' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" /> 
            Active Call Console
            {callState !== 'IDLE' && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'history' ? 'bg-white text-blue-600 shadow-xs border border-slate-200' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Call History & Logs
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* TAB 1: DIALER & CONTACTS */}
          {activeTab === 'dialer' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Number Keypad & Direct Call */}
              <div className="space-y-4 border-r border-slate-100 pr-0 md:pr-6">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Enter Phone Number or Keypad</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+255 7XX XXX XXX"
                      className="w-full pl-3 pr-10 py-3 rounded-2xl border border-slate-200 bg-slate-50 font-mono text-lg font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    {phoneNumber && (
                      <button onClick={() => setPhoneNumber('')} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Dialpad Matrix */}
                <div className="grid grid-cols-3 gap-2">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((digit) => (
                    <button
                      key={digit}
                      onClick={() => handleDialDigit(digit)}
                      className="py-3 rounded-2xl bg-slate-100 hover:bg-blue-50 text-slate-900 hover:text-blue-600 font-extrabold text-base transition cursor-pointer border border-slate-200/60 active:scale-95"
                    >
                      {digit}
                    </button>
                  ))}
                </div>

                {/* Call Action Button */}
                <button
                  onClick={() => handleStartCall()}
                  disabled={!phoneNumber.trim()}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
                >
                  <PhoneOutgoing className="w-5 h-5" /> Start Voice Call
                </button>
              </div>

              {/* Right Column: Quick Contacts Directory */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Quick Directory</h3>
                  <span className="text-[11px] text-slate-400 font-medium">{filteredContacts.length} available</span>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, phone, order #..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {filteredContacts.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => { setSelectedContact(c); setPhoneNumber(c.phone); }}
                      className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                        selectedContact?.id === c.id 
                          ? 'bg-blue-50/80 border-blue-300 shadow-2xs' 
                          : 'bg-white border-slate-200/80 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img src={c.avatar} alt={c.name} className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-xs text-slate-900">{c.name}</h4>
                            <span className="px-1.5 py-0.2 rounded-md bg-slate-100 text-[9px] font-bold text-slate-600">
                              {c.role}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-mono">{c.phone}</p>
                          {c.orderId && (
                            <span className="text-[10px] text-blue-600 font-bold">Order: {c.orderId}</span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); handleStartCall(c); }}
                        className="p-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition cursor-pointer"
                        title="Call now"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACTIVE CALL CONSOLE */}
          {activeTab === 'active' && (
            <div className="space-y-6">
              {/* IDLE state notice */}
              {callState === 'IDLE' && (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <PhoneOff className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">No Call Currently Active</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                      Select a contact or dial a phone number from the dialer tab, or test an incoming call.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('dialer')}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-xs hover:bg-blue-500 cursor-pointer"
                  >
                    Open Dialer
                  </button>
                </div>
              )}

              {/* INBOUND RINGING STATE */}
              {callState === 'RINGING_INBOUND' && (
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-8 text-center space-y-6 shadow-xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-blue-500/10 animate-pulse pointer-events-none"></div>

                  <div className="relative z-10 space-y-3">
                    <div className="w-20 h-20 rounded-full bg-blue-600/30 border-2 border-blue-400/50 flex items-center justify-center mx-auto animate-bounce">
                      <img src={selectedContact?.avatar} className="w-16 h-16 rounded-full object-cover" alt="Caller" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold bg-blue-500/30 text-blue-300 border border-blue-400/30 px-3 py-1 rounded-full uppercase tracking-wider">
                        INCOMING VOICE CALL
                      </span>
                      <h3 className="text-xl font-black text-white mt-2">{selectedContact?.name || 'Incoming Caller'}</h3>
                      <p className="text-xs text-slate-300 font-mono">{selectedContact?.phone}</p>
                      {selectedContact?.orderId && (
                        <p className="text-xs font-bold text-emerald-400 mt-1">Associated Order: #{selectedContact.orderId}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-6 relative z-10">
                    <button
                      onClick={handleEndCall}
                      className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg cursor-pointer"
                    >
                      <PhoneOff className="w-4 h-4" /> Decline
                    </button>
                    <button
                      onClick={handleAcceptCall}
                      className="px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/30 cursor-pointer animate-pulse"
                    >
                      <Phone className="w-5 h-5" /> Accept Call
                    </button>
                  </div>
                </div>
              )}

              {/* DIALING STATE */}
              {callState === 'DIALING' && (
                <div className="bg-slate-900 text-white rounded-3xl p-8 text-center space-y-6 shadow-xl">
                  <div className="w-20 h-20 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center mx-auto animate-pulse">
                    <PhoneOutgoing className="w-8 h-8 text-blue-400 animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white">Dialing {selectedContact?.name || phoneNumber}...</h3>
                    <p className="text-xs text-slate-400 font-mono mt-1">{selectedContact?.phone || phoneNumber}</p>
                    <p className="text-xs text-blue-400 font-medium mt-2">Connecting to LUMO Telecom Gateway...</p>
                  </div>
                  <button
                    onClick={handleEndCall}
                    className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs mx-auto flex items-center gap-2 cursor-pointer"
                  >
                    <PhoneOff className="w-4 h-4" /> Cancel Call
                  </button>
                </div>
              )}

              {/* CONNECTED STATE */}
              {(callState === 'CONNECTED' || callState === 'ENDED') && (
                <div className="space-y-6">
                  {/* Active Call Header Card */}
                  <div className="bg-[#0B1527] text-white rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl border border-slate-800">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img src={selectedContact?.avatar} className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500" alt="Caller" />
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0B1527] animate-ping"></span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-extrabold text-white">{selectedContact?.name}</h3>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                            {callState === 'CONNECTED' ? 'LIVE CALL' : 'CALL ENDED'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono">{selectedContact?.phone} • {selectedContact?.role}</p>
                        {selectedContact?.orderId && (
                          <span className="text-[11px] font-bold text-blue-400 block pt-0.5">Linked Order: #{selectedContact.orderId}</span>
                        )}
                      </div>
                    </div>

                    {/* Timer & Controls */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-black font-mono text-emerald-400">{formatTime(callDuration)}</div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Call Duration</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsMuted(!isMuted)}
                          className={`p-3 rounded-2xl transition cursor-pointer ${
                            isMuted ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                          }`}
                          title={isMuted ? 'Unmute' : 'Mute Microphone'}
                        >
                          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        </button>

                        <button
                          onClick={() => setIsOnHold(!isOnHold)}
                          className={`p-3 rounded-2xl transition cursor-pointer ${
                            isOnHold ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                          }`}
                          title={isOnHold ? 'Resume Call' : 'Put on Hold'}
                        >
                          {isOnHold ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                        </button>

                        <button
                          onClick={handleEndCall}
                          className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg cursor-pointer"
                        >
                          <PhoneOff className="w-5 h-5" /> End Call
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Call Workspace Grid: Notes + Live AI Transcript */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left: Agent Call Notes & Disposition */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                      <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-blue-600" /> Agent Call Notes & Disposition
                      </h4>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Call Disposition Outcome</label>
                        <select
                          value={disposition}
                          onChange={(e) => setDisposition(e.target.value)}
                          className="w-full bg-white border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-2"
                        >
                          <option value="RESOLVED_ON_CALL">Resolved on Call (No escalation needed)</option>
                          <option value="DISPATCH_UPDATED">Dispatched Courier / Rider Updated</option>
                          <option value="REFUND_APPROVED">Refund / Dispute Escrow Approved</option>
                          <option value="FOLLOW_UP_NEEDED">Follow-up Required (Ticket Opened)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Internal Notes & Action Taken</label>
                        <textarea
                          rows={4}
                          value={callNotes}
                          onChange={(e) => setCallNotes(e.target.value)}
                          placeholder="Type notes summarizing the customer/rider request and agreed resolution..."
                          className="w-full bg-white border border-slate-200 text-xs text-slate-800 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={handleEndCall}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Save Notes & Complete Call
                        </button>
                      </div>
                    </div>

                    {/* Right: Live AI Speech-to-Text Transcript */}
                    <div className="bg-slate-900 text-slate-200 border border-slate-800 rounded-2xl p-4 space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <h4 className="font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-amber-400" /> AI Real-Time Transcript & Summary
                          </h4>
                          <span className="text-[9px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-mono font-bold">
                            GEMINI VOICE ASSIST
                          </span>
                        </div>

                        <div className="mt-3 space-y-2 text-xs font-mono max-h-48 overflow-y-auto pr-1">
                          {liveTranscript.map((line, idx) => (
                            <div key={idx} className={`p-2 rounded-lg text-[11px] ${
                              line.startsWith('Agent:') ? 'bg-blue-950/80 text-blue-200 border border-blue-800/40' : 'bg-slate-800/80 text-slate-300'
                            }`}>
                              {line}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Sentiment: <strong className="text-emerald-400">Positive (88%)</strong></span>
                        <span>Key Topics: <strong>Delivery ETA, Upanga West</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CALL HISTORY & LOGS */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Recent Call Activity Logs</h3>
                <span className="text-xs text-slate-500 font-bold">{callHistory.length} Recorded Calls</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[10px] text-slate-400 font-bold border-b border-slate-200 uppercase bg-slate-50">
                    <tr>
                      <th className="py-2 px-3">Contact</th>
                      <th className="py-2 px-3">Type</th>
                      <th className="py-2 px-3">Duration</th>
                      <th className="py-2 px-3">Disposition</th>
                      <th className="py-2 px-3">Notes</th>
                      <th className="py-2 px-3 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {callHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{item.contactName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{item.phone}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            item.type === 'INBOUND' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            item.type === 'OUTBOUND' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{item.duration}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-800 text-[11px]">{item.disposition?.replace(/_/g, ' ')}</td>
                        <td className="py-2.5 px-3 text-slate-600 text-[11px] max-w-xs truncate">{item.notes || '-'}</td>
                        <td className="py-2.5 px-3 text-right text-slate-400 text-[10px] font-medium">{item.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

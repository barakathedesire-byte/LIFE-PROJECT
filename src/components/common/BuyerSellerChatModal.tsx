import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { MessageSquare, X, Send, ShieldCheck, Store, Sparkles } from 'lucide-react';

export const BuyerSellerChatModal: React.FC = () => {
  const {
    isChatOpen,
    closeChat,
    activeSellerName,
    activeProductName,
    messages,
    sendMessage,
  } = useChat();

  const [inputVal, setInputVal] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'Is this 100% original brand new?',
    'Can you dispatch to Dar es Salaam today?',
    'What accessories are included inside the box?',
    'Does this have official warranty in Tanzania?',
  ];

  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatOpen]);

  if (!isChatOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    sendMessage(inputVal);
    setInputVal('');
  };

  const handlePromptClick = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full sm:max-w-lg h-[85vh] sm:h-[600px] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-neutral-200">
        {/* Header */}
        <div className="bg-neutral-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center font-bold text-white shadow">
              <Store size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-white">{activeSellerName || 'Verified Merchant'}</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              </div>
              <p className="text-[11px] text-neutral-300 flex items-center gap-1">
                <ShieldCheck size={12} className="text-emerald-400" />
                Verified SokoDirect Seller • Active Now
              </p>
            </div>
          </div>
          <button
            onClick={closeChat}
            className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Product context strip */}
        {activeProductName && (
          <div className="bg-red-50 border-b border-red-100 px-4 py-2 flex items-center justify-between text-xs">
            <span className="text-neutral-700 font-medium truncate max-w-[280px]">
              Inquiring about: <strong className="text-red-900">{activeProductName}</strong>
            </span>
            <span className="text-[10px] text-red-700 font-bold bg-white px-2 py-0.5 rounded border border-red-200">
              Escrow Protected
            </span>
          </div>
        )}

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50/50">
          <div className="text-center my-2">
            <span className="text-[10px] bg-neutral-200 text-neutral-600 px-2.5 py-1 rounded-full font-medium">
              Protected by SokoDirect Escrow • Never share off-platform payment info
            </span>
          </div>

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'buyer' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-xs ${
                  msg.sender === 'buyer'
                    ? 'bg-red-700 text-white rounded-br-xs'
                    : 'bg-white text-neutral-900 border border-neutral-200 rounded-bl-xs'
                }`}
              >
                {msg.sender === 'seller' && (
                  <span className="text-[10px] font-bold text-red-700 block mb-0.5">
                    {msg.senderName}
                  </span>
                )}
                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                <span
                  className={`text-[10px] block text-right mt-1 ${
                    msg.sender === 'buyer' ? 'text-red-200' : 'text-neutral-400'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompt chips */}
        <div className="px-3 py-2 bg-white border-t border-neutral-100 flex gap-1.5 overflow-x-auto no-scrollbar">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handlePromptClick(prompt)}
              className="text-[11px] whitespace-nowrap bg-neutral-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-neutral-700 border border-neutral-200 px-2.5 py-1 rounded-full transition cursor-pointer flex items-center gap-1"
            >
              <Sparkles size={11} className="text-red-600" />
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-neutral-200 flex gap-2">
          <input
            type="text"
            placeholder="Type your message to seller..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="flex-1 px-3.5 py-2 text-sm bg-neutral-100 border border-transparent focus:bg-white focus:border-red-600 rounded-xl outline-hidden transition"
          />
          <button
            type="submit"
            disabled={!inputVal.trim()}
            className="p-2.5 bg-red-700 hover:bg-red-800 disabled:opacity-40 text-white rounded-xl transition cursor-pointer shrink-0"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

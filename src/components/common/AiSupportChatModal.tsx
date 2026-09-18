import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  MessageSquare, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2,
  Phone,
  ChevronRight
} from 'lucide-react';
import { api } from '../../services/api';

interface ChatMessage {
  id: string;
  sender: 'AI' | 'USER';
  text: string;
  timestamp: string;
  source?: string;
}

interface AiSupportChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
}

export const AiSupportChatModal: React.FC<AiSupportChatModalProps> = ({
  isOpen,
  onClose,
  initialTopic
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'AI',
      text: 'Habari! I am **LumoCare AI Assistant**, your 24/7 bilingual support guide. How can I help you with your order, M-Pesa payment, delivery status, or seller questions today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'LumoCare System'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'Where is my order & how does GPS tracking work?',
    'Jinsi gani Escrow inalinda malipo yangu ya M-Pesa?',
    'What is the 7-day return and refund policy?',
    'Where are the Free Dar es Salaam pickup stations?',
    'How do I register as a verified LUMO seller?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isSending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'USER',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsSending(true);

    try {
      const res = await api.askAiCustomerSupport(query);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'AI',
        text: res.reply || 'Thank you! Your inquiry has been processed.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: res.source
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'AI',
        text: 'Sorry, I had trouble connecting. For urgent requests, please contact our Dar es Salaam care desk at +255 22 211 0000.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[600px] max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#0B132B] text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF6A00] to-amber-400 flex items-center justify-center text-white shadow-lg">
              <Bot size={22} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm sm:text-base text-white">LumoCare AI Assistant</h3>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live 24/7
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Escrow, Orders, Returns & Seller Guidance (Swahili / English)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((m) => {
            const isAi = m.sender === 'AI';
            return (
              <div
                key={m.id}
                className={`flex gap-2.5 ${isAi ? 'justify-start' : 'justify-end'}`}
              >
                {isAi && (
                  <div className="w-7 h-7 rounded-xl bg-orange-100 text-[#FF6A00] flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles size={14} />
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    isAi
                      ? 'bg-white text-slate-800 border border-slate-200/80 shadow-xs rounded-tl-none'
                      : 'bg-[#FF6A00] text-white shadow-sm rounded-tr-none font-medium'
                  }`}
                >
                  <div className="whitespace-pre-line">{m.text}</div>
                  <div className={`mt-1.5 flex items-center justify-between text-[10px] ${isAi ? 'text-slate-400' : 'text-orange-100'}`}>
                    <span>{m.timestamp}</span>
                    {m.source && isAi && (
                      <span className="font-mono text-[9px] opacity-75">{m.source}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isSending && (
            <div className="flex gap-2.5 items-center text-xs text-slate-500 bg-white p-3 rounded-2xl w-fit border border-slate-200 shadow-xs animate-pulse">
              <Bot size={16} className="text-[#FF6A00]" />
              <span>LumoCare AI is analyzing your inquiry...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-white border-t border-slate-100 overflow-x-auto flex gap-1.5 no-scrollbar">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              disabled={isSending}
              className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-slate-100 hover:bg-orange-50 hover:text-[#FF6A00] text-slate-600 border border-slate-200 transition shrink-0 whitespace-nowrap cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Input Footer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Uliza swali au andika hapa... (Type in English or Swahili)"
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/20 text-xs outline-none bg-slate-50 focus:bg-white transition"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="px-4 py-2.5 rounded-xl bg-[#FF6A00] hover:bg-[#e05d00] disabled:opacity-50 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Send size={14} />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

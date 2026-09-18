import React, { createContext, useContext, useState, useEffect } from 'react';
import { BuyerSellerMessage } from '../types';

interface ChatContextType {
  messages: BuyerSellerMessage[];
  activeSellerId: string | null;
  activeSellerName: string | null;
  activeProductId: string | null;
  activeProductName: string | null;
  isChatOpen: boolean;
  openChatWithSeller: (sellerId: string, sellerName: string, productId?: string, productName?: string) => void;
  closeChat: () => void;
  sendMessage: (text: string) => void;
  unreadCount: number;
}

const STORAGE_KEY = 'sokodirect_chat_messages';

const defaultMessages: BuyerSellerMessage[] = [
  {
    id: 'msg-1',
    sender: 'seller',
    senderName: 'TechZone Tanzania (Verified Official Store)',
    text: 'Habari! Welcome to TechZone Tanzania on SokoDirect. All our Samsung and Apple devices come in original factory-sealed boxes with 24-month local warranty. How can we assist you today?',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    productId: 'prod-samsung-a55',
    productName: 'Samsung Galaxy A55 5G',
  },
];

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<BuyerSellerMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load chat messages', e);
    }
    return defaultMessages;
  });

  const [activeSellerId, setActiveSellerId] = useState<string | null>('seller-1');
  const [activeSellerName, setActiveSellerName] = useState<string | null>('TechZone Tanzania');
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [activeProductName, setActiveProductName] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save chat messages', e);
    }
  }, [messages]);

  const openChatWithSeller = (
    sellerId: string,
    sellerName: string,
    productId?: string,
    productName?: string
  ) => {
    setActiveSellerId(sellerId);
    setActiveSellerName(sellerName);
    setActiveProductId(productId || null);
    setActiveProductName(productName || null);
    setIsChatOpen(true);
    setUnreadCount(0);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const buyerMsg: BuyerSellerMessage = {
      id: `msg-${Date.now()}`,
      sender: 'buyer',
      senderName: 'You',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      productId: activeProductId || undefined,
      productName: activeProductName || undefined,
    };

    setMessages((prev) => [...prev, buyerMsg]);

    // Simulate smart, authentic seller reply after 1.5s
    setTimeout(() => {
      let replyText = `Thanks for reaching out! We have this product in stock at our Kariakoo/Posta hub and can dispatch immediately via SokoDirect Escrow protection.`;
      
      const lower = text.toLowerCase();
      if (lower.includes('price') || lower.includes('discount') || lower.includes('bei')) {
        replyText = `Our prices on SokoDirect are already discounted with official warranty. You can also use promo voucher "KARIBU10" at checkout for an extra discount!`;
      } else if (lower.includes('warranty') || lower.includes('guarantee') || lower.includes('original')) {
        replyText = `Yes, 100% genuine guaranteed with official manufacturer warranty card inside. SokoDirect Escrow holds your payment until you inspect the item upon delivery!`;
      } else if (lower.includes('delivery') || lower.includes('dar') || lower.includes('arusha') || lower.includes('mwanza') || lower.includes('leo')) {
        replyText = `For Dar es Salaam, express delivery is within 3-5 hours or pickup station within 24 hours. For Arusha/Mwanza/Dodoma/Zanzibar, delivery takes 1-2 business days.`;
      }

      const sellerMsg: BuyerSellerMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'seller',
        senderName: activeSellerName || 'Verified Seller',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        productId: activeProductId || undefined,
        productName: activeProductName || undefined,
      };

      setMessages((prev) => [...prev, sellerMsg]);
    }, 1200);
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        activeSellerId,
        activeSellerName,
        activeProductId,
        activeProductName,
        isChatOpen,
        openChatWithSeller,
        closeChat,
        sendMessage,
        unreadCount,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title?: string;
  message: string;
  duration?: number;
}

export interface ToastOptions {
  type?: Toast['type'];
  title?: string;
  message: string;
  duration?: number;
}

export interface PlatformNotification {
  id: string;
  title: string;
  message: string;
  type: 'ORDER' | 'PAYMENT' | 'DELIVERY' | 'PICKUP' | 'PROMOTION' | 'SYSTEM' | 'KYC';
  isRead: boolean;
  orderId?: string;
  link?: string;
  createdAt: string;
  targetRoles?: string[]; // e.g., ['CUSTOMER', 'WAREHOUSE', 'ADMIN', 'SELLER']
}

interface NotificationContextType {
  toasts: Toast[];
  showToast: (messageOrOptions: string | ToastOptions, type?: Toast['type'], title?: string, duration?: number) => void;
  addToast: (messageOrOptions: string | ToastOptions, type?: Toast['type'], title?: string, duration?: number) => void;
  removeToast: (id: string) => void;

  // Platform Automated Notices
  notifications: PlatformNotification[];
  unreadCount: number;
  addNotification: (notif: { title: string; message: string; type?: PlatformNotification['type']; orderId?: string; link?: string; targetRoles?: string[] }) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const INITIAL_NOTIFICATIONS: PlatformNotification[] = [
  {
    id: 'notif-1',
    title: 'Order #LM-8492 Ready for Pickup',
    message: 'Your package is ready at Dar Central Station. Show pickup code 8492 to the officer.',
    type: 'PICKUP',
    isRead: false,
    orderId: 'LM-8492',
    link: '/account/orders',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString()
  },
  {
    id: 'notif-2',
    title: 'Express Rider Juma Dispatched',
    message: 'Rider Juma is en route to Dar Central Station with your items for Order #LM-8492.',
    type: 'DELIVERY',
    isRead: false,
    orderId: 'LM-8492',
    link: '/account/orders',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  },
  {
    id: 'notif-3',
    title: 'Payment Confirmed via M-Pesa',
    message: 'TSh 125,000 received for Order #LM-8492. Receipt code: MP849232.',
    type: 'PAYMENT',
    isRead: true,
    orderId: 'LM-8492',
    link: '/account/orders',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString()
  },
  {
    id: 'notif-4',
    title: 'Flash Sale Starts Now!',
    message: 'Get up to 70% off on selected electronics for the next 2 hours.',
    type: 'PROMOTION',
    isRead: true,
    link: '/flash-sales',
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString()
  }
];

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [notifications, setNotifications] = useState<PlatformNotification[]>(() => {
    try {
      const saved = localStorage.getItem('lumo_platform_notifications');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse notifications from localStorage:', e);
    }
    return INITIAL_NOTIFICATIONS;
  });

  // Persist notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('lumo_platform_notifications', JSON.stringify(notifications));
    } catch (e) {
      console.warn('Failed to save notifications to localStorage:', e);
    }
  }, [notifications]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((messageOrOptions: string | ToastOptions, type: Toast['type'] = 'success', title?: string, duration = 3500) => {
    const id = `${Date.now()}-${window.crypto.randomUUID().substring(0, 9)}`;
    let finalToast: Toast;

    if (typeof messageOrOptions === 'object') {
      finalToast = {
        id,
        message: messageOrOptions.message,
        type: messageOrOptions.type || 'success',
        title: messageOrOptions.title,
        duration: messageOrOptions.duration || duration,
      };
    } else {
      finalToast = { id, type, title, message: messageOrOptions, duration };
    }

    setToasts((prev) => [...prev.slice(-4), finalToast]);

    setTimeout(() => {
      removeToast(id);
    }, finalToast.duration || duration);
  }, [removeToast]);

  const addNotification = useCallback((notif: { title: string; message: string; type?: PlatformNotification['type']; orderId?: string; link?: string; targetRoles?: string[] }) => {
    const newNotif: PlatformNotification = {
      id: `notif-${Date.now()}-${window.crypto.randomUUID().substring(0, 6)}`,
      title: notif.title,
      message: notif.message,
      type: notif.type || 'SYSTEM',
      isRead: false,
      orderId: notif.orderId,
      link: notif.link || (notif.orderId ? '/account/orders' : undefined),
      createdAt: new Date().toISOString(),
      targetRoles: notif.targetRoles || ['CUSTOMER', 'ALL']
    };

    setNotifications((prev) => [newNotif, ...prev]);
    showToast(notif.message, 'info', notif.title);
  }, [showToast]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider value={{
      toasts,
      showToast,
      addToast: showToast,
      removeToast,
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

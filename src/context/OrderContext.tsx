import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order, OrderStatus } from '../types';
import { generateOrderNumber, getEstimatedDeliveryDate } from '../utils/formatters';
import { api } from '../services/api';

interface OrderContextType {
  orders: Order[];
  placeOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'statusHistory' | 'trackingNumber' | 'estimatedDeliveryDate'>) => Order;
  getOrderById: (orderId: string) => Order | undefined;
  getOrderByNumber: (orderNumber: string) => Order | undefined;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  cancelOrder: (orderId: string, reason?: string) => void;
  refreshOrders: () => Promise<void>;
}

const STORAGE_KEY = 'lumo_orders';

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load orders from localStorage', e);
    }
    return [];
  });

  const refreshOrders = async () => {
    try {
      const res = await api.getOrders();
      if (res && res.orders && res.orders.length > 0) {
        setOrders(res.orders);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(res.orders));
      }
    } catch (err) {
      console.warn('Could not sync orders from server:', err);
    }
  };

  useEffect(() => {
    refreshOrders();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to save orders to localStorage', e);
    }
  }, [orders]);

  const placeOrder = (
    orderData: Omit<
      Order,
      'id' | 'orderNumber' | 'createdAt' | 'statusHistory' | 'trackingNumber' | 'estimatedDeliveryDate'
    >
  ): Order => {
    const orderNumber = generateOrderNumber();
    const trackingNumber = `LM-TZ-${Math.floor(1000000 + (window.crypto.getRandomValues(new Uint32Array(1))[0] % 9000000))}`;
    const estimatedDate = getEstimatedDeliveryDate(orderData.deliveryMethod.type);

    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      status: 'Processing',
      statusHistory: [
        {
          status: 'Processing',
          date: new Date().toISOString(),
          note: `Order placed via ${orderData.paymentMethod.name}. Payment held safely in LUMO Escrow.`,
        },
      ],
      trackingNumber,
      estimatedDeliveryDate: estimatedDate,
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Send to backend API asynchronously
    api.createOrder(newOrder).catch((err) => {
      console.warn('Failed to sync new order with backend API:', err);
    });

    return newOrder;
  };

  const getOrderById = (orderId: string) => {
    return orders.find((o) => o.id === orderId);
  };

  const getOrderByNumber = (orderNumber: string) => {
    return orders.find(
      (o) => o.orderNumber.toLowerCase() === orderNumber.toLowerCase().trim()
    );
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, note?: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId || order.orderNumber === orderId) {
          const newHistory = [
            ...order.statusHistory,
            {
              status,
              date: new Date().toISOString(),
              note: note || `Status updated to ${status}.`,
            },
          ];
          return {
            ...order,
            status,
            statusHistory: newHistory,
          };
        }
        return order;
      })
    );

    api.updateOrderStatus(orderId, status, note).catch((err) => {
      console.warn('Could not sync status update to backend:', err);
    });
  };

  const cancelOrder = (orderId: string, reason?: string) => {
    updateOrderStatus(
      orderId,
      'Cancelled',
      `Order cancelled by customer. Reason: ${reason || 'Change of mind'}. Escrow refund initiated.`
    );
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        placeOrder,
        getOrderById,
        getOrderByNumber,
        updateOrderStatus,
        cancelOrder,
        refreshOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

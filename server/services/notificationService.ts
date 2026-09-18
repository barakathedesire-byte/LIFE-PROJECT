import { db } from '../db.js';
import { NotificationItem } from '../../src/types/index.js';

export interface NotificationParams {
  recipientUserId: string;
  title: string;
  message: string;
  type?: 'ORDER' | 'PAYMENT' | 'DELIVERY' | 'PAYOUT' | 'SECURITY' | 'PROMOTION' | 'KYC' | 'COMMISSION' | 'SYSTEM';
  severity?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'CRITICAL';
  entityType?: string;
  entityId?: string;
  eventId?: string;
  linkUrl?: string;
  targetRoles?: string[];
  recipientRole?: string;
  isPromotional?: boolean;
}

export class NotificationService {
  /**
   * Authoritatively create a notification for a user, enforcing status/activation checks,
   * idempotency via eventId, and user preferences (e.g. promotional opt-out).
   */
  public static createNotification(params: NotificationParams): NotificationItem | null {
    const currentDb = db.getDb();
    const users = currentDb.users || [];
    const recipient = users.find(u => u.id === params.recipientUserId);

    // Guard: recipient must exist and not be suspended/revoked/inactive
    if (!recipient) {
      return null;
    }
    if (recipient.isActive === false || recipient.status === 'SUSPENDED' || recipient.status === 'REVOKED') {
      return null;
    }

    // Check promotional preference opt-out if applicable
    if (params.isPromotional) {
      const prefs = (recipient as any).notificationPreferences;
      if (prefs && prefs.promotional === false) {
        return null; // Opted out of promotional notifications
      }
    }

    // Idempotency check: if eventId is provided, ensure no duplicate notification for this recipient + event + type
    const eventId = params.eventId;
    if (eventId) {
      const existing = (currentDb.notifications || []).find(n => 
        n.userId === params.recipientUserId && 
        n.type === (params.type || 'ORDER') && 
        (n as any).eventId === eventId
      );
      if (existing) {
        return existing; // Already notified for this event
      }
    }

    const notificationPayload: Partial<NotificationItem> = {
      userId: params.recipientUserId,
      title: params.title,
      message: params.message,
      type: params.type || 'ORDER',
      linkUrl: params.linkUrl,
      createdAt: new Date().toISOString()
    };

    const created = db.addNotification(notificationPayload);

    // Attach extended metadata including eventId
    db.updateDb(d => {
      const target = (d.notifications || []).find(n => n.id === created.id);
      if (target) {
        if (params.severity) (target as any).severity = params.severity;
        if (params.entityType) (target as any).entityType = params.entityType;
        if (params.entityId) (target as any).entityId = params.entityId;
        if (eventId) (target as any).eventId = eventId;
        if (params.targetRoles) (target as any).targetRoles = params.targetRoles;
        if (params.recipientRole) (target as any).recipientRole = params.recipientRole;
        (target as any).deliveryStatus = 'SENT';
      }
      // Also update reference returned object
      if (eventId) (created as any).eventId = eventId;
    });

    return created;
  }

  /**
   * Authoritative Business Event Dispatcher across the LUMO ecosystem.
   */
  public static emitEvent(eventType: string, payload: {
    eventId?: string;
    orderId?: string;
    customerId?: string;
    sellerId?: string;
    riderId?: string;
    warehouseId?: string;
    pickupStationId?: string;
    recipientUserId?: string;
    entityId?: string;
    title?: string;
    message?: string;
    severity?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'CRITICAL';
    linkUrl?: string;
    isPromotional?: boolean;
    metadata?: any;
  }) {
    const eventId = payload.eventId || `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const currentDb = db.getDb();

    switch (eventType) {
      case 'ORDER_CREATED':
      case 'PAYMENT_CONFIRMED': {
        if (payload.customerId) {
          NotificationService.createNotification({
            recipientUserId: payload.customerId,
            eventId,
            type: 'PAYMENT',
            severity: 'SUCCESS',
            title: payload.title || 'Payment Confirmed',
            message: payload.message || `Payment for order ${payload.orderId || ''} has been successfully confirmed.`,
            entityType: 'ORDER',
            entityId: payload.orderId,
            linkUrl: `/customer/orders/${payload.orderId || ''}`
          });
        }
        // Notify Seller(s) involved in the order
        if (payload.orderId) {
          const order = (currentDb.orders || []).find(o => o.id === payload.orderId);
          if (order && Array.isArray(order.items)) {
            const sellerIds = Array.from(new Set(order.items.map((i: any) => i.sellerId).filter(Boolean)));
            sellerIds.forEach(sellerId => {
              const sellerUser = currentDb.users.find(u => u.sellerId === sellerId || u.id === sellerId);
              if (sellerUser) {
                NotificationService.createNotification({
                  recipientUserId: sellerUser.id,
                  eventId: `${eventId}-${sellerUser.id}`,
                  type: 'ORDER',
                  severity: 'SUCCESS',
                  title: 'New Order Received',
                  message: `Order #${order.id} has been placed containing your products.`,
                  entityType: 'ORDER',
                  entityId: order.id,
                  linkUrl: `/seller/orders/${order.id}`
                });
              }
            });
          }
        }
        break;
      }

      case 'PAYMENT_FAILED': {
        if (payload.customerId) {
          NotificationService.createNotification({
            recipientUserId: payload.customerId,
            eventId,
            type: 'PAYMENT',
            severity: 'ERROR',
            title: payload.title || 'Payment Failed',
            message: payload.message || `Payment authorization failed for order ${payload.orderId || ''}. Please retry.`,
            entityType: 'ORDER',
            entityId: payload.orderId,
            linkUrl: `/customer/checkout`
          });
        }
        break;
      }

      case 'RIDER_ASSIGNED': {
        if (payload.riderId) {
          const riderUser = currentDb.users.find(u => u.id === payload.riderId || (u as any).riderId === payload.riderId);
          if (riderUser) {
            NotificationService.createNotification({
              recipientUserId: riderUser.id,
              eventId,
              type: 'DELIVERY',
              severity: 'INFO',
              title: 'New Delivery Assignment',
              message: `You have been assigned to deliver order #${payload.orderId || ''}.`,
              entityType: 'ORDER',
              entityId: payload.orderId,
              linkUrl: `/rider/deliveries`
            });
          }
        }
        if (payload.customerId) {
          NotificationService.createNotification({
            recipientUserId: payload.customerId,
            eventId: `${eventId}-cust`,
            type: 'DELIVERY',
            severity: 'INFO',
            title: 'Rider Assigned',
            message: `A delivery agent has been assigned to your order #${payload.orderId || ''}.`,
            entityType: 'ORDER',
            entityId: payload.orderId,
            linkUrl: `/customer/orders/${payload.orderId || ''}`
          });
        }
        break;
      }

      case 'ORDER_DELIVERED':
      case 'CUSTOMER_PICKUP_COMPLETED': {
        if (payload.customerId) {
          NotificationService.createNotification({
            recipientUserId: payload.customerId,
            eventId,
            type: 'DELIVERY',
            severity: 'SUCCESS',
            title: payload.title || 'Order Delivered',
            message: payload.message || `Your order #${payload.orderId || ''} has been successfully delivered. Thank you for shopping with LUMO!`,
            entityType: 'ORDER',
            entityId: payload.orderId,
            linkUrl: `/customer/orders/${payload.orderId || ''}`
          });
        }
        break;
      }

      case 'CUSTOMER_PICKUP_READY': {
        if (payload.customerId) {
          NotificationService.createNotification({
            recipientUserId: payload.customerId,
            eventId,
            type: 'DELIVERY',
            severity: 'SUCCESS',
            title: 'Ready for Pickup',
            message: `Your order #${payload.orderId || ''} is ready for pickup at your selected Lumo Point.`,
            entityType: 'ORDER',
            entityId: payload.orderId,
            linkUrl: `/customer/orders/${payload.orderId || ''}`
          });
        }
        break;
      }

      case 'PACKAGE_INCOMING': {
        if (payload.pickupStationId) {
          const stationStaff = currentDb.users.filter(u => 
            (u.role === 'PICKUP_STATION_MANAGER' || u.role === 'PICKUP_STATION_STAFF' || u.role === 'PICKUP_OPERATOR') &&
            ((u as any).pickupStationId === payload.pickupStationId || (u as any).stationId === payload.pickupStationId)
          );
          stationStaff.forEach(staff => {
            NotificationService.createNotification({
              recipientUserId: staff.id,
              eventId: `${eventId}-${staff.id}`,
              type: 'ORDER',
              severity: 'INFO',
              title: 'Incoming Package',
              message: `A package for order #${payload.orderId || ''} is incoming to your station.`,
              entityType: 'ORDER',
              entityId: payload.orderId,
              linkUrl: `/pickup/station`
            });
          });
        }
        break;
      }

      default: {
        if (payload.recipientUserId) {
          NotificationService.createNotification({
            recipientUserId: payload.recipientUserId,
            eventId,
            type: (payload.metadata?.type as any) || 'SYSTEM',
            severity: payload.severity || 'INFO',
            title: payload.title || 'LUMO Notification',
            message: payload.message || 'You have a new update.',
            entityType: payload.metadata?.entityType,
            entityId: payload.entityId,
            linkUrl: payload.linkUrl,
            isPromotional: payload.isPromotional
          });
        }
        break;
      }
    }
  }
}

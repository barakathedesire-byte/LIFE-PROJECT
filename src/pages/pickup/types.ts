export interface PickupOrder {
  id: string;
  orderId: string;
  packageId: string;
  customerName: string;
  customerPhone: string;
  sellerName: string;
  deliveryType: 'STANDARD' | 'EXPRESS';
  status: 'INCOMING' | 'RECEIVED' | 'STORED' | 'READY' | 'NOTIFIED' | 'HANDOVER' | 'COLLECTED' | 'EXPIRED' | 'RETURN_PENDING' | 'FAILED';
  arrivalStatus: 'PENDING' | 'ARRIVED' | 'DELAYED';
  arrivedAt?: string;
  pickupDeadline?: string;
  shelfLocation?: string;
  pickupOtpCode?: string;
  packageCount: number;
  paymentStatus: 'PAID' | 'PENDING' | 'CASH_ON_PICKUP';
  amountDue: number;
  condition?: 'GOOD' | 'DAMAGED' | 'TAMPERED';
}

export interface PickupReturn {
  id: string;
  orderId: string;
  customerName: string;
  productName: string;
  reason: string;
  condition: string;
  status: 'REQUESTED' | 'AWAITING_DROPOFF' | 'RECEIVED' | 'INSPECTING' | 'APPROVED' | 'REJECTED' | 'SENT_TO_WAREHOUSE' | 'COMPLETED';
  createdAt: string;
}

export interface StationStaff {
  id: string;
  name: string;
  role: 'Manager' | 'Supervisor' | 'Pickup Staff' | 'Returns Staff' | 'Cashier';
  shift: string;
  status: 'Active' | 'Available' | 'On Break' | 'Offline';
  currentTask?: string;
}

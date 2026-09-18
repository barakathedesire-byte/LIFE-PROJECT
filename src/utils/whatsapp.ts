/**
 * LUMO WhatsApp Utility Service
 * Provides standardized WhatsApp messaging, phone formatting, and template generation across LUMO.
 */

export interface WhatsAppMessageOptions {
  phone: string;
  message: string;
}

/**
 * Standardizes Tanzania/East Africa phone numbers into international WhatsApp format e.g. 255712345678
 */
export function formatWhatsAppPhone(phone: string): string {
  if (!phone) return '255700586600'; // Default LUMO Hotline
  
  // Clean non-digits
  let cleaned = phone.replace(/\D/g, '');
  
  // Handle local 07... or 06... format
  if (cleaned.startsWith('0') && (cleaned.length === 10)) {
    cleaned = '255' + cleaned.substring(1);
  }
  
  // Handle +255...
  if (cleaned.startsWith('255')) {
    return cleaned;
  }
  
  // Fallback if country code missing
  if (cleaned.length === 9) {
    return '255' + cleaned;
  }
  
  return cleaned;
}

/**
 * Generates direct wa.me link
 */
export function getWhatsAppUrl(phone: string, message: string): string {
  const formattedPhone = formatWhatsAppPhone(phone);
  const encodedText = encodeURIComponent(message.trim());
  return `https://wa.me/${formattedPhone}?text=${encodedText}`;
}

/**
 * Opens WhatsApp in a new browser tab or launches app on mobile
 */
export function openWhatsApp(phone: string, message: string): void {
  const url = getWhatsAppUrl(phone, message);
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * LUMO Template Message Generators
 */
export const WhatsAppTemplates = {
  // SOS Emergency Dispatch Alert
  sosEmergencyAlert: (riderName: string, phone: string, location: string, time: string, notes?: string) => `
🚨 *LUMO EMERGENCY SOS ALERT*
-----------------------------
*Rider Name:* ${riderName}
*Phone:* ${phone}
*GPS Location:* ${location}
*Alert Time:* ${time}
${notes ? `*Rider Notes:* ${notes}\n` : ''}
*Action Required:* Operations Control Tower & Rapid Safety Response Dispatched.
  `.trim(),

  emergencyDispatch: (teamName: string, riderName: string, notes: string, location: string) => `
🚨 *LUMO RAPID EMERGENCY RESPONSE SQUAD*
----------------------------------------
*Response Team:* ${teamName}
*Target Rider:* ${riderName}
*Incident Location:* ${location}
*Incident Notes:* ${notes}
⚠️ Rapid safety response team dispatched to coordinates. Standby for voice check-in.
  `.trim(),

  // Buyer Order Dispatch Update
  customerOrderDispatch: (customerName: string, orderNumber: string, riderName: string, riderPhone: string, etaMinutes: number) => `
📦 *LUMO Express Order Delivery Update*
Hello ${customerName}, your LUMO order *#${orderNumber}* is currently out for delivery!
🛵 *Courier Rider:* ${riderName} (${riderPhone})
⏱️ *Estimated Arrival:* ~${etaMinutes} mins
Please keep your phone active to receive your 4-digit handover OTP code.
Thank you for shopping on LUMO Tanzania!
  `.trim(),

  // Vendor Order Notification
  vendorNewOrder: (storeName: string, orderNumber: string, itemSummary: string) => `
🛍️ *LUMO Seller Center Alert*
Hello ${storeName}, you have a new verified order *#${orderNumber}* ready for fulfillment!
📋 *Items:* ${itemSummary}
⚡ Please mark order as "Ready for Pickup" in Seller Center so express rider can collect parcel.
  `.trim(),

  // Customer Care Support Resolution
  supportTicketResponse: (customerName: string, ticketId: string, resolution: string) => `
🎧 *LUMO Customer Care Assistance*
Hello ${customerName}, regarding your support ticket *#${ticketId}*:
${resolution}
If you need further help, reply to this WhatsApp message or call +255 700 LUMO.
  `.trim(),

  // Driver contacting customer upon arrival
  driverArrivedAtBuyer: (customerName: string, orderNumber: string, locationName: string) => `
👋 Hello ${customerName}, I am your LUMO Express Courier rider. I have arrived at *${locationName}* with your parcel for Order *#${orderNumber}*.
Please share your 4-digit handover OTP code when receiving the package.
  `.trim()
};

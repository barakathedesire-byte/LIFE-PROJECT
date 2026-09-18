export type CurrencyCode = 'TZS' | 'USD' | 'KES';

export const CURRENCY_RATES: Record<CurrencyCode, { rate: number; symbol: string; label: string }> = {
  TZS: { rate: 1, symbol: 'TZS ', label: 'TZS (Tanzanian Shilling)' },
  USD: { rate: 1 / 2600, symbol: '$', label: 'USD (US Dollar)' },
  KES: { rate: 1 / 20.4, symbol: 'KSh ', label: 'KES (Kenyan Shilling)' },
};

/**
 * Format number into selected currency (TZS, USD, KES)
 * Default base currency is TZS.
 */
export function formatCurrency(amount: number, currencyOverride?: CurrencyCode): string {
  if (isNaN(amount)) return 'TZS 0';
  
  let currency: CurrencyCode = 'TZS';
  if (currencyOverride) {
    currency = currencyOverride;
  } else if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('lumo_currency') as CurrencyCode;
    if (saved && CURRENCY_RATES[saved]) {
      currency = saved;
    }
  }

  const { rate, symbol } = CURRENCY_RATES[currency] || CURRENCY_RATES.TZS;
  const converted = amount * rate;

  if (currency === 'USD') {
    return `${symbol}${converted.toFixed(2)}`;
  } else if (currency === 'KES') {
    return `${symbol}${Math.round(converted).toLocaleString('en-US')}`;
  }

  return `TZS ${Math.round(converted).toLocaleString('en-US')}`;
}

/**
 * Calculate discount percentage
 */
export function calculateDiscount(price: number, oldPrice?: number): number {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

/**
 * Format a standard date for the marketplace
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export const formatTZS = (amount: number): string => formatCurrency(amount, 'TZS');
export const formatCurrencyTZS = formatTZS;

export const formatOrderDate = formatDate;

/**
 * Format estimated delivery date range
 */
export function getEstimatedDeliveryDate(daysFromNow: number | string = 2): string {
  const numDays = typeof daysFromNow === 'number' ? daysFromNow : (daysFromNow === 'same_day' ? 0 : 2);
  const start = new Date();
  start.setDate(start.getDate() + numDays);
  const end = new Date();
  end.setDate(end.getDate() + numDays + 2);

  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString('en-GB', options)} - ${end.toLocaleDateString('en-GB', options)}`;
}

/**
 * Format Tanzanian phone numbers nicely (e.g. +255 754 123 456)
 */
export function formatTanzanianPhone(phone?: string | null): string {
  if (!phone) return '+255 700 000 000';
  const cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.startsWith('255') && cleaned.length === 12) {
    return `+255 ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return `+255 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return String(phone);
}

/**
 * Generate a realistic unique Order Number using Web Crypto API
 */
export function generateOrderNumber(): string {
  const prefix = 'LUM';
  let random = 0;
  if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.getRandomValues) {
    const array = new Uint32Array(1);
    globalThis.crypto.getRandomValues(array);
    random = 100000 + (array[0] % 900000);
  } else {
    random = 100000 + Math.floor(Math.random() * 900000); // Fallback for very old environments
  }
  const regionCode = 'TZ';
  return `${prefix}-${regionCode}-${random}`;
}

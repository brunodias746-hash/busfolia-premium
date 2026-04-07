/**
 * Meta Pixel Event Tracking
 * Pixel ID: 338256852603241
 */

declare global {
  interface Window {
    fbq: (action: string, event: string, data?: Record<string, any>) => void;
  }
}

/**
 * Track PageView event (called on every page load)
 */
export function trackPageView() {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView');
  }
}

/**
 * Track InitiateCheckout event (called when user enters checkout)
 */
export function trackInitiateCheckout(data?: {
  value?: number;
  currency?: string;
  content_name?: string;
  content_type?: string;
}) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', data || {});
  }
}

/**
 * Track Purchase event (called after successful payment)
 * @param value - Total amount in cents (e.g., 6610 for R$ 66,10)
 * @param currency - Currency code (e.g., 'BRL')
 */
export function trackPurchase(value: number, currency: string = 'BRL') {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Purchase', {
      value: (value / 100).toFixed(2), // Convert cents to decimal
      currency: currency,
    });
  }
}

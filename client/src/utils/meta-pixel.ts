/**
 * Meta Pixel (Facebook Pixel) Tracking Utilities
 * Pixel ID: 338256852603241
 */

declare global {
  interface Window {
    fbq: (action: string, eventName: string, data?: any) => void;
  }
}

/**
 * Track PageView event
 * Called on every page load/route change
 */
export function trackPageView() {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView');
    console.log('[Meta Pixel] PageView tracked');
  }
}

/**
 * Track InitiateCheckout event
 * Called when user enters the checkout page (/comprar)
 */
export function trackInitiateCheckout(data?: any) {
  if (typeof window !== 'undefined' && window.fbq) {
    const eventData = {
      content_name: 'Checkout Iniciado',
      content_type: 'product',
      ...data,
    };
    window.fbq('track', 'InitiateCheckout', eventData);
    console.log('[Meta Pixel] InitiateCheckout tracked', eventData);
  }
}

/**
 * Track Purchase event
 * Called on success page after payment confirmation
 * @param value - Order total in BRL (decimal format, e.g., 150.00)
 * @param currency - Currency code (default: "BRL")
 * @param transaction_id - Optional transaction/order ID
 */
export function trackPurchase(value: number, currency: string = 'BRL', transaction_id?: string) {
  if (typeof window !== 'undefined' && window.fbq) {
    const eventData = {
      content_name: 'Compra Concluída',
      content_type: 'product',
      value: value,
      currency: currency,
      ...(transaction_id && { transaction_id }),
    };
    window.fbq('track', 'Purchase', eventData);
    console.log('[Meta Pixel] Purchase tracked', eventData);
  }
}

/**
 * Initialize Meta Pixel (called on app startup)
 * Note: The base pixel code is already in index.html
 */
export function initMetaPixel() {
  if (typeof window !== 'undefined' && typeof window.fbq !== 'undefined') {
    console.log('[Meta Pixel] Initialized with Pixel ID: 338256852603241');
  }
}

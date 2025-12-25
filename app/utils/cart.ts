import type { CartItem } from '../store/cartStore';

/**
 * Calculate the total amount of all items in the cart
 * @param items - Array of cart items
 * @returns Total amount in cents
 */
export function calculateTotalAmount(items: CartItem[]): number {
  return items.reduce(
    (acc, item) => acc + (typeof item.price === 'number' ? item.price * item.quantity : 0),
    0
  );
}

/**
 * Calculate the total quantity of all items in the cart
 * @param items - Array of cart items
 * @returns Total quantity
 */
export function calculateTotalQuantity(items: CartItem[]): number {
  return items.reduce((acc, item) => acc + item.quantity, 0);
}

/**
 * Format a price in cents to a dollar string
 * @param priceInCents - Price in cents
 * @returns Formatted price string (e.g., "$25.99")
 */
export function formatPrice(priceInCents: number): string {
  return `$${(priceInCents / 100).toFixed(2)}`;
}


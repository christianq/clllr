import { create } from 'zustand';
import type { Product, CartItem as ImportedCartItem } from '../../types/product';

export type CartItem = ImportedCartItem;

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  // Add other potential actions like updateQuantity
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addItem: (product) =>
    set((state) => {
      const existingItem = state.items.find((item) => item.id === product.id);
      if (existingItem) {
        // Increase quantity if item already exists
        return {
          items: state.items.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      } else {
        // Add new item with quantity 1
        return { items: [...state.items, { ...product, quantity: 1 }] };
      }
    }),
  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== productId),
      // Optionally, implement logic to decrease quantity first
    })),
  clearCart: () => set({ items: [] }),
}));
'use client';

import { useCartStore } from "../store/cartStore";
import { useRouter } from 'next/navigation';
import type { Product as StoreProduct } from "../store/cartStore";
import type { Product as GridProduct } from "./ProductGrid";
import { Trash } from "@phosphor-icons/react";
import CartList from "./CartList";
import CartSummary from "./CartSummary";
import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["200"] });

export default function Cart({ hideTitle = false }: { hideTitle?: boolean }) {
  const { items, addItem, removeItem, clearCart } = useCartStore();
  const router = useRouter();

  const totalAmount = items.reduce(
    (acc, item) => acc + (typeof item.price === 'number' ? item.price * item.quantity : 0),
    0
  );
  const totalQty = items.reduce((acc, item) => acc + item.quantity, 0);

  // Decrease quantity, but only remove if user clicks the remove (x) button
  const decreaseQuantity = (item: GridProduct & { quantity: number }) => {
    if (item.quantity > 1) {
      // Remove one unit by adding a new removeItem that decreases quantity
      // We'll need to update the store logic, but for now, call addItem with negative quantity
      // Instead, let's call addItem with a negative quantity if store supports it, otherwise, implement here
      // For now, we can call removeItem and re-add with quantity-1
      useCartStore.setState((state) => ({
        items: state.items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i
        ),
      }));
    }
  };

  // Helper to safely add item with price: number
  const handleAddItem = (item: GridProduct) => {
    if (typeof item.price === 'number') {
      addItem(item as StoreProduct);
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) return;
    router.push('/checkout');
  };

  return (
    <div id="cart-container" className="p-4">
      {!hideTitle && (
        <h2 id="cart-title" className={`text-2xl font-semibold mb-4 ${dmSans.className}`}>
          Shopping Cart{totalQty > 0 && <span id="cart-item-count" className="text-base font-normal ml-2">({totalQty} item{totalQty !== 1 ? 's' : ''})</span>}
        </h2>
      )}
      <CartList
        items={items}
        addItem={handleAddItem}
        removeItem={removeItem}
        decreaseQuantity={decreaseQuantity}
      />
      {items.length > 0 && (
        <CartSummary
          totalAmount={totalAmount}
          itemCount={items.length}
          handleCheckout={handleCheckout}
          clearCart={clearCart}
        />
      )}
    </div>
  );
}
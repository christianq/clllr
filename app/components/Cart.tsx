'use client';

import { useCartStore } from "../store/cartStore";
import { useRouter } from 'next/navigation';
import type { Product } from "../../types/product";
import { Trash } from "@phosphor-icons/react";
import CartList from "./CartList";
import CartFooter from "./CartFooter";
import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["200"] });

export default function Cart({ hideTitle = false, header }: { hideTitle?: boolean; header?: React.ReactNode }) {
  const { items, addItem, removeItem, clearCart } = useCartStore();
  const router = useRouter();

  const totalAmount = items.reduce(
    (acc, item) => acc + (typeof item.price === 'number' ? item.price * item.quantity : 0),
    0
  );
  const totalQty = items.reduce((acc, item) => acc + item.quantity, 0);

  // Decrease quantity, but only remove if user clicks the remove (x) button
  const decreaseQuantity = (item: Product & { quantity: number }) => {
    if (item.quantity > 1) {
      useCartStore.setState((state) => ({
        items: state.items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i
        ),
      }));
    }
  };

  // Helper to safely add item with price: number
  const handleAddItem = (item: Product) => {
    if (typeof item.price === 'number') {
      addItem(item);
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) return;
    router.push('/checkout');
  };

  return (
    <div
      id="cart-container"
      className="p-4"
      role="complementary"
      aria-labelledby="cart-title"
    >
      {header}
      <div id="cart-content">
        <CartList
          items={items}
          addItem={handleAddItem}
          removeItem={removeItem}
          decreaseQuantity={decreaseQuantity}
        />
        {items.length > 0 && (
          <CartFooter
            totalAmount={totalAmount / 100}
            itemCount={items.length}
            handleCheckout={handleCheckout}
            clearCart={clearCart}
          />
        )}
      </div>
    </div>
  );
}
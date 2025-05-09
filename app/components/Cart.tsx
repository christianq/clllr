'use client';

import { useCartStore } from '@/app/store/cartStore';
import { useRouter } from 'next/navigation';
import type { Product } from "./ProductGrid";
import { Trash } from "@phosphor-icons/react";

export default function Cart() {
  const { items, addItem, removeItem, clearCart } = useCartStore();
  const router = useRouter();

  const totalAmount = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const totalQty = items.reduce((acc, item) => acc + item.quantity, 0);

  // Decrease quantity, but only remove if user clicks the remove (x) button
  const decreaseQuantity = (item: Product & { quantity: number }) => {
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

  const handleCheckout = () => {
    if (items.length === 0) return;
    router.push('/checkout');
  };

  return (
    <div id="cart-container" className="border p-4 shadow">
      <h2 id="cart-title" className="text-2xl font-semibold mb-4">
        Shopping Cart{totalQty > 0 && <span id="cart-item-count" className="text-base font-normal ml-2">({totalQty} item{totalQty !== 1 ? 's' : ''})</span>}
      </h2>
      {items.length === 0 ? (
        <p id="cart-empty-message" className="text-gray-500">Your cart is empty.</p>
      ) : (
        <>
          <ul id="cart-item-list" className="space-y-2 mb-4">
            {items.map((item) => (
              <li
                key={item.id}
                id={`cart-item-${item.id}`}
                className="cart-item flex flex-col border-b py-2"
              >
                <span id={`cart-item-name-${item.id}`} className="cart-item-name font-medium flex-grow mr-4 mb-2">{item.name}</span>
                <div className="flex items-center gap-4 justify-between">
                  <div className="cart-item-quantity-controls flex items-center gap-2">
                    <button
                      id={`decrease-qty-${item.id}`}
                      onClick={() => decreaseQuantity(item)}
                      className="decrease-qty-button px-2 py-0.5 bg-gray-200 hover:bg-gray-300 text-lg font-bold"
                      title="Decrease quantity"
                      disabled={item.quantity === 1}
                    >
                      -
                    </button>
                    <span id={`cart-item-qty-${item.id}`} className="cart-item-quantity font-mono text-lg w-6 text-center">{item.quantity}</span>
                    <button
                      id={`increase-qty-${item.id}`}
                      onClick={() => addItem(item)}
                      className="increase-qty-button px-2 py-0.5 bg-gray-200 hover:bg-gray-300 text-lg font-bold"
                      title="Increase quantity"
                    >
                      +
                    </button>
                </div>
                  <div className="cart-item-actions flex items-center gap-2">
                    <span id={`cart-item-subtotal-${item.id}`} className="cart-item-subtotal min-w-[60px] text-right">${((item.price * item.quantity) / 100).toFixed(2)}</span>
                  <button
                      id={`remove-item-${item.id}`}
                    onClick={() => removeItem(item.id)}
                      className="remove-item-button w-[35px] h-[35px] flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-100"
                    title="Remove item"
                  >
                      <Trash size={18} />
                  </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div id="cart-total" className="font-semibold text-lg mb-4 text-right">
            Total: ${(totalAmount / 100).toFixed(2)}
          </div>
          <button
            id="checkout-button"
            onClick={handleCheckout}
            disabled={items.length === 0}
            className={`w-full py-2 px-4 text-white ${
              items.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600'
            } transition-colors`}
          >
            Proceed to Checkout
          </button>
          <button
            id="clear-cart-button"
            onClick={clearCart}
            className="w-full mt-2 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700"
          >
            Clear Cart
          </button>
        </>
      )}
    </div>
  );
}
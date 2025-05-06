'use client';

import { useState } from 'react';
import { useCartStore } from '@/app/store/cartStore';
import { useRouter } from 'next/navigation';

export default function Cart() {
  const { items, addItem, removeItem, clearCart } = useCartStore();
  const router = useRouter();

  const totalAmount = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const totalQty = items.reduce((acc, item) => acc + item.quantity, 0);

  // Decrease quantity, but only remove if user clicks the remove (x) button
  const decreaseQuantity = (item) => {
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
    <div className="border rounded-lg p-4 shadow">
      <h2 className="text-2xl font-semibold mb-4">
        Shopping Cart{totalQty > 0 && <span className="text-base font-normal ml-2">({totalQty} item{totalQty !== 1 ? 's' : ''})</span>}
      </h2>
      {items.length === 0 ? (
        <p className="text-gray-500">Your cart is empty.</p>
      ) : (
        <>
          <ul className="space-y-2 mb-4">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center border-b pb-2"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{item.name}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => decreaseQuantity(item)}
                      className="px-2 py-0.5 rounded bg-gray-200 hover:bg-gray-300 text-lg font-bold"
                      title="Decrease quantity"
                      disabled={item.quantity === 1}
                    >
                      -
                    </button>
                    <span className="font-mono text-lg w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => addItem(item)}
                      className="px-2 py-0.5 rounded bg-gray-200 hover:bg-gray-300 text-lg font-bold"
                      title="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span>${((item.price * item.quantity) / 100).toFixed(2)}</span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                    title="Remove item"
                  >
                    &times;
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="font-semibold text-lg mb-4 text-right">
            Total: ${(totalAmount / 100).toFixed(2)}
          </div>
          <button
            onClick={handleCheckout}
            disabled={items.length === 0}
            className={`w-full py-2 px-4 rounded text-white ${
              items.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600'
            } transition-colors`}
          >
            Proceed to Checkout
          </button>
          <button
            onClick={clearCart}
            className="w-full mt-2 py-2 px-4 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
          >
            Clear Cart
          </button>
        </>
      )}
    </div>
  );
}
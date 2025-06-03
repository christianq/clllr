import React from 'react';

interface CartFooterProps {
  totalAmount: number;
  itemCount: number;
  handleCheckout: () => void;
  clearCart: () => void;
}

export default function CartFooter({ totalAmount, itemCount, handleCheckout, clearCart }: CartFooterProps) {
  return (
    <div
      className="cart-footer flex flex-col items-center border-t pt-4 mt-4"
      role="region"
      aria-label="Cart summary and actions"
    >
      <div className="text-lg font-semibold mb-2" aria-live="polite">
        Total: ${totalAmount.toFixed(2)}
      </div>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded mb-2 disabled:opacity-50"
        onClick={handleCheckout}
        disabled={itemCount === 0}
        aria-label="Proceed to checkout"
      >
        Proceed to Checkout
      </button>
      <button
        className="bg-gray-200 text-gray-700 px-4 py-2 rounded"
        onClick={clearCart}
        disabled={itemCount === 0}
        aria-label="Clear cart"
      >
        Clear Cart
      </button>
    </div>
  );
}
interface CartSummaryProps {
  totalAmount: number;
  itemCount: number;
  handleCheckout: () => void;
  clearCart: () => void;
}

export default function CartSummary({ totalAmount, itemCount, handleCheckout, clearCart }: CartSummaryProps) {
  return (
    <>
      <div id="cart-total" className="font-semibold text-lg mb-4 text-right">
        Total: ${(totalAmount / 100).toFixed(2)}
      </div>
      <button
        id="checkout-button"
        onClick={handleCheckout}
        disabled={itemCount === 0}
        className={`w-full py-2 px-4 text-white ${
          itemCount === 0
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
  );
}
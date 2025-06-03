import { Trash } from "@phosphor-icons/react";
import type { Product } from "../../types/product";

interface CartItemProps {
  item: Product & { quantity: number };
  addItem: (item: Product) => void;
  removeItem: (id: string) => void;
  decreaseQuantity: (item: Product & { quantity: number }) => void;
}

export default function CartItem({ item, addItem, removeItem, decreaseQuantity }: CartItemProps) {
  return (
    <li
      key={item.id}
      id={`cart-item-${item.id}`}
      className="cart-item flex flex-col border-b py-2"
      role="listitem"
      aria-label={`Cart item: ${item.name}`}
    >
      <span id={`cart-item-name-${item.id}`} className="cart-item-name font-medium flex-grow mr-4 mb-2">{item.name}</span>
      <div className="flex items-center gap-4 justify-between">
        <div className="cart-item-quantity-controls flex items-center gap-2">
          <button
            id={`decrease-qty-${item.id}`}
            onClick={() => decreaseQuantity(item)}
            className="decrease-qty-button px-2 py-0.5 bg-gray-200 hover:bg-gray-300 text-lg font-bold"
            title="Decrease quantity"
            aria-label={`Decrease quantity of ${item.name}`}
            disabled={item.quantity === 1}
          >
            -
          </button>
          <span id={`cart-item-qty-${item.id}`} className="cart-item-quantity font-mono text-lg w-6 text-center" aria-label={`Quantity: ${item.quantity}`}>{item.quantity}</span>
          <button
            id={`increase-qty-${item.id}`}
            onClick={() => addItem(item)}
            className="increase-qty-button px-2 py-0.5 bg-gray-200 hover:bg-gray-300 text-lg font-bold"
            title="Increase quantity"
            aria-label={`Increase quantity of ${item.name}`}
          >
            +
          </button>
        </div>
        <div className="cart-item-actions flex items-center gap-2">
          <span id={`cart-item-subtotal-${item.id}`} className="cart-item-subtotal min-w-[60px] text-right" aria-live="polite">
            {item.dealPrice && item.originalPrice && item.dealPrice < item.originalPrice ? (
              <span>
                <span className="text-red-600 font-bold">${((item.dealPrice * item.quantity) / 100).toFixed(2)}</span>
                <span className="line-through text-gray-500 ml-2">${((item.originalPrice * item.quantity) / 100).toFixed(2)}</span>
                <span className="text-green-600 text-xs ml-2">{Math.round(100 - (item.dealPrice / item.originalPrice) * 100)}% off</span>
              </span>
            ) : typeof item.price === 'number' ? (
              `$${((item.price * item.quantity) / 100).toFixed(2)}`
            ) : (
              <span className="text-gray-400">No price</span>
            )}
          </span>
          <button
            id={`remove-item-${item.id}`}
            onClick={() => removeItem(item.id)}
            className="remove-item-button w-[35px] h-[35px] flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-100"
            title="Remove item"
            aria-label={`Remove ${item.name} from cart`}
          >
            <Trash size={18} />
          </button>
        </div>
      </div>
    </li>
  );
}
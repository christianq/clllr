import CartItem from "./CartItem";
import type { Product } from "./ProductGrid";

interface CartListProps {
  items: Array<Product & { quantity: number }>;
  addItem: (item: Product) => void;
  removeItem: (id: string) => void;
  decreaseQuantity: (item: Product & { quantity: number }) => void;
}

export default function CartList({ items, addItem, removeItem, decreaseQuantity }: CartListProps) {
  if (items.length === 0) {
    return <p id="cart-empty-message" className="text-gray-500">Your cart is empty.</p>;
  }
  return (
    <ul id="cart-item-list" className="space-y-2 mb-4">
      {items.map((item) => (
        <CartItem
          key={item.id}
          item={item}
          addItem={addItem}
          removeItem={removeItem}
          decreaseQuantity={decreaseQuantity}
        />
      ))}
    </ul>
  );
}
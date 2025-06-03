import CartItem from "./CartItem";
import CartEmpty from "./CartEmpty";
import type { Product } from "../../types/product";

interface CartListProps {
  items: Array<Product & { quantity: number }>;
  addItem: (item: Product) => void;
  removeItem: (id: string) => void;
  decreaseQuantity: (item: Product & { quantity: number }) => void;
}

export default function CartList({ items, addItem, removeItem, decreaseQuantity }: CartListProps) {
  if (items.length === 0) {
    return <CartEmpty />;
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
"use client";

import { useState } from "react";
import { useCartStore } from "@/app/store/cartStore";

export default function AddToCartButton({ product }: { product: any }) {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      // Add image if needed: image: product.images?.[0]
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <button
      onClick={handleAdd}
      disabled={!product.price || added}
      className={`w-full py-2 px-4 rounded text-white font-semibold transition-colors
        ${!product.price ? 'bg-gray-400 cursor-not-allowed' : added ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-700'}`}
    >
      {added ? 'Added!' : 'Add to Cart'}
    </button>
  );
}
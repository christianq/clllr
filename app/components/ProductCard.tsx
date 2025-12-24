import type { Product } from '../../types/product';
import ProductImage from './ProductImage';
import React from 'react';

const FALLBACK_IMAGE = "/tote-product.png";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div
      className="product-card flex flex-col items-center dark:bg-gray-900 w-full mx-auto"
      role="region"
      aria-label={`Product: ${product.name}`}
    >
      {product.images && product.images[0] ? (
        <ProductImage src={product.images[0]} alt={product.name} className="w-full" />
      ) : (
        <img src={FALLBACK_IMAGE} alt={product.name} width={0} height={240} className="object-contain mb-4 w-full" />
      )}
      <h3 className="text-sm mt-4 text-center" tabIndex={0}>{product.name}</h3>
      <div className="text-2xl mt-2 font-vt323" aria-label={typeof product.price === 'number' ? `Price: $${(product.price / 100).toFixed(2)}` : 'No price'}>
        {typeof product.price === 'number'
          ? (() => {
              const price = product.price / 100;
              const isWhole = Number.isInteger(price);
              return `$${isWhole ? price : price.toFixed(2)}`;
            })()
          : <span className="text-gray-400">No price</span>}
      </div>
    </div>
  );
}
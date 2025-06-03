import type { Product } from '../../types/product';
import ProductImage from './ProductImage';
import React, { useState, Suspense } from 'react';
import AddToCartButton from './AddToCartButton';

const FALLBACK_IMAGE = "/tote-product.png";

export default function ProductVariantCard({ variantProducts }: { variantProducts: Product[] }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selected = variantProducts[selectedIdx];

  return (
    <div
      className="product-card border p-4 flex flex-col items-center shadow bg-white dark:bg-gray-900 max-w-[500px] w-full mx-auto"
      role="region"
      aria-label={`Product variant: ${selected.name}`}
    >
      {/* Main product image container */}
      {selected.images && selected.images[0] ? (
        <ProductImage src={selected.images[0]} alt={selected.name} className="w-full" />
      ) : (
        <img src={FALLBACK_IMAGE} alt={selected.name} width={0} height={240} className="object-contain mb-4 w-full" />
      )}

      {/* Swatch gallery */}
      {variantProducts.length > 1 && (
        <div className="w-full mb-4">
          <div className="font-semibold mb-2 mt-8 text-sm text-left">Variants</div>
          <div className="grid grid-cols-4 gap-2">
            {variantProducts.map((p, idx) => (
              <div key={p.id} className="product-gallery-card flex flex-col items-center w-full">
                <button
                  onClick={() => setSelectedIdx(idx)}
                  className={`w-16 aspect-square border-2 flex items-center justify-center transition-all bg-white ${selectedIdx === idx ? 'border-blue-600 scale-105' : 'border-gray-300'} w-full`}
                  title={p.metadata?.color || p.name}
                  aria-label={`Select variant ${p.metadata?.color || p.name}`}
                  aria-pressed={selectedIdx === idx}
                  style={{}}
                >
                  <img
                    src={p.images && p.images[0] ? p.images[0] : FALLBACK_IMAGE}
                    alt={p.metadata?.color || p.name}
                    className="w-full aspect-square object-cover"
                    style={{}}
                  />
                </button>
                <div className="text-xs mt-1 text-center truncate w-16" title={p.metadata?.color || p.name}>
                  {p.metadata?.color ? p.metadata.color.charAt(0).toUpperCase() + p.metadata.color.slice(1) : p.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <h3 className={`text-xl font-semibold mb-2 text-center`} tabIndex={0}>{selected.name}</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-2 text-center">{selected.description}</p>
      {selected.dealPrice && selected.originalPrice && selected.dealPrice < selected.originalPrice ? (
        <div className="text-4xl font-bold mb-4 flex flex-col items-center">
          <span className="text-red-600">{(() => { const price = selected.dealPrice / 100; return price % 1 === 0 ? `$${price}` : `$${price.toFixed(2)}`; })()}</span>
          <span className="line-through text-gray-500 text-base">{(() => { const price = selected.originalPrice / 100; return price % 1 === 0 ? `$${price}` : `$${price.toFixed(2)} ${selected.currency?.toUpperCase()}`; })()}</span>
          <span className="text-green-600 text-sm font-semibold">{Math.round(100 - (selected.dealPrice / selected.originalPrice) * 100)}% off</span>
        </div>
      ) : selected.price ? (
        <div className="text-4xl mb-4 font-vt323" aria-label={`Price: $${(selected.price / 100).toFixed(2)}`}>{(() => { const price = selected.price / 100; return price % 1 === 0 ? `$${price}` : `$${price.toFixed(2)}`; })()}</div>
      ) : (
        <div className="text-lg font-bold mb-4 text-gray-400">No price</div>
      )}
      <Suspense fallback={<span>Loading...</span>}>
        <AddToCartButton product={selected} />
      </Suspense>
    </div>
  );
}
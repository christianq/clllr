"use client";
import Image from "next/image";
import { Suspense, useState } from "react";
import AddToCartButton from "./AddToCartButton";
import ProductImage from "./ProductImage";

const FALLBACK_IMAGE = "/tote-product.png";

function groupByVariant(products: any[]) {
  const map: Record<string, any[]> = {};
  for (const product of products) {
    const variant = product.metadata?.variant_name || product.id;
    if (!map[variant]) map[variant] = [];
    map[variant].push(product);
  }
  return map;
}

function getColorHex(color: string) {
  // Simple mapping for demo; expand as needed
  const colors: Record<string, string> = {
    red: "#ef4444",
    green: "#22c55e",
    black: "#222",
    blue: "#3b82f6",
    yellow: "#eab308",
    white: "#fff",
  };
  return colors[color?.toLowerCase()] || "#ccc";
}

export default function ProductGrid({ products }: { products: any[] }) {
  const variants = groupByVariant(products);
  return (
    <div className="grid grid-cols-1 gap-8">
      {Object.entries(variants).map(([variantName, variantProducts]) => {
        const [selectedIdx, setSelectedIdx] = useState(0);
        const selected = variantProducts[selectedIdx];
        return (
          <div key={variantName} className="border rounded-lg p-4 flex flex-col items-center shadow bg-white dark:bg-gray-900 max-w-[500px] w-full mx-auto">
            {/* Main product image */}
            {selected.images && selected.images[0] ? (
              <ProductImage src={selected.images[0]} alt={selected.name} />
            ) : (
              <Image src={FALLBACK_IMAGE} alt={selected.name} width={240} height={240} className="object-contain mb-4 rounded" />
            )}
            {/* Swatch gallery */}
            {variantProducts.length > 1 && (
              <div className="w-full mb-4">
                <div className="font-semibold mb-2 text-sm text-left">Variants</div>
                <div className="grid grid-cols-4 gap-2">
                  {variantProducts.map((p, idx) => (
                    <div key={p.id} className="flex flex-col items-center">
                      <button
                        onClick={() => setSelectedIdx(idx)}
                        className={`w-16 h-16 border-2 flex items-center justify-center transition-all bg-white ${selectedIdx === idx ? 'border-blue-600 scale-105' : 'border-gray-300'}`}
                        title={p.metadata?.color || p.name}
                        style={{ borderRadius: 8 }}
                      >
                        <img
                          src={p.images && p.images[0] ? p.images[0] : FALLBACK_IMAGE}
                          alt={p.metadata?.color || p.name}
                          className="w-14 h-14 object-cover"
                          style={{ borderRadius: 6 }}
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
            <h2 className="text-xl font-semibold mb-2 text-center">{selected.name}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-2 text-center">{selected.description}</p>
            {selected.price ? (
              <div className="text-lg font-bold mb-4">${(selected.price / 100).toFixed(2)} {selected.currency?.toUpperCase()}</div>
            ) : (
              <div className="text-lg font-bold mb-4 text-gray-400">No price</div>
            )}
            <Suspense fallback={<span>Loading...</span>}>
              <AddToCartButton product={selected} />
            </Suspense>
          </div>
        );
      })}
    </div>
  );
}
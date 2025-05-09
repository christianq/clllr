"use client";
import Image from "next/image";
import React, { Suspense, useState, useMemo } from "react";
import AddToCartButton from "./AddToCartButton";
import ProductImage from "./ProductImage";
import type { Id } from "../../convex/_generated/dataModel";

const FALLBACK_IMAGE = "/tote-product.png";

export interface Product {
  id: string;
  name: string;
  price: number | null;
  currency?: string | null;
  images?: string[];
  description?: string;
  metadata?: {
    color?: string;
    size?: string;
    category?: string;
    variant_name?: string;
  };
}

interface Filters {
  searchTerm?: string;
  priceRange?: [number, number];
  colors?: string[];
  sizes?: string[];
  categories?: string[];
}

function groupByVariant(products: Product[]) {
  const map: Record<string, Product[]> = {};
  for (const product of products) {
    const variant = product.metadata?.variant_name || product.id;
    if (!map[variant]) map[variant] = [];
    map[variant].push(product);
  }
  return map;
}

function ProductVariantCard({ variantProducts }: { variantProducts: Product[] }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selected = variantProducts[selectedIdx];

  return (
    <div className="border p-4 flex flex-col items-center shadow bg-white dark:bg-gray-900 max-w-[500px] w-full mx-auto">
      {/* Main product image container */}
      {selected.images && selected.images[0] ? (
        <ProductImage src={selected.images[0]} alt={selected.name} />
      ) : (
        <Image src={FALLBACK_IMAGE} alt={selected.name} width={240} height={240} className="object-contain mb-4" />
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
                  style={{}}
                >
                  <img
                    src={p.images && p.images[0] ? p.images[0] : FALLBACK_IMAGE}
                    alt={p.metadata?.color || p.name}
                    className="w-14 h-14 object-cover"
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
}

export default function ProductGrid({ products, filters }: { products: Product[], filters?: Filters }) {
  const filteredProducts = useMemo(() => {
    if (!filters || Object.keys(filters).length === 0) {
      return products;
    }
    return products.filter((product) => {
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        const nameMatch = product.name.toLowerCase().includes(term);
        const descMatch = product.description?.toLowerCase().includes(term);
        if (!nameMatch && !descMatch) return false;
      }
      if (filters.priceRange && product.price !== null) {
          const price = product.price / 100;
        if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
          return false;
        }
      }
      if (filters.colors && filters.colors.length > 0) {
        const productColor = product.metadata?.color?.toLowerCase();
        if (!productColor || !filters.colors.some(c => c.toLowerCase() === productColor)) {
          return false;
        }
      }
      if (filters.sizes && filters.sizes.length > 0) {
        const productSize = product.metadata?.size?.toUpperCase();
         if (!productSize || !filters.sizes.some(s => s.toUpperCase() === productSize)) {
          return false;
        }
      }
      if (filters.categories && filters.categories.length > 0) {
         const productCategory = product.metadata?.category;
         if (!productCategory || !filters.categories.includes(productCategory)) {
          return false;
        }
      }
      return true;
    });
  }, [products, filters]);

  const variants = groupByVariant(filteredProducts);

  return (
    <div className="grid grid-cols-1 gap-8">
      {Object.entries(variants).map(([variantName, variantProducts]) => (
        <ProductVariantCard key={variantName} variantProducts={variantProducts} />
      ))}
      {filteredProducts.length === 0 && (
        <p className="text-gray-500 text-center col-span-full">No products match your filters.</p>
      )}
    </div>
  );
}
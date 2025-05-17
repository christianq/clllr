"use client";
import Image from "next/image";
import React, { Suspense, useState, useMemo } from "react";
import AddToCartButton from "./AddToCartButton";
import ProductImage from "./ProductImage";
import type { Id } from "../../convex/_generated/dataModel";
import { DM_Sans } from "next/font/google";

const FALLBACK_IMAGE = "/tote-product.png";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["200"] });

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
  originalPrice?: number | null;
  dealPrice?: number | null;
  dealExpiresAt?: number | null;
}

interface Filters {
  searchTerm?: string;
  priceRange?: [number, number];
  colors?: string[];
  sizes?: string[];
  categories?: string[];
  sortBy?: string;
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
    <div className="product-card border p-4 flex flex-col items-center shadow bg-white dark:bg-gray-900 max-w-[500px] w-full mx-auto">
      {/* Main product image container */}
      {selected.images && selected.images[0] ? (
        <ProductImage src={selected.images[0]} alt={selected.name} className="w-full" />
      ) : (
        <Image src={FALLBACK_IMAGE} alt={selected.name} width={0} height={240} className="object-contain mb-4 w-full" />
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
      <h2 className={`text-xl font-semibold mb-2 text-center ${dmSans.className}`}>{selected.name}</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-2 text-center">{selected.description}</p>
      {selected.dealPrice && selected.originalPrice && selected.dealPrice < selected.originalPrice ? (
        <div className="text-4xl font-bold mb-4 flex flex-col items-center">
          <span className="text-red-600">{(() => { const price = selected.dealPrice / 100; return price % 1 === 0 ? `$${price}` : `$${price.toFixed(2)}`; })()}</span>
          <span className="line-through text-gray-500 text-base">{(() => { const price = selected.originalPrice / 100; return price % 1 === 0 ? `$${price}` : `$${price.toFixed(2)} ${selected.currency?.toUpperCase()}`; })()}</span>
          <span className="text-green-600 text-sm font-semibold">{Math.round(100 - (selected.dealPrice / selected.originalPrice) * 100)}% off</span>
        </div>
      ) : selected.price ? (
        <div className="text-4xl mb-4 font-vt323">{(() => { const price = selected.price / 100; return price % 1 === 0 ? `$${price}` : `$${price.toFixed(2)}`; })()}</div>
      ) : (
        <div className="text-lg font-bold mb-4 text-gray-400">No price</div>
      )}
      <Suspense fallback={<span>Loading...</span>}>
        <AddToCartButton product={selected} />
      </Suspense>
    </div>
  );
}

export default function ProductGrid({ products, filters, gridView = false }: { products: Product[], filters?: Filters, gridView?: boolean }) {
  let filteredProducts = useMemo(() => {
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

  // Sort logic
  if (filters && filters.sortBy) {
    if (filters.sortBy === "priceLowHigh") {
      filteredProducts = [...filteredProducts].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    } else if (filters.sortBy === "priceHighLow") {
      filteredProducts = [...filteredProducts].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    } else if (filters.sortBy === "newest") {
      filteredProducts = [...filteredProducts].sort((a, b) => (b.dealExpiresAt ?? 0) - (a.dealExpiresAt ?? 0));
    } else if (filters.sortBy === "oldest") {
      filteredProducts = [...filteredProducts].sort((a, b) => (a.dealExpiresAt ?? 0) - (b.dealExpiresAt ?? 0));
    }
    // 'relevance' is default, no sort
  }

  if (gridView) {
    // In grid mode, show each variant as a separate product (no grouping)
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map((product) => (
          <div key={product.id} className="product-card flex flex-col items-center dark:bg-gray-900 max-w-[500px] w-full mx-auto">
            {product.images && product.images[0] ? (
              <ProductImage src={product.images[0]} alt={product.name} className="w-full" />
            ) : (
              <Image src={FALLBACK_IMAGE} alt={product.name} width={0} height={240} className="object-contain mb-4 w-full" />
            )}
            <div className="text-sm mt-4 text-center">{product.name}</div>
            <div className="text-2xl mt-2 font-vt323">
              {typeof product.price === 'number'
                ? (() => {
                    const price = product.price / 100;
                    const isWhole = Number.isInteger(price);
                    return `$${isWhole ? price : price.toFixed(2)}`;
                  })()
                : <span className="text-gray-400">No price</span>}
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <p className="text-gray-500 text-center col-span-full">No products match your filters.</p>
        )}
      </div>
    );
  }

  // List mode: group by variant and show full details
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
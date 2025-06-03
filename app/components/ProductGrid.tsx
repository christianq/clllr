"use client";
import Image from "next/image";
import React, { Suspense, useState, useMemo } from "react";
import AddToCartButton from "./AddToCartButton";
import ProductImage from "./ProductImage";
import type { Product, Filters } from '../../types/product';
import { DM_Sans } from "next/font/google";
import ProductCard from './ProductCard';
import ProductVariantCard from './ProductVariantCard';

const FALLBACK_IMAGE = "/tote-product.png";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["200"] });

function groupByVariant(products: Product[]) {
  const map: Record<string, Product[]> = {};
  for (const product of products) {
    const variant = product.metadata?.variant_name || product.id;
    if (!map[variant]) map[variant] = [];
    map[variant].push(product);
  }
  return map;
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
          <ProductCard key={product.id} product={product} />
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
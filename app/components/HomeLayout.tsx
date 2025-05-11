"use client";
import React, { useState, useEffect } from "react";
import { ArrowLineLeft, ArrowLineRight, ShoppingCart } from "@phosphor-icons/react";
import { useCartStore } from "../store/cartStore";
import ProductGrid from "./ProductGrid";
import Cart from "./Cart";
import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["200"] });

export default function HomeLayout({ products }: { products: any[] }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const { items } = useCartStore();
  const totalQty = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const storedState = localStorage.getItem("cartCollapsed");
    if (storedState !== null) {
      setCollapsed(JSON.parse(storedState));
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("cartCollapsed", JSON.stringify(collapsed));
    }
  }, [collapsed, isHydrated]);

  const columnTransitionClass = isHydrated ? "transition-all duration-300 ease-in-out" : "";
  const collapsedIconTransitionClass = isHydrated ? "transition-opacity duration-150 ease-in-out" : "";
  const contentTransitionClass = isHydrated ? "transition-opacity duration-200 ease-in-out" : "";
  const contentTransitionDelay = isHydrated && !collapsed ? '150ms' : '0ms';

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start relative">
      {/* Left column: heading only */}
      <div
        id="products-heading-col"
        className="md:col-span-1 flex flex-col items-start justify-start sticky top-8 overflow-y-auto"
      >
        <h1 className={`text-3xl font-bold mb-8 text-left ${dmSans.className}`}>Our Products</h1>
      </div>
      {/* Middle column: product grid only */}
      <div
        id="product-grid-wrapper"
        className="w-full flex-1"
      >
        <div className="bg-gray-50 p-6">
          <ProductGrid products={products} />
        </div>
      </div>
      {/* Cart column */}
      <div
        id="cart-column"
        className={`sticky top-8 flex flex-col items-center lg:items-end ${columnTransitionClass} ${collapsed ? "max-w-[50px] w-[50px]" : "max-w-xs w-full lg:max-w-[25%] lg:w-[25%]"}`}
      >
        <div className={`flex items-center w-full mb-4 ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && (
            <h2 id="cart-title" className={`text-2xl font-semibold ${dmSans.className} ml-2`}>Shopping Cart{totalQty > 0 && <span id="cart-item-count" className="text-base font-normal ml-2">({totalQty} item{totalQty !== 1 ? 's' : ''})</span>}</h2>
          )}
          <button
            className="w-[50px] h-[50px] flex-shrink-0 flex items-center justify-center text-gray-700 hover:text-gray-900"
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? "Show Cart" : "Collapse Cart"}
          >
            {collapsed ? <ArrowLineLeft size={28} /> : <ArrowLineRight size={28} />}
          </button>
        </div>
        <div
          className={`flex flex-col items-center w-full absolute top-16 left-0 right-0 ${collapsedIconTransitionClass} ${isHydrated && collapsed ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <ShoppingCart size={32} className="text-gray-700" />
          <span
            className={`text-xs font-bold mt-1 ${totalQty > 0 ? "text-green-600" : "text-gray-500"}`}
          >
            {totalQty}
          </span>
        </div>
        <div
          id="cart-column-content-wrapper"
          className={`w-full ${contentTransitionClass} ${collapsed ? "opacity-0 pointer-events-none h-0" : "opacity-100 h-auto"}`}
          style={{ transitionDelay: contentTransitionDelay }}
        >
          {isHydrated && !collapsed && <Cart hideTitle />}
        </div>
      </div>
    </div>
  );
}
"use client";
import { useState } from "react";

export default function HomeGrid({ children }: { children: React.ReactNode[] }) {
  const [collapsed, setCollapsed] = useState(false);

  // children[0] = products, children[1] = cart
  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
      style={{ minHeight: "60vh" }}
    >
      {/* Products column */}
      <div
        id="products-column"
        className={
          collapsed
            ? "col-span-1 lg:col-span-11 transition-all duration-300"
            : "col-span-1 lg:col-span-9 transition-all duration-300"
        }
      >
        {children[0]}
      </div>
      {/* Cart column */}
      <div
        id="cart-column"
        className={
          (collapsed
            ? "col-span-1 lg:col-span-1 transition-all duration-300 flex flex-col items-end"
            : "col-span-1 lg:col-span-3 transition-all duration-300") +
          " sticky top-8"
        }
      >
        <button
          className="mb-4 px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-xs text-gray-700"
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? "Show Cart" : "Collapse Cart"}
        </button>
        <div className={collapsed ? "w-12 overflow-hidden" : "w-full"}>
          {children[1]}
        </div>
      </div>
    </div>
  );
}
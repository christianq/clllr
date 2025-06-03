import { DM_Sans } from "next/font/google";
import { ArrowLineLeft, ArrowLineRight } from "@phosphor-icons/react";
import React from "react";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["200"] });

interface CartHeaderProps {
  title?: string;
  itemCount: number;
  collapsed: boolean;
  onCollapseToggle: () => void;
  className?: string;
}

export default function CartHeader({
  title = "Shopping Cart",
  itemCount,
  collapsed,
  onCollapseToggle,
  className = "",
}: CartHeaderProps) {
  return (
    <header
      className={`flex items-center w-full mb-4 ${collapsed ? "justify-center" : "justify-between"} ${className}`}
      role="banner"
    >
      {!collapsed && (
        <div>
          <h2
            id="cart-title"
            className={`text-2xl font-semibold ${dmSans.className} ml-2`}
          >
            {title}
            {itemCount > 0 && (
              <span
                id="cart-item-count"
                className="text-base font-normal ml-2"
                aria-label={`${itemCount} item${itemCount !== 1 ? "s" : ""} in cart`}
              >
                ({itemCount} item{itemCount !== 1 ? "s" : ""})
              </span>
            )}
          </h2>
        </div>
      )}
      <button
        className="w-[50px] h-[50px] flex-shrink-0 flex items-center justify-center text-gray-700 hover:text-gray-900"
        onClick={onCollapseToggle}
        aria-expanded={!collapsed}
        aria-controls="cart-content"
        aria-label={collapsed ? "Show Cart" : "Collapse Cart"}
      >
        {collapsed ? <ArrowLineLeft size={28} /> : <ArrowLineRight size={28} />}
      </button>
    </header>
  );
}
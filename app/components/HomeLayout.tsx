"use client";
import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { ArrowLineLeft, ArrowLineRight, ShoppingCart, GridFour, List, MagnifyingGlass } from "@phosphor-icons/react";
import { useCartStore } from "../store/cartStore";
import ProductGrid from "./ProductGrid";
import Cart from "./Cart";
import { DM_Sans, VT323 } from "next/font/google";
import { Button } from "@/components/ui/button";
import Filter, { Filters } from "./Filter";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["200"] });
const vt323 = VT323({ subsets: ["latin"], weight: ["400"] });

export default function HomeLayout({ products }: { products: any[] }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const { items } = useCartStore();
  const totalQty = items.reduce((acc, item) => acc + item.quantity, 0);
  const [gridView, setGridView] = useState(false);
  const [filters, setFilters] = useState<Filters>({});
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isLgUp, setIsLgUp] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [cartVisible, setCartVisible] = useState(false);
  const productsHeadingColRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const checkLg = () => setIsLgUp(window.matchMedia('(min-width: 1024px)').matches);
    checkLg();
    window.addEventListener('resize', checkLg);
    return () => window.removeEventListener('resize', checkLg);
  }, []);

  // Animate cart open/close
  useEffect(() => {
    if (showMobileCart) {
      setCartVisible(true);
    } else {
      // Delay unmount for animation
      const timeout = setTimeout(() => setCartVisible(false), 250);
      return () => clearTimeout(timeout);
    }
  }, [showMobileCart]);

  useLayoutEffect(() => {
    const setHeight = () => {
      if (productsHeadingColRef.current) {
        productsHeadingColRef.current.style.setProperty(
          '--products-heading-col-height',
          productsHeadingColRef.current.offsetHeight + 'px'
        );
      }
    };
    setHeight();
    window.addEventListener('resize', setHeight);
    return () => window.removeEventListener('resize', setHeight);
  }, []);

  const columnTransitionClass = isHydrated ? "transition-all duration-300 ease-in-out" : "";
  const collapsedIconTransitionClass = isHydrated ? "transition-opacity duration-150 ease-in-out" : "";
  const contentTransitionClass = isHydrated ? "transition-opacity duration-200 ease-in-out" : "";
  const contentTransitionDelay = isHydrated && !collapsed ? '150ms' : '0ms';

  // Copy groupByVariant from ProductGrid
  function groupByVariant(products) {
    const map = {};
    for (const product of products) {
      const variant = product.metadata?.variant_name || product.id;
      if (!map[variant]) map[variant] = [];
      map[variant].push(product);
    }
    return map;
  }

  // Compute filtered products for resultsCount
  const filteredProducts = React.useMemo(() => {
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

  // Compute resultsCount: gridView = count all, listView = count unique variants
  const resultsCount = React.useMemo(() => {
    if (gridView) return filteredProducts.length;
    const variants = groupByVariant(filteredProducts);
    return Object.keys(variants).length;
  }, [filteredProducts, gridView]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start relative">
      {/* Left column: heading only */}
      <div
        id="products-heading-col"
        ref={productsHeadingColRef}
        className={`w-full lg:w-fit pt-4 lg:pt-0 px-6 lg:px-0 flex flex-row lg:flex-col sticky top-0 lg:top-8 ${showMobileSearch ? 'overflow-visible' : 'overflow-y-auto'} justify-between lg:justify-start bg-white/70 backdrop-blur-sm`}
      >
        <div className="title-holder">
        <h1 className={`grid-options text-3xl font-bold mb-1 text-left ${dmSans.className}`}>Plot Unknown</h1>
        <div className="subtext-onclllr mb-4 text-xs text-gray-500">on CllLR</div>
        </div>
        <div className="gap-2 mb-4 hidden lg:flex">
          <Button
            variant={!gridView ? "default" : "outline"}
            onClick={() => setGridView(false)}
            className="p-2"
            title="List View"
          >
            <List size={20} />
          </Button>
          <Button
            variant={gridView ? "default" : "outline"}
            onClick={() => setGridView(true)}
            className="p-2"
            title="Grid View"
          >
            <GridFour size={20} />
          </Button>
        </div>
        <div className="flex gap-2 mb-4 lg:hidden">
          {/* Search icon button for lg and below */}
          <Button
            variant="outline"
            className="p-2"
            title="Search"
            onClick={() => setShowMobileSearch((v) => !v)}
          >
            <MagnifyingGlass size={20} />
          </Button>
          {/* Cart icon button for lg and below */}
          <Button
            variant="outline"
            className="p-2 relative"
            title="Cart"
            onClick={() => setShowMobileCart((v) => !v)}
          >
            <ShoppingCart size={20} className={totalQty > 0 ? 'text-green-600' : ''} />
            {totalQty > 0 && (
              <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center font-bold">
                {totalQty}
              </span>
            )}
          </Button>
        </div>
        {/* Sidebar filter: always hidden on screens below lg */}
        <div id="filter-wrapper" className="w-full mb-6 hidden lg:block col-span-2">
          <Filter filters={filters} onChange={setFilters} resultsCount={resultsCount} />
        </div>
        {/* Mobile search input, shown below heading col on lg and below */}
        {showMobileSearch && (
          <Filter filters={filters} onChange={setFilters} onlySearchMobile resultsCount={resultsCount} />
        )}
      </div>

      {/* Middle column: product grid only */}
      <div
        id="product-grid-wrapper"
        className="w-full flex-1"
      >
        <div className="bg-gray-50 p-6">
          <ProductGrid products={products} gridView={gridView} filters={filters} />
        </div>
      </div>
      {/* Cart column for lg and up */}
      <div
        id="cart-column"
        className={`sticky top-8 flex flex-col items-center lg:items-end ${columnTransitionClass} ${collapsed ? "max-w-[50px] w-[50px]" : "max-w-xs w-full lg:max-w-[25%] lg:w-[25%]"} hidden lg:flex`}
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
      {/* Mobile sticky cart for sm and xs only */}
      {cartVisible && window.innerWidth < 768 && (
        <>
          <div
            className="fixed inset-0 z-40 bg-white/40 backdrop-blur-sm"
            onClick={() => setShowMobileCart(false)}
          />
          <div
            className={`fixed bottom-0 left-0 right-0 z-50 bg-white shadow-lg p-4 flex flex-col max-w-md mx-auto rounded-t-xl transition-all duration-300 transform
              ${showMobileCart ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
            onClick={e => e.stopPropagation()}
          >
            <Cart hideTitle />
          </div>
        </>
      )}
    </div>
  );
}
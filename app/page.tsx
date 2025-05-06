import Image from "next/image";
import { Suspense } from "react";
import Cart from "./components/Cart";
import { headers } from "next/headers";
import HomeGrid from "./components/HomeGrid";
import ProductGrid from "./components/ProductGrid";

const FALLBACK_IMAGE = "/tote-product.png"; // Use a local image as fallback

async function getProducts() {
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;
  const res = await fetch(`${baseUrl}/api/stripe-products`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch products');
  const data = await res.json();
  return data.products;
}

export default async function Home() {
  const products = await getProducts();
  return (
    <div className="min-h-screen p-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <HomeGrid>
        {/* Parent grid: 25% for heading, 75% for product list */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start w-full">
          <div className="md:col-span-1 flex flex-col items-start justify-start">
            <h1 className="text-3xl font-bold mb-8 text-left">Our Products</h1>
          </div>
          <div className="md:col-span-3">
            <ProductGrid products={products} />
          </div>
        </div>
        {/* Cart in column 2 */}
        <div id="cart-column">
          <Cart />
        </div>
      </HomeGrid>
    </div>
  );
}

import { headers } from "next/headers";
import HomeLayout from "./components/HomeLayout";

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
    <div className="min-h-screen px-8 py-0 sm:p-20 sm:py-0 font-[family-name:var(--font-geist-sans)]">
      <HomeLayout products={products} />
    </div>
  );
}

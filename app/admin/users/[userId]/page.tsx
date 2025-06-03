"use client";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Id } from "../../../../convex/_generated/dataModel";

export default function UserDetailPage() {
  const { userId } = useParams() as { userId: string };
  const users = useQuery(api.users.listUsers, {}) ?? [];
  const user = users.find((u) => u._id === userId);
  const products = useQuery(api.products.listProductsByOwner, { ownerId: userId as Id<"users"> }) ?? [];

  if (!user) {
    return <div className="p-8">User not found.</div>;
  }

  return (
    <main className="min-h-screen bg-muted flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-3xl mx-auto">
        <header className="mb-10 flex flex-col items-center">
          <h1 className="text-3xl font-bold mb-2 tracking-tight">User: {user.name}</h1>
          <p className="text-muted-foreground text-lg mb-4">Email: {user.email}</p>
          <Link href="/admin/users" className="text-blue-600 hover:underline mb-4">Back to Users</Link>
          <div className="w-full border-b border-border/40 mb-6" />
        </header>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Products</h2>
          {products.length === 0 ? (
            <div className="text-gray-500">No products found for this user.</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left">Title</th>
                  <th className="text-left">Type</th>
                  <th className="text-left">Color</th>
                  <th className="text-left">Price</th>
                  <th className="text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>{product.title}</td>
                    <td>{product.type}</td>
                    <td>{product.color}</td>
                    <td>{product.price}</td>
                    <td>{product.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}
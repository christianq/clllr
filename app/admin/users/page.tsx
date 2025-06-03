"use client";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { useState } from "react";

export default function AdminUsersPage() {
  const users = useQuery(api.users.listUsers, {}) ?? [];
  const [roleFilter, setRoleFilter] = useState<string>("");

  const filteredUsers = roleFilter ? users.filter((u) => u.role === roleFilter) : users;

  return (
    <main className="min-h-screen bg-muted flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-3xl mx-auto">
        <header className="mb-10 flex flex-col items-center">
          <h1 className="text-4xl font-bold mb-2 tracking-tight">Admin: Users</h1>
          <p className="text-muted-foreground text-lg mb-4">View and manage all users</p>
          <div className="w-full border-b border-border/40 mb-6" />
        </header>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4 flex items-center gap-4">
            <label htmlFor="role-filter" className="text-sm font-medium">Filter by Role:</label>
            <select
              id="role-filter"
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="">All</option>
              <option value="store_owner">Store Owners</option>
              <option value="customer">Customers</option>
            </select>
          </div>
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="text-left">Name</th>
                <th className="text-left">Email</th>
                <th className="text-left">Role</th>
                <th className="text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <Link href={`/admin/users/${user._id}`} className="text-blue-600 hover:underline">View Products</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
"use client";
import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function AnalyticsDashboard() {
  const events = useQuery(api.analytics.listEvents) ?? [];
  return (
    <div className="p-8">
      <h1 className="text-4xl font-vt323 mb-8">Analytics Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
        {/* Example metric cards */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <span className="text-2xl font-bold">{events.length}</span>
          <span className="text-gray-500 mt-2">Tracked Events</span>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <span className="text-2xl font-bold">$0</span>
          <span className="text-gray-500 mt-2">Total Sales</span>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <span className="text-2xl font-bold">0</span>
          <span className="text-gray-500 mt-2">Orders</span>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <span className="text-2xl font-bold">-</span>
          <span className="text-gray-500 mt-2">Top Product</span>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Recent Events</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr>
                <th className="text-left">Type</th>
                <th className="text-left">Path</th>
                <th className="text-left">Element</th>
                <th className="text-left">Timestamp</th>
                <th className="text-left">User ID</th>
                <th className="text-left">Session ID</th>
                <th className="text-left">User Agent</th>
                <th className="text-left">Lang</th>
                <th className="text-left">Referrer</th>
                <th className="text-left">Screen</th>
                <th className="text-left">Timezone</th>
              </tr>
            </thead>
            <tbody>
              {events.slice(0, 20).map((e) => {
                const extra = e.extra || {};
                return (
                  <tr key={e._id}>
                    <td>{e.type}</td>
                    <td>{e.path}</td>
                    <td>{e.element}</td>
                    <td>{new Date(e.timestamp).toLocaleString()}</td>
                    <td className="font-mono text-[10px]">{e.userId || "-"}</td>
                    <td className="font-mono text-[10px]">{extra.sessionId || "-"}</td>
                    <td className="max-w-[200px] truncate" title={extra.userAgent}>{extra.userAgent || "-"}</td>
                    <td>{extra.language || "-"}</td>
                    <td className="max-w-[120px] truncate" title={extra.referrer}>{extra.referrer || "-"}</td>
                    <td>{extra.screenWidth && extra.screenHeight ? `${extra.screenWidth}x${extra.screenHeight}` : "-"}</td>
                    <td>{extra.timezone || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-12 text-gray-400 text-center">
        (Charts and detailed analytics coming soon)
      </div>
    </div>
  );
}
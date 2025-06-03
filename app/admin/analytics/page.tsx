"use client";
import React, { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";

export default function AnalyticsDashboard() {
  const events = useQuery(api.analytics.listEvents) ?? [];
  const [chartType, setChartType] = useState<"page_view" | "event">("page_view");
  const pageViews = events.filter(e => e.type === "page_view");
  const otherEvents = events.filter(e => e.type !== "page_view");

  // Group events by hour for charting
  const chartData = useMemo(() => {
    const filtered = chartType === "page_view" ? pageViews : otherEvents;
    const counts: Record<string, number> = {};
    filtered.forEach(e => {
      // Group by hour
      const d = new Date(e.timestamp);
      const hour = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()} ${d.getHours()}:00`;
      counts[hour] = (counts[hour] || 0) + 1;
    });
    // Sort by hour
    return Object.entries(counts)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([hour, count]) => ({ hour, count }));
  }, [chartType, pageViews, otherEvents]);

  return (
    <div className="p-8">
      <h1 className="text-4xl font-vt323 mb-8">Analytics Dashboard</h1>
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <button
            className={`px-3 py-1 rounded ${chartType === "page_view" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            onClick={() => setChartType("page_view")}
          >
            Page Views
          </button>
          <button
            className={`px-3 py-1 rounded ${chartType === "event" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            onClick={() => setChartType("event")}
          >
            Events
          </button>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#2563eb" name={chartType === "page_view" ? "Page Views" : "Events"} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <span className="text-2xl font-bold">{pageViews.length}</span>
          <span className="text-gray-500 mt-2">Page Views</span>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <span className="text-2xl font-bold">{otherEvents.length}</span>
          <span className="text-gray-500 mt-2">Events</span>
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
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Recent Page Views</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr>
                <th className="text-left">Path</th>
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
              {pageViews.slice(0, 20).map((e) => {
                const extra = e.extra || {};
                return (
                  <tr key={e._id}>
                    <td>{e.path}</td>
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
              {otherEvents.slice(0, 20).map((e) => {
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
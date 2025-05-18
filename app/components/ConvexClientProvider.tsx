"use client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";
import AnalyticsTracker from "./AnalyticsTracker";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convex}>
    <AnalyticsTracker />
    {children}
  </ConvexProvider>;
}
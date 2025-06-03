"use client";
import { useEffect } from "react";
import { useMutation } from "convex/react";
import { usePathname } from "next/navigation";
import { api } from "../../convex/_generated/api";
import { nanoid } from "nanoid";

function getOrCreateUserId() {
  if (typeof window === "undefined") return undefined;
  let userId = localStorage.getItem("analyticsUserId");
  if (!userId) {
    userId = nanoid();
    localStorage.setItem("analyticsUserId", userId);
  }
  return userId;
}

function getOrCreateSessionId() {
  if (typeof window === "undefined") return undefined;
  let sessionId = sessionStorage.getItem("analyticsSessionId");
  if (!sessionId) {
    sessionId = nanoid();
    sessionStorage.setItem("analyticsSessionId", sessionId);
  }
  return sessionId;
}

function getUserContext() {
  if (typeof window === "undefined") return {};
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    referrer: document.referrer,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    sessionId: getOrCreateSessionId(),
  };
}

export default function AnalyticsTracker() {
  const logEvent = useMutation(api.analytics.logEvent);
  const path = usePathname();
  const userId = typeof window !== "undefined" ? getOrCreateUserId() : undefined;
  const userContext = typeof window !== "undefined" ? getUserContext() : {};

  const safePath = path || "";

  // Log page view on mount or path change
  useEffect(() => {
    if (safePath.startsWith("/admin/analytics")) return;
    logEvent({
      type: "page_view",
      timestamp: Date.now(),
      userId,
      path: safePath,
      extra: userContext,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, userId]);

  // Log click events
  useEffect(() => {
    if (safePath.startsWith("/admin/analytics")) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const productElement = target.closest("[data-analytics-id^='product:']") as HTMLElement | null;
      let extra: Record<string, any> = {
        ...userContext,
        id: target.id,
        className: target.className,
        text: (target as HTMLElement).innerText?.slice(0, 100),
      };
      if (productElement) {
        extra.productId = productElement.getAttribute("data-product-id");
        extra.productTitle = productElement.getAttribute("data-product-title");
        extra.productPrice = productElement.getAttribute("data-product-price");
      }
      logEvent({
        type: "click",
        timestamp: Date.now(),
        userId,
        path: safePath,
        element: productElement?.getAttribute("data-analytics-id") || target.tagName || "",
        extra,
      });
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, userId]);

  return null;
}
"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { getSessionId } from "./session"
import { ANALYTICS_ENABLED } from "./config"

export function usePageView() {
  const pathname = usePathname()
  const startTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    if (!ANALYTICS_ENABLED) return

    // Respect Do Not Track
    if (typeof navigator !== "undefined" && (navigator as any).doNotTrack === "1") {
      return
    }

    const sessionId = getSessionId()
    startTimeRef.current = Date.now()

    // Track page view
    fetch("/api/analytics/page", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        sessionId,
        ts: Date.now(),
      }),
    }).catch((e) => console.error("[v0] Failed to track page view:", e))

    // Track time spent on page when leaving
    return () => {
      const timeSpent = Date.now() - startTimeRef.current
      if (timeSpent > 1000) {
        // Only track if spent more than 1 second
        fetch("/api/analytics/page", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: pathname,
            sessionId,
            timeSpent,
          }),
        }).catch(() => {}) // Ignore errors on unmount
      }
    }
  }, [pathname])
}

// Helper to track specific events
export function trackAnalyticsEvent(type: "search" | "click", data: { query?: string; target?: string }) {
  if (!ANALYTICS_ENABLED) return

  if (typeof navigator !== "undefined" && (navigator as any).doNotTrack === "1") {
    return
  }

  const pathname = typeof window !== "undefined" ? window.location.pathname : "/"
  const sessionId = getSessionId()

  fetch("/api/analytics/page", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      path: pathname,
      sessionId,
      type,
      ...data,
    }),
  }).catch((e) => console.error("[v0] Failed to track event:", e))
}

/**
 * Client-side Tracking
 *
 * Functions to track user interactions with events
 */

import type { TrackingEventType } from "./analytics-types"
import { ANALYTICS_ENABLED } from "./config"

export async function track(eventId: string, type: TrackingEventType): Promise<void> {
  // Skip if analytics disabled
  if (!ANALYTICS_ENABLED) {
    console.log("[v0] Analytics disabled, skipping track:", type, eventId)
    return
  }

  // Respect Do Not Track
  if (typeof navigator !== "undefined" && (navigator as any).doNotTrack === "1") {
    console.log("[v0] Do Not Track enabled, skipping analytics")
    return
  }

  const body = JSON.stringify({ eventId, type })

  try {
    // Use sendBeacon for better reliability (especially on page unload)
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" })
      const sent = navigator.sendBeacon("/api/metrics/track", blob)
      if (!sent) {
        // Fallback to fetch if sendBeacon fails
        await fetch("/api/metrics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        })
      }
    } else {
      // Fallback for browsers without sendBeacon
      await fetch("/api/metrics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      })
    }
  } catch (e) {
    console.error("[v0] Failed to track event:", e)
  }
}

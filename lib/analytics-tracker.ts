/**
 * Analytics Tracker - Client-side utilities for tracking user interactions
 * Integrates with Supabase analytics tables
 */

export async function trackListingView(listingId: string, listingType: string) {
  try {
    await fetch("/api/analytics/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, listingType }),
    })
    console.log("[v0] Tracked view:", listingId)
  } catch (error) {
    console.error("[v0] Failed to track view:", error)
  }
}

export async function trackListingFavorite(listingId: string, listingType: string, action: "add" | "remove") {
  try {
    await fetch("/api/analytics/favorite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, listingType, action }),
    })
    console.log("[v0] Tracked favorite:", listingId, action)
  } catch (error) {
    console.error("[v0] Failed to track favorite:", error)
  }
}

export async function trackClick(itemType: string, itemId: string) {
  try {
    await fetch("/api/analytics/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemType, itemId }),
    })
    console.log("[v0] Tracked click:", itemType, itemId)
  } catch (error) {
    console.error("[v0] Failed to track click:", error)
  }
}

export async function trackSearch(query: string, filters: Record<string, any>) {
  try {
    console.log("[v0] Search tracked:", { query, filters })
    // Could be extended to track searches in database
  } catch (error) {
    console.error("[v0] Failed to track search:", error)
  }
}

export async function trackSubmission(submissionType: string, submissionId: string) {
  try {
    console.log("[v0] Submission tracked:", { submissionType, submissionId })
    // Already tracked in submission API
  } catch (error) {
    console.error("[v0] Failed to track submission:", error)
  }
}

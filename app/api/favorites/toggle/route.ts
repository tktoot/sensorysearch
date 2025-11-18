import { type NextRequest, NextResponse } from "next/server"
import { getGuestProfile, saveGuestProfile } from "@/lib/guest-store"
import { logApiRequest, logApiSuccess, logApiError } from "@/lib/api-logger"

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const { listingId, listingType } = await request.json()

    if (!listingId) {
      return NextResponse.json({ error: "listingId is required" }, { status: 400 })
    }

    logApiRequest({
      route: "/api/favorites/toggle",
      method: "POST",
      body: { listingId, listingType },
    })

    // Get current guest profile
    const profile = getGuestProfile() || { favorites: [], createdAt: new Date().toISOString() }

    // Toggle favorite
    const isFavorite = profile.favorites.includes(listingId)
    const favorites = isFavorite
      ? profile.favorites.filter((id) => id !== listingId)
      : [...profile.favorites, listingId]

    // Remove duplicates
    const uniqueFavorites = Array.from(new Set(favorites))

    // Save updated profile
    saveGuestProfile({ ...profile, favorites: uniqueFavorites })

    // Track analytics
    try {
      await fetch("/api/analytics/favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          listingType: listingType || "unknown",
          action: isFavorite ? "remove" : "add",
        }),
      })
    } catch (analyticsError) {
      console.error("[v0] Failed to track favorite analytics:", analyticsError)
      // Don't fail the favorite toggle if analytics fails
    }

    const duration = Date.now() - startTime
    logApiSuccess({
      route: "/api/favorites/toggle",
      method: "POST",
      duration,
    })

    return NextResponse.json({
      ok: true,
      isFavorite: !isFavorite,
      favoritesCount: uniqueFavorites.length,
    })
  } catch (error) {
    console.error("[v0] Failed to toggle favorite:", error)
    logApiError({
      route: "/api/favorites/toggle",
      method: "POST",
      error,
    })
    return NextResponse.json({ error: "Failed to toggle favorite" }, { status: 500 })
  }
}
